import "jsr:@supabase/functions-js/edge-runtime.d.ts";

// ---------------------------------------------------------------------------
// mitico-paco-acciones  (SOLO INTERPRETA; no lee ni escribe datos del club)
//
// Convierte una frase de Jose ("pasa a Lucía al jueves a las 17:00") en una
// intención estructurada: qué quiere hacer, con qué niño, a qué día y hora.
// Nada más. Buscar al niño, comprobar turnos, pedir confirmación y escribir lo
// hace la app en el navegador con la sesión de Jose y las funciones seguras de
// Supabase que ya usa la Agenda. Esta función no tiene acceso de escritura a
// nada: solo comprueba que quien pregunta es coordinador_jefe y llama a Gemini.
// Solo coordinador_jefe.
// ---------------------------------------------------------------------------

const U = Deno.env.get("SUPABASE_URL") || "";
const K = Deno.env.get("SUPABASE_ANON_KEY") || "";
const S = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""; // solo para comprobar el rol de quien pregunta
const G = Deno.env.get("GEMINI_API_KEY") || "";

const ROUTER_MODELS = ["gemini-3.5-flash-lite", "gemini-3.5-flash", "gemini-3.8-flash"];

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

export function norm(x: unknown) {
  return String(x ?? "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

const DIAS = ["domingo", "lunes", "martes", "miercoles", "jueves", "viernes", "sabado"];
const DIAS_BONITOS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

export function hoyMadrid(d = new Date()) {
  const iso = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
  const dow = new Date(`${iso}T12:00:00Z`).getUTCDay();
  return { iso, dia: DIAS_BONITOS[dow] };
}

// Filtro barato: solo frases que piden pasar/mover/cambiar a alguien de día/turno.
export function pareceMover(texto: string) {
  const n = norm(texto);
  if (n.length > 300) return false;
  const verbo = /\b(pasa|pasalo|pasala|pasar|mueve|muevelo|muevela|mover|cambia|cambialo|cambiala|cambiar|coloca|colocalo|colocala|colocar|ponlo|ponla|pon a|traslada|trasladar|reubica|reubicar)\b/.test(n);
  const destino = /\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo|turno|dia|hora|\d{1,2}[:.]\d{2}|a las \d{1,2}|\d{1,2}\/\d{1,2})\b/.test(n);
  return verbo && destino;
}

// Filtro barato (solo si el cliente no avisa de que es de disponibilidad): peticiones de
// preparar / enviar la disponibilidad semanal. Las consultas de «quién no ha respondido» NO van aquí.
export function pareceDisponibilidad(texto: string) {
  const n = norm(texto);
  if (n.length > 400) return false;
  if (/\b(no han respondido|sin responder|sin contestar|han respondido|han contestado|respondido|contestado|pendientes? de responder|recordatorio|recuerda|recordar|quien|quienes|cuantos|cuantas|retira|retirar|cierra|cerrar|resumen)\b/.test(n)) return false;
  const verbo = /\b(manda|mandar|mandale|mandales|mandala|envia|enviar|enviale|enviales|enviala|publica|publicar|publicala|prepara|preparar|preparame|abre|abrir|lanza|lanzar|saca|sacar|crea|crear|monta|montar|haz|hacer|genera|generar|pasa|pasar|pasales)\b/.test(n);
  if (!verbo) return false;
  if (/\bdisponibilidad(es)?\b/.test(n) || /\bturnos? de (la )?semana\b/.test(n)) return true;
  const semana = /\b(la|esta) semana\b/.test(n) || /\bsemana (que viene|proxima|siguiente)\b/.test(n);
  const dias = /\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo|turno|turnos)\b/.test(n);
  const otro = /\b(ocio|grupos?|informes?|reportes?|aim ?harder|aimhander|cobros?|baby|alumnos?|ninos?|entrenador(es)? de)\b/.test(n);
  return semana && dias && !otro;
}

// ---------- Gemini ----------------------------------------------------------------------

