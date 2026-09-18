import type { GrupoPlanning } from '../../core/sessions/operationalTypes';
import type { GrupoIntensivoDiaApp, IntensivoAlumnoApp, IntensivoApp, IntensivoDiaApp } from '../intensivos/intensiveTypes';
import type { AgendaGrupoSesionApp, AgendaSesionDirectaApp, ListadoApp, SesionAgendaOperativa } from './agendaTypes';

export function pendingAgendaStudents<T extends { alumno?: string | null }>(
  students: T[],
  groups: Array<{ alumnos_lista?: string | null }>,
  normalizeName: (value: string | null | undefined) => string
): T[] {
  if (groups.length === 0) return [];

  const placed = new Set<string>();
  groups.forEach((group) => {
    String(group.alumnos_lista || '')
      .split(' || ')
      .forEach((rawName) => {
        const normalized = normalizeName(rawName);
        if (normalized) placed.add(normalized);
      });
  });

  return students.filter((student) => {
    const normalized = normalizeName(student.alumno);
    return !normalized || !placed.has(normalized);
  });
}

export function buildAgendaOperationalSessions(input: {
  directSessions: AgendaSesionDirectaApp[];
  directGroups: AgendaGrupoSesionApp[];
  intensiveDays: IntensivoDiaApp[];
  intensives: IntensivoApp[];
  intensiveGroups: GrupoIntensivoDiaApp[];
  intensiveStudents: IntensivoAlumnoApp[];
  planning: GrupoPlanning[];
  rosters: ListadoApp[];
}): SesionAgendaOperativa[] {
  const sessions = new Map<string, SesionAgendaOperativa>();
  for (const direct of input.directSessions) {
    sessions.set(`operativa-${direct.sesion_id}`, {
      id: `operativa-${direct.sesion_id}`, fecha: direct.fecha, hora_inicio: direct.hora_inicio,
      hora_fin: direct.hora_fin, modalidad: direct.modalidad_codigo || direct.modalidad,
      titulo: `${direct.modalidad} · ${direct.lugar || 'Madrid SnowZone'}`,
      estado: direct.total_grupos === 0 ? 'Listado cargado · grupos pendientes'
        : direct.alumnos_sin_grupo > 0 ? `Faltan ${direct.alumnos_sin_grupo} alumnos por colocar` : 'Grupos creados',
      totalAlumnos: Math.max(Number(direct.total_alumnos || 0), Number(direct.alumnos_en_grupos || 0)),
      totalGrupos: Number(direct.total_grupos || 0), publicados: Number(direct.grupos_publicados || 0),
      origen: 'operativa', grupos: [], planningGrupos: [], agendaDirecta: direct,
    });
  }
  for (const day of input.intensiveDays) {
    if (day.sesion_id && input.directSessions.some((session) => session.sesion_id === day.sesion_id)) continue;
    const intensive = input.intensives.find((item) => item.intensivo_id === day.intensivo_id);
    const groups = input.intensiveGroups.filter((group) => group.intensivo_dia_id === day.intensivo_dia_id && group.grupo_id);
    const id = `intensivo-${day.intensivo_dia_id}`;
    sessions.set(id, {
      id, fecha: day.fecha, hora_inicio: day.hora_inicio, hora_fin: day.hora_fin,
      modalidad: 'INTENSIVO', titulo: intensive?.intensivo || 'Intensivo',
      estado: groups.length === 0 ? 'Pendiente de grupos' : groups.some((group) => !group.publicado) ? 'Grupos sin publicar' : 'Publicado',
      totalAlumnos: input.intensiveStudents.filter((student) => student.intensivo_id === day.intensivo_id).length,
      totalGrupos: groups.length, publicados: groups.filter((group) => group.publicado).length,
      origen: 'intensivo', intensivo: intensive, dia: day, grupos: groups, planningGrupos: [],
    });
  }
  const planningBySession = new Map<string, GrupoPlanning[]>();
  for (const group of input.planning) {
    const key = `${group.fecha}-${group.hora_inicio}-${group.hora_fin}-${group.modalidad}`;
    planningBySession.set(key, [...(planningBySession.get(key) || []), group]);
  }
  for (const [key, groups] of planningBySession) {
    const first = groups[0];
    if (!first || String(first.modalidad || '').toUpperCase().includes('INTENSIVO')) continue;
    const existing = [...sessions.values()].find((session) =>
      session.fecha === first.fecha && session.hora_inicio === first.hora_inicio && session.hora_fin === first.hora_fin
      && String(session.modalidad || '').toUpperCase() === String(first.modalidad || '').toUpperCase());
    if (existing) {
      sessions.set(existing.id, {
        ...existing, planningGrupos: groups, totalGrupos: Math.max(existing.totalGrupos, groups.length),
        publicados: Math.max(existing.publicados, groups.filter((group) => group.publicado).length),
        estado: groups.every((group) => group.publicado) ? 'Publicado' : existing.estado,
      });
    } else {
      sessions.set(`planning-${key}`, {
        id: `planning-${key}`, fecha: first.fecha, hora_inicio: first.hora_inicio, hora_fin: first.hora_fin,
        modalidad: first.modalidad, titulo: first.modalidad,
        estado: groups.every((group) => group.publicado) ? 'Publicado' : 'Pendiente publicar',
        totalAlumnos: groups.reduce((total, group) => total + Number(group.total_alumnos || 0), 0),
        totalGrupos: groups.length, publicados: groups.filter((group) => group.publicado).length,
        origen: 'planning', grupos: [], planningGrupos: groups,
      });
    }
  }
  for (const roster of input.rosters) {
    const duplicate = [...sessions.values()].some((session) =>
      session.fecha === roster.fecha && session.hora_inicio === roster.hora_inicio && session.modalidad === roster.modalidad);
    if (duplicate) continue;
    sessions.set(`listado-${roster.listado_id}`, {
      id: `listado-${roster.listado_id}`, fecha: roster.fecha, hora_inicio: roster.hora_inicio,
      hora_fin: roster.hora_fin, modalidad: roster.modalidad, titulo: `Listado ${roster.modalidad}`,
      estado: roster.estado, totalAlumnos: Number(roster.total_nombres_detectados || 0), totalGrupos: 0,
      publicados: 0, origen: 'listado', grupos: [], planningGrupos: [], listado: roster,
    });
  }
  return [...sessions.values()].sort((a, b) => `${a.fecha} ${a.hora_inicio}`.localeCompare(`${b.fecha} ${b.hora_inicio}`));
}
