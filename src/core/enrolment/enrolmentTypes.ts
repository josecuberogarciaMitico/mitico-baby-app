export type EnrolmentModality = 'BABY' | 'INTENSIVOS' | 'OCIO';

export type OcioFixedDay = '' | 'Jueves' | 'Sábado' | 'Domingo';

export type AltaNivelInicialApp = {
  id: string;
  nombre_completo: string;
  fecha_nacimiento: string;
  modalidad: EnrolmentModality;
  telefono: string;
  token_publico: string;
  respuesta_experiencia: string | null;
  respuesta_desplazamiento: string | null;
  respuesta_frenado: string | null;
  respuesta_giros: string | null;
  respuesta_remonte: string | null;
  respuesta_pista: string | null;
  respuesta_control_velocidad: string | null;
  respuesta_tecnica: string | null;
  observaciones_entrenador_familia: string[] | null;
  observacion_entrenador_otra: string | null;
  observaciones_familia: string | null;
  nivel_propuesto_id: string | null;
  nivel_propuesto: string | null;
  nivel_propuesto_confianza: string | null;
  nivel_propuesto_motivo: string | null;
  requiere_revision_jefe: boolean;
  nivel_validado_id: string | null;
  nivel_validado: string | null;
  estado:
    | 'PENDIENTE_ENVIO'
    | 'ENVIADO'
    | 'RESPONDIDO'
    | 'VALIDADO'
    | 'ANADIDO'
    | 'DESCARTADO';
  creado_at: string;
  enviado_at: string | null;
  respondido_at: string | null;
  validado_at: string | null;
  eliminar_despues_de: string | null;
};

export type CoincidenciaAltaNivelInicialApp = {
  alumno_id: string;
  alumno: string;
  fecha_nacimiento: string | null;
  nivel_actual: string | null;
  tipo_coincidencia: 'EXACTA' | 'MISMA_FECHA';
};

export type AvisoNuevaAltaAlumnoApp = {
  referencia_id: string;
  fuente: 'FICHA_MAESTRA' | 'ALTA_TEST';
  alumno: string;
  fecha_nacimiento: string | null;
  nivel_actual: string | null;
  estado: string | null;
  motivo: 'MISMA_FECHA' | 'NOMBRE_EXACTO' | 'NOMBRE_COMPATIBLE';
};

export type AltaImportadaPegadoApp = {
  clave: string;
  nombre: string;
  fechaNacimiento: string;
  modalidad: EnrolmentModality;
  telefono: string;
  ocioDiaFijo: OcioFixedDay;
  filaOrigen: number;
};

export type ResumenImportacionAltasApp = {
  totalLeidas: number;
  pendientes: number;
  yaExistian: number;
  invalidas: number;
  sinComprobar: number;
};

export type AltaImportadaIncompletaApp = {
  filaOrigen: number;
  texto: string;
  motivo: string;
};

export type AltaImportadaGestionadaApp = {
  fila: AltaImportadaPegadoApp;
  detalle: string;
};

export type DetalleImportacionAltasApp =
  | ''
  | 'LEIDAS'
  | 'NUEVAS'
  | 'GESTIONADAS'
  | 'INVALIDAS'
  | 'SIN_COMPROBAR';

export type AltaNivelInicialFormApp = {
  nombre: string;
  fechaNacimiento: string;
  modalidad: EnrolmentModality;
  telefono: string;
  ocioDiaFijo: OcioFixedDay;
};

export type TestNivelPublicoInfoApp = {
  nombre_completo: string;
  modalidad: string;
  estado: string;
  puede_responder: boolean;
};

export type TestNivelPublicoRespuestasApp = {
  experiencia: string;
  desplazamiento: string;
  frenado: string;
  giros: string;
  remonte: string;
  pista: string;
  controlVelocidad: string;
  tecnica: string;
  observacionesEntrenador: string[];
  observacionEntrenadorOtra: string;
  observacionesCoordinacion: string;
};

export type ParsedEnrolmentList = {
  filas: AltaImportadaPegadoApp[];
  invalidas: number;
  filasInvalidas: AltaImportadaIncompletaApp[];
};
