import React from 'react';
import { contarRepartoReportes, nombreCortoEntrenador } from './reportSplitLogic';
import { resumenDestinos, ultimoRepartoGrupo, type MensajeEnviado } from '../trainers/mensajesEntrenadorLogic';
import { cargarMensajesEnviados, enviarRepartoReportes } from '../../services/trainers/mensajesEntrenadorService';

// Reparto de reportes en pista (01/11): en un grupo con dos entrenadores, el
// coordinador elige qué entrenador hace el reporte de cada niño según cómo se
// hayan repartido en pista. Se guarda al pulsar (RPC
// cambiar_responsable_reporte_app) y la Vista entrenador de cada uno enseña
// solo los reportes de sus niños.
// 16/11: o «Que lo repartan ellos»: les llega un mensaje, cada uno marca sus
// niños y da OK una sola vez (MensajesEntrenador). Aquí se ve quién ha dado OK.

type GrupoReparto = {
  grupo_id?: string | null;
  entrenador_id?: string | null;
  entrenador?: string | null;
  entrenador_apoyo_id?: string | null;
  entrenador_apoyo?: string | null;
  entrenador_tercero_id?: string | null;
  entrenador_tercero?: string | null;
};

type FilaReparto = { alumno_id: string; alumno: string; entrenador_id: string | null };

type Props = {
  grupo: GrupoReparto;
  consultarSupabase: <T>(tabla: string, query: string) => Promise<T[]>;
  ejecutarFuncion: (nombre: string, body: object) => Promise<unknown>;
};

