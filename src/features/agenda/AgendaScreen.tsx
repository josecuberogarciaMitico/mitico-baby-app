import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import type { AlumnoResumen } from '../../core/students/studentTypes';
import type { EntrenadorResumen } from '../../core/trainers/trainerTypes';
import type {
  AgendaAlumnoSesionApp,
  AgendaGrupoSesionApp,
  AgendaRecomendacionSesionApp,
  RecomendacionFueraPlazoAgendaApp,
  SesionAgendaOperativa,
} from './agendaTypes';
import { addIsoDays, type BabyRelocationOption, type BabyRelocationStudent } from './agendaRelocation';
import { loadBabyRelocationOptions, moveBabyStudentBetweenSessions } from '../../services/agenda/agendaRelocationService';
import { addLateStudentToSession } from '../../services/agenda/lateStudentSessionService';
import { SessionTrainerCoverageLine } from './AgendaTrainerSummary';
import {
  ETIQUETA_MOTIVO,
  anteriorPendiente,
  columnasDelDia,
  contarPistasSesion,
  disponiblesEnTurno,
  estadoDia,
  pasosSesion,
  pendientesSemana,
  resumenDia,
  siguientePendiente,
  sumarConteosPista,
  textoPistas,
  type ExtrasSesion,
  type FilaDisponibilidad,
  type MotivoPendiente,
  type PendienteSesion,
} from './agendaTablero';
import './AgendaTablero.css';
import './AgendaCabecera.css';
import { mesesTemporadaAgenda } from './agendaCalendar';
import { pedagogicalBandForLevel } from '../../core/recommendations/baseRecommendation';
import { PacoAltasAviso } from '../baby/PacoAltasAviso';
import { PacoNotasSesion } from '../pacoAcciones/PacoNotasSesion';
import { pendingAgendaStudents } from './agendaSessions';
import { SinColocarPanel } from './SinColocarPanel';
import { NinosGrupoPropuesto } from './NinosGrupoPropuesto';
import { ReportSplitPanel } from '../dashboard/ReportSplitPanel';
import { CanceladosAimHarderAviso } from './CanceladosAimHarderAviso';
import { RepetidosSemanaAviso } from './RepetidosSemanaAviso';
import { avisoRatioGrupoBaby, nivelesDe } from './dividirGrupoLogic';
import { CifrasSesionAgenda, GruposTableroAgenda, PublicarListaAgenda, VentanaAjustesTablero, nombreTablero, type GrupoPublicarFila, type GrupoTablero, type ControlesGrupoTablero, type SelectTablero, type AccionGrupoTablero } from './GruposTableroAgenda';
import { PreparadosGrandeAviso } from './PreparadosGrandeAviso';
import { PacoAimHarderResumen } from './PacoAimHarderResumen';
import { avisoCompartirPunto, opcionesPuntoEncuentro, textoOpcionPunto } from './puntosEncuentroLogic';
import type { SesionPlan } from './sinColocarPlanner';
import { notifyGroupChangedAndRequestReconfirmation } from './groupChangeNotification';
import { abrirFichaAlumno } from '../students/studentFichaStore';
import { familyWhatsappUrl } from '../../core/students/masterStudent';
import {
  sessionTrainerCoverage,
  type AgendaTrainerAssignmentRow,
} from './agendaTrainerSummary';

type AlumnoSinColocarTablero = {
  sesion_alumno_id: string;
  alumno_id: string;
  alumno: string;
  estado_en_listado?: string;
  nivel_usado?: string | null;
};

type AgendaScreenProps = {
  ctx: Record<string, any>;
};

