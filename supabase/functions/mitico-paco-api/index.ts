import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { buildWeeklyReview } from "./semana.ts";
import { pedirIA } from "./ia.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") || "";

const ROUTER_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash"];
const ADVISOR_MODELS = [
  "gemini-3.8-flash",
  "gemini-3.7-flash",
  "gemini-3.6-flash",
  "gemini-3.5-flash",
  "gemini-3.5-flash-lite",
];

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

// ---------------------------------------------------------------------------
// NOTA DE ESTA REVISION (Claude, 08/10/2026)
// "availability_check" ahora devuelve la REVISION SEMANAL completa (semana.ts):
// factibilidad por turno, entrenadores asignados que no pueden, grupos con un
// solo alumno, niveles muy distintos, turnos flojos, grupos que se podrian
// juntar... Sigue siendo 100% de solo lectura y sin llamadas extra a Gemini.
// Corrige ademas un fallo de la version anterior, que contaba cada turno dos
// veces (existe una version "publicado" y otra "borrador" de cada turno).
// Tambien: Paco trata al coordinador de "senor Cubero" con humor ligero
// (PACO_PERSONA / INTROS) y las respuestas de conversacion usan pensamiento
// "low" en lugar de "high" para contestar bastante mas rapido.
// ---------------------------------------------------------------------------

type RouteAction =
  | "general"
  | "list_groups"
  | "find_student"
  | "recommend_group"
  | "pending_reports"
  | "attendance_summary"
  | "coach_confirmations"
  | "level_reviews"
  | "incidents"
  | "operational_summary"
  | "availability_check"
  | "unsupported_internal";

type Route = {
  action: RouteAction;
  date?: string | null;
  modality?: "BABY" | "OCIO" | null;
  student_name?: string | null;
  level?: string | null;
  age?: number | null;
  reply?: string | null;
};

type Continuation = {
  kind: "recommend_group";
  date: string;
  modality: "BABY" | "OCIO";
  level: string;
  age: number;
};

type Choice = {
  label: string;
  continuation: Continuation;
};

type GroupSummary = {
  id: string;
  date: string;
  start: string;
  modality: string;
  name: string;
  groupLevel: string | null;
  pista: string | null;
  ratioOk: boolean | null;
  count: number;
  levelCodes: string[];
  levelOrders: number[];
  ages: number[];
  trainers: { name: string; confirmation: string | null }[];
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json; charset=utf-8" },
  });
}

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9+ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function madridToday() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function madridNowText() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date()).replace(" ", "T");
}

function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function currentWeekRange(iso = madridToday()) {
  const d = new Date(`${iso}T12:00:00Z`);
  const weekday = d.getUTCDay();
  const daysFromMonday = weekday === 0 ? 6 : weekday - 1;
  const start = addDays(iso, -daysFromMonday);
  return { start, end: addDays(start, 6) };
}

// NUEVO: lunes de la semana que contiene `iso` (o el propio iso si ya es lunes).
function mondayOnOrAfter(iso: string) {
  return currentWeekRange(iso).start;
}

function asksCurrentWeek(text: string) {
  const n = normalize(text);
  return n.includes("ESTA SEMANA") || n.includes("SEMANA ACTUAL") || n.includes("DE ESTA SEMANA");
}

// NUEVO: detecta si preguntan por la semana que viene, para el chequeo de disponibilidad.
function asksNextWeek(text: string) {
  const n = normalize(text);
  return (
    n.includes("PROXIMA SEMANA") ||
    n.includes("SEMANA QUE VIENE") ||
    n.includes("SIGUIENTE SEMANA") ||
    n.includes("SEMANA SIGUIENTE")
  );
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function fmtTime(value: string | null | undefined) {
  return value ? value.slice(0, 5) : "--:--";
}

function weekdayLabel(iso: string) {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    weekday: "long",
  })
    .format(new Date(`${iso}T12:00:00Z`))
    .replace(/^./, (c) => c.toUpperCase());
}

function ageOnDate(birth: string | null, date: string) {
  if (!birth) return null;
  const [by, bm, bd] = birth.split("-").map(Number);
  const [y, m, d] = date.split("-").map(Number);
  if (!by || !bm || !bd || !y || !m || !d) return null;
  let age = y - by;
  if (m < bm || (m === bm && d < bd)) age--;
  return age;
}

function median(values: number[]) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function average(values: number[]) {
  return values.length ? values.reduce((a, b) => a + b, 0) / values.length : null;
}

function formatSection(value: unknown) {
  const v = String(value || "").toUpperCase();
  if (v === "BABY_INTENSIVOS") return "Baby / Intensivos";
  if (v === "OCIO") return "Ocio";
  return value ? String(value) : "sección sin indicar";
}

async function dbGet(table: string, params: Record<string, string>) {
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error("Database read configuration unavailable");
  const url = new URL(`${SUPABASE_URL}/rest/v1/${table}`);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const res = await fetch(url, {
    method: "GET",
    headers: {
      apikey: SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      Accept: "application/json",
    },
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`Read error ${table}: ${res.status} ${text.slice(0, 180)}`);
  return text ? JSON.parse(text) : [];
}

async function authorizeCoordinatorJefe(req: Request) {
  const authHeader = req.headers.get("Authorization") || "";
  if (!authHeader.startsWith("Bearer ")) {
    return { ok: false as const, status: 401, error: "Sesión no válida." };
  }
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return { ok: false as const, status: 503, error: "Servicio no disponible." };
  }

  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: authHeader,
    },
  });
  if (!userRes.ok) {
    return { ok: false as const, status: 401, error: "Sesión no válida." };
  }
  const user = await userRes.json();
  if (!user?.id) return { ok: false as const, status: 401, error: "Sesión no válida." };

  const rows = await dbGet("usuarios_app", {
    select: "auth_user_id,nombre,rol,activo",
    auth_user_id: `eq.${user.id}`,
    activo: "eq.true",
    limit: "1",
  });
  const profile = rows?.[0] || null;
  if (!profile || profile.rol !== "coordinador_jefe") {
    return { ok: false as const, status: 403, error: "Paco solo está disponible para coordinador_jefe." };
  }
  return {
    ok: true as const,
    userId: String(user.id),
    profile: {
      nombre: String(profile.nombre || "Coordinador jefe"),
      rol: String(profile.rol),
    },
  };
}

