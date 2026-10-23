import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ---------------------------------------------------------------------------
// mitico-paco-disponibilidad  (SOLO LECTURA)
// Dice como va la disponibilidad semanal de los entrenadores: quien ha
// respondido todo, quien falta y cuanto, y quien no tiene los avisos activados.
//
// Usa las mismas funciones SQL que ya usa el panel de la app, llamadas con el
// token del propio usuario (nunca service_role). No escribe nada ni envia
// ningun aviso. Aislada de las demas funciones de Paco. Solo coordinador_jefe.
// ---------------------------------------------------------------------------

const U = Deno.env.get("SUPABASE_URL") || "";
const K = Deno.env.get("SUPABASE_ANON_KEY") || "";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

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

// ---------- Fechas (Madrid) ---------------------------------------------------

function madridParts(d = new Date()) {
  const p = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hour12: false,
  }).formatToParts(d);
  const g = (t: string) => Number(p.find((x) => x.type === t)?.value || 0);
  return { y: g("year"), m: g("month"), d: g("day"), h: g("hour") % 24, mi: g("minute") };
}

const pad = (n: number) => String(n).padStart(2, "0");
const isoDate = (t: number) => new Date(t).toISOString().slice(0, 10);

function mondayOf(y: number, m: number, d: number) {
  const t = Date.UTC(y, m - 1, d);
  const dow = new Date(t).getUTCDay() || 7; // 1=lunes..7=domingo
  return t - (dow - 1) * 86400000;
}

function fmtDM(iso: string) {
  const [, m, d] = iso.slice(0, 10).split("-");
  return `${d}/${m}`;
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

function limiteTexto(limite: string | null | undefined, now = madridParts()) {
  const m = String(limite || "").match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
  if (!m) return "";
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const dia = DIAS[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()];
  const base = `${dia} ${pad(d)}/${pad(mo)} a las ${pad(h)}:${pad(mi)}`;
  const diff = Math.round((Date.UTC(y, mo - 1, d, h, mi) - Date.UTC(now.y, now.m - 1, now.d, now.h, now.mi)) / 60000);
  if (diff >= 0) {
    const horas = Math.floor(diff / 60);
    const mins = diff % 60;
    const queda = horas >= 24 ? `${Math.floor(horas / 24)} d ${horas % 24} h` : horas > 0 ? (mins ? `${horas} h ${mins} min` : `${horas} h`) : `${mins} min`;
    return `Límite: ${base} (quedan ${queda}).`;
  }
  const pasado = -diff;
  const hace = pasado >= 1440 ? `${Math.floor(pasado / 1440)} d` : pasado >= 60 ? `${Math.floor(pasado / 60)} h` : `${pasado} min`;
  return `Límite: ${base} (ya pasó, hace ${hace}).`;
}

// ---------- Acceso a Supabase con el token del usuario ------------------------

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
    throw new Error(msg);
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
  const rr = await fetch(
    `${U}/rest/v1/usuarios_app?select=id,rol&auth_user_id=eq.${encodeURIComponent(String(u.id))}&activo=eq.true&limit=1`,
    { headers: { apikey: K, Authorization: a, Accept: "application/json" } },
  );
  if (!rr.ok) return null;
  const rows = await rr.json();
  const p = Array.isArray(rows) ? rows[0] : null;
  return p?.rol === "coordinador_jefe" ? { authz: a } : null;
}

// ---------- Cuando contesta esta funcion ---------------------------------------

export function looksLikeDisp(text: string) {
  const n = norm(text);
  const disp = /\bDISPONIBILIDAD(ES)?\b/.test(n);
  const verbo = /\b(RESPOND|CONTEST|FALTA|PENDIENT|RESUMEN|COMO VA|COMO ESTA|QUIEN)/.test(n);
  if (disp && verbo) return true;
  const entr = /\bENTRENADORES?\b/.test(n);
  const noHan = /\b(NO HA|NO HAN|FALTA|FALTAN|SIN)\b/.test(n) && /(RESPOND|CONTEST|DISPONIBILIDAD)/.test(n);
  if (entr && noHan) return true;
  return /\bQUIEN(ES)? (NO )?(HA|HAN) (RESPONDIDO|CONTESTADO)/.test(n) || /\bQUIEN(ES)? FALTA(N)?\b/.test(n) && /(RESPOND|CONTEST|DISPONIBILIDAD|ENTRENADOR)/.test(n);
}

// ---------- Resumen --------------------------------------------------------------

type Fila = { entrenador_id?: string; entrenador?: string; respuesta?: string };
type Aviso = { entrenador_id: string; avisos_activos: boolean };

