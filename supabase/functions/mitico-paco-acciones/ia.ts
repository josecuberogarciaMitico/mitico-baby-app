// ---------------------------------------------------------------------------
// ia.ts · cerebro de Paco (23/10/2026)
//
// Una sola puerta para pedir texto a una IA. Prueba proveedores GRATIS en
// orden y, si uno falla, tarda demasiado o devuelve basura, pasa al siguiente:
//
//   rapido (entender qué pide Jose, devolver JSON corto):
//     1. Cloudflare · Llama 3.3 70B fast   (≈0,2 s)
//     2. Cloudflare · gpt-oss-20b
//     3. Gemini 3.5 Flash-Lite (sin «pensar»)
//
//   pensar (redactar respuestas):
//     1. Cloudflare · gpt-oss-120b
//     2. Cloudflare · Llama 3.3 70B fast
//     3. Gemini 3.5 Flash (pensamiento mínimo)
//
// Cloudflare Workers AI: plan gratis (10.000 neuronas/día, se renueva a las
// 00:00 UTC). Si se agota devuelve error y se pasa a Gemini; nunca cobra.
// Ningún proveedor de la lista entrena con los datos.
//
// Copia canónica en supabase/functions/_shared/ia.ts. Cada función de Paco
// lleva una copia idéntica (./ia.ts) porque se despliegan por separado.
// ---------------------------------------------------------------------------

const CF_TOKEN = Deno.env.get("CLOUDFLARE_AI_TOKEN") || "";
const CF_ACCOUNT = Deno.env.get("CLOUDFLARE_ACCOUNT_ID") || "";
const GEMINI_KEY = Deno.env.get("GEMINI_API_KEY") || "";

export type NivelIA = "rapido" | "pensar";

export type PeticionIA = {
  system: string;
  user: string;
  /** true: la respuesta debe ser un objeto JSON; se devuelve ya limpio. */
  json?: boolean;
  nivel?: NivelIA;
  temperatura?: number;
  /** Tokens de la respuesta visible (sin contar el razonamiento interno). */
  maxTokens?: number;
  /** Límite por intento. */
  timeoutMs?: number;
  /** Límite total para toda la cadena. */
  totalMs?: number;
};

export type RespuestaIA = { texto: string; proveedor: string; modelo: string; ms: number };

type Paso = { proveedor: "cloudflare" | "gemini"; modelo: string; razona: boolean; timeoutMs: number };

