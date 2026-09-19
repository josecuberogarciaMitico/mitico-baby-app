import React, { useEffect, useState } from 'react';
import type { AlumnoResumen } from '../../core/students/studentTypes';
import type { EntrenadorResumen } from '../../core/trainers/trainerTypes';
import type { AgendaRecomendacionSesionApp, RecomendacionFueraPlazoAgendaApp } from './agendaTypes';
import { addIsoDays, type BabyRelocationOption, type BabyRelocationStudent } from './agendaRelocation';
import { loadBabyRelocationOptions, moveBabyStudentBetweenSessions } from '../../services/agenda/agendaRelocationService';
import { SessionTrainerCoverageLine } from './AgendaTrainerSummary';
import { pendingAgendaStudents } from './agendaSessions';
import {
  sessionTrainerCoverage,
  type AgendaTrainerAssignmentRow,
} from './agendaTrainerSummary';

type AgendaScreenProps = {
  ctx: Record<string, any>;
};

export function AgendaScreen({ ctx }: AgendaScreenProps) {
  const [agendaPestanaProceso, setAgendaPestanaProceso] = useState<
    'crear' | 'organizar' | 'publicar'
  >('crear');
  const [agendaMostrarPendientesColocar, setAgendaMostrarPendientesColocar] =
    useState(false);
  const {
    abrirAltaTestDesdeAgenda,
    abrirFormularioAgendaDia,
    abrirSesionAgenda,
    agendaAccionesSesion,
    agendaAlumnoLinea,
    agendaAlumnosSesion,
    agendaBadgeModalidad,
    agendaBadgeModalidadColor,
    agendaBloqueBlanco,
    agendaBotonDiaCompacto,
    agendaCabeceraLinea,
    agendaDiaCard,
    agendaDiaCompactoActivo,
    agendaDiaHeader,
    agendaDiasSelectorCompacto,
    agendaFiltroAlumnos,
    agendaForm,
    agendaFormularioAbierto,
    agendaGrupoLinea,
    agendaGrupoPropuesta,
    agendaGruposSesion,
    agendaMiniContadorDiaCompacto,
    agendaMiniLabel,
    agendaMiniTexto,
    agendaPanelControles,
    agendaSesionActivaId,
    agendaSesionCardModalidad,
    agendaSesionContadores,
    agendaSesionTop,
    agendaShellCompacto,
    agendaTurnoFila,
    agendaVacio,
    agendaVacioMini,
    alumnoFueraPlazoNivel,
    alumnoFueraPlazoNombre,
    alumnos,
    alumnosDelGrupoCreadoApp,
    analizandoFueraPlazo,
    analizarEncajeAlumnoFueraPlazoAgenda,
    anioInicioTemporadaAgenda,
    asignacionExcepcionalGrupoAgenda,
    asistenciaAlumnoIntensivoAgenda,
    avisoCompleto,
    avisoNeutral,
    avisoPendiente,
    babyAimHarderCargandoSemana,
    babyAimHarderError,
    babyAimHarderFormularioCargando,
    babyAimHarderMensaje,
    babyAimHarderSesionCargandoId,
    borrarGrupoAgenda,
    borrarSesionAgenda,
    botonMini,
    botonModalidadAgenda,
    botonPeligro,
    botonPeligroMini,
    botonPrincipal,
    botonSecundario,
    buildMasterStudentProfile,
    cambiarEntrenadorGrupoAgenda,
    cambiarPuntoGrupoAgenda,
    cambiarSegundoEntrenadorGrupoAgenda,
    cambiarSemanaTrabajoApp,
    cargando,
    cargarAgendaOperativaDirecta,
    cargarEntrenadores,
    cargarIntensivos,
    cargarListados,
    cargarPlanning,
    cargarSemanaBabyDesdeAimHarder,
    cerrandoSemanaPushApp,
    cerrarOrganizacionSemanalPushApp,
    consultarSupabase,
    contextoIntensivoSesionAgenda,
    copiarMensajeWhatsAppPapisSesionActual,
    crearGrupoAgendaDesdeRecomendacion,
    crearGrupoManualAgenda,
    crearTodosGruposAgendaDesdeRecomendacion,
    datosAimHarderAlumnoAgenda,
    despublicarGrupo,
    diasSemanaAgenda,
    entrenadores,
    entrenadoresAgendaGrupo,
    entrenadoresApoyoAgendaGrupo,
    entrenadoresDisponiblesCambioGrupoAgenda,
    entrenadoresDisponiblesSesionActiva,
    entrenadoresExcepcionalesCambioGrupoAgenda,
    enviarWhatsAppPapisSesionTarjeta,
    errorIncorporacionFueraPlazo,
    esCoordinadorApp,
    esGrupoParticularAgenda,
    esNombreGrupoParticularApp,
    esVistaMovilApp,
    estiloBadgePistaApp,
    estiloGrupoPorPistaApp,
    estiloValidacionPedagogicaApp,
    etiquetaDiaFechaAgenda,
    etiquetaPistaVisualApp,
    explicacionCompactaPropuestaBabyApp,
    fechaAgendaCortaConAnio,
    fechaAgendaDiaCorta,
    formatearAlumnoListadoOperativo,
    formatearFecha,
    generarRecomendacionAgendaSesion,
    gridFormulario,
    gridMiniMetricas,
    gruposAgendaManuales,
    gruposRecomendadosAgenda,
    gruposRecursosTurnoAgenda,
    guardarRepartoManualGrupoAgenda,
    guardarTrabajoObservacionesGrupoAgenda,
    hrefWhatsappAlumnoResumenDia,
    incorporandoFueraPlazo,
    incorporarAlumnoFueraPlazoEnGrupo,
    labelCampo,
    marcarNoVieneIntensivoDesdeAgenda,
    mensajeIncorporacionFueraPlazo,
    mesAgendaActivo,
    mesesAgenda,
    miniMetrica,
    miniTarjetaBlanca,
    mostrarAlumnoFueraPlazo,
    moverAlumnoAgendaRecomendado,
    moverAlumnoEntreGruposAgenda,
    necesitaDosEntrenadoresGrupoApp,
    nombreGrupoPropuestaApp,
    nombreGrupoVisualApp,
    nombreMesAgendaDesdeClave,
    nombreTemporadaAgenda,
    nombresEntrenadoresDelGrupo,
    nombresGruposAgendaBase,
    normalizarLineasObservacionesGrupoApp,
    normalizarNombreAlumnoAgendaApp,
    normalizarNombreFueraPlazoAgenda,
    observacionesAgendaGrupo,
    observacionesAutomaticasGrupoAgenda,
    observacionesGrupoCreadoEditando,
    opcionesTemporadaAgenda,
    panelTrabajoGrupo,
    pantalla,
    perfilOperativoAlumnoApp,
    publicarGrupo,
    puntosEncuentroAgenda,
    quitarAlumnoAgenda,
    rangoEntrenosSemanaAgenda,
    rangoSemanaAgenda,
    recomendacionesFueraPlazo,
    refrescarSesionBabyDesdeAimHarder,
    regenerarTrabajoGrupoIntensivoAgenda,
    renderAyudaRapidaPantallaApp,
    responsableManualGrupoCreadoApp,
    responsableReporteAgendaApp,
    responsablesManualesGrupoAgenda,
    responsablesReporteAgendaGrupo,
    restaurarVieneIntensivoDesdeAgenda,
    setResponsablesManualesGrupoAgenda,
    selectCampo,
    selectCampoAgenda,
    semanaAgendaActiva,
    semanasAgenda,
    sesionesDelDiaAgenda,
    setAgendaDiaCompactoActivo,
    setAgendaFiltroAlumnos,
    setAgendaForm,
    setAgendaFormularioAbierto,
    setAgendaRecomendaciones,
    setAgendaSesionActivaId,
    setAlumnoFueraPlazoAlumnoId,
    setAlumnoFueraPlazoNivel,
    setAlumnoFueraPlazoNombre,
    setAlumnos,
    setAnioInicioTemporadaAgenda,
    setAsignacionExcepcionalGrupoAgenda,
    setBusquedaAlumno,
    setEntrenadoresAgendaGrupo,
    setError,
    setFiltroAlumnos,
    setMesAgenda,
    setMostrarAlumnoFueraPlazo,
    setObservacionesAgendaGrupo,
    setObservacionesGrupoCreadoEditando,
    setPantalla,
    setRecomendacionesFueraPlazo,
    setResponsablesReporteAgendaGrupo,
    setSemanaAgendaInicio,
    setTrabajoAgendaGrupo,
    setTrabajoGrupoCreadoEditando,
    setVistaFichasAlumnos,
    summaryTrabajoGrupo,
    tarjetaResaltada,
    textareaCampo,
    textoNecesidadDosEntrenadoresApp,
    textoValidacionPedagogicaGrupoApp,
    trabajoAgendaGrupo,
    trabajoDiarioAutomaticoAgenda,
    trabajoGrupoCreadoEditando,
    traerListadoBabyTurnoAgendaDesdeAimHarder,
    turnosTrabajoDiaAgenda,
    valorSelectorDestinoAlumnoAgenda,
    volcarListadoAgendaOperativa,
  } = ctx;

  function abrirFichaAlumnoDesdeAgenda(alumnoId: string, nombreAlumno: string) {
    const ficha = alumnos.find((item) => item.alumno_id === alumnoId);
    setVistaFichasAlumnos('general');
    setFiltroAlumnos('todos');
    setBusquedaAlumno(ficha?.alumno || nombreAlumno);
    setPantalla('alumnos');
    window.setTimeout(() => {
      document
        .getElementById('fichas-listado-alumnos')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  const [alternativasBabyLocales, setAlternativasBabyLocales] = useState<
    Record<string, BabyRelocationOption[]>
  >({});
  const [buscandoAlternativasBaby, setBuscandoAlternativasBaby] = useState(false);
  const [moviendoAlumnoTurnoId, setMoviendoAlumnoTurnoId] = useState('');
  const [agendaTrainerAssignmentRows, setAgendaTrainerAssignmentRows] = useState<
    AgendaTrainerAssignmentRow[]
  >([]);

  const gruposPropuestaActuales = gruposRecomendadosAgenda();
  const candidatosReubicacionBaby: BabyRelocationStudent[] = [];
  const candidatosVistos = new Set<string>();
  gruposPropuestaActuales.forEach(([nombreGrupo, alumnosGrupo]) => {
    if (esGrupoParticularAgenda(nombreGrupo)) return;
    const validacion = textoValidacionPedagogicaGrupoApp(alumnosGrupo);
    if (alumnosGrupo.length !== 1 && validacion.estado !== 'BLOQUEADO') return;
    alumnosGrupo.forEach((alumno: AgendaRecomendacionSesionApp) => {
      if (candidatosVistos.has(alumno.alumno_id)) return;
      candidatosVistos.add(alumno.alumno_id);
      candidatosReubicacionBaby.push({
        alumno_id: alumno.alumno_id,
        alumno: alumno.alumno,
        nivel_resumen: alumno.nivel_resumen,
      });
    });
  });
  const firmaCandidatosReubicacion = candidatosReubicacionBaby
    .map((alumno) => `${alumno.alumno_id}:${alumno.nivel_resumen}`)
    .sort()
    .join('|');
  const firmaGruposAgenda = (agendaGruposSesion || [])
    .map(
      (grupo: any) =>
        `${grupo.grupo_id || ''}:${grupo.entrenador_id || ''}:${grupo.entrenador_apoyo_id || ''}:${grupo.total_alumnos || 0}`
    )
    .sort()
    .join('|');

  async function cargarAsignacionesEntrenadoresSemana() {
    if (!semanaAgendaActiva) {
      setAgendaTrainerAssignmentRows([]);
      return;
    }
    const finSemana = addIsoDays(semanaAgendaActiva, 6);
    try {
      const assignmentRows = await consultarSupabase(
        'v_grupos_entrenador_app_dos_entrenadores',
        `select=entrenador_id,entrenador,grupo_id,fecha,hora_inicio,hora_fin,modalidad&fecha=gte.${semanaAgendaActiva}&fecha=lte.${finSemana}&order=fecha.asc,hora_inicio.asc,entrenador.asc`
      );
      setAgendaTrainerAssignmentRows(
        Array.isArray(assignmentRows)
          ? (assignmentRows as AgendaTrainerAssignmentRow[])
          : []
      );
    } catch (errorResumen) {
      console.warn('No se pudieron cargar las asignaciones semanales de entrenadores.', errorResumen);
      setAgendaTrainerAssignmentRows([]);
    }
  }

  useEffect(() => {
    if (pantalla !== 'agenda') return;
    void cargarAsignacionesEntrenadoresSemana();
    // La firma refresca las asignaciones cuando cambian dentro de la sesión abierta.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pantalla, semanaAgendaActiva, firmaGruposAgenda]);

  useEffect(() => {
    let cancelado = false;
    if (!agendaSesionActivaId || !firmaCandidatosReubicacion) {
      setAlternativasBabyLocales({});
      setBuscandoAlternativasBaby(false);
      return () => {
        cancelado = true;
      };
    }

    setBuscandoAlternativasBaby(true);
    void loadBabyRelocationOptions({
      sourceSessionId: agendaSesionActivaId,
      students: candidatosReubicacionBaby,
    })
      .then((options) => {
        if (!cancelado) setAlternativasBabyLocales(options);
      })
      .catch((errorAlternativas) => {
        if (cancelado) return;
        console.warn(
          'No se pudieron calcular las alternativas Baby entre turnos.',
          errorAlternativas
        );
        setAlternativasBabyLocales({});
      })
      .finally(() => {
        if (!cancelado) setBuscandoAlternativasBaby(false);
      });

    return () => {
      cancelado = true;
    };
    // La firma contiene exactamente los alumnos/niveles que necesitan alternativa.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agendaSesionActivaId, firmaCandidatosReubicacion]);

  async function moverAlumnoAlternativaBaby(
    alumno: AgendaRecomendacionSesionApp,
    opcion: BabyRelocationOption
  ) {
    const alumnoSesion = agendaAlumnosSesion.find(
      (registro: any) => registro.alumno_id === alumno.alumno_id
    );
    if (!alumnoSesion?.sesion_alumno_id) {
      setError(
        'No encuentro al alumno en la sesión actual. Actualiza la sesión y vuelve a intentarlo.'
      );
      return;
    }

    const destino = opcion.kind === 'REAL'
      ? opcion.grupo
      : `turno ${opcion.hora_inicio.slice(0, 5)}–${opcion.hora_fin.slice(0, 5)} (grupo se recalculará)`;
    const confirmado = window.confirm(
      `Padres OK · mover a ${alumno.alumno}\n\n${etiquetaDiaFechaAgenda(opcion.fecha)} · ${opcion.hora_inicio.slice(0, 5)}–${opcion.hora_fin.slice(0, 5)}\n${destino}\n\n¿Confirmas el cambio de turno?`
    );
    if (!confirmado) return;

    setMoviendoAlumnoTurnoId(alumno.alumno_id);
    setError('');
    try {
      await moveBabyStudentBetweenSessions({
        sourceSessionStudentId: alumnoSesion.sesion_alumno_id,
        targetSessionId: opcion.sesion_id,
        targetGroupId: opcion.grupo_id,
      });
      await Promise.all([
        cargarAgendaOperativaDirecta(),
        cargarPlanning(),
        cargarEntrenadores(),
      ]);
      await generarRecomendacionAgendaSesion(agendaSesionActivaId);
      await cargarAsignacionesEntrenadoresSemana();
    } catch (errorMovimiento) {
      setError(
        errorMovimiento instanceof Error
          ? errorMovimiento.message
          : 'No se pudo mover al alumno al otro turno.'
      );
    } finally {
      setMoviendoAlumnoTurnoId('');
    }
  }

  // Alumnos que están en el listado de la sesión pero no aparecen en ningún
  // grupo ya creado. La comparación usa el MISMO normalizador de alumnos que
  // el resto de Agenda, para ignorar metadatos persistidos en alumnos_lista
  // (nivel, pista, etiquetas TEST, etc.) y no generar falsos pendientes.
  const alumnosPendientesColocar: any[] = pendingAgendaStudents(
    agendaAlumnosSesion as any[],
    agendaGruposSesion as any[],
    normalizarNombreAlumnoAgendaApp
  );

  // Reutiliza el mismo recomendador de "alumno fuera de plazo" (grupos ya
  // creados de este turno y de otros turnos de la semana) para un alumno que
  // YA está en el listado de esta sesión pero no está en ningún grupo.
  function abrirBusquedaGrupoParaAlumnoPendiente(alumno: any) {
    setAgendaPestanaProceso('crear');
    setMostrarAlumnoFueraPlazo(true);
    setAlumnoFueraPlazoNombre(alumno.alumno);
    setAlumnoFueraPlazoNivel(alumno.nivel_usado || '');
    setAlumnoFueraPlazoAlumnoId(alumno.alumno_id);
    setRecomendacionesFueraPlazo([]);

    requestAnimationFrame(() => {
      document
        .getElementById('agenda-alumno-fuera-plazo')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    void analizarEncajeAlumnoFueraPlazoAgenda({
      nombre: alumno.alumno,
      nivel: alumno.nivel_usado || '',
      alumnoId: alumno.alumno_id,
    });
  }

  return (
    <>
      {pantalla === 'agenda' && (
        <section style={agendaShellCompacto}>
          <article
            style={{
              borderRadius: 24,
              padding: 20,
              background:
                'linear-gradient(135deg, #062d3f 0%, #083b4d 58%, #0b5d4f 100%)',
              border: '1px solid rgba(16,185,129,0.28)',
              boxShadow: '0 18px 44px rgba(15,23,42,0.16)',
              color: '#ffffff',
              display: 'grid',
              gap: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: 0, flex: '1 1 420px' }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: 1.15,
                    color: '#86efac',
                  }}
                >
                  TRABAJO SEMANAL · AGENDA
                </p>
                <h2 style={{ margin: '4px 0 0', fontSize: 30, color: '#fff' }}>
                  Días de entrenamiento
                </h2>
              {renderAyudaRapidaPantallaApp()}
                <p
                  style={{
                    margin: '7px 0 0',
                    color: '#cbd5e1',
                    lineHeight: 1.4,
                  }}
                >
                  Semana compacta: eliges semana, abres un día y trabajas solo una
                  sesión. Sin bajar toda la pantalla.
                </p>
              </div>

              <div
                style={{
                  flex: '1 1 640px',
                  minWidth: 0,
                  padding: '11px 13px',
                  borderRadius: 16,
                  background: 'rgba(255,255,255,0.10)',
                  border: '1px solid rgba(255,255,255,0.16)',
                  display: 'grid',
                  gap: 10,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    gap: 16,
                    flexWrap: 'wrap',
                  }}
                >
                  <div style={{ display: 'grid', gap: 4, minWidth: 220 }}>
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 900,
                        letterSpacing: 0.8,
                        color: '#a7f3d0',
                        textTransform: 'uppercase',
                      }}
                    >
                      Semana completa
                    </span>
                    <strong style={{ fontSize: 16 }}>
                      {semanaAgendaActiva
                        ? rangoSemanaAgenda(semanaAgendaActiva)
                        : 'Sin semana'}
                    </strong>
                    <span style={{ color: '#cbd5e1', fontSize: 13 }}>
                      Entrenos:{' '}
                      {semanaAgendaActiva
                        ? rangoEntrenosSemanaAgenda(semanaAgendaActiva)
                        : '-'}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                      gap: 8,
                      flexWrap: 'wrap',
                      flex: '1 1 420px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => { cargarAgendaOperativaDirecta(); cargarIntensivos(); cargarPlanning(); cargarListados(); cargarEntrenadores(); void cargarAsignacionesEntrenadoresSemana(); }}
                      style={{
                        ...botonSecundario,
                        minHeight: 36,
                        padding: '8px 12px',
                        background: 'rgba(255,255,255,0.96)',
                        color: '#0f172a',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      Actualizar
                    </button>

                    {esCoordinadorApp && (
                      <>
                        <button
                          type="button"
                          onClick={() =>
                            void cerrarOrganizacionSemanalPushApp(semanaAgendaActiva)
                          }
                          disabled={cerrandoSemanaPushApp || !semanaAgendaActiva}
                          style={{
                            ...botonSecundario,
                            minHeight: 36,
                            padding: '8px 12px',
                            background: 'rgba(255,255,255,0.96)',
                            color: '#0f766e',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {cerrandoSemanaPushApp
                            ? 'Avisando...'
                            : 'Cerrar semana y avisar'}
                        </button>

                        <button
                          type="button"
                          onClick={() => void cargarSemanaBabyDesdeAimHarder()}
                          disabled={
                            babyAimHarderCargandoSemana ||
                            babyAimHarderFormularioCargando ||
                            Boolean(babyAimHarderSesionCargandoId) ||
                            !semanaAgendaActiva
                          }
                          style={{
                            ...botonPrincipal,
                            minHeight: 36,
                            padding: '8px 12px',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {babyAimHarderCargandoSemana
                            ? 'Cargando semana…'
                            : 'Cargar semana Baby desde AimHarder'}
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {esCoordinadorApp &&
                  (babyAimHarderMensaje || babyAimHarderError) && (
                    <div style={{ display: 'grid', gap: 6 }}>
                      {babyAimHarderMensaje && (
                        <div
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            width: 'fit-content',
                            maxWidth: '100%',
                            padding: '5px 8px',
                            borderRadius: 8,
                            background: 'rgba(240,253,244,.72)',
                            border: '1px solid rgba(134,239,172,.55)',
                            color: '#166534',
                            fontSize: 12,
                            fontWeight: 700,
                            lineHeight: 1.25,
                          }}
                        >
                          {babyAimHarderMensaje}
                        </div>
                      )}
                      {babyAimHarderError && (
                        <div
                          style={{
                            padding: '8px 10px',
                            borderRadius: 10,
                            background: 'rgba(255,247,237,.98)',
                            border: '1px solid rgba(251,146,60,.75)',
                            color: '#9a3412',
                            fontSize: 12,
                            fontWeight: 800,
                          }}
                        >
                          {babyAimHarderError}
                        </div>
                      )}
                    </div>
                  )}
              </div>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))',
                gap: 10,
                paddingTop: 4,
              }}
            >
              <label style={{ ...labelCampo, color: '#e2e8f0' }}>
                Temporada
                <select
                  value={anioInicioTemporadaAgenda}
                  style={{ ...selectCampoAgenda, width: '100%', color: '#0f172a', background: '#ffffff' }}
                  onChange={(e) => {
                    const nuevoAnio = Number(e.target.value);
                    setAnioInicioTemporadaAgenda(nuevoAnio);
                    setMesAgenda(`${nuevoAnio}-09`);
                    setSemanaAgendaInicio('');
                    setAgendaDiaCompactoActivo('');
                    setAgendaSesionActivaId('');
                    setAgendaFormularioAbierto(false);
                  }}
                >
                  {opcionesTemporadaAgenda.map((anio) => (
                    <option key={anio} value={anio}>
                      {nombreTemporadaAgenda(anio)}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ ...labelCampo, color: '#e2e8f0' }}>
                Mes
                <select
                  value={mesAgendaActivo}
                  style={{ ...selectCampoAgenda, width: '100%', color: '#0f172a', background: '#ffffff' }}
                  onChange={(e) => {
                    setMesAgenda(e.target.value);
                    setSemanaAgendaInicio('');
                    setAgendaDiaCompactoActivo('');
                    setAgendaSesionActivaId('');
                    setAgendaFormularioAbierto(false);
                  }}
                >
                  {mesesAgenda.map((clave) => (
                    <option key={clave} value={clave}>
                      {nombreMesAgendaDesdeClave(clave)}
                    </option>
                  ))}
                </select>
              </label>

              <label style={{ ...labelCampo, color: '#e2e8f0' }}>
                Semana
                <select
                  value={semanaAgendaActiva}
                  style={{ ...selectCampoAgenda, width: '100%', color: '#0f172a', background: '#ffffff' }}
                  onChange={(e) => cambiarSemanaTrabajoApp(e.target.value)}
                >
                  {semanasAgenda.map((semana) => (
                    <option key={semana} value={semana}>
                      Semana {rangoSemanaAgenda(semana)}
                    </option>
                  ))}
                </select>
              </label>
            </div>

          </article>

          <section
            style={{
              ...agendaPanelControles,
              padding: 14,
              gap: 12,
            }}
          >

            {diasSemanaAgenda.length === 0 ? (
              <div style={agendaVacio}>
                Selecciona una semana para ver los días de entrenamiento.
              </div>
            ) : (
              (() => {
                const diaActivo =
                  diasSemanaAgenda.find(
                    (dia) => dia.fecha === agendaDiaCompactoActivo
                  ) || diasSemanaAgenda[0];
                const sesionesDia = diaActivo
                  ? sesionesDelDiaAgenda(diaActivo.fecha)
                  : [];
                const totalAlumnosDia = sesionesDia.reduce(
                  (total, sesion) => total + Number(sesion.totalAlumnos || 0),
                  0
                );
                const totalGruposDia = sesionesDia.reduce(
                  (total, sesion) => total + Number(sesion.totalGrupos || 0),
                  0
                );

                return (
                  <div style={{ display: 'grid', gap: 14 }}>
                    <div style={agendaDiasSelectorCompacto}>
                      {diasSemanaAgenda.map((dia) => {
                        const sesionesDiaBoton = sesionesDelDiaAgenda(
                          dia.fecha
                        );
                        const alumnosDiaBoton = sesionesDiaBoton.reduce(
                          (total, sesion) =>
                            total + Number(sesion.totalAlumnos || 0),
                          0
                        );
                        const gruposDiaBoton = sesionesDiaBoton.reduce(
                          (total, sesion) =>
                            total + Number(sesion.totalGrupos || 0),
                          0
                        );
                        const activo = dia.fecha === diaActivo.fecha;

                        return (
                          <button
                            key={dia.fecha}
                            onClick={() => {
                              setAgendaDiaCompactoActivo(dia.fecha);
                              setAgendaSesionActivaId('');
                              setAgendaFormularioAbierto(false);
                              window.setTimeout(() => {
                                document
                                  .getElementById('agenda-dia-seleccionado')
                                  ?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'start',
                                  });
                              }, 120);
                            }}
                            style={agendaBotonDiaCompacto(
                              activo,
                              alumnosDiaBoton,
                              gruposDiaBoton
                            )}
                          >
                            <span
                              style={{
                                display: 'grid',
                                gap: 2,
                                textAlign: 'left',
                              }}
                            >
                              <span
                                style={{
                                  textTransform: 'capitalize',
                                  fontWeight: 900,
                                }}
                              >
                                {dia.nombre}
                              </span>
                              <span
                                style={{
                                  fontSize: 13,
                                  color: activo ? '#1d4ed8' : '#64748b',
                                }}
                              >
                                {fechaAgendaDiaCorta(dia.fecha)}
                              </span>
                            </span>
                            <span
                              style={agendaMiniContadorDiaCompacto(
                                activo,
                                alumnosDiaBoton,
                                gruposDiaBoton
                              )}
                            >
                              {alumnosDiaBoton} alumnos · {gruposDiaBoton}{' '}
                              grupos
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <article
                      id="agenda-dia-seleccionado"
                      style={{
                        ...agendaDiaCard,
                        padding: 0,
                        overflow: 'hidden',
                        border: '1px solid rgba(15,118,110,0.24)',
                        boxShadow: '0 12px 30px rgba(15,23,42,0.06)',
                      }}
                    >
                      <header
                        style={{
                          ...agendaDiaHeader,
                          marginBottom: 0,
                          padding: '15px 16px',
                          background:
                            'linear-gradient(135deg, rgba(236,253,245,0.98), #ffffff)',
                          borderBottom: '1px solid rgba(15,118,110,0.16)',
                        }}
                      >
                        <div>
                          <p style={agendaMiniLabel}>Día seleccionado</p>
                          <h3
                            style={{
                              margin: 0,
                              textTransform: 'capitalize',
                              fontSize: 24,
                            }}
                          >
                            {diaActivo.nombre} ·{' '}
                            {fechaAgendaCortaConAnio(diaActivo.fecha)}
                          </h3>
                          <p style={{ margin: '4px 0 0', color: '#64748b' }}>
                            {totalAlumnosDia} alumnos · {totalGruposDia} grupos
                            · Semana {rangoSemanaAgenda(semanaAgendaActiva)}
                          </p>
                        </div>
                        <span
                          style={{
                            ...agendaMiniTexto,
                            alignSelf: 'center',
                            fontWeight: 800,
                          }}
                        >
                          Elige un turno y añade Baby
                        </span>
                      </header>

                      <div style={{ display: 'grid', gap: 8, padding: '14px 16px 0' }}>
                        {turnosTrabajoDiaAgenda(diaActivo.fecha).map(
                          (turno) => (
                            <div
                              key={`${diaActivo.fecha}-${turno.inicio}`}
                              style={agendaTurnoFila}
                            >
                              <strong>{turno.etiqueta}</strong>
                              <div
                                style={{
                                  display: 'flex',
                                  gap: 6,
                                  flexWrap: 'wrap',
                                }}
                              >
                                <button
                                  onClick={() =>
                                    abrirFormularioAgendaDia(
                                      diaActivo.fecha,
                                      turno.inicio,
                                      turno.fin,
                                      'BABY'
                                    )
                                  }
                                  style={botonModalidadAgenda('BABY')}
                                >
                                  + Baby
                                </button>
                              </div>
                            </div>
                          )
                        )}
                      </div>

                      {sesionesDia.length === 0 ? (
                        <div style={{ ...agendaVacioMini, margin: '12px 16px 16px' }}>
                          <strong>Sin sesiones en este día.</strong>
                          <p style={{ margin: '6px 0 10px' }}>
                            Para Baby, elige un turno y pulsa “+ Baby”.
                            Ocio se prepara desde Grupos estables e Intensivos
                            desde su flujo correspondiente.
                          </p>
                        </div>
                      ) : (
                        <div
                          style={{ display: 'grid', gap: 10, marginTop: 12 }}
                        >
                          {sesionesDia.map((sesion) => (
                            <article
                              key={sesion.id}
                              data-agenda-session-date={sesion.fecha}
                              data-agenda-session-time={`${String(
                                sesion.hora_inicio || ''
                              ).slice(0, 5)} - ${String(
                                sesion.hora_fin || ''
                              ).slice(0, 5)}`}
                              style={{
                                ...agendaSesionCardModalidad(sesion.modalidad),
                                borderRadius: 16,
                                boxShadow: '0 8px 20px rgba(15,23,42,0.05)',
                              }}
                            >
                              <div style={agendaSesionTop}>
                                <div>
                                  <div
                                    style={agendaBadgeModalidadColor(
                                      sesion.modalidad
                                    )}
                                  >
                                    {sesion.modalidad}
                                  </div>
                                  <h4
                                    style={{
                                      margin: '8px 0 4px',
                                      fontSize: 18,
                                    }}
                                  >
                                    {sesion.titulo}
                                  </h4>
                                  <p style={{ margin: 0, color: '#475569' }}>
                                    {sesion.hora_inicio?.slice(0, 5)} -{' '}
                                    {sesion.hora_fin?.slice(0, 5)} ·{' '}
                                    {sesion.estado}
                                  </p>
                                </div>
                                <div style={agendaSesionContadores}>
                                  <span>
                                    <strong>{sesion.totalAlumnos}</strong>{' '}
                                    alumnos
                                  </span>
                                  <span>
                                    <strong>{sesion.totalGrupos}</strong> grupos
                                  </span>
                                </div>
                              </div>
                              <SessionTrainerCoverageLine
                                coverage={sessionTrainerCoverage(
                                  sesion,
                                  agendaTrainerAssignmentRows
                                )}
                                publishedGroups={Number(sesion.publicados || 0)}
                              />
                              <div style={agendaAccionesSesion}>
                                {sesion.origen === 'operativa' &&
                                  sesion.totalGrupos > 0 && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void enviarWhatsAppPapisSesionTarjeta(
                                          sesion
                                        )
                                      }
                                      style={botonSecundario}
                                    >
                                      WhatsApp papis
                                    </button>
                                  )}
                                <button
                                  onClick={() =>
                                    abrirSesionAgenda(
                                      sesion,
                                      sesion.totalGrupos > 0
                                        ? 'grupos'
                                        : 'alumnos'
                                    )
                                  }
                                  style={botonPrincipal}
                                >
                                  Abrir sesión
                                </button>
                                {sesion.origen === 'operativa' &&
                                  String(sesion.modalidad || '')
                                    .trim()
                                    .toUpperCase() === 'BABY' && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void refrescarSesionBabyDesdeAimHarder(
                                          sesion
                                        )
                                      }
                                      disabled={
                                        babyAimHarderCargandoSemana ||
                                        babyAimHarderFormularioCargando ||
                                        Boolean(babyAimHarderSesionCargandoId)
                                      }
                                      style={botonSecundario}
                                    >
                                      {babyAimHarderSesionCargandoId ===
                                      sesion.agendaDirecta?.sesion_id
                                        ? 'Refrescando…'
                                        : 'Refrescar listado'}
                                    </button>
                                  )}
                                {sesion.origen === 'operativa' &&
                                  sesion.agendaDirecta?.sesion_id && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        void borrarSesionAgenda(
                                          sesion.agendaDirecta!.sesion_id
                                        )
                                      }
                                      style={botonPeligro}
                                    >
                                      Borrar sesión
                                    </button>
                                  )}
                              </div>
                            </article>
                          ))}
                        </div>
                      )}
                    </article>
                  </div>
                );
              })()
            )}
          </section>

          {(agendaFormularioAbierto || agendaSesionActivaId) && (
            <section
              id="trabajo-agenda"
              style={{
                ...agendaBloqueBlanco,
                border: '2px solid #111827',
                scrollMarginTop: 16,
              }}
            >
              <div style={agendaCabeceraLinea}>
                <div>
                  <h3 style={{ margin: 0 }}>
                    {agendaFormularioAbierto
                      ? 'Pegar listado'
                      : 'Sesión abierta'}
                  </h3>
                  <p style={{ margin: '4px 0 0', color: '#666' }}>
                    Trabajo directo sin salto automático de pantalla.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setAgendaFormularioAbierto(false);
                    setAgendaSesionActivaId('');
                    setAgendaRecomendaciones([]);
                    setAgendaPestanaProceso('crear');
                  }}
                  style={botonSecundario}
                >
                  Cerrar
                </button>
              </div>

              {agendaFormularioAbierto && (
                <article
                  id="agenda-formulario-listado"
                  style={{ ...tarjetaResaltada, scrollMarginTop: 16 }}
                >
                  <h3 style={{ marginTop: 0 }}>Pegar listado de Aimharder</h3>
                  <p>
                    Día seleccionado:{' '}
                    <strong>{formatearFecha(agendaForm.fecha)}</strong>. Este
                    listado pertenece SOLO a la modalidad y turno que ves abajo.
                  </p>

                  <div style={gridFormulario}>
                    <label style={labelCampo}>
                      Modalidad
                      <select
                        value={agendaForm.modalidad}
                        onChange={(e) =>
                          setAgendaForm({
                            ...agendaForm,
                            modalidad: e.target.value,
                          })
                        }
                      >
                        <option value="BABY">Baby</option>
                        <option value="OCIO">Ocio</option>
                        <option value="INTENSIVOS">Intensivo</option>
                        <option value="PARTICULAR">Particular</option>
                      </select>
                    </label>
                    <label style={labelCampo}>
                      Hora inicio
                      <input
                        type="time"
                        value={agendaForm.hora_inicio}
                        onChange={(e) =>
                          setAgendaForm({
                            ...agendaForm,
                            hora_inicio: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label style={labelCampo}>
                      Hora fin
                      <input
                        type="time"
                        value={agendaForm.hora_fin}
                        onChange={(e) =>
                          setAgendaForm({
                            ...agendaForm,
                            hora_fin: e.target.value,
                          })
                        }
                      />
                    </label>
                    <label style={labelCampo}>
                      Lugar
                      <input
                        value={agendaForm.lugar}
                        onChange={(e) =>
                          setAgendaForm({
                            ...agendaForm,
                            lugar: e.target.value,
                          })
                        }
                      />
                    </label>
                  </div>

                  <label style={labelCampo}>
                    Listado del día
                    <textarea
                      id="agenda-textarea-listado"
                      value={agendaForm.texto_listado}
                      onChange={(e) =>
                        setAgendaForm({
                          ...agendaForm,
                          texto_listado: e.target.value,
                        })
                      }
                      placeholder="Pega aquí el listado de Aimharder..."
                      rows={8}
                    />
                  </label>

                  {String(agendaForm.modalidad || '').trim().toUpperCase() ===
                    'BABY' && (
                    <div style={{ display: 'grid', gap: 8, margin: '10px 0 12px' }}>
                      <button
                        type="button"
                        data-aimharder-native-button="1"
                        onClick={() =>
                          void traerListadoBabyTurnoAgendaDesdeAimHarder()
                        }
                        disabled={
                          babyAimHarderFormularioCargando ||
                          babyAimHarderCargandoSemana ||
                          Boolean(babyAimHarderSesionCargandoId)
                        }
                        style={{
                          ...botonPrincipal,
                          width: '100%',
                          background: '#6fb52b',
                          opacity:
                            babyAimHarderFormularioCargando ||
                            babyAimHarderCargandoSemana ||
                            Boolean(babyAimHarderSesionCargandoId)
                              ? 0.65
                              : 1,
                        }}
                      >
                        {babyAimHarderFormularioCargando
                          ? 'Consultando AimHarder…'
                          : 'Traer listado de AimHarder'}
                      </button>
                      <small style={{ color: '#64748b', lineHeight: 1.4 }}>
                        Usa el mismo lector que “Cargar semana Baby desde AimHarder”.
                        Al volcar se vuelve a comprobar el turno para no usar un listado antiguo.
                      </small>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={volcarListadoAgendaOperativa}
                      disabled={
                        cargando ||
                        babyAimHarderFormularioCargando ||
                        babyAimHarderCargandoSemana ||
                        Boolean(babyAimHarderSesionCargandoId)
                      }
                      style={{
                        ...botonPrincipal,
                        opacity:
                          cargando ||
                          babyAimHarderFormularioCargando ||
                          babyAimHarderCargandoSemana ||
                          Boolean(babyAimHarderSesionCargandoId)
                            ? 0.65
                            : 1,
                      }}
                    >
                      1 · Volcar listado y crear sesión
                    </button>
                    <button
                      onClick={() => setAgendaFormularioAbierto(false)}
                      style={botonSecundario}
                    >
                      Cancelar
                    </button>
                  </div>
                </article>
              )}

              {!agendaFormularioAbierto && agendaSesionActivaId && (
                <article
                  id="agenda-sesion-trabajo"
                  style={{ ...tarjetaResaltada, scrollMarginTop: 16 }}
                >
                  <h3 style={{ marginTop: 0 }}>Sesión seleccionada</h3>

                  {(() => {
                    const totalAlumnosGrupos = agendaGruposSesion.reduce(
                      (total, grupo) =>
                        total + Number(grupo.total_alumnos || 0),
                      0
                    );
                    const totalAlumnosOperativos =
                      agendaGruposSesion.length > 0
                        ? totalAlumnosGrupos
                        : agendaAlumnosSesion.length;

                    return (
                  <div style={gridMiniMetricas}>
                    <button
                      type="button"
                      style={{ ...miniMetrica, cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => {
                        setAgendaFiltroAlumnos('TODOS');
                        requestAnimationFrame(() => {
                          const detalle = document.getElementById('agenda-alumnos-detectados') as HTMLDetailsElement | null;
                          if (detalle) detalle.open = true;
                          detalle?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        });
                      }}
                    >
                      <strong>{totalAlumnosOperativos}</strong>
                      <span>alumnos en grupos</span>
                    </button>
                    <button
                      type="button"
                      style={{ ...miniMetrica, cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => {
                        setAgendaPestanaProceso('organizar');
                        requestAnimationFrame(() => {
                          document
                            .getElementById('agenda-grupos-creados')
                            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        });
                      }}
                    >
                      <strong>{agendaGruposSesion.length}</strong>
                      <span>grupos creados</span>
                    </button>
                    <button
                      type="button"
                      style={{ ...miniMetrica, cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => {
                        setAgendaFiltroAlumnos('NUEVO');
                        requestAnimationFrame(() => {
                          const detalle = document.getElementById('agenda-alumnos-detectados') as HTMLDetailsElement | null;
                          if (detalle) detalle.open = true;
                          detalle?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        });
                      }}
                    >
                      <strong>
                        {
                          agendaAlumnosSesion.filter(
                            (a) => a.estado_en_listado === 'PENDIENTE_TEST'
                          ).length
                        }
                      </strong>
                      <span>pendientes test</span>
                    </button>
                    <button
                      type="button"
                      style={{ ...miniMetrica, cursor: 'pointer', textAlign: 'left' }}
                      onClick={() => {
                        setAgendaFiltroAlumnos('CONOCIDO');
                        requestAnimationFrame(() => {
                          const detalle = document.getElementById('agenda-alumnos-detectados') as HTMLDetailsElement | null;
                          if (detalle) detalle.open = true;
                          detalle?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        });
                      }}
                    >
                      <strong>
                        {
                          agendaAlumnosSesion.filter(
                            (a) => a.estado_en_listado === 'CONOCIDO'
                          ).length
                        }
                      </strong>
                      <span>conocidos</span>
                    </button>
                    {agendaGruposSesion.length > 0 && (
                      <button
                        type="button"
                        style={{
                          ...miniMetrica,
                          cursor: 'pointer',
                          textAlign: 'left',
                          border: alumnosPendientesColocar.length
                            ? '1px solid #fdba74'
                            : miniMetrica.border,
                          background: alumnosPendientesColocar.length
                            ? '#fff7ed'
                            : miniMetrica.background,
                        }}
                        onClick={() => {
                          setAgendaPestanaProceso('crear');
                          setAgendaMostrarPendientesColocar(true);
                          requestAnimationFrame(() => {
                            document
                              .getElementById('agenda-pendientes-colocar')
                              ?.scrollIntoView({
                                behavior: 'smooth',
                                block: 'start',
                              });
                          });
                        }}
                      >
                        <strong
                          style={
                            alumnosPendientesColocar.length
                              ? { color: '#c2410c' }
                              : undefined
                          }
                        >
                          {alumnosPendientesColocar.length}
                        </strong>
                        <span>pendientes de colocar</span>
                      </button>
                    )}
                  </div>
                    );
                  })()}

                  <div
                    style={{
                      marginTop: 16,
                      padding: 6,
                      borderRadius: 16,
                      background: '#eef3f8',
                      border: '1px solid #dbe4ee',
                      display: 'grid',
                      gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                      gap: 6,
                    }}
                  >
                    {([
                      ['crear', '1', 'Crear grupos'],
                      ['organizar', '2', 'Organizar'],
                      ['publicar', '3', 'Publicar'],
                    ] as const).map(([clave, numero, etiqueta]) => {
                      const activa = agendaPestanaProceso === clave;
                      return (
                        <button
                          key={`agenda-paso-${clave}`}
                          type="button"
                          onClick={() => setAgendaPestanaProceso(clave)}
                          style={{
                            border: activa ? '1px solid #2563eb' : '1px solid transparent',
                            background: activa ? '#ffffff' : 'transparent',
                            color: activa ? '#0f172a' : '#64748b',
                            borderRadius: 12,
                            padding: esVistaMovilApp ? '9px 5px' : '10px 12px',
                            fontWeight: 900,
                            cursor: 'pointer',
                            boxShadow: activa ? '0 4px 12px rgba(37,99,235,.10)' : 'none',
                            minWidth: 0,
                          }}
                        >
                          <span
                            style={{
                              display: 'block',
                              fontSize: 10,
                              color: activa ? '#2563eb' : '#94a3b8',
                              marginBottom: 2,
                            }}
                          >
                            PASO {numero}
                          </span>
                          <span style={{ fontSize: esVistaMovilApp ? 12 : 13 }}>
                            {etiqueta}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      marginTop: 8,
                      padding: '9px 11px',
                      borderRadius: 11,
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#475569',
                      fontSize: 12,
                      fontWeight: 750,
                    }}
                  >
                    {agendaPestanaProceso === 'crear'
                      ? 'Recomienda, revisa la composición y crea los grupos. Entrenador y punto se completan después.'
                      : agendaPestanaProceso === 'organizar'
                      ? `${agendaGruposSesion.length} grupos · ${
                          agendaGruposSesion.filter((grupo) => Boolean(grupo.entrenador_id)).length
                        } con entrenador · ${
                          agendaGruposSesion.filter(
                            (grupo) =>
                              esNombreGrupoParticularApp(grupo.nombre_grupo) ||
                              Boolean(grupo.punto_encuentro)
                          ).length
                        } con punto preparado`
                      : `${
                          agendaGruposSesion.filter((grupo) => grupo.publicado).length
                        } publicados · ${
                          agendaGruposSesion.filter(
                            (grupo) =>
                              !grupo.publicado &&
                              Boolean(grupo.entrenador_id) &&
                              (esNombreGrupoParticularApp(grupo.nombre_grupo) ||
                                Boolean(grupo.punto_encuentro))
                          ).length
                        } listos para publicar`}
                  </div>

                  {agendaPestanaProceso === 'crear' && (
                    <>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                      flexWrap: 'wrap',
                      marginTop: 12,
                    }}
                  >
                    <strong>Alumnos de esta sesión</strong>
                    <button
                      type="button"
                      style={botonSecundario}
                      onClick={async () => {
                        const abrir = !mostrarAlumnoFueraPlazo;
                        setMostrarAlumnoFueraPlazo(abrir);
                        setRecomendacionesFueraPlazo([]);

                        if (abrir) {
                          try {
                            // Refrescar aquí el maestro real de alumnos.
                            // Antes este panel dependía de que "Fichas" se hubiera cargado
                            // previamente, por eso Bautista no aparecía como sugerencia.
                            const data = (await consultarSupabase(
                              'v_resumen_alumno_v2',
                              'select=*&order=alumno.asc'
                            )) as AlumnoResumen[];
                            setAlumnos(data);
                          } catch (err) {
                            setError(
                              err instanceof Error
                                ? err.message
                                : 'No se pudo cargar el maestro de alumnos.'
                            );
                          }

                          requestAnimationFrame(() =>
                            document
                              .getElementById('agenda-alumno-fuera-plazo')
                              ?.scrollIntoView({ behavior: 'smooth', block: 'start' })
                          );
                        }
                      }}
                    >
                      + Alumno fuera de plazo
                    </button>
                  </div>

                  {agendaGruposSesion.length > 0 &&
                    alumnosPendientesColocar.length > 0 && (
                      <section
                        id="agenda-pendientes-colocar"
                        style={{
                          ...avisoNeutral,
                          marginTop: 10,
                          border: '1px solid #fdba74',
                          background: '#fff7ed',
                          scrollMarginTop: 16,
                        }}
                      >
                        <div style={agendaCabeceraLinea}>
                          <div>
                            <strong>
                              Pendientes de colocar ·{' '}
                              {alumnosPendientesColocar.length}
                            </strong>
                            <p style={{ margin: '4px 0 0', color: '#9a3412' }}>
                              Están en el listado de esta sesión pero todavía
                              no están en ningún grupo creado.
                            </p>
                          </div>
                          <button
                            type="button"
                            style={botonMini}
                            onClick={() =>
                              setAgendaMostrarPendientesColocar(
                                (actual: boolean) => !actual
                              )
                            }
                          >
                            {agendaMostrarPendientesColocar
                              ? 'Ocultar'
                              : 'Ver'}
                          </button>
                        </div>

                        {agendaMostrarPendientesColocar && (
                          <div
                            style={{ display: 'grid', gap: 8, marginTop: 12 }}
                          >
                            {alumnosPendientesColocar.map((alumno) => (
                              <div
                                key={alumno.sesion_alumno_id}
                                style={agendaAlumnoLinea}
                              >
                                <div>
                                  <strong>{alumno.alumno}</strong>
                                  <p style={{ margin: '4px 0 0' }}>
                                    {alumno.estado_en_listado} · Nivel:{' '}
                                    <strong>
                                      {alumno.nivel_usado || 'SIN NIVEL'}
                                    </strong>
                                  </p>
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    gap: 8,
                                    flexWrap: 'wrap',
                                    justifyContent: 'flex-end',
                                  }}
                                >
                                  {alumno.estado_en_listado ===
                                  'PENDIENTE_TEST' ? (
                                    <button
                                      onClick={() =>
                                        abrirAltaTestDesdeAgenda(alumno)
                                      }
                                      style={botonPrincipal}
                                    >
                                      Crear Alta / Test
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() =>
                                        abrirBusquedaGrupoParaAlumnoPendiente(
                                          alumno
                                        )
                                      }
                                      style={botonPrincipal}
                                    >
                                      Buscar grupo (turno o semana)
                                    </button>
                                  )}
                                  <button
                                    onClick={() => quitarAlumnoAgenda(alumno)}
                                    style={botonPeligroMini}
                                  >
                                    Quitar sesión
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </section>
                    )}

                  {mostrarAlumnoFueraPlazo && (
                    <section
                      id="agenda-alumno-fuera-plazo"
                      style={{
                        ...avisoNeutral,
                        marginTop: 10,
                        border: '1px solid #bfdbfe',
                        background: '#f8fbff',
                        scrollMarginTop: 16,
                      }}
                    >
                      <div style={agendaCabeceraLinea}>
                        <div>
                          <strong>Analizar alumno fuera de plazo</strong>
                          <p style={{ margin: '4px 0 0', color: '#64748b' }}>
                            Primero recomienda. No añade ni mueve al niño todavía.
                          </p>
                        </div>
                        <button
                          type="button"
                          style={botonMini}
                          onClick={() => {
                            setMostrarAlumnoFueraPlazo(false);
                            setRecomendacionesFueraPlazo([]);
                          }}
                        >
                          Cerrar
                        </button>
                      </div>

                      <div style={{ ...gridFormulario, marginTop: 12 }}>
                        <label style={labelCampo}>
                          Nombre y apellidos
                          <div style={{ position: 'relative' }}>
                            <input
                              value={alumnoFueraPlazoNombre}
                              onChange={(e) => {
                                setAlumnoFueraPlazoNombre(e.target.value);
                                setAlumnoFueraPlazoNivel('');
                                setAlumnoFueraPlazoAlumnoId('');
                                setRecomendacionesFueraPlazo([]);
                              }}
                              placeholder="Ej. Mario Costa Fernández"
                              autoComplete="off"
                              style={{ width: '100%' }}
                            />
                            {alumnoFueraPlazoNombre.trim().length >= 1 && (() => {
                              const busqueda = normalizarNombreFueraPlazoAgenda(alumnoFueraPlazoNombre);
                              const sugerencias = alumnos
                                .filter((alumno) =>
                                  normalizarNombreFueraPlazoAgenda(alumno.alumno).startsWith(busqueda)
                                )
                                .slice(0, 6);
                              const nombreExacto = sugerencias.some(
                                (alumno) =>
                                  normalizarNombreFueraPlazoAgenda(alumno.alumno) === busqueda
                              );
                              if (!sugerencias.length || nombreExacto) return null;
                              return (
                                <div
                                  style={{
                                    position: 'absolute',
                                    zIndex: 30,
                                    top: 'calc(100% + 4px)',
                                    left: 0,
                                    right: 0,
                                    maxHeight: 210,
                                    overflowY: 'auto',
                                    border: '1px solid #cbd5e1',
                                    borderRadius: 10,
                                    background: '#fff',
                                    boxShadow: '0 10px 25px rgba(15, 23, 42, 0.12)',
                                    padding: 4,
                                  }}
                                >
                                  {sugerencias.map((alumno) => (
                                    <button
                                      key={`sugerencia-fuera-plazo-${alumno.alumno_id}`}
                                      type="button"
                                      style={{
                                        width: '100%',
                                        border: 0,
                                        background: 'transparent',
                                        padding: '9px 10px',
                                        borderRadius: 8,
                                        textAlign: 'left',
                                        fontWeight: 700,
                                        cursor: 'pointer',
                                      }}
                                      onClick={() => {
                                        const nivelFicha =
                                          buildMasterStudentProfile(alumno).level
                                            .level || '';
                                        setAlumnoFueraPlazoNombre(alumno.alumno);
                                        setAlumnoFueraPlazoNivel(nivelFicha);
                                        setAlumnoFueraPlazoAlumnoId(alumno.alumno_id);
                                        setRecomendacionesFueraPlazo([]);
                                        if (!nivelFicha) {
                                          setError(
                                            'La ficha seleccionada no tiene un nivel operativo válido; revísala antes de continuar.'
                                          );
                                        }
                                      }}
                                    >
                                      {alumno.alumno}
                                    </button>
                                  ))}
                                </div>
                              );
                            })()}
                          </div>
                        </label>
                        <label style={labelCampo}>
                          Nivel
                          <select
                            value={alumnoFueraPlazoNivel}
                            onChange={(e) => {
                              setAlumnoFueraPlazoNivel(e.target.value);
                              setRecomendacionesFueraPlazo([]);
                            }}
                          >
                            <option value="">Selecciona un nivel individual</option>
                            <option value="INICIACION">INICIACIÓN</option>
                            <option value="A">A</option>
                            <option value="A+">A+</option>
                            <option value="B">B</option>
                            <option value="B+">B+</option>
                            <option value="C">C</option>
                            <option value="C+">C+</option>
                            <option value="D">D</option>
                            <option value="D+">D+</option>
                          </select>
                        </label>
                      </div>

                      <button
                        type="button"
                        style={{ ...botonPrincipal, marginTop: 10 }}
                        disabled={analizandoFueraPlazo}
                        onClick={analizarEncajeAlumnoFueraPlazoAgenda}
                      >
                        {analizandoFueraPlazo ? 'Analizando…' : 'Analizar encaje'}
                      </button>

                      {errorIncorporacionFueraPlazo && (
                        <div style={{ marginTop: 10, padding: '10px 12px', border: '1px solid #fecaca', background: '#fff7f7', color: '#991b1b', borderRadius: 12, fontWeight: 700 }}>
                          <strong>No se ha podido añadir.</strong>
                          <div style={{ marginTop: 4 }}>{errorIncorporacionFueraPlazo}</div>
                        </div>
                      )}

                      {mensajeIncorporacionFueraPlazo && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: '10px 12px',
                            border: '1px solid #bbf7d0',
                            background: '#f0fdf4',
                            color: '#166534',
                            borderRadius: 12,
                            fontWeight: 700,
                          }}
                        >
                          {mensajeIncorporacionFueraPlazo}
                        </div>
                      )}

                      {recomendacionesFueraPlazo.length > 0 && (() => {
                        const opcionesTurnoActual = recomendacionesFueraPlazo.filter(
                          (opcion) => opcion.es_sesion_actual
                        );
                        const opcionesRecomendadasTurnoActual = opcionesTurnoActual.filter(
                          (opcion) => opcion.estado === 'RECOMENDADO'
                        );
                        const opcionesRevisionTurnoActual = opcionesTurnoActual.filter(
                          (opcion) => opcion.estado === 'REVISAR'
                        );

                        // Fuera del turno actual solo enseñamos alternativas que
                        // realmente ENCAJAN. Los NO_ENCAJA y REVISAR no aportan
                        // valor como propuesta de cambio de horario.
                        const alternativasValidas = recomendacionesFueraPlazo
                          .filter(
                            (opcion) =>
                              !opcion.es_sesion_actual &&
                              opcion.estado === 'RECOMENDADO'
                          )
                          .slice(0, 5);

                        const encajaEnTurnoActual =
                          opcionesRecomendadasTurnoActual.length > 0;
                        const requiereRevisionTurnoActual =
                          !encajaEnTurnoActual &&
                          opcionesRevisionTurnoActual.length > 0;

                        const renderOpcionFueraPlazo = (
                          opcion: RecomendacionFueraPlazoAgendaApp,
                          etiqueta?: string
                        ) => (
                          <article
                            key={`${opcion.sesion_id}-${opcion.grupo_id}`}
                            style={{
                              ...miniTarjetaBlanca,
                              border:
                                opcion.estado === 'RECOMENDADO'
                                  ? '1px solid #86efac'
                                  : '1px solid #fdba74',
                              background:
                                opcion.estado === 'RECOMENDADO' ? '#f0fdf4' : '#fff7ed',
                            }}
                          >
                            <div style={agendaGrupoLinea}>
                              <div>
                                <strong>
                                  {etiqueta ||
                                    `${etiquetaDiaFechaAgenda(opcion.fecha)} · ${opcion.hora_inicio?.slice(0, 5)}–${opcion.hora_fin?.slice(0, 5)}`}
                                </strong>
                                <p style={{ margin: '4px 0 0' }}>
                                  {opcion.grupo} · Nivel {opcion.nivel_grupo} · {opcion.pista}
                                </p>
                              </div>
                              <span
                                style={{
                                  ...agendaBadgeModalidad,
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {opcion.estado === 'RECOMENDADO' ? 'ENCAJA' : 'REVISAR'}
                              </span>
                            </div>
                            <p style={{ margin: '8px 0 0' }}>
                              <strong>{opcion.entrenador || 'Sin entrenador'}</strong> · Punto {opcion.punto} ·{' '}
                              {opcion.total_actual} → {opcion.total_final} niños
                            </p>
                            <p style={{ margin: '6px 0 0', color: '#475569' }}>{opcion.motivo}</p>

                            {opcion.estado !== 'NO_ENCAJA' && (
                              <button
                                type="button"
                                style={{
                                  ...botonPrincipal,
                                  marginTop: 10,
                                  width: '100%',
                                  ...(opcion.estado === 'REVISAR'
                                    ? {
                                        background: '#fff7ed',
                                        color: '#9a3412',
                                        border: '1px solid #fdba74',
                                      }
                                    : {}),
                                }}
                                disabled={incorporandoFueraPlazo}
                                onClick={() =>
                                  incorporarAlumnoFueraPlazoEnGrupo(opcion)
                                }
                              >
                                {incorporandoFueraPlazo
                                  ? 'Añadiendo…'
                                  : !opcion.es_sesion_actual
                                  ? 'Añadir a este turno'
                                  : opcion.estado === 'REVISAR'
                                  ? 'Añadir con revisión manual'
                                  : 'Añadir a este grupo'}
                              </button>
                            )}
                          </article>
                        );

                        return (
                          <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
                            <article
                              style={{
                                ...miniTarjetaBlanca,
                                border: encajaEnTurnoActual
                                  ? '2px solid #22c55e'
                                  : '2px solid #ef4444',
                                background: encajaEnTurnoActual ? '#f0fdf4' : '#fff7f7',
                              }}
                            >
                              <strong>
                                Este turno ·{' '}
                                {encajaEnTurnoActual
                                  ? 'SÍ HAY ENCAJE'
                                  : requiereRevisionTurnoActual
                                  ? 'REQUIERE REVISIÓN'
                                  : 'NO HAY ENCAJE'}
                              </strong>
                              <p style={{ margin: '5px 0 0', color: '#475569' }}>
                                {encajaEnTurnoActual
                                  ? 'Hay una opción compatible por nivel y ratio en el turno donde se ha apuntado.'
                                  : requiereRevisionTurnoActual
                                  ? 'En este turno solo hay una opción que requiere revisión manual. Debajo se buscan alternativas de la semana que sí encajen.'
                                  : 'No hay ningún grupo compatible por nivel y ratio en este turno. Debajo se buscan alternativas de la semana que sí encajen.'}
                              </p>
                            </article>

                            {opcionesRecomendadasTurnoActual.map((opcion) =>
                              renderOpcionFueraPlazo(opcion, 'Este turno')
                            )}

                            {opcionesRevisionTurnoActual.map((opcion) =>
                              renderOpcionFueraPlazo(opcion, 'Este turno · revisar')
                            )}

                            {alternativasValidas.length > 0 && (
                              <>
                                <strong style={{ marginTop: 4 }}>Otros turnos donde sí puede encajar</strong>
                                {alternativasValidas.map((opcion) =>
                                  renderOpcionFueraPlazo(opcion)
                                )}
                              </>
                            )}

                            {!encajaEnTurnoActual && alternativasValidas.length === 0 && (
                              <div style={avisoNeutral}>
                                No encuentro ningún grupo compatible en los turnos creados de esta semana.
                              </div>
                            )}

                            <div style={{ ...avisoNeutral, marginTop: 2 }}>

                            </div>
                          </div>
                        );
                      })()}
                    </section>
                  )}

                  <details id="agenda-alumnos-detectados" style={{ marginTop: 12, scrollMarginTop: 16 }}>
                    <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                      Alumnos detectados · editar niveles y fichas
                    </summary>
                    <div style={{ ...avisoNeutral, margin: '10px 0 12px' }}>
                      Si cambias un nivel aquí, se guarda como nivel real de la
                      ficha y se usa en toda la app.
                    </div>
                    {agendaFiltroAlumnos !== 'TODOS' && (
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 8,
                          margin: '0 0 10px',
                          flexWrap: 'wrap',
                        }}
                      >
                        <strong>
                          Mostrando: {agendaFiltroAlumnos === 'NUEVO' ? 'nuevos pendientes de Altas/Test' : 'alumnos conocidos'}
                        </strong>
                        <button
                          type="button"
                          style={botonMini}
                          onClick={() => setAgendaFiltroAlumnos('TODOS')}
                        >
                          Ver todos
                        </button>
                      </div>
                    )}
                    <div style={{ display: 'grid', gap: 8 }}>
                      {agendaAlumnosSesion
                        .filter(
                          (alumno) =>
                            agendaFiltroAlumnos === 'TODOS' ||
                            (agendaFiltroAlumnos === 'NUEVO'
                              ? alumno.estado_en_listado === 'PENDIENTE_TEST'
                              : alumno.estado_en_listado === agendaFiltroAlumnos)
                        )
                        .map((alumno) => (
                        <div
                          key={alumno.sesion_alumno_id}
                          style={agendaAlumnoLinea}
                        >
                          <div>
                            <strong>{alumno.alumno}</strong>
                            <p style={{ margin: '4px 0 0' }}>
                              {alumno.estado_en_listado} · Nivel:{' '}
                              <strong>
                                {alumno.nivel_usado || 'SIN NIVEL'}
                              </strong>{' '}
                              · {alumno.origen_nivel || '-'} · Pista{' '}
                              {alumno.pista_recomendada || '-'}
                            </p>
                            {alumno.estado_en_listado === 'PENDIENTE_TEST' &&
                              (() => {
                                const datosAimHarder =
                                  datosAimHarderAlumnoAgenda(alumno);
                                if (!datosAimHarder) return null;

                                const datos = [
                                  datosAimHarder.fechaNacimiento
                                    ? `Nacimiento ${formatearFecha(
                                        datosAimHarder.fechaNacimiento
                                      )}`
                                    : 'Nacimiento no disponible',
                                  datosAimHarder.telefono
                                    ? `Tel. ${datosAimHarder.telefono}`
                                    : 'Teléfono no disponible',
                                ];

                                return (
                                  <p
                                    style={{
                                      margin: '5px 0 0',
                                      color:
                                        datosAimHarder.fechaNacimiento &&
                                        datosAimHarder.telefono
                                          ? '#166534'
                                          : '#92400e',
                                      fontWeight: 800,
                                    }}
                                  >
                                    AimHarder · {datos.join(' · ')}
                                  </p>
                                );
                              })()}
                          </div>
                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              flexWrap: 'wrap',
                              justifyContent: 'flex-end',
                              alignItems: 'center',
                              maxWidth: 560,
                            }}
                          >
                            {alumno.estado_en_listado === 'PENDIENTE_TEST' ? (
                              <>
                                <button
                                  onClick={() => abrirAltaTestDesdeAgenda(alumno)}
                                  style={botonPrincipal}
                                >
                                  Crear Alta / Test
                                </button>
                                <button
                                  onClick={() => quitarAlumnoAgenda(alumno)}
                                  style={botonPeligroMini}
                                >
                                  Quitar sesión
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() =>
                                    abrirFichaAlumnoDesdeAgenda(
                                      alumno.alumno_id,
                                      alumno.alumno
                                    )
                                  }
                                  style={botonMini}
                                >
                                  Ver ficha
                                </button>
                                <button
                                  onClick={() => {
                                    const ficha = alumnos.find(
                                      (item) => item.alumno_id === alumno.alumno_id
                                    );
                                    const hrefWhatsapp =
                                      hrefWhatsappAlumnoResumenDia(
                                        String(ficha?.telefono || '')
                                      );

                                    if (!hrefWhatsapp) {
                                      setError(
                                        `${alumno.alumno} no tiene un teléfono válido en su ficha.`
                                      );
                                      return;
                                    }

                                    window.open(
                                      hrefWhatsapp,
                                      '_blank',
                                      'noopener,noreferrer'
                                    );
                                  }}
                                  style={botonMini}
                                >
                                  WhatsApp familia
                                </button>
                                <button
                                  onClick={() => quitarAlumnoAgenda(alumno)}
                                  style={botonPeligroMini}
                                >
                                  Quitar sesión
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>

                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                      marginTop: 16,
                    }}
                  >
                    <button
                      onClick={() =>
                        generarRecomendacionAgendaSesion(agendaSesionActivaId)
                      }
                      style={botonPrincipal}
                    >
                      Generar grupos recomendados
                    </button>
                    <button
                      onClick={crearGrupoManualAgenda}
                      style={botonSecundario}
                    >
                      Crear grupo manual vacío
                    </button>
                    {agendaGruposSesion.length > 0 && (
                      <button
                        onClick={copiarMensajeWhatsAppPapisSesionActual}
                        style={botonSecundario}
                      >
                        Ver WhatsApp papis
                      </button>
                    )}
                  </div>

                  {gruposAgendaManuales.length > 0 && (
                    <div style={{ ...avisoNeutral, marginTop: 12 }}>
                      <strong>Grupos manuales preparados:</strong>
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          flexWrap: 'wrap',
                          marginTop: 8,
                        }}
                      >
                        {gruposAgendaManuales.map((grupoManual) => (
                          <span
                            key={`chip-manual-agenda-${grupoManual}`}
                            style={agendaBadgeModalidad}
                          >
                            {grupoManual}
                          </span>
                        ))}
                      </div>
                      <p style={{ margin: '8px 0 0' }}>
                        Ahora en la propuesta usa “Mover a” para mandar alumnos
                        a esos grupos. Si no ves alumnos debajo, pulsa “Generar
                        grupos recomendados”.
                      </p>
                    </div>
                  )}

                  {gruposRecomendadosAgenda().length > 0 && (
                    <section
                      id="agenda-propuesta-grupos"
                      style={{ marginTop: 16 }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 10,
                          flexWrap: 'wrap',
                          alignItems: 'center',
                          marginBottom: 10,
                        }}
                      >
                        <div>
                          <h4 style={{ margin: 0 }}>
                            Paso 1 · Revisar recomendación y crear grupos
                          </h4>
                          {buscandoAlternativasBaby && (
                            <small style={{ color: '#64748b', fontWeight: 700 }}>
                              Revisando también otros días y turnos de esta semana…
                            </small>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={crearTodosGruposAgendaDesdeRecomendacion}
                          style={botonPrincipal}
                          disabled={cargando}
                        >
                          Crear grupos propuestos
                        </button>
                      </div>
                      <div style={{ display: 'grid', gap: 12 }}>
                        {gruposRecomendadosAgenda().map(
                          ([nombreGrupo, alumnosGrupo], indiceGrupoAgenda) => {
                            const primero = alumnosGrupo[0];
                            const trabajoAuto =
                              trabajoAgendaGrupo[nombreGrupo] ||
                              trabajoDiarioAutomaticoAgenda(
                                nombreGrupo,
                                alumnosGrupo
                              );
                            const esParticular =
                              esGrupoParticularAgenda(nombreGrupo);
                            const nombreGrupoVisible = esParticular
                              ? nombreGrupo
                              : nombreGrupoPropuestaApp(
                                  alumnosGrupo,
                                  indiceGrupoAgenda
                                );
                            const observacionesAutoGrupo =
                              observacionesAutomaticasGrupoAgenda(alumnosGrupo);
                            const validacionPedagogicaGrupo =
                              textoValidacionPedagogicaGrupoApp(alumnosGrupo);

                            return (
                              <article
                                key={nombreGrupo}
                                style={{
                                  ...agendaGrupoPropuesta,
                                  ...estiloGrupoPorPistaApp({
                                    pista: primero.pista_recomendada,
                                    nivel_grupo: primero.nivel_resumen,
                                  }),
                                }}
                              >
                                <div style={agendaGrupoLinea}>
                                  <h3 style={{ margin: 0 }}>
                                    {nombreGrupoVisible}
                                  </h3>
                                  <span>{alumnosGrupo.length} niños</span>
                                </div>
                                <p>
                                  <strong>Bloque:</strong>{' '}
                                  {primero.bloque_tecnico} ·{' '}
                                  <strong>Pista:</strong>{' '}
                                  {primero.pista_recomendada}
                                </p>
                                {esParticular ? (
                                  <div
                                    style={{
                                      ...avisoNeutral,
                                      marginBottom: 10,
                                      padding: '9px 11px',
                                    }}
                                  >
                                    <strong>PARTICULAR · 1 alumno</strong>
                                    <span style={{ marginLeft: 6 }}>
                                      Sin ratio Baby · encuentro CON JOSE
                                    </span>
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      ...estiloValidacionPedagogicaApp(
                                        validacionPedagogicaGrupo.estado
                                      ),
                                      marginBottom: 10,
                                    }}
                                  >
                                    <strong>
                                      {validacionPedagogicaGrupo.titulo}
                                    </strong>
                                    {validacionPedagogicaGrupo.mensajes.length >
                                      0 && (
                                      <ul
                                        style={{
                                          margin: '6px 0 0',
                                          paddingLeft: 18,
                                        }}
                                      >
                                        {validacionPedagogicaGrupo.mensajes.map(
                                          (mensaje) => (
                                            <li key={`${nombreGrupo}-${mensaje}`}>
                                              {mensaje}
                                            </li>
                                          )
                                        )}
                                      </ul>
                                    )}
                                  </div>
                                )}
                                <div
                                  style={{
                                    display: 'grid',
                                    gap: 8,
                                    marginBottom: 12,
                                  }}
                                >
                                  {alumnosGrupo.map((alumno) => {
                                    const perfilBaby =
                                      perfilOperativoAlumnoApp(
                                        alumno.alumno_id
                                      );
                                    const explicacionBaby =
                                      explicacionCompactaPropuestaBabyApp(
                                        alumno
                                      );

                                    return (
                                    <div
                                      key={`${nombreGrupo}-${alumno.alumno_id}`}
                                      style={{
                                        ...agendaAlumnoLinea,
                                        minWidth: 0,
                                        display: 'grid',
                                        gridTemplateColumns: esVistaMovilApp
                                          ? 'minmax(0, 1fr)'
                                          : 'minmax(0, 1fr) minmax(200px, 240px)',
                                        alignItems: 'start',
                                        gap: esVistaMovilApp ? 10 : 12,
                                      }}
                                    >
                                      <div
                                        style={{
                                          minWidth: 0,
                                          overflowWrap: 'anywhere',
                                        }}
                                      >
                                        <button
                                          type="button"
                                          onClick={() =>
                                            abrirFichaAlumnoDesdeAgenda(
                                              alumno.alumno_id,
                                              alumno.alumno
                                            )
                                          }
                                          title="Abrir ficha y contacto de la familia"
                                          style={{
                                            border: 0,
                                            padding: 0,
                                            background: 'transparent',
                                            color: '#0f172a',
                                            font: 'inherit',
                                            fontWeight: 900,
                                            textAlign: 'left',
                                            cursor: 'pointer',
                                            textDecoration: 'underline',
                                            textDecorationColor: '#93c5fd',
                                            textUnderlineOffset: 3,
                                          }}
                                        >
                                          {alumno.alumno}
                                        </button>
                                        <p
                                          style={{
                                            margin: '4px 0 0',
                                            overflowWrap: 'anywhere',
                                          }}
                                        >
                                          {alumno.nivel_resumen} ·{' '}
                                          {alumno.pista_alumno ||
                                            alumno.pista_recomendada ||
                                            '-'}
                                          {perfilBaby?.edad_aprox !== null &&
                                          perfilBaby?.edad_aprox !== undefined
                                            ? ` · ${perfilBaby.edad_aprox} años`
                                            : ''}
                                        </p>
                                        {explicacionBaby && (
                                          <p
                                            style={{
                                              margin: '3px 0 0',
                                              fontSize: 11,
                                              lineHeight: 1.25,
                                              color: '#64748b',
                                              fontWeight: 700,
                                              overflowWrap: 'anywhere',
                                            }}
                                          >
                                            {explicacionBaby}
                                          </p>
                                        )}
                                      </div>
                                      <label
                                        style={{
                                          ...labelCampo,
                                          minWidth: esVistaMovilApp ? 0 : 220,
                                          width: esVistaMovilApp
                                            ? '100%'
                                            : undefined,
                                          maxWidth: '100%',
                                        }}
                                      >
                                        Mover a
                                        <select
                                          value={valorSelectorDestinoAlumnoAgenda(
                                            alumno
                                          )}
                                          onChange={(e) =>
                                            moverAlumnoAgendaRecomendado(
                                              alumno.alumno_id,
                                              e.target.value
                                            )
                                          }
                                          style={{
                                            ...selectCampo,
                                            width: '100%',
                                            minWidth: 0,
                                            minHeight: 42,
                                            height: 42,
                                          }}
                                        >
                                          {nombresGruposAgendaBase().map(
                                            (grupoDestino) => (
                                              <option
                                                key={`${alumno.alumno_id}-${grupoDestino}`}
                                                value={grupoDestino}
                                              >
                                                {grupoDestino}
                                              </option>
                                            )
                                          )}
                                          <option value="__PARTICULAR__">
                                            Mover a particular · CON JOSE
                                          </option>
                                          <option value="__NO_CREAR__">
                                            Dejar fuera de momento
                                          </option>
                                        </select>
                                      </label>

                                      {!esParticular &&
                                        Object.prototype.hasOwnProperty.call(
                                          alternativasBabyLocales,
                                          alumno.alumno_id
                                        ) && (
                                        <div
                                          style={{
                                            width: '100%',
                                            gridColumn: '1 / -1',
                                            marginTop: 2,
                                            padding: esVistaMovilApp ? 10 : 12,
                                            borderRadius: 12,
                                            border: '1px solid #fdba74',
                                            background: '#fff7ed',
                                            color: '#9a3412',
                                          }}
                                        >
                                          <strong>
                                            ⚠️ Revisión manual necesaria
                                          </strong>

                                          {buscandoAlternativasBaby ? (
                                            <p style={{ margin: '5px 0 0' }}>
                                              Buscando otros días y turnos compatibles
                                              de esta semana...
                                            </p>
                                          ) : alternativasBabyLocales[
                                              alumno.alumno_id
                                            ]?.length > 0 ? (
                                            <>
                                              <p
                                                style={{
                                                  margin: '5px 0 8px',
                                                  color: '#7c2d12',
                                                }}
                                              >
                                                Mítico recomienda consultar con la
                                                familia alguno de estos cambios. No se
                                                mueve al niño automáticamente.
                                              </p>

                                              <div
                                                style={{
                                                  display: 'grid',
                                                  gap: 7,
                                                }}
                                              >
                                                {alternativasBabyLocales[
                                                  alumno.alumno_id
                                                ]
                                                  .slice(0, 3)
                                                  .map((opcion) => (
                                                    <div
                                                      key={`${alumno.alumno_id}-${opcion.sesion_id}-${opcion.grupo_id || opcion.grupo}`}
                                                      style={{
                                                        padding: 9,
                                                        borderRadius: 10,
                                                        background: '#ffffff',
                                                        border:
                                                          '1px solid #fed7aa',
                                                        color: '#431407',
                                                      }}
                                                    >
                                                      <strong>
                                                        {etiquetaDiaFechaAgenda(opcion.fecha)} ·{' '}
                                                        {opcion.hora_inicio.slice(
                                                          0,
                                                          5
                                                        )}
                                                        –
                                                        {opcion.hora_fin.slice(0, 5)}
                                                      </strong>
                                                      <div
                                                        style={{
                                                          marginTop: 4,
                                                          display: 'flex',
                                                          gap: 6,
                                                          flexWrap: 'wrap',
                                                        }}
                                                      >
                                                        {opcion.mismo_dia && (
                                                          <span style={{ fontSize: 11, fontWeight: 900, color: '#166534' }}>
                                                            MISMO DÍA
                                                          </span>
                                                        )}
                                                        {opcion.kind === 'PROPOSAL' && (
                                                          <span style={{ fontSize: 11, fontWeight: 900, color: '#1d4ed8' }}>
                                                            GRUPO PROPUESTO
                                                          </span>
                                                        )}
                                                      </div>
                                                      <div
                                                        style={{
                                                          marginTop: 3,
                                                          fontSize: 13,
                                                        }}
                                                      >
                                                        {opcion.grupo} · Nivel{' '}
                                                        {opcion.nivel_grupo} ·{' '}
                                                        {opcion.pista} ·{' '}
                                                        {opcion.total_actual} →{' '}
                                                        {opcion.total_final} niños
                                                      </div>
                                                      <div
                                                        style={{
                                                          marginTop: 3,
                                                          fontSize: 12,
                                                          color: '#7c2d12',
                                                        }}
                                                      >
                                                        {opcion.motivo}
                                                      </div>
                                                      <button
                                                        type="button"
                                                        disabled={
                                                          cargando ||
                                                          moviendoAlumnoTurnoId === alumno.alumno_id
                                                        }
                                                        onClick={() =>
                                                          void moverAlumnoAlternativaBaby(
                                                            alumno,
                                                            opcion
                                                          )
                                                        }
                                                        style={{
                                                          ...botonPrincipal,
                                                          marginTop: 8,
                                                          width: '100%',
                                                        }}
                                                      >
                                                        {moviendoAlumnoTurnoId === alumno.alumno_id
                                                          ? 'Moviendo…'
                                                          : 'Padres OK · mover a este turno'}
                                                      </button>
                                                    </div>
                                                  ))}
                                              </div>
                                            </>
                                          ) : (
                                            <p style={{ margin: '5px 0 0' }}>
                                              No hay otro turno compatible esta semana.
                                            </p>
                                          )}
                                        </div>
                                      )}
                                    </div>
                                    );
                                  })}
                                </div>

                                {esParticular ? (
                                  <div style={gridFormulario}>
                                    <label style={labelCampo}>
                                      Entrenador del particular
                                      <select
                                        value={entrenadoresAgendaGrupo[nombreGrupo] || ''}
                                        onChange={(e) =>
                                          setEntrenadoresAgendaGrupo({
                                            ...entrenadoresAgendaGrupo,
                                            [nombreGrupo]: e.target.value,
                                          })
                                        }
                                      >
                                        <option value="">Selecciona entrenador</option>
                                        {entrenadoresDisponiblesSesionActiva().map(
                                          (entrenador) => (
                                            <option
                                              key={`${nombreGrupo}-particular-${entrenador.entrenador_id}`}
                                              value={entrenador.entrenador_id}
                                            >
                                              {entrenador.nombre_completo}
                                            </option>
                                          )
                                        )}
                                      </select>
                                    </label>
                                    <div
                                      style={{
                                        ...labelCampo,
                                        padding: '10px 12px',
                                        border: '1px solid #bfdbfe',
                                        borderRadius: 12,
                                        background: '#eff6ff',
                                        color: '#1e3a8a',
                                      }}
                                    >
                                      Encuentro
                                      <strong style={{ fontSize: 15 }}>CON JOSE</strong>
                                    </div>
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      ...avisoNeutral,
                                      marginBottom: 10,
                                      fontSize: 13,
                                      fontWeight: 750,
                                    }}
                                  >
                                    Primero revisa la composición y crea el grupo. Entrenador, apoyo y punto de encuentro se asignan después desde el grupo creado.
                                  </div>
                                )}

                                {necesitaDosEntrenadoresGrupoApp(
                                  alumnosGrupo
                                ) && (
                                  <div
                                    style={{
                                      ...(entrenadoresApoyoAgendaGrupo[
                                        nombreGrupo
                                      ]
                                        ? avisoCompleto
                                        : avisoPendiente),
                                      marginBottom: 10,
                                    }}
                                  >
                                    {textoNecesidadDosEntrenadoresApp(
                                      alumnosGrupo,
                                      Boolean(
                                        entrenadoresApoyoAgendaGrupo[
                                          nombreGrupo
                                        ]
                                      )
                                    )}
                                  </div>
                                )}

                                {entrenadoresAgendaGrupo[nombreGrupo] &&
                                  entrenadoresApoyoAgendaGrupo[nombreGrupo] && (
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
                                        Reparto de reportes / niños
                                      </summary>
                                      <div
                                        style={{
                                          display: 'grid',
                                          gap: 8,
                                          marginTop: 10,
                                        }}
                                      >
                                        {alumnosGrupo.map(
                                          (alumno, indiceAlumnoReparto) => (
                                            <label
                                              key={`${nombreGrupo}-resp-${alumno.alumno_id}`}
                                              style={labelCampo}
                                            >
                                              {alumno.alumno}
                                              <select
                                                value={responsableReporteAgendaApp(
                                                  nombreGrupo,
                                                  alumno.alumno_id,
                                                  indiceAlumnoReparto,
                                                  entrenadoresAgendaGrupo[
                                                    nombreGrupo
                                                  ],
                                                  entrenadoresApoyoAgendaGrupo[
                                                    nombreGrupo
                                                  ]
                                                )}
                                                onChange={(e) =>
                                                  setResponsablesReporteAgendaGrupo(
                                                    {
                                                      ...responsablesReporteAgendaGrupo,
                                                      [`${nombreGrupo}__${alumno.alumno_id}`]:
                                                        e.target.value,
                                                    }
                                                  )
                                                }
                                              >
                                                <option
                                                  value={
                                                    entrenadoresAgendaGrupo[
                                                      nombreGrupo
                                                    ]
                                                  }
                                                >
                                                  {entrenadores.find(
                                                    (entrenador) =>
                                                      entrenador.entrenador_id ===
                                                      entrenadoresAgendaGrupo[
                                                        nombreGrupo
                                                      ]
                                                  )?.nombre_completo ||
                                                    'Entrenador 1'}
                                                </option>
                                                <option
                                                  value={
                                                    entrenadoresApoyoAgendaGrupo[
                                                      nombreGrupo
                                                    ]
                                                  }
                                                >
                                                  {entrenadores.find(
                                                    (entrenador) =>
                                                      entrenador.entrenador_id ===
                                                      entrenadoresApoyoAgendaGrupo[
                                                        nombreGrupo
                                                      ]
                                                  )?.nombre_completo ||
                                                    'Entrenador 2'}
                                                </option>
                                              </select>
                                            </label>
                                          )
                                        )}
                                      </div>
                                    </details>
                                  )}

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
                                      value={trabajoAuto}
                                      onChange={(e) =>
                                        setTrabajoAgendaGrupo({
                                          ...trabajoAgendaGrupo,
                                          [nombreGrupo]: e.target.value,
                                        })
                                      }
                                      rows={4}
                                      style={{ width: '100%', boxSizing: 'border-box' }}
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
                                      style={{ width: '100%', boxSizing: 'border-box' }}
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
                                      value={observacionesAgendaGrupo[nombreGrupo] || ''}
                                      onChange={(e) =>
                                        setObservacionesAgendaGrupo({
                                          ...observacionesAgendaGrupo,
                                          [nombreGrupo]: e.target.value,
                                        })
                                      }
                                      rows={3}
                                      style={{ width: '100%', boxSizing: 'border-box' }}
                                    />
                                  </label>
                                </details>
                                <button
                                  onClick={() =>
                                    crearGrupoAgendaDesdeRecomendacion(
                                      nombreGrupo,
                                      alumnosGrupo,
                                      nombreGrupoVisible
                                    )
                                  }
                                  style={botonPrincipal}
                                >
                                  Crear grupo
                                </button>
                              </article>
                            );
                          }
                        )}
                      </div>
                    </section>
                  )}

                    </>
                  )}

                  {agendaPestanaProceso !== 'crear' && agendaGruposSesion.length === 0 && (
                    <div
                      style={{
                        marginTop: 16,
                        padding: 18,
                        borderRadius: 14,
                        border: '1px dashed #cbd5e1',
                        background: '#f8fafc',
                        color: '#64748b',
                        fontWeight: 800,
                        textAlign: 'center',
                      }}
                    >
                      Todavía no hay grupos creados. Vuelve a “Crear grupos” y crea la propuesta que quieras usar.
                    </div>
                  )}

                  {agendaPestanaProceso !== 'crear' && agendaGruposSesion.length > 0 && (
                    <section id="agenda-grupos-creados" style={{ marginTop: 16, scrollMarginTop: 16 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          gap: 10,
                          flexWrap: 'wrap',
                          marginBottom: 10,
                        }}
                      >
                        <h4 style={{ margin: 0 }}>
                          {agendaPestanaProceso === 'organizar'
                            ? '2 · Organizar grupos'
                            : '3 · Publicar al entrenador'}
                        </h4>
                        <span style={{ color: '#64748b', fontSize: 12, fontWeight: 800 }}>
                          {agendaGruposSesion.length} {agendaGruposSesion.length === 1 ? 'grupo' : 'grupos'}
                        </span>
                      </div>
                      <div style={{ display: 'grid', gap: 10 }}>
                        {agendaGruposSesion.map((grupo, indiceGrupoCreado) => (
                          <article
                            key={grupo.grupo_id}
                            style={{
                              ...estiloGrupoPorPistaApp(grupo),
                              boxShadow: '0 10px 24px rgba(52, 81, 135, 0.08)',
                              borderRadius: 16,
                            }}
                          >
                            <div style={agendaGrupoLinea}>
                              <strong>
                                {nombreGrupoVisualApp(grupo, indiceGrupoCreado)}
                              </strong>
                              <span>
                                {nombresEntrenadoresDelGrupo(
                                  grupo.grupo_id,
                                  grupo.entrenador
                                )} ·{' '}
                                {grupo.total_alumnos} niños ·{' '}
                                {grupo.publicado
                                  ? 'Publicado'
                                  : agendaPestanaProceso === 'organizar'
                                  ? 'En preparación'
                                  : grupo.entrenador_id &&
                                    (esNombreGrupoParticularApp(grupo.nombre_grupo) ||
                                      Boolean(grupo.punto_encuentro))
                                  ? 'Listo para publicar'
                                  : 'Pendiente'}
                              </span>
                            </div>
                            <p>
                              <span style={estiloBadgePistaApp(grupo.pista)}>
                                {etiquetaPistaVisualApp(grupo.pista)}
                              </span>{' '}
                              · {esNombreGrupoParticularApp(grupo.nombre_grupo)
                                ? 'CON JOSE'
                                : `Punto ${grupo.punto_encuentro || '-'}`}
                            </p>
                            {grupo.alumnos_lista && (
                              <div
                                style={{
                                  display:
                                    agendaPestanaProceso === 'publicar' ? 'none' : 'grid',
                                  gap: 7,
                                  marginTop: 10,
                                }}
                              >
                                {grupo.alumnos_lista
                                  .split(' || ')
                                  .map((alumnoGrupo, indice) => {
                                    const nombreNormalizado = normalizarNombreAlumnoAgendaApp(alumnoGrupo);
                                    const alumnoSesion = agendaAlumnosSesion.find(
                                      (alumno) =>
                                        normalizarNombreAlumnoAgendaApp(alumno.alumno) === nombreNormalizado
                                    );

                                    const contextoIntensivo =
                                      contextoIntensivoSesionAgenda(grupo.sesion_id);
                                    const asistenciaIntensivo = alumnoSesion
                                      ? asistenciaAlumnoIntensivoAgenda(
                                          grupo,
                                          alumnoSesion.alumno_id
                                        )
                                      : null;
                                    const noVieneIntensivo = [
                                      'NO_PRESENTADO',
                                      'BAJA_AVISADA',
                                    ].includes(
                                      asistenciaIntensivo?.estado || ''
                                    );

                                    return (
                                      <div
                                        key={`${grupo.grupo_id}-${indice}`}
                                        style={{
                                          display: 'grid',
                                          gridTemplateColumns: esVistaMovilApp
                                            ? 'minmax(0, 1fr)'
                                            : 'minmax(0, 1fr) minmax(250px, 360px)',
                                          gap: 8,
                                          alignItems: 'center',
                                          padding: '8px 10px',
                                          border: '1px solid #e2e8f0',
                                          borderRadius: 11,
                                          background: '#fff',
                                          minWidth: 0,
                                        }}
                                      >
                                        <strong style={{ minWidth: 0, overflowWrap: 'anywhere' }}>
                                          {formatearAlumnoListadoOperativo(alumnoGrupo)}
                                        </strong>

                                        {alumnoSesion && (
                                          <div
                                            style={{
                                              display: 'grid',
                                              gap: 7,
                                              minWidth: 0,
                                            }}
                                          >
                                            {contextoIntensivo && (
                                              <div
                                                style={{
                                                  display: 'flex',
                                                  gap: 6,
                                                  flexWrap: 'wrap',
                                                  alignItems: 'center',
                                                }}
                                              >
                                                <span
                                                  style={{
                                                    fontSize: 12,
                                                    fontWeight: 900,
                                                    color: noVieneIntensivo
                                                      ? '#b91c1c'
                                                      : asistenciaIntensivo?.estado ===
                                                        'PRESENTE'
                                                      ? '#166534'
                                                      : '#475569',
                                                  }}
                                                >
                                                  {noVieneIntensivo
                                                    ? 'No viene · recuperación'
                                                    : asistenciaIntensivo?.estado ===
                                                      'PRESENTE'
                                                    ? 'Presente'
                                                    : asistenciaIntensivo?.estado ===
                                                      'LLEGA_TARDE'
                                                    ? 'Llega tarde'
                                                    : 'Previsto · asistencia pendiente'}
                                                </span>

                                                {asistenciaIntensivo?.estado !==
                                                  'PRESENTE' &&
                                                  asistenciaIntensivo?.estado !==
                                                    'LLEGA_TARDE' && (
                                                    <button
                                                      type="button"
                                                      disabled={cargando}
                                                      onClick={() =>
                                                        noVieneIntensivo
                                                          ? void restaurarVieneIntensivoDesdeAgenda(
                                                              alumnoSesion,
                                                              grupo
                                                            )
                                                          : void marcarNoVieneIntensivoDesdeAgenda(
                                                              alumnoSesion,
                                                              grupo
                                                            )
                                                      }
                                                      style={
                                                        noVieneIntensivo
                                                          ? botonSecundario
                                                          : botonPeligro
                                                      }
                                                    >
                                                      {noVieneIntensivo
                                                        ? 'Vuelve a venir'
                                                        : 'No viene'}
                                                    </button>
                                                  )}
                                              </div>
                                            )}

                                            {agendaGruposSesion.length > 1 && (
                                              <label
                                                style={{
                                                  ...labelCampo,
                                                  margin: 0,
                                                  minWidth: 0,
                                                  fontSize: 12,
                                                }}
                                              >
                                                Cambiar de grupo
                                                <select
                                                  value=""
                                                  disabled={cargando}
                                                  onChange={(e) => {
                                                    const destino =
                                                      e.target.value;
                                                    if (destino) {
                                                      void moverAlumnoEntreGruposAgenda(
                                                        alumnoSesion,
                                                        grupo,
                                                        destino
                                                      );
                                                    }
                                                  }}
                                                  style={{
                                                    ...selectCampo,
                                                    width: '100%',
                                                    minWidth: 0,
                                                    padding: '7px 9px',
                                                  }}
                                                >
                                                  <option value="">
                                                    Elegir grupo destino…
                                                  </option>
                                                  {agendaGruposSesion
                                                    .filter(
                                                      (destino) =>
                                                        destino.grupo_id !==
                                                        grupo.grupo_id
                                                    )
                                                    .map(
                                                      (
                                                        destino,
                                                        indiceDestino
                                                      ) => (
                                                        <option
                                                          key={`${grupo.grupo_id}-${alumnoSesion.alumno_id}-destino-${destino.grupo_id}`}
                                                          value={
                                                            destino.grupo_id
                                                          }
                                                        >
                                                          {nombreGrupoVisualApp(
                                                            destino,
                                                            indiceDestino
                                                          )}{' '}
                                                          ·{' '}
                                                          {
                                                            destino.total_alumnos
                                                          }{' '}
                                                          niños
                                                        </option>
                                                      )
                                                    )}
                                                </select>
                                              </label>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                              </div>
                            )}
                            <details
                              id={`agenda-trabajo-grupo-${grupo.grupo_id}`}
                              style={{
                                ...panelTrabajoGrupo,
                                display:
                                  agendaPestanaProceso === 'organizar' ? 'block' : 'none',
                              }}
                            >
                              <summary
                                style={{
                                  ...summaryTrabajoGrupo,
                                  border: '1px solid #d8e5f7',
                                  background:
                                    'linear-gradient(90deg, #f9fbff 0%, #f1f6ff 100%)',
                                  borderRadius: 13,
                                  padding: '10px 12px',
                                }}
                              >
                                Trabajo diario y observaciones
                              </summary>
                              <div
                                style={{
                                  display: 'grid',
                                  gap: 10,
                                  marginTop: 12,
                                }}
                              >
                                {contextoIntensivoSesionAgenda(
                                  grupo.sesion_id
                                ) && (
                                  <div
                                    style={{
                                      display: 'flex',
                                      gap: 8,
                                      flexWrap: 'wrap',
                                      alignItems: 'center',
                                      justifyContent: 'space-between',
                                      padding: '9px 10px',
                                      border: '1px solid #dbeafe',
                                      borderRadius: 11,
                                      background: '#f8fbff',
                                    }}
                                  >
                                    <span
                                      style={{
                                        fontSize: 12,
                                        color: '#475569',
                                        fontWeight: 700,
                                      }}
                                    >
                                      Motor nuevo · composición real de este día + evolución
                                      y reportes anteriores. Si estaba vacío, se genera al abrir la jornada.
                                    </span>
                                    <button
                                      type="button"
                                      disabled={cargando}
                                      onClick={() =>
                                        void regenerarTrabajoGrupoIntensivoAgenda(
                                          grupo
                                        )
                                      }
                                      style={botonSecundario}
                                    >
                                      {grupo.trabajo_diario
                                        ? 'Regenerar con evolución actual'
                                        : 'Generar ahora'}
                                    </button>
                                  </div>
                                )}
                                <label style={labelCampo}>
                                  Trabajo diario visible para entrenador
                                  <textarea
                                    value={
                                      trabajoGrupoCreadoEditando[
                                        grupo.grupo_id
                                      ] ??
                                      grupo.trabajo_diario ??
                                      ''
                                    }
                                    onChange={(e) =>
                                      setTrabajoGrupoCreadoEditando({
                                        ...trabajoGrupoCreadoEditando,
                                        [grupo.grupo_id]: e.target.value,
                                      })
                                    }
                                    rows={4}
                                    style={textareaCampo}
                                  />
                                </label>
                                <label style={labelCampo}>
                                  Observaciones
                                  <textarea
                                    value={
                                      observacionesGrupoCreadoEditando[
                                        grupo.grupo_id
                                      ] ??
                                      normalizarLineasObservacionesGrupoApp(
                                        grupo.observaciones_importantes,
                                        12
                                      ) ??
                                      ''
                                    }
                                    onChange={(e) =>
                                      setObservacionesGrupoCreadoEditando({
                                        ...observacionesGrupoCreadoEditando,
                                        [grupo.grupo_id]: e.target.value,
                                      })
                                    }
                                    rows={4}
                                    style={textareaCampo}
                                  />
                                </label>
                                <button
                                  onClick={() =>
                                    guardarTrabajoObservacionesGrupoAgenda(
                                      grupo
                                    )
                                  }
                                  style={botonPrincipal}
                                >
                                  Guardar trabajo y observaciones
                                </button>
                              </div>
                            </details>
                            <div
                              style={{ marginTop: 10, display: 'grid', gap: 8 }}
                            >
                              <div
                                style={{
                                  display:
                                    agendaPestanaProceso === 'publicar' ? 'flex' : 'none',
                                  gap: 10,
                                  alignItems: 'center',
                                  justifyContent: 'space-between',
                                  flexWrap: 'wrap',
                                  padding: '10px 12px',
                                  borderRadius: 13,
                                  border: grupo.publicado
                                    ? '1px solid #86efac'
                                    : '1px solid #fcd34d',
                                  background: grupo.publicado
                                    ? '#f0fdf4'
                                    : '#fffbeb',
                                }}
                              >
                                <div style={{ minWidth: 0, flex: '1 1 220px' }}>
                                  <strong
                                    style={{
                                      display: 'block',
                                      color: grupo.publicado ? '#166534' : '#92400e',
                                      fontSize: 13,
                                      fontWeight: 950,
                                    }}
                                  >
                                    {grupo.publicado
                                      ? `✓ Publicado para ${
                                          grupo.entrenador || 'entrenador asignado'
                                        }`
                                      : grupo.entrenador_id &&
                                        (esNombreGrupoParticularApp(grupo.nombre_grupo) ||
                                          Boolean(grupo.punto_encuentro))
                                      ? '✓ Listo para publicar'
                                      : 'Pendiente de completar'}
                                  </strong>
                                  <span
                                    style={{
                                      display: 'block',
                                      marginTop: 2,
                                      color: '#64748b',
                                      fontSize: 12,
                                      fontWeight: 700,
                                    }}
                                  >
                                    {grupo.publicado
                                      ? 'Visible en su Vista entrenador.'
                                      : !grupo.entrenador_id
                                      ? 'Falta asignar entrenador. El grupo ya está creado.'
                                      : !esNombreGrupoParticularApp(grupo.nombre_grupo) &&
                                        !grupo.punto_encuentro
                                      ? 'Falta asignar punto de encuentro. El grupo ya está creado.'
                                      : 'Todo preparado. Publicar es el último paso.'}
                                  </span>
                                </div>

                                {!grupo.publicado ? (
                                  <button
                                    type="button"
                                    onClick={() => void publicarGrupo(grupo.grupo_id)}
                                    disabled={
                                      cargando ||
                                      !grupo.entrenador_id ||
                                      (!esNombreGrupoParticularApp(grupo.nombre_grupo) &&
                                        !grupo.punto_encuentro)
                                    }
                                    title={
                                      !grupo.entrenador_id
                                        ? 'Asigna un entrenador antes de publicar'
                                        : !esNombreGrupoParticularApp(grupo.nombre_grupo) &&
                                          !grupo.punto_encuentro
                                        ? 'Asigna un punto de encuentro antes de publicar'
                                        : 'Último paso: publicar este grupo en Vista entrenador'
                                    }
                                    style={{
                                      ...botonPrincipal,
                                      opacity:
                                        cargando ||
                                        !grupo.entrenador_id ||
                                        (!esNombreGrupoParticularApp(grupo.nombre_grupo) &&
                                          !grupo.punto_encuentro)
                                          ? 0.55
                                          : 1,
                                    }}
                                  >
                                    Publicar al entrenador
                                  </button>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => void despublicarGrupo(grupo.grupo_id)}
                                    disabled={cargando}
                                    style={botonPeligroMini}
                                  >
                                    Retirar de Vista entrenador
                                  </button>
                                )}
                              </div>

                              {agendaPestanaProceso === 'organizar' && (
                                <>
                              <label style={labelCampo}>
                                Entrenador
                                <select
                                  value={grupo.entrenador_id || ''}
                                  onChange={(e) =>
                                    cambiarEntrenadorGrupoAgenda(
                                      grupo,
                                      e.target.value,
                                      Boolean(
                                        asignacionExcepcionalGrupoAgenda[
                                          grupo.grupo_id
                                        ]
                                      )
                                    )
                                  }
                                  style={selectCampo}
                                >
                                  <option value="">
                                    Sin entrenador asignado
                                  </option>
                                  {(grupo.entrenador_id &&
                                  !entrenadoresDisponiblesSesionActiva().some(
                                    (entrenador) =>
                                      entrenador.entrenador_id ===
                                      grupo.entrenador_id
                                  )
                                    ? ([
                                        entrenadores.find(
                                          (entrenador) =>
                                            entrenador.entrenador_id ===
                                            grupo.entrenador_id
                                        ),
                                      ].filter(Boolean) as EntrenadorResumen[])
                                    : []
                                  )
                                    .concat(
                                      asignacionExcepcionalGrupoAgenda[
                                        grupo.grupo_id
                                      ]
                                        ? entrenadoresExcepcionalesCambioGrupoAgenda(
                                            grupo.grupo_id,
                                            grupo.entrenador_id,
                                            grupo.entrenador_apoyo_id
                                          )
                                        : entrenadoresDisponiblesCambioGrupoAgenda(
                                            grupo.grupo_id,
                                            grupo.entrenador_id,
                                            grupo.entrenador_apoyo_id
                                          )
                                    )
                                    .filter(
                                      (entrenador, indice, lista) =>
                                        lista.findIndex(
                                          (item) =>
                                            item.entrenador_id ===
                                            entrenador.entrenador_id
                                        ) === indice
                                    )
                                    .map((entrenador) => (
                                      <option
                                        key={`${grupo.grupo_id}-cambio-${entrenador.entrenador_id}`}
                                        value={entrenador.entrenador_id}
                                      >
                                        {entrenador.nombre_completo}
                                      </option>
                                    ))}
                                </select>
                              </label>

                              <div
                                style={{
                                  marginTop: -4,
                                  display: 'flex',
                                  gap: 8,
                                  alignItems: 'center',
                                  flexWrap: 'wrap',
                                }}
                              >
                                <button
                                  type="button"
                                  disabled={cargando}
                                  onClick={() =>
                                    setAsignacionExcepcionalGrupoAgenda((actual) => ({
                                      ...actual,
                                      [grupo.grupo_id]: !actual[grupo.grupo_id],
                                    }))
                                  }
                                  style={
                                    asignacionExcepcionalGrupoAgenda[grupo.grupo_id]
                                      ? botonPeligroMini
                                      : botonSecundario
                                  }
                                >
                                  {asignacionExcepcionalGrupoAgenda[grupo.grupo_id]
                                    ? 'Cancelar excepción'
                                    : 'Asignación excepcional'}
                                </button>
                                {asignacionExcepcionalGrupoAgenda[grupo.grupo_id] && (
                                  <span
                                    style={{
                                      fontSize: 12,
                                      fontWeight: 700,
                                      color: '#b45309',
                                    }}
                                  >
                                    Muestra entrenadores activos aunque no hayan enviado
                                    disponibilidad. No modifica la semana publicada.
                                  </span>
                                )}
                                {grupo.entrenador_id &&
                                  !entrenadoresDisponiblesSesionActiva().some(
                                    (entrenador) =>
                                      entrenador.entrenador_id === grupo.entrenador_id
                                  ) && (
                                    <span
                                      style={{
                                        padding: '4px 8px',
                                        borderRadius: 999,
                                        background: '#fff7ed',
                                        color: '#c2410c',
                                        fontSize: 11,
                                        fontWeight: 800,
                                      }}
                                    >
                                      ASIGNACIÓN EXCEPCIONAL
                                    </span>
                                  )}
                              </div>

                              <label style={labelCampo}>
                                Segundo entrenador
                                <select
                                  value={grupo.entrenador_apoyo_id || ''}
                                  onChange={(e) =>
                                    cambiarSegundoEntrenadorGrupoAgenda(
                                      grupo,
                                      e.target.value
                                    )
                                  }
                                  style={selectCampo}
                                >
                                  <option value="">
                                    Sin segundo entrenador
                                  </option>
                                  {(grupo.entrenador_apoyo_id &&
                                  !entrenadoresDisponiblesSesionActiva().some(
                                    (entrenador) =>
                                      entrenador.entrenador_id ===
                                      grupo.entrenador_apoyo_id
                                  )
                                    ? ([
                                        entrenadores.find(
                                          (entrenador) =>
                                            entrenador.entrenador_id ===
                                            grupo.entrenador_apoyo_id
                                        ),
                                      ].filter(Boolean) as EntrenadorResumen[])
                                    : []
                                  )
                                    .concat(
                                      entrenadoresDisponiblesCambioGrupoAgenda(
                                        grupo.grupo_id,
                                        grupo.entrenador_apoyo_id,
                                        grupo.entrenador_id
                                      )
                                    )
                                    .filter(
                                      (entrenador, indice, lista) =>
                                        lista.findIndex(
                                          (item) =>
                                            item.entrenador_id ===
                                            entrenador.entrenador_id
                                        ) === indice
                                    )
                                    .map((entrenador) => (
                                      <option
                                        key={`${grupo.grupo_id}-apoyo-cambio-${entrenador.entrenador_id}`}
                                        value={entrenador.entrenador_id}
                                      >
                                        {entrenador.nombre_completo}
                                      </option>
                                    ))}
                                </select>
                              </label>

                              {grupo.entrenador_id &&
                                grupo.entrenador_apoyo_id && (
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
                                      Reparto manual de reportes / niños
                                    </summary>
                                    <div
                                      style={{
                                        display: 'grid',
                                        gap: 8,
                                        marginTop: 10,
                                      }}
                                    >
                                      {alumnosDelGrupoCreadoApp(
                                        grupo.grupo_id
                                      ).map((alumno) => (
                                        <label
                                          key={`${grupo.grupo_id}-reparto-${alumno.alumno_id}`}
                                          style={labelCampo}
                                        >
                                          {alumno.alumno}
                                          <select
                                            value={responsableManualGrupoCreadoApp(
                                              grupo.grupo_id,
                                              alumno.alumno_id,
                                              alumno.entrenador_id
                                            )}
                                            onChange={(e) =>
                                              setResponsablesManualesGrupoAgenda(
                                                {
                                                  ...responsablesManualesGrupoAgenda,
                                                  [`${grupo.grupo_id}__${alumno.alumno_id}`]:
                                                    e.target.value,
                                                }
                                              )
                                            }
                                            style={selectCampo}
                                          >
                                            <option value={grupo.entrenador_id}>
                                              {entrenadores.find(
                                                (entrenador) =>
                                                  entrenador.entrenador_id ===
                                                  grupo.entrenador_id
                                              )?.nombre_completo ||
                                                'Entrenador principal'}
                                            </option>
                                            <option
                                              value={grupo.entrenador_apoyo_id}
                                            >
                                              {entrenadores.find(
                                                (entrenador) =>
                                                  entrenador.entrenador_id ===
                                                  grupo.entrenador_apoyo_id
                                              )?.nombre_completo ||
                                                'Segundo entrenador'}
                                            </option>
                                          </select>
                                        </label>
                                      ))}
                                    </div>
                                    <button
                                      type="button"
                                      disabled={cargando}
                                      onClick={() =>
                                        guardarRepartoManualGrupoAgenda(grupo)
                                      }
                                      style={{ ...botonSecundario, marginTop: 10 }}
                                    >
                                      Guardar reparto manual
                                    </button>
                                  </details>
                                )}

                              <label style={labelCampo}>
                                Punto de encuentro
                                <select
                                  value={grupo.punto_encuentro || ''}
                                  onChange={(e) =>
                                    cambiarPuntoGrupoAgenda(
                                      grupo,
                                      e.target.value
                                    )
                                  }
                                  style={selectCampo}
                                >
                                  <option value="">
                                    Selecciona punto
                                  </option>
                                  {puntosEncuentroAgenda
                                    .filter((punto) => {
                                      const usadosEnOtros = new Set(
                                        gruposRecursosTurnoAgenda()
                                          .filter(
                                            (otro) =>
                                              otro.grupo_id !== grupo.grupo_id
                                          )
                                          .map(
                                            (otro) =>
                                              otro.punto_encuentro || ''
                                          )
                                          .filter(Boolean)
                                      );

                                      return (
                                        punto === grupo.punto_encuentro ||
                                        !usadosEnOtros.has(punto)
                                      );
                                    })
                                    .map((punto) => (
                                      <option
                                        key={`${grupo.grupo_id}-punto-${punto}`}
                                        value={punto}
                                      >
                                        Punto {punto}
                                      </option>
                                    ))}
                                </select>
                              </label>

                              <button
                                type="button"
                                disabled={cargando}
                                onClick={() => borrarGrupoAgenda(grupo)}
                                style={botonPeligroMini}
                              >
                                Borrar grupo
                              </button>
                                </>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                    </section>
                  )}
                </article>
              )}
            </section>
          )}
        </section>
      )}

    </>
  );
}

