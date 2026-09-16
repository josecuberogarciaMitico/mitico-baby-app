export type AlumnoResumen = {
  alumno_id: string;
  alumno: string;
  telefono: string | null;
  nivel_actual: string | null;
  nivel_estimado: string | null;
  origen_nivel_estimado: string | null;
  estado_ficha: string;
  total_reportes: number;
  total_entrenamientos_realizados: number;
  ultima_fecha_reporte: string | null;
  ultima_modalidad: string | null;
  ultimo_nivel_reportado: string | null;
  ultima_actitud: string | null;
  ultima_tecnica: string | null;
  ultima_pista: string | null;
  ultimos_remontes: string[] | null;
  ultima_autonomia: string | null;
  ultima_incidencia: string | null;
  ultima_recomendacion: string | null;
  fecha_nacimiento: string | null;
  camiseta_entregada: boolean;
  camiseta_entregada_at: string | null;
};

export type TendenciaRitmoAlumnoApp = {
  alumno_id: string;
  ritmo_tendencia: string | null;
  confianza: 'ALTA' | 'MEDIA' | 'BAJA' | null;
  reportes_usados: number;
  ritmo_ultimo: string | null;
  ritmo_anterior: string | null;
  ritmo_tercero: string | null;
};

export type PerfilOperativoAlumnoApp = {
  alumno_id: string;
  alumno: string;
  nivel_usado: string | null;
  fuerza_nivel: 'BAJO' | 'ADECUADO' | 'FUERTE' | 'MUY_FUERTE' | null;
  ritmo_tendencia: string | null;
  confianza_ritmo: 'ALTA' | 'MEDIA' | 'BAJA' | null;
  reportes_ritmo: number;
  autonomia_reciente: string | null;
  remontes_recientes: string[] | null;
  demanda_atencion: 'NORMAL' | 'MEDIA' | 'ALTA' | null;
  edad_aprox: number | null;
  observacion_visible_entrenador: string | null;
  mostrar_observacion_entrenador: boolean;
  aviso_operativo: string | null;
};
