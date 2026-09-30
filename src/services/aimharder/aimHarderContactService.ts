import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../auth/authService';
import { createSupabaseRestClient } from '../supabase/restClient';

const supabase = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

export type AimHarderContactoAlumno = {
  nombre: string | null;
  fecha_nacimiento: string | null;
  telefono: string | null;
  coincidencias: number;
};

// Busca por nombre en la copia de AimHarder (Supabase) la fecha de nacimiento y
// el teléfono. Devuelve null si no hay exactamente una ficha con ese nombre.
// También pide a la sincronización que repase ya las reservas de ese niño.
export async function buscarContactoAimHarderPorNombre(
  nombre: string
): Promise<AimHarderContactoAlumno | null> {
  const rows = await supabase.rpcRows<AimHarderContactoAlumno>(
    'aimharder_contacto_alumno_app',
    { p_nombre: nombre }
  );
  const fila = rows[0];
  if (!fila || fila.coincidencias !== 1) return null;
  return fila;
}
