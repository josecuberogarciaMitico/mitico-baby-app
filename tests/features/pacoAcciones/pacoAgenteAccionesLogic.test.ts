import {
  esPropuestaAgente,
  resumenPropuesta,
  type PropuestaAgente,
} from '../../../src/features/pacoAcciones/pacoAgenteAccionesLogic';

function equal<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: esperado ${e}, recibido ${a}`);
}
function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

const A = '11111111-1111-4111-8111-111111111111';
const S = '22222222-2222-4222-8222-222222222222';
const G = '33333333-3333-4333-8333-333333333333';
const G2 = '44444444-4444-4444-8444-444444444444';

const base: PropuestaAgente = {
  tipo: 'incorporar',
  alumno_id: A,
  nombre: 'MAURO PEINADO GUTIERREZ',
  nivel: 'A+',
  sesion_id: S,
  grupo_id: G,
  grupo_origen_id: null,
  grupo: 'Grupo 2 · Nivel A',
  turno: 'sábado 25/10 10:00-12:00',
  etiqueta: 'Meter a MAURO PEINADO en «Grupo 2 · Nivel A» · sábado 25/10 10:00-12:00',
};

test('propuesta de incorporar con ficha es válida', () => {
  equal(esPropuestaAgente(base), true, 'válida');
});

test('alta sin ficha (alumno_id null) es válida', () => {
  equal(esPropuestaAgente({ ...base, alumno_id: null }), true, 'sin ficha');
});

test('cambio de grupo en el mismo turno exige ficha y grupo de origen distinto', () => {
  const mover = { ...base, tipo: 'mover_mismo_turno', grupo_origen_id: G2 };
  equal(esPropuestaAgente(mover), true, 'mover válido');
  equal(esPropuestaAgente({ ...mover, alumno_id: null }), false, 'sin ficha');
  equal(esPropuestaAgente({ ...mover, grupo_origen_id: null }), false, 'sin origen');
  equal(esPropuestaAgente({ ...mover, grupo_origen_id: G }), false, 'mismo grupo');
});

test('rechaza ids, niveles y tipos que no toca', () => {
  equal(esPropuestaAgente({ ...base, grupo_id: 'x' }), false, 'grupo malo');
  equal(esPropuestaAgente({ ...base, sesion_id: `${S}' or 1=1` }), false, 'inyección');
  equal(esPropuestaAgente({ ...base, nivel: 'E' }), false, 'nivel inexistente');
  equal(esPropuestaAgente({ ...base, nivel: 'iniciacion' }), false, 'nivel sin normalizar');
  equal(esPropuestaAgente({ ...base, tipo: 'borrar' }), false, 'tipo desconocido');
  equal(esPropuestaAgente({ ...base, grupo_origen_id: G2 }), false, 'incorporar con origen');
  equal(esPropuestaAgente({ ...base, nombre: '' }), false, 'sin nombre');
  equal(esPropuestaAgente(null), false, 'null');
});

test('resumen para el registro', () => {
  equal(
    resumenPropuesta({ ...base, alumno_id: null }),
    'MAURO PEINADO GUTIERREZ → «Grupo 2 · Nivel A» (sábado 25/10 10:00-12:00) · ficha nueva',
    'resumen'
  );
});
