import {
  normalizeAnnualOcioEvaluation,
  requireEvaluationCut,
} from '../../../src/core/evaluations/evaluationContract';
import {
  buildOcioFamilyEvaluationHtml,
  dailyWorkObjectives,
  levelEvolutionText,
} from '../../../src/core/evaluations/ocioFamilyEvaluation';
import { buildIntensiveDiplomaBase } from '../../../src/core/evaluations/intensiveEvaluation';
import type {
  EvaluacionAnualOcioApp,
  ResumenFinalIntensivoApp,
} from '../../../src/core/evaluations/evaluationTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function rejects(run: () => void, label: string) { try { run(); } catch { return; } throw new Error(`${label}: se esperaba error`); }
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

function ocioRow(overrides: Partial<EvaluacionAnualOcioApp> = {}): EvaluacionAnualOcioApp {
  return {
    alumno_id: 'student', alumno: 'ANA TEST', temporada: '2026/27', entrenamientos_ocio: 3,
    sesiones_ocio_programadas: 4, asistencia_ocio_pct: 75, reportes_ocio: 2,
    primer_reporte_fecha: '2026-09-01', ultimo_reporte_fecha: '2026-09-10',
    nivel_inicial: 'A', nivel_final: 'A+', niveles_reportados: 'A → A+',
    tecnica_inicial: 'Inicial', tecnica_final: 'Correcta', autonomia_inicial: 'Con ayuda',
    autonomia_final: 'Autónomo', remontes_iniciales: [], remontes_finales: ['Cinta'],
    actitud_final: 'Buena', pista_final: 'Pequeña', recomendacion_final: 'Consolidar',
    comentario_tecnica_final: null, comentario_autonomia_final: null,
    trabajos_realizados: null, observaciones_grupo: null, observaciones_reportes: null,
    mejoras_reportadas: null, navidad_guardada: false, nivel_navidad: null,
    tecnica_navidad: null, autonomia_navidad: null, remontes_navidad: [],
    actitud_navidad: null, pista_navidad: null, recomendacion_navidad: null,
    trabajos_navidad: null, observaciones_grupo_navidad: null,
    observaciones_reportes_navidad: null, ...overrides,
  };
}

test('solo admite cortes de evaluación conocidos', () => {
  equal(requireEvaluationCut('navidad'), 'NAVIDAD', 'corte');
  rejects(() => requireEvaluationCut('trimestre'), 'corte inventado');
});

test('normaliza números y listas de la evaluación anual', () => {
  const row = normalizeAnnualOcioEvaluation(ocioRow({ reportes_ocio: Number.NaN, remontes_finales: null }));
  equal(row.reportes_ocio, 0, 'reportes');
  equal(row.remontes_finales?.length, 0, 'remontes');
});

test('la evolución usa el contrato común de niveles', () => {
  equal(levelEvolutionText(ocioRow()).includes('ha progresado'), true, 'progreso');
  equal(levelEvolutionText(ocioRow({ nivel_final: 'DESCONOCIDO' })).includes('recorrido'), true, 'sin fallback');
});

test('el informe limita Trabajo diario y escapa contenido familiar', () => {
  const work = Array.from({ length: 8 }, (_, index) => `OBJETIVO · O${index}`).join('\n');
  equal(dailyWorkObjectives(work).length, 5, 'límite');
  const html = buildOcioFamilyEvaluationHtml(ocioRow({ alumno: '<script>TEST</script>', trabajos_realizados: work }), {
    age: 8,
    formatDate: (date) => date,
  });
  equal(html.includes('<script>TEST</script>'), false, 'html seguro');
  equal(html.includes('&lt;script&gt;TEST&lt;/script&gt;'), true, 'nombre escapado');
});

test('el diploma Intensivos conserva reportes y niveles confirmados', () => {
  const record = {
    intensivo: 'NAVIDAD', alumno: 'ANA TEST', dias_presente: 3, dias_ausente: 1,
    dias_pendiente_asistencia: 0, total_dias_intensivo: 4, total_reportes: 1,
    niveles_reportados: 'A → A+', nivel_mas_alto_reportado: 'A+', nivel_ultimo_reporte: 'A+',
    nivel_final_propuesto_id: 'p', nivel_final_confirmado_id: 'c', tecnicas_reportadas: 'Correcta',
    actitudes_reportadas: 'Buena', autonomias_reportadas: 'Autónomo', incidencias_reportadas: null,
    recomendaciones_reportadas: 'Consolidar', comentarios_tecnica: null, comentarios_actitud: null,
    comentarios_autonomia: null, comentarios_recomendacion: null,
  } as ResumenFinalIntensivoApp;
  const text = buildIntensiveDiplomaBase(record, [], {
    formatDate: (date) => date,
    levelCodeById: (id) => id === 'c' ? 'A+' : id === 'p' ? 'A+' : '-',
    summarizeTechnicalEvaluation: () => '',
  });
  equal(text.includes('Nivel final confirmado: A+'), true, 'nivel confirmado');
  equal(text.includes('Sin reportes día a día todavía.'), true, 'detalle vacío');
});
