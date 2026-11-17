import { enviarDisponibilidadCompleta, estadoEnvio, limpiarBorrador } from '../../../src/features/trainers/disponibilidadEnvio';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
async function test(name: string, run: () => void | Promise<void>) { await run(); console.log(`OK  ${name}`); }

const turnos = [
  { id: 't1', respuesta: 'Pendiente' },
  { id: 't2', respuesta: null },
  { id: 't3', respuesta: 'Disponible' },
];

(async () => {
  await test('disponibilidad: no se puede enviar hasta responder todos los pendientes', () => {
    const e0 = estadoEnvio(turnos, {});
    equal(e0.pendientes, 2, 'dos pendientes (vacío cuenta como pendiente)');
    equal(e0.faltan, 2, 'faltan dos');
    equal(e0.listo, false, 'no se puede enviar');
    const e1 = estadoEnvio(turnos, { t1: 'Disponible' });
    equal(e1.faltan, 1, 'falta uno');
    equal(e1.listo, false, 'todavía no');
    const e2 = estadoEnvio(turnos, { t1: 'Disponible', t2: 'No puedo', t3: 'No puedo' });
    equal(e2.listo, true, 'ya se puede enviar');
    equal(e2.puedo, 1, 'puedo');
    equal(e2.noPuedo, 1, 'no puedo (lo ya enviado no cuenta)');
    equal(estadoEnvio([{ id: 'x', respuesta: 'Disponible' }], {}).listo, false, 'sin pendientes no hay nada que enviar');
  });

  await test('disponibilidad: el borrador olvida lo ya enviado', () => {
    const b = limpiarBorrador(turnos, { t1: 'Disponible', t3: 'No puedo', viejo: 'Disponible' });
    equal(Object.keys(b).join(','), 't1', 'solo queda lo pendiente');
  });

  await test('disponibilidad: envío en orden y se para si falla', async () => {
    const hechos: string[] = [];
    const ok = await enviarDisponibilidadCompleta(
      [{ turno: turnos[0], respuesta: 'Disponible' }, { turno: turnos[1], respuesta: 'No puedo' }],
      async (t, r) => { hechos.push(`${t.id}:${r}`); }
    );
    equal(ok.ok, true, 'todo bien');
    equal(hechos.join(' '), 't1:Disponible t2:No puedo', 'en orden');
    const mal = await enviarDisponibilidadCompleta(
      [{ turno: turnos[0], respuesta: 'Disponible' }, { turno: turnos[1], respuesta: 'No puedo' }],
      async (t) => { if (t.id === 't2') throw new Error('Sin conexión'); }
    );
    equal(mal.ok, false, 'falla');
    equal(mal.guardadas.join(','), 't1', 'la primera sí se guardó');
    equal(mal.error, 'Sin conexión', 'mensaje');
  });
})().catch((e) => { console.error(e); process.exit(1); });
