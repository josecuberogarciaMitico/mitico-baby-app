// Calidad de los reportes (17/11/2026). Lógica pura, sin navegador.
//
// Cada reporte tiene una NOTA de 0 a 10 (decisión de Jose: calidad, no letras).
// Reparto del 17/11 (Jose: «rellenar tarde pesa más»):
//  - Detalle (3,5): escribe lo que ve en lo que no le sale (unas 60 letras por
//    habilidad a mejorar; si todo lo consigue, una frase).
//  - Concreto (3): no marca todo «Lo consigue» sin escribir nada.
//  - A tiempo (2,5): el mismo día o el siguiente (2 días: la mitad; más: 0).
//  - Personal (1): no pone la misma valoración a todo el grupo.
// La nota de un entrenador es la media de sus reportes de los últimos 14 días,
// y CADA REPORTE SIN HACER CUENTA COMO UN 0 (con un día de margen: cuenta a
// partir de los 2 días de la sesión). El color sale solo de la nota.
// Las mismas reglas están en SQL en calidad_reportes_equipo_app (lo que ve el
// entrenador): si se cambian aquí, cambiarlas también allí.

import { faltaJustificacionTodoConsigue } from '../../lib/adaptiveReport';

export type ReporteParaCalidad = {
  reporte_id: string | null;
  /** «Hecho», «Falta reporte», «Asistencia sin confirmar»… */
  estado?: string | null;
  fecha: string;
  grupo_id?: string | null;
  enviado_at?: string | null;
  entrenador: string | null;
  alumno?: string | null;
  alumno_id?: string | null;
  evaluacion_tecnica?: Record<string, string | null | undefined> | null;
  notas_habilidades?: Record<string, string | null | undefined> | null;
  observaciones?: string | null;
};

export type CalidadReporte = {
  /** Habilidades valoradas (sin «No trabajado»). */
  valoradas: number;
  /** Valoradas que no son «Lo consigue». */
  aMejorar: number;
  /** Letras escritas a mano (notas de habilidades + observación). */
  letras: number;
  conObservacion: boolean;
  todoConsigue: boolean;
  pocoDetallado: boolean;
};

/** Lo que hace falta para poner nota a un reporte (también viene así de Supabase). */
export type RasgosReporte = {
  fecha: string;
  valoradas: number;
  aMejorar: number;
  letras: number;
  pocoDetallado: boolean;
  igualGrupo: boolean;
  /** Días entre la sesión y el envío (0 = el mismo día). */
  diasTarde: number | null;
};

export type NotaReporte = { total: number; detalle: number; concreto: number; personal: number; aTiempo: number };

export const PUNTOS = { detalle: 3.5, concreto: 3, personal: 1, aTiempo: 2.5 };
/** Letras que se esperan por cada habilidad a mejorar (la mitad del equipo escribe ~58). */
export const LETRAS_POR_HABILIDAD = 60;

const MIN_OBS = 10;

function objeto(v: unknown): Record<string, string | null | undefined> {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, string | null | undefined>) : {};
}

export function calidadReporte(r: ReporteParaCalidad): CalidadReporte {
  const evaluacion = objeto(r.evaluacion_tecnica);
  const notas = objeto(r.notas_habilidades);
  const valores = Object.values(evaluacion).filter((v) => v && v !== 'No trabajado');
  const obs = String(r.observaciones || '').trim();
  const letras = Object.values(notas).reduce((n, t) => n + String(t || '').trim().length, 0) + obs.length;
  const todoConsigue = valores.length > 0 && valores.every((v) => v === 'Consolidado');
  return {
    valoradas: valores.length,
    aMejorar: valores.filter((v) => v !== 'Consolidado').length,
    letras,
    conObservacion: obs.length >= MIN_OBS,
    todoConsigue,
    pocoDetallado: faltaJustificacionTodoConsigue(evaluacion, notas, obs),
  };
}

