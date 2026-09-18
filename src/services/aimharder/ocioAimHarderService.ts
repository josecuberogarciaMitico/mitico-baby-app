import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { parsePastedRoster } from '../../core/imports/pastedRoster';
import type { AlumnoResumen } from '../../core/students/studentTypes';
import { normalizeRosterName } from '../../core/sessions/rosterSync';
import { obtenerAccessTokenSupabaseApp } from '../auth/authService';
import {
  normalizeOcioAimHarderTurn,
  planOcioAttendanceFromAimHarder,
} from './aimHarderOperations';
import {
  selectMiticoBox,
  type AimHarderBox,
  type OcioAimHarderEstadoAlumnoApp,
  type OcioAimHarderSemanaApp,
  type OcioAimHarderTurnoApp,
} from './aimHarderContract';
import type { OcioStableRosterGroup } from './aimHarderOperations';

const OCIO_MANUAL_WEEK_STORAGE_KEY = 'mitico_ocio_manual_week_v1';
const OCIO_MANUAL_PENDING_STORAGE_KEY = 'mitico_ocio_manual_pending_v1';

type OcioManualStoredWeek = {
  semanaInicio: string;
  turnos: OcioAimHarderTurnoApp[];
};

type OcioWeekWithSource = OcioAimHarderSemanaApp & {
  origen?: 'AIMHARDER' | 'MANUAL';
};

export type OcioManualRosterStageInput = {
  weekStart: string;
  date: string;
  start: string;
  end: string;
  rawText: string;
};

export type OcioManualRosterStageResult = {
  total: number;
  guests: number;
  cancellationCount: number | null;
  names: string[];
};

function shortTime(value: unknown): string {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '';
  return `${match[1].padStart(2, '0')}:${match[2]}`;
}

