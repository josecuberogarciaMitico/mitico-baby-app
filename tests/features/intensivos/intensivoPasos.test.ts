import { estadosDiasIntensivo, siguientePasoIntensivo } from '../../../src/features/intensivos/intensivoPasos';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const dias = [
  { intensivo_dia_id: 'd1', numero_dia: 1, fecha: '2026-11-08' },
  { intensivo_dia_id: 'd2', numero_dia: 2, fecha: '2026-11-15' },
  { intensivo_dia_id: 'd3', numero_dia: 3, fecha: '2026-11-22' },
  { intensivo_dia_id: 'd4', numero_dia: 4, fecha: '2026-11-29' },
];
const sinGrupos = () => [];
const base = { alumnos: 17, recuperacionesPendientes: 0, evaluacionesPendientes: 0 };

test('sin grupos: el siguiente paso es crear los grupos de los 4 días', () => {
  const estados = estadosDiasIntensivo(dias, sinGrupos, '2026-10-29');
  equal(estados[0].texto, 'Sin grupos', 'texto');
  const p = siguientePasoIntensivo({ ...base, estados });
  equal(p.tipo, 'crear_grupos', 'tipo');
  equal(p.boton, 'Crear grupos de los 4 días', 'botón');
});

test('propuesta sin confirmar: lo dice', () => {
  const estados = estadosDiasIntensivo(dias, sinGrupos, '2026-10-29');
  equal(siguientePasoIntensivo({ ...base, estados, hayPropuestaSinConfirmar: true }).boton, 'Revisar y confirmar grupos', 'botón');
});

test('grupos sin publicar del próximo día: terminar ese día', () => {
  const g = (id: string) => (id === 'd1' ? [{ publicado: false }, { publicado: true }] : [{ publicado: false }]);
  const estados = estadosDiasIntensivo(dias, g, '2026-10-29');
  equal(estados[0].texto, '2 grupos · sin publicar', 'texto');
  const p = siguientePasoIntensivo({ ...base, estados });
  equal(p.tipo, 'abrir_dia', 'tipo');
  equal('diaId' in p && p.diaId, 'd1', 'día 1');
});

test('día 1 pasado y faltas: primero las recuperaciones', () => {
  const g = () => [{ publicado: true }];
  const estados = estadosDiasIntensivo(dias, g, '2026-11-09');
  equal(estados[0].estado, 'hecho', 'día 1 hecho');
  equal(siguientePasoIntensivo({ ...base, estados, recuperacionesPendientes: 2 }).tipo, 'recuperaciones', 'tipo');
});

test('todo publicado: al día', () => {
  const g = () => [{ publicado: true }];
  const estados = estadosDiasIntensivo(dias, g, '2026-11-09');
  const p = siguientePasoIntensivo({ ...base, estados });
  equal(p.tipo, 'al_dia', 'tipo');
  equal(p.texto, 'Todo al día. Próximo: día 2 (15/11), publicado.', 'texto');
});

test('terminado con evaluaciones pendientes', () => {
  const g = () => [{ publicado: true }];
  const estados = estadosDiasIntensivo(dias, g, '2026-12-01');
  equal(siguientePasoIntensivo({ ...base, estados, evaluacionesPendientes: 3 }).tipo, 'evaluacion', 'tipo');
});

test('faltan fechas o alumnos', () => {
  equal(siguientePasoIntensivo({ ...base, estados: estadosDiasIntensivo(dias.slice(0, 2), sinGrupos, '2026-10-29') }).tipo, 'configurar', 'fechas');
  equal(siguientePasoIntensivo({ ...base, alumnos: 0, estados: estadosDiasIntensivo(dias, sinGrupos, '2026-10-29') }).tipo, 'alumnos', 'alumnos');
});
