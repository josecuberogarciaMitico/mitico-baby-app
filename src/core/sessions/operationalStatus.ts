import type {
  AlumnoReporteEntrenador,
  GrupoEntrenadorApp,
  GrupoPlanning,
  PlanningStatus,
  ReportePendiente,
  ResumenInicio,
} from './operationalTypes';

type FollowUpRow = Pick<
  AlumnoReporteEntrenador,
  'grupo_id' | 'entrenador_id' | 'estado_asistencia' | 'estado_reporte'
>;

type DateWindow = { start: string; end: string };

export function isMissingReport(row: Pick<FollowUpRow, 'estado_reporte'>): boolean {
  return row.estado_reporte === 'Falta reporte';
}

export function isAttendanceUnconfirmed(
  row: Pick<FollowUpRow, 'estado_asistencia' | 'estado_reporte'>
): boolean {
  return row.estado_asistencia === 'Pendiente' || row.estado_reporte === 'Asistencia sin confirmar';
}

export function isStudentFollowUpPending(row: FollowUpRow): boolean {
  return isMissingReport(row) || isAttendanceUnconfirmed(row);
}

export function isTrainerConfirmationPending(
  group: Pick<GrupoEntrenadorApp, 'estado_confirmacion'>
): boolean {
  return group.estado_confirmacion !== 'Confirmado';
}

function isWithinWindow(date: string, window?: DateWindow): boolean {
  return !window || (Boolean(date) && date >= window.start && date <= window.end);
}

export function summarizeOperationalDashboard(
  reports: ReportePendiente[],
  planning: GrupoPlanning[],
  trainerGroups: GrupoEntrenadorApp[],
  window?: DateWindow
): ResumenInicio {
  const reportsInWindow = reports.filter((row) => isWithinWindow(row.fecha, window));
  const planningInWindow = planning.filter((row) => isWithinWindow(row.fecha, window));
  const trainerGroupsInWindow = trainerGroups.filter((row) => isWithinWindow(row.fecha, window));

  return {
    reportesPendientes: reportsInWindow.filter(isMissingReport).length,
    asistenciasSinConfirmar: reportsInWindow.filter(isAttendanceUnconfirmed).length,
    gruposSinPublicar: planningInWindow.filter((group) => !group.publicado).length,
    entrenadoresSinConfirmar: trainerGroupsInWindow.filter(
      (group) => group.publicado && isTrainerConfirmationPending(group)
    ).length,
  };
}

export function planningGroupStatus(
  group: Pick<GrupoPlanning, 'grupo_id' | 'publicado'>,
  students: FollowUpRow[],
  trainerGroups: Array<Pick<GrupoEntrenadorApp, 'grupo_id' | 'estado_confirmacion'>>
): PlanningStatus {
  const groupStudents = students.filter((student) => student.grupo_id === group.grupo_id);
  const confirmations = trainerGroups.filter((item) => item.grupo_id === group.grupo_id);

  if (!group.publicado) return 'Sin publicar';
  if (confirmations.some(isTrainerConfirmationPending)) return 'Publicado · entrenador sin confirmar';
  if (groupStudents.some((student) => student.estado_asistencia === 'Pendiente')) return 'Asistencia pendiente';
  if (groupStudents.some(isMissingReport)) return 'Reportes pendientes';
  if (groupStudents.length > 0) return 'Grupo cerrado';
  return 'Publicado · pendiente de seguimiento';
}

export function trainerGroupHasPending(
  group: Pick<GrupoEntrenadorApp, 'grupo_id' | 'entrenador_id' | 'estado_confirmacion'>,
  students: FollowUpRow[]
): boolean {
  return (
    isTrainerConfirmationPending(group) ||
    students.some(
      (student) =>
        student.grupo_id === group.grupo_id &&
        student.entrenador_id === group.entrenador_id &&
        isStudentFollowUpPending(student)
    )
  );
}

export function selectTrainerVisibleGroups(
  groups: GrupoEntrenadorApp[],
  students: FollowUpRow[],
  window?: DateWindow
): GrupoEntrenadorApp[] {
  if (!window) return groups;
  return groups.filter(
    (group) =>
      isWithinWindow(group.fecha, window) ||
      (group.fecha < window.start && trainerGroupHasPending(group, students))
  );
}

export function selectStudentsForTrainerGroups(
  students: AlumnoReporteEntrenador[],
  groups: Array<Pick<GrupoEntrenadorApp, 'grupo_id' | 'entrenador_id'>>
): AlumnoReporteEntrenador[] {
  const groupKeys = new Set(groups.map((group) => `${group.entrenador_id}__${group.grupo_id}`));
  return students.filter((student) => groupKeys.has(`${student.entrenador_id}__${student.grupo_id}`));
}

export function pendingStudentsForTrainer(
  students: AlumnoReporteEntrenador[],
  trainerId: string
): AlumnoReporteEntrenador[] {
  return students.filter(
    (student) => student.entrenador_id === trainerId && isStudentFollowUpPending(student)
  );
}

export function unconfirmedGroupsForTrainer(
  groups: GrupoEntrenadorApp[],
  trainerId: string
): GrupoEntrenadorApp[] {
  return groups.filter(
    (group) => group.entrenador_id === trainerId && isTrainerConfirmationPending(group)
  );
}

export function trainerPendingTaskCount(
  groups: GrupoEntrenadorApp[],
  students: AlumnoReporteEntrenador[]
): number {
  return (
    groups.filter(isTrainerConfirmationPending).length +
    students.filter(isMissingReport).length +
    students.filter(isAttendanceUnconfirmed).length
  );
}
