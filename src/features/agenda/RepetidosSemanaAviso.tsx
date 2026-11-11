import React, { useCallback, useEffect, useState } from 'react';
import { etiquetaTurno } from './canceladosAimHarderLogic';
import { agruparRepetidos, consejoRepetido, textoResumenRepetidos, type NinoRepetido, type TurnoRepetido } from './repetidosSemanaLogic';
import { cargarRepetidosSemana, dejarRepetidoSemana, quitarRepetidoSemana } from '../../services/aimharder/canceladosAimHarderService';

// Niños en varios turnos la misma semana (11/11). Suele pasar cuando oficina
// apunta al niño como invitado el día al que se cambia y no le quita la
// reserva del día de siempre. A veces es real: «Es correcto» deja de avisar.
// Si la función aún no existe en Supabase, no enseña nada.

type Props = {
  hoyIso: string;
  refresco?: number;
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

export function RepetidosSemanaAviso({ hoyIso, refresco, soloLectura, onCambios }: Props) {
  const [ninos, setNinos] = useState<NinoRepetido[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      setNinos(agruparRepetidos(await cargarRepetidosSemana(hoyIso)));
    } catch {
      setNinos([]);
    }
  }, [hoyIso]);

  useEffect(() => {
    void cargar();
    const t = window.setInterval(() => void cargar(), 5 * 60000);
    return () => window.clearInterval(t);
  }, [cargar]);

  useEffect(() => {
    if (refresco) void cargar();
  }, [refresco, cargar]);

  if (!ninos.length && !mensaje) return null;

  async function quitar(n: NinoRepetido, t: TurnoRepetido) {
    if (!window.confirm(`¿Quitar a ${n.alumno} de ${etiquetaTurno(t.fecha, t.hora_inicio, t.modalidad)}${t.grupo ? ` (y de ${t.grupo})` : ''}?\n\nAcuérdate de quitarle también esa reserva en AimHarder: si no, volverá a salir al actualizar el listado.`)) return;
    setOcupado(t.sesion_alumno_id);
    try {
      await quitarRepetidoSemana(t.sesion_alumno_id);
      setMensaje(`${n.alumno} quitado de ${etiquetaTurno(t.fecha, t.hora_inicio, t.modalidad)}. Quítale también esa reserva en AimHarder.`);
      await cargar();
      await onCambios();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo quitar.');
    }
    setOcupado(null);
  }

  async function esCorrecto(n: NinoRepetido) {
    setOcupado(n.clave);
    try {
      await dejarRepetidoSemana(n.alumno_id, n.semana_inicio);
      setMensaje(`${n.alumno}: anotado que viene varios días; no vuelvo a avisar esta semana.`);
      await cargar();
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo guardar.');
    }
    setOcupado(null);
  }

  const cambios = ninos.filter((n) => n.pareceCambio).length;

  return (
    <div style={{ padding: '10px 12px', borderRadius: 12, background: '#fff7ed', border: '1px solid #fdba74', color: '#7c2d12', fontSize: 13, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ flex: '1 1 200px', minWidth: 0 }}>
          {ninos.length ? `🔁 ${textoResumenRepetidos(ninos.length)}` : '✓ Ya no hay niños repetidos'}
          {cambios > 0 && <span style={{ fontWeight: 700 }}> · {cambios} parece{cambios === 1 ? '' : 'n'} un cambio de día con la reserva antigua sin quitar</span>}
        </strong>
        {ninos.length > 0 && (
          <button type="button" style={boton} onClick={() => setAbierto((x) => !x)}>
            {abierto ? 'Ocultar' : 'Ver'}
          </button>
        )}
      </div>

      {abierto && ninos.length > 0 && (
        <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
          {ninos.map((n) => (
            <div key={n.clave} style={{ background: '#fff', borderRadius: 10, padding: '8px 10px', border: `1px solid ${n.pareceCambio ? '#fb923c' : '#fed7aa'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ flex: '1 1 180px', minWidth: 0, color: '#0f172a', overflowWrap: 'anywhere' }}>{n.alumno}</strong>
                {!soloLectura && (
                  <button type="button" style={boton} disabled={Boolean(ocupado)} title="Viene de verdad varios días: no vuelvo a avisar esta semana" onClick={() => void esCorrecto(n)}>
                    {ocupado === n.clave ? 'Guardando…' : 'Es correcto, viene varios días'}
                  </button>
                )}
              </div>
              <p style={{ margin: '4px 0 6px', fontSize: 12, color: '#9a3412' }}>{consejoRepetido(n)}</p>
              {n.turnos.map((t) => (
                <div key={t.sesion_alumno_id} style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', padding: '6px 0', borderTop: '1px solid #f1f5f9' }}>
                  <div style={{ flex: '1 1 180px', minWidth: 0, color: '#0f172a' }}>
                    <div style={{ fontWeight: 700 }}>
                      {etiquetaTurno(t.fecha, t.hora_inicio, t.modalidad)}
                      {t.invitado && <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 6, background: '#dbeafe', color: '#1e40af', fontSize: 11 }}>INVITADO</span>}
                      {t.sobraProbable && <span style={{ marginLeft: 6, padding: '1px 6px', borderRadius: 6, background: '#fee2e2', color: '#b91c1c', fontSize: 11 }}>¿SOBRA?</span>}
                    </div>
                    <div style={{ fontSize: 12, color: '#64748b' }}>
                      {t.grupo ? `${t.grupo}${t.grupo_publicado ? ' (publicado)' : ''}` : 'Sin grupo'}
                      {t.protegido ? ' · tiene asistencia o reporte: no se puede quitar' : ''}
                    </div>
                  </div>
                  {!soloLectura && !t.protegido && (
                    <button
                      type="button"
                      style={t.sobraProbable ? { ...boton, background: '#dc2626', borderColor: '#dc2626', color: '#fff' } : boton}
                      disabled={Boolean(ocupado)}
                      onClick={() => void quitar(n, t)}
                    >
                      {ocupado === t.sesion_alumno_id ? 'Quitando…' : 'Quitar de este turno'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          ))}
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Solo Baby y Ocio (Intensivos y particulares no cuentan). «Quitar» lo saca del turno y de su grupo en la app; la
            reserva de AimHarder hay que quitarla allí, o volverá a salir al actualizar el listado.
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
