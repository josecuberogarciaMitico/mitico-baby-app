import React, { useEffect, useState } from 'react';
import './OperationalAnalysisScreen.css';
import {
  NOMBRES_DEFINICIONES,
  comoVamos,
  crecimientoTemporada,
  formatoNumero,
  formatoPct,
  mesesConActividad,
  nombreMes,
  resumenProgresiones,
  type Cambio,
  type MesAnalisis,
  type TramoAnalisis,
} from './analysisSummary';

type ModalidadAnalisisAdminApp = 'BABY' | 'OCIO' | 'INTENSIVOS';

type OperationalAnalysisScreenProps = {
  ctx: Record<string, any>;
};

const NOMBRE_MODALIDAD: Record<ModalidadAnalisisAdminApp, string> = {
  BABY: 'Baby',
  OCIO: 'Ocio',
  INTENSIVOS: 'Intensivos',
};

function hoyMadrid() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function haceCuanto(iso: string | undefined, ahora: number) {
  const t = iso ? new Date(iso).getTime() : NaN;
  if (!Number.isFinite(t)) return '';
  const min = Math.max(0, Math.round((ahora - t) / 60000));
  if (min < 1) return 'Actualizado ahora mismo';
  if (min < 60) return `Actualizado hace ${min} min`;
  const h = Math.round(min / 60);
  return `Actualizado hace ${h} h`;
}

function Flecha({ cambio }: { cambio: Cambio }) {
  if (!cambio.sentido) return null;
  const icono = cambio.sentido === 'sube' ? '▲' : cambio.sentido === 'baja' ? '▼' : '＝';
  return (
    <span className={`an-cambio an-cambio--${cambio.sentido}`}>
      <span aria-hidden="true">{icono}</span> {cambio.texto}
    </span>
  );
}

