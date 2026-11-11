import React, { useCallback, useEffect, useState } from 'react';
import {
  agruparCancelados,
  canceladosPendientes,
  etiquetaTurno,
  horasRepaso,
  textoCancelo,
  textoHace,
  textoResumenCancelados,
  turnosSinRepasoFiable,
  type CanceladoAimHarder,
  type RepasoTurno,
} from './canceladosAimHarderLogic';
import {
  cargarCanceladosAimHarder,
  cargarRepasoCanceladosAimHarder,
  dejarCanceladoAimHarder,
  quitarCanceladoAimHarder,
} from '../../services/aimharder/canceladosAimHarderService';
import { PastillaAviso, botonOcultarAviso, useAvisoPlegado } from './avisoPlegable';

// Cancelados en AimHarder (03/11): aviso en la Agenda con los niños que han
// cancelado en AimHarder y siguen en una sesión (y quizá en un grupo) de la
// app. «Quitar» los saca de la sesión y del grupo; «Dejar» lo mantiene y deja
// de avisar. Si la función aún no existe en Supabase, no enseña nada.

type Props = {
  hoyIso: string;
  /** Cambia al pulsar «Actualizar» en la Agenda: vuelve a consultar. */
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

export function CanceladosAimHarderAviso({ hoyIso, refresco, soloLectura, onCambios }: Props) {
  const [filas, setFilas] = useState<CanceladoAimHarder[]>([]);
  const [abierto, setAbierto] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [mensaje, setMensaje] = useState<string | null>(null);
  // 05/11: hace cuánto se comprobó cada turno (para saber si fiarse).
  const [repaso, setRepaso] = useState<RepasoTurno[] | null>(null);
  const [verRepaso, setVerRepaso] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setFilas(canceladosPendientes(await cargarCanceladosAimHarder(hoyIso), hoyIso));
    } catch {
      // Sin la función en Supabase (o sin permiso) el aviso no aparece.
      setFilas([]);
    }
    try {
      setRepaso(await cargarRepasoCanceladosAimHarder(hoyIso));
    } catch {
      setRepaso(null);
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

  useEffect(() => {
    if (refresco) void cargar();
  }, [refresco, cargar]);

  const ahoraMs = Date.now();
  const turnosRepaso = (repaso || []).filter((t) => t.ninos > 0);
  const flojos = turnosSinRepasoFiable(turnosRepaso, hoyIso, ahoraMs);
  // 11/11: el repaso (cuando nadie ha cancelado) se puede ocultar; vuelve si cambia su estado.
  const [repasoOculto, setRepasoOculto] = useAvisoPlegado(`repaso:${hoyIso.slice(0, 10)}:${flojos.length ? 'pendiente' : 'ok'}`);

  // Línea de repaso: dice si la comprobación es reciente o si no conviene fiarse.
  const lineaRepaso = turnosRepaso.length ? (
    <div style={{ marginTop: filas.length ? 6 : 0, fontSize: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ flex: '1 1 200px', minWidth: 0, color: flojos.length ? '#92400e' : '#166534', fontWeight: 700 }}>
          {flojos.length
            ? `⏳ Repaso de AimHarder sin terminar en ${flojos.length === 1 ? '1 turno' : `${flojos.length} turnos`} de hoy/mañana: no te fíes todavía de que nadie cancelara.`
            : filas.length
            ? '✓ Turnos de hoy y mañana comprobados hace menos de 6 h.'
            : '✓ AimHarder: nadie ha cancelado. Turnos de hoy y mañana comprobados hace menos de 6 h.'}
        </span>
        <button type="button" style={{ ...boton, minHeight: 26, padding: '3px 8px' }} onClick={() => setVerRepaso((x) => !x)}>
          {verRepaso ? 'Plegar' : 'Ver repaso'}
        </button>
        {!filas.length && !mensaje && (
          <button type="button" style={{ ...botonOcultarAviso, minHeight: 26, padding: '3px 8px', color: '#166534' }} onClick={() => setRepasoOculto(true)}>
            Quitar de aquí
          </button>
        )}
      </div>
      {verRepaso && (
        <ul style={{ listStyle: 'none', margin: '6px 0 0', padding: 0, color: '#334155' }}>
          {turnosRepaso.map((t) => {
            const flojo = flojos.includes(t);
            return (
              <li key={t.sesion_id} style={{ padding: '3px 0', borderTop: '1px solid rgba(148,163,184,.3)', color: flojo ? '#92400e' : undefined }}>
                {flojo ? '⏳ ' : '✓ '}
                {etiquetaTurno(t.fecha, t.hora_inicio, t.modalidad)} · {t.ninos} niños · comprobado {textoHace(horasRepaso(t, ahoraMs))}
                {t.sin_vincular ? ` · ${t.sin_vincular} sin enlazar con AimHarder (no se pueden comprobar)` : ''}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  ) : null;

  if (!filas.length && !mensaje) {
    if (!lineaRepaso) return null;
    if (repasoOculto) {
      return flojos.length ? (
        <PastillaAviso texto="⏳ Repaso AimHarder pendiente" color="#92400e" fondo="#fffbeb" onAbrir={() => setRepasoOculto(false)} />
      ) : (
        <PastillaAviso texto="✓ AimHarder al día" color="#166534" fondo="#f0fdf4" onAbrir={() => setRepasoOculto(false)} />
      );
    }
    return (
      <div
        style={{
          padding: '8px 12px',
          borderRadius: 12,
          background: flojos.length ? '#fffbeb' : '#f0fdf4',
          border: `1px solid ${flojos.length ? '#fcd34d' : '#bbf7d0'}`,
          minWidth: 0,
          flex: '1 1 100%',
        }}
      >
        {lineaRepaso}
      </div>
    );
  }

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
        flex: '1 1 100%',
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
      {lineaRepaso}

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
            Paco comprueba a los apuntados de hoy y mañana cada 4 h y al resto de la semana cada 12 h. Si oficina lo vuelve a
            apuntar como invitado (recupera), no sale aquí. Quitar lo saca de la sesión y de su grupo; el entrenador ve su
            lista actualizada.
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
