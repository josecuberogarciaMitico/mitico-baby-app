// Calidad de los reportes (17/11/2026). Lógica pura, sin navegador.
//
// Un reporte es «poco detallado» si marca TODAS las habilidades valoradas como
// «Lo consigue» (Consolidado) y no tiene nada escrito: ni notas de habilidades
// ni observación. Es el reporte «rápido»: no dice nada y además puede hacer que
// la app proponga subir de nivel al niño sin pruebas.
//
// Por entrenador se mira lo reciente (últimos 14 días) frente a lo anterior,
// para ver si alguien va a menos.

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
  /** Letras escritas a mano (notas de habilidades + observación). */
  letras: number;
  conObservacion: boolean;
  todoConsigue: boolean;
  pocoDetallado: boolean;
};

const MIN = 10;

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
    letras,
    conObservacion: obs.length >= MIN,
    todoConsigue,
    pocoDetallado: faltaJustificacionTodoConsigue(evaluacion, notas, obs),
  };
}

export type Semaforo = 'verde' | 'amarillo' | 'rojo' | 'sin_datos';

export type PeriodoCalidad = {
  reportes: number;
  /** Reportes que faltan por hacer (días ya pasados). */
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
  pctConObservacion: number;
};

export type CalidadEntrenador = {
  entrenador: string;
  reciente: PeriodoCalidad;
  anterior: PeriodoCalidad;
  semaforo: Semaforo;
  /** true si escribe claramente menos que antes (la mitad o menos). */
  vaAMenos: boolean;
  /** En qué falla, en frases cortas, de lo más grave a lo menos. */
  fallos: string[];
  /** Reportes poco detallados recientes, del más nuevo al más viejo. */
  ejemplos: Array<ReporteParaCalidad & { calidad: CalidadReporte }>;
};

export const DIAS_RECIENTE = 14;
/** Con menos de estos reportes recientes no se pone color (poca muestra). */
export const MINIMO_REPORTES = 4;

type Hecho = ReporteParaCalidad & { calidad: CalidadReporte; tarde: boolean; igualGrupo: boolean };

function periodo(hechos: Hecho[], faltan: number): PeriodoCalidad {
  const lista = hechos.map((h) => h.calidad);
  const n = lista.length;
  const poco = lista.filter((c) => c.pocoDetallado).length;
  const pct = (k: number) => (n ? Math.round((100 * k) / n) : 0);
  return {
    reportes: n,
    faltan,
    pctTarde: pct(hechos.filter((h) => h.tarde).length),
    pctIgualGrupo: pct(hechos.filter((h) => h.igualGrupo).length),
    pocoDetallados: poco,
    pctPocoDetallados: n ? Math.round((100 * poco) / n) : 0,
    letrasMedia: n ? Math.round(lista.reduce((s, c) => s + c.letras, 0) / n) : 0,
    pctConObservacion: n ? Math.round((100 * lista.filter((c) => c.conObservacion).length) / n) : 0,
  };
}

export const UMBRAL = { tarde: 40, igualGrupo: 20, faltan: 3 };

export function semaforoDe(p: PeriodoCalidad): Semaforo {
  if (p.reportes < MINIMO_REPORTES) return p.faltan >= UMBRAL.faltan ? 'rojo' : 'sin_datos';
  if (p.pctPocoDetallados >= 30 || p.letrasMedia < 30) return 'rojo';
  if (
    p.pctPocoDetallados >= 15 ||
    p.letrasMedia < 80 ||
    p.pctTarde >= UMBRAL.tarde ||
    p.pctIgualGrupo >= UMBRAL.igualGrupo ||
    p.faltan >= UMBRAL.faltan
  )
    return 'amarillo';
  return 'verde';
}

