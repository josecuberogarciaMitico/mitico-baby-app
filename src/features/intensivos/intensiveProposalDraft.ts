// Intensivos (29/10): la propuesta de grupos (antes de «Confirmar») se guarda
// en este navegador por intensivo, para que no se pierda al recargar la app o
// al cerrar y abrir el panel. Es solo una comodidad: lo que vale son los grupos
// confirmados en Supabase. Caduca a los 7 días y se borra al confirmar o
// descartar (cuando la propuesta queda vacía).

export type BorradorPropuestaIntensivo<R> = {
  recomendaciones: R[];
  destino: Record<string, string>;
  trabajo: Record<string, string>;
  observaciones: Record<string, string>;
  extra: Record<string, string[]>;
  guardado: number;
};

const CADUCIDAD_MS = 7 * 24 * 60 * 60 * 1000;
const clave = (intensivoId: string) => `mitico_propuesta_intensivo_v1:${intensivoId}`;

export function guardarBorradorPropuestaIntensivo<R extends { intensivo_dia_id: string }>(
  intensivoId: string,
  diasIds: string[],
  datos: Omit<BorradorPropuestaIntensivo<R>, 'guardado'>,
  ahora = Date.now()
) {
  try {
    const ids = new Set(diasIds);
    const recomendaciones = datos.recomendaciones.filter((r) => ids.has(r.intensivo_dia_id));
    if (!intensivoId || recomendaciones.length === 0) {
      window.localStorage.removeItem(clave(intensivoId));
      return;
    }
    window.localStorage.setItem(
      clave(intensivoId),
      JSON.stringify({ ...datos, recomendaciones, guardado: ahora })
    );
  } catch {
    // Sin almacenamiento (modo privado, etc.): la propuesta vive solo en pantalla.
  }
}

export function leerBorradorPropuestaIntensivo<R>(
  intensivoId: string,
  ahora = Date.now()
): BorradorPropuestaIntensivo<R> | null {
  try {
    const texto = window.localStorage.getItem(clave(intensivoId));
    if (!texto) return null;
    const datos = JSON.parse(texto) as BorradorPropuestaIntensivo<R>;
    if (!Array.isArray(datos?.recomendaciones) || !datos.recomendaciones.length) return null;
    if (!Number.isFinite(datos.guardado) || ahora - datos.guardado > CADUCIDAD_MS) {
      window.localStorage.removeItem(clave(intensivoId));
      return null;
    }
    return {
      recomendaciones: datos.recomendaciones,
      destino: datos.destino || {},
      trabajo: datos.trabajo || {},
      observaciones: datos.observaciones || {},
      extra: datos.extra || {},
      guardado: datos.guardado,
    };
  } catch {
    return null;
  }
}
