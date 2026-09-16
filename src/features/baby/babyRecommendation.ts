import { technicalLevelOrder } from '../../core/levels/levelContract';
import { balancedGroupSizes, pedagogicalBandForLevel } from '../../core/recommendations/baseRecommendation';
import type { PerfilOperativoAlumnoApp } from '../../core/students/studentTypes';
import type { AgendaRecomendacionSesionApp } from '../agenda/agendaTypes';

type BabyBand = { id: string; label: string; bloque: string; pista: string; orden: number; max: number };

function levelOrder(value: string | null | undefined): number {
  return technicalLevelOrder(value) ?? Number.POSITIVE_INFINITY;
}

function baseBand(student: AgendaRecomendacionSesionApp): BabyBand {
  const band = pedagogicalBandForLevel(student.nivel_resumen);
  return { id: band.id, label: band.label, bloque: band.block, pista: band.piste, orden: band.order, max: band.maxSize };
}

function strength(profile?: PerfilOperativoAlumnoApp): number {
  if (profile?.fuerza_nivel === 'MUY_FUERTE') return 2;
  if (profile?.fuerza_nivel === 'FUERTE') return 1;
  if (profile?.fuerza_nivel === 'BAJO') return -2;
  return 0;
}

function attentionPenalty(profile?: PerfilOperativoAlumnoApp): number {
  if (profile?.demanda_atencion === 'ALTA') return -3;
  if (profile?.demanda_atencion === 'MEDIA') return -1;
  return 0;
}

function hasLift(profile: PerfilOperativoAlumnoApp | undefined, pattern: RegExp): boolean {
  return (profile?.remontes_recientes || []).some((lift) => pattern.test(String(lift || '')));
}

export function isBabyTowLiftTransition(student: AgendaRecomendacionSesionApp, profile?: PerfilOperativoAlumnoApp): boolean {
  const order = levelOrder(student.nivel_resumen);
  if (order !== 2 && order !== 3) return false;
  const lowStrength = !profile?.fuerza_nivel || profile.fuerza_nivel === 'BAJO' || profile.fuerza_nivel === 'ADECUADO';
  const limitedAutonomy = /necesita ayuda|pista pequeña|llano/i.test(profile?.autonomia_reciente || '');
  const hasLiftData = Array.isArray(profile?.remontes_recientes) && (profile?.remontes_recientes?.length || 0) > 0;
  return lowStrength && (limitedAutonomy || (hasLiftData && !hasLift(profile, /percha/i)));
}

export function canStrongBabyBPlusJoinC(student: AgendaRecomendacionSesionApp, profile?: PerfilOperativoAlumnoApp): boolean {
  if (levelOrder(student.nivel_resumen) !== 4 || !profile) return false;
  const strongPace = profile.fuerza_nivel === 'MUY_FUERTE'
    || (profile.fuerza_nivel === 'FUERTE' && profile.ritmo_tendencia === 'Muy rápido · podría ir con nivel superior');
  const confidence = profile.confianza_ritmo === 'ALTA' || profile.confianza_ritmo === 'MEDIA';
  const largePisteAutonomy = /pista grande|autónomo total/i.test(profile.autonomia_reciente || '');
  return strongPace && confidence && (largePisteAutonomy || hasLift(profile, /percha|silla/i))
    && profile.demanda_atencion !== 'ALTA';
}

export function explicacionCompactaPropuestaBabyApp(student: AgendaRecomendacionSesionApp): string {
  const alert = String(student.alertas || '');
  if (/B\+ fuerte: puede tirar con C bajo/i.test(alert)) return 'Encaje: B+ fuerte · compatible con C';
  if (/Transición A\+\/B: percha no consolidada/i.test(alert)) return 'Encaje: transición a percha · ratio bajo';
  return '';
}

function functionalBand(student: AgendaRecomendacionSesionApp, profiles: PerfilOperativoAlumnoApp[]): BabyBand {
  const profile = profiles.find((item) => item.alumno_id === student.alumno_id);
  return canStrongBabyBPlusJoinC(student, profile)
    ? { id: 'C_D', label: 'B+ fuerte / C / D', bloque: 'B+ fuerte / C / D', pista: 'Grande', orden: 5, max: 7 }
    : baseBand(student);
}

function functionalScore(student: AgendaRecomendacionSesionApp, profiles: PerfilOperativoAlumnoApp[]): number {
  const order = levelOrder(student.nivel_resumen);
  if (!Number.isFinite(order)) return Number.NEGATIVE_INFINITY;
  const profile = profiles.find((item) => item.alumno_id === student.alumno_id);
  return order * 3 + strength(profile) + attentionPenalty(profile);
}

