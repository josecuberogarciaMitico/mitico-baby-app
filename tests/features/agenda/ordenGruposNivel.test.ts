import { ordenarGruposPorNivel } from '../../../src/features/agenda/ordenGruposNivel';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('orden de grupos: de Iniciación (pequeña) a D (grande), sin mirar el número de niños', () => {
  const grupos = [
    { grupo_id: 'g1', nombre_grupo: 'Grupo 1 · Nivel B+', nivel_grupo: 'B+', pista: 'Grande' },
    { grupo_id: 'g2', nombre_grupo: 'Grupo 2 · Nivel INICIACIÓN / A', nivel_grupo: 'INICIACION / A', pista: 'Pequeña' },
    { grupo_id: 'g3', nombre_grupo: 'Grupo 3 · Nivel A+', nivel_grupo: 'A+', pista: 'Grande' },
    { grupo_id: 'g4', nombre_grupo: 'Grupo 4 · Nivel B / B+', nivel_grupo: 'B / B+', pista: 'Grande' },
    { grupo_id: 'g5', nombre_grupo: 'Grupo 5 · Nivel C / C+ / D', nivel_grupo: 'C / C+ / D', pista: 'Grande' },
    { grupo_id: 'gp', nombre_grupo: 'Particular · Ana', nivel_grupo: 'INICIACION', pista: 'Pequeña' },
    { grupo_id: 'g6', nombre_grupo: 'Grupo 6 · Nivel INICIACIÓN', nivel_grupo: 'INICIACIÓN', pista: 'Pequeña' },
  ];
  const orden = ordenarGruposPorNivel(grupos).map((g) => g.grupo_id).join(',');
  equal(orden, 'g6,g2,g3,g4,g1,g5,gp', 'orden');
  equal(grupos[0].grupo_id, 'g1', 'no cambia el original');
  equal(ordenarGruposPorNivel(null).length, 0, 'vacío');
});
