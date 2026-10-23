import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { completar, type Mensaje } from "./llm.ts";
import { Contexto, HERRAMIENTAS, ejecutarHerramienta, hoyMadrid, sumarDias, diaSemana } from "./herramientas.ts";

// ---------------------------------------------------------------------------
// mitico-paco-agente · Paco con «ojos» (23/10/2026)
//
// Paco decide qué datos necesita, los consulta con herramientas de SOLO
// LECTURA (herramientas.ts) y contesta. No escribe nada en la base de datos.
// Las acciones que cambian datos siguen yendo por sus caminos con botón de
// Confirmar (mover niño, disponibilidad, altas, secretaría).
// Solo coordinador_jefe.
// ---------------------------------------------------------------------------

const U = Deno.env.get("SUPABASE_URL") || "";
const K = Deno.env.get("SUPABASE_ANON_KEY") || "";
const S = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const MAX_VUELTAS = 6;
const LIMITE_TOTAL_MS = 55000;
const MAX_RESULTADO = 7000;

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

function J(x: unknown, s = 200) {
  return new Response(JSON.stringify(x), { status: s, headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" } });
}

async function dbGet(tabla: string, params: Record<string, string>) {
  const url = new URL(`${U}/rest/v1/${tabla}`);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);
  const r = await fetch(url, { headers: { apikey: S, Authorization: `Bearer ${S}`, Accept: "application/json" } });
  const t = await r.text();
  if (!r.ok) throw new Error(`lectura ${tabla}: ${r.status} ${t.slice(0, 160)}`);
  return t ? JSON.parse(t) : [];
}

async function autorizar(req: Request) {
  const a = req.headers.get("Authorization") || "";
  if (!a.startsWith("Bearer ")) return false;
  const ur = await fetch(`${U}/auth/v1/user`, { headers: { apikey: K, Authorization: a } });
  if (!ur.ok) return false;
  const u = await ur.json();
  if (!u?.id) return false;
  const filas = await dbGet("usuarios_app", { select: "rol", auth_user_id: `eq.${u.id}`, activo: "eq.true", limit: "1" });
  return filas?.[0]?.rol === "coordinador_jefe";
}

function calendario(hoy: string) {
  const dias: string[] = [];
  for (let i = -7; i <= 14; i++) {
    const f = sumarDias(hoy, i);
    dias.push(`${diaSemana(f)} ${f}${i === 0 ? " (HOY)" : ""}`);
  }
  return dias.join("; ");
}

function sistema() {
  const hoy = hoyMadrid();
  return `Eres Paco, un miembro más del equipo de coordinación de Mítico (escuela y club de esquí infantil en Snowzone, Madrid; modalidades Baby, Ocio e Intensivos). Trabajas para Jose Cubero, el coordinador jefe; le hablas de «señor Cubero» con naturalidad (no en cada frase), en español de España, directo y con un punto de humor seco cuando encaja.

CÓMO TRABAJAS
- Antes de contestar sobre niños, grupos, turnos, reportes, entrenadores o material, CONSULTA los datos con tus herramientas. Nunca inventes nombres, fechas, horas, niveles ni números.
- Si te nombran a un niño, primero buscar_alumno; si hay varios posibles, pregunta cuál (enseña nombre, edad y nivel) en vez de suponer.
- Puedes encadenar varias herramientas para responder algo compuesto. Interpreta las fechas con el calendario de abajo («el sábado» = el próximo sábado; «el finde» = sábado y domingo próximos).
- Para proponer dónde colocar a un niño (alta tardía o niño sin grupo) usa opciones_para_nino y explica en una línea por qué recomiendas la primera opción. Si no hay grupo que encaje, dilo y sugiere el turno con hueco o crear grupo.
- Respuestas cortas y ordenadas: primero lo importante, luego el detalle en viñetas. Nada de JSON ni ids internos en la respuesta.

LÍMITES (por ahora)
- Tú solo LEES datos. No digas que has cambiado, movido, publicado o enviado nada.
- Si te piden un cambio (meter a un niño en un grupo, mover, publicar, mandar algo), prepara toda la información útil (por ejemplo, el grupo recomendado) y di claramente que ese paso todavía tiene que hacerlo él desde la app o pidiéndomelo con la frase concreta (por ejemplo «pasa a Lucía al jueves a las 17:00» para mover a un niño de Baby).
- Si algo no está en los datos, dilo tal cual.

FECHA: hoy es ${diaSemana(hoy)} ${hoy} (Madrid). Calendario: ${calendario(hoy)}.`;
}

type Turno = { rol: "user" | "assistant"; texto: string };

function historialLimpio(x: unknown): Turno[] {
  if (!Array.isArray(x)) return [];
  return x
    .filter((t: any) => t && (t.rol === "user" || t.rol === "assistant") && typeof t.texto === "string" && t.texto.trim())
    .slice(-8)
    .map((t: any) => ({ rol: t.rol, texto: String(t.texto).slice(0, 1500) }));
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (!U || !K || !S) return J({ ok: false, error: "Servicio no disponible." }, 503);
  try {
    if (!(await autorizar(req))) return J({ ok: false, error: "Acceso restringido a coordinador_jefe." }, 403);
    if (req.method === "GET") return J({ ok: true, handled: true, service: "mitico-paco-agente" });
    if (req.method !== "POST") return J({ ok: false, error: "Método no permitido." }, 405);

    const b = await req.json().catch(() => ({}));
    const msg = typeof b.message === "string" ? b.message.trim().slice(0, 3000) : "";
    if (!msg) return J({ ok: false, error: "Escribe un mensaje." }, 400);

    const inicio = Date.now();
    const ctx = new Contexto(dbGet);
    const mensajes: Mensaje[] = [
      { role: "system", content: sistema() },
      ...historialLimpio(b.historial).map((t) => ({ role: t.rol, content: t.texto }) as Mensaje),
      { role: "user", content: msg },
    ];
    const defs = HERRAMIENTAS.map((h) => h.def);
    const usadas: string[] = [];
    let indice = 0;
    let modelo = "";
    const avisos: string[] = [];

    for (let vuelta = 0; vuelta <= MAX_VUELTAS; vuelta++) {
      const queda = LIMITE_TOTAL_MS - (Date.now() - inicio);
      if (queda < 4000) break;
      // En la última vuelta ya no se ofrecen herramientas: toca contestar.
      const r = await completar(mensajes, vuelta < MAX_VUELTAS ? defs : [], indice, Math.min(queda, 30000));
      indice = r.indice;
      modelo = r.modelo;
      if (r.fallos.length) avisos.push(...r.fallos);
      const llamadas = r.mensaje.tool_calls || [];
      if (!llamadas.length) {
        const texto = String(r.mensaje.content || "").trim();
        console.log(`agente ok ${modelo} vueltas=${vuelta} herramientas=${usadas.join(",") || "-"} ${Date.now() - inicio}ms${avisos.length ? ` (fallos: ${avisos.join(" | ").slice(0, 400)})` : ""}`);
        return J({ ok: true, handled: true, answer: texto, choices: [], modelo, herramientas: usadas });
      }
      mensajes.push({ role: "assistant", content: r.mensaje.content || null, tool_calls: llamadas });
      const resultados = await Promise.all(llamadas.map((l) => ejecutarHerramienta(ctx, l.function.name, l.function.arguments)));
      llamadas.forEach((l, i) => {
        usadas.push(l.function.name);
        let contenido = JSON.stringify(resultados[i]);
        if (contenido.length > MAX_RESULTADO) contenido = contenido.slice(0, MAX_RESULTADO) + "…(recortado)";
        mensajes.push({ role: "tool", tool_call_id: l.id, content: contenido });
      });
    }
    console.error(`agente sin respuesta final ${modelo} herramientas=${usadas.join(",")} ${Date.now() - inicio}ms`);
    return J({ ok: true, handled: true, answer: "Me he liado consultando datos y no he llegado a una respuesta clara, señor Cubero. ¿Me lo pregunta de otra forma o más concreto?", choices: [] });
  } catch (e) {
    console.error("mitico-paco-agente", e);
    return J({ ok: false, error: "No he podido contestar ahora mismo." }, 502);
  }
});
