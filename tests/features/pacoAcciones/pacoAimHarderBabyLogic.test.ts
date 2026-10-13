import {
  accionables,
  planAmbiguo,
  planificarTurno,
  semanaDesdeMensaje,
  semanaValida,
  textoResultado,
  textoVistaPrevia,
  type SesionExistente,
  type TurnoAimHarder,
} from '../../../src/features/pacoAcciones/pacoAimHarderBabyLogic';

function equal<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: esperado ${e}, recibido ${a}`);
}
function ok(valor: unknown, label: string) {
  if (!valor) throw new Error(`${label}: se esperaba verdadero`);
}
function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

const HOY = '2026-10-13'; // martes
const turno = (nombres: string[], extra: Partial<TurnoAimHarder> = {}): TurnoAimHarder => ({
  fecha: '2026-10-22',
  inicio: '17:00',
  fin: '18:00',
  nombres,
  cancelados: [],
  safeZero: false,
  ...extra,
});
const sesion = (nombres: string[]): SesionExistente => ({
  sesion_id: 's1',
  fecha: '2026-10-22',
  inicio: '17:00',
  fin: '18:00',
  roster: nombres.map((name, i) => ({ id: `a${i}`, name })),
});

test('semana: esta / próxima / que viene / fecha / sin decir', () => {
  equal(semanaDesdeMensaje('carga esta semana de aimharder', HOY).semana, '2026-10-12', 'esta');
  equal(semanaDesdeMensaje('carga la semana que viene de aimharder', HOY).semana, '2026-10-19', 'que viene');
  equal(semanaDesdeMensaje('vuelca la próxima semana', HOY).semana, '2026-10-19', 'próxima');
  equal(semanaDesdeMensaje('carga la semana del 26 de octubre', HOY).semana, '2026-10-26', 'fecha');
  equal(semanaDesdeMensaje('carga aimharder', HOY).semana, null, 'sin decir');
  ok(semanaDesdeMensaje('carga la próxima semana de ocio', HOY).esOcio, 'ocio');
  ok(!semanaDesdeMensaje('carga la próxima semana de baby y ocio', HOY).esOcio, 'baby y ocio no es solo ocio');
});

test('semanaValida solo acepta lunes razonables', () => {
  equal(semanaValida('2026-10-19', HOY), '2026-10-19', 'lunes');
  equal(semanaValida('2026-10-20', HOY), null, 'martes');
  equal(semanaValida('2020-01-06', HOY), null, 'muy antigua');
  equal(semanaValida('basura', HOY), null, 'basura');
});

test('turno que no existe: crear (y vacío si AimHarder no trae a nadie)', () => {
  const p = planificarTurno(turno(['Lucía García', 'Mateo Pérez']), null, new Map([['LUCIA GARCIA', 'conocido']]));
  equal(p.estado, 'crear', 'crear');
  equal(p.desconocidos, ['Mateo Pérez'], 'desconocidos');
  equal(planificarTurno(turno([]), null).estado, 'vacio', 'vacío');
  equal(planificarTurno(turno(['Ana Ruiz', 'ana ruiz']), null).estado, 'revisar', 'duplicados');
});

test('turno existente: añadir / al día / revisar', () => {
  equal(planificarTurno(turno(['Ana Ruiz', 'Pablo Gil']), sesion(['Ana Ruiz'])).estado, 'anadir', 'añadir');
  equal(planificarTurno(turno(['Ana Ruiz', 'Pablo Gil']), sesion(['Ana Ruiz'])).anadir, ['Pablo Gil'], 'a quién');
  equal(planificarTurno(turno(['ANA RUIZ']), sesion(['Ana Ruiz'])).estado, 'al_dia', 'al día aunque cambie mayúsculas');
  const sinCancelar = planificarTurno(turno(['Ana Ruiz']), sesion(['Ana Ruiz', 'Hugo Lara']));
  equal(sinCancelar.estado, 'revisar', 'falta Hugo sin cancelación');
  const conCancelar = planificarTurno(turno(['Ana Ruiz'], { cancelados: ['Hugo Lara'] }), sesion(['Ana Ruiz', 'Hugo Lara']));
  equal(conCancelar.estado, 'revisar', 'aun con cancelación justificada, Paco NO retira');
  ok(conCancelar.motivos.join(' ').includes('Refrescar listado'), 'manda a la Agenda');
  equal(planificarTurno(turno([]), sesion(['Ana Ruiz'])).estado, 'revisar', '0 activos sin acreditar');
});

test('accionables solo crear/añadir; ambiguo nunca', () => {
  const planes = [
    planificarTurno(turno(['A Uno', 'B Dos']), null),
    planificarTurno(turno(['A Uno', 'B Dos']), sesion(['A Uno', 'B Dos'])),
    planAmbiguo(turno(['A Uno']), 2),
  ];
  equal(accionables(planes).length, 1, 'solo el nuevo');
  equal(planes[2].estado, 'revisar', 'ambiguo');
});

test('textos: la vista previa avisa y el resultado marca omitidos', () => {
  const planes = [planificarTurno(turno(['A Uno', 'B Dos']), null, new Map())];
  const t = textoVistaPrevia('2026-10-19', planes, ['aviso x'], true);
  ok(t.includes('Todavía no he cambiado nada') && t.includes('pendientes de Alta/Test') && t.includes('aviso x') && t.includes('¿Lo cargo?'), t);
  const r = textoResultado('2026-10-19', [
    { clave: 'a', etiqueta: 'jue', resultado: 'creado', detalle: 'ok' },
    { clave: 'b', etiqueta: 'vie', resultado: 'omitido', detalle: 'cambió' },
  ]);
  ok(r.includes('1 turno(s) cargado(s)') && r.includes('Omitidos por seguridad'), r);
});