// Últimas asignaciones de entrenadores cargadas (sobrevive a salir y volver a la pantalla).
let cacheAsignacionesSemanaAgenda: { semana: string; filas: AgendaTrainerAssignmentRow[] } | null = null;

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
    alumnoFueraPlazoAlumnoId,
    cargarDetalleSesionAgenda,
    alumnoFueraPlazoNombre,
    anadirAlumnoSinFichaASesionBabyApp,
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
    altasPaco,
    setAltasPaco,
    enviarAltaPacoWhatsapp,
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
    cargarGruposEntrenador,
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
    ejecutarFuncionAuthJson,
    ejecutarPushMiticoApp,
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
    mesesAgenda,
    miniMetrica,
    miniTarjetaBlanca,
    mostrarAlumnoFueraPlazo,
    moverAlumnoAgendaRecomendado,
    moverAlumnoEntreGruposAgenda,
    necesitaDosEntrenadoresGrupoApp,
    nombreGrupoPropuestaApp,
    nombreGrupoVisualApp,
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
    semanaAgendaActiva,
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

  // Fase 2: abre la ficha única encima de la Agenda, sin salir de ella.
  function abrirFichaAlumnoDesdeAgenda(alumnoId: string, _nombreAlumno: string) {
    abrirFichaAlumno(alumnoId);
  }

  const [alternativasBabyLocales, setAlternativasBabyLocales] = useState<
    Record<string, BabyRelocationOption[]>
  >({});
  const [buscandoAlternativasBaby, setBuscandoAlternativasBaby] = useState(false);
  const [moviendoAlumnoTurnoId, setMoviendoAlumnoTurnoId] = useState('');
  const [anadiendoFueraPlazoSesion, setAnadiendoFueraPlazoSesion] = useState(false);
  const [avisoFueraPlazoSesion, setAvisoFueraPlazoSesion] = useState<{
    ok: boolean;
    texto: string;
  } | null>(null);

  // 04/11: tras añadir a un niño (a un grupo o a la sesión) el buscador queda
  // limpio para el siguiente; el mensaje de «añadido» se mantiene.
  function limpiarBuscadorFueraPlazo() {
    setAlumnoFueraPlazoNombre('');
    setAlumnoFueraPlazoNivel('');
    setAlumnoFueraPlazoAlumnoId('');
    setRecomendacionesFueraPlazo([]);
  }
  useEffect(() => {
    if (mensajeIncorporacionFueraPlazo) limpiarBuscadorFueraPlazo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mensajeIncorporacionFueraPlazo]);
  useEffect(() => {
    if (avisoFueraPlazoSesion?.ok) limpiarBuscadorFueraPlazo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [avisoFueraPlazoSesion]);

  // ¿La sesión abierta es de Baby? (para el alta tardía de un niño sin ficha).
  function sesionActivaEsBaby(): boolean {
    const sesion = (diasSemanaAgenda as Array<{ fecha: string }>)
      .flatMap((dia) => sesionesDelDiaAgenda(dia.fecha) as SesionAgendaOperativa[])
      .find((item) => item.agendaDirecta?.sesion_id === agendaSesionActivaId);
    return String(sesion?.modalidad || '').trim().toUpperCase() === 'BABY';
  }

  // Niño sin ficha elegida en una sesión Baby: entra como en el listado de
  // AimHarder (ficha antigua → su nivel; sin ficha → «Pendiente de Alta/Test»),
  // sin elegir un nivel a ojo y sin tocar los grupos.
  async function anadirAlumnoSinFichaComoPendiente(nombre: string) {
    if (
      !window.confirm(
        `${nombre}\n\nSe añade a esta sesión SIN grupo. Si ya tiene ficha (también del año pasado) entra con su nivel; si es nuevo, entra como «Pendiente de Alta/Test».\nNo se toca ningún grupo. ¿Continuar?`
      )
    ) {
      return;
    }
    setAnadiendoFueraPlazoSesion(true);
    setAvisoFueraPlazoSesion(null);
    try {
      const resultado = await anadirAlumnoSinFichaASesionBabyApp(agendaSesionActivaId, nombre);
      await cargarAgendaOperativaDirecta();
      await cargarDetalleSesionAgenda(agendaSesionActivaId);
      const anadido = resultado.anadidos[0];
      setAvisoFueraPlazoSesion(
        anadido
          ? {
              ok: true,
              texto:
                String(anadido.estado || '').toUpperCase() === 'PENDIENTE_TEST'
                  ? `${anadido.nombre} añadido a la sesión como «Pendiente de Alta/Test». Pulsa «Crear Alta / Test» en Pendientes de colocar.`
                  : `${anadido.nombre} ya tenía ficha: añadido con su nivel ${anadido.nivel || '(sin nivel, revisa su ficha)'} (pendiente de colocar en grupo).`,
            }
          : resultado.noAnadidos.length > 0
          ? { ok: false, texto: `No puedo añadir «${nombre}» así: escribe nombre y apellidos completos, sin números.` }
          : { ok: true, texto: `${nombre} ya estaba en esta sesión. No se ha duplicado.` }
      );
    } catch (errorAnadir) {
      setAvisoFueraPlazoSesion({
        ok: false,
        texto: errorAnadir instanceof Error ? errorAnadir.message : 'No se pudo añadir el alumno a la sesión.',
      });
    } finally {
      setAnadiendoFueraPlazoSesion(false);
    }
  }

  // "+ Alumno fuera de plazo" sin grupo: lo añade a la sesión (pendiente de
  // colocar). Para cuando la sesión aún no tiene grupos o no encaja en ninguno.
  async function anadirAlumnoFueraPlazoASesionSinGrupo() {
    const nombre = String(alumnoFueraPlazoNombre || '').trim();
    const nivel = String(alumnoFueraPlazoNivel || '').trim();
    if (!agendaSesionActivaId) {
      setAvisoFueraPlazoSesion({ ok: false, texto: 'Abre primero la sesión donde se ha apuntado el niño.' });
      return;
    }
    if (nombre && !alumnoFueraPlazoAlumnoId) {
      // Sin ficha elegida no se crea una ficha con un nivel puesto a ojo.
      if (sesionActivaEsBaby()) {
        await anadirAlumnoSinFichaComoPendiente(nombre);
      } else {
        setAvisoFueraPlazoSesion({
          ok: false,
          texto: 'Este niño no tiene ficha elegida. Elígelo de la lista o créale primero el Alta / Test, para no poner un nivel a ojo.',
        });
      }
      return;
    }
    if (!nombre || !nivel) {
      setAvisoFueraPlazoSesion({ ok: false, texto: 'Escribe el nombre y elige el nivel antes de añadirlo.' });
      return;
    }
    if (
      !window.confirm(
        `${nombre} · ${nivel}\n\nSe añade a esta sesión SIN grupo (quedará pendiente de colocar).\nDespués genera o revisa los grupos. ¿Continuar?`
      )
    ) {
      return;
    }
    setAnadiendoFueraPlazoSesion(true);
    setAvisoFueraPlazoSesion(null);
    try {
      const resultado = await addLateStudentToSession({
        sessionId: agendaSesionActivaId,
        studentId: alumnoFueraPlazoAlumnoId || null,
        fullName: nombre,
        level: nivel,
      });
      await cargarAgendaOperativaDirecta();
      await cargarDetalleSesionAgenda(agendaSesionActivaId);
      setAvisoFueraPlazoSesion({
        ok: true,
        texto:
          resultado.resultado === 'YA_ESTABA_EN_SESION'
            ? `${resultado.alumno} ya estaba en esta sesión. No se ha duplicado.`
            : `${resultado.alumno} añadido a la sesión (pendiente de colocar en grupo).`,
      });
    } catch (errorAnadir) {
      setAvisoFueraPlazoSesion({
        ok: false,
        texto:
          errorAnadir instanceof Error
            ? errorAnadir.message
            : 'No se pudo añadir el alumno a la sesión.',
      });
    } finally {
      setAnadiendoFueraPlazoSesion(false);
    }
  }
  // 20/11: las asignaciones de la semana se recuerdan al salir y volver a
  // Entrenamientos (antes empezaban vacías y los días salían en naranja
  // «pendiente» hasta que llegaba la consulta). Se refrescan igual al entrar.
  const [agendaTrainerAssignmentRows, setAgendaTrainerAssignmentRowsEstado] = useState<
    AgendaTrainerAssignmentRow[]
  >(() => {
    const cache = cacheAsignacionesSemanaAgenda;
    return cache && cache.semana === semanaAgendaActiva ? cache.filas : [];
  });
  const [semanaAsignacionesCargada, setSemanaAsignacionesCargada] = useState<string>(() => {
    const cache = cacheAsignacionesSemanaAgenda;
    return cache && cache.semana === semanaAgendaActiva ? cache.semana : '';
  });
  function setAgendaTrainerAssignmentRows(filas: AgendaTrainerAssignmentRow[], semana = semanaAgendaActiva) {
    setAgendaTrainerAssignmentRowsEstado(filas);
    setSemanaAsignacionesCargada(semana || '');
    cacheAsignacionesSemanaAgenda = semana ? { semana, filas } : null;
  }
  const asignacionesSemanaListas = Boolean(semanaAgendaActiva) && semanaAsignacionesCargada === semanaAgendaActiva;

  const gruposPropuestaActuales = gruposRecomendadosAgenda();
  // 17/11: el desplegable «Mover a» usa los MISMOS nombres que los títulos de
  // los grupos (que se numeran por el orden en pantalla) y no ofrece grupos que
  // se han quedado vacíos: antes, «Grupo 5» del desplegable podía ser otro
  // grupo (o uno vacío) y el niño acababa solo en un grupo de 1.
  const opcionesDestinoAgenda: Array<{ valor: string; etiqueta: string }> = [
    // (Las particulares tienen su propia opción «Mover a particular».)
    ...gruposPropuestaActuales
      .map(([nombreGrupo, alumnosGrupo], indice) => ({ valor: nombreGrupo, etiqueta: nombreGrupoPropuestaApp(alumnosGrupo, indice) }))
      .filter((opcion) => !esGrupoParticularAgenda(opcion.valor)),
    ...(gruposAgendaManuales as string[])
      .filter((manual) => !gruposPropuestaActuales.some(([nombreGrupo]) => nombreGrupo === manual))
      .map((manual) => ({ valor: manual, etiqueta: `${manual} (vacío)` })),
  ];
  const candidatosReubicacionBaby: BabyRelocationStudent[] = [];
  const candidatosVistos = new Set<string>();
  gruposPropuestaActuales.forEach(([nombreGrupo, alumnosGrupo]) => {
    if (esGrupoParticularAgenda(nombreGrupo)) return;
    // 17/11 (Jose): proponer OTRO DÍA solo si el niño se ha quedado solo en su
    // grupo. Un grupo bloqueado (p. ej. 8 niños) se arregla dentro del mismo
    // turno; antes salía «Revisión manual» con otros días para cada uno de sus niños.
    if (alumnosGrupo.length !== 1) return;
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
        `${grupo.grupo_id || ''}:${grupo.entrenador_id || ''}:${grupo.entrenador_apoyo_id || ''}:${grupo.entrenador_tercero_id || ''}:${grupo.total_alumnos || 0}`
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
          : [],
        semanaAgendaActiva
      );
    } catch (errorResumen) {
      console.warn('No se pudieron cargar las asignaciones semanales de entrenadores.', errorResumen);
      setAgendaTrainerAssignmentRows([]);
    }
  }

  // --- Ayudas del tablero (27/10): datos extra de la semana, solo lectura ---
  const idSesionDbTablero = (s: SesionAgendaOperativa) =>
    String(s.agendaDirecta?.sesion_id || (s.dia as { sesion_id?: string } | undefined)?.sesion_id || '');
  const hoyTableroSemana = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
  const diasTableroSemana = (diasSemanaAgenda || []).map((dia: { fecha: string }) => ({
    fecha: dia.fecha,
    sesiones: sesionesDelDiaAgenda(dia.fecha) as SesionAgendaOperativa[],
  }));
  const idsSesionesSemanaTablero = Array.from(
    new Set(
      diasTableroSemana
        .flatMap((d: { sesiones: SesionAgendaOperativa[] }) => d.sesiones.map(idSesionDbTablero))
        .filter(Boolean)
    )
  ).sort() as string[];
  const firmaSesionesSemanaTablero = idsSesionesSemanaTablero.join(',');
  const [extrasTablero, setExtrasTablero] = useState<Record<string, ExtrasSesion>>({});
  const [actualizandoAgenda, setActualizandoAgenda] = useState(false);
  // 20/11: cabecera compacta. Menú «Semana ⋯» y semana anterior/siguiente con ‹ ›.
  const [menuSemanaAgendaAbierto, setMenuSemanaAgendaAbierto] = useState(false);
  useEffect(() => {
    if (!menuSemanaAgendaAbierto) return;
    const cerrar = () => setMenuSemanaAgendaAbierto(false);
    window.addEventListener('click', cerrar);
    return () => window.removeEventListener('click', cerrar);
  }, [menuSemanaAgendaAbierto]);
  /** La semana de al lado (lunes) y el mes/temporada en que cae; null si se sale de las temporadas. */
  function semanaVecinaAgenda(delta: -1 | 1) {
    if (!semanaAgendaActiva) return null;
    const semana = addIsoDays(semanaAgendaActiva, delta * 7);
    // El mes del lunes; si no es de temporada (p. ej. 31/08), el del domingo.
    for (const mes of [semana.slice(0, 7), addIsoDays(semana, 6).slice(0, 7)]) {
      if ((mesesAgenda as string[]).includes(mes)) return { semana, mes, anio: anioInicioTemporadaAgenda as number };
      const [a, m] = mes.split('-').map(Number);
      const anio = m >= 7 ? a : a - 1;
      if ((opcionesTemporadaAgenda as number[]).includes(anio) && mesesTemporadaAgenda(anio).includes(mes)) return { semana, mes, anio };
    }
    return null;
  }
  function irSemanaVecinaAgenda(delta: -1 | 1) {
    const v = semanaVecinaAgenda(delta);
    if (!v) return;
    if (v.anio !== anioInicioTemporadaAgenda) setAnioInicioTemporadaAgenda(v.anio);
    setMesAgenda(v.mes);
    cambiarSemanaTrabajoApp(v.semana);
  }
  const [refrescoAgenda, setRefrescoAgenda] = useState(0);
  const [disponibilidadTablero, setDisponibilidadTablero] = useState<FilaDisponibilidad[]>([]);
  // Niños sin colocar: el contador sale aquí y la tabla en SinColocarPanel.
  const [verSinColocarSemana, setVerSinColocarSemana] = useState(false);
  const [accionSinColocarPendiente, setAccionSinColocarPendiente] = useState<{
    sesionId: string;
    sesionAlumnoId: string;
  } | null>(null);

  // 06/11: tercer entrenador de un grupo (pone, cambia o quita).
  async function cambiarTercerEntrenadorGrupoAgenda(grupo: AgendaGrupoSesionApp, nuevoId: string) {
    if (!grupo.grupo_id) return;
    const nombre = nuevoId
      ? entrenadores.find((e: EntrenadorResumen) => e.entrenador_id === nuevoId)?.nombre_completo || 'este entrenador'
      : '';
    const ok = window.confirm(
      nuevoId
        ? grupo.entrenador_tercero_id
          ? `¿Cambiar el tercer entrenador de ${grupo.nombre_grupo} a ${nombre}?\n\nSus reportes pasarán a ${nombre}. Se actualizan Vista entrenador y Cobros.`
          : `¿Poner a ${nombre} como tercer entrenador de ${grupo.nombre_grupo}?\n\nLos reportes se reparten entre los tres (1 de cada 3 niños para ${nombre}); luego puedes ajustarlo niño a niño en «Quién hace cada reporte». Cobra el turno.`
        : `¿Quitar el tercer entrenador de ${grupo.nombre_grupo}?\n\nSus reportes vuelven al entrenador principal.`
    );
    if (!ok) return;
    setError('');
    try {
      await ejecutarFuncionAuthJson('guardar_tercer_entrenador_grupo_app', {
        p_grupo_id: grupo.grupo_id,
        p_entrenador_id: nuevoId || null,
      });
      // Grupo publicado: push y confirmación para el tercero nuevo.
      if (grupo.publicado && nuevoId) {
        void ejecutarPushMiticoApp('support_trainer_assigned', { grupo_id: grupo.grupo_id, entrenador_id: nuevoId }).catch(() => undefined);
      }
      if (agendaSesionActivaId) await cargarDetalleSesionAgenda(agendaSesionActivaId);
      await cargarAgendaOperativaDirecta();
      await cargarAsignacionesEntrenadoresSemana();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cambiar el tercer entrenador.');
    }
  }

  async function cargarExtrasTableroSemana() {
    if (!semanaAgendaActiva) {
      setExtrasTablero({});
      setDisponibilidadTablero([]);
      return;
    }
    const ids = idsSesionesSemanaTablero;
    const nuevos: Record<string, ExtrasSesion> = {};
    ids.forEach((id) => (nuevos[id] = { revisar: 0, notas: 0, sinConfirmar: 0 }));
    // Cada dato va por su lado: si uno falla (p. ej. un usuario sin permiso
    // para las notas), el resto se enseña igual.
    const [roster, grupos, dispo] = await Promise.allSettled([
      ids.length
        ? consultarSupabase(
            'v_sesion_alumnos_operativa_app',
            `select=sesion_id,sesion_alumno_id,alumno_id,alumno,estado_en_listado,estado_ficha,nivel_usado&sesion_id=in.(${ids.join(',')})`
          )
        : Promise.resolve([]),
      ids.length
        ? consultarSupabase(
            'v_grupos_sesion_operativa_app',
            `select=sesion_id,grupo_id,publicado,estado_confirmacion,entrenador_id,alumnos_lista,pista,total_alumnos&sesion_id=in.(${ids.join(',')})`
          )
        : Promise.resolve([]),
      ejecutarFuncionAuthJson('obtener_disponibilidad_publicada_entrenadores_editor_app', {
        p_semana_inicio: semanaAgendaActiva,
      }),
    ]);
    const filasRoster: Array<AlumnoSinColocarTablero & { sesion_id: string; estado_ficha?: string }> =
      roster.status === 'fulfilled' && Array.isArray(roster.value) ? (roster.value as any[]) : [];
    filasRoster.forEach((f) => {
      const ex = nuevos[String(f.sesion_id)];
      if (!ex) return;
      const listado = String(f.estado_en_listado || '').toUpperCase();
      const ficha = String(f.estado_ficha || '').toLowerCase();
      if (listado === 'PENDIENTE_TEST' || (ficha && ficha !== 'completa')) ex.revisar += 1;
    });
    if (grupos.status === 'fulfilled' && Array.isArray(grupos.value)) {
      (grupos.value as Array<{ sesion_id: string; publicado?: boolean; estado_confirmacion?: string | null; entrenador_id?: string | null }>).forEach((g) => {
        const ex = nuevos[String(g.sesion_id)];
        if (!ex) return;
        if (g.publicado && g.entrenador_id && String(g.estado_confirmacion || '').toLowerCase() !== 'confirmado') ex.sinConfirmar += 1;
      });
    }
    // Sin colocar: solo cuenta en sesiones que ya tienen grupos (igual que dentro de la sesión).
    if (grupos.status === 'fulfilled' && Array.isArray(grupos.value)) {
      const gruposPorSesion: Record<string, Array<{ alumnos_lista?: string | null; pista?: string | null; total_alumnos?: number | null }>> = {};
      (grupos.value as Array<{ sesion_id: string; grupo_id?: string | null; alumnos_lista?: string | null; pista?: string | null; total_alumnos?: number | null }>).forEach((g) => {
        if (!g.grupo_id) return;
        (gruposPorSesion[String(g.sesion_id)] ||= []).push(g);
      });
      Object.keys(nuevos).forEach((id) => {
        const pendientes = pendingAgendaStudents(
          filasRoster.filter((f) => String(f.sesion_id) === id),
          gruposPorSesion[id] || [],
          normalizarNombreAlumnoAgendaApp
        );
        if (pendientes.length) nuevos[id].sinColocar = pendientes.length;
        // 05/11: niños por pista (grupo → su pista; sin grupo → la de su nivel).
        const delRoster = filasRoster.filter((f) => String(f.sesion_id) === id);
        nuevos[id].pistas = contarPistasSesion(
          gruposPorSesion[id] || [],
          (gruposPorSesion[id] || []).length ? pendientes : delRoster,
          (nivel) => pedagogicalBandForLevel(nivel).piste
        );
      });
    }
    const alumnoIds = Array.from(new Set(filasRoster.map((f) => String(f.alumno_id)).filter(Boolean)));
    if (esCoordinadorApp && alumnoIds.length) {
      try {
        const notas = await ejecutarFuncionAuthJson('notas_paco_alumnos_app', { p_alumno_ids: alumnoIds });
        const conNota = new Set(
          (Array.isArray(notas) ? (notas as Array<{ alumno_id?: string }>) : []).map((n) => String(n.alumno_id || ''))
        );
        filasRoster.forEach((f) => {
          if (conNota.has(String(f.alumno_id)) && nuevos[String(f.sesion_id)]) nuevos[String(f.sesion_id)].notas += 1;
        });
      } catch {
        // Sin permiso para las notas: no se enseñan.
      }
    }
    setExtrasTablero(nuevos);
    const turnos = dispo.status === 'fulfilled' ? (dispo.value as { turnos?: FilaDisponibilidad[] } | null)?.turnos : null;
    setDisponibilidadTablero(Array.isArray(turnos) ? turnos : []);
  }

  useEffect(() => {
    if (pantalla !== 'agenda') return;
    void cargarExtrasTableroSemana();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pantalla, semanaAgendaActiva, firmaSesionesSemanaTablero, firmaGruposAgenda]);

  const entrenadoresActivosTablero = new Set(
    (entrenadores || []).filter((e: { activo?: boolean }) => e.activo).map((e: { entrenador_id: string }) => String(e.entrenador_id))
  );
  const pendientesTablero = pendientesSemana(
    diasTableroSemana,
    hoyTableroSemana,
    (s) => sessionTrainerCoverage(s, agendaTrainerAssignmentRows),
    (s) => extrasTablero[idSesionDbTablero(s)] || null
  );
  const sesionAbiertaTablero =
    pendientesTablero.pendientes.find((p) => agendaSesionActivaId && idSesionDbTablero(p.sesion) === agendaSesionActivaId)
      ?.sesion.id || '';
  const siguientePendienteTablero = siguientePendiente(pendientesTablero.pendientes, sesionAbiertaTablero);
  const anteriorPendienteTablero = anteriorPendiente(pendientesTablero.pendientes, sesionAbiertaTablero);

  function abrirPendienteTablero(p: PendienteSesion<SesionAgendaOperativa> | null, motivo?: MotivoPendiente) {
    if (!p) return;
    setAgendaDiaCompactoActivo(p.fecha);
    abrirSesionAgenda(
      p.sesion,
      motivo === 'revisar' || p.sesion.totalGrupos <= 0 ? 'alumnos' : 'grupos'
    );
  }

  // Fase 2: la sesión y «Pegar listado» se abren en un panel lateral
  // (pantalla completa en móvil). Cerrar hace lo mismo que el antiguo botón.
  function cerrarPanelTrabajoAgenda() {
    setAgendaFormularioAbierto(false);
    setAgendaSesionActivaId('');
    setAgendaRecomendaciones([]);
    setAgendaPestanaProceso('crear');
  }

  useEffect(() => {
    if (pantalla !== 'agenda' || !(agendaFormularioAbierto || agendaSesionActivaId)) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      const destino = e.target as HTMLElement | null;
      // Esc dentro de un campo de texto no cierra (podría perder lo escrito).
      if (destino && /^(INPUT|TEXTAREA|SELECT)$/.test(destino.tagName)) return;
      // 19/11: con la ventana de ajustes o el menú ⋯ del tablero abiertos, Esc cierra solo eso.
      if (document.querySelector('.gt-ajustes-cab, .gt-menu')) return;
      cerrarPanelTrabajoAgenda();
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [pantalla, agendaFormularioAbierto, agendaSesionActivaId]);

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

  // 18/11: niños de un grupo creado, para «Dividir en dos grupos».
  function ninosParaDividirAgenda(grupo: AgendaGrupoSesionApp) {
    const fuerza: Record<string, number> = { MUY_FUERTE: 2, FUERTE: 1, BAJO: -2 };
    return String(grupo.alumnos_lista || '')
      .split(' || ')
      .map((linea) => {
        const nombre = normalizarNombreAlumnoAgendaApp(linea);
        return (agendaAlumnosSesion as AgendaAlumnoSesionApp[]).find((a) => normalizarNombreAlumnoAgendaApp(a.alumno) === nombre);
      })
      .filter((a): a is AgendaAlumnoSesionApp => Boolean(a))
      .map((a) => {
        const perfil = perfilOperativoAlumnoApp(a.alumno_id);
        return {
          alumno_id: a.alumno_id,
          alumno: a.alumno,
          nivel: a.nivel_usado,
          edad: typeof perfil?.edad_aprox === 'number' ? perfil.edad_aprox : null,
          fuerza: fuerza[String(perfil?.fuerza_nivel || '')] || 0,
        };
      });
  }

  // 18/11: «➕ Grupo nuevo» en «Cambiar de grupo» (no en Intensivos ni particulares; el grupo debe quedarse con alguien).
  // 19/11: tablero de grupos en «Organizar» (Jose: «mil scroll, tosco»). Se recuerda en este navegador.
  // 20/11 (Jose): se quita «Ver como antes»: siempre la vista nueva.
  const vistaTableroAgenda = true;
  const [grupoAjustesTablero, setGrupoAjustesTablero] = useState<string | null>(null);
  const tableroAgendaActivo = agendaPestanaProceso === 'organizar' && vistaTableroAgenda;
  // 19/11: el Paso 3 también en lista compacta (mismo botón «Ver como antes»).
  const listaPublicarActiva = agendaPestanaProceso === 'publicar' && vistaTableroAgenda;
  const vistaNuevaAgendaActiva = tableroAgendaActivo || listaPublicarActiva;

  function filasPublicarAgenda(): GrupoPublicarFila[] {
    const esBaby = sesionActivaEsBaby();
    return gruposParaTableroAgenda().map((t) => {
      const grupo = agendaGruposSesion.find((g: AgendaGrupoSesionApp) => g.grupo_id === t.id) as AgendaGrupoSesionApp;
      const particular = esNombreGrupoParticularApp(grupo.nombre_grupo);
      const listo = Boolean(grupo.entrenador_id) && (particular || Boolean(grupo.punto_encuentro));
      return {
        id: t.id,
        titulo: t.titulo,
        niveles: t.niveles,
        detalle: `${t.ninos.length} ${t.ninos.length === 1 ? 'niño' : 'niños'} · ${t.pistaTexto.charAt(0)}${t.pistaTexto.slice(1).toLowerCase()} · ${t.punto}`,
        pista: t.pista,
        entrenadores: t.entrenadores,
        sinEntrenador: t.sinEntrenador,
        publicado: Boolean(grupo.publicado),
        confirmado: grupo.estado_confirmacion === 'Confirmado',
        listo,
        falta: !grupo.entrenador_id ? 'Falta entrenador' : !listo ? 'Falta punto de encuentro' : null,
        aviso: esBaby ? avisoRatioGrupoBaby(grupo) : null,
      };
    });
  }

  function avisarCambiosGrupoAgenda(grupoId: string) {
    void notifyGroupChangedAndRequestReconfirmation({
      groupId: grupoId,
      runFunction: ejecutarFuncionAuthJson,
      sendPush: ejecutarPushMiticoApp,
      reload: async () => {
        await Promise.allSettled([cargarAgendaOperativaDirecta(), cargarGruposEntrenador(), cargarPlanning()]);
        if (agendaSesionActivaId) await cargarDetalleSesionAgenda(agendaSesionActivaId);
      },
    }).catch((err) => setError(err instanceof Error ? err.message : 'Error desconocido'));
  }

  function gruposParaTableroAgenda(): GrupoTablero[] {
    const esBaby = sesionActivaEsBaby();
    return agendaGruposSesion.map((grupo: AgendaGrupoSesionApp, indice: number) => {
      const contexto = contextoIntensivoSesionAgenda(grupo.sesion_id);
      const visual = String(nombreGrupoVisualApp(grupo, indice));
      const pistaTxt = String(grupo.pista || '').toLowerCase();
      const ninos = String(grupo.alumnos_lista || '')
        .split(' || ')
        .filter((x) => x.trim())
        .map((alumnoGrupo, i) => {
          const alumnoSesion = (agendaAlumnosSesion as AgendaAlumnoSesionApp[]).find(
            (a) => normalizarNombreAlumnoAgendaApp(a.alumno) === normalizarNombreAlumnoAgendaApp(alumnoGrupo)
          );
          const [nombre, nivel] = String(formatearAlumnoListadoOperativo(alumnoGrupo)).split(' · ');
          const edad = alumnoSesion ? perfilOperativoAlumnoApp(alumnoSesion.alumno_id)?.edad_aprox : null;
          const asis = contexto && alumnoSesion ? asistenciaAlumnoIntensivoAgenda(grupo, alumnoSesion.alumno_id) : null;
          const estadoAsis = String(asis?.estado || '');
          const noViene = ['NO_PRESENTADO', 'BAJA_AVISADA'].includes(estadoAsis);
          return {
            clave: `${grupo.grupo_id}-${i}`,
            alumnoId: alumnoSesion?.alumno_id || null,
            nombre: nombreTablero(nombre || alumnoGrupo),
            nivel: nivel ? (/^INICIACION$/i.test(nivel) ? 'INICIACIÓN' : nivel) : null,
            edad: edad ?? null,
            asistencia: contexto
              ? noViene ? 'No viene · recuperación' : estadoAsis === 'PRESENTE' ? 'Presente' : estadoAsis === 'LLEGA_TARDE' ? 'Llega tarde' : null
              : null,
            noViene,
            puedeMarcarNoViene: Boolean(contexto) && estadoAsis !== 'PRESENTE' && estadoAsis !== 'LLEGA_TARDE',
            // 20/11: pinchar el nombre abre el WhatsApp de la familia (teléfono de la ficha).
            whatsapp: alumnoSesion
              ? familyWhatsappUrl(
                  (alumnos as Array<{ alumno_id: string; telefono?: string | null }> | undefined)?.find(
                    (a) => a.alumno_id === alumnoSesion.alumno_id
                  )?.telefono
                )
              : null,
          };
        });
      const particular = esNombreGrupoParticularApp(grupo.nombre_grupo);
      return {
        id: grupo.grupo_id,
        titulo: `Grupo ${indice + 1}`,
        niveles: ninos.some((n) => n.nivel)
          ? nivelesDe(ninos.map((n) => n.nivel))
          : visual.includes(' · Nivel ') ? visual.split(' · Nivel ').slice(1).join(' · Nivel ') : visual,
        pista: pistaTxt.includes('grande') ? 'grande' : pistaTxt.includes('peque') ? 'pequena' : 'otra',
        pistaTexto: String(etiquetaPistaVisualApp(grupo.pista)).replace('PISTA ', ''),
        punto: particular ? 'Particular · CON JOSE' : `Punto ${grupo.punto_encuentro || '-'}`,
        entrenadores: grupo.entrenador_id ? String(nombresEntrenadoresDelGrupo(grupo.grupo_id, grupo.entrenador) || grupo.entrenador || '') : 'Sin entrenador',
        sinEntrenador: !grupo.entrenador_id,
        estado: grupo.publicado ? 'Publicado' : 'En preparación',
        publicado: Boolean(grupo.publicado),
        aviso: esBaby && grupo.publicado ? avisoRatioGrupoBaby(grupo) : null,
        intensivo: Boolean(contexto),
        puedeGrupoNuevo: puedeGrupoNuevoAgenda(grupo, contexto),
        ninos,
      };
    });
  }

  function accionTableroAgenda(grupoId: string, alumnoId: string) {
    const grupo = agendaGruposSesion.find((g: AgendaGrupoSesionApp) => g.grupo_id === grupoId);
    const alumnoSesion = (agendaAlumnosSesion as AgendaAlumnoSesionApp[]).find((a) => a.alumno_id === alumnoId);
    if (!grupo || !alumnoSesion) {
      setError('No encuentro el niño o el grupo. Actualiza la sesión y vuelve a intentarlo.');
      return null;
    }
    return { grupo, alumnoSesion };
  }

  function abrirTrabajoTableroAgenda(grupoId: string) {
    setGrupoAjustesTablero(grupoId);
    window.setTimeout(() => {
      const el = document.getElementById(`agenda-trabajo-grupo-${grupoId}`) as HTMLDetailsElement | null;
      if (el) { el.open = true; el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    }, 60);
  }

  // 25/11 (Jose): lo de «⚙ Ajustes» se hace en la propia tarjeta del tablero.
  // Mismas listas y mismas funciones que la tarjeta antigua (con sus avisos).
  function nombreEntrenadorAgenda(id?: string | null, porDefecto?: string | null) {
    return String(entrenadores.find((e: EntrenadorResumen) => e.entrenador_id === id)?.nombre_completo || porDefecto || '');
  }

  function controlesGrupoTableroAgenda(grupoId: string): ControlesGrupoTablero | null {
    const grupo = agendaGruposSesion.find((g: AgendaGrupoSesionApp) => g.grupo_id === grupoId);
    if (!grupo) return null;
    const principal = grupo.entrenador_id || null;
    const apoyo = grupo.entrenador_apoyo_id || null;
    const tercero = grupo.entrenador_tercero_id || null;
    const aOpcion = (e: EntrenadorResumen, prefijo = '') => ({ valor: prefijo + e.entrenador_id, texto: String(e.nombre_completo || '') });
    const disponibles = (entrenadoresDisponiblesCambioGrupoAgenda(grupo.grupo_id, principal, apoyo) as EntrenadorResumen[])
      .filter((e) => e.entrenador_id !== principal && e.entrenador_id !== tercero);
    const idsDisponibles = new Set(disponibles.map((e) => e.entrenador_id));
    const excepcionales = (entrenadoresExcepcionalesCambioGrupoAgenda(grupo.grupo_id, principal, apoyo) as EntrenadorResumen[])
      .filter((e) => e.entrenador_id !== principal && e.entrenador_id !== tercero && !idsDisponibles.has(e.entrenador_id));
    const entrenador: SelectTablero = {
      texto: principal ? `${nombreEntrenadorAgenda(principal, grupo.entrenador)} ▾` : 'Sin entrenador ▾',
      falta: !principal,
      grupos: [
        { etiqueta: excepcionales.length ? 'Con disponibilidad' : undefined, opciones: disponibles.map((e) => aOpcion(e)) },
        { etiqueta: 'Otros (asignación excepcional)', opciones: excepcionales.map((e) => aOpcion(e, 'x:')) },
        { opciones: principal ? [{ valor: '__quitar', texto: 'Quitar entrenador' }] : [] },
      ],
    };
    const segundo: SelectTablero | null = principal
      ? {
          texto: apoyo
            ? `+ ${nombreEntrenadorAgenda(apoyo)}${tercero ? ` + ${nombreEntrenadorAgenda(tercero)}` : ''} ▾`
            : '+ 2º ▾',
          grupos: [
            {
              opciones: (entrenadoresDisponiblesCambioGrupoAgenda(grupo.grupo_id, apoyo, principal) as EntrenadorResumen[])
                .filter((e) => e.entrenador_id !== apoyo && e.entrenador_id !== tercero && e.entrenador_id !== principal)
                .map((e) => aOpcion(e)),
            },
            { opciones: apoyo ? [{ valor: '__quitar', texto: 'Quitar segundo entrenador' }] : [] },
          ],
        }
      : null;
    const particular = esNombreGrupoParticularApp(grupo.nombre_grupo);
    const punto: SelectTablero | null = particular
      ? null
      : {
          texto: grupo.punto_encuentro ? `Punto ${grupo.punto_encuentro} ▾` : 'Sin punto ▾',
          falta: !grupo.punto_encuentro,
          grupos: [
            {
              opciones: opcionesPuntoEncuentro(puntosEncuentroAgenda, grupo.grupo_id, gruposRecursosTurnoAgenda(), grupo.punto_encuentro)
                .filter((o) => o.punto !== grupo.punto_encuentro)
                .map((o) => ({ valor: o.punto, texto: textoOpcionPunto(o) })),
            },
          ],
        };
    const total = Number(grupo.total_alumnos || 0);
    const pistaActual = String(grupo.pista || '');
    const pista: SelectTablero = {
      texto: pistaActual || 'Sin pista',
      grupos: [{ opciones: ['Pequeña', 'Grande', 'Pequeña/Grande'].filter((p) => p !== pistaActual).map((p) => ({ valor: p, texto: p })) }],
    };
    return {
      entrenador,
      segundo,
      punto,
      pista,
      particular: particular ? 'quitar' : total >= 1 && total <= 2 ? 'hacer' : null,
      masOpciones: Boolean(principal && apoyo),
      soloConsulta: Boolean(ctx.esSoloConsultaUsuarioApp),
    };
  }

  function accionGrupoTableroAgenda(grupoId: string, accion: AccionGrupoTablero, valor = '') {
    const grupo = agendaGruposSesion.find((g: AgendaGrupoSesionApp) => g.grupo_id === grupoId);
    if (!grupo) return;
    if (accion === 'entrenador') {
      if (valor === '__quitar') void cambiarEntrenadorGrupoAgenda(grupo, '', false);
      else if (valor.startsWith('x:')) void cambiarEntrenadorGrupoAgenda(grupo, valor.slice(2), true);
      else void cambiarEntrenadorGrupoAgenda(grupo, valor, false);
    } else if (accion === 'segundo') {
      void cambiarSegundoEntrenadorGrupoAgenda(grupo, valor === '__quitar' ? '' : valor);
    } else if (accion === 'punto') {
      const aviso = avisoCompartirPunto(
        opcionesPuntoEncuentro(puntosEncuentroAgenda, grupo.grupo_id, gruposRecursosTurnoAgenda(), grupo.punto_encuentro).find((o) => o.punto === valor)
      );
      if (aviso && !window.confirm(aviso)) return;
      void cambiarPuntoGrupoAgenda(grupo, valor);
    } else if (accion === 'pista') {
      // 25/11: corrección manual de la pista (se vuelve a calcular sola si cambian sus niños).
      void (async () => {
        try {
          setError('');
          await ejecutarFuncionAuthJson('cambiar_pista_grupo_app', { p_grupo_id: grupo.grupo_id, p_pista: valor });
          if (agendaSesionActivaId) await cargarDetalleSesionAgenda(agendaSesionActivaId);
          await cargarAgendaOperativaDirecta();
        } catch (err) {
          setError(err instanceof Error ? err.message : 'No se pudo cambiar la pista.');
        }
      })();
    } else if (accion === 'particular') {
      void marcarGrupoParticular(grupo);
    } else if (accion === 'borrar') {
      void borrarGrupoAgenda(grupo);
    } else if (accion === 'mas') {
      setGrupoAjustesTablero(grupoId);
    }
  }

  function puedeGrupoNuevoAgenda(grupo: AgendaGrupoSesionApp, contextoIntensivo: unknown) {
    return !contextoIntensivo && !esNombreGrupoParticularApp(grupo.nombre_grupo) && Number(grupo.total_alumnos || 0) >= 2;
  }

  async function dividirGrupoAgenda(grupo: AgendaGrupoSesionApp, alumnosIds: string[]): Promise<boolean> {
    const ninos = ninosParaDividirAgenda(grupo).filter((n) => alumnosIds.includes(n.alumno_id));
    if (!ninos.length) return false;
    const niveles = nivelesDe(ninos.map((n) => n.nivel));
    const nombre = `Grupo ${(agendaGruposSesion as AgendaGrupoSesionApp[]).length + 1} · Nivel ${niveles}`;
    const comoPropuesta = ninos.map((n) => {
      const a = (agendaAlumnosSesion as AgendaAlumnoSesionApp[]).find((x) => x.alumno_id === n.alumno_id);
      return {
        sesion_id: grupo.sesion_id, alumno_id: n.alumno_id, alumno: n.alumno, nivel_resumen: n.nivel || '',
        pista_recomendada: a?.pista_recomendada || grupo.pista || '', pista_alumno: a?.pista_recomendada || grupo.pista || '',
        grupo_recomendado: nombre, bloque_tecnico: niveles, orden_en_grupo: 0, alertas: null,
      } as unknown as AgendaRecomendacionSesionApp;
    });
    if (!window.confirm(`¿Crear «${nombre}» con ${ninos.map((n) => n.alumno).join(', ')}?\n\nSe crea sin publicar y sin entrenador. Los demás se quedan en ${grupo.nombre_grupo}.`)) return false;
    setError('');
    try {
      await ejecutarFuncionAuthJson('dividir_grupo_sesion_operativa_app', {
        p_grupo_id: grupo.grupo_id,
        p_alumnos_ids: ninos.map((n) => n.alumno_id),
        p_nombre_grupo: nombre,
        p_nivel_grupo: niveles,
        p_trabajo_diario: trabajoDiarioAutomaticoAgenda(nombre, comoPropuesta),
      });
      if (agendaSesionActivaId) await cargarDetalleSesionAgenda(agendaSesionActivaId, { preservarScroll: true });
      await cargarAgendaOperativaDirecta();
      await cargarPlanning();
      await cargarGruposEntrenador();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo dividir el grupo.');
      return false;
    }
  }

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

  // Cambio de turno MANUAL (decide coordinación): mueve al niño a cualquier
  // turno Baby de la semana SIN grupo. Allí queda pendiente de colocar y se
  // decide el grupo (y si hace falta un segundo entrenador). Mismo RPC que
  // "Padres OK · mover a este turno", sin grupo destino.
  const [turnoManualPorAlumno, setTurnoManualPorAlumno] = useState<Record<string, string>>({});
  const turnosBabySemanaManual: { sesionId: string; etiqueta: string }[] = (
    diasSemanaAgenda as any[]
  ).flatMap((dia: any) =>
    (sesionesDelDiaAgenda(dia.fecha) as any[])
      .filter(
        (sesion: any) =>
          sesion.origen === 'operativa' &&
          sesion.agendaDirecta?.sesion_id &&
          sesion.agendaDirecta.sesion_id !== agendaSesionActivaId &&
          String(sesion.modalidad || '').trim().toUpperCase() === 'BABY'
      )
      .map((sesion: any) => ({
        sesionId: sesion.agendaDirecta.sesion_id,
        etiqueta: `${etiquetaDiaFechaAgenda(sesion.fecha)} · ${String(sesion.hora_inicio || '').slice(0, 5)}–${String(sesion.hora_fin || '').slice(0, 5)} · ${Number(sesion.totalAlumnos || 0)} niños`,
      }))
  );

  async function moverAlumnoTurnoManualBaby(alumno: AgendaRecomendacionSesionApp) {
    const sesionDestinoId = turnoManualPorAlumno[alumno.alumno_id] || '';
    const destino = turnosBabySemanaManual.find((turno) => turno.sesionId === sesionDestinoId);
    if (!destino) {
      setError('Elige primero el turno al que quieres mover al niño.');
      return;
    }
    const alumnoSesion = agendaAlumnosSesion.find(
      (registro: any) => registro.alumno_id === alumno.alumno_id
    );
    if (!alumnoSesion?.sesion_alumno_id) {
      setError('No encuentro al alumno en la sesión actual. Actualiza la sesión y vuelve a intentarlo.');
      return;
    }
    if (
      !window.confirm(
        `Mover a ${alumno.alumno}\n\n${destino.etiqueta}\n\nEntra en ese turno SIN grupo: allí lo colocas en el grupo que quieras (y pones 2 entrenadores si hace falta).\n\n¿Confirmas el cambio de turno?`
      )
    ) {
      return;
    }
    setMoviendoAlumnoTurnoId(alumno.alumno_id);
    setError('');
    try {
      await moveBabyStudentBetweenSessions({
        sourceSessionStudentId: alumnoSesion.sesion_alumno_id,
        targetSessionId: sesionDestinoId,
        targetGroupId: null,
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

  // «Colocar» desde la ventana de la semana: abre la sesión y, en cuanto su
  // listado está cargado, lanza la misma acción que el botón de dentro.
  useEffect(() => {
    if (!accionSinColocarPendiente) return;
    const limite = window.setTimeout(() => setAccionSinColocarPendiente(null), 10000);
    return () => window.clearTimeout(limite);
  }, [accionSinColocarPendiente]);

  useEffect(() => {
    const accion = accionSinColocarPendiente;
    if (!accion || agendaSesionActivaId !== accion.sesionId) return;
    const cargada = (agendaAlumnosSesion as any[]).some((a) => String(a.sesion_id) === accion.sesionId);
    if (!cargada) return;
    setAccionSinColocarPendiente(null);
    setAgendaMostrarPendientesColocar(true);
    const alumno = alumnosPendientesColocar.find(
      (a) => String(a.sesion_alumno_id) === accion.sesionAlumnoId
    );
    if (!alumno) {
      requestAnimationFrame(() =>
        document.getElementById('agenda-pendientes-colocar')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      );
      return;
    }
    if (alumno.estado_en_listado === 'PENDIENTE_TEST') abrirAltaTestDesdeAgenda(alumno);
    else abrirBusquedaGrupoParaAlumnoPendiente(alumno);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accionSinColocarPendiente, agendaSesionActivaId, agendaAlumnosSesion, alumnosPendientesColocar.length]);

  async function marcarGrupoParticular(grupo: { grupo_id: string; nombre_grupo: string | null; total_alumnos?: number | null }) {
    const quitar = esNombreGrupoParticularApp(grupo.nombre_grupo);
    const texto = quitar
      ? `¿Quitar «particular» a este grupo?\n\nVolverá a ser un grupo normal: necesitará punto de encuentro y se le podrán proponer más niños.`
      : `¿Hacer clase PARTICULAR con estos ${grupo.total_alumnos} niños?\n\nNo se le propondrán más niños, no necesita punto de encuentro (CON JOSE) y el grupo pasará a llamarse «PARTICULAR · …».`;
    if (!window.confirm(texto)) return;
    setError('');
    try {
      await ejecutarFuncionAuthJson('marcar_grupo_particular_app', { p_grupo_id: grupo.grupo_id, p_particular: !quitar });
      await cargarDetalleSesionAgenda(agendaSesionActivaId);
      await cargarAgendaOperativaDirecta();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cambiar la clase particular.');
    }
  }

  // «Abrir sesión» / «Crear Alta / Test» desde la tabla de sin colocar: abre
  // la sesión y lanza la acción de ese niño en cuanto su listado carga.
  function abrirSesionDesdeSinColocar(sesionId: string, sesionAlumnoId?: string) {
    const p = pendientesTablero.pendientes.find((x) => idSesionDbTablero(x.sesion) === sesionId);
    if (!p) return;
    setVerSinColocarSemana(false);
    setAccionSinColocarPendiente({ sesionId, sesionAlumnoId: sesionAlumnoId || '' });
    abrirPendienteTablero(p, 'sin_colocar');
  }

  // Sesiones de la semana con su id real (para la tabla de sin colocar).
  const sesionesPlanSinColocar: SesionPlan[] = diasTableroSemana.flatMap(
    (d: { fecha: string; sesiones: SesionAgendaOperativa[] }) =>
      d.sesiones
        .filter((s) => idSesionDbTablero(s))
        .map((s) => ({
          sesionId: idSesionDbTablero(s),
          fecha: d.fecha,
          hora_inicio: String(s.hora_inicio || ''),
          hora_fin: String(s.hora_fin || ''),
          modalidad: String(s.modalidad || ''),
        }))
  );

  return (
    <>
      {pantalla === 'agenda' && (
        <section
          style={agendaShellCompacto}
          className={`ag-shell${agendaFormularioAbierto || agendaSesionActivaId ? ' ag-shell--con-panel' : ''}`}
        >
          {/* 20/11: cabecera compacta (mismo verde). La semana se cambia con ‹ ›;
              las acciones de la semana van en «Semana ⋯»; los avisos, en una fila. */}
          <article className="ag-cab">
            <div className="ag-cab-l1">
              <div className="ag-cab-tit">
                <small>ENTRENAMIENTOS</small>
                <b>Días de entrenamiento</b>
              </div>
              <div className="ag-cab-sem" aria-label="Semana">
                <button type="button" title="Semana anterior" aria-label="Semana anterior" disabled={!semanaVecinaAgenda(-1)} onClick={() => irSemanaVecinaAgenda(-1)}>‹</button>
                <span>{semanaAgendaActiva ? rangoSemanaAgenda(semanaAgendaActiva) : 'Sin semana'}</span>
                <button type="button" title="Semana siguiente" aria-label="Semana siguiente" disabled={!semanaVecinaAgenda(1)} onClick={() => irSemanaVecinaAgenda(1)}>›</button>
              </div>
              <div className="ag-cab-acc">
                <button
                  type="button"
                  className="ag-cab-btn"
                  disabled={actualizandoAgenda}
                  title="Vuelve a leer los datos de la semana"
                  onClick={async () => {
                    // 05/11: antes no recargaba los avisos de la semana (por revisar,
                    // sin colocar, pistas, cancelados) ni decía nada. Ahora sí.
                    setActualizandoAgenda(true);
                    try {
                      await Promise.allSettled([
                        cargarAgendaOperativaDirecta(),
                        cargarIntensivos(),
                        cargarPlanning(),
                        cargarListados(),
                        cargarEntrenadores(),
                        cargarAsignacionesEntrenadoresSemana(),
                        agendaSesionActivaId ? cargarDetalleSesionAgenda(agendaSesionActivaId) : Promise.resolve(),
                      ]);
                      await cargarExtrasTableroSemana();
                      setRefrescoAgenda((n) => n + 1);
                    } finally {
                      setActualizandoAgenda(false);
                    }
                  }}
                >
                  {actualizandoAgenda ? 'Actualizando…' : '↻ Actualizar'}
                </button>
                <button
                  type="button"
                  className={`ag-cab-btn${menuSemanaAgendaAbierto ? ' is-on' : ''}`}
                  aria-expanded={menuSemanaAgendaAbierto}
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuSemanaAgendaAbierto((v) => !v);
                  }}
                >
                  {babyAimHarderCargandoSemana ? 'Cargando semana…' : cerrandoSemanaPushApp ? 'Avisando…' : 'Semana ⋯'}
                </button>
                {menuSemanaAgendaAbierto && (
                  <div className="ag-cab-menu" onClick={(e) => e.stopPropagation()}>
                    {esCoordinadorApp && (
                      <>
                        <button
                          type="button"
                          disabled={
                            babyAimHarderCargandoSemana ||
                            babyAimHarderFormularioCargando ||
                            Boolean(babyAimHarderSesionCargandoId) ||
                            !semanaAgendaActiva
                          }
                          onClick={() => {
                            setMenuSemanaAgendaAbierto(false);
                            void cargarSemanaBabyDesdeAimHarder();
                          }}
                        >
                          📥 Cargar semana Baby desde AimHarder
                          <small>Trae los listados de la semana</small>
                        </button>
                        <button
                          type="button"
                          disabled={cerrandoSemanaPushApp || !semanaAgendaActiva}
                          onClick={() => {
                            setMenuSemanaAgendaAbierto(false);
                            void cerrarOrganizacionSemanalPushApp(semanaAgendaActiva);
                          }}
                        >
                          ✅ Cerrar semana y avisar
                          <small>Publica lo pendiente y avisa a los entrenadores</small>
                        </button>
                      </>
                    )}
                    <label className="ag-cab-temp">
                      Temporada
                      <select
                        value={anioInicioTemporadaAgenda}
                        onChange={(e) => {
                          const nuevoAnio = Number(e.target.value);
                          setAnioInicioTemporadaAgenda(nuevoAnio);
                          setMesAgenda(`${nuevoAnio}-09`);
                          setSemanaAgendaInicio('');
                          setAgendaDiaCompactoActivo('');
                          setAgendaSesionActivaId('');
                          setAgendaFormularioAbierto(false);
                          setMenuSemanaAgendaAbierto(false);
                        }}
                      >
                        {opcionesTemporadaAgenda.map((anio) => (
                          <option key={anio} value={anio}>
                            {nombreTemporadaAgenda(anio)}
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>
                )}
                {renderAyudaRapidaPantallaApp()}
              </div>
            </div>

            <div className="ag-cab-avisos">
                    <div
                      className={`ag-pendientes${pendientesTablero.total === 0 ? ' is-al-dia' : ''}`}
                      aria-label="Lo que falta esta semana"
                    >
                      {pendientesTablero.total === 0 ? (
                        <span className="ag-pendientes-ok">✓ Semana al día: no falta nada desde hoy.</span>
                      ) : (
                        <>
                          <span className="ag-pendientes-titulo">Falta esta semana:</span>
                          {(Object.keys(ETIQUETA_MOTIVO) as MotivoPendiente[])
                            .filter((m) => pendientesTablero.contadores[m] > 0)
                            .map((m) => (
                              <button
                                key={m}
                                type="button"
                                className={`ag-chip ag-chip--${m}`}
                                onClick={() => {
                                  if (m === 'sin_colocar') {
                                    setVerSinColocarSemana(true);
                                    return;
                                  }
                                  abrirPendienteTablero(
                                    siguientePendiente(pendientesTablero.pendientes, '', m),
                                    m
                                  );
                                }}
                              >
                                <strong>{pendientesTablero.contadores[m]}</strong>{' '}
                                {ETIQUETA_MOTIVO[m][pendientesTablero.contadores[m] === 1 ? 0 : 1]}
                              </button>
                            ))}
                          <button
                            type="button"
                            className="ag-boton ag-boton--principal ag-siguiente"
                            onClick={() => abrirPendienteTablero(siguientePendienteTablero || pendientesTablero.pendientes[0])}
                          >
                            Siguiente pendiente →
                          </button>
                        </>
                      )}
                    </div>

                  {esCoordinadorApp && babyAimHarderMensaje && <PacoAimHarderResumen mensaje={babyAimHarderMensaje} />}
                      {esCoordinadorApp && babyAimHarderError && (
                        <div
                          style={{
                            padding: '8px 10px',
                            borderRadius: 10,
                            background: 'rgba(255,247,237,.98)',
                            border: '1px solid rgba(251,146,60,.75)',
                            color: '#9a3412',
                            fontSize: 12,
                            fontWeight: 700,
                            lineHeight: 1.4,
                            whiteSpace: 'pre-line',
                          }}
                        >
                          {babyAimHarderError}
                        </div>
                      )}
                {/* 11/11: avisos en fila; los plegados quedan como pastillas pequeñas. */}
                {esCoordinadorApp && (
                  <div className="agenda-avisos-fila" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'flex-start', minWidth: 0 }}>
                  {esCoordinadorApp && (
                    <CanceladosAimHarderAviso
                      hoyIso={hoyTableroSemana}
                      refresco={refrescoAgenda}
                      soloLectura={Boolean(ctx.esSoloConsultaUsuarioApp)}
                      onCambios={async () => {
                        await cargarAgendaOperativaDirecta();
                      }}
                    />
                  )}

                  {/* 11/11: A+ preparados para la pista grande (también alimenta el recomendador). */}
                  {<PreparadosGrandeAviso refresco={refrescoAgenda} semanaInicio={semanaAgendaActiva || ''} />}

                  {/* 11/11: niño en varios turnos la misma semana (invitado sin quitar la reserva antigua). */}
                  {esCoordinadorApp && (
                    <RepetidosSemanaAviso
                      hoyIso={hoyTableroSemana}
                      refresco={refrescoAgenda}
                      soloLectura={Boolean(ctx.esSoloConsultaUsuarioApp)}
                      onCambios={async () => {
                        await cargarAgendaOperativaDirecta();
                      }}
                    />
                  )}
                  </div>
                )}
                {esCoordinadorApp && altasPaco && (
                  <PacoAltasAviso
                    aviso={altasPaco}
                    onEnviar={enviarAltaPacoWhatsapp}
                    onAbrirAlta={abrirAltaTestDesdeAgenda}
                    onCerrar={() => setAltasPaco(null)}
                  />
                )}
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
                const hoyTablero = new Intl.DateTimeFormat('en-CA', {
                  timeZone: 'Europe/Madrid',
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }).format(new Date());
                const diaActivo =
                  diasSemanaAgenda.find(
                    (dia) => dia.fecha === agendaDiaCompactoActivo
                  ) || diasSemanaAgenda[0];
                const sesionesDia = diaActivo
                  ? sesionesDelDiaAgenda(diaActivo.fecha)
                  : [];
                return (
                  <div className="ag-tablero">
                    <div className="ag-dias" role="tablist" aria-label="Días de la semana">
                      {diasSemanaAgenda.map((dia) => {
                        const sesionesDiaBoton = sesionesDelDiaAgenda(
                          dia.fecha
                        ) as SesionAgendaOperativa[];
                        const resumen = resumenDia(sesionesDiaBoton);
                        const estadoCalculado = estadoDia(sesionesDiaBoton, (s) =>
                          sessionTrainerCoverage(
                            s as SesionAgendaOperativa,
                            agendaTrainerAssignmentRows
                          )
                        );
                        // 20/11: mientras no han llegado los entrenadores de la
                        // semana, el punto sale gris (cargando), no naranja.
                        const estado =
                          estadoCalculado === 'pendiente' && !asignacionesSemanaListas
                            ? 'cargando'
                            : estadoCalculado;
                        const activo = dia.fecha === diaActivo.fecha;
                        const esHoy = dia.fecha === hoyTablero;
                        const pasado = dia.fecha < hoyTablero;

                        return (
                          <button
                            key={dia.fecha}
                            type="button"
                            role="tab"
                            aria-selected={activo}
                            className={`ag-dia ag-dia--${estado}${activo ? ' is-activo' : ''}${esHoy ? ' is-hoy' : ''}${pasado ? ' is-pasado' : ''}`}
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
                          >
                            <span className="ag-dia-nombre">
                              <span className="ag-dia-punto" aria-hidden="true" />
                              {dia.nombre}
                              {esHoy && <span className="ag-dia-hoy">hoy</span>}
                            </span>
                            <span className="ag-dia-fecha">
                              {fechaAgendaDiaCorta(dia.fecha)}
                            </span>
                            <span className="ag-dia-resumen">
                              {estado === 'vacio' ? 'Sin sesiones' : resumen.texto}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    <article id="agenda-dia-seleccionado" className="ag-dia-panel">
                      <header className="ag-dia-cabecera">
                        <h3>
                          {diaActivo.nombre} ·{' '}
                          {fechaAgendaCortaConAnio(diaActivo.fecha)}
                        </h3>
                        <p>
                          {resumenDia(sesionesDia as SesionAgendaOperativa[]).texto}
                          {turnosTrabajoDiaAgenda(diaActivo.fecha).length > 0 &&
                            ` · ${turnosTrabajoDiaAgenda(diaActivo.fecha).length} ${turnosTrabajoDiaAgenda(diaActivo.fecha).length === 1 ? 'turno' : 'turnos'}`}
                        </p>
                        {(() => {
                          // 05/11: total del día por pista.
                          const t = textoPistas(
                            sumarConteosPista(
                              (sesionesDia as SesionAgendaOperativa[]).map((x) => extrasTablero[idSesionDbTablero(x)]?.pistas)
                            )
                          );
                          return t ? <p className="ag-pistas ag-pistas--dia">⛷️ Pista: {t}</p> : null;
                        })()}
                      </header>

                      {(() => {
                        const columnas = columnasDelDia(
                          turnosTrabajoDiaAgenda(diaActivo.fecha),
                          sesionesDia as SesionAgendaOperativa[]
                        );
                        if (!columnas.length) {
                          return (
                            <div className="ag-vacio">
                              <strong>Sin sesiones en este día.</strong>
                              <p>
                                Este día no tiene turnos de Baby. Ocio se prepara
                                desde Grupos estables e Intensivos desde su flujo
                                correspondiente.
                              </p>
                            </div>
                          );
                        }
                        return (
                          <div
                            className="ag-turnos"
                            style={{ ['--ag-cols' as any]: Math.min(columnas.length, 3) }}
                          >
                            {columnas.map((columna) => (
                              <section key={columna.clave} className="ag-turno">
                                <div className="ag-turno-hora">
                                  <span>{columna.etiqueta}</span>
                                  {columna.turno &&
                                    (() => {
                                      const disp = disponiblesEnTurno(
                                        disponibilidadTablero,
                                        diaActivo.fecha,
                                        columna.turno.inicio,
                                        columna.turno.fin,
                                        entrenadoresActivosTablero.size ? entrenadoresActivosTablero : null
                                      );
                                      if (disp === null) return null;
                                      const gruposTurno = columna.sesiones.reduce(
                                        (t, s) => t + Number(s.totalGrupos || 0),
                                        0
                                      );
                                      const corto = gruposTurno > disp;
                                      return (
                                        <span
                                          className={`ag-turno-dispo${corto ? ' is-corto' : ''}`}
                                          title={corto ? 'Hay más grupos que entrenadores disponibles en este turno' : 'Entrenadores que han dicho «Disponible» en este turno'}
                                        >
                                          {gruposTurno > 0 ? `${gruposTurno} ${gruposTurno === 1 ? 'grupo' : 'grupos'} · ` : ''}
                                          {disp} {disp === 1 ? 'entrenador disponible' : 'entrenadores disponibles'}
                                          {corto ? ' ⚠️' : ''}
                                        </span>
                                      );
                                    })()}
                                  {(() => {
                                    const t = textoPistas(
                                      sumarConteosPista(columna.sesiones.map((x) => extrasTablero[idSesionDbTablero(x)]?.pistas))
                                    );
                                    return t && columna.turno ? <span className="ag-pistas">⛷️ {t}</span> : null;
                                  })()}
                                </div>
                                {columna.sesiones.map((sesion) => {
                                  const cobertura = sessionTrainerCoverage(
                                    sesion,
                                    agendaTrainerAssignmentRows
                                  );
                                  const { pasos, botonPrincipal } = pasosSesion(
                                    sesion,
                                    cobertura
                                  );
                                  const modalidad = String(sesion.modalidad || '')
                                    .trim()
                                    .toUpperCase();
                                  const esBabyOperativa =
                                    sesion.origen === 'operativa' &&
                                    modalidad === 'BABY';
                                  return (
                                    <article
                                      key={sesion.id}
                                      data-agenda-session-date={sesion.fecha}
                                      data-agenda-session-time={`${String(
                                        sesion.hora_inicio || ''
                                      ).slice(0, 5)} - ${String(
                                        sesion.hora_fin || ''
                                      ).slice(0, 5)}`}
                                      className={`ag-sesion ag-sesion--${modalidad.toLowerCase().replace(/[^a-z]/g, '') || 'otra'}${
                                        agendaSesionActivaId &&
                                        (sesion.agendaDirecta?.sesion_id === agendaSesionActivaId ||
                                          (sesion.dia as { sesion_id?: string } | undefined)?.sesion_id === agendaSesionActivaId)
                                          ? ' is-abierta'
                                          : ''
                                      }`}
                                      title={sesion.estado}
                                    >
                                      <div className="ag-sesion-top">
                                        <span className="ag-sesion-modalidad">
                                          {sesion.modalidad}
                                        </span>
                                        {(!columna.turno ||
                                          String(sesion.hora_inicio || '').slice(0, 5) !== columna.turno.inicio ||
                                          String(sesion.hora_fin || '').slice(0, 5) !== columna.turno.fin) && (
                                          <span className="ag-sesion-horario">
                                            {sesion.hora_inicio?.slice(0, 5)}–
                                            {sesion.hora_fin?.slice(0, 5)}
                                          </span>
                                        )}
                                        <span className="ag-sesion-cifras">
                                          <strong>{sesion.totalAlumnos}</strong>{' '}
                                          {Number(sesion.totalAlumnos) === 1 ? 'niño' : 'niños'} ·{' '}
                                          <strong>{sesion.totalGrupos}</strong>{' '}
                                          {Number(sesion.totalGrupos) === 1 ? 'grupo' : 'grupos'}
                                        </span>
                                      </div>
                                      <div className="ag-sesion-titulo">{sesion.titulo}</div>
                                      {(() => {
                                        const t = textoPistas(extrasTablero[idSesionDbTablero(sesion)]?.pistas);
                                        return t ? <div className="ag-pistas ag-pistas--sesion">⛷️ {t}</div> : null;
                                      })()}
                                      {(() => {
                                        const ex = extrasTablero[idSesionDbTablero(sesion)];
                                        if (!ex || (!ex.revisar && !ex.notas && !ex.sinConfirmar && !ex.sinColocar)) return null;
                                        return (
                                          <div className="ag-avisos">
                                            {Number(ex.sinColocar || 0) > 0 && (
                                              <button
                                                type="button"
                                                className="ag-aviso ag-aviso--colocar"
                                                title="Niños en el listado que no están en ningún grupo"
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  setVerSinColocarSemana(true);
                                                }}
                                              >
                                                📌 {ex.sinColocar} sin colocar
                                              </button>
                                            )}
                                            {ex.revisar > 0 && (
                                              <span className="ag-aviso ag-aviso--revisar" title="Niños nuevos (pendientes de test) o con la ficha sin completar">
                                                🆕 {ex.revisar} por revisar
                                              </span>
                                            )}
                                            {ex.notas > 0 && (
                                              <span className="ag-aviso ag-aviso--nota" title="Niños de esta sesión con notas tuyas en Paco">
                                                📝 {ex.notas} con nota
                                              </span>
                                            )}
                                            {ex.sinConfirmar > 0 && (
                                              <span className="ag-aviso ag-aviso--confirmar" title="Grupos publicados que el entrenador aún no ha confirmado">
                                                🔄 {ex.sinConfirmar} sin confirmar
                                              </span>
                                            )}
                                          </div>
                                        );
                                      })()}
                                      <ol className="ag-pasos" aria-label="Estado de la sesión">
                                        {pasos.map((paso) => (
                                          <li key={paso.clave} className={`ag-paso ag-paso--${paso.estado}`}>
                                            {paso.estado === 'hecho' ? '✓ ' : ''}
                                            {paso.etiqueta}
                                          </li>
                                        ))}
                                      </ol>
                                      <SessionTrainerCoverageLine
                                        coverage={cobertura}
                                        publishedGroups={Number(sesion.publicados || 0)}
                                      />
                                      <div className="ag-sesion-acciones">
                                        <button
                                          type="button"
                                          className="ag-boton ag-boton--principal"
                                          onClick={() =>
                                            abrirSesionAgenda(
                                              sesion,
                                              sesion.totalGrupos > 0
                                                ? 'grupos'
                                                : 'alumnos'
                                            )
                                          }
                                        >
                                          {botonPrincipal}
                                        </button>
                                        {esBabyOperativa && (
                                          <button
                                            type="button"
                                            className="ag-boton"
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
                                          >
                                            {babyAimHarderSesionCargandoId ===
                                            sesion.agendaDirecta?.sesion_id
                                              ? 'Refrescando…'
                                              : 'Refrescar listado'}
                                          </button>
                                        )}
                                        {sesion.origen === 'operativa' &&
                                          sesion.totalGrupos > 0 && (
                                            <button
                                              type="button"
                                              className="ag-boton"
                                              onClick={() =>
                                                void enviarWhatsAppPapisSesionTarjeta(
                                                  sesion
                                                )
                                              }
                                            >
                                              WhatsApp papis
                                            </button>
                                          )}
                                        {sesion.origen === 'operativa' &&
                                          sesion.agendaDirecta?.sesion_id && (
                                            <details className="ag-mas">
                                              <summary aria-label="Más acciones">⋯</summary>
                                              <div className="ag-mas-menu">
                                                <button
                                                  type="button"
                                                  className="ag-mas-peligro"
                                                  onClick={(e) => {
                                                    (e.currentTarget.closest('details') as HTMLDetailsElement | null)?.removeAttribute('open');
                                                    void borrarSesionAgenda(
                                                      sesion.agendaDirecta!.sesion_id
                                                    );
                                                  }}
                                                >
                                                  Borrar sesión
                                                </button>
                                              </div>
                                            </details>
                                          )}
                                      </div>
                                    </article>
                                  );
                                })}
                                {columna.turno && !columna.tieneBaby && (
                                  <button
                                    type="button"
                                    className="ag-anadir"
                                    onClick={() =>
                                      abrirFormularioAgendaDia(
                                        diaActivo.fecha,
                                        columna.turno!.inicio,
                                        columna.turno!.fin,
                                        'BABY'
                                      )
                                    }
                                  >
                                    + Añadir Baby
                                  </button>
                                )}
                              </section>
                            ))}
                          </div>
                        );
                      })()}
                    </article>
                  </div>
                );
              })()
            )}
          </section>

          {/* El panel cuelga de <body>: dentro de la Agenda una animación general
              (miticoFadeUp) deja un transform que lo «atrapaba» y la barra de
              Volver/Cerrar quedaba fuera de la pantalla. */}
          <SinColocarPanel
            abierta={verSinColocarSemana && !ctx.esSoloConsultaUsuarioApp /* «Solo consulta»: sin recomendador de colocación */}
            onCerrar={() => setVerSinColocarSemana(false)}
            sesiones={sesionesPlanSinColocar}
            hoyIso={hoyTableroSemana}
            consultarSupabase={consultarSupabase}
            ejecutarFuncionAuthJson={ejecutarFuncionAuthJson}
            normalizarNombre={normalizarNombreAlumnoAgendaApp}
            onAbrirSesion={abrirSesionDesdeSinColocar}
            onCambios={async () => {
              await cargarAgendaOperativaDirecta();
              await Promise.all([cargarAsignacionesEntrenadoresSemana(), cargarExtrasTableroSemana()]);
            }}
            soloLectura={Boolean(ctx.esSoloConsultaUsuarioApp)}
            fichas={alumnos}
            avisarCambioGrupo={async (grupoId: string) => {
              await notifyGroupChangedAndRequestReconfirmation({
                groupId: grupoId,
                runFunction: ejecutarFuncionAuthJson,
                sendPush: ejecutarPushMiticoApp,
                reload: async () => {
                  await cargarAgendaOperativaDirecta();
                },
              });
            }}
          />
          {(agendaFormularioAbierto || agendaSesionActivaId) && typeof document !== 'undefined' && createPortal(
            <section
              id="trabajo-agenda"
              className="ag-trabajo"
              role="dialog"
              aria-label={agendaFormularioAbierto ? 'Pegar listado' : 'Sesión abierta'}
            >
              <div className="ag-trabajo-cabecera">
                <button
                  type="button"
                  className="ag-trabajo-volver"
                  onClick={cerrarPanelTrabajoAgenda}
                  aria-label="Cerrar y volver al tablero"
                >
                  ✕
                </button>
                <h3>
                  {agendaFormularioAbierto
                    ? 'Pegar listado'
                    : (() => {
                        // Día y turno de la sesión abierta, para saber siempre cuál es.
                        const dia = diasTableroSemana.find((d: { sesiones: SesionAgendaOperativa[] }) =>
                          d.sesiones.some((x) => idSesionDbTablero(x) === agendaSesionActivaId)
                        );
                        const ses = dia?.sesiones.find((x: SesionAgendaOperativa) => idSesionDbTablero(x) === agendaSesionActivaId);
                        if (!dia || !ses) return 'Sesión abierta';
                        const nombreDia = new Date(`${dia.fecha}T12:00:00`).toLocaleDateString('es-ES', {
                          weekday: 'long',
                          day: '2-digit',
                          month: '2-digit',
                        });
                        return (
                          <>
                            {nombreDia.charAt(0).toUpperCase() + nombreDia.slice(1)} · {String(ses.hora_inicio || '').slice(0, 5)}–
                            {String(ses.hora_fin || '').slice(0, 5)}
                            <span className="ag-trabajo-modalidad">{ses.modalidad}</span>
                          </>
                        );
                      })()}
                </h3>
                {!agendaFormularioAbierto && anteriorPendienteTablero && (
                  <button
                    type="button"
                    className="ag-trabajo-anterior"
                    onClick={() => abrirPendienteTablero(anteriorPendienteTablero)}
                    title="Volver a la sesión pendiente anterior"
                  >
                    ← Anterior
                  </button>
                )}
                {!agendaFormularioAbierto && siguientePendienteTablero && (
                  <button
                    type="button"
                    className="ag-trabajo-siguiente"
                    onClick={() => abrirPendienteTablero(siguientePendienteTablero)}
                    title="Abrir la siguiente sesión que tiene algo pendiente"
                  >
                    Siguiente →
                  </button>
                )}
                <button
                  type="button"
                  className="ag-trabajo-cerrar"
                  onClick={cerrarPanelTrabajoAgenda}
                  aria-label="Cerrar"
                  title="Cerrar (Esc)"
                >
                  ✕
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
                  {/* 19/11: cifras de la sesión en una fila de etiquetas (antes 5 cajas grandes y el título «Sesión seleccionada»). */}
                  {(() => {
                    const totalAlumnosGrupos = agendaGruposSesion.reduce(
                      (total, grupo) => total + Number(grupo.total_alumnos || 0),
                      0
                    );
                    const totalAlumnosOperativos =
                      agendaGruposSesion.length > 0 ? totalAlumnosGrupos : agendaAlumnosSesion.length;
                    const abrirDetectados = (filtro: 'TODOS' | 'NUEVO' | 'CONOCIDO') => {
                      setAgendaFiltroAlumnos(filtro);
                      requestAnimationFrame(() => {
                        const detalle = document.getElementById('agenda-alumnos-detectados') as HTMLDetailsElement | null;
                        if (detalle) detalle.open = true;
                        detalle?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      });
                    };
                    const cifras = [
                      { clave: 'alumnos', valor: totalAlumnosOperativos, texto: 'en grupos', tono: 'ok' as const, onClick: () => abrirDetectados('TODOS') },
                      {
                        clave: 'grupos', valor: agendaGruposSesion.length, texto: agendaGruposSesion.length === 1 ? 'grupo' : 'grupos',
                        onClick: () => {
                          setAgendaPestanaProceso('organizar');
                          requestAnimationFrame(() => document.getElementById('agenda-grupos-creados')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
                        },
                      },
                      { clave: 'test', valor: agendaAlumnosSesion.filter((a) => a.estado_en_listado === 'PENDIENTE_TEST').length, texto: 'pendientes test', onClick: () => abrirDetectados('NUEVO') },
                      { clave: 'conocidos', valor: agendaAlumnosSesion.filter((a) => a.estado_en_listado === 'CONOCIDO').length, texto: 'conocidos', onClick: () => abrirDetectados('CONOCIDO') },
                      ...(agendaGruposSesion.length > 0
                        ? [{
                            clave: 'colocar', valor: alumnosPendientesColocar.length, texto: 'sin colocar',
                            tono: alumnosPendientesColocar.length ? ('aviso' as const) : undefined,
                            onClick: () => {
                              setAgendaPestanaProceso('crear');
                              setAgendaMostrarPendientesColocar(true);
                              requestAnimationFrame(() => document.getElementById('agenda-pendientes-colocar')?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
                            },
                          }]
                        : []),
                    ];
                    return <CifrasSesionAgenda cifras={cifras} />;
                  })()}

                  {esCoordinadorApp && (
                    <PacoNotasSesion
                      sesionId={agendaSesionActivaId}
                      firma={`${firmaGruposAgenda}#${agendaAlumnosSesion.length}`}
                    />
                  )}

                  {/* 19/11: pasos con ✓ y resumen de cómo va cada uno. */}
                  {(() => {
                    const n = agendaGruposSesion.length;
                    const conEnt = agendaGruposSesion.filter((g) => Boolean(g.entrenador_id)).length;
                    const conPunto = agendaGruposSesion.filter((g) => esNombreGrupoParticularApp(g.nombre_grupo) || Boolean(g.punto_encuentro)).length;
                    const pub = agendaGruposSesion.filter((g) => g.publicado).length;
                    const pasos = [
                      { clave: 'crear' as const, num: 1, etiqueta: 'Crear grupos', hecho: n > 0, resumen: n > 0 ? `${agendaAlumnosSesion.length} niños · ${n} ${n === 1 ? 'grupo creado' : 'grupos creados'}` : `${agendaAlumnosSesion.length} niños · sin grupos` },
                      { clave: 'organizar' as const, num: 2, etiqueta: 'Organizar', hecho: n > 0 && conEnt === n && conPunto === n, resumen: n > 0 ? (conEnt === n && conPunto === n ? `${n} con entrenador y punto` : `${conEnt}/${n} con entrenador · ${conPunto}/${n} con punto`) : 'Primero crea los grupos' },
                      { clave: 'publicar' as const, num: 3, etiqueta: 'Publicar', hecho: n > 0 && pub === n, resumen: n > 0 ? `${pub} de ${n} publicados` : 'Nada que publicar aún' },
                    ];
                    return (
                      <div className="gs-pasos">
                        {pasos.map((p) => (
                          <button
                            key={`agenda-paso-${p.clave}`}
                            type="button"
                            className={`gs-paso${p.hecho ? ' is-hecho' : ''}${agendaPestanaProceso === p.clave ? ' is-activo' : ''}`}
                            onClick={() => setAgendaPestanaProceso(p.clave)}
                          >
                            <span className="gs-paso-n">{p.hecho && agendaPestanaProceso !== p.clave ? '✓' : p.num}</span>
                            <span className="gs-paso-txt">
                              <b>{p.num} · {p.etiqueta}</b>
                              <small>{p.resumen}</small>
                            </span>
                          </button>
                        ))}
                      </div>
                    );
                  })()}

                  {agendaPestanaProceso === 'crear' && (
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
                      Recomienda, revisa la composición y crea los grupos. Entrenador y punto se completan después.
                    </div>
                  )}

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
                        // Se abre limpio, sin el último niño buscado.
                        if (abrir) {
                          limpiarBuscadorFueraPlazo();
                          setAvisoFueraPlazoSesion(null);
                        }

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

                      <button
                        type="button"
                        style={{ ...botonSecundario, marginTop: 10, marginLeft: 8 }}
                        disabled={anadiendoFueraPlazoSesion || incorporandoFueraPlazo}
                        onClick={() => void anadirAlumnoFueraPlazoASesionSinGrupo()}
                      >
                        {anadiendoFueraPlazoSesion ? 'Añadiendo…' : 'Añadir a la sesión sin grupo'}
                      </button>

                      {avisoFueraPlazoSesion && (
                        <div
                          style={{
                            marginTop: 10,
                            padding: '10px 12px',
                            borderRadius: 12,
                            fontWeight: 700,
                            border: avisoFueraPlazoSesion.ok ? '1px solid #bbf7d0' : '1px solid #fecaca',
                            background: avisoFueraPlazoSesion.ok ? '#f0fdf4' : '#fff7f7',
                            color: avisoFueraPlazoSesion.ok ? '#166534' : '#991b1b',
                          }}
                        >
                          {avisoFueraPlazoSesion.texto}
                        </div>
                      )}

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
                        const opcionesNoEncajaTurnoActual = opcionesTurnoActual.filter(
                          (opcion) => opcion.estado === 'NO_ENCAJA'
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
                                  : opcion.estado === 'NO_ENCAJA'
                                  ? '1px solid #fca5a5'
                                  : '1px solid #fdba74',
                              background:
                                opcion.estado === 'RECOMENDADO'
                                  ? '#f0fdf4'
                                  : opcion.estado === 'NO_ENCAJA'
                                  ? '#fef2f2'
                                  : '#fff7ed',
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
                                {opcion.estado === 'RECOMENDADO'
                                  ? 'ENCAJA'
                                  : opcion.estado === 'NO_ENCAJA'
                                  ? 'NO ENCAJA'
                                  : 'REVISAR'}
                              </span>
                            </div>
                            <p style={{ margin: '8px 0 0' }}>
                              <strong>{opcion.entrenador || 'Sin entrenador'}</strong> · Punto {opcion.punto} ·{' '}
                              {opcion.total_actual} → {opcion.total_final} niños
                            </p>
                            <p style={{ margin: '6px 0 0', color: '#475569' }}>{opcion.motivo}</p>
                            <NinosGrupoPropuesto
                              grupoId={opcion.grupo_id}
                              fecha={opcion.fecha}
                              version={opcion.total_actual}
                              nuevoNombre={alumnoFueraPlazoNombre}
                              nuevoNivel={alumnoFueraPlazoNivel}
                              fichas={alumnos}
                              consultarSupabase={consultarSupabase}
                            />

                            {/* 25/11 (Jose): en el turno donde se apuntó, se puede meter igualmente aunque no encaje. */}
                            {(opcion.estado !== 'NO_ENCAJA' || opcion.es_sesion_actual) && (
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
                                    : opcion.estado === 'NO_ENCAJA'
                                    ? {
                                        background: '#ffffff',
                                        color: '#b91c1c',
                                        border: '1px solid #fca5a5',
                                      }
                                    : {}),
                                }}
                                disabled={incorporandoFueraPlazo}
                                onClick={() => {
                                  // Sin ficha no se mete en un grupo con un nivel puesto a ojo.
                                  if (!alumnoFueraPlazoAlumnoId) {
                                    setAvisoFueraPlazoSesion({
                                      ok: false,
                                      texto:
                                        'Este niño no tiene ficha: no lo meto en un grupo con un nivel a ojo. Pulsa «Añadir a la sesión sin grupo» (entra como «Pendiente de Alta/Test», o con su nivel si ya tenía ficha) y colócalo cuando tenga nivel.',
                                    });
                                    return;
                                  }
                                  incorporarAlumnoFueraPlazoEnGrupo(opcion);
                                }}
                              >
                                {incorporandoFueraPlazo
                                  ? 'Añadiendo…'
                                  : !opcion.es_sesion_actual
                                  ? 'Añadir a este turno'
                                  : opcion.estado === 'NO_ENCAJA'
                                  ? 'Meter igualmente en este grupo'
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

                            {/* 25/11 (Jose): los grupos del turno que no encajan también se enseñan,
                                para poder meter al niño igualmente si coordinación lo decide. */}
                            {opcionesNoEncajaTurnoActual.length > 0 && (
                              <details open={!encajaEnTurnoActual && !requiereRevisionTurnoActual}>
                                <summary style={{ cursor: 'pointer', fontWeight: 800 }}>
                                  Grupos de este turno que no encajan ({opcionesNoEncajaTurnoActual.length}) · meter igualmente
                                </summary>
                                <div style={{ display: 'grid', gap: 10, marginTop: 10 }}>
                                  {opcionesNoEncajaTurnoActual.map((opcion) =>
                                    renderOpcionFueraPlazo(opcion, 'Este turno · no encaja')
                                  )}
                                </div>
                              </details>
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
                    {!ctx.esSoloConsultaUsuarioApp && (
                    <button
                      onClick={() =>
                        generarRecomendacionAgendaSesion(agendaSesionActivaId)
                      }
                      style={botonPrincipal}
                    >
                      Generar grupos recomendados
                    </button>
                    )}
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
                                          {opcionesDestinoAgenda.map(
                                            (grupoDestino) => (
                                              <option
                                                key={`${alumno.alumno_id}-${grupoDestino.valor}`}
                                                value={grupoDestino.valor}
                                              >
                                                {grupoDestino.etiqueta}
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

                                          {turnosBabySemanaManual.length > 0 && (
                                            <div
                                              style={{
                                                marginTop: 10,
                                                paddingTop: 10,
                                                borderTop: '1px dashed #fdba74',
                                                display: 'grid',
                                                gap: 6,
                                              }}
                                            >
                                              <strong style={{ fontSize: 13 }}>
                                                O elige tú el turno (entra sin grupo y lo colocas allí)
                                              </strong>
                                              <select
                                                value={turnoManualPorAlumno[alumno.alumno_id] || ''}
                                                onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                                                  setTurnoManualPorAlumno((anterior: Record<string, string>) => ({
                                                    ...anterior,
                                                    [alumno.alumno_id]: e.target.value,
                                                  }))
                                                }
                                              >
                                                <option value="">Selecciona turno de esta semana</option>
                                                {turnosBabySemanaManual.map((turno) => (
                                                  <option key={turno.sesionId} value={turno.sesionId}>
                                                    {turno.etiqueta}
                                                  </option>
                                                ))}
                                              </select>
                                              <button
                                                type="button"
                                                disabled={
                                                  cargando ||
                                                  moviendoAlumnoTurnoId === alumno.alumno_id ||
                                                  !turnoManualPorAlumno[alumno.alumno_id]
                                                }
                                                onClick={() => void moverAlumnoTurnoManualBaby(alumno)}
                                                style={{ ...botonSecundario, width: '100%' }}
                                              >
                                                {moviendoAlumnoTurnoId === alumno.alumno_id
                                                  ? 'Moviendo…'
                                                  : 'Padres OK · mover a ese turno (decido yo)'}
                                              </button>
                                            </div>
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
                      {tableroAgendaActivo && (
                        <GruposTableroAgenda
                          grupos={gruposParaTableroAgenda()}
                          cargando={Boolean(cargando)}
                          grupoAbierto={grupoAjustesTablero}
                          onMover={(origenId, alumnoId, destinoId) => {
                            const r = accionTableroAgenda(origenId, alumnoId);
                            if (r) void moverAlumnoEntreGruposAgenda(r.alumnoSesion, r.grupo, destinoId);
                          }}
                          onGrupoNuevo={(grupoId, alumnoId) => {
                            const r = accionTableroAgenda(grupoId, alumnoId);
                            if (r) void dividirGrupoAgenda(r.grupo, [alumnoId]);
                          }}
                          onQuitar={(grupoId, alumnoId) => {
                            const r = accionTableroAgenda(grupoId, alumnoId);
                            if (r) void quitarAlumnoAgenda(r.alumnoSesion, r.grupo);
                          }}
                          onNoViene={(grupoId, alumnoId, noVieneAhora) => {
                            const r = accionTableroAgenda(grupoId, alumnoId);
                            if (!r) return;
                            if (noVieneAhora) void restaurarVieneIntensivoDesdeAgenda(r.alumnoSesion, r.grupo);
                            else void marcarNoVieneIntensivoDesdeAgenda(r.alumnoSesion, r.grupo);
                          }}
                          onAjustes={(grupoId) => setGrupoAjustesTablero(grupoId)}
                          onTrabajo={abrirTrabajoTableroAgenda}
                          controlesGrupo={controlesGrupoTableroAgenda}
                          onAccionGrupo={accionGrupoTableroAgenda}
                        />
                      )}
                      {listaPublicarActiva && (
                        <PublicarListaAgenda
                          grupos={filasPublicarAgenda()}
                          cargando={Boolean(cargando)}
                          onPublicar={(id) => void publicarGrupo(id)}
                          onAvisarCambios={avisarCambiosGrupoAgenda}
                          onRetirar={(id) => void despublicarGrupo(id)}
                          onVerGrupo={(id) => {
                            setAgendaPestanaProceso('organizar');
                            setGrupoAjustesTablero(id);
                          }}
                        />
                      )}
                      {!listaPublicarActiva && (!tableroAgendaActivo || grupoAjustesTablero) && (
                      <VentanaAjustesTablero
                        activa={tableroAgendaActivo}
                        titulo={(() => {
                          const i = agendaGruposSesion.findIndex((g: AgendaGrupoSesionApp) => g.grupo_id === grupoAjustesTablero);
                          return i >= 0 ? String(nombreGrupoVisualApp(agendaGruposSesion[i], i)) : 'Grupo';
                        })()}
                        onCerrar={() => {
                          setGrupoAjustesTablero(null);
                          window.setTimeout(() => document.querySelector('.gt-tablero')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 30);
                        }}
                      >
                      <div style={{ display: 'grid', gap: 10 }}>
                        {agendaGruposSesion.map((grupo, indiceGrupoCreado) => tableroAgendaActivo && grupo.grupo_id !== grupoAjustesTablero ? null : (
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
                            {/* 19/11: grupo publicado fuera de ratio → aviso (ya no obliga a despublicar). */}
                            {grupo.publicado && sesionActivaEsBaby() && avisoRatioGrupoBaby(grupo) && (
                              <p style={{ margin: '6px 0 0', padding: '6px 10px', borderRadius: 10, background: '#fef2f2', border: '1px solid #fca5a5', color: '#b91c1c', fontSize: 12, fontWeight: 800 }}>
                                ⚠️ {avisoRatioGrupoBaby(grupo)}
                              </p>
                            )}
                            {/* Clase particular de 1 o 2 niños (p. ej. dos hermanas): no se le
                                proponen más niños y no necesita punto de encuentro. */}
                            {!tableroAgendaActivo && !ctx.esSoloConsultaUsuarioApp &&
                              (esNombreGrupoParticularApp(grupo.nombre_grupo) ||
                                (Number(grupo.total_alumnos || 0) >= 1 && Number(grupo.total_alumnos || 0) <= 2)) && (
                                <button
                                  type="button"
                                  style={{
                                    ...botonMini,
                                    width: 'auto',
                                    minWidth: 0,
                                    maxWidth: '100%',
                                    flex: '0 0 auto',
                                    whiteSpace: 'normal',
                                    marginTop: 4,
                                  }}
                                  onClick={() => void marcarGrupoParticular(grupo)}
                                >
                                  {esNombreGrupoParticularApp(grupo.nombre_grupo)
                                    ? 'Quitar particular'
                                    : 'Hacer particular'}
                                </button>
                              )}
                            {!tableroAgendaActivo && grupo.alumnos_lista && (
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
                                          {(() => {
                                            // Misma edad que en «Generar grupos» (perfil operativo).
                                            const edad = alumnoSesion
                                              ? perfilOperativoAlumnoApp(alumnoSesion.alumno_id)?.edad_aprox
                                              : null;
                                            return edad !== null && edad !== undefined ? (
                                              <span style={{ fontWeight: 600, color: '#475569' }}>
                                                {` · ${edad} años`}
                                              </span>
                                            ) : null;
                                          })()}
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

                                            {(agendaGruposSesion.length > 1 ||
                                              puedeGrupoNuevoAgenda(grupo, contextoIntensivo)) && (
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
                                                    if (destino === '__NUEVO__') {
                                                      // 18/11: crea un grupo nuevo con este niño (divide el grupo).
                                                      void dividirGrupoAgenda(grupo, [alumnoSesion.alumno_id]);
                                                    } else if (destino) {
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
                                                        destino
                                                      ) => (
                                                        <option
                                                          key={`${grupo.grupo_id}-${alumnoSesion.alumno_id}-destino-${destino.grupo_id}`}
                                                          value={
                                                            destino.grupo_id
                                                          }
                                                        >
                                                          {/* 18/11: mismo número que el título del grupo (antes se renumeraban al quitar el grupo actual). */}
                                                          {nombreGrupoVisualApp(
                                                            destino,
                                                            agendaGruposSesion.findIndex(
                                                              (g: AgendaGrupoSesionApp) => g.grupo_id === destino.grupo_id
                                                            )
                                                          )}{' '}
                                                          ·{' '}
                                                          {
                                                            destino.total_alumnos
                                                          }{' '}
                                                          niños
                                                        </option>
                                                      )
                                                    )}
                                                  {puedeGrupoNuevoAgenda(grupo, contextoIntensivo) && (
                                                    <option value="__NUEVO__">
                                                      ➕ Grupo nuevo (con este niño)
                                                    </option>
                                                  )}
                                                </select>
                                              </label>
                                            )}

                                            {/* Quitar del grupo y de esta sesión (p. ej. cambia de día).
                                                Intensivos ya tienen su propio «No viene». */}
                                            {!contextoIntensivo && (
                                              <button
                                                type="button"
                                                disabled={cargando}
                                                onClick={() =>
                                                  quitarAlumnoAgenda(alumnoSesion, grupo)
                                                }
                                                style={{
                                                  ...botonPeligroMini,
                                                  // El estilo base tiene ancho fijo de 128px;
                                                  // aquí el texto es más largo y se salía.
                                                  width: 'auto',
                                                  minWidth: 0,
                                                  flex: '0 0 auto',
                                                  padding: '8px 14px',
                                                  justifySelf: 'start',
                                                }}
                                              >
                                                Quitar de esta sesión
                                              </button>
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
                                      ? 'Visible en su Vista entrenador. Para cambiarlo no hace falta retirarlo: hazlo en «Organizar» y el entrenador lo verá al momento.'
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
                                  <div
                                    style={{
                                      display: 'flex',
                                      gap: 8,
                                      flexWrap: 'wrap',
                                      justifyContent: 'flex-end',
                                    }}
                                  >
                                    {grupo.estado_confirmacion ===
                                      'Confirmado' && (
                                      <button
                                        type="button"
                                        onClick={() =>
                                          void notifyGroupChangedAndRequestReconfirmation({
                                            groupId: grupo.grupo_id,
                                            runFunction: ejecutarFuncionAuthJson,
                                            sendPush: ejecutarPushMiticoApp,
                                            reload: async () => {
                                              await Promise.allSettled([
                                                cargarAgendaOperativaDirecta(),
                                                cargarGruposEntrenador(),
                                                cargarPlanning(),
                                              ]);
                                              if (agendaSesionActivaId)
                                                await cargarDetalleSesionAgenda(
                                                  agendaSesionActivaId
                                                );
                                            },
                                          }).catch((err) =>
                                            setError(
                                              err instanceof Error
                                                ? err.message
                                                : 'Error desconocido'
                                            )
                                          )
                                        }
                                        disabled={cargando}
                                        title="El entrenador ya había confirmado este grupo. Úsalo si has cambiado la composición u otro dato importante y debe volver a confirmar."
                                        style={botonSecundario}
                                      >
                                        Avisar cambios y pedir reconfirmación
                                      </button>
                                    )}
                                    <button
                                      type="button"
                                      onClick={() => void despublicarGrupo(grupo.grupo_id)}
                                      disabled={cargando}
                                      style={{ ...botonPeligroMini, width: 'auto', flex: '0 1 auto' }}
                                    >
                                      Retirar de Vista entrenador
                                    </button>
                                  </div>
                                )}
                              </div>

                              {agendaPestanaProceso === 'organizar' && (
                                <>
                              {/* 25/11: en el tablero, entrenador y segundo se cambian en la propia tarjeta. */}
                              {!tableroAgendaActivo && (<>
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
                                        ) === indice &&
                                        entrenador.entrenador_id !== grupo.entrenador_tercero_id
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
                                        ) === indice &&
                                        entrenador.entrenador_id !== grupo.entrenador_tercero_id
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
                              </>)}

                              {/* 06/11: tercer entrenador (con principal y segundo puestos). */}
                              {grupo.entrenador_id && grupo.entrenador_apoyo_id && (
                                <label style={labelCampo}>
                                  Tercer entrenador
                                  <select
                                    value={grupo.entrenador_tercero_id || ''}
                                    disabled={cargando || Boolean(ctx.esSoloConsultaUsuarioApp)}
                                    onChange={(e) => void cambiarTercerEntrenadorGrupoAgenda(grupo, e.target.value)}
                                    style={selectCampo}
                                  >
                                    <option value="">Sin tercer entrenador</option>
                                    {(grupo.entrenador_tercero_id &&
                                    !entrenadoresDisponiblesSesionActiva().some(
                                      (entrenador) => entrenador.entrenador_id === grupo.entrenador_tercero_id
                                    )
                                      ? ([
                                          entrenadores.find(
                                            (entrenador) => entrenador.entrenador_id === grupo.entrenador_tercero_id
                                          ),
                                        ].filter(Boolean) as EntrenadorResumen[])
                                      : []
                                    )
                                      .concat(
                                        entrenadoresDisponiblesCambioGrupoAgenda(
                                          grupo.grupo_id,
                                          grupo.entrenador_tercero_id,
                                          grupo.entrenador_id
                                        )
                                      )
                                      .filter(
                                        (entrenador, indice, lista) =>
                                          lista.findIndex((item) => item.entrenador_id === entrenador.entrenador_id) === indice &&
                                          entrenador.entrenador_id !== grupo.entrenador_id &&
                                          entrenador.entrenador_id !== grupo.entrenador_apoyo_id
                                      )
                                      .map((entrenador) => (
                                        <option
                                          key={`${grupo.grupo_id}-tercero-${entrenador.entrenador_id}`}
                                          value={entrenador.entrenador_id}
                                        >
                                          {entrenador.nombre_completo}
                                        </option>
                                      ))}
                                  </select>
                                </label>
                              )}
                              {grupo.entrenador_tercero_id && (
                                <ReportSplitPanel
                                  grupo={grupo}
                                  consultarSupabase={consultarSupabase as any}
                                  ejecutarFuncion={ejecutarFuncionAuthJson}
                                />
                              )}

                              {grupo.entrenador_id &&
                                grupo.entrenador_apoyo_id &&
                                !grupo.entrenador_tercero_id && (
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

                              {/* 25/11: en el tablero, punto y borrar se hacen en la propia tarjeta. */}
                              {!tableroAgendaActivo && (<>
                              <label style={labelCampo}>
                                Punto de encuentro
                                <select
                                  value={grupo.punto_encuentro || ''}
                                  onChange={(e) => {
                                    const elegido = e.target.value;
                                    // Compartir punto solo si ya no hay libres, y avisando antes.
                                    const aviso = avisoCompartirPunto(
                                      opcionesPuntoEncuentro(
                                        puntosEncuentroAgenda,
                                        grupo.grupo_id,
                                        gruposRecursosTurnoAgenda(),
                                        grupo.punto_encuentro
                                      ).find((o) => o.punto === elegido)
                                    );
                                    if (aviso && !window.confirm(aviso)) return;
                                    void cambiarPuntoGrupoAgenda(grupo, elegido);
                                  }}
                                  style={selectCampo}
                                >
                                  <option value="">
                                    Selecciona punto
                                  </option>
                                  {/* 04/11: solo libres; si ya no queda ninguno, se puede compartir (avisando). */}
                                  {opcionesPuntoEncuentro(
                                    puntosEncuentroAgenda,
                                    grupo.grupo_id,
                                    gruposRecursosTurnoAgenda(),
                                    grupo.punto_encuentro
                                  ).map((opcion) => (
                                    <option
                                      key={`${grupo.grupo_id}-punto-${opcion.punto}`}
                                      value={opcion.punto}
                                    >
                                      {textoOpcionPunto(opcion)}
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
                              </>)}
                                </>
                              )}
                            </div>
                          </article>
                        ))}
                      </div>
                      </VentanaAjustesTablero>
                      )}
                    </section>
                  )}
                </article>
              )}
            </section>,
            document.body
          )}
        </section>
      )}

    </>
  );
}

