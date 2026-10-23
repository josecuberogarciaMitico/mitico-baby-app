import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { pedirIA } from "./ia.ts";

// ---------------------------------------------------------------------------
// mitico-paco-altas
// Altas de test de nivel inicial por texto o voz, con CONFIRMACION obligatoria.
//
//  - Crear un alta (crear_alta_nivel_inicial_app) tras comprobar duplicados.
//  - Avisar cuando una familia ha respondido el test (estado RESPONDIDO) y
//    ofrecer validar el nivel y anadirla a los listados.
//  - Consultar como van las altas.
//  - Preparar el WhatsApp para la familia (el boton lo abre el navegador y el
//    usuario pulsa Enviar en WhatsApp: Paco NO envia mensajes por su cuenta).
//
// Todas las escrituras usan las funciones SQL que ya usa la app, llamadas con
// el token del propio usuario (nunca con service_role), asi que se aplican sus
// mismos permisos. Aislada de mitico-paco-api y mitico-paco-secretaria.
// Solo coordinador_jefe.
// ---------------------------------------------------------------------------

const U = Deno.env.get("SUPABASE_URL") || "";
const K = Deno.env.get("SUPABASE_ANON_KEY") || "";
const G = Deno.env.get("GEMINI_API_KEY") || "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

type Modalidad = "BABY" | "OCIO" | "INTENSIVOS";
type DiaOcio = "Jueves" | "Sábado" | "Domingo";
type Draft = {
  nombre: string | null;
  fecha_nacimiento: string | null;
  modalidad: Modalidad | null;
  telefono: string | null;
  dia_ocio: DiaOcio | null;
};
type Cont =
  | { kind: "alta_create_confirm"; draft: Draft }
  | { kind: "alta_cancel" }
  | { kind: "alta_dismiss"; id: string | null }
  | { kind: "alta_open"; id: string }
  | { kind: "alta_pick_level"; id: string }
  | { kind: "alta_validate_add"; id: string; nivel: string | null }
  | { kind: "alta_add"; id: string; alumno_existente_id: string | null; confirmar_nuevo: boolean }
  | { kind: "alta_whatsapp"; id: string }
  | { kind: "alta_mark_sent"; id: string };
type Choice = { label: string; continuation: Cont };
type Accion = { type: "whatsapp"; alta_id: string; nombre: string; telefono: string; token: string };
type Result = {
  answer: string;
  choices: Choice[];
  draft: Draft | null;
  changed?: boolean;
  actions?: Accion[];
  silent?: boolean;
};

