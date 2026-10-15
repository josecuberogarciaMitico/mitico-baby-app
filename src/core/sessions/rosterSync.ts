export type RosterIdentity = {
  id?: string | null;
  name: string;
};

export type RosterRefreshEvidence = {
  activeNames: string[];
  cancelledNames: string[];
  safeZero: boolean;
};

export type RosterRefreshAssessment = {
  status: 'SAFE' | 'BLOCKED';
  additions: string[];
  removals: RosterIdentity[];
  issues: string[];
};

export function normalizeRosterName(value: string | null | undefined): string {
  return String(value || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizedSet(values: string[]): Set<string> {
  return new Set(values.map(normalizeRosterName).filter(Boolean));
}

function duplicateNames(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  values.forEach((value) => {
    const key = normalizeRosterName(value);
    if (!key) return;
    if (seen.has(key)) duplicates.add(value.trim());
    seen.add(key);
  });
  return Array.from(duplicates);
}

export function assessRosterRefresh(
  current: RosterIdentity[],
  evidence: RosterRefreshEvidence
): RosterRefreshAssessment {
  const active = normalizedSet(evidence.activeNames);
  const cancelled = normalizedSet(evidence.cancelledNames);
  const currentNames = normalizedSet(current.map((member) => member.name));
  const issues: string[] = [];
  const duplicates = duplicateNames(evidence.activeNames);
  if (duplicates.length > 0) {
    issues.push(
      `AimHarder contiene nombres activos duplicados o indistinguibles: ${duplicates.join(', ')}.`
    );
  }

  const removals = current.filter((member) => {
    const key = normalizeRosterName(member.name);
    return Boolean(key) && !active.has(key);
  });
  const unjustified = removals.filter(
    (member) => !cancelled.has(normalizeRosterName(member.name))
  );
  if (unjustified.length > 0) {
    issues.push(
      `AimHarder no marca como cancelado(s) a ${unjustified
        .map((member) => member.name)
        .join(', ')}.`
    );
  }
  if (active.size === 0 && current.length > 0 && evidence.safeZero !== true) {
    issues.push(
      `AimHarder devuelve 0 activos para una sesión con ${current.length} alumno(s) sin acreditar una cancelación total.`
    );
  }

  return {
    status: issues.length > 0 ? 'BLOCKED' : 'SAFE',
    additions: evidence.activeNames.filter(
      (name) => !currentNames.has(normalizeRosterName(name))
    ),
    removals,
    issues,
  };
}

// Reglas del lector SQL de listados (crear_sesion_operativa_desde_listado_app):
// una línea que no cumpla esto se ignora al volcarla. Un alumno YA guardado en
// la sesión cuyo nombre no las cumpla se perdería al re-enviarlo, así que el
// modo "solo añadir" no se aplica si aparece alguno.
const LIST_IMPORT_METADATA_PREFIX =
  /^(?:RESERVA |ULTIMA RESERVA|TERMINA TARIFA|TARIFA|INSCRIPCION|PAGO|BONO|OBSERVACION|FECHA|ULTIMO)/;
const LIST_IMPORT_SPLIT_PHRASE = /(RESERVA EL|ULTIMA RESERVA:|TERMINA TARIFA EL)/;

export function isRosterNameSafeForListImport(value: string | null | undefined): boolean {
  const normalized = normalizeRosterName(value);
  if (!normalized) return false;
  if (LIST_IMPORT_METADATA_PREFIX.test(normalized)) return false;
  if (LIST_IMPORT_SPLIT_PHRASE.test(normalized)) return false;
  if (/[0-9]/.test(normalized)) return false;
  // El lector SQL interpreta estos finales como un nivel y los quita del nombre.
  if (/(^| )INICIACION$/.test(normalized)) return false;
  if (/[ABCD]\+$/.test(normalized)) return false;
  if (/\s[ABCD]$/.test(normalized)) return false;
  if (normalized.length < 5) return false;
  if (normalized.split(' ').filter(Boolean).length < 2) return false;
  return true;
}

export type AddOnlyRosterPlan = {
  status: 'ADD' | 'NOTHING_TO_ADD' | 'BLOCKED';
  // Nombres de la lectura que todavía no están en la sesión y se pueden volcar.
  additions: string[];
  // Nombres nuevos que el volcado automático no puede leer bien.
  unsupportedAdditions: string[];
  // Alumnos actuales que se quedan en la sesión (y en su grupo).
  kept: RosterIdentity[];
  // De los que se quedan, los que no salen en la lectura: NO se quitan.
  keptMissing: RosterIdentity[];
  // Alumnos actuales que AimHarder marca explícitamente como cancelados: se
  // retiran igual que en un refresco normal (con la protección de asistencia).
  cancelledRemovals: RosterIdentity[];
  // Listado a volcar: los que se quedan + los nuevos.
  mergedRosterNames: string[];
  issues: string[];
};

// Plan "solo añadir": cuando el candado bloquea un refresco porque falta en la
// lectura algún alumno que ya estaba en la sesión, se puede seguir añadiendo a
// los nuevos sin quitar a nadie. Nadie sale de la sesión salvo quien AimHarder
// marque explícitamente como cancelado (la misma regla del candado).
export function planAddOnlyRosterRefresh(
  current: RosterIdentity[],
  evidence: RosterRefreshEvidence
): AddOnlyRosterPlan {
  const issues: string[] = [];
  const duplicates = duplicateNames(evidence.activeNames);
  if (duplicates.length > 0) {
    issues.push(
      `La lectura contiene nombres duplicados o indistinguibles: ${duplicates.join(', ')}.`
    );
  }
  const active = normalizedSet(evidence.activeNames);
  if (active.size === 0 && current.length > 0 && evidence.safeZero !== true) {
    issues.push(
      `La lectura devuelve 0 alumnos para una sesión con ${current.length} alumno(s).`
    );
  }

  const cancelled = normalizedSet(evidence.cancelledNames);
  const cancelledRemovals = current.filter((member) => {
    const key = normalizeRosterName(member.name);
    return Boolean(key) && !active.has(key) && cancelled.has(key);
  });
  const cancelledKeys = new Set(
    cancelledRemovals.map((member) => normalizeRosterName(member.name))
  );
  const kept = current.filter(
    (member) => !cancelledKeys.has(normalizeRosterName(member.name))
  );
  const keptMissing = kept.filter(
    (member) => !active.has(normalizeRosterName(member.name))
  );

  const unsafeKept = kept.filter((member) => !isRosterNameSafeForListImport(member.name));
  if (unsafeKept.length > 0) {
    issues.push(
      `No puedo añadir sin riesgo porque el nombre guardado de ${unsafeKept
        .map((member) => member.name)
        .join(', ')} no se puede re-leer bien y podría salirse de la sesión. Usa "+ Alumno fuera de plazo".`
    );
  }

  const currentKeys = normalizedSet(current.map((member) => member.name));
  const seen = new Set<string>();
  const newNames = evidence.activeNames
    .map((name) => String(name || '').trim())
    .filter((name) => {
      const key = normalizeRosterName(name);
      if (!key || currentKeys.has(key) || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  const additions = newNames.filter((name) => isRosterNameSafeForListImport(name));
  const unsupportedAdditions = newNames.filter(
    (name) => !isRosterNameSafeForListImport(name)
  );

  const status: AddOnlyRosterPlan['status'] =
    issues.length > 0
      ? 'BLOCKED'
      : additions.length === 0 && cancelledRemovals.length === 0
        ? 'NOTHING_TO_ADD'
        : 'ADD';

  return {
    status,
    additions,
    unsupportedAdditions,
    kept,
    keptMissing,
    cancelledRemovals,
    mergedRosterNames: [...kept.map((member) => member.name), ...additions],
    issues,
  };
}

// Misma normalización que public.normalizar_nombre_app (Supabase), que es la
// que usa el volcado de listados para encontrar la ficha de cada nombre.
export function normalizeNameLikeListImport(value: string | null | undefined): string {
  const from = 'ÁÉÍÓÚÜáéíóúüÑñ';
  const to = 'AEIOUUAEIOUUNN';
  const translated = Array.from(String(value || ''))
    .map((char) => {
      const index = from.indexOf(char);
      return index >= 0 ? to[index] : char;
    })
    .join('');
  return translated.toUpperCase().replace(/\s+/g, ' ').trim();
}

export type ListImportFicha = {
  id: string;
  nombre_normalizado: string | null;
  activo: boolean | null;
  created_at: string | null;
};

// El volcado SQL vuelve a buscar la ficha de cada nombre (primero activas, y
// la más reciente). Si para un alumno que ya está en la sesión encontraría una
// ficha DISTINTA (duplicados, nombre cambiado...), ese alumno saldría de su
// grupo. Devuelve los nombres en riesgo para no aplicar el volcado.
export function findListImportIdentityConflicts(
  members: Array<{ alumnoId: string; name: string }>,
  fichas: ListImportFicha[]
): string[] {
  const byName = new Map<string, ListImportFicha[]>();
  fichas.forEach((ficha) => {
    const key = String(ficha.nombre_normalizado || '');
    if (!key) return;
    byName.set(key, [...(byName.get(key) || []), ficha]);
  });
  return members
    .filter((member) => {
      const candidates = [...(byName.get(normalizeNameLikeListImport(member.name)) || [])];
      candidates.sort((a, b) => {
        const activeA = a.activo === false ? 1 : 0;
        const activeB = b.activo === false ? 1 : 0;
        if (activeA !== activeB) return activeA - activeB;
        return String(b.created_at || '').localeCompare(String(a.created_at || ''));
      });
      return !candidates[0] || candidates[0].id !== member.alumnoId;
    })
    .map((member) => member.name);
}

export type RosterCleanupPlan = {
  status: 'SAFE' | 'BLOCKED';
  removable: RosterIdentity[];
  protected: RosterIdentity[];
  missingActiveNames: string[];
};

export function planRosterCleanup(
  currentAfterRefresh: RosterIdentity[],
  activeNames: string[],
  protectedNames: string[]
): RosterCleanupPlan {
  const active = normalizedSet(activeNames);
  const protectedSet = normalizedSet(protectedNames);
  const current = normalizedSet(currentAfterRefresh.map((member) => member.name));
  const missingActiveNames = activeNames.filter(
    (name) => !current.has(normalizeRosterName(name))
  );
  const surplus = currentAfterRefresh.filter((member) => {
    const key = normalizeRosterName(member.name);
    return Boolean(key) && !active.has(key);
  });

  return {
    status: missingActiveNames.length > 0 ? 'BLOCKED' : 'SAFE',
    removable: surplus.filter(
      (member) => !protectedSet.has(normalizeRosterName(member.name))
    ),
    protected: surplus.filter((member) =>
      protectedSet.has(normalizeRosterName(member.name))
    ),
    missingActiveNames,
  };
}

export type RosterVerification = {
  matches: boolean;
  missingActiveNames: string[];
  unexpectedMembers: RosterIdentity[];
};

export function verifyRosterSnapshot(
  current: RosterIdentity[],
  activeNames: string[],
  protectedNames: string[]
): RosterVerification {
  const active = normalizedSet(activeNames);
  const protectedSet = normalizedSet(protectedNames);
  const currentSet = normalizedSet(current.map((member) => member.name));
  const missingActiveNames = activeNames.filter(
    (name) => !currentSet.has(normalizeRosterName(name))
  );
  const unexpectedMembers = current.filter((member) => {
    const key = normalizeRosterName(member.name);
    return Boolean(key) && !active.has(key) && !protectedSet.has(key);
  });
  return {
    matches: missingActiveNames.length === 0 && unexpectedMembers.length === 0,
    missingActiveNames,
    unexpectedMembers,
  };
}
