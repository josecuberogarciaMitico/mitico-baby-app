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
