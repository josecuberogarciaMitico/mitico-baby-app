// Mensajes de coordinación a los entrenadores (16/11). Lógica pura.

export type EntrenadorReparto = { entrenador_id: string; entrenador: string; ok_at: string | null; leido_at: string | null };
export type AlumnoReparto = {
  alumno_id: string;
  alumno: string;
  entrenador_id: string | null;
  /** Lo tiene un compañero que ya dio el OK. */
  fijo: boolean;
  /** Quién hizo ya su reporte (16/11: nadie espera a nadie para reportar). */
  reportado_por?: string | null;
};
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

/**
 * Lo que ve un entrenador en el reparto: niños fijos (de un compañero que ya
 * dio OK o que ya hizo su reporte) y libres. Los que ya reporté yo van
 * marcados y no se pueden soltar.
 */
export function vistaReparto(r: Reparto, yo: string) {
  const nombre = new Map(r.entrenadores.map((e) => [e.entrenador_id, e.entrenador]));
  const deOtro = (a: AlumnoReparto) =>
    Boolean(a.reportado_por && a.reportado_por !== yo) || (a.fijo && a.entrenador_id !== yo);
  const fijos = r.alumnos.filter(deOtro);
  const libres = r.alumnos.filter((a) => !deOtro(a));
  const obligatorios = libres.filter((a) => a.reportado_por === yo).map((a) => a.alumno_id);
  const companeros = r.entrenadores.filter((e) => e.entrenador_id !== yo);
  const pendientes = companeros.filter((e) => !e.ok_at);
  return {
    fijos: fijos.map((a) => ({
      ...a,
      de: nombreCorto(nombre.get((a.reportado_por && a.reportado_por !== yo ? a.reportado_por : a.entrenador_id) || '')),
      hecho: Boolean(a.reportado_por && a.reportado_por !== yo),
    })),
    libres,
    obligatorios,
    preseleccion: Array.from(new Set([...libres.filter((a) => a.entrenador_id === yo).map((a) => a.alumno_id), ...obligatorios])),
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

/** «15/11 · 09:45» desde el texto del reparto («15/11 · 09:45. Marca…»). */
export function sesionDeReparto(cuerpo: string | null | undefined) {
  const m = String(cuerpo || '').match(/^(\d{2}\/\d{2}) · (\d{2}:\d{2})/);
  return m ? `${m[1]} · ${m[2]}` : '';
}

/** «Grupo 2 · Nivel B» desde «Repartid los reportes de Grupo 2 · Nivel B». */
export const grupoDeReparto = (titulo: string) => titulo.replace(/^Repartid los reportes de\s*/i, '');

export const pendientesDeMensaje = (m: Pick<MensajeEnviado, 'tipo' | 'destinos' | 'cerrado_at'>) =>
  m.tipo === 'reparto'
    ? m.cerrado_at
      ? 0
      : m.destinos.filter((d) => !d.ok_at).length
    : m.destinos.filter((d) => !d.leido_at).length;

/** Repartos agrupados por turno (día · hora), el más reciente primero. */
export function repartosPorSesion(enviados: MensajeEnviado[]) {
  const mapa = new Map<string, MensajeEnviado[]>();
  for (const m of enviados.filter((x) => x.tipo === 'reparto')) {
    const k = sesionDeReparto(m.cuerpo) || 'Sin fecha';
    mapa.set(k, [...(mapa.get(k) || []), m]);
  }
  const orden = (k: string) => {
    const [d, h] = k.split(' · ');
    const [dd, mm] = (d || '').split('/');
    return `${mm || ''}${dd || ''}${h || ''}`;
  };
  return [...mapa.entries()]
    .sort((a, b) => orden(b[0]).localeCompare(orden(a[0])))
    .map(([sesion, mensajes]) => ({
      sesion,
      mensajes: mensajes.sort((a, b) => grupoDeReparto(a.titulo).localeCompare(grupoDeReparto(b.titulo), 'es', { numeric: true })),
    }));
}
