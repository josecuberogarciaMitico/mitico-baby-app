import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../auth/authService';
import { createSupabaseRestClient } from '../supabase/restClient';
import type { FilaAvisoReporte } from '../../core/reports/coordinationAlerts';
import type { HistorialReporteAlumnoFichaApp } from '../../core/reports/reportTypes';

const supabase = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

/** Reportes de los últimos 45 días para construir los avisos (migración 20261002_000002). */
export function obtenerFilasAvisosReportes(): Promise<FilaAvisoReporte[]> {
  return supabase.rpcRows<FilaAvisoReporte>('obtener_avisos_reportes_app', {});
}

export type AccionAvisoReporte = 'confirmar_nivel' | 'deshacer_nivel' | 'incidencia_vista';

export function revisarAvisoReporte(reporteId: string, accion: AccionAvisoReporte, nivel?: string | null): Promise<void> {
  return supabase.rpcVoid('revisar_aviso_reporte_app', {
    p_reporte_id: reporteId,
    p_accion: accion,
    p_nivel_codigo: nivel || null,
  });
}

/** «Candidato a subir» → Subir de nivel (migración 20261114_subir_nivel_candidato). */
export function subirNivelCandidato(alumnoId: string, nivel: string): Promise<void> {
  return supabase.rpcVoid('subir_nivel_candidato_app', { p_alumno_id: alumnoId, p_nivel_codigo: nivel });
}

/** Historial completo de reportes de un alumno (el mismo que la ficha). */
export function obtenerHistorialReportesAlumno(alumnoId: string): Promise<HistorialReporteAlumnoFichaApp[]> {
  return supabase.rpcRows<HistorialReporteAlumnoFichaApp>('obtener_historial_reportes_adaptativo_alumno_app', {
    p_alumno_id: alumnoId,
  });
}
