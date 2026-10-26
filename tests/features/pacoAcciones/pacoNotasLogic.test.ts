import { esPropuestaNotaAgente, pareceNotaDeNino } from '../../../src/features/pacoAcciones/pacoNotasLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

const A = '11111111-1111-4111-8111-111111111111';
const E = '22222222-2222-4222-8222-222222222222';
const base = {
  tipo: 'nota', alumno_id: A, nombre: 'MARTINA GARCIA LOPEZ', entrenador_id: E, entrenador: 'NICO PEREZ',
  texto: 'No ponerla con Nico, problemas con la familia', una_vez: false, etiqueta: 'Apuntar sobre Martina García',
};

test('nota válida, con y sin entrenador', () => {
  equal(esPropuestaNotaAgente(base), true, 'con entrenador');
  equal(esPropuestaNotaAgente({ ...base, entrenador_id: null, entrenador: null }), true, 'sin entrenador');
});

test('rechaza notas mal formadas', () => {
  equal(esPropuestaNotaAgente({ ...base, alumno_id: 'x' }), false, 'alumno');
  equal(esPropuestaNotaAgente({ ...base, entrenador_id: 'x' }), false, 'entrenador');
  equal(esPropuestaNotaAgente({ ...base, texto: 'ok' }), false, 'texto corto');
  equal(esPropuestaNotaAgente({ ...base, una_vez: 'si' }), false, 'una_vez');
  equal(esPropuestaNotaAgente({ ...base, tipo: 'borrar_todo' }), false, 'tipo');
  equal(esPropuestaNotaAgente(null), false, 'null');
});

test('borrar nota necesita nota_id válido', () => {
  const cerrar = { tipo: 'cerrar_nota', nota_id: E, nombre: 'MARTINA', texto: 'No con Nico', etiqueta: 'Borrar' };
  equal(esPropuestaNotaAgente(cerrar), true, 'válida');
  equal(esPropuestaNotaAgente({ ...cerrar, nota_id: 'x' }), false, 'id malo');
});

test('notas de niños van al agente; tareas a Secretaría', () => {
  equal(pareceNotaDeNino('Apunta: la familia de Lucas Pérez mejor que venga los miércoles'), true, 'familia');
  equal(pareceNotaDeNino('apunta que a Martina no la pongas con Nico'), true, 'no la pongas');
  equal(pareceNotaDeNino('Recuerda que el próximo día Hugo López va a pista grande'), true, 'pista grande');
  equal(pareceNotaDeNino('Apunta llamar a la tienda de esquís el jueves'), false, 'tarea');
  equal(pareceNotaDeNino('¿Qué grupos tiene Nico el sábado?'), false, 'pregunta');
});
