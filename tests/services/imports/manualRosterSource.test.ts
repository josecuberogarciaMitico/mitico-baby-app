import {
  armManualBabyRoster,
  installManualBabyFetchAdapter,
  parseManualBabyDateFromText,
  parseManualBabyTimesFromText,
  stageManualBabyRoster,
} from '../../../src/services/imports/manualRosterSource';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}


function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

test('resuelve fecha Baby desde el contenedor del día', () => {
  equal(
    parseManualBabyDateFromText('domingo · 20/09/2026'),
    '2026-09-20',
    'fecha española'
  );
  equal(
    parseManualBabyDateFromText('sesión 2026-09-20'),
    '2026-09-20',
    'fecha ISO'
  );
});

test('resuelve horario Baby desde la tarjeta de sesión', () => {
  const times = parseManualBabyTimesFromText('12:00 - 14:00 · Publicado');
  equal(times.start, '12:00', 'hora inicio');
  equal(times.end, '14:00', 'hora fin');
});

function testAsync(name: string, run: () => Promise<void>) {
  return run().then(() => console.log(`OK  ${name}`));
}

void testAsync('Baby manual solo sustituye el lector cuando el volcado está armado', async () => {
  const data = new Map<string, string>();
  const storage = {
    getItem(key: string) {
      return data.has(key) ? data.get(key)! : null;
    },
    setItem(key: string, value: string) {
      data.set(key, String(value));
    },
    removeItem(key: string) {
      data.delete(key);
    },
    clear() {
      data.clear();
    },
    key(index: number) {
      return Array.from(data.keys())[index] ?? null;
    },
    get length() {
      return data.size;
    },
  };

  let externalCalls = 0;
  const externalFetch = async () => {
    externalCalls += 1;
    return new Response(JSON.stringify({ external: true }), { status: 200 });
  };

  (globalThis as any).window = {
    sessionStorage: storage,
    fetch: externalFetch,
  };

  installManualBabyFetchAdapter();
  stageManualBabyRoster({
    date: '2026-09-20',
    start: '09:45',
    end: '11:45',
    rawText: '**ANA TEST [Invitado]**\n**BEA TEST**',
  });

  const endpoint =
    'https://example.supabase.co/functions/v1/mitico-aimharder-baby-read';
  const call = (action: string, extra: Record<string, unknown> = {}) =>
    (globalThis as any).window.fetch(endpoint, {
      method: 'POST',
      body: JSON.stringify({ action, ...extra }),
    }) as Promise<Response>;

  await call('boxes');
  equal(externalCalls, 1, 'sin armar mantiene la consulta automática');

  equal(armManualBabyRoster(), true, 'listado manual armado');
  const boxes = (await (await call('boxes')).json()) as any;
  equal(boxes.boxes[0].boid, -99001, 'centro local');

  const week = (await (
    await call('week', { weekStart: '2026-09-14' })
  ).json()) as any;
  equal(week.classes.length, 1, 'turno local');

  const attendees = (await (
    await call('attendees', { date: '2026-09-20' })
  ).json()) as any;
  equal(attendees.total, 2, 'alumnos locales');
  equal(attendees.attendees[0].guest, true, 'invitado conservado');
  equal(externalCalls, 1, 'cero llamadas AimHarder en el flujo manual');

  await call('boxes');
  equal(externalCalls, 2, 'tras consumir vuelve al lector automático');
});
