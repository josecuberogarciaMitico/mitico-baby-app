export type TipoListadoAlumnosApp = 'BABY' | 'OCIO' | 'INTENSIVOS' | 'TODOS';

export type ListadoAlumnoTemporadaApp = {
  alumno_id: string; alumno: string; temporada: string; modalidad: string;
  nivel: string | null; pista: string | null; ultimo_entreno: string | null;
  total_entrenamientos: number; ultimo_intensivo: string | null;
};

export type CierreTemporadaAlumnoApp = {
  alumno_id: string; alumno: string; temporada: string; fecha_nacimiento: string | null;
  telefono: string | null; ultimo_nivel_real: string | null; ultima_pista: string | null;
  ultimo_entreno: string | null; ultima_modalidad: string | null; entrenamientos_temporada: number;
  ultima_recomendacion: string | null; tuvo_asistencia: boolean; tuvo_reporte: boolean;
  activo_temporada: boolean; conservar_siguiente: boolean; motivo_estado: string;
};

export type ResumenCierreTemporadaApp = {
  temporada: string; total_alumnos_base: number; activos_temporada: number;
  conservar_siguiente: number; eliminar_por_inactividad: number; con_asistencia: number; con_reporte: number;
};

export type FilaCopiaMaestraImportApp = {
  alumno_id: string; alumno: string; fecha_nacimiento: string; telefono: string;
  ultimo_nivel_real: string; pista: string; ultimo_entreno: string; ultima_modalidad: string;
  entrenamientos_temporada: number; ultima_recomendacion: string; valido: boolean; error: string;
};

export type MiticoWeeklyBackup = {
  formato: 'MITICO_BACKUP_SEMANAL_V1'; version: 1; semana_inicio: string; semana_fin: string;
  datos: Record<string, unknown>; [key: string]: unknown;
};
