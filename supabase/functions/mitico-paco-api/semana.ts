// ---------------------------------------------------------------------------
// semana.ts - Revision semanal de Paco ("la revision del martes").
//
// 100% SOLO LECTURA y SIN llamadas a Gemini: cruza datos reales de Mitico
// (disponibilidad de entrenadores, grupos, alumnos, niveles, asignaciones) y
// devuelve un diagnostico con prioridades.
//
// Esta pensado para usarse desde:
//   - mitico-paco-api   (cuando se lo preguntas en la app, por texto o por voz)
//   - mitico-paco-semana (el aviso automatico del martes a las 13:00)
// ---------------------------------------------------------------------------

type Row = Record<string, any>;
export type DbGet = (table: string, params: Record<string, string>) => Promise<Row[]>;

// Umbrales (ajustables). Salen de los grupos reales de las ultimas semanas:
// BABY normalmente 2-4 alumnos, OCIO 3-6.
export const CONFIG = {
  maxGrupo: { BABY: 4, OCIO: 6 } as Record<string, number>,
  saltoNivelAviso: 2, // diferencia de escalones de nivel dentro de un grupo
  turnoFlojoMaxAlumnos: 2, // alumnos totales en un turno para considerarlo "flojo"
  edadDispar: { BABY: 3, OCIO: 4 } as Record<string, number>, // anios de diferencia
};

