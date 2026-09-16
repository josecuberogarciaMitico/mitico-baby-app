import { recommendLevelCompatibility } from '../../core/recommendations/baseRecommendation';
import { parseTechnicalLevel } from '../../core/levels/levelContract';
import { babyGroupMaximum, babyRatioMessage } from '../baby/babyPolicy';
import type { AgendaGrupoSesionApp, AgendaRecomendacionSesionApp, AgendaSesionDirectaApp } from './agendaTypes';

export type BabyRelocationStudent = Pick<
  AgendaRecomendacionSesionApp,
  'alumno_id' | 'alumno' | 'nivel_resumen'
>;

export type BabyRelocationTarget = {
  kind: 'REAL' | 'PROPOSAL';
  session: AgendaSesionDirectaApp;
  groupId: string | null;
  groupName: string;
  groupLevels: string[];
  piste: string;
  currentSize: number;
  trainerCount: number;
  published: boolean;
};

export type BabyRelocationOption = {
  kind: 'REAL' | 'PROPOSAL';
  sesion_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  grupo_id: string | null;
  grupo: string;
  nivel_grupo: string;
  pista: string;
  total_actual: number;
  total_final: number;
  estado: 'RECOMENDADO' | 'REVISAR' | 'NO_ENCAJA';
  motivo: string;
  score: number;
  mismo_dia: boolean;
};

function unique(values: string[]) {
  return Array.from(new Set(values.filter(Boolean)));
}

export function normalizeAgendaModality(value: unknown) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function isBabyAgendaSession(session: Pick<AgendaSesionDirectaApp, 'modalidad' | 'modalidad_codigo'>) {
  const modality = normalizeAgendaModality(session.modalidad_codigo || session.modalidad);
  return modality === 'BABY' || modality.includes('BABY');
}

export function isParticularAgendaGroupName(value: unknown) {
  const normalized = normalizeAgendaModality(value).replace(/\s+/g, ' ');
  return /^PARTICULAR(?:\s*[·\-:]|\s|$)/.test(normalized);
}

export function levelsFromAgendaGroup(group: Pick<AgendaGrupoSesionApp, 'nivel_grupo' | 'alumnos_lista'>) {
  const levels: string[] = [];
  const addIfLevel = (value: unknown) => {
    const parsed = parseTechnicalLevel(value);
    if (parsed.status === 'VALID') levels.push(parsed.level);
  };

  String(group.nivel_grupo || '')
    .split(/[\/|,]/)
    .forEach(addIfLevel);

  // v_grupos_sesion_operativa_app expone cada alumno como:
  // NOMBRE · NIVEL · PISTA. No usamos la última columna porque es la pista.
  String(group.alumnos_lista || '')
    .split(' || ')
    .forEach((line) => {
      const parts = line.split('·').map((part) => part.trim()).filter(Boolean);
      if (parts.length >= 2) addIfLevel(parts[1]);
    });

  return unique(levels);
}

export function realGroupToRelocationTarget(
  session: AgendaSesionDirectaApp,
  group: AgendaGrupoSesionApp
): BabyRelocationTarget | null {
  if (!group.grupo_id || isParticularAgendaGroupName(group.nombre_grupo)) return null;
  const trainerIds = unique([
    String(group.entrenador_id || ''),
    String(group.entrenador_apoyo_id || ''),
  ]);
  return {
    kind: 'REAL',
    session,
    groupId: group.grupo_id,
    groupName: group.nombre_grupo,
    groupLevels: levelsFromAgendaGroup(group),
    piste: group.pista || 'Pequeña/Grande',
    currentSize: Number(group.total_alumnos || 0),
    trainerCount: trainerIds.length,
    published: Boolean(group.publicado),
  };
}

export function proposalGroupToRelocationTarget(
  session: AgendaSesionDirectaApp,
  groupName: string,
  students: AgendaRecomendacionSesionApp[]
): BabyRelocationTarget | null {
  if (!students.length || isParticularAgendaGroupName(groupName)) return null;
  return {
    kind: 'PROPOSAL',
    session,
    groupId: null,
    groupName,
    groupLevels: unique(students.map((student) => String(student.nivel_resumen || '').trim().toUpperCase())),
    piste:
      students[0]?.pista_recomendada ||
      students[0]?.pista_alumno ||
      'Pequeña/Grande',
    currentSize: students.length,
    trainerCount: 0,
    published: false,
  };
}

export function evaluateBabyRelocationTarget(
  student: BabyRelocationStudent,
  target: BabyRelocationTarget,
  sourceDate: string
): BabyRelocationOption {
  const compatibility = recommendLevelCompatibility(
    student.nivel_resumen,
    target.groupLevels
  );
  // Las propuestas todavía no tienen entrenador. Para valorar el ratio usamos
  // el mínimo operativo de 1 entrenador; la publicación seguirá validando el
  // número real de entrenadores en Supabase.
  const trainerCountForRatio = Math.max(1, target.trainerCount);
  const maximum = babyGroupMaximum(target.piste, trainerCountForRatio);
  const finalSize = target.currentSize + 1;
  let estado = compatibility.status;
  let score = compatibility.score;
  let motivo = compatibility.reason;

  if (finalSize > maximum) {
    estado = 'NO_ENCAJA';
    score = 0;
    motivo = babyRatioMessage({
      finalSize,
      piste: target.piste,
      trainerCount: trainerCountForRatio,
    });
  } else if (estado !== 'NO_ENCAJA') {
    if (finalSize === maximum && estado === 'RECOMENDADO') score -= 8;
    motivo = `${motivo} ${babyRatioMessage({
      finalSize,
      piste: target.piste,
      trainerCount: trainerCountForRatio,
    })}`.trim();
  }

  if (target.kind === 'REAL' && target.published && estado !== 'NO_ENCAJA') {
    score += 4;
  }

  return {
    kind: target.kind,
    sesion_id: target.session.sesion_id,
    fecha: target.session.fecha,
    hora_inicio: target.session.hora_inicio,
    hora_fin: target.session.hora_fin,
    grupo_id: target.groupId,
    grupo: target.groupName,
    nivel_grupo: target.groupLevels.join(' / ') || '-',
    pista: target.piste || '-',
    total_actual: target.currentSize,
    total_final: finalSize,
    estado,
    motivo,
    score,
    mismo_dia: target.session.fecha === sourceDate,
  };
}

export function sortBabyRelocationOptions(options: BabyRelocationOption[]) {
  return options.slice().sort((a, b) => {
    if (a.mismo_dia !== b.mismo_dia) return a.mismo_dia ? -1 : 1;
    if (b.score !== a.score) return b.score - a.score;
    if (a.kind !== b.kind) return a.kind === 'REAL' ? -1 : 1;
    return (
      a.fecha.localeCompare(b.fecha) ||
      a.hora_inicio.localeCompare(b.hora_inicio) ||
      a.grupo.localeCompare(b.grupo, 'es')
    );
  });
}

export function mondayOfIsoWeek(dateIso: string) {
  const date = new Date(`${dateIso}T12:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

export function addIsoDays(dateIso: string, days: number) {
  const date = new Date(`${dateIso}T12:00:00`);
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}
