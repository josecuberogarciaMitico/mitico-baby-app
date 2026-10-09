/**
 * Entrenador fijo de los grupos estables de Ocio (solo Ocio; Baby no tiene fijos).
 *
 * - El fijo se guarda en el grupo estable (ocio_grupos_estables.entrenador_fijo_id).
 * - Al volcar la semana a Días de entrenamiento, cada grupo operativo recibe a su
 *   fijo SOLO si está "Disponible" y libre en ese turno (lo decide Supabase con
 *   las mismas reglas que la asignación manual). Si no, el grupo queda sin
 *   entrenador y aquí se genera un aviso con los disponibles para elegir.
 * - Un cambio de entrenador en una semana es puntual: no toca el fijo.
 *
 * Los avisos viven en un estado mínimo compartido (mismo patrón que
 * studentFichaStore) para no pasar más props por App.tsx.
 */

export const OCIO_FIXED_TRAINER_RPC = {
  save: 'asignar_entrenador_fijo_grupo_ocio_app',
  apply: 'aplicar_entrenador_fijo_grupo_operativo_ocio_app',
} as const;

export type OcioFixedTrainerState =
  | 'SIN_FIJO'
  | 'YA_TIENE'
  | 'ASIGNADO'
  | 'NO_DISPONIBLE'
  | 'OCUPADO'
  | 'NO_ASIGNABLE';

export type OcioFixedTrainerResult = {
  estado: OcioFixedTrainerState;
  entrenador_fijo?: string | null;
  respuesta?: string | null;
  detalle?: string | null;
  sugeridos?: string[] | null;
};

export type OcioFixedTrainerPair = {
  groupId: string;
  stableGroupId: string;
};

type PreparedSourceGroup =
  | { grupo_id: string }
  | { weeklyGroupId: string; sourceGroupId: string | null };

type PreparedResult = { grupo_id: string | null };

export type OcioRpcRunner = (
  rpc: string,
  params: Record<string, unknown>
) => Promise<unknown>;

function availableText(suggested: string[] | null | undefined): string {
  const names = (suggested || []).map((name) => String(name || '').trim()).filter(Boolean);
  return names.length > 0
    ? ` Disponibles y libres: ${names.join(', ')}.`
    : ' No hay otros entrenadores disponibles y libres en ese turno.';
}

/** Texto del aviso naranja; null cuando no hay nada que avisar. */
export function ocioFixedTrainerNotice(
  result: OcioFixedTrainerResult | null | undefined
): string | null {
  if (!result) return null;
  const fixed = String(result.entrenador_fijo || '').trim() || 'el entrenador fijo';
  switch (result.estado) {
    case 'NO_DISPONIBLE': {
      const answer = String(result.respuesta || '').trim();
      return `El fijo (${fixed}) no está disponible esta semana${
        answer ? ` (${answer})` : ''
      }.${availableText(result.sugeridos)}`;
    }
    case 'OCUPADO':
      return `El fijo (${fixed}) ya tiene otro grupo en ese turno.${availableText(
        result.sugeridos
      )}`;
    case 'NO_ASIGNABLE':
      return `No se pudo poner al fijo (${fixed}): ${
        String(result.detalle || '').trim() || 'motivo desconocido'
      }.${availableText(result.sugeridos)}`;
    default:
      return null;
  }
}

/**
 * Empareja cada grupo volcado con su grupo estable de origen. Los resultados se
 * generan en el mismo orden que los grupos. Los grupos temporales no tienen
 * grupo estable y por tanto no tienen fijo.
 */
export function ocioFixedTrainerPairs(
  groups: PreparedSourceGroup[],
  results: PreparedResult[]
): OcioFixedTrainerPair[] {
  if (groups.length !== results.length) return [];
  const pairs: OcioFixedTrainerPair[] = [];
  groups.forEach((group, index) => {
    const groupId = String(results[index]?.grupo_id || '').trim();
    const stableGroupId = String(
      'weeklyGroupId' in group ? group.sourceGroupId || '' : group.grupo_id || ''
    ).trim();
    if (groupId && stableGroupId) pairs.push({ groupId, stableGroupId });
  });
  return pairs;
}

export type StableGroupWithFixedTrainer = {
  grupo_id: string;
  entrenador_fijo_id?: string | null;
};

/**
 * Solo los grupos cuyo grupo estable tiene fijo. Si la migración aún no está
 * aplicada, ningún grupo trae entrenador_fijo_id y no se llama a Supabase.
 */
export function ocioFixedTrainerPairsToApply(
  groups: PreparedSourceGroup[],
  results: PreparedResult[],
  stableGroups: StableGroupWithFixedTrainer[]
): OcioFixedTrainerPair[] {
  const withFixed = new Set(
    stableGroups
      .filter((group) => String(group.entrenador_fijo_id || '').trim())
      .map((group) => group.grupo_id)
  );
  return ocioFixedTrainerPairs(groups, results).filter((pair) =>
    withFixed.has(pair.stableGroupId)
  );
}

// ---------------------------------------------------------------------------
// Avisos compartidos (por grupo operativo)

let notices: Record<string, string> = {};
const subscribers = new Set<() => void>();

export function subscribeOcioFixedTrainerNotices(fn: () => void): () => void {
  subscribers.add(fn);
  return () => {
    subscribers.delete(fn);
  };
}

export function getOcioFixedTrainerNotices(): Record<string, string> {
  return notices;
}

function setNotices(next: Record<string, string>) {
  notices = next;
  subscribers.forEach((fn) => fn());
}

/**
 * Aplica el entrenador fijo a los grupos recién volcados. Nunca lanza: un
 * problema con el fijo no debe deshacer el volcado de alumnos.
 */
export async function aplicarEntrenadoresFijosOcio(
  groups: PreparedSourceGroup[],
  results: PreparedResult[],
  run: OcioRpcRunner,
  stableGroups: StableGroupWithFixedTrainer[]
): Promise<Record<string, string>> {
  const next = { ...notices };
  for (const pair of ocioFixedTrainerPairsToApply(groups, results, stableGroups)) {
    delete next[pair.groupId];
    try {
      const result = (await run(OCIO_FIXED_TRAINER_RPC.apply, {
        p_grupo_id: pair.groupId,
        p_grupo_ocio_id: pair.stableGroupId,
      })) as OcioFixedTrainerResult | null;
      const notice = ocioFixedTrainerNotice(result);
      if (notice) next[pair.groupId] = notice;
    } catch (error) {
      next[pair.groupId] = `No se pudo comprobar el entrenador fijo: ${
        error instanceof Error ? error.message : 'error desconocido'
      }`;
    }
  }
  setNotices(next);
  return next;
}