// IA compartida (./ia.ts): Cloudflare → Gemini sin «pensar largo», con límite de tiempo.
// Se mantiene geminiWithFallback() con la misma firma para no tocar el resto del archivo:
// la lista ROUTER_MODELS = entender la frase (rápido); cualquier otra = redactar (pensar).
async function geminiWithFallback(
  models: string[],
  systemText: string,
  userText: string,
  jsonMode = false,
  _thinkingLevel?: "low" | "medium" | "high",
) {
  const r = await pedirIA({
    system: systemText,
    user: userText,
    json: jsonMode,
    nivel: models === ROUTER_MODELS ? "rapido" : "pensar",
    temperatura: jsonMode ? 0 : 0.45,
    maxTokens: jsonMode ? 2048 : 1500,
  });
  return { text: r.texto, model: r.modelo };
}

async function routeMessage(userText: string): Promise<Route> {
  const system = `Eres el enrutador privado de Paco Mitiquín para Mítico Baby. Fecha/hora actual en Madrid: ${madridNowText()}.
Devuelve SOLO JSON válido con: action, date, modality, student_name, level, age, reply.
Acciones:
- list_groups: grupos, horarios o resumen de grupos.
- find_student: buscar alumno concreto.
- recommend_group: recomendar encaje por edad, nivel, modalidad y día.
- pending_reports: reportes pendientes.
- attendance_summary: asistencia.
- coach_confirmations: confirmaciones de entrenadores.
- level_reviews: cambios/discrepancias de nivel.
- incidents: incidencias de reportes.
- operational_summary: resumen operativo de un día.
- availability_check: revisión completa de una semana (la revisión del martes): si es factible sacar todos los grupos con los entrenadores disponibles, quién no ha contestado, y problemas en los grupos (alumno solo, niveles muy distintos, turnos con pocos apuntados, grupos que se podrían juntar).
- unsupported_internal: cualquier escritura o dato interno no cubierto.
- general: conversación o asesoramiento sin datos internos.
Reglas:
- Fechas relativas en YYYY-MM-DD. Un día de semana sin 'hoy' es la próxima ocurrencia futura.
- Si dice 'esta semana' en reportes pendientes, deja date=null.
- Para availability_check, si mencionan una fecha o 'semana que viene', pon en date cualquier día de esa semana en formato YYYY-MM-DD; si no, deja date=null.
- modality solo BABY u OCIO si se indica claramente; si falta, null.
- level conserva INICIACION, A, A+, B, B+, C, C+, D o D+.
- No inventes datos internos ni afirmes haber modificado nada.`;

  const { text } = await geminiWithFallback(ROUTER_MODELS, system, userText, true);
  try {
    const parsed = JSON.parse(text);
    const ageValue =
      parsed.age === null || parsed.age === undefined || parsed.age === ""
        ? null
        : Number(parsed.age);
    return {
      action: parsed.action || "general",
      date: parsed.date ?? null,
      modality: parsed.modality ?? null,
      student_name: parsed.student_name ?? null,
      level: parsed.level ?? null,
      age: ageValue !== null && Number.isFinite(ageValue) ? ageValue : null,
      reply: parsed.reply ?? null,
    } as Route;
  } catch {
    return { action: "general", reply: null };
  }
}

const PACO_PERSONA =
  "Eres Paco Mitiquín, el asistente personal del coordinador jefe de Mítico Baby, una escuela de natación. Tu estilo es el de un mayordomo inteligente tipo Jarvis: eficiente, elegante y con humor seco. Te diriges SIEMPRE a él como \"señor Cubero\" (con naturalidad, sin repetirlo en cada frase). Habla en español de España, cercano y natural, nada robótico. Puedes soltar alguna broma ligera de vez en cuando cuando encaje, sin forzarla y nunca en temas serios (lesiones, quejas de familias, problemas graves). Respuestas breves y al grano: primero lo importante y después, solo si hace falta, el detalle. Actúa como asesor operativo experto y exigente: señala riesgos, contradicciones y alternativas. Tienes herramientas internas de SOLO LECTURA para grupos, alumnos, recomendaciones, reportes pendientes, asistencia, confirmaciones, revisiones de nivel, incidencias, disponibilidad semanal de entrenadores y revisión semanal. No puedes modificar datos ni fingir acciones. Si necesitas datos internos, no los inventes.";

async function generalAnswer(userText: string) {
  // Pensamiento "low": mucho mas rapido que "high" y suficiente para conversar.
  return await geminiWithFallback(ADVISOR_MODELS, PACO_PERSONA, userText, false, "low");
}

// Frases de apertura (sin llamadas a Gemini: cero latencia) para que las
// respuestas con datos suenen a Paco y no a informe automatico.
const INTROS: Record<string, string[]> = {
  availability_check: [
    "Señor Cubero, he repasado la semana de arriba abajo.",
    "Aquí tiene el parte de la semana, señor Cubero.",
    "Semana revisada, señor Cubero. Siéntese, que hay tela.",
  ],
  pending_reports: [
    "Señor Cubero, estos son los reportes que andan por ahí sueltos.",
    "Le traigo los reportes pendientes, señor Cubero. Alguien tiene deberes.",
  ],
  list_groups: [
    "Aquí tiene los grupos, señor Cubero.",
    "Grupos al canto, señor Cubero.",
  ],
  find_student: ["Localizado, señor Cubero."],
  attendance_summary: [
    "La asistencia, señor Cubero.",
    "Así ha quedado la asistencia, señor Cubero.",
  ],
  coach_confirmations: [
    "Señor Cubero, esto es lo que hay con las confirmaciones.",
  ],
  level_reviews: [
    "Señor Cubero, hay niveles que conviene mirar.",
  ],
  incidents: [
    "Las incidencias, señor Cubero.",
  ],
  operational_summary: [
    "Resumen operativo servido, señor Cubero.",
    "Así está el día, señor Cubero.",
  ],
  recommend_group: ["Señor Cubero, mi recomendación:"],
};

