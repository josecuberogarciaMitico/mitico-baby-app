import {
  intensivosRecientes,
  marcarIntensivosCargados,
  olvidarCargaIntensivos,
} from '../../../src/features/intensivos/cargaIntensivosReciente';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('intensivos: sin carga previa hay que pedirlos; tras cargar, 2 minutos sin repetir', () => {
  olvidarCargaIntensivos();
  equal(intensivosRecientes(1_000_000), false, 'sin carga');
  marcarIntensivosCargados(1_000_000);
  equal(intensivosRecientes(1_000_000 + 60_000), true, 'al minuto');
  equal(intensivosRecientes(1_000_000 + 119_999), true, 'justo antes de 2 min');
  equal(intensivosRecientes(1_000_000 + 120_000), false, 'a los 2 min');
  olvidarCargaIntensivos();
  equal(intensivosRecientes(1_000_000 + 1), false, 'olvidado');
});
