import { ahoraMadrid, pendientesQueBloqueanDisponibilidad, totalNinosPendientes } from '../../../src/features/trainers/bloqueoDisponibilidad';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const fila = (o: Record<string, unknown>) => ({
  entrenador_id: 'e1', entrenador: 'ANA', grupo_id: 'g1', nombre_grupo: 'Grupo 1', publicado: true,
  fecha: '2026-11-15', hora_inicio: '09:45:00', hora_fin: '11:45:00', modalidad: 'Baby',
  alumno_id: 'a1', alumno: 'NIÑO', estado_asistencia: 'Presente', reporte_id: null, enviado_at: null, estado_reporte: 'Falta reporte',
  ...o,
}) as never;

const ahora = { fecha: '2026-11-17', hora: '10:00' };

test('disponibilidad bloqueada: reportes de sesiones ya terminadas', () => {
  const r = pendientesQueBloqueanDisponibilidad([
    fila({}),
    fila({ alumno_id: 'a2' }),
    fila({ grupo_id: 'g2', nombre_grupo: 'Grupo 2', fecha: '2026-11-14', estado_reporte: 'Asistencia sin confirmar' }),
    fila({ alumno_id: 'a3', estado_reporte: 'Hecho', reporte_id: 'r' }),
    fila({ entrenador_id: 'otro' }),
  ], 'e1', ahora);
  equal(r.length, 2, 'dos grupos');
  equal(r[0].grupo_id, 'g2', 'el más antiguo primero');
  equal(r[1].ninos, 2, 'dos niños en el grupo 1');
  equal(totalNinosPendientes(r), 3, 'tres en total');
});

test('disponibilidad: las sesiones que no han terminado no bloquean', () => {
  const r = pendientesQueBloqueanDisponibilidad([
    fila({ fecha: '2026-11-17', hora_fin: '11:45:00', estado_asistencia: 'Pendiente' }),
    fila({ fecha: '2026-11-21', estado_asistencia: 'Pendiente' }),
  ], 'e1', ahora);
  equal(r.length, 0, 'hoy sin terminar y futura no cuentan');
  equal(pendientesQueBloqueanDisponibilidad([fila({ fecha: '2026-11-17', hora_fin: '09:30:00' })], 'e1', ahora).length, 1, 'hoy ya terminada sí');
  equal(pendientesQueBloqueanDisponibilidad([fila({ estado_reporte: 'Hecho', reporte_id: 'r' })], 'e1', ahora).length, 0, 'todo hecho: libre');
});

test('disponibilidad: hora de Madrid', () => {
  const m = ahoraMadrid(new Date('2026-11-17T23:30:00Z'));
  equal(m.fecha, '2026-11-18', 'ya es el día siguiente en Madrid');
  equal(m.hora, '00:30', 'hora');
});
