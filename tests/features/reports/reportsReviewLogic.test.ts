import {
  agruparRevision,
  etiquetaDia,
  filtrarRevision,
  limpiarNotas,
  lunesDeIso,
  tieneTextoEscrito,
  type FilaRevision,
} from '../../../src/features/reports/reportsReviewLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const f = (x: Partial<FilaRevision>): FilaRevision => ({
  reporte_id: 'r', estado: 'Hecho', fecha: '2026-10-31', hora_inicio: '09:45:00', modalidad: 'Baby',
  grupo_id: 'g1', nombre_grupo: 'Grupo 1', alumno_id: 'a', alumno: 'ANA', entrenador: 'ALFONSO JORDAN', ...x,
});

const filas = [
  f({ alumno_id: 'a1', alumno: 'ZOE', notas_habilidades: { canteo: 'Derrapa' } }),
  f({ alumno_id: 'a2', alumno: 'ANA', reporte_id: null, estado: 'Falta reporte' }),
  f({ alumno_id: 'a3', alumno: 'LUIS', grupo_id: 'g2', nombre_grupo: 'Grupo 10' }),
  f({ alumno_id: 'a4', alumno: 'EVA', grupo_id: 'g3', nombre_grupo: 'Grupo 2', modalidad: 'Ocio' }),
  f({ alumno_id: 'a5', alumno: 'PAU', fecha: '2026-11-01', hora_inicio: '12:00:00' }),
];

test('día más reciente arriba, turnos por hora y grupos 2 antes que 10', () => {
  const d = agruparRevision(filas);
  equal(d[0].fecha, '2026-11-01', 'domingo primero');
  equal(d[1].turnos.length, 2, 'sábado: Baby y Ocio a las 09:45');
  const baby = d[1].turnos[0];
  equal(baby.modalidad, 'Baby', 'Baby');
  equal(baby.grupos.map((g) => g.nombre).join(','), 'Grupo 1,Grupo 10', 'orden de grupos');
  equal(baby.grupos[0].filas[0].alumno, 'ANA', 'niños por nombre');
  equal(`${baby.grupos[0].hechos}/${baby.grupos[0].faltan}`, '1/1', 'hechos y faltan del grupo');
  equal(`${d[1].hechos}/${d[1].faltan}`, '3/1', 'recuento del día');
});

test('filtros: escritos, faltan y búsqueda sin acentos', () => {
  equal(filtrarRevision(filas, 'escritos').length, 1, 'solo el que tiene notas');
  equal(filtrarRevision(filas, 'faltan').length, 1, 'solo el pendiente');
  equal(filtrarRevision(filas, 'todos', 'alfonso').length, 5, 'por entrenador');
  equal(filtrarRevision([f({ alumno: 'IÑIGO DÍEZ' })], 'todos', 'diez').length, 1, 'sin acentos');
});

test('texto escrito: notas u observaciones, no los campos de lista', () => {
  equal(tieneTextoEscrito(f({})), false, 'sin texto');
  equal(tieneTextoEscrito(f({ observaciones: 'Muy bien' })), true, 'observaciones');
  equal(tieneTextoEscrito(f({ notas_habilidades: { canteo: '  ' } })), false, 'nota vacía');
});

test('semana y notas limpias', () => {
  equal(lunesDeIso('2026-11-01'), '2026-10-26', 'domingo → lunes anterior');
  equal(lunesDeIso('2026-10-26'), '2026-10-26', 'lunes');
  equal(etiquetaDia('2026-10-31'), 'Sábado 31/10', 'etiqueta');
  const n = limpiarNotas({ canteo: '  Derrapa   mucho ', giro: '' });
  equal(JSON.stringify(n), '{"canteo":"Derrapa mucho"}', 'quita vacías');
});
