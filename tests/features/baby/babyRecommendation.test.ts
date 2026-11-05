import {
  aplicarCinturonPedagogicoAutomaticoAgenda,
  canStrongBabyBPlusJoinC,
  explicacionCompactaPropuestaBabyApp,
  isBabyTowLiftTransition,
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
