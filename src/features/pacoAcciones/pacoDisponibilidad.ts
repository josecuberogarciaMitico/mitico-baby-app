// Paco · disponibilidad semanal: el hilo entre la frase de Jose y la acción real.
//
//   1. «Prepara la disponibilidad quitando el domingo de las 12» → el servidor
//      (Gemini) solo extrae qué cambios pide; no decide ni escribe nada.
//   2. Se parte del estado REAL de la semana (borrador guardado, publicada, o la
//      plantilla habitual si aún no estaba preparada) y se aplican los cambios
//      con las mismas reglas del editor de Disponibilidad.
//   3. Se enseña cómo quedaría, con avisos claros, y Jose puede seguir pidiendo
//      cambios («quita también el viernes»).
//   4. Solo al pulsar un botón se guarda y, si Jose quiere, se publica y se avisa
//      a los entrenadores (mismas funciones que el botón «Publicar» a mano);
//      después se vuelve a leer para comprobarlo y se deja constancia.
import { crearBorradorDisponibilidadEditor } from '../availability/availabilityEditor';
import { sinTildes, type SalidaAccion } from './pacoAccionesLogic';
import { hoyMadrid, registrarAccion } from './pacoAccionesService';
import {
  aplicarOps,
  limpiarIntentDisponibilidad,
  mismoResumen,
  normalizarYValidar,
  parecePeticionConfirmarPorTexto,
  parecePeticionDisponibilidad,
  parecePeticionEditarPropuesta,
  rangoSemana,
  resolverSemana,
  resumenComparable,
  textoPropuesta,
  type PropuestaDisponibilidad,
} from './pacoDisponibilidadLogic';
import {
  ahoraMadridIso,
  avisarEntrenadores,
  contarRespuestas,
  guardarBorrador,
  leerSemana,
  publicarSemana,
  type EstadoSemana,
} from './pacoDisponibilidadService';

export type InterpreteDisponibilidad = (mensaje: string) => Promise<unknown>;

const VIGENCIA_MS = 30 * 60 * 1000;

// Solo hay UNA propuesta viva (la última). Los botones de propuestas anteriores
// dejan de valer, así no se puede publicar por error algo viejo.
let propuesta: PropuestaDisponibilidad | null = null;

function propuestaViva() {
  if (propuesta && Date.now() - propuesta.creada > VIGENCIA_MS) propuesta = null;
  return propuesta;
}

export function hayPropuestaDisponibilidad() {
  return propuestaViva() !== null;
}

function estadoHttp(error: unknown) {
  return (error as { status?: number } | null)?.status;
}

function manejarFallo(error: unknown, contexto: string): SalidaAccion {
  if (estadoHttp(error) === 401) throw error;
  const detalle = error instanceof Error ? error.message : '';
  console.warn(`Paco disponibilidad: ${contexto}`, error);
  return { answer: `${contexto}${detalle ? ` (${detalle.slice(0, 200)})` : ''} No he cambiado nada.` };
}

function nuevoId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function botones(p: PropuestaDisponibilidad): SalidaAccion['choices'] {
  if (p.errorValidacion) {
    return [{ label: 'Cancelar', continuation: { kind: 'accion_disp_cancelar', propuesta_id: p.id } }];
  }
  const publicado = p.version_publicada > 0;
  const guardarYEnviar = {
    label: publicado ? 'Publicar de nuevo y avisar' : 'Guardar y enviar a los entrenadores',
    continuation: { kind: 'accion_disp_confirmar', propuesta_id: p.id, publicar: true },
  };
  const soloGuardar = {
    label: 'Solo guardar borrador',
    continuation: { kind: 'accion_disp_confirmar', propuesta_id: p.id, publicar: false },
  };
  const cancelar = { label: 'Cancelar', continuation: { kind: 'accion_disp_cancelar', propuesta_id: p.id } };
  return p.enviar || publicado ? [guardarYEnviar, soloGuardar, cancelar] : [soloGuardar, guardarYEnviar, cancelar];
}

function tarjeta(p: PropuestaDisponibilidad): SalidaAccion {
  return { answer: textoPropuesta(p), choices: botones(p) };
}

