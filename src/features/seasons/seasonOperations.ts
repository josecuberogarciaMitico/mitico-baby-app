import { fechaIsoEditor } from '../availability/availabilityEditor';
import type { CierreTemporadaAlumnoApp, MiticoWeeklyBackup, ResumenCierreTemporadaApp } from './seasonTypes';

export function normalizeSeasonClosureStudents(rows: CierreTemporadaAlumnoApp[]): CierreTemporadaAlumnoApp[] {
  return rows.map((row) => ({ ...row, entrenamientos_temporada: Number(row.entrenamientos_temporada || 0),
    tuvo_asistencia: Boolean(row.tuvo_asistencia), tuvo_reporte: Boolean(row.tuvo_reporte),
    activo_temporada: Boolean(row.activo_temporada), conservar_siguiente: Boolean(row.conservar_siguiente) }));
}

export function normalizeSeasonClosureSummary(row?: ResumenCierreTemporadaApp | null): ResumenCierreTemporadaApp | null {
  return row ? { ...row, total_alumnos_base: Number(row.total_alumnos_base || 0), activos_temporada: Number(row.activos_temporada || 0),
    conservar_siguiente: Number(row.conservar_siguiente || 0), eliminar_por_inactividad: Number(row.eliminar_por_inactividad || 0),
    con_asistencia: Number(row.con_asistencia || 0), con_reporte: Number(row.con_reporte || 0) } : null;
}

export function seasonClosureIssue(input: {
  isHeadCoordinator: boolean; summary: ResumenCierreTemporadaApp | null;
  backupConfirmed: boolean; listConfirmed: boolean; confirmationText: string;
}): string | null {
  if (!input.isHeadCoordinator) return 'Solo el Coordinador jefe puede cerrar la temporada.';
  if (!input.summary) return 'Primero analiza la temporada en el Paso 1.';
  const expected = `CERRAR ${input.summary.temporada}`;
  if (!input.backupConfirmed || !input.listConfirmed) return 'Confirma que has guardado el backup y revisado la lista de eliminación.';
  return input.confirmationText.trim() === expected ? null : `Escribe exactamente: ${expected}`;
}

export function normalizeSeasonCsvHeader(value: string): string {
  return String(value || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase('es-ES').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim();
}

export function weeklyBackupStorageKey(week: string): string { return week ? `mitico_backup_json_${week}` : ''; }

export function addBackupDays(isoDate: string, days: number): string {
  const date = new Date(`${isoDate}T12:00:00`); date.setDate(date.getDate() + days);
  return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'), String(date.getDate()).padStart(2, '0')].join('-');
}

export function weeklyBackupFilename(season: string, weekStart: string, weekEnd: string, generated = new Date()): string {
  const cleanSeason = (season || 'TEMPORADA').replace(/\//g, '-').replace(/[^0-9A-Za-zÁÉÍÓÚÜÑáéíóúüñ_-]+/g, '_');
  return `MITICO_BACKUP_${cleanSeason}_SEMANA_${weekStart}_A_${weekEnd}_GENERADO_${fechaIsoEditor(generated)}.json`;
}

export function parseAndValidateWeeklyBackup(text: string): MiticoWeeklyBackup {
  const backup = JSON.parse(text) as Partial<MiticoWeeklyBackup>;
  if (backup.formato !== 'MITICO_BACKUP_SEMANAL_V1' || Number(backup.version) !== 1
    || !backup.semana_inicio || !backup.semana_fin || !backup.datos || typeof backup.datos !== 'object') {
    throw new Error('El archivo no tiene el formato de backup semanal Mítico V1.');
  }
  if (!Array.isArray((backup.datos as Record<string, unknown>).alumnos)) {
    throw new Error('El backup no contiene el bloque obligatorio de alumnos.');
  }
  return backup as MiticoWeeklyBackup;
}

export function weeklyBackupRowCount(backup: unknown): number {
  const data = backup && typeof backup === 'object' ? (backup as { datos?: unknown }).datos : null;
  if (!data || typeof data !== 'object') return 0;
  return Object.values(data).reduce((total, value) => total + (Array.isArray(value) ? value.length : 0), 0);
}
