// Paco · acciones: el hilo que une la frase de Jose con la acción real.
//
//   1. Entiende la petición (listado sin IA; «pasa a Lucía al jueves» con la
//      función mitico-paco-acciones, que SOLO interpreta y nunca escribe).
//   2. Busca al niño y el turno en los datos reales (nada se inventa: si hay
//      dudas, Paco pregunta con botones).
//   3. Enseña una tarjeta «voy a hacer esto, ¿confirmas?».
//   4. Solo al pulsar Confirmar escribe, con la misma función segura de la
//      Agenda, vuelve a leer para comprobarlo y deja constancia en el registro.
import {
  alumnosSinColocar,
  buscarAlumnos,
  etiquetaTurno,
  filtrarTurnos,
  limpiarIntent,
  nombreBonito,
  normalizarNombreAlumno,
  parecePeticionListadoPendientes,
  parecePeticionMover,
  resumirPendientes,
  sugerirGrupoDestino,
  tarjetaMovimiento,
  textoPendientes,
  turnosDeLaSemana,
  type DatosMovimiento,
  type IntentAccion,
  type OpcionAccion,
  type SalidaAccion,
  type TurnoBaby,
} from './pacoAccionesLogic';
import {
  cargarTurnosBaby,
  moverAlumnoDeTurno,
  registrarAccion,
  verificarMovimiento,
} from './pacoAccionesService';

// Pregunta al servidor qué quiere decir la frase. Devuelve null si no es para este módulo.
export type Interprete = (mensaje: string) => Promise<unknown>;

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_BOTONES = 6;

type Cambios = { alumno_id?: string; sesion_alumno_id?: string; sesion_destino_id?: string };

function estadoHttp(error: unknown) {
  return (error as { status?: number } | null)?.status;
}

// Un 401 sube hasta el chat (que ya sabe qué hacer con la sesión caducada);
// cualquier otro fallo se explica en llano.
function manejarFallo(error: unknown, contexto: string): SalidaAccion {
  if (estadoHttp(error) === 401) throw error;
  const detalle = error instanceof Error ? error.message : '';
  console.warn(`Paco acciones: ${contexto}`, error);
  return {
    answer: `${contexto}${detalle ? ` (${detalle.slice(0, 160)})` : ''} No he cambiado nada.`,
  };
}

function botonesTurnos(turnos: TurnoBaby[], intent: IntentAccion, cambios: Cambios): OpcionAccion[] {
  return turnos.slice(0, MAX_BOTONES).map((turno) => ({
    label: `${etiquetaTurno(turno.sesion)} · ${turno.roster.length} niños`,
    continuation: { kind: 'accion_preparar', intent, ...cambios, sesion_destino_id: turno.sesion.sesion_id },
  }));
}

async function listarPendientes(): Promise<SalidaAccion> {
  try {
    const turnos = await cargarTurnosBaby(14);
    return { answer: textoPendientes(resumirPendientes(turnos)) };
  } catch (error) {
    return manejarFallo(error, 'No he podido leer los turnos de Baby ahora mismo.');
  }
}

