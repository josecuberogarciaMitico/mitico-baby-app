import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../auth/authService';
import { createSupabaseRestClient } from '../supabase/restClient';

const supabase = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

export type LateStudentSessionResult = {
  alumno_id: string;
  alumno: string;
  sesion_id: string;
  nivel_usado: string;
  resultado: 'ANADIDO_A_SESION' | 'YA_ESTABA_EN_SESION' | string;
};

// "+ Alumno fuera de plazo" cuando la sesión no tiene grupos o el niño no
// encaja en ninguno: lo añade a la SESIÓN (sin grupo). Queda pendiente de
// colocar y entra en los grupos al generarlos.
export async function addLateStudentToSession(input: {
  sessionId: string;
  studentId: string | null;
  fullName: string;
  level: string;
}): Promise<LateStudentSessionResult> {
  const rows = await supabase.rpcRows<LateStudentSessionResult>(
    'anadir_alumno_sesion_fuera_plazo_app',
    {
      p_sesion_id: input.sessionId,
      p_alumno_id: input.studentId || null,
      p_nombre_completo: input.fullName,
      p_nivel_codigo: input.level,
    }
  );
  const result = rows[0];
  if (!result) {
    throw new Error('Supabase no devolvió confirmación al añadir el alumno a la sesión.');
  }
  return result;
}
