// Observación automática de un alumno en el bloque "Observaciones" del grupo
// (Baby / Trabajo en pista y Ocio) cuando existe un aviso de revisar nivel.
// Si ya tiene observaciones de sus reportes, se muestran y el aviso va al final.
// Si no hay observaciones, se mantiene la frase de siempre.

export const LEVEL_REVIEW_NOTICE = 'REVISAR NIVEL · validar en primera bajada';

export function studentObservationWithLevelReview(
  nombre: string,
  detalle: string,
  revisarNivel: boolean
): string {
  if (revisarNivel) {
    return detalle
      ? `${nombre}: ${detalle} · revisar nivel`
      : `${nombre}: ${LEVEL_REVIEW_NOTICE}`;
  }
  return `${nombre}: ${detalle || 'Nada relevante'}`;
}