async function construirPropuesta(
  semana: string,
  estado: EstadoSemana,
  intent: ReturnType<typeof limpiarIntentDisponibilidad>,
  previa: PropuestaDisponibilidad | null
): Promise<PropuestaDisponibilidad> {
  // Punto de partida: la propuesta en curso de esa semana (si la hay y Jose no
  // pide empezar de cero) o el estado real de la semana.
  const continuar = previa && previa.semana_inicio === semana && !intent.desde_cero;
  const partida = continuar
    ? previa.borrador
    : intent.desde_cero
      ? crearBorradorDisponibilidadEditor(semana)
      : estado.borrador;
  const { borrador, cambios, problemas } = aplicarOps(partida, intent.ops, ahoraMadridIso());
  const { normalizado, error } = normalizarYValidar(borrador);
  const base = continuar ? previa.base : intent.desde_cero ? 'plantilla' : estado.base;
  const respuestas =
    estado.version_publicada > 0
      ? continuar
        ? previa.respuestas
        : await contarRespuestas(semana)
      : null;
  return {
    id: nuevoId(),
    semana_inicio: semana,
    base,
    version_publicada: estado.version_publicada,
    borrador: normalizado,
    cambios: continuar ? [...previa.cambios, ...cambios] : cambios,
    problemas,
    errorValidacion: error,
    enviar: intent.enviar || Boolean(previa?.enviar && continuar),
    instantanea: {
      existe: estado.existe,
      estado: estado.estado,
      version_publicada: estado.version_publicada,
      actualizado_en: estado.actualizado_en,
    },
    respuestas,
    creada: Date.now(),
  };
}

// Lo que Gemini ya ha decidido (modo «auto»): de qué va el mensaje y si ajusta la tarjeta abierta.
export type DecisionIA = { intent: unknown; ajusta: boolean };

// Resumen corto de la tarjeta abierta, para que quien clasifica el mensaje sepa que existe.
export function resumenPropuestaAbierta(): string | null {
  const p = propuestaViva();
  if (!p) return null;
  const cambios = p.cambios.slice(0, 6).join('; ');
  return `Semana del ${rangoSemana(p.semana_inicio)}${cambios ? `; cambios ya hechos: ${cambios}` : '; sin cambios sobre la plantilla'}.`.slice(0, 480);
}

// «Envíala», «vale, hazlo»: no se confirma por texto; se vuelve a enseñar la tarjeta con sus botones.
export function repetirTarjetaPropuesta(): SalidaAccion | null {
  const viva = propuestaViva();
  if (!viva) return null;
  return {
    answer: `Para que no haya malentendidos, solo envío o guardo cuando pulsa un botón. Esto es lo que tengo preparado:\n\n${textoPropuesta(viva)}`,
    choices: botones(viva),
  };
}

// «Déjalo», «cancela»: descarta la tarjeta abierta sin escribir nada.
export function cancelarPropuestaPorTexto(): SalidaAccion | null {
  if (!propuestaViva()) return null;
  propuesta = null;
  return { answer: 'De acuerdo, no he guardado ni enviado nada.' };
}

function noEntendido(viva: PropuestaDisponibilidad | null): SalidaAccion {
  if (viva) {
    return {
      answer: `No he entendido ese cambio y no he tocado nada. Dígamelo, por ejemplo, así: «quita el turno de las 14:30 del sábado», «añade el jueves a las 17:00» o «el límite el martes a las 10».\n\nEsto es lo que tengo preparado:\n\n${textoPropuesta(viva)}`,
      choices: botones(viva),
    };
  }
  return { answer: 'No he entendido bien qué cambio quiere en la disponibilidad y no he tocado nada. Dígamelo, por ejemplo: «prepara la semana que viene quitando el jueves».' };
}

// Parte común: con la intención ya entendida, prepara la propuesta y enseña la tarjeta.
async function procesarIntencion(
  mensaje: string,
  intent: ReturnType<typeof limpiarIntentDisponibilidad>,
  viva: PropuestaDisponibilidad | null,
  sigueLaPropuesta: boolean
): Promise<SalidaAccion> {
  void mensaje;
  const previa = sigueLaPropuesta ? viva : null;

  const hayFecha = Boolean(intent.semana_fecha || intent.semana_relativa);
  const semana = hayFecha
    ? resolverSemana(hoyMadrid(), { fecha: intent.semana_fecha, relativa: intent.semana_relativa })
    : previa
      ? previa.semana_inicio
      : resolverSemana(hoyMadrid(), { fecha: null, relativa: null });

  let estado: EstadoSemana;
  try {
    estado = await leerSemana(semana);
  } catch (error) {
    return manejarFallo(error, 'No he podido leer la disponibilidad de esa semana ahora mismo.');
  }

  // Ya publicada y Jose no pide ningún cambio: no tiene sentido volver a publicarla
  // (borraría las respuestas de los entrenadores).
  if (estado.base === 'publicado' && estado.version_publicada > 0 && intent.ops.length === 0 && !intent.desde_cero) {
    const resp = await contarRespuestas(semana);
    return {
      answer: `La disponibilidad de la semana del ${rangoSemana(semana)} ya está publicada y enviada a los entrenadores (versión ${estado.version_publicada}).${
        resp ? ` Han respondido ${resp.respondieron} de ${resp.total}.` : ''
      } No la vuelvo a publicar porque se borrarían sus respuestas. Si quiere cambiar algo, dígamelo (por ejemplo, «quita el domingo de las 12») y se lo enseño antes de tocar nada.`,
    };
  }

  try {
    const nueva = await construirPropuesta(semana, estado, intent, previa);
    propuesta = nueva;
    return tarjeta(nueva);
  } catch (error) {
    return manejarFallo(error, 'No he podido preparar la disponibilidad ahora mismo.');
  }
}

