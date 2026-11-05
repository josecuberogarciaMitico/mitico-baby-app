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

// «especial»: reparto que separa a propósito a los de transición o a los de
// demanda alta; ahí no se reordena por edad para no deshacer esa separación.
function babyGroupSizes(students: AgendaRecomendacionSesionApp[], band: BabyBand, profiles: PerfilOperativoAlumnoApp[]): { sizes: number[]; especial: boolean } {
  const total = students.length;
  const maximum = band.id === 'INICIACION_A' ? 4 : band.id === 'APLUS' ? 5 : band.max;
  if (band.id === 'APLUS' || band.id === 'B_BPLUS') {
    const transitions = students.filter((student) => isBabyTowLiftTransition(
      student, profiles.find((profile) => profile.alumno_id === student.alumno_id))).length;
    const rest = total - 3;
    if (transitions >= 3 && rest >= 2 && rest <= maximum && total >= 5) return { sizes: [rest, 3], especial: true };
  }
  if (total <= maximum) return { sizes: [total], especial: false };
  const demanding = students.filter((student) => profiles.find((profile) => profile.alumno_id === student.alumno_id)?.demanda_atencion === 'ALTA').length;
  const normal = total - demanding;
  return demanding >= 3 && demanding <= 4 && normal >= 3 && normal <= maximum
    ? { sizes: [normal, demanding], especial: true } : { sizes: balancedGroupSizes(total, maximum), especial: false };
}

// ---- Edad (05/11) -------------------------------------------------------------
// El nivel sigue mandando: la lista ya viene ordenada por nivel y se corta en
// grupos igual que antes. Solo se intercambian de sitio niños del MISMO nivel
// (mismo «tramo»), y solo si así los grupos quedan con edades más parecidas.
// Si no se puede mejorar, o falta la edad, todo queda exactamente como estaba.

function ageOf(student: AgendaRecomendacionSesionApp, profiles: PerfilOperativoAlumnoApp[]): number | null {
  const fromProfile = profiles.find((item) => item.alumno_id === student.alumno_id)?.edad_aprox;
  const age = typeof fromProfile === 'number' ? fromProfile : typeof student.edad === 'number' ? student.edad : null;
  return age !== null && Number.isFinite(age) ? age : null;
}

function ageSpreadCost(students: AgendaRecomendacionSesionApp[], sizes: number[], ages: Map<string, number | null>): number {
  let cost = 0;
  let start = 0;
  for (const size of sizes) {
    const known = students.slice(start, start + size).map((s) => ages.get(s.alumno_id)).filter((a): a is number => a !== null && a !== undefined);
    if (known.length > 1) cost += Math.max(...known) - Math.min(...known);
    start += size;
  }
  return cost;
}

export function agruparPorEdadDentroDeNivel(
  students: AgendaRecomendacionSesionApp[],
  sizes: number[],
  tierKey: (student: AgendaRecomendacionSesionApp) => string,
  profiles: PerfilOperativoAlumnoApp[]
): AgendaRecomendacionSesionApp[] {
  if (sizes.length < 2) return students;
  const ages = new Map(students.map((s) => [s.alumno_id, ageOf(s, profiles)]));
  let current = students.slice();
  let i = 0;
  while (i < current.length) {
    const key = tierKey(current[i]);
    let j = i;
    while (j < current.length && tierKey(current[j]) === key) j += 1;
    // Huecos del tramo con edad conocida: solo esos se reparten por edad.
    const slots = [];
    for (let k = i; k < j; k += 1) if (ages.get(current[k].alumno_id) !== null) slots.push(k);
    if (slots.length > 1) {
      const conEdad = slots.map((k) => current[k]);
      const porEdad = (dir: number) => conEdad.slice().sort((a, b) =>
        dir * ((ages.get(a.alumno_id) as number) - (ages.get(b.alumno_id) as number)) || a.alumno.localeCompare(b.alumno, 'es'));
      let best = current;
      let bestCost = ageSpreadCost(current, sizes, ages);
      for (const orden of [porEdad(1), porEdad(-1)]) {
        const candidate = current.slice();
        slots.forEach((k, n) => { candidate[k] = orden[n]; });
        const cost = ageSpreadCost(candidate, sizes, ages);
        if (cost < bestCost) { best = candidate; bestCost = cost; }
      }
      current = best;
    }
    i = j;
  }
  return current;
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
    const sortedStudents = options?.usarPerfilBaby ? sortByProfile(baseStudents, profiles) : baseStudents.slice().sort((a, b) => levelOrder(a.nivel_resumen) - levelOrder(b.nivel_resumen) || a.alumno.localeCompare(b.alumno));
    if (!sortedStudents.length) continue;
    const band = options?.usarPerfilBaby ? functionalBand(sortedStudents[0], profiles) : baseBand(sortedStudents[0]);
    const reparto = options?.usarPerfilBaby
      ? babyGroupSizes(sortedStudents, band, profiles)
      : { sizes: balancedGroupSizes(sortedStudents.length, band.max), especial: false };
    const sizes = reparto.sizes;
    // 05/11: dentro del mismo nivel, juntar por edad (sin tocar el reparto especial).
    const students = reparto.especial
      ? sortedStudents
      : agruparPorEdadDentroDeNivel(
          sortedStudents,
          sizes,
          options?.usarPerfilBaby
            ? (s) => {
                const p = profiles.find((item) => item.alumno_id === s.alumno_id);
                return `${levelOrder(s.nivel_resumen)}|${attentionPenalty(p)}|${strength(p) < 0 ? 'bajo' : 'ok'}`;
              }
            : (s) => String(levelOrder(s.nivel_resumen)),
          profiles
        );
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