const CADENAS: Record<NivelIA, Paso[]> = {
  rapido: [
    { proveedor: "cloudflare", modelo: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", razona: false, timeoutMs: 8000 },
    { proveedor: "cloudflare", modelo: "@cf/openai/gpt-oss-20b", razona: true, timeoutMs: 10000 },
    { proveedor: "gemini", modelo: "gemini-3.5-flash-lite", razona: false, timeoutMs: 10000 },
  ],
  pensar: [
    { proveedor: "cloudflare", modelo: "@cf/openai/gpt-oss-120b", razona: true, timeoutMs: 20000 },
    { proveedor: "cloudflare", modelo: "@cf/meta/llama-3.3-70b-instruct-fp8-fast", razona: false, timeoutMs: 15000 },
    { proveedor: "gemini", modelo: "gemini-3.5-flash", razona: false, timeoutMs: 20000 },
  ],
};

/** Extrae el objeto JSON de una respuesta (quita ```json, texto alrededor...). */
export function limpiarJson(t: string): string | null {
  const s = String(t || "").trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
  const intentos = [s];
  const a = s.indexOf("{"), b = s.lastIndexOf("}");
  if (a >= 0 && b > a) intentos.push(s.slice(a, b + 1));
  for (const x of intentos) {
    try {
      const v = JSON.parse(x);
      if (v && typeof v === "object" && !Array.isArray(v)) return JSON.stringify(v);
    } catch { /* siguiente */ }
  }
  return null;
}

async function cloudflare(p: Paso, req: PeticionIA, signal: AbortSignal): Promise<string> {
  if (!CF_TOKEN || !CF_ACCOUNT) throw new Error("sin clave");
  const visibles = req.maxTokens ?? (req.json ? 1024 : 1500);
  const r = await fetch(`https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT}/ai/v1/chat/completions`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${CF_TOKEN}` },
    body: JSON.stringify({
      model: p.modelo,
      messages: [
        { role: "system", content: req.system },
        { role: "user", content: req.user },
      ],
      // Los modelos que razonan gastan tokens antes de contestar: se les deja margen.
      max_tokens: p.razona ? visibles + 2000 : visibles,
      temperature: req.temperatura ?? (req.json ? 0 : 0.4),
    }),
    signal,
  });
  const tx = await r.text();
  if (!r.ok) throw new Error(`HTTP ${r.status} ${tx.slice(0, 120)}`);
  let d: any = null;
  try { d = JSON.parse(tx); } catch { throw new Error("respuesta no JSON"); }
  return String(d?.choices?.[0]?.message?.content ?? "").trim();
}

async function gemini(p: Paso, req: PeticionIA, signal: AbortSignal): Promise<string> {
  if (!GEMINI_KEY) throw new Error("sin clave");
  const llamar = async (minimo: boolean) => {
    const generationConfig: Record<string, unknown> = {
      temperature: req.temperatura ?? (req.json ? 0 : 0.4),
      maxOutputTokens: req.maxTokens ?? (req.json ? 1024 : 1500),
    };
    // Sin «pensar» largo: era lo que hacía que Gemini no contestara a tiempo.
    if (minimo) generationConfig.thinkingConfig = { thinkingLevel: "minimal" };
    if (req.json) generationConfig.responseMimeType = "application/json";
    return await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${p.modelo}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": GEMINI_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.system }] },
        contents: [{ role: "user", parts: [{ text: req.user }] }],
        generationConfig,
      }),
      signal,
    });
  };
  let r = await llamar(true);
  if (r.status === 400) r = await llamar(false); // modelo que no admite el ajuste
  const d = await r.json().catch(() => null);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  return (d?.candidates?.[0]?.content?.parts || [])
    .filter((x: any) => !x?.thought)
    .map((x: any) => x?.text || "")
    .join("")
    .trim();
}

export async function pedirIA(req: PeticionIA): Promise<RespuestaIA> {
  const nivel: NivelIA = req.nivel || "rapido";
  const inicio = Date.now();
  const total = req.totalMs ?? (nivel === "rapido" ? 20000 : 40000);
  const fallos: string[] = [];

  for (const paso of CADENAS[nivel]) {
    const queda = total - (Date.now() - inicio);
    if (queda < 1500) break;
    const c = new AbortController();
    const limite = setTimeout(() => c.abort(), Math.min(req.timeoutMs ?? paso.timeoutMs, queda));
    const t0 = Date.now();
    try {
      const bruto = paso.proveedor === "cloudflare" ? await cloudflare(paso, req, c.signal) : await gemini(paso, req, c.signal);
      const texto = req.json ? limpiarJson(bruto) : bruto;
      if (!texto) throw new Error(req.json ? "JSON no válido" : "vacío");
      const ms = Date.now() - t0;
      console.log(`ia ok ${nivel} ${paso.modelo} ${ms}ms${fallos.length ? ` (antes: ${fallos.join(" | ")})` : ""}`);
      return { texto, proveedor: paso.proveedor, modelo: paso.modelo, ms };
    } catch (e) {
      const motivo = c.signal.aborted ? "tiempo agotado" : String((e as Error)?.message || e).slice(0, 140);
      fallos.push(`${paso.modelo}: ${motivo}`);
    } finally {
      clearTimeout(limite);
    }
  }
  console.error(`ia fallo ${nivel}: ${fallos.join(" | ")}`);
  throw new Error(`ia: ${fallos.join(" | ") || "sin tiempo"}`);
}
