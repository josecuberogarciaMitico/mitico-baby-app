// 19/11/2026 (Jose): «Trabajo en pista» más clara y con menos scroll.
// Los grupos del turno salen cerrados, una línea cada uno (grupo, punto,
// entrenadores y asistencia). Se abre uno cada vez; dentro, cada niño en una
// línea con ✓ / ✕ grandes y el resto (WhatsApp, Llamar, camiseta, mover) en ⋯.
// No guarda nada por sí mismo: cada acción llama a las funciones de siempre,
// que le pasa DailySummaryScreen.
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import './GruposPista.css';

export type NinoPista = {
  clave: string;
  domId: string;
  nombre: string;
  detalle: string;
  /** null = sin marcar; undefined = no se puede marcar (sin ficha). */
  estado: 'Presente' | 'Ausente' | null | undefined;
  guardandoAsistencia: boolean;
  asistenciaOcupada: boolean;
  destacado: boolean;
  whatsapp: string | null;
  llamada: string | null;
  tieneFicha: boolean;
  camisetaPendiente: boolean;
  guardandoCamiseta: boolean;
  onMarcar: (opcion: 'Presente' | 'Ausente') => void;
  onCamiseta: () => void;
  onMover: (() => void) | null;
};

export type EntrenadorPista = {
  id: string;
  nombre: string;
  rol: string | null;
  chaqueta: boolean;
  guardando: boolean;
  ocupado: boolean;
  onChaqueta: () => void;
};

export type GrupoPista = {
  id: string;
  domId: string;
  titulo: string;
  niveles: string;
  punto: string;
  pistaTexto: string;
  pista: 'grande' | 'pequena' | 'otra';
  textoEntrenadores: string;
  sinEntrenador: boolean;
  destacado: boolean;
  entrenadores: EntrenadorPista[];
  ninos: NinoPista[];
  resumen: { presentes: number; ausentes: number; sinMarcar: number; total: number };
  reportes: React.ReactNode | null;
  trabajo: string | null;
  observaciones: React.ReactNode | null;
  hayObservaciones: boolean;
};

type Props = {
  grupos: GrupoPista[];
  abierto: string;
  onAbrir: (domId: string) => void;
};

function nombreCorto(nombre: string) {
  const p = String(nombre || '').trim().split(/\s+/);
  const cap = (t: string) => (t ? t.charAt(0).toUpperCase() + t.slice(1).toLowerCase() : '');
  return [cap(p[0] || ''), p[1] ? `${p[1].charAt(0).toUpperCase()}.` : ''].filter(Boolean).join(' ');
}

