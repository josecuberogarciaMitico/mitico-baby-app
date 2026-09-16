import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import type { PerfilOperativoAlumnoApp } from '../../core/students/studentTypes';
import { obtenerAccessTokenSupabaseApp } from '../auth/authService';
import { createSupabaseRestClient } from '../supabase/restClient';
import { aplicarCinturonPedagogicoAutomaticoAgenda } from '../../features/baby/babyRecommendation';
import type {
  AgendaAlumnoSesionApp,
  AgendaGrupoSesionApp,
  AgendaRecomendacionSesionApp,
  AgendaSesionDirectaApp,
} from '../../features/agenda/agendaTypes';
import {
  addIsoDays,
  evaluateBabyRelocationTarget,
  isBabyAgendaSession,
  mondayOfIsoWeek,
  proposalGroupToRelocationTarget,
  realGroupToRelocationTarget,
  sortBabyRelocationOptions,
  type BabyRelocationOption,
  type BabyRelocationStudent,
  type BabyRelocationTarget,
} from '../../features/agenda/agendaRelocation';

const supabase = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

function queryEq(value: string) {
  return encodeURIComponent(`eq.${value}`);
}

function groupProposalRows(rows: AgendaRecomendacionSesionApp[]) {
  const groups = new Map<string, AgendaRecomendacionSesionApp[]>();
  rows.forEach((student) => {
    groups.set(student.grupo_recomendado, [
      ...(groups.get(student.grupo_recomendado) || []),
      student,
    ]);
  });
  return groups;
}

async function loadOperationalProfiles() {
  try {
    const rows = await supabase.rpcRows<PerfilOperativoAlumnoApp>(
      'obtener_perfil_operativo_alumnos_app',
      {}
    );
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

async function buildTargetsForSession(
  session: AgendaSesionDirectaApp,
  profiles: PerfilOperativoAlumnoApp[]
): Promise<{ targets: BabyRelocationTarget[]; rosterStudentIds: Set<string> }> {
  const sessionFilter = queryEq(session.sesion_id);
  const [realGroups, roster, baseProposal] = await Promise.all([
    supabase.query<AgendaGrupoSesionApp>(
      'v_grupos_sesion_operativa_app',
      `select=*&sesion_id=${sessionFilter}&order=nombre_grupo.asc`
    ),
    supabase.query<AgendaAlumnoSesionApp>(
      'v_sesion_alumnos_operativa_app',
      `select=*&sesion_id=${sessionFilter}&order=orden.asc`
    ),
    supabase
      .rpcRows<AgendaRecomendacionSesionApp>(
        'recomendar_grupos_sesion_operativa_app',
        { p_sesion_id: session.sesion_id }
      )
      .catch(() => []),
  ]);

  const targets: BabyRelocationTarget[] = realGroups
    .map((group) => realGroupToRelocationTarget(session, group))
    .filter((target): target is BabyRelocationTarget => Boolean(target));

  const proposal = aplicarCinturonPedagogicoAutomaticoAgenda(baseProposal, {
    usarPerfilBaby: profiles.length > 0,
    perfiles: profiles,
  });

  groupProposalRows(proposal).forEach((students, groupName) => {
    const target = proposalGroupToRelocationTarget(session, groupName, students);
    if (target) targets.push(target);
  });

  return {
    targets,
    rosterStudentIds: new Set(roster.map((student) => student.alumno_id)),
  };
}

export async function loadBabyRelocationOptions(input: {
  sourceSessionId: string;
  students: BabyRelocationStudent[];
}): Promise<Record<string, BabyRelocationOption[]>> {
  if (!input.sourceSessionId || input.students.length === 0) return {};

  const allSessions = await supabase.query<AgendaSesionDirectaApp>(
    'v_agenda_sesiones_operativa_app',
    'select=*&order=fecha.asc,hora_inicio.asc'
  );
  const sourceSession = allSessions.find(
    (session) => session.sesion_id === input.sourceSessionId
  );
  if (!sourceSession || !isBabyAgendaSession(sourceSession)) return {};

  const weekStart = mondayOfIsoWeek(sourceSession.fecha);
  const weekEnd = addIsoDays(weekStart, 6);
  const candidateSessions = allSessions.filter(
    (session) =>
      session.sesion_id !== sourceSession.sesion_id &&
      isBabyAgendaSession(session) &&
      session.fecha >= weekStart &&
      session.fecha <= weekEnd
  );

  const result: Record<string, BabyRelocationOption[]> = Object.fromEntries(
    input.students.map((student) => [student.alumno_id, []])
  );
  if (candidateSessions.length === 0) return result;

  const profiles = await loadOperationalProfiles();
  const sessionData = await Promise.all(
    candidateSessions.map(async (session) => ({
      session,
      ...(await buildTargetsForSession(session, profiles)),
    }))
  );

  for (const student of input.students) {
    const options: BabyRelocationOption[] = [];
    for (const data of sessionData) {
      // El alumno ya inscrito en ese turno nunca se recomienda de nuevo.
      if (data.rosterStudentIds.has(student.alumno_id)) continue;
      for (const target of data.targets) {
        const option = evaluateBabyRelocationTarget(
          student,
          target,
          sourceSession.fecha
        );
        if (option.estado === 'RECOMENDADO') options.push(option);
      }
    }
    result[student.alumno_id] = sortBabyRelocationOptions(options).slice(0, 5);
  }

  return result;
}

export type MoveBabyBetweenSessionsResult = {
  ok: boolean;
  alumno_id: string;
  sesion_origen_id: string;
  sesion_destino_id: string;
  grupo_destino_id: string | null;
  grupo_destino: string | null;
  incorporado_a_grupo: boolean;
};

export async function moveBabyStudentBetweenSessions(input: {
  sourceSessionStudentId: string;
  targetSessionId: string;
  targetGroupId: string | null;
}) {
  return supabase.rpcJson<MoveBabyBetweenSessionsResult>(
    'mover_alumno_entre_turnos_operativa_app',
    {
      p_sesion_alumno_id: input.sourceSessionStudentId,
      p_sesion_destino_id: input.targetSessionId,
      p_grupo_destino_id: input.targetGroupId,
    }
  );
}