async function unModelo(model: string, sys: string, user: string, signal: AbortSignal): Promise<string> {
  const generationConfig: Record<string, unknown> = { temperature: 0, maxOutputTokens: 900, responseMimeType: "application/json" };
  const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-goog-api-key": G },
    body: JSON.stringify({ systemInstruction: { parts: [{ text: sys }] }, contents: [{ role: "user", parts: [{ text: user }] }], generationConfig }),
    signal,
  });
  const d = await r.json();
  if (!r.ok) throw new Error(`${model} ${r.status}`);
  return (d?.candidates?.[0]?.content?.parts || []).filter((p: any) => !p?.thought).map((p: any) => p?.text || "").join("").trim();
}

// Prueba los modelos en orden; si uno tarda mas de hedgeMs lanza el siguiente
// en paralelo y gana el primero que conteste.
export async function gemini(models: string[], sys: string, user: string, hedgeMs = 4000, timeoutMs = 12000): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    const ctrls: AbortController[] = [];
    let siguiente = 0, enCurso = 0, terminado = false, lastErr = "";
    let hedge: ReturnType<typeof setTimeout> | undefined;
    const fin = (f: () => void) => {
      if (terminado) return;
      terminado = true;
      if (hedge) clearTimeout(hedge);
      ctrls.forEach((c) => c.abort());
      f();
    };
    const lanzar = () => {
      if (terminado) return;
      if (hedge) { clearTimeout(hedge); hedge = undefined; }
      if (siguiente >= models.length) {
        if (enCurso === 0) fin(() => reject(new Error(`gemini: ${lastErr}`)));
        return;
      }
      const model = models[siguiente++];
      const c = new AbortController();
      ctrls.push(c);
      enCurso++;
      const limite = setTimeout(() => c.abort(), timeoutMs);
      unModelo(model, sys, user, c.signal).then(
        (t) => {
          clearTimeout(limite); enCurso--;
          if (t) fin(() => resolve(t)); else { lastErr = `${model} vacio`; lanzar(); }
        },
        (e) => {
          clearTimeout(limite); enCurso--;
          if (terminado) return;
          lastErr = `${model} ${c.signal.aborted ? "tiempo agotado" : String(e).slice(0, 80)}`;
          lanzar();
        },
      );
      if (siguiente < models.length) hedge = setTimeout(lanzar, hedgeMs);
    };
    lanzar();
  });
}

function parseJson(t: string): any {
  const s = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
  try { return JSON.parse(s); } catch {
    const a = s.indexOf("{"), b = s.lastIndexOf("}");
    if (a >= 0 && b > a) return JSON.parse(s.slice(a, b + 1));
    throw new Error("json");
  }
}

// ---------- Saneado de lo que devuelve Gemini ----------------------------------------------

