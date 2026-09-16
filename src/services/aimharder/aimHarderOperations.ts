import { normalizeRosterName } from '../../core/sessions/rosterSync';
import {
  babyClassHours,
  type BabyAimHarderClaseApp,
  type BabyAimHarderRefrescoResultadoApp,
  type BabyAimHarderVerificacionRefrescoApp,
  type OcioAimHarderSemanaApp,
  type OcioAimHarderTurnoApp,
} from './aimHarderContract';

function shortTime(value: unknown): string {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '';
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return '';
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function aimHarderSlotKey(date: unknown, start: unknown, end?: unknown): string {
  const base = `${String(date || '').slice(0, 10)}__${shortTime(start)}`;
  return end === undefined ? base : `${base}__${shortTime(end)}`;
}

export function selectExactBabyClass(
  classes: BabyAimHarderClaseApp[],
  date: string,
  start: string,
  end: string,
  dateLabel = date
): BabyAimHarderClaseApp {
  const cleanDate = String(date || '').slice(0, 10);
  const cleanStart = shortTime(start);
  const cleanEnd = shortTime(end);
  if (!cleanDate || !cleanStart || !cleanEnd) {
    throw new Error('No puedo identificar con seguridad la fecha y el horario del turno Baby.');
  }

  const candidates = classes.filter((classData) => {
    if (String(classData.date || '').slice(0, 10) !== cleanDate) return false;
    try {
      const hours = babyClassHours(classData);
      return hours.inicio === cleanStart && hours.fin === cleanEnd;
    } catch {
      return false;
    }
  });
  if (candidates.length === 0) {
    throw new Error(`No encuentro en AimHarder una única clase Baby para ${dateLabel} · ${cleanStart}-${cleanEnd}. No se ha modificado nada.`);
  }
  if (candidates.length > 1) {
    throw new Error(`AimHarder devuelve ${candidates.length} clases Baby para ${dateLabel} · ${cleanStart}-${cleanEnd}. No voy a adivinar cuál es.`);
  }
  return candidates[0];
}

export type BabyWeekSlot = {
  date: string;
  start: string;
  classData: BabyAimHarderClaseApp;
};

export function planBabyWeekSlots(classes: BabyAimHarderClaseApp[]): {
  slots: BabyWeekSlot[];
  issues: string[];
} {
  const grouped = new Map<string, BabyAimHarderClaseApp[]>();
  const issues: string[] = [];
  for (const classData of classes) {
    const date = String(classData.date || '').slice(0, 10);
    try {
      const hours = babyClassHours(classData);
      const key = aimHarderSlotKey(date, hours.inicio);
      grouped.set(key, [...(grouped.get(key) || []), classData]);
    } catch (error) {
      issues.push(error instanceof Error ? error.message : `Horario Baby inválido en ${date}.`);
    }
  }

  const slots: BabyWeekSlot[] = [];
  for (const [key, candidates] of grouped) {
    const [date, start] = key.split('__');
    if (candidates.length !== 1) {
      issues.push(`${date} ${start}: AimHarder devuelve ${candidates.length} clases Baby con el mismo inicio. No se ha modificado nada en ese turno.`);
      continue;
    }
    slots.push({ date, start, classData: candidates[0] });
  }
  return { slots, issues };
}

function uniqueNames(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean)));
}

export function buildBabyRefreshSummary(
  activeCount: number,
  result: BabyAimHarderRefrescoResultadoApp | null | undefined,
  verification: BabyAimHarderVerificacionRefrescoApp
): string {
  const added = uniqueNames(result?.nombres_nuevos || []);
  const removed = uniqueNames([...(result?.nombres_retirados || []), ...verification.retiradosExtra]);
  const protectedNames = uniqueNames([...(result?.nombres_protegidos || []), ...verification.protegidosExtra]);
  const messages = ['✓ REFRESCAR DÍA'];

  if (added.length === 0 && removed.length === 0 && protectedNames.length === 0) {
    messages.push(`Sin cambios · ${activeCount} alumno(s) activo(s) en AimHarder · sesión ya actualizada`);
    return messages.join(' · ');
  }
  if (removed.length > 0) messages.push(`${removed.length} ${removed.length === 1 ? 'cancelación retirada' : 'cancelaciones retiradas'}: ${removed.join(', ')}`);
  if (added.length > 0) messages.push(`${added.length} ${added.length === 1 ? 'alumno añadido' : 'alumnos añadidos'}: ${added.join(', ')}`);
  if (protectedNames.length > 0) messages.push(`${protectedNames.length} ${protectedNames.length === 1 ? 'baja no retirada' : 'bajas no retiradas'} por asistencia/reporte: ${protectedNames.join(', ')}`);
  messages.push(`AimHarder: ${activeCount} activo(s) · sesión final: ${verification.totalFinal} alumno(s)`);
  return messages.join(' · ');
}

export type OcioStableRosterGroup = {
  groupId: string;
  date: string;
  start: string;
  end: string;
  students: Array<{ studentId: string; name: string }>;
};

export function planOcioAttendanceFromAimHarder(
  expectedWeek: string,
  week: OcioAimHarderSemanaApp,
  groups: OcioStableRosterGroup[]
): { changes: Record<string, boolean>; missingSlots: number } {
  if (!expectedWeek || week.semanaInicio !== expectedWeek) {
    throw new Error('La respuesta de AimHarder pertenece a otra semana. No se ha cambiado quién viene.');
  }
  const bySlot = new Map(week.turnos.map((turn) => [aimHarderSlotKey(turn.fecha, turn.horaInicio, turn.horaFin), turn]));
  const changes: Record<string, boolean> = {};
  let found = 0;
  for (const group of groups) {
    const turn = bySlot.get(aimHarderSlotKey(group.date, group.start, group.end));
    if (!turn) continue;
    found += 1;
    const reservations = new Set(turn.asistentes.map((attendee) => normalizeRosterName(attendee.nombre)).filter(Boolean));
    for (const student of group.students) {
      changes[student.studentId] = reservations.has(normalizeRosterName(student.name));
    }
  }
  return { changes, missingSlots: Math.max(0, groups.length - found) };
}

export function normalizeOcioAimHarderTurn(
  classData: Record<string, unknown>,
  rawAttendees: unknown,
  reportedTotal: unknown
): OcioAimHarderTurnoApp | null {
  const date = String(classData.date || '').slice(0, 10);
  const [rawStart = '', rawEnd = ''] = String(classData.time || '').split('-');
  const start = shortTime(rawStart);
  const end = shortTime(rawEnd);
  if (!date || !start || !end) return null;
  const attendees = Array.isArray(rawAttendees) ? rawAttendees : [];
  const occupation = Number(classData.ocupation) || 0;
  const total = Number(reportedTotal);
  const finalTotal = Number.isFinite(total) ? total : attendees.length;
  if (finalTotal !== occupation || attendees.length !== occupation) {
    throw new Error(`No cuadra el listado de ${date} ${start}-${end}: AimHarder marca ${occupation} ocupadas y se han leído ${attendees.length}. No se ha cambiado Preparar semana.`);
  }
  return {
    fecha: date,
    horaInicio: start,
    horaFin: end,
    claseId: Number(classData.id) || 0,
    claseNombre: String(classData.className || ''),
    ocupacion: occupation,
    asistentes: attendees.map((raw) => {
      const attendee = raw as Record<string, unknown>;
      return {
        nombre: String(attendee.name || '').trim(),
        telefono: String(attendee.phone || '').trim(),
        fechaNacimiento: String(attendee.birthDate || '').trim(),
        clientId: String(attendee.clientId || '').trim(),
      };
    }),
  };
}
