import type { SesionAgendaOperativa } from './agendaTypes';

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
