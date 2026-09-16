export type IntensivoApp = {
  intensivo_id: string;
  temporada: string;
  intensivo: string;
  lugar: string;
  estado: string;
  total_alumnos: number;
  total_dias: number;
  fecha_inicio: string | null;
  fecha_fin: string | null;
};

export type PanelControlIntensivoApp = {
  intensivo_id: string;
  temporada: string;
  intensivo: string;
  lugar: string;
  estado: string;
  total_dias: number;
  dias_con_sesion: number;
  dias_sin_sesion: number;
  total_grupos: number;
  grupos_publicados: number;
  grupos_sin_publicar: number;
  alumnos_inscritos: number;
  asignaciones_esperadas: number;
  asignaciones_hechas: number;
  asignaciones_faltantes_estimadas: number;
  total_reportes: number;
  reportes_pendientes_estimados: number;
  diplomas_pendientes: number;
  diplomas_revisados: number;
  total_recuperaciones: number;
  recuperaciones_pendientes: number;
  recuperaciones_cerradas: number;
  estado_operativo: string;
};

export type IntensivoAlumnoApp = {
  intensivo_alumno_id: string;
  intensivo_id: string;
  intensivo: string;
  alumno_id: string;
  alumno: string;
  estado_diploma: string;
  recomendacion_siguiente_paso: string | null;
  nivel_final_propuesto_id: string | null;
  nivel_final_confirmado_id: string | null;
  created_at: string;
};

export type AlumnoParaIntensivoApp = {
  alumno_id: string;
  alumno: string;
};

export type AlumnoResumenParaVolcadoApp = {
  alumno_id: string;
  alumno: string;
  nombre_normalizado: string | null;
  fecha_nacimiento: string | null;
  nivel_actual_id: string | null;
  nivel_actual: string | null;
  orden_nivel_actual: number | null;
  pista_nivel_actual: string | null;
  nivel_estimado_id: string | null;
  nivel_estimado: string | null;
  orden_nivel_estimado: number | null;
  pista_nivel_estimado: string | null;
  nivel_resumen: string | null;
  pista_resumen: string | null;
  origen_nivel_estimado: string | null;
  estado_ficha: string;
  observacion_interna: string | null;
  observacion_visible_entrenador: string | null;
  mostrar_observacion_entrenador: boolean;
  activo: boolean;
};

export type VolcadoAlumnoIntensivoApp = {
  alumno_id: string;
  alumno: string;
  resultado: string;
  nivel_resumen: string | null;
  pista_resumen: string | null;
  estado_ficha: string;
  observacion_visible_entrenador: string | null;
};

export type IntensivoDiaApp = {
  intensivo_dia_id: string;
  intensivo_id: string;
  numero_dia: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  sesion_id: string | null;
  created_at: string;
};

export type IntensivoAsistenciaApp = {
  intensivo_dia_id: string;
  intensivo_id: string;
  intensivo: string;
  numero_dia: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  alumno_id: string;
  alumno: string;
  asistencia_id: string | null;
  estado: string;
  falta_genera_recuperacion: boolean;
  estado_diploma: string;
  recomendacion_siguiente_paso: string | null;
};

export type IntensivoRecuperacionApp = {
  recuperacion_id: string;
  intensivo_origen_id: string | null;
  intensivo_origen: string | null;
  alumno_id: string;
  alumno: string;
  intensivo_destino_id: string | null;
  intensivo_destino: string | null;
  grupo_destino_id: string | null;
  grupo_destino: string | null;
  estado: string;
  created_at: string;
  intensivo_dia_origen_id: string | null;
  numero_dia_origen: number | null;
  fecha_falta: string | null;
  hora_inicio_falta: string | null;
  hora_fin_falta: string | null;
  estado_falta: string | null;
  falta_genera_recuperacion: boolean | null;
  nivel_alumno: string | null;
  nivel_orden_alumno: number | null;
  fecha_destino: string | null;
  hora_inicio_destino: string | null;
  hora_fin_destino: string | null;
};