function dia(v: unknown): string | null {
  const t = norm(v);
  if (DIAS.includes(t)) return t;
  // plurales: "sabados", "domingos"
  const singular = t.replace(/s$/, "");
  return DIAS.includes(singular) ? singular : null;
}
function fecha(v: unknown): string | null {
  const t = String(v ?? "").trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  return Number.isNaN(new Date(`${t}T12:00:00Z`).getTime()) ? null : t;
}
function hora(v: unknown): string | null {
  const m = String(v ?? "").trim().match(/^(\d{1,2})(?:[:.hH](\d{2}))?/);
  if (!m) return null;
  const h = Number(m[1]), mi = Number(m[2] ?? 0);
  if (h > 23 || mi > 59) return null;
  return `${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
}
function texto(v: unknown, max: number): string | null {
  const t = String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
  return t || null;
}

export type Intent = {
  accion: "mover_alumno" | "listar_pendientes" | "ninguna";
  alumno: string | null;
  dia_destino: string | null;
  fecha_destino: string | null;
  hora_destino: string | null;
  dia_origen: string | null;
  fecha_origen: string | null;
  hora_origen: string | null;
};

export function limpiarIntent(o: any): Intent {
  const x = o && typeof o === "object" ? o : {};
  const accion = x.accion === "mover_alumno" || x.accion === "listar_pendientes" ? x.accion : "ninguna";
  const alumno = texto(x.alumno, 80);
  // Mover sin saber a quién no sirve: se devuelve sin accion y la app pregunta.
  return {
    accion,
    alumno,
    dia_destino: dia(x.dia_destino),
    fecha_destino: fecha(x.fecha_destino),
    hora_destino: hora(x.hora_destino),
    dia_origen: dia(x.dia_origen),
    fecha_origen: fecha(x.fecha_origen),
    hora_origen: hora(x.hora_origen),
  };
}

const SYS = (hoy: { iso: string; dia: string }) => `Eres el intérprete de Paco, el asistente de Jose (coordinador de una escuela de esquí infantil). Jose escribe frases cortas. Tu único trabajo es extraer qué pide. Devuelve SOLO un JSON con estas claves:
- accion: "mover_alumno" si pide pasar/mover/cambiar de día, turno u hora a UN niño concreto; "listar_pendientes" si pide ver los niños sin grupo, sin nivel o por colocar; "ninguna" en cualquier otro caso (preguntas, redactar mensajes, tareas, altas de test, entrenadores, disponibilidad, responder a padres...).
- alumno: el nombre del niño tal como lo dice Jose (con apellidos si los dice). Nunca nombres de padres ni de entrenadores. null si no lo dice.
- dia_destino: día de la semana al que lo pasa (lunes, martes, miercoles, jueves, viernes, sabado, domingo) o null.
- fecha_destino: YYYY-MM-DD SOLO si Jose da una fecha concreta o relativa ("el 17", "mañana", "pasado mañana", "el sábado 24"); resuélvela con la fecha de hoy. Si solo dice un día de la semana, deja fecha_destino en null y rellena dia_destino.
- hora_destino: HH:MM en 24 h o null ("a las 5 de la tarde" = 17:00; "a las 10" = 10:00; "por la tarde" sin hora = null).
- dia_origen, fecha_origen, hora_origen: de dónde sale, SOLO si lo dice ("del sábado de las 12" → dia_origen sabado, hora_origen 12:00). Si no lo dice, null.
NO inventes nada: lo que Jose no diga es null. Hoy es ${hoy.dia} ${hoy.iso} (hora de Madrid).
Ejemplos:
"pasa a Lucía García al jueves a las 17:00" → {"accion":"mover_alumno","alumno":"Lucía García","dia_destino":"jueves","fecha_destino":null,"hora_destino":"17:00","dia_origen":null,"fecha_origen":null,"hora_origen":null}
"mueve a Pau del sábado al domingo" → {"accion":"mover_alumno","alumno":"Pau","dia_destino":"domingo","fecha_destino":null,"hora_destino":null,"dia_origen":"sabado","fecha_origen":null,"hora_origen":null}
"cambia a Nuo al turno de las 10" → {"accion":"mover_alumno","alumno":"Nuo","dia_destino":null,"fecha_destino":null,"hora_destino":"10:00","dia_origen":null,"fecha_origen":null,"hora_origen":null}
"qué niños están sin grupo" → {"accion":"listar_pendientes","alumno":null,"dia_destino":null,"fecha_destino":null,"hora_destino":null,"dia_origen":null,"fecha_origen":null,"hora_origen":null}
"cambia el tono del mensaje, más corto" → {"accion":"ninguna","alumno":null,"dia_destino":null,"fecha_destino":null,"hora_destino":null,"dia_origen":null,"fecha_origen":null,"hora_origen":null}`;

// ---------- Disponibilidad semanal -----------------------------------------------------------

const MODALIDADES = ["Baby", "Ocio", "Intensivos"];
const OPS = ["quitar_dia", "quitar_turno", "anadir_turno", "cambiar_turno", "cambiar_modalidades", "activar_dia", "solo_dias", "fecha_limite"];

function modalidades(v: unknown): string[] {
  const lista = Array.isArray(v) ? v : typeof v === "string" ? [v] : [];
  const out: string[] = [];
  for (const x of lista) {
    const t = norm(x);
    const m = t.startsWith("baby") ? "Baby" : t.startsWith("ocio") ? "Ocio" : t.startsWith("intensiv") ? "Intensivos" : null;
    if (m && MODALIDADES.includes(m) && !out.includes(m)) out.push(m);
  }
  return out;
}

function numeroTurno(v: unknown): number | null {
  const n = Number(v);
  if (!Number.isInteger(n)) return null;
  return n === -1 || (n >= 1 && n <= 6) ? n : null;
}

function fechaHora(v: unknown): string | null {
  const m = String(v ?? "").trim().match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})/);
  if (!m) return null;
  if (Number.isNaN(new Date(`${m[1]}-${m[2]}-${m[3]}T12:00:00Z`).getTime())) return null;
  const h = Number(m[4]), mi = Number(m[5]);
  if (h > 23 || mi > 59) return null;
  return `${m[1]}-${m[2]}-${m[3]}T${String(h).padStart(2, "0")}:${String(mi).padStart(2, "0")}`;
}

export type OpDisp = {
  op: string; dia: string | null; dias: string[];
  hora_inicio: string | null; hora_fin: string | null;
  hora_inicio_nueva: string | null; hora_fin_nueva: string | null;
  numero_turno: number | null;
  modalidades: string[]; fecha_limite: string | null;
};
export type IntentDisp = {
  accion: "editar_disponibilidad" | "ninguna";
  semana_fecha: string | null;
  semana_relativa: "esta" | "proxima" | null;
  desde_cero: boolean;
  enviar: boolean;
  ops: OpDisp[];
};

export function limpiarDisp(o: any): IntentDisp {
  const x = o && typeof o === "object" ? o : {};
  const rel = norm(x.semana_relativa);
  const ops: OpDisp[] = (Array.isArray(x.ops) ? x.ops : []).slice(0, 12).map((p: any) => {
    if (!p || typeof p !== "object" || !OPS.includes(String(p.op))) return null;
    return {
      op: String(p.op),
      dia: dia(p.dia),
      dias: (Array.isArray(p.dias) ? p.dias : []).map(dia).filter((d: string | null): d is string => !!d),
      hora_inicio: hora(p.hora_inicio),
      hora_fin: hora(p.hora_fin),
      hora_inicio_nueva: hora(p.hora_inicio_nueva),
      hora_fin_nueva: hora(p.hora_fin_nueva),
      numero_turno: numeroTurno(p.numero_turno),
      modalidades: modalidades(p.modalidades),
      fecha_limite: fechaHora(p.fecha_limite),
    };
  }).filter((p: OpDisp | null): p is OpDisp => !!p);
  return {
    accion: x.accion === "editar_disponibilidad" ? "editar_disponibilidad" : "ninguna",
    semana_fecha: fecha(x.semana_fecha),
    semana_relativa: rel.startsWith("prox") ? "proxima" : rel === "esta" ? "esta" : null,
    desde_cero: x.desde_cero === true,
    enviar: x.enviar === true,
    ops,
  };
}

// Calendario de los próximos días para que Gemini no tenga que calcular fechas.
function calendario(hoyIso: string): string {
  const out: string[] = [];
  for (let i = 0; i < 21; i++) {
    const d = new Date(`${hoyIso}T12:00:00Z`);
    d.setUTCDate(d.getUTCDate() + i);
    out.push(`${DIAS_BONITOS[d.getUTCDay()]} ${d.toISOString().slice(0, 10)}`);
  }
  return out.join("; ");
}

const SYS_DISP = (hoy: { iso: string; dia: string }) => `Eres el intérprete de Paco, el asistente de Jose (coordinador de una escuela de esquí infantil). Jose pide preparar o enviar la DISPONIBILIDAD SEMANAL de los entrenadores (los días y turnos de la semana en los que tienen que decir si pueden trabajar). La semana tiene días de miércoles a domingo; lunes y martes NO admiten clases. Tu único trabajo es extraer qué cambios pide sobre la plantilla/borrador. Devuelve SOLO un JSON con estas claves:
- accion: "editar_disponibilidad" si pide preparar, enviar, publicar, abrir, cambiar o ajustar la disponibilidad de una semana; "ninguna" en cualquier otro caso.
- semana_fecha: YYYY-MM-DD solo si dice una fecha concreta de esa semana; si no, null.
- semana_relativa: "esta" si dice «esta semana», "proxima" si dice «la próxima semana / la semana que viene»; si no dice nada, null.
- desde_cero: true solo si pide partir de la plantilla habitual, empezar de cero o descartar lo anterior.
- enviar: true si habla de mandar / enviar / publicar a los entrenadores; false si solo habla de preparar o guardar.
- ops: lista (puede estar vacía) de cambios, EN EL ORDEN en que los dice. Cada uno es un objeto con claves: op, dia, dias, hora_inicio, hora_fin, hora_inicio_nueva, hora_fin_nueva, numero_turno, modalidades, fecha_limite (lo que no aplique, null o []).
  op puede ser:
  "quitar_dia" (dia): quita un día entero.
  "quitar_turno" (dia, y hora_inicio si dice a qué hora empieza ese turno, o numero_turno si dice «el primer/segundo/tercer turno» o «el turno 3» = 1, 2, 3; «el último turno» = -1): quita un turno de un día.
  "anadir_turno" (dia, hora_inicio, hora_fin si la dice, modalidades si las dice).
  "cambiar_turno" (dia, hora_inicio = hora actual del turno si la dice o numero_turno, hora_inicio_nueva y/o hora_fin_nueva).
  "cambiar_modalidades" (dia, hora_inicio si es un turno concreto, modalidades: lista con Baby, Ocio, Intensivos).
  "activar_dia" (dia): vuelve a poner un día con sus turnos habituales.
  "solo_dias" (dias): deja SOLO esos días y quita el resto («solo sábado y domingo»).
  "fecha_limite" (fecha_limite: YYYY-MM-DDTHH:MM): cambia hasta cuándo pueden responder.
dia y dias usan: miercoles, jueves, viernes, sabado, domingo (también lunes, martes si Jose los dice). Horas en HH:MM de 24 h («a las 5 de la tarde» = 17:00; «las 12» = 12:00).
NO inventes: lo que Jose no diga es null. Si da una hora de fin que no dice, deja hora_fin en null.
Hoy es ${hoy.dia} ${hoy.iso} (hora de Madrid). Si habla de «la semana» y de días o turnos sin decir la palabra disponibilidad, también es esto. Calendario: ${calendario(hoy.iso)}.
Ejemplos:
"manda la disponibilidad de esta semana a los entrenadores" → {"accion":"editar_disponibilidad","semana_fecha":null,"semana_relativa":"esta","desde_cero":false,"enviar":true,"ops":[]}
"prepara la disponibilidad de la próxima semana sin el domingo de las 12 y sin el viernes" → {"accion":"editar_disponibilidad","semana_fecha":null,"semana_relativa":"proxima","desde_cero":false,"enviar":false,"ops":[{"op":"quitar_turno","dia":"domingo","dias":[],"hora_inicio":"12:00","hora_fin":null,"hora_inicio_nueva":null,"hora_fin_nueva":null,"modalidades":[],"fecha_limite":null},{"op":"quitar_dia","dia":"viernes","dias":[],"hora_inicio":null,"hora_fin":null,"hora_inicio_nueva":null,"hora_fin_nueva":null,"modalidades":[],"fecha_limite":null}]}
"añade el jueves de 17:00 a 19:00 solo Baby" → {"accion":"editar_disponibilidad","semana_fecha":null,"semana_relativa":null,"desde_cero":false,"enviar":false,"ops":[{"op":"anadir_turno","dia":"jueves","dias":[],"hora_inicio":"17:00","hora_fin":"19:00","hora_inicio_nueva":null,"hora_fin_nueva":null,"modalidades":["Baby"],"fecha_limite":null}]}
"solo sábado y domingo y manda" → {"accion":"editar_disponibilidad","semana_fecha":null,"semana_relativa":null,"desde_cero":false,"enviar":true,"ops":[{"op":"solo_dias","dia":null,"dias":["sabado","domingo"],"hora_inicio":null,"hora_fin":null,"hora_inicio_nueva":null,"hora_fin_nueva":null,"modalidades":[],"fecha_limite":null}]}
"cambia el turno del sábado de las 12 a las 12:30" → {"accion":"editar_disponibilidad","semana_fecha":null,"semana_relativa":null,"desde_cero":false,"enviar":false,"ops":[{"op":"cambiar_turno","dia":"sabado","dias":[],"hora_inicio":"12:00","hora_fin":null,"hora_inicio_nueva":"12:30","hora_fin_nueva":null,"modalidades":[],"fecha_limite":null}]}
"prepara la semana que viene quitando el jueves y el sábado el 3 turno" → {"accion":"editar_disponibilidad","semana_fecha":null,"semana_relativa":"proxima","desde_cero":false,"enviar":false,"ops":[{"op":"quitar_dia","dia":"jueves","dias":[],"hora_inicio":null,"hora_fin":null,"hora_inicio_nueva":null,"hora_fin_nueva":null,"numero_turno":null,"modalidades":[],"fecha_limite":null},{"op":"quitar_turno","dia":"sabado","dias":[],"hora_inicio":null,"hora_fin":null,"hora_inicio_nueva":null,"hora_fin_nueva":null,"numero_turno":3,"modalidades":[],"fecha_limite":null}]}
"cambia el mensaje de los padres" → {"accion":"ninguna","semana_fecha":null,"semana_relativa":null,"desde_cero":false,"enviar":false,"ops":[]}`;

export async function interpretarDisp(msg: string): Promise<IntentDisp> {
  const raw = await gemini(ROUTER_MODELS, SYS_DISP(hoyMadrid()), msg.slice(0, 600));
  return limpiarDisp(parseJson(raw));
}

export async function interpretar(msg: string): Promise<Intent> {
  const raw = await gemini(ROUTER_MODELS, SYS(hoyMadrid()), msg.slice(0, 600));
  return limpiarIntent(parseJson(raw));
}


// ---------- Enrutador: Gemini decide qué quiere Jose --------------------------------------------
// Antes, unas listas de palabras en la app decidían si un mensaje llegaba aquí. Ahora llega TODO
// (contexto "auto") y es Gemini quien clasifica; las listas de palabras solo quedan como respaldo
// en la app por si este servicio falla.

export const TEMAS = [
  "disponibilidad",
  "mover_alumno",
  "listar_pendientes",
  "aimharder",
  "capacidades",
  "confirmar_propuesta",
  "cancelar_propuesta",
  "orden_no_soportada",
  "otro",
] as const;
export type Tema = (typeof TEMAS)[number];

export type Ruta = { tema: Tema; ajusta_propuesta: boolean };

export function limpiarRuta(o: any, hayPropuesta: boolean): Ruta {
  const x = o && typeof o === "object" ? o : {};
  let tema: Tema = (TEMAS as readonly string[]).includes(x.tema) ? (x.tema as Tema) : "otro";
  // Sin propuesta abierta no hay nada que confirmar, cancelar ni ajustar.
  if (!hayPropuesta && (tema === "confirmar_propuesta" || tema === "cancelar_propuesta")) tema = "otro";
  return { tema, ajusta_propuesta: hayPropuesta && x.ajusta_propuesta === true && tema === "disponibilidad" };
}

const SYS_RUTA = (hoy: { iso: string; dia: string }, propuesta: string | null) => `Eres el clasificador de Paco, el asistente de Jose (coordinador de una escuela de esquí infantil con las áreas Baby, Ocio e Intensivos). Jose escribe frases cortas, a veces con faltas o a medias. Tu único trabajo es decidir QUÉ QUIERE. Devuelve SOLO un JSON: {"tema": "...", "ajusta_propuesta": true|false}.
Valores de tema:
- "disponibilidad": prepara, envía, publica o ajusta la DISPONIBILIDAD SEMANAL de los entrenadores (qué días y turnos de la semana hay, quitar o añadir días, turnos u horas, modalidades, fecha límite para responder). También cuando habla de «la semana» con días o turnos sin decir la palabra disponibilidad.
- "mover_alumno": pasar, mover o cambiar de día/turno a UN niño concreto («pasa a Lucía al jueves»).
- "listar_pendientes": ver los niños sin grupo, sin nivel o por colocar.
- "aimharder": pide cargar, traer, volcar, importar o copiar listados/niños de AimHarder.
- "capacidades": pregunta qué sabe o puede hacer Paco, o si puede hacer algo («¿qué puedes hacer?», «¿puedes mover a algún niño?» sin decir a quién).
- "confirmar_propuesta": SOLO si hay propuesta abierta y pide darla por buena / enviarla / guardarla («vale, envíala», «hazlo»).
- "cancelar_propuesta": SOLO si hay propuesta abierta y pide dejarla, descartarla o cancelarla.
- "orden_no_soportada": ORDEN de cambiar datos de la app que no es ninguna de las anteriores: crear o borrar grupos, mover niños de Ocio, cambiar niveles, editar turnos ya publicados, modificar reportes, entrenadores, cobros o fichas.
- "otro": todo lo demás: preguntas y consultas (resúmenes, reportes pendientes, quién ha respondido, datos de un niño), redactar o corregir mensajes, responder a padres, tareas y recordatorios, altas de test, charla.
En la duda entre una acción y "otro", elige "otro". Una pregunta NO es una orden.
ajusta_propuesta: true solo si tema es "disponibilidad" y hay propuesta abierta y el mensaje es un AJUSTE de esa propuesta (quitar/añadir/cambiar algo, también con frases cortas o participios como «el turno del sábado quitado» o «y el domingo fuera»); false si pide una disponibilidad nueva y completa de otra semana o desde cero.
${propuesta ? `HAY UNA PROPUESTA DE DISPONIBILIDAD ABIERTA en pantalla (Jose ve una tarjeta con botones). Resumen: ${propuesta}\nMientras está abierta, los mensajes cortos que mencionan un día, turno, hora o modalidad son casi siempre ajustes de esa propuesta.` : "NO hay ninguna propuesta abierta."}
Hoy es ${hoy.dia} ${hoy.iso} (hora de Madrid).
Ejemplos:
"prepara la semana que viene quitando el jueves y el sábado el 3 turno" → {"tema":"disponibilidad","ajusta_propuesta":false}
"manda la disponibilidad a los entrenadores" → {"tema":"disponibilidad","ajusta_propuesta":false}
"14:30–16:30 este turno del sabado quitado" (con propuesta abierta) → {"tema":"disponibilidad","ajusta_propuesta":true}
"y el domingo tambien fuera" (con propuesta abierta) → {"tema":"disponibilidad","ajusta_propuesta":true}
"vale envíala" (con propuesta abierta) → {"tema":"confirmar_propuesta","ajusta_propuesta":false}
"déjalo, no la mandes" (con propuesta abierta) → {"tema":"cancelar_propuesta","ajusta_propuesta":false}
"pasa a Lucía García al jueves a las 17:00" → {"tema":"mover_alumno","ajusta_propuesta":false}
"qué niños están sin grupo" → {"tema":"listar_pendientes","ajusta_propuesta":false}
"paco puedes cargar los niños de aimhander para la próxima semana" → {"tema":"aimharder","ajusta_propuesta":false}
"puedes mover a algún niño?" → {"tema":"capacidades","ajusta_propuesta":false}
"crea los grupos del sábado de Baby" → {"tema":"orden_no_soportada","ajusta_propuesta":false}
"pasa a Pau de Ocio al grupo de las 12" → {"tema":"orden_no_soportada","ajusta_propuesta":false}
"dame un resumen operativo de hoy" → {"tema":"otro","ajusta_propuesta":false}
"quién no ha respondido la disponibilidad" → {"tema":"otro","ajusta_propuesta":false}
"recuérdame llamar a la familia de Nuo mañana" → {"tema":"otro","ajusta_propuesta":false}
"hazme un mensaje para los padres de Baby del sábado" → {"tema":"otro","ajusta_propuesta":false}`;

export async function clasificar(msg: string, propuesta: string | null): Promise<Ruta> {
  const raw = await gemini(ROUTER_MODELS, SYS_RUTA(hoyMadrid(), propuesta), msg.slice(0, 600));
  return limpiarRuta(parseJson(raw), Boolean(propuesta));
}

// ---------- Acceso ----------------------------------------------------------------------------

async function authorize(req: Request): Promise<string | null> {
  const a = req.headers.get("Authorization") || "";
  if (!a.startsWith("Bearer ")) return null;
  const ur = await fetch(U + "/auth/v1/user", { headers: { apikey: K, Authorization: a } });
  if (!ur.ok) return null;
  const u = await ur.json();
  if (!u?.id) return null;
  const r = await fetch(`${U}/rest/v1/usuarios_app?select=rol&auth_user_id=eq.${encodeURIComponent(String(u.id))}&activo=eq.true&limit=1`, {
    headers: { apikey: S, Authorization: `Bearer ${S}`, Accept: "application/json" },
  });
  if (!r.ok) return null;
  const rows = await r.json();
  return Array.isArray(rows) && rows[0]?.rol === "coordinador_jefe" ? String(u.id) : null;
}

// ---------- Servidor ----------------------------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (!U || !K || !S || !G) return J({ ok: false, error: "Servicio no disponible." }, 503);
  try {
    const uid = await authorize(req);
    if (!uid) return J({ ok: false, error: "Acceso restringido a coordinador_jefe." }, 403);
    if (req.method === "GET") return J({ ok: true, handled: true, access: "coordinador_jefe", service: "mitico-paco-acciones" });
    if (req.method !== "POST") return J({ ok: false, error: "Método no permitido." }, 405);
    const b = await req.json().catch(() => ({}));
    const msg = typeof b.message === "string" ? b.message.trim() : "";
    if (!msg) return J({ ok: false, error: "Escribe un mensaje." }, 400);
    // El cliente indica el tipo de frase («disponibilidad»); si no, se decide con filtros baratos.
    const contexto = typeof b.contexto === "string" ? b.contexto : "";
    if (contexto === "auto") {
      // Estado que la app tiene abierto (solo texto corto y propio de Jose).
      const abierta = typeof b.propuesta_abierta === "string" && b.propuesta_abierta.trim() ? b.propuesta_abierta.trim().slice(0, 500) : null;
      try {
        const ruta = await clasificar(msg, abierta);
        if (ruta.tema === "disponibilidad") {
          const intent = await interpretarDisp(msg);
          if (intent.accion === "ninguna") return J({ ok: true, handled: true, tema: "otro", ajusta_propuesta: false });
          return J({ ok: true, handled: true, tema: "disponibilidad", ajusta_propuesta: ruta.ajusta_propuesta, intent });
        }
        if (ruta.tema === "mover_alumno") {
          const intent = await interpretar(msg);
          if (intent.accion !== "mover_alumno") return J({ ok: true, handled: true, tema: "otro", ajusta_propuesta: false });
          return J({ ok: true, handled: true, tema: "mover_alumno", ajusta_propuesta: false, intent });
        }
        return J({ ok: true, handled: true, tema: ruta.tema, ajusta_propuesta: false });
      } catch (e) {
        console.error("mitico-paco-acciones auto", e);
        return J({ ok: false, error: "No he podido interpretar la petición ahora mismo." }, 502);
      }
    }
    if (contexto === "disponibilidad" || (!contexto && pareceDisponibilidad(msg))) {
      try {
        const intent = await interpretarDisp(msg);
        if (intent.accion === "ninguna") return J({ ok: true, handled: false });
        return J({ ok: true, handled: true, intent });
      } catch (e) {
        console.error("mitico-paco-acciones disponibilidad", e);
        return J({ ok: false, error: "No he podido interpretar la petición ahora mismo." }, 502);
      }
    }
    if (!pareceMover(msg)) return J({ ok: true, handled: false });
    try {
      const intent = await interpretar(msg);
      if (intent.accion === "ninguna") return J({ ok: true, handled: false });
      return J({ ok: true, handled: true, intent });
    } catch (e) {
      console.error("mitico-paco-acciones", e);
      return J({ ok: false, error: "No he podido interpretar la petición ahora mismo." }, 502);
    }
  } catch (e) {
    console.error("mitico-paco-acciones fatal", e);
    return J({ ok: false, error: "Error interno." }, 500);
  }
});
