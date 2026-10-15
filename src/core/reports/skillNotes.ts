/**
 * Notas del entrenador por habilidad (las que dictan en cada reporte desde el
 * 02/10/2026, columna reportes.notas_habilidades) preparadas para los textos
 * que se pegan en ChatGPT: «Todo en bruto», «Carta para la familia» y el
 * texto base de los diplomas de Intensivos.
 *
 * Es la información más personal que tenemos de cada niño, así que va como
 * sección propia, agrupada por habilidad y en orden de fechas para que se vea
 * la evolución. Solo usa notas y valoraciones técnicas: nunca incidencias.
 */
import { TECHNICAL_LEVELS } from '../levels/levelContract';
import { competenciasReporte, reportTechnicalLevelForRender } from '../../lib/adaptiveReport';
import { ETIQUETA_PASO, puntosDeValor } from './skillProgress';

/** Lo mínimo que hace falta de un reporte (vale para historial y para Intensivos). */
export type ReporteConNotas = {
  fecha: string;
  nivel_reportado?: string | null;
  evaluacion_tecnica?: Record<string, string> | null;
  notas_habilidades?: Record<string, string> | null;
};

export type NotaHabilidad = {
  fecha: string;
  nivel: string | null;
  /** Todavía no / A veces / Lo consigue (si ese día se valoró). */
  paso: string | null;
  nota: string;
};

export type NotasDeHabilidad = {
  id: string;
  nombre: string;
  /** Qué significa la habilidad, en una frase (ayuda a ChatGPT a explicarla). */
  ayuda: string;
  /** De la más antigua a la más reciente. */
  notas: NotaHabilidad[];
};

const COMPETENCIA_POR_ID = new Map<string, { nombre: string; ayuda: string }>();
TECHNICAL_LEVELS.forEach((nivel) =>
  competenciasReporte(nivel).forEach((c) => {
    if (!COMPETENCIA_POR_ID.has(c.id)) COMPETENCIA_POR_ID.set(c.id, { nombre: c.nombre, ayuda: c.ayuda });
  })
);

/** Nombre legible de una habilidad a partir de su id (p. ej. «apoyo_exterior_presion»). */
export function nombreHabilidad(id: string): string {
  return COMPETENCIA_POR_ID.get(id)?.nombre || id.replace(/_/g, ' ');
}

export const MAX_NOTAS_POR_HABILIDAD = 6;

/** Agrupa todas las notas por habilidad, sin repetir el mismo texto, en orden de fechas. */
export function notasPorHabilidad(
  reportes: ReporteConNotas[],
  maxPorHabilidad = MAX_NOTAS_POR_HABILIDAD
): NotasDeHabilidad[] {
  const cronologico = [...reportes].sort((a, b) => String(a.fecha || '').localeCompare(String(b.fecha || '')));
  const grupos = new Map<string, NotasDeHabilidad>();
  cronologico.forEach((r) => {
    Object.entries(r.notas_habilidades || {}).forEach(([id, texto]) => {
      const nota = String(texto || '').replace(/\s+/g, ' ').trim();
      if (!nota) return;
      const competencia = COMPETENCIA_POR_ID.get(id);
      const grupo =
        grupos.get(id) ||
        { id, nombre: competencia?.nombre || id.replace(/_/g, ' '), ayuda: competencia?.ayuda || '', notas: [] };
      if (grupo.notas.some((n) => n.nota.toLowerCase() === nota.toLowerCase())) return;
      const puntos = puntosDeValor(r.evaluacion_tecnica?.[id]);
      grupo.notas.push({
        fecha: r.fecha,
        nivel: reportTechnicalLevelForRender(r.nivel_reportado),
        paso: puntos === null ? null : ETIQUETA_PASO[puntos],
        nota,
      });
      grupos.set(id, grupo);
    });
  });
  return [...grupos.values()]
    .map((g) => ({ ...g, notas: g.notas.slice(-maxPorHabilidad) }))
    // Primero las habilidades con más seguimiento.
    .sort((a, b) => b.notas.length - a.notas.length || a.nombre.localeCompare(b.nombre, 'es'));
}

const nombreNivel = (nivel: string | null) => (nivel === 'INICIACION' ? 'Iniciación' : nivel || '');

/**
 * Líneas de la sección para ChatGPT. Devuelve [] si no hay notas (reportes
 * anteriores al 02/10), para no añadir una sección vacía.
 */
export function seccionNotasEntrenadores(
  reportes: ReporteConNotas[],
  formatDate: (fecha: string) => string,
  maxPorHabilidad = MAX_NOTAS_POR_HABILIDAD
): string[] {
  const habilidades = notasPorHabilidad(reportes, maxPorHabilidad);
  if (habilidades.length === 0) return [];
  const lineas = [
    'LO QUE HAN ESCRITO SUS ENTRENADORES EN CADA HABILIDAD (fuente principal: úsala para personalizar)',
  ];
  habilidades.forEach((h) => {
    lineas.push(`${h.nombre}${h.ayuda ? ` — ${h.ayuda}` : ''}`);
    h.notas.forEach((n) => {
      const detalle = [nombreNivel(n.nivel), n.paso].filter(Boolean).join(' · ');
      lineas.push(`  • ${formatDate(n.fecha)}${detalle ? ` (${detalle})` : ''}: ${n.nota}`);
    });
  });
  return lineas;
}

/** Instrucción común para que ChatGPT se apoye en las notas. */
export const INSTRUCCION_NOTAS_CHATGPT =
  'Apóyate sobre todo en «Lo que han escrito sus entrenadores»: cuenta con ejemplos concretos cómo ha ido evolucionando en cada habilidad (de las notas más antiguas a las más recientes), explicado con palabras sencillas para la familia, sin tecnicismos ni puntuaciones, sin citar fechas sueltas ni nombres de entrenadores.';
