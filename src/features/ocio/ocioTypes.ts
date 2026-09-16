export type OcioAlumnoApp = {
  alumno_id: string;
  alumno: string;
  telefono: string | null;
  nivel: string | null;
  nivel_usado: string | null;
  fuente_nivel: string | null;
  fecha_nacimiento: string | null;
  estado_ficha: string | null;
  origen_nivel_estimado: string | null;
  dia_fijo: string | null;
  hora_inicio_fija: string | null;
  hora_fin_fija: string | null;
  observaciones: string | null;
  grupo_id: string | null;
  grupo_estable: string | null;
  grupo_dia: string | null;
  grupo_hora_inicio: string | null;
  grupo_hora_fin: string | null;
  grupo_nivel: string | null;
  grupo_pista: string | null;
  grupo_punto: string | null;
  total_reportes: number;
  ultimo_reporte_fecha: string | null;
};

export type OcioGrupoApp = {
  grupo_id: string;
  nombre_grupo: string;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  nivel_grupo: string | null;
  pista: string | null;
  punto_encuentro: string | null;
  observaciones: string | null;
  activo: boolean;
  temporada: string | null;
  total_alumnos: number;
  alumnos_lista: string | null;
};

export type OcioGrupoPropuestaApp = {
  propuesta_id: string;
  nombre: string;
  pista: 'Pequeña' | 'Grande';
  nivelObjetivo: string;
  punto: string;
  alumnoIds: string[];
  aviso: string | null;
};

export type OcioImportadoApp = {
  alumno: string;
  nivel: string;
  resultado: string;
};

export type OcioRecomendacionCambioApp = {
  alumno_id: string;
  alumno: string;
  nivel_alumno: string | null;
  orden_alumno: number;
  grupo_id: string | null;
  nombre_grupo: string | null;
  nivel_grupo: string | null;
  recomendacion: string;
};

export type OcioPrepararResultadoApp = {
  grupo_estable: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  alumnos: number;
  entrenador: string | null;
  estado: string;
  sesion_id: string | null;
  grupo_id: string | null;
  punto_encuentro?: string | null;
  publicado?: boolean;
  alumnos_lista?: string[];
};

export type OcioGrupoFormState = {
  id: string | null;
  nombre: string;
  dia: string;
  horaInicio: string;
  horaFin: string;
  nivel: string;
  pista: string;
  punto: string;
  observaciones: string;
};

export function ocioGrupoFormInicial(): OcioGrupoFormState {
  return {
    id: null,
    nombre: '',
    dia: 'Jueves',
    horaInicio: '18:00',
    horaFin: '20:00',
    nivel: 'A',
    pista: 'Pequeña',
    punto: '',
    observaciones: '',
  };
}
