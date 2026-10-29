import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { completar, type Mensaje } from "./llm.ts";
import { Contexto, HERRAMIENTAS, ejecutarHerramienta, hoyMadrid, sumarDias, diaSemana, type Propuesta, type PropuestaGestion, type PropuestaNota } from "./herramientas.ts";

// ---------------------------------------------------------------------------
// mitico-paco-agente · Paco con «ojos» (23/10/2026)
//
// Paco decide qué datos necesita, los consulta con herramientas de SOLO
// LECTURA (herramientas.ts) y contesta. Desde el 29/10 también prepara
// recordatorios de Secretaría y publicar grupos (siempre con Confirmar). No escribe nada en la base de datos:
// para cambios (meter a un niño en un grupo) prepara una propuesta y la app le
// enseña a Jose un botón Confirmar; el cambio lo hace la app con su sesión.
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

function sistema(memoria = "") {
  const hoy = hoyMadrid();
  return `Eres Paco, un miembro más del equipo de coordinación de Mítico (escuela y club de esquí infantil en Snowzone, Madrid; modalidades Baby, Ocio e Intensivos). Trabajas para Jose Cubero, el coordinador jefe; le hablas de «señor Cubero» con naturalidad (no en cada frase), en español de España, directo y con un punto de humor seco cuando encaja.

CÓMO TRABAJAS
- Antes de contestar sobre niños, grupos, turnos, reportes, entrenadores o material, CONSULTA los datos con tus herramientas. Nunca inventes nombres, fechas, horas, niveles ni números.
- Si te nombran a un niño, primero buscar_alumno; si hay varios posibles, pregunta cuál (enseña nombre, edad y nivel) en vez de suponer. La app le pondrá a Jose un botón por cada niño para que solo tenga que pulsar.
- Cuando le ofrezcas elegir entre varias cosas concretas, termina con una última línea así: OPCIONES: opción 1 | opción 2 | opción 3 (textos cortos, como mucho 6). Esa línea no se le enseña: se convierte en botones.
- También ves la disponibilidad de los entrenadores, los avisos que les han llegado al móvil, las altas/tests de niños nuevos y el estado de los intensivos: usa esas herramientas en vez de decir que no lo sabes.
- Puedes encadenar varias herramientas para responder algo compuesto. Interpreta las fechas con el calendario de abajo («el sábado» = el próximo sábado; «el finde» = sábado y domingo próximos).
- Para proponer dónde colocar a un niño (alta tardía o niño sin grupo) usa opciones_para_nino y explica en una línea por qué recomiendas la primera opción. Si no hay grupo que encaje, dilo y sugiere el turno con hueco o crear grupo.
- Respuestas cortas y ordenadas: primero lo importante, luego el detalle en viñetas. Nada de JSON ni ids internos en la respuesta.

CAMBIOS
- Tú no cambias nada directamente. Para meter a un niño en un grupo de Baby (alta tardía, niño sin grupo, cambiarle de grupo en el mismo turno) usa preparar_meter_en_grupo: la app le pone a Jose un botón Confirmar y solo al pulsarlo se hace. Nunca digas que ya está hecho; di qué se hará y que pulse Confirmar.
- Si Jose dice «mételo en el que me recomendaste», usa el grupo_id de la MEMORIA o de tu respuesta anterior.
- Recordatorios: «recuérdame / avísame / apúntame para el … a las …» → preparar_recordatorio (se guarda en Secretaría y le llega un aviso al móvil a esa hora). Calcula la fecha con el calendario; si no dice hora, 09:00.
- Publicar grupos al entrenador → preparar_publicar_grupos con los grupo_id de agenda (solo los que no están publicados). Explica cuáles no se pueden publicar y por qué (falta entrenador, punto…).
- Otros cambios (cambiar de turno, poner entrenador o punto, disponibilidad) todavía no los preparas tú: dile cómo pedirlo (por ejemplo «pasa a Lucía al jueves a las 17:00» para cambiar de turno a un niño de Baby) o que lo haga desde la app.
- Si algo no está en los datos, dilo tal cual.

MEMORIA DE JOSE (notas sobre niños y familias)
- Cuando Jose te cuente algo de un niño o su familia para que lo tengas en cuenta («apunta que…», «que no esté con…», «recuerda que la familia…», «el próximo día…»), busca al niño y usa preparar_nota. No la des por guardada: Jose pulsa Confirmar.
- Si alguna herramienta trae notas_de_jose de un niño (o choca_con_nota_de_jose), EMPIEZA tu respuesta recordándolas con 📝 aunque no te pregunten por ellas. Si un grupo choca con una nota, no lo recomiendes y explica por qué.
- «¿Qué tengo apuntado (de X)?» → notas_de_jose. «Borra la nota de X» o «ya está hecho» → preparar_borrar_nota.

FECHA: hoy es ${diaSemana(hoy)} ${hoy} (Madrid). Calendario: ${calendario(hoy)}.${memoria ? `\n\nMEMORIA de esta conversación (ids para tus herramientas; no los enseñes):\n${memoria}` : ""}`;
}

const MAX_MEMORIA = 2500;

