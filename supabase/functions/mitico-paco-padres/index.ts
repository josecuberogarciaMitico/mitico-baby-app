import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { pedirIA } from "./ia.ts";

// ---------------------------------------------------------------------------
// mitico-paco-padres  (no envia nada a nadie)
// Redacta mensajes para Jose: la respuesta a un mensaje de una familia, o un
// mensaje ordenado a partir de sus notas sueltas (a familias o a entrenadores).
// Jose lo pega en el chat de Paco o en la seccion "Respuestas".
//
// Con familias: localiza al nino si lo nombra y usa SOLO datos seguros (nombre
// de pila, edad, nivel, sesion, lugar, asistencia, ultimo reporte estructurado).
// NUNCA usa observaciones internas, incidencias, comentarios de entrenadores,
// apellidos, nombres de entrenadores ni datos de otros ninos.
//
// Aprende de Jose: lee los datos del nino y SOLO escribe en sus dos tablas de
// aprendizaje (paco_respuestas_ejemplos y paco_respuestas_reglas), donde guarda
// sus correcciones para imitar su estilo. Esas tablas no tienen politicas: solo
// se tocan desde aqui.
// Aislada de las demas funciones de Paco. Solo coordinador_jefe.
// ---------------------------------------------------------------------------

const U = Deno.env.get("SUPABASE_URL") || "";
const K = Deno.env.get("SUPABASE_ANON_KEY") || "";
const S = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const G = Deno.env.get("GEMINI_API_KEY") || "";

const ROUTER_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash"];
const WRITER_MODELS = ["gemini-3.8-flash", "gemini-3.7-flash", "gemini-3.6-flash", "gemini-3.5-flash", "gemini-3.5-flash-lite"];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// ---------- ESTILO (editable): como escribe Jose ---------------------------------
// Sacado de mensajes reales de Jose a familias. Las correcciones que haga en la
// app se suman a esto (tablas paco_respuestas_*), no lo sustituyen.
const ESTILO = `Escribes como Jose Cubero, coordinador de Mítico Baby / Club Mítico (escuela y club de esquí y nieve para niños: Baby, Ocio, Intensivos, prácticas y equipo), por WhatsApp a las familias.
- Español de España, cercano y profesional. Hablas a la familia en plural de "vosotros" ("os", "tenéis", "traed", "decidme"), aunque escriba una sola persona. Si la familia te trata de usted, mantén la cercanía.
- Saludo breve ("Hola, buenos días,"; "Hola familias,") y al grano: lo primero que la familia necesita saber, en la primera frase.
- Párrafos cortos separados por una línea en blanco. Consulta sencilla: 2 a 5 líneas. Si hay que explicar algo (material, normas, motivos), puede alargarse en varios párrafos cortos, contando el porqué con naturalidad.
- Cuando pides algo a las familias, propones y no exiges ("poco a poco", "id valorando", "no hace falta de un día para otro") y reconoces su esfuerzo de tiempo y dinero.
- Hablando de los niños en general dices "los peques" o "los enanos", con cariño; si es un niño concreto, por su nombre de pila.
- Nada de "estimada familia", ni jerga interna (grupo estable, volcado, colisión, listado...).
- Sin emojis, salvo que la familia los use; entonces como mucho uno.
- Cierras ofreciendo ayuda, breve ("Cualquier cosa, nos decís.", "Si necesitáis orientación, preguntadme y os echo una mano."). Sin firma.`;

const ESTILO_ENTRENADORES = `Escribes como Jose Cubero, coordinador de Mítico, por WhatsApp a los entrenadores del club (son compañeros de trabajo).
- Español de España, cercano, directo y agradecido. Trato de tú / vosotros, natural.
- Lo importante primero: qué hay que hacer, cuándo y dónde. Frases cortas y claras; si hay varias cosas, en párrafos cortos o una línea por cosa.
- Sin tecnicismos de la app ni jerga interna innecesaria. Sin emojis salvo que Jose los use. Sin firma.`;

// Hechos del club dichos por Jose. Solo se usan si vienen al caso.
const DATOS_CLUB = `DATOS DEL CLUB (dichos por Jose; úsalos solo si vienen al caso, no los metas si nadie pregunta por ello):
- El alquiler de esquís y botas en Snowzone (Xanadú) entra incluido con el forfait; Raquel, de la instalación, confirmó que esta temporada lo han cambiado así.
- Para empezar basta con el material de la instalación, pero a medio plazo conviene material propio: el de alquiler es de uso turístico, más blando y menos preciso, y para mejorar la técnica ayuda acostumbrarse siempre al mismo equipo. Lo primero que conviene comprar es el casco (calidad e higiene).
- Para pedir material en la instalación basta con acercarse a los mostradores y decir que se viene a entrenar con Mítico.
- Tienda recomendada para comprar material: Patrick Sport (Av. de la Victoria, 2, C.C. Sexta Avenida, El Plantío, Madrid). Diciendo que son de Club Mítico hacen un 20 % de descuento. Conviene llevar un vídeo reciente del niño y decirles edad, peso, altura y el material que ya tienen. Mítico trabaja mucho con ellos y muchos del equipo de competición usan material recomendado allí.
- Prácticas: ropa de abrigo, guantes, casco y, a ser posible, pantalón de esquí negro. La chaqueta del club la entrega Mítico el primer día de prácticas.`;

const REGLAS = `REGLAS DE CONTENIDO (obligatorias):
1. Usa SOLO los datos de la sección DATOS (sobre el niño) y los DATOS DEL CLUB. No inventes horarios, precios, plazas, normas, fechas, devoluciones ni nombres de entrenadores. Si un dato no está, no lo afirmes.
2. Si la respuesta depende de algo que no consta o que decide Jose (cambio de grupo o día, plazas, recuperar una clase, devoluciones, precios, seguros), redacta una respuesta amable que NO prometa nada y diga que lo revisas y se lo confirmas; y apunta en "para_jose" qué debe decidir o comprobar.
3. Temas delicados (lesión, golpe, salud, queja, enfado, dinero o pagos, comportamiento del niño, discusión): tono empático y tranquilo, no culpes a nadie, no des diagnósticos, no te justifiques de más; pon "delicado": true.
4. Nunca menciones observaciones internas, incidencias, comentarios de entrenadores, datos de otros niños ni el apellido del niño.
5. Si preguntan varias cosas, respóndelas todas, en orden.
6. Si hay INSTRUCCIÓN DE JOSE (en el mensaje o aparte), síguela con prioridad (siempre que no obligue a inventar datos): es lo que Jose quiere decir; tú lo redactas bien.
7. Si el mensaje de la familia es confuso o falta un dato imprescindible, responde con lo que sí se puede y pregunta lo mínimo necesario.
8. Lo aprendido de Jose (reglas y ejemplos) manda sobre el estilo por defecto, pero nunca sobre estas reglas de contenido.`;

