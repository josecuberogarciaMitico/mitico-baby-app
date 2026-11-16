import { calidadPorEntrenador, calidadReporte, fallosDe, semaforoDe } from '../../../src/features/reports/calidadReportes';
import { faltaJustificacionTodoConsigue, notaSuficiente, prepararEnvioReporteFocos } from '../../../src/lib/adaptiveReport';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const todoOk = { cuna_frenada: 'Consolidado', control_velocidad: 'Consolidado' };

test('calidad: todo «Lo consigue» sin nada escrito = poco detallado', () => {
  equal(faltaJustificacionTodoConsigue(todoOk, {}, ''), true, 'sin nada');
  equal(faltaJustificacionTodoConsigue(todoOk, { cuna_frenada: 'Frena bien en la cuña al final de la bajada' }, ''), false, 'con una nota');
  equal(faltaJustificacionTodoConsigue(todoOk, {}, 'Muy buen día, frena solo en toda la pista'), false, 'con observación');
  equal(faltaJustificacionTodoConsigue(todoOk, { cuna_frenada: 'Frena bien en la cuña' }, ''), true, 'una nota corta no basta');
  equal(faltaJustificacionTodoConsigue(todoOk, { cuna_frenada: 'ok' }, 'bien'), true, 'textos demasiado cortos no cuentan');
  equal(faltaJustificacionTodoConsigue({ cuna_frenada: 'Consolidado', direccion_giro: 'En desarrollo' }, {}, ''), false, 'no todo consigue');
  equal(faltaJustificacionTodoConsigue({ cuna_frenada: 'Consolidado', direccion_giro: 'No trabajado' }, {}, ''), true, '«No trabajado» no cuenta');
  equal(faltaJustificacionTodoConsigue({}, {}, ''), false, 'sin valorar no aplica');
});

test('calidad: el entrenador no puede enviar todo «Lo consigue» sin escribir nada', () => {
  const form = {
    nivel: 'A', actitud: 'Buena', autonomia: 'Necesita ayuda puntual', incidencia: 'Sin incidencia',
    observaciones: '', remontes: '', cunaFrenada: '', giroInicial: '',
    evaluacionTecnica: { cuna_frenada: 'Consolidado', control_velocidad: 'Consolidado', direccion_giro: 'Consolidado' } as never,
  };
  const r = prepararEnvioReporteFocos(form, 'A');
  equal(r.ok, false, 'bloqueado');
  if (!r.ok) equal(r.error.includes('Lo consigue'), true, 'explica el motivo');
  equal(prepararEnvioReporteFocos({ ...form, notasHabilidades: { cuna_frenada: 'Frena en cuña él solo en toda la bajada' } }, 'A').ok, true, 'con una nota sí');
  equal(prepararEnvioReporteFocos({ ...form, observaciones: 'Ha bajado todo el día solo y sin caerse' }, 'A').ok, true, 'con observación sí');
});

test('calidad: letras y observación de un reporte', () => {
  const c = calidadReporte({ reporte_id: 'r', fecha: '2026-11-15', entrenador: 'X', evaluacion_tecnica: todoOk, notas_habilidades: { cuna_frenada: '12345' }, observaciones: 'Ha bajado solo toda la mañana sin caerse' });
  equal(c.letras, 45, 'letras');
  equal(c.conObservacion, true, 'observación');
  equal(c.todoConsigue, true, 'todo consigue');
  equal(c.pocoDetallado, false, 'tiene observación');
  equal(calidadReporte({ reporte_id: 'r', fecha: '2026-11-15', entrenador: 'X', evaluacion_tecnica: null }).pocoDetallado, false, 'sin evaluación no se marca');
});