/** Frases de «en qué falla», para saber de qué hablar con el entrenador. */
export function fallosDe(reciente: PeriodoCalidad, anterior: PeriodoCalidad, vaAMenos: boolean): string[] {
  const f: string[] = [];
  const faltan = () => {
    if (reciente.faltan >= UMBRAL.faltan) f.push(`Le faltan ${reciente.faltan} reportes por hacer.`);
  };
  if (reciente.reportes === 0) {
    faltan();
    return f;
  }
  if (reciente.pctPocoDetallados >= 15)
    f.push(`Marca todo «Lo consigue» sin escribir nada en ${reciente.pocoDetallados} de ${reciente.reportes} reportes (${reciente.pctPocoDetallados}%).`);
  if (vaAMenos)
    f.push(`Va a menos: ahora escribe ${reciente.letrasMedia} letras por reporte; antes ${anterior.letrasMedia}.`);
  else if (reciente.letrasMedia < 80)
    f.push(`Escribe poco: ${reciente.letrasMedia} letras de media por reporte.`);
  if (reciente.pctIgualGrupo >= UMBRAL.igualGrupo)
    f.push(`Pone la misma valoración a todo el grupo en el ${reciente.pctIgualGrupo}% de sus reportes.`);
  if (reciente.pctTarde >= UMBRAL.tarde)
    f.push(`Rellena tarde: el ${reciente.pctTarde}% dos días o más después de la sesión (sale de memoria).`);
  faltan();
  return f;
}

/** Día (Madrid) en que se envió. */
function diaEnvio(iso: string | null | undefined): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

function restarDias(iso: string, dias: number): string {
  const d = new Date(`${iso}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() - dias);
  return d.toISOString().slice(0, 10);
}

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
    const lista = evaluaciones.get(claveGrupo(f)) || [];
    return lista.length >= 2 && new Set(lista).size === 1;
  };

  const porEntrenador = new Map<string, Hecho[]>();
  const faltanRecientes = new Map<string, number>();
  filas.forEach((f) => {
    if (!f.entrenador) return;
    if (!f.reporte_id) {
      if (f.estado === 'Falta reporte' && f.fecha >= corte && f.fecha < hoyIso)
        faltanRecientes.set(f.entrenador, (faltanRecientes.get(f.entrenador) || 0) + 1);
      if (!porEntrenador.has(f.entrenador)) porEntrenador.set(f.entrenador, []);
      return;
    }
    const lista = porEntrenador.get(f.entrenador) || [];
    const dia = diaEnvio(f.enviado_at);
    lista.push({ ...f, calidad: calidadReporte(f), tarde: Boolean(dia) && dia >= restarDias(f.fecha, -2), igualGrupo: igualQueGrupo(f) });
    porEntrenador.set(f.entrenador, lista);
  });

  const peso: Record<Semaforo, number> = { rojo: 0, amarillo: 1, verde: 2, sin_datos: 3 };
  return [...porEntrenador.entries()]
    .map(([entrenador, lista]) => {
      const recientes = lista.filter((r) => r.fecha >= corte);
      const anteriores = lista.filter((r) => r.fecha < corte);
      const reciente = periodo(recientes, faltanRecientes.get(entrenador) || 0);
      const anterior = periodo(anteriores, 0);
      const vaAMenos =
        reciente.reportes >= MINIMO_REPORTES &&
        anterior.reportes >= MINIMO_REPORTES &&
        anterior.letrasMedia >= 40 &&
        reciente.letrasMedia <= anterior.letrasMedia / 2;
      return {
        entrenador,
        reciente,
        anterior,
        semaforo: semaforoDe(reciente),
        vaAMenos,
        fallos: fallosDe(reciente, anterior, vaAMenos),
        ejemplos: recientes
          .filter((r) => r.calidad.pocoDetallado)
          .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha))),
      };
    })
    .filter((c) => c.reciente.reportes + c.anterior.reportes + c.reciente.faltan > 0)
    .sort(
      (a, b) =>
        peso[a.semaforo] - peso[b.semaforo] ||
        Number(b.vaAMenos) - Number(a.vaAMenos) ||
        b.reciente.pctPocoDetallados - a.reciente.pctPocoDetallados ||
        a.reciente.letrasMedia - b.reciente.letrasMedia ||
        a.entrenador.localeCompare(b.entrenador, 'es')
    );
}
