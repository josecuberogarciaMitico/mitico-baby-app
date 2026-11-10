// Intensivos (10/11): copiar la composición de un día a los días siguientes.
// Si coordinación rehace un día (p. ej. el Día 2 tras ver el Día 1), los días
// posteriores que todavía no se han tocado (sin publicar, sin entrenador, sin
// asistencia ni reportes) pasan a tener los mismos grupos y niños.
// Mismo método que «Guardar cambios de este día»: foto del día, borrar sus
// grupos, crear los nuevos y, si algo falla, restaurar la foto.

export type FilaGrupoDia = {
  grupo_id: string;
  nombre_grupo: string;
  nivel_grupo: string | null;
  pista: string | null;
  publicado?: boolean | null;
  entrenador_id?: string | null;
  trabajo_diario: string | null;
  observaciones_importantes: string | null;
  alumno_id: string;
  orden_en_grupo?: number | null;
};

export type GrupoComposicion = {
  nombre_grupo: string;
  nivel_grupo: string | null;
  pista: string | null;
  trabajo_diario: string | null;
  observaciones_importantes: string | null;
  alumnos_ids: string[];
};

/** Agrupa las filas (una por niño) en grupos, en el orden en que llegan. */
export function composicionDesdeFilas(filas: FilaGrupoDia[]): GrupoComposicion[] {
  const porGrupo = new Map<string, GrupoComposicion & { orden: Map<string, number> }>();
  for (const f of filas) {
    if (!f.grupo_id || !f.alumno_id) continue;
    const g =
      porGrupo.get(f.grupo_id) ||
      {
        nombre_grupo: f.nombre_grupo,
        nivel_grupo: f.nivel_grupo,
        pista: f.pista,
        trabajo_diario: f.trabajo_diario,
        observaciones_importantes: f.observaciones_importantes,
        alumnos_ids: [],
        orden: new Map<string, number>(),
      };
    if (!g.alumnos_ids.includes(f.alumno_id)) {
      g.alumnos_ids.push(f.alumno_id);
      g.orden.set(f.alumno_id, Number(f.orden_en_grupo ?? g.alumnos_ids.length));
    }
    porGrupo.set(f.grupo_id, g);
  }
  return [...porGrupo.values()]
    .map(({ orden, ...g }) => ({ ...g, alumnos_ids: [...g.alumnos_ids].sort((a, b) => (orden.get(a) || 0) - (orden.get(b) || 0)) }))
    .sort((a, b) => a.nombre_grupo.localeCompare(b.nombre_grupo, 'es', { numeric: true }));
}

/** ¿Se puede rehacer este día sin pisar nada real? */
export function diaEditable(filas: FilaGrupoDia[]) {
  return !filas.some((f) => Boolean(f.publicado) || Boolean(f.entrenador_id));
}

/** ¿Tienen dos días ya exactamente los mismos grupos con los mismos niños? */
export function mismaComposicion(a: GrupoComposicion[], b: GrupoComposicion[]) {
  const clave = (gs: GrupoComposicion[]) =>
    gs.map((g) => `${g.nombre_grupo}=${[...g.alumnos_ids].sort().join(',')}`).sort().join('|');
  return clave(a) === clave(b);
}

type Deps = {
  leerDia: (diaId: string) => Promise<FilaGrupoDia[]>;
  crearGrupo: (diaId: string, g: GrupoComposicion) => Promise<string | null>;
  borrarGrupo: (grupoId: string) => Promise<void>;
};

/**
 * Copia `origen` al día `diaId`. Los grupos del día destino se sustituyen.
 * El Trabajo diario va provisional (el del origen) y las Observaciones vacías,
 * igual que la plantilla de 4 días: se regeneran al abrir cada jornada.
 */
export async function copiarComposicionADia(diaId: string, origen: GrupoComposicion[], deps: Deps) {
  const foto = await deps.leerDia(diaId);
  if (!diaEditable(foto)) throw new Error('Ese día ya tiene grupos publicados o con entrenador.');
  const anteriores = composicionDesdeFilas(foto);
  const idsAnteriores = [...new Set(foto.map((f) => f.grupo_id).filter(Boolean))];
  const creados: string[] = [];
  try {
    for (const id of idsAnteriores) await deps.borrarGrupo(id);
    for (const g of origen) {
      if (g.alumnos_ids.length === 0) continue;
      const id = await deps.crearGrupo(diaId, {
        ...g,
        trabajo_diario: g.trabajo_diario || 'Trabajo diario pendiente de generar.',
        observaciones_importantes: '',
      });
      if (id) creados.push(id);
    }
  } catch (err) {
    for (const id of [...creados].reverse()) {
      try { await deps.borrarGrupo(id); } catch { /* seguimos restaurando */ }
    }
    for (const g of anteriores) {
      try { await deps.crearGrupo(diaId, g); } catch { /* se informa abajo */ }
    }
    throw err;
  }
}
