// Cancelados en AimHarder (03/11): lógica pura del aviso de la Agenda.

export type CanceladoAimHarder = {
  sesion_id: string;
  sesion_alumno_id: string;
  fecha: string;
  hora_inicio: string;
  modalidad: string;
  alumno_id: string;
  alumno: string;
  cancelada_at: string | null;
  visto_at: string | null;
  grupo_id: string | null;
  grupo: string | null;
  grupo_publicado: boolean;
  protegido: boolean;
};

export type TurnoCancelados = { clave: string; fecha: string; hora: string; modalidad: string; filas: CanceladoAimHarder[] };

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

export function etiquetaTurno(fecha: string, hora: string, modalidad: string) {
  const d = new Date(`${fecha.slice(0, 10)}T12:00:00Z`);
  return `${modalidad} · ${DIAS[d.getUTCDay()]} ${fecha.slice(8, 10)}/${fecha.slice(5, 7)} · ${hora.slice(0, 5)}`;
}

/** Por turno (día, hora, modalidad), en orden; niños por nombre. */
export function agruparCancelados(filas: CanceladoAimHarder[]): TurnoCancelados[] {
  const m = new Map<string, TurnoCancelados>();
  for (const f of filas) {
    const clave = `${f.fecha.slice(0, 10)}|${f.hora_inicio.slice(0, 5)}|${f.modalidad}`;
    const t = m.get(clave) || { clave, fecha: f.fecha.slice(0, 10), hora: f.hora_inicio.slice(0, 5), modalidad: f.modalidad, filas: [] };
    t.filas.push(f);
    m.set(clave, t);
  }
  return [...m.values()]
    .sort((a, b) => a.clave.localeCompare(b.clave))
    .map((t) => ({ ...t, filas: [...t.filas].sort((a, b) => a.alumno.localeCompare(b.alumno, 'es')) }));
}

/** Solo turnos que no han pasado: de hoy en adelante. */
export function canceladosPendientes(filas: CanceladoAimHarder[], hoyIso: string) {
  return filas.filter((f) => f.fecha.slice(0, 10) >= hoyIso.slice(0, 10));
}

/** «canceló el 29/10 a las 22:32». La hora de AimHarder ya es la de Madrid. */
export function textoCancelo(canceladaAt: string | null) {
  const m = String(canceladaAt || '').match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})/);
  return m ? `canceló el ${m[3]}/${m[2]} a las ${m[4]}:${m[5]}` : 'canceló';
}

export function textoResumenCancelados(n: number) {
  return n === 1
    ? '1 niño ha cancelado en AimHarder y sigue apuntado'
    : `${n} niños han cancelado en AimHarder y siguen apuntados`;
}

// ---- Repaso (05/11): ¿cuándo se comprobó por última vez cada turno? ----------

export type RepasoTurno = {
  sesion_id: string;
  fecha: string;
  hora_inicio: string;
  modalidad: string;
  ninos: number;
  sin_vincular: number;
  repaso_mas_antiguo: string | null;
  invitados_at: string | null;
};

export function horasDesde(iso: string | null | undefined, ahoraMs: number) {
  const t = Date.parse(String(iso || ''));
  return Number.isFinite(t) ? Math.max(0, (ahoraMs - t) / 3600000) : null;
}

export function textoHace(horas: number | null) {
  if (horas === null) return 'sin comprobar';
  if (horas < 1) return 'hace menos de 1 h';
  if (horas < 48) return `hace ${Math.round(horas)} h`;
  return `hace ${Math.round(horas / 24)} días`;
}

/** Comprobación de un turno: la más antigua entre reservas e invitados. */
export function horasRepaso(t: RepasoTurno, ahoraMs: number) {
  const a = horasDesde(t.repaso_mas_antiguo, ahoraMs);
  const b = horasDesde(t.invitados_at, ahoraMs);
  if (a === null || b === null) return null;
  return Math.max(a, b);
}

/**
 * Turnos de hoy y mañana que NO están bien comprobados: algún niño sin
 * enlazar con AimHarder o el repaso tiene más de 6 h.
 */
export function turnosSinRepasoFiable(turnos: RepasoTurno[], hoyIso: string, ahoraMs: number, limiteHoras = 6) {
  const manana = new Date(`${hoyIso.slice(0, 10)}T12:00:00Z`);
  manana.setUTCDate(manana.getUTCDate() + 1);
  const hasta = manana.toISOString().slice(0, 10);
  return turnos.filter((t) => {
    const f = t.fecha.slice(0, 10);
    if (f < hoyIso.slice(0, 10) || f > hasta || !t.ninos) return false;
    const h = horasRepaso(t, ahoraMs);
    return t.sin_vincular > 0 || h === null || h > limiteHoras;
  });
}
