import {
  babyClassHours,
  normalizeBabyAttendees,
  selectMiticoBox,
  uniqueBabyClasses,
  type BabyAimHarderClaseApp,
} from '../../../src/services/aimharder/aimHarderContract';
import {
  buildBabyRefreshSummary,
  normalizeOcioAimHarderTurn,
  planBabyWeekSlots,
  planOcioAttendanceFromAimHarder,
  selectExactBabyClass,
} from '../../../src/services/aimharder/aimHarderOperations';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

function rejects(run: () => void, label: string) {
  try { run(); } catch { return; }
  throw new Error(`${label}: se esperaba error`);
}

function classData(
  id: number,
  time: string,
  className = 'Baby 18 a 20 h'
): BabyAimHarderClaseApp {
  return {
    id,
    date: '2026-09-19',
    time,
    className,
    modalidad: 'BABY',
  };
}

test('interpreta el horario exacto de la clase Baby', () => {
  const result = babyClassHours(classData(1, '18:00 - 20:00'));
  equal(result.inicio, '18:00', 'inicio');
  equal(result.fin, '20:00', 'fin');
});

test('prefiere el nombre si corrige una hora final incoherente', () => {
  const result = babyClassHours(classData(1, '18:00 - 19:00'));
  equal(result.fin, '20:00', 'fin corregido');
  equal(result.fuente, 'nombre', 'fuente');
});

test('deduplica clases por identidad sin inventar turnos', () => {
  const classes = uniqueBabyClasses([
    classData(1, '18:00 - 20:00'),
    classData(1, '18:00 - 20:00'),
    { ...classData(2, '16:00 - 18:00', 'Baby 16 a 18 h') },
  ]);
  equal(classes.length, 2, 'clases');
  equal(classes[0].id, 2, 'orden');
});

test('rechaza un total de asistentes que no cuadra', () => {
  let thrown = false;
  try {
    normalizeBabyAttendees([{ name: 'ALUMNO TEST' }], 2);
  } catch {
    thrown = true;
  }
  equal(thrown, true, 'bloqueo');
});

test('selecciona Mítico de forma inequívoca', () => {
  equal(
    String(
      selectMiticoBox([
        { boid: 1, gym: 'OTRO' },
        { boid: 2, gym: 'MÍTICO' },
      ]).boid
    ),
    '2',
    'box'
  );
});

test('selecciona una clase Baby solo por fecha y horario exactos', () => {
  const classes = [classData(1, '18:00 - 20:00')];
  equal(selectExactBabyClass(classes, '2026-09-19', '18:00', '20:00').id, 1, 'clase');
  rejects(() => selectExactBabyClass(classes, '2026-09-19', '17:00', '19:00'), 'turno ausente');
  rejects(() => selectExactBabyClass([...classes, classData(2, '18:00 - 20:00')], '2026-09-19', '18:00', '20:00'), 'turno ambiguo');
});

test('el plan semanal excluye turnos Baby ambiguos', () => {
  const plan = planBabyWeekSlots([
    classData(1, '18:00 - 20:00'),
    classData(2, '18:00 - 20:00'),
    { ...classData(3, '16:00 - 18:00', 'Baby 16 a 18 h') },
  ]);
  equal(plan.slots.length, 1, 'turnos seguros');
  equal(plan.issues.length, 1, 'incidencias');
});

test('resume altas, bajas y protegidos sin duplicar nombres', () => {
  const message = buildBabyRefreshSummary(3, {
    sesion_id: 's', total_actual: 3, nuevos: 1, retirados: 1, protegidos: 1,
    nombres_nuevos: ['Ana'], nombres_retirados: ['Leo'], nombres_protegidos: ['Eva'],
  }, { totalFinal: 3, retiradosExtra: ['Leo'], protegidosExtra: ['Eva'] });
  equal(message.includes('1 cancelación retirada: Leo'), true, 'baja');
  equal(message.includes('1 alumno añadido: Ana'), true, 'alta');
  equal(message.includes('1 baja no retirada'), true, 'protegida');
});

test('normaliza un turno Ocio y bloquea ocupación incoherente', () => {
  const classRow = { id: 7, date: '2026-09-20', time: '10:00-12:00', className: 'Ocio', ocupation: 1 };
  const turn = normalizeOcioAimHarderTurn(classRow, [{ name: 'Ana', phone: '600' }], 1);
  equal(turn?.horaInicio, '10:00', 'inicio');
  equal(turn?.asistentes[0].nombre, 'Ana', 'asistente');
  rejects(() => normalizeOcioAimHarderTurn(classRow, [], 0), 'ocupación');
});

test('aplica reservas Ocio por turno exacto e identidad normalizada', () => {
  const plan = planOcioAttendanceFromAimHarder('2026-09-14', {
    semanaInicio: '2026-09-14', actualizadoAt: '2026-09-15',
    turnos: [{
      fecha: '2026-09-19', horaInicio: '10:00', horaFin: '12:00', claseId: 1,
      claseNombre: 'Ocio', ocupacion: 1,
      asistentes: [{ nombre: 'Ána López', telefono: '', fechaNacimiento: '', clientId: '' }],
    }],
  }, [{
    groupId: 'g', date: '2026-09-19', start: '10:00', end: '12:00',
    students: [{ studentId: 'a', name: 'ANA LOPEZ' }, { studentId: 'b', name: 'Leo' }],
  }]);
  equal(plan.changes.a, true, 'presente');
  equal(plan.changes.b, false, 'ausente');
  equal(plan.missingSlots, 0, 'turno encontrado');
  rejects(() => planOcioAttendanceFromAimHarder('2026-09-21', {
    semanaInicio: '2026-09-14', actualizadoAt: '', turnos: [],
  }, []), 'semana distinta');
});
