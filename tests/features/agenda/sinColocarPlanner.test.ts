import {
  detectarHermanos,
  esFinDeSemana,
  gruposParaElegir,
  planificarSinColocar,
  type AlumnoPlan,
  type GrupoPlan,
  type SesionPlan,
} from '../../../src/features/agenda/sinColocarPlanner';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const S = (id: string, fecha: string, ini: string, modalidad = 'BABY'): SesionPlan => ({
  sesionId: id, fecha, hora_inicio: `${ini}:00`, hora_fin: '23:00:00', modalidad,
});
const G = (sesionId: string, grupoId: string, nivel: string, total: number, pista = 'Pequeña', entrenadores = 1): GrupoPlan => ({
  sesionId, grupoId, nombre: `Grupo ${grupoId}`, nivelGrupo: nivel, alumnosLista: '', pista, total, entrenadores, publicado: false,
});
const A = (id: string, nombre: string, sesionId: string, nivel: string | null = 'B', estado = 'CONOCIDO'): AlumnoPlan => ({
  sesionAlumnoId: `sa-${id}`, alumnoId: id, alumno: nombre, sesionId, nivel, estado,
});

const sesiones = [
  S('vie', '2026-10-30', '18:00'),
  S('sab1', '2026-10-31', '09:45'),
  S('sab2', '2026-10-31', '12:00'),
  S('dom1', '2026-11-01', '09:45'),
];

test('fin de semana', () => {
  equal(esFinDeSemana('2026-10-31'), true, 'sábado');
  equal(esFinDeSemana('2026-11-01'), true, 'domingo');
  equal(esFinDeSemana('2026-10-30'), false, 'viernes');
});

test('hermanos: mismo teléfono y apellido; no basta el teléfono', () => {
  const h = detectarHermanos(
    [
      { alumnoId: 'a', alumno: 'ANA LOPEZ GARCIA' },
      { alumnoId: 'b', alumno: 'PABLO LOPEZ GARCIA' },
      { alumnoId: 'c', alumno: 'MARTA RUIZ SANZ' },
    ],
    { a: '+34 600 111 222', b: '600111222', c: '600111222' }
  );
  equal((h.a || []).join(), 'b', 'a-b hermanos');
  equal(h.c, undefined, 'c comparte teléfono pero no apellido');
});

test('se queda en su turno si hay hueco de su nivel', () => {
  const plan = planificarSinColocar({
    sesiones,
    grupos: [G('sab2', 'g1', 'B', 2), G('sab1', 'g2', 'B', 1)],
    pendientes: [A('x', 'JORGE LOPEZ LOPEZ', 'sab2')],
    listados: [A('x', 'JORGE LOPEZ LOPEZ', 'sab2')],
    colocados: new Set(),
    telefonos: {},
  });
  equal(plan[0].propuesta!.sesion.sesionId, 'sab2', 'mismo turno');
  equal(plan[0].propuesta!.mismoTurno, true, 'marcado mismo turno');
});

test('grupo lleno: propone otro turno del fin de semana, no el viernes', () => {
  const plan = planificarSinColocar({
    sesiones,
    grupos: [G('sab2', 'g1', 'B', 4), G('vie', 'g3', 'B', 1), G('dom1', 'g4', 'B', 2)],
    pendientes: [A('x', 'JORGE LOPEZ LOPEZ', 'sab2')],
    listados: [A('x', 'JORGE LOPEZ LOPEZ', 'sab2')],
    colocados: new Set(),
    telefonos: {},
  });
  equal(plan[0].propuesta!.sesion.sesionId, 'dom1', 'domingo antes que viernes');
  const viernes = plan[0].opciones.find((o) => o.sesion.sesionId === 'vie')!;
  equal(viernes.estado, 'REVISAR', 'viernes queda para revisar');
});

test('hermano colocado en su mismo turno: no se le separa sin avisar', () => {
  const plan = planificarSinColocar({
    sesiones,
    grupos: [G('sab2', 'g1', 'B', 4), G('dom1', 'g2', 'B', 1)],
    pendientes: [A('x', 'ANA LOPEZ GARCIA', 'sab2')],
    listados: [A('x', 'ANA LOPEZ GARCIA', 'sab2'), A('y', 'PABLO LOPEZ GARCIA', 'sab2')],
    colocados: new Set(['y']),
    telefonos: { x: '600111222', y: '600111222' },
  });
  equal(plan[0].hermanos.length, 1, 'detecta hermano');
  equal(plan[0].propuesta, null, 'no propone separarlos');
  const dom = plan[0].opciones.find((o) => o.sesion.sesionId === 'dom1')!;
  equal(dom.estado, 'REVISAR', 'mover solo a uno = revisar');
  equal(dom.avisos[0].startsWith('Separa de su hermano'), true, 'avisa');
});

test('hermano apuntado a otro turno por los padres: solo se informa', () => {
  const plan = planificarSinColocar({
    sesiones,
    grupos: [G('sab2', 'g1', 'B', 1), G('sab1', 'g2', 'B', 1)],
    pendientes: [A('x', 'ANA LOPEZ GARCIA', 'sab2')],
    listados: [A('x', 'ANA LOPEZ GARCIA', 'sab2'), A('y', 'PABLO LOPEZ GARCIA', 'sab1')],
    colocados: new Set(['y']),
    telefonos: { x: '600111222', y: '600111222' },
  });
  equal(plan[0].hermanos.length, 1, 'se enseña el hermano');
  equal(plan[0].propuesta!.sesion.sesionId, 'sab2', 'se queda en su turno');
});