// ------------------------------- utilidades --------------------------------

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9+ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function addDays(iso: string, days: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

function fmtDate(iso: string) {
  const [y, m, d] = iso.split("-");
  return `${d}/${m}/${y}`;
}

function fmtShort(iso: string) {
  const [, m, d] = iso.split("-");
  return `${d}/${m}`;
}

function fmtTime(value: string | null | undefined) {
  return value ? value.slice(0, 5) : "--:--";
}

function dayName(iso: string) {
  const name = new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", weekday: "long" }).format(
    new Date(`${iso}T12:00:00Z`),
  );
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function madridDeadline(value: string | null | undefined) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat("es-ES", {
    timeZone: "Europe/Madrid",
    weekday: "long",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(d);
  return parts;
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

function titleCase(name: string) {
  return name
    .toLowerCase()
    .split(" ")
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function firstNames(name: string) {
  const t = titleCase(name).split(" ");
  return t.slice(0, 2).join(" ");
}

function plural(n: number, one: string, many: string) {
  return n === 1 ? one : many;
}

// ------------------------------ carga de datos ------------------------------

export type WeekData = {
  weekStart: string;
  semana: Row | null;
  turnos: Row[]; // filas de disponibilidad_turnos_editor (ya filtradas a una version)
  respuestas: Row[];
  entrenadores: Row[]; // activos
  niveles: Row[];
  modalidades: Row[];
  sesiones: Row[];
  grupos: Row[];
  miembros: Row[]; // grupo_alumnos
  asignaciones: Row[];
  alumnos: Row[];
};

export async function loadWeekData(dbGet: DbGet, weekStart: string): Promise<WeekData> {
  const weekEnd = addDays(weekStart, 6);

  const [semanas, sesiones, modalidades, niveles, entrenadores] = await Promise.all([
    dbGet("disponibilidad_semanas_editor", {
      select: "id,semana_inicio,estado,fecha_limite_borrador,fecha_limite_publicada",
      semana_inicio: `eq.${weekStart}`,
      limit: "1",
    }),
    dbGet("sesiones", {
      select: "id,fecha,hora_inicio,hora_fin,modalidad_id",
      fecha: `gte.${weekStart}`,
      and: `(fecha.lte.${weekEnd})`,
      order: "fecha.asc,hora_inicio.asc",
      limit: "200",
    }),
    dbGet("modalidades", { select: "id,codigo,nombre", activa: "eq.true" }),
    dbGet("niveles", { select: "id,codigo,orden", activo: "eq.true", order: "orden.asc" }),
    dbGet("entrenadores", {
      select: "id,nombre_completo",
      activo: "eq.true",
      order: "nombre_completo.asc",
      limit: "200",
    }),
  ]);

  const semana = semanas?.[0] || null;

  let turnos: Row[] = [];
  let respuestas: Row[] = [];
  if (semana) {
    const [turnosRaw, resp] = await Promise.all([
      dbGet("disponibilidad_turnos_editor", {
        select: "turno_clave,fecha,hora_inicio,hora_fin,modalidades,version_tipo,orden",
        semana_id: `eq.${semana.id}`,
        order: "fecha.asc,hora_inicio.asc",
        limit: "400",
      }),
      dbGet("disponibilidad_respuestas_editor", {
        select: "turno_clave,entrenador_id,respuesta",
        semana_id: `eq.${semana.id}`,
        limit: "3000",
      }),
    ]);
    // Cada turno existe en dos versiones (publicado y borrador). Usamos la publicada.
    const publicados = turnosRaw.filter((t) => t.version_tipo === "publicado");
    turnos = publicados.length ? publicados : turnosRaw.filter((t) => t.version_tipo === "borrador");
    respuestas = resp;
  }

  let grupos: Row[] = [];
  let miembros: Row[] = [];
  let asignaciones: Row[] = [];
  let alumnos: Row[] = [];
  if (sesiones.length) {
    const sesionIds = sesiones.map((s) => String(s.id));
    grupos = await dbGet("grupos", {
      select: "id,sesion_id,modalidad_id,nombre_grupo,nivel_grupo,estado,publicado,ratio_ok,excepcion_ratio,cancelado",
      sesion_id: `in.(${sesionIds.join(",")})`,
      cancelado: "eq.false",
    });
    if (grupos.length) {
      const groupIds = grupos.map((g) => String(g.id));
      [miembros, asignaciones] = await Promise.all([
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
      const alumnoIds = [...new Set(miembros.map((m) => String(m.alumno_id)))];
      if (alumnoIds.length) {
        alumnos = await dbGet("alumnos", {
          select: "id,nombre_completo,fecha_nacimiento,nivel_actual_id,nivel_estimado_id",
          id: `in.(${alumnoIds.join(",")})`,
        });
      }
    }
  }

  return {
    weekStart,
    semana,
    turnos,
    respuestas,
    entrenadores,
    niveles,
    modalidades,
    sesiones,
    grupos,
    miembros,
    asignaciones,
    alumnos,
  };
}

// -------------------------------- analisis ----------------------------------

type Resp = "D" | "N" | "P" | "-";

type AlumnoInfo = { nombre: string; edad: number | null; nivel: string | null; orden: number | null };

type GrupoInfo = {
  id: string;
  fecha: string;
  hi: string;
  hf: string;
  mod: string;
  nombre: string;
  nivelEtiqueta: string | null;
  estado: string | null;
  publicado: boolean;
  ratioOk: boolean | null;
  excepcion: boolean;
  alumnos: AlumnoInfo[];
  entrenadores: { id: string; nombre: string; conf: string | null; resp: Resp | null }[];
  turnoClave: string | null;
};

export type Severity = "alta" | "media" | "baja";

export type Finding = {
  severity: Severity;
  area: "cobertura" | "entrenador" | "grupo" | "turno" | "datos";
  text: string;
  suggestion?: string;
};

export type TurnoInfo = {
  clave: string;
  fecha: string;
  hi: string;
  hf: string;
  disponibles: string[];
  noPuedo: string[];
  pendientes: string[];
  sinFila: string[];
  necesarios: number;
  grupos: number;
  alumnos: number;
  estado: "sin_grupos" | "ok" | "riesgo" | "no_cubierto";
};

export type Review = {
  weekStart: string;
  weekEnd: string;
  hasAvailability: boolean;
  estadoSemana: string | null;
  limite: string | null;
  verdict: "FACTIBLE" | "FACTIBLE_CON_RIESGOS" | "NO_FACTIBLE" | "SIN_DATOS";
  totals: {
    gruposConAlumnos: number;
    gruposTotal: number;
    alumnos: number;
    entrenadoresActivos: number;
    contestaronTodo: number;
    contestaronParte: number;
    sinContestar: number;
  };
  turnos: TurnoInfo[];
  sinContestarNada: string[];
  parciales: string[];
  findings: Finding[];
  fueraDeTurnos: string[];
  actions: string[];
};

export function analyzeWeek(data: WeekData): Review {
  const weekEnd = addDays(data.weekStart, 6);
  const modById = new Map(data.modalidades.map((m) => [String(m.id), String(m.codigo).toUpperCase()]));
  const nivelById = new Map(data.niveles.map((n) => [String(n.id), { codigo: String(n.codigo), orden: Number(n.orden) }]));
  const activos = new Map(data.entrenadores.map((e) => [String(e.id), String(e.nombre_completo)]));
  const sesionById = new Map(data.sesiones.map((s) => [String(s.id), s]));
  const alumnoById = new Map(data.alumnos.map((a) => [String(a.id), a]));

  const respMap = new Map<string, Resp>();
  for (const r of data.respuestas) {
    const v = String(r.respuesta || "");
    const code: Resp = v === "Disponible" ? "D" : v === "No puedo" ? "N" : v === "Pendiente" ? "P" : "-";
    respMap.set(`${r.turno_clave}|${r.entrenador_id}`, code);
  }

  // ---------- grupos con su informacion ----------
  const miembrosPorGrupo = new Map<string, Row[]>();
  for (const m of data.miembros) {
    const k = String(m.grupo_id);
    (miembrosPorGrupo.get(k) || miembrosPorGrupo.set(k, []).get(k)!).push(m);
  }
  const asigPorGrupo = new Map<string, Row[]>();
  for (const a of data.asignaciones) {
    const k = String(a.grupo_id);
    (asigPorGrupo.get(k) || asigPorGrupo.set(k, []).get(k)!).push(a);
  }

  const turnoDe = (fecha: string, hi: string) =>
    data.turnos.find((t) => t.fecha === fecha && String(t.hora_inicio) <= hi && hi < String(t.hora_fin)) || null;

  const grupos: GrupoInfo[] = data.grupos
    .map((g) => {
      const s = sesionById.get(String(g.sesion_id));
      if (!s) return null;
      const turno = turnoDe(String(s.fecha), String(s.hora_inicio));
      const clave = turno ? String(turno.turno_clave) : null;
      const alumnos: AlumnoInfo[] = (miembrosPorGrupo.get(String(g.id)) || []).map((m) => {
        const a = alumnoById.get(String(m.alumno_id));
        const nivel = a ? nivelById.get(String(a.nivel_actual_id || a.nivel_estimado_id || "")) : undefined;
        return {
          nombre: a ? String(a.nombre_completo) : "Alumno sin ficha",
          edad: a ? ageOnDate(a.fecha_nacimiento, String(s.fecha)) : null,
          nivel: nivel ? nivel.codigo : null,
          orden: nivel ? nivel.orden : null,
        };
      });
      const entrenadores = (asigPorGrupo.get(String(g.id)) || []).map((a) => {
        const id = String(a.entrenador_id);
        return {
          id,
          nombre: activos.get(id) || "Entrenador sin ficha activa",
          conf: a.estado_confirmacion ? String(a.estado_confirmacion) : null,
          resp: clave ? (respMap.get(`${clave}|${id}`) ?? "-") : null,
        };
      });
      return {
        id: String(g.id),
        fecha: String(s.fecha),
        hi: String(s.hora_inicio),
        hf: String(s.hora_fin || ""),
        mod: modById.get(String(g.modalidad_id)) || modById.get(String(s.modalidad_id)) || "",
        nombre: String(g.nombre_grupo || "Grupo"),
        nivelEtiqueta: g.nivel_grupo ? String(g.nivel_grupo) : null,
        estado: g.estado ? String(g.estado) : null,
        publicado: g.publicado === true,
        ratioOk: typeof g.ratio_ok === "boolean" ? g.ratio_ok : null,
        excepcion: g.excepcion_ratio === true,
        alumnos,
        entrenadores,
        turnoClave: clave,
      } as GrupoInfo;
    })
    .filter((g): g is GrupoInfo => g !== null)
    .sort((a, b) => `${a.fecha} ${a.hi} ${a.mod} ${a.nombre}`.localeCompare(`${b.fecha} ${b.hi} ${b.mod} ${b.nombre}`));

  const conAlumnos = grupos.filter((g) => g.alumnos.length > 0);
  const findings: Finding[] = [];
  const label = (g: GrupoInfo) => `${dayName(g.fecha)} ${fmtTime(g.hi)} ${g.mod} · ${g.nombre}`;

  // ---------- turnos de disponibilidad ----------
  const turnos: TurnoInfo[] = [];
  const busyAt = new Map<string, Set<string>>(); // fecha|hi -> entrenadores ocupados
  for (const g of grupos) {
    const k = `${g.fecha}|${g.hi}`;
    const set = busyAt.get(k) || new Set<string>();
    for (const e of g.entrenadores) set.add(e.id);
    busyAt.set(k, set);
  }

  for (const t of data.turnos) {
    const clave = String(t.turno_clave);
    const disponibles: string[] = [];
    const noPuedo: string[] = [];
    const pendientes: string[] = [];
    const sinFila: string[] = [];
    for (const [id, nombre] of activos) {
      const r = respMap.get(`${clave}|${id}`) ?? "-";
      if (r === "D") disponibles.push(nombre);
      else if (r === "N") noPuedo.push(nombre);
      else if (r === "P") pendientes.push(nombre);
      else sinFila.push(nombre);
    }
    const gs = conAlumnos.filter((g) => g.turnoClave === clave);
    const porInicio = new Map<string, number>();
    for (const g of gs) porInicio.set(g.hi, (porInicio.get(g.hi) || 0) + 1);
    const necesarios = porInicio.size ? Math.max(...porInicio.values()) : 0;
    const alumnosTurno = gs.reduce((acc, g) => acc + g.alumnos.length, 0);

    let estado: TurnoInfo["estado"] = "ok";
    if (necesarios === 0) estado = "sin_grupos";
    else if (disponibles.length >= necesarios) estado = "ok";
    else if (disponibles.length + pendientes.length >= necesarios) estado = "riesgo";
    else estado = "no_cubierto";

    turnos.push({
      clave,
      fecha: String(t.fecha),
      hi: String(t.hora_inicio),
      hf: String(t.hora_fin),
      disponibles,
      noPuedo,
      pendientes,
      sinFila,
      necesarios,
      grupos: gs.length,
      alumnos: alumnosTurno,
      estado,
    });

    const nombreTurno = `${dayName(String(t.fecha))} ${fmtTime(t.hora_inicio)}-${fmtTime(t.hora_fin)}`;
    if (estado === "no_cubierto") {
      findings.push({
        severity: "alta",
        area: "cobertura",
        text: `${nombreTurno}: hacen falta ${necesarios} entrenadores a la vez y solo hay ${disponibles.length} disponibles${pendientes.length ? ` (aunque contestaran que sí los ${pendientes.length} que faltan, no llegarías)` : " y nadie más ha dicho que puede"}.`,
        suggestion: "Valorar juntar grupos, mover alumnos a otro turno o buscar un entrenador extra.",
      });
    } else if (estado === "riesgo") {
      findings.push({
        severity: "media",
        area: "cobertura",
        text: `${nombreTurno}: hacen falta ${necesarios} entrenadores y solo ${disponibles.length} han confirmado que pueden. Dependes de que contesten ${necesarios - disponibles.length} de los ${pendientes.length} que faltan.`,
        suggestion: `Reclamar respuesta a: ${pendientes.slice(0, 6).map(firstNames).join(", ")}${pendientes.length > 6 ? "..." : ""}.`,
      });
    }
    if (estado === "ok" && necesarios > 0 && disponibles.length === necesarios) {
      findings.push({
        severity: "baja",
        area: "cobertura",
        text: `${nombreTurno}: cubierto justo (${necesarios} grupos a la vez y ${disponibles.length} disponibles). Cualquier baja de última hora lo deja sin cubrir.`,
      });
    }
    if (necesarios === 0) {
      const sesionesTurno = data.sesiones.filter(
        (s) => String(s.fecha) === String(t.fecha) && String(s.hora_inicio) >= String(t.hora_inicio) && String(s.hora_inicio) < String(t.hora_fin),
      );
      if (sesionesTurno.length) {
        findings.push({
          severity: "media",
          area: "turno",
          text: `${nombreTurno}: hay sesión creada pero ningún grupo con alumnos. ¿Se cancela o faltan apuntados?`,
        });
      }
    }
  }

  const turnoPorClave = new Map(turnos.map((t) => [t.clave, t]));

  // ---------- entrenadores asignados ----------
  const asignadoPorSlot = new Map<string, GrupoInfo[]>();
  for (const g of grupos) {
    for (const e of g.entrenadores) {
      const k = `${e.id}|${g.fecha}|${g.hi}`;
      (asignadoPorSlot.get(k) || asignadoPorSlot.set(k, []).get(k)!).push(g);
    }
  }
  for (const [k, gs] of asignadoPorSlot) {
    if (gs.length > 1) {
      const id = k.split("|")[0];
      findings.push({
        severity: "alta",
        area: "entrenador",
        text: `${activos.get(id) ? titleCase(activos.get(id)!) : "Un entrenador"} está asignado a ${gs.length} grupos a la vez el ${dayName(gs[0].fecha)} ${fmtTime(gs[0].hi)}: ${gs.map((g) => g.nombre).join(" y ")}.`,
      });
    }
  }

  const candidatos = (g: GrupoInfo) => {
    if (!g.turnoClave) return [] as string[];
    const t = turnoPorClave.get(g.turnoClave);
    if (!t) return [];
    const ocupados = busyAt.get(`${g.fecha}|${g.hi}`) || new Set<string>();
    const out: string[] = [];
    for (const [id, nombre] of activos) {
      if (respMap.get(`${g.turnoClave}|${id}`) === "D" && !ocupados.has(id)) out.push(firstNames(nombre));
    }
    return out.slice(0, 3);
  };

  for (const g of grupos) {
    if (g.alumnos.length === 0) continue;
    if (!g.entrenadores.length) {
      const c = candidatos(g);
      findings.push({
        severity: "alta",
        area: "entrenador",
        text: `${label(g)}: sin entrenador asignado.`,
        suggestion: c.length ? `Disponibles y libres a esa hora: ${c.join(", ")}.` : undefined,
      });
      continue;
    }
    for (const e of g.entrenadores) {
      const c = candidatos(g);
      const sug = c.length ? `Alternativas disponibles y libres: ${c.join(", ")}.` : "No veo alternativas libres a esa hora.";
      if (e.resp === "N") {
        findings.push({
          severity: "alta",
          area: "entrenador",
          text: `${label(g)}: ${titleCase(e.nombre)} está asignado pero marcó "No puedo" ese turno.`,
          suggestion: sug,
        });
      } else if (e.resp === "P" || e.resp === "-") {
        findings.push({
          severity: "media",
          area: "entrenador",
          text: `${label(g)}: ${titleCase(e.nombre)} está asignado pero no ha contestado su disponibilidad para ese turno.`,
          suggestion: c.length ? `Plan B: ${c.join(", ")}.` : undefined,
        });
      }
      if (e.conf && normalize(e.conf) !== "CONFIRMADO") {
        findings.push({
          severity: "baja",
          area: "entrenador",
          text: `${label(g)}: ${titleCase(e.nombre)} figura como "${e.conf}".`,
        });
      }
    }
  }

  // ---------- calidad de grupos ----------
  for (const g of grupos) {
    const n = g.alumnos.length;
    if (n === 0) {
      findings.push({ severity: "media", area: "grupo", text: `${label(g)}: grupo sin alumnos. ¿Se borra o se cancela?` });
      continue;
    }

    if (/^REVISAR/i.test(g.nombre.trim())) {
      findings.push({
        severity: "media",
        area: "grupo",
        text: `${label(g)}: está marcado como REVISAR (${g.alumnos.map((a) => `${firstNames(a.nombre)} ${a.nivel || "sin nivel"}`).join(", ")}).`,
      });
    }

    if (g.ratioOk === false && !g.excepcion) {
      findings.push({ severity: "alta", area: "grupo", text: `${label(g)}: el ratio alumnos/entrenador no es válido.` });
    }

    const ordenes = g.alumnos.map((a) => a.orden).filter((o): o is number => o !== null);
    if (ordenes.length >= 2) {
      const min = Math.min(...ordenes);
      const max = Math.max(...ordenes);
      if (max - min >= CONFIG.saltoNivelAviso) {
        const med = median(ordenes)!;
        let peor = g.alumnos[0];
        let dist = -1;
        for (const a of g.alumnos) {
          if (a.orden === null) continue;
          const d = Math.abs(a.orden - med);
          if (d > dist) {
            dist = d;
            peor = a;
          }
        }
        findings.push({
          severity: "media",
          area: "grupo",
          text: `${label(g)}: niveles muy distintos (${[...new Set(g.alumnos.map((a) => a.nivel || "?"))].join(", ")}). ${firstNames(peor.nombre)} (${peor.nivel}) es el que más se aleja del resto.`,
          suggestion: "Valorar moverlo a un grupo de su nivel.",
        });
      }
    }
    const sinNivel = g.alumnos.filter((a) => a.orden === null);
    if (sinNivel.length) {
      findings.push({
        severity: "baja",
        area: "datos",
        text: `${label(g)}: ${sinNivel.map((a) => firstNames(a.nombre)).join(", ")} sin nivel registrado.`,
      });
    }

    const edades = g.alumnos.map((a) => a.edad).filter((e): e is number => e !== null);
    const umbralEdad = CONFIG.edadDispar[g.mod] ?? 4;
    if (edades.length >= 2 && Math.max(...edades) - Math.min(...edades) >= umbralEdad) {
      findings.push({
        severity: "baja",
        area: "grupo",
        text: `${label(g)}: edades muy dispares (${Math.min(...edades)} a ${Math.max(...edades)} años).`,
      });
    }

    if (!g.publicado) {
      findings.push({ severity: "baja", area: "grupo", text: `${label(g)}: sigue en borrador, sin publicar.` });
    }
  }

  // ---------- grupos con pocos alumnos y posibles fusiones ----------
  const porSlotMod = new Map<string, GrupoInfo[]>();
  for (const g of conAlumnos) {
    const k = `${g.fecha}|${g.hi}|${g.mod}`;
    (porSlotMod.get(k) || porSlotMod.set(k, []).get(k)!).push(g);
  }
  const fusionados = new Set<string>();
  for (const gs of porSlotMod.values()) {
    for (let i = 0; i < gs.length; i++) {
      for (let j = i + 1; j < gs.length; j++) {
        const a = gs[i];
        const b = gs[j];
        const total = a.alumnos.length + b.alumnos.length;
        const cap = CONFIG.maxGrupo[a.mod] ?? 5;
        if (a.alumnos.length > 2 && b.alumnos.length > 2) continue;
        if (total > cap) continue;
        const ma = median(a.alumnos.map((x) => x.orden).filter((o): o is number => o !== null));
        const mb = median(b.alumnos.map((x) => x.orden).filter((o): o is number => o !== null));
        if (ma === null || mb === null || Math.abs(ma - mb) > 1) continue;
        if (fusionados.has(a.id) || fusionados.has(b.id)) continue;
        fusionados.add(a.id);
        fusionados.add(b.id);
        findings.push({
          severity: "media",
          area: "grupo",
          text: `${dayName(a.fecha)} ${fmtTime(a.hi)} ${a.mod}: "${a.nombre}" (${a.alumnos.length}) y "${b.nombre}" (${b.alumnos.length}) son de niveles parecidos y juntos sumarían ${total} alumnos.`,
          suggestion: "Podrías juntarlos y liberar un entrenador.",
        });
      }
    }
  }

  for (const g of conAlumnos) {
    if (g.alumnos.length === 1 && !fusionados.has(g.id)) {
      const a = g.alumnos[0];
      findings.push({
        severity: "alta",
        area: "grupo",
        text: `${label(g)}: solo tiene un alumno (${firstNames(a.nombre)}, nivel ${a.nivel || "sin nivel"}).`,
        suggestion: "Revisar si se mueve a otro grupo o se mantiene así.",
      });
    }
  }

  // Turnos de disponibilidad con muy pocos alumnos en total.
  for (const t of turnos) {
    if (t.necesarios > 0 && t.alumnos <= CONFIG.turnoFlojoMaxAlumnos) {
      findings.push({
        severity: "media",
        area: "turno",
        text: `${dayName(t.fecha)} ${fmtTime(t.hi)}-${fmtTime(t.hf)}: solo ${t.alumnos} ${plural(t.alumnos, "alumno apuntado", "alumnos apuntados")} en todo el turno (${t.grupos} ${plural(t.grupos, "grupo", "grupos")}).`,
        suggestion: "Turno flojo: valora si compensa mantenerlo.",
      });
    }
  }

  // Sesiones sin ningun grupo que no esten dentro de un turno de disponibilidad ya avisado.
  const sesionesConGrupo = new Set(data.grupos.map((g) => String(g.sesion_id)));
  const avisadas = new Set(
    findings.filter((f) => f.area === "turno" && /sesión creada/.test(f.text)).map((f) => f.text.split(":")[0]),
  );
  for (const s of data.sesiones) {
    if (sesionesConGrupo.has(String(s.id))) continue;
    const turno = turnoDe(String(s.fecha), String(s.hora_inicio));
    const nombreTurno = turno
      ? `${dayName(String(turno.fecha))} ${fmtTime(turno.hora_inicio)}-${fmtTime(turno.hora_fin)}`
      : null;
    if (nombreTurno && avisadas.has(nombreTurno)) continue;
    if (!turno) {
      findings.push({
        severity: "baja",
        area: "turno",
        text: `${dayName(String(s.fecha))} ${fmtTime(s.hora_inicio)} ${modById.get(String(s.modalidad_id)) || ""}: sesión creada sin grupos.`,
      });
    }
  }

  // ---------- respuestas de entrenadores ----------
  const sinContestarNada: string[] = [];
  const parciales: string[] = [];
  let contestaronTodo = 0;
  if (data.turnos.length) {
    for (const [id, nombre] of activos) {
      let d = 0;
      let p = 0;
      for (const t of data.turnos) {
        const r = respMap.get(`${t.turno_clave}|${id}`) ?? "-";
        if (r === "P" || r === "-") p++;
        else d++;
      }
      if (p === 0) contestaronTodo++;
      else if (d === 0) sinContestarNada.push(titleCase(nombre));
      else parciales.push(`${titleCase(nombre)} (${p} de ${data.turnos.length} sin responder)`);
    }
  }

  // ---------- veredicto ----------
  const altas = findings.filter((f) => f.severity === "alta");
  const medias = findings.filter((f) => f.severity === "media");
  const noCubierto = turnos.some((t) => t.estado === "no_cubierto");
  const asignacionImposible = findings.some(
    (f) => f.area === "entrenador" && f.severity === "alta",
  );
  let verdict: Review["verdict"];
  if (!data.semana || !data.turnos.length) verdict = "SIN_DATOS";
  else if (noCubierto || asignacionImposible) verdict = "NO_FACTIBLE";
  else if (altas.length || medias.length || sinContestarNada.length) verdict = "FACTIBLE_CON_RIESGOS";
  else verdict = "FACTIBLE";

  // ---------- fuera de turnos de disponibilidad ----------
  const fueraDeTurnos = conAlumnos
    .filter((g) => !g.turnoClave)
    .map((g) => `${label(g)} (${g.entrenadores.map((e) => titleCase(e.nombre)).join(" / ") || "sin entrenador"})`);

  // ---------- acciones sugeridas ----------
  const actions: string[] = [];
  const turnosRiesgo = turnos.filter((t) => t.estado === "riesgo" || t.estado === "no_cubierto");
  if (sinContestarNada.length) {
    actions.push(`Reclamar disponibilidad a los ${sinContestarNada.length} que no han contestado nada.`);
  }
  if (turnosRiesgo.length) {
    actions.push(
      `Asegurar entrenadores en: ${turnosRiesgo.map((t) => `${dayName(t.fecha)} ${fmtTime(t.hi)}`).join(", ")}.`,
    );
  }
  for (const f of altas.filter((x) => x.area === "entrenador").slice(0, 3)) {
    actions.push(f.suggestion ? `${f.text.split(":")[0]}: ${f.suggestion}` : f.text);
  }
  if (findings.some((f) => /Podrías juntarlos/.test(f.suggestion || ""))) {
    actions.push("Mirar los grupos que se podrían juntar para ahorrar entrenadores.");
  }
  if (findings.some((f) => f.area === "grupo" && /niveles muy distintos/.test(f.text))) {
    actions.push("Revisar los alumnos con nivel lejano al de su grupo.");
  }

  return {
    weekStart: data.weekStart,
    weekEnd,
    hasAvailability: !!data.semana && data.turnos.length > 0,
    estadoSemana: data.semana ? String(data.semana.estado || "") : null,
    limite: data.semana ? madridDeadline(data.semana.fecha_limite_publicada || data.semana.fecha_limite_borrador) : null,
    verdict,
    totals: {
      gruposConAlumnos: conAlumnos.length,
      gruposTotal: grupos.length,
      alumnos: conAlumnos.reduce((acc, g) => acc + g.alumnos.length, 0),
      entrenadoresActivos: activos.size,
      contestaronTodo,
      contestaronParte: parciales.length,
      sinContestar: sinContestarNada.length,
    },
    turnos,
    sinContestarNada,
    parciales,
    findings,
    fueraDeTurnos,
    actions,
  };
}

// -------------------------------- formato -----------------------------------

const SEV_ORDER: Record<Severity, number> = { alta: 0, media: 1, baja: 2 };

export function formatReview(r: Review): string {
  const L: string[] = [];
  L.push(`📅 Revisión de la semana ${fmtShort(r.weekStart)} al ${fmtShort(r.weekEnd)}`);

  if (r.verdict === "SIN_DATOS") {
    L.push(`\nNo encuentro disponibilidad cargada para esa semana todavía${r.estadoSemana ? ` (estado: ${r.estadoSemana})` : ""}, así que no puedo decirte si es factible.`);
    if (r.totals.gruposTotal) L.push(`Sí hay ${r.totals.gruposConAlumnos} grupos con ${r.totals.alumnos} alumnos.`);
    return L.join("\n");
  }

  const veredicto =
    r.verdict === "FACTIBLE"
      ? "✅ FACTIBLE: todos los grupos tienen entrenador disponible y no veo problemas."
      : r.verdict === "FACTIBLE_CON_RIESGOS"
        ? "⚠️ FACTIBLE CON RIESGOS: sale, pero hay cosas que conviene mirar."
        : "❌ NO FACTIBLE tal como está: hay problemas que resolver antes de dar la semana por buena.";
  L.push(`\n${veredicto}`);

  const t = r.totals;
  L.push(
    `\n• ${t.gruposConAlumnos} grupos con alumnos (${t.alumnos} alumnos en total)\n• ${t.entrenadoresActivos} entrenadores activos: ${t.contestaronTodo} han contestado todo, ${t.contestaronParte} a medias, ${t.sinContestar} sin contestar nada${r.limite ? `\n• Cierre de respuestas: ${r.limite}` : ""}`,
  );

  L.push("\n🧮 Cobertura por turno (necesarios / disponibles)");
  for (const tu of r.turnos) {
    const icono = tu.estado === "ok" ? "✅" : tu.estado === "riesgo" ? "⚠️" : tu.estado === "no_cubierto" ? "❌" : "▫️";
    const detalle =
      tu.estado === "sin_grupos"
        ? "sin grupos con alumnos"
        : `${tu.necesarios} / ${tu.disponibles.length} (${tu.pendientes.length + tu.sinFila.length} sin contestar, ${tu.noPuedo.length} no pueden) · ${tu.grupos} ${plural(tu.grupos, "grupo", "grupos")}, ${tu.alumnos} alumnos`;
    L.push(`${icono} ${dayName(tu.fecha)} ${fmtTime(tu.hi)}-${fmtTime(tu.hf)}: ${detalle}`);
  }

  const orden = [...r.findings].sort((a, b) => SEV_ORDER[a.severity] - SEV_ORDER[b.severity]);
  const bloque = (titulo: string, sev: Severity, max: number) => {
    const items = orden.filter((f) => f.severity === sev);
    if (!items.length) return;
    L.push(`\n${titulo}`);
    for (const f of items.slice(0, max)) {
      L.push(`• ${f.text}${f.suggestion ? `\n  → ${f.suggestion}` : ""}`);
    }
    if (items.length > max) L.push(`  (y ${items.length - max} más)`);
  };
  bloque("🚨 Hay que resolver", "alta", 10);
  bloque("🔎 Conviene revisar", "media", 10);
  bloque("ℹ️ Para tener en cuenta", "baja", 6);

  if (r.sinContestarNada.length) {
    L.push(`\n⏳ Sin contestar nada: ${r.sinContestarNada.join(", ")}.`);
  }
  if (r.parciales.length) {
    L.push(`⏳ A medias: ${r.parciales.slice(0, 8).join("; ")}${r.parciales.length > 8 ? "..." : ""}.`);
  }
  if (r.fueraDeTurnos.length) {
    L.push(`\n📌 Fuera de los turnos de disponibilidad (asignación fija): ${r.fueraDeTurnos.join("; ")}.`);
  }
  if (r.actions.length) {
    L.push("\n👉 Qué haría ahora");
    r.actions.slice(0, 5).forEach((a, i) => L.push(`${i + 1}. ${a}`));
  }
  return L.join("\n");
}

export async function buildWeeklyReview(dbGet: DbGet, weekStart: string) {
  const data = await loadWeekData(dbGet, weekStart);
  const review = analyzeWeek(data);
  return { review, text: formatReview(review) };
}
