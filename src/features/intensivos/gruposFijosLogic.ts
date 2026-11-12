// Intensivos · grupos fijos (12/11). Lógica pura de la pantalla
// «Grupos del intensivo»: agrupar las filas de un día, saber quién falta por
// colocar, recomendar grupo por nivel y encontrar «el mismo grupo» en otro día.

export type FilaDiaGrupos = {
  grupo_id: string;
  nombre_grupo: string;
  nivel_grupo: string | null;
  pista: string | null;
  publicado?: boolean | null;
  entrenador_id?: string | null;
  alumno_id: string;
  alumno: string;
  nivel_resumen?: string | null;
  orden_en_grupo?: number | null;
};

export type NinoGrupo = { alumno_id: string; alumno: string; nivel: string };

export type GrupoDelDia = {
  grupo_id: string;
  nombre_grupo: string;
  nivel_grupo: string | null;
  pista: string | null;
  publicado: boolean;
  conEntrenador: boolean;
  alumnos: NinoGrupo[];
};

const ORDEN_NIVELES = ['INICIACION', 'A', 'A+', 'B', 'B+', 'C', 'C+', 'D', 'D+'];

/** «Iniciación», «b+», «Nivel B» → INICIACION, B+, B. Desconocido → ''. */
export function codigoNivel(valor: string | null | undefined) {
  const t = String(valor || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/^NIVEL\s*:?\s*/, '')
    .trim();
  if (t.startsWith('INICIACION') || t === 'DEBUT') return 'INICIACION';
  return ORDEN_NIVELES.includes(t) ? t : '';
}

/** Niveles que cubre un grupo: «B / B+ / C» → [B, B+, C]. */
export function nivelesDelGrupo(nivelGrupo: string | null | undefined) {
  return String(nivelGrupo || '')
    .split(/[/,·]/)
    .map(codigoNivel)
    .filter(Boolean);
}

export function gruposDelDia(filas: FilaDiaGrupos[]): GrupoDelDia[] {
  const mapa = new Map<string, GrupoDelDia & { orden: Map<string, number> }>();
  for (const f of filas) {
    if (!f.grupo_id) continue;
    const g =
      mapa.get(f.grupo_id) ||
      {
        grupo_id: f.grupo_id,
        nombre_grupo: f.nombre_grupo,
        nivel_grupo: f.nivel_grupo,
        pista: f.pista,
        publicado: false,
        conEntrenador: false,
        alumnos: [],
        orden: new Map<string, number>(),
      };
    g.publicado = g.publicado || Boolean(f.publicado);
    g.conEntrenador = g.conEntrenador || Boolean(f.entrenador_id);
    if (f.alumno_id && !g.alumnos.some((a) => a.alumno_id === f.alumno_id)) {
      g.alumnos.push({ alumno_id: f.alumno_id, alumno: f.alumno, nivel: codigoNivel(f.nivel_resumen) });
      g.orden.set(f.alumno_id, Number(f.orden_en_grupo ?? g.alumnos.length));
    }
    mapa.set(f.grupo_id, g);
  }
  return [...mapa.values()]
    .map(({ orden, ...g }) => ({
      ...g,
      alumnos: [...g.alumnos].sort((a, b) => (orden.get(a.alumno_id) || 0) - (orden.get(b.alumno_id) || 0)),
    }))
    .sort((a, b) => a.nombre_grupo.localeCompare(b.nombre_grupo, 'es', { numeric: true }));
}

export function idsColocados(grupos: GrupoDelDia[]) {
  return new Set(grupos.flatMap((g) => g.alumnos.map((a) => a.alumno_id)));
}

/** Distancia entre el nivel del niño y el grupo (0 = el grupo cubre su nivel). */
function distancia(nivel: string, grupo: GrupoDelDia) {
  const i = ORDEN_NIVELES.indexOf(codigoNivel(nivel));
  const del = nivelesDelGrupo(grupo.nivel_grupo).map((n) => ORDEN_NIVELES.indexOf(n));
  if (i < 0 || del.length === 0) return 99;
  return Math.min(...del.map((j) => Math.abs(i - j)));
}

/** Grupo que mejor encaja por nivel; a igualdad, el que tiene menos niños. */
export function grupoRecomendado(nivel: string | null | undefined, grupos: GrupoDelDia[]) {
  if (grupos.length === 0) return null;
  return [...grupos].sort(
    (a, b) =>
      distancia(nivel || '', a) - distancia(nivel || '', b) ||
      a.alumnos.length - b.alumnos.length ||
      a.nombre_grupo.localeCompare(b.nombre_grupo, 'es', { numeric: true })
  )[0];
}

/**
 * «El mismo grupo» en otro día: mismo nombre; si no existe, el que mejor encaja
 * con el nivel del niño. Sirve para aplicar un cambio a los días siguientes.
 */
export function grupoEquivalente(nombreGrupo: string, nivelNino: string | null | undefined, grupos: GrupoDelDia[]) {
  const n = nombreGrupo.trim().toLowerCase();
  return grupos.find((g) => g.nombre_grupo.trim().toLowerCase() === n) || grupoRecomendado(nivelNino, grupos);
}

/** Grupo en el que está un niño ese día (o null). */
export function grupoDeNino(alumnoId: string, grupos: GrupoDelDia[]) {
  return grupos.find((g) => g.alumnos.some((a) => a.alumno_id === alumnoId)) || null;
}
