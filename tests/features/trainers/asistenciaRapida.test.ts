import { aplicarMarcasRecientes, marcarAsistenciaRapida } from '../../../src/features/trainers/asistenciaRapida';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
async function test(name: string, run: () => Promise<void>) { await run(); console.log(`OK  ${name}`); }

(async () => {
  await test('asistencia: cambia al momento y respeta la marca al refrescar', async () => {
    let visto = 'Pendiente';
    let errores = 0;
    await marcarAsistenciaRapida('g1', 'a1', 'Presente', {
      anterior: 'Pendiente', poner: (e) => { visto = e; }, guardar: async () => undefined, refrescar: () => undefined, avisarError: () => { errores++; },
    });
    equal(visto, 'Presente', 'botón al momento');
    equal(errores, 0, 'sin error');
    const filas = aplicarMarcasRecientes([{ grupo_id: 'g1', alumno_id: 'a1', estado_asistencia: 'Pendiente' }, { grupo_id: 'g1', alumno_id: 'a2', estado_asistencia: 'Ausente' }]);
    equal(filas[0].estado_asistencia, 'Presente', 'lectura vieja no pisa el toque');
    equal(filas[1].estado_asistencia, 'Ausente', 'otros niños igual');
    equal(aplicarMarcasRecientes([{ grupo_id: 'g1', alumno_id: 'a1', estado_asistencia: 'Pendiente' }], Date.now() + 60000)[0].estado_asistencia, 'Pendiente', 'pasado un rato manda la base de datos');
  });

  await test('asistencia: si falla el guardado vuelve a como estaba', async () => {
    let visto = 'Pendiente';
    let mensaje = '';
    await marcarAsistenciaRapida('g2', 'a9', 'Ausente', {
      anterior: 'Pendiente', poner: (e) => { visto = e; }, guardar: async () => { throw new Error('sin red'); }, refrescar: () => undefined, avisarError: (m) => { mensaje = m; },
    });
    equal(visto, 'Pendiente', 'revertido');
    equal(mensaje, 'sin red', 'error visible');
  });
  process.exit(0);
})().catch((e) => { console.error(e); process.exit(1); });
