import type { AgendaFormState } from './agendaTypes';

export const puntosEncuentroAgenda = ['5', '9', '10', '6', '4', '7', '3', '2', '1'];
export const modalidadesAgendaTrabajo = [
  { codigo: 'BABY', nombre: 'Baby' },
  { codigo: 'OCIO', nombre: 'Ocio' },
  { codigo: 'INTENSIVOS', nombre: 'Intensivo' },
];

export function agendaFormInicial(): AgendaFormState {
  return { fecha: '', modalidad: 'BABY', hora_inicio: '10:00', hora_fin: '14:00', lugar: 'Madrid SnowZone', texto_listado: '' };
}

export function crearFechaAgenda(fechaIso: string): Date {
  const [year, month, day] = fechaIso.split('-').map(Number);
  return new Date(year, month - 1, day);
}

export function claveFechaAgenda(date: Date): string {
  return `${date.getFullYear()}-${`${date.getMonth() + 1}`.padStart(2, '0')}-${`${date.getDate()}`.padStart(2, '0')}`;
}

export function claveMesDesdeFecha(fechaIso: string): string { return fechaIso.slice(0, 7); }

export function nombreMesAgendaDesdeClave(key: string): string {
  const [year, month] = key.split('-').map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
}

export function inicioSemanaAgenda(fechaIso: string): string {
  const date = crearFechaAgenda(fechaIso);
  const weekday = date.getDay() === 0 ? 7 : date.getDay();
  date.setDate(date.getDate() - weekday + 1);
  return claveFechaAgenda(date);
}

export function fechaAgendaCortaConAnio(fechaIso: string): string {
  return crearFechaAgenda(fechaIso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export function fechaAgendaDiaCorta(fechaIso: string): string {
  return crearFechaAgenda(fechaIso).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' });
}

export function rangoSemanaAgenda(startIso: string): string {
  const start = crearFechaAgenda(startIso);
  const end = new Date(start); end.setDate(start.getDate() + 6);
  return `${fechaAgendaCortaConAnio(claveFechaAgenda(start))} – ${fechaAgendaCortaConAnio(claveFechaAgenda(end))}`;
}

export function rangoEntrenosSemanaAgenda(startIso: string): string {
  const start = crearFechaAgenda(startIso);
  const first = new Date(start); first.setDate(start.getDate() + 2);
  const last = new Date(start); last.setDate(start.getDate() + 6);
  return `${fechaAgendaDiaCorta(claveFechaAgenda(first))} – ${fechaAgendaDiaCorta(claveFechaAgenda(last))}`;
}

export function diasTrabajoSemanaAgenda(startIso: string) {
  const start = crearFechaAgenda(startIso);
  return [2, 3, 4, 5, 6].map((offset) => {
    const date = new Date(start); date.setDate(start.getDate() + offset);
    return {
      fecha: claveFechaAgenda(date),
      nombre: date.toLocaleDateString('es-ES', { weekday: 'long' }),
      etiqueta: date.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' }),
      esDiaTrabajo: true,
    };
  });
}

export function turnosTrabajoDiaAgenda(fechaIso: string) {
  const weekday = crearFechaAgenda(fechaIso).getDay();
  if ([3, 4, 5].includes(weekday)) return [{ etiqueta: '18:00–20:00', inicio: '18:00', fin: '20:00' }];
  if (weekday === 6) return [
    { etiqueta: '09:45–11:45', inicio: '09:45', fin: '11:45' },
    { etiqueta: '12:00–14:00', inicio: '12:00', fin: '14:00' },
    { etiqueta: '14:30–16:30', inicio: '14:30', fin: '16:30' },
  ];
  if (weekday === 0) return [
    { etiqueta: '09:45–11:45', inicio: '09:45', fin: '11:45' },
    { etiqueta: '12:00–14:00', inicio: '12:00', fin: '14:00' },
  ];
  return [];
}

export function seasonStartForAgenda(date: Date): number {
  return date.getMonth() + 1 >= 7 ? date.getFullYear() : date.getFullYear() - 1;
}

export const temporadaInicioDefectoAgenda = seasonStartForAgenda(new Date());
export function nombreTemporadaAgenda(startYear: number): string { return `${startYear}/${startYear + 1}`; }
export function mesesTemporadaAgenda(startYear: number): string[] {
  return [9, 10, 11, 12].map((month) => `${startYear}-${`${month}`.padStart(2, '0')}`)
    .concat([1, 2, 3, 4, 5, 6].map((month) => `${startYear + 1}-${`${month}`.padStart(2, '0')}`));
}
