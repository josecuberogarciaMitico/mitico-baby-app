import { normalizeRosterName } from '../../core/sessions/rosterSync';
import {
  babyClassHours,
  type BabyAimHarderClaseApp,
  type BabyAimHarderRefrescoResultadoApp,
  type BabyAimHarderSafetyApp,
  type BabyAimHarderVerificacionRefrescoApp,
  type OcioAimHarderSemanaApp,
  type OcioAimHarderTurnoApp,
} from './aimHarderContract';

function shortTime(value: unknown): string {
  const match = String(value || '').trim().match(/^(\d{1,2}):(\d{2})/);
  if (!match) return '';
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (!Number.isInteger(hour) || hour < 0 || hour > 23 || minute < 0 || minute > 59) return '';
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function aimHarderSlotKey(date: unknown, start: unknown, end?: unknown): string {
  const base = `${String(date || '').slice(0, 10)}__${shortTime(start)}`;
  return end === undefined ? base : `${base}__${shortTime(end)}`;
}

export function selectExactBabyClass(
  classes: BabyAimHarderClaseApp[],
  date: string,
  start: string,
  end: string,
  dateLabel = date
): BabyAimHarderClaseApp {
  const cleanDate = String(date || '').slice(0, 10);
  const cleanStart = shortTime(start);
  const cleanEnd = shortTime(end);
  if (!cleanDate || !cleanStart || !cleanEnd) {
    throw new Error('No puedo identificar con seguridad la fecha y el horario del turno Baby.');
  }

  const candidates = classes.filter((classData) => {
    if (String(classData.date || '').slice(0, 10) !== cleanDate) return false;
    try {
      const hours = babyClassHours(classData);
      return hours.inicio === cleanStart && hours.fin === cleanEnd;
    } catch {
      return false;
    }
  });
  if (candidates.length === 0) {
    throw new Error(`No encuentro en AimHarder una única clase Baby para ${dateLabel} · ${cleanStart}-${cleanEnd}. No se ha modificado nada.`);
  }
  if (candidates.length > 1) {
    throw new Error(`AimHarder devuelve ${candidates.length} clases Baby para ${dateLabel} · ${cleanStart}-${cleanEnd}. No voy a adivinar cuál es.`);
  }
  return candidates[0];
}

export type BabyWeekSlot = {
  date: string;
  start: string;
  classData: BabyAimHarderClaseApp;
};

export function planBabyWeekSlots(classes: BabyAimHarderClaseApp[]): {
  slots: BabyWeekSlot[];
  issues: string[];
} {
  const grouped = new Map<string, BabyAimHarderClaseApp[]>();
  const issues: string[] = [];
  for (const classData of classes) {
    const date = String(classData.date || '').slice(0, 10);
    try {
      const hours = babyClassHours(classData);
      const key = aimHarderSlotKey(date, hours.inicio);
      grouped.set(key, [...(grouped.get(key) || []), classData]);
    } catch (error) {
      issues.push(error instanceof Error ? error.message : `Horario Baby inválido en ${date}.`);
    }
  }

  const slots: BabyWeekSlot[] = [];
  for (const [key, candidates] of grouped) {
    const [date, start] = key.split('__');
    if (candidates.length !== 1) {
      issues.push(`${date} ${start}: AimHarder devuelve ${candidates.length} clases Baby con el mismo inicio. No se ha modificado nada en ese turno.`);
      continue;
    }
    slots.push({ date, start, classData: candidates[0] });
  }
  return { slots, issues };
}

function uniqueNames(values: Array<string | null | undefined>): string[] {
  return Array.from(new Set(values.map((value) => String(value || '').trim()).filter(Boolean)));
}

// Traduce las marcas de tiempo que ya calcula el backend
// (reservasActualizadasAt / clientesRepasadosAt) a algo que Jose entienda de
// un vistazo, en vez de no mostrarse nunca como pasaba hasta ahora.
export function describirFrescuraAimHarderBabyApp(
  safety: BabyAimHarderSafetyApp | null | undefined
): string {
  const haceTiempo = (iso: string | null | undefined): string | null => {
    if (!iso) return null;
    const fecha = new Date(String(iso));
    if (Number.isNaN(fecha.getTime())) return null;
    const minutos = Math.max(0, Math.round((Date.now() - fecha.getTime()) / 60000));
    if (minutos < 1) return 'hace menos de 1 min';
    if (minutos < 60) return `hace ${minutos} min`;
    const horas = Math.round(minutos / 60);
    if (horas < 24) return `hace ${horas} h`;
    const dias = Math.round(horas / 24);
    return `hace ${dias} día(s)`;
  };

  const reservas = haceTiempo(safety?.reservasActualizadasAt);
  const clientes = haceTiempo(safety?.clientesRepasadosAt);
  if (!reservas && !clientes) {
    return 'AimHarder: sin dato de frescura de esta lectura.';
  }
  const partes: string[] = [];
  if (reservas) partes.push(`reservas de estos alumnos repasadas ${reservas}`);
  if (clientes) partes.push(`listado general de clientes repasado ${clientes}`);
  return `AimHarder (copia interna): ${partes.join(' · ')}.`;
}

// Resume, en una frase, a quién se le ha pedido a la sincronización que
// repase ya mismo su reserva (porque estaba en la sesión pero no salía como
// activo en esta lectura), y a quién no se ha encontrado como cliente de
// AimHarder con ese nombre exacto.
export function describirRepasoSolicitadoBabyApp(
  solicitados: string[],
  noEncontrados: string[]
): string {
  const partes: string[] = [];
  if (solicitados.length > 0) {
    partes.push(
      `He pedido repasar ya a: ${solicitados.join(', ')} (puede tardar 1-2 min; vuelve a pulsar Actualizar).`
    );
  }
  if (noEncontrados.length > 0) {
    partes.push(
      `No encuentro como cliente de AimHarder a: ${noEncontrados.join(', ')} (revisa el nombre exacto, o usa "Pegar listado" para ese turno).`
    );
  }
  return partes.join(' ');
}

export function buildBabyRefreshSummary(
  activeCount: number,
  result: BabyAimHarderRefrescoResultadoApp | null | undefined,
  verification: BabyAimHarderVerificacionRefrescoApp,
  safety?: BabyAimHarderSafetyApp | null,
  repaso?: { solicitados: string[]; noEncontrados: string[] } | null
): string {
  const added = uniqueNames(result?.nombres_nuevos || []);
  const removed = uniqueNames([...(result?.nombres_retirados || []), ...verification.retiradosExtra]);
  const protectedNames = uniqueNames([...(result?.nombres_protegidos || []), ...verification.protegidosExtra]);
  const messages = ['✓ REFRESCAR DÍA'];

  if (added.length === 0 && removed.length === 0 && protectedNames.length === 0) {
    messages.push(`Sin cambios · ${activeCount} alumno(s) activo(s) en AimHarder · sesión ya actualizada`);
  } else {
    if (removed.length > 0) messages.push(`${removed.length} ${removed.length === 1 ? 'cancelación retirada' : 'cancelaciones retiradas'}: ${removed.join(', ')}`);
    if (added.length > 0) messages.push(`${added.length} ${added.length === 1 ? 'alumno añadido' : 'alumnos añadidos'}: ${added.join(', ')}`);
    if (protectedNames.length > 0) messages.push(`${protectedNames.length} ${protectedNames.length === 1 ? 'baja no retirada' : 'bajas no retiradas'} por asistencia/reporte: ${protectedNames.join(', ')}`);
    messages.push(`AimHarder: ${activeCount} activo(s) · sesión final: ${verification.totalFinal} alumno(s)`);
  }

  const frescura = describirFrescuraAimHarderBabyApp(safety);
  if (frescura) messages.push(frescura);

  const notaRepaso = repaso ? describirRepasoSolicitadoBabyApp(repaso.solicitados, repaso.noEncontrados) : '';
  if (notaRepaso) messages.push(notaRepaso);

  return messages.join(' · ');
}

// Resultado del modo "solo añadir" (sesión con grupos ya hechos y niños que se
// apuntan tarde): qué se ha añadido, cómo ha quedado cada uno y qué se ha
// dejado como estaba.
export type BabyAddOnlyAddedStudent = {
  nombre: string;
  // CONOCIDO (tenía ficha, también de temporadas anteriores) o PENDIENTE_TEST.
  estado: string;
  nivel: string | null;
};

export type BabyAddOnlyResult = {
  anadidos: BabyAddOnlyAddedStudent[];
  // Siguen en la sesión aunque no salen en esta lectura (no se quitan).
  siguenSinSalir: string[];
  // AimHarder los marca como cancelados: se retiran como en un refresco normal.
  cancelacionesRetiradas: string[];
  // Cancelados que no se retiran porque ya tienen asistencia o reporte.
  protegidos: string[];
  // Nombres que no se pueden volcar automáticamente.
  noAnadidos: string[];
  // Alumnos que ya estaban y cuyo nivel en la sesión se ha recalculado desde su ficha.
  nivelesRecalculados: Array<{ nombre: string; antes: string | null; despues: string | null }>;
};

function describirAnadidoBaby(alumno: BabyAddOnlyAddedStudent): string {
  if (String(alumno.estado || '').toUpperCase() === 'PENDIENTE_TEST') {
    return `${alumno.nombre} (nuevo · pendiente de Alta/Test)`;
  }
  return `${alumno.nombre} (ya tenía ficha · nivel ${alumno.nivel || 'sin nivel, revisa su ficha'})`;
}

export function describirConfirmacionSoloAnadirBaby(input: {
  additions: string[];
  keptMissing: string[];
  cancelledRemovals: string[];
  unsupportedAdditions: string[];
}): string {
  const lineas = [
    'La sesión ya tiene alumnos que no salen en este listado, así que NO voy a quitar a nadie ni a tocar los grupos.',
    '',
  ];
  if (input.additions.length > 0) {
    lineas.push(`Voy a AÑADIR (quedarán en "Pendientes de colocar"):`);
    input.additions.forEach((nombre) => lineas.push(`  • ${nombre}`));
    lineas.push(
      'Si ya tienen ficha (también del año pasado) entran con su nivel; si son nuevos, entran como "Pendiente de Alta/Test".'
    );
  }
  if (input.cancelledRemovals.length > 0) {
    lineas.push('', `AimHarder los marca como cancelados y saldrán: ${input.cancelledRemovals.join(', ')}`);
  }
  if (input.keptMissing.length > 0) {
    lineas.push('', `Se quedan como están (no salen en el listado, revísalos tú): ${input.keptMissing.join(', ')}`);
  }
  if (input.unsupportedAdditions.length > 0) {
    lineas.push('', `No los puedo añadir automáticamente: ${input.unsupportedAdditions.join(', ')}`);
  }
  lineas.push('', '¿Continuar?');
  return lineas.join('\n');
}

export function buildBabyAddOnlySummary(
  result: BabyAddOnlyResult,
  safety?: BabyAimHarderSafetyApp | null
): string {
  const messages = ['✓ AÑADIR NUEVOS (grupos sin tocar)'];
  if (result.anadidos.length > 0) {
    messages.push(
      `${result.anadidos.length} ${result.anadidos.length === 1 ? 'alumno añadido' : 'alumnos añadidos'} a "Pendientes de colocar": ${result.anadidos
        .map(describirAnadidoBaby)
        .join(', ')}`
    );
  } else {
    messages.push('No había alumnos nuevos que añadir');
  }
  if (result.cancelacionesRetiradas.length > 0) {
    messages.push(`Cancelaciones retiradas (AimHarder las marca como canceladas): ${result.cancelacionesRetiradas.join(', ')}`);
  }
  if (result.protegidos.length > 0) {
    messages.push(`Cancelados que NO se quitan por asistencia/reporte: ${result.protegidos.join(', ')}`);
  }
  if (result.siguenSinSalir.length > 0) {
    messages.push(
      `Siguen en la sesión aunque no salen en este listado (no se ha quitado a nadie, revísalos): ${result.siguenSinSalir.join(', ')}`
    );
  }
  if (result.noAnadidos.length > 0) {
    messages.push(`No añadidos automáticamente (usa "+ Alumno fuera de plazo"): ${result.noAnadidos.join(', ')}`);
  }
  if (result.nivelesRecalculados.length > 0) {
    messages.push(
      `Nivel de la sesión actualizado al de su ficha: ${result.nivelesRecalculados
        .map((item) => `${item.nombre} (${item.antes || '-'} → ${item.despues || '-'})`)
        .join(', ')}`
    );
  }
  if (safety && safety.sourceKey !== 'manual-paste') {
    messages.push(describirFrescuraAimHarderBabyApp(safety));
  }
  return messages.join(' · ');
}

export type OcioStableRosterGroup = {
  groupId: string;
  date: string;
  start: string;
  end: string;
  students: Array<{ studentId: string; name: string }>;
};

export function planOcioAttendanceFromAimHarder(
  expectedWeek: string,
  week: OcioAimHarderSemanaApp,
  groups: OcioStableRosterGroup[]
): { changes: Record<string, boolean>; missingSlots: number } {
  if (!expectedWeek || week.semanaInicio !== expectedWeek) {
    throw new Error('La respuesta de AimHarder pertenece a otra semana. No se ha cambiado quién viene.');
  }
  const bySlot = new Map(week.turnos.map((turn) => [aimHarderSlotKey(turn.fecha, turn.horaInicio, turn.horaFin), turn]));
  const changes: Record<string, boolean> = {};
  let found = 0;
  for (const group of groups) {
    const turn = bySlot.get(aimHarderSlotKey(group.date, group.start, group.end));
    if (!turn) continue;
    found += 1;
    const reservations = new Set(turn.asistentes.map((attendee) => normalizeRosterName(attendee.nombre)).filter(Boolean));
    for (const student of group.students) {
      changes[student.studentId] = reservations.has(normalizeRosterName(student.name));
    }
  }
  return { changes, missingSlots: Math.max(0, groups.length - found) };
}

export function normalizeOcioAimHarderTurn(
  classData: Record<string, unknown>,
  rawAttendees: unknown,
  reportedTotal: unknown
): OcioAimHarderTurnoApp | null {
  const date = String(classData.date || '').slice(0, 10);
  const [rawStart = '', rawEnd = ''] = String(classData.time || '').split('-');
  const start = shortTime(rawStart);
  const end = shortTime(rawEnd);
  if (!date || !start || !end) return null;
  const attendees = Array.isArray(rawAttendees) ? rawAttendees : [];
  const occupation = Number(classData.ocupation) || 0;
  const total = Number(reportedTotal);
  const finalTotal = Number.isFinite(total) ? total : attendees.length;
  if (finalTotal !== occupation || attendees.length !== occupation) {
    throw new Error(`No cuadra el listado de ${date} ${start}-${end}: AimHarder marca ${occupation} ocupadas y se han leído ${attendees.length}. No se ha cambiado Preparar semana.`);
  }
  return {
    fecha: date,
    horaInicio: start,
    horaFin: end,
    claseId: Number(classData.id) || 0,
    claseNombre: String(classData.className || ''),
    ocupacion: occupation,
    asistentes: attendees.map((raw) => {
      const attendee = raw as Record<string, unknown>;
      return {
        nombre: String(attendee.name || '').trim(),
        telefono: String(attendee.phone || '').trim(),
        fechaNacimiento: String(attendee.birthDate || '').trim(),
        clientId: String(attendee.clientId || '').trim(),
      };
    }),
  };
}