export function OperationalAnalysisScreen({ ctx }: OperationalAnalysisScreenProps) {
  const {
    analisisAdmin,
    cambiarModalidadAnalisisAdminApp,
    cambiarTemporadaAnalisisAdminApp,
    cargandoAnalisisAdmin,
    descargarCsvAnalisisAdminApp,
    descargarExcelAnalisisAdminApp,
    descargarPdfAnalisisAdminApp,
    errorAnalisisAdmin,
    esCoordinadorJefeApp,
    esVistaMovilApp,
    modalidadAnalisisAdmin,
    pantalla,
    recargarAnalisisAdminApp,
    renderAyudaRapidaPantallaApp,
    temporadaAnalisisAdminId,
  } = ctx;

  const [ahora, setAhora] = useState(() => Date.now());
  useEffect(() => {
    if (pantalla !== 'analisis') return;
    const id = window.setInterval(() => setAhora(Date.now()), 60000);
    return () => window.clearInterval(id);
  }, [pantalla]);

  if (pantalla !== 'analisis' || !esCoordinadorJefeApp) return null;

  const hoy = hoyMadrid();
  const mensual: MesAnalisis[] = analisisAdmin?.mensual || [];
  const meses = mesesConActividad(mensual, hoy);
  const tramo: TramoAnalisis | undefined = analisisAdmin?.tramo;
  const vamos = analisisAdmin ? comoVamos(mensual, tramo, hoy) : null;
  const crecimiento = analisisAdmin
    ? crecimientoTemporada(mensual, hoy, Number(analisisAdmin.resumen?.altas) || 0)
    : null;
  const niveles: Array<{ nivel: string; total: number }> = analisisAdmin?.niveles || [];
  const maxNivel = Math.max(1, ...niveles.map((n) => n.total));
  const prog = resumenProgresiones(analisisAdmin?.progresiones || []);
  const temporadas: any[] = analisisAdmin?.comparativa_temporadas || [];
  const continuidad = analisisAdmin?.resumen?.continuidad_pct;

  return (
    <article className="an-pantalla">
      <header className="an-cabecera">
        <div className="an-cabecera-texto">
          <span className="an-etiqueta">Dirección · Análisis</span>
          <h2>Análisis</h2>
          {renderAyudaRapidaPantallaApp()}
          <p>
            {analisisAdmin
              ? `${NOMBRE_MODALIDAD[analisisAdmin.meta.modalidad as ModalidadAnalisisAdminApp] || analisisAdmin.meta.modalidad} · temporada ${analisisAdmin.meta.temporada}`
              : 'Cómo crece la escuela, con los datos reales de la app.'}
            {analisisAdmin && (
              <span className="an-actualizado"> · {haceCuanto(analisisAdmin.meta.generado_at, ahora)}</span>
            )}
          </p>
        </div>
        <div className="an-cabecera-acciones">
          <button
            type="button"
            className="an-boton an-boton--claro"
            disabled={cargandoAnalisisAdmin}
            onClick={() => recargarAnalisisAdminApp()}
          >
            {cargandoAnalisisAdmin ? 'Actualizando…' : '↻ Actualizar'}
          </button>
          <details className="an-exportar">
            <summary className="an-boton an-boton--blanco">Exportar ▾</summary>
            <div className="an-exportar-menu">
              <button type="button" disabled={!analisisAdmin} onClick={descargarPdfAnalisisAdminApp}>PDF</button>
              <button type="button" disabled={!analisisAdmin} onClick={descargarExcelAnalisisAdminApp}>Excel</button>
              <button type="button" disabled={!analisisAdmin} onClick={descargarCsvAnalisisAdminApp}>CSV</button>
            </div>
          </details>
        </div>
      </header>

      <div className="an-filtros">
        <div className="an-modalidades" role="group" aria-label="Modalidad">
          {(['BABY', 'OCIO', 'INTENSIVOS'] as ModalidadAnalisisAdminApp[]).map((m) => (
            <button
              key={m}
              type="button"
              disabled={cargandoAnalisisAdmin}
              className={`an-pastilla ${modalidadAnalisisAdmin === m ? 'is-activa' : ''}`}
              onClick={() => cambiarModalidadAnalisisAdminApp(m)}
            >
              {NOMBRE_MODALIDAD[m]}
            </button>
          ))}
        </div>
        {temporadas.length >= 2 && (
          <label className="an-temporada">
            Temporada
            <select
              value={temporadaAnalisisAdminId}
              disabled={cargandoAnalisisAdmin}
              onChange={(e) => cambiarTemporadaAnalisisAdminApp(e.target.value)}
            >
              {temporadas.map((t) => (
                <option key={t.temporada_id} value={t.temporada_id}>
                  {t.temporada}{t.activa ? ' · actual' : ''}
                </option>
              ))}
            </select>
          </label>
        )}
      </div>

      {cargandoAnalisisAdmin && !analisisAdmin && <div className="an-aviso">Calculando con los datos de hoy…</div>}
      {errorAnalisisAdmin && (
        <div className="an-error">
          {errorAnalisisAdmin}
          {analisisAdmin ? ' Se siguen mostrando los últimos datos cargados.' : ''}
        </div>
      )}

      {analisisAdmin && (
        <>
          {crecimiento && (
            <section className="an-bloque an-crecimiento">
              <div className="an-crecimiento-texto">
                <h3>Crecimiento de la temporada</h3>
                {crecimiento.barras.length > 1 ? (
                  <p className="an-titular">
                    De <strong>{crecimiento.desde}</strong> niños con clase en {nombreMes(crecimiento.desdeMes, true)} a{' '}
                    <strong>{crecimiento.hasta}</strong> en {nombreMes(crecimiento.hastaMes, true)}
                    {crecimiento.barras[crecimiento.barras.length - 1].enCurso ? ' (y el mes aún no ha acabado)' : ''}.
                  </p>
                ) : (
                  <p className="an-titular">
                    <strong>{crecimiento.hasta}</strong> niños con clase en {nombreMes(crecimiento.hastaMes, true)}.
                  </p>
                )}
                <div className="an-crecimiento-cifras">
                  {crecimiento.cambio.sentido && (
                    <div>
                      <span>Crecimiento</span>
                      <Flecha cambio={crecimiento.cambio} />
                    </div>
                  )}
                  <div>
                    <span>Altas esta temporada</span>
                    <strong>{crecimiento.altasTemporada}</strong>
                  </div>
                  {typeof continuidad === 'number' && (
                    <div>
                      <span>Siguen de un mes a otro</span>
                      <strong>{formatoPct(continuidad)}</strong>
                    </div>
                  )}
                </div>
              </div>
              <div className="an-barras" aria-label="Niños con clase por mes">
                {crecimiento.barras.map((b) => (
                  <div key={b.mes} className={`an-barra ${b.enCurso ? 'is-en-curso' : ''}`}>
                    <span className="an-barra-valor">{b.valor}</span>
                    <div className="an-barra-columna">
                      <div style={{ height: `${b.alto}%` }} />
                    </div>
                    <span className="an-barra-mes">{b.etiqueta}{b.enCurso ? '*' : ''}</span>
                  </div>
                ))}
              </div>
              {crecimiento.barras.some((b) => b.enCurso) && (
                <p className="an-nota">* Mes en curso: cuenta hasta hoy.</p>
              )}
            </section>
          )}

          {vamos && (
            <section className="an-bloque">
              <h3>Cómo vamos · {vamos.titulo}</h3>
              <p className="an-subtitulo">{vamos.subtitulo}</p>
              <div className="an-indicadores">
                {vamos.indicadores.map((ind) => (
                  <div key={ind.clave} className="an-indicador">
                    <span className="an-indicador-titulo">{ind.titulo}</span>
                    <strong>{ind.valor}</strong>
                    <Flecha cambio={ind.cambio} />
                    <span className="an-indicador-ayuda">{ind.ayuda}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {meses.length > 0 && (
            <section className="an-bloque">
              <h3>Evolución por mes</h3>
              {esVistaMovilApp ? (
                <div className="an-meses-tarjetas">
                  {meses.map((m) => (
                    <div key={m.mes} className="an-mes-tarjeta">
                      <strong>
                        {nombreMes(m.mes, true)}
                        {(m.en_curso ?? m.mes === hoy.slice(0, 7)) && <span className="an-en-curso">en curso</span>}
                      </strong>
                      <dl>
                        <dt>Niños con clase</dt><dd>{m.alumnos_unicos}</dd>
                        <dt>Altas</dt><dd>{m.altas}</dd>
                        <dt>Asistencia</dt><dd>{formatoPct(m.asistencia_real_pct)}</dd>
                        <dt>Ocupación</dt><dd>{formatoPct(m.ocupacion_pct)}</dd>
                        <dt>Niños por grupo</dt><dd>{formatoNumero(m.promedio_por_grupo, 1)}</dd>
                        <dt>Sesiones</dt><dd>{m.sesiones_realizadas}</dd>
                      </dl>
                    </div>
                  ))}
                </div>
              ) : (
                <table className="an-tabla">
                  <thead>
                    <tr>
                      <th>Mes</th><th>Niños con clase</th><th>Altas</th><th>Asistencia</th>
                      <th>Ocupación</th><th>Niños por grupo</th><th>Sesiones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meses.map((m) => (
                      <tr key={m.mes}>
                        <td>
                          {nombreMes(m.mes, true)}
                          {(m.en_curso ?? m.mes === hoy.slice(0, 7)) && <span className="an-en-curso">en curso</span>}
                        </td>
                        <td>{m.alumnos_unicos}</td>
                        <td>{m.altas}</td>
                        <td>{formatoPct(m.asistencia_real_pct)}</td>
                        <td>{formatoPct(m.ocupacion_pct)}</td>
                        <td>{formatoNumero(m.promedio_por_grupo, 1)}</td>
                        <td>{m.sesiones_realizadas}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </section>
          )}

          <section className="an-bloque an-niveles">
            <div>
              <h3>Niveles</h3>
              {niveles.length === 0 ? (
                <p className="an-subtitulo">Sin datos de nivel todavía.</p>
              ) : (
                <div className="an-niveles-lista">
                  {niveles.map((n) => (
                    <div key={n.nivel} className="an-nivel">
                      <span>{n.nivel}</span>
                      <div className="an-nivel-barra"><div style={{ width: `${Math.max(4, (n.total / maxNivel) * 100)}%` }} /></div>
                      <strong>{n.total}</strong>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div>
              <h3>Cambios de nivel en la temporada</h3>
              <div className="an-progreso-cifras">
                <div className="an-progreso an-progreso--sube"><strong>{prog.totalSuben}</strong><span>suben</span></div>
                <div className="an-progreso"><strong>{prog.seMantienen}</strong><span>se mantienen</span></div>
                <div className="an-progreso an-progreso--baja"><strong>{prog.totalBajan}</strong><span>bajan</span></div>
              </div>
              {prog.suben.length > 0 && (
                <ul className="an-progreso-lista">
                  {prog.suben.slice(0, 8).map((p) => (
                    <li key={`s-${p.desde}-${p.hasta}`}><span>{p.desde} → {p.hasta}</span><span className="an-cambio an-cambio--sube">▲ {p.total}</span></li>
                  ))}
                  {prog.bajan.slice(0, 4).map((p) => (
                    <li key={`b-${p.desde}-${p.hasta}`}><span>{p.desde} → {p.hasta}</span><span className="an-cambio an-cambio--baja">▼ {p.total}</span></li>
                  ))}
                </ul>
              )}
              <p className="an-nota">Según el primer y el último nivel que han puesto los entrenadores en los reportes.</p>
            </div>
          </section>

          <details className="an-bloque an-detalle">
            <summary>Más detalle</summary>
            {meses.length > 0 && (
              <div className="an-tabla-scroll">
                <table className="an-tabla an-tabla--completa">
                  <thead>
                    <tr>
                      <th>Mes</th><th>Niños</th><th>Altas</th><th>Siguen del mes anterior</th>
                      <th>Asistencia</th><th>Niños por turno</th><th>Por grupo</th><th>Sesiones</th><th>Ocupación</th><th>Evolución técnica</th>
                    </tr>
                  </thead>
                  <tbody>
                    {meses.map((m) => (
                      <tr key={m.mes}>
                        <td>{nombreMes(m.mes, true)}</td>
                        <td>{m.alumnos_unicos}</td>
                        <td>{m.altas}</td>
                        <td>{formatoPct(m.continuidad_pct)}</td>
                        <td>{formatoPct(m.asistencia_real_pct)}</td>
                        <td>{formatoNumero(m.promedio_ninos_turno, 1)}</td>
                        <td>{formatoNumero(m.promedio_por_grupo, 1)}</td>
                        <td>{m.sesiones_realizadas}</td>
                        <td>{formatoPct(m.ocupacion_pct)}</td>
                        <td>{formatoNumero(m.evolucion_tecnica, 2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <p className="an-nota">
              Toda la temporada: {analisisAdmin.resumen.alumnos_unicos} niños (contando altas que aún no han venido),{' '}
              {analisisAdmin.resumen.sesiones_realizadas} sesiones, asistencia {formatoPct(analisisAdmin.resumen.asistencia_real_pct)}.
            </p>

            {temporadas.length >= 2 && (
              <>
                <h4>Comparación entre temporadas</h4>
                <div className="an-tabla-scroll">
                  <table className="an-tabla">
                    <thead>
                      <tr><th>Temporada</th><th>Niños</th><th>Sesiones</th><th>Asistencia</th><th>Evolución técnica</th></tr>
                    </thead>
                    <tbody>
                      {temporadas.map((t) => (
                        <tr key={t.temporada_id}>
                          <td>{t.temporada}{t.activa ? ' · actual' : ''}</td>
                          <td>{t.alumnos_unicos}</td>
                          <td>{t.sesiones_realizadas}</td>
                          <td>{formatoPct(t.asistencia_real_pct)}</td>
                          <td>{formatoNumero(t.evolucion_tecnica, 2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            <h4>Cómo se calcula</h4>
            <div className="an-definiciones">
              {Object.entries(analisisAdmin.definiciones || {}).map(([clave, texto]) => (
                <p key={clave}>
                  <strong>{NOMBRES_DEFINICIONES[clave] || clave.replace(/_/g, ' ')}:</strong> {String(texto ?? '')}
                </p>
              ))}
            </div>
          </details>
        </>
      )}
    </article>
  );
}
