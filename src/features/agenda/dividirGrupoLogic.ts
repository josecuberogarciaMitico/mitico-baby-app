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

/**
 * 19/11/2026 (Jose): un grupo publicado se puede cambiar sin despublicarlo aunque
 * quede fuera de ratio; en vez de bloquear, el grupo se marca con este aviso.
 * Misma regla que evaluar_ratio_baby_grupo_operativa_app (Supabase).
 */
export function avisoRatioGrupoBaby(g: {
  nombre_grupo?: string | null; nivel_grupo?: string | null; pista?: string | null; total_alumnos: number;
  entrenador_id?: string | null; entrenador_apoyo_id?: string | null; entrenador_tercero_id?: string | null;
}): string | null {
  const total = Number(g.total_alumnos || 0);
  if (/^PARTICULAR · /i.test(String(g.nombre_grupo || '').trim())) return null;
  const sinTilde = (t: string | null | undefined) => String(t || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();
  const nivel = sinTilde(g.nivel_grupo);
  const pista = sinTilde(g.pista);
  const bajo = pista.includes('PEQUENA') || nivel.includes('INICIACION') || nivel.includes('DEBUT')
    || (!/[BCD]/.test(nivel) && nivel.includes('A'));
  const entrenadores = new Set([g.entrenador_id, g.entrenador_apoyo_id, g.entrenador_tercero_id].filter(Boolean)).size;
  if (total <= 1) return `Grupo de ${total} niño${total === 1 ? '' : 's'}: muévelo a otro grupo o hazlo particular.`;
  // 25/11 (Jose): con 8 o más vale si hay 2 entrenadores (se dividen en pista y cada uno
  // hace sus reportes): hasta 4 por entrenador en iniciación / pista pequeña, 7 en el resto.
  if (total >= 8) {
    if (entrenadores < 2) return `${total} niños: con 8 o más hace falta 2.º entrenador o dividirlo en 2 grupos.`;
    const maximo = (bajo ? 4 : 7) * entrenadores;
    if (total > maximo) return `${total} niños con ${entrenadores} entrenadores: el máximo es ${maximo}.`;
    return null;
  }
  if (bajo && total >= 5 && entrenadores < 2) return `${total} niños en grupo de iniciación / pista pequeña: falta 2.º entrenador.`;
  return null;
}
