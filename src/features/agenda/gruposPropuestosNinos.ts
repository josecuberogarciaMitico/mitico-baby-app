// Analizar encaje (03/11): lógica pura para enseñar los niños de cada grupo
// propuesto. La vista v_grupos_sesion_operativa_app trae «alumnos_lista» como
// texto: "NOMBRE · NIVEL · Pista || NOMBRE · NIVEL · Pista".

export type NinoGrupoPropuesto = { nombre: string; nivel: string; edad: number | null };

export function parsearAlumnosLista(texto: string | null | undefined) {
  return String(texto || '')
    .split('||')
    .map((trozo) => trozo.split('·').map((x) => x.trim()))
    .filter((partes) => partes[0])
    .map((partes) => ({ nombre: partes[0], nivel: partes[1] || '' }))
    .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
}

/** Años cumplidos en la fecha dada (ISO). Null si no hay fecha válida. */
export function edadEnFecha(nacimiento: string | null | undefined, fechaIso: string) {
  const n = String(nacimiento || '').slice(0, 10);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(n)) return null;
  const f = fechaIso.slice(0, 10);
  let edad = Number(f.slice(0, 4)) - Number(n.slice(0, 4));
  if (f.slice(5) < n.slice(5)) edad -= 1;
  return edad >= 0 && edad < 100 ? edad : null;
}

function normalizar(x: string) {
  return x.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, ' ').trim().toUpperCase();
}

/** Añade la edad buscando al niño por nombre en el maestro de fichas. */
export function conEdades(
  ninos: { nombre: string; nivel: string }[],
  fichas: { alumno: string; fecha_nacimiento: string | null }[],
  fechaIso: string
): NinoGrupoPropuesto[] {
  const porNombre = new Map<string, string | null>();
  for (const f of fichas) {
    const k = normalizar(f.alumno || '');
    // Si hay dos fichas con el mismo nombre no adivino la edad.
    porNombre.set(k, porNombre.has(k) ? null : f.fecha_nacimiento);
  }
  return ninos.map((n) => ({ ...n, edad: edadEnFecha(porNombre.get(normalizar(n.nombre)), fechaIso) }));
}