test('calidad: semáforo', () => {
  const p = (reportes: number, pct: number, letras: number, extra: Partial<{ faltan: number; pctTarde: number; pctIgualGrupo: number }> = {}) => ({
    reportes, pocoDetallados: 0, pctPocoDetallados: pct, letrasMedia: letras, pctConObservacion: 0, faltan: 0, pctTarde: 0, pctIgualGrupo: 0, ...extra,
  });
  equal(semaforoDe(p(3, 100, 0)), 'sin_datos', 'poca muestra');
  equal(semaforoDe(p(10, 50, 200)), 'rojo', 'muchos poco detallados');
  equal(semaforoDe(p(10, 0, 20)), 'rojo', 'casi no escribe');
  equal(semaforoDe(p(10, 20, 200)), 'amarillo', 'algunos');
  equal(semaforoDe(p(10, 0, 60)), 'amarillo', 'escribe poco');
  equal(semaforoDe(p(10, 10, 120)), 'verde', 'bien');
  equal(semaforoDe(p(10, 0, 200, { pctTarde: 50 })), 'amarillo', 'rellena tarde');
  equal(semaforoDe(p(10, 0, 200, { pctIgualGrupo: 30 })), 'amarillo', 'igual a todo el grupo');
  equal(semaforoDe(p(10, 0, 200, { faltan: 3 })), 'amarillo', 'le faltan');
  equal(semaforoDe(p(0, 0, 0, { faltan: 4 })), 'rojo', 'no hace ninguno y le faltan');
});

test('calidad: en qué falla, en frases', () => {
  const p = (o: object) => ({ reportes: 10, pocoDetallados: 0, pctPocoDetallados: 0, letrasMedia: 200, pctConObservacion: 0, faltan: 0, pctTarde: 0, pctIgualGrupo: 0, ...o });
  equal(fallosDe(p({}), p({}), false).length, 0, 'sin fallos');
  const f = fallosDe(p({ pocoDetallados: 5, pctPocoDetallados: 50, letrasMedia: 28, faltan: 3, pctTarde: 60, pctIgualGrupo: 25 }), p({ letrasMedia: 200 }), true);
  equal(f[0], 'Marca todo «Lo consigue» sin escribir nada en 5 de 10 reportes (50%).', 'primero la calidad');
  equal(f[1], 'Va a menos: ahora escribe 28 letras por reporte; antes 200.', 'va a menos');
  equal(f[f.length - 1], 'Le faltan 3 reportes por hacer.', 'al final lo que falta');
  equal(fallosDe(p({ reportes: 0, faltan: 4 }), p({}), false)[0], 'Le faltan 4 reportes por hacer.', 'sin reportes, solo lo que falta');
  equal(f.some((x) => x.includes('misma valoración')), true, 'igual al grupo');
  equal(f.some((x) => x.startsWith('Rellena tarde')), true, 'tarde');
  equal(fallosDe(p({ letrasMedia: 50 }), p({}), false)[0], 'Escribe poco: 50 letras de media por reporte.', 'escribe poco');
});

test('calidad: por entrenador, reciente frente a antes y «va a menos»', () => {
  const nota = (n: number) => ({ cuna_frenada: 'Frena bien y gira con control. '.repeat(10).slice(0, n) });
  const filas = [
    // Sergio: antes escribía mucho, ahora casi nada y varios «todo consigue» vacíos.
    ...['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'].map((fecha, i) => ({ reporte_id: `s${i}`, fecha, entrenador: 'SERGIO', evaluacion_tecnica: { cuna_frenada: 'En desarrollo' }, notas_habilidades: nota(200) })),
    ...['2026-11-10', '2026-11-12', '2026-11-14', '2026-11-15'].map((fecha, i) => ({ reporte_id: `t${i}`, fecha, entrenador: 'SERGIO', alumno: `N${i}`, evaluacion_tecnica: todoOk, notas_habilidades: {} })),
    { reporte_id: 't9', fecha: '2026-11-16', entrenador: 'SERGIO', evaluacion_tecnica: { cuna_frenada: 'En desarrollo' }, notas_habilidades: nota(20) },
    // Ana: bien.
    ...['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-13'].map((fecha, i) => ({ reporte_id: `a${i}`, fecha, entrenador: 'ANA', evaluacion_tecnica: todoOk, notas_habilidades: nota(150) })),
    // Pendiente (sin reporte_id) y sin entrenador: no cuentan.
    { reporte_id: null, fecha: '2026-11-15', entrenador: 'ANA' },
    { reporte_id: 'z', fecha: '2026-11-15', entrenador: null },
  ];
  const r = calidadPorEntrenador(filas, '2026-11-16');
  equal(r.length, 2, 'dos entrenadores');
  equal(r[0].entrenador, 'SERGIO', 'el peor primero');
  equal(r[0].semaforo, 'rojo', 'Sergio en rojo');
  equal(r[0].reciente.reportes, 5, '14 días');
  equal(r[0].reciente.pocoDetallados, 4, 'cuatro vacíos');
  equal(r[0].anterior.reportes, 4, 'antes');
  equal(r[0].vaAMenos, true, 'va a menos');
  equal(r[0].ejemplos[0].fecha, '2026-11-15', 'ejemplos del más nuevo');
  equal(r[1].semaforo, 'verde', 'Ana verde');
  equal(r[1].reciente.reportes, 4, 'pendiente no cuenta');
  equal(r[0].fallos.some((x) => x.startsWith('Va a menos')), true, 'Sergio: va a menos');
});

