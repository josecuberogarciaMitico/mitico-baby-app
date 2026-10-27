// Tablero del día en Entrenamientos (lógica pura, sin React): en qué paso está
// cada sesión, cómo va cada día y qué sesión va en cada turno.

export type SesionTablero = {
  id: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
  totalAlumnos: number;
  totalGrupos: number;
  publicados: number;
};

export type CoberturaTablero = { totalGroups: number; pendingGroups: number };

export type EstadoPaso = 'hecho' | 'actual' | 'pendiente';
export type PasoSesion = { clave: 'listado' | 'grupos' | 'entrenadores' | 'publicado'; etiqueta: string; estado: EstadoPaso };

/** Pasos Listado → Grupos → Entrenadores → Publicado y el botón principal. */
export function pasosSesion(s: SesionTablero, cobertura: CoberturaTablero | null) {
  const grupos = Number(s.totalGrupos || 0);
  const hechos = {
    listado: Number(s.totalAlumnos || 0) > 0,
    grupos: grupos > 0,
    entrenadores: grupos > 0 && Boolean(cobertura) && Number(cobertura!.pendingGroups) === 0,
    publicado: grupos > 0 && Number(s.publicados || 0) >= grupos,
  };
  const orden: Array<[PasoSesion['clave'], string]> = [
    ['listado', 'Listado'],
    ['grupos', 'Grupos'],
    ['entrenadores', 'Entrenadores'],
    ['publicado', 'Publicado'],
  ];
  let actualMarcado = false;
  const pasos: PasoSesion[] = orden.map(([clave, etiqueta]) => {
    if (hechos[clave]) return { clave, etiqueta, estado: 'hecho' };
    if (!actualMarcado) {
      actualMarcado = true;
      return { clave, etiqueta, estado: 'actual' };
    }
    return { clave, etiqueta, estado: 'pendiente' };
  });
  return {
    pasos,
    completa: pasos.every((p) => p.estado === 'hecho'),
    botonPrincipal: grupos > 0 ? 'Abrir sesión' : 'Hacer grupos',
  };
}

export type EstadoDia = 'vacio' | 'pendiente' | 'listo';

/** Cómo va un día: sin sesiones, a medias o todo hecho (grupos, entrenadores y publicado). */
export function estadoDia(
  sesiones: SesionTablero[],
  cobertura: (s: SesionTablero) => CoberturaTablero | null
): EstadoDia {
  const conNinos = sesiones.filter((s) => Number(s.totalAlumnos || 0) > 0 || Number(s.totalGrupos || 0) > 0);
  if (!conNinos.length) return 'vacio';
  return conNinos.every((s) => pasosSesion(s, cobertura(s)).completa) ? 'listo' : 'pendiente';
}

export type TurnoTablero = { etiqueta: string; inicio: string; fin: string };

export type ColumnaTablero<S extends SesionTablero> = {
  clave: string;
  etiqueta: string;
  turno: TurnoTablero | null;
  sesiones: S[];
  tieneBaby: boolean;
};

const hhmm = (x: string) => String(x || '').slice(0, 5);
const esBaby = (s: SesionTablero) => String(s.modalidad || '').trim().toUpperCase().includes('BABY');

/**
 * Reparte las sesiones del día en sus turnos. Una sesión va al turno en el que
 * empieza; las que no encajan en ningún turno van a «Otros horarios» para que
 * nunca desaparezca ninguna.
 */
export function columnasDelDia<S extends SesionTablero>(turnos: TurnoTablero[], sesiones: S[]): ColumnaTablero<S>[] {
  const usadas = new Set<string>();
  const columnas: ColumnaTablero<S>[] = turnos.map((turno) => {
    const delTurno = sesiones.filter((s) => {
      const ini = hhmm(s.hora_inicio);
      return ini === turno.inicio || (ini >= turno.inicio && ini < turno.fin);
    });
    delTurno.forEach((s) => usadas.add(s.id));
    return {
      clave: turno.inicio,
      etiqueta: turno.etiqueta,
      turno,
      sesiones: delTurno,
      tieneBaby: delTurno.some(esBaby),
    };
  });
  const otras = sesiones.filter((s) => !usadas.has(s.id));
  if (otras.length) {
    columnas.push({ clave: 'otros', etiqueta: 'Otros horarios', turno: null, sesiones: otras, tieneBaby: otras.some(esBaby) });
  }
  return columnas;
}

/** Texto corto de un día: «15 niños · 3 grupos». */
export function resumenDia(sesiones: SesionTablero[]) {
  const ninos = sesiones.reduce((t, s) => t + Number(s.totalAlumnos || 0), 0);
  const grupos = sesiones.reduce((t, s) => t + Number(s.totalGrupos || 0), 0);
  return {
    ninos,
    grupos,
    texto: `${ninos} ${ninos === 1 ? 'niño' : 'niños'} · ${grupos} ${grupos === 1 ? 'grupo' : 'grupos'}`,
  };
}

// ---------------------------------------------------------------------------
// Ayudas de la semana (27/10): qué falta, siguiente pendiente, disponibles por
// turno y avisos de cada sesión.

export type ExtrasSesion = { revisar: number; notas: number; sinConfirmar: number };

export type MotivoPendiente = 'sin_grupos' | 'sin_entrenador' | 'sin_publicar' | 'revisar' | 'sin_confirmar';

