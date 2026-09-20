import { useState } from 'react';
import type { AlumnoReporteEntrenador } from '../../core/sessions/operationalTypes';
import type { AgendaGrupoSesionApp } from './agendaTypes';

type RepartoManualGrupoAgendaDependencies = {
  alumnosReporteEntrenador: AlumnoReporteEntrenador[];
  agendaSesionActivaId: string;
  cargarAgendaOperativaDirecta: () => Promise<unknown>;
  cargarCobros: () => Promise<unknown>;
  cargarDetalleSesionAgenda: (sesionId: string) => Promise<unknown>;
  cargarGruposEntrenador: () => Promise<unknown>;
  cargarPlanning: () => Promise<unknown>;
  cargarReportesPendientes: () => Promise<unknown>;
  ejecutarFuncion: (nombreFuncion: string, body: object) => Promise<void>;
  setCargando: (value: boolean) => void;
  setError: (message: string) => void;
};

/**
 * Reparto manual de reportes/niños para grupos con segundo entrenador
 * (pantalla de edición del grupo ya creado, Agenda). Permite elegir a mano
 * qué entrenador hace el reporte de cada niño en vez de dejarlo siempre
 * al reparto automático.
 *
 * Extraído de App.tsx (app 102) para mantener App.tsx como cascarón/orquestador.
 */
export function useRepartoManualGrupoAgenda(
  ctx: RepartoManualGrupoAgendaDependencies
) {
  const {
    alumnosReporteEntrenador,
    agendaSesionActivaId,
    cargarAgendaOperativaDirecta,
    cargarCobros,
    cargarDetalleSesionAgenda,
    cargarGruposEntrenador,
    cargarPlanning,
    cargarReportesPendientes,
    ejecutarFuncion,
    setCargando,
    setError,
  } = ctx;

  const [responsablesManualesGrupoAgenda, setResponsablesManualesGrupoAgenda] =
    useState<Record<string, string>>({});

  function alumnosDelGrupoCreadoApp(grupoId: string) {
    const vistos = new Set<string>();
    return alumnosReporteEntrenador
      .filter((alumno) => alumno.grupo_id === grupoId)
      .filter((alumno) => {
        if (vistos.has(alumno.alumno_id)) return false;
        vistos.add(alumno.alumno_id);
        return true;
      })
      .sort((a, b) => a.alumno.localeCompare(b.alumno, 'es'));
  }

  function responsableManualGrupoCreadoApp(
    grupoId: string,
    alumnoId: string,
    entrenadorIdActual: string | null
  ) {
    const clave = `${grupoId}__${alumnoId}`;
    return responsablesManualesGrupoAgenda[clave] || entrenadorIdActual || '';
  }

  async function guardarRepartoManualGrupoAgenda(
    grupo: AgendaGrupoSesionApp
  ) {
    if (!grupo.grupo_id || !grupo.entrenador_apoyo_id) return;

    const alumnosGrupo = alumnosDelGrupoCreadoApp(grupo.grupo_id);
    if (alumnosGrupo.length === 0) {
      setError(
        'No se encontró la lista de niños de este grupo. Actualiza la página e inténtalo de nuevo.'
      );
      return;
    }

    const responsables = alumnosGrupo.map((alumno) => ({
      alumno_id: alumno.alumno_id,
      entrenador_id: responsableManualGrupoCreadoApp(
        grupo.grupo_id,
        alumno.alumno_id,
        alumno.entrenador_id
      ),
    }));

    if (responsables.some((responsable) => !responsable.entrenador_id)) {
      setError('Falta asignar entrenador a algún niño del reparto.');
      return;
    }

    const confirmar = window.confirm(
      `¿Guardar este reparto manual de niños para ${grupo.nombre_grupo}?`
    );

    if (!confirmar) return;

    setCargando(true);
    setError('');

    try {
      await ejecutarFuncion('guardar_apoyo_reportes_grupo_app', {
        p_grupo_id: grupo.grupo_id,
        p_entrenador_apoyo_id: grupo.entrenador_apoyo_id,
        p_responsables: responsables,
      });

      setResponsablesManualesGrupoAgenda((actual) => {
        const copia = { ...actual };
        Object.keys(copia)
          .filter((clave) => clave.startsWith(`${grupo.grupo_id}__`))
          .forEach((clave) => delete copia[clave]);
        return copia;
      });

      if (agendaSesionActivaId) {
        await cargarDetalleSesionAgenda(agendaSesionActivaId);
      }
      await cargarAgendaOperativaDirecta();
      await cargarGruposEntrenador();
      await cargarReportesPendientes();
      await cargarPlanning();
      await cargarCobros();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Error guardando el reparto manual de reportes'
      );
    }

    setCargando(false);
  }

  return {
    responsablesManualesGrupoAgenda,
    setResponsablesManualesGrupoAgenda,
    alumnosDelGrupoCreadoApp,
    responsableManualGrupoCreadoApp,
    guardarRepartoManualGrupoAgenda,
  };
}
