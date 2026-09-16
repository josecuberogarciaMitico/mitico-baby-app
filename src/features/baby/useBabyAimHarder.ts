import { useEffect, useState } from 'react';
import {
  assessRosterRefresh,
  normalizeRosterName as normalizarNombreFueraPlazoAgenda,
  planRosterCleanup,
  verifyRosterSnapshot,
} from '../../core/sessions/rosterSync';
import {
  babyClassHours as horasClaseBabyAimHarder,
  normalizeBabyAttendees,
  selectMiticoBox,
  uniqueBabyClasses,
} from '../../services/aimharder/aimHarderContract';
import type {
  AimHarderBox,
  BabyAimHarderAsistenteActivoApp,
  BabyAimHarderClaseApp,
  BabyAimHarderLecturaApp,
  BabyAimHarderRefrescoResultadoApp,
  BabyAimHarderSafetyApp,
  BabyAimHarderVerificacionRefrescoApp,
  DatosContactoAimHarderApp,
} from '../../services/aimharder/aimHarderContract';
import {
  buildBabyRefreshSummary,
  planBabyWeekSlots,
  selectExactBabyClass,
} from '../../services/aimharder/aimHarderOperations';
import { fechaAgendaCortaConAnio, inicioSemanaAgenda, rangoSemanaAgenda } from '../agenda/agendaCalendar';
import type { AgendaAlumnoSesionApp, SesionAgendaOperativa } from '../agenda/agendaTypes';

type BabyAimHarderDependencies = {
  agendaForm: {
    modalidad?: string;
    fecha: string;
    hora_inicio: string;
    hora_fin: string;
  };
  cargarAgendaOperativaDirecta: () => Promise<unknown>;
  cargarDetalleSesionAgenda: (
    sesionId: string,
    options?: Record<string, boolean>
  ) => Promise<unknown>;
  cargarListados: () => Promise<unknown>;
  consultarSupabase: <T>(resource: string, query?: string) => Promise<T[]>;
  ejecutarFuncion: (name: string, body?: Record<string, unknown>) => Promise<void>;
  ejecutarFuncionAuthJson: <T>(name: string, body?: Record<string, unknown>) => Promise<T>;
  horaCorta: (value: string | null | undefined) => string;
  obtenerAccessTokenSupabaseApp: () => Promise<string>;
  semanaAgendaActiva: string;
  setAgendaForm: (updater: (previous: any) => any) => void;
  setError: (message: string) => void;
  setUltimoListadoAimHarder: (value: any) => void;
  supabaseAnonKey: string;
  supabaseUrl: string;
};

