export type DatosContactoAimHarderApp = {
  nombre: string;
  telefono: string;
  fechaNacimiento: string;
  clientId: string;
};

export type UltimoListadoAimHarderApp = {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  modalidad: string;
  asistentes: Record<string, DatosContactoAimHarderApp>;
};

export type OcioAimHarderAsistenteApp = {
  nombre: string;
  telefono: string;
  fechaNacimiento: string;
  clientId: string;
};

export type OcioAimHarderTurnoApp = {
  fecha: string;
  horaInicio: string;
  horaFin: string;
  claseId: number;
  claseNombre: string;
  ocupacion: number;
  asistentes: OcioAimHarderAsistenteApp[];
};

export type OcioAimHarderSemanaApp = {
  semanaInicio: string;
  turnos: OcioAimHarderTurnoApp[];
  actualizadoAt: string;
};

export type OcioAimHarderEstadoAlumnoApp = {
  alumno: string;
  nivel: string;
  resultado: 'EXISTENTE' | 'PENDIENTE_TEST' | string;
};

export type BabyAimHarderClaseApp = {
  id: number;
  date: string;
  time: string;
  timeid?: string;
  className: string;
  modalidad: string;
  ocupation?: number;
};

export type BabyAimHarderAsistenteActivoApp = {
  name: string;
  guest?: boolean;
  bookingAt?: string | null;
  phone?: string | null;
  birthDate?: string | null;
  clientId?: string | null;
};

export type BabyAimHarderSafetyApp = {
  sourceKey?: string;
  sourceCount?: number;
  cancelledDetected?: number;
  cancelledNames?: string[];
  reportedPublic?: number;
  reportedTarget?: number | null;
  safeZero?: boolean;
};

export type BabyAimHarderLecturaApp = {
  asistentes: BabyAimHarderAsistenteActivoApp[];
  safety: BabyAimHarderSafetyApp;
};

export type BabyAimHarderRefrescoResultadoApp = {
  sesion_id: string;
  total_actual: number;
  nuevos: number;
  retirados: number;
  protegidos: number;
  nombres_nuevos: string[];
  nombres_retirados: string[];
  nombres_protegidos: string[];
};

export type BabyAimHarderVerificacionRefrescoApp = {
  totalFinal: number;
  retiradosExtra: string[];
  protegidosExtra: string[];
};

export type AimHarderBox = {
  boid: number | string;
  gym?: string | null;
};

export type BabyClassHours = {
  inicio: string;
  fin: string;
  fuente: 'time' | 'nombre';
};

function minutesFromTime(value: string): number | null {
  const [hour, minute] = value.split(':').map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return null;
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) return null;
  return hour * 60 + minute;
}

function normalizeTime(hour: string, minute?: string): string {
  const h = Number(hour);
  const m = minute == null || minute === '' ? 0 : Number(minute);
  if (!Number.isInteger(h) || !Number.isInteger(m)) return '';
  if (h < 0 || h > 23 || m < 0 || m > 59) return '';
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

function validTimeRange(start: string, end: string): boolean {
  const a = minutesFromTime(start);
  const b = minutesFromTime(end);
  if (a == null || b == null) return false;
  const duration = b - a;
  return duration >= 30 && duration <= 240;
}

export function babyClassHours(classData: BabyAimHarderClaseApp): BabyClassHours {
  const rawTime = String(classData?.time || '').trim();
  const timeValues = Array.from(
    rawTime.matchAll(/(?:^|\D)(\d{1,2}):(\d{2})(?=\D|$)/g)
  ).map((match) => normalizeTime(match[1], match[2]));
  const fromTime =
    timeValues.length >= 2 && validTimeRange(timeValues[0], timeValues[1])
      ? { inicio: timeValues[0], fin: timeValues[1], fuente: 'time' as const }
      : null;

  const className = String(classData?.className || '').toUpperCase();
  const nameMatch = className.match(
    /(\d{1,2})(?::(\d{2}))?\s*(?:A|AL|\-|–|—)\s*(\d{1,2})(?::(\d{2}))?\s*(?:H|HORA|HORAS|\b)/i
  );
  let fromName: BabyClassHours | null = null;
  if (nameMatch) {
    const start = normalizeTime(nameMatch[1], nameMatch[2]);
    const end = normalizeTime(nameMatch[3], nameMatch[4]);
    if (validTimeRange(start, end)) {
      fromName = { inicio: start, fin: end, fuente: 'nombre' };
    }
  }

  if (fromTime && fromName) {
    const timeEnd = minutesFromTime(fromTime.fin) || 0;
    const nameEnd = minutesFromTime(fromName.fin) || 0;
    const timeStart = minutesFromTime(fromTime.inicio) || 0;
    const nameStart = minutesFromTime(fromName.inicio) || 0;
    if (Math.abs(timeStart - nameStart) <= 5 && Math.abs(timeEnd - nameEnd) > 10) {
      return fromName;
    }
    return fromTime;
  }
  if (fromTime) return fromTime;
  if (fromName) return fromName;
  throw new Error(
    `No puedo interpretar con seguridad el horario de “${classData?.className || 'Baby'}”.`
  );
}

export function uniqueBabyClasses(
  classes: BabyAimHarderClaseApp[]
): BabyAimHarderClaseApp[] {
  const byIdentity = new Map<string, BabyAimHarderClaseApp>();
  for (const classData of classes) {
    const date = String(classData?.date || '').slice(0, 10);
    if (!date) continue;
    let hours: BabyClassHours;
    try {
      hours = babyClassHours(classData);
    } catch {
      continue;
    }
    const key = Number.isFinite(Number(classData?.id))
      ? `id:${Number(classData.id)}`
      : `slot:${date}:${hours.inicio}:${String(classData?.className || '').trim()}`;
    if (!byIdentity.has(key)) byIdentity.set(key, classData);
  }
  return Array.from(byIdentity.values()).sort((a, b) =>
    `${a.date} ${babyClassHours(a).inicio}`.localeCompare(
      `${b.date} ${babyClassHours(b).inicio}`
    )
  );
}

export function selectMiticoBox(boxes: AimHarderBox[]): AimHarderBox {
  const box =
    boxes.find((item) => /MITICO|MÍTICO/i.test(String(item?.gym || ''))) ||
    (boxes.length === 1 ? boxes[0] : null);
  if (!box) {
    throw new Error(
      'No puedo identificar de forma inequívoca el centro Mítico en AimHarder.'
    );
  }
  return box;
}

export function normalizeBabyAttendees(
  rawAttendees: unknown,
  reportedTotal: unknown
): BabyAimHarderAsistenteActivoApp[] {
  const attendees = (Array.isArray(rawAttendees) ? rawAttendees : [])
    .map((raw) => {
      const row = raw as Record<string, unknown>;
      return {
        name: String(row?.name || '').trim(),
        guest: Boolean(row?.guest),
        bookingAt: row?.bookingAt ? String(row.bookingAt) : null,
        phone: row?.phone ? String(row.phone).trim() : null,
        birthDate: row?.birthDate ? String(row.birthDate).trim() : null,
        clientId: row?.clientId ? String(row.clientId).trim() : null,
      };
    })
    .filter((row) => Boolean(row.name));
  const total = Number(reportedTotal);
  if (!Number.isFinite(total) || total !== attendees.length) {
    throw new Error(
      `AimHarder Baby no cuadra: el backend devuelve ${attendees.length} nombre(s) y total ${Number.isFinite(total) ? total : '?'}. No se ha modificado nada.`
    );
  }
  return attendees;
}
