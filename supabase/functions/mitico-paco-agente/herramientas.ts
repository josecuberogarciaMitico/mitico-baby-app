// ---------------------------------------------------------------------------
// herramientas.ts · los «ojos» de Paco (SOLO LECTURA)
//
// Cada herramienta lee datos reales de Mítico y devuelve un resumen compacto.
// Ninguna escribe nada. Las usa el agente (index.ts) para contestar a Jose.
// ---------------------------------------------------------------------------
import { buildWeeklyReview } from "./semana.ts";
import type { DefHerramienta } from "./llm.ts";

type Fila = Record<string, any>;
export type DbGet = (tabla: string, params: Record<string, string>) => Promise<Fila[]>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const CAPACIDAD: Record<string, number> = { BABY: 4, OCIO: 6 };

// ------------------------------ utilidades ---------------------------------

export function norm(x: unknown) {
  return String(x ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9+ ]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hoyMadrid(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit" }).format(d);
}

export function sumarDias(iso: string, n: number) {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];
export function diaSemana(iso: string) {
  return DIAS[new Date(`${String(iso).slice(0, 10)}T12:00:00Z`).getUTCDay()];
}

function lunesDe(iso: string) {
  const d = new Date(`${iso}T12:00:00Z`);
  const dow = d.getUTCDay() || 7;
  return sumarDias(iso, -(dow - 1));
}

function edad(nac: string | null | undefined, en: string) {
  if (!nac) return null;
  const [y, m, d] = String(nac).slice(0, 10).split("-").map(Number);
  const [Y, M, D] = en.split("-").map(Number);
  if (!y || !m || !d) return null;
  let e = Y - y;
  if (M < m || (M === m && D < d)) e--;
  return e;
}

const hora = (x: unknown) => (x ? String(x).slice(0, 5) : "");
const fechaValida = (x: unknown) => (/^\d{4}-\d{2}-\d{2}$/.test(String(x || "")) ? String(x) : null);
const inLista = (ids: string[]) => `in.(${ids.join(",")})`;

/** Rango de fechas saneado: por defecto hoy + 7 días; como mucho 31 días. */
export function rango(desde?: unknown, hasta?: unknown, porDefecto = 7) {
  const hoy = hoyMadrid();
  const d = fechaValida(desde) || hoy;
  let h = fechaValida(hasta) || sumarDias(d, porDefecto);
  if (h < d) h = d;
  if (h > sumarDias(d, 31)) h = sumarDias(d, 31);
  return { desde: d, hasta: h };
}

function modalidadDe(x: unknown): "BABY" | "OCIO" | "INTENSIVOS" | null {
  const n = norm(x);
  if (!n) return null;
  if (n.startsWith("BABY")) return "BABY";
  if (n.startsWith("OCIO")) return "OCIO";
  if (n.startsWith("INTENSIV")) return "INTENSIVOS";
  return null;
}

// Se cargan una vez por petición.
export class Contexto {
  private niveles: Map<string, { codigo: string; orden: number }> | null = null;
  private modalidades: Map<string, string> | null = null;
  constructor(public db: DbGet) {}

  async nivelesPorId() {
    if (!this.niveles) {
      const filas = await this.db("niveles", { select: "id,codigo,orden", activo: "eq.true", order: "orden.asc" });
      this.niveles = new Map(filas.map((n) => [String(n.id), { codigo: String(n.codigo), orden: Number(n.orden) }]));
    }
    return this.niveles;
  }

  async nivelPorCodigo(codigo: string) {
    const mapa = await this.nivelesPorId();
    const c = norm(codigo);
    for (const v of mapa.values()) if (norm(v.codigo) === c) return v;
    return null;
  }

  async modalidadesPorId() {
    if (!this.modalidades) {
      const filas = await this.db("modalidades", { select: "id,codigo" });
      this.modalidades = new Map(filas.map((m) => [String(m.id), String(m.codigo).toUpperCase()]));
    }
    return this.modalidades;
  }
}

async function nivelDeAlumno(ctx: Contexto, a: Fila) {
  const mapa = await ctx.nivelesPorId();
  const n = mapa.get(String(a.nivel_actual_id || "")) || mapa.get(String(a.nivel_estimado_id || ""));
  return n ? { codigo: n.codigo, orden: n.orden, estimado: !a.nivel_actual_id } : null;
}

// --------------------------- memoria de Jose -------------------------------
// Notas que Jose le dicta a Paco sobre niños y familias (tabla paco_notas).
// Se adjuntan solas a cualquier herramienta que trate de ese niño, para que
// Paco se las recuerde sin que se las pidan.

type NotaJose = { nota_id: string; texto: string; entrenador_id: string | null; entrenador: string | null; solo_proxima_vez: boolean; apuntada: string };

async function notasDe(ctx: Contexto, alumnoIds: string[]): Promise<Map<string, NotaJose[]>> {
  const ids = [...new Set(alumnoIds.filter((x) => UUID.test(String(x))))];
  const mapa = new Map<string, NotaJose[]>();
  if (!ids.length) return mapa;
  const filas = await ctx.db("paco_notas", {
    select: "id,alumno_id,entrenador_id,texto,una_vez,created_at",
    activa: "eq.true",
    alumno_id: inLista(ids),
    order: "created_at.asc",
  });
  const entIds = [...new Set(filas.map((f) => String(f.entrenador_id || "")).filter((x) => UUID.test(x)))];
  const ents = entIds.length ? await ctx.db("entrenadores", { select: "id,nombre_completo", id: inLista(entIds) }) : [];
  const em = new Map(ents.map((e) => [String(e.id), String(e.nombre_completo)]));
  for (const f of filas) {
    const lista = mapa.get(String(f.alumno_id)) || [];
    lista.push({
      nota_id: String(f.id),
      texto: String(f.texto),
      entrenador_id: f.entrenador_id ? String(f.entrenador_id) : null,
      entrenador: f.entrenador_id ? em.get(String(f.entrenador_id)) || null : null,
      solo_proxima_vez: f.una_vez === true,
      apuntada: String(f.created_at || "").slice(0, 10),
    });
    mapa.set(String(f.alumno_id), lista);
  }
  return mapa;
}

// --------------------------- herramientas ----------------------------------

async function buscarAlumno(ctx: Contexto, args: Fila) {
  const q = norm(args.nombre);
  if (q.length < 2) return { error: "Dime un nombre." };
  const filas = await ctx.db("alumnos", {
    select: "id,nombre_completo,fecha_nacimiento,nivel_actual_id,nivel_estimado_id,seccion_principal,ocio_dia_fijo,camiseta_entregada",
    activo: "eq.true",
    limit: "3000",
  });
  const toks = q.split(" ").filter(Boolean);
  const hoy = hoyMadrid();
  const puntuados = filas
    .map((a) => {
      const n = norm(a.nombre_completo);
      const partes = n.split(" ");
      let s = 0;
      if (n === q) s = 100;
      else if (n.startsWith(q + " ")) s = 90;
      else if (toks.every((t) => partes.includes(t))) s = partes[0] === toks[0] ? 80 : 70;
      else if (n.includes(q)) s = 60;
      else if (toks.length > 1 && toks.filter((t) => partes.includes(t)).length >= toks.length - 1) s = 40;
      return { a, s };
    })
    .filter((x) => x.s > 0)
    .sort((x, y) => y.s - x.s || String(x.a.nombre_completo).localeCompare(String(y.a.nombre_completo), "es"))
    .slice(0, 6);
  const salida = [];
  for (const { a } of puntuados) {
    const nv = await nivelDeAlumno(ctx, a);
    salida.push({
      alumno_id: a.id,
      nombre: a.nombre_completo,
      edad: edad(a.fecha_nacimiento, hoy),
      nivel: nv ? `${nv.codigo}${nv.estimado ? " (estimado)" : ""}` : "sin nivel",
      seccion: a.seccion_principal || null,
      dia_fijo_ocio: a.ocio_dia_fijo || null,
      camiseta_entregada: a.camiseta_entregada === true,
    });
  }
  const notas = await notasDe(ctx, salida.map((x) => String(x.alumno_id)));
  const conNotas = salida.map((x) => (notas.get(String(x.alumno_id)) ? { ...x, notas_de_jose: notas.get(String(x.alumno_id)) } : x));
  return { coincidencias: conNotas, nota: salida.length ? undefined : "No hay alumnos activos con ese nombre." };
}

async function reportesAlumno(ctx: Contexto, args: Fila) {
  const id = String(args.alumno_id || "");
  if (!UUID.test(id)) return { error: "alumno_id no válido: usa buscar_alumno primero." };
  const cuantos = Math.min(Math.max(Number(args.cuantos) || 3, 1), 10);
  const reps = await ctx.db("reportes", {
    select: "fecha,grupo_id,entrenador_id,nivel_id,actitud,actitud_comentario,tecnica,tecnica_comentario,pista,pista_comentario,remontes,remontes_comentario,autonomia,autonomia_comentario,incidencia,incidencia_comentario,recomendacion_proxima_sesion,recomendacion_comentario,observaciones_generales,mejora_hoy,mejoras_hoy,prioridades_proxima_sesion,ritmo_grupo,enviado_at",
    alumno_id: `eq.${id}`,
    order: "fecha.desc,enviado_at.desc.nullslast",
    limit: String(cuantos),
  });
  if (!reps.length) return { reportes: [], nota: "Este niño no tiene reportes todavía." };
  const entIds = [...new Set(reps.map((r) => String(r.entrenador_id || "")).filter((x) => UUID.test(x)))];
  const grpIds = [...new Set(reps.map((r) => String(r.grupo_id || "")).filter((x) => UUID.test(x)))];
  const [ents, grps] = await Promise.all([
    entIds.length ? ctx.db("entrenadores", { select: "id,nombre_completo", id: inLista(entIds) }) : Promise.resolve([]),
    grpIds.length ? ctx.db("grupos", { select: "id,nombre_grupo", id: inLista(grpIds) }) : Promise.resolve([]),
  ]);
  const em = new Map(ents.map((e) => [String(e.id), String(e.nombre_completo)]));
  const gm = new Map(grps.map((g) => [String(g.id), String(g.nombre_grupo)]));
  const niveles = await ctx.nivelesPorId();
  const limpio = (o: Fila) => Object.fromEntries(Object.entries(o).filter(([, v]) => v !== null && v !== "" && !(Array.isArray(v) && !v.length)));
  return {
    reportes: reps.map((r) => limpio({
      fecha: r.fecha,
      dia: diaSemana(r.fecha),
      entrenador: em.get(String(r.entrenador_id)) || "desconocido",
      grupo: gm.get(String(r.grupo_id)) || null,
      nivel_reportado: niveles.get(String(r.nivel_id || ""))?.codigo || null,
      enviado: Boolean(r.enviado_at),
      actitud: [r.actitud, r.actitud_comentario].filter(Boolean).join(" — ") || null,
      tecnica: [r.tecnica, r.tecnica_comentario].filter(Boolean).join(" — ") || null,
      pista: [r.pista, r.pista_comentario].filter(Boolean).join(" — ") || null,
      remontes: [Array.isArray(r.remontes) ? r.remontes.join(", ") : r.remontes, r.remontes_comentario].filter(Boolean).join(" — ") || null,
      autonomia: [r.autonomia, r.autonomia_comentario].filter(Boolean).join(" — ") || null,
      incidencia: [r.incidencia, r.incidencia_comentario].filter(Boolean).join(" — ") || null,
      recomendacion: [r.recomendacion_proxima_sesion, r.recomendacion_comentario].filter(Boolean).join(" — ") || null,
      observaciones: r.observaciones_generales || null,
      mejora_hoy: r.mejora_hoy || (Array.isArray(r.mejoras_hoy) ? r.mejoras_hoy.join(", ") : null),
      prioridades_proxima: Array.isArray(r.prioridades_proxima_sesion) ? r.prioridades_proxima_sesion.join(", ") : null,
      ritmo_grupo: r.ritmo_grupo || null,
    })),
  };
}

async function informeAlumno(ctx: Contexto, args: Fila) {
  const id = String(args.alumno_id || "");
  if (!UUID.test(id)) return { error: "alumno_id no válido: usa buscar_alumno primero." };
  const hoy = hoyMadrid();
  const [filas, ga, asis, listados] = await Promise.all([
    ctx.db("alumnos", {
      select: "id,nombre_completo,fecha_nacimiento,nivel_actual_id,nivel_estimado_id,seccion_principal,estado_ficha,ocio_dia_fijo,ocio_hora_inicio_fija,camiseta_entregada,observacion_visible_entrenador,observacion_interna,activo",
      id: `eq.${id}`,
      limit: "1",
    }),
    ctx.db("grupo_alumnos", { select: "grupo_id,es_recuperacion", alumno_id: `eq.${id}`, limit: "200" }),
    ctx.db("asistencias", { select: "estado", alumno_id: `eq.${id}`, limit: "500" }),
    ctx.db("v_sesion_alumnos_operativa_app", { select: "sesion_id,estado_en_listado,nivel_usado", alumno_id: `eq.${id}`, limit: "100" }),
  ]);
  const a = filas[0];
  if (!a) return { error: "No encuentro esa ficha." };
  const nv = await nivelDeAlumno(ctx, a);

  const grupoIds = [...new Set(ga.map((g) => String(g.grupo_id)).filter((x) => UUID.test(x)))];
  const grupos = grupoIds.length
    ? await ctx.db("grupos", { select: "id,sesion_id,nombre_grupo,nivel_grupo,pista,punto_encuentro,publicado,cancelado", id: inLista(grupoIds) })
    : [];
  const sesIds = [...new Set([...grupos.map((g) => String(g.sesion_id)), ...listados.map((l) => String(l.sesion_id))].filter((x) => UUID.test(x)))];
  const sesiones = sesIds.length
    ? await ctx.db("sesiones", { select: "id,fecha,hora_inicio,hora_fin,modalidad_id", id: inLista(sesIds) })
    : [];
  const sm = new Map(sesiones.map((s) => [String(s.id), s]));
  const asign = grupoIds.length
    ? await ctx.db("v_grupos_sesion_operativa_app", { select: "grupo_id,entrenador,entrenador_apoyo", grupo_id: inLista(grupoIds) })
    : [];
  const am = new Map(asign.map((x) => [String(x.grupo_id), [x.entrenador, x.entrenador_apoyo].filter(Boolean).join(" + ")]));
  const mods = await ctx.modalidadesPorId();

  const conGrupo = grupos
    .filter((g) => !g.cancelado && sm.get(String(g.sesion_id)))
    .map((g) => {
      const s = sm.get(String(g.sesion_id))!;
      return {
        fecha: s.fecha, dia: diaSemana(s.fecha), hora: `${hora(s.hora_inicio)}-${hora(s.hora_fin)}`,
        modalidad: mods.get(String(s.modalidad_id)) || null, grupo: g.nombre_grupo, pista: g.pista || null,
        punto_encuentro: g.punto_encuentro || null, entrenador: am.get(String(g.id)) || null, publicado: g.publicado === true,
      };
    })
    .sort((x, y) => `${x.fecha} ${x.hora}`.localeCompare(`${y.fecha} ${y.hora}`));
  const sesionesConGrupo = new Set(grupos.map((g) => String(g.sesion_id)));
  const sinGrupo = listados
    .filter((l) => !sesionesConGrupo.has(String(l.sesion_id)) && sm.get(String(l.sesion_id)) && String(sm.get(String(l.sesion_id))!.fecha) >= hoy)
    .map((l) => {
      const s = sm.get(String(l.sesion_id))!;
      return { fecha: s.fecha, dia: diaSemana(s.fecha), hora: `${hora(s.hora_inicio)}-${hora(s.hora_fin)}`, modalidad: mods.get(String(s.modalidad_id)) || null, estado: l.estado_en_listado || null };
    });
  const cuenta = (e: string) => asis.filter((x) => norm(x.estado) === e).length;
  const reportes = await reportesAlumno(ctx, { alumno_id: id, cuantos: 3 });

  return {
    nombre: a.nombre_completo,
    edad: edad(a.fecha_nacimiento, hoy),
    fecha_nacimiento: a.fecha_nacimiento,
    nivel: nv ? `${nv.codigo}${nv.estimado ? " (estimado)" : ""}` : "sin nivel",
    seccion: a.seccion_principal,
    estado_ficha: a.estado_ficha,
    activo: a.activo,
    dia_fijo_ocio: a.ocio_dia_fijo ? `${a.ocio_dia_fijo}${a.ocio_hora_inicio_fija ? ` ${hora(a.ocio_hora_inicio_fija)}` : ""}` : null,
    camiseta_entregada: a.camiseta_entregada === true,
    observacion_para_entrenador: a.observacion_visible_entrenador || null,
    observacion_interna: a.observacion_interna || null,
    asistencia: { presente: cuenta("PRESENTE"), ausente: cuenta("AUSENTE"), pendiente: cuenta("PENDIENTE") },
    proximos_grupos: conGrupo.filter((x) => x.fecha >= hoy).slice(0, 6),
    ultimos_grupos: conGrupo.filter((x) => x.fecha < hoy).slice(-4),
    apuntado_sin_grupo: sinGrupo.slice(0, 6),
    ultimos_reportes: (reportes as Fila).reportes || [],
    notas_de_jose: (await notasDe(ctx, [id])).get(id) || [],
  };
}

type SesionAgenda = { sesion: Fila; grupos: Fila[] };

async function cargarAgenda(ctx: Contexto, desde: string, hasta: string, modalidad: string | null) {
  const params: Record<string, string> = {
    select: "sesion_id,fecha,hora_inicio,hora_fin,lugar,modalidad_codigo,total_alumnos,total_grupos,grupos_publicados,alumnos_en_grupos,alumnos_sin_grupo,estado_sesion",
    fecha: `gte.${desde}`,
    and: `(fecha.lte.${hasta})`,
    order: "fecha.asc,hora_inicio.asc",
    limit: "300",
  };
  let sesiones = await ctx.db("v_agenda_sesiones_operativa_app", params);
  if (modalidad) sesiones = sesiones.filter((s) => modalidadDe(s.modalidad_codigo) === modalidad);
  const ids = sesiones.map((s) => String(s.sesion_id));
  const grupos = ids.length
    ? await ctx.db("v_grupos_sesion_operativa_app", {
        select: "sesion_id,grupo_id,nombre_grupo,nivel_grupo,pista,punto_encuentro,publicado,entrenador_id,entrenador,entrenador_apoyo_id,entrenador_apoyo,total_alumnos,estado_confirmacion",
        sesion_id: inLista(ids),
        order: "nombre_grupo.asc",
      })
    : [];
  return sesiones.map((s) => ({ sesion: s, grupos: grupos.filter((g) => String(g.sesion_id) === String(s.sesion_id)) })) as SesionAgenda[];
}

async function agenda(ctx: Contexto, args: Fila) {
  const { desde, hasta } = rango(args.desde, args.hasta, 7);
  const datos = await cargarAgenda(ctx, desde, hasta, modalidadDe(args.modalidad));
  return {
    desde, hasta,
    sesiones: datos.map(({ sesion: s, grupos }) => ({
      fecha: s.fecha, dia: diaSemana(s.fecha), hora: `${hora(s.hora_inicio)}-${hora(s.hora_fin)}`,
      modalidad: s.modalidad_codigo, alumnos: s.total_alumnos, sin_grupo: s.alumnos_sin_grupo, estado: s.estado_sesion,
      grupos: grupos.map((g) => ({
        grupo_id: g.grupo_id, grupo: g.nombre_grupo, nivel: g.nivel_grupo, pista: g.pista, punto: g.punto_encuentro, alumnos: g.total_alumnos,
        entrenador: g.entrenador || "SIN ENTRENADOR", apoyo: g.entrenador_apoyo || null,
        confirmacion: g.estado_confirmacion || null, publicado: g.publicado === true,
      })),
    })),
  };
}

async function sinColocar(ctx: Contexto, args: Fila) {
  const { desde, hasta } = rango(args.desde, args.hasta, 14);
  const datos = await cargarAgenda(ctx, desde, hasta, modalidadDe(args.modalidad));
  const conPendientes = datos.filter((d) => Number(d.sesion.alumnos_sin_grupo) > 0);
  if (!conPendientes.length) return { desde, hasta, turnos: [], nota: "No hay niños sin grupo en ese periodo." };
  const ids = conPendientes.map((d) => String(d.sesion.sesion_id));
  const [roster, grupos] = await Promise.all([
    ctx.db("v_sesion_alumnos_operativa_app", { select: "sesion_id,alumno_id,alumno,nivel_usado,estado_en_listado,estado_ficha", sesion_id: inLista(ids) }),
    ctx.db("grupos", { select: "id,sesion_id", sesion_id: inLista(ids), cancelado: "eq.false" }),
  ]);
  const gIds = grupos.map((g) => String(g.id));
  const miembros = gIds.length ? await ctx.db("grupo_alumnos", { select: "grupo_id,alumno_id", grupo_id: inLista(gIds) }) : [];
  const sesionDeGrupo = new Map(grupos.map((g) => [String(g.id), String(g.sesion_id)]));
  const colocados = new Set(miembros.map((m) => `${sesionDeGrupo.get(String(m.grupo_id))}|${m.alumno_id}`));
  return {
    desde, hasta,
    turnos: conPendientes.map(({ sesion: s, grupos: gs }) => ({
      fecha: s.fecha, dia: diaSemana(s.fecha), hora: `${hora(s.hora_inicio)}-${hora(s.hora_fin)}`, modalidad: s.modalidad_codigo,
      grupos_creados: gs.map((g) => `${g.nombre_grupo} (${g.nivel_grupo || "?"}, ${g.total_alumnos} niños)`),
      sin_grupo: roster
        .filter((r) => String(r.sesion_id) === String(s.sesion_id) && !colocados.has(`${s.sesion_id}|${r.alumno_id}`))
        .map((r) => ({ alumno_id: r.alumno_id, nombre: r.alumno, nivel: r.nivel_usado || "sin nivel", ficha: r.estado_ficha || null })),
    })),
  };
}

async function opcionesAlumno(ctx: Contexto, args: Fila) {
  const hoy = hoyMadrid();
  const { desde, hasta } = rango(args.desde, args.hasta, 14);
  let nivelOrden: number | null = null;
  let nivelTexto = "";
  let edadNino: number | null = Number.isFinite(Number(args.edad)) && args.edad !== null && args.edad !== "" ? Number(args.edad) : null;
  let modalidad = modalidadDe(args.modalidad);
  let diaFijo: string | null = null;
  let nombre = "";
  if (args.alumno_id && UUID.test(String(args.alumno_id))) {
    const filas = await ctx.db("alumnos", { select: "nombre_completo,fecha_nacimiento,nivel_actual_id,nivel_estimado_id,seccion_principal,ocio_dia_fijo", id: `eq.${args.alumno_id}`, limit: "1" });
    const a = filas[0];
    if (!a) return { error: "No encuentro esa ficha." };
    nombre = a.nombre_completo;
    const nv = await nivelDeAlumno(ctx, a);
    if (nv) { nivelOrden = nv.orden; nivelTexto = nv.codigo; }
    if (edadNino === null) edadNino = edad(a.fecha_nacimiento, hoy);
    if (!modalidad) modalidad = String(a.seccion_principal || "").toUpperCase() === "OCIO" ? "OCIO" : "BABY";
    diaFijo = a.ocio_dia_fijo ? norm(a.ocio_dia_fijo) : null;
  }
  if (args.nivel) {
    const nv = await ctx.nivelPorCodigo(String(args.nivel));
    if (nv) { nivelOrden = nv.orden; nivelTexto = nv.codigo; }
  }
  if (!modalidad) return { error: "Dime si es Baby u Ocio." };
  const datos = await cargarAgenda(ctx, desde, hasta, modalidad);
  const dia = args.dia_semana ? norm(args.dia_semana) : null;
  const gIds = datos.flatMap((d) => d.grupos.map((g) => String(g.grupo_id)));
  const miembros = gIds.length ? await ctx.db("grupo_alumnos", { select: "grupo_id,alumno_id", grupo_id: inLista(gIds) }) : [];
  const aIds = [...new Set(miembros.map((m) => String(m.alumno_id)))];
  const alumnos = aIds.length ? await ctx.db("alumnos", { select: "id,fecha_nacimiento,nivel_actual_id,nivel_estimado_id", id: inLista(aIds) }) : [];
  const am = new Map(alumnos.map((x) => [String(x.id), x]));
  const niveles = await ctx.nivelesPorId();
  const cap = CAPACIDAD[modalidad] ?? 5;
  const notasNino = args.alumno_id && UUID.test(String(args.alumno_id))
    ? (await notasDe(ctx, [String(args.alumno_id)])).get(String(args.alumno_id)) || []
    : [];
  const vetados = new Map(notasNino.filter((n) => n.entrenador_id).map((n) => [String(n.entrenador_id), n.texto]));

  const opciones = [];
  for (const { sesion: s, grupos } of datos) {
    if (String(s.fecha) < hoy) continue;
    if (dia && norm(diaSemana(s.fecha)) !== dia) continue;
    for (const g of grupos) {
      const ms = miembros.filter((m) => String(m.grupo_id) === String(g.grupo_id)).map((m) => am.get(String(m.alumno_id))).filter(Boolean) as Fila[];
      const ordenes = ms.map((x) => niveles.get(String(x.nivel_actual_id || x.nivel_estimado_id || ""))?.orden).filter((o): o is number => typeof o === "number");
      const codigos = ms.map((x) => niveles.get(String(x.nivel_actual_id || x.nivel_estimado_id || ""))?.codigo).filter(Boolean);
      const edades = ms.map((x) => edad(x.fecha_nacimiento, String(s.fecha))).filter((e): e is number => e !== null);
      const med = ordenes.length ? [...ordenes].sort((p, q) => p - q)[Math.floor(ordenes.length / 2)] : null;
      const edadMedia = edades.length ? edades.reduce((p, q) => p + q, 0) / edades.length : null;
      const dNivel = nivelOrden === null || med === null ? 2 : Math.abs(nivelOrden - med);
      const dEdad = edadNino === null || edadMedia === null ? 2 : Math.abs(edadNino - edadMedia);
      const lleno = ms.length >= cap;
      const coincideDiaFijo = diaFijo ? norm(diaSemana(s.fecha)) === diaFijo : null;
      const choca = vetados.get(String(g.entrenador_id || "")) || vetados.get(String(g.entrenador_apoyo_id || "")) || null;
      const puntos = dNivel * 3 + Math.min(dEdad, 8) * 1.1 + ms.length * 0.15 + (lleno ? 20 : 0) + (coincideDiaFijo === false ? 4 : 0) + (choca ? 50 : 0);
      opciones.push({
        puntos: Math.round(puntos * 10) / 10,
        grupo_id: g.grupo_id,
        fecha: s.fecha, dia: diaSemana(s.fecha), hora: `${hora(s.hora_inicio)}-${hora(s.hora_fin)}`,
        grupo: g.nombre_grupo, nivel_grupo: g.nivel_grupo, niveles_dentro: codigos.join(", ") || "sin datos",
        edades: edades.length ? `${Math.min(...edades)}-${Math.max(...edades)} años` : "sin datos",
        alumnos: ms.length, plazas_libres: Math.max(cap - ms.length, 0), lleno,
        entrenador: g.entrenador || "SIN ENTRENADOR", publicado: g.publicado === true,
        dia_fijo_ocio: coincideDiaFijo,
        ...(choca ? { choca_con_nota_de_jose: choca } : {}),
      });
    }
  }
  opciones.sort((p, q) => p.puntos - q.puntos);
  const turnosSinGrupos = datos
    .filter(({ sesion: s, grupos }) => !grupos.length && String(s.fecha) >= hoy && (!dia || norm(diaSemana(s.fecha)) === dia))
    .map(({ sesion: s }) => `${diaSemana(s.fecha)} ${s.fecha} ${hora(s.hora_inicio)} (${s.total_alumnos} apuntados, sin grupos creados)`);
  return {
    nino: nombre || null, nivel: nivelTexto || "desconocido", edad: edadNino, modalidad, desde, hasta,
    criterio: "Menos puntos = mejor encaje (nivel pesa más que edad; grupos llenos al final).",
    mejores_opciones: opciones.slice(0, 6),
    turnos_sin_grupos: turnosSinGrupos.slice(0, 6),
    ...(notasNino.length ? { notas_de_jose: notasNino } : {}),
  };
}

async function material(ctx: Contexto, args: Fila) {
  const { desde, hasta } = rango(args.desde, args.hasta, 0);
  const datos = await cargarAgenda(ctx, desde, hasta, modalidadDe(args.modalidad));
  const gIds = datos.flatMap((d) => d.grupos.map((g) => String(g.grupo_id)));
  if (!gIds.length) return { desde, hasta, nota: "No hay grupos creados en esas fechas." };
  const miembros = await ctx.db("grupo_alumnos", { select: "grupo_id,alumno_id", grupo_id: inLista(gIds) });
  const aIds = [...new Set(miembros.map((m) => String(m.alumno_id)))];
  const entIds = [...new Set(datos.flatMap((d) => d.grupos.flatMap((g) => [g.entrenador_id, g.entrenador_apoyo_id])).map(String).filter((x) => UUID.test(x)))];
  const [alumnos, ents] = await Promise.all([
    aIds.length ? ctx.db("alumnos", { select: "id,nombre_completo,camiseta_entregada", id: inLista(aIds) }) : Promise.resolve([]),
    entIds.length ? ctx.db("entrenadores", { select: "id,nombre_completo,chaqueta_entregada", id: inLista(entIds) }) : Promise.resolve([]),
  ]);
  const am = new Map(alumnos.map((a) => [String(a.id), a]));
  const em = new Map(ents.map((e) => [String(e.id), e]));
  const porDia: Fila[] = [];
  const camisetasTotal = new Set<string>();
  const chaquetasTotal = new Set<string>();
  for (const fecha of [...new Set(datos.map((d) => String(d.sesion.fecha)))]) {
    const delDia = datos.filter((d) => String(d.sesion.fecha) === fecha);
    const grupoIds = new Set(delDia.flatMap((d) => d.grupos.map((g) => String(g.grupo_id))));
    const ninos = [...new Set(miembros.filter((m) => grupoIds.has(String(m.grupo_id))).map((m) => String(m.alumno_id)))];
    const sinCamiseta = ninos.map((id) => am.get(id)).filter((a) => a && a.camiseta_entregada !== true) as Fila[];
    const entsDia = [...new Set(delDia.flatMap((d) => d.grupos.flatMap((g) => [g.entrenador_id, g.entrenador_apoyo_id])).map(String).filter((x) => UUID.test(x)))];
    const sinChaqueta = entsDia.map((id) => em.get(id)).filter((e) => e && e.chaqueta_entregada !== true) as Fila[];
    sinCamiseta.forEach((a) => camisetasTotal.add(String(a.id)));
    sinChaqueta.forEach((e) => chaquetasTotal.add(String(e.id)));
    porDia.push({
      fecha, dia: diaSemana(fecha), ninos_en_grupos: ninos.length, entrenadores: entsDia.length,
      camisetas_rosas_por_entregar: sinCamiseta.length, ninos_sin_camiseta: sinCamiseta.map((a) => a.nombre_completo),
      chaquetas_por_entregar: sinChaqueta.length, entrenadores_sin_chaqueta: sinChaqueta.map((e) => e.nombre_completo),
    });
  }
  return {
    desde, hasta,
    total_camisetas_rosas: camisetasTotal.size,
    total_chaquetas: chaquetasTotal.size,
    por_dia: porDia,
    nota: "Solo cuenta niños ya metidos en grupos y entrenadores asignados (principal y apoyo). Los niños sin grupo no se cuentan.",
  };
}

async function gruposEntrenador(ctx: Contexto, args: Fila) {
  const { desde, hasta } = rango(args.desde, args.hasta, 7);
  const q = norm(args.nombre);
  const ents = await ctx.db("entrenadores", { select: "id,nombre_completo,chaqueta_entregada,especialidades,activo", activo: "eq.true", limit: "300" });
  const cand = q ? ents.filter((e) => q.split(" ").every((t) => norm(e.nombre_completo).split(" ").includes(t)) || norm(e.nombre_completo).includes(q)) : [];
  if (!cand.length) return { error: `No encuentro ningún entrenador activo que se llame «${args.nombre}».`, entrenadores: ents.map((e) => e.nombre_completo).slice(0, 60) };
  if (cand.length > 1) return { varios: cand.map((e) => e.nombre_completo) };
  const e = cand[0];
  const datos = await cargarAgenda(ctx, desde, hasta, null);
  const suyos = datos.flatMap(({ sesion: s, grupos }) =>
    grupos
      .filter((g) => String(g.entrenador_id) === String(e.id) || String(g.entrenador_apoyo_id) === String(e.id))
      .map((g) => ({
        fecha: s.fecha, dia: diaSemana(s.fecha), hora: `${hora(s.hora_inicio)}-${hora(s.hora_fin)}`, modalidad: s.modalidad_codigo,
        grupo: g.nombre_grupo, papel: String(g.entrenador_id) === String(e.id) ? "principal" : "apoyo",
        alumnos: g.total_alumnos, pista: g.pista, punto: g.punto_encuentro, confirmacion: g.estado_confirmacion, publicado: g.publicado === true,
      }))
  );
  return { entrenador: e.nombre_completo, chaqueta_entregada: e.chaqueta_entregada === true, especialidades: e.especialidades || [], desde, hasta, grupos: suyos };
}

async function reportesPendientes(ctx: Contexto, args: Fila) {
  const hoy = hoyMadrid();
  const { desde, hasta } = rango(args.desde || sumarDias(hoy, -7), args.hasta || hoy, 7);
  const filas = await ctx.db("v_reportes_pendientes_entrenador_dos_entrenadores", {
    select: "entrenador,fecha,hora_inicio,modalidad,nombre_grupo,alumno,estado_reporte",
    estado_reporte: "eq.Falta reporte",
    fecha: `gte.${desde}`,
    and: `(fecha.lte.${hasta})`,
    order: "fecha.asc,hora_inicio.asc",
    limit: "300",
  });
  const por = new Map<string, Fila[]>();
  for (const f of filas) {
    const k = String(f.entrenador || "Sin entrenador");
    (por.get(k) || por.set(k, []).get(k)!).push(f);
  }
  return {
    desde, hasta, total: filas.length,
    por_entrenador: [...por.entries()].map(([entrenador, fs]) => ({
      entrenador, pendientes: fs.length,
      detalle: fs.slice(0, 15).map((f) => `${diaSemana(f.fecha)} ${f.fecha} ${hora(f.hora_inicio)} ${f.modalidad} · ${f.nombre_grupo} · ${f.alumno}`),
    })),
  };
}

async function revisionSemana(ctx: Contexto, args: Fila) {
  const fecha = fechaValida(args.fecha) || hoyMadrid();
  const { text } = await buildWeeklyReview(ctx.db as any, lunesDe(fecha));
  return { revision: text };
}

// ------------------------- propuestas de cambio -----------------------------
// Paco NO escribe: prepara la propuesta, la comprueba y la app le enseña a Jose
// un botón «Confirmar». Solo al pulsarlo se hace el cambio, con la sesión de
// Jose y las mismas funciones que usa la Agenda.

export type Propuesta = {
  tipo: "incorporar" | "mover_mismo_turno";
  alumno_id: string | null;
  nombre: string;
  nivel: string;
  sesion_id: string;
  grupo_id: string;
  grupo_origen_id: string | null;
  grupo: string;
  turno: string;
  etiqueta: string;
};

async function prepararMeterEnGrupo(ctx: Contexto, args: Fila) {
  const hoy = hoyMadrid();
  const grupoId = String(args.grupo_id || "");
  if (!UUID.test(grupoId)) return { error: "grupo_id no válido: sácalo de opciones_para_nino o de agenda." };
  const [g] = await ctx.db("grupos", { select: "id,sesion_id,nombre_grupo,nivel_grupo,cancelado,publicado", id: `eq.${grupoId}`, limit: "1" });
  if (!g || g.cancelado) return { error: "Ese grupo no existe o está cancelado." };
  const [s] = await ctx.db("sesiones", { select: "id,fecha,hora_inicio,hora_fin,modalidad_id", id: `eq.${g.sesion_id}`, limit: "1" });
  if (!s) return { error: "No encuentro el turno de ese grupo." };
  const mods = await ctx.modalidadesPorId();
  const mod = modalidadDe(mods.get(String(s.modalidad_id)));
  if (mod !== "BABY") return { error: `Por ahora solo puedo meter niños en grupos de Baby (este turno es de ${mod || "otra modalidad"}). Eso hay que hacerlo desde la app.` };
  if (String(s.fecha) < hoy) return { error: "Ese turno ya ha pasado." };

  let alumnoId: string | null = null;
  let nombre = "";
  let nivel = "";
  if (args.alumno_id) {
    if (!UUID.test(String(args.alumno_id))) return { error: "alumno_id no válido: usa buscar_alumno primero." };
    const [a] = await ctx.db("alumnos", { select: "id,nombre_completo,nivel_actual_id,nivel_estimado_id,activo", id: `eq.${args.alumno_id}`, limit: "1" });
    if (!a || a.activo === false) return { error: "No encuentro esa ficha activa." };
    alumnoId = String(a.id);
    nombre = String(a.nombre_completo);
    const nv = await nivelDeAlumno(ctx, a);
    if (nv) nivel = nv.codigo;
  } else {
    nombre = String(args.nombre_nuevo || "").replace(/\s+/g, " ").trim().slice(0, 80);
    if (nombre.split(" ").length < 2) return { error: "Para un niño sin ficha necesito nombre y apellido (nombre_nuevo)." };
    const q = norm(nombre);
    const parecidos = (await ctx.db("alumnos", { select: "id,nombre_completo", activo: "eq.true", limit: "3000" }))
      .filter((a) => norm(a.nombre_completo) === q);
    if (parecidos.length) return { error: `Ya hay una ficha con ese nombre (${parecidos[0].nombre_completo}). Usa su alumno_id con buscar_alumno.` };
  }
  if (args.nivel) {
    const nv = await ctx.nivelPorCodigo(String(args.nivel));
    if (!nv) return { error: `No existe el nivel «${args.nivel}». Niveles: INICIACION, A, A+, B, B+, C, C+, D, D+.` };
    nivel = nv.codigo;
  }
  if (!nivel) return { error: "Ese niño no tiene nivel en su ficha: pregúntale a Jose qué nivel usar y pásalo en «nivel»." };

  const avisos: string[] = [];
  let tipo: Propuesta["tipo"] = "incorporar";
  let grupoOrigenId: string | null = null;
  const [miembros, gruposSesion] = await Promise.all([
    ctx.db("grupo_alumnos", { select: "alumno_id", grupo_id: `eq.${grupoId}` }),
    ctx.db("grupos", { select: "id,nombre_grupo", sesion_id: `eq.${s.id}`, cancelado: "eq.false" }),
  ]);
  if (alumnoId) {
    if (miembros.some((m) => String(m.alumno_id) === alumnoId)) return { error: `${nombre} ya está en ese grupo. No hay nada que cambiar.` };
    const otros = gruposSesion.filter((x) => String(x.id) !== grupoId).map((x) => String(x.id));
    if (otros.length) {
      const [ya] = await ctx.db("grupo_alumnos", { select: "grupo_id", alumno_id: `eq.${alumnoId}`, grupo_id: inLista(otros), limit: "1" });
      if (ya) {
        tipo = "mover_mismo_turno";
        grupoOrigenId = String(ya.grupo_id);
        const origen = gruposSesion.find((x) => String(x.id) === grupoOrigenId);
        avisos.push(`Ahora está en «${origen?.nombre_grupo || "otro grupo"}» de ese mismo turno: se le cambia de grupo.`);
      }
    }
    // ¿Apuntado a otro turno ese mismo día? No se le quita de ahí.
    const listados = await ctx.db("v_sesion_alumnos_operativa_app", { select: "sesion_id", alumno_id: `eq.${alumnoId}`, limit: "100" });
    const otrasSes = [...new Set(listados.map((l) => String(l.sesion_id)).filter((x) => UUID.test(x) && x !== String(s.id)))];
    if (otrasSes.length) {
      const mismas = await ctx.db("sesiones", { select: "id,hora_inicio", id: inLista(otrasSes), fecha: `eq.${s.fecha}` });
      for (const o of mismas) avisos.push(`Ojo: ese día también está apuntado a las ${hora(o.hora_inicio)}; esto NO le quita de ese turno (para cambiarle de turno, pídeme «pasa a ${nombre.split(" ")[0]} al ...»).`);
    }
  }
  if (alumnoId) {
    const notas = (await notasDe(ctx, [alumnoId])).get(alumnoId) || [];
    if (notas.length) {
      const [asig, extra] = await Promise.all([
        ctx.db("asignaciones_entrenadores", { select: "entrenador_id", grupo_id: `eq.${grupoId}` }),
        ctx.db("grupo_entrenadores_extra_app", { select: "entrenador_id", grupo_id: `eq.${grupoId}` }),
      ]);
      const delGrupo = new Set([...asig, ...extra].map((x) => String(x.entrenador_id)));
      for (const n of notas) {
        if (n.entrenador_id && delGrupo.has(n.entrenador_id)) {
          avisos.unshift(`⚠️ NOTA DE JOSE: «${n.texto}». Ese grupo es de ${n.entrenador || "ese entrenador"}.`);
        } else {
          avisos.push(`📝 Nota de Jose: «${n.texto}»${n.solo_proxima_vez ? " (para la próxima vez)" : ""}.`);
        }
      }
    }
  }
  const cap = CAPACIDAD.BABY;
  const total = miembros.length + 1;
  if (total > cap) avisos.push(`El grupo pasaría a ${total} niños (lo normal en Baby son ${cap} como mucho).`);
  if (g.publicado) avisos.push("El grupo ya está publicado: si quiere que el entrenador lo reconfirme, use «Avisar cambios» en la Agenda.");
  if (!alumnoId) avisos.push("No tiene ficha: se creará una nueva con ese nombre y nivel.");

  const turno = `${diaSemana(s.fecha)} ${String(s.fecha).slice(8, 10)}/${String(s.fecha).slice(5, 7)} ${hora(s.hora_inicio)}-${hora(s.hora_fin)}`;
  const propuesta: Propuesta = {
    tipo, alumno_id: alumnoId, nombre, nivel, sesion_id: String(s.id), grupo_id: grupoId, grupo_origen_id: grupoOrigenId,
    grupo: String(g.nombre_grupo), turno,
    etiqueta: `${tipo === "mover_mismo_turno" ? "Cambiar" : "Meter"} a ${nombre.split(" ").slice(0, 2).join(" ")} ${tipo === "mover_mismo_turno" ? "al grupo" : "en"} «${g.nombre_grupo}» · ${turno}`,
  };
  return {
    propuesta,
    avisos,
    nota: "Jose verá un botón para confirmar este cambio. NO digas que está hecho: dile qué se va a hacer, los avisos, y que pulse Confirmar.",
  };
}

// ------------------------- memoria: propuestas -------------------------------
// Igual que los cambios: Paco prepara la nota y Jose la guarda con un botón.

export type PropuestaNota =
  | { tipo: "nota"; alumno_id: string; nombre: string; entrenador_id: string | null; entrenador: string | null; texto: string; una_vez: boolean; etiqueta: string }
  | { tipo: "cerrar_nota"; nota_id: string; nombre: string; texto: string; etiqueta: string };

async function prepararNota(ctx: Contexto, args: Fila) {
  const id = String(args.alumno_id || "");
  if (!UUID.test(id)) return { error: "alumno_id no válido: usa buscar_alumno primero." };
  const texto = String(args.texto || "").replace(/\s+/g, " ").trim().slice(0, 300);
  if (texto.length < 3) return { error: "Dime qué quieres que apunte." };
  const [a] = await ctx.db("alumnos", { select: "id,nombre_completo", id: `eq.${id}`, limit: "1" });
  if (!a) return { error: "No encuentro esa ficha." };
  let entrenadorId: string | null = null;
  let entrenador: string | null = null;
  if (args.entrenador) {
    const q = norm(args.entrenador);
    const ents = await ctx.db("entrenadores", { select: "id,nombre_completo", activo: "eq.true", limit: "300" });
    const cand = ents.filter((e) => q.split(" ").every((t) => norm(e.nombre_completo).split(" ").includes(t)) || norm(e.nombre_completo).includes(q));
    if (!cand.length) return { error: `No encuentro ningún entrenador activo que se llame «${args.entrenador}».` };
    if (cand.length > 1) return { error: "Hay varios entrenadores con ese nombre: pregunta cuál.", varios: cand.map((e) => e.nombre_completo) };
    entrenadorId = String(cand[0].id);
    entrenador = String(cand[0].nombre_completo);
  }
  const unaVez = args.solo_proxima_vez === true;
  const nombre = String(a.nombre_completo);
  const corto = nombre.split(" ").slice(0, 2).join(" ");
  const propuesta: PropuestaNota = {
    tipo: "nota", alumno_id: id, nombre, entrenador_id: entrenadorId, entrenador, texto, una_vez: unaVez,
    etiqueta: `Apuntar sobre ${corto}: «${texto.slice(0, 90)}»${unaVez ? " (solo la próxima vez)" : ""}`,
  };
  return {
    propuesta_nota: propuesta,
    nota: `Jose verá un botón para guardar la nota. Dile cómo la has entendido${entrenador ? ` (va ligada a ${entrenador}: te avisaré si ${corto} acaba en su grupo)` : ""} y que pulse Confirmar.`,
  };
}

async function notasJose(ctx: Contexto, args: Fila) {
  const id = String(args.alumno_id || "");
  if (id && !UUID.test(id)) return { error: "alumno_id no válido: usa buscar_alumno primero." };
  if (id) return { notas: (await notasDe(ctx, [id])).get(id) || [] };
  const filas = await ctx.db("paco_notas", { select: "alumno_id", activa: "eq.true", order: "created_at.desc", limit: "60" });
  const ids = [...new Set(filas.map((f) => String(f.alumno_id)))];
  const [notas, alumnos] = await Promise.all([
    notasDe(ctx, ids),
    ids.length ? ctx.db("alumnos", { select: "id,nombre_completo", id: inLista(ids) }) : Promise.resolve([]),
  ]);
  const am = new Map(alumnos.map((a) => [String(a.id), String(a.nombre_completo)]));
  return { total: filas.length, por_nino: ids.map((i) => ({ nino: am.get(i) || "?", notas: notas.get(i) || [] })) };
}

async function prepararCerrarNota(ctx: Contexto, args: Fila) {
  const id = String(args.nota_id || "");
  if (!UUID.test(id)) return { error: "nota_id no válido: sácalo de notas_de_jose." };
  const [n] = await ctx.db("paco_notas", { select: "id,alumno_id,texto,activa", id: `eq.${id}`, limit: "1" });
  if (!n || n.activa === false) return { error: "Esa nota ya no está activa." };
  const [a] = await ctx.db("alumnos", { select: "nombre_completo", id: `eq.${n.alumno_id}`, limit: "1" });
  const nombre = String(a?.nombre_completo || "ese niño");
  const propuesta: PropuestaNota = {
    tipo: "cerrar_nota", nota_id: id, nombre, texto: String(n.texto),
    etiqueta: `Borrar la nota de ${nombre.split(" ").slice(0, 2).join(" ")}: «${String(n.texto).slice(0, 80)}»`,
  };
  return { propuesta_nota: propuesta, nota: "Jose verá un botón para borrarla. Dile cuál es y que pulse Confirmar." };
}

// ------------------------- más ojos (29/10) ----------------------------------

async function entrenadoresActivos(ctx: Contexto) {
  const [ents, usuarios] = await Promise.all([
    ctx.db("entrenadores", { select: "id,nombre_completo,activo", activo: "eq.true", limit: "300" }),
    ctx.db("usuarios_app", { select: "entrenador_id", activo: "eq.true", entrenador_id: "not.is.null", limit: "300" }),
  ]);
  const conAcceso = new Set(usuarios.map((u) => String(u.entrenador_id)));
  return ents.filter((e) => conAcceso.has(String(e.id))).map((e) => ({ id: String(e.id), nombre: String(e.nombre_completo) }));
}

async function disponibilidadEntrenadores(ctx: Contexto, args: Fila) {
  const fecha = fechaValida(args.fecha) || hoyMadrid();
  const lunes = lunesDe(fecha);
  const [sem] = await ctx.db("disponibilidad_semanas_editor", {
    select: "id,semana_inicio,estado,publicada_at,fecha_limite_publicada", semana_inicio: `eq.${lunes}`, limit: "1",
  });
  if (!sem) return { semana: lunes, estado: "sin_preparar", texto: `La disponibilidad de la semana del ${lunes} todavía no está preparada.` };
  if (sem.estado !== "publicado" || !sem.publicada_at) return { semana: lunes, estado: sem.estado, texto: "Está en preparación: los entrenadores aún no la ven." };
  const [turnos, respuestas, ents] = await Promise.all([
    ctx.db("disponibilidad_turnos_editor", { select: "turno_clave,fecha,hora_inicio,hora_fin,modalidades", semana_id: `eq.${sem.id}`, version_tipo: "eq.publicado", order: "fecha.asc,hora_inicio.asc", limit: "200" }),
    ctx.db("disponibilidad_respuestas_editor", { select: "entrenador_id,turno_clave,respuesta,comentario", semana_id: `eq.${sem.id}`, limit: "5000" }),
    entrenadoresActivos(ctx),
  ]);
  const resp = new Map(respuestas.map((r) => [`${r.entrenador_id}|${r.turno_clave}`, r]));
  const porTurno = turnos.map((t) => {
    const disponibles: string[] = [];
    const noPueden: string[] = [];
    for (const e of ents) {
      const r = resp.get(`${e.id}|${t.turno_clave}`);
      const v = norm(r?.respuesta);
      if (v.startsWith("DISPONIBLE") || v.startsWith("SI")) disponibles.push(e.nombre + (r?.comentario ? ` («${String(r.comentario).slice(0, 60)}»)` : ""));
      else if (v && v !== "PENDIENTE") noPueden.push(e.nombre);
    }
    return { turno: `${diaSemana(t.fecha)} ${t.fecha} ${hora(t.hora_inicio)}-${hora(t.hora_fin)}`, modalidades: t.modalidades, disponibles, no_pueden: noPueden.length };
  });
  const claves = new Set(turnos.map((t) => String(t.turno_clave)));
  const sinResponder = ents
    .map((e) => ({ e, pend: [...claves].filter((k) => { const v = norm(resp.get(`${e.id}|${k}`)?.respuesta); return !v || v === "PENDIENTE"; }).length }))
    .filter((x) => x.pend > 0)
    .map((x) => `${x.e.nombre} (le faltan ${x.pend} de ${claves.size})`);
  return {
    semana: lunes, estado: "publicado", limite: sem.fecha_limite_publicada || null,
    entrenadores: ents.length, sin_responder: sinResponder, por_turno: porTurno,
  };
}

async function avisosEntrenadores(ctx: Contexto, args: Fila) {
  const dias = Math.min(Math.max(Number(args.dias) || 3, 1), 14);
  const desde = new Date(Date.now() - dias * 86400000).toISOString();
  const [ents, subs] = await Promise.all([
    entrenadoresActivos(ctx),
    ctx.db("push_subscriptions_app", { select: "entrenador_id", activo: "eq.true", limit: "1000" }),
  ]);
  const conAvisos = new Set(subs.map((x) => String(x.entrenador_id)));
  let objetivo = ents;
  if (args.nombre) {
    const q = norm(args.nombre);
    objetivo = ents.filter((e) => norm(e.nombre).includes(q) || q.split(" ").every((t) => norm(e.nombre).split(" ").includes(t)));
    if (!objetivo.length) return { error: `No encuentro ningún entrenador activo que se llame «${args.nombre}».` };
  }
  const ids = objetivo.map((e) => e.id);
  const log = ids.length ? await ctx.db("push_notificaciones_log_app", {
    select: "entrenador_id,titulo,cuerpo,estado,created_at", entrenador_id: inLista(ids), created_at: `gte.${desde}`, order: "created_at.desc", limit: "300",
  }) : [];
  const hm = (iso: string) => new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  return {
    ultimos_dias: dias,
    sin_avisos_activados: ents.filter((e) => !conAvisos.has(e.id)).map((e) => e.nombre),
    por_entrenador: objetivo.slice(0, 40).map((e) => ({
      entrenador: e.nombre,
      avisos_activados: conAvisos.has(e.id),
      avisos: log.filter((l) => String(l.entrenador_id) === e.id).slice(0, args.nombre ? 15 : 4)
        .map((l) => `${hm(l.created_at)} · ${l.titulo}${args.nombre ? ` — ${String(l.cuerpo || "").slice(0, 120)}` : ""} · ${l.estado === "enviada" ? "le llegó al móvil" : l.estado === "sin_suscripcion" ? "NO (sin avisos activados)" : l.estado}`),
    })).filter((x) => args.nombre || x.avisos.length || !x.avisos_activados),
  };
}

async function altasTest(ctx: Contexto, _args: Fila) {
  const filas = await ctx.db("altas_nivel_inicial_app", {
    select: "nombre_completo,modalidad,estado,enviado_at,respondido_at,creado_at", estado: "in.(PENDIENTE_ENVIO,ENVIADO,RESPONDIDO,VALIDADO)", order: "creado_at.desc", limit: "200",
  });
  const dias = (iso: string | null) => (iso ? Math.floor((Date.now() - Date.parse(iso)) / 86400000) : null);
  const corto = (f: Fila) => `${f.nombre_completo} (${f.modalidad})`;
  return {
    sin_enviar: filas.filter((f) => f.estado === "PENDIENTE_ENVIO").map(corto),
    esperando_respuesta: filas.filter((f) => f.estado === "ENVIADO").map((f) => `${corto(f)} · enviado hace ${dias(f.enviado_at) ?? "?"} días`),
    respondidos_por_revisar: filas.filter((f) => f.estado === "RESPONDIDO").map((f) => `${corto(f)} · respondió hace ${dias(f.respondido_at) ?? "?"} días`),
    revisados_sin_anadir: filas.filter((f) => f.estado === "VALIDADO").map(corto),
    nota: "Esto está en Altas / Test.",
  };
}

async function intensivosEstado(ctx: Contexto, args: Fila) {
  const hoy = hoyMadrid();
  const dias = await ctx.db("intensivo_dias", { select: "id,intensivo_id,numero_dia,fecha,sesion_id", fecha: `gte.${sumarDias(hoy, -10)}`, order: "fecha.asc", limit: "200" });
  let ids = [...new Set(dias.map((d) => String(d.intensivo_id)))];
  if (!ids.length) return { intensivos: [], texto: "No hay intensivos en curso ni próximos." };
  const intensivos = await ctx.db("intensivos", { select: "id,nombre,estado,lugar", id: inLista(ids) });
  if (args.nombre) {
    const q = norm(args.nombre);
    ids = intensivos.filter((i) => norm(i.nombre).includes(q)).map((i) => String(i.id));
    if (!ids.length) return { error: `No encuentro un intensivo próximo que se llame «${args.nombre}».` };
  }
  const todosDias = await ctx.db("intensivo_dias", { select: "id,intensivo_id,numero_dia,fecha,sesion_id", intensivo_id: inLista(ids), order: "numero_dia.asc" });
  const sesIds = todosDias.map((d) => String(d.sesion_id || "")).filter((x) => UUID.test(x));
  const [grupos, inscritos, recs] = await Promise.all([
    sesIds.length ? ctx.db("grupos", { select: "sesion_id,publicado,cancelado", sesion_id: inLista(sesIds) }) : Promise.resolve([]),
    ctx.db("intensivo_alumnos", { select: "intensivo_id", intensivo_id: inLista(ids), limit: "2000" }),
    ctx.db("intensivo_recuperaciones", { select: "intensivo_origen_id,estado", intensivo_origen_id: inLista(ids), limit: "500" }),
  ]);
  return {
    intensivos: intensivos.filter((i) => ids.includes(String(i.id))).map((i) => {
      const ds = todosDias.filter((d) => String(d.intensivo_id) === String(i.id));
      return {
        intensivo: i.nombre, estado: i.estado, lugar: i.lugar,
        ninos_inscritos: inscritos.filter((x) => String(x.intensivo_id) === String(i.id)).length,
        recuperaciones_pendientes: recs.filter((r) => String(r.intensivo_origen_id) === String(i.id) && !["Resuelta", "Descartada"].includes(String(r.estado))).length,
        dias: ds.map((d) => {
          const gs = grupos.filter((g) => String(g.sesion_id) === String(d.sesion_id) && !g.cancelado);
          const pub = gs.filter((g) => g.publicado).length;
          return `Día ${d.numero_dia} · ${diaSemana(d.fecha)} ${d.fecha}: ${String(d.fecha) < hoy ? "hecho" : gs.length ? `${gs.length} grupos (${pub} publicados)` : "sin grupos"}`;
        }),
      };
    }),
  };
}

async function tareasSecretaria(ctx: Contexto, args: Fila) {
  const params: Record<string, string> = {
    select: "id,tipo,estado,prioridad,categoria,titulo,detalle,fecha_evento,fecha_limite,recordar_at,created_at",
    order: "fecha_limite.asc.nullslast,created_at.desc", limit: "60",
  };
  params.estado = args.incluir_resueltas === true ? "in.(pendiente,en_curso,resuelto,referencia)" : "in.(pendiente,en_curso,referencia)";
  const filas = await ctx.db("secretaria_coordinacion", params);
  const q = args.buscar ? norm(args.buscar) : "";
  const hm = (iso: string) => new Intl.DateTimeFormat("es-ES", { timeZone: "Europe/Madrid", weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso));
  const lista = filas
    .filter((f) => !q || norm(`${f.titulo} ${f.detalle || ""}`).includes(q))
    .map((f) => `${f.tipo === "nota" ? "📝 nota" : f.estado === "en_curso" ? "⏳ en curso" : f.estado === "resuelto" ? "✓ resuelta" : "☐ pendiente"}${f.prioridad === "urgente" || f.prioridad === "alta" ? ` (${f.prioridad})` : ""} · ${f.titulo}${f.fecha_limite ? ` · límite ${f.fecha_limite}` : ""}${f.recordar_at ? ` · aviso ${hm(f.recordar_at)}` : ""}${f.detalle ? ` — ${String(f.detalle).slice(0, 140)}` : ""}`);
  return { total: lista.length, tareas: lista.slice(0, 40), nota: "Para crear un recordatorio con aviso usa preparar_recordatorio." };
}

// ------------------------- gestiones (29/10) ---------------------------------
// Más «manos» de Paco. Igual que el resto: prepara y comprueba, la app enseña
// un botón Confirmar y solo entonces se hace, con la sesión de Jose.

export type PropuestaGestion =
  | { tipo: "recordatorio"; titulo: string; detalle: string | null; recordar_at: string; cuando: string; etiqueta: string }
  | { tipo: "publicar_grupos"; grupos: { grupo_id: string; nombre: string; turno: string; entrenador: string }[]; etiqueta: string };

/** Fecha y hora de Madrid → instante ISO (UTC), teniendo en cuenta el horario de verano. */
export function madridAIso(fecha: string, horaTxt: string) {
  const m = `${fecha}T${horaTxt}`.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{2})/);
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  if (h > 23 || mi > 59) return null;
  const deseado = Date.UTC(y, mo - 1, d, h, mi);
  let t = deseado;
  for (let i = 0; i < 2; i++) {
    const p = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Europe/Madrid", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false,
    }).formatToParts(new Date(t));
    const g = (x: string) => Number(p.find((q) => q.type === x)?.value || 0);
    t += deseado - Date.UTC(g("year"), g("month") - 1, g("day"), g("hour") % 24, g("minute"));
  }
  return new Date(t).toISOString();
}

