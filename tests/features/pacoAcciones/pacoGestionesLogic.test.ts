import { esPropuestaGestion } from '../../../src/features/pacoAcciones/pacoAgenteAccionesLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const G = (id: string) => ({ grupo_id: id, nombre: 'Grupo 1', turno: 'sábado 31/10 12:00', entrenador: 'ALBERTO DEDI' });
const ID1 = '11111111-1111-4111-8111-111111111111';
const ID2 = '22222222-2222-4222-8222-222222222222';

test('recordatorio válido', () => {
  equal(esPropuestaGestion({ tipo: 'recordatorio', titulo: 'Llamar a la madre de Liam', detalle: null, recordar_at: '2026-10-30T09:00:00.000Z', cuando: 'viernes 30/10 a las 10:00', etiqueta: 'Recordatorio' }), true, 'ok');
});

test('recordatorio sin fecha o con basura: no', () => {
  equal(esPropuestaGestion({ tipo: 'recordatorio', titulo: 'x y z', detalle: null, recordar_at: 'mañana', cuando: 'x', etiqueta: 'y' }), false, 'fecha mala');
  equal(esPropuestaGestion({ tipo: 'recordatorio', titulo: '', detalle: null, recordar_at: '2026-10-30T09:00:00Z', cuando: 'x', etiqueta: 'y' }), false, 'sin título');
});

test('publicar grupos: ids válidos y sin repetir', () => {
  equal(esPropuestaGestion({ tipo: 'publicar_grupos', grupos: [G(ID1), G(ID2)], etiqueta: 'Publicar 2 grupos' }), true, 'ok');
  equal(esPropuestaGestion({ tipo: 'publicar_grupos', grupos: [G(ID1), G(ID1)], etiqueta: 'x' }), false, 'repetido');
  equal(esPropuestaGestion({ tipo: 'publicar_grupos', grupos: [G('no-es-uuid')], etiqueta: 'x' }), false, 'id malo');
  equal(esPropuestaGestion({ tipo: 'publicar_grupos', grupos: [], etiqueta: 'x' }), false, 'vacío');
});

test('tipo desconocido: no', () => {
  equal(esPropuestaGestion({ tipo: 'borrar_todo', etiqueta: 'x' }), false, 'no');
  equal(esPropuestaGestion(null), false, 'null');
});

import { pareceRecordatorioConHora } from '../../../src/features/pacoAcciones/pacoAgenteAccionesLogic';

test('recordatorio con hora o día: va al agente', () => {
  equal(pareceRecordatorioConHora('Recuérdame mañana a las 10 llamar a la madre de Liam'), true, 'mañana');
  equal(pareceRecordatorioConHora('avísame el viernes de pedir chaquetas'), true, 'viernes');
  equal(pareceRecordatorioConHora('recuérdame en 20 minutos mirar el listado'), true, 'en 20 min');
  equal(pareceRecordatorioConHora('recuérdame lo de las chaquetas'), false, 'sin cuándo → Secretaría');
  equal(pareceRecordatorioConHora('quién tiene grupo mañana'), false, 'no es recordatorio');
});
