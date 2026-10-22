import type {
  EntrenadorFormState,
  TrainerGroupIdentity,
  TrainerIdentity,
  TrainerStudentIdentity,
} from './trainerTypes';

export const opcionesEspecialidadEntrenador = [
  'Baby', 'Ocio', 'Intensivos', 'Pista pequeña', 'Pista grande',
  'Debutantes', 'Apoyo / coordinación',
];

export const opcionesDocumentoEntrenador = [
  'Pendiente', 'Recibido', 'Validado', 'Caducado', 'No aplica',
];

export function entrenadorFormInicial(): EntrenadorFormState {
  return {
    id: null, nombre: '', email: '', telefono: '', tarifa: '0', activo: true,
    chaqueta: false, especialidades: [], titulacionEstado: 'Pendiente',
    titulacionUrl: '', titulacionObs: '', antecedentesEstado: 'Pendiente',
    antecedentesUrl: '', antecedentesObs: '', observaciones: '',
  };
}

export function responsableAutomaticoReporteApp(
  indice: number,
  entrenadorPrincipalId: string,
  entrenadorApoyoId: string
): string {
  if (!entrenadorApoyoId) return entrenadorPrincipalId;
  return indice % 5 < 3 ? entrenadorPrincipalId : entrenadorApoyoId;
}

export function buildTrainerReportAssignments(
  groupKey: string,
  students: { alumno_id: string }[],
  primaryTrainerId: string,
  supportTrainerId: string,
  overrides: Record<string, string>
): { alumno_id: string; entrenador_id: string }[] {
  return students.map((student, index) => ({
    alumno_id: student.alumno_id,
    entrenador_id: overrides[`${groupKey}__${student.alumno_id}`]
      || responsableAutomaticoReporteApp(index, primaryTrainerId, supportTrainerId),
  }));
}

export function collectGroupTrainers(
  groupId: string,
  groups: TrainerGroupIdentity[],
  students: TrainerStudentIdentity[]
): TrainerIdentity[] {
  const unique = new Map<string, string>();
  for (const group of groups) {
    if (group.grupo_id === groupId && group.entrenador_id && group.entrenador) {
      unique.set(group.entrenador_id, group.entrenador);
    }
  }
  for (const student of students) {
    if (student.grupo_id === groupId && student.entrenador_id && student.entrenador) {
      unique.set(student.entrenador_id, student.entrenador);
    }
  }
  return Array.from(unique, ([entrenador_id, entrenador]) => ({ entrenador_id, entrenador }));
}

export function trainerNamesForGroup(
  groupId: string,
  groups: TrainerGroupIdentity[],
  students: TrainerStudentIdentity[],
  fallback?: string | null
): string {
  const names = collectGroupTrainers(groupId, groups, students).map((item) => item.entrenador);
  return names.length ? names.join(' + ') : fallback || 'Sin entrenador';
}

export function trainerStudentDistribution<T extends TrainerStudentIdentity>(
  groupId: string,
  groups: TrainerGroupIdentity[],
  students: T[]
): Array<TrainerIdentity & { alumnos: T[] }> {
  return collectGroupTrainers(groupId, groups, students).map((trainer) => ({
    ...trainer,
    alumnos: students
      .filter((student) => student.grupo_id === groupId && student.entrenador_id === trainer.entrenador_id)
      .slice()
      .sort((a, b) => a.alumno.localeCompare(b.alumno, 'es')),
  }));
}

export function supportTrainerChangeIssue(input: {
  groupName: string;
  published: boolean;
  supportRequired: boolean;
  totalStudents: number;
  primaryTrainerId: string | null | undefined;
  newSupportTrainerId: string;
}): string | null {
  if (input.published && !input.newSupportTrainerId && input.supportRequired) {
    return `${input.groupName}: no puedes quitar el segundo entrenador mientras el grupo bajo publicado tenga ${input.totalStudents} alumnos. Reorganiza o despublica primero.`;
  }
  if (input.newSupportTrainerId && input.newSupportTrainerId === input.primaryTrainerId) {
    return 'El segundo entrenador no puede ser el mismo que el entrenador principal.';
  }
  return null;
}