function withIntro(action: string, answer: string) {
  const options = INTROS[action];
  if (!options || !answer) return answer;
  if (/^(No |Dime |Antes |Los grupos disponibles|Esa operaci)/.test(answer)) return answer;
  const intro = options[Math.floor(Math.random() * options.length)];
  return `${intro}\n\n${answer}`;
}

async function loadLevels() {
  const rows = await dbGet("niveles", {
    select: "id,codigo,orden,activo",
    activo: "eq.true",
    order: "orden.asc",
  });
  const byId = new Map<string, { code: string; order: number }>();
  const byCode = new Map<string, { id: string; code: string; order: number }>();
  for (const r of rows) {
    const item = { code: String(r.codigo), order: Number(r.orden) };
    byId.set(String(r.id), item);
    byCode.set(normalize(String(r.codigo)), { id: String(r.id), ...item });
  }
  return { byId, byCode };
}

async function getGroupSummaries(
  date?: string | null,
  modality?: string | null,
): Promise<GroupSummary[]> {
  const today = madridToday();
  const sessionParams: Record<string, string> = {
    select: "id,fecha,hora_inicio,hora_fin,lugar,modalidad_id",
    order: "fecha.asc,hora_inicio.asc",
    limit: "120",
  };
  if (date) sessionParams.fecha = `eq.${date}`;
  else {
    sessionParams.fecha = `gte.${today}`;
    sessionParams.and = `(fecha.lte.${addDays(today, 14)})`;
  }

  const [sessions, modalities, levelData] = await Promise.all([
    dbGet("sesiones", sessionParams),
    dbGet("modalidades", {
      select: "id,codigo,nombre,activa",
      activa: "eq.true",
    }),
    loadLevels(),
  ]);

  const modalityMap = new Map(
    modalities.map((m: any) => [String(m.id), String(m.codigo)]),
  );
  let filteredSessions = sessions;
  if (modality) {
    const wanted = normalize(modality);
    filteredSessions = sessions.filter(
      (s: any) =>
        normalize(modalityMap.get(String(s.modalidad_id)) || "") === wanted,
    );
  }
  if (!filteredSessions.length) return [];

  const sessionIds = filteredSessions.map((s: any) => String(s.id));
  const groups = await dbGet("grupos", {
    select:
      "id,sesion_id,modalidad_id,nombre_grupo,nivel_grupo,pista,estado,ratio_ok,excepcion_ratio,publicado,cancelado",
    sesion_id: `in.(${sessionIds.join(",")})`,
    cancelado: "eq.false",
  });
  if (!groups.length) return [];

  const groupIds = groups.map((g: any) => String(g.id));
  const [memberships, assignments] = await Promise.all([
    dbGet("grupo_alumnos", {
      select: "grupo_id,alumno_id,orden",
      grupo_id: `in.(${groupIds.join(",")})`,
      order: "orden.asc",
    }),
    dbGet("asignaciones_entrenadores", {
      select: "grupo_id,entrenador_id,estado_confirmacion",
      grupo_id: `in.(${groupIds.join(",")})`,
    }),
  ]);

  const studentIds = [
    ...new Set(memberships.map((m: any) => String(m.alumno_id)).filter(Boolean)),
  ];
  const trainerIds = [
    ...new Set(assignments.map((a: any) => String(a.entrenador_id)).filter(Boolean)),
  ];
  const students = studentIds.length
    ? await dbGet("alumnos", {
        select: "id,fecha_nacimiento,nivel_actual_id,nivel_estimado_id,activo",
        id: `in.(${studentIds.join(",")})`,
      })
    : [];
  const trainers = trainerIds.length
    ? await dbGet("entrenadores", {
        select: "id,nombre_completo,activo",
        id: `in.(${trainerIds.join(",")})`,
      })
    : [];

  const sessionMap = new Map(filteredSessions.map((s: any) => [String(s.id), s]));
  const studentMap = new Map(students.map((s: any) => [String(s.id), s]));
  const trainerMap = new Map(trainers.map((t: any) => [String(t.id), t]));

  const membersByGroup = new Map<string, any[]>();
  for (const m of memberships) {
    const key = String(m.grupo_id);
    const arr = membersByGroup.get(key) || [];
    arr.push(m);
    membersByGroup.set(key, arr);
  }
  const assignmentsByGroup = new Map<string, any[]>();
  for (const a of assignments) {
    const key = String(a.grupo_id);
    const arr = assignmentsByGroup.get(key) || [];
    arr.push(a);
    assignmentsByGroup.set(key, arr);
  }

  return groups
    .map((g: any) => {
      const session = sessionMap.get(String(g.sesion_id));
      const ms = membersByGroup.get(String(g.id)) || [];
      const levelCodes: string[] = [];
      const levelOrders: number[] = [];
      const ages: number[] = [];

      for (const m of ms) {
        const student = studentMap.get(String(m.alumno_id));
        if (!student) continue;
        const levelId = student.nivel_actual_id || student.nivel_estimado_id;
        const level = levelId ? levelData.byId.get(String(levelId)) : null;
        if (level) {
          levelCodes.push(level.code);
          levelOrders.push(level.order);
        }
        const age = ageOnDate(
          student.fecha_nacimiento,
          String(session?.fecha || date || today),
        );
        if (age !== null) ages.push(age);
      }

      return {
        id: String(g.id),
        date: String(session?.fecha || ""),
        start: String(session?.hora_inicio || ""),
        modality: String(
          modalityMap.get(String(g.modalidad_id)) ||
            modalityMap.get(String(session?.modalidad_id)) ||
            "",
        ),
        name: String(g.nombre_grupo || "Grupo"),
        groupLevel: g.nivel_grupo ? String(g.nivel_grupo) : null,
        pista: g.pista ? String(g.pista) : null,
        ratioOk: typeof g.ratio_ok === "boolean" ? g.ratio_ok : null,
        count: ms.length,
        levelCodes,
        levelOrders,
        ages,
        trainers: (assignmentsByGroup.get(String(g.id)) || []).map((a: any) => ({
          name: String(
            trainerMap.get(String(a.entrenador_id))?.nombre_completo ||
              "Entrenador sin ficha",
          ),
          confirmation: a.estado_confirmacion
            ? String(a.estado_confirmacion)
            : null,
        })),
      } as GroupSummary;
    })
    .sort((a: GroupSummary, b: GroupSummary) =>
      `${a.date} ${a.start} ${a.name}`.localeCompare(
        `${b.date} ${b.start} ${b.name}`,
      )
    );
}