const pildora: React.CSSProperties = {
  minHeight: 30,
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 900,
  lineHeight: 1.1,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export function ReportSplitPanel({ grupo, consultarSupabase, ejecutarFuncion }: Props) {
  const grupoId = String(grupo.grupo_id || '');
  const principalId = String(grupo.entrenador_id || '');
  const apoyoId = String(grupo.entrenador_apoyo_id || '');
  const terceroId = String(grupo.entrenador_tercero_id || '');
  const [abierto, setAbierto] = React.useState(false);
  const [filas, setFilas] = React.useState<FilaReparto[] | null>(null);
  const [guardando, setGuardando] = React.useState('');
  const [error, setError] = React.useState('');
  const [reparto, setReparto] = React.useState<MensajeEnviado | null | undefined>(undefined);
  const [enviando, setEnviando] = React.useState(false);

  const cargar = React.useCallback(async () => {
    try {
      const datos = await consultarSupabase<FilaReparto>(
        'v_alumnos_reporte_entrenador_app_dos_entrenadores',
        `select=alumno_id,alumno,entrenador_id&grupo_id=eq.${grupoId}&order=alumno.asc`
      );
      const vistos = new Set<string>();
      setFilas(datos.filter((f) => (vistos.has(f.alumno_id) ? false : (vistos.add(f.alumno_id), true))));
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el reparto.');
    }
  }, [consultarSupabase, grupoId]);

  const cargarReparto = React.useCallback(async () => {
    try {
      setReparto(ultimoRepartoGrupo(await cargarMensajesEnviados(3), grupoId));
    } catch {
      setReparto(undefined); // sin la migración: no se ofrece
    }
  }, [grupoId]);

  React.useEffect(() => {
    if (abierto && filas === null) void cargar();
    if (abierto) void cargarReparto();
  }, [abierto, filas, cargar, cargarReparto]);

  // Mientras está abierto y el reparto sin cerrar, se actualiza solo cada 30 s.
  const repartoAbierto = Boolean(reparto && !reparto.cerrado_at);
  React.useEffect(() => {
    if (!abierto || !repartoAbierto) return;
    const t = window.setInterval(() => void Promise.all([cargar(), cargarReparto()]), 30000);
    return () => window.clearInterval(t);
  }, [abierto, repartoAbierto, cargar, cargarReparto]);

  if (!grupoId || !principalId || !apoyoId) return null;

  const entrenadores = [
    { id: principalId, nombre: nombreCortoEntrenador(grupo.entrenador) },
    { id: apoyoId, nombre: nombreCortoEntrenador(grupo.entrenador_apoyo) },
    // 06/11: con tercer entrenador, el reparto es entre los tres.
    ...(terceroId ? [{ id: terceroId, nombre: nombreCortoEntrenador(grupo.entrenador_tercero) }] : []),
  ];

  async function asignar(fila: FilaReparto, entrenadorId: string) {
    if (guardando || fila.entrenador_id === entrenadorId) return;
    setGuardando(fila.alumno_id);
    setError('');
    try {
      await ejecutarFuncion('cambiar_responsable_reporte_app', {
        p_grupo_id: grupoId,
        p_alumno_id: fila.alumno_id,
        p_entrenador_id: entrenadorId,
      });
      await cargar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar quién hace el reporte.');
    } finally {
      setGuardando('');
    }
  }

  const cuenta = filas ? contarRepartoReportes(filas, entrenadores.map((e) => e.id)) : null;

  async function pedirQueLoRepartan() {
    const nombres = entrenadores.map((e) => e.nombre).join(' y ');
    if (!window.confirm(`¿Mandar a ${nombres} que se repartan los reportes?\n\nCada uno marcará sus niños y dará OK una sola vez. Tú lo puedes seguir cambiando aquí.`)) return;
    setEnviando(true);
    setError('');
    try {
      await enviarRepartoReportes(grupoId);
      await cargarReparto();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo enviar.');
    } finally {
      setEnviando(false);
    }
  }

  return (
    <details
      open={abierto}
      onToggle={(e) => setAbierto((e.target as HTMLDetailsElement).open)}
      style={{ marginTop: 10, border: '1px solid #c7d2fe', borderRadius: 12, background: '#eef2ff', overflow: 'hidden' }}
    >
      <summary style={{ cursor: 'pointer', padding: '10px 12px', fontWeight: 900, color: '#312e81', fontSize: 13.5 }}>
        📝 Quién hace cada reporte
        {cuenta && (
          <span style={{ fontWeight: 700, color: '#4338ca' }}>
            {' · '}
            {entrenadores.map((e, i) => `${e.nombre} ${cuenta[i]}`).join(' · ')}
          </span>
        )}
      </summary>
      <div style={{ padding: '0 12px 12px', display: 'grid', gap: 8 }}>
        <p style={{ margin: 0, fontSize: 12, color: '#4338ca', lineHeight: 1.35 }}>
          Pulsa el entrenador que lleva a cada niño en pista. Se guarda al momento y cada uno verá solo sus reportes.
        </p>
        {reparto !== undefined && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', background: '#fff', borderRadius: 10, padding: '8px 10px' }}>
            <span style={{ flex: '1 1 180px', minWidth: 0, fontSize: 12.5, fontWeight: 800, color: '#312e81' }}>
              {reparto
                ? `📨 Enviado a las ${new Date(reparto.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })} · ${resumenDestinos(reparto)}`
                : '¿No sabes cómo se han repartido? Que lo marquen ellos.'}
            </span>
            {!(reparto && !reparto.cerrado_at) && (
              <button
                type="button"
                disabled={enviando}
                onClick={() => void pedirQueLoRepartan()}
                style={{ ...pildora, border: '1px solid #4338ca', background: '#4338ca', color: '#fff' }}
              >
                {enviando ? 'Enviando…' : reparto ? 'Volver a pedírselo' : '📨 Que lo repartan ellos'}
              </button>
            )}
            {reparto && !reparto.cerrado_at && (
              <button type="button" onClick={() => void Promise.all([cargar(), cargarReparto()])} style={{ ...pildora, border: '1px solid #c7d2fe', background: '#fff', color: '#3730a3' }}>
                Actualizar
              </button>
            )}
          </div>
        )}
        {error && <p style={{ margin: 0, fontSize: 12.5, color: '#b91c1c', fontWeight: 800 }}>{error}</p>}
        {filas === null && !error && <p style={{ margin: 0, fontSize: 12.5, color: '#475569' }}>Cargando…</p>}
        {filas?.length === 0 && <p style={{ margin: 0, fontSize: 12.5, color: '#475569' }}>No hay niños en este grupo.</p>}
        {filas?.map((fila) => (
          <div key={fila.alumno_id} style={{ display: 'grid', gap: 4, minWidth: 0 }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#172033', overflowWrap: 'anywhere' }}>{fila.alumno}</span>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {entrenadores.map((ent) => {
                const activo = fila.entrenador_id === ent.id;
                return (
                  <button
                    key={ent.id}
                    type="button"
                    disabled={Boolean(guardando)}
                    onClick={() => void asignar(fila, ent.id)}
                    aria-pressed={activo}
                    style={{
                      ...pildora,
                      border: activo ? '2px solid #4338ca' : '1px solid #c7d2fe',
                      background: activo ? '#4338ca' : '#ffffff',
                      color: activo ? '#ffffff' : '#3730a3',
                      opacity: guardando && guardando !== fila.alumno_id ? 0.6 : 1,
                    }}
                  >
                    {guardando === fila.alumno_id && !activo ? 'Guardando…' : `${activo ? '✓ ' : ''}${ent.nombre}`}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </details>
  );
}
