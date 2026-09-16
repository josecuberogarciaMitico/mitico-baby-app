export type EntrenadorResumen = {
  entrenador_id: string;
  nombre_completo: string;
  email: string | null;
  telefono: string | null;
  estado_cobro: string;
  tarifa_por_turno: number;
  activo: boolean;
  chaqueta_entregada: boolean;
  especialidades: string[] | null;
  titulacion_estado: string | null;
  titulacion_url: string | null;
  titulacion_observaciones: string | null;
  antecedentes_estado: string | null;
  antecedentes_url: string | null;
  antecedentes_observaciones: string | null;
  observaciones_internas: string | null;
  created_at: string;
};

export type EstadoAccesoEntrenadorCodigoApp =
  | 'sin_acceso'
  | 'invitacion_pendiente'
  | 'activo'
  | 'desactivado'
  | 'revisar';

export type EstadoAccesoEntrenadorApp = {
  entrenador_id: string;
  estado: EstadoAccesoEntrenadorCodigoApp;
  email: string | null;
  auth_user_id: string | null;
  confirmado_at: string | null;
  ultimo_acceso_at: string | null;
};

export type EstadoAvisosEntrenadorApp = {
  entrenador_id: string;
  avisos_activos: boolean;
  dispositivos_activos: number;
  ultimo_dispositivo_visto: string | null;
};

export type EntrenadorFormState = {
  id: string | null;
  nombre: string;
  email: string;
  telefono: string;
  tarifa: string;
  activo: boolean;
  chaqueta: boolean;
  especialidades: string[];
  titulacionEstado: string;
  titulacionUrl: string;
  titulacionObs: string;
  antecedentesEstado: string;
  antecedentesUrl: string;
  antecedentesObs: string;
  observaciones: string;
};

export type TrainerIdentity = {
  entrenador_id: string;
  entrenador: string;
};

export type TrainerStudentIdentity = TrainerIdentity & {
  grupo_id: string;
  alumno_id: string;
  alumno: string;
};

export type TrainerGroupIdentity = TrainerIdentity & {
  grupo_id: string;
};
