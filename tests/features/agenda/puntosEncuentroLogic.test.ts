import { avisoCompartirPunto, opcionesPuntoEncuentro, textoOpcionPunto } from '../../../src/features/agenda/puntosEncuentroLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const puntos = ['1', '2', '3'];
const g = (id: string, nombre: string, punto: string | null) => ({ grupo_id: id, nombre_grupo: nombre, punto_encuentro: punto });

test('puntos: mientras quede alguno libre, solo salen los libres', () => {
  const o = opcionesPuntoEncuentro(puntos, 'yo', [g('a', 'Ocio G1', '1'), g('yo', 'Yo', null)]);
  equal(o.map((x) => x.punto).join(','), '2,3', 'libres');
  equal(avisoCompartirPunto(o[0]), null, 'libre sin aviso');
});

test('puntos: sin libres se puede compartir, avisando con quién', () => {
  const o = opcionesPuntoEncuentro(puntos, 'yo', [g('a', 'Ocio G1', '1'), g('b', 'Baby G2', '2'), g('c', 'Int G3', '3')]);
  equal(o.length, 3, 'todos');
  equal(textoOpcionPunto(o[0]), 'Punto 1 · compartido con Ocio G1', 'texto');
  equal(String(avisoCompartirPunto(o[1])).includes('Baby G2'), true, 'aviso dice con quién');
});

test('puntos: el que ya comparte sigue viendo su punto', () => {
  const o = opcionesPuntoEncuentro(puntos, 'yo', [g('a', 'Ocio G1', '1')], '1');
  equal(o.map((x) => x.punto).join(','), '1,2,3', 'el suyo + libres');
});
