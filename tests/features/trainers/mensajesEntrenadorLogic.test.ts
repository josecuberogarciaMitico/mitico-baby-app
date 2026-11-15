import { resumenDestinos, ultimoRepartoGrupo, vistaReparto, type Reparto } from '../../../src/features/trainers/mensajesEntrenadorLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const r: Reparto = {
  entrenadores: [
    { entrenador_id: 'ana', entrenador: 'ANA LOPEZ', ok_at: '2026-11-16T10:00:00Z', leido_at: null },
    { entrenador_id: 'pedro', entrenador: 'PEDRO RUIZ', ok_at: null, leido_at: null },
  ],
  alumnos: [
    { alumno_id: '1', alumno: 'LUIS', entrenador_id: 'ana', fijo: true },
    { alumno_id: '2', alumno: 'JAIME', entrenador_id: 'pedro', fijo: false },
    { alumno_id: '3', alumno: 'MARTA', entrenador_id: 'ana', fijo: true },
    { alumno_id: '4', alumno: 'HUGO', entrenador_id: 'pedro', fijo: false },
  ],
};

test('reparto: el segundo solo ve libres los niños que no confirmó el primero', () => {
  const v = vistaReparto(r, 'pedro');
  equal(v.fijos.length, 2, 'dos fijos de Ana');
  equal(v.fijos[0].de, 'ANA', 'de quién');
  equal(v.libres.map((a) => a.alumno).join(','), 'JAIME,HUGO', 'libres');
  equal(v.soyUltimo, true, 'Pedro es el último');
});

test('reparto: el primero ve todos y preselecciona los suyos', () => {
  const sinOk: Reparto = { ...r, entrenadores: r.entrenadores.map((e) => ({ ...e, ok_at: null })), alumnos: r.alumnos.map((a) => ({ ...a, fijo: false })) };
  const v = vistaReparto(sinOk, 'ana');
  equal(v.libres.length, 4, 'todos libres');
  equal(v.preseleccion.join(','), '1,3', 'los suyos marcados');
  equal(v.soyUltimo, false, 'no es el último');
  equal(v.companerosPendientes.join(), 'PEDRO', 'falta Pedro');
});

test('resumen para coordinación', () => {
  const destinos = [
    { entrenador_id: 'ana', entrenador: 'ANA', leido_at: 'x', ok_at: 'x' },
    { entrenador_id: 'pedro', entrenador: 'PEDRO', leido_at: null, ok_at: null },
  ];
  equal(resumenDestinos({ tipo: 'texto', destinos, cerrado_at: null }), '1/2 leído', 'texto');
  equal(resumenDestinos({ tipo: 'reparto', destinos, cerrado_at: null }), 'ANA ✓ OK · PEDRO pendiente', 'reparto abierto');
  equal(
    resumenDestinos({ tipo: 'reparto', destinos: destinos.map((d) => ({ ...d, ok_at: 'x' })), cerrado_at: 'x' }),
    '✓ Repartido por los entrenadores',
    'reparto cerrado'
  );
  const enviados = [
    { mensaje_id: 'a', tipo: 'reparto' as const, titulo: '', cuerpo: null, created_at: '2026-11-16T09:00:00Z', grupo_id: 'g', cerrado_at: null, destinos },
    { mensaje_id: 'b', tipo: 'reparto' as const, titulo: '', cuerpo: null, created_at: '2026-11-16T10:00:00Z', grupo_id: 'g', cerrado_at: null, destinos },
  ];
  equal(ultimoRepartoGrupo(enviados, 'g')?.mensaje_id, 'b', 'el último');
  equal(ultimoRepartoGrupo(enviados, 'otro'), null, 'otro grupo');
});
