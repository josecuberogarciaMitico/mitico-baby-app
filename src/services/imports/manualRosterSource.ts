import { parsePastedRoster } from '../../core/imports/pastedRoster';
import type {
  BabyAimHarderAsistenteActivoApp,
  BabyAimHarderSafetyApp,
} from '../aimharder/aimHarderContract';

const BABY_MANUAL_STORAGE_KEY = 'mitico_baby_manual_roster_v1';
const BABY_MANUAL_TTL_MS = 20 * 60 * 1000;

type StoredBabyManualRoster = {
  date: string;
  start: string;
  end: string;
  createdAt: number;
  armedAt: number | null;
  attendees: BabyAimHarderAsistenteActivoApp[];
};

export type ManualBabyRosterStageResult = {
  names: string[];
  attendees: BabyAimHarderAsistenteActivoApp[];
  guests: number;
  cancellationCount: number | null;
};

function shortTime(value: unknown): string {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '';
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}


export function parseManualBabyDateFromText(...values: unknown[]): string {
  for (const value of values) {
    const text = String(value || '');
    const iso = text.match(/\b(\d{4})-(\d{1,2})-(\d{1,2})\b/);
    if (iso) {
      return `${iso[1]}-${iso[2].padStart(2, '0')}-${iso[3].padStart(2, '0')}`;
    }
    const local = text.match(/\b(\d{1,2})[\/.-](\d{1,2})[\/.-](\d{4})\b/);
    if (local) {
      return `${local[3]}-${local[2].padStart(2, '0')}-${local[1].padStart(2, '0')}`;
    }
  }
  return '';
}

export function parseManualBabyTimesFromText(
  ...values: unknown[]
): { start: string; end: string } {
  for (const value of values) {
    const text = String(value || '');
    const match = text.match(
      /\b(\d{1,2}:\d{2})\s*[-–—]\s*(\d{1,2}:\d{2})\b/
    );
    if (match) {
      return { start: shortTime(match[1]), end: shortTime(match[2]) };
    }
  }
  return { start: '', end: '' };
}

function browserStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function validStoredRoster(value: unknown): StoredBabyManualRoster | null {
  if (!value || typeof value !== 'object') return null;
  const item = value as Partial<StoredBabyManualRoster>;
  const date = String(item.date || '').slice(0, 10);
  const start = shortTime(item.start);
  const end = shortTime(item.end);
  const createdAt = Number(item.createdAt || 0);
  const armedAt = item.armedAt == null ? null : Number(item.armedAt);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !start || !end) return null;
  if (!Number.isFinite(createdAt) || Date.now() - createdAt > BABY_MANUAL_TTL_MS) return null;
  if (!Array.isArray(item.attendees) || item.attendees.length === 0) return null;
  if (armedAt !== null && !Number.isFinite(armedAt)) return null;
  return {
    date,
    start,
    end,
    createdAt,
    armedAt,
    attendees: item.attendees.map((attendee) => ({
      name: String(attendee?.name || '').trim(),
      guest: Boolean(attendee?.guest),
      bookingAt: attendee?.bookingAt || null,
      phone: attendee?.phone || null,
      birthDate: attendee?.birthDate || null,
      clientId: attendee?.clientId || null,
    })).filter((attendee) => Boolean(attendee.name)),
  };
}

export function stageManualBabyRoster(input: {
  date: string;
  start: string;
  end: string;
  rawText: string;
}): ManualBabyRosterStageResult {
  const storage = browserStorage();
  if (!storage) throw new Error('El pegado local de Baby solo está disponible en el navegador.');

  const date = String(input.date || '').slice(0, 10);
  const start = shortTime(input.start);
  const end = shortTime(input.end);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || !start || !end) {
    throw new Error('No puedo identificar con seguridad la fecha y el horario del turno Baby.');
  }

  const parsed = parsePastedRoster(input.rawText);
  if (parsed.names.length === 0) {
    throw new Error('No he detectado ningún alumno válido en el listado pegado.');
  }
  if (parsed.duplicates.length > 0) {
    throw new Error(
      `El listado contiene nombres duplicados o indistinguibles: ${parsed.duplicates.join(', ')}.`
    );
  }

  const attendees: BabyAimHarderAsistenteActivoApp[] = parsed.attendees.map((attendee) => ({
    name: attendee.name,
    guest: attendee.guest,
    bookingAt: null,
    phone: null,
    birthDate: null,
    clientId: null,
  }));

  storage.setItem(
    BABY_MANUAL_STORAGE_KEY,
    JSON.stringify({ date, start, end, createdAt: Date.now(), armedAt: null, attendees } satisfies StoredBabyManualRoster)
  );

  return {
    names: parsed.names,
    attendees,
    guests: parsed.guestCount,
    cancellationCount: parsed.cancellationCount,
  };
}

