// Tabla operativa de «niños sin colocar» (28/10): lógica pura, sin React ni
// Supabase. Propone a cada niño (o a cada pareja de hermanos) dónde ponerlo
// esta semana con las mismas reglas de nivel y ratio que el recomendador
// individual, y además tiene en cuenta:
//  - hermanos (mismo teléfono en la ficha) apuntados al mismo turno: van
//    juntos; mover a uno solo se marca «Revisar» (el otro no podría venir);
//  - fin de semana / entre semana: quien viene en fin de semana se queda en
//    fin de semana (y al revés) salvo que no haya otra opción;
//  - mismo turno antes que mismo día, y mismo día antes que otro día;
//  - plazas: dos niños no se proponen en el último hueco del mismo grupo.

import { recommendLevelCompatibility } from '../../core/recommendations/baseRecommendation';
import { parseTechnicalLevel, TECHNICAL_LEVEL_ORDER } from '../../core/levels/levelContract';
import { babyGroupMaximum } from '../baby/babyPolicy';

export type SesionPlan = {
  sesionId: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  modalidad: string;
};

export type GrupoPlan = {
  sesionId: string;
  grupoId: string;
  nombre: string;
  nivelGrupo: string | null;
  alumnosLista: string | null;
  pista: string | null;
  total: number;
  entrenadores: number;
  publicado: boolean;
};

export type AlumnoPlan = {
  sesionAlumnoId: string;
  alumnoId: string;
  alumno: string;
  sesionId: string;
  nivel: string | null;
  estado: string | null;
};

export type EstadoOpcion = 'RECOMENDADO' | 'REVISAR' | 'NO_ENCAJA';

export type ColocacionMiembro = {
  alumno: AlumnoPlan;
  grupo: GrupoPlan;
  totalFinal: number;
  maximo: number;
  estado: EstadoOpcion;
  motivo: string;
};

export type OpcionPlan = {
  clave: string;
  sesion: SesionPlan;
  colocaciones: ColocacionMiembro[];
  estado: EstadoOpcion;
  score: number;
  mismoTurno: boolean;
  mismoDia: boolean;
  avisos: string[];
  /** Opción de familia completa: mueve también a hermanos ya colocados en su turno. */
  familia?: boolean;
};

export type HermanoInfo = {
  alumno: string;
  sesion: SesionPlan | null;
  colocado: boolean;
  sinColocar: boolean;
};

export type UnidadPlan = {
  clave: string;
  miembros: AlumnoPlan[];
  origen: SesionPlan;
  hermanos: HermanoInfo[];
  bloqueo: string | null;
  opciones: OpcionPlan[];
  propuesta: OpcionPlan | null;
};

const hhmm = (x: string) => String(x || '').slice(0, 5);

export function esFinDeSemana(fechaIso: string) {
  const d = new Date(`${String(fechaIso).slice(0, 10)}T12:00:00`).getDay();
  return d === 0 || d === 6;
}

export function normalizarTelefono(valor: string | null | undefined) {
  const d = String(valor || '').replace(/\D/g, '');
  const sinPrefijo = d.length === 11 && d.startsWith('34') ? d.slice(2) : d;
  return sinPrefijo.length >= 9 ? sinPrefijo.slice(-9) : '';
}

const sinTildes = (s: string) =>
  String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().trim();

/** Apellidos aproximados: las dos últimas palabras del nombre completo. */
function apellidos(nombre: string) {
  const p = sinTildes(nombre).split(/\s+/).filter(Boolean);
  return p.length >= 3 ? p.slice(-2) : p.slice(-1);
}

/**
 * Hermanos = mismo teléfono en la ficha y al menos un apellido en común.
 * Devuelve, para cada alumno, los ids de sus hermanos.
 */
