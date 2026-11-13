import { agruparPorSemana, lunesDe, semanasDeTemporada } from '../../../src/features/reports/snowZoneSemanas';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('snowzone: lunes de la semana de entreno', () => {
  equal(lunesDe('2026-11-15'), '2026-11-09', 'domingo → lunes anterior');
  equal(lunesDe('2026-11-09'), '2026-11-09', 'lunes');
  equal(lunesDe('2026-11-01'), '2026-10-26', '1 de noviembre es de la semana 26/10');
});

test('snowzone: semanas de la temporada, la actual marcada', () => {
  const s = semanasDeTemporada('2026-11-13');
  equal(s[0].inicio, '2026-11-16', 'primera = la próxima');
  equal(s[0].futura, true, 'próxima');
  equal(s[1].inicio, '2026-11-09', 'en curso');
  equal(s[1].etiqueta, 'Semana 09/11 – 15/11 (en curso)', 'etiqueta');
  equal(s[s.length - 1].inicio, '2026-08-31', 'empieza en la semana del 1/9');
  equal(semanasDeTemporada('2027-02-10').at(-1)?.inicio, '2026-08-31', 'en febrero sigue la temporada de septiembre');
});

test('snowzone: mensual agrupado por semanas de entreno', () => {
  const g = agruparPorSemana([
    { fecha: '2026-11-08', pista_pequena: 29, pista_grande: 22, total: 51 },
    { fecha: '2026-11-01', pista_pequena: 5, pista_grande: 12, total: 17 },
    { fecha: '2026-11-04', pista_pequena: 3, pista_grande: 0, total: 3 },
    { fecha: '2026-11-11', pista_pequena: 5, pista_grande: 0, total: 5 },
  ]);
  equal(g.length, 3, 'tres semanas');
  equal(g[0].inicio, '2026-10-26', 'el 1/11 va con su semana');
  equal(g[1].total, 54, 'subtotal semana 02/11');
  equal(g[1].filas[0].fecha, '2026-11-04', 'filas ordenadas');
});
