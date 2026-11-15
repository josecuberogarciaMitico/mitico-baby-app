// Mensajes de coordinación a los entrenadores (16/11). Lógica pura.

export type EntrenadorReparto = { entrenador_id: string; entrenador: string; ok_at: string | null; leido_at: string | null };
export type AlumnoReparto = { alumno_id: string; alumno: string; entrenador_id: string | null; fijo: boolean };
export type Reparto = { entrenadores: EntrenadorReparto[]; alumnos: AlumnoReparto[] };

export type MensajeEntrenador = {
  mensaje_id: string;
  tipo: 'texto' | 'reparto';
  titulo: string;
  cuerpo: string | null;
  created_at: string;
  grupo_id: string | null;
  leido_at: string | null;
  mi_ok_at: string | null;
  cerrado_at: string | null;
  reparto: Reparto | null;
  yo: string;
};

export type DestinoEnviado = { entrenador_id: string; entrenador: string; leido_at: string | null; ok_at: string | null };
export type MensajeEnviado = {
  mensaje_id: string;
  tipo: 'texto' | 'reparto';
  titulo: string;
  cuerpo: string | null;
  created_at: string;
  grupo_id: string | null;
  cerrado_at: string | null;
  destinos: DestinoEnviado[];
};

export const nombreCorto = (n: string | null | undefined) => String(n || '').trim().split(/\s+/)[0] || '—';

/** Lo que ve un entrenador en el reparto: niños fijos (de quien ya dio OK) y libres. */
export function vistaReparto(r: Reparto, yo: string) {
  const nombre = new Map(r.entrenadores.map((e) => [e.entrenador_id, e.entrenador]));
  const fijos = r.alumnos.filter((a) => a.fijo && a.entrenador_id !== yo);
  const libres = r.alumnos.filter((a) => !(a.fijo && a.entrenador_id !== yo));
  const companeros = r.entrenadores.filter((e) => e.entrenador_id !== yo);
  const pendientes = companeros.filter((e) => !e.ok_at);
  return {
    fijos: fijos.map((a) => ({ ...a, de: nombreCorto(nombre.get(a.entrenador_id || '')) })),
    libres,
    preseleccion: libres.filter((a) => a.entrenador_id === yo).map((a) => a.alumno_id),
    soyUltimo: pendientes.length === 0,
    companerosOk: companeros.filter((e) => e.ok_at).map((e) => nombreCorto(e.entrenador)),
    companerosPendientes: pendientes.map((e) => nombreCorto(e.entrenador)),
  };
}

/** Resumen para coordinación: quién ha leído o dado OK. */
export function resumenDestinos(m: Pick<MensajeEnviado, 'tipo' | 'destinos' | 'cerrado_at'>) {
  if (m.tipo === 'reparto') {
    if (m.cerrado_at && m.destinos.every((d) => d.ok_at)) return '✓ Repartido por los entrenadores';
    return m.destinos.map((d) => `${nombreCorto(d.entrenador)} ${d.ok_at ? '✓ OK' : 'pendiente'}`).join(' · ');
  }
  const leidos = m.destinos.filter((d) => d.leido_at).length;
  return `${leidos}/${m.destinos.length} leído`;
}

/** Último reparto enviado para un grupo (o null). */
export function ultimoRepartoGrupo(enviados: MensajeEnviado[], grupoId: string) {
  return (
    enviados
      .filter((m) => m.tipo === 'reparto' && m.grupo_id === grupoId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at))[0] || null
  );
}

export const MENSAJES_RAPIDOS = [
  'Llegad 10 minutos antes, por favor.',
  'Cambio de punto de encuentro: mirad vuestro grupo en la app.',
  'Revisad los reportes pendientes de hoy antes de iros.',
  'Recordad pasar asistencia al empezar.',
];
