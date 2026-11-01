import {
  filasPlanSesion,
  resumirTrabajoDiario,
  sesionDeClaveAviso,
  tituloSesion,
} from '../../../src/features/dashboard/sessionPlanLogic';
import { contarRepartoReportes, nombreCortoEntrenador } from '../../../src/features/dashboard/reportSplitLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const TRABAJO_REAL = `CALENTAMIENTO · 3–5 min sin esquís: movilidad, equilibrio y activación sencilla al lado de pista.

OBJETIVO · Consolidar Fundamental: giro todavía con cuña y diagonal estable con esquís paralelos.

ESTADO · PROGRESAR · Consolidar la base y avanzar un paso técnico solo si aparece con control.

PRIMERA BAJADA · Libre/observada para confirmar el nivel y el ritmo real del grupo ese día.

TRABAJO
• Diagonal con esquís paralelos — Giro todavía en cuña, pero diagonal claramente paralela y estable.
• Reducir la cuña progresivamente — Buscar cuña pequeña en la entrada.
  B · Solo reducir un poco la cuña si mantiene frenada y dirección.
• Dos manos a rodilla exterior — Dos manos hacia la rodilla exterior.

CIERRE · Bajada libre.`;

test('saca objetivo, estado y ejercicios del trabajo diario real', () => {
  const r = resumirTrabajoDiario(TRABAJO_REAL);
  equal(r.objetivo, 'Consolidar Fundamental: giro todavía con cuña y diagonal estable con esquís paralelos.', 'objetivo');
  equal(r.estado, 'PROGRESAR', 'estado');
  equal(r.estadoDetalle, 'Consolidar la base y avanzar un paso técnico solo si aparece con control.', 'detalle');
  equal(r.ejercicios.length, 3, 'tres ejercicios (no cuenta el detalle por nivel)');
  equal(r.ejercicios[0], 'Diagonal con esquís paralelos', 'solo el nombre del ejercicio');
  equal(r.ejercicios[2], 'Dos manos a rodilla exterior', 'último');
});

test('sin trabajo diario: todo vacío, no falla', () => {
  const r = resumirTrabajoDiario(null);
  equal(r.objetivo, '', 'objetivo');
  equal(r.estado, '', 'estado');
  equal(r.ejercicios.length, 0, 'ejercicios');
});

test('filas: solo grupos de esas sesiones, ordenadas por modalidad y grupo', () => {
  const g = (sesion_id: string, nombre_grupo: string) => ({
    sesion_id, grupo_id: nombre_grupo, nombre_grupo, nivel_grupo: 'B', entrenador: 'X', entrenador_apoyo: null,
    pista: null, punto_encuentro: null, total_alumnos: 3, publicado: true, trabajo_diario: TRABAJO_REAL,
  });
  const filas = filasPlanSesion(
    [{ sesion_id: 's2', modalidad: 'Ocio' }, { sesion_id: 's1', modalidad: 'Baby' }],
    [g('s2', 'Grupo 2'), g('s1', 'Grupo 10'), g('s1', 'Grupo 2'), g('otra', 'Grupo 1')]
  );
  equal(filas.length, 3, 'sin la otra sesión');
  equal(`${filas[0].modalidad} ${filas[0].nombre_grupo}`, 'Baby Grupo 2', 'Baby primero y Grupo 2 antes que 10');
  equal(filas[2].modalidad, 'Ocio', 'Ocio después');
  equal(filas[0].trabajo.estado, 'PROGRESAR', 'trae el resumen');
});

test('título y clave del aviso', () => {
  equal(tituloSesion('2026-10-31', '09:45:00'), 'Sábado 31/10 · 09:45', 'título');
  const s = sesionDeClaveAviso('resumen-sesion:2026-10-31T09:45');
  equal(s?.fecha, '2026-10-31', 'fecha');
  equal(s?.hora, '09:45', 'hora');
  equal(sesionDeClaveAviso('parte:2026-10-31'), null, 'otra clave');
});

test('reparto de reportes: nombre corto y recuento', () => {
  equal(nombreCortoEntrenador('ALFONSO JORDAN'), 'Alfonso', 'nombre');
  equal(nombreCortoEntrenador(null), 'Entrenador', 'sin nombre');
  const c = contarRepartoReportes([{ entrenador_id: 'a' }, { entrenador_id: 'b' }, { entrenador_id: 'a' }], ['a', 'b']);
  equal(`${c[0]}-${c[1]}`, '2-1', 'recuento');
});
