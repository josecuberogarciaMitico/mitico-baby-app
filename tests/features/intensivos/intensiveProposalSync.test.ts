import {
  DESTINO_SIN_COLOCAR_INTENSIVO,
  claveAlumnoPropuestaIntensivo,
  diferenciasPropuestaIntensivo,
  moverAlumnoPropuestaIntensivo,
  pendientesColocarPropuestaIntensivo,
  sincronizarPropuestaIntensivo,
} from '../../../src/features/intensivos/intensiveProposalSync';
import type { RecomendacionGrupoIntensivoDiaApp } from '../../../src/features/intensivos/intensiveTypes';

function equal<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: esperado ${e}, recibido ${a}`);
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

const dias = [1, 2].map((n) => ({
  intensivo_dia_id: `dia${n}`,
  intensivo_id: 'int',
  numero_dia: n,
  fecha: `2026-11-0${n}`,
}));

function fila(diaId: string, alumnoId: string, grupo: string): RecomendacionGrupoIntensivoDiaApp {
  return {
    intensivo_dia_id: diaId,
    intensivo_id: 'int',
    numero_dia: 1,
    fecha: '2026-11-01',
    grupo_recomendado: grupo,
    bloque_tecnico: 'A+ / B',
    orden_bloque: 2,
    pista_recomendada: 'Pequeña',
    tamanio_grupo: 3,
    alerta_grupo: '',
    alumno_id: alumnoId,
    alumno: alumnoId.toUpperCase(),
    nivel_resumen: 'A+',
    nivel_orden: 2,
    fuente_nivel: 'Nivel actual',
    edad: 6,
    estado_ficha: 'completa',
    observacion_visible_entrenador: null,
    orden_en_grupo: 1,
  };
}

// Propuesta en pantalla: ana y valeria en Grupo 1 en los dos días.
const propuesta = dias.flatMap((dia) => [
  fila(dia.intensivo_dia_id, 'ana', 'Grupo 1'),
  fila(dia.intensivo_dia_id, 'valeria', 'Grupo 1'),
]);
// Ana movida a mano a Grupo 2 en los dos días: no se debe perder.
const destinos = moverAlumnoPropuestaIntensivo({}, ['dia1', 'dia2'], 'ana', 'Grupo 2');
// Valeria se ha borrado; daniela y olivia son nuevas.
const inscritos = ['ana', 'daniela', 'olivia'];

test('detecta nuevos inscritos y alumnos que ya no están', () => {
  const dif = diferenciasPropuestaIntensivo(
    propuesta.filter((r) => r.intensivo_dia_id === 'dia1'),
    inscritos
  );
  equal(dif.nuevosIds, ['daniela', 'olivia'], 'nuevos');
  equal(dif.sobrantes.map((r) => r.alumno_id), ['valeria'], 'sobrantes');
});

const resultado = sincronizarPropuestaIntensivo({
  propuesta,
  destinos,
  dias,
  inscritosIds: inscritos,
  filasBase: [fila('dia1', 'daniela', 'Grupo 7 · Nivel B'), fila('dia1', 'olivia', 'Grupo 1')],
});

test('quita a quien ya no está y añade a los nuevos en todos los días', () => {
  equal(resultado.quitadas, 2, 'filas quitadas (valeria x2 días)');
  equal(resultado.anadidas, 2, 'alumnos añadidos');
  ['dia1', 'dia2'].forEach((diaId) => {
    const ids = resultado.propuesta
      .filter((r) => r.intensivo_dia_id === diaId)
      .map((r) => r.alumno_id)
      .sort();
    equal(ids, ['ana', 'daniela', 'olivia'], `alumnos ${diaId}`);
  });
  const danielaDia2 = resultado.propuesta.find(
    (r) => r.intensivo_dia_id === 'dia2' && r.alumno_id === 'daniela'
  );
  equal(danielaDia2?.fecha, '2026-11-02', 'la copia del día 2 lleva la fecha del día 2');
});

test('los nuevos quedan pendientes de colocar, sin grupo fantasma', () => {
  const dia1 = resultado.propuesta.filter((r) => r.intensivo_dia_id === 'dia1');
  const pendientes = pendientesColocarPropuestaIntensivo(dia1, resultado.destinos);
  equal(pendientes.map((r) => r.alumno_id), ['daniela', 'olivia'], 'pendientes');
  equal(
    pendientes.map((r) => r.grupo_recomendado),
    [DESTINO_SIN_COLOCAR_INTENSIVO, DESTINO_SIN_COLOCAR_INTENSIVO],
    'sin nombre de grupo del recomendador'
  );
});

test('conserva lo colocado a mano', () => {
  equal(resultado.destinos[claveAlumnoPropuestaIntensivo('dia1', 'ana')], 'Grupo 2', 'ana día 1');
  equal(resultado.destinos[claveAlumnoPropuestaIntensivo('dia2', 'ana')], 'Grupo 2', 'ana día 2');
});

test('colocar a un pendiente lo pone en el mismo grupo en todos los días', () => {
  const colocados = moverAlumnoPropuestaIntensivo(resultado.destinos, ['dia1', 'dia2'], 'daniela', 'Grupo 1');
  const dia2 = resultado.propuesta.filter((r) => r.intensivo_dia_id === 'dia2');
  equal(
    pendientesColocarPropuestaIntensivo(dia2, colocados).map((r) => r.alumno_id),
    ['olivia'],
    'solo queda olivia'
  );
});

test('una segunda sincronización no duplica nada', () => {
  const otra = sincronizarPropuestaIntensivo({
    propuesta: resultado.propuesta,
    destinos: resultado.destinos,
    dias,
    inscritosIds: inscritos,
    filasBase: [fila('dia1', 'daniela', 'Grupo 1')],
  });
  equal(otra.quitadas, 0, 'nada que quitar');
  equal(otra.anadidas, 0, 'nada que añadir');
  equal(otra.propuesta.length, resultado.propuesta.length, 'mismo tamaño');
});
