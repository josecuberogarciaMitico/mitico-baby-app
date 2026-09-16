import {
  assessRosterRefresh,
  normalizeRosterName,
  planRosterCleanup,
  verifyRosterSnapshot,
} from '../../../src/core/sessions/rosterSync';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

const current = [
  { id: '1', name: 'ÁLVARO TEST' },
  { id: '2', name: 'BEA TEST' },
];

test('normaliza identidad sin confundir acentos o mayúsculas', () => {
  equal(normalizeRosterName(' Álvaro  Test '), 'ALVARO TEST', 'identidad');
});

test('bloquea una baja no acreditada antes de mutar la sesión', () => {
  const result = assessRosterRefresh(current, {
    activeNames: ['Álvaro Test'],
    cancelledNames: [],
    safeZero: false,
  });
  equal(result.status, 'BLOCKED', 'estado');
  equal(result.removals[0].name, 'BEA TEST', 'baja detectada');
});

test('permite una cancelación explícita y conserva las altas', () => {
  const result = assessRosterRefresh(current, {
    activeNames: ['Álvaro Test', 'CARLA TEST'],
    cancelledNames: ['Bea Test'],
    safeZero: false,
  });
  equal(result.status, 'SAFE', 'estado');
  equal(result.additions.join(','), 'CARLA TEST', 'alta');
  equal(result.removals[0].name, 'BEA TEST', 'baja');
});

test('bloquea cero activos si el origen no lo acredita', () => {
  equal(
    assessRosterRefresh(current, {
      activeNames: [],
      cancelledNames: [],
      safeZero: false,
    }).status,
    'BLOCKED',
    'cero inseguro'
  );
});

test('no limpia sobrantes si falta un activo tras la RPC', () => {
  const plan = planRosterCleanup(current, ['Álvaro Test', 'CARLA TEST'], []);
  equal(plan.status, 'BLOCKED', 'estado');
  equal(plan.missingActiveNames[0], 'CARLA TEST', 'activo ausente');
});

test('la verificación final admite solo activos y protegidos', () => {
  equal(
    verifyRosterSnapshot(current, ['Álvaro Test'], ['Bea Test']).matches,
    true,
    'protegido'
  );
  equal(
    verifyRosterSnapshot(current, ['Álvaro Test'], []).matches,
    false,
    'sobrante'
  );
});
