// ---------------------------------------------------------------------------
// automaticos.ts · lógica pura de «Paco persigue por Jose» (29/10/2026)
//
// Sin imports ni acceso a datos: decide CUÁNDO toca cada aviso y escribe los
// textos. index.ts lee los datos, llama aquí y manda los push.
//   1. Grupos publicados sin confirmar: recordatorio al entrenador a <24 h del
//      inicio; si a <12 h sigue sin confirmar, aviso a Jose.
//   2. Disponibilidad sin contestar: recordatorio a <24 h del límite.
//   3. Reportes: segundo aviso al entrenador a las 48 h (el primero, a las
//      24 h, lo manda ya mitico-report-reminders).
//   8. Viernes 10:00: material del finde (camisetas rosas y chaquetas).
// ---------------------------------------------------------------------------

export const HORA_MS = 3600000;

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

export function diaSemanaIso(iso: string) {
  return DIAS[new Date(`${String(iso).slice(0, 10)}T12:00:00Z`).getUTCDay()];
}

export function fechaCorta(iso: string) {
  const [, m, d] = String(iso).slice(0, 10).split('-');
  return `${d}/${m}`;
}

/** Fecha + hora de Madrid («2026-10-31», «12:00») → instante en ms (UTC). */
export function madridAMs(fecha: string, hora: string): number | null {
  const m = `${String(fecha).slice(0, 10)}T${String(hora || '').slice(0, 5)}`.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{1,2}):(\d{2})/
  );
  if (!m) return null;
  const [y, mo, d, h, mi] = m.slice(1).map(Number);
  const deseado = Date.UTC(y, mo - 1, d, h, mi);
  let t = deseado;
  for (let i = 0; i < 2; i++) {
    const p = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Madrid',
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit', hour12: false,
    }).formatToParts(new Date(t));
    const g = (x: string) => Number(p.find((q) => q.type === x)?.value || 0);
    t += deseado - Date.UTC(g('year'), g('month') - 1, g('day'), g('hour') % 24, g('minute'));
  }
  return t;
}

/** A los entrenadores no se les escribe de noche (22:00–09:00 de Madrid). */
export function horaDeAvisarEntrenador(horaMadrid: number) {
  return horaMadrid >= 9 && horaMadrid < 22;
}

/** A Jose, de 08:00 a 23:00. */
export function horaDeAvisarJose(horaMadrid: number) {
  return horaMadrid >= 8 && horaMadrid < 23;
}

// ---- 1. confirmaciones -------------------------------------------------------

export type Pendiente = {
  grupoId: string;
  entrenadorId: string;
  entrenador: string;
  grupo: string;
  fecha: string;
  hora: string;
  inicioMs: number;
  /** Desde cuándo lo tiene (publicación del grupo o asignación, lo más tarde). */
  desdeMs: number;
};

/** Recordatorio al entrenador: faltan ≤24 h y lo tiene desde hace ≥2 h. */
export function tocaRecordarConfirmar(p: Pendiente, ahoraMs: number) {
  const falta = p.inicioMs - ahoraMs;
  return falta > 0 && falta <= 24 * HORA_MS && ahoraMs - p.desdeMs >= 2 * HORA_MS;
}

/** Aviso a Jose: faltan ≤12 h y lo tiene desde hace ≥3 h. */
export function tocaAvisarJoseConfirmar(p: Pendiente, ahoraMs: number) {
  const falta = p.inicioMs - ahoraMs;
  return falta > 0 && falta <= 12 * HORA_MS && ahoraMs - p.desdeMs >= 3 * HORA_MS;
}

export function textoRecordarConfirmar(p: Pick<Pendiente, 'grupo' | 'fecha' | 'hora'>) {
  return {
    titulo: 'Confirma tu grupo',
    cuerpo: `Tienes «${p.grupo}» el ${diaSemanaIso(p.fecha)} ${fechaCorta(p.fecha)} a las ${String(p.hora).slice(0, 5)} y aún no lo has confirmado. Entra y pulsa Confirmar.`,
  };
}

