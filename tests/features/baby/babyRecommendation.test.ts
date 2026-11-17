import {
  aplicarCinturonPedagogicoAutomaticoAgenda,
  canStrongBabyBPlusJoinC,
  explicacionCompactaPropuestaBabyApp,
  isBabyTowLiftTransition,
  tamanosAlineadosConNivel,
  tamanosGruposPedagogicosApp,
} from '../../../src/features/baby/babyRecommendation';
import type { PerfilOperativoAlumnoApp } from '../../../src/core/students/studentTypes';
import type { AgendaRecomendacionSesionApp } from '../../../src/features/agenda/agendaTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

function student(id: string, level: string): AgendaRecomendacionSesionApp {
  return { sesion_id: 's', grupo_recomendado: '', bloque_tecnico: '', pista_recomendada: '',
    alumno_id: id, alumno: id, nivel_resumen: level, pista_alumno: '', orden_en_grupo: 0, alertas: null };
}
function profile(id: string, overrides: Partial<PerfilOperativoAlumnoApp> = {}): PerfilOperativoAlumnoApp {
  return { alumno_id: id, alumno: id, nivel_usado: null, fuerza_nivel: 'ADECUADO',
    ritmo_tendencia: null, confianza_ritmo: null, reportes_ritmo: 0, autonomia_reciente: null,
    remontes_recientes: null, demanda_atencion: 'NORMAL', edad_aprox: null,
    observacion_visible_entrenador: null, mostrar_observacion_entrenador: false,
    aviso_operativo: null, ...overrides };
}

test('solo un B+ con evidencia fuerte puede integrarse funcionalmente con C', () => {
  const bplus = student('a', 'B+');
  equal(canStrongBabyBPlusJoinC(bplus, profile('a', {
    fuerza_nivel: 'MUY_FUERTE', confianza_ritmo: 'ALTA', autonomia_reciente: 'Autónomo total en pista grande',
  })), true, 'evidencia suficiente');
  equal(canStrongBabyBPlusJoinC(bplus, profile('a', {
    fuerza_nivel: 'MUY_FUERTE', confianza_ritmo: 'ALTA', autonomia_reciente: 'Autónomo total', demanda_atencion: 'ALTA',
  })), false, 'demanda alta');
});

test('A+ o B sin percha consolidada queda marcado como transición', () => {
  equal(isBabyTowLiftTransition(student('a', 'A+'), profile('a', {
    remontes_recientes: ['Cinta'], autonomia_reciente: 'Necesita ayuda en llano',
  })), true, 'transición');
  equal(isBabyTowLiftTransition(student('b', 'C'), profile('b')), false, 'C no es transición');
});

test('grupo de transición reserva tres plazas en ratio conservador', () => {
  const students = ['a', 'b', 'c', 'd', 'e'].map((id) => student(id, 'A+'));
  const profiles = students.map((item, index) => profile(item.alumno_id, index < 3
    ? { autonomia_reciente: 'Necesita ayuda', remontes_recientes: ['Cinta'] }
    : { fuerza_nivel: 'FUERTE', remontes_recientes: ['Percha'] }));
  const result = aplicarCinturonPedagogicoAutomaticoAgenda(students, { usarPerfilBaby: true, perfiles: profiles });
  const sizes = new Map<string, number>();
  result.forEach((item) => sizes.set(item.grupo_recomendado, (sizes.get(item.grupo_recomendado) || 0) + 1));
  equal([...sizes.values()].join(','), '2,3', 'tamaños');
  equal(result.some((item) => /percha no consolidada/i.test(item.alertas || '')), true, 'alerta');
});

