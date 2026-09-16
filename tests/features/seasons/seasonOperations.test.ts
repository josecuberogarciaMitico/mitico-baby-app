import {
  addBackupDays,
  normalizeSeasonClosureStudents,
  normalizeSeasonClosureSummary,
  normalizeSeasonCsvHeader,
  parseAndValidateWeeklyBackup,
  seasonClosureIssue,
  weeklyBackupFilename,
  weeklyBackupRowCount,
  weeklyBackupStorageKey,
} from '../../../src/features/seasons/seasonOperations';
import type { CierreTemporadaAlumnoApp, ResumenCierreTemporadaApp } from '../../../src/features/seasons/seasonTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function rejects(run: () => void, label: string) { try { run(); } catch { return; } throw new Error(`${label}: se esperaba error`); }
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const summary = { temporada: '2025/2026', total_alumnos_base: 10, activos_temporada: 8,
  conservar_siguiente: 8, eliminar_por_inactividad: 2, con_asistencia: 7, con_reporte: 6 } as ResumenCierreTemporadaApp;

test('normaliza filas y resumen remoto antes de decidir el cierre', () => {
  const row = { alumno_id: 'a', alumno: 'Ana', temporada: '2025/2026', entrenamientos_temporada: '4',
    tuvo_asistencia: 1, tuvo_reporte: 0, activo_temporada: 1, conservar_siguiente: 0 } as unknown as CierreTemporadaAlumnoApp;
  const normalized = normalizeSeasonClosureStudents([row])[0];
  equal(normalized.entrenamientos_temporada, 4, 'entrenamientos');
  equal(normalized.tuvo_asistencia, true, 'asistencia');
  equal(normalized.conservar_siguiente, false, 'conservar');
  equal(normalizeSeasonClosureSummary({ ...summary, total_alumnos_base: '10' as unknown as number })?.total_alumnos_base, 10, 'resumen');
});

test('cierre exige rol, análisis, dos confirmaciones y texto exacto', () => {
  equal(seasonClosureIssue({ isHeadCoordinator: false, summary, backupConfirmed: true, listConfirmed: true, confirmationText: 'CERRAR 2025/2026' }), 'Solo el Coordinador jefe puede cerrar la temporada.', 'rol');
  equal(seasonClosureIssue({ isHeadCoordinator: true, summary: null, backupConfirmed: true, listConfirmed: true, confirmationText: '' }), 'Primero analiza la temporada en el Paso 1.', 'análisis');
  equal(Boolean(seasonClosureIssue({ isHeadCoordinator: true, summary, backupConfirmed: false, listConfirmed: true, confirmationText: 'CERRAR 2025/2026' })), true, 'backup');
  equal(seasonClosureIssue({ isHeadCoordinator: true, summary, backupConfirmed: true, listConfirmed: true, confirmationText: 'CERRAR 2025/2026' }), null, 'válido');
});

test('cabeceras y clave local mantienen compatibilidad V1', () => {
  equal(normalizeSeasonCsvHeader('Último_nivel-real'), 'ultimo nivel real', 'cabecera');
  equal(weeklyBackupStorageKey('2026-09-14'), 'mitico_backup_json_2026-09-14', 'storage');
  equal(weeklyBackupStorageKey(''), '', 'storage vacío');
});

test('fecha y nombre del backup son deterministas', () => {
  equal(addBackupDays('2026-12-28', 6), '2027-01-03', 'cruce de año');
  equal(weeklyBackupFilename('2025/2026', '2026-01-05', '2026-01-11', new Date(2026, 0, 12)),
    'MITICO_BACKUP_2025-2026_SEMANA_2026-01-05_A_2026-01-11_GENERADO_2026-01-12.json', 'nombre');
});

test('backup requiere formato, versión, semana, datos y alumnos', () => {
  const valid = JSON.stringify({ formato: 'MITICO_BACKUP_SEMANAL_V1', version: 1,
    semana_inicio: '2026-09-14', semana_fin: '2026-09-20', datos: { alumnos: [], grupos: [1, 2] } });
  equal(parseAndValidateWeeklyBackup(valid).semana_inicio, '2026-09-14', 'válido');
  rejects(() => parseAndValidateWeeklyBackup('{}'), 'formato');
  rejects(() => parseAndValidateWeeklyBackup(JSON.stringify({ formato: 'MITICO_BACKUP_SEMANAL_V1', version: 1,
    semana_inicio: 'a', semana_fin: 'b', datos: {} })), 'alumnos');
});

test('cuenta solo arrays restaurables del backup', () => {
  equal(weeklyBackupRowCount({ datos: { alumnos: [1, 2], grupos: [1], meta: { version: 1 } } }), 3, 'filas');
  equal(weeklyBackupRowCount(null), 0, 'vacío');
});
