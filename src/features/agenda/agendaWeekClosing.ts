import { GROUP_OPERATION_RPC } from '../../core/groups/groupOperations';

/**
 * «Cerrar semana y avisar» (Entrenamientos).
 *
 * Antes solo enviaba el push de cierre, que cuenta ÚNICAMENTE los grupos
 * publicados. Si quedaba algún grupo sin publicar, su entrenador recibía
 * «Esta semana no tienes grupos asignados», y el cierre no se puede repetir.
 *
 * Ahora:
 *  1. Publica todos los grupos de la semana que están listos (entrenador +
 *     punto de encuentro, o particular), usando la misma función de Supabase
 *     que el botón «Publicar al entrenador», con todas sus validaciones.
 *  2. Si queda algún grupo sin publicar (le falta algo o Supabase lo rechaza),
 *     NO cierra la semana ni avisa, y dice exactamente qué grupos faltan.
 *  3. Solo cuando todo está publicado envía el aviso de cierre semanal.
 */

export type WeekClosingGroup = {
  grupo_id: string;
  nombre_grupo: string | null;
  publicado: boolean | null;
  entrenador_id: string | null;
  punto_encuentro: string | null;
};

export type WeekClosingPlan = {
  toPublish: WeekClosingGroup[];
  alreadyPublished: WeekClosingGroup[];
  notReady: Array<{ group: WeekClosingGroup; reason: string }>;
};

function isPrivateGroupName(name: string | null | undefined) {
  return String(name || '').trim().toUpperCase().startsWith('PARTICULAR ·');
}

export function planWeekClosing(groups: WeekClosingGroup[]): WeekClosingPlan {
  const plan: WeekClosingPlan = { toPublish: [], alreadyPublished: [], notReady: [] };
  for (const group of groups) {
    if (group.publicado) {
      plan.alreadyPublished.push(group);
    } else if (!group.entrenador_id) {
      plan.notReady.push({ group, reason: 'sin entrenador' });
    } else if (!isPrivateGroupName(group.nombre_grupo) && !String(group.punto_encuentro || '').trim()) {
      plan.notReady.push({ group, reason: 'sin punto de encuentro' });
    } else {
      plan.toPublish.push(group);
    }
  }
  return plan;
}

// 04/11: para decir QUÉ grupo falta (día, hora, modalidad), no solo su nombre.
export type WeekClosingSession = {
  sesion_id: string;
  fecha?: string | null;
  hora_inicio?: string | null;
  modalidad?: string | null;
};

const WEEK_DAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function describeClosingSession(session: WeekClosingSession | null | undefined) {
  if (!session) return '';
  const date = String(session.fecha || '').slice(0, 10);
  const parts: string[] = [];
  if (session.modalidad) parts.push(String(session.modalidad));
  if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    const day = WEEK_DAYS[new Date(`${date}T12:00:00Z`).getUTCDay()];
    parts.push(`${day} ${date.slice(8, 10)}/${date.slice(5, 7)}`);
  }
  const time = String(session.hora_inicio || '').slice(0, 5);
  if (time) parts.push(time);
  return parts.join(' · ');
}

/** Líneas de «faltan», ordenadas por día y hora: «Baby · Sáb 07/11 · 09:45 — Grupo 4: sin punto de encuentro». */
export function describeFailedGroups(
  failed: Array<{ group: WeekClosingGroup & { sesion_id?: string }; reason: string }>,
  sessions: WeekClosingSession[]
) {
  const byId = new Map(sessions.map((session) => [session.sesion_id, session]));
  return failed
    .map(({ group, reason }) => {
      const session = group.sesion_id ? byId.get(group.sesion_id) : undefined;
      const key = `${String(session?.fecha || '9999').slice(0, 10)} ${String(session?.hora_inicio || '').slice(0, 5)} ${session?.modalidad || ''}`;
      const where = describeClosingSession(session);
      return { key, name: group.nombre_grupo || 'Grupo', text: `• ${where ? `${where} — ` : ''}${group.nombre_grupo || 'Grupo'}: ${reason}` };
    })
    .sort((a, b) => a.key.localeCompare(b.key) || a.name.localeCompare(b.name, 'es', { numeric: true }))
    .map((line) => line.text);
}