async function prepararRecordatorio(_ctx: Contexto, args: Fila) {
  const titulo = String(args.titulo || "").replace(/\s+/g, " ").trim().slice(0, 160);
  if (titulo.length < 3) return { error: "Dime qué quieres que te recuerde (titulo)." };
  const fecha = fechaValida(args.fecha);
  if (!fecha) return { error: "Falta la fecha (YYYY-MM-DD). Calcúlala con el calendario." };
  const horaTxt = /^\d{1,2}:\d{2}$/.test(String(args.hora || "")) ? String(args.hora) : "09:00";
  const iso = madridAIso(fecha, horaTxt);
  if (!iso) return { error: "Hora no válida (HH:MM)." };
  if (Date.parse(iso) < Date.now() - 60000) return { error: "Esa fecha y hora ya han pasado: pregunta a Jose cuándo quiere el aviso." };
  const detalle = String(args.detalle || "").trim().slice(0, 1500) || null;
  const cuando = `${diaSemana(fecha)} ${fecha.slice(8, 10)}/${fecha.slice(5, 7)} a las ${horaTxt.padStart(5, "0")}`;
  const propuesta: PropuestaGestion = {
    tipo: "recordatorio", titulo, detalle, recordar_at: iso, cuando,
    etiqueta: `Recordatorio «${titulo.slice(0, 70)}» · ${cuando}`,
  };
  return {
    propuesta_gestion: propuesta,
    nota: `Jose verá un botón para guardarlo en Secretaría con aviso al móvil el ${cuando}${args.hora ? "" : " (no dijo hora: 09:00)"}. NO digas que está hecho: que pulse Confirmar.`,
  };
}

