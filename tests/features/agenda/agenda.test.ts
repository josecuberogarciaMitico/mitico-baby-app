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

import {
  evaluateBabyRelocationTarget,
  levelsFromAgendaGroup,
  isParticularAgendaGroupName,
  proposalGroupToRelocationTarget,
  realGroupToRelocationTarget,
  sortBabyRelocationOptions,
  type BabyRelocationOption,
} from '../../../src/features/agenda/agendaRelocation';
import {
  buildWeeklyTrainerLoads,
  pendingTrainerGroupsInSessions,
  sessionTrainerCoverage,
  type AgendaTrainerAssignmentRow,
} from '../../../src/features/agenda/agendaTrainerSummary';
import type { AgendaGrupoSesionApp, AgendaRecomendacionSesionApp, SesionAgendaOperativa } from '../../../src/features/agenda/agendaTypes';
import type { EntrenadorResumen } from '../../../src/core/trainers/trainerTypes';

test('reubicación Baby prioriza siempre el mismo día antes que otro día', () => {
  const sameDay = {
    kind: 'REAL', sesion_id: 's2', fecha: '2026-09-19', hora_inicio: '12:00', hora_fin: '14:00',
    grupo_id: 'g2', grupo: 'Grupo A', nivel_grupo: 'A', pista: 'Pequeña', total_actual: 2,
    total_final: 3, estado: 'RECOMENDADO', motivo: 'ok', score: 80, mismo_dia: true,
  } as BabyRelocationOption;
  const otherDay = { ...sameDay, sesion_id: 's3', fecha: '2026-09-20', grupo_id: 'g3', score: 100, mismo_dia: false };
  equal(sortBabyRelocationOptions([otherDay, sameDay])[0].sesion_id, 's2', 'mismo día primero');
});

test('reubicación Baby excluye grupos PARTICULAR', () => {
  equal(isParticularAgendaGroupName('PARTICULAR · ANA'), true, 'particular con punto medio');
  equal(isParticularAgendaGroupName('Grupo 1 · Nivel A'), false, 'grupo normal');
  const session = direct();
  const group = {
    sesion_id: 's1', grupo_id: 'g1', nombre_grupo: 'PARTICULAR · ANA', nivel_grupo: 'A', pista: 'Pequeña',
    punto_encuentro: null, estado_grupo: 'Borrador', publicado: false, trabajo_diario: null,
    observaciones_importantes: null, entrenador_id: null, entrenador: null, estado_confirmacion: null,
    total_alumnos: 1, alumnos_lista: 'ANA · A',
  } as AgendaGrupoSesionApp;
  equal(realGroupToRelocationTarget(session, group), null, 'particular no es destino');
});

test('INICIACION puede completar propuesta A y A+ puede entrar en grupo A/A+', () => {
  const session = direct({ sesion_id: 's2', hora_inicio: '12:00', hora_fin: '14:00' });
  const proposalStudent = {
    sesion_id: 's2', grupo_recomendado: 'REVISAR · PAULA', bloque_tecnico: 'INICIACION / A',
    pista_recomendada: 'Pequeña', alumno_id: 'paula', alumno: 'PAULA', nivel_resumen: 'A',
    pista_alumno: 'Pequeña', orden_en_grupo: 1, alertas: null,
  } as AgendaRecomendacionSesionApp;
  const target = proposalGroupToRelocationTarget(session, 'REVISAR · PAULA', [proposalStudent]);
  if (!target) throw new Error('No se creó target de propuesta');
  const option = evaluateBabyRelocationTarget(
    { alumno_id: 'inigo', alumno: 'IÑIGO', nivel_resumen: 'INICIACION' },
    target,
    '2026-09-19'
  );
  equal(option.estado, 'RECOMENDADO', 'INICIACION + A');
  equal(option.total_final, 2, 'pareja resultante');

  const real = realGroupToRelocationTarget(
    direct({ sesion_id: 's3', fecha: '2026-09-20', hora_inicio: '09:45', hora_fin: '11:45' }),
    {
      sesion_id: 's3', grupo_id: 'g-real', nombre_grupo: 'Grupo A / A+', nivel_grupo: 'A / A+', pista: 'Pequeña',
      punto_encuentro: null, estado_grupo: 'Borrador', publicado: false, trabajo_diario: null,
      observaciones_importantes: null, entrenador_id: 'e1', entrenador: 'Carlos', estado_confirmacion: null,
      total_alumnos: 3, alumnos_lista: 'A1 · A || A2 · A+ || A3 · A',
    } as AgendaGrupoSesionApp
  );
  if (!real) throw new Error('No se creó target real');
  const juan = evaluateBabyRelocationTarget(
    { alumno_id: 'juan', alumno: 'JUAN', nivel_resumen: 'A+' }, real, '2026-09-20'
  );
  equal(juan.estado, 'RECOMENDADO', 'A+ entra en A/A+');
  equal(juan.total_final, 4, '3 a 4');
});