function levelDistribution(codes: string[]) {
  if (!codes.length) return "sin nivel registrado";
  const counts = new Map<string, number>();
  for (const c of codes) counts.set(c, (counts.get(c) || 0) + 1);
  return [...counts.entries()]
    .map(([c, n]) => (n > 1 ? `${c}×${n}` : c))
    .join(", ");
}

function trainerText(
  trainers: { name: string; confirmation: string | null }[],
) {
  if (!trainers.length) return "sin entrenador asignado";
  return trainers
    .map((t) => `${t.name}${t.confirmation ? ` (${t.confirmation})` : ""}`)
    .join(" / ");
}

async function answerGroups(date?: string | null, modality?: string | null) {
  const groups = await getGroupSummaries(date, modality);
  if (!groups.length) {
    return date
      ? `No encuentro grupos no cancelados para el ${fmtDate(date)}${modality ? ` en ${modality}` : ""}.`
      : "No encuentro grupos programados en los próximos 14 días.";
  }
  const byDate = new Map<string, GroupSummary[]>();
  for (const g of groups) {
    const arr = byDate.get(g.date) || [];
    arr.push(g);
    byDate.set(g.date, arr);
  }
  const chunks: string[] = [];
  for (const [day, dayGroups] of byDate) {
    chunks.push(`📅 ${fmtDate(day)}`);
    for (const g of dayGroups) {
      chunks.push(
        `• ${g.modality} ${fmtTime(g.start)} · ${g.name} — ${g.count} alumnos · ${levelDistribution(g.levelCodes)} · ${g.pista || "pista sin indicar"} · ${trainerText(g.trainers)}`,
      );
    }
  }
  return chunks.join("\n");
}

async function answerStudent(studentName?: string | null) {
  if (!studentName || studentName.trim().length < 2) {
    return "Dime el nombre del alumno que quieres consultar.";
  }
  const [students, levelData] = await Promise.all([
    dbGet("alumnos", {
      select:
        "id,nombre_completo,fecha_nacimiento,nivel_actual_id,nivel_estimado_id,activo,seccion_principal",
      activo: "eq.true",
      limit: "500",
    }),
    loadLevels(),
  ]);

  const target = normalize(studentName);
  const tokens = target.split(" ").filter(Boolean);
  const ranked = students
    .map((s: any) => {
      const name = normalize(String(s.nombre_completo || ""));
      let score = 0;
      if (name === target) score = 100;
      else if (name.startsWith(target)) score = 80;
      else if (name.includes(target)) score = 70;
      else if (tokens.length && tokens.every((t) => name.includes(t))) score = 60;
      else score = tokens.reduce((acc, t) => acc + (name.includes(t) ? 10 : 0), 0);
      return { s, score };
    })
    .filter((x: any) => x.score > 0)
    .sort((a: any, b: any) => b.score - a.score)
    .slice(0, 5);

  if (!ranked.length) {
    return `No encuentro ningún alumno activo que coincida con "${studentName}".`;
  }
  const today = madridToday();
  const lines = ranked.map((x: any) => {
    const s = x.s;
    const current = s.nivel_actual_id
      ? levelData.byId.get(String(s.nivel_actual_id))?.code
      : null;
    const estimated = s.nivel_estimado_id
      ? levelData.byId.get(String(s.nivel_estimado_id))?.code
      : null;
    const age = ageOnDate(s.fecha_nacimiento, today);
    const level = current || estimated || "sin nivel";
    const source = current ? "actual" : estimated ? "estimado" : "";
    return `• ${s.nombre_completo} — ${age !== null ? `${age} años` : "edad sin registrar"} · nivel ${level}${source ? ` (${source})` : ""} · ${formatSection(s.seccion_principal)}`;
  });
  return ranked.length === 1
    ? `He encontrado:\n${lines[0]}`
    : `He encontrado varias coincidencias:\n${lines.join("\n")}`;
}

function groupFallbackLevelOrder(
  groupLevel: string | null,
  byCode: Map<string, { id: string; code: string; order: number }>,
) {
  if (!groupLevel) return null;
  const norm = normalize(groupLevel);
  const codes = [...byCode.keys()].sort((a, b) => b.length - a.length);
  const found = codes.find(
    (code) => norm.split(" ").includes(code) || norm.includes(code),
  );
  return found ? byCode.get(found)?.order ?? null : null;
}

function explainWinner(first: any, second: any) {
  if (!second) {
    return "Es la opción compatible disponible con mejor encaje conjunto de nivel y edad.";
  }
  const reasons: string[] = [];
  if (first.levelDistance + 0.25 < second.levelDistance) reasons.push("encaja mejor por nivel");
  if (first.ageDistance + 0.75 < second.ageDistance) reasons.push("la edad está más próxima al grupo");
  if (first.g.count + 1 < second.g.count) reasons.push("tiene menos carga actual");
  if (!reasons.length) {
    reasons.push("ofrece el mejor equilibrio conjunto entre nivel, edad y carga del grupo");
  }
  return reasons.join(" y ") + ".";
}

