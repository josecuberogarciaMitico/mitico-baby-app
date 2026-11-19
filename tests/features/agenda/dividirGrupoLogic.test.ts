import { avisoRatioGrupoBaby, nivelesDe } from '../../../src/features/agenda/dividirGrupoLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('dividir: nombre con los niveles reales', () => {
  equal(nivelesDe(['B+', 'B+']), 'B+', 'solo B+');
  equal(nivelesDe(['A', 'INICIACION', null]), 'INICIACIÓN / A', 'ordenado y con tilde');
});

test('ratio: aviso en vez de bloqueo (misma regla que Supabase)', () => {
  const base = { nombre_grupo: 'Grupo 3 · Nivel INICIACIÓN', nivel_grupo: 'INICIACION', pista: 'Pista pequeña', entrenador_id: 'e1' };
  equal(avisoRatioGrupoBaby({ ...base, total_alumnos: 4 }), null, '4 en iniciación con 1 entrenador: bien');
  equal(Boolean(avisoRatioGrupoBaby({ ...base, total_alumnos: 5 })?.includes('falta 2.º entrenador')), true, '5 sin apoyo');
  equal(avisoRatioGrupoBaby({ ...base, total_alumnos: 5, entrenador_apoyo_id: 'e2' }), null, '5 con apoyo: bien');
  equal(Boolean(avisoRatioGrupoBaby({ ...base, total_alumnos: 1 })), true, 'grupo de 1');
  equal(avisoRatioGrupoBaby({ ...base, nombre_grupo: 'PARTICULAR · MILI', total_alumnos: 1 }), null, 'particular de 1: bien');
  equal(avisoRatioGrupoBaby({ nombre_grupo: 'Grupo 6 · Nivel B', nivel_grupo: 'B', pista: 'Pista grande', entrenador_id: 'e1', total_alumnos: 7 }), null, '7 en grande: bien');
  equal(Boolean(avisoRatioGrupoBaby({ nombre_grupo: 'Grupo 6 · Nivel B', nivel_grupo: 'B', pista: 'Pista grande', entrenador_id: 'e1', total_alumnos: 8 })), true, '8: dividir');
  equal(Boolean(avisoRatioGrupoBaby({ nombre_grupo: 'G', nivel_grupo: 'A', pista: 'Pista grande', entrenador_id: 'e1', total_alumnos: 5 })), true, 'solo A cuenta como bajo');
});
