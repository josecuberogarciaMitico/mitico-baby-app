import { nivelesDe, sugerenciaDividir } from '../../../src/features/agenda/dividirGrupoLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('dividir: sugiere separar por nivel y luego por edad', () => {
  const n = (id: string, nivel: string, edad: number) => ({ alumno_id: id, nivel, edad });
  // 8 niños B/B+ → nuevo grupo con los B+.
  const s = sugerenciaDividir([n('b1', 'B', 4.5), n('p1', 'B+', 6.2), n('b2', 'B', 5), n('p2', 'B+', 6.4), n('b3', 'B', 5.3), n('p3', 'B+', 6.3), n('b4', 'B', 4.9), n('p4', 'B+', 5.9)]);
  equal(s.slice().sort().join(','), 'p1,p2,p3,p4', 'los B+ al grupo nuevo');
  // Mismo nivel: los mayores al grupo nuevo.
  const e = sugerenciaDividir([n('a', 'B', 4.3), n('b', 'B', 7.7), n('c', 'B', 5), n('d', 'B', 7.1), n('e', 'B', 5.3), n('f', 'B', 7.3)]);
  equal(e.slice().sort().join(','), 'a,c,e', 'por edad: los pequeños juntos y los mayores juntos');
  equal(sugerenciaDividir([n('x', 'A', 3)]).length, 0, 'uno solo: nada');
  equal(sugerenciaDividir([n('x', 'A', 3), n('y', 'A', 4)]).length, 1, 'dos: pasa uno');
});

test('dividir: nombre con los niveles reales', () => {
  equal(nivelesDe(['B+', 'B+']), 'B+', 'solo B+');
  equal(nivelesDe(['A', 'INICIACION', null]), 'INICIACIÓN / A', 'ordenado y con tilde');
});
