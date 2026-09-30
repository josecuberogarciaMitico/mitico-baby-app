import {
  altasRespondidasSinAvisarApp,
  contarAltasPendientesRevisarApp,
  depurarAvisadasApp,
  textoAvisoAltasRespondidasApp,
  type AltaRespondidaAvisoApp,
} from '../../../src/core/enrolment/respondedNotice';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

function alta(
  id: string,
  estado: AltaRespondidaAvisoApp['estado'],
  respondido_at: string | null = null,
  nombre = `Alumno ${id}`
): AltaRespondidaAvisoApp {
  return { id, nombre_completo: nombre, modalidad: 'BABY', estado, respondido_at };
}

const altas = [
  alta('a', 'ENVIADO'),
  alta('b', 'RESPONDIDO', '2026-09-30T10:00:00Z'),
  alta('c', 'VALIDADO', '2026-09-29T10:00:00Z'),
  alta('d', 'RESPONDIDO', '2026-09-30T12:00:00Z'),
  alta('e', 'ANADIDO'),
  alta('f', 'DESCARTADO'),
];

test('el contador coincide con el filtro "Respondido · revisar" (RESPONDIDO + VALIDADO)', () => {
  equal(contarAltasPendientesRevisarApp(altas), 3, 'pendientes');
  equal(contarAltasPendientesRevisarApp([]), 0, 'vacío');
});

test('avisa solo de RESPONDIDO no avisadas, la más reciente primero', () => {
  const nuevas = altasRespondidasSinAvisarApp(altas, new Set<string>());
  equal(nuevas.map((a) => a.id).join(','), 'd,b', 'orden y filtro');
  const tras = altasRespondidasSinAvisarApp(altas, new Set(['d']));
  equal(tras.map((a) => a.id).join(','), 'b', 'ya avisada');
  equal(altasRespondidasSinAvisarApp(altas, new Set(['b', 'd'])).length, 0, 'todas avisadas');
});

test('un test nuevo respondido después vuelve a avisar', () => {
  const siguiente = [...altas, alta('g', 'RESPONDIDO', '2026-09-30T13:00:00Z')];
  const nuevas = altasRespondidasSinAvisarApp(siguiente, new Set(['b', 'd']));
  equal(nuevas.map((a) => a.id).join(','), 'g', 'nuevo aviso');
});

test('depura ids avisados que ya no están pendientes y quita duplicados', () => {
  const depuradas = depurarAvisadasApp(['a', 'b', 'b', 'c', 'zz', 'e'], altas);
  equal(depuradas.join(','), 'b,c', 'depurado');
});

test('texto del aviso para uno y para varios', () => {
  const uno = textoAvisoAltasRespondidasApp([{ nombre_completo: 'Lucía Pérez' }]);
  equal(uno.titulo, 'Test de nivel respondido', 'título uno');
  equal(uno.detalle, 'Lucía Pérez ya ha respondido. Pendiente de revisar.', 'detalle uno');
  const dos = textoAvisoAltasRespondidasApp([{ nombre_completo: 'A' }, { nombre_completo: 'B' }]);
  equal(dos.titulo, '2 tests de nivel respondidos', 'título dos');
  equal(dos.detalle, 'A, B.', 'detalle dos');
  const cinco = textoAvisoAltasRespondidasApp(
    ['A', 'B', 'C', 'D', 'E'].map((nombre_completo) => ({ nombre_completo }))
  );
  equal(cinco.detalle, 'A, B, C y 2 más.', 'detalle cinco');
});
