/**
 * Fase 3 (02/10/2026): avisos de reportes para coordinación.
 * Lógica pura (sin navegador) a partir de las filas de obtener_avisos_reportes_app.
 *  - nivel: un entrenador ha marcado otro nivel («Revisar nivel») → Confirmar / Deshacer.
 *  - candidato: tiene todos los focos de su nivel conseguidos → candidato a subir.
 *  - incidencia: el entrenador marcó «¿Ha pasado algo? Sí».
 */
import { TECHNICAL_LEVELS } from '../levels/levelContract';
import { FOCOS_POR_NIVEL, reportTechnicalLevelForRender } from '../../lib/adaptiveReport';
import { progresoHabilidadesNivel } from './skillProgress';
import type { EvaluacionTecnicaReporte, HistorialReporteAlumnoFichaApp } from './reportTypes';

export type FilaAvisoReporte = {
  reporte_id: string;
  alumno_id: string;
  alumno: string | null;
  fecha: string;
  modalidad: string | null;
  grupo: string | null;
  entrenador: string | null;
  nivel_reportado: string | null;
  nivel_anterior: string | null;
  nivel_actual: string | null;
  ritmo_grupo: string | null;
  prioridades: string[] | null;
  incidencia: string | null;
  incidencia_comentario: string | null;
  evaluacion_tecnica: EvaluacionTecnicaReporte | null;
  nivel_revision: string | null;
  incidencia_revisada_at: string | null;
  es_ultimo_del_alumno: boolean | null;
  enviado_at?: string | null;
};

type Base = { id: string; alumnoId: string; alumno: string };

export type AvisoCoordinacion =
  | (Base & {
      tipo: 'nivel';
      reporteId: string;
      fecha: string;
      entrenador: string | null;
      modalidad: string | null;
      nivelNuevo: string;
      nivelAnterior: string | null;
      sube: boolean;
      puedeDeshacer: boolean;
    })
  | (Base & { tipo: 'candidato'; nivel: string; siguiente: string; focos: number })
  | (Base & {
      tipo: 'incidencia';
      reporteId: string;
      fecha: string;
      entrenador: string | null;
      modalidad: string | null;
      incidencia: string;
    });

export const DIAS_AVISO_NIVEL = 30;
export const DIAS_AVISO_INCIDENCIA = 14;

function diasEntre(fechaIso: string, hoyIso: string): number {
  const a = Date.parse(`${fechaIso}T00:00:00Z`);
  const b = Date.parse(`${hoyIso}T00:00:00Z`);
  if (Number.isNaN(a) || Number.isNaN(b)) return Number.POSITIVE_INFINITY;
  return Math.round((b - a) / 86400000);
}

const orden = (nivel: string) => TECHNICAL_LEVELS.indexOf(nivel as (typeof TECHNICAL_LEVELS)[number]);

/** Nivel anterior: el del reporte previo; si no hay, se deduce del ritmo marcado. */
export function nivelAnteriorDeFila(fila: FilaAvisoReporte): string | null {
  const previo = reportTechnicalLevelForRender(fila.nivel_anterior);
  if (previo) return previo;
  const nuevo = reportTechnicalLevelForRender(fila.nivel_reportado);
  if (!nuevo) return null;
  const i = orden(nuevo);
  const ritmo = String(fila.ritmo_grupo || '');
  if (ritmo.startsWith('Muy rápido') && i > 0) return TECHNICAL_LEVELS[i - 1];
  if (ritmo.startsWith('Lento') && i < TECHNICAL_LEVELS.length - 1) return TECHNICAL_LEVELS[i + 1];
  return null;
}

export const claveCandidato = (alumnoId: string, nivel: string) => `cand:${alumnoId}:${nivel}`;

