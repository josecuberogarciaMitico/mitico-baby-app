export const TECHNICAL_LEVELS = [
  'INICIACION',
  'A',
  'A+',
  'B',
  'B+',
  'C',
  'C+',
  'D',
  'D+',
] as const;

export type TechnicalLevel = (typeof TECHNICAL_LEVELS)[number];

export const TECHNICAL_LEVEL_ORDER: Readonly<Record<TechnicalLevel, number>> = {
  INICIACION: 0,
  A: 1,
  'A+': 2,
  B: 3,
  'B+': 4,
  C: 5,
  'C+': 6,
  D: 7,
  'D+': 8,
};

export type LevelParseResult =
  | {
      status: 'VALID';
      level: TechnicalLevel;
      normalizedInput: string;
      aliasApplied: boolean;
    }
  | {
      status: 'MISSING';
      level: null;
      normalizedInput: string;
      reason: 'EMPTY';
    }
  | {
      status: 'INVALID';
      level: null;
      normalizedInput: string;
      reason: 'UNKNOWN' | 'AMBIGUOUS';
      candidates: TechnicalLevel[];
    };

const EXACT_ALIASES: Readonly<Record<string, TechnicalLevel>> = {
  INICIACION: 'INICIACION',
  DEBUT: 'INICIACION',
  A: 'A',
  'A+': 'A+',
  B: 'B',
  'B+': 'B+',
  'B++': 'B+',
  C: 'C',
  'C+': 'C+',
  D: 'D',
  'D+': 'D+',
};

function normalizeLevelText(value: unknown) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/\s+/g, ' ')
    .trim();
}

function uniqueLevels(levels: TechnicalLevel[]) {
  return Array.from(new Set(levels));
}

/**
 * Parses one individual technical level.
 *
 * Labels such as "Nivel C" are accepted for backwards compatibility. Labels
 * containing more than one level (for example "A+ / B") are deliberately
 * rejected: those describe a group, not one student's technical level.
 */
export function parseTechnicalLevel(value: unknown): LevelParseResult {
  const normalizedInput = normalizeLevelText(value);

  if (!normalizedInput || normalizedInput === '-') {
    return {
      status: 'MISSING',
      level: null,
      normalizedInput,
      reason: 'EMPTY',
    };
  }

  const exact = EXACT_ALIASES[normalizedInput];
  if (exact) {
    return {
      status: 'VALID',
      level: exact,
      normalizedInput,
      aliasApplied: exact !== normalizedInput,
    };
  }

  const matches = uniqueLevels(
    Array.from(
      normalizedInput.matchAll(
        /(?:^|[^A-Z0-9+])(INICIACION|DEBUT|D\+|C\+|B\+\+|B\+|A\+|D|C|B|A)(?=$|[^A-Z0-9+])/g
      ),
      (match) => EXACT_ALIASES[match[1]]
    ).filter((level): level is TechnicalLevel => Boolean(level))
  );

  if (matches.length === 1) {
    return {
      status: 'VALID',
      level: matches[0],
      normalizedInput,
      aliasApplied: true,
    };
  }

  return {
    status: 'INVALID',
    level: null,
    normalizedInput,
    reason: matches.length > 1 ? 'AMBIGUOUS' : 'UNKNOWN',
    candidates: matches,
  };
}

export function technicalLevelOrNull(value: unknown): TechnicalLevel | null {
  const parsed = parseTechnicalLevel(value);
  return parsed.status === 'VALID' ? parsed.level : null;
}

export function technicalLevelOrder(value: unknown): number | null {
  const level = technicalLevelOrNull(value);
  return level === null ? null : TECHNICAL_LEVEL_ORDER[level];
}

export class TechnicalLevelError extends Error {
  readonly code = 'TECHNICAL_LEVEL_REQUIRES_REVIEW';

  constructor(
    readonly value: unknown,
    readonly context = 'nivel técnico'
  ) {
    const parsed = parseTechnicalLevel(value);
    const detail =
      parsed.status === 'MISSING'
        ? 'falta el nivel'
        : parsed.status === 'INVALID' && parsed.reason === 'AMBIGUOUS'
          ? `la etiqueta mezcla varios niveles (${parsed.candidates.join(', ')})`
          : `el valor "${parsed.normalizedInput || String(value ?? '')}" no está reconocido`;
    super(`${context}: ${detail}. Requiere revisión; no se asignará otro nivel automáticamente.`);
    this.name = 'TechnicalLevelError';
  }
}

export function requireTechnicalLevel(
  value: unknown,
  context?: string
): TechnicalLevel {
  const parsed = parseTechnicalLevel(value);
  if (parsed.status === 'VALID') return parsed.level;
  throw new TechnicalLevelError(value, context);
}

export type OperationalLevelSource =
  | 'MANUAL_CORRECTION'
  | 'LATEST_REPORT'
  | 'CURRENT_LEVEL'
  | 'SESSION_OVERRIDE'
  | 'SESSION_SNAPSHOT'
  | 'ESTIMATED_LEVEL';

export type OperationalLevelResolution = {
  status: 'RESOLVED' | 'PROVISIONAL' | 'REQUIRES_REVIEW' | 'MISSING';
  level: TechnicalLevel | null;
  source: OperationalLevelSource | null;
  reviewRequired: boolean;
  issues: string[];
};

