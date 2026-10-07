import { applyOcioRelocationsToStableGroup } from '../../src/features/ocio/ocioRelocation';
import { buildBabyToOcioRequest, buildOcioWeeklyGroups, buildPassToOcioRequest, classifyOcioAimHarderStudent, OCIO_FIXED_TURNS } from '../../src/features/ocio/ocioWeekPlanning';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

const students = [
  { alumno_id: 'a', alumno: 'ANA SABADO', grupo_id: 'sabado', nivel: 'A', nivel_usado: 'A' },
  { alumno_id: 'b', alumno: 'BEA DOMINGO', grupo_id: 'domingo', nivel: 'A+', nivel_usado: 'A+' },
];

const relocations = [
  {
    reubicacion_id: 'r1',
    alumno_id: 'a',
    alumno: 'ANA SABADO',
    nivel_usado: 'A',
    fecha: '2026-09-20',
    grupo_origen_id: 'sabado',
    grupo_origen: 'Grupo sábado',
    origen_dia_semana: 'Sábado',
    origen_hora_inicio: '09:45',
    origen_hora_fin: '11:45',
    grupo_destino_id: 'domingo',
    grupo_destino: 'Grupo domingo',
    destino_dia_semana: 'Domingo',
    destino_hora_inicio: '12:00',
    destino_hora_fin: '14:00',
    destino_punto: '5',
    motivo: 'Cambio puntual',
    estado: 'confirmada',
    created_at: null,
    updated_at: null,
  },
];

test('un cambio puntual entra en el grupo semanal destino sin cambiar el grupo estable', () => {
  const sunday = applyOcioRelocationsToStableGroup('domingo', students, relocations);
  equal(sunday.map((student) => student.alumno_id).sort().join(','), 'a,b', 'domingo semanal');
  equal(students[0].grupo_id, 'sabado', 'grupo estable intacto');
});

test('el grupo semanal final filtra sobre el roster real pegado', () => {
  const sunday = applyOcioRelocationsToStableGroup('domingo', students, relocations);
  const present = new Set(['a']);
  const groups = buildOcioWeeklyGroups(
    [
      {
        groupId: 'domingo',
        name: 'Grupo domingo',
        date: '2026-09-20',
        start: '12:00',
        end: '14:00',
        piste: 'Pequeña',
        students: sunday,
      },
    ],
    (studentId) => present.has(studentId)
  );
  equal(groups.length, 1, 'grupos');
  equal(groups[0].studentIds.join(','), 'a', 'asistente real');
});

test('pasar a Ocio reutiliza la ficha con su nombre exacto y el turno del listado', () => {
  const req = buildPassToOcioRequest({ fichaName: ' NUO CHEN ', fixedDay: 'Sábado', startTime: '9:45', endTime: '11:45:00' });
  equal(req.p_nombre_completo, 'NUO CHEN', 'nombre exacto de ficha');
  equal(req.p_dia_fijo, 'Sábado', 'día');
  equal(req.p_hora_inicio, '09:45', 'hora inicio');
  equal(req.p_hora_fin, '11:45', 'hora fin');
  equal(req.p_nivel_codigo, null, 'no pisa el nivel');
  let fallo = false;
  try { buildPassToOcioRequest({ fichaName: 'X', fixedDay: 'Lunes', startTime: '18:00', endTime: '20:00' }); } catch { fallo = true; }
  equal(fallo, true, 'día no Ocio rechazado');
  equal(classifyOcioAimHarderStudent(true, null), 'OTHER_MODALITY', 'antes: fuera de Ocio');
  equal(classifyOcioAimHarderStudent(true, { grupo_id: null }), 'PENDING_GROUP', 'después: pendiente de colocar');
});

test('pasar de Baby a Ocio va por ID de ficha y con un turno fijo real', () => {
  const req = buildBabyToOcioRequest('id-ficha', 1);
  equal(req.p_alumno_id, 'id-ficha', 'id');
  equal(req.p_dia_fijo, 'Sábado', 'día');
  equal(req.p_hora_inicio, '09:45', 'inicio');
  equal(req.p_hora_fin, '11:45', 'fin');
  equal(OCIO_FIXED_TURNS.length, 3, 'tres turnos');
  let fallo = false;
  try { buildBabyToOcioRequest('id', 7); } catch { fallo = true; }
  equal(fallo, true, 'turno inexistente rechazado');
});
