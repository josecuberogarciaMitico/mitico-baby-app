import React, { useCallback, useEffect, useState } from 'react';
import {
  agruparCancelados,
  canceladosPendientes,
  etiquetaTurno,
  textoCancelo,
  textoResumenCancelados,
  type CanceladoAimHarder,
} from './canceladosAimHarderLogic';
import {
  cargarCanceladosAimHarder,
  dejarCanceladoAimHarder,
  quitarCanceladoAimHarder,
} from '../../services/aimharder/canceladosAimHarderService';

// Cancelados en AimHarder (03/11): aviso en la Agenda con los niños que han
// cancelado en AimHarder y siguen en una sesión (y quizá en un grupo) de la
// app. «Quitar» los saca de la sesión y del grupo; «Dejar» lo mantiene y deja
// de avisar. Si la función aún no existe en Supabase, no enseña nada.

type Props = {
  hoyIso: string;
  soloLectura?: boolean;
  onCambios: () => Promise<void> | void;
};

const boton: React.CSSProperties = {
  minHeight: 32,
  padding: '6px 10px',
  borderRadius: 9,
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

export function CanceladosAimHarderAviso({ hoyIso, soloLectura, onCambios }: Props) {
  const [filas, setFilas] = useState<CanceladoAimHarder[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setFilas(canceladosPendientes(await cargarCanceladosAimHarder(hoyIso), hoyIso));
    } catch {
      // Sin la función en Supabase (o sin permiso) el aviso no aparece.
      setFilas([]);
    }
  }, [hoyIso]);

  useEffect(() => {
    void cargar();
    const t = window.setInterval(() => void cargar(), 5 * 60000);
    const alVolver = () => document.visibilityState === 'visible' && void cargar();
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [cargar]);

  if (!filas.length && !mensaje) return null;

  const turnos = agruparCancelados(filas);
  const quitables = filas.filter((f) => !f.protegido);

  async function quitar(lista: CanceladoAimHarder[]) {
    const fallos: string[] = [];
    const hechos: string[] = [];
    for (const f of lista) {
      setOcupado(f.sesion_alumno_id);
      try {
        await quitarCanceladoAimHarder(f.sesion_alumno_id);
        hechos.push(f.alumno);
      } catch (e) {
        fallos.push(`${f.alumno}: ${e instanceof Error ? e.message : 'no se pudo quitar'}`);
      }
    }
    setOcupado(null);
    setMensaje(
      [
        hechos.length ? `Quitado${hechos.length === 1 ? '' : 's'}: ${hechos.join(', ')}.` : '',
        fallos.length ? `No se pudo: ${fallos.join(' · ')}` : '',
      ]
        .filter(Boolean)
        .join('\n')
    );
    await cargar();
    await onCambios();
  }

  async function dejar(f: CanceladoAimHarder) {
    setOcupado(f.sesion_alumno_id);
    try {
      await dejarCanceladoAimHarder(f.sesion_id, f.alumno_id);
      setMensaje(`${f.alumno} se queda en la sesión; no volveré a avisar de él en este turno.`);
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo guardar.');
    }
    setOcupado(null);
    await cargar();
  }

  return (
    <div
      style={{
        padding: '10px 12px',
        borderRadius: 12,
        background: '#fef2f2',
        border: '1px solid #fca5a5',
        color: '#7f1d1d',
        fontSize: 13,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ flex: '1 1 200px', minWidth: 0 }}>
          {filas.length ? `⚠️ ${textoResumenCancelados(filas.length)}` : '✓ Ya no queda nadie cancelado en AimHarder'}
        </strong>
        {filas.length > 0 && (
          <button type="button" style={boton} onClick={() => setAbierto((x) => !x)}>
            {abierto ? 'Ocultar' : 'Ver y quitar'}
          </button>
        )}
      </div>

      {abierto && filas.length > 0 && (
        <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
          {turnos.map((t) => (
            <div key={t.clave} style={{ background: '#fff', borderRadius: 10, padding: '8px 10px', border: '1px solid #fecaca' }}>
              <strong style={{ display: 'block', marginBottom: 4, color: '#0f172a' }}>
                {etiquetaTurno(t.fecha, t.hora, t.modalidad)}
              </strong>
              {t.filas.map((f) => (
                <div
                  key={f.sesion_alumno_id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    flexWrap: 'wrap',
                    padding: '6px 0',
                    borderTop: '1px solid #f1f5f9',
                  }}
                >
                  <div style={{ flex: '1 1 180px', minWidth: 0, color: '#0f172a' }}>
                    <div style={{ fontWeight: 700, overflowWrap: 'anywhere' }}>{f.alumno}</div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {f.grupo ? `${f.grupo}${f.grupo_publicado ? ' (publicado)' : ''}` : 'Sin grupo'} · {textoCancelo(f.cancelada_at)}
                      {f.protegido ? ' · tiene asistencia o reporte: no se puede quitar' : ''}
                    </div>
                  </div>
                  {!soloLectura && (
                    <div style={{ display: 'flex', gap: 6 }}>
                      {!f.protegido && (
                        <button
                          type="button"
                          style={{ ...boton, background: '#dc2626', borderColor: '#dc2626', color: '#fff' }}
                          disabled={Boolean(ocupado)}
                          onClick={() => void quitar([f])}
                        >
                          {ocupado === f.sesion_alumno_id ? 'Quitando…' : 'Quitar'}
                        </button>
                      )}
                      <button
                        type="button"
                        style={boton}
                        disabled={Boolean(ocupado)}
                        title="Viene igualmente: se queda y no vuelvo a avisar"
                        onClick={() => void dejar(f)}
                      >
                        Dejar
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          ))}

          {!soloLectura && quitables.length > 1 && (
            <button
              type="button"
              style={{ ...boton, background: '#dc2626', borderColor: '#dc2626', color: '#fff', justifySelf: 'start' }}
              disabled={Boolean(ocupado)}
              onClick={() => {
                if (window.confirm(`¿Quitar a los ${quitables.length} niños que han cancelado de sus sesiones y grupos?`)) {
                  void quitar(quitables);
                }
              }}
            >
              Quitar a todos ({quitables.length})
            </button>
          )}
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Paco lo mira solo varias veces al día (más a menudo el día antes). Quitar lo saca de la sesión y de su grupo; el
            entrenador ve su lista actualizada.
          </p>
        </div>
      )}

      {mensaje && (
        <p style={{ margin: '8px 0 0', whiteSpace: 'pre-line', color: '#0f172a', fontSize: 12 }}>
          {mensaje}{' '}
          <button type="button" style={{ ...boton, minHeight: 24, padding: '2px 8px' }} onClick={() => setMensaje(null)}>
            OK
          </button>
        </p>
      )}
    </div>
  );
}