test('hermanos sin colocar en el mismo turno van juntos y no se pisan el hueco', () => {
  const plan = planificarSinColocar({
    sesiones,
    grupos: [G('sab2', 'g1', 'B', 3), G('sab2', 'g5', 'B', 1)],
    pendientes: [A('x', 'ANA LOPEZ GARCIA', 'sab2'), A('y', 'PABLO LOPEZ GARCIA', 'sab2')],
    listados: [A('x', 'ANA LOPEZ GARCIA', 'sab2'), A('y', 'PABLO LOPEZ GARCIA', 'sab2')],
    colocados: new Set(),
    telefonos: { x: '600111222', y: '600111222' },
  });
  equal(plan.length, 1, 'una sola fila para los dos');
  equal(plan[0].miembros.length, 2, 'dos miembros');
  const p = plan[0].propuesta!;
  equal(p.colocaciones.length, 2, 'los dos colocados');
  equal(p.colocaciones.every((c) => c.totalFinal <= c.maximo), true, 'ninguno pasa del ratio');
});

test('dos niños sueltos no reciben el mismo último hueco', () => {
  const plan = planificarSinColocar({
    sesiones,
    grupos: [G('sab2', 'g1', 'B', 3)],
    pendientes: [A('x', 'JORGE UNO DOS', 'sab2'), A('y', 'LUIS TRES CUATRO', 'sab2')],
    listados: [A('x', 'JORGE UNO DOS', 'sab2'), A('y', 'LUIS TRES CUATRO', 'sab2')],
    colocados: new Set(),
    telefonos: {},
  });
  equal(plan.filter((u) => u.propuesta).length, 1, 'solo uno entra en el hueco');
});

test('nuevo pendiente de test o sin nivel: bloqueado, sin propuesta', () => {
  const plan = planificarSinColocar({
    sesiones,
    grupos: [G('sab2', 'g1', 'B', 1)],
    pendientes: [A('x', 'NUEVO UNO', 'sab2', null, 'PENDIENTE_TEST'), A('y', 'SIN NIVEL', 'sab2', null)],
    listados: [],
    colocados: new Set(),
    telefonos: {},
  });
  equal(plan.every((u) => u.bloqueo && !u.propuesta), true, 'bloqueados');
});

test('Ocio: solo su propio turno', () => {
  const s = [S('o1', '2026-10-31', '12:00', 'OCIO'), S('o2', '2026-11-01', '12:00', 'OCIO')];
  const plan = planificarSinColocar({
    sesiones: s,
    grupos: [G('o1', 'g1', 'B', 4), G('o2', 'g2', 'B', 1)],
    pendientes: [A('x', 'JORGE LOPEZ LOPEZ', 'o1')],
    listados: [],
    colocados: new Set(),
    telefonos: {},
  });
  equal(plan[0].opciones.every((o) => o.sesion.sesionId === 'o1'), true, 'no propone otro turno');
});

test('mover a mano: lista todos los grupos con su encaje', () => {
  const lista = gruposParaElegir(A('x', 'JORGE', 'sab2'), sesiones, [G('sab2', 'g1', 'B', 4), G('dom1', 'g4', 'D', 1)], true);
  equal(lista.length, 2, 'todos');
  equal(lista[0].estado, 'NO_ENCAJA', 'lleno');
});

test('nivel dentro del rango que ya tiene el grupo (B+ en un grupo B/C): encaja', () => {
  const g = { ...G('sab1', 'g9', 'B / C', 4, 'Grande'), alumnosLista: 'X · B · Grande || Y · C · Grande' };
  const lista = gruposParaElegir(A('x', 'AYDI', 'sab1', 'B+'), sesiones, [g], true);
  equal(lista[0].estado, 'RECOMENDADO', 'encaja');
  const fuera = gruposParaElegir(A('y', 'TERE', 'sab1', 'INICIACION'), sesiones, [g], true);
  equal(fuera[0].estado, 'NO_ENCAJA', 'iniciación sigue sin encajar');
});

test('caso real: hermanos del viernes (B+ e iniciación) → sábado 09:45 encaja', () => {
  const plan = planificarSinColocar({
    sesiones,
    grupos: [
      { ...G('vie', 'v1', 'A / INICIACION', 4), alumnosLista: '' },
      { ...G('vie', 'v2', 'INICIACION', 4), alumnosLista: '' },
      { ...G('sab1', 's3', 'B / C', 4, 'Grande'), alumnosLista: 'X · B · Grande || Y · C · Grande' },
      { ...G('sab1', 's2', 'INICIACION', 3), alumnosLista: '' },
    ],
    pendientes: [A('a', 'AYDI SANCHEZ JIMENEZ', 'vie', 'B+'), A('t', 'TERESA SANCHEZ JIMENEZ', 'vie', 'INICIACION')],
    listados: [A('a', 'AYDI SANCHEZ JIMENEZ', 'vie', 'B+'), A('t', 'TERESA SANCHEZ JIMENEZ', 'vie', 'INICIACION')],
    colocados: new Set(),
    telefonos: { a: '600111222', t: '600111222' },
  });
  equal(plan.length, 1, 'una familia');
  equal(plan[0].propuesta!.sesion.sesionId, 'sab1', 'sábado 09:45');
  equal(plan[0].propuesta!.estado, 'RECOMENDADO', 'encaja');
});
