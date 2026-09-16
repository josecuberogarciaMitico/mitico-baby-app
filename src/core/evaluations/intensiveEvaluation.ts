import type { EvaluacionTecnicaReporte } from '../reports/reportTypes';
import type { ReporteDetalleIntensivoApp, ResumenFinalIntensivoApp } from './evaluationTypes';

export function buildIntensiveDiplomaBase(
  record: ResumenFinalIntensivoApp,
  reports: ReporteDetalleIntensivoApp[],
  dependencies: {
    formatDate: (date: string) => string;
    levelCodeById: (id: string | null) => string;
    summarizeTechnicalEvaluation: (
      evaluation: EvaluacionTecnicaReporte | null | undefined,
      level: string
    ) => string;
  }
) {
  const reportLines = reports.map((report) => {
    const skills = dependencies.summarizeTechnicalEvaluation(
      report.evaluacion_tecnica,
      report.nivel_reportado || ''
    );
    const improvements = Array.isArray(report.mejoras_hoy) ? report.mejoras_hoy.join(' · ') : '';
    const priorities = Array.isArray(report.prioridades_proxima_sesion)
      ? report.prioridades_proxima_sesion.join(' · ')
      : '';
    return [
      `Día ${report.numero_dia} · ${dependencies.formatDate(report.fecha)} · ${report.nombre_grupo}`,
      `Entrenador: ${report.entrenador || '-'}`,
      `Nivel: ${report.nivel_reportado || '-'}`,
      `Técnica: ${report.tecnica || '-'}${!report.observaciones_generales && report.tecnica_comentario ? ` (${report.tecnica_comentario})` : ''}`,
      ...(skills ? [`Competencias: ${skills}`] : []),
      ...(improvements ? [`Mejoras: ${improvements}`] : []),
      ...(priorities ? [`Próximas prioridades: ${priorities}`] : []),
      `Actitud: ${report.actitud || '-'}${!report.observaciones_generales && report.actitud_comentario ? ` (${report.actitud_comentario})` : ''}`,
      `Autonomía: ${report.autonomia_comentario || report.autonomia || '-'}`,
      `Incidencia: ${report.incidencia || '-'}${!report.observaciones_generales && report.incidencia_comentario ? ` (${report.incidencia_comentario})` : ''}`,
      `Recomendación: ${report.recomendacion_proxima_sesion || '-'}${!report.observaciones_generales && report.recomendacion_comentario ? ` (${report.recomendacion_comentario})` : ''}`,
      ...(report.observaciones_generales ? [`Observación: ${report.observaciones_generales}`] : []),
    ].join('\n');
  });

  return [
    `BASE DIPLOMA INTENSIVO · ${record.intensivo}`,
    `Alumno: ${record.alumno}`,
    `Asistencia: ${record.dias_presente || 0} presente · ${record.dias_ausente || 0} ausente · ${record.dias_pendiente_asistencia || 0} pendiente · ${record.total_dias_intensivo || 0} días totales`,
    `Reportes enviados: ${record.total_reportes || 0}`,
    `Niveles reportados: ${record.niveles_reportados || '-'}`,
    `Nivel más alto reportado: ${record.nivel_mas_alto_reportado || '-'}`,
    `Último nivel reportado: ${record.nivel_ultimo_reporte || '-'}`,
    `Nivel final propuesto: ${dependencies.levelCodeById(record.nivel_final_propuesto_id)}`,
    `Nivel final confirmado: ${dependencies.levelCodeById(record.nivel_final_confirmado_id)}`,
    `Técnicas trabajadas: ${record.tecnicas_reportadas || '-'}`,
    `Actitud global: ${record.actitudes_reportadas || '-'}`,
    `Autonomía: ${record.autonomias_reportadas || '-'}`,
    `Incidencias: ${record.incidencias_reportadas || '-'}`,
    `Recomendaciones de entrenadores: ${record.recomendaciones_reportadas || '-'}`,
    `Comentarios técnica: ${record.comentarios_tecnica || '-'}`,
    `Comentarios actitud: ${record.comentarios_actitud || '-'}`,
    `Comentarios autonomía: ${record.comentarios_autonomia || '-'}`,
    `Comentarios recomendación: ${record.comentarios_recomendacion || '-'}`,
    '',
    'REPORTES DÍA A DÍA',
    reportLines.length ? reportLines.join('\n\n---\n\n') : 'Sin reportes día a día todavía.',
    '',
    'INSTRUCCIÓN PARA CHATGPT: redactar un diploma/resumen para la familia en tono positivo, claro y profesional, sin inventar datos.',
  ].join('\n');
}
