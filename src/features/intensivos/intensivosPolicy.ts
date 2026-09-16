export const INTENSIVE_DIPLOMA_STATES = ['Pendiente', 'Revisado'] as const;
export type IntensiveDiplomaState = (typeof INTENSIVE_DIPLOMA_STATES)[number];

export function requireIntensiveDiplomaUpdate(input: {
  state: unknown;
  proposedLevelId?: string | null;
  confirmedLevelId?: string | null;
}) {
  const state = String(input.state || '').trim();
  if (!INTENSIVE_DIPLOMA_STATES.includes(state as IntensiveDiplomaState)) {
    throw new Error(`Estado de evaluación intensiva no válido: ${state || '(vacío)'}.`);
  }
  const proposedLevelId = String(input.proposedLevelId || '').trim() || null;
  const confirmedLevelId = String(input.confirmedLevelId || '').trim() || null;
  if (state === 'Revisado' && !confirmedLevelId) {
    throw new Error(
      'Para cerrar la evaluación como Revisada hace falta un nivel final confirmado; ese nivel consolidará la ficha maestra.'
    );
  }
  return {
    state: state as IntensiveDiplomaState,
    proposedLevelId,
    confirmedLevelId,
    updatesMasterLevel: state === 'Revisado' && confirmedLevelId !== null,
  };
}
