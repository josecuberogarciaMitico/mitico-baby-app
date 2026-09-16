import React from 'react';
import type { TipoListadoAlumnosApp } from '../seasons/seasonTypes';

type ManagementReportsScreenProps = {
  ctx: Record<string, any>;
};

export function ManagementReportsScreen({ ctx }: ManagementReportsScreenProps) {
  const {
    actualizarTodo,
    avisoNeutral,
    botonMenu,
    botonPrincipal,
    botonSecundario,
    busquedaListadoAlumnos,
    candidatosEquipo,
    candidatosEquipoCargando,
    candidatosEquipoError,
    candidatosEquipoGenerado,
    cargarCandidatosEquipo,
    cargarInformeSnowZone,
    cargarListadoAlumnosTemporada,
    descargarCandidatosEquipoExcel,
    descargarInformeSnowZoneExcel,
    descargarListadoAlumnosTemporada,
    errorCaja,
    esCoordinadorJefeApp,
    etiquetaSuperior,
    fechaIsoEditor,
    formatearFecha,
    inputCampo,
    labelCampo,
    limitesSnowZoneSeleccionados,
    listadoAlumnosCargando,
    listadoAlumnosError,
    listadoAlumnosGenerado,
    listadoAlumnosTemporada,
    miniTarjetaBlanca,
    pantalla,
    renderAyudaRapidaPantallaApp,
    setBusquedaListadoAlumnos,
    setSnowZoneMes,
    setSnowZoneModo,
    setSnowZoneSemanaInicio,
    snowZoneCargando,
    snowZoneDias,
    snowZoneError,
    snowZoneMes,
    snowZoneModo,
    snowZoneSemanaInicio,
    tarjeta,
    tipoListadoAlumnos,
    tituloPeriodoSnowZone,
  } = ctx;

  return (
    <>
      {pantalla === 'informes' && esCoordinadorJefeApp && (
        <section>
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
            <div style={{ minWidth: 0, flex: '1 1 560px' }}>
              <span
                style={{
                  color: '#86efac',
                  fontWeight: 950,
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                DIRECCIÓN · INFORMES
              </span>
              <h2 style={{ margin: '5px 0 0', color: '#ffffff', fontSize: 30 }}>
                Informes y listados
              </h2>
              {renderAyudaRapidaPantallaApp()}
              <p
                style={{
                  margin: '8px 0 0',
                  color: '#cbd5e1',
                  lineHeight: 1.45,
                  maxWidth: 780,
                }}
              >
                Consulta informes operativos, genera listados y prepara los informes de familias de Ocio solo cuando los necesites.
              </p>
            </div>

            <button
              type="button"
              onClick={actualizarTodo}
              style={{
                ...botonSecundario,
                background: '#ffffff',
                color: '#064e3b',
                border: '1px solid #ffffff',
              }}
            >
              Actualizar datos
            </button>
          </div>

          <div
            style={{
              ...avisoNeutral,
              marginTop: 14,
              border: '1px solid #dbeafe',
              background: '#ffffff',
              color: '#475569',
            }}
          >
            Los paneles permanecen cerrados al entrar. Abre únicamente el informe que quieras generar o consultar.
          </div>

          <details
            style={{
              ...tarjeta,
              marginTop: 16,
              padding: 0,
              overflow: 'hidden',
              border: '1px solid rgba(37,99,235,.22)',
              background:
                'linear-gradient(135deg, rgba(239,246,255,.95), #fff 55%, rgba(240,253,244,.75))',
            }}
          >
            <summary
              style={{
                listStyle: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '16px 18px',
                borderBottom: '1px solid rgba(37,99,235,.12)',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p style={{ ...etiquetaSuperior, color: '#1d4ed8', margin: '0 0 3px' }}>
                  SNOWZONE
                </p>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 20,
                    lineHeight: 1.2,
                    overflowWrap: 'anywhere',
                  }}
                >
                  Pista pequeña / Pista grande
                </h3>
              </div>
              <span
                style={{
                  flex: '0 0 auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#334155',
                  fontWeight: 900,
                  fontSize: 20,
                }}
              >
                ↕
              </span>
            </summary>

            <div style={{ padding: '16px 18px 18px' }}>
              <p style={{ margin: '0 0 14px', color: '#475569', lineHeight: 1.4 }}>
                Cuenta asistencia real por día. Un grupo marcado como
                Pequeña/Grande computa como Pista grande.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(min(100%, 190px), 1fr))',
                  gap: 10,
                  alignItems: 'end',
                }}
              >
                <button
                  type="button"
                  onClick={() => setSnowZoneModo('mensual')}
                  style={{
                    ...botonMenu(snowZoneModo === 'mensual'),
                    width: '100%',
                    minWidth: 0,
                    minHeight: 46,
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                  }}
                >
                  Mensual
                </button>

                <button
                  type="button"
                  onClick={() => setSnowZoneModo('semanal')}
                  style={{
                    ...botonMenu(snowZoneModo === 'semanal'),
                    width: '100%',
                    minWidth: 0,
                    minHeight: 46,
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                  }}
                >
                  Semanal
                </button>

                {snowZoneModo === 'mensual' ? (
                  <label style={{ ...labelCampo, minWidth: 0, width: '100%' }}>
                    Mes
                    <input
                      type="month"
                      value={snowZoneMes}
                      onChange={(e) => setSnowZoneMes(e.target.value)}
                      style={{
                        ...inputCampo,
                        width: '100%',
                        minWidth: 0,
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                      }}
                    />
                  </label>
                ) : (
                  <label style={{ ...labelCampo, minWidth: 0, width: '100%' }}>
                    Semana desde
                    <input
                      type="date"
                      value={snowZoneSemanaInicio}
                      onChange={(e) => {
                        const valor = e.target.value;
                        if (!valor) return;
                        const fecha = new Date(`${valor}T12:00:00`);
                        const diaSemana = fecha.getDay();
                        const desplazamiento =
                          diaSemana === 0 ? -6 : 1 - diaSemana;
                        fecha.setDate(fecha.getDate() + desplazamiento);
                        setSnowZoneSemanaInicio(fechaIsoEditor(fecha));
                      }}
                      style={{
                        ...inputCampo,
                        width: '100%',
                        minWidth: 0,
                        maxWidth: '100%',
                        boxSizing: 'border-box',
                      }}
                    />
                  </label>
                )}

                <button
                  type="button"
                  onClick={cargarInformeSnowZone}
                  disabled={snowZoneCargando}
                  style={{
                    ...botonSecundario,
                    width: '100%',
                    minWidth: 0,
                    minHeight: 46,
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                  }}
                >
                  {snowZoneCargando ? 'Calculando...' : 'Actualizar informe'}
                </button>
              </div>

              {snowZoneError && (
                <div style={{ ...errorCaja, marginTop: 12 }}>{snowZoneError}</div>
              )}

              {!snowZoneCargando && !snowZoneError && snowZoneDias.length === 0 && (
                <div style={{ ...avisoNeutral, marginTop: 12 }}>
                  No hay asistencias contabilizadas en este periodo.
                </div>
              )}

              {snowZoneDias.length > 0 && (() => {
                const totalPequena = snowZoneDias.reduce(
                  (total, fila) => total + Number(fila.pista_pequena || 0),
                  0
                );
                const totalGrande = snowZoneDias.reduce(
                  (total, fila) => total + Number(fila.pista_grande || 0),
                  0
                );
                const totalGeneral = totalPequena + totalGrande;
                const periodo = limitesSnowZoneSeleccionados();
                const cabeceraPeriodo = tituloPeriodoSnowZone();

                return (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginTop: 16,
                        padding: '14px 15px',
                        border: '1px solid #dbeafe',
                        borderRadius: 16,
                        background: 'rgba(255,255,255,.82)',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <strong
                          style={{
                            display: 'block',
                            color: '#172033',
                            fontSize: 18,
                            lineHeight: 1.2,
                          }}
                        >
                          {cabeceraPeriodo.titulo}
                        </strong>
                        <span
                          style={{
                            display: 'block',
                            marginTop: 4,
                            color: '#64748b',
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {cabeceraPeriodo.periodo}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={descargarInformeSnowZoneExcel}
                        disabled={snowZoneCargando || snowZoneDias.length === 0}
                        style={{
                          ...botonPrincipal,
                          flex: '0 1 190px',
                          minWidth: 0,
                          minHeight: 44,
                          whiteSpace: 'normal',
                          overflowWrap: 'anywhere',
                          opacity:
                            snowZoneCargando || snowZoneDias.length === 0 ? 0.55 : 1,
                        }}
                      >
                        Descargar datos técnicos
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
                        gap: 10,
                        marginTop: 12,
                      }}
                    >
                      <div style={miniTarjetaBlanca}>
                        <strong>Pista pequeña</strong>
                        <br />
                        <span style={{ fontSize: 26, fontWeight: 900 }}>
                          {totalPequena}
                        </span>
                      </div>
                      <div style={miniTarjetaBlanca}>
                        <strong>Pista grande</strong>
                        <br />
                        <span style={{ fontSize: 26, fontWeight: 900 }}>
                          {totalGrande}
                        </span>
                      </div>
                      <div style={miniTarjetaBlanca}>
                        <strong>Total periodo</strong>
                        <br />
                        <span style={{ fontSize: 26, fontWeight: 900 }}>
                          {totalGeneral}
                        </span>
                      </div>
                    </div>

                    <div
                      style={{
                        overflowX: 'auto',
                        marginTop: 12,
                        border: '1px solid #e2e8f0',
                        borderRadius: 16,
                        background: '#fff',
                        WebkitOverflowScrolling: 'touch',
                      }}
                    >
                      <table
                        style={{
                          width: '100%',
                          borderCollapse: 'collapse',
                          minWidth: 520,
                        }}
                      >
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            {['Fecha', 'Pista pequeña', 'Pista grande', 'Total'].map(
                              (titulo) => (
                                <th
                                  key={titulo}
                                  style={{
                                    padding: '11px 12px',
                                    textAlign:
                                      titulo === 'Fecha' ? 'left' : 'center',
                                    borderBottom: '1px solid #e2e8f0',
                                    color: '#334155',
                                  }}
                                >
                                  {titulo}
                                </th>
                              )
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {snowZoneDias.map((fila) => (
                            <tr key={fila.fecha}>
                              <td
                                style={{
                                  padding: '10px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  fontWeight: 800,
                                }}
                              >
                                {formatearFecha(fila.fecha)}
                              </td>
                              <td
                                style={{
                                  padding: '10px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  textAlign: 'center',
                                }}
                              >
                                {fila.pista_pequena}
                              </td>
                              <td
                                style={{
                                  padding: '10px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  textAlign: 'center',
                                }}
                              >
                                {fila.pista_grande}
                              </td>
                              <td
                                style={{
                                  padding: '10px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  textAlign: 'center',
                                  fontWeight: 900,
                                }}
                              >
                                {fila.total}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: '#f8fafc' }}>
                            <td style={{ padding: '11px 12px', fontWeight: 900 }}>
                              TOTAL
                            </td>
                            <td
                              style={{
                                padding: '11px 12px',
                                textAlign: 'center',
                                fontWeight: 900,
                              }}
                            >
                              {totalPequena}
                            </td>
                            <td
                              style={{
                                padding: '11px 12px',
                                textAlign: 'center',
                                fontWeight: 900,
                              }}
                            >
                              {totalGrande}
                            </td>
                            <td
                              style={{
                                padding: '11px 12px',
                                textAlign: 'center',
                                fontWeight: 900,
                              }}
                            >
                              {totalGeneral}
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>

                    <p
                      style={{
                        margin: '10px 0 0',
                        color: '#64748b',
                        fontSize: 13,
                      }}
                    >
                      Periodo: {formatearFecha(periodo.desde)} –{' '}
                      {formatearFecha(periodo.hasta)}
                    </p>
                  </>
                );
              })()}
            </div>
          </details>

          <details
            style={{
              ...tarjeta,
              marginTop: 16,
              padding: 0,
              overflow: 'hidden',
              border: '1px solid rgba(22,163,74,.22)',
              background:
                'linear-gradient(135deg, rgba(240,253,244,.94), #fff 56%, rgba(239,246,255,.72))',
            }}
          >
            <summary
              style={{
                listStyle: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '16px 18px',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    ...etiquetaSuperior,
                    color: '#15803d',
                    margin: '0 0 3px',
                  }}
                >
                  FINAL DE TEMPORADA
                </p>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 20,
                    lineHeight: 1.2,
                    overflowWrap: 'anywhere',
                  }}
                >
                  Candidatos a equipo
                </h3>
                <p
                  style={{
                    margin: '5px 0 0',
                    color: '#64748b',
                    fontSize: 13,
                  }}
                >
                  Solo Baby · nivel B o superior · informe bajo demanda
                </p>
              </div>

              <span
                style={{
                  flex: '0 0 auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#334155',
                  fontWeight: 900,
                  fontSize: 20,
                }}
              >
                ↕
              </span>
            </summary>

            <div
              style={{
                padding: '16px 18px 18px',
                borderTop: '1px solid rgba(22,163,74,.12)',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  justifyContent: 'space-between',
                  gap: 12,
                  flexWrap: 'wrap',
                }}
              >
                <div style={{ flex: '1 1 420px', minWidth: 0 }}>
                  <p style={{ margin: 0, color: '#475569', lineHeight: 1.45 }}>
                    Genera el listado final con los alumnos que han entrenado en
                    Baby esta temporada y cuyo último nivel técnico real es B o
                    superior. Se ordenan primero por nivel y después por
                    asistencia, continuidad y autonomía.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={cargarCandidatosEquipo}
                  disabled={candidatosEquipoCargando}
                  style={{
                    ...botonPrincipal,
                    flex: '0 1 210px',
                    minWidth: 0,
                    minHeight: 46,
                    whiteSpace: 'normal',
                    overflowWrap: 'anywhere',
                    opacity: candidatosEquipoCargando ? 0.65 : 1,
                  }}
                >
                  {candidatosEquipoCargando
                    ? 'Generando...'
                    : candidatosEquipoGenerado
                    ? 'Actualizar candidatos'
                    : 'Generar candidatos'}
                </button>
              </div>

              {candidatosEquipoError && (
                <div style={{ ...errorCaja, marginTop: 12 }}>
                  {candidatosEquipoError}
                </div>
              )}

              {candidatosEquipoGenerado &&
                !candidatosEquipoCargando &&
                !candidatosEquipoError &&
                candidatosEquipo.length === 0 && (
                  <div style={{ ...avisoNeutral, marginTop: 12 }}>
                    No hay alumnos Baby con nivel B o superior en la temporada
                    activa.
                  </div>
                )}

              {candidatosEquipo.length > 0 && (() => {
                const temporada = candidatosEquipo[0]?.temporada || '-';
                const nivelesAgrupados = Array.from(
                  new Set(candidatosEquipo.map((fila) => fila.nivel))
                );

                return (
                  <>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 12,
                        flexWrap: 'wrap',
                        marginTop: 14,
                        padding: '13px 14px',
                        border: '1px solid #bbf7d0',
                        borderRadius: 16,
                        background: 'rgba(255,255,255,.82)',
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            display: 'block',
                            color: '#166534',
                            fontSize: 17,
                          }}
                        >
                          Temporada {temporada}
                        </strong>
                        <span
                          style={{
                            display: 'block',
                            marginTop: 3,
                            color: '#64748b',
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {candidatosEquipo.length} candidatos ·{' '}
                          {nivelesAgrupados.length} niveles
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={descargarCandidatosEquipoExcel}
                        style={{
                          ...botonPrincipal,
                          flex: '0 1 200px',
                          minWidth: 0,
                          minHeight: 44,
                          whiteSpace: 'normal',
                        }}
                      >
                        Descargar Excel
                      </button>
                    </div>

                    <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
                      {nivelesAgrupados.map((nivel) => {
                        const alumnosNivel = candidatosEquipo.filter(
                          (fila) => fila.nivel === nivel
                        );

                        return (
                          <details
                            key={`candidatos-${nivel}`}
                            open
                            style={{
                              overflow: 'hidden',
                              border: '1px solid #dbeafe',
                              borderRadius: 16,
                              background: '#fff',
                            }}
                          >
                            <summary
                              style={{
                                cursor: 'pointer',
                                listStyle: 'none',
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 10,
                                padding: '12px 14px',
                                background: '#f8fafc',
                                fontWeight: 900,
                              }}
                            >
                              <span>Nivel {String(nivel ?? '')}</span>
                              <span>{alumnosNivel.length} alumnos</span>
                            </summary>

                            <div style={{ overflowX: 'auto' }}>
                              <table
                                style={{
                                  width: '100%',
                                  minWidth: 760,
                                  borderCollapse: 'collapse',
                                }}
                              >
                                <thead>
                                  <tr>
                                    {[
                                      'Alumno',
                                      'Entrenos',
                                      'Meses',
                                      'Último entreno',
                                      'Autonomía',
                                      'Remontes',
                                    ].map((titulo) => (
                                      <th
                                        key={`${nivel}-${titulo}`}
                                        style={{
                                          padding: '10px 12px',
                                          textAlign:
                                            titulo === 'Alumno'
                                              ? 'left'
                                              : 'center',
                                          borderBottom: '1px solid #e2e8f0',
                                          color: '#334155',
                                          fontSize: 13,
                                        }}
                                      >
                                        {titulo}
                                      </th>
                                    ))}
                                  </tr>
                                </thead>
                                <tbody>
                                  {alumnosNivel.map((fila) => (
                                    <tr key={fila.alumno_id}>
                                      <td
                                        style={{
                                          padding: '10px 12px',
                                          borderBottom: '1px solid #f1f5f9',
                                          fontWeight: 800,
                                        }}
                                      >
                                        {fila.alumno}
                                      </td>
                                      <td
                                        style={{
                                          padding: '10px 12px',
                                          borderBottom: '1px solid #f1f5f9',
                                          textAlign: 'center',
                                          fontWeight: 900,
                                        }}
                                      >
                                        {fila.entrenamientos_baby}
                                      </td>
                                      <td
                                        style={{
                                          padding: '10px 12px',
                                          borderBottom: '1px solid #f1f5f9',
                                          textAlign: 'center',
                                        }}
                                      >
                                        {fila.meses_activos_baby}
                                      </td>
                                      <td
                                        style={{
                                          padding: '10px 12px',
                                          borderBottom: '1px solid #f1f5f9',
                                          textAlign: 'center',
                                        }}
                                      >
                                        {fila.ultimo_entreno_baby
                                          ? formatearFecha(fila.ultimo_entreno_baby)
                                          : '-'}
                                      </td>
                                      <td
                                        style={{
                                          padding: '10px 12px',
                                          borderBottom: '1px solid #f1f5f9',
                                          textAlign: 'center',
                                        }}
                                      >
                                        {fila.autonomia || '-'}
                                      </td>
                                      <td
                                        style={{
                                          padding: '10px 12px',
                                          borderBottom: '1px solid #f1f5f9',
                                          textAlign: 'center',
                                        }}
                                      >
                                        {(fila.remontes || []).join(', ') || '-'}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </details>
                        );
                      })}
                    </div>
                  </>
                );
              })()}
            </div>
          </details>

          <details
            style={{
              ...tarjeta,
              marginTop: 16,
              padding: 0,
              overflow: 'hidden',
              border: '1px solid rgba(99,102,241,.2)',
              background:
                'linear-gradient(135deg, rgba(238,242,255,.92), #fff 58%, rgba(248,250,252,.9))',
            }}
          >
            <summary
              style={{
                listStyle: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                padding: '16px 18px',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <p
                  style={{
                    ...etiquetaSuperior,
                    color: '#4f46e5',
                    margin: '0 0 3px',
                  }}
                >
                  LISTADOS RÁPIDOS
                </p>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 20,
                    lineHeight: 1.2,
                    overflowWrap: 'anywhere',
                  }}
                >
                  Alumnos de la temporada
                </h3>
                <p
                  style={{
                    margin: '5px 0 0',
                    color: '#64748b',
                    fontSize: 13,
                  }}
                >
                  Baby · Ocio · Intensivos · Todos
                </p>
              </div>

              <span
                style={{
                  flex: '0 0 auto',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 34,
                  height: 34,
                  borderRadius: 999,
                  border: '1px solid #cbd5e1',
                  background: '#fff',
                  color: '#334155',
                  fontWeight: 900,
                  fontSize: 20,
                }}
              >
                ↕
              </span>
            </summary>

            <div
              style={{
                padding: '16px 18px 18px',
                borderTop: '1px solid rgba(99,102,241,.12)',
              }}
            >
              <p style={{ margin: 0, color: '#475569', lineHeight: 1.45 }}>
                Genera un listado limpio con los niños que realmente han tenido
                actividad esta temporada. No guarda copias adicionales en
                Supabase.
              </p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns:
                    'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
                  gap: 9,
                  marginTop: 14,
                }}
              >
                {(
                  [
                    ['BABY', 'Baby'],
                    ['OCIO', 'Ocio'],
                    ['INTENSIVOS', 'Intensivos'],
                    ['TODOS', 'Todos'],
                  ] as Array<[TipoListadoAlumnosApp, string]>
                ).map(([tipo, etiqueta]) => (
                  <button
                    key={`listado-${tipo}`}
                    type="button"
                    onClick={() => cargarListadoAlumnosTemporada(tipo)}
                    disabled={listadoAlumnosCargando}
                    style={{
                      ...botonMenu(tipoListadoAlumnos === tipo),
                      width: '100%',
                      minWidth: 0,
                      minHeight: 44,
                      whiteSpace: 'normal',
                      overflowWrap: 'anywhere',
                      opacity: listadoAlumnosCargando ? 0.7 : 1,
                    }}
                  >
                    {etiqueta}
                  </button>
                ))}
              </div>

              {listadoAlumnosError && (
                <div style={{ ...errorCaja, marginTop: 12 }}>
                  {listadoAlumnosError}
                </div>
              )}

              {listadoAlumnosCargando && (
                <div style={{ ...avisoNeutral, marginTop: 12 }}>
                  Generando listado...
                </div>
              )}

              {listadoAlumnosGenerado &&
                !listadoAlumnosCargando &&
                !listadoAlumnosError &&
                listadoAlumnosTemporada.length === 0 && (
                  <div style={{ ...avisoNeutral, marginTop: 12 }}>
                    No hay actividad real en este listado durante la temporada
                    activa.
                  </div>
                )}

              {listadoAlumnosTemporada.length > 0 && (() => {
                const termino = busquedaListadoAlumnos.trim().toLowerCase();
                const filasVisibles = termino
                  ? listadoAlumnosTemporada.filter((fila) =>
                      `${fila.alumno} ${fila.nivel || ''} ${fila.pista || ''} ${
                        fila.modalidad || ''
                      } ${fila.ultimo_intensivo || ''}`
                        .toLowerCase()
                        .includes(termino)
                    )
                  : listadoAlumnosTemporada;

                const temporada =
                  listadoAlumnosTemporada[0]?.temporada || '-';

                return (
                  <>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'minmax(0, 1fr) minmax(160px, auto)',
                        gap: 10,
                        alignItems: 'end',
                        marginTop: 14,
                      }}
                    >
                      <label
                        style={{
                          ...labelCampo,
                          minWidth: 0,
                          width: '100%',
                        }}
                      >
                        Buscar alumno
                        <input
                          value={busquedaListadoAlumnos}
                          onChange={(e) =>
                            setBusquedaListadoAlumnos(e.target.value)
                          }
                          placeholder="Nombre, nivel, pista..."
                          style={{
                            ...inputCampo,
                            width: '100%',
                            minWidth: 0,
                            boxSizing: 'border-box',
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={descargarListadoAlumnosTemporada}
                        style={{
                          ...botonPrincipal,
                          width: '100%',
                          minWidth: 0,
                          minHeight: 46,
                          whiteSpace: 'normal',
                        }}
                      >
                        Descargar Excel
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginTop: 12,
                        padding: '11px 12px',
                        border: '1px solid #e0e7ff',
                        borderRadius: 14,
                        background: '#fff',
                      }}
                    >
                      <strong>Temporada {temporada}</strong>
                      <span style={{ color: '#64748b' }}>
                        {filasVisibles.length} alumnos visibles ·{' '}
                        {listadoAlumnosTemporada.length} total
                      </span>
                    </div>

                    <div
                      style={{
                        overflowX: 'auto',
                        marginTop: 12,
                        border: '1px solid #e2e8f0',
                        borderRadius: 16,
                        background: '#fff',
                        WebkitOverflowScrolling: 'touch',
                      }}
                    >
                      <table
                        style={{
                          width: '100%',
                          minWidth: 760,
                          borderCollapse: 'collapse',
                        }}
                      >
                        <thead>
                          <tr style={{ background: '#f8fafc' }}>
                            {[
                              'Alumno',
                              'Nivel',
                              'Pista',
                              'Último entreno',
                              'Entrenos',
                              'Modalidad',
                            ].map((titulo) => (
                              <th
                                key={`listado-alumnos-${titulo}`}
                                style={{
                                  padding: '10px 12px',
                                  textAlign:
                                    titulo === 'Alumno' ? 'left' : 'center',
                                  borderBottom: '1px solid #e2e8f0',
                                  color: '#334155',
                                  fontSize: 13,
                                }}
                              >
                                {titulo}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filasVisibles.map((fila) => (
                            <tr key={`${tipoListadoAlumnos}-${fila.alumno_id}`}>
                              <td
                                style={{
                                  padding: '10px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  fontWeight: 800,
                                }}
                              >
                                {fila.alumno}
                                {fila.ultimo_intensivo && (
                                  <span
                                    style={{
                                      display: 'block',
                                      marginTop: 2,
                                      color: '#64748b',
                                      fontSize: 12,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {fila.ultimo_intensivo}
                                  </span>
                                )}
                              </td>
                              <td
                                style={{
                                  padding: '10px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  textAlign: 'center',
                                  fontWeight: 900,
                                }}
                              >
                                {fila.nivel || '-'}
                              </td>
                              <td
                                style={{
                                  padding: '10px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  textAlign: 'center',
                                }}
                              >
                                {fila.pista || '-'}
                              </td>
                              <td
                                style={{
                                  padding: '10px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  textAlign: 'center',
                                }}
                              >
                                {fila.ultimo_entreno
                                  ? formatearFecha(fila.ultimo_entreno)
                                  : '-'}
                              </td>
                              <td
                                style={{
                                  padding: '10px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  textAlign: 'center',
                                  fontWeight: 900,
                                }}
                              >
                                {fila.total_entrenamientos}
                              </td>
                              <td
                                style={{
                                  padding: '10px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  textAlign: 'center',
                                }}
                              >
                                {fila.modalidad || '-'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                );
              })()}
            </div>
          </details>

        </section>
      )}

    </>
  );
}

