import {
  decidePreparedGroupRefresh,
  requireAttendanceState,
  requireValidGroupMove,
} from '../../../src/core/groups/groupOperations';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}

function rejects(run: () => void, label: string) {
  try { run(); } catch { return; }
  throw new Error(`${label}: se esperaba error`);
}

function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('valida estados de asistencia exactos', () => {
  equal(requireAttendanceState('Presente'), 'Presente', 'estado');
  rejects(() => requireAttendanceState('sí'), 'estado inventado');
});

test('impide mover al mismo grupo', () => {
  rejects(() => requireValidGroupMove({ studentId: 'a', sourceGroupId: 'g', targetGroupId: 'g' }), 'mismo grupo');
});

test('reutiliza el grupo si el roster es idéntico y conserva ediciones', () => {
  const decision = decidePreparedGroupRefresh({
    groupId: 'g', state: 'Publicado', published: true, trainerId: 't', studentIds: ['a', 'b'],
    hasReports: false, hasRealAttendance: false, dailyWork: 'editado',
  }, { studentIds: ['b', 'a'], dailyWork: 'nuevo' });
  equal(decision.action, 'REUSE', 'acción');
});

test('solo reemplaza un borrador generado intacto', () => {
  const decision = decidePreparedGroupRefresh({
    groupId: 'g', state: 'Borrador', published: false, studentIds: ['a'],
    piste: 'Grande', meetingPoint: null, dailyWork: 'Trabajo', observations: 'Obs',
    hasReports: false, hasRealAttendance: false,
  }, { studentIds: ['a', 'b'], piste: 'Grande', meetingPoint: null, dailyWork: 'Trabajo', observations: 'Obs' });
  equal(decision.action, 'REPLACE_UNTOUCHED_DRAFT', 'acción');
});

test('bloquea reemplazo con entrenador o edición manual', () => {
  const decision = decidePreparedGroupRefresh({
    groupId: 'g', state: 'Borrador', published: false, trainerId: 't', studentIds: ['a'],
    dailyWork: 'Trabajo editado', hasReports: false, hasRealAttendance: false,
  }, { studentIds: ['a', 'b'], dailyWork: 'Trabajo' });
  equal(decision.action, 'BLOCK', 'acción');
});
