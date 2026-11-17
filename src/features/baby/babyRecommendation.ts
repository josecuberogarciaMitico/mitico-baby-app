import { technicalLevelOrder } from '../../core/levels/levelContract';
import { balancedGroupSizes, pedagogicalBandForLevel } from '../../core/recommendations/baseRecommendation';
import type { PerfilOperativoAlumnoApp } from '../../core/students/studentTypes';
import type { AgendaRecomendacionSesionApp } from '../agenda/agendaTypes';
import { preparadosGrandeActuales, type PreparadoGrande } from './pistaGrandeCache';

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

// ---- B y B+ (17/11) -----------------------------------------------------------
// Jose: no mezclar B y B+ si no hace falta. Con el MISMO número de grupos, se
// eligen los tamaños (de 3 al máximo) para que los cortes caigan donde cambia el
// nivel. Si no se puede sin un grupo más, se mezcla lo mínimo posible (y la
// edad decide quién pasa, con agruparPorEdadDentroDeNivel).

/** Tamaños de grupo (mismo número de grupos) con los cortes lo más cerca posible de los cambios de nivel. */
export function tamanosAlineadosConNivel(niveles: number[], sizes: number[], maximum: number): number[] {
  const total = niveles.length;
  const grupos = sizes.length;
  if (grupos < 2 || total !== sizes.reduce((a, b) => a + b, 0)) return sizes;
  const cambios: number[] = [];
  for (let i = 1; i < total; i += 1) if (niveles[i] !== niveles[i - 1]) cambios.push(i);
  if (!cambios.length) return sizes;
  const minimo = Math.min(3, ...sizes);
  const coste = (partes: number[]) => {
    const cortes: number[] = [];
    partes.reduce((acc, p) => (cortes.push(acc + p), acc + p), 0);
    cortes.pop();
    // Niños que quedan en un grupo con otro nivel: distancia de cada cambio de nivel a su corte más cercano.
    return cambios.reduce((s, c) => s + Math.min(...cortes.map((k) => Math.abs(k - c))), 0);
  };
  const desequilibrio = (partes: number[]) => Math.max(...partes) - Math.min(...partes);
  let mejor = sizes;
  let mejorCoste = coste(sizes);
  const probar = (partes: number[], resto: number) => {
    if (partes.length === grupos - 1) {
      if (resto < minimo || resto > maximum) return;
      const candidata = [...partes, resto];
      const c = coste(candidata);
      if (c < mejorCoste || (c === mejorCoste && desequilibrio(candidata) < desequilibrio(mejor))) {
        mejor = candidata;
        mejorCoste = c;
      }
      return;
    }
    for (let p = minimo; p <= maximum && p < resto; p += 1) probar([...partes, p], resto - p);
  };
  probar([], total);
  return mejor;
}

// ---- Reparto óptimo Baby (17/11, Jose) ------------------------------------------
// «Que los grupos sean los más óptimos para trabajar en pista contando con todas
// las variables». Decisiones de Jose:
//   1. Prioridad: NIVEL > EDAD > FUERZA > atención.
//   2. Número de grupos: el mínimo, salvo que UNO MÁS compense (evita mezclar
//      niveles o deja las edades mucho más parecidas).
//   3. Atención ALTA: juntos en un grupo pequeño (el reparto especial de siempre).
//   4. Cada niño con su nivel (el B+ fuerte con C se mantiene como hasta ahora).
// Cómo: se ordena por nivel y edad y se buscan los cortes que dan el menor
// «coste» (programación dinámica: prueba todos los repartos posibles).

export type NinoReparto = { nivel: number; edad: number | null; fuerza: number };
export type RepartoOptimo = { orden: number[]; tamanos: number[]; grupoExtra: null | 'niveles' | 'edades' };

const PESO = { nivel: 10, edad: 1, fuerza: 0.3, equilibrio: 0.15 };
/** Un grupo más solo si la diferencia de edad máxima de un grupo baja al menos esto (años). */
export const MEJORA_EDAD_GRUPO_EXTRA = 1.5;

