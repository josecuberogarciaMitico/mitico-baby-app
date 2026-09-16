import type {
  AlumnoContextoTrabajoDiarioApp,
  DailyWorkContextSources,
  TrabajoDiarioHistoricoApp,
} from './dailyWorkTypes';

export function normalizeDailyWorkMemoryText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function recentDailyWorkForGroup(
  studentNames: string[],
  history: TrabajoDiarioHistoricoApp[],
  currentDate?: string | null
): string[] {
  const names = studentNames
    .map(normalizeDailyWorkMemoryText)
    .filter((name) => name.length >= 4);
  if (names.length === 0 || history.length === 0) return [];

  const candidates = history
    .filter((item) => {
      if (!item.trabajo_diario || !item.alumnos_detalle) return false;
      if (currentDate && item.fecha >= currentDate) return false;
      const historicalStudents = normalizeDailyWorkMemoryText(item.alumnos_detalle);
      return names.some((name) => historicalStudents.includes(name));
    })
    .map((item) => ({
      text: item.trabajo_diario || '',
      matches: names.filter((name) =>
        normalizeDailyWorkMemoryText(item.alumnos_detalle || '').includes(name)
      ).length,
      date: item.fecha,
    }))
    .sort((a, b) => b.matches - a.matches || b.date.localeCompare(a.date));

  const unique: string[] = [];
  const seen = new Set<string>();
  candidates.forEach((item) => {
    const key = normalizeDailyWorkMemoryText(item.text);
    if (!key || seen.has(key) || unique.length >= 6) return;
    seen.add(key);
    unique.push(item.text);
  });
  return unique;
}

export function buildDailyWorkStudentContext(
  studentId: string,
  sources: DailyWorkContextSources,
  fallback: { name?: string; level?: string } = {}
): AlumnoContextoTrabajoDiarioApp {
  const summary = sources.students.find((item) => item.alumno_id === studentId);
  const profile = sources.profiles.find((item) => item.alumno_id === studentId);
  const rhythm = sources.rhythmTrends.find((item) => item.alumno_id === studentId);
  const progression = sources.initialProgressions.find((item) => item.alumno_id === studentId);
  const technical = sources.technicalContexts.find((item) => item.alumno_id === studentId);
  const structuredTechnique = Object.entries(technical?.evaluacion_tecnica || {})
    .filter(([, value]) => value === 'Necesita mejorar' || value === 'En desarrollo')
    .map(([competence, value]) => `${competence.replaceAll('_', ' ')} ${value}`)
    .join(' · ');
  const technicalPriorities = Array.isArray(technical?.prioridades_proxima_sesion)
    ? technical.prioridades_proxima_sesion.join(' · ')
    : '';

  return {
    alumnoId: studentId,
    nombre: summary?.alumno || profile?.alumno || fallback.name || 'Alumno',
    nivel:
      profile?.nivel_usado ||
      summary?.nivel_actual ||
      summary?.ultimo_nivel_reportado ||
      summary?.nivel_estimado ||
      progression?.nivel_reportado ||
      fallback.level ||
      '',
    tecnica: [summary?.ultima_tecnica, structuredTechnique].filter(Boolean).join(' · '),
    actitud: summary?.ultima_actitud || '',
    autonomia: summary?.ultima_autonomia || profile?.autonomia_reciente || '',
    incidencia: summary?.ultima_incidencia || '',
    recomendacion: [summary?.ultima_recomendacion, technicalPriorities].filter(Boolean).join(' · '),
    remontes: Array.from(new Set([
      ...(Array.isArray(summary?.ultimos_remontes) ? summary.ultimos_remontes : []),
      ...(Array.isArray(profile?.remontes_recientes) ? profile.remontes_recientes : []),
    ].filter(Boolean))),
    ritmo: profile?.ritmo_tendencia || rhythm?.ritmo_tendencia || rhythm?.ritmo_ultimo || '',
    fuerzaNivel: profile?.fuerza_nivel || '',
    demandaAtencion: profile?.demanda_atencion || '',
    observacionOperativa: profile?.observacion_visible_entrenador || profile?.aviso_operativo || '',
    faseViraje: summary?.ultima_tecnica || '',
    progresionInicial: progression
      ? {
          autonomiaCinta: progression.autonomia_cinta || '',
          cunaFrenada: progression.cuna_frenada || '',
          giroInicial: progression.giro_inicial || '',
          dinamicaAutonoma: progression.dinamica_autonoma || '',
          ayudaCunero: progression.ayuda_cunero || '',
        }
      : undefined,
  };
}
