import {
  altaNivelInicialFormVacioApp,
  coincideAltaImportadaConAltaExistenteApp,
  normalizarFechaAltaImportadaApp,
  normalizarIdentidadAltaImportadaApp,
  normalizarModalidadAltaImportadaApp,
  normalizarTelefonoFormularioAltaImportadaApp,
  parsearListadoAltasPegadoApp,
  testNivelPublicoRespuestasVaciasApp,
} from '../../../src/core/enrolment/enrolmentImport';
import type {
  AltaImportadaPegadoApp,
  AltaNivelInicialApp,
} from '../../../src/core/enrolment/enrolmentTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

test('normaliza identidad, teléfono y fechas de entrada', () => {
  equal(normalizarIdentidadAltaImportadaApp('  Álvaro  Núñez '), 'ALVARO NUNEZ', 'identidad');
  equal(normalizarTelefonoFormularioAltaImportadaApp("'+34 612 345 678"), '612345678', 'teléfono');
  equal(normalizarFechaAltaImportadaApp('7/9/2018'), '2018-09-07', 'fecha europea');
  equal(normalizarFechaAltaImportadaApp('45292'), '2024-01-01', 'fecha Excel');
});

test('la modalidad exige palabras completas y evita SOCIO como OCIO', () => {
  equal(normalizarModalidadAltaImportadaApp('Socio anual'), '', 'socio');
  equal(normalizarModalidadAltaImportadaApp('Curso de ocio'), 'OCIO', 'ocio');
  equal(normalizarModalidadAltaImportadaApp('intensivo'), 'INTENSIVOS', 'intensivo');
});

test('parsea una tabla con cabecera y conserva el día fijo solo en OCIO', () => {
  const texto = [
    'Nombre\t1er apellido\tFecha nacimiento\tTeléfono\tModalidad\tDía ocio',
    'Ana\tLópez\t07/09/2018\t+34 612 345 678\tOcio\tSábado',
    'Leo\tPérez\t2019-02-03\t611222333\tBaby\tDomingo',
  ].join('\n');
  const resultado = parsearListadoAltasPegadoApp(texto);
  equal(resultado.invalidas, 0, 'inválidas');
  equal(resultado.filas.length, 2, 'filas');
  equal(resultado.filas[0].nombre, 'Ana López', 'nombre compuesto');
  equal(resultado.filas[0].ocioDiaFijo, 'Sábado', 'día OCIO');
  equal(resultado.filas[1].ocioDiaFijo, '', 'día BABY descartado');
});

test('rechaza modalidad ambigua y duplicados dentro del pegado', () => {
  const ambiguo = parsearListadoAltasPegadoApp('Ana Test\t07/09/2018\t612345678\tBABY\tOCIO');
  equal(ambiguo.invalidas, 1, 'ambigua');
  equal(ambiguo.filasInvalidas[0].motivo.includes('ambigua'), true, 'motivo ambiguo');

  const duplicado = parsearListadoAltasPegadoApp([
    'Ana Test\t07/09/2018\t612345678\tBABY',
    'Ána  Test\t2018-09-07\t+34 612345678\tBABY',
  ].join('\n'));
  equal(duplicado.filas.length, 1, 'fila única');
  equal(duplicado.invalidas, 1, 'duplicada');
});

test('identifica un alta existente con dos señales coincidentes', () => {
  const fila: AltaImportadaPegadoApp = {
    clave: 'x',
    nombre: 'Álvaro Núñez',
    fechaNacimiento: '2018-09-07',
    telefono: '612345678',
    modalidad: 'BABY',
    ocioDiaFijo: '',
    filaOrigen: 1,
  };
  const alta = {
    nombre_completo: 'ALVARO NUNEZ',
    fecha_nacimiento: '2010-01-01',
    telefono: '+34 612 345 678',
  } as AltaNivelInicialApp;
  equal(coincideAltaImportadaConAltaExistenteApp(fila, alta), true, 'nombre y teléfono');
  equal(coincideAltaImportadaConAltaExistenteApp({ ...fila, telefono: '699999999' }, alta), false, 'solo nombre');
});

test('expone estados iniciales nuevos sin referencias compartidas', () => {
  const formulario = altaNivelInicialFormVacioApp();
  const respuestasA = testNivelPublicoRespuestasVaciasApp();
  const respuestasB = testNivelPublicoRespuestasVaciasApp();
  equal(formulario.modalidad, 'BABY', 'modalidad inicial');
  respuestasA.observacionesEntrenador.push('x');
  equal(respuestasB.observacionesEntrenador.length, 0, 'lista independiente');
});
