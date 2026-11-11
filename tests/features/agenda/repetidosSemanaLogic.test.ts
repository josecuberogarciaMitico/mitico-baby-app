import { agruparRepetidos, consejoRepetido, textoResumenRepetidos, type TurnoRepetido } from '../../../src/features/agenda/repetidosSemanaLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function ok(c: boolean, label: string) { if (!c) throw new Error(label); }
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const t = (alumno: string, fecha: string, hora: string, invitado: boolean): TurnoRepetido => ({
  semana_inicio: '2026-11-09', alumno_id: alumno, alumno, sesion_id: `${fecha}${hora}`, sesion_alumno_id: `${alumno}${fecha}`,
  fecha, hora_inicio: hora, modalidad: 'Baby', invitado, grupo: null, grupo_publicado: false, protegido: false,
});

test('repetidos: invitado + reserva normal = cambio de día con reserva antigua', () => {
  const r = agruparRepetidos([t('JUAN', '2026-11-15', '12:00', false), t('JUAN', '2026-11-13', '18:00', true), t('ANA', '2026-11-11', '18:00', false), t('ANA', '2026-11-13', '18:00', false)]);
  equal(r.length, 2, 'dos niños');
  equal(r[0].alumno, 'ANA', 'orden por nombre');
  const juan = r[1];
  equal(juan.pareceCambio, true, 'parece cambio');
  equal(juan.turnos[0].fecha, '2026-11-13', 'turnos por fecha');
  equal(juan.turnos[0].sobraProbable, false, 'el de invitado no sobra');
  equal(juan.turnos[1].sobraProbable, true, 'la reserva antigua sobra');
  ok(consejoRepetido(juan).includes('Dom 15/11 · 12:00'), 'consejo nombra el turno que sobra');
  equal(r[0].pareceCambio, false, 'sin invitados no se sabe');
  ok(consejoRepetido(r[0]).startsWith('¿Viene varios días'), 'pregunta');
  equal(textoResumenRepetidos(1), '1 niño está apuntado en varios turnos la misma semana', 'texto');
});