async function prepararPublicarGrupos(ctx: Contexto, args: Fila) {
  const ids = (Array.isArray(args.grupo_ids) ? args.grupo_ids : [args.grupo_ids])
    .map((x: unknown) => String(x || "")).filter((x: string) => UUID.test(x));
  if (!ids.length) return { error: "Necesito los grupo_id a publicar: sácalos de agenda." };
  const unicos = [...new Set(ids)].slice(0, 12);
  const hoy = hoyMadrid();
  const grupos = await ctx.db("v_grupos_sesion_operativa_app", {
    select: "grupo_id,sesion_id,nombre_grupo,publicado,entrenador_id,entrenador,punto_encuentro,total_alumnos",
    grupo_id: inLista(unicos),
  });
  const sesIds = [...new Set(grupos.map((g) => String(g.sesion_id)))];
  const sesiones = sesIds.length ? await ctx.db("sesiones", { select: "id,fecha,hora_inicio,hora_fin", id: inLista(sesIds) }) : [];
  const ses = new Map(sesiones.map((x) => [String(x.id), x]));
  const listos: { grupo_id: string; nombre: string; turno: string; entrenador: string }[] = [];
  const noListos: string[] = [];
  for (const id of unicos) {
    const g = grupos.find((x) => String(x.grupo_id) === id);
    if (!g) { noListos.push(`${id.slice(0, 8)}: no existe o está cancelado`); continue; }
    const s = ses.get(String(g.sesion_id));
    const nombre = String(g.nombre_grupo || "Grupo");
    const turno = s ? `${diaSemana(s.fecha)} ${String(s.fecha).slice(8, 10)}/${String(s.fecha).slice(5, 7)} ${hora(s.hora_inicio)}` : "";
    const particular = norm(nombre).startsWith("PARTICULAR");
    if (g.publicado) noListos.push(`${nombre} (${turno}): ya está publicado`);
    else if (s && String(s.fecha) < hoy) noListos.push(`${nombre} (${turno}): ese día ya ha pasado`);
    else if (!g.entrenador_id) noListos.push(`${nombre} (${turno}): no tiene entrenador`);
    else if (!particular && !String(g.punto_encuentro || "").trim()) noListos.push(`${nombre} (${turno}): no tiene punto de encuentro`);
    else if (!Number(g.total_alumnos)) noListos.push(`${nombre} (${turno}): no tiene niños`);
    else listos.push({ grupo_id: id, nombre, turno, entrenador: String(g.entrenador || "") });
  }
  if (!listos.length) return { error: "Ninguno de esos grupos se puede publicar todavía.", no_listos: noListos };
  const mismos = new Set(listos.map((l) => l.turno)).size === 1;
  const propuesta: PropuestaGestion = {
    tipo: "publicar_grupos", grupos: listos,
    etiqueta: listos.length === 1
      ? `Publicar «${listos[0].nombre}» (${listos[0].turno}) a ${listos[0].entrenador.split(" ")[0]}`
      : `Publicar ${listos.length} grupos${mismos ? ` del ${listos[0].turno}` : ""}`,
  };
  return {
    propuesta_gestion: propuesta,
    no_listos: noListos,
    nota: "Al confirmar se publican al entrenador (lo ve en su Vista entrenador y le llega el aviso). Di cuáles se publicarán y cuáles no y por qué. NO digas que está hecho: que pulse Confirmar.",
  };
}