export type CurrentLevelInput = {
  currentLevel?: unknown;
  latestReportLevel?: unknown;
  estimatedLevel?: unknown;
  manualCorrectionLevel?: unknown;
  manualCorrectionId?: string | null;
  manualCorrectionAt?: string | null;
};

function invalidIssue(label: string, value: unknown) {
  const parsed = parseTechnicalLevel(value);
  if (parsed.status !== 'INVALID') return null;
  return `${label}: ${parsed.reason === 'AMBIGUOUS' ? 'mezcla varios niveles' : 'nivel desconocido'} (${parsed.normalizedInput}).`;
}

/**
 * Current operational policy:
 * explicit manual correction > latest valid trainer report > stored current
 * level > estimated level. A mismatch between report and current level is not
 * guessed; it is surfaced for review unless an explicit correction is present.
 */
export function resolveCurrentOperationalLevel(
  input: CurrentLevelInput
): OperationalLevelResolution {
  const manual = parseTechnicalLevel(input.manualCorrectionLevel);
  const report = parseTechnicalLevel(input.latestReportLevel);
  const current = parseTechnicalLevel(input.currentLevel);
  const estimated = parseTechnicalLevel(input.estimatedLevel);
  const manualTraceMissing =
    manual.status === 'VALID' &&
    (!String(input.manualCorrectionId || '').trim() ||
      !String(input.manualCorrectionAt || '').trim());
  const issues = [
    invalidIssue('Corrección manual', input.manualCorrectionLevel),
    invalidIssue('Último reporte', input.latestReportLevel),
    invalidIssue('Nivel actual', input.currentLevel),
    invalidIssue('Nivel estimado', input.estimatedLevel),
    manualTraceMissing
      ? 'La corrección manual no tiene identificador y fecha trazables.'
      : null,
  ].filter((issue): issue is string => Boolean(issue));

  if (manual.status === 'VALID' && !manualTraceMissing) {
    return {
      status: 'RESOLVED',
      level: manual.level,
      source: 'MANUAL_CORRECTION',
      reviewRequired: issues.length > 0,
      issues,
    };
  }

  if (issues.length > 0) {
    return {
      status: 'REQUIRES_REVIEW',
      level: null,
      source: null,
      reviewRequired: true,
      issues,
    };
  }

  if (
    report.status === 'VALID' &&
    current.status === 'VALID' &&
    report.level !== current.level
  ) {
    return {
      status: 'REQUIRES_REVIEW',
      level: report.level,
      source: 'LATEST_REPORT',
      reviewRequired: true,
      issues: [
        `El último reporte indica ${report.level} y gobierna la operativa, pero la ficha almacenada indica ${current.level}; falta reconciliarla o registrar una corrección manual trazable.`,
      ],
    };
  }

  if (report.status === 'VALID') {
    return {
      status: 'RESOLVED',
      level: report.level,
      source: 'LATEST_REPORT',
      reviewRequired: false,
      issues: [],
    };
  }

  if (current.status === 'VALID') {
    return {
      status: 'RESOLVED',
      level: current.level,
      source: 'CURRENT_LEVEL',
      reviewRequired: false,
      issues: [],
    };
  }

  if (estimated.status === 'VALID') {
    return {
      status: 'PROVISIONAL',
      level: estimated.level,
      source: 'ESTIMATED_LEVEL',
      reviewRequired: true,
      issues: ['El nivel procede de una estimación y debe validarse en pista.'],
    };
  }

  return {
    status: 'MISSING',
    level: null,
    source: null,
    reviewRequired: true,
    issues: ['El alumno no tiene un nivel técnico individual utilizable.'],
  };
}

export type SessionLevelInput = CurrentLevelInput & {
  sessionLevel?: unknown;
  sessionLevelKind?: 'SNAPSHOT' | 'OVERRIDE' | 'UNKNOWN';
};

/**
 * A documented session override wins only inside that session. A normal
 * snapshot never overwrites the student's current level; it is a final
 * fallback kept for historical/session context.
 */
export function resolveSessionOperationalLevel(
  input: SessionLevelInput
): OperationalLevelResolution {
  const session = parseTechnicalLevel(input.sessionLevel);

  if (session.status === 'INVALID') {
    return {
      status: 'REQUIRES_REVIEW',
      level: null,
      source: null,
      reviewRequired: true,
      issues: [
        `Nivel de sesión no válido (${session.normalizedInput}); no se utilizará el nivel del grupo como sustituto.`,
      ],
    };
  }

  if (input.sessionLevelKind === 'OVERRIDE' && session.status === 'VALID') {
    return {
      status: 'RESOLVED',
      level: session.level,
      source: 'SESSION_OVERRIDE',
      reviewRequired: false,
      issues: [],
    };
  }

  const current = resolveCurrentOperationalLevel(input);
  if (current.status !== 'MISSING') return current;

  if (session.status === 'VALID') {
    return {
      status:
        input.sessionLevelKind === 'UNKNOWN' ? 'PROVISIONAL' : 'RESOLVED',
      level: session.level,
      source: 'SESSION_SNAPSHOT',
      reviewRequired: input.sessionLevelKind === 'UNKNOWN',
      issues:
        input.sessionLevelKind === 'UNKNOWN'
          ? ['No consta si el nivel de sesión es snapshot u override; revisar el origen.']
          : [],
    };
  }

  return current;
}