// Modo «auto»: Gemini ya ha dicho que el mensaje es de disponibilidad (y si ajusta la tarjeta abierta).
// No hay lista de palabras de por medio: lo que Gemini haya entendido es lo que se enseña, y siempre
// con tarjeta y botones antes de escribir nada.
export async function intentarDisponibilidadIA(mensaje: string, decision: DecisionIA): Promise<SalidaAccion> {
  const viva = propuestaViva();
  const intent = limpiarIntentDisponibilidad(decision.intent);
  if (intent.accion !== 'editar_disponibilidad') return noEntendido(viva);
  return procesarIntencion(mensaje, intent, viva, Boolean(viva) && decision.ajusta);
}

// Respaldo por palabras (solo si la IA del servidor no responde).
export async function intentarDisponibilidad(
  mensaje: string,
  interpretar: InterpreteDisponibilidad
): Promise<SalidaAccion | null> {
  const viva = propuestaViva();
  const esPeticion = parecePeticionDisponibilidad(mensaje);
  const esEdicion = Boolean(viva) && parecePeticionEditarPropuesta(mensaje);
  const esConfirmarTexto = Boolean(viva) && parecePeticionConfirmarPorTexto(mensaje) && !esPeticion;
  if (!esPeticion && !esEdicion && !esConfirmarTexto) return null;

  // «Envíala» por texto no confirma nada: se vuelve a enseñar la tarjeta con sus botones.
  if (esConfirmarTexto && !esEdicion && viva) return repetirTarjetaPropuesta();

  let intent: ReturnType<typeof limpiarIntentDisponibilidad>;
  try {
    intent = limpiarIntentDisponibilidad(await interpretar(mensaje));
  } catch (error) {
    if (estadoHttp(error) === 401 || estadoHttp(error) === 403) throw error;
    console.warn('Paco disponibilidad: no se pudo interpretar la petición.', error);
    return {
      answer:
        'No he podido entender esa petición ahora mismo (el servicio de IA no ha respondido). Inténtelo de nuevo en un momento. No he cambiado nada.',
    };
  }
  if (intent.accion !== 'editar_disponibilidad') {
    // Con una propuesta en pantalla, un ajuste que no entiendo NO debe caer en el Paco
    // antiguo («no tengo permisos»): se pide que lo diga de otra forma.
    if (esEdicion && viva) return noEntendido(viva);
    return null;
  }

  // Una petición nueva y completa («manda la disponibilidad…») empieza de cero; solo un
  // ajuste suelto («quita el viernes», «y también el domingo») sigue la propuesta en curso.
  const sigue = Boolean(viva) && (!esPeticion || /\b(tambien|ademas)\b/.test(sinTildes(mensaje).toLowerCase()));
  return procesarIntencion(mensaje, intent, viva, sigue);
}

function sinVigencia(): SalidaAccion {
  return {
    answer:
      'Esa propuesta ya no está vigente (se ha enviado, cancelado, sustituida por otra o ha pasado demasiado tiempo). No he cambiado nada; pídamela de nuevo.',
  };
}

