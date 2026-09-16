import { technicalLevelOrder, type TechnicalLevel } from '../../core/levels/levelContract';

export type OcioStrength = 'MUY_FUERTE' | 'FUERTE' | 'BAJO' | string | null | undefined;

export function ocioStrengthAdjustment(strength: OcioStrength) {
  if (strength === 'MUY_FUERTE') return 3;
  if (strength === 'FUERTE') return 2;
  if (strength === 'BAJO') return -3;
  return 0;
}

export function ocioFunctionalScore(input: {
  level: TechnicalLevel;
  strength?: OcioStrength;
  highAttentionDemand?: boolean;
}) {
  const order = technicalLevelOrder(input.level);
  if (order === null) return null;
  return order * 10 + ocioStrengthAdjustment(input.strength) - (input.highAttentionDemand ? 1 : 0);
}

export function ocioGroupMaximum(piste: string | null | undefined) {
  return /grande/i.test(String(piste || '')) ? 7 : 4;
}

/** A stable-schedule edit must not be used as an implicit level correction. */
export function requireUnchangedExistingOcioLevel(
  existingLevel: TechnicalLevel,
  requestedLevel: TechnicalLevel
) {
  if (existingLevel !== requestedLevel) {
    throw new Error(
      `La asignación estable de Ocio no puede cambiar el nivel maestro de ${existingLevel} a ${requestedLevel}. Registra antes una corrección de nivel trazable en la ficha maestra.`
    );
  }
  return existingLevel;
}
