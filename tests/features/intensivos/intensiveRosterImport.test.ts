import {
  intensiveRosterNamesNotRead,
  prepareIntensiveRosterImport,
} from '../../../src/features/intensivos/intensiveOperations';

function equal<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: esperado ${e}, recibido ${a}`);
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

const copiaAimHarder = [
  'JORDI PUJOL-FERRER',
  'RESERVA EL 14/10/2026 A LAS 14:31',
  'TERMINA TARIFA EL 16/05/2027',
  'EN LISTA DE ESPERA',
  'NÚRIA ÇANET [Invitado]',
  'RESERVA EL 14/10/2026 A LAS 14:32',
  'Juan Pérez B',
  'Apuntar a otro cliente',
  'Modificar clase',
].join('\n');

test('limpia el listado del intensivo antes de mandarlo a la base de datos', () => {
  const listado = prepareIntensiveRosterImport(copiaAimHarder);
  equal(listado.names, ['JORDI PUJOL-FERRER', 'NÚRIA ÇANET', 'Juan Pérez'], 'nombres');
  equal(listado.serverText, 'JORDI PUJOL-FERRER\nNÚRIA ÇANET\nJuan Pérez B', 'texto con nivel');
});

test('avisa de los nombres que la base de datos no ha devuelto', () => {
  const listado = prepareIntensiveRosterImport(copiaAimHarder);
  // Hoy la base de datos descarta guiones y Ç: solo devuelve a Juan.
  equal(
    intensiveRosterNamesNotRead(listado.names, [{ alumno: 'JUAN PEREZ' }]),
    ['JORDI PUJOL-FERRER', 'NÚRIA ÇANET'],
    'no leídos'
  );
  equal(
    intensiveRosterNamesNotRead(listado.names, [
      { alumno: 'Jordi Pujol-Ferrer' },
      { alumno: 'NURIA ÇANET' },
      { alumno: 'Juan Pérez' },
    ]),
    [],
    'todos leídos'
  );
});
