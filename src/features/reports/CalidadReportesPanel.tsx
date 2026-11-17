import React from 'react';
import { cargarReportesCoordinacion, type ReporteCoordinacion } from '../../services/reports/coordinationReportsService';
import {
  anularDevolucion,
  cargarEstadoDevoluciones,
  devolverReporte,
  type EstadoDevolucion,
} from '../../services/reports/calidadReportesService';
import { abrirFichaAlumno } from '../students/studentFichaStore';
import { TarjetaCalidadPropia } from '../trainers/CalidadEntrenador';
import { sumarDiasIso } from './reportsReviewLogic';
import {
  calidadPorEntrenador,
  DIAS_RECIENTE,
  formatoNota,
  LETRAS_POR_HABILIDAD,
  MINIMO_REPORTES,
  notaEquipoDe,
  UMBRAL,
  vistaEntrenadorDesde,
  type CalidadEntrenador,
  type Semaforo,
} from './calidadReportes';

// Calidad de reportes por entrenador (17/11/2026). Nota de 0 a 10 de los
// últimos 7 días, con quién hablar, en qué falla cada uno y los reportes
// flojos, que se pueden devolver al entrenador para que los complete.

const SEMANAS = 8;
const MOTIVO_POR_DEFECTO = 'Cuenta qué has visto en pista: así no se puede saber cómo va el niño.';

const hoyMadrid = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

const COLOR: Record<Semaforo, { fondo: string; borde: string; punto: string; texto: string }> = {
  rojo: { fondo: '#fef2f2', borde: '#fca5a5', punto: '#dc2626', texto: 'Poco fiable' },
  amarillo: { fondo: '#fffbeb', borde: '#fcd34d', punto: '#d97706', texto: 'Mejorable' },
  verde: { fondo: '#f0fdf4', borde: '#86efac', punto: '#16a34a', texto: 'Bien' },
  sin_datos: { fondo: '#f8fafc', borde: '#e2e8f0', punto: '#94a3b8', texto: 'Pocos reportes' },
};

function fechaCorta(f: string) {
  const [, m, d] = String(f || '').split('-');
  return d && m ? `${d}/${m}` : f;
}

const botonPeq: React.CSSProperties = {
  minHeight: 34,
  padding: '4px 12px',
  borderRadius: 10,
  border: '1px solid #cbd5e1',
  background: '#fff',
  fontWeight: 800,
  cursor: 'pointer',
};

