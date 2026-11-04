import { describeClosingSession, describeFailedGroups, planWeekClosing } from '../../../src/features/agenda/agendaWeekClosing';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const sesiones = [
  { sesion_id: 's-dom', fecha: '2026-11-08', hora_inicio: '09:45:00', modalidad: 'Baby' },
  { sesion_id: 's-sab', fecha: '2026-11-07', hora_inicio: '12:00:00', modalidad: 'Ocio' },
];
const g = (id: string, sesion: string, nombre: string, punto: string | null) => ({
  grupo_id: id, sesion_id: sesion, nombre_grupo: nombre, publicado: false, entrenador_id: 'e', punto_encuentro: punto,
});

test('cierre: cada grupo sin terminar dice día, hora y modalidad, en orden', () => {
  const plan = planWeekClosing([g('1', 's-dom', 'Grupo 4 · Nivel B', null), g('2', 's-sab', 'Grupo 1 · Nivel A', null)]);
  const lineas = describeFailedGroups(plan.notReady, sesiones);
  equal(lineas.length, 2, 'dos grupos');
  equal(lineas[0], '• Ocio · Sáb 07/11 · 12:00 — Grupo 1 · Nivel A: sin punto de encuentro', 'sábado primero');
  equal(lineas[1], '• Baby · Dom 08/11 · 09:45 — Grupo 4 · Nivel B: sin punto de encuentro', 'domingo después');
});

test('cierre: sin datos de sesión queda como antes', () => {
  equal(describeFailedGroups([{ group: g('3', 'x', 'Grupo 2', null), reason: 'sin entrenador' }], [])[0], '• Grupo 2: sin entrenador', 'solo nombre');
  equal(describeClosingSession({ sesion_id: 'a', fecha: '2026-11-04', hora_inicio: '18:00', modalidad: null }), 'Mié 04/11 · 18:00', 'sin modalidad');
});