function costeGrupo(ninos: NinoReparto[], tamanoMedio: number): number {
  const porNivel = new Map<number, number>();
  ninos.forEach((n) => porNivel.set(n.nivel, (porNivel.get(n.nivel) || 0) + 1));
  const mezclados = ninos.length - Math.max(...porNivel.values());
  const edades = ninos.map((n) => n.edad).filter((e): e is number => e !== null);
  const rangoEdad = edades.length > 1 ? Math.max(...edades) - Math.min(...edades) : 0;
  const fuerzas = ninos.map((n) => n.fuerza);
  const rangoFuerza = Math.max(...fuerzas) - Math.min(...fuerzas);
  return PESO.nivel * mezclados + PESO.edad * rangoEdad + PESO.fuerza * rangoFuerza + PESO.equilibrio * (ninos.length - tamanoMedio) ** 2;
}

function mejoresCortes(ninos: NinoReparto[], grupos: number, maximo: number): { tamanos: number[]; coste: number } | null {
  const n = ninos.length;
  const minimo = Math.min(3, n);
  if (grupos * minimo > n || grupos * maximo < n) return null;
  const medio = n / grupos;
  // f[g][i]: mejor coste poniendo los i primeros en g grupos.
  const f: number[][] = Array.from({ length: grupos + 1 }, () => Array(n + 1).fill(Infinity));
  const desde: number[][] = Array.from({ length: grupos + 1 }, () => Array(n + 1).fill(-1));
  f[0][0] = 0;
  for (let g = 1; g <= grupos; g += 1)
    for (let i = 1; i <= n; i += 1)
      for (let t = minimo; t <= maximo && t <= i; t += 1) {
        const previo = f[g - 1][i - t];
        if (!Number.isFinite(previo)) continue;
        const c = previo + costeGrupo(ninos.slice(i - t, i), medio);
        if (c < f[g][i] - 1e-9) {
          f[g][i] = c;
          desde[g][i] = i - t;
        }
      }
  if (!Number.isFinite(f[grupos][n])) return null;
  const tamanos: number[] = [];
  for (let g = grupos, i = n; g > 0; g -= 1) {
    const j = desde[g][i];
    tamanos.unshift(i - j);
    i = j;
  }
  return { tamanos, coste: f[grupos][n] };
}

const resumen = (ninos: NinoReparto[], tamanos: number[]) => {
  let inicio = 0;
  let mezclados = 0;
  let peorEdad = 0;
  for (const t of tamanos) {
    const g = ninos.slice(inicio, inicio + t);
    const porNivel = new Map<number, number>();
    g.forEach((x) => porNivel.set(x.nivel, (porNivel.get(x.nivel) || 0) + 1));
    mezclados += g.length - Math.max(...porNivel.values());
    const e = g.map((x) => x.edad).filter((v): v is number => v !== null);
    if (e.length > 1) peorEdad = Math.max(peorEdad, Math.max(...e) - Math.min(...e));
    inicio += t;
  }
  return { mezclados, peorEdad };
};

/** Mejor reparto de un bloque: orden de los niños (índices) y tamaños de los grupos. */
export function repartoOptimoBaby(ninos: NinoReparto[], maximo: number): RepartoOptimo {
  const orden = ninos
    .map((n, i) => ({ n, i }))
    .sort((a, b) => b.n.nivel - a.n.nivel || (a.n.edad ?? 99) - (b.n.edad ?? 99) || b.n.fuerza - a.n.fuerza || a.i - b.i)
    .map((x) => x.i);
  const ordenados = orden.map((i) => ninos[i]);
  const n = ninos.length;
  if (n <= 2) return { orden, tamanos: n ? [n] : [], grupoExtra: null };
  const minimoGrupos = Math.max(1, Math.ceil(n / maximo));
  let base = mejoresCortes(ordenados, minimoGrupos, maximo);
  let grupos = minimoGrupos;
  while (!base && grupos < n) {
    grupos += 1;
    base = mejoresCortes(ordenados, grupos, maximo);
  }
  if (!base) return { orden, tamanos: [n], grupoExtra: null };
  const pulir = (tamanos: number[]) => mejorarIntercambiando(orden, ninos, tamanos);
  const conBase = pulir(base.tamanos);
  const extra = mejoresCortes(ordenados, grupos + 1, maximo);
  if (extra) {
    const conExtra = pulir(extra.tamanos);
    const a = resumen(conBase.map((i) => ninos[i]), base.tamanos);
    const b = resumen(conExtra.map((i) => ninos[i]), extra.tamanos);
    if (a.mezclados > 0 && b.mezclados === 0) return { orden: conExtra, tamanos: extra.tamanos, grupoExtra: 'niveles' };
    if (b.mezclados <= a.mezclados && a.peorEdad - b.peorEdad >= MEJORA_EDAD_GRUPO_EXTRA)
      return { orden: conExtra, tamanos: extra.tamanos, grupoExtra: 'edades' };
  }
  return { orden: conBase, tamanos: base.tamanos, grupoExtra: null };
}

