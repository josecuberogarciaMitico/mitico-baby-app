import { technicalLevelOrder } from '../../core/levels/levelContract';

export type BabyPiste = string | null | undefined;

export function babyGroupMaximum(piste: BabyPiste, trainerCount: number) {
  if (trainerCount >= 2) return 7;
  return /grande/i.test(String(piste || '')) ? 7 : 4;
}

export function babyRatioMessage(input: {
  finalSize: number;
  piste: BabyPiste;
  trainerCount: number;
}) {
  const maximum = babyGroupMaximum(input.piste, input.trainerCount);
  if (input.finalSize > maximum) {
    return input.trainerCount >= 2 && input.finalSize >= 8
      ? `${input.trainerCount} entrenadores con ${input.finalSize} niños: conviene reorganizar en 2 grupos de 4.`
      : `Superaría el ratio del grupo (${input.finalSize}/${maximum}).`;
  }
  if (input.finalSize === maximum) {
    return input.trainerCount >= 2
      ? `Quedaría completo con ${input.trainerCount} entrenadores (${input.finalSize}/7).`
      : `Quedaría completo (${input.finalSize}/${maximum}).`;
  }
  return input.trainerCount >= 2
    ? `Grupo con ${input.trainerCount} entrenadores. Ratio resultante: ${input.finalSize}/7.`
    : `Ratio resultante: ${input.finalSize}/${maximum}.`;
}

export type BabySupportStudent = {
  level?: string | null;
  recommendedPiste?: string | null;
  studentPiste?: string | null;
};

export function babyLowGroupNeedsSupport(students: BabySupportStudent[]) {
  const orders = students
    .map((student) => technicalLevelOrder(student.level))
    .filter((order): order is number => order !== null);
  const maximumOrder = orders.length ? Math.max(...orders) : Number.NaN;
  const piste = `${students[0]?.recommendedPiste || ''} ${students[0]?.studentPiste || ''}`.toLowerCase();
  const smallPiste = /peque/.test(piste) && !/grande/.test(piste);
  const lowGroup = maximumOrder <= 2 || smallPiste;
  return lowGroup && students.length >= 5 && students.length <= 7;
}

export function babySupportMessage(
  students: BabySupportStudent[],
  supportTrainerAssigned = false
) {
  if (!babyLowGroupNeedsSupport(students)) return '';
  return supportTrainerAssigned
    ? `Ratio válido: grupo bajo de ${students.length} alumnos con 2 entrenadores.`
    : `Ratio obligatorio: el grupo bajo de ${students.length} alumnos necesita 2 entrenadores antes de publicar.`;
}
