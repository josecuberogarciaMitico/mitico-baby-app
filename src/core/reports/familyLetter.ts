/**
 * Fase 4 (02/10/2026): carta para la familia desde la ficha del alumno.
 *
 * Decisiones de Jose:
 * - Se saca desde la ficha, alumno a alumno (Baby, Ocio e Intensivos).
 * - La redacta ChatGPT: la app prepara un resumen para copiar y pegar allí.
 * - La carta final se descarga en PDF con el formato del club.
 *
 * Fuente: las habilidades de su nivel y las notas del entrenador por habilidad.
 * Nunca se incluyen incidencias, observaciones internas ni lo marcado en
 * «¿Algo a destacar?» (llanto, miedo…). Solo se usa el nombre de pila en el
 * texto para ChatGPT.
 */
import type { PdfBlock } from '../../features/billing/simplePdf';
import { reportTechnicalLevelForRender } from '../../lib/adaptiveReport';
import type { HistorialReporteAlumnoFichaApp } from './reportTypes';
import type { EstadoHabilidad, ProgresoHabilidad } from './skillProgress';

export type DatosCartaFamilia = {
  /** Nombre completo tal y como está en la app. */
  nombre: string;
  edad: number | null;
  nivel: string | null;
  /** Historial ordenado de más reciente a más antiguo. */
  reportes: HistorialReporteAlumnoFichaApp[];
  /** progresoHabilidadesNivel(reportes, nivel) */
  progreso: ProgresoHabilidad[];
  formatDate: (fecha: string) => string;
};

/** Cómo se cuenta cada estado a la familia (más amable que la escala interna). */
export const ESTADO_PARA_FAMILIA: Record<EstadoHabilidad, string> = {
  conseguido: 'Conseguido',
  va_apareciendo: 'En progreso',
  todavia_no: 'Lo estamos trabajando',
  sin_ver: 'Próximamente',
};

const NOTAS_POR_HABILIDAD = 3;
const ACTITUDES_GENERALES = new Set(['Muy buena', 'Buena', 'Correcta']);

export const nombreNivelFamilia = (nivel: string | null | undefined) =>
  nivel === 'INICIACION' ? 'Iniciación' : nivel || '';

/** «LUCAS GARCÍA PÉREZ» → «Lucas». */
export function nombreDePila(nombre: string): string {
  const primero = String(nombre || '').trim().split(/\s+/)[0] || '';
  if (!primero) return 'el alumno';
  return primero.charAt(0).toLocaleUpperCase('es-ES') + primero.slice(1).toLocaleLowerCase('es-ES');
}

function modalidadLegible(modalidad: string | null | undefined) {
  const m = String(modalidad || '').toUpperCase();
  if (m.includes('BABY')) return 'Baby';
  if (m.includes('OCIO')) return 'Ocio';
  if (m.includes('INTENSIV')) return 'Intensivos';
  return '';
}

/** Recorrido de niveles en orden cronológico, sin repetir seguidos: «B → B+ → C». */
export function recorridoNiveles(reportes: HistorialReporteAlumnoFichaApp[]): string[] {
  const cronologico = [...reportes].sort((a, b) => String(a.fecha).localeCompare(String(b.fecha)));
  const niveles: string[] = [];
  cronologico.forEach((r) => {
    const n = reportTechnicalLevelForRender(r.nivel_reportado);
    if (n && niveles[niveles.length - 1] !== n) niveles.push(n);
  });
  return niveles;
}

