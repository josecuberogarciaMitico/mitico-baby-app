/**
 * «Todo en bruto» (15/10/2026, petición de Jose): todo lo que hay guardado de
 * un alumno, sin resumir ni filtrar, para pegarlo en ChatGPT o retocarlo a mano.
 *
 * - Todos los reportes (Baby, Ocio e Intensivos), del más antiguo al más reciente.
 * - En cada reporte, todos los campos con contenido, incluidas incidencias,
 *   observaciones y cualquier campo que la base de datos devuelva aunque la app
 *   no lo conozca todavía (para que nunca se quede nada fuera).
 * - Cada habilidad valorada con su paso y la nota del entrenador.
 * - Al final, las notas agrupadas por habilidad (todas, sin límite).
 */
import type { HistorialReporteAlumnoFichaApp } from './reportTypes';
import { ETIQUETA_PASO, puntosDeValor } from './skillProgress';
import { nombreHabilidad, seccionNotasEntrenadores } from './skillNotes';

export type DatosBrutoAlumno = {
  alumno: string;
  edad?: number | null;
  nivelFicha?: string | null;
  reportes: HistorialReporteAlumnoFichaApp[];
  formatDate: (fecha: string) => string;
  /** Datos extra ya calculados (p. ej. la evaluación anual de Ocio), se vuelcan tal cual. */
  extra?: { titulo: string; datos: Record<string, unknown> } | null;
};

// Campos que no aportan nada al texto (identificadores internos).
const IGNORAR = new Set(['reporte_id', 'alumno_id', 'grupo_id', 'entrenador_id', 'sesion_id', 'id']);

// Orden y etiqueta de los campos conocidos. El resto se añade después con su nombre.
const CAMPOS: Array<[string, string]> = [
  ['modalidad', 'Modalidad'],
  ['grupo', 'Grupo'],
  ['entrenador', 'Entrenador'],
  ['nivel_reportado', 'Nivel'],
  ['actitud', 'Actitud'],
  ['actitud_comentario', 'Actitud (detalle)'],
  ['autonomia', 'Autonomía'],
  ['ritmo_grupo', 'Ritmo respecto al grupo'],
  ['pista', 'Pista'],
  ['remontes', 'Remontes'],
  ['tecnica', 'Técnica (antiguo)'],
  ['mejoras_hoy', 'Mejoras de hoy'],
  ['mejora_hoy', 'Mejora de hoy'],
  ['prioridades_proxima_sesion', 'Prioridades próxima sesión'],
  ['recomendacion', 'Recomendación'],
  ['observaciones_generales', 'Observaciones'],
  ['incidencia', 'Incidencia'],
  ['trabajo_diario', 'Trabajo del grupo (último guardado)'],
];
const ESPECIALES = new Set(['fecha', 'evaluacion_tecnica', 'notas_habilidades', 'enviado_at', 'reporte_version']);

function valorTexto(valor: unknown): string {
  if (valor === null || valor === undefined) return '';
  if (Array.isArray(valor)) return valor.map(valorTexto).filter(Boolean).join(' · ');
  if (typeof valor === 'object') {
    return Object.entries(valor as Record<string, unknown>)
      .map(([k, v]) => (valorTexto(v) ? `${k}: ${valorTexto(v)}` : ''))
      .filter(Boolean)
      .join(' · ');
  }
  if (typeof valor === 'boolean') return valor ? 'sí' : 'no';
  return String(valor).trim();
}

const etiquetaCampo = (clave: string) => clave.replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase());

/** Líneas de un campo; los textos de varias líneas van sangrados debajo. */
function lineasCampo(etiqueta: string, texto: string): string[] {
  const partes = texto.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  if (partes.length <= 1) return [`  ${etiqueta}: ${texto}`];
  return [`  ${etiqueta}:`, ...partes.map((l) => `     ${l}`)];
}

