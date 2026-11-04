// Puntos de encuentro (04/11): si en un turno hay más grupos que puntos, dos
// grupos pueden compartir punto, pero SOLO cuando ya no queda ninguno libre
// y avisando antes (con qué grupo se comparte).

export type OpcionPuntoEncuentro = { punto: string; compartidoCon: string[] };

export function opcionesPuntoEncuentro(
  puntos: string[],
  grupoId: string,
  otrosGrupos: Array<{ grupo_id: string; nombre_grupo: string | null; punto_encuentro: string | null }>,
  puntoActual?: string | null
): OpcionPuntoEncuentro[] {
  const usos = new Map<string, string[]>();
  for (const g of otrosGrupos) {
    if (g.grupo_id === grupoId) continue;
    const p = String(g.punto_encuentro || '').trim();
    if (!p) continue;
    usos.set(p, [...(usos.get(p) || []), String(g.nombre_grupo || 'Grupo')]);
  }
  const opciones = puntos.map((punto) => ({ punto, compartidoCon: usos.get(punto) || [] }));
  const libres = opciones.filter((o) => !o.compartidoCon.length);
  // Mientras quede alguno libre, solo se ofrecen los libres (y el que ya tiene).
  if (!libres.length) return opciones;
  const actual = opciones.find((o) => o.punto === String(puntoActual || '').trim() && o.compartidoCon.length);
  return actual ? [actual, ...libres] : libres;
}

export function textoOpcionPunto(o: OpcionPuntoEncuentro) {
  return o.compartidoCon.length ? `Punto ${o.punto} · compartido con ${o.compartidoCon.join(', ')}` : `Punto ${o.punto}`;
}

/** Aviso antes de compartir; null si el punto está libre. */
export function avisoCompartirPunto(o: OpcionPuntoEncuentro | undefined) {
  if (!o || !o.compartidoCon.length) return null;
  return `Ya no quedan puntos de encuentro libres en este turno.\n\nEl punto ${o.punto} lo usa ya: ${o.compartidoCon.join(', ')}.\n\n¿Compartir el punto ${o.punto}? Los dos grupos quedarán en el mismo sitio.`;
}
