import {
  cambio,
  comoVamos,
  crecimientoTemporada,
  mesesConActividad,
  resumenProgresiones,
  type MesAnalisis,
} from '../../../src/features/analysis/analysisSummary';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const mes = (m: string, alumnos: number, extra: Partial<MesAnalisis> = {}): MesAnalisis => ({
  mes: m, alumnos_unicos: alumnos, altas: 0, asistencia_real_pct: 90, ocupacion_pct: 50,
  promedio_por_grupo: 3, sesiones_realizadas: alumnos ? 5 : 0, evolucion_tecnica: 0, ...extra,
});
const mensual = [mes('2026-09', 32, { altas: 44 }), mes('2026-10', 74, { en_curso: true }), mes('2026-11', 0), mes('2026-12', 0)];

test('solo meses con actividad y nunca futuros', () => {
  const xs = mesesConActividad([...mensual, mes('2026-11', 3)], '2026-10-27');
  equal(xs.length, 2, 'dos meses');
  equal(xs[1].mes, '2026-10', 'octubre el último');
});

test('cambios con flecha correcta', () => {
  equal(cambio(74, 32, 'cantidad').texto, '+42 (+131 %)', 'cantidad');
  equal(cambio(74, 32, 'cantidad').sentido, 'sube', 'sube');
  equal(cambio(91.5, 93.4, 'puntos').texto, '−2 pts', 'puntos');
  equal(cambio(91.5, 93.4, 'puntos').sentido, 'baja', 'baja');
  equal(cambio(3.1, 3.08, 'decimal').sentido, 'igual', 'igual');
  equal(cambio(5, null, 'cantidad').sentido, null, 'sin dato');
});

test('cómo vamos usa los mismos días cuando Supabase manda el tramo', () => {
  const r = comoVamos(mensual, {
    dias: 27,
    actual: { desde: '2026-10-01', hasta: '2026-10-27', alumnos: 74, altas: 55, sesiones: 19, asistencia_real_pct: 91.5, ocupacion_pct: 61.9, promedio_por_grupo: 3.1 },
    anterior: { desde: '2026-09-01', hasta: '2026-09-27', alumnos: 32, altas: 40, sesiones: 12, asistencia_real_pct: 93.4, ocupacion_pct: 46.2, promedio_por_grupo: 2.54 },
  }, '2026-10-27')!;
  equal(r.titulo, 'Octubre (en curso)', 'título');
  equal(r.indicadores.length, 4, 'cuatro cifras');
  equal(r.indicadores[0].cambio.texto, '+42 (+131 %)', 'alumnos');
  equal(r.indicadores[2].cambio.texto, '+16 pts', 'ocupación');
  equal(r.subtitulo.includes('1 oct al 27 oct'), true, 'rango');
});

test('sin tramo: último mes contra el anterior avisando de que está en curso', () => {
  const r = comoVamos(mensual, undefined, '2026-10-27')!;
  equal(r.titulo, 'Octubre (en curso)', 'título');
  equal(r.subtitulo.includes('aún no ha terminado'), true, 'aviso');
});

test('crecimiento de la temporada para objetivos', () => {
  const c = crecimientoTemporada(mensual, '2026-10-27', 99)!;
  equal(c.desde, 32, 'desde');
  equal(c.hasta, 74, 'hasta');
  equal(c.cambio.texto, '+42 (+131 %)', 'cambio');
  equal(c.barras.length, 2, 'barras');
  equal(c.barras[1].alto, 100, 'barra máxima');
  equal(c.barras[1].enCurso, true, 'en curso');
});

test('niveles: suben y bajan aparte, los que se mantienen en un número', () => {
  const r = resumenProgresiones([
    { desde: 'A', hasta: 'A', total: 40, sentido: 'IGUAL' },
    { desde: 'A', hasta: 'A+', total: 7, sentido: 'SUBE' },
    { desde: 'B', hasta: 'B+', total: 3, sentido: 'SUBE' },
    { desde: 'C', hasta: 'B+', total: 1, sentido: 'BAJA' },
    { desde: 'B', hasta: 'B', total: 20, sentido: 'IGUAL' },
  ]);
  equal(r.totalSuben, 10, 'suben');
  equal(r.totalBajan, 1, 'bajan');
  equal(r.seMantienen, 60, 'se mantienen');
  equal(r.suben[0].hasta, 'A+', 'orden');
});
