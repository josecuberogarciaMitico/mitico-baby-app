import {
  claveCandidato,
  construirAvisos,
  nivelAnteriorDeFila,
  type FilaAvisoReporte,
} from '../../../src/core/reports/coordinationAlerts';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

const HOY = '2026-10-02';

function fila(cambios: Partial<FilaAvisoReporte>): FilaAvisoReporte {
  return {
    reporte_id: 'r1', alumno_id: 'a1', alumno: 'LUCAS', fecha: HOY, modalidad: 'Ocio', grupo: 'G1',
    entrenador: 'PEPE', nivel_reportado: 'C', nivel_anterior: 'C', nivel_actual: 'C', ritmo_grupo: 'Adecuado para su nivel',
    prioridades: [], incidencia: 'Sin incidencia', incidencia_comentario: null, evaluacion_tecnica: {},
    nivel_revision: null, incidencia_revisada_at: null, es_ultimo_del_alumno: true, ...cambios,
  };
}

test('cambio de nivel pendiente → aviso con Confirmar/Deshacer', () => {
  const avisos = construirAvisos([fila({ nivel_reportado: 'C+', nivel_anterior: 'C', prioridades: ['Revisar nivel'] })], HOY);
  equal(avisos.length, 1, 'un aviso');
  const a = avisos[0];
  if (a.tipo !== 'nivel') throw new Error('tipo');
  equal(`${a.nivelAnterior}→${a.nivelNuevo}`, 'C→C+', 'niveles');
  equal(a.sube, true, 'sube');
  equal(a.puedeDeshacer, true, 'puede deshacer');
});

test('revisado, antiguo o sin «Revisar nivel» → sin aviso de nivel', () => {
  equal(construirAvisos([fila({ nivel_reportado: 'C+', prioridades: ['Revisar nivel'], nivel_revision: 'confirmado' })], HOY).length, 0, 'confirmado');
  equal(construirAvisos([fila({ nivel_reportado: 'C+', prioridades: ['Revisar nivel'], fecha: '2026-08-01' })], HOY).length, 0, 'más de 30 días');
  equal(construirAvisos([fila({ nivel_reportado: 'C+' })], HOY).length, 0, 'sin marca');
});

test('nivel anterior deducido del ritmo si no hay reporte previo', () => {
  equal(nivelAnteriorDeFila(fila({ nivel_reportado: 'C+', nivel_anterior: null, ritmo_grupo: 'Muy rápido · podría ir con nivel superior' })), 'C', 'sube');
  equal(nivelAnteriorDeFila(fila({ nivel_reportado: 'B+', nivel_anterior: null, ritmo_grupo: 'Lento para su nivel' })), 'C', 'baja');
  equal(nivelAnteriorDeFila(fila({ nivel_reportado: 'C', nivel_anterior: null })), null, 'sin pistas');
});

test('incidencia sin revisar de los últimos 14 días', () => {
  const avisos = construirAvisos([fila({ incidencia: 'Otro', incidencia_comentario: 'Molestia física' })], HOY);
  equal(avisos.length, 1, 'uno');
  if (avisos[0].tipo !== 'incidencia') throw new Error('tipo');
  equal(avisos[0].incidencia, 'Molestia física', 'usa el detalle');
  equal(construirAvisos([fila({ incidencia: 'Caída sin importancia', incidencia_revisada_at: '2026-10-02T10:00:00Z' })], HOY).length, 0, 'vista');
  equal(construirAvisos([fila({ incidencia: 'Caída sin importancia', fecha: '2026-09-10' })], HOY).length, 0, 'antigua');
});

test('candidato a subir: todos los focos conseguidos en su nivel', () => {
  const todos = { paralelismo: 'Consolidado', apoyo_exterior_presion: 'Consolidado', rotacion_piernas: 'Consolidado', flexion_extension: 'Consolidado' } as never;
  const filas = [
    fila({ reporte_id: 'r2', fecha: '2026-10-01', evaluacion_tecnica: todos }),
    fila({ reporte_id: 'r1', fecha: '2026-09-27', evaluacion_tecnica: todos }),
  ];
  const avisos = construirAvisos(filas, HOY);
  equal(avisos.length, 1, 'un candidato');
  const a = avisos[0];
  if (a.tipo !== 'candidato') throw new Error('tipo');
  equal(`${a.nivel}→${a.siguiente}`, 'C→C+', 'niveles');
  equal(construirAvisos(filas, HOY, new Set([claveCandidato('a1', 'C')])).length, 0, 'marcado como visto');
  const faltaUno = [filas[0], fila({ reporte_id: 'r1', fecha: '2026-09-27', evaluacion_tecnica: { ...(todos as object), flexion_extension: 'En desarrollo' } as never })];
  equal(construirAvisos(faltaUno, HOY).length, 0, 'un foco sin conseguir');
});
