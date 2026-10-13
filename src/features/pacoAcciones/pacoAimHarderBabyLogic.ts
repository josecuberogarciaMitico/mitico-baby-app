// Paco · volcar AimHarder en Baby (lógica pura, sin red).
//
// Compara, turno por turno, lo que dice AimHarder con lo que ya hay en la app y
// decide qué se puede hacer SIN riesgo desde Paco:
//   · turno que no existe en la app            → crearlo con sus niños;
//   · turno que existe y solo le faltan niños  → añadirlos;
//   · turno que existe y ya está al día        → no tocarlo;
//   · turno donde AimHarder quita a alguien o el candado de seguridad bloquea
//     → NO se toca desde Paco: se avisa para hacerlo con «Refrescar listado»
//       de la Agenda (que ya sabe proteger asistencia y reportes).
// El candado es el mismo de la Agenda (assessRosterRefresh).
import { assessRosterRefresh, normalizeRosterName } from '../../core/sessions/rosterSync';
import { etiquetaDia, horaCorta, sinTildes } from './pacoAccionesLogic';
import { lunesDe, rangoSemana, resolverSemana } from './pacoDisponibilidadLogic';

// ---------- Tipos ------------------------------------------------------------------------

export type TurnoAimHarder = {
  fecha: string; // AAAA-MM-DD
  inicio: string; // HH:MM
  fin: string; // HH:MM
  nombres: string[]; // activos en AimHarder
  cancelados: string[];
  safeZero: boolean;
};

export type SesionExistente = {
  sesion_id: string;
  fecha: string;
  inicio: string;
  fin: string;
  roster: { id: string; name: string }[];
};

export type EstadoTurno = 'crear' | 'anadir' | 'al_dia' | 'revisar' | 'vacio';

export type PlanTurno = {
  clave: string; // fecha__inicio
  fecha: string;
  inicio: string;
  fin: string;
  estado: EstadoTurno;
  nombres: string[]; // lista completa de AimHarder (la que se escribe)
  sesion_id: string | null;
  anadir: string[]; // niños que entrarían (o todos, si el turno es nuevo)
  quitar: string[]; // niños que AimHarder ya no tiene (solo informativo: Paco no los quita)
  motivos: string[]; // por qué hay que revisarlo a mano
  desconocidos: string[]; // entrarían como «pendientes de Alta/Test»
};

export type ConocimientoAlumno = Map<string, 'conocido' | 'pendiente_test'>;

// ---------- Qué semana ---------------------------------------------------------------------

export type SemanaPedida = { semana: string | null; esOcio: boolean };

// «Esta semana» / «la próxima» / «la semana que viene» / «semana del 19 de octubre».
// Si no dice cuál, devuelve null y Paco pregunta con botones (no se adivina).
export function semanaDesdeMensaje(mensaje: string, hoyIso: string): SemanaPedida {
  const n = sinTildes(mensaje).toLowerCase();
  const esOcio = /\bocio\b/.test(n) && !/\bbaby\b/.test(n);
  if (/\b(proxima|siguiente|que viene|la otra)\b/.test(n)) {
    return { semana: resolverSemana(hoyIso, { fecha: null, relativa: 'proxima' }), esOcio };
  }
  if (/\besta semana\b|\bsemana actual\b|\bsemana en curso\b/.test(n)) {
    return { semana: resolverSemana(hoyIso, { fecha: null, relativa: 'esta' }), esOcio };
  }
  const MESES: Record<string, number> = {
    enero: 1, febrero: 2, marzo: 3, abril: 4, mayo: 5, junio: 6, julio: 7,
    agosto: 8, septiembre: 9, setiembre: 9, octubre: 10, noviembre: 11, diciembre: 12,
  };
  const fecha = n.match(/\bdel?\s+(\d{1,2})\s+de\s+([a-z]+)\b/) || n.match(/\bsemana\s+del?\s+(\d{1,2})\s+de\s+([a-z]+)\b/);
  if (fecha && MESES[fecha[2]]) {
    const dia = Number(fecha[1]);
    const mes = MESES[fecha[2]];
    if (dia >= 1 && dia <= 31) {
      const anio = Number(hoyIso.slice(0, 4));
      const iso = (a: number) => `${a}-${String(mes).padStart(2, '0')}-${String(dia).padStart(2, '0')}`;
      // Si la fecha ya pasó hace más de 6 meses se entiende del año siguiente.
      const candidata = iso(anio);
      const usar = candidata < hoyIso && Date.parse(`${hoyIso}T12:00:00`) - Date.parse(`${candidata}T12:00:00`) > 183 * 86400000 ? iso(anio + 1) : candidata;
      if (!Number.isNaN(Date.parse(`${usar}T12:00:00`))) {
        return { semana: resolverSemana(hoyIso, { fecha: usar, relativa: null }), esOcio };
      }
    }
  }
  return { semana: null, esOcio };
}

