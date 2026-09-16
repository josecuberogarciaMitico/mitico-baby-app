import { babyGroupMaximum, babyLowGroupNeedsSupport } from '../../src/features/baby/babyPolicy';
import { ocioFunctionalScore, requireUnchangedExistingOcioLevel } from '../../src/features/ocio/ocioPolicy';
import {
  activeOcioRelocationsForWindow,
  applyOcioRelocationsToStableGroup,
  eligibleOcioRelocationGroups,
  findOcioRelocationEntry,
  findOcioRelocationExit,
  requireOcioRelocationCommand,
  type OcioCambioPuntualApp,
} from '../../src/features/ocio/ocioRelocation';
import { requireIntensiveDiplomaUpdate } from '../../src/features/intensivos/intensivosPolicy';
import {
  calcularFechasCuatroSesionesIntensivo,
  diaIntensivoInicial,
  grupoEdadIntensivo,
  grupoIntensivoInicial,
  intensivoInicial,
  planIntensiveFutureMove,
  plantillaCuatroSesionesInicial,
} from '../../src/features/intensivos/intensiveOperations';
import type {
  GrupoEditableIntensivoDiaApp,
  IntensivoDiaApp,
} from '../../src/features/intensivos/intensiveTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function rejects(run: () => void, label: string) { try { run(); } catch { return; } throw new Error(`${label}: se esperaba error`); }
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('Baby conserva ratios por pista y apoyo', () => {
  equal(babyGroupMaximum('Pequeña', 1), 4, 'pequeña');
  equal(babyGroupMaximum('Pequeña', 2), 7, 'apoyo');
  equal(babyLowGroupNeedsSupport(Array.from({ length: 5 }, () => ({ level: 'A' }))), true, 'apoyo necesario');
});

test('Ocio afina ritmo sin sustituir el nivel técnico', () => {
  equal(ocioFunctionalScore({ level: 'B+', strength: 'FUERTE', highAttentionDemand: true }), 41, 'score');
  rejects(() => requireUnchangedExistingOcioLevel('B', 'B+'), 'mutación nivel');
});

test('Intensivos exige nivel confirmado al revisar', () => {
  rejects(() => requireIntensiveDiplomaUpdate({ state: 'Revisado' }), 'cierre sin nivel');
  equal(requireIntensiveDiplomaUpdate({ state: 'Revisado', confirmedLevelId: 'nivel-id' }).updatesMasterLevel, true, 'consolida ficha');
});

function relocation(overrides: Partial<OcioCambioPuntualApp> = {}): OcioCambioPuntualApp {
  return {
    reubicacion_id: 'r', alumno_id: 'a', alumno: 'Ana', nivel_usado: 'A', fecha: '2026-09-19',
    grupo_origen_id: 'g1', grupo_origen: 'Grupo 1', origen_dia_semana: 'Jueves',
    origen_hora_inicio: '18:00', origen_hora_fin: '20:00', grupo_destino_id: 'g2',
    grupo_destino: 'Grupo 2', destino_dia_semana: 'Sábado', destino_hora_inicio: '10:00',
    destino_hora_fin: '12:00', destino_punto: '5', motivo: null, estado: 'confirmada',
    created_at: null, updated_at: null, ...overrides,
  };
}

test('Ocio selecciona solo cambios activos de la semana', () => {
  const active = activeOcioRelocationsForWindow([
    relocation(),
    relocation({ reubicacion_id: 'cancelled', estado: 'cancelada' }),
    relocation({ reubicacion_id: 'old', fecha: '2026-09-01' }),
  ], '2026-09-14', '2026-09-20');
  equal(active.length, 1, 'cambios');
  equal(active[0].reubicacion_id, 'r', 'activo');
});

test('Ocio aplica salidas y entradas sin modificar el grupo estable', () => {
  const students = [
    { alumno_id: 'a', alumno: 'Ana', grupo_id: 'g1' },
    { alumno_id: 'b', alumno: 'Berta', grupo_id: 'g1' },
    { alumno_id: 'c', alumno: 'Carla', grupo_id: 'g2' },
  ];
  const result = applyOcioRelocationsToStableGroup('g1', students, [
    relocation({ alumno_id: 'a', grupo_origen_id: 'g1', grupo_destino_id: 'g2' }),
    relocation({ alumno_id: 'c', grupo_origen_id: 'g2', grupo_destino_id: 'g1' }),
  ]);
  equal(result.map((student) => student.alumno_id).join(','), 'b,c', 'roster puntual');
  equal(students[0].grupo_id, 'g1', 'estable intacto');
});

test('Ocio localiza entrada y salida por alumno y grupo', () => {
  const changes = [relocation()];
  equal(findOcioRelocationEntry(changes, 'a', 'g2')?.reubicacion_id, 'r', 'entrada');
  equal(findOcioRelocationExit(changes, 'a', 'g1')?.reubicacion_id, 'r', 'salida');
});

test('Ocio ofrece solo destinos activos, oficiales, del día y distintos', () => {
  const groups = [
    { grupo_id: 'g1', dia_semana: 'Jueves', activo: true, oficial: true },
    { grupo_id: 'g2', dia_semana: 'Sábado', activo: true, oficial: true },
    { grupo_id: 'g3', dia_semana: 'Sábado', activo: false, oficial: true },
    { grupo_id: 'g4', dia_semana: 'Sábado', activo: true, oficial: false },
  ];
  const result = eligibleOcioRelocationGroups(groups, 'g1', 'Sábado', (group) => group.oficial, (day) => day.toLowerCase());
  equal(result.map((group) => group.grupo_id).join(','), 'g2', 'destino');
});

