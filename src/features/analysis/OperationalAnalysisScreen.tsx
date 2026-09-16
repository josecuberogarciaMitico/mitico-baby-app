import React from 'react';

type ModalidadAnalisisAdminApp = 'BABY' | 'OCIO' | 'INTENSIVOS';

type OperationalAnalysisScreenProps = {
  ctx: Record<string, any>;
};

export function OperationalAnalysisScreen({ ctx }: OperationalAnalysisScreenProps) {
  const {
    agendaBloqueBlanco,
    analisisAdmin,
    avisoNeutral,
    botonSecundario,
    cambiarModalidadAnalisisAdminApp,
    cambiarTemporadaAnalisisAdminApp,
    cargandoAnalisisAdmin,
    descargarCsvAnalisisAdminApp,
    descargarExcelAnalisisAdminApp,
    descargarPdfAnalisisAdminApp,
    diferenciaAnalisisAdminApp,
    errorAnalisisAdmin,
    errorCaja,
    esCoordinadorJefeApp,
    esVistaMovilApp,
    etiquetaMesAnalisisAdminApp,
    labelCampo,
    miniTarjetaBlanca,
    modalidadAnalisisAdmin,
    numeroAnalisisAdminApp,
    pantalla,
    renderAyudaRapidaPantallaApp,
    selectCampo,
    temporadaAnalisisAdminId,
  } = ctx;

  return (
    <>
        {pantalla === 'analisis' && esCoordinadorJefeApp && (
                  <article
                    style={{
                      display: 'grid',
                      gap: 16,
                      width: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        gap: 16,
                        flexWrap: 'wrap',
                        borderRadius: 24,
                        padding: 20,
                        background:
                          'linear-gradient(135deg, #062d3f 0%, #083b4d 58%, #0b5d4f 100%)',
                        border: '1px solid rgba(16,185,129,0.28)',
                        boxShadow: '0 18px 44px rgba(15,23,42,0.16)',
                        color: '#ffffff',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <span
                          style={{
                            color: '#86efac',
                            fontWeight: 950,
                            fontSize: 11,
                            letterSpacing: '0.1em',
                            textTransform: 'uppercase',
                          }}
                        >
                          DIRECCIÓN · ANÁLISIS
                        </span>
                        <h2 style={{ margin: '5px 0 0', color: '#ffffff', fontSize: 30 }}>
                          Análisis operativo
                        </h2>
                {renderAyudaRapidaPantallaApp()}
                        <p
                          style={{
                            margin: '8px 0 0',
                            color: '#cbd5e1',
                            lineHeight: 1.45,
                            maxWidth: 760,
                          }}
                        >
                          Lectura de actividad, continuidad, asistencia, ocupación y evolución técnica con los datos reales de la temporada.
                        </p>
                      </div>
  
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          disabled={!analisisAdmin || cargandoAnalisisAdmin}
                          onClick={descargarPdfAnalisisAdminApp}
                          style={{ ...botonSecundario, background: 'rgba(255,255,255,.10)', color: '#fff', border: '1px solid rgba(255,255,255,.28)' }}
                        >
                          PDF
                        </button>
                        <button
                          type="button"
                          disabled={!analisisAdmin || cargandoAnalisisAdmin}
                          onClick={descargarExcelAnalisisAdminApp}
                          style={{ ...botonSecundario, background: 'rgba(255,255,255,.10)', color: '#fff', border: '1px solid rgba(255,255,255,.28)' }}
                        >
                          Excel
                        </button>
                        <button
                          type="button"
                          disabled={!analisisAdmin || cargandoAnalisisAdmin}
                          onClick={descargarCsvAnalisisAdminApp}
                          style={{ ...botonSecundario, background: '#ffffff', color: '#064e3b', border: '1px solid #ffffff' }}
                        >
                          CSV
                        </button>
                      </div>
                    </div>
  
                    <div
                      style={{
                        ...agendaBloqueBlanco,
                        display: 'grid',
                        gridTemplateColumns: esVistaMovilApp
                          ? 'minmax(0, 1fr)'
                          : 'minmax(0, 1fr) minmax(220px, 320px)',
                        gap: 12,
                        alignItems: 'end',
                        border: '1px solid #dbeafe',
                        background: '#ffffff',
                        boxShadow: '0 10px 28px rgba(15,23,42,0.05)',
                      }}
                    >
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                        {(['BABY', 'OCIO', 'INTENSIVOS'] as ModalidadAnalisisAdminApp[]).map(
                          (modalidad) => (
                            <button
                              key={modalidad}
                              type="button"
                              disabled={cargandoAnalisisAdmin}
                              onClick={() => cambiarModalidadAnalisisAdminApp(modalidad)}
                              style={{
                                ...botonSecundario,
                                background:
                                  modalidadAnalisisAdmin === modalidad ? '#0f9f4d' : '#fff',
                                color:
                                  modalidadAnalisisAdmin === modalidad ? '#fff' : '#475569',
                                borderColor:
                                  modalidadAnalisisAdmin === modalidad ? '#0f9f4d' : '#e2e8f0',
                                flex: esVistaMovilApp ? '1 1 95px' : undefined,
                              }}
                            >
                              {modalidad === 'INTENSIVOS' ? 'Intensivos' : modalidad === 'OCIO' ? 'Ocio' : 'Baby'}
                            </button>
                          )
                        )}
                      </div>
  
                      <label style={labelCampo}>
                        Temporada analizada · actual + 2 anteriores
                        <select
                          value={temporadaAnalisisAdminId}
                          disabled={cargandoAnalisisAdmin || !analisisAdmin}
                          onChange={(e) => cambiarTemporadaAnalisisAdminApp(e.target.value)}
                          style={selectCampo}
                        >
                          {(analisisAdmin?.comparativa_temporadas || []).map((temporada) => (
                            <option key={temporada.temporada_id} value={temporada.temporada_id}>
                              {temporada.temporada}{temporada.activa ? ' · actual' : ''}
                            </option>
                          ))}
                        </select>
                      </label>
                    </div>
  
                    {cargandoAnalisisAdmin && (
                      <div style={avisoNeutral}>Calculando métricas con los datos actuales…</div>
                    )}
  
                    {errorAnalisisAdmin && <div style={errorCaja}>{errorAnalisisAdmin}</div>}
  
                    {analisisAdmin && !cargandoAnalisisAdmin && (
                      <>
                        <div
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            gap: 10,
                            flexWrap: 'wrap',
                            alignItems: 'baseline',
                          }}
                        >
                          <strong style={{ fontSize: 18 }}>
                            {analisisAdmin.meta.modalidad === 'INTENSIVOS'
                              ? 'Intensivos'
                              : analisisAdmin.meta.modalidad === 'OCIO'
                              ? 'Ocio'
                              : 'Baby'}{' '}
                            · {analisisAdmin.meta.temporada}
                          </strong>
                          <span style={{ color: '#64748b', fontSize: 12, fontWeight: 700 }}>
                            Calculado {new Date(analisisAdmin.meta.generado_at).toLocaleString('es-ES')}
                          </span>
                        </div>
  
                        {(() => {
                          const mesesConActividad = analisisAdmin.mensual.filter(
                            (mes) =>
                              mes.alumnos_unicos > 0 ||
                              mes.altas > 0 ||
                              mes.sesiones_realizadas > 0
                          );
                          if (mesesConActividad.length === 0) {
                            return (
                              <section
                                style={{
                                  ...agendaBloqueBlanco,
                                  border: '1px solid #dbeafe',
                                  background: '#ffffff',
                                }}
                              >
                                <strong style={{ fontSize: 16 }}>Último mes vs mes anterior</strong>
                                <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: 13 }}>
                                  Todavía no hay meses con actividad real para comparar.
                                </p>
                              </section>
                            );
                          }
  
                          const ultimo = mesesConActividad[mesesConActividad.length - 1];
                          const anterior = mesesConActividad.length >= 2
                            ? mesesConActividad[mesesConActividad.length - 2]
                            : null;
  
                          if (!anterior) {
                            return (
                              <section
                                style={{
                                  ...agendaBloqueBlanco,
                                  border: '1px solid #bbf7d0',
                                  background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 68%)',
                                }}
                              >
                                <strong style={{ fontSize: 16 }}>Último mes vs mes anterior</strong>
                                <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: 13 }}>
                                  {etiquetaMesAnalisisAdminApp(ultimo.mes)} es el primer mes con actividad real. Todavía no existe un mes anterior con el que compararlo.
                                </p>
                              </section>
                            );
                          }
  
                          const cambios = [
                            {
                              titulo: 'ALUMNOS',
                              valor: ultimo.alumnos_unicos,
                              cambio: diferenciaAnalisisAdminApp(ultimo.alumnos_unicos, anterior.alumnos_unicos),
                            },
                            {
                              titulo: 'ALTAS',
                              valor: ultimo.altas,
                              cambio: diferenciaAnalisisAdminApp(ultimo.altas, anterior.altas),
                            },
                            {
                              titulo: 'ASISTENCIA',
                              valor: numeroAnalisisAdminApp(ultimo.asistencia_real_pct, '%'),
                              cambio: diferenciaAnalisisAdminApp(ultimo.asistencia_real_pct, anterior.asistencia_real_pct, ' pp'),
                            },
                            {
                              titulo: 'OCUPACIÓN',
                              valor: numeroAnalisisAdminApp(ultimo.ocupacion_pct, '%'),
                              cambio: diferenciaAnalisisAdminApp(ultimo.ocupacion_pct, anterior.ocupacion_pct, ' pp'),
                            },
                            {
                              titulo: 'NIÑOS / TURNO',
                              valor: numeroAnalisisAdminApp(ultimo.promedio_ninos_turno),
                              cambio: diferenciaAnalisisAdminApp(ultimo.promedio_ninos_turno, anterior.promedio_ninos_turno),
                            },
                            {
                              titulo: 'EVOLUCIÓN TÉCNICA',
                              valor: numeroAnalisisAdminApp(ultimo.evolucion_tecnica),
                              cambio: diferenciaAnalisisAdminApp(ultimo.evolucion_tecnica, anterior.evolucion_tecnica),
                            },
                          ];
  
                          return (
                            <section
                              style={{
                                ...agendaBloqueBlanco,
                                border: '1px solid #bbf7d0',
                                background: 'linear-gradient(135deg, #f0fdf4 0%, #ffffff 68%)',
                                display: 'grid',
                                gap: 12,
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  gap: 10,
                                  flexWrap: 'wrap',
                                  alignItems: 'baseline',
                                }}
                              >
                                <div>
                                  <strong style={{ fontSize: 16 }}>Último mes vs mes anterior</strong>
                                  <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
                                    {etiquetaMesAnalisisAdminApp(ultimo.mes)} frente a {etiquetaMesAnalisisAdminApp(anterior.mes)}.
                                  </p>
                                </div>
                                <span style={{ color: '#64748b', fontSize: 12, fontWeight: 750 }}>
                                  Comparación directa · sin objetivos ni umbrales inventados
                                </span>
                              </div>
  
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                                  gap: 8,
                                }}
                              >
                                {cambios.map((item) => (
                                  <div
                                    key={item.titulo}
                                    style={{
                                      border: '1px solid #dcfce7',
                                      borderRadius: 14,
                                      padding: '11px 12px',
                                      background: '#ffffff',
                                      minWidth: 0,
                                    }}
                                  >
                                    <span style={{ color: '#64748b', fontWeight: 850, fontSize: 10 }}>
                                      {item.titulo}
                                    </span>
                                    <div
                                      style={{
                                        marginTop: 3,
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: 8,
                                        alignItems: 'baseline',
                                      }}
                                    >
                                      <strong style={{ fontSize: 22 }}>{item.valor}</strong>
                                      <span
                                        style={{
                                          color: '#475569',
                                          fontSize: 12,
                                          fontWeight: 850,
                                          whiteSpace: 'nowrap',
                                        }}
                                      >
                                        {item.cambio}
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </section>
                          );
                        })()}
  
                        <section
                          style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                            gap: 10,
                          }}
                        >
                          {[
                            ['ALUMNOS ÚNICOS', analisisAdmin.resumen.alumnos_unicos, 'identidades'],
                            ['ALTAS', analisisAdmin.resumen.altas, 'temporada'],
                            ['CONTINUIDAD', numeroAnalisisAdminApp(analisisAdmin.resumen.continuidad_pct, '%'), 'mes a mes'],
                            ['PÉRDIDA', numeroAnalisisAdminApp(analisisAdmin.resumen.perdida_continuidad_pct, '%'), 'continuidad'],
                            ['ASISTENCIA REAL', numeroAnalisisAdminApp(analisisAdmin.resumen.asistencia_real_pct, '%'), 'confirmada'],
                            ['NIÑOS / TURNO', numeroAnalisisAdminApp(analisisAdmin.resumen.promedio_ninos_turno), 'promedio'],
                            ['POR GRUPO', numeroAnalisisAdminApp(analisisAdmin.resumen.promedio_por_grupo), 'promedio'],
                            ['SESIONES', analisisAdmin.resumen.sesiones_realizadas, 'realizadas'],
                            ['OCUPACIÓN', numeroAnalisisAdminApp(analisisAdmin.resumen.ocupacion_pct, '%'), 'capacidad'],
                          ].map(([titulo, valor, pie]) => (
                            <div
                              key={String(titulo)}
                              style={{
                                ...miniTarjetaBlanca,
                                border: '1px solid #dbeafe',
                                background: '#ffffff',
                                boxShadow: '0 8px 20px rgba(15,23,42,0.04)',
                                minHeight: 82,
                                display: 'grid',
                                alignContent: 'center',
                              }}
                            >
                              <span style={{ color: '#64748b', fontWeight: 850, fontSize: 11 }}>
                                {titulo}
                              </span>
                              <strong style={{ fontSize: 27, overflowWrap: 'anywhere' }}>{valor}</strong>
                              <span style={{ color: '#64748b', fontSize: 12 }}>{pie}</span>
                            </div>
                          ))}
                        </section>
  
                        <section
                          style={{
                            ...agendaBloqueBlanco,
                            border: '1px solid #e2e8f0',
                            display: 'grid',
                            gap: 10,
                          }}
                        >
                          <div>
                            <strong>Evolución técnica</strong>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
                              Cambio medio entre el primer y el último nivel reportado de cada alumno.
                            </p>
                          </div>
                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
                              gap: 8,
                            }}
                          >
                            <div style={miniTarjetaBlanca}>
                              <span style={{ color: '#64748b', fontSize: 12 }}>EVOLUCIÓN MEDIA</span>
                              <strong style={{ fontSize: 25 }}>
                                {numeroAnalisisAdminApp(analisisAdmin.resumen.evolucion_tecnica)}
                              </strong>
                            </div>
                            <div style={miniTarjetaBlanca}>
                              <span style={{ color: '#64748b', fontSize: 12 }}>MEJORAN</span>
                              <strong style={{ fontSize: 25, color: '#15803d' }}>{analisisAdmin.resumen.alumnos_mejoran}</strong>
                            </div>
                            <div style={miniTarjetaBlanca}>
                              <span style={{ color: '#64748b', fontSize: 12 }}>ESTABLES</span>
                              <strong style={{ fontSize: 25 }}>{analisisAdmin.resumen.alumnos_estables}</strong>
                            </div>
                            <div style={miniTarjetaBlanca}>
                              <span style={{ color: '#64748b', fontSize: 12 }}>BAJAN</span>
                              <strong style={{ fontSize: 25, color: '#b91c1c' }}>{analisisAdmin.resumen.alumnos_bajan}</strong>
                            </div>
                          </div>
                        </section>
  
                        <section style={{ display: 'grid', gap: 9 }}>
                          <div>
                            <strong>Evolución mensual</strong>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
                              Crecimiento, continuidad, asistencia, ocupación y carga real por mes.
                            </p>
                          </div>
                          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                            <table
                              style={{
                                width: '100%',
                                minWidth: 980,
                                borderCollapse: 'collapse',
                                fontSize: 12,
                              }}
                            >
                              <thead>
                                <tr>
                                  {['Mes','Alumnos','Altas','Crec.','Cont.','Pérdida','Asist.','Niños/turno','Por grupo','Sesiones','Ocup.','Evol.'].map((titulo) => (
                                    <th key={titulo} style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #cbd5e1', color: '#475569', whiteSpace: 'nowrap' }}>
                                      {titulo}
                                    </th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {analisisAdmin.mensual.map((m) => (
                                  <tr key={m.mes}>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9', fontWeight: 800 }}>{etiquetaMesAnalisisAdminApp(m.mes)}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{m.alumnos_unicos}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{m.altas}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{numeroAnalisisAdminApp(m.crecimiento_pct, '%')}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{numeroAnalisisAdminApp(m.continuidad_pct, '%')}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{numeroAnalisisAdminApp(m.perdida_continuidad_pct, '%')}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{numeroAnalisisAdminApp(m.asistencia_real_pct, '%')}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{numeroAnalisisAdminApp(m.promedio_ninos_turno)}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{numeroAnalisisAdminApp(m.promedio_por_grupo)}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{m.sesiones_realizadas}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{numeroAnalisisAdminApp(m.ocupacion_pct, '%')}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{numeroAnalisisAdminApp(m.evolucion_tecnica)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </section>
  
                        <section
                          style={{
                            display: 'grid',
                            gridTemplateColumns: esVistaMovilApp ? 'minmax(0, 1fr)' : 'repeat(2, minmax(0, 1fr))',
                            gap: 12,
                          }}
                        >
                          <div style={{ ...agendaBloqueBlanco, border: '1px solid #e2e8f0' }}>
                            <strong>Distribución de niveles</strong>
                            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                              {analisisAdmin.niveles.length === 0 && <span style={{ color: '#64748b' }}>Sin datos todavía.</span>}
                              {analisisAdmin.niveles.map((nivel) => {
                                const maximo = Math.max(1, ...analisisAdmin.niveles.map((n) => n.total));
                                return (
                                  <div key={nivel.nivel} style={{ display: 'grid', gap: 4 }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                                      <strong>{nivel.nivel}</strong><span>{nivel.total}</span>
                                    </div>
                                    <div style={{ height: 8, borderRadius: 999, background: '#f1f5f9', overflow: 'hidden' }}>
                                      <div style={{ height: '100%', width: `${Math.max(4, (nivel.total / maximo) * 100)}%`, background: '#0f9f4d', borderRadius: 999 }} />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
  
                          <div style={{ ...agendaBloqueBlanco, border: '1px solid #e2e8f0' }}>
                            <strong>Progresión de niveles</strong>
                            <div style={{ display: 'grid', gap: 7, marginTop: 10 }}>
                              {analisisAdmin.progresiones.length === 0 && <span style={{ color: '#64748b' }}>Sin progresiones todavía.</span>}
                              {analisisAdmin.progresiones.slice(0, 12).map((progresion, indice) => (
                                <div key={`${progresion.desde}-${progresion.hasta}-${indice}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '7px 0', borderBottom: '1px solid #f1f5f9' }}>
                                  <span><strong>{progresion.desde}</strong> → <strong>{progresion.hasta}</strong></span>
                                  <span style={{ fontWeight: 850, color: progresion.sentido === 'SUBE' ? '#15803d' : progresion.sentido === 'BAJA' ? '#b91c1c' : '#64748b' }}>
                                    {progresion.total} · {progresion.sentido}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </section>
  
                        <section style={{ display: 'grid', gap: 9 }}>
                          <div>
                            <strong>Comparación entre temporadas</strong>
                            <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13 }}>
                              Queda preparada para crecer automáticamente cuando existan nuevas temporadas.
                            </p>
                          </div>
                          <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                            <table style={{ width: '100%', minWidth: 650, borderCollapse: 'collapse', fontSize: 13 }}>
                              <thead>
                                <tr>
                                  {['Temporada','Alumnos','Sesiones','Asistencia','Evolución técnica'].map((titulo) => (
                                    <th key={titulo} style={{ padding: 8, textAlign: 'left', borderBottom: '1px solid #cbd5e1', color: '#475569' }}>{titulo}</th>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {analisisAdmin.comparativa_temporadas.map((temporada) => (
                                  <tr key={temporada.temporada_id}>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9', fontWeight: 800 }}>
                                      {temporada.temporada}{temporada.activa ? ' · actual' : ''}
                                    </td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{temporada.alumnos_unicos}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{temporada.sesiones_realizadas}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{numeroAnalisisAdminApp(temporada.asistencia_real_pct, '%')}</td>
                                    <td style={{ padding: 8, borderBottom: '1px solid #f1f5f9' }}>{numeroAnalisisAdminApp(temporada.evolucion_tecnica)}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </section>
  
                        <details style={{ ...agendaBloqueBlanco, border: '1px solid #e2e8f0', padding: 12 }}>
                          <summary style={{ cursor: 'pointer', fontWeight: 850, color: '#475569' }}>
                            Cómo se calcula cada métrica
                          </summary>
                          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                            {Object.entries(analisisAdmin.definiciones).map(([clave, definicion]) => (
                              <div key={clave} style={{ fontSize: 13, lineHeight: 1.45 }}>
                                <strong>{clave.replace(/_/g, ' ')}:</strong> {String(definicion ?? '')}
                              </div>
                            ))}
                          </div>
                        </details>
                      </>
                    )}
                  </article>
                )}
  
      </>
  );
}

