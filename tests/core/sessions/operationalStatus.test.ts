import {
  isAttendanceUnconfirmed,
  isMissingReport,
  planningGroupStatus,
  selectStudentsForTrainerGroups,
  selectTrainerVisibleGroups,
  summarizeOperationalDashboard,
  trainerPendingTaskCount,
} from '../../../src/core/sessions/operationalStatus';
import type {
  AlumnoReporteEntrenador,
  GrupoEntrenadorApp,
  GrupoPlanning,
  ReportePendiente,
} from '../../../src/core/sessions/operationalTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

function report(overrides: Partial<AlumnoReporteEntrenador> = {}): AlumnoReporteEntrenador {
  return {
    entrenador_id: 'trainer', entrenador: 'Trainer', grupo_id: 'group', nombre_grupo: 'Group',
    publicado: true, fecha: '2026-09-15', hora_inicio: '10:00', hora_fin: '12:00',
    modalidad: 'BABY', alumno_id: 'student', alumno: 'Student', estado_asistencia: 'Presente',
    reporte_id: 'report', enviado_at: null, estado_reporte: 'Enviado', ...overrides,
  };
}

function group(overrides: Partial<GrupoEntrenadorApp> = {}): GrupoEntrenadorApp {
  return {
    entrenador_id: 'trainer', entrenador: 'Trainer', estado_confirmacion: 'Confirmado',
    confirmado_at: null, grupo_id: 'group', nombre_grupo: 'Group', nivel_grupo: 'A', pista: 'Pequeña',
    punto_encuentro: '5', estado_grupo: 'Publicado', publicado: true, fecha: '2026-09-15',
    hora_inicio: '10:00', hora_fin: '12:00', modalidad: 'BABY', alumnos: 'Student', total_alumnos: 1,
    trabajo_diario: 'Trabajo', observaciones_importantes: null, ...overrides,
  };
}

test('clasifica reporte y asistencia pendiente con el contrato operativo', () => {
  equal(isMissingReport(report({ estado_reporte: 'Falta reporte' })), true, 'reporte');
  equal(isAttendanceUnconfirmed(report({ estado_asistencia: 'Pendiente' })), true, 'asistencia');
  equal(isAttendanceUnconfirmed(report()), false, 'cerrada');
});

test('resume solo la ventana semanal solicitada', () => {
  const reports = [
    report({ fecha: '2026-09-15', estado_reporte: 'Falta reporte' }),
    report({ fecha: '2026-09-01', estado_reporte: 'Falta reporte' }),
  ] as ReportePendiente[];
  const planning = [
    { grupo_id: 'g', fecha: '2026-09-16', publicado: false },
    { grupo_id: 'old', fecha: '2026-09-01', publicado: false },
  ] as GrupoPlanning[];
  const summary = summarizeOperationalDashboard(
    reports,
    planning,
    [group({ fecha: '2026-09-17', estado_confirmacion: 'Pendiente' })],
    { start: '2026-09-14', end: '2026-09-20' }
  );
  equal(summary.reportesPendientes, 1, 'reportes');
  equal(summary.gruposSinPublicar, 1, 'grupos');
  equal(summary.entrenadoresSinConfirmar, 1, 'confirmaciones');
});

test('el estado de planning respeta publicación, confirmación, asistencia y reporte', () => {
  const planning = { grupo_id: 'group', publicado: true } as GrupoPlanning;
  equal(planningGroupStatus({ ...planning, publicado: false }, [], []), 'Sin publicar', 'publicación');
  equal(planningGroupStatus(planning, [], [group({ estado_confirmacion: 'Pendiente' })]), 'Publicado · entrenador sin confirmar', 'confirmación');
  equal(planningGroupStatus(planning, [report({ estado_asistencia: 'Pendiente' })], [group()]), 'Asistencia pendiente', 'asistencia');
  equal(planningGroupStatus(planning, [report({ estado_reporte: 'Falta reporte' })], [group()]), 'Reportes pendientes', 'reporte');
  equal(planningGroupStatus(planning, [report()], [group()]), 'Grupo cerrado', 'cerrado');
});

test('mantiene grupos históricos solo mientras conservan tareas pendientes', () => {
  const groups = [
    group({ grupo_id: 'current', fecha: '2026-09-16' }),
    group({ grupo_id: 'old-open', fecha: '2026-09-01', estado_confirmacion: 'Pendiente' }),
    group({ grupo_id: 'old-closed', fecha: '2026-09-01' }),
    group({ grupo_id: 'future', fecha: '2026-09-25' }),
  ];
  const visible = selectTrainerVisibleGroups(groups, [], { start: '2026-09-14', end: '2026-09-20' });
  equal(visible.map((item) => item.grupo_id).join(','), 'current,old-open', 'visibles');
});

test('relaciona alumnos por entrenador y grupo, no solo por id de grupo', () => {
  const students = [report(), report({ entrenador_id: 'other' })];
  const selected = selectStudentsForTrainerGroups(students, [group()]);
  equal(selected.length, 1, 'alumnos');
  equal(selected[0].entrenador_id, 'trainer', 'entrenador');
});

test('cuenta por separado confirmación, reporte y asistencia como hacía la vista', () => {
  const tasks = trainerPendingTaskCount(
    [group({ estado_confirmacion: 'Pendiente' })],
    [report({ estado_reporte: 'Falta reporte', estado_asistencia: 'Pendiente' })]
  );
  equal(tasks, 3, 'tareas');
});
