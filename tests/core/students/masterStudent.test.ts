import {
  buildMasterStudentProfile,
  calculateAge,
  familyWhatsappUrl,
  studentRecordCompleteness,
} from '../../../src/core/students/masterStudent';
import type { AlumnoResumen } from '../../../src/core/students/studentTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

const student: AlumnoResumen = {
  alumno_id: 'student-test',
  alumno: 'ALUMNO TEST',
  telefono: '600 123 123',
  nivel_actual: 'B',
  nivel_estimado: 'A+',
  origen_nivel_estimado: 'Familia',
  estado_ficha: 'completa',
  total_reportes: 1,
  total_entrenamientos_realizados: 2,
  ultima_fecha_reporte: '2026-01-10',
  ultima_modalidad: 'OCIO',
  ultimo_nivel_reportado: 'B+',
  ultima_actitud: null,
  ultima_tecnica: null,
  ultima_pista: 'Grande',
  ultimos_remontes: null,
  ultima_autonomia: 'Autónomo',
  ultima_incidencia: null,
  ultima_recomendacion: null,
  fecha_nacimiento: '2018-09-16',
  camiseta_entregada: false,
  camiseta_entregada_at: null,
};

test('calcula edad solo desde una fecha de nacimiento válida', () => {
  equal(calculateAge('2018-09-16', new Date('2026-09-15T12:00:00Z')), 7, 'edad');
  equal(calculateAge('2018-02-30', new Date('2026-09-15T12:00:00Z')), null, 'fecha inválida');
  equal(calculateAge('2027-01-01', new Date('2026-09-15T12:00:00Z')), null, 'fecha futura');
});

test('normaliza el enlace familiar sin guardar datos nuevos', () => {
  equal(familyWhatsappUrl('600 123 123'), 'https://wa.me/34600123123', 'WhatsApp');
});

test('la ficha maestra usa el último reporte válido', () => {
  const profile = buildMasterStudentProfile(student, {
    referenceDate: new Date('2026-09-15T12:00:00Z'),
  });
  equal(profile.level.level, 'B+', 'nivel');
  equal(profile.level.source, 'LATEST_REPORT', 'origen');
  equal(profile.age, 7, 'edad');
});

test('la completitud no considera una etiqueta de grupo', () => {
  equal(studentRecordCompleteness(student).complete, true, 'ficha completa');
  const incomplete = { ...student, nivel_actual: null, nivel_estimado: null, ultimo_nivel_reportado: null };
  equal(studentRecordCompleteness(incomplete).missing.includes('nivel'), true, 'nivel ausente');
});
