import React from 'react';
import { CampoSelect } from '../lib/appHelpers';
export function PantallaIntensivos(ctx: any) {
  const { abrirPanelIntensivo, actualizarDiaIntensivoDesdeApp, actualizarDiplomaIntensivo,
    actualizarNivelAlumnoIntensivo, actualizarRecuperacionIntensivo, agendaBadgeModalidad,
    agendaAlumnoLinea, agendaGrupoLinea, agendaGrupoPropuesta,
    agruparRecomendacionesDia, alumnoSeleccionadoIntensivoId, alumnosDelIntensivo,
    alumnosDisponiblesParaIntensivo, asistenciasDelIntensivoDia, autoproponerNivelesDiploma,
    avisoCompleto, avisoDisponibilidadDiaIntensivo, avisoNeutral, avisoPendiente,
    ayudaDesplegableCompacta, añadirAlumnoAIntensivo, barraPasosIntensivo,
    borrarDiaIntensivoDesdeApp, borrarGrupoIntensivo, borrarIntensivoCompleto, botonMenu,
    botonPasoIntensivo, botonPeligro, botonPeligroMini, botonPrincipal, botonSecundario, buscador,
    busquedaAlumnoIntensivo, busquedaIntensivos, cabeceraPantalla,
    calcularFechasCuatroSesionesIntensivo, cargando, cargarIntensivos, cerrarPanelesIntensivo,
    chipResumenCursoIntensivo, claveAlumnoRecomendado, claveGrupoRecomendado, codigoNivelPorId,
    crearCuatroSesionesIntensivo, crearGrupoDesdeRecomendacion,
    crearTodosGruposDesdeRecomendacionIntensivo, crearGrupoNormalIntensivo,
    crearGrupoVacioPropuestaIntensivo, generarPlantillaCuatroDiasIntensivo,
    crearPlantillaCuatroDiasIntensivo, cargarEdicionGruposIntensivoDia,
    guardarComposicionDiaIntensivo,
    crearIntensivoDesdeApp, destinoAlumnoRecomendado, diaActivoIntensivoId,
    diaAsistenciaSeleccionadoId, diaEditandoIntensivoId, diaGrupoSeleccionadoId,
    diaIntensivoInicial, diasDelIntensivo, eliminarRecuperacionIntensivo, entrenadores,
    entrenadoresApoyoPorGrupoRecomendado, entrenadoresDisponiblesDiaIntensivo,
    entrenadoresPorGrupoRecomendado, error, estiloBadgePistaApp, estiloGrupoPorPistaApp,
    estiloValidacionPedagogicaApp, etiquetaPistaVisualApp, etiquetaSuperior, filtroIntensivos,
    formDiaIntensivo, formGrupoIntensivo, formIntensivo, formatearAlumnoListadoOperativo, formatearFecha, formatearObservaciones,
    formularioCaja, generarMásDesdeAsistencias, generarRecomendacionGruposIntensivo,
    generarTrabajoDiarioAutomaticoGrupo, gestionarAlumnosIntensivoId,
    gestionarAsistenciaIntensivoId, gestionarDiplomasIntensivoId, gestionarGruposIntensivoId,
    gestionarMásIntensivoId, gestionarPanelControlIntensivoId, gridFormulario,
    gruposDestinoRecuperacion, gruposNormalesDelDiaIntensivo, guardarDiaIntensivo, inputCampo,
    intensivoCursoAbiertoId, intensivoInicial, intensivos, intensivosFiltrados, labelCampo,
    marcarAsistenciaIntensivo, miniTarjetaBlanca, mostrarFormularioIntensivo,
    mostrarPlantillaCuatroSesionesIntensivoId, mostrarVolcadoIntensivoId,
    necesitaDosEntrenadoresGrupoApp, nivelesDiplomaIntensivo, nombreGrupoVisualApp,
    nombresGruposBaseRecomendados, observacionesAutomaticasGrupoIntensivo,
    observacionesAutomaticasGrupoIntensivoManual, observacionesPorGrupoRecomendado,
    opcionesEstadoDiplomaIntensivo, opcionesEstadoRecuperacionIntensivo, opcionesNivel,
    opcionesOrigenNivelAlumno, opcionesPistaGrupoIntensivo, opcionesRecomendacionIntensivo,
    panelControlDelIntensivo, plantillaCuatroSesionesInicial, plantillaCuatroSesionesIntensivo,
    prepararEdicionDiaIntensivo, quitarAlumnoDeIntensivo, recomendacionesDelDiaIntensivo,
    recuperacionesDelIntensivo, reportesDetalleAlumnoIntensivo, responsableReporteRecomendadoApp,
    responsablesReportePorGrupoRecomendado, resultadoVolcadoIntensivo, resumenAlumnoIntensivo,
    resumenFinalDelIntensivo, resumenReportesDelIntensivo, selectCampo,
    setAlumnoSeleccionadoIntensivoId, setBusquedaAlumnoIntensivo, setBusquedaIntensivos,
    setDestinoAlumnoRecomendado, setDiaEditandoIntensivoId, setDiaGrupoSeleccionadoId,
    setEntrenadoresApoyoPorGrupoRecomendado, setEntrenadoresPorGrupoRecomendado,
    setFiltroIntensivos, setFormDiaIntensivo, setFormGrupoIntensivo, setFormIntensivo,
    setGestionarAlumnosIntensivoId, setGestionarDiplomasIntensivoId, setGestionarMásIntensivoId,
    setIntensivoCursoAbiertoId, setMostrarFormularioIntensivo,
    setMostrarPlantillaCuatroSesionesIntensivoId, setMostrarVolcadoIntensivoId,
    setObservacionesPorGrupoRecomendado, setPlantillaCuatroSesionesIntensivo,
    setRecomendacionesGrupoIntensivo, setResponsablesReportePorGrupoRecomendado,
    setResultadoVolcadoIntensivo, setTextoVolcadoIntensivo, setTrabajoDiarioPorGrupoRecomendado,
    tarjeta, tarjetaIntensivoCurso, textoBaseDiplomaIntensivo, textoNecesidadDosEntrenadoresApp,
    textoValidacionPedagogicaGrupoApp, textoVolcadoIntensivo, trabajoDiarioPorGrupoRecomendado,
    volcarListadoAlumnosIntensivo } = ctx;

  return (
        <section>
          <div style={cabeceraPantalla}>
            <div>
              <p style={etiquetaSuperior}>INTENSIVOS</p>
              <h2 style={{ margin: '4px 0 6px' }}>Intensivos</h2>
              <details style={{ ...ayudaDesplegableCompacta, marginTop: 8 }}>
                <summary>Ayuda rápida</summary>
                <p style={{ margin: '8px 0 0', color: '#475569' }}>
                  Crea el curso, recibe alumnos desde Administración, prepara grupos por día y termina la evaluación final con los reportes reales.
                </p>
              </details>
            </div>

            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={cargarIntensivos}>Actualizar intensivos</button>
              <button
                onClick={() => setMostrarFormularioIntensivo(!mostrarFormularioIntensivo)}
                style={botonPrincipal}
              >
                {mostrarFormularioIntensivo ? 'Cerrar formulario' : 'Crear intensivo'}
              </button>
            </div>
          </div>

          {mostrarFormularioIntensivo && (
            <article style={{ ...tarjeta, border: '2px solid #111', marginBottom: 16 }}>
              <h3 style={{ marginTop: 0 }}>Nuevo intensivo</h3>

              <div style={gridFormulario}>
                <label style={labelCampo}>
                  Temporada
                  <input
                    value={formIntensivo.temporada}
                    onChange={(e) =>
                      setFormIntensivo({ ...formIntensivo, temporada: e.target.value })
                    }
                    placeholder="2025/2026"
                    style={inputCampo}
                  />
                </label>

                <label style={labelCampo}>
                  Nombre del intensivo
                  <input
                    value={formIntensivo.nombre}
                    onChange={(e) =>
                      setFormIntensivo({ ...formIntensivo, nombre: e.target.value })
                    }
                    placeholder="Intensivo Navidad 2025"
                    style={inputCampo}
                  />
                </label>

                <label style={labelCampo}>
                  Lugar
                  <input
                    value={formIntensivo.lugar}
                    onChange={(e) =>
                      setFormIntensivo({ ...formIntensivo, lugar: e.target.value })
                    }
                    placeholder="Madrid SnowZone"
                    style={inputCampo}
                  />
                </label>

                <CampoSelect
                  label="Estado"
                  value={formIntensivo.estado}
                  opciones={['Abierto', 'Pendiente de evaluación final', 'Cerrado']}
                  onChange={(valor) =>
                    setFormIntensivo({ ...formIntensivo, estado: valor })
                  }
                />
              </div>

              <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                <button onClick={crearIntensivoDesdeApp} style={botonPrincipal}>
                  Guardar intensivo
                </button>
                <button
                  onClick={() => {
                    setMostrarFormularioIntensivo(false);
                    setFormIntensivo(intensivoInicial());
                  }}
                  style={botonSecundario}
                >
                  Cancelar
                </button>
              </div>
            </article>
          )}

          <input
            value={busquedaIntensivos}
            onChange={(e) => setBusquedaIntensivos(e.target.value)}
            placeholder="Buscar intensivo, temporada, estado o lugar..."
            style={buscador}
          />

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 16,
            }}
          >
            <button
              onClick={() => setFiltroIntensivos('todos')}
              style={botonMenu(filtroIntensivos === 'todos')}
            >
              Todos
            </button>

            <button
              onClick={() => setFiltroIntensivos('activos')}
              style={botonMenu(filtroIntensivos === 'activos')}
            >
              Abiertos
            </button>

            <button
              onClick={() => setFiltroIntensivos('cerrados')}
              style={botonMenu(filtroIntensivos === 'cerrados')}
            >
              Cerrados
            </button>

            <button
              onClick={() => setFiltroIntensivos('sin_alumnos')}
              style={botonMenu(filtroIntensivos === 'sin_alumnos')}
            >
              Sin alumnos
            </button>

            <button
              onClick={() => setFiltroIntensivos('proximos')}
              style={botonMenu(filtroIntensivos === 'proximos')}
            >
              Próximos
            </button>
          </div>

          {cargando && <p>Cargando intensivos...</p>}

          {!cargando && intensivosFiltrados.length === 0 && !error && (
            <article style={tarjeta}>
              <h3 style={{ marginTop: 0 }}>Sin intensivos</h3>
              <p style={{ marginBottom: 0 }}>
                No hay intensivos que coincidan con el filtro actual. Puedes crear uno desde el botón “Crear intensivo”.
              </p>
            </article>
          )}

          <section style={{ display: 'grid', gap: 12 }}>
            {intensivosFiltrados.map((intensivo) => {
              const estado = String(intensivo.estado || '').toLowerCase();
              const totalAlumnos = Number(intensivo.total_alumnos || 0);

              const esActivo =
                estado.includes('activo') ||
                estado.includes('abierto') ||
                estado.includes('en curso') ||
                estado.includes('publicado');

              const esCerrado =
                estado.includes('cerrado') ||
                estado.includes('finalizado') ||
                estado.includes('cancelado');

              const estadoVisual = esActivo
                ? avisoCompleto
                : esCerrado
                  ? avisoNeutral
                  : avisoPendiente;

              const formularioDiaAbierto = diaActivoIntensivoId === intensivo.intensivo_id;
              const gestorAlumnosAbierto =
                gestionarAlumnosIntensivoId === intensivo.intensivo_id;
              const volcadoAbierto =
                mostrarVolcadoIntensivoId === intensivo.intensivo_id;
              const totalVolcadoNuevos = resultadoVolcadoIntensivo.filter(
                (registro) => registro.resultado === 'NUEVO'
              ).length;
              const totalVolcadoExistentes = resultadoVolcadoIntensivo.filter(
                (registro) => registro.resultado === 'EXISTENTE'
              ).length;
              const alumnosInscritosIntensivo = alumnosDelIntensivo(
                intensivo.intensivo_id
              );
              const alumnosDisponiblesIntensivo = alumnosDisponiblesParaIntensivo(
                intensivo.intensivo_id
              );
              const gestorAsistenciaAbierto =
                gestionarAsistenciaIntensivoId === intensivo.intensivo_id;
              const diasIntensivo = diasDelIntensivo(intensivo.intensivo_id);
              const diaEditandoActual = diasIntensivo.find(
                (dia) => dia.intensivo_dia_id === diaEditandoIntensivoId
              );
              const diaSeleccionadoAsistencia =
                diasIntensivo.find(
                  (dia) => dia.intensivo_dia_id === diaAsistenciaSeleccionadoId
                ) || diasIntensivo[0];
              const asistenciasDiaSeleccionado = diaSeleccionadoAsistencia
                ? asistenciasDelIntensivoDia(
                    intensivo.intensivo_id,
                    diaSeleccionadoAsistencia.intensivo_dia_id
                  )
                : [];
              const gestorMásAbierto =
                gestionarMásIntensivoId === intensivo.intensivo_id;
              const recuperacionesIntensivo = recuperacionesDelIntensivo(
                intensivo.intensivo_id
              );
              const recuperacionesPendientesIntensivo = recuperacionesIntensivo.filter(
                (registro) =>
                  registro.estado !== 'Resuelta' && registro.estado !== 'Descartada'
              ).length;

              const gestorGruposAbierto =
                gestionarGruposIntensivoId === intensivo.intensivo_id;
              const diaSeleccionadoGrupo =
                diasIntensivo.find(
                  (dia) => dia.intensivo_dia_id === diaGrupoSeleccionadoId
                ) || diasIntensivo[0];
              const gruposDiaSeleccionado = diaSeleccionadoGrupo
                ? gruposNormalesDelDiaIntensivo(diaSeleccionadoGrupo.intensivo_dia_id)
                : [];
              const gruposRecomendadosDia = diaSeleccionadoGrupo
                ? agruparRecomendacionesDia(diaSeleccionadoGrupo.intensivo_dia_id)
                : [];
              const alumnosPendientesRecomendacion = diaSeleccionadoGrupo
                ? recomendacionesDelDiaIntensivo(diaSeleccionadoGrupo.intensivo_dia_id).length
                : 0;
              const nombresBaseRecomendados = diaSeleccionadoGrupo
                ? nombresGruposBaseRecomendados(diaSeleccionadoGrupo.intensivo_dia_id)
                : [];
              const resumenReportes = resumenReportesDelIntensivo(
                intensivo.intensivo_id
              );
              const gestorDiplomasAbierto =
                gestionarDiplomasIntensivoId === intensivo.intensivo_id;
              const resumenFinal = resumenFinalDelIntensivo(intensivo.intensivo_id);
              const recuperacionesActivasAlumno = new Set(
                recuperacionesIntensivo
                  .filter(
                    (registro) =>
                      registro.estado !== 'Resuelta' &&
                      registro.estado !== 'Descartada'
                  )
                  .map((registro) => registro.alumno_id)
              );
              const diplomasPendientes = resumenFinal.filter(
                (registro) => registro.estado_diploma !== 'Revisado'
              ).length;
              const gestorPanelControlAbierto =
                gestionarPanelControlIntensivoId === intensivo.intensivo_id;
              const panelControl = panelControlDelIntensivo(intensivo.intensivo_id);
              const intensivoCursoAbierto = intensivoCursoAbiertoId === intensivo.intensivo_id;

              return (
                <article key={intensivo.intensivo_id} style={tarjetaIntensivoCurso}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 14,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ flex: '1 1 420px' }}>
                      <p style={{ ...etiquetaSuperior, color: '#c2410c' }}>CURSO INTENSIVO</p>
                      <h3 style={{ margin: '2px 0 8px' }}>{intensivo.intensivo}</h3>
                      <p style={{ margin: 0, color: '#475569' }}>
                        {intensivo.temporada} · {intensivo.lugar} · {intensivo.fecha_inicio ? formatearFecha(intensivo.fecha_inicio) : '-'} → {intensivo.fecha_fin ? formatearFecha(intensivo.fecha_fin) : '-'}
                      </p>
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 10 }}>
                        <span style={chipResumenCursoIntensivo}><strong>{totalAlumnos}</strong> alumnos</span>
                        <span style={chipResumenCursoIntensivo}><strong>{diasIntensivo.length}/4</strong> días</span>
                        <span style={chipResumenCursoIntensivo}><strong>{diasIntensivo.reduce((total, dia) => total + gruposNormalesDelDiaIntensivo(dia.intensivo_dia_id).length, 0)}</strong> grupos</span>
                        <span style={chipResumenCursoIntensivo}><strong>{intensivo.estado}</strong></span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() => {
                          const abrir = intensivoCursoAbiertoId !== intensivo.intensivo_id;
                          cerrarPanelesIntensivo();
                          setIntensivoCursoAbiertoId(abrir ? intensivo.intensivo_id : null);
                        }}
                        style={intensivoCursoAbierto ? botonSecundario : botonPrincipal}
                      >
                        {intensivoCursoAbierto ? 'Cerrar intensivo' : 'Abrir intensivo'}
                      </button>
                      <button
                        type="button"
                        onClick={() => borrarIntensivoCompleto(intensivo)}
                        style={botonPeligro}
                      >
                        Eliminar intensivo
                      </button>
                    </div>
                  </div>

                  {intensivoCursoAbierto && (
                    <>

                  <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
                    <details style={ayudaDesplegableCompacta}>
                      <summary>Resumen por días</summary>
                      <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                        {diasIntensivo.length === 0 && <div style={avisoPendiente}>Sin días creados todavía.</div>}
                        {diasIntensivo.map((dia) => {
                          const gruposDia = gruposNormalesDelDiaIntensivo(dia.intensivo_dia_id);
                          const alumnosColocadosDia = gruposDia.reduce((total, grupo) => total + (grupo.total_alumnos || 0), 0);
                          const diaPreparado = gruposDia.length > 0 && alumnosColocadosDia >= alumnosInscritosIntensivo.length;
                          return (
                            <button
                              key={`${intensivo.intensivo_id}-resumen-dia-${dia.intensivo_dia_id}`}
                              type="button"
                              onClick={() => {
                                abrirPanelIntensivo(intensivo, 'grupos');
                                setDiaGrupoSeleccionadoId(dia.intensivo_dia_id);
                              }}
                              style={{
                                ...miniTarjetaBlanca,
                                textAlign: 'left',
                                cursor: 'pointer',
                                border: diaPreparado ? '1px solid rgba(22,163,74,.35)' : '1px solid rgba(249,115,22,.35)',
                                background: diaPreparado ? 'rgba(240,253,244,.92)' : 'rgba(255,247,237,.92)',
                              }}
                            >
                              <strong>Día {dia.numero_dia} · {formatearFecha(dia.fecha)}</strong>
                              <p style={{ margin: '4px 0 0', color: '#475569' }}>
                                {dia.hora_inicio.slice(0, 5)}–{dia.hora_fin.slice(0, 5)} · {gruposDia.length} grupos · {alumnosColocadosDia}/{alumnosInscritosIntensivo.length} alumnos colocados
                              </p>
                            </button>
                          );
                        })}
                      </div>
                    </details>
                  </div>

                  <div style={barraPasosIntensivo}>
                    <button
                      onClick={() => abrirPanelIntensivo(intensivo, 'dias')}
                      style={botonPasoIntensivo(formularioDiaAbierto)}
                    >
                      1 · Configuración
                    </button>

                    <button
                      onClick={() => abrirPanelIntensivo(intensivo, 'alumnos')}
                      style={botonPasoIntensivo(gestorAlumnosAbierto)}
                    >
                      2 · Alumnos inscritos
                    </button>

                    <button
                      onClick={() => abrirPanelIntensivo(intensivo, 'grupos')}
                      style={botonPasoIntensivo(gestorGruposAbierto)}
                    >
                      3 · Grupos por día
                    </button>

                    <button
                      onClick={() => abrirPanelIntensivo(intensivo, 'asistencia')}
                      style={botonPasoIntensivo(gestorAsistenciaAbierto)}
                    >
                      4 · Faltas / recuperaciones
                    </button>

                    <button
                      onClick={() => abrirPanelIntensivo(intensivo, 'diplomas')}
                      style={botonPasoIntensivo(gestorDiplomasAbierto)}
                    >
                      5 · Evaluación final
                    </button>

                  </div>

                  {gestorPanelControlAbierto && (
                    <div style={formularioCaja}>
                      <h4 style={{ marginTop: 0 }}>
                        Mapa operativo por días · {intensivo.intensivo}
                      </h4>

                      <div style={avisoNeutral}>
                        Esta es la pantalla de control buena: intensivo → días → grupos → niños. No usa avisos raros de “sesiones”. Un día está preparado cuando tiene sus grupos creados y los niños colocados.
                      </div>

                      <div style={gridFormulario}>
                        <div style={miniTarjetaBlanca}>
                          <strong>{alumnosInscritosIntensivo.length}</strong>
                          <p style={{ margin: '6px 0 0' }}>alumnos inscritos</p>
                        </div>

                        <div style={miniTarjetaBlanca}>
                          <strong>{diasIntensivo.length}</strong>
                          <p style={{ margin: '6px 0 0' }}>días creados</p>
                        </div>

                        <div style={miniTarjetaBlanca}>
                          <strong>
                            {diasIntensivo.reduce(
                              (total, dia) =>
                                total +
                                gruposNormalesDelDiaIntensivo(dia.intensivo_dia_id).length,
                              0
                            )}
                          </strong>
                          <p style={{ margin: '6px 0 0' }}>grupos creados</p>
                        </div>

                        <div style={miniTarjetaBlanca}>
                          <strong>{diplomasPendientes}</strong>
                          <p style={{ margin: '6px 0 0' }}>evaluaciones pendientes</p>
                        </div>
                      </div>

                      {diasIntensivo.length === 0 && (
                        <div style={avisoPendiente}>
                          Todavía no has creado días para este intensivo. Entra en “1 · Configuración”.
                        </div>
                      )}

                      <div style={{ display: 'grid', gap: 14, marginTop: 14 }}>
                        {diasIntensivo.map((dia) => {
                          const gruposDelDiaMapa = gruposNormalesDelDiaIntensivo(
                            dia.intensivo_dia_id
                          );
                          const alumnosColocadosDia = gruposDelDiaMapa.reduce(
                            (total, grupo) => total + (grupo.total_alumnos || 0),
                            0
                          );
                          const alumnosSinGrupoDia = Math.max(
                            alumnosInscritosIntensivo.length - alumnosColocadosDia,
                            0
                          );

                          return (
                            <div key={dia.intensivo_dia_id} style={miniTarjetaBlanca}>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  gap: 10,
                                  flexWrap: 'wrap',
                                  alignItems: 'flex-start',
                                }}
                              >
                                <div>
                                  <h4 style={{ margin: '0 0 6px' }}>
                                    Día {dia.numero_dia} · {formatearFecha(dia.fecha)}
                                  </h4>
                                  <p style={{ margin: 0 }}>
                                    {dia.hora_inicio.slice(0, 5)}–{dia.hora_fin.slice(0, 5)}
                                  </p>
                                </div>

                                <div style={{ textAlign: 'right' }}>
                                  <strong>{gruposDelDiaMapa.length} grupos</strong>
                                  <p style={{ margin: '6px 0 0' }}>
                                    {alumnosColocadosDia}/{alumnosInscritosIntensivo.length} alumnos colocados
                                  </p>
                                </div>
                              </div>

                              {gruposDelDiaMapa.length === 0 && (
                                <div style={{ ...avisoPendiente, marginTop: 10 }}>
                                  Día sin grupos creados. Entra en “3 · Grupos por día”, elige este día y genera la propuesta.
                                </div>
                              )}

                              {gruposDelDiaMapa.length > 0 && alumnosSinGrupoDia > 0 && (
                                <div style={{ ...avisoPendiente, marginTop: 10 }}>
                                  Quedan {alumnosSinGrupoDia} alumnos inscritos sin meter en grupos este día.
                                </div>
                              )}

                              <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                                {gruposDelDiaMapa.map((grupo, indiceGrupoIntensivoDia) => (
                                  <div
                                    key={grupo.grupo_id || `${dia.intensivo_dia_id}-${grupo.nombre_grupo}`}
                                    style={estiloGrupoPorPistaApp(grupo)}
                                  >
                                    <div
                                      style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        gap: 10,
                                        flexWrap: 'wrap',
                                      }}
                                    >
                                      <div>
                                        <strong>{nombreGrupoVisualApp(grupo, indiceGrupoIntensivoDia)}</strong>
                                        <p style={{ margin: '4px 0 0' }}>
                                          <span style={estiloBadgePistaApp(grupo.pista)}>{etiquetaPistaVisualApp(grupo.pista)}</span> · Punto {grupo.punto_encuentro || '-'}
                                        </p>
                                      </div>

                                      <div style={{ textAlign: 'right' }}>
                                        <strong>{grupo.entrenador || 'Sin entrenador'}</strong>
                                        <p style={{ margin: '4px 0 0' }}>
                                          {grupo.publicado ? 'Publicado' : 'Borrador'} · {grupo.total_alumnos || 0} alumnos
                                        </p>
                                      </div>
                                    </div>

                                    {grupo.alumnos_lista ? (
                                      <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
                                        {grupo.alumnos_lista.split(' || ').map((alumnoGrupo, indiceAlumnoGrupo) => (
                                          <li key={`${grupo.grupo_id}-mapa-${indiceAlumnoGrupo}`}>
                                            {formatearAlumnoListadoOperativo(alumnoGrupo)}
                                          </li>
                                        ))}
                                      </ol>
                                    ) : (
                                      <div style={{ ...avisoNeutral, marginTop: 8 }}>
                                        No hay listado de niños cargado. Pulsa “Actualizar intensivos”.
                                      </div>
                                    )}

                                    {grupo.observaciones_importantes && (
                                      <div style={{ ...avisoNeutral, marginTop: 8 }}>
                                        <strong>Observaciones:</strong> {formatearObservaciones(grupo.observaciones_importantes)}
                                      </div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {formularioDiaAbierto && (
                    <div style={formularioCaja}>
                      <h4 style={{ marginTop: 0 }}>
                        1 · Configuración y días · {intensivo.intensivo}
                      </h4>

                      <details style={ayudaDesplegableCompacta}>
                        <summary>Ayuda rápida</summary>
                        <div style={{ marginTop: 8, color: '#475569' }}>
                          Aquí se crean, editan y borran los días del intensivo. Lo habitual son 4 sesiones: 4 días seguidos, 2 fines de semana, 4 sábados o 4 domingos.
                        </div>
                      </details>

                      <article style={{ ...miniTarjetaBlanca, marginTop: 12 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                          <div>
                            <h4 style={{ margin: '0 0 6px' }}>Crear 4 sesiones rápido</h4>

                          </div>
                          <button
                            onClick={() => {
                              setMostrarPlantillaCuatroSesionesIntensivoId(
                                mostrarPlantillaCuatroSesionesIntensivoId === intensivo.intensivo_id ? null : intensivo.intensivo_id
                              );
                              setPlantillaCuatroSesionesIntensivo(plantillaCuatroSesionesInicial());
                            }}
                            style={botonPrincipal}
                          >
                            {mostrarPlantillaCuatroSesionesIntensivoId === intensivo.intensivo_id ? 'Cerrar 4 sesiones' : 'Generar 4 sesiones'}
                          </button>
                        </div>

                        {mostrarPlantillaCuatroSesionesIntensivoId === intensivo.intensivo_id && (
                          <div style={{ marginTop: 12 }}>
                            <div style={gridFormulario}>
                              <label style={labelCampo}>
                                Tipo de intensivo
                                <select
                                  value={plantillaCuatroSesionesIntensivo.tipo}
                                  onChange={(e) => setPlantillaCuatroSesionesIntensivo({
                                    ...plantillaCuatroSesionesIntensivo,
                                    tipo: e.target.value as 'cuatro_dias' | 'dos_fines_semana' | 'cuatro_sabados' | 'cuatro_domingos',
                                  })}
                                  style={selectCampo}
                                >
                                  <option value="cuatro_dias">4 días seguidos</option>
                                  <option value="dos_fines_semana">2 fines de semana consecutivos</option>
                                  <option value="cuatro_sabados">4 sábados</option>
                                  <option value="cuatro_domingos">4 domingos</option>
                                </select>
                              </label>

                              <label style={labelCampo}>
                                Primera sesión
                                <input
                                  type="date"
                                  value={plantillaCuatroSesionesIntensivo.fechaInicio}
                                  onChange={(e) => setPlantillaCuatroSesionesIntensivo({
                                    ...plantillaCuatroSesionesIntensivo,
                                    fechaInicio: e.target.value,
                                  })}
                                  style={inputCampo}
                                />
                              </label>

                              <label style={labelCampo}>
                                Hora inicio
                                <input
                                  type="time"
                                  value={plantillaCuatroSesionesIntensivo.horaInicio}
                                  onChange={(e) => setPlantillaCuatroSesionesIntensivo({
                                    ...plantillaCuatroSesionesIntensivo,
                                    horaInicio: e.target.value,
                                  })}
                                  style={inputCampo}
                                />
                              </label>

                              <label style={labelCampo}>
                                Hora fin
                                <input
                                  type="time"
                                  value={plantillaCuatroSesionesIntensivo.horaFin}
                                  onChange={(e) => setPlantillaCuatroSesionesIntensivo({
                                    ...plantillaCuatroSesionesIntensivo,
                                    horaFin: e.target.value,
                                  })}
                                  style={inputCampo}
                                />
                              </label>
                            </div>

                            {plantillaCuatroSesionesIntensivo.fechaInicio && (
                              <div style={{ ...avisoNeutral, marginTop: 10 }}>
                                <strong>Se crearán estas 4 sesiones:</strong>
                                <ol style={{ margin: '8px 0 0 20px', padding: 0 }}>
                                  {calcularFechasCuatroSesionesIntensivo(plantillaCuatroSesionesIntensivo.fechaInicio, plantillaCuatroSesionesIntensivo.tipo).map((fecha, indice) => (
                                    <li key={`${intensivo.intensivo_id}-previa-${fecha}`}>
                                      Sesión {indice + 1}: {formatearFecha(fecha)} · {plantillaCuatroSesionesIntensivo.horaInicio}-{plantillaCuatroSesionesIntensivo.horaFin}
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            <button
                              onClick={() => crearCuatroSesionesIntensivo(intensivo)}
                              style={{ ...botonPrincipal, marginTop: 12 }}
                            >
                              Crear estas 4 sesiones
                            </button>
                          </div>
                        )}
                      </article>

                      <h4>Días creados</h4>

                      {diasIntensivo.length === 0 && (
                        <div style={avisoPendiente}>
                          Todavía no hay días creados. Añade el primer día abajo.
                        </div>
                      )}

                      <div style={{ display: 'grid', gap: 10 }}>
                        {diasIntensivo.map((dia) => {
                          const editandoEsteDia =
                            diaEditandoIntensivoId === dia.intensivo_dia_id;
                          const gruposDia = gruposNormalesDelDiaIntensivo(
                            dia.intensivo_dia_id
                          );

                          return (
                            <div
                              key={dia.intensivo_dia_id}
                              style={
                                editandoEsteDia
                                  ? { ...miniTarjetaBlanca, border: '2px solid #111' }
                                  : {
                                      ...miniTarjetaBlanca,
                                      border: gruposDia.length > 0 ? '1px solid rgba(22,163,74,.35)' : '1px solid rgba(249,115,22,.35)',
                                      background: gruposDia.length > 0 ? 'rgba(240,253,244,.82)' : 'rgba(255,247,237,.86)',
                                    }
                              }
                            >
                              <p style={{ marginTop: 0, fontWeight: 'bold' }}>
                                Día {dia.numero_dia} · {formatearFecha(dia.fecha)} ·{' '}
                                {dia.hora_inicio.slice(0, 5)}–{dia.hora_fin.slice(0, 5)}
                              </p>
                              <p style={{ margin: '6px 0' }}>
                                <strong>Estado:</strong>{' '}
                                {gruposDia.length > 0 ? 'preparado' : 'sin grupos'} ·{' '}
                                <strong>Grupos:</strong> {gruposDia.length}
                              </p>
                              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                                <button
                                  onClick={() => prepararEdicionDiaIntensivo(dia)}
                                  style={botonSecundario}
                                >
                                  Editar día
                                </button>
                                <button
                                  onClick={() => borrarDiaIntensivoDesdeApp(dia)}
                                  style={botonPeligro}
                                >
                                  Borrar día
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      <h4>{diaEditandoActual ? 'Editar día' : 'Añadir nuevo día'}</h4>

                      <div style={gridFormulario}>
                        <label style={labelCampo}>
                          Fecha
                          <input
                            type="date"
                            value={formDiaIntensivo.fecha}
                            onChange={(e) =>
                              setFormDiaIntensivo({
                                ...formDiaIntensivo,
                                fecha: e.target.value,
                              })
                            }
                            style={inputCampo}
                          />
                        </label>

                        <label style={labelCampo}>
                          Hora inicio
                          <input
                            type="time"
                            value={formDiaIntensivo.hora_inicio}
                            onChange={(e) =>
                              setFormDiaIntensivo({
                                ...formDiaIntensivo,
                                hora_inicio: e.target.value,
                              })
                            }
                            style={inputCampo}
                          />
                        </label>

                        <label style={labelCampo}>
                          Hora fin
                          <input
                            type="time"
                            value={formDiaIntensivo.hora_fin}
                            onChange={(e) =>
                              setFormDiaIntensivo({
                                ...formDiaIntensivo,
                                hora_fin: e.target.value,
                              })
                            }
                            style={inputCampo}
                          />
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                        {diaEditandoActual ? (
                          <button
                            onClick={() => actualizarDiaIntensivoDesdeApp(diaEditandoActual)}
                            style={botonPrincipal}
                          >
                            Guardar cambios del día
                          </button>
                        ) : (
                          <button
                            onClick={() => guardarDiaIntensivo(intensivo)}
                            style={botonPrincipal}
                          >
                            Añadir día
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setDiaEditandoIntensivoId(null);
                            setFormDiaIntensivo(diaIntensivoInicial());
                          }}
                          style={botonSecundario}
                        >
                          Limpiar formulario
                        </button>
                      </div>
                    </div>
                  )}

                  {gestorAlumnosAbierto && (
                    <div style={formularioCaja}>
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 10,
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          marginBottom: 12,
                        }}
                      >
                        <div>
                          <h4 style={{ margin: 0 }}>
                            Fichas · {intensivo.intensivo}
                          </h4>
                          <p style={{ margin: '4px 0 0', color: '#64748b' }}>
                            {alumnosInscritosIntensivo.length} alumnos inscritos ·{' '}
                            {recuperacionesPendientesIntensivo} pendientes de recuperar
                          </p>
                        </div>
                      </div>

                      {alumnosInscritosIntensivo.length === 0 && (
                        <p style={{ marginBottom: 0 }}>
                          Todavía no hay alumnos inscritos. Valida sus tests en Administración y añádelos a este intensivo.
                        </p>
                      )}

                      <div style={{ display: 'grid', gap: 10 }}>
                        {alumnosInscritosIntensivo.map((registro) => {
                          const resumenAlumno = resumenAlumnoIntensivo(registro.alumno_id);
                          const resumenFinalAlumno = resumenFinal.find(
                            (item) => item.alumno_id === registro.alumno_id
                          );
                          const nivelUsado = resumenAlumno?.nivel_resumen || 'SIN NIVEL';
                          const pistaUsada = resumenAlumno?.pista_resumen || 'Pendiente';
                          const origenNivel = resumenAlumno?.origen_nivel_estimado || 'Desconocido';

                          const recuperacionesAlumno = recuperacionesIntensivo.filter(
                            (item) =>
                              item.alumno_id === registro.alumno_id &&
                              item.estado !== 'Resuelta' &&
                              item.estado !== 'Descartada'
                          );
                          const tieneRecuperacionPendiente =
                            recuperacionesAlumno.length > 0;

                          const diasPresentes = Number(
                            resumenFinalAlumno?.dias_presente || 0
                          );
                          const diasAusentes = Number(
                            resumenFinalAlumno?.dias_ausente || 0
                          );
                          const diasPendientes = Number(
                            resumenFinalAlumno?.dias_pendiente_asistencia || 0
                          );
                          const totalDias =
                            Number(resumenFinalAlumno?.total_dias_intensivo || 0) ||
                            diasIntensivo.length;
                          const totalReportes = Number(
                            resumenFinalAlumno?.total_reportes ||
                              resumenAlumno?.total_reportes ||
                              0
                          );
                          const nivelFinal =
                            resumenFinalAlumno?.nivel_final_confirmado ||
                            resumenFinalAlumno?.nivel_final_propuesto ||
                            resumenFinalAlumno?.nivel_ultimo_reporte ||
                            nivelUsado;
                          const finalizado =
                            resumenFinalAlumno?.estado_diploma === 'Revisado';

                          return (
                            <details
                              key={registro.intensivo_alumno_id}
                              style={{
                                ...miniTarjetaBlanca,
                                background: tieneRecuperacionPendiente
                                  ? 'rgba(255,247,237,.9)'
                                  : finalizado
                                    ? 'rgba(240,253,244,.78)'
                                    : '#ffffff',
                                border: tieneRecuperacionPendiente
                                  ? '1px solid rgba(249,115,22,.45)'
                                  : finalizado
                                    ? '1px solid rgba(22,163,74,.28)'
                                    : '1px solid #e2e8f0',
                                boxShadow: '0 4px 14px rgba(15, 23, 42, 0.04)',
                              }}
                            >
                              <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: 10,
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                  }}
                                >
                                  <div style={{ flex: '1 1 260px' }}>
                                    <strong>{registro.alumno}</strong>
                                    <p style={{ margin: '5px 0 0', color: '#475569' }}>
                                      Nivel {nivelFinal || nivelUsado} · {pistaUsada}
                                    </p>
                                    <p
                                      style={{
                                        margin: '5px 0 0',
                                        color: '#64748b',
                                        fontSize: 13,
                                      }}
                                    >
                                      Asistencia {diasPresentes}/{totalDias || 4}
                                      {diasAusentes > 0 ? ` · ${diasAusentes} faltas` : ''}
                                      {diasPendientes > 0
                                        ? ` · ${diasPendientes} pendientes`
                                        : ''}{' '}
                                      · Reportes {totalReportes}/{totalDias || 4}
                                    </p>
                                  </div>

                                  <div
                                    style={{
                                      display: 'flex',
                                      gap: 6,
                                      flexWrap: 'wrap',
                                      alignItems: 'center',
                                      justifyContent: 'flex-end',
                                    }}
                                  >
                                    {tieneRecuperacionPendiente && (
                                      <span style={agendaBadgeModalidad}>
                                        Recuperar
                                      </span>
                                    )}
                                    <span
                                      style={
                                        finalizado ? avisoCompleto : avisoPendiente
                                      }
                                    >
                                      {finalizado ? 'Finalizado' : 'En curso'}
                                    </span>
                                    <span
                                      style={{
                                        color: '#475569',
                                        fontSize: 13,
                                        fontWeight: 850,
                                      }}
                                    >
                                      Ver ficha ▾
                                    </span>
                                  </div>
                                </div>
                              </summary>

                              <div style={{ marginTop: 12 }}>
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                      'repeat(auto-fit, minmax(170px, 1fr))',
                                    gap: 8,
                                  }}
                                >
                                  <div style={miniTarjetaBlanca}>
                                    <strong>Asistencia</strong>
                                    <p style={{ margin: '5px 0 0' }}>
                                      {diasPresentes}/{totalDias || 4} presentes
                                    </p>
                                  </div>
                                  <div style={miniTarjetaBlanca}>
                                    <strong>Reportes</strong>
                                    <p style={{ margin: '5px 0 0' }}>
                                      {totalReportes}/{totalDias || 4}
                                    </p>
                                  </div>
                                  <div style={miniTarjetaBlanca}>
                                    <strong>Evaluación</strong>
                                    <p style={{ margin: '5px 0 0' }}>
                                      {resumenFinalAlumno?.estado_diploma || 'Pendiente'}
                                    </p>
                                  </div>
                                  <div style={miniTarjetaBlanca}>
                                    <strong>Siguiente paso</strong>
                                    <p style={{ margin: '5px 0 0' }}>
                                      {resumenFinalAlumno?.recomendacion_siguiente_paso ||
                                        registro.recomendacion_siguiente_paso ||
                                        'Pendiente'}
                                    </p>
                                  </div>
                                </div>

                                {tieneRecuperacionPendiente && (
                                  <div
                                    style={{
                                      ...avisoPendiente,
                                      marginTop: 10,
                                    }}
                                  >
                                    <strong>Pendiente de recuperar.</strong>{' '}
                                    {recuperacionesAlumno
                                      .map(
                                        (item) =>
                                          `${item.estado || 'Pendiente valorar'}${
                                            item.intensivo_destino
                                              ? ` · ${item.intensivo_destino}`
                                              : ''
                                          }`
                                      )
                                      .join(' · ')}
                                  </div>
                                )}

                                {resumenAlumno?.observacion_visible_entrenador && (
                                  <p>
                                    <strong>Obs. entrenador:</strong>{' '}
                                    {resumenAlumno.observacion_visible_entrenador}
                                  </p>
                                )}

                                {Number(resumenAlumno?.total_reportes || 0) > 0 && (
                                  <div
                                    style={{
                                      display: 'grid',
                                      gap: 6,
                                      marginTop: 10,
                                    }}
                                  >
                                    <p style={{ margin: 0 }}>
                                      <strong>Última autonomía:</strong>{' '}
                                      {resumenAlumno?.ultima_autonomia || '-'}
                                    </p>
                                    <p style={{ margin: 0 }}>
                                      <strong>Última actitud:</strong>{' '}
                                      {resumenAlumno?.ultima_actitud || '-'}
                                    </p>
                                    <p style={{ margin: 0 }}>
                                      <strong>Última técnica:</strong>{' '}
                                      {resumenAlumno?.ultima_tecnica || '-'}
                                    </p>
                                    <p style={{ margin: 0 }}>
                                      <strong>Recomendación:</strong>{' '}
                                      {resumenAlumno?.ultima_recomendacion || '-'}
                                    </p>
                                  </div>
                                )}

                                <div style={{ ...gridFormulario, marginTop: 10 }}>
                                  <CampoSelect
                                    label="Cambiar nivel rápido"
                                    value={
                                      nivelUsado === 'SIN NIVEL'
                                        ? 'INICIACION'
                                        : nivelUsado
                                    }
                                    opciones={opcionesNivel}
                                    onChange={(valor) =>
                                      actualizarNivelAlumnoIntensivo(
                                        registro,
                                        valor,
                                        origenNivel || 'Jose / Coordinador'
                                      )
                                    }
                                  />

                                  <CampoSelect
                                    label="Origen nivel"
                                    value={origenNivel || 'Jose / Coordinador'}
                                    opciones={opcionesOrigenNivelAlumno}
                                    onChange={(valor) =>
                                      actualizarNivelAlumnoIntensivo(
                                        registro,
                                        nivelUsado === 'SIN NIVEL'
                                          ? 'INICIACION'
                                          : nivelUsado,
                                        valor
                                      )
                                    }
                                  />
                                </div>

                                <div
                                  style={{
                                    display: 'flex',
                                    gap: 8,
                                    marginTop: 10,
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  {tieneRecuperacionPendiente && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        abrirPanelIntensivo(
                                          intensivo,
                                          'asistencia'
                                        )
                                      }
                                      style={botonPrincipal}
                                    >
                                      Gestionar recuperación
                                    </button>
                                  )}

                                  <button
                                    onClick={() => quitarAlumnoDeIntensivo(registro)}
                                    style={botonPeligro}
                                  >
                                    Quitar alumno
                                  </button>
                                </div>
                              </div>
                            </details>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {gestorAsistenciaAbierto && (
                    <div style={formularioCaja}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>4 · Faltas / recuperaciones</h4>
                        <details style={ayudaDesplegableCompacta}>
                          <summary>Ayuda rápida</summary>
                          <div style={{ marginTop: 8, color: '#475569' }}>
                            La asistencia se marca una sola vez en Vista entrenador / Días de entrenamiento. Aquí solo la consultas y gestionas recuperaciones.
                          </div>
                        </details>
                      </div>

                      {diasIntensivo.length === 0 && (
                        <div style={{ ...avisoPendiente, marginTop: 12 }}>
                          Primero añade los días del intensivo.
                        </div>
                      )}

                      {diasIntensivo.length > 0 && alumnosInscritosIntensivo.length === 0 && (
                        <div style={{ ...avisoPendiente, marginTop: 12 }}>
                          Este intensivo todavía no tiene alumnos.
                        </div>
                      )}

                      {diasIntensivo.length > 0 && alumnosInscritosIntensivo.length > 0 && (
                        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                          {alumnosInscritosIntensivo.map((alumnoIntensivo) => {
                            const resumenAlumno = resumenAlumnoIntensivo(alumnoIntensivo.alumno_id);
                            const registrosAlumno = diasIntensivo.map((dia) => ({
                              dia,
                              asistencia: asistenciasDelIntensivoDia(intensivo.intensivo_id, dia.intensivo_dia_id).find((registro) => registro.alumno_id === alumnoIntensivo.alumno_id),
                            }));
                            const faltas = registrosAlumno.filter((item) => item.asistencia && ['NO_PRESENTADO', 'BAJA_AVISADA'].includes(item.asistencia.estado || '')).length;
                            const presentes = Math.max(0, diasIntensivo.length - faltas);
                            const nivelUtil = resumenAlumno?.nivel_resumen || alumnoIntensivo.nivel_resumen || 'SIN NIVEL';
                            const pistaUtil = resumenAlumno?.pista_resumen || 'Pendiente';
                            return (
                              <div
                                key={`faltas-${alumnoIntensivo.intensivo_alumno_id}`}
                                style={{
                                  ...miniTarjetaBlanca,
                                  border: faltas > 0 ? '1px solid rgba(249,115,22,.45)' : '1px solid rgba(22,163,74,.24)',
                                  background: faltas > 0 ? 'rgba(255,247,237,.9)' : 'rgba(240,253,244,.72)',
                                }}
                              >
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                                  <div>
                                    <strong>{alumnoIntensivo.alumno}</strong>
                                    <p style={{ margin: '5px 0 0', color: '#475569' }}>
                                      Nivel útil: {nivelUtil} · Pista: {pistaUtil} · Presentes: {presentes}/{diasIntensivo.length} · Faltas: {faltas}
                                    </p>
                                  </div>
                                  {faltas > 0 && <span style={agendaBadgeModalidad}>Pendiente recuperación</span>}
                                </div>

                                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(155px, 1fr))', gap: 8, marginTop: 10 }}>
                                  {registrosAlumno.map(({ dia, asistencia }) => {
                                    const estadoAsistencia = asistencia?.estado || 'SIN_CONFIRMAR';
                                    const ausente = estadoAsistencia === 'NO_PRESENTADO' || estadoAsistencia === 'BAJA_AVISADA';
                                    const presente = estadoAsistencia === 'PRESENTE';
                                    return (
                                      <div key={`${alumnoIntensivo.alumno_id}-${dia.intensivo_dia_id}`} style={{ ...miniTarjetaBlanca, padding: 10 }}>
                                        <strong>Día {dia.numero_dia}</strong>
                                        <p style={{ margin: '4px 0', color: '#475569' }}>{formatearFecha(dia.fecha)}</p>
                                        <p style={{ margin: '0 0 8px', fontWeight: 800, color: ausente ? '#c2410c' : '#15803d' }}>
                                          {ausente ? 'Faltó' : 'Asistió'}
                                        </p>
                                        <div style={avisoNeutral}>
                                          Estado registrado en el entrenamiento real. Para cambiarlo, hazlo desde Vista entrenador.
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {(() => {
                        const faltasMarcadas: any[] = [];
                        alumnosInscritosIntensivo.forEach((alumnoIntensivo) => {
                          const resumenAlumno = resumenAlumnoIntensivo(alumnoIntensivo.alumno_id);
                          diasIntensivo.forEach((dia) => {
                            const asistencia = asistenciasDelIntensivoDia(intensivo.intensivo_id, dia.intensivo_dia_id).find((registro) => registro.alumno_id === alumnoIntensivo.alumno_id);
                            const estado = asistencia?.estado || 'PRESENTE';
                            if (estado === 'NO_PRESENTADO' || estado === 'BAJA_AVISADA') {
                              faltasMarcadas.push({
                                key: `${alumnoIntensivo.alumno_id}-${dia.intensivo_dia_id}`,
                                alumno: alumnoIntensivo.alumno,
                                dia,
                                nivel: resumenAlumno?.nivel_resumen || alumnoIntensivo.nivel_resumen || 'SIN NIVEL',
                                pista: resumenAlumno?.pista_resumen || 'Pendiente',
                              });
                            }
                          });
                        });

                        return (
                          <details style={{ ...ayudaDesplegableCompacta, marginTop: 14 }}>
                            <summary>Ver recuperaciones pendientes ({Math.max(recuperacionesIntensivo.length, faltasMarcadas.length)})</summary>
                            <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                              {recuperacionesIntensivo.length === 0 && faltasMarcadas.length === 0 && <div style={avisoNeutral}>No hay recuperaciones pendientes.</div>}

                              {faltasMarcadas.map((registro) => (
                                <div key={`falta-directa-${registro.key}`} style={{ ...miniTarjetaBlanca, border: '1px solid rgba(249,115,22,.35)', background: 'rgba(255,247,237,.88)' }}>
                                  <strong>{registro.alumno}</strong>
                                  <p style={{ margin: '6px 0' }}>
                                    Faltó: Día {registro.dia.numero_dia} · {formatearFecha(registro.dia.fecha)}
                                  </p>
                                  <p style={{ margin: 0 }}>
                                    Último nivel útil: {registro.nivel} · Pista: {registro.pista}
                                  </p>
                                </div>
                              ))}

                              {recuperacionesIntensivo.map((registro) => (
                                <div key={registro.recuperacion_id} style={miniTarjetaBlanca}>
                                  <strong>{registro.alumno}</strong>
                                  <p style={{ margin: '6px 0' }}>Origen: {registro.intensivo_origen || intensivo.intensivo}</p>
                                  <div style={gridFormulario}>
                                    <CampoSelect
                                      label="Estado recuperación"
                                      value={registro.estado || 'Pendiente valorar'}
                                      opciones={opcionesEstadoRecuperacionIntensivo}
                                      onChange={(valor) => actualizarRecuperacionIntensivo(registro, valor, registro.intensivo_destino_id || '', registro.grupo_destino_id || '')}
                                    />
                                    <label style={labelCampo}>
                                      Intensivo destino
                                      <select
                                        value={registro.intensivo_destino_id || ''}
                                        onChange={(e) => actualizarRecuperacionIntensivo(registro, registro.estado || 'Pendiente valorar', e.target.value, registro.grupo_destino_id || '')}
                                        style={selectCampo}
                                      >
                                        <option value="">Sin intensivo destino</option>
                                        {intensivos.map((opcion) => (
                                          <option key={opcion.intensivo_id} value={opcion.intensivo_id}>{opcion.intensivo} · {opcion.estado}</option>
                                        ))}
                                      </select>
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </details>
                        );
                      })()}
                      <div style={{ marginTop: 14 }}>
                      <details style={{ ...ayudaDesplegableCompacta, marginBottom: 12 }}>
                        <summary>Añadir alumno existente, solo para una excepción</summary>
                        <div style={{ marginTop: 10 }}>
                      <div style={gridFormulario}>
                        <label style={labelCampo}>
                          Buscar alumno
                          <input
                            value={busquedaAlumnoIntensivo}
                            onChange={(e) => {
                              setBusquedaAlumnoIntensivo(e.target.value);
                              setAlumnoSeleccionadoIntensivoId('');
                            }}
                            placeholder="Escribe nombre o apellido..."
                            style={inputCampo}
                          />
                        </label>

                        <label style={labelCampo}>
                          Alumno disponible
                          <select
                            value={alumnoSeleccionadoIntensivoId}
                            onChange={(e) =>
                              setAlumnoSeleccionadoIntensivoId(e.target.value)
                            }
                            style={selectCampo}
                          >
                            <option value="">Selecciona alumno</option>
                            {alumnosDisponiblesIntensivo.map((alumno) => (
                              <option key={alumno.alumno_id} value={alumno.alumno_id}>
                                {alumno.alumno}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => añadirAlumnoAIntensivo(intensivo)}
                          style={botonPrincipal}
                        >
                          Añadir alumno
                        </button>

                        <button
                          onClick={() => {
                            setGestionarAlumnosIntensivoId(null);
                            setAlumnoSeleccionadoIntensivoId('');
                            setBusquedaAlumnoIntensivo('');
                            setMostrarVolcadoIntensivoId(null);
                            setTextoVolcadoIntensivo('');
                            setResultadoVolcadoIntensivo([]);
                          }}
                          style={botonSecundario}
                        >
                          Cerrar gestión
                        </button>
                      </div>

                        </div>
                      </details>
                      </div>
                    </div>
                  )}

                  {gestorGruposAbierto && (
                    <div style={formularioCaja}>
                      <h4 style={{ marginTop: 0 }}>
                        Preparar grupos por día · {intensivo.intensivo}
                      </h4>



                      {diasIntensivo.length === 0 && (
                        <div style={avisoPendiente}>
                          Primero añade al menos un día al intensivo.
                        </div>
                      )}

                      {diasIntensivo.length > 0 && (
                        <>
                                                    <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns:
                                'repeat(auto-fit, minmax(185px, 1fr))',
                              gap: 8,
                              marginBottom: 12,
                            }}
                          >
                            {diasIntensivo.map((dia) => {
                              const seleccionado =
                                diaSeleccionadoGrupo?.intensivo_dia_id ===
                                dia.intensivo_dia_id;
                              const totalGrupos =
                                gruposNormalesDelDiaIntensivo(
                                  dia.intensivo_dia_id
                                ).length;

                              return (
                                <button
                                  key={`int-dia-${dia.intensivo_dia_id}`}
                                  type="button"
                                  onClick={() =>
                                    setDiaGrupoSeleccionadoId(
                                      dia.intensivo_dia_id
                                    )
                                  }
                                  style={
                                    seleccionado
                                      ? botonPrincipal
                                      : botonSecundario
                                  }
                                >
                                  Día {dia.numero_dia} · {formatearFecha(dia.fecha)}
                                  {totalGrupos > 0
                                    ? ` · ${totalGrupos} grupos`
                                    : ' · pendiente'}
                                </button>
                              );
                            })}
                          </div>

<div
                            id="intensivo-recomendador-activo"
                            style={{ ...miniTarjetaBlanca, marginTop: 12 }}
                          >
                            <h4 style={{ marginTop: 0 }}>Recomendador</h4>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {diasIntensivo.every(
                                (dia) =>
                                  gruposNormalesDelDiaIntensivo(
                                    dia.intensivo_dia_id
                                  ).length === 0
                              ) && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    generarPlantillaCuatroDiasIntensivo(
                                      intensivo
                                    )
                                  }
                                  style={botonPrincipal}
                                >
                                  Generar plantilla 4 días
                                </button>
                              )}

                              {gruposRecomendadosDia.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    crearGrupoVacioPropuestaIntensivo(
                                      diaSeleccionadoGrupo.intensivo_dia_id
                                    )
                                  }
                                  style={botonSecundario}
                                >
                                  + Crear grupo nuevo
                                </button>
                              )}

                              {diasIntensivo.length === 4 &&
                                diasIntensivo.every(
                                  (dia) =>
                                    gruposNormalesDelDiaIntensivo(
                                      dia.intensivo_dia_id
                                    ).length === 0
                                ) &&
                                gruposRecomendadosDia.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      crearPlantillaCuatroDiasIntensivo(
                                        intensivo
                                      )
                                    }
                                    style={botonPrincipal}
                                  >
                                    Crear esta plantilla en los 4 días
                                  </button>
                                )}

                              {gruposDiaSeleccionado.length > 0 &&
                                gruposRecomendadosDia.length === 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      cargarEdicionGruposIntensivoDia(
                                        diaSeleccionadoGrupo || undefined
                                      )
                                    }
                                    style={botonPrincipal}
                                  >
                                    Editar composición del día
                                  </button>
                                )}

                              {gruposDiaSeleccionado.length > 0 &&
                                gruposRecomendadosDia.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      guardarComposicionDiaIntensivo(
                                        intensivo,
                                        diaSeleccionadoGrupo || undefined
                                      )
                                    }
                                    style={botonPrincipal}
                                  >
                                    Guardar cambios de este día
                                  </button>
                                )}

                              {gruposRecomendadosDia.length > 0 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (!diaSeleccionadoGrupo) return;
                                    setRecomendacionesGrupoIntensivo(
                                      (anteriores) =>
                                        anteriores.filter(
                                          (registro) =>
                                            registro.intensivo_dia_id !==
                                            diaSeleccionadoGrupo.intensivo_dia_id
                                        )
                                    );
                                    setDestinoAlumnoRecomendado({});
                                    setTrabajoDiarioPorGrupoRecomendado({});
                                    setObservacionesPorGrupoRecomendado({});
                                  }}
                                  style={botonSecundario}
                                >
                                  Limpiar cambios de este día
                                </button>
                              )}
                            </div>

                            {alumnosPendientesRecomendacion > 0 && (
                              <>
                                <p
                                  style={{
                                    margin: '10px 0 0',
                                    color: '#64748b',
                                    fontSize: 13,
                                    fontWeight: 800,
                                  }}
                                >
                                  Plantilla base · {gruposRecomendadosDia.length} grupos · {alumnosPendientesRecomendacion} alumnos.
                                </p>
                                {diasIntensivo.every(
                                  (dia) =>
                                    gruposNormalesDelDiaIntensivo(
                                      dia.intensivo_dia_id
                                    ).length === 0
                                ) && (
                                  <p
                                    style={{
                                      margin: '4px 0 0',
                                      color: '#64748b',
                                      fontSize: 12,
                                    }}
                                  >
                                    Los cambios que hagas aquí serán la base de los 4 días.
                                  </p>
                                )}
                              </>
                            )}

                            {gruposRecomendadosDia.length > 0 && (
                              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                                {gruposRecomendadosDia.map(({ nombreGrupo, alumnosGrupo }) => {
                                  const primero = alumnosGrupo[0];
                                  const clave = diaSeleccionadoGrupo
                                    ? claveGrupoRecomendado(
                                        diaSeleccionadoGrupo.intensivo_dia_id,
                                        nombreGrupo
                                      )
                                    : nombreGrupo;
                                  const trabajoAuto = generarTrabajoDiarioAutomaticoGrupo(
                                    nombreGrupo,
                                    alumnosGrupo
                                  );
                                  const trabajoGrupo = trabajoDiarioPorGrupoRecomendado[clave] ?? trabajoAuto;
                                  const observacionesGrupo = observacionesPorGrupoRecomendado[clave] ?? '';
                                  const observacionesAutoGrupo =
                                    observacionesAutomaticasGrupoIntensivo(alumnosGrupo);
                                  const validacionPedagogicaGrupo = textoValidacionPedagogicaGrupoApp(alumnosGrupo);

                                  return (
                                    <article
                                      key={clave}
                                      style={{
                                        ...agendaGrupoPropuesta,
                                        ...estiloGrupoPorPistaApp({
                                          pista: primero?.pista_recomendada,
                                          nivel_grupo: primero?.nivel_resumen,
                                        }),
                                      }}
                                    >
                                      <div style={agendaGrupoLinea}>
                                        <h3 style={{ margin: 0 }}>{nombreGrupo}</h3>
                                        <span>{alumnosGrupo.length} niños</span>
                                      </div>

                                      <p>
                                        <strong>Bloque:</strong>{' '}
                                        {primero?.bloque_tecnico || '-'} ·{' '}
                                        <strong>Pista:</strong>{' '}
                                        {primero?.pista_recomendada || '-'}
                                      </p>

                                      <div
                                        style={{
                                          ...estiloValidacionPedagogicaApp(
                                            validacionPedagogicaGrupo.estado
                                          ),
                                          marginBottom: 10,
                                        }}
                                      >
                                        <strong>{validacionPedagogicaGrupo.titulo}</strong>
                                        {validacionPedagogicaGrupo.mensajes.length > 0 && (
                                          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                                            {validacionPedagogicaGrupo.mensajes.map((mensaje) => (
                                              <li key={`${clave}-${mensaje}`}>{mensaje}</li>
                                            ))}
                                          </ul>
                                        )}
                                      </div>

                                      <div
                                        style={{
                                          display: 'grid',
                                          gap: 8,
                                          marginBottom: 12,
                                        }}
                                      >
                                        {alumnosGrupo.map((alumno) => {
                                          const claveAlumno = diaSeleccionadoGrupo
                                            ? claveAlumnoRecomendado(
                                                diaSeleccionadoGrupo.intensivo_dia_id,
                                                alumno.alumno_id
                                              )
                                            : alumno.alumno_id;

                                          return (
                                            <div
                                              key={`${clave}-${alumno.alumno_id}`}
                                              style={agendaAlumnoLinea}
                                            >
                                              <div>
                                                <strong>{alumno.alumno}</strong>
                                                <p style={{ margin: '4px 0 0' }}>
                                                  {alumno.nivel_resumen || 'SIN NIVEL'} ·{' '}
                                                  {alumno.pista_recomendada || '-'}
                                                  {alumno.edad ? ` · ${alumno.edad} años` : ''}
                                                </p>
                                              </div>

                                              <label style={{ ...labelCampo, minWidth: 240 }}>
                                                Mover a
                                                <select
                                                  value={
                                                    destinoAlumnoRecomendado[claveAlumno] ||
                                                    alumno.grupo_recomendado
                                                  }
                                                  onChange={(e) =>
                                                    setDestinoAlumnoRecomendado({
                                                      ...destinoAlumnoRecomendado,
                                                      [claveAlumno]: e.target.value,
                                                    })
                                                  }
                                                  style={selectCampo}
                                                >
                                                  {nombresBaseRecomendados.map((nombreBase) => (
                                                    <option
                                                      key={`${claveAlumno}-${nombreBase}`}
                                                      value={nombreBase}
                                                    >
                                                      {nombreBase}
                                                    </option>
                                                  ))}
                                                  <option value="__NO_CREAR__">
                                                    Dejar fuera de momento
                                                  </option>
                                                </select>
                                              </label>
                                            </div>
                                          );
                                        })}
                                      </div>

                                      <p
                                        style={{
                                          margin: '0 0 10px',
                                          color: '#64748b',
                                          fontSize: 13,
                                          fontWeight: 700,
                                        }}
                                      >
                                        Entrenador, segundo entrenador, punto y publicación se asignan después en Días de entrenamiento.
                                      </p>

                                      <details
                                        style={{
                                          ...avisoNeutral,
                                          marginBottom: 10,
                                        }}
                                      >
                                        <summary
                                          style={{
                                            cursor: 'pointer',
                                            fontWeight: 900,
                                          }}
                                        >
                                          Trabajo diario
                                        </summary>
                                        <label
                                          style={{
                                            ...labelCampo,
                                            display: 'block',
                                            marginTop: 10,
                                          }}
                                        >
                                          Trabajo diario automático según nivel/pista
                                          <textarea
                                            value={trabajoGrupo}
                                            onChange={(e) =>
                                              setTrabajoDiarioPorGrupoRecomendado({
                                                ...trabajoDiarioPorGrupoRecomendado,
                                                [clave]: e.target.value,
                                              })
                                            }
                                            rows={4}
                                            style={{ ...inputCampo, width: '100%', boxSizing: 'border-box' }}
                                          />
                                        </label>
                                      </details>

                                      <details
                                        style={{
                                          ...avisoNeutral,
                                          marginBottom: 10,
                                        }}
                                      >
                                        <summary
                                          style={{
                                            cursor: 'pointer',
                                            fontWeight: 900,
                                          }}
                                        >
                                          Observaciones
                                        </summary>
                                        <label
                                          style={{
                                            ...labelCampo,
                                            display: 'block',
                                            marginTop: 10,
                                          }}
                                        >
                                          Observaciones importantes para el entrenador
                                          <textarea
                                            value={observacionesAutoGrupo || ''}
                                            readOnly
                                            rows={Math.max(
                                              3,
                                              Math.min(
                                                7,
                                                (observacionesAutoGrupo || '').split('\n').length + 1
                                              )
                                            )}
                                            style={{ ...inputCampo, width: '100%', boxSizing: 'border-box' }}
                                          />
                                        </label>
                                        <label
                                          style={{
                                            ...labelCampo,
                                            display: 'block',
                                            marginTop: 10,
                                          }}
                                        >
                                          Añadir observación manual · opcional
                                          <textarea
                                            value={observacionesGrupo}
                                            onChange={(e) =>
                                              setObservacionesPorGrupoRecomendado({
                                                ...observacionesPorGrupoRecomendado,
                                                [clave]: e.target.value,
                                              })
                                            }
                                            rows={3}
                                            style={{ ...inputCampo, width: '100%', boxSizing: 'border-box' }}
                                          />
                                        </label>
                                      </details>

                                    </article>
                                  );
                                })}
                              </div>
                            )}
                          </div>

                          <label style={{ ...labelCampo, marginTop: 10 }}>
                            Trabajo diario manual
                            <textarea
                              value={formGrupoIntensivo.trabajo_diario}
                              onChange={(e) =>
                                setFormGrupoIntensivo({
                                  ...formGrupoIntensivo,
                                  trabajo_diario: e.target.value,
                                })
                              }
                              placeholder="Opcional"
                              style={{ ...inputCampo, minHeight: 80 }}
                            />
                          </label>

                          <label style={{ ...labelCampo, marginTop: 10 }}>
                            Observaciones importantes visibles para entrenador
                            <textarea
                              value={formGrupoIntensivo.observaciones_importantes}
                              onChange={(e) =>
                                setFormGrupoIntensivo({
                                  ...formGrupoIntensivo,
                                  observaciones_importantes: e.target.value,
                                })
                              }
                              placeholder="Se sumará a las observaciones automáticas. Solo añade avisos tuyos si hace falta."
                              style={{ ...inputCampo, minHeight: 70 }}
                            />
                          </label>

                          

                          <details style={{ ...ayudaDesplegableCompacta, marginTop: 14 }}>
                            <summary>Ver grupos preparados este día ({gruposDiaSeleccionado.length})</summary>
                            <div style={{ marginTop: 10 }}>
                          {gruposDiaSeleccionado.length === 0 && (
                            <div style={avisoNeutral}>
                              Todavía no hay grupos preparados para este día.
                            </div>
                          )}

                          <div style={{ display: 'grid', gap: 10 }}>
                            {gruposDiaSeleccionado.map((grupo, indiceGrupoIntensivoCreado) => (
                              <div key={grupo.grupo_id || grupo.intensivo_dia_id} style={estiloGrupoPorPistaApp(grupo)}>
                                <p style={{ marginTop: 0, fontWeight: 'bold' }}>
                                  {nombreGrupoVisualApp(grupo, indiceGrupoIntensivoCreado)}
                                </p>
                                <p>
                                  <strong>Estado operativo:</strong>{' '}
                                  {grupo.publicado
                                    ? 'Publicado en Días de entrenamiento'
                                    : 'Preparado · pendiente de recursos/publicación'} ·{' '}
                                  {grupo.total_alumnos || 0} alumnos
                                </p>
                                <p>
                                  <strong>Pista:</strong> {grupo.pista || '-'} ·{' '}
                                  <strong>Nivel:</strong> {grupo.nivel_grupo || '-'}
                                </p>

                                <div style={{ ...avisoNeutral, marginTop: 8 }}>
                                  <strong>Alumnos del grupo:</strong>
                                  {grupo.alumnos_lista ? (
                                    <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
                                      {grupo.alumnos_lista.split(' || ').map((alumnoGrupo, indiceAlumnoGrupo) => (
                                        <li key={`${grupo.grupo_id}-alumno-${indiceAlumnoGrupo}`}>
                                          {formatearAlumnoListadoOperativo(alumnoGrupo)}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <span> No hay listado cargado. Pulsa Actualizar intensivos.</span>
                                  )}
                                </div>

                                {grupo.grupo_id && (
                                  <button
                                    onClick={() => borrarGrupoIntensivo(grupo)}
                                    style={botonPeligro}
                                  >
                                    Eliminar grupo
                                  </button>
                                )}
                              </div>
                            ))}
                          </div>
                            </div>
                          </details>

                          <details style={{ ...ayudaDesplegableCompacta, marginTop: 14 }}>
                            <summary>Ver resumen de reportes del intensivo, opcional</summary>
                            <div style={{ marginTop: 10 }}>
                              {resumenReportes.length === 0 && (
                                <div style={avisoNeutral}>
                                  Todavía no hay reportes normales vinculados a este intensivo.
                                </div>
                              )}

                              <div style={{ display: 'grid', gap: 10 }}>
                                {resumenReportes.map((registro) => (
                                  <div key={registro.alumno_id} style={miniTarjetaBlanca}>
                                    <p style={{ marginTop: 0, fontWeight: 'bold' }}>
                                      {registro.alumno}
                                    </p>
                                    <p>
                                      <strong>Reportes:</strong>{' '}
                                      {registro.total_reportes || 0} /{' '}
                                      {registro.total_dias_intensivo || 0}
                                    </p>
                                    <p>
                                      <strong>Actitud:</strong>{' '}
                                      {registro.actitudes_reportadas || '-'}
                                    </p>
                                    <p>
                                      <strong>Técnica:</strong>{' '}
                                      {registro.tecnicas_reportadas || '-'}
                                    </p>
                                    <p>
                                      <strong>Autonomía:</strong>{' '}
                                      {registro.autonomias_reportadas || '-'}
                                    </p>
                                    <p style={{ marginBottom: 0 }}>
                                      <strong>Recomendación:</strong>{' '}
                                      {registro.recomendaciones_reportadas || '-'}
                                    </p>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </details>
                        </>
                      )}
                    </div>
                  )}

                  {gestorDiplomasAbierto && (
                    <div style={formularioCaja}>
                      <h4 style={{ marginTop: 0 }}>
                        Evaluación final · {intensivo.intensivo}
                      </h4>

                      <p style={{ marginTop: 0, color: '#475569' }}>
                        Revisión por niño desde el resumen de los 4 días. La app da más peso al último reporte, pero tú confirmas el nivel final.
                      </p>

                      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => autoproponerNivelesDiploma(intensivo)}
                          style={botonPrincipal}
                        >
                          Proponer evaluación desde reportes
                        </button>

                        <button
                          onClick={() => setGestionarDiplomasIntensivoId(null)}
                          style={botonSecundario}
                        >
                          Cerrar evaluación
                        </button>
                      </div>

                      {resumenFinal.length === 0 && (
                        <div style={avisoNeutral}>
                          Todavía no hay evaluación disponible. Necesitas alumnos, asistencia y reportes de los días del intensivo.
                        </div>
                      )}

                      <div style={{ display: 'grid', gap: 12 }}>
                        {resumenFinal.map((registro) => {
                          const nivelPropuestoActual =
                            registro.nivel_final_propuesto_id ||
                            registro.nivel_mas_alto_id ||
                            '';
                          const nivelConfirmadoActual =
                            registro.nivel_final_confirmado_id || '';

                          return (
                            <div key={registro.intensivo_alumno_id} style={miniTarjetaBlanca}>
                              <h4 style={{ marginTop: 0, marginBottom: 8 }}>
                                {registro.alumno}
                              </h4>

                              <div style={{ display: 'grid', gap: 4 }}>
                                <p style={{ margin: 0 }}>
                                  <strong>Asistencia:</strong>{' '}
                                  {registro.dias_presente || 0} presente ·{' '}
                                  {registro.dias_ausente || 0} ausente ·{' '}
                                  {registro.dias_pendiente_asistencia || 0} pendiente ·{' '}
                                  {registro.total_dias_intensivo || 0} días totales
                                </p>

                                <p style={{ margin: 0 }}>
                                  <strong>Reportes:</strong>{' '}
                                  {registro.total_reportes || 0} hechos ·{' '}
                                  {registro.reportes_pendientes_estimados || 0} pendientes estimados
                                </p>

                                <p style={{ margin: 0 }}>
                                  <strong>Niveles reportados:</strong>{' '}
                                  {registro.niveles_reportados || '-'} ·{' '}
                                  <strong>más alto:</strong>{' '}
                                  {registro.nivel_mas_alto_reportado || '-'} ·{' '}
                                  <strong>último:</strong>{' '}
                                  {registro.nivel_ultimo_reporte || '-'}
                                </p>

                                <p style={{ margin: 0 }}>
                                  <strong>Último reporte:</strong>{' '}
                                  {registro.tecnica_ultimo_reporte || '-'} ·{' '}
                                  {registro.actitud_ultimo_reporte || '-'} ·{' '}
                                  {registro.autonomia_ultimo_reporte || '-'}
                                </p>

                                <p style={{ margin: 0 }}>
                                  <strong>Técnicas:</strong>{' '}
                                  {registro.tecnicas_reportadas || '-'}
                                </p>

                                <p style={{ margin: 0 }}>
                                  <strong>Actitud:</strong>{' '}
                                  {registro.actitudes_reportadas || '-'}
                                </p>

                                <p style={{ margin: 0 }}>
                                  <strong>Autonomía:</strong>{' '}
                                  {registro.autonomias_reportadas || '-'}
                                </p>

                                <p style={{ margin: 0 }}>
                                  <strong>Incidencias:</strong>{' '}
                                  {registro.incidencias_reportadas || '-'}
                                </p>

                                <p style={{ margin: 0 }}>
                                  <strong>Recomendaciones reportadas:</strong>{' '}
                                  {registro.recomendaciones_reportadas || '-'}
                                </p>
                              </div>

                              {(registro.comentarios_tecnica ||
                                registro.comentarios_actitud ||
                                registro.comentarios_autonomia ||
                                registro.comentarios_recomendacion) && (
                                <div style={{ ...avisoNeutral, marginTop: 10 }}>
                                  <strong>Comentarios entrenadores:</strong>
                                  <p style={{ marginBottom: 0 }}>
                                    {[
                                      registro.comentarios_tecnica,
                                      registro.comentarios_actitud,
                                      registro.comentarios_autonomia,
                                      registro.comentarios_recomendacion,
                                    ]
                                      .filter(Boolean)
                                      .filter((comentario) => !String(comentario).toLowerCase().includes('reporte demo septiembre'))
                                      .join(' || ') || 'Sin comentarios útiles todavía'}
                                  </p>
                                </div>
                              )}

                              {(() => {
                                const reportesAlumno = reportesDetalleAlumnoIntensivo(
                                  registro.intensivo_id,
                                  registro.alumno_id
                                );
                                const textoDiploma = textoBaseDiplomaIntensivo(registro, reportesAlumno).replaceAll('', '').replace(/\s*\|\|\s*/g, ' ').trim();
                                return (
                                  <details style={{ marginTop: 12 }}>
                                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                                      Ver reportes base del alumno · {reportesAlumno.length} reportes
                                    </summary>
                                    <textarea
                                      readOnly
                                      value={textoDiploma}
                                      style={{ ...inputCampo, minHeight: 220, marginTop: 8 }}
                                    />
                                  </details>
                                );
                              })()}

                              <div style={{ ...gridFormulario, marginTop: 12 }}>
                                <label style={labelCampo}>
                                  Nivel propuesto
                                  <select
                                    value={nivelPropuestoActual}
                                    onChange={(e) =>
                                      actualizarDiplomaIntensivo(
                                        registro,
                                        e.target.value,
                                        nivelConfirmadoActual,
                                        registro.recomendacion_siguiente_paso || '',
                                        registro.estado_diploma || 'Pendiente'
                                      )
                                    }
                                    style={selectCampo}
                                  >
                                    {nivelesDiplomaIntensivo.map((nivel) => (
                                      <option key={`propuesto-${nivel.id}`} value={nivel.id}>
                                        {nivel.codigo}
                                      </option>
                                    ))}
                                  </select>
                                </label>

                                <label style={labelCampo}>
                                  Nivel confirmado
                                  <select
                                    value={nivelConfirmadoActual}
                                    onChange={(e) =>
                                      actualizarDiplomaIntensivo(
                                        registro,
                                        nivelPropuestoActual,
                                        e.target.value,
                                        registro.recomendacion_siguiente_paso || '',
                                        registro.estado_diploma || 'Pendiente'
                                      )
                                    }
                                    style={selectCampo}
                                  >
                                    {nivelesDiplomaIntensivo.map((nivel) => (
                                      <option key={`confirmado-${nivel.id}`} value={nivel.id}>
                                        {nivel.codigo}
                                      </option>
                                    ))}
                                  </select>
                                </label>

                                <CampoSelect
                                  label="Siguiente paso"
                                  value={registro.recomendacion_siguiente_paso || ''}
                                  opciones={opcionesRecomendacionIntensivo}
                                  onChange={(valor) =>
                                    actualizarDiplomaIntensivo(
                                      registro,
                                      nivelPropuestoActual,
                                      nivelConfirmadoActual,
                                      valor,
                                      registro.estado_diploma || 'Pendiente'
                                    )
                                  }
                                />

                                <CampoSelect
                                  label="Estado evaluación"
                                  value={registro.estado_diploma || 'Pendiente'}
                                  opciones={opcionesEstadoDiplomaIntensivo}
                                  onChange={(valor) =>
                                    actualizarDiplomaIntensivo(
                                      registro,
                                      nivelPropuestoActual,
                                      nivelConfirmadoActual,
                                      registro.recomendacion_siguiente_paso || '',
                                      valor
                                    )
                                  }
                                />
                              </div>

                              <p style={{ marginBottom: 0, marginTop: 10 }}>
                                <strong>Guardado:</strong>{' '}
                                propuesto {codigoNivelPorId(registro.nivel_final_propuesto_id)} ·{' '}
                                confirmado {codigoNivelPorId(registro.nivel_final_confirmado_id)} ·{' '}
                                evaluación {registro.estado_diploma || 'Pendiente'}
                              </p>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {gestorMásAbierto && (
                    <div style={formularioCaja}>
                      <h4 style={{ marginTop: 0 }}>
                        Recuperaciones · {intensivo.intensivo}
                      </h4>

                      <p style={{ marginTop: 0 }}>
                        Las faltas vienen de la asistencia real del entrenamiento. Pulsa el botón para crear recuperaciones pendientes a partir de alumnos marcados como Ausente.
                      </p>

                      <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => generarMásDesdeAsistencias(intensivo)}
                          style={botonPrincipal}
                        >
                          Generar desde asistencias
                        </button>

                        <button
                          onClick={() => setGestionarMásIntensivoId(null)}
                          style={botonSecundario}
                        >
                          Cerrar recuperaciones
                        </button>
                      </div>

                      {recuperacionesIntensivo.length === 0 && (
                        <div style={avisoNeutral}>
                          Todavía no hay recuperaciones asociadas a este intensivo.
                        </div>
                      )}

                      <div style={{ display: 'grid', gap: 10 }}>
                        {recuperacionesIntensivo.map((registro) => (
                          <div key={registro.recuperacion_id} style={miniTarjetaBlanca}>
                            <p style={{ marginTop: 0, fontWeight: 'bold' }}>
                              {registro.alumno}
                            </p>

                            <p>
                              <strong>Origen:</strong>{' '}
                              {registro.intensivo_origen || 'Sin intensivo origen'}
                            </p>

                            <div style={gridFormulario}>
                              <CampoSelect
                                label="Estado recuperación"
                                value={registro.estado || 'Pendiente valorar'}
                                opciones={opcionesEstadoRecuperacionIntensivo}
                                onChange={(valor) =>
                                  actualizarRecuperacionIntensivo(
                                    registro,
                                    valor,
                                    registro.intensivo_destino_id || '',
                                    registro.grupo_destino_id || ''
                                  )
                                }
                              />

                              <label style={labelCampo}>
                                Intensivo destino
                                <select
                                  value={registro.intensivo_destino_id || ''}
                                  onChange={(e) =>
                                    actualizarRecuperacionIntensivo(
                                      registro,
                                      registro.estado || 'Pendiente valorar',
                                      e.target.value,
                                      registro.grupo_destino_id || ''
                                    )
                                  }
                                  style={selectCampo}
                                >
                                  <option value="">Sin intensivo destino</option>
                                  {intensivos.map((opcion) => (
                                    <option
                                      key={opcion.intensivo_id}
                                      value={opcion.intensivo_id}
                                    >
                                      {opcion.intensivo} · {opcion.estado}
                                    </option>
                                  ))}
                                </select>
                              </label>

                              <label style={labelCampo}>
                                Grupo destino
                                <select
                                  value={registro.grupo_destino_id || ''}
                                  onChange={(e) =>
                                    actualizarRecuperacionIntensivo(
                                      registro,
                                      registro.estado || 'Pendiente valorar',
                                      registro.intensivo_destino_id || '',
                                      e.target.value
                                    )
                                  }
                                  style={selectCampo}
                                >
                                  <option value="">Sin grupo destino</option>
                                  {gruposDestinoRecuperacion.map((grupo) => (
                                    <option key={grupo.grupo_id} value={grupo.grupo_id}>
                                      {formatearFecha(grupo.fecha)} · {grupo.hora_inicio.slice(0, 5)} · {grupo.nombre_grupo} · {grupo.modalidad}
                                    </option>
                                  ))}
                                </select>
                              </label>
                            </div>

                            <p style={{ marginBottom: 0 }}>
                              <strong>Destino actual:</strong>{' '}
                              {registro.intensivo_destino || registro.grupo_destino || 'Sin asignar'}
                            </p>

                            <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
                              <button
                                onClick={() => eliminarRecuperacionIntensivo(registro)}
                                style={botonPeligro}
                              >
                                Eliminar recuperación
                              </button>
                            </div>
                          </div>
                        ))}
            
                     </div>
                    </div>
                  )}
                    </>
                  )}
                </article>
              );
            })}
          </section>
        </section>
  );
}
