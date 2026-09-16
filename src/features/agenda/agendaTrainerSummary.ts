import type { EntrenadorResumen } from '../../core/trainers/trainerTypes';
import type { SesionAgendaOperativa } from './agendaTypes';
import { addIsoDays } from './agendaRelocation';

export type AgendaTrainerAssignmentRow = {
  entrenador_id: string;
  entrenador: string;
  grupo_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
};

export type SessionTrainerCoverage = {
  totalGroups: number;
  assignedGroups: number;
  pendingGroups: number;
  trainerNames: string[];
};

export type WeeklyTrainerLoad = {
  trainerId: string;
  trainerName: string;
  turns: number;
  doubles: string[];
};

function normalize(value: unknown) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function canonicalModality(value: unknown) {
  const normalized = normalize(value);
  if (normalized.startsWith('INTENSIV')) return 'INTENSIVOS';
  if (normalized.includes('BABY')) return 'BABY';
  if (normalized.includes('OCIO')) return 'OCIO';
  if (normalized.includes('PARTICULAR')) return 'PARTICULAR';
  return normalized;
}

function shortDay(dateIso: string) {
  const value = new Date(`${dateIso}T12:00:00`).toLocaleDateString('es-ES', {
    weekday: 'short',
  });
  const clean = value.replace('.', '');
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

function sameSession(
  row: Pick<AgendaTrainerAssignmentRow, 'fecha' | 'hora_inicio' | 'hora_fin' | 'modalidad'>,
  session: SesionAgendaOperativa
) {
  return (
    row.fecha === session.fecha &&
    String(row.hora_inicio).slice(0, 5) === String(session.hora_inicio).slice(0, 5) &&
    String(row.hora_fin).slice(0, 5) === String(session.hora_fin).slice(0, 5) &&
    canonicalModality(row.modalidad) === canonicalModality(session.modalidad)
  );
}

export function sessionTrainerCoverage(
  session: SesionAgendaOperativa,
  assignments: AgendaTrainerAssignmentRow[]
): SessionTrainerCoverage {
  const rows = assignments.filter((row) => sameSession(row, session));
  const assignedGroupIds = new Set(rows.map((row) => row.grupo_id).filter(Boolean));
  const totalGroups = Number(session.totalGrupos || 0);
  const trainerNames = Array.from(
    new Set(rows.map((row) => String(row.entrenador || '').trim()).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b, 'es'));

  return {
    totalGroups,
    assignedGroups: Math.min(totalGroups, assignedGroupIds.size),
    pendingGroups: Math.max(0, totalGroups - assignedGroupIds.size),
    trainerNames,
  };
}

export function buildWeeklyTrainerLoads(input: {
  weekStart: string;
  trainers: EntrenadorResumen[];
  assignments: AgendaTrainerAssignmentRow[];
}): WeeklyTrainerLoad[] {
  const weekEnd = addIsoDays(input.weekStart, 6);
  const activeTrainers = input.trainers
    .filter((trainer) => trainer.activo !== false)
    .slice()
    .sort((a, b) => a.nombre_completo.localeCompare(b.nombre_completo, 'es'));

  return activeTrainers.map((trainer) => {
    const rows = input.assignments.filter(
      (row) =>
        row.entrenador_id === trainer.entrenador_id &&
        row.fecha >= input.weekStart &&
        row.fecha <= weekEnd
    );
    const slots = new Map<string, AgendaTrainerAssignmentRow>();
    rows.forEach((row) => {
      slots.set(`${row.fecha}|${row.hora_inicio}|${row.hora_fin}`, row);
    });

    const byDate = new Map<string, number>();
    slots.forEach((row) => {
      byDate.set(row.fecha, (byDate.get(row.fecha) || 0) + 1);
    });
    const doubles = Array.from(byDate.entries())
      .filter(([, count]) => count >= 2)
      .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
      .map(([date, count]) => `${shortDay(date)} x${count}`);

    return {
      trainerId: trainer.entrenador_id,
      trainerName: trainer.nombre_completo,
      turns: slots.size,
      doubles,
    };
  });
}

export function pendingTrainerGroupsInSessions(
  sessions: SesionAgendaOperativa[],
  assignments: AgendaTrainerAssignmentRow[]
) {
  return sessions.reduce(
    (total, session) => total + sessionTrainerCoverage(session, assignments).pendingGroups,
    0
  );
}
