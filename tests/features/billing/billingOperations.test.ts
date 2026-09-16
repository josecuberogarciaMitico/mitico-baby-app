import {
  billingDetailsForTrainer,
  billingPeriodForWeek,
  billingRatesByTrainer,
  cobroManualInicial,
  desglosarEfectivoCobrosApp,
  filterBillingRows,
  summarizeBillingRows,
} from '../../../src/features/billing/billingOperations';
import type { CobroDetalleMensual, CobroMensual } from '../../../src/features/billing/billingTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

function billing(overrides: Partial<CobroMensual> = {}): CobroMensual {
  return { temporada: '2025/2026', anio: 2026, mes: 9, estado_mes: 'abierto', nota_direccion: null,
    entrenador_id: 'e1', entrenador: 'Ana', tarifa_por_turno: 20, total_turnos_computables: 3,
    total_turnos_baby: 1, total_turnos_intensivos: 1, total_turnos_ocio: 1,
    subtotal_sesiones: 60, ajustes_total: 5, total_mes: 65, detalle_turnos: null,
    detalle_ajustes: null, pendientes_revisar: 0, ...overrides };
}

test('periodo de cobro usa el jueves de la semana', () => {
  equal(JSON.stringify(billingPeriodForWeek('2026-08-31', { anio: 2026, mes: 8 })), JSON.stringify({ anio: 2026, mes: 9 }), 'semana limítrofe');
  equal(JSON.stringify(billingPeriodForWeek('', { anio: 2025, mes: 12 })), JSON.stringify({ anio: 2025, mes: 12 }), 'fallback');
});

test('formulario manual conserva valores y fecha explícita', () => {
  const first = cobroManualInicial('2026-09-15'); const second = cobroManualInicial('2026-09-15');
  first.nombreGrupo = 'Otro';
  equal(second.nombreGrupo, 'Entreno manual', 'estado independiente');
  equal(second.fecha, '2026-09-15', 'fecha');
});

test('tarifas y detalles se indexan por entrenador', () => {
  equal(billingRatesByTrainer([billing()]).e1, '20', 'tarifa');
  const details = [{ entrenador_id: 'e1' }, { entrenador_id: 'e2' }] as CobroDetalleMensual[];
  equal(billingDetailsForTrainer(details, 'e1').length, 1, 'detalles');
});

test('filtros distinguen pendiente, cerrado, incidencias y mes actual', () => {
  const rows = [billing(), billing({ entrenador_id: 'e2', entrenador: 'Luis', estado_mes: 'pagado', pendientes_revisar: 1 })];
  equal(filterBillingRows(rows, '', 'pendiente', new Date(2026, 8, 15)).length, 1, 'pendiente');
  equal(filterBillingRows(rows, '', 'cerrado', new Date(2026, 8, 15)).length, 1, 'cerrado');
  equal(filterBillingRows(rows, '', 'incidencias', new Date(2026, 8, 15))[0].entrenador_id, 'e2', 'incidencias');
  equal(filterBillingRows(rows, 'ana', 'este_mes', new Date(2026, 8, 15)).length, 1, 'búsqueda y mes');
});

test('resumen suma importes y turnos por modalidad', () => {
  const summary = summarizeBillingRows([billing(), billing({ total_mes: 35, total_turnos_computables: 2, total_turnos_baby: 2, total_turnos_intensivos: 0, total_turnos_ocio: 0 })]);
  equal(summary.total, 100, 'total'); equal(summary.turnos, 5, 'turnos');
  equal(summary.baby, 3, 'Baby'); equal(summary.intensivos, 1, 'Intensivos'); equal(summary.ocio, 1, 'Ocio');
});

test('desglose de efectivo conserva céntimos exactos y no genera negativos', () => {
  const breakdown = desglosarEfectivoCobrosApp(76.21).filter((item) => item.cantidad > 0);
  equal(breakdown.map((item) => `${item.cantidad}x${item.etiqueta}`).join(','), '1x50 €,1x20 €,1x5 €,1x1 €,1x0,20 €,1x0,01 €', 'desglose');
  equal(desglosarEfectivoCobrosApp(-10).reduce((total, item) => total + item.cantidad, 0), 0, 'negativo');
});
