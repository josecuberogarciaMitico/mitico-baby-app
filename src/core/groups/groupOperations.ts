import { requireTechnicalLevel, type TechnicalLevel } from '../levels/levelContract';

export const GROUP_OPERATION_RPC = {
  publish: 'publicar_grupo_operativa_segura_app',
  unpublish: 'despublicar_grupo_app',
  confirmTrainer: 'confirmar_grupo_entrenador_app',
  markAttendance: 'marcar_asistencia_alumno_app',
  moveStudent: 'mover_alumno_grupo_operativa_app',
  updateDailyWork: 'actualizar_trabajo_observaciones_grupo_app',
  create: 'crear_grupo_sesion_operativa_app',
  remove: 'borrar_grupo_sesion_operativa_app',
} as const;

export type AttendanceState = 'Pendiente' | 'Presente' | 'Ausente';

const ATTENDANCE_STATES = new Set<AttendanceState>([
  'Pendiente',
  'Presente',
  'Ausente',
]);

export function requireAttendanceState(value: unknown): AttendanceState {
  const normalized = String(value || '').trim();
  if (ATTENDANCE_STATES.has(normalized as AttendanceState)) {
    return normalized as AttendanceState;
  }
  throw new Error(
    `Estado de asistencia no válido: ${normalized || '(vacío)'}. No se enviará ningún cambio.`
  );
}

export type GroupMoveRequest = {
  studentId: string;
  sourceGroupId: string;
  targetGroupId: string;
};

export function requireValidGroupMove(input: GroupMoveRequest): GroupMoveRequest {
  const result = {
    studentId: String(input.studentId || '').trim(),
    sourceGroupId: String(input.sourceGroupId || '').trim(),
    targetGroupId: String(input.targetGroupId || '').trim(),
  };
  if (!result.studentId || !result.sourceGroupId || !result.targetGroupId) {
    throw new Error('Faltan alumno, grupo origen o grupo destino. No se aplicó el movimiento.');
  }
  if (result.sourceGroupId === result.targetGroupId) {
    throw new Error('El grupo de destino debe ser diferente del grupo actual.');
  }
  return result;
}

function normalizedText(value: unknown) {
  return String(value || '').replace(/\r\n?/g, '\n').trim();
}

function sameIds(left: string[], right: string[]) {
  const a = Array.from(new Set(left.map((id) => String(id || '').trim()).filter(Boolean))).sort();
  const b = Array.from(new Set(right.map((id) => String(id || '').trim()).filter(Boolean))).sort();
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

export type ExistingPreparedGroup = {
  groupId: string;
  state?: string | null;
  published: boolean;
  trainerId?: string | null;
  supportTrainerId?: string | null;
  confirmationState?: string | null;
  piste?: string | null;
  meetingPoint?: string | null;
  dailyWork?: string | null;
  observations?: string | null;
  studentIds: string[];
  hasReports: boolean;
  hasRealAttendance: boolean;
};

export type PreparedGroupInput = {
  studentIds: string[];
  piste?: string | null;
  meetingPoint?: string | null;
  dailyWork: string;
  observations?: string | null;
};

export type PreparedGroupDecision = {
  action: 'CREATE' | 'REUSE' | 'REPLACE_UNTOUCHED_DRAFT' | 'BLOCK';
  reason: string;
};

/**
 * Protects trainer assignments and manual edits when a weekly stable group is
 * prepared more than once. Replacement is only allowed while the generated
 * group is still an untouched draft and has no operational history.
 */
export function decidePreparedGroupRefresh(
  existing: ExistingPreparedGroup | null,
  incoming: PreparedGroupInput
): PreparedGroupDecision {
  if (incoming.studentIds.length === 0) {
    return {
      action: 'BLOCK',
      reason: 'El grupo entrante no contiene alumnos; no se borra el grupo existente.',
    };
  }
  if (!normalizedText(incoming.dailyWork)) {
    return {
      action: 'BLOCK',
      reason: 'Falta el Trabajo diario generado; no se crea ni reemplaza el grupo.',
    };
  }
  if (!existing) {
    return { action: 'CREATE', reason: 'No existe un grupo operativo equivalente.' };
  }
  if (sameIds(existing.studentIds, incoming.studentIds)) {
    return {
      action: 'REUSE',
      reason: 'El grupo ya contiene exactamente estos alumnos; se conservan sus ediciones y estado.',
    };
  }

  const confirmation = normalizedText(existing.confirmationState).toLowerCase();
  const state = normalizedText(existing.state).toLowerCase();
  const isUntouched =
    !existing.published &&
    !normalizedText(existing.trainerId) &&
    !normalizedText(existing.supportTrainerId) &&
    (!confirmation || confirmation === 'pendiente de confirmar') &&
    (!state || state === 'borrador') &&
    !existing.hasReports &&
    !existing.hasRealAttendance &&
    normalizedText(existing.piste) === normalizedText(incoming.piste) &&
    normalizedText(existing.meetingPoint) === normalizedText(incoming.meetingPoint) &&
    normalizedText(existing.dailyWork) === normalizedText(incoming.dailyWork) &&
    normalizedText(existing.observations) === normalizedText(incoming.observations);

  if (isUntouched) {
    return {
      action: 'REPLACE_UNTOUCHED_DRAFT',
      reason: 'Solo cambia el roster de un borrador generado y todavía no editado.',
    };
  }

  return {
    action: 'BLOCK',
    reason:
      'El grupo ya tiene estado operativo, entrenador, edición manual o histórico. Ajusta sus alumnos con altas/movimientos para no perder trabajo.',
  };
}

export function requireOperationalStudentLevel(value: unknown): TechnicalLevel {
  return requireTechnicalLevel(value, 'nivel operativo del alumno para la sesión');
}
