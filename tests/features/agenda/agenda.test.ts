import {
  agendaFormInicial,
  claveFechaAgenda,
  crearFechaAgenda,
  diasTrabajoSemanaAgenda,
  inicioSemanaAgenda,
  mesesTemporadaAgenda,
  seasonStartForAgenda,
  turnosTrabajoDiaAgenda,
} from '../../../src/features/agenda/agendaCalendar';
import { buildAgendaOperationalSessions } from '../../../src/features/agenda/agendaSessions';
import type { AgendaSesionDirectaApp, ListadoApp } from '../../../src/features/agenda/agendaTypes';
import type { GrupoPlanning } from '../../../src/core/sessions/operationalTypes';
import type { IntensivoAlumnoApp, IntensivoApp, IntensivoDiaApp } from '../../../src/features/intensivos/intensiveTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

function direct(overrides: Partial<AgendaSesionDirectaApp> = {}): AgendaSesionDirectaApp {
  return {
    sesion_id: 's1', fecha: '2026-09-19', hora_inicio: '09:45', hora_fin: '11:45',
    lugar: 'Madrid SnowZone', tipo_sesion: 'BABY', estado_sesion: 'ACTIVA',
    modalidad_codigo: 'BABY', modalidad: 'BABY', semana: '2026-09-14',
    semana_inicio: '2026-09-14', semana_fin: '2026-09-20', total_alumnos: 5,
    total_nuevos: 0, total_conocidos: 5, total_grupos: 1, grupos_publicados: 0,
    alumnos_en_grupos: 6, alumnos_sin_grupo: 1, ...overrides,
  };
}

function planning(overrides: Partial<GrupoPlanning> = {}): GrupoPlanning {
  return {
    grupo_id: 'g1', fecha: '2026-09-19', hora_inicio: '09:45', hora_fin: '11:45',
    modalidad: 'BABY', nombre_grupo: 'A', nivel_grupo: 'A', pista: 'Pequeña',
    punto_encuentro: '5', estado_grupo: 'PREPARADO', ratio_ok: true,
    excepcion_ratio: false, publicado: true, entrenadores: 'Ana', alumnos: 'Leo',
    total_alumnos: 6, trabajo_diario: null, observaciones_importantes: null, ...overrides,
  };
}

test('calendario usa fecha local ISO y lunes como inicio semanal', () => {
  equal(claveFechaAgenda(crearFechaAgenda('2026-09-20')), '2026-09-20', 'ida y vuelta');
  equal(inicioSemanaAgenda('2026-09-20'), '2026-09-14', 'domingo');
  equal(diasTrabajoSemanaAgenda('2026-09-14').map((day) => day.fecha).join(','),
    '2026-09-16,2026-09-17,2026-09-18,2026-09-19,2026-09-20', 'días de trabajo');
});

test('turnos oficiales distinguen laborable, sábado y domingo', () => {
  equal(turnosTrabajoDiaAgenda('2026-09-16').length, 1, 'miércoles');
  equal(turnosTrabajoDiaAgenda('2026-09-19').length, 3, 'sábado');
  equal(turnosTrabajoDiaAgenda('2026-09-20').length, 2, 'domingo');
  equal(turnosTrabajoDiaAgenda('2026-09-15').length, 0, 'martes');
});

test('temporada cambia en julio y contiene diez meses', () => {
  equal(seasonStartForAgenda(new Date(2026, 5, 30)), 2025, 'junio');
  equal(seasonStartForAgenda(new Date(2026, 6, 1)), 2026, 'julio');
  equal(mesesTemporadaAgenda(2026).join(','), '2026-09,2026-10,2026-11,2026-12,2027-01,2027-02,2027-03,2027-04,2027-05,2027-06', 'meses');
});

test('formulario inicial conserva valores operativos y estado independiente', () => {
  const first = agendaFormInicial(); const second = agendaFormInicial();
  first.texto_listado = 'Ana';
  equal(second.texto_listado, '', 'estado independiente');
  equal(second.lugar, 'Madrid SnowZone', 'lugar');
});

test('sesión directa gobierna y Planning completa publicación sin duplicarla', () => {
  const sessions = buildAgendaOperationalSessions({
    directSessions: [direct()], directGroups: [], intensiveDays: [], intensives: [],
    intensiveGroups: [], intensiveStudents: [], planning: [planning()], rosters: [],
  });
  equal(sessions.length, 1, 'sesión única');
  equal(sessions[0].origen, 'operativa', 'origen');
  equal(sessions[0].totalAlumnos, 6, 'total más seguro');
  equal(sessions[0].estado, 'Publicado', 'estado Planning');
});

test('día Intensivos vinculado a sesión directa no crea un duplicado', () => {
  const day = {
    intensivo_dia_id: 'd1', intensivo_id: 'i1', numero_dia: 1, fecha: '2026-09-19',
    hora_inicio: '09:45', hora_fin: '11:45', sesion_id: 's1', created_at: '',
  } as IntensivoDiaApp;
  const sessions = buildAgendaOperationalSessions({
    directSessions: [direct()], directGroups: [], intensiveDays: [day],
    intensives: [{ intensivo_id: 'i1', intensivo: 'Navidad' } as IntensivoApp],
    intensiveGroups: [], intensiveStudents: [{ intensivo_id: 'i1' } as IntensivoAlumnoApp],
    planning: [], rosters: [],
  });
  equal(sessions.length, 1, 'sin duplicado');
});

test('Planning y listado solo aparecen si no existe sesión operativa equivalente', () => {
  const roster = {
    listado_id: 'l1', semana: null, fecha: '2026-09-20', hora_inicio: '12:00', hora_fin: '14:00',
    modalidad: 'OCIO', estado: 'IMPORTADO', fuera_de_plazo: false, total_nombres_detectados: 4,
    encontrados: 4, altas_nuevas: 0, no_encontrados: 0, pendientes_revisar: 0, duplicados: 0,
  } as ListadoApp;
  const sessions = buildAgendaOperationalSessions({
    directSessions: [], directGroups: [], intensiveDays: [], intensives: [], intensiveGroups: [],
    intensiveStudents: [], planning: [planning({ fecha: '2026-09-18', publicado: false })], rosters: [roster],
  });
  equal(sessions.map((session) => session.origen).join(','), 'planning,listado', 'orígenes ordenados');
  equal(sessions[0].estado, 'Pendiente publicar', 'planning pendiente');
  equal(sessions[1].totalAlumnos, 4, 'total listado');
});
