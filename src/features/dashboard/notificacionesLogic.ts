// Notificaciones a entrenadores (17/11/2026): para que Jose vea lo que le ha
// llegado a cada uno y no pierda el control. Lógica pura.

export type FilaNotificacion = {
  creada: string;
  entrenador_id: string | null;
  entrenador: string | null;
  tipo: string;
  titulo: string | null;
  cuerpo: string | null;
  estado: string;
};

/** Nombre corto del tipo de aviso, para la lista. */
export const NOMBRE_TIPO: Record<string, string> = {
  RECORDATORIO_DIARIO: 'Recordatorio del día',
  DISPONIBILIDAD_ABIERTA: 'Disponibilidad publicada',
  DISPONIBILIDAD_RECIBIDA: 'Disponibilidad recibida',
  DISPONIBILIDAD_RECORDATORIO: 'Recordatorio de disponibilidad',
  REPORTES_PENDIENTES: 'Reportes pendientes',
  CONFIRMAR_GRUPO_RECORDATORIO: 'Confirmar grupo',
  GRUPOS_DISPONIBLES: 'Grupos publicados',
  ORGANIZACION_SEMANAL_CERRADA_CON_GRUPOS: 'Semana cerrada (con grupos)',
  ORGANIZACION_SEMANAL_CERRADA_SIN_GRUPOS: 'Semana cerrada (sin grupos)',
  GRUPO_REASIGNADO_NUEVO: 'Grupo nuevo',
  GRUPO_REASIGNADO_RETIRADO: 'Grupo retirado',
  GRUPO_CAMBIADO_RECONFIRMAR: 'Grupo cambiado',
};

/** ¿Le llegó de verdad? (enviada al móvil). */
export const llego = (f: FilaNotificacion) => f.estado === 'enviada';

/** Día de Madrid de una fecha ISO. */
export function diaMadrid(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

export type ResumenEntrenador = {
  entrenadorId: string;
  entrenador: string;
  /** Avisos que le llegaron en el periodo. */
  total: number;
  /** El día con más avisos y cuántos. */
  maxDia: number;
  diaMax: string;
  /** Sin móvil activado: avisos que no le pudieron llegar. */
  sinMovil: number;
  filas: FilaNotificacion[];
};

/** Resumen por entrenador, del que más recibe al que menos. */
export function resumenPorEntrenador(filas: FilaNotificacion[]): ResumenEntrenador[] {
  const mapa = new Map<string, ResumenEntrenador>();
  filas.forEach((f) => {
    if (!f.entrenador_id) return;
    const r = mapa.get(f.entrenador_id) || {
      entrenadorId: f.entrenador_id,
      entrenador: f.entrenador || 'Entrenador',
      total: 0,
      maxDia: 0,
      diaMax: '',
      sinMovil: 0,
      filas: [],
    };
    r.filas.push(f);
    if (llego(f)) r.total += 1;
    if (f.estado === 'sin_suscripcion') r.sinMovil += 1;
    mapa.set(f.entrenador_id, r);
  });
  mapa.forEach((r) => {
    const porDia = new Map<string, number>();
    r.filas.filter(llego).forEach((f) => {
      const d = diaMadrid(f.creada);
      porDia.set(d, (porDia.get(d) || 0) + 1);
    });
    porDia.forEach((n, d) => {
      if (n > r.maxDia || (n === r.maxDia && d > r.diaMax)) {
        r.maxDia = n;
        r.diaMax = d;
      }
    });
    r.filas.sort((a, b) => b.creada.localeCompare(a.creada));
  });
  return [...mapa.values()].sort((a, b) => b.total - a.total || a.entrenador.localeCompare(b.entrenador, 'es'));
}

/** Media de avisos por entrenador (solo los que han recibido alguno). */
export function mediaPorEntrenador(lista: ResumenEntrenador[]): number {
  const con = lista.filter((r) => r.total > 0);
  return con.length ? Math.round((10 * con.reduce((s, r) => s + r.total, 0)) / con.length) / 10 : 0;
}
