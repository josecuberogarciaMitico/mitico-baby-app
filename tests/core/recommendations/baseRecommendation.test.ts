import {
  balancedGroupSizes,
  pedagogicalBandForLevel,
  recommendLevelCompatibility,
  validateGroupPedagogy,
} from '../../../src/core/recommendations/baseRecommendation';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

test('mismo nivel es recomendado', () => {
  equal(recommendLevelCompatibility('C', ['C']).status, 'RECOMENDADO', 'estado');
});

test('A+ con B queda para revisión manual', () => {
  equal(recommendLevelCompatibility('A+', ['B']).status, 'REVISAR', 'estado');
});

test('iniciación no se mezcla automáticamente con A+', () => {
  equal(
    recommendLevelCompatibility('INICIACION', ['A+']).status,
    'NO_ENCAJA',
    'estado'
  );
});

test('un nivel inválido nunca se convierte en nivel alto', () => {
  equal(
    recommendLevelCompatibility('DESCONOCIDO', ['C']).status,
    'REVISAR',
    'estado'
  );
  equal(pedagogicalBandForLevel('DESCONOCIDO').id, 'REVIEW', 'banda');
});

test('grupo con nivel inválido queda bloqueado', () => {
  const result = validateGroupPedagogy([
    { level: 'B+' },
    { level: 'SIN NIVEL' },
  ]);
  equal(result.status, 'BLOQUEADO', 'estado');
});

test('genera tamaños equilibrados sin grupo unitario', () => {
  equal(balancedGroupSizes(8, 7).join(','), '4,4', '8/7');
  equal(balancedGroupSizes(13, 7).join(','), '7,6', '13/7');
});

