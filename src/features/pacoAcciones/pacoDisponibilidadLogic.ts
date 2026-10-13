// Paco · disponibilidad semanal (lógica pura, sin red ni React).
//
// Jose dice «prepara la disponibilidad quitando el domingo de las 12 y
// añadiendo el jueves a las 17:00». Aquí se decide qué quiere decir eso sobre
// el borrador real de la semana (el mismo que usa la pantalla Disponibilidad),
// se aplican los cambios con las MISMAS reglas del editor y se redacta la
// tarjeta «voy a dejar la semana así, ¿confirmas?». Nada de este archivo
// escribe datos.
import {
  crearBorradorDisponibilidadEditor,
  diaPermiteVariosTurnosDisponibilidadEditor,
  idTurnoDisponibilidadEditor,
  normalizarBorradorDisponibilidadEditor,
  sumarDiasEditor,
  validarBorradorDisponibilidadEditor,
  type BorradorDisponibilidadEditor,
  type DiaDisponibilidadEditor,
  type ModalidadDisponibilidadEditor,
  type TurnoDisponibilidadEditor,
} from '../availability/availabilityEditor';
import { diaDeSemanaIso, diaDesdeTexto, limpiarHora, sinTildes } from './pacoAccionesLogic';

// ---------- Tipos --------------------------------------------------------------------

export type TipoOpDisponibilidad =
  | 'quitar_dia'
  | 'quitar_turno'
  | 'anadir_turno'
  | 'cambiar_turno'
  | 'cambiar_modalidades'
  | 'activar_dia'
  | 'solo_dias'
  | 'fecha_limite';

const TIPOS_OP: TipoOpDisponibilidad[] = [
  'quitar_dia',
  'quitar_turno',
  'anadir_turno',
  'cambiar_turno',
  'cambiar_modalidades',
  'activar_dia',
  'solo_dias',
  'fecha_limite',
];

export type OpDisponibilidad = {
  op: TipoOpDisponibilidad;
  dia: number | null; // 1 = lunes … 7 = domingo
  dias: number[];
  hora_inicio: string | null;
  hora_fin: string | null;
  hora_inicio_nueva: string | null;
  hora_fin_nueva: string | null;
  numero_turno: number | null; // «el tercer turno» = 3; «el último» = -1
  modalidades: ModalidadDisponibilidadEditor[];
  fecha_limite: string | null; // YYYY-MM-DDTHH:MM
};

// Lo que el servidor (Gemini) entiende de la frase. Solo extrae; nunca decide.
export type IntentDisponibilidad = {
  accion: 'editar_disponibilidad' | 'ninguna';
  semana_fecha: string | null; // YYYY-MM-DD si Jose dijo una fecha concreta
  semana_relativa: 'esta' | 'proxima' | null;
  desde_cero: boolean; // «desde la plantilla», «empieza de cero»
  enviar: boolean; // Jose habló de mandar / publicar (solo cambia el orden de los botones)
  ops: OpDisponibilidad[];
};

export type BaseDisponibilidad = 'plantilla' | 'borrador' | 'publicado';

export type PropuestaDisponibilidad = {
  id: string;
  semana_inicio: string;
  base: BaseDisponibilidad;
  version_publicada: number;
  borrador: BorradorDisponibilidadEditor;
  cambios: string[];
  problemas: string[];
  errorValidacion: string | null;
  enviar: boolean;
  // Foto del estado del servidor al preparar la propuesta: si cambia antes de
  // confirmar, no se escribe nada.
  instantanea: { existe: boolean; estado: string; version_publicada: number; actualizado_en: string | null };
  respuestas: { respondieron: number; total: number } | null;
  creada: number;
};

// ---------- Días y horas ---------------------------------------------------------------

const NOMBRE_DIA: Record<number, string> = {
  3: 'miércoles',
  4: 'jueves',
  5: 'viernes',
  6: 'sábado',
  7: 'domingo',
};

const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