function Tarjeta({
  c,
  esMovil,
  soloLectura,
  devoluciones,
  onDevolver,
  onAnular,
  equipo,
}: {
  c: CalidadEntrenador;
  equipo: number | null;
  esMovil?: boolean;
  soloLectura?: boolean;
  devoluciones: Map<string, EstadoDevolucion>;
  onDevolver: (reporteId: string, alumno: string) => void;
  onAnular: (reporteId: string) => void;
  key?: string;
}) {
  const color = COLOR[c.semaforo];
  const r = c.reciente;
  const [verComoEl, setVerComoEl] = React.useState(false);
  const leSale =
    r.reportes + r.faltan < MINIMO_REPORTES || r.nota === null
      ? `Ahora mismo no le sale: necesita ${MINIMO_REPORTES} reportes en ${DIAS_RECIENTE} días y tiene ${r.reportes + r.faltan}.`
      : c.semaforo === 'verde'
        ? 'Le sale abajo, al final de su vista (va bien).'
        : 'Le sale arriba del todo al abrir la app (va mal).';
  return (
    <details style={{ borderRadius: 16, background: color.fondo, border: `1px solid ${color.borde}`, overflow: 'hidden' }}>
      <summary style={{ cursor: 'pointer', padding: '12px 14px', listStyle: 'none', display: 'grid', gap: 6 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span aria-hidden style={{ width: 12, height: 12, borderRadius: 999, background: color.punto, flex: '0 0 auto' }} />
          <strong style={{ fontSize: 15.5, color: '#0f172a', flex: '1 1 140px', minWidth: 0, overflowWrap: 'anywhere' }}>{c.entrenador}</strong>
          <span style={{ fontSize: 12, fontWeight: 900, color: color.punto }}>{color.texto}</span>
          {c.vaAMenos && (
            <span style={{ padding: '2px 8px', borderRadius: 999, background: '#7f1d1d', color: '#fff', fontSize: 11, fontWeight: 900 }}>↓ Va a menos</span>
          )}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: esMovil ? 'repeat(2, minmax(0,1fr))' : 'repeat(4, minmax(0,1fr))', gap: 6 }}>
          {[
            [r.nota === null ? '—' : `${formatoNota(r.nota)} / 10`, 'nota de calidad'],
            [`${r.reportes}${r.faltan ? ` · ${r.faltan} sin hacer` : ''}`, `reportes (${DIAS_RECIENTE} días)`],
            [`${r.pocoDetallados}${r.reportes ? ` · ${r.pctPocoDetallados}%` : ''}`, 'todo «Lo consigue» sin escribir'],
            [`${r.pctTarde}%`, 'rellenados 2+ días tarde'],
          ].map(([valor, etiqueta]) => (
            <div key={etiqueta} style={{ background: '#fff', borderRadius: 10, padding: '6px 8px', minWidth: 0 }}>
              <div style={{ fontSize: 17, fontWeight: 900, color: '#0f172a' }}>{valor}</div>
              <div style={{ fontSize: 11.5, color: '#64748b', fontWeight: 700 }}>{etiqueta}</div>
            </div>
          ))}
        </div>
        {c.fallos.length > 0 && (
          <div style={{ background: '#fff', borderRadius: 10, padding: '8px 10px', display: 'grid', gap: 3 }}>
            <strong style={{ fontSize: 12, color: '#0f172a', letterSpacing: '.03em' }}>EN QUÉ FALLA</strong>
            {c.fallos.map((f) => (
              <span key={f} style={{ fontSize: 13.5, color: '#1f2937', lineHeight: 1.35 }}>• {f}</span>
            ))}
          </div>
        )}
        <span style={{ fontSize: 12.5, color: '#475569' }}>
          {c.anterior.reportes
            ? `Antes (semanas previas): nota ${formatoNota(c.anterior.nota)} · ${c.anterior.reportes} reportes`
            : 'Sin reportes de las semanas anteriores para comparar.'}
        </span>
      </summary>
      <div style={{ padding: '0 14px 12px', display: 'grid', gap: 6 }}>
        <button
          type="button"
          onClick={() => setVerComoEl((v) => !v)}
          aria-expanded={verComoEl}
          style={{ ...botonPeq, justifySelf: 'start', borderColor: '#0f172a' }}
        >
          {verComoEl ? 'Ocultar su vista' : '👁 Ver como lo ve el entrenador'}
        </button>
        {verComoEl && (
          <div style={{ display: 'grid', gap: 6, padding: 10, borderRadius: 14, background: '#e2e8f0' }}>
            <span style={{ fontSize: 12.5, fontWeight: 800, color: '#334155' }}>📱 {leSale}</span>
            {r.nota === null ? (
              <span style={{ fontSize: 13, color: '#475569' }}>Sin reportes con nota en estos días.</span>
            ) : (
              <div style={{ maxWidth: 420 }}>
                <TarjetaCalidadPropia datos={vistaEntrenadorDesde(c, equipo)} />
              </div>
            )}
          </div>
        )}
        {c.ejemplos.length === 0 ? (
          <span style={{ fontSize: 13, color: '#475569' }}>Ningún reporte flojo en los últimos {DIAS_RECIENTE} días.</span>
        ) : (
          <>
            <strong style={{ fontSize: 13, color: '#0f172a' }}>Reportes flojos (nota por debajo de {formatoNota(UMBRAL.rojo)}):</strong>
            {c.ejemplos.map((e) => {
              const id = String(e.reporte_id);
              const dev = devoluciones.get(id);
              return (
                <div key={id} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', background: '#fff', borderRadius: 10, padding: '6px 10px' }}>
                  <span style={{ fontWeight: 800, color: '#64748b', fontSize: 13 }}>{fechaCorta(e.fecha)}</span>
                  <span style={{ flex: '1 1 160px', minWidth: 0, fontWeight: 800, fontSize: 13.5, overflowWrap: 'anywhere' }}>
                    {e.alumno || 'Alumno'} <span style={{ color: '#dc2626' }}>· {formatoNota(e.nota)}</span>
                    {e.calidad.pocoDetallado && <span style={{ color: '#64748b', fontWeight: 600 }}> · todo «Lo consigue» y nada escrito</span>}
                  </span>
                  {dev?.completado_devolucion_at ? (
                    <span style={{ fontSize: 12.5, fontWeight: 900, color: '#166534' }}>✓ Completado tras devolverlo</span>
                  ) : dev ? (
                    <>
                      <span style={{ fontSize: 12.5, fontWeight: 900, color: '#c2410c' }}>↩️ Devuelto · esperando</span>
                      {!soloLectura && (
                        <button type="button" style={botonPeq} onClick={() => onAnular(id)}>
                          Anular
                        </button>
                      )}
                    </>
                  ) : (
                    !soloLectura && (
                      <button
                        type="button"
                        style={{ ...botonPeq, borderColor: '#fb923c', color: '#c2410c' }}
                        onClick={() => onDevolver(id, e.alumno || 'el alumno')}
                      >
                        ↩️ Devolver
                      </button>
                    )
                  )}
                  {e.alumno_id && (
                    <button type="button" onClick={() => abrirFichaAlumno(e.alumno_id)} style={botonPeq}>
                      Ficha
                    </button>
                  )}
                </div>
              );
            })}
          </>
        )}
      </div>
    </details>
  );
}

