import {
  estructurarObservacionesGrupo,
  etiquetaDatoObservacion,
  textoDatosObservacion,
} from '../../../src/core/groups/groupObservations';

function equal<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: esperado ${e}, recibido ${a}`);
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

// Texto real del grupo «OCIO DOMINGO · Grupo 1» (25/10/2026).
const real = [
  'LOLA VACCHI CEDILLO: Percha y silla · Autónomo en pista grande · Cansado · Paralelo elemental · Trabajar paralelo',
  'LUCAS MEDINA ALVAREZ: Percha y silla · Autónomo en pista grande · Muy buena · Paralelo elemental · Trabajar paralelo',
  'MARTINA ARIAS MARTINEZ: Percha y silla · Autónomo en pista grande · Cansado · Paralelo elemental · Trabajar paralelo',
  'MICAELA VALLEJO GARRIDO: Percha y silla · Autónomo en pista grande · Muy buena · Fundamental · Progresar un paso técnico',
].join('\n');

test('etiqueta cada dato del reporte', () => {
  equal(etiquetaDatoObservacion('Percha y silla'), 'Remontes', 'remontes');
  equal(etiquetaDatoObservacion('Autónomo en pista grande'), 'Autonomía', 'autonomía');
  equal(etiquetaDatoObservacion('Cansado'), 'Último día', 'actitud cansado');
  equal(etiquetaDatoObservacion('Muy buena'), 'Último día', 'actitud muy buena');
  equal(etiquetaDatoObservacion('Paralelo elemental'), 'Técnica', 'técnica');
  equal(etiquetaDatoObservacion('Fundamental'), 'Técnica', 'técnica fundamental');
  equal(etiquetaDatoObservacion('Trabajar paralelo'), 'Siguiente paso', 'recomendación');
  equal(etiquetaDatoObservacion('Progresar un paso técnico'), 'Siguiente paso', 'recomendación 2');
  equal(etiquetaDatoObservacion('Cinta'), 'Remontes', 'cinta');
});

test('saca lo común a todo el grupo y deja lo propio de cada niño', () => {
  const r = estructurarObservacionesGrupo(real);
  equal(textoDatosObservacion(r.comunes), 'Remontes: Percha y silla · Autonomía: Autónomo en pista grande', 'comunes');
  equal(r.comunesTodos, true, 'todo el grupo');
  equal(r.alumnos.length, 4, 'cuatro niños');
  equal(r.alumnos[0].nombre, 'LOLA VACCHI CEDILLO', 'nombre');
  equal(
    textoDatosObservacion(r.alumnos[0].datos),
    'Último día: Cansado · Técnica: Paralelo elemental · Siguiente paso: Trabajar paralelo',
    'Lola'
  );
  equal(
    textoDatosObservacion(r.alumnos[3].datos),
    'Último día: Muy buena · Técnica: Fundamental · Siguiente paso: Progresar un paso técnico',
    'Micaela'
  );
  equal(r.notas, [], 'sin notas');
});

test('un solo niño: no hay «todo el grupo»', () => {
  const r = estructurarObservacionesGrupo('ANA GIL: Cinta · Cansado');
  equal(r.comunes, [], 'sin comunes');
  equal(textoDatosObservacion(r.alumnos[0].datos), 'Remontes: Cinta · Último día: Cansado', 'Ana');
});

test('notas de coordinación, avisos y «nada relevante»', () => {
  const r = estructurarObservacionesGrupo(
    'OBSERVACIONES DE JOSE\nAtención al punto de encuentro nuevo\nPEPE RUIZ: NUEVO · Sin historial. Revisar nivel y adaptación en primera bajada.\nLUIS SOTO: Nada relevante'
  );
  equal(r.notas, ['Atención al punto de encuentro nuevo'], 'nota manual');
  equal(r.alumnos.map((a) => a.nombre), ['PEPE RUIZ', 'LUIS SOTO'], 'niños');
  equal(r.alumnos[0].datos[0].etiqueta, 'Aviso', 'aviso nuevo');
  equal(r.alumnos[1].datos, [], 'nada relevante queda vacío');
  equal(r.alumnos[1].sinNovedades, true, 'marcado sin novedades');
});

test('con niños sin novedades, lo común se calcula entre los que tienen datos', () => {
  const r = estructurarObservacionesGrupo(
    'ANA GIL: Cinta · Necesita ayuda puntual · Buena\nPABLO RUIZ: Cinta · Necesita ayuda puntual · Llora\nLEO DIAZ: Nada relevante'
  );
  equal(textoDatosObservacion(r.comunes), 'Remontes: Cinta · Autonomía: Necesita ayuda puntual', 'en común');
  equal(r.comunesTodos, false, 'no es todo el grupo');
  equal(r.alumnos.map((a) => a.sinNovedades), [false, false, true], 'Leo sin novedades');
  equal(textoDatosObservacion(r.alumnos[1].datos), 'Último día: Llora', 'Pablo');
});

test('no confunde «Hora: 10:00» con un niño si no parece un nombre', () => {
  const r = estructurarObservacionesGrupo('Punto 5 · 10:00 en la cinta');
  equal(r.alumnos.length, 0, 'sin niños');
  equal(r.notas.length, 1, 'una nota');
});
