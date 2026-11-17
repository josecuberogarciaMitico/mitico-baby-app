import React from 'react';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../../services/auth/authService';
import { createSupabaseRestClient } from '../../services/supabase/restClient';
import {
  diaMadrid,
  llego,
  mediaPorEntrenador,
  NOMBRE_TIPO,
  resumenPorEntrenador,
  type FilaNotificacion,
  type ResumenEntrenador,
} from './notificacionesLogic';

// 17/11/2026 · Lo que ha recibido cada entrenador en el móvil (pestaña de
// «Mensajes internos»), con la regla de avisos explicada.
// Usa notificaciones_entrenadores_app (migración 20261117_notificaciones_reglas).

const api = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

const ESTADO: Record<string, string> = {
  enviada: 'Le llegó',
  sin_suscripcion: 'No tiene avisos activados',
  fallida: 'No se pudo enviar',
  reservada: 'Enviándose',
};

function horaCorta(iso: string) {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString('es-ES', { timeZone: 'Europe/Madrid', weekday: 'short', day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function Tarjeta({ r }: { r: ResumenEntrenador; key?: string }) {
  const muchos = r.maxDia >= 3;
  return (
    <details style={{ borderRadius: 14, background: '#fff', border: `1px solid ${muchos ? '#fca5a5' : '#e2e8f0'}`, overflow: 'hidden' }}>
      <summary style={{ cursor: 'pointer', padding: '10px 12px', display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <strong style={{ flex: '1 1 160px', minWidth: 0, overflowWrap: 'anywhere' }}>{r.entrenador}</strong>
        <span style={{ fontWeight: 900, color: '#0f172a' }}>
          {r.total} {r.total === 1 ? 'aviso' : 'avisos'}
        </span>
        {r.maxDia > 1 && (
          <span style={{ fontSize: 12, fontWeight: 800, color: muchos ? '#b91c1c' : '#64748b' }}>
            máx. {r.maxDia} el {r.diaMax.slice(8, 10)}/{r.diaMax.slice(5, 7)}
          </span>
        )}
        {r.sinMovil > 0 && <span style={{ fontSize: 12, fontWeight: 800, color: '#b45309' }}>· sin avisos activados</span>}
      </summary>
      <div style={{ padding: '0 12px 10px', display: 'grid', gap: 6 }}>
        {r.filas.map((f, i) => (
          <div key={`${f.creada}-${i}`} style={{ padding: '6px 8px', borderRadius: 10, background: llego(f) ? '#f8fafc' : '#fff7ed', display: 'grid', gap: 2 }}>
            <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>
              {horaCorta(f.creada)} · {NOMBRE_TIPO[f.tipo] || f.tipo} · {ESTADO[f.estado] || f.estado}
            </span>
            <span style={{ fontSize: 13.5, overflowWrap: 'anywhere' }}>
              <b>{f.titulo}</b> {f.cuerpo}
            </span>
          </div>
        ))}
      </div>
    </details>
  );
}

export function NotificacionesEntrenadores() {
  const [dias, setDias] = React.useState(7);
  const [filas, setFilas] = React.useState<FilaNotificacion[] | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let vivo = true;
    setFilas(null);
    setError('');
    api
      .rpcRows<FilaNotificacion>('notificaciones_entrenadores_app', { p_dias: dias })
      .then((r) => vivo && setFilas(r || []))
      .catch((e) => vivo && setError(e instanceof Error ? e.message : 'No se pudieron cargar las notificaciones.'));
    return () => {
      vivo = false;
    };
  }, [dias]);

  const lista = React.useMemo(() => (filas ? resumenPorEntrenador(filas) : []), [filas]);
  const hoy = diaMadrid(new Date().toISOString());
  const hoyTotal = (filas || []).filter((f) => llego(f) && diaMadrid(f.creada) === hoy).length;

  return (
    <section style={{ display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {[7, 14, 28].map((d) => (
          <button
            key={d}
            type="button"
            onClick={() => setDias(d)}
            style={{
              minHeight: 36,
              padding: '6px 12px',
              borderRadius: 999,
              border: dias === d ? '1px solid #312e81' : '1px solid #c7d2fe',
              background: dias === d ? '#312e81' : '#fff',
              color: dias === d ? '#fff' : '#312e81',
              fontWeight: 800,
              cursor: 'pointer',
            }}
          >
            {d} días
          </button>
        ))}
        {filas && (
          <span style={{ fontSize: 13, color: '#475569', fontWeight: 700 }}>
            Media: {String(mediaPorEntrenador(lista)).replace('.', ',')} avisos por entrenador · hoy: {hoyTotal}
          </span>
        )}
      </div>

      <details style={{ padding: 12, borderRadius: 14, background: '#eef2ff', border: '1px solid #c7d2fe', fontSize: 13, color: '#312e81', lineHeight: 1.45 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 900 }}>La regla de avisos</summary>
        <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
          <li>
            <b>Recordatorios: uno al día como máximo</b>, a las 10:00, con todo junto (reportes de ayer y anteayer, confirmar grupos de hoy y mañana,
            disponibilidad que cierra hoy o mañana). Si ese día ya le ha llegado otro aviso, no se manda.
          </li>
          <li>Recordatorios solo de 10:00 a 21:00.</li>
          <li>Lo que sale de una acción tuya (publicar la disponibilidad, cerrar la semana, grupo nuevo, cambiado o retirado) llega en el momento.</li>
          <li>«Disponibilidad recibida» ya no se manda: lo ve en la app.</li>
        </ul>
      </details>

      {error && <p style={{ margin: 0, color: '#b91c1c', fontWeight: 800 }}>{error}</p>}
      {!error && filas === null && <p style={{ margin: 0, color: '#475569' }}>Cargando…</p>}
      {filas && lista.length === 0 && <p style={{ margin: 0, color: '#475569' }}>No ha salido ningún aviso en estos días.</p>}
      {lista.map((r) => (
        <Tarjeta key={r.entrenadorId} r={r} />
      ))}
    </section>
  );
}
