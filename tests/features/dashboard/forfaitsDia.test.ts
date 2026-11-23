import { avisosForfaits, calcularForfaitsDia, cuentaParaXanadu, textoWhatsappForfaits, tipoPasePista } from '../../../src/features/dashboard/forfaitsDiaLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('FF / Corporate: tipo de pase y modalidades', () => {
  equal(tipoPasePista('Grande'), 'ff', 'grande = FF');
  equal(tipoPasePista('Pequeña'), 'corporate', 'pequeña = Corporate');
  equal(tipoPasePista('Pequeña/Grande'), 'ff', 'mixto = FF');
  equal(tipoPasePista(''), 'sin_pista', 'sin pista');
  equal(cuentaParaXanadu('Baby'), true, 'Baby cuenta');
  equal(cuentaParaXanadu('INTENSIVOS'), true, 'Intensivos cuenta');
  equal(cuentaParaXanadu('Intensivo'), true, 'Intensivo cuenta');
  equal(cuentaParaXanadu('Ocio'), false, 'Ocio no cuenta');
});

test('FF / Corporate: totales por turno y del día', () => {
  const r = calcularForfaitsDia([
    { horaInicio: '09:45:00', horaFin: '11:45:00', modalidad: 'Baby', grupos: [
      { pista: 'Grande', previstos: 6, presentes: 5, sinMarcar: 0 },
      { pista: 'Pequeña', previstos: 5, presentes: 3, sinMarcar: 1 },
    ] },
    { horaInicio: '09:45:00', horaFin: '11:45:00', modalidad: 'intensivo', grupos: [
      { pista: 'Pequeña/Grande', previstos: 4, presentes: 4, sinMarcar: 0 },
    ] },
    { horaInicio: '12:00:00', horaFin: '14:00:00', modalidad: 'Ocio', grupos: [
      { pista: 'Grande', previstos: 9, presentes: 9, sinMarcar: 0 },
    ] },
    { horaInicio: '12:00:00', horaFin: '14:00:00', modalidad: 'Baby', grupos: [
      { pista: null, previstos: 2, presentes: 0, sinMarcar: 2 },
    ] },
  ]);
  equal(r.turnos.length, 2, 'dos turnos (Ocio no cuenta)');
  equal(r.turnos[0].ff.previsto, 10, 'FF previsto 9:45');
  equal(r.turnos[0].ff.real, 9, 'FF real 9:45');
  equal(r.turnos[0].corporate.real, 3, 'Corporate real 9:45');
  equal(r.turnos[0].modalidades.join('+'), 'Baby+Intensivos', 'modalidades juntas');
  equal(r.turnos[1].sinPista, 2, 'sin pista');
  equal(r.total.ff.real, 9, 'total FF real');
  equal(r.total.sinMarcar, 3, 'sin marcar');
  equal(textoWhatsappForfaits('Sábado 21/11', r),
    'FF / Corporate · Sábado 21/11\n09:45–11:45 (Baby + Intensivos): FF 9 · Corporate 3\n12:00–14:00 (Baby): FF 0 · Corporate 0\nTotal día: FF 9 · Corporate 3', 'mensaje');
  equal(avisosForfaits(r).length, 2, 'avisos');
  equal(avisosForfaits(calcularForfaitsDia([])).length, 0, 'sin avisos');
});