test('calidad: faltan, tarde e igual a todo el grupo', () => {
  const ok = { cuna_frenada: 'En desarrollo' };
  const nota = { cuna_frenada: 'Frena bien y gira con control. '.repeat(5) };
  const filas = [
    // Mismo grupo, misma valoración a los 3 niños, enviados dos días después.
    ...[1, 2, 3].map((i) => ({ reporte_id: `g${i}`, estado: 'Hecho', fecha: '2026-11-13', grupo_id: 'G1', enviado_at: '2026-11-15T09:00:00Z', entrenador: 'LUIS', evaluacion_tecnica: ok, notas_habilidades: nota })),
    // Al día siguiente: normal, no cuenta como tarde.
    { reporte_id: 'g4', estado: 'Hecho', fecha: '2026-11-15', grupo_id: 'G2', enviado_at: '2026-11-16T13:00:00Z', entrenador: 'LUIS', evaluacion_tecnica: ok, notas_habilidades: nota },
    // Faltas: 3 de días pasados (cuentan), 1 de hoy (no cuenta), 1 antigua (no cuenta).
    ...['2026-11-10', '2026-11-11', '2026-11-12', '2026-11-16', '2026-10-01'].map((fecha) => ({ reporte_id: null, estado: 'Falta reporte', fecha, entrenador: 'LUIS' })),
    { reporte_id: null, estado: 'Asistencia sin confirmar', fecha: '2026-11-12', entrenador: 'LUIS' },
  ];
  const [luis] = calidadPorEntrenador(filas, '2026-11-16');
  equal(luis.reciente.faltan, 3, 'faltan');
  equal(luis.reciente.pctTarde, 75, 'tarde');
  equal(luis.reciente.pctIgualGrupo, 75, 'igual al grupo');
  equal(luis.semaforo, 'amarillo', 'amarillo');
  equal(luis.fallos.length, 3, 'tres fallos');
});

test('notas: mínimo 30 letras y 5 palabras, y sin copiar la misma en dos habilidades', () => {
  equal(notaSuficiente('No siempre gira'), false, 'demasiado corta');
  equal(notaSuficiente('Le cuesta mantener la posición de cuña'), true, 'bien');
  equal(notaSuficiente('................................'), false, 'puntos no valen');
  equal(notaSuficiente('aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa'), false, 'una sola palabra no vale');
  equal(notaSuficiente('a a a a a a a a a a a a a a a a a'), false, 'letras sueltas no son palabras');
  const form = {
    nivel: 'A', actitud: 'Buena', autonomia: 'Necesita ayuda puntual', incidencia: 'Sin incidencia',
    observaciones: '', remontes: '', cunaFrenada: '', giroInicial: '',
    evaluacionTecnica: { cuna_frenada: 'En desarrollo', direccion_giro: 'Necesita mejorar' } as never,
  };
  const corta = prepararEnvioReporteFocos({ ...form, notasHabilidades: { cuna_frenada: 'No siempre la realiza', direccion_giro: 'No controla la dirección cuando coge velocidad' } }, 'A');
  equal(corta.ok, false, 'nota corta bloquea');
  if (!corta.ok) equal(corta.error.includes('5 palabras'), true, 'dice el mínimo');
  const copia = 'Le cuesta mucho todavía, hay que repetir con el monitor';
  const repetida = prepararEnvioReporteFocos({ ...form, notasHabilidades: { cuna_frenada: copia, direccion_giro: copia.toUpperCase() + '.' } }, 'A');
  equal(repetida.ok, false, 'misma nota en dos habilidades bloquea');
  if (!repetida.ok) equal(repetida.error.includes('misma nota'), true, 'explica por qué');
  equal(prepararEnvioReporteFocos({ ...form, notasHabilidades: { cuna_frenada: 'Le cuesta mantener la cuña al final de la bajada', direccion_giro: 'No controla la dirección cuando coge velocidad' } }, 'A').ok, true, 'notas buenas pasan');
});
