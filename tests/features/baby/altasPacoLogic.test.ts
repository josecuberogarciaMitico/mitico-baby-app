import {
  claveNombreAlta,
  decidirAltasPaco,
  resumenAltasPaco,
  textoWhatsappAltaTest,
  urlWhatsappAltaTest,
} from '../../../src/features/baby/altasPacoLogic';
import type { AltaNivelInicialApp } from '../../../src/core/enrolment/enrolmentTypes';

function equal<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: esperado ${e}, recibido ${a}`);
}
function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

const alta = (nombre: string, estado: AltaNivelInicialApp['estado'], creado = '2026-10-20'): AltaNivelInicialApp =>
  ({ id: `id-${nombre}-${estado}`, nombre_completo: nombre, estado, creado_at: creado, telefono: '600111222', token_publico: 't' } as AltaNivelInicialApp);

test('nombre: sin tildes, sin [Invitado], espacios normalizados', () => {
  equal(claveNombreAlta('  Nicolás de Cara  Ferrer [Invitado] '), 'NICOLAS DE CARA FERRER', 'clave');
});

test('decide crear, listo, enviado y falta_dato', () => {
  const r = decidirAltasPaco(
    [
      { nombre: 'LUCAS NUEVO', telefono: '600 111 222', fechaNacimiento: '2021-03-04' },
      { nombre: 'MARTINA LISTA', telefono: '600111333', fechaNacimiento: '2021-03-04' },
      { nombre: 'HUGO ENVIADO', telefono: '600111444', fechaNacimiento: '2021-03-04' },
      { nombre: 'SIN TELEFONO', telefono: '', fechaNacimiento: '2021-03-04' },
      { nombre: 'SIN FECHA', telefono: '600111555', fechaNacimiento: '' },
      { nombre: 'lucas nuevo', telefono: '600111222', fechaNacimiento: '2021-03-04' },
    ],
    [alta('Martina Lista', 'PENDIENTE_ENVIO'), alta('Hugo Enviado', 'ENVIADO'), alta('Lucas Nuevo', 'DESCARTADO')]
  );
  equal(r.map((d) => d.estado), ['crear', 'listo', 'enviado', 'falta_dato', 'falta_dato'], 'estados (sin duplicados)');
  equal(r[0].telefono, '34600111222', 'teléfono normalizado');
  equal(r[3].motivo, 'falta el teléfono', 'motivo teléfono');
  equal(r[4].motivo, 'falta la fecha de nacimiento', 'motivo fecha');
});

test('con varias altas del mismo niño manda la más reciente', () => {
  const r = decidirAltasPaco(
    [{ nombre: 'ANA X', telefono: '600111222', fechaNacimiento: '2021-01-01' }],
    [alta('Ana X', 'ENVIADO', '2026-09-01'), alta('Ana X', 'PENDIENTE_ENVIO', '2026-10-25')]
  );
  equal(r[0].estado, 'listo', 'la nueva está pendiente de envío');
});

test('texto y enlace de WhatsApp iguales a los de Altas / Test', () => {
  const t = textoWhatsappAltaTest('LUCAS NUEVO GARCIA', 'https://app/?test_nivel=abc');
  equal(t.startsWith('Hola familia, para preparar correctamente el grupo de LUCAS necesitamos'), true, 'nombre de pila');
  equal(t.includes('https://app/?test_nivel=abc'), true, 'enlace');
  equal(urlWhatsappAltaTest('600111222', 'LUCAS', 'https://x').startsWith('https://wa.me/34600111222?text='), true, 'url');
  equal(urlWhatsappAltaTest('', 'LUCAS', 'https://x'), '', 'sin teléfono');
});

test('resumen de Paco', () => {
  const r = decidirAltasPaco(
    [
      { nombre: 'A', telefono: '600111222', fechaNacimiento: '2021-01-01' },
      { nombre: 'B', telefono: '', fechaNacimiento: '' },
    ],
    [alta('A', 'PENDIENTE_ENVIO')]
  );
  equal(resumenAltasPaco(r), 'Paco · 2 niños nuevos sin ficha: 1 con el WhatsApp listo para enviar, 1 para revisar a mano.', 'resumen');
});