const redondear = (n: number, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

/** Nota de 0 a 10 de un reporte. Sin habilidades valoradas no se puntúa (null). */
export function notaReporte(r: RasgosReporte): NotaReporte | null {
  if (r.valoradas <= 0) return null;
  const objetivo = LETRAS_POR_HABILIDAD * Math.max(r.aMejorar, 1);
  const detalle = PUNTOS.detalle * Math.min(r.letras / objetivo, 1);
  const concreto = r.pocoDetallado ? 0 : PUNTOS.concreto;
  const personal = r.igualGrupo ? 0 : PUNTOS.personal;
  const dias = r.diasTarde ?? 0;
  const aTiempo = dias <= 1 ? PUNTOS.aTiempo : dias === 2 ? PUNTOS.aTiempo / 2 : 0;
  return { total: redondear(detalle + concreto + personal + aTiempo), detalle, concreto, personal, aTiempo };
}

export type Semaforo = 'verde' | 'amarillo' | 'rojo' | 'sin_datos';

export type PeriodoCalidad = {
  reportes: number;
  /** Reportes con nota (con habilidades valoradas). */
  puntuados: number;
  /** Nota media 0-10 (null si no hay reportes puntuables). */
  nota: number | null;
  /** Media de cada parte de la nota, de 0 a 1 (1 = todo bien). */
  partes: { detalle: number; concreto: number; personal: number; aTiempo: number };
  /** Reportes sin hacer que ya cuentan como 0 (2 días o más desde la sesión). */
  faltan: number;
  /** % de reportes enviados 2 días o más después de la sesión (el día siguiente es normal). */
  pctTarde: number;
  /** % de reportes con la misma valoración que todo su grupo ese día (grupos de 2+). */
  pctIgualGrupo: number;
  pocoDetallados: number;
  /** % de reportes poco detallados (0-100). */
  pctPocoDetallados: number;
  /** Letras escritas de media por reporte. */
  letrasMedia: number;
};

export type CalidadEntrenador = {
  entrenador: string;
  reciente: PeriodoCalidad;
  anterior: PeriodoCalidad;
  semaforo: Semaforo;
  /** true si su nota baja claramente (1,5 puntos o más) respecto a antes. */
  vaAMenos: boolean;
  /** En qué falla, en frases cortas (para coordinación), de lo más grave a lo menos. */
  fallos: string[];
  /** Reportes flojos recientes (nota por debajo de 6,5), del más nuevo al más viejo. */
  ejemplos: Array<ReporteParaCalidad & { calidad: CalidadReporte; nota: number }>;
};

export const DIAS_RECIENTE = 14;
/** Con menos de estos reportes recientes no se pone color (poca muestra). */
export const MINIMO_REPORTES = 4;
export const UMBRAL = { tarde: 40, igualGrupo: 20, rojo: 6.5, verde: 8, bajada: 1.5 };
/** Un reporte sin hacer cuenta como 0 a partir de estos días desde la sesión. */
export const DIAS_MARGEN_FALTA = 2;

export function periodo(items: RasgosReporte[], faltan = 0): PeriodoCalidad {
  const conNota = items.map((r) => ({ r, n: notaReporte(r) })).filter((x): x is { r: RasgosReporte; n: NotaReporte } => Boolean(x.n));
  const n = items.length;
  const k = conNota.length;
  const media = (f: (x: NotaReporte) => number) => (k ? conNota.reduce((s, x) => s + f(x.n), 0) / k : 1);
  // Los que faltan cuentan como 0 en la nota (no en las partes, que explican los hechos).
  const divisor = k + faltan;
  const sumaTotal = conNota.reduce((s, x) => s + x.n.total, 0);
  const pct = (c: number) => (n ? Math.round((100 * c) / n) : 0);
  const poco = items.filter((r) => r.pocoDetallado).length;
  return {
    reportes: n,
    puntuados: k,
    nota: divisor ? redondear(sumaTotal / divisor) : null,
    partes: {
      detalle: media((x) => x.detalle / PUNTOS.detalle),
      concreto: media((x) => x.concreto / PUNTOS.concreto),
      personal: media((x) => x.personal / PUNTOS.personal),
      aTiempo: media((x) => x.aTiempo / PUNTOS.aTiempo),
    },
    faltan,
    pctTarde: pct(items.filter((r) => (r.diasTarde ?? 0) >= 2).length),
    pctIgualGrupo: pct(items.filter((r) => r.igualGrupo).length),
    pocoDetallados: poco,
    pctPocoDetallados: pct(poco),
    letrasMedia: n ? Math.round(items.reduce((s, r) => s + r.letras, 0) / n) : 0,
  };
}

export function semaforoDe(p: PeriodoCalidad): Semaforo {
  if (p.reportes + p.faltan < MINIMO_REPORTES || p.nota === null) return 'sin_datos';
  if (p.nota < UMBRAL.rojo) return 'rojo';
  if (p.nota < UMBRAL.verde) return 'amarillo';
  return 'verde';
}

export function vaAMenosDe(reciente: PeriodoCalidad, anterior: PeriodoCalidad): boolean {
  return (
    reciente.reportes >= MINIMO_REPORTES &&
    anterior.reportes >= MINIMO_REPORTES &&
    reciente.nota !== null &&
    anterior.nota !== null &&
    anterior.nota - reciente.nota >= UMBRAL.bajada
  );
}

/** Frases de «en qué falla», para coordinación. */
export function fallosDe(reciente: PeriodoCalidad, anterior: PeriodoCalidad, vaAMenos: boolean): string[] {
  const f: string[] = [];
  if (reciente.faltan > 0)
    f.push(`No ha hecho ${reciente.faltan} ${reciente.faltan === 1 ? 'reporte' : 'reportes'} (cuentan como 0 en su nota).`);
  if (reciente.reportes === 0) return f;
  if (reciente.pctPocoDetallados >= 15)
    f.push(`Marca todo «Lo consigue» sin escribir nada en ${reciente.pocoDetallados} de ${reciente.reportes} reportes (${reciente.pctPocoDetallados}%).`);
  if (vaAMenos && anterior.nota !== null && reciente.nota !== null)
    f.push(`Va a menos: su nota ha bajado de ${formatoNota(anterior.nota)} a ${formatoNota(reciente.nota)}.`);
  if (reciente.partes.detalle < 0.75)
    f.push(`Escribe poco en lo que le cuesta al niño: ${reciente.letrasMedia} letras de media por reporte.`);
  if (reciente.pctIgualGrupo >= UMBRAL.igualGrupo)
    f.push(`Pone la misma valoración a todo el grupo en el ${reciente.pctIgualGrupo}% de sus reportes.`);
  if (reciente.pctTarde >= UMBRAL.tarde)
    f.push(`Rellena tarde: el ${reciente.pctTarde}% dos días o más después de la sesión (sale de memoria).`);
  return f;
}

/**
 * Qué hacer para subir la nota, para el propio entrenador (en segunda persona).
 * Tono directo y profesional, en positivo (Jose, 17/11): qué hacer, no lo que
 * hace mal.
 */
export function consejosDe(p: PeriodoCalidad): string[] {
  const c: string[] = [];
  if (p.faltan > 0)
    c.push(
      `Completa ${p.faltan === 1 ? 'el reporte pendiente' : `los ${p.faltan} reportes pendientes`}: mientras falten, cuentan como 0 en la nota.`
    );
  if (p.reportes === 0) return c;
  if (p.partes.concreto < 0.9) c.push('Cuando marques «Lo consigue» en todo, añade una frase con lo que has visto: es lo que justifica subirle de nivel.');
  if (p.partes.detalle < 0.75) c.push('En lo que le cuesta, indica qué le falta y en qué momento. Puedes dictarlo con el micro.');
  if (p.partes.personal < 0.9) c.push('Valora a cada niño por separado, aunque el grupo vaya parecido.');
  if (p.partes.aTiempo < 0.75) c.push('Rellénalos el mismo día de la sesión o al siguiente.');
  return c;
}

/** Puntos fuertes (lo que ya hace bien). */
export function fortalezasDe(p: PeriodoCalidad): string[] {
  if (p.reportes === 0) return [];
  const f: string[] = [];
  if (p.partes.aTiempo >= 0.75) f.push('Reportes al día.');
  if (p.partes.personal >= 0.9) f.push('Valoración individual de cada niño.');
  if (p.partes.concreto >= 0.9) f.push('Justificas los «Lo consigue».');
  if (p.partes.detalle >= 0.75) f.push('Buen detalle en lo que les cuesta.');
  return f;
}

export const formatoNota = (n: number | null) => (n === null ? '—' : n.toFixed(1).replace('.', ','));

/** Día (Madrid) en que se envió. */
function diaEnvio(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function diasEntre(desdeIso: string, hastaIso: string): number {
  return Math.round((Date.parse(`${hastaIso}T12:00:00Z`) - Date.parse(`${desdeIso}T12:00:00Z`)) / 86400000);
}

export function restarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

type Hecho = ReporteParaCalidad & RasgosReporte & { calidad: CalidadReporte };

/**
 * Agrupa por entrenador. «Reciente» = desde hoy-13 hasta hoy (14 días);
 * «anterior» = todo lo de antes que venga en la lista. Solo cuenta reportes
 * hechos (con reporte_id). Ordena del peor al mejor.
 */
export function calidadPorEntrenador(filas: ReporteParaCalidad[], hoyIso: string): CalidadEntrenador[] {
  const corte = restarDias(hoyIso, DIAS_RECIENTE - 1);
  // Valoración idéntica a la de todo su grupo ese día (mismo entrenador, grupos de 2+).
  const claveGrupo = (f: ReporteParaCalidad) => `${f.entrenador}|${f.fecha}|${f.grupo_id || ''}`;
  const evaluaciones = new Map<string, string[]>();
  filas.forEach((f) => {
    if (!f.reporte_id || !f.entrenador || !f.grupo_id) return;
    const lista = evaluaciones.get(claveGrupo(f)) || [];
    lista.push(JSON.stringify(f.evaluacion_tecnica || {}));
    evaluaciones.set(claveGrupo(f), lista);
  });
  const igualQueGrupo = (f: ReporteParaCalidad) => {
    if (!f.grupo_id) return false;
    const lista = evaluaciones.get(claveGrupo(f)) || [];
    return lista.length >= 2 && new Set(lista).size === 1;
  };

  const porEntrenador = new Map<string, Hecho[]>();
  const faltanRecientes = new Map<string, number>();
  filas.forEach((f) => {
    if (!f.entrenador) return;
    if (!f.reporte_id) {
      if (f.estado === 'Falta reporte' && f.fecha >= corte && f.fecha <= restarDias(hoyIso, DIAS_MARGEN_FALTA))
        faltanRecientes.set(f.entrenador, (faltanRecientes.get(f.entrenador) || 0) + 1);
      if (!porEntrenador.has(f.entrenador)) porEntrenador.set(f.entrenador, []);
      return;
    }
    const lista = porEntrenador.get(f.entrenador) || [];
    const dia = diaEnvio(f.enviado_at);
    const calidad = calidadReporte(f);
    lista.push({
      ...f,
      calidad,
      valoradas: calidad.valoradas,
      aMejorar: calidad.aMejorar,
      letras: calidad.letras,
      pocoDetallado: calidad.pocoDetallado,
      igualGrupo: igualQueGrupo(f),
      diasTarde: dia ? diasEntre(f.fecha, dia) : null,
    });
    porEntrenador.set(f.entrenador, lista);
  });

  const peso: Record<Semaforo, number> = { rojo: 0, amarillo: 1, verde: 2, sin_datos: 3 };
  return [...porEntrenador.entries()]
    .map(([entrenador, lista]) => {
      const recientes = lista.filter((r) => r.fecha >= corte);
      const anteriores = lista.filter((r) => r.fecha < corte);
      const reciente = periodo(recientes, faltanRecientes.get(entrenador) || 0);
      const anterior = periodo(anteriores, 0);
      const vaAMenos = vaAMenosDe(reciente, anterior);
      return {
        entrenador,
        reciente,
        anterior,
        semaforo: semaforoDe(reciente),
        vaAMenos,
        fallos: fallosDe(reciente, anterior, vaAMenos),
        ejemplos: recientes
          .map((r) => ({ ...r, nota: notaReporte(r)?.total ?? 10 }))
          .filter((r) => r.nota < UMBRAL.rojo)
          .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))),
      };
    })
    .filter((c) => c.reciente.reportes + c.anterior.reportes + c.reciente.faltan > 0)
    .sort(
      (a, b) =>
        peso[a.semaforo] - peso[b.semaforo] ||
        Number(b.vaAMenos) - Number(a.vaAMenos) ||
        (a.reciente.nota ?? 11) - (b.reciente.nota ?? 11) ||
        a.entrenador.localeCompare(b.entrenador, 'es')
    );
}