async function prepararMovimiento(intent: IntentAccion, cambios: Cambios): Promise<SalidaAccion> {
  let turnos: TurnoBaby[];
  try {
    turnos = await cargarTurnosBaby(21);
  } catch (error) {
    return manejarFallo(error, 'No he podido leer los turnos de Baby ahora mismo.');
  }

  // 1) ¿Qué niño?
  const todas = turnos.flatMap((t) => t.roster);
  let alumnoId = cambios.alumno_id || '';
  if (!alumnoId) {
    if (!intent.alumno) return { answer: '¿A qué niño quiere cambiar de turno? Dígame su nombre, por favor.' };
    const candidatos = buscarAlumnos(intent.alumno, todas);
    if (candidatos.length === 0) {
      return {
        answer: `No encuentro a «${intent.alumno}» en los próximos turnos de Baby. Puede que ya esté en otra modalidad o que aún no esté en ningún listado. No he cambiado nada.`,
      };
    }
    if (candidatos.length > 1) {
      return {
        answer: `Hay varios niños que encajan con «${intent.alumno}». ¿A cuál se refiere?`,
        choices: candidatos.slice(0, MAX_BOTONES).map((c) => ({
          label: c.nombre,
          continuation: { kind: 'accion_preparar', intent, alumno_id: c.alumno_id },
        })),
      };
    }
    alumnoId = candidatos[0].alumno_id;
  }

  // 2) ¿Desde qué turno? (solo sirven los turnos donde sigue sin grupo)
  const presencias = turnos
    .map((turno) => {
      const fila = turno.roster.find((r) => r.alumno_id === alumnoId);
      return fila ? { turno, fila } : null;
    })
    .filter((x): x is { turno: TurnoBaby; fila: TurnoBaby['roster'][number] } => Boolean(x));
  if (presencias.length === 0) {
    return { answer: 'Ese niño ya no aparece en los próximos turnos de Baby. No he cambiado nada.' };
  }
  const nombre = nombreBonito(presencias[0].fila.alumno);

  const libres = presencias.filter(({ turno, fila }) =>
    alumnosSinColocar(turno).some((p) => p.sesion_alumno_id === fila.sesion_alumno_id)
  );
  if (libres.length === 0) {
    const donde = presencias
      .map(({ turno, fila }) => {
        const buscado = normalizarNombreAlumno(fila.alumno);
        const grupo = turno.grupos.find((g) =>
          String(g.alumnos_lista || '')
            .split(' || ')
            .some((n) => normalizarNombreAlumno(n) === buscado)
        );
        return `${etiquetaTurno(turno.sesion)}${grupo ? ` (grupo «${grupo.nombre_grupo}»)` : ''}`;
      })
      .join('; ');
    return {
      answer: `${nombre} ya está dentro de un grupo (${donde}). Por seguridad, de momento solo muevo de turno a niños que están sin colocar; para sacarlo de su grupo hágalo desde la Agenda. No he cambiado nada.`,
    };
  }

  let elegida = libres;
  if (cambios.sesion_alumno_id) {
    elegida = libres.filter((p) => p.fila.sesion_alumno_id === cambios.sesion_alumno_id);
  } else if (intent.fecha_origen || intent.dia_origen || intent.hora_origen) {
    const filtrados = filtrarTurnos(
      libres.map((p) => ({ ...p, sesion: p.turno.sesion })),
      { dia: intent.dia_origen, fecha: intent.fecha_origen, hora: intent.hora_origen }
    );
    if (filtrados.length) elegida = filtrados;
  }
  if (elegida.length === 0) return { answer: 'No he podido identificar de qué turno sale. No he cambiado nada.' };
  if (elegida.length > 1) {
    return {
      answer: `${nombre} está sin colocar en más de un turno. ¿De cuál lo saco?`,
      choices: elegida.slice(0, MAX_BOTONES).map((p) => ({
        label: etiquetaTurno(p.turno.sesion),
        continuation: {
          kind: 'accion_preparar',
          intent,
          alumno_id: alumnoId,
          sesion_alumno_id: p.fila.sesion_alumno_id,
        },
      })),
    };
  }
  const origen = elegida[0];

  if (String(origen.fila.estado_en_listado || '').trim().toUpperCase() === 'PENDIENTE_TEST') {
    return {
      answer: `${nombre} tiene el test de nivel pendiente y el sistema no deja moverlo hasta resolverlo. Hay que cerrar primero su test en Altas / Test. No he cambiado nada.`,
    };
  }

  // 3) ¿A qué turno? (misma semana, otro turno Baby en el que no esté ya)
  const delaSemana = turnosDeLaSemana(turnos, origen.turno.sesion.fecha).filter(
    (t) =>
      t.sesion.sesion_id !== origen.turno.sesion.sesion_id &&
      !t.roster.some((r) => r.alumno_id === alumnoId)
  );
  const base = { intent, alumno_id: alumnoId, sesion_alumno_id: origen.fila.sesion_alumno_id };
  let destino: TurnoBaby | undefined;
  if (cambios.sesion_destino_id) {
    destino = delaSemana.find((t) => t.sesion.sesion_id === cambios.sesion_destino_id);
  } else {
    const hayFiltro = Boolean(intent.dia_destino || intent.fecha_destino || intent.hora_destino);
    const candidatos = hayFiltro
      ? filtrarTurnos(delaSemana, {
          dia: intent.dia_destino,
          fecha: intent.fecha_destino,
          hora: intent.hora_destino,
        })
      : delaSemana;
    if (candidatos.length === 0) {
      return {
        answer: delaSemana.length
          ? `No hay ningún turno de Baby que coincida con eso en la semana de ${nombre}. Estos son los que hay; elija uno:`
          : `No hay otros turnos de Baby en esa semana a los que pueda pasar a ${nombre}. No he cambiado nada.`,
        choices: delaSemana.length
          ? botonesTurnos(delaSemana, intent, base)
          : undefined,
      };
    }
    if (candidatos.length > 1 || !hayFiltro) {
      return {
        answer: hayFiltro
          ? `Hay varios turnos que encajan para ${nombre}. ¿A cuál lo paso?`
          : `¿A qué turno quiere pasar a ${nombre}?`,
        choices: botonesTurnos(candidatos, intent, base),
      };
    }
    destino = candidatos[0];
  }
  if (!destino) {
    return { answer: 'Ese turno ya no está disponible para este niño. No he cambiado nada.' };
  }

  // 4) Tarjeta de confirmación (todavía no se toca nada)
  const sugerencia = sugerirGrupoDestino(
    { alumno_id: alumnoId, alumno: origen.fila.alumno, nivel_usado: origen.fila.nivel_usado },
    origen.turno.sesion.fecha,
    destino
  );
  const datos: DatosMovimiento = {
    sesion_alumno_id: origen.fila.sesion_alumno_id,
    alumno_id: alumnoId,
    nombre,
    sesion_destino_id: destino.sesion.sesion_id,
    grupo_destino_id: null,
    grupo_destino: null,
    turno_origen: `${etiquetaTurno(origen.turno.sesion)}`,
    turno_destino: `${etiquetaTurno(destino.sesion)}`,
  };
  return tarjetaMovimiento(datos, String(origen.fila.nivel_usado || '').trim() || null, sugerencia);
}

