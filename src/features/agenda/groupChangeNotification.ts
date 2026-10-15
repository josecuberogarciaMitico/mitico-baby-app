import { GROUP_OPERATION_RPC } from '../../core/groups/groupOperations';

/**
 * «Avisar cambios y pedir reconfirmación» (Entrenamientos).
 *
 * Mover alumnos entre grupos NO toca la confirmación del entrenador a propósito
 * (para no molestarle por cambios menores). Cuando coordinación decide que el
 * cambio sí es importante (p. ej. dividir un grupo de 6 en dos de 3), esta
 * acción explícita:
 *  1. Pone en «Pendiente» la confirmación de los entrenadores que ya habían
 *     confirmado ese grupo (RPC de Supabase, que devuelve a quién afectó).
 *  2. Envía un push a esos entrenadores. El aviso va por una acción propia
 *     (`group_changed`) que NO se deduplica por semana, a diferencia de
 *     `group_published`.
 */

export type GroupChangeRpcResult = {
  ok?: boolean;
  grupo_id?: string;
  nombre_grupo?: string | null;
  fecha?: string | null;
  reconfirmacion_at?: string;
  afectados?: Array<{ entrenador_id: string; rol?: string }>;
};

export const GROUP_CHANGE_CONFIRM_MESSAGE =
  'Esto avisará con un push al entrenador (o entrenadores) que ya había confirmado este grupo y le pedirá que vuelva a confirmarlo. Úsalo solo si el grupo ha cambiado de verdad (p. ej. cambió la composición). ¿Continuar?';

export function affectedTrainerIds(result: GroupChangeRpcResult | null | undefined): string[] {
  const ids = (result?.afectados || [])
    .map((item) => String(item?.entrenador_id || '').trim())
    .filter(Boolean);
  return Array.from(new Set(ids));
}

export async function notifyGroupChangedAndRequestReconfirmation(deps: {
  groupId: string;
  runFunction: <T>(name: string, body: object) => Promise<T>;
  sendPush: (action: string, payload: Record<string, unknown>) => Promise<unknown>;
  reload: () => Promise<void>;
  confirm?: (message: string) => boolean;
  notify?: (message: string) => void;
}): Promise<{ skipped: boolean; trainerIds: string[]; pushFailed: boolean }> {
  const confirm = deps.confirm || ((message: string) => window.confirm(message));
  const notify = deps.notify || ((message: string) => window.alert(message));

  if (!confirm(GROUP_CHANGE_CONFIRM_MESSAGE)) {
    return { skipped: true, trainerIds: [], pushFailed: false };
  }

  const result = await deps.runFunction<GroupChangeRpcResult>(
    GROUP_OPERATION_RPC.notifyChanged,
    { p_grupo_id: deps.groupId }
  );
  const trainerIds = affectedTrainerIds(result);

  let pushFailed = false;
  if (trainerIds.length === 0) {
    notify('Este grupo no tenía ningún entrenador confirmado todavía; no hacía falta avisar.');
  } else {
    try {
      await deps.sendPush('group_changed', {
        grupo_id: deps.groupId,
        entrenador_ids: trainerIds,
      });
    } catch (error) {
      pushFailed = true;
      notify(
        `Se ha pedido la reconfirmación, pero no se pudo enviar el aviso push (${
          error instanceof Error ? error.message : String(error)
        }). El entrenador la verá igualmente como pendiente en su vista.`
      );
    }
  }

  await deps.reload();
  return { skipped: false, trainerIds, pushFailed };
}
