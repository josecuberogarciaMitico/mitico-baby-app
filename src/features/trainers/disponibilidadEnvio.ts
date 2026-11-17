// Disponibilidad del entrenador (17/11/2026, decisión de Jose): ya no se envía
// turno a turno. El entrenador marca «Puedo» / «No puedo» en todos los turnos
// pendientes (se guarda como borrador en el móvil) y solo puede pulsar
// «Enviar disponibilidad» cuando no le queda ninguno sin responder.

export type RespuestaDisponibilidad = 'Disponible' | 'No puedo';
export type Borrador = Record<string, RespuestaDisponibilidad>;

type TurnoMin = { id: string; respuesta?: string | null };

export const esPendiente = (t: TurnoMin) => (t.respuesta || 'Pendiente') === 'Pendiente';

/** Cuántos pendientes hay, cuántos tienen ya respuesta en el borrador y si se puede enviar. */
export function estadoEnvio(turnos: TurnoMin[], borrador: Borrador) {
  const pendientes = turnos.filter(esPendiente);
  const marcados = pendientes.filter((t) => borrador[t.id] === 'Disponible' || borrador[t.id] === 'No puedo');
  return {
    total: turnos.length,
    pendientes: pendientes.length,
    marcados: marcados.length,
    faltan: pendientes.length - marcados.length,
    listo: pendientes.length > 0 && marcados.length === pendientes.length,
    puedo: marcados.filter((t) => borrador[t.id] === 'Disponible').length,
    noPuedo: marcados.filter((t) => borrador[t.id] === 'No puedo').length,
  };
}

/** Quita del borrador lo que ya no está pendiente (ya enviado o turnos que ya no existen). */
export function limpiarBorrador(turnos: TurnoMin[], borrador: Borrador): Borrador {
  const vivos = new Set(turnos.filter(esPendiente).map((t) => t.id));
  return Object.fromEntries(Object.entries(borrador).filter(([id]) => vivos.has(id)));
}

/**
 * Envía todas las respuestas, una a una y en orden. Si una falla se para y
 * devuelve cuántas se guardaron: lo no guardado sigue en el borrador.
 */
export async function enviarDisponibilidadCompleta<T extends TurnoMin>(
  respuestas: Array<{ turno: T; respuesta: RespuestaDisponibilidad }>,
  guardar: (turno: T, respuesta: RespuestaDisponibilidad) => Promise<unknown>
): Promise<{ ok: boolean; guardadas: string[]; error?: string }> {
  const guardadas: string[] = [];
  for (const { turno, respuesta } of respuestas) {
    try {
      await guardar(turno, respuesta);
      guardadas.push(turno.id);
    } catch (e) {
      return { ok: false, guardadas, error: e instanceof Error ? e.message : 'No se pudo enviar la disponibilidad.' };
    }
  }
  return { ok: true, guardadas };
}

const CLAVE = 'mitico_disponibilidad_borrador_v1';

export function leerBorrador(): Borrador {
  try {
    const v = JSON.parse(window.localStorage.getItem(CLAVE) || '{}');
    return v && typeof v === 'object' ? (v as Borrador) : {};
  } catch {
    return {};
  }
}

export function guardarBorrador(b: Borrador) {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(b));
  } catch {
    /* sin almacenamiento: el borrador vive mientras la pantalla esté abierta */
  }
}
