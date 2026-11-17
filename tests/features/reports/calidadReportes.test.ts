import { calidadPorEntrenador, calidadPropia, notaEquipoDe, vistaEntrenadorDesde, calidadReporte, consejosDe, fortalezasDe, fallosDe, formatoNota, notaReporte, semaforoDe } from '../../../src/features/reports/calidadReportes';
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

const periodoFalso = (o: object = {}) => ({
  reportes: 10, puntuados: 10, nota: 9, partes: { detalle: 1, concreto: 1, personal: 1, aTiempo: 1 }, faltan: 0, pctTarde: 0, pctIgualGrupo: 0,
  pocoDetallados: 0, pctPocoDetallados: 0, letrasMedia: 200, nTarde: 0, nIgualGrupo: 0, nCortos: 0, letrasPorHabilidad: 120, notaHechos: 9, ...o,
});

test('calidad: nota de 0 a 10 de cada reporte', () => {
  const base = { fecha: '2026-11-15', valoradas: 2, aMejorar: 1, letras: 60, pocoDetallado: false, igualGrupo: false, diasTarde: 0 };
  equal(notaReporte(base)?.total, 10, 'todo bien = 10');
  equal(notaReporte({ ...base, aMejorar: 0, letras: 0, pocoDetallado: true })?.total, 3.5, 'todo «Lo consigue» sin escribir = 3,5');
  equal(notaReporte({ ...base, aMejorar: 2 })?.total, 8.3, '60 letras para dos habilidades a mejorar = medio detalle');
  equal(notaReporte({ ...base, diasTarde: 1 })?.total, 10, 'al día siguiente no resta');
  equal(notaReporte({ ...base, diasTarde: 2 })?.total, 8.8, 'dos días después: la mitad de «a tiempo»');
  equal(notaReporte({ ...base, diasTarde: 5 })?.total, 7.5, 'muy tarde: sin «a tiempo» (pesa 2,5)');
  equal(notaReporte({ ...base, igualGrupo: true })?.total, 9, 'igual que todo el grupo (pesa 1)');
  equal(notaReporte({ ...base, valoradas: 0 }), null, 'sin habilidades valoradas no se puntúa');
});

test('calidad: semáforo por nota', () => {
  equal(semaforoDe(periodoFalso({ reportes: 3, nota: 2 })), 'sin_datos', 'poca muestra');
  equal(semaforoDe(periodoFalso({ nota: 6.2 })), 'rojo', 'menos de 6,5');
  equal(semaforoDe(periodoFalso({ nota: 7.4 })), 'amarillo', 'entre 6,5 y 8');
  equal(semaforoDe(periodoFalso({ nota: 8.6 })), 'verde', '8 o más');
  equal(semaforoDe(periodoFalso({ nota: 9, faltan: 1 })), 'verde', 'el color sale solo de la nota');
  equal(semaforoDe(periodoFalso({ reportes: 0, nota: 0, faltan: 4 })), 'rojo', 'no hace ninguno y le faltan: un 0');
  equal(formatoNota(6.2), '6,2', 'coma decimal');
});

