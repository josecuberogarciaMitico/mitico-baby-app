import { columnasDelDia, estadoDia, pasosSesion, resumenDia } from '../../../src/features/agenda/agendaTablero';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const ses = (id: string, ini: string, fin: string, alumnos: number, grupos = 0, publicados = 0, modalidad = 'BABY') => ({
  id, hora_inicio: `${ini}:00`, hora_fin: `${fin}:00`, modalidad, totalAlumnos: alumnos, totalGrupos: grupos, publicados,
});

test('pasos: con listado y sin grupos toca hacer grupos', () => {
  const r = pasosSesion(ses('a', '09:45', '11:45', 11), null);
  equal(r.pasos.map((p) => p.estado).join(','), 'hecho,actual,pendiente,pendiente', 'pasos');
  equal(r.botonPrincipal, 'Hacer grupos', 'botón');
});

test('pasos: grupos sin entrenador y luego publicado', () => {
  const r1 = pasosSesion(ses('a', '09:45', '11:45', 11, 3, 0), { totalGroups: 3, pendingGroups: 1 });
  equal(r1.pasos[2].estado, 'actual', 'entrenadores pendiente');
  equal(r1.botonPrincipal, 'Abrir sesión', 'botón abrir');
  const r2 = pasosSesion(ses('a', '09:45', '11:45', 11, 3, 3), { totalGroups: 3, pendingGroups: 0 });
  equal(r2.completa, true, 'completa');
});

test('estado del día', () => {
  const cob = () => ({ totalGroups: 3, pendingGroups: 0 });
  equal(estadoDia([], cob), 'vacio', 'sin sesiones');
  equal(estadoDia([ses('a', '09:45', '11:45', 11)], cob), 'pendiente', 'a medias');
  equal(estadoDia([ses('a', '09:45', '11:45', 11, 3, 3)], cob), 'listo', 'listo');
});

test('cada sesión en su turno y ninguna se pierde', () => {
  const turnos = [
    { etiqueta: '09:45–11:45', inicio: '09:45', fin: '11:45' },
    { etiqueta: '12:00–14:00', inicio: '12:00', fin: '14:00' },
    { etiqueta: '14:30–16:30', inicio: '14:30', fin: '16:30' },
  ];
  const cols = columnasDelDia(turnos, [
    ses('a', '09:45', '11:45', 11),
    ses('b', '12:00', '14:00', 4),
    ses('c', '12:00', '14:00', 8, 0, 0, 'OCIO'),
    ses('d', '17:00', '18:00', 2, 0, 0, 'INTENSIVOS'),
  ]);
  equal(cols.length, 4, 'tres turnos + otros');
  equal(cols[0].tieneBaby, true, 'turno 1 con Baby');
  equal(cols[1].sesiones.length, 2, 'turno 2 Baby y Ocio');
  equal(cols[2].sesiones.length, 0, 'turno 3 vacío');
  equal(cols[2].tieneBaby, false, 'turno 3 sin Baby');
  equal(cols[3].etiqueta, 'Otros horarios', 'otros');
});

test('resumen del día', () => {
  equal(resumenDia([ses('a', '09:45', '11:45', 11, 3), ses('b', '12:00', '14:00', 4)]).texto, '15 niños · 3 grupos', 'texto');
  equal(resumenDia([ses('a', '09:45', '11:45', 1, 1)]).texto, '1 niño · 1 grupo', 'singular');
});

import { disponiblesEnTurno, pendientesSemana, siguientePendiente } from '../../../src/features/agenda/agendaTablero';

test('lo que falta: solo desde hoy y con sus motivos', () => {
  const dias = [
    { fecha: '2026-10-28', sesiones: [ses('p', '18:00', '20:00', 4)] }, // pasado: no cuenta
    { fecha: '2026-10-31', sesiones: [ses('a', '09:45', '11:45', 11), ses('b', '12:00', '14:00', 8, 2, 1)] },
    { fecha: '2026-11-01', sesiones: [ses('c', '09:45', '11:45', 6, 2, 2), ses('vacia', '12:00', '14:00', 0)] },
  ];
  const cob = (s: { id: string }) => ({ totalGroups: 2, pendingGroups: s.id === 'b' ? 1 : 0 });
  const ex = (s: { id: string }) => (s.id === 'c' ? { revisar: 2, notas: 1, sinConfirmar: 1 } : null);
  const r = pendientesSemana(dias, '2026-10-29', cob, ex);
  equal(r.contadores.sin_grupos, 1, 'sin grupos');
  equal(r.contadores.sin_entrenador, 1, 'sin entrenador');
  equal(r.contadores.sin_publicar, 1, 'sin publicar');
  equal(r.contadores.revisar, 2, 'revisar');
  equal(r.contadores.sin_confirmar, 1, 'sin confirmar');
  equal(r.pendientes.map((p) => p.sesion.id).join(','), 'a,b,c', 'orden');
  equal(siguientePendiente(r.pendientes, 'a')!.sesion.id, 'b', 'siguiente');
  equal(siguientePendiente(r.pendientes, 'c')!.sesion.id, 'a', 'vuelve al principio');
  equal(siguientePendiente(r.pendientes, 'x')!.sesion.id, 'a', 'sin abierta: la primera');
  equal(siguientePendiente(r.pendientes, 'a', 'revisar')!.sesion.id, 'c', 'por motivo');
});

test('disponibles en el turno', () => {
  const filas = [
    { entrenador_id: 'e1', fecha: '2026-10-31', hora_inicio: '09:45:00', hora_fin: '11:45:00', respuesta: 'Disponible' },
    { entrenador_id: 'e2', fecha: '2026-10-31', hora_inicio: '09:45:00', hora_fin: '11:45:00', respuesta: 'No puedo' },
    { entrenador_id: 'e3', fecha: '2026-10-31', hora_inicio: '09:45:00', hora_fin: '11:45:00', respuesta: 'disponible' },
    { entrenador_id: 'e4', fecha: '2026-10-31', hora_inicio: '09:45:00', hora_fin: '11:45:00', respuesta: 'Disponible' },
  ];
  equal(disponiblesEnTurno(filas, '2026-10-31', '09:45', '11:45', null), 3, 'tres');
  equal(disponiblesEnTurno(filas, '2026-10-31', '09:45', '11:45', new Set(['e1', 'e3'])), 2, 'solo activos');
  equal(disponiblesEnTurno(filas, '2026-10-31', '14:30', '16:30', null), null, 'sin turno publicado');
  equal(disponiblesEnTurno(filas, '2026-11-01', '09:45', '11:45', null), null, 'sin día');
});
