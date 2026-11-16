import React from 'react';
import { cargarReportesCoordinacion, type ReporteCoordinacion } from '../../services/reports/coordinationReportsService';
import { abrirFichaAlumno } from '../students/studentFichaStore';
import { sumarDiasIso } from './reportsReviewLogic';
import { calidadPorEntrenador, DIAS_RECIENTE, MINIMO_REPORTES, type CalidadEntrenador, type Semaforo } from './calidadReportes';

// Calidad de reportes por entrenador (17/11/2026). Mira las últimas 8 semanas:
// lo reciente (14 días) con semáforo y lo de antes para ver si alguien va a menos.

const SEMANAS = 8;

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

function Tarjeta({ c, esMovil }: { c: CalidadEntrenador; esMovil?: boolean; key?: string }) {
  const color = COLOR[c.semaforo];
  const r = c.reciente;
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
            [`${r.reportes}`, 'reportes (14 días)'],
            [`${r.pocoDetallados}${r.reportes ? ` · ${r.pctPocoDetallados}%` : ''}`, 'poco detallados'],
            [`${r.letrasMedia}`, 'letras escritas de media'],
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
            ? `Antes (semanas previas): ${c.anterior.reportes} reportes · ${c.anterior.letrasMedia} letras de media · ${c.anterior.pctPocoDetallados}% poco detallados`
            : 'Sin reportes de las semanas anteriores para comparar.'}
        </span>
      </summary>
      <div style={{ padding: '0 14px 12px', display: 'grid', gap: 6 }}>
        {c.ejemplos.length === 0 ? (
          <span style={{ fontSize: 13, color: '#475569' }}>Ningún reporte poco detallado en los últimos {DIAS_RECIENTE} días.</span>
        ) : (
          <>
            <strong style={{ fontSize: 13, color: '#0f172a' }}>Reportes poco detallados (todo «Lo consigue» y nada escrito):</strong>
            {c.ejemplos.map((e) => (
              <div key={String(e.reporte_id)} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', background: '#fff', borderRadius: 10, padding: '6px 10px' }}>
                <span style={{ fontWeight: 800, color: '#64748b', fontSize: 13 }}>{fechaCorta(e.fecha)}</span>
                <span style={{ flex: '1 1 160px', minWidth: 0, fontWeight: 800, fontSize: 13.5, overflowWrap: 'anywhere' }}>{e.alumno || 'Alumno'}</span>
                {e.alumno_id && (
                  <button
                    type="button"
                    onClick={() => abrirFichaAlumno(e.alumno_id)}
                    style={{ minHeight: 34, padding: '4px 12px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 800, cursor: 'pointer' }}
                  >
                    Ficha
                  </button>
                )}
              </div>
            ))}
          </>
        )}
      </div>
    </details>
  );
}

export function CalidadReportesPanel({ esVistaMovilApp }: { esVistaMovilApp?: boolean }) {
  const [filas, setFilas] = React.useState<ReporteCoordinacion[] | null>(null);
  const [error, setError] = React.useState('');
  const hoy = hoyMadrid();

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
    return () => {
      vivo = false;
    };
  }, [hoy]);

  const resultado = React.useMemo(() => (filas ? calidadPorEntrenador(filas, hoy) : []), [filas, hoy]);

  return (
    <section style={{ display: 'grid', gap: 10 }}>
      {error && <p style={{ margin: 0, color: '#b91c1c', fontWeight: 800 }}>{error}</p>}
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
                <b style={{ minWidth: 0 }}>{c.entrenador}</b>
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
        <Tarjeta key={c.entrenador} c={c} esMovil={esVistaMovilApp} />
      ))}
      <details style={{ padding: 12, borderRadius: 14, background: '#f8fafc', border: '1px solid #e2e8f0', fontSize: 13, color: '#334155', lineHeight: 1.45 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 900 }}>¿Cómo se mide?</summary>
        Últimos {DIAS_RECIENTE} días frente a las semanas anteriores (hasta {SEMANAS} semanas). Un reporte es{' '}
        <b>poco detallado</b> si marca todo «Lo consigue» y no tiene nada escrito: puede proponer subir de nivel sin pruebas.{' '}
        <b>Rojo</b>: 30% o más poco detallados, o menos de 30 letras de media. <b>Amarillo</b>: 15% o más poco detallados, menos de 80 letras,
        el 40% o más rellenados dos días o más tarde, la misma valoración a todo el grupo en el 20% o más, o 3 reportes sin hacer.{' '}
        <b>↓ Va a menos</b>: escribe la mitad o menos que antes. Con menos de {MINIMO_REPORTES} reportes no se pone color.
      </details>
    </section>
  );
}
