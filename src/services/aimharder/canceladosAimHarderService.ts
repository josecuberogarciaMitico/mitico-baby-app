import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../auth/authService';
import { createSupabaseRestClient } from '../supabase/restClient';
import type { CanceladoAimHarder, RepasoTurno } from '../../features/agenda/canceladosAimHarderLogic';
import type { TurnoRepetido } from '../../features/agenda/repetidosSemanaLogic';

// Cancelados en AimHarder que siguen apuntados en la app (03/11).
// Quitar usa la función que ya usaba el refresco de AimHarder
// (no quita si el niño tiene asistencia o reporte).

const api = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

export function cargarCanceladosAimHarder(desde: string | null = null, hasta: string | null = null) {
  return api.rpcRows<CanceladoAimHarder>('cancelados_aimharder_app', { p_desde: desde, p_hasta: hasta });
}

export function quitarCanceladoAimHarder(sesionAlumnoId: string) {
  return api.rpcVoid('quitar_alumno_sesion_aimharder_sync_app', { p_sesion_alumno_id: sesionAlumnoId });
}

export function dejarCanceladoAimHarder(sesionId: string, alumnoId: string) {
  return api.rpcVoid('dejar_cancelado_aimharder_app', { p_sesion_id: sesionId, p_alumno_id: alumnoId });
}

/** Por turno: niños apuntados y hace cuánto se comprobaron en AimHarder. */
export function cargarRepasoCanceladosAimHarder(desde: string | null = null, hasta: string | null = null) {
  return api.rpcRows<RepasoTurno>('repaso_cancelados_aimharder_app', { p_desde: desde, p_hasta: hasta });
}

// ---- Niños en varios turnos la misma semana (11/11) ----------------------------
export function cargarRepetidosSemana(desde: string | null = null, hasta: string | null = null) {
  return api.rpcRows<TurnoRepetido>('repetidos_semana_app', { p_desde: desde, p_hasta: hasta });
}

/** Quita al niño de ese turno (y de su grupo). Supabase no deja si ya tiene asistencia o reporte. */
export function quitarRepetidoSemana(sesionAlumnoId: string) {
  return api.rpcVoid('quitar_alumno_sesion_operativa_app', { p_sesion_alumno_id: sesionAlumnoId });
}

/** «Es correcto, viene varios días»: deja de avisar de ese niño esa semana. */
export function dejarRepetidoSemana(alumnoId: string, semanaInicio: string) {
  return api.rpcVoid('dejar_repetido_semana_app', { p_alumno_id: alumnoId, p_semana_inicio: semanaInicio });
}
