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

// ---- Gestiones (29/10): recordatorio con aviso y publicar grupos -----------

export type PropuestaGestion =
  | { tipo: 'recordatorio'; titulo: string; detalle: string | null; recordar_at: string; cuando: string; etiqueta: string }
  | {
      tipo: 'publicar_grupos';
      grupos: { grupo_id: string; nombre: string; turno: string; entrenador: string }[];
      etiqueta: string;
    };

const MAX_GRUPOS_PUBLICAR = 12;

export function esPropuestaGestion(x: unknown): x is PropuestaGestion {
  if (!x || typeof x !== 'object') return false;
  const p = x as Record<string, unknown>;
  if (!texto(p.etiqueta, 220)) return false;
  if (p.tipo === 'recordatorio') {
    if (!texto(p.titulo, 180) || !texto(p.cuando, 60)) return false;
    if (p.detalle !== null && p.detalle !== undefined && (typeof p.detalle !== 'string' || p.detalle.length > 1500)) return false;
    const t = Date.parse(String(p.recordar_at));
    return Number.isFinite(t) && /^\d{4}-\d{2}-\d{2}T/.test(String(p.recordar_at));
  }
  if (p.tipo === 'publicar_grupos') {
    if (!Array.isArray(p.grupos) || p.grupos.length === 0 || p.grupos.length > MAX_GRUPOS_PUBLICAR) return false;
    const ids = new Set<string>();
    for (const g of p.grupos as unknown[]) {
      const r = (g || {}) as Record<string, unknown>;
      if (!UUID.test(String(r.grupo_id)) || ids.has(String(r.grupo_id))) return false;
      ids.add(String(r.grupo_id));
      if (!texto(r.nombre, 120) || typeof r.turno !== 'string' || typeof r.entrenador !== 'string') return false;
    }
    return true;
  }
  return false;
}

/** «Recuérdame/avísame … mañana / el viernes / a las 10»: recordatorio con aviso (va al agente). */
export function pareceRecordatorioConHora(message: string) {
  const n = message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (!/\b(recuerdame|recordarme|avisame|avisarme|recordatorio)\b/.test(n)) return false;
  return /\b(a las \d|\d{1,2}:\d{2}|\d{1,2} ?h\b|manana|pasado|hoy|esta tarde|esta noche|lunes|martes|miercoles|jueves|viernes|sabado|domingo|dentro de|en \d+ (min|minutos|hora|horas))/.test(n);
}

/**
 * ¿Es una pregunta de consulta (y no una orden)? Las consultas van directas al
 * agente, sin pasar antes por el clasificador de acciones (un paso de IA menos).
 */
export function pareceConsulta(message: string) {
  const n = message
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
  if (!n) return false;
  const orden = /\b(pasa|pasale|mueve|muevele|cambia|cambiale|mete|metelo|metela|publica|publicalo|apunta|apuntame|anota|recuerda|recuerdame|avisame|borra|elimina|crea|anade|quita|quitale|confirma|manda|envia|coloca|colocalo|responde|contesta|alta|test)\b/;
  if (orden.test(n)) return false;
  const interrogativo = /^(que|quien|quienes|cuanto|cuantos|cuantas|como|donde|cuando|cual|cuales|hay|tengo|tiene|tienen|esta|estan|me dices|dime|ensename|muestrame|revisa|mira)\b/;
  return n.includes('?') || interrogativo.test(n.replace(/^¿\s*/, ''));
}