test('B+ fuerte cambia de banda y deja explicación compacta visible', () => {
  const result = aplicarCinturonPedagogicoAutomaticoAgenda([student('a', 'B+'), student('b', 'B+')], {
    usarPerfilBaby: true,
    perfiles: ['a', 'b'].map((id) => profile(id, { fuerza_nivel: 'MUY_FUERTE', confianza_ritmo: 'MEDIA', remontes_recientes: ['Silla'] })),
  });
  equal(result[0].bloque_tecnico, 'B+ fuerte / C / D', 'banda');
  equal(explicacionCompactaPropuestaBabyApp(result[0]), 'Encaje: B+ fuerte · compatible con C', 'explicación');
});

test('tamaños pedagógicos evitan un grupo unitario', () => {
  equal(tamanosGruposPedagogicosApp(8, 7).join(','), '4,4', 'reparto');
});

// ---- Edad (05/11) ----
function conEdad(id: string, level: string, edad: number | null): AgendaRecomendacionSesionApp {
  return { ...student(id, level), edad };
}
function grupos(result: AgendaRecomendacionSesionApp[]) {
  const m = new Map<string, string[]>();
  result.forEach((r) => m.set(r.grupo_recomendado, [...(m.get(r.grupo_recomendado) || []), r.alumno_id]));
  return [...m.values()].map((ids) => ids.slice().sort().join(''));
}

test('edad: mismo nivel → los grupos salen por edades parecidas (sin perfil, p. ej. Ocio)', () => {
  // 8 niños B (máx. 6 → 4+4). Por nombre saldrían a,b,c,d / e,f,g,h con edades mezcladas.
  const edades: Record<string, number> = { a: 9, b: 5, c: 9, d: 5, e: 9, f: 5, g: 9, h: 5 };
  const data = Object.keys(edades).map((id) => conEdad(id, 'B', edades[id]));
  const g = grupos(aplicarCinturonPedagogicoAutomaticoAgenda(data));
  equal(g.length, 2, 'dos grupos');
  equal(g.includes('bdfh') && g.includes('aceg'), true, 'pequeños juntos y mayores juntos');
});

test('edad: el nivel sigue mandando (no mezcla B con B+ para juntar edades)', () => {
  const data = [
    conEdad('b1', 'B', 5), conEdad('b2', 'B', 9), conEdad('b3', 'B', 5), conEdad('b4', 'B', 9),
    conEdad('p1', 'B+', 5), conEdad('p2', 'B+', 9), conEdad('p3', 'B+', 5), conEdad('p4', 'B+', 9),
  ];
  const g = grupos(aplicarCinturonPedagogicoAutomaticoAgenda(data));
  equal(g.includes('b1b2b3b4') && g.includes('p1p2p3p4'), true, 'B por un lado y B+ por otro, como antes');
});

test('edad: sin edades queda exactamente igual que antes', () => {
  const data = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'].map((id) => conEdad(id, 'B', null));
  const g = grupos(aplicarCinturonPedagogicoAutomaticoAgenda(data));
  equal(g.join('|'), 'abcd|efgh', 'mismo reparto por nombre');
});

test('edad (Baby con perfil): reordena dentro del nivel y respeta los niños con demanda alta', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
  const edades = [9, 5, 9, 5, 9, 5, 9, 5];
  const data = ids.map((id) => student(id, 'C'));
  const perfiles = ids.map((id, i) => profile(id, { edad_aprox: edades[i] }));
  const g = grupos(aplicarCinturonPedagogicoAutomaticoAgenda(data, { usarPerfilBaby: true, perfiles }));
  equal(g.includes('bdfh') && g.includes('aceg'), true, 'por edad');
  // Demanda alta: el reparto especial (normales / demanda alta) no se toca.
  const perfiles2 = ids.map((id, i) => profile(id, { edad_aprox: edades[i], demanda_atencion: i >= 5 ? 'ALTA' : 'NORMAL' }));
  const g2 = grupos(aplicarCinturonPedagogicoAutomaticoAgenda(data, { usarPerfilBaby: true, perfiles: perfiles2 }));
  equal(g2.includes('fgh'), true, 'los 3 de demanda alta siguen juntos');
});

