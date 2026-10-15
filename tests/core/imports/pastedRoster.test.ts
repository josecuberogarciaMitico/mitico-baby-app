import {
  parsePastedRoster,
  rosterTextForServerImport,
  rosterTextFromPastedList,
} from '../../../src/core/imports/pastedRoster';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

const realAimHarderCopy = `**OLIVER ESPINOSA ROMERO**

Reserva el **07/09/2026** a las **10:53**

Última reserva: **13/09/2026**

Termina tarifa el **13/06/2027**

[image](https://aimharder.com/Images/checkGreen.svg)[image](https://aimharder.com/Images/client_man.svg)**RODRIGO VELASCO MARTIN**

Reserva el **13/09/2026** a las **21:03**

Última reserva: **17/05/2026**

Termina tarifa el **17/06/2027**

[image](https://aimharder.com/Images/checkGreen.svg)[image](https://aimharder.com/Images/client_man.svg)**AITANA CASTILLO LOECHES**

Reserva el **14/09/2026** a las **09:07**

Última reserva: **13/09/2026**

Termina tarifa el **17/06/2027**

[image](https://aimharder.com/Images/checkGreen.svg)[image](https://aimharder.com/Images/client_man.svg)**LEONARDO VACCHI CEDILLO**

Reserva el **14/09/2026** a las **09:24**

Última reserva: **13/09/2026**

Termina tarifa el **13/06/2027**

[image](https://aimharder.com/Images/checkGreen.svg)[image](https://aimharder.com/Images/client_woman.svg)**LOLA VACCHI CEDILLO**

Reserva el **14/09/2026** a las **09:24**

Última reserva: **13/09/2026**

Termina tarifa el **13/06/2027**

[image](https://aimharder.com/Images/checkGreen.svg)[image](https://aimharder.com/Images/client_man.svg)**JUAN VALLEJO GARRIDO**

Reserva el **14/09/2026** a las **09:35**

Última reserva: **13/09/2026**

Termina tarifa el **13/06/2027**

[image](https://aimharder.com/Images/checkGreen.svg)[image](https://aimharder.com/Images/client_man.svg)**LUCAS MEDINA ALVAREZ**

Reserva el **14/09/2026** a las **09:48**

Última reserva: **13/09/2026**

Termina tarifa el **13/06/2027**

[image](https://aimharder.com/Images/checkGreen.svg)[image](https://aimharder.com/Images/client_man.svg)**DANIEL VILLAGRA BALDELLOU**

Reserva el **14/09/2026** a las **10:46**

Última reserva: **10/05/2026**

Termina tarifa el **17/06/2027**

[image](https://aimharder.com/Images/checkGreen.svg)[image](https://aimharder.com/Images/client_man.svg)**ALEJANDRA MARTINEZ MUÑOZ [Invitado]**

Reserva el **15/09/2026** a las **11:47**

[image](https://aimharder.com/Images/checkGreen.svg)[image](https://aimharder.com/Images/client_man.svg)**ELISA MARTINEZ MUÑOZ [Invitado]**

Reserva el **15/09/2026** a las **11:47**

[image](https://aimharder.com/Images/checkGreen.svg)[image](https://aimharder.com/Images/client_man.svg)**CARLOS VAQUERO PEREZ**

Reserva el **15/09/2026** a las **12:16**

Última reserva: **10/09/2026**

Termina tarifa el **30/09/2026**

[image](https://aimharder.com/Images/checkGreen.svg)[image](https://aimharder.com/Images/client_man.svg)**JAVIER DE CARA FERRER**

Reserva el **15/09/2026** a las **14:31**

Última reserva: **25/01/2026**

Termina tarifa el **20/09/2026**

[image](https://aimharder.com/Images/checkGreen.svg)[image](https://aimharder.com/Images/client_man.svg)**PATRICIA DE CARA FERRER**

Reserva el **15/09/2026** a las **14:32**

Última reserva: **25/01/2026**

Termina tarifa el **20/09/2026**

[image](https://aimharder.com/Images/checkGreen.svg)[image](https://aimharder.com/Images/client_man.svg)**MATIAS ARIAS MARTINEZ**

Reserva el **17/09/2026** a las **12:43**

Última reserva: **13/09/2026**

Termina tarifa el **17/06/2027**

[image](https://aimharder.com/Images/checkGreen.svg)[image](https://aimharder.com/Images/client_man.svg)**MARTINA ARIAS MARTINEZ**

Reserva el **17/09/2026** a las **12:43**

Última reserva: **13/09/2026**

Termina tarifa el **17/06/2027`;

const expectedNames = [
  'OLIVER ESPINOSA ROMERO',
  'RODRIGO VELASCO MARTIN',
  'AITANA CASTILLO LOECHES',
  'LEONARDO VACCHI CEDILLO',
  'LOLA VACCHI CEDILLO',
  'JUAN VALLEJO GARRIDO',
  'LUCAS MEDINA ALVAREZ',
  'DANIEL VILLAGRA BALDELLOU',
  'ALEJANDRA MARTINEZ MUÑOZ',
  'ELISA MARTINEZ MUÑOZ',
  'CARLOS VAQUERO PEREZ',
  'JAVIER DE CARA FERRER',
  'PATRICIA DE CARA FERRER',
  'MATIAS ARIAS MARTINEZ',
  'MARTINA ARIAS MARTINEZ',
];

