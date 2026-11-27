import {
  claveStorageDisponibilidadEditor,
  crearBorradorDisponibilidadEditor,
  fechaLimiteAutomaticaDisponibilidadEditor,
  normalizarBorradorDisponibilidadEditor,
  normalizarBorradorDisponibilidadEditorServidor,
  validarBorradorDisponibilidadEditor,
  type BorradorDisponibilidadEditor,
} from '../../src/features/availability/availabilityEditor';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('Disponibilidad crea la plantilla semanal estable', () => {
  const draft = crearBorradorDisponibilidadEditor('2026-09-14');
  // 26/11: lunes y martes existen (puentes) pero salen apagados.
  equal(draft.dias.length, 7, 'días');
  equal(draft.dias[0].nombre, 'lunes', 'lunes');
  equal(draft.dias[0].activo, false, 'lunes apagado');
  equal(draft.dias[1].activo, false, 'martes apagado');
  equal(draft.dias[2].fecha, '2026-09-16', 'miércoles');
  equal(draft.dias[2].activo, true, 'miércoles activo');
  equal(draft.dias[5].turnos.length, 3, 'sábado');
  equal(draft.fecha_limite, '2026-09-15T13:00', 'límite');
  equal(fechaLimiteAutomaticaDisponibilidadEditor('2026-09-14'), '2026-09-15T13:00', 'límite común');
});

test('Disponibilidad normaliza laborables a un turno y respeta límite manual', () => {
  const draft = crearBorradorDisponibilidadEditor('2026-09-14');
  draft.fecha_limite = '2026-09-13T10:00';
  draft.fecha_limite_manual = true;
  draft.dias[2].turnos.push({ ...draft.dias[2].turnos[0], id: 'extra' });
  const normalized = normalizarBorradorDisponibilidadEditor(draft);
  equal(normalized.dias[2].turnos.length, 1, 'turno laborable');
  equal(normalized.fecha_limite, '2026-09-13T10:00', 'manual');
});

test('Disponibilidad reconstruye respuesta servidor sin inventar días publicados', () => {
  const template = crearBorradorDisponibilidadEditor('2026-09-14');
  const normalized = normalizarBorradorDisponibilidadEditorServidor({
    existe: true, semana_inicio: '2026-09-14', estado: 'publicado', fuente: 'publicado',
    fecha_limite: null, publicada_at: '2026-09-10T10:00:00Z', version_publicada: 1,
    dias: [template.dias[5]],
  });
  equal(normalized.dias[0].activo, false, 'lunes ausente');
  equal(normalized.dias[2].activo, false, 'miércoles ausente');
  equal(normalized.dias[5].activo, true, 'sábado presente');
});

test('Disponibilidad valida estructura antes de guardar o publicar', () => {
  const valid = crearBorradorDisponibilidadEditor('2026-09-14');
  equal(validarBorradorDisponibilidadEditor(valid), null, 'válido');

  const noDays = { ...valid, dias: valid.dias.map((day) => ({ ...day, activo: false })) };
  equal(validarBorradorDisponibilidadEditor(noDays)?.includes('Activa'), true, 'sin días');

  const invalidHours: BorradorDisponibilidadEditor = {
    ...valid,
    dias: valid.dias.map((day, index) => index === 2
      ? { ...day, turnos: [{ ...day.turnos[0], hora_inicio: '20:00', hora_fin: '18:00' }] }
      : day),
  };
  equal(validarBorradorDisponibilidadEditor(invalidHours)?.includes('posterior'), true, 'horario');
});

test('Disponibilidad de puente: lunes/martes activos exigen fecha límite anterior', () => {
  const draft = crearBorradorDisponibilidadEditor('2026-12-07');
  const conLunes: BorradorDisponibilidadEditor = {
    ...draft,
    dias: draft.dias.map((day) => (day.nombre === 'lunes' || day.nombre === 'martes' ? { ...day, activo: true } : { ...day, activo: false })),
  };
  equal(conLunes.dias[0].turnos[0].hora_inicio, '12:00', 'lunes 12:00');
  equal(conLunes.dias[0].turnos[0].modalidades.join(','), 'Intensivos', 'lunes intensivos');
  equal(validarBorradorDisponibilidadEditor(conLunes)?.includes('fecha límite'), true, 'límite automático (martes) no vale');
  equal(validarBorradorDisponibilidadEditor({ ...conLunes, fecha_limite: '2026-12-02T13:00', fecha_limite_manual: true }), null, 'límite el miércoles anterior: bien');
  // Semana normal: el límite del martes 13:00 sigue siendo válido.
  equal(validarBorradorDisponibilidadEditor(draft), null, 'semana normal igual que siempre');
});

test('Disponibilidad conserva la clave local V1 para no perder borradores', () => {
  equal(claveStorageDisponibilidadEditor('2026-09-14'), 'mitico_disponibilidad_editor_v1_2026-09-14', 'clave');
});
