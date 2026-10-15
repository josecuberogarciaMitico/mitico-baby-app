// Paco · volcar AimHarder en Baby: el hilo entre la frase de Jose y la acción real.
//
//   1. «Carga la semana que viene de AimHarder» → se decide la semana (si no la
//      dice, Paco pregunta con botones).
//   2. SOLO LECTURA: se leen de AimHarder los turnos Baby y sus niños activos, y de
//      la app lo que ya hay. Se enseña una vista previa por turno.
//   3. Solo al pulsar «Sí, cargar» se escribe, con las mismas funciones que el botón
//      «Cargar semana Baby» de la Agenda, y después se vuelve a leer para comprobarlo.
//   Paco NUNCA quita a nadie de un turno: si AimHarder quita a un niño (cancelación),
//   ese niño se queda; si además hay niños nuevos, se añaden («solo añadir», igual que
//   la tarjeta de la Agenda). Quitar queda para «Refrescar listado» de la Agenda.
import { findListImportIdentityConflicts, verifyRosterSnapshot } from '../../core/sessions/rosterSync';
import { etiquetaDia, horaCorta, type SalidaAccion } from './pacoAccionesLogic';
import { hoyMadrid, registrarAccion } from './pacoAccionesService';
import {
  accionables,
  opcionesSemana,
  planAmbiguo,
  planificarTurno,
  semanaDesdeMensaje,
  semanaValida,
  textoResultado,
  textoVistaPrevia,
  type ConocimientoAlumno,
  type PlanTurno,
  type ResultadoTurno,
  type SesionExistente,
  type TurnoAimHarder,
} from './pacoAimHarderBabyLogic';
import {
  anadirNinosATurno,
  crearTurnoDesdeAimHarder,
  leerConocimientoAlumnos,
  leerFichasVolcado,
  leerRosterSesion,
  leerSemanaBabyAimHarder,
  leerSesionesBabySemana,
} from './pacoAimHarderBabyService';

const VIGENCIA_MS = 30 * 60 * 1000;

type PropuestaAim = {
  id: string;
  creada: number;
  semana: string;
  turnos: TurnoAimHarder[]; // lo leído de AimHarder (no se vuelve a consultar al confirmar)
  planes: PlanTurno[];
};

// Solo hay UNA vista previa viva (la última). Los botones de las anteriores no valen.
let propuesta: PropuestaAim | null = null;
let leyendo = false;

function propuestaViva() {
  if (propuesta && Date.now() - propuesta.creada > VIGENCIA_MS) propuesta = null;
  return propuesta;
}

export function hayPropuestaAimHarder() {
  return propuestaViva() !== null;
}

function estadoHttp(error: unknown) {
  return (error as { status?: number } | null)?.status;
}

function nuevoId() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

function manejarFallo(error: unknown, contexto: string): SalidaAccion {
  const estado = estadoHttp(error);
  if (estado === 401) throw error;
  const detalle = error instanceof Error ? error.message : '';
  console.warn(`Paco AimHarder Baby: ${contexto}`, error);
  return { answer: `${contexto}${detalle ? ` (${detalle.slice(0, 220)})` : ''} No he cambiado nada.` };
}

function etiqueta(p: { fecha: string; inicio: string; fin: string }) {
  return `${etiquetaDia(p.fecha)} · ${horaCorta(p.inicio)}–${horaCorta(p.fin)}`;
}

// ---------- 1) Pedir / preparar la vista previa (solo lectura) --------------------------

export async function prepararVolcadoBaby(mensaje: string): Promise<SalidaAccion> {
  const hoy = hoyMadrid();
  const pedida = semanaDesdeMensaje(mensaje, hoy);
  if (pedida.esOcio) {
    return {
      answer:
        'Cargar los niños de Ocio desde AimHarder todavía no lo sé hacer desde aquí, señor Cubero (Ocio es más delicado y lo haré aparte). Lo de Baby sí: dígame «carga la semana que viene de AimHarder». No he cambiado nada.',
    };
  }
  if (!pedida.semana) {
    return {
      answer: '¿Qué semana de Baby quiere que traiga de AimHarder? Primero le enseño qué cambiaría; no toco nada hasta que me lo confirme.',
      choices: [
        ...opcionesSemana(hoy).map((o) => ({
          label: o.etiqueta,
          continuation: { kind: 'accion_aim_semana', semana: o.semana },
        })),
        { label: 'Cancelar', continuation: { kind: 'accion_aim_cancelar', propuesta_id: '' } },
      ],
    };
  }
  return vistaPrevia(pedida.semana);
}