/**
 * Mejora el reparto intercambiando niños entre grupos mientras baje el coste
 * (p. ej. si hay que mezclar, que pase el de edad más parecida, no el más pequeño).
 * Mismos tamaños; devuelve el nuevo orden (índices).
 */
function mejorarIntercambiando(orden: number[], ninos: NinoReparto[], tamanos: number[]): number[] {
  const grupos: number[][] = [];
  let inicio = 0;
  for (const t of tamanos) {
    grupos.push(orden.slice(inicio, inicio + t));
    inicio += t;
  }
  const medio = orden.length / Math.max(tamanos.length, 1);
  const coste = (g: number[]) => costeGrupo(g.map((i) => ninos[i]), medio);
  for (let vuelta = 0; vuelta < 50; vuelta += 1) {
    let mejora = false;
    for (let a = 0; a < grupos.length; a += 1)
      for (let b = a + 1; b < grupos.length; b += 1)
        for (let x = 0; x < grupos[a].length; x += 1)
          for (let y = 0; y < grupos[b].length; y += 1) {
            const antes = coste(grupos[a]) + coste(grupos[b]);
            const ga = grupos[a].slice();
            const gb = grupos[b].slice();
            [ga[x], gb[y]] = [gb[y], ga[x]];
            if (coste(ga) + coste(gb) < antes - 1e-9) {
              grupos[a] = ga;
              grupos[b] = gb;
              mejora = true;
            }
          }
    if (!mejora) break;
  }
  // Dentro de cada grupo, por edad (para que se lea ordenado).
  return grupos.flatMap((g) => g.slice().sort((i, j) => ninos[j].nivel - ninos[i].nivel || (ninos[i].edad ?? 99) - (ninos[j].edad ?? 99)));
}

export function tamanosGruposPedagogicosApp(total: number, maximum: number): number[] {
  return balancedGroupSizes(total, maximum);
}