export function opcionesSemana(hoyIso: string) {
  const esta = resolverSemana(hoyIso, { fecha: null, relativa: 'esta' });
  const proxima = resolverSemana(hoyIso, { fecha: null, relativa: 'proxima' });
  return [
    { etiqueta: `Esta semana (${rangoSemana(esta)})`, semana: esta },
    { etiqueta: `La próxima (${rangoSemana(proxima)})`, semana: proxima },
  ];
}

// Un lunes válido (AAAA-MM-DD) y razonable: ni del pasado lejano ni del futuro lejano.
export function semanaValida(valor: unknown, hoyIso: string): string | null {
  const s = String(valor ?? '').trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(`${s}T12:00:00`))) return null;
  if (lunesDe(s) !== s) return null;
  const dias = (Date.parse(`${s}T12:00:00`) - Date.parse(`${hoyIso}T12:00:00`)) / 86400000;
  return dias >= -35 && dias <= 120 ? s : null;
}

// ---------- Plan por turno -------------------------------------------------------------------

function sinDuplicados(nombres: string[]) {
  const vistos = new Set<string>();
  const salida: string[] = [];
  for (const nombre of nombres) {
    const limpio = String(nombre || '').trim();
    const clave = normalizeRosterName(limpio);
    if (!clave || vistos.has(clave)) continue;
    vistos.add(clave);
    salida.push(limpio);
  }
  return salida;
}

export function planificarTurno(
  turno: TurnoAimHarder,
  existente: SesionExistente | null,
  conocidos?: ConocimientoAlumno | null
): PlanTurno {
  const nombres = turno.nombres.map((n) => String(n || '').trim()).filter(Boolean);
  const base = {
    clave: `${turno.fecha}__${turno.inicio}`,
    fecha: turno.fecha,
    inicio: turno.inicio,
    fin: turno.fin,
    nombres,
    quitar: [] as string[],
    motivos: [] as string[],
  };
  const desconocidosDe = (lista: string[]) =>
    conocidos ? lista.filter((n) => conocidos.get(normalizeRosterName(n)) !== 'conocido') : [];

  if (!existente) {
    if (nombres.length === 0) {
      return { ...base, estado: 'vacio', sesion_id: null, anadir: [], desconocidos: [] };
    }
    // Un nombre repetido en AimHarder no se vuelca a ciegas.
    if (sinDuplicados(nombres).length !== nombres.length) {
      return {
        ...base,
        estado: 'revisar',
        sesion_id: null,
        anadir: [],
        desconocidos: [],
        motivos: ['AimHarder trae nombres repetidos o indistinguibles en este turno.'],
      };
    }
    return { ...base, estado: 'crear', sesion_id: null, anadir: nombres, desconocidos: desconocidosDe(nombres) };
  }

  const evaluacion = assessRosterRefresh(existente.roster, {
    activeNames: nombres,
    cancelledNames: turno.cancelados,
    safeZero: turno.safeZero,
  });
  const quitar = evaluacion.removals.map((r) => r.name);
  if (evaluacion.status === 'BLOCKED' || quitar.length > 0) {
    const motivos = [...evaluacion.issues];
    if (quitar.length > 0) {
      motivos.push(
        `AimHarder ya no incluye a ${quitar.join(', ')}. Eso se retira con «Refrescar listado» de la Agenda, que protege asistencia y reportes.`
      );
    }
    return {
      ...base,
      estado: 'revisar',
      sesion_id: existente.sesion_id,
      anadir: evaluacion.additions,
      quitar,
      motivos,
      desconocidos: [],
    };
  }
  if (evaluacion.additions.length === 0) {
    return { ...base, estado: 'al_dia', sesion_id: existente.sesion_id, anadir: [], desconocidos: [] };
  }
  return {
    ...base,
    estado: 'anadir',
    sesion_id: existente.sesion_id,
    anadir: evaluacion.additions,
    desconocidos: desconocidosDe(evaluacion.additions),
  };
}

// Dos o más turnos de la app con el mismo día y hora de inicio: no se adivina cuál es.
export function planAmbiguo(turno: TurnoAimHarder, cuantos: number): PlanTurno {
  return {
    clave: `${turno.fecha}__${turno.inicio}`,
    fecha: turno.fecha,
    inicio: turno.inicio,
    fin: turno.fin,
    estado: 'revisar',
    nombres: turno.nombres,
    sesion_id: null,
    anadir: [],
    quitar: [],
    motivos: [`En la app hay ${cuantos} turnos Baby con ese mismo día y hora de inicio; no voy a adivinar en cuál meter a los niños.`],
    desconocidos: [],
  };
}

export function accionables(planes: PlanTurno[]) {
  return planes.filter((p) => p.estado === 'crear' || p.estado === 'anadir');
}

