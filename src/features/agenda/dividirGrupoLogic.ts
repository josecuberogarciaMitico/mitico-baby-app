// Dividir un grupo ya creado (18/11/2026, Jose): qué niños se sugiere pasar al
// grupo nuevo. Usa el mismo criterio que el recomendador Baby (nivel > edad >
// fuerza): de los dos grupos que salen, el «nuevo» es el de nivel más alto (y, a
// igual nivel, el de los más pequeños). Jose puede cambiar la selección.
import { technicalLevelOrder } from '../../core/levels/levelContract';
import { repartoOptimoBaby } from '../baby/babyRecommendation';

export type NinoDividir = { alumno_id: string; nivel: string | null; edad: number | null; fuerza?: number };

/** Ids de los niños que se sugiere pasar al grupo nuevo (la mitad que mejor separa). */
export function sugerenciaDividir(ninos: NinoDividir[]): string[] {
  if (ninos.length < 2) return [];
  const mitad = Math.ceil(ninos.length / 2);
  const plan = repartoOptimoBaby(
    ninos.map((n) => ({ nivel: technicalLevelOrder(n.nivel) ?? 0, edad: n.edad, fuerza: n.fuerza ?? 0 })),
    mitad
  );
  if (plan.tamanos.length < 2) {
    // Con muy pocos niños (2-3) no hay reparto «óptimo»: pasa el último.
    return [ninos[ninos.length - 1].alumno_id];
  }
  // El primer grupo del plan es el de nivel más alto: ese es el «nuevo».
  return plan.orden.slice(0, plan.tamanos[0]).map((i) => ninos[i].alumno_id);
}

/** Niveles del grupo nuevo, para su nombre («Nivel B+», «Nivel INICIACIÓN / A»). */
export function nivelesDe(niveles: Array<string | null>): string {
  const lista = Array.from(new Set(niveles.filter((n): n is string => Boolean(n && n.trim()))))
    .sort((a, b) => (technicalLevelOrder(a) ?? 99) - (technicalLevelOrder(b) ?? 99))
    .map((n) => (/^INICIACION$/i.test(n) ? 'INICIACIÓN' : n));
  return lista.join(' / ') || 'Sin nivel';
}
