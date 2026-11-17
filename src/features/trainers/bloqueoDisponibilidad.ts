// Bloqueo de la disponibilidad (17/11/2026, decisión de Jose): un entrenador no
// puede rellenar ni enviar la disponibilidad mientras tenga reportes pendientes
// de sesiones ya terminadas (reporte sin hacer o asistencia sin pasar).
// Las sesiones de hoy que todavía no han terminado y las futuras no cuentan.

import { isAttendanceUnconfirmed, isMissingReport } from '../../core/sessions/operationalStatus';
import type { AlumnoReporteEntrenador } from '../../core/sessions/operationalTypes';

export type PendienteDisponibilidad = {
  grupo_id: string;
  nombre_grupo: string;
  fecha: string;
  hora_inicio: string;
  /** Niños sin reporte (o sin asistencia pasada) en ese grupo. */
  ninos: number;
};

/** «2026-11-17» y «18:30» en hora de Madrid. */
export function ahoraMadrid(d: Date = new Date()): { fecha: string; hora: string } {
  const f = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(d);
  const p = (t: string) => f.find((x) => x.type === t)?.value || '';
  return { fecha: `${p('year')}-${p('month')}-${p('day')}`, hora: `${p('hour')}:${p('minute')}` };
}

const sesionTerminada = (a: Pick<AlumnoReporteEntrenador, 'fecha' | 'hora_fin'>, ahora: { fecha: string; hora: string }) =>
  a.fecha < ahora.fecha || (a.fecha === ahora.fecha && String(a.hora_fin || '23:59').slice(0, 5) <= ahora.hora);

/** Grupos del entrenador con reportes pendientes de sesiones ya terminadas (más antiguo primero). */
export function pendientesQueBloqueanDisponibilidad(
  alumnos: AlumnoReporteEntrenador[],
  entrenadorId: string,
  ahora: { fecha: string; hora: string }
): PendienteDisponibilidad[] {
  const porGrupo = new Map<string, PendienteDisponibilidad>();
  alumnos.forEach((a) => {
    if (a.entrenador_id !== entrenadorId) return;
    if (!(isMissingReport(a) || isAttendanceUnconfirmed(a))) return;
    if (!sesionTerminada(a, ahora)) return;
    const g = porGrupo.get(a.grupo_id) || {
      grupo_id: a.grupo_id,
      nombre_grupo: a.nombre_grupo,
      fecha: a.fecha,
      hora_inicio: a.hora_inicio,
      ninos: 0,
    };
    g.ninos += 1;
    porGrupo.set(a.grupo_id, g);
  });
  return [...porGrupo.values()].sort((x, y) => `${x.fecha} ${x.hora_inicio}`.localeCompare(`${y.fecha} ${y.hora_inicio}`));
}

export const totalNinosPendientes = (lista: PendienteDisponibilidad[]) => lista.reduce((n, g) => n + g.ninos, 0);
