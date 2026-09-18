import { parseTechnicalLevel } from '../levels/levelContract';
import { normalizeRosterName } from '../sessions/rosterSync';

export type PastedRosterEntry = {
  name: string;
  normalizedName: string;
  guest: boolean;
};

export type PastedRosterResult = {
  attendees: PastedRosterEntry[];
  names: string[];
  duplicates: string[];
  guestCount: number;
  cancellationCount: number | null;
  detectedAimHarderFormat: boolean;
};

const GUEST_MARKER = /\s*\[\s*invitado\s*\]\s*/gi;
const MARKDOWN_IMAGE = /!?\[[^\]]*\]\([^\n)]*\)/gi;
const MARKDOWN_IMAGE_DETECT = /!?\[[^\]]*\]\([^\n)]*\)/i;
const METADATA_START = /^(?:RESERVA(?:\s+EL)?|ULTIMA\s+RESERVA|ÚLTIMA\s+RESERVA|TERMINA\s+TARIFA|TARIFA|INSCRIPCION|INSCRIPCIÓN|PAGO|BONO|OBSERVACION|OBSERVACIÓN|FECHA|CANCELACIONES?|ULTIMO|ÚLTIMO)\b/i;
const METADATA_ANYWHERE = /\b(?:Reserva\s+el|Última\s+reserva\s*:|Ultima\s+reserva\s*:|Termina\s+tarifa\s+el)\b/gi;

function cleanVisibleName(value: string): { name: string; guest: boolean } {
  const raw = String(value || '').replace(/\u00a0/g, ' ').trim();
  const guest = /\[\s*invitado\s*\]/i.test(raw);
  let name = raw
    .replace(GUEST_MARKER, ' ')
    .replace(/^[-–—•·✓✔︎✔️\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim();

  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    if (parseTechnicalLevel(last).status === 'VALID') {
      parts.pop();
      name = parts.join(' ');
    }
  }

  return { name, guest };
}

function isLikelyStudentName(value: string): boolean {
  const { name } = cleanVisibleName(value);
  if (!name || /\d/.test(name) || /https?:\/\//i.test(name)) return false;

  const normalized = normalizeRosterName(name);
  if (!normalized || METADATA_START.test(normalized)) return false;
  if (/\bAIMHARDER\b/i.test(normalized)) return false;

  const words = name.split(/\s+/).filter(Boolean);
  if (words.length < 2 || words.length > 8) return false;

  // Nombres, apellidos, partículas y apóstrofes/guiones. Evita convertir
  // frases arbitrarias o metadatos en alumnos.
  if (!/^[A-Za-zÁÉÍÓÚÜÑÀÈÌÒÙÂÊÎÔÛÄËÏÖÜÇáéíóúüñàèìòùâêîôûäëïöüç'’\-\s]+$/.test(name)) {
    return false;
  }

  return true;
}

function buildEntries(values: Array<{ value: string; guestHint?: boolean }>): PastedRosterEntry[] {
  return values
    .map(({ value, guestHint }) => {
      const cleaned = cleanVisibleName(value);
      if (!isLikelyStudentName(cleaned.name)) return null;
      const normalizedName = normalizeRosterName(cleaned.name);
      if (!normalizedName) return null;
      return {
        name: cleaned.name,
        normalizedName,
        guest: Boolean(guestHint || cleaned.guest),
      } satisfies PastedRosterEntry;
    })
    .filter((entry): entry is PastedRosterEntry => Boolean(entry));
}

function fallbackPlainCandidates(value: string): Array<{ value: string; guestHint?: boolean }> {
  const prepared = String(value || '')
    .replace(/\\r\\n|\\r/g, '\n')
    .replace(/\r\n?|\n/g, '\n')
    .replace(/\u00a0/g, ' ')
    .replace(MARKDOWN_IMAGE, '\n')
    .replace(/\*\*/g, '')
    .replace(METADATA_ANYWHERE, (match) => `\n${match}`)
      .replace(/(\d{2})\/(\d{2})\/(\d{4})(?=[A-Za-zÁÉÍÓÚÑáéíóúñ])/g, '$1\n');
      
  return prepared
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => ({
      value: line,
      guestHint: /\[\s*invitado\s*\]/i.test(line),
    }))
    .filter(({ value: line }) => {
      const normalized = normalizeRosterName(line);
      return Boolean(normalized) && !METADATA_START.test(normalized) && !/\d/.test(normalized);
    });
}

export function parsePastedRoster(value: string): PastedRosterResult {
  const source = String(value || '');
  const normalizedSource = source
    .replace(/\\r\\n|\\r/g, '\n')
    .replace(/\r\n?/g, '\n')
    .replace(/\u00a0/g, ' ');

  const cancellationMatch = normalizedSource.match(/\b(\d+)\s+cancelaciones?\b/i);
  const cancellationCount = cancellationMatch ? Number(cancellationMatch[1]) : null;

  const boldCandidates = Array.from(normalizedSource.matchAll(/\*\*([^*\n]+?)\*\*/g))
    .map((match) => ({
      value: String(match[1] || '').trim(),
      guestHint: /\[\s*invitado\s*\]/i.test(String(match[1] || '')),
    }))
    .filter(({ value: candidate }) => isLikelyStudentName(candidate));

  const values = boldCandidates.length > 0 ? boldCandidates : fallbackPlainCandidates(normalizedSource);
  const attendees = buildEntries(values);

  const seen = new Set<string>();
  const duplicateSet = new Set<string>();
  attendees.forEach((entry) => {
    if (seen.has(entry.normalizedName)) duplicateSet.add(entry.name);
    seen.add(entry.normalizedName);
  });

  const detectedAimHarderFormat =
    /\bReserva\s+el\b/i.test(normalizedSource) ||
    /\bÚltima\s+reserva\b/i.test(normalizedSource) ||
    /\bUltima\s+reserva\b/i.test(normalizedSource) ||
    /\bTermina\s+tarifa\b/i.test(normalizedSource) ||
    MARKDOWN_IMAGE_DETECT.test(normalizedSource);

  return {
    attendees,
    names: attendees.map((entry) => entry.name),
    duplicates: Array.from(duplicateSet),
    guestCount: attendees.filter((entry) => entry.guest).length,
    cancellationCount,
    detectedAimHarderFormat,
  };
}

export function rosterTextFromPastedList(value: string): string {
  return parsePastedRoster(value).names.join('\n');
}
