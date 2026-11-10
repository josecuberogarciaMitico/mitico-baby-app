import { composicionDesdeFilas, copiarComposicionADia, diaEditable, mismaComposicion, type FilaGrupoDia } from '../../../src/features/intensivos/copiarComposicionDias';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
async function test(name: string, run: () => Promise<void> | void) { await run(); console.log(`OK  ${name}`); }

const fila = (grupo: string, nombre: string, alumno: string, extra: Partial<FilaGrupoDia> = {}): FilaGrupoDia => ({
  grupo_id: grupo, nombre_grupo: nombre, nivel_grupo: 'A', pista: 'PISTA PEQUEÑA', trabajo_diario: 'TD', observaciones_importantes: 'OBS', alumno_id: alumno, ...extra,
});

(async () => {
  await test('intensivos: composición por grupo y comparación', () => {
    const c = composicionDesdeFilas([fila('g2', 'Grupo 2', 'b'), fila('g1', 'Grupo 1', 'a'), fila('g1', 'Grupo 1', 'c'), fila('g1', 'Grupo 1', 'a')]);
    equal(c.length, 2, 'dos grupos');
    equal(c[0].nombre_grupo, 'Grupo 1', 'orden por nombre');
    equal(c[0].alumnos_ids.join(), 'a,c', 'sin repetir niños');
    equal(mismaComposicion(c, composicionDesdeFilas([fila('x', 'Grupo 1', 'c'), fila('x', 'Grupo 1', 'a'), fila('y', 'Grupo 2', 'b')])), true, 'misma');
    equal(mismaComposicion(c, composicionDesdeFilas([fila('x', 'Grupo 1', 'a'), fila('y', 'Grupo 2', 'b'), fila('y', 'Grupo 2', 'c')])), false, 'distinta');
    equal(diaEditable([fila('g', 'G', 'a', { publicado: true })]), false, 'publicado no se toca');
    equal(diaEditable([fila('g', 'G', 'a', { entrenador_id: 'e' })]), false, 'con entrenador no se toca');
    equal(diaEditable([]), true, 'vacío sí');
  });

  await test('intensivos: copiar sustituye y, si falla, restaura', async () => {
    const origen = composicionDesdeFilas([fila('o1', 'Grupo 1', 'a'), fila('o2', 'Grupo 2', 'b')]);
    const log: string[] = [];
    await copiarComposicionADia('d3', origen, {
      leerDia: async () => [fila('v1', 'Viejo', 'z')],
      borrarGrupo: async (id) => { log.push(`borra ${id}`); },
      crearGrupo: async (_d, g) => { log.push(`crea ${g.nombre_grupo} ${g.alumnos_ids.join()} obs=${g.observaciones_importantes}`); return `n${log.length}`; },
    });
    equal(log.join(' | '), 'borra v1 | crea Grupo 1 a obs= | crea Grupo 2 b obs=', 'sustituye');

    const log2: string[] = [];
    let fallo = '';
    try {
      await copiarComposicionADia('d3', origen, {
        leerDia: async () => [fila('v1', 'Viejo', 'z')],
        borrarGrupo: async (id) => { log2.push(`borra ${id}`); },
        crearGrupo: async (_d, g) => { if (g.nombre_grupo === 'Grupo 2') throw new Error('x'); log2.push(`crea ${g.nombre_grupo}`); return g.nombre_grupo === 'Grupo 1' ? 'n1' : 'r1'; },
      });
    } catch (e) { fallo = String((e as Error).message); }
    equal(fallo, 'x', 'propaga el error');
    equal(log2.join(' | '), 'borra v1 | crea Grupo 1 | borra n1 | crea Viejo', 'restaura lo que había');
  });
})().catch((e) => { console.error(e); process.exit(1); });
