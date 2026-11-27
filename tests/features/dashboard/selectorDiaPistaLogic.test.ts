import { diaAlCambiarSemana, diasEntrenoSemana, etiquetaSemana, lunesDe } from '../../../src/features/dashboard/selectorDiaPistaLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('trabajo en pista: semana de miércoles a domingo y salto de semana', () => {
  equal(lunesDe('2026-11-08'), '2026-11-02', 'domingo → su lunes');
  const dias = diasEntrenoSemana('2026-11-06');
  equal(dias.map((d) => `${d.nombre}${d.dia}`).join(','), 'Mié4,Jue5,Vie6,Sáb7,Dom8', 'días');
  equal(etiquetaSemana('2026-11-06'), '02/11 – 08/11', 'etiqueta');
  equal(diaAlCambiarSemana('2026-11-09', { '2026-11-13': 1, '2026-11-14': 2 }), '2026-11-13', 'primer día con sesiones');
  equal(diaAlCambiarSemana('2026-11-09', {}), '2026-11-11', 'sin sesiones → miércoles');
});

test('trabajo en pista: lunes y martes solo si ese día hay sesiones (puentes)', () => {
  const normal = diasEntrenoSemana('2026-12-09', { '2026-12-09': 1 });
  equal(normal.map((d) => d.nombre).join(','), 'Mié,Jue,Vie,Sáb,Dom', 'semana normal igual');
  const puente = diasEntrenoSemana('2026-12-09', { '2026-12-07': 1, '2026-12-08': 1 });
  equal(puente.map((d) => `${d.nombre}${d.dia}`).join(','), 'Lun7,Mar8,Mié9,Jue10,Vie11,Sáb12,Dom13', 'con intensivo lunes y martes');
  equal(diaAlCambiarSemana('2026-12-07', { '2026-12-07': 2 }), '2026-12-07', 'salta al lunes con sesiones');
});
