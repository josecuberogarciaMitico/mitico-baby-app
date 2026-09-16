export const TECHNICAL_REPORT_SCALE = [
  'No trabajado',
  'Necesita mejorar',
  'En desarrollo',
  'Correcto',
  'Consolidado',
] as const;

export type ValorTecnicoReporte =
  (typeof TECHNICAL_REPORT_SCALE)[number];

export type EvaluacionTecnicaReporte = Record<
  string,
  ValorTecnicoReporte
>;

export type HistorialReporteAlumnoFichaApp = {
  reporte_id: string | null;
  fecha: string;
  modalidad: string | null;
  grupo: string | null;
  entrenador: string | null;
  nivel_reportado: string | null;
  actitud: string | null;
  tecnica: string | null;
  pista: string | null;
  remontes: string[] | null;
  autonomia: string | null;
  ritmo_grupo: string | null;
  mejora_hoy: string | null;
  incidencia: string | null;
  recomendacion: string | null;
  observaciones_generales: string | null;
  trabajo_diario: string | null;
  enviado_at: string | null;
  evaluacion_tecnica?: EvaluacionTecnicaReporte | null;
  mejoras_hoy?: string[] | null;
  prioridades_proxima_sesion?: string[] | null;
  reporte_version?: number | null;
};

export type ContextoTecnicoReporteApp = {
  alumno_id: string;
  reporte_id: string;
  fecha: string;
  evaluacion_tecnica: EvaluacionTecnicaReporte | null;
  mejoras_hoy: string[] | null;
  prioridades_proxima_sesion: string[] | null;
};
