import {
  buildTrainerReportAssignments,
  collectGroupTrainers,
  entrenadorFormInicial,
  primaryTrainerChangePlan,
  responsableAutomaticoReporteApp,
  supportTrainerChangeIssue,
  trainerNamesForGroup,
  trainerStudentDistribution,
  trainersMissingJacket,
  groupTrainersJacket,
} from '../../../src/core/trainers/trainerOperations';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function rejects(run: () => void, label: string) { try { run(); } catch { return; } throw new Error(`${label}: se esperaba error`); }
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const groups = [
  { grupo_id: 'g1', entrenador_id: 'p', entrenador: 'Principal' },
  { grupo_id: 'g1', entrenador_id: 'p', entrenador: 'Principal' },
];
const students = [
  { grupo_id: 'g1', alumno_id: 'a2', alumno: 'Berta', entrenador_id: 's', entrenador: 'Apoyo' },
  { grupo_id: 'g1', alumno_id: 'a1', alumno: 'Ana', entrenador_id: 'p', entrenador: 'Principal' },
];

test('reparte reportes 3/2 y conserva overrides explícitos', () => {
  equal(responsableAutomaticoReporteApp(0, 'p', 's'), 'p', 'primero');
  equal(responsableAutomaticoReporteApp(3, 'p', 's'), 's', 'cuarto');
  equal(responsableAutomaticoReporteApp(8, 'p', 's'), 's', 'noveno');
  const result = buildTrainerReportAssignments(
    'g1',
    [{ alumno_id: 'a1' }, { alumno_id: 'a2' }, { alumno_id: 'a3' }, { alumno_id: 'a4' }],
    'p', 's', { g1__a2: 's' }
  );
  equal(result.map((item) => item.entrenador_id).join(','), 'p,s,p,s', 'reparto');
});

test('sin apoyo todos los reportes pertenecen al principal', () => {
  equal(responsableAutomaticoReporteApp(4, 'p', ''), 'p', 'responsable único');
});

test('deduplica entrenadores combinando grupo y alumnos', () => {
  const result = collectGroupTrainers('g1', groups, students);
  equal(result.length, 2, 'entrenadores únicos');
  equal(trainerNamesForGroup('g1', groups, students), 'Principal + Apoyo', 'nombres');
  equal(trainerNamesForGroup('g2', groups, students, 'Pendiente'), 'Pendiente', 'fallback');
});

test('construye reparto de alumnos ordenado para cada entrenador', () => {
  const result = trainerStudentDistribution('g1', groups, students);
  equal(result[0].alumnos.map((student) => student.alumno).join(','), 'Ana', 'principal');
  equal(result[1].alumnos.map((student) => student.alumno).join(','), 'Berta', 'apoyo');
});

test('protege el apoyo requerido y evita duplicar entrenador', () => {
  equal(Boolean(supportTrainerChangeIssue({
    groupName: 'Baby bajo', published: true, supportRequired: true, totalStudents: 6,
    primaryTrainerId: 'p', newSupportTrainerId: '',
  })), true, 'apoyo requerido');
  equal(supportTrainerChangeIssue({
    groupName: 'Baby', published: false, supportRequired: false, totalStudents: 2,
    primaryTrainerId: 'p', newSupportTrainerId: 'p',
  }), 'El segundo entrenador no puede ser el mismo que el entrenador principal.', 'mismo entrenador');
  equal(supportTrainerChangeIssue({
    groupName: 'Baby', published: true, supportRequired: true, totalStudents: 6,
    primaryTrainerId: 'p', newSupportTrainerId: 's',
  }), null, 'apoyo válido');
});

test('planifica cambio normal o excepcional y solo avisa si estaba publicado', () => {
  const normal = primaryTrainerChangePlan({
    groupId: 'g1', published: true, previousTrainerId: 'p', newTrainerId: 'n', exceptional: false,
  });
  equal(normal.rpc, 'cambiar_entrenador_grupo_app', 'rpc normal');
  equal(normal.notifyPublishedChange, true, 'aviso publicado');
  const exceptional = primaryTrainerChangePlan({
    groupId: 'g1', published: false, previousTrainerId: null, newTrainerId: 'n', exceptional: true,
  });
  equal(exceptional.rpc, 'cambiar_entrenador_grupo_excepcional_app', 'rpc excepcional');
  equal(exceptional.notifyPublishedChange, false, 'sin aviso');
  rejects(() => primaryTrainerChangePlan({
    groupId: 'g1', published: true, previousTrainerId: 'p', newTrainerId: 'p', exceptional: false,
  }), 'mismo entrenador');
});

test('el formulario inicial no comparte especialidades mutables', () => {
  const first = entrenadorFormInicial();
  const second = entrenadorFormInicial();
  first.especialidades.push('Baby');
  equal(second.especialidades.length, 0, 'estado independiente');
});

test('recordatorio de chaquetas: solo entrenadores de hoy sin chaqueta', () => {
  const trainers = [
    { entrenador_id: 'a', nombre_completo: 'ALBERTO DEDI', chaqueta_entregada: false },
    { entrenador_id: 'b', nombre_completo: 'ALFONSO JORDAN', chaqueta_entregada: true },
    { entrenador_id: 'c', nombre_completo: 'MACARENA SECO', chaqueta_entregada: false },
    { entrenador_id: 'd', nombre_completo: 'NO TRABAJA HOY', chaqueta_entregada: false },
  ];
  const lista = trainersMissingJacket([
    { entrenador_id: 'b', entrenador: 'ALFONSO JORDAN', entrenador_apoyo_id: 'c', entrenador_apoyo: 'MACARENA SECO' },
    { entrenador: 'Alberto Dedí' },
    { entrenador_id: 'a', entrenador: 'ALBERTO DEDI' },
  ], trainers);
  equal(lista.map((t) => t.nombre_completo).join(','), 'ALBERTO DEDI,MACARENA SECO', 'sin chaqueta, sin repetir, con apoyo y por nombre');
});

test('botón de chaqueta: principal y apoyo del grupo con su estado', () => {
  const trainers = [
    { entrenador_id: 'b', nombre_completo: 'ALFONSO JORDAN', chaqueta_entregada: true },
    { entrenador_id: 'c', nombre_completo: 'MACARENA SECO', chaqueta_entregada: false },
  ];
  const lista = groupTrainersJacket({ entrenador_id: 'b', entrenador: 'ALFONSO JORDAN', entrenador_apoyo: 'Macarena Seco' }, trainers);
  equal(lista.map((t) => `${t.rol}:${t.nombre_completo}:${t.chaqueta}`).join(','), 'principal:ALFONSO JORDAN:true,apoyo:MACARENA SECO:false', 'principal por id y apoyo por nombre');
  equal(groupTrainersJacket({ entrenador_id: 'b', entrenador_apoyo_id: 'b' }, trainers).length, 1, 'sin repetir');
  equal(groupTrainersJacket({ entrenador: 'DESCONOCIDO' }, trainers).length, 0, 'desconocido fuera');
});
