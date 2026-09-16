import {
  TECHNICAL_LEVEL_ORDER,
  parseTechnicalLevel,
  type TechnicalLevel,
} from '../levels/levelContract';

export type RecommendationStatus = 'RECOMENDADO' | 'REVISAR' | 'NO_ENCAJA';

export type LevelCompatibility = {
  status: RecommendationStatus;
  reason: string;
  score: number;
};

export type PedagogicalBand = {
  id: 'INICIACION_A' | 'APLUS' | 'B_BPLUS' | 'C_D' | 'REVIEW';
  label: string;
  block: string;
  piste: 'Pequeña' | 'Pequeña/Grande' | 'Grande' | 'Por definir';
  order: number;
  maxSize: number;
};

export type StudentForGroupValidation = {
  level?: string | null;
  source?: string | null;
  recordStatus?: string | null;
  alerts?: string | null;
};

export type GroupPedagogicalValidation = {
  status: 'BLOQUEADO' | 'SUPERVISION_JOSE' | 'AVISO' | 'OK';
  levels: TechnicalLevel[];
  messages: string[];
};

function validOrder(value: unknown) {
  const parsed = parseTechnicalLevel(value);
  return parsed.status === 'VALID'
    ? { level: parsed.level, order: TECHNICAL_LEVEL_ORDER[parsed.level] }
    : null;
}

export function recommendLevelCompatibility(
  studentLevel: unknown,
  groupLevels: unknown[]
): LevelCompatibility {
  const student = validOrder(studentLevel);
  if (!student) {
    return {
      status: 'REVISAR',
      reason:
        'El alumno no tiene un nivel individual válido. Revisa la ficha antes de recomendar grupo.',
      score: 0,
    };
  }

  const parsedGroup = groupLevels.map(validOrder);
  if (parsedGroup.some((level) => level === null)) {
    return {
      status: 'REVISAR',
      reason:
        'La composición contiene un nivel no reconocido. No se asignará un nivel alternativo automáticamente.',
      score: 0,
    };
  }

  const orders = parsedGroup.length
    ? parsedGroup.map((level) => level?.order as number)
    : [student.order];
  const set = Array.from(new Set([...orders, student.order])).sort(
    (a, b) => a - b
  );
  const min = Math.min(...set);
  const max = Math.max(...set);

  if (min === 0 && max >= 2) {
    return {
      status: 'NO_ENCAJA',
      reason: 'Iniciación no debe mezclarse automáticamente con A+ o superior.',
      score: 10,
    };
  }

  if (set.includes(2) && set.includes(3)) {
    return {
      status: 'REVISAR',
      reason: 'A+ con B requiere revisión manual.',
      score: 68,
    };
  }

  if (max - min > 1) {
    return {
      status: 'NO_ENCAJA',
      reason: 'Diferencia técnica demasiado grande para recomendarlo.',
      score: 15,
    };
  }

  const automaticPairs = new Set([
    '0-0',
    '0-1',
    '1-1',
    '1-2',
    '2-2',
    '3-3',
    '3-4',
    '4-4',
    '4-5',
    '5-5',
    '5-6',
    '6-6',
    '6-7',
    '7-7',
    '7-8',
    '8-8',
  ]);

  if (automaticPairs.has(`${min}-${max}`)) {
    return {
      status: 'RECOMENDADO',
      reason:
        min === max
          ? 'Mismo nivel técnico.'
          : 'Niveles adyacentes compatibles según la política base.',
      score: min === max ? 100 : 90,
    };
  }

  return {
    status: 'REVISAR',
    reason: 'Encaje posible, pero conviene validarlo manualmente.',
    score: 60,
  };
}

export function pedagogicalBandForLevel(value: unknown): PedagogicalBand {
  const level = validOrder(value);

  if (!level) {
    return {
      id: 'REVIEW',
      label: 'REVISAR NIVEL',
      block: 'REVISIÓN MANUAL',
      piste: 'Por definir',
      order: 99,
      maxSize: 1,
    };
  }

  if (level.order <= 1) {
    return {
      id: 'INICIACION_A',
      label: 'INICIACIÓN / A',
      block: 'INICIACIÓN / A',
      piste: 'Pequeña',
      order: 0,
      maxSize: 5,
    };
  }

  if (level.order === 2) {
    return {
      id: 'APLUS',
      label: 'A+',
      block: 'A+',
      piste: 'Pequeña',
      order: 2,
      maxSize: 5,
    };
  }

  if (level.order <= 4) {
    return {
      id: 'B_BPLUS',
      label: 'B / B+',
      block: 'B / B+',
      piste: 'Pequeña/Grande',
      order: 3,
      maxSize: 6,
    };
  }

  return {
    id: 'C_D',
    label: 'C / D',
    block: 'C / D',
    piste: 'Grande',
    order: 5,
    maxSize: 7,
  };
}

