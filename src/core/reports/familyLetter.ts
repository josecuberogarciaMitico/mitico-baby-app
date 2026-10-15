/**
 * Fase 4 (02/10/2026): carta para la familia desde la ficha del alumno.
 *
 * Decisiones de Jose:
 * - Se saca desde la ficha, alumno a alumno (Baby, Ocio e Intensivos).
 * - La redacta ChatGPT: la app prepara un resumen para copiar y pegar allí.
 * - La carta final se descarga en PDF con el formato del club.
 *
 * Fuente (desde el 15/10/2026): TODO lo registrado del alumno («Todo en
 * bruto»). Lo interno va como contexto para ChatGPT, con la instrucción de no
 * citarlo en la carta; el PDF solo lleva el texto que se pegue en el paso 2.
 */
import type { PdfBlock } from '../../features/billing/simplePdf';
import { reportTechnicalLevelForRender } from '../../lib/adaptiveReport';
import type { HistorialReporteAlumnoFichaApp } from './reportTypes';
import type { EstadoHabilidad, ProgresoHabilidad } from './skillProgress';
import { textoBrutoAlumno } from './rawStudentExport';

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


export const nombreNivelFamilia = (nivel: string | null | undefined) =>
  nivel === 'INICIACION' ? 'Iniciación' : nivel || '';

/** «LUCAS GARCÍA PÉREZ» → «Lucas». */
export function nombreDePila(nombre: string): string {
  const primero = String(nombre || '').trim().split(/\s+/)[0] || '';
  if (!primero) return 'el alumno';
  return primero.charAt(0).toLocaleUpperCase('es-ES') + primero.slice(1).toLocaleLowerCase('es-ES');
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

/**
 * Texto que se copia y se pega en ChatGPT para que redacte la carta.
 * 15/10/2026 (Jose: «que no se oculte nada»): lleva TODO lo registrado
 * (el mismo texto que «Todo en bruto») más dónde está en su nivel y cómo
 * escribir la carta. Lo interno (incidencias, entrenadores…) va como contexto.
 */
export function textoParaChatGPT(datos: DatosCartaFamilia): string {
  const pila = nombreDePila(datos.nombre);
  const nivel = nombreNivelFamilia(datos.nivel);
  const lineas: string[] = [
    `Escribe una carta breve para la familia de ${pila}${datos.edad !== null ? ` (${datos.edad} años)` : ''}, alumno de la escuela de esquí Mítico Club.`,
    'Debajo tienes TODO lo que han registrado sus entrenadores. No inventes nada que no esté aquí.',
  ];

  const vistas = datos.progreso.filter((p) => p.estado !== 'sin_ver');
  if (nivel && datos.progreso.length) {
    lineas.push('', `DÓNDE ESTÁ AHORA EN SU NIVEL (${nivel}):`);
    vistas.forEach((p) =>
      lineas.push(`- ${p.habilidad.nombre}: ${ESTADO_PARA_FAMILIA[p.estado]}${p.habilidad.foco ? ' (objetivo principal del nivel)' : ''}`)
    );
    const pendientes = datos.progreso.filter((p) => p.estado === 'sin_ver');
    if (pendientes.length) lineas.push(`- Todavía sin trabajar en este nivel: ${pendientes.map((p) => p.habilidad.nombre).join(', ')}`);
  }

  lineas.push(
    '',
    textoBrutoAlumno({
      alumno: datos.nombre,
      edad: datos.edad,
      nivelFicha: datos.nivel,
      reportes: datos.reportes,
      formatDate: datos.formatDate,
    }),
    '',
    'CÓMO ESCRIBIRLA:',
    `- Llama al niño solo ${pila}. En español, con un tono cercano, positivo y honesto. Dirígete a la familia («Hola, familia»).`,
    '- Entre 150 y 250 palabras, en 3 o 4 párrafos cortos.',
    '- Primero lo que ya consigue; después en qué está mejorando (usa las notas de los entrenadores con ejemplos concretos); al final el siguiente paso.',
    '- Explica las habilidades con palabras sencillas, sin tecnicismos de esquí.',
    '- Las incidencias, las observaciones internas y los nombres de los entrenadores son contexto para ti: no los cites en la carta.',
    '- No menciones puntuaciones ni fechas sueltas.',
    '- Sin emojis, sin negritas y sin títulos: solo el texto de la carta.',
    '- Termina con una despedida en nombre de «El equipo de Mítico Club».'
  );
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
