export type GrupoPlanning = {
  grupo_id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
  nombre_grupo: string;
  nivel_grupo: string;
  pista: string;
  punto_encuentro: string;
  estado_grupo: string;
  ratio_ok: boolean;
  excepcion_ratio: boolean;
  publicado: boolean;
  entrenadores: string | null;
  alumnos: string | null;
  total_alumnos: number;
  trabajo_diario: string | null;
  observaciones_importantes: string | null;
};

export type GrupoEntrenadorApp = {
  entrenador_id: string;
  entrenador: string;
  estado_confirmacion: string;
  confirmado_at: string | null;
  grupo_id: string;
  nombre_grupo: string;
  nivel_grupo: string;
  pista: string;
  punto_encuentro: string;
  estado_grupo: string;
  publicado: boolean;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
  tipo_sesion?: string | null;
  lugar?: string | null;
  alumnos: string | null;
  total_alumnos: number;
  trabajo_diario: string | null;
  observaciones_importantes: string | null;
};

export type AlumnoReporteEntrenador = {
  entrenador_id: string;
  entrenador: string;
  grupo_id: string;
  nombre_grupo: string;
  publicado: boolean;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
  alumno_id: string;
  alumno: string;
  estado_asistencia: string;
  reporte_id: string | null;
  enviado_at: string | null;
  estado_reporte: string;
  nivel_alumno?: string | null;
  fuente_nivel?: string | null;
  pista_alumno?: string | null;
};

export type ReportePendiente = Omit<
  AlumnoReporteEntrenador,
  'publicado' | 'reporte_id' | 'enviado_at'
>;

export type ResumenInicio = {
  reportesPendientes: number;
  asistenciasSinConfirmar: number;
  gruposSinPublicar: number;
  entrenadoresSinConfirmar: number;
};

export type PlanningStatus =
  | 'Sin publicar'
  | 'Publicado · entrenador sin confirmar'
  | 'Asistencia pendiente'
  | 'Reportes pendientes'
  | 'Grupo cerrado'
  | 'Publicado · pendiente de seguimiento';