test('Ocio valida el movimiento puntual antes de llamar al RPC', () => {
  const command = requireOcioRelocationCommand({ studentId: 'a', sourceGroupId: 'g1', targetGroupId: 'g2', date: '2026-09-19', reason: 'Familia' });
  equal(command.reason, 'Familia', 'motivo');
  rejects(() => requireOcioRelocationCommand({ studentId: 'a', sourceGroupId: 'g1', targetGroupId: 'g1', date: '2026-09-19' }), 'mismo grupo');
  rejects(() => requireOcioRelocationCommand({ studentId: 'a', targetGroupId: 'g2', date: '' }), 'sin fecha');
});

test('Intensivos expone formularios iniciales independientes', () => {
  equal(intensivoInicial().lugar, 'Madrid SnowZone', 'lugar');
  equal(diaIntensivoInicial().hora_inicio, '18:00', 'hora');
  equal(plantillaCuatroSesionesInicial().tipo, 'cuatro_dias', 'plantilla');
  const groupA = grupoIntensivoInicial();
  const groupB = grupoIntensivoInicial();
  groupA.alumnos_ids.push('a');
  equal(groupB.alumnos_ids.length, 0, 'listas independientes');
});

test('Intensivos calcula las cuatro variantes de calendario sin deriva horaria', () => {
  equal(calcularFechasCuatroSesionesIntensivo('2026-10-24', 'cuatro_dias').join(','), '2026-10-24,2026-10-25,2026-10-26,2026-10-27', 'días');
  equal(calcularFechasCuatroSesionesIntensivo('2026-10-24', 'dos_fines_semana').join(','), '2026-10-24,2026-10-25,2026-10-31,2026-11-01', 'fines de semana');
  equal(calcularFechasCuatroSesionesIntensivo('2026-10-24', 'cuatro_sabados').join(','), '2026-10-24,2026-10-31,2026-11-07,2026-11-14', 'sábados');
  rejects(() => calcularFechasCuatroSesionesIntensivo('2026-02-31', 'cuatro_dias'), 'fecha imposible');
});

test('Intensivos clasifica edad con una fecha de referencia explícita', () => {
  equal(grupoEdadIntensivo('2020-09-16', new Date('2026-09-15T12:00:00')), 'Pequeños', 'seis años');
  equal(grupoEdadIntensivo('2019-09-15', new Date('2026-09-15T12:00:00')), 'Mayores', 'siete años');
  equal(grupoEdadIntensivo('fecha'), 'Sin edad', 'sin fecha');
});

function intensiveDay(id: string, number: number): IntensivoDiaApp {
  return { intensivo_dia_id: id, intensivo_id: 'i', numero_dia: number, fecha: `2026-09-${String(number).padStart(2, '0')}`, hora_inicio: '10:00', hora_fin: '12:00', sesion_id: `s${number}`, created_at: '' };
}

function intensiveRow(dayId: string, studentId: string, groupId: string, groupName: string): GrupoEditableIntensivoDiaApp {
  return { intensivo_dia_id: dayId, intensivo_id: 'i', numero_dia: Number(dayId.slice(1)), fecha: '2026-09-01', grupo_id: groupId, nombre_grupo: groupName, nivel_grupo: 'A', pista: 'Pequeña', publicado: false, entrenador_id: null, trabajo_diario: null, observaciones_importantes: null, alumno_id: studentId, alumno: studentId, nivel_resumen: 'A', nivel_orden: 1, fuente_nivel: 'FICHA', edad: 7, estado_ficha: 'OK', observacion_visible_entrenador: null, orden_en_grupo: 1 };
}

test('Intensivos prepara todos los movimientos futuros antes de mutar', () => {
  const days = [intensiveDay('d1', 1), intensiveDay('d2', 2)];
  const rows = new Map<string, GrupoEditableIntensivoDiaApp[]>([
    ['d1', [intensiveRow('d1', 'a', 'g1', 'Origen'), intensiveRow('d1', 'b', 'g2', 'Destino')]],
    ['d2', [intensiveRow('d2', 'a', 'g1b', 'Origen'), intensiveRow('d2', 'b', 'g2b', 'Déstino')]],
  ]);
  const plan = planIntensiveFutureMove({ studentId: 'a', studentName: 'Ana', targetGroupName: 'Destino', days, rowsByDay: rows });
  equal(plan.length, 2, 'movimientos');
  equal(plan[1].grupo_destino_id, 'g2b', 'destino futuro');
});

test('Intensivos bloquea el plan completo si falta un día o se supera ratio', () => {
  const day = intensiveDay('d1', 1);
  rejects(() => planIntensiveFutureMove({ studentId: 'a', studentName: 'Ana', targetGroupName: 'Destino', days: [day], rowsByDay: new Map() }), 'día sin grupos');
  const rows = new Map([['d1', [intensiveRow('d1', 'a', 'g1', 'Origen'), intensiveRow('d1', 'b', 'g2', 'Destino')]]]);
  rejects(() => planIntensiveFutureMove({ studentId: 'a', studentName: 'Ana', targetGroupName: 'Destino', days: [day], rowsByDay: rows, maximumForGroup: () => 1 }), 'ratio');
});
