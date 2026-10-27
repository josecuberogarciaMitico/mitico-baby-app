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
