/**
 * Informe de evaluación del Intensivo para la familia (10/11/2026).
 *
 * Decisiones de Jose:
 * - Sin ChatGPT: el texto sigue SIEMPRE la misma plantilla y se rellena solo
 *   con los datos de la app (asistencia, niveles y habilidades valoradas).
 * - Un PDF serio y profesional (una página por niño) que la familia abre en
 *   el móvil, y un PDF «maestro» con todos los niños del intensivo.
 * - Botón de WhatsApp por niño con el mensaje ya escrito.
 *
 * Nunca se usan las observaciones ni los comentarios libres de los
 * entrenadores: son internos. Solo datos estructurados de los reportes.
 */
import type { PdfBlock } from '../../features/billing/simplePdf';
import { habilidadesDelNivel, reportTechnicalLevelForRender } from '../../lib/adaptiveReport';
import { TECHNICAL_LEVELS, technicalLevelOrder } from '../levels/levelContract';
import type { ReporteDetalleIntensivoApp, ResumenFinalIntensivoApp } from './evaluationTypes';

export type EstadoFamilia = 'Lo consigue' | 'En progreso' | 'Seguimos trabajándolo';

export type InformeIntensivoFamilia = {
  nombreCompleto: string;
  nombre: string;
  intensivo: string;
  fechas: string;
  asistencia: string;
  nivelInicio: string;
  nivelFinal: string;
  evolucion: string;
  /** Breve descripción de la mejora: técnica pero cercana (10/11). */
  mejora: string;
  habilidades: { nombre: string; estado: EstadoFamilia }[];
  actitud: string;
  autonomia: string;
  objetivos: string[];
  revisado: boolean;
};

const NOMBRES_HABILIDAD: Map<string, string> = (() => {
  const m = new Map<string, string>();
  TECHNICAL_LEVELS.forEach((nivel) => habilidadesDelNivel(nivel).forEach((h) => m.set(h.id, h.nombre)));
  return m;
})();
/** Qué significa cada habilidad («Enlaza giros a ambos lados manteniendo el control.»). */
const AYUDA_HABILIDAD: Map<string, string> = (() => {
  const m = new Map<string, string>();
  TECHNICAL_LEVELS.forEach((nivel) => habilidadesDelNivel(nivel).forEach((h) => m.set(h.id, h.ayuda)));
  return m;
})();

const PUNTOS: Record<EstadoFamilia, number> = { 'Seguimos trabajándolo': 0, 'En progreso': 1, 'Lo consigue': 2 };

function minusculaInicial(t: string) {
  return t ? t.charAt(0).toLocaleLowerCase('es-ES') + t.slice(1) : t;
}
function unirY(partes: string[]) {
  return partes.length <= 1 ? partes.join('') : `${partes.slice(0, -1).join(', ')} y ${partes[partes.length - 1]}`;
}

/**
 * «Durante el intensivo lo que más ha mejorado es la técnica de giro: ya enlaza
 * giros a ambos lados manteniendo el control y regula la velocidad cerrando los
 * giros. Ahora estamos afinando la transición y el paralelismo.»
 * Usa la descripción de cada habilidad del catálogo (nunca notas libres).
 */
export function descripcionMejora(
  nombre: string,
  primera: Map<string, EstadoFamilia>,
  ultima: Map<string, EstadoFamilia>
) {
  const ids = [...ultima.keys()];
  const mejoradas = ids.filter((id) => PUNTOS[ultima.get(id) as EstadoFamilia] > PUNTOS[primera.get(id) ?? 'Seguimos trabajándolo'] && ultima.get(id) === 'Lo consigue');
  const conseguidas = ids.filter((id) => ultima.get(id) === 'Lo consigue');
  const destacar = (mejoradas.length ? mejoradas : conseguidas).slice(0, 2);
  const afinando = ids.filter((id) => ultima.get(id) !== 'Lo consigue').slice(0, 2);
  const frases: string[] = [];
  if (destacar.length) {
    const textos = destacar.map((id) => minusculaInicial(String(AYUDA_HABILIDAD.get(id) || '').replace(/\.\s*$/, ''))).filter(Boolean);
    frases.push(`${mejoradas.length ? 'Lo que más ha mejorado' : 'Lo que ya tiene bien asentado'}: ${nombre} ya ${unirY(textos)}.`);
  }
  if (afinando.length) {
    frases.push(`Ahora estamos afinando ${unirY(afinando.map((id) => minusculaInicial(NOMBRES_HABILIDAD.get(id) || '')))}, que es lo que le hará dar el siguiente paso.`);
  }
  return frases.join(' ');
}

function capitalizar(palabra: string) {
  return palabra.charAt(0).toLocaleUpperCase('es-ES') + palabra.slice(1).toLocaleLowerCase('es-ES');
}

/** «OLIVIA VAZQUEZ GARCIA» → «Olivia Vazquez Garcia». */
export function nombreBonito(nombre: string) {
  return String(nombre || '').trim().split(/\s+/).filter(Boolean).map(capitalizar).join(' ');
}

