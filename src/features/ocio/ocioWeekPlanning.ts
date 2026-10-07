import {
  TECHNICAL_LEVEL_ORDER,
  parseTechnicalLevel,
} from '../../core/levels/levelContract';

export type OcioWeeklyStudent = {
  alumno_id: string;
  alumno: string;
  nivel: string | null;
  nivel_usado: string | null;
};

export type OcioWeeklyGroup = {
  weeklyGroupId: string;
  sourceGroupId: string | null;
  name: string;
  date: string;
  start: string;
  end: string;
  piste: string | null;
  studentIds: string[];
};

export type OcioWeeklyStableGroup = {
  groupId: string;
  name: string;
  date: string;
  start: string;
  end: string;
  piste: string | null;
  students: OcioWeeklyStudent[];
};

export type OcioAimHarderStudentState =
  | 'NEW'
  | 'OTHER_MODALITY'
  | 'PENDING_GROUP'
  | 'STABLE';

export function classifyOcioAimHarderStudent(
  existsInMaster: boolean,
  ocioStudent: { grupo_id: string | null } | null | undefined
): OcioAimHarderStudentState {
  if (!existsInMaster) return 'NEW';
  if (!ocioStudent) return 'OTHER_MODALITY';
  return ocioStudent.grupo_id ? 'STABLE' : 'PENDING_GROUP';
}

/**
 * «Pasar a Ocio» desde el listado AimHarder de la semana: un niño que ya tiene
 * ficha (p. ej. de Baby) pero no es alumno de Ocio. Se usa el nombre EXACTO de
 * su ficha para que crear_alumno_ocio_app reutilice esa ficha (conserva nivel,
 * fecha de nacimiento e historial) en vez de crear una nueva.
 */
export function buildPassToOcioRequest(input: {
  fichaName: string | null | undefined;
  fixedDay: string | null | undefined;
  startTime: string | null | undefined;
  endTime: string | null | undefined;
}) {
  const name = String(input.fichaName || '').trim();
  if (!name) throw new Error('No encuentro la ficha del alumno. Actualiza el listado y vuelve a intentarlo.');
  const day = String(input.fixedDay || '').trim();
  if (!['Jueves', 'Sábado', 'Domingo'].includes(day)) {
    throw new Error('No puedo saber el día fijo de Ocio de este turno.');
  }
  const time = (value: string | null | undefined) => {
    const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})/);
    return match ? `${match[1].padStart(2, '0')}:${match[2]}` : null;
  };
  return {
    p_nombre_completo: name,
    p_nivel_codigo: null,
    p_fecha_nacimiento: null,
    p_dia_fijo: day,
    p_hora_inicio: time(input.startTime),
    p_hora_fin: time(input.endTime),
    p_observaciones: null,
  };
}

/** Turnos fijos de Ocio (los mismos que tienen hoy los grupos estables). */
export const OCIO_FIXED_TURNS = [
  { day: 'Jueves', start: '18:00', end: '20:00' },
  { day: 'Sábado', start: '09:45', end: '11:45' },
  { day: 'Domingo', start: '12:00', end: '14:00' },
] as const;

/**
 * Fichas → Alumnos Baby → «Pasar a Ocio». Va por ID de ficha (no por nombre),
 * así nunca se crea un duplicado. La RPC además da de baja BABY en la temporada.
 */
export function buildBabyToOcioRequest(studentId: string | null | undefined, turnIndex: number) {
  const id = String(studentId || '').trim();
  if (!id) throw new Error('Falta la ficha del alumno.');
  const turn = OCIO_FIXED_TURNS[turnIndex];
  if (!turn) throw new Error('Elige el turno de Ocio.');
  return {
    p_alumno_id: id,
    p_dia_fijo: turn.day,
    p_hora_inicio: turn.start,
    p_hora_fin: turn.end,
  };
}

export function ocioLevelRange(
  students: Array<Pick<OcioWeeklyStudent, 'nivel' | 'nivel_usado'>>
): string {
  const levels = students
    .map((student) => parseTechnicalLevel(student.nivel_usado || student.nivel))
    .filter(
      (result): result is Extract<typeof result, { status: 'VALID' }> =>
        result.status === 'VALID'
    )
    .map((result) => result.level);

  if (levels.length === 0) return '-';

  const ordered = Array.from(new Set(levels)).sort(
    (a, b) => TECHNICAL_LEVEL_ORDER[a] - TECHNICAL_LEVEL_ORDER[b]
  );
  const first = ordered[0];
  const last = ordered[ordered.length - 1];
  return first === last ? first : `${first}–${last}`;
}

export function buildOcioWeeklyGroups(
  stableGroups: OcioWeeklyStableGroup[],
  comesThisWeek: (studentId: string) => boolean
): OcioWeeklyGroup[] {
  return stableGroups
    .map((group) => ({
      weeklyGroupId: `stable:${group.groupId}`,
      sourceGroupId: group.groupId,
      name: group.name,
      date: group.date,
      start: group.start,
      end: group.end,
      piste: group.piste,
      studentIds: group.students
        .filter((student) => comesThisWeek(student.alumno_id))
        .map((student) => student.alumno_id),
    }))
    .filter((group) => group.studentIds.length > 0);
}

export function moveOcioWeeklyStudent(
  groups: OcioWeeklyGroup[],
  studentId: string,
  targetWeeklyGroupId: string
): OcioWeeklyGroup[] {
  if (!groups.some((group) => group.weeklyGroupId === targetWeeklyGroupId)) {
    throw new Error('El grupo temporal de destino ya no existe.');
  }

  return groups.map((group) => ({
    ...group,
    studentIds:
      group.weeklyGroupId === targetWeeklyGroupId
        ? Array.from(new Set([...group.studentIds, studentId]))
        : group.studentIds.filter((id) => id !== studentId),
  }));
}

export function addEmptyOcioWeeklyGroup(
  groups: OcioWeeklyGroup[],
  template: Omit<OcioWeeklyGroup, 'weeklyGroupId' | 'sourceGroupId' | 'studentIds'>
): OcioWeeklyGroup[] {
  const used = new Set(groups.map((group) => group.weeklyGroupId));
  let index = groups.length + 1;
  let id = `temporary:${index}`;
  while (used.has(id)) {
    index += 1;
    id = `temporary:${index}`;
  }
  return [
    ...groups,
    {
      ...template,
      weeklyGroupId: id,
      sourceGroupId: null,
      studentIds: [],
    },
  ];
}

export function validateOcioWeeklyGroups(groups: OcioWeeklyGroup[]): void {
  const nonEmpty = groups.filter((group) => group.studentIds.length > 0);
  if (nonEmpty.length === 0) {
    throw new Error('No hay alumnos del listado colocados para volcar.');
  }

  const all = nonEmpty.flatMap((group) => group.studentIds);
  if (new Set(all).size !== all.length) {
    throw new Error('Un alumno aparece en más de un grupo temporal.');
  }

  nonEmpty.forEach((group) => {
    if (!group.name.trim()) throw new Error('Todos los grupos temporales necesitan nombre.');
    if (!group.date || !group.start || !group.end) {
      throw new Error(`${group.name}: falta fecha u horario real.`);
    }
  });
}

export function weeklyLevelRange(
  group: OcioWeeklyGroup,
  students: OcioWeeklyStudent[]
): string {
  const ids = new Set(group.studentIds);
  return ocioLevelRange(students.filter((student) => ids.has(student.alumno_id)));
}