export function construirAvisos(
  filas: FilaAvisoReporte[],
  hoyIso: string,
  candidatosVistos: Set<string> = new Set()
): AvisoCoordinacion[] {
  const avisosNivel: AvisoCoordinacion[] = [];
  const avisosIncidencia: AvisoCoordinacion[] = [];
  const conNivelPendiente = new Set<string>();

  filas.forEach((f) => {
    const nombre = f.alumno || 'Alumno';
    const nuevo = reportTechnicalLevelForRender(f.nivel_reportado);
    const marcaRevisar = (f.prioridades || []).includes('Revisar nivel');
    if (marcaRevisar && nuevo && !f.nivel_revision && diasEntre(f.fecha, hoyIso) <= DIAS_AVISO_NIVEL) {
      const anterior = nivelAnteriorDeFila(f);
      if (anterior !== nuevo) {
        conNivelPendiente.add(f.alumno_id);
        avisosNivel.push({
          tipo: 'nivel',
          id: `nivel:${f.reporte_id}`,
          reporteId: f.reporte_id,
          alumnoId: f.alumno_id,
          alumno: nombre,
          fecha: f.fecha,
          entrenador: f.entrenador,
          modalidad: f.modalidad,
          nivelNuevo: nuevo,
          nivelAnterior: anterior,
          sube: anterior ? orden(nuevo) > orden(anterior) : true,
          puedeDeshacer: Boolean(f.es_ultimo_del_alumno),
        });
      }
    }
    const incidencia = String(f.incidencia || '').trim();
    if (
      incidencia &&
      incidencia !== 'Sin incidencia' &&
      !f.incidencia_revisada_at &&
      diasEntre(f.fecha, hoyIso) <= DIAS_AVISO_INCIDENCIA
    ) {
      avisosIncidencia.push({
        tipo: 'incidencia',
        id: `inc:${f.reporte_id}`,
        reporteId: f.reporte_id,
        alumnoId: f.alumno_id,
        alumno: nombre,
        fecha: f.fecha,
        entrenador: f.entrenador,
        modalidad: f.modalidad,
        incidencia: String(f.incidencia_comentario || '').trim() || incidencia,
      });
    }
  });

  // Candidatos a subir: todos los focos de su nivel actual conseguidos.
  const porAlumno = new Map<string, FilaAvisoReporte[]>();
  filas.forEach((f) => porAlumno.set(f.alumno_id, [...(porAlumno.get(f.alumno_id) || []), f]));
  const avisosCandidato: AvisoCoordinacion[] = [];
  porAlumno.forEach((suyas, alumnoId) => {
    if (conNivelPendiente.has(alumnoId)) return;
    const ordenadas = [...suyas].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
    const nivel =
      reportTechnicalLevelForRender(ordenadas[0]?.nivel_actual) ||
      reportTechnicalLevelForRender(ordenadas[0]?.nivel_reportado);
    if (!nivel) return;
    const i = orden(nivel);
    if (i < 0 || i >= TECHNICAL_LEVELS.length - 1) return;
    if (candidatosVistos.has(claveCandidato(alumnoId, nivel))) return;
    const historial = ordenadas.map(
      (f) =>
        ({
          reporte_id: f.reporte_id,
          fecha: f.fecha,
          modalidad: f.modalidad,
          nivel_reportado: f.nivel_reportado,
          evaluacion_tecnica: f.evaluacion_tecnica,
        }) as unknown as HistorialReporteAlumnoFichaApp
    );
    const focos = progresoHabilidadesNivel(historial, nivel).filter((p) => p.habilidad.foco);
    if (focos.length === 0 || focos.length !== FOCOS_POR_NIVEL[nivel].length) return;
    if (!focos.every((p) => p.estado === 'conseguido')) return;
    avisosCandidato.push({
      tipo: 'candidato',
      id: claveCandidato(alumnoId, nivel),
      alumnoId,
      alumno: ordenadas[0]?.alumno || 'Alumno',
      nivel,
      siguiente: TECHNICAL_LEVELS[i + 1],
      focos: focos.length,
    });
  });

  return [...avisosNivel, ...avisosIncidencia, ...avisosCandidato];
}
