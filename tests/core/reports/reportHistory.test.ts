import {
  buildFamilyReportBase,
  classifyReportModality,
  filterReportHistory,
  reportHistoryCounts,
  type ReportHistoryFilter,
} from '../../../src/core/reports/reportHistory';
import type { HistorialReporteAlumnoFichaApp } from '../../../src/core/reports/reportTypes';
import {
  prepareTrainerReportOpening,
  reportTechnicalLevelForRender,
  requireReportTechnicalLevel,
} from '../../../src/lib/adaptiveReport';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

function report(
  date: string,
  modality: string,
  level: string
): HistorialReporteAlumnoFichaApp {
  return {
    reporte_id: `${date}-${modality}`,
    fecha: date,
    modalidad: modality,
    grupo: null,
    entrenador: null,
    nivel_reportado: level,
    actitud: null,
    tecnica: null,
    pista: null,
    remontes: null,
    autonomia: null,
    ritmo_grupo: null,
    mejora_hoy: null,
    incidencia: null,
    recomendacion: null,
    observaciones_generales: null,
    trabajo_diario: null,
    enviado_at: `${date}T12:00:00Z`,
  };
}

test('clasifica todas las modalidades sobre un historial único', () => {
  equal(classifyReportModality('Mítico Baby'), 'BABY', 'Baby');
  equal(classifyReportModality('OCIO'), 'OCIO', 'Ocio');
  equal(classifyReportModality('Intensivo Navidad'), 'INTENSIVOS', 'Intensivos');
});

test('filtra y ordena la cronología común', () => {
  const reports = [
    report('2026-01-02', 'BABY', 'A'),
    report('2026-02-03', 'OCIO', 'B'),
    report('2026-01-15', 'INTENSIVOS', 'A+'),
  ];
  equal(filterReportHistory(reports, 'TODOS')[0].nivel_reportado, 'B', 'orden');
  equal(filterReportHistory(reports, 'OCIO').length, 1, 'filtro Ocio');
  const counts = reportHistoryCounts(reports);
  equal(counts.TODOS, 3, 'total');
  equal(counts.INTENSIVOS, 1, 'total Intensivos');
  const filters: ReportHistoryFilter[] = ['TODOS', 'BABY', 'OCIO', 'INTENSIVOS'];
  equal(filters.every((filter) => counts[filter] >= 0), true, 'contadores');
});

test('el informe familiar usa el último reporte como nivel y limita el detalle', () => {
  const reports = Array.from({ length: 9 }, (_, index) => ({
    ...report(`2026-01-${String(index + 1).padStart(2, '0')}`, 'OCIO', index === 8 ? 'C' : 'B'),
    observaciones_generales: `Observación ${index + 1}`,
    trabajo_diario: `OBJETIVO · Objetivo ${index + 1}`,
    recomendacion: `Siguiente ${index + 1}`,
  }));
  const value = buildFamilyReportBase(
    {
      alumno: 'ALUMNO TEST',
      nivel_actual: 'B',
      ultimo_nivel_reportado: 'C',
      nivel_estimado: 'A',
    },
    reports,
    {
      formatDate: (date) => date,
      summarizeTechnicalEvaluation: () => '',
    }
  );
  equal(value.includes('Nivel actual de ficha: C'), true, 'precedencia reporte');
  equal((value.match(/• Objetivo/g) || []).length, 5, 'máximo trabajo diario');
  equal((value.match(/• 2026-/g) || []).length, 5, 'máximo observaciones');
});

test('el render de reportes tolera etiquetas mixtas sin inventar nivel', () => {
  equal(reportTechnicalLevelForRender('B+ / C'), null, 'B+ / C');
  equal(reportTechnicalLevelForRender('C+ / D+'), null, 'C+ / D+');
  equal(reportTechnicalLevelForRender('C+, D+'), null, 'C+, D+');
  equal(reportTechnicalLevelForRender(''), null, 'vacío');
  equal(reportTechnicalLevelForRender('C+'), 'C+', 'C+ individual');
});

test('el guardado de reportes exige un único nivel individual', () => {
  equal(requireReportTechnicalLevel('D+'), 'D+', 'D+ válido');

  let thrown = false;
  try {
    requireReportTechnicalLevel('C+ / D+');
  } catch {
    thrown = true;
  }
  equal(thrown, true, 'mezcla bloqueada');
});

test('BABY prepara el formulario antes de consultar el nivel de sesión', () => {
  const apertura = prepareTrainerReportOpening({
    alumnoId: 'alumno-baby',
    grupoId: 'grupo-baby',
    entrenadorId: 'entrenador-baby',
    individualLevel: 'INICIACION',
  });

  equal(apertura.status, 'READY', 'apertura inmediata');
  if (apertura.status === 'READY') {
    equal(apertura.level, 'INICIACION', 'nivel individual');
    equal(apertura.activeReport.alumno_id, 'alumno-baby', 'alumno activo');
    equal(apertura.activeReport.entrenador_id, 'entrenador-baby', 'entrenador activo');
  }
});

test('BABY sin nivel abre el selector y no usa una etiqueta de grupo', () => {
  const apertura = prepareTrainerReportOpening({
    alumnoId: 'alumno-baby',
    grupoId: 'grupo-baby',
    entrenadorId: 'entrenador-baby',
    individualLevel: 'C+ / D+',
  });

  equal(apertura.status, 'READY', 'apertura sin nivel');
  if (apertura.status === 'READY') {
    equal(apertura.level, null, 'nivel pendiente de selección');
  }
});

test('la apertura bloquea filas sin identidad operativa completa', () => {
  const apertura = prepareTrainerReportOpening({
    alumnoId: '',
    grupoId: 'grupo-baby',
    entrenadorId: 'entrenador-baby',
    individualLevel: 'A',
  });

  equal(apertura.status, 'INVALID_IDENTIFIERS', 'identidad incompleta');
});
