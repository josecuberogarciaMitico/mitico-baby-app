// 19/11/2026 (Jose): vista nueva del entrenador. Lógica pura (sin React).

export type TareaPendienteFila = {
  grupo_id: string;
  fecha?: string | null;
  hora_inicio?: string | null;
  nombre_grupo?: string | null;
  estado_reporte?: string | null;
  estado_asistencia?: string | null;
};

export type GrupoSinConfirmarFila = {
  grupo_id: string;
  fecha?: string | null;
  hora_inicio?: string | null;
  nombre_grupo?: string | null;
};

export type SiguienteTarea = {
  tipo: 'confirmar' | 'lista' | 'reportes';
  grupo_id: string;
  fecha: string;
  hora_inicio: string;
  nombre_grupo: string;
  /** Niños de ese grupo para esa tarea (0 en «confirmar»). */
  cuantos: number;
  /** Tareas que quedan en total (todas las de los tres tipos). */
  total: number;
};

const clave = (f: { fecha?: string | null; hora_inicio?: string | null }) =>
  `${String(f.fecha || '9999-99-99')} ${String(f.hora_inicio || '99:99')}`;

export const esAsistenciaPendiente = (f: TareaPendienteFila) =>
  f.estado_reporte === 'Asistencia sin confirmar' || f.estado_asistencia === 'Pendiente';
export const esReportePendiente = (f: TareaPendienteFila) => f.estado_reporte === 'Falta reporte';

/**
 * Lo siguiente que le toca al entrenador, en el mismo orden que «Tareas por
 * cerrar»: 1 confirmar grupos, 2 pasar lista, 3 reportes. Dentro de cada tipo,
 * el grupo más antiguo primero (lo que antes caduca).
 */
export function siguienteTareaEntrenador(
  sinConfirmar: GrupoSinConfirmarFila[],
  pendientes: TareaPendienteFila[]
): SiguienteTarea | null {
  const asistencia = pendientes.filter(esAsistenciaPendiente);
  const reportes = pendientes.filter((p) => esReportePendiente(p) && !esAsistenciaPendiente(p));
  const total = sinConfirmar.length + asistencia.length + reportes.length;
  const primero = <T extends { fecha?: string | null; hora_inicio?: string | null }>(lista: T[]) =>
    [...lista].sort((a, b) => clave(a).localeCompare(clave(b)))[0];
  const base = (f: { grupo_id: string; fecha?: string | null; hora_inicio?: string | null; nombre_grupo?: string | null }) => ({
    grupo_id: f.grupo_id,
    fecha: String(f.fecha || ''),
    hora_inicio: String(f.hora_inicio || '').slice(0, 5),
    nombre_grupo: String(f.nombre_grupo || ''),
  });
  if (sinConfirmar.length) return { tipo: 'confirmar', ...base(primero(sinConfirmar)), cuantos: 0, total };
  if (asistencia.length) {
    const g = primero(asistencia);
    return { tipo: 'lista', ...base(g), cuantos: asistencia.filter((a) => a.grupo_id === g.grupo_id).length, total };
  }
  if (reportes.length) {
    const g = primero(reportes);
    return { tipo: 'reportes', ...base(g), cuantos: reportes.filter((a) => a.grupo_id === g.grupo_id).length, total };
  }
  return null;
}

/** Paso en el que está un grupo abierto (cabecera de la ficha). */
export function pasoGrupoEntrenador(input: {
  confirmado: boolean;
  total: number;
  pendientesLista: number;
  reportesPorHacer: number;
}): 'confirmar' | 'lista' | 'reportes' | 'hecho' {
  if (!input.confirmado) return 'confirmar';
  if (input.total > 0 && input.pendientesLista > 0) return 'lista';
  if (input.reportesPorHacer > 0) return 'reportes';
  return 'hecho';
}

/** «Nivel INICIACION / A» → «Iniciación / A». */
export function nivelLegible(nivel: string | null | undefined): string {
  return String(nivel || '')
    .replace(/^\s*Nivel\s*/i, '')
    .split('/')
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p) => (/^INICIACI[OÓ]N$/i.test(p) ? 'Iniciación' : p))
    .join(' / ');
}

/** «ALEJANDRO MARTINEZ» → «Alejandro Martinez». */
export function nombreLegible(nombre: string | null | undefined): string {
  return String(nombre || '')
    .trim()
    .toLowerCase()
    .replace(/(^|[\s\-'])(\p{L})/gu, (_m, sep: string, l: string) => sep + l.toUpperCase())
    .replace(/\b(De|Del|La|Las|Los|Y)\b/g, (p) => p.toLowerCase())
    .replace(/^(\p{L})/u, (l) => l.toUpperCase());
}
