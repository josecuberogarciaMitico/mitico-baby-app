import {
  decideSessionRosterImport,
  extractRosterNamesFromListText,
} from '../../../src/core/sessions/sessionImportPolicy';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

test('crea una sesión cuando no existe', () => {
  equal(decideSessionRosterImport(null, ['ANA TEST']).action, 'CREATE', 'acción');
});

test('una reimportación idéntica es idempotente', () => {
  const result = decideSessionRosterImport(
    {
      sessionId: 'session-test',
      groupCount: 2,
      publishedGroupCount: 1,
      studentsInGroups: 3,
      currentRosterNames: ['Álvaro Test', 'BEA TEST'],
    },
    ['ALVARO TEST', 'Bea Test']
  );
  equal(result.action, 'NO_CHANGE', 'acción');
});

test('bloquea una reimportación distinta si ya existen grupos', () => {
  const result = decideSessionRosterImport(
    {
      sessionId: 'session-test',
      groupCount: 1,
      publishedGroupCount: 0,
      studentsInGroups: 2,
      currentRosterNames: ['ANA TEST', 'BEA TEST'],
    },
    ['ANA TEST', 'CARLA TEST']
  );
  equal(result.action, 'BLOCK', 'acción');
  equal(result.additions[0], 'CARLA TEST', 'alta detectada');
  equal(result.removals[0], 'BEA TEST', 'baja detectada');
});

test('permite sustituir solo un borrador sin grupos', () => {
  const result = decideSessionRosterImport(
    {
      sessionId: 'session-test',
      groupCount: 0,
      publishedGroupCount: 0,
      studentsInGroups: 0,
      currentRosterNames: ['ANA TEST'],
    },
    ['ANA TEST', 'BEA TEST']
  );
  equal(result.action, 'REPLACE_DRAFT_ROSTER', 'acción');
});

test('nunca vacía una sesión por un listado vacío', () => {
  equal(
    decideSessionRosterImport(
      {
        sessionId: 'session-test',
        groupCount: 0,
        publishedGroupCount: 0,
        studentsInGroups: 0,
        currentRosterNames: ['ANA TEST'],
      },
      []
    ).action,
    'BLOCK',
    'acción'
  );
});

test('normaliza el listado sin convertir metadatos en alumnos', () => {
  const names = extractRosterNamesFromListText(
    'ANA TEST A+\nReserva el 01/01/2026\nBEA TEST\n600123123'
  );
  equal(names.join(','), 'ANA TEST,BEA TEST', 'nombres');
});

test('acepta el bloque copiado con imágenes e Invitado sin meter metadatos', () => {
  const names = extractRosterNamesFromListText(
    '**ANA TEST [Invitado]**\nReserva el **01/01/2026** a las **10:30**\n' +
      '[image](https://aimharder.com/Images/checkGreen.svg)**BEA TEST**\n' +
      'Última reserva: **31/12/2025**'
  );
  equal(names.join(','), 'ANA TEST,BEA TEST', 'nombres');
});