export function CalidadReportesPanel({ esVistaMovilApp, soloLectura = false }: { esVistaMovilApp?: boolean; soloLectura?: boolean }) {
  const [filas, setFilas] = React.useState<ReporteCoordinacion[] | null>(null);
  const [devueltos, setDevueltos] = React.useState<Map<string, EstadoDevolucion>>(new Map());
  const [puedeDevolver, setPuedeDevolver] = React.useState(false);
  const [error, setError] = React.useState('');
  const [aviso, setAviso] = React.useState('');
  const hoy = hoyMadrid();

  const cargarDevoluciones = React.useCallback(() => {
    cargarEstadoDevoluciones(sumarDiasIso(hoy, -(DIAS_RECIENTE + 7)))
      .then((lista) => {
        setDevueltos(new Map((lista || []).map((d) => [String(d.reporte_id), d])));
        setPuedeDevolver(true);
      })
      .catch(() => setPuedeDevolver(false)); // sin la migración: no se ofrece «Devolver»
  }, [hoy]);

  React.useEffect(() => {
    let vivo = true;
    // La función admite como mucho 31 días por consulta: se pide en dos tramos de 4 semanas.
    const mitad = (SEMANAS / 2) * 7;
    Promise.all([
      cargarReportesCoordinacion(sumarDiasIso(hoy, -(mitad - 1)), hoy),
      cargarReportesCoordinacion(sumarDiasIso(hoy, -(SEMANAS * 7 - 1)), sumarDiasIso(hoy, -mitad)),
    ])
      .then(([a, b]) => vivo && setFilas([...a, ...b]))
      .catch((e) => vivo && setError(e instanceof Error ? e.message : 'No se pudieron cargar los reportes.'));
    cargarDevoluciones();
    return () => {
      vivo = false;
    };
  }, [hoy, cargarDevoluciones]);

  const resultado = React.useMemo(() => (filas ? calidadPorEntrenador(filas, hoy) : []), [filas, hoy]);
  const equipo = React.useMemo(() => notaEquipoDe(resultado), [resultado]);

  async function devolver(reporteId: string, alumno: string) {
    const motivo = window.prompt(`Devolver el reporte de ${alumno} al entrenador.\n\n¿Qué le dices? (lo verá al abrir la app)`, MOTIVO_POR_DEFECTO);
    if (motivo === null) return;
    setAviso('');
    try {
      await devolverReporte(reporteId, motivo.trim() || MOTIVO_POR_DEFECTO);
      setAviso(`↩️ Reporte de ${alumno} devuelto. Le saldrá al entrenador para completarlo.`);
      cargarDevoluciones();
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'No se pudo devolver.');
    }
  }

  async function anular(reporteId: string) {
    if (!window.confirm('¿Anular la devolución? Al entrenador le dejará de salir.')) return;
    try {
      await anularDevolucion(reporteId);
      cargarDevoluciones();
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'No se pudo anular.');
    }
  }

  return (
    <section style={{ display: 'grid', gap: 10 }}>
      {error && <p style={{ margin: 0, color: '#b91c1c', fontWeight: 800 }}>{error}</p>}
      {aviso && (
        <p role="status" style={{ margin: 0, padding: '8px 12px', borderRadius: 10, background: '#fff7ed', color: '#9a3412', fontWeight: 800 }}>
          {aviso}
        </p>
      )}
      {!error && filas === null && <p style={{ margin: 0, color: '#475569' }}>Cargando reportes…</p>}
      {filas && resultado.length === 0 && <p style={{ margin: 0, color: '#475569' }}>No hay reportes en estas semanas.</p>}
      {filas && resultado.length > 0 && (() => {
        const hablar: CalidadEntrenador[] = resultado.filter((c: CalidadEntrenador) => c.fallos.length > 0 && (c.semaforo === 'rojo' || c.semaforo === 'amarillo'));
        return (
          <div style={{ padding: 14, borderRadius: 16, background: '#0f172a', color: '#fff', display: 'grid', gap: 8 }}>
            <strong style={{ fontSize: 16 }}>
              {hablar.length ? `🗣️ Con quién hablar (${hablar.length})` : '✓ Ahora mismo nadie destaca para mal'}
            </strong>
            {hablar.map((c) => (
              <div key={c.entrenador} style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                <span aria-hidden style={{ width: 10, height: 10, borderRadius: 999, background: COLOR[c.semaforo].punto, flex: '0 0 auto' }} />
                <b style={{ minWidth: 0 }}>
                  {c.entrenador} · {formatoNota(c.reciente.nota)}
                </b>
                <span style={{ color: '#cbd5e1', fontSize: 13, flex: '1 1 220px', minWidth: 0 }}>
                  {c.fallos[0]}
                  {c.fallos.length > 1 ? ` (+${c.fallos.length - 1} más)` : ''}
                </span>
              </div>
            ))}
          </div>
        );
      })()}
      {resultado.map((c) => (
        <Tarjeta
          key={c.entrenador}
          c={c}
          esMovil={esVistaMovilApp}
          soloLectura={soloLectura || !puedeDevolver}
          devoluciones={devueltos}
          onDevolver={(id, alumno) => void devolver(id, alumno)}
          onAnular={(id) => void anular(id)}
          equipo={equipo}
        />
      ))}
      <details style={{ padding: 12, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 900 }}>¿Cómo se mide?</summary>
        Cada reporte tiene una nota de 0 a 10: <b>detalle</b> (3,5 puntos: unas {LETRAS_POR_HABILIDAD} letras por cada habilidad que no le sale;
        si todo lo consigue, una frase), <b>concreto</b> (3: no marcar todo «Lo consigue» sin escribir nada), <b>a tiempo</b> (2,5: el mismo
        día o el siguiente; a los 2 días, la mitad; después, 0) y <b>personal</b> (1: no poner la misma valoración a todo el grupo). La nota del
        entrenador es la media de los últimos {DIAS_RECIENTE} días y <b>cada reporte sin hacer cuenta como un 0</b> (a partir de los 2 días de la
        sesión). <b>Verde</b> desde {formatoNota(UMBRAL.verde)}, <b>rojo</b> por debajo de {formatoNota(UMBRAL.rojo)}. <b>↓ Va a menos</b>: su nota
        baja {formatoNota(UMBRAL.bajada)} puntos o más respecto a las semanas anteriores. Con menos de {MINIMO_REPORTES} reportes no se pone color.
        Los entrenadores ven su propia nota y la media del equipo, nunca la de otros.
      </details>
    </section>
  );
}
