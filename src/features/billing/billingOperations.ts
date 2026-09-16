import { crearFechaAgenda } from '../agenda/agendaCalendar';
import type { BillingFilter, CobroDetalleMensual, CobroManualFormState, CobroMensual } from './billingTypes';

export function cobroManualInicial(todayIso = new Date().toISOString().slice(0, 10)): CobroManualFormState {
  return { entrenadorId: '', fecha: todayIso, horaInicio: '18:00', horaFin: '20:00', modalidad: 'BABY',
    nombreGrupo: 'Entreno manual', totalAlumnos: '0', importeOverride: '', observaciones: '' };
}

export function billingPeriodForWeek(weekStart: string, fallback: { anio: number; mes: number }) {
  if (!weekStart) return fallback;
  const reference = crearFechaAgenda(weekStart); reference.setDate(reference.getDate() + 3);
  return { anio: reference.getFullYear(), mes: reference.getMonth() + 1 };
}

export function billingRatesByTrainer(rows: CobroMensual[]): Record<string, string> {
  return Object.fromEntries(rows.map((row) => [row.entrenador_id, String(Number(row.tarifa_por_turno || 0))]));
}

export function billingDetailsForTrainer(rows: CobroDetalleMensual[], trainerId: string): CobroDetalleMensual[] {
  return rows.filter((row) => row.entrenador_id === trainerId);
}

export function filterBillingRows(rows: CobroMensual[], search: string, filter: BillingFilter, now = new Date()): CobroMensual[] {
  const query = search.toLowerCase();
  return rows.filter((row) => {
    const text = `${row.entrenador} ${row.temporada} ${row.anio} ${row.mes} ${row.estado_mes} baby intensivos ocio`.toLowerCase();
    const status = String(row.estado_mes || '').toLowerCase();
    const pending = ['pendiente', 'abierto', 'revisar', 'borrador'].some((value) => status.includes(value));
    const closed = ['cerrado', 'pagado', 'aprobado'].some((value) => status.includes(value));
    const matchesFilter = filter === 'todos' || (filter === 'pendiente' && pending) || (filter === 'cerrado' && closed)
      || (filter === 'incidencias' && Number(row.pendientes_revisar || 0) > 0)
      || (filter === 'este_mes' && Number(row.anio) === now.getFullYear() && Number(row.mes) === now.getMonth() + 1);
    return text.includes(query) && matchesFilter;
  });
}

export function summarizeBillingRows(rows: CobroMensual[]) {
  return rows.reduce((summary, row) => ({
    total: summary.total + Number(row.total_mes || 0),
    turnos: summary.turnos + Number(row.total_turnos_computables || 0),
    baby: summary.baby + Number(row.total_turnos_baby || 0),
    intensivos: summary.intensivos + Number(row.total_turnos_intensivos || 0),
    ocio: summary.ocio + Number(row.total_turnos_ocio || 0),
  }), { total: 0, turnos: 0, baby: 0, intensivos: 0, ocio: 0 });
}

export function desglosarEfectivoCobrosApp(amount: number) {
  const denominations = [
    [5000, '50 €', 'billete'], [2000, '20 €', 'billete'], [1000, '10 €', 'billete'], [500, '5 €', 'billete'],
    [200, '2 €', 'moneda'], [100, '1 €', 'moneda'], [50, '0,50 €', 'moneda'], [20, '0,20 €', 'moneda'],
    [10, '0,10 €', 'moneda'], [5, '0,05 €', 'moneda'], [2, '0,02 €', 'moneda'], [1, '0,01 €', 'moneda'],
  ] as const;
  let remaining = Math.max(0, Math.round(Number(amount || 0) * 100));
  return denominations.map(([centimos, etiqueta, tipo]) => {
    const cantidad = Math.floor(remaining / centimos); remaining -= cantidad * centimos;
    return { centimos, etiqueta, tipo, cantidad };
  });
}
