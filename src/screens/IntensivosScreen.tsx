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
    calcularFechasCuatroSesionesIntensivo, cargando, cargarIntensivos, cambiarEstadoIntensivoCurso, cerrarPanelesIntensivo,
    chipResumenCursoIntensivo, claveAlumnoRecomendado, claveGrupoRecomendado, codigoNivelPorId,
    crearCuatroSesionesIntensivo, crearGrupoDesdeRecomendacion,
    crearTodosGruposDesdeRecomendacionIntensivo, crearGrupoNormalIntensivo,
    crearGrupoVacioPropuestaIntensivo, generarPlantillaCuatroDiasIntensivo,
    crearPlantillaCuatroDiasIntensivo, cargarEdicionGruposIntensivoDia,
    abrirGestionOperativaIntensivoDia, configurarWhatsappIntensivoApp,
    enlaceWhatsappIntensivoApp,
    guardarComposicionDiaIntensivo,
    crearIntensivoDesdeApp, destinoAlumnoRecomendado, diaActivoIntensivoId,
    diaAsistenciaSeleccionadoId, diaEditandoIntensivoId, diaGrupoSeleccionadoId,
    diaIntensivoInicial, diasDelIntensivo, eliminarRecuperacionIntensivo, entrenadores,
    entrenadoresApoyoPorGrupoRecomendado, entrenadoresDisponiblesDiaIntensivo,
    entrenadoresPorGrupoRecomendado, error, esVistaMovilApp,
    enfocarElementoApp, estiloBadgePistaApp, estiloGrupoPorPistaApp,
    estiloValidacionPedagogicaApp, etiquetaPistaVisualApp, etiquetaSuperior, filtroIntensivos,
    formDiaIntensivo, formGrupoIntensivo, formIntensivo, temporadaActivaCierre, formatearAlumnoListadoOperativo, formatearFecha, formatearObservaciones,
    formularioCaja, generarMásDesdeAsistencias, generarRecomendacionGruposIntensivo,
    generarTrabajoDiarioAutomaticoGrupo, gestionarAlumnosIntensivoId,
    gestionarAsistenciaIntensivoId, gestionarDiplomasIntensivoId, gestionarGruposIntensivoId,
    gestionarMásIntensivoId, gestionarPanelControlIntensivoId, gridFormulario,
    gruposDestinoRecuperacion, gruposNormalesDelDiaIntensivo, guardarDiaIntensivo, inputCampo,
    intensivoCursoAbiertoId, intensivoInicial, intensivos, intensivosFiltrados, labelCampo,
    marcarAsistenciaIntensivo, reiniciarGruposDiaIntensivoDesdeApp, mesIntensivos, miniTarjetaBlanca, mostrarFormularioIntensivo,
    mostrarPlantillaCuatroSesionesIntensivoId, mostrarVolcadoIntensivoId,
    necesitaDosEntrenadoresGrupoApp, nivelesDiplomaIntensivo, nombreGrupoVisualApp,
    nombresGruposBaseRecomendados, observacionesAutomaticasGrupoIntensivo,
    observacionesAutomaticasGrupoIntensivoManual, observacionesPorGrupoRecomendado,
    opcionesEstadoDiplomaIntensivo, opcionesEstadoRecuperacionIntensivo, opcionesNivel,
    opcionesOrigenNivelAlumno, opcionesPistaGrupoIntensivo, opcionesRecomendacionIntensivo,
    panelControlDelIntensivo, plantillaCuatroSesionesInicial, plantillaCuatroSesionesIntensivo,
    prepararEdicionDiaIntensivo, prepararCambioRevisionIntensivo,
    analizarRevisionEntreSesionesIntensivo, revisionIntensivoId,
    revisionIntensivoDiaId, revisionIntensivoSugerencias,
    revisionIntensivoAnalizando, revisionIntensivoAnalizado,
    setRevisionIntensivoDiaId, setRevisionIntensivoSugerencias,
    setRevisionIntensivoAnalizado, quitarAlumnoDeIntensivo,
    recomendacionesDelDiaIntensivo,
    recuperacionesDelIntensivo, recomendacionesRecuperacion, recomendacionesDeRecuperacion, aprobarRecuperacionInteligente, reportesDetalleAlumnoIntensivo, responsableReporteRecomendadoApp,
    responsablesReportePorGrupoRecomendado, resultadoVolcadoIntensivo, resumenAlumnoIntensivo,
    resumenFinalDelIntensivo, resumenReportesDelIntensivo, selectCampo,
    setAlumnoSeleccionadoIntensivoId, setBusquedaAlumnoIntensivo, setBusquedaIntensivos,
    setDestinoAlumnoRecomendado, setDiaEditandoIntensivoId, setDiaGrupoSeleccionadoId,
    setEntrenadoresApoyoPorGrupoRecomendado, setEntrenadoresPorGrupoRecomendado,
    setFiltroIntensivos, setMesIntensivos, setFormDiaIntensivo, setFormGrupoIntensivo, setFormIntensivo,
    setGestionarAlumnosIntensivoId, setGestionarDiplomasIntensivoId, setGestionarMásIntensivoId,
    setIntensivoCursoAbiertoId, setMostrarFormularioIntensivo,
    setMostrarPlantillaCuatroSesionesIntensivoId, setMostrarVolcadoIntensivoId,
    setObservacionesPorGrupoRecomendado, setPlantillaCuatroSesionesIntensivo,
    setRecomendacionesGrupoIntensivo, setResponsablesReportePorGrupoRecomendado,
    setResultadoVolcadoIntensivo, setTextoVolcadoIntensivo, setTrabajoDiarioPorGrupoRecomendado,
    tarjeta, tarjetaIntensivoCurso, textoBaseDiplomaIntensivo, textoNecesidadDosEntrenadoresApp,
    textoValidacionPedagogicaGrupoApp, textoVolcadoIntensivo, trabajoDiarioPorGrupoRecomendado,
    volcarListadoAlumnosIntensivo } = ctx;

  function formatearAlumnoIntensivoVisible(valor: string | null | undefined) {
    const partes = String(valor || '')
      .split('·')
      .map((parte) => parte.trim())
      .filter(Boolean);

    if (partes.length === 0) return '-';

    const esPrefijoTest = (parte: string) =>
      /^(ZZZS|TEST(?:\s+NUEVO)?|\[TEST[^\]]*\])$/i.test(parte);
    const esNivel = (parte: string) =>
      /^(?:Nivel\s*:?\s*)?(INICIACI[ÓO]N|DEBUT|A\+?|B\+?|C\+?|D\+?)$/i.test(parte);

    let indiceNombre = 0;
    if (partes.length > 1 && esPrefijoTest(partes[0]) && !esNivel(partes[1])) {
      indiceNombre = 1;
    }

    const nombre = partes[indiceNombre]
      .replace(/^\d+[.)-]?\s*/, '')
      .trim();
    const prefijo = indiceNombre === 1 ? `${partes[0]} · ` : '';
    const nivelParte = partes.find((parte, indice) =>
      indice !== indiceNombre && esNivel(parte)
    );
    const nivel = nivelParte
      ? nivelParte.replace(/^Nivel\s*:?\s*/i, '').toUpperCase()
      : '';

    return `${prefijo}${nombre}${nivel ? ` · ${nivel}` : ''}`;
  }

  function tarjetaRecuperacionInteligente(registro: any, compacta = false) {
    const propuestas = recomendacionesDeRecuperacion(registro.recuperacion_id).slice(
      0,
      compacta ? 1 : 3
    );
    const aprobada = registro.estado === 'Aprobada' && registro.grupo_destino_id;

    return (
      <div
        key={`${compacta ? 'compacta' : 'gestion'}-${registro.recuperacion_id}`}
        style={{
          ...miniTarjetaBlanca,
          border: aprobada
            ? '1px solid rgba(22,163,74,.32)'
            : '1px solid rgba(249,115,22,.42)',
          background: aprobada
            ? 'rgba(240,253,244,.78)'
            : 'rgba(255,247,237,.88)',
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: 10,
            flexWrap: 'wrap',
            alignItems: 'flex-start',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <strong>{registro.alumno}</strong>
            <p style={{ margin: '5px 0 0', color: '#64748b' }}>
              {registro.numero_dia_origen
                ? `Falta · Día ${registro.numero_dia_origen}`
                : 'Falta recuperable'}
              {registro.fecha_falta
                ? ` · ${formatearFecha(registro.fecha_falta)}`
                : ''}
              {registro.nivel_alumno ? ` · Nivel ${registro.nivel_alumno}` : ''}
            </p>
          </div>
          <span style={agendaBadgeModalidad}>
            {aprobada ? 'APROBADA' : registro.estado || 'Pendiente valorar'}
          </span>
        </div>

        {aprobada ? (
          <div style={{ ...avisoCompleto, marginTop: 10 }}>
            <strong>Recuperación asignada</strong>
            <p style={{ margin: '5px 0 0' }}>
              {registro.intensivo_destino || 'Intensivo destino'}
              {registro.grupo_destino ? ` · ${registro.grupo_destino}` : ''}
              {registro.fecha_destino
                ? ` · ${formatearFecha(registro.fecha_destino)}`
                : ''}
              {registro.hora_inicio_destino
                ? ` · ${registro.hora_inicio_destino.slice(0, 5)}`
                : ''}
            </p>
            <p style={{ margin: '5px 0 0', color: '#166534' }}>
              Se marcará como resuelta automáticamente cuando conste como presente en ese grupo.
            </p>
          </div>
        ) : propuestas.length > 0 ? (
          <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
            {!compacta && (
              <strong>Propuestas seguras · mejor opción primero</strong>
            )}
            {propuestas.map((propuesta: any) => (
              <div
                key={`${registro.recuperacion_id}-${propuesta.grupo_id}`}
                style={{
                  border: propuesta.categoria === 'IDEAL'
                    ? '1px solid rgba(22,163,74,.30)'
                    : '1px solid rgba(59,130,246,.28)',
                  borderRadius: 12,
                  padding: 10,
                  background: '#fff',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  <strong>
                    {propuesta.intensivo_destino} · {propuesta.nombre_grupo}
                  </strong>
                  <span
                    style={{
                      ...agendaBadgeModalidad,
                      background:
                        propuesta.categoria === 'IDEAL' ? '#ecfdf5' : '#eff6ff',
                      color:
                        propuesta.categoria === 'IDEAL' ? '#047857' : '#1d4ed8',
                    }}
                  >
                    {propuesta.categoria}
                  </span>
                </div>
                <p style={{ margin: '6px 0 0', color: '#475569' }}>
                  {formatearFecha(propuesta.fecha)} · {propuesta.hora_inicio.slice(0, 5)}-
                  {propuesta.hora_fin.slice(0, 5)} · {propuesta.pista || 'Pista pendiente'}
                  {propuesta.nivel_grupo ? ` · Grupo ${propuesta.nivel_grupo}` : ''}
                </p>
                <p style={{ margin: '5px 0 0', color: '#475569' }}>
                  {propuesta.total_alumnos}/{propuesta.capacidad_max} niños · {propuesta.plazas_libres} plaza(s) libre(s)
                </p>
                {!compacta && (
                  <p style={{ margin: '5px 0 0', color: '#64748b' }}>
                    {propuesta.motivo}
                  </p>
                )}
                <button
                  type="button"
                  disabled={cargando}
                  onClick={() =>
                    aprobarRecuperacionInteligente(registro, propuesta)
                  }
                  style={{ ...botonPrincipal, marginTop: 8 }}
                >
                  Aprobar recuperación
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ ...avisoPendiente, marginTop: 10 }}>
            <strong>Ahora mismo no hay un grupo seguro compatible.</strong>
            <p style={{ margin: '5px 0 0' }}>
              El recomendador volverá a calcularlo automáticamente cuando existan nuevos grupos, cambien los huecos o se actualice el nivel.
            </p>
          </div>
        )}

        {!compacta && registro.estado !== 'Resuelta' && registro.estado !== 'Descartada' && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
            <button
              type="button"
              disabled={cargando}
              onClick={() =>
                actualizarRecuperacionIntensivo(
                  registro,
                  'Descartada',
                  registro.intensivo_destino_id || '',
                  registro.grupo_destino_id || ''
                )
              }
              style={botonSecundario}
            >
              Descartar recuperación
            </button>
          </div>
        )}
      </div>
    );
  }


  return (
        <section>
          <div
            style={{
              background: 'linear-gradient(135deg, #062d3f 0%, #083b4d 58%, #0b5d4f 100%)',
              borderRadius: 18,
              padding: esVistaMovilApp ? 16 : 20,
              marginBottom: 16,
              boxShadow: '0 14px 34px rgba(15,23,42,.14)',
              color: '#fff',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: 16,
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: 220 }}>
                <p style={{ ...etiquetaSuperior, color: '#86efac', margin: 0 }}>
                  INTENSIVOS
                </p>
                <h2
                  style={{
                    margin: '5px 0 4px',
                    color: '#fff',
                    fontSize: esVistaMovilApp ? 24 : 30,
                  }}
                >
                  Gestión de intensivos
                </h2>
                <p
                  style={{
                    margin: 0,
                    color: '#cbd5e1',
                    fontSize: 13,
                    maxWidth: 720,
                  }}
                >
                  Crea el curso, prepara los grupos base y gestiona cada jornada desde Días de entrenamiento.
                </p>
              </div>

              <button
                onClick={() =>
                  setMostrarFormularioIntensivo(!mostrarFormularioIntensivo)
                }
                style={{
                  ...botonPrincipal,
                  background: '#16a34a',
                  borderColor: '#16a34a',
                  color: '#fff',
                }}
              >
                {mostrarFormularioIntensivo
                  ? 'Cerrar formulario'
                  : '+ Crear intensivo'}
              </button>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: esVistaMovilApp
                  ? '1fr'
                  : 'minmax(280px, 320px) minmax(0, 1fr)',
                gap: 10,
                marginTop: 18,
              }}
            >
              <label
                style={{
                  display: 'grid',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 900,
                  color: '#cbd5e1',
                }}
              >
                Mes
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'minmax(0, 1fr)',
                    gap: 7,
                  }}
                >
                  <input
                    type="month"
                    value={mesIntensivos}
                    onChange={(e) => setMesIntensivos(e.target.value)}
                    style={{
                      ...inputCampo,
                      width: '100%',
                      minWidth: 0,
                      fontSize: 15,
                      fontWeight: 800,
                      background: '#fff',
                      color: '#0f172a',
                    }}
                  />
                </div>
              </label>

              <label
                style={{
                  display: 'grid',
                  gap: 6,
                  fontSize: 12,
                  fontWeight: 900,
                  color: '#d9f4ef',
                }}
              >
                Buscar
                <input
                  value={busquedaIntensivos}
                  onChange={(e) => setBusquedaIntensivos(e.target.value)}
                  placeholder="Nombre, temporada, estado o lugar…"
                  style={{
                    ...buscador,
                    margin: 0,
                    width: '100%',
                    background: '#fff',
                    color: '#0f172a',
                  }}
                />
              </label>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: esVistaMovilApp
                  ? 'repeat(2, minmax(0, 1fr))'
                  : 'repeat(5, minmax(0, max-content)) minmax(120px, 1fr)',
                gap: 8,
                marginTop: 12,
                alignItems: 'center',
              }}
            >
              {[
                ['todos', 'Todos'],
                ['activos', 'Abiertos'],
                ['cerrados', 'Cerrados'],
                ['sin_alumnos', 'Sin alumnos'],
                ['proximos', 'Próximos'],
              ].map(([valor, etiqueta]) => (
                <button
                  key={valor}
                  type="button"
                  onClick={() => setFiltroIntensivos(valor as any)}
                  style={{
                    ...botonMenu(filtroIntensivos === valor),
                    width: '100%',
                    minWidth: 0,
                    whiteSpace: 'nowrap',
                    background:
                      filtroIntensivos === valor
                        ? '#fff'
                        : 'rgba(255,255,255,.08)',
                    color:
                      filtroIntensivos === valor ? '#0f172a' : '#e2e8f0',
                    borderColor: 'rgba(255,255,255,.20)',
                  }}
                >
                  {etiqueta}
                </button>
              ))}

              <details
                style={{
                  color: '#dbeafe',
                  fontSize: 12,
                  alignSelf: 'center',
                  justifySelf: esVistaMovilApp ? 'stretch' : 'end',
                  minWidth: 0,
                }}
              >
                <summary style={{ cursor: 'pointer', fontWeight: 900 }}>
                  Ayuda rápida
                </summary>
                <p
                  style={{
                    margin: '8px 0 0',
                    maxWidth: 620,
                    lineHeight: 1.45,
                    color: '#cbd5e1',
                  }}
                >
                  Configuración → Alumnos → Grupos base → Días de entrenamiento → Revisión → Recuperaciones → Evaluación final.
                </p>
              </details>
            </div>
          </div>

          {mostrarFormularioIntensivo && (
            <article style={{ ...tarjeta, border: '2px solid #111', marginBottom: 16 }}>
              <h3 style={{ marginTop: 0 }}>Nuevo intensivo</h3>

              <div style={gridFormulario}>
                <div style={labelCampo}>
                  Temporada
                  <div
                    style={{
                      ...inputCampo,
                      display: 'flex',
                      alignItems: 'center',
                      minHeight: 42,
                      background: '#f8fafc',
                      color: '#0f172a',
                      fontWeight: 800,
                    }}
                  >
                    {temporadaActivaCierre
                      ? `${temporadaActivaCierre} · activa`
                      : 'Temporada activa · automática'}
                  </div>
                  <small style={{ color: '#64748b', fontWeight: 500 }}>
                    Los Intensivos siempre se crean dentro de la temporada activa.
                  </small>
                </div>

                <label style={labelCampo}>
                  Nombre del intensivo
                  <input
                    value={formIntensivo.nombre}
                    onChange={(e) =>
                      setFormIntensivo({ ...formIntensivo, nombre: e.target.value })
                    }
                    placeholder="Intensivo Navidad"
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
              const recuperacionesActivasIntensivo =
                recuperacionesIntensivo.filter(
                  (registro) =>
                    registro.estado !== 'Resuelta' &&
                    registro.estado !== 'Descartada'
                );
              const recuperacionesHistoricasIntensivo =
                recuperacionesIntensivo.filter(
                  (registro) =>
                    registro.estado === 'Resuelta' ||
                    registro.estado === 'Descartada'
                );
              const recuperacionesPendientesIntensivo =
                recuperacionesActivasIntensivo.length;

              const faltasRealesPorDia = new Set<string>();
              alumnosInscritosIntensivo.forEach((alumnoIntensivo) => {
                diasIntensivo.forEach((dia) => {
                  const asistencia = asistenciasDelIntensivoDia(
                    intensivo.intensivo_id,
                    dia.intensivo_dia_id
                  ).find(
                    (registro) =>
                      registro.alumno_id === alumnoIntensivo.alumno_id
                  );

                  if (
                    asistencia &&
                    ['NO_PRESENTADO', 'BAJA_AVISADA'].includes(
                      asistencia.estado || ''
                    ) &&
                    asistencia.falta_genera_recuperacion
                  ) {
                    faltasRealesPorDia.add(
                      `${alumnoIntensivo.alumno_id}-${dia.intensivo_dia_id}`
                    );
                  }
                });
              });

              const recuperacionesRegistradasPorDia = new Set(
                recuperacionesIntensivo
                  .filter((registro) => registro.intensivo_dia_origen_id)
                  .map(
                    (registro) =>
                      `${registro.alumno_id}-${registro.intensivo_dia_origen_id}`
                  )
              );
              const faltasAntiguasSinRecuperacion = Array.from(
                faltasRealesPorDia
              ).filter(
                (clave) => !recuperacionesRegistradasPorDia.has(clave)
              ).length;

              const gestorGruposAbierto =
                gestionarGruposIntensivoId === intensivo.intensivo_id;
              const gestorRevisionAbierto =
                revisionIntensivoId === intensivo.intensivo_id;
              const diaSeleccionadoGrupo =
                diasIntensivo.find(
                  (dia) => dia.intensivo_dia_id === diaGrupoSeleccionadoId
                ) || diasIntensivo[0];
              const gruposDiaSeleccionado = diaSeleccionadoGrupo
                ? gruposNormalesDelDiaIntensivo(diaSeleccionadoGrupo.intensivo_dia_id)
                : [];
              const gruposBaseCursoIntensivo = diasIntensivo[0]
                ? gruposNormalesDelDiaIntensivo(
                    diasIntensivo[0].intensivo_dia_id
                  ).length
                : 0;
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
              const estadoRealIntensivo =
                esCerrado
                  ? '✓ Intensivo finalizado'
                  : resumenFinal.length > 0
                    ? diplomasPendientes === 0
                      ? `✓ Evaluación completa · ${resumenFinal.length}/${resumenFinal.length}`
                      : `${diplomasPendientes} evaluación${diplomasPendientes === 1 ? '' : 'es'} pendiente${diplomasPendientes === 1 ? '' : 's'}`
                    : String(intensivo.estado || 'En preparación');
              const gestorPanelControlAbierto =
                gestionarPanelControlIntensivoId === intensivo.intensivo_id;
              const panelControl = panelControlDelIntensivo(intensivo.intensivo_id);
              const intensivoCursoAbierto = intensivoCursoAbiertoId === intensivo.intensivo_id;
              const enlaceWhatsappIntensivo =
                enlaceWhatsappIntensivoApp(intensivo);

              return (
                <article
                  id={`intensivo-curso-${intensivo.intensivo_id}`}
                  key={intensivo.intensivo_id}
                  style={{
                    ...tarjetaIntensivoCurso,
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    boxSizing: 'border-box',
                    overflow: 'hidden',
                  }}
                >
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
                        <span style={chipResumenCursoIntensivo}><strong>{gruposBaseCursoIntensivo}</strong> grupos base</span>
                        <span
                          style={{
                            ...chipResumenCursoIntensivo,
                            ...(resumenFinal.length > 0 && diplomasPendientes === 0
                              ? { background: '#ecfdf5', borderColor: '#bbf7d0', color: '#166534' }
                              : diplomasPendientes > 0
                                ? { background: '#fff7ed', borderColor: '#fed7aa', color: '#9a3412' }
                                : {}),
                          }}
                        >
                          <strong>{estadoRealIntensivo}</strong>
                        </span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
                      <button
                        type="button"
                        onClick={() =>
                          configurarWhatsappIntensivoApp(intensivo)
                        }
                        style={{
                          ...botonSecundario,
                          borderColor: enlaceWhatsappIntensivo
                            ? '#86efac'
                            : '#fed7aa',
                          background: enlaceWhatsappIntensivo
                            ? '#f0fdf4'
                            : '#fff7ed',
                          color: enlaceWhatsappIntensivo
                            ? '#166534'
                            : '#9a3412',
                        }}
                      >
                        {enlaceWhatsappIntensivo
                          ? 'WhatsApp papis configurado'
                          : 'Configurar WhatsApp papis'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const abrir =
                            intensivoCursoAbiertoId !== intensivo.intensivo_id;
                          cerrarPanelesIntensivo();
                          setIntensivoCursoAbiertoId(
                            abrir ? intensivo.intensivo_id : null
                          );

                          if (abrir) {
                            enfocarElementoApp(
                              `intensivo-opciones-${intensivo.intensivo_id}`,
                              { espera: 100, block: 'start' }
                            );
                          }
                        }}
                        style={intensivoCursoAbierto ? botonSecundario : botonPrincipal}
                      >
                        {intensivoCursoAbierto ? 'Ocultar gestión' : 'Gestionar intensivo'}
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

                  <div
                    style={{
                      display: 'grid',
                      gap: 10,
                      marginTop: 14,
                      width: '100%',
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: esVistaMovilApp
                          ? 'repeat(2, minmax(0, 1fr))'
                          : 'repeat(4, minmax(0, 1fr))',
                        gap: 8,
                      }}
                    >
                      <div style={{ ...miniTarjetaBlanca, padding: 10 }}>
                        <span style={{ color: '#64748b', fontSize: 11, fontWeight: 850 }}>
                          ALUMNOS
                        </span>
                        <div style={{ marginTop: 3, fontSize: 20, fontWeight: 950, color: '#0f172a' }}>
                          {alumnosInscritosIntensivo.length}
                        </div>
                      </div>

                      <div style={{ ...miniTarjetaBlanca, padding: 10 }}>
                        <span style={{ color: '#64748b', fontSize: 11, fontWeight: 850 }}>
                          DÍAS
                        </span>
                        <div style={{ marginTop: 3, fontSize: 20, fontWeight: 950, color: '#0f172a' }}>
                          {diasIntensivo.length}/4
                        </div>
                      </div>

                      <div style={{ ...miniTarjetaBlanca, padding: 10 }}>
                        <span style={{ color: '#64748b', fontSize: 11, fontWeight: 850 }}>
                          GRUPOS
                        </span>
                        <div style={{ marginTop: 3, fontSize: 20, fontWeight: 950, color: '#0f172a' }}>
                          {gruposBaseCursoIntensivo}
                        </div>
                      </div>

                      <div
                        style={{
                          ...miniTarjetaBlanca,
                          padding: 10,
                          border:
                            recuperacionesPendientesIntensivo > 0 || diplomasPendientes > 0
                              ? '1px solid rgba(249,115,22,.35)'
                              : '1px solid rgba(22,163,74,.28)',
                          background:
                            recuperacionesPendientesIntensivo > 0 || diplomasPendientes > 0
                              ? 'rgba(255,247,237,.82)'
                              : 'rgba(240,253,244,.72)',
                        }}
                      >
                        <span style={{ color: '#64748b', fontSize: 11, fontWeight: 850 }}>
                          PENDIENTES
                        </span>
                        <div
                          style={{
                            marginTop: 3,
                            fontSize: 20,
                            fontWeight: 950,
                            color:
                              recuperacionesPendientesIntensivo > 0 || diplomasPendientes > 0
                                ? '#c2410c'
                                : '#15803d',
                          }}
                        >
                          {recuperacionesPendientesIntensivo + diplomasPendientes}
                        </div>
                      </div>
                    </div>

                    <div
                      id={`intensivo-opciones-${intensivo.intensivo_id}`}
                      style={{
                        ...barraPasosIntensivo,
                        scrollMarginTop: 16,
                        display: 'flex',
                        flexWrap: 'wrap',
                        gap: 8,
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        overflow: 'visible',
                        marginTop: 0,
                      }}
                    >
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
                        2 · Alumnos
                      </button>

                      <button
                        onClick={() => abrirPanelIntensivo(intensivo, 'grupos')}
                        style={botonPasoIntensivo(gestorGruposAbierto)}
                      >
                        3 · Grupos
                      </button>

                      <button
                        onClick={() => abrirPanelIntensivo(intensivo, 'revision')}
                        style={botonPasoIntensivo(gestorRevisionAbierto)}
                      >
                        4 · Revisión
                      </button>

                      <button
                        onClick={() => abrirPanelIntensivo(intensivo, 'asistencia')}
                        style={botonPasoIntensivo(gestorAsistenciaAbierto)}
                      >
                        5 · Recuperaciones
                      </button>

                      <button
                        onClick={() => abrirPanelIntensivo(intensivo, 'diplomas')}
                        style={botonPasoIntensivo(gestorDiplomasAbierto)}
                      >
                        6 · Evaluación
                      </button>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        alignItems: 'center',
                      }}
                    >
                      {recuperacionesPendientesIntensivo > 0 ? (
                        <button
                          type="button"
                          onClick={() => abrirPanelIntensivo(intensivo, 'asistencia')}
                          style={{
                            ...botonSecundario,
                            padding: '7px 10px',
                            borderColor: '#fed7aa',
                            background: '#fff7ed',
                            color: '#9a3412',
                          }}
                        >
                          {recuperacionesPendientesIntensivo} recuperación{recuperacionesPendientesIntensivo === 1 ? '' : 'es'} pendiente{recuperacionesPendientesIntensivo === 1 ? '' : 's'}
                        </button>
                      ) : (
                        <span
                          style={{
                            ...agendaBadgeModalidad,
                            background: '#ecfdf5',
                            color: '#166534',
                            borderColor: '#bbf7d0',
                          }}
                        >
                          ✓ Recuperaciones al día
                        </span>
                      )}

                      {resumenFinal.length > 0 && diplomasPendientes > 0 ? (
                        <button
                          type="button"
                          onClick={() => abrirPanelIntensivo(intensivo, 'diplomas')}
                          style={{
                            ...botonSecundario,
                            padding: '7px 10px',
                            borderColor: '#fed7aa',
                            background: '#fff7ed',
                            color: '#9a3412',
                          }}
                        >
                          Evaluación · {Math.max(resumenFinal.length - diplomasPendientes, 0)}/{resumenFinal.length} revisadas
                        </button>
                      ) : resumenFinal.length > 0 ? (
                        <span
                          style={{
                            ...agendaBadgeModalidad,
                            background: '#ecfdf5',
                            color: '#166534',
                            borderColor: '#bbf7d0',
                          }}
                        >
                          ✓ Evaluación {resumenFinal.length}/{resumenFinal.length}
                        </span>
                      ) : null}
                    </div>

                    <details
                      style={{
                        ...ayudaDesplegableCompacta,
                        marginTop: 0,
                        border: '1px solid #e2e8f0',
                        borderRadius: 14,
                        background: '#fff',
                      }}
                    >
                      <summary style={{ fontWeight: 900 }}>
                        Resumen del intensivo · {diasIntensivo.length} día{diasIntensivo.length === 1 ? '' : 's'}
                      </summary>

                      <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                        {diasIntensivo.length === 0 && (
                          <div style={avisoPendiente}>Sin días creados todavía.</div>
                        )}

                        {diasIntensivo.map((dia) => {
                          const gruposDia = gruposNormalesDelDiaIntensivo(
                            dia.intensivo_dia_id
                          );
                          const alumnosEnGruposDia = gruposDia.reduce(
                            (total, grupo) => total + Number(grupo.total_alumnos || 0),
                            0
                          );
                          const recuperacionesExternasDia = Math.max(
                            0,
                            alumnosEnGruposDia - alumnosInscritosIntensivo.length
                          );
                          const propiosColocadosDia = Math.min(
                            alumnosEnGruposDia,
                            alumnosInscritosIntensivo.length
                          );
                          const diaPreparado =
                            gruposDia.length > 0 &&
                            propiosColocadosDia >= alumnosInscritosIntensivo.length;

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
                                display: 'grid',
                                gridTemplateColumns: esVistaMovilApp
                                  ? 'minmax(0,1fr)'
                                  : 'minmax(0,1fr) auto',
                                gap: 8,
                                alignItems: 'center',
                                textAlign: 'left',
                                cursor: 'pointer',
                                border: diaPreparado
                                  ? '1px solid rgba(22,163,74,.28)'
                                  : '1px solid rgba(249,115,22,.32)',
                                background: diaPreparado
                                  ? 'rgba(240,253,244,.68)'
                                  : 'rgba(255,247,237,.76)',
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <strong>
                                  Día {dia.numero_dia} · {formatearFecha(dia.fecha)}
                                </strong>
                                <p style={{ margin: '4px 0 0', color: '#64748b' }}>
                                  {dia.hora_inicio.slice(0, 5)}–{dia.hora_fin.slice(0, 5)} · {gruposDia.length} grupo{gruposDia.length === 1 ? '' : 's'}
                                </p>
                              </div>

                              <div
                                style={{
                                  textAlign: esVistaMovilApp ? 'left' : 'right',
                                  color: diaPreparado ? '#166534' : '#9a3412',
                                  fontSize: 13,
                                  fontWeight: 900,
                                }}
                              >
                                {recuperacionesExternasDia > 0
                                  ? `${alumnosEnGruposDia} en pista · ${alumnosInscritosIntensivo.length} propios + ${recuperacionesExternasDia} recuperación${recuperacionesExternasDia === 1 ? '' : 'es'}`
                                  : `${propiosColocadosDia}/${alumnosInscritosIntensivo.length} inscritos colocados`}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </details>
                  </div>

                  {gestorPanelControlAbierto && (
                    <div
                      id={`intensivo-panel-activo-${intensivo.intensivo_id}`}
                      style={{
                        ...formularioCaja,
                        scrollMarginTop: 16,
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                    >
                      <h4 style={{ marginTop: 0 }}>
                        Mapa operativo por días · {intensivo.intensivo}
                      </h4>

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
                          <strong>{gruposBaseCursoIntensivo}</strong>
                          <p style={{ margin: '6px 0 0' }}>grupos base</p>
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
                                            {formatearAlumnoIntensivoVisible(alumnoGrupo)}
                                          </li>
                                        ))}
                                      </ol>
                                    ) : (
                                      <div style={{ ...avisoNeutral, marginTop: 8 }}>
                                        No hay listado de niños cargado en este grupo.
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
                    <div
                      id={`intensivo-panel-activo-${intensivo.intensivo_id}`}
                      style={{
                        ...formularioCaja,
                        scrollMarginTop: 16,
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                    >
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

                      <div style={{ ...avisoNeutral, marginBottom: 12 }}>
                        Los días se numeran siempre por orden cronológico. Si cambias una fecha, Día 1/2/3/4 se renumera automáticamente y la sesión de Días de entrenamiento conserva sus grupos e histórico.
                      </div>

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
                    <div
                      id={`intensivo-panel-activo-${intensivo.intensivo_id}`}
                      style={{
                        ...formularioCaja,
                        scrollMarginTop: 16,
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                    >
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

                      <div
                        style={{
                          display: 'grid',
                          gap: 10,
                          maxHeight: esVistaMovilApp ? 'none' : 560,
                          overflowY: esVistaMovilApp ? 'visible' : 'auto',
                          overscrollBehavior: 'contain',
                          WebkitOverflowScrolling: 'touch',
                          paddingRight: esVistaMovilApp ? 0 : 4,
                          minWidth: 0,
                        }}
                      >
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
                              name={`intensivo-alumnos-${intensivo.intensivo_id}`}
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
                                      'repeat(auto-fit, minmax(min(100%, 170px), 1fr))',
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
                      <div style={{ marginTop: 14 }}>
                      <details style={{ ...ayudaDesplegableCompacta, marginBottom: 12 }}>
                        <summary>Añadir alumno existente</summary>
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

                  {gestorRevisionAbierto && (
                    <div
                      id={`intensivo-panel-activo-${intensivo.intensivo_id}`}
                      style={{
                        ...formularioCaja,
                        scrollMarginTop: 16,
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 10,
                          flexWrap: 'wrap',
                          alignItems: 'flex-start',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <h4 style={{ margin: 0 }}>
                            4 · Revisión entre sesiones
                          </h4>
                          <p
                            style={{
                              margin: '6px 0 0',
                              color: '#64748b',
                              lineHeight: 1.45,
                            }}
                          >
                            Compara los grupos con los últimos reportes. Si confirmas un cambio, se aplica desde el día seleccionado hasta el final del intensivo; los días anteriores mantienen su histórico.
                          </p>
                        </div>
                      </div>

                      {diasIntensivo.filter((dia) => dia.numero_dia >= 2)
                        .length === 0 ? (
                        <div style={{ ...avisoPendiente, marginTop: 12 }}>
                          Primero crea las 4 fechas del intensivo en
                          “1 · Configuración”.
                        </div>
                      ) : (
                        <>
                          <div
                            style={{
                              ...gridFormulario,
                              marginTop: 12,
                              alignItems: 'end',
                            }}
                          >
                            <label style={{ ...labelCampo, minWidth: 0 }}>
                              Día a preparar
                              <select
                                value={revisionIntensivoDiaId}
                                onChange={(e) => {
                                  setRevisionIntensivoDiaId(e.target.value);
                                  setRevisionIntensivoSugerencias([]);
                                  setRevisionIntensivoAnalizado(false);
                                }}
                                style={{
                                  ...selectCampo,
                                  width: '100%',
                                  minWidth: 0,
                                }}
                              >
                                {diasIntensivo
                                  .slice()
                                  .sort(
                                    (a, b) =>
                                      a.numero_dia - b.numero_dia
                                  )
                                  .filter((dia) => dia.numero_dia >= 2)
                                  .map((dia) => (
                                    <option
                                      key={`revision-${intensivo.intensivo_id}-${dia.intensivo_dia_id}`}
                                      value={dia.intensivo_dia_id}
                                    >
                                      Día {dia.numero_dia} ·{' '}
                                      {formatearFecha(dia.fecha)} ·{' '}
                                      {dia.hora_inicio.slice(0, 5)}–
                                      {dia.hora_fin.slice(0, 5)}
                                    </option>
                                  ))}
                              </select>
                            </label>

                            <button
                              type="button"
                              onClick={() =>
                                void analizarRevisionEntreSesionesIntensivo()
                              }
                              disabled={
                                !revisionIntensivoDiaId ||
                                revisionIntensivoAnalizando
                              }
                              style={botonPrincipal}
                            >
                              {revisionIntensivoAnalizando
                                ? 'Analizando...'
                                : 'Revisar grupos'}
                            </button>
                          </div>

                          {revisionIntensivoSugerencias.length > 0 && (
                            <div
                              style={{
                                display: 'grid',
                                gap: 8,
                                marginTop: 12,
                                maxHeight: esVistaMovilApp ? 'none' : 460,
                                overflowY: esVistaMovilApp ? 'visible' : 'auto',
                                overscrollBehavior: 'contain',
                                WebkitOverflowScrolling: 'touch',
                                paddingRight: esVistaMovilApp ? 0 : 4,
                                minWidth: 0,
                              }}
                            >
                              {revisionIntensivoSugerencias.map((item) => (
                                <div
                                  key={`revision-${intensivo.intensivo_id}-${item.alumno_id}`}
                                  style={{
                                    ...miniTarjetaBlanca,
                                    display: 'grid',
                                    gridTemplateColumns:
                                      'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
                                    gap: 10,
                                    alignItems: 'center',
                                    width: '100%',
                                    maxWidth: '100%',
                                    minWidth: 0,
                                    boxSizing: 'border-box',
                                  }}
                                >
                                  <div
                                    style={{
                                      minWidth: 0,
                                      overflowWrap: 'anywhere',
                                    }}
                                  >
                                    <strong>{item.alumno}</strong>
                                    <p
                                      style={{
                                        margin: '4px 0 0',
                                        color: '#334155',
                                      }}
                                    >
                                      {item.nivel} · {item.grupo_origen} →{' '}
                                      <strong>{item.grupo_destino}</strong>
                                    </p>
                                    <p
                                      style={{
                                        margin: '4px 0 0',
                                        fontSize: 12,
                                        lineHeight: 1.35,
                                        color: '#64748b',
                                      }}
                                    >
                                      {item.motivo}
                                    </p>
                                  </div>

                                  <div
                                    style={{
                                      display: 'flex',
                                      gap: 8,
                                      flexWrap: 'wrap',
                                      justifyContent: 'flex-end',
                                      alignItems: 'center',
                                      minWidth: 0,
                                    }}
                                  >
                                    <span
                                      style={{
                                        ...agendaBadgeModalidad,
                                        background:
                                          item.estado ===
                                          'CAMBIO_RECOMENDADO'
                                            ? '#ecfdf5'
                                            : '#fff7ed',
                                        color:
                                          item.estado ===
                                          'CAMBIO_RECOMENDADO'
                                            ? '#166534'
                                            : '#9a3412',
                                        borderColor:
                                          item.estado ===
                                          'CAMBIO_RECOMENDADO'
                                            ? '#bbf7d0'
                                            : '#fed7aa',
                                      }}
                                    >
                                      {item.estado ===
                                      'CAMBIO_RECOMENDADO'
                                        ? 'Cambio recomendado'
                                        : 'Revisar'}
                                    </span>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        void prepararCambioRevisionIntensivo(
                                          item
                                        )
                                      }
                                      style={botonSecundario}
                                    >
                                      Aplicar cambio
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {revisionIntensivoAnalizado &&
                            revisionIntensivoSugerencias.length === 0 && (
                              <div
                                style={{
                                  ...avisoCompleto,
                                  marginTop: 12,
                                }}
                              >
                                No hay ningún cambio suficientemente claro
                                como para recomendarlo. Mantendría los grupos
                                como están.
                              </div>
                            )}
                        </>
                      )}
                    </div>
                  )}

                  {gestorAsistenciaAbierto && (
                    <div
                      id={`intensivo-panel-activo-${intensivo.intensivo_id}`}
                      style={{
                        ...formularioCaja,
                        scrollMarginTop: 16,
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>5 · Faltas / recuperaciones</h4>
                        <details style={ayudaDesplegableCompacta}>
                          <summary>Ayuda rápida</summary>
                          <div style={{ marginTop: 8, color: '#475569' }}>
                            La asistencia se marca una sola vez en Vista entrenador / Días de entrenamiento. Si coordinación marca “No viene” o el entrenador marca “Ausente” el mismo día, la falta del Intensivo genera recuperación automáticamente. Aquí solo consultas y gestionas esas recuperaciones.
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
                            const presentes = registrosAlumno.filter((item) => ['PRESENTE', 'LLEGA_TARDE'].includes(item.asistencia?.estado || '')).length;
                            const pendientes = Math.max(0, diasIntensivo.length - presentes - faltas);
                            const nivelUtil = resumenAlumno?.nivel_resumen || alumnoIntensivo.nivel_resumen || 'SIN NIVEL';
                            const pistaUtil = resumenAlumno?.pista_resumen || 'Pendiente';
                            return (
                              <details
                                name={`intensivo-faltas-${intensivo.intensivo_id}`}
                                key={`faltas-${alumnoIntensivo.intensivo_alumno_id}`}
                                style={{
                                  border: faltas > 0
                                    ? '1px solid rgba(249,115,22,.45)'
                                    : pendientes > 0
                                    ? '1px solid rgba(100,116,139,.30)'
                                    : '1px solid rgba(22,163,74,.24)',
                                  background: faltas > 0
                                    ? 'rgba(255,247,237,.9)'
                                    : pendientes > 0
                                    ? 'rgba(248,250,252,.92)'
                                    : 'rgba(240,253,244,.72)',
                                  borderRadius: 14,
                                  overflow: 'hidden',
                                  minWidth: 0,
                                }}
                              >
                                <summary
                                  style={{
                                    cursor: 'pointer',
                                    listStyle: 'none',
                                    padding: '11px 12px',
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: 10,
                                    flexWrap: 'wrap',
                                    alignItems: 'center',
                                  }}
                                >
                                  <div style={{ minWidth: 0 }}>
                                    <strong>{alumnoIntensivo.alumno}</strong>
                                    <p
                                      style={{
                                        margin: '4px 0 0',
                                        color: '#475569',
                                        overflowWrap: 'anywhere',
                                      }}
                                    >
                                      {nivelUtil} · {presentes}/{diasIntensivo.length} presentes
                                      {faltas > 0 ? ` · ${faltas} falta${faltas === 1 ? '' : 's'}` : ''}
                                      {pendientes > 0 ? ` · ${pendientes} pendiente${pendientes === 1 ? '' : 's'}` : ''}
                                    </p>
                                  </div>
                                  {faltas > 0 && (
                                    <span style={agendaBadgeModalidad}>
                                      Recuperación
                                    </span>
                                  )}
                                </summary>

                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: esVistaMovilApp
                                      ? 'minmax(0, 1fr)'
                                      : 'repeat(auto-fit, minmax(min(100%, 155px), 1fr))',
                                    gap: 8,
                                    padding: '0 12px 12px',
                                    minWidth: 0,
                                  }}
                                >
                                  {registrosAlumno.map(({ dia, asistencia }) => {
                                    const estadoAsistencia = asistencia?.estado || 'SIN_CONFIRMAR';
                                    const ausente = estadoAsistencia === 'NO_PRESENTADO' || estadoAsistencia === 'BAJA_AVISADA';
                                    const presente = ['PRESENTE', 'LLEGA_TARDE'].includes(estadoAsistencia);
                                    return (
                                      <div key={`${alumnoIntensivo.alumno_id}-${dia.intensivo_dia_id}`} style={{ ...miniTarjetaBlanca, padding: 10 }}>
                                        <strong>Día {dia.numero_dia}</strong>
                                        <p style={{ margin: '4px 0', color: '#475569' }}>{formatearFecha(dia.fecha)}</p>
                                        <p
                                          style={{
                                            margin: 0,
                                            fontWeight: 800,
                                            color: ausente
                                              ? '#c2410c'
                                              : presente
                                              ? '#15803d'
                                              : '#64748b',
                                          }}
                                        >
                                          {ausente
                                            ? 'Faltó'
                                            : presente
                                            ? 'Asistió'
                                            : 'Pendiente'}
                                        </p>
                                      </div>
                                    );
                                  })}
                                </div>
                              </details>
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
                            if (
                              estado === 'NO_PRESENTADO' ||
                              estado === 'BAJA_AVISADA'
                            ) {
                              const tieneRecuperacionRegistrada =
                                recuperacionesIntensivo.some(
                                  (recuperacion) =>
                                    recuperacion.alumno_id === alumnoIntensivo.alumno_id &&
                                    recuperacion.intensivo_dia_origen_id === dia.intensivo_dia_id
                                );

                              // La falta cruda solo actúa como fallback si nunca
                              // existió una recuperación. Resuelta/Descartada
                              // debe quedarse únicamente en histórico.
                              if (!tieneRecuperacionRegistrada) {
                                faltasMarcadas.push({
                                  key: `${alumnoIntensivo.alumno_id}-${dia.intensivo_dia_id}`,
                                  alumno: alumnoIntensivo.alumno,
                                  dia,
                                  nivel:
                                    resumenAlumno?.nivel_resumen ||
                                    alumnoIntensivo.nivel_resumen ||
                                    'SIN NIVEL',
                                  pista:
                                    resumenAlumno?.pista_resumen ||
                                    'Pendiente',
                                });
                              }
                            }
                          });
                        });

                        return recuperacionesActivasIntensivo.length > 0 ||
                          faltasMarcadas.length > 0 ? (
                          <details
                            name={`intensivo-recuperaciones-${intensivo.intensivo_id}`}
                            style={{ ...ayudaDesplegableCompacta, marginTop: 14 }}
                          >
                            <summary>
                              Recuperaciones activas (
                              {recuperacionesActivasIntensivo.length +
                                faltasMarcadas.length}
                              )
                            </summary>
                            <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>

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

                              {recuperacionesActivasIntensivo.map((registro) =>
                                tarjetaRecuperacionInteligente(registro, true)
                              )}
                            </div>
                          </details>
                        ) : null;
                      })()}

                    </div>
                  )}

                  {gestorGruposAbierto && (
                    <div
                      id={`intensivo-panel-activo-${intensivo.intensivo_id}`}
                      style={{
                        ...formularioCaja,
                        scrollMarginTop: 16,
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                    >
                      <h4 style={{ marginTop: 0 }}>
                        Preparar grupos por día · {intensivo.intensivo}
                      </h4>
                      <p style={{ margin: '-4px 0 12px', color: '#64748b', lineHeight: 1.45 }}>
                        Si el día todavía no tiene grupos, aquí se genera y ajusta la propuesta inicial.
                        En cuanto los grupos existen, la gestión real del día se hace en Días de entrenamiento: alumnos, ausencias, entrenadores, punto y publicación. El Trabajo diario y las Observaciones se generan automáticamente al abrir cada jornada y se recalculan si cambia la composición.
                      </p>

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
                              gridTemplateColumns: esVistaMovilApp
                                ? 'minmax(0, 1fr)'
                                : 'repeat(auto-fit, minmax(min(100%, 220px), 1fr))',
                              gap: 8,
                              width: '100%',
                              minWidth: 0,
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
                                  onClick={async () => {
                                    setDiaGrupoSeleccionadoId(
                                      dia.intensivo_dia_id
                                    );

                                    const gruposDelDia =
                                      gruposNormalesDelDiaIntensivo(
                                        dia.intensivo_dia_id
                                      );

                                    if (gruposDelDia.length === 0) {
                                      await generarRecomendacionGruposIntensivo(dia);
                                    } else {
                                      // Una vez creados los grupos, no mantenemos
                                      // dos editores compitiendo. La operativa
                                      // real vive siempre en Días de entrenamiento.
                                      await abrirGestionOperativaIntensivoDia(dia);
                                      return;
                                    }

                                    window.setTimeout(() => {
                                      document
                                        .getElementById(
                                          `intensivo-editor-grupos-${dia.intensivo_dia_id}`
                                        )
                                        ?.scrollIntoView({
                                          behavior: 'smooth',
                                          block: 'start',
                                        });
                                    }, 180);
                                  }}
                                  style={{
                                    ...(seleccionado
                                      ? botonPrincipal
                                      : botonSecundario),
                                    width: '100%',
                                    maxWidth: '100%',
                                    minWidth: 0,
                                    whiteSpace: 'normal',
                                    overflowWrap: 'anywhere',
                                    lineHeight: 1.25,
                                    textAlign: 'left',
                                  }}
                                >
                                  Día {dia.numero_dia} · {formatearFecha(dia.fecha)}
                                  {totalGrupos > 0
                                    ? ` · ${totalGrupos} grupos`
                                    : ' · pendiente'}
                                </button>
                              );
                            })}
                          </div>

                          {resumenReportes.length > 0 && (
                            <details style={{ ...ayudaDesplegableCompacta, marginTop: 14 }}>
                              <summary>
                                Reportes del intensivo ({resumenReportes.length})
                              </summary>
                              <div style={{ marginTop: 10 }}>
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
                          )}

                          <div
                            id="intensivo-recomendador-activo"
                            style={{ ...miniTarjetaBlanca, marginTop: 12 }}
                          >
                            <h4 style={{ marginTop: 0 }}>
                              {gruposDiaSeleccionado.length > 0
                                ? 'Día ya preparado'
                                : 'Recomendador inicial'}
                            </h4>

                            {gruposDiaSeleccionado.length > 0 &&
                              gruposRecomendadosDia.length === 0 &&
                              diaSeleccionadoGrupo && (
                                <div
                                  style={{
                                    display: 'grid',
                                    gap: 10,
                                    padding: 12,
                                    marginBottom: 10,
                                    borderRadius: 12,
                                    border: '1px solid #dbe3ec',
                                    background: '#f8fafc',
                                  }}
                                >
                                  <p style={{ margin: 0, color: '#475569' }}>
                                    Este día ya tiene {gruposDiaSeleccionado.length}{' '}
                                    grupos creados. La operativa real se gestiona
                                    en Días de entrenamiento.
                                  </p>

                                  <div
                                    style={{
                                      display: 'flex',
                                      gap: 8,
                                      flexWrap: 'wrap',
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void abrirGestionOperativaIntensivoDia(
                                          diaSeleccionadoGrupo
                                        )
                                      }
                                      style={botonPrincipal}
                                    >
                                      Abrir en Días de entrenamiento
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        void reiniciarGruposDiaIntensivoDesdeApp(
                                          diaSeleccionadoGrupo
                                        )
                                      }
                                      style={botonPeligro}
                                    >
                                      Rehacer grupos de este día
                                    </button>
                                  </div>

                                  <small style={{ color: '#64748b' }}>
                                    “Rehacer” conserva la fecha y los alumnos del
                                    Intensivo. Por seguridad se bloquea si el día
                                    ya tiene reportes, asistencia real o
                                    recuperaciones.
                                  </small>
                                </div>
                              )}

                            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                              {diasIntensivo.every(
                                (dia) =>
                                  gruposNormalesDelDiaIntensivo(
                                    dia.intensivo_dia_id
                                  ).length === 0
                              ) &&
                                gruposRecomendadosDia.length === 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      generarPlantillaCuatroDiasIntensivo(
                                        intensivo
                                      )
                                    }
                                    style={botonPrincipal}
                                  >
                                    Generar propuesta inicial
                                  </button>
                                )}

                              {diasIntensivo.every(
                                (dia) =>
                                  gruposNormalesDelDiaIntensivo(
                                    dia.intensivo_dia_id
                                  ).length === 0
                              ) &&
                                gruposRecomendadosDia.length > 0 && (
                                  <button
                                    type="button"
                                    onClick={() =>
                                      generarPlantillaCuatroDiasIntensivo(
                                        intensivo
                                      )
                                    }
                                    style={botonSecundario}
                                  >
                                    Regenerar recomendación
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
                                    Confirmar grupos para los 4 días
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
                                  Cancelar edición de este día
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
                              <div
                                id={`intensivo-editor-grupos-${diaSeleccionadoGrupo?.intensivo_dia_id || 'sin-dia'}`}
                                style={{
                                  display: 'grid',
                                  gap: 10,
                                  marginTop: 12,
                                  scrollMarginTop: 16,
                                }}
                              >
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

                                              <label
                                                style={{
                                                  ...labelCampo,
                                                  minWidth: 0,
                                                  width: '100%',
                                                  maxWidth: '100%',
                                                }}
                                              >
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
                                                  style={{
                                                    ...selectCampo,
                                                    width: '100%',
                                                    minWidth: 0,
                                                    maxWidth: '100%',
                                                    boxSizing: 'border-box',
                                                  }}
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
                        </>
                      )}
                    </div>
                  )}

                  {gestorDiplomasAbierto && (
                    <div
                      id={`intensivo-panel-activo-${intensivo.intensivo_id}`}
                      style={{
                        ...formularioCaja,
                        scrollMarginTop: 16,
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                    >
                      <h4 style={{ marginTop: 0 }}>
                        Evaluación final · {intensivo.intensivo}
                      </h4>

                      <p style={{ marginTop: 0, color: '#475569' }}>
                        Revisión por niño desde el resumen de los 4 días. La app da más peso al último reporte, pero tú confirmas el nivel final. Cuando todos estén Revisados aparecerá “Finalizar intensivo”; cerrar el curso no elimina recuperaciones pendientes.
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

                        {esCerrado ? (
                          <button
                            type="button"
                            onClick={() =>
                              cambiarEstadoIntensivoCurso(intensivo, 'Abierto')
                            }
                            style={botonSecundario}
                          >
                            Reabrir intensivo
                          </button>
                        ) : diplomasPendientes === 0 &&
                          resumenFinal.length > 0 ? (
                          <button
                            type="button"
                            onClick={() =>
                              cambiarEstadoIntensivoCurso(intensivo, 'Cerrado')
                            }
                            style={botonPrincipal}
                          >
                            Finalizar intensivo
                          </button>
                        ) : null}
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
                                  label="Destino comunicado por familia · opcional"
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

                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {gestorMásAbierto && (
                    <div
                      id={`intensivo-panel-activo-${intensivo.intensivo_id}`}
                      style={{
                        ...formularioCaja,
                        scrollMarginTop: 16,
                        width: '100%',
                        maxWidth: '100%',
                        minWidth: 0,
                        boxSizing: 'border-box',
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 10,
                          flexWrap: 'wrap',
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <h4 style={{ margin: 0 }}>
                            Gestión de recuperaciones · {intensivo.intensivo}
                          </h4>
                          <p
                            style={{
                              margin: '5px 0 0',
                              color: '#64748b',
                            }}
                          >
                            Recuperaciones activas e históricas.
                          </p>
                        </div>

                        <button
                          onClick={() => setGestionarMásIntensivoId(null)}
                          style={botonSecundario}
                        >
                          Cerrar
                        </button>
                      </div>

                      {faltasAntiguasSinRecuperacion > 0 && (
                        <div
                          style={{
                            ...avisoPendiente,
                            marginTop: 12,
                          }}
                        >
                          <strong>
                            {faltasAntiguasSinRecuperacion} falta(s) antigua(s)
                            sin ficha de recuperación.
                          </strong>
                          <p style={{ margin: '6px 0 10px' }}>
                            Son faltas registradas antes de activar la creación
                            automática. Puedes sincronizarlas una sola vez.
                          </p>
                          <button
                            type="button"
                            onClick={() =>
                              generarMásDesdeAsistencias(intensivo)
                            }
                            style={botonPrincipal}
                          >
                            Sincronizar faltas antiguas
                          </button>
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          flexWrap: 'wrap',
                          marginTop: 14,
                        }}
                      >
                        <span style={chipResumenCursoIntensivo}>
                          <strong>
                            {recuperacionesActivasIntensivo.length}
                          </strong>{' '}
                          pendientes
                        </span>
                        <span style={chipResumenCursoIntensivo}>
                          <strong>
                            {recuperacionesHistoricasIntensivo.length}
                          </strong>{' '}
                          cerradas
                        </span>
                      </div>

                      {recuperacionesActivasIntensivo.length === 0 &&
                        faltasAntiguasSinRecuperacion === 0 && (
                          <div
                            style={{
                              ...avisoCompleto,
                              marginTop: 12,
                            }}
                          >
                            No hay recuperaciones pendientes en este Intensivo.
                          </div>
                        )}

                      <div
                        style={{
                          display: 'grid',
                          gap: 12,
                          marginTop: 14,
                        }}
                      >
                        {recuperacionesActivasIntensivo.map((registro) =>
                          tarjetaRecuperacionInteligente(registro, false)
                        )}
                      </div>

                      {recuperacionesHistoricasIntensivo.length > 0 && (
                        <details
                          style={{
                            ...ayudaDesplegableCompacta,
                            marginTop: 14,
                          }}
                        >
                          <summary>
                            Histórico de recuperaciones (
                            {recuperacionesHistoricasIntensivo.length})
                          </summary>

                          <div
                            style={{
                              display: 'grid',
                              gap: 8,
                              marginTop: 10,
                            }}
                          >
                            {recuperacionesHistoricasIntensivo.map(
                              (registro) => (
                                <div
                                  key={`hist-${registro.recuperacion_id}`}
                                  style={miniTarjetaBlanca}
                                >
                                  <strong>{registro.alumno}</strong>
                                  <p style={{ margin: '5px 0 0' }}>
                                    {registro.estado} ·{' '}
                                    {registro.intensivo_destino ||
                                      registro.grupo_destino ||
                                      'Sin destino guardado'}
                                  </p>
                                </div>
                              )
                            )}
                          </div>
                        </details>
                      )}
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
