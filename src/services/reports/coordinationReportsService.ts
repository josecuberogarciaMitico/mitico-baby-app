import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../auth/authService';
import { createSupabaseRestClient } from '../supabase/restClient';
import type { GrupoPlan } from '../../features/dashboard/sessionPlanLogic';

// Datos para coordinación (01/11): la tabla «grupos y objetivos» de una sesión
// y la revisión de reportes de la semana. Solo lectura salvo
// editarReporteCoordinacion (RPC con permiso de coordinación).

const api = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

export type SesionPlan = { sesion_id: string; modalidad: string | null; hora_inicio: string; hora_fin: string | null };

/** Sesiones de una fecha y hora de inicio, con sus grupos (no cancelados). */
export async function cargarPlanSesion(fecha: string, hora: string) {
  const sesiones = await api.query<SesionPlan>(
    'v_agenda_sesiones_operativa_app',
    `select=sesion_id,modalidad,hora_inicio,hora_fin&fecha=eq.${fecha}&hora_inicio=eq.${hora.slice(0, 5)}:00`
  );
  if (!sesiones.length) return { sesiones, grupos: [] as GrupoPlan[] };
  const grupos = await api.query<GrupoPlan>(
    'v_grupos_sesion_operativa_app',
    `select=sesion_id,grupo_id,nombre_grupo,nivel_grupo,entrenador,entrenador_apoyo,pista,punto_encuentro,total_alumnos,publicado,trabajo_diario&sesion_id=in.(${sesiones
      .map((s) => s.sesion_id)
      .join(',')})`
  );
  return { sesiones, grupos };
}

export type ReporteCoordinacion = {
  reporte_id: string | null;
  estado: string;
  fecha: string;
  hora_inicio: string | null;
  hora_fin: string | null;
  modalidad: string | null;
  grupo_id: string | null;
  nombre_grupo: string | null;
  alumno_id: string;
  alumno: string;
  entrenador_id: string | null;
  entrenador: string | null;
  nivel_reportado: string | null;
  actitud: string | null;
  actitud_comentario: string | null;
  tecnica: string | null;
  pista: string | null;
  remontes: string[] | null;
  autonomia: string | null;
  incidencia: string | null;
  incidencia_comentario: string | null;
  recomendacion: string | null;
  recomendacion_comentario: string | null;
  observaciones: string | null;
  mejoras_hoy: string[] | null;
  prioridades: string[] | null;
  ritmo_grupo: string | null;
  notas_habilidades: Record<string, string> | null;
  evaluacion_tecnica: Record<string, string> | null;
  enviado_at: string | null;
  updated_at: string | null;
};

export function cargarReportesCoordinacion(desde: string, hasta: string) {
  return api.rpcRows<ReporteCoordinacion>('obtener_reportes_coordinacion_app', { p_desde: desde, p_hasta: hasta });
}

/** Últimos reportes (de cualquier fecha) de los niños cuyo nombre contiene el texto. */
export function buscarReportesAlumno(texto: string, porNino = 1) {
  return api.rpcRows<ReporteCoordinacion>('buscar_reportes_alumno_coordinacion_app', { p_texto: texto, p_por_nino: porNino });
}

export function editarReporteCoordinacion(input: {
  reporteId: string;
  observaciones: string;
  incidenciaComentario: string;
  actitudComentario: string;
  recomendacionComentario: string;
  notasHabilidades: Record<string, string>;
}) {
  return api.rpcVoid('editar_reporte_coordinacion_app', {
    p_reporte_id: input.reporteId,
    p_observaciones: input.observaciones,
    p_incidencia_comentario: input.incidenciaComentario,
    p_actitud_comentario: input.actitudComentario,
    p_recomendacion_comentario: input.recomendacionComentario,
    p_notas_habilidades: input.notasHabilidades,
  });
}