export function validateGroupPedagogy(
  students: StudentForGroupValidation[]
): GroupPedagogicalValidation {
  const parsed = students.map((student) => validOrder(student.level));
  const valid = parsed.filter(
    (level): level is { level: TechnicalLevel; order: number } => level !== null
  );
  const orders = valid.map((level) => level.order);
  const levels = Array.from(new Set(valid.map((level) => level.level)));
  const text = students
    .map(
      (student) =>
        `${student.source || ''} ${student.recordStatus || ''} ${student.alerts || ''}`
    )
    .join(' ')
    .toLowerCase();

  const blocked: string[] = [];
  const supervision: string[] = [];
  const notices: string[] = [];

  const invalidCount = parsed.length - valid.length;
  if (invalidCount > 0) {
    blocked.push(
      `Hay ${invalidCount} alumno(s) sin nivel individual válido. Revisa sus fichas antes de crear o publicar el grupo.`
    );
  }

  if (students.length === 0) blocked.push('Grupo sin alumnos.');
  if (students.length === 1) {
    blocked.push(
      'Grupo de 1 alumno: no es una composición publicable. Reorganiza al alumno en otro grupo.'
    );
  }
  if (students.length === 2) {
    supervision.push(
      'Grupo de 2 alumnos: permitido como excepción de coordinación.'
    );
  }
  if (students.length >= 8) {
    blocked.push(
      `Grupo de ${students.length} alumnos: con 8 o más deben crearse 2 grupos.`
    );
  }

  const hasInitiation = orders.some((order) => order === 0);
  const hasA = orders.some((order) => order === 1);
  const hasAPlus = orders.some((order) => order === 2);
  const hasB = orders.some((order) => order === 3);
  const hasBPlus = orders.some((order) => order === 4);
  const hasC = orders.some((order) => order === 5 || order === 6);
  const hasCOrHigher = orders.some((order) => order >= 5);
  const hasBOrHigher = orders.some((order) => order >= 3);

  if (hasInitiation && hasBOrHigher) {
    supervision.push(
      'INICIACIÓN no puede mezclarse con B, B+, C, C+, D o D+. Ajuste manual: requiere confirmación de Jose.'
    );
  }
  if (hasInitiation && hasAPlus) {
    supervision.push(
      'INICIACIÓN solo puede mezclarse con A, no con A+. Ajuste manual: requiere confirmación de Jose.'
    );
  }
  if ((hasInitiation || hasA) && hasCOrHigher) {
    supervision.push(
      'INICIACIÓN/A no puede mezclarse con C, C+, D o D+. Ajuste manual: requiere confirmación de Jose.'
    );
  }
  if (hasAPlus && hasCOrHigher) {
    supervision.push(
      'A+ no puede mezclarse con C, C+, D o D+. Ajuste manual: requiere confirmación de Jose.'
    );
  }
  if (hasAPlus && hasB) {
    supervision.push(
      'A+ con B nunca se propone automáticamente. Si coordinación lo ha movido manualmente, requiere confirmación antes de publicar.'
    );
  }
  if (hasBPlus && hasC) {
    notices.push(
      'B+ con C permitido, revisar que el B+ aguante pista grande y ritmo del grupo.'
    );
  }
  if (/familia|declarado|estimado|sin reporte|pendiente/.test(text)) {
    notices.push(
      'Hay nivel declarado/estimado o ficha pendiente: revisar en primera bajada.'
    );
  }

  const status =
    blocked.length > 0
      ? 'BLOQUEADO'
      : supervision.length > 0
        ? 'SUPERVISION_JOSE'
        : notices.length > 0
          ? 'AVISO'
          : 'OK';

  return {
    status,
    levels,
    messages: [...blocked, ...supervision, ...notices],
  };
}

export function balancedGroupSizes(total: number, maximum: number) {
  if (total <= 0 || maximum <= 0) return [];
  if (total <= maximum) return [total];

  const groupCount = Math.ceil(total / maximum);
  const base = Math.floor(total / groupCount);
  const extra = total % groupCount;
  const sizes = Array.from(
    { length: groupCount },
    (_, index) => base + (index < extra ? 1 : 0)
  );

  if (sizes.some((size) => size === 1) && total >= 4) {
    return balancedGroupSizes(total, Math.max(3, maximum - 1));
  }

  return sizes;
}

