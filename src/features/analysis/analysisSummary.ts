// Lógica pura de la pantalla de Análisis (sin React ni red): qué meses se
// enseñan, «Cómo vamos» con comparación justa, crecimiento de la temporada y
// resumen de niveles. Así la pantalla solo pinta y esto se puede probar.

export type MesAnalisis = {
  mes: string; // YYYY-MM
  en_curso?: boolean;
  alumnos_unicos: number;
  altas: number;
  asistencia_real_pct: number | null;
  ocupacion_pct: number | null;
  promedio_por_grupo: number | null;
  promedio_ninos_turno?: number | null;
  sesiones_realizadas: number;
  evolucion_tecnica: number | null;
  continuidad_pct?: number | null;
};

export type TramoDatos = {
  desde: string;
  hasta: string;
  alumnos: number;
  altas: number;
  sesiones: number;
  asistencia_real_pct: number | null;
  ocupacion_pct: number | null;
  promedio_por_grupo: number | null;
  promedio_ninos_turno?: number | null;
};

export type TramoAnalisis = {
  dias: number;
  actual: TramoDatos | null;
  anterior: TramoDatos | null;
} | null;

export type Sentido = 'sube' | 'baja' | 'igual' | null;

export type Cambio = { texto: string; sentido: Sentido };

const MESES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
const MESES_LARGOS = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

export function nombreMes(mes: string, largo = false): string {
  const n = Number(String(mes || '').slice(5, 7));
  if (!n || n < 1 || n > 12) return mes || '—';
  return (largo ? MESES_LARGOS : MESES)[n - 1];
}

function esNumero(x: unknown): x is number {
  return typeof x === 'number' && Number.isFinite(x);
}

export function formatoNumero(valor: number | null | undefined, decimales = 1): string {
  if (!esNumero(valor)) return '—';
  const r = Math.round(valor * 10 ** decimales) / 10 ** decimales;
  return r.toLocaleString('es-ES', { maximumFractionDigits: decimales });
}

export function formatoPct(valor: number | null | undefined): string {
  return esNumero(valor) ? `${formatoNumero(valor, 0)} %` : '—';
}

/** Meses con actividad real, sin los futuros vacíos. */
export function mesesConActividad(mensual: MesAnalisis[], hoyIso: string): MesAnalisis[] {
  const mesHoy = hoyIso.slice(0, 7);
  return (mensual || []).filter(
    (m) => m.mes <= mesHoy && (m.alumnos_unicos > 0 || m.altas > 0 || m.sesiones_realizadas > 0)
  );
}

/**
 * Diferencia entre dos valores.
 * - 'cantidad': «+42 (+131 %)»
 * - 'puntos': diferencia de porcentajes en puntos, «+3 pts»
 * - 'decimal': «+0,6»
 */
export function cambio(
  actual: number | null | undefined,
  anterior: number | null | undefined,
  tipo: 'cantidad' | 'puntos' | 'decimal'
): Cambio {
  if (!esNumero(actual) || !esNumero(anterior)) return { texto: '', sentido: null };
  const d = actual - anterior;
  const umbral = tipo === 'decimal' ? 0.05 : tipo === 'puntos' ? 0.5 : 0.5;
  const sentido: Sentido = Math.abs(d) < umbral ? 'igual' : d > 0 ? 'sube' : 'baja';
  const signo = d > 0 ? '+' : d < 0 ? '−' : '';
  if (sentido === 'igual') return { texto: 'igual', sentido };
  if (tipo === 'cantidad') {
    const pct = anterior > 0 ? ` (${signo}${formatoNumero(Math.abs((d / anterior) * 100), 0)} %)` : '';
    return { texto: `${signo}${formatoNumero(Math.abs(d), 0)}${pct}`, sentido };
  }
  if (tipo === 'puntos') return { texto: `${signo}${formatoNumero(Math.abs(d), 0)} pts`, sentido };
  return { texto: `${signo}${formatoNumero(Math.abs(d), 1)}`, sentido };
}

function fechaCorta(iso: string): string {
  const [, m, d] = String(iso || '').split('-').map(Number);
  if (!m || !d) return iso;
  return `${d} ${MESES[m - 1]}`;
}

export type Indicador = {
  clave: 'alumnos' | 'asistencia' | 'ocupacion' | 'por_grupo';
  titulo: string;
  valor: string;
  ayuda: string;
  cambio: Cambio;
};

export type ComoVamos = {
  titulo: string;
  subtitulo: string;
  indicadores: Indicador[];
};

/**
 * «Cómo vamos»: el mes de hoy contra los MISMOS días del mes anterior (tramo
 * que calcula Supabase). Si Supabase aún no lo manda, se usa el último mes con
 * actividad contra el anterior, avisando de que el mes en curso no está
 * completo.
 */
