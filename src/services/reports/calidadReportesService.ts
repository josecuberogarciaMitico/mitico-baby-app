import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../auth/authService';
import { createSupabaseRestClient } from '../supabase/restClient';

// Calidad de reportes y reportes devueltos (migración 20261117_reportes_devolver_y_calidad).

const api = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

export type FilaCalidadEquipo = {
  es_mio: boolean;
  fecha: string;
  valoradas: number;
  a_mejorar: number;
  letras: number;
  poco_detallado: boolean;
  igual_grupo: boolean;
  dias_tarde: number | null;
};

export type ReporteDevuelto = {
  reporte_id: string;
  fecha: string;
  alumno: string | null;
  nombre_grupo: string | null;
  modalidad: string | null;
  nivel: string | null;
  motivo: string | null;
  devuelto_at: string;
  evaluacion_tecnica: Record<string, string> | null;
  notas_habilidades: Record<string, string> | null;
  observaciones: string | null;
};

export type EstadoDevolucion = {
  reporte_id: string;
  devuelto_at: string;
  devuelto_motivo: string | null;
  completado_devolucion_at: string | null;
};

/** Rasgos de calidad de los reportes de 28 días (sin nombres), con «es_mio». */
export const cargarCalidadEquipo = () => api.rpcRows<FilaCalidadEquipo>('calidad_reportes_equipo_app', {});
export const cargarMisReportesDevueltos = () => api.rpcRows<ReporteDevuelto>('mis_reportes_devueltos_app', {});
export const completarReporteDevuelto = (id: string, notas: Record<string, string>, observaciones: string) =>
  api.rpcVoid('completar_reporte_devuelto_app', { p_reporte_id: id, p_notas: notas, p_observaciones: observaciones });

export const devolverReporte = (id: string, motivo: string) =>
  api.rpcVoid('devolver_reporte_app', { p_reporte_id: id, p_motivo: motivo, p_cancelar: false });
export const anularDevolucion = (id: string) =>
  api.rpcVoid('devolver_reporte_app', { p_reporte_id: id, p_motivo: null, p_cancelar: true });
export const cargarEstadoDevoluciones = (desde: string) =>
  api.rpcRows<EstadoDevolucion>('reportes_devueltos_app', { p_desde: desde });
