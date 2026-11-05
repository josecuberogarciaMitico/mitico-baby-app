import {
  agruparCancelados,
  canceladosPendientes,
  etiquetaTurno,
  textoCancelo,
  textoResumenCancelados,
  type CanceladoAimHarder,
} from '../../../src/features/agenda/canceladosAimHarderLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const f = (x: Partial<CanceladoAimHarder>): CanceladoAimHarder => ({
  sesion_id: 's1', sesion_alumno_id: 'sa', fecha: '2026-11-07', hora_inicio: '09:45', modalidad: 'Baby',
  alumno_id: 'a', alumno: 'ANA', cancelada_at: '2026-11-03 22:32:14', visto_at: null,
  grupo_id: 'g', grupo: 'Grupo 3', grupo_publicado: true, protegido: false, ...x,
});

test('agrupa por turno en orden y niños por nombre', () => {
  const t = agruparCancelados([
    f({ sesion_alumno_id: '1', alumno: 'ZOE', fecha: '2026-11-08', hora_inicio: '12:00' }),
    f({ sesion_alumno_id: '2', alumno: 'PAU' }),
    f({ sesion_alumno_id: '3', alumno: 'ANA' }),
    f({ sesion_alumno_id: '4', alumno: 'EVA', modalidad: 'Ocio' }),
  ]);
  equal(t.length, 3, 'tres turnos');
  equal(t[0].modalidad, 'Baby', 'sábado Baby primero');
  equal(t[0].filas.map((x) => x.alumno).join(','), 'ANA,PAU', 'orden de niños');
  equal(t[2].fecha, '2026-11-08', 'domingo al final');
});

test('solo turnos de hoy en adelante', () => {
  equal(canceladosPendientes([f({ fecha: '2026-11-01' }), f({ fecha: '2026-11-03' })], '2026-11-03').length, 1, 'quita pasados');
});

test('textos', () => {
  equal(etiquetaTurno('2026-11-07', '09:45:00', 'Baby'), 'Baby · Sáb 07/11 · 09:45', 'turno');
  equal(textoCancelo('2026-10-29 22:32:14'), 'canceló el 29/10 a las 22:32', 'cuándo');
  equal(textoCancelo(null), 'canceló', 'sin fecha');
  equal(textoResumenCancelados(1), '1 niño ha cancelado en AimHarder y sigue apuntado', 'singular');
  equal(textoResumenCancelados(3), '3 niños han cancelado en AimHarder y siguen apuntados', 'plural');
});

import { horasRepaso, textoHace, turnosSinRepasoFiable, type RepasoTurno } from '../../../src/features/agenda/canceladosAimHarderLogic';

test('repaso: turnos de hoy/mañana con comprobación vieja o niños sin enlazar no son fiables', () => {
  const ahora = Date.parse('2026-11-05T10:00:00Z');
  const t = (x: Partial<RepasoTurno>): RepasoTurno => ({ sesion_id: 's', fecha: '2026-11-06', hora_inicio: '18:00', modalidad: 'Baby', ninos: 10, sin_vincular: 0,
    repaso_mas_antiguo: '2026-11-05T08:00:00Z', invitados_at: '2026-11-05T09:00:00Z', ...x });
  const lista = [
    t({ sesion_id: 'ok' }),
    t({ sesion_id: 'viejo', repaso_mas_antiguo: '2026-11-04T20:00:00Z' }),
    t({ sesion_id: 'sinvinculo', sin_vincular: 1 }),
    t({ sesion_id: 'lejos', fecha: '2026-11-08', repaso_mas_antiguo: '2026-11-01T00:00:00Z' }),
  ];
  equal(turnosSinRepasoFiable(lista, '2026-11-05', ahora).map((x) => x.sesion_id).join(','), 'viejo,sinvinculo', 'solo hoy/mañana');
  equal(horasRepaso(lista[0], ahora), 2, 'la más antigua de las dos');
  equal(textoHace(2), 'hace 2 h', 'texto');
  equal(textoHace(null), 'sin comprobar', 'sin dato');
});