const MODALIDAD_LABEL: Record<string, string> = { BABY: "Baby", OCIO: "Ocio", INTENSIVOS: "Intensivos" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function J(x: unknown, s = 200) {
  return new Response(JSON.stringify(x), {
    status: s,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}

function norm(x: unknown) {
  return String(x ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9+ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function todayMadrid() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function fmtDate(iso: string | null | undefined) {
  const [y, m, d] = String(iso || "").slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : String(iso || "");
}

function ageOf(birth: string | null | undefined) {
  const [by, bm, bd] = String(birth || "").slice(0, 10).split("-").map(Number);
  const [y, m, d] = todayMadrid().split("-").map(Number);
  if (!by || !bm || !bd) return null;
  let a = y - by;
  if (m < bm || (m === bm && d < bd)) a--;
  return a;
}

function agePhrase(birth: string | null | undefined) {
  const a = ageOf(birth);
  if (a === null) return "";
  if (a < 1) return " (menos de 1 año)";
  return ` (${a} ${a === 1 ? "año" : "años"})`;
}

// ---------- Saneado de datos del borrador -----------------------------------

function cleanName(x: unknown): string | null {
  const s = String(x ?? "").replace(/\s+/g, " ").trim().slice(0, 120);
  if (!s) return null;
  // Se necesita al menos nombre y un apellido.
  return s.split(" ").filter(Boolean).length >= 2 ? s.toUpperCase() : null;
}

function cleanDate(x: unknown): string | null {
  const s = String(x ?? "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, d] = s.split("-").map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d));
  if (dt.getUTCFullYear() !== y || dt.getUTCMonth() !== m - 1 || dt.getUTCDate() !== d) return null;
  if (y < 1990 || s > todayMadrid()) return null;
  return s;
}

function cleanPhone(x: unknown): string | null {
  const raw = String(x ?? "").trim();
  const digits = raw.replace(/\D/g, "");
  if (digits.length < 9 || digits.length > 15) return null;
  return raw.startsWith("+") ? `+${digits}` : digits;
}

function cleanMod(x: unknown): Modalidad | null {
  const s = norm(x);
  if (s === "BABY") return "BABY";
  if (s === "OCIO") return "OCIO";
  if (s === "INTENSIVOS" || s === "INTENSIVO") return "INTENSIVOS";
  return null;
}

function cleanDia(x: unknown): DiaOcio | null {
  const s = norm(x);
  if (s === "JUEVES") return "Jueves";
  if (s === "SABADO") return "Sábado";
  if (s === "DOMINGO") return "Domingo";
  return null;
}

function cleanDraft(d: any): Draft {
  const modalidad = cleanMod(d?.modalidad);
  return {
    nombre: cleanName(d?.nombre),
    fecha_nacimiento: cleanDate(d?.fecha_nacimiento),
    modalidad,
    telefono: cleanPhone(d?.telefono),
    dia_ocio: modalidad === "OCIO" ? cleanDia(d?.dia_ocio) : null,
  };
}

function emptyDraft(): Draft {
  return { nombre: null, fecha_nacimiento: null, modalidad: null, telefono: null, dia_ocio: null };
}

function missingOf(d: Draft) {
  const out: string[] = [];
  if (!d.nombre) out.push("nombre y apellidos");
  if (!d.fecha_nacimiento) out.push("fecha de nacimiento");
  if (!d.modalidad) out.push("modalidad (Baby, Ocio o Intensivos)");
  if (!d.telefono) out.push("teléfono de la familia");
  if (d.modalidad === "OCIO" && !d.dia_ocio) out.push("día fijo de Ocio (jueves, sábado o domingo)");
  return out;
}

function listEs(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} y ${items[items.length - 1]}`;
}

function draftLines(d: Draft) {
  const lines: string[] = [];
  if (d.nombre) lines.push(`• Nombre: ${d.nombre}`);
  if (d.fecha_nacimiento) lines.push(`• Nacimiento: ${fmtDate(d.fecha_nacimiento)}${agePhrase(d.fecha_nacimiento)}`);
  if (d.modalidad) lines.push(`• Modalidad: ${MODALIDAD_LABEL[d.modalidad]}`);
  if (d.telefono) lines.push(`• Teléfono: ${d.telefono}`);
  if (d.modalidad === "OCIO" && d.dia_ocio) lines.push(`• Día fijo de Ocio: ${d.dia_ocio}`);
  return lines;
}

// ---------- Acceso a Supabase con el token del usuario ------------------------

async function rest(authz: string, path: string) {
  const r = await fetch(U + path, { headers: { apikey: K, Authorization: authz, Accept: "application/json" } });
  const tx = await r.text();
  let d: any = null;
  try { d = tx ? JSON.parse(tx) : null; } catch { d = tx; }
  if (!r.ok) throw new Error(`DB ${r.status}: ${String(tx).slice(0, 160)}`);
  return d;
}

class RpcError extends Error {}

async function rpc(authz: string, name: string, args: Record<string, unknown> = {}) {
  const r = await fetch(`${U}/rest/v1/rpc/${name}`, {
    method: "POST",
    headers: { apikey: K, Authorization: authz, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(args),
  });
  const tx = await r.text();
  let d: any = null;
  try { d = tx ? JSON.parse(tx) : null; } catch { d = tx; }
  if (!r.ok) {
    const msg = d && typeof d === "object" && d.message ? String(d.message) : String(tx).slice(0, 200);
    throw new RpcError(msg);
  }
  return d;
}

async function authorize(req: Request) {
  const a = req.headers.get("Authorization") || "";
  if (!a.startsWith("Bearer ")) return null;
  const ur = await fetch(U + "/auth/v1/user", { headers: { apikey: K, Authorization: a } });
  if (!ur.ok) return null;
  const u = await ur.json();
  if (!u?.id) return null;
  const rows = await rest(
    a,
    `/rest/v1/usuarios_app?select=id,nombre,rol&auth_user_id=eq.${encodeURIComponent(String(u.id))}&activo=eq.true&limit=1`,
  );
  const p = Array.isArray(rows) ? rows[0] : null;
  return p?.rol === "coordinador_jefe" ? { authz: a } : null;
}

// ---------- IA (solo para entender la frase) -----------------------------------

type Route = {
  action?: string;
  nombre?: string | null;
  fecha_nacimiento?: string | null;
  modalidad?: string | null;
  telefono?: string | null;
  dia_ocio?: string | null;
  alta_query?: string | null;
};

async function route(text: string, draft: Draft | null): Promise<Route> {
  const sys = `Eres el enrutador de las ALTAS DE TEST DE NIVEL INICIAL de una escuela de natación y esquí (Mítico Baby). Fecha de hoy (Madrid): ${todayMadrid()}. Devuelve SOLO JSON con: action, nombre, fecha_nacimiento, modalidad, telefono, dia_ocio, alta_query.

action:
- alta_create: el usuario quiere crear/apuntar/dar de alta un test de nivel inicial NUEVO para un niño, o está aportando datos para completar uno en curso.
- alta_status: pregunta cómo van los tests/altas, si hay respondidos, pendientes, etc.
- alta_process: quiere validar el nivel o añadir a los listados el alta de un niño concreto (pon su nombre en alta_query).
- alta_send: quiere enviar/mandar el test (el enlace) por WhatsApp a la familia de un niño (pon su nombre en alta_query; si no dice cuál, alta_query null).
- alta_cancel: quiere cancelar el alta que se está preparando.
- not_altas: cualquier otra cosa. Importante: "alta tardía", "alumno fuera de plazo", altas de un grupo o reservas NO son altas de test: devuelve not_altas.

Datos (solo si el usuario los dice explícitamente; si no, null; no inventes):
- nombre: nombre y apellidos del niño.
- fecha_nacimiento: YYYY-MM-DD. Interpreta "3 de mayo de 2021", "3/5/21", "03-05-2021" (formato día/mes/año).
- modalidad: BABY, OCIO o INTENSIVOS.
- telefono: el número de la familia, solo dígitos (y + si lo dice). Si lo dicta con espacios o palabras, júntalo.
- dia_ocio: Jueves, Sábado o Domingo (solo Ocio).
${draft ? `\nHAY UN ALTA EN PREPARACIÓN con estos datos ya recogidos: ${JSON.stringify(draft)}. Si el mensaje aporta datos que faltan o corrige alguno, devuelve action alta_create con TODOS los campos (los ya recogidos más los nuevos). Si no tiene que ver con el alta, not_altas.` : ""}`;

  // IA compartida (./ia.ts): Cloudflare rápido → Gemini sin «pensar».
  const r = await pedirIA({ system: sys, user: text, json: true, nivel: "rapido", maxTokens: 600 });
  return JSON.parse(r.texto);
}

// Palabras que activan esta funcion. Sin ellas ni borrador, ni se llama a Gemini.
function looksLikeAlta(text: string) {
  const n = norm(text);
  return /\bALTAS?\b/.test(n) || /\bTESTS?\b/.test(n) || n.includes("NIVEL INICIAL");
}

// ---------- Mensajes y botones ---------------------------------------------------

function friendlyError(e: unknown) {
  const msg = e instanceof Error ? e.message : String(e);
  return e instanceof RpcError ? msg : "ha habido un problema técnico";
}

async function loadAltas(authz: string): Promise<any[]> {
  const d = await rpc(authz, "obtener_altas_nivel_inicial_app");
  return Array.isArray(d) ? d : [];
}

async function loadLevels(authz: string): Promise<string[]> {
  const d = await rest(authz, "/rest/v1/niveles?select=codigo,orden&activo=eq.true&order=orden.asc&limit=40");
  return (Array.isArray(d) ? d : []).map((x: any) => String(x.codigo));
}

function dismissChoice(id: string | null): Choice {
  return { label: "Ahora no", continuation: { kind: "alta_dismiss", id } };
}

// Mensaje + botones para un alta respondida (o ya validada).
function proposal(a: any, levels: string[]): { answer: string; choices: Choice[] } {
  const id = String(a.id);
  const mod = MODALIDAD_LABEL[String(a.modalidad)] || String(a.modalidad);
  const head = `${a.nombre_completo} · ${mod}${a.modalidad === "OCIO" && a.ocio_dia_fijo ? ` (${a.ocio_dia_fijo})` : ""}${agePhrase(a.fecha_nacimiento)}`;

  if (a.estado === "VALIDADO") {
    return {
      answer: `Señor Cubero, ${head} ya tiene el nivel validado (${a.nivel_validado || "sin nivel"}) pero aún no está en los listados. ¿La añado?`,
      choices: [
        { label: `Sí, añadir a los listados`, continuation: { kind: "alta_validate_add", id, nivel: null } },
        dismissChoice(id),
      ],
    };
  }

  const nivel = a.nivel_propuesto ? String(a.nivel_propuesto) : null;
  const conf = a.nivel_propuesto_confianza ? ` (confianza ${String(a.nivel_propuesto_confianza).toLowerCase()})` : "";
  const motivo = a.nivel_propuesto_motivo ? ` Motivo: ${String(a.nivel_propuesto_motivo).replace(/\s+/g, " ").slice(0, 220)}` : "";
  const aviso = a.requiere_revision_jefe ? " ⚠️ Marcada para que usted la revise: conviene mirarla con calma." : "";
  const extra = a.observaciones_familia ? ` La familia comenta: “${String(a.observaciones_familia).replace(/\s+/g, " ").slice(0, 160)}”.` : "";

  if (!nivel) {
    return {
      answer: `Señor Cubero, ${head} ha respondido el test, pero no hay un nivel propuesto.${extra} Elija usted el nivel y, si quiere, lo valido y la añado.`,
      choices: [{ label: "Elegir nivel", continuation: { kind: "alta_pick_level", id } }, dismissChoice(id)],
    };
  }

  const accion = a.modalidad === "INTENSIVOS" ? `validar el nivel ${nivel}` : `validar el nivel ${nivel} y añadirla a los listados`;
  return {
    answer: `Señor Cubero, ${head} ha respondido el test. Mi propuesta de nivel: ${nivel}${conf}.${motivo}${extra}${aviso}\n\n¿Quiere que la deje en ${nivel}? Si dice que sí, voy a ${accion}.${a.modalidad === "INTENSIVOS" ? " El intensivo lo elige usted en Altas / Test." : ""}`,
    choices: [
      {
        label: a.modalidad === "INTENSIVOS" ? `Sí, validar ${nivel}` : `Sí, validar ${nivel} y añadir`,
        continuation: { kind: "alta_validate_add", id, nivel },
      },
      { label: "Elegir otro nivel", continuation: { kind: "alta_pick_level", id } },
      dismissChoice(id),
    ],
  };
}

// ---------- Flujos --------------------------------------------------------------

async function createFlow(authz: string, rt: Route, prev: Draft | null): Promise<Result> {
  const base = prev || emptyDraft();
  const incoming = cleanDraft(rt);
  const merged: Draft = {
    nombre: incoming.nombre || base.nombre,
    fecha_nacimiento: incoming.fecha_nacimiento || base.fecha_nacimiento,
    modalidad: incoming.modalidad || base.modalidad,
    telefono: incoming.telefono || base.telefono,
    dia_ocio: incoming.dia_ocio || base.dia_ocio,
  };
  if (merged.modalidad !== "OCIO") merged.dia_ocio = null;

  // Avisos honestos cuando el usuario dijo algo pero no era valido.
  const warns: string[] = [];
  if (rt.nombre && !incoming.nombre && !base.nombre) warns.push("necesito nombre y al menos un apellido");
  if (rt.fecha_nacimiento && !incoming.fecha_nacimiento) warns.push("la fecha de nacimiento no me cuadra (¿día, mes y año?)");
  if (rt.telefono && !incoming.telefono) warns.push("el teléfono debe tener al menos 9 dígitos");

  const missing = missingOf(merged);
  if (missing.length) {
    const have = draftLines(merged);
    const cab = have.length ? `Esto es lo que llevo:\n${have.join("\n")}\n\n` : "";
    const w = warns.length ? ` Ojo: ${warns.join("; ")}.` : "";
    return {
      answer: `${cab}Me falta: ${listEs(missing)}.${w} Dígamelo y sigo.`,
      choices: [{ label: "Cancelar alta", continuation: { kind: "alta_cancel" } }],
      draft: merged,
    };
  }

  let dup = "";
  try {
    const m = await rpc(authz, "comprobar_posibles_alumnos_nueva_alta_app", {
      p_nombre_completo: merged.nombre,
      p_fecha_nacimiento: merged.fecha_nacimiento,
    });
    if (Array.isArray(m) && m.length) {
      const lines = m.slice(0, 5).map((x: any) => {
        const donde = x.fuente === "ALTA_TEST" ? `alta de test${x.estado ? ` (${x.estado})` : ""}` : "ficha existente";
        const niv = x.nivel_actual ? ` · nivel ${x.nivel_actual}` : "";
        const nac = x.fecha_nacimiento ? ` · ${fmtDate(x.fecha_nacimiento)}` : "";
        return `  – ${x.alumno}${nac}${niv} → ${donde}${x.motivo === "NOMBRE_EXACTO" ? " (mismo nombre)" : " (parecida)"}`;
      });
      dup = `\n\n⚠️ Ya hay algo parecido:\n${lines.join("\n")}\nSi es el mismo niño, mejor cancele.`;
    }
  } catch (e) {
    dup = `\n\n(No he podido comprobar si ya existe: ${friendlyError(e)}.)`;
  }

  return {
    answer: `Voy a crear este alta de test, señor Cubero:\n${draftLines(merged).join("\n")}${dup}\n\nQuedará pendiente de envío en Altas / Test. ¿La creo?`,
    choices: [
      { label: "Sí, crear alta", continuation: { kind: "alta_create_confirm", draft: merged } },
      { label: "Cancelar", continuation: { kind: "alta_cancel" } },
    ],
    draft: merged,
  };
}

async function createConfirm(authz: string, draftIn: Draft): Promise<Result> {
  const d = cleanDraft(draftIn);
  const missing = missingOf(d);
  if (missing.length) {
    return { answer: `No puedo crearla: me falta ${listEs(missing)}.`, choices: [], draft: d };
  }
  let newId: string | null = null;
  try {
    const created = await rpc(authz, "crear_alta_nivel_inicial_app", {
      p_nombre_completo: d.nombre,
      p_fecha_nacimiento: d.fecha_nacimiento,
      p_modalidad: d.modalidad,
      p_telefono: d.telefono,
      p_ocio_dia_fijo: d.modalidad === "OCIO" ? d.dia_ocio : null,
    });
    if (typeof created === "string" && UUID.test(created)) newId = created;
  } catch (e) {
    return { answer: `No he podido crear el alta: ${friendlyError(e)}. No se ha guardado nada.`, choices: [], draft: null };
  }
  return {
    answer: `✅ Alta de test creada: ${d.nombre} (${MODALIDAD_LABEL[d.modalidad!]}). Está pendiente de envío.${newId ? " ¿Le preparo el WhatsApp para la familia? Usted solo tendrá que pulsar Enviar." : " Puede enviarla desde Altas / Test."} Cuando la familia conteste, se lo aviso.`,
    choices: newId ? [{ label: "Preparar WhatsApp", continuation: { kind: "alta_whatsapp", id: newId } }] : [],
    draft: null,
    changed: true,
  };
}

async function statusFlow(authz: string): Promise<Result> {
  const altas = await loadAltas(authz);
  const vivas = altas.filter((a) => !["ANADIDO", "DESCARTADO"].includes(String(a.estado)));
  if (!vivas.length) {
    return { answer: "No hay altas de test en marcha ahora mismo, señor Cubero.", choices: [], draft: null };
  }
  const etiqueta: Record<string, string> = {
    RESPONDIDO: "RESPONDIDO (esperando su visto bueno)",
    VALIDADO: "VALIDADO (falta añadir a listados)",
    ENVIADO: "enviado, esperando a la familia",
    PENDIENTE_ENVIO: "pendiente de enviar",
  };
  const lines = vivas.slice(0, 15).map((a) => {
    const niv = a.estado === "VALIDADO" ? ` · nivel ${a.nivel_validado || "?"}` : a.nivel_propuesto ? ` · propuesta ${a.nivel_propuesto}` : "";
    return `• ${a.nombre_completo} (${MODALIDAD_LABEL[String(a.modalidad)] || a.modalidad}) — ${etiqueta[String(a.estado)] || a.estado}${niv}`;
  });
  const revisar: Choice[] = vivas
    .filter((a) => ["RESPONDIDO", "VALIDADO"].includes(String(a.estado)))
    .slice(0, 4)
    .map((a) => ({ label: `Revisar: ${String(a.nombre_completo).slice(0, 40)}`, continuation: { kind: "alta_open", id: String(a.id) } as Cont }));
  const enviar: Choice[] = vivas
    .filter((a) => String(a.estado) === "PENDIENTE_ENVIO")
    .slice(0, 3)
    .map((a) => ({ label: `WhatsApp a ${String(a.nombre_completo).slice(0, 34)}`, continuation: { kind: "alta_whatsapp", id: String(a.id) } as Cont }));
  const choices: Choice[] = [...revisar, ...enviar];
  return { answer: `Así van las altas de test, señor Cubero:\n${lines.join("\n")}`, choices, draft: null };
}

async function processFlow(authz: string, query: string | null): Promise<Result> {
  const altas = await loadAltas(authz);
  const q = norm(query);
  const vivas = altas.filter((a) => !["ANADIDO", "DESCARTADO"].includes(String(a.estado)));
  let found = q ? vivas.filter((a) => norm(a.nombre_completo).includes(q) || q.split(" ").every((t) => norm(a.nombre_completo).split(" ").includes(t))) : [];
  if (!q) found = vivas.filter((a) => ["RESPONDIDO", "VALIDADO"].includes(String(a.estado)));
  if (!found.length) {
    return { answer: q ? `No encuentro ningún alta de test en marcha que coincida con “${query}”.` : "No hay ninguna alta lista para validar o añadir ahora mismo.", choices: [], draft: null };
  }
  if (found.length > 1) {
    return {
      answer: "He encontrado varias, ¿cuál quiere revisar?",
      choices: found.slice(0, 5).map((a) => ({ label: `${String(a.nombre_completo).slice(0, 40)} · ${a.estado}`, continuation: { kind: "alta_open", id: String(a.id) } as Cont })),
      draft: null,
    };
  }
  return openFlow(authz, String(found[0].id), altas);
}

async function openFlow(authz: string, id: string, loaded?: any[]): Promise<Result> {
  const altas = loaded || (await loadAltas(authz));
  const a = altas.find((x) => String(x.id) === id);
  if (!a) return { answer: "Esa alta ya no existe.", choices: [], draft: null };
  if (a.estado === "ANADIDO") return { answer: `${a.nombre_completo} ya está añadida a los listados.`, choices: [], draft: null };
  if (a.estado === "DESCARTADO") return { answer: `${a.nombre_completo} está descartada.`, choices: [], draft: null };
  if (!["RESPONDIDO", "VALIDADO"].includes(String(a.estado))) {
    return {
      answer: `${a.nombre_completo} todavía no ha respondido el test (estado: ${a.estado === "ENVIADO" ? "enviado, esperando a la familia" : "pendiente de enviar"}).`,
      choices: [],
      draft: null,
    };
  }
  const p = proposal(a, []);
  return { answer: p.answer, choices: p.choices, draft: null };
}

function validPhone(x: unknown) {
  const digits = String(x ?? "").replace(/\D/g, "");
  return digits.length >= 9 && digits.length <= 15;
}

// Prepara el boton de WhatsApp. El navegador lo abre y el usuario pulsa Enviar.
async function whatsappFlow(authz: string, id: string, loaded?: any[]): Promise<Result> {
  const altas = loaded || (await loadAltas(authz));
  const a = altas.find((x) => String(x.id) === id);
  if (!a) return { answer: "Esa alta ya no existe.", choices: [], draft: null };
  if (!["PENDIENTE_ENVIO", "ENVIADO"].includes(String(a.estado))) {
    const motivo = a.estado === "RESPONDIDO" || a.estado === "VALIDADO"
      ? "la familia ya ha respondido el test"
      : a.estado === "ANADIDO" ? "ya está añadida a los listados" : "está descartada";
    return { answer: `No hace falta enviarla: ${motivo} (${a.nombre_completo}).`, choices: [], draft: null };
  }
  if (!validPhone(a.telefono) || !UUID.test(String(a.token_publico || ""))) {
    return { answer: `No puedo preparar el WhatsApp de ${a.nombre_completo}: el teléfono no es válido. Corríjalo en Altas / Test.`, choices: [], draft: null };
  }
  const reenvio = a.estado === "ENVIADO" ? " Ya se había enviado antes; esto sería un reenvío." : "";
  return {
    answer: `Listo, señor Cubero. Pulse el botón y se abre WhatsApp con el mensaje preparado para la familia de ${a.nombre_completo} (${String(a.telefono).trim()}). Allí solo le queda darle a Enviar.${reenvio}`,
    choices: [],
    draft: null,
    actions: [{
      type: "whatsapp",
      alta_id: String(a.id),
      nombre: String(a.nombre_completo),
      telefono: String(a.telefono).trim(),
      token: String(a.token_publico),
    }],
  };
}

async function sendFlow(authz: string, query: string | null): Promise<Result> {
  const altas = await loadAltas(authz);
  const q = norm(query);
  const candidatas = altas.filter((a) => ["PENDIENTE_ENVIO", "ENVIADO"].includes(String(a.estado)));
  let found = candidatas;
  if (q) found = candidatas.filter((a) => norm(a.nombre_completo).includes(q) || q.split(" ").every((t) => norm(a.nombre_completo).split(" ").includes(t)));
  else found = candidatas.filter((a) => String(a.estado) === "PENDIENTE_ENVIO");
  if (!found.length) {
    return { answer: q ? `No encuentro ningún test pendiente de enviar que coincida con “${query}”.` : "No hay ningún test pendiente de enviar ahora mismo, señor Cubero.", choices: [], draft: null };
  }
  if (found.length > 1) {
    return {
      answer: "¿A cuál le preparo el WhatsApp?",
      choices: found.slice(0, 5).map((a) => ({ label: `${String(a.nombre_completo).slice(0, 36)}${a.estado === "ENVIADO" ? " (reenviar)" : ""}`, continuation: { kind: "alta_whatsapp", id: String(a.id) } as Cont })),
      draft: null,
    };
  }
  return whatsappFlow(authz, String(found[0].id), altas);
}

async function markSent(authz: string, id: string): Promise<Result> {
  try {
    await rpc(authz, "marcar_alta_nivel_enviada_app", { p_id: id });
  } catch (e) {
    return { answer: `Ojo: se ha abierto WhatsApp, pero no he podido marcar el test como enviado (${friendlyError(e)}). Márquelo desde Altas / Test.`, choices: [], draft: null };
  }
  return { answer: "", choices: [], draft: null, changed: true, silent: true };
}

async function pickLevel(authz: string, id: string): Promise<Result> {
  const levels = await loadLevels(authz);
  if (!levels.length) return { answer: "No he podido cargar los niveles.", choices: [], draft: null };
  return {
    answer: "¿Qué nivel le pongo?",
    choices: [
      ...levels.map((n) => ({ label: n, continuation: { kind: "alta_validate_add", id, nivel: n } as Cont })),
      dismissChoice(id),
    ],
    draft: null,
  };
}

async function validateAdd(authz: string, id: string, nivel: string | null): Promise<Result> {
  const altas = await loadAltas(authz);
  const a = altas.find((x) => String(x.id) === id);
  if (!a) return { answer: "Esa alta ya no existe.", choices: [], draft: null };
  if (a.estado === "ANADIDO") return { answer: `${a.nombre_completo} ya estaba añadida a los listados.`, choices: [], draft: null };
  if (a.estado === "DESCARTADO") return { answer: `${a.nombre_completo} está descartada; no la toco.`, choices: [], draft: null };

  let changed = false;
  let nivelFinal = String(a.nivel_validado || "");

  if (a.estado === "RESPONDIDO") {
    const levels = await loadLevels(authz);
    const elegido = nivel ? levels.find((l) => norm(l) === norm(nivel)) : a.nivel_propuesto ? levels.find((l) => norm(l) === norm(a.nivel_propuesto)) : null;
    if (!elegido) return pickLevel(authz, id);
    try {
      await rpc(authz, "validar_alta_nivel_inicial_app", { p_id: id, p_nivel_codigo: elegido });
    } catch (e) {
      return { answer: `No he podido validar el nivel: ${friendlyError(e)}. No he cambiado nada.`, choices: [], draft: null };
    }
    changed = true;
    nivelFinal = elegido;
  } else if (a.estado !== "VALIDADO") {
    return { answer: `${a.nombre_completo} todavía no ha respondido el test.`, choices: [], draft: null };
  }

  if (a.modalidad === "INTENSIVOS") {
    return {
      answer: `✅ Nivel ${nivelFinal} validado para ${a.nombre_completo}. Es de Intensivos: el intensivo al que va lo elige usted en Altas / Test, que yo ahí todavía no me meto.`,
      choices: [],
      draft: null,
      changed,
    };
  }

  // Coincidencias con fichas existentes: si hay dudas, se pregunta.
  let coin: any[] = [];
  try {
    const c = await rpc(authz, "obtener_coincidencias_alta_nivel_inicial_app", { p_id: id });
    coin = Array.isArray(c) ? c : [];
  } catch { coin = []; }
  const exacta = coin.find((x) => x.tipo_coincidencia === "EXACTA");
  const parecidas = coin.filter((x) => x.tipo_coincidencia !== "EXACTA");
  if (!exacta && parecidas.length) {
    return {
      answer: `${changed ? `Nivel ${nivelFinal} validado. ` : ""}Antes de añadir a ${a.nombre_completo}: hay fichas con el mismo nombre parecido y la misma fecha de nacimiento. ¿Es alguno de ellos o es un alumno nuevo?`,
      choices: [
        ...parecidas.slice(0, 4).map((x) => ({
          label: `Es ${String(x.alumno).slice(0, 36)}${x.nivel_actual ? ` (${x.nivel_actual})` : ""}`,
          continuation: { kind: "alta_add", id, alumno_existente_id: String(x.alumno_id), confirmar_nuevo: false } as Cont,
        })),
        { label: "Es un alumno nuevo", continuation: { kind: "alta_add", id, alumno_existente_id: null, confirmar_nuevo: true } },
        dismissChoice(id),
      ],
      draft: null,
      changed,
    };
  }

  return addFlow(authz, id, exacta ? String(exacta.alumno_id) : null, false, a, changed ? nivelFinal : null);
}

async function addFlow(
  authz: string,
  id: string,
  existente: string | null,
  nuevo: boolean,
  known?: any,
  nivelValidadoAhora?: string | null,
): Promise<Result> {
  let a = known;
  if (!a) a = (await loadAltas(authz)).find((x) => String(x.id) === id);
  if (!a) return { answer: "Esa alta ya no existe.", choices: [], draft: null };
  const pre = nivelValidadoAhora ? `Nivel ${nivelValidadoAhora} validado. ` : "";
  try {
    await rpc(authz, "anadir_alta_nivel_inicial_resuelta_app", {
      p_id: id,
      p_intensivo_id: null,
      p_alumno_existente_id: existente && UUID.test(existente) ? existente : null,
      p_confirmar_nuevo: nuevo,
    });
  } catch (e) {
    return {
      answer: `${pre}No he podido añadirla a los listados: ${friendlyError(e)}. Puede terminarlo desde Altas / Test.`,
      choices: [],
      draft: null,
      changed: Boolean(nivelValidadoAhora),
    };
  }
  const mod = MODALIDAD_LABEL[String(a.modalidad)] || a.modalidad;
  return {
    answer: `✅ ${pre}${a.nombre_completo} añadida a los listados (${mod}${existente ? ", enlazada con su ficha existente" : ""}).`,
    choices: [],
    draft: null,
    changed: true,
  };
}

// ---------- Continuaciones (botones) ---------------------------------------------

function parseCont(x: any): Cont | null {
  if (!x || typeof x !== "object") return null;
  switch (x.kind) {
    case "alta_create_confirm":
      return { kind: x.kind, draft: cleanDraft(x.draft) };
    case "alta_cancel":
      return { kind: x.kind };
    case "alta_dismiss":
      return { kind: x.kind, id: UUID.test(String(x.id || "")) ? String(x.id) : null };
    case "alta_open":
    case "alta_pick_level":
    case "alta_whatsapp":
    case "alta_mark_sent":
      return UUID.test(String(x.id || "")) ? { kind: x.kind, id: String(x.id) } : null;
    case "alta_validate_add":
      return UUID.test(String(x.id || ""))
        ? { kind: x.kind, id: String(x.id), nivel: x.nivel ? String(x.nivel).slice(0, 12) : null }
        : null;
    case "alta_add":
      return UUID.test(String(x.id || ""))
        ? {
          kind: x.kind,
          id: String(x.id),
          alumno_existente_id: UUID.test(String(x.alumno_existente_id || "")) ? String(x.alumno_existente_id) : null,
          confirmar_nuevo: x.confirmar_nuevo === true,
        }
        : null;
    default:
      return null;
  }
}

async function runCont(c: Cont, authz: string): Promise<Result> {
  switch (c.kind) {
    case "alta_create_confirm":
      return createConfirm(authz, c.draft);
    case "alta_cancel":
      return { answer: "Hecho, señor Cubero, alta cancelada. No he guardado nada.", choices: [], draft: null };
    case "alta_dismiss":
      return {
        answer: "Sin problema, señor Cubero. Cuando quiera me dice «añade a …» y lo dejamos listo.",
        choices: [],
        draft: null,
      };
    case "alta_open":
      return openFlow(authz, c.id);
    case "alta_pick_level":
      return pickLevel(authz, c.id);
    case "alta_validate_add":
      return validateAdd(authz, c.id, c.nivel);
    case "alta_add":
      return addFlow(authz, c.id, c.alumno_existente_id, c.confirmar_nuevo);
    case "alta_whatsapp":
      return whatsappFlow(authz, c.id);
    case "alta_mark_sent":
      return markSent(authz, c.id);
  }
}

// ---------- Servidor --------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (!U || !K || !G) return J({ ok: false, error: "Servicio no disponible." }, 503);

  try {
    const c = await authorize(req);
    if (!c) return J({ ok: false, error: "Acceso restringido a coordinador_jefe." }, 403);
    if (req.method === "GET") return J({ ok: true, handled: true, access: "coordinador_jefe" });
    if (req.method !== "POST") return J({ ok: false, error: "Método no permitido." }, 405);

    const b = await req.json().catch(() => ({}));

    // 1) Botones.
    if (b.continuation) {
      const cont = parseCont(b.continuation);
      if (!cont) return J({ ok: true, handled: false });
      const r = await runCont(cont, c.authz);
      return J({ ok: true, handled: true, answer: r.answer, choices: r.choices, alta_draft: r.draft, secretary_changed: false, alta_changed: r.changed === true, actions: r.actions || [], silent: r.silent === true });
    }

    // 2) Aviso proactivo: altas respondidas pendientes de decidir.
    if (b.check === "respondidas") {
      const altas = await loadAltas(c.authz);
      const items = altas
        .filter((a) => a.estado === "RESPONDIDO")
        .slice(0, 5)
        .map((a) => {
          const p = proposal(a, []);
          return { id: String(a.id), nombre: String(a.nombre_completo), answer: p.answer, choices: p.choices };
        });
      return J({ ok: true, handled: true, items });
    }

    // 3) Mensaje de texto.
    const msg = typeof b.message === "string" ? b.message.trim() : "";
    if (!msg) return J({ ok: false, error: "Escribe un mensaje." }, 400);

    const prevDraft: Draft | null = b.alta_draft && typeof b.alta_draft === "object" ? cleanDraft(b.alta_draft) : null;
    if (!prevDraft && !looksLikeAlta(msg)) return J({ ok: true, handled: false });

    const rt = await route(msg, prevDraft);
    let r: Result | null = null;
    switch (rt.action) {
      case "alta_create":
        r = await createFlow(c.authz, rt, prevDraft);
        break;
      case "alta_cancel":
        r = await runCont({ kind: "alta_cancel" }, c.authz);
        break;
      case "alta_status":
        r = await statusFlow(c.authz);
        break;
      case "alta_process":
        r = await processFlow(c.authz, rt.alta_query ? String(rt.alta_query) : null);
        break;
      case "alta_send":
        r = await sendFlow(c.authz, rt.alta_query ? String(rt.alta_query) : null);
        break;
      default:
        r = null;
    }
    if (!r) return J({ ok: true, handled: false });
    return J({ ok: true, handled: true, answer: r.answer, choices: r.choices, alta_draft: r.draft, secretary_changed: false, alta_changed: r.changed === true, actions: r.actions || [], silent: r.silent === true });
  } catch (e) {
    console.error("mitico-paco-altas", e);
    return J({ ok: false, error: "No he podido completar la operación de altas." }, 500);
  }
});