/** Texto que se copia y se pega en ChatGPT para que redacte la carta. */
export function textoParaChatGPT(datos: DatosCartaFamilia): string {
  const pila = nombreDePila(datos.nombre);
  const reportes = datos.reportes.filter((r) => r.fecha);
  const fechas = reportes.map((r) => r.fecha).sort();
  const modalidades = Array.from(new Set(reportes.map((r) => modalidadLegible(r.modalidad)).filter(Boolean)));
  const recorrido = recorridoNiveles(reportes);
  const nivel = nombreNivelFamilia(datos.nivel);

  const lineas: string[] = [];
  lineas.push(`Escribe una carta breve para la familia de ${pila}, alumno de la escuela de esquí Mítico Club.`);
  lineas.push('');
  lineas.push('DATOS (no inventes nada que no esté aquí):');
  lineas.push(`- Nombre: ${pila}${datos.edad !== null ? ` (${datos.edad} años)` : ''}`);
  if (modalidades.length) lineas.push(`- Actividad: ${modalidades.join(', ')}`);
  if (nivel) lineas.push(`- Nivel actual: ${nivel}`);
  if (recorrido.length > 1) lineas.push(`- Niveles por los que ha pasado: ${recorrido.map(nombreNivelFamilia).join(' → ')}`);
  if (fechas.length) {
    lineas.push(
      `- Sesiones con informe del entrenador: ${reportes.length} (del ${datos.formatDate(fechas[0])} al ${datos.formatDate(
        fechas[fechas.length - 1]
      )})`
    );
  }

  const actitudes = reportes.map((r) => String(r.actitud || '')).filter((a) => ACTITUDES_GENERALES.has(a));
  if (actitudes.length) {
    const buenas = actitudes.filter((a) => a !== 'Correcta').length;
    lineas.push(`- Actitud: buena o muy buena en ${buenas} de ${actitudes.length} sesiones`);
  }
  const autonomia = reportes.find((r) => r.autonomia)?.autonomia;
  if (autonomia) lineas.push(`- Autonomía en la última sesión: ${autonomia}`);
  const remontes = reportes.find((r) => r.remontes && r.remontes.length)?.remontes;
  if (remontes && remontes.length) lineas.push(`- Remontes que ya usa: ${remontes.join(', ')}`);

  const vistas = datos.progreso.filter((p) => p.estado !== 'sin_ver');
  if (vistas.length) {
    lineas.push('');
    lineas.push(`HABILIDADES DE SU NIVEL${nivel ? ` (${nivel})` : ''} Y NOTAS DE SUS ENTRENADORES:`);
    vistas.forEach((p) => {
      lineas.push(`- ${p.habilidad.nombre}: ${ESTADO_PARA_FAMILIA[p.estado]}${p.habilidad.foco ? ' (objetivo principal del nivel)' : ''}`);
      p.valoraciones
        .filter((v) => v.nota)
        .slice(0, NOTAS_POR_HABILIDAD)
        .forEach((v) => lineas.push(`    · ${datos.formatDate(v.fecha)}: ${v.nota}`));
    });
  }
  const pendientes = datos.progreso.filter((p) => p.estado === 'sin_ver');
  if (pendientes.length) {
    lineas.push(`- Todavía sin trabajar en este nivel: ${pendientes.map((p) => p.habilidad.nombre).join(', ')}`);
  }

  lineas.push('');
  lineas.push('CÓMO ESCRIBIRLA:');
  lineas.push('- En español, con un tono cercano, positivo y honesto. Dirígete a la familia («Hola, familia»).');
  lineas.push('- Entre 150 y 250 palabras, en 3 o 4 párrafos cortos.');
  lineas.push('- Primero lo que ya consigue; después en qué está mejorando; al final el siguiente paso.');
  lineas.push('- Explica las habilidades con palabras sencillas, sin tecnicismos de esquí.');
  lineas.push('- No menciones puntuaciones, fechas sueltas ni nombres de entrenadores.');
  lineas.push('- Sin emojis, sin negritas y sin títulos: solo el texto de la carta.');
  lineas.push('- Termina con una despedida en nombre de «El equipo de Mítico Club».');
  return lineas.join('\n');
}

/**
 * Limpia el texto pegado desde ChatGPT para el PDF: quita marcas de formato
 * (**, #, viñetas de markdown) y emojis, que la fuente del PDF no puede pintar.
 */
export function limpiarCarta(texto: string): string {
  return String(texto || '')
    .replace(/\r\n?/g, '\n')
    .replace(/\*\*|__|`/g, '')
    .replace(/^[ \t]{0,3}#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]*[-*•][ \t]+/gm, '• ')
    .replace(/[ \t]*[\u{1F000}-\u{1FAFF}\u{2600}-\u{27BF}\u{FE0F}\u{200D}\u{2B00}-\u{2BFF}]+/gu, '')
    .replace(/[ \t]+$/gm, '')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

export function nombreArchivoCarta(nombre: string) {
  const base = String(nombre || 'Alumno').replace(/[\\/:*?"<>|]+/g, ' ').replace(/\s+/g, ' ').trim();
  return `Carta familia - ${base || 'Alumno'}.pdf`;
}

/** Bloques del PDF: cabecera del club, la carta y (opcional) la tabla de habilidades. */
export function bloquesCartaFamilia(
  datos: DatosCartaFamilia,
  carta: string,
  opciones: { incluirHabilidades: boolean; fechaHoy: string }
): PdfBlock[] {
  const nivel = nombreNivelFamilia(datos.nivel);
  const bloques: PdfBlock[] = [
    { kind: 'paragraph', runs: [{ text: 'MÍTICO CLUB · ESCUELA DE ESQUÍ', bold: true }], size: 8, color: '#0f766e' },
    { kind: 'heading', level: 1, text: `Carta para la familia de ${nombreDePila(datos.nombre)}` },
    {
      kind: 'paragraph',
      runs: [{ text: [datos.nombre, nivel ? `Nivel ${nivel}` : '', opciones.fechaHoy].filter(Boolean).join(' · ') }],
      size: 9.5,
      color: '#475569',
    },
    { kind: 'rule' },
  ];
  limpiarCarta(carta)
    // ChatGPT no corta las líneas: cada salto de línea es un párrafo
    // (así la despedida y la firma quedan en líneas distintas).
    .split(/\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((parrafo) => bloques.push({ kind: 'paragraph', runs: [{ text: parrafo }], size: 11 }));

  const conEstado = datos.progreso.filter((p) => p.estado !== 'sin_ver');
  if (opciones.incluirHabilidades && conEstado.length) {
    bloques.push({ kind: 'heading', level: 2, text: `Habilidades de su nivel${nivel ? ` (${nivel})` : ''}` });
    bloques.push({
      kind: 'table',
      header: ['Habilidad', 'Cómo va'],
      rows: datos.progreso.map((p) => [
        { text: p.habilidad.nombre, bold: p.habilidad.foco },
        { text: ESTADO_PARA_FAMILIA[p.estado], bold: p.estado === 'conseguido' },
      ]),
      headerFill: '#ecfdf5',
    });
  }
  return bloques;
}
