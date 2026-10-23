// ---------------------------------------------------------------------------
// llm.ts · conversación con herramientas (formato OpenAI) para el agente Paco
//
// Cadena de proveedores GRATIS; en cada vuelta se usa el primero que conteste
// bien. Si uno se agota (429), falla o tarda, se pasa al siguiente y no se
// vuelve a intentar en esa misma petición.
//   1. Groq · openai/gpt-oss-120b
//   2. Groq · openai/gpt-oss-20b (límite aparte del 120b)
//   3. Cloudflare · Llama 3.3 70B fast
//   4. Gemini · gemini-3.5-flash (endpoint compatible OpenAI)
// Ningún proveedor de la lista entrena con los datos.
// ---------------------------------------------------------------------------

const GROQ = Deno.env.get("GROQ_API_KEY") || "";
const CF_TOKEN = Deno.env.get("CLOUDFLARE_AI_TOKEN") || "";
const CF_ACCOUNT = Deno.env.get("CLOUDFLARE_ACCOUNT_ID") || "";
const GEMINI = Deno.env.get("GEMINI_API_KEY") || "";

export type Mensaje =
  | { role: "system" | "user"; content: string }
  | { role: "assistant"; content: string | null; tool_calls?: LlamadaHerramienta[] }
  | { role: "tool"; tool_call_id: string; content: string };

export type LlamadaHerramienta = {
  id: string;
  type: "function";
  function: { name: string; arguments: string };
  // Gemini 3 devuelve aquí su «firma de pensamiento» y exige recibirla de vuelta.
  extra_content?: Record<string, unknown>;
};

export type DefHerramienta = {
  type: "function";
  function: { name: string; description: string; parameters: Record<string, unknown> };
};

type Proveedor = {
  nombre: string;
  url: string;
  clave: () => string;
  modelo: string;
  extra?: Record<string, unknown>;
  timeoutMs: number;
  formato: "openai" | "gemini" | "plano";
};

export const PROVEEDORES: Proveedor[] = [
  {
    nombre: "groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    clave: () => GROQ,
    modelo: "openai/gpt-oss-120b",
    extra: { reasoning_effort: "low" },
    timeoutMs: 25000,
    formato: "openai",
  },
  {
    nombre: "groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    clave: () => GROQ,
    modelo: "openai/gpt-oss-20b",
    extra: { reasoning_effort: "low" },
    timeoutMs: 20000,
    formato: "openai",
  },
  {
    nombre: "cloudflare",
    url: `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/v1/chat/completions`,
    clave: () => (CF_ACCOUNT ? CF_TOKEN : ""),
    modelo: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    timeoutMs: 20000,
    formato: "plano",
  },
  {
    nombre: "gemini",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    clave: () => GEMINI,
    modelo: "gemini-3.5-flash",
    timeoutMs: 25000,
    formato: "gemini",
  },
];

// Firma comodín que Gemini acepta para llamadas que no generó él (p. ej. las
// hizo Groq en una vuelta anterior de la misma conversación).
const FIRMA_COMODIN = "skip_thought_signature_validator";

/** Adapta la conversación a lo que acepta cada proveedor. */
export function adaptarMensajes(mensajes: Mensaje[], formato: Proveedor["formato"]): Record<string, unknown>[] {
  if (formato === "plano") {
    // Cloudflare no admite mensajes de herramienta ni contenido vacío: las
    // llamadas y sus resultados se pasan como texto normal.
    return mensajes.map((m) => {
      if (m.role === "tool") return { role: "user", content: `Resultado de la consulta (${m.tool_call_id}):\n${m.content}` };
      if (m.role === "assistant") {
        const llamadas = (m.tool_calls || []).map((t) => `${t.function.name}(${t.function.arguments})`).join("; ");
        const texto = [m.content || "", llamadas ? `Consulto: ${llamadas}` : ""].filter(Boolean).join("\n");
        return { role: "assistant", content: texto || "..." };
      }
      return { role: m.role, content: m.content };
    });
  }
  return mensajes.map((m) => {
    if (m.role !== "assistant" || !m.tool_calls?.length) return m;
    const tool_calls = m.tool_calls.map((t) => {
      const base = { id: t.id, type: t.type, function: t.function };
      if (formato !== "gemini") return base;
      const google = (t.extra_content?.google || {}) as Record<string, unknown>;
      return { ...base, extra_content: { google: { ...google, thought_signature: google.thought_signature || FIRMA_COMODIN } } };
    });
    return { role: "assistant", content: m.content ?? "", tool_calls };
  });
}

