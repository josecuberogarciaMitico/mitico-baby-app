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