async function answerRecommendation(route: Route) {
  if (!route.date) return "Dime el día o la fecha para poder comparar los grupos reales de esa jornada.";
  if (!route.level) return "Dime el nivel del niño (por ejemplo B+, C o D).";
  if (!route.age || route.age < 2 || route.age > 20) {
    return "Dime la edad del niño para comparar también el encaje por edad.";
  }

  const [allGroups, levelData] = await Promise.all([
    getGroupSummaries(route.date, null),
    loadLevels(),
  ]);
  if (!allGroups.length) {
    return `No encuentro grupos no cancelados para el ${fmtDate(route.date)}.`;
  }

  const availableModalities = [
    ...new Set(allGroups.map((g) => normalize(g.modality)).filter(Boolean)),
  ];
  const selectedModality = route.modality ? normalize(route.modality) : null;

  if (!selectedModality && availableModalities.length > 1) {
    return "Antes de recomendarte grupo necesito saber si es Baby u Ocio.";
  }

  let groups = selectedModality
    ? allGroups.filter((g) => normalize(g.modality) === selectedModality)
    : allGroups;

  if (!groups.length) {
    return `No encuentro grupos de ${route.modality || "esa modalidad"} para el ${fmtDate(route.date)}.`;
  }

  groups = groups.filter((g) => g.ratioOk !== false);
  if (!groups.length) {
    return "Los grupos disponibles están marcados con ratio no válido. No recomiendo hacer un alta sin revisión manual.";
  }

  const target = levelData.byCode.get(
    normalize(route.level).replace("INICIACIÓN", "INICIACION"),
  );
  if (!target) return `No reconozco el nivel "${route.level}".`;

  const ranked = groups
    .map((g) => {
      const groupLevel =
        median(g.levelOrders) ??
        groupFallbackLevelOrder(g.groupLevel, levelData.byCode);
      const avgAge = average(g.ages);
      const levelDistance =
        groupLevel === null ? 3 : Math.abs(target.order - groupLevel);
      const ageDistance =
        avgAge === null ? 3 : Math.abs(route.age! - avgAge);
      const score =
        levelDistance * 3 + Math.min(ageDistance, 8) * 1.1 + g.count * 0.12;
      return {
        g,
        score,
        avgAge,
        levelDistance,
        ageDistance,
      };
    })
    .sort((a, b) => a.score - b.score)
    .slice(0, 3);

  const lines = ranked.map((r, i) => {
    const ageText =
      r.avgAge === null
        ? "edad media sin datos"
        : `edad media ${r.avgAge.toFixed(1).replace(".0", "")} años`;
    const levelFit =
      r.levelDistance === 0
        ? "nivel muy compatible"
        : r.levelDistance <= 1
          ? "nivel cercano"
          : `diferencia de ${r.levelDistance} escalones de nivel`;
    const ageFit =
      r.ageDistance <= 1.5
        ? "edad muy compatible"
        : r.ageDistance <= 3
          ? "edad razonablemente próxima"
          : "edad bastante distinta al grupo";
    return `${i + 1}. ${r.g.modality} ${fmtTime(r.g.start)} · ${r.g.name}\n   ${r.g.count} alumnos · ${levelDistribution(r.g.levelCodes)} · ${ageText} · ${trainerText(r.g.trainers)}\n   Encaje: ${levelFit}; ${ageFit}; ratio OK`;
  });

  return `Para un niño de ${route.age} años, nivel ${target.code}, en ${route.modality || ranked[0]?.g.modality} el ${fmtDate(route.date)}:\n\n${lines.join("\n\n")}\n\nPor qué pongo la opción 1 por delante: ${explainWinner(ranked[0], ranked[1])}\n\nEs una recomendación: no he movido ni creado ningún alumno.`;
}

async function recommendationChoices(route: Route): Promise<Choice[]> {
  if (!route.date || !route.level || !route.age || route.modality) return [];
  const groups = await getGroupSummaries(route.date, null);
  const modalities = [
    ...new Set(
      groups
        .map((g) => normalize(g.modality))
        .filter((m) => m === "BABY" || m === "OCIO"),
    ),
  ];
  if (modalities.length <= 1) return [];
  return modalities.map((modality) => ({
    label: modality === "BABY" ? "BABY" : "OCIO",
    continuation: {
      kind: "recommend_group",
      date: route.date!,
      level: route.level!,
      age: route.age!,
      modality: modality as "BABY" | "OCIO",
    },
  }));
}

