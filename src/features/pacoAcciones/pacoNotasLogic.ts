// Memoria de Paco (lógica pura, sin red): valida las notas que prepara el
// agente antes de guardarlas con el botón Confirmar, y decide qué mensajes van
// al agente en vez de a la Secretaría.

export type PropuestaNotaAgente =
  | {
      tipo: 'nota';
      alumno_id: string;
      nombre: string;
      entrenador_id: string | null;
      entrenador: string | null;
      texto: string;
      una_vez: boolean;
      etiqueta: string;
    }
  | { tipo: 'cerrar_nota'; nota_id: string; nombre: string; texto: string; etiqueta: string };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const texto = (x: unknown, min: number, max: number) =>
  typeof x === 'string' && x.trim().length >= min && x.length <= max;

export function esPropuestaNotaAgente(x: unknown): x is PropuestaNotaAgente {
  if (!x || typeof x !== 'object') return false;
  const p = x as Record<string, unknown>;
  if (!texto(p.nombre, 1, 120) || !texto(p.etiqueta, 1, 240) || !texto(p.texto, 3, 500)) return false;
  if (p.tipo === 'cerrar_nota') return UUID.test(String(p.nota_id));
  if (p.tipo !== 'nota') return false;
  if (!UUID.test(String(p.alumno_id))) return false;
  if (p.entrenador_id !== null && !UUID.test(String(p.entrenador_id))) return false;
  return typeof p.una_vez === 'boolean';
}

function sinTildes(s: string) {
  return s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/**
 * «Apunta que la familia de Martina…», «que no esté con Nico», «el próximo día
 * a pista grande»: es una nota sobre un niño o su familia (va al agente, que
 * la liga al niño). «Apunta llamar a la tienda» sigue siendo de Secretaría.
 */
export function pareceNotaDeNino(mensaje: string): boolean {
  const n = sinTildes(mensaje);
  if (!/\b(apunta|apuntame|anota|anotame|recuerda|recuerdame|ten en cuenta|tenlo en cuenta|memoriza)\b/.test(n)) return false;
  return (
    /\b(familia|padre|madre|papa|mama|nino|nina|hijo|hija|crio|cria)\b/.test(n) ||
    /\bno (le|la|lo|les)? ?(pongas|metas|juntes)\b/.test(n) ||
    /\b(que no (este|vaya|coincida)|con el entrenador|con la entrenadora|pista grande|pista pequena|proximo dia|la proxima vez|prefiere|mejor (el|los) )/.test(n)
  );
}
