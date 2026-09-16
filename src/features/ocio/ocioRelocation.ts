export type OcioDay = '' | 'Jueves' | 'Sábado' | 'Domingo';

export type OcioCambioPuntualApp = {
  reubicacion_id: string;
  alumno_id: string;
  alumno: string;
  nivel_usado: string | null;
  fecha: string;
  grupo_origen_id: string | null;
  grupo_origen: string | null;
  origen_dia_semana: string | null;
  origen_hora_inicio: string | null;
  origen_hora_fin: string | null;
  grupo_destino_id: string;
  grupo_destino: string;
  destino_dia_semana: string | null;
  destino_hora_inicio: string | null;
  destino_hora_fin: string | null;
  destino_punto: string | null;
  motivo: string | null;
  estado: string;
  created_at: string | null;
  updated_at: string | null;
};

export type OcioCambioFormState = {
  id: string | null;
  alumnoId: string;
  diaDestino: OcioDay;
  grupoDestinoId: string;
  fecha: string;
  motivo: string;
};

export function emptyOcioRelocationForm(): OcioCambioFormState {
  return { id: null, alumnoId: '', diaDestino: '', grupoDestinoId: '', fecha: '', motivo: '' };
}

export function activeOcioRelocationsForWindow(
  relocations: OcioCambioPuntualApp[],
  start: string,
  end: string
): OcioCambioPuntualApp[] {
  if (!start || !end) return [];
  return relocations.filter(
    (item) => item.fecha >= start && item.fecha <= end && (item.estado || 'confirmada') !== 'cancelada'
  );
}

export function findOcioRelocationEntry(
  relocations: OcioCambioPuntualApp[],
  studentId: string,
  groupId: string | null | undefined
): OcioCambioPuntualApp | null {
  if (!groupId) return null;
  return relocations.find((item) => item.alumno_id === studentId && item.grupo_destino_id === groupId) || null;
}

export function findOcioRelocationExit(
  relocations: OcioCambioPuntualApp[],
  studentId: string,
  groupId: string | null | undefined
): OcioCambioPuntualApp | null {
  if (!groupId) return null;
  return relocations.find((item) => item.alumno_id === studentId && item.grupo_origen_id === groupId) || null;
}

type StableOcioStudent = { alumno_id: string; alumno: string; grupo_id: string | null };

export function applyOcioRelocationsToStableGroup<T extends StableOcioStudent>(
  groupId: string | null | undefined,
  students: T[],
  relocations: OcioCambioPuntualApp[]
): T[] {
  if (!groupId) return [];
  const leaving = new Set(relocations.filter((item) => item.grupo_origen_id === groupId).map((item) => item.alumno_id));
  const entering = new Set(relocations.filter((item) => item.grupo_destino_id === groupId).map((item) => item.alumno_id));
  const result = new Map<string, T>();
  students
    .filter((student) => student.grupo_id === groupId && !leaving.has(student.alumno_id))
    .forEach((student) => result.set(student.alumno_id, student));
  students
    .filter((student) => entering.has(student.alumno_id))
    .forEach((student) => result.set(student.alumno_id, student));
  return Array.from(result.values()).sort((a, b) => a.alumno.localeCompare(b.alumno));
}

type RelocationTarget = {
  grupo_id: string;
  dia_semana: string;
  activo: boolean;
};

export function eligibleOcioRelocationGroups<T extends RelocationTarget>(
  groups: T[],
  currentGroupId: string | null | undefined,
  targetDay: OcioDay,
  isOfficial: (group: T) => boolean,
  normalizeDay: (day: string) => string
): T[] {
  if (!targetDay) return [];
  const normalizedTarget = normalizeDay(targetDay);
  return groups.filter(
    (group) =>
      Boolean(group.activo) &&
      isOfficial(group) &&
      group.grupo_id !== currentGroupId &&
      normalizeDay(group.dia_semana || '') === normalizedTarget
  );
}

export type OcioRelocationCommand = {
  studentId: string;
  sourceGroupId: string | null;
  targetGroupId: string;
  date: string;
  reason: string | null;
};

export function requireOcioRelocationCommand(input: {
  studentId: string;
  sourceGroupId?: string | null;
  targetGroupId: string;
  date: string;
  reason?: string | null;
}): OcioRelocationCommand {
  const command = {
    studentId: String(input.studentId || '').trim(),
    sourceGroupId: String(input.sourceGroupId || '').trim() || null,
    targetGroupId: String(input.targetGroupId || '').trim(),
    date: String(input.date || '').slice(0, 10),
    reason: String(input.reason || '').trim() || null,
  };
  if (!command.studentId) throw new Error('Selecciona el alumno que cambia puntualmente.');
  if (!command.targetGroupId) throw new Error('Selecciona uno de los grupos propuestos por el recomendador.');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(command.date)) throw new Error('Selecciona una semana válida para el cambio.');
  if (command.sourceGroupId && command.sourceGroupId === command.targetGroupId) {
    throw new Error('El grupo de destino debe ser diferente del grupo estable actual.');
  }
  return command;
}
