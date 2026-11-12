import { codigoNivel, grupoDeNino, grupoEquivalente, grupoRecomendado, gruposDelDia, idsColocados, nivelesDelGrupo, type FilaDiaGrupos } from '../../../src/features/intensivos/gruposFijosLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const f = (grupo: string, nombre: string, nivelGrupo: string, alumno: string, nivel: string, extra: Partial<FilaDiaGrupos> = {}): FilaDiaGrupos => ({
  grupo_id: grupo, nombre_grupo: nombre, nivel_grupo: nivelGrupo, pista: 'Grande', alumno_id: alumno, alumno, nivel_resumen: nivel, ...extra,
});

// Día 2 real del INTENSIVO NOV DOMINGOS (formato de nivel_grupo de la BD).
const dia2 = gruposDelDia([
  f('g1', 'Grupo 1 · Nivel A+', 'A / A+', 'ANA', 'A+', { publicado: true }),
  f('g2', 'Grupo 2 · Nivel B / B+', 'B / B+', 'BEA', 'B+'),
  f('g2', 'Grupo 2 · Nivel B / B+', 'B / B+', 'BRUNO', 'B'),
  f('g3', 'Grupo 3 · Nivel B / B+', 'B', 'BORJA', 'B'),
  f('g4', 'Grupo 4 · Nivel C / D', 'C / C+', 'CARLA', 'C'),
]);

test('niveles: códigos y grupos', () => {
  equal(codigoNivel('Iniciación'), 'INICIACION', 'iniciación');
  equal(codigoNivel('b+'), 'B+', 'b+');
  equal(codigoNivel('raro'), '', 'desconocido');
  equal(nivelesDelGrupo('B / B+ / C').join(','), 'B,B+,C', 'niveles del grupo');
});

test('gruposDelDia: agrupa, ordena y marca publicado', () => {
  equal(dia2.length, 4, 'cuatro grupos');
  equal(dia2[0].publicado, true, 'publicado');
  equal(dia2[1].alumnos.length, 2, 'dos niños en grupo 2');
  equal(idsColocados(dia2).size, 5, 'colocados');
});

test('recomendado: un B+ va al grupo que cubre B+, no al de solo B', () => {
  equal(grupoRecomendado('B+', dia2)?.grupo_id, 'g2', 'B+ → g2');
  equal(grupoRecomendado('B', dia2)?.grupo_id, 'g3', 'B → el B con menos niños');
  equal(grupoRecomendado('D', dia2)?.grupo_id, 'g4', 'D → el más cercano');
  equal(grupoRecomendado('B', []), null, 'sin grupos');
});

test('equivalente: mismo nombre en otro día; si no existe, por nivel', () => {
  const dia3 = gruposDelDia([f('h2', 'Grupo 2 · Nivel B / B+', 'B / B+', 'BEA', 'B+'), f('h9', 'Otro', 'C', 'CARLA', 'C')]);
  equal(grupoEquivalente('grupo 2 · nivel b / b+', 'B+', dia3)?.grupo_id, 'h2', 'por nombre');
  equal(grupoEquivalente('Grupo 4 · Nivel C / D', 'C', dia3)?.grupo_id, 'h9', 'por nivel');
  equal(grupoDeNino('CARLA', dia3)?.grupo_id, 'h9', 'grupo del niño');
  equal(grupoDeNino('NADIE', dia3), null, 'no está');
});