export function nivelParaFamilia(nivel: string | null | undefined) {
  const n = reportTechnicalLevelForRender(nivel) || String(nivel || '').trim();
  return n === 'INICIACION' ? 'Iniciación' : n;
}

function estadoFamilia(valor: string | null | undefined): EstadoFamilia | null {
  if (valor === 'Consolidado') return 'Lo consigue';
  if (valor === 'En desarrollo' || valor === 'Correcto') return 'En progreso';
  if (valor === 'Necesita mejorar') return 'Seguimos trabajándolo';
  return null;
}

/** Prioridades internas que no se cuentan a la familia. */
const NO_PARA_FAMILIA = /revisar nivel|revisar con|coordinador|incidencia/i;

export function construirInformeIntensivo(
  registro: ResumenFinalIntensivoApp,
  reportes: ReporteDetalleIntensivoApp[],
  opciones: { fechas: string }
): InformeIntensivoFamilia {
  const orden = [...reportes].sort(
    (a, b) => String(a.fecha).localeCompare(String(b.fecha)) || (a.numero_dia || 0) - (b.numero_dia || 0)
  );
  const nivelInicio = nivelParaFamilia(orden.find((r) => r.nivel_reportado)?.nivel_reportado);
  const nivelFinal = nivelParaFamilia(
    registro.nivel_final_confirmado || registro.nivel_final_propuesto || registro.nivel_ultimo_reporte
  );
  const nombre = nombreBonito(registro.alumno).split(' ')[0] || 'vuestro hijo/a';

  let evolucion: string;
  const oInicio = technicalLevelOrder(reportTechnicalLevelForRender(nivelInicio === 'Iniciación' ? 'INICIACION' : nivelInicio));
  const oFinal = technicalLevelOrder(reportTechnicalLevelForRender(nivelFinal === 'Iniciación' ? 'INICIACION' : nivelFinal));
  if (!nivelFinal) evolucion = `${nombre} ha completado el intensivo trabajando los contenidos de su nivel.`;
  else if (nivelInicio && oInicio !== null && oFinal !== null && oFinal > oInicio)
    evolucion = `¡Ha subido de nivel! ${nombre} empezó el intensivo en nivel ${nivelInicio} y lo termina en nivel ${nivelFinal}.`;
  else evolucion = `${nombre} ha consolidado su nivel ${nivelFinal}, afianzando las habilidades que lo forman.`;

  // Primera y última valoración de cada habilidad a lo largo del intensivo.
  const primera = new Map<string, EstadoFamilia>();
  const ultima = new Map<string, EstadoFamilia>();
  orden.forEach((r) => {
    Object.entries(r.evaluacion_tecnica || {}).forEach(([id, valor]) => {
      const e = estadoFamilia(valor as string);
      if (!e || !NOMBRES_HABILIDAD.has(id)) return;
      if (!primera.has(id)) primera.set(id, e);
      ultima.set(id, e);
    });
  });
  const pesoEstado: Record<EstadoFamilia, number> = { 'Lo consigue': 0, 'En progreso': 1, 'Seguimos trabajándolo': 2 };
  const habilidades = [...ultima.entries()]
    .map(([id, estado]) => ({ nombre: NOMBRES_HABILIDAD.get(id) as string, estado }))
    .sort((a, b) => pesoEstado[a.estado] - pesoEstado[b.estado] || a.nombre.localeCompare(b.nombre, 'es'));

  const ultimoCon = <K extends keyof ReporteDetalleIntensivoApp>(campo: K) =>
    [...orden].reverse().map((r) => r[campo]).find((v) => (Array.isArray(v) ? v.length > 0 : Boolean(String(v ?? '').trim())));

  const prioridades = ((ultimoCon('prioridades_proxima_sesion') as string[] | undefined) || [])
    .map((p) => String(p).trim())
    .filter((p) => p && !NO_PARA_FAMILIA.test(p));
  const enProgreso = habilidades.filter((h) => h.estado !== 'Lo consigue').map((h) => h.nombre);
  const objetivos = [...new Set([...prioridades, ...enProgreso])].slice(0, 4);

  const presentes = Number(registro.dias_presente || 0);
  const total = Number(registro.total_dias_intensivo || 0);

  return {
    nombreCompleto: nombreBonito(registro.alumno),
    nombre,
    intensivo: registro.intensivo,
    fechas: opciones.fechas,
    asistencia: total ? `${presentes} de ${total} días` : `${presentes} días`,
    nivelInicio: nivelInicio || '—',
    nivelFinal: nivelFinal || '—',
    evolucion,
    mejora: descripcionMejora(nombre, primera, ultima),
    habilidades,
    actitud: String(ultimoCon('actitud') || '').trim(),
    autonomia: String(ultimoCon('autonomia') || '').trim(),
    objetivos,
    revisado: String(registro.estado_diploma || '').toLowerCase() === 'revisado',
  };
}

