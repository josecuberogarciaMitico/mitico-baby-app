import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const U = Deno.env.get("SUPABASE_URL") || "";
const K = Deno.env.get("SUPABASE_ANON_KEY") || "";
const S = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const C = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type Student = {
  id: string;
  nombre_completo: string;
  fecha_nacimiento: string | null;
  nivel_actual_id: string | null;
  nivel_estimado_id: string | null;
  seccion_principal: string | null;
  estado_ficha: string | null;
  observacion_interna: string | null;
  observacion_visible_entrenador: string | null;
  mostrar_observacion_entrenador: boolean | null;
};

function J(x: unknown, s = 200) {
  return new Response(JSON.stringify(x), {
    status: s,
    headers: { ...C, "Content-Type": "application/json; charset=utf-8" },
  });
}

function N(x: string) {
  return x
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9+ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function today() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Madrid",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function ageAt(birth: string | null, date: string) {
  if (!birth) return null;
  const [by, bm, bd] = birth.split("-").map(Number);
  const [y, m, d] = date.split("-").map(Number);
  if (!by || !bm || !bd || !y || !m || !d) return null;
  let a = y - by;
  if (m < bm || (m === bm && d < bd)) a--;
  return a;
}

function sectionLabel(v: unknown) {
  const x = String(v || "").toUpperCase();
  if (x === "BABY_INTENSIVOS") return "Baby / Intensivos";
  if (x === "OCIO") return "Ocio";
  return v ? String(v) : "sección sin indicar";
}

function fmtDate(x: string | null | undefined) {
  if (!x) return "sin fecha";
  const [y, m, d] = String(x).slice(0, 10).split("-");
  return y && m && d ? `${d}/${m}/${y}` : String(x);
}

function fmtTime(x: string | null | undefined) {
  return x ? String(x).slice(0, 5) : "--:--";
}

function isSecretaryIntent(message: string) {
  const n = N(message);
  return [
    "APUNTA",
    "ANOTA",
    "TAREA",
    "NOTA",
    "SECRETARIA",
    "RECUERDA",
    "GUARDA",
    "BORRA",
    "ELIMINA",
    "MARCA COMO",
    "RESUELVE LA TAREA",
    "PON COMO PENDIENTE",
    "PON EN CURSO",
  ].some((k) => n.includes(k));
}

async function admin(path: string) {
  const r = await fetch(U + path, {
    headers: {
      apikey: S,
      Authorization: `Bearer ${S}`,
      Accept: "application/json",
    },
  });
  const t = await r.text();
  let d: any = null;
  try {
    d = t ? JSON.parse(t) : null;
  } catch {
    d = t;
  }
  if (!r.ok) throw Error(`DB ${r.status}: ${String(t).slice(0, 160)}`);
  return d;
}

async function auth(req: Request) {
  const a = req.headers.get("Authorization") || "";
  if (!a.startsWith("Bearer ")) return false;
  const ur = await fetch(U + "/auth/v1/user", {
    headers: { apikey: K, Authorization: a },
  });
  if (!ur.ok) return false;
  const u = await ur.json();
  if (!u?.id) return false;
  const rows = await admin(
    `/rest/v1/usuarios_app?select=rol&auth_user_id=eq.${encodeURIComponent(String(u.id))}&activo=eq.true&limit=1`,
  );
  return Array.isArray(rows) && rows[0]?.rol === "coordinador_jefe";
}

function uniqueById(rows: any[]) {
  return [...new Map(rows.map((x: any) => [String(x.id), x])).values()];
}

async function findExactStudentInMessage(message: string): Promise<Student | null> {
  const students = await admin(
    "/rest/v1/alumnos?select=id,nombre_completo,fecha_nacimiento,nivel_actual_id,nivel_estimado_id,seccion_principal,estado_ficha,observacion_interna,observacion_visible_entrenador,mostrar_observacion_entrenador&activo=eq.true&order=nombre_completo.asc&limit=600",
  );
  const nm = N(message);
  const matches = (Array.isArray(students) ? students : []).filter((s: any) => {
    const full = N(String(s.nombre_completo || ""));
    return full.length >= 5 && nm.includes(full);
  });
  const unique = uniqueById(matches);
  return unique.length === 1 ? (unique[0] as Student) : null;
}

