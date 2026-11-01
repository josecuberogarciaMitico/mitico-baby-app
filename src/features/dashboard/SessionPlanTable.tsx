import React from 'react';
import { createPortal } from 'react-dom';
import { cargarPlanSesion } from '../../services/reports/coordinationReportsService';
import { filasPlanSesion, tituloSesion, type FilaPlan } from './sessionPlanLogic';

// Resumen de sesión (01/11): ventana con una tabla de todos los grupos de un
// turno (fecha + hora) y su objetivo, estado y ejercicios del trabajo diario.
// Se abre desde el aviso de Paco (45 min antes) o desde el Resumen del día.
// Solo lee: los datos se cargan al abrir, así siempre está al día.

const COLOR_ESTADO: Record<string, { bg: string; fg: string }> = {
  PROGRESAR: { bg: '#dcfce7', fg: '#166534' },
  RETAR: { bg: '#fef3c7', fg: '#92400e' },
  CONSOLIDAR: { bg: '#dbeafe', fg: '#1e40af' },
};

const celda: React.CSSProperties = {
  padding: '8px 10px',
  borderBottom: '1px solid #e2e8f0',
  verticalAlign: 'top',
  fontSize: 12.5,
  lineHeight: 1.35,
  color: '#172033',
  textAlign: 'left',
};

const cabecera: React.CSSProperties = {
  ...celda,
  position: 'sticky',
  top: 0,
  background: '#0f172a',
  color: '#ffffff',
  fontWeight: 900,
  fontSize: 12,
  zIndex: 2,
  whiteSpace: 'nowrap',
};

function primerNombre(nombre: string | null) {
  const p = String(nombre || '').trim().split(/\s+/)[0] || '';
  return p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : '';
}