export function detectarHermanos(
  alumnos: Array<{ alumnoId: string; alumno: string }>,
  telefonos: Record<string, string | null | undefined>
): Record<string, string[]> {
  const porTelefono = new Map<string, Array<{ alumnoId: string; alumno: string }>>();
  const vistos = new Set<string>();
  alumnos.forEach((a) => {
    if (vistos.has(a.alumnoId)) return;
    vistos.add(a.alumnoId);
    const tel = normalizarTelefono(telefonos[a.alumnoId]);
    if (!tel) return;
    porTelefono.set(tel, [...(porTelefono.get(tel) || []), a]);
  });
  const resultado: Record<string, Set<string>> = {};
  const unir = (x: string, y: string) => {
    (resultado[x] ||= new Set()).add(y);
    (resultado[y] ||= new Set()).add(x);
  };
  porTelefono.forEach((lista) => {
    if (lista.length < 2) return;
    lista.forEach((a) => {
      const misApellidos = apellidos(a.alumno);
      lista
        .filter((b) => b.alumnoId !== a.alumnoId)
        .filter((b) => apellidos(b.alumno).some((x) => misApellidos.includes(x)))
        .forEach((b) => unir(a.alumnoId, b.alumnoId));
    });
  });
  // También hermanos con los DOS apellidos iguales aunque la ficha tenga
  // teléfonos distintos (p. ej. uno de la madre y otro del padre).
  const porApellidos = new Map<string, string[]>();
  const unicos = new Map<string, string>();
  alumnos.forEach((a) => unicos.set(a.alumnoId, a.alumno));
  unicos.forEach((nombre, id) => {
    const p = sinTildes(nombre).split(/\s+/).filter(Boolean);
    if (p.length < 3) return;
    const clave = p.slice(-2).join(' ');
    porApellidos.set(clave, [...(porApellidos.get(clave) || []), id]);
  });
  porApellidos.forEach((ids) => {
    if (ids.length < 2 || ids.length > 5) return; // más de 5 = apellidos muy comunes, no se asume
    ids.forEach((x) => ids.forEach((y) => x !== y && unir(x, y)));
  });
  return Object.fromEntries(Object.entries(resultado).map(([k, v]) => [k, Array.from(v)]));
}

function nivelesDelGrupo(g: GrupoPlan) {
  const niveles: string[] = [];
  const add = (v: unknown) => {
    const p = parseTechnicalLevel(v);
    if (p.status === 'VALID' && !niveles.includes(p.level)) niveles.push(p.level);
  };
  String(g.nivelGrupo || '').split(/[\/|,]/).forEach(add);
  String(g.alumnosLista || '')
    .split(' || ')
    .forEach((linea) => {
      const partes = linea.split('·').map((x) => x.trim()).filter(Boolean);
      if (partes.length >= 2) add(partes[1]);
    });
  return niveles;
}

const esParticular = (nombre: string) => /^PARTICULAR(\s|·|-|:|$)/.test(sinTildes(nombre));

/** Cómo encaja un niño en un grupo con `extra` niños ya reservados en él. */
export function evaluarEncaje(alumno: AlumnoPlan, grupo: GrupoPlan, extra = 0) {
  const nivel = parseTechnicalLevel(alumno.nivel);
  const maximo = babyGroupMaximum(grupo.pista, Math.max(1, grupo.entrenadores));
  const totalFinal = grupo.total + extra + 1;
  if (nivel.status !== 'VALID') {
    return { estado: 'NO_ENCAJA' as EstadoOpcion, score: 0, motivo: 'Sin nivel válido: revisa su ficha.', totalFinal, maximo };
  }
  const nivelesGrupo = nivelesDelGrupo(grupo);
  const comp = recommendLevelCompatibility(nivel.level, nivelesGrupo);
  let estado: EstadoOpcion = comp.status;
  let score = comp.score;
  let motivo = comp.reason;
  // Si coordinación ya ha montado el grupo con esa mezcla (p. ej. B y C) y el
  // niño está DENTRO de ese rango (B+), no abre más la diferencia: encaja.
  if (estado !== 'RECOMENDADO' && nivelesGrupo.length) {
    const ordenes = nivelesGrupo.map((n) => TECHNICAL_LEVEL_ORDER[n as keyof typeof TECHNICAL_LEVEL_ORDER]);
    const propio = TECHNICAL_LEVEL_ORDER[nivel.level];
    if (ordenes.every((o) => typeof o === 'number') && propio >= Math.min(...ordenes) && propio <= Math.max(...ordenes)) {
      estado = 'RECOMENDADO';
      score = 85;
      motivo = 'Su nivel está dentro del rango que ya tiene el grupo.';
    }
  }
  if (totalFinal > maximo) {
    estado = 'NO_ENCAJA';
    score = 0;
    motivo = `Grupo lleno (${totalFinal}/${maximo}).`;
  } else if (totalFinal === maximo && estado === 'RECOMENDADO') {
    score -= 8;
    motivo += ` Queda completo (${totalFinal}/${maximo}).`;
  }
  if (grupo.publicado && estado !== 'NO_ENCAJA') score += 4;
  return { estado, score, motivo, totalFinal, maximo };
}

