import { normalizeRosterName } from './rosterSync';
import { parseTechnicalLevel } from '../levels/levelContract';

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
  const prepared = String(value || '')
    .replace(/\\r\\n|\\r/g, '\n')
    .replace(/\r\n?|\n/g, '\n')
    .replace(/(\d{2}\/\d{2}\/\d{4})([A-ZÁÉÍÓÚÜÑ])/g, '$1\n$2')
    .replace(
      /(Reserva el|Última reserva:|Ultima reserva:|Termina tarifa el)/gi,
      '\n$1'
    );
  const ignored = /^(RESERVA |ULTIMA RESERVA|ÚLTIMA RESERVA|TERMINA TARIFA|TARIFA|INSCRIPCION|INSCRIPCIÓN|PAGO|BONO|OBSERVACION|OBSERVACIÓN|FECHA|ULTIMO|ÚLTIMO)/;

  return prepared
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const normalized = normalizeRosterName(line);
      if (!normalized || ignored.test(normalized) || /\d/.test(normalized)) return '';
      const parts = normalized.split(/\s+/);
      const last = parts[parts.length - 1];
      if (parts.length > 1 && parseTechnicalLevel(last).status === 'VALID') {
        parts.pop();
      }
      return parts.join(' ').trim();
    })
    .filter((name) => name.length >= 5 && name.split(/\s+/).length >= 2);
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