async function vistaPrevia(semana: string): Promise<SalidaAccion> {
  if (leyendo) {
    return { answer: 'Ya estoy leyendo AimHarder, señor Cubero; espere a que termine y se lo enseño. No he cambiado nada.' };
  }
  leyendo = true;
  try {
    let lectura;
    try {
      lectura = await leerSemanaBabyAimHarder(semana);
    } catch (error) {
      if (estadoHttp(error) === 403) throw error;
      return manejarFallo(error, 'No he podido leer AimHarder ahora mismo.');
    }
    if (lectura.turnos.length === 0) {
      return {
        answer: `AimHarder no me devuelve ningún turno Baby con datos para esa semana.${
          lectura.incidencias.length ? `\nAvisos: ${lectura.incidencias.join(' | ')}` : ''
        } No he cambiado nada.`,
      };
    }

    let existentes: SesionExistente[];
    try {
      existentes = await leerSesionesBabySemana(semana);
    } catch (error) {
      return manejarFallo(error, 'No he podido leer los turnos de Baby de la app.');
    }

    let conocidos: ConocimientoAlumno | null = null;
    try {
      conocidos = await leerConocimientoAlumnos();
    } catch (error) {
      if (estadoHttp(error) === 401) throw error;
      console.warn('Paco AimHarder Baby: no se pudo comprobar qué niños son nuevos.', error);
    }

    const planes = lectura.turnos.map((turno) => {
      const coincidentes = existentes.filter((e) => e.fecha === turno.fecha && e.inicio === turno.inicio);
      if (coincidentes.length > 1) return planAmbiguo(turno, coincidentes.length);
      return planificarTurno(turno, coincidentes[0] ?? null, conocidos);
    });

    const hacer = accionables(planes);
    const texto = textoVistaPrevia(semana, planes, lectura.incidencias, conocidos !== null);
    if (hacer.length === 0) {
      propuesta = null;
      return { answer: texto };
    }
    propuesta = { id: nuevoId(), creada: Date.now(), semana, turnos: lectura.turnos, planes };
    return {
      answer: texto,
      choices: [
        {
          label: `Sí, cargar ${hacer.length} turno${hacer.length === 1 ? '' : 's'}`,
          continuation: { kind: 'accion_aim_confirmar', propuesta_id: propuesta.id },
        },
        { label: 'Cancelar', continuation: { kind: 'accion_aim_cancelar', propuesta_id: propuesta.id } },
      ],
    };
  } finally {
    leyendo = false;
  }
}

// ---------- 2) Botones ---------------------------------------------------------------------

export async function continuarVolcadoBaby(c: Record<string, unknown> & { kind: string }): Promise<SalidaAccion> {
  switch (c.kind) {
    case 'accion_aim_semana': {
      const semana = semanaValida(c.semana, hoyMadrid());
      if (!semana) return { answer: 'Esa semana no es válida. No he cambiado nada; pídamelo de nuevo.' };
      return vistaPrevia(semana);
    }
    case 'accion_aim_cancelar': {
      if (propuesta && String(c.propuesta_id || '') === propuesta.id) propuesta = null;
      return { answer: 'De acuerdo, no he tocado nada.' };
    }
    case 'accion_aim_confirmar':
      return confirmar(String(c.propuesta_id || ''));
    default:
      return { answer: 'No reconozco esa acción. No he cambiado nada.' };
  }
}

// ---------- 3) Escribir (solo tras pulsar el botón) ------------------------------------------

async function confirmar(propuestaId: string): Promise<SalidaAccion> {
  const viva = propuestaViva();
  if (!viva || viva.id !== propuestaId) {
    return {
      answer:
        'Esa vista previa ya no vale (ha pasado un rato o hay otra más reciente). No he cambiado nada; pídame de nuevo cargar AimHarder y la preparo otra vez.',
    };
  }
  // Un solo uso: así un doble clic no escribe dos veces.
  propuesta = null;

  // Se vuelve a mirar la app JUSTO ahora: si alguien tocó un turno desde la vista previa, se re-evalúa.
  let existentes: SesionExistente[];
  try {
    existentes = await leerSesionesBabySemana(viva.semana);
  } catch (error) {
    return manejarFallo(error, 'No he podido volver a leer los turnos de la app antes de cargar.');
  }

  const resultados: ResultadoTurno[] = [];
  for (const plan of accionables(viva.planes)) {
    const turno = viva.turnos.find((t) => `${t.fecha}__${t.inicio}` === plan.clave);
    if (!turno) continue;
    try {
      resultados.push(await aplicarTurno(plan, turno, existentes));
    } catch (error) {
      if (estadoHttp(error) === 401) throw error;
      resultados.push({
        clave: plan.clave,
        etiqueta: etiqueta(plan),
        resultado: 'error',
        detalle: error instanceof Error ? error.message.slice(0, 220) : 'Error desconocido.',
      });
    }
  }

  const hechos = resultados.filter((r) => r.resultado === 'creado' || r.resultado === 'anadido');
  const fallos = resultados.filter((r) => r.resultado === 'error');
  void registrarAccion({
    accion: 'volcar_aimharder_baby',
    estado: hechos.length === 0 && fallos.length > 0 ? 'error' : 'ok',
    resumen: `Semana ${viva.semana}: ${hechos.length} turno(s) cargado(s), ${resultados.filter((r) => r.resultado === 'omitido').length} omitido(s), ${fallos.length} con error`,
    parametros: { semana: viva.semana, turnos: resultados.map((r) => r.clave) },
    resultado: { resultados },
    error: fallos.length ? fallos.map((r) => `${r.clave}: ${r.detalle}`).join(' | ') : undefined,
  });
  return { answer: textoResultado(viva.semana, resultados) };
}