export function useBabyAimHarder(ctx: BabyAimHarderDependencies) {
  const {
    agendaForm,
    cargarAgendaOperativaDirecta,
    cargarDetalleSesionAgenda,
    cargarListados,
    consultarSupabase,
    ejecutarFuncion,
    ejecutarFuncionAuthJson,
    horaCorta,
    obtenerAccessTokenSupabaseApp,
    semanaAgendaActiva,
    setAgendaForm,
    setError,
    setUltimoListadoAimHarder,
    supabaseAnonKey,
    supabaseUrl,
  } = ctx;
  const [babyAimHarderCargandoSemana, setBabyAimHarderCargandoSemana] = useState(false);
  const [babyAimHarderSesionCargandoId, setBabyAimHarderSesionCargandoId] = useState('');
  const [babyAimHarderFormularioCargando, setBabyAimHarderFormularioCargando] = useState(false);
  const [babyAimHarderMensaje, setBabyAimHarderMensaje] = useState('');
  const [babyAimHarderError, setBabyAimHarderError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const recibirListadoAimHarder = (evento: Event) => {
      const detalle = (evento as CustomEvent<any>).detail || {};
      const modalidad = String(detalle.modalidad || '').trim().toUpperCase();
      if (modalidad !== 'BABY') return;

      const asistentes: Record<string, DatosContactoAimHarderApp> = {};
      const filas = Array.isArray(detalle.asistentes) ? detalle.asistentes : [];

      filas.forEach((fila: any) => {
        const nombre = String(fila?.name || '').trim();
        const clave = normalizarNombreFueraPlazoAgenda(nombre);
        if (!clave) return;

        asistentes[clave] = {
          nombre,
          telefono: String(fila?.phone || '').trim(),
          fechaNacimiento: String(fila?.birthDate || '').trim(),
          clientId: String(fila?.clientId || '').trim(),
        };
      });

      setUltimoListadoAimHarder({
        fecha: String(detalle.fecha || '').slice(0, 10),
        horaInicio: String(detalle.inicio || '').slice(0, 5),
        horaFin: String(detalle.fin || '').slice(0, 5),
        modalidad,
        asistentes,
      });
    };

    window.addEventListener(
      'mitico:aimharder-attendees',
      recibirListadoAimHarder as EventListener
    );

    return () => {
      window.removeEventListener(
        'mitico:aimharder-attendees',
        recibirListadoAimHarder as EventListener
      );
    };
  }, []);
  async function llamarAimHarderLecturaBabyApp(
    body: Record<string, unknown>
  ): Promise<any> {
    const accessToken = await obtenerAccessTokenSupabaseApp();
    const respuesta = await fetch(
      `${supabaseUrl}/functions/v1/mitico-aimharder-baby-read`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: supabaseAnonKey,
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      }
    );

    const texto = await respuesta.text();
    let datos: any = {};

    try {
      datos = texto ? JSON.parse(texto) : {};
    } catch {
      throw new Error(
        `AimHarder Baby devolvió una respuesta no válida (HTTP ${respuesta.status}).`
      );
    }

    if (!respuesta.ok) {
      throw new Error(
        typeof datos?.error === 'string'
          ? datos.error
          : `Error ${respuesta.status} consultando AimHarder Baby.`
      );
    }

    return datos;
  }


  async function centroAimHarderBabyApp() {
    const boxes = await llamarAimHarderLecturaBabyApp({ action: 'boxes' });
    const listaBoxes = Array.isArray(boxes?.boxes)
      ? (boxes.boxes as AimHarderBox[])
      : [];
    return selectMiticoBox(listaBoxes);
  }

  async function clasesBabySemanaAimHarderApp(
    semanaInicio: string,
    boxId: number
  ): Promise<BabyAimHarderClaseApp[]> {
    const semana = await llamarAimHarderLecturaBabyApp({
      action: 'week',
      weekStart: semanaInicio,
      boxId,
    });

    // Este endpoint es exclusivo de Baby y ya filtra las clases en backend.
    const raw = Array.isArray(semana?.classes)
      ? (semana.classes as BabyAimHarderClaseApp[])
      : [];
    return uniqueBabyClasses(raw);
  }

  async function asistentesActivosClaseBabyAimHarderApp(
    clase: BabyAimHarderClaseApp,
    boxId: number
  ): Promise<BabyAimHarderLecturaApp> {
    // ÚNICO MOTOR BABY: los tres botones Baby usan exclusivamente
    // mitico-aimharder-baby-read. Ocio e Intensivos siguen con su lector actual.
    const detalle = await llamarAimHarderLecturaBabyApp({
      action: 'attendees',
      date: String(clase.date || '').slice(0, 10),
      classId: Number(clase.id),
      className: String(clase.className || ''),
      time: String(clase.time || ''),
      timeid: String(clase.timeid || ''),
      boxId,
    });

    const asistentes = normalizeBabyAttendees(
      detalle?.attendees,
      detalle?.total
    );

    const safety: BabyAimHarderSafetyApp =
      detalle?.safety && typeof detalle.safety === 'object'
        ? detalle.safety
        : {};

    // El campo de ocupación del listado semanal NO se usa para borrar alumnos:
    // en AimHarder puede venir a 0 aunque existan reservas activas.
    clase.ocupation = asistentes.length;

    return { asistentes, safety };
  }

  function emitirListadoBabyAimHarderAgenda(
    clase: BabyAimHarderClaseApp,
    asistentes: BabyAimHarderAsistenteActivoApp[]
  ) {
    const horas = horasClaseBabyAimHarder(clase);
    window.dispatchEvent(
      new CustomEvent('mitico:aimharder-attendees', {
        detail: {
          fecha: String(clase.date || '').slice(0, 10),
          inicio: horas.inicio,
          fin: horas.fin,
          modalidad: 'BABY',
          asistentes,
        },
      })
    );
  }

  async function obtenerListadoBabyTurnoAimHarderApp(
    fecha: string,
    horaInicio: string,
    horaFin: string
  ): Promise<{
    clase: BabyAimHarderClaseApp;
    asistentes: BabyAimHarderAsistenteActivoApp[];
    safety: BabyAimHarderSafetyApp;
  }> {
    const fechaLimpia = String(fecha || '').slice(0, 10);
    const inicio = horaCorta(horaInicio);
    const fin = horaCorta(horaFin);

    if (!fechaLimpia || !inicio || !fin) {
      throw new Error(
        'No puedo identificar con seguridad la fecha y el horario del turno Baby.'
      );
    }

    const box = await centroAimHarderBabyApp();
    const clases = await clasesBabySemanaAimHarderApp(
      inicioSemanaAgenda(fechaLimpia),
      Number(box.boid)
    );

    const clase = selectExactBabyClass(
      clases,
      fechaLimpia,
      inicio,
      fin,
      fechaAgendaCortaConAnio(fechaLimpia)
    );
    const lectura = await asistentesActivosClaseBabyAimHarderApp(
      clase,
      Number(box.boid)
    );
    const asistentes = lectura.asistentes;

    emitirListadoBabyAimHarderAgenda(clase, asistentes);
    return { clase, asistentes, safety: lectura.safety };
  }

  async function traerListadoBabyTurnoAgendaDesdeAimHarder() {
    if (String(agendaForm.modalidad || '').trim().toUpperCase() !== 'BABY') {
      return;
    }

    setBabyAimHarderFormularioCargando(true);
    setBabyAimHarderMensaje('');
    setBabyAimHarderError('');
    setError('');

    try {
      const { asistentes } = await obtenerListadoBabyTurnoAimHarderApp(
        agendaForm.fecha,
        agendaForm.hora_inicio,
        agendaForm.hora_fin
      );
      const textoListado = asistentes.map((asistente) => asistente.name).join('\n');

      setAgendaForm((anterior) => ({
        ...anterior,
        texto_listado: textoListado,
      }));

      setBabyAimHarderMensaje(
        `✓ TRAER LISTADO · AimHarder: ${asistentes.length} alumno(s) activo(s) · ` +
          `${asistentes.length > 0 ? 'listado preparado' : 'listado vacío'} · ` +
          'cancelados excluidos · la sesión NO se ha modificado'
      );
    } catch (e) {
      setBabyAimHarderError(
        e instanceof Error
          ? e.message
          : 'No se pudo traer este turno Baby desde AimHarder.'
      );
    } finally {
      setBabyAimHarderFormularioCargando(false);
    }
  }

  async function cargarSemanaBabyDesdeAimHarder() {
    if (!semanaAgendaActiva) {
      setBabyAimHarderError('Selecciona primero una semana de trabajo.');
      return;
    }

    setBabyAimHarderCargandoSemana(true);
    setBabyAimHarderMensaje('');
    setBabyAimHarderError('');

    try {
      const box = await centroAimHarderBabyApp();
      const clases = await clasesBabySemanaAimHarderApp(
        semanaAgendaActiva,
        Number(box.boid)
      );

      if (clases.length === 0) {
        setBabyAimHarderError(
          `AimHarder no devuelve ninguna clase Baby en la semana ${rangoSemanaAgenda(
            semanaAgendaActiva
          )}.`
        );
        return;
      }

      let creadas = 0;
      let yaExistentes = 0;
      let sinReservas = 0;
      let turnosLeidos = 0;
      let alumnosActivosLeidos = 0;
      const incidencias: string[] = [];

      // El CORE agrupa por fecha + inicio y excluye cualquier turno ambiguo.
      const planSemana = planBabyWeekSlots(clases);
      incidencias.push(...planSemana.issues);

      for (const turno of planSemana.slots) {
        const { date: fecha, start: horaInicio, classData: clase } = turno;

        try {
          const horas = horasClaseBabyAimHarder(clase);
          const lectura = await asistentesActivosClaseBabyAimHarderApp(
            clase,
            Number(box.boid)
          );
          const asistentes = lectura.asistentes;

          turnosLeidos += 1;
          alumnosActivosLeidos += asistentes.length;
          emitirListadoBabyAimHarderAgenda(clase, asistentes);

          if (asistentes.length === 0) {
            sinReservas += 1;
            continue;
          }

          // IMPORTANTE: carga inicial ≠ refresco.
          // Esta RPC crea SOLO si no existe ya una sesión Baby con la misma
          // fecha + hora de inicio. Si existe, la deja totalmente intacta.
          const resultado =
            await ejecutarFuncionAuthJson<{
              sesion_id?: string | null;
              creada?: boolean;
              ya_existia?: boolean;
              total_actual?: number;
            }>('cargar_sesion_baby_aimharder_inicial_app', {
              p_fecha: fecha,
              p_hora_inicio: horas.inicio,
              p_hora_fin: horas.fin,
              p_lugar: 'Madrid SnowZone',
              p_texto_listado: asistentes.map((a) => a.name).join('\n'),
            });

          if (resultado?.creada) {
            creadas += 1;
          } else if (resultado?.ya_existia) {
            yaExistentes += 1;
          }
        } catch (e) {
          incidencias.push(
            `${fecha} ${horaInicio}: ${
              e instanceof Error ? e.message : 'No se pudo cargar este turno.'
            }`
          );
        }
      }

      await cargarAgendaOperativaDirecta();
      await cargarListados();

      const partes = [
        `✓ CARGAR SEMANA · ${turnosLeidos} turno(s) Baby leído(s)`,
        `${alumnosActivosLeidos} alumno(s) activo(s) en AimHarder`,
        `${creadas} sesión(es) nueva(s) creada(s)`,
        `${yaExistentes} sesión(es) ya existente(s) sin modificar`,
        `${sinReservas} turno(s) con 0 activos`,
        'cancelados excluidos',
      ];

      setBabyAimHarderMensaje(partes.join(' · '));

      if (incidencias.length > 0) {
        setBabyAimHarderError(
          `Hay ${incidencias.length} turno(s) que necesitan revisión. ${incidencias.join(
            ' | '
          )}`
        );
      }
    } catch (e) {
      setBabyAimHarderError(
        e instanceof Error
          ? e.message
          : 'No se pudo cargar la semana Baby desde AimHarder.'
      );
    } finally {
      setBabyAimHarderCargandoSemana(false);
    }
  }

  async function verificarYLimpiarSesionBabyTrasRefrescoAimHarderApp(
    sesionId: string,
    asistentes: BabyAimHarderAsistenteActivoApp[],
    protegidosIniciales: string[]
  ): Promise<BabyAimHarderVerificacionRefrescoApp> {
    const filtroSesion = encodeURIComponent(`eq.${sesionId}`);
    const leerSesion = () =>
      consultarSupabase<AgendaAlumnoSesionApp>(
        'v_sesion_alumnos_operativa_app',
        `select=*&sesion_id=${filtroSesion}&order=orden.asc`
      );

    const protegidos = new Set(
      (protegidosIniciales || [])
        .map((nombre) => normalizarNombreFueraPlazoAgenda(nombre || ''))
        .filter(Boolean)
    );

    let actuales = await leerSesion();
    const planLimpieza = planRosterCleanup(
      actuales.map((alumno) => ({
        id: alumno.sesion_alumno_id,
        name: alumno.alumno,
      })),
      asistentes.map((asistente) => asistente.name),
      protegidosIniciales
    );

    if (planLimpieza.status === 'BLOCKED') {
      throw new Error(
        `Refresco bloqueado: faltan en la sesión ${planLimpieza.missingActiveNames.length} alumno(s) que AimHarder marca como activo(s): ${planLimpieza.missingActiveNames.join(
          ', '
        )}. No se ha eliminado ningún alumno por seguridad.`
      );
    }

    const retiradosExtra: string[] = [];
    const protegidosExtra: string[] = [];

    for (const alumno of planLimpieza.removable) {
      try {
        // Función ya existente y protegida: rechaza el borrado si el alumno
        // tiene asistencia real o reporte en esta sesión.
        await ejecutarFuncion('quitar_alumno_sesion_aimharder_sync_app', {
          p_sesion_alumno_id: alumno.id,
        });
        retiradosExtra.push(alumno.name);
      } catch (errorQuitar) {
        const mensaje =
          errorQuitar instanceof Error
            ? errorQuitar.message
            : 'No se pudo quitar el alumno de la sesión.';

        if (/asistencia real|reporte/i.test(mensaje)) {
          protegidos.add(normalizarNombreFueraPlazoAgenda(alumno.name));
          protegidosExtra.push(alumno.name);
          continue;
        }

        throw new Error(
          `AimHarder ya no incluye a ${alumno.name}, pero no se pudo retirarlo automáticamente de la sesión: ${mensaje}`
        );
      }
    }

    actuales = await leerSesion();
    const verificacion = verifyRosterSnapshot(
      actuales.map((alumno) => ({
        id: alumno.sesion_alumno_id,
        name: alumno.alumno,
      })),
      asistentes.map((asistente) => asistente.name),
      Array.from(protegidos)
    );

    if (!verificacion.matches) {
      const partes: string[] = [];
      if (verificacion.missingActiveNames.length > 0) {
        partes.push(
          `faltan activos: ${verificacion.missingActiveNames.join(', ')}`
        );
      }
      if (verificacion.unexpectedMembers.length > 0) {
        partes.push(
          `siguen sobrando: ${verificacion.unexpectedMembers
            .map((alumno) => alumno.name)
            .join(', ')}`
        );
      }
      throw new Error(
        `La sesión no ha quedado sincronizada con AimHarder (${partes.join(
          ' · '
        )}). No se muestra el refresco como correcto.`
      );
    }

    return {
      totalFinal: actuales.length,
      retiradosExtra,
      protegidosExtra,
    };
  }

  async function refrescarSesionBabyDesdeAimHarder(
    sesion: SesionAgendaOperativa
  ) {
    if (
      sesion.origen !== 'operativa' ||
      !sesion.agendaDirecta ||
      String(sesion.modalidad || '').trim().toUpperCase() !== 'BABY'
    ) {
      return;
    }

    const sesionId = sesion.agendaDirecta.sesion_id;
    const fecha = sesion.fecha;
    const inicioSesion = horaCorta(sesion.hora_inicio);
    const finSesion = horaCorta(sesion.hora_fin);

    setBabyAimHarderSesionCargandoId(sesionId);
    setBabyAimHarderMensaje('');
    setBabyAimHarderError('');

    try {
      // Mismo lector exacto que usa el turno individual. No existe un parser
      // alternativo para Refrescar listado.
      const { asistentes, safety } = await obtenerListadoBabyTurnoAimHarderApp(
        fecha,
        inicioSesion,
        finSesion
      );

      // PREVUELO ANTI-BORRADO:
      // antes de tocar la sesión, cualquier alumno que vaya a salir debe aparecer
      // explícitamente como cancelado en la respuesta de la clase exacta.
      const existentesAntes = await consultarSupabase<AgendaAlumnoSesionApp>(
        'v_sesion_alumnos_operativa_app',
        `select=*&sesion_id=${encodeURIComponent(`eq.${sesionId}`)}&order=orden.asc`
      );
      const preflight = assessRosterRefresh(
        existentesAntes.map((alumno) => ({
          id: alumno.sesion_alumno_id,
          name: alumno.alumno,
        })),
        {
          activeNames: asistentes.map((asistente) => asistente.name),
          cancelledNames: safety.cancelledNames || [],
          safeZero: safety.safeZero === true,
        }
      );

      if (preflight.status === 'BLOCKED') {
        throw new Error(
          `Refresco bloqueado por seguridad: ${preflight.issues.join(
            ' '
          )} No se ha eliminado nadie.`
        );
      }

      const resultado = await ejecutarFuncionAuthJson<BabyAimHarderRefrescoResultadoApp>(
        'refrescar_sesion_baby_aimharder_app',
        {
          p_sesion_id: sesionId,
          p_texto_listado: asistentes.map((a) => a.name).join('\n'),
        }
      );

      // Segunda garantía: comprobamos directamente "Alumnos detectados".
      // Cualquier alumno que ya no esté activo en AimHarder se retira de forma
      // automática salvo que la función segura detecte asistencia o reporte.
      const verificacion =
        await verificarYLimpiarSesionBabyTrasRefrescoAimHarderApp(
          sesionId,
          asistentes,
          resultado?.nombres_protegidos || []
        );

      await cargarAgendaOperativaDirecta();
      await cargarListados();
      await cargarDetalleSesionAgenda(sesionId, {
        preservarPropuesta: true,
        preservarScroll: true,
      });

      setBabyAimHarderMensaje(
        buildBabyRefreshSummary(asistentes.length, resultado, verificacion)
      );
    } catch (e) {
      setBabyAimHarderError(
        e instanceof Error
          ? e.message
          : 'No se pudo refrescar esta sesión Baby desde AimHarder.'
      );
    } finally {
      setBabyAimHarderSesionCargandoId('');
    }
  }


  return {
    babyAimHarderCargandoSemana,
    babyAimHarderSesionCargandoId,
    babyAimHarderFormularioCargando,
    babyAimHarderMensaje,
    babyAimHarderError,
    setBabyAimHarderFormularioCargando,
    setBabyAimHarderMensaje,
    setBabyAimHarderError,
    obtenerListadoBabyTurnoAimHarderApp,
    traerListadoBabyTurnoAgendaDesdeAimHarder,
    cargarSemanaBabyDesdeAimHarder,
    refrescarSesionBabyDesdeAimHarder,
  };
}