export function GruposPistaTurno({ grupos, abierto, onAbrir }: Props) {
  const [menu, setMenu] = useState<{ grupo: GrupoPista; nino: NinoPista } | null>(null);
  const [panel, setPanel] = useState<{ grupoId: string; cual: 'rep' | 'trab' | 'obs' } | null>(null);

  useEffect(() => {
    if (!menu) return;
    const tecla = (e: KeyboardEvent) => { if (e.key === 'Escape') setMenu(null); };
    window.addEventListener('keydown', tecla);
    return () => window.removeEventListener('keydown', tecla);
  }, [menu]);

  function abrir(domId: string, desplazar = true) {
    onAbrir(abierto === domId ? '' : domId);
    if (desplazar && abierto !== domId) {
      window.setTimeout(() => document.getElementById(domId)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60);
    }
  }

  return (
    <div className="gpi-turno">
      {grupos.length > 1 && (
        <div className="gpi-saltos" role="tablist" aria-label="Ir a un grupo">
          {grupos.map((g) => {
            const marcados = g.resumen.presentes + g.resumen.ausentes;
            const completo = g.resumen.total > 0 && g.resumen.sinMarcar === 0;
            return (
              <button
                key={`salto-${g.domId}`}
                type="button"
                role="tab"
                aria-selected={abierto === g.domId}
                className={`gpi-salto${abierto === g.domId ? ' is-on' : ''}${completo ? ' is-ok' : ''}`}
                onClick={() => abrir(g.domId)}
              >
                {g.titulo.replace('Grupo ', 'G')}
                <i>{marcados}/{g.resumen.total}</i>
              </button>
            );
          })}
        </div>
      )}

      {grupos.map((g, i) => {
        const estaAbierto = abierto === g.domId;
        const r = g.resumen;
        const marcados = r.presentes + r.ausentes;
        const pctV = r.total ? (r.presentes / r.total) * 100 : 0;
        const pctF = r.total ? (r.ausentes / r.total) * 100 : 0;
        const siguiente = grupos[i + 1];
        return (
          <section
            key={g.domId}
            id={g.domId}
            className={`gpi-grupo gpi-grupo--${g.pista}${estaAbierto ? ' is-abierto' : ''}${g.destacado ? ' is-destacado' : ''}${g.sinEntrenador ? ' is-sinent' : ''}`}
          >
            <button type="button" className="gpi-fila" aria-expanded={estaAbierto} onClick={() => abrir(g.domId)}>
              <span className="gpi-fila-txt">
                <b>{g.titulo} <span className="gpi-nivg">{g.niveles}</span></b>
                <small className={g.sinEntrenador ? 'is-falta' : ''}>{g.textoEntrenadores}</small>
              </span>
              <span className="gpi-punto"><small>PUNTO</small>{g.punto}</span>
              <span className={`gpi-cuenta${r.total && r.sinMarcar === 0 ? ' is-ok' : ''}`}>
                {marcados}/{r.total}
                {r.ausentes > 0 && <em>{r.ausentes} ✕</em>}
              </span>
              <span className="gpi-flecha" aria-hidden="true">{estaAbierto ? '▴' : '▾'}</span>
            </button>

            {estaAbierto && (
              <div className="gpi-cuerpo">
                <div className="gpi-cab">
                  <span className="gpi-pista">{g.pistaTexto}</span>
                  {g.entrenadores.length > 0 ? (
                    <div className="gpi-ents">
                      {g.entrenadores.map((e) => (
                        <span key={e.id} className="gpi-ent">
                          {e.rol && <small>{e.rol}</small>}
                          {e.nombre}
                          <button
                            type="button"
                            className={`gpi-chq${e.chaqueta ? '' : ' is-no'}`}
                            disabled={e.ocupado}
                            title={e.chaqueta ? `Marcar que ${e.nombre} ya NO tiene chaqueta` : `Marcar que ${e.nombre} ya tiene chaqueta`}
                            onClick={e.onChaqueta}
                          >
                            {e.guardando ? '…' : `🧥 ${e.chaqueta ? 'Sí' : 'No'}`}
                          </button>
                        </span>
                      ))}
                    </div>
                  ) : (
                    <div className={`gpi-ents-txt${g.sinEntrenador ? ' is-falta' : ''}`}>{g.textoEntrenadores}</div>
                  )}
                  {r.total > 0 && (
                    <div className="gpi-asis">
                      <div className="gpi-barra" aria-hidden="true">
                        <span className="v" style={{ width: `${pctV}%` }} />
                        <span className="f" style={{ width: `${pctF}%` }} />
                      </div>
                      <span>{r.presentes} ✓ · {r.ausentes} ✕ · {r.sinMarcar} sin marcar</span>
                    </div>
                  )}
                </div>

                {g.ninos.length > 0 ? (
                  <ul className="gpi-ninos">
                    {g.ninos.map((n) => (
                      <li
                        key={n.clave}
                        id={n.domId}
                        className={`gpi-nino${n.estado === 'Presente' ? ' is-viene' : ''}${n.estado === 'Ausente' ? ' is-falta' : ''}${n.destacado ? ' is-destacado' : ''}`}
                      >
                        <div className="gpi-nombre">
                          <b>{n.nombre}</b>
                          <div className="gpi-sub">
                            {n.detalle && <span className="gpi-nv">{n.detalle}</span>}
                            {n.camisetaPendiente && <span className="gpi-cam">🎽 entregar camiseta</span>}
                          </div>
                        </div>
                        <button type="button" className="gpi-mas" aria-label={`Opciones de ${n.nombre}`} onClick={() => setMenu({ grupo: g, nino: n })}>
                          ⋯
                        </button>
                        {n.estado !== undefined && (
                          <div className="gpi-seg">
                            {(['Presente', 'Ausente'] as const).map((opcion) => {
                              const activo = n.estado === opcion;
                              return (
                                <button
                                  key={opcion}
                                  type="button"
                                  className={`${opcion === 'Presente' ? 'si' : 'no'}${activo ? ' is-on' : ''}`}
                                  disabled={n.asistenciaOcupada}
                                  aria-pressed={activo}
                                  title={activo ? 'Pulsa otra vez para dejarlo sin marcar' : opcion === 'Presente' ? 'Marcar que ha venido' : 'Marcar que falta'}
                                  onClick={() => n.onMarcar(opcion)}
                                >
                                  {n.guardandoAsistencia && activo ? '…' : opcion === 'Presente' ? '✓' : '✕'}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="gpi-vacio">Sin listado cargado.</p>
                )}

                <div className={`gpi-pie${g.reportes ? '' : ' is-dos'}`}>
                  {g.reportes && (
                    <button type="button" className={panel?.grupoId === g.id && panel.cual === 'rep' ? 'is-on' : ''} onClick={() => setPanel(panel?.grupoId === g.id && panel.cual === 'rep' ? null : { grupoId: g.id, cual: 'rep' })}>
                      <span>📝</span>Reportes
                    </button>
                  )}
                  <button type="button" disabled={!g.trabajo} className={panel?.grupoId === g.id && panel.cual === 'trab' ? 'is-on' : ''} onClick={() => setPanel(panel?.grupoId === g.id && panel.cual === 'trab' ? null : { grupoId: g.id, cual: 'trab' })}>
                    <span>📋</span>Trabajo diario
                  </button>
                  <button type="button" disabled={!g.hayObservaciones} className={panel?.grupoId === g.id && panel.cual === 'obs' ? 'is-on' : ''} onClick={() => setPanel(panel?.grupoId === g.id && panel.cual === 'obs' ? null : { grupoId: g.id, cual: 'obs' })}>
                    <span>⚠️</span>Observ.
                  </button>
                </div>
                {/* Reportes: el panel de siempre (se monta siempre para no perder su estado). */}
                {g.reportes && (
                  <div className="gpi-panel" hidden={!(panel?.grupoId === g.id && panel.cual === 'rep')}>{g.reportes}</div>
                )}
                {panel?.grupoId === g.id && panel.cual === 'trab' && g.trabajo && (
                  <div className="gpi-panel gpi-texto">{g.trabajo}</div>
                )}
                {panel?.grupoId === g.id && panel.cual === 'obs' && g.hayObservaciones && (
                  <div className="gpi-panel">{g.observaciones}</div>
                )}

                {siguiente && (
                  <button type="button" className="gpi-siguiente" onClick={() => abrir(siguiente.domId)}>
                    Siguiente: {siguiente.titulo} · {siguiente.niveles} →
                  </button>
                )}
              </div>
            )}
          </section>
        );
      })}

      {menu && createPortal(
        <div className="gpi-hoja-fondo" onClick={() => setMenu(null)}>
          <div className="gpi-hoja" role="dialog" aria-label={`Opciones de ${menu.nino.nombre}`} onClick={(e) => e.stopPropagation()}>
            <b>{menu.nino.nombre}</b>
            {menu.nino.whatsapp && (
              <a href={menu.nino.whatsapp} target="_blank" rel="noreferrer" onClick={() => setMenu(null)}>💬 WhatsApp a la familia</a>
            )}
            {menu.nino.llamada && (
              <a href={menu.nino.llamada} onClick={() => setMenu(null)}>📞 Llamar a la familia</a>
            )}
            {!menu.nino.whatsapp && !menu.nino.llamada && <span className="gpi-hoja-nota">Sin teléfono en su ficha.</span>}
            {menu.nino.tieneFicha && (
              <button type="button" disabled={menu.nino.guardandoCamiseta} onClick={() => { menu.nino.onCamiseta(); setMenu(null); }}>
                🎽 {menu.nino.camisetaPendiente ? 'Marcar que ya tiene camiseta' : 'Marcar que necesita camiseta'}
              </button>
            )}
            {menu.nino.onMover && (
              <button type="button" onClick={() => { menu.nino.onMover?.(); setMenu(null); }}>🔀 Mover a otro grupo</button>
            )}
            <button type="button" className="gpi-hoja-cancelar" onClick={() => setMenu(null)}>Cancelar</button>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

export { nombreCorto as nombreCortoPista };
