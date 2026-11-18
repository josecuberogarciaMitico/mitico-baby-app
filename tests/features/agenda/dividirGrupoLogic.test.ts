import { nivelesDe } from '../../../src/features/agenda/dividirGrupoLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('dividir: nombre con los niveles reales', () => {
  equal(nivelesDe(['B+', 'B+']), 'B+', 'solo B+');
  equal(nivelesDe(['A', 'INICIACION', null]), 'INICIACIÓN / A', 'ordenado y con tilde');
});