export function armManualBabyRoster(): boolean {
  const storage = browserStorage();
  if (!storage) return false;
  try {
    const raw = storage.getItem(BABY_MANUAL_STORAGE_KEY);
    const stored = validStoredRoster(raw ? JSON.parse(raw) : null);
    if (!stored) return false;
    storage.setItem(
      BABY_MANUAL_STORAGE_KEY,
      JSON.stringify({ ...stored, armedAt: Date.now() } satisfies StoredBabyManualRoster)
    );
    return true;
  } catch {
    return false;
  }
}

function peekArmedManualBabyRoster(): StoredBabyManualRoster | null {
  const storage = browserStorage();
  if (!storage) return null;
  try {
    const raw = storage.getItem(BABY_MANUAL_STORAGE_KEY);
    const stored = validStoredRoster(raw ? JSON.parse(raw) : null);
    if (!stored) return null;
    if (stored.armedAt == null || Date.now() - stored.armedAt > 30_000) return null;
    return stored;
  } catch {
    return null;
  }
}

export function clearManualBabyRoster() {
  const storage = browserStorage();
  if (!storage) return;
  storage.removeItem(BABY_MANUAL_STORAGE_KEY);
}

export function consumeManualBabyRoster(
  dateValue: string,
  startValue: string,
  endValue: string
): { attendees: BabyAimHarderAsistenteActivoApp[]; safety: BabyAimHarderSafetyApp } | null {
  const storage = browserStorage();
  if (!storage) return null;
  let parsed: unknown = null;
  try {
    const raw = storage.getItem(BABY_MANUAL_STORAGE_KEY);
    parsed = raw ? JSON.parse(raw) : null;
  } catch {
    storage.removeItem(BABY_MANUAL_STORAGE_KEY);
    return null;
  }

  const stored = validStoredRoster(parsed);
  if (!stored || stored.armedAt == null || Date.now() - stored.armedAt > 30_000) {
    storage.removeItem(BABY_MANUAL_STORAGE_KEY);
    return null;
  }

  const date = String(dateValue || '').slice(0, 10);
  const start = shortTime(startValue);
  const end = shortTime(endValue);
  if (stored.date !== date || stored.start !== start || stored.end !== end) return null;

  storage.removeItem(BABY_MANUAL_STORAGE_KEY);
  return {
    attendees: stored.attendees,
    safety: {
      sourceKey: 'manual-paste',
      sourceCount: stored.attendees.length,
      cancelledDetected: 0,
      cancelledNames: [],
      reportedPublic: stored.attendees.length,
      reportedTarget: stored.attendees.length,
      safeZero: false,
    },
  };
}


let manualBabyFetchAdapterInstalled = false;

function jsonResponse(payload: unknown): Response {
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function weekStartFromDate(dateValue: string): string {
  const date = new Date(`${String(dateValue || '').slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  const day = date.getUTCDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  date.setUTCDate(date.getUTCDate() + mondayOffset);
  return date.toISOString().slice(0, 10);
}

export function installManualBabyFetchAdapter() {
  if (manualBabyFetchAdapterInstalled || typeof window === 'undefined') return;
  manualBabyFetchAdapterInstalled = true;
  const originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    const url =
      typeof input === 'string'
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    if (!/\/functions\/v1\/mitico-aimharder-baby-read(?:$|[?#])/i.test(url)) {
      return originalFetch(input, init);
    }

    const stored = peekArmedManualBabyRoster();
    if (!stored) return originalFetch(input, init);

    let body: Record<string, unknown> = {};
    try {
      body = init?.body ? JSON.parse(String(init.body)) : {};
    } catch {
      return originalFetch(input, init);
    }

    const action = String(body.action || '').trim().toLowerCase();
    if (action === 'boxes') {
      return jsonResponse({
        boxes: [{ boid: -99001, gym: 'Mítico · listado pegado' }],
      });
    }

    if (action === 'week') {
      if (String(body.weekStart || '').slice(0, 10) !== weekStartFromDate(stored.date)) {
        return originalFetch(input, init);
      }
      return jsonResponse({
        classes: [
          {
            id: -99001,
            date: stored.date,
            time: `${stored.start}-${stored.end}`,
            timeid: 'manual-paste',
            className: `Baby · listado pegado · ${stored.start}-${stored.end}`,
            modalidad: 'BABY',
            ocupation: stored.attendees.length,
          },
        ],
      });
    }

    if (action === 'attendees') {
      const requestDate = String(body.date || '').slice(0, 10);
      if (requestDate !== stored.date) return originalFetch(input, init);
      const storage = browserStorage();
      storage?.removeItem(BABY_MANUAL_STORAGE_KEY);
      return jsonResponse({
        attendees: stored.attendees,
        total: stored.attendees.length,
        safety: {
          sourceKey: 'manual-paste',
          sourceCount: stored.attendees.length,
          cancelledDetected: 0,
          cancelledNames: [],
          reportedPublic: stored.attendees.length,
          reportedTarget: stored.attendees.length,
          safeZero: false,
        },
      });
    }

    return originalFetch(input, init);
  };
}