function sortByProfile(students: AgendaRecomendacionSesionApp[], profiles: PerfilOperativoAlumnoApp[]) {
  return students.slice().sort((a, b) => {
    const score = functionalScore(b, profiles) - functionalScore(a, profiles);
    if (score !== 0) return score;
    const profileA = profiles.find((item) => item.alumno_id === a.alumno_id);
    const profileB = profiles.find((item) => item.alumno_id === b.alumno_id);
    const ageA = profileA?.edad_aprox ?? (typeof a.edad === 'number' ? a.edad : Number.POSITIVE_INFINITY);
    const ageB = profileB?.edad_aprox ?? (typeof b.edad === 'number' ? b.edad : Number.POSITIVE_INFINITY);
    return Number.isFinite(ageA) && Number.isFinite(ageB) && ageA !== ageB ? ageA - ageB : a.alumno.localeCompare(b.alumno);
  });
}

function babyGroupSizes(students: AgendaRecomendacionSesionApp[], band: BabyBand, profiles: PerfilOperativoAlumnoApp[]) {
  const total = students.length;
  const maximum = band.id === 'INICIACION_A' ? 4 : band.id === 'APLUS' ? 5 : band.max;
  if (band.id === 'APLUS' || band.id === 'B_BPLUS') {
    const transitions = students.filter((student) => isBabyTowLiftTransition(
      student, profiles.find((profile) => profile.alumno_id === student.alumno_id))).length;
    const rest = total - 3;
    if (transitions >= 3 && rest >= 2 && rest <= maximum && total >= 5) return [rest, 3];
  }
  if (total <= maximum) return [total];
  const demanding = students.filter((student) => profiles.find((profile) => profile.alumno_id === student.alumno_id)?.demanda_atencion === 'ALTA').length;
  const normal = total - demanding;
  return demanding >= 3 && demanding <= 4 && normal >= 3 && normal <= maximum
    ? [normal, demanding] : balancedGroupSizes(total, maximum);
}

export function tamanosGruposPedagogicosApp(total: number, maximum: number): number[] {
  return balancedGroupSizes(total, maximum);
}

export function aplicarCinturonPedagogicoAutomaticoAgenda(
  data: AgendaRecomendacionSesionApp[],
  options?: { usarPerfilBaby?: boolean; perfiles?: PerfilOperativoAlumnoApp[] }
): AgendaRecomendacionSesionApp[] {
  const profiles = options?.perfiles || [];
  const byBand = new Map<string, AgendaRecomendacionSesionApp[]>();
  for (const student of data) {
    const band = options?.usarPerfilBaby ? functionalBand(student, profiles) : baseBand(student);
    byBand.set(band.id, [...(byBand.get(band.id) || []), student]);
  }
  let counter = 1;
  const output: AgendaRecomendacionSesionApp[] = [];
  for (const bandId of ['INICIACION_A', 'APLUS', 'B_BPLUS', 'C_D', 'REVIEW']) {
    const baseStudents = byBand.get(bandId) || [];
    const students = options?.usarPerfilBaby ? sortByProfile(baseStudents, profiles) : baseStudents.slice().sort((a, b) => levelOrder(a.nivel_resumen) - levelOrder(b.nivel_resumen) || a.alumno.localeCompare(b.alumno));
    if (!students.length) continue;
    const band = options?.usarPerfilBaby ? functionalBand(students[0], profiles) : baseBand(students[0]);
    const sizes = options?.usarPerfilBaby ? babyGroupSizes(students, band, profiles) : balancedGroupSizes(students.length, band.max);
    let start = 0;
    for (const size of sizes) {
      const chunk = students.slice(start, start + size);
      const name = size === 1 ? `REVISAR · ${chunk[0]?.alumno || band.label}` : `Grupo ${counter++} · Nivel ${band.label}`;
      chunk.forEach((student, index) => {
        const profile = profiles.find((item) => item.alumno_id === student.alumno_id);
        const promotion = options?.usarPerfilBaby && canStrongBabyBPlusJoinC(student, profile) ? 'B+ fuerte: puede tirar con C bajo por ritmo/autonomía.' : null;
        const transition = options?.usarPerfilBaby && isBabyTowLiftTransition(student, profile) ? 'Transición A+/B: percha no consolidada, priorizar ratio bajo.' : null;
        const extra = size === 1 ? 'No crear grupo de 1. Revisión manual.' : [promotion, transition].filter(Boolean).join(' · ') || student.alertas || null;
        output.push({ ...student, grupo_recomendado: name, bloque_tecnico: band.bloque, pista_recomendada: band.pista,
          orden_bloque: band.orden, orden_en_grupo: index + 1, alertas: [student.alertas, extra].filter(Boolean).join(' · ') || null });
      });
      start += size;
    }
  }
  return output;
}
