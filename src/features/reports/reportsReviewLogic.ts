// Revisar reportes (01/11): lógica pura. Ordena los reportes de una semana por
// día → turno (hora + modalidad) → grupo, con hechos y pendientes juntos.

export type FilaRevision = {
  reporte_id: string | null;
  estado: string;
  fecha: string;
  hora_inicio: string | null;
  modalidad: string | null;
  grupo_id: string | null;
  nombre_grupo: string | null;
  alumno_id: string;
  alumno: string;
  entrenador: string | null;
  notas_habilidades?: Record<string, string> | null;
  observaciones?: string | null;
  incidencia_comentario?: string | null;
  actitud_comentario?: string | null;
  recomendacion_comentario?: string | null;
};

export type GrupoRevision<T extends FilaRevision> = {
  clave: string;
  nombre: string;
  entrenadores: string[];
  filas: T[];
  hechos: number;
  faltan: number;
};

export type TurnoRevision<T extends FilaRevision> = {
  clave: string;
  hora: string;
  modalidad: string;
  grupos: GrupoRevision<T>[];
  hechos: number;
  faltan: number;
};

export type DiaRevision<T extends FilaRevision> = {
  fecha: string;
  turnos: TurnoRevision<T>[];
  hechos: number;
  faltan: number;
};

export type FiltroRevision = 'todos' | 'escritos' | 'faltan';

export function esHecho(f: FilaRevision) {
  return Boolean(f.reporte_id);
}

/** ¿El entrenador escribió algo a mano (notas, observaciones o comentarios)? */
export function tieneTextoEscrito(f: FilaRevision) {
  const notas = Object.values(f.notas_habilidades || {}).some((v) => String(v || '').trim());
  return (
    notas ||
    [f.observaciones, f.incidencia_comentario, f.actitud_comentario, f.recomendacion_comentario].some((v) =>
      String(v || '').trim()
    )
  );
}

function normalizar(x: string) {
  return x.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

export function filtrarRevision<T extends FilaRevision>(filas: T[], filtro: FiltroRevision, busqueda = '') {
  const q = normalizar(busqueda.trim());
  return filas.filter((f) => {
    if (filtro === 'escritos' && !(esHecho(f) && tieneTextoEscrito(f))) return false;
    if (filtro === 'faltan' && esHecho(f)) return false;
    if (q && !normalizar(`${f.alumno} ${f.entrenador || ''} ${f.nombre_grupo || ''}`).includes(q)) return false;
    return true;
  });
}

export function agruparRevision<T extends FilaRevision>(filas: T[]): DiaRevision<T>[] {
  const dias = new Map<string, Map<string, Map<string, T[]>>>();
  for (const f of filas) {
    const fecha = String(f.fecha).slice(0, 10);
    const turno = `${String(f.hora_inicio || '').slice(0, 5)}|${f.modalidad || ''}`;
    const grupo = f.grupo_id || f.nombre_grupo || 'sin-grupo';
    const d = dias.get(fecha) || new Map();
    const t = d.get(turno) || new Map();
    t.set(grupo, [...(t.get(grupo) || []), f]);
    d.set(turno, t);
    dias.set(fecha, d);
  }
  const cuenta = (xs: T[]) => ({ hechos: xs.filter(esHecho).length, faltan: xs.filter((x) => !esHecho(x)).length });
  return [...dias.entries()]
    .sort(([a], [b]) => b.localeCompare(a)) // el día más reciente arriba
    .map(([fecha, turnos]) => {
      const ts = [...turnos.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([clave, grupos]) => {
          const [hora, modalidad] = clave.split('|');
          const gs = [...grupos.entries()]
            .map(([gclave, fs]) => ({
              clave: gclave,
              nombre: fs[0].nombre_grupo || 'Sin grupo',
              entrenadores: [...new Set(fs.map((x) => x.entrenador).filter(Boolean) as string[])],
              filas: [...fs].sort((a, b) => a.alumno.localeCompare(b.alumno, 'es')),
              ...cuenta(fs),
            }))
            .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true }));
          return { clave, hora, modalidad, grupos: gs, ...cuenta(gs.flatMap((g) => g.filas)) };
        });
      return { fecha, turnos: ts, ...cuenta(ts.flatMap((t) => t.grupos.flatMap((g) => g.filas))) };
    });
}

export function sumarDiasIso(iso: string, n: number) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function lunesDeIso(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  return sumarDiasIso(iso, -(((d.getUTCDay() || 7) - 1)));
}

const DIAS = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export function etiquetaDia(iso: string) {
  const d = new Date(`${iso.slice(0, 10)}T12:00:00Z`);
  return `${DIAS[d.getUTCDay()]} ${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

/** Notas a guardar: quita vacías y espacios de más. */
export function limpiarNotas(notas: Record<string, string>) {
  return Object.fromEntries(
    Object.entries(notas)
      .map(([k, v]) => [k, String(v || '').replace(/\s+/g, ' ').trim()] as const)
      .filter(([, v]) => v)
  );
}
