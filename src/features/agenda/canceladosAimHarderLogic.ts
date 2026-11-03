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
