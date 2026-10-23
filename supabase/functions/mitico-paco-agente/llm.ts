// ---------------------------------------------------------------------------
// llm.ts · conversación con herramientas (formato OpenAI) para el agente Paco
//
// Cadena de proveedores GRATIS; en cada vuelta se usa el primero que conteste
// bien. Si uno se agota (429), falla o tarda, se pasa al siguiente y no se
// vuelve a intentar en esa misma petición.
//   1. Groq · openai/gpt-oss-120b
//   2. Groq · llama-3.3-70b-versatile
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
};

export const PROVEEDORES: Proveedor[] = [
  {
    nombre: "groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    clave: () => GROQ,
    modelo: "openai/gpt-oss-120b",
    extra: { reasoning_effort: "low" },
    timeoutMs: 25000,
  },
  {
    nombre: "groq",
    url: "https://api.groq.com/openai/v1/chat/completions",
    clave: () => GROQ,
    modelo: "llama-3.3-70b-versatile",
    timeoutMs: 20000,
  },
  {
    nombre: "cloudflare",
    url: `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/v1/chat/completions`,
    clave: () => (CF_ACCOUNT ? CF_TOKEN : ""),
    modelo: "@cf/meta/llama-3.3-70b-instruct-fp8-fast",
    timeoutMs: 20000,
  },
  {
    nombre: "gemini",
    url: "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
    clave: () => GEMINI,
    modelo: "gemini-3.5-flash",
    timeoutMs: 25000,
  },
];

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
          messages: mensajes,
          tools: herramientas.length ? herramientas : undefined,
          tool_choice: herramientas.length ? "auto" : undefined,
          temperature: 0.2,
          max_tokens: 2500,
          ...(p.extra || {}),
        }),
        signal: c.signal,
      });
      const tx = await r.text();
      if (!r.ok) throw new Error(`HTTP ${r.status} ${tx.slice(0, 140)}`);
      const d = JSON.parse(tx);
      const m = d?.choices?.[0]?.message;
      if (!m) throw new Error("sin mensaje");
      const tool_calls = Array.isArray(m.tool_calls) && m.tool_calls.length
        ? m.tool_calls.map((t: any, n: number) => ({
            id: String(t.id || `llamada_${Date.now()}_${n}`),
            type: "function" as const,
            function: { name: String(t.function?.name || ""), arguments: typeof t.function?.arguments === "string" ? t.function.arguments : JSON.stringify(t.function?.arguments || {}) },
          }))
        : undefined;
      const content = typeof m.content === "string" ? m.content : null;
      if (!tool_calls && !(content || "").trim()) throw new Error("respuesta vacía");
      return { mensaje: { content, tool_calls }, modelo: `${p.nombre}:${p.modelo}`, ms: Date.now() - t0, indice: i, fallos };
    } catch (e) {
      fallos.push(`${p.modelo}: ${c.signal.aborted ? "tiempo agotado" : String((e as Error)?.message || e).slice(0, 160)}`);
    } finally {
      clearTimeout(reloj);
    }
  }
  throw new Error(`ningún proveedor contestó: ${fallos.join(" | ")}`);
}
