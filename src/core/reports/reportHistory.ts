import type {
  EvaluacionTecnicaReporte,
  HistorialReporteAlumnoFichaApp,
} from './reportTypes';

export type ReportModality = 'BABY' | 'OCIO' | 'INTENSIVOS' | 'OTROS';
export type ReportHistoryFilter = 'TODOS' | Exclude<ReportModality, 'OTROS'>;

function withoutAccents(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
}

export function classifyReportModality(
  modality: string | null | undefined
): ReportModality {
  const normalized = withoutAccents(String(modality || ''));
  if (normalized.includes('OCIO')) return 'OCIO';
  if (normalized.includes('INTENS')) return 'INTENSIVOS';
  if (normalized.includes('BABY') || normalized.includes('MITICO')) return 'BABY';
  return 'OTROS';
}

export function sortReportHistory(
  reports: HistorialReporteAlumnoFichaApp[]
): HistorialReporteAlumnoFichaApp[] {
  return [...reports].sort((a, b) => {
    const byDate = String(b.fecha || '').localeCompare(String(a.fecha || ''));
    if (byDate !== 0) return byDate;
    return String(b.enviado_at || '').localeCompare(String(a.enviado_at || ''));
  });
}

export function filterReportHistory(
  reports: HistorialReporteAlumnoFichaApp[],
  filter: ReportHistoryFilter
): HistorialReporteAlumnoFichaApp[] {
  const sorted = sortReportHistory(reports);
  if (filter === 'TODOS') return sorted;
  return sorted.filter(
    (report) => classifyReportModality(report.modalidad) === filter
  );
}

export function reportHistoryCounts(
  reports: HistorialReporteAlumnoFichaApp[]
): Record<ReportHistoryFilter, number> {
  return {
    TODOS: reports.length,
    BABY: reports.filter(
      (report) => classifyReportModality(report.modalidad) === 'BABY'
    ).length,
    OCIO: reports.filter(
      (report) => classifyReportModality(report.modalidad) === 'OCIO'
    ).length,
    INTENSIVOS: reports.filter(
      (report) => classifyReportModality(report.modalidad) === 'INTENSIVOS'
    ).length,
  };
}

export function extractDailyWorkObjective(
  value: string | null | undefined
): string {
  const line = String(value || '')
    .split(/\r?\n/)
    .map((item) => item.trim())
    .find((item) => /^OBJETIVO\s*·/i.test(item));
  return line ? line.replace(/^OBJETIVO\s*·\s*/i, '').trim() : '';
}

export function uniqueReportValues(
  values: Array<string | null | undefined>,
  limit = 5
): string[] {
  return Array.from(
    new Set(values.map((value) => String(value || '').trim()).filter(Boolean))
  ).slice(0, limit);
}

export type FamilyReportStudent = {
  alumno: string;
  nivel_actual?: string | null;
  ultimo_nivel_reportado?: string | null;
  nivel_estimado?: string | null;
};

export type FamilyReportDependencies = {
  formatDate: (date: string) => string;
  summarizeTechnicalEvaluation: (
    evaluation: EvaluacionTecnicaReporte | null | undefined,
    level: string
  ) => string;
};

