import { nivelLegible, nombreLegible, pasoGrupoEntrenador, siguienteTareaEntrenador } from '../../../src/features/trainers/vistaEntrenadorNuevaLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('vista entrenador: lo siguiente que toca', () => {
  equal(siguienteTareaEntrenador([], []), null, 'nada pendiente');
  const pend = [
    { grupo_id: 'g2', fecha: '2026-11-20', hora_inicio: '18:00:00', nombre_grupo: 'Grupo 1', estado_reporte: 'Asistencia sin confirmar', estado_asistencia: 'Pendiente' },
    { grupo_id: 'g2', fecha: '2026-11-20', hora_inicio: '18:00:00', nombre_grupo: 'Grupo 1', estado_reporte: 'Asistencia sin confirmar', estado_asistencia: 'Pendiente' },
    { grupo_id: 'g1', fecha: '2026-11-18', hora_inicio: '17:00:00', nombre_grupo: 'Grupo 3', estado_reporte: 'Falta reporte', estado_asistencia: 'Presente' },
  ];
  const s = siguienteTareaEntrenador([], pend)!;
  equal(s.tipo, 'lista', 'pasar lista antes que reportes');
  equal(s.grupo_id, 'g2', 'grupo de la lista');
  equal(s.cuantos, 2, 'niños sin marcar de ese grupo');
  equal(s.total, 3, 'total de tareas');
  equal(s.hora_inicio, '18:00', 'hora sin segundos');
  const c = siguienteTareaEntrenador([{ grupo_id: 'g9', fecha: '2026-11-21', hora_inicio: '09:45', nombre_grupo: 'Grupo 2' }], pend)!;
  equal(c.tipo, 'confirmar', 'confirmar va primero');
  const r = siguienteTareaEntrenador([], [pend[2]])!;
  equal(r.tipo, 'reportes', 'solo reportes');
  equal(r.cuantos, 1, 'un reporte');
});

test('vista entrenador: paso del grupo abierto', () => {
  equal(pasoGrupoEntrenador({ confirmado: false, total: 5, pendientesLista: 5, reportesPorHacer: 0 }), 'confirmar', 'sin confirmar');
  equal(pasoGrupoEntrenador({ confirmado: true, total: 5, pendientesLista: 2, reportesPorHacer: 3 }), 'lista', 'falta lista');
  equal(pasoGrupoEntrenador({ confirmado: true, total: 5, pendientesLista: 0, reportesPorHacer: 3 }), 'reportes', 'faltan reportes');
  equal(pasoGrupoEntrenador({ confirmado: true, total: 5, pendientesLista: 0, reportesPorHacer: 0 }), 'hecho', 'todo hecho');
});

test('vista entrenador: textos legibles', () => {
  equal(nivelLegible('INICIACION / A'), 'Iniciación / A', 'nivel');
  equal(nivelLegible('Nivel B+'), 'B+', 'quita Nivel');
  equal(nombreLegible('LUCIA BERRUEZO'), 'Lucia Berruezo', 'nombre');
  equal(nombreLegible('VALLE VILLETA DE MARCO'), 'Valle Villeta de Marco', 'partículas');
});