test('calidad: en qué falla (coordinación) y consejos (entrenador)', () => {
  equal(fallosDe(periodoFalso(), periodoFalso(), false).length, 0, 'sin fallos');
  const malo = periodoFalso({ nota: 4.1, notaHechos: 5.3, pocoDetallados: 5, pctPocoDetallados: 50, letrasMedia: 28, faltan: 3, pctTarde: 60, pctIgualGrupo: 25, nTarde: 6, nIgualGrupo: 3, nCortos: 7, partes: { detalle: 0.4, concreto: 0.5, personal: 0.7, aTiempo: 0.4 } });
  const f = fallosDe(malo, periodoFalso({ nota: 8.9 }), true);
  equal(f[0], 'No ha hecho 3 reportes (cuentan como 0 en su nota).', 'primero lo que no ha hecho');
  equal(f[1], 'Marca todo «Lo consigue» sin escribir nada en 5 de 10 reportes (50%).', 'después lo poco detallado');
  equal(f[2], 'Va a menos: su nota ha bajado de 8,9 a 4,1.', 'va a menos');
  equal(f.some((x) => x.startsWith('Escribe poco')), true, 'escribe poco');
  equal(f.some((x) => x.includes('misma valoración')), true, 'igual al grupo');
  equal(f.some((x) => x.startsWith('Rellena tarde')), true, 'tarde');
  equal(fallosDe(periodoFalso({ reportes: 0, faltan: 4 }), periodoFalso(), false)[0], 'No ha hecho 4 reportes (cuentan como 0 en su nota).', 'sin reportes, solo lo que falta');
  const c = consejosDe(malo);
  equal(c.length, 3, 'como mucho tres pasos');
  equal(c[0], 'Completa los 3 reportes pendientes: mientras falten cuentan como 0 (+1,2).', 'primero lo pendiente, con lo que sube');
  equal(c[1].startsWith('En 7 de 10 reportes te quedas corto'), true, 'luego lo que más sube (detalle +1,6), con sus cifras');
  equal(c[2].startsWith('En 5 de 10 reportes marcaste todo «Lo consigue»'), true, 'después «Lo consigue» (+1,2)');
  equal(c.some((x) => /calidad/i.test(x)), false, 'al entrenador no se le habla de «calidad»');
  equal(fortalezasDe(malo).length, 0, 'nada que destacar si todo falla');
  // Va bien (8,6) pero no perfecto: también tiene un siguiente paso, y distinto según sus datos.
  const bueno = periodoFalso({ nota: 8.6, nTarde: 2, pctTarde: 20, partes: { detalle: 0.85, concreto: 1, personal: 1, aTiempo: 0.9 }, nCortos: 3, letrasPorHabilidad: 70 });
  const cb = consejosDe(bueno);
  equal(cb.length, 2, 'dos pasos para el 10');
  equal(cb[0].startsWith('En 3 de 10 reportes te quedas corto'), true, 'lo que más le sube primero (detalle +0,5)');
  equal(cb[1].startsWith('2 de 10 reportes los enviaste'), true, 'después lo de a tiempo (+0,3)');
  equal(fortalezasDe(bueno).join(' | '), 'Siempre explicas lo que has visto cuando un niño lo consigue todo. | 8 de 10 reportes enviados a tiempo. | Valoras a cada niño por separado.', 'puntos fuertes con cifras');
  equal(consejosDe(periodoFalso({ nota: 10 })).length, 0, 'perfecto: sin pasos');
  equal(consejosDe(periodoFalso({ reportes: 0, puntuados: 0, nota: 0, notaHechos: null, faltan: 4 }))[0], 'Completa los 4 reportes pendientes: mientras falten cuentan como 0.', 'sin ningún reporte hecho, también se le dice');
  equal(fortalezasDe(periodoFalso())[0], 'Describes bien lo que les cuesta: 120 letras por habilidad de media.', 'lo que más pesa primero');
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
  equal(r[0].reciente.nota, 4.3, 'nota reciente de Sergio');
  equal(r[0].anterior.nota, 10, 'nota de antes');
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
  equal(luis.reciente.faltan, 3, 'faltan (el de hoy no cuenta todavía)');
  equal(luis.reciente.pctTarde, 75, 'tarde');
  equal(luis.reciente.pctIgualGrupo, 75, 'igual al grupo');
  equal(luis.reciente.nota, 4.8, 'los 3 sin hacer cuentan como 0');
  equal(luis.semaforo, 'rojo', 'rojo');
  equal(luis.fallos.length, 3, 'tres fallos');
});

test('calidad: lo que ve el propio entrenador (su nota y la del equipo)', () => {
  const r = (fecha: string, esMio: boolean, total10: boolean) => ({
    fecha, esMio, valoradas: 2, aMejorar: total10 ? 1 : 0, letras: total10 ? 80 : 0, pocoDetallado: !total10, igualGrupo: false, diasTarde: 0,
  });
  const filas = [
    ...['2026-11-14', '2026-11-15', '2026-11-12', '2026-11-11'].map((f) => r(f, true, false)),
    ...['2026-10-20', '2026-10-21', '2026-10-22', '2026-10-23'].map((f) => r(f, true, true)),
    ...['2026-11-14', '2026-11-15', '2026-11-13', '2026-11-12'].map((f) => r(f, false, true)),
  ];
  const yo = calidadPropia(filas, '2026-11-16');
  equal(yo.reciente.nota, 3.5, 'mi nota');
  equal(yo.anterior.nota, 10, 'antes');
  equal(yo.equipo, 6.8, 'media del equipo (con los míos)');
  const conFalta = calidadPropia([...filas, { ...r('2026-11-13', true, true), esFalta: true }, { ...r('2026-11-15', true, true), esFalta: true }], '2026-11-16');
  equal(conFalta.reciente.faltan, 1, 'la del 15 aún está en margen');
  equal(conFalta.reciente.nota, 2.8, 'la del 13 cuenta como 0');
  equal(yo.semaforo, 'rojo', 'rojo');
  equal(yo.vaAMenos, true, 'va a menos');
  equal(yo.consejos.some((c) => /marcaste todo «Lo consigue»/.test(c)), true, 'consejo principal');
  equal(yo.consejos.some((c) => /calidad/i.test(c)), false, 'sin hablar de «calidad»');
  equal(conFalta.consejos[0].startsWith('Completa el reporte pendiente'), true, 'pendientes primero');
  equal(Array.isArray(yo.fortalezas), true, 'lo que ya hace bien');
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

test('calidad: «ver como lo ve el entrenador» desde el panel', () => {
  const c = (nombre: string, nota: number | null, puntuados: number) => ({
    entrenador: nombre, reciente: periodoFalso({ nota, puntuados, reportes: puntuados }), anterior: periodoFalso(), semaforo: 'verde' as const, vaAMenos: false, fallos: [], ejemplos: [],
  });
  equal(notaEquipoDe([c('A', 4, 10), c('B', 10, 30), c('C', null, 0)]), 8.5, 'media ponderada por reportes');
  equal(notaEquipoDe([]), null, 'sin datos');
  const v = vistaEntrenadorDesde(c('A', 4, 10), 8.5);
  equal(v.equipo, 8.5, 'lleva la media del equipo');
  equal(v.reciente.nota, 4, 'su nota');
});