export type PendienteSesion<S extends SesionTablero> = {
  sesion: S;
  fecha: string;
  motivos: MotivoPendiente[];
};

export type ResumenPendientes<S extends SesionTablero> = {
  contadores: Record<MotivoPendiente, number>;
  pendientes: PendienteSesion<S>[];
  total: number;
};

export const ETIQUETA_MOTIVO: Record<MotivoPendiente, [string, string]> = {
  sin_grupos: ['sesión sin grupos', 'sesiones sin grupos'],
  sin_entrenador: ['grupo sin entrenador', 'grupos sin entrenador'],
  sin_publicar: ['grupo sin publicar', 'grupos sin publicar'],
  revisar: ['niño por revisar', 'niños por revisar'],
  sin_confirmar: ['grupo sin confirmar', 'grupos sin confirmar'],
};

/**
 * Lo que falta en la semana, desde hoy (los días pasados no cuentan). Cada
 * sesión pendiente lleva sus motivos; los contadores suman sesiones, grupos o
 * niños según el caso. La lista sale ordenada por fecha y hora.
 */
export function pendientesSemana<S extends SesionTablero>(
  dias: Array<{ fecha: string; sesiones: S[] }>,
  hoyIso: string,
  cobertura: (s: S) => CoberturaTablero | null,
  extras: (s: S) => ExtrasSesion | null
): ResumenPendientes<S> {
  const contadores: Record<MotivoPendiente, number> = {
    sin_grupos: 0, sin_entrenador: 0, sin_publicar: 0, revisar: 0, sin_confirmar: 0,
  };
  const pendientes: PendienteSesion<S>[] = [];
  [...dias]
    .filter((d) => d.fecha >= hoyIso)
    .sort((a, b) => a.fecha.localeCompare(b.fecha))
    .forEach((dia) => {
      [...dia.sesiones]
        .sort((a, b) => hhmm(a.hora_inicio).localeCompare(hhmm(b.hora_inicio)))
        .forEach((s) => {
          const alumnos = Number(s.totalAlumnos || 0);
          const grupos = Number(s.totalGrupos || 0);
          if (!alumnos && !grupos) return;
          const cob = cobertura(s);
          const ex = extras(s);
          const motivos: MotivoPendiente[] = [];
          if (alumnos > 0 && grupos === 0) {
            motivos.push('sin_grupos');
            contadores.sin_grupos += 1;
          }
          const sinEntrenador = grupos > 0 && cob ? Math.max(0, Number(cob.pendingGroups) || 0) : 0;
          if (sinEntrenador > 0) {
            motivos.push('sin_entrenador');
            contadores.sin_entrenador += sinEntrenador;
          }
          const sinPublicar = grupos > 0 ? Math.max(0, grupos - Number(s.publicados || 0)) : 0;
          if (sinPublicar > 0) {
            motivos.push('sin_publicar');
            contadores.sin_publicar += sinPublicar;
          }
          if (ex && ex.revisar > 0) {
            motivos.push('revisar');
            contadores.revisar += ex.revisar;
          }
          if (ex && ex.sinConfirmar > 0) {
            motivos.push('sin_confirmar');
            contadores.sin_confirmar += ex.sinConfirmar;
          }
          if (motivos.length) pendientes.push({ sesion: s, fecha: dia.fecha, motivos });
        });
    });
  return { contadores, pendientes, total: pendientes.length };
}

/** La siguiente sesión pendiente después de la abierta (vuelve al principio al acabar). */
export function siguientePendiente<S extends SesionTablero>(
  pendientes: PendienteSesion<S>[],
  sesionAbiertaId: string,
  motivo?: MotivoPendiente
): PendienteSesion<S> | null {
  const lista = motivo ? pendientes.filter((p) => p.motivos.includes(motivo)) : pendientes;
  if (!lista.length) return null;
  const i = lista.findIndex((p) => p.sesion.id === sesionAbiertaId);
  if (i < 0) return lista[0];
  return lista.length > 1 ? lista[(i + 1) % lista.length] : null;
}

export type FilaDisponibilidad = {
  entrenador_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  respuesta: string;
};

/**
 * Entrenadores que han dicho «Disponible» en un turno (fecha y hora de inicio
 * iguales; si no hay turno igual, el que lo contiene). Solo entrenadores activos.
 * null = no hay disponibilidad publicada para ese turno.
 */
export function disponiblesEnTurno(
  filas: FilaDisponibilidad[],
  fecha: string,
  inicio: string,
  fin: string,
  activos: Set<string> | null
): number | null {
  const delDia = (filas || []).filter((f) => String(f.fecha).slice(0, 10) === fecha);
  if (!delDia.length) return null;
  let delTurno = delDia.filter((f) => hhmm(f.hora_inicio) === inicio);
  if (!delTurno.length) delTurno = delDia.filter((f) => hhmm(f.hora_inicio) <= inicio && hhmm(f.hora_fin) >= fin);
  if (!delTurno.length) return null;
  const ids = new Set(
    delTurno
      .filter((f) => String(f.respuesta || '').trim().toLowerCase() === 'disponible')
      .map((f) => String(f.entrenador_id))
      .filter((id) => !activos || activos.has(id))
  );
  return ids.size;
}
