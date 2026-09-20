import React, { useState } from 'react';
import { CampoSelect } from '../../lib/appHelpers';
import { AdaptiveReportFields } from '../../screens/AdaptiveReportFields';
import {
  ayudaAutonomiaAdaptada,
  evaluacionTecnicaInicial,
  opcionesAutonomiaAdaptada,
  reportTechnicalLevelForRender,
} from '../../lib/adaptiveReport';
import type { AlumnoReporteEntrenador } from '../../core/sessions/operationalTypes';

type TrainerViewScreenProps = {
  ctx: Record<string, any>;
};

export function TrainerViewScreen({ ctx }: TrainerViewScreenProps) {
  const [tareaEntrenadorAbierta, setTareaEntrenadorAbierta] = useState<string | null>(null);
  const [diaDisponibilidadAbierto, setDiaDisponibilidadAbierto] = useState('');
  const {
    abrirFormularioReporte,
    abrirGrupoDesdeTareaEntrenador,
    activarPushEntrenadorApp,
    actualizarVistaEntrenadorCompletaApp,
    agendaVacio,
    alumnoReporteActivo,
    alumnosCompletosDelGrupo,
    alumnosDelGrupo,
    ayudaReporteEntrenadorCaja,
    avisoPendiente,
    badgeModalidadMovil,
    bloqueInfoEntrenador,
    bloqueSemanaMovil,
    bloqueTexto,
    botonPrincipal,
    botonSecundario,
    botonesAsistenciaMovil,
    busquedaGrupoEntrenador,
    cabeceraEntrenadorMovil,
    cabeceraSemanaMovil,
    capitalizarPrimera,
    cargando,
    cargarDisponibilidad,
    cerrarFormularioReporte,
    cerrarGrupoEntrenador,
    confirmarGrupoEntrenador,
    contadorGrandeMovil,
    contadorNinosMovil,
    createPortal,
    diaEntrenadorCard,
    diasDisponibilidadVistaEntrenador,
    diasGruposVistaEntrenador,
    disponibilidadEditorVista,
    disponibilidadSemanalVistaEntrenador,
    disponibilidadVistaEntrenador,
    enfocarElementoApp,
    entrenadorHeroApp,
    entrenadorHeroChips,
    error,
    errorReporte,
    esCoordinadorApp,
    esEntrenadorApp,
    esVistaMovilApp,
    esNivelAprendizajeInicialApp,
    estadoSemanaPushEntrenadorApp,
    estiloGrupoPorPistaApp,
    etiquetaSuperior,
    filaAlumnoEntrenadorMovil,
    formatearFecha,
    formatearObservaciones,
    formatearTrabajoDiario,
    formReporte,
    formularioCaja,
    formularioAbierto,
    gestionandoPushEntrenadorApp,
    grupoActivoEntrenador,
    grupoReporteActivo,
    grupoEntrenadorCardMovil,
    grupoEntrenadorTopMovil,
    gruposEntrenador,
    grupoTienePendientesVistaEntrenador,
    gridFormulario,
    gruposSemanalVistaEntrenador,
    gruposSinConfirmarEntrenadorVista,
    guardandoReporte,
    guardarReporteAlumno,
    hoyAgendaClave,
    inputEntrenadorBusqueda,
    irASeccionGrupoEntrenador,
    labelCampo,
    marcarAsistencia,
    mensajePushEntrenadorApp,
    miniBadge,
    miniTarjetaBlanca,
    nombreGrupoVisualApp,
    nivelPartidaReporte,
    opcionesAutonomiaCintaInicialApp,
    opcionesAyudaCuneroInicialApp,
    opcionesCunaFrenadaInicialApp,
    opcionesDinamicaAutonomaInicialApp,
    opcionesGiroInicialApp,
    opcionesNivel,
    opcionesPista,
    opcionesRemontes,
    panelEntrenadorFiltroApp,
    pantalla,
    pendientesEntrenadorVista,
    permisoPushMitico,
    rangoSemanaAgenda,
    referenciaTecnicaReporteApp,
    renderAyudaRapidaPantallaApp,
    repartoEntrenadoresDelGrupo,
    responderDisponibilidadRapida,
    resumenChipsMovil,
    seccionGrupoEntrenador,
    semanaDisponibilidadVistaEntrenadorInicio,
    semanaVistaEntrenadorInicio,
    setFormReporte,
    setBusquedaGrupoEntrenador,
    setGrupoActivoEntrenador,
    setSeccionGrupoEntrenador,
    setTabVistaEntrenador,
    summaryAyudaReporteEntrenador,
    tabVistaEntrenador,
    tarjetaEntrenadorMovil,
    tarjetaMovilVacia,
    textarea,
    totalDisponibilidadPendienteVistaEntrenador,
    totalGruposTrabajoVisibleVistaEntrenador,
    totalGruposVistaEntrenador,
    totalTareasPendientesVistaEntrenador,
    turnoEntrenadorBox,
    vistaEntrenadorShell,
  } = ctx;

  const gestionarDiaDisponibilidad = (
    claveDia: string,
    event: React.SyntheticEvent<HTMLDetailsElement>
  ) => {
    if (event.target !== event.currentTarget) return;

    if (event.currentTarget.open) {
      setDiaDisponibilidadAbierto(claveDia);
      return;
    }

    setDiaDisponibilidadAbierto((actual) =>
      actual === claveDia ? claveDia : actual
    );
  };

  const cerrarAcordeonesHermanos = (
    event: React.SyntheticEvent<HTMLDetailsElement>
  ) => {
    if (event.target !== event.currentTarget) return;

    const actual = event.currentTarget;
    if (!actual.open) return;

    const contenedor = actual.parentElement;
    if (!contenedor) return;

    Array.from(contenedor.children).forEach((elemento) => {
      if (
        elemento instanceof HTMLDetailsElement &&
        elemento !== actual &&
        elemento.open
      ) {
        elemento.open = false;
      }
    });
  };

  const enfocarAcordeonEntrenadorAlAbrir = (
    event: React.MouseEvent<HTMLElement>
  ) => {
    const detalle = event.currentTarget.closest('details');
    if (!(detalle instanceof HTMLDetailsElement) || detalle.open) return;

    enfocarElementoApp(detalle, { block: 'start' });
  };

  function renderFormularioReporteEntrenador(
    alumno: AlumnoReporteEntrenador,
    nivelGrupo: string,
    modo: 'inline' | 'sheet'
  ) {
    const esSheet = modo === 'sheet';
    const nivelEfectivoReporte =
      reportTechnicalLevelForRender(formReporte.nivel) ||
      reportTechnicalLevelForRender(nivelPartidaReporte) ||
      reportTechnicalLevelForRender(alumno.nivel_alumno);
    // La autonomía mide el funcionamiento dentro de la sesión real. En un grupo
    // alto debe usar la escala avanzada aunque el nivel individual de partida sea
    // inferior; la técnica continúa evaluándose con el nivel individual observado.
    const nivelAutonomiaReporte =
      reportTechnicalLevelForRender(nivelGrupo) || nivelEfectivoReporte;
    const esProgresionInicialReporte =
      esNivelAprendizajeInicialApp(nivelEfectivoReporte);
    const reporteDomId =
      `trainer-report-${alumno.entrenador_id}-${alumno.grupo_id}-${alumno.alumno_id}`.replace(
        /[^a-zA-Z0-9_-]/g,
        '-'
      );
    const grupoDelReporte = gruposEntrenador.find(
      (grupo) => grupo.grupo_id === alumno.grupo_id
    );

    return (
      <div
        id={reporteDomId}
        className={`trainer-report-form trainer-report-form--${modo}`}
        style={{
          ...(esSheet ? {} : formularioCaja),
          border: '1px solid #d5e5ff',
          borderRadius: 18,
          padding: esSheet ? 14 : undefined,
          background:
            'linear-gradient(180deg, rgba(249,252,255,0.98) 0%, rgba(241,247,255,0.96) 100%)',
          boxShadow: '0 12px 28px rgba(45, 82, 150, 0.08)',
        }}
      >
        {esSheet ? (
          <div className="trainer-report-sheet-header">
            <div>
              <span className="trainer-report-sheet-kicker">Reporte del alumno</span>
              <h3>{alumno.alumno}</h3>
              <p>
                {alumno.nombre_grupo}
                {nivelEfectivoReporte ? ` · Nivel ${nivelEfectivoReporte}` : ''}
              </p>
            </div>
            <button
              type="button"
              className="trainer-report-sheet-close"
              onClick={cerrarFormularioReporte}
            >
              Cerrar
            </button>
          </div>
        ) : (
          <h4 style={{ marginTop: 0 }}>Reporte de {alumno.alumno}</h4>
        )}

        <details
          style={{
            ...ayudaReporteEntrenadorCaja,
            border: '1px solid #d7e4ff',
            background: '#f7faff',
            borderRadius: 14,
          }}
        >
          <summary style={summaryAyudaReporteEntrenador}>
            Ver referencia técnica del nivel
          </summary>
          <div style={{ padding: '10px 12px 12px' }}>
            {referenciaTecnicaReporteApp(nivelEfectivoReporte || '').map(
              ([titulo, texto], indice) => (
                <div
                  key={titulo}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '112px 1fr',
                    gap: 10,
                    padding: '8px 0',
                    borderTop: indice === 0 ? 'none' : '1px solid #e5edf8',
                  }}
                >
                  <strong style={{ color: '#1e3a8a', fontSize: 12 }}>
                    {titulo}
                  </strong>
                  <span style={{ color: '#475569', fontSize: 12, lineHeight: 1.4 }}>
                    {texto}
                  </span>
                </div>
              )
            )}
          </div>
        </details>

        <div className="trainer-report-grid" style={gridFormulario}>
          <div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                marginBottom: 8,
                padding: '5px 9px',
                borderRadius: 999,
                background: '#eaf2ff',
                border: '1px solid #c9dcff',
                color: '#2453b3',
                fontSize: 12,
                fontWeight: 900,
              }}
            >
              Nivel de partida ·{' '}
              {nivelPartidaReporte ||
                reportTechnicalLevelForRender(alumno.nivel_alumno) ||
                'Sin nivel individual válido'}
            </div>
            <CampoSelect
              label="Nivel observado"
              value={formReporte.nivel}
              opciones={opcionesNivel}
              onChange={(valor) => {
                const nivelSeleccionado = reportTechnicalLevelForRender(valor);
                setFormReporte({
                  ...formReporte,
                  nivel: nivelSeleccionado || '',
                  autonomia: '',
                  evaluacionTecnica: nivelSeleccionado
                    ? evaluacionTecnicaInicial(
                        nivelSeleccionado,
                        formReporte.evaluacionTecnica
                      )
                    : {},
                  mejorasHoy: [],
                  prioridades: [],
                });
              }}
            />
          </div>

        </div>

        {!nivelEfectivoReporte && (
          <div
            role="status"
            style={{
              marginTop: 12,
              padding: '11px 13px',
              border: '1px solid #fde68a',
              borderRadius: 12,
              background: '#fffbeb',
              color: '#92400e',
              fontSize: 13,
              fontWeight: 800,
              lineHeight: 1.4,
            }}
          >
            Selecciona “Nivel observado” para cargar los campos técnicos del alumno.
            El nivel del grupo ({nivelGrupo || 'sin etiqueta'}) no se usará como nivel individual.
          </div>
        )}

        {nivelEfectivoReporte && (
          <AdaptiveReportFields
            modalidad={alumno.modalidad}
            nivel={nivelEfectivoReporte}
            trabajoDiario={grupoDelReporte?.trabajo_diario}
            actitud={formReporte.actitud}
            ritmo={formReporte.ritmoGrupo}
            incidencia={formReporte.incidencia}
            evaluacion={formReporte.evaluacionTecnica}
            mejoras={formReporte.mejorasHoy}
            prioridades={formReporte.prioridades}
            onActitud={(valor) => setFormReporte({ ...formReporte, actitud: valor })}
            onRitmo={(valor) => setFormReporte({ ...formReporte, ritmoGrupo: valor })}
            onIncidencia={(valor) => setFormReporte({ ...formReporte, incidencia: valor })}
            onEvaluacion={(valor) => setFormReporte({ ...formReporte, evaluacionTecnica: valor })}
            onMejoras={(valores) => setFormReporte({ ...formReporte, mejorasHoy: valores })}
            onPrioridades={(valores) => setFormReporte({ ...formReporte, prioridades: valores })}
          />
        )}

        {nivelEfectivoReporte && (
          <div className="trainer-report-grid trainer-report-grid--context" style={gridFormulario}>

          {esProgresionInicialReporte && (
            <CampoSelect
              label="Cuña y frenada"
              value={formReporte.cunaFrenada}
              opciones={['', ...opcionesCunaFrenadaInicialApp]}
              onChange={(valor) =>
                setFormReporte({
                  ...formReporte,
                  cunaFrenada: valor,
                })
              }
            />
          )}

          {esProgresionInicialReporte && (
            <CampoSelect
              label="Giro"
              value={formReporte.giroInicial}
              opciones={['', ...opcionesGiroInicialApp]}
              onChange={(valor) =>
                setFormReporte({
                  ...formReporte,
                  giroInicial: valor,
                })
              }
            />
          )}

          <CampoSelect
            label="Pista"
            value={formReporte.pista}
            opciones={opcionesPista}
            onChange={(valor) =>
              setFormReporte({ ...formReporte, pista: valor })
            }
          />

          <CampoSelect
            label="Autonomía"
            value={formReporte.autonomia}
            opciones={opcionesAutonomiaAdaptada(nivelAutonomiaReporte)}
            onChange={(valor) =>
              setFormReporte({ ...formReporte, autonomia: valor })
            }
            ayuda={ayudaAutonomiaAdaptada(nivelAutonomiaReporte)}
          />

          {esProgresionInicialReporte && (
            <CampoSelect
              label="Autonomía en cinta"
              value={formReporte.autonomiaCinta}
              opciones={['', ...opcionesAutonomiaCintaInicialApp]}
              onChange={(valor) =>
                setFormReporte({
                  ...formReporte,
                  autonomiaCinta: valor,
                })
              }
            />
          )}

          {esProgresionInicialReporte && (
            <CampoSelect
              label="Funcionamiento en pista"
              value={formReporte.dinamicaAutonoma}
              opciones={['', ...opcionesDinamicaAutonomaInicialApp]}
              onChange={(valor) =>
                setFormReporte({
                  ...formReporte,
                  dinamicaAutonoma: valor,
                })
              }
            />
          )}

          <CampoSelect
            label="Remontes"
            value={formReporte.remontes}
            opciones={opcionesRemontes}
            onChange={(valor) =>
              setFormReporte({ ...formReporte, remontes: valor })
            }
          />

          {esProgresionInicialReporte && (
            <CampoSelect
              label="¿Ha usado cuñero?"
              value={formReporte.ayudaCunero}
              opciones={opcionesAyudaCuneroInicialApp}
              onChange={(valor) =>
                setFormReporte({
                  ...formReporte,
                  ayudaCunero: valor,
                })
              }
            />
          )}

          </div>
        )}

        <label style={labelCampo}>
          Observación útil para próximas sesiones (obligatoria)
          <textarea
            value={formReporte.observaciones}
            maxLength={500}
            placeholder="Obligatoria. Añade algo útil que no esté ya arriba: cómo ha respondido, miedo, cansancio, atención, material, comportamiento, reacción a un ejercicio o un detalle importante para la próxima sesión."
            onChange={(e) =>
              setFormReporte({
                ...formReporte,
                observaciones: e.target.value,
              })
            }
            style={textarea}
          />
          <span style={{ fontSize: 11, color: '#64748b', marginTop: 5 }}>
            {formReporte.observaciones.length}/500 · Obligatoria. No repitas nivel, técnica, autonomía o incidencia: añade un detalle que ayude al siguiente entrenador y al informe de la familia.
          </span>
        </label>

        <div
          className="trainer-report-actions"
          style={{
            display: 'flex',
            gap: 8,
            flexWrap: 'wrap',
            marginTop: 12,
          }}
        >
          {errorReporte && (
            <div
              id="trainer-report-feedback"
              role="alert"
              style={{
                flexBasis: '100%',
                padding: '11px 13px',
                border: '1px solid #fecaca',
                borderRadius: 12,
                background: '#fef2f2',
                color: '#991b1b',
                fontSize: 13,
                fontWeight: 800,
                lineHeight: 1.4,
              }}
            >
              No se ha guardado: {errorReporte}
            </div>
          )}
          <button
            type="button"
            onClick={() => guardarReporteAlumno(alumno)}
            disabled={guardandoReporte}
            style={botonPrincipal}
          >
            {guardandoReporte ? 'Guardando…' : 'Guardar reporte'}
          </button>
          <button
            type="button"
            onClick={cerrarFormularioReporte}
            style={botonSecundario}
          >
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      {pantalla === 'entrenador' && (
        <section className="trainer-view" style={vistaEntrenadorShell}>
          <style>{`
            @media (max-width: 600px) {
              .trainer-view {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                overflow-x: hidden !important;
                box-sizing: border-box !important;
              }

              .trainer-hero {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                display: flex !important;
                flex-direction: column !important;
                align-items: stretch !important;
                gap: 12px !important;
                box-sizing: border-box !important;
              }

              .trainer-hero > div:first-child {
                width: 100% !important;
                min-width: 0 !important;
              }

              .trainer-hero h2 {
                font-size: 22px !important;
                line-height: 1.08 !important;
              }

              .trainer-hero-chips {
                width: 100% !important;
                min-width: 0 !important;
                display: grid !important;
                grid-template-columns: minmax(0, 1fr) !important;
                gap: 6px !important;
                margin-top: 10px !important;
              }

              .trainer-hero-chips > span {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                display: block !important;
                white-space: normal !important;
                overflow-wrap: anywhere !important;
                box-sizing: border-box !important;
              }

              .trainer-current-week-chip,
              .trainer-published-week-chip {
                line-height: 1.3 !important;
              }

              .trainer-current-week-chip strong,
              .trainer-published-week-chip strong {
                display: block !important;
                margin-bottom: 2px !important;
              }

              .trainer-hero > button {
                width: 100% !important;
                max-width: 100% !important;
                margin: 0 !important;
                box-sizing: border-box !important;
              }

              .trainer-toolbar {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                box-sizing: border-box !important;
              }

              .trainer-toolbar > input {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                box-sizing: border-box !important;
              }

              .trainer-tabs {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                display: grid !important;
                grid-template-columns: minmax(0, 1fr) !important;
                gap: 8px !important;
                box-sizing: border-box !important;
              }

              .trainer-tab {
                width: 100% !important;
                max-width: 100% !important;
                min-width: 0 !important;
                white-space: normal !important;
                line-height: 1.2 !important;
                box-sizing: border-box !important;
              }

              .trainer-hero button {
                max-width: 100% !important;
                white-space: normal !important;
                line-height: 1.25 !important;
                box-sizing: border-box !important;
              }
            }
          `}</style>

          <div
            className="trainer-hero trainer-hero--modern"
            style={{
              ...entrenadorHeroApp,
              display: 'grid',
              gridTemplateColumns: esVistaMovilApp
                ? 'minmax(0, 1fr)'
                : 'minmax(0, 1fr) auto',
              alignItems: esVistaMovilApp ? 'stretch' : 'end',
              gap: esVistaMovilApp ? 16 : 22,
              minHeight: esVistaMovilApp ? 245 : 220,
              padding: esVistaMovilApp ? '22px 20px' : '28px 30px',
              borderRadius: 24,
              border: '1px solid rgba(255,255,255,.12)',
              backgroundImage: esVistaMovilApp
                ? `linear-gradient(180deg, rgba(4,39,55,.42) 0%, rgba(4,39,55,.70) 46%, rgba(4,39,55,.96) 100%), url('/mitico-entrenador-esqui-v2.jpg')`
                : `linear-gradient(90deg, rgba(4,39,55,.90) 0%, rgba(5,50,65,.77) 43%, rgba(6,68,62,.30) 70%, rgba(6,68,62,.08) 100%), url('/mitico-entrenador-esqui-v2.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: esVistaMovilApp ? '62% center' : 'center 46%',
              backgroundRepeat: 'no-repeat',
              color: '#ffffff',
              boxShadow: '0 18px 42px rgba(15,23,42,.16)',
            }}
          >
            <div style={{ minWidth: 0 }}>
              <p
                style={{
                  ...etiquetaSuperior,
                  margin: 0,
                  color: '#86efac',
                }}
              >
                VISTA ENTRENADOR
              </p>
              <h2
                style={{
                  margin: '5px 0 4px',
                  color: '#ffffff',
                  fontSize: esVistaMovilApp ? 24 : 30,
                  lineHeight: 1.08,
                }}
              >
                Mi semana de trabajo
              </h2>
              <p
                style={{
                  margin: 0,
                  maxWidth: 720,
                  color: '#cbd5e1',
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                Consulta tu disponibilidad, grupos publicados, asistencia y reportes pendientes desde una sola pantalla.
              </p>
              {renderAyudaRapidaPantallaApp()}
              <div
                className="trainer-hero-chips"
                style={{
                  ...entrenadorHeroChips,
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 7,
                  marginTop: 12,
                }}
              >
                <span
                  className="trainer-current-week-chip"
                  style={{
                    padding: '7px 10px',
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,.16)',
                    background: 'rgba(255,255,255,.08)',
                    color: '#e2e8f0',
                  }}
                >
                  <strong style={{ color: '#86efac' }}>Semana</strong>{' '}
                  {semanaVistaEntrenadorInicio
                    ? rangoSemanaAgenda(semanaVistaEntrenadorInicio)
                    : '-'}
                </span>

                <span
                  style={{
                    padding: '7px 10px',
                    borderRadius: 999,
                    border: '1px solid rgba(255,255,255,.16)',
                    background: 'rgba(255,255,255,.08)',
                    color: '#e2e8f0',
                  }}
                >
                  {totalGruposTrabajoVisibleVistaEntrenador} grupos
                </span>

                {totalTareasPendientesVistaEntrenador > 0 && (
                  <span
                    data-trainer-pending-summary="true"
                    style={{
                      padding: '7px 10px',
                      borderRadius: 999,
                      border: '1px solid rgba(251,146,60,.34)',
                      background: 'rgba(249,115,22,.16)',
                      color: '#ffedd5',
                      fontWeight: 900,
                    }}
                  >
                    {totalTareasPendientesVistaEntrenador} tareas pendientes
                  </span>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={() => void actualizarVistaEntrenadorCompletaApp()}
              disabled={cargando}
              style={{
                ...botonPrincipal,
                position: 'relative',
                zIndex: 1,
                width: esVistaMovilApp ? '100%' : 'auto',
                minHeight: 42,
                padding: '9px 13px',
                borderRadius: 13,
                borderColor: '#16a34a',
                background: '#16a34a',
                color: '#ffffff',
                boxShadow: '0 8px 18px rgba(22,163,74,.22)',
              }}
            >
              {cargando ? 'Actualizando...' : 'Actualizar vista'}
            </button>
          </div>

          {esEntrenadorApp && (
            <article
              className="trainer-week-status-alert"
              style={(() => {
                const estado = estadoSemanaPushEntrenadorApp;
                const gruposPublicados = Number(
                  estado?.total_grupos_publicados ?? totalGruposVistaEntrenador
                );
                const cerrada = Boolean(estado?.organizacion_cerrada);

                if (cerrada && gruposPublicados > 0) {
                  return {
                    padding: esVistaMovilApp ? 14 : 16,
                    borderRadius: 16,
                    border: '1px solid #86efac',
                    background: 'linear-gradient(135deg, #ecfdf5, #f0fdf4)',
                    color: '#166534',
                    boxShadow: '0 8px 22px rgba(22,163,74,.08)',
                  };
                }
                if (cerrada) {
                  return {
                    padding: esVistaMovilApp ? 14 : 16,
                    borderRadius: 16,
                    border: '1px solid #cbd5e1',
                    background: 'linear-gradient(135deg, #f8fafc, #ffffff)',
                    color: '#334155',
                  };
                }
                if (gruposPublicados > 0) {
                  return {
                    padding: esVistaMovilApp ? 14 : 16,
                    borderRadius: 16,
                    border: '1px solid #99f6e4',
                    background: 'linear-gradient(135deg, #f0fdfa, #ecfeff)',
                    color: '#115e59',
                  };
                }
                return {
                  padding: esVistaMovilApp ? 14 : 16,
                  borderRadius: 16,
                  border: '1px solid #fde68a',
                  background: 'linear-gradient(135deg, #fffbeb, #ffffff)',
                  color: '#92400e',
                };
              })()}
            >
              {(() => {
                const estado = estadoSemanaPushEntrenadorApp;
                const gruposPublicados = Number(
                  estado?.total_grupos_publicados ?? totalGruposVistaEntrenador
                );
                const cerrada = Boolean(estado?.organizacion_cerrada);
                const disponibilidadPublicada = Boolean(
                  estado?.disponibilidad_publicada ||
                    disponibilidadEditorVista?.estado === 'publicado'
                );
                const pendientes = Number(
                  estado?.disponibilidad_pendientes ??
                    totalDisponibilidadPendienteVistaEntrenador
                );

                let titulo = 'Organización semanal en preparación';
                let detalle = disponibilidadPublicada
                  ? pendientes > 0
                    ? `La disponibilidad está abierta. Te quedan ${pendientes} respuesta(s) por completar.`
                    : 'Disponibilidad recibida. Te avisaremos cuando haya grupos publicados para ti.'
                  : 'La disponibilidad de esta semana todavía no está publicada.';

                if (gruposPublicados > 0 && !cerrada) {
                  titulo = 'Ya hay grupos publicados para ti';
                  detalle = `Tienes ${gruposPublicados} ${
                    gruposPublicados === 1 ? 'grupo publicado' : 'grupos publicados'
                  }. Revisa tus asignaciones; coordinación todavía puede estar terminando la semana.`;
                }
                if (cerrada && gruposPublicados > 0) {
                  titulo = 'Tus grupos de esta semana ya están preparados';
                  detalle = `Tienes ${gruposPublicados} ${
                    gruposPublicados === 1 ? 'grupo asignado' : 'grupos asignados'
                  }. Revísalos y confirma tus asignaciones.`;
                }
                if (cerrada && gruposPublicados === 0) {
                  titulo = 'Organización semanal terminada';
                  detalle =
                    'Esta semana no tienes grupos asignados. Gracias por tu disponibilidad; no necesitas estar pendiente.';
                }

                const pushActivo = Boolean(estado?.push_activo);
                const permiso = permisoPushMitico();
                const necesitaPermisoPush =
                  !pushActivo && permiso === 'default';

                return (
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: esVistaMovilApp
                        ? 'minmax(0, 1fr)'
                        : 'minmax(0, 1fr) auto',
                      gap: 12,
                      alignItems: 'center',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <strong
                        style={{
                          display: 'block',
                          fontSize: esVistaMovilApp ? 15 : 16,
                          lineHeight: 1.25,
                        }}
                      >
                        {titulo}
                      </strong>
                      <p
                        style={{
                          margin: '4px 0 0',
                          color: 'inherit',
                          opacity: 0.88,
                          fontSize: 13,
                          lineHeight: 1.4,
                        }}
                      >
                        {detalle}
                      </p>
                      {mensajePushEntrenadorApp && (
                        <small style={{ display: 'block', marginTop: 7, fontWeight: 800 }}>
                          {mensajePushEntrenadorApp}
                        </small>
                      )}
                    </div>

                    {necesitaPermisoPush && (
                      <div
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          borderRadius: 12,
                          background: '#fff7ed',
                          border: '1px solid #fdba74',
                          color: '#9a3412',
                          fontSize: 12,
                          lineHeight: 1.4,
                          fontWeight: 800,
                        }}
                      >
                        <strong style={{ display: 'block', marginBottom: 3 }}>
                          🔔 Activa los avisos de Mítico Baby
                        </strong>
                        Solo tendrás que aceptarlos una vez en este dispositivo.
                        Después recibirás automáticamente los avisos de disponibilidad
                        y grupos publicados.
                      </div>
                    )}

                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        justifyContent: esVistaMovilApp ? 'stretch' : 'flex-end',
                      }}
                    >
                      {gruposPublicados > 0 && (
                        <button
                          type="button"
                          onClick={() => setTabVistaEntrenador('grupos')}
                          style={{
                            ...botonPrincipal,
                            minHeight: 40,
                            width: esVistaMovilApp ? '100%' : 'auto',
                            padding: '8px 12px',
                            borderRadius: 12,
                            background: '#0f766e',
                            borderColor: '#0f766e',
                          }}
                        >
                          Ver mis grupos
                        </button>
                      )}

                      {!pushActivo && permiso !== 'denied' && (
                        <button
                          type="button"
                          onClick={() =>
                            void activarPushEntrenadorApp(semanaVistaEntrenadorInicio)
                          }
                          disabled={gestionandoPushEntrenadorApp}
                          style={{
                            ...botonPrincipal,
                            minHeight: 48,
                            width: esVistaMovilApp ? '100%' : 'auto',
                            padding: '10px 14px',
                            borderRadius: 13,
                            background: '#f59e0b',
                            borderColor: '#f59e0b',
                            color: '#172033',
                            fontWeight: 950,
                            boxShadow: '0 7px 18px rgba(245,158,11,.24)',
                          }}
                        >
                          {gestionandoPushEntrenadorApp
                            ? 'Activando notificaciones...'
                            : permiso === 'granted'
                              ? 'Conectando avisos automáticamente...'
                              : '🔔 Activar notificaciones'}
                        </button>
                      )}

                      {pushActivo && (
                        <span
                          style={{
                            display: 'inline-flex',
                            minHeight: 40,
                            alignItems: 'center',
                            padding: '8px 11px',
                            borderRadius: 12,
                            background: 'rgba(255,255,255,.72)',
                            border: '1px solid rgba(15,23,42,.10)',
                            color: '#166534',
                            fontSize: 12,
                            fontWeight: 900,
                          }}
                        >
                          Avisos activados ✓
                        </span>
                      )}

                      {permiso === 'denied' && !pushActivo && (
                        <span
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            padding: '8px 11px',
                            borderRadius: 12,
                            background: '#fff1f2',
                            border: '1px solid #fecdd3',
                            color: '#be123c',
                            fontSize: 12,
                            fontWeight: 850,
                          }}
                        >
                          Avisos bloqueados en este dispositivo
                        </span>
                      )}
                    </div>
                  </div>
                );
              })()}
            </article>
          )}



          <article className="trainer-toolbar" style={panelEntrenadorFiltroApp}>
            {esCoordinadorApp && (
              <input
                value={busquedaGrupoEntrenador}
                onChange={(e) => setBusquedaGrupoEntrenador(e.target.value)}
                placeholder="Buscar entrenador..."
                style={inputEntrenadorBusqueda}
              />
            )}

            <div
              className="trainer-tabs trainer-tabs--modern"
              style={{
                display: 'grid',
                gridTemplateColumns: esVistaMovilApp
                  ? 'minmax(0, 1fr)'
                  : 'repeat(2, minmax(0, 1fr))',
                gap: 7,
                width: '100%',
                padding: 5,
                border: '1px solid #dbe3ec',
                borderRadius: 15,
                background: '#f1f5f9',
              }}
            >
              <button
                type="button"
                className="trainer-section-tab trainer-section-tab--availability"
                aria-pressed={tabVistaEntrenador === 'disponibilidad'}
                onClick={() => {
                  setTabVistaEntrenador('disponibilidad');
                  if (esEntrenadorApp) void cargarDisponibilidad();
                }}
                style={{
                  minHeight: 46,
                  padding: '10px 13px',
                  borderRadius: 11,
                  border:
                    tabVistaEntrenador === 'disponibilidad'
                      ? '1px solid #0f766e'
                      : '1px solid transparent',
                  background:
                    tabVistaEntrenador === 'disponibilidad'
                      ? 'linear-gradient(135deg, #0f766e 0%, #0b5d55 100%)'
                      : 'transparent',
                  color:
                    tabVistaEntrenador === 'disponibilidad'
                      ? '#ffffff'
                      : '#475569',
                  fontSize: 13,
                  fontWeight: 900,
                  textAlign: 'center',
                  boxShadow:
                    tabVistaEntrenador === 'disponibilidad'
                      ? '0 7px 16px rgba(15,118,110,.20)'
                      : 'none',
                  cursor: 'pointer',
                  transition:
                    'background .15s ease, color .15s ease, box-shadow .15s ease, border-color .15s ease',
                }}
              >
                Disponibilidad
              </button>
              <button
                type="button"
                className="trainer-section-tab trainer-section-tab--groups"
                aria-pressed={tabVistaEntrenador === 'grupos'}
                onClick={() => setTabVistaEntrenador('grupos')}
                style={{
                  minHeight: 46,
                  padding: '10px 13px',
                  borderRadius: 11,
                  border:
                    tabVistaEntrenador === 'grupos'
                      ? '1px solid #0f766e'
                      : '1px solid transparent',
                  background:
                    tabVistaEntrenador === 'grupos'
                      ? 'linear-gradient(135deg, #0f766e 0%, #0b5d55 100%)'
                      : 'transparent',
                  color:
                    tabVistaEntrenador === 'grupos'
                      ? '#ffffff'
                      : '#475569',
                  fontSize: 13,
                  fontWeight: 900,
                  textAlign: 'center',
                  boxShadow:
                    tabVistaEntrenador === 'grupos'
                      ? '0 7px 16px rgba(15,118,110,.20)'
                      : 'none',
                  cursor: 'pointer',
                  transition:
                    'background .15s ease, color .15s ease, box-shadow .15s ease, border-color .15s ease',
                }}
              >
                Grupos y reportes
              </button>
            </div>
          </article>

          {cargando && <p>Cargando vista entrenador...</p>}

          {!cargando &&
            tabVistaEntrenador === 'disponibilidad' && (
              <section style={{ display: 'grid', gap: 12 }}>
                <section
                  className="trainer-availability-reminder"
                  style={{
                    padding: '11px 13px',
                    borderRadius: 14,
                    border: '1px solid #bbf7d0',
                    background: '#f0fdf4',
                    color: '#166534',
                  }}
                >
                  <strong style={{ color: '#0f9f4d' }}>Disponibilidad semanal</strong>
                  <p
                    style={{
                      margin: '4px 0 0',
                      color: '#475569',
                      fontSize: 13,
                      lineHeight: 1.4,
                    }}
                  >
                    {semanaDisponibilidadVistaEntrenadorInicio
                      ? `Semana solicitada: ${rangoSemanaAgenda(
                          semanaDisponibilidadVistaEntrenadorInicio
                        )}. `
                      : ''}
                    Responde antes de las 13:00 del lunes para que coordinación pueda organizar los grupos de la semana.
                  </p>
                </section>

                {disponibilidadSemanalVistaEntrenador.filter((grupo) =>
                  grupo.entrenador
                    .toLowerCase()
                    .includes(busquedaGrupoEntrenador.toLowerCase())
                ).length === 0 && (
                  <div style={agendaVacio}>
                    Todavía no hay disponibilidad publicada para esta semana.
                  </div>
                )}

                {disponibilidadSemanalVistaEntrenador
                  .filter((grupo) =>
                    grupo.entrenador
                      .toLowerCase()
                      .includes(busquedaGrupoEntrenador.toLowerCase())
                  )
                  .map((grupo) => (
                    <article
                      key={`disponibilidad-vista-${grupo.entrenador_id}`}
                      style={tarjetaEntrenadorMovil}
                    >
                      <header style={cabeceraEntrenadorMovil}>
                        <div>
                          <p
                            style={{
                              ...etiquetaSuperior,
                              color: '#0f9f4d',
                            }}
                          >
                            DISPONIBILIDAD
                          </p>
                          <h3 style={{ margin: 0 }}>{grupo.entrenador}</h3>
                        </div>
                        <div style={resumenChipsMovil}>
                          <span>{grupo.disponibles} disponibles</span>
                          <span>{grupo.no_puedo} no pueden</span>
                          <span>{grupo.pendientes} pendientes</span>
                        </div>
                      </header>

                      {grupo.semanas.map((semana) => {
                        const diasPublicados =
                          diasDisponibilidadVistaEntrenador(semana.turnos);

                        return (
                          <section
                            key={`disp-vista-${grupo.entrenador_id}-${semana.inicio}`}
                            className="trainer-week-block"
                            style={bloqueSemanaMovil}
                          >
                            <div style={cabeceraSemanaMovil}>
                              <div>
                                <p style={etiquetaSuperior}>SEMANA PUBLICADA</p>
                                <h4 style={{ margin: 0 }}>
                                  {rangoSemanaAgenda(semana.inicio)}
                                </h4>
                              </div>
                              <span style={miniBadge}>
                                {semana.turnos.length} turnos
                              </span>
                            </div>

                            <div className="trainer-day-grid">
                              {diasPublicados.map((dia, indiceDia) => {
                                const pendientesDia = dia.turnos.filter(
                                  (turno) =>
                                    (turno.respuesta || 'Pendiente') ===
                                    'Pendiente'
                                ).length;
                                const nombreDia = capitalizarPrimera(
                                  new Date(
                                    `${dia.fecha}T00:00:00`
                                  ).toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                  })
                                );
                                const claveDiaDisponibilidad = `${grupo.entrenador_id}-${dia.fecha}`;
                                const abrirDiaPorDefecto =
                                  dia.fecha === hoyAgendaClave ||
                                  diasPublicados.length === 1 ||
                                  (indiceDia === 0 && pendientesDia > 0);
                                const diaEstaAbierto = diaDisponibilidadAbierto
                                  ? diaDisponibilidadAbierto ===
                                    claveDiaDisponibilidad
                                  : abrirDiaPorDefecto;

                                return (
                                  <details
                                    key={`disp-vista-dia-${grupo.entrenador_id}-${dia.fecha}`}
                                    className="trainer-day-accordion"
                                    style={diaEntrenadorCard}
                                    open={diaEstaAbierto}
                                    onToggle={(event) =>
                                      gestionarDiaDisponibilidad(
                                        claveDiaDisponibilidad,
                                        event
                                      )
                                    }
                                  >
                                    <summary
                                      className="trainer-accordion-summary"
                                      onClick={enfocarAcordeonEntrenadorAlAbrir}
                                    >
                                      <div style={{ display: 'grid' }}>
                                        <strong>{nombreDia}</strong>
                                        <span>{formatearFecha(dia.fecha)}</span>
                                      </div>
                                      <div style={resumenChipsMovil}>
                                        <span>{dia.turnos.length} turnos</span>
                                        {pendientesDia > 0 && (
                                          <span>{pendientesDia} pendientes</span>
                                        )}
                                      </div>
                                    </summary>

                                    <div className="trainer-shift-list">
                                      {dia.turnos.map((turno) => {
                                        const respuesta =
                                          turno.respuesta || 'Pendiente';
                                        const disponibilidadConfirmada =
                                          respuesta !== 'Pendiente';

                                        return (
                                          <div
                                            key={`disp-vista-turno-${turno.id}`}
                                            className="trainer-availability-row"
                                            style={miniTarjetaBlanca}
                                          >
                                            <div className="trainer-availability-main">
                                              <strong>
                                                {turno.hora_inicio.slice(0, 5)}–
                                                {turno.hora_fin.slice(0, 5)}
                                              </strong>
                                              {turno.nombre_turno && (
                                                <span>{turno.nombre_turno}</span>
                                              )}
                                            </div>
                                            <div className="trainer-availability-actions">
                                              <button
                                                type="button"
                                                disabled={disponibilidadConfirmada}
                                                aria-pressed={respuesta === 'Disponible'}
                                                className={`trainer-soft-button trainer-soft-button--success ${
                                                  respuesta === 'Disponible'
                                                    ? 'is-active'
                                                    : ''
                                                }`}
                                                onClick={() =>
                                                  responderDisponibilidadRapida(
                                                    turno,
                                                    'Disponible'
                                                  )
                                                }
                                                style={{
                                                  cursor: disponibilidadConfirmada
                                                    ? 'default'
                                                    : 'pointer',
                                                  opacity:
                                                    disponibilidadConfirmada &&
                                                    respuesta !== 'Disponible'
                                                      ? 0.48
                                                      : 1,
                                                }}
                                              >
                                                Disponible
                                              </button>
                                              <button
                                                type="button"
                                                disabled={disponibilidadConfirmada}
                                                aria-pressed={respuesta === 'No puedo'}
                                                className={`trainer-soft-button trainer-soft-button--danger ${
                                                  respuesta === 'No puedo'
                                                    ? 'is-active'
                                                    : ''
                                                }`}
                                                onClick={() =>
                                                  responderDisponibilidadRapida(
                                                    turno,
                                                    'No puedo'
                                                  )
                                                }
                                                style={{
                                                  cursor: disponibilidadConfirmada
                                                    ? 'default'
                                                    : 'pointer',
                                                  opacity:
                                                    disponibilidadConfirmada &&
                                                    respuesta !== 'No puedo'
                                                      ? 0.48
                                                      : 1,
                                                }}
                                              >
                                                No disponible
                                              </button>
                                            </div>

                                            {disponibilidadConfirmada && (
                                              <div
                                                style={{
                                                  gridColumn: '1 / -1',
                                                  marginTop: 7,
                                                  padding: '9px 11px',
                                                  borderRadius: 11,
                                                  border: '1px solid #bbf7d0',
                                                  background: '#f0fdf4',
                                                  color: '#166534',
                                                  fontSize: 12,
                                                  lineHeight: 1.4,
                                                }}
                                              >
                                                <strong>✓ Disponibilidad confirmada</strong>
                                                <span
                                                  style={{
                                                    display: 'block',
                                                    marginTop: 2,
                                                    color: '#475569',
                                                    fontWeight: 700,
                                                  }}
                                                >
                                                  Si necesitas cambiarla, contacta con coordinación.
                                                </span>
                                              </div>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </details>
                                );
                              })}
                            </div>
                          </section>
                        );
                      })}
                    </article>
                  ))}
              </section>
            )}

          {!cargando &&
            ((tabVistaEntrenador === 'disponibilidad' &&
              disponibilidadSemanalVistaEntrenador.length === 0) ||
              (tabVistaEntrenador === 'grupos' &&
                gruposSemanalVistaEntrenador.length === 0)) &&
            !error && (
              <article style={tarjetaMovilVacia}>
                <h3 style={{ marginTop: 0 }}>
                  {tabVistaEntrenador === 'disponibilidad' &&
                  disponibilidadEditorVista?.gestionada &&
                  !disponibilidadEditorVista.existe
                    ? 'Disponibilidad pendiente de publicación'
                    : 'Sin datos en esta pestaña'}
                </h3>
                <p style={{ marginBottom: 0 }}>
                  {tabVistaEntrenador === 'disponibilidad' &&
                  disponibilidadEditorVista?.gestionada &&
                  !disponibilidadEditorVista.existe
                    ? 'Jose está preparando la semana. Los turnos aparecerán aquí únicamente cuando publique la versión definitiva.'
                    : 'La semana está limpia. La disponibilidad y los grupos aparecerán cuando Jose los publique. Las tareas anteriores pendientes seguirán visibles hasta completarlas.'}
                </p>
              </article>
            )}

          {tabVistaEntrenador === 'grupos' &&
            gruposSemanalVistaEntrenador.map((bloqueEntrenador) => (
              <article
                key={bloqueEntrenador.entrenador_id}
                style={tarjetaEntrenadorMovil}
              >
                <header style={cabeceraEntrenadorMovil}>
                  <div>
                    <p style={{ ...etiquetaSuperior, color: '#0f9f4d' }}>ENTRENADOR</p>
                    <h3 style={{ margin: 0 }}>{bloqueEntrenador.entrenador}</h3>
                  </div>
                  <div style={contadorGrandeMovil}>
                    <strong>{bloqueEntrenador.total_grupos}</strong>
                    <span>grupos</span>
                  </div>
                </header>

                {(pendientesEntrenadorVista(
                  bloqueEntrenador.entrenador_id
                ).length > 0 ||
                  gruposSinConfirmarEntrenadorVista(
                    bloqueEntrenador.entrenador_id
                  ).length > 0) && (
                  <section
                    style={{
                      ...avisoPendiente,
                      padding: 12,
                      display: 'grid',
                      gap: 8,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: 10,
                        flexWrap: 'wrap',
                      }}
                    >
                      <div>
                        <strong
                          style={{
                            display: 'block',
                            fontSize: 14,
                            color: '#8a3d08',
                          }}
                        >
                          Tareas por cerrar
                        </strong>
                      </div>

                      <span
                        style={{
                          padding: '4px 8px',
                          borderRadius: 999,
                          background: '#fff7ed',
                          border: '1px solid #fed7aa',
                          color: '#9a4b0d',
                          fontSize: 11,
                          fontWeight: 900,
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {
                          gruposSinConfirmarEntrenadorVista(
                            bloqueEntrenador.entrenador_id
                          ).length +
                          pendientesEntrenadorVista(
                            bloqueEntrenador.entrenador_id
                          ).filter(
                            (reporte) =>
                              reporte.estado_reporte === 'Falta reporte'
                          ).length +
                          pendientesEntrenadorVista(
                            bloqueEntrenador.entrenador_id
                          ).filter(
                            (reporte) =>
                              reporte.estado_reporte ===
                                'Asistencia sin confirmar' ||
                              reporte.estado_asistencia === 'Pendiente'
                          ).length
                        }{' '}
                        pendientes
                      </span>
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gap: 6,
                      }}
                    >
                      {[
                        {
                          paso: '1',
                          titulo: 'Confirmar grupos',
                          detalle: 'Abre los grupos nuevos y confírmalos.',
                          cantidad: gruposSinConfirmarEntrenadorVista(
                            bloqueEntrenador.entrenador_id
                          ).length,
                          fondo: '#eff6ff',
                          borde: '#bfdbfe',
                          texto: '#1d4ed8',
                        },
                        {
                          paso: '2',
                          titulo: 'Pasar asistencia',
                          detalle: 'Marca presente o ausente en cada alumno.',
                          cantidad: pendientesEntrenadorVista(
                            bloqueEntrenador.entrenador_id
                          ).filter(
                            (reporte) =>
                              reporte.estado_reporte ===
                                'Asistencia sin confirmar' ||
                              reporte.estado_asistencia === 'Pendiente'
                          ).length,
                          fondo: '#f0fdf4',
                          borde: '#bbf7d0',
                          texto: '#15803d',
                        },
                        {
                          paso: '3',
                          titulo: 'Completar reportes',
                          detalle: 'Cierra los reportes que falten.',
                          cantidad: pendientesEntrenadorVista(
                            bloqueEntrenador.entrenador_id
                          ).filter(
                            (reporte) =>
                              reporte.estado_reporte === 'Falta reporte'
                          ).length,
                          fondo: '#faf5ff',
                          borde: '#e9d5ff',
                          texto: '#7e22ce',
                        },
                      ]
                        .filter((tarea) => tarea.cantidad > 0)
                        .map((tarea) => {
                          const claveTarea = `${bloqueEntrenador.entrenador_id}-${tarea.paso}`;
                          const abierta =
                            tareaEntrenadorAbierta === claveTarea;

                          const gruposConfirmar =
                            tarea.paso === '1'
                              ? gruposSinConfirmarEntrenadorVista(
                                  bloqueEntrenador.entrenador_id
                                )
                              : [];

                          const asistenciasPendientes =
                            tarea.paso === '2'
                              ? Array.from(
                                  new Map<string, AlumnoReporteEntrenador>(
                                    pendientesEntrenadorVista(
                                      bloqueEntrenador.entrenador_id
                                    )
                                      .filter(
                                        (reporte) =>
                                          reporte.estado_reporte ===
                                            'Asistencia sin confirmar' ||
                                          reporte.estado_asistencia ===
                                            'Pendiente'
                                      )
                                      .map((reporte) => [
                                        reporte.grupo_id,
                                        reporte,
                                      ])
                                  ).values()
                                )
                              : [];

                          const reportesPendientesTarea =
                            tarea.paso === '3'
                              ? pendientesEntrenadorVista(
                                  bloqueEntrenador.entrenador_id
                                ).filter(
                                  (reporte) =>
                                    reporte.estado_reporte === 'Falta reporte'
                                )
                              : [];

                          return (
                            <div
                              key={claveTarea}
                              style={{
                                display: 'grid',
                                gap: 6,
                                minWidth: 0,
                              }}
                            >
                              <button
                                type="button"
                                onClick={() =>
                                  setTareaEntrenadorAbierta((actual) =>
                                    actual === claveTarea ? null : claveTarea
                                  )
                                }
                                aria-expanded={abierta}
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns:
                                    'minmax(0, 1fr) auto',
                                  alignItems: 'center',
                                  gap: 9,
                                  width: '100%',
                                  minWidth: 0,
                                  padding: '8px 9px',
                                  borderRadius: 12,
                                  border: `1px solid ${tarea.borde}`,
                                  background: tarea.fondo,
                                  textAlign: 'left',
                                  cursor: 'pointer',
                                }}
                              >
                                <div style={{ minWidth: 0 }}>
                                  <strong
                                    style={{
                                      display: 'block',
                                      fontSize: 12,
                                      lineHeight: 1.2,
                                      color: '#24324a',
                                    }}
                                  >
                                    {tarea.titulo}
                                  </strong>
                                  <span
                                    style={{
                                      display: 'block',
                                      marginTop: 2,
                                      fontSize: 11,
                                      lineHeight: 1.25,
                                      color: '#667085',
                                    }}
                                  >
                                    {tarea.detalle}
                                  </span>
                                </div>

                                <span
                                  style={{
                                    justifySelf: 'end',
                                    minWidth: 30,
                                    padding: '4px 7px',
                                    borderRadius: 999,
                                    textAlign: 'center',
                                    fontSize: 11,
                                    fontWeight: 900,
                                    whiteSpace: 'nowrap',
                                    color: tarea.texto,
                                    background: '#ffffff',
                                    border: `1px solid ${tarea.borde}`,
                                  }}
                                >
                                  {tarea.cantidad} {abierta ? '▲' : '▼'}
                                </span>
                              </button>

                              {abierta && (
                                <div
                                  style={{
                                    display: 'grid',
                                    gap: 6,
                                    padding: '2px 0 4px',
                                  }}
                                >
                                  {gruposConfirmar.map((grupo) => (
                                    <button
                                      type="button"
                                      key={`confirmar-${grupo.entrenador_id}-${grupo.grupo_id}`}
                                      onClick={() =>
                                        abrirGrupoDesdeTareaEntrenador(
                                          grupo.grupo_id,
                                          grupo.entrenador_id,
                                          'asistencia'
                                        )
                                      }
                                      style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        borderRadius: 10,
                                        border: '1px solid #bfdbfe',
                                        background: '#ffffff',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <strong
                                        style={{
                                          display: 'block',
                                          fontSize: 11,
                                          color: '#1e3a8a',
                                        }}
                                      >
                                        {grupo.nombre_grupo}
                                      </strong>
                                      <span
                                        style={{
                                          display: 'block',
                                          marginTop: 2,
                                          fontSize: 10,
                                          color: '#64748b',
                                        }}
                                      >
                                        {formatearFecha(grupo.fecha)} ·{' '}
                                        {grupo.hora_inicio.slice(0, 5)}–
                                        {grupo.hora_fin.slice(0, 5)}
                                      </span>
                                      <span
                                        style={{
                                          display: 'block',
                                          marginTop: 3,
                                          fontSize: 10,
                                          fontWeight: 900,
                                          color: '#1d4ed8',
                                        }}
                                      >
                                        Abrir y confirmar →
                                      </span>
                                    </button>
                                  ))}

                                  {asistenciasPendientes.map((reporte) => (
                                    <button
                                      type="button"
                                      key={`asistencia-${reporte.entrenador_id}-${reporte.grupo_id}`}
                                      onClick={() =>
                                        abrirGrupoDesdeTareaEntrenador(
                                          reporte.grupo_id,
                                          reporte.entrenador_id,
                                          'asistencia'
                                        )
                                      }
                                      style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        borderRadius: 10,
                                        border: '1px solid #bbf7d0',
                                        background: '#ffffff',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <strong
                                        style={{
                                          display: 'block',
                                          fontSize: 11,
                                          color: '#166534',
                                        }}
                                      >
                                        {reporte.nombre_grupo}
                                      </strong>
                                      <span
                                        style={{
                                          display: 'block',
                                          marginTop: 2,
                                          fontSize: 10,
                                          color: '#64748b',
                                        }}
                                      >
                                        {formatearFecha(reporte.fecha)} ·{' '}
                                        {reporte.hora_inicio.slice(0, 5)}–
                                        {reporte.hora_fin.slice(0, 5)}
                                      </span>
                                      <span
                                        style={{
                                          display: 'block',
                                          marginTop: 3,
                                          fontSize: 10,
                                          fontWeight: 900,
                                          color: '#15803d',
                                        }}
                                      >
                                        Abrir asistencia →
                                      </span>
                                    </button>
                                  ))}

                                  {reportesPendientesTarea.map((reporte) => (
                                    <button
                                      type="button"
                                      key={`reporte-${reporte.entrenador_id}-${reporte.grupo_id}-${reporte.alumno_id}`}
                                      onClick={() =>
                                        abrirGrupoDesdeTareaEntrenador(
                                          reporte.grupo_id,
                                          reporte.entrenador_id,
                                          'asistencia',
                                          reporte
                                        )
                                      }
                                      style={{
                                        width: '100%',
                                        padding: '8px 10px',
                                        borderRadius: 10,
                                        border: '1px solid #e9d5ff',
                                        background: '#ffffff',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <strong
                                        style={{
                                          display: 'block',
                                          fontSize: 11,
                                          color: '#6b21a8',
                                        }}
                                      >
                                        {reporte.alumno}
                                      </strong>
                                      <span
                                        style={{
                                          display: 'block',
                                          marginTop: 2,
                                          fontSize: 10,
                                          color: '#64748b',
                                        }}
                                      >
                                        {reporte.nombre_grupo} ·{' '}
                                        {formatearFecha(reporte.fecha)} ·{' '}
                                        {reporte.hora_inicio.slice(0, 5)}–
                                        {reporte.hora_fin.slice(0, 5)}
                                      </span>
                                      <span
                                        style={{
                                          display: 'block',
                                          marginTop: 3,
                                          fontSize: 10,
                                          fontWeight: 900,
                                          color: '#7e22ce',
                                        }}
                                      >
                                        Abrir reporte →
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}
                    </div>
                  </section>
                )}

                {disponibilidadVistaEntrenador.filter(
                  (turno) =>
                    turno.entrenador_id === bloqueEntrenador.entrenador_id &&
                    turno.aviso_enviado &&
                    turno.respuesta === 'Pendiente'
                ).length > 0 && (
                  <section style={avisoPendiente}>
                    <strong>Disponibilidad pendiente en la app</strong>
                    <p style={{ margin: '6px 0 10px' }}>
                      Rellena estos turnos para que Jose pueda montar la semana.
                    </p>
                    <div style={{ display: 'grid', gap: 8 }}>
                      {disponibilidadVistaEntrenador
                        .filter(
                          (turno) =>
                            turno.entrenador_id ===
                              bloqueEntrenador.entrenador_id &&
                            turno.aviso_enviado &&
                            turno.respuesta === 'Pendiente'
                        )
                        .sort((a, b) =>
                          `${a.fecha} ${a.hora_inicio}`.localeCompare(
                            `${b.fecha} ${b.hora_inicio}`
                          )
                        )
                        .map((turno) => (
                          <div
                            key={`${turno.id}-vista-entrenador`}
                            style={miniTarjetaBlanca}
                          >
                            <strong>
                              {capitalizarPrimera(
                                new Date(
                                  `${turno.fecha}T00:00:00`
                                ).toLocaleDateString('es-ES', {
                                  weekday: 'long',
                                })
                              )}{' '}
                              {formatearFecha(turno.fecha)}
                            </strong>
                            <p style={{ margin: '4px 0 8px' }}>
                              {turno.hora_inicio.slice(0, 5)}–
                              {turno.hora_fin.slice(0, 5)}
                            </p>
                            <div
                              style={{
                                display: 'flex',
                                gap: 6,
                                flexWrap: 'wrap',
                              }}
                            >
                              <button
                                className="trainer-soft-button trainer-soft-button--success"
                                onClick={() =>
                                  responderDisponibilidadRapida(
                                    turno,
                                    'Disponible'
                                  )
                                }
                              >
                                Disponible
                              </button>
                              <button
                                className="trainer-soft-button trainer-soft-button--danger"
                                onClick={() =>
                                  responderDisponibilidadRapida(
                                    turno,
                                    'No puedo'
                                  )
                                }
                              >
                                No disponible
                              </button>
                            </div>
                          </div>
                        ))}
                    </div>
                  </section>
                )}

                {bloqueEntrenador.semanas.map((semana) => {
                  const totalReportesSemana = semana.grupos.reduce(
                    (total, grupo) => {
                      const alumnosGrupo = alumnosDelGrupo(
                        grupo.grupo_id,
                        grupo.entrenador_id
                      );
                      return (
                        total +
                        alumnosGrupo.filter(
                          (a) =>
                            a.estado_reporte === 'Falta reporte' ||
                            a.estado_reporte ===
                              'Asistencia sin confirmar' ||
                            a.estado_asistencia === 'Pendiente'
                        ).length
                      );
                    },
                    0
                  );
                  const esSemanaVigente =
                    semana.inicio === semanaVistaEntrenadorInicio;

                  return (
                    <details
                      key={`${bloqueEntrenador.entrenador_id}-${semana.inicio}`}
                      className={`trainer-week-block ${
                        esSemanaVigente ? 'is-current' : 'is-previous-pending'
                      }`}
                      style={bloqueSemanaMovil}
                      onToggle={cerrarAcordeonesHermanos}
                      open={esSemanaVigente}
                    >
                      <summary
                        className="trainer-week-summary"
                        style={cabeceraSemanaMovil}
                        onClick={enfocarAcordeonEntrenadorAlAbrir}
                      >
                        <div>
                          <p style={etiquetaSuperior}>
                            {esSemanaVigente
                              ? 'SEMANA DE TRABAJO'
                              : 'PENDIENTES DE SEMANAS ANTERIORES'}
                          </p>
                          <h4 style={{ margin: 0 }}>
                            {rangoSemanaAgenda(semana.inicio)}
                          </h4>
                        </div>
                        <div style={resumenChipsMovil}>
                          <span>{semana.grupos.length} grupos</span>
                          <span>{totalReportesSemana} tareas pendientes</span>
                        </div>
                      </summary>

                      <div className="trainer-day-grid trainer-day-grid--groups">
                        {diasGruposVistaEntrenador(semana.grupos).map(
                          (dia, indiceDia) => {
                            const gruposDia = dia.turnos.flatMap(
                              (turno) => turno.grupos
                            );
                            const pendientesDia = gruposDia.filter(
                              (grupo) =>
                                grupoTienePendientesVistaEntrenador(grupo)
                            ).length;
                            const nombreDia = capitalizarPrimera(
                              new Date(
                                `${dia.fecha}T00:00:00`
                              ).toLocaleDateString('es-ES', {
                                weekday: 'long',
                              })
                            );

                            return (
                              <details
                                key={`${bloqueEntrenador.entrenador_id}-${semana.inicio}-${dia.fecha}`}
                                className="trainer-day-accordion"
                                style={diaEntrenadorCard}
                                    onToggle={cerrarAcordeonesHermanos}
                                open={
                                  dia.fecha === hoyAgendaClave ||
                                  (indiceDia === 0 &&
                                    semana.inicio ===
                                      semanaVistaEntrenadorInicio)
                                }
                              >
                                <summary
                                  className="trainer-accordion-summary"
                                  onClick={enfocarAcordeonEntrenadorAlAbrir}
                                >
                                  <div style={{ display: 'grid' }}>
                                    <strong>{nombreDia}</strong>
                                    <span>{formatearFecha(dia.fecha)}</span>
                                  </div>
                                  <div style={resumenChipsMovil}>
                                    <span>{gruposDia.length} grupos</span>
                                    {pendientesDia > 0 && (
                                      <span>{pendientesDia} pendientes</span>
                                    )}
                                  </div>
                                </summary>

                                <div className="trainer-turn-grid">
                                  {dia.turnos.map((turno, indiceTurno) => {
                                    const gruposTurno = turno.grupos;
                                    const pendientesTurno = gruposTurno.filter(
                                      (grupo) =>
                                        grupoTienePendientesVistaEntrenador(
                                          grupo
                                        )
                                    ).length;

                                    return (
                                      <details
                                        key={`${dia.fecha}-${turno.hora_inicio}-${turno.hora_fin}`}
                                        className="trainer-shift-accordion"
                                        style={turnoEntrenadorBox}
                                        onToggle={cerrarAcordeonesHermanos}
                                        open={
                                          (dia.fecha === hoyAgendaClave &&
                                            indiceTurno === 0) ||
                                          (dia.turnos.length === 1 &&
                                            indiceTurno === 0)
                                        }
                                      >
                                        <summary
                                          className="trainer-shift-summary"
                                          onClick={enfocarAcordeonEntrenadorAlAbrir}
                                        >
                                          <strong>
                                            {turno.hora_inicio}–
                                            {turno.hora_fin}
                                          </strong>
                                          <div style={resumenChipsMovil}>
                                            <span>{gruposTurno.length} grupos</span>
                                            {pendientesTurno > 0 && (
                                              <span>
                                                {pendientesTurno} pendientes
                                              </span>
                                            )}
                                          </div>
                                        </summary>

                                        <div className="trainer-groups-list">
                                          {gruposTurno.map(
                                          (
                                            grupo,
                                            indiceGrupoEntrenadorTurno
                                          ) => {
                                            const alumnosGrupo =
                                              alumnosCompletosDelGrupo(
                                                grupo.grupo_id
                                              );
                                            const alumnosPropios =
                                              alumnosDelGrupo(
                                                grupo.grupo_id,
                                                grupo.entrenador_id
                                              );
                                            const repartoGrupo =
                                              repartoEntrenadoresDelGrupo(
                                                grupo.grupo_id
                                              );
                                            const presentes =
                                              alumnosGrupo.filter(
                                                (a) =>
                                                  a.estado_asistencia ===
                                                  'Presente'
                                              ).length;
                                            const ausentes =
                                              alumnosGrupo.filter(
                                                (a) =>
                                                  a.estado_asistencia ===
                                                  'Ausente'
                                              ).length;
                                            const pendientes =
                                              alumnosGrupo.filter(
                                                (a) =>
                                                  a.estado_asistencia ===
                                                  'Pendiente'
                                              ).length;
                                            const faltaReporte =
                                              alumnosPropios.filter(
                                                (a) =>
                                                  a.estado_reporte ===
                                                  'Falta reporte'
                                              ).length;
                                            const reportesEnviados =
                                              alumnosPropios.filter(
                                                (a) =>
                                                  a.estado_reporte ===
                                                  'Reporte enviado'
                                              ).length;
                                            const asistenciaCompleta =
                                              alumnosGrupo.length > 0 &&
                                              pendientes === 0;
                                            const confirmacionPropiaPendiente =
                                              grupo.estado_confirmacion !== 'Confirmado';
                                            const estadoAccionGrupo =
                                              confirmacionPropiaPendiente
                                                ? 'Pendiente de confirmar por ti'
                                                : !asistenciaCompleta
                                                ? 'Falta asistencia'
                                                : faltaReporte > 0
                                                ? 'Faltan reportes'
                                                : '';
                                            const esGrupoActivo =
                                              grupoActivoEntrenador?.grupo_id ===
                                                grupo.grupo_id &&
                                              grupoActivoEntrenador?.entrenador_id ===
                                                grupo.entrenador_id;
                                            const grupoDomId = `trainer-group-${grupo.entrenador_id}-${grupo.grupo_id}`.replace(
                                              /[^a-zA-Z0-9_-]/g,
                                              '-'
                                            );

                                            const tarjetaGrupoEntrenador = (
                                              <article
                                                id={grupoDomId}
                                                key={`${grupo.entrenador_id}-${grupo.grupo_id}`}
                                                className={`trainer-group-card ${
                                                  esGrupoActivo
                                                    ? 'is-sheet-open'
                                                    : ''
                                                }`}
                                                data-active-section={
                                                  esGrupoActivo
                                                    ? seccionGrupoEntrenador
                                                    : undefined
                                                }
                                                style={{
                                                  ...grupoEntrenadorCardMovil,
                                                  ...estiloGrupoPorPistaApp(
                                                    grupo
                                                  ),
                                                  boxShadow:
                                                    '0 12px 28px rgba(52, 81, 135, 0.09)',
                                                  borderRadius: 18,
                                                }}
                                              >
                                                <div className="trainer-group-sheet-header">
                                                  <div>
                                                    <span className="trainer-group-sheet-kicker">
                                                      Grupo de entrenamiento
                                                    </span>
                                                    <h3>
                                                      {nombreGrupoVisualApp(
                                                        grupo,
                                                        indiceGrupoEntrenadorTurno
                                                      )}
                                                    </h3>
                                                    <p>
                                                      {capitalizarPrimera(
                                                        new Date(
                                                          `${grupo.fecha}T00:00:00`
                                                        ).toLocaleDateString(
                                                          'es-ES',
                                                          { weekday: 'long' }
                                                        )
                                                      )}{' '}
                                                      · {grupo.hora_inicio}–
                                                      {grupo.hora_fin}
                                                    </p>
                                                  </div>
                                                  <button
                                                    type="button"
                                                    className="trainer-group-sheet-close"
                                                    onClick={cerrarGrupoEntrenador}
                                                  >
                                                    Cerrar
                                                  </button>
                                                </div>

                                                <div
                                                  style={
                                                    grupoEntrenadorTopMovil
                                                  }
                                                >
                                                  <div>
                                                    <p
                                                      style={
                                                        badgeModalidadMovil
                                                      }
                                                    >
                                                      {grupo.modalidad}
                                                    </p>
                                                    <h3
                                                      style={{
                                                        margin: '4px 0',
                                                      }}
                                                    >
                                                      {nombreGrupoVisualApp(
                                                        grupo,
                                                        indiceGrupoEntrenadorTurno
                                                      )}
                                                    </h3>
                                                    <p style={{ margin: 0 }}>
                                                      Nivel{' '}
                                                      {grupo.nivel_grupo || '-'}{' '}
                                                      · Pista{' '}
                                                      {grupo.pista || '-'} ·
                                                      Punto{' '}
                                                      {grupo.punto_encuentro ||
                                                        '-'}
                                                    </p>
                                                  </div>
                                                  <div
                                                    style={contadorNinosMovil}
                                                  >
                                                    <strong>
                                                      {grupo.total_alumnos}
                                                    </strong>
                                                    <span>niños</span>
                                                  </div>
                                                </div>

                                                {repartoGrupo.length > 1 && (
                                                  <section
                                                    style={{
                                                      ...miniTarjetaBlanca,
                                                      marginTop: 10,
                                                      display: 'grid',
                                                      gap: 8,
                                                    }}
                                                  >
                                                    <strong>Equipo y reparto del grupo</strong>
                                                    {repartoGrupo.map((responsable) => (
                                                      <div
                                                        key={`${grupo.grupo_id}-reparto-${responsable.entrenador_id}`}
                                                        style={{
                                                          padding: '8px 10px',
                                                          borderRadius: 12,
                                                          background:
                                                            responsable.entrenador_id === grupo.entrenador_id
                                                              ? '#eff6ff'
                                                              : '#f8fafc',
                                                          border: '1px solid #e2e8f0',
                                                        }}
                                                      >
                                                        <strong>{responsable.entrenador}</strong>
                                                        <span style={{ marginLeft: 6, color: '#64748b' }}>
                                                          · {responsable.alumnos.length} niño{responsable.alumnos.length === 1 ? '' : 's'}
                                                        </span>
                                                        <div style={{ marginTop: 4, fontSize: 13, lineHeight: 1.45 }}>
                                                          {responsable.alumnos.length > 0
                                                            ? responsable.alumnos.map((alumno) => alumno.alumno).join(' · ')
                                                            : 'Sin alumnos asignados'}
                                                        </div>
                                                      </div>
                                                    ))}
                                                  </section>
                                                )}

                                                {estadoAccionGrupo && (
                                                  <div
                                                    className="trainer-group-action-status"
                                                    style={avisoPendiente}
                                                  >
                                                    {estadoAccionGrupo}
                                                  </div>
                                                )}

                                                <nav
                                                  className="trainer-group-quick-nav"
                                                  aria-label="Secciones del grupo"
                                                >
                                                  <button
                                                    type="button"
                                                    className={
                                                      seccionGrupoEntrenador ===
                                                      'asistencia'
                                                        ? 'is-active'
                                                        : ''
                                                    }
                                                    onClick={() =>
                                                      irASeccionGrupoEntrenador(
                                                        'asistencia',
                                                        grupoDomId
                                                      )
                                                    }
                                                  >
                                                    Asistencia
                                                  </button>
                                                  <button
                                                    type="button"
                                                    className={
                                                      seccionGrupoEntrenador ===
                                                      'trabajo'
                                                        ? 'is-active'
                                                        : ''
                                                    }
                                                    onClick={() =>
                                                      irASeccionGrupoEntrenador(
                                                        'trabajo',
                                                        grupoDomId
                                                      )
                                                    }
                                                  >
                                                    Trabajo diario
                                                  </button>
                                                  <button
                                                    type="button"
                                                    className={
                                                      seccionGrupoEntrenador ===
                                                      'observaciones'
                                                        ? 'is-active'
                                                        : ''
                                                    }
                                                    onClick={() =>
                                                      irASeccionGrupoEntrenador(
                                                        'observaciones',
                                                        grupoDomId
                                                      )
                                                    }
                                                  >
                                                    Observaciones
                                                  </button>
                                                </nav>

                                                {confirmacionPropiaPendiente && (
                                                  <button
                                                    type="button"
                                                    className="trainer-confirm-button"
                                                    onClick={() =>
                                                      confirmarGrupoEntrenador(
                                                        grupo.grupo_id,
                                                        grupo.entrenador_id
                                                      )
                                                    }
                                                    style={{
                                                      ...botonPrincipal,
                                                      width: '100%',
                                                    }}
                                                  >
                                                    Confirmar mi participación
                                                  </button>
                                                )}

                                                <button
                                                  type="button"
                                                  className="trainer-open-group-button"
                                                  onClick={() => {
                                                    setSeccionGrupoEntrenador(
                                                      'asistencia'
                                                    );
                                                    setGrupoActivoEntrenador({
                                                      grupo_id: grupo.grupo_id,
                                                      entrenador_id:
                                                        grupo.entrenador_id,
                                                    });
                                                  }}
                                                >
                                                  Abrir grupo
                                                </button>

                                                <section
                                                  id={`${grupoDomId}-asistencia`}
                                                  className={`trainer-attendance-panel trainer-group-section-anchor ${
                                                    seccionGrupoEntrenador ===
                                                    'asistencia'
                                                      ? 'is-active-section'
                                                      : ''
                                                  }`}
                                                  style={bloqueInfoEntrenador}
                                                >
                                                  <div className="trainer-attendance-heading">
                                                    <h4>Niños del grupo · asistencia y reportes</h4>
                                                    <span>Marca la asistencia al llegar</span>
                                                  </div>
                                                  <div
                                                    style={resumenChipsMovil}
                                                  >
                                                    <span>
                                                      Presentes {presentes}
                                                    </span>
                                                    <span>
                                                      Ausentes {ausentes}
                                                    </span>
                                                    <span>
                                                      Pendientes {pendientes}
                                                    </span>
                                                    <span>
                                                      Reportes{' '}
                                                      {reportesEnviados}/
                                                      {alumnosPropios.length}
                                                    </span>
                                                  </div>

                                                  <div
                                                    style={{
                                                      display: 'grid',
                                                      gap: 8,
                                                      marginTop: 10,
                                                    }}
                                                  >
                                                    {alumnosGrupo.map(
                                                      (alumno) => (
                                                        <div
                                                          key={`${grupo.grupo_id}-${alumno.alumno_id}`}
                                                          className="trainer-student-row"
                                                          style={miniTarjetaBlanca}
                                                        >
                                                          <div
                                                            className="trainer-student-main"
                                                            style={filaAlumnoEntrenadorMovil}
                                                          >
                                                            <div>
                                                              <strong>
                                                                {alumno.alumno}{' '}
                                                                · Nivel{' '}
                                                                {alumno.nivel_alumno ||
                                                                  'SIN NIVEL'}
                                                              </strong>
                                                              <p
                                                                style={{
                                                                  margin: '4px 0 0',
                                                                  fontSize: 12,
                                                                  fontWeight: 800,
                                                                  color:
                                                                    alumno.entrenador_id === grupo.entrenador_id
                                                                      ? '#1d4ed8'
                                                                      : '#64748b',
                                                                }}
                                                              >
                                                                {alumno.entrenador_id === grupo.entrenador_id
                                                                  ? 'Asignado a ti'
                                                                  : `Asignado a ${alumno.entrenador || 'otro entrenador'}`}
                                                              </p>
                                                              <p
                                                                style={{
                                                                  margin:
                                                                    '4px 0 0',
                                                                  fontSize: 13,
                                                                }}
                                                              >
                                                                Asistencia:{' '}
                                                                <strong>
                                                                  {
                                                                    alumno.estado_asistencia
                                                                  }
                                                                </strong>
                                                              </p>
                                                              <p
                                                                style={{
                                                                  margin:
                                                                    '4px 0 0',
                                                                  fontSize: 13,
                                                                }}
                                                              >
                                                                Reporte:{' '}
                                                                <strong>
                                                                  {
                                                                    alumno.estado_reporte
                                                                  }
                                                                </strong>
                                                              </p>
                                                            </div>
                                                            <div
                                                              className="trainer-attendance-actions"
                                                              style={botonesAsistenciaMovil}
                                                            >
                                                              <button
                                                                className={`trainer-soft-button trainer-soft-button--success ${
                                                                  alumno.estado_asistencia ===
                                                                  'Presente'
                                                                    ? 'is-active'
                                                                    : ''
                                                                }`}
                                                                onClick={() =>
                                                                  marcarAsistencia(
                                                                    grupo.grupo_id,
                                                                    alumno.alumno_id,
                                                                    'Presente'
                                                                  )
                                                                }
                                                              >
                                                                Presente
                                                              </button>
                                                              <button
                                                                className={`trainer-soft-button trainer-soft-button--danger ${
                                                                  alumno.estado_asistencia ===
                                                                  'Ausente'
                                                                    ? 'is-active'
                                                                    : ''
                                                                }`}
                                                                onClick={() =>
                                                                  marcarAsistencia(
                                                                    grupo.grupo_id,
                                                                    alumno.alumno_id,
                                                                    'Ausente'
                                                                  )
                                                                }
                                                              >
                                                                Ausente
                                                              </button>
                                                              <button
                                                                className={`trainer-soft-button trainer-soft-button--warning ${
                                                                  alumno.estado_asistencia ===
                                                                  'Pendiente'
                                                                    ? 'is-active'
                                                                    : ''
                                                                }`}
                                                                onClick={() =>
                                                                  marcarAsistencia(
                                                                    grupo.grupo_id,
                                                                    alumno.alumno_id,
                                                                    'Pendiente'
                                                                  )
                                                                }
                                                              >
                                                                Pendiente
                                                              </button>
                                                            </div>
                                                          </div>

                                                          {alumno.entrenador_id ===
                                                            grupo.entrenador_id &&
                                                            alumno.estado_asistencia ===
                                                              'Presente' &&
                                                            alumno.estado_reporte ===
                                                              'Falta reporte' &&
                                                            !formularioAbierto(
                                                              alumno
                                                            ) && (
                                                              <button
                                                                onClick={() =>
                                                                  abrirFormularioReporte(
                                                                    alumno
                                                                  )
                                                                }
                                                                style={{
                                                                  ...botonPrincipal,
                                                                  marginTop: 10,
                                                                  width: '100%',
                                                                }}
                                                              >
                                                                Rellenar reporte
                                                              </button>
                                                            )}

                                                          {alumno.entrenador_id ===
                                                            grupo.entrenador_id &&
                                                            formularioAbierto(
                                                              alumno
                                                            ) &&
                                                            renderFormularioReporteEntrenador(
                                                              alumno,
                                                              grupo.nivel_grupo,
                                                              'inline'
                                                            )}
                                                        </div>
                                                      )
                                                    )}
                                                  </div>
                                                </section>

                                                <details
                                                  id={`${grupoDomId}-trabajo`}
                                                  className={`trainer-info-details trainer-work-details trainer-group-section-anchor ${
                                                    seccionGrupoEntrenador ===
                                                    'trabajo'
                                                      ? 'is-active-section'
                                                      : ''
                                                  }`}
                                                  open={
                                                    esGrupoActivo &&
                                                    seccionGrupoEntrenador ===
                                                      'trabajo'
                                                      ? true
                                                      : undefined
                                                  }
                                                  style={bloqueInfoEntrenador}
                                                >
                                                  <summary>Trabajo diario</summary>
                                                  <div style={bloqueTexto}>
                                                    {formatearTrabajoDiario(
                                                      grupo.trabajo_diario ?? null
                                                    )}
                                                  </div>
                                                </details>

                                                <details
                                                  id={`${grupoDomId}-observaciones`}
                                                  className={`trainer-info-details trainer-observations-details trainer-group-section-anchor ${
                                                    seccionGrupoEntrenador ===
                                                    'observaciones'
                                                      ? 'is-active-section'
                                                      : ''
                                                  }`}
                                                  open={
                                                    esGrupoActivo &&
                                                    seccionGrupoEntrenador ===
                                                      'observaciones'
                                                      ? true
                                                      : undefined
                                                  }
                                                  style={bloqueInfoEntrenador}
                                                >
                                                  <summary>Observaciones importantes</summary>
                                                  <div style={bloqueTexto}>
                                                    {formatearObservaciones(
                                                      grupo.observaciones_importantes ??
                                                        null
                                                    )}
                                                  </div>
                                                </details>

                                              </article>
                                            );

                                            const mostrarGrupoEnPortal =
                                              esGrupoActivo &&
                                              typeof document !== 'undefined' &&
                                              typeof window !== 'undefined' &&
                                              window.matchMedia(
                                                '(max-width: 719px)'
                                              ).matches;

                                            if (mostrarGrupoEnPortal) {
                                              return createPortal(
                                                tarjetaGrupoEntrenador,
                                                document.body,
                                                `grupo-entrenador-${grupo.entrenador_id}-${grupo.grupo_id}`
                                              );
                                            }

                                            return tarjetaGrupoEntrenador;
                                          }
                                        )}
                                        </div>
                                      </details>
                                    );
                                  })}
                                </div>
                              </details>
                            );
                          }
                        )}
                      </div>
                    </details>
                  );
                })}
              </article>
            ))}
        </section>
      )}

      {alumnoReporteActivo &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="trainer-report-overlay"
            role="dialog"
            aria-modal="true"
            aria-label={`Reporte de ${alumnoReporteActivo.alumno}`}
          >
            {renderFormularioReporteEntrenador(
              alumnoReporteActivo,
              grupoReporteActivo?.nivel_grupo || '',
              'sheet'
            )}
          </div>,
          document.body
        )}

    </>
  );
}
