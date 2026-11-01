// Reparto de reportes en pista (01/11): lógica pura.

/** «ALFONSO JORDAN» → «Alfonso». */
export function nombreCortoEntrenador(nombre: string | null | undefined) {
  const primero = String(nombre || '').trim().split(/\s+/)[0] || 'Entrenador';
  return primero.charAt(0).toUpperCase() + primero.slice(1).toLowerCase();
}

/** Cuántos niños reporta cada entrenador (mismo orden que `entrenadorIds`). */
export function contarRepartoReportes(
  filas: { entrenador_id: string | null }[],
  entrenadorIds: string[]
) {
  return entrenadorIds.map((id) => filas.filter((f) => f.entrenador_id === id).length);
}
