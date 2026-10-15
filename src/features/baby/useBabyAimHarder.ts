import { useEffect, useState } from 'react';
import {
  assessRosterRefresh,
  findListImportIdentityConflicts,
  normalizeNameLikeListImport,
  normalizeRosterName as normalizarNombreFueraPlazoAgenda,
  planAddOnlyRosterRefresh,
  planRosterCleanup,
  verifyRosterSnapshot,
} from '../../core/sessions/rosterSync';
import type { ListImportFicha } from '../../core/sessions/rosterSync';
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
  buildBabyAddOnlySummary,
  buildBabyRefreshSummary,
  describirConfirmacionSoloAnadirBaby,
  describirFrescuraAimHarderBabyApp,
  describirRepasoSolicitadoBabyApp,
  planBabyWeekSlots,
  selectExactBabyClass,
} from '../../services/aimharder/aimHarderOperations';
import type { BabyAddOnlyResult } from '../../services/aimharder/aimHarderOperations';
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

  // Datos de contacto (teléfono y fecha de nacimiento) de un niño de un turno
  // Baby concreto, leídos al momento de AimHarder. Se usa al pulsar
  // "Crear Alta / Test" cuando el último listado en memoria no es de ese turno
  // (p. ej. tras "Cargar semana", que lee varios turnos, o tras recargar).
  async function buscarDatosContactoBabyAimHarderApp(
    fecha: string,
    horaInicio: string,
    horaFin: string,
    nombreAlumno: string
  ): Promise<DatosContactoAimHarderApp | null> {
    const clave = normalizarNombreFueraPlazoAgenda(nombreAlumno || '');
    if (!clave) return null;
    try {
      const { asistentes } = await obtenerListadoBabyTurnoAimHarderApp(
        fecha,
        horaInicio,
        horaFin
      );
      const encontrado = asistentes.find(
        (asistente) => normalizarNombreFueraPlazoAgenda(asistente.name) === clave
      );
      if (!encontrado) return null;
      return {
        nombre: String(encontrado.name || '').trim(),
        telefono: String(encontrado.phone || '').trim(),
        fechaNacimiento: String(encontrado.birthDate || '').trim(),
        clientId: String(encontrado.clientId || '').trim(),
      };
    } catch {
      return null;
    }
  }

  // Un alumno que YA estaba guardado en la sesión Mítico pero que no sale
  // como activo en la última lectura de AimHarder puede significar dos
  // cosas: que de verdad se ha dado de baja, o que la copia interna que usa
  // Mítico todavía no ha repasado su reserva (AimHarder no tiene un endpoint
  // para "quién está apuntado a esta clase": solo se puede repasar cliente a
  // cliente). Esta función pide ese repaso ya mismo, con el mismo mecanismo
  // seguro que usa "Alta/Test" (aimharder_contacto_alumno_app), sin tocar en
  // ningún momento el candado de seguridad que decide si se borra a alguien.
  // Es un intento "a mejor esfuerzo": si falla, no bloquea el refresco real.
  async function solicitarRepasoAlumnosNoActivosBabyApp(
    sesionId: string,
    asistentesActivos: BabyAimHarderAsistenteActivoApp[]
  ): Promise<{ solicitados: string[]; noEncontrados: string[] }> {
    const activos = new Set(
      asistentesActivos
        .map((asistente) => normalizarNombreFueraPlazoAgenda(asistente.name))
        .filter(Boolean)
    );

    let actuales: AgendaAlumnoSesionApp[] = [];
    try {
      actuales = await consultarSupabase<AgendaAlumnoSesionApp>(
        'v_sesion_alumnos_operativa_app',
        `select=*&sesion_id=${encodeURIComponent(`eq.${sesionId}`)}&order=orden.asc`
      );
    } catch {
      return { solicitados: [], noEncontrados: [] };
    }

    const pendientes = actuales.filter((alumno) => {
      const clave = normalizarNombreFueraPlazoAgenda(alumno.alumno || '');
      return Boolean(clave) && !activos.has(clave);
    });

    const solicitados: string[] = [];
    const noEncontrados: string[] = [];
    for (const alumno of pendientes) {
      try {
        // Misma RPC que usa aimHarderContactService (Alta/Test), llamada con el
        // cliente que ya recibe este hook: así este archivo no arrastra la
        // configuración de Vite (import.meta.env) a la compilación de test:core.
        const filas = await ejecutarFuncionAuthJson<
          Array<{ coincidencias?: number | null }>
        >('aimharder_contacto_alumno_app', { p_nombre: alumno.alumno });
        const contacto = Array.isArray(filas) ? filas[0] : null;
        if (contacto && Number(contacto.coincidencias) === 1) {
          solicitados.push(alumno.alumno);
        } else {
          noEncontrados.push(alumno.alumno);
        }
      } catch {
        // Comprobación puntual: si falla para un alumno concreto, se
        // omite ese nombre del aviso en vez de interrumpir el refresco.
      }
    }
    return { solicitados, noEncontrados };
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
      const { asistentes, safety } = await obtenerListadoBabyTurnoAimHarderApp(
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
        'cancelados excluidos · la sesión NO se ha modificado · ' +
        describirFrescuraAimHarderBabyApp(safety)
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
      let refrescadas = 0;
      let yaAlDia = 0;
      let alumnosAnadidos = 0;
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

          // Esta RPC crea SOLO si no existe ya una sesión Baby con la misma
          // fecha + hora de inicio. Si existe, devuelve su id sin tocarla y
          // abajo se refresca con el mismo candado que "Refrescar listado".
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
          } else if (resultado?.ya_existia && resultado.sesion_id) {
            // La sesión ya existía. Antes de refrescar, se pide repasar ya
            // mismo a quien estuviera guardado y no salga activo aquí (mismo
            // mecanismo seguro que "Alta/Test"); esto no cambia el candado,
            // solo intenta que la lectura esté más al día antes de aplicarla.
            const repasoTurno = await solicitarRepasoAlumnosNoActivosBabyApp(
              resultado.sesion_id,
              asistentes
            );
            if (repasoTurno.solicitados.length > 0 || repasoTurno.noEncontrados.length > 0) {
              incidencias.push(
                `${fecha} ${horaInicio}: ${describirRepasoSolicitadoBabyApp(
                  repasoTurno.solicitados,
                  repasoTurno.noEncontrados
                )}`
              );
            }

            // La sesión ya existía: se refresca con el mismo candado de
            // seguridad que "Refrescar listado". Si no hay cambios, no se toca.
            const refresco = await aplicarListadoAimHarderEnSesionBabyApp(
              resultado.sesion_id,
              asistentes,
              lectura.safety,
              { omitirSiSinCambios: true }
            );
            if (refresco.sinCambios) {
              yaAlDia += 1;
            } else {
              refrescadas += 1;
              alumnosAnadidos += refresco.anadidos;
            }
            // Modo "solo añadir": se avisa de quién sigue en la sesión sin salir
            // en AimHarder (no se ha quitado) para que no pase desapercibido.
            if (
              refresco.soloAnadir &&
              (refresco.soloAnadir.siguenSinSalir.length > 0 ||
                refresco.soloAnadir.noAnadidos.length > 0)
            ) {
              incidencias.push(
                `${fecha} ${horaInicio}: ${buildBabyAddOnlySummary(refresco.soloAnadir)}`
              );
            }
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
        `${refrescadas} sesión(es) actualizada(s) (${alumnosAnadidos} alumno(s) añadido(s))`,
        `${yaAlDia} sesión(es) ya al día`,
        ...(yaExistentes > 0
          ? [`${yaExistentes} sesión(es) ya existente(s) sin modificar`]
          : []),
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

  // MODO "SOLO AÑADIR" (sesión con grupos hechos y niños que se apuntan tarde).
  // Se usa cuando el candado bloquearía el refresco porque falta en la lectura
  // algún alumno que ya estaba en la sesión. En vez de no hacer nada, añade a
  // los nuevos con el MISMO volcado que se usa al crear la sesión (ficha
  // existente -> su nivel, también de temporadas anteriores; sin ficha ->
  // "Pendiente de Alta/Test"), re-enviando a todos los que ya estaban para que
  // nadie salga de su grupo. Solo sale quien AimHarder marque como cancelado.
  async function aplicarSoloAnadirEnSesionBabyApp(
    sesionId: string,
    existentesAntes: AgendaAlumnoSesionApp[],
    asistentes: BabyAimHarderAsistenteActivoApp[],
    safety: BabyAimHarderSafetyApp,
    motivoBloqueo: string[]
  ): Promise<{
    sinCambios: boolean;
    anadidos: number;
    resultado: BabyAimHarderRefrescoResultadoApp | null;
    soloAnadir: BabyAddOnlyResult;
  }> {
    const plan = planAddOnlyRosterRefresh(
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

    if (plan.status === 'BLOCKED') {
      throw new Error(
        `Refresco bloqueado por seguridad: ${[...motivoBloqueo, ...plan.issues].join(
          ' '
        )} No se ha eliminado nadie.`
      );
    }

    const siguenSinSalir = plan.keptMissing.map((alumno) => alumno.name);
    if (plan.status === 'NOTHING_TO_ADD') {
      return {
        sinCambios: true,
        anadidos: 0,
        resultado: null,
        soloAnadir: {
          anadidos: [],
          siguenSinSalir,
          cancelacionesRetiradas: [],
          protegidos: [],
          noAnadidos: plan.unsupportedAdditions,
          nivelesRecalculados: [],
        },
      };
    }

    // Un listado pegado a mano puede traer basura: se enseña qué se va a hacer
    // antes de escribir nada. La lectura automática de AimHarder no pregunta.
    if (safety.sourceKey === 'manual-paste' && typeof window !== 'undefined') {
      const confirmado = window.confirm(
        describirConfirmacionSoloAnadirBaby({
          additions: plan.additions,
          keptMissing: siguenSinSalir,
          cancelledRemovals: plan.cancelledRemovals.map((alumno) => alumno.name),
          unsupportedAdditions: plan.unsupportedAdditions,
        })
      );
      if (!confirmado) {
        throw new Error('Cancelado: no se ha cambiado nada en la sesión.');
      }
    }

    // El volcado vuelve a buscar la ficha de cada nombre. Si para alguien que
    // ya está en un grupo encontrara otra ficha (duplicados), saldría de su
    // grupo: en ese caso no se toca nada. Los "Pendiente de Alta/Test" no están
    // en grupos, así que no cuentan.
    const idsConservados = new Set(plan.kept.map((alumno) => alumno.id));
    const conservados = existentesAntes.filter(
      (alumno) =>
        idsConservados.has(alumno.sesion_alumno_id) &&
        String(alumno.estado_en_listado || '').trim().toUpperCase() !== 'PENDIENTE_TEST'
    );
    if (conservados.length > 0) {
      const nombres = Array.from(
        new Set(
          conservados
            .map((alumno) => normalizeNameLikeListImport(alumno.alumno).replace(/"/g, ''))
            .filter(Boolean)
        )
      );
      // La tabla alumnos no se puede leer desde la app; esta vista sí (la
      // usan los mismos roles que pueden refrescar la sesión).
      const fichas = await consultarSupabase<ListImportFicha>(
        'v_alumnos_resumen_para_volcado_app',
        `select=alumno_id,nombre_normalizado,activo&nombre_normalizado=${encodeURIComponent(
          `in.(${nombres.map((nombre) => `"${nombre}"`).join(',')})`
        )}`
      );
      const conflictos = findListImportIdentityConflicts(
        conservados.map((alumno) => ({ alumnoId: alumno.alumno_id, name: alumno.alumno })),
        fichas
      );
      if (conflictos.length > 0) {
        throw new Error(
          `No he añadido a nadie: la ficha de ${conflictos.join(
            ', '
          )} está duplicada o no coincide con su nombre, y al volcar el listado podría salirse de su grupo. Revisa esa ficha o usa "+ Alumno fuera de plazo". No se ha cambiado nada.`
        );
      }
    }

    const resultado = await ejecutarFuncionAuthJson<BabyAimHarderRefrescoResultadoApp>(
      'refrescar_sesion_baby_aimharder_app',
      {
        p_sesion_id: sesionId,
        p_texto_listado: plan.mergedRosterNames.join('\n'),
      }
    );

    const despues = await consultarSupabase<AgendaAlumnoSesionApp>(
      'v_sesion_alumnos_operativa_app',
      `select=*&sesion_id=${encodeURIComponent(`eq.${sesionId}`)}&order=orden.asc`
    );
    const despuesPorNombre = new Map(
      despues.map((alumno) => [normalizarNombreFueraPlazoAgenda(alumno.alumno), alumno])
    );

    // Verificación: ninguno de los que se quedaban puede haber desaparecido.
    const perdidos = plan.kept
      .filter((alumno) => !despuesPorNombre.has(normalizarNombreFueraPlazoAgenda(alumno.name)))
      .map((alumno) => alumno.name);
    if (perdidos.length > 0) {
      throw new Error(
        `ATENCIÓN: después de añadir no encuentro en la sesión a ${perdidos.join(
          ', '
        )}. Revisa la sesión antes de seguir (no se muestra como correcto).`
      );
    }

    const anadidos = plan.additions
      .map((nombre) => despuesPorNombre.get(normalizarNombreFueraPlazoAgenda(nombre)))
      .filter((alumno): alumno is AgendaAlumnoSesionApp => Boolean(alumno))
      .map((alumno) => ({
        nombre: alumno.alumno,
        estado: alumno.estado_en_listado,
        nivel: alumno.nivel_usado,
      }));
    const noEntraron = plan.additions.filter(
      (nombre) => !despuesPorNombre.has(normalizarNombreFueraPlazoAgenda(nombre))
    );

    const protegidosResultado = new Set(
      (resultado?.nombres_protegidos || []).map((nombre) =>
        normalizarNombreFueraPlazoAgenda(nombre)
      )
    );
    const cancelacionesRetiradas: string[] = [];
    const protegidos: string[] = [];
    plan.cancelledRemovals.forEach((alumno) => {
      const clave = normalizarNombreFueraPlazoAgenda(alumno.name);
      if (despuesPorNombre.has(clave) || protegidosResultado.has(clave)) {
        protegidos.push(alumno.name);
      } else {
        cancelacionesRetiradas.push(alumno.name);
      }
    });

    const nivelesRecalculados = existentesAntes
      .filter((alumno) => idsConservados.has(alumno.sesion_alumno_id))
      .map((alumno) => ({
        nombre: alumno.alumno,
        antes: alumno.nivel_usado || null,
        despues:
          despuesPorNombre.get(normalizarNombreFueraPlazoAgenda(alumno.alumno))?.nivel_usado ||
          null,
      }))
      .filter((item) => item.antes !== item.despues);

    return {
      sinCambios: false,
      anadidos: anadidos.length,
      resultado,
      soloAnadir: {
        anadidos,
        siguenSinSalir,
        cancelacionesRetiradas,
        protegidos,
        noAnadidos: [...plan.unsupportedAdditions, ...noEntraron],
        nivelesRecalculados,
      },
    };
  }

  // Refresco seguro de una sesión Baby YA EXISTENTE con el listado de AimHarder.
  // Lo usan "Refrescar listado" (una sesión) y "Cargar semana" (todas las
  // sesiones ya creadas de la semana). Mismo candado anti-borrado en ambos.
  async function aplicarListadoAimHarderEnSesionBabyApp(
    sesionId: string,
    asistentes: BabyAimHarderAsistenteActivoApp[],
    safety: BabyAimHarderSafetyApp,
    opciones: { omitirSiSinCambios?: boolean } = {}
  ): Promise<{
    sinCambios: boolean;
    anadidos: number;
    resultado: BabyAimHarderRefrescoResultadoApp | null;
    verificacion: BabyAimHarderVerificacionRefrescoApp | null;
    soloAnadir: BabyAddOnlyResult | null;
  }> {
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
      // Antes aquí se paraba todo y los niños nuevos no entraban. Ahora se
      // añaden sin quitar a nadie (o se sigue bloqueando si hay duplicados,
      // 0 alumnos o algún nombre que no se pueda re-leer con seguridad).
      const soloAnadir = await aplicarSoloAnadirEnSesionBabyApp(
        sesionId,
        existentesAntes,
        asistentes,
        safety,
        preflight.issues
      );
      return { ...soloAnadir, verificacion: null };
    }

    if (
      opciones.omitirSiSinCambios &&
      preflight.additions.length === 0 &&
      preflight.removals.length === 0
    ) {
      return {
        sinCambios: true,
        anadidos: 0,
        resultado: null,
        verificacion: null,
        soloAnadir: null,
      };
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

    return {
      sinCambios: false,
      anadidos: preflight.additions.length,
      resultado,
      verificacion,
      soloAnadir: null,
    };
  }

  // El resultado de "Refrescar listado" / "Pegar listado" se pinta arriba de
  // la Agenda, lejos de la tarjeta: si estás con la tarjeta en pantalla no lo
  // ves. Este aviso lo recoge manualRosterBridge para pintarlo en la tarjeta.
  function notificarResultadoTarjetaBabyApp(
    sesion: SesionAgendaOperativa,
    ok: boolean,
    texto: string
  ) {
    if (typeof window === 'undefined') return;
    window.dispatchEvent(
      new CustomEvent('mitico:baby-refresh-result', {
        detail: {
          fecha: String(sesion.fecha || '').slice(0, 10),
          inicio: horaCorta(sesion.hora_inicio),
          fin: horaCorta(sesion.hora_fin),
          ok,
          texto,
        },
      })
    );
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

    let repaso: { solicitados: string[]; noEncontrados: string[] } | null = null;

    try {
      // Mismo lector exacto que usa el turno individual. No existe un parser
      // alternativo para Refrescar listado.
      const { asistentes, safety } = await obtenerListadoBabyTurnoAimHarderApp(
        fecha,
        inicioSesion,
        finSesion
      );

      // Si algún alumno que ya estaba en la sesión no sale como activo en
      // esta lectura, se le pide a la sincronización que repase su reserva
      // ya mismo (mismo mecanismo seguro que usa "Alta/Test"). No cambia el
      // candado de seguridad: solo intenta que la próxima lectura esté más
      // al día, y deja claro por nombre a quién se le ha pedido el repaso.
      // Con un listado pegado a mano (que puede traer solo a los nuevos) no
      // tiene sentido: no viene de la copia de AimHarder.
      repaso =
        safety.sourceKey === 'manual-paste'
          ? null
          : await solicitarRepasoAlumnosNoActivosBabyApp(sesionId, asistentes);

      const { resultado, verificacion, soloAnadir } =
        await aplicarListadoAimHarderEnSesionBabyApp(sesionId, asistentes, safety);
      if (!soloAnadir && !verificacion) {
        // No ocurre: sin omitirSiSinCambios siempre se refresca y verifica.
        throw new Error('No se pudo verificar el refresco de la sesión Baby.');
      }

      await cargarAgendaOperativaDirecta();
      await cargarListados();
      await cargarDetalleSesionAgenda(sesionId, {
        preservarPropuesta: true,
        preservarScroll: true,
      });

      let mensaje = '';
      if (soloAnadir) {
        const notaRepaso = repaso
          ? describirRepasoSolicitadoBabyApp(repaso.solicitados, repaso.noEncontrados)
          : '';
        mensaje = [buildBabyAddOnlySummary(soloAnadir, safety), notaRepaso]
          .filter(Boolean)
          .join(' · ');
      } else if (verificacion) {
        mensaje = buildBabyRefreshSummary(
          asistentes.length,
          resultado,
          verificacion,
          safety,
          repaso
        );
      }
      setBabyAimHarderMensaje(mensaje);
      notificarResultadoTarjetaBabyApp(sesion, true, mensaje);
    } catch (e) {
      const base =
        e instanceof Error
          ? e.message
          : 'No se pudo refrescar esta sesión Baby desde AimHarder.';
      const notaRepaso = repaso
        ? describirRepasoSolicitadoBabyApp(repaso.solicitados, repaso.noEncontrados)
        : '';
      const textoError = notaRepaso ? `${base} ${notaRepaso}` : base;
      setBabyAimHarderError(textoError);
      notificarResultadoTarjetaBabyApp(sesion, false, textoError);
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
    buscarDatosContactoBabyAimHarderApp,
    traerListadoBabyTurnoAgendaDesdeAimHarder,
    cargarSemanaBabyDesdeAimHarder,
    refrescarSesionBabyDesdeAimHarder,
  };
}