export function resumir(semana: any, filas: Fila[], avisos: Aviso[] | null, now = madridParts()) {
  const ini = String(semana?.semana_inicio || "").slice(0, 10);
  const fin = ini ? isoDate(Date.parse(ini + "T00:00:00Z") + 6 * 86400000) : "";
  const cab = `Disponibilidad de la semana ${fmtDM(ini)} – ${fmtDM(fin)}, señor Cubero. ${limiteTexto(semana?.fecha_limite, now)}`.trim();

  const por = new Map<string, { nombre: string; total: number; pend: number }>();
  for (const f of filas) {
    const id = String(f.entrenador_id || "");
    if (!id) continue;
    const x = por.get(id) || { nombre: String(f.entrenador || "Sin nombre"), total: 0, pend: 0 };
    x.total++;
    if (norm(f.respuesta) === "PENDIENTE" || !f.respuesta) x.pend++;
    por.set(id, x);
  }
  const todos = [...por.entries()];
  if (!todos.length) return `${cab}\n\nNo hay turnos ni respuestas registradas para esa semana.`;

  const sinAviso = new Set((avisos || []).filter((a) => a.avisos_activos === false).map((a) => String(a.entrenador_id)));
  const completos = todos.filter(([, x]) => x.pend === 0).length;
  const faltan = todos
    .filter(([, x]) => x.pend > 0)
    .sort((a, b) => b[1].pend - a[1].pend || a[1].nombre.localeCompare(b[1].nombre, "es"));

  if (!faltan.length) {
    return `${cab}\n\n✅ Han respondido todos: ${completos} de ${todos.length} entrenadores.`;
  }
  const lineas = faltan.slice(0, 30).map(([id, x]) => {
    const resp = x.total - x.pend;
    const estado = resp === 0 ? `no ha respondido nada (0 de ${x.total} turnos)` : `le faltan ${x.pend} de ${x.total} turnos`;
    return `• ${x.nombre} — ${estado}${sinAviso.has(id) ? " · sin avisos activados en el móvil" : ""}`;
  });
  const extra = faltan.length > 30 ? `\n… y ${faltan.length - 30} más.` : "";
  const nota = faltan.some(([id]) => sinAviso.has(id))
    ? "\n\nLos marcados «sin avisos» no tienen activadas las notificaciones, así que el push no les llega: conviene avisarles por otro lado."
    : "";
  return `${cab}\n\nHan respondido todo: ${completos} de ${todos.length}. Faltan ${faltan.length}:\n${lineas.join("\n")}${extra}${nota}`;
}

async function estadoDisponibilidad(authz: string) {
  const n = madridParts();
  const lun = mondayOf(n.y, n.m, n.d);
  // Semana siguiente, actual y anterior: se elige la mas reciente que este publicada.
  const candidatas = [lun + 7 * 86400000, lun, lun - 7 * 86400000].map(isoDate);
  const res = await Promise.all(
    candidatas.map((d) =>
      rpc(authz, "obtener_disponibilidad_publicada_entrenadores_editor_app", { p_semana_inicio: d }).catch(() => null)
    ),
  );
  const idx = res.findIndex((r) => r && r.existe === true && r.estado === "publicado");
  if (idx < 0) {
    return "Señor Cubero, no encuentro ninguna disponibilidad publicada en las últimas semanas, así que no hay respuestas que revisar.";
  }
  const sem = res[idx];
  let avisos: Aviso[] | null = null;
  try {
    const a = await rpc(authz, "obtener_estado_avisos_entrenadores_app");
    avisos = Array.isArray(a) ? a : null;
  } catch { avisos = null; }
  return resumir(sem, Array.isArray(sem.turnos) ? sem.turnos : [], avisos, n);
}

function reply(answer: string) {
  return J({
    ok: true, handled: true, answer, choices: [], alta_draft: null,
    secretary_changed: false, alta_changed: false, actions: [], silent: false,
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (!U || !K) return J({ ok: false, error: "Servicio no disponible." }, 503);
  try {
    const c = await authorize(req);
    if (!c) return J({ ok: false, error: "Acceso restringido a coordinador_jefe." }, 403);
    if (req.method === "GET") return J({ ok: true, handled: true, access: "coordinador_jefe" });
    if (req.method !== "POST") return J({ ok: false, error: "Método no permitido." }, 405);
    const b = await req.json().catch(() => ({}));
    if (b.check === "estado") return reply(await estadoDisponibilidad(c.authz));
    const msg = typeof b.message === "string" ? b.message.trim() : "";
    if (!msg) return J({ ok: false, error: "Escribe un mensaje." }, 400);
    if (!looksLikeDisp(msg)) return J({ ok: true, handled: false });
    return reply(await estadoDisponibilidad(c.authz));
  } catch (e) {
    console.error("mitico-paco-disponibilidad", e);
    return J({ ok: false, error: "No he podido consultar la disponibilidad." }, 500);
  }
});