async function confirmarMovimiento(c: Record<string, unknown>): Promise<SalidaAccion> {
  const sesionAlumnoId = String(c.sesion_alumno_id || '');
  const sesionDestinoId = String(c.sesion_destino_id || '');
  const grupoId = c.grupo_destino_id ? String(c.grupo_destino_id) : null;
  const nombre = String(c.nombre || 'el niño').slice(0, 80);
  if (!UUID.test(sesionAlumnoId) || !UUID.test(sesionDestinoId) || (grupoId && !UUID.test(grupoId))) {
    return { answer: 'Esa confirmación no es válida. No he cambiado nada; pídamelo de nuevo.' };
  }
  const resumen = `${nombre}: ${String(c.turno_origen || '')} → ${String(c.turno_destino || '')}${
    grupoId ? ` · grupo «${String(c.grupo_destino || '')}»` : ' · sin grupo'
  }`;
  const parametros = {
    sesion_alumno_id: sesionAlumnoId,
    sesion_destino_id: sesionDestinoId,
    grupo_destino_id: grupoId,
  };

  try {
    const r = await moverAlumnoDeTurno({
      sesion_alumno_id: sesionAlumnoId,
      sesion_destino_id: sesionDestinoId,
      grupo_destino_id: grupoId,
    });
    if (!r.ok) throw new Error('La base de datos no confirmó el cambio.');
    const comprobacion = await verificarMovimiento({
      sesion_alumno_id: sesionAlumnoId,
      sesion_destino_id: sesionDestinoId,
      grupo_destino_id: grupoId,
      nombre,
    });
    void registrarAccion({
      accion: 'mover_alumno_turno_baby',
      estado: 'ok',
      resumen,
      parametros,
      resultado: { comprobado: comprobacion.ok, detalle: comprobacion.detalle },
    });
    const dondeQueda = r.incorporado_a_grupo
      ? `en el grupo «${r.grupo_destino || String(c.grupo_destino || '')}»`
      : 'sin grupo (queda pendiente de colocar)';
    return {
      answer: `Hecho, señor Cubero. ${nombre} ya está en ${String(c.turno_destino || 'el nuevo turno')}, ${dondeQueda}.\n${
        comprobacion.ok
          ? 'Lo he comprobado volviendo a leer los datos.'
          : `Ojo: ${comprobacion.detalle} Revíselo en la Agenda.`
      }\nSi la Agenda estaba abierta, actualícela para verlo.`,
    };
  } catch (error) {
    if (estadoHttp(error) === 401) throw error;
    const detalle = error instanceof Error ? error.message : 'Error desconocido.';
    void registrarAccion({
      accion: 'mover_alumno_turno_baby',
      estado: 'error',
      resumen,
      parametros,
      error: detalle,
    });
    return { answer: `No lo he podido mover: ${detalle.slice(0, 220)}\nNo se ha cambiado nada.` };
  }
}

