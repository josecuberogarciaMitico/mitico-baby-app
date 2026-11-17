import { diaMadrid, mediaPorEntrenador, resumenPorEntrenador } from '../../../src/features/dashboard/notificacionesLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const f = (entrenador_id: string, creada: string, estado = 'enviada', tipo = 'REPORTES_PENDIENTES') => ({
  creada, entrenador_id, entrenador: entrenador_id.toUpperCase(), tipo, titulo: 't', cuerpo: 'c', estado,
});

test('notificaciones: resumen por entrenador', () => {
  const r = resumenPorEntrenador([
    f('sergio', '2026-11-16T10:34:00Z'), f('sergio', '2026-11-16T10:45:00Z'), f('sergio', '2026-11-16T15:07:00Z'),
    f('sergio', '2026-11-15T11:15:00Z'),
    f('sergio', '2026-11-16T20:06:00Z', 'fallida'),
    f('ana', '2026-11-16T09:00:00Z'), f('ana', '2026-11-14T09:00:00Z', 'sin_suscripcion'),
    { ...f('x', '2026-11-16T09:00:00Z'), entrenador_id: null },
  ]);
  equal(r.length, 2, 'dos entrenadores (sin entrenador no cuenta)');
  equal(r[0].entrenadorId, 'sergio', 'el que más recibe primero');
  equal(r[0].total, 4, 'solo cuenta lo que llegó');
  equal(r[0].maxDia, 3, 'tres el mismo día');
  equal(r[0].diaMax, '2026-11-16', 'qué día');
  equal(r[0].filas[0].estado, 'fallida', 'lista del más nuevo al más viejo');
  equal(r[1].sinMovil, 1, 'sin móvil activado');
  equal(mediaPorEntrenador(r), 2.5, 'media');
});

test('notificaciones: día de Madrid', () => {
  equal(diaMadrid('2026-11-16T23:30:00Z'), '2026-11-17', 'pasada la medianoche en Madrid');
});