/** Una página del PDF por niño, siempre con la misma estructura. */
export function bloquesInformeIntensivo(inf: InformeIntensivoFamilia, fechaHoy: string): PdfBlock[] {
  const bloques: PdfBlock[] = [
    { kind: 'paragraph', runs: [{ text: 'MÍTICO CLUB · ESCUELA DE ESQUÍ', bold: true }], size: 8, color: '#0f766e' },
    { kind: 'heading', level: 1, text: 'Informe de evaluación' },
    { kind: 'paragraph', runs: [{ text: [inf.intensivo, inf.fechas].filter(Boolean).join(' · ') }], size: 9.5, color: '#475569' },
    { kind: 'rule' },
    { kind: 'heading', level: 2, text: inf.nombreCompleto },
    {
      kind: 'boxes',
      items: [
        { title: 'Asistencia', value: inf.asistencia },
        { title: 'Nivel de inicio', value: inf.nivelInicio },
        { title: 'Nivel final', value: inf.nivelFinal },
      ],
    },
    { kind: 'heading', level: 3, text: 'Su evolución' },
    { kind: 'paragraph', runs: [{ text: inf.evolucion }], size: 11 },
    ...(inf.mejora ? [{ kind: 'paragraph', runs: [{ text: inf.mejora }], size: 11 } as PdfBlock] : []),
  ];
  if (inf.habilidades.length) {
    bloques.push({ kind: 'heading', level: 3, text: 'Habilidades trabajadas' });
    bloques.push({
      kind: 'table',
      header: ['Habilidad', 'Cómo va'],
      rows: inf.habilidades.map((h) => [{ text: h.nombre }, { text: h.estado, bold: h.estado === 'Lo consigue' }]),
      headerFill: '#ecfdf5',
    });
  }
  if (inf.actitud || inf.autonomia) {
    bloques.push({ kind: 'heading', level: 3, text: 'Actitud y autonomía' });
    if (inf.actitud) bloques.push({ kind: 'paragraph', runs: [{ text: 'Actitud: ', bold: true }, { text: inf.actitud }], size: 11 });
    if (inf.autonomia) bloques.push({ kind: 'paragraph', runs: [{ text: 'Autonomía: ', bold: true }, { text: inf.autonomia }], size: 11 });
  }
  if (inf.objetivos.length) {
    bloques.push({ kind: 'heading', level: 3, text: 'Próximos objetivos' });
    inf.objetivos.forEach((o) => bloques.push({ kind: 'paragraph', runs: [{ text: `•  ${o}` }], size: 11 }));
  }
  bloques.push({ kind: 'rule' });
  bloques.push({
    kind: 'paragraph',
    runs: [{ text: `Gracias por confiar en Mítico. ¡Seguimos disfrutando de la nieve con ${inf.nombre}!` }],
    size: 11,
  });
  bloques.push({ kind: 'paragraph', runs: [{ text: 'Coordinación deportiva · Mítico Club', bold: true }], size: 10 });
  bloques.push({ kind: 'paragraph', runs: [{ text: fechaHoy }], size: 9, color: '#64748b' });
  return bloques;
}

/** PDF maestro: todos los niños, uno por página. */
export function bloquesInformesMaestro(informes: InformeIntensivoFamilia[], fechaHoy: string): PdfBlock[] {
  return informes.flatMap((inf, i) => [
    ...(i > 0 ? [{ kind: 'pageBreak' } as PdfBlock] : []),
    ...bloquesInformeIntensivo(inf, fechaHoy),
  ]);
}

/** Mensaje de WhatsApp (misma plantilla para todos). */
export function textoWhatsappInforme(inf: InformeIntensivoFamilia) {
  const consigue = inf.habilidades.filter((h) => h.estado === 'Lo consigue').map((h) => h.nombre).slice(0, 3);
  const lineas = [
    `Hola 👋 Os enviamos la evaluación de ${inf.nombre} del ${inf.intensivo} 🎿`,
    '',
    `📅 Asistencia: ${inf.asistencia}`,
    `🏁 ${inf.evolucion}`,
    ...(inf.mejora ? [`📝 ${inf.mejora}`] : consigue.length ? [`✅ Ya consigue: ${consigue.join(', ')}`] : []),
    ...(inf.objetivos.length ? [`🎯 Próximo objetivo: ${inf.objetivos.slice(0, 2).join(', ')}`] : []),
    ...(inf.actitud ? [`💬 Actitud: ${inf.actitud}`] : []),
    '',
    'Os pasamos también el informe completo en PDF.',
    '¡Gracias por confiar en Mítico! 💚',
  ];
  return lineas.join('\n');
}

export function nombreArchivoInforme(nombre: string, intensivo: string) {
  // Sin tildes: algunos navegadores cambian el nombre a «download» si las lleva.
  const limpio = (t: string) =>
    String(t || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Za-z0-9 ._-]+/g, ' ').replace(/\s+/g, ' ').trim();
  return `Evaluacion ${limpio(intensivo)} - ${limpio(nombre) || 'Alumno'}.pdf`;
}
