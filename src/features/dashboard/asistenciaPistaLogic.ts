// Asistencia en Trabajo en pista (07/11): lógica pura.
// La asistencia es la misma que marca el entrenador (grupo_alumnos.estado_asistencia):
// lo que se marca aquí aparece en su vista y al revés.

export type EstadoAsistencia = 'Pendiente' | 'Presente' | 'Ausente';
export type FilaAsistencia = { grupo_id: string; alumno_id: string; estado_asistencia: string | null };
export type ResumenAsistencia = { presentes: number; ausentes: number; sinMarcar: number; total: number };

export function claveAsistencia(grupoId: string, alumnoId: string) {
  return `${grupoId}::${alumnoId}`;
}

export function normalizarEstado(valor: unknown): EstadoAsistencia {
  const v = String(valor || '').trim().toLowerCase();
  if (v === 'presente') return 'Presente';
  if (v === 'ausente') return 'Ausente';
  return 'Pendiente';
}

export function mapaAsistencia(filas: FilaAsistencia[]) {
  const m = new Map<string, EstadoAsistencia>();
  for (const f of filas) m.set(claveAsistencia(f.grupo_id, f.alumno_id), normalizarEstado(f.estado_asistencia));
  return m;
}

export function resumirAsistencia(estados: EstadoAsistencia[]): ResumenAsistencia {
  const r = { presentes: 0, ausentes: 0, sinMarcar: 0, total: estados.length };
  for (const e of estados) {
    if (e === 'Presente') r.presentes += 1;
    else if (e === 'Ausente') r.ausentes += 1;
    else r.sinMarcar += 1;
  }
  return r;
}

/** «3 ✓ · 1 faltan · 2 sin marcar» (solo lo que hay). */
export function textoResumenAsistencia(r: ResumenAsistencia) {
  if (r.total === 0) return '';
  if (r.sinMarcar === r.total) return 'Asistencia sin marcar';
  const partes = [`${r.presentes} ✓`];
  if (r.ausentes) partes.push(`${r.ausentes} ${r.ausentes === 1 ? 'falta' : 'faltan'}`);
  if (r.sinMarcar) partes.push(`${r.sinMarcar} sin marcar`);
  return partes.join(' · ');
}

/** Pulsar el botón que ya está activo lo deja otra vez sin marcar. */
export function estadoAlPulsar(actual: EstadoAsistencia, pulsado: EstadoAsistencia): EstadoAsistencia {
  return actual === pulsado ? 'Pendiente' : pulsado;
}

/** PostgREST: grupo_id=in.(a,b,c). Se trocea para no hacer URLs enormes. */
export function trozosIds(ids: string[], tamano = 60) {
  const unicos = [...new Set(ids.filter(Boolean))].sort();
  const trozos: string[][] = [];
  for (let i = 0; i < unicos.length; i += tamano) trozos.push(unicos.slice(i, i + tamano));
  return trozos;
}
