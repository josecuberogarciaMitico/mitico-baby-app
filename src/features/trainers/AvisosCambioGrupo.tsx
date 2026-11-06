import React, { useEffect, useState } from 'react';
import { agruparAvisos, type AvisoCambioGrupo } from './avisosCambioGrupoLogic';
import {
  cargarAvisosCambioPendientesPorEntrenador,
  cargarMisAvisosCambioGrupo,
  marcarAvisosCambioGrupoVistos,
} from '../../services/trainers/avisosCambioGrupoService';

// Avisos de cambios en grupos publicados (06/11). Sin push: el entrenador los
// ve al abrir su app hasta que pulsa «Entendido». Si la función aún no existe
// en Supabase (o falla), no se enseña nada.

export function AvisosCambioGrupoEntrenador({ onVistos }: { onVistos?: () => void }) {
  const [avisos, setAvisos] = useState<AvisoCambioGrupo[]>([]);
  const [cargadoAt, setCargadoAt] = useState('');
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    let vivo = true;
    const hasta = new Date().toISOString();
    cargarMisAvisosCambioGrupo()
      .then((filas) => {
        if (!vivo) return;
        setAvisos(Array.isArray(filas) ? filas : []);
        setCargadoAt(hasta);
      })
      .catch(() => vivo && setAvisos([]));
    return () => {
      vivo = false;
    };
  }, []);

  if (!avisos.length) return null;
  const bloques = agruparAvisos(avisos);

  return (
    <article
      role="status"
      style={{
        padding: 14,
        borderRadius: 16,
        border: '1px solid #fcd34d',
        background: 'linear-gradient(135deg, #fffbeb, #ffffff)',
        color: '#78350f',
        display: 'grid',
        gap: 10,
        boxShadow: '0 8px 22px rgba(217,119,6,.10)',
      }}
    >
      <strong style={{ fontSize: 15 }}>🔔 Cambios en tus grupos desde la última vez</strong>
      {bloques.map((b) => (
        <div key={b.clave} style={{ background: '#fff', border: '1px solid #fde68a', borderRadius: 12, padding: '8px 10px' }}>
          <div style={{ fontWeight: 800, color: '#0f172a', fontSize: 13.5, overflowWrap: 'anywhere' }}>{b.titulo}</div>
          <ul style={{ margin: '4px 0 0', paddingLeft: 18, color: '#334155', fontSize: 13 }}>
            {b.lineas.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        </div>
      ))}
      <button
        type="button"
        disabled={guardando}
        onClick={async () => {
          setGuardando(true);
          try {
            await marcarAvisosCambioGrupoVistos(cargadoAt || new Date().toISOString());
            setAvisos([]);
            onVistos?.();
          } catch {
            // Si falla, se queda visible y puede volver a intentarlo.
          } finally {
            setGuardando(false);
          }
        }}
        style={{
          justifySelf: 'start',
          minHeight: 40,
          padding: '8px 18px',
          borderRadius: 12,
          border: '1px solid #d97706',
          background: '#d97706',
          color: '#fff',
          fontWeight: 800,
          cursor: 'pointer',
        }}
      >
        {guardando ? 'Guardando…' : 'Entendido'}
      </button>
    </article>
  );
}

/** Coordinación: cuántos cambios sin ver tiene cada entrenador (una sola carga). */
export function useAvisosCambioPendientes(activo: boolean) {
  const [mapa, setMapa] = useState<Record<string, number>>({});
  useEffect(() => {
    if (!activo) return;
    let vivo = true;
    cargarAvisosCambioPendientesPorEntrenador()
      .then((filas) => {
        if (!vivo) return;
        setMapa(Object.fromEntries((filas || []).map((f) => [String(f.entrenador_id), Number(f.pendientes || 0)])));
      })
      .catch(() => vivo && setMapa({}));
    return () => {
      vivo = false;
    };
  }, [activo]);
  return mapa;
}

export function ChipAvisosCambio({ pendientes }: { pendientes: number | undefined }) {
  if (!pendientes) return null;
  return (
    <span
      title="Cambios en sus grupos publicados que todavía no ha visto en su app"
      style={{
        display: 'inline-block',
        marginTop: 4,
        padding: '2px 8px',
        borderRadius: 999,
        background: '#fef3c7',
        color: '#92400e',
        fontSize: 12,
        fontWeight: 800,
      }}
    >
      🔔 {pendientes} {pendientes === 1 ? 'cambio sin ver' : 'cambios sin ver'}
    </span>
  );
}