/** Nota media del equipo (todos los reportes puntuables del periodo). */
export function notaEquipo(items: RasgosReporte[]): number | null {
  return periodo(items).nota;
}

/** Lo que ve el propio entrenador: su periodo reciente, el anterior y la media del equipo. */
export function calidadPropia(
  filas: Array<RasgosReporte & { esMio: boolean; esFalta?: boolean }>,
  hoyIso: string
): { reciente: PeriodoCalidad; anterior: PeriodoCalidad; equipo: number | null; semaforo: Semaforo; vaAMenos: boolean; consejos: string[]; fortalezas: string[] } {
  const corte = restarDias(hoyIso, DIAS_RECIENTE - 1);
  const limiteFalta = restarDias(hoyIso, DIAS_MARGEN_FALTA);
  const hechas = filas.filter((f) => !f.esFalta);
  const cuentaFaltas = (lista: typeof filas, desde: string, hasta: string) =>
    lista.filter((f) => f.esFalta && f.fecha >= desde && f.fecha < hasta && f.fecha <= limiteFalta).length;
  const mias = hechas.filter((f) => f.esMio);
  const misFaltas = filas.filter((f) => f.esMio);
  const reciente = periodo(mias.filter((f) => f.fecha >= corte), cuentaFaltas(misFaltas, corte, '9999-12-31'));
  // «Antes» solo con lo hecho (igual que en el panel de coordinación).
  const anterior = periodo(mias.filter((f) => f.fecha < corte), 0);
  return {
    reciente,
    anterior,
    equipo: periodo(hechas.filter((f) => f.fecha >= corte), cuentaFaltas(filas, corte, '9999-12-31')).nota,
    semaforo: semaforoDe(reciente),
    vaAMenos: vaAMenosDe(reciente, anterior),
    consejos: consejosDe(reciente),
    fortalezas: fortalezasDe(reciente),
  };
}

/** Nota media del equipo a partir del resultado por entrenador (ponderada por reportes puntuados). */
export function notaEquipoDe(lista: CalidadEntrenador[]): number | null {
  let suma = 0;
  let n = 0;
  lista.forEach((c) => {
    const peso = c.reciente.puntuados + c.reciente.faltan;
    if (c.reciente.nota === null || !peso) return;
    suma += c.reciente.nota * peso;
    n += peso;
  });
  return n ? redondear(suma / n) : null;
}

/** Lo que vería un entrenador en su tarjeta, calculado desde el panel de coordinación. */
export function vistaEntrenadorDesde(c: CalidadEntrenador, equipo: number | null) {
  return { reciente: c.reciente, anterior: c.anterior, equipo, semaforo: c.semaforo, vaAMenos: c.vaAMenos, consejos: consejosDe(c.reciente), fortalezas: fortalezasDe(c.reciente) };
}
