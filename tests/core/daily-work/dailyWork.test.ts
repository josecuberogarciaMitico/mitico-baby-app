import {
  buildDailyWorkStudentContext,
  recentDailyWorkForGroup,
} from '../../../src/core/daily-work/dailyWorkContext';
import { requireDailyWorkLevels } from '../../../src/core/daily-work/dailyWorkLevels';
import type {
  DailyWorkContextSources,
  InputTrabajoDiario,
} from '../../../src/core/daily-work/dailyWorkTypes';
import { generarTrabajoDiarioInteligenteApp } from '../../../src/lib/dailyWorkEngine';
import type { AlumnoResumen, PerfilOperativoAlumnoApp } from '../../../src/core/students/studentTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function rejects(run: () => void, label: string) { try { run(); } catch { return; } throw new Error(`${label}: se esperaba error`); }
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

function input(overrides: Partial<InputTrabajoDiario> = {}): InputTrabajoDiario {
  return {
    nombreGrupo: 'Grupo prueba', modalidad: 'BABY', niveles: ['A'], pista: 'Pequeña',
    observacionesGrupo: '', alumnos: [], trabajosRecientes: [], ...overrides,
  };
}

test('Trabajo diario consume niveles individuales oficiales y alias controlados', () => {
  const levels = requireDailyWorkLevels(input({
    niveles: ['D'],
    alumnos: [{ alumnoId: 'a', nombre: 'Ana', nivel: 'B++' }],
  }));
  equal(levels.join(','), 'B+', 'niveles de alumnos');
});

test('Trabajo diario no inventa A+ si falta el nivel', () => {
  rejects(() => requireDailyWorkLevels(input({ niveles: [], alumnos: [] })), 'nivel ausente');
  rejects(() => generarTrabajoDiarioInteligenteApp(input({ niveles: [], alumnos: [] })), 'generador sin nivel');
});

test('Trabajo diario bloquea etiquetas ambiguas de grupo', () => {
  rejects(() => requireDailyWorkLevels(input({ niveles: ['A+ / B'] })), 'etiqueta ambigua');
});

test('construye un contexto único con perfil, ficha, ritmo y evaluación técnica', () => {
  const sources: DailyWorkContextSources = {
    students: [{
      alumno_id: 'a', alumno: 'Ana', nivel_actual: 'A', ultimo_nivel_reportado: 'A',
      nivel_estimado: null, ultima_tecnica: 'Cuña', ultima_actitud: 'Buena', ultima_autonomia: null,
      ultima_incidencia: null, ultima_recomendacion: 'Giros', ultimos_remontes: ['Cinta'],
    } as AlumnoResumen],
    profiles: [{
      alumno_id: 'a', alumno: 'Ana Perfil', nivel_usado: 'A+', ritmo_tendencia: 'Rápido',
      autonomia_reciente: 'Autónoma', remontes_recientes: ['Cinta', 'Percha'], fuerza_nivel: 'FUERTE',
      demanda_atencion: 'MEDIA', observacion_visible_entrenador: 'Atención', aviso_operativo: null,
    } as PerfilOperativoAlumnoApp],
    rhythmTrends: [], initialProgressions: [],
    technicalContexts: [{
      alumno_id: 'a', reporte_id: 'r', fecha: '2026-09-01',
      evaluacion_tecnica: { postura: 'En desarrollo', frenada: 'Correcto' },
      mejoras_hoy: [], prioridades_proxima_sesion: ['Equilibrio'],
    }],
  };
  const result = buildDailyWorkStudentContext('a', sources);
  equal(result.nivel, 'A+', 'nivel operativo');
  equal(result.remontes?.join(','), 'Cinta,Percha', 'remontes');
  equal(result.tecnica?.includes('postura En desarrollo'), true, 'técnica');
  equal(result.recomendacion, 'Giros · Equilibrio', 'prioridad');
});

test('la memoria prioriza coincidencias, excluye presente/futuro y deduplica', () => {
  const history = [
    { fecha: '2026-09-14', modalidad: 'BABY', alumnos_detalle: 'Ana López · Leo', trabajo_diario: 'Trabajo A' },
    { fecha: '2026-09-13', modalidad: 'BABY', alumnos_detalle: 'Ana Lopez', trabajo_diario: 'Trabajo A' },
    { fecha: '2026-09-12', modalidad: 'BABY', alumnos_detalle: 'Ana López · Leo', trabajo_diario: 'Trabajo B' },
    { fecha: '2026-09-15', modalidad: 'BABY', alumnos_detalle: 'Ana López', trabajo_diario: 'Trabajo futuro' },
  ];
  const result = recentDailyWorkForGroup(['Ána López', 'Leo'], history, '2026-09-15');
  equal(result.join(','), 'Trabajo A,Trabajo B', 'memoria');
});

test('el generador conserva un plan válido con nivel oficial', () => {
  const result = generarTrabajoDiarioInteligenteApp(input({ niveles: ['A'] }));
  equal(result.includes('TRABAJO'), true, 'plan generado');
});
