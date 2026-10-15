import React from 'react';
import { abrirFichaAlumno } from '../students/studentFichaStore';
import { RawStudentDump } from '../reports/RawStudentDump';
import { textoBrutoAlumno } from '../../core/reports/rawStudentExport';

type FiltroDiaEvaluacionesOcioApp = 'Todos' | 'Jueves' | 'Sábado' | 'Domingo';

type OcioEvaluationsScreenProps = {
  ctx: Record<string, any>;
};

export function OcioEvaluationsScreen({ ctx }: OcioEvaluationsScreenProps) {
  const {
    abrirPantallaConScroll,
    agendaBloqueBlanco,
    agendaCabeceraLinea,
    avisoCompleto,
    avisoNeutral,
    botonPrincipal,
    botonSecundario,
    busquedaEvaluacionAnualOcio,
    cargando,
    cargarEvaluacionesAnualesOcio,
    cargarHistorialReportesAlumnoFichaApp,
    compactLevelJourney,
    cortesEvaluacionOcio,
    cortesEvaluacionOcioCargando,
    cortesEvaluacionOcioError,
    dailyWorkObjectives,
    descargarEvaluacionesAnualesOcio,
    edadAproximadaOcio,
    errorCaja,
    esCoordinadorJefeApp,
    esVistaMovilApp,
    etiquetaSuperior,
    evaluacionOcioIndividualSeleccionadoId,
    evaluacionesAnualesOcio,
    evaluacionesAnualesOcioCargando,
    evaluacionesAnualesOcioError,
    evaluacionesAnualesOcioGeneradas,
    filasEvaluacionTemporadaOcioApp,
    filtroDiaEvaluacionesOcio,
    formatearFecha,
    guardandoCorteEvaluacionOcio,
    guardarCorteEvaluacionOcio,
    historialAlumnoAbiertoId,
    historialReportesFichaCargandoId,
    historialReportesFichaPorAlumno,
    inputCampo,
    labelCampo,
    miniBadge,
    miniTarjetaBlanca,
    ocioAlumnos,
    pantalla,
    renderAyudaRapidaPantallaApp,
    reportedImprovements,
    resumenEvaluacionTecnica,
    selectCampo,
    setBusquedaEvaluacionAnualOcio,
    setEvaluacionOcioIndividualSeleccionadoId,
    setFiltroDiaEvaluacionesOcio,
  } = ctx;

  return (
    <>
      {pantalla === 'ocioEvaluaciones' && esCoordinadorJefeApp && (() => {
        const termino = busquedaEvaluacionAnualOcio.trim().toLowerCase();
        const filasBase = filasEvaluacionTemporadaOcioApp();
        const filasVisibles = termino
          ? filasBase.filter(({ alumno, evaluacion }) =>
              `${alumno.alumno} ${alumno.dia_fijo || alumno.grupo_dia || ''} ${
                evaluacion?.nivel_inicial || alumno.nivel_usado || ''
              } ${evaluacion?.nivel_final || ''} ${evaluacion?.autonomia_final || ''}`
                .toLowerCase()
                .includes(termino)
            )
          : filasBase;
        const temporada = evaluacionesAnualesOcio[0]?.temporada || 'Temporada activa';
        const navidadGuardadas = cortesEvaluacionOcio.filter(
          (fila) => fila.corte === 'NAVIDAD'
        ).length;
        const finalGuardadas = cortesEvaluacionOcio.filter(
          (fila) => fila.corte === 'FINAL'
        ).length;
        const alumnoIndividual = ocioAlumnos.find(
          (alumno) => alumno.alumno_id === evaluacionOcioIndividualSeleccionadoId
        );
        const edadAlumnoIndividual = alumnoIndividual
          ? edadAproximadaOcio(alumnoIndividual.fecha_nacimiento)
          : null;

        return (
          <section style={{ display: 'grid', gap: 16 }}>
            <article
              style={{
                borderRadius: 24,
                padding: 20,
                background:
                  'linear-gradient(135deg, #062d3f 0%, #083b4d 58%, #0b5d4f 100%)',
                border: '1px solid rgba(16,185,129,0.28)',
                boxShadow: '0 18px 44px rgba(15,23,42,0.16)',
                color: '#ffffff',
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: '#86efac',
                  fontSize: 11,
                  fontWeight: 950,
                  letterSpacing: '.12em',
                }}
              >
                OCIO · EVALUACIONES
              </p>
              <h2 style={{ margin: '5px 0 0', color: '#fff', fontSize: 30 }}>
                Evaluaciones Ocio
              </h2>
              {renderAyudaRapidaPantallaApp()}
              <p style={{ margin: '8px 0 0', color: '#cbd5e1', lineHeight: 1.45 }}>
                Evaluación puntual cuando una familia la pide y campañas de Navidad y final. En cada alumno: «Carta para la familia» (PDF) y «Todo en bruto» (para ChatGPT). Nada se guarda automáticamente.
              </p>
              <div style={{ marginTop: 14 }}>
                <button
                  type="button"
                  onClick={() => abrirPantallaConScroll('ocioGrupos')}
                  style={{
                    ...botonSecundario,
                    background: '#ffffff',
                    color: '#064e3b',
                    borderColor: '#ffffff',
                  }}
                >
                  Volver a grupos Ocio
                </button>
              </div>
            </article>

            <article style={agendaBloqueBlanco}>
              <div style={agendaCabeceraLinea}>
                <div>
                  <p style={{ ...etiquetaSuperior, color: '#0f766e', margin: '0 0 3px' }}>
                    EVALUACIÓN INDIVIDUAL PUNTUAL
                  </p>
                  <h3 style={{ margin: 0 }}>Una familia te pide una evaluación ahora</h3>
                  <p style={{ margin: '5px 0 0', color: '#64748b' }}>
                    Elige al alumno: «Carta para la familia» abre su ficha con la carta en PDF y «Todo en bruto» saca todo lo registrado para pegarlo en ChatGPT.
                  </p>
                </div>
              </div>

              {/* 15/10: solo dos opciones, iguales en toda la app: la carta (en su ficha) y todo en bruto. */}
              <label style={{ ...labelCampo, display: 'block', marginTop: 14 }}>
                Alumno Ocio
                <select
                  value={evaluacionOcioIndividualSeleccionadoId}
                  onChange={(e) => setEvaluacionOcioIndividualSeleccionadoId(e.target.value)}
                  style={selectCampo}
                >
                  <option value="">Seleccionar alumno...</option>
                  {[...ocioAlumnos]
                    .sort((a, b) => (a.alumno || '').localeCompare(b.alumno || ''))
                    .map((alumno) => (
                      <option key={`eval-ind-${alumno.alumno_id}`} value={alumno.alumno_id}>
                        {alumno.alumno}
                        {edadAproximadaOcio(alumno.fecha_nacimiento) !== null
                          ? ` · ${edadAproximadaOcio(alumno.fecha_nacimiento)} años`
                          : ''}
                        {' · '}{alumno.nivel_usado || alumno.nivel || 'Sin nivel'}
                        {' · '}{alumno.dia_fijo || alumno.grupo_dia || 'Sin día'}
                      </option>
                    ))}
                </select>
              </label>

              {alumnoIndividual && (
                <div style={{ ...miniTarjetaBlanca, marginTop: 12, display: 'grid', gap: 10 }}>
                  <div>
                    <strong>{alumnoIndividual.alumno}</strong>
                    <span style={{ display: 'block', marginTop: 4, color: '#64748b' }}>
                      {edadAlumnoIndividual !== null ? `${edadAlumnoIndividual} años · ` : ''}
                      Nivel {alumnoIndividual.nivel_usado || alumnoIndividual.nivel || '-'} ·{' '}
                      {alumnoIndividual.dia_fijo || alumnoIndividual.grupo_dia || 'Sin día fijo'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => abrirFichaAlumno(alumnoIndividual.alumno_id)}
                      style={botonSecundario}
                    >
                      ✉️ Carta para la familia (en su ficha)
                    </button>
                  </div>
                  <RawStudentDump
                    key={alumnoIndividual.alumno_id}
                    construir={async () =>
                      textoBrutoAlumno({
                        alumno: alumnoIndividual.alumno,
                        edad: edadAlumnoIndividual,
                        nivelFicha: alumnoIndividual.nivel_usado || alumnoIndividual.nivel || null,
                        reportes: await cargarHistorialReportesAlumnoFichaApp(alumnoIndividual.alumno_id, true),
                        formatDate: formatearFecha,
                      })
                    }
                  />
                </div>
              )}
            </article>

            <article style={agendaBloqueBlanco}>
              <div style={agendaCabeceraLinea}>
                <div>
                  <p style={{ ...etiquetaSuperior, color: '#7e22ce', margin: '0 0 3px' }}>
                    EVALUACIONES DE TEMPORADA
                  </p>
                  <h3 style={{ margin: 0 }}>Navidad y final de temporada</h3>
                  <p style={{ margin: '5px 0 0', color: '#64748b' }}>
                    El filtro por día es solo de gestión. La consulta anual se hace una vez al pulsar Generar / actualizar y después se filtra en memoria.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={cargarEvaluacionesAnualesOcio}
                  disabled={evaluacionesAnualesOcioCargando}
                  style={{
                    ...botonPrincipal,
                    minHeight: 46,
                    opacity: evaluacionesAnualesOcioCargando ? 0.65 : 1,
                  }}
                >
                  {evaluacionesAnualesOcioCargando
                    ? 'Generando...'
                    : evaluacionesAnualesOcioGeneradas
                    ? 'Actualizar evaluaciones'
                    : 'Generar evaluaciones'}
                </button>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
                  gap: 8,
                  marginTop: 14,
                }}
              >
                {(['Todos', 'Jueves', 'Sábado', 'Domingo'] as FiltroDiaEvaluacionesOcioApp[]).map(
                  (dia) => {
                    const activo = filtroDiaEvaluacionesOcio === dia;
                    return (
                      <button
                        key={`filtro-eval-${dia}`}
                        type="button"
                        onClick={() => setFiltroDiaEvaluacionesOcio(dia)}
                        style={{
                          minHeight: 42,
                          padding: '9px 10px',
                          borderRadius: 13,
                          border: activo ? '1px solid #7c3aed' : '1px solid #e2e8f0',
                          background: activo ? '#7c3aed' : '#ffffff',
                          color: activo ? '#ffffff' : '#475569',
                          fontWeight: 900,
                          cursor: 'pointer',
                        }}
                      >
                        {dia}
                      </button>
                    );
                  }
                )}
              </div>

              {evaluacionesAnualesOcioError && (
                <div style={{ ...errorCaja, marginTop: 12 }}>{evaluacionesAnualesOcioError}</div>
              )}
              {cortesEvaluacionOcioError && (
                <div style={{ ...errorCaja, marginTop: 12 }}>{cortesEvaluacionOcioError}</div>
              )}

              {evaluacionesAnualesOcioGeneradas && (
                <>
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: esVistaMovilApp
                        ? 'minmax(0, 1fr)'
                        : 'minmax(0, 1fr) repeat(3, minmax(155px, auto))',
                      gap: 10,
                      alignItems: 'end',
                      marginTop: 14,
                    }}
                  >
                    <label style={labelCampo}>
                      Buscar alumno
                      <input
                        value={busquedaEvaluacionAnualOcio}
                        onChange={(e) => setBusquedaEvaluacionAnualOcio(e.target.value)}
                        placeholder="Nombre, nivel, autonomía..."
                        style={inputCampo}
                      />
                    </label>
                    <button
                      type="button"
                      onClick={descargarEvaluacionesAnualesOcio}
                      style={{ ...botonSecundario, minHeight: 46 }}
                    >
                      Descargar {filtroDiaEvaluacionesOcio}
                    </button>
                    <button
                      type="button"
                      onClick={() => guardarCorteEvaluacionOcio('NAVIDAD')}
                      disabled={Boolean(guardandoCorteEvaluacionOcio)}
                      style={{
                        ...botonPrincipal,
                        minHeight: 46,
                        background: '#2563eb',
                        opacity: guardandoCorteEvaluacionOcio ? 0.6 : 1,
                      }}
                    >
                      {guardandoCorteEvaluacionOcio === 'NAVIDAD'
                        ? 'Guardando...'
                        : 'Guardar corte Navidad'}
                    </button>
                    <button
                      type="button"
                      onClick={() => guardarCorteEvaluacionOcio('FINAL')}
                      disabled={Boolean(guardandoCorteEvaluacionOcio)}
                      style={{
                        ...botonPrincipal,
                        minHeight: 46,
                        background: '#0f766e',
                        opacity: guardandoCorteEvaluacionOcio ? 0.6 : 1,
                      }}
                    >
                      {guardandoCorteEvaluacionOcio === 'FINAL'
                        ? 'Guardando...'
                        : 'Guardar corte Final'}
                    </button>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: esVistaMovilApp
                        ? 'repeat(2, minmax(0, 1fr))'
                        : 'repeat(4, minmax(0, 1fr))',
                      gap: 10,
                      marginTop: 12,
                    }}
                  >
                    <div style={miniTarjetaBlanca}>
                      <span style={{ color: '#64748b', fontSize: 12, fontWeight: 900 }}>
                        FILTRO
                      </span>
                      <strong style={{ display: 'block', marginTop: 5 }}>
                        {filtroDiaEvaluacionesOcio}
                      </strong>
                    </div>
                    <div style={miniTarjetaBlanca}>
                      <span style={{ color: '#64748b', fontSize: 12, fontWeight: 900 }}>
                        ALUMNOS VISIBLES
                      </span>
                      <strong style={{ display: 'block', marginTop: 5, fontSize: 24 }}>
                        {filasVisibles.length}
                      </strong>
                    </div>
                    <div style={miniTarjetaBlanca}>
                      <span style={{ color: '#64748b', fontSize: 12, fontWeight: 900 }}>
                        NAVIDAD
                      </span>
                      <strong style={{ display: 'block', marginTop: 5 }}>
                        {cortesEvaluacionOcioCargando ? '...' : `${navidadGuardadas} guardadas`}
                      </strong>
                    </div>
                    <div style={miniTarjetaBlanca}>
                      <span style={{ color: '#64748b', fontSize: 12, fontWeight: 900 }}>
                        FINAL
                      </span>
                      <strong style={{ display: 'block', marginTop: 5 }}>
                        {cortesEvaluacionOcioCargando ? '...' : `${finalGuardadas} guardadas`}
                      </strong>
                    </div>
                  </div>

                  <p style={{ margin: '12px 0 0', color: '#64748b', fontSize: 13 }}>
                    {temporada} · Los cortes guardan todos los alumnos Ocio y conservan el día que tenían en ese momento.
                  </p>

                  <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                    {filasVisibles.length === 0 ? (
                      <div style={avisoNeutral}>No hay alumnos en este filtro.</div>
                    ) : (
                      filasVisibles.map(({ alumno, evaluacion }) => (
                        <details
                          key={`evaluacion-temporada-ocio-${alumno.alumno_id}`}
                          style={{
                            overflow: 'hidden',
                            border: '1px solid #e2e8f0',
                            borderRadius: 16,
                            background: '#fff',
                          }}
                        >
                          <summary
                            style={{
                              listStyle: 'none',
                              cursor: 'pointer',
                              display: 'grid',
                              gridTemplateColumns: 'minmax(0, 1fr) auto',
                              gap: 10,
                              alignItems: 'center',
                              padding: '12px 14px',
                              background: '#fafafa',
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ overflowWrap: 'anywhere' }}>{alumno.alumno}</strong>
                              <span style={{ display: 'block', marginTop: 3, color: '#64748b', fontSize: 13 }}>
                                {alumno.dia_fijo || alumno.grupo_dia || 'Sin día fijo'} ·{' '}
                                {edadAproximadaOcio(alumno.fecha_nacimiento) !== null
                                  ? `${edadAproximadaOcio(alumno.fecha_nacimiento)} años · `
                                  : ''}
                                {evaluacion
                                  ? `Nivel ${evaluacion.nivel_inicial || '-'} → ${
                                      evaluacion.nivel_final || '-'
                                    } · ${evaluacion.entrenamientos_ocio} entrenos · ${
                                      evaluacion.reportes_ocio
                                    } reportes`
                                  : 'Sin reportes Ocio todavía'}
                              </span>
                            </div>
                            <span
                              style={{
                                color: evaluacion ? '#7e22ce' : '#f97316',
                                fontWeight: 900,
                              }}
                            >
                              {evaluacion ? 'Ver evolución' : 'Sin datos'}
                            </span>
                          </summary>

                          {evaluacion ? (
                            <div style={{ padding: 14 }}>
                              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 10 }}>
                                <button
                                  type="button"
                                  onClick={() => abrirFichaAlumno(alumno.alumno_id)}
                                  style={{
                                    ...botonPrincipal,
                                    minHeight: 42,
                                    background: '#0f9f4d',
                                    borderColor: '#0f9f4d',
                                  }}
                                >
                                  ✉️ Carta para la familia (en su ficha)
                                </button>
                              </div>
                              {/* 15/10: todo lo registrado del alumno, sin resumir, para ChatGPT. */}
                              <div style={{ marginBottom: 10 }}>
                                <RawStudentDump
                                  construir={async () =>
                                    textoBrutoAlumno({
                                      alumno: alumno.alumno,
                                      edad: edadAproximadaOcio(alumno.fecha_nacimiento),
                                      nivelFicha: evaluacion.nivel_final || alumno.nivel_usado || null,
                                      reportes: await cargarHistorialReportesAlumnoFichaApp(alumno.alumno_id, true),
                                      formatDate: formatearFecha,
                                      extra: { titulo: 'Datos de la temporada de Ocio', datos: evaluacion },
                                    })
                                  }
                                />
                              </div>
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns:
                                    'repeat(auto-fit, minmax(min(100%, 210px), 1fr))',
                                  gap: 10,
                                }}
                              >
                                <div style={miniTarjetaBlanca}>
                                  <strong>Progresión de nivel</strong>
                                  <p style={{ margin: '6px 0 0', color: '#475569' }}>
                                    {compactLevelJourney(
                                      evaluacion.niveles_reportados
                                    ) || `${evaluacion.nivel_inicial || '-'} → ${evaluacion.nivel_final || '-'}`}
                                  </p>
                                </div>
                                <div style={miniTarjetaBlanca}>
                                  <strong>Técnica</strong>
                                  <p style={{ margin: '6px 0 0', color: '#475569' }}>
                                    {evaluacion.tecnica_inicial || '-'} → {evaluacion.tecnica_final || '-'}
                                  </p>
                                </div>
                                <div style={miniTarjetaBlanca}>
                                  <strong>Autonomía</strong>
                                  <p style={{ margin: '6px 0 0', color: '#475569' }}>
                                    {evaluacion.autonomia_inicial || '-'} → {evaluacion.autonomia_final || '-'}
                                  </p>
                                </div>
                                <div style={miniTarjetaBlanca}>
                                  <strong>Remontes corte</strong>
                                  <p style={{ margin: '6px 0 0', color: '#475569' }}>
                                    {(evaluacion.remontes_finales || []).join(', ') || '-'}
                                  </p>
                                </div>
                                <div style={miniTarjetaBlanca}>
                                  <strong>Actitud corte</strong>
                                  <p style={{ margin: '6px 0 0', color: '#475569' }}>
                                    {evaluacion.actitud_final || '-'}
                                  </p>
                                </div>
                                <div style={miniTarjetaBlanca}>
                                  <strong>Último reporte</strong>
                                  <p style={{ margin: '6px 0 0', color: '#475569' }}>
                                    {evaluacion.ultimo_reporte_fecha
                                      ? formatearFecha(evaluacion.ultimo_reporte_fecha)
                                      : '-'}
                                  </p>
                                </div>
                                <div style={miniTarjetaBlanca}>
                                  <strong>Asistencia</strong>
                                  <p style={{ margin: '6px 0 0', color: '#475569' }}>
                                    {evaluacion.sesiones_ocio_programadas > 0
                                      ? `${evaluacion.entrenamientos_ocio}/${evaluacion.sesiones_ocio_programadas} · ${Math.round(Number(evaluacion.asistencia_ocio_pct || 0))}%`
                                      : `${evaluacion.entrenamientos_ocio} sesiones registradas`}
                                  </p>
                                </div>
                                <div style={miniTarjetaBlanca}>
                                  <strong>Mejoras observadas</strong>
                                  <p style={{ margin: '6px 0 0', color: '#475569' }}>
                                    {reportedImprovements(
                                      evaluacion.mejoras_reportadas
                                    ).join(' · ') || 'Sin mejora específica registrada todavía'}
                                  </p>
                                </div>
                                <div style={miniTarjetaBlanca}>
                                  <strong>Trabajo diario</strong>
                                  <p style={{ margin: '6px 0 0', color: '#475569' }}>
                                    {dailyWorkObjectives(
                                      evaluacion.trabajos_realizados
                                    ).join(' · ') || 'Sin trabajo diario registrado'}
                                  </p>
                                </div>
                                <div style={miniTarjetaBlanca}>
                                  <strong>Comparación Navidad</strong>
                                  <p style={{ margin: '6px 0 0', color: '#475569' }}>
                                    {evaluacion.navidad_guardada
                                      ? `${evaluacion.nivel_navidad || '-'} → ${
                                          evaluacion.nivel_final || '-'
                                        }`
                                      : 'Todavía no hay corte de Navidad guardado'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div style={{ padding: 14 }}>
                              <div style={avisoNeutral}>
                                Este alumno está en Ocio pero todavía no tiene reportes Ocio en la temporada activa. No se inventa una evaluación familiar hasta tener datos.
                              </div>
                            </div>
                          )}
                        </details>
                      ))
                    )}
                  </div>
                </>
              )}
            </article>
          </section>
        );
      })()}

    </>
  );
}

