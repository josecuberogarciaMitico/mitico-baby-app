import type { GrupoPlanning } from '../../core/sessions/operationalTypes';
import type {
  GrupoIntensivoDiaApp,
  IntensivoApp,
  IntensivoDiaApp,
} from '../intensivos/intensiveTypes';

export type ListadoApp = {
  listado_id: string; semana: string | null; fecha: string; hora_inicio: string;
  hora_fin: string; modalidad: string; estado: string; fuera_de_plazo: boolean;
  total_nombres_detectados: number; encontrados: number; altas_nuevas: number;
  no_encontrados: number; pendientes_revisar: number; duplicados: number;
};

export type AgendaSesionDirectaApp = {
  sesion_id: string; fecha: string; hora_inicio: string; hora_fin: string;
  lugar: string; tipo_sesion: string; estado_sesion: string; modalidad_codigo: string;
  modalidad: string; semana: string; semana_inicio: string; semana_fin: string;
  total_alumnos: number; total_nuevos: number; total_conocidos: number;
  total_grupos: number; grupos_publicados: number; alumnos_en_grupos: number;
  alumnos_sin_grupo: number;
};

export type AgendaAlumnoSesionApp = {
  sesion_alumno_id: string; sesion_id: string; alumno_id: string; alumno: string;
  orden: number; estado_en_listado: string; nivel_usado: string | null;
  orden_nivel: number | null; pista_recomendada: string | null;
  origen_nivel: string | null; estado_ficha: string; observacion: string | null;
};

export type AgendaGrupoSesionApp = {
  sesion_id: string; grupo_id: string; nombre_grupo: string; nivel_grupo: string | null;
  pista: string | null; punto_encuentro: string | null; estado_grupo: string;
  publicado: boolean; trabajo_diario: string | null; observaciones_importantes: string | null;
  entrenador_id: string | null; entrenador: string | null; entrenador_apoyo_id?: string | null;
  entrenador_apoyo?: string | null; estado_confirmacion: string | null;
  total_alumnos: number; alumnos_lista: string | null;
};

export type RecomendacionFueraPlazoAgendaApp = {
  sesion_id: string; fecha: string; hora_inicio: string; hora_fin: string;
  grupo_id: string; grupo: string; nivel_grupo: string; pista: string; punto: string;
  entrenador: string; total_actual: number; total_final: number;
  estado: 'RECOMENDADO' | 'REVISAR' | 'NO_ENCAJA'; motivo: string; score: number;
  es_sesion_actual: boolean;
};

export type AgendaRecomendacionSesionApp = {
  sesion_id: string; grupo_recomendado: string; bloque_tecnico: string;
  pista_recomendada: string; alumno_id: string; alumno: string; nivel_resumen: string;
  pista_alumno: string; orden_en_grupo: number; alertas: string | null;
  orden_bloque?: number | null; nivel_orden?: number | null; edad?: number | null;
  fuente_nivel?: string | null; estado_ficha?: string | null;
};

export type AgendaFormState = {
  fecha: string; modalidad: string; hora_inicio: string; hora_fin: string;
  lugar: string; texto_listado: string;
};

export type SesionAgendaOperativa = {
  id: string; fecha: string; hora_inicio: string; hora_fin: string; modalidad: string;
  titulo: string; estado: string; totalAlumnos: number; totalGrupos: number;
  publicados: number; origen: 'operativa' | 'intensivo' | 'planning' | 'listado';
  intensivo?: IntensivoApp; dia?: IntensivoDiaApp; grupos: GrupoIntensivoDiaApp[];
  planningGrupos: GrupoPlanning[]; listado?: ListadoApp; agendaDirecta?: AgendaSesionDirectaApp;
};
