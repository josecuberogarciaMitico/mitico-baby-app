import {
  aplicarOps,
  limpiarFechaLimite,
  limpiarIntentDisponibilidad,
  lunesDe,
  mismoResumen,
  normalizarYValidar,
  parecePeticionConfirmarPorTexto,
  parecePeticionDisponibilidad,
  parecePeticionEditarPropuesta,
  rangoSemana,
  resolverSemana,
  resumenComparable,
  semanaPorDefecto,
  textoPropuesta,
  type OpDisponibilidad,
  type PropuestaDisponibilidad,
} from '../../../src/features/pacoAcciones/pacoDisponibilidadLogic';
import {
  parecePeticionAimHarder,
  parecePreguntaCapacidades,
  respuestaCapacidades,
  respuestaOrdenNoSoportada,
} from '../../../src/features/pacoAcciones/pacoCapacidadesLogic';
import { crearBorradorDisponibilidadEditor } from '../../../src/features/availability/availabilityEditor';

function equal<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: esperado ${e}, recibido ${a}`);
}
function ok(valor: unknown, label: string) {
  if (!valor) throw new Error(`${label}: se esperaba verdadero`);
}
function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

const SEMANA = '2026-10-12'; // lunes
const AHORA = '2026-10-12T09:00';

function op(parcial: Partial<OpDisponibilidad> & Pick<OpDisponibilidad, 'op'>): OpDisponibilidad {
  return {
    dia: null,
    dias: [],
    hora_inicio: null,
    hora_fin: null,
    hora_inicio_nueva: null,
    hora_fin_nueva: null,
    numero_turno: null,
    modalidades: [],
    fecha_limite: null,
    ...parcial,
  };
}
const plantilla = () => crearBorradorDisponibilidadEditor(SEMANA);
const dia = (b: ReturnType<typeof plantilla>, nombre: string) => b.dias.find((d) => d.nombre === nombre)!;

test('qué frases son para disponibilidad y cuáles NO (consultas y recordatorios)', () => {
  for (const m of [
    'manda la disponibilidad de esta semana a los entrenadores',
    'prepara la disponibilidad de la próxima semana',
    'publica la disponibilidad',
    'puedes enviar la disponibilidad a los entrenadores',
    'prepara la semana que viene quitando el jueves y el sabado el 3 turno',
    'monta esta semana sin el viernes',
  ]) ok(parecePeticionDisponibilidad(m), m);
  for (const m of [
    'quién no ha respondido la disponibilidad',
    'recuérdales la disponibilidad a los que faltan',
    'retira la disponibilidad',
    'dame el resumen de disponibilidad',
    'pasa a Lucía al jueves a las 17:00',
    'hola paco',
    'prepara la semana de ocio',
    'prepara la semana que viene con los grupos del sábado',
    'dame el resumen de la semana',
  ]) ok(!parecePeticionDisponibilidad(m), m);
});

test('editar una propuesta en curso y confirmar por texto', () => {
  for (const m of ['quita el domingo de las 12', 'añade el jueves de 17:00 a 19:00', 'solo sábado y domingo', 'pon el límite el martes a las 20:00',
    '14:30–16:30 este turno del sabado quitado', 'el turno de las 14:30 del sábado fuera', 'quítame el último turno del sábado', 'ya no hay turno de tarde el domingo']) {
    ok(parecePeticionEditarPropuesta(m), m);
  }
  for (const m of ['gracias', 'qué tal el día', 'dame un resumen operativo de hoy']) ok(!parecePeticionEditarPropuesta(m), m);
  ok(parecePeticionConfirmarPorTexto('envíala'), 'envíala');
  ok(parecePeticionConfirmarPorTexto('vale, publícala'), 'publícala');
  ok(!parecePeticionConfirmarPorTexto('hola'), 'hola');
});

test('qué semana es «esta semana» (el domingo cuenta ya como la siguiente)', () => {
  equal(lunesDe('2026-10-14'), SEMANA, 'miércoles');
  equal(semanaPorDefecto('2026-10-12'), SEMANA, 'lunes');
  equal(semanaPorDefecto('2026-10-17'), SEMANA, 'sábado');
  equal(semanaPorDefecto('2026-10-11'), SEMANA, 'domingo 11 -> semana que empieza el 12');
  equal(resolverSemana('2026-10-12', { fecha: null, relativa: 'proxima' }), '2026-10-19', 'próxima');
  equal(resolverSemana('2026-10-12', { fecha: null, relativa: 'esta' }), SEMANA, 'esta');
  equal(resolverSemana('2026-10-12', { fecha: '2026-10-24', relativa: null }), '2026-10-19', 'fecha concreta');
  equal(rangoSemana(SEMANA), '12/10 al 18/10', 'rango');
});

test('el servidor dice cosas raras: se sanea', () => {
  const i = limpiarIntentDisponibilidad({
    accion: 'editar_disponibilidad',
    semana_relativa: 'Próxima',
    enviar: true,
    ops: [
      { op: 'quitar_turno', dia: 'domingo', hora_inicio: '12h' },
      { op: 'borrar_todo', dia: 'lunes' },
      { op: 'anadir_turno', dia: 'jueves', hora_inicio: '17:00', modalidades: ['baby', 'Ocio', 'nada'] },
      { op: 'solo_dias', dias: ['sábados', 'domingo', 'fin de semana'] },
      { op: 'fecha_limite', fecha_limite: '2026-10-13 20:00' },
    ],
  });
  equal(i.accion, 'editar_disponibilidad', 'accion');
  equal(i.semana_relativa, 'proxima', 'relativa');
  equal(i.ops.length, 4, 'se descarta la operación desconocida');
  equal(i.ops[0].dia, 4 + 3, 'domingo = 7');
  equal(i.ops[0].hora_inicio, '12:00', 'hora');
  equal(i.ops[1].modalidades, ['Baby', 'Ocio'], 'modalidades');
  equal(i.ops[2].dias, [6, 7], 'dias');
  equal(i.ops[3].fecha_limite, '2026-10-13T20:00', 'fecha límite');
  equal(limpiarFechaLimite('mañana'), null, 'fecha inválida');
  equal(limpiarIntentDisponibilidad(null).accion, 'ninguna', 'nulo');
});

test('quitar un turno y un día entero', () => {
  const r = aplicarOps(plantilla(), [op({ op: 'quitar_turno', dia: 7, hora_inicio: '12:00' }), op({ op: 'quitar_dia', dia: 5 })], AHORA);
  equal(r.problemas, [], 'sin problemas');
  equal(dia(r.borrador, 'domingo').turnos.map((t) => t.hora_inicio), ['09:45'], 'domingo');
  equal(dia(r.borrador, 'viernes').activo, false, 'viernes inactivo');
  equal(r.cambios.length, 2, 'dos cambios explicados');
  ok(!normalizarYValidar(r.borrador).error, 'sigue siendo válido');
});

test('quitar el único turno de un día lo deja sin clases', () => {
  const r = aplicarOps(plantilla(), [op({ op: 'quitar_turno', dia: 4 })], AHORA);
  equal(dia(r.borrador, 'jueves').activo, false, 'jueves inactivo');
  equal(r.problemas, [], 'sin problemas');
});

test('un día con varios turnos obliga a decir cuál', () => {
  const r = aplicarOps(plantilla(), [op({ op: 'quitar_turno', dia: 6 })], AHORA);
  equal(r.cambios, [], 'no cambia nada');
  ok(r.problemas[0].includes('varios turnos'), 'pide aclarar');
  const r2 = aplicarOps(plantilla(), [op({ op: 'quitar_turno', dia: 6, hora_inicio: '13:00' })], AHORA);
  ok(r2.problemas[0].includes('no tiene ningún turno que empiece a las 13:00'), 'hora que no existe');
});

test('«el tercer turno», «el último» y números que no existen', () => {
  const tercero = aplicarOps(plantilla(), [op({ op: 'quitar_turno', dia: 6, numero_turno: 3 })], AHORA);
  equal(tercero.problemas, [], 'sin problemas');
  equal(dia(tercero.borrador, 'sábado').turnos.map((t) => t.hora_inicio), ['09:45', '12:00'], 'quita el de las 14:30');
  ok(tercero.cambios[0].includes('14:30–16:30'), 'dice cuál ha quitado');
  const ultimo = aplicarOps(plantilla(), [op({ op: 'quitar_turno', dia: 7, numero_turno: -1 })], AHORA);
  equal(dia(ultimo.borrador, 'domingo').turnos.map((t) => t.hora_inicio), ['09:45'], 'último del domingo');
  const noExiste = aplicarOps(plantilla(), [op({ op: 'quitar_turno', dia: 7, numero_turno: 3 })], AHORA);
  ok(noExiste.problemas[0].includes('solo tiene 2 turnos'), 'no existe el tercero del domingo');
  const mods = aplicarOps(plantilla(), [op({ op: 'cambiar_modalidades', dia: 6, numero_turno: 3, modalidades: ['Baby'] })], AHORA);
  equal(dia(mods.borrador, 'sábado').turnos.map((t) => t.modalidades), [['Baby', 'Ocio'], ['Baby', 'Ocio'], ['Baby']], 'modalidades del tercero');
  equal(limpiarIntentDisponibilidad({ accion: 'editar_disponibilidad', ops: [{ op: 'quitar_turno', dia: 'sabado', numero_turno: '3' }, { op: 'quitar_turno', dia: 'sabado', numero_turno: 9 }] }).ops.map((o) => o.numero_turno), [3, null], 'saneado');
});

test('añadir turno: fin de semana sí, entre semana solo uno', () => {
  const a = aplicarOps(plantilla(), [op({ op: 'anadir_turno', dia: 6, hora_inicio: '17:00' })], AHORA);
  equal(a.problemas, [], 'sábado ok');
  const nuevo = dia(a.borrador, 'sábado').turnos.find((t) => t.hora_inicio === '17:00')!;
  equal([nuevo.hora_fin, nuevo.modalidades], ['19:00', ['Baby', 'Ocio']], 'duración 2 h y modalidades por defecto');
  ok(a.cambios[0].includes('he supuesto'), 'lo supuesto se dice');

  const b = aplicarOps(plantilla(), [op({ op: 'anadir_turno', dia: 4, hora_inicio: '17:00', hora_fin: '19:00' })], AHORA);
  equal(b.cambios, [], 'jueves ya tiene turno');
  ok(b.problemas[0].includes('solo admite un turno'), 'explica la regla');

  const c = aplicarOps(
    plantilla(),
    [op({ op: 'quitar_dia', dia: 4 }), op({ op: 'anadir_turno', dia: 4, hora_inicio: '17:00', hora_fin: '19:00', modalidades: ['Baby'] })],
    AHORA
  );
  equal(c.problemas, [], 'quitar y poner otro horario');
  equal(dia(c.borrador, 'jueves').turnos.map((t) => [t.hora_inicio, t.hora_fin]), [['17:00', '19:00']], 'jueves 17-19');

  const d = aplicarOps(plantilla(), [op({ op: 'anadir_turno', dia: 6, hora_inicio: '12:00' })], AHORA);
  ok(d.problemas[0].includes('ya tiene un turno que empieza a las 12:00'), 'duplicado');
  const e = aplicarOps(plantilla(), [op({ op: 'anadir_turno', dia: 6, hora_inicio: '17:00', hora_fin: '16:00' })], AHORA);
  ok(e.problemas[0].includes('posterior'), 'fin anterior al inicio');
  const f = aplicarOps(plantilla(), [op({ op: 'anadir_turno', dia: 6 })], AHORA);
  ok(f.problemas[0].includes('hora de inicio'), 'sin hora');
});

test('cambiar el horario de un turno mantiene la duración', () => {
  const r = aplicarOps(plantilla(), [op({ op: 'cambiar_turno', dia: 6, hora_inicio: '12:00', hora_inicio_nueva: '12:30' })], AHORA);
  equal(r.problemas, [], 'sin problemas');
  equal(dia(r.borrador, 'sábado').turnos.map((t) => [t.hora_inicio, t.hora_fin]), [['09:45', '11:45'], ['12:30', '14:30'], ['14:30', '16:30']], 'sábado');
  const dup = aplicarOps(plantilla(), [op({ op: 'cambiar_turno', dia: 6, hora_inicio: '12:00', hora_inicio_nueva: '14:30' })], AHORA);
  ok(dup.problemas[0].includes('ya tiene otro turno'), 'choca con otro turno');
});

test('cambiar modalidades de un turno o de todo el día', () => {
  const uno = aplicarOps(plantilla(), [op({ op: 'cambiar_modalidades', dia: 6, hora_inicio: '14:30', modalidades: ['Baby'] })], AHORA);
  equal(dia(uno.borrador, 'sábado').turnos.map((t) => t.modalidades), [['Baby', 'Ocio'], ['Baby', 'Ocio'], ['Baby']], 'solo el de las 14:30');
  const todos = aplicarOps(plantilla(), [op({ op: 'cambiar_modalidades', dia: 7, modalidades: ['Ocio'] })], AHORA);
  equal(dia(todos.borrador, 'domingo').turnos.map((t) => t.modalidades), [['Ocio'], ['Ocio']], 'todo el domingo');
});

test('«solo sábado y domingo», activar un día y lunes/martes', () => {
  const s = aplicarOps(plantilla(), [op({ op: 'solo_dias', dias: [6, 7] })], AHORA);
  equal(s.borrador.dias.map((d) => d.activo), [false, false, false, true, true], 'solo fin de semana');
  const reactivar = aplicarOps(s.borrador, [op({ op: 'activar_dia', dia: 5 })], AHORA);
  equal(dia(reactivar.borrador, 'viernes').turnos.map((t) => t.hora_inicio), ['18:00'], 'viernes con su turno habitual');
  const lunes = aplicarOps(plantilla(), [op({ op: 'quitar_dia', dia: 1 })], AHORA);
  ok(lunes.problemas[0].includes('Lunes y martes'), 'lunes no admite clases');
});

test('fecha límite: futura sí, pasada no', () => {
  const ok1 = aplicarOps(plantilla(), [op({ op: 'fecha_limite', fecha_limite: '2026-10-13T20:00' })], AHORA);
  equal([ok1.borrador.fecha_limite, ok1.borrador.fecha_limite_manual], ['2026-10-13T20:00', true], 'cambia');
  equal(normalizarYValidar(ok1.borrador).normalizado.fecha_limite, '2026-10-13T20:00', 'la normalización respeta la manual');
  const pasada = aplicarOps(plantilla(), [op({ op: 'fecha_limite', fecha_limite: '2026-10-11T20:00' })], AHORA);
  equal(pasada.borrador.fecha_limite, plantilla().fecha_limite, 'no cambia');
  ok(pasada.problemas[0].includes('ya ha pasado'), 'avisa');
  const sin = aplicarOps(plantilla(), [op({ op: 'fecha_limite' })], AHORA);
  ok(sin.problemas[0].includes('fecha límite'), 'sin fecha');
});

test('dejar la semana sin ningún día no se puede guardar', () => {
  const r = aplicarOps(plantilla(), [op({ op: 'solo_dias', dias: [3] }), op({ op: 'quitar_dia', dia: 3 })], AHORA);
  const v = normalizarYValidar(r.borrador);
  ok(String(v.error).includes('al menos un día'), 'validación del editor');
});

test('no se modifica el borrador original', () => {
  const base = plantilla();
  const copia = JSON.stringify(base);
  aplicarOps(base, [op({ op: 'quitar_dia', dia: 6 })], AHORA);
  equal(JSON.stringify(base), copia, 'intacto');
});

test('comparar lo esperado con lo leído de la base de datos', () => {
  const b = plantilla();
  const a = resumenComparable(b.fecha_limite, b.dias);
  // El servidor devuelve solo los días activos, con otros ids y las modalidades en otro orden.
  const servidor = JSON.parse(JSON.stringify(b.dias)).map((d: typeof b.dias[number]) => ({
    ...d,
    turnos: d.turnos.map((t) => ({ ...t, id: 'otro', modalidades: [...t.modalidades].reverse() })),
  }));
  ok(mismoResumen(a, resumenComparable(b.fecha_limite + ':00', servidor)), 'misma estructura');
  const distinto = aplicarOps(b, [op({ op: 'quitar_dia', dia: 5 })], AHORA).borrador;
  ok(!mismoResumen(a, resumenComparable(distinto.fecha_limite, distinto.dias)), 'detecta diferencias');
});

test('la tarjeta explica cambios, problemas y el peligro de volver a publicar', () => {
  const r = aplicarOps(plantilla(), [op({ op: 'quitar_dia', dia: 5 }), op({ op: 'anadir_turno', dia: 4, hora_inicio: '17:00' })], AHORA);
  const base: PropuestaDisponibilidad = {
    id: 'x',
    semana_inicio: SEMANA,
    base: 'plantilla',
    version_publicada: 0,
    borrador: r.borrador,
    cambios: r.cambios,
    problemas: r.problemas,
    errorValidacion: null,
    enviar: true,
    instantanea: { existe: false, estado: 'sin_preparar', version_publicada: 0, actualizado_en: null },
    respuestas: null,
    creada: 0,
  };
  const t1 = textoPropuesta(base);
  ok(t1.includes('semana del 12/10 al 18/10'), 'semana');
  ok(t1.includes('plantilla habitual'), 'origen');
  ok(t1.includes('viernes 16/10: sin clases'), 'viernes sin clases');
  ok(t1.includes('No he podido hacer esto'), 'problemas visibles');
  ok(!t1.includes('YA se publicó'), 'sin aviso de republicación');
  const t2 = textoPropuesta({ ...base, base: 'publicado', version_publicada: 2, respuestas: { respondieron: 3, total: 9 } });
  ok(t2.includes('YA se publicó antes (versión 2)') && t2.includes('3 de 9') && t2.includes('se borran las respuestas'), 'aviso fuerte');
  const t3 = textoPropuesta({ ...base, errorValidacion: 'Activa al menos un día antes de guardar.' });
  ok(t3.includes('así no se puede guardar') && !t3.includes('¿La dejo así?'), 'no ofrece confirmar algo inválido');
});

test('capacidades: preguntas sí, órdenes concretas no, AimHarder se dice claro', () => {
  for (const m of ['puedes mover a algún niño?', '¿qué puedes hacer?', 'que sabes hacer', 'puedes crear grupos', 'ayuda']) ok(parecePreguntaCapacidades(m), m);
  for (const m of ['pasa a Lucía al jueves a las 17:00', 'puedes mover a Pau al sábado a las 12:00', 'niños sin grupo', 'hola']) ok(!parecePreguntaCapacidades(m), m);
  for (const m of ['paco puedes cargar los niños de aimhander para la próxima semana', 'vuelca el listado de AimHarder', 'importa aim harder']) ok(parecePeticionAimHarder(m), m);
  ok(!parecePeticionAimHarder('cómo va la semana'), 'sin aimharder');
  const r = respuestaCapacidades('puedes mover a algún niño?');
  ok(r.includes('pasa a Lucía García') && !r.includes('no tengo permisos'), 'ejemplo de cómo pedirlo');
  ok(respuestaCapacidades('qué puedes hacer').includes('Todavía NO sé'), 'lo que no sabe');
});

test('orden que aún no sabe hacer: se dice claro, sin «permisos», y con lo que sí sabe', () => {
  const r = respuestaOrdenNoSoportada();
  ok(!r.toLowerCase().includes('no tengo permisos'), 'sin permisos');
  ok(r.includes('no he cambiado nada') && r.includes('Todavía NO sé') && r.includes('Preparar y enviar la disponibilidad'), 'dice qué sí y qué no');
});
