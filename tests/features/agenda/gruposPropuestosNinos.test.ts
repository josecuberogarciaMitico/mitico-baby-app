import { conEdades, edadEnFecha, parsearAlumnosLista } from '../../../src/features/agenda/gruposPropuestosNinos';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('lista de niños del grupo: nombre y nivel, ordenados', () => {
  const l = parsearAlumnosLista('JACOBO ESCARIO ARES · B · Grande || INES GONZALEZ · B+ · Grande');
  equal(l.length, 2, 'dos niños');
  equal(`${l[0].nombre}|${l[0].nivel}`, 'INES GONZALEZ|B+', 'orden alfabético');
  equal(parsearAlumnosLista(null).length, 0, 'sin lista');
  equal(parsearAlumnosLista('  ||  ').length, 0, 'trozos vacíos');
});

test('edad en la fecha de la sesión', () => {
  equal(edadEnFecha('2020-11-10', '2026-11-08'), 5, 'aún no ha cumplido');
  equal(edadEnFecha('2020-11-08', '2026-11-08'), 6, 'cumple ese día');
  equal(edadEnFecha(null, '2026-11-08'), null, 'sin fecha');
});

test('edad por nombre sin acentos; nombres repetidos no se adivinan', () => {
  const fichas = [
    { alumno: 'Inés González', fecha_nacimiento: '2021-01-01' },
    { alumno: 'PAU RUIZ', fecha_nacimiento: '2020-01-01' },
    { alumno: 'PAU RUIZ', fecha_nacimiento: '2019-01-01' },
  ];
  const r = conEdades([{ nombre: 'INES GONZALEZ', nivel: 'B' }, { nombre: 'PAU RUIZ', nivel: 'A' }], fichas, '2026-11-08');
  equal(r[0].edad, 5, 'Inés');
  equal(r[1].edad, null, 'Pau duplicado');
});