async function aplicarTurno(plan: PlanTurno, turno: TurnoAimHarder, existentes: SesionExistente[]): Promise<ResultadoTurno> {
  const base = { clave: plan.clave, etiqueta: etiqueta(plan) };
  const coincidentes = existentes.filter((e) => e.fecha === turno.fecha && e.inicio === turno.inicio);
  if (coincidentes.length > 1) {
    return { ...base, resultado: 'omitido', detalle: 'ahora hay varios turnos con esa hora; no he tocado ninguno.' };
  }
  const actual = planificarTurno(turno, coincidentes[0] ?? null, null);

  if (plan.estado === 'crear') {
    if (actual.estado !== 'crear') {
      return {
        ...base,
        resultado: 'omitido',
        detalle: 'el turno ya existe en la app desde que preparé la vista previa; no lo he tocado (use «Cargar semana» o «Refrescar listado» si hace falta).',
      };
    }
    const r = await crearTurnoDesdeAimHarder({ fecha: turno.fecha, inicio: turno.inicio, fin: turno.fin, nombres: turno.nombres });
    if (!r?.creada || !r.sesion_id) {
      return {
        ...base,
        resultado: 'omitido',
        detalle: r?.ya_existia ? 'la base de datos dice que el turno ya existía; no lo he tocado.' : 'la base de datos no ha creado el turno.',
      };
    }
    return { ...base, ...(await comprobar(r.sesion_id, turno.nombres, 'creado', `turno creado con ${turno.nombres.length} niño(s)`)) };
  }

  // plan.estado === 'anadir'
  if (actual.estado !== 'anadir' || !actual.sesion_id) {
    return {
      ...base,
      resultado: 'omitido',
      detalle:
        actual.estado === 'al_dia'
          ? 'ya estaba al día; no he hecho nada.'
          : 'ha cambiado desde la vista previa y ya no es seguro añadir desde aquí; revíselo en la Agenda.',
    };
  }
  if (actual.soloAnadir) {
    // «Solo añadir»: se vuelve a enviar a todos los que ya están. Antes se comprueba
    // que ninguno cambiaría de ficha (duplicados), porque saldría de su grupo.
    // Los «pendiente de Alta/Test» no están en grupos y no cuentan.
    const conservados = (coincidentes[0]?.roster || []).filter(
      (m) => m.alumnoId && String(m.estado || '').trim().toUpperCase() !== 'PENDIENTE_TEST'
    );
    if (conservados.length > 0) {
      const fichas = await leerFichasVolcado(conservados.map((m) => m.name));
      const conflictos = findListImportIdentityConflicts(
        conservados.map((m) => ({ alumnoId: String(m.alumnoId), name: m.name })),
        fichas
      );
      if (conflictos.length > 0) {
        return {
          ...base,
          resultado: 'omitido',
          detalle: `la ficha de ${conflictos.join(', ')} está duplicada o no coincide con su nombre y podría salirse de su grupo; no he tocado el turno (use «+ Alumno fuera de plazo»).`,
        };
      }
    }
  }
  await anadirNinosATurno(actual.sesion_id, actual.listaVolcado);
  const avisoQuedan = actual.soloAnadir && actual.quitar.length
    ? `; siguen en el turno aunque no salen en AimHarder: ${actual.quitar.slice(0, 8).join(', ')}${actual.quitar.length > 8 ? '…' : ''}`
    : '';
  return {
    ...base,
    ...(await comprobar(actual.sesion_id, actual.listaVolcado, 'anadido', `añadidos ${actual.anadir.length}: ${actual.anadir.slice(0, 8).join(', ')}${actual.anadir.length > 8 ? '…' : ''}${avisoQuedan}`)),
  };
}

// Vuelve a leer el turno y comprueba que están todos los niños de AimHarder y que no ha salido nadie.
async function comprobar(
  sesionId: string,
  nombres: string[],
  resultado: 'creado' | 'anadido',
  detalle: string
): Promise<Pick<ResultadoTurno, 'resultado' | 'detalle'>> {
  try {
    const actuales = await leerRosterSesion(sesionId);
    const v = verifyRosterSnapshot(actuales, nombres, []);
    if (v.matches) return { resultado, detalle: `${detalle}. Comprobado volviendo a leer.` };
    const avisos: string[] = [];
    if (v.missingActiveNames.length) avisos.push(`no veo en el turno a ${v.missingActiveNames.join(', ')}`);
    if (v.unexpectedMembers.length) avisos.push(`hay niños que AimHarder no tiene: ${v.unexpectedMembers.map((m) => m.name).join(', ')}`);
    return { resultado, detalle: `${detalle}. Ojo al comprobarlo: ${avisos.join('; ')}. Revíselo en la Agenda.` };
  } catch (error) {
    if (estadoHttp(error) === 401) throw error;
    return { resultado, detalle: `${detalle}. Ojo: no he podido volver a leer el turno para comprobarlo.` };
  }
}
