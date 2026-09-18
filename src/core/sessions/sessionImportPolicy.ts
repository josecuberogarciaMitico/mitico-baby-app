import { normalizeRosterName } from './rosterSync';
import { parsePastedRoster } from '../imports/pastedRoster';

export type ExistingSessionImportState = {
  sessionId: string;
  groupCount: number;
  publishedGroupCount: number;
  studentsInGroups: number;
  currentRosterNames: string[];
};

export type SessionImportDecision = {
  action: 'CREATE' | 'NO_CHANGE' | 'REPLACE_DRAFT_ROSTER' | 'BLOCK';
  reason: string;
  additions: string[];
  removals: string[];
};

function uniqueNormalizedNames(names: string[]): {
  normalized: Map<string, string>;
  duplicates: string[];
} {
  const normalized = new Map<string, string>();
  const duplicates = new Set<string>();
  names.forEach((rawName) => {
    const name = String(rawName || '').trim();
    const key = normalizeRosterName(name);
    if (!key) return;
    if (normalized.has(key)) duplicates.add(name);
    else normalized.set(key, name);
  });
  return { normalized, duplicates: Array.from(duplicates) };
}

export function extractRosterNamesFromListText(value: string): string[] {
  return parsePastedRoster(value).names;
}

export function decideSessionRosterImport(
  existing: ExistingSessionImportState | null,
  incomingRosterNames: string[]
): SessionImportDecision {
  const incoming = uniqueNormalizedNames(incomingRosterNames);
  if (incoming.normalized.size === 0) {
    return {
      action: 'BLOCK',
      reason: 'El listado entrante está vacío; no se modifica ninguna sesión.',
      additions: [],
      removals: [],
    };
  }
  if (incoming.duplicates.length > 0) {
    return {
      action: 'BLOCK',
      reason: `El listado contiene identidades duplicadas o indistinguibles: ${incoming.duplicates.join(', ')}.`,
      additions: [],
      removals: [],
    };
  }
  if (!existing) {
    return {
      action: 'CREATE',
      reason: 'No existe una sesión equivalente.',
      additions: Array.from(incoming.normalized.values()),
      removals: [],
    };
  }

  const current = uniqueNormalizedNames(existing.currentRosterNames).normalized;
  const additions = Array.from(incoming.normalized.entries())
    .filter(([key]) => !current.has(key))
    .map(([, name]) => name);
  const removals = Array.from(current.entries())
    .filter(([key]) => !incoming.normalized.has(key))
    .map(([, name]) => name);

  if (additions.length === 0 && removals.length === 0) {
    return {
      action: 'NO_CHANGE',
      reason: 'La sesión ya contiene exactamente este roster.',
      additions,
      removals,
    };
  }

  if (
    existing.groupCount > 0 ||
    existing.publishedGroupCount > 0 ||
    existing.studentsInGroups > 0
  ) {
    return {
      action: 'BLOCK',
      reason:
        'La sesión ya tiene grupos o asignaciones. Una reimportación completa podría borrar composición operativa; usa alta tardía, movimiento o un refresco específico.',
      additions,
      removals,
    };
  }

  return {
    action: 'REPLACE_DRAFT_ROSTER',
    reason:
      'La sesión sigue en borrador sin grupos ni asignaciones; puede reemplazarse el roster.',
    additions,
    removals,
  };
}
