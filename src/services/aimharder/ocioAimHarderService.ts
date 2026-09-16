import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
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
  const prefix = `${expectedWeek}__`;
  const cleanPrevious = Object.fromEntries(
    Object.entries(previous).filter(([key]) => !key.startsWith(prefix))
  );
  const changes = Object.fromEntries(
    Object.entries(plan.changes).map(([studentId, comes]) => [
      `${expectedWeek}__${studentId}`,
      comes,
    ])
  );

  return {
    attendance: { ...cleanPrevious, ...changes },
    message:
      plan.missingSlots > 0
        ? `AimHarder actualizado correctamente · ${plan.missingSlots} turno(s) de Ocio sin coincidencia exacta`
        : 'AimHarder actualizado correctamente',
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