const peorEstado = (a: EstadoOpcion, b: EstadoOpcion): EstadoOpcion =>
  a === 'NO_ENCAJA' || b === 'NO_ENCAJA' ? 'NO_ENCAJA' : a === 'REVISAR' || b === 'REVISAR' ? 'REVISAR' : 'RECOMENDADO';

const ORDEN_ESTADO: Record<EstadoOpcion, number> = { RECOMENDADO: 0, REVISAR: 1, NO_ENCAJA: 2 };

function etiquetaSesion(s: SesionPlan) {
  const dia = new Date(`${s.fecha}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'long' });
  return `${dia} ${hhmm(s.hora_inicio)}`;
}

/**
 * Coloca a los miembros de una unidad en una sesión: cada uno en su mejor
 * grupo, respetando las plazas ya reservadas (incluidas las de sus hermanos).
 */
function colocarEnSesion(
  miembros: AlumnoPlan[],
  grupos: GrupoPlan[],
  reservas: Map<string, number>
): ColocacionMiembro[] | null {
  const extraLocal = new Map<string, number>();
  const colocaciones: ColocacionMiembro[] = [];
  for (const m of miembros) {
    let mejor: (ColocacionMiembro & { score: number }) | null = null;
    for (const g of grupos) {
      const extra = (reservas.get(g.grupoId) || 0) + (extraLocal.get(g.grupoId) || 0);
      const ev = evaluarEncaje(m, g, extra);
      const cand = { alumno: m, grupo: g, totalFinal: ev.totalFinal, maximo: ev.maximo, estado: ev.estado, motivo: ev.motivo, score: ev.score };
      if (
        !mejor ||
        ORDEN_ESTADO[cand.estado] < ORDEN_ESTADO[mejor.estado] ||
        (cand.estado === mejor.estado && cand.score > mejor.score)
      ) {
        mejor = cand;
      }
    }
    if (!mejor) return null;
    extraLocal.set(mejor.grupo.grupoId, (extraLocal.get(mejor.grupo.grupoId) || 0) + 1);
    const { score: _s, ...col } = mejor;
    colocaciones.push(col);
  }
  return colocaciones;
}

export function planificarSinColocar(input: {
  sesiones: SesionPlan[];
  grupos: GrupoPlan[];
  pendientes: AlumnoPlan[];
  /** Todos los niños de los listados de la semana (para buscar hermanos). */
  listados: AlumnoPlan[];
  /** alumnoId → true si ya está en un grupo de su sesión. */
  colocados: Set<string>;
  telefonos: Record<string, string | null | undefined>;
}): UnidadPlan[] {
  const sesionPorId = new Map(input.sesiones.map((s) => [s.sesionId, s]));
  const gruposValidos = input.grupos.filter((g) => g.grupoId && !esParticular(g.nombre));
  const gruposPorSesion = new Map<string, GrupoPlan[]>();
  gruposValidos.forEach((g) => gruposPorSesion.set(g.sesionId, [...(gruposPorSesion.get(g.sesionId) || []), g]));

  const hermanosDe = detectarHermanos(
    [...input.listados, ...input.pendientes].map((a) => ({ alumnoId: a.alumnoId, alumno: a.alumno })),
    input.telefonos
  );
  const filaPorAlumno = new Map<string, AlumnoPlan>();
  input.listados.forEach((a) => filaPorAlumno.set(a.alumnoId, a));
  const pendientePorAlumno = new Map(input.pendientes.map((p) => [p.alumnoId, p]));

  // Unidades: hermanos pendientes en la MISMA sesión van juntos.
  const usados = new Set<string>();
  const unidades: Array<{ miembros: AlumnoPlan[]; origen: SesionPlan }> = [];
  input.pendientes.forEach((p) => {
    if (usados.has(p.sesionAlumnoId)) return;
    const origen = sesionPorId.get(p.sesionId);
    if (!origen) return;
    const miembros = [p];
    usados.add(p.sesionAlumnoId);
    (hermanosDe[p.alumnoId] || []).forEach((h) => {
      const otro = pendientePorAlumno.get(h);
      if (otro && otro.sesionId === p.sesionId && !usados.has(otro.sesionAlumnoId)) {
        miembros.push(otro);
        usados.add(otro.sesionAlumnoId);
      }
    });
    unidades.push({ miembros, origen });
  });

  const reservas = new Map<string, number>();
  const resultado: UnidadPlan[] = [];

  const construir = (u: { miembros: AlumnoPlan[]; origen: SesionPlan }): UnidadPlan => {
    const ids = new Set(u.miembros.map((m) => m.alumnoId));
    const hermanos: HermanoInfo[] = [];
    const sesionesHermanos = new Set<string>();
    u.miembros.forEach((m) =>
      (hermanosDe[m.alumnoId] || []).forEach((h) => {
        if (ids.has(h) || hermanos.some((x) => x.alumno === (filaPorAlumno.get(h)?.alumno || ''))) return;
        const fila = filaPorAlumno.get(h) || pendientePorAlumno.get(h);
        if (!fila) return;
        const sesion = sesionPorId.get(fila.sesionId) || null;
        // Solo atan los hermanos apuntados al MISMO turno: si se mueve uno,
        // el otro se queda sin poder entrenar. Si los padres los apuntaron en
        // turnos distintos, se informa pero no se fuerza nada.
        if (sesion && sesion.sesionId === u.origen.sesionId) sesionesHermanos.add(sesion.sesionId);
        hermanos.push({
          alumno: fila.alumno,
          sesion,
          colocado: input.colocados.has(h),
          sinColocar: pendientePorAlumno.has(h),
        });
      })
    );

    const finde = esFinDeSemana(u.origen.fecha);
    const baby = /BABY/i.test(u.origen.modalidad);
    const pendienteTest = u.miembros.some((m) => String(m.estado || '').toUpperCase() === 'PENDIENTE_TEST');
    const sinNivel = u.miembros.some((m) => parseTechnicalLevel(m.nivel).status !== 'VALID');
    const bloqueo = pendienteTest
      ? 'Nuevo: crea su Alta / Test antes de colocarlo.'
      : sinNivel
      ? 'Sin nivel válido: revisa su ficha antes de colocarlo.'
      : null;

    const opciones: OpcionPlan[] = [];
    if (!bloqueo) {
      // Mismo turno siempre; otros turnos de la semana solo en Baby (el
      // cambio de turno existe solo para Baby) y de la misma modalidad.
      const candidatas = input.sesiones.filter(
        (s) =>
          s.sesionId === u.origen.sesionId ||
          (baby && /BABY/i.test(s.modalidad) && !input.listados.some((a) => ids.has(a.alumnoId) && a.sesionId === s.sesionId))
      );
      candidatas.forEach((s) => {
        const grupos = gruposPorSesion.get(s.sesionId) || [];
        if (!grupos.length) return;
        const colocaciones = colocarEnSesion(u.miembros, grupos, reservas);
        if (!colocaciones) return;
        const mismoTurno = s.sesionId === u.origen.sesionId;
        const mismoDia = s.fecha === u.origen.fecha;
        let estado = colocaciones.map((c) => c.estado).reduce(peorEstado, 'RECOMENDADO' as EstadoOpcion);
        let score = Math.min(...colocaciones.map((c) => evaluarEncaje(c.alumno, c.grupo).score));
        const avisos: string[] = [];
        // Su turno, si encaja, va siempre primero.
        if (mismoTurno) score += 60;
        else if (mismoDia) score += 15;
        if (!mismoTurno) {
          // Quien eligió fin de semana quiere fin de semana. Al revés (de
          // entre semana a fin de semana) suele venir bien: solo baja un poco.
          if (finde && !esFinDeSemana(s.fecha)) {
            score -= 35;
            avisos.push('Viene en fin de semana: esto es entre semana.');
            if (estado === 'RECOMENDADO') estado = 'REVISAR';
          } else if (!finde && esFinDeSemana(s.fecha)) {
            score -= 5;
          } else {
            score += 10;
          }
          avisos.push('Cambio de turno: solo con el OK de los padres.');
        }
        if (sesionesHermanos.size) {
          if (sesionesHermanos.has(s.sesionId)) {
            score += 25;
            avisos.unshift('Con su hermano/a en el mismo turno.');
          } else {
            const nombres = hermanos
              .filter((h) => h.sesion && sesionesHermanos.has(h.sesion.sesionId))
              .map((h) => h.alumno.split(' ')[0]);
            avisos.unshift(`Separa de su hermano/a ${nombres.join(', ')} (van juntos en ${etiquetaSesion(u.origen)}): muévelo también o no lo muevas.`);
            score -= 40;
            if (estado === 'RECOMENDADO') estado = 'REVISAR';
          }
        }
        opciones.push({
          clave: `${s.sesionId}:${colocaciones.map((c) => c.grupo.grupoId).join('+')}`,
          sesion: s,
          colocaciones,
          estado,
          score,
          mismoTurno,
          mismoDia,
          avisos,
        });
      });
      // Familia completa: si tiene hermanos YA colocados en su mismo turno, se
      // busca otro turno donde quepan TODOS juntos (cada uno en un grupo de su
      // nivel). Así no se separa a nadie.
      const hermanosColocados = Array.from(new Set(u.miembros.flatMap((m) => hermanosDe[m.alumnoId] || [])))
        .filter((h) => !ids.has(h) && input.colocados.has(h))
        .map((h) => filaPorAlumno.get(h))
        .filter((f): f is AlumnoPlan => Boolean(f) && f!.sesionId === u.origen.sesionId);
      if (baby && hermanosColocados.length) {
        const todos = [...u.miembros, ...hermanosColocados];
        const todosIds = new Set(todos.map((m) => m.alumnoId));
        const nombresHermanos = hermanosColocados.map((h) => h.alumno.split(' ')[0]).join(' y ');
        input.sesiones
          .filter(
            (s) =>
              s.sesionId !== u.origen.sesionId &&
              /BABY/i.test(s.modalidad) &&
              !input.listados.some((a) => todosIds.has(a.alumnoId) && a.sesionId === s.sesionId)
          )
          .forEach((s) => {
            const grupos = gruposPorSesion.get(s.sesionId) || [];
            if (!grupos.length) return;
            const colocaciones = colocarEnSesion(todos, grupos, reservas);
            if (!colocaciones || colocaciones.some((c) => c.estado === 'NO_ENCAJA')) return;
            let estado = colocaciones.map((c) => c.estado).reduce(peorEstado, 'RECOMENDADO' as EstadoOpcion);
            let score = Math.min(...colocaciones.map((c) => evaluarEncaje(c.alumno, c.grupo).score)) + 10;
            const avisos = [`Toda la familia junta: mueve también a ${nombresHermanos} (ya ${hermanosColocados.length > 1 ? 'colocados' : 'colocado/a'} en su turno).`];
            if (s.fecha === u.origen.fecha) score += 15;
            if (finde && !esFinDeSemana(s.fecha)) {
              score -= 35;
              avisos.push('Viene en fin de semana: esto es entre semana.');
              if (estado === 'RECOMENDADO') estado = 'REVISAR';
            } else if (!finde && esFinDeSemana(s.fecha)) {
              score -= 5;
            } else {
              score += 10;
            }
            avisos.push('Cambio de turno: solo con el OK de los padres.');
            opciones.push({
              clave: `fam:${s.sesionId}:${colocaciones.map((c) => c.grupo.grupoId).join('+')}`,
              sesion: s,
              colocaciones,
              estado,
              score,
              mismoTurno: false,
              mismoDia: s.fecha === u.origen.fecha,
              avisos,
              familia: true,
            });
          });
      }
      opciones.sort(
        (a, b) =>
          ORDEN_ESTADO[a.estado] - ORDEN_ESTADO[b.estado] ||
          b.score - a.score ||
          a.sesion.fecha.localeCompare(b.sesion.fecha) ||
          hhmm(a.sesion.hora_inicio).localeCompare(hhmm(b.sesion.hora_inicio))
      );
    }
    const propuesta = opciones.find((o) => o.estado === 'RECOMENDADO') || null;
    // Reserva las plazas de la propuesta para que el siguiente niño no cuente
    // con el mismo hueco.
    propuesta?.colocaciones.forEach((c) => reservas.set(c.grupo.grupoId, (reservas.get(c.grupo.grupoId) || 0) + 1));
    return {
      clave: u.miembros.map((m) => m.sesionAlumnoId).join('+'),
      miembros: u.miembros,
      origen: u.origen,
      hermanos,
      bloqueo,
      opciones,
      propuesta,
    };
  };

  // Primero las familias y los que tienen menos huecos posibles en su turno,
  // para que no se queden sin sitio por culpa de los fáciles.
  const orden = [...unidades].sort((a, b) => {
    if (a.miembros.length !== b.miembros.length) return b.miembros.length - a.miembros.length;
    return a.origen.fecha.localeCompare(b.origen.fecha) || hhmm(a.origen.hora_inicio).localeCompare(hhmm(b.origen.hora_inicio));
  });
  orden.forEach((u) => resultado.push(construir(u)));
  return resultado.sort(
    (a, b) =>
      a.origen.fecha.localeCompare(b.origen.fecha) ||
      hhmm(a.origen.hora_inicio).localeCompare(hhmm(b.origen.hora_inicio)) ||
      a.miembros[0].alumno.localeCompare(b.miembros[0].alumno, 'es')
  );
}

/** Todos los grupos posibles para mover a mano (libertad total), con su encaje. */
export function gruposParaElegir(
  alumno: AlumnoPlan,
  sesiones: SesionPlan[],
  grupos: GrupoPlan[],
  permitirOtrosTurnos: boolean
) {
  const sesionPorId = new Map(sesiones.map((s) => [s.sesionId, s]));
  return grupos
    .filter((g) => g.grupoId && !esParticular(g.nombre))
    .filter((g) => permitirOtrosTurnos || g.sesionId === alumno.sesionId)
    .map((g) => ({ grupo: g, sesion: sesionPorId.get(g.sesionId)!, ...evaluarEncaje(alumno, g) }))
    .filter((x) => x.sesion)
    .sort(
      (a, b) =>
        a.sesion.fecha.localeCompare(b.sesion.fecha) ||
        hhmm(a.sesion.hora_inicio).localeCompare(hhmm(b.sesion.hora_inicio)) ||
        a.grupo.nombre.localeCompare(b.grupo.nombre, 'es')
    );
}
