import React, { useEffect, useRef, useState } from 'react';

type BeforeInstallPromptEventMitico = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform?: string }>;
};

let promptPendienteInstalacionPwa: BeforeInstallPromptEventMitico | null = null;

if (typeof window !== 'undefined') {
  window.addEventListener(
    'beforeinstallprompt',
    ((evento: Event) => {
      evento.preventDefault();
      promptPendienteInstalacionPwa =
        evento as BeforeInstallPromptEventMitico;
    }) as EventListener
  );

  window.addEventListener('appinstalled', () => {
    promptPendienteInstalacionPwa = null;
  });
}
import { createPortal } from 'react-dom';
import './App.css';
import { FOTO_MITICO_HERO } from './assets/imagenes';
import {
  CampoSelect,
  PantallaSegura,
  agendaAccionesSesion,
  agendaAlumnoLinea,
  agendaBadgeModalidad,
  agendaBadgeModalidadColor,
  agendaBloqueBlanco,
  agendaBotonDiaCompacto,
  agendaBotonMes,
  agendaBotonSemana,
  agendaCabeceraLinea,
  agendaControlesGrid,
  agendaDiaCard,
  agendaDiaHeader,
  agendaDiasGrid,
  agendaDiasSelectorCompacto,
  agendaGrupoLinea,
  agendaGrupoPropuesta,
  agendaGrupoResumen,
  agendaHero,
  agendaHeroOcio,
  agendaHeroTrabajoSemanal,
  agendaMesesGrid,
  agendaMiniContador,
  agendaMiniContadorDiaCompacto,
  agendaMiniLabel,
  agendaMiniTexto,
  agendaPanelControles,
  agendaPanelRangoSemana,
  agendaSemanasGrid,
  agendaSesionCard,
  agendaSesionCardModalidad,
  agendaSesionContadores,
  agendaSesionTop,
  agendaShellCompacto,
  agendaTurnoFila,
  agendaVacio,
  agendaVacioMini,
  agruparDisponibilidadPorTurno,
  agruparDisponibilidadSemanal,
  agruparGruposEntrenadorSemanal,
  agruparGruposPorEntrenador,
  agruparPorEntrenador,
  agruparReportesPorEntrenador,
  alumnosLimpiosWhatsapp,
  avisoCompleto,
  avisoInline,
  avisoNeutral,
  avisoPendiente,
  avisoReportePendiente,
  ayudaDesplegableCompacta,
  ayudaReporteEntrenadorCaja,
  ayudaReporteEntrenadorContenido,
  badgeIntensivoEntrenador,
  badgeModalidadMovil,
  badgeNoTrabaja,
  badgePendiente,
  badgePistaGrandeApp,
  badgePistaNeutraApp,
  badgePistaPequenaApp,
  badgeTrabaja,
  barraPasosIntensivo,
  bloqueInfoEntrenador,
  bloqueSemanaMovil,
  bloqueTexto,
  botonAsistenciaAusente,
  botonAsistenciaOff,
  botonAsistenciaOk,
  botonAsistenciaPendiente,
  botonBaseApp,
  botonMenu,
  botonMenuColor,
  botonMini,
  botonModalidadAgenda,
  botonPasoIntensivo,
  botonPeligro,
  botonPeligroMini,
  botonPrincipal,
  botonSecundario,
  botonesAsistenciaMovil,
  buscador,
  cabeceraAppLimpia,
  cabeceraEntrenadorMovil,
  cabeceraMarcaApp,
  cabeceraPantalla,
  cabeceraPantallaMovil,
  cabeceraSemanaMovil,
  capitalizarPrimera,
  celdaTextoAyudaReporte,
  celdaTituloAyudaReporte,
  chipDiaIntensivo,
  chipDiaIntensivoVacio,
  chipResumenCursoIntensivo,
  chuletaEntrenadorMini,
  cierreJoseCaja,
  cierreJoseGrid,
  cierreJoseItem,
  cierreJoseLabel,
  coloresModalidadAgenda,
  contadorGrandeMovil,
  contadorNinosMovil,
  diaEntrenadorCard,
  diaEntrenadorCardLibre,
  diaEntrenadorHeader,
  emojiPuntoEncuentro,
  entrenadorHeroApp,
  entrenadorHeroChips,
  errorCaja,
  esIntensivoGrupo,
  escaparHtml,
  estiloBadgePistaApp,
  estiloGrupoPorPistaApp,
  etiquetaFechaHoraGrupo,
  etiquetaPistaVisualApp,
  etiquetaSuperior,
  extraerObservacionesVisualesGrupoApp,
  filaAlumnoAsistencia,
  filaAlumnoEntrenadorMovil,
  formatearAlumnosDetalle,
  formatearAlumnosPlanning,
  formatearEuros,
  formatearFecha,
  formatearObservaciones,
  formatearTrabajoDiario,
  formularioCaja,
  franjaFechasIntensivo,
  gridFormulario,
  gridMiniMetricas,
  gridResumenInicio,
  grupoEntrenadorCardMovil,
  grupoEntrenadorTopMovil,
  inicioSemanaGlobal,
  inputCampo,
  inputEntrenadorBusqueda,
  labelCampo,
  layout,
  limpiarDetalleObservacionVisualGrupoApp,
  lineaDiasIntensivo,
  listaAlumnosGrupoCompacta,
  logoMarcaApp,
  marcaKickerApp,
  marcaLogoTituloApp,
  menuBloqueApp,
  menuBloqueColor,
  menuPrincipalApp,
  menuTituloApp,
  menuTituloColor,
  metricCardIntensivo,
  miniBadge,
  miniBadgeVerde,
  miniMetrica,
  miniTarjeta,
  miniTarjetaBlanca,
  miniTarjetaCerrada,
  miniTarjetaCompleta,
  miniTarjetaPendienteAsistencia,
  miniTarjetaPendienteReporte,
  nivelGeneralGrupoVisual,
  nombreGrupoPropuestaApp,
  nombreGrupoVisualApp,
  nombreMes,
  normalizarModalidadAgenda,
  panelEntrenadorFiltroApp,
  panelRevisionIntegradaOcio,
  panelTrabajoGrupo,
  resumenChipsMovil,
  resumenCursoIntensivoGrid,
  selectCampo,
  selectCampoAgenda,
  summaryAyudaReporteEntrenador,
  summaryChuletaApp,
  summaryTrabajoGrupo,
  tabBarEntrenadorModerno,
  tabEntrenadorModerno,
  tarjeta,
  tarjetaEntrenadorMovil,
  tarjetaInicioAlerta,
  tarjetaInicioEstado,
  tarjetaInicioOk,
  tarjetaInicioRojo,
  tarjetaIntensivoCurso,
  tarjetaModernaIntensivos,
  tarjetaMovilVacia,
  tarjetaResaltada,
  textarea,
  textareaCampo,
  tituloMarcaApp,
  turnoEntrenadorBox,
  vistaEntrenadorShell,
} from './lib/appHelpers';
import { PantallaIntensivos } from './screens/IntensivosScreen';
import { OcioGroupsScreen } from './features/ocio/OcioGroupsScreen';
import {
  ocioLevelRange,
  type OcioWeeklyGroup,
} from './features/ocio/ocioWeekPlanning';
import {
  ocioGrupoFormInicial,
  type OcioAlumnoApp,
  type OcioGrupoApp,
  type OcioGrupoFormState,
  type OcioGrupoPropuestaApp,
  type OcioImportadoApp,
  type OcioPrepararResultadoApp,
  type OcioRecomendacionCambioApp,
} from './features/ocio/ocioTypes';
import { AdaptiveReportFields } from './screens/AdaptiveReportFields';
import {
  evaluacionTecnicaInicial,
  ayudaAutonomiaAdaptada,
  mejoraLegacy,
  opcionesAutonomiaAdaptada,
  prepareTrainerReportOpening,
  recomendacionLegacy,
  reportTechnicalLevelForRender,
  requireReportTechnicalLevel,
  resumenEvaluacionTecnica,
  tecnicaLegacyPorNivel,
  type EvaluacionTecnicaReporte,
} from './lib/adaptiveReport';
import { generarTrabajoDiarioInteligenteApp } from './lib/dailyWorkEngine';
import {
  activarNotificacionesPushMitico,
  llamarMiticoPush,
  permisoPushMitico,
  type EstadoSemanaEntrenadorPush,
  type MiticoPushActionResult,
} from './lib/pushNotifications';
import {
  TECHNICAL_LEVELS,
  parseTechnicalLevel,
  resolveSessionOperationalLevel,
  technicalLevelOrder,
  type TechnicalLevel,
} from './core/levels/levelContract';
import {
  balancedGroupSizes,
  pedagogicalBandForLevel,
  recommendLevelCompatibility,
  validateGroupPedagogy,
} from './core/recommendations/baseRecommendation';
import {
  buildFamilyReportBase,
  sortReportHistory,
} from './core/reports/reportHistory';
import type {
  ContextoTecnicoReporteApp,
  HistorialReporteAlumnoFichaApp,
} from './core/reports/reportTypes';
import {
  buildMasterStudentProfile,
  calculateAge,
  familyWhatsappUrl,
  studentRecordCompleteness,
} from './core/students/masterStudent';
import type {
  AlumnoResumen,
  PerfilOperativoAlumnoApp,
  TendenciaRitmoAlumnoApp,
} from './core/students/studentTypes';
import {
  assessRosterRefresh,
  normalizeRosterName as normalizarNombreFueraPlazoAgenda,
  planRosterCleanup,
  verifyRosterSnapshot,
} from './core/sessions/rosterSync';
import {
  decideSessionRosterImport,
  extractRosterNamesFromListText,
} from './core/sessions/sessionImportPolicy';
import {
  GROUP_OPERATION_RPC,
  decidePreparedGroupRefresh,
  requireAttendanceState,
  requireOperationalStudentLevel,
  requireValidGroupMove,
} from './core/groups/groupOperations';
import { studentObservationWithLevelReview } from './core/groups/levelReviewNotice';
import {
  babyGroupMaximum,
  babyLowGroupNeedsSupport,
  babyRatioMessage,
  babySupportMessage,
} from './features/baby/babyPolicy';
import {
  ocioFunctionalScore,
  ocioGroupMaximum,
  requireUnchangedExistingOcioLevel,
} from './features/ocio/ocioPolicy';
import {
  activeOcioRelocationsForWindow,
  applyOcioRelocationsToStableGroup,
  eligibleOcioRelocationGroups,
  emptyOcioRelocationForm,
  findOcioRelocationEntry,
  findOcioRelocationExit,
  requireOcioRelocationCommand,
} from './features/ocio/ocioRelocation';
import type {
  OcioCambioFormState,
  OcioCambioPuntualApp,
} from './features/ocio/ocioRelocation';
import { requireIntensiveDiplomaUpdate } from './features/intensivos/intensivosPolicy';
import {
  calcularFechasCuatroSesionesIntensivo,
  diaIntensivoInicial,
  grupoIntensivoInicial,
  intensivoInicial,
  nombreTipoCuatroSesionesIntensivo,
  planIntensiveFutureMove,
  plantillaCuatroSesionesInicial,
} from './features/intensivos/intensiveOperations';
import type {
  AlumnoParaIntensivoApp,
  AlumnoResumenParaVolcadoApp,
  DiaIntensivoFormState,
  GrupoDestinoRecuperacionApp,
  GrupoEditableIntensivoDiaApp,
  GrupoIntensivoDiaApp,
  GrupoIntensivoFormState,
  IntensivoAlumnoApp,
  IntensivoApp,
  IntensivoAsistenciaApp,
  IntensivoDiaApp,
  IntensivoFormState,
  IntensivoRecuperacionApp,
  PanelControlIntensivoApp,
  PlantillaCuatroSesionesIntensivoState,
  RecomendacionGrupoIntensivoDiaApp,
  RecuperacionRecomendacionApp,
  ResumenReportesIntensivoApp,
  RevisionEntreSesionesIntensivoApp,
  VolcadoAlumnoIntensivoApp,
} from './features/intensivos/intensiveTypes';
import {
  claveStorageDisponibilidadEditor,
  crearBorradorDisponibilidadEditor,
  diaPermiteVariosTurnosDisponibilidadEditor,
  fechaLimiteAutomaticaDisponibilidadEditor,
  fechaIsoEditor,
  idTurnoDisponibilidadEditor,
  sumarDiasEditor,
  normalizarBorradorDisponibilidadEditor,
  normalizarBorradorDisponibilidadEditorServidor,
  turnoInicialDisponibilidadEditor,
  validarBorradorDisponibilidadEditor,
} from './features/availability/availabilityEditor';
import {
  esRolCoordinacionApp,
  puedeGestionarAccesosApp,
  puedeVerAdministracionAltasApp,
  puedeVerDireccionApp,
  rolUsuarioTextoApp,
} from './core/permissions/rolePermissions';
import {
  borrarSesionAuthApp,
  cargarPerfilUsuarioApp,
  extraerSesionInvitacionDesdeUrlApp,
  guardarSesionAuthApp,
  iniciarSesionEmailPasswordApp,
  leerSesionGuardadaApp,
  limpiarUrlAuthApp,
  obtenerAccessTokenSupabaseApp,
  obtenerUsuarioAuthApp,
  refrescarSesionAuthApp,
  solicitarRecuperacionPasswordApp,
  tipoFlujoPasswordDesdeUrlApp,
} from './services/auth/authService';
import type {
  PerfilUsuarioApp,
  SesionAuthApp,
  UsuarioOperativoGestionApp,
} from './services/auth/authTypes';
import {
  buildTrainerReportAssignments,
  collectGroupTrainers,
  entrenadorFormInicial,
  opcionesDocumentoEntrenador,
  opcionesEspecialidadEntrenador,
  primaryTrainerChangePlan,
  responsableAutomaticoReporteApp,
  supportTrainerChangeIssue,
  trainerNamesForGroup,
  trainerStudentDistribution,
} from './core/trainers/trainerOperations';
import type {
  EntrenadorFormState,
  EntrenadorResumen,
  EstadoAccesoEntrenadorApp,
  EstadoAvisosEntrenadorApp,
} from './core/trainers/trainerTypes';
import {
  babyWhatsappContext,
  buildWhatsappPreview,
  cleanTrainerNameForWhatsapp as nombreEntrenadorWhatsappPapis,
  cleanTrainerNamesForWhatsapp as entrenadoresWhatsappPapis,
  intensiveWhatsappContext,
  isValidWhatsappGroupLink as esEnlaceGrupoWhatsappValido,
  normalizeWhatsappPhone as normalizarTelefonoWhatsappApp,
  ocioWhatsappContext,
  sessionWhatsappContext,
  whatsappDirectUrl,
  whatsappGroupLinkByKey,
} from './core/communications/whatsappContract';
import type {
  WhatsappGroupContext,
  WhatsappGrupoApp,
  WhatsappPreviewState,
} from './core/communications/whatsappTypes';
import {
  agendaFormInicial,
  claveFechaAgenda,
  claveMesDesdeFecha,
  crearFechaAgenda,
  diasTrabajoSemanaAgenda,
  fechaAgendaCortaConAnio,
  fechaAgendaDiaCorta,
  inicioSemanaAgenda,
  mesesTemporadaAgenda,
  modalidadesAgendaTrabajo,
  nombreMesAgendaDesdeClave,
  nombreTemporadaAgenda,
  puntosEncuentroAgenda,
  rangoEntrenosSemanaAgenda,
  rangoSemanaAgenda,
  temporadaInicioDefectoAgenda,
  turnosTrabajoDiaAgenda,
} from './features/agenda/agendaCalendar';
import { AgendaScreen } from './features/agenda/AgendaScreen';
import { buildAgendaOperationalSessions } from './features/agenda/agendaSessions';
import type {
  AgendaAlumnoSesionApp,
  AgendaFormState,
  AgendaGrupoSesionApp,
  AgendaRecomendacionSesionApp,
  AgendaSesionDirectaApp,
  ListadoApp,
  RecomendacionFueraPlazoAgendaApp,
  SesionAgendaOperativa,
} from './features/agenda/agendaTypes';
import { useRepartoManualGrupoAgenda } from './features/agenda/useRepartoManualGrupoAgenda';
import {
  aplicarCinturonPedagogicoAutomaticoAgenda,
  explicacionCompactaPropuestaBabyApp,
  tamanosGruposPedagogicosApp,
} from './features/baby/babyRecommendation';
import { useBabyAimHarder } from './features/baby/useBabyAimHarder';
import {
  PantallaAuthErrorApp,
  PantallaCrearPasswordApp,
  PantallaLoginApp,
  authCardApp,
  authShellApp,
} from './screens/AuthScreens';
import { PantallaTestNivelPublicoApp } from './screens/PublicLevelTestScreen';
import {
  addBackupDays as sumarDiasBackup,
  normalizeSeasonClosureStudents,
  normalizeSeasonClosureSummary,
  normalizeSeasonCsvHeader as normalizarCabeceraCsvTemporada,
  parseAndValidateWeeklyBackup,
  seasonClosureIssue,
  weeklyBackupFilename as nombreArchivoBackupSemanal,
  weeklyBackupRowCount as totalFilasBackupRestauracion,
  weeklyBackupStorageKey as claveStorageBackupSemana,
} from './features/seasons/seasonOperations';
import type {
  CierreTemporadaAlumnoApp,
  FilaCopiaMaestraImportApp,
  ListadoAlumnoTemporadaApp,
  ResumenCierreTemporadaApp,
  TipoListadoAlumnosApp,
} from './features/seasons/seasonTypes';
import { SeasonManagementScreen } from './features/seasons/SeasonManagementScreen';
import {
  billingDetailsForTrainer,
  billingPeriodForWeek,
  billingRatesByTrainer,
  cobroManualInicial,
  desglosarEfectivoCobrosApp,
  filterBillingRows,
  summarizeBillingRows,
} from './features/billing/billingOperations';
import type {
  CobroDetalleMensual,
  CobroManualFormState,
  CobroMensual,
  CobroPdfPreviewState,
} from './features/billing/billingTypes';
import type {
  BorradorDisponibilidadEditor,
  DisponibilidadEntrenador,
  EstadoServidorDisponibilidadEditor,
  ModalidadDisponibilidadEditor,
  RespuestaDisponibilidadEditorServidor,
  RespuestaDisponibilidadPublicadaEntrenadoresEditor,
  TurnoDisponibilidadEditor,
} from './features/availability/availabilityEditor';
import { AvailabilityScreen } from './features/availability/AvailabilityScreen';
import { OperationalAnalysisScreen } from './features/analysis/OperationalAnalysisScreen';
import { QuickHelp } from './features/shell/QuickHelp';
import { WhatsAppManagementScreen } from './features/communications/WhatsAppManagementScreen';
import {
  LoadedListingsScreen,
  PlanningHistoryScreen,
} from './features/operations/PlanningAndListingsScreens';
import {
  babyClassHours as horasClaseBabyAimHarder,
  normalizeBabyAttendees,
  uniqueBabyClasses,
} from './services/aimharder/aimHarderContract';
import type {
  BabyAimHarderAsistenteActivoApp,
  BabyAimHarderClaseApp,
  BabyAimHarderLecturaApp,
  BabyAimHarderRefrescoResultadoApp,
  BabyAimHarderSafetyApp,
  BabyAimHarderVerificacionRefrescoApp,
  DatosContactoAimHarderApp,
  OcioAimHarderAsistenteApp,
  OcioAimHarderEstadoAlumnoApp,
  OcioAimHarderSemanaApp,
  OcioAimHarderTurnoApp,
  UltimoListadoAimHarderApp,
} from './services/aimharder/aimHarderContract';
import {
  buildBabyRefreshSummary,
  planBabyWeekSlots,
  selectExactBabyClass,
} from './services/aimharder/aimHarderOperations';
import {
  buildOcioAimHarderStudentStates,
  buildOcioAttendanceState,
  ocioStudentComesFromAimHarder,
  readOcioAimHarderWeek,
} from './services/aimharder/ocioAimHarderService';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from './config/supabase';
import { createSupabaseRestClient } from './services/supabase/restClient';
import { StudentRecordsScreen } from './features/students/StudentRecordsScreen';
import { ReportsScreen } from './features/reports/ReportsScreen';
import { ManagementReportsScreen } from './features/reports/ManagementReportsScreen';
import { TrainerViewScreen } from './features/trainers/TrainerViewScreen';
import { TrainerManagementScreen } from './features/trainers/TrainerManagementScreen';
import { AdminEnrolmentScreen } from './features/admin/AdminEnrolmentScreen';
import { UserAccessScreen } from './features/admin/UserAccessScreen';
import { DailySummaryScreen } from './features/dashboard/DailySummaryScreen';
import { HomeScreen } from './features/dashboard/HomeScreen';
import { OcioStudentsScreen } from './features/ocio/OcioStudentsScreen';
import { OcioEvaluationsScreen } from './features/ocio/OcioEvaluationsScreen';
import {
  OcioChangesScreen,
  OcioReviewScreen,
  OcioWeekScreen,
} from './features/ocio/OcioOperationalScreens';
import {
  normalizeAnnualOcioEvaluation,
  requireEvaluationCut,
} from './core/evaluations/evaluationContract';
import {
  buildOcioFamilyEvaluationHtml,
  compactLevelJourney,
  dailyWorkObjectives,
  reportedImprovements,
} from './core/evaluations/ocioFamilyEvaluation';
import { buildIntensiveDiplomaBase } from './core/evaluations/intensiveEvaluation';
import type {
  CorteEvaluacionOcioApp,
  EvaluacionAnualOcioApp,
  ReporteDetalleIntensivoApp,
  ResumenFinalIntensivoApp,
} from './core/evaluations/evaluationTypes';
import {
  VERSION_PARSER_ALTAS_IMPORT_APP,
  altaNivelInicialFormVacioApp,
  coincideAltaImportadaConAltaExistenteApp,
  parsearListadoAltasPegadoApp,
} from './core/enrolment/enrolmentImport';
import type {
  AltaImportadaGestionadaApp,
  AltaImportadaIncompletaApp,
  AltaImportadaPegadoApp,
  AltaNivelInicialApp,
  AltaNivelInicialFormApp,
  AvisoNuevaAltaAlumnoApp,
  CoincidenciaAltaNivelInicialApp,
  DetalleImportacionAltasApp,
  ResumenImportacionAltasApp,
} from './core/enrolment/enrolmentTypes';
import {
  isAttendanceUnconfirmed,
  isMissingReport,
  pendingStudentsForTrainer,
  planningGroupStatus,
  selectStudentsForTrainerGroups,
  selectTrainerVisibleGroups,
  summarizeOperationalDashboard,
  trainerPendingTaskCount,
  unconfirmedGroupsForTrainer,
} from './core/sessions/operationalStatus';
import type {
  AlumnoReporteEntrenador,
  GrupoEntrenadorApp,
  GrupoPlanning,
  ReportePendiente,
  ResumenInicio,
} from './core/sessions/operationalTypes';
import {
  buildDailyWorkStudentContext,
  recentDailyWorkForGroup,
} from './core/daily-work/dailyWorkContext';
import type {
  AlumnoContextoTrabajoDiarioApp,
  ProgresionInicialAlumnoApp,
  TrabajoDiarioHistoricoApp,
} from './core/daily-work/dailyWorkTypes';

type ModalidadAnalisisAdminApp = 'BABY' | 'OCIO' | 'INTENSIVOS';


const opcionesNivel = ['', ...TECHNICAL_LEVELS];
const opcionesPista = ['Pequeña', 'Grande', 'Pequeña/Grande'];
const opcionesRemontes = [
  'Cinta',
  'Percha',
  'Silla',
  'Cinta y percha',
  'Percha y silla',
  'Sin remontes',
];

const nivelesDiplomaIntensivo = [
  { id: '', codigo: 'Sin seleccionar', orden: -1 },
  { id: '8b50fa47-80dc-4808-8606-922823b708dd', codigo: 'INICIACION', orden: 0 },
  { id: '9da86b75-7d1d-45ce-b331-6ed3c1989553', codigo: 'A', orden: 1 },
  { id: 'b4cc5c49-dcd6-4120-8c2d-ba657bb8dcdd', codigo: 'A+', orden: 2 },
  { id: '0b6e022a-6d6c-498e-9337-de3c67fdc207', codigo: 'B', orden: 3 },
  { id: 'ee0eacce-543c-48e5-baca-e0085f7768a5', codigo: 'B+', orden: 4 },
  { id: 'ec96cd14-556a-431f-846d-74223368388f', codigo: 'C', orden: 5 },
  { id: 'b0b4e211-71c4-4a55-84bf-351137c6cdbd', codigo: 'C+', orden: 6 },
  { id: 'b7a9fd7c-7d1d-4357-9bff-c557977db22c', codigo: 'D', orden: 7 },
  { id: '0f10c6da-f11f-46dd-8211-1d9e1240e161', codigo: 'D+', orden: 8 },
];

const opcionesEstadoDiplomaIntensivo = ['Pendiente', 'Revisado'];
const opcionesOrigenNivelAlumno = [
  'Familia',
  'Jose / Coordinador',
  'Ventas / compañera',
  'Clase de prueba pendiente',
  'Desconocido',
];
const opcionesRecomendacionIntensivo = [
  '',
  'Seguir en Baby',
  'Pasar a Ocio',
  'Repetir Intensivo',
  'Continuar en Intensivos',
  'Recomendar Particular',
  'Revisar con coordinador',
];
const opcionesEstadoRecuperacionIntensivo = [
  'Pendiente valorar',
  'Encaja en nuevo intensivo',
  'No encaja por nivel',
  'Sin hueco',
  'Aprobada',
  'Resuelta',
  'Descartada',
];
const opcionesPistaGrupoIntensivo = ['', 'Pequeña', 'Grande', 'Pequeña/Grande'];

type AnalisisAdminMensualApp = {
  mes: string;
  alumnos_unicos: number;
  altas: number;
  crecimiento_pct: number | null;
  continuidad_pct: number | null;
  perdida_continuidad_pct: number | null;
  asistencia_real_pct: number | null;
  promedio_ninos_turno: number;
  promedio_por_grupo: number;
  sesiones_realizadas: number;
  ocupacion_pct: number | null;
  evolucion_tecnica: number;
  mejoran: number;
  estables: number;
  bajan: number;
};

type AnalisisAdminPayloadApp = {
  meta: {
    temporada_id: string;
    temporada: string;
    fecha_inicio: string;
    fecha_fin: string;
    modalidad: ModalidadAnalisisAdminApp;
    generado_at: string;
  };
  resumen: {
    alumnos_unicos: number;
    altas: number;
    continuidad_pct: number | null;
    perdida_continuidad_pct: number | null;
    asistencia_real_pct: number | null;
    promedio_ninos_turno: number;
    promedio_por_grupo: number;
    sesiones_realizadas: number;
    ocupacion_pct: number | null;
    evolucion_tecnica: number;
    alumnos_mejoran: number;
    alumnos_estables: number;
    alumnos_bajan: number;
  };
  mensual: AnalisisAdminMensualApp[];
  niveles: Array<{ nivel: string; total: number }>;
  progresiones: Array<{
    desde: string;
    hasta: string;
    total: number;
    sentido: 'SUBE' | 'BAJA' | 'IGUAL';
  }>;
  comparativa_temporadas: Array<{
    temporada_id: string;
    temporada: string;
    activa: boolean;
    alumnos_unicos: number;
    sesiones_realizadas: number;
    asistencia_real_pct: number | null;
    evolucion_tecnica: number;
  }>;
  definiciones: Record<string, string>;
};

type AnalisisAdminRpcRowApp = {
  payload: AnalisisAdminPayloadApp;
};

type AvisoJose = {
  orden: number;
  bloque: string;
  contador: number;
  descripcion: string;
};

type DetalleGrupo = {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
  grupo_id: string;
  nombre_grupo: string;
  nivel_grupo: string;
  pista: string;
  punto_encuentro: string;
  estado_grupo: string;
  ratio_ok: boolean;
  excepcion_ratio: boolean;
  entrenadores: string | null;
  alumnos_detalle: string | null;
  total_alumnos: number;
  trabajo_diario: string | null;
  trabajo_diario_revisado: boolean;
  observaciones_importantes: string | null;
  publicado: boolean;
  cancelado: boolean;
};

type AlumnoBabyFichaApp = {
  alumno_id: string;
  ultimo_baby: string | null;
  total_sesiones_baby: number;
};

function formatearFechaHoraDisponibilidadEditor(valor: string) {
  if (!valor) return '-';
  const [fecha, hora = ''] = valor.split('T');
  return `${formatearFecha(fecha)}${hora ? ` · ${hora.slice(0, 5)}` : ''}`;
}


function fechaIsoHoyApp() {
  return new Date().toISOString().slice(0, 10);
}

function fechaIsoMadridApp(fecha = new Date()) {
  const partes = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(fecha);

  const valor = (tipo: 'year' | 'month' | 'day') =>
    partes.find((parte) => parte.type === tipo)?.value || '';

  return `${valor('year')}-${valor('month')}-${valor('day')}`;
}

function leerStorageApp(clave: string, defecto = '') {
  if (typeof window === 'undefined') return defecto;
  return window.localStorage.getItem(clave) || defecto;
}

function leerStorageNumeroApp(clave: string, defecto: number) {
  const valor = Number(leerStorageApp(clave, ''));
  return Number.isFinite(valor) && valor > 0 ? valor : defecto;
}

type SnowZoneDiaApp = {
  fecha: string;
  pista_pequena: number;
  pista_grande: number;
  total: number;
};

type SnowZoneModoApp = 'mensual' | 'semanal';

type CandidatoEquipoApp = {
  alumno_id: string;
  alumno: string;
  temporada: string;
  nivel: string;
  orden_nivel: number;
  entrenamientos_baby: number;
  meses_activos_baby: number;
  ultimo_entreno_baby: string | null;
  ultimo_reporte_fecha: string | null;
  autonomia: string | null;
  remontes: string[] | null;
  actitud: string | null;
  tecnica: string | null;
  pista: string | null;
  recomendacion: string | null;
};

type FiltroDiaEvaluacionesOcioApp = 'Todos' | 'Jueves' | 'Sábado' | 'Domingo';

type ReporteFormState = {
  nivel: string;
  actitud: string;
  pista: string;
  autonomia: string;
  ritmoGrupo: string;
  remontes: string;
  incidencia: string;
  observaciones: string;
  autonomiaCinta: string;
  cunaFrenada: string;
  giroInicial: string;
  dinamicaAutonoma: string;
  ayudaCunero: string;
  evaluacionTecnica: EvaluacionTecnicaReporte;
  mejorasHoy: string[];
  prioridades: string[];
};

type ReporteActivo = {
  grupo_id: string;
  alumno_id: string;
  entrenador_id: string;
};

type GrupoActivoEntrenador = {
  grupo_id: string;
  entrenador_id: string;
};

function partesAlumnoListadoOperativoApp(valor: string | null | undefined) {
  const partes = String(valor || '')
    .split('·')
    .map((parte) => parte.trim())
    .filter(Boolean)
    .filter((parte) => !/^test nuevo$/i.test(parte));

  if (/^(ZZZS|TEST(?:\s|$)|\[TEST)/i.test(partes[0] || '') && partes.length > 1) {
    partes.shift();
  }

  return partes;
}

function nombreRealAlumnoListadoOperativo(valor: string | null | undefined) {
  const partes = partesAlumnoListadoOperativoApp(valor);
  if (partes.length === 0) return '-';

  // Un nombre de pruebas puede venir como:
  // "ZZZS · Paula Rey · A+ · Pequeña".
  // Antes se cogía solo la primera pieza ("ZZZS"), lo que rompía nombres,
  // movimiento de alumnos y el motor de trabajo diario.
  const partesNombre = partes.filter(
    (parte) =>
      !/^(?:NIVEL\s*:?)?(?:INICIACI[ÓO]N|DEBUT|A\+?|B\+{0,2}|C\+?|D\+?)$/i.test(parte) &&
      !/^(PEQUEÑA|GRANDE|PEQUEÑA\/GRANDE)$/i.test(parte)
  );

  const nombre = partesNombre.join(' · ').trim() || partes[0];
  return nombre.replace(/^\d+[.)-]?\s*/, '').trim();
}

function formatearAlumnoListadoOperativo(valor: string | null | undefined) {
  const partes = partesAlumnoListadoOperativoApp(valor);
  if (partes.length === 0) return '-';
  const nombre = nombreRealAlumnoListadoOperativo(valor);
  const nivelParte = partes.find((parte) =>
    /^(?:NIVEL\s*:?)?(INICIACI[ÓO]N|DEBUT|A\+?|B\+{0,2}|C\+?|D\+?)$/i.test(parte)
  );
  const nivel = nivelParte?.replace(/^NIVEL\s*:?\s*/i, '').trim();
  return nivel ? `${nombre} · ${nivel.toUpperCase()}` : nombre;
}

function nombreAlumnoOcioTarjetaApp(valor: string | null | undefined) {
  const partes = String(valor || '')
    .split('·')
    .map((parte) => parte.trim())
    .filter(Boolean);

  if (partes.length === 0) return '-';

  // Los datos TEST pueden llevar una etiqueta delante del nombre real.
  // Solo se elimina en la presentación de Ocio; el dato guardado no cambia.
  if (/^(ZZZS|TEST(?:\s|$)|\[TEST)/i.test(partes[0]) && partes.length > 1) {
    partes.shift();
  }

  const nivel = partes.find((parte) =>
    /^(?:NIVEL\s+)?(?:INICIACI[ÓO]N|DEBUT|A\+?|B\+{0,2}|C\+?|D\+?)$/i.test(parte)
  );
  const nombre = partes
    .filter((parte) =>
      !/^(?:NIVEL\s+)?(?:INICIACI[ÓO]N|DEBUT|A\+?|B\+{0,2}|C\+?|D\+?)$/i.test(parte)
    )
    .join(' · ')
    .trim();

  const nivelLimpio = nivel ? nivel.replace(/^NIVEL\s+/i, '').toUpperCase() : '';
  return `${nombre || partes[0] || '-'}${nivelLimpio ? ` · ${nivelLimpio}` : ''}`;
}

function nombreAlumnoWhatsappPapis(valor: string | null | undefined) {
  const operativo = formatearAlumnoListadoOperativo(valor);
  return operativo
    .replace(
      /\s*·\s*(INICIACI[ÓO]N|DEBUT|A\+?|B\+{0,2}|C\+?|D\+?)\s*$/i,
      ''
    )
    .trim();
}

function esNombreGrupoParticularApp(
  nombreGrupo: string | null | undefined
) {
  return String(nombreGrupo || '')
    .trim()
    .toUpperCase()
    .startsWith('PARTICULAR ·');
}

function puntoEncuentroVisibleGrupoApp(
  nombreGrupo: string | null | undefined,
  puntoEncuentro: string | null | undefined
) {
  if (esNombreGrupoParticularApp(nombreGrupo)) return 'CON JOSE';
  return String(puntoEncuentro || '').trim() || '-';
}

type AppContenidoProps = {
  perfilUsuario?: PerfilUsuarioApp;
  onLogout?: () => void;
};

const supabaseApiApp = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

function tokenTestNivelDesdeUrlApp() {
  if (typeof window === 'undefined') return '';
  return new URLSearchParams(window.location.search).get('test_nivel') || '';
}

function referenciaTecnicaReporteApp(nivel: string): Array<[string, string]> {
  const limpio = String(nivel || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (limpio === 'INICIACION') {
    return [
      ['Nivel', 'Familiarización, deslizamiento y primeras frenadas.'],
      ['Cuña / giro', 'Mira si empieza a abrir cuña, frena y hacia dónde consigue girar.'],
      ['Autonomía', 'Entrada/salida de cinta y ayuda necesaria.'],
      ['Siguiente paso', 'A cuando controle el deslizamiento y empiece a frenar en cuña.'],
    ];
  }
  if (limpio === 'A') {
    return [
      ['Nivel', 'Cuña de frenado, control de velocidad y primeros giros.'],
      ['Cuña / giro', 'Mira si frena a demanda y gira a ambos lados.'],
      ['Autonomía', 'Cinta, espera arriba y dependencia del profesor.'],
      ['Siguiente paso', 'A+ cuando encadene giros y gane autonomía.'],
    ];
  }
  if (limpio === 'A+') {
    return [
      ['Nivel', 'Giros en cuña encadenados y preparación para pista grande.'],
      ['Cuña / giro', 'Mira continuidad de giros, control de velocidad y si encadena sin ayuda.'],
      ['Autonomía', 'Cinta y dinámica de grupo casi sin ayuda.'],
      ['Siguiente paso', 'B / pista grande cuando controle, siga al entrenador y pare donde se le pide.'],
    ];
  }
  if (limpio === 'B') {
    return [
      ['Nivel', 'Cuña todavía asentándose en pista grande.'],
      ['Técnica', 'Giros enlazados y control de velocidad en grande.'],
      ['Autonomía', 'Moverse con seguridad en pista grande y remontes.'],
      ['Siguiente paso', 'B+ cuando la cuña sea sólida y encadenada.'],
    ];
  }
  if (limpio === 'B+' || limpio === 'B++') {
    return [
      ['Nivel', 'Cuña encadenada → Fundamental → inicio de paralelo.'],
      ['Técnica', 'Paralelo en diagonales y cuña cada vez menor durante el giro.'],
      ['Autonomía', 'Soltura en pista grande y remontes.'],
      ['Siguiente paso', 'C cuando el paralelo empiece a aparecer de forma clara y repetida.'],
    ];
  }
  if (limpio === 'C') {
    return [
      ['Nivel', 'Inicio de paralelo / paralelo elemental.'],
      ['Debe verse', 'El paralelo aparece de forma real en parte del giro y se repite con control; empieza a cargar correctamente el esquí exterior.'],
      ['Todavía puede fallar', 'Puede reaparecer cuña, perder el paralelo o necesitar una trayectoria amplia para mantener el control.'],
      ['No basta', 'Bajar pista grande, usar remontes o esquiar con confianza no convierte por sí solo a un alumno en C.'],
      ['Siguiente paso', 'C+ cuando el paralelo sea habitual, amplio, fluido y estable, con apoyo exterior reconocible.'],
    ];
  }
  if (limpio === 'C+') {
    return [
      ['Nivel', 'Paralelo habitual, fluido y estable.'],
      ['Debe verse', 'Mantiene paralelo de forma repetida, controla trayectoria y ritmo, y muestra apoyo exterior claro sin depender de la cuña.'],
      ['Trabajo técnico', 'Empieza a manejar cantos, cambios de radio y ajustes de trayectoria sin perder la calidad básica del paralelo.'],
      ['No basta', 'Ir rápido, tener muchos días de esquí o autonomía total no justifica C+ si el paralelo no es estable.'],
      ['Siguiente paso', 'D solo cuando el paralelo esté realmente consolidado y permita variar radio, ritmo y apoyos con calidad repetible.'],
    ];
  }
  if (limpio === 'D') {
    return [
      ['Nivel', 'Paralelo consolidado de calidad.'],
      ['Debe verse', 'Paralelo estable y repetible con control de trayectoria, ritmo, apoyo exterior y cambio de cantos.'],
      ['Debe resolver', 'Puede modificar radio y ritmo a demanda sin desordenar postura, apoyos ni línea.'],
      ['No basta', 'Velocidad, valentía, experiencia o autonomía completa no son criterios suficientes para D.'],
      ['Siguiente paso', 'D+ únicamente cuando exista conducción clara, estable y repetible, no por hacer algún giro conducido aislado.'],
    ];
  }
  if (limpio === 'D+') {
    return [
      ['Nivel', 'Viraje conducido claro, estable y repetible.'],
      ['Debe verse', 'Conduce de forma consistente con control de cantos, presión, apoyo exterior, línea y transición.'],
      ['Debe resolver', 'Cambia radio, ritmo y trayectoria manteniendo conducción y calidad técnica, no solo velocidad.'],
      ['No basta', 'Un paralelo muy bueno o algún giro sobre cantos no es D+. La conducción debe aparecer de forma habitual y verificable.'],
      ['Siguiente paso', 'Refinar precisión, presión, transición, variación de radios y recursos técnicos avanzados.'],
    ];
  }

  return [
    ['Nivel', 'Selecciona lo que realmente has visto hoy.'],
    ['Técnica', 'Marca la fase técnica dominante del niño.'],
    ['Autonomía', 'Valora la ayuda real que necesita.'],
    ['Siguiente paso', 'Usa la recomendación solo si ves una progresión clara.'],
  ];
}

function reporteInicial(): ReporteFormState {
  return {
    nivel: 'B',
    actitud: 'Correcta',
    pista: 'Pequeña',
    autonomia: '',
    ritmoGrupo: '',
    remontes: 'Cinta',
    incidencia: 'Sin incidencia',
    observaciones: '',
    autonomiaCinta: '',
    cunaFrenada: '',
    giroInicial: '',
    dinamicaAutonoma: '',
    ayudaCunero: 'No',
    evaluacionTecnica: evaluacionTecnicaInicial('B'),
    mejorasHoy: [],
    prioridades: [],
  };
}

const opcionesAutonomiaCintaInicialApp = [
  'Necesita ayuda completa',
  'Sube acompañado',
  'Entra solo · ayuda al salir',
  'Entra y sale solo',
  'Sube solo · espera arriba · sale a señal',
];

const opcionesCunaFrenadaInicialApp = [
  'No abre cuña',
  'Abre cuña con ayuda',
  'Cuña funcional',
  'Frena con ayuda',
  'Frena a demanda',
];

const opcionesGiroInicialApp = [
  'No gira',
  'Gira solo hacia un lado',
  'Giros aislados',
  'Enlaza giros en cuña',
];

const opcionesDinamicaAutonomaInicialApp = [
  'Necesita al profesor todo el tiempo',
  'Espera arriba con ayuda',
  'Espera arriba solo',
  'Sigue al profesor y mantiene su sitio en fila',
  'Listo para probar pista grande',
];

const opcionesAyudaCuneroInicialApp = [
  'No',
  'Sí · 1 bajada y después hace cuña solo',
  'Sí · 1 bajada y sigue necesitando ayuda',
];


function tecnicaInicialDerivadaReporteApp(form: ReporteFormState) {
  const giro = String(form.giroInicial || '').trim();
  const cuna = String(form.cunaFrenada || '').trim();

  if (giro === 'Enlaza giros en cuña') return 'Giros en cuña encadenados';
  if (giro === 'Giros aislados' || giro === 'Gira solo hacia un lado')
    return 'Giros en cuña';
  if (giro === 'No gira') {
    if (cuna === 'Frena a demanda') return 'Control de velocidad en cuña';
    if (cuna === 'Cuña funcional' || cuna === 'Frena con ayuda')
      return 'Cuña de frenado';
  }

  if (cuna === 'Frena a demanda') return 'Control de velocidad en cuña';
  if (cuna === 'Cuña funcional' || cuna === 'Frena con ayuda')
    return 'Cuña de frenado';
  if (cuna === 'Abre cuña con ayuda') return 'Cuña de frenado';
  if (cuna === 'No abre cuña') return 'Deslizamiento directo';

  return 'Primer contacto / familiarización';
}

function esNivelAprendizajeInicialApp(nivel: string | null | undefined) {
  const limpio = String(nivel || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  return (
    limpio === 'INICIACION' ||
    limpio === 'DEBUT' ||
    limpio === 'A' ||
    limpio === 'A+'
  );
}

function IconoNavegacionApp({ tipo }: { tipo: string }) {
  const comun = {
    width: 20,
    height: 20,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
  };

  switch (tipo) {
    case 'inicio':
      return <svg {...comun}><path d="M3 10.5 12 3l9 7.5"/><path d="M5.5 9.5V21h13V9.5"/><path d="M9.5 21v-6h5v6"/></svg>;
    case 'agenda':
      return <svg {...comun}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/><path d="M8 14h3M13 14h3M8 17h3"/></svg>;
    case 'cierre':
      return <svg {...comun}><circle cx="12" cy="12" r="9"/><path d="m8.5 12 2.2 2.2L16 9"/></svg>;
    case 'fichas':
      return <svg {...comun}><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="M6 16c.8-2 2-3 3-3s2.2 1 3 3M14 9h4M14 13h4"/></svg>;
    case 'intensivos':
      return <svg {...comun}><path d="m3 20 6.5-11 3.2 5L15 10l6 10Z"/><path d="m8.1 11.5 1.4 1.2 1.1-1.7"/></svg>;
    case 'ocio':
      return <svg {...comun}><path d="M12 2v20M4.2 6.5l15.6 11M19.8 6.5l-15.6 11"/><path d="m9.5 4 2.5 2 2.5-2M9.5 20l2.5-2 2.5 2"/></svg>;
    case 'entrenadores':
      return <svg {...comun}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8"/></svg>;
    case 'disponibilidad':
      return <svg {...comun}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg>;
    case 'movil':
      return <svg {...comun}><rect x="6" y="2" width="12" height="20" rx="2"/><path d="M10 18h4"/></svg>;
    case 'altas':
      return <svg {...comun}><path d="M15 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8" cy="7" r="4"/><path d="M19 8v6M16 11h6"/></svg>;
    case 'cobros':
      return <svg {...comun}><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 10h18M7 15h2"/></svg>;
    case 'analisis':
      return <svg {...comun}><path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/></svg>;
    case 'informes':
      return <svg {...comun}><path d="M6 2h9l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></svg>;
    case 'temporadas':
      return <svg {...comun}><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>;
    case 'accesos':
      return <svg {...comun}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></svg>;
    default:
      return <svg {...comun}><circle cx="12" cy="12" r="9"/></svg>;
  }
}

function AppContenido({ perfilUsuario, onLogout }: AppContenidoProps = {}) {
  const esCoordinadorApp =
    !perfilUsuario || esRolCoordinacionApp(perfilUsuario.rol);
  const esEntrenadorApp = Boolean(perfilUsuario && !esCoordinadorApp);
  const esCoordinadorJefeApp =
    !perfilUsuario || puedeVerDireccionApp(perfilUsuario.rol);
  const esAdministracionApp = perfilUsuario?.rol === 'administracion';
  const puedeGestionarAccesosUsuarioApp =
    !perfilUsuario || puedeGestionarAccesosApp(perfilUsuario.rol);
  const puedeGestionarWhatsappApp =
    !perfilUsuario ||
    perfilUsuario.rol === 'coordinador_jefe' ||
    perfilUsuario.rol === 'sub_coordinador' ||
    perfilUsuario.rol === 'coordinador';
  const entrenadorIdSesionApp = perfilUsuario?.entrenador_id || '';
  const [salirActivoCabecera, setSalirActivoCabecera] = useState(false);
  const [pwaInstalada, setPwaInstalada] = useState(false);
  const [pwaInstallPrompt, setPwaInstallPrompt] = useState<any | null>(null);
  const [mostrarAyudaInstalacionPwa, setMostrarAyudaInstalacionPwa] =
    useState(false);
  const [estadoSemanaPushEntrenadorApp, setEstadoSemanaPushEntrenadorApp] =
    useState<EstadoSemanaEntrenadorPush | null>(null);
  const [, setCargandoEstadoPushEntrenadorApp] = useState(false);
  const [gestionandoPushEntrenadorApp, setGestionandoPushEntrenadorApp] =
    useState(false);
  const [mensajePushEntrenadorApp, setMensajePushEntrenadorApp] = useState('');
  const autoPushIntentadoSemanaRef = useRef('');
  const [cerrandoSemanaPushApp, setCerrandoSemanaPushApp] = useState(false);
  const [enviandoRecordatorioReportesPushId, setEnviandoRecordatorioReportesPushId] = useState('');
  const [esVistaMovilApp, setEsVistaMovilApp] = useState(() =>
    typeof window !== 'undefined'
      ? window.matchMedia('(max-width: 719px)').matches
      : false
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(max-width: 719px)');
    const actualizar = () => setEsVistaMovilApp(media.matches);
    actualizar();
    media.addEventListener?.('change', actualizar);
    return () => media.removeEventListener?.('change', actualizar);
  }, []);

  const usarCabeceraCompactaApp = esEntrenadorApp || esVistaMovilApp;

  const [pantalla, setPantalla] = useState<
    | 'agenda'
    | 'resumenDia'
    | 'inicio'
    | 'planning'
    | 'entrenador'
    | 'alumnos'
    | 'ocioAlumnos'
    | 'ocioGrupos'
    | 'ocioSemana'
    | 'ocioCambios'
    | 'ocioEvaluaciones'
    | 'revisionOcio'
    | 'entrenadores'
    | 'usuarios'
    | 'whatsappDireccion'
    | 'administracion'
    | 'disponibilidad'
    | 'reportes'
    | 'cobros'
    | 'informes'
    | 'temporadas'
    | 'analisis'
    | 'intensivos'
    | 'listados'
  >(esEntrenadorApp ? 'entrenador' : 'inicio');

  const contenidoPantallaRef = useRef<HTMLDivElement | null>(null);
  const [cabeceraIntensivosAyudaApp, setCabeceraIntensivosAyudaApp] = useState<HTMLElement | null>(null);

  type EnfoqueAppOpciones = {
    espera?: number;
    block?: ScrollLogicalPosition;
    inline?: ScrollLogicalPosition;
    abrirDetallesPadre?: boolean;
  };

  // Regla de interacción Mítico:
  // usar este motor cuando una acción ABRE contenido (panel, ficha, grupo,
  // acordeón o subvista). No usarlo para guardar, borrar, publicar,
  // asistencia ni acciones rápidas que no abren contenido.
  function enfocarElementoApp(
    objetivo: string | HTMLElement | null | undefined,
    opciones: EnfoqueAppOpciones = {}
  ) {
    const {
      espera = 0,
      block = 'start',
      inline = 'nearest',
      abrirDetallesPadre = false,
    } = opciones;

    const ejecutar = () => {
      const elemento =
        typeof objetivo === 'string'
          ? document.getElementById(objetivo)
          : objetivo;

      if (!elemento) return;

      if (abrirDetallesPadre) {
        let padre = elemento.parentElement;
        while (padre) {
          if (padre instanceof HTMLDetailsElement) padre.open = true;
          padre = padre.parentElement;
        }
      }

      elemento.scrollIntoView({
        behavior: 'smooth',
        block,
        inline,
      });
    };

    if (espera > 0) {
      window.setTimeout(ejecutar, espera);
      return;
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(ejecutar);
    });
  }

  const abrirPantallaConScroll = (destino: typeof pantalla) => {
    setPantalla(destino);
    enfocarElementoApp(contenidoPantallaRef.current);
  };

  useEffect(() => {
    if (typeof window === 'undefined' || pantalla !== 'intensivos') {
      setCabeceraIntensivosAyudaApp(null);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      const contenido = document.querySelector('.mitico-content-shell');
      const titulo = Array.from(contenido?.querySelectorAll('h2') || []).find(
        (elemento) => elemento.textContent?.trim() === 'Gestión de intensivos'
      );
      setCabeceraIntensivosAyudaApp(
        titulo?.parentElement instanceof HTMLElement ? titulo.parentElement : null
      );
    });

    return () => window.cancelAnimationFrame(frame);
  }, [pantalla]);

  useEffect(() => {
    if (esEntrenadorApp && pantalla !== 'entrenador') {
      setPantalla('entrenador');
      return;
    }

    if (
      esCoordinadorApp &&
      !esCoordinadorJefeApp &&
      (pantalla === 'cobros' ||
        pantalla === 'informes' ||
        pantalla === 'temporadas' ||
        pantalla === 'analisis' ||
        pantalla === 'usuarios' ||
        pantalla === 'whatsappDireccion')
    ) {
      setPantalla('agenda');
    }
  }, [
    esEntrenadorApp,
    esCoordinadorApp,
    esCoordinadorJefeApp,
    pantalla,
  ]);

  useEffect(() => {
    if (
      pantalla === 'administracion' &&
      !puedeVerAdministracionAltasApp(perfilUsuario?.rol)
    ) {
      setPantalla(esEntrenadorApp ? 'entrenador' : 'agenda');
    }
  }, [pantalla, perfilUsuario?.rol, esEntrenadorApp]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const estaInstalada = () =>
      window.matchMedia('(display-mode: standalone)').matches ||
      Boolean((navigator as any).standalone);

    setPwaInstalada(estaInstalada());
    setPwaInstallPrompt(promptPendienteInstalacionPwa);

    const alPrepararInstalacion = (evento: Event) => {
      evento.preventDefault();
      promptPendienteInstalacionPwa =
        evento as BeforeInstallPromptEventMitico;
      setPwaInstallPrompt(promptPendienteInstalacionPwa);
    };

    const alInstalar = () => {
      promptPendienteInstalacionPwa = null;
      setPwaInstalada(true);
      setPwaInstallPrompt(null);
      setMostrarAyudaInstalacionPwa(false);
    };

    window.addEventListener(
      'beforeinstallprompt',
      alPrepararInstalacion as EventListener
    );
    window.addEventListener('appinstalled', alInstalar);

    return () => {
      window.removeEventListener(
        'beforeinstallprompt',
        alPrepararInstalacion as EventListener
      );
      window.removeEventListener('appinstalled', alInstalar);
    };
  }, []);

  async function instalarPwaEntrenador() {
    if (pwaInstalada) return;

    if (pwaInstallPrompt) {
      try {
        await pwaInstallPrompt.prompt();
        const eleccion = await pwaInstallPrompt.userChoice;

        if (eleccion?.outcome === 'accepted') {
          setMostrarAyudaInstalacionPwa(false);
        }

        promptPendienteInstalacionPwa = null;
        setPwaInstallPrompt(null);
        return;
      } catch {
        // Si el navegador no permite abrir el diálogo nativo,
        // mostramos la guía manual de instalación.
      }
    }

    setMostrarAyudaInstalacionPwa((actual) => !actual);
  }

  const esDispositivoIosPwa =
    typeof navigator !== 'undefined' &&
    /iphone|ipad|ipod/i.test(navigator.userAgent);

  async function contextoPushMiticoApp() {
    return {
      supabaseUrl: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
      accessToken: await obtenerAccessTokenSupabaseApp(),
    };
  }

  async function ejecutarPushMiticoApp<T extends MiticoPushActionResult>(
    action: string,
    payload: Record<string, unknown> = {}
  ): Promise<T> {
    const contexto = await contextoPushMiticoApp();
    return llamarMiticoPush<T>(contexto, action, payload);
  }

  async function notificarGrupoPublicadoPushApp(grupoId: string) {
    try {
      await ejecutarPushMiticoApp('group_published', { grupo_id: grupoId });
    } catch (error) {
      console.warn('Grupo publicado, pero no se pudo enviar el aviso push:', error);
    }
  }

  async function notificarCambioEntrenadorGrupoPublicadoPushApp(
    grupoId: string,
    entrenadorAnteriorId: string
  ) {
    try {
      const contexto = await contextoPushMiticoApp();
      const respuesta = await fetch(
        `${contexto.supabaseUrl}/functions/v1/mitico-group-assignment-push`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: contexto.anonKey,
            Authorization: `Bearer ${contexto.accessToken}`,
          },
          body: JSON.stringify({
            grupo_id: grupoId,
            entrenador_anterior_id: entrenadorAnteriorId,
          }),
        }
      );

      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) {
        throw new Error(
          String(
            datos?.error ||
              'No se pudo notificar el cambio de entrenador del grupo.'
          )
        );
      }

      return datos;
    } catch (error) {
      console.warn(
        'Entrenador cambiado, pero no se pudo enviar el aviso Push de reasignación:',
        error
      );
      return null;
    }
  }

  async function activarPushEntrenadorApp(semanaInicio: string) {
    if (!esEntrenadorApp) return;
    setGestionandoPushEntrenadorApp(true);
    setMensajePushEntrenadorApp('');

    try {
      const contexto = await contextoPushMiticoApp();
      await activarNotificacionesPushMitico(contexto);
      setMensajePushEntrenadorApp('Avisos activados en este dispositivo.');

      if (semanaInicio) {
        const estado = await ejecutarPushMiticoApp<EstadoSemanaEntrenadorPush>(
          'trainer_week_status',
          { semana_inicio: semanaInicio }
        );
        setEstadoSemanaPushEntrenadorApp(estado);
      }
    } catch (error) {
      setMensajePushEntrenadorApp(
        error instanceof Error ? error.message : 'No se pudieron activar los avisos.'
      );
    } finally {
      setGestionandoPushEntrenadorApp(false);
    }
  }


  const [usuariosOperativos, setUsuariosOperativos] = useState<
    UsuarioOperativoGestionApp[]
  >([]);
  const [cargandoUsuariosOperativos, setCargandoUsuariosOperativos] =
    useState(false);
  const [gestionandoUsuarioOperativoId, setGestionandoUsuarioOperativoId] =
    useState('');
  const [mostrarAltaUsuarioOperativo, setMostrarAltaUsuarioOperativo] =
    useState(false);
  const [formUsuarioOperativo, setFormUsuarioOperativo] = useState({
    nombre: '',
    email: '',
    rol: 'sub_coordinador' as 'sub_coordinador' | 'administracion',
  });

  const [avisos, setAvisos] = useState<AvisoJose[]>([]);
  const [resumenInicio, setResumenInicio] = useState<ResumenInicio>({
    reportesPendientes: 0,
    asistenciasSinConfirmar: 0,
    gruposSinPublicar: 0,
    entrenadoresSinConfirmar: 0,
  });

  const [anioInicioTemporadaAgenda, setAnioInicioTemporadaAgenda] = useState(
    () =>
      Math.max(
        2026,
        leerStorageNumeroApp(
          'mitico_temporada_trabajo',
          temporadaInicioDefectoAgenda
        )
      )
  );
  const [mesAgenda, setMesAgenda] = useState(() =>
    leerStorageApp('mitico_mes_trabajo', '')
  );
  const [semanaAgendaInicio, setSemanaAgendaInicio] = useState(() =>
    leerStorageApp('mitico_semana_trabajo', '')
  );
  const [planning, setPlanning] = useState<GrupoPlanning[]>([]);
  const [filtroPlanning, setFiltroPlanning] = useState<
    'todos' | 'pendientes' | 'cerrados' | 'sin_publicar'
  >('todos');
  const [detalle, setDetalle] = useState<DetalleGrupo | null>(null);
  const [whatsappGruposApp, setWhatsappGruposApp] = useState<
    WhatsappGrupoApp[]
  >([]);
  const [whatsappAdminTipo, setWhatsappAdminTipo] = useState<
    'BABY' | 'OCIO' | 'INTENSIVOS'
  >('BABY');
  const [whatsappAdminIntensivoId, setWhatsappAdminIntensivoId] = useState('');
  const [whatsappAdminEnlace, setWhatsappAdminEnlace] = useState('');

  const [gruposEntrenador, setGruposEntrenador] = useState<
    GrupoEntrenadorApp[]
  >([]);
  const [alumnosReporteEntrenador, setAlumnosReporteEntrenador] = useState<
    AlumnoReporteEntrenador[]
  >([]);
  const [busquedaGrupoEntrenador, setBusquedaGrupoEntrenador] = useState('');
  const [tabVistaEntrenador, setTabVistaEntrenador] = useState<
    'disponibilidad' | 'grupos'
  >('disponibilidad');
  const [semanaEntrenadorSeleccionada, setSemanaEntrenadorSeleccionada] =
    useState('');
  const [semanaVistaEntrenadorCoordinadorForzada, setSemanaVistaEntrenadorCoordinadorForzada] =
    useState('');
  const irASeccionGrupoEntrenador = (
    seccion: 'asistencia' | 'trabajo' | 'observaciones',
    grupoDomId: string
  ) => {
    setSeccionGrupoEntrenador(seccion);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const objetivo = document.getElementById(
          `${grupoDomId}-${seccion}`
        );
        if (!objetivo) return;

        const ficha = objetivo.closest(
          '.trainer-group-card.is-sheet-open'
        ) as HTMLElement | null;

        if (
          ficha &&
          window.matchMedia('(max-width: 719px)').matches
        ) {
          ficha.scrollTo({
            top: Math.max(0, objetivo.offsetTop - 150),
            behavior: 'smooth',
          });
          return;
        }

        objetivo.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
      });
    });
  };

  const [grupoActivoEntrenador, setGrupoActivoEntrenador] =
    useState<GrupoActivoEntrenador | null>(null);
  const [seccionGrupoEntrenador, setSeccionGrupoEntrenador] = useState<
    'asistencia' | 'trabajo' | 'observaciones'
  >('asistencia');
  const [reporteActivo, setReporteActivo] = useState<ReporteActivo | null>(
    null
  );
  const [formReporte, setFormReporte] = useState<ReporteFormState>(
    reporteInicial()
  );
  const [nivelPartidaReporte, setNivelPartidaReporte] = useState('');
  const [guardandoReporte, setGuardandoReporte] = useState(false);
  const [errorReporte, setErrorReporte] = useState('');
  const aperturaReporteIdRef = useRef(0);

  const overlayEntrenadorAbierto = Boolean(
    grupoActivoEntrenador || reporteActivo
  );

  useEffect(() => {
    if (!overlayEntrenadorAbierto || typeof window === 'undefined') return;
    if (!window.matchMedia('(max-width: 719px)').matches) return;

    const scrollY = window.scrollY;
    const estilosPrevios = {
      position: document.body.style.position,
      top: document.body.style.top,
      left: document.body.style.left,
      right: document.body.style.right,
      width: document.body.style.width,
      overflow: document.body.style.overflow,
    };

    document.body.style.position = 'fixed';
    document.body.style.top = `-${scrollY}px`;
    document.body.style.left = '0';
    document.body.style.right = '0';
    document.body.style.width = '100%';
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.position = estilosPrevios.position;
      document.body.style.top = estilosPrevios.top;
      document.body.style.left = estilosPrevios.left;
      document.body.style.right = estilosPrevios.right;
      document.body.style.width = estilosPrevios.width;
      document.body.style.overflow = estilosPrevios.overflow;
      window.scrollTo({ top: scrollY, behavior: 'auto' });
    };
  }, [overlayEntrenadorAbierto]);

  const [modalidadAnalisisAdmin, setModalidadAnalisisAdmin] =
    useState<ModalidadAnalisisAdminApp>('BABY');
  const [temporadaAnalisisAdminId, setTemporadaAnalisisAdminId] =
    useState<string>('');
  const [analisisAdmin, setAnalisisAdmin] =
    useState<AnalisisAdminPayloadApp | null>(null);
  const [cargandoAnalisisAdmin, setCargandoAnalisisAdmin] = useState(false);
  const [errorAnalisisAdmin, setErrorAnalisisAdmin] = useState('');

  const [alumnos, setAlumnos] = useState<AlumnoResumen[]>([]);
  const [alumnosBabyFicha, setAlumnosBabyFicha] = useState<
    AlumnoBabyFichaApp[]
  >([]);
  const [tendenciasRitmoAlumnos, setTendenciasRitmoAlumnos] = useState<
    TendenciaRitmoAlumnoApp[]
  >([]);
  const [perfilesOperativosAlumnos, setPerfilesOperativosAlumnos] = useState<
    PerfilOperativoAlumnoApp[]
  >([]);
  const [contextoTecnicoReportes, setContextoTecnicoReportes] = useState<
    ContextoTecnicoReporteApp[]
  >([]);
  const [progresionInicialAlumnos, setProgresionInicialAlumnos] = useState<
    ProgresionInicialAlumnoApp[]
  >([]);
  const [trabajosDiariosHistoricos, setTrabajosDiariosHistoricos] = useState<
    TrabajoDiarioHistoricoApp[]
  >([]);
  const [busquedaAlumno, setBusquedaAlumno] = useState('');
  const [filtroAlumnos, setFiltroAlumnos] = useState<
    | 'todos'
    | 'sin_nivel'
    | 'sin_reportes'
    | 'revisar_ficha'
    | 'revision_reciente'
    | 'seguimiento_especial'
  >('todos');
  const [vistaFichasAlumnos, setVistaFichasAlumnos] = useState<
    'general' | 'intensivos'
  >('general');
  const [alumnoEditandoId, setAlumnoEditandoId] = useState<string | null>(null);
  const [alumnoEditNombre, setAlumnoEditNombre] = useState('');
  const [alumnoEditFechaNacimiento, setAlumnoEditFechaNacimiento] =
    useState('');
  const [alumnoEditTelefono, setAlumnoEditTelefono] = useState('');
  const [alumnoEditNivel, setAlumnoEditNivel] = useState('');
  const [alumnoEditOrigen, setAlumnoEditOrigen] =
    useState('Jose / Coordinador');
  const [alumnoEditEstado, setAlumnoEditEstado] = useState(
    'pendiente completar'
  );
  const [alumnoEditCamiseta, setAlumnoEditCamiseta] = useState(true);
  const [mostrarNuevoAlumnoManual, setMostrarNuevoAlumnoManual] =
    useState(false);
  const [nuevoAlumnoNombre, setNuevoAlumnoNombre] = useState('');
  const [nuevoAlumnoNivel, setNuevoAlumnoNivel] = useState('');
  const [nuevoAlumnoOrigen, setNuevoAlumnoOrigen] =
    useState('Jose / Coordinador');
  const [nuevoAlumnoEstado, setNuevoAlumnoEstado] = useState(
    'pendiente completar'
  );
  const [evaluacionAlumnoActivaId, setEvaluacionAlumnoActivaId] = useState<
    string | null
  >(null);
  const [evaluacionAlumnoTexto, setEvaluacionAlumnoTexto] = useState('');
  const [historialAlumnoAbiertoId, setHistorialAlumnoAbiertoId] = useState<
    string | null
  >(null);
  const [historialReportesFichaPorAlumno, setHistorialReportesFichaPorAlumno] =
    useState<Record<string, HistorialReporteAlumnoFichaApp[]>>({});
  const [historialReportesFichaCargandoId, setHistorialReportesFichaCargandoId] =
    useState<string | null>(null);
  const [filtroModalidadHistorialFicha, setFiltroModalidadHistorialFicha] =
    useState<'TODOS' | 'BABY' | 'OCIO' | 'INTENSIVOS'>('TODOS');

  const [ocioAlumnos, setOcioAlumnos] = useState<OcioAlumnoApp[]>([]);
  const [ocioGrupos, setOcioGrupos] = useState<OcioGrupoApp[]>([]);
  const [ocioTurnoVista, setOcioTurnoVista] = useState<
    'Jueves' | 'Sábado' | 'Domingo'
  >('Jueves');
  const [ocioAlumnoPendienteNuevoGrupoId, setOcioAlumnoPendienteNuevoGrupoId] =
    useState('');
  const [ocioNuevoNombre, setOcioNuevoNombre] = useState('');
  const [ocioNuevoNivel, setOcioNuevoNivel] = useState('');
  const [ocioNuevoAlumnoId, setOcioNuevoAlumnoId] = useState('');
  const [ocioNuevoSugerencias, setOcioNuevoSugerencias] = useState<
    AlumnoResumen[]
  >([]);
  const [ocioNuevoRecomendaciones, setOcioNuevoRecomendaciones] = useState<
    Array<{
      grupo: OcioGrupoApp;
      estado: 'RECOMENDADO' | 'REVISAR' | 'NO_ENCAJA';
      motivo: string;
      score: number;
      totalActual: number;
      totalFinal: number;
      esTurnoActual: boolean;
    }>
  >([]);
  const [ocioNuevoAnalizando, setOcioNuevoAnalizando] = useState(false);
  const [ocioNuevoGuardandoGrupoId, setOcioNuevoGuardandoGrupoId] =
    useState('');
  const [ocioRecomendacionesCambio, setOcioRecomendacionesCambio] = useState<
    OcioRecomendacionCambioApp[]
  >([]);
  const [busquedaOcio, setBusquedaOcio] = useState('');
  const [filtroDiaFichasOcio, setFiltroDiaFichasOcio] = useState<
    '' | 'Jueves' | 'Sábado' | 'Domingo'
  >('');
  const [filtroEstadoFichasOcio, setFiltroEstadoFichasOcio] = useState<
    'todos' | 'sin_grupo' | 'sin_nivel' | 'revisar_grupo'
  >('todos');
  const [mostrarNuevoOcio, setMostrarNuevoOcio] = useState(false);
  const [ocioAlumnoEditandoId, setOcioAlumnoEditandoId] = useState<
    string | null
  >(null);
  const [ocioNombre, setOcioNombre] = useState('');
  const [ocioTelefono, setOcioTelefono] = useState('');
  const [ocioNivel, setOcioNivel] = useState('');
  const [ocioFechaNacimiento, setOcioFechaNacimiento] = useState('');
  const [ocioDiaFijo, setOcioDiaFijo] = useState('Jueves');
  const [ocioHoraInicio, setOcioHoraInicio] = useState('18:00');
  const [ocioHoraFin, setOcioHoraFin] = useState('20:00');
  const [ocioObservaciones, setOcioObservaciones] = useState('');
  const [textoImportarOcio, setTextoImportarOcio] = useState('');
  const [resultadoImportarOcio, setResultadoImportarOcio] = useState<
    OcioImportadoApp[]
  >([]);
  const [ocioGrupoForm, setOcioGrupoForm] = useState<OcioGrupoFormState>(
    ocioGrupoFormInicial()
  );
  const [mostrarFormularioOcioGrupo, setMostrarFormularioOcioGrupo] =
    useState(false);
  const [ocioPropuestaGrupos, setOcioPropuestaGrupos] = useState<
    OcioGrupoPropuestaApp[]
  >([]);
  const [ocioGenerandoPropuesta, setOcioGenerandoPropuesta] = useState(false);
  const [ocioGuardandoPropuesta, setOcioGuardandoPropuesta] = useState(false);
  const [evaluacionOcioActivaId, setEvaluacionOcioActivaId] = useState<
    string | null
  >(null);
  const [evaluacionOcioTexto, setEvaluacionOcioTexto] = useState('');
  const [ocioSemanaAsistencia, setOcioSemanaAsistencia] = useState<
    Record<string, boolean>
  >({});
  const [ocioSemanaEntrenadores, setOcioSemanaEntrenadores] = useState<
    Record<string, string>
  >({});
  const [ocioSemanaResultados, setOcioSemanaResultados] = useState<
    OcioPrepararResultadoApp[]
  >([]);
  const [ocioAimHarderSemana, setOcioAimHarderSemana] =
    useState<OcioAimHarderSemanaApp | null>(null);
  const [ocioAimHarderCargando, setOcioAimHarderCargando] = useState(false);
  const [ocioAimHarderMensaje, setOcioAimHarderMensaje] = useState('');
  const [ocioAimHarderError, setOcioAimHarderError] = useState('');
  const [ocioAimHarderEstadoAlumnos, setOcioAimHarderEstadoAlumnos] = useState<
    Record<string, OcioAimHarderEstadoAlumnoApp>
  >({});
  const [ocioCambiosPuntuales, setOcioCambiosPuntuales] = useState<
    OcioCambioPuntualApp[]
  >([]);
  const [ocioCambioForm, setOcioCambioForm] = useState<OcioCambioFormState>(
    emptyOcioRelocationForm()
  );
  const [mostrarFormularioOcioCambio, setMostrarFormularioOcioCambio] =
    useState(false);

  const [entrenadores, setEntrenadores] = useState<EntrenadorResumen[]>([]);
  const [busquedaEntrenador, setBusquedaEntrenador] = useState('');
  const [filtroEntrenadores, setFiltroEntrenadores] = useState<
    | 'todos'
    | 'activos'
    | 'inactivos'
    | 'sin_chaqueta'
    | 'documentacion_pendiente'
  >('todos');
  const [mostrarFormularioEntrenador, setMostrarFormularioEntrenador] =
    useState(false);
  const [formEntrenador, setFormEntrenador] = useState<EntrenadorFormState>(
    entrenadorFormInicial()
  );
  const [creandoAccesoEntrenadorId, setCreandoAccesoEntrenadorId] =
    useState('');
  const [gestionandoAccesoEntrenadorId, setGestionandoAccesoEntrenadorId] =
    useState('');
  const [estadosAccesoEntrenadores, setEstadosAccesoEntrenadores] = useState<
    Record<string, EstadoAccesoEntrenadorApp>
  >({});
  const [
    cargandoEstadosAccesoEntrenadores,
    setCargandoEstadosAccesoEntrenadores,
  ] = useState(false);
  const [estadosAvisosEntrenadores, setEstadosAvisosEntrenadores] = useState<
    Record<string, EstadoAvisosEntrenadorApp>
  >({});
  const [
    cargandoEstadosAvisosEntrenadores,
    setCargandoEstadosAvisosEntrenadores,
  ] = useState(false);

  const [disponibilidad, setDisponibilidad] = useState<
    DisponibilidadEntrenador[]
  >([]);
  const [disponibilidadEditorVista, setDisponibilidadEditorVista] = useState<
    RespuestaDisponibilidadPublicadaEntrenadoresEditor | null
  >(null);
  const [
    semanaPublicadaObjetivoEntrenador,
    setSemanaPublicadaObjetivoEntrenador,
  ] = useState('');
  const [busquedaDisponibilidad, setBusquedaDisponibilidad] = useState('');
  const [filtroDisponibilidad, setFiltroDisponibilidad] = useState<
    'todos' | 'disponibles' | 'no_puedo' | 'pendientes'
  >('todos');


  const [borradorDisponibilidadEditor, setBorradorDisponibilidadEditor] =
    useState<BorradorDisponibilidadEditor | null>(null);
  const [vistaPreviaDisponibilidadEditor, setVistaPreviaDisponibilidadEditor] =
    useState(false);
  const [mensajeDisponibilidadEditor, setMensajeDisponibilidadEditor] =
    useState('');
  const [diaDisponibilidadEditorAbierto, setDiaDisponibilidadEditorAbierto] =
    useState<string | null>(null);
  const [turnoResumenDisponibilidadAbierto, setTurnoResumenDisponibilidadAbierto] =
    useState<string | null>(null);
  const [
    categoriaResumenDisponibilidad,
    setCategoriaResumenDisponibilidad,
  ] = useState<Record<string, 'disponibles' | 'no_puedo' | 'pendientes'>>({});
  const [estadoServidorDisponibilidadEditor, setEstadoServidorDisponibilidadEditor] =
    useState<EstadoServidorDisponibilidadEditor>('sin_preparar');
  const [publicadaAtDisponibilidadEditor, setPublicadaAtDisponibilidadEditor] =
    useState<string | null>(null);
  const [versionPublicadaDisponibilidadEditor, setVersionPublicadaDisponibilidadEditor] =
    useState(0);
  const [guardandoDisponibilidadEditor, setGuardandoDisponibilidadEditor] =
    useState(false);
  const [publicandoDisponibilidadEditor, setPublicandoDisponibilidadEditor] =
    useState(false);
  const [retirandoDisponibilidadEditor, setRetirandoDisponibilidadEditor] =
    useState(false);

  const [reportesPendientes, setReportesPendientes] = useState<
    ReportePendiente[]
  >([]);
  const [busquedaReportes, setBusquedaReportes] = useState('');
  const [filtroReportes, setFiltroReportes] = useState<
    'todos' | 'faltan_reportes' | 'asistencias_sin_confirmar' | 'criticos'
  >('todos');

  const [cobros, setCobros] = useState<CobroMensual[]>([]);
  const [cobrosDetalle, setCobrosDetalle] = useState<CobroDetalleMensual[]>([]);
  const [anioCobros, setAnioCobros] = useState(new Date().getFullYear());
  const [mesCobros, setMesCobros] = useState(new Date().getMonth() + 1);
  const [busquedaCobros, setBusquedaCobros] = useState('');
  const [filtroCobros, setFiltroCobros] = useState<
    'todos' | 'pendiente' | 'cerrado' | 'incidencias' | 'este_mes'
  >('todos');
  const [tarifasEditadasCobros, setTarifasEditadasCobros] = useState<
    Record<string, string>
  >({});
  const [formCobroManual, setFormCobroManual] = useState<CobroManualFormState>(
    cobroManualInicial()
  );
  const [entrenoManualCobroAbiertoId, setEntrenoManualCobroAbiertoId] =
    useState('');
  const [cobroPdfPreview, setCobroPdfPreview] =
    useState<CobroPdfPreviewState | null>(null);

  const [intensivos, setIntensivos] = useState<IntensivoApp[]>([]);
  const [intensivoFichaSeleccionado, setIntensivoFichaSeleccionado] =
    useState<Record<string, string>>({});
  const [anadiendoFichaAIntensivoId, setAnadiendoFichaAIntensivoId] =
    useState('');
  const [selectorIntensivoFichaAbiertoId, setSelectorIntensivoFichaAbiertoId] =
    useState('');
  const [panelControlIntensivo, setPanelControlIntensivo] = useState<
    PanelControlIntensivoApp[]
  >([]);
  const [busquedaIntensivos, setBusquedaIntensivos] = useState('');
  const [filtroIntensivos, setFiltroIntensivos] = useState<
    'todos' | 'activos' | 'cerrados' | 'sin_alumnos' | 'proximos'
  >('todos');
  const [mesIntensivos, setMesIntensivos] = useState(() => {
    const ahora = new Date();
    return `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}`;
  });
  const [
    gestionarPanelControlIntensivoId,
    setGestionarPanelControlIntensivoId,
  ] = useState<string | null>(null);
  const [intensivoCursoAbiertoId, setIntensivoCursoAbiertoId] = useState<
    string | null
  >(null);

  const [mostrarFormularioIntensivo, setMostrarFormularioIntensivo] =
    useState(false);
  const [formIntensivo, setFormIntensivo] = useState<IntensivoFormState>(
    intensivoInicial()
  );
  const [diaActivoIntensivoId, setDiaActivoIntensivoId] = useState<
    string | null
  >(null);
  const [diaEditandoIntensivoId, setDiaEditandoIntensivoId] = useState<
    string | null
  >(null);
  const [formDiaIntensivo, setFormDiaIntensivo] =
    useState<DiaIntensivoFormState>(diaIntensivoInicial());
  const [
    plantillaCuatroSesionesIntensivo,
    setPlantillaCuatroSesionesIntensivo,
  ] = useState<PlantillaCuatroSesionesIntensivoState>(
    plantillaCuatroSesionesInicial()
  );
  const [
    mostrarPlantillaCuatroSesionesIntensivoId,
    setMostrarPlantillaCuatroSesionesIntensivoId,
  ] = useState<string | null>(null);
  const [intensivoAlumnos, setIntensivoAlumnos] = useState<
    IntensivoAlumnoApp[]
  >([]);
  const [alumnosParaIntensivo, setAlumnosParaIntensivo] = useState<
    AlumnoParaIntensivoApp[]
  >([]);
  const [alumnosResumenVolcado, setAlumnosResumenVolcado] = useState<
    AlumnoResumenParaVolcadoApp[]
  >([]);
  const [gestionarAlumnosIntensivoId, setGestionarAlumnosIntensivoId] =
    useState<string | null>(null);
  const [busquedaAlumnoIntensivo, setBusquedaAlumnoIntensivo] = useState('');
  const [alumnoSeleccionadoIntensivoId, setAlumnoSeleccionadoIntensivoId] =
    useState('');
  const [mostrarVolcadoIntensivoId, setMostrarVolcadoIntensivoId] = useState<
    string | null
  >(null);
  const [textoVolcadoIntensivo, setTextoVolcadoIntensivo] = useState('');
  const [resultadoVolcadoIntensivo, setResultadoVolcadoIntensivo] = useState<
    VolcadoAlumnoIntensivoApp[]
  >([]);
  const [intensivoDias, setIntensivoDias] = useState<IntensivoDiaApp[]>([]);
  const [intensivoAsistencias, setIntensivoAsistencias] = useState<
    IntensivoAsistenciaApp[]
  >([]);
  const [gestionarAsistenciaIntensivoId, setGestionarAsistenciaIntensivoId] =
    useState<string | null>(null);
  const [diaAsistenciaSeleccionadoId, setDiaAsistenciaSeleccionadoId] =
    useState('');
  const [intensivoMás, setIntensivoMás] = useState<IntensivoRecuperacionApp[]>(
    []
  );
  const [recomendacionesRecuperacion, setRecomendacionesRecuperacion] = useState<
    RecuperacionRecomendacionApp[]
  >([]);
  const [gruposDestinoRecuperacion, setGruposDestinoRecuperacion] = useState<
    GrupoDestinoRecuperacionApp[]
  >([]);
  const [gestionarMásIntensivoId, setGestionarMásIntensivoId] = useState<
    string | null
  >(null);

  const [gruposIntensivoDia, setGruposIntensivoDia] = useState<
    GrupoIntensivoDiaApp[]
  >([]);
  const [resumenReportesIntensivo, setResumenReportesIntensivo] = useState<
    ResumenReportesIntensivoApp[]
  >([]);
  const [resumenFinalIntensivo, setResumenFinalIntensivo] = useState<
    ResumenFinalIntensivoApp[]
  >([]);
  const [reportesDetalleIntensivo, setReportesDetalleIntensivo] = useState<
    ReporteDetalleIntensivoApp[]
  >([]);
  const [gestionarDiplomasIntensivoId, setGestionarDiplomasIntensivoId] =
    useState<string | null>(null);
  const [gestionarGruposIntensivoId, setGestionarGruposIntensivoId] = useState<
    string | null
  >(null);
  const [diaGrupoSeleccionadoId, setDiaGrupoSeleccionadoId] = useState('');
  const [formGrupoIntensivo, setFormGrupoIntensivo] =
    useState<GrupoIntensivoFormState>(grupoIntensivoInicial());
  const [recomendacionesGrupoIntensivo, setRecomendacionesGrupoIntensivo] =
    useState<RecomendacionGrupoIntensivoDiaApp[]>([]);
  const [entrenadoresPorGrupoRecomendado, setEntrenadoresPorGrupoRecomendado] =
    useState<Record<string, string>>({});
  const [
    entrenadoresApoyoPorGrupoRecomendado,
    setEntrenadoresApoyoPorGrupoRecomendado,
  ] = useState<Record<string, string>>({});
  const [
    responsablesReportePorGrupoRecomendado,
    setResponsablesReportePorGrupoRecomendado,
  ] = useState<Record<string, string>>({});
  const [destinoAlumnoRecomendado, setDestinoAlumnoRecomendado] = useState<
    Record<string, string>
  >({});
  const [
    trabajoDiarioPorGrupoRecomendado,
    setTrabajoDiarioPorGrupoRecomendado,
  ] = useState<Record<string, string>>({});
  const [
    observacionesPorGrupoRecomendado,
    setObservacionesPorGrupoRecomendado,
  ] = useState<Record<string, string>>({});
  const [gruposExtraIntensivoPorDia, setGruposExtraIntensivoPorDia] =
    useState<Record<string, string[]>>({});

  const [revisionIntensivoId, setRevisionIntensivoId] = useState('');
  const [revisionIntensivoDiaId, setRevisionIntensivoDiaId] = useState('');
  const [revisionIntensivoSugerencias, setRevisionIntensivoSugerencias] =
    useState<RevisionEntreSesionesIntensivoApp[]>([]);
  const [revisionIntensivoAnalizando, setRevisionIntensivoAnalizando] =
    useState(false);
  const [revisionIntensivoAnalizado, setRevisionIntensivoAnalizado] =
    useState(false);

  const [listados, setListados] = useState<ListadoApp[]>([]);
  const [busquedaListados, setBusquedaListados] = useState('');
  const [filtroListados, setFiltroListados] = useState<
    'todos' | 'pendientes' | 'altas' | 'no_encontrados' | 'fuera_plazo'
  >('todos');

  const [snowZoneModo, setSnowZoneModo] =
    useState<SnowZoneModoApp>('mensual');
  const [snowZoneMes, setSnowZoneMes] = useState(() =>
    fechaIsoHoyApp().slice(0, 7)
  );
  const [snowZoneSemanaInicio, setSnowZoneSemanaInicio] = useState(() => {
    const hoy = new Date(`${fechaIsoHoyApp()}T12:00:00`);
    const diaSemana = hoy.getDay();
    const desplazamiento = diaSemana === 0 ? -6 : 1 - diaSemana;
    hoy.setDate(hoy.getDate() + desplazamiento);
    return fechaIsoEditor(hoy);
  });
  const [snowZoneDias, setSnowZoneDias] = useState<SnowZoneDiaApp[]>([]);
  const [snowZoneCargando, setSnowZoneCargando] = useState(false);
  const [snowZoneError, setSnowZoneError] = useState('');

  const [candidatosEquipo, setCandidatosEquipo] = useState<CandidatoEquipoApp[]>([]);
  const [candidatosEquipoCargando, setCandidatosEquipoCargando] = useState(false);
  const [candidatosEquipoError, setCandidatosEquipoError] = useState('');
  const [candidatosEquipoGenerado, setCandidatosEquipoGenerado] = useState(false);

  const [tipoListadoAlumnos, setTipoListadoAlumnos] =
    useState<TipoListadoAlumnosApp>('BABY');
  const [listadoAlumnosTemporada, setListadoAlumnosTemporada] = useState<
    ListadoAlumnoTemporadaApp[]
  >([]);
  const [listadoAlumnosCargando, setListadoAlumnosCargando] = useState(false);
  const [listadoAlumnosError, setListadoAlumnosError] = useState('');
  const [listadoAlumnosGenerado, setListadoAlumnosGenerado] = useState(false);
  const [busquedaListadoAlumnos, setBusquedaListadoAlumnos] = useState('');

  const [evaluacionesAnualesOcio, setEvaluacionesAnualesOcio] = useState<
    EvaluacionAnualOcioApp[]
  >([]);
  const [evaluacionesAnualesOcioCargando, setEvaluacionesAnualesOcioCargando] =
    useState(false);
  const [evaluacionesAnualesOcioError, setEvaluacionesAnualesOcioError] =
    useState('');
  const [evaluacionesAnualesOcioGeneradas, setEvaluacionesAnualesOcioGeneradas] =
    useState(false);
  const [busquedaEvaluacionAnualOcio, setBusquedaEvaluacionAnualOcio] =
    useState('');
  const [filtroDiaEvaluacionesOcio, setFiltroDiaEvaluacionesOcio] =
    useState<FiltroDiaEvaluacionesOcioApp>('Todos');
  const [evaluacionOcioIndividualSeleccionadoId, setEvaluacionOcioIndividualSeleccionadoId] =
    useState('');
  const [cortesEvaluacionOcio, setCortesEvaluacionOcio] = useState<
    CorteEvaluacionOcioApp[]
  >([]);
  const [cortesEvaluacionOcioCargando, setCortesEvaluacionOcioCargando] =
    useState(false);
  const [cortesEvaluacionOcioError, setCortesEvaluacionOcioError] =
    useState('');
  const [guardandoCorteEvaluacionOcio, setGuardandoCorteEvaluacionOcio] =
    useState<'NAVIDAD' | 'FINAL' | ''>('');

  const [cierreTemporadaAlumnos, setCierreTemporadaAlumnos] = useState<
    CierreTemporadaAlumnoApp[]
  >([]);
  const [resumenCierreTemporada, setResumenCierreTemporada] =
    useState<ResumenCierreTemporadaApp | null>(null);
  const [cierreTemporadaCargando, setCierreTemporadaCargando] = useState(false);
  const [cierreTemporadaError, setCierreTemporadaError] = useState('');
  const [cierreTemporadaAnalizado, setCierreTemporadaAnalizado] = useState(false);
  const [filtroCierreTemporada, setFiltroCierreTemporada] = useState<
    'todos' | 'conservar' | 'eliminar'
  >('todos');
  const [busquedaCierreTemporada, setBusquedaCierreTemporada] = useState('');

  const [archivoCopiaMaestraNombre, setArchivoCopiaMaestraNombre] = useState('');
  const [temporadaOrigenCopiaMaestra, setTemporadaOrigenCopiaMaestra] = useState('');
  const [filasCopiaMaestraImport, setFilasCopiaMaestraImport] = useState<
    FilaCopiaMaestraImportApp[]
  >([]);
  const [errorCopiaMaestraImport, setErrorCopiaMaestraImport] = useState('');
  const [importandoCopiaMaestra, setImportandoCopiaMaestra] = useState(false);
  const [resultadoImportacionCopiaMaestra, setResultadoImportacionCopiaMaestra] =
    useState('');
  const [confirmacionCierreTexto, setConfirmacionCierreTexto] = useState('');
  const [confirmacionBackupCierre, setConfirmacionBackupCierre] = useState(false);
  const [confirmacionListadoCierre, setConfirmacionListadoCierre] = useState(false);
  const [cerrandoTemporada, setCerrandoTemporada] = useState(false);
  const [resultadoCierreTemporada, setResultadoCierreTemporada] = useState('');
  const [iniciandoNuevaTemporada, setIniciandoNuevaTemporada] = useState(false);
  const [resultadoNuevaTemporada, setResultadoNuevaTemporada] = useState('');
  const [temporadaActivaCierre, setTemporadaActivaCierre] = useState('');
  const [cargandoTemporadaActivaCierre, setCargandoTemporadaActivaCierre] =
    useState(false);
  const [errorTemporadaActivaCierre, setErrorTemporadaActivaCierre] =
    useState('');

  const [agendaSesionesDirectas, setAgendaSesionesDirectas] = useState<
    AgendaSesionDirectaApp[]
  >([]);
  const [agendaSesionActivaId, setAgendaSesionActivaId] = useState('');
  const [asignacionExcepcionalGrupoAgenda, setAsignacionExcepcionalGrupoAgenda] =
    useState<Record<string, boolean>>({});
  const [agendaFiltroAlumnos, setAgendaFiltroAlumnos] = useState<
    'TODOS' | 'NUEVO' | 'CONOCIDO'
  >('TODOS');
  const [mostrarAlumnoFueraPlazo, setMostrarAlumnoFueraPlazo] = useState(false);
  const [alumnoFueraPlazoNombre, setAlumnoFueraPlazoNombre] = useState('');
  const [alumnoFueraPlazoNivel, setAlumnoFueraPlazoNivel] = useState('');
  const [alumnoFueraPlazoAlumnoId, setAlumnoFueraPlazoAlumnoId] = useState('');
  const [incorporandoFueraPlazo, setIncorporandoFueraPlazo] = useState(false);
  const [mensajeIncorporacionFueraPlazo, setMensajeIncorporacionFueraPlazo] = useState('');
  const [errorIncorporacionFueraPlazo, setErrorIncorporacionFueraPlazo] = useState('');
  const [analizandoFueraPlazo, setAnalizandoFueraPlazo] = useState(false);
  const [recomendacionesFueraPlazo, setRecomendacionesFueraPlazo] = useState<
    RecomendacionFueraPlazoAgendaApp[]
  >([]);
  const [agendaFormularioAbierto, setAgendaFormularioAbierto] = useState(false);
  const [agendaDiaCompactoActivo, setAgendaDiaCompactoActivo] = useState('');
  const [gruposAgendaManuales, setGruposAgendaManuales] = useState<string[]>(
    []
  );
  const [agendaForm, setAgendaForm] = useState<AgendaFormState>(
    agendaFormInicial()
  );
  const [ultimoListadoAimHarder, setUltimoListadoAimHarder] =
    useState<UltimoListadoAimHarderApp | null>(null);
  const [agendaAlumnosSesion, setAgendaAlumnosSesion] = useState<
    AgendaAlumnoSesionApp[]
  >([]);

  const [agendaGruposSesion, setAgendaGruposSesion] = useState<
    AgendaGrupoSesionApp[]
  >([]);
  const [agendaGruposRecursosTurno, setAgendaGruposRecursosTurno] = useState<
    AgendaGrupoSesionApp[]
  >([]);
  const [
    disponibilidadSesionAgenda,
    setDisponibilidadSesionAgenda,
  ] = useState<any[]>([]);
  const [
    contextoRecursosSesionAgenda,
    setContextoRecursosSesionAgenda,
  ] = useState<{
    sesion_id: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
  } | null>(null);
  const [agendaRecomendaciones, setAgendaRecomendaciones] = useState<
    AgendaRecomendacionSesionApp[]
  >([]);
  const [
    alternativasTurnoAgendaPorAlumno,
    setAlternativasTurnoAgendaPorAlumno,
  ] = useState<Record<string, RecomendacionFueraPlazoAgendaApp[]>>({});
  const [
    buscandoAlternativasTurnoAgenda,
    setBuscandoAlternativasTurnoAgenda,
  ] = useState(false);
  const [fechaResumenDia, setFechaResumenDia] = useState(() =>
    leerStorageApp('mitico_fecha_resumen_dia', fechaIsoHoyApp())
  );
  const [busquedaAlumnoResumenDia, setBusquedaAlumnoResumenDia] = useState('');
  const [guardandoCamisetaAlumnoId, setGuardandoCamisetaAlumnoId] = useState('');
  const [turnoResumenDiaAbierto, setTurnoResumenDiaAbierto] = useState('');
  const [gruposOperativosResumenDia, setGruposOperativosResumenDia] = useState<
    Record<string, AgendaGrupoSesionApp[]>
  >({});
  const [grupoResumenDiaDestacado, setGrupoResumenDiaDestacado] = useState('');
  const [alumnoResumenDiaDestacado, setAlumnoResumenDiaDestacado] = useState('');
  const [ajustePistaSesionId, setAjustePistaSesionId] = useState('');
  const [ajustePistaModo, setAjustePistaModo] = useState<'mover' | 'anadir' | ''>('');
  const [movimientoPistaAlumno, setMovimientoPistaAlumno] = useState('');
  const [movimientoPistaDestino, setMovimientoPistaDestino] = useState('');
  const [busquedaPistaAlumno, setBusquedaPistaAlumno] = useState('');
  const [anadirPistaAlumnoId, setAnadirPistaAlumnoId] = useState('');
  const [anadirPistaDestino, setAnadirPistaDestino] = useState('');
  const [guardandoAjustePista, setGuardandoAjustePista] = useState(false);
  const [mensajeAjustePista, setMensajeAjustePista] = useState('');
  const [busquedaRevisionOcio, setBusquedaRevisionOcio] = useState('');
  const [filtroRevisionOcio, setFiltroRevisionOcio] = useState<
    'todos' | 'cambios' | 'sin_grupo' | 'sin_reportes'
  >('cambios');
  const [destinoRevisionOcio, setDestinoRevisionOcio] = useState<
    Record<string, string>
  >({});
  const [ultimaDescargaBackupSemana, setUltimaDescargaBackupSemana] =
    useState('');
  const [semanaBackupSeleccionada, setSemanaBackupSeleccionada] =
    useState('');
  const [backupRestauracion, setBackupRestauracion] = useState<any | null>(null);
  const [archivoBackupRestauracion, setArchivoBackupRestauracion] = useState('');
  const [errorBackupRestauracion, setErrorBackupRestauracion] = useState('');
  const [confirmacionBackupRestauracion, setConfirmacionBackupRestauracion] =
    useState('');
  const [restaurandoBackupSemanal, setRestaurandoBackupSemanal] = useState(false);
  const [resultadoRestauracionBackup, setResultadoRestauracionBackup] =
    useState('');
  const [destinoAlumnoAgendaGrupo, setDestinoAlumnoAgendaGrupo] = useState<
    Record<string, string>
  >({});
  const [entrenadoresAgendaGrupo, setEntrenadoresAgendaGrupo] = useState<
    Record<string, string>
  >({});
  const [entrenadoresApoyoAgendaGrupo, setEntrenadoresApoyoAgendaGrupo] =
    useState<Record<string, string>>({});
  const [responsablesReporteAgendaGrupo, setResponsablesReporteAgendaGrupo] =
    useState<Record<string, string>>({});
  const [trabajoAgendaGrupo, setTrabajoAgendaGrupo] = useState<
    Record<string, string>
  >({});
  const [observacionesAgendaGrupo, setObservacionesAgendaGrupo] = useState<
    Record<string, string>
  >({});
  const [trabajoGrupoCreadoEditando, setTrabajoGrupoCreadoEditando] = useState<
    Record<string, string>
  >({});
  const [
    observacionesGrupoCreadoEditando,
    setObservacionesGrupoCreadoEditando,
  ] = useState<Record<string, string>>({});

  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [whatsappPreview, setWhatsappPreview] =
    useState<WhatsappPreviewState | null>(null);

  const [altasNivelInicial, setAltasNivelInicial] = useState<AltaNivelInicialApp[]>([]);
  const [formAltaNivelInicial, setFormAltaNivelInicial] =
    useState<AltaNivelInicialFormApp>(altaNivelInicialFormVacioApp());
  const [mostrarFormularioAltaNivel, setMostrarFormularioAltaNivel] = useState(false);
  const [cargandoAltasNivel, setCargandoAltasNivel] = useState(false);
  const [guardandoAltaNivel, setGuardandoAltaNivel] = useState(false);
  const [nivelesValidacionAlta, setNivelesValidacionAlta] =
    useState<Record<string, string>>({});

  const [filtroAltasNivel, setFiltroAltasNivel] = useState<
    'TODOS' | 'PENDIENTE_ENVIO' | 'ENVIADO' | 'RESPONDIDO' | 'VALIDADO' | 'ANADIDO' | 'DESCARTADO'
  >('TODOS');
  const [filtroModalidadAltasNivel, setFiltroModalidadAltasNivel] = useState<
    'TODAS' | 'BABY' | 'OCIO' | 'INTENSIVOS'
  >('TODAS');
  const [altaNivelAbiertaId, setAltaNivelAbiertaId] = useState('');
  const [intensivosAltaNivel, setIntensivosAltaNivel] = useState<IntensivoApp[]>([]);
  const [intensivoAltaSeleccionado, setIntensivoAltaSeleccionado] =
    useState<Record<string, string>>({});
  const [anadiendoAltaNivelId, setAnadiendoAltaNivelId] = useState('');
  const [comprobandoCoincidenciasAltaId, setComprobandoCoincidenciasAltaId] =
    useState('');
  const [coincidenciasAltaNivel, setCoincidenciasAltaNivel] = useState<
    Record<string, CoincidenciaAltaNivelInicialApp[]>
  >({});
  const [resolucionCoincidenciaAlta, setResolucionCoincidenciaAlta] = useState<
    Record<string, string>
  >({});

  const [detalleRespuestaAlta, setDetalleRespuestaAlta] = useState('');

  const [textoImportarAltas, setTextoImportarAltas] = useState('');
  const [analizandoImportarAltas, setAnalizandoImportarAltas] = useState(false);
  const [altasImportadasPendientes, setAltasImportadasPendientes] = useState<
    AltaImportadaPegadoApp[]
  >([]);
  const [resumenImportacionAltas, setResumenImportacionAltas] =
    useState<ResumenImportacionAltasApp | null>(null);
  const [mensajeImportacionAltas, setMensajeImportacionAltas] = useState('');
  const [altaImportadaActivaClave, setAltaImportadaActivaClave] = useState('');
  const [altasImportadasLeidas, setAltasImportadasLeidas] = useState<
    AltaImportadaPegadoApp[]
  >([]);
  const [altasImportadasGestionadas, setAltasImportadasGestionadas] = useState<
    AltaImportadaGestionadaApp[]
  >([]);
  const [altasImportadasSinComprobar, setAltasImportadasSinComprobar] = useState<
    AltaImportadaPegadoApp[]
  >([]);
  const [altasImportadasInvalidas, setAltasImportadasInvalidas] = useState<
    AltaImportadaIncompletaApp[]
  >([]);
  const [detalleImportacionAltasActivo, setDetalleImportacionAltasActivo] =
    useState<DetalleImportacionAltasApp>('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const claveVersion = 'mitico_importador_altas_parser_version';
    const versionAnterior = window.sessionStorage.getItem(claveVersion);

    if (versionAnterior === VERSION_PARSER_ALTAS_IMPORT_APP) return;

    window.sessionStorage.setItem(
      claveVersion,
      VERSION_PARSER_ALTAS_IMPORT_APP
    );

    setAltasImportadasPendientes([]);
    setAltasImportadasLeidas([]);
    setAltasImportadasGestionadas([]);
    setAltasImportadasSinComprobar([]);
    setAltasImportadasInvalidas([]);
    setResumenImportacionAltas(null);
    setDetalleImportacionAltasActivo('');
    setAltaImportadaActivaClave('');

    if (textoImportarAltas.trim()) {
      setMensajeImportacionAltas(
        'Importador actualizado. Pulsa “Comprobar listado” para recalcular las filas.'
      );
    } else {
      setMensajeImportacionAltas('');
    }
  }, []);


  async function consultarSupabase<T>(
    tabla: string,
    query: string
  ): Promise<T[]> {
    return supabaseApiApp.query<T>(tabla, query);
  }

  async function ejecutarFuncion(nombreFuncion: string, body: object) {
    return supabaseApiApp.rpcVoid(nombreFuncion, body);
  }

  async function ejecutarFuncionConRespuesta<T>(
    nombreFuncion: string,
    body: object = {}
  ): Promise<T[]> {
    return supabaseApiApp.rpcRows<T>(nombreFuncion, body);
  }

  async function ejecutarFuncionAuthJson<T>(
    nombreFuncion: string,
    body: object
  ): Promise<T> {
    return supabaseApiApp.rpcJson<T>(nombreFuncion, body);
  }

  async function crearSesionOperativaDesdeListadoSeguroApp(input: {
    fecha: string;
    horaInicio: string;
    horaFin: string;
    modalidad: string;
    lugar: string;
    textoListado: string;
  }): Promise<
    Array<{
      sesion_id: string;
      total_detectados: number;
      total_nuevos: number;
      total_conocidos: number;
    }>
  > {
    const sesionesFecha = await consultarSupabase<AgendaSesionDirectaApp>(
      'v_agenda_sesiones_operativa_app',
      `select=*&fecha=eq.${encodeURIComponent(input.fecha)}&order=hora_inicio.asc`
    );
    const modalidad = normalizarModalidadAgenda(input.modalidad);
    const existente = sesionesFecha.find(
      (sesion) =>
        horaCorta(sesion.hora_inicio) === horaCorta(input.horaInicio) &&
        horaCorta(sesion.hora_fin) === horaCorta(input.horaFin) &&
        normalizarModalidadAgenda(
          sesion.modalidad_codigo || sesion.modalidad
        ) === modalidad
    );

    if (existente) {
      const roster = await consultarSupabase<AgendaAlumnoSesionApp>(
        'v_sesion_alumnos_operativa_app',
        `select=*&sesion_id=${encodeURIComponent(
          `eq.${existente.sesion_id}`
        )}&order=orden.asc`
      );
      const decision = decideSessionRosterImport(
        {
          sessionId: existente.sesion_id,
          groupCount: Number(existente.total_grupos || 0),
          publishedGroupCount: Number(existente.grupos_publicados || 0),
          studentsInGroups: Number(existente.alumnos_en_grupos || 0),
          currentRosterNames: roster.map((alumno) => alumno.alumno),
        },
        extractRosterNamesFromListText(input.textoListado)
      );

      if (decision.action === 'BLOCK') {
        const cambios = [
          decision.additions.length
            ? `altas: ${decision.additions.join(', ')}`
            : '',
          decision.removals.length
            ? `bajas: ${decision.removals.join(', ')}`
            : '',
        ]
          .filter(Boolean)
          .join(' · ');
        throw new Error(
          `${decision.reason}${cambios ? ` Cambios detectados: ${cambios}.` : ''}`
        );
      }

      if (decision.action === 'NO_CHANGE') {
        return [
          {
            sesion_id: existente.sesion_id,
            total_detectados: roster.length,
            total_nuevos: 0,
            total_conocidos: roster.length,
          },
        ];
      }
    }

    return ejecutarFuncionConRespuesta(
      'crear_sesion_operativa_desde_listado_app',
      {
        p_fecha: input.fecha,
        p_hora_inicio: input.horaInicio,
        p_hora_fin: input.horaFin,
        p_modalidad_codigo: input.modalidad,
        p_lugar: input.lugar,
        p_texto_listado: input.textoListado,
      }
    );
  }

  function numeroAnalisisAdminApp(valor: number | null | undefined, sufijo = '') {
    if (valor === null || valor === undefined || Number.isNaN(Number(valor))) return '—';
    const numero = Number(valor);
    const texto = Number.isInteger(numero)
      ? String(numero)
      : numero.toLocaleString('es-ES', { maximumFractionDigits: 2 });
    return `${texto}${sufijo}`;
  }

  function etiquetaMesAnalisisAdminApp(mes: string) {
    const [anio, numeroMes] = String(mes || '').split('-').map(Number);
    if (!anio || !numeroMes) return mes || '-';
    const fecha = new Date(anio, numeroMes - 1, 1);
    return fecha.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
  }

  function diferenciaAnalisisAdminApp(
    actual: number | null | undefined,
    anterior: number | null | undefined,
    sufijo = ''
  ) {
    if (actual === null || actual === undefined || anterior === null || anterior === undefined) {
      return 'Sin comparación';
    }

    const diferencia = Number(actual) - Number(anterior);
    if (!Number.isFinite(diferencia)) return 'Sin comparación';

    const redondeada = Math.round(diferencia * 10) / 10;
    const texto = Number.isInteger(redondeada)
      ? String(Math.abs(redondeada))
      : Math.abs(redondeada).toLocaleString('es-ES', { maximumFractionDigits: 1 });

    if (redondeada === 0) return `Sin cambio${sufijo ? ` ${sufijo}` : ''}`;
    return `${redondeada > 0 ? '+' : '−'}${texto}${sufijo}`;
  }

  async function cargarAnalisisAdminApp(
    modalidad: ModalidadAnalisisAdminApp = modalidadAnalisisAdmin,
    temporadaId: string = temporadaAnalisisAdminId
  ) {
    if (!esCoordinadorJefeApp) return;
    setCargandoAnalisisAdmin(true);
    setErrorAnalisisAdmin('');

    try {
      const filas = await ejecutarFuncionConRespuesta<AnalisisAdminRpcRowApp>(
        'obtener_analisis_admin_app',
        {
          p_temporada_id: temporadaId || null,
          p_modalidad_codigo: modalidad,
        }
      );

      const payload = filas?.[0]?.payload;
      if (!payload) throw new Error('El análisis no ha devuelto datos.');

      setAnalisisAdmin(payload);
      setModalidadAnalisisAdmin(modalidad);
      setTemporadaAnalisisAdminId(payload.meta.temporada_id);
    } catch (err: any) {
      setAnalisisAdmin(null);
      setErrorAnalisisAdmin(
        err?.message || 'No se pudo calcular el análisis de administración.'
      );
    } finally {
      setCargandoAnalisisAdmin(false);
    }
  }

  function cambiarModalidadAnalisisAdminApp(modalidad: ModalidadAnalisisAdminApp) {
    setModalidadAnalisisAdmin(modalidad);
    void cargarAnalisisAdminApp(modalidad, temporadaAnalisisAdminId);
  }

  function cambiarTemporadaAnalisisAdminApp(temporadaId: string) {
    setTemporadaAnalisisAdminId(temporadaId);
    void cargarAnalisisAdminApp(modalidadAnalisisAdmin, temporadaId);
  }

  function filasExportacionAnalisisAdminApp(payload: AnalisisAdminPayloadApp) {
    const filas: Array<Array<string | number | null>> = [];
    const r = payload.resumen;

    filas.push(['ANÁLISIS ADMINISTRACIÓN']);
    filas.push(['Modalidad', payload.meta.modalidad]);
    filas.push(['Temporada', payload.meta.temporada]);
    filas.push(['Generado', new Date(payload.meta.generado_at).toLocaleString('es-ES')]);
    filas.push([]);
    filas.push(['RESUMEN']);
    filas.push(['Alumnos únicos', r.alumnos_unicos]);
    filas.push(['Altas', r.altas]);
    filas.push(['Continuidad %', r.continuidad_pct]);
    filas.push(['Pérdida continuidad %', r.perdida_continuidad_pct]);
    filas.push(['Asistencia real %', r.asistencia_real_pct]);
    filas.push(['Promedio niños / turno', r.promedio_ninos_turno]);
    filas.push(['Promedio / grupo', r.promedio_por_grupo]);
    filas.push(['Sesiones realizadas', r.sesiones_realizadas]);
    filas.push(['Ocupación %', r.ocupacion_pct]);
    filas.push(['Evolución técnica', r.evolucion_tecnica]);
    filas.push(['Alumnos mejoran', r.alumnos_mejoran]);
    filas.push(['Alumnos estables', r.alumnos_estables]);
    filas.push(['Alumnos bajan', r.alumnos_bajan]);
    filas.push([]);
    filas.push([
      'MES', 'ALUMNOS', 'ALTAS', 'CRECIMIENTO %', 'CONTINUIDAD %',
      'PÉRDIDA %', 'ASISTENCIA %', 'NIÑOS/TURNO', 'POR GRUPO',
      'SESIONES', 'OCUPACIÓN %', 'EVOLUCIÓN TÉCNICA', 'MEJORAN', 'ESTABLES', 'BAJAN'
    ]);
    payload.mensual.forEach((m) => filas.push([
      m.mes, m.alumnos_unicos, m.altas, m.crecimiento_pct, m.continuidad_pct,
      m.perdida_continuidad_pct, m.asistencia_real_pct, m.promedio_ninos_turno,
      m.promedio_por_grupo, m.sesiones_realizadas, m.ocupacion_pct,
      m.evolucion_tecnica, m.mejoran, m.estables, m.bajan
    ]));
    filas.push([]);
    filas.push(['DISTRIBUCIÓN DE NIVELES']);
    filas.push(['Nivel', 'Total']);
    payload.niveles.forEach((n) => filas.push([n.nivel, n.total]));
    filas.push([]);
    filas.push(['PROGRESIÓN DE NIVELES']);
    filas.push(['Desde', 'Hasta', 'Sentido', 'Total']);
    payload.progresiones.forEach((p) => filas.push([p.desde, p.hasta, p.sentido, p.total]));
    filas.push([]);
    filas.push(['COMPARATIVA TEMPORADAS']);
    filas.push(['Temporada', 'Alumnos únicos', 'Sesiones', 'Asistencia %', 'Evolución técnica']);
    payload.comparativa_temporadas.forEach((t) => filas.push([
      t.temporada, t.alumnos_unicos, t.sesiones_realizadas,
      t.asistencia_real_pct, t.evolucion_tecnica
    ]));
    return filas;
  }

  function nombreArchivoAnalisisAdminApp(payload: AnalisisAdminPayloadApp, extension: string) {
    const temporada = payload.meta.temporada.replace(/[^0-9A-Za-z_-]+/g, '_');
    return `analisis_${payload.meta.modalidad.toLowerCase()}_${temporada}.${extension}`;
  }

  function descargarTextoAnalisisAdminApp(contenido: BlobPart, tipo: string, nombre: string) {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombre;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function descargarCsvAnalisisAdminApp() {
    if (!analisisAdmin) return;
    const escapar = (valor: unknown) => {
      const texto = valor === null || valor === undefined ? '' : String(valor);
      return `"${texto.replace(/"/g, '""')}"`;
    };
    const csv = filasExportacionAnalisisAdminApp(analisisAdmin)
      .map((fila) => fila.map(escapar).join(';'))
      .join('\r\n');
    descargarTextoAnalisisAdminApp(
      `\uFEFF${csv}`,
      'text/csv;charset=utf-8',
      nombreArchivoAnalisisAdminApp(analisisAdmin, 'csv')
    );
  }

  function descargarExcelAnalisisAdminApp() {
    if (!analisisAdmin) return;
    const escapar = (valor: unknown) => escaparHtml(
      valor === null || valor === undefined ? '' : String(valor)
    );
    const filas = filasExportacionAnalisisAdminApp(analisisAdmin);
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      body{font-family:Arial,sans-serif}table{border-collapse:collapse;width:100%}
      td{border:1px solid #ddd;padding:6px;vertical-align:top}
      tr:first-child td{font-weight:700;background:#eef2ff}
    </style></head><body><table>${filas
      .map((fila) => `<tr>${fila.map((celda) => `<td>${escapar(celda)}</td>`).join('')}</tr>`)
      .join('')}</table></body></html>`;
    descargarTextoAnalisisAdminApp(
      `\uFEFF${html}`,
      'application/vnd.ms-excel;charset=utf-8',
      nombreArchivoAnalisisAdminApp(analisisAdmin, 'xls')
    );
  }

  function normalizarTextoPdfAnalisisAdminApp(texto: string) {
    return texto
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^\x20-\x7E]/g, ' ')
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)');
  }

  function envolverLineaPdfAnalisisAdminApp(texto: string, maximo = 92) {
    const limpia = normalizarTextoPdfAnalisisAdminApp(texto);
    const palabras = limpia.split(/\s+/).filter(Boolean);
    const lineas: string[] = [];
    let actual = '';
    palabras.forEach((palabra) => {
      const candidato = actual ? `${actual} ${palabra}` : palabra;
      if (candidato.length > maximo && actual) {
        lineas.push(actual);
        actual = palabra;
      } else {
        actual = candidato;
      }
    });
    if (actual) lineas.push(actual);
    return lineas.length ? lineas : [''];
  }

  function descargarPdfAnalisisAdminApp() {
    if (!analisisAdmin) return;
    const p = analisisAdmin;
    const r = p.resumen;
    const lineas: string[] = [
      `MITICO BABY - ANALISIS ADMINISTRACION`,
      `${p.meta.modalidad} · Temporada ${p.meta.temporada}`,
      `Generado: ${new Date(p.meta.generado_at).toLocaleString('es-ES')}`,
      '',
      `RESUMEN`,
      `Alumnos unicos: ${r.alumnos_unicos} · Altas: ${r.altas}`,
      `Continuidad: ${numeroAnalisisAdminApp(r.continuidad_pct, '%')} · Perdida: ${numeroAnalisisAdminApp(r.perdida_continuidad_pct, '%')}`,
      `Asistencia real: ${numeroAnalisisAdminApp(r.asistencia_real_pct, '%')} · Ocupacion: ${numeroAnalisisAdminApp(r.ocupacion_pct, '%')}`,
      `Promedio ninos/turno: ${numeroAnalisisAdminApp(r.promedio_ninos_turno)} · Por grupo: ${numeroAnalisisAdminApp(r.promedio_por_grupo)}`,
      `Sesiones realizadas: ${r.sesiones_realizadas}`,
      `Evolucion tecnica: ${numeroAnalisisAdminApp(r.evolucion_tecnica)} · Mejoran ${r.alumnos_mejoran} · Estables ${r.alumnos_estables} · Bajan ${r.alumnos_bajan}`,
      '',
      `EVOLUCION MENSUAL`,
      ...p.mensual.map((m) =>
        `${m.mes} · alumnos ${m.alumnos_unicos} · altas ${m.altas} · crec ${numeroAnalisisAdminApp(m.crecimiento_pct, '%')} · cont ${numeroAnalisisAdminApp(m.continuidad_pct, '%')} · asist ${numeroAnalisisAdminApp(m.asistencia_real_pct, '%')} · ocup ${numeroAnalisisAdminApp(m.ocupacion_pct, '%')}`
      ),
      '',
      `NIVELES`,
      ...(p.niveles.length ? p.niveles.map((n) => `${n.nivel}: ${n.total}`) : ['Sin datos de nivel.']),
      '',
      `PROGRESION DE NIVELES`,
      ...(p.progresiones.length ? p.progresiones.map((x) => `${x.desde} -> ${x.hasta} · ${x.sentido} · ${x.total}`) : ['Sin progresiones registradas.']),
      '',
      `COMPARATIVA TEMPORADAS`,
      ...p.comparativa_temporadas.map((t) =>
        `${t.temporada} · alumnos ${t.alumnos_unicos} · sesiones ${t.sesiones_realizadas} · asistencia ${numeroAnalisisAdminApp(t.asistencia_real_pct, '%')} · evolucion ${numeroAnalisisAdminApp(t.evolucion_tecnica)}`
      ),
    ].flatMap((linea) => envolverLineaPdfAnalisisAdminApp(linea));

    const porPagina = 48;
    const paginas: string[][] = [];
    for (let i = 0; i < lineas.length; i += porPagina) paginas.push(lineas.slice(i, i + porPagina));
    if (!paginas.length) paginas.push(['Sin datos.']);

    const objetos: string[] = [];
    const paginaIds = paginas.map((_, i) => 4 + i * 2);
    objetos[1] = `<< /Type /Catalog /Pages 2 0 R >>`;
    objetos[2] = `<< /Type /Pages /Kids [${paginaIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${paginas.length} >>`;
    objetos[3] = `<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>`;

    paginas.forEach((pagina, i) => {
      const pageId = 4 + i * 2;
      const contentId = pageId + 1;
      const contenido = `BT /F1 9 Tf 40 805 Td 14 TL\n${pagina
        .map((linea) => `(${normalizarTextoPdfAnalisisAdminApp(linea)}) Tj T*`)
        .join('\n')}\nET`;
      objetos[pageId] = `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R >> >> /Contents ${contentId} 0 R >>`;
      objetos[contentId] = `<< /Length ${contenido.length} >>\nstream\n${contenido}\nendstream`;
    });

    let pdf = '%PDF-1.4\n';
    const offsets: number[] = [0];
    for (let id = 1; id < objetos.length; id += 1) {
      offsets[id] = pdf.length;
      pdf += `${id} 0 obj\n${objetos[id]}\nendobj\n`;
    }
    const inicioXref = pdf.length;
    pdf += `xref\n0 ${objetos.length}\n0000000000 65535 f \n`;
    for (let id = 1; id < objetos.length; id += 1) {
      pdf += `${String(offsets[id]).padStart(10, '0')} 00000 n \n`;
    }
    pdf += `trailer\n<< /Size ${objetos.length} /Root 1 0 R >>\nstartxref\n${inicioXref}\n%%EOF`;

    descargarTextoAnalisisAdminApp(
      pdf,
      'application/pdf',
      nombreArchivoAnalisisAdminApp(analisisAdmin, 'pdf')
    );
  }

  function detallePreguntaTestNivelApp(
    clave: string,
    respuesta: string | null
  ) {
    const preguntas: Record<
      string,
      { pregunta: string; opciones: Record<string, string> }
    > = {
      Experiencia: {
        pregunta: '¿Cuántos días aproximadamente ha esquiado?',
        opciones: {
          A: 'Nunca / será su primer día',
          B: '1–3 días',
          C: '4–10 días',
          D: 'Más de 10 días',
        },
      },
      Desplazamiento: {
        pregunta: '¿Se desplaza solo con los esquís puestos?',
        opciones: {
          A: 'No, necesita ayuda',
          B: 'Algo, pero necesita ayuda con frecuencia',
          C: 'Sí, se desplaza solo',
        },
      },
      Frenado: {
        pregunta: '¿Puede frenar haciendo cuña?',
        opciones: {
          A: 'No',
          B: 'A veces / necesita indicaciones',
          C: 'Sí, frena con autonomía',
        },
      },
      Giros: {
        pregunta: '¿Cómo hace los giros para cambiar de dirección?',
        opciones: {
          A: 'Todavía no hace giros',
          B: 'Está empezando a girar',
          C: 'Hace giros en cuña de forma autónoma',
          D: 'Hace algunos giros con los esquís en paralelo',
          E: 'Hace giros paralelos fluidos y enlazados',
        },
      },
      Remonte: {
        pregunta: '¿Qué remontes utiliza sin ayuda?',
        opciones: {
          A: 'Ninguno',
          B: 'Cinta transportadora',
          C: 'Percha / telesquí',
          D: 'Silla',
          E: 'Todos: cinta, percha y silla',
        },
      },
      Pista: {
        pregunta: '¿Por dónde baja con seguridad sin que un adulto tenga que sujetarlo?',
        opciones: {
          A: 'Todavía no baja una pista con autonomía',
          B: 'Pista pequeña',
          C: 'Pista grande',
        },
      },
      Control: {
        pregunta: 'En pista, ¿cómo controla la velocidad y la dirección?',
        opciones: {
          '0': 'Todavía no sabe frenar ni controlar la velocidad',
          A: 'Necesita ayuda o recordatorios constantes para frenar',
          B: 'Controla principalmente haciendo cuña',
          C: 'Controla enlazando giros y elige por dónde bajar',
          D: 'Controla con paralelo y adapta el giro y la trayectoria',
        },
      },
      Técnica: {
        pregunta: 'Si el profesor le propone ejercicios mientras baja, ¿qué es capaz de hacer?',
        opciones: {
          A: 'No lo sabemos / todavía no sigue ejercicios esquiando',
          B: 'Sigue ejercicios sencillos mientras baja',
          C: 'Puede hacer giros más cortos o más largos cuando se lo piden',
          D: 'Cambia ritmo y trazado con facilidad y resuelve ejercicios técnicos',
        },
      },
    };

    const dato = preguntas[clave];
    return {
      pregunta: dato?.pregunta || clave,
      respuestaTexto:
        (respuesta && dato?.opciones?.[respuesta]) || respuesta || 'Sin respuesta',
    };
  }


  function coincideEstadoAltaNivelApp(
    alta: AltaNivelInicialApp,
    filtro: typeof filtroAltasNivel = filtroAltasNivel
  ) {
    if (filtro === 'TODOS') return true;
    if (filtro === 'RESPONDIDO') {
      return alta.estado === 'RESPONDIDO' || alta.estado === 'VALIDADO';
    }
    return alta.estado === filtro;
  }

  function coincideModalidadAltaNivelApp(
    alta: AltaNivelInicialApp,
    modalidad: typeof filtroModalidadAltasNivel = filtroModalidadAltasNivel
  ) {
    return modalidad === 'TODAS' || alta.modalidad === modalidad;
  }

  function altaVisibleNivelInicialApp(alta: AltaNivelInicialApp) {
    return (
      coincideEstadoAltaNivelApp(alta) &&
      coincideModalidadAltaNivelApp(alta)
    );
  }

  function totalEstadoAltasNivelApp(filtro: typeof filtroAltasNivel) {
    return altasNivelInicial.filter(
      (alta) =>
        coincideEstadoAltaNivelApp(alta, filtro) &&
        coincideModalidadAltaNivelApp(alta)
    ).length;
  }

  function totalModalidadAltasNivelApp(
    modalidad: typeof filtroModalidadAltasNivel
  ) {
    return altasNivelInicial.filter(
      (alta) =>
        coincideEstadoAltaNivelApp(alta) &&
        coincideModalidadAltaNivelApp(alta, modalidad)
    ).length;
  }

  async function cargarIntensivosAltaNivel() {
    if (!puedeVerAdministracionAltasApp(perfilUsuario?.rol)) return;
    try {
      const datos = await consultarSupabase<IntensivoApp>(
        'v_intensivos_app',
        'select=*&order=fecha_inicio.desc,intensivo.asc'
      );
      setIntensivosAltaNivel(
        (Array.isArray(datos) ? datos : []).filter(
          (item) =>
            String(item.estado || '').toLowerCase() !== 'cerrado' &&
            (!temporadaActivaCierre || item.temporada === temporadaActivaCierre)
        )
      );
    } catch (err: any) {
      setError(
        err?.message ||
          'No se pudieron cargar los Intensivos disponibles para las altas.'
      );
    }
  }

  async function anadirAltaNivelAListados(alta: AltaNivelInicialApp) {
    if (!esCoordinadorJefeApp || alta.estado !== 'VALIDADO') return;

    const intensivoId =
      alta.modalidad === 'INTENSIVOS'
        ? intensivoAltaSeleccionado[alta.id] || ''
        : '';

    if (alta.modalidad === 'INTENSIVOS' && !intensivoId) {
      setError('Selecciona el Intensivo al que quieres añadir al alumno.');
      return;
    }

    let coincidencias = coincidenciasAltaNivel[alta.id];

    if (!coincidencias) {
      setComprobandoCoincidenciasAltaId(alta.id);
      setError('');

      try {
        coincidencias =
          (await ejecutarFuncionAuthJson<CoincidenciaAltaNivelInicialApp[]>(
            'obtener_coincidencias_alta_nivel_inicial_app',
            { p_id: alta.id }
          )) || [];

        setCoincidenciasAltaNivel((actual) => ({
          ...actual,
          [alta.id]: coincidencias || [],
        }));
      } catch (err: any) {
        setError(
          err?.message ||
            'No se pudo comprobar si el alumno ya existe en la ficha maestra.'
        );
        return;
      } finally {
        setComprobandoCoincidenciasAltaId('');
      }
    }

    const coincidenciaExacta = (coincidencias || []).find(
      (item) => item.tipo_coincidencia === 'EXACTA'
    );
    const candidatasMismaFecha = (coincidencias || []).filter(
      (item) => item.tipo_coincidencia === 'MISMA_FECHA'
    );

    let alumnoExistenteId: string | null = coincidenciaExacta?.alumno_id || null;
    let confirmarNuevo = false;

    if (!coincidenciaExacta && candidatasMismaFecha.length > 0) {
      const resolucion = resolucionCoincidenciaAlta[alta.id] || '';

      if (!resolucion) {
        setError(
          `Hay ${candidatasMismaFecha.length} posible(s) ficha(s) compatibles por nombre y fecha de nacimiento. Elige si corresponde a una ficha existente o si es otro alumno.`
        );
        return;
      }

      if (resolucion === '__NUEVO__') {
        confirmarNuevo = true;
      } else {
        const candidataElegida = candidatasMismaFecha.find(
          (item) => item.alumno_id === resolucion
        );

        if (!candidataElegida) {
          setError('La ficha seleccionada ya no está disponible.');
          return;
        }

        alumnoExistenteId = candidataElegida.alumno_id;
      }
    }

    const intensivoElegido =
      alta.modalidad === 'INTENSIVOS'
        ? intensivosAltaNivel.find((item) => item.intensivo_id === intensivoId)
        : null;

    const destino =
      alta.modalidad === 'INTENSIVOS'
        ? `Intensivos · ${intensivoElegido?.intensivo || 'seleccionado'}`
        : alta.modalidad === 'OCIO'
        ? 'Ocio'
        : 'Baby';

    const identidadTexto = coincidenciaExacta
      ? `\n\nSe reutilizará la ficha existente: ${coincidenciaExacta.alumno}.`
      : alumnoExistenteId
      ? `\n\nSe reutilizará la ficha existente seleccionada.`
      : confirmarNuevo
      ? `\n\nHas confirmado que es otro alumno: se creará una ficha nueva.`
      : '';

    if (
      !window.confirm(
        `¿Añadir a ${alta.nombre_completo} a ${destino} con nivel ${
          alta.nivel_validado || '-'
        }?${identidadTexto}`
      )
    ) {
      return;
    }

    setAnadiendoAltaNivelId(alta.id);
    setError('');

    try {
      await ejecutarFuncionAuthJson<string>(
        'anadir_alta_nivel_inicial_resuelta_app',
        {
          p_id: alta.id,
          p_intensivo_id: intensivoId || null,
          p_alumno_existente_id: alumnoExistenteId,
          p_confirmar_nuevo: confirmarNuevo,
        }
      );

      setAltaNivelAbiertaId('');
      setIntensivoAltaSeleccionado((actual) => {
        const siguiente = { ...actual };
        delete siguiente[alta.id];
        return siguiente;
      });
      setCoincidenciasAltaNivel((actual) => {
        const siguiente = { ...actual };
        delete siguiente[alta.id];
        return siguiente;
      });
      setResolucionCoincidenciaAlta((actual) => {
        const siguiente = { ...actual };
        delete siguiente[alta.id];
        return siguiente;
      });

      await Promise.all([cargarAltasNivelInicial(), cargarAlumnos()]);
    } catch (err: any) {
      setError(err?.message || 'No se pudo añadir el alumno a los listados.');
    } finally {
      setAnadiendoAltaNivelId('');
    }
  }

  async function eliminarAltaNivelInicial(alta: AltaNivelInicialApp) {
    if (alta.estado === 'ANADIDO') return;

    const puedeEliminar =
      alta.estado === 'PENDIENTE_ENVIO' ||
      alta.estado === 'ENVIADO' ||
      alta.estado === 'RESPONDIDO' ||
      (esCoordinadorJefeApp &&
        (alta.estado === 'VALIDADO' || alta.estado === 'DESCARTADO'));

    if (!puedeEliminar) return;

    const mensaje =
      `¿Eliminar definitivamente el alta de ${alta.nombre_completo}?\n\n` +
      `Se borrarán el test, teléfono, respuestas y enlace público.\n` +
      `Esta acción no se puede deshacer.`;

    if (!window.confirm(mensaje)) return;

    setError('');

    try {
      await ejecutarFuncion('eliminar_alta_nivel_inicial_app', {
        p_id: alta.id,
      });

      if (altaNivelAbiertaId === alta.id) {
        setAltaNivelAbiertaId('');
      }

      await cargarAltasNivelInicial();
    } catch (err: any) {
      setError(err?.message || 'No se pudo eliminar el alta.');
    }
  }

  async function borrarRegistroTemporalAnadido(
    alta: AltaNivelInicialApp
  ) {
    if (alta.estado !== 'ANADIDO') return;

    const confirmar = window.confirm(
      `¿Borrar el registro temporal de ${alta.nombre_completo}?\n\n` +
        `La ficha del alumno y los datos ya incorporados a ${alta.modalidad} ` +
        `no se eliminarán. Solo desaparecerá este registro de Administración/Test.`
    );

    if (!confirmar) return;

    setError('');

    try {
      await ejecutarFuncion('eliminar_registro_temporal_alta_nivel_app', {
        p_id: alta.id,
      });

      if (altaNivelAbiertaId === alta.id) {
        setAltaNivelAbiertaId('');
      }

      await cargarAltasNivelInicial();
    } catch (err: any) {
      setError(
        err?.message || 'No se pudo borrar el registro temporal.'
      );
    }
  }

  async function cargarAltasNivelInicial() {
    if (!puedeVerAdministracionAltasApp(perfilUsuario?.rol)) return;
    setCargandoAltasNivel(true);
    setError('');
    try {
      const datos = await ejecutarFuncionConRespuesta<AltaNivelInicialApp>(
        'obtener_altas_nivel_inicial_app',
        {}
      );
      setAltasNivelInicial(Array.isArray(datos) ? datos : []);
    } catch (err: any) {
      setError(err?.message || 'No se pudieron cargar las altas de Administración.');
    } finally {
      setCargandoAltasNivel(false);
    }
  }


  async function pegarListadoAltasDesdePortapapelesApp() {
    setMensajeImportacionAltas('');
    try {
      const texto = await navigator.clipboard.readText();
      if (!texto.trim()) {
        setMensajeImportacionAltas(
          'El portapapeles está vacío. También puedes pegar directamente con ⌘V / Ctrl+V.'
        );
        return;
      }
      setTextoImportarAltas(texto);
      setAltasImportadasPendientes([]);
      setResumenImportacionAltas(null);
      setMensajeImportacionAltas(
        'Listado pegado. Pulsa “Comprobar listado”.'
      );
    } catch {
      setMensajeImportacionAltas(
        'El navegador no ha permitido leer el portapapeles. Pega directamente en el cuadro con ⌘V / Ctrl+V.'
      );
    }
  }

  async function analizarListadoAltasPegadoApp() {
    const parseado = parsearListadoAltasPegadoApp(textoImportarAltas);

    setAltasImportadasPendientes([]);
    setAltasImportadasLeidas(parseado.filas);
    setAltasImportadasGestionadas([]);
    setAltasImportadasSinComprobar([]);
    setAltasImportadasInvalidas(parseado.filasInvalidas);
    setDetalleImportacionAltasActivo('');
    setResumenImportacionAltas(null);
    setMensajeImportacionAltas('');

    if (parseado.filas.length === 0) {
      setResumenImportacionAltas({
        totalLeidas: 0,
        pendientes: 0,
        yaExistian: 0,
        invalidas: parseado.invalidas,
        sinComprobar: 0,
      });
      setDetalleImportacionAltasActivo(
        parseado.invalidas > 0 ? 'INVALIDAS' : ''
      );
      setMensajeImportacionAltas(
        'No he encontrado filas completas. Pulsa “Filas incompletas” para ver qué falta.'
      );
      return;
    }

    setAnalizandoImportarAltas(true);
    setError('');

    try {
      const altasActuales =
        (await ejecutarFuncionConRespuesta<AltaNivelInicialApp>(
          'obtener_altas_nivel_inicial_app',
          {}
        )) || [];

      setAltasNivelInicial(
        Array.isArray(altasActuales) ? altasActuales : []
      );

      const gestionadas: AltaImportadaGestionadaApp[] = [];
      const pendientesPreliminares = parseado.filas.filter((fila) => {
        const altaExistente = altasActuales.find((alta) =>
          coincideAltaImportadaConAltaExistenteApp(fila, alta)
        );

        if (!altaExistente) return true;

        gestionadas.push({
          fila,
          detalle: `Alta/Test ya existente · ${altaExistente.estado}`,
        });
        return false;
      });

      let sinComprobar = 0;
      const sinComprobarFilas: AltaImportadaPegadoApp[] = [];
      const pendientesConfirmadas: AltaImportadaPegadoApp[] = [];

      // Reutilizamos exactamente la comprobación oficial que ya usa
      // “Nueva solicitud”. Se hace por bloques para no lanzar decenas de
      // peticiones simultáneas cuando se pega un Excel grande.
      for (let inicio = 0; inicio < pendientesPreliminares.length; inicio += 6) {
        const bloque = pendientesPreliminares.slice(inicio, inicio + 6);
        const comprobaciones = await Promise.all(
          bloque.map(async (fila) => {
            try {
              const posibles =
                (await ejecutarFuncionAuthJson<AvisoNuevaAltaAlumnoApp[]>(
                  'comprobar_posibles_alumnos_nueva_alta_app',
                  {
                    p_nombre_completo: fila.nombre,
                    p_fecha_nacimiento: fila.fechaNacimiento,
                  }
                )) || [];

              const coincidencia = posibles.find(
                (item) =>
                  item.motivo === 'NOMBRE_EXACTO' ||
                  item.motivo === 'NOMBRE_COMPATIBLE'
              );

              return { fila, coincidencia, comprobada: true };
            } catch {
              return { fila, coincidencia: undefined, comprobada: false };
            }
          })
        );

        comprobaciones.forEach(({ fila, coincidencia, comprobada }) => {
          if (!comprobada) {
            sinComprobar += 1;
            sinComprobarFilas.push(fila);
            return;
          }

          if (coincidencia) {
            const fuente =
              coincidencia.fuente === 'FICHA_MAESTRA'
                ? 'Ficha existente'
                : `Alta/Test ${coincidencia.estado || 'existente'}`;

            gestionadas.push({
              fila,
              detalle: `${fuente} · coincide con ${coincidencia.alumno}`,
            });
            return;
          }

          pendientesConfirmadas.push(fila);
        });
      }

      setAltasImportadasPendientes(pendientesConfirmadas);
      setAltasImportadasGestionadas(gestionadas);
      setAltasImportadasSinComprobar(sinComprobarFilas);
      setResumenImportacionAltas({
        totalLeidas: parseado.filas.length,
        pendientes: pendientesConfirmadas.length,
        yaExistian: gestionadas.length,
        invalidas: parseado.invalidas,
        sinComprobar,
      });

      setDetalleImportacionAltasActivo(
        pendientesConfirmadas.length > 0
          ? 'NUEVAS'
          : gestionadas.length > 0
          ? 'GESTIONADAS'
          : parseado.invalidas > 0
          ? 'INVALIDAS'
          : sinComprobar > 0
          ? 'SIN_COMPROBAR'
          : 'LEIDAS'
      );

      if (pendientesConfirmadas.length === 0 && sinComprobar === 0) {
        setMensajeImportacionAltas(
          'Todo el listado ya está gestionado en la app o en Alta/Test. No hay nadie nuevo que preparar.'
        );
      } else if (sinComprobar > 0) {
        setMensajeImportacionAltas(
          `Hay ${sinComprobar} fila(s) que no se han podido verificar. Pulsa “Sin comprobar” para ver cuáles son.`
        );
      } else {
        setMensajeImportacionAltas(
          `${pendientesConfirmadas.length} alumno(s) nuevo(s) pendientes de preparar Alta/Test. Puedes pulsar los contadores para revisar cada grupo.`
        );
      }
    } catch (err: any) {
      setAltasImportadasPendientes([]);
      setAltasImportadasGestionadas([]);
      setAltasImportadasSinComprobar([]);
      setResumenImportacionAltas(null);
      setMensajeImportacionAltas('');
      setError(
        err?.message ||
          'No se ha podido comprobar el listado de nuevas altas.'
      );
    } finally {
      setAnalizandoImportarAltas(false);
    }
  }

  function abrirAltaTestDesdeImportacionApp(fila: AltaImportadaPegadoApp) {
    setFormAltaNivelInicial({
      nombre: fila.nombre,
      fechaNacimiento: fila.fechaNacimiento,
      modalidad: fila.modalidad,
      telefono: fila.telefono,
      ocioDiaFijo: fila.modalidad === 'OCIO' ? fila.ocioDiaFijo : '',
    });
    setAltaImportadaActivaClave(fila.clave);
    setMostrarFormularioAltaNivel(true);
    setError('');

    window.setTimeout(() => {
      enfocarElementoApp('form-alta-nivel-inicial', {
        block: 'start',
        abrirDetallesPadre: true,
      });
    }, 40);
  }

  function limpiarImportadorAltasApp() {
    setTextoImportarAltas('');
    setAltasImportadasPendientes([]);
    setAltasImportadasLeidas([]);
    setAltasImportadasGestionadas([]);
    setAltasImportadasSinComprobar([]);
    setAltasImportadasInvalidas([]);
    setDetalleImportacionAltasActivo('');
    setResumenImportacionAltas(null);
    setMensajeImportacionAltas('');
    setAltaImportadaActivaClave('');
  }

  function enlacePublicoAltaNivel(alta: AltaNivelInicialApp) {
    if (typeof window === 'undefined') return '';
    return `${window.location.origin}${window.location.pathname}?test_nivel=${alta.token_publico}`;
  }

  async function crearAltaNivelInicial() {
    const nombre = formAltaNivelInicial.nombre.trim();
    const telefono = formAltaNivelInicial.telefono.trim();
    const fechaNacimiento = formAltaNivelInicial.fechaNacimiento;

    if (!nombre || !fechaNacimiento || !telefono) {
      setError('Completa nombre, fecha de nacimiento, modalidad y teléfono.');
      return;
    }

    if (
      formAltaNivelInicial.modalidad === 'OCIO' &&
      !formAltaNivelInicial.ocioDiaFijo
    ) {
      setError('Selecciona el día fijo de Ocio.');
      return;
    }

    setGuardandoAltaNivel(true);
    setError('');

    try {
      const posibles =
        (await ejecutarFuncionAuthJson<AvisoNuevaAltaAlumnoApp[]>(
          'comprobar_posibles_alumnos_nueva_alta_app',
          {
            p_nombre_completo: nombre,
            p_fecha_nacimiento: fechaNacimiento,
          }
        )) || [];

      if (posibles.length > 0) {
        const lineas = posibles
          .slice(0, 8)
          .map((item) => {
            const motivo =
              item.motivo === 'MISMA_FECHA'
                ? 'misma fecha de nacimiento'
                : item.motivo === 'NOMBRE_EXACTO'
                ? 'mismo nombre'
                : 'nombre compatible';

            const fuente =
              item.fuente === 'FICHA_MAESTRA'
                ? 'ficha existente'
                : `test/alta ${item.estado || ''}`.trim();

            return `• ${item.alumno} · ${
              item.fecha_nacimiento
                ? formatearFecha(item.fecha_nacimiento)
                : 'sin fecha'
            } · ${fuente} · ${motivo}`;
          })
          .join('\n');

        const continuar = window.confirm(
          `⚠️ Posible alumno ya existente\n\n${lineas}\n\n` +
            `Revisa antes de crear otro test. Si realmente es otro niño, ` +
            `puedes continuar igualmente.\n\n¿Crear este test de todas formas?`
        );

        if (!continuar) return;
      }

      await ejecutarFuncionAuthJson<string>('crear_alta_nivel_inicial_app', {
        p_nombre_completo: nombre,
        p_fecha_nacimiento: fechaNacimiento,
        p_modalidad: formAltaNivelInicial.modalidad,
        p_telefono: telefono,
        p_ocio_dia_fijo:
          formAltaNivelInicial.modalidad === 'OCIO'
            ? formAltaNivelInicial.ocioDiaFijo
            : null,
      });

      const modalidadCreada = formAltaNivelInicial.modalidad;
      const veniaDeImportacion = Boolean(altaImportadaActivaClave);

      if (altaImportadaActivaClave) {
        const filaCreada = altasImportadasPendientes.find(
          (fila) => fila.clave === altaImportadaActivaClave
        );

        setAltasImportadasPendientes((actual) =>
          actual.filter((fila) => fila.clave !== altaImportadaActivaClave)
        );

        if (filaCreada) {
          setAltasImportadasGestionadas((actual) => [
            ...actual,
            {
              fila: filaCreada,
              detalle: 'Alta/Test creado ahora · PENDIENTE_ENVIO',
            },
          ]);
        }

        setResumenImportacionAltas((actual) =>
          actual
            ? {
                ...actual,
                pendientes: Math.max(0, actual.pendientes - 1),
                yaExistian: actual.yaExistian + 1,
              }
            : actual
        );
        setMensajeImportacionAltas(
          `Alta/Test creado para ${nombre}. Ya no aparece como pendiente en el listado pegado.`
        );
        setAltaImportadaActivaClave('');
      }

      setFormAltaNivelInicial(altaNivelInicialFormVacioApp());
      setMostrarFormularioAltaNivel(false);

      if (veniaDeImportacion) {
        setFiltroAltasNivel('PENDIENTE_ENVIO');
        setFiltroModalidadAltasNivel(modalidadCreada);
      }

      await cargarAltasNivelInicial();
    } catch (err: any) {
      setError(err?.message || 'No se pudo crear el test de nivel.');
    } finally {
      setGuardandoAltaNivel(false);
    }
  }

  async function copiarEnlaceAltaNivel(alta: AltaNivelInicialApp) {
    const enlace = enlacePublicoAltaNivel(alta);
    try {
      await navigator.clipboard.writeText(enlace);
      alert('Enlace del test copiado.');
    } catch {
      window.prompt('Copia este enlace:', enlace);
    }
  }

  async function enviarAltaNivelWhatsapp(alta: AltaNivelInicialApp) {
    const telefono = normalizarTelefonoWhatsappApp(alta.telefono);
    if (!telefono) {
      setError('El teléfono de esta alta no es válido para WhatsApp.');
      return;
    }

    const enlace = enlacePublicoAltaNivel(alta);
    const nombrePila = alta.nombre_completo.trim().split(/\\s+/)[0] || alta.nombre_completo;
    const texto =
      `Hola familia, para preparar correctamente el grupo de ${nombrePila} necesitamos una pequeña valoración de su experiencia esquiando.\n\n` +
      `No tenéis que conocer su nivel: son 8 preguntas de respuesta cerrada sobre lo que le habéis visto hacer y se tarda aproximadamente 2 minutos.\n\n` +
      `${enlace}\n\nMuchas gracias.`;

    try {
      await ejecutarFuncion('marcar_alta_nivel_enviada_app', { p_id: alta.id });
      await cargarAltasNivelInicial();
      window.open(`https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`, '_blank');
    } catch (err: any) {
      setError(err?.message || 'No se pudo preparar el envío por WhatsApp.');
    }
  }

  async function validarAltaNivelInicial(alta: AltaNivelInicialApp) {
    if (!esCoordinadorJefeApp) return;
    const nivelValidado = parseTechnicalLevel(
      nivelesValidacionAlta[alta.id] || alta.nivel_propuesto
    );
    if (nivelValidado.status !== 'VALID') {
      setError(
        'Selecciona un nivel técnico válido antes de validar el alta. No se asignará INICIACIÓN automáticamente.'
      );
      return;
    }
    const nivel = nivelValidado.level;
    if (!window.confirm(`¿Validar a ${alta.nombre_completo} con nivel ${nivel}?`)) return;

    setError('');
    try {
      await ejecutarFuncion('validar_alta_nivel_inicial_app', {
        p_id: alta.id,
        p_nivel_codigo: nivel,
      });
      await cargarAltasNivelInicial();
    } catch (err: any) {
      setError(err?.message || 'No se pudo validar el nivel.');
    }
  }

  async function descartarAltaNivelInicial(alta: AltaNivelInicialApp) {
    if (!esCoordinadorJefeApp) return;
    if (!window.confirm(`¿Descartar la solicitud de ${alta.nombre_completo}?`)) return;

    setError('');
    try {
      await ejecutarFuncion('descartar_alta_nivel_inicial_app', { p_id: alta.id });
      await cargarAltasNivelInicial();
    } catch (err: any) {
      setError(err?.message || 'No se pudo descartar la solicitud.');
    }
  }

  async function cargarInicio() {
    setCargando(true);
    setError('');
    setDetalle(null);

    try {
      const [
        avisosData,
        reportesData,
        planningData,
        gruposEntrenadorData,
        sesionesData,
        entrenadoresData,
      ] = await Promise.all([
        consultarSupabase<AvisoJose>(
          'v_inicio_avisos_jose',
          'select=*&order=orden.asc'
        ),
        consultarSupabase<ReportePendiente>(
          'v_reportes_pendientes_entrenador_dos_entrenadores',
          'select=*'
        ),
        consultarSupabase<GrupoPlanning>(
          'v_planning_app',
          'select=grupo_id,fecha,publicado'
        ),
        consultarSupabase<GrupoEntrenadorApp>(
          'v_grupos_entrenador_app_dos_entrenadores',
          'select=grupo_id,entrenador_id,fecha,estado_confirmacion,publicado'
        ),
        consultarSupabase<AgendaSesionDirectaApp>(
          'v_agenda_sesiones_operativa_app',
          'select=*&order=fecha.asc,hora_inicio.asc'
        ),
        consultarSupabase<EntrenadorResumen>(
          'v_panel_entrenadores',
          'select=*&order=nombre_completo.asc'
        ),
      ]);

      // Estas dos colecciones alimentan directamente las métricas de Inicio.
      // Antes solo se cargaban al visitar otras pantallas.
      setAgendaSesionesDirectas(sesionesData);
      setEntrenadores(entrenadoresData);

      const finSemanaInicioResumen = semanaAgendaActiva
        ? claveFechaAgenda(
            new Date(
              crearFechaAgenda(semanaAgendaActiva).getTime() +
                6 * 24 * 60 * 60 * 1000
            )
          )
        : '';

      setAvisos(avisosData);
      setResumenInicio(
        summarizeOperationalDashboard(
          reportesData,
          planningData,
          gruposEntrenadorData,
          semanaAgendaActiva
            ? { start: semanaAgendaActiva, end: finSemanaInicioResumen }
            : undefined
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setAvisos([]);
      setResumenInicio({
        reportesPendientes: 0,
        asistenciasSinConfirmar: 0,
        gruposSinPublicar: 0,
        entrenadoresSinConfirmar: 0,
      });
    }

    setCargando(false);
  }

  async function actualizarTodo() {
    setCargando(true);
    setError('');
    setDetalle(null);

    try {
      const [
        avisosData,
        reportesData,
        planningData,
        gruposEntrenadorData,
        alumnosEstadoData,
      ] = await Promise.all([
        consultarSupabase<AvisoJose>(
          'v_inicio_avisos_jose',
          'select=*&order=orden.asc'
        ),
        consultarSupabase<ReportePendiente>(
          'v_reportes_pendientes_entrenador_dos_entrenadores',
          'select=*&order=fecha.asc,hora_inicio.asc,entrenador.asc,nombre_grupo.asc,alumno.asc'
        ),
        consultarSupabase<GrupoPlanning>(
          'v_planning_app',
          'select=*&order=fecha.asc,hora_inicio.asc,nombre_grupo.asc'
        ),
        consultarSupabase<GrupoEntrenadorApp>(
          'v_grupos_entrenador_app_dos_entrenadores',
          'select=*&order=fecha.asc,hora_inicio.asc,entrenador.asc,nombre_grupo.asc'
        ),
        consultarSupabase<AlumnoReporteEntrenador>(
          'v_alumnos_reporte_entrenador_app_dos_entrenadores',
          'select=*&order=fecha.asc,hora_inicio.asc,entrenador.asc,nombre_grupo.asc,alumno.asc'
        ),
      ]);

      setAvisos(avisosData);
      setReportesPendientes(reportesData);
      setPlanning(planningData);
      setGruposEntrenador(gruposEntrenadorData);
      setAlumnosReporteEntrenador(alumnosEstadoData);

      const finSemanaInicioResumen = semanaAgendaActiva
        ? claveFechaAgenda(
            new Date(
              crearFechaAgenda(semanaAgendaActiva).getTime() +
                6 * 24 * 60 * 60 * 1000
            )
          )
        : '';

      setResumenInicio(
        summarizeOperationalDashboard(
          reportesData,
          planningData,
          gruposEntrenadorData,
          semanaAgendaActiva
            ? { start: semanaAgendaActiva, end: finSemanaInicioResumen }
            : undefined
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function cargarPlanning() {
    setCargando(true);
    setError('');
    setDetalle(null);

    try {
      const data = await consultarSupabase<GrupoPlanning>(
        'v_planning_app',
        'select=*&order=fecha.asc,hora_inicio.asc,nombre_grupo.asc'
      );

      const gruposEstado = await consultarSupabase<GrupoEntrenadorApp>(
        'v_grupos_entrenador_app_dos_entrenadores',
        'select=*&order=fecha.asc,hora_inicio.asc,entrenador.asc,nombre_grupo.asc'
      );

      const alumnosEstado = await consultarSupabase<AlumnoReporteEntrenador>(
        'v_alumnos_reporte_entrenador_app_dos_entrenadores',
        'select=*&order=fecha.asc,hora_inicio.asc,entrenador.asc,nombre_grupo.asc,alumno.asc'
      );

      setPlanning(data);
      setGruposEntrenador(gruposEstado);
      setAlumnosReporteEntrenador(alumnosEstado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setPlanning([]);
      setGruposEntrenador([]);
      setAlumnosReporteEntrenador([]);
    }

    setCargando(false);
  }

  async function cargarGruposEntrenador() {
    setCargando(true);
    setError('');
    setDetalle(null);

    try {
      const grupos = await consultarSupabase<GrupoEntrenadorApp>(
        'v_grupos_entrenador_app_dos_entrenadores',
        'select=*&order=fecha.asc,hora_inicio.asc,entrenador.asc,nombre_grupo.asc'
      );

      const alumnosEstado = await consultarSupabase<AlumnoReporteEntrenador>(
        'v_alumnos_reporte_entrenador_app_dos_entrenadores',
        'select=*&order=fecha.asc,hora_inicio.asc,entrenador.asc,nombre_grupo.asc,alumno.asc'
      );

      const reportesEstado = await consultarSupabase<ReportePendiente>(
        'v_reportes_pendientes_entrenador_dos_entrenadores',
        'select=*&order=fecha.asc,hora_inicio.asc,entrenador.asc,nombre_grupo.asc,alumno.asc'
      );

      setGruposEntrenador(grupos);
      setAlumnosReporteEntrenador(alumnosEstado);
      setReportesPendientes(reportesEstado);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setGruposEntrenador([]);
      setAlumnosReporteEntrenador([]);
    }

    setCargando(false);
  }

  async function publicarGrupo(grupoId: string) {
    const confirmar = window.confirm(
      '¿Seguro que quieres PUBLICAR este grupo? El entrenador podrá verlo como grupo publicado.'
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion(GROUP_OPERATION_RPC.publish, {
        p_grupo_id: grupoId,
      });
      await notificarGrupoPublicadoPushApp(grupoId);

      if (agendaSesionActivaId) {
        await cargarDetalleSesionAgenda(agendaSesionActivaId);
      }
      await cargarAgendaOperativaDirecta();
      await cargarPlanning();
      await cargarGruposEntrenador();
      await cargarCobros();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function despublicarGrupo(grupoId: string) {
    const confirmar = window.confirm(
      '¿Seguro que quieres DESPUBLICAR este grupo? Dejará de aparecer como publicado.'
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion(GROUP_OPERATION_RPC.unpublish, {
        p_grupo_id: grupoId,
      });

      if (agendaSesionActivaId) {
        await cargarDetalleSesionAgenda(agendaSesionActivaId);
      }
      await cargarAgendaOperativaDirecta();
      await cargarPlanning();
      await cargarGruposEntrenador();
      await cargarCobros();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function confirmarGrupoEntrenador(
    grupoId: string,
    entrenadorId: string
  ) {
    const confirmar = window.confirm(
      '¿Confirmas que este entrenador ha visto y acepta el grupo?'
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion(GROUP_OPERATION_RPC.confirmTrainer, {
        p_grupo_id: grupoId,
        p_entrenador_id: entrenadorId,
      });

      await cargarGruposEntrenador();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function marcarAsistencia(
    grupoId: string,
    alumnoId: string,
    estado: string
  ) {
    const scrollActual = window.scrollY;
    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion(GROUP_OPERATION_RPC.markAttendance, {
        p_grupo_id: grupoId,
        p_alumno_id: alumnoId,
        p_estado_asistencia: requireAttendanceState(estado),
      });

      await cargarGruposEntrenador();

      // En Intensivos, una ausencia marcada por el entrenador genera la
      // recuperación en backend. Refrescamos también la sección Intensivos
      // para que coordinación la vea sin tener que pulsar ningún actualizar.
      if (
        intensivoDias.some((dia) =>
          gruposEntrenador.some(
            (grupo) =>
              grupo.grupo_id === grupoId &&
              grupo.fecha === dia.fecha &&
              String(grupo.modalidad || '').toUpperCase() === 'INTENSIVOS'
          )
        )
      ) {
        await cargarIntensivos();
      }

      if (pantalla === 'reportes') await cargarReportesPendientes();
      setTimeout(
        () => window.scrollTo({ top: scrollActual, behavior: 'auto' }),
        0
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  function enfocarFormularioReporteEntrenador(
    alumno: AlumnoReporteEntrenador,
    espera = 140
  ) {
    const reporteDomId =
      `trainer-report-${alumno.entrenador_id}-${alumno.grupo_id}-${alumno.alumno_id}`.replace(
        /[^a-zA-Z0-9_-]/g,
        '-'
      );
    enfocarElementoApp(reporteDomId, {
      espera,
      block: 'start',
      abrirDetallesPadre: true,
    });
  }

  async function abrirFormularioReporte(alumno: AlumnoReporteEntrenador) {
    setErrorReporte('');
    const aperturaId = ++aperturaReporteIdRef.current;
    const apertura = prepareTrainerReportOpening({
      alumnoId: alumno.alumno_id,
      grupoId: alumno.grupo_id,
      entrenadorId: alumno.entrenador_id,
      individualLevel: alumno.nivel_alumno,
    });
    const pistaFallback =
      alumno.pista_alumno && alumno.pista_alumno !== '-'
        ? alumno.pista_alumno
        : alumno.nombre_grupo.toLowerCase().includes('grande')
          ? 'Grande'
          : 'Pequeña';

    if (apertura.status === 'INVALID_IDENTIFIERS') {
      const mensaje =
        'No se puede abrir el reporte porque faltan los identificadores del alumno, grupo o entrenador. Actualiza la vista y vuelve a intentarlo.';
      setError(mensaje);
      setErrorReporte(mensaje);
      return;
    }

    // El formulario y el portal móvil se abren antes de esperar a la RPC.
    // Si falta nivel individual, el entrenador podrá seleccionarlo en la ficha.
    const nivelIndividualInicial = apertura.level;
    setReporteActivo(apertura.activeReport);
    setNivelPartidaReporte(nivelIndividualInicial || '');
    setFormReporte({
      ...reporteInicial(),
      nivel: nivelIndividualInicial || '',
      pista: pistaFallback,
      observaciones: '',
      evaluacionTecnica: nivelIndividualInicial
        ? evaluacionTecnicaInicial(nivelIndividualInicial)
        : {},
    });
    enfocarFormularioReporteEntrenador(alumno, 80);

    let nivelSesion: string | null = null;
    let pistaPartida = pistaFallback;

    try {
      const datos = await ejecutarFuncionConRespuesta<{
        nivel_partida: string | null;
        pista_partida: string | null;
      }>('obtener_nivel_partida_reporte_app', {
        p_grupo_id: alumno.grupo_id,
        p_alumno_id: alumno.alumno_id,
      });

      const partida = Array.isArray(datos) ? datos[0] : null;
      nivelSesion = partida?.nivel_partida || null;
      pistaPartida = partida?.pista_partida || pistaFallback;
    } catch (err) {
      // La ficha individual sigue siendo una fuente válida si la RPC de sesión
      // no responde. El nivel del grupo nunca se usa como sustituto.
      console.warn('No se pudo cargar el nivel de partida del reporte.', err);
    }

    if (aperturaReporteIdRef.current !== aperturaId) return;

    const nivelResuelto = resolveSessionOperationalLevel({
      currentLevel: alumno.nivel_alumno,
      sessionLevel: nivelSesion,
      sessionLevelKind: nivelSesion ? 'UNKNOWN' : 'SNAPSHOT',
    });

    setNivelPartidaReporte(nivelResuelto.level || '');
    setFormReporte((actual) => {
      const nivelElegido = reportTechnicalLevelForRender(actual.nivel);
      if (nivelElegido || !nivelResuelto.level) {
        return pistaPartida === actual.pista
          ? actual
          : { ...actual, pista: pistaPartida };
      }

      return {
        ...actual,
        nivel: nivelResuelto.level,
        pista: pistaPartida,
        evaluacionTecnica: evaluacionTecnicaInicial(nivelResuelto.level),
      };
    });
  }

  function cerrarFormularioReporte() {
    aperturaReporteIdRef.current += 1;
    setReporteActivo(null);
    setNivelPartidaReporte('');
    setFormReporte(reporteInicial());
    setErrorReporte('');
  }

  function cerrarGrupoEntrenador() {
    setGrupoActivoEntrenador(null);
    setSeccionGrupoEntrenador('asistencia');
  }

  async function guardarReporteAlumno(alumno: AlumnoReporteEntrenador) {
    if (guardandoReporte) return;

    const mostrarErrorReporte = (mensaje: string) => {
      setError(mensaje);
      setErrorReporte(mensaje);
      window.setTimeout(() => {
        document
          .getElementById('trainer-report-feedback')
          ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 0);
    };

    setErrorReporte('');

    let nivelReporte: TechnicalLevel;
    try {
      nivelReporte = requireReportTechnicalLevel(formReporte.nivel);
    } catch {
      mostrarErrorReporte(
        'Selecciona un único nivel observado válido antes de guardar el reporte.'
      );
      return;
    }

    if (formReporte.mejorasHoy.length === 0) {
      mostrarErrorReporte(
        'Selecciona qué ha mejorado hoy. Si no hay un avance nuevo, usa “Ha reforzado lo ya aprendido”.'
      );
      return;
    }

    if (!formReporte.ritmoGrupo) {
      mostrarErrorReporte(
        'Selecciona el ritmo del alumno dentro del grupo antes de guardar el reporte.'
      );
      return;
    }

    if (!formReporte.autonomia) {
      mostrarErrorReporte(
        'Selecciona la autonomía observada antes de guardar el reporte.'
      );
      return;
    }

    const observacionUtil = formReporte.observaciones.trim();
    if (!observacionUtil) {
      mostrarErrorReporte(
        'Escribe una observación útil para próximas sesiones antes de guardar el reporte.'
      );
      return;
    }

    const confirmar = window.confirm(`¿Guardar reporte de ${alumno.alumno}?`);

    if (!confirmar) return;

    setCargando(true);
    setGuardandoReporte(true);
    setError('');
    setErrorReporte('');

    try {
      await ejecutarFuncion('crear_reporte_adaptativo_app', {
        p_grupo_id: alumno.grupo_id,
        p_alumno_id: alumno.alumno_id,
        p_entrenador_id: alumno.entrenador_id,
        p_actitud: formReporte.actitud,
        p_nivel_reportado: nivelReporte,
        p_tecnica_legacy: esNivelAprendizajeInicialApp(nivelReporte)
          ? tecnicaInicialDerivadaReporteApp(formReporte)
          : tecnicaLegacyPorNivel(nivelReporte),
        p_pista: formReporte.pista,
        p_autonomia: formReporte.autonomia,
        p_remontes: formReporte.remontes,
        p_incidencia: formReporte.incidencia,
        p_recomendacion_legacy: recomendacionLegacy(formReporte.prioridades),
        p_mejora_legacy: mejoraLegacy(formReporte.mejorasHoy),
        p_observaciones: observacionUtil,
        p_ritmo_grupo: formReporte.ritmoGrupo,
        p_evaluacion_tecnica: formReporte.evaluacionTecnica,
        p_mejoras_hoy: formReporte.mejorasHoy,
        p_prioridades: formReporte.prioridades,
        p_autonomia_cinta: formReporte.autonomiaCinta || null,
        p_cuna_frenada: formReporte.cunaFrenada || null,
        p_giro_inicial: formReporte.giroInicial || null,
        p_dinamica_autonoma: formReporte.dinamicaAutonoma || null,
        p_ayuda_cunero: formReporte.ayudaCunero || 'No utilizado',
      });

      cerrarFormularioReporte();
      await cargarGruposEntrenador();
      await cargarReportesPendientes();
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : 'No se pudo guardar el reporte. Vuelve a intentarlo.';
      mostrarErrorReporte(mensaje);
    } finally {
      setGuardandoReporte(false);
      setCargando(false);
    }
  }

  async function cargarAlumnos() {
    setCargando(true);
    setError('');
    setDetalle(null);

    try {
      const [data, ocioData, babyData, ritmosData, perfilesData] =
        await Promise.all([
          consultarSupabase<AlumnoResumen>(
            'v_resumen_alumno_v2',
            'select=*&order=alumno.asc'
          ),
          consultarSupabase<OcioAlumnoApp>(
            'v_ocio_alumnos_v2_app',
            'select=*&order=alumno.asc'
          ),
          ejecutarFuncionConRespuesta<AlumnoBabyFichaApp>(
            'obtener_alumnos_baby_fichas_app',
            {}
          ),
          ejecutarFuncionConRespuesta<TendenciaRitmoAlumnoApp>(
            'obtener_tendencia_ritmo_alumnos_app',
            {}
          ),
          ejecutarFuncionConRespuesta<PerfilOperativoAlumnoApp>(
            'obtener_perfil_operativo_alumnos_app',
            {}
          ),
        ]);

      // `alumnos` se mantiene como ficha maestra global.
      // La pantalla Alumnos Baby usa únicamente actividad Baby real.
      setAlumnos(data);
      setOcioAlumnos(ocioData);
      setAlumnosBabyFicha(babyData);
      setTendenciasRitmoAlumnos(
        Array.isArray(ritmosData) ? ritmosData : []
      );
      setPerfilesOperativosAlumnos(
        Array.isArray(perfilesData) ? perfilesData : []
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setAlumnos([]);
      setAlumnosBabyFicha([]);
      setTendenciasRitmoAlumnos([]);
      setPerfilesOperativosAlumnos([]);
    }

    setCargando(false);
  }

  async function cargarContextoCerebroTrabajoDiarioApp() {
    const [
      resumenData,
      ritmosData,
      perfilesData,
      progresionData,
      trabajosHistoricosData,
      contextoTecnicoData,
    ] = await Promise.all([
        consultarSupabase<AlumnoResumen>(
          'v_resumen_alumno_v2',
          'select=*&order=alumno.asc'
        ).catch(() => [] as AlumnoResumen[]),
        ejecutarFuncionConRespuesta<TendenciaRitmoAlumnoApp>(
          'obtener_tendencia_ritmo_alumnos_app',
          {}
        ).catch(() => [] as TendenciaRitmoAlumnoApp[]),
        ejecutarFuncionConRespuesta<PerfilOperativoAlumnoApp>(
          'obtener_perfil_operativo_alumnos_app',
          {}
        ).catch(() => [] as PerfilOperativoAlumnoApp[]),
        consultarSupabase<ProgresionInicialAlumnoApp>(
          'v_ultima_progresion_inicial_alumno_app',
          'select=*'
        ).catch(() => [] as ProgresionInicialAlumnoApp[]),
        consultarSupabase<TrabajoDiarioHistoricoApp>(
          'v_detalle_grupos',
          'select=fecha,modalidad,alumnos_detalle,trabajo_diario&trabajo_diario=not.is.null&order=fecha.desc,hora_inicio.desc&limit=240'
        ).catch(() => [] as TrabajoDiarioHistoricoApp[]),
        ejecutarFuncionConRespuesta<ContextoTecnicoReporteApp>(
          'obtener_contexto_tecnico_reportes_app',
          {}
        ).catch(() => [] as ContextoTecnicoReporteApp[]),
      ]);

    if (Array.isArray(resumenData) && resumenData.length > 0) {
      setAlumnos(resumenData);
    }
    setTendenciasRitmoAlumnos(
      Array.isArray(ritmosData) ? ritmosData : []
    );
    setPerfilesOperativosAlumnos(
      Array.isArray(perfilesData) ? perfilesData : []
    );
    setProgresionInicialAlumnos(
      Array.isArray(progresionData) ? progresionData : []
    );
    setTrabajosDiariosHistoricos(
      Array.isArray(trabajosHistoricosData) ? trabajosHistoricosData : []
    );
    setContextoTecnicoReportes(
      Array.isArray(contextoTecnicoData) ? contextoTecnicoData : []
    );
  }

  function trabajosRecientesParaGrupoApp(
    nombresAlumnos: string[],
    fechaActual?: string | null
  ) {
    return recentDailyWorkForGroup(
      nombresAlumnos,
      trabajosDiariosHistoricos,
      fechaActual
    );
  }

  function contextoAlumnoTrabajoDiarioApp(
    alumnoId: string,
    nombreFallback = '',
    nivelFallback = ''
  ): AlumnoContextoTrabajoDiarioApp {
    return buildDailyWorkStudentContext(
      alumnoId,
      {
        students: alumnos,
        profiles: perfilesOperativosAlumnos,
        rhythmTrends: tendenciasRitmoAlumnos,
        initialProgressions: progresionInicialAlumnos,
        technicalContexts: contextoTecnicoReportes,
      },
      { name: nombreFallback, level: nivelFallback }
    );
  }

  function tendenciaRitmoAlumnoApp(alumnoId: string) {
    return tendenciasRitmoAlumnos.find(
      (item) => item.alumno_id === alumnoId
    );
  }

  function perfilOperativoAlumnoApp(alumnoId: string) {
    return perfilesOperativosAlumnos.find(
      (item) => item.alumno_id === alumnoId
    );
  }

  function enlaceWhatsAppFamiliaApp(telefono?: string | null) {
    return familyWhatsappUrl(telefono) || '';
  }

  function bloqueIdentidadFichaAlumnoApp(
    nombre: string,
    fechaNacimiento?: string | null,
    telefono?: string | null
  ) {
    const enlaceWhatsApp = enlaceWhatsAppFamiliaApp(telefono);
    const edad = edadAproximadaOcio(fechaNacimiento);

    return (
      <div style={{ display: 'grid', gap: 7, minWidth: 0 }}>
        <h3 style={{ margin: 0, overflowWrap: 'anywhere', lineHeight: 1.2 }}>
          {nombre}
        </h3>

        <span style={{ color: '#64748b', fontWeight: 700 }}>
          Nacimiento:{' '}
          <strong>
            {fechaNacimiento ? formatearFecha(fechaNacimiento) : 'Sin registrar'}
          </strong>
          {edad !== null ? (
            <>
              {' '}· Edad: <strong>{edad} años</strong>
            </>
          ) : null}
        </span>

        {telefono ? (
          <a
            href={enlaceWhatsApp || undefined}
            target="_blank"
            rel="noreferrer"
            title="Abrir conversación de WhatsApp con la familia"
            style={{
              ...botonMini,
              width: 'fit-content',
              maxWidth: '100%',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 7,
              background: '#ecfdf5',
              borderColor: '#86efac',
              color: '#166534',
              overflowWrap: 'anywhere',
            }}
          >
            WhatsApp · {telefono}
          </a>
        ) : (
          <span
            style={{
              width: 'fit-content',
              padding: '7px 10px',
              borderRadius: 10,
              border: '1px solid #e2e8f0',
              background: '#f8fafc',
              color: '#64748b',
              fontWeight: 750,
              fontSize: 13,
            }}
          >
            Teléfono sin registrar
          </span>
        )}
      </div>
    );
  }

  function datosBasicosFichaAlumnoApp(alumno: AlumnoResumen) {
    const result = studentRecordCompleteness(alumno);
    return {
      completa: result.complete,
      faltan: result.missing,
    };
  }

  function cerrarEditorAlumnoBase() {
    setAlumnoEditandoId(null);
    setAlumnoEditNombre('');
    setAlumnoEditFechaNacimiento('');
    setAlumnoEditTelefono('');
    setAlumnoEditNivel('');
    setAlumnoEditOrigen('Jose / Coordinador');
    setAlumnoEditEstado('pendiente completar');
    setAlumnoEditCamiseta(true);
  }

  async function guardarAlumnoBaseConDatos(
    alumnoId: string,
    nombre: string,
    fechaNacimiento: string,
    telefono: string,
    nivel: string,
    origen: string,
    estado: string
  ) {
    const nombreLimpio = nombre.trim().toUpperCase();
    if (!nombreLimpio) {
      setError('El nombre del alumno no puede estar vacío.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('actualizar_alumno_base_v2_app', {
        p_alumno_id: alumnoId,
        p_nombre_completo: nombreLimpio,
        p_fecha_nacimiento: fechaNacimiento || null,
        p_telefono: telefono.trim() || null,
        p_nivel_codigo: nivel || null,
        p_origen_nivel: origen || 'Jose / Coordinador',
        p_estado_ficha: estado || 'pendiente completar',
      });

      await ejecutarFuncion('actualizar_camiseta_alumno_app', {
        p_alumno_id: alumnoId,
        p_entregada: alumnoEditCamiseta,
      });

      cerrarEditorAlumnoBase();
      await cargarAlumnos();
      await cargarAgendaOperativaDirecta();
      if (agendaSesionActivaId) {
        await cargarDetalleSesionAgenda(agendaSesionActivaId);
      }
      setAgendaRecomendaciones([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  function editarAlumnoBaseRapido(alumno: AlumnoResumen) {
    setAlumnoEditandoId(alumno.alumno_id);
    setAlumnoEditNombre(alumno.alumno || '');
    setAlumnoEditFechaNacimiento(alumno.fecha_nacimiento || '');
    setAlumnoEditTelefono(alumno.telefono || '');
    setAlumnoEditNivel(
      alumno.nivel_actual ||
        alumno.nivel_estimado ||
        alumno.ultimo_nivel_reportado ||
        ''
    );
    setAlumnoEditOrigen(alumno.origen_nivel_estimado || 'Jose / Coordinador');
    setAlumnoEditEstado(alumno.estado_ficha || 'pendiente completar');
    setAlumnoEditCamiseta(alumno.camiseta_entregada !== false);
  }

  async function guardarAlumnoBase(alumnoId: string) {
    await guardarAlumnoBaseConDatos(
      alumnoId,
      alumnoEditNombre,
      alumnoEditFechaNacimiento,
      alumnoEditTelefono,
      alumnoEditNivel,
      alumnoEditOrigen,
      alumnos.find((item) => item.alumno_id === alumnoId)?.estado_ficha ||
        'pendiente completar'
    );
  }

  async function borrarAlumnoBase(alumno: AlumnoResumen) {
    const confirmar = window.confirm(
      `¿Borrar definitivamente la ficha de ${alumno.alumno}?\n\nEsto borra al alumno de listados, grupos, reportes e intensivos de prueba. No se puede deshacer.`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('borrar_alumno_base_operativa_app', {
        p_alumno_id: alumno.alumno_id,
      });

      if (alumnoEditandoId === alumno.alumno_id) cerrarEditorAlumnoBase();
      await cargarAlumnos();
      await cargarAgendaOperativaDirecta();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function crearAlumnoManualBase() {
    const nombreLimpio = nuevoAlumnoNombre.trim().toUpperCase();
    if (!nombreLimpio) {
      setError('Escribe el nombre del alumno para crear la ficha manual.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('crear_alumno_manual_operativa_app', {
        p_nombre_completo: nombreLimpio,
        p_nivel_codigo: nuevoAlumnoNivel || null,
        p_origen_nivel: nuevoAlumnoOrigen || 'Jose / Coordinador',
        p_estado_ficha: nuevoAlumnoEstado || 'pendiente completar',
      });

      setNuevoAlumnoNombre('');
      setNuevoAlumnoNivel('');
      setNuevoAlumnoOrigen('Jose / Coordinador');
      setNuevoAlumnoEstado('pendiente completar');
      setMostrarNuevoAlumnoManual(false);
      await cargarAlumnos();
      await cargarAgendaOperativaDirecta();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error creando alumno manual'
      );
    }

    setCargando(false);
  }

  async function cargarHistorialReportesAlumnoFichaApp(
    alumnoId: string,
    forzar = false
  ): Promise<HistorialReporteAlumnoFichaApp[]> {
    const yaCargado = Object.prototype.hasOwnProperty.call(
      historialReportesFichaPorAlumno,
      alumnoId
    );

    if (!forzar && yaCargado) {
      return historialReportesFichaPorAlumno[alumnoId] || [];
    }

    setHistorialReportesFichaCargandoId(alumnoId);

    try {
      let reportes: HistorialReporteAlumnoFichaApp[] = [];

      try {
        reportes = await ejecutarFuncionConRespuesta<HistorialReporteAlumnoFichaApp>(
          'obtener_historial_reportes_adaptativo_alumno_app',
          { p_alumno_id: alumnoId }
        );
      } catch (errorRpc) {
        const mensajeRpc =
          errorRpc instanceof Error ? errorRpc.message : String(errorRpc || '');
        const funcionNuevaNoDisponible =
          /PGRST202|schema cache|could not find the function|no se pudo ejecutar obtener_historial_reportes_adaptativo_alumno_app/i.test(
            mensajeRpc
          );

        if (!funcionNuevaNoDisponible) throw errorRpc;

        // Compatibilidad segura: si la función nueva todavía no está aplicada,
        // mostramos el historial que ya existía sin bloquear Fichas ni reportes.
        console.warn(
          'Historial ampliado todavía no disponible; se usa el historial compatible.'
        );
        let historialCompatibleDisponible = false;
        try {
          reportes = await ejecutarFuncionConRespuesta<HistorialReporteAlumnoFichaApp>(
            'obtener_historial_reportes_alumno_ficha_app',
            { p_alumno_id: alumnoId }
          );
          historialCompatibleDisponible = true;
        } catch {}

        if (!historialCompatibleDisponible) {
          const legacy = await consultarSupabase<{
          fecha: string;
          modalidad: string | null;
          nombre_grupo: string | null;
          nivel_reportado: string | null;
          actitud: string | null;
          tecnica: string | null;
          pista: string | null;
          remontes: string[] | null;
          autonomia: string | null;
          incidencia: string | null;
          recomendacion_proxima_sesion: string | null;
          enviado_at: string | null;
        }>(
          'v_historial_reportes_alumno',
          `select=fecha,modalidad,nombre_grupo,nivel_reportado,actitud,tecnica,pista,remontes,autonomia,incidencia,recomendacion_proxima_sesion,enviado_at&alumno_id=eq.${encodeURIComponent(
            alumnoId
          )}&order=fecha.desc,enviado_at.desc`
        );

          reportes = legacy.map((reporte) => ({
            reporte_id: null,
            fecha: reporte.fecha,
            modalidad: reporte.modalidad,
            grupo: reporte.nombre_grupo,
            entrenador: null,
            nivel_reportado: reporte.nivel_reportado,
            actitud: reporte.actitud,
            tecnica: reporte.tecnica,
            pista: reporte.pista,
            remontes: reporte.remontes,
            autonomia: reporte.autonomia,
            ritmo_grupo: null,
            mejora_hoy: null,
            incidencia: reporte.incidencia,
            recomendacion: reporte.recomendacion_proxima_sesion,
            observaciones_generales: null,
            trabajo_diario: null,
            enviado_at: reporte.enviado_at,
          }));
        }
      }

      const ordenados = sortReportHistory(
        Array.isArray(reportes) ? reportes : []
      );

      setHistorialReportesFichaPorAlumno((actual) => ({
        ...actual,
        [alumnoId]: ordenados,
      }));
      return ordenados;
    } finally {
      setHistorialReportesFichaCargandoId((actual) =>
        actual === alumnoId ? null : actual
      );
    }
  }

  async function alternarHistorialAlumnoFichaApp(
    alumno: Pick<AlumnoResumen, 'alumno_id'>
  ) {
    if (historialAlumnoAbiertoId === alumno.alumno_id) {
      setHistorialAlumnoAbiertoId(null);
      return;
    }

    setHistorialAlumnoAbiertoId(alumno.alumno_id);
    setFiltroModalidadHistorialFicha('TODOS');
    setError('');

    try {
      await cargarHistorialReportesAlumnoFichaApp(alumno.alumno_id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error cargando el historial del alumno.'
      );
    }
  }


  function abrirFichaMaestraAlumnoApp(alumnoId: string, nombre: string) {
    const ficha = alumnos.find((item) => item.alumno_id === alumnoId);
    setVistaFichasAlumnos('general');
    setFiltroAlumnos('todos');
    setBusquedaAlumno(ficha?.alumno || nombre || '');
    setPantalla('alumnos');
    window.setTimeout(() => {
      document.getElementById('fichas-listado-alumnos')?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 80);
  }

  function generarBaseEvaluacionAlumnoFichaApp(
    alumno: Pick<AlumnoResumen, 'alumno'> &
      Partial<
        Pick<
          AlumnoResumen,
          'nivel_actual' | 'ultimo_nivel_reportado' | 'nivel_estimado'
        >
    >,
    reportes: HistorialReporteAlumnoFichaApp[]
  ) {
    return buildFamilyReportBase(alumno, reportes, {
      formatDate: formatearFecha,
      summarizeTechnicalEvaluation: resumenEvaluacionTecnica,
    });
  }

  async function abrirEvaluacionAlumno(alumno: AlumnoResumen) {
    setCargando(true);
    setError('');
    setEvaluacionAlumnoActivaId(alumno.alumno_id);
    setEvaluacionAlumnoTexto('Preparando resumen...');

    try {
      const reportes = await cargarHistorialReportesAlumnoFichaApp(
        alumno.alumno_id
      );
      setEvaluacionAlumnoTexto(
        generarBaseEvaluacionAlumnoFichaApp(alumno, reportes)
      );
    } catch (err) {
      setEvaluacionAlumnoTexto('');
      setError(
        err instanceof Error ? err.message : 'Error generando evaluación'
      );
    }

    setCargando(false);
  }

  async function copiarEvaluacionAlumnoTexto() {
    if (!evaluacionAlumnoTexto.trim()) return;

    try {
      await navigator.clipboard.writeText(evaluacionAlumnoTexto);
      alert(
        'Base del informe copiada. Pégala en ChatGPT para convertirla en un texto final para la familia.'
      );
    } catch {
      window.prompt('Copia esta base del informe:', evaluacionAlumnoTexto);
    }
  }

  async function cargarOcioAlumnos() {
    setCargando(true);
    setError('');
    try {
      const data = await consultarSupabase<OcioAlumnoApp>(
        'v_ocio_alumnos_v2_app',
        'select=*&order=alumno.asc'
      );
      setOcioAlumnos(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error cargando alumnos de Ocio'
      );
      setOcioAlumnos([]);
    }
    setCargando(false);
  }

  async function cargarOcioGrupos() {
    setCargando(true);
    setError('');
    try {
      const data = await consultarSupabase<OcioGrupoApp>(
        'v_ocio_grupos_estables_app',
        'select=*&activo=eq.true&order=dia_semana.asc,hora_inicio.asc,nombre_grupo.asc'
      );
      setOcioGrupos(data);
      const recomendaciones =
        await consultarSupabase<OcioRecomendacionCambioApp>(
          'v_ocio_recomendacion_cambios_app',
          'select=*&order=alumno.asc'
        );
      setOcioRecomendacionesCambio(recomendaciones);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error cargando grupos de Ocio'
      );
      setOcioGrupos([]);
      setOcioRecomendacionesCambio([]);
    }
    setCargando(false);
  }

  async function cargarOcioCambios() {
    setCargando(true);
    setError('');
    try {
      const data = await consultarSupabase<OcioCambioPuntualApp>(
        'v_ocio_reubicaciones_app',
        'select=*&order=fecha.desc,alumno.asc'
      );
      setOcioCambiosPuntuales(data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error cargando cambios puntuales de Ocio'
      );
      setOcioCambiosPuntuales([]);
    }
    setCargando(false);
  }

  function limpiarFormularioOcioAlumno() {
    setOcioAlumnoEditandoId(null);
    setOcioNombre('');
    setOcioTelefono('');
    setOcioNivel('');
    setOcioFechaNacimiento('');
    setOcioDiaFijo('Jueves');
    setOcioHoraInicio('18:00');
    setOcioHoraFin('20:00');
    setOcioObservaciones('');
  }

  function abrirNuevoAlumnoOcio() {
    limpiarFormularioOcioAlumno();
    setMostrarNuevoOcio(true);
  }

  function editarAlumnoOcio(alumno: OcioAlumnoApp) {
    setOcioAlumnoEditandoId(alumno.alumno_id);
    setOcioNombre(alumno.alumno || '');
    setOcioTelefono(alumno.telefono || '');
    setOcioNivel(
      alumno.nivel_usado && alumno.nivel_usado !== '-' ? alumno.nivel_usado : ''
    );
    setOcioFechaNacimiento(alumno.fecha_nacimiento || '');
    setOcioDiaFijo(alumno.dia_fijo || alumno.grupo_dia || 'Jueves');
    setOcioHoraInicio(
      (alumno.hora_inicio_fija || alumno.grupo_hora_inicio || '18:00').slice(
        0,
        5
      )
    );
    setOcioHoraFin(
      (alumno.hora_fin_fija || alumno.grupo_hora_fin || '20:00').slice(0, 5)
    );
    setOcioObservaciones(alumno.observaciones || '');
    setMostrarNuevoOcio(true);
  }

  async function guardarAlumnoOcio() {
    const nombre = ocioNombre.trim().toUpperCase();
    if (!nombre) {
      alert('Pon el nombre del alumno de Ocio.');
      return;
    }
    setCargando(true);
    setError('');
    try {
      if (ocioAlumnoEditandoId) {
        await ejecutarFuncion('actualizar_alumno_ocio_v2_app', {
          p_alumno_id: ocioAlumnoEditandoId,
          p_nombre_completo: nombre,
          p_telefono: ocioTelefono.trim() || null,
          p_nivel_codigo: ocioNivel || null,
          p_fecha_nacimiento: ocioFechaNacimiento || null,
          p_dia_fijo: ocioDiaFijo || null,
          p_hora_inicio: ocioHoraInicio || null,
          p_hora_fin: ocioHoraFin || null,
          p_observaciones: ocioObservaciones || null,
          p_estado_ficha: 'pendiente completar',
        });
      } else {
        await ejecutarFuncion('crear_alumno_ocio_app', {
          p_nombre_completo: nombre,
          p_nivel_codigo: ocioNivel || null,
          p_fecha_nacimiento: ocioFechaNacimiento || null,
          p_dia_fijo: ocioDiaFijo || null,
          p_hora_inicio: ocioHoraInicio || null,
          p_hora_fin: ocioHoraFin || null,
          p_observaciones: ocioObservaciones || null,
        });
      }
      limpiarFormularioOcioAlumno();
      setMostrarNuevoOcio(false);
      await cargarOcioAlumnos();
      await cargarOcioGrupos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error guardando alumno Ocio'
      );
    }
    setCargando(false);
  }

  async function eliminarAlumnoOcio(alumno: OcioAlumnoApp) {
    const confirmar = window.confirm(
      `¿Eliminar la ficha de Ocio de ${alumno.alumno}? No se puede deshacer.`
    );
    if (!confirmar) return;
    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('eliminar_alumno_ocio_app', {
        p_alumno_id: alumno.alumno_id,
      });
      await cargarOcioAlumnos();
      await cargarOcioGrupos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error eliminando alumno Ocio'
      );
    }
    setCargando(false);
  }

  async function importarOcioAimharder() {
    if (!textoImportarOcio.trim()) {
      alert('Pega el listado de Aimharder de Ocio.');
      return;
    }
    setCargando(true);
    setError('');
    try {
      const resultado = await ejecutarFuncionConRespuesta<OcioImportadoApp>(
        'importar_alumnos_ocio_aimharder_app',
        {
          p_texto: textoImportarOcio,
          p_dia_fijo: ocioDiaFijo || null,
          p_hora_inicio: ocioHoraInicio || null,
          p_hora_fin: ocioHoraFin || null,
        }
      );
      setResultadoImportarOcio(resultado);
      await cargarOcioAlumnos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error importando listado Ocio'
      );
    }
    setCargando(false);
  }

  function esTurnoOficialOcio(grupo: OcioGrupoApp) {
    const dia = textoSinAcentosGrupoApp(grupo.dia_semana || '');
    const inicio = (grupo.hora_inicio || '').slice(0, 5);
    const fin = (grupo.hora_fin || '').slice(0, 5);

    return (
      (dia === textoSinAcentosGrupoApp('Jueves') &&
        inicio === '18:00' &&
        fin === '20:00') ||
      (dia === textoSinAcentosGrupoApp('Sábado') &&
        inicio === '09:45' &&
        fin === '11:45') ||
      (dia === textoSinAcentosGrupoApp('Domingo') &&
        inicio === '12:00' &&
        fin === '14:00')
    );
  }

  function horarioTurnoOcio(dia: 'Jueves' | 'Sábado' | 'Domingo') {
    if (dia === 'Sábado') {
      return { inicio: '09:45', fin: '11:45' };
    }
    if (dia === 'Domingo') {
      return { inicio: '12:00', fin: '14:00' };
    }
    return { inicio: '18:00', fin: '20:00' };
  }

  function nivelesGrupoEstableOcio(grupo: OcioGrupoApp) {
    // Ocio conserva el nivel objetivo del grupo, pero también necesita conocer
    // la composición técnica real. Así no rechazamos, por ejemplo, a un D+
    // solo porque el grupo esté rotulado como C cuando dentro ya trabaja un D.
    const nivelesMiembros = ocioAlumnos
      .filter((alumno) => alumno.grupo_id === grupo.grupo_id)
      .map((alumno) => alumno.nivel_usado || alumno.nivel || '')
      .filter(Boolean);

    return Array.from(
      new Set([grupo.nivel_grupo || '', ...nivelesMiembros].filter(Boolean))
    );
  }

  function compatibilidadGrupoEstableOcioApp(
    grupo: OcioGrupoApp,
    nivelAlumno: string
  ) {
    const niveles = nivelesGrupoEstableOcio(grupo);

    if (niveles.length === 0) {
      return compatibilidadFueraPlazoAgenda(nivelAlumno, []);
    }

    // Importante: NO cambiamos el recomendador común Baby/Ocio.
    // Lo aplicamos contra cada nivel real presente en el grupo y elegimos el
    // mejor encaje técnico. Esto evita que un rótulo histórico del grupo sea
    // más restrictivo que su composición real.
    const prioridad = { RECOMENDADO: 3, REVISAR: 2, NO_ENCAJA: 1 } as const;
    const evaluaciones = niveles.map((nivelGrupo) => ({
      nivelGrupo,
      ...compatibilidadFueraPlazoAgenda(nivelAlumno, [nivelGrupo]),
    }));

    evaluaciones.sort((a, b) => {
      const diferenciaEstado = prioridad[b.estado] - prioridad[a.estado];
      if (diferenciaEstado !== 0) return diferenciaEstado;
      return b.score - a.score;
    });

    const mejor = evaluaciones[0];
    const nivelObjetivo = (grupo.nivel_grupo || '').trim().toUpperCase();
    const nivelMejor = (mejor.nivelGrupo || '').trim().toUpperCase();
    const esNivelRealDistintoDelRotulo =
      Boolean(nivelObjetivo) && nivelMejor !== nivelObjetivo;

    return {
      estado: mejor.estado,
      score: mejor.score,
      motivo:
        mejor.estado === 'RECOMENDADO' && esNivelRealDistintoDelRotulo
          ? `Compatible con nivel ${mejor.nivelGrupo} ya presente en el grupo. ${mejor.motivo}`
          : mejor.motivo,
    };
  }

  function perfilOperativoOcioApp(alumnoId?: string | null) {
    if (!alumnoId) return undefined;
    return perfilesOperativosAlumnos.find(
      (perfil) => perfil.alumno_id === alumnoId
    );
  }

  function puntuacionFuncionalOcioApp(
    nivel: string | null | undefined,
    alumnoId?: string | null
  ) {
    const perfil = perfilOperativoOcioApp(alumnoId);
    const parsed = parseTechnicalLevel(nivel);
    if (parsed.status !== 'VALID') return null;
    return ocioFunctionalScore({
      level: parsed.level,
      strength: perfil?.fuerza_nivel,
      highAttentionDemand: perfil?.demanda_atencion === 'ALTA',
    });
  }

  function mediaFuncionalGrupoOcioApp(grupoId: string) {
    const miembros = ocioAlumnos.filter(
      (alumno) => alumno.grupo_id === grupoId
    );

    const valores = miembros
      .map((alumno) =>
        puntuacionFuncionalOcioApp(
          alumno.nivel_usado || alumno.nivel || '',
          alumno.alumno_id
        )
      )
      .filter((valor): valor is number => Number.isFinite(valor));

    if (valores.length === 0) return null;
    return valores.reduce((suma, valor) => suma + valor, 0) / valores.length;
  }

  function edadMediaGrupoOcioApp(grupoId: string) {
    const edades = ocioAlumnos
      .filter((alumno) => alumno.grupo_id === grupoId)
      .map((alumno) => edadAproximadaOcio(alumno.fecha_nacimiento))
      .filter((edad): edad is number => edad !== null);

    if (edades.length === 0) return null;
    return edades.reduce((suma, edad) => suma + edad, 0) / edades.length;
  }

  function explicacionCompactaPropuestaOcioApp(
    alumno: OcioAlumnoApp,
    grupo: OcioGrupoPropuestaApp,
    miembros: OcioAlumnoApp[]
  ) {
    const nivelAlumno = (
      alumno.nivel_usado ||
      alumno.nivel ||
      ''
    )
      .trim()
      .toUpperCase();

    // Solo explicamos casos frontera para no meter ruido visual.
    if (nivelAlumno !== 'B+' && nivelAlumno !== 'B++') return '';

    const nivelesCompaneros = miembros
      .filter((item) => item.alumno_id !== alumno.alumno_id)
      .map((item) =>
        (item.nivel_usado || item.nivel || '').trim().toUpperCase()
      );

    const conviveConC = nivelesCompaneros.some((nivel) =>
      /^C(?:\+)?$/.test(nivel)
    );
    const conviveConB = nivelesCompaneros.some((nivel) => nivel === 'B');

    const perfil = perfilOperativoOcioApp(alumno.alumno_id);
    const fuerte =
      perfil?.fuerza_nivel === 'FUERTE' ||
      perfil?.fuerza_nivel === 'MUY_FUERTE';

    if (conviveConC && fuerte) {
      return 'Encaje: B+ fuerte · compatible con C';
    }

    if (conviveConC) {
      return 'Encaje: ritmo compatible con el grupo';
    }

    if (conviveConB) {
      return fuerte
        ? 'Encaje: equilibra el ritmo del grupo'
        : 'Encaje: ritmo similar al grupo';
    }

    return '';
  }

  function evaluarEncajeGrupoEstableOcio(
    grupo: OcioGrupoApp,
    nivelAlumno: string,
    esTurnoActual: boolean,
    alumnoId?: string | null,
    fechaNacimiento?: string | null
  ): {
    grupo: OcioGrupoApp;
    estado: 'RECOMENDADO' | 'REVISAR' | 'NO_ENCAJA';
    motivo: string;
    score: number;
    totalActual: number;
    totalFinal: number;
    esTurnoActual: boolean;
  } {
    const compatibilidad = compatibilidadGrupoEstableOcioApp(
      grupo,
      nivelAlumno
    );

    const totalActual =
      ocioAlumnos.filter((alumno) => alumno.grupo_id === grupo.grupo_id).length ||
      Number(grupo.total_alumnos || 0);
    const totalFinal = totalActual + 1;

    const maxRatio = ocioGroupMaximum(grupo.pista);

    let estado = compatibilidad.estado;
    let motivo = compatibilidad.motivo;
    let score = compatibilidad.score;

    if (totalFinal > maxRatio) {
      estado = 'NO_ENCAJA';
      score = 0;
      motivo = `Superaría el ratio del grupo (${totalFinal}/${maxRatio}).`;
    } else {
      const huecos = Math.max(0, maxRatio - totalFinal);
      score += Math.max(0, 12 - huecos * 2);
      if (esTurnoActual) score += 20;

      // Afinado Ocio: mismo nivel nominal no siempre significa mismo ritmo.
      // El perfil común solo afina; no sustituye la compatibilidad técnica base.
      const perfilAlumno = perfilOperativoOcioApp(alumnoId);
      const mediaGrupo = mediaFuncionalGrupoOcioApp(grupo.grupo_id);

      if (perfilAlumno && mediaGrupo !== null) {
        const funcionalAlumno = puntuacionFuncionalOcioApp(
          nivelAlumno,
          alumnoId
        );
        if (funcionalAlumno === null) {
          return {
            grupo,
            estado: 'REVISAR',
            motivo:
              'El nivel individual no es válido. Revisa la ficha; no se utilizará el nivel del grupo.',
            score: 0,
            totalActual,
            totalFinal,
            esTurnoActual,
          };
        }
        const diferencia = Math.abs(funcionalAlumno - mediaGrupo);

        if (diferencia <= 2) {
          score += 14;
          motivo = `${motivo} Ritmo/fortaleza muy compatible con el grupo.`;
        } else if (diferencia <= 4) {
          score += 7;
          motivo = `${motivo} Ritmo compatible.`;
        } else if (diferencia >= 7 && estado === 'RECOMENDADO') {
          estado = 'REVISAR';
          score = Math.max(1, score - 8);
          motivo = `${motivo} Nivel compatible, pero el ritmo reciente difiere bastante del grupo.`;
        }
      }

      // Edad en Ocio solo desempata cuando ya hay encaje técnico/funcional.
      const edadAlumno = edadAproximadaOcio(fechaNacimiento);
      const edadGrupo = edadMediaGrupoOcioApp(grupo.grupo_id);
      if (
        estado !== 'NO_ENCAJA' &&
        edadAlumno !== null &&
        edadGrupo !== null
      ) {
        const diferenciaEdad = Math.abs(edadAlumno - edadGrupo);
        if (diferenciaEdad <= 2) score += 3;
        else if (diferenciaEdad <= 4) score += 1;
      }

      // Si el alumno ya pertenece a este grupo, mantener estabilidad pesa mucho.
      if (
        alumnoId &&
        ocioAlumnos.some(
          (alumno) =>
            alumno.alumno_id === alumnoId &&
            alumno.grupo_id === grupo.grupo_id
        )
      ) {
        score += 30;
        motivo = `${motivo} Se prioriza mantener su grupo estable.`;
      }
    }

    return {
      grupo,
      estado,
      motivo,
      score,
      totalActual,
      totalFinal,
      esTurnoActual,
    };
  }

  function recomendacionesAlumnoSinGrupoOcio(
    alumno: OcioAlumnoApp,
    gruposDia: OcioGrupoApp[]
  ) {
    const nivelParsed = parseTechnicalLevel(
      alumno.nivel_usado || alumno.nivel
    );
    const nivel = nivelParsed.status === 'VALID' ? nivelParsed.level : '';

    return gruposDia
      .filter((grupo) => Boolean(grupo.activo))
      .map((grupo) =>
        evaluarEncajeGrupoEstableOcio(
          grupo,
          nivel,
          true,
          alumno.alumno_id,
          alumno.fecha_nacimiento
        )
      )
      .sort((a, b) => {
        const ordenEstado = {
          RECOMENDADO: 0,
          REVISAR: 1,
          NO_ENCAJA: 2,
        } as const;

        const estadoA =
          ordenEstado[a.estado as keyof typeof ordenEstado] ?? 9;
        const estadoB =
          ordenEstado[b.estado as keyof typeof ordenEstado] ?? 9;

        if (estadoA !== estadoB) return estadoA - estadoB;
        return b.score - a.score;
      });
  }

  async function asignarRecomendacionAlumnoSinGrupoOcio(
    alumno: OcioAlumnoApp,
    grupo: OcioGrupoApp
  ) {
    const confirmar = window.confirm(
      `¿Asignar a ${alumno.alumno} a ${grupo.nombre_grupo}?`
    );
    if (!confirmar) return;

    await asignarAlumnoGrupoOcio(alumno.alumno_id, grupo.grupo_id);
  }

  async function buscarFichaNuevoOcio(valor: string) {
    setOcioNuevoNombre(valor);
    setOcioNuevoAlumnoId('');
    setOcioNuevoRecomendaciones([]);

    const buscado = normalizarNombreFueraPlazoAgenda(valor);
    if (buscado.length < 2) {
      setOcioNuevoSugerencias([]);
      return;
    }

    try {
      const maestro =
        alumnos.length > 0
          ? alumnos
          : await consultarSupabase<AlumnoResumen>(
              'v_resumen_alumno_v2',
              'select=*&order=alumno.asc'
            );

      if (alumnos.length === 0) setAlumnos(maestro);

      const sugerencias = maestro
        .filter((alumno) =>
          normalizarNombreFueraPlazoAgenda(alumno.alumno).startsWith(buscado)
        )
        .slice(0, 6);

      setOcioNuevoSugerencias(sugerencias);
    } catch {
      setOcioNuevoSugerencias([]);
    }
  }

  function seleccionarFichaNuevoOcio(alumno: AlumnoResumen) {
    const nivel = buildMasterStudentProfile(alumno).level.level || '';

    setOcioNuevoNombre(alumno.alumno);
    setOcioNuevoNivel(nivel);
    setOcioNuevoAlumnoId(alumno.alumno_id);
    setOcioNuevoSugerencias([]);
    setOcioNuevoRecomendaciones([]);
  }

  async function analizarNuevoAlumnoOcio() {
    const nombre = ocioNuevoNombre.trim();
    if (!nombre) {
      setError('Escribe o selecciona el nombre del alumno.');
      return;
    }

    setOcioNuevoAnalizando(true);
    setError('');

    try {
      const nivelValidado = parseTechnicalLevel(ocioNuevoNivel);
      if (nivelValidado.status !== 'VALID') {
        throw new Error(
          'Selecciona un nivel técnico individual válido antes de analizar el encaje. No se asignará INICIACIÓN automáticamente.'
        );
      }
      const nivel = nivelValidado.level;

      const turno = horarioTurnoOcio(ocioTurnoVista);
      const diaActual = textoSinAcentosGrupoApp(ocioTurnoVista);

      const resultados = ocioGrupos
        .filter((grupo) => Boolean(grupo.activo))
        .map((grupo) => {
          const esTurnoActual =
            textoSinAcentosGrupoApp(grupo.dia_semana || '') === diaActual &&
            (grupo.hora_inicio || '').slice(0, 5) === turno.inicio;

          const fichaMaestra = ocioNuevoAlumnoId
            ? alumnos.find(
                (alumno) => alumno.alumno_id === ocioNuevoAlumnoId
              )
            : undefined;

          return evaluarEncajeGrupoEstableOcio(
            grupo,
            nivel,
            esTurnoActual,
            ocioNuevoAlumnoId || null,
            fichaMaestra?.fecha_nacimiento || null
          );
        })
        .sort((a, b) => {
          if (a.esTurnoActual !== b.esTurnoActual) {
            return a.esTurnoActual ? -1 : 1;
          }
          return b.score - a.score;
        });

      setOcioNuevoRecomendaciones(resultados);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo analizar el encaje.'
      );
    }

    setOcioNuevoAnalizando(false);
  }

  async function incorporarNuevoAlumnoOcio(
    recomendacion: {
      grupo: OcioGrupoApp;
      estado: 'RECOMENDADO' | 'REVISAR' | 'NO_ENCAJA';
      totalActual: number;
      totalFinal: number;
    },
    onSuccess?: () => void
  ) {
    if (recomendacion.estado === 'NO_ENCAJA') return;

    const grupo = recomendacion.grupo;
    const nombre = ocioNuevoNombre.trim();
    const nivelValidado = parseTechnicalLevel(ocioNuevoNivel);
    if (nivelValidado.status !== 'VALID') {
      setError(
        'Selecciona un nivel técnico individual válido antes de incorporar al alumno.'
      );
      return;
    }
    const nivel = nivelValidado.level;

    const cambioTurno =
      textoSinAcentosGrupoApp(grupo.dia_semana || '') !==
      textoSinAcentosGrupoApp(ocioTurnoVista);

    const confirmar = window.confirm(
      `${nombre} · ${nivel}\n${grupo.dia_semana} ${horaCorta(
        grupo.hora_inicio
      )}-${horaCorta(grupo.hora_fin)} · ${grupo.nombre_grupo}\n${
        recomendacion.totalActual
      } → ${recomendacion.totalFinal} niños\n\n${
        cambioTurno
          ? 'Confirma que los padres han aceptado este turno y que quieres dejarlo como grupo estable.'
          : '¿Confirmas que quieres incorporarlo de forma permanente a este grupo estable?'
      }`
    );
    if (!confirmar) return;

    setOcioNuevoGuardandoGrupoId(grupo.grupo_id);
    setError('');

    try {
      let alumnoOcio = ocioAlumnos.find(
        (alumno) =>
          alumno.alumno_id === ocioNuevoAlumnoId ||
          normalizarNombreFueraPlazoAgenda(alumno.alumno) ===
            normalizarNombreFueraPlazoAgenda(nombre)
      );
      const alumnoOcioExistente = alumnoOcio;

      if (!alumnoOcio) {
        await ejecutarFuncion('crear_alumno_ocio_app', {
          p_nombre_completo: nombre.toUpperCase(),
          p_nivel_codigo: nivel || null,
          p_fecha_nacimiento: null,
          p_dia_fijo: grupo.dia_semana,
          p_hora_inicio: (grupo.hora_inicio || '').slice(0, 5),
          p_hora_fin: (grupo.hora_fin || '').slice(0, 5),
          p_observaciones: null,
        });

        const actualizados = await consultarSupabase<OcioAlumnoApp>(
          'v_ocio_alumnos_v2_app',
          'select=*&order=alumno.asc'
        );
        setOcioAlumnos(actualizados);

        alumnoOcio = actualizados.find(
          (alumno) =>
            alumno.alumno_id === ocioNuevoAlumnoId ||
            normalizarNombreFueraPlazoAgenda(alumno.alumno) ===
              normalizarNombreFueraPlazoAgenda(nombre)
        );
      }

      if (!alumnoOcio) {
        throw new Error(
          'Se ha creado la ficha de Ocio, pero no he podido localizarla para asignarla al grupo.'
        );
      }

      let nivelParaPersistir = nivel;
      if (alumnoOcioExistente) {
        const nivelExistente = parseTechnicalLevel(
          alumnoOcioExistente.nivel_usado || alumnoOcioExistente.nivel
        );
        if (nivelExistente.status !== 'VALID') {
          throw new Error(
            'La ficha existente no tiene un nivel operativo válido. Corrígelo de forma trazable en la ficha maestra antes de asignar el grupo estable.'
          );
        }
        nivelParaPersistir = requireUnchangedExistingOcioLevel(
          nivelExistente.level,
          nivel
        );
      }

      // Si ya existía en Ocio, actualizamos su día/turno fijo al destino elegido.
      await ejecutarFuncion('actualizar_alumno_ocio_app', {
        p_alumno_id: alumnoOcio.alumno_id,
        p_nombre_completo: alumnoOcio.alumno,
        p_nivel_codigo: nivelParaPersistir,
        p_fecha_nacimiento: alumnoOcio.fecha_nacimiento || null,
        p_dia_fijo: grupo.dia_semana,
        p_hora_inicio: (grupo.hora_inicio || '').slice(0, 5),
        p_hora_fin: (grupo.hora_fin || '').slice(0, 5),
        p_observaciones: alumnoOcio.observaciones || null,
        p_estado_ficha: alumnoOcio.estado_ficha || 'pendiente completar',
      });

      await ejecutarFuncion('asignar_alumno_grupo_ocio_app', {
        p_grupo_id: grupo.grupo_id,
        p_alumno_id: alumnoOcio.alumno_id,
      });

      setOcioTurnoVista(
        grupo.dia_semana === 'Sábado' || grupo.dia_semana === 'Domingo'
          ? grupo.dia_semana
          : 'Jueves'
      );
      setOcioNuevoNombre('');
      setOcioNuevoNivel('');
      setOcioNuevoAlumnoId('');
      setOcioNuevoSugerencias([]);
      setOcioNuevoRecomendaciones([]);
      onSuccess?.();

      await cargarOcioAlumnos();
      await cargarOcioGrupos();

      enfocarElementoApp('ocio-grupos-turno-activo', {
        espera: 100,
        block: 'start',
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo incorporar el alumno al grupo estable.'
      );
    }

    setOcioNuevoGuardandoGrupoId('');
  }

  function edadAproximadaOcio(fechaNacimiento?: string | null) {
    return calculateAge(fechaNacimiento);
  }

  function alumnosTurnoOcio(dia: 'Jueves' | 'Sábado' | 'Domingo') {
    const turno = horarioTurnoOcio(dia);
    const diaNormalizado = textoSinAcentosGrupoApp(dia);

    return ocioAlumnos
      .filter((alumno) => {
        const diaAlumno = textoSinAcentosGrupoApp(
          alumno.grupo_dia || alumno.dia_fijo || ''
        );
        const inicioAlumno = (
          alumno.grupo_hora_inicio ||
          alumno.hora_inicio_fija ||
          ''
        ).slice(0, 5);

        return (
          diaAlumno === diaNormalizado &&
          (!inicioAlumno || inicioAlumno === turno.inicio)
        );
      })
      .sort((a, b) => {
        const funcionalA = puntuacionFuncionalOcioApp(
          a.nivel_usado || a.nivel,
          a.alumno_id
        );
        const funcionalB = puntuacionFuncionalOcioApp(
          b.nivel_usado || b.nivel,
          b.alumno_id
        );
        if (funcionalA === null && funcionalB !== null) return 1;
        if (funcionalA !== null && funcionalB === null) return -1;
        if (
          funcionalA !== null &&
          funcionalB !== null &&
          funcionalA !== funcionalB
        ) {
          return funcionalA - funcionalB;
        }

        // Edad solo como desempate una vez nivel + ritmo están parejos.
        const edadA = edadAproximadaOcio(a.fecha_nacimiento);
        const edadB = edadAproximadaOcio(b.fecha_nacimiento);
        if (edadA !== null && edadB !== null && edadA !== edadB) {
          return edadA - edadB;
        }

        return a.alumno.localeCompare(b.alumno);
      });
  }

  function repartirTamanosOcio(total: number, maximo: number) {
    return balancedGroupSizes(total, maximo);
  }

  function nivelObjetivoGrupoPropuestaOcio(alumnosGrupo: OcioAlumnoApp[]) {
    const niveles = alumnosGrupo
      .map((alumno) => {
        const parsed = parseTechnicalLevel(alumno.nivel_usado || alumno.nivel);
        return parsed.status === 'VALID'
          ? {
              texto: parsed.level,
              orden: ordenNivelTrabajoMSZApp(parsed.level),
            }
          : null;
      })
      .filter(
        (nivel): nivel is { texto: TechnicalLevel; orden: number } =>
          nivel !== null && Number.isFinite(nivel.orden)
      )
      .sort((a, b) => a.orden - b.orden);

    if (niveles.length === 0) return 'REVISIÓN';
    return niveles[Math.floor(niveles.length / 2)].texto;
  }

  function avisoGrupoPropuestaOcio(
    pista: 'Pequeña' | 'Grande',
    total: number
  ) {
    if (pista === 'Pequeña') {
      if (total < 3)
        return 'Ratio insuficiente: en pista pequeña necesitamos al menos 3.';
      if (total > 4)
        return 'Ratio excedido: pista pequeña admite máximo 4.';
      return null;
    }

    if (total < 3)
      return 'Ratio insuficiente: grupo grande mínimo excepcional 3.';
    if (total > 7)
      return 'Ratio excedido: pista grande admite máximo 7.';
    return null;
  }

  function generarPropuestaGruposOcio() {
    if (ocioGuardandoPropuesta) return;

    const alumnosTurno = alumnosTurnoOcio(ocioTurnoVista);

    if (alumnosTurno.length === 0) {
      alert(`No hay alumnos de Ocio cargados para ${ocioTurnoVista}.`);
      return;
    }

    const alumnosSinNivelValido = alumnosTurno.filter(
      (alumno) =>
        !Number.isFinite(
          ordenNivelTrabajoMSZApp(alumno.nivel_usado || alumno.nivel)
        )
    );
    if (alumnosSinNivelValido.length > 0) {
      alert(
        `No se puede generar la propuesta: revisa el nivel individual de ${alumnosSinNivelValido
          .map((alumno) => alumno.alumno)
          .join(', ')}.`
      );
      return;
    }

    const gruposExistentes = ocioGrupos.filter(
      (grupo) =>
        grupo.activo === true &&
        textoSinAcentosGrupoApp(grupo.dia_semana || '') ===
        textoSinAcentosGrupoApp(ocioTurnoVista)
    );

    if (gruposExistentes.length > 0) {
      alert(
        `Ya existen ${gruposExistentes.length} grupos estables para ${ocioTurnoVista}. Para evitar duplicados, gestiona esos grupos o elimínalos antes de generar una estructura inicial nueva.`
      );
      return;
    }

    setOcioGenerandoPropuesta(true);

    const iniciacion = alumnosTurno.filter(
      (alumno) => {
        const orden = ordenNivelTrabajoMSZApp(
          alumno.nivel_usado || alumno.nivel
        );
        return Number.isFinite(orden) && orden <= 0;
      }
    );
    const pequena = alumnosTurno.filter((alumno) => {
      const orden = ordenNivelTrabajoMSZApp(
        alumno.nivel_usado || alumno.nivel || ''
      );
      return Number.isFinite(orden) && orden >= 1 && orden <= 2;
    });
    const grande = alumnosTurno.filter(
      (alumno) => {
        const orden = ordenNivelTrabajoMSZApp(
          alumno.nivel_usado || alumno.nivel
        );
        return Number.isFinite(orden) && orden >= 3;
      }
    );

    const nuevas: OcioGrupoPropuestaApp[] = [];
    let numeroGrupo = 1;

    const anadirBloque = (
      bloque: OcioAlumnoApp[],
      pista: 'Pequeña' | 'Grande',
      maximo: number
    ) => {
      const tamanos = repartirTamanosOcio(bloque.length, maximo);
      let cursor = 0;

      tamanos.forEach((tamano) => {
        const miembros = bloque.slice(cursor, cursor + tamano);
        cursor += tamano;

        nuevas.push({
          propuesta_id: `${ocioTurnoVista}-${numeroGrupo}-${Date.now()}`,
          nombre: `Grupo ${numeroGrupo}`,
          pista,
          nivelObjetivo: nivelObjetivoGrupoPropuestaOcio(miembros),
          punto: '',
          alumnoIds: miembros.map((alumno) => alumno.alumno_id),
          aviso: avisoGrupoPropuestaOcio(pista, miembros.length),
        });
        numeroGrupo += 1;
      });
    };

    // Iniciación queda separada por seguridad.
    anadirBloque(iniciacion, 'Pequeña', 4);
    // A y A+ son compatibles y se recomiendan juntos.
    anadirBloque(pequena, 'Pequeña', 4);
    // B y superiores: niveles próximos, priorizando nivel y después edad.
    anadirBloque(grande, 'Grande', 7);

    setOcioPropuestaGrupos(nuevas);
    setOcioGenerandoPropuesta(false);

    enfocarElementoApp('ocio-propuesta-grupos', {
      espera: 80,
      block: 'start',
    });
  }

  function moverAlumnoEntrePropuestasOcio(
    alumnoId: string,
    origenId: string,
    destinoId: string
  ) {
    if (!destinoId || origenId === destinoId) return;

    setOcioPropuestaGrupos((actuales) => {
      const origen = actuales.find((grupo) => grupo.propuesta_id === origenId);
      const destino = actuales.find((grupo) => grupo.propuesta_id === destinoId);
      if (!origen || !destino) return actuales;

      // Mantener la frontera Pequeña / Grande para no crear mezclas técnicas
      // accidentales. El coordinador sigue pudiendo mover dentro de la misma pista.
      if (origen.pista !== destino.pista) {
        alert(
          'Para seguridad, el recomendador no permite mover automáticamente entre pista pequeña y grande. Si necesitas una excepción, edita después el grupo estable.'
        );
        return actuales;
      }

      const actualizados = actuales.map((grupo) => {
        let ids = [...grupo.alumnoIds];

        if (grupo.propuesta_id === origenId) {
          ids = ids.filter((id) => id !== alumnoId);
        }
        if (
          grupo.propuesta_id === destinoId &&
          !ids.includes(alumnoId)
        ) {
          ids.push(alumnoId);
        }

        const miembros = ids
          .map((id) => ocioAlumnos.find((alumno) => alumno.alumno_id === id))
          .filter(Boolean) as OcioAlumnoApp[];

        return {
          ...grupo,
          alumnoIds: ids,
          nivelObjetivo: nivelObjetivoGrupoPropuestaOcio(miembros),
          aviso: avisoGrupoPropuestaOcio(grupo.pista, ids.length),
        };
      });

      return actualizados;
    });
  }

  function cambiarPuntoPropuestaOcio(propuestaId: string, punto: string) {
    setOcioPropuestaGrupos((actuales) =>
      actuales.map((grupo) =>
        grupo.propuesta_id === propuestaId ? { ...grupo, punto } : grupo
      )
    );
  }

  function crearGrupoVacioPropuestaOcio() {
    setOcioPropuestaGrupos((actuales) => {
      const siguienteNumero =
        actuales.reduce((maximo, grupo) => {
          const coincidencia = grupo.nombre.match(/Grupo\s+(\d+)/i);
          const numero = coincidencia ? Number(coincidencia[1]) : 0;
          return Math.max(maximo, numero);
        }, 0) + 1;

      const nuevo: OcioGrupoPropuestaApp = {
        propuesta_id: `${ocioTurnoVista}-manual-${Date.now()}`,
        nombre: `Grupo ${siguienteNumero}`,
        pista: 'Grande',
        nivelObjetivo: 'B+',
        punto: '5',
        alumnoIds: [],
        aviso: avisoGrupoPropuestaOcio('Grande', 0),
      };

      return [...actuales, nuevo];
    });

    enfocarElementoApp('ocio-propuesta-grupos', {
      espera: 80,
      block: 'end',
    });
  }

  function cambiarPistaPropuestaOcio(
    propuestaId: string,
    pista: 'Pequeña' | 'Grande'
  ) {
    setOcioPropuestaGrupos((actuales) =>
      actuales.map((grupo) => {
        if (grupo.propuesta_id !== propuestaId) return grupo;

        const miembros = grupo.alumnoIds
          .map((id) => ocioAlumnos.find((alumno) => alumno.alumno_id === id))
          .filter(Boolean) as OcioAlumnoApp[];

        return {
          ...grupo,
          pista,
          nivelObjetivo:
            miembros.length > 0
              ? nivelObjetivoGrupoPropuestaOcio(miembros)
              : grupo.nivelObjetivo,
          aviso: avisoGrupoPropuestaOcio(pista, miembros.length),
        };
      })
    );
  }

  function eliminarGrupoVacioPropuestaOcio(propuestaId: string) {
    setOcioPropuestaGrupos((actuales) => {
      const grupo = actuales.find(
        (item) => item.propuesta_id === propuestaId
      );
      if (!grupo || grupo.alumnoIds.length > 0) {
        alert('Mueve primero los alumnos de este grupo antes de eliminarlo.');
        return actuales;
      }

      return actuales.filter(
        (item) => item.propuesta_id !== propuestaId
      );
    });
  }

  async function crearGruposEstablesDesdePropuestaOcio() {
    if (ocioGuardandoPropuesta || ocioPropuestaGrupos.length === 0) return;

    const invalidos = ocioPropuestaGrupos.filter((grupo) => grupo.aviso);
    if (invalidos.length > 0) {
      alert(
        'Hay grupos con ratio no válido. Revisa la propuesta antes de crear los grupos estables.'
      );
      return;
    }

    const gruposExistentes = ocioGrupos.filter(
      (grupo) =>
        grupo.activo === true &&
        textoSinAcentosGrupoApp(grupo.dia_semana || '') ===
        textoSinAcentosGrupoApp(ocioTurnoVista)
    );

    if (gruposExistentes.length > 0) {
      alert(
        'Ya hay grupos estables en este turno. Se ha cancelado la creación para evitar duplicados.'
      );
      return;
    }

    const totalAlumnos = ocioPropuestaGrupos.reduce(
      (total, grupo) => total + grupo.alumnoIds.length,
      0
    );

    const confirmar = window.confirm(
      `Crear ${ocioPropuestaGrupos.length} grupos estables de ${ocioTurnoVista} con ${totalAlumnos} alumnos?\n\nPodrás seguir editando puntos y alumnos después.`
    );
    if (!confirmar) return;

    setOcioGuardandoPropuesta(true);
    setError('');

    const creados: string[] = [];

    try {
      const turno = horarioTurnoOcio(ocioTurnoVista);

      for (const propuesta of ocioPropuestaGrupos) {
        const grupoId = await ejecutarFuncionAuthJson<string>(
          'crear_grupo_ocio_app',
          {
            p_anio_inicio: anioInicioTemporadaAgenda,
            p_nombre_grupo: propuesta.nombre,
            p_dia_semana: ocioTurnoVista,
            p_hora_inicio: turno.inicio,
            p_hora_fin: turno.fin,
            p_nivel_grupo: propuesta.nivelObjetivo,
            p_pista: propuesta.pista,
            p_punto_encuentro: null,
            p_observaciones: null,
          }
        );

        if (!grupoId || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(grupoId)) {
          throw new Error(
            `No se pudo recuperar el identificador de ${propuesta.nombre}.`
          );
        }

        creados.push(grupoId);

        for (const alumnoId of propuesta.alumnoIds) {
          await ejecutarFuncion('asignar_alumno_grupo_ocio_app', {
            p_grupo_id: grupoId,
            p_alumno_id: alumnoId,
          });
        }
      }

      setOcioPropuestaGrupos([]);
      await cargarOcioGrupos();
      await cargarOcioAlumnos();

      enfocarElementoApp('ocio-grupos-turno-activo', {
        espera: 100,
        block: 'start',
      });

      alert('Grupos estables creados correctamente.');
    } catch (err) {
      // Rollback funcional: si algo falla durante la creación inicial,
      // eliminamos únicamente los grupos NUEVOS creados en esta operación.
      for (const grupoId of [...creados].reverse()) {
        try {
          await ejecutarFuncion('eliminar_grupo_ocio_app', {
            p_grupo_id: grupoId,
          });
        } catch {
          // Si una limpieza falla, recargamos igualmente para mostrar el estado real.
        }
      }

      await cargarOcioGrupos();
      await cargarOcioAlumnos();

      setError(
        err instanceof Error
          ? `No se pudo crear la propuesta completa: ${err.message}`
          : 'No se pudo crear la propuesta completa.'
      );
      alert(
        'La creación no se completó. He intentado revertir únicamente los grupos nuevos de esta operación. Revisa la pantalla antes de repetir.'
      );
    } finally {
      setOcioGuardandoPropuesta(false);
    }
  }

  function abrirNuevoGrupoOcio() {
    const turno = horarioTurnoOcio(ocioTurnoVista);
    setOcioAlumnoPendienteNuevoGrupoId('');
    setOcioGrupoForm({
      ...ocioGrupoFormInicial(),
      dia: ocioTurnoVista,
      horaInicio: turno.inicio,
      horaFin: turno.fin,
    });
    setMostrarFormularioOcioGrupo(true);
  }

  function abrirNuevoGrupoOcioParaTurno(
    nivelEntrada: string,
    alumnoIdPendiente = ''
  ) {
    const turno = horarioTurnoOcio(ocioTurnoVista);
    const nivelValidado = parseTechnicalLevel(nivelEntrada);
    if (nivelValidado.status !== 'VALID') {
      setError(
        'Selecciona un nivel técnico válido antes de crear el grupo. La etiqueta del grupo no sustituye el nivel individual.'
      );
      return;
    }
    const nivel = nivelValidado.level;
    const pista =
      ordenNivelTrabajoMSZApp(nivel) >= 3 ? 'Grande' : 'Pequeña';
    const gruposMismoTurno = ocioGrupos.filter(
      (grupo) =>
        Boolean(grupo.activo) &&
        textoSinAcentosGrupoApp(grupo.dia_semana || '') ===
          textoSinAcentosGrupoApp(ocioTurnoVista) &&
        (grupo.hora_inicio || '').slice(0, 5) === turno.inicio
    );
    const siguienteNumero =
      gruposMismoTurno.reduce((maximo, grupo) => {
        const coincidencia = (grupo.nombre_grupo || '').match(/Grupo\s+(\d+)/i);
        return Math.max(maximo, coincidencia ? Number(coincidencia[1]) : 0);
      }, 0) + 1;

    setOcioAlumnoPendienteNuevoGrupoId(alumnoIdPendiente);
    setOcioGrupoForm({
      id: null,
      nombre: `Grupo ${siguienteNumero}`,
      dia: ocioTurnoVista,
      horaInicio: turno.inicio,
      horaFin: turno.fin,
      nivel,
      pista,
      punto: '5',
      observaciones: '',
    });
    setMostrarFormularioOcioGrupo(true);
    enfocarElementoApp('ocio-formulario-grupo-estable', {
      espera: 80,
      block: 'start',
    });
  }

  function abrirNuevoGrupoOcioParaAlumno(alumno: OcioAlumnoApp) {
    abrirNuevoGrupoOcioParaTurno(
      alumno.nivel_usado || alumno.nivel || '',
      alumno.alumno_id
    );
  }

  function editarGrupoOcio(grupo: OcioGrupoApp) {
    setOcioAlumnoPendienteNuevoGrupoId('');
    setOcioGrupoForm({
      id: grupo.grupo_id,
      nombre: grupo.nombre_grupo || '',
      dia: grupo.dia_semana || 'Jueves',
      horaInicio: (grupo.hora_inicio || '18:00').slice(0, 5),
      horaFin: (grupo.hora_fin || '20:00').slice(0, 5),
      nivel: grupo.nivel_grupo || 'A',
      pista: grupo.pista || 'Pequeña',
      punto: '',
      observaciones: grupo.observaciones || '',
    });
    setOcioTurnoVista(
      grupo.dia_semana === 'Sábado' || grupo.dia_semana === 'Domingo'
        ? grupo.dia_semana
        : 'Jueves'
    );
    setMostrarFormularioOcioGrupo(true);
    enfocarElementoApp('ocio-formulario-grupo-estable', {
      espera: 80,
      block: 'start',
    });
  }

  async function guardarGrupoOcio() {
    if (!ocioGrupoForm.nombre.trim()) {
      alert('Pon un nombre al grupo estable de Ocio.');
      return;
    }
    setCargando(true);
    setError('');
    try {
      let grupoNuevoId: string | null = null;

      if (ocioGrupoForm.id) {
        await ejecutarFuncion('actualizar_grupo_ocio_app', {
          p_grupo_id: ocioGrupoForm.id,
          p_nombre_grupo: ocioGrupoForm.nombre.trim(),
          p_dia_semana: ocioGrupoForm.dia,
          p_hora_inicio: ocioGrupoForm.horaInicio,
          p_hora_fin: ocioGrupoForm.horaFin,
          p_nivel_grupo: ocioGrupoForm.nivel,
          p_pista: ocioGrupoForm.pista,
          p_punto_encuentro: null,
          p_observaciones: ocioGrupoForm.observaciones || null,
        });
      } else {
        grupoNuevoId = await ejecutarFuncionAuthJson<string>(
          'crear_grupo_ocio_app',
          {
            p_anio_inicio: anioInicioTemporadaAgenda,
            p_nombre_grupo: ocioGrupoForm.nombre.trim(),
            p_dia_semana: ocioGrupoForm.dia,
            p_hora_inicio: ocioGrupoForm.horaInicio,
            p_hora_fin: ocioGrupoForm.horaFin,
            p_nivel_grupo: ocioGrupoForm.nivel,
            p_pista: ocioGrupoForm.pista,
            p_punto_encuentro: null,
            p_observaciones: ocioGrupoForm.observaciones || null,
          }
        );

        if (
          !grupoNuevoId ||
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            grupoNuevoId
          )
        ) {
          throw new Error('No se pudo recuperar el identificador del grupo estable creado.');
        }

        if (ocioAlumnoPendienteNuevoGrupoId) {
          await ejecutarFuncion('asignar_alumno_grupo_ocio_app', {
            p_grupo_id: grupoNuevoId,
            p_alumno_id: ocioAlumnoPendienteNuevoGrupoId,
          });
        }
      }

      setMostrarFormularioOcioGrupo(false);
      setOcioGrupoForm(ocioGrupoFormInicial());
      setOcioAlumnoPendienteNuevoGrupoId('');
      await cargarOcioGrupos();
      await cargarOcioAlumnos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error guardando grupo Ocio'
      );
    }
    setCargando(false);
  }

  async function eliminarGrupoOcio(grupo: OcioGrupoApp) {
    const confirmar = window.confirm(
      `¿Eliminar ${grupo.nombre_grupo}? Se quitarán sus alumnos del grupo estable.`
    );
    if (!confirmar) return;
    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('eliminar_grupo_ocio_app', {
        p_grupo_id: grupo.grupo_id,
      });
      await cargarOcioGrupos();
      await cargarOcioAlumnos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error eliminando grupo Ocio'
      );
    }
    setCargando(false);
  }

  async function asignarAlumnoGrupoOcio(alumnoId: string, grupoId: string) {
    if (!grupoId) return;
    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('asignar_alumno_grupo_ocio_app', {
        p_grupo_id: grupoId,
        p_alumno_id: alumnoId,
      });
      await cargarOcioAlumnos();
      await cargarOcioGrupos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error moviendo alumno Ocio'
      );
    }
    setCargando(false);
  }

  async function quitarAlumnoGrupoOcio(
    alumnoId: string,
    grupoId: string | null
  ) {
    if (!grupoId) return;
    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('quitar_alumno_grupo_ocio_app', {
        p_grupo_id: grupoId,
        p_alumno_id: alumnoId,
      });
      await cargarOcioAlumnos();
      await cargarOcioGrupos();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error quitando alumno del grupo'
      );
    }
    setCargando(false);
  }

  async function abrirEvaluacionOcio(alumno: OcioAlumnoApp) {
    setEvaluacionOcioActivaId(alumno.alumno_id);
    setEvaluacionOcioTexto('Cargando evaluación de Ocio...');
    setCargando(true);
    setError('');
    try {
      const historial = await cargarHistorialReportesAlumnoFichaApp(
        alumno.alumno_id,
        true
      );
      const reportesOcio = historial.filter((reporte) =>
        String(reporte.modalidad || '').toUpperCase().includes('OCIO')
      );
      setEvaluacionOcioTexto(
        generarBaseEvaluacionAlumnoFichaApp(
          {
            alumno: alumno.alumno,
            nivel_actual: alumno.nivel_usado || alumno.nivel || null,
          },
          reportesOcio
        )
      );
    } catch (err) {
      setEvaluacionOcioTexto('');
      setError(
        err instanceof Error
          ? err.message
          : 'Error generando evaluación de Ocio'
      );
    }
    setCargando(false);
  }

  function abrirCentroEvaluacionOcioDesdeFicha(alumno: OcioAlumnoApp) {
    setEvaluacionOcioIndividualSeleccionadoId(alumno.alumno_id);
    setEvaluacionOcioActivaId(null);
    setEvaluacionOcioTexto('');
    setPantalla('ocioEvaluaciones');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function copiarEvaluacionOcio() {
    if (!evaluacionOcioTexto.trim()) return;
    try {
      await navigator.clipboard.writeText(evaluacionOcioTexto);
      alert(
        'Evaluación de Ocio copiada. Pégala en ChatGPT para dejarla bonita para los padres.'
      );
    } catch {
      window.prompt('Copia esta evaluación:', evaluacionOcioTexto);
    }
  }

  function abrirPrevisualizacionWhatsapp(
    titulo: string,
    texto: string,
    telefonoDestino?: string,
    grupoWhatsapp?: WhatsappGroupContext & { enlace: string }
  ) {
    try {
      setWhatsappPreview(buildWhatsappPreview({
        title: titulo,
        text: texto,
        destinationPhone: telefonoDestino,
        group: grupoWhatsapp,
      }));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No hay mensaje de WhatsApp para revisar todavía.');
    }
  }

  function abrirWhatsappDesdePrevisualizacion() {
    if (!whatsappPreview?.texto.trim()) return;

    const telefono = normalizarTelefonoWhatsappApp(
      whatsappPreview.telefonoDestino
    );

    if (!telefono) {
      setError(
        'Este mensaje no tiene un teléfono de destino válido. Puedes copiarlo manualmente.'
      );
      return;
    }

    window.open(whatsappDirectUrl(telefono, whatsappPreview.texto), '_blank', 'noopener,noreferrer');
  }

  async function copiarWhatsappPrevisualizado() {
    if (!whatsappPreview?.texto.trim()) return;

    try {
      await navigator.clipboard.writeText(whatsappPreview.texto);
      alert('WhatsApp copiado. Revisa que lo pegas en el grupo correcto.');
    } catch {
      window.prompt('Copia este WhatsApp:', whatsappPreview.texto);
    }
  }

  function copiarWhatsappOcioTurno(
    dia: 'Jueves' | 'Sábado' | 'Domingo'
  ) {
    const turno = horarioTurnoOcio(dia);
    const gruposDia = ocioGrupos
      .filter(
        (grupo) =>
          textoSinAcentosGrupoApp(grupo.dia_semana || '') ===
            textoSinAcentosGrupoApp(dia) &&
          (grupo.hora_inicio || '').slice(0, 5) === turno.inicio
      )
      .sort((a, b) =>
        (a.nombre_grupo || '').localeCompare(b.nombre_grupo || '', 'es')
      );

    if (gruposDia.length === 0) {
      setError('No hay grupos estables creados en este turno.');
      return;
    }

    let mensaje = `*${dia.toUpperCase()} · OCIO* ⛷️💨\n`;
    mensaje += `⏰ horario de ${turno.inicio} a ${turno.fin} MSZ\n\n`;

    gruposDia.forEach((grupo) => {
      const miembros = ocioAlumnos
        .filter((alumno) => alumno.grupo_id === grupo.grupo_id)
        .map((alumno) => nombreAlumnoWhatsappPapis(alumno.alumno))
        .filter(Boolean);

      const resultadoSemanal = ocioSemanaResultados.find(
        (resultado) =>
          resultado.grupo_estable === grupo.nombre_grupo &&
          (resultado.hora_inicio || '').slice(0, 5) === turno.inicio
      );

      const entrenadores = resultadoSemanal?.grupo_id
        ? nombresEntrenadoresDelGrupo(
            resultadoSemanal.grupo_id,
            resultadoSemanal.entrenador
          )
        : resultadoSemanal?.entrenador || 'ENTRENADOR PENDIENTE';

      mensaje += `⛷️ ${(
        entrenadoresWhatsappPapis(entrenadores) || 'ENTRENADOR PENDIENTE'
      ).toUpperCase()}\n`;
      mensaje += `📍${grupo.punto_encuentro || '-'}\n`;
      mensaje += '👶\n';
      miembros.forEach((nombre) => {
        mensaje += `${nombre}\n`;
      });
      mensaje += '\n';
    });

    mensaje += '¡Nos vemos en MSZ equipo!\n';
    mensaje += '⚠️Papis importante!\n';
    mensaje += `Como la logística con los peques se puede complicar un poco, os recomiendo estar 20-25 minutos antes de la hora de entrada ya que a las ${turno.inicio} el grupo estará entrando en pista con su entrenador.\n`;
    mensaje +=
      'Si alguno llegáis tarde, avisad en este número: Jose +34 647 027 692';

    const contextoWhatsapp = contextoWhatsappOcioGlobalApp();
    abrirPrevisualizacionWhatsapp(
      `WhatsApp padres Ocio · ${dia} ${turno.inicio}-${turno.fin}`,
      mensaje,
      undefined,
      {
        clave: contextoWhatsapp.clave,
        modalidad: contextoWhatsapp.modalidad,
        referencia: contextoWhatsapp.referencia,
        nombre: contextoWhatsapp.nombre,
        enlace: enlaceWhatsappPorClaveApp(contextoWhatsapp.clave),
      }
    );
  }

  function avisoEvolucionAlumnoOcio(
    alumnoOcio: OcioAlumnoApp,
    grupoActual: OcioGrupoApp
  ) {
    const resumen = alumnos.find(
      (registro) => registro.alumno_id === alumnoOcio.alumno_id
    );

    const nivelActual =
      resumen?.nivel_actual ||
      resumen?.ultimo_nivel_reportado ||
      resumen?.nivel_estimado ||
      alumnoOcio.nivel_usado ||
      alumnoOcio.nivel ||
      '';

    if (!nivelActual) return null;

    const compatibilidadActual = compatibilidadGrupoEstableOcioApp(
      grupoActual,
      nivelActual
    );

    if (compatibilidadActual.estado === 'RECOMENDADO') return null;

    const alternativas = ocioGrupos
      .filter(
        (grupo) =>
          grupo.grupo_id !== grupoActual.grupo_id &&
          Boolean(grupo.activo)
      )
      .map((grupo) =>
        evaluarEncajeGrupoEstableOcio(grupo, nivelActual, false)
      )
      .filter((opcion) => opcion.estado === 'RECOMENDADO')
      .sort((a, b) => b.score - a.score);

    const mejor = alternativas[0];

    return {
      alumno: alumnoOcio.alumno,
      nivelActual,
      estadoActual: compatibilidadActual.estado,
      grupoSugerido: mejor?.grupo || null,
      motivo: compatibilidadActual.motivo,
    };
  }

  function copiarWhatsappOcioGrupo(grupo: OcioGrupoApp) {
    const horaInicio = (grupo.hora_inicio || '').slice(0, 5);
    const horaFin = (grupo.hora_fin || '').slice(0, 5);
    const alumnosGrupo = (grupo.alumnos_lista || '')
      .split(' || ')
      .map((linea) => nombreAlumnoWhatsappPapis(linea))
      .filter(Boolean);

    let mensaje = `*${(grupo.dia_semana || '').toUpperCase()} · OCIO* ⛷️💨\n`;
    mensaje += `⏰ horario de ${horaInicio} a ${horaFin} MSZ\n\n`;
    mensaje += '⛷️ ENTRENADOR\n';
    mensaje += `📍${grupo.punto_encuentro || '-'}\n`;
    mensaje += '👶\n';
    mensaje += `${alumnosGrupo.join('\n')}\n\n`;
    mensaje += '¡Nos vemos en MSZ equipo!\n';
    mensaje += '⚠️Papis importante!\n';
    mensaje += `Como la logística con los peques se puede complicar un poco, os recomiendo estar 20-25 minutos antes de la hora de entrada ya que a las ${horaInicio} el grupo estará entrando en pista con su entrenador.\n`;
    mensaje +=
      'Si alguno llegáis tarde, avisad en este número: Jose +34 647 027 692';

    const contextoWhatsapp = contextoWhatsappOcioGlobalApp();
    abrirPrevisualizacionWhatsapp(
      `WhatsApp padres Ocio · ${
        grupo.dia_semana || ''
      } ${horaInicio}-${horaFin}`,
      mensaje,
      undefined,
      {
        clave: contextoWhatsapp.clave,
        modalidad: contextoWhatsapp.modalidad,
        referencia: contextoWhatsapp.referencia,
        nombre: contextoWhatsapp.nombre,
        enlace: enlaceWhatsappPorClaveApp(contextoWhatsapp.clave),
      }
    );
  }

  function offsetDiaOcio(dia: string | null | undefined) {
    const normalizado = (dia || '').toLowerCase();
    if (normalizado.includes('miércoles') || normalizado.includes('miercoles'))
      return 2;
    if (normalizado.includes('jueves')) return 3;
    if (normalizado.includes('viernes')) return 4;
    if (normalizado.includes('sábado') || normalizado.includes('sabado'))
      return 5;
    if (normalizado.includes('domingo')) return 6;
    return 3;
  }

  const mesesBaseAgenda = mesesTemporadaAgenda(anioInicioTemporadaAgenda);
  const mesesAgenda = mesesBaseAgenda;
  const opcionesTemporadaAgenda = Array.from(
    new Set(
      Array.from({ length: 12 }, (_, indice) => 2026 + indice).concat([
        temporadaInicioDefectoAgenda,
      ])
    )
  )
    .filter((anio) => anio >= 2026)
    .sort((a, b) => a - b);

  const hoyAgendaClave = claveFechaAgenda(new Date());
  const mesActualAgenda = claveMesDesdeFecha(hoyAgendaClave);

  const mesAgendaActivo =
    mesAgenda && mesesAgenda.includes(mesAgenda)
      ? mesAgenda
      : mesesAgenda.includes(mesActualAgenda)
      ? mesActualAgenda
      : mesesAgenda[0] || '';

  function semanasDelMesAgenda(claveMes: string) {
    if (!claveMes) return [];

    const [anio, mes] = claveMes.split('-').map(Number);
    const primeroMes = new Date(anio, mes - 1, 1);
    const ultimoMes = new Date(anio, mes, 0);
    const semanas: string[] = [];

    // Bloques semanales reales: siempre lunes-domingo.
    // Si el mes empieza en martes/miércoles/etc., la primera semana empieza el lunes anterior.
    // Ejemplo temporada 2026/2027: septiembre empieza con Semana 31 ago - 06 sept.
    const inicio = crearFechaAgenda(
      inicioSemanaAgenda(claveFechaAgenda(primeroMes))
    );

    while (inicio <= ultimoMes) {
      semanas.push(claveFechaAgenda(inicio));
      inicio.setDate(inicio.getDate() + 7);
    }

    return semanas;
  }

  const semanasAgenda = semanasDelMesAgenda(mesAgendaActivo);

  const semanaActualAgenda = inicioSemanaAgenda(hoyAgendaClave);

  const semanaAgendaActiva =
    semanaAgendaInicio && semanasAgenda.includes(semanaAgendaInicio)
      ? semanaAgendaInicio
      : semanasAgenda.includes(semanaActualAgenda)
      ? semanaActualAgenda
      : semanasAgenda[0] || '';

  const diasSemanaAgenda = semanaAgendaActiva
    ? diasTrabajoSemanaAgenda(semanaAgendaActiva)
    : [];

  function cambiarSemanaTrabajoApp(nuevaSemana: string) {
    setSemanaAgendaInicio(nuevaSemana);
    setAgendaDiaCompactoActivo('');
    setAgendaSesionActivaId('');
    setAgendaFormularioAbierto(false);
  }

  useEffect(() => {
    let cancelado = false;

    async function cargarEditorSemana() {
      setDiaDisponibilidadEditorAbierto(null);
      setTurnoResumenDisponibilidadAbierto(null);
      setPublicadaAtDisponibilidadEditor(null);
      setVersionPublicadaDisponibilidadEditor(0);
      setEstadoServidorDisponibilidadEditor('sin_preparar');

      if (!semanaAgendaActiva) {
        setBorradorDisponibilidadEditor(null);
        return;
      }

      let borradorLocal: BorradorDisponibilidadEditor | null = null;
      try {
        const guardado = window.localStorage.getItem(
          claveStorageDisponibilidadEditor(semanaAgendaActiva)
        );
        if (guardado) {
          const borrador = JSON.parse(guardado) as BorradorDisponibilidadEditor;
          if (
            borrador?.version === 1 &&
            borrador.semana_inicio === semanaAgendaActiva &&
            Array.isArray(borrador.dias)
          ) {
            borradorLocal = normalizarBorradorDisponibilidadEditor(borrador);
          }
        }
      } catch {
        borradorLocal = null;
      }

      try {
        const respuesta =
          await ejecutarFuncionAuthJson<RespuestaDisponibilidadEditorServidor>(
            'obtener_disponibilidad_semana_editor_app',
            { p_semana_inicio: semanaAgendaActiva }
          );

        if (cancelado) return;

        if (respuesta?.existe) {
          const borradorServidor =
            normalizarBorradorDisponibilidadEditorServidor(respuesta);
          setBorradorDisponibilidadEditor(borradorServidor);
          setEstadoServidorDisponibilidadEditor(respuesta.estado);
          setPublicadaAtDisponibilidadEditor(respuesta.publicada_at || null);
          setVersionPublicadaDisponibilidadEditor(
            Number(respuesta.version_publicada || 0)
          );
          setMensajeDisponibilidadEditor(
            respuesta.estado === 'publicado'
              ? 'Semana publicada recuperada desde Supabase.'
              : 'Borrador recuperado desde Supabase.'
          );
          window.localStorage.setItem(
            claveStorageDisponibilidadEditor(semanaAgendaActiva),
            JSON.stringify(borradorServidor)
          );
          return;
        }
      } catch (err) {
        if (cancelado) return;
        const mensaje = err instanceof Error ? err.message : '';
        setMensajeDisponibilidadEditor(
          borradorLocal
            ? `Borrador local recuperado. Supabase todavía no está conectado${
                mensaje ? `: ${mensaje}` : '.'
              }`
            : 'No se pudo conectar con Supabase. Se ha preparado una copia local sin publicar.'
        );
      }

      if (cancelado) return;
      setBorradorDisponibilidadEditor(
        borradorLocal || crearBorradorDisponibilidadEditor(semanaAgendaActiva)
      );
      if (!borradorLocal) {
        setMensajeDisponibilidadEditor((actual) =>
          actual || 'Plantilla semanal preparada.'
        );
      }
    }

    void cargarEditorSemana();

    return () => {
      cancelado = true;
    };
  }, [semanaAgendaActiva]);

  function actualizarBorradorDisponibilidadEditor(
    actualizar: (actual: BorradorDisponibilidadEditor) => BorradorDisponibilidadEditor
  ) {
    setBorradorDisponibilidadEditor((actual) =>
      actual
        ? {
            ...actualizar(actual),
            actualizado_en: null,
            estado: 'Borrador',
          }
        : actual
    );
    setMensajeDisponibilidadEditor('Cambios sin guardar.');
  }

  function activarDiaDisponibilidadEditor(fecha: string, activo: boolean) {
    actualizarBorradorDisponibilidadEditor((actual) => ({
      ...actual,
      dias: actual.dias.map((dia) => {
        if (dia.fecha !== fecha) return dia;
        const turnos =
          activo && dia.turnos.length === 0
            ? [turnoInicialDisponibilidadEditor(dia.nombre)]
            : dia.turnos;
        return { ...dia, activo, turnos };
      }),
    }));

    setDiaDisponibilidadEditorAbierto((actual) =>
      activo ? fecha : actual === fecha ? null : actual
    );
  }

  function añadirTurnoDisponibilidadEditor(fecha: string) {
    actualizarBorradorDisponibilidadEditor((actual) => ({
      ...actual,
      dias: actual.dias.map((dia) => {
        if (dia.fecha !== fecha) return dia;
        if (!diaPermiteVariosTurnosDisponibilidadEditor(dia.nombre)) {
          return {
            ...dia,
            activo: true,
            turnos:
              dia.turnos.length > 0
                ? dia.turnos.slice(0, 1)
                : [turnoInicialDisponibilidadEditor(dia.nombre)],
          };
        }

        return {
          ...dia,
          activo: true,
          turnos: [
            ...dia.turnos,
            turnoInicialDisponibilidadEditor(dia.nombre),
          ],
        };
      }),
    }));
    setDiaDisponibilidadEditorAbierto(fecha);
  }

  function actualizarTurnoDisponibilidadEditor(
    fecha: string,
    turnoId: string,
    cambios: Partial<TurnoDisponibilidadEditor>
  ) {
    actualizarBorradorDisponibilidadEditor((actual) => ({
      ...actual,
      dias: actual.dias.map((dia) =>
        dia.fecha === fecha
          ? {
              ...dia,
              turnos: dia.turnos.map((turno) =>
                turno.id === turnoId ? { ...turno, ...cambios } : turno
              ),
            }
          : dia
      ),
    }));
  }

  function alternarModalidadDisponibilidadEditor(
    fecha: string,
    turnoId: string,
    modalidad: ModalidadDisponibilidadEditor
  ) {
    const dia = borradorDisponibilidadEditor?.dias.find(
      (item) => item.fecha === fecha
    );
    const turno = dia?.turnos.find((item) => item.id === turnoId);
    if (!turno) return;

    const modalidades = turno.modalidades.includes(modalidad)
      ? turno.modalidades.filter((item) => item !== modalidad)
      : [...turno.modalidades, modalidad];

    actualizarTurnoDisponibilidadEditor(fecha, turnoId, {
      modalidades: modalidades.length > 0 ? modalidades : [modalidad],
    });
  }

  function duplicarTurnoDisponibilidadEditor(
    fecha: string,
    turnoId: string
  ) {
    actualizarBorradorDisponibilidadEditor((actual) => ({
      ...actual,
      dias: actual.dias.map((dia) => {
        if (dia.fecha !== fecha) return dia;
        if (!diaPermiteVariosTurnosDisponibilidadEditor(dia.nombre)) {
          return { ...dia, turnos: dia.turnos.slice(0, 1) };
        }

        const indice = dia.turnos.findIndex((turno) => turno.id === turnoId);
        if (indice < 0) return dia;
        const copia = {
          ...dia.turnos[indice],
          id: idTurnoDisponibilidadEditor(),
        };
        const turnos = [...dia.turnos];
        turnos.splice(indice + 1, 0, copia);
        return { ...dia, turnos };
      }),
    }));
  }

  function eliminarTurnoDisponibilidadEditor(
    fecha: string,
    turnoId: string
  ) {
    actualizarBorradorDisponibilidadEditor((actual) => ({
      ...actual,
      dias: actual.dias.map((dia) => {
        if (dia.fecha !== fecha) return dia;
        if (!diaPermiteVariosTurnosDisponibilidadEditor(dia.nombre)) {
          return dia;
        }

        const turnos = dia.turnos.filter((turno) => turno.id !== turnoId);
        return { ...dia, turnos, activo: turnos.length > 0 && dia.activo };
      }),
    }));
  }


  async function guardarBorradorDisponibilidadEditor(): Promise<boolean> {
    if (!borradorDisponibilidadEditor || guardandoDisponibilidadEditor) {
      return false;
    }

    const normalizado = normalizarBorradorDisponibilidadEditor(
      borradorDisponibilidadEditor
    );
    const errorValidacion = validarBorradorDisponibilidadEditor(normalizado);
    if (errorValidacion) {
      alert(errorValidacion);
      return false;
    }

    setGuardandoDisponibilidadEditor(true);
    setMensajeDisponibilidadEditor('Guardando borrador en Supabase...');

    try {
      const respuesta =
        await ejecutarFuncionAuthJson<RespuestaDisponibilidadEditorServidor>(
          'guardar_borrador_disponibilidad_semana_editor_app',
          {
            p_semana_inicio: normalizado.semana_inicio,
            p_fecha_limite: normalizado.fecha_limite,
            p_dias: normalizado.dias,
          }
        );

      const guardado = normalizarBorradorDisponibilidadEditorServidor(
        respuesta
      );
      window.localStorage.setItem(
        claveStorageDisponibilidadEditor(guardado.semana_inicio),
        JSON.stringify(guardado)
      );
      setBorradorDisponibilidadEditor(guardado);
      setEstadoServidorDisponibilidadEditor('borrador');
      setPublicadaAtDisponibilidadEditor(respuesta.publicada_at || null);
      setVersionPublicadaDisponibilidadEditor(
        Number(respuesta.version_publicada || 0)
      );
      setMensajeDisponibilidadEditor(
        'Borrador guardado en Supabase y protegido en este navegador.'
      );
      return true;
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'No se pudo guardar el borrador.';
      setMensajeDisponibilidadEditor(`Error: ${mensaje}`);
      alert(
        `${mensaje}

Comprueba tu conexión y que sigues con la sesión iniciada.`
      );
      return false;
    } finally {
      setGuardandoDisponibilidadEditor(false);
    }
  }

  async function publicarDisponibilidadEditor() {
    if (!borradorDisponibilidadEditor || publicandoDisponibilidadEditor) return;

    const errorValidacion = validarBorradorDisponibilidadEditor(
      borradorDisponibilidadEditor
    );
    if (errorValidacion) {
      alert(errorValidacion);
      return;
    }

    const confirmar = window.confirm(
      `¿Publicar la disponibilidad de la semana ${rangoSemanaAgenda(
        borradorDisponibilidadEditor.semana_inicio
      )}?

${resumenBorradorDisponibilidadEditor.dias} días · ${
        resumenBorradorDisponibilidadEditor.turnos
      } turnos
Límite: ${formatearFechaHoraDisponibilidadEditor(
        borradorDisponibilidadEditor.fecha_limite
      )}

La Vista entrenador recibirá esta publicación inmediatamente.${
        versionPublicadaDisponibilidadEditor > 0
          ? '\n\nATENCIÓN: al volver a publicar se reiniciarán las respuestas de esta semana para que todos confirmen de nuevo los horarios.'
          : ''
      }`
    );
    if (!confirmar) return;

    setPublicandoDisponibilidadEditor(true);
    setMensajeDisponibilidadEditor('Guardando y publicando semana...');

    try {
      const guardado = await guardarBorradorDisponibilidadEditor();
      if (!guardado) return;

      const respuesta =
        await ejecutarFuncionAuthJson<RespuestaDisponibilidadEditorServidor>(
          'publicar_disponibilidad_semana_editor_app',
          { p_semana_inicio: borradorDisponibilidadEditor.semana_inicio }
        );

      const publicado = normalizarBorradorDisponibilidadEditorServidor(
        respuesta
      );
      window.localStorage.setItem(
        claveStorageDisponibilidadEditor(publicado.semana_inicio),
        JSON.stringify(publicado)
      );
      setBorradorDisponibilidadEditor(publicado);
      setEstadoServidorDisponibilidadEditor('publicado');
      setPublicadaAtDisponibilidadEditor(respuesta.publicada_at || null);
      setVersionPublicadaDisponibilidadEditor(
        Number(respuesta.version_publicada || 1)
      );
      let resumenPush: MiticoPushActionResult | null = null;
      try {
        resumenPush = await ejecutarPushMiticoApp('availability_opened', {
          semana_inicio: publicado.semana_inicio,
        });
      } catch (errorPush) {
        console.warn(
          'Disponibilidad publicada, pero el aviso push no pudo enviarse:',
          errorPush
        );
      }

      setMensajeDisponibilidadEditor(
        resumenPush
          ? `Disponibilidad publicada · ${Number(
              resumenPush.sent || 0
            )} entrenador(es) avisados por push.`
          : 'Disponibilidad publicada y enviada a la Vista entrenador. Aviso push pendiente de configuración o revisión.'
      );
      setVistaPreviaDisponibilidadEditor(false);
      await cargarDisponibilidad();
      alert(
        resumenPush
          ? `Disponibilidad publicada. Avisos push enviados: ${Number(
              resumenPush.sent || 0
            )}. Sin avisos activados: ${Number(
              resumenPush.without_subscription || 0
            )}.`
          : 'Disponibilidad publicada. Los entrenadores ya pueden responder desde su panel. El push no ha podido confirmarse.'
      );
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'No se pudo publicar la semana.';
      setMensajeDisponibilidadEditor(`Error publicando: ${mensaje}`);
      alert(mensaje);
    } finally {
      setPublicandoDisponibilidadEditor(false);
    }
  }

  async function retirarDisponibilidadEditor() {
    if (
      !borradorDisponibilidadEditor ||
      retirandoDisponibilidadEditor ||
      estadoServidorDisponibilidadEditor !== 'publicado'
    ) {
      return;
    }

    const semanaInicio = borradorDisponibilidadEditor.semana_inicio;
    const confirmar = window.confirm(
      `¿Retirar completamente la disponibilidad de la semana ${rangoSemanaAgenda(
        semanaInicio
      )}?

Los entrenadores dejarán de verla inmediatamente y se borrarán sus respuestas de disponibilidad de esa semana.

NO se borrarán grupos, reportes, asistencia ni cobros.`
    );

    if (!confirmar) return;

    const confirmarFinal = window.confirm(
      'Confirmación final: esta acción elimina la publicación, sus turnos y las respuestas recibidas. ¿Continuar?'
    );

    if (!confirmarFinal) return;

    setRetirandoDisponibilidadEditor(true);
    setMensajeDisponibilidadEditor('Retirando disponibilidad publicada...');

    try {
      await ejecutarFuncionAuthJson<{ eliminado: boolean }>(
        'retirar_disponibilidad_semana_editor_app',
        { p_semana_inicio: semanaInicio }
      );

      window.localStorage.removeItem(
        claveStorageDisponibilidadEditor(semanaInicio)
      );

      const plantillaLimpia =
        crearBorradorDisponibilidadEditor(semanaInicio);

      setBorradorDisponibilidadEditor(plantillaLimpia);
      setEstadoServidorDisponibilidadEditor('sin_preparar');
      setPublicadaAtDisponibilidadEditor(null);
      setVersionPublicadaDisponibilidadEditor(0);
      setDiaDisponibilidadEditorAbierto(null);
      setTurnoResumenDisponibilidadAbierto(null);
      setVistaPreviaDisponibilidadEditor(false);
      setMensajeDisponibilidadEditor(
        'Disponibilidad retirada. La semana vuelve a estar sin publicar.'
      );

      await cargarDisponibilidad(semanaInicio);

      alert(
        'Disponibilidad retirada. Los entrenadores ya no verán esa publicación.'
      );
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : 'No se pudo retirar la disponibilidad.';
      setMensajeDisponibilidadEditor(`Error retirando: ${mensaje}`);
      alert(mensaje);
    } finally {
      setRetirandoDisponibilidadEditor(false);
    }
  }

  function restaurarPlantillaDisponibilidadEditor() {
    if (!semanaAgendaActiva) return;
    const confirmar = window.confirm(
      '¿Restaurar la plantilla habitual? Se perderán los cambios no guardados de esta semana.'
    );
    if (!confirmar) return;
    const plantilla = crearBorradorDisponibilidadEditor(semanaAgendaActiva);
    setBorradorDisponibilidadEditor(plantilla);
    setDiaDisponibilidadEditorAbierto(null);
    setMensajeDisponibilidadEditor('Plantilla habitual restaurada.');
  }

  const resumenBorradorDisponibilidadEditor =
    borradorDisponibilidadEditor?.dias.reduce(
      (resumen, dia) => {
        if (!dia.activo) return resumen;
        resumen.dias += 1;
        resumen.turnos += dia.turnos.length;
        return resumen;
      },
      { dias: 0, turnos: 0 }
    ) || { dias: 0, turnos: 0 };

  function fechaGrupoOcioSemana(grupo: OcioGrupoApp) {
    const semana = semanaAgendaActiva || semanaActualAgenda;
    if (!semana) return '';
    const fecha = crearFechaAgenda(semana);
    fecha.setDate(fecha.getDate() + offsetDiaOcio(grupo.dia_semana));
    return claveFechaAgenda(fecha);
  }

  function lunesSemanaOcioActiva() {
    return semanaAgendaActiva || semanaActualAgenda || '';
  }

  function domingoSemanaOcioActiva() {
    const semana = lunesSemanaOcioActiva();
    if (!semana) return '';
    const fecha = crearFechaAgenda(semana);
    fecha.setDate(fecha.getDate() + 6);
    return claveFechaAgenda(fecha);
  }

  function cambiosOcioSemanaActiva() {
    const inicio = lunesSemanaOcioActiva();
    const fin = domingoSemanaOcioActiva();
    return activeOcioRelocationsForWindow(ocioCambiosPuntuales, inicio, fin);
  }

  function cambioEntradaOcio(
    alumnoId: string,
    grupoId: string | null | undefined
  ) {
    return findOcioRelocationEntry(
      cambiosOcioSemanaActiva(),
      alumnoId,
      grupoId
    );
  }

  function cambioSalidaOcio(
    alumnoId: string,
    grupoId: string | null | undefined
  ) {
    return findOcioRelocationExit(
      cambiosOcioSemanaActiva(),
      alumnoId,
      grupoId
    );
  }

  function alumnosGrupoOcioEstable(grupoId: string | null | undefined) {
    return applyOcioRelocationsToStableGroup(
      grupoId,
      ocioAlumnos,
      cambiosOcioSemanaActiva()
    );
  }

  function claveAsistenciaOcioSemana(alumnoId: string) {
    return `${
      semanaAgendaActiva || semanaActualAgenda || 'sin_semana'
    }__${alumnoId}`;
  }

  function alumnoVieneOcioSemana(alumnoId: string) {
    const alumno = ocioAlumnos.find((item) => item.alumno_id === alumnoId);
    if (!alumno) return false;
    const turno = horarioTurnoOcio(ocioTurnoVista);
    return ocioStudentComesFromAimHarder(
      ocioAimHarderSemana,
      semanaAgendaActiva || semanaActualAgenda || '',
      ocioTurnoVista,
      turno.inicio,
      turno.fin,
      alumno.alumno
    );
  }

  function cambiarAsistenciaOcioSemana(alumnoId: string, viene: boolean) {
    const clave = claveAsistenciaOcioSemana(alumnoId);
    setOcioSemanaAsistencia((anterior) => ({ ...anterior, [clave]: viene }));
  }

  function diaFijoOcioDesdeFecha(
    fechaIso: string
  ): '' | 'Jueves' | 'Sábado' | 'Domingo' {
    if (!fechaIso) return '';
    const dia = crearFechaAgenda(fechaIso).getDay();
    if (dia === 4) return 'Jueves';
    if (dia === 6) return 'Sábado';
    if (dia === 0) return 'Domingo';
    return '';
  }

  function abrirAltaTestDesdeOcioAimHarder(
    asistente: OcioAimHarderAsistenteApp,
    turno: OcioAimHarderTurnoApp
  ) {
    setFormAltaNivelInicial({
      ...altaNivelInicialFormVacioApp(),
      nombre: asistente.nombre || '',
      fechaNacimiento: asistente.fechaNacimiento || '',
      telefono: asistente.telefono || '',
      modalidad: 'OCIO',
      ocioDiaFijo: diaFijoOcioDesdeFecha(turno.fecha),
    });
    setMostrarFormularioAltaNivel(true);
    setPantalla('administracion');

    if (!asistente.telefono || !asistente.fechaNacimiento) {
      setError(
        'AimHarder ha identificado al alumno de Ocio, pero falta teléfono o fecha de nacimiento. Revisa esos datos antes de crear el Alta TEST.'
      );
    } else {
      setError('');
    }

    window.setTimeout(() => {
      contenidoPantallaRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }

  function aplicarSemanaOcioDesdeAimHarder(datos: OcioAimHarderSemanaApp) {
    const semanaActual = lunesSemanaOcioActiva();
    try {
      const resultado = buildOcioAttendanceState(
        ocioSemanaAsistencia,
        semanaActual,
        datos,
        ocioGrupos.filter(esTurnoOficialOcio).map((grupo) => ({
          groupId: grupo.grupo_id,
          date: fechaGrupoOcioSemana(grupo),
          start: grupo.hora_inicio,
          end: grupo.hora_fin,
          students: alumnosGrupoOcioEstable(grupo.grupo_id).map((alumno) => ({
            studentId: alumno.alumno_id,
            name: alumno.alumno,
          })),
        }))
      );
      setOcioSemanaAsistencia(resultado.attendance);
      setOcioAimHarderSemana(datos);
      setOcioAimHarderMensaje(resultado.message);
      setOcioAimHarderError('');
    } catch (errorPlan) {
      setOcioAimHarderError(
        errorPlan instanceof Error
          ? errorPlan.message
          : 'No se ha podido aplicar la semana de AimHarder.'
      );
    }
  }


  async function actualizarSemanaOcioDesdeAimHarder() {
    const semanaInicio = lunesSemanaOcioActiva();
    if (!semanaInicio) {
      setOcioAimHarderError('Selecciona primero la semana de Ocio.');
      return;
    }

    setOcioAimHarderCargando(true);
    setOcioAimHarderMensaje('');
    setOcioAimHarderError('');

    try {
      const datos = await readOcioAimHarderWeek(semanaInicio);
      const alumnosMaestroActuales =
        alumnos.length > 0
          ? alumnos
          : await consultarSupabase<AlumnoResumen>(
              'v_resumen_alumno_v2',
              'select=*&order=alumno.asc'
            );

      setOcioAimHarderEstadoAlumnos(
        buildOcioAimHarderStudentStates(datos.turnos, alumnosMaestroActuales)
      );
      await cargarOcioAlumnos();
      aplicarSemanaOcioDesdeAimHarder(datos);
    } catch (e) {
      setOcioAimHarderError(
        e instanceof Error
          ? e.message
          : 'No se pudo actualizar Ocio desde AimHarder.'
      );
    } finally {
      setOcioAimHarderCargando(false);
    }
  }

  function edadOcioAlumnoEnFecha(alumno: OcioAlumnoApp, fechaIso: string) {
    if (!alumno.fecha_nacimiento || !fechaIso) return null;
    const nacimiento = crearFechaAgenda(alumno.fecha_nacimiento);
    const fecha = crearFechaAgenda(fechaIso);
    let edad = fecha.getFullYear() - nacimiento.getFullYear();
    const mes = fecha.getMonth() - nacimiento.getMonth();
    if (mes < 0 || (mes === 0 && fecha.getDate() < nacimiento.getDate()))
      edad -= 1;
    return edad;
  }

  function categoriaOcioGrupo(grupo: OcioGrupoApp) {
    const fecha = fechaGrupoOcioSemana(grupo);
    const alumnosGrupo = alumnosGrupoOcioEstable(grupo.grupo_id);
    const edades = alumnosGrupo
      .map((alumno) => edadOcioAlumnoEnFecha(alumno, fecha))
      .filter((edad): edad is number => typeof edad === 'number');

    if (edades.length === 0) return 'Ocio';
    const media =
      edades.reduce((total, edad) => total + edad, 0) / edades.length;
    return media >= 7 ? 'Mayores' : 'Pequeños';
  }

  function nombreGrupoSemanalOcio(grupo: OcioGrupoApp) {
    const dia = (grupo.dia_semana || 'Ocio').toUpperCase();
    const nombreEstable =
      `${grupo.nombre_grupo || ''}`.trim() || 'Grupo';

    return `OCIO ${dia} · ${nombreEstable}`;
  }

  function trabajoDiarioBaseOcioSemana(
    grupo: OcioGrupoApp,
    composicion?: OcioAlumnoApp[]
  ) {
    const alumnosGrupo = composicion || alumnosGrupoOcioEstable(grupo.grupo_id).filter(
      (alumno) => alumnoVieneOcioSemana(alumno.alumno_id)
    );

    if (alumnosGrupo.length === 0) return '';

    const niveles = alumnosGrupo
      .map((alumno) => alumno.nivel_usado || alumno.nivel || '')
      .filter(Boolean);

    const observaciones = observacionesAutomaticasGrupoOcio(alumnosGrupo);

    const alumnosContexto = alumnosGrupo.map((alumno) =>
      contextoAlumnoTrabajoDiarioApp(
        alumno.alumno_id,
        alumno.alumno,
        alumno.nivel_usado || alumno.nivel || ''
      )
    );

    const trabajosRecientes = trabajosRecientesParaGrupoApp(
      alumnosGrupo.map((alumno) => alumno.alumno),
      fechaGrupoOcioSemana(grupo)
    );

    return trabajoDiarioMSZApp(
      grupo.nombre_grupo,
      niveles,
      grupo.pista || alumnosGrupo[0]?.grupo_pista || 'Pequeña/Grande',
      observaciones,
      alumnosContexto,
      'OCIO',
      trabajosRecientes
    );
  }

  function trabajoDiarioOcioSemana(grupo: OcioGrupoApp) {
    return trabajoDiarioBaseOcioSemana(grupo);
  }

  function observacionesBaseOcioSemana(
    grupo: OcioGrupoApp,
    composicion?: OcioAlumnoApp[]
  ) {
    const alumnosGrupo = composicion || alumnosGrupoOcioEstable(grupo.grupo_id).filter(
      (alumno) => alumnoVieneOcioSemana(alumno.alumno_id)
    );

    if (alumnosGrupo.length === 0) return '';

    return combinarObservacionesGrupoApp(
      observacionesAutomaticasGrupoOcio(alumnosGrupo),
      grupo.observaciones || null
    );
  }

  function observacionesOcioSemana(grupo: OcioGrupoApp) {
    return observacionesBaseOcioSemana(grupo);
  }

  function entrenadorSeleccionadoOcioSemana(grupoId: string) {
    return ocioSemanaEntrenadores[grupoId] || '';
  }

  function alumnosListaOcioResultadoDesdeTexto(
    texto: string | null | undefined
  ) {
    if (!texto) return [];

    return texto
      .split(/\s*\|\|\s*/)
      .map((linea) => nombreRealAlumnoListadoOperativo(linea))
      .map((nombre) => nombre.trim())
      .filter(Boolean);
  }

  async function cargarResultadosOcioSemanaDesdeSupabase() {
    const semana = semanaAgendaActiva || semanaActualAgenda;
    if (!semana) {
      setOcioSemanaResultados([]);
      return [];
    }

    const sesiones = await consultarSupabase<AgendaSesionDirectaApp>(
      'v_agenda_sesiones_operativa_app',
      'select=*&order=fecha.asc,hora_inicio.asc'
    );

    const sesionesOcio = sesiones.filter(
      (sesion) =>
        sesion.semana_inicio === semana &&
        normalizarModalidadAgenda(
          sesion.modalidad || sesion.modalidad_codigo
        ) === 'OCIO'
    );

    const resultados: OcioPrepararResultadoApp[] = [];

    for (const sesion of sesionesOcio) {
      const grupos = await consultarSupabase<AgendaGrupoSesionApp>(
        'v_grupos_sesion_operativa_app',
        `select=*&sesion_id=${encodeURIComponent(
          `eq.${sesion.sesion_id}`
        )}&order=nombre_grupo.asc`
      );

      for (const grupo of grupos) {
        resultados.push({
          grupo_estable: grupo.nombre_grupo || 'Grupo Ocio',
          fecha: sesion.fecha,
          hora_inicio: horaCorta(sesion.hora_inicio),
          hora_fin: horaCorta(sesion.hora_fin),
          alumnos: Number(grupo.total_alumnos || 0),
          entrenador: grupo.entrenador || null,
          estado: grupo.publicado
            ? 'Publicado'
            : 'Preparado · pendiente de publicar',
          sesion_id: sesion.sesion_id,
          grupo_id: grupo.grupo_id,
          punto_encuentro: grupo.punto_encuentro || null,
          publicado: Boolean(grupo.publicado),
          alumnos_lista: alumnosListaOcioResultadoDesdeTexto(
            grupo.alumnos_lista
          ),
        });
      }
    }

    setOcioSemanaResultados(resultados);
    return resultados;
  }

  function mensajeWhatsappSemanaOcio() {
    const semana = semanaAgendaActiva || semanaActualAgenda;
    if (!semana) return 'Selecciona una semana.';

    const resultadosSemana = [...ocioSemanaResultados]
      .filter((resultado) => resultado.fecha)
      .sort((a, b) =>
        `${a.fecha} ${a.hora_inicio} ${a.grupo_estable}`.localeCompare(
          `${b.fecha} ${b.hora_inicio} ${b.grupo_estable}`
        )
      );

    if (resultadosSemana.length === 0) {
      return 'Primero prepara los grupos de Ocio de esta semana.';
    }

    let mensaje = `*OCIO · SEMANA ${rangoSemanaAgenda(semana)}* ⛷️💨\n\n`;

    resultadosSemana.forEach((resultado) => {
      mensaje += `*${formatearFecha(resultado.fecha)}*\n`;
      mensaje += `⏰ horario de ${horaCorta(resultado.hora_inicio)} a ${horaCorta(
        resultado.hora_fin
      )} MSZ\n\n`;
      mensaje += `⛷️ ${resultado.entrenador || 'ENTRENADOR PENDIENTE'}\n`;
      mensaje += `📍${resultado.punto_encuentro || 'PUNTO PENDIENTE'}\n`;
      mensaje += `👶\n`;

      const nombres = resultado.alumnos_lista || [];
      if (nombres.length > 0) {
        nombres.forEach((nombre) => {
          mensaje += `${nombreAlumnoWhatsappPapis(nombre)}\n`;
        });
      } else {
        mensaje += `${resultado.alumnos} alumnos\n`;
      }
      mensaje += '\n';
    });

    const horaEntrada = horaCorta(resultadosSemana[0].hora_inicio);

    mensaje += '¡Nos vemos en MSZ equipo!\n';
    mensaje += '⚠️Papis importante!\n';
    mensaje += `Como la logística con los peques se puede complicar un poco, os recomiendo estar 20-25 minutos antes de la hora de entrada ya que a las ${horaEntrada} el grupo estará entrando en pista con su entrenador.\n`;
    mensaje +=
      'Si alguno llegáis tarde, avisad en este número: Jose +34 647 027 692';

    return mensaje;
  }

  function abrirWhatsappSemanaOcio() {
    const contextoWhatsapp = contextoWhatsappOcioGlobalApp();
    abrirPrevisualizacionWhatsapp(
      `WhatsApp padres Ocio · semana ${rangoSemanaAgenda(
        semanaAgendaActiva || semanaActualAgenda
      )}`,
      mensajeWhatsappSemanaOcio(),
      undefined,
      {
        clave: contextoWhatsapp.clave,
        modalidad: contextoWhatsapp.modalidad,
        referencia: contextoWhatsapp.referencia,
        nombre: contextoWhatsapp.nombre,
        enlace: enlaceWhatsappPorClaveApp(contextoWhatsapp.clave),
      }
    );
  }

  function resultadoPerteneceDiaOcio(
    resultado: OcioPrepararResultadoApp,
    dia: 'Jueves' | 'Sábado' | 'Domingo'
  ) {
    return ocioGrupos.some((grupo) => {
      if (
        textoSinAcentosGrupoApp(grupo.dia_semana) !==
        textoSinAcentosGrupoApp(dia)
      ) {
        return false;
      }

      const fechaGrupo = fechaGrupoOcioSemana(grupo);

      return (
        fechaGrupo === resultado.fecha &&
        horaCorta(grupo.hora_inicio) === horaCorta(resultado.hora_inicio) &&
        horaCorta(grupo.hora_fin) === horaCorta(resultado.hora_fin)
      );
    });
  }

  function gruposOcioDiaSemana(
    dia: 'Jueves' | 'Sábado' | 'Domingo'
  ) {
    return ocioGrupos.filter(
      (grupo) =>
        grupo.activo &&
        textoSinAcentosGrupoApp(grupo.dia_semana) ===
          textoSinAcentosGrupoApp(dia)
    );
  }

  async function asegurarSesionOcioSemanaCompleta(
    grupoReferencia: OcioGrupoApp | OcioWeeklyGroup,
    composicionSemanal: OcioWeeklyGroup[] = []
  ) {
    const temporal = 'weeklyGroupId' in grupoReferencia;
    const dia = (temporal ? ocioTurnoVista : grupoReferencia.dia_semana || ocioTurnoVista) as 'Jueves' | 'Sábado' | 'Domingo';
    const fecha = temporal ? grupoReferencia.date : fechaGrupoOcioSemana(grupoReferencia);
    const inicio = horaCorta(temporal ? grupoReferencia.start : grupoReferencia.hora_inicio);
    const fin = horaCorta(temporal ? grupoReferencia.end : grupoReferencia.hora_fin);

    if (!fecha) {
      throw new Error('No se ha podido calcular la fecha de Ocio.');
    }

    const gruposTurno = gruposOcioDiaSemana(dia).filter(
      (grupo) =>
        horaCorta(grupo.hora_inicio) === inicio &&
        horaCorta(grupo.hora_fin) === fin
    );

    const idsSemanales = new Set(composicionSemanal.flatMap((grupo) => grupo.studentIds));
    const alumnosTurno = temporal ? ocioAlumnos.filter((alumno) => idsSemanales.has(alumno.alumno_id)) : Array.from(
      new Map(
        gruposTurno
          .flatMap((grupo) =>
            alumnosGrupoOcioEstable(grupo.grupo_id).filter((alumno) =>
              alumnoVieneOcioSemana(alumno.alumno_id)
            )
          )
          .map((alumno) => [alumno.alumno_id, alumno] as const)
      ).values()
    );

    if (alumnosTurno.length === 0) {
      throw new Error(`No hay alumnos de ${dia} marcados como Viene.`);
    }

    const listadoCompleto = alumnosTurno
      .map((alumno) => alumno.alumno)
      .join('\n');

    const sesionResultado = await crearSesionOperativaDesdeListadoSeguroApp({
        fecha,
        horaInicio: inicio,
        horaFin: fin,
        modalidad: 'OCIO',
        lugar: 'Madrid SnowZone',
        textoListado: listadoCompleto,
      });

    const sesionId = sesionResultado[0]?.sesion_id;

    if (!sesionId) {
      throw new Error('No se pudo crear/localizar la sesión completa de Ocio.');
    }

    return {
      sesionId,
      fecha,
      inicio,
      fin,
      dia,
      gruposTurno,
      alumnosTurno,
      totalDetectados: Number(
        sesionResultado[0]?.total_detectados || alumnosTurno.length
      ),
    };
  }

  async function crearGrupoOcioOperativoEnSesion(
    grupo: OcioGrupoApp | OcioWeeklyGroup,
    sesionId: string
  ): Promise<OcioPrepararResultadoApp> {
    const temporal = 'weeklyGroupId' in grupo;
    const idsTemporales = new Set(temporal ? grupo.studentIds : []);
    const alumnosPresentes = temporal
      ? ocioAlumnos.filter((alumno) => idsTemporales.has(alumno.alumno_id))
      : alumnosGrupoOcioEstable(grupo.grupo_id).filter((alumno) =>
          alumnoVieneOcioSemana(alumno.alumno_id)
        );
    const grupoBase: OcioGrupoApp = temporal ? {
      grupo_id: grupo.sourceGroupId || grupo.weeklyGroupId,
      nombre_grupo: grupo.name,
      dia_semana: ocioTurnoVista,
      hora_inicio: grupo.start,
      hora_fin: grupo.end,
      nivel_grupo: ocioLevelRange(alumnosPresentes),
      pista: grupo.piste,
      punto_encuentro: null,
      observaciones: null,
      activo: true,
      temporada: null,
      total_alumnos: alumnosPresentes.length,
      alumnos_lista: null,
    } : grupo;

    if (alumnosPresentes.length === 0) {
      throw new Error(`No hay alumnos de AimHarder en ${grupoBase.nombre_grupo}.`);
    }

    const nombrePreparado = nombreGrupoSemanalOcio(grupoBase);
    const fecha = temporal ? grupo.date : fechaGrupoOcioSemana(grupoBase);
    const alumnosIds = alumnosPresentes.map((alumno) => alumno.alumno_id);
    const trabajoGenerado = trabajoDiarioBaseOcioSemana(grupoBase, alumnosPresentes);
    const observacionesGeneradas = observacionesBaseOcioSemana(grupoBase, alumnosPresentes);

    const gruposExistentes = await consultarSupabase<AgendaGrupoSesionApp>(
      'v_grupos_sesion_operativa_app',
      `select=*&sesion_id=${encodeURIComponent(
        `eq.${sesionId}`
      )}&order=nombre_grupo.asc`
    );

    const grupoAnterior = gruposExistentes.find(
      (item) => item.nombre_grupo === nombrePreparado
    );

    if (grupoAnterior?.grupo_id) {
      const [composicion, reportes] = await Promise.all([
        consultarSupabase<{
          alumno_id: string;
          estado_asistencia: string | null;
        }>(
          'grupo_alumnos',
          `select=alumno_id,estado_asistencia&grupo_id=${encodeURIComponent(
            `eq.${grupoAnterior.grupo_id}`
          )}`
        ),
        consultarSupabase<{ id: string }>(
          'reportes',
          `select=id&grupo_id=${encodeURIComponent(
            `eq.${grupoAnterior.grupo_id}`
          )}&limit=1`
        ),
      ]);
      const decision = decidePreparedGroupRefresh(
        {
          groupId: grupoAnterior.grupo_id,
          state: grupoAnterior.estado_grupo,
          published: Boolean(grupoAnterior.publicado),
          trainerId: grupoAnterior.entrenador_id,
          supportTrainerId: grupoAnterior.entrenador_apoyo_id,
          confirmationState: grupoAnterior.estado_confirmacion,
          piste: grupoAnterior.pista,
          meetingPoint: grupoAnterior.punto_encuentro,
          dailyWork: grupoAnterior.trabajo_diario,
          observations: grupoAnterior.observaciones_importantes,
          studentIds: composicion.map((item) => item.alumno_id),
          hasReports: reportes.length > 0,
          hasRealAttendance: composicion.some((item) =>
            ['presente', 'ausente'].includes(
              String(item.estado_asistencia || '').trim().toLowerCase()
            )
          ),
        },
        {
          studentIds: alumnosIds,
          piste: grupoBase.pista,
          meetingPoint: null,
          dailyWork: trabajoGenerado,
          observations: observacionesGeneradas,
        }
      );

      if (decision.action === 'REUSE') {
        return {
          grupo_estable: nombrePreparado,
          fecha,
          hora_inicio: horaCorta(grupoBase.hora_inicio),
          hora_fin: horaCorta(grupoBase.hora_fin),
          alumnos: composicion.length,
          entrenador: grupoAnterior.entrenador,
          estado: decision.reason,
          sesion_id: sesionId,
          grupo_id: grupoAnterior.grupo_id,
          punto_encuentro: grupoAnterior.punto_encuentro,
          publicado: grupoAnterior.publicado,
          alumnos_lista: alumnosPresentes.map((alumno) => alumno.alumno),
        };
      }
      if (decision.action === 'BLOCK') {
        throw new Error(`${nombrePreparado}: ${decision.reason}`);
      }
      await ejecutarFuncion(GROUP_OPERATION_RPC.remove, {
        p_grupo_id: grupoAnterior.grupo_id,
      });
    }

    const grupoId = await ejecutarFuncionAuthJson<string>(
      GROUP_OPERATION_RPC.create,
      {
        p_sesion_id: sesionId,
        p_nombre_grupo: nombrePreparado,
        p_nivel_grupo:
          grupoBase.nivel_grupo ||
          alumnosPresentes[0]?.nivel_usado ||
          'Ocio',
        p_pista: grupoBase.pista || null,
        p_punto_encuentro: null,
        p_trabajo_diario: trabajoGenerado,
        p_observaciones_importantes: observacionesGeneradas,
        p_entrenador_id: null,
        p_alumnos_ids: alumnosIds,
        p_publicado: false,
      }
    );

    if (!grupoId) {
      throw new Error(`No se pudo crear ${nombrePreparado}.`);
    }

    return {
      grupo_estable: nombrePreparado,
      fecha,
      hora_inicio: horaCorta(grupoBase.hora_inicio),
      hora_fin: horaCorta(grupoBase.hora_fin),
      alumnos: alumnosPresentes.length,
      entrenador: null,
      estado: 'Creado como pendiente de entrenador.',
      sesion_id: sesionId,
      grupo_id: grupoId,
      punto_encuentro: null,
      publicado: false,
      alumnos_lista: alumnosPresentes.map((alumno) => alumno.alumno),
    };
  }

  async function prepararGrupoOcioSemana(grupo: OcioGrupoApp) {
    setCargando(true);
    setError('');

    try {
      const sesion = await asegurarSesionOcioSemanaCompleta(grupo);
      const resultado = await crearGrupoOcioOperativoEnSesion(
        grupo,
        sesion.sesionId
      );

      await cargarAgendaOperativaDirecta();
      await cargarResultadosOcioSemanaDesdeSupabase();
      await cargarPlanning();
      await cargarGruposEntrenador();

      window.setTimeout(() => {
        document
          .getElementById('ocio-grupos-preparados-semana')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error preparando grupo Ocio semanal'
      );
    }

    setCargando(false);
  }

  async function abrirGrupoOcioEnTrabajoSemanal(
    resultado: OcioPrepararResultadoApp
  ) {
    setCargando(true);
    setError('');

    try {
      const sesiones = await consultarSupabase<AgendaSesionDirectaApp>(
        'v_agenda_sesiones_operativa_app',
        'select=*&order=fecha.asc,hora_inicio.asc'
      );
      setAgendaSesionesDirectas(sesiones);

      const inicioResultado = horaCorta(resultado.hora_inicio);
      const finResultado = horaCorta(resultado.hora_fin);

      const sesionCorrecta =
        sesiones.find(
          (sesion) =>
            sesion.fecha === resultado.fecha &&
            horaCorta(sesion.hora_inicio) === inicioResultado &&
            horaCorta(sesion.hora_fin) === finResultado &&
            textoSinAcentosGrupoApp(
              sesion.modalidad_codigo || sesion.modalidad || ''
            ).includes('ocio')
        ) ||
        sesiones.find(
          (sesion) =>
            sesion.fecha === resultado.fecha &&
            horaCorta(sesion.hora_inicio) === inicioResultado &&
            horaCorta(sesion.hora_fin) === finResultado
        );

      const sesionId = sesionCorrecta?.sesion_id || resultado.sesion_id;

      if (!sesionId) {
        throw new Error(
          'No he encontrado la sesión de Ocio correspondiente a esa fecha y horario.'
        );
      }

      const [anioDia, mesDia] = resultado.fecha.split('-').map(Number);
      const mesObjetivo = `${anioDia}-${String(mesDia).padStart(2, '0')}`;
      const semanaObjetivo = inicioSemanaAgenda(resultado.fecha);

      setAnioInicioTemporadaAgenda(mesDia >= 9 ? anioDia : anioDia - 1);
      setMesAgenda(mesObjetivo);
      setSemanaAgendaInicio(semanaObjetivo);
      setAgendaDiaCompactoActivo(resultado.fecha);
      setPantalla('agenda');
      setAgendaSesionActivaId(sesionId);
      setAgendaFiltroAlumnos('TODOS');
      setMostrarAlumnoFueraPlazo(false);

      await cargarDetalleSesionAgenda(sesionId);

      window.setTimeout(() => {
        document
          .getElementById('agenda-sesion-abierta')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'No se pudo abrir el grupo de Ocio.'
      );
    }

    setCargando(false);
  }

  async function deshacerPreparacionOcio(
    resultado: OcioPrepararResultadoApp
  ) {
    const confirmar = window.confirm(
      `¿DESHACER la preparación de Ocio del ${formatearFecha(
        resultado.fecha
      )} · ${horaCorta(resultado.hora_inicio)}–${horaCorta(
        resultado.hora_fin
      )}?\n\nSe eliminarán únicamente los grupos operativos de ese turno. Los grupos estables, alumnos habituales y cambios puntuales se conservan.\n\nSi ya existe asistencia real o reportes, Supabase bloqueará la operación.`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncionAuthJson<{
        ok: boolean;
        sesiones_ocio_borradas: number;
        grupos_ocio_borrados: number;
      }>('reiniciar_turno_ocio_semana_app', {
        p_fecha: resultado.fecha,
        p_hora_inicio: horaCorta(resultado.hora_inicio),
        p_hora_fin: horaCorta(resultado.hora_fin),
      });

      await cargarAgendaOperativaDirecta();
      await cargarPlanning();
      await cargarGruposEntrenador();
      await cargarCobros();
      await cargarResultadosOcioSemanaDesdeSupabase();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo deshacer la preparación de Ocio.'
      );
    } finally {
      setCargando(false);
    }
  }

  async function prepararDiaOcioSemana(
    dia: 'Jueves' | 'Sábado' | 'Domingo',
    composicionSemanal: OcioWeeklyGroup[] = []
  ) {
    const gruposConAlumnos: Array<OcioGrupoApp | OcioWeeklyGroup> = composicionSemanal.length > 0
      ? composicionSemanal.filter((grupo) => grupo.studentIds.length > 0)
      : gruposOcioDiaSemana(dia).filter((grupo) =>
      alumnosGrupoOcioEstable(grupo.grupo_id).some((alumno) =>
        alumnoVieneOcioSemana(alumno.alumno_id)
      )
    );

    if (gruposConAlumnos.length === 0) {
      setError(`No hay grupos de ${dia} con alumnos marcados como Viene.`);
      return;
    }

    const totalAlumnosEsperados = new Set(
      gruposConAlumnos.flatMap((grupo) =>
        'weeklyGroupId' in grupo ? grupo.studentIds : alumnosGrupoOcioEstable(grupo.grupo_id)
          .filter((alumno) => alumnoVieneOcioSemana(alumno.alumno_id))
          .map((alumno) => alumno.alumno_id)
      )
    ).size;

    const confirmar = window.confirm(
      `¿Preparar ${dia}?\n\n` +
        `${gruposConAlumnos.length} grupos · ${totalAlumnosEsperados} alumnos.\n\n` +
        `Se sustituirá únicamente el Ocio anterior de ese día y turno.`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    let fechaTurno = '';
    let inicioTurno = '';
    let finTurno = '';

    try {
      const grupoReferencia = gruposConAlumnos[0];
      const temporal = 'weeklyGroupId' in grupoReferencia;
      fechaTurno = temporal ? grupoReferencia.date : fechaGrupoOcioSemana(grupoReferencia);
      inicioTurno = horaCorta(temporal ? grupoReferencia.start : grupoReferencia.hora_inicio);
      finTurno = horaCorta(temporal ? grupoReferencia.end : grupoReferencia.hora_fin);

      if (!fechaTurno) {
        throw new Error(`No se ha podido calcular la fecha de ${dia}.`);
      }

      await ejecutarFuncionAuthJson<{
        ok: boolean;
        sesiones_ocio_borradas: number;
      }>('reiniciar_turno_ocio_semana_app', {
        p_fecha: fechaTurno,
        p_hora_inicio: inicioTurno,
        p_hora_fin: finTurno,
      });

      setOcioSemanaResultados((anteriores) =>
        anteriores.filter(
          (item) =>
            !(
              item.fecha === fechaTurno &&
              horaCorta(item.hora_inicio) === inicioTurno &&
              horaCorta(item.hora_fin) === finTurno
            )
        )
      );

      const sesion = await asegurarSesionOcioSemanaCompleta(grupoReferencia, composicionSemanal);

      const resultados: OcioPrepararResultadoApp[] = [];

      for (const grupo of gruposConAlumnos) {
        resultados.push(
          await crearGrupoOcioOperativoEnSesion(grupo, sesion.sesionId)
        );
      }

      const gruposCreados = await consultarSupabase<AgendaGrupoSesionApp>(
        'v_grupos_sesion_operativa_app',
        `select=*&sesion_id=${encodeURIComponent(
          `eq.${sesion.sesionId}`
        )}&order=nombre_grupo.asc`
      );

      const totalAlumnosCreados = gruposCreados.reduce(
        (total, grupo) => total + Number(grupo.total_alumnos || 0),
        0
      );

      if (
        gruposCreados.length !== gruposConAlumnos.length ||
        totalAlumnosCreados !== totalAlumnosEsperados
      ) {
        await ejecutarFuncionAuthJson<{
          ok: boolean;
          sesiones_ocio_borradas: number;
        }>('reiniciar_turno_ocio_semana_app', {
          p_fecha: fechaTurno,
          p_hora_inicio: inicioTurno,
          p_hora_fin: finTurno,
        });

        throw new Error(
          `Preparación abortada: esperaba ${gruposConAlumnos.length} grupos ` +
            `y ${totalAlumnosEsperados} alumnos, pero se generaron ` +
            `${gruposCreados.length} grupos y ${totalAlumnosCreados} alumnos. ` +
            `Se ha limpiado el intento para no dejar datos incorrectos.`
        );
      }

      await cargarAgendaOperativaDirecta();
      await cargarResultadosOcioSemanaDesdeSupabase();
      await cargarPlanning();
      await cargarGruposEntrenador();

      window.setTimeout(() => {
        document
          .getElementById('ocio-grupos-preparados-semana')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 120);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : `No se pudo preparar ${dia}.`
      );
    }

    setCargando(false);
  }

  const cambiosOcioSemana = cambiosOcioSemanaActiva().sort((a, b) =>
    `${a.fecha} ${a.alumno}`.localeCompare(`${b.fecha} ${b.alumno}`)
  );

  const ocioAlumnoCambioSeleccionado =
    ocioAlumnos.find(
      (alumno) => alumno.alumno_id === ocioCambioForm.alumnoId
    ) || null;

  function grupoOcioDestinoCambioSeleccionado() {
    return (
      ocioGrupos.find(
        (grupo) => grupo.grupo_id === ocioCambioForm.grupoDestinoId
      ) || null
    );
  }

  function fechaDestinoCambioOcio(grupoDestinoId: string) {
    const grupo = ocioGrupos.find((item) => item.grupo_id === grupoDestinoId);
    return grupo
      ? fechaGrupoOcioSemana(grupo)
      : ocioCambioForm.fecha || lunesSemanaOcioActiva();
  }

  function fechaCambioOcioPorDia(
    dia: '' | 'Jueves' | 'Sábado' | 'Domingo'
  ) {
    const lunes = lunesSemanaOcioActiva();
    if (!lunes || !dia) return '';

    const fecha = crearFechaAgenda(lunes);
    fecha.setDate(fecha.getDate() + offsetDiaOcio(dia));
    return claveFechaAgenda(fecha);
  }

  function gruposDestinoCambioPuntualOcio() {
    if (!ocioAlumnoCambioSeleccionado || !ocioCambioForm.diaDestino) {
      return [];
    }

    return eligibleOcioRelocationGroups(
      ocioGrupos,
      ocioAlumnoCambioSeleccionado.grupo_id,
      ocioCambioForm.diaDestino,
      esTurnoOficialOcio,
      textoSinAcentosGrupoApp
    );
  }

  function recomendacionesCambioPuntualOcio() {
    if (!ocioAlumnoCambioSeleccionado || !ocioCambioForm.diaDestino) {
      return [];
    }

    return recomendacionesAlumnoSinGrupoOcio(
      ocioAlumnoCambioSeleccionado,
      gruposDestinoCambioPuntualOcio()
    );
  }

  function limpiarFormularioCambioOcio() {
    setOcioCambioForm(emptyOcioRelocationForm());
    setMostrarFormularioOcioCambio(false);
  }

  function abrirFormularioCambioOcio(cambio?: OcioCambioPuntualApp) {
    if (cambio) {
      setOcioCambioForm({
        id: cambio.reubicacion_id,
        alumnoId: cambio.alumno_id,
        diaDestino:
          cambio.destino_dia_semana === 'Jueves' ||
          cambio.destino_dia_semana === 'Sábado' ||
          cambio.destino_dia_semana === 'Domingo'
            ? cambio.destino_dia_semana
            : '',
        grupoDestinoId: cambio.grupo_destino_id,
        fecha: cambio.fecha,
        motivo: cambio.motivo || '',
      });
    } else {
      setOcioCambioForm({
        ...emptyOcioRelocationForm(),
        fecha: lunesSemanaOcioActiva(),
      });
    }
    setMostrarFormularioOcioCambio(true);
  }


  async function guardarCambioPuntualOcio() {
    if (!ocioCambioForm.diaDestino) {
      alert('Selecciona el día solicitado por la familia.');
      return;
    }

    const fecha =
      fechaCambioOcioPorDia(ocioCambioForm.diaDestino) ||
      fechaDestinoCambioOcio(ocioCambioForm.grupoDestinoId);
    let comando;
    try {
      comando = requireOcioRelocationCommand({
        studentId: ocioCambioForm.alumnoId,
        sourceGroupId: ocioAlumnoCambioSeleccionado?.grupo_id,
        targetGroupId: ocioCambioForm.grupoDestinoId,
        date: fecha,
        reason: ocioCambioForm.motivo,
      });
    } catch (errorValidacion) {
      alert(
        errorValidacion instanceof Error
          ? errorValidacion.message
          : 'El cambio puntual no es válido.'
      );
      return;
    }

    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('crear_reubicacion_ocio_app', {
        p_alumno_id: comando.studentId,
        p_fecha: comando.date,
        p_grupo_destino_id: comando.targetGroupId,
        p_motivo: comando.reason,
      });
      limpiarFormularioCambioOcio();
      await cargarOcioCambios();
      await cargarOcioAlumnos();
      await cargarOcioGrupos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error guardando cambio puntual de Ocio'
      );
    }
    setCargando(false);
  }

  async function eliminarCambioPuntualOcio(cambio: OcioCambioPuntualApp) {
    const confirmar = window.confirm(
      `¿Eliminar el cambio puntual de ${cambio.alumno}?`
    );
    if (!confirmar) return;

    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('eliminar_reubicacion_ocio_app', {
        p_reubicacion_id: cambio.reubicacion_id,
      });
      await cargarOcioCambios();
      await cargarOcioAlumnos();
      await cargarOcioGrupos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error eliminando cambio puntual de Ocio'
      );
    }
    setCargando(false);
  }

  const ocioAlumnosFiltrados = ocioAlumnos.filter((alumno) => {
    const coincideBusqueda =
      `${alumno.alumno} ${alumno.nivel_usado || ''} ${alumno.grupo_estable || ''}`
        .toLowerCase()
        .includes(busquedaOcio.toLowerCase());

    const diaAlumno = textoSinAcentosGrupoApp(
      alumno.dia_fijo || alumno.grupo_dia || ''
    );
    const coincideDia =
      !filtroDiaFichasOcio ||
      diaAlumno === textoSinAcentosGrupoApp(filtroDiaFichasOcio);

    const recomendacionCambio = ocioRecomendacionesCambio.find(
      (item) => item.alumno_id === alumno.alumno_id
    );
    const necesitaRevisarGrupo = Boolean(
      recomendacionCambio && recomendacionCambio.recomendacion !== 'OK'
    );

    const coincideEstado =
      filtroEstadoFichasOcio === 'todos' ||
      (filtroEstadoFichasOcio === 'sin_grupo' && !alumno.grupo_id) ||
      (filtroEstadoFichasOcio === 'sin_nivel' &&
        !(alumno.nivel_usado || alumno.nivel)) ||
      (filtroEstadoFichasOcio === 'revisar_grupo' && necesitaRevisarGrupo);

    return coincideBusqueda && coincideDia && coincideEstado;
  });

  async function cargarEstadosAvisosEntrenadores() {
    if (!esCoordinadorApp) {
      setEstadosAvisosEntrenadores({});
      return;
    }

    setCargandoEstadosAvisosEntrenadores(true);

    try {
      const data = await ejecutarFuncionConRespuesta<EstadoAvisosEntrenadorApp>(
        'obtener_estado_avisos_entrenadores_app',
        {}
      );

      setEstadosAvisosEntrenadores(
        Object.fromEntries(data.map((item) => [item.entrenador_id, item]))
      );
    } catch (err) {
      console.warn('No se pudo cargar el estado de avisos de entrenadores:', err);
      setEstadosAvisosEntrenadores({});
    } finally {
      setCargandoEstadosAvisosEntrenadores(false);
    }
  }

  async function cargarEntrenadores() {
    setCargando(true);
    setError('');
    setDetalle(null);

    try {
      const data = await consultarSupabase<EntrenadorResumen>(
        'v_panel_entrenadores',
        'select=*&order=nombre_completo.asc'
      );
      setEntrenadores(data);

      if (puedeGestionarAccesosUsuarioApp) {
        void cargarEstadosAccesoEntrenadores(data);
      }

      if (esCoordinadorApp) {
        void cargarEstadosAvisosEntrenadores();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setEntrenadores([]);
    }

    setCargando(false);
  }

  async function llamarGestionUsuariosOperativos(
    accion: string,
    payload: Record<string, unknown> = {}
  ) {
    const accessToken = await obtenerAccessTokenSupabaseApp();

    const respuesta = await fetch(
      `${SUPABASE_URL}/functions/v1/gestionar-usuarios-operativos-app`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accion,
          ...payload,
        }),
      }
    );

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      throw new Error(
        datos?.message ||
          datos?.error ||
          `No se pudo gestionar el usuario (${respuesta.status}).`
      );
    }

    return datos;
  }

  async function cargarUsuariosOperativos() {
    if (!puedeGestionarAccesosUsuarioApp) {
      setUsuariosOperativos([]);
      return;
    }

    setCargandoUsuariosOperativos(true);
    setError('');

    try {
      const datos = await llamarGestionUsuariosOperativos('listar');
      setUsuariosOperativos(datos?.usuarios || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los usuarios de coordinación.'
      );
    } finally {
      setCargandoUsuariosOperativos(false);
    }
  }

  async function crearUsuarioOperativo() {
    if (!puedeGestionarAccesosUsuarioApp) return;

    const nombre = formUsuarioOperativo.nombre.trim();
    const email = formUsuarioOperativo.email.trim().toLowerCase();
    const rol = formUsuarioOperativo.rol;

    if (!nombre || !email) {
      setError('Completa nombre y email.');
      return;
    }

    if (!email.includes('@')) {
      setError('El email no parece válido.');
      return;
    }

    if (
      !window.confirm(
        `¿Crear acceso de ${rolUsuarioTextoApp(rol)} para ${nombre}?\n\nSe enviará una invitación a ${email}.`
      )
    ) {
      return;
    }

    setGestionandoUsuarioOperativoId('nuevo');
    setError('');

    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}`
          : '';

      await llamarGestionUsuariosOperativos('crear', {
        nombre,
        email,
        rol,
        redirect_to: redirectTo,
      });

      setFormUsuarioOperativo({
        nombre: '',
        email: '',
        rol: 'sub_coordinador',
      });
      setMostrarAltaUsuarioOperativo(false);
      await cargarUsuariosOperativos();

      window.alert(`Invitación enviada a ${email}.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear el acceso.'
      );
    } finally {
      setGestionandoUsuarioOperativoId('');
    }
  }

  async function gestionarUsuarioOperativo(
    usuario: UsuarioOperativoGestionApp,
    accion:
      | 'desactivar'
      | 'activar'
      | 'reenviar_invitacion'
      | 'enviar_recuperacion'
  ) {
    if (!puedeGestionarAccesosUsuarioApp) return;

    const textos = {
      desactivar: `¿Desactivar el acceso de ${usuario.nombre}?`,
      activar: `¿Volver a activar el acceso de ${usuario.nombre}?`,
      reenviar_invitacion: `¿Reenviar la invitación a ${usuario.email}?`,
      enviar_recuperacion: `¿Enviar recuperación de contraseña a ${usuario.email}?`,
    };

    if (!window.confirm(textos[accion])) return;

    setGestionandoUsuarioOperativoId(usuario.id);
    setError('');

    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}`
          : '';

      await llamarGestionUsuariosOperativos(accion, {
        usuario_id: usuario.id,
        redirect_to: redirectTo,
      });

      await cargarUsuariosOperativos();

      if (accion === 'reenviar_invitacion') {
        window.alert(`Invitación reenviada a ${usuario.email}.`);
      }

      if (accion === 'enviar_recuperacion') {
        window.alert(`Recuperación enviada a ${usuario.email}.`);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo gestionar el usuario.'
      );
    } finally {
      setGestionandoUsuarioOperativoId('');
    }
  }

  async function llamarGestionAccesoEntrenador(
    accion: string,
    payload: Record<string, unknown> = {}
  ) {
    const accessToken = await obtenerAccessTokenSupabaseApp();

    const respuesta = await fetch(
      `${SUPABASE_URL}/functions/v1/gestionar-acceso-usuario-app`,
      {
        method: 'POST',
        headers: {
          apikey: SUPABASE_ANON_KEY,
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          accion,
          ...payload,
        }),
      }
    );

    const datos = await respuesta.json().catch(() => ({}));

    if (!respuesta.ok) {
      throw new Error(
        datos?.message ||
          datos?.error ||
          `No se pudo gestionar el acceso (${respuesta.status}).`
      );
    }

    return datos;
  }

  async function cargarEstadosAccesoEntrenadores(
    entrenadoresBase: EntrenadorResumen[] = entrenadores
  ) {
    if (!puedeGestionarAccesosUsuarioApp) {
      setEstadosAccesoEntrenadores({});
      return;
    }

    const ids = entrenadoresBase
      .map((entrenador) => entrenador.entrenador_id)
      .filter(Boolean);

    if (ids.length === 0) {
      setEstadosAccesoEntrenadores({});
      return;
    }

    setCargandoEstadosAccesoEntrenadores(true);

    try {
      const datos = await llamarGestionAccesoEntrenador('listar_estados', {
        entrenador_ids: ids,
      });

      const mapa: Record<string, EstadoAccesoEntrenadorApp> = {};
      (datos?.estados || []).forEach((item: EstadoAccesoEntrenadorApp) => {
        mapa[item.entrenador_id] = item;
      });
      setEstadosAccesoEntrenadores(mapa);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron cargar los estados de acceso.'
      );
    } finally {
      setCargandoEstadosAccesoEntrenadores(false);
    }
  }

  async function gestionarAccesoEntrenador(
    entrenador: EntrenadorResumen,
    accion:
      | 'reenviar_invitacion'
      | 'desactivar'
      | 'activar'
      | 'enviar_recuperacion'
  ) {
    if (!puedeGestionarAccesosUsuarioApp) {
      setError('Solo el coordinador jefe puede gestionar accesos.');
      return;
    }

    const textos = {
      reenviar_invitacion: `¿Reenviar la invitación a ${entrenador.email}?`,
      desactivar: `¿Desactivar el acceso de ${entrenador.nombre_completo}?\n\nLa ficha, grupos, reportes y cobros históricos NO se borran.`,
      activar: `¿Volver a activar el acceso de ${entrenador.nombre_completo}?`,
      enviar_recuperacion: `¿Enviar un email de recuperación de contraseña a ${entrenador.email}?`,
    };

    if (!window.confirm(textos[accion])) return;

    setGestionandoAccesoEntrenadorId(entrenador.entrenador_id);
    setError('');

    try {
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}`
          : '';

      await llamarGestionAccesoEntrenador(accion, {
        entrenador_id: entrenador.entrenador_id,
        redirect_to: redirectTo,
      });

      await cargarEstadosAccesoEntrenadores();

      if (accion === 'reenviar_invitacion') {
        window.alert(`Invitación reenviada a ${entrenador.email}.`);
      }

      if (accion === 'enviar_recuperacion') {
        window.alert(
          `Email de recuperación enviado a ${entrenador.email}.`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo gestionar el acceso.'
      );
    } finally {
      setGestionandoAccesoEntrenadorId('');
    }
  }

  async function crearAccesoAppEntrenador(entrenador: EntrenadorResumen) {
    if (!puedeGestionarAccesosUsuarioApp) {
      setError('Solo el coordinador jefe puede crear accesos a la app.');
      return;
    }

    const email = String(entrenador.email || '').trim().toLowerCase();
    if (!email) {
      setError(
        `La ficha de ${entrenador.nombre_completo} no tiene email de acceso. Edita la ficha antes de crear la cuenta.`
      );
      return;
    }

    const confirmar = window.confirm(
      `¿Crear acceso app para ${entrenador.nombre_completo}?\n\n${email}\n\nSupabase enviará un email para que configure su contraseña.`
    );
    if (!confirmar) return;

    setCreandoAccesoEntrenadorId(entrenador.entrenador_id);
    setError('');

    try {
      const accessToken = await obtenerAccessTokenSupabaseApp();
      const redirectTo =
        typeof window !== 'undefined'
          ? `${window.location.origin}${window.location.pathname}`
          : '';

      const respuesta = await fetch(
        `${SUPABASE_URL}/functions/v1/invitar-usuario-app`,
        {
          method: 'POST',
          headers: {
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            entrenador_id: entrenador.entrenador_id,
            nombre: entrenador.nombre_completo,
            email,
            redirect_to: redirectTo,
          }),
        }
      );

      const datos = await respuesta.json().catch(() => ({}));

      if (!respuesta.ok) {
        const mensaje =
          datos?.message ||
          datos?.error ||
          `No se pudo crear el acceso (${respuesta.status}).`;
        throw new Error(mensaje);
      }

      await cargarEstadosAccesoEntrenadores();

      window.alert(
        `Invitación enviada a ${email}.\n\nCuando abra el correo podrá configurar su contraseña y la cuenta quedará vinculada a la ficha de ${entrenador.nombre_completo}.`
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo crear el acceso del entrenador.'
      );
    }

    setCreandoAccesoEntrenadorId('');
  }

  function pedirDatosAltaEntrenadorWhatsapp(entrenador: EntrenadorResumen) {
    const nombre = nombreEntrenadorWhatsappPapis(
      entrenador.nombre_completo || 'entrenador'
    );

    const mensaje = `Hola ${nombre} 👋

Para darte de alta necesito que me pases:

• Nombre completo
• Email
• Teléfono / WhatsApp
• Titulación
• Certificado de antecedentes sexuales

Puedes enviarme la titulación y los antecedentes en PDF, foto o enlace.

Gracias!`;

    abrirPrevisualizacionWhatsapp(
      `Alta entrenador · ${nombre}`,
      mensaje
    );
  }

  function abrirNuevoEntrenador() {
    setFormEntrenador(entrenadorFormInicial());
    setMostrarFormularioEntrenador(true);

    window.setTimeout(() => {
      document
        .getElementById('formulario-gestion-entrenador')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function abrirEditarEntrenador(entrenador: EntrenadorResumen) {
    setFormEntrenador({
      id: entrenador.entrenador_id,
      nombre: entrenador.nombre_completo || '',
      email: entrenador.email || '',
      telefono: entrenador.telefono || '',
      tarifa: String(entrenador.tarifa_por_turno ?? 0),
      activo: !!entrenador.activo,
      chaqueta: !!entrenador.chaqueta_entregada,
      especialidades: entrenador.especialidades || [],
      titulacionEstado: entrenador.titulacion_estado || 'Pendiente',
      titulacionUrl: entrenador.titulacion_url || '',
      titulacionObs: entrenador.titulacion_observaciones || '',
      antecedentesEstado: entrenador.antecedentes_estado || 'Pendiente',
      antecedentesUrl: entrenador.antecedentes_url || '',
      antecedentesObs: entrenador.antecedentes_observaciones || '',
      observaciones: entrenador.observaciones_internas || '',
    });
    setMostrarFormularioEntrenador(true);

    window.setTimeout(() => {
      document
        .getElementById('formulario-gestion-entrenador')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  function alternarEspecialidadEntrenador(especialidad: string) {
    setFormEntrenador((actual) => ({
      ...actual,
      especialidades: actual.especialidades.includes(especialidad)
        ? actual.especialidades.filter((item) => item !== especialidad)
        : [...actual.especialidades, especialidad],
    }));
  }

  async function guardarEntrenadorGestion() {
    if (!formEntrenador.nombre.trim()) {
      alert('Pon el nombre del entrenador.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('guardar_entrenador_gestion_app', {
        p_entrenador_id: formEntrenador.id,
        p_nombre_completo: formEntrenador.nombre.trim(),
        p_email: formEntrenador.email.trim() || null,
        p_telefono: formEntrenador.telefono.trim() || null,
        p_tarifa_por_turno: Number(formEntrenador.tarifa || 0),
        p_activo: formEntrenador.activo,
        p_chaqueta_entregada: formEntrenador.chaqueta,
        p_especialidades: formEntrenador.especialidades,
        p_titulacion_estado: formEntrenador.titulacionEstado,
        p_titulacion_url: formEntrenador.titulacionUrl.trim() || null,
        p_titulacion_observaciones: formEntrenador.titulacionObs.trim() || null,
        p_antecedentes_estado: formEntrenador.antecedentesEstado,
        p_antecedentes_url: formEntrenador.antecedentesUrl.trim() || null,
        p_antecedentes_observaciones:
          formEntrenador.antecedentesObs.trim() || null,
        p_observaciones_internas: formEntrenador.observaciones.trim() || null,
      });
      setMostrarFormularioEntrenador(false);
      setFormEntrenador(entrenadorFormInicial());
      await cargarEntrenadores();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error guardando entrenador'
      );
    }

    setCargando(false);
  }

  async function eliminarEntrenadorGestion(entrenador: EntrenadorResumen) {
    const confirmar = window.confirm(
      `¿Eliminar la ficha de ${entrenador.nombre_completo}? Si tiene grupos históricos, primero se quitarán sus asignaciones para no bloquear la app.`
    );
    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('eliminar_entrenador_gestion_app', {
        p_entrenador_id: entrenador.entrenador_id,
      });
      await cargarEntrenadores();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error eliminando entrenador'
      );
    }

    setCargando(false);
  }

  async function cargarDisponibilidad(
    semanaForzada?: string,
    silencioso = false
  ) {
    if (!silencioso) {
      setCargando(true);
      setError('');
      setDetalle(null);
    }

    try {
      const semanaOperativaDisponibilidad = inicioSemanaAgenda(
        fechaIsoMadridApp()
      );

      let semanaConsulta =
        semanaForzada ||
        (esCoordinadorApp
          ? pantalla === 'entrenador'
            ? semanaVistaEntrenadorCoordinadorForzada ||
              semanaOperativaDisponibilidad
            : semanaAgendaActiva || semanaOperativaDisponibilidad
          : semanaEntrenadorSeleccionada || semanaOperativaDisponibilidad);

      if (!esCoordinadorApp && !semanaForzada) {
        const objetivo =
          await ejecutarFuncionAuthJson<{
            semana_inicio: string | null;
          }>('obtener_semana_disponibilidad_objetivo_entrenador_app', {});

        semanaConsulta =
          objetivo?.semana_inicio || semanaOperativaDisponibilidad;
        setSemanaPublicadaObjetivoEntrenador(
          objetivo?.semana_inicio || ''
        );
        setSemanaEntrenadorSeleccionada(semanaConsulta || '');
      }

      if (!esCoordinadorApp && semanaForzada) {
        setSemanaEntrenadorSeleccionada(semanaForzada);
      }

      if (!semanaConsulta) {
        setDisponibilidad([]);
        setDisponibilidadEditorVista(null);
        return;
      }

      const respuestaEditor =
        await ejecutarFuncionAuthJson<RespuestaDisponibilidadPublicadaEntrenadoresEditor>(
          'obtener_disponibilidad_publicada_entrenadores_editor_app',
          { p_semana_inicio: semanaConsulta }
        );

      setDisponibilidadEditorVista(respuestaEditor);
      setDisponibilidad(
        (respuestaEditor.turnos || []).map((turno) => ({
          ...turno,
          fuente: 'editor' as const,
        }))
      );
    } catch (err) {
      if (silencioso) {
        console.warn('No se pudo refrescar la disponibilidad publicada.', err);
      } else {
        setError(
          err instanceof Error
            ? err.message
            : 'No se pudo cargar la disponibilidad publicada.'
        );
        setDisponibilidad([]);
        setDisponibilidadEditorVista(null);
      }
    } finally {
      if (!silencioso) setCargando(false);
    }
  }

  function abrirResumenCierreSemanal(
    filtro: 'todos' | 'faltan_reportes' | 'asistencias_sin_confirmar' | 'criticos'
  ) {
    setFiltroReportes(filtro);
    setBusquedaReportes('');

    enfocarElementoApp('cierre-semanal-listado-pendientes', {
      espera: 120,
      block: 'start',
    });
  }

  async function abrirPendienteCierreSemanal(reporte: ReportePendiente) {
    setCargando(true);
    setError('');

    try {
      const semanaObjetivo = inicioSemanaAgenda(reporte.fecha);

      // Abrir una tarea antigua en Vista entrenador no debe mover el calendario
      // general de coordinación. Forzamos solo esta vista al intervalo del reporte.
      setSemanaVistaEntrenadorCoordinadorForzada(semanaObjetivo);
      setBusquedaGrupoEntrenador('');
      setTabVistaEntrenador('grupos');
      setPantalla('entrenador');

      await cargarGruposEntrenador();

      const grupoObjetivo = gruposEntrenador.find(
        (grupo) =>
          grupo.grupo_id === reporte.grupo_id &&
          grupo.entrenador_id === reporte.entrenador_id
      );

      // El estado React de cargarGruposEntrenador puede actualizarse después
      // de este mismo tick. Aunque todavía no esté en la copia local, el
      // identificador grupo+entrenador que trae Cierre semanal es suficiente
      // para abrir exactamente la ficha correcta al renderizar.
      setGrupoActivoEntrenador({
        grupo_id: reporte.grupo_id,
        entrenador_id: reporte.entrenador_id,
      });
      setSeccionGrupoEntrenador('asistencia');

      window.setTimeout(() => {
        const grupoDomId =
          `trainer-group-${reporte.entrenador_id}-${reporte.grupo_id}`.replace(
            /[^a-zA-Z0-9_-]/g,
            '-'
          );

        const objetivo = document.getElementById(grupoDomId);

        if (!objetivo) {
          setError(
            `He abierto Vista entrenador, pero no encuentro visible el grupo ${reporte.nombre_grupo}. Pulsa “Actualizar vista” si acaba de cambiar la semana.`
          );
          return;
        }

        let padre = objetivo.parentElement;
        while (padre) {
          if (padre instanceof HTMLDetailsElement) {
            padre.open = true;
          }
          padre = padre.parentElement;
        }

        objetivo.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });

        window.setTimeout(() => {
          irASeccionGrupoEntrenador('asistencia', grupoDomId);
        }, 180);
      }, 520);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo abrir la tarea en Vista entrenador.'
      );
    } finally {
      setCargando(false);
    }
  }

  async function cargarReportesPendientes() {
    setCargando(true);
    setError('');
    setDetalle(null);

    try {
      const data = await consultarSupabase<ReportePendiente>(
        'v_reportes_pendientes_entrenador_dos_entrenadores',
        'select=*&order=fecha.asc,hora_inicio.asc,entrenador.asc,nombre_grupo.asc,alumno.asc'
      );
      setReportesPendientes(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setReportesPendientes([]);
    }

    setCargando(false);
  }

  function periodoCobrosDesdeSemanaActiva() {
    return billingPeriodForWeek(semanaAgendaActiva, { anio: anioCobros, mes: mesCobros });
  }

  async function cargarCobros(
    periodo?: { anio: number; mes: number }
  ) {
    const anioObjetivo = periodo?.anio ?? anioCobros;
    const mesObjetivo = periodo?.mes ?? mesCobros;

    setCargando(true);
    setError('');
    setDetalle(null);

    try {
      const [resumenData, detalleData] = await Promise.all([
        consultarSupabase<CobroMensual>(
          'v_cobros_mensuales_dos_entrenadores',
          `select=*&anio=eq.${anioObjetivo}&mes=eq.${mesObjetivo}&order=entrenador.asc`
        ),
        consultarSupabase<CobroDetalleMensual>(
          'v_cobros_detalle_mensual_dos_entrenadores',
          `select=*&anio=eq.${anioObjetivo}&mes=eq.${mesObjetivo}&order=entrenador.asc,fecha.asc,hora_inicio.asc,modalidad.asc,nombre_grupo.asc`
        ),
      ]);
      setCobros(resumenData);
      setCobrosDetalle(detalleData);
      setTarifasEditadasCobros(billingRatesByTrainer(resumenData));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setCobros([]);
      setCobrosDetalle([]);
    }

    setCargando(false);
  }

  async function cargarCobrosDesdeSemanaActiva() {
    const periodo = periodoCobrosDesdeSemanaActiva();
    setAnioCobros(periodo.anio);
    setMesCobros(periodo.mes);
    await cargarCobros(periodo);
  }

  function detallesDeCobro(entrenadorId: string) {
    return billingDetailsForTrainer(cobrosDetalle, entrenadorId);
  }

  async function guardarTarifaCobro(cobro: CobroMensual) {
    const valor = Number(
      tarifasEditadasCobros[cobro.entrenador_id] ?? cobro.tarifa_por_turno ?? 0
    );
    if (Number.isNaN(valor) || valor < 0) {
      alert('La tarifa tiene que ser un número válido.');
      return;
    }

    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('actualizar_tarifa_cobro_entrenador_app', {
        p_entrenador_id: cobro.entrenador_id,
        p_tarifa_por_turno: valor,
      });
      await cargarCobros();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error guardando tarifa');
    }
    setCargando(false);
  }

  async function crearAjusteCobro(cobro: CobroMensual) {
    const concepto = window.prompt(
      `Concepto del ajuste para ${cobro.entrenador}`,
      'Ajuste manual'
    );
    if (concepto === null) return;

    const importeTexto = window.prompt(
      'Importe del ajuste. Usa negativo si quieres descontar. Ejemplo: 15 o -10',
      '0'
    );
    if (importeTexto === null) return;

    const importe = Number(importeTexto.replace(',', '.'));
    if (Number.isNaN(importe)) {
      alert('Importe no válido.');
      return;
    }

    const observaciones =
      window.prompt('Observación para dirección, si hace falta:', '') || '';

    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('crear_ajuste_cobro_mes_app', {
        p_entrenador_id: cobro.entrenador_id,
        p_anio: cobro.anio,
        p_mes: cobro.mes,
        p_concepto: concepto.trim() || 'Ajuste manual',
        p_importe: importe,
        p_observaciones: observaciones.trim() || null,
      });
      await cargarCobros();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error creando ajuste');
    }
    setCargando(false);
  }

  async function limpiarAjustesCobro(cobro: CobroMensual) {
    if (
      !window.confirm(
        `¿Eliminar todos los ajustes manuales de ${
          cobro.entrenador
        } en ${nombreMes(cobro.mes)} ${cobro.anio}?`
      )
    )
      return;

    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('limpiar_ajustes_cobro_mes_app', {
        p_entrenador_id: cobro.entrenador_id,
        p_anio: cobro.anio,
        p_mes: cobro.mes,
      });
      await cargarCobros();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error limpiando ajustes');
    }
    setCargando(false);
  }

  async function cambiarEstadoCobro(cobro: CobroMensual, estado: string) {
    const nota =
      window.prompt(
        `Nota para dirección en ${estado}:`,
        cobro.nota_direccion || ''
      ) || '';

    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('guardar_estado_cobro_mes_app', {
        p_entrenador_id: cobro.entrenador_id,
        p_anio: cobro.anio,
        p_mes: cobro.mes,
        p_estado_mes: estado,
        p_nota_direccion: nota.trim() || null,
      });
      await cargarCobros();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error cambiando estado del cobro'
      );
    }
    setCargando(false);
  }

  function htmlDetalleTurnosCobro(cobro: CobroMensual) {
    const detalles = detallesDeCobro(cobro.entrenador_id);
    if (detalles.length === 0) return '<p>Sin turnos detallados.</p>';

    return `
      <table>
        <thead>
          <tr>
            <th>Fecha</th>
            <th>Hora</th>
            <th>Modalidad</th>
            <th>Grupo</th>
            <th>Niños</th>
            <th>Importe</th>
          </tr>
        </thead>
        <tbody>
          ${detalles
            .map(
              (detalleCobro) => `
            <tr>
              <td>${escaparHtml(formatearFecha(detalleCobro.fecha))}</td>
              <td>${escaparHtml(
                horaCorta(detalleCobro.hora_inicio)
              )}-${escaparHtml(horaCorta(detalleCobro.hora_fin))}</td>
              <td>${escaparHtml(detalleCobro.modalidad)}</td>
              <td>${escaparHtml(detalleCobro.nombre_grupo)}</td>
              <td>${Number(detalleCobro.total_alumnos || 0)}</td>
              <td>${formatearEuros(detalleCobro.importe_turno)}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    `;
  }

  function htmlCobroEntrenador(cobro: CobroMensual) {
    return `
      <section class="cobro">
        <h2>${escaparHtml(cobro.entrenador)}</h2>
        <p><strong>Mes:</strong> ${escaparHtml(nombreMes(cobro.mes))} ${
      cobro.anio
    } · ${escaparHtml(cobro.temporada || '')}</p>
        <p><strong>Estado:</strong> ${escaparHtml(
          cobro.estado_mes || 'abierto'
        )}</p>
        ${
          cobro.nota_direccion
            ? `<p><strong>Nota dirección:</strong> ${escaparHtml(
                cobro.nota_direccion
              )}</p>`
            : ''
        }
        <div class="resumen">
          <div><strong>Baby</strong><br>${Number(
            cobro.total_turnos_baby || 0
          )} turnos</div>
          <div><strong>Intensivos</strong><br>${Number(
            cobro.total_turnos_intensivos || 0
          )} turnos</div>
          <div><strong>Ocio</strong><br>${Number(
            cobro.total_turnos_ocio || 0
          )} turnos</div>
          <div><strong>Tarifa</strong><br>${formatearEuros(
            cobro.tarifa_por_turno
          )}</div>
          <div><strong>Subtotal</strong><br>${formatearEuros(
            cobro.subtotal_sesiones
          )}</div>
          <div><strong>Ajustes</strong><br>${formatearEuros(
            cobro.ajustes_total
          )}</div>
          <div><strong>Total mes</strong><br>${formatearEuros(
            cobro.total_mes
          )}</div>
        </div>
        <h3>Detalle de turnos</h3>
        ${htmlDetalleTurnosCobro(cobro)}
        ${
          cobro.detalle_ajustes
            ? `<h3>Ajustes manuales</h3><pre>${escaparHtml(
                cobro.detalle_ajustes
              )}</pre>`
            : ''
        }
      </section>
    `;
  }

  function abrirPdfCobroEntrenador(cobro: CobroMensual) {
    setCobroPdfPreview({
      titulo: `Cobro ${cobro.entrenador} · ${nombreMes(cobro.mes)} ${
        cobro.anio
      }`,
      cuerpo: htmlCobroEntrenador(cobro),
    });
  }

  function htmlPreparacionEfectivoCobrosApp(cobrosPdf: CobroMensual[]) {
    const pagos = cobrosPdf
      .map((cobro) => ({
        entrenador: cobro.entrenador,
        importe: Math.max(0, Number(cobro.total_mes || 0)),
      }))
      .filter((pago) => pago.importe > 0);

    const totalEfectivo = pagos.reduce(
      (total, pago) => total + pago.importe,
      0
    );

    const desgloseTotal = new Map<
      string,
      { etiqueta: string; tipo: string; cantidad: number; centimos: number }
    >();

    const filasEntrenadores = pagos
      .map((pago) => {
        const desglose = desglosarEfectivoCobrosApp(pago.importe);

        desglose.forEach((fila) => {
          if (fila.cantidad <= 0) return;
          const actual = desgloseTotal.get(fila.etiqueta);
          desgloseTotal.set(fila.etiqueta, {
            etiqueta: fila.etiqueta,
            tipo: fila.tipo,
            centimos: fila.centimos,
            cantidad: (actual?.cantidad || 0) + fila.cantidad,
          });
        });

        const piezas = desglose
          .filter((fila) => fila.cantidad > 0)
          .map((fila) => `${fila.cantidad} × ${fila.etiqueta}`)
          .join(' · ');

        return `
          <tr>
            <td><strong>${escaparHtml(pago.entrenador)}</strong></td>
            <td>${formatearEuros(pago.importe)}</td>
            <td>${escaparHtml(piezas || 'Sin efectivo')}</td>
          </tr>
        `;
      })
      .join('');

    const filasDesglose = Array.from(desgloseTotal.values())
      .sort((a, b) => b.centimos - a.centimos)
      .map(
        (fila) => `
          <tr>
            <td>${escaparHtml(fila.etiqueta)}</td>
            <td>${escaparHtml(
              fila.tipo === 'billete' ? 'Billete' : 'Moneda'
            )}</td>
            <td><strong>${fila.cantidad}</strong></td>
            <td>${formatearEuros((fila.cantidad * fila.centimos) / 100)}</td>
          </tr>
        `
      )
      .join('');

    const pagosNoPositivos = cobrosPdf.filter(
      (cobro) => Number(cobro.total_mes || 0) <= 0
    ).length;

    return `
      <section class="preparacion-efectivo">
        <p class="kicker-efectivo">DIRECCIÓN · PREPARACIÓN DE PAGOS</p>
        <h1>Preparación de efectivo</h1>
        <p class="subtitulo-efectivo">
          ${escaparHtml(nombreMes(mesCobros))} ${anioCobros}
        </p>

        <div class="efectivo-destacado">
          <span>Total exacto a preparar</span>
          <strong>${formatearEuros(totalEfectivo)}</strong>
          <small>${pagos.length} entrenador(es) con importe a pagar</small>
        </div>

        <div class="nota-efectivo">
          <strong>Para retirar en el banco:</strong>
          este desglose está calculado para poder preparar cada pago de entrenador
          por separado, usando primero billetes de 50 € y completando después con
          denominaciones menores.
        </div>

        <h2>Desglose recomendado para pedir al banco</h2>
        ${
          filasDesglose
            ? `
              <table class="tabla-efectivo">
                <thead>
                  <tr>
                    <th>Denominación</th>
                    <th>Tipo</th>
                    <th>Cantidad</th>
                    <th>Importe</th>
                  </tr>
                </thead>
                <tbody>${filasDesglose}</tbody>
              </table>
            `
            : '<p>No hay efectivo positivo que preparar.</p>'
        }

        <h2>Preparación por entrenador</h2>
        ${
          filasEntrenadores
            ? `
              <table class="tabla-efectivo tabla-entrenadores-efectivo">
                <thead>
                  <tr>
                    <th>Entrenador</th>
                    <th>Total</th>
                    <th>Composición sugerida</th>
                  </tr>
                </thead>
                <tbody>${filasEntrenadores}</tbody>
              </table>
            `
            : '<p>No hay pagos positivos para este PDF.</p>'
        }

        ${
          pagosNoPositivos > 0
            ? `<p class="pie-efectivo">${pagosNoPositivos} registro(s) con importe 0 € o negativo no requieren efectivo y no se incluyen en el desglose de retirada.</p>`
            : ''
        }

        <p class="pie-efectivo">
          Cálculo orientativo para preparación física de pagos. Los importes
          individuales siguen siendo los reflejados en el resumen de cobros.
        </p>
      </section>
    `;
  }

  function abrirPdfCobrosConjunto() {
    if (cobrosFiltrados.length === 0) {
      alert('No hay cobros para generar PDF.');
      return;
    }

    const totalGeneral = cobrosFiltrados.reduce(
      (total, cobro) => total + Number(cobro.total_mes || 0),
      0
    );
    const cuerpo = `
      <section class="portada">
        <h1>Resumen cobros entrenadores</h1>
        <p>${escaparHtml(nombreMes(mesCobros))} ${anioCobros}</p>
        <p><strong>Total dirección:</strong> ${formatearEuros(totalGeneral)}</p>
        <p><strong>Entrenadores:</strong> ${cobrosFiltrados.length}</p>
      </section>
      ${cobrosFiltrados.map((cobro) => htmlCobroEntrenador(cobro)).join('')}
      ${htmlPreparacionEfectivoCobrosApp(cobrosFiltrados)}
    `;

    setCobroPdfPreview({
      titulo: `Cobros entrenadores · ${nombreMes(mesCobros)} ${anioCobros}`,
      cuerpo,
    });
  }

  function imprimirCobroPdfPreview() {
    setTimeout(() => window.print(), 50);
  }

  function abrirEntrenoManualCobro(cobro: CobroMensual) {
    const yaAbierto = entrenoManualCobroAbiertoId === cobro.entrenador_id;

    if (yaAbierto) {
      setEntrenoManualCobroAbiertoId('');
      return;
    }

    setFormCobroManual({
      ...cobroManualInicial(),
      entrenadorId: cobro.entrenador_id,
    });
    setEntrenoManualCobroAbiertoId(cobro.entrenador_id);
  }

  async function crearEntrenoManualCobro() {
    if (!formCobroManual.entrenadorId) {
      alert('Elige un entrenador.');
      return;
    }

    if (
      !formCobroManual.fecha ||
      !formCobroManual.horaInicio ||
      !formCobroManual.horaFin
    ) {
      alert('Completa fecha y horario.');
      return;
    }

    const totalAlumnos = Number(formCobroManual.totalAlumnos || 0);
    const importeOverrideTexto = formCobroManual.importeOverride.trim();
    const importeOverride = importeOverrideTexto
      ? Number(importeOverrideTexto.replace(',', '.'))
      : null;

    if (Number.isNaN(totalAlumnos) || totalAlumnos < 0) {
      alert('Número de niños no válido.');
      return;
    }

    if (importeOverride !== null && Number.isNaN(importeOverride)) {
      alert(
        'Importe manual no válido. Déjalo vacío para usar la tarifa del entrenador.'
      );
      return;
    }

    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('crear_entreno_manual_cobro_app', {
        p_entrenador_id: formCobroManual.entrenadorId,
        p_fecha: formCobroManual.fecha,
        p_hora_inicio: formCobroManual.horaInicio,
        p_hora_fin: formCobroManual.horaFin,
        p_modalidad: formCobroManual.modalidad,
        p_nombre_grupo: formCobroManual.nombreGrupo.trim() || 'Entreno manual',
        p_total_alumnos: totalAlumnos,
        p_observaciones: formCobroManual.observaciones.trim() || null,
        p_importe_override: importeOverride,
      });
      setFormCobroManual(cobroManualInicial());
      setEntrenoManualCobroAbiertoId('');
      await cargarCobros();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error creando entreno manual'
      );
    }
    setCargando(false);
  }

  async function eliminarEntrenoManualCobro(detalleCobro: CobroDetalleMensual) {
    const entrenoId = detalleCobro.entreno_manual_id || detalleCobro.grupo_id;
    if (!entrenoId) return;
    if (
      !window.confirm(
        `¿Eliminar este entreno manual de ${detalleCobro.entrenador}?`
      )
    )
      return;

    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('eliminar_entreno_manual_cobro_app', {
        p_entreno_id: entrenoId,
      });
      await cargarCobros();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error eliminando entreno manual'
      );
    }
    setCargando(false);
  }

  async function cargarIntensivos() {
    setCargando(true);
    setError('');
    setDetalle(null);

    try {
      const [
        intensivosData,
        intensivoAlumnosData,
        alumnosParaIntensivoData,
        alumnosResumenVolcadoData,
        intensivoDiasData,
        intensivoAsistenciasData,
        intensivoMásData,
        recomendacionesRecuperacionData,
        gruposDestinoRecuperacionData,
        gruposIntensivoDiaData,
        resumenReportesIntensivoData,
        resumenFinalIntensivoData,
        reportesDetalleIntensivoData,
        panelControlIntensivoData,
        entrenadoresData,
      ] = await Promise.all([
        consultarSupabase<IntensivoApp>(
          'v_intensivos_app',
          'select=*&order=fecha_inicio.desc,intensivo.asc'
        ),
        consultarSupabase<IntensivoAlumnoApp>(
          'v_intensivo_alumnos_app',
          'select=*&order=intensivo.asc,alumno.asc'
        ),
        consultarSupabase<AlumnoParaIntensivoApp>(
          'v_alumnos_para_intensivo_app',
          'select=*&order=alumno.asc'
        ),
        consultarSupabase<AlumnoResumenParaVolcadoApp>(
          'v_alumnos_resumen_para_volcado_app',
          'select=*&order=alumno.asc'
        ),
        consultarSupabase<IntensivoDiaApp>(
          'v_intensivo_dias_app',
          'select=*&order=fecha.asc,hora_inicio.asc,numero_dia.asc'
        ),
        consultarSupabase<IntensivoAsistenciaApp>(
          'v_intensivo_asistencias_app',
          'select=*&order=fecha.asc,hora_inicio.asc,alumno.asc'
        ),
        consultarSupabase<IntensivoRecuperacionApp>(
          'v_intensivo_recuperaciones_app',
          'select=*&order=created_at.desc,alumno.asc'
        ),
        consultarSupabase<RecuperacionRecomendacionApp>(
          'v_recuperaciones_recomendaciones_intensivo_app',
          'select=*&order=recuperacion_id.asc,orden_recomendacion.asc'
        ),
        consultarSupabase<GrupoDestinoRecuperacionApp>(
          'v_planning_app',
          'select=grupo_id,nombre_grupo,fecha,hora_inicio,modalidad&order=fecha.desc,hora_inicio.desc,nombre_grupo.asc'
        ),
        consultarSupabase<GrupoIntensivoDiaApp>(
          'v_grupos_intensivo_dia_app',
          'select=*&order=fecha.asc,hora_inicio.asc,nombre_grupo.asc'
        ),
        consultarSupabase<ResumenReportesIntensivoApp>(
          'v_resumen_reportes_intensivo_app',
          'select=*&order=intensivo.asc,alumno.asc'
        ),
        consultarSupabase<ResumenFinalIntensivoApp>(
          'v_resumen_final_intensivo_app',
          'select=*&order=intensivo.asc,alumno.asc'
        ),
        consultarSupabase<ReporteDetalleIntensivoApp>(
          'v_reportes_adaptativo_detalle_intensivo_app',
          'select=*&order=intensivo.asc,alumno.asc,fecha.asc,hora_inicio.asc'
        ).catch(() =>
          consultarSupabase<ReporteDetalleIntensivoApp>(
            'v_reportes_detalle_intensivo_app',
            'select=*&order=intensivo.asc,alumno.asc,fecha.asc,hora_inicio.asc'
          )
        ),
        consultarSupabase<PanelControlIntensivoApp>(
          'v_panel_control_intensivo_app',
          'select=*&order=intensivo.asc'
        ),
        consultarSupabase<EntrenadorResumen>(
          'v_panel_entrenadores',
          'select=*&order=nombre_completo.asc'
        ),
      ]);

      setIntensivos(intensivosData);
      setIntensivoAlumnos(intensivoAlumnosData);
      setAlumnosParaIntensivo(alumnosParaIntensivoData);
      setAlumnosResumenVolcado(alumnosResumenVolcadoData);
      setIntensivoDias(intensivoDiasData);
      setIntensivoAsistencias(intensivoAsistenciasData);
      setIntensivoMás(intensivoMásData);
      setRecomendacionesRecuperacion(recomendacionesRecuperacionData);
      setGruposDestinoRecuperacion(gruposDestinoRecuperacionData);
      setGruposIntensivoDia(gruposIntensivoDiaData);
      setResumenReportesIntensivo(resumenReportesIntensivoData);
      setResumenFinalIntensivo(resumenFinalIntensivoData);
      setReportesDetalleIntensivo(reportesDetalleIntensivoData);
      setPanelControlIntensivo(panelControlIntensivoData);
      setEntrenadores(entrenadoresData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIntensivos([]);
      setIntensivoAlumnos([]);
      setAlumnosParaIntensivo([]);
      setAlumnosResumenVolcado([]);
      setIntensivoDias([]);
      setIntensivoAsistencias([]);
      setIntensivoMás([]);
      setRecomendacionesRecuperacion([]);
      setGruposDestinoRecuperacion([]);
      setGruposIntensivoDia([]);
      setResumenReportesIntensivo([]);
      setResumenFinalIntensivo([]);
      setReportesDetalleIntensivo([]);
      setPanelControlIntensivo([]);
    }

    setCargando(false);
  }

  async function crearIntensivoDesdeApp() {
    if (!formIntensivo.nombre.trim()) {
      setError('Pon un nombre para el intensivo.');
      return;
    }

    if (!formIntensivo.lugar.trim()) {
      setError('Pon un lugar para el intensivo.');
      return;
    }

    const confirmar = window.confirm(
      `¿Crear intensivo ${formIntensivo.nombre} en ${temporadaActivaCierre || 'la temporada activa'}?`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('crear_intensivo_app', {
        p_temporada_nombre: '',
        p_nombre: formIntensivo.nombre.trim(),
        p_lugar: formIntensivo.lugar.trim(),
        p_estado: formIntensivo.estado,
      });

      setFormIntensivo(intensivoInicial());
      setMostrarFormularioIntensivo(false);
      setFiltroIntensivos('todos');
      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function guardarDiaIntensivo(intensivo: IntensivoApp) {
    if (!formDiaIntensivo.fecha) {
      setError('Selecciona una fecha para el día del intensivo.');
      return;
    }

    const confirmar = window.confirm(
      `¿Añadir día al intensivo ${intensivo.intensivo}?`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('crear_dia_intensivo_app', {
        p_intensivo_id: intensivo.intensivo_id,
        p_fecha: formDiaIntensivo.fecha,
        p_hora_inicio: formDiaIntensivo.hora_inicio,
        p_hora_fin: formDiaIntensivo.hora_fin,
      });

      setDiaEditandoIntensivoId(null);
      setFormDiaIntensivo(diaIntensivoInicial());
      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function crearCuatroSesionesIntensivo(intensivo: IntensivoApp) {
    const fechas = calcularFechasCuatroSesionesIntensivo(
      plantillaCuatroSesionesIntensivo.fechaInicio,
      plantillaCuatroSesionesIntensivo.tipo
    );

    if (fechas.length !== 4) {
      setError('Selecciona la primera fecha para generar las 4 sesiones.');
      return;
    }

    const diasExistentes = diasDelIntensivo(intensivo.intensivo_id);
    const repetidas = fechas.filter((fecha) =>
      diasExistentes.some((dia) => dia.fecha === fecha)
    );

    if (repetidas.length > 0) {
      setError(
        `Ya existen estos días en el intensivo: ${repetidas
          .map(formatearFecha)
          .join(', ')}.`
      );
      return;
    }

    if (diasExistentes.length > 0) {
      const confirmarAñadir = window.confirm(
        `Este intensivo ya tiene ${diasExistentes.length} día(s). ¿Quieres añadir igualmente estas 4 sesiones?`
      );
      if (!confirmarAñadir) return;
    }

    const confirmar = window.confirm(
      `¿Crear 4 sesiones para ${
        intensivo.intensivo
      }?\n${nombreTipoCuatroSesionesIntensivo(
        plantillaCuatroSesionesIntensivo.tipo
      )}\n${fechas
        .map(
          (fecha) =>
            `- ${formatearFecha(fecha)} ${
              plantillaCuatroSesionesIntensivo.horaInicio
            }-${plantillaCuatroSesionesIntensivo.horaFin}`
        )
        .join('\n')}`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      for (const fecha of fechas) {
        await ejecutarFuncion('crear_dia_intensivo_app', {
          p_intensivo_id: intensivo.intensivo_id,
          p_fecha: fecha,
          p_hora_inicio: plantillaCuatroSesionesIntensivo.horaInicio,
          p_hora_fin: plantillaCuatroSesionesIntensivo.horaFin,
        });
      }

      setMostrarPlantillaCuatroSesionesIntensivoId(null);
      setPlantillaCuatroSesionesIntensivo(plantillaCuatroSesionesInicial());
      await cargarIntensivos();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error creando las 4 sesiones del intensivo'
      );
    }

    setCargando(false);
  }

  function prepararEdicionDiaIntensivo(dia: IntensivoDiaApp) {
    setDiaEditandoIntensivoId(dia.intensivo_dia_id);
    setFormDiaIntensivo({
      fecha: dia.fecha || '',
      hora_inicio: (dia.hora_inicio || '10:00').slice(0, 5),
      hora_fin: (dia.hora_fin || '14:00').slice(0, 5),
    });
  }

  async function actualizarDiaIntensivoDesdeApp(dia: IntensivoDiaApp) {
    if (!formDiaIntensivo.fecha) {
      setError('Selecciona una fecha para actualizar el día.');
      return;
    }

    const confirmar = window.confirm(
      `¿Actualizar el día ${dia.numero_dia} del intensivo? Si ya tiene grupo, también se actualizará su sesión.`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('actualizar_dia_intensivo_app', {
        p_intensivo_dia_id: dia.intensivo_dia_id,
        p_fecha: formDiaIntensivo.fecha,
        p_hora_inicio: formDiaIntensivo.hora_inicio,
        p_hora_fin: formDiaIntensivo.hora_fin,
      });

      setDiaEditandoIntensivoId(null);
      setFormDiaIntensivo(diaIntensivoInicial());

      // El backend renumera cronológicamente. Mantenemos seleccionado el mismo
      // día por ID, pero recargamos todo antes de volver a pintar etiquetas
      // Día 1/2/3/4 y sesiones operativas.
      setDiaGrupoSeleccionadoId(dia.intensivo_dia_id);
      setDiaAsistenciaSeleccionadoId(dia.intensivo_dia_id);
      await cargarIntensivos();
      await cargarAgendaOperativaDirecta();
      await cargarPlanning();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function borrarDiaIntensivoDesdeApp(dia: IntensivoDiaApp) {
    const confirmar = window.confirm(
      `¿Borrar el día ${dia.numero_dia} del intensivo? Se borrarán también sus grupos, alumnos de esos grupos, reportes y trabajo diario asociados a ese día.`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('borrar_dia_intensivo_app', {
        p_intensivo_dia_id: dia.intensivo_dia_id,
      });

      setDiaEditandoIntensivoId(null);
      setFormDiaIntensivo(diaIntensivoInicial());
      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function añadirAlumnoAIntensivo(intensivo: IntensivoApp) {
    if (!alumnoSeleccionadoIntensivoId) {
      setError('Selecciona un alumno para añadir al intensivo.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('añadir_alumno_intensivo_app', {
        p_intensivo_id: intensivo.intensivo_id,
        p_alumno_id: alumnoSeleccionadoIntensivoId,
      });

      setAlumnoSeleccionadoIntensivoId('');
      setBusquedaAlumnoIntensivo('');
      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function añadirFichaExistenteAIntensivo(
    alumnoId: string,
    alumnoNombre: string
  ) {
    const intensivoId = intensivoFichaSeleccionado[alumnoId] || '';

    if (!intensivoId) {
      setError('Selecciona primero el Intensivo de destino.');
      return;
    }

    const intensivo = intensivos.find(
      (item) => item.intensivo_id === intensivoId
    );

    if (!intensivo) {
      setError('El Intensivo seleccionado ya no está disponible.');
      return;
    }

    const confirmar = window.confirm(
      `¿Añadir a ${alumnoNombre} a ${intensivo.intensivo}?` +
        `\n\nSe reutilizará su misma ficha maestra, nivel, historial y observaciones.`
    );

    if (!confirmar) return;

    setAnadiendoFichaAIntensivoId(alumnoId);
    setError('');

    try {
      await ejecutarFuncion('añadir_alumno_intensivo_app', {
        p_intensivo_id: intensivo.intensivo_id,
        p_alumno_id: alumnoId,
      });

      setIntensivoFichaSeleccionado((actual) => {
        const siguiente = { ...actual };
        delete siguiente[alumnoId];
        return siguiente;
      });

      await Promise.all([cargarIntensivos(), cargarAlumnos()]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setAnadiendoFichaAIntensivoId('');
    }
  }


  async function volcarListadoAlumnosIntensivo(intensivo: IntensivoApp) {
    if (!textoVolcadoIntensivo.trim()) {
      setError('Pega el listado de Aimharder antes de volcar alumnos.');
      return;
    }

    const confirmar = window.confirm(
      `¿Volcar este listado en ${intensivo.intensivo}? Se crearán fichas nuevas si no existen.`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      const resultado =
        await ejecutarFuncionConRespuesta<VolcadoAlumnoIntensivoApp>(
          'volcar_alumnos_intensivo_app',
          {
            p_intensivo_id: intensivo.intensivo_id,
            p_texto: textoVolcadoIntensivo,
          }
        );

      setResultadoVolcadoIntensivo(resultado);
      setBusquedaAlumnoIntensivo('');
      setAlumnoSeleccionadoIntensivoId('');
      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function quitarAlumnoDeIntensivo(registro: IntensivoAlumnoApp) {
    const confirmar = window.confirm(
      `¿Quitar a ${registro.alumno} de este intensivo?`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('quitar_alumno_intensivo_app', {
        p_intensivo_id: registro.intensivo_id,
        p_alumno_id: registro.alumno_id,
      });

      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function actualizarAlumnoIntensivo(
    registro: IntensivoAlumnoApp,
    estadoEvaluación: string,
    recomendacionSiguientePaso: string
  ) {
    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('actualizar_alumno_intensivo_app', {
        p_intensivo_alumno_id: registro.intensivo_alumno_id,
        p_estado_diploma: estadoEvaluación,
        p_recomendacion_siguiente_paso: recomendacionSiguientePaso,
      });

      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function actualizarNivelAlumnoIntensivo(
    registro: IntensivoAlumnoApp,
    nivelCodigo: string,
    origenNivel: string
  ) {
    if (!nivelCodigo) {
      setError('Selecciona un nivel para el alumno.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('actualizar_nivel_alumno_intensivo_app', {
        p_intensivo_id: registro.intensivo_id,
        p_alumno_id: registro.alumno_id,
        p_nivel_codigo: nivelCodigo,
        p_origen_nivel: origenNivel || 'Jose / Coordinador',
      });

      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function reiniciarGruposDiaIntensivoDesdeApp(
    dia: IntensivoDiaApp
  ) {
    const gruposDia = gruposNormalesDelDiaIntensivo(dia.intensivo_dia_id);

    if (gruposDia.length === 0) {
      setError('Este día todavía no tiene grupos que rehacer.');
      return;
    }

    const confirmar = window.confirm(
      `¿REHACER LOS GRUPOS DEL DÍA ${dia.numero_dia} · ${formatearFecha(
        dia.fecha
      )}?\n\nSe eliminarán los grupos, entrenadores asignados, Trabajo diario y Observaciones de ESTE DÍA, pero se conservarán la fecha, el Intensivo y sus alumnos inscritos.\n\nPor seguridad, Supabase bloqueará la operación si ya existen reportes, asistencia real o recuperaciones relacionadas.`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('reiniciar_grupos_intensivo_dia_app', {
        p_intensivo_dia_id: dia.intensivo_dia_id,
      });

      setRecomendacionesGrupoIntensivo((anteriores) =>
        anteriores.filter(
          (registro) => registro.intensivo_dia_id !== dia.intensivo_dia_id
        )
      );
      setDestinoAlumnoRecomendado({});
      setTrabajoDiarioPorGrupoRecomendado({});
      setObservacionesPorGrupoRecomendado({});

      await cargarIntensivos();
      await cargarAgendaOperativaDirecta();
      await cargarPlanning();
      await cargarGruposEntrenador();

      setDiaGrupoSeleccionadoId(dia.intensivo_dia_id);
      await generarRecomendacionGruposIntensivo(dia);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudieron rehacer los grupos de este día.'
      );
    } finally {
      setCargando(false);
    }
  }

  async function borrarGrupoIntensivo(grupo: GrupoIntensivoDiaApp) {
    if (!grupo.grupo_id) return;

    const confirmar = window.confirm(
      `¿Borrar el grupo ${
        grupo.nombre_grupo || 'sin nombre'
      }? Se eliminarán sus alumnos, entrenador, reportes y trabajo diario asociados.`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('borrar_grupo_intensivo_app', {
        p_grupo_id: grupo.grupo_id,
      });

      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function borrarIntensivoCompleto(intensivo: IntensivoApp) {
    const confirmar = window.confirm(
      `¿Borrar COMPLETO el intensivo ${intensivo.intensivo}? Se eliminarán días, grupos, alumnos inscritos, asistencias, reportes, recuperaciones y diplomas de este intensivo.`
    );

    if (!confirmar) return;

    const segundaConfirmacion = window.confirm(
      'Confirmación final: esto es para borrar pruebas. ¿Seguro que quieres continuar?'
    );

    if (!segundaConfirmacion) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('borrar_intensivo_completo_app', {
        p_intensivo_id: intensivo.intensivo_id,
      });

      setGestionarAlumnosIntensivoId(null);
      setGestionarGruposIntensivoId(null);
      setGestionarDiplomasIntensivoId(null);
      setGestionarMásIntensivoId(null);
      setGestionarAsistenciaIntensivoId(null);
      setGestionarPanelControlIntensivoId(null);
      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function marcarAsistenciaIntensivo(
    registro: IntensivoAsistenciaApp,
    estado: string,
    faltaGeneraRecuperacion: boolean
  ) {
    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('marcar_asistencia_intensivo_app', {
        p_intensivo_id: registro.intensivo_id,
        p_intensivo_dia_id: registro.intensivo_dia_id,
        p_alumno_id: registro.alumno_id,
        p_estado: estado,
        p_falta_genera_recuperacion: faltaGeneraRecuperacion,
      });

      if (faltaGeneraRecuperacion) {
        await ejecutarFuncion('generar_recuperaciones_desde_asistencias_app', {
          p_intensivo_id: registro.intensivo_id,
        });
      }

      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function generarMásDesdeAsistencias(intensivo: IntensivoApp) {
    const confirmar = window.confirm(
      `¿Generar recuperaciones pendientes desde las faltas marcadas de ${intensivo.intensivo}?`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('generar_recuperaciones_desde_asistencias_app', {
        p_intensivo_id: intensivo.intensivo_id,
      });

      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function actualizarRecuperacionIntensivo(
    registro: IntensivoRecuperacionApp,
    estado: string,
    intensivoDestinoId: string,
    grupoDestinoId: string
  ) {
    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('actualizar_recuperacion_intensivo_app', {
        p_recuperacion_id: registro.recuperacion_id,
        p_estado: estado,
        p_intensivo_destino_id: intensivoDestinoId || null,
        p_grupo_destino_id: grupoDestinoId || null,
      });

      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function eliminarRecuperacionIntensivo(
    registro: IntensivoRecuperacionApp
  ) {
    const confirmar = window.confirm(
      `¿Eliminar la recuperación de ${registro.alumno}?`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('eliminar_recuperacion_intensivo_app', {
        p_recuperacion_id: registro.recuperacion_id,
      });

      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function crearGrupoNormalIntensivo(
    intensivo: IntensivoApp,
    dia: IntensivoDiaApp | undefined
  ) {
    if (!dia) {
      setError('Primero selecciona un día del intensivo.');
      return;
    }

    if (!formGrupoIntensivo.nombre_grupo.trim()) {
      setError('Pon un nombre para el grupo.');
      return;
    }

    if (formGrupoIntensivo.alumnos_ids.length === 0) {
      setError('Selecciona al menos un alumno para el grupo.');
      return;
    }

    const alumnosValidacionManual = formGrupoIntensivo.alumnos_ids.map(() => ({
      nivel_resumen: formGrupoIntensivo.nivel_grupo,
      pista_recomendada: formGrupoIntensivo.pista,
    }));
    const validacionOk = confirmarCrearGrupoConValidacionPedagogicaApp(
      alumnosValidacionManual,
      formGrupoIntensivo.nombre_grupo.trim()
    );
    if (!validacionOk) return;

    const confirmar = window.confirm(
      `¿Preparar ${formGrupoIntensivo.nombre_grupo} para ${
        intensivo.intensivo
      } el ${formatearFecha(
        dia.fecha
      )}? Después asignarás entrenador, segundo entrenador y punto en Días de entrenamiento.`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('crear_grupo_intensivo_dia_app', {
        p_intensivo_dia_id: dia.intensivo_dia_id,
        p_nombre_grupo: formGrupoIntensivo.nombre_grupo.trim(),
        p_nivel_grupo: formGrupoIntensivo.nivel_grupo.trim(),
        p_pista: formGrupoIntensivo.pista,
        p_punto_encuentro: '',
        p_trabajo_diario: formGrupoIntensivo.trabajo_diario.trim(),
        p_observaciones_importantes: combinarObservacionesGrupoApp(
          observacionesAutomaticasGrupoIntensivoManual(
            formGrupoIntensivo.alumnos_ids
          ),
          formGrupoIntensivo.observaciones_importantes.trim()
        ),
        p_entrenador_id: null,
        p_alumnos_ids: formGrupoIntensivo.alumnos_ids,
        p_publicado: false,
      });



      setFormGrupoIntensivo(grupoIntensivoInicial());
      await cargarIntensivos();
      await cargarAgendaOperativaDirecta();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  function claveGrupoRecomendado(diaId: string, grupoRecomendado: string) {
    return `${diaId}__${grupoRecomendado}`;
  }

  function claveAlumnoRecomendado(diaId: string, alumnoId: string) {
    return `${diaId}__alumno__${alumnoId}`;
  }

  function destinoActualAlumnoRecomendado(
    diaId: string,
    alumno: RecomendacionGrupoIntensivoDiaApp
  ) {
    return (
      destinoAlumnoRecomendado[
        claveAlumnoRecomendado(diaId, alumno.alumno_id)
      ] || alumno.grupo_recomendado
    );
  }

  function nombresGruposBaseRecomendados(diaId: string) {
    return Array.from(
      new Set([
        ...recomendacionesDelDiaIntensivo(diaId)
          .map((registro) => registro.grupo_recomendado)
          .filter(Boolean),
        ...(gruposExtraIntensivoPorDia[diaId] || []),
      ])
    );
  }

  function crearGrupoVacioPropuestaIntensivo(diaId: string) {
    const existentes = nombresGruposBaseRecomendados(diaId);
    const siguienteNumero =
      existentes.reduce((maximo, nombre) => {
        const coincidencia = nombre.match(/Grupo\s+(\d+)/i);
        return Math.max(
          maximo,
          coincidencia ? Number(coincidencia[1]) : 0
        );
      }, 0) + 1;

    const nombre = `Grupo ${siguienteNumero}`;

    setGruposExtraIntensivoPorDia((anteriores) => ({
      ...anteriores,
      [diaId]: Array.from(
        new Set([...(anteriores[diaId] || []), nombre])
      ),
    }));
  }

  function recomendacionesDelDiaIntensivo(diaId: string) {
    return recomendacionesGrupoIntensivo.filter(
      (registro) => registro.intensivo_dia_id === diaId
    );
  }

  function agruparRecomendacionesDia(diaId: string) {
    const grupos = new Map<string, RecomendacionGrupoIntensivoDiaApp[]>();

    recomendacionesDelDiaIntensivo(diaId).forEach((registro) => {
      const destino = destinoActualAlumnoRecomendado(diaId, registro);
      if (destino === '__NO_CREAR__') return;

      const existentes = grupos.get(destino) || [];
      existentes.push({ ...registro, grupo_recomendado: destino });
      grupos.set(destino, existentes);
    });

    return Array.from(grupos.entries())
      .map(([nombreGrupo, alumnosGrupo]) => ({
        nombreGrupo,
        alumnosGrupo: alumnosGrupo.sort((a, b) => {
          return (
            Number(a.nivel_orden || 0) - Number(b.nivel_orden || 0) ||
            Number(a.edad || 99) - Number(b.edad || 99) ||
            a.alumno.localeCompare(b.alumno)
          );
        }),
      }))
      .sort((a, b) => {
        const primeroA = a.alumnosGrupo[0];
        const primeroB = b.alumnosGrupo[0];
        if (!primeroA || !primeroB) return 0;
        return (
          Number(primeroA.orden_bloque || 0) -
            Number(primeroB.orden_bloque || 0) ||
          a.nombreGrupo.localeCompare(b.nombreGrupo)
        );
      });
  }

  async function responderDisponibilidadRapida(
    turno: DisponibilidadEntrenador,
    respuesta: 'Disponible' | 'No puedo' | 'Pendiente'
  ) {
    const respuestaAnterior = turno.respuesta;
    setError('');

    setDisponibilidad((actual) =>
      actual.map((registro) =>
        registro.id === turno.id ? { ...registro, respuesta } : registro
      )
    );

    try {
      await ejecutarFuncionAuthJson('responder_disponibilidad_editor_app', {
        p_respuesta_id: turno.id,
        p_respuesta: respuesta,
        p_comentario: turno.comentario || null,
      });

      // Reconciliar siempre con el dato real que verá el entrenador.
      await cargarDisponibilidad(turno.fecha_inicio, true);


      try {
        await ejecutarPushMiticoApp('availability_response_updated', {
          respuesta_id: turno.id,
        });
      } catch (errorPush) {
        console.warn(
          'Disponibilidad guardada, pero no se pudo comprobar el aviso push de confirmación:',
          errorPush
        );
      }
    } catch (err) {
      setDisponibilidad((actual) =>
        actual.map((registro) =>
          registro.id === turno.id
            ? { ...registro, respuesta: respuestaAnterior }
            : registro
        )
      );
      setError(
        err instanceof Error ? err.message : 'Error guardando disponibilidad'
      );
    }
  }

  function abrirWhatsappDirectoEntrenador(
    entrenadorId: string,
    nombreEntrenador: string,
    mensaje: string
  ) {
    const nombreNormalizado = normalizarNombreFueraPlazoAgenda(
      nombreEntrenador
    );

    // Primero por ID. Si el entrenador se borró/recreó durante pruebas,
    // el ID histórico de reportes puede ser antiguo; en ese caso buscamos
    // la ficha actual por nombre para no perder el WhatsApp.
    const ficha =
      entrenadores.find(
        (entrenador) => entrenador.entrenador_id === entrenadorId
      ) ||
      entrenadores.find(
        (entrenador) =>
          normalizarNombreFueraPlazoAgenda(entrenador.nombre_completo) ===
          nombreNormalizado
      );

    const telefono = normalizarTelefonoWhatsappApp(ficha?.telefono);

    abrirPrevisualizacionWhatsapp(
      `WhatsApp personal · ${nombreEntrenador}`,
      mensaje,
      telefono || undefined
    );

    if (!telefono) {
      setError(
        `No encuentro un teléfono válido en la ficha actual de ${nombreEntrenador}. Puedes editar y copiar el mensaje manualmente.`
      );
    }
  }

  function mensajeWhatsappPendientesReportes(items: ReportePendiente[]) {
    const pendientes = items.filter(
      (reporte) =>
        reporte.estado_reporte === 'Falta reporte' ||
        reporte.estado_reporte === 'Asistencia sin confirmar'
    );

    if (pendientes.length === 0) {
      return 'Todo al día. No hay reportes pendientes ni asistencias sin confirmar.';
    }

    const porEntrenador = agruparReportesPorEntrenador(pendientes);
    let mensaje = 'Buenas equipo!\n\n';
    mensaje +=
      'Tenéis tareas pendientes en la app. Por favor entrad en Vista entrenador → Grupos / reportes y dejadlo cerrado.\n\n';

    porEntrenador.forEach((grupo) => {
      const faltanReportes = grupo.reportes.filter(
        (reporte) => reporte.estado_reporte === 'Falta reporte'
      );
      const faltanAsistencias = grupo.reportes.filter(
        (reporte) => reporte.estado_reporte === 'Asistencia sin confirmar'
      );
      mensaje += `⛷️ ${grupo.entrenador}\n`;
      if (faltanAsistencias.length > 0) {
        mensaje += `- Asistencias sin confirmar: ${faltanAsistencias.length}\n`;
        faltanAsistencias.slice(0, 6).forEach((reporte) => {
          mensaje += `  • ${formatearFecha(
            reporte.fecha
          )} ${reporte.hora_inicio.slice(0, 5)}-${reporte.hora_fin.slice(
            0,
            5
          )} · ${reporte.alumno} · ${reporte.nombre_grupo}\n`;
        });
      }
      if (faltanReportes.length > 0) {
        mensaje += `- Reportes pendientes: ${faltanReportes.length}\n`;
        faltanReportes.slice(0, 6).forEach((reporte) => {
          mensaje += `  • ${formatearFecha(
            reporte.fecha
          )} ${reporte.hora_inicio.slice(0, 5)}-${reporte.hora_fin.slice(
            0,
            5
          )} · ${reporte.alumno} · ${reporte.nombre_grupo}\n`;
        });
      }
      mensaje += '\n';
    });

    mensaje += 'Gracias!';
    return mensaje;
  }

  function copiarWhatsappPendientesReportes() {
    const mensaje = mensajeWhatsappPendientesReportes(reportesFiltrados);
    abrirPrevisualizacionWhatsapp(
      `WhatsApp entrenadores · pendientes semana ${rangoSemanaAgenda(
        semanaAgendaActiva
      )}`,
      mensaje
    );
  }

  function copiarWhatsappPendientesEntrenador(
    entrenadorId: string,
    nombreEntrenador: string,
    items: ReportePendiente[]
  ) {
    const mensaje = mensajeWhatsappPendientesReportes(items);
    abrirWhatsappDirectoEntrenador(
      entrenadorId,
      nombreEntrenador,
      mensaje
    );
  }

  function pendientesEntrenador(entrenadorId: string) {
    return reportesPendientes.filter(
      (reporte) =>
        reporte.entrenador_id === entrenadorId &&
        (reporte.estado_reporte === 'Falta reporte' ||
          reporte.estado_reporte === 'Asistencia sin confirmar')
    );
  }

  async function cargarWhatsappGruposApp() {
    try {
      const data = await consultarSupabase<WhatsappGrupoApp>(
        'whatsapp_grupos_app',
        'select=*&order=modalidad.asc,nombre_grupo.asc'
      );
      setWhatsappGruposApp(data);
    } catch {
      // La ausencia temporal de enlaces no debe bloquear la operativa.
      setWhatsappGruposApp([]);
    }
  }

  function contextoWhatsappSesionApp(sesion: AgendaSesionDirectaApp) {
    return sessionWhatsappContext({
      sessionId: sesion.sesion_id,
      modality: sesion.modalidad,
      intensiveDays: intensivoDias,
      intensives: intensivos,
    });
  }

  function enlaceWhatsappPorClaveApp(clave: string) {
    return whatsappGroupLinkByKey(whatsappGruposApp, clave);
  }

  function enlaceWhatsappSesionApp(sesion: AgendaSesionDirectaApp) {
    return enlaceWhatsappPorClaveApp(
      contextoWhatsappSesionApp(sesion).clave
    );
  }

  function contextoWhatsappIntensivoApp(intensivo: IntensivoApp) {
    return intensiveWhatsappContext(intensivo.intensivo_id, intensivo.intensivo);
  }

  function contextoWhatsappOcioGlobalApp() {
    return ocioWhatsappContext();
  }

  function contextoWhatsappAdministracionApp() {
    if (whatsappAdminTipo === 'BABY') {
      return babyWhatsappContext();
    }

    if (whatsappAdminTipo === 'OCIO') {
      return contextoWhatsappOcioGlobalApp();
    }

    const intensivo = intensivosAltaNivel.find(
      (item) => item.intensivo_id === whatsappAdminIntensivoId
    );

    if (!intensivo) return null;

    return {
      clave: `INTENSIVO:${intensivo.intensivo_id}`,
      modalidad: 'INTENSIVOS',
      referencia: intensivo.intensivo_id,
      nombre: intensivo.intensivo,
    };
  }

  async function guardarWhatsappAdministracionApp() {
    if (!puedeGestionarWhatsappApp) {
      setError('No tienes permiso para gestionar enlaces de WhatsApp.');
      return;
    }

    const contexto = contextoWhatsappAdministracionApp();
    if (!contexto) {
      setError('Selecciona primero un intensivo.');
      return;
    }

    const limpio = whatsappAdminEnlace.trim();
    if (!limpio) {
      setError('Pega primero el enlace del grupo de WhatsApp.');
      return;
    }

    if (!esEnlaceGrupoWhatsappValido(limpio)) {
      setError(
        'El enlace no parece un grupo de WhatsApp válido. Debe empezar por https://chat.whatsapp.com/'
      );
      return;
    }

    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('guardar_whatsapp_grupo_app', {
        p_clave_grupo: contexto.clave,
        p_modalidad: contexto.modalidad,
        p_referencia: contexto.referencia,
        p_nombre_grupo: contexto.nombre,
        p_enlace_whatsapp: limpio,
      });
      await cargarWhatsappGruposApp();
      alert(`WhatsApp guardado: ${contexto.nombre}.`);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo guardar el enlace de WhatsApp.'
      );
    } finally {
      setCargando(false);
    }
  }

  async function eliminarWhatsappAdministracionApp() {
    if (!puedeGestionarWhatsappApp) {
      setError('No tienes permiso para gestionar enlaces de WhatsApp.');
      return;
    }

    const contexto = contextoWhatsappAdministracionApp();
    if (!contexto) {
      setError('Selecciona primero un intensivo.');
      return;
    }

    const actual = enlaceWhatsappPorClaveApp(contexto.clave);
    if (!actual) return;

    if (!window.confirm(`¿Eliminar el enlace de ${contexto.nombre}?`)) return;

    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('eliminar_whatsapp_grupo_app', {
        p_clave_grupo: contexto.clave,
      });
      await cargarWhatsappGruposApp();
      setWhatsappAdminEnlace('');
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo eliminar el enlace de WhatsApp.'
      );
    } finally {
      setCargando(false);
    }
  }

  function abrirWhatsappAdministracionApp() {
    const enlace = whatsappAdminEnlace.trim();
    if (!esEnlaceGrupoWhatsappValido(enlace)) {
      setError('Guarda primero un enlace de WhatsApp válido.');
      return;
    }
    setError('');
    window.open(enlace, '_blank', 'noopener,noreferrer');
  }

  function abrirGrupoWhatsappDesdePreview() {
    if (!whatsappPreview?.texto.trim()) return;

    const enlace = String(whatsappPreview.enlaceGrupoWhatsapp || '').trim();

    if (!enlace) {
      setError(
        'Este grupo todavía no tiene enlace de WhatsApp. Pégalo y guárdalo primero.'
      );
      return;
    }

    if (!esEnlaceGrupoWhatsappValido(enlace)) {
      setError(
        'El enlace configurado no parece válido. Revisa el enlace del grupo de WhatsApp.'
      );
      return;
    }

    const texto = whatsappPreview.texto;

    // Se ejecuta dentro del mismo clic para que el navegador permita
    // tanto copiar al portapapeles como abrir WhatsApp sin pasos intermedios.
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(texto).then(
        () => {
          setWhatsappPreview((actual) =>
            actual ? { ...actual, mensajeGrupoCopiado: true } : actual
          );
        },
        () => {
          setWhatsappPreview((actual) =>
            actual ? { ...actual, mensajeGrupoCopiado: false } : actual
          );
        }
      );
    }

    setError('');
    window.open(enlace, '_blank', 'noopener,noreferrer');
  }

  // Extraído de mensajeWhatsAppPapisSesionActual para poder generar el mismo
  // mensaje también para una sesión que NO está abierta (tarjeta del día),
  // sin depender de agendaSesionActivaId/agendaGruposSesion.
  function construirMensajeWhatsAppPapisSesion(
    sesion: AgendaSesionDirectaApp,
    gruposSesion: AgendaGrupoSesionApp[]
  ) {
    const grupos = gruposSesion.filter((grupo) => grupo.grupo_id);
    if (grupos.length === 0) return '';

    const diaTexto = capitalizarPrimera(
      crearFechaAgenda(sesion.fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    );

    let mensaje = `*${diaTexto}* ⛷️💨\n`;
    mensaje += `⏰ horario de ${sesion.hora_inicio.slice(
      0,
      5
    )} a ${sesion.hora_fin.slice(0, 5)} MSZ\n\n`;

    grupos.forEach((grupo) => {
      const entrenadores = nombresEntrenadoresDelGrupo(
        grupo.grupo_id,
        grupo.entrenador
      );

      mensaje += `⛷️ ${(
        entrenadoresWhatsappPapis(entrenadores) || 'ENTRENADOR PENDIENTE'
      ).toUpperCase()}\n`;
      mensaje += `📍${emojiPuntoEncuentro(grupo.punto_encuentro)}\n`;
      mensaje += '👶\n';

      String(grupo.alumnos_lista || '')
        .split(' || ')
        .map((alumno) => nombreAlumnoWhatsappPapis(alumno))
        .filter((alumno) => alumno && alumno !== '-')
        .forEach((alumno) => {
          mensaje += `${alumno}\n`;
        });

      mensaje += '\n';
    });

    mensaje += '¡Nos vemos en MSZ equipo!\n';
    mensaje += '⚠️Papis importante!\n';
    mensaje += `Como la logística con los peques se puede complicar un poco, os recomiendo estar 20-25 minutos antes de la hora de entrada ya que a las ${sesion.hora_inicio.slice(
      0,
      5
    )} el grupo estará entrando en pista con su entrenador.\n`;
    mensaje +=
      'Si alguno llegáis tarde, avisad en este número: Jose +34 647 027 692';

    return mensaje;
  }

  function mensajeWhatsAppPapisSesionActual() {
    const sesion = agendaSesionesDirectas.find(
      (item) => item.sesion_id === agendaSesionActivaId
    );

    if (!sesion) return '';

    return construirMensajeWhatsAppPapisSesion(sesion, agendaGruposSesion);
  }

  function copiarMensajeWhatsAppPapisSesionActual() {
    const mensaje = mensajeWhatsAppPapisSesionActual();
    if (!mensaje) {
      setError('Primero abre una sesión con grupos creados.');
      return;
    }

    const sesion = agendaSesionesDirectas.find(
      (item) => item.sesion_id === agendaSesionActivaId
    );
    const titulo = sesion
      ? `WhatsApp papis · ${sesion.modalidad} ${sesion.hora_inicio.slice(
          0,
          5
        )}-${sesion.hora_fin.slice(0, 5)}`
      : 'WhatsApp papis';
    if (sesion) {
      const contexto = contextoWhatsappSesionApp(sesion);

      abrirPrevisualizacionWhatsapp(titulo, mensaje, undefined, {
        clave: contexto.clave,
        modalidad: contexto.modalidad,
        referencia: contexto.referencia,
        nombre: contexto.nombre,
        enlace: enlaceWhatsappSesionApp(sesion),
      });
      return;
    }

    abrirPrevisualizacionWhatsapp(titulo, mensaje);
  }

  // Igual que copiarMensajeWhatsAppPapisSesionActual, pero para una sesión
  // que todavía no está abierta (tarjeta del día en el listado de la
  // agenda). Reutiliza los grupos ya cargados si esa sesión ya es la activa;
  // si no, los consulta puntualmente (misma vista que cargarDetalleSesionAgenda).
  async function enviarWhatsAppPapisSesionTarjeta(
    sesion: SesionAgendaOperativa
  ) {
    const sesionDirecta = sesion.agendaDirecta;
    if (!sesionDirecta) {
      setError('Este WhatsApp solo está disponible para sesiones operativas.');
      return;
    }

    setError('');

    try {
      const grupos =
        agendaSesionActivaId === sesionDirecta.sesion_id &&
        agendaGruposSesion.length > 0
          ? agendaGruposSesion
          : await consultarSupabase<AgendaGrupoSesionApp>(
              'v_grupos_sesion_operativa_app',
              `select=*&sesion_id=${encodeURIComponent(
                `eq.${sesionDirecta.sesion_id}`
              )}&order=nombre_grupo.asc`
            );

      const mensaje = construirMensajeWhatsAppPapisSesion(
        sesionDirecta,
        grupos
      );
      if (!mensaje) {
        setError('Esta sesión todavía no tiene grupos creados.');
        return;
      }

      const titulo = `WhatsApp papis · ${
        sesionDirecta.modalidad
      } ${sesionDirecta.hora_inicio.slice(
        0,
        5
      )}-${sesionDirecta.hora_fin.slice(0, 5)}`;
      const contexto = contextoWhatsappSesionApp(sesionDirecta);

      abrirPrevisualizacionWhatsapp(titulo, mensaje, undefined, {
        clave: contexto.clave,
        modalidad: contexto.modalidad,
        referencia: contexto.referencia,
        nombre: contexto.nombre,
        enlace: enlaceWhatsappSesionApp(sesionDirecta),
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo preparar el WhatsApp de esta sesión.'
      );
    }
  }

  function generarTrabajoDiarioAutomaticoGrupo(
    nombreGrupo: string,
    alumnosGrupo: RecomendacionGrupoIntensivoDiaApp[]
  ) {
    const niveles = alumnosGrupo
      .map((a) => a.nivel_resumen || '')
      .filter(Boolean);
    const pista = alumnosGrupo[0]?.pista_recomendada || 'Pequeña/Grande';
    const observaciones = observacionesAutomaticasGrupoIntensivo(alumnosGrupo);
    const alumnosContexto = alumnosGrupo.map((alumno) =>
      contextoAlumnoTrabajoDiarioApp(
        alumno.alumno_id,
        alumno.alumno,
        alumno.nivel_resumen || ''
      )
    );

    const trabajosRecientes = trabajosRecientesParaGrupoApp(
      alumnosGrupo.map((alumno) => alumno.alumno),
      alumnosGrupo[0]?.fecha
    );

    return trabajoDiarioMSZApp(
      nombreGrupo,
      niveles,
      pista,
      observaciones,
      alumnosContexto,
      'INTENSIVOS',
      trabajosRecientes
    );
  }

  function textoBaseDiplomaIntensivo(
    registro: ResumenFinalIntensivoApp,
    reportes: ReporteDetalleIntensivoApp[]
  ) {
    return buildIntensiveDiplomaBase(registro, reportes, {
      formatDate: formatearFecha,
      levelCodeById: codigoNivelPorId,
      summarizeTechnicalEvaluation: resumenEvaluacionTecnica,
    });
  }

  function clonarRecomendacionIntensivoParaDia(
    registro: RecomendacionGrupoIntensivoDiaApp,
    dia: IntensivoDiaApp
  ): RecomendacionGrupoIntensivoDiaApp {
    return {
      ...registro,
      intensivo_dia_id: dia.intensivo_dia_id,
      intensivo_id: dia.intensivo_id,
      numero_dia: dia.numero_dia,
      fecha: dia.fecha,
    };
  }

  async function generarPlantillaCuatroDiasIntensivo(
    intensivo: IntensivoApp
  ) {
    const dias = diasDelIntensivo(intensivo.intensivo_id)
      .slice()
      .sort((a, b) => a.numero_dia - b.numero_dia);

    if (dias.length !== 4) {
      setError(
        `Este intensivo debe tener 4 días antes de generar la plantilla. Ahora tiene ${dias.length}.`
      );
      return;
    }

    if (
      dias.some(
        (dia) =>
          gruposNormalesDelDiaIntensivo(dia.intensivo_dia_id).length > 0
      )
    ) {
      setError(
        'Ya hay grupos creados. Para modificar un día usa “Editar composición del día”.'
      );
      return;
    }

    const diaBase =
      dias.find(
        (dia) => dia.intensivo_dia_id === diaGrupoSeleccionadoId
      ) || dias[0];

    setCargando(true);
    setError('');

    try {
      const resultado =
        await ejecutarFuncionConRespuesta<RecomendacionGrupoIntensivoDiaApp>(
          'recomendar_grupos_intensivo_dia_app',
          { p_intensivo_dia_id: diaBase.intensivo_dia_id }
        );

      const resultadoPedagogico =
        aplicarCinturonPedagogicoAutomaticoIntensivo(resultado);

      if (resultadoPedagogico.length === 0) {
        throw new Error(
          'No hay alumnos disponibles para generar la plantilla.'
        );
      }

      const idsDias = new Set(dias.map((dia) => dia.intensivo_dia_id));
      const clonados = dias.flatMap((dia) =>
        resultadoPedagogico.map((registro) =>
          clonarRecomendacionIntensivoParaDia(registro, dia)
        )
      );

      setRecomendacionesGrupoIntensivo((anteriores) => [
        ...anteriores.filter(
          (registro) => !idsDias.has(registro.intensivo_dia_id)
        ),
        ...clonados,
      ]);

      setDestinoAlumnoRecomendado((anteriores) => {
        const copia = { ...anteriores };
        Object.keys(copia).forEach((clave) => {
          if (
            dias.some((dia) =>
              clave.startsWith(`${dia.intensivo_dia_id}__alumno__`)
            )
          ) {
            delete copia[clave];
          }
        });

        clonados.forEach((registro) => {
          copia[
            claveAlumnoRecomendado(
              registro.intensivo_dia_id,
              registro.alumno_id
            )
          ] = registro.grupo_recomendado;
        });
        return copia;
      });

      setGruposExtraIntensivoPorDia((anteriores) => {
        const copia = { ...anteriores };
        dias.forEach((dia) => {
          copia[dia.intensivo_dia_id] = [];
        });
        return copia;
      });

      setTrabajoDiarioPorGrupoRecomendado({});
      setObservacionesPorGrupoRecomendado({});
      setDiaGrupoSeleccionadoId(dias[0].intensivo_dia_id);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error generando plantilla'
      );
    }

    setCargando(false);
  }


  function maxRatioGrupoRevisionIntensivoApp(
    _fila: GrupoEditableIntensivoDiaApp
  ) {
    // La revisión entre días puede proponer grupos pedagógicamente más
    // pequeños, pero el máximo operativo Baby es siempre 7. Si un grupo bajo
    // queda con 5–7 alumnos, el segundo entrenador se asigna antes de publicar.
    return 7;
  }

  function convertirFilaEditableARecomendacionIntensivoApp(
    fila: GrupoEditableIntensivoDiaApp,
    tamanioGrupo: number
  ): RecomendacionGrupoIntensivoDiaApp {
    return {
      intensivo_dia_id: fila.intensivo_dia_id,
      intensivo_id: fila.intensivo_id,
      numero_dia: fila.numero_dia,
      fecha: fila.fecha,
      grupo_recomendado: fila.nombre_grupo,
      bloque_tecnico: fila.nivel_grupo || 'REVISIÓN',
      orden_bloque:
        Number(fila.nivel_orden || 0) <= 1
          ? 1
          : Number(fila.nivel_orden || 0) <= 3
          ? 2
          : 3,
      pista_recomendada: fila.pista || 'Pequeña/Grande',
      tamanio_grupo: tamanioGrupo,
      alerta_grupo: 'OK',
      alumno_id: fila.alumno_id,
      alumno: fila.alumno,
      nivel_resumen: fila.nivel_resumen,
      nivel_orden: fila.nivel_orden,
      fuente_nivel: fila.fuente_nivel,
      edad: fila.edad,
      estado_ficha: fila.estado_ficha,
      observacion_visible_entrenador:
        fila.observacion_visible_entrenador,
      orden_en_grupo: fila.orden_en_grupo,
    };
  }

  function textoMotivoRevisionIntensivoApp(
    perfil: PerfilOperativoAlumnoApp | undefined,
    grupoDestino: string
  ) {
    const partes: string[] = [];

    if (
      perfil?.fuerza_nivel === 'FUERTE' ||
      perfil?.fuerza_nivel === 'MUY_FUERTE'
    ) {
      partes.push(
        perfil.fuerza_nivel === 'MUY_FUERTE'
          ? 'ritmo muy alto'
          : 'ritmo alto'
      );
    } else if (perfil?.fuerza_nivel === 'BAJO') {
      partes.push('ritmo bajo para su nivel');
    }

    if (perfil?.autonomia_reciente) {
      partes.push(`autonomía: ${perfil.autonomia_reciente}`);
    }

    if (perfil?.demanda_atencion === 'ALTA') {
      partes.push('necesita bastante atención');
    }

    if (partes.length === 0) {
      partes.push('mejor encaje con el perfil actual del grupo');
    }

    return `${partes.join(' · ')} → ${grupoDestino}`;
  }

  async function analizarRevisionEntreSesionesIntensivo() {
    if (!revisionIntensivoId || !revisionIntensivoDiaId) {
      setError('Selecciona intensivo y día a revisar.');
      return;
    }

    setRevisionIntensivoAnalizando(true);
    setRevisionIntensivoAnalizado(false);
    setRevisionIntensivoSugerencias([]);
    setError('');

    try {
      const [filas, perfilesActualizados] = await Promise.all([
        ejecutarFuncionConRespuesta<GrupoEditableIntensivoDiaApp>(
          'obtener_grupos_intensivo_dia_editables_app',
          { p_intensivo_dia_id: revisionIntensivoDiaId }
        ),
        ejecutarFuncionConRespuesta<PerfilOperativoAlumnoApp>(
          'obtener_perfil_operativo_alumnos_app',
          {}
        ).catch(() => [] as PerfilOperativoAlumnoApp[]),
      ]);

      if (filas.length === 0) {
        throw new Error(
          'Este día todavía no tiene grupos creados para revisar.'
        );
      }

      const perfiles = Array.isArray(perfilesActualizados)
        ? perfilesActualizados
        : perfilesOperativosAlumnos;

      if (perfiles.length > 0) {
        setPerfilesOperativosAlumnos(perfiles);
      }

      const porGrupo = new Map<string, GrupoEditableIntensivoDiaApp[]>();
      filas.forEach((fila) => {
        const existentes = porGrupo.get(fila.grupo_id) || [];
        existentes.push(fila);
        porGrupo.set(fila.grupo_id, existentes);
      });

      const mediaGrupo = new Map<string, number>();

      porGrupo.forEach((miembros, grupoId) => {
        const puntuaciones = miembros.map((fila) => {
          const convertido =
            convertirFilaEditableARecomendacionIntensivoApp(
              fila,
              miembros.length
            );
          return puntuacionFuncionalIntensivoApp(convertido, perfiles);
        });

        mediaGrupo.set(
          grupoId,
          puntuaciones.reduce((suma, valor) => suma + valor, 0) /
            Math.max(1, puntuaciones.length)
        );
      });

      const sugerencias: RevisionEntreSesionesIntensivoApp[] = [];

      filas.forEach((fila) => {
        const grupoOrigen = porGrupo.get(fila.grupo_id) || [];
        const convertido =
          convertirFilaEditableARecomendacionIntensivoApp(
            fila,
            grupoOrigen.length
          );

        const puntuacionAlumno =
          puntuacionFuncionalIntensivoApp(convertido, perfiles);

        const mediaOrigen = mediaGrupo.get(fila.grupo_id);
        if (mediaOrigen === undefined) return;

        const diferenciaActual = Math.abs(
          puntuacionAlumno - mediaOrigen
        );

        let mejor:
          | {
              grupoId: string;
              grupo: GrupoEditableIntensivoDiaApp[];
              diferencia: number;
            }
          | undefined;

        porGrupo.forEach((grupoDestino, grupoDestinoId) => {
          if (grupoDestinoId === fila.grupo_id) return;
          if (grupoDestino.length === 0) return;

          const representante = grupoDestino[0];
          const maxRatio =
            maxRatioGrupoRevisionIntensivoApp(representante);

          if (grupoDestino.length + 1 > maxRatio) return;
          if (grupoOrigen.length - 1 < 3) return;

          const ordenAlumno =
            nivelOrdenPedagogicoApp(fila.nivel_resumen);

          const ordenesDestino = grupoDestino.map((item) =>
            nivelOrdenPedagogicoApp(item.nivel_resumen)
          );
          const mediaOrdenDestino =
            ordenesDestino.reduce((suma, valor) => suma + valor, 0) /
            Math.max(1, ordenesDestino.length);

          // Solo niveles iguales o adyacentes: no inventar saltos.
          if (Math.abs(ordenAlumno - mediaOrdenDestino) > 1.25) return;

          const mediaDestino = mediaGrupo.get(grupoDestinoId);
          if (mediaDestino === undefined) return;

          const diferencia = Math.abs(
            puntuacionAlumno - mediaDestino
          );

          if (!mejor || diferencia < mejor.diferencia) {
            mejor = {
              grupoId: grupoDestinoId,
              grupo: grupoDestino,
              diferencia,
            };
          }
        });

        if (!mejor) return;

        const mejora = diferenciaActual - mejor.diferencia;

        // Solo sugerimos si el destino es claramente mejor.
        if (mejora < 3) return;

        const perfil = perfiles.find(
          (item) => item.alumno_id === fila.alumno_id
        );

        const estado =
          mejora >= 6 &&
          (perfil?.confianza_ritmo === 'ALTA' ||
            perfil?.confianza_ritmo === 'MEDIA' ||
            Number(perfil?.reportes_ritmo || 0) >= 2)
            ? 'CAMBIO_RECOMENDADO'
            : 'REVISAR';

        sugerencias.push({
          alumno_id: fila.alumno_id,
          alumno: fila.alumno,
          nivel: fila.nivel_resumen,
          grupo_origen_id: fila.grupo_id,
          grupo_origen: fila.nombre_grupo,
          grupo_destino_id: mejor.grupoId,
          grupo_destino: mejor.grupo[0].nombre_grupo,
          estado,
          motivo: textoMotivoRevisionIntensivoApp(
            perfil,
            mejor.grupo[0].nombre_grupo
          ),
          diferencia_actual: Number(diferenciaActual.toFixed(1)),
          diferencia_destino: Number(mejor.diferencia.toFixed(1)),
        });
      });

      sugerencias.sort((a, b) => {
        const prioridad = {
          CAMBIO_RECOMENDADO: 0,
          REVISAR: 1,
          MANTENER: 2,
        } as const;

        return (
          prioridad[a.estado] - prioridad[b.estado] ||
          a.diferencia_destino - b.diferencia_destino ||
          a.alumno.localeCompare(b.alumno)
        );
      });

      setRevisionIntensivoSugerencias(sugerencias);
      setRevisionIntensivoAnalizado(true);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo revisar el intensivo.'
      );
    } finally {
      setRevisionIntensivoAnalizando(false);
    }
  }

  async function aplicarCambioAlumnoIntensivoDesdeDia(
    alumnoId: string,
    alumnoNombre: string,
    grupoDestinoNombre: string
  ) {
    const diaInicio = intensivoDias.find(
      (item) => item.intensivo_dia_id === revisionIntensivoDiaId
    );

    if (!diaInicio) {
      throw new Error('No encuentro el día desde el que debe aplicarse el cambio.');
    }

    const diasAfectados = intensivoDias
      .filter(
        (item) =>
          item.intensivo_id === diaInicio.intensivo_id &&
          item.numero_dia >= diaInicio.numero_dia
      )
      .slice()
      .sort((a, b) => a.numero_dia - b.numero_dia);

    const filasPorDia = new Map(
      await Promise.all(
        diasAfectados.map(async (dia) => [
          dia.intensivo_dia_id,
          await ejecutarFuncionConRespuesta<GrupoEditableIntensivoDiaApp>(
            'obtener_grupos_intensivo_dia_editables_app',
            { p_intensivo_dia_id: dia.intensivo_dia_id }
          ),
        ] as const)
      )
    );
    const plan = planIntensiveFutureMove({
      studentId: alumnoId,
      studentName: alumnoNombre,
      targetGroupName: grupoDestinoNombre,
      days: diasAfectados,
      rowsByDay: filasPorDia,
      maximumForGroup: maxRatioGrupoRevisionIntensivoApp,
    });

    const resumenPlan = plan
      .map(
        (item) =>
          `Día ${item.dia.numero_dia}: ${item.grupo_origen} → ${item.grupo_destino}`
      )
      .join('\n');

    const confirmar = window.confirm(
      `¿Confirmar cambio de grupo para ${alumnoNombre}?\n\n${resumenPlan}\n\nEl cambio empieza en el Día ${diaInicio.numero_dia} y se mantiene en los días siguientes. Los días anteriores NO se modifican.`
    );

    if (!confirmar) return false;

    for (const item of plan) {
      const movimiento = requireValidGroupMove({
        studentId: alumnoId,
        sourceGroupId: item.grupo_origen_id,
        targetGroupId: item.grupo_destino_id,
      });
      await ejecutarFuncion(GROUP_OPERATION_RPC.moveStudent, {
        p_alumno_id: movimiento.studentId,
        p_grupo_origen_id: movimiento.sourceGroupId,
        p_grupo_destino_id: movimiento.targetGroupId,
      });
    }

    await cargarIntensivos();
    await cargarGruposEntrenador();
    await cargarPlanning();
    await cargarReportesPendientes();

    setRevisionIntensivoSugerencias([]);
    setRevisionIntensivoAnalizado(false);

    return true;
  }

  async function prepararCambioRevisionIntensivo(
    sugerencia: RevisionEntreSesionesIntensivoApp
  ) {
    setCargando(true);
    setError('');

    try {
      await aplicarCambioAlumnoIntensivoDesdeDia(
        sugerencia.alumno_id,
        sugerencia.alumno,
        sugerencia.grupo_destino
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo aplicar el cambio recomendado.'
      );
    } finally {
      setCargando(false);
    }
  }

  async function moverAlumnoManualRevisionIntensivo() {
    const dia = intensivoDias.find(
      (item) => item.intensivo_dia_id === revisionIntensivoDiaId
    );

    if (!dia) {
      setError('Selecciona primero el día desde el que quieres hacer el cambio.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const filas =
        await ejecutarFuncionConRespuesta<GrupoEditableIntensivoDiaApp>(
          'obtener_grupos_intensivo_dia_editables_app',
          { p_intensivo_dia_id: dia.intensivo_dia_id }
        );

      if (filas.length === 0) {
        throw new Error('Este día todavía no tiene grupos creados.');
      }

      const alumnos = filas
        .slice()
        .sort(
          (a, b) =>
            a.nombre_grupo.localeCompare(b.nombre_grupo) ||
            a.orden_en_grupo - b.orden_en_grupo ||
            a.alumno.localeCompare(b.alumno)
        );

      const textoAlumnos = alumnos
        .map(
          (fila, indice) =>
            `${indice + 1}. ${fila.alumno} · ${fila.nivel_resumen || 'SIN NIVEL'} · ${fila.nombre_grupo}`
        )
        .join('\n');

      const seleccionAlumno = window.prompt(
        `Mover manualmente desde el Día ${dia.numero_dia}\n\nElige alumno:\n${textoAlumnos}`
      );

      if (!seleccionAlumno) return;

      const alumno = alumnos[Number(seleccionAlumno) - 1];

      if (!alumno) {
        throw new Error('La selección de alumno no es válida.');
      }

      const gruposMapa = new Map<
        string,
        {
          grupo_id: string;
          nombre_grupo: string;
          nivel_grupo: string | null;
          pista: string | null;
          total: number;
        }
      >();

      filas.forEach((fila) => {
        const actual = gruposMapa.get(fila.grupo_id);
        if (actual) {
          actual.total += 1;
        } else {
          gruposMapa.set(fila.grupo_id, {
            grupo_id: fila.grupo_id,
            nombre_grupo: fila.nombre_grupo,
            nivel_grupo: fila.nivel_grupo,
            pista: fila.pista,
            total: 1,
          });
        }
      });

      const destinos = Array.from(gruposMapa.values()).filter(
        (grupo) => grupo.grupo_id !== alumno.grupo_id
      );

      if (destinos.length === 0) {
        throw new Error('No hay otro grupo de destino en este día.');
      }

      const textoDestinos = destinos
        .map(
          (grupo, indice) =>
            `${indice + 1}. ${grupo.nombre_grupo} · ${grupo.nivel_grupo || 'SIN NIVEL'} · ${grupo.pista || '-'} · ${grupo.total} niños`
        )
        .join('\n');

      const seleccionDestino = window.prompt(
        `${alumno.alumno}\nGrupo actual: ${alumno.nombre_grupo}\n\nElige nuevo grupo desde el Día ${dia.numero_dia}:\n${textoDestinos}`
      );

      if (!seleccionDestino) return;

      const destino = destinos[Number(seleccionDestino) - 1];

      if (!destino) {
        throw new Error('La selección de grupo destino no es válida.');
      }

      await aplicarCambioAlumnoIntensivoDesdeDia(
        alumno.alumno_id,
        alumno.alumno,
        destino.nombre_grupo
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo hacer el cambio manual.'
      );
    } finally {
      setCargando(false);
    }
  }

async function abrirGestionOperativaIntensivoDia(
    dia: IntensivoDiaApp | undefined
  ) {
    if (!dia?.sesion_id) {
      setError(
        'Este día todavía no tiene una sesión operativa asociada. Crea primero sus grupos.'
      );
      return;
    }

    setError('');

    const [anioDia, mesDia] = dia.fecha.split('-').map(Number);
    const mesObjetivo = `${anioDia}-${String(mesDia).padStart(2, '0')}`;
    const semanaObjetivo = inicioSemanaAgenda(dia.fecha);

    // Sincroniza TODOS los selectores de Días de entrenamiento con el día
    // elegido en Intensivos. Antes solo cambiaba la sesión interna y la UI
    // seguía enseñando el miércoles/semana anterior.
    setAnioInicioTemporadaAgenda(
      mesDia >= 9 ? anioDia : anioDia - 1
    );
    setMesAgenda(mesObjetivo);
    setSemanaAgendaInicio(semanaObjetivo);
    setAgendaDiaCompactoActivo(dia.fecha);
    setAgendaFormularioAbierto(false);
    setAgendaSesionActivaId(dia.sesion_id);
    setPantalla('agenda');

    try {
      await cargarAgendaOperativaDirecta();
      await cargarDetalleSesionAgenda(dia.sesion_id, {
        preservarScroll: true,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo abrir este día en Días de entrenamiento.'
      );
      return;
    }

    // Damos tiempo a React para renderizar mes + semana + día + sesión.
    // Primer salto: tarjeta del día correcto.
    window.setTimeout(() => {
      document
        .getElementById('agenda-dia-seleccionado')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 220);

    // Segundo salto: grupos concretos de esa sesión.
    window.setTimeout(() => {
      document
        .getElementById('agenda-grupos-creados')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 520);
  }

  async function cargarEdicionGruposIntensivoDia(
    dia: IntensivoDiaApp | undefined
  ) {
    if (!dia) {
      setError('Selecciona un día.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const filas =
        await ejecutarFuncionConRespuesta<GrupoEditableIntensivoDiaApp>(
          'obtener_grupos_intensivo_dia_editables_app',
          { p_intensivo_dia_id: dia.intensivo_dia_id }
        );

      if (filas.length === 0) {
        throw new Error('Este día todavía no tiene grupos creados.');
      }

      if (filas.some((fila) => fila.publicado)) {
        throw new Error(
          'Este día ya está publicado. Los cambios operativos se hacen desde Días de entrenamiento.'
        );
      }

      if (filas.some((fila) => Boolean(fila.entrenador_id))) {
        throw new Error(
          'Este día ya tiene entrenador asignado. Quita primero los recursos en Días de entrenamiento.'
        );
      }

      const tamanios = new Map<string, number>();
      filas.forEach((fila) =>
        tamanios.set(
          fila.grupo_id,
          Number(tamanios.get(fila.grupo_id) || 0) + 1
        )
      );

      const convertidas: RecomendacionGrupoIntensivoDiaApp[] =
        filas.map((fila) => ({
          intensivo_dia_id: fila.intensivo_dia_id,
          intensivo_id: fila.intensivo_id,
          numero_dia: fila.numero_dia,
          fecha: fila.fecha,
          grupo_recomendado: fila.nombre_grupo,
          bloque_tecnico: fila.nivel_grupo || 'REVISIÓN MANUAL',
          orden_bloque:
            Number(fila.nivel_orden || 0) <= 1
              ? 1
              : Number(fila.nivel_orden || 0) <= 3
                ? 2
                : 3,
          pista_recomendada: fila.pista || 'Pequeña/Grande',
          tamanio_grupo: tamanios.get(fila.grupo_id) || 1,
          alerta_grupo: 'OK',
          alumno_id: fila.alumno_id,
          alumno: fila.alumno,
          nivel_resumen: fila.nivel_resumen,
          nivel_orden: fila.nivel_orden,
          fuente_nivel: fila.fuente_nivel,
          edad: fila.edad,
          estado_ficha: fila.estado_ficha,
          observacion_visible_entrenador:
            fila.observacion_visible_entrenador,
          orden_en_grupo: fila.orden_en_grupo,
        }));

      setRecomendacionesGrupoIntensivo((anteriores) => [
        ...anteriores.filter(
          (registro) =>
            registro.intensivo_dia_id !== dia.intensivo_dia_id
        ),
        ...convertidas,
      ]);

      setDestinoAlumnoRecomendado((anteriores) => {
        const copia = { ...anteriores };
        convertidas.forEach((registro) => {
          copia[
            claveAlumnoRecomendado(
              dia.intensivo_dia_id,
              registro.alumno_id
            )
          ] = registro.grupo_recomendado;
        });
        return copia;
      });

      setGruposExtraIntensivoPorDia((anteriores) => ({
        ...anteriores,
        [dia.intensivo_dia_id]: Array.from(
          new Set(filas.map((fila) => fila.nombre_grupo))
        ),
      }));

      const primeras = Array.from(
        new Map(filas.map((fila) => [fila.nombre_grupo, fila])).values()
      );

      setTrabajoDiarioPorGrupoRecomendado((anteriores) => {
        const copia = { ...anteriores };
        primeras.forEach((fila) => {
          copia[
            claveGrupoRecomendado(
              dia.intensivo_dia_id,
              fila.nombre_grupo
            )
          ] = fila.trabajo_diario || '';
        });
        return copia;
      });

      setObservacionesPorGrupoRecomendado((anteriores) => {
        const copia = { ...anteriores };
        primeras.forEach((fila) => {
          copia[
            claveGrupoRecomendado(
              dia.intensivo_dia_id,
              fila.nombre_grupo
            )
          ] = fila.observaciones_importantes || '';
        });
        return copia;
      });

      window.setTimeout(() => {
        document
          .getElementById(
            `intensivo-editor-grupos-${dia.intensivo_dia_id}`
          )
          ?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
      }, 100);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Error cargando composición'
      );
    }

    setCargando(false);
  }

  async function crearGrupoIntensivoPropuestaPersistida(
    dia: IntensivoDiaApp,
    nombreGrupo: string,
    alumnosGrupo: RecomendacionGrupoIntensivoDiaApp[],
    opciones?: {
      trabajoDiario?: string;
      observaciones?: string;
    }
  ) {
    if (alumnosGrupo.length === 0) return null;

    const validacion = textoValidacionPedagogicaGrupoApp(alumnosGrupo);
    if (validacion.estado === 'BLOQUEADO') {
      throw new Error(
        `${nombreGrupo}: ${validacion.mensajes.join(' ') || 'La composición del grupo está bloqueada.'}`
      );
    }

    const clave = claveGrupoRecomendado(
      dia.intensivo_dia_id,
      nombreGrupo
    );
    const primero = alumnosGrupo[0];
    const nivelesGrupo = Array.from(
      new Set(
        alumnosGrupo
          .map((alumno) => alumno.nivel_resumen)
          .filter(Boolean)
      )
    ).join(' / ');

    return await ejecutarFuncionAuthJson<string>(
      'crear_grupo_intensivo_dia_app',
      {
        p_intensivo_dia_id: dia.intensivo_dia_id,
        p_nombre_grupo: nombreGrupo,
        p_nivel_grupo: nivelesGrupo || primero.bloque_tecnico,
        p_pista: primero.pista_recomendada,
        p_punto_encuentro: '',
        p_trabajo_diario:
          opciones?.trabajoDiario ??
          trabajoDiarioPorGrupoRecomendado[clave] ??
          generarTrabajoDiarioAutomaticoGrupo(
            nombreGrupo,
            alumnosGrupo
          ),
        p_observaciones_importantes:
          opciones?.observaciones ??
          combinarObservacionesGrupoApp(
            observacionesAutomaticasGrupoIntensivo(alumnosGrupo),
            observacionesPorGrupoRecomendado[clave] || ''
          ),
        p_entrenador_id: null,
        p_alumnos_ids: alumnosGrupo.map((alumno) => alumno.alumno_id),
        p_publicado: false,
      }
    );
  }

  async function crearPlantillaCuatroDiasIntensivo(
    intensivo: IntensivoApp
  ) {
    const dias = diasDelIntensivo(intensivo.intensivo_id)
      .slice()
      .sort((a, b) => a.numero_dia - b.numero_dia);

    if (dias.length !== 4) {
      setError('El intensivo necesita exactamente 4 días.');
      return;
    }

    if (
      dias.some(
        (dia) =>
          gruposNormalesDelDiaIntensivo(dia.intensivo_dia_id).length > 0
      )
    ) {
      setError(
        'Ya hay grupos creados en uno o más días. Usa la edición por día.'
      );
      return;
    }

    // La composición inicial del intensivo siempre nace del Día 1.
    // Los días siguientes parten de esa base, pero evolucionan después
    // con sus propios reportes y ajustes operativos.
    const diaPlantilla = dias[0];

    const gruposPlantilla = agruparRecomendacionesDia(
      diaPlantilla.intensivo_dia_id
    ).filter((grupo) => grupo.alumnosGrupo.length > 0);

    if (gruposPlantilla.length === 0) {
      setError(
        'Primero genera la plantilla y deja el día seleccionado como quieres que empiecen los 4 días.'
      );
      return;
    }

    for (const grupo of gruposPlantilla) {
      const validacionOk = confirmarCrearGrupoConValidacionPedagogicaApp(
        grupo.alumnosGrupo,
        grupo.nombreGrupo
      );
      if (!validacionOk) return;
    }

    const alumnosPlantilla = gruposPlantilla.flatMap(
      (grupo) => grupo.alumnosGrupo
    );

    const idsPlantilla = new Set(
      alumnosPlantilla.map((alumno) => alumno.alumno_id)
    );

    const inscritos = alumnosDelIntensivo(intensivo.intensivo_id);
    const idsInscritos = new Set(
      inscritos.map((alumno) => alumno.alumno_id)
    );

    if (
      idsPlantilla.size !== idsInscritos.size ||
      Array.from(idsInscritos).some((id) => !idsPlantilla.has(id))
    ) {
      setError(
        'La plantilla base no contiene exactamente a todos los alumnos inscritos. Revisa los movimientos antes de crear los 4 días.'
      );
      return;
    }

    const confirmar = window.confirm(
      `¿Crear los 4 días usando la composición inicial del Día 1?\n\nSe copiarán únicamente los grupos y los alumnos. El Trabajo diario y las Observaciones NO se copiarán a los días 2, 3 y 4: quedarán pendientes para generarse con el motor nuevo cuando prepares cada jornada con la evolución y los reportes disponibles.`
    );
    if (!confirmar) return;

    setCargando(true);
    setError('');

    const creados: string[] = [];

    try {
      for (const dia of dias) {
        for (const grupoPlantilla of gruposPlantilla) {
          const alumnosClonados =
            grupoPlantilla.alumnosGrupo.map((alumno) =>
              clonarRecomendacionIntensivoParaDia(alumno, dia)
            );

          const esDiaInicial = dia.numero_dia === 1;
          const clavePlantilla = claveGrupoRecomendado(
            diaPlantilla.intensivo_dia_id,
            grupoPlantilla.nombreGrupo
          );

          // Día 1 sí nace con el trabajo/observaciones del motor común.
          // Días 2-4 solo copian composición. Se dejan vacíos a propósito
          // para que la preparación de cada jornada los regenere con la
          // evolución real y los reportes acumulados hasta ese momento.
          const trabajoDia = esDiaInicial
            ? trabajoDiarioPorGrupoRecomendado[clavePlantilla] ||
              generarTrabajoDiarioAutomaticoGrupo(
                grupoPlantilla.nombreGrupo,
                alumnosClonados
              )
            : '';

          const observacionesDia = esDiaInicial
            ? combinarObservacionesGrupoApp(
                observacionesAutomaticasGrupoIntensivo(alumnosClonados),
                observacionesPorGrupoRecomendado[clavePlantilla] || ''
              )
            : '';

          const id = await crearGrupoIntensivoPropuestaPersistida(
            dia,
            grupoPlantilla.nombreGrupo,
            alumnosClonados,
            {
              trabajoDiario: trabajoDia,
              observaciones: observacionesDia,
            }
          );

          if (id) creados.push(id);
        }
      }

      const idsDias = new Set(dias.map((dia) => dia.intensivo_dia_id));

      setRecomendacionesGrupoIntensivo((anteriores) =>
        anteriores.filter(
          (registro) => !idsDias.has(registro.intensivo_dia_id)
        )
      );

      setDestinoAlumnoRecomendado((anteriores) => {
        const copia = { ...anteriores };
        Object.keys(copia).forEach((clave) => {
          if (
            dias.some((dia) =>
              clave.startsWith(`${dia.intensivo_dia_id}__alumno__`)
            )
          ) {
            delete copia[clave];
          }
        });
        return copia;
      });

      setGruposExtraIntensivoPorDia((anteriores) => {
        const copia = { ...anteriores };
        dias.forEach((dia) => {
          copia[dia.intensivo_dia_id] = [];
        });
        return copia;
      });

      await cargarIntensivos();
      await cargarAgendaOperativaDirecta();
    } catch (err) {
      for (const grupoId of [...creados].reverse()) {
        try {
          await ejecutarFuncion('borrar_grupo_intensivo_app', {
            p_grupo_id: grupoId,
          });
        } catch {}
      }

      await cargarIntensivos();
      await cargarAgendaOperativaDirecta();

      setError(
        err instanceof Error
          ? `No se ha completado la creación de los 4 días. Se han retirado los grupos creados por esta operación. ${err.message}`
          : 'No se ha completado la creación de los 4 días.'
      );
    }

    setCargando(false);
  }

  async function guardarComposicionDiaIntensivo(
    intensivo: IntensivoApp,
    dia: IntensivoDiaApp | undefined
  ) {
    if (!dia) {
      setError('Selecciona un día.');
      return;
    }

    const actuales = gruposNormalesDelDiaIntensivo(
      dia.intensivo_dia_id
    );

    if (actuales.length === 0) {
      setError('Este día todavía no tiene grupos creados.');
      return;
    }

    if (actuales.some((grupo) => grupo.publicado)) {
      setError('Este día ya tiene grupos publicados.');
      return;
    }

    if (actuales.some((grupo) => Boolean(grupo.entrenador_id))) {
      setError(
        'Este día ya tiene entrenador asignado. Quita primero los recursos.'
      );
      return;
    }

    const propuesta = agruparRecomendacionesDia(
      dia.intensivo_dia_id
    ).filter((grupo) => grupo.alumnosGrupo.length > 0);

    if (propuesta.length === 0) {
      setError('La propuesta de este día está vacía.');
      return;
    }

    for (const grupo of propuesta) {
      const validacionOk = confirmarCrearGrupoConValidacionPedagogicaApp(
        grupo.alumnosGrupo,
        grupo.nombreGrupo
      );
      if (!validacionOk) return;
    }

    const confirmar = window.confirm(
      `¿Guardar la nueva composición del Día ${dia.numero_dia}? Los otros tres días no cambian.`
    );
    if (!confirmar) return;

    setCargando(true);
    setError('');

    let snapshot: GrupoEditableIntensivoDiaApp[] = [];
    const nuevosIds: string[] = [];

    try {
      snapshot =
        await ejecutarFuncionConRespuesta<GrupoEditableIntensivoDiaApp>(
          'obtener_grupos_intensivo_dia_editables_app',
          { p_intensivo_dia_id: dia.intensivo_dia_id }
        );

      for (const grupo of actuales) {
        if (!grupo.grupo_id) continue;
        await ejecutarFuncion('borrar_grupo_intensivo_app', {
          p_grupo_id: grupo.grupo_id,
        });
      }

      for (const grupo of propuesta) {
        const id = await crearGrupoIntensivoPropuestaPersistida(
          dia,
          grupo.nombreGrupo,
          grupo.alumnosGrupo
        );
        if (id) nuevosIds.push(id);
      }

      setRecomendacionesGrupoIntensivo((anteriores) =>
        anteriores.filter(
          (registro) =>
            registro.intensivo_dia_id !== dia.intensivo_dia_id
        )
      );

      setGestionarGruposIntensivoId(intensivo.intensivo_id);
      setDiaGrupoSeleccionadoId(dia.intensivo_dia_id);

      await cargarIntensivos();
      await cargarAgendaOperativaDirecta();
    } catch (err) {
      for (const grupoId of [...nuevosIds].reverse()) {
        try {
          await ejecutarFuncion('borrar_grupo_intensivo_app', {
            p_grupo_id: grupoId,
          });
        } catch {}
      }

      const porGrupo = new Map<string, GrupoEditableIntensivoDiaApp[]>();
      snapshot.forEach((fila) => {
        const grupo = porGrupo.get(fila.grupo_id) || [];
        grupo.push(fila);
        porGrupo.set(fila.grupo_id, grupo);
      });

      for (const filas of porGrupo.values()) {
        if (!filas.length) continue;
        const primera = filas[0];
        try {
          await ejecutarFuncionAuthJson<string>(
            'crear_grupo_intensivo_dia_app',
            {
              p_intensivo_dia_id: dia.intensivo_dia_id,
              p_nombre_grupo: primera.nombre_grupo,
              p_nivel_grupo: primera.nivel_grupo,
              p_pista: primera.pista,
              p_punto_encuentro: '',
              p_trabajo_diario: primera.trabajo_diario || '',
              p_observaciones_importantes:
                primera.observaciones_importantes || '',
              p_entrenador_id: null,
              p_alumnos_ids: filas.map((fila) => fila.alumno_id),
              p_publicado: false,
            }
          );
        } catch {}
      }

      await cargarIntensivos();
      await cargarAgendaOperativaDirecta();

      setError(
        err instanceof Error
          ? `No se ha podido guardar. Se ha intentado restaurar la composición anterior. ${err.message}`
          : 'No se ha podido guardar.'
      );
    }

    setCargando(false);
  }

  async function generarRecomendacionGruposIntensivo(
    dia: IntensivoDiaApp | undefined
  ) {
    if (!dia) {
      setError('Primero selecciona un día del intensivo.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const resultado =
        await ejecutarFuncionConRespuesta<RecomendacionGrupoIntensivoDiaApp>(
          'recomendar_grupos_intensivo_dia_app',
          {
            p_intensivo_dia_id: dia.intensivo_dia_id,
          }
        );

      let perfilesParaIntensivo = perfilesOperativosAlumnos;

      try {
        const perfilesActualizados =
          await ejecutarFuncionConRespuesta<PerfilOperativoAlumnoApp>(
            'obtener_perfil_operativo_alumnos_app',
            {}
          );

        perfilesParaIntensivo = Array.isArray(perfilesActualizados)
          ? perfilesActualizados
          : [];

        setPerfilesOperativosAlumnos(perfilesParaIntensivo);
      } catch (errorPerfil) {
        console.warn(
          'No se pudo refrescar el perfil operativo para Intensivos. Se mantiene el recomendador base.',
          errorPerfil
        );
        perfilesParaIntensivo = [];
      }

      const resultadoPedagogico =
        aplicarCinturonPedagogicoAutomaticoIntensivo(
          resultado,
          perfilesParaIntensivo
        );

      setRecomendacionesGrupoIntensivo((anteriores) => [
        ...anteriores.filter(
          (registro) => registro.intensivo_dia_id !== dia.intensivo_dia_id
        ),
        ...resultadoPedagogico,
      ]);

      setDestinoAlumnoRecomendado((anteriores) => {
        const copia = { ...anteriores };
        Object.keys(copia).forEach((clave) => {
          if (clave.startsWith(`${dia.intensivo_dia_id}__alumno__`))
            delete copia[clave];
        });
        resultadoPedagogico.forEach((registro) => {
          copia[
            claveAlumnoRecomendado(dia.intensivo_dia_id, registro.alumno_id)
          ] = registro.grupo_recomendado;
        });
        return copia;
      });

      setTrabajoDiarioPorGrupoRecomendado((anteriores) => {
        const copia = { ...anteriores };
        Object.keys(copia).forEach((clave) => {
          if (clave.startsWith(`${dia.intensivo_dia_id}__`))
            delete copia[clave];
        });
        return copia;
      });

      setObservacionesPorGrupoRecomendado((anteriores) => {
        const copia = { ...anteriores };
        Object.keys(copia).forEach((clave) => {
          if (clave.startsWith(`${dia.intensivo_dia_id}__`))
            delete copia[clave];
        });
        return copia;
      });

      if (resultadoPedagogico.length === 0) {
        setError(
          'No hay alumnos pendientes para recomendar en este día. Puede que ya estén todos metidos en grupos.'
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  function limpiarPropuestaIntensivoTrasCrear(
    dia: IntensivoDiaApp,
    gruposCreados: Array<{
      nombreGrupo: string;
      alumnosGrupo: RecomendacionGrupoIntensivoDiaApp[];
    }>
  ) {
    if (gruposCreados.length === 0) return;

    const alumnosCreados = new Set(
      gruposCreados.flatMap((grupo) =>
        grupo.alumnosGrupo.map((alumno) => alumno.alumno_id)
      )
    );
    const clavesCreadas = new Set(
      gruposCreados.map((grupo) =>
        claveGrupoRecomendado(dia.intensivo_dia_id, grupo.nombreGrupo)
      )
    );

    setRecomendacionesGrupoIntensivo((anteriores) =>
      anteriores.filter(
        (registro) =>
          !(
            registro.intensivo_dia_id === dia.intensivo_dia_id &&
            alumnosCreados.has(registro.alumno_id)
          )
      )
    );

    setDestinoAlumnoRecomendado((anteriores) => {
      const copia = { ...anteriores };
      alumnosCreados.forEach((alumnoId) => {
        delete copia[
          claveAlumnoRecomendado(dia.intensivo_dia_id, alumnoId)
        ];
      });
      return copia;
    });

    setEntrenadoresPorGrupoRecomendado((anteriores) => {
      const copia = { ...anteriores };
      clavesCreadas.forEach((clave) => delete copia[clave]);
      return copia;
    });
    setEntrenadoresApoyoPorGrupoRecomendado((anteriores) => {
      const copia = { ...anteriores };
      clavesCreadas.forEach((clave) => delete copia[clave]);
      return copia;
    });
    setTrabajoDiarioPorGrupoRecomendado((anteriores) => {
      const copia = { ...anteriores };
      clavesCreadas.forEach((clave) => delete copia[clave]);
      return copia;
    });
    setObservacionesPorGrupoRecomendado((anteriores) => {
      const copia = { ...anteriores };
      clavesCreadas.forEach((clave) => delete copia[clave]);
      return copia;
    });
    setResponsablesReportePorGrupoRecomendado((anteriores) => {
      const copia = { ...anteriores };
      gruposCreados.forEach((grupo) => {
        const clave = claveGrupoRecomendado(
          dia.intensivo_dia_id,
          grupo.nombreGrupo
        );
        grupo.alumnosGrupo.forEach((alumno) => {
          delete copia[`${clave}__${alumno.alumno_id}`];
        });
      });
      return copia;
    });
  }

  async function crearGrupoDesdeRecomendacion(
    intensivo: IntensivoApp,
    dia: IntensivoDiaApp | undefined,
    nombreGrupo: string,
    alumnosGrupo: RecomendacionGrupoIntensivoDiaApp[]
  ) {
    if (!dia) {
      setError('Primero selecciona un día del intensivo.');
      return;
    }

    if (alumnosGrupo.length === 0) {
      setError('Este grupo recomendado no tiene alumnos.');
      return;
    }

    const clave = claveGrupoRecomendado(dia.intensivo_dia_id, nombreGrupo);

    const primero = alumnosGrupo[0];
    const nivelesGrupo = Array.from(
      new Set(
        alumnosGrupo.map((alumno) => alumno.nivel_resumen).filter(Boolean)
      )
    ).join(' / ');

    if (!esGrupoParticularAgenda(nombreGrupo)) {
      const validacionOk = confirmarCrearGrupoConValidacionPedagogicaApp(
        alumnosGrupo,
        nombreGrupo
      );
      if (!validacionOk) return;
    }

    const confirmar = window.confirm(
      `¿Preparar ${nombreGrupo} con ${alumnosGrupo.length} alumnos? Después asignarás entrenador, segundo entrenador y punto en Días de entrenamiento.`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('crear_grupo_intensivo_dia_app', {
        p_intensivo_dia_id: dia.intensivo_dia_id,
        p_nombre_grupo: nombreGrupo,
        p_nivel_grupo: nivelesGrupo || primero.bloque_tecnico,
        p_pista: primero.pista_recomendada,
        p_punto_encuentro: '',
        p_trabajo_diario:
          trabajoDiarioPorGrupoRecomendado[clave] ||
          generarTrabajoDiarioAutomaticoGrupo(nombreGrupo, alumnosGrupo),
        p_observaciones_importantes: combinarObservacionesGrupoApp(
          observacionesAutomaticasGrupoIntensivo(alumnosGrupo),
          observacionesPorGrupoRecomendado[clave] ||
            formGrupoIntensivo.observaciones_importantes.trim()
        ),
        p_entrenador_id: null,
        p_alumnos_ids: alumnosGrupo.map((alumno) => alumno.alumno_id),
        p_publicado: false,
      });



      limpiarPropuestaIntensivoTrasCrear(dia, [
        { nombreGrupo, alumnosGrupo },
      ]);

      setGestionarGruposIntensivoId(intensivo.intensivo_id);
      setDiaGrupoSeleccionadoId(dia.intensivo_dia_id);

      await cargarIntensivos();
      await cargarAgendaOperativaDirecta();

      window.requestAnimationFrame(() => {
        document
          .getElementById('intensivo-recomendador-activo')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function crearTodosGruposDesdeRecomendacionIntensivo(
    intensivo: IntensivoApp,
    dia: IntensivoDiaApp | undefined,
    grupos: Array<{
      nombreGrupo: string;
      alumnosGrupo: RecomendacionGrupoIntensivoDiaApp[];
    }>
  ) {
    if (!dia) {
      setError('Primero selecciona un día del intensivo.');
      return;
    }

    if (grupos.length === 0) {
      setError('No hay grupos pendientes en la propuesta.');
      return;
    }

    for (const grupo of grupos) {
      if (grupo.alumnosGrupo.length === 0) {
        setError(`${grupo.nombreGrupo} no tiene alumnos.`);
        return;
      }

      const validacionOk = confirmarCrearGrupoConValidacionPedagogicaApp(
        grupo.alumnosGrupo,
        grupo.nombreGrupo
      );
      if (!validacionOk) return;
    }

    const confirmar = window.confirm(
      `¿Crear los ${grupos.length} grupos tal como están ahora?\n\nSe respetarán movimientos de niños, trabajo diario y observaciones. Después asignarás recursos en Días de entrenamiento.`
    );
    if (!confirmar) return;

    setCargando(true);
    setError('');

    const creados: Array<{
      nombreGrupo: string;
      alumnosGrupo: RecomendacionGrupoIntensivoDiaApp[];
    }> = [];

    try {
      for (const grupo of grupos) {
        const { nombreGrupo, alumnosGrupo } = grupo;
        const clave = claveGrupoRecomendado(
          dia.intensivo_dia_id,
          nombreGrupo
        );
        const primero = alumnosGrupo[0];
        const nivelesGrupo = Array.from(
          new Set(
            alumnosGrupo
              .map((alumno) => alumno.nivel_resumen)
              .filter(Boolean)
          )
        ).join(' / ');

        await ejecutarFuncion('crear_grupo_intensivo_dia_app', {
          p_intensivo_dia_id: dia.intensivo_dia_id,
          p_nombre_grupo: nombreGrupo,
          p_nivel_grupo: nivelesGrupo || primero.bloque_tecnico,
          p_pista: primero.pista_recomendada,
          p_punto_encuentro: '',
          p_trabajo_diario:
            trabajoDiarioPorGrupoRecomendado[clave] ||
            generarTrabajoDiarioAutomaticoGrupo(
              nombreGrupo,
              alumnosGrupo
            ),
          p_observaciones_importantes: combinarObservacionesGrupoApp(
            observacionesAutomaticasGrupoIntensivo(alumnosGrupo),
            observacionesPorGrupoRecomendado[clave] ||
              formGrupoIntensivo.observaciones_importantes.trim()
          ),
          p_entrenador_id: null,
          p_alumnos_ids: alumnosGrupo.map((alumno) => alumno.alumno_id),
          p_publicado: false,
        });

        creados.push(grupo);
      }

      limpiarPropuestaIntensivoTrasCrear(dia, creados);
      await cargarIntensivos();
      await cargarAgendaOperativaDirecta();
    } catch (err) {
      limpiarPropuestaIntensivoTrasCrear(dia, creados);
      setGestionarGruposIntensivoId(intensivo.intensivo_id);
      setDiaGrupoSeleccionadoId(dia.intensivo_dia_id);

      await cargarIntensivos();
      await cargarAgendaOperativaDirecta();

      window.requestAnimationFrame(() => {
        document
          .getElementById('intensivo-recomendador-activo')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      setError(
        err instanceof Error
          ? `Se crearon ${creados.length} grupos antes del error. Los pendientes conservan tus cambios. ${err.message}`
          : `Se crearon ${creados.length} grupos antes del error. Los pendientes conservan tus cambios.`
      );
    }

    setCargando(false);
  }

  async function cambiarEstadoIntensivoCurso(
    intensivo: IntensivoApp,
    estado: 'Abierto' | 'Cerrado'
  ) {
    const cerrar = estado === 'Cerrado';
    const confirmar = window.confirm(
      cerrar
        ? `¿FINALIZAR ${intensivo.intensivo}?\n\nSolo se puede cerrar cuando todas las evaluaciones estén revisadas. Las recuperaciones pendientes se conservan y pueden seguir gestionándose.`
        : `¿REABRIR ${intensivo.intensivo}?\n\nVolverá a aparecer como curso abierto para coordinación.`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('cambiar_estado_intensivo_app', {
        p_intensivo_id: intensivo.intensivo_id,
        p_estado: estado,
      });

      await cargarIntensivos();
      await cargarAgendaOperativaDirecta();
      await cargarPlanning();
      await cargarGruposEntrenador();
      await cargarCobrosDesdeSemanaActiva();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cambiar el estado del Intensivo.'
      );
    } finally {
      setCargando(false);
    }
  }

  async function autoproponerNivelesDiploma(intensivo: IntensivoApp) {
    const confirmar = window.confirm(
      `¿Autoproponer niveles finales para ${intensivo.intensivo} según los reportes de los entrenadores?`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('autoproponer_niveles_diploma_intensivo_app', {
        p_intensivo_id: intensivo.intensivo_id,
      });

      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function actualizarDiplomaIntensivo(
    registro: ResumenFinalIntensivoApp,
    nivelPropuestoId: string,
    nivelConfirmadoId: string,
    recomendacionSiguientePaso: string,
    estadoEvaluación: string
  ) {
    setCargando(true);
    setError('');

    try {
      const idsNivelActivos = new Set(
        nivelesDiplomaIntensivo.map((nivel) => nivel.id)
      );
      if (
        (nivelPropuestoId && !idsNivelActivos.has(nivelPropuestoId)) ||
        (nivelConfirmadoId && !idsNivelActivos.has(nivelConfirmadoId))
      ) {
        throw new Error(
          'El nivel final ya no está disponible en el contrato activo de niveles. Actualiza antes de guardar.'
        );
      }
      const diploma = requireIntensiveDiplomaUpdate({
        state: estadoEvaluación || 'Pendiente',
        proposedLevelId: nivelPropuestoId,
        confirmedLevelId: nivelConfirmadoId,
      });
      await ejecutarFuncion('actualizar_diploma_intensivo_app', {
        p_intensivo_alumno_id: registro.intensivo_alumno_id,
        p_nivel_final_propuesto_id: diploma.proposedLevelId,
        p_nivel_final_confirmado_id: diploma.confirmedLevelId,
        p_recomendacion_siguiente_paso: recomendacionSiguientePaso || null,
        p_estado_diploma: diploma.state,
      });

      await cargarIntensivos();
      await cargarAlumnos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function cargarListados() {
    setCargando(true);
    setError('');
    setDetalle(null);

    try {
      const data = await consultarSupabase<ListadoApp>(
        'v_listados_app',
        'select=*&order=fecha.desc,hora_inicio.desc'
      );
      setListados(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setListados([]);
    }

    setCargando(false);
  }

  async function activarTemporadaAgenda(anioInicio: number) {
    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('activar_temporada_operativa_app', {
        p_anio_inicio: anioInicio,
      });
      await cargarAgendaOperativaDirecta();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function cargarAgendaOperativaDirecta() {
    try {
      const data = await consultarSupabase<AgendaSesionDirectaApp>(
        'v_agenda_sesiones_operativa_app',
        'select=*&order=fecha.asc,hora_inicio.asc'
      );
      setAgendaSesionesDirectas(data);
    } catch (err) {
      // Si el SQL nuevo no está ejecutado todavía, no rompemos la app.
      setAgendaSesionesDirectas([]);
    }
  }

  async function cargarRecursosCompartidosTurnoAgenda(
    sesionId: string,
    gruposFallback: AgendaGrupoSesionApp[]
  ) {
    try {
      const sesionObjetivo = agendaSesionesDirectas.find(
        (sesion) => sesion.sesion_id === sesionId
      );

      if (!sesionObjetivo) {
        setAgendaGruposRecursosTurno(gruposFallback);
        return;
      }

      const inicioObjetivo = horaCorta(sesionObjetivo.hora_inicio);
      const finObjetivo = horaCorta(sesionObjetivo.hora_fin);

      const sesionesSolapadas = agendaSesionesDirectas.filter((sesion) => {
        if (sesion.fecha !== sesionObjetivo.fecha) return false;
        const inicio = horaCorta(sesion.hora_inicio);
        const fin = horaCorta(sesion.hora_fin);
        return inicio < finObjetivo && inicioObjetivo < fin;
      });

      const lotes = await Promise.all(
        sesionesSolapadas.map((sesion) =>
          consultarSupabase<AgendaGrupoSesionApp>(
            'v_grupos_sesion_operativa_app',
            `select=*&sesion_id=${encodeURIComponent(
              `eq.${sesion.sesion_id}`
            )}&order=nombre_grupo.asc`
          )
        )
      );

      const grupos = lotes
        .flat()
        .filter(
          (grupo, indice, todos) =>
            todos.findIndex((otro) => otro.grupo_id === grupo.grupo_id) ===
            indice
        );

      setAgendaGruposRecursosTurno(
        grupos.length > 0 ? grupos : gruposFallback
      );
    } catch (err) {
      console.warn(
        'No se pudo cargar la ocupación global del turno; la sesión sigue operativa.',
        err
      );
      setAgendaGruposRecursosTurno(gruposFallback);
    }
  }

  async function cargarDisponibilidadSesionAgenda(
    sesionId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string
  ) {
    if (!sesionId || !fecha || !horaInicio || !horaFin) {
      setDisponibilidadSesionAgenda([]);
      setContextoRecursosSesionAgenda(null);
      return;
    }

    const semanaSesion = inicioSemanaAgenda(fecha);

    try {
      const respuesta =
        await ejecutarFuncionAuthJson<RespuestaDisponibilidadPublicadaEntrenadoresEditor>(
          'obtener_disponibilidad_publicada_entrenadores_editor_app',
          { p_semana_inicio: semanaSesion }
        );

      setDisponibilidadSesionAgenda(
        (respuesta?.turnos || []).map((turno) => ({
          ...turno,
          fuente: 'sesion-agenda' as const,
        }))
      );

      setContextoRecursosSesionAgenda({
        sesion_id: sesionId,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
      });
    } catch {
      setDisponibilidadSesionAgenda([]);
      setContextoRecursosSesionAgenda({
        sesion_id: sesionId,
        fecha,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
      });
    }
  }

  async function cargarDetalleSesionAgenda(
    sesionId: string,
    opciones?: {
      preservarPropuesta?: boolean;
      preservarScroll?: boolean;
    }
  ) {
    if (!sesionId) return;

    setAgendaSesionActivaId(sesionId);

    const sesionRecursos = agendaSesionesDirectas.find(
      (sesion) => sesion.sesion_id === sesionId
    );

    if (sesionRecursos) {
      await cargarDisponibilidadSesionAgenda(
        sesionId,
        sesionRecursos.fecha,
        sesionRecursos.hora_inicio,
        sesionRecursos.hora_fin
      );
    } else {
      const diaIntensivo = intensivoDias.find(
        (dia) => dia.sesion_id === sesionId
      );

      if (diaIntensivo) {
        await cargarDisponibilidadSesionAgenda(
          sesionId,
          diaIntensivo.fecha,
          diaIntensivo.hora_inicio,
          diaIntensivo.hora_fin
        );
      } else {
        await cargarAgendaOperativaDirecta();
      }
    }

    if (!opciones?.preservarScroll) {
      irAlTrabajoAgenda('sesion');
    }

    setCargando(true);
    setError('');

    try {
      const filtroSesion = encodeURIComponent(`eq.${sesionId}`);

      const alumnosData = await consultarSupabase<AgendaAlumnoSesionApp>(
        'v_sesion_alumnos_operativa_app',
        `select=*&sesion_id=${filtroSesion}&order=orden.asc`
      );

      let gruposData = await consultarSupabase<AgendaGrupoSesionApp>(
        'v_grupos_sesion_operativa_app',
        `select=*&sesion_id=${filtroSesion}&order=nombre_grupo.asc`
      );

      const diaIntensivoActual = intensivoDias.find(
        (dia) => dia.sesion_id === sesionId
      );

      if (
        diaIntensivoActual &&
        gruposData.length > 0 &&
        alumnosData.length === 0
      ) {
        throw new Error(
          'El día de Intensivos tiene grupos pero no tiene alumnos sincronizados con Días de entrenamiento.'
        );
      }

      // INTENSIVOS: al abrir una jornada, cada grupo debe llegar ya con su
      // Trabajo diario/Observaciones del motor nuevo. Si está vacío, se genera
      // automáticamente con la composición real de ESE día y el historial
      // disponible hasta ese momento. No se copia el texto del día anterior.
      if (diaIntensivoActual && gruposData.length > 0) {
        let huboGeneracionAutomatica = false;

        for (const grupo of gruposData) {
          const sinTrabajo = !String(grupo.trabajo_diario || '').trim();
          const sinObservaciones = !String(
            grupo.observaciones_importantes || ''
          ).trim();

          if (!sinTrabajo && !sinObservaciones) continue;

          const alumnosGrupo = alumnosDelGrupoCreadoAgenda(
            grupo,
            alumnosData
          );

          if (alumnosGrupo.length === 0) {
            throw new Error(
              `No se han podido resolver los alumnos de ${grupo.nombre_grupo}. No se genera un trabajo vacío.`
            );
          }

          const manuales = observacionesManualesGrupoAgendaPersistentesApp(
            grupo.observaciones_importantes,
            alumnosGrupo
          );

          const contenido = contenidoTrabajoGrupoCreadoAgendaApp(
            grupo,
            alumnosGrupo,
            manuales
          );

          await ejecutarFuncion(GROUP_OPERATION_RPC.updateDailyWork, {
            p_grupo_id: grupo.grupo_id,
            p_trabajo_diario: contenido.trabajo,
            p_observaciones_importantes: contenido.observaciones,
          });

          huboGeneracionAutomatica = true;
        }

        if (huboGeneracionAutomatica) {
          gruposData = await consultarSupabase<AgendaGrupoSesionApp>(
            'v_grupos_sesion_operativa_app',
            `select=*&sesion_id=${filtroSesion}&order=nombre_grupo.asc`
          );
        }
      }

      setAgendaAlumnosSesion(alumnosData);
      setAgendaGruposSesion(gruposData);
      setAgendaGruposRecursosTurno(gruposData);
      void cargarRecursosCompartidosTurnoAgenda(sesionId, gruposData);
      setTrabajoGrupoCreadoEditando(
        Object.fromEntries(
          gruposData.map((grupo) => [
            grupo.grupo_id,
            grupo.trabajo_diario || '',
          ])
        )
      );
      setObservacionesGrupoCreadoEditando(
        Object.fromEntries(
          gruposData.map((grupo) => [
            grupo.grupo_id,
            normalizarLineasObservacionesGrupoApp(
              grupo.observaciones_importantes || '',
              12
            ),
          ])
        )
      );

      if (!opciones?.preservarPropuesta) {
        setAgendaRecomendaciones([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setAgendaAlumnosSesion([]);
      setAgendaGruposSesion([]);
      setAgendaGruposRecursosTurno([]);
    }

    setCargando(false);
  }

  function irAlTrabajoAgenda(
    destino: 'formulario' | 'sesion' | 'trabajo' = 'trabajo'
  ) {
    // Scroll controlado: solo cuando Jose pulsa + Baby/Ocio/Intensivo o Abrir sesión.
    // No salta solo al cambiar semana/día.
    window.setTimeout(() => {
      const idDestino =
        destino === 'formulario'
          ? 'agenda-formulario-listado'
          : destino === 'sesion'
          ? 'agenda-sesion-trabajo'
          : 'trabajo-agenda';
      const elemento =
        document.getElementById(idDestino) ||
        document.getElementById('trabajo-agenda');
      elemento?.scrollIntoView({ behavior: 'smooth', block: 'start' });

      if (destino === 'formulario') {
        window.setTimeout(() => {
          const textarea = document.getElementById(
            'agenda-textarea-listado'
          ) as HTMLTextAreaElement | null;
          textarea?.focus();
        }, 180);
      }
    }, 90);
  }

  function abrirFormularioAgendaDia(
    fecha: string,
    horaInicio?: string,
    horaFin?: string,
    modalidad?: string
  ) {
    setAgendaDiaCompactoActivo(fecha);
    setAgendaFormularioAbierto(true);
    setAgendaSesionActivaId('');
    setAgendaAlumnosSesion([]);
    setAgendaGruposSesion([]);
    setAgendaGruposRecursosTurno([]);
    setAgendaRecomendaciones([]);
    setDisponibilidadSesionAgenda([]);
    setContextoRecursosSesionAgenda(null);
    setBabyAimHarderMensaje('');
    setBabyAimHarderError('');
    const turnoDefecto = turnosTrabajoDiaAgenda(fecha)[0] || {
      inicio: '18:00',
      fin: '20:00',
    };
    setAgendaForm((anterior) => ({
      ...anterior,
      fecha,
      modalidad: modalidad || anterior.modalidad || 'BABY',
      hora_inicio: horaInicio || turnoDefecto.inicio,
      hora_fin: horaFin || turnoDefecto.fin,
      texto_listado: '',
    }));
    irAlTrabajoAgenda('formulario');
  }

  const {
    babyAimHarderCargandoSemana,
    babyAimHarderSesionCargandoId,
    babyAimHarderFormularioCargando,
    babyAimHarderMensaje,
    babyAimHarderError,
    setBabyAimHarderFormularioCargando,
    setBabyAimHarderMensaje,
    setBabyAimHarderError,
    obtenerListadoBabyTurnoAimHarderApp,
    traerListadoBabyTurnoAgendaDesdeAimHarder,
    cargarSemanaBabyDesdeAimHarder,
    refrescarSesionBabyDesdeAimHarder,
  } = useBabyAimHarder({
    agendaForm,
    cargarAgendaOperativaDirecta,
    cargarDetalleSesionAgenda,
    cargarListados,
    consultarSupabase,
    ejecutarFuncion,
    ejecutarFuncionAuthJson,
    horaCorta,
    obtenerAccessTokenSupabaseApp,
    semanaAgendaActiva,
    setAgendaForm,
    setError,
    setUltimoListadoAimHarder,
    supabaseAnonKey: SUPABASE_ANON_KEY,
    supabaseUrl: SUPABASE_URL,
  });

  const {
    responsablesManualesGrupoAgenda,
    setResponsablesManualesGrupoAgenda,
    alumnosDelGrupoCreadoApp,
    responsableManualGrupoCreadoApp,
    guardarRepartoManualGrupoAgenda,
  } = useRepartoManualGrupoAgenda({
    alumnosReporteEntrenador,
    agendaSesionActivaId,
    cargarAgendaOperativaDirecta,
    cargarCobros,
    cargarDetalleSesionAgenda,
    cargarGruposEntrenador,
    cargarPlanning,
    cargarReportesPendientes,
    ejecutarFuncion,
    setCargando,
    setError,
  });

  function datosAimHarderAlumnoAgenda(
    alumno: AgendaAlumnoSesionApp
  ): DatosContactoAimHarderApp | null {
    if (!ultimoListadoAimHarder) return null;

    const sesionActual = agendaSesionesDirectas.find(
      (sesion) => sesion.sesion_id === agendaSesionActivaId
    );

    if (
      !sesionActual ||
      ultimoListadoAimHarder.fecha !== sesionActual.fecha ||
      ultimoListadoAimHarder.horaInicio !==
        String(sesionActual.hora_inicio || '').slice(0, 5) ||
      ultimoListadoAimHarder.horaFin !==
        String(sesionActual.hora_fin || '').slice(0, 5) ||
      ultimoListadoAimHarder.modalidad !== 'BABY'
    ) {
      return null;
    }

    const clave = normalizarNombreFueraPlazoAgenda(alumno.alumno || '');
    return ultimoListadoAimHarder.asistentes[clave] || null;
  }

  function abrirAltaTestDesdeAgenda(alumno: AgendaAlumnoSesionApp) {
    const datosAimHarder = datosAimHarderAlumnoAgenda(alumno);

    setFormAltaNivelInicial({
      ...altaNivelInicialFormVacioApp(),
      nombre: alumno.alumno || datosAimHarder?.nombre || '',
      fechaNacimiento: datosAimHarder?.fechaNacimiento || '',
      telefono: datosAimHarder?.telefono || '',
      modalidad:
        agendaForm.modalidad === 'OCIO'
          ? 'OCIO'
          : agendaForm.modalidad === 'INTENSIVOS'
          ? 'INTENSIVOS'
          : 'BABY',
    });
    setMostrarFormularioAltaNivel(true);
    setPantalla('administracion');

    if (
      agendaForm.modalidad === 'BABY' &&
      (!datosAimHarder?.telefono || !datosAimHarder?.fechaNacimiento)
    ) {
      setError(
        'AimHarder ha identificado al alumno, pero no ha devuelto teléfono y fecha de nacimiento completos. Revisa esos datos antes de crear el Alta TEST.'
      );
    } else {
      setError('');
    }

    window.setTimeout(() => {
      contenidoPantallaRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 100);
  }

  async function volcarListadoAgendaOperativa() {
    if (!agendaForm.fecha) {
      setError('Selecciona un día de la agenda.');
      return;
    }

    const esBaby =
      String(agendaForm.modalidad || '').trim().toUpperCase() === 'BABY';

    if (!esBaby && !agendaForm.texto_listado.trim()) {
      setError('Pega el listado de Aimharder antes de crear grupos.');
      return;
    }

    setCargando(true);
    setError('');
    if (esBaby) {
      setBabyAimHarderFormularioCargando(true);
      setBabyAimHarderMensaje('');
      setBabyAimHarderError('');
    }

    try {
      let textoListado = agendaForm.texto_listado.trim();
      let sesionId = '';
      let nuevosPendientes = 0;
      let totalDetectados = 0;
      let totalActivosAimHarder = 0;
      let sesionBabyYaExistia = false;

      if (esBaby) {
        // MISMO PROCESO MAESTRO que “Cargar semana Baby desde AimHarder”:
        // 1) resuelve la clase por fecha + modalidad + horario,
        // 2) obtiene asistentes con mitico-aimharder-baby-read,
        // 3) usa la misma RPC de carga inicial, que NO pisa una sesión existente.
        const { asistentes } = await obtenerListadoBabyTurnoAimHarderApp(
          agendaForm.fecha,
          agendaForm.hora_inicio,
          agendaForm.hora_fin
        );
        totalActivosAimHarder = asistentes.length;
        textoListado = asistentes.map((asistente) => asistente.name).join('\n');

        setAgendaForm((anterior) => ({
          ...anterior,
          texto_listado: textoListado,
        }));

        const resultadoBaby = await ejecutarFuncionAuthJson<{
          sesion_id?: string | null;
          creada?: boolean;
          ya_existia?: boolean;
          sin_reservas?: boolean;
          total_actual?: number;
          total_nuevos?: number;
          total_conocidos?: number;
        }>('cargar_sesion_baby_aimharder_inicial_app', {
          p_fecha: agendaForm.fecha,
          p_hora_inicio: agendaForm.hora_inicio,
          p_hora_fin: agendaForm.hora_fin,
          p_lugar: agendaForm.lugar,
          p_texto_listado: textoListado,
        });

        if (resultadoBaby?.sin_reservas || !resultadoBaby?.sesion_id) {
          throw new Error(
            'AimHarder no devuelve alumnos activos para este turno Baby. No se ha creado ninguna sesión.'
          );
        }

        sesionId = String(resultadoBaby.sesion_id);
        nuevosPendientes = Number(resultadoBaby.total_nuevos || 0);
        totalDetectados = Number(resultadoBaby.total_actual || asistentes.length);
        sesionBabyYaExistia = Boolean(resultadoBaby.ya_existia);
      } else {
        const resultado = await crearSesionOperativaDesdeListadoSeguroApp({
          fecha: agendaForm.fecha,
          horaInicio: agendaForm.hora_inicio,
          horaFin: agendaForm.hora_fin,
          modalidad: agendaForm.modalidad,
          lugar: agendaForm.lugar,
          textoListado,
        });

        sesionId = String(resultado[0]?.sesion_id || '');
        nuevosPendientes = Number(resultado[0]?.total_nuevos || 0);
        totalDetectados = Number(resultado[0]?.total_detectados || 0);
      }

      setAgendaFormularioAbierto(false);
      setAgendaForm((anterior) => ({ ...anterior, texto_listado: '' }));
      await cargarAgendaOperativaDirecta();
      await cargarListados();

      if (sesionId) {
        await cargarDetalleSesionAgenda(sesionId);
      }

      if (nuevosPendientes > 0) {
        setError(
          `${nuevosPendientes} alumno(s) no están en la semilla. Quedan como PENDIENTE TEST y no entrarán en grupos hasta pasar por Altas/Test.`
        );
      }

      if (esBaby) {
        setBabyAimHarderMensaje(
          sesionBabyYaExistia
            ? `✓ VOLCAR SESIÓN · AimHarder: ${totalActivosAimHarder} alumno(s) activo(s) · ` +
                `la sesión ya existía y NO se ha modificado · tiene ${totalDetectados} alumno(s) actualmente · ` +
                'pulsa “Refrescar listado” para sincronizarla'
            : `✓ VOLCAR SESIÓN · AimHarder: ${totalActivosAimHarder} alumno(s) activo(s) · ` +
                `sesión creada con ${totalDetectados} alumno(s) · cancelados excluidos`
        );
      }
    } catch (err) {
      const mensaje = err instanceof Error ? err.message : 'Error desconocido';
      if (esBaby) setBabyAimHarderError(mensaje);
      setError(mensaje);
    } finally {
      if (esBaby) setBabyAimHarderFormularioCargando(false);
      setCargando(false);
    }
  }

  function nivelesGrupoFueraPlazoAgenda(grupo: AgendaGrupoSesionApp) {
    const niveles: string[] = [];
    if (grupo.nivel_grupo) {
      const coincidencias = grupo.nivel_grupo
        .toUpperCase()
        .match(/INICIACION|A\+|A|B\+\+|B\+|B|C\+|C|D\+|D/g);
      if (coincidencias) niveles.push(...coincidencias);
    }
    if (grupo.alumnos_lista) {
      grupo.alumnos_lista.split(' || ').forEach((linea) => {
        const partes = linea.split('·');
        const nivel = partes.length > 1 ? partes[partes.length - 1].trim() : '';
        if (nivel) niveles.push(nivel);
      });
    }
    return Array.from(new Set(niveles.filter(Boolean)));
  }

  function compatibilidadFueraPlazoAgenda(
    nivelAlumno: string,
    nivelesGrupo: string[]
  ): { estado: 'RECOMENDADO' | 'REVISAR' | 'NO_ENCAJA'; motivo: string; score: number } {
    const result = recommendLevelCompatibility(nivelAlumno, nivelesGrupo);
    return {
      estado: result.status,
      motivo: result.reason,
      score: result.score,
    };
  }

  function evaluarGrupoFueraPlazoAgenda(
    grupo: AgendaGrupoSesionApp,
    sesion: AgendaSesionDirectaApp,
    nivelAlumno: string,
    esSesionActual: boolean
  ): RecomendacionFueraPlazoAgendaApp {
    const niveles = nivelesGrupoFueraPlazoAgenda(grupo);
    const compatibilidad = compatibilidadFueraPlazoAgenda(nivelAlumno, niveles);
    const pistaTexto = `${grupo.pista || ''}`.toUpperCase();
    const numeroEntrenadores = Math.max(
      1,
      entrenadoresDelGrupo(grupo.grupo_id).length
    );
    const maxRatio = babyGroupMaximum(pistaTexto, numeroEntrenadores);
    const totalActual = Number(grupo.total_alumnos || 0);
    const totalFinal = totalActual + 1;
    let estado = compatibilidad.estado;
    let score = compatibilidad.score;
    let motivo = compatibilidad.motivo;

    if (totalFinal > maxRatio) {
      estado = 'NO_ENCAJA';
      score = 0;
      motivo = babyRatioMessage({
        finalSize: totalFinal,
        piste: pistaTexto,
        trainerCount: numeroEntrenadores,
      });
    } else if (totalFinal === maxRatio && estado === 'RECOMENDADO') {
      score -= 8;
      motivo += ` ${babyRatioMessage({
        finalSize: totalFinal,
        piste: pistaTexto,
        trainerCount: numeroEntrenadores,
      })}`;
    } else if (estado !== 'NO_ENCAJA') {
      motivo += ` ${babyRatioMessage({
        finalSize: totalFinal,
        piste: pistaTexto,
        trainerCount: numeroEntrenadores,
      })}`;
    }

    if (grupo.publicado && estado !== 'NO_ENCAJA') score += 4;
    if (esSesionActual && estado !== 'NO_ENCAJA') score += 8;

    return {
      sesion_id: sesion.sesion_id,
      fecha: sesion.fecha,
      hora_inicio: sesion.hora_inicio,
      hora_fin: sesion.hora_fin,
      grupo_id: grupo.grupo_id,
      grupo: grupo.nombre_grupo,
      nivel_grupo: grupo.nivel_grupo || niveles.join('/') || '-',
      pista: grupo.pista || '-',
      punto: grupo.punto_encuentro || '-',
      entrenador: nombresEntrenadoresDelGrupo(grupo.grupo_id, grupo.entrenador),
      total_actual: totalActual,
      total_final: totalFinal,
      estado,
      motivo,
      score,
      es_sesion_actual: esSesionActual,
    };
  }

  async function analizarEncajeAlumnoFueraPlazoAgenda(overrides?: {
    nombre?: string;
    nivel?: string;
    alumnoId?: string;
  }) {
    if (!agendaSesionActivaId) {
      setError('Abre primero la sesión donde se ha apuntado el niño.');
      return;
    }
    // overrides permite invocar el análisis en el mismo evento en el que se
    // rellenan alumnoFueraPlazoNombre/Nivel/AlumnoId (p.ej. desde "Pendientes
    // de colocar"), sin depender de que el estado de React ya se haya
    // actualizado cuando esta función lee sus valores.
    const nombre = (overrides?.nombre ?? alumnoFueraPlazoNombre).trim();
    if (!nombre) {
      setError('Escribe el nombre y apellidos del niño.');
      return;
    }

    setAnalizandoFueraPlazo(true);
    setError('');
    setRecomendacionesFueraPlazo([]);

    try {
      const nombreNormalizado = normalizarNombreFueraPlazoAgenda(nombre);
      const coincidenciasFicha = alumnos.filter((alumno) => {
        const nombreFicha = normalizarNombreFueraPlazoAgenda(alumno.alumno);
        return (
          nombreFicha === nombreNormalizado ||
          (nombreNormalizado.length >= 2 && nombreFicha.startsWith(nombreNormalizado))
        );
      });
      const fichaExistente =
        coincidenciasFicha.find(
          (alumno) => normalizarNombreFueraPlazoAgenda(alumno.alumno) === nombreNormalizado
        ) || (coincidenciasFicha.length === 1 ? coincidenciasFicha[0] : undefined);
      const nivelFicha = fichaExistente
        ? buildMasterStudentProfile(fichaExistente).level.level
        : null;
      const nivelSolicitado = overrides?.nivel ?? alumnoFueraPlazoNivel;
      const nivelAnalizado = parseTechnicalLevel(
        nivelSolicitado || nivelFicha
      );
      if (nivelAnalizado.status !== 'VALID') {
        throw new Error(
          'Selecciona un nivel técnico individual válido antes de analizar el alta tardía. No se asignará INICIACIÓN automáticamente.'
        );
      }
      const nivelDetectado = nivelAnalizado.level;

      if (fichaExistente) {
        setAlumnoFueraPlazoAlumnoId(fichaExistente.alumno_id);
        if (fichaExistente.alumno !== nombre) {
          setAlumnoFueraPlazoNombre(fichaExistente.alumno);
        }
      } else {
        setAlumnoFueraPlazoAlumnoId(overrides?.alumnoId ?? '');
      }
      if (!nivelSolicitado) setAlumnoFueraPlazoNivel(nivelDetectado);

      // Refrescamos la agenda completa al analizar. Así las alternativas de la
      // semana no dependen de una copia antigua cargada al abrir la pantalla.
      const agendaActualizada = await consultarSupabase<AgendaSesionDirectaApp>(
        'v_agenda_sesiones_operativa_app',
        'select=*&order=fecha.asc,hora_inicio.asc'
      );
      setAgendaSesionesDirectas(agendaActualizada);

      const sesionActual =
        agendaActualizada.find(
          (sesion) => sesion.sesion_id === agendaSesionActivaId
        ) ||
        agendaSesionesDirectas.find(
          (sesion) => sesion.sesion_id === agendaSesionActivaId
        );
      if (!sesionActual) throw new Error('No encuentro la sesión activa en la agenda.');

      const resultados: RecomendacionFueraPlazoAgendaApp[] = agendaGruposSesion
        .filter((grupo) => Boolean(grupo.grupo_id))
        .map((grupo) =>
          evaluarGrupoFueraPlazoAgenda(
            grupo,
            sesionActual,
            nivelDetectado,
            true
          )
        );

      // La semana se calcula siempre por FECHA (lunes-domingo), no por
      // semana_inicio almacenada. Esto evita perder turnos reales del sábado/
      // domingo si ese campo viene vacío o desfasado.
      const inicioSemanaActual = inicioSemanaAgenda(sesionActual.fecha);
      const modalidadActual = `${sesionActual.modalidad_codigo || sesionActual.modalidad || ''}`
        .trim()
        .toUpperCase();

      const sesionesSemana = agendaActualizada.filter((sesion) => {
        const modalidadSesion = `${sesion.modalidad_codigo || sesion.modalidad || ''}`
          .trim()
          .toUpperCase();

        return (
          sesion.sesion_id !== agendaSesionActivaId &&
          inicioSemanaAgenda(sesion.fecha) === inicioSemanaActual &&
          modalidadSesion === modalidadActual
        );
      });

      for (const sesion of sesionesSemana) {
        try {
          const filtroSesion = encodeURIComponent(`eq.${sesion.sesion_id}`);
          const grupos = await consultarSupabase<AgendaGrupoSesionApp>(
            'v_grupos_sesion_operativa_app',
            `select=*&sesion_id=${filtroSesion}&order=nombre_grupo.asc`
          );
          grupos
            .filter((grupo) => Boolean(grupo.grupo_id))
            .forEach((grupo) =>
              resultados.push(
                evaluarGrupoFueraPlazoAgenda(grupo, sesion, nivelDetectado, false)
              )
            );
        } catch {
          // Una sesión alternativa que falle no debe bloquear el análisis del turno actual.
        }
      }

      resultados.sort((a, b) => {
        const prioridadEstado = { RECOMENDADO: 0, REVISAR: 1, NO_ENCAJA: 2 } as const;
        return (
          prioridadEstado[a.estado] - prioridadEstado[b.estado] ||
          b.score - a.score ||
          a.fecha.localeCompare(b.fecha) ||
          a.hora_inicio.localeCompare(b.hora_inicio)
        );
      });
      setRecomendacionesFueraPlazo(resultados);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo analizar el encaje.');
    }

    setAnalizandoFueraPlazo(false);
  }

  async function incorporarAlumnoFueraPlazoEnGrupo(
    opcion: RecomendacionFueraPlazoAgendaApp
  ) {
    const nombre = alumnoFueraPlazoNombre.trim();
    if (!nombre) {
      setErrorIncorporacionFueraPlazo('Escribe o selecciona el nombre del niño.');
      return;
    }

    const nivelValidado = parseTechnicalLevel(alumnoFueraPlazoNivel);
    if (nivelValidado.status !== 'VALID') {
      setErrorIncorporacionFueraPlazo(
        'Selecciona un nivel técnico individual válido. El alta tardía no puede crear un nivel por defecto.'
      );
      return;
    }
    const nivel = nivelValidado.level;
    const requiereRevision = opcion.estado === 'REVISAR';
    const esOtroTurno = !opcion.es_sesion_actual;
    const fechaHora = `${formatearFecha(opcion.fecha)} · ${opcion.hora_inicio?.slice(0, 5)}–${opcion.hora_fin?.slice(0, 5)}`;
    const mensaje = esOtroTurno
      ? `Vas a añadir a ${nombre} · ${nivel} en OTRO TURNO:\n\n${fechaHora}\n${opcion.grupo} · ${opcion.total_actual} → ${opcion.total_final} niños\n${opcion.entrenador || 'Sin entrenador'} · Punto ${opcion.punto}\n\nHazlo solo cuando los padres hayan confirmado el cambio de horario. ¿Continuar?`
      : requiereRevision
      ? `Este encaje requiere revisión manual.\n\n${nombre} · ${nivel}\n${opcion.grupo} · ${opcion.total_actual} → ${opcion.total_final} niños\n\n¿Quieres añadirlo igualmente a este grupo?`
      : `${nombre} · ${nivel}\n${opcion.grupo} · ${opcion.total_actual} → ${opcion.total_final} niños\n${opcion.entrenador || 'Sin entrenador'} · Punto ${opcion.punto}\n\n¿Confirmas que quieres añadirlo a este grupo?`;

    if (!window.confirm(mensaje)) return;

    setIncorporandoFueraPlazo(true);
    setError('');
    setErrorIncorporacionFueraPlazo('');
    setMensajeIncorporacionFueraPlazo('');

    try {
      const resultado = await ejecutarFuncionConRespuesta<{
        alumno_id: string;
        alumno: string;
        sesion_id: string;
        grupo_id: string;
        grupo: string;
        nivel_usado: string;
        resultado: string;
      }>('incorporar_alumno_fuera_plazo_grupo_app', {
        p_sesion_id: opcion.sesion_id,
        p_grupo_id: opcion.grupo_id,
        p_alumno_id: alumnoFueraPlazoAlumnoId || null,
        p_nombre_completo: nombre,
        p_nivel_codigo: nivel,
      });

      const incorporado = resultado[0];
      if (!incorporado) {
        throw new Error('Supabase no devolvió confirmación de la incorporación.');
      }

      await cargarAgendaOperativaDirecta();
      if (opcion.es_sesion_actual) {
        await cargarDetalleSesionAgenda(opcion.sesion_id);
      }

      setMensajeIncorporacionFueraPlazo(
        `${incorporado.alumno} añadido a ${incorporado.grupo} · ${fechaHora}. Listado y Vista entrenador actualizados.`
      );
      setRecomendacionesFueraPlazo([]);

      if (opcion.es_sesion_actual) {
        window.setTimeout(() => {
          document
            .getElementById('agenda-grupos-creados')
            ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 180);
      }
    } catch (err) {
      const mensajeError =
        err instanceof Error
          ? err.message
          : 'No se pudo incorporar el alumno al grupo.';
      setErrorIncorporacionFueraPlazo(mensajeError);
      setError(mensajeError);
    } finally {
      setIncorporandoFueraPlazo(false);
    }
  }

  async function buscarAlternativasSemanaParaPropuestaAgenda(
    dataPedagogica: AgendaRecomendacionSesionApp[],
    sesionActual: AgendaSesionDirectaApp,
    perfilesParaRecomendador: PerfilOperativoAlumnoApp[]
  ) {
    const gruposActuales = new Map<string, AgendaRecomendacionSesionApp[]>();
    dataPedagogica.forEach((alumno) => {
      gruposActuales.set(alumno.grupo_recomendado, [
        ...(gruposActuales.get(alumno.grupo_recomendado) || []),
        alumno,
      ]);
    });

    const alumnosAReubicar = Array.from(gruposActuales.values())
      .filter((grupo) => {
        const validacion = validacionPedagogicaGrupoApp(grupo);
        return grupo.length === 1 || validacion.estado === 'BLOQUEADO';
      })
      .flat();

    if (alumnosAReubicar.length === 0) {
      setAlternativasTurnoAgendaPorAlumno({});
      return;
    }

    setBuscandoAlternativasTurnoAgenda(true);

    try {
      const agendaActualizada = await consultarSupabase<AgendaSesionDirectaApp>(
        'v_agenda_sesiones_operativa_app',
        'select=*&order=fecha.asc,hora_inicio.asc'
      );
      setAgendaSesionesDirectas(agendaActualizada);

      const inicioSemanaActual = inicioSemanaAgenda(sesionActual.fecha);
      const modalidadActual = `${sesionActual.modalidad_codigo || sesionActual.modalidad || ''}`
        .trim()
        .toUpperCase();

      const sesionesAlternativas = agendaActualizada.filter((sesion) => {
        const modalidadSesion = `${sesion.modalidad_codigo || sesion.modalidad || ''}`
          .trim()
          .toUpperCase();

        return (
          sesion.sesion_id !== sesionActual.sesion_id &&
          inicioSemanaAgenda(sesion.fecha) === inicioSemanaActual &&
          modalidadSesion === modalidadActual
        );
      });

      const candidatosPorAlumno: Record<string, RecomendacionFueraPlazoAgendaApp[]> =
        Object.fromEntries(
          alumnosAReubicar.map((alumno) => [alumno.alumno_id, []])
        );

      for (const sesionAlternativa of sesionesAlternativas) {
        let gruposEvaluables: AgendaGrupoSesionApp[] = [];

        try {
          const filtroSesion = encodeURIComponent(`eq.${sesionAlternativa.sesion_id}`);
          const gruposReales = await consultarSupabase<AgendaGrupoSesionApp>(
            'v_grupos_sesion_operativa_app',
            `select=*&sesion_id=${filtroSesion}&order=nombre_grupo.asc`
          );

          gruposEvaluables = gruposReales.filter((grupo) =>
            Boolean(grupo.grupo_id)
          );
        } catch {
          gruposEvaluables = [];
        }

        // Si ese turno todavía no tiene grupos creados, calculamos su propuesta
        // a partir del listado ya cargado (por ejemplo, desde AimHarder).
        if (gruposEvaluables.length === 0) {
          try {
            const propuestaBase =
              await ejecutarFuncionConRespuesta<AgendaRecomendacionSesionApp>(
                'recomendar_grupos_sesion_operativa_app',
                { p_sesion_id: sesionAlternativa.sesion_id }
              );

            const esBabyAlternativa = textoSinAcentosGrupoApp(
              sesionAlternativa.modalidad_codigo ||
                sesionAlternativa.modalidad ||
                ''
            ).includes('baby');

            const propuestaPedagogica =
              aplicarCinturonPedagogicoAutomaticoAgenda(propuestaBase, {
                usarPerfilBaby:
                  esBabyAlternativa && perfilesParaRecomendador.length > 0,
                perfiles: perfilesParaRecomendador,
              });

            const propuestaPorGrupo = new Map<
              string,
              AgendaRecomendacionSesionApp[]
            >();
            propuestaPedagogica.forEach((alumno) => {
              propuestaPorGrupo.set(alumno.grupo_recomendado, [
                ...(propuestaPorGrupo.get(alumno.grupo_recomendado) || []),
                alumno,
              ]);
            });

            gruposEvaluables = Array.from(propuestaPorGrupo.entries()).map(
              ([nombreGrupo, alumnosGrupo]) => {
                const niveles = Array.from(
                  new Set(
                    alumnosGrupo
                      .map((alumno) => alumno.nivel_resumen)
                      .filter(Boolean)
                  )
                );
                const pista =
                  alumnosGrupo[0]?.pista_recomendada ||
                  alumnosGrupo[0]?.pista_alumno ||
                  'Pequeña/Grande';

                return {
                  sesion_id: sesionAlternativa.sesion_id,
                  grupo_id: `__PROPUESTA__${sesionAlternativa.sesion_id}__${nombreGrupo}`,
                  nombre_grupo: nombreGrupo,
                  nivel_grupo: niveles.join('/'),
                  pista,
                  punto_encuentro: null,
                  estado_grupo: 'PROPUESTA',
                  publicado: false,
                  trabajo_diario: null,
                  observaciones_importantes: null,
                  entrenador_id: null,
                  entrenador: null,
                  estado_confirmacion: null,
                  total_alumnos: alumnosGrupo.length,
                  alumnos_lista: alumnosGrupo
                    .map(
                      (alumno) =>
                        `${alumno.alumno} · ${alumno.nivel_resumen || ''}`
                    )
                    .join(' || '),
                };
              }
            );
          } catch {
            gruposEvaluables = [];
          }
        }

        for (const alumno of alumnosAReubicar) {
          // Si el alumno ya aparece en el listado de ese otro turno,
          // no proponemos duplicarlo.
          const yaEstaEnTurno = gruposEvaluables.some((grupo) =>
            String(grupo.alumnos_lista || '')
              .toLowerCase()
              .includes(String(alumno.alumno || '').toLowerCase())
          );
          if (yaEstaEnTurno) continue;

          gruposEvaluables.forEach((grupo) => {
            const opcion = evaluarGrupoFueraPlazoAgenda(
              grupo,
              sesionAlternativa,
              alumno.nivel_resumen || '',
              false
            );

            if (opcion.estado === 'RECOMENDADO') {
              const esPropuesta = grupo.grupo_id.startsWith('__PROPUESTA__');
              candidatosPorAlumno[alumno.alumno_id].push({
                ...opcion,
                punto: esPropuesta ? 'Se asignará al crear el grupo' : opcion.punto,
                entrenador: esPropuesta
                  ? 'Pendiente de asignar'
                  : opcion.entrenador,
                motivo: esPropuesta
                  ? `${opcion.motivo} Calculado sobre el listado/propuesta de ese turno; el grupo todavía no necesita estar creado.`
                  : opcion.motivo,
              });
            }
          });
        }
      }

      Object.keys(candidatosPorAlumno).forEach((alumnoId) => {
        candidatosPorAlumno[alumnoId].sort(
          (a, b) =>
            b.score - a.score ||
            a.fecha.localeCompare(b.fecha) ||
            a.hora_inicio.localeCompare(b.hora_inicio)
        );
        candidatosPorAlumno[alumnoId] =
          candidatosPorAlumno[alumnoId].slice(0, 5);
      });

      setAlternativasTurnoAgendaPorAlumno(candidatosPorAlumno);
    } catch (errorAlternativas) {
      console.warn(
        'No se pudieron calcular alternativas semanales de la propuesta.',
        errorAlternativas
      );
      setAlternativasTurnoAgendaPorAlumno(
        Object.fromEntries(
          alumnosAReubicar.map((alumno) => [alumno.alumno_id, []])
        )
      );
    } finally {
      setBuscandoAlternativasTurnoAgenda(false);
    }
  }

  async function generarRecomendacionAgendaSesion(sesionId: string) {
    if (!sesionId) {
      setError('Primero carga o selecciona una sesión.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      const data =
        await ejecutarFuncionConRespuesta<AgendaRecomendacionSesionApp>(
          'recomendar_grupos_sesion_operativa_app',
          { p_sesion_id: sesionId }
        );

      const sesionActual = agendaSesionesDirectas.find(
        (sesion) => sesion.sesion_id === sesionId
      );
      const esSesionBaby = textoSinAcentosGrupoApp(
        sesionActual?.modalidad_codigo || sesionActual?.modalidad || ''
      ).includes('baby');

      let perfilesParaRecomendador = perfilesOperativosAlumnos;

      if (esSesionBaby) {
        try {
          const perfilesActualizados =
            await ejecutarFuncionConRespuesta<PerfilOperativoAlumnoApp>(
              'obtener_perfil_operativo_alumnos_app',
              {}
            );
          perfilesParaRecomendador = Array.isArray(perfilesActualizados)
            ? perfilesActualizados
            : [];
          setPerfilesOperativosAlumnos(perfilesParaRecomendador);
        } catch (errorPerfil) {
          console.warn(
            'No se pudo refrescar el perfil operativo para el recomendador Baby. Se mantiene el recomendador base.',
            errorPerfil
          );
          perfilesParaRecomendador = [];
        }
      }

      const dataPedagogica = aplicarCinturonPedagogicoAutomaticoAgenda(data, {
        usarPerfilBaby: esSesionBaby && perfilesParaRecomendador.length > 0,
        perfiles: perfilesParaRecomendador,
      });
      setAgendaRecomendaciones(dataPedagogica);
      setAlternativasTurnoAgendaPorAlumno({});
      setDestinoAlumnoAgendaGrupo({});

      if (sesionActual) {
        await buscarAlternativasSemanaParaPropuestaAgenda(
          dataPedagogica,
          sesionActual,
          perfilesParaRecomendador
        );
      }
      // No borramos los grupos manuales: si Jose crea "Grupo B+" antes de generar,
      // debe quedar disponible como destino para mover alumnos.
      setEntrenadoresAgendaGrupo({});
      setEntrenadoresApoyoAgendaGrupo({});
      setResponsablesReporteAgendaGrupo({});
      setTrabajoAgendaGrupo({});
      setObservacionesAgendaGrupo({});

      window.setTimeout(() => {
        document
          .getElementById('agenda-propuesta-grupos')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 140);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setAgendaRecomendaciones([]);
    }

    setCargando(false);
  }

  function claveAlumnoAgendaRecomendado(alumnoId: string) {
    return `${agendaSesionActivaId || 'sin_sesion'}__${alumnoId}`;
  }

  function destinoActualAlumnoAgenda(alumno: AgendaRecomendacionSesionApp) {
    return (
      destinoAlumnoAgendaGrupo[
        claveAlumnoAgendaRecomendado(alumno.alumno_id)
      ] || alumno.grupo_recomendado
    );
  }

  function nombresGruposAgendaBase() {
    return Array.from(
      new Set([
        ...agendaRecomendaciones
          .map((alumno) => alumno.grupo_recomendado)
          .filter(Boolean),
        ...gruposAgendaManuales,
      ])
    );
  }

  function crearGrupoManualAgenda() {
    if (!agendaSesionActivaId) {
      setError('Primero abre una sesión antes de crear un grupo manual.');
      return;
    }

    const sugerido = `Grupo manual ${gruposAgendaManuales.length + 1}`;
    const nombre = window.prompt(
      'Nombre del nuevo grupo manual. Ejemplo: Grupo B+ o Grupo C/D',
      sugerido
    );
    const limpio = (nombre || '').trim();
    if (!limpio) return;

    const yaExiste =
      gruposAgendaManuales.includes(limpio) ||
      nombresGruposAgendaBase().includes(limpio);
    if (yaExiste) {
      setError(`El grupo manual "${limpio}" ya existe.`);
      return;
    }

    setError('');
    setGruposAgendaManuales((anteriores) => [...anteriores, limpio]);

    // Si todavía no hay propuesta, generamos una base para que aparezcan los alumnos
    // y se puedan mover al grupo manual recién creado.
    if (agendaRecomendaciones.length === 0) {
      setTimeout(
        () => generarRecomendacionAgendaSesion(agendaSesionActivaId),
        0
      );
    }
  }

  function esGrupoParticularAgenda(nombreGrupo: string | null | undefined) {
    return esNombreGrupoParticularApp(nombreGrupo);
  }

  function nombreGrupoParticularAgenda(
    alumno: AgendaRecomendacionSesionApp
  ) {
    return `PARTICULAR · ${alumno.alumno}`;
  }

  function valorSelectorDestinoAlumnoAgenda(
    alumno: AgendaRecomendacionSesionApp
  ) {
    const destino = destinoActualAlumnoAgenda(alumno);
    return esGrupoParticularAgenda(destino) ? '__PARTICULAR__' : destino;
  }

  function etiquetaDiaFechaAgenda(fechaIso: string) {
    const fecha = new Date(`${fechaIso}T12:00:00`);
    const dia = fecha
      .toLocaleDateString('es-ES', { weekday: 'long' })
      .replace('.', '')
      .toUpperCase();
    return `${dia} ${formatearFecha(fechaIso)}`;
  }

  function moverAlumnoAgendaRecomendado(alumnoId: string, destino: string) {
    const alumno = agendaRecomendaciones.find(
      (registro) => registro.alumno_id === alumnoId
    );
    const destinoReal =
      destino === '__PARTICULAR__' && alumno
        ? nombreGrupoParticularAgenda(alumno)
        : destino;

    setDestinoAlumnoAgendaGrupo((anterior) => ({
      ...anterior,
      [claveAlumnoAgendaRecomendado(alumnoId)]: destinoReal,
    }));
  }

  async function moverAlumnoPropuestaAOtroTurnoAgenda(
    alumno: AgendaRecomendacionSesionApp,
    opcion: RecomendacionFueraPlazoAgendaApp
  ) {
    const alumnoSesion = agendaAlumnosSesion.find(
      (registro) => registro.alumno_id === alumno.alumno_id
    );

    if (!alumnoSesion) {
      setError('No encuentro al alumno en la sesión actual. Actualiza y vuelve a intentarlo.');
      return;
    }

    const confirmar = window.confirm(
      `¿Mover a ${alumno.alumno} a ${etiquetaDiaFechaAgenda(opcion.fecha)} · ${opcion.hora_inicio.slice(0, 5)}–${opcion.hora_fin.slice(0, 5)}?

${opcion.grupo} · ${opcion.total_actual} → ${opcion.total_final} niños

Confirma solo si los padres han aceptado el cambio de día/horario.`
    );
    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('mover_alumno_entre_turnos_operativa_app', {
        p_sesion_alumno_id: alumnoSesion.sesion_alumno_id,
        p_grupo_destino_id: opcion.grupo_id,
      });

      await cargarAgendaOperativaDirecta();
      await cargarDetalleSesionAgenda(agendaSesionActivaId, {
        preservarPropuesta: true,
        preservarScroll: true,
      });
      await cargarPlanning();
      await cargarGruposEntrenador();
      setAgendaRecomendaciones((actuales) =>
        actuales.filter((registro) => registro.alumno_id !== alumno.alumno_id)
      );
      setAlternativasTurnoAgendaPorAlumno((actuales) => {
        const copia = { ...actuales };
        delete copia[alumno.alumno_id];
        return copia;
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo mover al alumno al otro turno.'
      );
    } finally {
      setCargando(false);
    }
  }

  function gruposRecomendadosAgenda() {
    const mapa = new Map<string, AgendaRecomendacionSesionApp[]>();

    agendaRecomendaciones.forEach((alumno) => {
      const destino = destinoActualAlumnoAgenda(alumno);
      if (destino === '__NO_CREAR__') return;

      mapa.set(destino, [
        ...(mapa.get(destino) || []),
        { ...alumno, grupo_recomendado: destino },
      ]);
    });

    return [...mapa.entries()]
      .map(
        ([nombreGrupo, alumnosGrupo]) =>
          [
            nombreGrupo,
            alumnosGrupo.sort((a, b) => {
              return (
                a.orden_bloque - b.orden_bloque ||
                a.nivel_orden - b.nivel_orden ||
                a.alumno.localeCompare(b.alumno)
              );
            }),
          ] as [string, AgendaRecomendacionSesionApp[]]
      )
      .sort((a, b) => {
        const primeroA = a[1][0];
        const primeroB = b[1][0];
        if (!primeroA || !primeroB) return 0;
        return (
          primeroA.orden_bloque - primeroB.orden_bloque ||
          a[0].localeCompare(b[0])
        );
      });
  }

  function ordenNivelTrabajoMSZApp(nivel: string | null | undefined) {
    return technicalLevelOrder(nivel) ?? Number.NaN;
  }

  function nivelOrdenPedagogicoApp(nivel: string | null | undefined) {
    return ordenNivelTrabajoMSZApp(nivel);
  }

  function nivelEtiquetaPedagogicaApp(orden: number) {
    if (orden <= 0) return 'INICIACIÓN';
    if (orden === 1) return 'A';
    if (orden === 2) return 'A+';
    if (orden === 3) return 'B';
    if (orden === 4) return 'B+';
    if (orden === 5) return 'C';
    if (orden === 6) return 'C+';
    if (orden === 7) return 'D';
    return 'D+';
  }

  function validacionPedagogicaGrupoApp(
    alumnosGrupo: {
      nivel_resumen?: string | null;
      alumno?: string | null;
      pista_recomendada?: string | null;
      pista_alumno?: string | null;
      fuente_nivel?: string | null;
      estado_ficha?: string | null;
      alertas?: string | null;
      alerta_grupo?: string | null;
    }[]
  ) {
    const validacion = validateGroupPedagogy(
      alumnosGrupo.map((alumno) => ({
        level: alumno.nivel_resumen,
        source: alumno.fuente_nivel,
        recordStatus: alumno.estado_ficha,
        alerts: [alumno.alertas, alumno.alerta_grupo]
          .filter(Boolean)
          .join(' · '),
      }))
    );

    return {
      estado: validacion.status,
      niveles: validacion.levels,
      mensajes: validacion.messages,
    };
  }

  function textoValidacionPedagogicaGrupoApp(
    alumnosGrupo: {
      nivel_resumen?: string | null;
      alumno?: string | null;
      pista_recomendada?: string | null;
      pista_alumno?: string | null;
      fuente_nivel?: string | null;
      estado_ficha?: string | null;
      alertas?: string | null;
      alerta_grupo?: string | null;
    }[]
  ) {
    const validacion = validacionPedagogicaGrupoApp(alumnosGrupo);
    const titulo =
      validacion.estado === 'BLOQUEADO'
        ? 'BLOQUEADO · Reorganiza el grupo'
        : validacion.estado === 'SUPERVISION_JOSE'
        ? 'SUPERVISIÓN JOSE'
        : validacion.estado === 'AVISO'
        ? 'AVISO PEDAGÓGICO'
        : 'OK PEDAGÓGICO';
    return { ...validacion, titulo };
  }

  function estiloValidacionPedagogicaApp(estado: string): React.CSSProperties {
    if (estado === 'BLOQUEADO') return avisoPendiente;
    if (estado === 'SUPERVISION_JOSE') return avisoPendiente;
    if (estado === 'AVISO') return avisoCompleto;
    return avisoNeutral;
  }

  function bandaAutomaticaPedagogicaApp(registro: {
    nivel_resumen?: string | null;
  }) {
    const band = pedagogicalBandForLevel(registro.nivel_resumen);
    return {
      id: band.id,
      label: band.label,
      bloque: band.block,
      pista: band.piste,
      orden: band.order,
      max: band.maxSize,
    };
  }

  function necesitaDosEntrenadoresGrupoApp(
    alumnosGrupo: {
      nivel_resumen?: string | null;
      pista_recomendada?: string | null;
      pista_alumno?: string | null;
    }[]
  ) {
    return babyLowGroupNeedsSupport(
      alumnosGrupo.map((alumno) => ({
        level: alumno.nivel_resumen,
        recommendedPiste: alumno.pista_recomendada,
        studentPiste: alumno.pista_alumno,
      }))
    );
  }

  function textoNecesidadDosEntrenadoresApp(
    alumnosGrupo: {
      nivel_resumen?: string | null;
      pista_recomendada?: string | null;
      pista_alumno?: string | null;
    }[],
    segundoEntrenadorAsignado = false
  ) {
    return babySupportMessage(
      alumnosGrupo.map((alumno) => ({
        level: alumno.nivel_resumen,
        recommendedPiste: alumno.pista_recomendada,
        studentPiste: alumno.pista_alumno,
      })),
      segundoEntrenadorAsignado
    );
  }

  function responsableReporteRecomendadoApp(
    claveGrupo: string,
    alumnoId: string,
    indice: number,
    entrenadorPrincipalId: string,
    entrenadorApoyoId: string
  ) {
    const clave = `${claveGrupo}__${alumnoId}`;
    return (
      responsablesReportePorGrupoRecomendado[clave] ||
      responsableAutomaticoReporteApp(
        indice,
        entrenadorPrincipalId,
        entrenadorApoyoId
      )
    );
  }

  function responsableReporteAgendaApp(
    nombreGrupo: string,
    alumnoId: string,
    indice: number,
    entrenadorPrincipalId: string,
    entrenadorApoyoId: string
  ) {
    const clave = `${nombreGrupo}__${alumnoId}`;
    return (
      responsablesReporteAgendaGrupo[clave] ||
      responsableAutomaticoReporteApp(
        indice,
        entrenadorPrincipalId,
        entrenadorApoyoId
      )
    );
  }

  function responsablesJsonGrupoRecomendadoApp(
    claveGrupo: string,
    alumnosGrupo: { alumno_id: string }[],
    entrenadorPrincipalId: string,
    entrenadorApoyoId: string
  ) {
    return buildTrainerReportAssignments(
      claveGrupo,
      alumnosGrupo,
      entrenadorPrincipalId,
      entrenadorApoyoId,
      responsablesReportePorGrupoRecomendado
    );
  }

  function responsablesJsonAgendaApp(
    nombreGrupo: string,
    alumnosGrupo: { alumno_id: string }[],
    entrenadorPrincipalId: string,
    entrenadorApoyoId: string
  ) {
    return buildTrainerReportAssignments(
      nombreGrupo,
      alumnosGrupo,
      entrenadorPrincipalId,
      entrenadorApoyoId,
      responsablesReporteAgendaGrupo
    );
  }

  function ajusteAutonomiaPerfilIntensivoApp(
    perfil?: PerfilOperativoAlumnoApp
  ) {
    const texto = String(perfil?.autonomia_reciente || '').toLowerCase();

    if (/autónomo total|autonomo total|muy autónom|muy autonom|pista grande/.test(texto)) {
      return 2;
    }

    if (/necesita ayuda|pista pequeña|pista pequena|poca autonomía|poca autonomia/.test(texto)) {
      return -2;
    }

    return 0;
  }

  function ajusteDemandaPerfilIntensivoApp(
    perfil?: PerfilOperativoAlumnoApp
  ) {
    if (perfil?.demanda_atencion === 'ALTA') return -2;
    if (perfil?.demanda_atencion === 'MEDIA') return -1;
    return 0;
  }

  function puntuacionFuncionalIntensivoApp(
    alumno: RecomendacionGrupoIntensivoDiaApp,
    perfiles: PerfilOperativoAlumnoApp[]
  ) {
    const perfil = perfiles.find(
      (item) => item.alumno_id === alumno.alumno_id
    );

    const fuerza =
      perfil?.fuerza_nivel === 'MUY_FUERTE'
        ? 3
        : perfil?.fuerza_nivel === 'FUERTE'
        ? 2
        : perfil?.fuerza_nivel === 'BAJO'
        ? -3
        : 0;

    const ordenNivel = nivelOrdenPedagogicoApp(alumno.nivel_resumen);
    if (!Number.isFinite(ordenNivel)) return Number.NEGATIVE_INFINITY;

    return (
      ordenNivel * 10 +
      fuerza +
      ajusteAutonomiaPerfilIntensivoApp(perfil) +
      ajusteDemandaPerfilIntensivoApp(perfil)
    );
  }

  function ordenarIntensivoPorPerfilOperativoApp(
    alumnos: RecomendacionGrupoIntensivoDiaApp[],
    perfiles: PerfilOperativoAlumnoApp[]
  ) {
    return alumnos.slice().sort((a, b) => {
      const puntuacion =
        puntuacionFuncionalIntensivoApp(b, perfiles) -
        puntuacionFuncionalIntensivoApp(a, perfiles);

      if (puntuacion !== 0) return puntuacion;

      const perfilA = perfiles.find(
        (item) => item.alumno_id === a.alumno_id
      );
      const perfilB = perfiles.find(
        (item) => item.alumno_id === b.alumno_id
      );

      const edadA =
        perfilA?.edad_aprox ??
        (typeof a.edad === 'number' ? a.edad : Number.POSITIVE_INFINITY);
      const edadB =
        perfilB?.edad_aprox ??
        (typeof b.edad === 'number' ? b.edad : Number.POSITIVE_INFINITY);

      if (
        Number.isFinite(edadA) &&
        Number.isFinite(edadB) &&
        edadA !== edadB
      ) {
        return edadA - edadB;
      }

      return a.alumno.localeCompare(b.alumno);
    });
  }

  function aplicarCinturonPedagogicoAutomaticoIntensivo(
    data: RecomendacionGrupoIntensivoDiaApp[],
    perfiles?: PerfilOperativoAlumnoApp[]
  ) {
    const porBanda = new Map<string, RecomendacionGrupoIntensivoDiaApp[]>();
    data.forEach((registro) => {
      const banda = bandaAutomaticaPedagogicaApp(registro);
      porBanda.set(banda.id, [...(porBanda.get(banda.id) || []), registro]);
    });

    let contador = 1;
    const salida: RecomendacionGrupoIntensivoDiaApp[] = [];
    ['INICIACION_A', 'APLUS', 'B_BPLUS', 'C_D', 'REVIEW'].forEach((idBanda) => {
      const alumnosBase = porBanda.get(idBanda) || [];
      const alumnos =
        perfiles && perfiles.length > 0
          ? ordenarIntensivoPorPerfilOperativoApp(
              alumnosBase,
              perfiles
            )
          : alumnosBase.slice().sort((a, b) => {
              return (
                nivelOrdenPedagogicoApp(a.nivel_resumen) -
                  nivelOrdenPedagogicoApp(b.nivel_resumen) ||
                a.alumno.localeCompare(b.alumno)
              );
            });
      if (alumnos.length === 0) return;
      const banda = bandaAutomaticaPedagogicaApp(alumnos[0]);
      let inicio = 0;
      tamanosGruposPedagogicosApp(alumnos.length, banda.max).forEach(
        (tamano) => {
          const alumnosChunk = alumnos.slice(inicio, inicio + tamano);
          const nombre =
            tamano === 1
              ? `REVISIÓN MANUAL · ${banda.label}`
              : `Grupo ${contador++} · Nivel ${banda.label}`;
          alumnosChunk.forEach((alumno, indice) => {
            const alertaExtra =
              tamano === 1
                ? 'No crear grupo de 1. Revisión manual.'
                : alumno.alerta_grupo || null;
            salida.push({
              ...alumno,
              grupo_recomendado: nombre,
              bloque_tecnico: banda.bloque,
              pista_recomendada: banda.pista,
              orden_bloque: banda.orden,
              orden_en_grupo: indice + 1,
              tamanio_grupo: tamano,
              alerta_grupo:
                [alumno.alerta_grupo, alertaExtra]
                  .filter(Boolean)
                  .join(' · ') || 'OK',
            });
          });
          inicio += tamano;
        }
      );
    });
    return salida;
  }

  function confirmarCrearGrupoConValidacionPedagogicaApp(
    alumnosGrupo: {
      nivel_resumen?: string | null;
      alumno?: string | null;
      pista_recomendada?: string | null;
      pista_alumno?: string | null;
      fuente_nivel?: string | null;
      estado_ficha?: string | null;
      alertas?: string | null;
      alerta_grupo?: string | null;
    }[],
    nombreGrupo: string
  ) {
    const validacion = textoValidacionPedagogicaGrupoApp(alumnosGrupo);
    if (validacion.estado === 'BLOQUEADO') {
      setError(
        `${nombreGrupo}: ${validacion.mensajes.join(' ') || 'La composición del grupo está bloqueada.'}`
      );
      return false;
    }
    if (validacion.estado !== 'OK') {
      return window.confirm(
        `${validacion.titulo}\n\n${validacion.mensajes.join('\n')}\n\nHay una excepción o revisión pedagógica. ¿Continuar con este grupo?`
      );
    }
    return true;
  }

  function perfilTrabajoMSZApp(niveles: string[], pistaTexto: string) {
    const ordenes = niveles
      .map(ordenNivelTrabajoMSZApp)
      .filter((orden) => Number.isFinite(orden));
    if (ordenes.length === 0) return 'REQUIERE_REVISION';
    const min = Math.min(...ordenes);
    const max = Math.max(...ordenes);

    if (min <= 1 && max <= 1) return 'INICIACION_A';
    if (max <= 2) return 'APLUS';
    if (max <= 4) return 'B_BPLUS';
    if (max <= 6) return 'C_CPLUS';
    return 'D_DPLUS';
  }

  function trabajoDiarioMSZApp(
    nombreGrupo: string,
    niveles: string[],
    pistaTexto: string,
    observacionesTexto?: string | null,
    alumnosContexto: AlumnoContextoTrabajoDiarioApp[] = [],
    modalidad = 'BABY',
    trabajosRecientes: string[] = []
  ) {
    return generarTrabajoDiarioInteligenteApp({
      nombreGrupo,
      modalidad,
      niveles,
      pista: pistaTexto || 'Pequeña/Grande',
      observacionesGrupo: observacionesTexto || '',
      alumnos: alumnosContexto,
      trabajosRecientes,
    });
  }

  function trabajoDiarioAutomaticoAgenda(
    nombreGrupo: string,
    alumnosGrupo: AgendaRecomendacionSesionApp[]
  ) {
    const niveles = alumnosGrupo
      .map((alumno) => alumno.nivel_resumen || '')
      .filter(Boolean);
    const pista =
      alumnosGrupo[0]?.pista_recomendada ||
      alumnosGrupo[0]?.pista_alumno ||
      'Pequeña/Grande';
    const observaciones = observacionesAutomaticasGrupoAgenda(alumnosGrupo);
    const alumnosContexto = alumnosGrupo.map((alumno) =>
      contextoAlumnoTrabajoDiarioApp(
        alumno.alumno_id,
        alumno.alumno,
        alumno.nivel_resumen || ''
      )
    );

    const sesion = agendaSesionesDirectas.find(
      (item) => item.sesion_id === agendaSesionActivaId
    );

    const trabajosRecientes = trabajosRecientesParaGrupoApp(
      alumnosGrupo.map((alumno) => alumno.alumno),
      sesion?.fecha
    );

    return trabajoDiarioMSZApp(
      nombreGrupo,
      niveles,
      pista,
      observaciones,
      alumnosContexto,
      sesion?.modalidad || 'BABY',
      trabajosRecientes
    );
  }

  function limpiarObservacionCortaGrupoApp(
    texto: string | null | undefined,
    maximo = 170
  ) {
    const limpio = (texto || '')
      .replace(/\s+/g, ' ')
      .replace(/\s+([,.])/g, '$1')
      .trim();

    if (!limpio) return '';
    return limpio.length > maximo
      ? `${limpio.slice(0, maximo).trim()}...`
      : limpio;
  }

  function textoSinAcentosGrupoApp(texto: string) {
    return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
  }

  function observacionUtilParaGrupoApp(texto: string | null | undefined) {
    const limpio = limpiarObservacionCortaGrupoApp(texto, 260);
    if (!limpio) return '';

    const normalizado = textoSinAcentosGrupoApp(limpio);
    const ruido = [
      'alumno nuevo',
      'alumno conocido',
      'ficha pendiente',
      'pendiente de nivel',
      'jose debe asignar nivel antes de generar grupos',
      'sin nivel',
      'ok',
    ];

    let depurado = normalizado;
    ruido.forEach((palabra) => {
      depurado = depurado.replaceAll(palabra, '');
    });
    depurado = depurado.replace(/[.·:;\-\s]/g, '');

    return depurado ? limpio : '';
  }

  function resumenCualidadDebilidadFichaApp(
    observacionBase?: string | null,
    extra?: string | null
  ) {
    const partesUtiles = [observacionBase, extra]
      .map((parte) => observacionUtilParaGrupoApp(parte))
      .filter(Boolean);

    if (partesUtiles.length === 0) return '';

    const base = limpiarObservacionCortaGrupoApp(partesUtiles.join(' · '), 260);
    const texto = textoSinAcentosGrupoApp(base);
    const notas: string[] = [];

    if (
      /actitud|ganas|content|sonrient|disfrut|motivad|escucha|obedece|hablador|habladora|buena/.test(
        texto
      )
    ) {
      notas.push('cualidad: buena actitud y ganas');
    }
    if (/autonom|solo|sola|material|se pone|se quita/.test(texto)) {
      notas.push('cualidad: autonomía');
    }
    if (/llor|bloque|miedo|asust|nervi|sensible|se agobia/.test(texto)) {
      notas.push(
        'debilidad: puede bloquearse o tener miedo; entrada tranquila'
      );
    }
    if (/remonte|percha|silla|cinta/.test(texto)) {
      notas.push('debilidad/aviso: revisar remonte o cinta');
    }
    if (
      /fila|separa|escapa|despista|atencion|atiende|hacer caso|caso/.test(texto)
    ) {
      notas.push('debilidad: atención, fila y dinámica de grupo');
    }
    if (/sentad|sienta/.test(texto)) {
      notas.push('debilidad técnica: tiende a ir sentado');
    }
    if (/rigid|rigidez/.test(texto)) {
      notas.push('debilidad técnica: rigidez');
    }
    if (/velocidad|corre|rapido|rápido|frena|frenada/.test(texto)) {
      notas.push('debilidad técnica: control de velocidad y frenada');
    }
    if (
      /cuna|cuña|giro|giros|paralelo|brazos|manos|mirada|exterior/.test(texto)
    ) {
      notas.push('debilidad/tarea técnica: giros, postura y control');
    }

    const notasUnicas = Array.from(new Set(notas)).slice(0, 3);
    if (notasUnicas.length > 0) return `${notasUnicas.join(' / ')}.`;
    return base;
  }

  function nombreLimpioObservacionesGrupoApp(nombre: string) {
    const original = `${nombre || ''}`.replace(/\s+/g, ' ').trim();

    const limpio = original
      // Etiquetas usadas en datos de prueba: no deben convertirse en
      // encabezados ni formar parte del nombre mostrado en Observaciones.
      .replace(/^\[TEST[^\]]*\]\s*/i, '')
      .replace(/^TEST\s+NUEVO\s*[·:\-]\s*/i, '')
      .replace(/^NIVEL\s+APP\s+[A-D](?:\+{1,2})?\s*[·:\-]\s*/i, '')
      .replace(/^SIN\s+REPORTES\s*[·:\-]\s*/i, '')
      .replace(/^ULTIMO\s+REPORTE\s*[·:\-]\s*/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    return limpio || original || 'Alumno';
  }

  function fraseImportanteAlumnoGrupoApp(
    nombre: string,
    observacionBase?: string | null,
    extra?: string | null
  ) {
    const detalle = resumenCualidadDebilidadFichaApp(observacionBase, extra);
    const nombreVisible = nombreLimpioObservacionesGrupoApp(nombre);
    return `${nombreVisible}: ${detalle || 'Nada relevante'}`;
  }

  function observacionEstandarAlumnoAgendaApp(
    alumno: AgendaRecomendacionSesionApp
  ) {
    const fichaSesion = agendaAlumnosSesion.find(
      (registro) => registro.alumno_id === alumno.alumno_id
    );
    const resumen = alumnos.find(
      (registro) => registro.alumno_id === alumno.alumno_id
    );

    const nombre = nombreLimpioObservacionesGrupoApp(alumno.alumno);
    const nivel = (alumno.nivel_resumen || fichaSesion?.nivel_usado || '')
      .trim()
      .toUpperCase();
    const origen = `${fichaSesion?.origen_nivel || alumno.fuente_nivel || ''}`
      .trim()
      .toUpperCase();
    const esNuevo = `${fichaSesion?.estado_en_listado || ''}`
      .trim()
      .toUpperCase() === 'NUEVO';

    const revisarNivel =
      /PENDIENTE|REVISAR|DUD|DESCONOC/.test(origen) ||
      /REVISAR|PENDIENTE/.test(`${alumno.alertas || ''}`.toUpperCase());

    if (esNuevo) {
      if (/FAMILIA|DECLARAD/.test(origen) && nivel) {
        return `${nombre}: Nivel ${nivel} declarado por familia · validar en pista`;
      }
      return `${nombre}: NUEVO · Sin historial. Revisar nivel y adaptación en primera bajada.`;
    }

    if (revisarNivel && !(Number(resumen?.total_reportes ?? 0) > 0)) {
      return `${nombre}: REVISAR NIVEL · validar en primera bajada`;
    }

    // Una sola observación operativa vigente, con prioridad:
    // seguridad/remontes/autonomía -> actitud -> técnica/recomendación.
    const partes: string[] = [];

    const incidencia = `${resumen?.ultima_incidencia || ''}`.trim();
    if (
      incidencia &&
      !/^(NO|NINGUNA|SIN INCIDENCIA|NADA)$/i.test(incidencia)
    ) {
      partes.push(incidencia);
    }

    const remontes = Array.isArray(resumen?.ultimos_remontes)
      ? resumen?.ultimos_remontes.filter(Boolean).join(', ')
      : '';
    const autonomia = `${resumen?.ultima_autonomia || ''}`.trim();
    const seguridad = [remontes, autonomia].filter(Boolean).join(' · ');
    if (seguridad) partes.push(seguridad);

    const actitud = `${resumen?.ultima_actitud || ''}`.trim();
    if (actitud) partes.push(actitud);

    const tecnica = `${resumen?.ultima_tecnica || ''}`.trim();
    const recomendacion = `${resumen?.ultima_recomendacion || ''}`.trim();
    const tecnico = [tecnica, recomendacion].filter(Boolean).join(' · ');
    if (tecnico) partes.push(tecnico);

    const detalle = limpiarObservacionCortaGrupoApp(
      partes.filter(Boolean).slice(0, 3).join(' · '),
      220
    );

    return studentObservationWithLevelReview(nombre, detalle, revisarNivel);
  }

  function limpiarTextoObservacionesGrupoApp(texto: string | null | undefined) {
    if (!texto) return '';

    return String(texto)
      .replace(/OBSERVACIONES\s+AUTOM[ÁA]TICAS\s+PARA\s+ENTRENADOR/gi, '')
      .replace(/OBSERVACIONES\s+JOSE/gi, '')
      .replace(/OBSERVACIONES\s+JOS[ÉE]/gi, '')
      .replace(/Observaciones\s+autom[áa]ticas\s+para\s+el\s+entrenador/gi, '')
      .replace(/Observaciones\s+autom[áa]ticas\s+para\s+entrenador/gi, '')
      .replace(/Observaciones\s+de\s+Jose/gi, '')
      .replace(/Observaciones\s+de\s+Jos[ée]/gi, '')
      .replace(/[•]/g, '\n')
      // No separar por "·": puede formar parte del nombre del alumno
      // (ej. "TEST NUEVO · Ana Gil"). Las observaciones ya vienen una por línea.
      .replace(/[ \t]+/g, ' ')
      .split('\n')
      .map((linea) => linea.trim())
      .filter(Boolean)
      .join('\n')
      .trim();
  }

  function limpiarDetalleObservacionAlumnoGrupoApp(
    detalle: string | null | undefined
  ) {
    if (!detalle) return '';

    let limpio = String(detalle)
      .replace(/\s+/g, ' ')
      .replace(/\s*·\s*/g, ' · ')
      .trim();

    const patronesRuido = [
      /\bAlumno nuevo\.?/gi,
      /\bAlumno conocido\.?/gi,
      /\bFicha pendiente\.?/gi,
      /\bOK\.?/gi,
      /\bPendiente de nivel:\s*Jose debe asignar nivel antes de generar grupos\.?/gi,
      /\bPendiente de nivel:\s*Jos[ée] debe asignar nivel antes de generar grupos\.?/gi,
      /\bJose debe asignar nivel antes de generar grupos\.?/gi,
      /\bJos[ée] debe asignar nivel antes de generar grupos\.?/gi,
      /\bNivel estimado\.?/gi,
      /\bNivel real de ficha\.?/gi,
      /\bpendiente completar\.?/gi,
      /\bcompleta\.?/gi,
    ];

    patronesRuido.forEach((patron) => {
      limpio = limpio.replace(patron, '');
    });

    limpio = limpio
      .replace(/(?:\s*·\s*){2,}/g, ' · ')
      .replace(/^\s*[·.:;,-]+\s*/g, '')
      .replace(/\s*[·.:;,-]+\s*$/g, '')
      .trim();

    if (!limpio) return '';

    return limpiarObservacionCortaGrupoApp(limpio, 220);
  }

  function extraerObservacionesPorAlumnoGrupoApp(
    texto: string | null | undefined,
    maxLineas = 12
  ) {
    const limpio = limpiarTextoObservacionesGrupoApp(texto);
    if (!limpio) return [] as string[];

    const lineas: string[] = [];

    limpio
      .split('\n')
      .map((linea) => linea.trim().replace(/^[-•]+\s*/, ''))
      .filter(Boolean)
      .forEach((linea) => {
        const separador = linea.indexOf(':');
        if (separador > 0) {
          const nombre = linea.slice(0, separador).replace(/\s+/g, ' ').trim();
          const detalle = limpiarDetalleObservacionAlumnoGrupoApp(
            linea.slice(separador + 1)
          );
          if (nombre && detalle) lineas.push(`${nombre}: ${detalle}`);
          return;
        }

        const detalle = limpiarDetalleObservacionAlumnoGrupoApp(linea);
        if (detalle) lineas.push(detalle);
      });

    if (lineas.length === 0) {
      const patronNombre = /([^:\n]{3,90})\s*:/g;
      const coincidencias = Array.from(limpio.matchAll(patronNombre));

      coincidencias.forEach((coincidencia, index) => {
        const nombre = (coincidencia[1] || '')
          .replace(/^(ENTRENADOR|PARA ENTRENADOR|OBSERVACIONES)\s+/i, '')
          .replace(/\s+/g, ' ')
          .trim();
        const inicioDetalle =
          (coincidencia.index || 0) + coincidencia[0].length;
        const finDetalle =
          index + 1 < coincidencias.length
            ? coincidencias[index + 1].index || limpio.length
            : limpio.length;
        const detalle = limpiarDetalleObservacionAlumnoGrupoApp(
          limpio.slice(inicioDetalle, finDetalle)
        );
        if (nombre && detalle) lineas.push(`${nombre}: ${detalle}`);
      });
    }

    return Array.from(new Set(lineas)).slice(0, maxLineas);
  }

  function normalizarLineasObservacionesGrupoApp(
    texto: string | null | undefined,
    maxLineas = 12
  ) {
    return extraerObservacionesPorAlumnoGrupoApp(texto, maxLineas).join('\n');
  }

  function combinarObservacionesGrupoApp(
    automaticas: string,
    manuales: string | null | undefined
  ) {
    const auto = normalizarLineasObservacionesGrupoApp(automaticas, 10);
    const manual = normalizarLineasObservacionesGrupoApp(manuales, 6);
    return [auto, manual].filter(Boolean).join('\n');
  }

  function observacionesAutomaticasGrupoAgenda(
    alumnosGrupo: AgendaRecomendacionSesionApp[]
  ) {
    const lineas = alumnosGrupo.map(observacionEstandarAlumnoAgendaApp);
    return normalizarLineasObservacionesGrupoApp(lineas.join('\n'));
  }

  function observacionEstandarAlumnoIntensivoApp(
    alumno: RecomendacionGrupoIntensivoDiaApp
  ) {
    const resumen = alumnos.find(
      (registro) => registro.alumno_id === alumno.alumno_id
    );

    const nombre = nombreLimpioObservacionesGrupoApp(alumno.alumno);
    const nivel = `${alumno.nivel_resumen || ''}`.trim().toUpperCase();
    const origen = `${alumno.fuente_nivel || resumen?.origen_nivel_estimado || ''}`
      .trim()
      .toUpperCase();
    const estadoFicha = `${alumno.estado_ficha || resumen?.estado_ficha || ''}`
      .trim()
      .toUpperCase();

    const revisarNivel =
      /PENDIENTE|REVISAR|DUD|DESCONOC/.test(origen) ||
      /REVISAR|PENDIENTE/.test(estadoFicha);

    if (/FAMILIA|DECLARAD/.test(origen) && nivel) {
      return `${nombre}: Nivel ${nivel} declarado por familia · validar en pista`;
    }

    if (revisarNivel && nivel) {
      return `${nombre}: REVISAR NIVEL · validar en primera bajada`;
    }

    const partes: string[] = [];

    const incidencia = `${resumen?.ultima_incidencia || ''}`.trim();
    if (
      incidencia &&
      !/^(NO|NINGUNA|SIN INCIDENCIA|NADA)$/i.test(incidencia)
    ) {
      partes.push(incidencia);
    }

    const remontes = Array.isArray(resumen?.ultimos_remontes)
      ? resumen.ultimos_remontes.filter(Boolean).join(', ')
      : '';
    const autonomia = `${resumen?.ultima_autonomia || ''}`.trim();
    const seguridad = [remontes, autonomia].filter(Boolean).join(' · ');
    if (seguridad) partes.push(seguridad);

    const actitud = `${resumen?.ultima_actitud || ''}`.trim();
    if (actitud) partes.push(actitud);

    const tecnica = `${resumen?.ultima_tecnica || ''}`.trim();
    const recomendacion = `${resumen?.ultima_recomendacion || ''}`.trim();
    const tecnico = [tecnica, recomendacion].filter(Boolean).join(' · ');
    if (tecnico) partes.push(tecnico);

    const detalle = limpiarObservacionCortaGrupoApp(
      partes.filter(Boolean).slice(0, 3).join(' · '),
      220
    );

    if (detalle) {
      return `${nombre}: ${detalle}`;
    }

    if (/COMPLETA|VALIDAD/.test(estadoFicha) || resumen) {
      return `${nombre}: Nada relevante`;
    }

    return `${nombre}: NUEVO · Sin historial. Revisar nivel y adaptación en primera bajada.`;
  }

  function observacionesAutomaticasGrupoIntensivo(
    alumnosGrupo: RecomendacionGrupoIntensivoDiaApp[]
  ) {
    const lineas = alumnosGrupo.map(observacionEstandarAlumnoIntensivoApp);
    return normalizarLineasObservacionesGrupoApp(lineas.join('\n'));
  }

  function observacionesAutomaticasGrupoIntensivoManual(alumnosIds: string[]) {
    const lineas = alumnosIds
      .map((alumnoId) => {
        const resumenIntensivo = resumenAlumnoIntensivo(alumnoId);
        const ficha = intensivoAlumnos.find(
          (registro) => registro.alumno_id === alumnoId
        );

        return observacionEstandarAlumnoIntensivoApp({
          alumno_id: alumnoId,
          alumno: resumenIntensivo?.alumno || ficha?.alumno || 'Alumno',
          nivel_resumen:
            resumenIntensivo?.nivel_resumen ||
            resumenIntensivo?.nivel_actual ||
            resumenIntensivo?.nivel_estimado ||
            '',
          fuente_nivel:
            resumenIntensivo?.origen_nivel_estimado || 'Jose / Coordinador',
          estado_ficha:
            resumenIntensivo?.estado_ficha || 'completa',
        } as RecomendacionGrupoIntensivoDiaApp);
      })
      .filter(Boolean);

    return normalizarLineasObservacionesGrupoApp(lineas.join('\n'));
  }

  function observacionEstandarAlumnoOcioApp(alumno: OcioAlumnoApp) {
    const resumen = alumnos.find(
      (registro) => registro.alumno_id === alumno.alumno_id
    );

    const nombre = nombreLimpioObservacionesGrupoApp(alumno.alumno);
    const nivel = (
      resumen?.nivel_actual ||
      resumen?.ultimo_nivel_reportado ||
      alumno.nivel_usado ||
      alumno.nivel ||
      resumen?.nivel_estimado ||
      ''
    )
      .trim()
      .toUpperCase();

    const origen = `${
      alumno.fuente_nivel ||
      alumno.origen_nivel_estimado ||
      resumen?.origen_nivel_estimado ||
      ''
    }`
      .trim()
      .toUpperCase();

    const totalReportes = Number(
      alumno.total_reportes ?? resumen?.total_reportes ?? 0
    );

    const revisarNivel =
      /PENDIENTE|REVISAR|DUD|DESCONOC/.test(origen) ||
      /REVISAR|PENDIENTE/.test(
        `${resumen?.estado_ficha || alumno.estado_ficha || ''}`.toUpperCase()
      );

    if (totalReportes === 0) {
      if (/FAMILIA|DECLARAD/.test(origen) && nivel) {
        return `${nombre}: Nivel ${nivel} declarado por familia · validar en pista`;
      }

      if (revisarNivel && nivel) {
        return `${nombre}: REVISAR NIVEL · validar en primera bajada`;
      }

      return `${nombre}: NUEVO · Sin historial. Revisar nivel y adaptación en primera bajada.`;
    }

    const partes: string[] = [];

    const incidencia = `${resumen?.ultima_incidencia || ''}`.trim();
    if (
      incidencia &&
      !/^(NO|NINGUNA|SIN INCIDENCIA|NADA)$/i.test(incidencia)
    ) {
      partes.push(incidencia);
    }

    const remontes = Array.isArray(resumen?.ultimos_remontes)
      ? resumen.ultimos_remontes.filter(Boolean).join(', ')
      : '';
    const autonomia = `${resumen?.ultima_autonomia || ''}`.trim();
    const seguridad = [remontes, autonomia].filter(Boolean).join(' · ');
    if (seguridad) partes.push(seguridad);

    const actitud = `${resumen?.ultima_actitud || ''}`.trim();
    if (actitud) partes.push(actitud);

    const tecnica = `${resumen?.ultima_tecnica || ''}`.trim();
    const recomendacion = `${resumen?.ultima_recomendacion || ''}`.trim();
    const tecnico = [tecnica, recomendacion].filter(Boolean).join(' · ');
    if (tecnico) partes.push(tecnico);

    const detalle = limpiarObservacionCortaGrupoApp(
      partes.filter(Boolean).slice(0, 3).join(' · '),
      220
    );

    return studentObservationWithLevelReview(nombre, detalle, revisarNivel);
  }

  function observacionesAutomaticasGrupoOcio(alumnosGrupo: OcioAlumnoApp[]) {
    const lineas = alumnosGrupo
      .map((alumno) => observacionEstandarAlumnoOcioApp(alumno))
      .filter(Boolean);

    if (lineas.length === 0) return '';
    return normalizarLineasObservacionesGrupoApp(lineas.join('\n'));
  }


  function limpiarPropuestaAgendaTrasCrear(
    gruposCreados: Array<{
      nombreGrupo: string;
      alumnosGrupo: AgendaRecomendacionSesionApp[];
    }>
  ) {
    if (gruposCreados.length === 0) return;

    const alumnosCreados = new Set(
      gruposCreados.flatMap((grupo) =>
        grupo.alumnosGrupo.map((alumno) => alumno.alumno_id)
      )
    );
    const nombresCreados = new Set(
      gruposCreados.map((grupo) => grupo.nombreGrupo)
    );

    setAgendaRecomendaciones((anteriores) =>
      anteriores.filter((alumno) => !alumnosCreados.has(alumno.alumno_id))
    );

    setDestinoAlumnoAgendaGrupo((anterior) => {
      const copia = { ...anterior };
      alumnosCreados.forEach((alumnoId) => {
        delete copia[claveAlumnoAgendaRecomendado(alumnoId)];
      });
      return copia;
    });

    setEntrenadoresAgendaGrupo((anterior) => {
      const copia = { ...anterior };
      nombresCreados.forEach((nombre) => delete copia[nombre]);
      return copia;
    });
    setEntrenadoresApoyoAgendaGrupo((anterior) => {
      const copia = { ...anterior };
      nombresCreados.forEach((nombre) => delete copia[nombre]);
      return copia;
    });
    setTrabajoAgendaGrupo((anterior) => {
      const copia = { ...anterior };
      nombresCreados.forEach((nombre) => delete copia[nombre]);
      return copia;
    });
    setObservacionesAgendaGrupo((anterior) => {
      const copia = { ...anterior };
      nombresCreados.forEach((nombre) => delete copia[nombre]);
      return copia;
    });
    setResponsablesReporteAgendaGrupo((anterior) => {
      const copia = { ...anterior };
      gruposCreados.forEach((grupo) => {
        grupo.alumnosGrupo.forEach((alumno) => {
          delete copia[`${grupo.nombreGrupo}__${alumno.alumno_id}`];
        });
      });
      return copia;
    });
  }

  async function crearGrupoAgendaDesdeRecomendacion(
    nombreGrupo: string,
    alumnosGrupo: AgendaRecomendacionSesionApp[],
    nombreGrupoFinal?: string
  ) {
    if (!agendaSesionActivaId) {
      setError('Primero selecciona una sesión.');
      return;
    }

    const esParticular = esGrupoParticularAgenda(nombreGrupo);
    const entrenadorId = entrenadoresAgendaGrupo[nombreGrupo] || '';
    const entrenadorApoyoId =
      entrenadoresApoyoAgendaGrupo[nombreGrupo] || '';

    if (
      esParticular &&
      entrenadorApoyoId &&
      entrenadorApoyoId === entrenadorId
    ) {
      setError(
        `El segundo entrenador de ${nombreGrupo} no puede ser el mismo que el principal.`
      );
      return;
    }

    if (alumnosGrupo.length === 0) {
      setError('Este grupo no tiene alumnos.');
      return;
    }

    const nivelesGrupo = Array.from(
      new Set(alumnosGrupo.map((alumno) => alumno.nivel_resumen))
    ).join(' / ');
    const trabajo =
      trabajoAgendaGrupo[nombreGrupo] ||
      trabajoDiarioAutomaticoAgenda(nombreGrupo, alumnosGrupo);
    const primero = alumnosGrupo[0];

    if (
      !esParticular &&
      !confirmarCrearGrupoConValidacionPedagogicaApp(alumnosGrupo, nombreGrupo)
    ) return;

    setCargando(true);
    setError('');

    try {
      const grupoId = esParticular
        ? await ejecutarFuncionAuthJson<string>(
            'crear_grupo_particular_sesion_operativa_app',
            {
              p_sesion_id: agendaSesionActivaId,
              p_nombre_grupo: nombreGrupo,
              p_nivel_grupo: nivelesGrupo || primero.bloque_tecnico,
              p_pista: primero.pista_recomendada,
              p_trabajo_diario: trabajo,
              p_observaciones_importantes: combinarObservacionesGrupoApp(
                observacionesAutomaticasGrupoAgenda(alumnosGrupo),
                observacionesAgendaGrupo[nombreGrupo] || ''
              ),
              p_entrenador_id: entrenadorId || null,
              p_alumno_id: alumnosGrupo[0].alumno_id,
            }
          )
        : await ejecutarFuncionAuthJson<string>(
            GROUP_OPERATION_RPC.create,
            {
              p_sesion_id: agendaSesionActivaId,
              p_nombre_grupo: nombreGrupo,
              p_nivel_grupo: nivelesGrupo || primero.bloque_tecnico,
              p_pista: primero.pista_recomendada,
              p_punto_encuentro: null,
              p_trabajo_diario: trabajo,
              p_observaciones_importantes: combinarObservacionesGrupoApp(
                observacionesAutomaticasGrupoAgenda(alumnosGrupo),
                observacionesAgendaGrupo[nombreGrupo] || ''
              ),
              p_entrenador_id: null,
              p_alumnos_ids: alumnosGrupo.map((alumno) => alumno.alumno_id),
              p_publicado: false,
            }
          );

      if (!grupoId) {
        throw new Error(`No se pudo crear el borrador de ${nombreGrupo}.`);
      }

      if (esParticular && entrenadorId) {
        await ejecutarFuncion('guardar_apoyo_reportes_grupo_app', {
          p_grupo_id: grupoId,
          p_entrenador_apoyo_id: entrenadorApoyoId || null,
          p_responsables: responsablesJsonAgendaApp(
            nombreGrupo,
            alumnosGrupo,
            entrenadorId,
            entrenadorApoyoId
          ),
        });
      }

      limpiarPropuestaAgendaTrasCrear([
        { nombreGrupo, alumnosGrupo },
      ]);

      await cargarAgendaOperativaDirecta();
      await cargarPlanning();
      await cargarGruposEntrenador();
      await cargarDetalleSesionAgenda(agendaSesionActivaId, {
        preservarPropuesta: true,
        preservarScroll: true,
      });

      window.requestAnimationFrame(() => {
        document
          .getElementById('agenda-grupos-creados')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function crearTodosGruposAgendaDesdeRecomendacion() {
    if (!agendaSesionActivaId) {
      setError('Primero selecciona una sesión.');
      return;
    }

    const grupos = gruposRecomendadosAgenda();
    if (grupos.length === 0) {
      setError('No hay grupos pendientes en la propuesta.');
      return;
    }

    for (const [nombreGrupo, alumnosGrupo] of grupos) {
      if (
        !esGrupoParticularAgenda(nombreGrupo) &&
        !confirmarCrearGrupoConValidacionPedagogicaApp(alumnosGrupo, nombreGrupo)
      ) return;
    }

    const confirmar = window.confirm(
      `¿Crear los ${grupos.length} grupos propuestos?\n\nSe guardarán como pendientes de publicar. Después podrás asignar entrenador, segundo entrenador y punto de encuentro desde cada grupo.`
    );
    if (!confirmar) return;

    setCargando(true);
    setError('');

    const creados: Array<{
      nombreGrupo: string;
      alumnosGrupo: AgendaRecomendacionSesionApp[];
    }> = [];

    try {
      for (const [nombreGrupo, alumnosGrupo] of grupos) {
        const entrenadorId = entrenadoresAgendaGrupo[nombreGrupo] || '';
        const entrenadorApoyoId =
          entrenadoresApoyoAgendaGrupo[nombreGrupo] || '';
        const primero = alumnosGrupo[0];
        const nivelesGrupo = Array.from(
          new Set(alumnosGrupo.map((alumno) => alumno.nivel_resumen))
        ).join(' / ');
        const trabajo =
          trabajoAgendaGrupo[nombreGrupo] ||
          trabajoDiarioAutomaticoAgenda(nombreGrupo, alumnosGrupo);

        const esParticular = esGrupoParticularAgenda(nombreGrupo);
        const grupoId = esParticular
          ? await ejecutarFuncionAuthJson<string>(
              'crear_grupo_particular_sesion_operativa_app',
              {
                p_sesion_id: agendaSesionActivaId,
                p_nombre_grupo: nombreGrupo,
                p_nivel_grupo: nivelesGrupo || primero.bloque_tecnico,
                p_pista: primero.pista_recomendada,
                p_trabajo_diario: trabajo,
                p_observaciones_importantes: combinarObservacionesGrupoApp(
                  observacionesAutomaticasGrupoAgenda(alumnosGrupo),
                  observacionesAgendaGrupo[nombreGrupo] || ''
                ),
                p_entrenador_id: entrenadorId || null,
                p_alumno_id: alumnosGrupo[0].alumno_id,
              }
            )
          : await ejecutarFuncionAuthJson<string>(
              GROUP_OPERATION_RPC.create,
              {
                p_sesion_id: agendaSesionActivaId,
                p_nombre_grupo: nombreGrupo,
                p_nivel_grupo: nivelesGrupo || primero.bloque_tecnico,
                p_pista: primero.pista_recomendada,
                p_punto_encuentro: null,
                p_trabajo_diario: trabajo,
                p_observaciones_importantes: combinarObservacionesGrupoApp(
                  observacionesAutomaticasGrupoAgenda(alumnosGrupo),
                  observacionesAgendaGrupo[nombreGrupo] || ''
                ),
                p_entrenador_id: null,
                p_alumnos_ids: alumnosGrupo.map((alumno) => alumno.alumno_id),
                p_publicado: false,
              }
            );

        if (!grupoId) {
          throw new Error(`No se pudo crear el borrador de ${nombreGrupo}.`);
        }

        if (esParticular && entrenadorId) {
          await ejecutarFuncion('guardar_apoyo_reportes_grupo_app', {
            p_grupo_id: grupoId,
            p_entrenador_apoyo_id: entrenadorApoyoId || null,
            p_responsables: responsablesJsonAgendaApp(
              nombreGrupo,
              alumnosGrupo,
              entrenadorId,
              entrenadorApoyoId
            ),
          });
        }

        creados.push({ nombreGrupo, alumnosGrupo });
      }

      limpiarPropuestaAgendaTrasCrear(creados);
      await cargarAgendaOperativaDirecta();
      await cargarPlanning();
      await cargarGruposEntrenador();
      await cargarDetalleSesionAgenda(agendaSesionActivaId);

      window.requestAnimationFrame(() => {
        document
          .getElementById('agenda-grupos-creados')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    } catch (err) {
      limpiarPropuestaAgendaTrasCrear(creados);
      await cargarAgendaOperativaDirecta();
      await cargarPlanning();
      await cargarGruposEntrenador();
      await cargarDetalleSesionAgenda(agendaSesionActivaId, {
        preservarPropuesta: true,
        preservarScroll: true,
      });

      window.requestAnimationFrame(() => {
        document
          .getElementById('agenda-propuesta-grupos')
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });

      setError(
        err instanceof Error
          ? `Se crearon ${creados.length} grupos antes del error. Los pendientes conservan tus cambios. ${err.message}`
          : `Se crearon ${creados.length} grupos antes del error. Los pendientes conservan tus cambios.`
      );
    }

    setCargando(false);
  }

  function normalizarNombreAlumnoAgendaApp(valor: string | null | undefined) {
    return nombreRealAlumnoListadoOperativo(valor)
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, ' ')
      .trim();
  }

  function alumnosDelGrupoCreadoAgenda(
    grupo: AgendaGrupoSesionApp,
    fuente: AgendaAlumnoSesionApp[] = agendaAlumnosSesion
  ) {
    const nombresGrupo = (grupo.alumnos_lista || '')
      .split(' || ')
      .map((valor) => normalizarNombreAlumnoAgendaApp(valor))
      .filter(Boolean);

    return fuente.filter((alumno) => {
      const nombreAlumno = normalizarNombreAlumnoAgendaApp(alumno.alumno);
      return nombresGrupo.includes(nombreAlumno);
    });
  }

  function alumnoAgendaComoRecomendacionGrupoCreadoApp(
    alumno: AgendaAlumnoSesionApp,
    grupo: AgendaGrupoSesionApp
  ): AgendaRecomendacionSesionApp {
    return {
      sesion_id: alumno.sesion_id,
      grupo_recomendado: grupo.nombre_grupo,
      bloque_tecnico: grupo.nivel_grupo || alumno.nivel_usado || '',
      pista_recomendada:
        grupo.pista || alumno.pista_recomendada || 'Pequeña/Grande',
      alumno_id: alumno.alumno_id,
      alumno: alumno.alumno,
      nivel_resumen: alumno.nivel_usado || '',
      pista_alumno:
        alumno.pista_recomendada || grupo.pista || 'Pequeña/Grande',
      orden_en_grupo: alumno.orden || 0,
      alertas: alumno.observacion || null,
      fuente_nivel: alumno.origen_nivel || null,
      estado_ficha: alumno.estado_ficha || null,
    };
  }

  function observacionesManualesGrupoAgendaPersistentesApp(
    textoActual: string | null | undefined,
    alumnosAntes: AgendaAlumnoSesionApp[]
  ) {
    const lineas = String(textoActual || '')
      .split(/\r?\n/)
      .map((linea) => linea.trim())
      .filter(Boolean);

    if (lineas.length === 0) return '';

    const nombres = alumnosAntes
      .map((alumno) => nombreLimpioObservacionesGrupoApp(alumno.alumno))
      .map((nombre) => textoSinAcentosGrupoApp(nombre))
      .filter(Boolean);

    const manuales = lineas.filter((linea) => {
      const normalizada = textoSinAcentosGrupoApp(linea);
      return !nombres.some(
        (nombre) =>
          normalizada === nombre ||
          normalizada.startsWith(`${nombre}:`) ||
          normalizada.startsWith(`${nombre} ·`)
      );
    });

    return normalizarLineasObservacionesGrupoApp(manuales.join('\n'), 6);
  }

  function contenidoTrabajoGrupoCreadoAgendaApp(
    grupo: AgendaGrupoSesionApp,
    alumnosGrupoSesion: AgendaAlumnoSesionApp[],
    observacionesManuales = ''
  ) {
    if (alumnosGrupoSesion.length === 0) {
      return {
        trabajo: '',
        observaciones: observacionesManuales,
      };
    }

    const alumnosGrupo = alumnosGrupoSesion.map((alumno) =>
      alumnoAgendaComoRecomendacionGrupoCreadoApp(alumno, grupo)
    );

    const niveles = alumnosGrupo
      .map((alumno) => alumno.nivel_resumen || '')
      .filter(Boolean);

    const observacionesAutomaticas =
      observacionesAutomaticasGrupoAgenda(alumnosGrupo);

    const alumnosContexto = alumnosGrupo.map((alumno) =>
      contextoAlumnoTrabajoDiarioApp(
        alumno.alumno_id,
        alumno.alumno,
        alumno.nivel_resumen || ''
      )
    );

    const sesion = agendaSesionesDirectas.find(
      (item) => item.sesion_id === grupo.sesion_id
    );

    const trabajosRecientes = trabajosRecientesParaGrupoApp(
      alumnosGrupo.map((alumno) => alumno.alumno),
      sesion?.fecha
    );

    const trabajo = trabajoDiarioMSZApp(
      grupo.nombre_grupo,
      niveles,
      grupo.pista || alumnosGrupo[0]?.pista_recomendada || 'Pequeña/Grande',
      observacionesAutomaticas,
      alumnosContexto,
      sesion?.modalidad || 'INTENSIVOS',
      trabajosRecientes
    );

    return {
      trabajo,
      observaciones: combinarObservacionesGrupoApp(
        observacionesAutomaticas,
        observacionesManuales
      ),
    };
  }

  function contextoIntensivoSesionAgenda(
    sesionId: string | null | undefined
  ) {
    if (!sesionId) return null;

    const dia = intensivoDias.find((item) => item.sesion_id === sesionId);
    if (!dia) return null;

    const intensivo = intensivos.find(
      (item) => item.intensivo_id === dia.intensivo_id
    );

    return {
      dia,
      intensivo,
    };
  }

  function asistenciaAlumnoIntensivoAgenda(
    grupo: AgendaGrupoSesionApp,
    alumnoId: string
  ) {
    const contexto = contextoIntensivoSesionAgenda(grupo.sesion_id);
    if (!contexto) return null;

    return (
      intensivoAsistencias.find(
        (item) =>
          item.intensivo_id === contexto.dia.intensivo_id &&
          item.intensivo_dia_id === contexto.dia.intensivo_dia_id &&
          item.alumno_id === alumnoId
      ) || null
    );
  }

  function alumnoCuentaParaTrabajoIntensivoAgenda(
    grupo: AgendaGrupoSesionApp,
    alumnoId: string
  ) {
    const asistencia = asistenciaAlumnoIntensivoAgenda(grupo, alumnoId);
    return !['NO_PRESENTADO', 'BAJA_AVISADA'].includes(
      asistencia?.estado || ''
    );
  }

  function alumnosEfectivosDelGrupoIntensivoAgenda(
    grupo: AgendaGrupoSesionApp,
    base?: AgendaAlumnoSesionApp[]
  ) {
    return (base || alumnosDelGrupoCreadoAgenda(grupo)).filter((alumno) =>
      alumnoCuentaParaTrabajoIntensivoAgenda(grupo, alumno.alumno_id)
    );
  }

  async function guardarTrabajoRegeneradoGrupoIntensivoAgenda(
    grupo: AgendaGrupoSesionApp,
    alumnosBase?: AgendaAlumnoSesionApp[]
  ) {
    const alumnosAntes = alumnosDelGrupoCreadoAgenda(grupo);
    const alumnosEfectivos = alumnosEfectivosDelGrupoIntensivoAgenda(
      grupo,
      alumnosBase
    );
    const manuales = observacionesManualesGrupoAgendaPersistentesApp(
      observacionesGrupoCreadoEditando[grupo.grupo_id] ??
        grupo.observaciones_importantes,
      alumnosAntes
    );

    const contenido = contenidoTrabajoGrupoCreadoAgendaApp(
      grupo,
      alumnosEfectivos,
      manuales
    );

    await ejecutarFuncion(GROUP_OPERATION_RPC.updateDailyWork, {
      p_grupo_id: grupo.grupo_id,
      p_trabajo_diario: contenido.trabajo,
      p_observaciones_importantes: contenido.observaciones,
    });
  }

  async function regenerarTrabajoGrupoIntensivoAgenda(
    grupo: AgendaGrupoSesionApp
  ) {
    if (!contextoIntensivoSesionAgenda(grupo.sesion_id)) return;

    const alumnosGrupo = alumnosDelGrupoCreadoAgenda(grupo);
    if (alumnosGrupo.length === 0) {
      setError(
        'No se han podido resolver los alumnos reales de este grupo. La sesión de Intensivos no está sincronizada con Días de entrenamiento.'
      );
      return;
    }

    setCargando(true);
    setError('');

    try {
      await guardarTrabajoRegeneradoGrupoIntensivoAgenda(grupo);
      if (agendaSesionActivaId) {
        await cargarDetalleSesionAgenda(agendaSesionActivaId, {
          preservarScroll: true,
        });
      }
      await cargarIntensivos();
      await cargarPlanning();
      await cargarGruposEntrenador();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo regenerar el trabajo del grupo.'
      );
    } finally {
      setCargando(false);
    }
  }

  async function marcarNoVieneIntensivoDesdeAgenda(
    alumno: AgendaAlumnoSesionApp,
    grupo: AgendaGrupoSesionApp
  ) {
    const contexto = contextoIntensivoSesionAgenda(grupo.sesion_id);
    if (!contexto) return;

    const confirmar = window.confirm(
      `¿Marcar que ${alumno.alumno} NO VIENE el Día ${contexto.dia.numero_dia}?\n\nSe mantendrá en el intensivo y en su histórico, se marcará la falta para recuperación y el Trabajo diario del grupo se recalculará sin contar con este niño.`
    );
    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('marcar_asistencia_intensivo_app', {
        p_intensivo_id: contexto.dia.intensivo_id,
        p_intensivo_dia_id: contexto.dia.intensivo_dia_id,
        p_alumno_id: alumno.alumno_id,
        p_estado: 'BAJA_AVISADA',
        p_falta_genera_recuperacion: true,
      });

      await guardarTrabajoRegeneradoGrupoIntensivoAgenda(
        grupo,
        alumnosDelGrupoCreadoAgenda(grupo).filter(
          (item) => item.alumno_id !== alumno.alumno_id
        )
      );

      await cargarIntensivos();
      if (agendaSesionActivaId) {
        await cargarDetalleSesionAgenda(agendaSesionActivaId, {
          preservarScroll: true,
        });
      }
      await cargarPlanning();
      await cargarGruposEntrenador();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo marcar la falta del intensivo.'
      );
    } finally {
      setCargando(false);
    }
  }

  async function restaurarVieneIntensivoDesdeAgenda(
    alumno: AgendaAlumnoSesionApp,
    grupo: AgendaGrupoSesionApp
  ) {
    const contexto = contextoIntensivoSesionAgenda(grupo.sesion_id);
    if (!contexto) return;

    const confirmar = window.confirm(
      `¿Volver a dejar a ${alumno.alumno} como previsto para este día?\n\nLa asistencia volverá a pendiente. Si la recuperación aún no estaba gestionada, se retirará automáticamente.`
    );
    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('reset_asistencia_intensivo_app', {
        p_intensivo_id: contexto.dia.intensivo_id,
        p_intensivo_dia_id: contexto.dia.intensivo_dia_id,
        p_alumno_id: alumno.alumno_id,
      });

      // reset_asistencia_intensivo_app devuelve la asistencia a pendiente.
      // La función de asistencia del backend conserva/elimina recuperaciones
      // según su estado; regeneramos con el alumno otra vez dentro del grupo.
      await ejecutarFuncion('marcar_asistencia_intensivo_app', {
        p_intensivo_id: contexto.dia.intensivo_id,
        p_intensivo_dia_id: contexto.dia.intensivo_dia_id,
        p_alumno_id: alumno.alumno_id,
        p_estado: 'SIN_CONFIRMAR',
        p_falta_genera_recuperacion: false,
      });

      await guardarTrabajoRegeneradoGrupoIntensivoAgenda(grupo);

      await cargarIntensivos();
      if (agendaSesionActivaId) {
        await cargarDetalleSesionAgenda(agendaSesionActivaId, {
          preservarScroll: true,
        });
      }
      await cargarPlanning();
      await cargarGruposEntrenador();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo restaurar la asistencia del alumno.'
      );
    } finally {
      setCargando(false);
    }
  }

  async function moverAlumnoEntreGruposAgenda(
    alumno: AgendaAlumnoSesionApp,
    grupoOrigen: AgendaGrupoSesionApp,
    grupoDestinoId: string
  ) {
    if (!alumno?.alumno_id || !grupoOrigen?.grupo_id || !grupoDestinoId) return;
    if (grupoOrigen.grupo_id === grupoDestinoId) return;

    const grupoDestino = agendaGruposSesion.find(
      (grupo) => grupo.grupo_id === grupoDestinoId
    );
    if (!grupoDestino) {
      setError('No encuentro el grupo de destino. Actualiza la sesión y vuelve a intentarlo.');
      return;
    }

    const confirmar = window.confirm(
      `¿Mover a ${alumno.alumno} de ${nombreGrupoVisualApp(grupoOrigen)} a ${nombreGrupoVisualApp(grupoDestino)}?\n\nEl cambio es solo de composición: no cambia el entrenador ni su confirmación.`
    );
    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      const sesionActiva = agendaSesionesDirectas.find(
        (item) => item.sesion_id === grupoOrigen.sesion_id
      );
      const modalidadActiva = normalizarModalidadAgenda(
        sesionActiva?.modalidad || sesionActiva?.modalidad_codigo || ''
      );
      const esIntensivo = modalidadActiva === 'INTENSIVOS';
      const esOcio = modalidadActiva === 'OCIO';
      const esBaby = modalidadActiva === 'BABY';

      const alumnosOrigenAntes = alumnosDelGrupoCreadoAgenda(grupoOrigen);
      const alumnosDestinoAntes = alumnosDelGrupoCreadoAgenda(grupoDestino);

      const alumnosOrigenDespues = alumnosOrigenAntes.filter(
        (item) => item.alumno_id !== alumno.alumno_id
      );
      const alumnosDestinoDespues = [
        ...alumnosDestinoAntes.filter(
          (item) => item.alumno_id !== alumno.alumno_id
        ),
        alumno,
      ];

      const debeRegenerarTrabajo = esIntensivo || esOcio || esBaby;
      const manualesOrigen = debeRegenerarTrabajo
        ? observacionesManualesGrupoAgendaPersistentesApp(
            grupoOrigen.observaciones_importantes,
            alumnosOrigenAntes
          )
        : '';
      const manualesDestino = debeRegenerarTrabajo
        ? observacionesManualesGrupoAgendaPersistentesApp(
            grupoDestino.observaciones_importantes,
            alumnosDestinoAntes
          )
        : '';

      // La RPC mueve únicamente la composición y conserva entrenador,
      // segundo entrenador, punto y confirmación.
      const movimiento = requireValidGroupMove({
        studentId: alumno.alumno_id,
        sourceGroupId: grupoOrigen.grupo_id,
        targetGroupId: grupoDestinoId,
      });
      await ejecutarFuncion(GROUP_OPERATION_RPC.moveStudent, {
        p_alumno_id: movimiento.studentId,
        p_grupo_origen_id: movimiento.sourceGroupId,
        p_grupo_destino_id: movimiento.targetGroupId,
      });

      // INTENSIVOS, OCIO y BABY: un cambio de composición invalida el trabajo
      // calculado para origen y destino. Regeneramos con el motor común nuevo.
      if (debeRegenerarTrabajo) {
        const baseOrigen = esIntensivo
          ? alumnosEfectivosDelGrupoIntensivoAgenda(
              grupoOrigen,
              alumnosOrigenDespues
            )
          : alumnosOrigenDespues;
        const baseDestino = esIntensivo
          ? alumnosEfectivosDelGrupoIntensivoAgenda(
              grupoDestino,
              alumnosDestinoDespues
            )
          : alumnosDestinoDespues;

        const contenidoOrigen = contenidoTrabajoGrupoCreadoAgendaApp(
          grupoOrigen,
          baseOrigen,
          manualesOrigen
        );
        const contenidoDestino = contenidoTrabajoGrupoCreadoAgendaApp(
          grupoDestino,
          baseDestino,
          manualesDestino
        );

        await ejecutarFuncion(GROUP_OPERATION_RPC.updateDailyWork, {
          p_grupo_id: grupoOrigen.grupo_id,
          p_trabajo_diario: contenidoOrigen.trabajo,
          p_observaciones_importantes: contenidoOrigen.observaciones,
        });

        await ejecutarFuncion(GROUP_OPERATION_RPC.updateDailyWork, {
          p_grupo_id: grupoDestino.grupo_id,
          p_trabajo_diario: contenidoDestino.trabajo,
          p_observaciones_importantes: contenidoDestino.observaciones,
        });
      }

      if (agendaSesionActivaId) {
        await cargarDetalleSesionAgenda(agendaSesionActivaId, {
          preservarScroll: true,
        });
      }
      await cargarAgendaOperativaDirecta();
      await cargarPlanning();
      await cargarGruposEntrenador();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo mover el alumno entre grupos.'
      );
    }

    setCargando(false);
  }

  async function cambiarEntrenadorGrupoAgenda(
    grupo: AgendaGrupoSesionApp,
    nuevoEntrenadorId: string,
    esAsignacionExcepcional = false
  ) {
    if (!grupo.grupo_id) return;

    if (!nuevoEntrenadorId) {
      if (!grupo.entrenador_id) return;

      if (grupo.publicado) {
        setError(
          `${grupo.nombre_grupo}: despublica primero el grupo antes de dejarlo sin entrenador.`
        );
        return;
      }

      const confirmarQuitar = window.confirm(
        `¿Dejar ${grupo.nombre_grupo} sin entrenador asignado?

` +
          `El grupo seguirá en preparación y no será visible para ningún entrenador. ` +
          `Si tiene segundo entrenador, tendrás que quitarlo antes.`
      );
      if (!confirmarQuitar) return;

      setCargando(true);
      setError('');

      try {
        await ejecutarFuncion('desasignar_entrenador_grupo_app', {
          p_grupo_id: grupo.grupo_id,
        });

        if (agendaSesionActivaId) {
          await cargarDetalleSesionAgenda(agendaSesionActivaId);
        }
        await cargarAgendaOperativaDirecta();
        await cargarGruposEntrenador();
        await cargarReportesPendientes();
        await cargarPlanning();
        await cargarCobros();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Error quitando el entrenador del grupo'
        );
      }

      setCargando(false);
      return;
    }

    if (nuevoEntrenadorId === grupo.entrenador_id) return;

    const nuevoEntrenador = entrenadores.find(
      (entrenador) => entrenador.entrenador_id === nuevoEntrenadorId
    );

    const textoExcepcional = esAsignacionExcepcional
      ? 'ASIGNACIÓN EXCEPCIONAL: no modifica ni republica la disponibilidad semanal.'
      : '';

    const confirmar = window.confirm(
      grupo.publicado
        ? `¿Cambiar el entrenador de ${grupo.nombre_grupo} a ${
            nuevoEntrenador?.nombre_completo || 'este entrenador'
          }?

El grupo YA está publicado. El entrenador anterior dejará de verlo, el nuevo lo verá como pendiente de confirmar y se intentará avisar a ambos por Push.${textoExcepcional}`
        : `¿Cambiar el entrenador de ${grupo.nombre_grupo} a ${
            nuevoEntrenador?.nombre_completo || 'este entrenador'
          }?

El grupo sigue en preparación: este cambio todavía no enviará ningún Push.${textoExcepcional}`
    );

    if (!confirmar) return;

    const planCambio = primaryTrainerChangePlan({
      groupId: grupo.grupo_id,
      published: Boolean(grupo.publicado),
      previousTrainerId: grupo.entrenador_id,
      newTrainerId: nuevoEntrenadorId,
      exceptional: esAsignacionExcepcional,
    });

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion(planCambio.rpc, planCambio.params);

      if (planCambio.notifyPublishedChange) {
        await notificarCambioEntrenadorGrupoPublicadoPushApp(
          grupo.grupo_id,
          planCambio.previousTrainerId
        );
      }

      if (agendaSesionActivaId) {
        await cargarDetalleSesionAgenda(agendaSesionActivaId);
      }
      await cargarAgendaOperativaDirecta();
      await cargarGruposEntrenador();
      await cargarReportesPendientes();
      await cargarPlanning();
      await cargarCobros();
      if (esAsignacionExcepcional) {
        setAsignacionExcepcionalGrupoAgenda((actual) => ({
          ...actual,
          [grupo.grupo_id]: false,
        }));
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error cambiando entrenador del grupo'
      );
    }

    setCargando(false);
  }

  async function cambiarPuntoGrupoAgenda(
    grupo: AgendaGrupoSesionApp,
    nuevoPunto: string
  ) {
    if (!grupo.grupo_id || !nuevoPunto) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('cambiar_punto_encuentro_grupo_app', {
        p_grupo_id: grupo.grupo_id,
        p_punto_encuentro: nuevoPunto,
      });

      if (agendaSesionActivaId) {
        await cargarDetalleSesionAgenda(agendaSesionActivaId);
      }
      await cargarAgendaOperativaDirecta();
      await cargarPlanning();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error cambiando el punto de encuentro'
      );
    }

    setCargando(false);
  }

  async function cambiarSegundoEntrenadorGrupoAgenda(
    grupo: AgendaGrupoSesionApp,
    nuevoEntrenadorApoyoId: string
  ) {
    if (!grupo.grupo_id) return;

    const alumnosRatioGrupo = Array.from(
      { length: Math.max(0, Number(grupo.total_alumnos || 0)) },
      () => ({
        nivel_resumen: grupo.nivel_grupo,
        pista_recomendada: grupo.pista,
      })
    );

    const incidenciaApoyo = supportTrainerChangeIssue({
      groupName: grupo.nombre_grupo,
      published: Boolean(grupo.publicado),
      supportRequired: necesitaDosEntrenadoresGrupoApp(alumnosRatioGrupo),
      totalStudents: Number(grupo.total_alumnos || 0),
      primaryTrainerId: grupo.entrenador_id,
      newSupportTrainerId: nuevoEntrenadorApoyoId,
    });
    if (incidenciaApoyo) {
      setError(incidenciaApoyo);
      return;
    }

    const nombreNuevo = nuevoEntrenadorApoyoId
      ? entrenadores.find(
          (entrenador) =>
            entrenador.entrenador_id === nuevoEntrenadorApoyoId
        )?.nombre_completo || 'este entrenador'
      : 'ninguno';

    const confirmar = window.confirm(
      nuevoEntrenadorApoyoId
        ? `¿Cambiar el segundo entrenador de ${grupo.nombre_grupo} a ${nombreNuevo}?\n\nSe conservará el reparto de reportes y se actualizarán Vista entrenador y Cobros.`
        : `¿Quitar el segundo entrenador de ${grupo.nombre_grupo}?\n\nLos reportes que tenía asignados volverán al entrenador principal y Cobros se recalculará.`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('guardar_apoyo_reportes_grupo_app', {
        p_grupo_id: grupo.grupo_id,
        p_entrenador_apoyo_id: nuevoEntrenadorApoyoId || null,
        p_responsables: null,
      });

      if (agendaSesionActivaId) {
        await cargarDetalleSesionAgenda(agendaSesionActivaId);
      }
      await cargarAgendaOperativaDirecta();
      await cargarGruposEntrenador();
      await cargarReportesPendientes();
      await cargarPlanning();
      await cargarCobros();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error cambiando el segundo entrenador del grupo'
      );
    }

    setCargando(false);
  }

  async function guardarTrabajoObservacionesGrupoAgenda(
    grupo: AgendaGrupoSesionApp
  ) {
    if (!grupo.grupo_id) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion(GROUP_OPERATION_RPC.updateDailyWork, {
        p_grupo_id: grupo.grupo_id,
        p_trabajo_diario:
          trabajoGrupoCreadoEditando[grupo.grupo_id] ??
          grupo.trabajo_diario ??
          '',
        p_observaciones_importantes: normalizarLineasObservacionesGrupoApp(
          observacionesGrupoCreadoEditando[grupo.grupo_id] ??
            grupo.observaciones_importantes ??
            '',
          12
        ),
      });

      if (agendaSesionActivaId)
        await cargarDetalleSesionAgenda(agendaSesionActivaId);
      await cargarAgendaOperativaDirecta();
      await cargarGruposEntrenador();
      await cargarPlanning();

      window.requestAnimationFrame(() => {
        const detalle = document.getElementById(
          `agenda-trabajo-grupo-${grupo.grupo_id}`
        ) as HTMLDetailsElement | null;
        if (detalle) detalle.open = false;
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error guardando trabajo diario y observaciones del grupo'
      );
    }

    setCargando(false);
  }

  async function editarNivelAlumnoAgenda(alumno: AgendaAlumnoSesionApp) {
    const nuevoNivel = window.prompt(
      `Nuevo nivel real de ficha para ${alumno.alumno} (INICIACION, A, A+, B, B+, C, C+, D, D+). Se aplicará en toda la app.`,
      alumno.nivel_usado || ''
    );

    if (!nuevoNivel) return;
    const nivelValidado = parseTechnicalLevel(nuevoNivel);
    if (nivelValidado.status !== 'VALID') {
      setError(
        'El nivel indicado no es válido. No se ha modificado la ficha ni la sesión.'
      );
      return;
    }
    const motivo = window.prompt(
      'Motivo de la corrección manual (obligatorio para dejar el origen trazable):',
      ''
    );
    if (!motivo?.trim()) {
      setError('La corrección manual se ha cancelado porque falta el motivo.');
      return;
    }

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('actualizar_nivel_alumno_sesion_operativa_app', {
        p_sesion_alumno_id: alumno.sesion_alumno_id,
        p_nivel_codigo: nivelValidado.level,
        p_origen: `Corrección manual coordinación · ${motivo.trim()}`,
      });

      await cargarDetalleSesionAgenda(alumno.sesion_id);
      await cargarAgendaOperativaDirecta();
      await cargarAlumnos();
      setAgendaRecomendaciones([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function editarNombreAlumnoAgenda(alumno: AgendaAlumnoSesionApp) {
    const nuevoNombre = window.prompt(
      'Corrige el nombre del alumno',
      alumno.alumno
    );

    if (!nuevoNombre || nuevoNombre.trim() === alumno.alumno) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('actualizar_nombre_alumno_sesion_operativa_app', {
        p_sesion_alumno_id: alumno.sesion_alumno_id,
        p_nombre: nuevoNombre.trim(),
      });

      await cargarDetalleSesionAgenda(alumno.sesion_id);
      await cargarAgendaOperativaDirecta();
      await cargarAlumnos();
      setAgendaRecomendaciones([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function quitarAlumnoAgenda(alumno: AgendaAlumnoSesionApp) {
    const confirmar = window.confirm(
      `¿Quitar a ${alumno.alumno} de esta sesión/listado?`
    );
    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('quitar_alumno_sesion_operativa_app', {
        p_sesion_alumno_id: alumno.sesion_alumno_id,
      });

      await cargarAgendaOperativaDirecta();
      await cargarDetalleSesionAgenda(alumno.sesion_id);
      setAgendaRecomendaciones([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function borrarAlumnoBaseAgenda(alumno: AgendaAlumnoSesionApp) {
    const confirmar = window.confirm(
      `¿BORRAR la ficha completa de ${alumno.alumno}? Esto elimina al alumno de la base y de las pruebas donde esté metido.`
    );
    if (!confirmar) return;

    const confirmarFinal = window.confirm(
      'Confirmación final: esta acción no es solo quitarlo del listado, borra la ficha del alumno.'
    );
    if (!confirmarFinal) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('borrar_alumno_base_operativa_app', {
        p_alumno_id: alumno.alumno_id,
      });

      await cargarAgendaOperativaDirecta();
      await cargarDetalleSesionAgenda(alumno.sesion_id);
      setAgendaRecomendaciones([]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    }

    setCargando(false);
  }

  async function comprobarGrupoAgendaSinHistoricoReal(
    grupoId: string
  ) {
    const reportesGrupo = await consultarSupabase<{ id: string }>(
      'reportes',
      `select=id&grupo_id=${encodeURIComponent(`eq.${grupoId}`)}&limit=1`
    );

    if (reportesGrupo.length > 0) {
      return {
        ok: false,
        motivo:
          'Este grupo ya tiene reportes. No se puede borrar desde Agenda para proteger el histórico.',
      };
    }

    const asistenciasGrupo = await consultarSupabase<{
      id: string;
      estado_asistencia: string | null;
    }>(
      'grupo_alumnos',
      `select=id,estado_asistencia&grupo_id=${encodeURIComponent(
        `eq.${grupoId}`
      )}`
    );

    const tieneAsistenciaReal = asistenciasGrupo.some((fila) =>
      ['presente', 'ausente'].includes(
        String(fila.estado_asistencia || '').trim().toLowerCase()
      )
    );

    if (tieneAsistenciaReal) {
      return {
        ok: false,
        motivo:
          'Este grupo ya tiene asistencia real registrada. No se puede borrar desde Agenda para proteger el histórico.',
      };
    }

    return { ok: true, motivo: '' };
  }

  async function borrarGrupoAgenda(grupo: AgendaGrupoSesionApp) {
    if (!grupo.grupo_id) return;

    const confirmar = window.confirm(
      `¿Borrar el grupo ${grupo.nombre_grupo}? Se quitarán sus alumnos del grupo, pero no se borran sus fichas.`
    );
    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion(GROUP_OPERATION_RPC.remove, {
        p_grupo_id: grupo.grupo_id,
      });

      setAgendaRecomendaciones([]);
      await cargarAgendaOperativaDirecta();
      await cargarDetalleSesionAgenda(grupo.sesion_id);
    } catch (err) {
      const mensaje =
        err instanceof Error
          ? err.message
          : 'No se pudo borrar el grupo.';
      setError(mensaje);
      window.alert(mensaje);
    } finally {
      setCargando(false);
    }
  }

  async function borrarSesionAgenda(sesionId: string) {
    if (!sesionId) return;

    setCargando(true);
    setError('');

    try {
      const filtroSesion = encodeURIComponent(`eq.${sesionId}`);
      const gruposSesion = await consultarSupabase<AgendaGrupoSesionApp>(
        'v_grupos_sesion_operativa_app',
        `select=*&sesion_id=${filtroSesion}&order=nombre_grupo.asc`
      );

      for (const grupo of gruposSesion) {
        const proteccion = await comprobarGrupoAgendaSinHistoricoReal(
          grupo.grupo_id
        );
        if (!proteccion.ok) {
          setError(`${grupo.nombre_grupo}: ${proteccion.motivo}`);
          return;
        }
      }

      const confirmar = window.confirm(
        '¿Borrar esta sesión? Se borran sus grupos y asignaciones. Las fichas de alumnos no se borran.'
      );
      if (!confirmar) return;

      await ejecutarFuncion('borrar_sesion_operativa_app', {
        p_sesion_id: sesionId,
      });

      if (agendaSesionActivaId === sesionId) {
        setAgendaSesionActivaId('');
        setAgendaAlumnosSesion([]);
        setAgendaGruposSesion([]);
        setAgendaRecomendaciones([]);
      }
      await cargarAgendaOperativaDirecta();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo comprobar o borrar la sesión.'
      );
    } finally {
      setCargando(false);
    }
  }


  async function cargarDetalleGrupo(
    nombreGrupo: string,
    fecha: string,
    horaInicio: string
  ) {
    setCargando(true);
    setError('');

    try {
      const filtroNombre = encodeURIComponent(`eq.${nombreGrupo}`);
      const filtroFecha = encodeURIComponent(`eq.${fecha}`);
      const filtroHora = encodeURIComponent(`eq.${horaInicio}`);

      const data = await consultarSupabase<DetalleGrupo>(
        'v_detalle_grupos',
        `select=*&nombre_grupo=${filtroNombre}&fecha=${filtroFecha}&hora_inicio=${filtroHora}`
      );

      setDetalle(data[0] || null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setDetalle(null);
    }

    setCargando(false);
  }

  useEffect(() => {
    if (pantalla !== 'inicio') return;
    void cargarInicio();
  }, [pantalla, semanaAgendaActiva]);

  useEffect(() => {
    if (pantalla === 'agenda') {
      cargarAgendaOperativaDirecta();
      cargarWhatsappGruposApp();
      cargarIntensivos();
      cargarPlanning();
      cargarListados();
      cargarEntrenadores();
      cargarDisponibilidad();
    }
    if (pantalla === 'resumenDia') {
      cargarAgendaOperativaDirecta();
      cargarIntensivos();
      cargarPlanning();
      cargarListados();
      cargarReportesPendientes();
      cargarGruposEntrenador();
      cargarDisponibilidad();
      cargarAlumnos();
    }
    if (pantalla === 'planning') cargarPlanning();
    if (pantalla === 'entrenador') {
      cargarGruposEntrenador();
      cargarDisponibilidad();
    }
    if (pantalla === 'alumnos') {
      cargarAlumnos();
      cargarIntensivos();
    }
    if (pantalla === 'ocioAlumnos') {
      cargarOcioAlumnos();
      cargarOcioGrupos();
      cargarIntensivos();
      cargarAlumnos();
    }
    if (pantalla === 'ocioGrupos') {
      cargarOcioAlumnos();
      cargarOcioGrupos();
      cargarOcioCambios();
      cargarAlumnos();
      cargarAgendaOperativaDirecta();
      cargarResultadosOcioSemanaDesdeSupabase();
    }
    if (pantalla === 'ocioCambios') {
      cargarOcioAlumnos();
      cargarOcioGrupos();
      cargarOcioCambios();
    }
    if (pantalla === 'ocioEvaluaciones') {
      // Solo cargamos el censo Ocio. Las evaluaciones se generan manualmente.
      cargarOcioAlumnos();
    }
    if (pantalla === 'revisionOcio') {
      cargarOcioAlumnos();
      cargarOcioGrupos();
      cargarOcioCambios();
    }
    if (pantalla === 'ocioSemana') {
      cargarWhatsappGruposApp();
      cargarOcioAlumnos();
      cargarOcioGrupos();
      cargarOcioCambios();
      cargarEntrenadores();
      cargarDisponibilidad();
      cargarAgendaOperativaDirecta();
    }
    if (pantalla === 'entrenadores') cargarEntrenadores();
    if (pantalla === 'administracion') {
      cargarAltasNivelInicial();
      cargarIntensivosAltaNivel();
      cargarWhatsappGruposApp();
    }
    if (pantalla === 'usuarios' && esCoordinadorJefeApp) {
      cargarUsuariosOperativos();
    }
    if (pantalla === 'whatsappDireccion' && esCoordinadorJefeApp) {
      cargarIntensivosAltaNivel();
      cargarWhatsappGruposApp();
    }
    if (pantalla === 'disponibilidad') cargarDisponibilidad();
    if (pantalla === 'reportes') cargarReportesPendientes();
    if (pantalla === 'cobros' && esCoordinadorJefeApp) {
      void cargarCobrosDesdeSemanaActiva();
      cargarEntrenadores();
    }
    if (
      (pantalla === 'informes' || pantalla === 'temporadas') &&
      esCoordinadorJefeApp
    ) {
      cargarAgendaOperativaDirecta();
      cargarIntensivos();
      cargarPlanning();
      cargarListados();
      cargarReportesPendientes();
      cargarAlumnos();
      cargarOcioAlumnos();
      cargarOcioGrupos();
      cargarCobros();
    }
    if (pantalla === 'analisis' && esCoordinadorJefeApp && !analisisAdmin) {
      void cargarAnalisisAdminApp('BABY', '');
    }
    if (pantalla === 'intensivos') {
      cargarWhatsappGruposApp();
      cargarIntensivos();
      cargarDisponibilidad();
      cargarEntrenadores();
    }
    if (pantalla === 'listados') cargarListados();
  }, [pantalla]);

  useEffect(() => {
    if (pantalla !== 'ocioGrupos') return;
    void cargarResultadosOcioSemanaDesdeSupabase();
  }, [pantalla, semanaAgendaActiva]);


  useEffect(() => {
    if (pantalla !== 'whatsappDireccion') return;

    if (
      whatsappAdminTipo === 'INTENSIVOS' &&
      !whatsappAdminIntensivoId &&
      intensivosAltaNivel.length > 0
    ) {
      setWhatsappAdminIntensivoId(intensivosAltaNivel[0].intensivo_id);
      return;
    }

    const contexto = contextoWhatsappAdministracionApp();
    setWhatsappAdminEnlace(
      contexto ? enlaceWhatsappPorClaveApp(contexto.clave) : ''
    );
  }, [
    pantalla,
    whatsappAdminTipo,
    whatsappAdminIntensivoId,
    whatsappGruposApp,
    intensivosAltaNivel,
  ]);

  useEffect(() => {
    if (
      pantalla === 'agenda' ||
      pantalla === 'ocioSemana' ||
      pantalla === 'intensivos'
    ) {
      void cargarContextoCerebroTrabajoDiarioApp();
    }
  }, [pantalla]);

  useEffect(() => {
    if (pantalla !== 'informes' || !esCoordinadorJefeApp) return;
    cargarInformeSnowZone();
  }, [
    pantalla,
    esCoordinadorJefeApp,
    snowZoneModo,
    snowZoneMes,
    snowZoneSemanaInicio,
  ]);

  useEffect(() => {
    if (
      pantalla === 'disponibilidad' ||
      pantalla === 'agenda' ||
      pantalla === 'resumenDia' ||
      pantalla === 'ocioSemana' ||
      pantalla === 'intensivos' ||
      pantalla === 'entrenador'
    ) {
      void cargarDisponibilidad();
    }
  }, [semanaAgendaActiva]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(
      'mitico_temporada_trabajo',
      String(anioInicioTemporadaAgenda)
    );
    if (mesAgendaActivo)
      window.localStorage.setItem('mitico_mes_trabajo', mesAgendaActivo);
    if (semanaAgendaActiva)
      window.localStorage.setItem('mitico_semana_trabajo', semanaAgendaActiva);
    const fechaTrabajoResumen = fechaResumenDia || fechaIsoHoyApp();
    window.localStorage.setItem(
      'mitico_fecha_resumen_dia',
      fechaTrabajoResumen
    );
  }, [
    anioInicioTemporadaAgenda,
    mesAgendaActivo,
    semanaAgendaActiva,
    fechaResumenDia,
  ]);

  const sesionesAgenda = buildAgendaOperationalSessions({
    directSessions: agendaSesionesDirectas,
    directGroups: agendaGruposSesion,
    intensiveDays: intensivoDias,
    intensives: intensivos,
    intensiveGroups: gruposIntensivoDia,
    intensiveStudents: intensivoAlumnos,
    planning,
    rosters: listados,
  });
  const sesionAgendaAbierta = sesionesAgenda.find(
    (sesion) =>
      sesion.origen === 'operativa' &&
      sesion.agendaDirecta?.sesion_id === agendaSesionActivaId
  );

  const fechaResumenDiaActiva = fechaResumenDia || fechaIsoHoyApp();
  const sesionesResumenDia = sesionesAgenda.filter(
    (sesion) => sesion.fecha === fechaResumenDiaActiva
  );

  useEffect(() => {
    let cancelado = false;
    const sesionesOperativasDia = agendaSesionesDirectas.filter(
      (sesion) => sesion.fecha === fechaResumenDiaActiva
    );

    if (sesionesOperativasDia.length === 0) {
      setGruposOperativosResumenDia({});
      return () => {
        cancelado = true;
      };
    }

    Promise.all(
      sesionesOperativasDia.map(async (sesion) => {
        try {
          const filtroSesion = encodeURIComponent(`eq.${sesion.sesion_id}`);
          const grupos = await consultarSupabase<AgendaGrupoSesionApp>(
            'v_grupos_sesion_operativa_app',
            `select=*&sesion_id=${filtroSesion}&order=nombre_grupo.asc`
          );
          return [sesion.sesion_id, grupos] as const;
        } catch {
          return [sesion.sesion_id, [] as AgendaGrupoSesionApp[]] as const;
        }
      })
    ).then((resultados) => {
      if (cancelado) return;
      setGruposOperativosResumenDia(Object.fromEntries(resultados));
    });

    return () => {
      cancelado = true;
    };
  }, [fechaResumenDiaActiva, agendaSesionesDirectas]);
  const reportesResumenDia = reportesPendientes.filter(
    (reporte) => reporte.fecha === fechaResumenDiaActiva
  );
  const gruposEntrenadorResumenDia = gruposEntrenador.filter(
    (grupo) => grupo.fecha === fechaResumenDiaActiva
  );
  const gruposPendientesEntrenadorResumenDia = [
    ...planning.filter(
      (grupo) => grupo.fecha === fechaResumenDiaActiva && !grupo.entrenadores
    ),
    ...gruposIntensivoDia.filter(
      (grupo) =>
        grupo.fecha === fechaResumenDiaActiva &&
        grupo.grupo_id &&
        !grupo.entrenador
    ),
  ];
  const totalAlumnosResumenDia = sesionesResumenDia.reduce(
    (total, sesion) => total + Number(sesion.totalAlumnos || 0),
    0
  );
  const totalGruposResumenDia = sesionesResumenDia.reduce(
    (total, sesion) => total + Number(sesion.totalGrupos || 0),
    0
  );
  const totalPublicadosResumenDia = sesionesResumenDia.reduce(
    (total, sesion) => total + Number(sesion.publicados || 0),
    0
  );

  function gruposPublicadosSesionResumenDia(sesion: any) {
    if (sesion.origen === 'intensivo') {
      return (sesion.grupos || []).filter(
        (grupo: any) => grupo.grupo_id && grupo.publicado
      );
    }

    const sesionIdOperativo = sesion.agendaDirecta?.sesion_id;
    if (sesionIdOperativo) {
      const gruposOperativos = gruposOperativosResumenDia[sesionIdOperativo] || [];
      if (gruposOperativos.length > 0) {
        return gruposOperativos.filter((grupo) => grupo.publicado);
      }
    }

    return (sesion.planningGrupos || []).filter((grupo: any) => grupo.publicado);
  }

  function nivelAlumnoResumenDia(nombre: string) {
    const alumnoFicha = alumnos.find(
      (item) =>
        textoSinAcentosGrupoApp(item.alumno || '') ===
        textoSinAcentosGrupoApp(nombre)
    );

    return (
      alumnoFicha?.nivel_actual ||
      alumnoFicha?.ultimo_nivel_reportado ||
      alumnoFicha?.nivel_estimado ||
      ''
    );
  }

  function fichaAlumnoResumenDiaDesdeTexto(valor: string) {
    const textoCompleto = textoSinAcentosGrupoApp(String(valor || ''));

    const coincidencias = alumnos
      .filter((item) => {
        const nombreFicha = textoSinAcentosGrupoApp(item.alumno || '');
        return nombreFicha.length >= 4 && textoCompleto.includes(nombreFicha);
      })
      .sort(
        (a, b) =>
          textoSinAcentosGrupoApp(b.alumno || '').length -
          textoSinAcentosGrupoApp(a.alumno || '').length
      );

    if (coincidencias.length > 0) return coincidencias[0];

    const nombreDirecto = String(valor || '')
      .split('·')
      .slice(0, -1)
      .join('·')
      .trim();

    return (
      alumnos.find(
        (item) =>
          textoSinAcentosGrupoApp(item.alumno || '') ===
          textoSinAcentosGrupoApp(nombreDirecto)
      ) || null
    );
  }

  function telefonoAlumnoResumenDia(nombre: string) {
    const alumnoFicha = fichaAlumnoResumenDiaDesdeTexto(nombre);
    return String(alumnoFicha?.telefono || '').trim();
  }

  async function actualizarCamisetaAlumnoResumenDia(
    alumno: AlumnoResumen,
    entregada: boolean
  ) {
    if (!alumno?.alumno_id || guardandoCamisetaAlumnoId) return;

    setGuardandoCamisetaAlumnoId(alumno.alumno_id);
    setError('');

    const entregadaAt = entregada ? new Date().toISOString() : null;

    try {
      await ejecutarFuncion('actualizar_camiseta_alumno_app', {
        p_alumno_id: alumno.alumno_id,
        p_entregada: entregada,
      });

      setAlumnos((actuales) =>
        actuales.map((item) =>
          item.alumno_id === alumno.alumno_id
            ? {
                ...item,
                camiseta_entregada: entregada,
                camiseta_entregada_at: entregadaAt,
              }
            : item
        )
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el estado de la camiseta.'
      );
    } finally {
      setGuardandoCamisetaAlumnoId('');
    }
  }

  function alumnosCamisetaPendienteResumenDia() {
    const pendientes = new Map<string, AlumnoResumen>();

    sesionesResumenDia.forEach((sesion: any) => {
      gruposPublicadosSesionResumenDia(sesion).forEach((grupo: any) => {
        alumnosGrupoResumenDia(grupo).forEach((alumnoTexto) => {
          const ficha = fichaAlumnoResumenDiaDesdeTexto(alumnoTexto);
          if (!ficha || ficha.camiseta_entregada !== false) return;
          pendientes.set(ficha.alumno_id, ficha);
        });
      });
    });

    return Array.from(pendientes.values()).sort((a, b) =>
      String(a.alumno || '').localeCompare(String(b.alumno || ''), 'es')
    );
  }

  function hrefTelefonoAlumnoResumenDia(telefono: string) {
    const limpio = String(telefono || '').replace(/[^+\d]/g, '');
    return limpio ? `tel:${limpio}` : '';
  }

  function hrefWhatsappAlumnoResumenDia(telefono: string) {
    const limpio = normalizarTelefonoWhatsappApp(telefono);
    return limpio ? `https://wa.me/${limpio}` : '';
  }

  function copiarTelefonoAlumnoResumenDia(telefono: string) {
    if (!telefono) return;
    if (navigator.clipboard?.writeText) {
      void navigator.clipboard.writeText(telefono);
      return;
    }
    window.prompt('Copia el teléfono', telefono);
  }

  function alumnosGrupoResumenDia(grupo: any) {
    // MISMA fuente y MISMO formato que "Días de entrenamiento".
    // No reconstruimos nombres desde observaciones ni desde fichas paralelas.
    // Así el Resumen del día refleja exactamente el listado publicado del grupo.
    const textoAlumnos = String(grupo?.alumnos_lista || '').trim();
    if (!textoAlumnos) return [] as string[];

    return textoAlumnos
      .split(' || ')
      .map((alumnoGrupo) => String(alumnoGrupo || '').trim())
      .filter(Boolean)
      .map((alumnoGrupo) => {
        const ficha = fichaAlumnoResumenDiaDesdeTexto(alumnoGrupo);
        if (!ficha) return formatearAlumnoListadoOperativo(alumnoGrupo);

        const nivelEnListado = alumnoGrupo
          .split('·')
          .map((parte) => parte.trim())
          .find((parte) =>
            /^(INICIACI[ÓO]N|DEBUT|A\+?|B\+{0,2}|C\+?|D\+?)$/i.test(parte)
          );
        const nivel =
          nivelEnListado ||
          ficha.nivel_actual ||
          ficha.ultimo_nivel_reportado ||
          ficha.nivel_estimado ||
          '';

        return `${ficha.alumno}${nivel ? ` · ${String(nivel).toUpperCase()}` : ''}`;
      });
  }

  function claveDomAlumnoResumenDia(nombre: string) {
    return textoSinAcentosGrupoApp(nombre)
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  const textoBusquedaAlumnoResumenDia = textoSinAcentosGrupoApp(
    busquedaAlumnoResumenDia.trim()
  );
  const resultadosBusquedaAlumnoResumenDia = textoBusquedaAlumnoResumenDia
    ? sesionesResumenDia.flatMap((sesion: any) =>
        gruposPublicadosSesionResumenDia(sesion).flatMap(
          (grupo: any, indice: number) =>
            alumnosGrupoResumenDia(grupo)
              .filter((alumno) =>
                textoSinAcentosGrupoApp(alumno).includes(
                  textoBusquedaAlumnoResumenDia
                )
              )
              .map((alumno) => ({
                alumno,
                sesion,
                grupo,
                indice,
              }))
        )
      )
    : [];

  function abrirResultadoAlumnoResumenDia(resultado: any) {
    const sesionId = String(resultado.sesion.id);
    const grupoId = String(
      resultado.grupo.grupo_id || `${sesionId}-${resultado.indice}`
    );
    const alumnoClave = textoSinAcentosGrupoApp(resultado.alumno.split('·')[0]);

    setTurnoResumenDiaAbierto(sesionId);
    setGrupoResumenDiaDestacado(grupoId);
    setAlumnoResumenDiaDestacado(alumnoClave);

    window.setTimeout(() => {
      const alumnoId = `resumen-alumno-${grupoId}-${claveDomAlumnoResumenDia(
        resultado.alumno.split('·')[0]
      )}`;
      const objetivo =
        document.getElementById(alumnoId) ||
        document.getElementById(`resumen-grupo-${grupoId}`);

      objetivo?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 220);

    window.setTimeout(() => {
      setGrupoResumenDiaDestacado('');
      setAlumnoResumenDiaDestacado('');
    }, 3200);
  }

  function abrirAjustePistaSesion(
    sesionId: string,
    modo: 'mover' | 'anadir'
  ) {
    const mismaAccion = ajustePistaSesionId === sesionId && ajustePistaModo === modo;
    if (mismaAccion) {
      setAjustePistaSesionId('');
      setAjustePistaModo('');
      return;
    }

    setAjustePistaSesionId(sesionId);
    setAjustePistaModo(modo);
    setMovimientoPistaAlumno('');
    setMovimientoPistaDestino('');
    setBusquedaPistaAlumno('');
    setAnadirPistaAlumnoId('');
    setAnadirPistaDestino('');
    setMensajeAjustePista('');
    setError('');
  }

  async function refrescarTrabajoPistaSesion(sesionId: string) {
    const filtroSesion = encodeURIComponent(`eq.${sesionId}`);
    const grupos = await consultarSupabase<AgendaGrupoSesionApp>(
      'v_grupos_sesion_operativa_app',
      `select=*&sesion_id=${filtroSesion}&order=nombre_grupo.asc`
    );

    setGruposOperativosResumenDia((actual) => ({
      ...actual,
      [sesionId]: grupos,
    }));

    await Promise.allSettled([
      cargarPlanning(),
      cargarGruposEntrenador(),
      cargarReportesPendientes(),
      cargarAlumnos(),
    ]);
  }

  async function moverAlumnoTrabajoPista(
    sesionId: string,
    gruposPublicados: AgendaGrupoSesionApp[]
  ) {
    const [grupoOrigenId, alumnoId] = movimientoPistaAlumno.split('::');
    const grupoDestinoId = movimientoPistaDestino;

    if (!grupoOrigenId || !alumnoId) {
      setError('Selecciona primero el alumno que quieres mover.');
      return;
    }
    if (!grupoDestinoId) {
      setError('Selecciona el grupo de destino.');
      return;
    }
    if (grupoOrigenId === grupoDestinoId) {
      setError('El grupo de destino debe ser diferente del grupo actual.');
      return;
    }

    const alumno = alumnos.find((item) => item.alumno_id === alumnoId);
    const grupoOrigen = gruposPublicados.find((item) => item.grupo_id === grupoOrigenId);
    const grupoDestino = gruposPublicados.find((item) => item.grupo_id === grupoDestinoId);
    if (!alumno || !grupoOrigen || !grupoDestino) {
      setError('No encuentro el alumno o alguno de los grupos. Actualiza y vuelve a intentarlo.');
      return;
    }

    const confirmar = window.confirm(
      `¿Mover a ${alumno.alumno} de ${nombreGrupoVisualApp(grupoOrigen)} a ${nombreGrupoVisualApp(grupoDestino)}?\n\n` +
        `El cambio se aplicará a la sesión de hoy. Se moverán asistencia, observaciones operativas y responsable del reporte. El alumno trabajará con el trabajo diario ya revisado del grupo destino.`
    );
    if (!confirmar) return;

    setGuardandoAjustePista(true);
    setError('');
    setMensajeAjustePista('');

    try {
      const movimiento = requireValidGroupMove({
        studentId: alumnoId,
        sourceGroupId: grupoOrigenId,
        targetGroupId: grupoDestinoId,
      });
      await ejecutarFuncion(GROUP_OPERATION_RPC.moveStudent, {
        p_alumno_id: movimiento.studentId,
        p_grupo_origen_id: movimiento.sourceGroupId,
        p_grupo_destino_id: movimiento.targetGroupId,
      });

      await refrescarTrabajoPistaSesion(sesionId);
      setMensajeAjustePista(
        `${alumno.alumno} movido a ${nombreGrupoVisualApp(grupoDestino)}. Asistencia, observaciones y responsable de reporte actualizados. Mantiene el trabajo diario del grupo destino.`
      );
      setMovimientoPistaAlumno('');
      setMovimientoPistaDestino('');
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'No se pudo mover el alumno entre grupos.';
      setError(mensaje);
    } finally {
      setGuardandoAjustePista(false);
    }
  }

  async function anadirAlumnoHoyTrabajoPista(
    sesionId: string,
    gruposPublicados: AgendaGrupoSesionApp[]
  ) {
    const alumno = alumnos.find((item) => item.alumno_id === anadirPistaAlumnoId);
    const grupoDestino = gruposPublicados.find(
      (item) => item.grupo_id === anadirPistaDestino
    );

    if (!alumno) {
      setError('Busca y selecciona un alumno existente.');
      return;
    }
    if (!grupoDestino?.grupo_id) {
      setError('Selecciona el grupo donde entrenará hoy.');
      return;
    }

    const situacionNivel = buildMasterStudentProfile(alumno).level;
    if (!situacionNivel.level) {
      setError(
        'La ficha no tiene un nivel operativo válido. Revísala antes de incorporar al alumno a la sesión.'
      );
      return;
    }
    const nivelUsado = requireOperationalStudentLevel(situacionNivel.level);
    const avisoRevision = situacionNivel.reviewRequired
      ? '\nAviso: existe una discrepancia de nivel pendiente; se usa el último reporte válido y seguirá marcada para revisión.'
      : '';

    const confirmar = window.confirm(
      `¿Añadir HOY a ${alumno.alumno} al grupo ${nombreGrupoVisualApp(grupoDestino)}?\n\n` +
        `Nivel usado: ${nivelUsado}. Se añadirá a esta sesión para asistencia y reporte. No cambia por sí solo su grupo estable.${avisoRevision}`
    );
    if (!confirmar) return;

    setGuardandoAjustePista(true);
    setError('');
    setMensajeAjustePista('');

    try {
      const resultado = await ejecutarFuncionConRespuesta<{
        alumno_id: string;
        alumno: string;
        sesion_id: string;
        grupo_id: string;
        grupo: string;
        nivel_usado: string;
        resultado: string;
      }>('incorporar_alumno_fuera_plazo_grupo_app', {
        p_sesion_id: sesionId,
        p_grupo_id: grupoDestino.grupo_id,
        p_alumno_id: alumno.alumno_id,
        p_nombre_completo: alumno.alumno,
        p_nivel_codigo: nivelUsado,
      });

      const incorporado = resultado[0];
      if (!incorporado) {
        throw new Error('Supabase no devolvió confirmación de la incorporación.');
      }

      await refrescarTrabajoPistaSesion(sesionId);
      setMensajeAjustePista(
        `${incorporado.alumno} añadido a ${incorporado.grupo} para hoy. Ya queda incluido en asistencia, observaciones y reporte, usando el trabajo diario del grupo.`
      );
      setBusquedaPistaAlumno('');
      setAnadirPistaAlumnoId('');
      setAnadirPistaDestino('');
    } catch (err) {
      const mensaje =
        err instanceof Error ? err.message : 'No se pudo añadir el alumno a la sesión de hoy.';
      setError(mensaje);
    } finally {
      setGuardandoAjustePista(false);
    }
  }

  useEffect(() => {
    if (sesionesResumenDia.length === 0) {
      setTurnoResumenDiaAbierto('');
      return;
    }

    setTurnoResumenDiaAbierto((actual) =>
      sesionesResumenDia.some((sesion) => String(sesion.id) === actual)
        ? actual
        : String(sesionesResumenDia[0].id)
    );
  }, [fechaResumenDiaActiva, sesionesResumenDia.length]);

  const claveSemanaBackupActiva =
    semanaAgendaActiva || semanaActualAgenda || '';
  const semanaBackupObjetivo =
    semanaBackupSeleccionada || claveSemanaBackupActiva;

  const backupSemanaStorageKey = claveStorageBackupSemana(
    semanaBackupObjetivo
  );
  const backupSemanaRealizado =
    backupSemanaStorageKey && typeof window !== 'undefined'
      ? window.localStorage.getItem(backupSemanaStorageKey) || ''
      : '';

  const ocioRevisionBase = ocioAlumnos.map((alumno) => {
    const recomendacion = ocioRecomendacionesCambio.find(
      (item) => item.alumno_id === alumno.alumno_id
    );
    const sinGrupo = !alumno.grupo_id;
    const sinReportes = Number(alumno.total_reportes || 0) === 0;
    const necesitaCambio = Boolean(
      recomendacion && recomendacion.recomendacion !== 'OK'
    );
    return {
      ...alumno,
      recomendacion_revision:
        recomendacion?.recomendacion ||
        (sinGrupo
          ? 'Sin grupo estable'
          : sinReportes
          ? 'Sin reportes todavía'
          : 'OK'),
      necesita_cambio_revision: necesitaCambio,
      sin_grupo_revision: sinGrupo,
      sin_reportes_revision: sinReportes,
    };
  });

  const ocioRevisionFiltrada = ocioRevisionBase.filter((alumno) => {
    const texto = `${alumno.alumno} ${alumno.nivel_usado || ''} ${
      alumno.grupo_estable || ''
    } ${alumno.recomendacion_revision}`.toLowerCase();
    const coincideBusqueda = texto.includes(busquedaRevisionOcio.toLowerCase());
    const coincideFiltro =
      filtroRevisionOcio === 'todos' ||
      (filtroRevisionOcio === 'cambios' && alumno.necesita_cambio_revision) ||
      (filtroRevisionOcio === 'sin_grupo' && alumno.sin_grupo_revision) ||
      (filtroRevisionOcio === 'sin_reportes' && alumno.sin_reportes_revision);
    return coincideBusqueda && coincideFiltro;
  });

  const intensivosControlFino = panelControlIntensivo.map((panel) => {
    const faltanSesiones = Math.max(0, 4 - Number(panel.total_dias || 0));
    const incompleto =
      faltanSesiones > 0 ||
      Number(panel.asignaciones_faltantes_estimadas || 0) > 0 ||
      Number(panel.reportes_pendientes_estimados || 0) > 0 ||
      Number(panel.diplomas_pendientes || 0) > 0 ||
      Number(panel.recuperaciones_pendientes || 0) > 0;
    return {
      ...panel,
      faltan_sesiones_4: faltanSesiones,
      incompleto_control_fino: incompleto,
    };
  });

  const idsAlumnosBaby = new Set(
    alumnosBabyFicha.map((registro) => registro.alumno_id)
  );

  const alumnosBabyIntensivos = alumnos.filter((alumno) =>
    idsAlumnosBaby.has(alumno.alumno_id)
  );

  function abrirFiltroFichas(
    filtro: 'todos' | 'sin_nivel' | 'sin_reportes' | 'revisar_ficha'
  ) {
    setFiltroAlumnos(filtro);
    setBusquedaAlumno('');
    window.setTimeout(() => {
      document
        .getElementById('fichas-listado-alumnos')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 80);
  }

  const alumnosFiltrados = alumnosBabyIntensivos.filter((alumno) => {
    const textoBusqueda = `${alumno.alumno} ${alumno.nivel_actual || ''} ${
      alumno.ultimo_nivel_reportado || ''
    } ${alumno.ultima_recomendacion || ''}`.toLowerCase();

    const coincideBusqueda = textoBusqueda.includes(
      busquedaAlumno.toLowerCase()
    );

    const sinNivel =
      !alumno.nivel_actual &&
      !alumno.nivel_estimado &&
      !alumno.ultimo_nivel_reportado;

    const sinReportes = Number(alumno.total_reportes || 0) === 0;

    const recomendacion = (alumno.ultima_recomendacion || '').toLowerCase();
    const incidencia = (alumno.ultima_incidencia || '').toLowerCase();

    const revisionReciente =
      recomendacion.includes('revisar') ||
      recomendacion.includes('subir') ||
      recomendacion.includes('bajar') ||
      recomendacion.includes('probar') ||
      recomendacion.includes('volver');

    const seguimientoEspecial =
      recomendacion.includes('seguimiento') ||
      recomendacion.includes('apoyo') ||
      incidencia.includes('miedo') ||
      incidencia.includes('bloqueo') ||
      incidencia.includes('caída') ||
      incidencia.includes('llanto');

    const coincideFiltro =
      filtroAlumnos === 'todos' ||
      (filtroAlumnos === 'sin_nivel' && sinNivel) ||
      (filtroAlumnos === 'sin_reportes' && sinReportes) ||
      (filtroAlumnos === 'revisar_ficha' &&
        String(alumno.estado_ficha || '').toLowerCase().includes('revis')) ||
      (filtroAlumnos === 'revision_reciente' && revisionReciente) ||
      (filtroAlumnos === 'seguimiento_especial' && seguimientoEspecial);

    return coincideBusqueda && coincideFiltro;
  });

  const gruposEntrenadorFiltrados = gruposEntrenador.filter((grupo) => {
    // El entrenador solo recibe grupos PUBLICADOS.
    // Coordinación sí puede inspeccionar borradores desde su vista.
    if (!esCoordinadorApp && !grupo.publicado) return false;

    if (
      !esCoordinadorApp &&
      entrenadorIdSesionApp &&
      grupo.entrenador_id !== entrenadorIdSesionApp
    )
      return false;
    if (!esCoordinadorApp && !entrenadorIdSesionApp) return false;
    const texto = `${grupo.entrenador} ${grupo.nombre_grupo} ${
      grupo.modalidad
    } ${grupo.alumnos || ''}`.toLowerCase();
    return texto.includes(busquedaGrupoEntrenador.toLowerCase());
  });

  const entrenadoresFiltrados = entrenadores.filter((entrenador) => {
    const textoBusqueda = `${entrenador.nombre_completo} ${
      entrenador.email || ''
    } ${entrenador.telefono || ''} ${(entrenador.especialidades || []).join(
      ' '
    )}`.toLowerCase();

    const coincideBusqueda = textoBusqueda.includes(
      busquedaEntrenador.toLowerCase()
    );

    const documentacionPendiente =
      (entrenador.titulacion_estado || 'Pendiente') !== 'Validado' ||
      (entrenador.antecedentes_estado || 'Pendiente') !== 'Validado';

    const coincideFiltro =
      filtroEntrenadores === 'todos' ||
      (filtroEntrenadores === 'activos' && entrenador.activo) ||
      (filtroEntrenadores === 'inactivos' && !entrenador.activo) ||
      (filtroEntrenadores === 'sin_chaqueta' &&
        !entrenador.chaqueta_entregada) ||
      (filtroEntrenadores === 'documentacion_pendiente' &&
        documentacionPendiente);

    return coincideBusqueda && coincideFiltro;
  });

  const disponibilidadFiltrada = disponibilidad.filter((item) => {
    if (
      !esCoordinadorApp &&
      entrenadorIdSesionApp &&
      item.entrenador_id !== entrenadorIdSesionApp
    )
      return false;
    if (!esCoordinadorApp && !entrenadorIdSesionApp) return false;
    const coincideSemana = semanaAgendaActiva
      ? item.fecha_inicio === semanaAgendaActiva
      : true;

    const coincideBusqueda = item.entrenador
      .toLowerCase()
      .includes(busquedaDisponibilidad.toLowerCase());

    const respuestaNormalizada = item.respuesta || 'Pendiente';

    const coincideFiltro =
      filtroDisponibilidad === 'todos' ||
      (filtroDisponibilidad === 'disponibles' &&
        respuestaNormalizada === 'Disponible') ||
      (filtroDisponibilidad === 'no_puedo' &&
        respuestaNormalizada === 'No puedo') ||
      (filtroDisponibilidad === 'pendientes' &&
        respuestaNormalizada === 'Pendiente');

    return coincideSemana && coincideBusqueda && coincideFiltro;
  });

  const finSemanaReportes = semanaAgendaActiva
    ? claveFechaAgenda(
        new Date(
          crearFechaAgenda(semanaAgendaActiva).getTime() +
            6 * 24 * 60 * 60 * 1000
        )
      )
    : '';

  const reportesSemanaCierre = reportesPendientes.filter((reporte) => {
    if (
      !esCoordinadorApp &&
      entrenadorIdSesionApp &&
      reporte.entrenador_id !== entrenadorIdSesionApp
    )
      return false;
    if (!esCoordinadorApp && !entrenadorIdSesionApp) return false;

    return semanaAgendaActiva
      ? reporte.fecha >= semanaAgendaActiva &&
          reporte.fecha <= finSemanaReportes
      : true;
  });

  const reportesFiltrados = reportesSemanaCierre.filter((reporte) => {
    const texto =
      `${reporte.entrenador} ${reporte.alumno} ${reporte.nombre_grupo} ${reporte.modalidad} ${reporte.estado_reporte}`.toLowerCase();

    const coincideBusqueda = texto.includes(busquedaReportes.toLowerCase());

    const asistenciaPendiente = isAttendanceUnconfirmed(reporte);

    const coincideFiltro =
      filtroReportes === 'todos' ||
      (filtroReportes === 'faltan_reportes' &&
        isMissingReport(reporte)) ||
      (filtroReportes === 'asistencias_sin_confirmar' &&
        asistenciaPendiente) ||
      (filtroReportes === 'criticos' &&
        isMissingReport(reporte) &&
        asistenciaPendiente);

    return coincideBusqueda && coincideFiltro;
  });

  const cobrosFiltrados = filterBillingRows(cobros, busquedaCobros, filtroCobros);
  const resumenCobrosMes = summarizeBillingRows(cobrosFiltrados);
  const totalGeneralCobrosMes = resumenCobrosMes.total;
  const totalTurnosCobrosMes = resumenCobrosMes.turnos;
  const totalBabyCobrosMes = resumenCobrosMes.baby;
  const totalIntensivosCobrosMes = resumenCobrosMes.intensivos;
  const totalOcioCobrosMes = resumenCobrosMes.ocio;

  const aniosCobrosOpciones = Array.from(
    new Set([
      new Date().getFullYear() - 1,
      new Date().getFullYear(),
      new Date().getFullYear() + 1,
      anioCobros,
      ...opcionesTemporadaAgenda,
      ...opcionesTemporadaAgenda.map((anio) => anio + 1),
    ])
  ).sort((a, b) => a - b);

  const intensivosFiltrados = intensivos.filter((intensivo) => {
    const texto =
      `${intensivo.intensivo} ${intensivo.temporada} ${intensivo.estado} ${intensivo.lugar}`.toLowerCase();

    const coincideBusqueda = texto.includes(busquedaIntensivos.toLowerCase());

    const estado = String(intensivo.estado || '').toLowerCase();
    const totalAlumnos = Number(intensivo.total_alumnos || 0);

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const fechaInicio = intensivo.fecha_inicio
      ? new Date(`${intensivo.fecha_inicio}T00:00:00`)
      : null;

    const esActivo =
      estado.includes('activo') ||
      estado.includes('abierto') ||
      estado.includes('en curso') ||
      estado.includes('publicado');

    const esCerrado =
      estado.includes('cerrado') ||
      estado.includes('finalizado') ||
      estado.includes('cancelado');

    const esProximo = Boolean(fechaInicio && fechaInicio >= hoy);

    const coincideFiltro =
      filtroIntensivos === 'todos' ||
      (filtroIntensivos === 'activos' && esActivo) ||
      (filtroIntensivos === 'cerrados' && esCerrado) ||
      (filtroIntensivos === 'sin_alumnos' && totalAlumnos === 0) ||
      (filtroIntensivos === 'proximos' && esProximo);

    let coincideMes = true;
    if (mesIntensivos) {
      const [anioMes, numeroMes] = mesIntensivos
        .split('-')
        .map((valor) => Number(valor));

      if (anioMes && numeroMes) {
        const inicioMes = new Date(anioMes, numeroMes - 1, 1, 0, 0, 0, 0);
        const finMes = new Date(anioMes, numeroMes, 0, 23, 59, 59, 999);
        const inicioCurso = intensivo.fecha_inicio
          ? new Date(`${intensivo.fecha_inicio}T00:00:00`)
          : null;
        const finCurso = intensivo.fecha_fin
          ? new Date(`${intensivo.fecha_fin}T23:59:59`)
          : inicioCurso;

        coincideMes = Boolean(
          inicioCurso &&
            finCurso &&
            inicioCurso <= finMes &&
            finCurso >= inicioMes
        );
      }
    }

    return coincideBusqueda && coincideFiltro && coincideMes;
  });

  const listadosFiltrados = listados.filter((listado) => {
    const texto = `${listado.semana || ''} ${listado.modalidad} ${
      listado.estado
    } ${listado.fecha}`.toLowerCase();

    const coincideBusqueda = texto.includes(busquedaListados.toLowerCase());

    const coincideFiltro =
      filtroListados === 'todos' ||
      (filtroListados === 'pendientes' &&
        Number(listado.pendientes_revisar || 0) > 0) ||
      (filtroListados === 'altas' && Number(listado.altas_nuevas || 0) > 0) ||
      (filtroListados === 'no_encontrados' &&
        Number(listado.no_encontrados || 0) > 0) ||
      (filtroListados === 'fuera_plazo' && listado.fuera_de_plazo);

    return coincideBusqueda && coincideFiltro;
  });

  const disponibilidadPorEntrenador = agruparPorEntrenador(
    disponibilidadFiltrada
  );
  const disponibilidadSemanalEntrenador = agruparDisponibilidadSemanal(
    disponibilidadFiltrada
  );
  const disponibilidadPorTurno = agruparDisponibilidadPorTurno(
    disponibilidadFiltrada
  ).filter((turno) => {
    const diaSemana = new Date(`${turno.fecha}T12:00:00`).getDay();
    return diaSemana !== 1 && diaSemana !== 2;
  });

  const sesionAgendaActiva = agendaSesionesDirectas.find(
    (sesion) => sesion.sesion_id === agendaSesionActivaId
  );

  function horaCorta(valor: string | null | undefined) {
    return (valor || '').slice(0, 5);
  }

  function entrenadoresDisponiblesParaTurno(
    fecha?: string | null,
    horaInicio?: string | null,
    horaFin?: string | null,
    disponibilidadFuente?: any[]
  ) {
    if (!fecha || !horaInicio || !horaFin) return [];

    const fuente = disponibilidadFuente ?? disponibilidad;

    return entrenadores
      .filter((entrenador) => entrenador.activo)
      .filter((entrenador) =>
        fuente.some(
          (turno) =>
            turno.entrenador_id === entrenador.entrenador_id &&
            turno.fecha === fecha &&
            horaCorta(turno.hora_inicio) === horaCorta(horaInicio) &&
            horaCorta(turno.hora_fin) === horaCorta(horaFin) &&
            String(turno.respuesta || '').trim().toLowerCase() ===
              'disponible'
        )
      )
      .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));
  }

  function sesionOperativaActualRecursosAgenda() {
    if (
      contextoRecursosSesionAgenda &&
      contextoRecursosSesionAgenda.sesion_id === agendaSesionActivaId
    ) {
      return contextoRecursosSesionAgenda;
    }

    if (
      sesionAgendaActiva &&
      sesionAgendaActiva.sesion_id === agendaSesionActivaId
    ) {
      return sesionAgendaActiva;
    }

    const sesionIdDetalle =
      agendaGruposSesion[0]?.sesion_id ||
      agendaAlumnosSesion[0]?.sesion_id ||
      agendaSesionActivaId;

    if (!sesionIdDetalle) return undefined;

    const directa = agendaSesionesDirectas.find(
      (sesion) => sesion.sesion_id === sesionIdDetalle
    );
    if (directa) return directa;

    const diaIntensivo = intensivoDias.find(
      (dia) => dia.sesion_id === sesionIdDetalle
    );

    if (diaIntensivo) {
      return {
        sesion_id: sesionIdDetalle,
        fecha: diaIntensivo.fecha,
        hora_inicio: diaIntensivo.hora_inicio,
        hora_fin: diaIntensivo.hora_fin,
      };
    }

    return undefined;
  }

  function entrenadoresDisponiblesSesionActiva() {
    const sesion = sesionOperativaActualRecursosAgenda();
    if (!sesion) return [];

    const usarFuenteSesion =
      contextoRecursosSesionAgenda?.sesion_id === agendaSesionActivaId;

    return entrenadoresDisponiblesParaTurno(
      sesion.fecha,
      sesion.hora_inicio,
      sesion.hora_fin,
      usarFuenteSesion ? disponibilidadSesionAgenda : disponibilidad
    );
  }

  function gruposRecursosTurnoAgenda() {
    return agendaGruposRecursosTurno.length > 0
      ? agendaGruposRecursosTurno
      : agendaGruposSesion;
  }

  function entrenadoresOcupadosTurnoAgenda(grupoExcluirId?: string) {
    const ocupados = new Set<string>();

    gruposRecursosTurnoAgenda()
      .filter((grupo) => grupo.grupo_id !== grupoExcluirId)
      .forEach((grupo) => {
        if (grupo.entrenador_id) ocupados.add(grupo.entrenador_id);
        if (grupo.entrenador_apoyo_id)
          ocupados.add(grupo.entrenador_apoyo_id);
      });

    return ocupados;
  }

  function entrenadoresDisponiblesCambioGrupoAgenda(
    grupoId: string,
    entrenadorActualId?: string | null,
    entrenadorDelMismoGrupoBloqueadoId?: string | null
  ) {
    const ocupadosOtrosGrupos = entrenadoresOcupadosTurnoAgenda(grupoId);

    if (entrenadorDelMismoGrupoBloqueadoId) {
      ocupadosOtrosGrupos.add(entrenadorDelMismoGrupoBloqueadoId);
    }

    return entrenadoresDisponiblesSesionActiva().filter(
      (entrenador) =>
        entrenador.entrenador_id === entrenadorActualId ||
        !ocupadosOtrosGrupos.has(entrenador.entrenador_id)
    );
  }

  function entrenadoresExcepcionalesCambioGrupoAgenda(
    grupoId: string,
    entrenadorActualId?: string | null,
    entrenadorDelMismoGrupoBloqueadoId?: string | null
  ) {
    const ocupadosOtrosGrupos = entrenadoresOcupadosTurnoAgenda(grupoId);

    if (entrenadorDelMismoGrupoBloqueadoId) {
      ocupadosOtrosGrupos.add(entrenadorDelMismoGrupoBloqueadoId);
    }

    return entrenadores.filter(
      (entrenador) =>
        entrenador.activo &&
        (entrenador.entrenador_id === entrenadorActualId ||
          !ocupadosOtrosGrupos.has(entrenador.entrenador_id))
    );
  }

  function entrenadoresDisponiblesDiaIntensivo(dia?: IntensivoDiaApp | null) {
    if (!dia) return [];
    const solapa = (inicioA: string, finA: string, inicioB: string, finB: string) =>
      horaCorta(inicioA) < horaCorta(finB) && horaCorta(inicioB) < horaCorta(finA);
    const ocupados = new Set<string>();
    gruposIntensivoDia.forEach((grupo) => {
      if (grupo.fecha === dia.fecha && solapa(grupo.hora_inicio || '', grupo.hora_fin || '', dia.hora_inicio, dia.hora_fin)) {
        if (grupo.entrenador_id) ocupados.add(grupo.entrenador_id);
      }
    });
    return entrenadoresDisponiblesParaTurno(dia.fecha, dia.hora_inicio, dia.hora_fin)
      .filter((entrenador) => !ocupados.has(entrenador.entrenador_id));
  }

  function avisoDisponibilidadDiaIntensivo(dia?: IntensivoDiaApp | null) {
    if (!dia) return 'Selecciona un día para ver entrenadores.';
    const disponibles = entrenadoresDisponiblesParaTurno(
      dia.fecha,
      dia.hora_inicio,
      dia.hora_fin
    );
    if (disponibles.length > 0)
      return `${disponibles.length} entrenador(es) disponibles para este día/turno.`;
    return 'No hay entrenadores disponibles declarados para este día/turno.';
  }
  const reportesPorEntrenador = agruparReportesPorEntrenador(reportesFiltrados);
  const gruposEntrenadorAgrupados = agruparGruposPorEntrenador(
    gruposEntrenadorFiltrados
  );
  const gruposEntrenadorSemanal = agruparGruposEntrenadorSemanal(
    gruposEntrenadorFiltrados
  );

  // La vista del entrenador es operativa, no histórica.
  // El calendario de coordinación puede moverse libremente sin cambiar esta vista.
  // Solo una apertura explícita desde Cierre semanal puede forzar temporalmente
  // otra semana para resolver una tarea concreta. Ningún dato se elimina de Supabase.
  const semanaActualVistaEntrenador = inicioSemanaAgenda(
    fechaIsoMadridApp()
  );
  const semanaVistaEntrenadorInicio = esCoordinadorApp
    ? semanaVistaEntrenadorCoordinadorForzada || semanaActualVistaEntrenador
    : semanaActualVistaEntrenador;
  const semanaDisponibilidadVistaEntrenadorInicio = esCoordinadorApp
    ? semanaVistaEntrenadorInicio
    : semanaPublicadaObjetivoEntrenador ||
      semanaEntrenadorSeleccionada ||
      semanaActualVistaEntrenador;
  const semanaVistaEntrenadorFin = semanaVistaEntrenadorInicio
    ? claveFechaAgenda(
        new Date(
          crearFechaAgenda(semanaVistaEntrenadorInicio).getTime() +
            6 * 24 * 60 * 60 * 1000
        )
      )
    : '';

  async function cargarEstadoSemanaPushEntrenadorApp(
    semanaForzada?: string
  ) {
    const semanaObjetivo =
      semanaForzada || semanaVistaEntrenadorInicio;

    if (!esEntrenadorApp || !semanaObjetivo) {
      setEstadoSemanaPushEntrenadorApp(null);
      return;
    }

    setCargandoEstadoPushEntrenadorApp(true);
    try {
      const estado = await ejecutarPushMiticoApp<EstadoSemanaEntrenadorPush>(
        'trainer_week_status',
        { semana_inicio: semanaObjetivo }
      );
      setEstadoSemanaPushEntrenadorApp(estado);
    } catch (errorPush) {
      console.warn('No se pudo cargar el estado push de la semana:', errorPush);
      setEstadoSemanaPushEntrenadorApp(null);
    } finally {
      setCargandoEstadoPushEntrenadorApp(false);
    }
  }

  useEffect(() => {
    if (!esEntrenadorApp || pantalla !== 'entrenador') return;
    void cargarEstadoSemanaPushEntrenadorApp();
  }, [
    esEntrenadorApp,
    pantalla,
    semanaVistaEntrenadorInicio,
    gruposEntrenador.length,
    disponibilidad.length,
  ]);

  useEffect(() => {
    if (
      !esEntrenadorApp ||
      pantalla !== 'entrenador' ||
      !semanaVistaEntrenadorInicio ||
      !estadoSemanaPushEntrenadorApp ||
      estadoSemanaPushEntrenadorApp.push_activo ||
      permisoPushMitico() !== 'granted' ||
      gestionandoPushEntrenadorApp
    ) {
      return;
    }

    if (
      autoPushIntentadoSemanaRef.current === semanaVistaEntrenadorInicio
    ) {
      return;
    }

    autoPushIntentadoSemanaRef.current = semanaVistaEntrenadorInicio;
    void activarPushEntrenadorApp(semanaVistaEntrenadorInicio);
  }, [
    esEntrenadorApp,
    pantalla,
    semanaVistaEntrenadorInicio,
    estadoSemanaPushEntrenadorApp?.push_activo,
    gestionandoPushEntrenadorApp,
  ]);

  async function enviarRecordatorioReportesPushApp(
    entrenadorId: string,
    entrenadorNombre: string,
    semanaInicio: string
  ) {
    if (!esCoordinadorApp || !entrenadorId || !semanaInicio) return;
    if (enviandoRecordatorioReportesPushId) return;

    setEnviandoRecordatorioReportesPushId(entrenadorId);
    try {
      const accessToken = await obtenerAccessTokenSupabaseApp();
      const respuesta = await fetch(
        `${SUPABASE_URL}/functions/v1/mitico-report-reminders`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: SUPABASE_ANON_KEY,
            Authorization: `Bearer ${accessToken}`,
          },
          body: JSON.stringify({
            mode: 'manual',
            entrenador_id: entrenadorId,
            semana_inicio: semanaInicio,
          }),
        }
      );

      const datos = await respuesta.json().catch(() => ({}));
      if (!respuesta.ok) {
        throw new Error(
          String(datos?.error || 'No se pudo enviar el recordatorio Push.')
        );
      }

      if (datos?.no_pending) {
        alert(`${entrenadorNombre} ya no tiene reportes pendientes en esta semana.`);
        await cargarReportesPendientes();
        return;
      }

      if (Number(datos?.sent || 0) > 0) {
        alert(`Recordatorio Push enviado a ${entrenadorNombre}.`);
        return;
      }

      if (Number(datos?.without_subscription || 0) > 0) {
        alert(
          `${entrenadorNombre} todavía no tiene las notificaciones activadas en ningún dispositivo.`
        );
        return;
      }

      if (Number(datos?.duplicate || 0) > 0) {
        alert(
          `Ya se ha enviado un recordatorio Push a ${entrenadorNombre} durante esta hora.`
        );
        return;
      }

      alert(`No se ha enviado ningún Push a ${entrenadorNombre}. Revisa su estado de notificaciones.`);
    } catch (errorPush) {
      alert(
        errorPush instanceof Error
          ? errorPush.message
          : 'No se pudo enviar el recordatorio Push.'
      );
    } finally {
      setEnviandoRecordatorioReportesPushId('');
    }
  }

  async function actualizarVistaEntrenadorCompletaApp() {
    if (cargando) return;

    setCargando(true);
    setError('');
    setDetalle(null);

    try {
      let semanaDisponibilidadObjetivo =
        semanaDisponibilidadVistaEntrenadorInicio;

      if (esEntrenadorApp) {
        const objetivo =
          await ejecutarFuncionAuthJson<{
            semana_inicio: string | null;
          }>('obtener_semana_disponibilidad_objetivo_entrenador_app', {});

        semanaDisponibilidadObjetivo =
          objetivo?.semana_inicio || semanaActualVistaEntrenador;
        setSemanaPublicadaObjetivoEntrenador(
          objetivo?.semana_inicio || ''
        );
        setSemanaEntrenadorSeleccionada(semanaDisponibilidadObjetivo);
      }

      await Promise.all([
        cargarGruposEntrenador(),
        cargarDisponibilidad(semanaDisponibilidadObjetivo || undefined),
      ]);

      if (esEntrenadorApp && semanaVistaEntrenadorInicio) {
        await cargarEstadoSemanaPushEntrenadorApp(semanaVistaEntrenadorInicio);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar la Vista entrenador.'
      );
    } finally {
      setCargando(false);
    }
  }

  useEffect(() => {
    if (!esEntrenadorApp || pantalla !== 'entrenador') return;
    if (typeof window === 'undefined' || typeof document === 'undefined') return;

    let ultimoRefresco = 0;

    const refrescarAlVolver = () => {
      if (document.visibilityState !== 'visible') return;

      const ahora = Date.now();
      if (ahora - ultimoRefresco < 1200) return;
      ultimoRefresco = ahora;

      // Al volver a la PWA reconsultamos la semana de disponibilidad publicada
      // y los grupos. Así el lunes no puede quedarse en pantalla una semana vieja
      // aunque la app llevara abierta desde el domingo o no llegara el Push.
      void cargarGruposEntrenador();
      void cargarDisponibilidad();
    };

    document.addEventListener('visibilitychange', refrescarAlVolver);
    window.addEventListener('focus', refrescarAlVolver);

    return () => {
      document.removeEventListener('visibilitychange', refrescarAlVolver);
      window.removeEventListener('focus', refrescarAlVolver);
    };
  }, [esEntrenadorApp, pantalla]);

  useEffect(() => {
    if (
      !esEntrenadorApp ||
      pantalla !== 'entrenador' ||
      tabVistaEntrenador !== 'disponibilidad'
    ) {
      return;
    }

    const intervalo = window.setInterval(() => {
      void cargarDisponibilidad(undefined, true);
    }, 15000);

    return () => window.clearInterval(intervalo);
  }, [
    esEntrenadorApp,
    pantalla,
    tabVistaEntrenador,
    semanaEntrenadorSeleccionada,
  ]);

  async function cerrarOrganizacionSemanalPushApp(
    semanaForzada?: string
  ) {
    const semanaCierre = semanaForzada || semanaVistaEntrenadorInicio;

    if (!esCoordinadorApp || !semanaCierre || cerrandoSemanaPushApp)
      return;

    const confirmar = window.confirm(
      `¿Cerrar la organización de la semana ${rangoSemanaAgenda(
        semanaCierre
      )} y avisar a los entrenadores?

A quienes tengan grupos se les confirmará que ya están preparados. A quienes no tengan ninguno se les avisará de que esta semana no tienen grupos asignados.`
    );
    if (!confirmar) return;

    setCerrandoSemanaPushApp(true);
    try {
      const resultado = await ejecutarPushMiticoApp('week_groups_closed', {
        semana_inicio: semanaCierre,
      });

      if (resultado.already_closed) {
        alert('Esta semana ya estaba cerrada y los avisos ya se habían procesado.');
      } else {
        alert(
          `Organización semanal cerrada. Entrenadores avisados por push: ${Number(
            resultado.sent || 0
          )}. Sin avisos activados: ${Number(
            resultado.without_subscription || 0
          )}.`
        );
      }
    } catch (errorPush) {
      alert(
        errorPush instanceof Error
          ? errorPush.message
          : 'No se pudo cerrar y avisar la organización semanal.'
      );
    } finally {
      setCerrandoSemanaPushApp(false);
    }
  }

  const disponibilidadVistaEntrenador = disponibilidad.filter((turno) => {
    if (
      !esCoordinadorApp &&
      entrenadorIdSesionApp &&
      turno.entrenador_id !== entrenadorIdSesionApp
    )
      return false;
    if (!esCoordinadorApp && !entrenadorIdSesionApp) return false;
    if (
      semanaDisponibilidadVistaEntrenadorInicio &&
      turno.fecha_inicio !== semanaDisponibilidadVistaEntrenadorInicio
    )
      return false;

    return turno.entrenador
      .toLowerCase()
      .includes(busquedaGrupoEntrenador.toLowerCase());
  });

  const disponibilidadSemanalVistaEntrenador = agruparDisponibilidadSemanal(
    disponibilidadVistaEntrenador
  );

  const gruposVistaEntrenador = selectTrainerVisibleGroups(
    gruposEntrenadorFiltrados,
    alumnosReporteEntrenador,
    semanaVistaEntrenadorInicio
      ? { start: semanaVistaEntrenadorInicio, end: semanaVistaEntrenadorFin }
      : undefined
  );

  const gruposSemanalVistaEntrenador = agruparGruposEntrenadorSemanal(
    gruposVistaEntrenador
  );

  const alumnosVistaEntrenador = selectStudentsForTrainerGroups(
    alumnosReporteEntrenador,
    gruposVistaEntrenador
  );

  function pendientesEntrenadorVista(entrenadorId: string) {
    return pendingStudentsForTrainer(alumnosVistaEntrenador, entrenadorId);
  }

  function gruposSinConfirmarEntrenadorVista(entrenadorId: string) {
    return unconfirmedGroupsForTrainer(gruposVistaEntrenador, entrenadorId);
  }


  function grupoTienePendientesVistaEntrenador(grupo: GrupoEntrenadorApp) {
    if (grupo.estado_confirmacion !== 'Confirmado') return true;
    return alumnosVistaEntrenador.some(
      (alumno) =>
        alumno.grupo_id === grupo.grupo_id &&
        alumno.entrenador_id === grupo.entrenador_id &&
        (alumno.estado_reporte === 'Falta reporte' ||
          alumno.estado_reporte === 'Asistencia sin confirmar' ||
          alumno.estado_asistencia === 'Pendiente')
    );
  }

  const totalGruposTrabajoVisibleVistaEntrenador =
    gruposVistaEntrenador.length;

  const totalTareasPendientesVistaEntrenador = trainerPendingTaskCount(
    gruposVistaEntrenador,
    alumnosVistaEntrenador
  );

  function abrirGrupoDesdeTareaEntrenador(
    grupoId: string,
    entrenadorId: string,
    seccion: 'asistencia' | 'trabajo' | 'observaciones' = 'asistencia',
    reporte?: AlumnoReporteEntrenador
  ) {
    setTabVistaEntrenador('grupos');
    setGrupoActivoEntrenador({
      grupo_id: grupoId,
      entrenador_id: entrenadorId,
    });
    setSeccionGrupoEntrenador(seccion);

    window.setTimeout(() => {
      const grupoDomId = `trainer-group-${entrenadorId}-${grupoId}`.replace(
        /[^a-zA-Z0-9_-]/g,
        '-'
      );
      const objetivo = document.getElementById(grupoDomId);

      if (!objetivo) return;

      let padre = objetivo.parentElement;
      while (padre) {
        if (padre instanceof HTMLDetailsElement) {
          padre.open = true;
        }
        padre = padre.parentElement;
      }

      objetivo.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });

      window.setTimeout(() => {
        irASeccionGrupoEntrenador(seccion, grupoDomId);
        if (reporte) {
          window.setTimeout(() => {
            void abrirFormularioReporte(reporte);
          }, 160);
        }
      }, 140);
    }, 140);
  }

  function abrirTurnoPendienteReporteEntrenador(
    entrenadorId: string,
    fecha: string,
    horaInicio: string,
    horaFin: string
  ) {
    const alumnoPendiente = alumnosVistaEntrenador.find(
      (alumno) =>
        alumno.entrenador_id === entrenadorId &&
        alumno.fecha === fecha &&
        alumno.hora_inicio === horaInicio &&
        alumno.hora_fin === horaFin &&
        alumno.estado_reporte === 'Falta reporte'
    );

    if (!alumnoPendiente) return;

    const grupoPendiente = gruposVistaEntrenador.find(
      (grupo) =>
        grupo.entrenador_id === entrenadorId &&
        grupo.grupo_id === alumnoPendiente.grupo_id
    );

    if (!grupoPendiente) return;

    setTabVistaEntrenador('grupos');
    setGrupoActivoEntrenador({
      grupo_id: grupoPendiente.grupo_id,
      entrenador_id: grupoPendiente.entrenador_id,
    });
    setSeccionGrupoEntrenador('asistencia');

    window.setTimeout(() => {
      const grupoDomId = `trainer-group-${grupoPendiente.entrenador_id}-${grupoPendiente.grupo_id}`.replace(
        /[^a-zA-Z0-9_-]/g,
        '-'
      );
      const objetivo = document.getElementById(grupoDomId);

      if (objetivo) {
        let padre = objetivo.parentElement;
        while (padre) {
          if (padre instanceof HTMLDetailsElement) {
            padre.open = true;
          }
          padre = padre.parentElement;
        }

        objetivo.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 120);
  }

  const gruposSemanaTrabajoVistaEntrenador = gruposVistaEntrenador.filter(
    (grupo) =>
      grupo.fecha >= semanaVistaEntrenadorInicio &&
      grupo.fecha <= semanaVistaEntrenadorFin
  );

  const clavesGruposSemanaTrabajoVistaEntrenador = new Set(
    gruposSemanaTrabajoVistaEntrenador.map(
      (grupo) => `${grupo.entrenador_id}__${grupo.grupo_id}`
    )
  );

  const alumnosSemanaTrabajoVistaEntrenador = alumnosReporteEntrenador.filter(
    (alumno) =>
      clavesGruposSemanaTrabajoVistaEntrenador.has(
        `${alumno.entrenador_id}__${alumno.grupo_id}`
      )
  );

  const totalGruposVistaEntrenador = gruposSemanaTrabajoVistaEntrenador.length;
  const totalReportesVistaEntrenador =
    alumnosSemanaTrabajoVistaEntrenador.filter(
      (alumno) =>
        alumno.estado_reporte === 'Falta reporte' ||
        alumno.estado_reporte === 'Asistencia sin confirmar' ||
        alumno.estado_asistencia === 'Pendiente'
    ).length +
    gruposSemanaTrabajoVistaEntrenador.filter(
      (grupo) => grupo.estado_confirmacion !== 'Confirmado'
    ).length;
  const totalDisponibilidadPendienteVistaEntrenador =
    disponibilidadVistaEntrenador.filter(
      (turno) => (turno.respuesta || 'Pendiente') === 'Pendiente'
    ).length;

  function diasDisponibilidadVistaEntrenador(
    turnos: DisponibilidadEntrenador[]
  ) {
    const mapa = new Map<string, DisponibilidadEntrenador[]>();
    turnos.forEach((turno) => {
      if (!mapa.has(turno.fecha)) mapa.set(turno.fecha, []);
      mapa.get(turno.fecha)!.push(turno);
    });

    return Array.from(mapa.entries())
      .map(([fecha, turnosDia]) => ({
        fecha,
        turnos: turnosDia.sort((a, b) =>
          a.hora_inicio.localeCompare(b.hora_inicio)
        ),
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  function diasGruposVistaEntrenador(grupos: GrupoEntrenadorApp[]) {
    const mapaDias = new Map<
      string,
      Map<string, { hora_inicio: string; hora_fin: string; grupos: GrupoEntrenadorApp[] }>
    >();

    grupos.forEach((grupo) => {
      if (!mapaDias.has(grupo.fecha)) mapaDias.set(grupo.fecha, new Map());
      const claveTurno = `${grupo.hora_inicio.slice(0, 5)}__${grupo.hora_fin.slice(0, 5)}`;
      const turnosDia = mapaDias.get(grupo.fecha)!;
      if (!turnosDia.has(claveTurno)) {
        turnosDia.set(claveTurno, {
          hora_inicio: grupo.hora_inicio.slice(0, 5),
          hora_fin: grupo.hora_fin.slice(0, 5),
          grupos: [],
        });
      }
      turnosDia.get(claveTurno)!.grupos.push(grupo);
    });

    return Array.from(mapaDias.entries())
      .map(([fecha, turnosDia]) => ({
        fecha,
        turnos: Array.from(turnosDia.values()).sort((a, b) =>
          a.hora_inicio.localeCompare(b.hora_inicio)
        ),
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha));
  }

  function alumnosDelGrupo(grupoId: string, entrenadorId: string) {
    return alumnosReporteEntrenador.filter(
      (alumno) =>
        alumno.grupo_id === grupoId && alumno.entrenador_id === entrenadorId
    );
  }

  function alumnosCompletosDelGrupo(grupoId: string) {
    const unicos = new Map<string, AlumnoReporteEntrenador>();
    alumnosReporteEntrenador
      .filter((alumno) => alumno.grupo_id === grupoId)
      .forEach((alumno) => {
        if (!unicos.has(alumno.alumno_id)) unicos.set(alumno.alumno_id, alumno);
      });
    return Array.from(unicos.values()).sort((a, b) =>
      a.alumno.localeCompare(b.alumno, 'es')
    );
  }

  function entrenadoresDelGrupo(grupoId: string) {
    return collectGroupTrainers(grupoId, gruposEntrenador, alumnosReporteEntrenador);
  }

  function nombresEntrenadoresDelGrupo(grupoId: string, fallback?: string | null) {
    return trainerNamesForGroup(
      grupoId,
      gruposEntrenador,
      alumnosReporteEntrenador,
      fallback
    );
  }

  function repartoEntrenadoresDelGrupo(grupoId: string) {
    return trainerStudentDistribution(
      grupoId,
      gruposEntrenador,
      alumnosReporteEntrenador
    );
  }

  function alumnosDelIntensivo(intensivoId: string) {
    return intensivoAlumnos.filter(
      (registro) => registro.intensivo_id === intensivoId
    );
  }

  function resumenAlumnoIntensivo(alumnoId: string) {
    return alumnosResumenVolcado.find(
      (alumno) => alumno.alumno_id === alumnoId
    );
  }

  function diasDelIntensivo(intensivoId: string) {
    return intensivoDias
      .filter((dia) => dia.intensivo_id === intensivoId)
      .slice()
      .sort(
        (a, b) =>
          Number(a.numero_dia || 0) - Number(b.numero_dia || 0) ||
          String(a.fecha || '').localeCompare(String(b.fecha || '')) ||
          String(a.hora_inicio || '').localeCompare(String(b.hora_inicio || ''))
      );
  }

  function asistenciasDelIntensivoDia(intensivoId: string, diaId: string) {
    return intensivoAsistencias.filter(
      (registro) =>
        registro.intensivo_id === intensivoId &&
        registro.intensivo_dia_id === diaId
    );
  }

  function recuperacionesDelIntensivo(intensivoId: string) {
    return intensivoMás.filter(
      (registro) => registro.intensivo_origen_id === intensivoId
    );
  }

  function recomendacionesDeRecuperacion(recuperacionId: string) {
    return recomendacionesRecuperacion
      .filter((item) => item.recuperacion_id === recuperacionId)
      .sort((a, b) => a.orden_recomendacion - b.orden_recomendacion);
  }

  async function aprobarRecuperacionInteligente(
    registro: IntensivoRecuperacionApp,
    recomendacion: RecuperacionRecomendacionApp
  ) {
    const confirmar = window.confirm(
      `¿Aprobar la recuperación de ${registro.alumno} en ${recomendacion.intensivo_destino} · ${recomendacion.nombre_grupo} · ${formatearFecha(recomendacion.fecha)}?`
    );
    if (!confirmar) return;

    setCargando(true);
    setError('');
    try {
      await ejecutarFuncion('asignar_recuperacion_grupo_intensivo_app', {
        p_recuperacion_id: registro.recuperacion_id,
        p_grupo_destino_id: recomendacion.grupo_id,
      });
      await cargarIntensivos();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error aprobando la recuperación');
    }
    setCargando(false);
  }

  function gruposNormalesDelDiaIntensivo(diaId: string) {
    return gruposIntensivoDia.filter(
      (grupo) => grupo.intensivo_dia_id === diaId && grupo.grupo_id
    );
  }

  function resumenReportesDelIntensivo(intensivoId: string) {
    return resumenReportesIntensivo.filter(
      (registro) => registro.intensivo_id === intensivoId
    );
  }

  function resumenFinalDelIntensivo(intensivoId: string) {
    return resumenFinalIntensivo.filter(
      (registro) => registro.intensivo_id === intensivoId
    );
  }

  function reportesDetalleAlumnoIntensivo(
    intensivoId: string,
    alumnoId: string
  ) {
    return reportesDetalleIntensivo.filter(
      (registro) =>
        registro.intensivo_id === intensivoId && registro.alumno_id === alumnoId
    );
  }

  function diaRevisionSugeridoIntensivoApp(intensivoId: string) {
    const dias = diasDelIntensivo(intensivoId)
      .slice()
      .sort((a, b) => a.numero_dia - b.numero_dia);

    const revisables = dias.filter((dia) => dia.numero_dia >= 2);
    if (revisables.length === 0) return '';

    const reportesCurso = reportesDetalleIntensivo.filter(
      (reporte) => reporte.intensivo_id === intensivoId
    );

    const ultimoDiaReportado = reportesCurso.reduce(
      (maximo, reporte) =>
        Math.max(maximo, Number(reporte.numero_dia || 0)),
      0
    );

    const numeroObjetivo =
      ultimoDiaReportado <= 0
        ? 2
        : Math.min(4, ultimoDiaReportado + 1);

    return (
      revisables.find((dia) => dia.numero_dia === numeroObjetivo)
        ?.intensivo_dia_id ||
      revisables[0]?.intensivo_dia_id ||
      ''
    );
  }

  function panelControlDelIntensivo(intensivoId: string) {
    return panelControlIntensivo.find(
      (registro) => registro.intensivo_id === intensivoId
    );
  }

  function cerrarPanelesIntensivo() {
    setGestionarPanelControlIntensivoId(null);
    setDiaActivoIntensivoId(null);
    setDiaEditandoIntensivoId(null);
    setGestionarAlumnosIntensivoId(null);
    setMostrarVolcadoIntensivoId(null);
    setGestionarGruposIntensivoId(null);
    setGestionarAsistenciaIntensivoId(null);
    setGestionarMásIntensivoId(null);
    setGestionarDiplomasIntensivoId(null);
    setRevisionIntensivoId('');
    setRevisionIntensivoDiaId('');
    setRevisionIntensivoSugerencias([]);
    setRevisionIntensivoAnalizado(false);
    setTextoVolcadoIntensivo('');
    setResultadoVolcadoIntensivo([]);
  }

  function scrollPanelIntensivoApp(intensivoId: string) {
    window.setTimeout(() => {
      document
        .getElementById(`intensivo-panel-activo-${intensivoId}`)
        ?.scrollIntoView({
          behavior: 'smooth',
          block: 'start',
        });
    }, 100);
  }

  function abrirPanelIntensivo(
    intensivo: IntensivoApp,
    panel:
      | 'control'
      | 'dias'
      | 'alumnos'
      | 'grupos'
      | 'revision'
      | 'asistencia'
      | 'recuperaciones'
      | 'diplomas'
  ) {
    const intensivoId = intensivo.intensivo_id;
    const yaAbierto =
      (panel === 'control' &&
        gestionarPanelControlIntensivoId === intensivoId) ||
      (panel === 'dias' && diaActivoIntensivoId === intensivoId) ||
      (panel === 'alumnos' && gestionarAlumnosIntensivoId === intensivoId) ||
      (panel === 'grupos' && gestionarGruposIntensivoId === intensivoId) ||
      (panel === 'revision' && revisionIntensivoId === intensivoId) ||
      (panel === 'asistencia' &&
        gestionarAsistenciaIntensivoId === intensivoId) ||
      (panel === 'recuperaciones' && gestionarMásIntensivoId === intensivoId) ||
      (panel === 'diplomas' && gestionarDiplomasIntensivoId === intensivoId);

    cerrarPanelesIntensivo();

    if (yaAbierto) return;

    if (panel === 'control') {
      setGestionarPanelControlIntensivoId(intensivoId);
      scrollPanelIntensivoApp(intensivoId);
      return;
    }

    if (panel === 'dias') {
      setDiaActivoIntensivoId(intensivoId);
      setFormDiaIntensivo(diaIntensivoInicial());
      scrollPanelIntensivoApp(intensivoId);
      return;
    }

    if (panel === 'alumnos') {
      setGestionarAlumnosIntensivoId(intensivoId);
      setAlumnoSeleccionadoIntensivoId('');
      setBusquedaAlumnoIntensivo('');
      scrollPanelIntensivoApp(intensivoId);
      return;
    }

    if (panel === 'grupos') {
      const primerDia = diasDelIntensivo(intensivoId)[0];
      const alumnosIds = alumnosDelIntensivo(intensivoId).map(
        (registro) => registro.alumno_id
      );
      setGestionarGruposIntensivoId(intensivoId);
      setDiaGrupoSeleccionadoId(primerDia?.intensivo_dia_id || '');
      setFormGrupoIntensivo({
        ...grupoIntensivoInicial(),
        alumnos_ids: alumnosIds,
      });
      setRecomendacionesGrupoIntensivo([]);
      setEntrenadoresPorGrupoRecomendado({});
      setDestinoAlumnoRecomendado({});
      setTrabajoDiarioPorGrupoRecomendado({});
      setObservacionesPorGrupoRecomendado({});
      setGruposExtraIntensivoPorDia({});
      scrollPanelIntensivoApp(intensivoId);
      return;
    }

    if (panel === 'revision') {
      setRevisionIntensivoId(intensivoId);
      setRevisionIntensivoDiaId(
        diaRevisionSugeridoIntensivoApp(intensivoId)
      );
      setRevisionIntensivoSugerencias([]);
      setRevisionIntensivoAnalizado(false);
      scrollPanelIntensivoApp(intensivoId);
      return;
    }

    if (panel === 'asistencia') {
      const primerDia = diasDelIntensivo(intensivoId)[0];
      setGestionarAsistenciaIntensivoId(intensivoId);
      setDiaAsistenciaSeleccionadoId(primerDia?.intensivo_dia_id || '');
      scrollPanelIntensivoApp(intensivoId);
      return;
    }

    if (panel === 'recuperaciones') {
      setGestionarMásIntensivoId(intensivoId);
      scrollPanelIntensivoApp(intensivoId);
      return;
    }

    if (panel === 'diplomas') {
      setGestionarDiplomasIntensivoId(intensivoId);
      scrollPanelIntensivoApp(intensivoId);
    }
  }

  function codigoNivelPorId(nivelId: string | null) {
    if (!nivelId) return '-';
    return (
      nivelesDiplomaIntensivo.find((nivel) => nivel.id === nivelId)?.codigo ||
      '-'
    );
  }

  function entrenadoresActivosParaIntensivo() {
    return entrenadores
      .filter((entrenador) => entrenador.activo)
      .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo));
  }

  function alumnosDisponiblesParaIntensivo(intensivoId: string) {
    const alumnosYaInscritos = new Set(
      alumnosDelIntensivo(intensivoId).map((registro) => registro.alumno_id)
    );

    const busqueda = busquedaAlumnoIntensivo.trim().toLowerCase();

    return alumnosParaIntensivo
      .filter((alumno) => !alumnosYaInscritos.has(alumno.alumno_id))
      .filter((alumno) =>
        busqueda ? alumno.alumno.toLowerCase().includes(busqueda) : true
      )
      .slice(0, 80);
  }

  function formularioAbierto(alumno: AlumnoReporteEntrenador) {
    return (
      reporteActivo?.grupo_id === alumno.grupo_id &&
      reporteActivo?.alumno_id === alumno.alumno_id &&
      reporteActivo?.entrenador_id === alumno.entrenador_id
    );
  }

  const alumnoReporteActivo = reporteActivo
    ? alumnosReporteEntrenador.find(
        (alumno) =>
          alumno.grupo_id === reporteActivo.grupo_id &&
          alumno.alumno_id === reporteActivo.alumno_id &&
          alumno.entrenador_id === reporteActivo.entrenador_id
      ) || null
    : null;

  const grupoReporteActivo = reporteActivo
    ? gruposEntrenador.find((grupo) => grupo.grupo_id === reporteActivo.grupo_id) || null
    : null;


  function calcularEstadoPlanning(grupo: GrupoPlanning) {
    return planningGroupStatus(
      grupo,
      alumnosReporteEntrenador,
      gruposEntrenador
    );
  }

  const planningFiltrado = planning.filter((grupo) => {
    const estado = calcularEstadoPlanning(grupo);

    if (filtroPlanning === 'sin_publicar') return estado === 'Sin publicar';
    if (filtroPlanning === 'cerrados') return estado === 'Grupo cerrado';
    if (filtroPlanning === 'pendientes') {
      return estado !== 'Grupo cerrado' && estado !== 'Sin publicar';
    }

    return true;
  });

  const totalPlanningPendientes = planning.filter((grupo) => {
    const estado = calcularEstadoPlanning(grupo);
    return estado !== 'Grupo cerrado' && estado !== 'Sin publicar';
  }).length;

  const totalPlanningCerrados = planning.filter(
    (grupo) => calcularEstadoPlanning(grupo) === 'Grupo cerrado'
  ).length;

  const totalPlanningSinPublicar = planning.filter(
    (grupo) => calcularEstadoPlanning(grupo) === 'Sin publicar'
  ).length;

  function sesionesDelDiaAgenda(fecha: string) {
    return sesionesAgenda.filter((sesion) => sesion.fecha === fecha);
  }

  function abrirSesionAgenda(
    sesion: SesionAgendaOperativa,
    panel: 'alumnos' | 'grupos'
  ) {
    if (sesion.origen === 'operativa' && sesion.agendaDirecta) {
      setAgendaDiaCompactoActivo(sesion.fecha);
      setAgendaFormularioAbierto(false);

      void cargarDisponibilidadSesionAgenda(
        sesion.agendaDirecta.sesion_id,
        sesion.fecha,
        sesion.hora_inicio,
        sesion.hora_fin
      );

      cargarDetalleSesionAgenda(sesion.agendaDirecta.sesion_id);
      return;
    }

    if (sesion.origen === 'intensivo' && sesion.intensivo && sesion.dia) {
      if (panel === 'alumnos') abrirPanelIntensivo(sesion.intensivo, 'alumnos');
      if (panel === 'grupos') {
        abrirPanelIntensivo(sesion.intensivo, 'grupos');
        setDiaGrupoSeleccionadoId(sesion.dia.intensivo_dia_id);
      }
      setPantalla('intensivos');
      return;
    }

    setPantalla('agenda');
  }

  function gruposTextoResumenSesion(sesion: SesionAgendaOperativa) {
    if (sesion.origen === 'intensivo') {
      return sesion.grupos
        .filter((grupo) => grupo.grupo_id)
        .map(
          (grupo, indice) =>
            `${nombreGrupoVisualApp(grupo, indice)} · ${
              grupo.entrenador || 'Pendiente entrenador'
            } · ${esNombreGrupoParticularApp(grupo.nombre_grupo) ? 'CON JOSE' : `Punto ${grupo.punto_encuentro || '-'}`}`
        )
        .join(' || ');
    }

    if (sesion.planningGrupos.length > 0) {
      return sesion.planningGrupos
        .map(
          (grupo, indice) =>
            `${nombreGrupoVisualApp(grupo, indice)} · ${
              grupo.entrenadores || 'Pendiente entrenador'
            } · ${esNombreGrupoParticularApp(grupo.nombre_grupo) ? 'CON JOSE' : `Punto ${grupo.punto_encuentro || '-'}`}`
        )
        .join(' || ');
    }

    if (sesion.agendaDirecta) {
      return agendaGruposSesion
        .filter((grupo) => grupo.sesion_id === sesion.agendaDirecta?.sesion_id)
        .map(
          (grupo, indice) =>
            `${nombreGrupoVisualApp(grupo, indice)} · ${
              grupo.entrenador || 'Pendiente entrenador'
            } · ${esNombreGrupoParticularApp(grupo.nombre_grupo) ? 'CON JOSE' : `Punto ${grupo.punto_encuentro || '-'}`}`
        )
        .join(' || ');
    }

    return '';
  }

  function limitesSnowZoneSeleccionados() {
    if (snowZoneModo === 'semanal') {
      const inicio = snowZoneSemanaInicio || fechaIsoHoyApp();
      return {
        desde: inicio,
        hasta: sumarDiasEditor(inicio, 6),
      };
    }

    const mes = snowZoneMes || fechaIsoHoyApp().slice(0, 7);
    const [anio, numeroMes] = mes.split('-').map(Number);
    const primerDia = `${anio}-${String(numeroMes).padStart(2, '0')}-01`;
    const ultimo = new Date(anio, numeroMes, 0);
    return {
      desde: primerDia,
      hasta: fechaIsoEditor(ultimo),
    };
  }

  function tituloPeriodoSnowZone() {
    const { desde, hasta } = limitesSnowZoneSeleccionados();

    if (snowZoneModo === 'mensual') {
      const [anio, mes] = snowZoneMes.split('-').map(Number);
      const nombre = new Intl.DateTimeFormat('es-ES', {
        month: 'long',
      }).format(new Date(anio, mes - 1, 1));

      return {
        titulo: `${nombre.charAt(0).toUpperCase()}${nombre.slice(1)} ${anio}`,
        periodo: `${formatearFecha(desde)} al ${formatearFecha(hasta)}`,
      };
    }

    return {
      titulo: 'Informe semanal SnowZone',
      periodo: `${formatearFecha(desde)} al ${formatearFecha(hasta)}`,
    };
  }

  async function cargarInformeSnowZone() {
    if (!esCoordinadorJefeApp) return;

    const { desde, hasta } = limitesSnowZoneSeleccionados();
    setSnowZoneCargando(true);
    setSnowZoneError('');

    try {
      const data = await ejecutarFuncionConRespuesta<SnowZoneDiaApp>(
        'obtener_informe_snowzone_app',
        {
          p_desde: desde,
          p_hasta: hasta,
        }
      );
      setSnowZoneDias(
        data.map((fila) => ({
          ...fila,
          pista_pequena: Number(fila.pista_pequena || 0),
          pista_grande: Number(fila.pista_grande || 0),
          total: Number(fila.total || 0),
        }))
      );
    } catch (err) {
      setSnowZoneDias([]);
      setSnowZoneError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar el informe SnowZone.'
      );
    } finally {
      setSnowZoneCargando(false);
    }
  }

  function descargarInformeSnowZoneExcel() {
    const { desde, hasta } = limitesSnowZoneSeleccionados();

    if (snowZoneDias.length === 0) {
      setSnowZoneError('No hay datos SnowZone para descargar en este periodo.');
      return;
    }

    const totalPequena = snowZoneDias.reduce(
      (total, fila) => total + Number(fila.pista_pequena || 0),
      0
    );
    const totalGrande = snowZoneDias.reduce(
      (total, fila) => total + Number(fila.pista_grande || 0),
      0
    );
    const totalGeneral = totalPequena + totalGrande;

    const escaparCsv = (valor: unknown) => {
      const texto = String(valor ?? '');
      return `"${texto.replace(/"/g, '""')}"`;
    };

    const cabeceraPeriodo = tituloPeriodoSnowZone();

    const filasCsv: Array<Array<string | number>> = [
      [`SNOWZONE · ${cabeceraPeriodo.titulo}`],
      [`Periodo: ${cabeceraPeriodo.periodo}`],
      [],
      ['Fecha', 'Pista pequeña', 'Pista grande', 'Total'],
      ...snowZoneDias.map((fila) => [
        formatearFecha(fila.fecha),
        fila.pista_pequena,
        fila.pista_grande,
        fila.total,
      ]),
      ['TOTAL', totalPequena, totalGrande, totalGeneral],
    ];

    const csv =
      '\uFEFF' +
      filasCsv
        .map((fila) => fila.map(escaparCsv).join(';'))
        .join('\r\n');

    descargarTextoComoArchivo(
      `snowzone_${snowZoneModo}_${desde}_${hasta}.csv`,
      csv,
      'text/csv;charset=utf-8'
    );
  }


  async function cargarCandidatosEquipo() {
    if (!esCoordinadorJefeApp) return;

    setCandidatosEquipoCargando(true);
    setCandidatosEquipoError('');

    try {
      const data = await ejecutarFuncionConRespuesta<CandidatoEquipoApp>(
        'obtener_candidatos_equipo_baby_app'
      );

      setCandidatosEquipo(
        data.map((fila) => ({
          ...fila,
          orden_nivel: Number(fila.orden_nivel || 0),
          entrenamientos_baby: Number(fila.entrenamientos_baby || 0),
          meses_activos_baby: Number(fila.meses_activos_baby || 0),
          remontes: Array.isArray(fila.remontes) ? fila.remontes : [],
        }))
      );
      setCandidatosEquipoGenerado(true);
    } catch (err) {
      setCandidatosEquipo([]);
      setCandidatosEquipoGenerado(false);
      setCandidatosEquipoError(
        err instanceof Error
          ? err.message
          : 'No se pudo generar el informe de candidatos a equipo.'
      );
    } finally {
      setCandidatosEquipoCargando(false);
    }
  }

  function descargarCandidatosEquipoExcel() {
    if (candidatosEquipo.length === 0) {
      setCandidatosEquipoError('No hay candidatos para descargar.');
      return;
    }

    const escaparCsv = (valor: unknown) => {
      const texto = String(valor ?? '');
      return `"${texto.replace(/"/g, '""')}"`;
    };

    const temporada = candidatosEquipo[0]?.temporada || 'temporada';
    const filas: Array<Array<string | number>> = [
      [`CANDIDATOS EQUIPO · BABY · ${temporada}`],
      ['Solo alumnos Baby con nivel real B o superior'],
      [],
      [
        'Nivel',
        'Alumno',
        'Entrenamientos Baby',
        'Meses activos',
        'Último entreno Baby',
        'Último reporte técnico',
        'Autonomía',
        'Remontes',
        'Actitud',
        'Técnica',
        'Pista',
        'Recomendación',
      ],
      ...candidatosEquipo.map((fila) => [
        fila.nivel,
        fila.alumno,
        fila.entrenamientos_baby,
        fila.meses_activos_baby,
        fila.ultimo_entreno_baby ? formatearFecha(fila.ultimo_entreno_baby) : '',
        fila.ultimo_reporte_fecha ? formatearFecha(fila.ultimo_reporte_fecha) : '',
        fila.autonomia || '',
        (fila.remontes || []).join(', '),
        fila.actitud || '',
        fila.tecnica || '',
        fila.pista || '',
        fila.recomendacion || '',
      ]),
    ];

    const csv =
      '\uFEFF' +
      filas.map((fila) => fila.map(escaparCsv).join(';')).join('\r\n');

    descargarTextoComoArchivo(
      `candidatos_equipo_baby_${temporada.replace(/[^0-9A-Za-z_-]/g, '-')}.csv`,
      csv,
      'text/csv;charset=utf-8'
    );
  }

  async function cargarListadoAlumnosTemporada(
    tipo: TipoListadoAlumnosApp = tipoListadoAlumnos
  ) {
    if (!esCoordinadorJefeApp) return;

    setListadoAlumnosCargando(true);
    setListadoAlumnosError('');
    setTipoListadoAlumnos(tipo);

    try {
      const data = await ejecutarFuncionConRespuesta<ListadoAlumnoTemporadaApp>(
        'obtener_listado_alumnos_temporada_app',
        { p_tipo: tipo }
      );

      setListadoAlumnosTemporada(
        data.map((fila) => ({
          ...fila,
          total_entrenamientos: Number(fila.total_entrenamientos || 0),
        }))
      );
      setListadoAlumnosGenerado(true);
    } catch (err) {
      setListadoAlumnosTemporada([]);
      setListadoAlumnosGenerado(false);
      setListadoAlumnosError(
        err instanceof Error
          ? err.message
          : 'No se pudo generar el listado de alumnos.'
      );
    } finally {
      setListadoAlumnosCargando(false);
    }
  }

  function descargarListadoAlumnosTemporada() {
    if (listadoAlumnosTemporada.length === 0) {
      setListadoAlumnosError('No hay alumnos para descargar en este listado.');
      return;
    }

    const escaparCsv = (valor: unknown) => {
      const texto = String(valor ?? '');
      return `"${texto.replace(/"/g, '""')}"`;
    };

    const temporada = listadoAlumnosTemporada[0]?.temporada || 'temporada';
    const tituloTipo =
      tipoListadoAlumnos === 'TODOS'
        ? 'TODOS LOS ALUMNOS'
        : tipoListadoAlumnos;

    const filas: Array<Array<string | number>> = [
      [`LISTADO ${tituloTipo} · ${temporada}`],
      ['Solo actividad real de la temporada activa'],
      [],
      [
        'Alumno',
        'Último nivel real',
        'Pista',
        'Último entrenamiento',
        'Entrenamientos temporada',
        'Última modalidad',
        'Último intensivo',
      ],
      ...listadoAlumnosTemporada.map((fila) => [
        fila.alumno,
        fila.nivel || '',
        fila.pista || '',
        fila.ultimo_entreno ? formatearFecha(fila.ultimo_entreno) : '',
        fila.total_entrenamientos,
        fila.modalidad || '',
        fila.ultimo_intensivo || '',
      ]),
    ];

    const csv =
      '\uFEFF' +
      filas.map((fila) => fila.map(escaparCsv).join(';')).join('\r\n');

    descargarTextoComoArchivo(
      `listado_${tipoListadoAlumnos.toLowerCase()}_${temporada.replace(
        /[^0-9A-Za-z_-]/g,
        '-'
      )}.csv`,
      csv,
      'text/csv;charset=utf-8'
    );
  }

  function diaOcioAlumnoEvaluacionApp(alumnoId: string) {
    return (
      ocioAlumnos.find((alumno) => alumno.alumno_id === alumnoId)?.dia_fijo ||
      ocioAlumnos.find((alumno) => alumno.alumno_id === alumnoId)?.grupo_dia ||
      ''
    );
  }

  function filasEvaluacionTemporadaOcioApp() {
    const mapa = new Map(
      evaluacionesAnualesOcio.map((evaluacion) => [evaluacion.alumno_id, evaluacion])
    );

    return ocioAlumnos
      .filter((alumno) => {
        if (filtroDiaEvaluacionesOcio === 'Todos') return true;
        return (
          textoSinAcentosGrupoApp(alumno.dia_fijo || alumno.grupo_dia || '') ===
          textoSinAcentosGrupoApp(filtroDiaEvaluacionesOcio)
        );
      })
      .map((alumno) => ({
        alumno,
        evaluacion: mapa.get(alumno.alumno_id) || null,
      }))
      .sort((a, b) => (a.alumno.alumno || '').localeCompare(b.alumno.alumno || ''));
  }

  async function cargarCortesEvaluacionOcio() {
    if (!esCoordinadorJefeApp) return;
    setCortesEvaluacionOcioCargando(true);
    setCortesEvaluacionOcioError('');
    try {
      const data = await ejecutarFuncionConRespuesta<CorteEvaluacionOcioApp>(
        'obtener_cortes_evaluacion_ocio_app',
        {}
      );
      setCortesEvaluacionOcio(
        data.map((fila) => ({
          ...fila,
          reportes_ocio: Number(fila.reportes_ocio || 0),
        }))
      );
    } catch (err) {
      setCortesEvaluacionOcio([]);
      setCortesEvaluacionOcioError(
        err instanceof Error
          ? err.message
          : 'No se pudo consultar el estado de los cortes de Ocio.'
      );
    } finally {
      setCortesEvaluacionOcioCargando(false);
    }
  }

  async function guardarCorteEvaluacionOcio(corte: 'NAVIDAD' | 'FINAL') {
    if (!esCoordinadorJefeApp || !evaluacionesAnualesOcioGeneradas) return;
    const corteValidado = requireEvaluationCut(corte);

    const existentes = cortesEvaluacionOcio.filter((fila) => fila.corte === corteValidado).length;
    const mensaje = existentes > 0
      ? `Ya hay ${existentes} evaluaciones guardadas en el corte ${corteValidado}. Si continúas se actualizará ese mismo corte con la información actual. ¿Continuar?`
      : `Se guardará el corte ${corteValidado} de todos los alumnos de Ocio de la temporada activa. El filtro de día solo organiza la pantalla y no limita el guardado. ¿Continuar?`;

    if (!window.confirm(mensaje)) return;

    setGuardandoCorteEvaluacionOcio(corteValidado);
    setCortesEvaluacionOcioError('');
    try {
      const resultado = await ejecutarFuncionConRespuesta<{ guardados: number }>(
        'guardar_corte_evaluacion_ocio_app',
        { p_corte: corteValidado }
      );
      await cargarCortesEvaluacionOcio();
      alert(
        `Corte ${corteValidado} guardado correctamente · ${Number(
          resultado[0]?.guardados || 0
        )} alumnos.`
      );
    } catch (err) {
      setCortesEvaluacionOcioError(
        err instanceof Error
          ? err.message
          : `No se pudo guardar el corte ${corteValidado}.`
      );
    } finally {
      setGuardandoCorteEvaluacionOcio('');
    }
  }

  async function cargarEvaluacionesAnualesOcio() {
    if (!esCoordinadorJefeApp) return;

    setEvaluacionesAnualesOcioCargando(true);
    setEvaluacionesAnualesOcioError('');

    try {
      const data = await ejecutarFuncionConRespuesta<EvaluacionAnualOcioApp>(
        'obtener_evaluacion_anual_ocio_app'
      );

      setEvaluacionesAnualesOcio(data.map(normalizeAnnualOcioEvaluation));
      setEvaluacionesAnualesOcioGeneradas(true);
      await cargarCortesEvaluacionOcio();
    } catch (err) {
      setEvaluacionesAnualesOcio([]);
      setEvaluacionesAnualesOcioGeneradas(false);
      setEvaluacionesAnualesOcioError(
        err instanceof Error
          ? err.message
          : 'No se pudo generar la evaluación anual de Ocio.'
      );
    } finally {
      setEvaluacionesAnualesOcioCargando(false);
    }
  }

  function descargarEvaluacionesAnualesOcio() {
    if (!evaluacionesAnualesOcioGeneradas) {
      setEvaluacionesAnualesOcioError(
        'Primero genera las evaluaciones de temporada.'
      );
      return;
    }

    const filasBase = filasEvaluacionTemporadaOcioApp();
    if (filasBase.length === 0) {
      setEvaluacionesAnualesOcioError(
        'No hay alumnos de Ocio en el filtro seleccionado.'
      );
      return;
    }

    const escaparCsv = (valor: unknown) => {
      const texto = String(valor ?? '');
      return `"${texto.replace(/"/g, '""')}"`;
    };

    const temporada = evaluacionesAnualesOcio[0]?.temporada || 'temporada-activa';
    const filas: Array<Array<string | number>> = [
      [`EVALUACIONES DE TEMPORADA OCIO · ${temporada}`],
      [`Filtro: ${filtroDiaEvaluacionesOcio}`],
      [
        'Base técnica para coordinación. Cada informe para familias sigue siendo individual.',
      ],
      [],
      [
        'Alumno',
        'Día Ocio',
        'Entrenamientos Ocio',
        'Sesiones Ocio registradas',
        'Asistencia Ocio %',
        'Reportes Ocio',
        'Primer reporte',
        'Último reporte',
        'Nivel inicial',
        'Nivel corte',
        'Progresión niveles',
        'Técnica inicial',
        'Técnica corte',
        'Autonomía inicial',
        'Autonomía corte',
        'Remontes iniciales',
        'Remontes corte',
        'Actitud corte',
        'Pista corte',
        'Recomendación corte',
        'Comentario técnico',
        'Comentario autonomía',
        'Trabajo diario realizado',
        'Observaciones individuales',
        'Observaciones de grupo',
        'Mejoras reportadas',
        'Nivel Navidad',
        'Técnica Navidad',
        'Autonomía Navidad',
        'Remontes Navidad',
      ],
      ...filasBase.map(({ alumno, evaluacion }) => [
        alumno.alumno,
        alumno.dia_fijo || alumno.grupo_dia || '',
        evaluacion?.entrenamientos_ocio || 0,
        evaluacion?.sesiones_ocio_programadas || 0,
        evaluacion?.asistencia_ocio_pct ?? '',
        evaluacion?.reportes_ocio || 0,
        evaluacion?.primer_reporte_fecha
          ? formatearFecha(evaluacion.primer_reporte_fecha)
          : '',
        evaluacion?.ultimo_reporte_fecha
          ? formatearFecha(evaluacion.ultimo_reporte_fecha)
          : '',
        evaluacion?.nivel_inicial || '',
        evaluacion?.nivel_final || '',
        evaluacion?.niveles_reportados || '',
        evaluacion?.tecnica_inicial || '',
        evaluacion?.tecnica_final || '',
        evaluacion?.autonomia_inicial || '',
        evaluacion?.autonomia_final || '',
        (evaluacion?.remontes_iniciales || []).join(', '),
        (evaluacion?.remontes_finales || []).join(', '),
        evaluacion?.actitud_final || '',
        evaluacion?.pista_final || '',
        evaluacion?.recomendacion_final || '',
        evaluacion?.comentario_tecnica_final || '',
        evaluacion?.comentario_autonomia_final || '',
        evaluacion?.trabajos_realizados || '',
        evaluacion?.observaciones_reportes || '',
        evaluacion?.observaciones_grupo || '',
        evaluacion?.mejoras_reportadas || '',
        evaluacion?.nivel_navidad || '',
        evaluacion?.tecnica_navidad || '',
        evaluacion?.autonomia_navidad || '',
        (evaluacion?.remontes_navidad || []).join(', '),
      ]),
    ];

    const csv =
      '\uFEFF' +
      filas.map((fila) => fila.map(escaparCsv).join(';')).join('\r\n');

    descargarTextoComoArchivo(
      `evaluaciones_ocio_${filtroDiaEvaluacionesOcio.toLowerCase()}_${temporada.replace(
        /[^0-9A-Za-z_-]/g,
        '-'
      )}.csv`,
      csv,
      'text/csv;charset=utf-8'
    );
  }

  function abrirInformeFamiliaOcioApp(fila: EvaluacionAnualOcioApp) {
    if (typeof window === 'undefined') return;
    const ventana = window.open('', '_blank');
    if (!ventana) {
      setEvaluacionesAnualesOcioError(
        'El navegador ha bloqueado la ventana del informe. Permite ventanas emergentes para Mítico Baby y vuelve a intentarlo.'
      );
      return;
    }
    const alumno = ocioAlumnos.find((item) => item.alumno_id === fila.alumno_id);
    const html = buildOcioFamilyEvaluationHtml(fila, {
      age: calculateAge(alumno?.fecha_nacimiento),
      formatDate: formatearFecha,
    });
    ventana.document.open();
    ventana.document.write(html);
    ventana.document.close();
  }

  async function analizarCierreTemporada() {
    if (!esCoordinadorJefeApp) return;

    setCierreTemporadaCargando(true);
    setCierreTemporadaError('');

    try {
      const [alumnos, resumen] = await Promise.all([
        ejecutarFuncionConRespuesta<CierreTemporadaAlumnoApp>(
          'obtener_cierre_temporada_alumnos_v2_app'
        ),
        ejecutarFuncionConRespuesta<ResumenCierreTemporadaApp>(
          'obtener_resumen_cierre_temporada_app'
        ),
      ]);

      setCierreTemporadaAlumnos(normalizeSeasonClosureStudents(alumnos));

      const r = resumen[0] || null;
      setResumenCierreTemporada(normalizeSeasonClosureSummary(r));
      setCierreTemporadaAnalizado(true);
    } catch (err) {
      setCierreTemporadaAlumnos([]);
      setResumenCierreTemporada(null);
      setCierreTemporadaAnalizado(false);
      setCierreTemporadaError(
        err instanceof Error
          ? err.message
          : 'No se pudo analizar el cierre de temporada.'
      );
    } finally {
      setCierreTemporadaCargando(false);
    }
  }

  function descargarCopiaMaestraTemporada() {
    const filasConservar = cierreTemporadaAlumnos.filter(
      (fila) => fila.conservar_siguiente
    );

    if (filasConservar.length === 0) {
      setCierreTemporadaError(
        'No hay alumnos preparados para la copia maestra de la siguiente temporada.'
      );
      return;
    }

    const escaparCsv = (valor: unknown) => {
      const texto = String(valor ?? '');
      return `"${texto.replace(/"/g, '""')}"`;
    };

    const temporada = filasConservar[0]?.temporada || 'temporada';
    const filas: Array<Array<string | number>> = [
      [`COPIA MAESTRA FIN DE TEMPORADA · ${temporada}`],
      ['Base ligera para preparar la siguiente temporada'],
      [],
      [
        'Alumno ID',
        'Alumno',
        'Fecha nacimiento',
        'Teléfono',
        'Último nivel real',
        'Pista',
        'Último entrenamiento',
        'Última modalidad',
        'Entrenamientos temporada',
        'Última recomendación técnica',
      ],
      ...filasConservar.map((fila) => [
        fila.alumno_id,
        fila.alumno,
        fila.fecha_nacimiento ? formatearFecha(fila.fecha_nacimiento) : '',
        fila.telefono || '',
        fila.ultimo_nivel_real || '',
        fila.ultima_pista || '',
        fila.ultimo_entreno ? formatearFecha(fila.ultimo_entreno) : '',
        fila.ultima_modalidad || '',
        fila.entrenamientos_temporada,
        fila.ultima_recomendacion || '',
      ]),
    ];

    const csv =
      '\uFEFF' + filas.map((fila) => fila.map(escaparCsv).join(';')).join('\r\n');

    descargarTextoComoArchivo(
      `copia_maestra_${temporada.replace(/[^0-9A-Za-z_-]/g, '-')}.csv`,
      csv,
      'text/csv;charset=utf-8'
    );
  }

  function parsearLineaCsvCopiaMaestra(linea: string) {
    const celdas: string[] = [];
    let actual = '';
    let entreComillas = false;

    for (let i = 0; i < linea.length; i += 1) {
      const caracter = linea[i];

      if (caracter === '"') {
        if (entreComillas && linea[i + 1] === '"') {
          actual += '"';
          i += 1;
        } else {
          entreComillas = !entreComillas;
        }
      } else if (caracter === ';' && !entreComillas) {
        celdas.push(actual);
        actual = '';
      } else {
        actual += caracter;
      }
    }

    celdas.push(actual);
    return celdas.map((valor) => valor.trim());
  }

  async function cargarCopiaMaestraParaRevisar(archivo: File | null) {
    setErrorCopiaMaestraImport('');
    setFilasCopiaMaestraImport([]);
    setArchivoCopiaMaestraNombre('');
    setTemporadaOrigenCopiaMaestra('');

    if (!archivo) return;

    if (!archivo.name.toLowerCase().endsWith('.csv')) {
      setErrorCopiaMaestraImport(
        'Selecciona un archivo CSV compatible con la copia maestra o la semilla de temporada.'
      );
      return;
    }

    try {
      const texto = (await archivo.text()).replace(/^\uFEFF/, '');
      const lineas = texto.split(/\r?\n/).filter((linea) => linea.trim());

      if (lineas.length < 2) {
        throw new Error('El CSV está vacío o no contiene alumnos.');
      }

      let indiceCabecera = -1;
      let tipoCsv: 'MAESTRA' | 'SEMILLA_SIMPLE' | '' = '';

      for (let i = 0; i < lineas.length; i += 1) {
        const columnas = parsearLineaCsvCopiaMaestra(lineas[i]).map(
          normalizarCabeceraCsvTemporada
        );

        const esMaestra =
          columnas.includes('alumno') &&
          columnas.includes('fecha nacimiento') &&
          columnas.some((columna) =>
            ['ultimo nivel real', 'nivel'].includes(columna)
          );

        const esSemillaSimple =
          columnas.includes('nombre apellidos') &&
          columnas.includes('nivel') &&
          columnas.includes('telefono') &&
          columnas.includes('fecha nacimiento');

        if (esSemillaSimple) {
          indiceCabecera = i;
          tipoCsv = 'SEMILLA_SIMPLE';
          break;
        }

        if (esMaestra) {
          indiceCabecera = i;
          tipoCsv = 'MAESTRA';
          break;
        }
      }

      if (indiceCabecera < 0 || !tipoCsv) {
        throw new Error(
          'El CSV no coincide con la copia maestra de la app ni con la semilla nombre/nivel/teléfono/fecha.'
        );
      }

      const cabeceraOriginal = parsearLineaCsvCopiaMaestra(
        lineas[indiceCabecera]
      );
      const cabecera = cabeceraOriginal.map(normalizarCabeceraCsvTemporada);
      const indice = (nombres: string[]) =>
        cabecera.findIndex((columna) => nombres.includes(columna));
      const valor = (columnas: string[], nombres: string[]) => {
        const i = indice(nombres);
        return i >= 0 ? (columnas[i] || '').trim() : '';
      };

      const textoPrevioCabecera = lineas.slice(0, indiceCabecera).join(' ');
      const temporadaEnContenido = textoPrevioCabecera.match(
        /COPIA\s+MAESTRA\s+FIN\s+DE\s+TEMPORADA\s*[·:-]?\s*([0-9]{4}\s*[\/-]\s*[0-9]{2,4})/i
      )?.[1];

      setTemporadaOrigenCopiaMaestra(
        (temporadaEnContenido || 'importación externa')
          .replace(/\s+/g, '')
          .replace('-', '/')
      );

      const filas = lineas.slice(indiceCabecera + 1).map((linea) => {
        const columnas = parsearLineaCsvCopiaMaestra(linea);

        const alumnoId =
          tipoCsv === 'MAESTRA'
            ? valor(columnas, ['alumno id'])
            : '';

        const alumno =
          tipoCsv === 'SEMILLA_SIMPLE'
            ? valor(columnas, ['nombre apellidos'])
            : valor(columnas, ['alumno', 'nombre apellidos']);

        const fechaNacimiento = valor(columnas, [
          'fecha nacimiento',
          'fecha de nacimiento',
        ]);

        const telefono = valor(columnas, ['telefono', 'telefono familia']);

        const ultimoNivel =
          tipoCsv === 'SEMILLA_SIMPLE'
            ? valor(columnas, ['nivel'])
            : valor(columnas, ['ultimo nivel real', 'nivel']);

        const pista =
          tipoCsv === 'MAESTRA' ? valor(columnas, ['pista']) : '';
        const ultimoEntreno =
          tipoCsv === 'MAESTRA'
            ? valor(columnas, ['ultimo entrenamiento'])
            : '';
        const ultimaModalidad =
          tipoCsv === 'MAESTRA'
            ? valor(columnas, ['ultima modalidad'])
            : 'BABY';
        const entrenamientosTexto =
          tipoCsv === 'MAESTRA'
            ? valor(columnas, ['entrenamientos temporada'])
            : '0';
        const recomendacion =
          tipoCsv === 'MAESTRA'
            ? valor(columnas, ['ultima recomendacion tecnica'])
            : '';

        const errores: string[] = [];

        if (
          alumnoId &&
          !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
            alumnoId
          )
        ) {
          errores.push('ID de alumno no válido');
        }

        if (!alumno) errores.push('Falta nombre');

        if (
          ultimoNivel &&
          !/^(INICIACION|A\+?|B\+?|C\+?|D\+?)$/i.test(ultimoNivel)
        ) {
          errores.push('Nivel no reconocido');
        }

        if (
          fechaNacimiento &&
          !/^(\d{4}-\d{2}-\d{2}|\d{1,2}[\/-]\d{1,2}[\/-]\d{4})$/.test(
            fechaNacimiento
          )
        ) {
          errores.push('Fecha de nacimiento no reconocida');
        }

        const telefonoLimpio = telefono.replace(/\s+/g, '');
        if (
          telefonoLimpio &&
          !/^\+?[0-9]{6,15}$/.test(telefonoLimpio)
        ) {
          errores.push('Teléfono no válido');
        }

        const numeroEntrenos = Number(
          String(entrenamientosTexto || '0').replace(',', '.')
        );
        if (!Number.isFinite(numeroEntrenos) || numeroEntrenos < 0) {
          errores.push('Entrenamientos no válidos');
        }

        return {
          alumno_id: alumnoId,
          alumno,
          fecha_nacimiento: fechaNacimiento,
          telefono: telefonoLimpio,
          ultimo_nivel_real: ultimoNivel,
          pista,
          ultimo_entreno: ultimoEntreno,
          ultima_modalidad: ultimaModalidad,
          entrenamientos_temporada: Number.isFinite(numeroEntrenos)
            ? numeroEntrenos
            : 0,
          ultima_recomendacion: recomendacion,
          valido: errores.length === 0,
          error: errores.join(' · '),
        } as FilaCopiaMaestraImportApp;
      });

      if (filas.length === 0) {
        throw new Error('La copia maestra no contiene alumnos.');
      }

      setArchivoCopiaMaestraNombre(archivo.name);
      setFilasCopiaMaestraImport(filas);
    } catch (err) {
      setErrorCopiaMaestraImport(
        err instanceof Error ? err.message : 'No se pudo leer la copia maestra.'
      );
    }
  }

  async function importarCopiaMaestraEnAlumnos() {
    if (!esCoordinadorJefeApp) return;

    if (!temporadaActivaCierre) {
      setErrorCopiaMaestraImport(
        'Primero inicia la nueva temporada. Después carga la semilla.'
      );
      return;
    }

    const filasInvalidas = filasCopiaMaestraImport.filter((fila) => !fila.valido);
    if (filasCopiaMaestraImport.length === 0) {
      setErrorCopiaMaestraImport('Primero selecciona una copia maestra válida.');
      return;
    }

    if (filasInvalidas.length > 0) {
      setErrorCopiaMaestraImport(
        'Corrige el CSV: no se puede importar mientras haya filas con errores.'
      );
      return;
    }

    setImportandoCopiaMaestra(true);
    setErrorCopiaMaestraImport('');
    setResultadoImportacionCopiaMaestra('');

    try {
      const data = await ejecutarFuncionConRespuesta<{
        creados: number;
        actualizados: number;
        reconciliados: number;
        omitidos: number;
      }>('importar_semilla_copia_maestra_v3_app', {
        p_temporada_origen:
          temporadaOrigenCopiaMaestra || archivoCopiaMaestraNombre || 'importación externa',
        p_filas: filasCopiaMaestraImport.map((fila) => ({
          alumno_id: fila.alumno_id || null,
          alumno: fila.alumno,
          fecha_nacimiento: fila.fecha_nacimiento || null,
          telefono: fila.telefono || null,
          ultimo_nivel_real: fila.ultimo_nivel_real || null,
          pista: fila.pista || null,
          ultimo_entreno: fila.ultimo_entreno || null,
          ultima_modalidad: fila.ultima_modalidad || null,
          entrenamientos_temporada: fila.entrenamientos_temporada,
          ultima_recomendacion: fila.ultima_recomendacion || null,
        })),
      });

      const resumen = data[0];
      setResultadoImportacionCopiaMaestra(
        `Semilla cargada: ${Number(resumen?.creados || 0)} creados · ${Number(
          resumen?.actualizados || 0
        )} actualizados · ${Number(
          resumen?.reconciliados || 0
        )} reconciliados por nombre/fecha · ${Number(resumen?.omitidos || 0)} omitidos.`
      );

      await cargarAlumnos();
    } catch (err) {
      setErrorCopiaMaestraImport(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar la copia maestra en la base de alumnos.'
      );
    } finally {
      setImportandoCopiaMaestra(false);
    }
  }

  async function cargarTemporadaActivaCierre() {
    if (!esCoordinadorJefeApp) return;

    setCargandoTemporadaActivaCierre(true);
    setErrorTemporadaActivaCierre('');

    try {
      const data = await consultarSupabase<{
        nombre: string;
        activa: boolean;
        fecha_inicio: string;
      }>(
        'temporadas',
        'select=nombre,activa,fecha_inicio&order=fecha_inicio.desc&limit=4'
      );

      const activas = data.filter((temporada) => temporada.activa);

      if (activas.length > 1) {
        throw new Error(
          'Hay más de una temporada activa. Revisa el estado antes de continuar.'
        );
      }

      const activa = activas[0];
      setTemporadaActivaCierre(activa?.nombre || '');

      // Si no hay temporada activa, el único arranque permitido es la
      // temporada inmediatamente posterior a la última temporada real.
      if (!activa && data[0]?.nombre) {
        const ultimoAnio = Number(String(data[0].nombre).split('/')[0]);
        if (Number.isFinite(ultimoAnio)) {
          const siguienteAnio = ultimoAnio + 1;
          setAnioInicioTemporadaAgenda(siguienteAnio);
          setMesAgenda(`${siguienteAnio}-09`);
          setSemanaAgendaInicio('');
        }
      }
    } catch (err) {
      setTemporadaActivaCierre('');
      setErrorTemporadaActivaCierre(
        err instanceof Error
          ? err.message
          : 'No se pudo comprobar la temporada activa.'
      );
    } finally {
      setCargandoTemporadaActivaCierre(false);
    }
  }

  async function iniciarNuevaTemporadaOperativa() {
    if (!esCoordinadorJefeApp) return;

    if (temporadaActivaCierre) {
      setCierreTemporadaError(
        `Ya hay una temporada activa: ${temporadaActivaCierre}. Ciérrala antes de iniciar otra.`
      );
      return;
    }

    if (errorTemporadaActivaCierre) {
      setCierreTemporadaError(
        'No se puede iniciar una temporada mientras no se haya podido comprobar el estado actual.'
      );
      return;
    }

    setIniciandoNuevaTemporada(true);
    setCierreTemporadaError('');
    setResultadoNuevaTemporada('');

    try {
      await ejecutarFuncion('activar_temporada_operativa_app', {
        p_anio_inicio: anioInicioTemporadaAgenda,
      });

      const temporadaIniciada = nombreTemporadaAgenda(
        anioInicioTemporadaAgenda
      );

      setTemporadaActivaCierre(temporadaIniciada);
      setErrorTemporadaActivaCierre('');
      setResultadoNuevaTemporada(`Temporada ${temporadaIniciada} iniciada correctamente.`);

      setCierreTemporadaAnalizado(false);
      setResumenCierreTemporada(null);
      setCierreTemporadaAlumnos([]);
      setFiltroCierreTemporada('todos');
      setBusquedaCierreTemporada('');

      await Promise.all([
        cargarAgendaOperativaDirecta(),
        cargarAlumnos(),
        cargarPlanning(),
        cargarListados(),
      ]);
    } catch (err) {
      setCierreTemporadaError(
        err instanceof Error
          ? err.message
          : 'No se pudo iniciar la nueva temporada.'
      );
    } finally {
      setIniciandoNuevaTemporada(false);
    }
  }

  useEffect(() => {
    if (!esCoordinadorJefeApp) return;
    cargarTemporadaActivaCierre();
  }, [esCoordinadorJefeApp]);

  async function ejecutarCierreDefinitivoTemporada() {
    const incidencia = seasonClosureIssue({
      isHeadCoordinator: esCoordinadorJefeApp,
      summary: resumenCierreTemporada,
      backupConfirmed: confirmacionBackupCierre,
      listConfirmed: confirmacionListadoCierre,
      confirmationText: confirmacionCierreTexto,
    });
    if (incidencia) {
      setCierreTemporadaError(incidencia);
      return;
    }

    const temporada = resumenCierreTemporada!.temporada;
    const textoEsperado = `CERRAR ${temporada}`;

    setCerrandoTemporada(true);
    setCierreTemporadaError('');
    setResultadoCierreTemporada('');

    try {
      const data = await ejecutarFuncionConRespuesta<{
        temporada_cerrada: string;
        alumnos_conservados: number;
        alumnos_eliminados: number;
        filas_operativas_eliminadas: number;
      }>('cerrar_temporada_seguro_v2_app', {
        p_confirmacion: textoEsperado,
      });

      const r = data[0];

      setResultadoCierreTemporada(
        `Temporada cerrada: ${r?.temporada_cerrada || temporada} · ` +
          `${Number(r?.alumnos_conservados || 0)} alumnos conservados · ` +
          `${Number(r?.alumnos_eliminados || 0)} alumnos eliminados · ` +
          `${Number(r?.filas_operativas_eliminadas || 0)} filas operativas limpiadas. ` +
          `Histórico estadístico Baby/Ocio/Intensivos guardado.`
      );

      setConfirmacionCierreTexto('');
      setConfirmacionBackupCierre(false);
      setConfirmacionListadoCierre(false);
      setCierreTemporadaAnalizado(false);
      setResumenCierreTemporada(null);
      setCierreTemporadaAlumnos([]);

      const temporadaCerrada = String(r?.temporada_cerrada || temporada);
      const anioCerrado = Number(temporadaCerrada.split('/')[0]);
      if (Number.isFinite(anioCerrado)) {
        const siguienteAnio = anioCerrado + 1;
        setAnioInicioTemporadaAgenda(siguienteAnio);
        setMesAgenda(`${siguienteAnio}-09`);
        setSemanaAgendaInicio('');
      }

      // Importante: el RPC ya ha borrado la operativa en Supabase,
      // pero las distintas pantallas conservaban sus arrays React anteriores.
      // Recargamos todas las fuentes principales para que la UI quede vacía
      // inmediatamente después del cierre.
      await Promise.all([
        cargarTemporadaActivaCierre(),
        cargarAgendaOperativaDirecta(),
        cargarAlumnos(),
        cargarPlanning(),
        cargarListados(),
        cargarOcioAlumnos(),
        cargarOcioGrupos(),
        cargarIntensivos(),
      ]);

      setAgendaGruposSesion([]);
      setAgendaGruposRecursosTurno([]);
      setGruposOperativosResumenDia({});
      setGruposEntrenador([]);
    } catch (err) {
      setCierreTemporadaError(
        err instanceof Error
          ? err.message
          : 'No se pudo cerrar la temporada.'
      );
    } finally {
      setCerrandoTemporada(false);
    }
  }

  function htmlEscapeBackup(valor: unknown) {
    return String(valor ?? '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function tablaBackupExcel(
    titulo: string,
    columnas: string[],
    filas: Array<Array<unknown>>
  ) {
    const cabecera = columnas
      .map((columna) => `<th>${htmlEscapeBackup(columna)}</th>`)
      .join('');
    const cuerpo =
      filas.length > 0
        ? filas
            .map(
              (fila) =>
                `<tr>${fila
                  .map((celda) => `<td>${htmlEscapeBackup(celda)}</td>`)
                  .join('')}</tr>`
            )
            .join('')
        : `<tr><td colspan="${columnas.length}">Sin datos</td></tr>`;

    return `<h2>${htmlEscapeBackup(
      titulo
    )}</h2><table><thead><tr>${cabecera}</tr></thead><tbody>${cuerpo}</tbody></table><br/>`;
  }

  function descargarTextoComoArchivo(
    nombreArchivo: string,
    contenido: string,
    tipo: string
  ) {
    const blob = new Blob([contenido], { type: tipo });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement('a');
    enlace.href = url;
    enlace.download = nombreArchivo;
    document.body.appendChild(enlace);
    enlace.click();
    enlace.remove();
    URL.revokeObjectURL(url);
  }

  async function descargarBackupSemanalJson() {
    const semana = semanaBackupObjetivo;
    if (!semana) {
      setError(
        'Selecciona una semana antes de descargar la copia de seguridad.'
      );
      return;
    }

    setError('');

    try {
      const backup = await ejecutarFuncionAuthJson<any>(
        'obtener_backup_semanal_app',
        { p_semana_inicio: semana }
      );

      const fin = String(
        backup?.semana_fin || sumarDiasBackup(semana, 6)
      );

      descargarTextoComoArchivo(
        nombreArchivoBackupSemanal(
          String(backup?.temporada || temporadaActivaCierre || ''),
          semana,
          fin
        ),
        JSON.stringify(backup, null, 2),
        'application/json;charset=utf-8'
      );

      const marca = new Date().toLocaleString('es-ES');
      const storageKey = claveStorageBackupSemana(semana);

      if (storageKey && typeof window !== 'undefined') {
        window.localStorage.setItem(storageKey, marca);
      }

      setUltimaDescargaBackupSemana(marca);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo generar el backup semanal.'
      );
    }
  }

  async function cargarBackupSemanalParaRestaurar(archivo: File | null) {
    setBackupRestauracion(null);
    setArchivoBackupRestauracion('');
    setErrorBackupRestauracion('');
    setConfirmacionBackupRestauracion('');
    setResultadoRestauracionBackup('');

    if (!archivo) return;

    if (!archivo.name.toLowerCase().endsWith('.json')) {
      setErrorBackupRestauracion(
        'Selecciona un backup semanal .json generado por la app.'
      );
      return;
    }

    try {
      const contenido = await archivo.text();
      const backup = parseAndValidateWeeklyBackup(contenido);

      setArchivoBackupRestauracion(archivo.name);
      setBackupRestauracion(backup);
    } catch (err) {
      setErrorBackupRestauracion(
        err instanceof Error
          ? err.message
          : 'No se pudo leer el backup.'
      );
    }
  }

  async function restaurarBackupSemanal() {
    if (!backupRestauracion || !esCoordinadorJefeApp) return;

    const textoEsperado = `RESTAURAR ${backupRestauracion.semana_inicio}`;

    if (confirmacionBackupRestauracion.trim() !== textoEsperado) {
      setErrorBackupRestauracion(
        `Escribe exactamente: ${textoEsperado}`
      );
      return;
    }

    setRestaurandoBackupSemanal(true);
    setErrorBackupRestauracion('');
    setResultadoRestauracionBackup('');

    try {
      const data = await ejecutarFuncionConRespuesta<{
        semana_restaurada: string;
        tablas_restauradas: number;
        filas_restauradas: number;
      }>('restaurar_backup_semanal_app', {
        p_backup: backupRestauracion,
        p_confirmacion: textoEsperado,
      });

      const r = data[0];

      setResultadoRestauracionBackup(
        `Backup restaurado · Semana ${r?.semana_restaurada || backupRestauracion.semana_inicio} · ` +
          `${Number(r?.filas_restauradas || 0)} filas recuperadas.`
      );

      window.setTimeout(() => {
        window.location.reload();
      }, 1200);
    } catch (err) {
      setErrorBackupRestauracion(
        err instanceof Error
          ? err.message
          : 'No se pudo restaurar el backup.'
      );
    } finally {
      setRestaurandoBackupSemanal(false);
    }
  }

  function descargarResumenDiaExcel() {
    const filas = sesionesResumenDia.map((sesion) => [
      sesion.fecha,
      `${horaCorta(sesion.hora_inicio)}-${horaCorta(sesion.hora_fin)}`,
      sesion.modalidad,
      sesion.titulo,
      sesion.estado,
      sesion.totalAlumnos,
      sesion.totalGrupos,
      sesion.publicados,
      gruposTextoResumenSesion(sesion),
    ]);

    const html = `<!doctype html><html><head><meta charset="utf-8" /><style>body{font-family:Arial,sans-serif;}table{border-collapse:collapse;width:100%;}th{background:#111827;color:#fff;}th,td{border:1px solid #d1d5db;padding:6px;font-size:12px;}</style></head><body><h1>Resumen del día ${htmlEscapeBackup(
      formatearFecha(fechaResumenDiaActiva)
    )}</h1>${tablaBackupExcel(
      'Sesiones del día',
      [
        'Fecha',
        'Hora',
        'Modalidad',
        'Título',
        'Estado',
        'Alumnos',
        'Grupos',
        'Publicados',
        'Detalle grupos',
      ],
      filas
    )}</body></html>`;
    descargarTextoComoArchivo(
      `resumen_dia_${fechaResumenDiaActiva}.xls`,
      html,
      'application/vnd.ms-excel;charset=utf-8'
    );
  }


  function renderAyudaRapidaPantallaApp() {
    return <QuickHelp pantalla={pantalla} />;
  }

  return (
    <main
      className={`mitico-app-shell ${esCoordinadorApp ? 'with-sidebar' : 'trainer-only'} ${esVistaMovilApp ? 'is-mobile' : ''}`}
      style={layout}
    >
      <header className="mitico-product-header">
        <div className="mitico-topbar">
          <div className="mitico-brand-block">
            <img
              src="/logo-cabecera-mitico.png"
              alt="Mítico Club"
              className="mitico-brand-logo"
            />
            <div className="mitico-brand-copy">
              <strong>MÍTICO BABY</strong>
              {esEntrenadorApp ? (
                <div
                  style={{
                    display: 'block',
                    marginTop: 2,
                    color: '#34d399',
                    fontSize: 10,
                    lineHeight: 1.1,
                    fontWeight: 950,
                    letterSpacing: '0.12em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                  }}
                >
                  COORDINACIÓN DEPORTIVA
                </div>
              ) : (
                <span>Coordinación deportiva</span>
              )}
            </div>
          </div>

          <div className="mitico-week-control">
            <span className="mitico-week-label">Semana de trabajo</span>
            {esEntrenadorApp ? (
              <strong className="mitico-week-value">
                {semanaVistaEntrenadorInicio
                  ? rangoSemanaAgenda(semanaVistaEntrenadorInicio)
                  : '-'}
              </strong>
            ) : (
              <select
                value={semanaAgendaActiva}
                onChange={(e) => cambiarSemanaTrabajoApp(e.target.value)}
                aria-label="Cambiar semana de trabajo"
              >
                {semanasAgenda.map((semana) => (
                  <option key={semana} value={semana}>
                    {rangoSemanaAgenda(semana)}
                  </option>
                ))}
              </select>
            )}
          </div>

          <div className="mitico-topbar-actions">
            {perfilUsuario && (
              <div className="mitico-user-block">
                <span className="mitico-user-avatar" aria-hidden="true">
                  {perfilUsuario.nombre
                    .trim()
                    .split(/\s+/)
                    .slice(0, 2)
                    .map((parte) => parte.charAt(0).toUpperCase())
                    .join('')}
                </span>
                <span className="mitico-user-copy">
                  <strong>{perfilUsuario.nombre}</strong>
                  {esEntrenadorApp ? (
                    <span
                      style={{
                        display: 'block',
                        marginTop: 1,
                        color: '#cbd5e1',
                        fontSize: 10,
                        lineHeight: 1.15,
                        fontWeight: 700,
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {rolUsuarioTextoApp(perfilUsuario.rol)}
                    </span>
                  ) : (
                    <small>{rolUsuarioTextoApp(perfilUsuario.rol)}</small>
                  )}
                </span>
                <button
                  type="button"
                  className="mitico-logout-button"
                  onClick={onLogout}
                  aria-label="Cerrar sesión"
                  title="Cerrar sesión"
                >
                  Salir
                </button>
              </div>
            )}

            {(esEntrenadorApp || esCoordinadorJefeApp) && !pwaInstalada && (
              <button
                type="button"
                className="mitico-install-button"
                onClick={instalarPwaEntrenador}
                aria-expanded={mostrarAyudaInstalacionPwa}
                title={pwaInstallPrompt
                  ? 'Instalar Mítico Baby en este dispositivo'
                  : 'Ver cómo instalar Mítico Baby en este dispositivo'}
                aria-label={pwaInstallPrompt
                  ? 'Instalar Mítico Baby en este dispositivo'
                  : 'Ver cómo instalar Mítico Baby en este dispositivo'}
              >
                <img src="/icon-192.png" alt="" aria-hidden="true" />
                <span>{pwaInstallPrompt ? 'Instalar' : 'Cómo instalar'}</span>
              </button>
            )}
          </div>
        </div>

        {mostrarAyudaInstalacionPwa && !pwaInstalada && (
          <div className="mitico-install-help">
            {esDispositivoIosPwa ? (
              <>
                En iPhone/iPad: abre esta página en Safari, pulsa
                <strong> Compartir </strong> y después
                <strong> Añadir a pantalla de inicio</strong>.
              </>
            ) : (
              <>
                Si no aparece el instalador automático, abre el menú del navegador y elige
                <strong> Instalar aplicación </strong> o
                <strong> Añadir a pantalla de inicio</strong>.
              </>
            )}
          </div>
        )}

        {esCoordinadorApp ? (
          <nav className="mitico-sidebar" aria-label="Navegación principal">
            {!esAdministracionApp && (
              <>
                <div className="mitico-nav-group">
                  <span className="mitico-nav-heading">Operativa</span>
                  <button
                    className={`mitico-nav-item ${pantalla === 'inicio' ? 'is-active' : ''}`}
                    onClick={() => abrirPantallaConScroll('inicio')}
                  >
                    <IconoNavegacionApp tipo="inicio" />
                    <span>Inicio</span>
                  </button>
                  <button
                    className={`mitico-nav-item ${pantalla === 'resumenDia' ? 'is-active' : ''}`}
                    onClick={() => abrirPantallaConScroll('resumenDia')}
                  >
                    <IconoNavegacionApp tipo="inicio" />
                    <span>Trabajo en pista</span>
                  </button>
                  <button
                    className={`mitico-nav-item ${pantalla === 'agenda' ? 'is-active' : ''}`}
                    onClick={() => abrirPantallaConScroll('agenda')}
                  >
                    <IconoNavegacionApp tipo="agenda" />
                    <span>Entrenamientos</span>
                  </button>
                  <button
                    className={`mitico-nav-item ${['ocioGrupos', 'ocioCambios', 'ocioSemana', 'ocioEvaluaciones'].includes(pantalla) ? 'is-active' : ''}`}
                    onClick={() => abrirPantallaConScroll('ocioGrupos')}
                  >
                    <IconoNavegacionApp tipo="ocio" />
                    <span>Ocio</span>
                  </button>
                  <button
                    className={`mitico-nav-item ${pantalla === 'intensivos' ? 'is-active' : ''}`}
                    onClick={() => abrirPantallaConScroll('intensivos')}
                  >
                    <IconoNavegacionApp tipo="intensivos" />
                    <span>Intensivos</span>
                  </button>
                </div>

                <div className="mitico-nav-group">
                  <span className="mitico-nav-heading">Equipo</span>
                  <button
                    className={`mitico-nav-item ${pantalla === 'entrenadores' ? 'is-active' : ''}`}
                    onClick={() => abrirPantallaConScroll('entrenadores')}
                  >
                    <IconoNavegacionApp tipo="entrenadores" />
                    <span>Entrenadores</span>
                  </button>
                  <button
                    className={`mitico-nav-item ${pantalla === 'disponibilidad' ? 'is-active' : ''}`}
                    onClick={() => abrirPantallaConScroll('disponibilidad')}
                  >
                    <IconoNavegacionApp tipo="disponibilidad" />
                    <span>Disponibilidad</span>
                  </button>
                  <button
                    className={`mitico-nav-item ${pantalla === 'entrenador' ? 'is-active' : ''}`}
                    onClick={() => {
                      setSemanaVistaEntrenadorCoordinadorForzada('');
                      abrirPantallaConScroll('entrenador');
                    }}
                  >
                    <IconoNavegacionApp tipo="movil" />
                    <span>Vista entrenador</span>
                  </button>
                  <button
                    className={`mitico-nav-item ${pantalla === 'reportes' ? 'is-active' : ''}`}
                    onClick={() => abrirPantallaConScroll('reportes')}
                  >
                    <IconoNavegacionApp tipo="cierre" />
                    <span>Cierre semanal</span>
                  </button>
                </div>

                <div className="mitico-nav-group">
                  <span className="mitico-nav-heading">Gestión</span>
                  <button
                    className={`mitico-nav-item ${pantalla === 'alumnos' ? 'is-active' : ''}`}
                    onClick={() => abrirPantallaConScroll('alumnos')}
                  >
                    <IconoNavegacionApp tipo="fichas" />
                    <span>Fichas</span>
                  </button>
                  {puedeVerAdministracionAltasApp(perfilUsuario?.rol) && (
                    <button
                      className={`mitico-nav-item ${pantalla === 'administracion' ? 'is-active' : ''}`}
                      onClick={() => abrirPantallaConScroll('administracion')}
                    >
                      <IconoNavegacionApp tipo="altas" />
                      <span>Altas / Test</span>
                    </button>
                  )}
                </div>
              </>
            )}

            {esAdministracionApp && puedeVerAdministracionAltasApp(perfilUsuario?.rol) && (
              <div className="mitico-nav-group">
                <span className="mitico-nav-heading">Administración</span>
                <button
                  className={`mitico-nav-item ${pantalla === 'administracion' ? 'is-active' : ''}`}
                  onClick={() => abrirPantallaConScroll('administracion')}
                >
                  <IconoNavegacionApp tipo="altas" />
                  <span>Altas / Test de nivel</span>
                </button>
              </div>
            )}

            {esCoordinadorJefeApp && (
              <div className="mitico-nav-group">
                <span className="mitico-nav-heading">Dirección</span>
                <button className={`mitico-nav-item ${pantalla === 'cobros' ? 'is-active' : ''}`} onClick={() => abrirPantallaConScroll('cobros')}>
                  <IconoNavegacionApp tipo="cobros" /><span>Cobros</span>
                </button>
                <button className={`mitico-nav-item ${pantalla === 'analisis' ? 'is-active' : ''}`} onClick={() => abrirPantallaConScroll('analisis')}>
                  <IconoNavegacionApp tipo="analisis" /><span>Análisis</span>
                </button>
                <button className={`mitico-nav-item ${pantalla === 'informes' ? 'is-active' : ''}`} onClick={() => abrirPantallaConScroll('informes')}>
                  <IconoNavegacionApp tipo="informes" /><span>Informes y listados</span>
                </button>
                <button className={`mitico-nav-item ${pantalla === 'temporadas' ? 'is-active' : ''}`} onClick={() => abrirPantallaConScroll('temporadas')}>
                  <IconoNavegacionApp tipo="temporadas" /><span>Temporadas</span>
                </button>
                <button className={`mitico-nav-item ${pantalla === 'usuarios' ? 'is-active' : ''}`} onClick={() => abrirPantallaConScroll('usuarios')}>
                  <IconoNavegacionApp tipo="accesos" /><span>Accesos equipo</span>
                </button>
                <button className={`mitico-nav-item ${pantalla === 'whatsappDireccion' ? 'is-active' : ''}`} onClick={() => abrirPantallaConScroll('whatsappDireccion')}>
                  <IconoNavegacionApp tipo="whatsapp" /><span>WhatsApp</span>
                </button>
              </div>
            )}

            <div className="mitico-sidebar-footer">
              <img src="/logo-cabecera-mitico.png" alt="" aria-hidden="true" />
              <span>
                <strong>Mítico Club · Madrid</strong>
                <small>Temporada {temporadaActivaCierre || 'activa'}</small>
              </span>
            </div>
          </nav>
        ) : null}
      </header>

      <style>{`
        .mitico-app-shell {
          --mitico-navy: #061b2d;
          --mitico-green: #0f9f4d;
          --mitico-green-dark: #08783a;
          --mitico-ink: #122033;
          --mitico-border: #e4eaf1;
          --mitico-bg: #f4f7fb;
          padding: 0 !important;
          background: var(--mitico-bg) !important;
          min-height: 100vh;
          color: var(--mitico-ink);
        }
        .mitico-product-header { position: relative; z-index: 40; }
        .mitico-topbar {
          min-height: 74px; display: grid;
          grid-template-columns: minmax(230px, 1fr) minmax(330px, .9fr) minmax(280px, 1fr);
          align-items: center; gap: 18px; padding: 10px 24px;
          background: linear-gradient(110deg, #041724 0%, #06243a 64%, #092d43 100%);
          color: #fff; box-shadow: 0 8px 28px rgba(3,20,33,.16);
          position: sticky; top: 0; z-index: 60;
        }
        .mitico-brand-block { display:flex; align-items:center; gap:12px; min-width:0; }
        .mitico-brand-logo { width:44px; height:44px; border-radius:12px; object-fit:cover; background:#fff; border:1px solid rgba(255,255,255,.18); box-shadow:0 6px 20px rgba(0,0,0,.18); }
        .mitico-brand-copy { display:grid; min-width:0; }
        .mitico-brand-copy strong { font-size:18px; letter-spacing:.08em; line-height:1.05; }
        .mitico-brand-copy span { margin-top:4px; color:#38d277; font-size:10px; font-weight:900; text-transform:uppercase; letter-spacing:.12em; }
        .mitico-week-control { min-height:46px; display:flex; align-items:center; justify-content:center; gap:12px; padding:7px 13px; border:1px solid rgba(255,255,255,.08); border-radius:14px; background:rgba(255,255,255,.055); min-width:0; }
        .mitico-week-label { color:#cbd7e4; font-size:12px; font-weight:750; white-space:nowrap; }
        .mitico-week-control select { min-width:0; max-width:240px; border:0; outline:0; background:transparent; color:#fff; font-weight:850; font-size:13px; padding:4px 22px 4px 0; }
        .mitico-week-control select option { color:#172033; background:#fff; }
        .mitico-week-value { min-width:0; font-size:13px; color:#fff; overflow-wrap:anywhere; }
        .mitico-topbar-actions { display:flex; justify-content:space-between; align-items:center; gap:12px; min-width:0; width:100%; }
        .mitico-install-button { height:42px; display:inline-flex; align-items:center; gap:8px; padding:6px 10px; border-radius:12px; border:1px solid rgba(117,229,155,.2); background:rgba(15,159,77,.13); color:#d9ffe6; font-weight:800; font-size:12px; }
        .mitico-install-button img { width:28px; height:28px; border-radius:8px; }
        .mitico-user-block { display:flex; align-items:center; gap:10px; min-width:0; }
        .mitico-user-avatar { width:40px; height:40px; border-radius:50%; display:grid; place-items:center; background:linear-gradient(145deg,#34475c,#1c3046); color:#fff; font-weight:900; font-size:12px; border:1px solid rgba(255,255,255,.09); }
        .mitico-user-copy { display:grid; min-width:0; line-height:1.15; }
        .mitico-user-copy strong { color:#fff; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
        .mitico-user-copy small { color:#b8c6d5; font-size:11px; margin-top:3px; }
        .mitico-logout-button { min-height:34px; padding:7px 11px; border-radius:10px; border:1px solid rgba(248,113,113,.42); color:#fecaca; background:rgba(185,28,28,.18); font-size:11px; font-weight:900; box-shadow:none; }
        .mitico-install-help { position:fixed; top:82px; right:24px; z-index:70; width:min(390px,calc(100vw - 32px)); padding:12px 14px; border-radius:14px; background:#fff; color:#31503d; border:1px solid #ccebd7; box-shadow:0 18px 55px rgba(15,23,42,.16); font-size:12px; line-height:1.45; }
        .mitico-sidebar { position:fixed; top:74px; left:0; bottom:0; width:222px; z-index:45; display:flex; flex-direction:column; gap:2px; overflow-y:auto; padding:20px 8px 16px; background:rgba(255,255,255,.98); border-right:1px solid var(--mitico-border); box-shadow:8px 0 30px rgba(15,23,42,.025); overscroll-behavior-y:contain; scrollbar-gutter:stable; }
        .mitico-nav-group { display:grid; gap:3px; padding:0 0 14px; margin-bottom:10px; border-bottom:1px solid #edf1f5; }
        .mitico-nav-heading { padding:0 8px 7px; color:var(--mitico-green-dark); font-size:10px; font-weight:950; text-transform:uppercase; letter-spacing:.13em; }
        .mitico-nav-item { position:relative; width:100%; min-height:42px; display:grid; grid-template-columns:22px minmax(0,1fr); align-items:center; gap:8px; padding:9px 8px; border:0; border-radius:10px; background:transparent; color:#506078; text-align:left; font-size:13px; font-weight:760; box-shadow:none; cursor:pointer; }
        .mitico-nav-item:hover { background:#f5f8fa; color:#17324a; }
        .mitico-nav-item.is-active { color:#08783a; background:linear-gradient(90deg,#eaf8ef 0%,#f7fbf8 100%); font-weight:900; }
        .mitico-nav-item.is-active::before { content:''; position:absolute; left:0; width:3px; height:28px; border-radius:0 3px 3px 0; background:var(--mitico-green); }
        .mitico-nav-item svg { width:19px; height:19px; }
        .mitico-sidebar-footer { margin-top:auto; padding:14px 8px 2px; display:flex; align-items:center; gap:9px; color:#64748b; }
        .mitico-sidebar-footer img { width:34px; height:34px; object-fit:cover; border-radius:9px; }
        .mitico-sidebar-footer span { display:grid; min-width:0; }
        .mitico-sidebar-footer strong { font-size:11px; color:#344256; }
        .mitico-sidebar-footer small { font-size:10px; margin-top:2px; }
        .mitico-content-shell { margin-left:222px; padding:28px 32px 64px; min-width:0; min-height:calc(100vh - 74px); max-width:1700px; }
        .mitico-app-shell.trainer-only .mitico-content-shell { margin-left:auto; margin-right:auto; max-width:1120px; }
        @media (min-width:901px) {
          .mitico-product-header { position:sticky; top:0; z-index:60; }
          .mitico-topbar { position:relative; top:auto; }
        }
        @media (max-width:1080px) {
          .mitico-topbar { grid-template-columns:minmax(200px,1fr) minmax(280px,1fr); }
          .mitico-topbar-actions { grid-column:1 / -1; justify-content:space-between; padding-top:2px; }
          .mitico-sidebar { top:126px; }
        }
        @media (max-width:900px) {
          .mitico-topbar { position:relative; grid-template-columns:1fr; padding:10px 14px; gap:8px; }
          .mitico-brand-logo { width:38px; height:38px; }
          .mitico-brand-copy strong { font-size:16px; }
          .mitico-week-control { justify-content:flex-start; }
          .mitico-week-control select { max-width:100%; flex:1; }
          .mitico-user-copy { flex:1; }
          .mitico-topbar-actions { grid-column:auto; }
          .mitico-sidebar { position:static; width:100%; height:auto; max-height:none; padding:10px 12px 11px; flex-direction:row; align-items:flex-start; gap:12px; overflow-x:auto; overflow-y:hidden; overscroll-behavior-x:contain; scroll-snap-type:x proximity; -webkit-overflow-scrolling:touch; border-right:0; border-bottom:1px solid var(--mitico-border); box-shadow:none; }
          .mitico-nav-group { min-width:215px; margin:0; padding:0 10px 0 0; border-bottom:0; border-right:1px solid #edf1f5; scroll-snap-align:start; }
          .mitico-sidebar-footer { display:none; }
          .mitico-content-shell, .mitico-app-shell.trainer-only .mitico-content-shell { margin-left:0; max-width:none; padding:18px 14px 54px; }
          .mitico-install-help { top:12px; right:12px; }
        }
        @media (max-width:600px) {
          .mitico-topbar-actions { align-items:center; gap:8px; }
          .mitico-user-copy strong { font-size:12px; }
          .mitico-user-copy small { font-size:10px; }
          .mitico-logout-button { padding-inline:8px; }
          .mitico-content-shell, .mitico-app-shell.trainer-only .mitico-content-shell { padding:14px 10px 46px; }
          .mitico-install-button { height:36px; padding:5px 8px; gap:6px; font-size:10px; white-space:nowrap; }
          .mitico-install-button img { width:22px; height:22px; border-radius:6px; }
          .mitico-app-shell.trainer-only .mitico-brand-copy span,
          .mitico-app-shell.trainer-only .mitico-week-label,
          .mitico-app-shell.trainer-only .mitico-user-copy small { display:none; }
        }
      `}</style>

      <div className="mitico-content-shell">


      {whatsappPreview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 9999,
            padding: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <article
            style={{
              background: '#fff',
              borderRadius: 22,
              padding: 18,
              width: 'min(920px, 100%)',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 24px 80px rgba(0,0,0,0.30)',
              border: '1px solid #e5e7eb',
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'flex-start',
                marginBottom: 10,
              }}
            >
              <div>
                <p style={etiquetaSuperior}>PREVISUALIZACIÓN WHATSAPP</p>
                <h2 style={{ margin: 0 }}>{whatsappPreview.titulo}</h2>
              </div>
              <button
                onClick={() => setWhatsappPreview(null)}
                style={botonSecundario}
              >
                Cerrar
              </button>
            </div>

            <div style={{ ...avisoNeutral, marginBottom: 12 }}>
              {whatsappPreview.claveGrupoWhatsapp
                ? 'Revisa el mensaje. Al pulsar enviar, se copiará y se abrirá directamente el grupo de WhatsApp configurado para este turno.'
                : whatsappPreview.titulo.startsWith('Alta entrenador')
                ? 'Edita el mensaje si necesitas cambiar algo y después copia el texto para enviarlo por WhatsApp.'
                : 'Revisa y modifica aquí el texto antes de copiarlo.'}
            </div>

            {whatsappPreview.claveGrupoWhatsapp && (
              <div
                style={{
                  display: 'grid',
                  gap: 5,
                  marginBottom: 12,
                  padding: 12,
                  borderRadius: 14,
                  border: whatsappPreview.enlaceGrupoWhatsapp
                    ? '1px solid #bbf7d0'
                    : '1px solid #fed7aa',
                  background: whatsappPreview.enlaceGrupoWhatsapp
                    ? '#f0fdf4'
                    : '#fff7ed',
                }}
              >
                <strong
                  style={{
                    color: whatsappPreview.enlaceGrupoWhatsapp
                      ? '#166534'
                      : '#9a3412',
                  }}
                >
                  {whatsappPreview.enlaceGrupoWhatsapp
                    ? 'Grupo de WhatsApp configurado ✓'
                    : 'Falta configurar el grupo de WhatsApp'}
                </strong>
                <span style={{ fontSize: 12, color: '#64748b' }}>
                  {whatsappPreview.enlaceGrupoWhatsapp
                    ? 'El enlace se gestiona únicamente desde Dirección → WhatsApp.'
                    : 'Ve a Dirección → WhatsApp, guarda el enlace y vuelve a abrir este mensaje.'}
                </span>
              </div>
            )}

            <textarea
              value={whatsappPreview.texto}
              onChange={(e) =>
                setWhatsappPreview({
                  ...whatsappPreview,
                  texto: e.target.value,
                  mensajeGrupoCopiado: false,
                })
              }
              rows={18}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                borderRadius: 16,
                border: '1px solid #d1d5db',
                padding: 14,
                fontSize: 15,
                lineHeight: 1.45,
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                whiteSpace: 'pre-wrap',
              }}
            />

            {whatsappPreview.claveGrupoWhatsapp && (
              <div
                style={{
                  marginTop: 10,
                  padding: '10px 12px',
                  borderRadius: 12,
                  border: whatsappPreview.mensajeGrupoCopiado
                    ? '1px solid #86efac'
                    : '1px solid #dbeafe',
                  background: whatsappPreview.mensajeGrupoCopiado
                    ? '#f0fdf4'
                    : '#eff6ff',
                  color: whatsappPreview.mensajeGrupoCopiado
                    ? '#166534'
                    : '#1e3a8a',
                  fontSize: 12,
                  fontWeight: 800,
                }}
              >
                {whatsappPreview.mensajeGrupoCopiado
                  ? 'Mensaje copiado ✓ Solo pégalo en el grupo y pulsa enviar.'
                  : 'Un toque: copia el mensaje y abre directamente el grupo de WhatsApp.'}
              </div>
            )}

            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginTop: 12,
              }}
            >
              {whatsappPreview.claveGrupoWhatsapp && (
                <button
                  onClick={() => void abrirGrupoWhatsappDesdePreview()}
                  disabled={!whatsappPreview.enlaceGrupoWhatsapp}
                  style={
                    whatsappPreview.enlaceGrupoWhatsapp
                      ? botonPrincipal
                      : { ...botonPrincipal, opacity: 0.5, cursor: 'not-allowed' }
                  }
                >
                  Enviar a grupo WhatsApp
                </button>
              )}
              {whatsappPreview.telefonoDestino && (
                <button
                  onClick={abrirWhatsappDesdePrevisualizacion}
                  style={botonPrincipal}
                >
                  Abrir WhatsApp
                </button>
              )}
              <button
                onClick={copiarWhatsappPrevisualizado}
                style={
                  whatsappPreview.telefonoDestino
                    ? botonSecundario
                    : botonPrincipal
                }
              >
                Copiar texto
              </button>
              <button
                onClick={() => setWhatsappPreview(null)}
                style={botonSecundario}
              >
                Cerrar
              </button>
            </div>
          </article>
        </div>
      )}

      <style>{`
        @keyframes miticoFadeUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes miticoPulseSoft {
          0%, 100% { box-shadow: 0 10px 24px rgba(37,99,235,0.14); }
          50% { box-shadow: 0 14px 32px rgba(37,99,235,0.23); }
        }
        button, summary, input, select, textarea {
          transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease, background 0.16s ease, opacity 0.16s ease;
        }
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 10px 22px rgba(15,23,42,0.13);
        }
        button:active:not(:disabled) { transform: translateY(0); box-shadow: 0 4px 12px rgba(15,23,42,0.10); }
        details[open] > *:not(summary) { animation: miticoFadeUp 0.18s ease both; }
        article, nav > div, section { animation: miticoFadeUp 0.18s ease both; }
        input:focus, select:focus, textarea:focus {
          outline: none;
          border-color: #2563eb !important;
          box-shadow: 0 0 0 4px rgba(37,99,235,0.12);
        }
        @media (prefers-reduced-motion: reduce) {
          button, summary, input, select, textarea, article, nav > div, section {
            transition: none !important;
            animation: none !important;
          }
        }
      `}</style>

      <style>{`
        @media print {
          body * { visibility: hidden !important; }
          #cobro-pdf-preview, #cobro-pdf-preview * { visibility: visible !important; }
          #cobro-pdf-preview { position: absolute !important; left: 0 !important; top: 0 !important; width: 100% !important; padding: 0 !important; box-shadow: none !important; border: 0 !important; }
          .no-imprimir-cobro { display: none !important; }
        }
      `}</style>

      {cobroPdfPreview && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.45)',
            zIndex: 9998,
            padding: 16,
            overflow: 'auto',
          }}
        >
          <article
            id="cobro-pdf-preview"
            style={{
              background: '#fff',
              color: '#111',
              borderRadius: 22,
              padding: 22,
              maxWidth: 980,
              margin: '0 auto',
              boxShadow: '0 24px 80px rgba(0,0,0,0.30)',
              border: '1px solid #e5e7eb',
              fontFamily: 'Arial, sans-serif',
            }}
          >
            <div
              className="no-imprimir-cobro"
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
                alignItems: 'flex-start',
                marginBottom: 14,
              }}
            >
              <div>
                <p style={etiquetaSuperior}>PREVISUALIZACIÓN PDF</p>
                <h2 style={{ margin: 0 }}>{cobroPdfPreview.titulo}</h2>
                <p style={{ margin: '6px 0 0', color: '#dbeafe' }}>
                  Revisa el resumen. Luego pulsa imprimir y en Mac guarda como
                  PDF.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  onClick={imprimirCobroPdfPreview}
                  style={botonPrincipal}
                >
                  Imprimir / guardar PDF
                </button>
                <button
                  onClick={() => setCobroPdfPreview(null)}
                  style={botonSecundario}
                >
                  Cerrar
                </button>
              </div>
            </div>

            <style>{`
              #cobro-pdf-preview h1, #cobro-pdf-preview h2, #cobro-pdf-preview h3 { margin-bottom: 8px; }
              #cobro-pdf-preview .portada { border: 2px solid #111; border-radius: 16px; padding: 18px; margin-bottom: 24px; }
              #cobro-pdf-preview .cobro { page-break-inside: avoid; border-bottom: 1px solid #ddd; padding: 18px 0; }
              #cobro-pdf-preview .resumen { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin: 14px 0; }
              #cobro-pdf-preview .resumen div { border: 1px solid #ddd; border-radius: 10px; padding: 10px; }
              #cobro-pdf-preview table { width: 100%; border-collapse: collapse; margin-top: 8px; font-size: 12px; }
              #cobro-pdf-preview th, #cobro-pdf-preview td { border: 1px solid #ddd; padding: 7px; text-align: left; }
              #cobro-pdf-preview th { background: #f2f2f2; }
              #cobro-pdf-preview pre { white-space: pre-wrap; background: #f7f7f7; padding: 10px; border-radius: 10px; }
              #cobro-pdf-preview .preparacion-efectivo { page-break-before: always; break-before: page; padding-top: 8px; }
              #cobro-pdf-preview .preparacion-efectivo .kicker-efectivo { margin: 0 0 5px; color: #0f766e; font-size: 11px; font-weight: 900; letter-spacing: .1em; }
              #cobro-pdf-preview .preparacion-efectivo .subtitulo-efectivo { margin-top: 0; color: #475569; font-weight: 700; }
              #cobro-pdf-preview .efectivo-destacado { display: grid; gap: 4px; border: 2px solid #0f766e; border-radius: 14px; padding: 15px 16px; margin: 16px 0; background: #f0fdfa; }
              #cobro-pdf-preview .efectivo-destacado span { color: #475569; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: .06em; }
              #cobro-pdf-preview .efectivo-destacado strong { color: #0f5132; font-size: 27px; }
              #cobro-pdf-preview .efectivo-destacado small { color: #64748b; }
              #cobro-pdf-preview .nota-efectivo { border-left: 4px solid #0f9f4d; background: #f8fafc; padding: 11px 13px; margin: 14px 0 18px; line-height: 1.45; }
              #cobro-pdf-preview .tabla-efectivo { margin-bottom: 22px; }
              #cobro-pdf-preview .tabla-efectivo th { background: #ecfdf5; color: #14532d; }
              #cobro-pdf-preview .tabla-entrenadores-efectivo td:last-child { font-size: 11px; line-height: 1.4; }
              #cobro-pdf-preview .pie-efectivo { margin-top: 12px; color: #64748b; font-size: 11px; line-height: 1.45; }
            `}</style>

            <div dangerouslySetInnerHTML={{ __html: cobroPdfPreview.cuerpo }} />
          </article>
        </div>
      )}

      <div ref={contenidoPantallaRef} style={{ scrollMarginTop: 24 }} />

      {error && (
        <div style={errorCaja}>
          <strong>Error:</strong>
          <pre style={{ whiteSpace: 'pre-wrap' }}>{error}</pre>
        </div>
      )}

      {pantalla === 'resumenDia' && (
        <DailySummaryScreen
          ctx={{
            abrirAjustePistaSesion,
            abrirResultadoAlumnoResumenDia,
            actualizarCamisetaAlumnoResumenDia,
            ajustePistaModo,
            ajustePistaSesionId,
            alumnoResumenDiaDestacado,
            alumnos,
            alumnosCamisetaPendienteResumenDia,
            alumnosGrupoResumenDia,
            anadirAlumnoHoyTrabajoPista,
            anadirPistaAlumnoId,
            anadirPistaDestino,
            avisoNeutral,
            avisoPendiente,
            botonPrincipal,
            botonSecundario,
            buildMasterStudentProfile,
            busquedaAlumnoResumenDia,
            busquedaPistaAlumno,
            claveDomAlumnoResumenDia,
            fechaResumenDiaActiva,
            fichaAlumnoResumenDiaDesdeTexto,
            formatearObservaciones,
            grupoResumenDiaDestacado,
            gruposPendientesEntrenadorResumenDia,
            gruposPublicadosSesionResumenDia,
            guardandoAjustePista,
            guardandoCamisetaAlumnoId,
            horaCorta,
            hrefTelefonoAlumnoResumenDia,
            hrefWhatsappAlumnoResumenDia,
            inputCampo,
            labelCampo,
            mensajeAjustePista,
            miniBadge,
            miniTarjetaBlanca,
            moverAlumnoTrabajoPista,
            movimientoPistaAlumno,
            movimientoPistaDestino,
            nombreGrupoVisualApp,
            pantalla,
            renderAyudaRapidaPantallaApp,
            resultadosBusquedaAlumnoResumenDia,
            sesionesResumenDia,
            setAnadirPistaAlumnoId,
            setAnadirPistaDestino,
            setBusquedaAlumnoResumenDia,
            setBusquedaPistaAlumno,
            setFechaResumenDia,
            setMensajeAjustePista,
            setMovimientoPistaAlumno,
            setMovimientoPistaDestino,
            setTurnoResumenDiaAbierto,
            tarjetaEntrenadorMovil,
            tarjetaMovilVacia,
            telefonoAlumnoResumenDia,
            textoBusquedaAlumnoResumenDia,
            textoSinAcentosGrupoApp,
            totalAlumnosResumenDia,
            totalGruposResumenDia,
            totalPublicadosResumenDia,
            turnoResumenDiaAbierto,
          }}
        />
      )}
      {pantalla === 'informes' && (
        <ManagementReportsScreen
          ctx={{
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
          }}
        />
      )}
      {pantalla === 'temporadas' && (
        <SeasonManagementScreen
          ctx={{
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
          }}
        />
      )}
      <OperationalAnalysisScreen
        ctx={{
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
        }}
      />

      {pantalla === 'revisionOcio' && (
        <OcioReviewScreen
          ctx={{
            abrirEvaluacionOcio,
            agendaCabeceraLinea,
            asignarAlumnoGrupoOcio,
            botonPrincipal,
            botonSecundario,
            busquedaRevisionOcio,
            cabeceraPantallaMovil,
            cargarOcioAlumnos,
            cargarOcioCambios,
            cargarOcioGrupos,
            destinoRevisionOcio,
            etiquetaSuperior,
            filtroRevisionOcio,
            gridFormulario,
            gridResumenInicio,
            horaCorta,
            inputCampo,
            labelCampo,
            miniBadge,
            miniBadgeVerde,
            ocioGrupos,
            ocioRevisionBase,
            ocioRevisionFiltrada,
            pantalla,
            renderAyudaRapidaPantallaApp,
            selectCampo,
            setBusquedaRevisionOcio,
            setDestinoRevisionOcio,
            setFiltroRevisionOcio,
            tarjeta,
            tarjetaEntrenadorMovil,
            tarjetaInicioAlerta,
            tarjetaInicioRojo,
            tarjetaMovilVacia,
          }}
        />
      )}
      {pantalla === 'agenda' && (
        <AgendaScreen
          ctx={{
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
            alumnoReporteActivo,
            agendaVacioMini,
            alternativasTurnoAgendaPorAlumno,
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
            buscandoAlternativasTurnoAgenda,
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
            moverAlumnoPropuestaAOtroTurnoAgenda,
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
          }}
        />
      )}
      {pantalla === 'ocioAlumnos' && (
        <OcioStudentsScreen
          ctx={{
            abrirCentroEvaluacionOcioDesdeFicha,
            agendaBadgeModalidad,
            agendaBloqueBlanco,
            agendaCabeceraLinea,
            agendaHero,
            alternarHistorialAlumnoFichaApp,
            alumnosBabyIntensivos,
            anadiendoFichaAIntensivoId,
            asignarAlumnoGrupoOcio,
            avisoNeutral,
            añadirFichaExistenteAIntensivo,
            bloqueIdentidadFichaAlumnoApp,
            botonPeligro,
            botonPrincipal,
            botonSecundario,
            buscador,
            busquedaOcio,
            cargarAlumnos,
            cargarIntensivos,
            cargarOcioAlumnos,
            cargarOcioGrupos,
            editarAlumnoOcio,
            eliminarAlumnoOcio,
            esVistaMovilApp,
            filtroDiaFichasOcio,
            filtroModalidadHistorialFicha,
            formatearFecha,
            gridFormulario,
            guardarAlumnoOcio,
            historialAlumnoAbiertoId,
            historialReportesFichaCargandoId,
            historialReportesFichaPorAlumno,
            intensivoAlumnos,
            intensivoFichaSeleccionado,
            intensivos,
            labelCampo,
            limpiarFormularioOcioAlumno,
            miniBadge,
            miniTarjetaBlanca,
            mostrarNuevoOcio,
            ocioAlumnoEditandoId,
            ocioAlumnos,
            ocioAlumnosFiltrados,
            ocioDiaFijo,
            ocioFechaNacimiento,
            ocioGrupos,
            ocioHoraFin,
            ocioHoraInicio,
            ocioNivel,
            ocioNombre,
            ocioObservaciones,
            ocioRecomendacionesCambio,
            ocioTelefono,
            opcionesNivel,
            pantalla,
            perfilOperativoAlumnoApp,
            quitarAlumnoGrupoOcio,
            renderAyudaRapidaPantallaApp,
            selectCampo,
            selectorIntensivoFichaAbiertoId,
            setBusquedaOcio,
            setFiltroDiaFichasOcio,
            setFiltroEstadoFichasOcio,
            setFiltroModalidadHistorialFicha,
            setIntensivoFichaSeleccionado,
            setMostrarNuevoOcio,
            setOcioDiaFijo,
            setOcioFechaNacimiento,
            setOcioHoraFin,
            setOcioHoraInicio,
            setOcioNivel,
            setOcioNombre,
            setOcioObservaciones,
            setOcioTelefono,
            setPantalla,
            setSelectorIntensivoFichaAbiertoId,
            setVistaFichasAlumnos,
            tarjeta,
            tarjetaResaltada,
          }}
        />
      )}
      {pantalla === 'ocioEvaluaciones' && (
        <OcioEvaluationsScreen
          ctx={{
            abrirEvaluacionOcio,
            abrirInformeFamiliaOcioApp,
            abrirPantallaConScroll,
            agendaBloqueBlanco,
            agendaCabeceraLinea,
            alternarHistorialAlumnoFichaApp,
            avisoCompleto,
            avisoNeutral,
            botonPrincipal,
            botonSecundario,
            busquedaEvaluacionAnualOcio,
            cargando,
            cargarEvaluacionesAnualesOcio,
            compactLevelJourney,
            copiarEvaluacionOcio,
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
            evaluacionOcioActivaId,
            evaluacionOcioIndividualSeleccionadoId,
            evaluacionOcioTexto,
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
            setEvaluacionOcioActivaId,
            setEvaluacionOcioIndividualSeleccionadoId,
            setEvaluacionOcioTexto,
            setFiltroDiaEvaluacionesOcio,
          }}
        />
      )}
      {pantalla === 'ocioGrupos' && (
        <OcioGroupsScreen
          ctx={{
            abrirAltaTestDesdeOcioAimHarder,
            abrirFormularioCambioOcio,
            abrirGrupoOcioEnTrabajoSemanal,
            abrirNuevoGrupoOcio,
            abrirNuevoGrupoOcioParaAlumno,
            abrirNuevoGrupoOcioParaTurno,
            abrirPantallaConScroll,
            actualizarSemanaOcioDesdeAimHarder,
            agendaAlumnoLinea,
            agendaBloqueBlanco,
            agendaCabeceraLinea,
            agendaGrupoLinea,
            agendaGrupoPropuesta,
            agendaGrupoResumen,
            agendaVacio,
            agendaVacioMini,
            alumnoVieneOcioSemana,
            alumnosGrupoOcioEstable,
            alumnosTurnoOcio,
            analizarNuevoAlumnoOcio,
            anioInicioTemporadaAgenda,
            asignarAlumnoGrupoOcio,
            asignarRecomendacionAlumnoSinGrupoOcio,
            avisoCompleto,
            avisoEvolucionAlumnoOcio,
            avisoNeutral,
            avisoPendiente,
            botonAsistenciaAusente,
            botonAsistenciaOff,
            botonAsistenciaOk,
            botonMini,
            botonPeligro,
            botonPeligroMini,
            botonPrincipal,
            botonSecundario,
            buscarFichaNuevoOcio,
            cambiarAsistenciaOcioSemana,
            cambiarPistaPropuestaOcio,
            cambiosOcioSemana,
            capitalizarPrimera,
            cargarAgendaOperativaDirecta,
            cargarDisponibilidad,
            cargarEntrenadores,
            cargarOcioCambios,
            crearGrupoVacioPropuestaOcio,
            crearGruposEstablesDesdePropuestaOcio,
            deshacerPreparacionOcio,
            diaFijoOcioDesdeFecha,
            edadAproximadaOcio,
            edadOcioAlumnoEnFecha,
            editarGrupoOcio,
            eliminarCambioPuntualOcio,
            eliminarGrupoOcio,
            eliminarGrupoVacioPropuestaOcio,
            errorCaja,
            esTurnoOficialOcio,
            esVistaMovilApp,
            estiloGrupoPorPistaApp,
            estiloValidacionPedagogicaApp,
            explicacionCompactaPropuestaOcioApp,
            fechaCambioOcioPorDia,
            fechaGrupoOcioSemana,
            filaAlumnoAsistencia,
            formatearFecha,
            formatearObservaciones,
            generarPropuestaGruposOcio,
            gridFormulario,
            gridMiniMetricas,
            gruposOcioDiaSemana,
            guardarCambioPuntualOcio,
            guardarGrupoOcio,
            horaCorta,
            horarioTurnoOcio,
            incorporarNuevoAlumnoOcio,
            inputCampo,
            labelCampo,
            limpiarFormularioCambioOcio,
            mesAgendaActivo,
            mesesAgenda,
            miniTarjetaBlanca,
            mostrarFormularioOcioCambio,
            mostrarFormularioOcioGrupo,
            moverAlumnoEntrePropuestasOcio,
            nombreAlumnoOcioTarjetaApp,
            nombreGrupoSemanalOcio,
            nombreMesAgendaDesdeClave,
            normalizarNombreFueraPlazoAgenda,
            observacionesOcioSemana,
            ocioAimHarderCargando,
            ocioAimHarderError,
            ocioAimHarderEstadoAlumnos,
            ocioAimHarderMensaje,
            ocioAimHarderSemana,
            ocioAlumnoCambioSeleccionado,
            ocioAlumnoPendienteNuevoGrupoId,
            ocioAlumnos,
            ocioCambioForm,
            ocioGenerandoPropuesta,
            ocioGrupoForm,
            ocioGrupoFormInicial,
            ocioGrupos,
            ocioGuardandoPropuesta,
            ocioNuevoAlumnoId,
            ocioNuevoAnalizando,
            ocioNuevoGuardandoGrupoId,
            ocioNuevoNivel,
            ocioNuevoNombre,
            ocioNuevoRecomendaciones,
            ocioNuevoSugerencias,
            ocioPropuestaGrupos,
            ocioSemanaResultados,
            ocioTurnoVista,
            opcionesNivel,
            opcionesPista,
            opcionesTemporadaAgenda,
            pantalla,
            prepararDiaOcioSemana,
            quitarAlumnoGrupoOcio,
            rangoSemanaAgenda,
            recomendacionesAlumnoSinGrupoOcio,
            recomendacionesCambioPuntualOcio,
            renderAyudaRapidaPantallaApp,
            resultadoPerteneceDiaOcio,
            seleccionarFichaNuevoOcio,
            semanaActualAgenda,
            semanaAgendaActiva,
            semanasAgenda,
            setAnioInicioTemporadaAgenda,
            setBusquedaOcio,
            setFiltroDiaFichasOcio,
            setMesAgenda,
            setMostrarFormularioOcioGrupo,
            setOcioAlumnoPendienteNuevoGrupoId,
            setOcioCambioForm,
            setOcioGrupoForm,
            setOcioNuevoAlumnoId,
            setOcioNuevoNivel,
            setOcioNuevoNombre,
            setOcioNuevoRecomendaciones,
            setOcioNuevoSugerencias,
            setOcioPropuestaGrupos,
            setOcioTurnoVista,
            setSemanaAgendaInicio,
            tarjeta,
            tarjetaResaltada,
            textoSinAcentosGrupoApp,
            trabajoDiarioOcioSemana,
          }}
        />
      )}
      {pantalla === 'ocioCambios' && (
        <OcioChangesScreen
          ctx={{
            abrirFormularioCambioOcio,
            agendaBloqueBlanco,
            agendaCabeceraLinea,
            agendaHeroOcio,
            agendaVacio,
            anioInicioTemporadaAgenda,
            avisoCompleto,
            avisoNeutral,
            botonPeligroMini,
            botonPrincipal,
            botonSecundario,
            cambiosOcioSemana,
            capitalizarPrimera,
            cargarOcioAlumnos,
            cargarOcioCambios,
            cargarOcioGrupos,
            eliminarCambioPuntualOcio,
            etiquetaSuperior,
            fechaCambioOcioPorDia,
            formatearFecha,
            gridFormulario,
            gridResumenInicio,
            guardarCambioPuntualOcio,
            horaCorta,
            horarioTurnoOcio,
            labelCampo,
            limpiarFormularioCambioOcio,
            mesAgendaActivo,
            mesesAgenda,
            miniTarjetaBlanca,
            mostrarFormularioOcioCambio,
            nombreMesAgendaDesdeClave,
            ocioAlumnoCambioSeleccionado,
            ocioAlumnos,
            ocioCambioForm,
            ocioRevisionBase,
            opcionesTemporadaAgenda,
            panelRevisionIntegradaOcio,
            pantalla,
            rangoSemanaAgenda,
            renderAyudaRapidaPantallaApp,
            esVistaMovilApp,
            fechaGrupoOcioSemana,
            recomendacionesCambioPuntualOcio,
            selectCampo,
            semanaActualAgenda,
            semanaAgendaActiva,
            semanasAgenda,
            setAnioInicioTemporadaAgenda,
            setMesAgenda,
            setOcioCambioForm,
            setPantalla,
            setSemanaAgendaInicio,
            summaryChuletaApp,
            tarjeta,
            textareaCampo,
            textoSinAcentosGrupoApp,
          }}
        />
      )}
      {pantalla === 'ocioSemana' && (
        <OcioWeekScreen
          ctx={{
            abrirGrupoOcioEnTrabajoSemanal,
            abrirWhatsappSemanaOcio,
            agendaBloqueBlanco,
            agendaCabeceraLinea,
            agendaHero,
            agendaVacio,
            alumnoVieneOcioSemana,
            alumnosGrupoOcioEstable,
            anioInicioTemporadaAgenda,
            avisoCompleto,
            avisoNeutral,
            avisoPendiente,
            botonAsistenciaAusente,
            botonAsistenciaOff,
            botonAsistenciaOk,
            botonPrincipal,
            botonSecundario,
            cambiarAsistenciaOcioSemana,
            cambioEntradaOcio,
            cambiosOcioSemana,
            capitalizarPrimera,
            categoriaOcioGrupo,
            deshacerPreparacionOcio,
            edadOcioAlumnoEnFecha,
            entrenadorSeleccionadoOcioSemana,
            entrenadoresDisponiblesParaTurno,
            fechaGrupoOcioSemana,
            filaAlumnoAsistencia,
            formatearFecha,
            formatearObservaciones,
            gridFormulario,
            gruposOcioDiaSemana,
            horaCorta,
            labelCampo,
            mesAgendaActivo,
            mesesAgenda,
            nombreGrupoSemanalOcio,
            nombreMesAgendaDesdeClave,
            observacionesAutomaticasGrupoOcio,
            ocioGrupos,
            ocioAimHarderSemana,
            ocioAlumnos,
            ocioSemanaResultados,
            ocioTurnoVista,
            opcionesTemporadaAgenda,
            pantalla,
            prepararDiaOcioSemana,
            prepararGrupoOcioSemana,
            rangoSemanaAgenda,
            renderAyudaRapidaPantallaApp,
            resultadoPerteneceDiaOcio,
            semanaActualAgenda,
            semanaAgendaActiva,
            semanasAgenda,
            setAnioInicioTemporadaAgenda,
            setMesAgenda,
            setOcioSemanaEntrenadores,
            setPantalla,
            setSemanaAgendaInicio,
            tarjeta,
            trabajoDiarioOcioSemana,
          }}
        />
      )}
      {pantalla === 'inicio' && (
        <HomeScreen
          ctx={{
            FOTO_MITICO_HERO,
            abrirPantallaConScroll,
            actualizarTodo,
            agendaSesionesDirectas,
            avisos,
            capitalizarPrimera,
            cargando,
            cargarDetalleSesionAgenda,
            crearFechaAgenda,
            entrenadores,
            inicioSemanaAgenda,
            normalizarModalidadAgenda,
            pantalla,
            perfilUsuario,
            resumenInicio,
            semanaAgendaActiva,
            setAgendaDiaCompactoActivo,
            setAgendaFormularioAbierto,
            setAgendaSesionActivaId,
            setAnioInicioTemporadaAgenda,
            setBusquedaReportes,
            setError,
            setFiltroReportes,
            setMesAgenda,
            setPantalla,
            setSemanaAgendaInicio,
          }}
        />
      )}
      <PlanningHistoryScreen
        ctx={{
          alumnosReporteEntrenador,
          avisoCompleto,
          avisoNeutral,
          avisoPendiente,
          avisoReportePendiente,
          bloqueTexto,
          botonMenu,
          botonPeligro,
          botonPrincipal,
          botonSecundario,
          cabeceraPantalla,
          cargando,
          cargarDetalleGrupo,
          cargarPlanning,
          cierreJoseCaja,
          cierreJoseGrid,
          cierreJoseItem,
          cierreJoseLabel,
          despublicarGrupo,
          detalle,
          esNombreGrupoParticularApp,
          filtroPlanning,
          formatearAlumnosDetalle,
          formatearAlumnosPlanning,
          formatearFecha,
          formatearObservaciones,
          formatearTrabajoDiario,
          gruposEntrenador,
          nombreGrupoVisualApp,
          pantalla,
          planning,
          planningFiltrado,
          publicarGrupo,
          puntoEncuentroVisibleGrupoApp,
          renderAyudaRapidaPantallaApp,
          setDetalle,
          setFiltroPlanning,
          tarjeta,
          totalPlanningCerrados,
          totalPlanningPendientes,
          totalPlanningSinPublicar,
        }}
      />



      {pantalla === 'entrenador' && (
        <TrainerViewScreen
          ctx={{
            abrirFormularioReporte,
            abrirGrupoDesdeTareaEntrenador,
            activarPushEntrenadorApp,
            actualizarVistaEntrenadorCompletaApp,
            agendaVacio,
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
            gruposEntrenador: gruposVistaEntrenador,
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
          }}
        />
      )}
      {pantalla === 'reportes' && (
        <ReportsScreen
          ctx={{
            abrirPendienteCierreSemanal,
            anioInicioTemporadaAgenda,
            botonMenu,
            botonPrincipal,
            botonSecundario,
            buscador,
            busquedaReportes,
            cabeceraEntrenadorMovil,
            cargando,
            cargarReportesPendientes,
            copiarWhatsappPendientesEntrenador,
            copiarWhatsappPendientesReportes,
            enviandoRecordatorioReportesPushId,
            enviarRecordatorioReportesPushApp,
            error,
            esVistaMovilApp,
            etiquetaSuperior,
            filtroReportes,
            formatearFecha,
            mesAgendaActivo,
            mesesAgenda,
            miniTarjetaBlanca,
            nombreMesAgendaDesdeClave,
            nombreTemporadaAgenda,
            opcionesTemporadaAgenda,
            pantalla,
            rangoSemanaAgenda,
            renderAyudaRapidaPantallaApp,
            reportesFiltrados,
            reportesPorEntrenador,
            reportesSemanaCierre,
            selectCampoAgenda,
            semanaAgendaActiva,
            semanasAgenda,
            setAnioInicioTemporadaAgenda,
            setBusquedaReportes,
            setFiltroReportes,
            setMesAgenda,
            setSemanaAgendaInicio,
            tarjetaEntrenadorMovil,
            tarjetaMovilVacia,
          }}
        />
      )}
      <WhatsAppManagementScreen
        ctx={{
          abrirWhatsappAdministracionApp,
          avisoNeutral,
          botonPeligroMini,
          botonPrincipal,
          botonSecundario,
          cargando,
          contextoWhatsappAdministracionApp,
          eliminarWhatsappAdministracionApp,
          enlaceWhatsappPorClaveApp,
          esCoordinadorJefeApp,
          esEnlaceGrupoWhatsappValido,
          formatearFecha,
          guardarWhatsappAdministracionApp,
          inputCampo,
          intensivosAltaNivel,
          labelCampo,
          pantalla,
          renderAyudaRapidaPantallaApp,
          selectCampo,
          setWhatsappAdminEnlace,
          setWhatsappAdminIntensivoId,
          setWhatsappAdminTipo,
          tarjeta,
          whatsappAdminEnlace,
          whatsappAdminIntensivoId,
          whatsappAdminTipo,
        }}
      />

      {pantalla === 'administracion' && (
        <AdminEnrolmentScreen
          ctx={{
            abrirAltaTestDesdeImportacionApp,
            altaImportadaActivaClave,
            altaNivelAbiertaId,
            altaNivelInicialFormVacioApp,
            altaVisibleNivelInicialApp,
            altasImportadasGestionadas,
            altasImportadasInvalidas,
            altasImportadasLeidas,
            altasImportadasPendientes,
            altasImportadasSinComprobar,
            altasNivelInicial,
            anadiendoAltaNivelId,
            anadirAltaNivelAListados,
            analizandoImportarAltas,
            analizarListadoAltasPegadoApp,
            avisoCompleto,
            avisoNeutral,
            borrarRegistroTemporalAnadido,
            botonPeligro,
            botonPrincipal,
            botonSecundario,
            cargandoAltasNivel,
            cargarAltasNivelInicial,
            coincidenciasAltaNivel,
            comprobandoCoincidenciasAltaId,
            copiarEnlaceAltaNivel,
            crearAltaNivelInicial,
            descartarAltaNivelInicial,
            detalleImportacionAltasActivo,
            detallePreguntaTestNivelApp,
            detalleRespuestaAlta,
            eliminarAltaNivelInicial,
            enviarAltaNivelWhatsapp,
            esCoordinadorJefeApp,
            filtroAltasNivel,
            filtroModalidadAltasNivel,
            formAltaNivelInicial,
            formatearFecha,
            gridFormulario,
            guardandoAltaNivel,
            inputCampo,
            intensivoAltaSeleccionado,
            intensivosAltaNivel,
            labelCampo,
            limpiarImportadorAltasApp,
            mensajeImportacionAltas,
            miniBadge,
            miniTarjetaBlanca,
            mostrarFormularioAltaNivel,
            nivelesValidacionAlta,
            opcionesNivel,
            pantalla,
            parseTechnicalLevel,
            pegarListadoAltasDesdePortapapelesApp,
            perfilUsuario,
            puedeVerAdministracionAltasApp,
            renderAyudaRapidaPantallaApp,
            resolucionCoincidenciaAlta,
            resumenImportacionAltas,
            selectCampo,
            setAltaImportadaActivaClave,
            setAltaNivelAbiertaId,
            setAltasImportadasGestionadas,
            setAltasImportadasInvalidas,
            setAltasImportadasLeidas,
            setAltasImportadasPendientes,
            setAltasImportadasSinComprobar,
            setDetalleImportacionAltasActivo,
            setDetalleRespuestaAlta,
            setFiltroAltasNivel,
            setFiltroModalidadAltasNivel,
            setFormAltaNivelInicial,
            setIntensivoAltaSeleccionado,
            setMensajeImportacionAltas,
            setMostrarFormularioAltaNivel,
            setNivelesValidacionAlta,
            setResolucionCoincidenciaAlta,
            setResumenImportacionAltas,
            setTextoImportarAltas,
            tarjeta,
            textareaCampo,
            textoImportarAltas,
            totalEstadoAltasNivelApp,
            totalModalidadAltasNivelApp,
            validarAltaNivelInicial,
          }}
        />
      )}
      {pantalla === 'alumnos' && (
        <StudentRecordsScreen
          ctx={{
            abrirEvaluacionAlumno,
            abrirFiltroFichas,
            abrirPanelIntensivo,
            agendaBadgeModalidad,
            agendaBloqueBlanco,
            agendaHero,
            alternarHistorialAlumnoFichaApp,
            alumnoEditCamiseta,
            alumnoEditFechaNacimiento,
            alumnoEditNivel,
            alumnoEditNombre,
            alumnoEditOrigen,
            alumnoEditTelefono,
            alumnoEditandoId,
            alumnos,
            alumnosBabyIntensivos,
            alumnosFiltrados,
            anadiendoFichaAIntensivoId,
            avisoNeutral,
            avisoPendiente,
            añadirFichaExistenteAIntensivo,
            bloqueIdentidadFichaAlumnoApp,
            borrarAlumnoBase,
            botonMenu,
            botonMini,
            botonPeligroMini,
            botonPrincipal,
            botonSecundario,
            buscador,
            busquedaAlumno,
            cargando,
            cargarAlumnos,
            cargarIntensivos,
            cerrarEditorAlumnoBase,
            copiarEvaluacionAlumnoTexto,
            datosBasicosFichaAlumnoApp,
            editarAlumnoBaseRapido,
            esVistaMovilApp,
            evaluacionAlumnoActivaId,
            evaluacionAlumnoTexto,
            filtroAlumnos,
            filtroModalidadHistorialFicha,
            formatearFecha,
            gridFormulario,
            guardarAlumnoBase,
            historialAlumnoAbiertoId,
            historialReportesFichaCargandoId,
            historialReportesFichaPorAlumno,
            inputCampo,
            intensivoAlumnos,
            intensivoAsistencias,
            intensivoDias,
            intensivoFichaSeleccionado,
            intensivoMás,
            intensivos,
            labelCampo,
            miniBadge,
            miniTarjetaBlanca,
            ocioAlumnos,
            opcionesNivel,
            pantalla,
            perfilOperativoAlumnoApp,
            renderAyudaRapidaPantallaApp,
            reportesDetalleIntensivo,
            resumenFinalIntensivo,
            selectCampo,
            selectorIntensivoFichaAbiertoId,
            setAlumnoEditCamiseta,
            setAlumnoEditFechaNacimiento,
            setAlumnoEditNivel,
            setAlumnoEditNombre,
            setAlumnoEditOrigen,
            setAlumnoEditTelefono,
            setBusquedaAlumno,
            setBusquedaOcio,
            setEvaluacionAlumnoActivaId,
            setEvaluacionAlumnoTexto,
            setFiltroAlumnos,
            setFiltroDiaFichasOcio,
            setFiltroModalidadHistorialFicha,
            setIntensivoCursoAbiertoId,
            setIntensivoFichaSeleccionado,
            setPantalla,
            setSelectorIntensivoFichaAbiertoId,
            setVistaFichasAlumnos,
            tarjeta,
            vistaFichasAlumnos,
          }}
        />
      )}
      <UserAccessScreen
        ctx={{
          agendaBadgeModalidad,
          agendaBloqueBlanco,
          botonMini,
          botonPrincipal,
          botonSecundario,
          cargandoUsuariosOperativos,
          cargarUsuariosOperativos,
          crearUsuarioOperativo,
          error,
          esCoordinadorJefeApp,
          formUsuarioOperativo,
          gestionandoUsuarioOperativoId,
          gestionarUsuarioOperativo,
          gridFormulario,
          inputCampo,
          labelCampo,
          mostrarAltaUsuarioOperativo,
          pantalla,
          renderAyudaRapidaPantallaApp,
          rolUsuarioTextoApp,
          selectCampo,
          setFormUsuarioOperativo,
          setMostrarAltaUsuarioOperativo,
          tarjetaMovilVacia,
          usuariosOperativos,
        }}
      />

      <TrainerManagementScreen
        ctx={{
          abrirEditarEntrenador,
          abrirNuevoEntrenador,
          agendaBadgeModalidad,
          agendaBloqueBlanco,
          alternarEspecialidadEntrenador,
          botonMenu,
          botonMini,
          botonPeligro,
          botonPrincipal,
          botonSecundario,
          buscador,
          busquedaEntrenador,
          cabeceraPantalla,
          cargando,
          cargandoEstadosAccesoEntrenadores,
          cargandoEstadosAvisosEntrenadores,
          cargarEntrenadores,
          cargarEstadosAccesoEntrenadores,
          creandoAccesoEntrenadorId,
          crearAccesoAppEntrenador,
          eliminarEntrenadorGestion,
          entrenadoresFiltrados,
          entrenadorFormInicial,
          error,
          esCoordinadorApp,
          estadosAccesoEntrenadores,
          estadosAvisosEntrenadores,
          etiquetaSuperior,
          filtroEntrenadores,
          formEntrenador,
          gestionandoAccesoEntrenadorId,
          gestionarAccesoEntrenador,
          gridFormulario,
          gridMiniMetricas,
          guardarEntrenadorGestion,
          inputCampo,
          labelCampo,
          miniMetrica,
          miniTarjetaBlanca,
          mostrarFormularioEntrenador,
          opcionesDocumentoEntrenador,
          opcionesEspecialidadEntrenador,
          pantalla,
          pedirDatosAltaEntrenadorWhatsapp,
          puedeGestionarAccesosUsuarioApp,
          renderAyudaRapidaPantallaApp,
          selectCampo,
          setBusquedaEntrenador,
          setFiltroEntrenadores,
          setFormEntrenador,
          setMostrarFormularioEntrenador,
          tarjeta,
          tarjetaMovilVacia,
        }}
      />

      {pantalla === 'disponibilidad' && (
        <AvailabilityScreen
          ctx={{
            activarDiaDisponibilidadEditor,
            actualizarBorradorDisponibilidadEditor,
            actualizarTurnoDisponibilidadEditor,
            agendaBloqueBlanco,
            alternarModalidadDisponibilidadEditor,
            anioInicioTemporadaAgenda,
            añadirTurnoDisponibilidadEditor,
            borradorDisponibilidadEditor,
            botonAsistenciaAusente,
            botonAsistenciaOff,
            botonAsistenciaOk,
            busquedaDisponibilidad,
            capitalizarPrimera,
            cargando,
            categoriaResumenDisponibilidad,
            diaDisponibilidadEditorAbierto,
            diaPermiteVariosTurnosDisponibilidadEditor,
            diasTrabajoSemanaAgenda,
            disponibilidadPorTurno,
            disponibilidadSemanalEntrenador,
            duplicarTurnoDisponibilidadEditor,
            eliminarTurnoDisponibilidadEditor,
            error,
            estadoServidorDisponibilidadEditor,
            fechaLimiteAutomaticaDisponibilidadEditor,
            filtroDisponibilidad,
            formatearFecha,
            gridFormulario,
            guardandoDisponibilidadEditor,
            guardarBorradorDisponibilidadEditor,
            labelCampo,
            mensajeDisponibilidadEditor,
            mesAgendaActivo,
            mesesAgenda,
            nombreMesAgendaDesdeClave,
            nombreTemporadaAgenda,
            opcionesTemporadaAgenda,
            pantalla,
            publicadaAtDisponibilidadEditor,
            publicandoDisponibilidadEditor,
            publicarDisponibilidadEditor,
            rangoSemanaAgenda,
            responderDisponibilidadRapida,
            restaurarPlantillaDisponibilidadEditor,
            resumenBorradorDisponibilidadEditor,
            retirandoDisponibilidadEditor,
            retirarDisponibilidadEditor,
            selectCampoAgenda,
            semanaAgendaActiva,
            semanasAgenda,
            setAnioInicioTemporadaAgenda,
            setBusquedaDisponibilidad,
            setCategoriaResumenDisponibilidad,
            setDiaDisponibilidadEditorAbierto,
            setFiltroDisponibilidad,
            setMesAgenda,
            setSemanaAgendaInicio,
            setTurnoResumenDisponibilidadAbierto,
            setVistaPreviaDisponibilidadEditor,
            turnoResumenDisponibilidadAbierto,
            vistaPreviaDisponibilidadEditor,
          }}
        />
      )}
      {pantalla === 'cobros' && esCoordinadorJefeApp && (
        <section
          style={{
            display: 'grid',
            gap: 16,
            minWidth: 0,
          }}
        >
          <article
            style={{
              ...agendaHero,
              border: '1px solid rgba(16,185,129,0.28)',
              background:
                'linear-gradient(135deg, #062d3f 0%, #083b4d 58%, #0b5d4f 100%)',
              boxShadow: '0 18px 44px rgba(15,23,42,0.16)',
              color: '#ffffff',
            }}
          >
            <div style={{ minWidth: 0, flex: '1 1 440px' }}>
              <p
                style={{
                  margin: '0 0 5px',
                  color: '#86efac',
                  fontWeight: 950,
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                }}
              >
                Dirección · control mensual
              </p>
              <h2 style={{ margin: 0, color: '#ffffff', fontSize: 30 }}>
                Cobros entrenadores
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
                Resumen mensual unificado de Baby, Intensivos y Ocio. Turnos,
                tarifas, ajustes y cierre del mes en una sola vista.
              </p>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => void cargarCobrosDesdeSemanaActiva()}
                style={{
                  ...botonSecundario,
                  background: 'rgba(255,255,255,0.10)',
                  color: '#ffffff',
                  border: '1px solid rgba(255,255,255,0.26)',
                }}
                title="Vuelve al mes correspondiente a la semana de trabajo activa"
              >
                Actualizar
              </button>
              <button
                onClick={abrirPdfCobrosConjunto}
                style={{
                  ...botonPrincipal,
                  background: '#ffffff',
                  color: '#064e3b',
                  boxShadow: 'none',
                }}
              >
                PDF conjunto dirección
              </button>
            </div>
          </article>

          <article
            style={{
              ...agendaBloqueBlanco,
              border: '1px solid #dbeafe',
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.99), rgba(248,250,252,0.98))',
              boxShadow: '0 10px 28px rgba(15, 23, 42, 0.05)',
            }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                flexWrap: 'wrap',
                marginBottom: 12,
              }}
            >
              <div>
                <p
                  style={{
                    margin: '0 0 3px',
                    color: '#64748b',
                    fontSize: 11,
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase',
                  }}
                >
                  Periodo
                </p>
                <h3 style={{ margin: 0, color: '#172033' }}>Mes a revisar</h3>
              </div>
              <span
                style={{
                  padding: '7px 11px',
                  borderRadius: 999,
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  color: '#1d4ed8',
                  fontSize: 12,
                  fontWeight: 900,
                }}
              >
                {nombreMes(mesCobros)} {anioCobros}
              </span>
            </div>

            <div style={gridFormulario}>
              <label style={labelCampo}>
                Año
                <select
                  value={anioCobros}
                  onChange={(e) => setAnioCobros(Number(e.target.value))}
                  style={selectCampo}
                >
                  {aniosCobrosOpciones.map((anio) => (
                    <option key={anio} value={anio}>
                      {anio}
                    </option>
                  ))}
                </select>
              </label>
              <label style={labelCampo}>
                Mes
                <select
                  value={mesCobros}
                  onChange={(e) => setMesCobros(Number(e.target.value))}
                  style={selectCampo}
                >
                  {Array.from({ length: 12 }, (_, indice) => indice + 1).map(
                    (mes) => (
                      <option key={mes} value={mes}>
                        {nombreMes(mes)}
                      </option>
                    )
                  )}
                </select>
              </label>
              <div style={{ ...labelCampo, justifyContent: 'flex-end' }}>
                <button onClick={() => cargarCobros()} style={botonPrincipal}>
                  Ver mes
                </button>
              </div>
            </div>
          </article>

          <section
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
              gap: 10,
            }}
          >
            <article
              style={{
                ...miniTarjetaBlanca,
                border: '1px solid #bfdbfe',
                background:
                  'linear-gradient(135deg, #eff6ff, rgba(255,255,255,0.98))',
              }}
            >
              <strong style={{ color: '#1d4ed8' }}>Total mes</strong>
              <p
                style={{
                  fontSize: 26,
                  fontWeight: 950,
                  margin: '8px 0 0',
                  color: '#172033',
                }}
              >
                {formatearEuros(totalGeneralCobrosMes)}
              </p>
            </article>
            <article
              style={{
                ...miniTarjetaBlanca,
                border: '1px solid #cbd5e1',
                background:
                  'linear-gradient(135deg, #f8fafc, rgba(255,255,255,0.98))',
              }}
            >
              <strong style={{ color: '#475569' }}>Turnos</strong>
              <p
                style={{
                  fontSize: 26,
                  fontWeight: 950,
                  margin: '8px 0 0',
                  color: '#172033',
                }}
              >
                {totalTurnosCobrosMes}
              </p>
            </article>
            <article
              style={{
                ...miniTarjetaBlanca,
                border: '1px solid #bfdbfe',
                background:
                  'linear-gradient(135deg, #eff6ff, rgba(255,255,255,0.98))',
              }}
            >
              <strong style={{ color: '#2563eb' }}>Baby</strong>
              <p
                style={{
                  fontSize: 26,
                  fontWeight: 950,
                  margin: '8px 0 0',
                  color: '#172033',
                }}
              >
                {totalBabyCobrosMes}
              </p>
            </article>
            <article
              style={{
                ...miniTarjetaBlanca,
                border: '1px solid #fed7aa',
                background:
                  'linear-gradient(135deg, #fff7ed, rgba(255,255,255,0.98))',
              }}
            >
              <strong style={{ color: '#ea580c' }}>Intensivos</strong>
              <p
                style={{
                  fontSize: 26,
                  fontWeight: 950,
                  margin: '8px 0 0',
                  color: '#172033',
                }}
              >
                {totalIntensivosCobrosMes}
              </p>
            </article>
            <article
              style={{
                ...miniTarjetaBlanca,
                border: '1px solid #bbf7d0',
                background:
                  'linear-gradient(135deg, #f0fdf4, rgba(255,255,255,0.98))',
              }}
            >
              <strong style={{ color: '#16a34a' }}>Ocio</strong>
              <p
                style={{
                  fontSize: 26,
                  fontWeight: 950,
                  margin: '8px 0 0',
                  color: '#172033',
                }}
              >
                {totalOcioCobrosMes}
              </p>
            </article>
          </section>

          <article
            style={{
              ...agendaBloqueBlanco,
              padding: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 8px 22px rgba(15, 23, 42, 0.04)',
            }}
          >
            <input
              value={busquedaCobros}
              onChange={(e) => setBusquedaCobros(e.target.value)}
              placeholder="Buscar entrenador, temporada, mes, modalidad o estado..."
              style={{ ...buscador, marginBottom: 10 }}
            />

            <div
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                overflowX: 'auto',
                overscrollBehaviorX: 'contain',
                paddingBottom: 2,
              }}
            >
              <button
                onClick={() => setFiltroCobros('todos')}
                style={botonMenu(filtroCobros === 'todos')}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroCobros('pendiente')}
                style={botonMenu(filtroCobros === 'pendiente')}
              >
                Pendiente
              </button>
              <button
                onClick={() => setFiltroCobros('cerrado')}
                style={botonMenu(filtroCobros === 'cerrado')}
              >
                Cerrado / pagado
              </button>
              <button
                onClick={() => setFiltroCobros('incidencias')}
                style={botonMenu(filtroCobros === 'incidencias')}
              >
                Con incidencias
              </button>
              <button
                onClick={() => setFiltroCobros('este_mes')}
                style={botonMenu(filtroCobros === 'este_mes')}
              >
                Este mes
              </button>
            </div>
          </article>

          {cargando && (
            <article
              style={{
                ...agendaBloqueBlanco,
                border: '1px solid #dbeafe',
                color: '#1d4ed8',
                fontWeight: 800,
              }}
            >
              Cargando cobros...
            </article>
          )}

          {!cargando && cobrosFiltrados.length === 0 && !error && (
            <article
              style={{
                ...tarjeta,
                border: '1px solid #cbd5e1',
                background:
                  'linear-gradient(135deg, #f8fafc, rgba(255,255,255,0.98))',
              }}
            >
              <p
                style={{
                  margin: '0 0 4px',
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  color: '#64748b',
                }}
              >
                Resultado del mes
              </p>
              <h3 style={{ margin: 0 }}>Sin cobros</h3>
              <p style={{ margin: '7px 0 0', color: '#64748b' }}>
                No hay turnos con entrenador asignado para este mes. Cuando
                prepares o publiques grupos de Baby, Intensivos u Ocio,
                aparecerán aquí.
              </p>
            </article>
          )}

          <section style={{ display: 'grid', gap: 14, minWidth: 0 }}>
            {cobrosFiltrados.map((cobro) => {
              const detalles = detallesDeCobro(cobro.entrenador_id);
              const estadoCobro = String(cobro.estado_mes || 'abierto').toLowerCase();
              const colorEstado =
                estadoCobro === 'pagado'
                  ? '#16a34a'
                  : estadoCobro === 'cerrado'
                  ? '#2563eb'
                  : estadoCobro === 'revisado'
                  ? '#7c3aed'
                  : '#f59e0b';
              const fondoEstado =
                estadoCobro === 'pagado'
                  ? '#f0fdf4'
                  : estadoCobro === 'cerrado'
                  ? '#eff6ff'
                  : estadoCobro === 'revisado'
                  ? '#f5f3ff'
                  : '#fffbeb';

              return (
                <article
                  key={`${cobro.entrenador_id}-${cobro.anio}-${cobro.mes}`}
                  style={{
                    ...tarjeta,
                    minWidth: 0,
                    border: '1px solid #e2e8f0',
                    borderLeft: `5px solid ${colorEstado}`,
                    boxShadow: '0 12px 30px rgba(15, 23, 42, 0.06)',
                    background:
                      'linear-gradient(180deg, rgba(255,255,255,0.99), rgba(248,250,252,0.96))',
                  }}
                >
                  <div
                    style={{
                      ...agendaCabeceraLinea,
                      gap: 14,
                      alignItems: 'flex-start',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          alignItems: 'center',
                          flexWrap: 'wrap',
                        }}
                      >
                        <h3 style={{ margin: 0, color: '#172033' }}>
                          {cobro.entrenador}
                        </h3>
                        <span
                          style={{
                            padding: '5px 9px',
                            borderRadius: 999,
                            background: fondoEstado,
                            border: `1px solid ${colorEstado}33`,
                            color: colorEstado,
                            fontSize: 11,
                            fontWeight: 950,
                            textTransform: 'uppercase',
                            letterSpacing: '0.04em',
                          }}
                        >
                          {cobro.estado_mes}
                        </span>
                      </div>
                      <p style={{ margin: '6px 0 0', color: '#64748b' }}>
                        {nombreMes(cobro.mes)} {cobro.anio} · {cobro.temporada}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right', flex: '0 0 auto' }}>
                      <p
                        style={{
                          fontSize: 28,
                          fontWeight: 950,
                          margin: 0,
                          color: '#172033',
                        }}
                      >
                        {formatearEuros(cobro.total_mes)}
                      </p>
                      <p style={{ margin: '4px 0 0', color: '#64748b' }}>
                        {cobro.total_turnos_computables} turnos
                      </p>
                    </div>
                  </div>

                  <section
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(125px, 1fr))',
                      gap: 8,
                      marginTop: 12,
                    }}
                  >
                    <div
                      style={{
                        ...miniTarjetaBlanca,
                        background: '#eff6ff',
                        border: '1px solid #dbeafe',
                      }}
                    >
                      <strong style={{ color: '#2563eb' }}>Baby</strong>
                      <br />
                      {cobro.total_turnos_baby || 0} turnos
                    </div>
                    <div
                      style={{
                        ...miniTarjetaBlanca,
                        background: '#fff7ed',
                        border: '1px solid #ffedd5',
                      }}
                    >
                      <strong style={{ color: '#ea580c' }}>Intensivos</strong>
                      <br />
                      {cobro.total_turnos_intensivos || 0} turnos
                    </div>
                    <div
                      style={{
                        ...miniTarjetaBlanca,
                        background: '#f0fdf4',
                        border: '1px solid #dcfce7',
                      }}
                    >
                      <strong style={{ color: '#16a34a' }}>Ocio</strong>
                      <br />
                      {cobro.total_turnos_ocio || 0} turnos
                    </div>
                    <div
                      style={{
                        ...miniTarjetaBlanca,
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <strong>Subtotal</strong>
                      <br />
                      {formatearEuros(cobro.subtotal_sesiones)}
                    </div>
                    <div
                      style={{
                        ...miniTarjetaBlanca,
                        background:
                          Number(cobro.ajustes_total || 0) !== 0
                            ? '#fefce8'
                            : '#f8fafc',
                        border:
                          Number(cobro.ajustes_total || 0) !== 0
                            ? '1px solid #fde68a'
                            : '1px solid #e2e8f0',
                      }}
                    >
                      <strong>Ajustes</strong>
                      <br />
                      {formatearEuros(cobro.ajustes_total)}
                    </div>
                  </section>

                  <div
                    style={{
                      marginTop: 12,
                      padding: 12,
                      borderRadius: 14,
                      background: 'rgba(248, 250, 252, 0.92)',
                      border: '1px solid #e2e8f0',
                      display: 'grid',
                      gap: 10,
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'minmax(180px, 1fr) auto',
                        gap: 8,
                        alignItems: 'end',
                      }}
                    >
                      <label style={labelCampo}>
                        Tarifa por sesión
                        <input
                          type="number"
                          value={
                            tarifasEditadasCobros[cobro.entrenador_id] ??
                            String(cobro.tarifa_por_turno ?? 0)
                          }
                          onChange={(e) =>
                            setTarifasEditadasCobros({
                              ...tarifasEditadasCobros,
                              [cobro.entrenador_id]: e.target.value,
                            })
                          }
                          style={inputCampo}
                        />
                      </label>
                      <button
                        onClick={() => guardarTarifaCobro(cobro)}
                        style={botonSecundario}
                      >
                        Guardar tarifa
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
                      <button
                        onClick={() => abrirEntrenoManualCobro(cobro)}
                        style={
                          entrenoManualCobroAbiertoId === cobro.entrenador_id
                            ? botonPrincipal
                            : botonSecundario
                        }
                      >
                        + Añadir entrenamiento
                      </button>
                      <button
                        onClick={() => crearAjusteCobro(cobro)}
                        style={botonSecundario}
                      >
                        + Ajuste manual
                      </button>
                      <button
                        onClick={() => abrirPdfCobroEntrenador(cobro)}
                        style={botonPrincipal}
                      >
                        PDF individual
                      </button>
                    </div>

                    {entrenoManualCobroAbiertoId === cobro.entrenador_id && (
                      <section
                        style={{
                          marginTop: 2,
                          paddingTop: 12,
                          borderTop: '1px solid #e2e8f0',
                          display: 'grid',
                          gap: 10,
                        }}
                      >
                        <div>
                          <strong>Añadir entrenamiento a {cobro.entrenador}</strong>
                          <p
                            style={{
                              margin: '4px 0 0',
                              color: '#64748b',
                              fontSize: 12,
                              lineHeight: 1.4,
                            }}
                          >
                            Solo para una sesión que no esté registrada ya en Baby,
                            Intensivos u Ocio. Contará como un turno normal del mes.
                          </p>
                        </div>

                        <div style={gridFormulario}>
                          <label style={labelCampo}>
                            Fecha
                            <input
                              type="date"
                              value={formCobroManual.fecha}
                              onChange={(e) =>
                                setFormCobroManual({
                                  ...formCobroManual,
                                  fecha: e.target.value,
                                })
                              }
                              style={inputCampo}
                            />
                          </label>
                          <label style={labelCampo}>
                            Inicio
                            <input
                              type="time"
                              value={formCobroManual.horaInicio}
                              onChange={(e) =>
                                setFormCobroManual({
                                  ...formCobroManual,
                                  horaInicio: e.target.value,
                                })
                              }
                              style={inputCampo}
                            />
                          </label>
                          <label style={labelCampo}>
                            Fin
                            <input
                              type="time"
                              value={formCobroManual.horaFin}
                              onChange={(e) =>
                                setFormCobroManual({
                                  ...formCobroManual,
                                  horaFin: e.target.value,
                                })
                              }
                              style={inputCampo}
                            />
                          </label>
                          <label style={labelCampo}>
                            Modalidad
                            <select
                              value={formCobroManual.modalidad}
                              onChange={(e) =>
                                setFormCobroManual({
                                  ...formCobroManual,
                                  modalidad: e.target.value,
                                })
                              }
                              style={selectCampo}
                            >
                              <option value="BABY">Baby</option>
                              <option value="INTENSIVOS">Intensivos</option>
                              <option value="OCIO">Ocio</option>
                            </select>
                          </label>
                          <label style={labelCampo}>
                            Nombre / motivo
                            <input
                              value={formCobroManual.nombreGrupo}
                              onChange={(e) =>
                                setFormCobroManual({
                                  ...formCobroManual,
                                  nombreGrupo: e.target.value,
                                })
                              }
                              placeholder="Apoyo pista / sustitución / entrenamiento..."
                              style={inputCampo}
                            />
                          </label>
                          <label style={labelCampo}>
                            Niños
                            <input
                              type="number"
                              value={formCobroManual.totalAlumnos}
                              onChange={(e) =>
                                setFormCobroManual({
                                  ...formCobroManual,
                                  totalAlumnos: e.target.value,
                                })
                              }
                              style={inputCampo}
                            />
                          </label>
                          <label style={labelCampo}>
                            Importe especial opcional
                            <input
                              value={formCobroManual.importeOverride}
                              onChange={(e) =>
                                setFormCobroManual({
                                  ...formCobroManual,
                                  importeOverride: e.target.value,
                                })
                              }
                              placeholder="Vacío = tarifa del entrenador"
                              style={inputCampo}
                            />
                          </label>
                          <label style={{ ...labelCampo, gridColumn: '1 / -1' }}>
                            Observaciones
                            <textarea
                              value={formCobroManual.observaciones}
                              onChange={(e) =>
                                setFormCobroManual({
                                  ...formCobroManual,
                                  observaciones: e.target.value,
                                })
                              }
                              rows={2}
                              placeholder="Nota para dirección si hace falta..."
                              style={textareaCampo}
                            />
                          </label>
                        </div>

                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                          }}
                        >
                          <button
                            onClick={crearEntrenoManualCobro}
                            style={botonPrincipal}
                          >
                            Añadir entrenamiento
                          </button>
                          <button
                            onClick={() => {
                              setFormCobroManual(cobroManualInicial());
                              setEntrenoManualCobroAbiertoId('');
                            }}
                            style={botonSecundario}
                          >
                            Cancelar
                          </button>
                        </div>
                      </section>
                    )}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                      marginTop: 10,
                      paddingTop: 10,
                      borderTop: '1px solid #e2e8f0',
                    }}
                  >
                    <button
                      onClick={() => cambiarEstadoCobro(cobro, 'abierto')}
                      style={botonMenu(cobro.estado_mes === 'abierto')}
                    >
                      Abierto
                    </button>
                    <button
                      onClick={() => cambiarEstadoCobro(cobro, 'revisado')}
                      style={botonMenu(cobro.estado_mes === 'revisado')}
                    >
                      Revisado
                    </button>
                    <button
                      onClick={() => cambiarEstadoCobro(cobro, 'cerrado')}
                      style={botonMenu(cobro.estado_mes === 'cerrado')}
                    >
                      Cerrado
                    </button>
                    <button
                      onClick={() => cambiarEstadoCobro(cobro, 'pagado')}
                      style={botonMenu(cobro.estado_mes === 'pagado')}
                    >
                      Pagado
                    </button>
                    {Number(cobro.ajustes_total || 0) !== 0 && (
                      <button
                        onClick={() => limpiarAjustesCobro(cobro)}
                        style={botonPeligroMini}
                      >
                        Limpiar ajustes
                      </button>
                    )}
                  </div>

                  {cobro.nota_direccion && (
                    <div style={{ ...avisoCompleto, marginTop: 10 }}>
                      <strong>Nota dirección:</strong> {cobro.nota_direccion}
                    </div>
                  )}

                  {cobro.pendientes_revisar > 0 && (
                    <div style={{ ...avisoPendiente, marginTop: 10 }}>
                      Hay {cobro.pendientes_revisar} turno(s) pendiente(s) de
                      revisar/publicar antes de cerrar el mes.
                    </div>
                  )}

                  <details
                    style={{
                      marginTop: 12,
                      border: '1px solid #e2e8f0',
                      borderRadius: 14,
                      background: '#fff',
                      overflow: 'hidden',
                    }}
                  >
                    <summary
                      style={{
                        cursor: 'pointer',
                        fontWeight: 900,
                        padding: '11px 13px',
                        color: '#334155',
                        background: '#f8fafc',
                      }}
                    >
                      Ver detalle de turnos ({detalles.length})
                    </summary>
                    <div
                      style={{
                        display: 'grid',
                        gap: 8,
                        padding: 10,
                        maxHeight: 360,
                        overflowY: 'auto',
                        overscrollBehavior: 'contain',
                        WebkitOverflowScrolling: 'touch',
                        scrollbarGutter: 'stable',
                      }}
                    >
                      {detalles.map((detalleCobro) => (
                        <div
                          key={`${detalleCobro.entrenador_id}-${detalleCobro.grupo_id}-${detalleCobro.fecha}-${detalleCobro.hora_inicio}`}
                          style={{
                            ...miniTarjetaBlanca,
                            border: '1px solid #e2e8f0',
                            background: '#fff',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 8,
                              alignItems: 'flex-start',
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <strong>
                                {formatearFecha(detalleCobro.fecha)} ·{' '}
                                {horaCorta(detalleCobro.hora_inicio)}-
                                {horaCorta(detalleCobro.hora_fin)} ·{' '}
                                {detalleCobro.modalidad}
                              </strong>
                              <p style={{ margin: '5px 0 0' }}>
                                {detalleCobro.origen_cobro === 'MANUAL' &&
                                detalleCobro.nombre_grupo === 'Entreno manual'
                                  ? 'Entrenamiento'
                                  : detalleCobro.nombre_grupo}{' '}
                                ·{' '}
                                {detalleCobro.total_alumnos} niños ·{' '}
                                {formatearEuros(detalleCobro.importe_turno)}
                              </p>
                              {detalleCobro.observaciones && (
                                <p
                                  style={{
                                    margin: '5px 0 0',
                                    color: '#64748b',
                                  }}
                                >
                                  {detalleCobro.observaciones}
                                </p>
                              )}
                            </div>
                            {detalleCobro.origen_cobro === 'MANUAL' && (
                              <button
                                onClick={() =>
                                  eliminarEntrenoManualCobro(detalleCobro)
                                }
                                style={{
                                  ...botonMini,
                                  background: '#ffffff',
                                  color: '#64748b',
                                  border: '1px solid #cbd5e1',
                                }}
                              >
                                Eliminar
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </details>

                  {cobro.detalle_ajustes && (
                    <details
                      style={{
                        marginTop: 10,
                        border: '1px solid #fde68a',
                        borderRadius: 14,
                        background: '#fff',
                        overflow: 'hidden',
                      }}
                    >
                      <summary
                        style={{
                          cursor: 'pointer',
                          fontWeight: 900,
                          padding: '11px 13px',
                          color: '#854d0e',
                          background: '#fefce8',
                        }}
                      >
                        Ver ajustes manuales
                      </summary>
                      <div
                        style={{
                          maxHeight: 280,
                          overflowY: 'auto',
                          overscrollBehavior: 'contain',
                          WebkitOverflowScrolling: 'touch',
                          scrollbarGutter: 'stable',
                          padding: 10,
                        }}
                      >
                        <pre style={{ ...bloqueTexto, margin: 0 }}>
                          {cobro.detalle_ajustes}
                        </pre>
                      </div>
                    </details>
                  )}
                </article>
              );
            })}
          </section>
        </section>
      )}

      {pantalla === 'intensivos' &&
        cabeceraIntensivosAyudaApp &&
        createPortal(renderAyudaRapidaPantallaApp(), cabeceraIntensivosAyudaApp)}

      {pantalla === 'intensivos' &&
        PantallaIntensivos({
          abrirFichaMaestraAlumnoApp,
          abrirPanelIntensivo,
          actualizarDiaIntensivoDesdeApp,
          actualizarDiplomaIntensivo,
          actualizarNivelAlumnoIntensivo,
          actualizarRecuperacionIntensivo,
          agendaBadgeModalidad,
          agendaAlumnoLinea,
          agendaGrupoLinea,
          agendaGrupoPropuesta,
          agruparRecomendacionesDia,
          alumnoSeleccionadoIntensivoId,
          alumnosDelIntensivo,
          alumnosDisponiblesParaIntensivo,
          asistenciasDelIntensivoDia,
          autoproponerNivelesDiploma,
          cambiarEstadoIntensivoCurso,
          avisoCompleto,
          avisoDisponibilidadDiaIntensivo,
          avisoNeutral,
          avisoPendiente,
          ayudaDesplegableCompacta,
          añadirAlumnoAIntensivo,
          barraPasosIntensivo,
          borrarDiaIntensivoDesdeApp,
          borrarGrupoIntensivo,
          borrarIntensivoCompleto,
          botonMenu,
          botonPasoIntensivo,
          botonPeligro,
          botonPeligroMini,
          botonPrincipal,
          botonSecundario,
          buscador,
          busquedaAlumnoIntensivo,
          busquedaIntensivos,
          cabeceraPantalla,
          calcularFechasCuatroSesionesIntensivo,
          cargando,
          cargarIntensivos,
          cerrarPanelesIntensivo,
          chipResumenCursoIntensivo,
          claveAlumnoRecomendado,
          claveGrupoRecomendado,
          codigoNivelPorId,
          crearCuatroSesionesIntensivo,
          crearGrupoDesdeRecomendacion,
          crearTodosGruposDesdeRecomendacionIntensivo,
          crearGrupoNormalIntensivo,
          crearGrupoVacioPropuestaIntensivo,
          generarPlantillaCuatroDiasIntensivo,
          crearPlantillaCuatroDiasIntensivo,
          cargarEdicionGruposIntensivoDia,
          abrirGestionOperativaIntensivoDia,
          guardarComposicionDiaIntensivo,
          crearIntensivoDesdeApp,
          destinoAlumnoRecomendado,
          diaActivoIntensivoId,
          diaAsistenciaSeleccionadoId,
          diaEditandoIntensivoId,
          diaGrupoSeleccionadoId,
          diaIntensivoInicial,
          diasDelIntensivo,
          eliminarRecuperacionIntensivo,
          entrenadores,
          entrenadoresApoyoPorGrupoRecomendado,
          entrenadoresDisponiblesDiaIntensivo,
          entrenadoresPorGrupoRecomendado,
          error,
          esVistaMovilApp,
          enfocarElementoApp,
          estiloBadgePistaApp,
          estiloGrupoPorPistaApp,
          estiloValidacionPedagogicaApp,
          etiquetaPistaVisualApp,
          etiquetaSuperior,
          filtroIntensivos,
          formDiaIntensivo,
          formGrupoIntensivo,
          formIntensivo,
          temporadaActivaCierre,
          formatearAlumnoListadoOperativo,
          formatearFecha,
          formatearObservaciones,
          formularioCaja,
          generarMásDesdeAsistencias,
          generarRecomendacionGruposIntensivo,
          generarTrabajoDiarioAutomaticoGrupo,
          gestionarAlumnosIntensivoId,
          gestionarAsistenciaIntensivoId,
          gestionarDiplomasIntensivoId,
          gestionarGruposIntensivoId,
          gestionarMásIntensivoId,
          gestionarPanelControlIntensivoId,
          gridFormulario,
          gruposDestinoRecuperacion,
          gruposNormalesDelDiaIntensivo,
          guardarDiaIntensivo,
          inputCampo,
          intensivoCursoAbiertoId,
          intensivoInicial,
          intensivos,
          intensivosFiltrados,
          labelCampo,
          marcarAsistenciaIntensivo,
          reiniciarGruposDiaIntensivoDesdeApp,
          mesIntensivos,
          miniTarjetaBlanca,
          mostrarFormularioIntensivo,
          mostrarPlantillaCuatroSesionesIntensivoId,
          mostrarVolcadoIntensivoId,
          necesitaDosEntrenadoresGrupoApp,
          nivelesDiplomaIntensivo,
          nombreGrupoVisualApp,
          nombresGruposBaseRecomendados,
          observacionesAutomaticasGrupoIntensivo,
          observacionesAutomaticasGrupoIntensivoManual,
          observacionesPorGrupoRecomendado,
          opcionesEstadoDiplomaIntensivo,
          opcionesEstadoRecuperacionIntensivo,
          opcionesNivel,
          opcionesOrigenNivelAlumno,
          opcionesPistaGrupoIntensivo,
          opcionesRecomendacionIntensivo,
          panelControlDelIntensivo,
          perfilOperativoAlumnoApp,
          plantillaCuatroSesionesInicial,
          plantillaCuatroSesionesIntensivo,
          prepararEdicionDiaIntensivo,
          prepararCambioRevisionIntensivo,
          moverAlumnoManualRevisionIntensivo,
          analizarRevisionEntreSesionesIntensivo,
          revisionIntensivoId,
          revisionIntensivoDiaId,
          revisionIntensivoSugerencias,
          revisionIntensivoAnalizando,
          revisionIntensivoAnalizado,
          setRevisionIntensivoDiaId,
          setRevisionIntensivoSugerencias,
          setRevisionIntensivoAnalizado,
          quitarAlumnoDeIntensivo,
          recomendacionesDelDiaIntensivo,
          recuperacionesDelIntensivo,
          recomendacionesRecuperacion,
          recomendacionesDeRecuperacion,
          aprobarRecuperacionInteligente,
          reportesDetalleAlumnoIntensivo,
          responsableReporteRecomendadoApp,
          responsablesReportePorGrupoRecomendado,
          resultadoVolcadoIntensivo,
          resumenAlumnoIntensivo,
          resumenFinalDelIntensivo,
          resumenReportesDelIntensivo,
          selectCampo,
          setAlumnoSeleccionadoIntensivoId,
          setBusquedaAlumnoIntensivo,
          setBusquedaIntensivos,
          setDestinoAlumnoRecomendado,
          setDiaEditandoIntensivoId,
          setDiaGrupoSeleccionadoId,
          setEntrenadoresApoyoPorGrupoRecomendado,
          setEntrenadoresPorGrupoRecomendado,
          setFiltroIntensivos,
          setMesIntensivos,
          setFormDiaIntensivo,
          setFormGrupoIntensivo,
          setFormIntensivo,
          setGestionarAlumnosIntensivoId,
          setGestionarDiplomasIntensivoId,
          setGestionarMásIntensivoId,
          setIntensivoCursoAbiertoId,
          setMostrarFormularioIntensivo,
          setMostrarPlantillaCuatroSesionesIntensivoId,
          setMostrarVolcadoIntensivoId,
          setObservacionesPorGrupoRecomendado,
          setPlantillaCuatroSesionesIntensivo,
          setRecomendacionesGrupoIntensivo,
          setResponsablesReportePorGrupoRecomendado,
          setResultadoVolcadoIntensivo,
          setTextoVolcadoIntensivo,
          setTrabajoDiarioPorGrupoRecomendado,
          tarjeta,
          tarjetaIntensivoCurso,
          textoBaseDiplomaIntensivo,
          textoNecesidadDosEntrenadoresApp,
          textoValidacionPedagogicaGrupoApp,
          textoVolcadoIntensivo,
          trabajoDiarioPorGrupoRecomendado,
          volcarListadoAlumnosIntensivo,
        })}

      <LoadedListingsScreen
        ctx={{
          botonMenu,
          buscador,
          busquedaListados,
          cabeceraPantalla,
          cargando,
          cargarListados,
          error,
          filtroListados,
          formatearFecha,
          listadosFiltrados,
          pantalla,
          renderAyudaRapidaPantallaApp,
          setBusquedaListados,
          setFiltroListados,
          tarjeta,
        }}
      />




      </div>
    </main>
  );
}

function AppConAuth() {
  const [sesion, setSesion] = useState<SesionAuthApp | null>(null);
  const [perfil, setPerfil] = useState<PerfilUsuarioApp | null>(null);
  const [sesionInvitacion, setSesionInvitacion] =
    useState<SesionAuthApp | null>(null);
  const [modoPasswordUrl, setModoPasswordUrl] = useState<
    'invite' | 'recovery'
  >('invite');
  const [cargandoAuth, setCargandoAuth] = useState(true);
  const [errorAuth, setErrorAuth] = useState('');

  async function activarSesion(nuevaSesion: SesionAuthApp) {
    const usuario = nuevaSesion.user.id
      ? nuevaSesion.user
      : await obtenerUsuarioAuthApp(nuevaSesion.access_token);
    const sesionCompleta = { ...nuevaSesion, user: usuario };
    const perfilUsuario = await cargarPerfilUsuarioApp(
      sesionCompleta.access_token,
      usuario.id
    );

    if (!perfilUsuario) {
      borrarSesionAuthApp();
      setSesion(null);
      setPerfil(null);
      setErrorAuth(
        `La cuenta ${
          usuario.email || ''
        } existe en Supabase Auth, pero todavía no tiene perfil en usuarios_app. Crea/vincula el perfil y vuelve a entrar.`
      );
      return;
    }

    guardarSesionAuthApp(sesionCompleta);
    setSesion(sesionCompleta);
    setPerfil(perfilUsuario);
    setErrorAuth('');
  }

  useEffect(() => {
    async function iniciarAuth() {
      try {
        const sesionUrl = extraerSesionInvitacionDesdeUrlApp();
        if (sesionUrl) {
          setModoPasswordUrl(tipoFlujoPasswordDesdeUrlApp());
          setSesionInvitacion(sesionUrl);
          setCargandoAuth(false);
          return;
        }

        const guardada = leerSesionGuardadaApp();
        if (!guardada) {
          setCargandoAuth(false);
          return;
        }

        try {
          const usuario = await obtenerUsuarioAuthApp(guardada.access_token);
          await activarSesion({ ...guardada, user: usuario });
        } catch (error) {
          if (guardada.refresh_token) {
            const refrescada = await refrescarSesionAuthApp(
              guardada.refresh_token
            );
            await activarSesion(refrescada);
          } else {
            borrarSesionAuthApp();
          }
        }
      } catch (error: any) {
        borrarSesionAuthApp();
        setErrorAuth(error?.message || 'No se ha podido comprobar la sesión.');
      } finally {
        setCargandoAuth(false);
      }
    }

    iniciarAuth();
  }, []);

  async function login(email: string, password: string) {
    const nuevaSesion = await iniciarSesionEmailPasswordApp(email, password);
    await activarSesion(nuevaSesion);
  }

  async function recuperarPassword(email: string) {
    await solicitarRecuperacionPasswordApp(email);
  }

  async function completarInvitacion(sesionNueva: SesionAuthApp) {
    await activarSesion(sesionNueva);
    setSesionInvitacion(null);
  }

  function salir() {
    borrarSesionAuthApp();
    setSesion(null);
    setPerfil(null);
    setSesionInvitacion(null);
    setErrorAuth('');
    limpiarUrlAuthApp();
  }

  if (cargandoAuth) {
    return (
      <main style={authShellApp}>
        <section style={authCardApp}>
          <h1 style={{ marginTop: 0 }}>Cargando acceso...</h1>
          <p style={{ color: '#475569' }}>Comprobando sesión privada.</p>
        </section>
      </main>
    );
  }

  if (sesionInvitacion) {
    return (
      <PantallaCrearPasswordApp
        sesionInvitacion={sesionInvitacion}
        modo={modoPasswordUrl}
        onCompletado={completarInvitacion}
      />
    );
  }

  if (errorAuth && !sesion && !perfil) {
    return <PantallaAuthErrorApp mensaje={errorAuth} onSalir={salir} />;
  }

  if (!sesion || !perfil) {
    return (
      <PantallaLoginApp
        onLogin={login}
        onRecuperarPassword={recuperarPassword}
      />
    );
  }

  return <AppContenido perfilUsuario={perfil} onLogout={salir} />;
}

export default function App() {
  const tokenTestNivel = tokenTestNivelDesdeUrlApp();

  return (
    <PantallaSegura>
      {tokenTestNivel ? (
        <PantallaTestNivelPublicoApp token={tokenTestNivel} />
      ) : (
        <AppConAuth />
      )}
    </PantallaSegura>
  );
}
