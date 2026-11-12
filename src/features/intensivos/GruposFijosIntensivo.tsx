import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { composicionDesdeFilas, copiarComposicionADia, diaEditable, type FilaGrupoDia } from './copiarComposicionDias';
import {
  codigoNivel,
  grupoDeNino,
  grupoEquivalente,
  grupoRecomendado,
  gruposDelDia,
  idsColocados,
  type FilaDiaGrupos,
  type GrupoDelDia,
} from './gruposFijosLogic';

// Intensivos · «Grupos del intensivo» (12/11). Como en Ocio: los grupos del
// curso se ven siempre con sus niños, día por día. Un niño nuevo sale en
// «Sin colocar» con su grupo recomendado; colocar o mover a un niño se puede
// aplicar también a los días siguientes. Un día vacío se rellena con los
// grupos de otro día. Nada borra un día sin poner antes los grupos nuevos.

type Fila = FilaGrupoDia & FilaDiaGrupos;

type Dia = { intensivo_dia_id: string; numero_dia: number; fecha: string; sesion_id: string | null };

type Props = {
  dias: Dia[];
  inscritos: { alumno_id: string; alumno: string }[];
  nivelDe: (alumnoId: string) => string | null | undefined;
  formatearFecha: (fecha: string) => string;
  leerDia: (diaId: string) => Promise<Fila[]>;
  incorporar: (sesionId: string, grupoId: string, alumnoId: string, nombre: string, nivel: string) => Promise<void>;
  mover: (alumnoId: string, grupoOrigenId: string, grupoDestinoId: string) => Promise<void>;
  crearGrupo: Parameters<typeof copiarComposicionADia>[2]['crearGrupo'];
  borrarGrupo: (grupoId: string) => Promise<void>;
  recargar: () => Promise<void>;
  abrirDia: (diaId: string) => void;
  esMovil?: boolean;
};

const boton: React.CSSProperties = {
  minHeight: 34,
  padding: '6px 10px',
  borderRadius: 9,
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  fontSize: 13,
  fontWeight: 700,
  cursor: 'pointer',
};
const botonFuerte: React.CSSProperties = { ...boton, background: '#0f172a', borderColor: '#0f172a', color: '#fff' };
const selector: React.CSSProperties = { ...boton, fontWeight: 600, maxWidth: '100%', minWidth: 0 };
const insignia = (fondo: string, color: string): React.CSSProperties => ({
  padding: '1px 7px',
  borderRadius: 999,
  background: fondo,
  color,
  fontSize: 11,
  fontWeight: 800,
  whiteSpace: 'nowrap',
});