export function SessionPlanModal({ fecha, hora, onClose }: { fecha: string; hora: string; onClose: () => void }) {
  const [filas, setFilas] = React.useState<FilaPlan[] | null>(null);
  const [error, setError] = React.useState('');

  React.useEffect(() => {
    let cancelado = false;
    setFilas(null);
    setError('');
    cargarPlanSesion(fecha, hora)
      .then(({ sesiones, grupos }) => {
        if (!cancelado) setFilas(filasPlanSesion(sesiones, grupos));
      })
      .catch((err) => {
        if (!cancelado) setError(err instanceof Error ? err.message : 'No se pudo cargar la sesión.');
      });
    return () => {
      cancelado = true;
    };
  }, [fecha, hora]);

  React.useEffect(() => {
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [onClose]);

  const ninos = (filas || []).reduce((t, f) => t + Number(f.total_alumnos || 0), 0);
  // En el móvil, una tarjeta por grupo (sin desplazar de lado); en pantalla ancha, tabla.
  const [estrecho, setEstrecho] = React.useState(() => typeof window !== 'undefined' && window.innerWidth < 760);
  React.useEffect(() => {
    const alCambiar = () => setEstrecho(window.innerWidth < 760);
    window.addEventListener('resize', alCambiar);
    return () => window.removeEventListener('resize', alCambiar);
  }, []);

  const ventana = (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Grupos y objetivos · ${tituloSesion(fecha, hora)}`}
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 10050,
        background: 'rgba(15,23,42,.55)',
        display: 'flex',
        alignItems: 'stretch',
        justifyContent: 'center',
        padding: 'max(10px, env(safe-area-inset-top)) 10px max(10px, env(safe-area-inset-bottom))',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: '100%',
          maxWidth: 1180,
          background: '#ffffff',
          borderRadius: 18,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 60px rgba(15,23,42,.35)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '12px 14px',
            background: 'linear-gradient(135deg,#06283b,#0f5c4d)',
            color: '#ffffff',
          }}
        >
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: '.06em', opacity: 0.8 }}>GRUPOS Y OBJETIVOS</div>
            <div style={{ fontSize: 17, fontWeight: 900, overflowWrap: 'anywhere' }}>{tituloSesion(fecha, hora)}</div>
            {filas && (
              <div style={{ fontSize: 12, opacity: 0.85 }}>
                {filas.length} grupo{filas.length === 1 ? '' : 's'} · {ninos} niño{ninos === 1 ? '' : 's'}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              minWidth: 44,
              minHeight: 44,
              borderRadius: 12,
              border: '1px solid rgba(255,255,255,.35)',
              background: 'rgba(255,255,255,.12)',
              color: '#ffffff',
              fontSize: 20,
              fontWeight: 900,
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>

        <div style={{ flex: 1, overflow: 'auto', WebkitOverflowScrolling: 'touch' }}>
          {error && <p style={{ margin: 16, color: '#b91c1c', fontWeight: 800 }}>{error}</p>}
          {!error && filas === null && <p style={{ margin: 16, color: '#475569' }}>Cargando grupos…</p>}
          {filas?.length === 0 && <p style={{ margin: 16, color: '#475569' }}>No hay grupos en este turno.</p>}
          {filas && filas.length > 0 && estrecho && (
            <div style={{ display: 'grid', gap: 10, padding: 10 }}>
              {filas.map((f) => <TarjetaPlan key={f.grupo_id} f={f} />)}
            </div>
          )}
          {filas && filas.length > 0 && !estrecho && (
            <table style={{ borderCollapse: 'separate', borderSpacing: 0, width: '100%', minWidth: 860 }}>
              <thead>
                <tr>
                  <th style={{ ...cabecera, left: 0, zIndex: 3, minWidth: 150 }}>Grupo</th>
                  <th style={{ ...cabecera, minWidth: 110 }}>Entrenador</th>
                  <th style={{ ...cabecera, minWidth: 250 }}>Objetivo</th>
                  <th style={{ ...cabecera, minWidth: 150 }}>Estado</th>
                  <th style={{ ...cabecera, minWidth: 220 }}>Trabajo</th>
                </tr>
              </thead>
              <tbody>
                {filas.map((f, i) => {
                  const color = COLOR_ESTADO[f.trabajo.estado] || { bg: '#f1f5f9', fg: '#334155' };
                  const fondo = i % 2 ? '#f8fafc' : '#ffffff';
                  return (
                    <tr key={f.grupo_id} style={{ background: fondo }}>
                      <td style={{ ...celda, position: 'sticky', left: 0, background: fondo, zIndex: 1, boxShadow: '1px 0 0 #e2e8f0' }}>
                        <div style={{ fontSize: 10.5, fontWeight: 900, color: '#0f766e', textTransform: 'uppercase' }}>{f.modalidad}</div>
                        <div style={{ fontWeight: 900, overflowWrap: 'anywhere' }}>{f.nombre_grupo || 'Grupo'}</div>
                        <div style={{ color: '#475569', fontWeight: 700 }}>
                          {f.nivel_grupo || '—'} · {Number(f.total_alumnos || 0)} niños
                        </div>
                        <div style={{ color: '#64748b', fontSize: 11.5 }}>
                          {f.punto_encuentro ? `Punto ${f.punto_encuentro}` : 'Sin punto'}
                          {f.pista ? ` · ${f.pista}` : ''}
                          {f.publicado === false ? ' · sin publicar' : ''}
                        </div>
                      </td>
                      <td style={{ ...celda, fontWeight: 800 }}>
                        {primerNombre(f.entrenador) || <span style={{ color: '#b45309' }}>Sin entrenador</span>}
                        {f.entrenador_apoyo && (
                          <div style={{ color: '#475569', fontWeight: 700 }}>+ {primerNombre(f.entrenador_apoyo)}</div>
                        )}
                      </td>
                      <td style={celda}>{f.trabajo.objetivo || <span style={{ color: '#94a3b8' }}>Sin trabajo diario</span>}</td>
                      <td style={celda}>
                        {f.trabajo.estado && (
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '2px 8px',
                              borderRadius: 999,
                              background: color.bg,
                              color: color.fg,
                              fontWeight: 900,
                              fontSize: 11,
                              marginBottom: 4,
                            }}
                          >
                            {f.trabajo.estado}
                          </span>
                        )}
                        <div style={{ color: '#475569' }}>{f.trabajo.estadoDetalle}</div>
                      </td>
                      <td style={celda}>
                        {f.trabajo.ejercicios.length ? (
                          <ul style={{ margin: 0, paddingLeft: 16 }}>
                            {f.trabajo.ejercicios.map((e) => (
                              <li key={e}>{e}</li>
                            ))}
                          </ul>
                        ) : (
                          <span style={{ color: '#94a3b8' }}>—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
  return typeof document !== 'undefined' ? createPortal(ventana, document.body) : ventana;
}

function EstadoChip({ estado }: { estado: string }) {
  if (!estado) return null;
  const color = COLOR_ESTADO[estado] || { bg: '#f1f5f9', fg: '#334155' };
  return (
    <span style={{ display: 'inline-block', padding: '2px 8px', borderRadius: 999, background: color.bg, color: color.fg, fontWeight: 900, fontSize: 11 }}>
      {estado}
    </span>
  );
}

/** Un grupo en formato tarjeta (móvil). */
function TarjetaPlan({ f }: { f: FilaPlan }) {
  return (
    <article style={{ border: '1px solid #e2e8f0', borderRadius: 14, padding: 12, display: 'grid', gap: 6, background: '#ffffff', minWidth: 0 }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'baseline', flexWrap: 'wrap' }}>
        <span style={{ fontSize: 10.5, fontWeight: 900, color: '#0f766e', textTransform: 'uppercase' }}>{f.modalidad}</span>
        <strong style={{ fontSize: 14.5, color: '#172033', overflowWrap: 'anywhere' }}>{f.nombre_grupo || 'Grupo'}</strong>
        <EstadoChip estado={f.trabajo.estado} />
      </div>
      <div style={{ fontSize: 12.5, color: '#475569', fontWeight: 700 }}>
        {f.nivel_grupo || '—'} · {Number(f.total_alumnos || 0)} niños · {primerNombre(f.entrenador) || 'Sin entrenador'}
        {f.entrenador_apoyo ? ` + ${primerNombre(f.entrenador_apoyo)}` : ''}
        {f.punto_encuentro ? ` · Punto ${f.punto_encuentro}` : ''}
        {f.publicado === false ? ' · sin publicar' : ''}
      </div>
      <div style={{ fontSize: 13, color: '#172033', lineHeight: 1.4 }}>
        <strong style={{ color: '#0f766e' }}>Objetivo:</strong>{' '}
        {f.trabajo.objetivo || <span style={{ color: '#94a3b8' }}>sin trabajo diario</span>}
      </div>
      {f.trabajo.estadoDetalle && <div style={{ fontSize: 12, color: '#475569', lineHeight: 1.35 }}>{f.trabajo.estadoDetalle}</div>}
      {f.trabajo.ejercicios.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12.5, color: '#334155', lineHeight: 1.4 }}>
          {f.trabajo.ejercicios.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}
    </article>
  );
}

/** Botón que abre la tabla de un turno. */
export function SessionPlanButton({ fecha, hora, style }: { fecha: string; hora: string; style?: React.CSSProperties }) {
  const [abierto, setAbierto] = React.useState(false);
  if (!fecha || !hora) return null;
  return (
    <>
      <button
        type="button"
        onClick={() => setAbierto(true)}
        style={{
          minHeight: 40,
          padding: '8px 14px',
          borderRadius: 12,
          border: '1px solid #99f6e4',
          background: '#f0fdfa',
          color: '#0f766e',
          fontWeight: 900,
          fontSize: 13.5,
          cursor: 'pointer',
          ...style,
        }}
      >
        📋 Grupos y objetivos
      </button>
      {abierto && <SessionPlanModal fecha={fecha} hora={hora} onClose={() => setAbierto(false)} />}
    </>
  );
}