function nombreDiaLargo(fechaIso: string) {
  const f = new Date(`${fechaIso}T12:00:00`);
  const [, mes, dia] = fechaIso.slice(0, 10).split('-');
  return `${DIAS_LARGOS[f.getDay()]} ${dia}/${mes}`;
}

function minutos(hora: string) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + (m || 0);
}

function deMinutos(total: number) {
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

export function lunesDe(fechaIso: string) {
  return sumarDiasEditor(fechaIso, -(diaDeSemanaIso(fechaIso) - 1));
}

// «Esta semana» el domingo por la noche es, en la práctica, la semana que empieza mañana.
export function semanaPorDefecto(hoyIso: string) {
  const lunes = lunesDe(hoyIso);
  return diaDeSemanaIso(hoyIso) === 7 ? sumarDiasEditor(lunes, 7) : lunes;
}

export function resolverSemana(
  hoyIso: string,
  semana: { fecha: string | null; relativa: 'esta' | 'proxima' | null }
) {
  if (semana.fecha) return lunesDe(semana.fecha);
  if (semana.relativa === 'proxima') return sumarDiasEditor(lunesDe(hoyIso), 7);
  if (semana.relativa === 'esta') return lunesDe(hoyIso);
  return semanaPorDefecto(hoyIso);
}

export function rangoSemana(semanaInicio: string) {
  const f = (iso: string) => `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
  return `${f(semanaInicio)} al ${f(sumarDiasEditor(semanaInicio, 6))}`;
}

// ---------- Qué mensajes son para este módulo ---------------------------------------------

const NO_ES_ENVIO =
  /\b(no han respondido|sin responder|sin contestar|han respondido|han contestado|respondido|contestado|pendientes? de responder|recordatorio|recuerda|recordar|quien|quienes|cuantos|cuantas|retira|retirar|cierra|cerrar|resumen)\b/;

// «Manda / publica / prepara la disponibilidad…». Las consultas («quién no ha
// respondido») y los recordatorios NO son para aquí.
export function parecePeticionDisponibilidad(mensaje: string) {
  const n = sinTildes(mensaje).toLowerCase();
  if (n.length > 400 || NO_ES_ENVIO.test(n)) return false;
  const verbo =
    /\b(manda|mandar|mandale|mandales|mandala|envia|enviar|enviale|enviales|enviala|publica|publicar|publicala|prepara|preparar|preparame|abre|abrir|lanza|lanzar|saca|sacar|crea|crear|monta|montar|haz|hacer|genera|generar|pasa|pasar|pasales)\b/.test(
      n
    );
  if (!verbo) return false;
  if (/\bdisponibilidad(es)?\b/.test(n) || /\bturnos? de (la )?semana\b/.test(n)) return true;
  // «Prepara la semana que viene quitando el jueves y el tercer turno del sábado»:
  // habla de la semana y de días/turnos, y no de Ocio, grupos, informes ni AimHarder.
  const semana = /\b(la|esta) semana\b/.test(n) || /\bsemana (que viene|proxima|siguiente)\b/.test(n);
  const dias = /\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo|turno|turnos)\b/.test(n);
  const otroTema = /\b(ocio|grupos?|informes?|reportes?|aim ?harder|aimhander|cobros?|baby|alumnos?|ninos?|entrenador(es)? de)\b/.test(n);
  return semana && dias && !otroTema;
}

// Con una propuesta enseñada y sin confirmar, «quita el domingo de las 12»,
// «añade el jueves a las 17» o «pon el límite el martes» siguen editándola.
export function parecePeticionEditarPropuesta(mensaje: string) {
  const n = sinTildes(mensaje).toLowerCase();
  if (n.length > 300) return false;
  // Raíces verbales: «quita», «quitado», «quitalo», «quítame», «pon», «ponlo», «añade», «añadido»…
  const verbo =
    /\b(quit\w*|elimin\w*|borr\w*|sin|solo|unicamente|anad\w*|agreg\w*|pon|pone|ponlo|ponla|poner|puesto|cambi\w*|muev\w*|mov\w*|dej\w*|activ\w*|desactiv\w*|adelant\w*|atras\w*|retras\w*|ampli\w*|reduc\w*|cancel\w*|fuera|no hay|no quiero|no habra|ya no|hay que)\b/.test(
      n
    );
  const dato =
    /\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo|turno|turnos|dia|dias|hora|limite|plazo|baby|ocio|intensivos?|\d{1,2}[:.]\d{2}|a las \d{1,2})\b/.test(
      n
    );
  // Una hora concreta («14:30–16:30 este turno del sábado») también basta: con una
  // propuesta en pantalla se entiende como ajuste de esa propuesta.
  const horaYDia = /\d{1,2}[:.]\d{2}/.test(n) && /\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo|turno|turnos)\b/.test(n);
  return (verbo && dato) || horaYDia;
}

// «Envíala», «publícala»…: no se confirma por texto, solo con el botón.
export function parecePeticionConfirmarPorTexto(mensaje: string) {
  const n = sinTildes(mensaje).toLowerCase();
  if (n.length > 80) return false;
  return /\b(envia|enviala|enviale|enviales|manda|mandala|mandale|mandales|publica|publicala|guarda|guardala|confirma|confirmala|hazlo|dale)\b/.test(
    n
  );
}

// ---------- Saneado de lo que devuelve el servidor ------------------------------------------

function limpiarModalidades(valor: unknown): ModalidadDisponibilidadEditor[] {
  const lista = Array.isArray(valor) ? valor : typeof valor === 'string' ? [valor] : [];
  const salida: ModalidadDisponibilidadEditor[] = [];
  for (const item of lista) {
    const t = sinTildes(item).toLowerCase();
    const m: ModalidadDisponibilidadEditor | null = t.startsWith('baby')
      ? 'Baby'
      : t.startsWith('ocio')
        ? 'Ocio'
        : t.startsWith('intensiv')
          ? 'Intensivos'
          : null;
    if (m && !salida.includes(m)) salida.push(m);
  }
  return salida;
}

export function limpiarFechaLimite(valor: unknown): string | null {
  const m = String(valor ?? '')
    .trim()
    .match(/^(\d{4})-(\d{2})-(\d{2})[T ](\d{1,2}):(\d{2})/);
  if (!m) return null;
  const fecha = `${m[1]}-${m[2]}-${m[3]}`;
  if (Number.isNaN(new Date(`${fecha}T12:00:00`).getTime())) return null;
  const h = Number(m[4]);
  const mi = Number(m[5]);
  if (h > 23 || mi > 59) return null;
  return `${fecha}T${String(h).padStart(2, '0')}:${String(mi).padStart(2, '0')}`;
}

function limpiarFechaSimple(valor: unknown): string | null {
  const t = String(valor ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(t)) return null;
  return Number.isNaN(new Date(`${t}T12:00:00`).getTime()) ? null : t;
}

function limpiarNumeroTurno(valor: unknown): number | null {
  const n = Number(valor);
  if (!Number.isInteger(n)) return null;
  return n === -1 || (n >= 1 && n <= 6) ? n : null;
}

function limpiarOp(crudo: unknown): OpDisponibilidad | null {
  const x = crudo && typeof crudo === 'object' ? (crudo as Record<string, unknown>) : null;
  if (!x) return null;
  const op = String(x.op || '') as TipoOpDisponibilidad;
  if (!TIPOS_OP.includes(op)) return null;
  const dias = Array.isArray(x.dias)
    ? Array.from(
        new Set(
          x.dias.map((d) => diaDesdeTexto(d)).filter((d): d is number => d !== null)
        )
      )
    : [];
  return {
    op,
    dia: diaDesdeTexto(x.dia),
    dias,
    hora_inicio: limpiarHora(x.hora_inicio),
    hora_fin: limpiarHora(x.hora_fin),
    hora_inicio_nueva: limpiarHora(x.hora_inicio_nueva),
    hora_fin_nueva: limpiarHora(x.hora_fin_nueva),
    numero_turno: limpiarNumeroTurno(x.numero_turno),
    modalidades: limpiarModalidades(x.modalidades),
    fecha_limite: limpiarFechaLimite(x.fecha_limite),
  };
}

export function limpiarIntentDisponibilidad(crudo: unknown): IntentDisponibilidad {
  const x = crudo && typeof crudo === 'object' ? (crudo as Record<string, unknown>) : {};
  const relativa = sinTildes(x.semana_relativa).toLowerCase();
  const ops = (Array.isArray(x.ops) ? x.ops : [])
    .slice(0, 12)
    .map(limpiarOp)
    .filter((o): o is OpDisponibilidad => o !== null);
  return {
    accion: x.accion === 'editar_disponibilidad' ? 'editar_disponibilidad' : 'ninguna',
    semana_fecha: limpiarFechaSimple(x.semana_fecha),
    semana_relativa: relativa.startsWith('prox') ? 'proxima' : relativa === 'esta' ? 'esta' : null,
    desde_cero: x.desde_cero === true,
    enviar: x.enviar === true,
    ops,
  };
}

// ---------- Aplicar los cambios con las reglas del editor -----------------------------------

function clonar<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor)) as T;
}

function textoTurno(t: Pick<TurnoDisponibilidadEditor, 'hora_inicio' | 'hora_fin' | 'modalidades'>) {
  return `${t.hora_inicio}–${t.hora_fin} · ${t.modalidades.join(', ')}`;
}

function modalidadesPorDefecto(nombreDia: string): ModalidadDisponibilidadEditor[] {
  return diaPermiteVariosTurnosDisponibilidadEditor(nombreDia) ? ['Baby', 'Ocio'] : ['Baby'];
}

function turnosDePlantilla(semanaInicio: string, nombreDia: string) {
  const dia = crearBorradorDisponibilidadEditor(semanaInicio).dias.find((d) => d.nombre === nombreDia);
  return dia ? clonar(dia.turnos) : [];
}

function resolverTurno(
  dia: DiaDisponibilidadEditor,
  horaInicio: string | null,
  numero: number | null = null
): { turno: TurnoDisponibilidadEditor } | { problema: string } {
  const nombre = dia.nombre;
  if (!dia.activo || dia.turnos.length === 0) {
    return { problema: `El ${nombre} no tiene clases en esta propuesta.` };
  }
  const ordenados = [...dia.turnos].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
  const lista = ordenados.map(textoTurno).join(' / ');
  if (horaInicio) {
    const turno = dia.turnos.find((t) => t.hora_inicio === horaInicio);
    return turno
      ? { turno }
      : { problema: `El ${nombre} no tiene ningún turno que empiece a las ${horaInicio} (tiene: ${lista}).` };
  }
  if (numero !== null) {
    const indice = numero === -1 ? ordenados.length - 1 : numero - 1;
    return ordenados[indice]
      ? { turno: ordenados[indice] }
      : { problema: `El ${nombre} solo tiene ${ordenados.length} ${ordenados.length === 1 ? 'turno' : 'turnos'} (${lista}); no hay un turno número ${numero}.` };
  }
  if (dia.turnos.length === 1) return { turno: dia.turnos[0] };
  return { problema: `El ${nombre} tiene varios turnos (${lista}); dígame a cuál se refiere.` };
}

export type ResultadoOps = {
  borrador: BorradorDisponibilidadEditor;
  cambios: string[];
  problemas: string[];
};

export function aplicarOps(
  base: BorradorDisponibilidadEditor,
  ops: OpDisponibilidad[],
  ahoraMadrid: string
): ResultadoOps {
  const borrador = clonar(base);
  const cambios: string[] = [];
  const problemas: string[] = [];

  const diaEditable = (numero: number | null): DiaDisponibilidadEditor | null => {
    if (numero === null) {
      problemas.push('No he entendido de qué día habla.');
      return null;
    }
    if (numero === 1 || numero === 2) {
      problemas.push('Lunes y martes no admiten clases en la disponibilidad.');
      return null;
    }
    const encontrado = borrador.dias.find((d) => d.nombre === NOMBRE_DIA[numero]);
    if (!encontrado) problemas.push('No encuentro ese día en la semana.');
    return encontrado || null;
  };

  const desactivar = (dia: DiaDisponibilidadEditor) => {
    dia.activo = false;
    dia.turnos = [];
  };

  for (const op of ops) {
    if (op.op === 'solo_dias') {
      const validos = op.dias.filter((d) => d >= 3 && d <= 7);
      if (validos.length === 0) {
        problemas.push('Me ha pedido dejar solo unos días, pero no he entendido cuáles.');
        continue;
      }
      for (const dia of borrador.dias) {
        const numero = Number(Object.keys(NOMBRE_DIA).find((k) => NOMBRE_DIA[Number(k)] === dia.nombre));
        if (validos.includes(numero)) {
          if (!dia.activo || dia.turnos.length === 0) {
            dia.activo = true;
            dia.turnos = turnosDePlantilla(borrador.semana_inicio, dia.nombre);
          }
        } else {
          desactivar(dia);
        }
      }
      cambios.push(`Dejo solo: ${validos.map((d) => NOMBRE_DIA[d]).join(', ')}.`);
      continue;
    }

    if (op.op === 'fecha_limite') {
      if (!op.fecha_limite) {
        problemas.push('No he entendido la fecha límite (necesito día y hora).');
      } else if (op.fecha_limite <= ahoraMadrid) {
        problemas.push(`La fecha límite ${op.fecha_limite.replace('T', ' ')} ya ha pasado; no la cambio.`);
      } else {
        borrador.fecha_limite = op.fecha_limite;
        borrador.fecha_limite_manual = true;
        cambios.push(`Fecha límite: ${nombreDiaLargo(op.fecha_limite.slice(0, 10))} a las ${op.fecha_limite.slice(11, 16)}.`);
      }
      continue;
    }

    const dia = diaEditable(op.dia);
    if (!dia) continue;
    const nombre = dia.nombre;

    switch (op.op) {
      case 'quitar_dia': {
        if (!dia.activo) {
          problemas.push(`El ${nombre} ya estaba sin clases.`);
          break;
        }
        desactivar(dia);
        cambios.push(`Quito el ${nombre} entero.`);
        break;
      }
      case 'activar_dia': {
        if (dia.activo && dia.turnos.length > 0) {
          problemas.push(`El ${nombre} ya tenía clases.`);
          break;
        }
        dia.activo = true;
        dia.turnos = turnosDePlantilla(borrador.semana_inicio, nombre);
        cambios.push(`Activo el ${nombre} con sus turnos habituales (${dia.turnos.map(textoTurno).join(' / ')}).`);
        break;
      }
      case 'quitar_turno': {
        const r = resolverTurno(dia, op.hora_inicio, op.numero_turno);
        if ('problema' in r) {
          problemas.push(r.problema);
          break;
        }
        dia.turnos = dia.turnos.filter((t) => t.id !== r.turno.id);
        cambios.push(`Quito el turno del ${nombre} ${r.turno.hora_inicio}–${r.turno.hora_fin}.`);
        if (dia.turnos.length === 0) {
          dia.activo = false;
          cambios.push(`El ${nombre} se queda sin turnos, así que queda sin clases.`);
        }
        break;
      }
      case 'anadir_turno': {
        if (!op.hora_inicio) {
          problemas.push(`Para añadir un turno el ${nombre} necesito la hora de inicio.`);
          break;
        }
        const permiteVarios = diaPermiteVariosTurnosDisponibilidadEditor(nombre);
        if (!permiteVarios && dia.activo && dia.turnos.length > 0) {
          problemas.push(
            `El ${nombre} solo admite un turno (ya tiene ${textoTurno(dia.turnos[0])}). Si quiere otro horario, pídame cambiarlo en vez de añadir.`
          );
          break;
        }
        const duracionAsumida = !op.hora_fin;
        const fin = op.hora_fin || deMinutos(minutos(op.hora_inicio) + 120);
        if (minutos(op.hora_inicio) + 120 > 24 * 60 - 1 && duracionAsumida) {
          problemas.push(`El turno del ${nombre} a las ${op.hora_inicio} acabaría pasada la medianoche; dígame la hora de fin.`);
          break;
        }
        if (minutos(fin) <= minutos(op.hora_inicio)) {
          problemas.push(`En el ${nombre}, la hora de fin (${fin}) debe ser posterior a la de inicio (${op.hora_inicio}).`);
          break;
        }
        if (dia.activo && dia.turnos.some((t) => t.hora_inicio === op.hora_inicio)) {
          problemas.push(`El ${nombre} ya tiene un turno que empieza a las ${op.hora_inicio}.`);
          break;
        }
        const modalidades = op.modalidades.length ? op.modalidades : modalidadesPorDefecto(nombre);
        const nuevo: TurnoDisponibilidadEditor = {
          id: idTurnoDisponibilidadEditor(),
          hora_inicio: op.hora_inicio,
          hora_fin: fin,
          modalidades,
          nota: '',
        };
        if (!dia.activo) dia.turnos = [];
        dia.activo = true;
        dia.turnos = [...dia.turnos, nuevo].sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
        const supuestos = [
          duracionAsumida ? 'duración de 2 h' : '',
          op.modalidades.length ? '' : `modalidad ${modalidades.join(' y ')}`,
        ].filter(Boolean);
        cambios.push(
          `Añado el turno del ${nombre} ${textoTurno(nuevo)}${supuestos.length ? ` (he supuesto ${supuestos.join(' y ')}; dígame si no)` : ''}.`
        );
        break;
      }
      case 'cambiar_turno': {
        if (!op.hora_inicio_nueva && !op.hora_fin_nueva) {
          problemas.push(`No he entendido a qué horario quiere cambiar el turno del ${nombre}.`);
          break;
        }
        const r = resolverTurno(dia, op.hora_inicio, op.numero_turno);
        if ('problema' in r) {
          problemas.push(r.problema);
          break;
        }
        const antes = textoTurno(r.turno);
        const duracion = minutos(r.turno.hora_fin) - minutos(r.turno.hora_inicio);
        const ini = op.hora_inicio_nueva || r.turno.hora_inicio;
        const fin =
          op.hora_fin_nueva ||
          (op.hora_inicio_nueva ? deMinutos(minutos(ini) + duracion) : r.turno.hora_fin);
        if (minutos(fin) <= minutos(ini) || minutos(fin) > 24 * 60 - 1) {
          problemas.push(`El nuevo horario del ${nombre} (${ini}–${fin}) no es válido.`);
          break;
        }
        if (dia.turnos.some((t) => t.id !== r.turno.id && t.hora_inicio === ini)) {
          problemas.push(`El ${nombre} ya tiene otro turno que empieza a las ${ini}.`);
          break;
        }
        r.turno.hora_inicio = ini;
        r.turno.hora_fin = fin;
        dia.turnos.sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));
        cambios.push(`Cambio el turno del ${nombre}: ${antes} → ${textoTurno(r.turno)}.`);
        break;
      }
      case 'cambiar_modalidades': {
        if (op.modalidades.length === 0) {
          problemas.push(`No he entendido qué modalidades quiere en el ${nombre}.`);
          break;
        }
        if (!dia.activo || dia.turnos.length === 0) {
          problemas.push(`El ${nombre} no tiene clases en esta propuesta.`);
          break;
        }
        let objetivo: TurnoDisponibilidadEditor[];
        if (op.hora_inicio || op.numero_turno !== null) {
          const r = resolverTurno(dia, op.hora_inicio, op.numero_turno);
          if ('problema' in r) {
            problemas.push(r.problema);
            break;
          }
          objetivo = [r.turno];
        } else {
          objetivo = dia.turnos;
        }
        objetivo.forEach((t) => {
          t.modalidades = [...op.modalidades];
        });
        cambios.push(
          `${objetivo.length === 1 ? `Turno del ${nombre} ${objetivo[0].hora_inicio}` : `Todos los turnos del ${nombre}`}: solo ${op.modalidades.join(' y ')}.`
        );
        break;
      }
      default:
        break;
    }
  }

  return { borrador, cambios, problemas };
}

// Pasa el borrador por las reglas del propio editor (las mismas que al pulsar
// «Guardar» en Disponibilidad) y devuelve el borrador normalizado + el error, si hay.
export function normalizarYValidar(borrador: BorradorDisponibilidadEditor) {
  const normalizado = normalizarBorradorDisponibilidadEditor(borrador);
  return { normalizado, error: validarBorradorDisponibilidadEditor(normalizado) };
}

// ---------- Comparar para verificar ------------------------------------------------------------

export type ResumenComparable = {
  fecha_limite: string;
  dias: Array<{ fecha: string; turnos: Array<{ i: string; f: string; m: string[] }> }>;
};

export function resumenComparable(
  fechaLimite: string | null | undefined,
  dias: Array<Pick<DiaDisponibilidadEditor, 'fecha' | 'activo' | 'turnos'>>
): ResumenComparable {
  return {
    fecha_limite: String(fechaLimite || '').slice(0, 16),
    dias: dias
      .filter((d) => d.activo && d.turnos.length > 0)
      .map((d) => ({
        fecha: d.fecha,
        turnos: d.turnos
          .map((t) => ({
            i: String(t.hora_inicio).slice(0, 5),
            f: String(t.hora_fin).slice(0, 5),
            m: [...t.modalidades].sort(),
          }))
          .sort((a, b) => a.i.localeCompare(b.i)),
      }))
      .sort((a, b) => a.fecha.localeCompare(b.fecha)),
  };
}

export function mismoResumen(a: ResumenComparable, b: ResumenComparable) {
  return JSON.stringify(a) === JSON.stringify(b);
}

// ---------- Texto de la tarjeta -----------------------------------------------------------------

export function textoSemana(borrador: BorradorDisponibilidadEditor) {
  const lineas = borrador.dias.map((dia) => {
    const etiqueta = nombreDiaLargo(dia.fecha);
    if (!dia.activo || dia.turnos.length === 0) return `· ${etiqueta}: sin clases`;
    return `· ${etiqueta}: ${dia.turnos.map(textoTurno).join('  |  ')}`;
  });
  const limite = borrador.fecha_limite
    ? `${nombreDiaLargo(borrador.fecha_limite.slice(0, 10))} a las ${borrador.fecha_limite.slice(11, 16)}`
    : 'sin fecha límite';
  return `${lineas.join('\n')}\nFecha límite para responder: ${limite}.`;
}

const ORIGEN: Record<BaseDisponibilidad, string> = {
  plantilla: 'la plantilla habitual (esta semana aún no estaba preparada)',
  borrador: 'el borrador que ya tenía guardado',
  publicado: 'la disponibilidad que ya estaba publicada',
};

export function textoPropuesta(p: PropuestaDisponibilidad): string {
  const partes: string[] = [];
  partes.push(`Disponibilidad de la semana del ${rangoSemana(p.semana_inicio)}, partiendo de ${ORIGEN[p.base]}:`);
  partes.push(textoSemana(p.borrador));
  if (p.cambios.length) partes.push(`Cambios que he hecho:\n${p.cambios.map((c) => `– ${c}`).join('\n')}`);
  if (p.problemas.length) {
    partes.push(`No he podido hacer esto (revíselo):\n${p.problemas.map((c) => `– ${c}`).join('\n')}`);
  }
  if (p.errorValidacion) {
    partes.push(`Ojo: así no se puede guardar. ${p.errorValidacion} Dígame cómo lo arreglo.`);
  }
  if (p.version_publicada > 0) {
    const resp = p.respuestas
      ? ` Ya han respondido ${p.respuestas.respondieron} de ${p.respuestas.total} entrenadores.`
      : '';
    partes.push(
      `⚠ Esta semana YA se publicó antes (versión ${p.version_publicada}).${resp} Si la publico de nuevo se borran las respuestas y todos tendrán que confirmar otra vez.`
    );
  }
  if (!p.errorValidacion) {
    partes.push('¿La dejo así? Puede decirme más cambios, o pulsar un botón.');
  }
  return partes.join('\n\n');
}