async function answerPendingReports(date?: string | null, currentWeek = false) {
  const params: Record<string, string> = {
    select:
      "fecha,hora_inicio,hora_fin,modalidad,nombre_grupo,entrenador,alumno,estado_asistencia,estado_reporte",
    estado_reporte: "eq.Falta reporte",
    order: "fecha.asc,hora_inicio.asc,entrenador.asc,nombre_grupo.asc,alumno.asc",
    limit: "150",
  };

  let range: { start: string; end: string } | null = null;
  if (currentWeek) {
    range = currentWeekRange();
    params.fecha = `gte.${range.start}`;
    params.and = `(fecha.lte.${range.end})`;
  } else if (date) {
    params.fecha = `eq.${date}`;
  }

  const rows = await dbGet("v_alumnos_reporte_entrenador_app", params);
  if (!rows.length) {
    if (range) {
      return `No hay reportes pendientes esta semana (${fmtDate(range.start)}–${fmtDate(range.end)}).`;
    }
    return date
      ? `No hay reportes pendientes para el ${fmtDate(date)}.`
      : "No hay reportes pendientes ahora mismo.";
  }

  if (range) {
    const grouped = new Map<string, any[]>();
    for (const r of rows) {
      const key = `${r.fecha}|${r.hora_inicio}|${r.entrenador}|${r.modalidad}|${r.nombre_grupo}`;
      const arr = grouped.get(key) || [];
      arr.push(r);
      grouped.set(key, arr);
    }

    const lines = [
      `📝 Reportes pendientes esta semana (${rows.length})`,
      `${fmtDate(range.start)}–${fmtDate(range.end)}`,
    ];
    let lastDate = "";
    for (const entries of grouped.values()) {
      const first = entries[0];
      const day = String(first.fecha);
      if (day !== lastDate) {
        lines.push(`\n📅 ${weekdayLabel(day)} ${fmtDate(day)}`);
        lastDate = day;
      }
      lines.push(
        `• ${fmtTime(first.hora_inicio)} · ${first.entrenador || "Sin entrenador"} · ${first.modalidad} · ${first.nombre_grupo} — ${entries.length} reporte${entries.length === 1 ? "" : "s"}`,
      );
      lines.push(`  ${entries.map((x: any) => String(x.alumno)).join(", ")}`);
    }
    return lines.join("\n");
  }

  const byCoach = new Map<string, any[]>();
  for (const r of rows) {
    const coach = String(r.entrenador || "Sin entrenador");
    const arr = byCoach.get(coach) || [];
    arr.push(r);
    byCoach.set(coach, arr);
  }
  const lines: string[] = [`📝 Reportes pendientes (${rows.length})`];
  for (const [coach, coachRows] of byCoach) {
    lines.push(`\n${coach}: ${coachRows.length}`);
    for (const r of coachRows) {
      lines.push(
        `• ${fmtDate(String(r.fecha))} ${fmtTime(r.hora_inicio)} · ${r.modalidad} · ${r.nombre_grupo} · ${r.alumno}`,
      );
    }
  }
  return lines.join("\n");
}

async function answerAttendance(date?: string | null) {
  const targetDate = date || madridToday();
  const rows = await dbGet("v_grupo_alumnos_asistencia_app", {
    select: "fecha,hora_inicio,modalidad,nombre_grupo,alumno,estado_asistencia",
    fecha: `eq.${targetDate}`,
    order: "hora_inicio.asc,nombre_grupo.asc,alumno.asc",
    limit: "200",
  });
  if (!rows.length) {
    return `No encuentro alumnos en grupos para el ${fmtDate(targetDate)}.`;
  }

  const groups = new Map<string, any>();
  for (const r of rows) {
    const key = `${r.modalidad}|${r.hora_inicio}|${r.nombre_grupo}`;
    if (!groups.has(key)) {
      groups.set(key, {
        modalidad: r.modalidad,
        hora: r.hora_inicio,
        nombre: r.nombre_grupo,
        total: 0,
        present: 0,
        absent: [] as string[],
        pending: [] as string[],
      });
    }
    const g = groups.get(key);
    g.total++;
    const state = normalize(String(r.estado_asistencia || "PENDIENTE"));
    if (state === "PRESENTE") g.present++;
    else if (state === "AUSENTE") g.absent.push(String(r.alumno));
    else if (state === "PENDIENTE") g.pending.push(String(r.alumno));
  }

  const lines = [`📋 Asistencia ${fmtDate(targetDate)}`];
  for (const g of groups.values()) {
    let detail = `${g.present}/${g.total} presentes`;
    if (g.absent.length) detail += ` · ${g.absent.length} ausente${g.absent.length > 1 ? "s" : ""}: ${g.absent.join(", ")}`;
    if (g.pending.length) detail += ` · ${g.pending.length} pendiente${g.pending.length > 1 ? "s" : ""} de marcar`;
    lines.push(`• ${g.modalidad} ${fmtTime(g.hora)} · ${g.nombre}: ${detail}`);
  }
  return lines.join("\n");
}

async function answerCoachConfirmations(date?: string | null) {
  const targetDate = date || madridToday();
  const rows = await dbGet("v_grupos_entrenador_app_dos_entrenadores", {
    select:
      "entrenador,estado_confirmacion,grupo_id,nombre_grupo,fecha,hora_inicio,modalidad,publicado",
    fecha: `eq.${targetDate}`,
    order: "hora_inicio.asc,nombre_grupo.asc,entrenador.asc",
    limit: "100",
  });
  if (!rows.length) return `No encuentro grupos para el ${fmtDate(targetDate)}.`;
  const issues = rows.filter(
    (r: any) => normalize(String(r.estado_confirmacion || "")) !== "CONFIRMADO",
  );
  if (!issues.length) {
    return `Todos los entrenadores asignados del ${fmtDate(targetDate)} figuran como Confirmado.`;
  }
  return `⚠️ Confirmaciones a revisar ${fmtDate(targetDate)}:\n${issues
    .map(
      (r: any) =>
        `• ${r.modalidad} ${fmtTime(r.hora_inicio)} · ${r.nombre_grupo}: ${r.entrenador || "sin entrenador"} — ${r.estado_confirmacion || "sin confirmar"}`,
    )
    .join("\n")}`;
}