export function primaryTrainerChangePlan(input: {
  groupId: string;
  published: boolean;
  previousTrainerId?: string | null;
  newTrainerId: string;
  exceptional: boolean;
}) {
  if (!input.groupId || !input.newTrainerId) throw new Error('Falta grupo o entrenador de destino.');
  if (input.previousTrainerId === input.newTrainerId) throw new Error('El entrenador ya está asignado al grupo.');
  return {
    rpc: input.exceptional ? 'cambiar_entrenador_grupo_excepcional_app' : 'cambiar_entrenador_grupo_app',
    params: { p_grupo_id: input.groupId, p_entrenador_id: input.newTrainerId },
    notifyPublishedChange: Boolean(input.published && input.previousTrainerId),
    previousTrainerId: input.previousTrainerId || '',
  } as const;
}

/**
 * Trabajo en pista · recordatorio de chaquetas (igual que el de camisetas rosas).
 * Devuelve los entrenadores que trabajan en los grupos indicados (principal o
 * apoyo) y que todavía NO tienen la chaqueta entregada en su ficha.
 * Empareja por ID y, si el grupo no trae ID, por nombre.
 */
export function trainersMissingJacket(
  groups: Array<{
    entrenador_id?: string | null;
    entrenador?: string | null;
    entrenador_apoyo_id?: string | null;
    entrenador_apoyo?: string | null;
  }>,
  trainers: Array<{ entrenador_id: string; nombre_completo: string; chaqueta_entregada?: boolean | null; activo?: boolean | null }>
): Array<{ entrenador_id: string; nombre_completo: string }> {
  const norm = (value: string | null | undefined) =>
    String(value || '').normalize('NFD').replace(/[̀-ͯ]/g, '').trim().toUpperCase();
  const byId = new Map(trainers.map((t) => [t.entrenador_id, t]));
  const byName = new Map(trainers.map((t) => [norm(t.nombre_completo), t]));
  const found = new Map<string, { entrenador_id: string; nombre_completo: string }>();
  const consider = (id?: string | null, name?: string | null) => {
    const trainer = (id && byId.get(id)) || (name ? byName.get(norm(name)) : undefined);
    if (!trainer || trainer.chaqueta_entregada) return;
    found.set(trainer.entrenador_id, { entrenador_id: trainer.entrenador_id, nombre_completo: trainer.nombre_completo });
  };
  for (const group of groups) {
    consider(group.entrenador_id, group.entrenador);
    consider(group.entrenador_apoyo_id, group.entrenador_apoyo);
  }
  return Array.from(found.values()).sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo, 'es'));
}

/**
 * Trabajo en pista · botón «Chaqueta: SÍ / NO» por entrenador del grupo.
 * Devuelve el principal y el apoyo del grupo (emparejados por ID o, si falta,
 * por nombre) con su estado de chaqueta, sin repetir.
 */
export function groupTrainersJacket(
  group: {
    entrenador_id?: string | null;
    entrenador?: string | null;
    entrenador_apoyo_id?: string | null;
    entrenador_apoyo?: string | null;
  },
  trainers: Array<{ entrenador_id: string; nombre_completo: string; chaqueta_entregada?: boolean | null }>
): Array<{ rol: 'principal' | 'apoyo'; entrenador_id: string; nombre_completo: string; chaqueta: boolean }> {
  const norm = (value: string | null | undefined) =>
    String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toUpperCase();
  const byId = new Map(trainers.map((t) => [t.entrenador_id, t]));
  const byName = new Map(trainers.map((t) => [norm(t.nombre_completo), t]));
  const out: Array<{ rol: 'principal' | 'apoyo'; entrenador_id: string; nombre_completo: string; chaqueta: boolean }> = [];
  const add = (rol: 'principal' | 'apoyo', id?: string | null, name?: string | null) => {
    const trainer = (id && byId.get(id)) || (name ? byName.get(norm(name)) : undefined);
    if (!trainer || out.some((item) => item.entrenador_id === trainer.entrenador_id)) return;
    out.push({
      rol,
      entrenador_id: trainer.entrenador_id,
      nombre_completo: trainer.nombre_completo,
      chaqueta: Boolean(trainer.chaqueta_entregada),
    });
  };
  add('principal', group.entrenador_id, group.entrenador);
  add('apoyo', group.entrenador_apoyo_id, group.entrenador_apoyo);
  return out;
}