export type RecuperacionRecomendacionApp = {
  recuperacion_id: string;
  alumno_id: string;
  nivel_alumno: string | null;
  nivel_orden_alumno: number | null;
  fecha_falta: string;
  grupo_id: string;
  intensivo_dia_id: string;
  intensivo_destino_id: string;
  intensivo_destino: string;
  numero_dia_destino: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  nombre_grupo: string;
  nivel_grupo: string | null;
  pista: string | null;
  publicado: boolean;
  total_alumnos: number;
  capacidad_max: number;
  plazas_libres: number;
  nivel_min_grupo: number | null;
  nivel_max_grupo: number | null;
  diferencia_nivel: number;
  edad_media_grupo_meses: number | null;
  diferencia_edad_meses: number | null;
  dias_despues: number;
  puntuacion: number;
  categoria: 'IDEAL' | 'COMPATIBLE';
  motivo: string;
  orden_recomendacion: number;
};

export type GrupoDestinoRecuperacionApp = {
  grupo_id: string;
  nombre_grupo: string;
  fecha: string;
  hora_inicio: string;
  modalidad: string;
};

export type GrupoIntensivoDiaApp = {
  intensivo_dia_id: string;
  intensivo_id: string;
  intensivo: string;
  numero_dia: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  sesion_id: string | null;
  estado_sesion: string | null;
  grupo_id: string | null;
  nombre_grupo: string | null;
  nivel_grupo: string | null;
  pista: string | null;
  punto_encuentro: string | null;
  estado_grupo: string | null;
  publicado: boolean | null;
  observaciones_importantes: string | null;
  entrenador_id: string | null;
  entrenador: string | null;
  estado_confirmacion: string | null;
  total_alumnos: number;
  alumnos_lista: string | null;
  trabajo_diario: string | null;
};

export type RecomendacionGrupoIntensivoDiaApp = {
  intensivo_dia_id: string;
  intensivo_id: string;
  numero_dia: number;
  fecha: string;
  grupo_recomendado: string;
  bloque_tecnico: string;
  orden_bloque: number;
  pista_recomendada: string;
  tamanio_grupo: number;
  alerta_grupo: string;
  alumno_id: string;
  alumno: string;
  nivel_resumen: string;
  nivel_orden: number;
  fuente_nivel: string;
  edad: number | null;
  estado_ficha: string;
  observacion_visible_entrenador: string | null;
  orden_en_grupo: number;
};

export type GrupoEditableIntensivoDiaApp = {
  intensivo_dia_id: string;
  intensivo_id: string;
  numero_dia: number;
  fecha: string;
  grupo_id: string;
  nombre_grupo: string;
  nivel_grupo: string | null;
  pista: string | null;
  publicado: boolean;
  entrenador_id: string | null;
  trabajo_diario: string | null;
  observaciones_importantes: string | null;
  alumno_id: string;
  alumno: string;
  nivel_resumen: string;
  nivel_orden: number;
  fuente_nivel: string;
  edad: number | null;
  estado_ficha: string;
  observacion_visible_entrenador: string | null;
  orden_en_grupo: number;
};

export type RevisionEntreSesionesIntensivoApp = {
  alumno_id: string;
  alumno: string;
  nivel: string;
  grupo_origen_id: string;
  grupo_origen: string;
  grupo_destino_id: string;
  grupo_destino: string;
  estado: 'CAMBIO_RECOMENDADO' | 'REVISAR' | 'MANTENER';
  motivo: string;
  diferencia_actual: number;
  diferencia_destino: number;
};


export type ResumenReportesIntensivoApp = {
  intensivo_id: string;
  intensivo: string;
  alumno_id: string;
  alumno: string;
  total_dias_intensivo: number;
  total_reportes: number;
  actitudes_reportadas: string | null;
  tecnicas_reportadas: string | null;
  pistas_reportadas: string | null;
  autonomias_reportadas: string | null;
  incidencias_reportadas: string | null;
  recomendaciones_reportadas: string | null;
  ultimo_reporte_at: string | null;
};

export type IntensivoFormState = {
  temporada: string;
  nombre: string;
  lugar: string;
  estado: string;
};

export type DiaIntensivoFormState = {
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
};

export type PlantillaCuatroSesionesIntensivoState = {
  fechaInicio: string;
  horaInicio: string;
  horaFin: string;
  tipo:
    | 'cuatro_dias'
    | 'dos_fines_semana'
    | 'cuatro_sabados'
    | 'cuatro_domingos';
};

export type GrupoIntensivoFormState = {
  nombre_grupo: string;
  nivel_grupo: string;
  pista: string;
  punto_encuentro: string;
  trabajo_diario: string;
  observaciones_importantes: string;
  entrenador_id: string;
  entrenador_apoyo_id: string;
  alumnos_ids: string[];
  publicado: boolean;
};