// ------------------------------ registro ------------------------------------

type Impl = (ctx: Contexto, args: Fila) => Promise<unknown>;

const FECHA = { type: "string", description: "Fecha YYYY-MM-DD" };
const MODALIDAD = { type: "string", enum: ["BABY", "OCIO", "INTENSIVOS"], description: "Modalidad (opcional)" };

export const HERRAMIENTAS: { def: DefHerramienta; impl: Impl }[] = [
  {
    impl: buscarAlumno,
    def: { type: "function", function: {
      name: "buscar_alumno",
      description: "Busca niños activos por nombre (vale nombre de pila o con apellidos). Devuelve alumno_id, edad, nivel, sección, día fijo de Ocio y si tiene camiseta. Úsala SIEMPRE antes de otras herramientas que piden alumno_id.",
      parameters: { type: "object", properties: { nombre: { type: "string" } }, required: ["nombre"] },
    } },
  },
  {
    impl: informeAlumno,
    def: { type: "function", function: {
      name: "informe_alumno",
      description: "Informe completo de un niño: edad, nivel, sección, observaciones, asistencia, próximos y últimos grupos (con entrenador, pista y punto), turnos donde está apuntado sin grupo y sus 3 últimos reportes.",
      parameters: { type: "object", properties: { alumno_id: { type: "string" } }, required: ["alumno_id"] },
    } },
  },
  {
    impl: reportesAlumno,
    def: { type: "function", function: {
      name: "reportes_alumno",
      description: "Últimos reportes de un niño con el entrenador que lo hizo y TODO lo que escribió (actitud, técnica, pista, remontes, autonomía, incidencias, recomendación, observaciones).",
      parameters: { type: "object", properties: { alumno_id: { type: "string" }, cuantos: { type: "integer", description: "1 a 10, por defecto 3" } }, required: ["alumno_id"] },
    } },
  },
  {
    impl: agenda,
    def: { type: "function", function: {
      name: "agenda",
      description: "Turnos y grupos de unas fechas: hora, modalidad, alumnos, niños sin grupo, y cada grupo con nivel, pista, punto de encuentro, entrenador, apoyo, confirmación y si está publicado.",
      parameters: { type: "object", properties: { desde: FECHA, hasta: FECHA, modalidad: MODALIDAD } },
    } },
  },
  {
    impl: sinColocar,
    def: { type: "function", function: {
      name: "ninos_sin_colocar",
      description: "Niños apuntados a un turno que todavía no están en ningún grupo, por turno, con su nivel y los grupos ya creados en ese turno. Por defecto los próximos 14 días.",
      parameters: { type: "object", properties: { desde: FECHA, hasta: FECHA, modalidad: MODALIDAD } },
    } },
  },
  {
    impl: opcionesAlumno,
    def: { type: "function", function: {
      name: "opciones_para_nino",
      description: "Recomienda los mejores grupos (día, hora y grupo) para un niño: uno existente (alumno_id) o uno nuevo que aún no tiene ficha (edad + nivel + modalidad). Ordena por encaje de nivel y edad, plazas libres y día fijo de Ocio. Sirve para altas tardías y para colocar niños que no encajan.",
      parameters: { type: "object", properties: {
        alumno_id: { type: "string" }, edad: { type: "integer" }, nivel: { type: "string", description: "INICIACION, A, A+, B, B+, C, C+, D, D+" },
        modalidad: MODALIDAD, dia_semana: { type: "string", description: "Solo ese día de la semana (opcional)" }, desde: FECHA, hasta: FECHA,
      } },
    } },
  },
  {
    impl: material,
    def: { type: "function", function: {
      name: "material_necesario",
      description: "Cuántas camisetas rosas hay que entregar (niños en grupos que aún no la tienen) y cuántas chaquetas de entrenador (entrenadores asignados sin chaqueta), por día y en total. Para un día pon desde=hasta; para el fin de semana, sábado a domingo.",
      parameters: { type: "object", properties: { desde: FECHA, hasta: FECHA, modalidad: MODALIDAD } },
    } },
  },
  {
    impl: gruposEntrenador,
    def: { type: "function", function: {
      name: "grupos_de_entrenador",
      description: "Grupos que tiene un entrenador (principal o apoyo) en unas fechas, y si tiene chaqueta.",
      parameters: { type: "object", properties: { nombre: { type: "string" }, desde: FECHA, hasta: FECHA }, required: ["nombre"] },
    } },
  },
  {
    impl: reportesPendientes,
    def: { type: "function", function: {
      name: "reportes_pendientes",
      description: "Reportes que faltan por hacer, por entrenador. Por defecto los últimos 7 días.",
      parameters: { type: "object", properties: { desde: FECHA, hasta: FECHA } },
    } },
  },
  {
    impl: prepararMeterEnGrupo,
    def: { type: "function", function: {
      name: "preparar_meter_en_grupo",
      description: "Prepara (sin hacerlo) meter a un niño en un grupo de Baby de un turno futuro: un alta tardía, un niño sin grupo o pasarlo de grupo en el mismo turno. Comprueba todo y la app le enseña a Jose un botón Confirmar. Úsala cuando Jose diga «mételo», «mete a X en el grupo que me dijiste», etc. Necesita grupo_id (de opciones_para_nino o agenda) y alumno_id; si el niño no tiene ficha, nombre_nuevo + nivel.",
      parameters: { type: "object", properties: {
        grupo_id: { type: "string" }, alumno_id: { type: "string" },
        nombre_nuevo: { type: "string", description: "Nombre y apellidos si no tiene ficha" },
        nivel: { type: "string", description: "Nivel a usar si no tiene o Jose dice otro: INICIACION, A, A+, B, B+, C, C+, D, D+" },
      }, required: ["grupo_id"] },
    } },
  },
  {
    impl: prepararNota,
    def: { type: "function", function: {
      name: "preparar_nota",
      description: "Prepara (sin guardarla) una nota de Jose sobre un niño o su familia, para recordársela siempre que vuelva a salir ese niño: «mejor que venga el miércoles», «no con Nico», «el próximo día a pista grande». Jose la guarda con un botón. Si la nota es sobre un entrenador (no ponerle con él), pásalo en «entrenador» para avisar si acaba en su grupo. Usa solo_proxima_vez=true si es para la próxima sesión.",
      parameters: { type: "object", properties: {
        alumno_id: { type: "string" },
        texto: { type: "string", description: "La nota tal y como la diría Jose, corta y clara" },
        entrenador: { type: "string", description: "Nombre del entrenador al que se refiere (opcional)" },
        solo_proxima_vez: { type: "boolean" },
      }, required: ["alumno_id", "texto"] },
    } },
  },
  {
    impl: notasJose,
    def: { type: "function", function: {
      name: "notas_de_jose",
      description: "Lo que Jose tiene apuntado: de un niño (alumno_id) o, sin alumno_id, todas las notas activas por niño. Devuelve nota_id para poder borrarlas.",
      parameters: { type: "object", properties: { alumno_id: { type: "string" } } },
    } },
  },
  {
    impl: prepararCerrarNota,
    def: { type: "function", function: {
      name: "preparar_borrar_nota",
      description: "Prepara (sin hacerlo) borrar o dar por hecha una nota de Jose (nota_id de notas_de_jose). Jose lo confirma con un botón.",
      parameters: { type: "object", properties: { nota_id: { type: "string" } }, required: ["nota_id"] },
    } },
  },
  {
    impl: disponibilidadEntrenadores,
    def: { type: "function", function: {
      name: "disponibilidad_entrenadores",
      description: "Disponibilidad publicada de los entrenadores para una semana (cualquier día de esa semana; por defecto la actual): quién puede en cada turno, cuántos no pueden y quién no ha contestado todo.",
      parameters: { type: "object", properties: { fecha: FECHA } },
    } },
  },
  {
    impl: avisosEntrenadores,
    def: { type: "function", function: {
      name: "avisos_entrenadores",
      description: "Avisos (push) que se han mandado a los entrenadores en los últimos días y si les llegaron al móvil; quién no tiene los avisos activados. Con nombre, el detalle de un entrenador.",
      parameters: { type: "object", properties: { nombre: { type: "string" }, dias: { type: "integer", description: "1 a 14, por defecto 3" } } },
    } },
  },
  {
    impl: altasTest,
    def: { type: "function", function: {
      name: "altas_test",
      description: "Estado de las altas y tests de nivel de niños nuevos: sin enviar, esperando respuesta de la familia (y desde cuándo), respondidos por revisar y revisados sin añadir.",
      parameters: { type: "object", properties: {} },
    } },
  },
  {
    impl: intensivosEstado,
    def: { type: "function", function: {
      name: "intensivos",
      description: "Intensivos en curso y próximos: niños inscritos, estado de cada día (sin grupos, grupos y cuántos publicados, hecho) y recuperaciones pendientes. Con nombre, solo ese intensivo.",
      parameters: { type: "object", properties: { nombre: { type: "string" } } },
    } },
  },
  {
    impl: tareasSecretaria,
    def: { type: "function", function: {
      name: "tareas_secretaria",
      description: "Tareas y notas de Secretaría de Jose (pendientes, en curso y notas; con incluir_resueltas también las hechas), con su fecha límite y la hora del aviso si tienen. «buscar» filtra por texto.",
      parameters: { type: "object", properties: { buscar: { type: "string" }, incluir_resueltas: { type: "boolean" } } },
    } },
  },
  {
    impl: prepararRecordatorio,
    def: { type: "function", function: {
      name: "preparar_recordatorio",
      description: "Prepara (sin guardarlo) un recordatorio para Jose en Secretaría con aviso al móvil a una fecha y hora: «recuérdame mañana a las 10 llamar a la madre de Liam», «avísame el viernes de pedir las chaquetas». Jose lo guarda con un botón. Si no dice hora, 09:00.",
      parameters: { type: "object", properties: {
        titulo: { type: "string", description: "Qué hay que hacer, corto (como lo diría Jose)" },
        detalle: { type: "string", description: "Más contexto si lo hay (opcional)" },
        fecha: FECHA,
        hora: { type: "string", description: "HH:MM en hora de Madrid" },
      }, required: ["titulo", "fecha"] },
    } },
  },
  {
    impl: prepararPublicarGrupos,
    def: { type: "function", function: {
      name: "preparar_publicar_grupos",
      description: "Prepara (sin hacerlo) publicar al entrenador uno o varios grupos (grupo_id de agenda): comprueba que tienen entrenador, punto de encuentro y niños, y que no están ya publicados. Jose lo confirma con un botón; al publicarse, el entrenador lo ve y recibe el aviso. Para «publica los del sábado», usa antes agenda y pasa los grupo_id sin publicar.",
      parameters: { type: "object", properties: {
        grupo_ids: { type: "array", items: { type: "string" }, description: "Uno o varios grupo_id (máx. 12)" },
      }, required: ["grupo_ids"] },
    } },
  },
  {
    impl: revisionSemana,
    def: { type: "function", function: {
      name: "revision_semana",
      description: "Revisión completa de una semana: si salen todos los grupos con los entrenadores disponibles, quién no ha contestado la disponibilidad y problemas en los grupos.",
      parameters: { type: "object", properties: { fecha: { type: "string", description: "Cualquier día de esa semana (YYYY-MM-DD)" } } },
    } },
  },
];

export async function ejecutarHerramienta(ctx: Contexto, nombre: string, argumentos: string) {
  const h = HERRAMIENTAS.find((x) => x.def.function.name === nombre);
  if (!h) return { error: `No existe la herramienta ${nombre}.` };
  let args: Fila = {};
  try { args = argumentos ? JSON.parse(argumentos) : {}; } catch { return { error: "Argumentos no válidos (JSON)." }; }
  try {
    return await h.impl(ctx, args && typeof args === "object" ? args : {});
  } catch (e) {
    console.error("herramienta", nombre, e);
    return { error: `No he podido leer esos datos ahora mismo (${String((e as Error)?.message || e).slice(0, 120)}).` };
  }
}