export function GruposFijosIntensivo(props: Props) {
  const { dias, inscritos, nivelDe, formatearFecha, leerDia, recargar } = props;
  const [filas, setFilas] = useState<Record<string, Fila[]>>({});
  const [leyendo, setLeyendo] = useState(true);
  const [diaSelId, setDiaSelId] = useState<string>('');
  const [ocupado, setOcupado] = useState(false);
  const [mensaje, setMensaje] = useState<string | null>(null);
  const [siguientes, setSiguientes] = useState(true);

  const diasOrdenados = useMemo(() => [...dias].sort((a, b) => a.numero_dia - b.numero_dia), [dias]);
  const claveDias = diasOrdenados.map((d) => `${d.intensivo_dia_id}:${d.sesion_id || ''}`).join('|');

  const leerTodo = useCallback(async () => {
    const res: Record<string, Fila[]> = {};
    for (const d of diasOrdenados) {
      try {
        res[d.intensivo_dia_id] = d.sesion_id ? await leerDia(d.intensivo_dia_id) : [];
      } catch {
        res[d.intensivo_dia_id] = [];
      }
    }
    setFilas(res);
    setLeyendo(false);
    return res;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveDias]);

  useEffect(() => {
    void leerTodo();
  }, [leerTodo]);

  const grupos = useMemo(() => {
    const r: Record<string, GrupoDelDia[]> = {};
    for (const d of diasOrdenados) r[d.intensivo_dia_id] = gruposDelDia(filas[d.intensivo_dia_id] || []);
    return r;
  }, [filas, diasOrdenados]);

  // Día elegido: el que haya marcado coordinación; si no, el primero con huecos
  // (niños sin colocar o sin grupos) que no haya pasado; si no, el último.
  const hoy = new Date().toISOString().slice(0, 10);
  const diaSel =
    diasOrdenados.find((d) => d.intensivo_dia_id === diaSelId) ||
    diasOrdenados.find((d) => d.fecha >= hoy && idsColocados(grupos[d.intensivo_dia_id] || []).size < inscritos.length) ||
    diasOrdenados.find((d) => d.fecha >= hoy) ||
    diasOrdenados[diasOrdenados.length - 1];

  if (diasOrdenados.length === 0) return null;
  if (!diaSel) return null;

  const gruposSel = grupos[diaSel.intensivo_dia_id] || [];
  const colocados = idsColocados(gruposSel);
  const sinColocar = inscritos.filter((a) => !colocados.has(a.alumno_id));
  const posteriores = diasOrdenados.filter((d) => d.numero_dia > diaSel.numero_dia);
  const otrosConGrupos = diasOrdenados.filter(
    (d) => d.intensivo_dia_id !== diaSel.intensivo_dia_id && (grupos[d.intensivo_dia_id] || []).length > 0
  );
  const sePuedeSustituir = diaEditable(filas[diaSel.intensivo_dia_id] || []);
  const nivelNino = (id: string, delGrupo?: string) => codigoNivel(delGrupo) || codigoNivel(nivelDe(id)) || '';

  async function trasCambio(texto: string) {
    setMensaje(texto);
    await recargar();
    await leerTodo();
  }

  async function ejecutar(fn: () => Promise<string>) {
    setOcupado(true);
    setMensaje(null);
    try {
      await trasCambio(await fn());
    } catch (e) {
      setMensaje(e instanceof Error ? e.message : 'No se pudo hacer el cambio.');
      await leerTodo();
    }
    setOcupado(false);
  }

  function colocar(nino: { alumno_id: string; alumno: string }, grupo: GrupoDelDia) {
    void ejecutar(async () => {
      const nivel = nivelNino(nino.alumno_id) || 'INICIACION';
      if (!diaSel.sesion_id) throw new Error('Este día no tiene grupos todavía.');
      await props.incorporar(diaSel.sesion_id, grupo.grupo_id, nino.alumno_id, nino.alumno, nivel);
      const hechos = [`Día ${diaSel.numero_dia}`];
      const avisos: string[] = [];
      if (siguientes) {
        for (const d of posteriores) {
          const gs = grupos[d.intensivo_dia_id] || [];
          if (!d.sesion_id || gs.length === 0) {
            avisos.push(`Día ${d.numero_dia} no tiene grupos`);
            continue;
          }
          if (grupoDeNino(nino.alumno_id, gs)) continue;
          const eq = grupoEquivalente(grupo.nombre_grupo, nivel, gs);
          if (!eq) continue;
          await props.incorporar(d.sesion_id, eq.grupo_id, nino.alumno_id, nino.alumno, nivel);
          hechos.push(`Día ${d.numero_dia}`);
        }
      }
      return `${nino.alumno} metido en ${grupo.nombre_grupo} (${hechos.join(', ')}).${avisos.length ? ` ${avisos.join(' · ')}: ponle grupos y vuelve a colocarlo.` : ''}`;
    });
  }

  function moverNino(nino: { alumno_id: string; alumno: string; nivel: string }, origen: GrupoDelDia, destino: GrupoDelDia) {
    void ejecutar(async () => {
      await props.mover(nino.alumno_id, origen.grupo_id, destino.grupo_id);
      const hechos = [`Día ${diaSel.numero_dia}`];
      if (siguientes) {
        for (const d of posteriores) {
          const gs = grupos[d.intensivo_dia_id] || [];
          const actual = grupoDeNino(nino.alumno_id, gs);
          if (!actual) continue;
          const eq = grupoEquivalente(destino.nombre_grupo, nino.nivel, gs);
          if (!eq || eq.grupo_id === actual.grupo_id) continue;
          await props.mover(nino.alumno_id, actual.grupo_id, eq.grupo_id);
          hechos.push(`Día ${d.numero_dia}`);
        }
      }
      return `${nino.alumno} pasa a ${destino.nombre_grupo} (${hechos.join(', ')}).`;
    });
  }

  function ponerGruposDe(origen: Dia) {
    const destino = diaSel;
    const tiene = (grupos[destino.intensivo_dia_id] || []).length > 0;
    if (
      tiene &&
      !window.confirm(
        `¿Cambiar los grupos del Día ${destino.numero_dia} por los del Día ${origen.numero_dia}?\n\nSe ponen los grupos nuevos y se quitan los de ahora. Si algo falla, se dejan como estaban.`
      )
    )
      return;
    void ejecutar(async () => {
      const composicion = composicionDesdeFilas(filas[origen.intensivo_dia_id] || []);
      if (composicion.length === 0) throw new Error(`El Día ${origen.numero_dia} no tiene grupos.`);
      await copiarComposicionADia(destino.intensivo_dia_id, composicion, {
        leerDia: (id) => leerDia(id),
        crearGrupo: props.crearGrupo,
        borrarGrupo: props.borrarGrupo,
      });
      return `Día ${destino.numero_dia}: puestos los ${composicion.length} grupos del Día ${origen.numero_dia}, sin publicar. Ya puedes cambiar lo que quieras de este día.`;
    });
  }

  return (
    <section
      style={{
        border: '1px solid #e2e8f0',
        borderRadius: 14,
        background: '#fff',
        padding: 12,
        marginBottom: 14,
        minWidth: 0,
        boxSizing: 'border-box',
      }}
    >
      <h4 style={{ margin: '0 0 4px' }}>Grupos del intensivo</h4>
      <p style={{ margin: '0 0 10px', color: '#64748b', fontSize: 13, lineHeight: 1.4 }}>
        Los mismos grupos todos los días, con sus niños. Si cambias algo, puedes aplicarlo también a los días siguientes.
      </p>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
        {diasOrdenados.map((d) => {
          const gs = grupos[d.intensivo_dia_id] || [];
          const n = idsColocados(gs).size;
          const completo = gs.length > 0 && inscritos.every((a) => idsColocados(gs).has(a.alumno_id));
          const sel = d.intensivo_dia_id === diaSel.intensivo_dia_id;
          return (
            <button
              key={d.intensivo_dia_id}
              type="button"
              onClick={() => {
                setDiaSelId(d.intensivo_dia_id);
                setMensaje(null);
              }}
              style={{
                ...boton,
                textAlign: 'left',
                flex: props.esMovil ? '1 1 calc(50% - 6px)' : '0 1 auto',
                border: sel ? '2px solid #0f172a' : `1px solid ${completo ? '#86efac' : '#fdba74'}`,
                background: completo ? '#f0fdf4' : '#fff7ed',
              }}
            >
              <div>Día {d.numero_dia} · {formatearFecha(d.fecha)}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: completo ? '#166534' : '#9a3412' }}>
                {leyendo ? '…' : gs.length === 0 ? 'Sin grupos' : `${gs.length} grupos · ${n}/${inscritos.length} niños`}
              </div>
            </button>
          );
        })}
      </div>

      {mensaje && (
        <div style={{ margin: '0 0 10px', padding: '8px 10px', borderRadius: 10, background: '#f1f5f9', fontSize: 13, color: '#0f172a' }}>
          {mensaje}{' '}
          <button type="button" style={{ ...boton, minHeight: 24, padding: '1px 8px' }} onClick={() => setMensaje(null)}>
            OK
          </button>
        </div>
      )}

      {leyendo ? (
        <p style={{ color: '#64748b', fontSize: 13 }}>Cargando grupos…</p>
      ) : (
        <>
          {posteriores.length > 0 && gruposSel.length > 0 && (
            <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, fontWeight: 700, marginBottom: 10 }}>
              <input type="checkbox" checked={siguientes} onChange={(e) => setSiguientes(e.target.checked)} />
              Lo que cambie aquí, aplicarlo también a los días siguientes ({posteriores.map((d) => `Día ${d.numero_dia}`).join(', ')})
            </label>
          )}

          {gruposSel.length === 0 && (
            <div style={{ padding: 10, borderRadius: 12, background: '#fff7ed', border: '1px solid #fdba74', marginBottom: 10 }}>
              <strong>El Día {diaSel.numero_dia} no tiene grupos.</strong>
              {otrosConGrupos.length > 0 ? (
                <>
                  <p style={{ margin: '4px 0 8px', fontSize: 13 }}>Empieza con los grupos de otro día y luego cambia lo que quieras:</p>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {otrosConGrupos.map((d) => (
                      <button key={d.intensivo_dia_id} type="button" disabled={ocupado} style={botonFuerte} onClick={() => ponerGruposDe(d)}>
                        Poner los grupos del Día {d.numero_dia}
                      </button>
                    ))}
                  </div>
                </>
              ) : (
                <p style={{ margin: '4px 0 0', fontSize: 13 }}>Usa el recomendador de abajo para crear los primeros grupos.</p>
              )}
            </div>
          )}

          {gruposSel.length > 0 && sinColocar.length > 0 && (
            <div style={{ padding: 10, borderRadius: 12, background: '#fff7ed', border: '1px solid #fb923c', marginBottom: 10 }}>
              <strong style={{ color: '#9a3412' }}>
                Sin colocar el Día {diaSel.numero_dia} · {sinColocar.length}
              </strong>
              <div style={{ display: 'grid', gap: 6, marginTop: 6 }}>
                {sinColocar.map((nino) => {
                  const nivel = nivelNino(nino.alumno_id);
                  const rec = grupoRecomendado(nivel, gruposSel);
                  return (
                    <div key={nino.alumno_id} style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', background: '#fff', borderRadius: 10, padding: '6px 8px' }}>
                      <span style={{ flex: '1 1 160px', minWidth: 0, fontWeight: 700, overflowWrap: 'anywhere' }}>
                        {nino.alumno} <span style={{ color: '#64748b', fontWeight: 600 }}>· {nivel || 'sin nivel'}</span>
                      </span>
                      {rec && (
                        <button type="button" disabled={ocupado} style={botonFuerte} onClick={() => colocar(nino, rec)}>
                          Meter en {rec.nombre_grupo}
                        </button>
                      )}
                      <select
                        disabled={ocupado}
                        value=""
                        style={selector}
                        onChange={(e) => {
                          const g = gruposSel.find((x) => x.grupo_id === e.target.value);
                          if (g) colocar(nino, g);
                        }}
                      >
                        <option value="">Otro grupo…</option>
                        {gruposSel.map((g) => (
                          <option key={g.grupo_id} value={g.grupo_id}>
                            {g.nombre_grupo} ({g.alumnos.length})
                          </option>
                        ))}
                      </select>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {gruposSel.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 250px), 1fr))', gap: 8 }}>
              {gruposSel.map((g) => (
                <div key={g.grupo_id} style={{ border: '1px solid #e2e8f0', borderRadius: 12, padding: 8, minWidth: 0, background: '#f8fafc' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 6 }}>
                    <strong style={{ flex: '1 1 140px', minWidth: 0 }}>{g.nombre_grupo}</strong>
                    {g.pista && <span style={insignia('#e0f2fe', '#075985')}>{g.pista}</span>}
                    <span style={g.publicado ? insignia('#dcfce7', '#166534') : insignia('#f1f5f9', '#475569')}>
                      {g.publicado ? 'Publicado' : 'Sin publicar'}
                    </span>
                  </div>
                  {g.alumnos.map((a) => (
                    <div key={a.alumno_id} style={{ display: 'flex', gap: 6, alignItems: 'center', padding: '4px 0', borderTop: '1px solid #e2e8f0', flexWrap: 'wrap' }}>
                      <span style={{ flex: '1 1 120px', minWidth: 0, fontSize: 13, overflowWrap: 'anywhere' }}>
                        {a.alumno} <span style={{ color: '#64748b' }}>· {a.nivel || '—'}</span>
                      </span>
                      {gruposSel.length > 1 && (
                        <select
                          disabled={ocupado}
                          value=""
                          style={{ ...selector, minHeight: 28, padding: '2px 6px', fontSize: 12 }}
                          onChange={(e) => {
                            const destino = gruposSel.find((x) => x.grupo_id === e.target.value);
                            if (destino) moverNino(a, g, destino);
                          }}
                        >
                          <option value="">Mover a…</option>
                          {gruposSel
                            .filter((x) => x.grupo_id !== g.grupo_id)
                            .map((x) => (
                              <option key={x.grupo_id} value={x.grupo_id}>
                                {x.nombre_grupo} ({x.alumnos.length})
                              </option>
                            ))}
                        </select>
                      )}
                    </div>
                  ))}
                  {g.alumnos.length === 0 && <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Sin niños</p>}
                </div>
              ))}
            </div>
          )}

          {gruposSel.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 10, alignItems: 'center' }}>
              <button type="button" style={boton} onClick={() => props.abrirDia(diaSel.intensivo_dia_id)}>
                Entrenadores y publicar este día →
              </button>
              {sePuedeSustituir && otrosConGrupos.length > 0 && (
                <select
                  disabled={ocupado}
                  value=""
                  style={selector}
                  onChange={(e) => {
                    const d = otrosConGrupos.find((x) => x.intensivo_dia_id === e.target.value);
                    if (d) ponerGruposDe(d);
                  }}
                >
                  <option value="">Cambiar por los grupos de otro día…</option>
                  {otrosConGrupos.map((d) => (
                    <option key={d.intensivo_dia_id} value={d.intensivo_dia_id}>
                      Grupos del Día {d.numero_dia}
                    </option>
                  ))}
                </select>
              )}
            </div>
          )}
          {ocupado && <p style={{ margin: '8px 0 0', fontSize: 13, color: '#64748b' }}>Guardando…</p>}
        </>
      )}
    </section>
  );
}
