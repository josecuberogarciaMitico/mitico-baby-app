export type CobroMensual = {
  temporada: string; anio: number; mes: number; estado_mes: string; nota_direccion: string | null;
  entrenador_id: string; entrenador: string; tarifa_por_turno: number; total_turnos_computables: number;
  total_turnos_baby: number; total_turnos_intensivos: number; total_turnos_ocio: number;
  subtotal_sesiones: number; ajustes_total: number; total_mes: number; detalle_turnos: string | null;
  detalle_ajustes: string | null; pendientes_revisar: number;
};

export type CobroDetalleMensual = {
  entrenador_id: string; entrenador: string; anio: number; mes: number; temporada: string;
  fecha: string; hora_inicio: string; hora_fin: string; modalidad: string; grupo_id: string;
  entreno_manual_id?: string | null; origen_cobro?: string | null; nombre_grupo: string;
  total_alumnos: number; estado_grupo: string; publicado: boolean; tarifa_por_turno: number;
  importe_turno: number; observaciones?: string | null;
};

export type CobroManualFormState = {
  entrenadorId: string; fecha: string; horaInicio: string; horaFin: string; modalidad: string;
  nombreGrupo: string; totalAlumnos: string; importeOverride: string; observaciones: string;
};

export type CobroPdfPreviewState = { titulo: string; cuerpo: string };
export type BillingFilter = 'todos' | 'pendiente' | 'cerrado' | 'incidencias' | 'este_mes';
