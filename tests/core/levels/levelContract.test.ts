import {
  parseTechnicalLevel,
  requireTechnicalLevel,
  resolveCurrentOperationalLevel,
  resolveSessionOperationalLevel,
  technicalLevelOrder,
} from '../../../src/core/levels/levelContract';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function ok(value: unknown, label: string) {
  if (!value) throw new Error(label);
}

function test(name: string, run: () => void) {
  try {
    run();
    console.log(`OK  ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
}

test('acepta los nueve niveles oficiales', () => {
  for (const level of ['INICIACION', 'A', 'A+', 'B', 'B+', 'C', 'C+', 'D', 'D+']) {
    const parsed = parseTechnicalLevel(level);
    equal(parsed.status, 'VALID', level);
  }
});

test('normaliza alias históricos sin inventar nivel', () => {
  equal(requireTechnicalLevel('Iniciación'), 'INICIACION', 'acento');
  equal(requireTechnicalLevel('Debut'), 'INICIACION', 'debut');
  equal(requireTechnicalLevel('B++'), 'B+', 'B++');
  equal(requireTechnicalLevel('Nivel C+'), 'C+', 'etiqueta');
});

test('no interpreta palabras ajenas como nivel', () => {
  equal(parseTechnicalLevel('SOCIO').status, 'INVALID', 'SOCIO');
  equal(parseTechnicalLevel('BABY').status, 'INVALID', 'BABY');
  equal(technicalLevelOrder('desconocido'), null, 'orden desconocido');
});

test('no convierte una etiqueta de grupo en nivel individual', () => {
  const parsed = parseTechnicalLevel('A+ / B');
  equal(parsed.status, 'INVALID', 'estado');
  if (parsed.status === 'INVALID') equal(parsed.reason, 'AMBIGUOUS', 'motivo');
});

test('nivel desconocido produce error controlado', () => {
  let thrown = false;
  try {
    requireTechnicalLevel('nivel extraterrestre', 'reporte');
  } catch (error) {
    thrown = error instanceof Error && error.message.includes('Requiere revisión');
  }
  ok(thrown, 'Debe lanzar TechnicalLevelError');
});

test('último reporte válido gobierna nivel actual', () => {
  const result = resolveCurrentOperationalLevel({
    currentLevel: 'C',
    latestReportLevel: 'C',
    estimatedLevel: 'B+',
  });
  equal(result.status, 'RESOLVED', 'estado');
  equal(result.level, 'C', 'nivel');
  equal(result.source, 'LATEST_REPORT', 'origen');
});

test('discrepancia reporte/ficha exige revisión', () => {
  const result = resolveCurrentOperationalLevel({
    currentLevel: 'B+',
    latestReportLevel: 'C',
  });
  equal(result.status, 'REQUIRES_REVIEW', 'estado');
  equal(result.level, 'C', 'nivel operativo');
  equal(result.source, 'LATEST_REPORT', 'origen');
});

test('corrección manual explícita y trazable tiene precedencia', () => {
  const result = resolveCurrentOperationalLevel({
    currentLevel: 'B+',
    latestReportLevel: 'C',
    manualCorrectionLevel: 'B+',
    manualCorrectionId: 'correction-test',
    manualCorrectionAt: '2026-01-11T10:00:00Z',
  });
  equal(result.level, 'B+', 'nivel');
  equal(result.source, 'MANUAL_CORRECTION', 'origen');
});

test('corrección manual sin trazabilidad no pisa el reporte', () => {
  const result = resolveCurrentOperationalLevel({
    currentLevel: 'B+',
    latestReportLevel: 'C',
    manualCorrectionLevel: 'B+',
  });
  equal(result.status, 'REQUIRES_REVIEW', 'estado');
  equal(result.level, null, 'nivel');
});

test('estimado es provisional, no nivel real confirmado', () => {
  const result = resolveCurrentOperationalLevel({ estimatedLevel: 'A+' });
  equal(result.status, 'PROVISIONAL', 'estado');
  equal(result.level, 'A+', 'nivel');
  equal(result.reviewRequired, true, 'revisión');
});

test('override de sesión gana solo si está declarado como override', () => {
  const result = resolveSessionOperationalLevel({
    currentLevel: 'C',
    sessionLevel: 'B+',
    sessionLevelKind: 'OVERRIDE',
  });
  equal(result.level, 'B+', 'nivel');
  equal(result.source, 'SESSION_OVERRIDE', 'origen');
});

test('snapshot de sesión no pisa nivel actual', () => {
  const result = resolveSessionOperationalLevel({
    currentLevel: 'C',
    sessionLevel: 'B+',
    sessionLevelKind: 'SNAPSHOT',
  });
  equal(result.level, 'C', 'nivel');
  equal(result.source, 'CURRENT_LEVEL', 'origen');
});