async function answerLevelReviews(date?: string | null) {
  const params: Record<string, string> = {
    select: "alumno_id,fecha,nivel_id,updated_at,created_at",
    order: "fecha.desc,updated_at.desc,created_at.desc",
    limit: "250",
  };
  if (date) params.fecha = `eq.${date}`;
  else params.fecha = `gte.${addDays(madridToday(), -7)}`;

  const reports = await dbGet("reportes", params);
  if (!reports.length) {
    return date
      ? `No hay reportes para revisar el ${fmtDate(date)}.`
      : "No hay reportes de los últimos 7 días para revisar.";
  }

  const latest = new Map<string, any>();
  for (const r of reports) {
    if (!latest.has(String(r.alumno_id))) latest.set(String(r.alumno_id), r);
  }
  const ids = [...latest.keys()];
  const [students, levelData] = await Promise.all([
    dbGet("alumnos", {
      select: "id,nombre_completo,nivel_actual_id",
      id: `in.(${ids.join(",")})`,
    }),
    loadLevels(),
  ]);
  const studentMap = new Map(students.map((s: any) => [String(s.id), s]));
  const changes: any[] = [];

  for (const [studentId, r] of latest) {
    const s = studentMap.get(studentId);
    if (!s || !s.nivel_actual_id || !r.nivel_id) continue;
    const current = levelData.byId.get(String(s.nivel_actual_id));
    const reported = levelData.byId.get(String(r.nivel_id));
    if (!current || !reported || current.order === reported.order) continue;
    changes.push({
      name: s.nombre_completo,
      date: r.fecha,
      current,
      reported,
      diff: reported.order - current.order,
    });
  }

  changes.sort((a, b) => a.diff - b.diff);
  if (!changes.length) {
    return date
      ? `No veo discrepancias entre nivel actual y nivel reportado el ${fmtDate(date)}.`
      : "No veo discrepancias entre el nivel actual y el último nivel reportado en los últimos 7 días.";
  }

  const lines = changes.map((c) => {
    const kind =
      c.diff < 0
        ? `BAJADA ${Math.abs(c.diff)} escalón${Math.abs(c.diff) > 1 ? "es" : ""}`
        : `subida ${c.diff} escalón${c.diff > 1 ? "es" : ""}`;
    return `• ${c.name} · ${fmtDate(String(c.date))}: actual ${c.current.code} → reportado ${c.reported.code} · ${kind}`;
  });
  return `🔎 Revisiones de nivel (${changes.length}):\n${lines.join("\n")}\n\nSolo informo de discrepancias; no he cambiado ningún nivel.`;
}

async function answerIncidents(date?: string | null) {
  const params: Record<string, string> = {
    select:
      "alumno_id,grupo_id,entrenador_id,fecha,incidencia,incidencia_comentario",
    order: "fecha.desc,created_at.desc",
    limit: "100",
  };
  if (date) params.fecha = `eq.${date}`;
  else params.fecha = `gte.${addDays(madridToday(), -7)}`;

  const reports = await dbGet("reportes", params);
  const incidents = reports.filter((r: any) => {
    const v = normalize(String(r.incidencia || ""));
    return v && v !== "SIN INCIDENCIA";
  });
  if (!incidents.length) {
    return date
      ? `No hay incidencias reportadas el ${fmtDate(date)}.`
      : "No hay incidencias reportadas en los últimos 7 días.";
  }

  const studentIds = [
    ...new Set(incidents.map((r: any) => String(r.alumno_id)).filter(Boolean)),
  ];
  const groupIds = [
    ...new Set(incidents.map((r: any) => String(r.grupo_id)).filter(Boolean)),
  ];
  const trainerIds = [
    ...new Set(incidents.map((r: any) => String(r.entrenador_id)).filter(Boolean)),
  ];
  const [students, groups, trainers] = await Promise.all([
    studentIds.length
      ? dbGet("alumnos", {
          select: "id,nombre_completo",
          id: `in.(${studentIds.join(",")})`,
        })
      : [],
    groupIds.length
      ? dbGet("grupos", {
          select: "id,nombre_grupo",
          id: `in.(${groupIds.join(",")})`,
        })
      : [],
    trainerIds.length
      ? dbGet("entrenadores", {
          select: "id,nombre_completo",
          id: `in.(${trainerIds.join(",")})`,
        })
      : [],
  ]);
  const sm = new Map(students.map((x: any) => [String(x.id), String(x.nombre_completo)]));
  const gm = new Map(groups.map((x: any) => [String(x.id), String(x.nombre_grupo)]));
  const tm = new Map(trainers.map((x: any) => [String(x.id), String(x.nombre_completo)]));

  return `🚩 Incidencias (${incidents.length}):\n${incidents
    .map((r: any) => {
      const comment = r.incidencia_comentario
        ? ` · ${String(r.incidencia_comentario).slice(0, 180)}`
        : "";
      return `• ${fmtDate(String(r.fecha))} · ${sm.get(String(r.alumno_id)) || "Alumno"} · ${gm.get(String(r.grupo_id)) || "grupo"} · ${r.incidencia}${comment} · ${tm.get(String(r.entrenador_id)) || "entrenador sin identificar"}`;
    })
    .join("\n")}`;
}

async function answerOperationalSummary(date?: string | null) {
  const targetDate = date || madridToday();
  const [attendanceRows, pendingRows, groupRows, incidentRows] = await Promise.all([
    dbGet("v_grupo_alumnos_asistencia_app", {
      select: "estado_asistencia",
      fecha: `eq.${targetDate}`,
      limit: "300",
    }),
    dbGet("v_alumnos_reporte_entrenador_app", {
      select: "estado_reporte",
      fecha: `eq.${targetDate}`,
      estado_reporte: "eq.Falta reporte",
      limit: "300",
    }),
    dbGet("v_grupos_entrenador_app_dos_entrenadores", {
      select: "grupo_id,entrenador,estado_confirmacion",
      fecha: `eq.${targetDate}`,
      limit: "200",
    }),
    dbGet("reportes", {
      select: "incidencia",
      fecha: `eq.${targetDate}`,
      limit: "300",
    }),
  ]);

  const attendancePending = attendanceRows.filter(
    (r: any) => normalize(String(r.estado_asistencia || "PENDIENTE")) === "PENDIENTE",
  ).length;
  const absent = attendanceRows.filter(
    (r: any) => normalize(String(r.estado_asistencia || "")) === "AUSENTE",
  ).length;
  const confirmationProblems = groupRows.filter(
    (r: any) => normalize(String(r.estado_confirmacion || "")) !== "CONFIRMADO",
  ).length;
  const incidents = incidentRows.filter((r: any) => {
    const v = normalize(String(r.incidencia || ""));
    return v && v !== "SIN INCIDENCIA";
  }).length;

  return [
    `📌 Resumen operativo ${fmtDate(targetDate)}`,
    `• Reportes pendientes: ${pendingRows.length}`,
    `• Asistencias pendientes de marcar: ${attendancePending}`,
    `• Ausencias marcadas: ${absent}`,
    `• Confirmaciones de entrenador a revisar: ${confirmationProblems}`,
    `• Incidencias reportadas: ${incidents}`,
  ].join("\n");
}