const REGLAS_NOTAS = `REGLAS (obligatorias):
1. Jose te da notas sueltas o dictadas por voz (con faltas, a medias, desordenadas). Conviértelas en un mensaje listo para enviar, ordenado y con su tono, sin cambiar lo que quiere decir.
2. Conserva TODO lo que dice: no quites datos ni añadas hechos, promesas, precios, fechas o normas que no estén en las notas (puedes usar los DATOS DEL CLUB si vienen claramente al caso).
3. Si en las notas hay indicaciones para ti ("añadir que...", "escribir mensaje a los papás de ocio donde les explique...", "este es otro mensaje"), cúmplelas: son órdenes, no texto del mensaje. Si piden dos mensajes distintos, sepáralos con una línea que solo contenga ---.
4. Si falta algo importante para que el mensaje se entienda, no lo inventes: apúntalo en "para_jose".
5. Temas delicados (dinero, quejas, salud, conflictos): tono tranquilo y respetuoso; pon "delicado": true.
6. Lo aprendido de Jose (reglas y ejemplos) manda sobre el estilo por defecto, pero nunca sobre estas reglas.`;

// ---------- Utilidades ------------------------------------------------------------

function J(x: unknown, s = 200) {
  return new Response(JSON.stringify(x), {
    status: s,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}

export function norm(x: unknown) {
  return String(x ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9+ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function todayMadrid() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

function ageAt(birth: string | null, date: string) {
  if (!birth) return null;
  const [by, bm, bd] = birth.split("-").map(Number);
  const [y, m, d] = date.split("-").map(Number);
  if (!by || !bm || !bd) return null;
  let a = y - by;
  if (m < bm || (m === bm && d < bd)) a--;
  return a;
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
function fmtFecha(iso: string | null | undefined) {
  const s = String(iso || "").slice(0, 10);
  const [y, m, d] = s.split("-").map(Number);
  if (!y || !m || !d) return "fecha sin indicar";
  return `${DIAS[new Date(Date.UTC(y, m - 1, d)).getUTCDay()]} ${String(d).padStart(2, "0")}/${String(m).padStart(2, "0")}/${y}`;
}
const fmtHora = (x: string | null | undefined) => (x ? String(x).slice(0, 5) : "");
const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : s);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function sectionLabel(v: unknown) {
  const x = String(v || "").toUpperCase();
  if (x === "BABY_INTENSIVOS") return "Baby / Intensivos";
  if (x === "OCIO") return "Ocio";
  return "";
}

// ---------- Acceso ----------------------------------------------------------------

async function admin(path: string) {
  const r = await fetch(U + path, { headers: { apikey: S, Authorization: `Bearer ${S}`, Accept: "application/json" } });
  const t = await r.text();
  let d: any = null;
  try { d = t ? JSON.parse(t) : null; } catch { d = t; }
  if (!r.ok) throw new Error(`DB ${r.status}: ${String(t).slice(0, 160)}`);
  return d;
}

// Devuelve el id de auth del usuario si es coordinador_jefe; si no, null.
async function authorize(req: Request): Promise<string | null> {
  const a = req.headers.get("Authorization") || "";
  if (!a.startsWith("Bearer ")) return null;
  const ur = await fetch(U + "/auth/v1/user", { headers: { apikey: K, Authorization: a } });
  if (!ur.ok) return null;
  const u = await ur.json();
  if (!u?.id) return null;
  const rows = await admin(`/rest/v1/usuarios_app?select=rol&auth_user_id=eq.${encodeURIComponent(String(u.id))}&activo=eq.true&limit=1`);
  return Array.isArray(rows) && rows[0]?.rol === "coordinador_jefe" ? String(u.id) : null;
}

// Escritura SOLO para las tablas de aprendizaje (service_role, tras authorize).
let cacheApr: { hasta: number; destino: Destino; reglas: unknown; ejemplos: unknown } | null = null;

async function adminSend(method: "POST" | "PATCH" | "DELETE", path: string, body?: unknown) {
  if (!path.startsWith("/rest/v1/paco_respuestas_")) throw new Error("ruta no permitida");
  cacheApr = null;
  const r = await fetch(U + path, {
    method,
    headers: { apikey: S, Authorization: `Bearer ${S}`, "Content-Type": "application/json", Accept: "application/json", Prefer: "return=representation" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const t = await r.text();
  let d: any = null;
  try { d = t ? JSON.parse(t) : null; } catch { d = t; }
  if (!r.ok) throw new Error(`DB ${r.status}: ${String(t).slice(0, 160)}`);
  return d;
}

// ---------- Cuando contesta esta funcion --------------------------------------------

// Peticion explicita de Jose ("responde a este padre", "Padre: ...", etc.)
export function isExplicit(text: string) {
  const n = norm(text);
  const head = n.slice(0, 160);
  if (/^(PADRE|MADRE|PAPA|MAMA|FAMILIA|TUTOR)\b/.test(n) && /[:\n]/.test(text.slice(0, 40))) return true;
  if (
    /\b(RESPONDE|CONTESTA|RESPONDELE|CONTESTALE|RESPONDER|CONTESTAR|REDACTA|ESCRIBE|PREPARA|ESCRIBELE)\b/.test(head) &&
    /\b(PADRE|MADRE|PAPA|MAMA|FAMILIA|TUTOR|MENSAJE|WHATSAPP|CORREO|EMAIL)\b/.test(head)
  ) return true;
  if (/\b(QUE LE (CONTESTO|RESPONDO|DIGO)|COMO (LE )?(CONTESTO|RESPONDO))\b/.test(head)) return true;
  if (/\b(MENSAJE|WHATSAPP|CORREO|EMAIL) DE (UN |UNA |LA |EL )?(PADRE|MADRE|FAMILIA|PAPA|MAMA)\b/.test(head)) return true;
  return false;
}

// Mensaje pegado tal cual, con voz de padre o madre ("mi hijo...", "mi niña...").
export function looksParent(text: string) {
  const n = norm(text);
  if (n.length < 60) return false;
  return (
    /\bMI (HIJO|HIJA|NINO|NINA|PEQUE|PEQUENO|PEQUENA|CRIO|CRIA)\b/.test(n) ||
    /\bNUESTR[OA] (HIJO|HIJA|NINO|NINA)\b/.test(n) ||
    /\bSOY (LA |EL )?(MADRE|PADRE|MAMA|PAPA) DE\b/.test(n) ||
    /\bMIS (HIJOS|HIJAS)\b/.test(n)
  );
}

// Ajustes sobre la ultima respuesta ("mas corta", "dile que...", "sin emojis").
export function isRevision(text: string) {
  const n = norm(text);
  if (n.length > 400) return false;
  return (
    /\b(MAS|MENOS) (CORTO|CORTA|LARGO|LARGA|CALIDO|CALIDA|CERCANO|CERCANA|FIRME|FORMAL|INFORMAL|DIRECTO|DIRECTA|AMABLE|SECO|SECA|BREVE|SIMPLE|CLARO|CLARA|EMOJIS?)\b/.test(n) ||
    /\b(CAMBIA|ANADE|QUITA|ELIMINA|PON|DILE|DILES|MENCIONA|INCLUYE|SIN EMOJIS?|CON EMOJIS?|TUTEA|TRATALO DE USTED|REPITE|OTRA VERSION|REDACTALA|REESCRIBE|MEJORALA|ACORTALA|ALARGALA)\b/.test(n)
  );
}

// ---------- Gemini ----------------------------------------------------------------------

type Pensar = "minimal" | "low" | "medium";
type OpcGemini = { temp?: number; hedgeMs?: number; timeoutMs?: number };

// IA compartida (./ia.ts): Cloudflare → Gemini, con límite de tiempo por intento.
// Se mantiene gemini() con la misma firma para no tocar el resto del archivo:
// ROUTER_MODELS = entender la frase (rápido); WRITER_MODELS = redactar (pensar).
export async function gemini(models: string[], sys: string, user: string, json: boolean, _thinking?: Pensar, opc: OpcGemini = {}): Promise<string> {
  const r = await pedirIA({
    system: sys,
    user,
    json,
    nivel: models === ROUTER_MODELS ? "rapido" : "pensar",
    temperatura: opc.temp ?? (json ? 0.4 : 0.5),
    maxTokens: 4096,
  });
  return r.texto;
}

function parseJson(t: string): any {
  const s = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try { return JSON.parse(s); } catch {
    const a = s.indexOf("{"), b = s.lastIndexOf("}");
    if (a >= 0 && b > a) return JSON.parse(s.slice(a, b + 1));
    throw new Error("json");
  }
}

type Route = { es_mensaje_familia?: boolean; mensaje_familia?: string; instruccion?: string | null; ninos?: unknown };

async function route(text: string): Promise<Route> {
  const sys = `Analizas lo que Jose (coordinador de una escuela de esquí infantil) escribe a su asistente. Devuelve SOLO JSON con:
- es_mensaje_familia: true si en el texto hay un mensaje escrito por un padre/madre/tutor (o Jose pide expresamente responder a una familia); false si es otra cosa (una pregunta de Jose sobre datos, una tarea, etc.).
- mensaje_familia: el mensaje de la familia COPIADO TAL CUAL, sin la instrucción de Jose (si no hay mensaje pegado, el texto completo).
- instruccion: lo que Jose pide sobre cómo responder ("dile que sí", "sin prometer nada", "más corto"), o null.
- ninos: lista con los nombres de los niños mencionados en el mensaje de la familia (con apellidos si aparecen; solo nombres de niños, no de los padres ni de entrenadores). Lista vacía si no hay.`;
  const t = await gemini(ROUTER_MODELS, sys, text.slice(0, 4000), true, undefined, { hedgeMs: 4000, timeoutMs: 12000 });
  return parseJson(t);
}

type Hechos = { texto: string; nino: string | null };

type Modo = "respuesta" | "notas";
type Destino = "familias" | "entrenadores";
type Draft = { mensaje: string; respuesta: string; hechos: string; nino: string | null; instruccion: string | null; modo: Modo; destino: Destino };

function cleanDraft(d: any): Draft | null {
  if (!d || typeof d !== "object") return null;
  const mensaje = String(d.mensaje || "").slice(0, 4000);
  const respuesta = String(d.respuesta || "").slice(0, 3000);
  if (!mensaje || !respuesta) return null;
  return {
    mensaje,
    respuesta,
    hechos: String(d.hechos || "").slice(0, 2500),
    nino: d.nino ? String(d.nino).slice(0, 60) : null,
    instruccion: d.instruccion ? String(d.instruccion).slice(0, 400) : null,
    modo: d.modo === "notas" ? "notas" : "respuesta",
    destino: d.destino === "entrenadores" ? "entrenadores" : "familias",
  };
}

// ---------- Ninos y datos seguros ---------------------------------------------------------------

type Student = { id: string; nombre_completo: string; fecha_nacimiento: string | null; seccion_principal: string | null; nivel_actual_id: string | null; nivel_estimado_id: string | null };

async function loadRoster(): Promise<Student[]> {
  const d = await admin("/rest/v1/alumnos?select=id,nombre_completo,fecha_nacimiento,seccion_principal,nivel_actual_id,nivel_estimado_id&activo=eq.true&order=nombre_completo.asc&limit=1000");
  return Array.isArray(d) ? d : [];
}

export function matchStudents(names: string[], roster: Student[]) {
  const unicos: Student[] = [];
  const ambiguos: { nombre: string; cands: Student[] }[] = [];
  const sinMatch: string[] = [];
  for (const raw of names) {
    const toks = norm(raw).split(" ").filter((t) => t.length >= 2);
    if (!toks.length) continue;
    const cands = roster.filter((s) => {
      const st = norm(s.nombre_completo).split(" ");
      if (toks.length === 1) return st[0] === toks[0] || st.includes(toks[0]);
      return toks.every((t) => st.includes(t));
    });
    // con un solo nombre de pila, se prefieren los que lo tienen como primer nombre
    const first = toks.length === 1 ? cands.filter((s) => norm(s.nombre_completo).split(" ")[0] === toks[0]) : cands;
    const use = first.length ? first : cands;
    if (use.length === 1) { if (!unicos.some((u) => u.id === use[0].id)) unicos.push(use[0]); }
    else if (use.length > 1) ambiguos.push({ nombre: raw, cands: use });
    else sinMatch.push(raw);
  }
  return { unicos, ambiguos, sinMatch };
}

async function buildHechos(s: Student): Promise<Hechos> {
  const td = todayMadrid();
  const id = encodeURIComponent(s.id);
  const [levels, ga, att, rep] = await Promise.all([
    admin("/rest/v1/niveles?select=id,codigo&activo=eq.true&limit=100"),
    admin(`/rest/v1/grupo_alumnos?select=grupo_id,es_recuperacion&alumno_id=eq.${id}&limit=100`),
    admin(`/rest/v1/asistencias?select=estado&alumno_id=eq.${id}&limit=300`),
    admin(`/rest/v1/v_historial_reportes_alumno?select=fecha,nivel_reportado,actitud,tecnica,autonomia&alumno_id=eq.${id}&order=fecha.desc&limit=1`),
  ]);
  const lv = new Map((Array.isArray(levels) ? levels : []).map((x: any) => [String(x.id), String(x.codigo)]));
  const nivel = lv.get(String(s.nivel_actual_id || "")) || lv.get(String(s.nivel_estimado_id || "")) || null;
  const nivelOrigen = s.nivel_actual_id ? "" : s.nivel_estimado_id ? " (estimado)" : "";

  const gIds = [...new Set((Array.isArray(ga) ? ga : []).map((x: any) => String(x.grupo_id)).filter((x) => UUID.test(x)))];
  let grupos: any[] = [];
  let sesiones: any[] = [];
  if (gIds.length) {
    grupos = await admin(`/rest/v1/grupos?select=id,sesion_id,pista,punto_encuentro,estado,publicado,cancelado&id=in.(${gIds.join(",")})`);
    const sIds = [...new Set((Array.isArray(grupos) ? grupos : []).map((g: any) => String(g.sesion_id)).filter((x) => UUID.test(x)))];
    if (sIds.length) sesiones = await admin(`/rest/v1/sesiones?select=id,fecha,hora_inicio,hora_fin,lugar&id=in.(${sIds.join(",")})`);
  }
  const sesMap = new Map((Array.isArray(sesiones) ? sesiones : []).map((x: any) => [String(x.id), x]));
  const lista = (Array.isArray(grupos) ? grupos : [])
    .map((g: any) => ({ g, ses: sesMap.get(String(g.sesion_id)) }))
    .filter((x: any) => x.ses);
  const futuras = lista.filter((x: any) => String(x.ses.fecha) >= td).sort((a: any, b: any) => `${a.ses.fecha} ${a.ses.hora_inicio}`.localeCompare(`${b.ses.fecha} ${b.ses.hora_inicio}`));
  const pasadas = lista.filter((x: any) => String(x.ses.fecha) < td).sort((a: any, b: any) => `${b.ses.fecha} ${b.ses.hora_inicio}`.localeCompare(`${a.ses.fecha} ${a.ses.hora_inicio}`));

  const sesTxt = (x: any) => {
    const hi = fmtHora(x.ses.hora_inicio), hf = fmtHora(x.ses.hora_fin);
    const partes = [`${fmtFecha(x.ses.fecha)}${hi ? ` de ${hi}${hf ? ` a ${hf}` : ""}` : ""}`];
    if (x.ses.lugar) partes.push(`lugar: ${x.ses.lugar}`);
    if (x.g.pista) partes.push(`pista: ${x.g.pista}`);
    if (x.g.punto_encuentro) partes.push(`punto de encuentro: ${x.g.punto_encuentro}`);
    if (x.g.cancelado) partes.push("SESIÓN CANCELADA");
    else if (!x.g.publicado) partes.push("grupo todavía NO publicado: no lo des como definitivo");
    return partes.join(" · ");
  };

  const nombre = cap(String(s.nombre_completo || "").trim().split(/\s+/)[0] || "");
  const edad = ageAt(s.fecha_nacimiento, td);
  const sec = sectionLabel(s.seccion_principal);
  const lineas: string[] = [];
  lineas.push(`Niño/a: ${nombre}${edad !== null ? `, ${edad} años` : ""}${sec ? `. Modalidad: ${sec}` : ""}. Nivel: ${nivel ? nivel + nivelOrigen : "sin nivel registrado"}.`);
  lineas.push(futuras.length ? `Próxima sesión con grupo: ${sesTxt(futuras[0])}.` : "Próxima sesión: no consta ningún grupo asignado.");
  if (pasadas.length) lineas.push(`Última sesión con grupo: ${sesTxt(pasadas[0])}.`);
  const a = Array.isArray(att) ? att : [];
  if (a.length) {
    const pres = a.filter((x: any) => norm(x.estado) === "PRESENTE").length;
    const aus = a.filter((x: any) => norm(x.estado) === "AUSENTE").length;
    lineas.push(`Asistencia registrada: ${pres} presente(s), ${aus} ausente(s).`);
  }
  const r: any = Array.isArray(rep) ? rep[0] : null;
  if (r) {
    const p = [r.nivel_reportado && `nivel ${r.nivel_reportado}`, r.actitud && `actitud ${r.actitud}`, r.tecnica && `técnica ${r.tecnica}`, r.autonomia && `autonomía ${r.autonomia}`].filter(Boolean).join(", ");
    if (p) lineas.push(`Último reporte (${String(r.fecha).slice(0, 10)}): ${p}.`);
  }
  return { texto: lineas.join("\n"), nino: nombre };
}

// ---------- Aprendizaje de Jose (tablas propias) ---------------------------------------------

const STOP = new Set(["PARA", "COMO", "PERO", "ESTA", "ESTE", "ESTAN", "TENGO", "TIENE", "QUIERO", "HOLA", "BUENOS", "BUENAS", "TARDES", "NOCHES", "GRACIAS", "SALUDO", "MUCHAS", "TAMBIEN", "CUANDO", "DONDE", "SOBRE", "ENTRE", "HASTA", "DESDE", "VUESTRO", "VUESTRA", "NUESTRO", "NUESTRA", "JOSE"]);

export function palabras(x: string) {
  return new Set(norm(x).split(" ").filter((w) => w.length >= 4 && !STOP.has(w)));
}

export function similitud(a: string, b: string) {
  const A = palabras(a), B = palabras(b);
  if (!A.size || !B.size) return 0;
  let n = 0;
  for (const w of A) if (B.has(w)) n++;
  return n / Math.sqrt(A.size * B.size);
}

export type Ejemplo = { id: string; mensaje_familia: string; respuesta_final: string; tipo?: string; modo?: string; destino?: string };

// Los ejemplos llegan ordenados del mas reciente al mas antiguo.
export function elegirEjemplos(texto: string, ejemplos: Ejemplo[], modo: Modo, destino: Destino, max = 5): Ejemplo[] {
  const pool = ejemplos.filter((e) => (e.destino || "familias") === destino);
  const mismo = (e: Ejemplo) => (e.modo || "respuesta") === modo;
  const parecidos = pool
    .map((e) => ({ e, s: similitud(texto, e.mensaje_familia) + (mismo(e) ? 0.05 : 0) }))
    .filter((x) => x.s >= 0.15)
    .sort((a, b) => b.s - a.s)
    .slice(0, 3)
    .map((x) => x.e);
  const ids = new Set(parecidos.map((e) => e.id));
  const resto = [...pool.filter((e) => !ids.has(e.id) && mismo(e)), ...pool.filter((e) => !ids.has(e.id) && !mismo(e))];
  return [...parecidos, ...resto.slice(0, Math.max(0, max - parecidos.length))];
}

export function bloqueAprendizaje(texto: string, modo: Modo, destino: Destino, reglas: { regla: string }[], ejemplos: Ejemplo[]): string {
  const partes: string[] = [];
  const rs = (Array.isArray(reglas) ? reglas : []).map((r) => String(r.regla || "").trim()).filter(Boolean).slice(0, 30);
  if (rs.length) partes.push("REGLAS DE JOSE (aprendidas de sus correcciones; aplícalas siempre):\n" + rs.map((r) => `- ${r}`).join("\n"));
  const ex = elegirEjemplos(texto, Array.isArray(ejemplos) ? ejemplos : [], modo, destino);
  if (ex.length) {
    const etiqueta = (e: Ejemplo) => ((e.modo || "respuesta") === "notas" ? ["Notas de Jose", "Mensaje final de Jose"] : ["Mensaje de la familia", "Respuesta de Jose"]);
    const items = ex.map((e, i) => {
      const [a, b] = etiqueta(e);
      return `Ejemplo ${i + 1}\n${a}: """${String(e.mensaje_familia).slice(0, 900)}"""\n${b}: """${String(e.respuesta_final).slice(0, 1400)}"""`;
    });
    partes.push("EJEMPLOS REALES de cómo escribe Jose (imita su forma de escribir, longitud, orden, saludo y cierre; NO copies los datos concretos de estos casos):\n" + items.join("\n\n"));
  }
  return partes.length ? "\n\n" + partes.join("\n\n") : "";
}

// Copia en memoria de reglas/ejemplos durante unos segundos (varios cambios seguidos sobre el
// mismo mensaje no vuelven a leer la base de datos). Se borra al escribir cualquier cosa.
async function cargarAprendizaje(texto: string, modo: Modo, destino: Destino): Promise<string> {
  try {
    if (!cacheApr || cacheApr.hasta < Date.now() || cacheApr.destino !== destino) {
      const [reglas, ejemplos] = await Promise.all([
        admin(`/rest/v1/paco_respuestas_reglas?select=regla&activa=eq.true&destino=in.(todos,${destino})&order=created_at.desc&limit=30`),
        admin("/rest/v1/paco_respuestas_ejemplos?select=id,mensaje_familia,respuesta_final,tipo,modo,destino&activo=eq.true&order=created_at.desc&limit=80"),
      ]);
      cacheApr = { hasta: Date.now() + 45_000, destino, reglas, ejemplos };
    }
    const { reglas, ejemplos } = cacheApr;
    return bloqueAprendizaje(texto, modo, destino, reglas as any, ejemplos as any);
  } catch (e) {
    console.error("mitico-paco-padres aprendizaje", e);
    return ""; // sin lo aprendido sigue funcionando con el estilo por defecto
  }
}

async function derivarRegla(borrador: string, final: string, destino: Destino): Promise<string | null> {
  const sys = `Comparas el BORRADOR que redactó un asistente con la versión FINAL que dejó Jose (coordinador de un club de esquí infantil) para ${destino === "entrenadores" ? "sus entrenadores" : "las familias"}.
Si Jose cambió algo que revela una preferencia GENERAL de estilo o contenido (tono, saludo, longitud, palabras que evita o prefiere, cómo cierra, qué incluye o no), formula UNA regla corta, en imperativo, válida para futuros mensajes (máximo 140 caracteres), sin nombres de niños ni datos concretos del caso.
Si los cambios son solo datos concretos de este caso, o no hay un patrón claro, devuelve null.
Devuelve SOLO JSON: {"regla": string o null}`;
  try {
    const t = await gemini(WRITER_MODELS, sys, `BORRADOR:\n"""\n${borrador}\n"""\n\nFINAL DE JOSE:\n"""\n${final}\n"""`, true, "minimal", { hedgeMs: 5000, timeoutMs: 15000 });
    const r = String(parseJson(t)?.regla ?? "").replace(/\s+/g, " ").trim().slice(0, 160);
    return r.length >= 8 && r.toLowerCase() !== "null" ? r : null;
  } catch (e) {
    console.error("mitico-paco-padres regla", e);
    return null;
  }
}

const limpia = (x: unknown, max: number) => String(x ?? "").replace(/\r/g, "").trim().slice(0, max);
const modoDe = (x: unknown): Modo => (x === "notas" ? "notas" : "respuesta");
const destinoDe = (x: unknown): Destino => (x === "entrenadores" ? "entrenadores" : "familias");

async function accion(b: any, uid: string): Promise<Response> {
  const a = String(b.action);
  const ok = (extra: Record<string, unknown> = {}) => J({ ok: true, handled: true, ...extra });

  if (a === "aprendizaje_listar") {
    const [reglas, ejemplos] = await Promise.all([
      admin("/rest/v1/paco_respuestas_reglas?select=id,regla,origen,activa,destino,created_at&order=created_at.desc&limit=100"),
      admin("/rest/v1/paco_respuestas_ejemplos?select=id,mensaje_familia,borrador_paco,respuesta_final,tipo,modo,destino,created_at&activo=eq.true&order=created_at.desc&limit=60"),
    ]);
    return ok({ reglas: Array.isArray(reglas) ? reglas : [], ejemplos: Array.isArray(ejemplos) ? ejemplos : [] });
  }

  if (a === "feedback") {
    const mensaje = limpia(b.mensaje, 4000), borrador = limpia(b.borrador, 3000), final = limpia(b.final, 3000);
    const modo = modoDe(b.modo), destino = destinoDe(b.destino);
    if (!mensaje || !final) return J({ ok: false, error: "Falta el mensaje o la respuesta final." }, 400);
    const squash = (x: string) => x.replace(/\s+/g, " ").trim();
    const tipo = borrador && squash(borrador) === squash(final) ? "aprobada" : "corregida";
    const rows = await adminSend("POST", "/rest/v1/paco_respuestas_ejemplos", {
      autor_auth_id: uid, mensaje_familia: mensaje, borrador_paco: borrador || null, respuesta_final: final, tipo, modo, destino,
    });
    const ejemplo = Array.isArray(rows) ? rows[0] : null;
    let regla: { id: string; regla: string } | null = null;
    if (tipo === "corregida" && borrador) {
      const texto = await derivarRegla(borrador, final, destino);
      if (texto) {
        const activas = await admin(`/rest/v1/paco_respuestas_reglas?select=regla&activa=eq.true&limit=200`).catch(() => []);
        const repetida = (Array.isArray(activas) ? activas : []).some((r: any) => norm(r.regla) === norm(texto));
        if (!repetida) {
          const rr = await adminSend("POST", "/rest/v1/paco_respuestas_reglas", { regla: texto, origen: "detectada", destino, ejemplo_id: ejemplo?.id ?? null });
          const r0 = Array.isArray(rr) ? rr[0] : null;
          if (r0) regla = { id: String(r0.id), regla: String(r0.regla) };
        }
      }
    }
    return ok({ tipo, ejemplo_id: ejemplo?.id ?? null, regla });
  }

  if (a === "ejemplo_guardar") {
    const mensaje = limpia(b.mensaje, 4000), final = limpia(b.final, 3000);
    if (!mensaje || !final) return J({ ok: false, error: "Faltan el mensaje o la respuesta." }, 400);
    const rows = await adminSend("POST", "/rest/v1/paco_respuestas_ejemplos", {
      autor_auth_id: uid, mensaje_familia: mensaje, borrador_paco: null, respuesta_final: final, tipo: "manual", modo: modoDe(b.modo), destino: destinoDe(b.destino),
    });
    return ok({ ejemplo_id: Array.isArray(rows) ? rows[0]?.id ?? null : null });
  }

  if (a === "ejemplo_borrar") {
    if (!UUID.test(String(b.id || ""))) return J({ ok: false, error: "Identificador no válido." }, 400);
    await adminSend("DELETE", `/rest/v1/paco_respuestas_ejemplos?id=eq.${encodeURIComponent(String(b.id))}`);
    return ok();
  }

  if (a === "regla_guardar") {
    const regla = limpia(b.regla, 300).replace(/\s+/g, " ");
    if (regla.length < 3) return J({ ok: false, error: "Escribe la regla." }, 400);
    const d = b.destino === "familias" || b.destino === "entrenadores" ? b.destino : "todos";
    const rows = await adminSend("POST", "/rest/v1/paco_respuestas_reglas", { regla, origen: "manual", destino: d });
    const r0 = Array.isArray(rows) ? rows[0] : null;
    return ok({ regla: r0 ? { id: String(r0.id), regla: String(r0.regla) } : null });
  }

  if (a === "regla_estado") {
    if (!UUID.test(String(b.id || "")) || typeof b.activa !== "boolean") return J({ ok: false, error: "Datos no válidos." }, 400);
    await adminSend("PATCH", `/rest/v1/paco_respuestas_reglas?id=eq.${encodeURIComponent(String(b.id))}`, { activa: b.activa });
    return ok();
  }

  if (a === "regla_borrar") {
    if (!UUID.test(String(b.id || ""))) return J({ ok: false, error: "Identificador no válido." }, 400);
    await adminSend("DELETE", `/rest/v1/paco_respuestas_reglas?id=eq.${encodeURIComponent(String(b.id))}`);
    return ok();
  }

  return J({ ok: false, error: "Acción desconocida." }, 400);
}

// ---------- Redaccion ---------------------------------------------------------------------------------

type Salida = { respuesta: string; para_jose: string[]; delicado: boolean };

const FORMATO = `Devuelve SOLO JSON: {"respuesta": string con el texto listo para pegar en WhatsApp (saltos de línea con \\n), "para_jose": lista de 0 a 4 avisos MUY cortos para Jose (qué debe decidir/comprobar o qué has supuesto), "delicado": boolean}.`;

async function redactar(mensaje: string, instruccion: string | null, hechos: string, aprendizaje: string): Promise<Salida> {
  const sys = `${ESTILO}\n\n${DATOS_CLUB}\n\n${REGLAS}${aprendizaje}\n\n${FORMATO}`;
  const user = `FECHA DE HOY: ${todayMadrid()}\n\nMENSAJE DE LA FAMILIA:\n"""\n${mensaje}\n"""\n\n${instruccion ? `INSTRUCCIÓN DE JOSE: ${instruccion}\n\n` : ""}DATOS (únicos hechos ciertos sobre el niño):\n${hechos || "No hay datos del niño."}`;
  const t = await gemini(WRITER_MODELS, sys, user, true, "low");
  return limpiarSalida(parseJson(t));
}

async function redactarNotas(notas: string, destino: Destino, aprendizaje: string): Promise<Salida> {
  const sys = `${destino === "entrenadores" ? ESTILO_ENTRENADORES : ESTILO}\n\n${DATOS_CLUB}\n\n${REGLAS_NOTAS}${aprendizaje}\n\n${FORMATO}`;
  const user = `FECHA DE HOY: ${todayMadrid()}\nDESTINATARIOS: ${destino === "entrenadores" ? "los entrenadores" : "las familias"}\n\nNOTAS DE JOSE:\n"""\n${notas}\n"""`;
  const t = await gemini(WRITER_MODELS, sys, user, true, "low");
  return limpiarSalida(parseJson(t));
}

async function reescribir(d: Draft, instruccion: string, aprendizaje: string): Promise<Salida> {
  const notas = d.modo === "notas";
  const base = notas
    ? `${d.destino === "entrenadores" ? ESTILO_ENTRENADORES : ESTILO}\n\n${DATOS_CLUB}\n\n${REGLAS_NOTAS}`
    : `${ESTILO}\n\n${DATOS_CLUB}\n\n${REGLAS}`;
  const sys = `${base}${aprendizaje}\n\nVas a MODIFICAR un mensaje ya redactado según la petición de Jose.
- Aplica EXACTAMENTE lo que pide Jose, nada más. Lo que no menciona se queda igual (mismas frases, mismo orden, mismo tono).
- Si Jose dicta algo que añadir o cambiar, intégralo con sus palabras y con el estilo del mensaje; no lo expliques ni lo resumas.
- No añadas datos nuevos ni promesas que Jose no haya dado. Mantén los hechos correctos.
- "para_jose" solo si hay algo que Jose deba decidir o comprobar; si no, lista vacía.
${FORMATO}`;
  const user = `FECHA DE HOY: ${todayMadrid()}\n\n${notas ? "NOTAS ORIGINALES DE JOSE" : "MENSAJE DE LA FAMILIA"}:\n"""\n${d.mensaje}\n"""\n\nMENSAJE ACTUAL (es el que hay que modificar; puede incluir retoques que Jose ya hizo a mano, respétalos):\n"""\n${d.respuesta}\n"""\n\nPETICIÓN DE JOSE: ${instruccion}\n${d.instruccion ? `(Instrucción anterior de Jose: ${d.instruccion})\n` : ""}${notas ? "" : `\nDATOS:\n${d.hechos || "No hay datos del niño."}`}`;
  const t = await gemini(WRITER_MODELS, sys, user, true, "minimal", { temp: 0.3, hedgeMs: 6000, timeoutMs: 20000 });
  return limpiarSalida(parseJson(t));
}

export function limpiarSalida(o: any): Salida {
  const respuesta = String(o?.respuesta || "").replace(/\r/g, "").replace(/\n{3,}/g, "\n\n").trim();
  if (!respuesta) throw new Error("vacio");
  const para = Array.isArray(o?.para_jose) ? o.para_jose.map((x: unknown) => String(x).replace(/\s+/g, " ").trim().slice(0, 200)).filter(Boolean).slice(0, 4) : [];
  return { respuesta: respuesta.slice(0, 3000), para_jose: para, delicado: o?.delicado === true };
}

// ---------- Respuesta al cliente ----------------------------------------------------------------------------

type Cont =
  | { kind: "padre_pick"; alumno_id: string; mensaje: string; instruccion: string | null }
  | { kind: "padre_sin_datos"; mensaje: string; instruccion: string | null }
  | { kind: "padre_ajustar"; modo: string; draft: Draft };
type Choice = { label: string; continuation: Cont };

const AJUSTES: Record<string, { label: string; texto: string }> = {
  corto: { label: "Más corta", texto: "Hazla más corta y directa, sin perder lo importante." },
  calido: { label: "Más cálida", texto: "Hazla más cálida y cercana, sin alargarla mucho." },
  firme: { label: "Más firme", texto: "Hazla más firme y clara, manteniendo la educación." },
};

function ajustes(d: Draft): Choice[] {
  return Object.entries(AJUSTES).map(([modo, a]) => ({ label: a.label, continuation: { kind: "padre_ajustar", modo, draft: d } as Cont }));
}

function replyOk(out: Salida, d: Draft, extraNotas: string[], intro: string) {
  const notas = [...extraNotas, ...out.para_jose];
  const partes = [intro];
  if (out.delicado) partes.push("⚠️ Tema delicado: léala con calma antes de enviarla.");
  if (notas.length) partes.push("Para tener en cuenta:\n" + notas.map((n) => `• ${n}`).join("\n"));
  return J({
    ok: true, handled: true,
    answer: partes.join("\n\n"),
    respuesta_familia: { texto: out.respuesta },
    padre_draft: { ...d, respuesta: out.respuesta },
    choices: ajustes({ ...d, respuesta: out.respuesta }),
    alta_draft: null, secretary_changed: false, alta_changed: false, actions: [], silent: false,
  });
}

function replyTxt(answer: string, choices: Choice[] = []) {
  return J({ ok: true, handled: true, answer, choices, alta_draft: null, secretary_changed: false, alta_changed: false, actions: [], silent: false });
}

async function generar(mensaje: string, instruccion: string | null, hechos: Hechos | null, notas: string[]) {
  const out = await redactar(mensaje, instruccion, hechos?.texto || "", await cargarAprendizaje(mensaje, "respuesta", "familias"));
  const d: Draft = { mensaje, respuesta: out.respuesta, hechos: hechos?.texto || "", nino: hechos?.nino || null, instruccion, modo: "respuesta", destino: "familias" };
  const intro = hechos?.nino
    ? `Aquí tiene la respuesta para la familia de ${hechos.nino}, señor Cubero. Está lista para copiar.`
    : "Aquí tiene la respuesta para la familia, señor Cubero. Está lista para copiar.";
  return replyOk(out, d, notas, intro);
}

async function generarNotas(notas: string, destino: Destino) {
  const out = await redactarNotas(notas, destino, await cargarAprendizaje(notas, "notas", destino));
  const d: Draft = { mensaje: notas, respuesta: out.respuesta, hechos: "", nino: null, instruccion: null, modo: "notas", destino };
  const quien = destino === "entrenadores" ? "los entrenadores" : "las familias";
  return replyOk(out, d, [], `Aquí tiene el mensaje para ${quien}, señor Cubero. Está listo para copiar.`);
}

// ---------- Servidor ----------------------------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (!U || !K || !S || !G) return J({ ok: false, error: "Servicio no disponible." }, 503);
  try {
    const uid = await authorize(req);
    if (!uid) return J({ ok: false, error: "Acceso restringido a coordinador_jefe." }, 403);
    if (req.method === "GET") return J({ ok: true, handled: true, access: "coordinador_jefe" });
    if (req.method !== "POST") return J({ ok: false, error: "Método no permitido." }, 405);
    const b = await req.json().catch(() => ({}));

    // 0) Acciones de la seccion "Respuestas" (aprendizaje)
    if (typeof b.action === "string" && b.action) {
      try { return await accion(b, uid); } catch (e) {
        console.error("mitico-paco-padres accion", e);
        return J({ ok: false, error: "No he podido guardar o leer lo aprendido ahora mismo." }, 500);
      }
    }

    // 1) Botones
    const c = b.continuation;
    if (c && typeof c === "object") {
      try {
        if (c.kind === "padre_ajustar") {
          const d = cleanDraft(c.draft);
          const aj = AJUSTES[String(c.modo)];
          if (!d || !aj) return J({ ok: true, handled: false });
          const out = await reescribir(d, aj.texto, await cargarAprendizaje(d.mensaje, d.modo, d.destino));
          return replyOk(out, { ...d, respuesta: out.respuesta }, [], "Hecho, señor Cubero. Aquí tiene la nueva versión.");
        }
        if (c.kind === "padre_pick") {
          const mensaje = String(c.mensaje || "").slice(0, 4000);
          if (!mensaje || !UUID.test(String(c.alumno_id || ""))) return J({ ok: true, handled: false });
          const rows = await admin(`/rest/v1/alumnos?select=id,nombre_completo,fecha_nacimiento,seccion_principal,nivel_actual_id,nivel_estimado_id&id=eq.${encodeURIComponent(String(c.alumno_id))}&activo=eq.true&limit=1`);
          const s: Student | undefined = Array.isArray(rows) ? rows[0] : undefined;
          const h = s ? await buildHechos(s) : null;
          return await generar(mensaje, c.instruccion ? String(c.instruccion).slice(0, 400) : null, h, s ? [] : ["No he encontrado esa ficha; respuesta sin datos del niño."]);
        }
        if (c.kind === "padre_sin_datos") {
          const mensaje = String(c.mensaje || "").slice(0, 4000);
          if (!mensaje) return J({ ok: true, handled: false });
          return await generar(mensaje, c.instruccion ? String(c.instruccion).slice(0, 400) : null, null, ["Respuesta sin datos del niño."]);
        }
      } catch (e) {
        console.error("mitico-paco-padres cont", e);
        return replyTxt("No he podido redactar la respuesta ahora mismo. Inténtelo de nuevo en un momento.");
      }
      return J({ ok: true, handled: false });
    }

    // 2) Mensaje de texto
    const msg = typeof b.message === "string" ? b.message.trim() : "";
    if (!msg) return J({ ok: false, error: "Escribe un mensaje." }, 400);
    const prev = cleanDraft(b.padre_draft);

    if (prev && (b.revision === true || (!isExplicit(msg) && isRevision(msg)))) {
      try {
        const out = await reescribir(prev, msg, await cargarAprendizaje(prev.mensaje, prev.modo, prev.destino));
        return replyOk(out, { ...prev, respuesta: out.respuesta }, [], "Hecho, señor Cubero. Aquí tiene la nueva versión.");
      } catch (e) {
        console.error("mitico-paco-padres rev", e);
        return replyTxt("No he podido ajustar la respuesta ahora mismo. Inténtelo de nuevo.");
      }
    }

    // Seccion "Respuestas": Jose pega notas sueltas para convertirlas en un mensaje.
    if (b.modo === "notas") {
      try { return await generarNotas(msg.slice(0, 4000), destinoDe(b.destino)); } catch (e) {
        console.error("mitico-paco-padres notas", e);
        return replyTxt("No he podido redactar el mensaje ahora mismo (el servicio de IA no ha respondido). Inténtelo de nuevo en un momento.");
      }
    }

    // Desde la seccion "Respuestas" siempre es un mensaje de familia (b.forzar).
    const explicit = isExplicit(msg) || b.forzar === true;
    if (!explicit && !looksParent(msg)) return J({ ok: true, handled: false });

    let rt: Route | null = null;
    try { rt = await route(msg); } catch (e) { console.error("mitico-paco-padres route", e); }
    if (!explicit && rt?.es_mensaje_familia !== true) return J({ ok: true, handled: false });

    const mensaje = String(rt?.mensaje_familia || msg).trim().slice(0, 4000);
    const instruccion = rt?.instruccion ? String(rt.instruccion).slice(0, 400) : null;
    const nombres = (Array.isArray(rt?.ninos) ? (rt!.ninos as unknown[]) : []).map((x) => String(x).slice(0, 80)).filter(Boolean).slice(0, 3);

    try {
      let hechos: Hechos | null = null;
      const notas: string[] = [];
      if (nombres.length) {
        const m = matchStudents(nombres, await loadRoster());
        if (m.ambiguos.length && !m.unicos.length) {
          const amb = m.ambiguos[0];
          const td = todayMadrid();
          const choices: Choice[] = amb.cands.slice(0, 5).map((s) => {
            const e = ageAt(s.fecha_nacimiento, td);
            const sec = sectionLabel(s.seccion_principal);
            return {
              label: `${s.nombre_completo}${e !== null ? ` · ${e} años` : ""}${sec ? ` · ${sec}` : ""}`.slice(0, 70),
              continuation: { kind: "padre_pick", alumno_id: s.id, mensaje, instruccion } as Cont,
            };
          });
          choices.push({ label: "Responder sin datos del niño", continuation: { kind: "padre_sin_datos", mensaje, instruccion } as Cont });
          return replyTxt(`Hay varios niños que encajan con «${amb.nombre}», señor Cubero. ¿De cuál habla la familia? Así uso sus datos reales y no invento nada.`, choices);
        }
        if (m.unicos.length) {
          hechos = await buildHechos(m.unicos[0]);
          if (m.unicos.length > 1) {
            const resto = await Promise.all(m.unicos.slice(1, 3).map((s) => buildHechos(s)));
            hechos = { texto: [hechos.texto, ...resto.map((r) => r.texto)].join("\n\n"), nino: [hechos.nino, ...resto.map((r) => r.nino)].filter(Boolean).join(" y ") };
          }
          if (m.ambiguos.length) notas.push(`Hay otro niño mencionado («${m.ambiguos[0].nombre}») que no he podido identificar: sin sus datos.`);
        } else if (m.sinMatch.length) {
          notas.push(`No he encontrado a «${m.sinMatch[0]}» entre los alumnos activos: respuesta sin datos del niño.`);
        }
      }
      return await generar(mensaje, instruccion, hechos, notas);
    } catch (e) {
      console.error("mitico-paco-padres gen", e);
      return replyTxt("No he podido redactar la respuesta ahora mismo (el servicio de IA no ha respondido). Inténtelo de nuevo en un momento.");
    }
  } catch (e) {
    console.error("mitico-paco-padres", e);
    return J({ ok: false, error: "No he podido preparar la respuesta para la familia." }, 500);
  }
});
