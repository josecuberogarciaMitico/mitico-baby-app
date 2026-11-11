import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../auth/authService';
import { createSupabaseRestClient } from '../supabase/restClient';
import { ponerPreparadosGrande, type PreparadoGrande } from '../../features/baby/pistaGrandeCache';

// A+ preparados para la pista grande (11/11).

const api = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

/** Todos los preparados: los deja listos para el recomendador de grupos. */
export async function cargarPreparadosGrande() {
  const filas = await api.rpcRows<PreparadoGrande>('preparados_pista_grande_app', {});
  ponerPreparadosGrande(filas);
  return filas;
}

/** Solo los apuntados en esa semana, con sus turnos (para el aviso). */
export function cargarPreparadosGrandeSemana(lunes: string, domingo: string) {
  return api.rpcRows<PreparadoGrande>('preparados_pista_grande_app', { p_desde: lunes, p_hasta: domingo });
}

/** Vista del entrenador: niños de sus grupos preparados (coordinación ve todos). */
export function cargarPreparadosGrandeVisibles() {
  return api.rpcRows<{ alumno_id: string; estado: 'listo' | 'casi'; motivo: string }>('preparados_pista_grande_visibles_app', {});
}

/** Lo que marca el entrenador en el reporte de un A+: 'bien' | 'con_ayuda' | 'no_listo' | '' (quitar). */
export function marcarPruebaPistaGrande(grupoId: string, alumnoId: string, valor: string) {
  return api.rpcVoid('marcar_prueba_pista_grande_app', { p_grupo_id: grupoId, p_alumno_id: alumnoId, p_valor: valor });
}
