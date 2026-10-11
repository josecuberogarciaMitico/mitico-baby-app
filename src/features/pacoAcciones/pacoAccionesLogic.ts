// Paco · acciones (lógica pura, sin red ni React).
//
// Aquí vive TODO lo que decide cosas: qué niños están sin colocar, a qué niño
// se refiere Jose, a qué turno quiere pasarlo y qué texto se le enseña antes de
// confirmar. Nada de esto escribe datos: la escritura la hace siempre la misma
// función segura de Supabase que usa hoy la Agenda
// (mover_alumno_entre_turnos_operativa_app), y solo tras pulsar «Confirmar».
import { pendingAgendaStudents } from '../agenda/agendaSessions';
import type {
  AgendaAlumnoSesionApp,
  AgendaGrupoSesionApp,
  AgendaSesionDirectaApp,
} from '../agenda/agendaTypes';
import {
  addIsoDays,
  evaluateBabyRelocationTarget,
  isBabyAgendaSession,
  mondayOfIsoWeek,
  realGroupToRelocationTarget,
  sortBabyRelocationOptions,
  type BabyRelocationOption,
} from '../agenda/agendaRelocation';

export type TurnoBaby = {
  sesion: AgendaSesionDirectaApp;
  roster: AgendaAlumnoSesionApp[];
  grupos: AgendaGrupoSesionApp[];
};

// Lo que el servidor (Gemini) entiende de la frase de Jose. Nunca decide nada:
// solo extrae lo que se dijo. Todo se vuelve a comprobar contra los datos reales.
export type IntentAccion = {
  accion: 'listar_pendientes' | 'mover_alumno' | 'ninguna';
  alumno: string | null;
  dia_destino: number | null; // 1 = lunes … 7 = domingo
  fecha_destino: string | null; // YYYY-MM-DD solo si Jose dijo una fecha concreta
  hora_destino: string | null; // HH:MM
  dia_origen: number | null;
  fecha_origen: string | null;
  hora_origen: string | null;
};

// Botón de la tarjeta de Paco (misma forma que PacoChoice, sin importarla).
export type OpcionAccion = {
  label: string;
  continuation: Record<string, unknown> & { kind: string };
};

export type SalidaAccion = {
  answer: string;
  choices?: OpcionAccion[];
};

// ---------- Texto y nombres ----------------------------------------------------

