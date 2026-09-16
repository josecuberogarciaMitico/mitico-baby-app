import type { EvaluationCut, EvaluacionAnualOcioApp } from './evaluationTypes';

export function requireEvaluationCut(value: unknown): EvaluationCut {
  const cut = String(value || '').trim().toUpperCase();
  if (cut === 'NAVIDAD' || cut === 'FINAL') return cut;
  throw new Error(`Corte de evaluación no válido: ${cut || '(vacío)'}.`);
}

export function normalizeAnnualOcioEvaluation(
  value: EvaluacionAnualOcioApp
): EvaluacionAnualOcioApp {
  return {
    ...value,
    entrenamientos_ocio: Number(value.entrenamientos_ocio || 0),
    sesiones_ocio_programadas: Number(value.sesiones_ocio_programadas || 0),
    asistencia_ocio_pct:
      value.asistencia_ocio_pct === null || value.asistencia_ocio_pct === undefined
        ? null
        : Number(value.asistencia_ocio_pct),
    reportes_ocio: Number(value.reportes_ocio || 0),
    remontes_iniciales: Array.isArray(value.remontes_iniciales)
      ? value.remontes_iniciales.filter(Boolean)
      : [],
    remontes_finales: Array.isArray(value.remontes_finales)
      ? value.remontes_finales.filter(Boolean)
      : [],
    remontes_navidad: Array.isArray(value.remontes_navidad)
      ? value.remontes_navidad.filter(Boolean)
      : [],
    navidad_guardada: Boolean(value.navidad_guardada),
  };
}
