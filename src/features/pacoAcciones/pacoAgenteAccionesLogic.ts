// Paco con «manos» (lógica pura, sin red).
//
// El agente (Edge Function mitico-paco-agente) NO escribe: prepara una
// propuesta («meter a X en el grupo Y») y la app le enseña a Jose un botón
// Confirmar. Aquí se valida esa propuesta antes de ejecutar nada, porque llega
// de la red y no debe confiarse en ella a ciegas.

export type PropuestaAgente = {
  tipo: 'incorporar' | 'mover_mismo_turno';
  alumno_id: string | null;
  nombre: string;
  nivel: string;
  sesion_id: string;
  grupo_id: string;
  grupo_origen_id: string | null;
  grupo: string;
  turno: string;
  etiqueta: string;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const NIVEL = /^(INICIACION|[A-D]\+?)$/;
const texto = (x: unknown, max: number) => typeof x === 'string' && x.trim().length > 0 && x.length <= max;

export function esPropuestaAgente(x: unknown): x is PropuestaAgente {
  if (!x || typeof x !== 'object') return false;
  const p = x as Record<string, unknown>;
  if (p.tipo !== 'incorporar' && p.tipo !== 'mover_mismo_turno') return false;
  if (!UUID.test(String(p.sesion_id)) || !UUID.test(String(p.grupo_id))) return false;
  if (p.alumno_id !== null && !UUID.test(String(p.alumno_id))) return false;
  if (p.tipo === 'mover_mismo_turno') {
    // Para cambiar de grupo hace falta la ficha y el grupo de origen.
    if (p.alumno_id === null || !UUID.test(String(p.grupo_origen_id))) return false;
    if (p.grupo_origen_id === p.grupo_id) return false;
  } else if (p.grupo_origen_id !== null) {
    return false;
  }
  if (!texto(p.nombre, 80) || !texto(p.grupo, 120) || !texto(p.turno, 60) || !texto(p.etiqueta, 220)) return false;
  return typeof p.nivel === 'string' && NIVEL.test(p.nivel);
}

/** Texto corto para el registro de acciones de Paco. */
export function resumenPropuesta(p: PropuestaAgente) {
  return `${p.nombre} → «${p.grupo}» (${p.turno})${p.tipo === 'mover_mismo_turno' ? ' · cambio de grupo en el mismo turno' : ''}${
    p.alumno_id ? '' : ' · ficha nueva'
  }`;
}
