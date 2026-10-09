import {
  aplicarEntrenadoresFijosOcio,
  getOcioFixedTrainerNotices,
  OCIO_FIXED_TRAINER_RPC,
  ocioFixedTrainerNotice,
  ocioFixedTrainerPairs,
  ocioFixedTrainerPairsToApply,
  type OcioFixedTrainerResult,
} from '../../src/features/ocio/ocioFixedTrainer';

function equal<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: esperado ${e}, recibido ${a}`);
}

async function test(name: string, run: () => void | Promise<void>) {
  await run();
  console.log(`OK  ${name}`);
}

async function main() {
  await test('sin aviso cuando se asigna, ya tiene entrenador o no hay fijo', () => {
    equal(ocioFixedTrainerNotice({ estado: 'ASIGNADO', entrenador_fijo: 'CARLOS' }), null, 'asignado');
    equal(ocioFixedTrainerNotice({ estado: 'YA_TIENE' }), null, 'ya tiene');
    equal(ocioFixedTrainerNotice({ estado: 'SIN_FIJO' }), null, 'sin fijo');
    equal(ocioFixedTrainerNotice(null), null, 'null');
  });

  await test('aviso de fijo no disponible con sustitutos propuestos', () => {
    equal(
      ocioFixedTrainerNotice({
        estado: 'NO_DISPONIBLE',
        entrenador_fijo: 'PEPE',
        respuesta: 'No puedo',
        sugeridos: ['ANA', 'MARTA'],
      }),
      'El fijo (PEPE) no está disponible esta semana (No puedo). Disponibles y libres: ANA, MARTA.',
      'no disponible'
    );
    equal(
      ocioFixedTrainerNotice({ estado: 'OCUPADO', entrenador_fijo: 'LUIS', sugeridos: [] }),
      'El fijo (LUIS) ya tiene otro grupo en ese turno. No hay otros entrenadores disponibles y libres en ese turno.',
      'ocupado'
    );
    equal(
      ocioFixedTrainerNotice({ estado: 'NO_ASIGNABLE', entrenador_fijo: 'MARTA', detalle: 'ya tiene asistencia real', sugeridos: ['ANA'] }),
      'No se pudo poner al fijo (MARTA): ya tiene asistencia real. Disponibles y libres: ANA.',
      'no asignable'
    );
  });

  await test('empareja grupos estables y semanales; los temporales no tienen fijo', () => {
    const groups = [
      { grupo_id: 'estable-1' },
      { weeklyGroupId: 'stable:estable-2', sourceGroupId: 'estable-2' },
      { weeklyGroupId: 'temporary:3', sourceGroupId: null },
    ];
    const results = [{ grupo_id: 'op-1' }, { grupo_id: 'op-2' }, { grupo_id: 'op-3' }];
    equal(
      ocioFixedTrainerPairs(groups, results),
      [
        { groupId: 'op-1', stableGroupId: 'estable-1' },
        { groupId: 'op-2', stableGroupId: 'estable-2' },
      ],
      'pares'
    );
    equal(ocioFixedTrainerPairs(groups, results.slice(0, 2)), [], 'longitudes distintas: no se arriesga');
  });

  await test('solo se llama a Supabase para grupos estables con fijo', () => {
    const groups = [{ grupo_id: 'estable-1' }, { grupo_id: 'estable-2' }];
    const results = [{ grupo_id: 'op-1' }, { grupo_id: 'op-2' }];
    equal(
      ocioFixedTrainerPairsToApply(groups, results, [
        { grupo_id: 'estable-1', entrenador_fijo_id: 'e1' },
        { grupo_id: 'estable-2', entrenador_fijo_id: null },
      ]),
      [{ groupId: 'op-1', stableGroupId: 'estable-1' }],
      'filtrado'
    );
    // Migración no aplicada: la vista no trae la columna.
    equal(ocioFixedTrainerPairsToApply(groups, results, [{ grupo_id: 'estable-1' }]), [], 'sin columna');
  });

  await test('aplicar no lanza aunque falle un grupo y guarda los avisos', async () => {
    const calls: Array<[string, Record<string, unknown>]> = [];
    const responses: Record<string, OcioFixedTrainerResult | Error> = {
      'op-1': { estado: 'ASIGNADO', entrenador_fijo: 'CARLOS' },
      'op-2': { estado: 'NO_DISPONIBLE', entrenador_fijo: 'PEPE', respuesta: 'No puedo', sugeridos: ['ANA'] },
      'op-3': new Error('red caída'),
    };
    const notices = await aplicarEntrenadoresFijosOcio(
      [{ grupo_id: 'e1' }, { grupo_id: 'e2' }, { grupo_id: 'e3' }],
      [{ grupo_id: 'op-1' }, { grupo_id: 'op-2' }, { grupo_id: 'op-3' }],
      async (rpc, params) => {
        calls.push([rpc, params]);
        const response = responses[String(params.p_grupo_id)];
        if (response instanceof Error) throw response;
        return response;
      },
      [
        { grupo_id: 'e1', entrenador_fijo_id: 'x' },
        { grupo_id: 'e2', entrenador_fijo_id: 'y' },
        { grupo_id: 'e3', entrenador_fijo_id: 'z' },
      ]
    );
    equal(calls.length, 3, 'llamadas');
    equal(calls[0], [OCIO_FIXED_TRAINER_RPC.apply, { p_grupo_id: 'op-1', p_grupo_ocio_id: 'e1' }], 'parámetros');
    equal(Object.keys(notices).sort(), ['op-2', 'op-3'], 'avisos');
    equal(notices['op-3'], 'No se pudo comprobar el entrenador fijo: red caída', 'error');
    equal(getOcioFixedTrainerNotices(), notices, 'estado compartido');
  });

  await test('al volver a volcar un grupo se sustituye su aviso anterior', async () => {
    const notices = await aplicarEntrenadoresFijosOcio(
      [{ grupo_id: 'e2' }],
      [{ grupo_id: 'op-2' }],
      async () => ({ estado: 'YA_TIENE' }),
      [{ grupo_id: 'e2', entrenador_fijo_id: 'y' }]
    );
    equal(Object.keys(notices), ['op-3'], 'aviso de op-2 retirado, op-3 se conserva');
  });
}

// Un rechazo sin capturar hace que Node termine con código 1 (falla la suite).
void main().catch((error) => {
  console.error(error);
  throw error;
});