test('B y B+ (Baby): separados si salen los mismos grupos', () => {
  // 6 B+ y 5 B → antes 6+5 con un B+ entre los B; ahora 6 B+ y 5 B.
  const data = [...['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].map((id) => conEdad(id, 'B+', 6)), ...['b1', 'b2', 'b3', 'b4', 'b5'].map((id) => conEdad(id, 'B', 5))];
  const sep = grupos(aplicarCinturonPedagogicoAutomaticoAgenda(data, { esBaby: true }));
  equal(sep.length, 2, 'los mismos dos grupos');
  equal(sep.includes('p1p2p3p4p5p6') && sep.includes('b1b2b3b4b5'), true, 'B+ por un lado y B por otro');
  // Ocio (sin la opción): exactamente como antes.
  const antes = grupos(aplicarCinturonPedagogicoAutomaticoAgenda(data));
  equal(antes.includes('b1b2b3b4b5'), false, 'sin la opción, como antes (mezcla)');
});

test('B y B+ (Baby): si separarlos pide un grupo más, se mezcla lo mínimo y pasa el B de más edad', () => {
  // 3 B+ y 9 B, máx. 6 → 2 grupos. Separar daría 3 grupos, así que un grupo lleva 3 B+ y 3 B.
  const data = [
    ...['p1', 'p2', 'p3'].map((id) => conEdad(id, 'B+', 6.5)),
    conEdad('b1', 'B', 4.5), conEdad('b2', 'B', 4.6), conEdad('b3', 'B', 4.7), conEdad('b4', 'B', 4.8), conEdad('b5', 'B', 4.9),
    conEdad('b6', 'B', 5.0), conEdad('b7', 'B', 6.0), conEdad('b8', 'B', 6.1), conEdad('b9', 'B', 6.2),
  ];
  const g = grupos(aplicarCinturonPedagogicoAutomaticoAgenda(data, { esBaby: true }));
  equal(g.length, 2, 'sin grupo extra');
  equal(g.includes('b7b8b9p1p2p3'), true, 'los B mayores van con los B+');
});

test('tamaños alineados con el nivel', () => {
  equal(tamanosAlineadosConNivel([4, 4, 4, 4, 4, 3, 3, 3, 3, 3, 3], [6, 5], 6).join('+'), '5+6', 'corte justo en el cambio');
  equal(tamanosAlineadosConNivel([4, 4, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3], [6, 6], 6).join('+'), '6+6', 'imposible sin grupo extra: igual');
  equal(tamanosAlineadosConNivel([3, 3, 3, 3, 3, 3], [6], 6).join('+'), '6', 'un solo nivel: igual');
});

test('nombre del grupo (Baby): dice los niveles que hay de verdad', () => {
  const data = [...['p1', 'p2', 'p3', 'p4', 'p5', 'p6'].map((id) => conEdad(id, 'B+', 6)), ...['b1', 'b2', 'b3', 'b4', 'b5'].map((id) => conEdad(id, 'B', 5))];
  const out = aplicarCinturonPedagogicoAutomaticoAgenda(data, { esBaby: true });
  const de = (id: string) => out.find((r) => r.alumno_id === id)!;
  equal(de('p1').grupo_recomendado.endsWith('Nivel B+'), true, 'todos B+: «Nivel B+»');
  equal(de('p1').bloque_tecnico, 'B+', 'bloque B+');
  equal(de('b1').grupo_recomendado.endsWith('Nivel B'), true, 'todos B: «Nivel B»');
  const mezcla = aplicarCinturonPedagogicoAutomaticoAgenda([conEdad('x', 'B+', 6), conEdad('y', 'B', 5), conEdad('z', 'B', 5)], { esBaby: true });
  equal(mezcla[0].grupo_recomendado.endsWith('Nivel B / B+'), true, 'mezclado: «B / B+»');
  // Ocio: como antes.
  equal(aplicarCinturonPedagogicoAutomaticoAgenda(data)[0].bloque_tecnico, 'B / B+', 'Ocio sin cambios');
});
