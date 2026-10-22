import {
  chipPorDefectoEntrenador,
  chipsDiasEntrenador,
  claveChipDiaEntrenador,
  tituloDiaCortoEntrenador,
} from '../../../src/features/trainers/trainerDayNav';

function equal<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: esperado ${e}, recibido ${a}`);
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

type G = { id: string; fecha: string; pendiente: boolean };
const g = (id: string, fecha: string, pendiente = false): G => ({ id, fecha, pendiente });

const semanas = [
  { inicio: '2026-10-12', grupos: [g('old', '2026-10-18', true)] },
  {
    inicio: '2026-10-19',
    grupos: [
      g('sab1', '2026-10-24'),
      g('vie', '2026-10-23', true),
      g('sab2', '2026-10-24', true),
      g('dom', '2026-10-25'),
    ],
  },
];
const chips = chipsDiasEntrenador(semanas, '2026-10-19', (grupo) => grupo.pendiente);

test('semana anterior primero y luego un botón por día en orden', () => {
  equal(
    chips.map((chip) => chip.clave),
    ['semana:2026-10-12', 'dia:2026-10-23', 'dia:2026-10-24', 'dia:2026-10-25'],
    'claves'
  );
  equal(chips[0].titulo, 'Semana anterior', 'título semana anterior');
  equal(chips[0].detalle, '1 pendiente', 'detalle semana anterior');
  equal(chips[2].detalle, '2 grupos', 'sábado con 2 grupos');
  equal(chips[2].pendientes, 1, 'sábado con 1 pendiente');
  equal(chips[3].pendientes, 0, 'domingo sin pendientes');
});

test('títulos cortos del día', () => {
  equal(tituloDiaCortoEntrenador('2026-10-23'), 'Vie 23', 'viernes');
  equal(tituloDiaCortoEntrenador('2026-10-25'), 'Dom 25', 'domingo');
});

test('día por defecto: hoy, si no el primero con pendientes, si no el primero', () => {
  equal(chipPorDefectoEntrenador(chips, '2026-10-25'), 'dia:2026-10-25', 'hoy domingo');
  equal(chipPorDefectoEntrenador(chips, '2026-10-22'), 'dia:2026-10-23', 'primer día con pendientes');
  const sinPendientes = chipsDiasEntrenador(
    [{ inicio: '2026-10-19', grupos: [g('a', '2026-10-24'), g('b', '2026-10-25')] }],
    '2026-10-19',
    (grupo) => grupo.pendiente
  );
  equal(chipPorDefectoEntrenador(sinPendientes, '2026-10-22'), 'dia:2026-10-24', 'primer día');
  equal(chipPorDefectoEntrenador([], '2026-10-22'), '', 'sin grupos');
});

test('la clave de un grupo coincide con la de su botón (salto desde tareas)', () => {
  equal(claveChipDiaEntrenador('2026-10-19', '2026-10-19', '2026-10-24'), 'dia:2026-10-24', 'semana actual');
  equal(claveChipDiaEntrenador('2026-10-12', '2026-10-19', '2026-10-18'), 'semana:2026-10-12', 'semana anterior');
});

test('varias semanas anteriores se distinguen por fecha', () => {
  const varias = chipsDiasEntrenador(
    [
      { inicio: '2026-10-05', grupos: [g('x', '2026-10-10', true)] },
      { inicio: '2026-10-12', grupos: [g('y', '2026-10-17', true)] },
      { inicio: '2026-10-19', grupos: [g('z', '2026-10-23')] },
    ],
    '2026-10-19',
    (grupo) => grupo.pendiente
  );
  equal(varias.map((chip) => chip.titulo), ['Semana 05/10', 'Semana 12/10', 'Vie 23'], 'títulos');
});