export function buildFamilyReportBase(
  student: FamilyReportStudent,
  inputReports: HistorialReporteAlumnoFichaApp[],
  dependencies: FamilyReportDependencies
): string {
  const reports = sortReportHistory(inputReports);
  const currentLevel =
    student.ultimo_nivel_reportado ||
    student.nivel_actual ||
    student.nivel_estimado ||
    'Sin nivel confirmado';

  if (reports.length === 0) {
    return [
      'BASE PARA INFORME DE FAMILIA',
      `Alumno: ${student.alumno}`,
      `Nivel actual de ficha: ${currentLevel}`,
      '',
      'Todavía no hay reportes técnicos detallados guardados para este alumno.',
      'No completar ni inventar información que no esté registrada.',
    ].join('\n');
  }

  const recent = reports[0];
  const first = reports[reports.length - 1];
  const improvements = uniqueReportValues(
    reports.flatMap((report) =>
      Array.isArray(report.mejoras_hoy) && report.mejoras_hoy.length
        ? report.mejoras_hoy
        : [report.mejora_hoy]
    ),
    8
  ).filter((value) => !/nada destacable|sesión de consolidación/i.test(value));
  const dailyWork = uniqueReportValues(
    reports.map((report) => extractDailyWorkObjective(report.trabajo_diario)),
    5
  );
  const observations = reports
    .filter((report) => String(report.observaciones_generales || '').trim())
    .slice(0, 5)
    .map(
      (report) =>
        `${dependencies.formatDate(report.fecha)} · ${String(
          report.observaciones_generales || ''
        ).trim()}`
    );
  const nextSteps = uniqueReportValues(
    reports.flatMap((report) =>
      Array.isArray(report.prioridades_proxima_sesion) &&
      report.prioridades_proxima_sesion.length
        ? report.prioridades_proxima_sesion
        : [report.recomendacion]
    ),
    5
  );
  const evaluations = reports
    .filter((report) => report.evaluacion_tecnica)
    .slice(0, 5)
    .map((report) => {
      const summary = dependencies.summarizeTechnicalEvaluation(
        report.evaluacion_tecnica,
        report.nivel_reportado || currentLevel
      );
      return summary
        ? `${dependencies.formatDate(report.fecha)} · ${summary}`
        : '';
    })
    .filter(Boolean);

  const evolution: string[] = [];
  if (first.nivel_reportado || recent.nivel_reportado) {
    evolution.push(
      `Nivel: ${first.nivel_reportado || currentLevel} → ${
        recent.nivel_reportado || currentLevel
      }`
    );
  }
  if (first.tecnica || recent.tecnica) {
    evolution.push(
      `Técnica: ${first.tecnica || 'sin dato inicial'} → ${
        recent.tecnica || 'sin dato reciente'
      }`
    );
  }
  if (first.autonomia || recent.autonomia) {
    evolution.push(
      `Autonomía: ${first.autonomia || 'sin dato inicial'} → ${
        recent.autonomia || 'sin dato reciente'
      }`
    );
  }

  return [
    'BASE PARA INFORME DE FAMILIA',
    `Alumno: ${student.alumno}`,
    `Nivel actual de ficha: ${currentLevel}`,
    `Periodo: ${dependencies.formatDate(first.fecha)} - ${dependencies.formatDate(
      recent.fecha
    )}`,
    `Reportes analizados: ${reports.length}`,
    '',
    'EVOLUCIÓN',
    ...(evolution.length
      ? evolution.map((line) => `• ${line}`)
      : ['• Sin comparación suficiente todavía.']),
    '',
    'MEJORAS DESTACADAS',
    ...(improvements.length
      ? improvements.map((line) => `• ${line}`)
      : ['• Sesiones centradas en consolidar lo trabajado.']),
    '',
    'EVOLUCIÓN POR COMPETENCIAS',
    ...(evaluations.length
      ? evaluations.map((line) => `• ${line}`)
      : ['• Los reportes históricos no contienen valoración por competencias.']),
    '',
    'TRABAJO REALIZADO',
    ...(dailyWork.length
      ? dailyWork.map((line) => `• ${line}`)
      : ['• Consultar el historial visual para el detalle por sesión.']),
    '',
    'OBSERVACIONES ÚTILES DE ENTRENADORES',
    ...(observations.length
      ? observations.map((line) => `• ${line}`)
      : ['• Los reportes anteriores no contienen observaciones escritas.']),
    '',
    'PRÓXIMOS PASOS',
    ...(nextSteps.length
      ? nextSteps.map((line) => `• ${line}`)
      : ['• Sin recomendación concreta registrada.']),
    '',
    'INSTRUCCIÓN PARA EL TEXTO FINAL',
    'Redactar para la familia un informe breve, positivo, claro y profesional. No inventar datos. Priorizar evolución, mejoras reales, observaciones útiles y próximos objetivos; no copiar una lista técnica completa de campos.',
  ].join('\n');
}

export function compactFamilyReportPreview(value: string): string {
  if (!value.trim() || /preparando|cargando/i.test(value)) return value;
  const lines = value.split(/\r?\n/).map((line) => line.trim());
  return [
    lines.find((line) => line.startsWith('Nivel actual')),
    lines.find((line) => line.startsWith('Periodo:')),
    lines.find((line) => line.startsWith('Reportes analizados:')),
    lines.find((line) => line.startsWith('• Nivel:')),
    lines.find((line) => line.startsWith('• Técnica:')),
  ]
    .filter((line): line is string => Boolean(line))
    .slice(0, 5)
    .join('\n');
}