// ---------------------------------------------------------------------------
// Chequeo de disponibilidad semanal ("la revision del martes").
// Toda la logica vive en semana.ts. 100% solo lectura, 0 llamadas a Gemini.
// Valores reales observados en `respuesta`: "Disponible" | "No puedo" | "Pendiente".
// ---------------------------------------------------------------------------

function resolveAvailabilityWeekStart(userText: string, routeDate?: string | null) {
  const today = madridToday();
  if (asksNextWeek(userText)) return mondayOnOrAfter(addDays(today, 7));
  if (routeDate) return mondayOnOrAfter(routeDate);
  return mondayOnOrAfter(today);
}

async function answerAvailability(weekStart: string) {
  const { text } = await buildWeeklyReview(dbGet, weekStart);
  return text;
}

async function processMessage(userText: string) {
  const route = await routeMessage(userText);

  if (route.action === "list_groups") {
    return { answer: withIntro("list_groups", await answerGroups(route.date || null, route.modality || null)) };
  }
  if (route.action === "find_student") {
    return { answer: withIntro("find_student", await answerStudent(route.student_name || null)) };
  }
  if (route.action === "recommend_group") {
    const choices = await recommendationChoices(route);
    if (choices.length > 1) {
      return {
        answer: "Antes de recomendarte grupo necesito saber si es Baby u Ocio.",
        choices,
      };
    }
    return { answer: withIntro("recommend_group", await answerRecommendation(route)) };
  }
  if (route.action === "pending_reports") {
    const currentWeek = asksCurrentWeek(userText);
    return {
      answer: withIntro(
        "pending_reports",
        await answerPendingReports(currentWeek ? null : route.date || null, currentWeek),
      ),
    };
  }
  if (route.action === "attendance_summary") {
    return { answer: withIntro("attendance_summary", await answerAttendance(route.date || null)) };
  }
  if (route.action === "coach_confirmations") {
    return { answer: withIntro("coach_confirmations", await answerCoachConfirmations(route.date || null)) };
  }
  if (route.action === "level_reviews") {
    return { answer: withIntro("level_reviews", await answerLevelReviews(route.date || null)) };
  }
  if (route.action === "incidents") {
    return { answer: withIntro("incidents", await answerIncidents(route.date || null)) };
  }
  if (route.action === "operational_summary") {
    return { answer: withIntro("operational_summary", await answerOperationalSummary(route.date || null)) };
  }
  if (route.action === "availability_check") {
    const weekStart = resolveAvailabilityWeekStart(userText, route.date);
    return { answer: withIntro("availability_check", await answerAvailability(weekStart)) };
  }
  if (route.action === "unsupported_internal") {
    return {
      answer:
        route.reply ||
        "Esa operación todavía no está habilitada. Paco dentro de la app sigue en modo solo lectura.",
    };
  }
  if (route.reply) return { answer: route.reply };

  const result = await generalAnswer(userText);
  console.log("Paco app advisor model used", result.model);
  return { answer: result.text };
}

function parseContinuation(raw: any): Continuation | null {
  if (!raw || raw.kind !== "recommend_group") return null;
  const age = Number(raw.age);
  const modality = String(raw.modality || "").toUpperCase();
  const date = String(raw.date || "");
  const level = String(raw.level || "");
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return null;
  if (!Number.isFinite(age) || age < 2 || age > 20) return null;
  if (!["BABY", "OCIO"].includes(modality)) return null;
  if (!level) return null;
  return {
    kind: "recommend_group",
    date,
    age,
    level,
    modality: modality as "BABY" | "OCIO",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });

  try {
    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_ROLE_KEY || !GEMINI_API_KEY) {
      return json({ ok: false, error: "Servicio no disponible." }, 503);
    }

    const auth = await authorizeCoordinatorJefe(req);
    if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

    if (req.method === "GET") {
      return json({
        ok: true,
        service: "Paco Mitiquín",
        access: "coordinador_jefe",
        mode: "read-only",
        profile: auth.profile,
      });
    }

    if (req.method !== "POST") {
      return json({ ok: false, error: "Método no permitido." }, 405);
    }

    const body = await req.json().catch(() => ({}));

    const continuation = parseContinuation(body?.continuation);
    if (body?.continuation && !continuation) {
      return json({ ok: false, error: "Continuación no válida." }, 400);
    }

    let result: { answer: string; choices?: Choice[] };
    if (continuation) {
      result = {
        answer: await answerRecommendation({
          action: "recommend_group",
          date: continuation.date,
          modality: continuation.modality,
          level: continuation.level,
          age: continuation.age,
        }),
      };
    } else {
      const message = typeof body?.message === "string" ? body.message.trim() : "";
      if (!message) return json({ ok: false, error: "Escribe un mensaje para Paco." }, 400);
      if (message.length > 3000) {
        return json({ ok: false, error: "El mensaje es demasiado largo." }, 413);
      }
      result = await processMessage(message);
    }

    return json({
      ok: true,
      answer: result.answer,
      choices: result.choices || [],
      mode: "read-only",
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("mitico-paco-api error", msg);
    const userMessage = msg.includes("Read error")
      ? "He tenido un problema leyendo los datos de Mítico. No he modificado ningún dato."
      : "He tenido un problema procesando la consulta. Mítico sigue intacto.";
    return json({ ok: false, error: userMessage }, 500);
  }
});