async function confirmar(id: string, publicar: boolean): Promise<SalidaAccion> {
  const p = propuestaViva();
  if (!p || p.id !== id) return sinVigencia();
  const rango = rangoSemana(p.semana_inicio);

  const { normalizado, error: invalida } = normalizarYValidar(p.borrador);
  if (invalida) return { answer: `Así no se puede guardar: ${invalida} No he cambiado nada.` };

  // ¿Ha cambiado la semana en la base de datos desde que se la enseñé?
  let actual: EstadoSemana;
  try {
    actual = await leerSemana(p.semana_inicio);
  } catch (error) {
    return manejarFallo(error, 'No he podido volver a leer la semana antes de guardar.');
  }
  const i = p.instantanea;
  if (
    actual.existe !== i.existe ||
    actual.estado !== i.estado ||
    actual.version_publicada !== i.version_publicada ||
    (actual.actualizado_en || null) !== (i.actualizado_en || null)
  ) {
    propuesta = null;
    return {
      answer:
        'Mientras tanto alguien ha tocado esa semana en la app, así que no guardo nada para no pisar sus cambios. Pídamela de nuevo y parto de lo último.',
    };
  }

  const resumenAccion = `Semana ${rango}: ${publicar ? 'guardar y publicar' : 'guardar borrador'}. ${p.cambios.join(' ')}`.slice(0, 480);
  const esperado = resumenComparable(normalizado.fecha_limite, normalizado.dias);

  // 1) Guardar el borrador
  try {
    await guardarBorrador(normalizado);
    const leido = await leerSemana(p.semana_inicio);
    const guardadoOk = mismoResumen(esperado, resumenComparable(leido.borrador.fecha_limite, leido.borrador.dias));
    if (!guardadoOk) {
      void registrarAccion({ accion: 'guardar_disponibilidad_semana', estado: 'error', resumen: resumenAccion, error: 'La comprobación posterior no coincide.' });
      return {
        answer:
          'He guardado, pero al volver a leer la semana no coincide con lo que le enseñé. No la publico; revísela en Disponibilidad.',
      };
    }
  } catch (error) {
    if (estadoHttp(error) === 401) throw error;
    const detalle = error instanceof Error ? error.message : 'Error desconocido.';
    void registrarAccion({ accion: 'guardar_disponibilidad_semana', estado: 'error', resumen: resumenAccion, error: detalle });
    return {
      answer: `No he podido guardar la disponibilidad: ${detalle.slice(0, 220)}\nNo la he publicado. Puede volver a pulsar el botón o revisarla en Disponibilidad.`,
      choices: botones(p),
    };
  }

  if (!publicar) {
    propuesta = null;
    void registrarAccion({ accion: 'guardar_disponibilidad_semana', estado: 'ok', resumen: resumenAccion, parametros: { semana_inicio: p.semana_inicio } });
    return {
      answer: `Hecho, señor Cubero. He guardado el borrador de la semana del ${rango} (lo he comprobado volviendo a leerlo). Todavía NO está enviada a los entrenadores: cuando quiera, dígame «manda la disponibilidad» o publíquela desde Disponibilidad.\nSi tiene abierta la pantalla Disponibilidad, cambie de semana y vuelva para verla actualizada.`,
    };
  }

  // 2) Publicar y avisar
  try {
    const publicado = await publicarSemana(p.semana_inicio);
    const leido = await leerSemana(p.semana_inicio);
    const publicadoOk = leido.estado === 'publicado' && leido.version_publicada > i.version_publicada;
    const push = await avisarEntrenadores(p.semana_inicio);
    propuesta = null;
    void registrarAccion({
      accion: 'publicar_disponibilidad_semana',
      estado: publicadoOk ? 'ok' : 'error',
      resumen: resumenAccion,
      parametros: { semana_inicio: p.semana_inicio },
      resultado: { version_publicada: leido.version_publicada, publicada_at: publicado?.publicada_at ?? null, push },
    });
    const lineaPush = push
      ? `Aviso push: ${Number(push.sent || 0)} entrenador(es) avisados${
          Number(push.without_subscription || 0) ? `, ${Number(push.without_subscription)} sin avisos activados en el móvil` : ''
        }.`
      : 'La semana está publicada, pero el aviso push no se ha podido enviar; avíseles por el medio habitual.';
    return {
      answer: `Hecho, señor Cubero. Disponibilidad de la semana del ${rango} publicada (versión ${leido.version_publicada}) y ${
        publicadoOk ? 'comprobada volviendo a leerla' : 'OJO: no he podido comprobar la publicación, revísela en Disponibilidad'
      }.\n${lineaPush}\nSi tiene abierta la pantalla Disponibilidad, cambie de semana y vuelva para verla actualizada.`,
    };
  } catch (error) {
    if (estadoHttp(error) === 401) throw error;
    const detalle = error instanceof Error ? error.message : 'Error desconocido.';
    void registrarAccion({ accion: 'publicar_disponibilidad_semana', estado: 'error', resumen: resumenAccion, error: detalle });
    return {
      answer: `El borrador está guardado, pero no he podido publicarlo: ${detalle.slice(0, 220)}\nNo se ha enviado nada a los entrenadores. Puede publicarlo desde Disponibilidad.`,
    };
  }
}

export async function continuarDisponibilidad(
  continuacion: Record<string, unknown> & { kind: string }
): Promise<SalidaAccion> {
  const id = String(continuacion.propuesta_id || '');
  if (continuacion.kind === 'accion_disp_cancelar') {
    if (propuesta && propuesta.id === id) propuesta = null;
    return { answer: 'De acuerdo, no he guardado ni enviado nada.' };
  }
  if (continuacion.kind === 'accion_disp_confirmar') {
    return confirmar(id, continuacion.publicar === true);
  }
  return { answer: 'No reconozco esa acción. No he cambiado nada.' };
}