export function sinTildes(valor: unknown) {
  return String(valor ?? '')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

// Copia fiel de partesAlumnoListadoOperativoApp / nombreRealAlumnoListadoOperativo
// (App.tsx): los listados guardan «NOMBRE · NIVEL · PISTA» y hay que quedarse con el nombre.
function partesAlumno(valor: string | null | undefined) {
  const partes = String(valor || '')
    .split('·')
    .map((parte) => parte.trim())
    .filter(Boolean)
    .filter((parte) => !/^test nuevo$/i.test(parte));
  if (/^(ZZZS|TEST(?:\s|$)|\[TEST)/i.test(partes[0] || '') && partes.length > 1) {
    partes.shift();
  }
  return partes;
}

export function nombreRealAlumno(valor: string | null | undefined) {
  const partes = partesAlumno(valor);
  if (partes.length === 0) return '-';
  const partesNombre = partes.filter(
    (parte) =>
      !/^(?:NIVEL\s*:?)?(?:INICIACI[ÓO]N|DEBUT|A\+?|B\+{0,2}|C\+?|D\+?)$/i.test(parte) &&
      !/^(PEQUEÑA|GRANDE|PEQUEÑA\/GRANDE)$/i.test(parte)
  );
  const nombre = partesNombre.join(' · ').trim() || partes[0];
  return nombre.replace(/^\d+[.)-]?\s*/, '').trim();
}

// Igual que normalizarNombreAlumnoAgendaApp (App.tsx).
export function normalizarNombreAlumno(valor: string | null | undefined) {
  return sinTildes(nombreRealAlumno(valor))
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

// «LUCÍA GARCÍA» → «Lucía García» (para hablarle a Jose, no para buscar).
export function nombreBonito(valor: string | null | undefined) {
  const nombre = nombreRealAlumno(valor);
  if (nombre !== nombre.toUpperCase()) return nombre;
  return nombre
    .toLowerCase()
    .replace(/(^|[\s'-])(\p{L})/gu, (_, sep: string, letra: string) => sep + letra.toUpperCase());
}

// ---------- Días y horas ------------------------------------------------------------

const DIAS_CORTOS = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
const DIAS_LARGOS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];

const DIA_POR_NOMBRE: Record<string, number> = {
  lunes: 1,
  martes: 2,
  miercoles: 3,
  jueves: 4,
  viernes: 5,
  sabado: 6,
  sabados: 6,
  domingo: 7,
  domingos: 7,
};

export function diaDeSemanaIso(fechaIso: string) {
  const dia = new Date(`${fechaIso}T12:00:00`).getDay();
  return dia === 0 ? 7 : dia;
}

export function diaDesdeTexto(valor: unknown): number | null {
  if (typeof valor === 'number' && Number.isInteger(valor) && valor >= 1 && valor <= 7) return valor;
  const texto = sinTildes(valor).toLowerCase().trim();
  if (/^[1-7]$/.test(texto)) return Number(texto);
  return DIA_POR_NOMBRE[texto] ?? null;
}

export function etiquetaDia(fechaIso: string) {
  const fecha = new Date(`${fechaIso}T12:00:00`);
  const [, mes, dia] = fechaIso.slice(0, 10).split('-');
  return `${DIAS_CORTOS[fecha.getDay()]} ${dia}/${mes}`;
}

export function etiquetaDiaLargo(fechaIso: string) {
  const fecha = new Date(`${fechaIso}T12:00:00`);
  const [, mes, dia] = fechaIso.slice(0, 10).split('-');
  return `${DIAS_LARGOS[fecha.getDay()]} ${dia}/${mes}`;
}

export function horaCorta(valor: string | null | undefined) {
  return String(valor || '').slice(0, 5);
}

export function etiquetaTurno(sesion: Pick<AgendaSesionDirectaApp, 'fecha' | 'hora_inicio' | 'hora_fin'>) {
  return `${etiquetaDia(sesion.fecha)} · ${horaCorta(sesion.hora_inicio)}–${horaCorta(sesion.hora_fin)}`;
}

export function limpiarHora(valor: unknown): string | null {
  const m = String(valor ?? '').trim().match(/^(\d{1,2})(?:[:.hH](\d{2}))?/);
  if (!m) return null;
  const hora = Number(m[1]);
  const minutos = Number(m[2] ?? 0);
  if (hora > 23 || minutos > 59) return null;
  return `${String(hora).padStart(2, '0')}:${String(minutos).padStart(2, '0')}`;
}

function limpiarFecha(valor: unknown): string | null {
  const texto = String(valor ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(texto)) return null;
  const fecha = new Date(`${texto}T12:00:00`);
  return Number.isNaN(fecha.getTime()) ? null : texto;
}

function minutosDe(hora: string) {
  const [h, m] = hora.split(':').map(Number);
  return h * 60 + (m || 0);
}

// ---------- Qué mensajes son para este módulo -----------------------------------------

// Listados de «sin grupo / sin nivel»: no hace falta IA, se reconocen sin red.
export function parecePeticionListadoPendientes(mensaje: string) {
  const n = sinTildes(mensaje).toLowerCase();
  if (n.length > 220) return false;
  return (
    /\b(sin|por|falta(?:n)?(?: por)?)\s+(grupo|grupos|colocar|nivel|asignar)\b/.test(n) ||
    /\b(pendientes?|faltan?)\s+(de\s+)?(colocar|grupo|nivel)\b/.test(n) ||
    /\bsin\s+(colocar|asignar)\b/.test(n)
  );
}

// Filtro barato para no llamar al servidor con todo: solo frases que piden
// mover/pasar/cambiar a alguien de turno o de día.
export function parecePeticionMover(mensaje: string) {
  const n = sinTildes(mensaje).toLowerCase();
  if (n.length > 300) return false;
  const verbo = /\b(pasa|pasalo|pasala|pasar|mueve|muevelo|muevela|mover|cambia|cambialo|cambiala|cambiar|coloca|colocalo|colocala|colocar|ponlo|ponla|pon a|traslada|trasladar|reubica|reubicar)\b/.test(n);
  const destino = /\b(lunes|martes|miercoles|jueves|viernes|sabado|domingo|turno|dia|hora|\d{1,2}[:.]\d{2}|a las \d{1,2}|\d{1,2}\/\d{1,2})\b/.test(n);
  return verbo && destino;
}

// ---------- Intención que devuelve el servidor ----------------------------------------

export function limpiarIntent(crudo: unknown): IntentAccion {
  const o = (crudo && typeof crudo === 'object' ? crudo : {}) as Record<string, unknown>;
  const accion =
    o.accion === 'listar_pendientes' || o.accion === 'mover_alumno' ? o.accion : 'ninguna';
  const texto = (valor: unknown, max: number) => {
    const t = String(valor ?? '').replace(/\s+/g, ' ').trim().slice(0, max);
    return t || null;
  };
  return {
    accion,
    alumno: texto(o.alumno, 80),
    dia_destino: diaDesdeTexto(o.dia_destino),
    fecha_destino: limpiarFecha(o.fecha_destino),
    hora_destino: limpiarHora(o.hora_destino),
    dia_origen: diaDesdeTexto(o.dia_origen),
    fecha_origen: limpiarFecha(o.fecha_origen),
    hora_origen: limpiarHora(o.hora_origen),
  };
}

// ---------- Niños sin colocar / sin nivel -------------------------------------------------

export function sinNivel(alumno: Pick<AgendaAlumnoSesionApp, 'nivel_usado' | 'estado_en_listado'>) {
  return (
    !String(alumno.nivel_usado || '').trim() ||
    String(alumno.estado_en_listado || '').trim().toUpperCase() === 'PENDIENTE_TEST'
  );
}

// Mismo criterio que la Agenda: con grupos creados, «pendiente» es quien no sale
// en ninguno; si todavía no hay grupos, nadie está colocado.
export function alumnosSinColocar(turno: TurnoBaby) {
  if (turno.grupos.length === 0) return turno.roster;
  return pendingAgendaStudents(turno.roster, turno.grupos, normalizarNombreAlumno);
}

export type ResumenPendientes = {
  turnosSinGrupos: { turno: TurnoBaby; total: number }[];
  turnosConPendientes: { turno: TurnoBaby; alumnos: AgendaAlumnoSesionApp[] }[];
  sinNivel: { turno: TurnoBaby; alumno: AgendaAlumnoSesionApp }[];
};

export function resumirPendientes(turnos: TurnoBaby[]): ResumenPendientes {
  const resumen: ResumenPendientes = { turnosSinGrupos: [], turnosConPendientes: [], sinNivel: [] };
  for (const turno of turnos) {
    if (turno.roster.length === 0) continue;
    if (turno.grupos.length === 0) {
      resumen.turnosSinGrupos.push({ turno, total: turno.roster.length });
    } else {
      const pendientes = alumnosSinColocar(turno);
      if (pendientes.length > 0) resumen.turnosConPendientes.push({ turno, alumnos: pendientes });
    }
    for (const alumno of turno.roster) {
      if (sinNivel(alumno)) resumen.sinNivel.push({ turno, alumno });
    }
  }
  return resumen;
}

export function textoPendientes(resumen: ResumenPendientes): string {
  const { turnosSinGrupos, turnosConPendientes, sinNivel: sinNivelLista } = resumen;
  if (!turnosSinGrupos.length && !turnosConPendientes.length && !sinNivelLista.length) {
    return 'Todo en orden, señor Cubero: no veo niños sin colocar ni sin nivel en los próximos turnos de Baby.';
  }
  const partes: string[] = ['Esto es lo que veo en los próximos turnos de Baby, señor Cubero:'];

  if (turnosConPendientes.length) {
    const lineas = turnosConPendientes.map(({ turno, alumnos }) => {
      const nombres = alumnos.map((a) => nombreBonito(a.alumno)).join(', ');
      return `• ${etiquetaTurno(turno.sesion)} · ${alumnos.length} sin colocar: ${nombres}`;
    });
    partes.push(`Sin colocar en un grupo\n${lineas.join('\n')}`);
  }
  if (turnosSinGrupos.length) {
    // Con pocos niños se dicen los nombres (sirve para decidir cambios de turno);
    // con muchos, solo el total para que el mensaje no se haga eterno.
    const lineas = turnosSinGrupos.map(({ turno, total }) => {
      const base = `• ${etiquetaTurno(turno.sesion)} · ${total} ${total === 1 ? 'niño' : 'niños'}`;
      return total <= 8
        ? `${base}: ${turno.roster.map((a) => nombreBonito(a.alumno)).join(', ')}`
        : base;
    });
    partes.push(`Turnos con niños pero sin grupos creados todavía\n${lineas.join('\n')}`);
  }
  if (sinNivelLista.length) {
    const lineas = sinNivelLista.map(({ turno, alumno }) => {
      const motivo =
        String(alumno.estado_en_listado || '').trim().toUpperCase() === 'PENDIENTE_TEST'
          ? 'pendiente de test'
          : 'sin nivel en la ficha';
      return `• ${nombreBonito(alumno.alumno)} (${etiquetaTurno(turno.sesion)}) · ${motivo}`;
    });
    partes.push(`Sin nivel\n${lineas.join('\n')}`);
  }
  partes.push(
    'Para cambiar a alguien de turno dígame, por ejemplo: «pasa a Lucía al jueves a las 17:00». Antes de tocar nada le enseño lo que voy a hacer y espero su confirmación.'
  );
  return partes.join('\n\n');
}

// ---------- Buscar al niño -----------------------------------------------------------------

// Dos letras seguidas intercambiadas («Rovria» por «Rovira»).
function conLetrasIntercambiadas(a: string, b: string) {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length - 1; i++) {
    if (a[i] !== b[i]) {
      return a[i] === b[i + 1] && a[i + 1] === b[i] && a.slice(i + 2) === b.slice(i + 2);
    }
  }
  return false;
}

// «Casi igual»: una letra de más, de menos, distinta o dos intercambiadas.
function distancia1(a: string, b: string) {
  if (a === b) return true;
  if (Math.abs(a.length - b.length) > 1) return false;
  if (conLetrasIntercambiadas(a, b)) return true;
  let i = 0;
  let j = 0;
  let fallos = 0;
  while (i < a.length && j < b.length) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    fallos++;
    if (fallos > 1) return false;
    if (a.length > b.length) i++;
    else if (a.length < b.length) j++;
    else {
      i++;
      j++;
    }
  }
  return fallos + (a.length - i) + (b.length - j) <= 1;
}

function palabraCoincide(buscada: string, nombre: string) {
  if (nombre === buscada || nombre.startsWith(buscada)) return true;
  return buscada.length >= 5 && nombre.length >= 5 && distancia1(buscada, nombre);
}

export type CandidatoAlumno = { alumno_id: string; nombre: string };

// Devuelve niños distintos cuyo nombre contiene TODAS las palabras buscadas.
// Si hay uno que coincide exactamente con lo escrito, gana solo.
export function buscarAlumnos(
  consulta: string,
  filas: Array<{ alumno_id: string; alumno: string }>
): CandidatoAlumno[] {
  const palabras = normalizarNombreAlumno(consulta).split(' ').filter(Boolean);
  if (!palabras.length) return [];
  const completo = palabras.join(' ');
  const porId = new Map<string, CandidatoAlumno & { exacto: boolean }>();
  for (const fila of filas) {
    const normal = normalizarNombreAlumno(fila.alumno);
    if (!normal) continue;
    const tokens = normal.split(' ');
    const coincide = palabras.every((p) => tokens.some((t) => palabraCoincide(p, t)));
    if (!coincide) continue;
    if (!porId.has(fila.alumno_id)) {
      porId.set(fila.alumno_id, {
        alumno_id: fila.alumno_id,
        nombre: nombreBonito(fila.alumno),
        exacto: normal === completo,
      });
    }
  }
  const lista = Array.from(porId.values());
  const exactos = lista.filter((c) => c.exacto);
  return (exactos.length === 1 ? exactos : lista).map(({ alumno_id, nombre }) => ({ alumno_id, nombre }));
}

// ---------- Elegir turnos ---------------------------------------------------------------------

type FiltroTurno = { dia: number | null; fecha: string | null; hora: string | null };

// Filtra turnos por fecha exacta, o por día de la semana, y después por hora
// (con 45 min de margen; si dos turnos empatan, no adivina).
export function filtrarTurnos<T extends { sesion: AgendaSesionDirectaApp }>(
  turnos: T[],
  filtro: FiltroTurno
): T[] {
  let lista = turnos;
  if (filtro.fecha) lista = lista.filter((t) => t.sesion.fecha === filtro.fecha);
  else if (filtro.dia) lista = lista.filter((t) => diaDeSemanaIso(t.sesion.fecha) === filtro.dia);
  if (filtro.hora && lista.length > 1) {
    const pedida = minutosDe(filtro.hora);
    const conDif = lista.map((t) => ({
      t,
      dif: Math.min(
        Math.abs(minutosDe(horaCorta(t.sesion.hora_inicio)) - pedida),
        // «a las 5» suele ser «17:00»
        pedida < 12 * 60 ? Math.abs(minutosDe(horaCorta(t.sesion.hora_inicio)) - (pedida + 12 * 60)) : Infinity
      ),
    }));
    const cercanos = conDif.filter((x) => x.dif <= 45);
    if (cercanos.length) {
      const mejor = Math.min(...cercanos.map((x) => x.dif));
      lista = cercanos.filter((x) => x.dif === mejor).map((x) => x.t);
    } else {
      lista = [];
    }
  } else if (filtro.hora && lista.length === 1) {
    const pedida = minutosDe(filtro.hora);
    const inicio = minutosDe(horaCorta(lista[0].sesion.hora_inicio));
    const dif = Math.min(Math.abs(inicio - pedida), pedida < 12 * 60 ? Math.abs(inicio - (pedida + 12 * 60)) : Infinity);
    if (dif > 45) lista = [];
  }
  return lista;
}

export function mismaSemana(a: string, b: string) {
  return mondayOfIsoWeek(a) === mondayOfIsoWeek(b);
}

export function turnosDeLaSemana(turnos: TurnoBaby[], fechaReferencia: string) {
  const lunes = mondayOfIsoWeek(fechaReferencia);
  const domingo = addIsoDays(lunes, 6);
  return turnos.filter((t) => t.sesion.fecha >= lunes && t.sesion.fecha <= domingo);
}

// ---------- Grupo recomendado en el turno de destino ------------------------------------------------

export type SugerenciaDestino = {
  mejor: BabyRelocationOption | null; // grupo ya creado que encaja (RECOMENDADO)
  hayRevisar: boolean; // hay grupos que habría que mirar a mano
  total: number; // grupos reales evaluados
};

export function sugerirGrupoDestino(
  alumno: { alumno_id: string; alumno: string; nivel_usado: string | null },
  origenFecha: string,
  destino: TurnoBaby
): SugerenciaDestino {
  const opciones: BabyRelocationOption[] = [];
  for (const grupo of destino.grupos) {
    const objetivo = realGroupToRelocationTarget(destino.sesion, grupo);
    if (!objetivo) continue;
    opciones.push(
      evaluateBabyRelocationTarget(
        { alumno_id: alumno.alumno_id, alumno: alumno.alumno, nivel_resumen: String(alumno.nivel_usado || '') },
        objetivo,
        origenFecha
      )
    );
  }
  const ordenadas = sortBabyRelocationOptions(opciones);
  return {
    mejor: ordenadas.find((o) => o.estado === 'RECOMENDADO') || null,
    hayRevisar: ordenadas.some((o) => o.estado === 'REVISAR'),
    total: opciones.length,
  };
}

// ---------- Tarjeta de confirmación ----------------------------------------------------------------------

export type DatosMovimiento = {
  sesion_alumno_id: string;
  alumno_id: string;
  nombre: string;
  sesion_destino_id: string;
  grupo_destino_id: string | null;
  grupo_destino: string | null;
  turno_origen: string;
  turno_destino: string;
};

export function continuacionMover(datos: DatosMovimiento, conGrupo: boolean): OpcionAccion['continuation'] {
  return {
    kind: 'accion_mover_confirm',
    sesion_alumno_id: datos.sesion_alumno_id,
    alumno_id: datos.alumno_id,
    nombre: datos.nombre,
    sesion_destino_id: datos.sesion_destino_id,
    grupo_destino_id: conGrupo ? datos.grupo_destino_id : null,
    grupo_destino: conGrupo ? datos.grupo_destino : null,
    turno_origen: datos.turno_origen,
    turno_destino: datos.turno_destino,
  };
}

export function tarjetaMovimiento(
  datos: DatosMovimiento,
  nivel: string | null,
  sugerencia: SugerenciaDestino
): SalidaAccion {
  const lineas = [
    `Voy a mover a ${datos.nombre}${nivel ? ` (nivel ${nivel})` : ''}:`,
    `• De: ${datos.turno_origen}`,
    `• A: ${datos.turno_destino}`,
  ];
  const choices: OpcionAccion[] = [];
  if (sugerencia.mejor && sugerencia.mejor.grupo_id) {
    const g = sugerencia.mejor;
    lineas.push(
      `En ese turno hay un grupo que encaja: «${g.grupo}» (${g.nivel_grupo}, ${g.pista}). Quedaría con ${g.total_final}.`
    );
    const conGrupo = { ...datos, grupo_destino_id: g.grupo_id, grupo_destino: g.grupo };
    choices.push({ label: `Mover y meterlo en «${g.grupo}»`, continuation: continuacionMover(conGrupo, true) });
    choices.push({
      label: 'Mover solo al turno (sin grupo)',
      continuation: continuacionMover({ ...datos, grupo_destino_id: null, grupo_destino: null }, false),
    });
  } else {
    lineas.push(
      sugerencia.total === 0
        ? 'En ese turno todavía no hay grupos creados: quedará pendiente de colocar.'
        : sugerencia.hayRevisar
          ? 'En ese turno hay grupos, pero ninguno encaja del todo: entrará sin grupo y usted decide.'
          : 'Ningún grupo de ese turno encaja con su nivel o están llenos: entrará sin grupo y usted decide.'
    );
    choices.push({
      label: 'Mover al turno (sin grupo)',
      continuation: continuacionMover({ ...datos, grupo_destino_id: null, grupo_destino: null }, false),
    });
  }
  lineas.push('¿Lo hago? No toco nada hasta que me lo confirme.');
  choices.push({ label: 'Cancelar', continuation: { kind: 'accion_cancelar' } });
  return { answer: lineas.join('\n'), choices };
}