function ocioDayFromIsoDate(value: string): '' | 'Jueves' | 'Sábado' | 'Domingo' {
  if (!value) return '';
  const date = new Date(`${value.slice(0, 10)}T12:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  const day = date.getUTCDay();
  if (day === 4) return 'Jueves';
  if (day === 6) return 'Sábado';
  if (day === 0) return 'Domingo';
  return '';
}

function browserSessionStorage(): Storage | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readStoredManualWeek(storage: Storage): OcioManualStoredWeek | null {
  try {
    const raw = storage.getItem(OCIO_MANUAL_WEEK_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<OcioManualStoredWeek>;
    if (!parsed || typeof parsed !== 'object') return null;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(parsed.semanaInicio || ''))) return null;
    if (!Array.isArray(parsed.turnos)) return null;
    return {
      semanaInicio: String(parsed.semanaInicio),
      turnos: parsed.turnos as OcioAimHarderTurnoApp[],
    };
  } catch {
    return null;
  }
}

export function stageManualOcioRoster(
  input: OcioManualRosterStageInput
): OcioManualRosterStageResult {
  const storage = browserSessionStorage();
  if (!storage) throw new Error('El pegado local de Ocio solo está disponible en el navegador.');

  const weekStart = String(input.weekStart || '').slice(0, 10);
  const date = String(input.date || '').slice(0, 10);
  const start = shortTime(input.start);
  const end = shortTime(input.end);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(weekStart) || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    throw new Error('No puedo identificar con seguridad la semana o el día de Ocio.');
  }
  if (!start || !end) {
    throw new Error('No puedo identificar con seguridad el horario de Ocio.');
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

  const previous = readStoredManualWeek(storage);
  const turns = previous?.semanaInicio === weekStart ? [...previous.turnos] : [];
  const nextTurn: OcioAimHarderTurnoApp = {
    fecha: date,
    horaInicio: start,
    horaFin: end,
    claseId: 0,
    claseNombre: 'Listado pegado',
    ocupacion: parsed.names.length,
    asistentes: parsed.attendees.map((attendee) => ({
      nombre: attendee.name,
      telefono: '',
      fechaNacimiento: '',
      clientId: '',
    })),
  };

  const slotKey = `${date}__${start}__${end}`;
  const updatedTurns = turns.filter(
    (turn) => `${turn.fecha}__${shortTime(turn.horaInicio)}__${shortTime(turn.horaFin)}` !== slotKey
  );
  updatedTurns.push(nextTurn);
  updatedTurns.sort((a, b) =>
    `${a.fecha} ${a.horaInicio}`.localeCompare(`${b.fecha} ${b.horaInicio}`)
  );

  storage.setItem(
    OCIO_MANUAL_WEEK_STORAGE_KEY,
    JSON.stringify({ semanaInicio: weekStart, turnos: updatedTurns } satisfies OcioManualStoredWeek)
  );
  storage.setItem(OCIO_MANUAL_PENDING_STORAGE_KEY, weekStart);

  return {
    total: parsed.names.length,
    guests: parsed.guestCount,
    cancellationCount: parsed.cancellationCount,
    names: parsed.names,
  };
}

function consumeManualOcioWeek(weekStart: string): OcioWeekWithSource | null {
  const storage = browserSessionStorage();
  if (!storage) return null;
  const pendingWeek = String(storage.getItem(OCIO_MANUAL_PENDING_STORAGE_KEY) || '');
  if (!pendingWeek || pendingWeek !== weekStart) return null;

  storage.removeItem(OCIO_MANUAL_PENDING_STORAGE_KEY);
  const stored = readStoredManualWeek(storage);
  if (!stored || stored.semanaInicio !== weekStart || stored.turnos.length === 0) return null;

  return {
    semanaInicio: weekStart,
    turnos: stored.turnos,
    actualizadoAt: new Date().toISOString(),
    origen: 'MANUAL',
  };
}

async function callOcioAimHarderRead(body: Record<string, unknown>): Promise<any> {
  const accessToken = await obtenerAccessTokenSupabaseApp();
  const response = await fetch(`${SUPABASE_URL}/functions/v1/mitico-aimharder-read`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(body),
  });

  const raw = await response.text();
  let data: any = {};
  try {
    data = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(`AimHarder devolvió una respuesta no válida (HTTP ${response.status}).`);
  }

  if (!response.ok) {
    throw new Error(
      typeof data?.error === 'string'
        ? data.error
        : `Error ${response.status} consultando AimHarder.`
    );
  }

  return data;
}

export async function readOcioAimHarderWeek(
  weekStart: string
): Promise<OcioAimHarderSemanaApp> {
  if (!weekStart) throw new Error('Selecciona primero la semana de Ocio.');

  // El modo manual usa exactamente el mismo contrato que AimHarder. Solo cambia
  // el origen del roster y no realiza ninguna petición externa.
  const manualWeek = consumeManualOcioWeek(weekStart);
  if (manualWeek) return manualWeek;

  const boxesResponse = await callOcioAimHarderRead({ action: 'boxes' });
  const boxes = Array.isArray(boxesResponse?.boxes)
    ? (boxesResponse.boxes as AimHarderBox[])
    : [];
  const box = selectMiticoBox(boxes);

  const week = await callOcioAimHarderRead({
    action: 'week',
    weekStart,
    boxId: Number(box.boid),
  });

  const classes = (Array.isArray(week?.classes) ? week.classes : [])
    .filter((classData: any) => String(classData?.modalidad || '').trim().toUpperCase() === 'OCIO')
    .sort((a: any, b: any) =>
      `${String(a?.date || '')} ${String(a?.time || '')}`.localeCompare(
        `${String(b?.date || '')} ${String(b?.time || '')}`
      )
    );

  const turns: OcioAimHarderTurnoApp[] = [];
  for (const classData of classes) {
    const date = String(classData?.date || '').slice(0, 10);
    const detail = await callOcioAimHarderRead({
      action: 'attendees',
      date,
      classId: Number(classData.id),
      className: String(classData.className || ''),
      time: String(classData.time || ''),
      modalidad: 'OCIO',
      boxId: Number(box.boid),
    });

    const turn = normalizeOcioAimHarderTurn(
      classData as Record<string, unknown>,
      detail?.attendees,
      detail?.total
    );
    if (turn) turns.push(turn);
  }

  return {
    semanaInicio: weekStart,
    turnos: turns,
    actualizadoAt: new Date().toISOString(),
  };
}

export function buildOcioAimHarderStudentStates(
  turns: OcioAimHarderTurnoApp[],
  masterStudents: AlumnoResumen[]
): Record<string, OcioAimHarderEstadoAlumnoApp> {
  const masterByName = new Map(
    masterStudents
      .map((student) => [normalizeRosterName(student.alumno || ''), student] as const)
      .filter(([key]) => Boolean(key))
  );
  const states: Record<string, OcioAimHarderEstadoAlumnoApp> = {};

  for (const turn of turns) {
    for (const attendee of turn.asistentes) {
      const key = normalizeRosterName(attendee.nombre || '');
      if (!key) continue;
      const master = masterByName.get(key);
      states[key] = master
        ? {
            alumno: master.alumno,
            nivel: master.nivel_actual || master.nivel_estimado || 'HISTORICO',
            resultado: 'EXISTENTE',
          }
        : {
            alumno: attendee.nombre,
            nivel: 'PENDIENTE',
            resultado: 'PENDIENTE_TEST',
          };
    }
  }

  return states;
}

export function buildOcioAttendanceState(
  previous: Record<string, boolean>,
  expectedWeek: string,
  week: OcioAimHarderSemanaApp,
  stableGroups: OcioStableRosterGroup[]
): { attendance: Record<string, boolean>; message: string } {
  const plan = planOcioAttendanceFromAimHarder(expectedWeek, week, stableGroups);
  const isManual = (week as OcioWeekWithSource).origen === 'MANUAL';
  const prefix = `${expectedWeek}__`;
  // Una importación manual puede hacerse día a día. En ese modo solo se
  // sobrescriben los alumnos de los turnos pegados y se conserva el resto de
  // la semana. Una lectura automática completa sí reemplaza la foto semanal.
  const cleanPrevious = isManual
    ? { ...previous }
    : Object.fromEntries(
        Object.entries(previous).filter(([key]) => !key.startsWith(prefix))
      );
  const changes = Object.fromEntries(
    Object.entries(plan.changes).map(([studentId, comes]) => [
      `${expectedWeek}__${studentId}`,
      comes,
    ])
  );
  const source = isManual ? 'Listado pegado' : 'AimHarder';

  return {
    attendance: { ...cleanPrevious, ...changes },
    message:
      plan.missingSlots > 0
        ? `${source} actualizado correctamente · ${plan.missingSlots} turno(s) de Ocio sin coincidencia exacta`
        : `${source} actualizado correctamente`,
  };
}

export function ocioStudentComesFromAimHarder(
  week: OcioAimHarderSemanaApp | null | undefined,
  expectedWeek: string,
  day: 'Jueves' | 'Sábado' | 'Domingo',
  start: string,
  end: string,
  studentName: string
): boolean {
  if (!expectedWeek || week?.semanaInicio !== expectedWeek) return false;
  const normalizedStudent = normalizeRosterName(studentName || '');
  if (!normalizedStudent) return false;

  const turn = week.turnos.find(
    (item) =>
      ocioDayFromIsoDate(item.fecha) === day &&
      shortTime(item.horaInicio) === shortTime(start) &&
      shortTime(item.horaFin) === shortTime(end)
  );
  if (!turn) return false;

  return turn.asistentes.some(
    (attendee) => normalizeRosterName(attendee.nombre || '') === normalizedStudent
  );
}