export function comoVamos(mensual: MesAnalisis[], tramo: TramoAnalisis | undefined, hoyIso: string): ComoVamos | null {
  const indicadores = (a: TramoDatos | MesAnalisis, b: TramoDatos | MesAnalisis | null): Indicador[] => {
    const alumnosA = 'alumnos' in a ? a.alumnos : a.alumnos_unicos;
    const alumnosB = b ? ('alumnos' in b ? b.alumnos : b.alumnos_unicos) : null;
    return [
      {
        clave: 'alumnos', titulo: 'Niños con clase', valor: formatoNumero(alumnosA, 0),
        ayuda: 'Niños distintos que han tenido clase', cambio: cambio(alumnosA, alumnosB, 'cantidad'),
      },
      {
        clave: 'asistencia', titulo: 'Asistencia', valor: formatoPct(a.asistencia_real_pct),
        ayuda: 'Vienen de los que se pasó lista', cambio: cambio(a.asistencia_real_pct, b?.asistencia_real_pct, 'puntos'),
      },
      {
        clave: 'ocupacion', titulo: 'Ocupación', valor: formatoPct(a.ocupacion_pct),
        ayuda: 'Plazas ocupadas de los grupos', cambio: cambio(a.ocupacion_pct, b?.ocupacion_pct, 'puntos'),
      },
      {
        clave: 'por_grupo', titulo: 'Niños por grupo', valor: formatoNumero(a.promedio_por_grupo, 1),
        ayuda: 'Media de niños en cada grupo', cambio: cambio(a.promedio_por_grupo, b?.promedio_por_grupo, 'decimal'),
      },
    ];
  };

  if (tramo && tramo.actual) {
    const mes = nombreMes(tramo.actual.desde, true);
    const ant = tramo.anterior;
    return {
      titulo: `${mes.charAt(0).toUpperCase()}${mes.slice(1)} (en curso)`,
      subtitulo: ant
        ? `Del ${fechaCorta(tramo.actual.desde)} al ${fechaCorta(tramo.actual.hasta)} frente al ${fechaCorta(ant.desde)}–${fechaCorta(ant.hasta)}: mismos días, comparación justa.`
        : `Del ${fechaCorta(tramo.actual.desde)} al ${fechaCorta(tramo.actual.hasta)}. Es el primer mes de la temporada: aún no hay con qué comparar.`,
      indicadores: indicadores(tramo.actual, ant),
    };
  }

  const activos = mesesConActividad(mensual, hoyIso);
  if (!activos.length) return null;
  const ultimo = activos[activos.length - 1];
  const anterior = activos.length > 1 ? activos[activos.length - 2] : null;
  const enCurso = ultimo.en_curso ?? ultimo.mes === hoyIso.slice(0, 7);
  const mes = nombreMes(ultimo.mes, true);
  return {
    titulo: `${mes.charAt(0).toUpperCase()}${mes.slice(1)}${enCurso ? ' (en curso)' : ''}`,
    subtitulo: anterior
      ? `Frente a ${nombreMes(anterior.mes, true)}${enCurso ? '. Ojo: este mes aún no ha terminado.' : '.'}`
      : 'Es el primer mes con actividad: aún no hay con qué comparar.',
    indicadores: indicadores(ultimo, anterior),
  };
}

export type CrecimientoTemporada = {
  desdeMes: string;
  hastaMes: string;
  desde: number;
  hasta: number;
  cambio: Cambio;
  altasTemporada: number;
  barras: Array<{ mes: string; etiqueta: string; valor: number; enCurso: boolean; alto: number }>;
};

/** Crecimiento desde el primer mes con clases hasta el último (para objetivos). */
export function crecimientoTemporada(mensual: MesAnalisis[], hoyIso: string, altasTemporada: number): CrecimientoTemporada | null {
  const activos = mesesConActividad(mensual, hoyIso).filter((m) => m.alumnos_unicos > 0);
  if (!activos.length) return null;
  const primero = activos[0];
  const ultimo = activos[activos.length - 1];
  const maximo = Math.max(1, ...activos.map((m) => m.alumnos_unicos));
  return {
    desdeMes: primero.mes,
    hastaMes: ultimo.mes,
    desde: primero.alumnos_unicos,
    hasta: ultimo.alumnos_unicos,
    cambio: activos.length > 1 ? cambio(ultimo.alumnos_unicos, primero.alumnos_unicos, 'cantidad') : { texto: '', sentido: null },
    altasTemporada,
    barras: activos.map((m) => ({
      mes: m.mes,
      etiqueta: nombreMes(m.mes),
      valor: m.alumnos_unicos,
      enCurso: Boolean(m.en_curso ?? m.mes === hoyIso.slice(0, 7)),
      alto: Math.max(6, Math.round((m.alumnos_unicos / maximo) * 100)),
    })),
  };
}

export type Progresion = { desde: string; hasta: string; total: number; sentido: 'SUBE' | 'BAJA' | 'IGUAL' };

export function resumenProgresiones(progresiones: Progresion[]) {
  const lista = Array.isArray(progresiones) ? progresiones : [];
  const suben = lista.filter((p) => p.sentido === 'SUBE').sort((a, b) => b.total - a.total);
  const bajan = lista.filter((p) => p.sentido === 'BAJA').sort((a, b) => b.total - a.total);
  const suma = (xs: Progresion[]) => xs.reduce((s, p) => s + (Number(p.total) || 0), 0);
  return {
    suben,
    bajan,
    totalSuben: suma(suben),
    totalBajan: suma(bajan),
    seMantienen: suma(lista.filter((p) => p.sentido === 'IGUAL')),
  };
}

/** Nombres claros para «Cómo se calcula» (las claves vienen de Supabase). */
export const NOMBRES_DEFINICIONES: Record<string, string> = {
  alumnos_unicos: 'Niños de la temporada',
  altas: 'Altas',
  crecimiento_mensual: 'Crecimiento',
  continuidad: 'Siguen de un mes a otro',
  perdida_continuidad: 'No vuelven al mes siguiente',
  asistencia_real: 'Asistencia',
  promedio_ninos_turno: 'Niños por turno',
  promedio_por_grupo: 'Niños por grupo',
  sesiones_realizadas: 'Sesiones',
  ocupacion: 'Ocupación',
  evolucion_tecnica: 'Evolución técnica',
  progresion_niveles: 'Cambios de nivel',
  comparativa_temporadas: 'Comparación entre temporadas',
};