async function buildStudentDossier(s: Student) {
  const id = encodeURIComponent(String(s.id));
  const td = today();

  const [levels, summaryRows, seasonRows, operationalRows, groupRows, attendanceRows, reportRows, initialProgressRows, turnPhaseRows] = await Promise.all([
    admin("/rest/v1/niveles?select=id,codigo,pista_recomendada&activo=eq.true&limit=100"),
    admin(`/rest/v1/v_resumen_alumno_v2?select=alumno_id,alumno,nivel_actual,nivel_estimado,estado_ficha,total_reportes,total_entrenamientos_realizados,ultima_fecha_reporte,ultima_modalidad,ultimo_nivel_reportado,ultima_actitud,ultima_tecnica,ultima_pista,ultima_autonomia,ultima_incidencia,ultima_recomendacion,ultimo_reporte,fecha_nacimiento&alumno_id=eq.${id}&limit=1`),
    admin(`/rest/v1/alumno_temporada_app?select=temporada_id,modalidad_codigo,origen,fecha_activacion,activo&alumno_id=eq.${id}&activo=eq.true&order=fecha_activacion.desc&limit=10`),
    admin(`/rest/v1/v_sesion_alumnos_operativa_app?select=sesion_id,alumno_id,orden,estado_en_listado,nivel_usado,origen_nivel,estado_ficha,observacion&alumno_id=eq.${id}&limit=50`),
    admin(`/rest/v1/grupo_alumnos?select=grupo_id,orden,es_recuperacion,estado_asistencia&alumno_id=eq.${id}&limit=100`),
    admin(`/rest/v1/asistencias?select=estado,observacion_llegada,observacion_llegada_texto,marcado_at&alumno_id=eq.${id}&limit=300`),
    admin(`/rest/v1/v_historial_reportes_alumno?select=fecha,modalidad,nombre_grupo,nivel_reportado,actitud,actitud_comentario,tecnica,tecnica_comentario,pista,pista_comentario,autonomia,autonomia_comentario,incidencia,incidencia_comentario,recomendacion_proxima_sesion,recomendacion_comentario,enviado_at&alumno_id=eq.${id}&order=fecha.desc,enviado_at.desc&limit=5`),
    admin(`/rest/v1/v_ultima_progresion_inicial_alumno_app?select=grupo_id,entrenador_id,nivel_reportado,autonomia_cinta,cuna_frenada,giro_inicial,dinamica_autonoma,ayuda_cunero,updated_at&alumno_id=eq.${id}&limit=1`),
    admin(`/rest/v1/v_ultima_fase_viraje_alumno_app?select=grupo_id,entrenador_id,nivel_reportado,fase_viraje,updated_at&alumno_id=eq.${id}&limit=1`),
  ]);

  const levelMap = new Map(
    (Array.isArray(levels) ? levels : []).map((x: any) => [String(x.id), x]),
  );
  const levelId = s.nivel_actual_id || s.nivel_estimado_id;
  const levelRow: any = levelId ? levelMap.get(String(levelId)) : null;
  const level = levelRow?.codigo || null;
  const levelSource = s.nivel_actual_id ? "actual" : s.nivel_estimado_id ? "estimado" : "";
  const age = ageAt(s.fecha_nacimiento, td);
  const summary: any = Array.isArray(summaryRows) ? summaryRows[0] : null;

  const op = Array.isArray(operationalRows) ? operationalRows : [];
  const sessionIds = [...new Set(op.map((x: any) => String(x.sesion_id)).filter(Boolean))];
  let sessions: any[] = [];
  if (sessionIds.length) {
    sessions = await admin(
      `/rest/v1/sesiones?select=id,fecha,hora_inicio,hora_fin,lugar,tipo_sesion,estado,modalidad_id&id=in.(${sessionIds.join(",")})&order=fecha.asc,hora_inicio.asc`,
    );
  }
  const sessionMap = new Map((Array.isArray(sessions) ? sessions : []).map((x: any) => [String(x.id), x]));
  const futureOps = op
    .map((x: any) => ({ ...x, session: sessionMap.get(String(x.sesion_id)) }))
    .filter((x: any) => String(x.session?.fecha || "") >= td)
    .sort((a: any, b: any) => `${a.session?.fecha || ""} ${a.session?.hora_inicio || ""}`.localeCompare(`${b.session?.fecha || ""} ${b.session?.hora_inicio || ""}`));

  const ga = Array.isArray(groupRows) ? groupRows : [];
  const groupIds = [...new Set(ga.map((x: any) => String(x.grupo_id)).filter(Boolean))];
  let groups: any[] = [];
  if (groupIds.length) {
    groups = await admin(
      `/rest/v1/grupos?select=id,sesion_id,nombre_grupo,nivel_grupo,pista,punto_encuentro,estado,publicado,cancelado,observaciones_importantes&id=in.(${groupIds.join(",")})`,
    );
  }
  const groupMap = new Map((Array.isArray(groups) ? groups : []).map((x: any) => [String(x.id), x]));
  const groupSessionIds = [...new Set((Array.isArray(groups) ? groups : []).map((g: any) => String(g.sesion_id)).filter(Boolean))];
  let groupSessions: any[] = [];
  if (groupSessionIds.length) {
    groupSessions = await admin(
      `/rest/v1/sesiones?select=id,fecha,hora_inicio,hora_fin,lugar,estado&id=in.(${groupSessionIds.join(",")})`,
    );
  }
  const groupSessionMap = new Map((Array.isArray(groupSessions) ? groupSessions : []).map((x: any) => [String(x.id), x]));

  let trainerRows: any[] = [];
  if (groupIds.length) {
    trainerRows = await admin(
      `/rest/v1/v_grupos_entrenador_app_dos_entrenadores?select=grupo_id,entrenador,estado_confirmacion&grupo_id=in.(${groupIds.join(",")})&limit=200`,
    );
  }
  const trainersByGroup = new Map<string, string[]>();
  for (const x of Array.isArray(trainerRows) ? trainerRows : []) {
    const key = String(x.grupo_id);
    const arr = trainersByGroup.get(key) || [];
    const label = `${x.entrenador || "Entrenador"}${x.estado_confirmacion ? ` (${x.estado_confirmacion})` : ""}`;
    if (!arr.includes(label)) arr.push(label);
    trainersByGroup.set(key, arr);
  }

  const concreteGroups = ga
    .map((x: any) => {
      const g: any = groupMap.get(String(x.grupo_id));
      const ses: any = g ? groupSessionMap.get(String(g.sesion_id)) : null;
      return { membership: x, group: g, session: ses };
    })
    .filter((x: any) => x.group && x.session)
    .sort((a: any, b: any) => `${b.session.fecha || ""} ${b.session.hora_inicio || ""}`.localeCompare(`${a.session.fecha || ""} ${a.session.hora_inicio || ""}`));

  const attendance = Array.isArray(attendanceRows) ? attendanceRows : [];
  const attCounts = { presente: 0, ausente: 0, pendiente: 0, otros: 0 };
  for (const a of attendance) {
    const st = N(String(a.estado || ""));
    if (st === "PRESENTE") attCounts.presente++;
    else if (st === "AUSENTE") attCounts.ausente++;
    else if (st === "PENDIENTE") attCounts.pendiente++;
    else attCounts.otros++;
  }

  const reports = Array.isArray(reportRows) ? reportRows : [];
  const initialProgress: any = Array.isArray(initialProgressRows) ? initialProgressRows[0] : null;
  const turnPhase: any = Array.isArray(turnPhaseRows) ? turnPhaseRows[0] : null;

  const lines: string[] = [];
  lines.push(`👤 ${s.nombre_completo}`);
  lines.push(`• ${age !== null ? `${age} años` : "Edad sin registrar"} · ${sectionLabel(s.seccion_principal)} · nivel ${level || "sin nivel"}${levelSource ? ` (${levelSource})` : ""}`);
  if (levelRow?.pista_recomendada) lines.push(`• Pista recomendada por nivel: ${levelRow.pista_recomendada}`);
  lines.push(`• Ficha: ${s.estado_ficha || summary?.estado_ficha || "sin estado"}`);

  const activeSeasons = Array.isArray(seasonRows) ? seasonRows : [];
  if (activeSeasons.length) {
    const mods = [...new Set(activeSeasons.map((x: any) => String(x.modalidad_codigo || "")).filter(Boolean))];
    lines.push(`• Temporada activa: ${mods.length ? mods.join(" / ") : "sí"}`);
  } else {
    lines.push("• Temporada activa: no consta una activación vigente");
  }

  const totalReports = Number(summary?.total_reportes || reports.length || 0);
  const totalTraining = Number(summary?.total_entrenamientos_realizados || 0);
  lines.push(`\n📊 Historial`);
  lines.push(`• Entrenamientos realizados registrados: ${totalTraining}`);
  lines.push(`• Reportes: ${totalReports}`);
  if (attendance.length) {
    lines.push(`• Asistencia: ${attCounts.presente} presente${attCounts.presente === 1 ? "" : "s"} · ${attCounts.ausente} ausente${attCounts.ausente === 1 ? "" : "s"} · ${attCounts.pendiente} pendiente${attCounts.pendiente === 1 ? "" : "s"}`);
  } else {
    lines.push("• Asistencia: sin registros todavía");
  }

  lines.push(`\n📅 Situación operativa`);
  if (concreteGroups.length) {
    const latest = concreteGroups[0];
    const g = latest.group;
    const ses = latest.session;
    const trainers = trainersByGroup.get(String(g.id)) || [];
    lines.push(`• Grupo: ${g.nombre_grupo} · ${fmtDate(ses.fecha)} ${fmtTime(ses.hora_inicio)}–${fmtTime(ses.hora_fin)}${g.pista ? ` · ${g.pista}` : ""}`);
    if (trainers.length) lines.push(`• Entrenador: ${trainers.join(" / ")}`);
    lines.push(`• Estado: grupo ${g.estado || "sin estado"}${g.publicado ? " · publicado" : " · no publicado"}${g.cancelado ? " · cancelado" : ""}`);
  } else if (futureOps.length) {
    const next = futureOps[0];
    const ses = next.session;
    lines.push(`• Próxima sesión en listado: ${fmtDate(ses?.fecha)} ${fmtTime(ses?.hora_inicio)}–${fmtTime(ses?.hora_fin)} · ${ses?.lugar || "lugar sin indicar"}`);
    lines.push(`• Estado de sesión: ${ses?.estado || "sin estado"} · ${next.estado_en_listado || "sin estado de listado"}`);
    lines.push("• Todavía no consta asignado a un grupo concreto.");
    if (next.observacion) lines.push(`• Observación de listado: ${next.observacion}`);
  } else {
    lines.push("• No consta grupo ni próxima sesión operativa en los datos consultados.");
  }

  lines.push(`\n🎿 Técnica y evolución`);
  if (!totalReports && !initialProgress && !turnPhase) {
    lines.push("• Aún no hay reportes ni progresión técnica registrada; no puedo valorar evolución sin inventar datos.");
  } else {
    if (reports.length) {
      const r = reports[0];
      lines.push(`• Último reporte: ${fmtDate(r.fecha)}${r.nivel_reportado ? ` · nivel ${r.nivel_reportado}` : ""}${r.tecnica ? ` · técnica ${r.tecnica}` : ""}${r.autonomia ? ` · autonomía ${r.autonomia}` : ""}`);
      if (r.recomendacion_proxima_sesion) lines.push(`• Próxima recomendación: ${r.recomendacion_proxima_sesion}${r.recomendacion_comentario ? ` — ${r.recomendacion_comentario}` : ""}`);
      if (r.incidencia && N(String(r.incidencia)) !== "SIN INCIDENCIA") lines.push(`• Incidencia del último reporte: ${r.incidencia}${r.incidencia_comentario ? ` — ${r.incidencia_comentario}` : ""}`);
    }
    if (initialProgress) {
      const parts = [
        initialProgress.autonomia_cinta && `cinta: ${initialProgress.autonomia_cinta}`,
        initialProgress.cuna_frenada && `cuña frenada: ${initialProgress.cuna_frenada}`,
        initialProgress.giro_inicial && `giro inicial: ${initialProgress.giro_inicial}`,
        initialProgress.dinamica_autonoma && `dinámica autónoma: ${initialProgress.dinamica_autonoma}`,
        initialProgress.ayuda_cunero && `ayuda cuñero: ${initialProgress.ayuda_cunero}`,
      ].filter(Boolean);
      if (parts.length) lines.push(`• Progresión inicial: ${parts.join(" · ")}`);
    }
    if (turnPhase?.fase_viraje) lines.push(`• Fase de viraje: ${turnPhase.fase_viraje}`);
  }

  const alerts: string[] = [];
  const visibleObs = String(s.observacion_visible_entrenador || "").trim();
  const internalObs = String(s.observacion_interna || "").trim();
  if (visibleObs) alerts.push(`Observación registrada: ${visibleObs}`);
  if (internalObs) alerts.push(`Observación interna: ${internalObs}`);

  if (visibleObs && /PENDIENTE DE ALTA|NO GENERAR GRUPO|VALIDAR/i.test(visibleObs) && (s.estado_ficha === "completa" || activeSeasons.length)) {
    alerts.push("Hay una posible incoherencia: la observación pide validar/no generar grupo, pero la ficha figura completa o el alumno está activo esta temporada. Conviene revisarlo antes de asignarlo definitivamente.");
  }

  if (alerts.length) {
    lines.push(`\n⚠️ Atención`);
    for (const a of alerts) lines.push(`• ${a}`);
  }

  if (reports.length > 1) {
    lines.push(`\n🧾 Últimos reportes`);
    for (const r of reports.slice(0, 3)) {
      const detail = [r.nivel_reportado && `nivel ${r.nivel_reportado}`, r.tecnica && `técnica ${r.tecnica}`, r.autonomia && `autonomía ${r.autonomia}`].filter(Boolean).join(" · ");
      lines.push(`• ${fmtDate(r.fecha)}${r.nombre_grupo ? ` · ${r.nombre_grupo}` : ""}${detail ? ` · ${detail}` : ""}`);
    }
  }

  return lines.join("\n");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: C });
  if (req.method !== "POST") return J({ ok: false, error: "Método no permitido." }, 405);
  if (!U || !K || !S) return J({ ok: false, error: "Servicio no disponible." }, 503);

  try {
    if (!(await auth(req))) return J({ ok: false, error: "Acceso restringido a coordinador_jefe." }, 403);

    const body = await req.json().catch(() => ({}));
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    if (!message) return J({ ok: true, handled: false });

    // No interceptamos órdenes destinadas a Secretaría. Esto evita que una tarea
    // que mencione el nombre completo de un alumno quede absorbida por el buscador.
    if (isSecretaryIntent(message)) return J({ ok: true, handled: false });

    const student = await findExactStudentInMessage(message);
    if (!student) return J({ ok: true, handled: false });

    const answer = await buildStudentDossier(student);
    return J({
      ok: true,
      handled: true,
      answer,
      choices: [],
      secretary_changed: false,
    });
  } catch (e) {
    console.error("student-guard", e);
    // Guard de solo lectura: si falla, no bloquea el resto de Paco.
    return J({ ok: true, handled: false });
  }
});