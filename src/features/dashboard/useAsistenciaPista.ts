import React from 'react';
import {
  claveAsistencia,
  estadoAlPulsar,
  mapaAsistencia,
  trozosIds,
  type EstadoAsistencia,
  type FilaAsistencia,
} from './asistenciaPistaLogic';

// Asistencia real de los grupos del día en Trabajo en pista (07/11).
// Lee grupo_alumnos (lo mismo que ve el entrenador) y marca con la misma
// función que usa el entrenador (marcar_asistencia_alumno_app).
// Se recarga sola cada minuto para ver lo que van marcando en pista.

type Consultar = <T>(tabla: string, query: string) => Promise<T[]>;
type Ejecutar = (nombre: string, body: object) => Promise<unknown>;

export function useAsistenciaPista(grupoIds: string[], consultarSupabase: Consultar, ejecutarFuncion: Ejecutar) {
  const [estados, setEstados] = React.useState<Map<string, EstadoAsistencia>>(new Map());
  const [guardando, setGuardando] = React.useState('');
  const [error, setError] = React.useState('');
  const [actualizadoAt, setActualizadoAt] = React.useState<Date | null>(null);
  const claveIds = [...new Set(grupoIds.filter(Boolean))].sort().join(',');
  const guardandoRef = React.useRef('');

  const cargar = React.useCallback(async () => {
    const ids = claveIds ? claveIds.split(',') : [];
    if (ids.length === 0) {
      setEstados(new Map());
      return;
    }
    try {
      const partes = await Promise.all(
        trozosIds(ids).map((trozo) =>
          consultarSupabase<FilaAsistencia>(
            'grupo_alumnos',
            `select=grupo_id,alumno_id,estado_asistencia&grupo_id=in.(${trozo.join(',')})`
          )
        )
      );
      // No pisar un cambio que se está guardando en este momento.
      if (guardandoRef.current) return;
      setEstados(mapaAsistencia(partes.flat()));
      setActualizadoAt(new Date());
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar la asistencia.');
    }
  }, [claveIds, consultarSupabase]);

  React.useEffect(() => {
    void cargar();
    const id = window.setInterval(() => {
      if (document.visibilityState === 'visible') void cargar();
    }, 60000);
    return () => window.clearInterval(id);
  }, [cargar]);

  const estadoDe = React.useCallback(
    (grupoId: string, alumnoId: string): EstadoAsistencia | null =>
      estados.get(claveAsistencia(grupoId, alumnoId)) ?? null,
    [estados]
  );

  async function marcar(grupoId: string, alumnoId: string, pulsado: EstadoAsistencia) {
    const clave = claveAsistencia(grupoId, alumnoId);
    if (guardandoRef.current) return;
    const anterior = estados.get(clave) ?? 'Pendiente';
    const nuevo = estadoAlPulsar(anterior, pulsado);
    guardandoRef.current = clave;
    setGuardando(clave);
    setEstados((m) => new Map(m).set(clave, nuevo));
    try {
      await ejecutarFuncion('marcar_asistencia_alumno_app', {
        p_grupo_id: grupoId,
        p_alumno_id: alumnoId,
        p_estado_asistencia: nuevo,
      });
      setError('');
    } catch (err) {
      setEstados((m) => new Map(m).set(clave, anterior));
      setError(err instanceof Error ? err.message : 'No se pudo guardar la asistencia.');
    } finally {
      guardandoRef.current = '';
      setGuardando('');
    }
  }

  return { estadoDe, marcar, guardando, error, actualizadoAt, recargar: cargar };
}
