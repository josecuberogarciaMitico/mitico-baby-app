import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { pedirIA } from "./ia.ts";

// ---------------------------------------------------------------------------
// mitico-evaluacion-familia (10/11/2026)
// Evaluación del Intensivo para la familia. Solo coordinación.
//
//  action "redactar": la IA (misma cadena gratuita que Paco: Cloudflare →
//    Gemini) redacta el texto del informe y el mensaje de WhatsApp a partir
//    de los datos estructurados del niño. Se guardan en intensivo_alumnos.
//    Nunca recibe observaciones ni comentarios internos de los entrenadores.
//  action "subir_pdf": guarda el PDF en el almacén privado
//    «evaluaciones-familia» y devuelve un enlace firmado (caduca en 180 días)
//    para mandarlo por WhatsApp.
// No envía nada a nadie.
// ---------------------------------------------------------------------------

const U = Deno.env.get("SUPABASE_URL") || "";
const K = Deno.env.get("SUPABASE_ANON_KEY") || "";
const S = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const BUCKET = "evaluaciones-familia";
const CADUCA_S = 180 * 24 * 3600;
const ROLES = new Set(["coordinador_jefe", "sub_coordinador", "administracion", "coordinador"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};
const J = (b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

async function admin(path: string, init: RequestInit = {}) {
  const r = await fetch(U + path, {
    ...init,
    headers: { apikey: S, Authorization: `Bearer ${S}`, Accept: "application/json", ...(init.headers || {}) },
  });
  const t = await r.text();
  let d: any = null;
  try { d = t ? JSON.parse(t) : null; } catch { d = t; }
  if (!r.ok) throw new Error(`DB ${r.status}: ${String(t).slice(0, 160)}`);
  return d;
}

async function autorizado(req: Request): Promise<boolean> {
  const a = req.headers.get("Authorization") || "";
  if (!a.startsWith("Bearer ")) return false;
  const ur = await fetch(U + "/auth/v1/user", { headers: { apikey: K, Authorization: a } });
  if (!ur.ok) return false;
  const u = await ur.json();
  if (!u?.id) return false;
  const rows = await admin(`/rest/v1/usuarios_app?select=rol&auth_user_id=eq.${encodeURIComponent(String(u.id))}&activo=eq.true&limit=1`);
  return Array.isArray(rows) && ROLES.has(String(rows[0]?.rol || ""));
}

const SYSTEM = `Eres Jose Cubero, coordinador de Mítico (escuela y club de esquí para niños en Madrid SnowZone). Escribes la evaluación final de un curso Intensivo para la familia de un alumno.

TONO: español de España, cercano y profesional, como una escuela de esquí de nivel. Técnico pero fácil de entender: nombra la habilidad y explica en palabras sencillas qué significa en la nieve. Hablas a la familia de "vosotros". Al niño, por su nombre de pila. Positivo y honesto: lo conseguido primero; lo que falta, como el siguiente reto, nunca como un fallo.

REGLAS (obligatorias):
1. Usa SOLO los DATOS que te dan. No inventes habilidades, anécdotas, días, entrenadores, precios ni fechas.
2. No pongas saludo ni despedida ni firma en "informe" (la app ya los pone). No menciones otros cursos, ni a Raquel, ni enlaces: la app los añade al final.
3. "informe": 2 o 3 párrafos cortos (70-130 palabras en total), sin emojis, sin listas, sin títulos. Cuenta cómo ha evolucionado (nivel de inicio → final si cambia), qué ha mejorado de verdad y cuál es el siguiente reto.
4. "whatsapp": mensaje corto para WhatsApp (3-5 líneas), empieza con "Hola" y el nombre del intensivo, resume lo principal en lenguaje cercano. Como mucho 2 emojis. Sin despedida (la app añade el cierre).
5. Devuelve SOLO un objeto JSON: {"informe": "...", "whatsapp": "..."}`;

function limpiarDatos(x: any) {
  const t = (v: unknown, n = 200) => String(v ?? "").slice(0, n);
  const lista = (v: unknown, n = 12) => (Array.isArray(v) ? v.slice(0, n).map((y) => t(y, 120)) : []);
  return {
    nombre: t(x?.nombre, 60),
    intensivo: t(x?.intensivo, 120),
    fechas: t(x?.fechas, 60),
    asistencia: t(x?.asistencia, 40),
    nivel_inicio: t(x?.nivelInicio, 20),
    nivel_final: t(x?.nivelFinal, 20),
    habilidades: Array.isArray(x?.habilidades)
      ? x.habilidades.slice(0, 16).map((h: any) => ({ habilidad: t(h?.nombre, 80), como_va: t(h?.estado, 40), que_es: t(h?.ayuda, 200) }))
      : [],
    actitud: t(x?.actitud, 80),
    autonomia: t(x?.autonomia, 80),
    proximos_objetivos: lista(x?.objetivos, 6),
  };
}

async function redactar(b: any) {
  const id = String(b?.intensivo_alumno_id || "");
  if (!UUID.test(id)) return J({ ok: false, error: "Falta el alumno del intensivo." }, 400);
  const datos = limpiarDatos(b?.informe);
  if (!datos.nombre) return J({ ok: false, error: "Faltan los datos del alumno." }, 400);

  const r = await pedirIA({
    system: SYSTEM,
    user: `DATOS:\n${JSON.stringify(datos, null, 2)}`,
    json: true,
    nivel: "pensar",
    temperatura: 0.5,
    maxTokens: 900,
    totalMs: 45000,
  });
  const out = JSON.parse(r.texto);
  const informe = String(out?.informe || "").trim().slice(0, 2500);
  const whatsapp = String(out?.whatsapp || "").trim().slice(0, 1200);
  if (!informe || !whatsapp) throw new Error("respuesta incompleta");

  await admin(`/rest/v1/intensivo_alumnos?id=eq.${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
    body: JSON.stringify({ texto_familia: informe, mensaje_familia: whatsapp, texto_familia_at: new Date().toISOString() }),
  });
  return J({ ok: true, texto_familia: informe, mensaje_familia: whatsapp, modelo: r.modelo });
}

async function subirPdf(b: any) {
  const id = String(b?.intensivo_alumno_id || "");
  if (!UUID.test(id)) return J({ ok: false, error: "Falta el alumno del intensivo." }, 400);
  const base64 = String(b?.pdf_base64 || "");
  if (!base64 || base64.length > 6_000_000) return J({ ok: false, error: "PDF no válido." }, 400);
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  if (String.fromCharCode(...bytes.slice(0, 5)) !== "%PDF-") return J({ ok: false, error: "PDF no válido." }, 400);

  const nombre = String(b?.nombre || "Evaluacion.pdf").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9._-]+/g, "_").slice(0, 120);
  // Carpeta con un trozo aleatorio: la ruta no se puede adivinar.
  const ruta = `intensivo/${id}/${crypto.randomUUID().slice(0, 8)}-${nombre.endsWith(".pdf") ? nombre : `${nombre}.pdf`}`;
  await admin(`/storage/v1/object/${BUCKET}/${ruta}`, {
    method: "POST",
    headers: { "Content-Type": "application/pdf", "x-upsert": "true" },
    body: bytes,
  });
  const firmado = await admin(`/storage/v1/object/sign/${BUCKET}/${ruta}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ expiresIn: CADUCA_S }),
  });
  const rel = String(firmado?.signedURL || firmado?.signedUrl || "");
  if (!rel) throw new Error("sin enlace firmado");
  return J({ ok: true, url: `${U}/storage/v1${rel.startsWith("/") ? rel : `/${rel}`}`, caduca_dias: 180 });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return J({ ok: false, error: "Método no permitido." }, 405);
  if (!U || !K || !S) return J({ ok: false, error: "Servicio no disponible." }, 503);
  try {
    if (!(await autorizado(req))) return J({ ok: false, error: "Solo coordinación." }, 403);
    const b = await req.json().catch(() => ({}));
    if (b?.action === "redactar") return await redactar(b);
    if (b?.action === "subir_pdf") return await subirPdf(b);
    return J({ ok: false, error: "Acción no reconocida." }, 400);
  } catch (e) {
    console.error("mitico-evaluacion-familia", e);
    return J({ ok: false, error: "No se ha podido completar ahora mismo. Inténtalo de nuevo en un momento." }, 500);
  }
});
