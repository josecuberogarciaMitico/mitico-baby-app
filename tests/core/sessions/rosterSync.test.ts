import {
  assessRosterRefresh,
  findListImportIdentityConflicts,
  isRosterNameSafeForListImport,
  normalizeNameLikeListImport,
  normalizeRosterName,
  planAddOnlyRosterRefresh,
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

// Caso real 17/10/2026 (Baby sábado 09:45): la sesión ya tenía grupos con
// Roi, Guillermo, Jaime, Jorge y Manuel. AimHarder trae a Candela y Miguel
// (lista de espera) y ya no trae a Jorge ni a Manuel.
const sesionSabado = [
  { id: 's1', name: 'ROI BECERRA SANCHEZ' },
  { id: 's2', name: 'GUILLERMO BECERRA MARTIN' },
  { id: 's3', name: 'JAIME REY COEGO' },
  { id: 's4', name: 'JORGE BARQUILLA SUAREZ' },
  { id: 's5', name: 'MANUEL DOMINGUEZ TAPIA' },
];
const lecturaSabado = [
  'CANDELA FERNANDEZ CAVADA GARCIA',
  'GUILLERMO BECERRA MARTIN',
  'JAIME REY COEGO',
  'MIGUEL FERNANDEZ CAVADA GARCIA',
  'ROI BECERRA SANCHEZ',
];

test('solo añadir: el candado sigue bloqueando el refresco completo', () => {
  const result = assessRosterRefresh(sesionSabado, {
    activeNames: lecturaSabado,
    cancelledNames: [],
    safeZero: false,
  });
  equal(result.status, 'BLOCKED', 'candado');
});

test('solo añadir: añade a los nuevos sin quitar a nadie', () => {
  const plan = planAddOnlyRosterRefresh(sesionSabado, {
    activeNames: lecturaSabado,
    cancelledNames: [],
    safeZero: false,
  });
  equal(plan.status, 'ADD', 'estado');
  equal(plan.additions.join('|'), 'CANDELA FERNANDEZ CAVADA GARCIA|MIGUEL FERNANDEZ CAVADA GARCIA', 'nuevos');
  equal(plan.kept.length, 5, 'se quedan todos');
  equal(plan.keptMissing.map((m) => m.name).join('|'), 'JORGE BARQUILLA SUAREZ|MANUEL DOMINGUEZ TAPIA', 'no salen pero se quedan');
  equal(plan.cancelledRemovals.length, 0, 'nadie sale');
  equal(plan.mergedRosterNames.length, 7, 'listado a volcar');
  equal(plan.mergedRosterNames.slice(0, 5).join('|'), sesionSabado.map((m) => m.name).join('|'), 'primero los que ya estaban');
});

test('solo añadir: con un listado pegado de solo 2 niños también funciona', () => {
  const plan = planAddOnlyRosterRefresh(sesionSabado, {
    activeNames: ['Candela Fernandez Cavada Garcia', 'Miguel Fernández Cavada García'],
    cancelledNames: [],
    safeZero: false,
  });
  equal(plan.status, 'ADD', 'estado');
  equal(plan.additions.length, 2, 'nuevos');
  equal(plan.kept.length, 5, 'nadie sale');
});

test('solo añadir: solo sale quien AimHarder marca como cancelado', () => {
  const plan = planAddOnlyRosterRefresh(sesionSabado, {
    activeNames: lecturaSabado,
    cancelledNames: ['Jorge Barquilla Suarez'],
    safeZero: false,
  });
  equal(plan.cancelledRemovals.map((m) => m.name).join('|'), 'JORGE BARQUILLA SUAREZ', 'cancelado');
  equal(plan.kept.length, 4, 'resto se queda');
  equal(plan.mergedRosterNames.includes('JORGE BARQUILLA SUAREZ'), false, 'cancelado fuera del volcado');
  equal(plan.mergedRosterNames.includes('MANUEL DOMINGUEZ TAPIA'), true, 'no cancelado se queda');
});

test('solo añadir: sin nuevos no hace nada', () => {
  const plan = planAddOnlyRosterRefresh(sesionSabado, {
    activeNames: ['ROI BECERRA SANCHEZ'],
    cancelledNames: [],
    safeZero: false,
  });
  equal(plan.status, 'NOTHING_TO_ADD', 'estado');
});

test('solo añadir: sigue bloqueando duplicados y lecturas vacías', () => {
  equal(
    planAddOnlyRosterRefresh(sesionSabado, {
      activeNames: ['ANA MUÑOZ', 'Ana Munoz'],
      cancelledNames: [],
      safeZero: false,
    }).status,
    'BLOCKED',
    'duplicados'
  );
  equal(
    planAddOnlyRosterRefresh(sesionSabado, { activeNames: [], cancelledNames: [], safeZero: false }).status,
    'BLOCKED',
    'vacía'
  );
});

test('solo añadir: bloquea si un nombre guardado no se puede re-leer', () => {
  const plan = planAddOnlyRosterRefresh([...sesionSabado, { id: 's6', name: 'PEPE' }], {
    activeNames: lecturaSabado,
    cancelledNames: [],
    safeZero: false,
  });
  equal(plan.status, 'BLOCKED', 'nombre corto');
});

test('nombres que el volcado SQL no leería igual', () => {
  equal(isRosterNameSafeForListImport('MIGUEL FERNANDEZ CAVADA GARCIA'), true, 'normal');
  equal(isRosterNameSafeForListImport('IÑIGO ARAMENDI CASARES'), true, 'eñe');
  equal(isRosterNameSafeForListImport('PEPE'), false, 'una palabra');
  equal(isRosterNameSafeForListImport('JUAN PEREZ B'), false, 'acaba en nivel');
  equal(isRosterNameSafeForListImport('LUIS GARCIA A+'), false, 'acaba en nivel +');
  equal(isRosterNameSafeForListImport('PAGOLA MARTIN'), false, 'empieza como metadato');
  equal(isRosterNameSafeForListImport('ANA 2 GARCIA'), false, 'número');
});

test('normaliza igual que normalizar_nombre_app', () => {
  equal(normalizeNameLikeListImport('  Íñigo   Aramendi  '), 'INIGO ARAMENDI', 'acentos y espacios');
});

test('detecta fichas que el volcado resolvería a otro alumno', () => {
  const fichas = [
    { alumno_id: 'a1', nombre_normalizado: 'ROI BECERRA SANCHEZ', activo: true },
    { alumno_id: 'm1', nombre_normalizado: 'MIGUEL FERNANDEZ CAVADA GARCIA', activo: true },
    { alumno_id: 'm0', nombre_normalizado: 'MIGUEL FERNANDEZ CAVADA GARCIA', activo: false },
    { alumno_id: 'x1', nombre_normalizado: 'CRISTINA SALAZAR MORENO', activo: true },
    { alumno_id: 'x2', nombre_normalizado: 'CRISTINA SALAZAR MORENO', activo: true },
    { alumno_id: 'p1', nombre_normalizado: 'PEDRO VIEJO TEST', activo: false },
  ];
  const conflictos = findListImportIdentityConflicts(
    [
      { alumnoId: 'a1', name: 'Roi Becerra Sánchez' },
      { alumnoId: 'm1', name: 'MIGUEL FERNANDEZ CAVADA GARCIA' },
      { alumnoId: 'x1', name: 'CRISTINA SALAZAR MORENO' },
      { alumnoId: 'p1', name: 'PEDRO VIEJO TEST' },
      { alumnoId: 'zz', name: 'SIN FICHA TEST' },
    ],
    fichas
  );
  equal(conflictos.join('|'), 'CRISTINA SALAZAR MORENO|SIN FICHA TEST', 'conflictos');
});
