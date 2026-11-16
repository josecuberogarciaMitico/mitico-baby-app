import React, { useCallback, useEffect, useState } from 'react';
import { MensajesCoordinacion } from './MensajesCoordinacion';
import type { MensajeEnviado } from '../trainers/mensajesEntrenadorLogic';
import { cargarMensajesEnviados } from '../../services/trainers/mensajesEntrenadorService';

// 16/11: «Mensajes internos», apartado propio en el menú (columna Equipo), con
// el número de respuestas pendientes. Antes era una pastilla flotante y molestaba.

type Entrenador = { id?: string; entrenador_id?: string; nombre_completo?: string | null; activo?: boolean | null };

export function pendientesDeRespuesta(m: Pick<MensajeEnviado, 'tipo' | 'destinos' | 'cerrado_at'>) {
  if (m.tipo === 'reparto') return m.cerrado_at ? 0 : m.destinos.filter((d) => !d.ok_at).length;
  return m.destinos.filter((d) => !d.leido_at).length;
}

/** Número pequeño junto a «Mensajes internos» en el menú (nada si no hay pendientes). */
export function ContadorMensajes() {
  const [pendientes, setPendientes] = useState(0);
  const cargar = useCallback(async () => {
    try {
      const enviados = await cargarMensajesEnviados(7);
      setPendientes(enviados.reduce((n, m) => n + pendientesDeRespuesta(m), 0));
    } catch {
      setPendientes(0);
    }
  }, []);
  useEffect(() => {
    void cargar();
    const t = window.setInterval(() => void cargar(), 60000);
    return () => window.clearInterval(t);
  }, [cargar]);
  if (!pendientes) return null;
  return (
    <span
      aria-label={`${pendientes} sin responder`}
      style={{
        marginLeft: 6,
        verticalAlign: 'middle',
        minWidth: 22,
        height: 22,
        padding: '0 7px',
        borderRadius: 999,
        background: '#4338ca',
        color: '#fff',
        fontSize: 12,
        fontWeight: 900,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {pendientes}
    </span>
  );
}

export function PantallaMensajesInternos({ entrenadores }: { entrenadores: Entrenador[] }) {
  return (
    <section style={{ display: 'grid', gap: 14 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          borderRadius: 18,
          padding: 20,
          color: '#fff',
        }}
      >
        <p style={{ margin: 0, color: '#c7d2fe', fontSize: 11, fontWeight: 900, letterSpacing: '.12em' }}>EQUIPO</p>
        <h2 style={{ margin: '4px 0 0', fontSize: 26 }}>Mensajes internos</h2>
        <p style={{ margin: '6px 0 0', color: '#e0e7ff', lineHeight: 1.45 }}>
          Lo que has mandado a los entrenadores y quién lo ha leído o ha dado OK (últimos 7 días). Los repartos de
          reportes se piden desde Trabajo en pista, en cada grupo.
        </p>
      </div>
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 16, padding: 14 }}>
        <MensajesCoordinacion entrenadores={entrenadores} idsDelDia={[]} dias={7} abiertoInicial modoPanel escribirAbierto />
      </div>
    </section>
  );
}
