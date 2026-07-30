import React from 'react';
import { CampoSelect } from '../lib/appHelpers';
export function PantallaIntensivos(ctx: any) {
  const { abrirPanelIntensivo, actualizarDiaIntensivoDesdeApp, actualizarDiplomaIntensivo,
    actualizarNivelAlumnoIntensivo, actualizarRecuperacionIntensivo, agendaBadgeModalidad,
    agruparRecomendacionesDia, alumnoSeleccionadoIntensivoId, alumnosDelIntensivo,
    alumnosDisponiblesParaIntensivo, asistenciasDelIntensivoDia, autoproponerNivelesDiploma,
    avisoCompleto, avisoDisponibilidadDiaIntensivo, avisoNeutral, avisoPendiente,
    ayudaDesplegableCompacta, añadirAlumnoAIntensivo, barraPasosIntensivo,
    borrarDiaIntensivoDesdeApp, borrarGrupoIntensivo, borrarIntensivoCompleto, botonMenu,
    botonPasoIntensivo, botonPeligro, botonPeligroMini, botonPrincipal, botonSecundario, buscador,
    busquedaAlumnoIntensivo, busquedaIntensivos, cabeceraPantalla,
    calcularFechasCuatroSesionesIntensivo, cargando, cargarIntensivos, cerrarPanelesIntensivo,
    chipResumenCursoIntensivo, claveAlumnoRecomendado, claveGrupoRecomendado, codigoNivelPorId,
    crearCuatroSesionesIntensivo, crearGrupoDesdeRecomendacion, crearGrupoNormalIntensivo,
    crearIntensivoDesdeApp, destinoAlumnoRecomendado, diaActivoIntensivoId,
    diaAsistenciaSeleccionadoId, diaEditandoIntensivoId, diaGrupoSeleccionadoId,
    diaIntensivoInicial, diasDelIntensivo, eliminarRecuperacionIntensivo, entrenadores,
    entrenadoresApoyoPorGrupoRecomendado, entrenadoresDisponiblesDiaIntensivo,
    entrenadoresPorGrupoRecomendado, error, estiloBadgePistaApp, estiloGrupoPorPistaApp,
    estiloValidacionPedagogicaApp, etiquetaPistaVisualApp, etiquetaSuperior, filtroIntensivos,
    formDiaIntensivo, formGrupoIntensivo, formIntensivo, formatearFecha, formatearObservaciones,
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
                  Crea el curso, pega Aimharder, trabaja cada día y cierra evaluación final por alumno.
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
                      2 · Listado y alumnos
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

                    <button
                      onClick={() => borrarIntensivoCompleto(intensivo)}
                      style={botonPeligro}
                    >
                      Eliminar intensivo
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
                                            {alumnoGrupo}
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
                                    tipo: e.target.value as PlantillaCuatroSesionesIntensivoState['tipo'],
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
                      <h4 style={{ marginTop: 0 }}>
                        Listado y alumnos · {intensivo.intensivo}
                      </h4>

                      <details style={ayudaDesplegableCompacta}>
                        <summary>Ayuda rápida</summary>
                        <div style={{ marginTop: 8, color: '#475569' }}>
                          Día 1 es el listado principal de Aimharder. Puedes volver a pegar listado cualquier día si hay cambios.
                        </div>
                      </details>

                      <div style={{ display: 'flex', gap: 8, marginTop: 12, marginBottom: 12, flexWrap: 'wrap' }}>
                        <button
                          onClick={() => {
                            setMostrarVolcadoIntensivoId(
                              volcadoAbierto ? null : intensivo.intensivo_id
                            );
                            setResultadoVolcadoIntensivo([]);
                          }}
                          style={botonPrincipal}
                        >
                          {volcadoAbierto ? 'Cerrar Aimharder' : 'Pegar listado Aimharder'}
                        </button>
                      </div>

                      {volcadoAbierto && (
                        <div style={miniTarjetaBlanca}>
                          <h4 style={{ marginTop: 0 }}>Listado Aimharder</h4>

                          <label style={labelCampo}>
                            Pega aquí el listado completo
                            <textarea
                              value={textoVolcadoIntensivo}
                              onChange={(e) => setTextoVolcadoIntensivo(e.target.value)}
                              placeholder={
                                'PABLO SINDE ANDRES\nReserva el 11/05/2026 a las 10:04\nTermina tarifa el 17/05/2026\n\nSOFIA XENOFONTOS GONZALEZ\nReserva el 11/05/2026 a las 10:05'
                              }
                              style={{
                                ...inputCampo,
                                minHeight: 170,
                                resize: 'vertical',
                                lineHeight: 1.4,
                              }}
                            />
                          </label>

                          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                            <button
                              onClick={() => volcarListadoAlumnosIntensivo(intensivo)}
                              style={botonPrincipal}
                            >
                              Volcar y actualizar alumnos
                            </button>

                            <button
                              onClick={() => {
                                setTextoVolcadoIntensivo('');
                                setResultadoVolcadoIntensivo([]);
                              }}
                              style={botonSecundario}
                            >
                              Limpiar
                            </button>
                          </div>

                          {resultadoVolcadoIntensivo.length > 0 && (
                            <div style={{ marginTop: 12 }}>
                              <div style={avisoCompleto}>
                                Volcado completado: {resultadoVolcadoIntensivo.length} alumnos · {totalVolcadoExistentes} existentes · {totalVolcadoNuevos} nuevos
                              </div>

                              <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                                {resultadoVolcadoIntensivo.map((registro) => (
                                  <div key={registro.alumno_id} style={miniTarjetaBlanca}>
                                    <p style={{ margin: 0, fontWeight: 'bold' }}>
                                      {registro.alumno}
                                    </p>
                                    <p style={{ margin: '6px 0' }}>
                                      {registro.resultado} · Nivel: {registro.nivel_resumen || 'SIN NIVEL'} · Pista: {registro.pista_resumen || 'Pendiente'}
                                    </p>
                                    <p style={{ margin: 0 }}>
                                      Ficha: {registro.estado_ficha}
                                    </p>
                                    {registro.observacion_visible_entrenador && (
                                      <p style={{ margin: '6px 0 0' }}>
                                        Obs. entrenador: {registro.observacion_visible_entrenador}
                                      </p>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

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

                      <h4>Alumnos inscritos · {alumnosInscritosIntensivo.length}</h4>

                      {alumnosInscritosIntensivo.length === 0 && (
                        <p style={{ marginBottom: 0 }}>
                          Todavía no hay alumnos inscritos en este intensivo.
                        </p>
                      )}

                      <div style={{ display: 'grid', gap: 10 }}>
                        {alumnosInscritosIntensivo.map((registro) => {
                          const resumenAlumno = resumenAlumnoIntensivo(registro.alumno_id);
                          const nivelUsado = resumenAlumno?.nivel_resumen || 'SIN NIVEL';
                          const pistaUsada = resumenAlumno?.pista_resumen || 'Pendiente';
                          const origenNivel = resumenAlumno?.origen_nivel_estimado || 'Desconocido';
                          const fuenteNivel = resumenAlumno?.nivel_actual
                            ? 'Nivel actual'
                            : resumenAlumno?.nivel_estimado
                              ? 'Nivel estimado'
                              : 'Sin nivel';

                          return (
                            <details
                              key={registro.intensivo_alumno_id}
                              style={{
                                ...miniTarjetaBlanca,
                                background: resumenAlumno?.estado_ficha === 'completa' ? 'rgba(240,253,244,.62)' : 'rgba(255,247,237,.8)',
                                border: resumenAlumno?.estado_ficha === 'completa' ? '1px solid rgba(22,163,74,.22)' : '1px solid rgba(249,115,22,.28)',
                              }}
                            >
                              <summary style={{ cursor: 'pointer', listStyle: 'none' }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                  <strong>{registro.alumno}</strong>
                                  <span style={agendaBadgeModalidad}>Nivel {nivelUsado}</span>
                                </div>
                                <p style={{ margin: '6px 0 0', color: '#475569' }}>
                                  {fuenteNivel} · {origenNivel} · {pistaUsada}
                                </p>
                              </summary>

                              <div style={{ marginTop: 12 }}>
                                <div style={avisoNeutral}>
                                  <strong>Nivel ficha:</strong> {nivelUsado} ·{' '}
                                  <strong>Fuente:</strong> {fuenteNivel} ·{' '}
                                  <strong>Origen:</strong> {origenNivel} ·{' '}
                                  <strong>Pista:</strong> {pistaUsada}
                                </div>

                                <p>
                                  <strong>Ficha:</strong>{' '}
                                  {resumenAlumno?.estado_ficha || registro.estado_diploma || '-'}
                                </p>

                                {resumenAlumno?.observacion_visible_entrenador && (
                                  <p>
                                    <strong>Obs. entrenador:</strong>{' '}
                                    {resumenAlumno.observacion_visible_entrenador}
                                  </p>
                                )}

                                <div style={gridFormulario}>
                                  <CampoSelect
                                    label="Cambiar nivel rápido"
                                    value={nivelUsado === 'SIN NIVEL' ? 'INICIACION' : nivelUsado}
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
                                        nivelUsado === 'SIN NIVEL' ? 'INICIACION' : nivelUsado,
                                        valor
                                      )
                                    }
                                  />
                                </div>

                                <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
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
                            Por defecto cuenta como asistido. Marca solo el día que faltó; la recuperación se prepara automáticamente.
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
                                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                                          <button
                                            type="button"
                                            disabled={!asistencia}
                                            onClick={() => asistencia && marcarAsistenciaIntensivo(asistencia, ausente ? 'PRESENTE' : 'NO_PRESENTADO', !ausente)}
                                            style={ausente ? botonSecundario : botonPeligroMini}
                                          >
                                            {ausente ? 'Quitar falta' : 'Marcar falta'}
                                          </button>
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
                    </div>
                  )}

                  {gestorGruposAbierto && (
                    <div style={formularioCaja}>
                      <h4 style={{ marginTop: 0 }}>
                        Grupos por día · {intensivo.intensivo}
                      </h4>


                      {diasIntensivo.length === 0 && (
                        <div style={avisoPendiente}>
                          Primero añade al menos un día al intensivo.
                        </div>
                      )}

                      {diasIntensivo.length > 0 && (
                        <>
                          <details style={{ ...miniTarjetaBlanca, marginBottom: 12 }}>
                            <summary style={{ fontWeight: 'bold', cursor: 'pointer' }}>
                              Crear grupo manual
                            </summary>
                            <div style={gridFormulario}>
                            <label style={labelCampo}>
                              Día del intensivo
                              <select
                                value={
                                  diaSeleccionadoGrupo?.intensivo_dia_id ||
                                  diaGrupoSeleccionadoId
                                }
                                onChange={(e) => setDiaGrupoSeleccionadoId(e.target.value)}
                                style={selectCampo}
                              >
                                {diasIntensivo.map((dia) => (
                                  <option
                                    key={dia.intensivo_dia_id}
                                    value={dia.intensivo_dia_id}
                                  >
                                    Día {dia.numero_dia} · {formatearFecha(dia.fecha)} ·{' '}
                                    {dia.hora_inicio.slice(0, 5)}–{dia.hora_fin.slice(0, 5)}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label style={labelCampo}>
                              Nombre grupo
                              <input
                                value={formGrupoIntensivo.nombre_grupo}
                                onChange={(e) =>
                                  setFormGrupoIntensivo({
                                    ...formGrupoIntensivo,
                                    nombre_grupo: e.target.value,
                                  })
                                }
                                placeholder="Grupo Intensivo 1"
                                style={inputCampo}
                              />
                            </label>

                            <label style={labelCampo}>
                              Nivel grupo
                              <input
                                value={formGrupoIntensivo.nivel_grupo}
                                onChange={(e) =>
                                  setFormGrupoIntensivo({
                                    ...formGrupoIntensivo,
                                    nivel_grupo: e.target.value,
                                  })
                                }
                                placeholder="B / B+ / Pista pequeña..."
                                style={inputCampo}
                              />
                            </label>

                            <CampoSelect
                              label="Pista"
                              value={formGrupoIntensivo.pista}
                              opciones={opcionesPistaGrupoIntensivo}
                              onChange={(valor) =>
                                setFormGrupoIntensivo({
                                  ...formGrupoIntensivo,
                                  pista: valor,
                                })
                              }
                            />

                            <label style={labelCampo}>
                              Punto encuentro
                              <input
                                value={formGrupoIntensivo.punto_encuentro}
                                onChange={(e) =>
                                  setFormGrupoIntensivo({
                                    ...formGrupoIntensivo,
                                    punto_encuentro: e.target.value,
                                  })
                                }
                                placeholder="1"
                                style={inputCampo}
                              />
                            </label>

                            <div style={avisoNeutral}>{avisoDisponibilidadDiaIntensivo(diaSeleccionadoGrupo)}</div>

                            <label style={labelCampo}>
                              Entrenador
                              <select
                                value={formGrupoIntensivo.entrenador_id}
                                onChange={(e) =>
                                  setFormGrupoIntensivo({
                                    ...formGrupoIntensivo,
                                    entrenador_id: e.target.value,
                                  })
                                }
                                style={selectCampo}
                              >
                                <option value="">Selecciona entrenador</option>
                                {entrenadoresDisponiblesDiaIntensivo(diaSeleccionadoGrupo).map((entrenador) => (
                                  <option
                                    key={entrenador.entrenador_id}
                                    value={entrenador.entrenador_id}
                                  >
                                    {entrenador.nombre_completo}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label style={labelCampo}>
                              Segundo entrenador, si hace falta
                              <select
                                value={formGrupoIntensivo.entrenador_apoyo_id}
                                onChange={(e) =>
                                  setFormGrupoIntensivo({
                                    ...formGrupoIntensivo,
                                    entrenador_apoyo_id: e.target.value,
                                  })
                                }
                                style={selectCampo}
                              >
                                <option value="">Sin segundo entrenador</option>
                                {entrenadoresDisponiblesDiaIntensivo(diaSeleccionadoGrupo)
                                  .filter((entrenador) => entrenador.entrenador_id !== formGrupoIntensivo.entrenador_id)
                                  .map((entrenador) => (
                                    <option key={`manual-apoyo-${entrenador.entrenador_id}`} value={entrenador.entrenador_id}>
                                      {entrenador.nombre_completo}
                                    </option>
                                  ))}
                              </select>
                            </label>

                            <label style={labelCampo}>
                              Publicación
                              <select
                                value={formGrupoIntensivo.publicado ? 'si' : 'no'}
                                onChange={(e) =>
                                  setFormGrupoIntensivo({
                                    ...formGrupoIntensivo,
                                    publicado: e.target.value === 'si',
                                  })
                                }
                                style={selectCampo}
                              >
                                <option value="si">Publicado para entrenador</option>
                                <option value="no">Borrador</option>
                              </select>
                            </label>
                          </div>
                          </details>

                          <div style={{ ...miniTarjetaBlanca, marginTop: 12 }}>
                            <h4 style={{ marginTop: 0 }}>Recomendador</h4>
                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              <button
                                onClick={() =>
                                  generarRecomendacionGruposIntensivo(
                                    diaSeleccionadoGrupo || undefined
                                  )
                                }
                                style={botonPrincipal}
                              >
                                Generar propuesta automática
                              </button>

                              <button
                                onClick={() => {
                                  if (!diaSeleccionadoGrupo) return;
                                  setRecomendacionesGrupoIntensivo((anteriores) =>
                                    anteriores.filter(
                                      (registro) =>
                                        registro.intensivo_dia_id !==
                                        diaSeleccionadoGrupo.intensivo_dia_id
                                    )
                                  );
                                  setEntrenadoresPorGrupoRecomendado({});
                                  setDestinoAlumnoRecomendado({});
                                  setTrabajoDiarioPorGrupoRecomendado({});
                                  setObservacionesPorGrupoRecomendado({});
                                }}
                                style={botonSecundario}
                              >
                                Limpiar propuesta
                              </button>
                            </div>

                            {alumnosPendientesRecomendacion > 0 && (
                              <div style={{ ...avisoCompleto, marginTop: 10 }}>
                                Propuesta cargada: {gruposRecomendadosDia.length} grupos · {alumnosPendientesRecomendacion} alumnos pendientes.
                              </div>
                            )}

                            {gruposRecomendadosDia.length > 0 && (
                              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                                <div style={avisoNeutral}>
                                  Propuesta editable antes de publicar: puedes mover un niño a otro grupo o dejarlo fuera de momento. El trabajo diario se genera solo según nivel/pista y puedes retocarlo antes de crear el grupo.
                                </div>

                                {gruposRecomendadosDia.map(({ nombreGrupo, alumnosGrupo }) => {
                                  const primero = alumnosGrupo[0];
                                  const clave = diaSeleccionadoGrupo
                                    ? claveGrupoRecomendado(
                                        diaSeleccionadoGrupo.intensivo_dia_id,
                                        nombreGrupo
                                      )
                                    : nombreGrupo;
                                  const alertasGrupo = Array.from(
                                    new Set(
                                      alumnosGrupo
                                        .map((alumno) => alumno.alerta_grupo)
                                        .filter((alerta) => alerta && alerta !== 'OK')
                                    )
                                  );
                                  const nivelesGrupo = Array.from(
                                    new Set(
                                      alumnosGrupo
                                        .map((alumno) => alumno.nivel_resumen)
                                        .filter(Boolean)
                                    )
                                  ).join(' / ');
                                  const trabajoAuto = generarTrabajoDiarioAutomaticoGrupo(
                                    nombreGrupo,
                                    alumnosGrupo
                                  );
                                  const trabajoGrupo = trabajoDiarioPorGrupoRecomendado[clave] ?? trabajoAuto;
                                  const observacionesGrupo = observacionesPorGrupoRecomendado[clave] ?? '';
                                  const observacionesAutoGrupoIntensivo = observacionesAutomaticasGrupoIntensivo(alumnosGrupo);
                                  const validacionPedagogicaGrupo = textoValidacionPedagogicaGrupoApp(alumnosGrupo);

                                  return (
                                    <div key={clave} style={miniTarjetaBlanca}>
                                      <h4 style={{ marginTop: 0, marginBottom: 6 }}>
                                        {nombreGrupo}
                                      </h4>

                                      <p style={{ margin: '4px 0' }}>
                                        <strong>Bloque:</strong>{' '}
                                        {primero?.bloque_tecnico || '-'} ·{' '}
                                        <strong>Pista:</strong>{' '}
                                        {primero?.pista_recomendada || '-'} ·{' '}
                                        <strong>Niveles:</strong> {nivelesGrupo || '-'} ·{' '}
                                        <strong>Alumnos:</strong> {alumnosGrupo.length}
                                      </p>

                                      {alertasGrupo.length > 0 && (
                                        <div style={avisoPendiente}>
                                          {alertasGrupo.join(' | ')}
                                        </div>
                                      )}

                                      <div style={{ ...estiloValidacionPedagogicaApp(validacionPedagogicaGrupo.estado), marginTop: 10 }}>
                                        <strong>{validacionPedagogicaGrupo.titulo}</strong>
                                        {validacionPedagogicaGrupo.mensajes.length > 0 && (
                                          <ul style={{ margin: '6px 0 0', paddingLeft: 18 }}>
                                            {validacionPedagogicaGrupo.mensajes.map((mensaje) => <li key={`${clave}-${mensaje}`}>{mensaje}</li>)}
                                          </ul>
                                        )}
                                      </div>

                                      <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
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
                                              style={{
                                                borderBottom: '1px solid #eeeeee',
                                                paddingBottom: 8,
                                              }}
                                            >
                                              <strong>
                                                {alumno.orden_en_grupo}. {alumno.alumno}
                                              </strong>{' '}
                                              · Nivel {alumno.nivel_resumen} · {alumno.fuente_nivel}
                                              {alumno.edad ? ` · ${alumno.edad} años` : ''}

                                              <div style={{ ...gridFormulario, marginTop: 6 }}>
                                                <label style={labelCampo}>
                                                  Mover / dejar fuera
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
                                                      <option key={`${claveAlumno}-${nombreBase}`} value={nombreBase}>
                                                        {nombreBase}
                                                      </option>
                                                    ))}
                                                    <option value="__NO_CREAR__">No meter en grupo todavía</option>
                                                  </select>
                                                </label>
                                              </div>

                                              {alumno.observacion_visible_entrenador && (
                                                <p style={{ margin: '4px 0 0' }}>
                                                  Obs: {alumno.observacion_visible_entrenador}
                                                </p>
                                              )}
                                            </div>
                                          );
                                        })}
                                      </div>

                                      <div style={{ ...avisoNeutral, marginTop: 10 }}>
                                        {avisoDisponibilidadDiaIntensivo(diaSeleccionadoGrupo)}
                                      </div>

                                      <div style={{ ...gridFormulario, marginTop: 10 }}>
                                        <label style={labelCampo}>
                                          Entrenador para este grupo
                                          <select
                                            value={entrenadoresPorGrupoRecomendado[clave] || ''}
                                            onChange={(e) =>
                                              setEntrenadoresPorGrupoRecomendado({
                                                ...entrenadoresPorGrupoRecomendado,
                                                [clave]: e.target.value,
                                              })
                                            }
                                            style={selectCampo}
                                          >
                                            <option value="">Selecciona entrenador</option>
                                            {entrenadoresDisponiblesDiaIntensivo(diaSeleccionadoGrupo).map((entrenador) => (
                                              <option
                                                key={`${clave}-${entrenador.entrenador_id}`}
                                                value={entrenador.entrenador_id}
                                              >
                                                {entrenador.nombre_completo}
                                              </option>
                                            ))}
                                          </select>
                                        </label>
                                        <label style={labelCampo}>
                                          Segundo entrenador, si hace falta
                                          <select
                                            value={entrenadoresApoyoPorGrupoRecomendado[clave] || ''}
                                            onChange={(e) =>
                                              setEntrenadoresApoyoPorGrupoRecomendado({
                                                ...entrenadoresApoyoPorGrupoRecomendado,
                                                [clave]: e.target.value,
                                              })
                                            }
                                            style={selectCampo}
                                          >
                                            <option value="">Sin segundo entrenador</option>
                                            {entrenadoresDisponiblesDiaIntensivo(diaSeleccionadoGrupo)
                                              .filter((entrenador) => entrenador.entrenador_id !== (entrenadoresPorGrupoRecomendado[clave] || ''))
                                              .map((entrenador) => (
                                                <option
                                                  key={`${clave}-apoyo-${entrenador.entrenador_id}`}
                                                  value={entrenador.entrenador_id}
                                                >
                                                  {entrenador.nombre_completo}
                                                </option>
                                              ))}
                                          </select>
                                        </label>
                                      </div>

                                      {necesitaDosEntrenadoresGrupoApp(alumnosGrupo) && (
                                        <div style={{ ...avisoPendiente, marginTop: 8 }}>
                                          {textoNecesidadDosEntrenadoresApp(alumnosGrupo)}
                                        </div>
                                      )}

                                      {(entrenadoresPorGrupoRecomendado[clave] && entrenadoresApoyoPorGrupoRecomendado[clave]) && (
                                        <details style={{ ...avisoNeutral, marginTop: 8 }}>
                                          <summary style={{ cursor: 'pointer', fontWeight: 900 }}>Reparto de reportes / niños</summary>
                                          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                                            {alumnosGrupo.map((alumno, indiceAlumnoReparto) => (
                                              <label key={`${clave}-resp-${alumno.alumno_id}`} style={labelCampo}>
                                                {alumno.alumno}
                                                <select
                                                  value={responsableReporteRecomendadoApp(
                                                    clave,
                                                    alumno.alumno_id,
                                                    indiceAlumnoReparto,
                                                    entrenadoresPorGrupoRecomendado[clave],
                                                    entrenadoresApoyoPorGrupoRecomendado[clave]
                                                  )}
                                                  onChange={(e) => setResponsablesReportePorGrupoRecomendado({
                                                    ...responsablesReportePorGrupoRecomendado,
                                                    [`${clave}__${alumno.alumno_id}`]: e.target.value,
                                                  })}
                                                  style={selectCampo}
                                                >
                                                  <option value={entrenadoresPorGrupoRecomendado[clave]}>
                                                    {entrenadores.find((entrenador) => entrenador.entrenador_id === entrenadoresPorGrupoRecomendado[clave])?.nombre_completo || 'Entrenador 1'}
                                                  </option>
                                                  <option value={entrenadoresApoyoPorGrupoRecomendado[clave]}>
                                                    {entrenadores.find((entrenador) => entrenador.entrenador_id === entrenadoresApoyoPorGrupoRecomendado[clave])?.nombre_completo || 'Entrenador 2'}
                                                  </option>
                                                </select>
                                              </label>
                                            ))}
                                          </div>
                                        </details>
                                      )}

                                      <label style={{ ...labelCampo, marginTop: 10 }}>
                                        Trabajo diario automático según nivel/pista para este grupo
                                        <textarea
                                          value={trabajoGrupo}
                                          onChange={(e) =>
                                            setTrabajoDiarioPorGrupoRecomendado({
                                              ...trabajoDiarioPorGrupoRecomendado,
                                              [clave]: e.target.value,
                                            })
                                          }
                                          style={{ ...inputCampo, minHeight: 130 }}
                                        />
                                      </label>

                                      {observacionesAutoGrupoIntensivo && (
                                        <div style={{ ...avisoCompleto, marginTop: 10 }}>
                                          <strong>Observaciones</strong>
                                          <div style={{ marginTop: 6 }}>{formatearObservaciones(observacionesAutoGrupoIntensivo)}</div>
                                        </div>
                                      )}

                                      <label style={{ ...labelCampo, marginTop: 10 }}>
                                        Observaciones tuyas para este grupo, opcional
                                        <textarea
                                          value={observacionesGrupo}
                                          onChange={(e) =>
                                            setObservacionesPorGrupoRecomendado({
                                              ...observacionesPorGrupoRecomendado,
                                              [clave]: e.target.value,
                                            })
                                          }
                                          placeholder="Se sumará a las observaciones automáticas. Ejemplo: padre avisa algo, entrar despacio, revisar percha..."
                                          style={{ ...inputCampo, minHeight: 70 }}
                                        />
                                      </label>

                                      <button
                                        onClick={() =>
                                          crearGrupoDesdeRecomendacion(
                                            intensivo,
                                            diaSeleccionadoGrupo || undefined,
                                            nombreGrupo,
                                            alumnosGrupo
                                          )
                                        }
                                        style={botonPrincipal}
                                      >
                                        Crear este grupo editado y publicar
                                      </button>
                                    </div>
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

                          {observacionesAutomaticasGrupoIntensivoManual(formGrupoIntensivo.alumnos_ids) && (
                            <div style={{ ...avisoCompleto, marginTop: 10 }}>
                              <strong>Observaciones</strong>
                              <div style={{ marginTop: 6 }}>{formatearObservaciones(observacionesAutomaticasGrupoIntensivoManual(formGrupoIntensivo.alumnos_ids))}</div>
                            </div>
                          )}

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

                          <details style={{ marginTop: 12 }}>
                            <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                              Seleccionar alumnos manual
                            </summary>
                            {alumnosInscritosIntensivo.length === 0 && (
                              <div style={avisoPendiente}>
                                Este intensivo todavía no tiene alumnos inscritos.
                              </div>
                            )}

                            <div style={{ display: 'grid', gap: 8, marginTop: 8 }}>
                              {alumnosInscritosIntensivo.map((registro) => {
                                const seleccionado = formGrupoIntensivo.alumnos_ids.includes(
                                  registro.alumno_id
                                );

                                return (
                                  <label
                                    key={registro.intensivo_alumno_id}
                                    style={{
                                      ...miniTarjetaBlanca,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 8,
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={seleccionado}
                                      onChange={(e) => {
                                        const nuevosAlumnos = e.target.checked
                                          ? [
                                              ...formGrupoIntensivo.alumnos_ids,
                                              registro.alumno_id,
                                            ]
                                          : formGrupoIntensivo.alumnos_ids.filter(
                                              (alumnoId) => alumnoId !== registro.alumno_id
                                            );

                                        setFormGrupoIntensivo({
                                          ...formGrupoIntensivo,
                                          alumnos_ids: nuevosAlumnos,
                                        });
                                      }}
                                    />
                                    <span>
                                      {registro.alumno}
                                      {(() => {
                                        const resumenAlumno = resumenAlumnoIntensivo(registro.alumno_id);
                                        return resumenAlumno ? (
                                          <>
                                            {' '}· Nivel: {resumenAlumno.nivel_resumen || 'SIN NIVEL'} · Pista: {resumenAlumno.pista_resumen || 'Pendiente'}
                                          </>
                                        ) : null;
                                      })()}
                                    </span>
                                  </label>
                                );
                              })}
                            </div>
                          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                            <button
                              onClick={() =>
                                crearGrupoNormalIntensivo(
                                  intensivo,
                                  diaSeleccionadoGrupo || undefined
                                )
                              }
                              style={botonPrincipal}
                            >
                              Crear grupo manual
                            </button>

                            <button
                              onClick={() =>
                                setFormGrupoIntensivo({
                                  ...formGrupoIntensivo,
                                  alumnos_ids: alumnosInscritosIntensivo.map(
                                    (registro) => registro.alumno_id
                                  ),
                                })
                              }
                              style={botonSecundario}
                            >
                              Seleccionar todos
                            </button>

                            <button
                              onClick={() =>
                                setFormGrupoIntensivo({
                                  ...formGrupoIntensivo,
                                  alumnos_ids: [],
                                })
                              }
                              style={botonSecundario}
                            >
                              Vaciar selección
                            </button>
                          </div>
                          </details>

                          <details style={{ ...ayudaDesplegableCompacta, marginTop: 14 }}>
                            <summary>Ver grupos publicados este día ({gruposDiaSeleccionado.length})</summary>
                            <div style={{ marginTop: 10 }}>
                          {gruposDiaSeleccionado.length === 0 && (
                            <div style={avisoNeutral}>
                              Todavía no hay grupos normales creados para este día.
                            </div>
                          )}

                          <div style={{ display: 'grid', gap: 10 }}>
                            {gruposDiaSeleccionado.map((grupo, indiceGrupoIntensivoCreado) => (
                              <div key={grupo.grupo_id || grupo.intensivo_dia_id} style={estiloGrupoPorPistaApp(grupo)}>
                                <p style={{ marginTop: 0, fontWeight: 'bold' }}>
                                  {nombreGrupoVisualApp(grupo, indiceGrupoIntensivoCreado)}
                                </p>
                                <p>
                                  <strong>Entrenador:</strong>{' '}
                                  {grupo.entrenador || 'Sin entrenador'} ·{' '}
                                  {grupo.estado_confirmacion || 'Sin confirmar'}
                                </p>
                                <p>
                                  <strong>Estado:</strong>{' '}
                                  {grupo.estado_grupo || '-'} ·{' '}
                                  {grupo.publicado ? 'Publicado' : 'Borrador'} ·{' '}
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
                                          {alumnoGrupo}
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
                        Primero marca en asistencia una falta como “Sí genera”. Después pulsa este botón para crear las recuperaciones pendientes.
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
