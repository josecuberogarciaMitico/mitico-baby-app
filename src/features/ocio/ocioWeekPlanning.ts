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

export type OcioAimHarderStudentState = 'NEW' | 'PENDING_GROUP' | 'STABLE';

export function classifyOcioAimHarderStudent(
  existsInMaster: boolean,
  ocioStudent: { grupo_id: string | null } | null | undefined
): OcioAimHarderStudentState {
  if (!existsInMaster) return 'NEW';
  return ocioStudent?.grupo_id ? 'STABLE' : 'PENDING_GROUP';
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
    throw new Error('No hay alumnos de AimHarder colocados para volcar.');
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
