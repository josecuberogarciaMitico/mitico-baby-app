// Niños en varios turnos la misma semana (11/11): lógica pura del aviso.
import { etiquetaTurno } from './canceladosAimHarderLogic';

export type TurnoRepetido = {
  semana_inicio: string;
  alumno_id: string;
  alumno: string;
  sesion_id: string;
  sesion_alumno_id: string;
  fecha: string;
  hora_inicio: string;
  modalidad: string;
  invitado: boolean;
  grupo: string | null;
  grupo_publicado: boolean;
  protegido: boolean;
};

export type NinoRepetido = {
  clave: string;
  alumno_id: string;
  alumno: string;
  semana_inicio: string;
  turnos: (TurnoRepetido & { sobraProbable: boolean })[];
  /** Hay turnos como invitado y otros con reserva normal: casi seguro un cambio de día. */
  pareceCambio: boolean;
};

export function agruparRepetidos(filas: TurnoRepetido[]): NinoRepetido[] {
  const m = new Map<string, TurnoRepetido[]>();
  for (const f of filas) {
    const clave = `${f.semana_inicio.slice(0, 10)}|${f.alumno_id}`;
    m.set(clave, [...(m.get(clave) || []), f]);
  }
  return [...m.entries()]
    .map(([clave, turnos]) => {
      const ordenados = [...turnos].sort((a, b) => `${a.fecha}${a.hora_inicio}`.localeCompare(`${b.fecha}${b.hora_inicio}`));
      const conInvitado = ordenados.some((t) => t.invitado);
      const sinInvitado = ordenados.some((t) => !t.invitado);
      const pareceCambio = conInvitado && sinInvitado;
      return {
        clave,
        alumno_id: ordenados[0].alumno_id,
        alumno: ordenados[0].alumno,
        semana_inicio: ordenados[0].semana_inicio.slice(0, 10),
        pareceCambio,
        turnos: ordenados.map((t) => ({ ...t, sobraProbable: pareceCambio && !t.invitado })),
      };
    })
    .sort((a, b) => a.semana_inicio.localeCompare(b.semana_inicio) || a.alumno.localeCompare(b.alumno, 'es'));
}

export function textoResumenRepetidos(n: number) {
  return n === 1
    ? '1 niño está apuntado en varios turnos la misma semana'
    : `${n} niños están apuntados en varios turnos la misma semana`;
}

/** Explicación para coordinación de cada niño repetido. */
export function consejoRepetido(r: NinoRepetido) {
  if (r.pareceCambio) {
    const sobran = r.turnos.filter((t) => t.sobraProbable).map((t) => etiquetaTurno(t.fecha, t.hora_inicio, t.modalidad));
    return `Parece un cambio de día: viene como invitado el día nuevo, pero sigue con su reserva en ${sobran.join(' y ')}. Quita esa reserva en AimHarder y aquí.`;
  }
  return '¿Viene varios días esta semana o es un error? Si es un error, quítalo del turno que sobra (aquí y en AimHarder).';
}