/** Segundos que pide esperar un 429 («try again in 2.3s»), o null. */
export function esperaPedida(texto: string): number | null {
  const m = /try again in (?:(\d+)m)?([\d.]+)(ms|s)/i.exec(texto);
  if (!m) return null;
  const n = Number(m[2]) / (m[3] === "ms" ? 1000 : 1) + (m[1] ? Number(m[1]) * 60 : 0);
  return Number.isFinite(n) ? n : null;
}

const dormir = (ms: number) => new Promise((r) => setTimeout(r, ms));

export type Respuesta = { mensaje: { content: string | null; tool_calls?: LlamadaHerramienta[] }; modelo: string; ms: number };

/**
 * Una vuelta de conversación. `desde` es el índice del primer proveedor a
 * probar (para no volver a los que ya fallaron en esta petición). Devuelve
 * también el índice que funcionó.
 */
export async function completar(
  mensajes: Mensaje[],
  herramientas: DefHerramienta[],
  desde = 0,
  limiteMs = 30000,
  proveedores: Proveedor[] = PROVEEDORES,
): Promise<Respuesta & { indice: number; fallos: string[] }> {
  const fallos: string[] = [];
  const inicio = Date.now();
  for (let i = desde; i < proveedores.length; i++) {
    const p = proveedores[i];
    const clave = p.clave();
    if (!clave) { fallos.push(`${p.modelo}: sin clave`); continue; }
    for (let intento = 0; intento < 2; intento++) {
      const queda = limiteMs - (Date.now() - inicio);
      if (queda < 2000) break;
      const c = new AbortController();
      const reloj = setTimeout(() => c.abort(), Math.min(p.timeoutMs, queda));
      const t0 = Date.now();
      try {
        const r = await fetch(p.url, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${clave}` },
          body: JSON.stringify({
            model: p.modelo,
            messages: adaptarMensajes(mensajes, p.formato),
            tools: herramientas.length ? herramientas : undefined,
            tool_choice: herramientas.length ? "auto" : undefined,
            temperature: 0.2,
            max_tokens: 2500,
            ...(p.extra || {}),
          }),
          signal: c.signal,
        });
        const tx = await r.text();
        if (r.status === 429 && intento === 0) {
          // Límite por minuto: si pide esperar poco, se espera y se reintenta una vez.
          const s = esperaPedida(tx);
          if (s !== null && s <= 8 && limiteMs - (Date.now() - inicio) > s * 1000 + 6000) {
            clearTimeout(reloj);
            await dormir(Math.ceil(s * 1000) + 200);
            continue;
          }
        }
        if (!r.ok) throw new Error(`HTTP ${r.status} ${tx.slice(0, 140)}`);
        const d = JSON.parse(tx);
        const m = d?.choices?.[0]?.message;
        if (!m) throw new Error("sin mensaje");
        const tool_calls = Array.isArray(m.tool_calls) && m.tool_calls.length
          ? m.tool_calls.map((t: any, n: number) => ({
              id: String(t.id || `llamada_${Date.now()}_${n}`),
              type: "function" as const,
              function: { name: String(t.function?.name || ""), arguments: typeof t.function?.arguments === "string" ? t.function.arguments : JSON.stringify(t.function?.arguments || {}) },
              ...(t.extra_content && typeof t.extra_content === "object" ? { extra_content: t.extra_content } : {}),
            }))
          : undefined;
        const content = typeof m.content === "string" ? m.content : null;
        if (!tool_calls && !(content || "").trim()) throw new Error("respuesta vacía");
        return { mensaje: { content, tool_calls }, modelo: `${p.nombre}:${p.modelo}`, ms: Date.now() - t0, indice: i, fallos };
      } catch (e) {
        fallos.push(`${p.modelo}: ${c.signal.aborted ? "tiempo agotado" : String((e as Error)?.message || e).slice(0, 160)}`);
        break;
      } finally {
        clearTimeout(reloj);
      }
    }
  }
  throw new Error(`ningún proveedor contestó: ${fallos.join(" | ")}`);
}
