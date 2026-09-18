import { applyOcioRelocationsToStableGroup } from '../../src/features/ocio/ocioRelocation';
import { buildOcioWeeklyGroups } from '../../src/features/ocio/ocioWeekPlanning';

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