export function textoJoseConfirmaciones(lista: Pick<Pendiente, 'entrenador' | 'grupo' | 'fecha' | 'hora'>[]) {
  const linea = (p: (typeof lista)[number]) =>
    `• ${p.entrenador} — «${p.grupo}» ${diaSemanaIso(p.fecha)} ${fechaCorta(p.fecha)} ${String(p.hora).slice(0, 5)}`;
  const nombres = [...new Set(lista.map((p) => p.entrenador.split(' ')[0]))];
  return {
    titulo: lista.length === 1 ? 'Grupo sin confirmar' : `${lista.length} grupos sin confirmar`,
    cuerpoCorto:
      lista.length === 1
        ? `${lista[0].entrenador.split(' ')[0]} no ha confirmado «${lista[0].grupo}» (${diaSemanaIso(lista[0].fecha)} ${String(lista[0].hora).slice(0, 5)}).`
        : `Sin confirmar: ${nombres.slice(0, 4).join(', ')}${nombres.length > 4 ? '…' : ''}.`,
    cuerpoLargo: `Señor Cubero, quedan menos de 12 horas y estos grupos siguen sin confirmar por el entrenador:\n${lista.map(linea).join('\n')}\n\nQuizá convenga llamarles.`,
  };
}

// ---- 2. disponibilidad -------------------------------------------------------

/** Faltan ≤24 h para el límite y aún no ha pasado. */
export function tocaRecordarDisponibilidad(limiteMs: number, ahoraMs: number) {
  const falta = limiteMs - ahoraMs;
  return falta > 0 && falta <= 24 * HORA_MS;
}

export function textoRecordarDisponibilidad(pendientes: number, total: number, limiteTexto: string) {
  return {
    titulo: 'Te falta la disponibilidad',
    cuerpo: `Te ${pendientes === 1 ? 'falta 1 turno' : `faltan ${pendientes} turnos`} de ${total} por contestar. Se cierra ${limiteTexto}.`,
  };
}

// ---- 3. reportes ----------------------------------------------------------------

/** Segundo aviso: la sesión acabó hace ≥48 h (y como mucho hace 7 días). */
export function tocaSegundoAvisoReportes(finMs: number, ahoraMs: number) {
  const pasado = ahoraMs - finMs;
  return pasado >= 48 * HORA_MS && pasado <= 7 * 24 * HORA_MS;
}

export function textoSegundoAvisoReportes(total: number, fecha: string) {
  return {
    titulo: 'Siguen pendientes tus reportes',
    cuerpo: `Segundo aviso: te ${total === 1 ? 'queda 1 reporte' : `quedan ${total} reportes`} del ${diaSemanaIso(fecha)} ${fechaCorta(fecha)}. Entra para completarlos.`,
  };
}

// ---- 8. material del finde -----------------------------------------------------

export type MaterialDia = { fecha: string; camisetas: string[]; chaquetas: string[] };

/** Viernes entre 10:00 y 10:09 de Madrid (una vuelta del cron de 5 min… o dos). */
export function tocaMaterial(dow: number, hora: number, minuto: number) {
  return dow === 5 && hora === 10 && minuto < 10;
}

export function textoMaterial(dias: MaterialDia[]) {
  const camisetas = new Set(dias.flatMap((d) => d.camisetas));
  const chaquetas = new Set(dias.flatMap((d) => d.chaquetas));
  if (!camisetas.size && !chaquetas.size) return null;
  const partes: string[] = [];
  if (camisetas.size) partes.push(`${camisetas.size} camiseta${camisetas.size === 1 ? '' : 's'} rosa${camisetas.size === 1 ? '' : 's'}`);
  if (chaquetas.size) partes.push(`${chaquetas.size} chaqueta${chaquetas.size === 1 ? '' : 's'}`);
  const lineas = dias
    .filter((d) => d.camisetas.length || d.chaquetas.length)
    .map((d) => {
      const l = [`${diaSemanaIso(d.fecha).replace(/^./, (c) => c.toUpperCase())} ${fechaCorta(d.fecha)}:`];
      if (d.camisetas.length) l.push(`  • Camisetas (${d.camisetas.length}): ${d.camisetas.join(', ')}`);
      if (d.chaquetas.length) l.push(`  • Chaquetas (${d.chaquetas.length}): ${d.chaquetas.join(', ')}`);
      return l.join('\n');
    });
  return {
    titulo: 'Material para el finde',
    cuerpoCorto: `Hay que llevar ${partes.join(' y ')}.`,
    cuerpoLargo: `Señor Cubero, para este fin de semana hay que llevar ${partes.join(' y ')} (solo cuenta niños ya metidos en grupos y entrenadores asignados):\n\n${lineas.join('\n\n')}`,
  };
}