// ---------- Textos ---------------------------------------------------------------------------

function lista(nombres: string[], max = 8) {
  if (nombres.length <= max) return nombres.join(', ');
  return `${nombres.slice(0, max).join(', ')} y ${nombres.length - max} más`;
}

function etiqueta(p: Pick<PlanTurno, 'fecha' | 'inicio' | 'fin'>) {
  return `${etiquetaDia(p.fecha)} · ${horaCorta(p.inicio)}–${horaCorta(p.fin)}`;
}

export function textoVistaPrevia(semana: string, planes: PlanTurno[], incidencias: string[], conocimientoOk: boolean): string {
  const crear = planes.filter((p) => p.estado === 'crear');
  const anadir = planes.filter((p) => p.estado === 'anadir');
  const alDia = planes.filter((p) => p.estado === 'al_dia');
  const revisar = planes.filter((p) => p.estado === 'revisar');
  const vacios = planes.filter((p) => p.estado === 'vacio');
  const partes: string[] = [`AimHarder · Baby · semana del ${rangoSemana(semana)}. Todavía no he cambiado nada; esto es lo que haría:`];

  if (crear.length) {
    partes.push(
      `Turnos nuevos que crearía (${crear.length}):\n${crear
        .map((p) => `· ${etiqueta(p)} — ${p.nombres.length} niño(s)`)
        .join('\n')}`
    );
  }
  if (anadir.length) {
    partes.push(
      `Turnos existentes a los que solo añadiría niños (${anadir.length}):\n${anadir
        .map((p) => `· ${etiqueta(p)} — añadir ${lista(p.anadir)}`)
        .join('\n')}`
    );
  }
  if (alDia.length) {
    partes.push(`Ya al día, no los toco (${alDia.length}): ${alDia.map(etiqueta).join('; ')}.`);
  }
  if (vacios.length) {
    partes.push(`Sin reservas en AimHarder, no creo nada (${vacios.length}): ${vacios.map(etiqueta).join('; ')}.`);
  }
  const desconocidos = Array.from(new Set(planes.flatMap((p) => (p.estado === 'crear' || p.estado === 'anadir' ? p.desconocidos : []))));
  if (desconocidos.length) {
    partes.push(
      `Ojo: no reconozco como alumnos de la temporada a ${lista(desconocidos)}. Entrarían en el turno como «pendientes de Alta/Test» (igual que hace la Agenda); habrá que resolver su test antes de colocarlos en un grupo.`
    );
  } else if (!conocimientoOk && (crear.length || anadir.length)) {
    partes.push('No he podido comprobar cuáles de esos niños son nuevos; los desconocidos entrarían como «pendientes de Alta/Test».');
  }
  if (revisar.length) {
    partes.push(
      `Estos NO los toco desde aquí, hay que mirarlos en la Agenda (${revisar.length}):\n${revisar
        .map((p) => `· ${etiqueta(p)} — ${p.motivos.join(' ')}`)
        .join('\n')}`
    );
  }
  if (incidencias.length) {
    partes.push(`Avisos de AimHarder (no he tocado esos turnos):\n${incidencias.map((i) => `· ${i}`).join('\n')}`);
  }
  if (!crear.length && !anadir.length) {
    partes.push('No hay nada que cargar de forma segura desde aquí.');
  } else {
    partes.push('Nunca quito ni borro a nadie. ¿Lo cargo?');
  }
  return partes.join('\n\n');
}

export type ResultadoTurno = {
  clave: string;
  etiqueta: string;
  resultado: 'creado' | 'anadido' | 'omitido' | 'error';
  detalle: string;
};

export function textoResultado(semana: string, resultados: ResultadoTurno[]): string {
  const ok = resultados.filter((r) => r.resultado === 'creado' || r.resultado === 'anadido');
  const otros = resultados.filter((r) => r.resultado === 'omitido');
  const fallos = resultados.filter((r) => r.resultado === 'error');
  const partes: string[] = [
    ok.length
      ? `Hecho, señor Cubero. Semana del ${rangoSemana(semana)}: ${ok.length} turno(s) cargado(s).`
      : `Semana del ${rangoSemana(semana)}: no se ha cargado ningún turno.`,
  ];
  if (ok.length) partes.push(ok.map((r) => `· ${r.etiqueta} — ${r.detalle}`).join('\n'));
  if (otros.length) partes.push(`Omitidos por seguridad (no he tocado nada en ellos):\n${otros.map((r) => `· ${r.etiqueta} — ${r.detalle}`).join('\n')}`);
  if (fallos.length) partes.push(`Con problemas, revíselos en la Agenda:\n${fallos.map((r) => `· ${r.etiqueta} — ${r.detalle}`).join('\n')}`);
  partes.push('Si la Agenda estaba abierta, actualícela para verlo.');
  return partes.join('\n\n');
}