/** Ids útiles de lo consultado (niños y grupos recomendados) para la siguiente pregunta. */
function memoriaDe(nombre: string, resultado: unknown): string[] {
  const r = resultado as Record<string, any> | null;
  if (!r || typeof r !== "object") return [];
  if (nombre === "buscar_alumno" && Array.isArray(r.coincidencias)) {
    return r.coincidencias.slice(0, 6).map((c: any) => `niño ${c.nombre} (${c.edad ?? "?"} años, ${c.nivel}) alumno_id=${c.alumno_id}`);
  }
  if (nombre === "opciones_para_nino" && Array.isArray(r.mejores_opciones)) {
    return r.mejores_opciones.slice(0, 4).map((o: any, i: number) =>
      `opción ${i + 1} para ${r.nino || "el niño"}: ${o.dia} ${o.fecha} ${o.hora} «${o.grupo}» grupo_id=${o.grupo_id}`);
  }
  return [];
}

const MAX_OPCIONES = 6;

/** Saca la línea «OPCIONES: a | b» del texto y la convierte en botones. */
function separarOpciones(texto: string): { texto: string; opciones: string[] } {
  const lineas = texto.split("\n");
  const i = lineas.findIndex((l) => /^\s*\**\s*opciones\s*\**\s*:/i.test(l));
  if (i < 0) return { texto, opciones: [] };
  const opciones = lineas[i]
    .replace(/^\s*\**\s*opciones\s*\**\s*:/i, "")
    .split("|")
    .map((o) => o.replace(/[*_`]/g, "").trim())
    .filter((o) => o && o.length <= 80);
  lineas.splice(i, 1);
  return { texto: lineas.join("\n").trim(), opciones: [...new Set(opciones)].slice(0, MAX_OPCIONES) };
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
    const memoriaPrevia = typeof b.memoria === "string" ? b.memoria.slice(0, MAX_MEMORIA) : "";
    const mensajes: Mensaje[] = [
      { role: "system", content: sistema(memoriaPrevia) },
      ...historialLimpio(b.historial).map((t) => ({ role: t.rol, content: t.texto }) as Mensaje),
      { role: "user", content: msg },
    ];
    const defs = HERRAMIENTAS.map((h) => h.def);
    const usadas: string[] = [];
    let indice = 0;
    let modelo = "";
    const avisos: string[] = [];
    // Nombres de la última búsqueda de alumnos con varias coincidencias (para botones).
    let candidatos: string[] = [];
    const acciones: Propuesta[] = [];
    const notas: PropuestaNota[] = [];
    const gestiones: PropuestaGestion[] = [];
    const memoria: string[] = [];

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
        const sep = separarOpciones(String(r.mensaje.content || "").trim());
        const texto = sep.texto;
        let opciones = sep.opciones;
        if (!opciones.length && candidatos.length > 1 && texto.includes("?")) opciones = candidatos.slice(0, MAX_OPCIONES);
        console.log(`agente ok ${modelo} vueltas=${vuelta} herramientas=${usadas.join(",") || "-"} ${Date.now() - inicio}ms${avisos.length ? ` (fallos: ${avisos.join(" | ").slice(0, 400)})` : ""}`);
        if (acciones.length || notas.length || gestiones.length) opciones = [];
        const memoriaNueva = [...memoria, ...memoriaPrevia.split("\n")].filter(Boolean);
        return J({
          ok: true, handled: true, answer: texto, choices: [], opciones, acciones: acciones.slice(-3), notas: notas.slice(-3), gestiones: gestiones.slice(-3),
          memoria: [...new Set(memoriaNueva)].join("\n").slice(0, MAX_MEMORIA), modelo, herramientas: usadas,
        });
      }
      mensajes.push({ role: "assistant", content: r.mensaje.content || null, tool_calls: llamadas });
      const resultados = await Promise.all(llamadas.map((l) => ejecutarHerramienta(ctx, l.function.name, l.function.arguments)));
      llamadas.forEach((l, i) => {
        usadas.push(l.function.name);
        const res = resultados[i] as { coincidencias?: { nombre?: unknown }[] } | null;
        memoria.push(...memoriaDe(l.function.name, resultados[i]));
        const prop = (resultados[i] as { propuesta?: Propuesta } | null)?.propuesta;
        if (l.function.name === "preparar_meter_en_grupo" && prop) {
          const repetida = acciones.findIndex((a) => a.grupo_id === prop.grupo_id && a.alumno_id === prop.alumno_id && a.nombre === prop.nombre);
          if (repetida >= 0) acciones.splice(repetida, 1);
          acciones.push(prop);
        }
        const pn = (resultados[i] as { propuesta_nota?: PropuestaNota } | null)?.propuesta_nota;
        if (pn) notas.push(pn);
        const pg = (resultados[i] as { propuesta_gestion?: PropuestaGestion } | null)?.propuesta_gestion;
        if (pg) {
          const repetida = gestiones.findIndex((g) => g.etiqueta === pg.etiqueta);
          if (repetida >= 0) gestiones.splice(repetida, 1);
          gestiones.push(pg);
        }
        if (l.function.name === "buscar_alumno") {
          candidatos = Array.isArray(res?.coincidencias) ? res!.coincidencias.map((c) => String(c?.nombre || "")).filter(Boolean) : [];
        }
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
