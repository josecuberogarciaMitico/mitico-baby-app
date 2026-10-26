// Memoria de Paco: leer y cerrar las notas sobre niños y familias.
// Solo coordinación (las funciones de la base de datos lo comprueban).
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../../services/auth/authService';
import { createSupabaseRestClient } from '../../services/supabase/restClient';
import type { PropuestaNotaAgente } from './pacoNotasLogic';

const supabase = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

export type NotaPacoSesion = {
  id: string;
  alumno_id: string;
  alumno: string;
  entrenador_id: string | null;
  entrenador: string | null;
  texto: string;
  una_vez: boolean;
  created_at: string;
  grupo: string | null;
  conflicto: boolean;
};

export async function notasPacoDeSesion(sesionId: string): Promise<NotaPacoSesion[]> {
  const filas = await supabase.rpcRows<NotaPacoSesion>('notas_paco_sesion_app', { p_sesion_id: sesionId });
  // Un niño en dos grupos del turno sale dos veces: una por grupo.
  const vistas = new Set<string>();
  return (Array.isArray(filas) ? filas : []).filter((n) => {
    const clave = `${n.id}:${n.grupo || ''}`;
    if (vistas.has(clave)) return false;
    vistas.add(clave);
    return true;
  });
}

export async function cerrarNotaPaco(id: string): Promise<void> {
  await supabase.rpcJson<unknown>('cerrar_nota_paco_app', { p_id: id });
}

/** Guarda (o borra) la nota que preparó Paco, al pulsar Confirmar. */
export async function ejecutarPropuestaNota(p: PropuestaNotaAgente): Promise<{ answer: string }> {
  const corto = p.nombre.split(/\s+/).slice(0, 2).join(' ');
  if (p.tipo === 'cerrar_nota') {
    await cerrarNotaPaco(p.nota_id);
    return { answer: `Hecho, señor Cubero: he borrado la nota de ${corto}.` };
  }
  await supabase.rpcJson<string>('guardar_nota_paco_app', {
    p_alumno_id: p.alumno_id,
    p_texto: p.texto,
    p_entrenador_id: p.entrenador_id,
    p_una_vez: p.una_vez,
  });
  return {
    answer:
      `📝 Apuntado, señor Cubero: «${p.texto}» (${corto}).\n` +
      `Se lo recordaré cuando ${corto} salga en un turno, cuando me pregunte por él o ella, cuando lo vaya a cambiar de grupo y cuando conteste a su familia en Respuestas.` +
      (p.entrenador ? ` Y le avisaré si acaba en un grupo de ${p.entrenador}.` : ''),
  };
}