test('extrae exactamente los 15 alumnos del bloque real de AimHarder', () => {
  const parsed = parsePastedRoster(realAimHarderCopy);
  equal(parsed.names.length, 15, 'total');
  equal(parsed.names.join('|'), expectedNames.join('|'), 'nombres exactos');
  equal(parsed.guestCount, 2, 'invitados');
  equal(parsed.cancellationCount, null, 'cancelaciones ausentes');
  equal(parsed.detectedAimHarderFormat, true, 'formato AimHarder');
});

test('Invitado se conserva como alumno y solo se separa la etiqueta', () => {
  const parsed = parsePastedRoster('**ALEJANDRA MARTINEZ MUÑOZ [Invitado]**');
  equal(parsed.names[0], 'ALEJANDRA MARTINEZ MUÑOZ', 'nombre');
  equal(parsed.attendees[0]?.guest, true, 'marca invitado');
});

test('detecta cancelaciones solo si vienen incluidas, pero no las necesita', () => {
  const parsed = parsePastedRoster(`${realAimHarderCopy}\n\n2 Cancelaciones`);
  equal(parsed.names.length, 15, 'total');
  equal(parsed.cancellationCount, 2, 'cancelaciones');
});

test('acepta un listado plano y elimina nivel técnico final', () => {
  const parsed = parsePastedRoster('ANA TEST A+\nBEA TEST\nCARLA DE LA TORRE');
  equal(parsed.names.join('|'), 'ANA TEST|BEA TEST|CARLA DE LA TORRE', 'listado plano');
});

test('marca duplicados normalizados en vez de esconderlos', () => {
  const parsed = parsePastedRoster('ANA MUÑOZ\nAna Munoz');
  equal(parsed.duplicates.length, 1, 'duplicados');
});

test('genera el texto limpio que consume el resto de la app', () => {
  equal(rosterTextFromPastedList(realAimHarderCopy), expectedNames.join('\n'), 'texto limpio');
});

test('ignora los textos de la pantalla de reservas de AimHarder (lista de espera)', () => {
  const copia = [
    'JAIME REY COEGO',
    'RESERVA EL 12/10/2026 A LAS 23:19',
    'TERMINA TARIFA EL 17/10/2026',
    'EN LISTA DE ESPERA',
    'CANDELA FERNANDEZ CAVADA GARCIA',
    'RESERVA EL 14/10/2026 A LAS 14:31',
    'ÚLTIMA RESERVA: 01/04/2023',
    'TERMINA TARIFA EL 16/05/2027MIGUEL FERNANDEZ CAVADA GARCIA',
    'RESERVA EL 14/10/2026 A LAS 14:32',
    'ÚLTIMA RESERVA: 16/11/2025',
    'TERMINA TARIFA EL 16/05/2027',
    'Apuntar a otro cliente',
    'Apuntar invitado',
    'Modificar clase',
    'Enviar mensaje',
    'Cancelar clase',
  ].join('\n');
  const parsed = parsePastedRoster(copia);
  equal(
    parsed.names.join('|'),
    'JAIME REY COEGO|CANDELA FERNANDEZ CAVADA GARCIA|MIGUEL FERNANDEZ CAVADA GARCIA',
    'solo alumnos'
  );
});

test('separa «EN LISTA DE ESPERA» cuando sale pegado al nombre del niño', () => {
  // Caso real 14/10/2026: se creó una ficha «EN LISTA DE ESPERAOLIVIA GUTIERREZ GUILLO».
  const parsed = parsePastedRoster(
    'ALEJANDRA MARTINEZ TILVES\nTERMINA TARIFA EL 17/10/2026\nEN LISTA DE ESPERAOLIVIA GUTIERREZ GUILLO\nRESERVA EL 14/10/2026 A LAS 10:00'
  );
  equal(parsed.names.join('|'), 'ALEJANDRA MARTINEZ TILVES|OLIVIA GUTIERREZ GUILLO', 'nombres limpios');
});

test('guarda el nivel escrito al final y lo devuelve para la base de datos', () => {
  const texto = 'Juan Pérez B\nAna Ruiz A+\nLuis Gil [Invitado]\nPedro Sanz Iniciación\nEN LISTA DE ESPERA\nApuntar a otro cliente';
  const parsed = parsePastedRoster(texto);
  equal(parsed.attendees.map((a) => `${a.name}:${a.level || '-'}`).join('|'), 'Juan Pérez:B|Ana Ruiz:A+|Luis Gil:-|Pedro Sanz:INICIACION', 'niveles');
  equal(rosterTextForServerImport(texto), 'Juan Pérez B\nAna Ruiz A+\nLuis Gil\nPedro Sanz INICIACION', 'texto para el servidor');
});
