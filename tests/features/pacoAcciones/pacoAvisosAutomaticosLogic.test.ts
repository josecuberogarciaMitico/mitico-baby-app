import {
  TEXTO_PROPONER_COLOCAR,
  botonesDeAvisoPaco,
} from '../../../src/features/pacoAcciones/pacoAvisosAutomaticosLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('parte con niños sin colocar: botón para proponer dónde colocarlos', () => {
  const b = botonesDeAvisoPaco({ tipo: 'PARTE_MANANA', cuerpo: '• Hoy 29/10 (2 turnos): 3 niños sin colocar' });
  equal(b.length, 1, 'un botón');
  equal(b[0].label, 'Proponer dónde colocarlos', 'texto');
  equal(b[0].continuation.kind, 'agente_texto', 'va al agente');
  equal(b[0].continuation.texto, TEXTO_PROPONER_COLOCAR, 'petición');
  equal(b[0].continuation.texto.length <= 300, true, 'cabe en agente_texto (300)');
});

test('parte sin niños por colocar: sin botones', () => {
  equal(botonesDeAvisoPaco({ tipo: 'PARTE_MANANA', cuerpo: '• Hoy: todo listo ✅' }).length, 0, 'nada');
});

test('grupo sin confirmar: botón de consulta', () => {
  equal(botonesDeAvisoPaco({ tipo: 'CONFIRMACION_PENDIENTE', cuerpo: 'x' })[0].label, '¿Quién falta por confirmar?', 'texto');
});

test('otros avisos (material, disponibilidad, recordatorio): sin botones', () => {
  for (const tipo of ['MATERIAL_FINDE', 'DISPONIBILIDAD_MARTES', 'RECORDATORIO_SECRETARIA']) {
    equal(botonesDeAvisoPaco({ tipo, cuerpo: 'niños sin colocar' }).length, 0, tipo);
  }
});
