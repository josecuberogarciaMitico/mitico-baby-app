import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../auth/authService';
import { createSupabaseRestClient } from '../supabase/restClient';
import type { AvisoCambioGrupo } from '../../features/trainers/avisosCambioGrupoLogic';

// Avisos de cambios en grupos publicados (06/11): el entrenador los ve al abrir
// su app (sin push) y coordinación ve cuántos le quedan sin ver.

const api = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

export function cargarMisAvisosCambioGrupo() {
  return api.rpcRows<AvisoCambioGrupo>('mis_avisos_cambio_grupo_app', {});
}

export function marcarAvisosCambioGrupoVistos(hastaIso: string) {
  return api.rpcVoid('marcar_avisos_cambio_grupo_vistos_app', { p_hasta: hastaIso });
}

export function cargarAvisosCambioPendientesPorEntrenador() {
  return api.rpcRows<{ entrenador_id: string; pendientes: number }>('avisos_cambio_grupo_pendientes_app', {});
}