export function lineasReporteBruto(
  r: HistorialReporteAlumnoFichaApp,
  formatDate: (f: string) => string,
  anterior?: HistorialReporteAlumnoFichaApp | null
): string[] {
  const fila = r as unknown as Record<string, unknown>;
  const lineas: string[] = [`■ ${r.fecha ? formatDate(r.fecha) : 'Sin fecha'}`];
  const usados = new Set<string>();
  CAMPOS.forEach(([clave, etiqueta]) => {
    usados.add(clave);
    const texto = valorTexto(fila[clave]);
    if (!texto) return;
    // El trabajo del grupo es el último guardado de ese grupo: no se repite entero.
    if (clave === 'trabajo_diario' && anterior && valorTexto(anterior.trabajo_diario) === texto) {
      lineas.push(`  ${etiqueta}: igual que el reporte anterior`);
      return;
    }
    lineas.push(...lineasCampo(etiqueta, texto));
  });

  const evaluacion = (r.evaluacion_tecnica || {}) as Record<string, string>;
  const notas = (r.notas_habilidades || {}) as Record<string, string>;
  const ids = Array.from(new Set([...Object.keys(evaluacion), ...Object.keys(notas)]));
  const habilidades = ids
    .map((id) => {
      const puntos = puntosDeValor(evaluacion[id]);
      const paso = puntos === null ? '' : ETIQUETA_PASO[puntos];
      const nota = String(notas[id] || '').replace(/\s+/g, ' ').trim();
      if (!paso && !nota) return '';
      return `     - ${nombreHabilidad(id)}: ${paso || 'sin valorar'}${nota ? ` — «${nota}»` : ''}`;
    })
    .filter(Boolean);
  if (habilidades.length) lineas.push('  Habilidades:', ...habilidades);

  // Cualquier otro campo que llegue de la base de datos y no esté arriba.
  Object.keys(fila)
    .filter((k) => !usados.has(k) && !ESPECIALES.has(k) && !IGNORAR.has(k))
    .sort()
    .forEach((k) => {
      const texto = valorTexto(fila[k]);
      if (texto) lineas.push(...lineasCampo(etiquetaCampo(k), texto));
    });
  return lineas;
}

export function textoBrutoAlumno(datos: DatosBrutoAlumno): string {
  const cronologico = [...datos.reportes].sort((a, b) => String(a.fecha || '').localeCompare(String(b.fecha || '')));
  const fechas = cronologico.map((r) => r.fecha).filter(Boolean);
  const lineas: string[] = [
    `TODO LO REGISTRADO DE ${datos.alumno} (en bruto, sin resumir)`,
    ...(datos.edad !== null && datos.edad !== undefined ? [`Edad: ${datos.edad} años`] : []),
    ...(datos.nivelFicha ? [`Nivel en la ficha: ${datos.nivelFicha}`] : []),
    `Reportes: ${cronologico.length}${
      fechas.length ? ` (del ${datos.formatDate(fechas[0])} al ${datos.formatDate(fechas[fechas.length - 1])})` : ''
    }`,
  ];

  if (datos.extra) {
    const extra = Object.entries(datos.extra.datos)
      .filter(([k]) => !IGNORAR.has(k) && k !== 'alumno')
      .map(([k, v]) => [k, valorTexto(v)] as const)
      .filter(([, v]) => v);
    if (extra.length) {
      lineas.push('', datos.extra.titulo.toUpperCase());
      extra.forEach(([k, v]) => lineas.push(...lineasCampo(etiquetaCampo(k), v)));
    }
  }

  lineas.push('', 'REPORTES, DEL MÁS ANTIGUO AL MÁS RECIENTE');
  if (cronologico.length === 0) lineas.push('  (Sin reportes guardados)');
  cronologico.forEach((r, i) => lineas.push('', ...lineasReporteBruto(r, datos.formatDate, cronologico[i - 1] || null)));

  const notas = seccionNotasEntrenadores(cronologico, datos.formatDate, Number.MAX_SAFE_INTEGER);
  if (notas.length) lineas.push('', ...notas);

  return lineas.join('\n');
}
