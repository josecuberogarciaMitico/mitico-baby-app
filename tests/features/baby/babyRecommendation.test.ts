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