export async function intentarAccionPaco(
  mensaje: string,
  interpretar: Interprete
): Promise<SalidaAccion | null> {
  if (parecePeticionListadoPendientes(mensaje)) return listarPendientes();
  if (!parecePeticionMover(mensaje)) return null;

  let intent: IntentAccion;
  try {
    intent = limpiarIntent(await interpretar(mensaje));
  } catch (error) {
    if (estadoHttp(error) === 401 || estadoHttp(error) === 403) throw error;
    console.warn('Paco acciones: no se pudo interpretar la petición.', error);
    return {
      answer:
        'No he podido entender esa petición ahora mismo (el servicio de IA no ha respondido). Inténtelo de nuevo en un momento. No he cambiado nada.',
    };
  }
  if (intent.accion === 'listar_pendientes') return listarPendientes();
  if (intent.accion === 'mover_alumno') return prepararMovimiento(intent, {});
  return null;
}

export async function continuarAccionPaco(
  continuacion: Record<string, unknown> & { kind: string }
): Promise<SalidaAccion> {
  switch (continuacion.kind) {
    case 'accion_cancelar':
      return { answer: 'De acuerdo, no he tocado nada.' };
    case 'accion_preparar': {
      const alumno = continuacion.alumno_id ? String(continuacion.alumno_id) : undefined;
      const alumnoSesion = continuacion.sesion_alumno_id ? String(continuacion.sesion_alumno_id) : undefined;
      const destino = continuacion.sesion_destino_id ? String(continuacion.sesion_destino_id) : undefined;
      if ((alumno && !UUID.test(alumno)) || (alumnoSesion && !UUID.test(alumnoSesion)) || (destino && !UUID.test(destino))) {
        return { answer: 'Esa opción no es válida. No he cambiado nada; pídamelo de nuevo.' };
      }
      return prepararMovimiento(limpiarIntent(continuacion.intent), {
        alumno_id: alumno,
        sesion_alumno_id: alumnoSesion,
        sesion_destino_id: destino,
      });
    }
    case 'accion_mover_confirm':
      return confirmarMovimiento(continuacion);
    default:
      return { answer: 'No reconozco esa acción. No he cambiado nada.' };
  }
}
