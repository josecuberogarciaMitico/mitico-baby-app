import type { ContextoTecnicoReporteApp } from '../reports/reportTypes';
import type {
  AlumnoResumen,
  PerfilOperativoAlumnoApp,
  TendenciaRitmoAlumnoApp,
} from '../students/studentTypes';

export type ProgresionInicialTrabajoDiarioApp = {
  autonomiaCinta?: string;
  cunaFrenada?: string;
  giroInicial?: string;
  dinamicaAutonoma?: string;
  ayudaCunero?: string;
};

export type AlumnoContextoTrabajoDiarioApp = {
  alumnoId: string;
  nombre: string;
  nivel: string;
  tecnica?: string;
  actitud?: string;
  autonomia?: string;
  incidencia?: string;
  recomendacion?: string;
  remontes?: string[];
  ritmo?: string;
  fuerzaNivel?: string;
  demandaAtencion?: string;
  observacionOperativa?: string;
  faseViraje?: string;
  progresionInicial?: ProgresionInicialTrabajoDiarioApp;
};

export type InputTrabajoDiario = {
  nombreGrupo: string;
  modalidad: string;
  niveles: string[];
  pista: string;
  observacionesGrupo: string;
  alumnos: AlumnoContextoTrabajoDiarioApp[];
  trabajosRecientes?: string[];
};

export type TrabajoDiarioHistoricoApp = {
  fecha: string;
  modalidad: string;
  alumnos_detalle: string | null;
  trabajo_diario: string | null;
};

export type ProgresionInicialAlumnoApp = {
  alumno_id: string;
  grupo_id: string;
  entrenador_id: string;
  nivel_reportado: string | null;
  autonomia_cinta: string | null;
  cuna_frenada: string | null;
  giro_inicial: string | null;
  dinamica_autonoma: string | null;
  ayuda_cunero: string | null;
  updated_at: string | null;
};

export type DailyWorkContextSources = {
  students: AlumnoResumen[];
  profiles: PerfilOperativoAlumnoApp[];
  rhythmTrends: TendenciaRitmoAlumnoApp[];
  initialProgressions: ProgresionInicialAlumnoApp[];
  technicalContexts: ContextoTecnicoReporteApp[];
};