test('ratio Baby impide recomendar un quinto niño en pequeña con un entrenador', () => {
  const target = realGroupToRelocationTarget(
    direct({ sesion_id: 's2' }),
    {
      sesion_id: 's2', grupo_id: 'g2', nombre_grupo: 'Grupo A', nivel_grupo: 'A', pista: 'Pequeña',
      punto_encuentro: null, estado_grupo: 'Borrador', publicado: false, trabajo_diario: null,
      observaciones_importantes: null, entrenador_id: 'e1', entrenador: 'Carlos', estado_confirmacion: null,
      total_alumnos: 4, alumnos_lista: 'A1 · A || A2 · A || A3 · A || A4 · A',
    } as AgendaGrupoSesionApp
  );
  if (!target) throw new Error('No se creó target real');
  equal(
    evaluateBabyRelocationTarget({ alumno_id: 'a5', alumno: 'A5', nivel_resumen: 'A' }, target, '2026-09-19').estado,
    'NO_ENCAJA',
    'ratio 5/4'
  );
});

test('resumen semanal cuenta turnos distintos, dobles y entrenadores con cero', () => {
  const trainers = [
    { entrenador_id: 'e1', nombre_completo: 'CARLOS', activo: true },
    { entrenador_id: 'e2', nombre_completo: 'GUILLE', activo: true },
  ] as EntrenadorResumen[];
  const assignments = [
    { entrenador_id: 'e1', entrenador: 'CARLOS', grupo_id: 'g1', fecha: '2026-09-19', hora_inicio: '09:45', hora_fin: '11:45', modalidad: 'BABY' },
    { entrenador_id: 'e1', entrenador: 'CARLOS', grupo_id: 'g2', fecha: '2026-09-19', hora_inicio: '09:45', hora_fin: '11:45', modalidad: 'BABY' },
    { entrenador_id: 'e1', entrenador: 'CARLOS', grupo_id: 'g3', fecha: '2026-09-19', hora_inicio: '12:00', hora_fin: '14:00', modalidad: 'BABY' },
  ] as AgendaTrainerAssignmentRow[];
  const loads = buildWeeklyTrainerLoads({ weekStart: '2026-09-14', trainers, assignments });
  equal(loads.find((item) => item.trainerId === 'e1')?.turns, 2, 'dos turnos, no tres grupos');
  equal(loads.find((item) => item.trainerId === 'e1')?.doubles.length, 1, 'doble sábado');
  equal(loads.find((item) => item.trainerId === 'e2')?.turns, 0, 'entrenador sin turno visible');
});

test('cobertura por tarjeta muestra pendientes y nombres sin abrir sesión', () => {
  const session = {
    id: 'operativa-s1', fecha: '2026-09-19', hora_inicio: '09:45', hora_fin: '11:45', modalidad: 'BABY',
    titulo: 'Baby', estado: 'Grupos creados', totalAlumnos: 5, totalGrupos: 2, publicados: 0,
    origen: 'operativa', grupos: [], planningGrupos: [],
  } as SesionAgendaOperativa;
  const rows = [
    { entrenador_id: 'e1', entrenador: 'CARLOS', grupo_id: 'g1', fecha: '2026-09-19', hora_inicio: '09:45', hora_fin: '11:45', modalidad: 'BABY' },
  ] as AgendaTrainerAssignmentRow[];
  const coverage = sessionTrainerCoverage(session, rows);
  equal(coverage.assignedGroups, 1, 'un grupo cubierto');
  equal(coverage.pendingGroups, 1, 'un pendiente');
  equal(coverage.trainerNames.join(','), 'CARLOS', 'nombre visible');
  equal(pendingTrainerGroupsInSessions([session], rows), 1, 'pendiente semanal');
});


test('niveles de grupo real se leen de NIVEL y no de la columna PISTA', () => {
  const levels = levelsFromAgendaGroup({
    nivel_grupo: null,
    alumnos_lista: 'ANA · A+ · Pequeña || LEO · B · Pequeña/Grande',
  });
  equal(levels.join(','), 'A+,B', 'niveles desde alumnos_lista');
});

test('cobertura reconoce INTENSIVO e Intensivos como la misma modalidad', () => {
  const session = {
    id: 'intensivo-i1', fecha: '2026-09-19', hora_inicio: '15:00', hora_fin: '17:00', modalidad: 'INTENSIVO',
    titulo: 'Intensivo', estado: 'Grupos creados', totalAlumnos: 3, totalGrupos: 1, publicados: 0,
    origen: 'intensivo', grupos: [], planningGrupos: [],
  } as SesionAgendaOperativa;
  const rows = [
    { entrenador_id: 'e1', entrenador: 'CARLOS', grupo_id: 'g1', fecha: '2026-09-19', hora_inicio: '15:00', hora_fin: '17:00', modalidad: 'Intensivos' },
  ] as AgendaTrainerAssignmentRow[];
  equal(sessionTrainerCoverage(session, rows).assignedGroups, 1, 'intensivo cubierto');
});
