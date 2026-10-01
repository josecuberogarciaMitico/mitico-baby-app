/**
 * Ficha única (fase 2, 01/10/2026): estado de cada habilidad del nivel actual
 * a partir del historial de reportes, igual para Baby, Ocio e Intensivos.
 *
 * Reglas acordadas con Jose:
 * - Escala que se muestra: Todavía no / A veces / Lo consigue.
 * - Reportes antiguos: «Correcto» cuenta como «A veces».
 * - Conseguido = «Lo consigue» en las 2 últimas valoraciones, en días distintos.
 *   Si después baja, deja de estar conseguido («Va apareciendo» o «Todavía no»).
 * - Solo cuentan los reportes hechos en el nivel actual: al subir de nivel, lo
 *   repetido empieza de cero.
 */
import { habilidadesDelNivel, reportTechnicalLevelForRender, type HabilidadNivel } from '../../lib/adaptiveReport';
import type { HistorialReporteAlumnoFichaApp } from './reportTypes';

export type PuntosHabilidad = 0 | 1 | 2;
export type EstadoHabilidad = 'conseguido' | 'va_apareciendo' | 'todavia_no' | 'sin_ver';

export const ETIQUETA_PASO: Record<PuntosHabilidad, string> = {
  0: 'Todavía no',
  1: 'A veces',
  2: 'Lo consigue',
};

export const ETIQUETA_ESTADO: Record<EstadoHabilidad, string> = {
  conseguido: 'Conseguido',
  va_apareciendo: 'Va apareciendo',
  todavia_no: 'Todavía no',
  sin_ver: 'Sin ver aún',
};

/** Valor guardado → paso de la escala de 3. «No trabajado» o desconocido = no visto. */
export function puntosDeValor(valor: string | null | undefined): PuntosHabilidad | null {
  if (valor === 'Necesita mejorar') return 0;
  if (valor === 'En desarrollo' || valor === 'Correcto') return 1;
  if (valor === 'Consolidado') return 2;
  return null;
}

export type ValoracionHabilidad = {
  fecha: string;
  puntos: PuntosHabilidad;
  modalidad: string | null;
};

/** Estado a partir de las valoraciones (cualquier orden; una por día, la más reciente). */
export function estadoHabilidad(valoraciones: ValoracionHabilidad[]): EstadoHabilidad {
  const porDia = valoracionesPorDia(valoraciones);
  if (porDia.length === 0) return 'sin_ver';
  if (porDia.length >= 2 && porDia[0].puntos === 2 && porDia[1].puntos === 2) return 'conseguido';
  if (porDia[0].puntos === 0) return 'todavia_no';
  return 'va_apareciendo';
}

/** Ordena de más reciente a más antigua y deja una valoración por día. */
export function valoracionesPorDia(valoraciones: ValoracionHabilidad[]): ValoracionHabilidad[] {
  const ordenadas = [...valoraciones].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)));
  const vistos = new Set<string>();
  return ordenadas.filter((v) => {
    if (vistos.has(v.fecha)) return false;
    vistos.add(v.fecha);
    return true;
  });
}

export type ProgresoHabilidad = {
  habilidad: HabilidadNivel;
  estado: EstadoHabilidad;
  /** Una por día, de más reciente a más antigua. */
  valoraciones: ValoracionHabilidad[];
};

/**
 * Habilidades del nivel (focos primero) con su estado, usando solo los
 * reportes hechos en ese nivel. `reports` debe venir ordenado de más
 * reciente a más antiguo (como sortReportHistory) para elegir bien el del día.
 */
export function progresoHabilidadesNivel(
  reports: HistorialReporteAlumnoFichaApp[],
  nivel: string | null | undefined
): ProgresoHabilidad[] {
  const level = reportTechnicalLevelForRender(nivel);
  if (!level) return [];
  const delNivel = reports.filter((r) => reportTechnicalLevelForRender(r.nivel_reportado) === level);
  return habilidadesDelNivel(level).map((habilidad) => {
    const valoraciones: ValoracionHabilidad[] = [];
    delNivel.forEach((r) => {
      const puntos = puntosDeValor(r.evaluacion_tecnica?.[habilidad.id]);
      if (puntos !== null && r.fecha) valoraciones.push({ fecha: r.fecha, puntos, modalidad: r.modalidad });
    });
    return { habilidad, estado: estadoHabilidad(valoraciones), valoraciones: valoracionesPorDia(valoraciones) };
  });
}

/** Resumen corto para la cabecera de la ficha. */
export function resumenProgreso(progreso: ProgresoHabilidad[]) {
  const focos = progreso.filter((p) => p.habilidad.foco);
  return {
    focos: focos.length,
    focosConseguidos: focos.filter((p) => p.estado === 'conseguido').length,
    sinVer: progreso.filter((p) => p.estado === 'sin_ver').length,
  };
}
