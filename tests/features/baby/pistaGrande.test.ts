import { aplicarCinturonPedagogicoAutomaticoAgenda } from '../../../src/features/baby/babyRecommendation';
import type { PreparadoGrande } from '../../../src/features/baby/pistaGrandeCache';
import type { AgendaRecomendacionSesionApp } from '../../../src/features/agenda/agendaTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function ok(c: boolean, label: string) { if (!c) throw new Error(label); }
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const nino = (id: string, nivel: string) => ({ alumno_id: id, alumno: id.toUpperCase(), nivel_resumen: nivel, alertas: null } as unknown as AgendaRecomendacionSesionApp);
const prep = (id: string, estado: 'listo' | 'casi'): PreparadoGrande => ({ alumno_id: id, alumno: id, estado, motivo: 'motivo', fecha: '2026-11-08', fuente: 'habilidades' });

test('recomendador: A+ listos para la grande van juntos', () => {
  const data = ['a1', 'a2', 'a3', 'a4', 'a5'].map((id) => nino(id, 'A+')).concat([nino('b1', 'B'), nino('b2', 'B')]);
  const preparados = new Map([['a1', prep('a1', 'listo')], ['a2', prep('a2', 'listo')], ['a3', prep('a3', 'casi')]]);
  const out = aplicarCinturonPedagogicoAutomaticoAgenda(data, { preparadosGrande: preparados });
  const grupoDe = (id: string) => out.find((r) => r.alumno_id === id)?.grupo_recomendado || '';
  ok(grupoDe('a1').includes('listos para la grande') && grupoDe('a1') === grupoDe('a2'), 'a1 y a2 juntos en el grupo de la grande');
  ok(!grupoDe('a3').includes('listos'), 'el «casi» se queda con su A+');
  equal(out.find((r) => r.alumno_id === 'a1')?.pista_recomendada, 'Grande', 'pista grande');
  ok(String(out.find((r) => r.alumno_id === 'a3')?.alertas).includes('Casi listo para la grande'), 'etiqueta casi');
  equal(out.length, data.length, 'nadie se pierde');
});

test('recomendador: con un solo listo no se hace grupo aparte', () => {
  const data = ['a1', 'a2', 'a3'].map((id) => nino(id, 'A+'));
  const out = aplicarCinturonPedagogicoAutomaticoAgenda(data, { preparadosGrande: new Map([['a1', prep('a1', 'listo')]]) });
  ok(out.every((r) => !String(r.grupo_recomendado).includes('listos')), 'sin grupo aparte');
  ok(String(out.find((r) => r.alumno_id === 'a1')?.alertas).includes('Preparado para la grande'), 'pero lleva la etiqueta');
  const sin = aplicarCinturonPedagogicoAutomaticoAgenda(data, { preparadosGrande: new Map() });
  equal(sin.filter((r) => String(r.alertas || '').includes('grande')).length, 0, 'sin datos, como siempre');
});
