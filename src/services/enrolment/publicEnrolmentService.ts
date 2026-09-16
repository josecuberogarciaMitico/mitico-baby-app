import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { createSupabaseRestClient } from '../supabase/restClient';

const publicEnrolmentApi = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: async () => SUPABASE_ANON_KEY,
});

export async function ejecutarFuncionPublicaConRespuestaApp<T>(
  functionName: string,
  body: object
): Promise<T> {
  return publicEnrolmentApi.publicRpcJson<T>(functionName, body);
}
