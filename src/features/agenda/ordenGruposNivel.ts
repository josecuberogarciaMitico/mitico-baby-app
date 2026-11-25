// Orden fijo de los grupos de un turno (25/11/2026, Jose): de menos nivel
// (Iniciación, pista pequeña) a más (D, pista grande). No depende del número
// de niños, así que un grupo no cambia de sitio (ni de número) al mover niños.

const RANGO_NIVEL: Record<string, number> = {
  INICIACION: 0, A: 1, 'A+': 2, B: 3, 'B+': 4, C: 5, 'C+': 6, D: 7, 'D+': 8,
};

function codigos(nivel: unknown): number[] {
  return String(nivel || '')
    .normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase()
    .split('/')
    .map((x) => x.replace(/^NIVEL\s+/, '').trim())
    .map((x) => RANGO_NIVEL[x])
    .filter((x): x is number => typeof x === 'number');
}

function rangoPista(pista: unknown): number {
  const t = String(pista || '').toLowerCase();
  const grande = t.includes('grande');
  const peque = t.includes('peque');
  if (peque && !grande) return 0;
  if (peque && grande) return 1;
  if (grande) return 2;
  return 1;
}

type GrupoOrdenable = { nivel_grupo?: string | null; pista?: string | null; nombre_grupo?: string | null; grupo_id?: string | null };

export function claveOrdenGrupo(g: GrupoOrdenable): Array<number | string> {
  const nombre = String(g.nombre_grupo || '');
  const particular = /particular/i.test(nombre) ? 1 : 0;
  const niveles = codigos(g.nivel_grupo);
  const minimo = niveles.length ? Math.min(...niveles) : 99;
  const maximo = niveles.length ? Math.max(...niveles) : 99;
  const numero = Number((nombre.match(/grupo\s+(\d+)/i) || [])[1] || 999);
  return [particular, minimo, maximo, rangoPista(g.pista), numero, String(g.grupo_id || '')];
}

/** Devuelve una copia ordenada; no cambia el array original. */
export function ordenarGruposPorNivel<T extends GrupoOrdenable>(grupos: T[] | null | undefined): T[] {
  if (!Array.isArray(grupos)) return [];
  return [...grupos].sort((a, b) => {
    const ka = claveOrdenGrupo(a);
    const kb = claveOrdenGrupo(b);
    for (let i = 0; i < ka.length; i += 1) {
      if (ka[i] === kb[i]) continue;
      return typeof ka[i] === 'number' && typeof kb[i] === 'number'
        ? (ka[i] as number) - (kb[i] as number)
        : String(ka[i]).localeCompare(String(kb[i]));
    }
    return 0;
  });
}
