import React, { useState } from 'react';

type SeasonManagementScreenProps = {
  ctx: Record<string, any>;
};

export function SeasonManagementScreen({ ctx }: SeasonManagementScreenProps) {
  const [mostrarFlujoCierre, setMostrarFlujoCierre] = useState(false);
  const {
    actualizarTodo,
    analizarCierreTemporada,
    anioInicioTemporadaAgenda,
    archivoBackupRestauracion,
    archivoCopiaMaestraNombre,
    avisoCompleto,
    avisoPendiente,
    backupRestauracion,
    backupSemanaRealizado,
    botonMenu,
    botonPrincipal,
    botonSecundario,
    busquedaCierreTemporada,
    cargandoTemporadaActivaCierre,
    cargarBackupSemanalParaRestaurar,
    cargarCopiaMaestraParaRevisar,
    cargarTemporadaActivaCierre,
    cerrandoTemporada,
    cierreTemporadaAlumnos,
    cierreTemporadaAnalizado,
    cierreTemporadaCargando,
    cierreTemporadaError,
    confirmacionBackupCierre,
    confirmacionBackupRestauracion,
    confirmacionCierreTexto,
    confirmacionListadoCierre,
    descargarBackupSemanalJson,
    descargarCopiaMaestraTemporada,
    ejecutarCierreDefinitivoTemporada,
    errorBackupRestauracion,
    errorCaja,
    errorCopiaMaestraImport,
    errorTemporadaActivaCierre,
    esCoordinadorJefeApp,
    etiquetaSuperior,
    fechaIsoEditor,
    filasCopiaMaestraImport,
    filtroCierreTemporada,
    formatearFecha,
    importandoCopiaMaestra,
    importarCopiaMaestraEnAlumnos,
    iniciandoNuevaTemporada,
    iniciarNuevaTemporadaOperativa,
    inputCampo,
    labelCampo,
    miniTarjetaBlanca,
    nombreTemporadaAgenda,
    pantalla,
    rangoSemanaAgenda,
    renderAyudaRapidaPantallaApp,
    restaurandoBackupSemanal,
    restaurarBackupSemanal,
    resultadoCierreTemporada,
    resultadoImportacionCopiaMaestra,
    resultadoNuevaTemporada,
    resultadoRestauracionBackup,
    resumenCierreTemporada,
    selectCampoAgenda,
    semanaBackupObjetivo,
    semanasAgenda,
    setBusquedaCierreTemporada,
    setConfirmacionBackupCierre,
    setConfirmacionBackupRestauracion,
    setConfirmacionCierreTexto,
    setConfirmacionListadoCierre,
    setFiltroCierreTemporada,
    setSemanaBackupSeleccionada,
    setUltimaDescargaBackupSemana,
    sumarDiasBackup,
    tarjeta,
    temporadaActivaCierre,
    totalFilasBackupRestauracion,
    ultimaDescargaBackupSemana,
  } = ctx;

  return (
    <>
      {pantalla === 'temporadas' && esCoordinadorJefeApp && (
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
                DIRECCIÓN · TEMPORADAS
              </span>
              <h2 style={{ margin: '5px 0 0', color: '#ffffff', fontSize: 30 }}>
                Inicio y cierre de temporada
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
                Cierre seguro, copia maestra, nueva temporada y carga de semilla en un único flujo ordenado.
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
          <details
            style={{
              ...tarjeta,
              marginTop: 16,
              padding: 0,
              overflow: 'hidden',
              border: '1px solid rgba(234,88,12,.22)',
              background:
                'linear-gradient(135deg, rgba(255,247,237,.95), #fff 58%, rgba(248,250,252,.9))',
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
                    color: '#c2410c',
                    margin: '0 0 3px',
                  }}
                >
                  PASO 1 · REVISAR TEMPORADA
                </p>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 20,
                    lineHeight: 1.2,
                    overflowWrap: 'anywhere',
                  }}
                >
                  Preparar próxima temporada
                </h3>
                <div style={{ marginTop: 12 }}>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setMostrarFlujoCierre((actual) => !actual);
                    }}
                    style={{
                      width: '100%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: 12,
                      padding: '12px 14px',
                      border: '1px solid #cbd5e1',
                      borderRadius: 12,
                      background: '#f8fafc',
                      color: '#172033',
                      fontSize: 14,
                      fontWeight: 900,
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span>Ver flujo de cierre y nueva temporada</span>
                    <span aria-hidden="true">{mostrarFlujoCierre ? '−' : '+'}</span>
                  </button>

                  {mostrarFlujoCierre && (
                    <div
                      style={{
                        marginTop: 8,
                        padding: '12px 14px',
                        border: '1px solid #cbd5e1',
                        borderRadius: 12,
                        background: '#f8fafc',
                        color: '#475569',
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ol
                        style={{
                          margin: 0,
                          paddingLeft: 20,
                          display: 'grid',
                          gap: 7,
                        }}
                      >
                        <li>
                          <strong>Paso 1:</strong> analizar la temporada, revisar
                          “Conservar / Eliminar” y descargar la copia maestra.
                        </li>
                        <li>
                          <strong>Paso 2:</strong> guardar el backup completo de
                          Supabase y cerrar la temporada actual.
                        </li>
                        <li>
                          <strong>Paso 3:</strong> iniciar la nueva temporada.
                        </li>
                        <li>
                          <strong>Paso 4:</strong> cargar en la nueva temporada el
                          CSV semilla o la copia maestra descargada.
                        </li>
                      </ol>
                    </div>
                  )}
                </div>



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
                borderTop: '1px solid rgba(234,88,12,.12)',
              }}
            >
              <div
                style={{
                  padding: 13,
                  border: '1px solid #fed7aa',
                  borderRadius: 14,
                  background: '#fff7ed',
                  color: '#9a3412',
                  fontWeight: 800,
                  lineHeight: 1.4,
                }}
              >
                Este paso es únicamente de lectura. No elimina alumnos, reportes,
                grupos, cobros ni ninguna otra información. Descarga aquí la copia maestra,
                pero NO vuelvas a cargarla todavía: la semilla se importa en el Paso 4,
                después de cerrar la temporada vieja y activar la nueva.
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  gap: 12,
                  flexWrap: 'wrap',
                  marginTop: 14,
                }}
              >
                <p
                  style={{
                    margin: 0,
                    color: '#475569',
                    lineHeight: 1.45,
                    flex: '1 1 430px',
                  }}
                >
                  “Con actividad” significa que el alumno ya tiene al menos una
                  asistencia real o un reporte en esta temporada. Al principio de
                  curso es normal que todos estén a 0: siguen siendo alumnos cargados
                  y NO son candidatos reales a borrar hasta el cierre de final de temporada.
                </p>

                <button
                  type="button"
                  onClick={analizarCierreTemporada}
                  disabled={cierreTemporadaCargando}
                  style={{
                    ...botonPrincipal,
                    flex: '0 1 220px',
                    minWidth: 0,
                    minHeight: 46,
                    whiteSpace: 'normal',
                    opacity: cierreTemporadaCargando ? 0.65 : 1,
                  }}
                >
                  {cierreTemporadaCargando
                    ? 'Analizando...'
                    : cierreTemporadaAnalizado
                    ? 'Actualizar análisis'
                    : 'Analizar temporada'}
                </button>
              </div>

              {cierreTemporadaError && (
                <div style={{ ...errorCaja, marginTop: 12 }}>
                  {cierreTemporadaError}
                </div>
              )}

              {resumenCierreTemporada && (
                <>
                  {resumenCierreTemporada.total_alumnos_base > 0 &&
                    resumenCierreTemporada.activos_temporada === 0 && (
                      <div
                        style={{
                          marginTop: 14,
                          padding: '13px 14px',
                          borderRadius: 14,
                          border: '1px solid #bbf7d0',
                          background: '#f0fdf4',
                          color: '#166534',
                          fontWeight: 900,
                          lineHeight: 1.45,
                        }}
                      >
                        INICIO DE TEMPORADA · {resumenCierreTemporada.total_alumnos_base} alumnos
                        cargados como semilla. Todavía no tienen entrenamientos ni reportes.
                        No hay nada que cerrar ni borrar.
                      </div>
                    )}

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(min(100%, 145px), 1fr))',
                      gap: 10,
                      marginTop: 14,
                    }}
                  >
                    <div style={miniTarjetaBlanca}>
                      <strong>Total alumnos cargados</strong>
                      <div style={{ fontSize: 26, fontWeight: 900, marginTop: 5 }}>
                        {resumenCierreTemporada.total_alumnos_base}
                      </div>
                    </div>
                    <div style={miniTarjetaBlanca}>
                      <strong>Con actividad esta temporada</strong>
                      <div style={{ fontSize: 26, fontWeight: 900, marginTop: 5 }}>
                        {resumenCierreTemporada.activos_temporada}
                      </div>
                    </div>
                    <div style={miniTarjetaBlanca}>
                      <strong>
                        {resumenCierreTemporada.activos_temporada === 0
                          ? 'Semilla cargada'
                          : 'Conservar siguiente temporada'}
                      </strong>
                      <div
                        style={{
                          fontSize: 26,
                          fontWeight: 900,
                          marginTop: 5,
                          color: '#15803d',
                        }}
                      >
                        {resumenCierreTemporada.activos_temporada === 0
                          ? resumenCierreTemporada.total_alumnos_base
                          : resumenCierreTemporada.conservar_siguiente}
                      </div>
                    </div>
                    <div style={miniTarjetaBlanca}>
                      <strong>
                        {resumenCierreTemporada.activos_temporada === 0
                          ? 'Sin entrenar todavía'
                          : 'Candidatos a eliminar al cierre'}
                      </strong>
                      <div
                        style={{
                          fontSize: 26,
                          fontWeight: 900,
                          marginTop: 5,
                          color:
                            resumenCierreTemporada.activos_temporada === 0
                              ? '#c2410c'
                              : '#b91c1c',
                        }}
                      >
                        {resumenCierreTemporada.activos_temporada === 0
                          ? resumenCierreTemporada.total_alumnos_base
                          : resumenCierreTemporada.eliminar_por_inactividad}
                      </div>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
                      gap: 9,
                      marginTop: 12,
                    }}
                  >
                    {([
                      ['todos', 'Todos'],
                      [
                        'conservar',
                        resumenCierreTemporada.activos_temporada === 0
                          ? 'Con actividad'
                          : 'Conservar',
                      ],
                      [
                        'eliminar',
                        resumenCierreTemporada.activos_temporada === 0
                          ? 'Sin actividad todavía'
                          : 'Eliminar',
                      ],
                    ] as const).map(([valor, etiqueta]) => (
                      <button
                        key={`cierre-${valor}`}
                        type="button"
                        onClick={() => setFiltroCierreTemporada(valor)}
                        style={{
                          ...botonMenu(filtroCierreTemporada === valor),
                          width: '100%',
                          minWidth: 0,
                          minHeight: 44,
                          whiteSpace: 'normal',
                        }}
                      >
                        {etiqueta}
                      </button>
                    ))}
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) minmax(190px, auto)',
                      gap: 10,
                      alignItems: 'end',
                      marginTop: 12,
                    }}
                  >
                    <label style={{ ...labelCampo, minWidth: 0, width: '100%' }}>
                      Buscar alumno
                      <input
                        value={busquedaCierreTemporada}
                        onChange={(e) => setBusquedaCierreTemporada(e.target.value)}
                        placeholder="Nombre, nivel, modalidad..."
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
                      onClick={descargarCopiaMaestraTemporada}
                      disabled={resumenCierreTemporada.activos_temporada === 0}
                      style={{
                        ...botonPrincipal,
                        width: '100%',
                        minWidth: 0,
                        minHeight: 46,
                        whiteSpace: 'normal',
                        opacity:
                          resumenCierreTemporada.activos_temporada === 0 ? 0.55 : 1,
                      }}
                    >
                      {resumenCierreTemporada.activos_temporada === 0
                        ? 'Copia maestra disponible al final de temporada'
                        : 'Descargar copia maestra'}
                    </button>
                  </div>

                  {(() => {
                    const termino = busquedaCierreTemporada.trim().toLowerCase();
                    const filas = cierreTemporadaAlumnos.filter((fila) => {
                      if (
                        filtroCierreTemporada === 'conservar' &&
                        !fila.conservar_siguiente
                      )
                        return false;
                      if (
                        filtroCierreTemporada === 'eliminar' &&
                        fila.conservar_siguiente
                      )
                        return false;
                      if (!termino) return true;
                      return `${fila.alumno} ${fila.ultimo_nivel_real || ''} ${
                        fila.ultima_modalidad || ''
                      } ${fila.motivo_estado || ''}`
                        .toLowerCase()
                        .includes(termino);
                    });

                    return (
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
                            minWidth: 860,
                            borderCollapse: 'collapse',
                          }}
                        >
                          <thead>
                            <tr style={{ background: '#f8fafc' }}>
                              {[
                                'Alumno',
                                'Nivel',
                                'Último entreno',
                                'Modalidad',
                                'Entrenos',
                                'Estado',
                              ].map((titulo) => (
                                <th
                                  key={`cierre-${titulo}`}
                                  style={{
                                    padding: '10px 12px',
                                    textAlign: titulo === 'Alumno' ? 'left' : 'center',
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
                            {filas.map((fila) => (
                              <tr key={`cierre-${fila.alumno_id}`}>
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
                                  {fila.ultimo_nivel_real || '-'}
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
                                  }}
                                >
                                  {fila.ultima_modalidad || '-'}
                                </td>
                                <td
                                  style={{
                                    padding: '10px 12px',
                                    borderBottom: '1px solid #f1f5f9',
                                    textAlign: 'center',
                                    fontWeight: 900,
                                  }}
                                >
                                  {fila.entrenamientos_temporada}
                                </td>
                                <td
                                  style={{
                                    padding: '10px 12px',
                                    borderBottom: '1px solid #f1f5f9',
                                    textAlign: 'center',
                                    color: fila.conservar_siguiente
                                      ? '#15803d'
                                      : '#b91c1c',
                                    fontWeight: 900,
                                  }}
                                >
                                  {resumenCierreTemporada.activos_temporada === 0
                                    ? 'Semilla · sin actividad todavía'
                                    : fila.conservar_siguiente
                                    ? 'Conservar'
                                    : 'Eliminar'}
                                  <span
                                    style={{
                                      display: 'block',
                                      marginTop: 3,
                                      color: '#64748b',
                                      fontSize: 11,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {fila.motivo_estado}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    );
                  })()}
                </>
              )}
            </div>


          </details>

          <details
            style={{
              ...tarjeta,
              marginTop: 16,
              padding: 0,
              overflow: 'hidden',
              border: '1px solid #fecaca',
              background: '#fff',
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
                    color: '#b91c1c',
                    margin: '0 0 4px',
                  }}
                >
                  PASO 2 · CIERRE DEFINITIVO
                </p>
                <h3 style={{ margin: 0, fontSize: 20 }}>Cerrar temporada al finalizar el curso</h3>
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
                  border: '1px solid #fecaca',
                  background: '#fff',
                  color: '#b91c1c',
                  fontWeight: 900,
                  fontSize: 20,
                }}
              >
                ↕
              </span>
            </summary>

            <div
              style={{
                padding: '0 18px 18px',
                borderTop: '1px solid #fee2e2',
              }}
            >
              {resumenCierreTemporada &&
              resumenCierreTemporada.total_alumnos_base > 0 &&
              resumenCierreTemporada.activos_temporada === 0 ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 14,
                    border: '1px solid #bbf7d0',
                    background: '#f0fdf4',
                    color: '#166534',
                    fontWeight: 900,
                    lineHeight: 1.45,
                  }}
                >
                  Temporada en fase de arranque · {resumenCierreTemporada.total_alumnos_base}{' '}
                  alumnos cargados y todavía sin actividad. El cierre está desactivado
                  porque ahora debes empezar a trabajar la temporada, no borrarla.
                </div>
              ) : !resumenCierreTemporada ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid #e2e8f0',
                    background: '#f8fafc',
                    color: '#64748b',
                    fontWeight: 800,
                  }}
                >
                  Completa primero el Paso 1 para poder cerrar la temporada.
                </div>
              ) : (
                <div
                  style={{
                    marginTop: 14,
                    padding: 14,
                    borderRadius: 14,
                    border: '1px solid #fecaca',
                    background: '#fff7f7',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      gap: 9,
                      alignItems: 'flex-start',
                      color: '#475569',
                      fontWeight: 800,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={confirmacionBackupCierre}
                      onChange={(e) => setConfirmacionBackupCierre(e.target.checked)}
                      style={{ marginTop: 3 }}
                    />
                    <span>Backup Supabase y copia maestra guardados.</span>
                  </label>

                  <label
                    style={{
                      display: 'flex',
                      gap: 9,
                      alignItems: 'flex-start',
                      marginTop: 10,
                      color: '#475569',
                      fontWeight: 800,
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={confirmacionListadoCierre}
                      onChange={(e) => setConfirmacionListadoCierre(e.target.checked)}
                      style={{ marginTop: 3 }}
                    />
                    <span>Listado “Eliminar” revisado.</span>
                  </label>

                  <label
                    style={{
                      ...labelCampo,
                      display: 'block',
                      marginTop: 14,
                      width: '100%',
                    }}
                  >
                    Escribe exactamente
                    <strong
                      style={{
                        display: 'block',
                        marginTop: 4,
                        color: '#991b1b',
                      }}
                    >
                      CERRAR {resumenCierreTemporada.temporada}
                    </strong>
                    <input
                      value={confirmacionCierreTexto}
                      onChange={(e) => setConfirmacionCierreTexto(e.target.value)}
                      placeholder={`CERRAR ${resumenCierreTemporada.temporada}`}
                      style={{
                        ...inputCampo,
                        width: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        marginTop: 7,
                      }}
                    />
                  </label>

                  <button
                    type="button"
                    onClick={ejecutarCierreDefinitivoTemporada}
                    disabled={cerrandoTemporada}
                    style={{
                      ...botonPrincipal,
                      width: '100%',
                      minHeight: 48,
                      marginTop: 14,
                      background: '#b91c1c',
                      borderColor: '#b91c1c',
                      opacity: cerrandoTemporada ? 0.65 : 1,
                    }}
                  >
                    {cerrandoTemporada
                      ? 'Cerrando temporada...'
                      : 'Cerrar temporada definitivamente'}
                  </button>

                  {cierreTemporadaError && (
                    <div style={{ ...errorCaja, marginTop: 12 }}>
                      {cierreTemporadaError}
                    </div>
                  )}
                </div>
              )}

              {resultadoCierreTemporada && (
                <div
                  style={{
                    marginTop: 12,
                    padding: 12,
                    borderRadius: 12,
                    border: '1px solid #bbf7d0',
                    background: '#f0fdf4',
                    color: '#166534',
                    fontWeight: 900,
                  }}
                >
                  {resultadoCierreTemporada}
                </div>
              )}

            </div>
          </details>

          <article
            style={{
              ...tarjeta,
              marginTop: 16,
              padding: 0,
              overflow: 'hidden',
              border: '1px solid #bfdbfe',
              background: '#fff',
            }}
          >
            <div style={{ padding: '16px 18px' }}>
              <p
                style={{
                  ...etiquetaSuperior,
                  color: '#1d4ed8',
                  margin: '0 0 4px',
                }}
              >
                PASO 3 · ARRANQUE DE TEMPORADA
              </p>
              <h3 style={{ margin: 0, fontSize: 20 }}>Estado de temporada</h3>

              {cargandoTemporadaActivaCierre ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid #cbd5e1',
                    background: '#f8fafc',
                    color: '#475569',
                    fontWeight: 900,
                  }}
                >
                  Comprobando temporada activa...
                </div>
              ) : errorTemporadaActivaCierre ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: '12px 14px',
                    borderRadius: 12,
                    border: '1px solid #fecaca',
                    background: '#fef2f2',
                    color: '#991b1b',
                    fontWeight: 800,
                    lineHeight: 1.45,
                  }}
                >
                  <strong>No se ha podido comprobar la temporada activa.</strong>
                  <div style={{ marginTop: 4 }}>
                    Por seguridad, no se habilita el inicio de una temporada hasta conocer el estado real.
                  </div>
                  <button
                    type="button"
                    onClick={cargarTemporadaActivaCierre}
                    style={{ ...botonSecundario, marginTop: 10 }}
                  >
                    Reintentar
                  </button>
                </div>
              ) : temporadaActivaCierre ? (
                <div
                  style={{
                    marginTop: 14,
                    padding: '13px 14px',
                    borderRadius: 12,
                    border: '1px solid #bbf7d0',
                    background: '#f0fdf4',
                    color: '#166534',
                    fontWeight: 800,
                    lineHeight: 1.45,
                  }}
                >
                  <strong>Temporada en curso · {temporadaActivaCierre}</strong>
                  <div style={{ marginTop: 4 }}>
                    No hay nada que iniciar ahora. El arranque de la siguiente temporada se habilitará cuando cierres la temporada actual.
                  </div>
                </div>
              ) : (
                <>
                  <div
                    style={{
                      marginTop: 14,
                      padding: '11px 13px',
                      borderRadius: 12,
                      border: '1px solid #fde68a',
                      background: '#fffbeb',
                      color: '#92400e',
                      fontWeight: 800,
                      lineHeight: 1.4,
                    }}
                  >
                    No hay ninguna temporada activa. Ahora sí puedes iniciar la siguiente.
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: 'minmax(0, 1fr) auto',
                      gap: 10,
                      alignItems: 'end',
                      marginTop: 14,
                    }}
                  >
                    <div
                      style={{
                        minWidth: 0,
                        padding: '11px 13px',
                        borderRadius: 12,
                        border: '1px solid #bfdbfe',
                        background: '#eff6ff',
                        color: '#1e3a8a',
                        lineHeight: 1.4,
                      }}
                    >
                      <div style={{ fontSize: 12, fontWeight: 900 }}>
                        SIGUIENTE TEMPORADA
                      </div>
                      <strong style={{ fontSize: 18 }}>
                        {nombreTemporadaAgenda(anioInicioTemporadaAgenda)}
                      </strong>
                      <div style={{ marginTop: 3, fontSize: 12, fontWeight: 700 }}>
                        La app solo permite iniciar la temporada inmediatamente siguiente. No tienes que elegir años manualmente.
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={iniciarNuevaTemporadaOperativa}
                      disabled={iniciandoNuevaTemporada}
                      style={{
                        ...botonPrincipal,
                        minHeight: 44,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {iniciandoNuevaTemporada
                        ? 'Iniciando...'
                        : `Iniciar ${nombreTemporadaAgenda(anioInicioTemporadaAgenda)}`}
                    </button>
                  </div>

                  {resultadoNuevaTemporada && (
                    <div
                      style={{
                        marginTop: 12,
                        padding: 12,
                        borderRadius: 12,
                        border: '1px solid #bbf7d0',
                        background: '#f0fdf4',
                        color: '#166534',
                        fontWeight: 900,
                      }}
                    >
                      {resultadoNuevaTemporada}
                    </div>
                  )}
                </>
              )}
            </div>
          </article>

          <details
            style={{
              ...tarjeta,
              marginTop: 16,
              padding: 0,
              overflow: 'hidden',
              border: '1px solid rgba(14,116,144,.22)',
              background:
                'linear-gradient(135deg, rgba(236,254,255,.94), #fff 58%, rgba(248,250,252,.9))',
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
                    color: '#0e7490',
                    margin: '0 0 3px',
                  }}
                >
                  PASO 4 · CARGAR SEMILLA
                </p>
                <h3
                  style={{
                    margin: 0,
                    fontSize: 20,
                    lineHeight: 1.2,
                    overflowWrap: 'anywhere',
                  }}
                >
                  Cargar alumnos de la nueva temporada
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

            <div
              style={{
                padding: '16px 18px 18px',
                borderTop: '1px solid rgba(14,116,144,.12)',
              }}
            >
              <div
                style={{
                  padding: 13,
                  border: '1px solid #bfdbfe',
                  borderRadius: 14,
                  background: '#eff6ff',
                  color: '#1e40af',
                  fontWeight: 900,
                  lineHeight: 1.4,
                  marginBottom: 12,
                }}
              >
                Temporada activa: {temporadaActivaCierre || 'NINGUNA'}.
                Si pone NINGUNA, vuelve al Paso 3 y activa la nueva temporada antes de importar.
              </div>

              <div
                style={{
                  padding: 13,
                  border: '1px solid #a5f3fc',
                  borderRadius: 14,
                  background: '#ecfeff',
                  color: '#155e75',
                  fontWeight: 800,
                  lineHeight: 1.4,
                }}
              >
                Primero seleccionas y validas el CSV. Solo al pulsar
                “Cargar semilla en alumnos” se escriben los alumnos en la temporada activa.
              </div>

              <label
                style={{
                  ...labelCampo,
                  display: 'block',
                  width: '100%',
                  marginTop: 14,
                }}
              >
                Seleccionar CSV semilla / copia maestra
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) =>
                    cargarCopiaMaestraParaRevisar(e.target.files?.[0] || null)
                  }
                  style={{
                    ...inputCampo,
                    display: 'block',
                    width: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    marginTop: 6,
                  }}
                />
              </label>

              {errorCopiaMaestraImport && (
                <div style={{ ...errorCaja, marginTop: 12 }}>
                  {errorCopiaMaestraImport}
                </div>
              )}

              {filasCopiaMaestraImport.length > 0 && (() => {
                const validas = filasCopiaMaestraImport.filter((fila) => fila.valido);
                const errores = filasCopiaMaestraImport.length - validas.length;

                return (
                  <>
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
                        gap: 10,
                        marginTop: 14,
                      }}
                    >
                      <div style={miniTarjetaBlanca}>
                        <strong>Archivo</strong>
                        <p
                          style={{
                            margin: '6px 0 0',
                            color: '#475569',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {archivoCopiaMaestraNombre}
                        </p>
                      </div>
                      <div style={miniTarjetaBlanca}>
                        <strong>Alumnos</strong>
                        <div style={{ fontSize: 26, fontWeight: 900, marginTop: 5 }}>
                          {filasCopiaMaestraImport.length}
                        </div>
                      </div>
                      <div style={miniTarjetaBlanca}>
                        <strong>Correctos</strong>
                        <div
                          style={{
                            fontSize: 26,
                            fontWeight: 900,
                            marginTop: 5,
                            color: '#15803d',
                          }}
                        >
                          {validas.length}
                        </div>
                      </div>
                      <div style={miniTarjetaBlanca}>
                        <strong>Con errores</strong>
                        <div
                          style={{
                            fontSize: 26,
                            fontWeight: 900,
                            marginTop: 5,
                            color: errores > 0 ? '#b91c1c' : '#15803d',
                          }}
                        >
                          {errores}
                        </div>
                      </div>
                    </div>

                    {resultadoImportacionCopiaMaestra && (
                      <div
                        style={{
                          marginTop: 12,
                          padding: 12,
                          borderRadius: 14,
                          border: '1px solid #bbf7d0',
                          background: '#f0fdf4',
                          color: '#166534',
                          fontWeight: 800,
                          lineHeight: 1.4,
                        }}
                      >
                        {resultadoImportacionCopiaMaestra}
                      </div>
                    )}

                    <div
                      style={{
                        marginTop: 12,
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                        gap: 10,
                        alignItems: 'center',
                        padding: 12,
                        borderRadius: 14,
                        border: '1px solid #dbeafe',
                        background: '#f8fafc',
                      }}
                    >
                      <button
                        type="button"
                        onClick={importarCopiaMaestraEnAlumnos}
                        disabled={errores > 0 || importandoCopiaMaestra}
                        style={{
                          ...botonPrincipal,
                          width: '100%',
                          minWidth: 0,
                          minHeight: 48,
                          whiteSpace: 'normal',
                          opacity:
                            errores > 0 || importandoCopiaMaestra ? 0.55 : 1,
                        }}
                      >
                        {importandoCopiaMaestra
                          ? 'Cargando semilla...'
                          : 'Cargar semilla en alumnos'}
                      </button>
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
                          minWidth: 900,
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
                              'Modalidad',
                              'Entrenos',
                              'Validación',
                            ].map((titulo) => (
                              <th
                                key={`import-${titulo}`}
                                style={{
                                  padding: '10px 12px',
                                  textAlign: titulo === 'Alumno' ? 'left' : 'center',
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
                          {filasCopiaMaestraImport.map((fila, index) => (
                            <tr key={`import-${fila.alumno}-${index}`}>
                              <td
                                style={{
                                  padding: '10px 12px',
                                  borderBottom: '1px solid #f1f5f9',
                                  fontWeight: 800,
                                }}
                              >
                                {fila.alumno || '-'}
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                {fila.ultimo_nivel_real || '-'}
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                {fila.pista || '-'}
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                {fila.ultimo_entreno || '-'}
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                {fila.ultima_modalidad || '-'}
                              </td>
                              <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                                {fila.entrenamientos_temporada}
                              </td>
                              <td
                                style={{
                                  padding: '10px 12px',
                                  textAlign: 'center',
                                  color: fila.valido ? '#15803d' : '#b91c1c',
                                  fontWeight: 900,
                                }}
                              >
                                {fila.valido ? 'Correcto' : fila.error}
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




<article style={{ ...tarjeta, marginTop: 16 }}>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h3 style={{ margin: 0 }}>Copia de seguridad semanal</h3>
                <p style={{ margin: '5px 0 0', color: '#64748b', fontSize: 13 }}>
                  Backup JSON restaurable de la operativa.
                </p>
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 230px), 1fr))',
                gap: 10,
                marginTop: 14,
                alignItems: 'end',
              }}
            >
              <label style={{ ...labelCampo, minWidth: 0 }}>
                Semana a guardar
                <select
                  value={semanaBackupObjetivo}
                  onChange={(e) => {
                    setSemanaBackupSeleccionada(e.target.value);
                    setUltimaDescargaBackupSemana('');
                  }}
                  style={{ ...selectCampoAgenda, width: '100%' }}
                >
                  {semanasAgenda.map((semana) => (
                    <option key={`backup-${semana}`} value={semana}>
                      {rangoSemanaAgenda(semana)}
                    </option>
                  ))}
                </select>
              </label>

              <button
                type="button"
                onClick={descargarBackupSemanalJson}
                style={{ ...botonSecundario, minHeight: 44 }}
              >
                Descargar backup de esta semana
              </button>
            </div>

            <div
              style={{
                ...(backupSemanaRealizado || ultimaDescargaBackupSemana
                  ? avisoCompleto
                  : avisoPendiente),
                marginTop: 12,
              }}
            >
              Semana {rangoSemanaAgenda(semanaBackupObjetivo)} ·{' '}
              {backupSemanaRealizado || ultimaDescargaBackupSemana
                ? `Copia guardada: ${
                    backupSemanaRealizado || ultimaDescargaBackupSemana
                  }`
                : '⚠️ Falta guardar la copia de esta semana'}
            </div>

            <p
              style={{
                margin: '8px 0 0',
                color: '#64748b',
                fontSize: 12,
                overflowWrap: 'anywhere',
              }}
            >
              Nombre: MITICO_BACKUP_{(temporadaActivaCierre || 'TEMPORADA').replace(
                /\//g,
                '-'
              )}_SEMANA_{semanaBackupObjetivo}_A_
              {semanaBackupObjetivo
                ? sumarDiasBackup(semanaBackupObjetivo, 6)
                : '---- -- --'}
              _GENERADO_{fechaIsoEditor(new Date())}.json
            </p>

            <details
              style={{
                marginTop: 14,
                border: '1px solid #e2e8f0',
                borderRadius: 14,
                overflow: 'hidden',
                background: '#fff',
              }}
            >
              <summary
                style={{
                  cursor: 'pointer',
                  listStyle: 'none',
                  padding: '13px 14px',
                  fontWeight: 900,
                  color: '#334155',
                }}
              >
                Restaurar una copia semanal
              </summary>

              <div
                style={{
                  padding: '14px',
                  borderTop: '1px solid #e2e8f0',
                }}
              >
                <label style={{ ...labelCampo, display: 'block', width: '100%' }}>
                  Seleccionar backup JSON
                  <input
                    type="file"
                    accept=".json,application/json"
                    onChange={(e) =>
                      cargarBackupSemanalParaRestaurar(
                        e.target.files?.[0] || null
                      )
                    }
                    style={{
                      ...inputCampo,
                      width: '100%',
                      minWidth: 0,
                      boxSizing: 'border-box',
                      marginTop: 6,
                    }}
                  />
                </label>

                {errorBackupRestauracion && (
                  <div style={{ ...errorCaja, marginTop: 12 }}>
                    {errorBackupRestauracion}
                  </div>
                )}

                {backupRestauracion && (
                  <div
                    style={{
                      marginTop: 12,
                      display: 'grid',
                      gap: 12,
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
                        gap: 10,
                      }}
                    >
                      <div style={miniTarjetaBlanca}>
                        <strong>Archivo</strong>
                        <p
                          style={{
                            margin: '5px 0 0',
                            overflowWrap: 'anywhere',
                            color: '#475569',
                          }}
                        >
                          {archivoBackupRestauracion}
                        </p>
                      </div>
                      <div style={miniTarjetaBlanca}>
                        <strong>Temporada</strong>
                        <div style={{ marginTop: 5, fontWeight: 900 }}>
                          {backupRestauracion.temporada || '-'}
                        </div>
                      </div>
                      <div style={miniTarjetaBlanca}>
                        <strong>Semana</strong>
                        <div style={{ marginTop: 5, fontWeight: 900 }}>
                          {backupRestauracion.semana_inicio} →{' '}
                          {backupRestauracion.semana_fin}
                        </div>
                      </div>
                      <div style={miniTarjetaBlanca}>
                        <strong>Filas</strong>
                        <div
                          style={{
                            marginTop: 5,
                            fontSize: 24,
                            fontWeight: 900,
                          }}
                        >
                          {totalFilasBackupRestauracion(backupRestauracion)}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        padding: 14,
                        borderRadius: 14,
                        border: '1px solid #fecaca',
                        background: '#fff7f7',
                      }}
                    >
                      <label
                        style={{
                          ...labelCampo,
                          display: 'block',
                          width: '100%',
                        }}
                      >
                        Para restaurar escribe exactamente
                        <strong
                          style={{
                            display: 'block',
                            marginTop: 4,
                            color: '#991b1b',
                          }}
                        >
                          RESTAURAR {backupRestauracion.semana_inicio}
                        </strong>
                        <input
                          value={confirmacionBackupRestauracion}
                          onChange={(e) =>
                            setConfirmacionBackupRestauracion(e.target.value)
                          }
                          style={{
                            ...inputCampo,
                            width: '100%',
                            minWidth: 0,
                            boxSizing: 'border-box',
                            marginTop: 7,
                          }}
                        />
                      </label>

                      <button
                        type="button"
                        onClick={restaurarBackupSemanal}
                        disabled={
                          restaurandoBackupSemanal ||
                          confirmacionBackupRestauracion.trim() !==
                            `RESTAURAR ${backupRestauracion.semana_inicio}`
                        }
                        style={{
                          ...botonPrincipal,
                          width: '100%',
                          minHeight: 48,
                          marginTop: 12,
                          background: '#b91c1c',
                          borderColor: '#b91c1c',
                          opacity:
                            restaurandoBackupSemanal ||
                            confirmacionBackupRestauracion.trim() !==
                              `RESTAURAR ${backupRestauracion.semana_inicio}`
                              ? 0.5
                              : 1,
                        }}
                      >
                        {restaurandoBackupSemanal
                          ? 'Restaurando...'
                          : 'Restaurar esta copia'}
                      </button>
                    </div>
                  </div>
                )}

                {resultadoRestauracionBackup && (
                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 12,
                      border: '1px solid #bbf7d0',
                      background: '#f0fdf4',
                      color: '#166534',
                      fontWeight: 900,
                    }}
                  >
                    {resultadoRestauracionBackup}
                  </div>
                )}
              </div>
            </details>
          </article>
        </section>
      )}

    </>
  );
}

