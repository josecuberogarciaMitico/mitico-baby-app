import { estadoAlPulsar, mapaAsistencia, normalizarEstado, resumirAsistencia, textoResumenAsistencia, trozosIds } from '../../../src/features/dashboard/asistenciaPistaLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('trabajo en pista: asistencia (resumen, pulsar y estados)', () => {
  equal(normalizarEstado('presente'), 'Presente', 'minúsculas');
  equal(normalizarEstado(null), 'Pendiente', 'vacío = sin marcar');
  const m = mapaAsistencia([
    { grupo_id: 'g1', alumno_id: 'a1', estado_asistencia: 'Presente' },
    { grupo_id: 'g1', alumno_id: 'a2', estado_asistencia: 'Ausente' },
  ]);
  equal(m.get('g1::a2'), 'Ausente', 'mapa');
  const r = resumirAsistencia(['Presente', 'Presente', 'Ausente', 'Pendiente']);
  equal(textoResumenAsistencia(r), '2 ✓ · 1 falta · 1 sin marcar', 'texto');
  equal(textoResumenAsistencia(resumirAsistencia(['Pendiente', 'Pendiente'])), 'Asistencia sin marcar', 'nada marcado');
  equal(textoResumenAsistencia(resumirAsistencia([])), '', 'sin niños');
  equal(textoResumenAsistencia(resumirAsistencia(['Ausente', 'Ausente', 'Presente'])), '1 ✓ · 2 faltan', 'plural');
  equal(estadoAlPulsar('Ausente', 'Ausente'), 'Pendiente', 'pulsar el activo lo desmarca');
  equal(estadoAlPulsar('Presente', 'Ausente'), 'Ausente', 'cambiar');
  equal(trozosIds(['b', 'a', 'b', ''], 1).map((t) => t.join()).join('|'), 'a|b', 'trozos únicos');
});
