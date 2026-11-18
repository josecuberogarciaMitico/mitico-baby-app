// «➕ Grupo nuevo» en «Cambiar de grupo» (18/11/2026, Jose): nombre del grupo
// nuevo con los niveles reales de sus niños.
import { technicalLevelOrder } from '../../core/levels/levelContract';

/** Niveles del grupo nuevo, para su nombre («Nivel B+», «Nivel INICIACIÓN / A»). */
export function nivelesDe(niveles: Array<string | null>): string {
  const lista = Array.from(new Set(niveles.filter((n): n is string => Boolean(n && n.trim()))))
    .sort((a, b) => (technicalLevelOrder(a) ?? 99) - (technicalLevelOrder(b) ?? 99))
    .map((n) => (/^INICIACION$/i.test(n) ? 'INICIACIÓN' : n));
  return lista.join(' / ') || 'Sin nivel';
}
