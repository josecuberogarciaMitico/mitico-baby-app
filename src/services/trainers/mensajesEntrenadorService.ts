import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../auth/authService';
import { createSupabaseRestClient } from '../supabase/restClient';
import type { MensajeEntrenador, MensajeEnviado } from '../../features/trainers/mensajesEntrenadorLogic';

// Mensajes de coordinación a los entrenadores (migración 20261116_mensajes_entrenadores).

const api = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

export const cargarMisMensajes = () => api.rpcRows<MensajeEntrenador>('mis_mensajes_entrenador_app', {});
export const marcarMensajeLeido = (id: string) => api.rpcVoid('marcar_mensaje_leido_app', { p_mensaje_id: id });
export const responderReparto = (id: string, alumnos: string[]) =>
  api.rpcVoid('responder_reparto_reportes_app', { p_mensaje_id: id, p_mis_alumnos: alumnos });

export const enviarMensajeEntrenadores = (ids: string[], titulo: string, cuerpo?: string) =>
  api.rpcJson<string>('enviar_mensaje_entrenadores_app', { p_entrenador_ids: ids, p_titulo: titulo, p_cuerpo: cuerpo || null });
export const enviarRepartoReportes = (grupoId: string) =>
  api.rpcJson<string>('enviar_reparto_reportes_app', { p_grupo_id: grupoId });
export const cargarMensajesEnviados = (dias = 3) =>
  api.rpcRows<MensajeEnviado>('mensajes_enviados_entrenadores_app', { p_dias: dias });