function addDaysIso(isoDate: string, days: number) {
  const date = new Date(`${isoDate}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

type ClosingPushResult = { already_closed?: boolean; sent?: number; without_subscription?: number };

export async function closeWeekPublishingGroups(deps: {
  weekStart: string;
  weekLabel: string;
  query: <T>(table: string, query: string) => Promise<T[]>;
  runFunction: (name: string, body: object) => Promise<unknown>;
  sendClosingPush: () => Promise<ClosingPushResult>;
  reload: () => Promise<void>;
  confirm?: (message: string) => boolean;
  notify?: (message: string) => void;
}) {
  const confirm = deps.confirm || ((message: string) => window.confirm(message));
  const notify = deps.notify || ((message: string) => window.alert(message));

  try {
    const weekEnd = addDaysIso(deps.weekStart, 6);
    const sessions = await deps.query<WeekClosingSession>(
      'v_agenda_sesiones_operativa_app',
      `select=sesion_id,fecha,hora_inicio,modalidad&fecha=gte.${deps.weekStart}&fecha=lte.${weekEnd}`
    );
    const sessionIds = Array.from(new Set(sessions.map((s) => s.sesion_id).filter(Boolean)));
    const groups = sessionIds.length
      ? await deps.query<WeekClosingGroup & { sesion_id: string }>(
          'v_grupos_sesion_operativa_app',
          `select=sesion_id,grupo_id,nombre_grupo,publicado,entrenador_id,punto_encuentro&sesion_id=in.(${sessionIds.join(',')})`
        )
      : [];
    const plan = planWeekClosing(groups);

    const ok = confirm(
      `¿Cerrar la semana ${deps.weekLabel} y avisar a los entrenadores?\n\n` +
        `• Se publicarán ahora ${plan.toPublish.length} grupo(s) que están listos.\n` +
        `• Ya publicados: ${plan.alreadyPublished.length}.\n` +
        (plan.notReady.length
          ? `• Sin terminar: ${plan.notReady.length}. Si queda alguno, NO se cerrará la semana ni se avisará.\n`
          : '') +
        `\nSolo cuando estén todos publicados se envía el aviso de cierre a los entrenadores.`
    );
    if (!ok) return;

    const failed: Array<{ group: WeekClosingGroup & { sesion_id?: string }; reason: string }> = [...plan.notReady];
    for (const group of plan.toPublish) {
      try {
        await deps.runFunction(GROUP_OPERATION_RPC.publish, { p_grupo_id: group.grupo_id });
      } catch (err) {
        failed.push({ group, reason: err instanceof Error ? err.message : 'Supabase no permitió publicarlo' });
      }
    }

    await deps.reload();

    const published = plan.toPublish.length - (failed.length - plan.notReady.length);
    if (failed.length > 0) {
      notify(
        `Publicados ahora: ${published}. LA SEMANA NO SE HA CERRADO y no se ha avisado a nadie, porque faltan:\n\n` +
          describeFailedGroups(failed, sessions).join('\n') +
          `\n\nCompleta esos grupos (o quítalos) y vuelve a pulsar «Cerrar semana y avisar».`
      );
      return;
    }

    const result = await deps.sendClosingPush();
    if (result.already_closed) {
      notify(`Publicados ahora: ${published}. Esta semana ya estaba cerrada: el aviso de cierre ya se había enviado antes.`);
    } else {
      notify(
        `Semana cerrada. Publicados ahora: ${published}. Entrenadores avisados por push: ${Number(result.sent || 0)}. ` +
          `Sin avisos activados: ${Number(result.without_subscription || 0)}.`
      );
    }
  } catch (err) {
    notify(err instanceof Error ? err.message : 'No se pudo cerrar la semana.');
  }
}