export function aplicarCinturonPedagogicoAutomaticoAgenda(
  data: AgendaRecomendacionSesionApp[],
  options?: {
    usarPerfilBaby?: boolean;
    perfiles?: PerfilOperativoAlumnoApp[];
    preparadosGrande?: Map<string, PreparadoGrande>;
    /** Solo Baby (17/11): no mezclar B y B+ si salen los mismos grupos, y el nombre y el bloque dicen los niveles reales del grupo. */
    esBaby?: boolean;
  }
): AgendaRecomendacionSesionApp[] {
  const profiles = options?.perfiles || [];
  const preparados = options?.preparadosGrande || preparadosGrandeActuales();
  const byBand = new Map<string, AgendaRecomendacionSesionApp[]>();
  for (const student of data) {
    const band = options?.usarPerfilBaby ? functionalBand(student, profiles) : baseBand(student);
    byBand.set(band.id, [...(byBand.get(band.id) || []), student]);
  }
  // 11/11: A+ «listos para la grande» en su propio grupo (si hay al menos 2).
  const listosGrande = (byBand.get('APLUS') || []).filter((s) => preparados.get(s.alumno_id)?.estado === 'listo');
  if (listosGrande.length >= 2) {
    const ids = new Set(listosGrande.map((s) => s.alumno_id));
    byBand.set('APLUS', (byBand.get('APLUS') || []).filter((s) => !ids.has(s.alumno_id)));
    byBand.set('APLUS_GRANDE', listosGrande);
  }
  let counter = 1;
  const output: AgendaRecomendacionSesionApp[] = [];
  for (const bandId of ['INICIACION_A', 'APLUS', 'APLUS_GRANDE', 'B_BPLUS', 'C_D', 'REVIEW']) {
    const baseStudents = byBand.get(bandId) || [];
    const sortedStudents = options?.usarPerfilBaby ? sortByProfile(baseStudents, profiles) : baseStudents.slice().sort((a, b) => levelOrder(a.nivel_resumen) - levelOrder(b.nivel_resumen) || a.alumno.localeCompare(b.alumno));
    if (!sortedStudents.length) continue;
    const bandBase = options?.usarPerfilBaby ? functionalBand(sortedStudents[0], profiles) : baseBand(sortedStudents[0]);
    const band = bandId === 'APLUS_GRANDE'
      ? { ...bandBase, id: 'APLUS_GRANDE', label: 'A+ · listos para la grande', bloque: 'A+ listos para pista grande', pista: 'Grande' }
      : bandBase;
    const reparto = options?.usarPerfilBaby
      ? babyGroupSizes(sortedStudents, band, profiles)
      : { sizes: balancedGroupSizes(sortedStudents.length, band.max), especial: false };
    // 17/11 (Baby, Jose): reparto óptimo por nivel > edad > fuerza, con un grupo
    // más si compensa. El reparto especial (transición / atención alta) no se toca.
    const optimo = Boolean(options?.esBaby) && band.id !== 'REVIEW' && !reparto.especial;
    const maximoBloque = band.id === 'INICIACION_A' ? 4 : band.id.startsWith('APLUS') ? 5 : band.max;
    const plan = optimo
      ? repartoOptimoBaby(
          sortedStudents.map((s) => {
            const p = profiles.find((item) => item.alumno_id === s.alumno_id);
            // El B+ fuerte que va con C cuenta como C (no es «mezcla»).
            const nivel = band.id === 'C_D' && options?.usarPerfilBaby && canStrongBabyBPlusJoinC(s, p) ? levelOrder('C') : levelOrder(s.nivel_resumen);
            return { nivel: Number.isFinite(nivel) ? nivel : 0, edad: ageOf(s, profiles), fuerza: strength(p) };
          }),
          maximoBloque
        )
      : null;
    const ordenados = plan ? plan.orden.map((i) => sortedStudents[i]) : sortedStudents;
    const sizes = plan ? plan.tamanos : reparto.sizes;
    const avisoExtra = plan?.grupoExtra === 'niveles'
      ? 'Se propone un grupo más para no mezclar niveles.'
      : plan?.grupoExtra === 'edades'
        ? 'Se propone un grupo más para que las edades sean más parecidas.'
        : null;
    // 05/11: dentro del mismo nivel, juntar por edad (sin tocar el reparto especial).
    const students = reparto.especial
      ? sortedStudents
      : plan
        ? ordenados
        : agruparPorEdadDentroDeNivel(
          ordenados,
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
      // 17/11 (Baby): si todos son B+, el grupo se llama «B+», no «B / B+».
      const nivelesReales = Array.from(new Set(chunk.map((s) => s.nivel_resumen).filter((n): n is string => Boolean(n))))
        .sort((a, b) => levelOrder(a) - levelOrder(b));
      const label = options?.esBaby && ['INICIACION_A', 'B_BPLUS', 'C_D'].includes(band.id) && nivelesReales.length
        ? nivelesReales.map((n) => (/^INICIACION$/i.test(n) ? 'INICIACIÓN' : n)).join(' / ')
        : band.label;
      const bloque = label === band.label ? band.bloque : label;
      const name = size === 1 ? `REVISAR · ${chunk[0]?.alumno || band.label}` : `Grupo ${counter++} · Nivel ${label}`;
      chunk.forEach((student, index) => {
        const profile = profiles.find((item) => item.alumno_id === student.alumno_id);
        const promotion = options?.usarPerfilBaby && canStrongBabyBPlusJoinC(student, profile) ? 'B+ fuerte: puede tirar con C bajo por ritmo/autonomía.' : null;
        const transition = options?.usarPerfilBaby && isBabyTowLiftTransition(student, profile) ? 'Transición A+/B: percha no consolidada, priorizar ratio bajo.' : null;
        const prep = preparados.get(student.alumno_id);
        const grande = prep && band.id.startsWith('APLUS')
          ? `${prep.estado === 'listo' ? '🟢 Preparado para la grande' : '🟡 Casi listo para la grande'}: ${prep.motivo}.`
          : null;
        const extra = size === 1 ? 'No crear grupo de 1. Revisión manual.' : [promotion, transition, grande, index === 0 ? avisoExtra : null].filter(Boolean).join(' · ') || student.alertas || null;
        output.push({ ...student, grupo_recomendado: name, bloque_tecnico: bloque, pista_recomendada: band.pista,
          orden_bloque: band.orden, orden_en_grupo: index + 1, alertas: [student.alertas, extra].filter(Boolean).join(' · ') || null });
      });
      start += size;
    }
  }
  return output;
}
