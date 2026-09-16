import {
  resolveCurrentOperationalLevel,
  type OperationalLevelResolution,
} from '../levels/levelContract';
import type { AlumnoResumen } from './studentTypes';

export type MasterStudentProfile = {
  studentId: string;
  name: string;
  birthDate: string | null;
  age: number | null;
  phone: string | null;
  whatsappUrl: string | null;
  level: OperationalLevelResolution;
  piste: string | null;
  autonomy: string | null;
  groupPace: string | null;
  operationalAlerts: string[];
};

export function calculateAge(
  birthDate: string | null | undefined,
  referenceDate = new Date()
): number | null {
  const match = String(birthDate || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  if (
    parsed.getUTCFullYear() !== year ||
    parsed.getUTCMonth() !== month - 1 ||
    parsed.getUTCDate() !== day
  ) {
    return null;
  }

  const referenceYear = referenceDate.getUTCFullYear();
  const referenceMonth = referenceDate.getUTCMonth() + 1;
  const referenceDay = referenceDate.getUTCDate();
  if (
    year > referenceYear ||
    (year === referenceYear && month > referenceMonth) ||
    (year === referenceYear && month === referenceMonth && day > referenceDay)
  ) {
    return null;
  }

  let age = referenceYear - year;
  if (
    referenceMonth < month ||
    (referenceMonth === month && referenceDay < day)
  ) {
    age -= 1;
  }
  return age;
}

export function familyWhatsappUrl(
  phone: string | null | undefined,
  defaultCountryCode = '34'
): string | null {
  let number = String(phone || '').replace(/\D/g, '');
  if (!number) return null;
  if (number.startsWith('00')) number = number.slice(2);
  if (number.length === 9) number = `${defaultCountryCode}${number}`;
  return `https://wa.me/${number}`;
}

export function studentRecordCompleteness(student: AlumnoResumen): {
  complete: boolean;
  missing: string[];
} {
  const missing: string[] = [];
  if (!String(student.alumno || '').trim()) missing.push('nombre');
  if (!student.fecha_nacimiento) missing.push('fecha de nacimiento');
  if (!String(student.telefono || '').trim()) missing.push('teléfono');
  if (
    !student.nivel_actual &&
    !student.ultimo_nivel_reportado &&
    !student.nivel_estimado
  ) {
    missing.push('nivel');
  }
  return { complete: missing.length === 0, missing };
}

export function buildMasterStudentProfile(
  student: AlumnoResumen,
  options: {
    groupPace?: string | null;
    manualLevel?: string | null;
    manualCorrectionId?: string | null;
    manualCorrectionAt?: string | null;
    referenceDate?: Date;
  } = {}
): MasterStudentProfile {
  const level = resolveCurrentOperationalLevel({
    currentLevel: student.nivel_actual,
    estimatedLevel: student.nivel_estimado,
    latestReportLevel: student.ultimo_nivel_reportado,
    manualCorrectionLevel: options.manualLevel,
    manualCorrectionId: options.manualCorrectionId,
    manualCorrectionAt: options.manualCorrectionAt,
  });
  const operationalAlerts = [student.ultima_incidencia]
    .map((value) => String(value || '').trim())
    .filter(Boolean);

  return {
    studentId: student.alumno_id,
    name: student.alumno,
    birthDate: student.fecha_nacimiento,
    age: calculateAge(student.fecha_nacimiento, options.referenceDate),
    phone: student.telefono,
    whatsappUrl: familyWhatsappUrl(student.telefono),
    level,
    piste: student.ultima_pista,
    autonomy: student.ultima_autonomia,
    groupPace: options.groupPace || null,
    operationalAlerts,
  };
}
