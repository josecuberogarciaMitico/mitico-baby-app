import {
  esRolCoordinacionApp,
  esSoloConsultaApp,
  puedeGestionarAccesosApp,
  puedeVerAdministracionAltasApp,
  puedeVerDireccionLecturaApp,
  puedeVerDireccionApp,
  rolUsuarioTextoApp,
} from '../../../src/core/permissions/rolePermissions';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('conserva las etiquetas visibles de todos los roles', () => {
  equal(rolUsuarioTextoApp('coordinador_jefe'), 'Coordinador jefe', 'coordinador jefe');
  equal(rolUsuarioTextoApp('sub_coordinador'), 'Sub-coordinador', 'sub-coordinador');
  equal(rolUsuarioTextoApp('coordinador'), 'Sub-coordinador', 'alias coordinador');
  equal(rolUsuarioTextoApp('administracion'), 'Administración', 'administración');
  equal(rolUsuarioTextoApp('entrenador'), 'Entrenador', 'entrenador');
});

test('la coordinación conserva acceso operativo para sus cuatro roles', () => {
  for (const rol of ['coordinador_jefe', 'sub_coordinador', 'administracion', 'coordinador']) {
    equal(esRolCoordinacionApp(rol), true, `coordinación ${rol}`);
  }
  equal(esRolCoordinacionApp('entrenador'), false, 'entrenador');
});

test('dirección y gestión de accesos siguen reservadas al coordinador jefe', () => {
  equal(puedeVerDireccionApp('coordinador_jefe'), true, 'dirección jefe');
  equal(puedeGestionarAccesosApp('coordinador_jefe'), true, 'accesos jefe');
  for (const rol of ['sub_coordinador', 'administracion', 'coordinador', 'entrenador']) {
    equal(puedeVerDireccionApp(rol), false, `dirección ${rol}`);
    equal(puedeGestionarAccesosApp(rol), false, `accesos ${rol}`);
  }
});

test('altas administrativas excluyen coordinador legacy y entrenador', () => {
  for (const rol of ['coordinador_jefe', 'sub_coordinador', 'administracion']) {
    equal(puedeVerAdministracionAltasApp(rol), true, `altas ${rol}`);
  }
  equal(puedeVerAdministracionAltasApp('coordinador'), false, 'altas coordinador');
  equal(puedeVerAdministracionAltasApp('entrenador'), false, 'altas entrenador');
});

test('solo consulta: ve coordinación y Dirección (solo mirar), sin acciones de jefe ni altas', () => {
  equal(rolUsuarioTextoApp('consulta'), 'Solo consulta', 'etiqueta');
  equal(esRolCoordinacionApp('consulta'), true, 'coordinación');
  equal(esSoloConsultaApp('consulta'), true, 'solo consulta');
  equal(puedeVerDireccionLecturaApp('consulta'), true, 'dirección lectura');
  equal(puedeVerDireccionApp('consulta'), false, 'dirección');
  equal(puedeGestionarAccesosApp('consulta'), false, 'accesos');
  equal(puedeVerAdministracionAltasApp('consulta'), false, 'altas');
  for (const rol of ['coordinador_jefe', 'sub_coordinador', 'administracion', 'coordinador', 'entrenador']) {
    equal(esSoloConsultaApp(rol), false, `no consulta ${rol}`);
  }
  equal(puedeVerDireccionLecturaApp('coordinador_jefe'), true, 'dirección lectura jefe');
  for (const rol of ['sub_coordinador', 'administracion', 'coordinador', 'entrenador']) {
    equal(puedeVerDireccionLecturaApp(rol), false, `dirección lectura ${rol}`);
  }
});
