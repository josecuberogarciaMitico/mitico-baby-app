// 15/11/2026 · Botón Presente / Ausente / Pendiente del entrenador.
// Antes cada toque guardaba, luego recargaba TODA la vista del entrenador
// (tres consultas pesadas) y mientras tanto ocultaba la lista con «Cargando
// vista entrenador...». Con la base de datos cargada eso tardaba segundos y
// parecía que el botón no respondía.
// Ahora: el botón cambia al momento, se guarda solo ese niño y la vista se
// refresca por detrás 1,5 s después del último toque. Si el guardado falla,
// el botón vuelve a como estaba y se enseña el error.

type Deps = {
  anterior: string;
  poner: (estado: string) => void;
  guardar: (estado: string) => Promise<unknown>;
  refrescar: () => Promise<void> | void;
  avisarError: (mensaje: string) => void;
};

const ESPERA_REFRESCO_MS = 1500;
const VIGENCIA_MARCA_MS = 15000;

let temporizador: ReturnType<typeof setTimeout> | undefined;
const marcas = new Map<string, { estado: string; en: number }>();
const clave = (grupoId: string, alumnoId: string) => `${grupoId}|${alumnoId}`;

export async function marcarAsistenciaRapida(grupoId: string, alumnoId: string, estado: string, d: Deps) {
  const k = clave(grupoId, alumnoId);
  marcas.set(k, { estado, en: Date.now() });
  d.poner(estado);
  try {
    await d.guardar(estado);
  } catch (e) {
    if (marcas.get(k)?.estado === estado) {
      marcas.delete(k);
      d.poner(d.anterior);
    }
    d.avisarError(e instanceof Error ? e.message : 'No se pudo guardar la asistencia.');
    return;
  }
  if (temporizador) clearTimeout(temporizador);
  temporizador = setTimeout(() => void d.refrescar(), ESPERA_REFRESCO_MS);
}

/**
 * Al refrescar la vista, una lectura que salió antes del último toque podría
 * traer el estado viejo: se respetan las marcas de los últimos segundos.
 */
export function aplicarMarcasRecientes<T extends { grupo_id: string; alumno_id: string; estado_asistencia: string }>(
  filas: T[],
  ahora = Date.now()
): T[] {
  for (const [k, m] of marcas) if (ahora - m.en > VIGENCIA_MARCA_MS) marcas.delete(k);
  if (marcas.size === 0) return filas;
  return filas.map((f) => {
    const m = marcas.get(clave(f.grupo_id, f.alumno_id));
    return m && m.estado !== f.estado_asistencia ? { ...f, estado_asistencia: m.estado } : f;
  });
}
