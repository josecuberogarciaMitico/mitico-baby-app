import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { parseTechnicalLevel } from '../../core/levels/levelContract';
import { moveBabyStudentBetweenSessions } from '../../services/agenda/agendaRelocationService';
import { pendingAgendaStudents } from './agendaSessions';
import {
  gruposParaElegir,
  planificarSinColocar,
  type AlumnoPlan,
  type GrupoPlan,
  type OpcionPlan,
  type SesionPlan,
  type UnidadPlan,
} from './sinColocarPlanner';
import {
  etiquetaTurnoFamilia,
  enlaceElegirTurno,
  necesitaMensaje,
  ninosDePropuesta,
  opcionesParaFamilia,
  turnosOfrecibles,
  propuestaDeUnidad,
  telefonoFamilia,
  textoPropuestaFamilia,
  urlWhatsappFamilia,
  type OpcionEnviada,
  type PropuestaGuardada,
} from './sinColocarMensajes';

/**
 * Tabla operativa «Niños sin colocar» de la semana (28/10).
 * Lee listados y grupos de la semana, propone dónde va cada niño (teniendo en
 * cuenta hermanos, fin de semana, nivel y plazas) y aplica con los MISMOS
 * RPC que ya usa la sesión:
 *  - mismo turno → incorporar_alumno_fuera_plazo_grupo_app
 *  - otro turno  → mover_alumno_entre_turnos_operativa_app (solo Baby)
 * Nada se aplica sin pulsar un botón.
 */

type Props = {
  abierta: boolean;
  onCerrar: () => void;
  sesiones: SesionPlan[];
  hoyIso: string;
  consultarSupabase: (tabla: string, query: string) => Promise<any[]>;
  ejecutarFuncionAuthJson: (fn: string, body: object) => Promise<any>;
  normalizarNombre: (valor: string | null | undefined) => string;
  onAbrirSesion: (sesionId: string, sesionAlumnoId?: string) => void;
  onCambios: () => Promise<void> | void;
  /** «Avisar cambios y pedir reconfirmación» de un grupo publicado que ha perdido niños. */
  avisarCambioGrupo?: (grupoId: string) => Promise<void>;
  soloLectura: boolean;
};

const hhmm = (x: string) => String(x || '').slice(0, 5);

function etiquetaTurno(s: SesionPlan) {
  const dia = new Date(`${s.fecha}T12:00:00`).toLocaleDateString('es-ES', { weekday: 'short', day: '2-digit', month: '2-digit' });
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} · ${hhmm(s.hora_inicio)}`;
}

const ETIQUETA_ESTADO = { RECOMENDADO: '✓ Encaja', REVISAR: '⚠ Revisar', NO_ENCAJA: '✕ No encaja' } as const;

export function SinColocarPanel(props: Props) {
  const { abierta, sesiones, hoyIso } = props;
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState('');
  const [aplicando, setAplicando] = useState('');
  const [datos, setDatos] = useState<{
    grupos: GrupoPlan[];
    listados: AlumnoPlan[];
    pendientes: AlumnoPlan[];
    colocados: Set<string>;
    telefonos: Record<string, string | null>;
  } | null>(null);
  // Opción elegida por fila: clave de una opción o «g:<grupoId>» (a mano).
  const [eleccion, setEleccion] = useState<Record<string, string>>({});
  // Propuestas enviadas a familias y su respuesta (tabla cambios_turno_propuestos_app).
  const [propuestas, setPropuestas] = useState<PropuestaGuardada[]>([]);
  const [tablaPropuestasLista, setTablaPropuestasLista] = useState(true);
  // Si la tabla aún no existe, al menos no se repite el mismo WhatsApp en esta sesión.
  const [enviadosLocal, setEnviadosLocal] = useState<Set<string>>(new Set());
  // Turnos que coordinación quiere ofrecer a cada familia (si no toca, los propuestos).
  const [ofrecer, setOfrecer] = useState<Record<string, string[]>>({});

  const sesionesFuturas = useMemo(() => sesiones.filter((s) => s.fecha >= hoyIso), [sesiones, hoyIso]);
  const firma = sesionesFuturas.map((s) => s.sesionId).sort().join(',');

  async function cargar() {
    const ids = sesionesFuturas.map((s) => s.sesionId);
    if (!ids.length) {
      setDatos({ grupos: [], listados: [], pendientes: [], colocados: new Set(), telefonos: {} });
      return;
    }
    setCargando(true);
    setError('');
    try {
      const filtro = `sesion_id=in.(${ids.join(',')})`;
      const [roster, grupos] = await Promise.all([
        props.consultarSupabase(
          'v_sesion_alumnos_operativa_app',
          `select=sesion_alumno_id,sesion_id,alumno_id,alumno,estado_en_listado,nivel_usado&${filtro}`
        ),
        props.consultarSupabase(
          'v_grupos_sesion_operativa_app',
          `select=sesion_id,grupo_id,nombre_grupo,nivel_grupo,pista,publicado,entrenador_id,entrenador_apoyo_id,total_alumnos,alumnos_lista&${filtro}`
        ),
      ]);
      const gruposPlan: GrupoPlan[] = (grupos || [])
        .filter((g: any) => g.grupo_id)
        .map((g: any) => ({
          sesionId: String(g.sesion_id),
          grupoId: String(g.grupo_id),
          nombre: String(g.nombre_grupo || 'Grupo'),
          nivelGrupo: g.nivel_grupo ?? null,
          alumnosLista: g.alumnos_lista ?? null,
          pista: g.pista ?? null,
          total: Number(g.total_alumnos || 0),
          entrenadores: new Set([g.entrenador_id, g.entrenador_apoyo_id].filter(Boolean).map(String)).size,
          publicado: Boolean(g.publicado),
        }));
      const listados: AlumnoPlan[] = (roster || []).map((a: any) => ({
        sesionAlumnoId: String(a.sesion_alumno_id),
        alumnoId: String(a.alumno_id),
        alumno: String(a.alumno || ''),
        sesionId: String(a.sesion_id),
        nivel: a.nivel_usado ?? null,
        estado: a.estado_en_listado ?? null,
      }));
      const pendientes: AlumnoPlan[] = [];
      const colocados = new Set<string>();
      ids.forEach((id) => {
        const delListado = listados.filter((a) => a.sesionId === id);
        const gruposSesion = (grupos || []).filter((g: any) => String(g.sesion_id) === id && g.grupo_id);
        const sin = gruposSesion.length
          ? pendingAgendaStudents(
              delListado.map((a) => ({ ...a, alumno: a.alumno })),
              gruposSesion,
              props.normalizarNombre
            )
          : [];
        const sinIds = new Set(sin.map((a) => a.sesionAlumnoId));
        delListado.forEach((a) => (sinIds.has(a.sesionAlumnoId) ? pendientes.push(a) : gruposSesion.length && colocados.add(a.alumnoId)));
      });
      // Teléfonos de las fichas (para detectar hermanos).
      const alumnoIds = Array.from(new Set(listados.map((a) => a.alumnoId)));
      const telefonos: Record<string, string | null> = {};
      for (let i = 0; i < alumnoIds.length; i += 80) {
        const lote = alumnoIds.slice(i, i + 80);
        try {
          const filas = await props.consultarSupabase(
            'v_resumen_alumno_v2',
            `select=alumno_id,telefono&alumno_id=in.(${lote.join(',')})`
          );
          (filas || []).forEach((f: any) => (telefonos[String(f.alumno_id)] = f.telefono ?? null));
        } catch {
          // Sin teléfonos solo se pierde la detección de hermanos.
        }
      }
      setDatos({ grupos: gruposPlan, listados, pendientes, colocados, telefonos });
      await cargarPropuestas(listados.map((a) => a.sesionAlumnoId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los niños sin colocar.');
    } finally {
      setCargando(false);
    }
  }

  async function cargarPropuestas(sesionAlumnoIds: string[]) {
    if (!sesionAlumnoIds.length) {
      setPropuestas([]);
      return;
    }
    try {
      const filas: any[] = [];
      for (let i = 0; i < sesionAlumnoIds.length; i += 80) {
        const lote = sesionAlumnoIds.slice(i, i + 80);
        const r = await props.consultarSupabase(
          'cambios_turno_propuestos_app',
          `select=sesion_alumno_id,estado,opciones,opcion_aceptada,updated_at,respondido_familia_at,movido_at,token_publico&sesion_alumno_id=in.(${lote.join(',')})`
        );
        filas.push(...(r || []));
      }
      setPropuestas(
        filas.map((f) => ({
          sesion_alumno_id: String(f.sesion_alumno_id),
          estado: f.estado,
          opciones: Array.isArray(f.opciones) ? f.opciones : [],
          opcion_aceptada: f.opcion_aceptada || null,
          updated_at: String(f.updated_at || ''),
          respondido_familia_at: f.respondido_familia_at || null,
          movido_at: f.movido_at || null,
          token_publico: f.token_publico || null,
        }))
      );
      setTablaPropuestasLista(true);
    } catch {
      // La tabla todavía no está creada en Supabase: el WhatsApp funciona
      // igual, pero las respuestas no se pueden apuntar.
      setPropuestas([]);
      setTablaPropuestasLista(false);
    }
  }

  async function enviarPropuesta(u: UnidadPlan) {
    if (!datos) return;
    const ops = turnosAOfrecer(u);
    const tel = telefonoFamilia(u, datos.telefonos);
    if (!ops.length || !tel) return;
    // Código de la familia: va en los enlaces del mensaje, así que se crea aquí
    // (antes de abrir WhatsApp) y se guarda después con la propuesta.
    // Si ya se le mandó antes, se reutiliza el mismo código: así el enlace
    // de un mensaje anterior sigue funcionando.
    const previo = propuestaDeUnidad(u, propuestas)?.token_publico || '';
    const token =
      previo ||
      (tablaPropuestasLista && !props.soloLectura && typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : '');
    const base = `${window.location.origin}${window.location.pathname}`;
    const texto = textoPropuestaFamilia(u, ops, token ? enlaceElegirTurno(base, token) : undefined);
    const url = urlWhatsappFamilia(tel, texto);
    if (!url) return;
    // Primero se abre WhatsApp (dentro del clic, si no el navegador lo bloquea).
    window.open(url, '_blank', 'noopener,noreferrer');
    setEnviadosLocal((x) => new Set(x).add(u.clave));
    if (!tablaPropuestasLista || props.soloLectura) return;
    const opciones: OpcionEnviada[] = ops.map((o) => ({
      sesionId: o.sesion.sesionId,
      etiqueta: etiquetaTurnoFamilia(o.sesion.fecha, o.sesion.hora_inicio, o.sesion.hora_fin),
      ...(o.familia ? { familia: true } : {}),
    }));
    try {
      // También los hermanos ya colocados si se ofrece mover a toda la familia.
      for (const m of ninosDePropuesta(u, ops)) {
        await props.ejecutarFuncionAuthJson('registrar_propuesta_cambio_turno_app', {
          p_sesion_alumno_id: m.sesionAlumnoId,
          p_alumno_id: m.alumnoId,
          p_sesion_origen_id: m.sesionId,
          p_opciones: opciones,
          p_telefono: tel,
          p_mensaje: texto,
          p_token: token || null,
        });
      }
      await cargarPropuestas(datos.listados.map((a) => a.sesionAlumnoId));
    } catch (e) {
      setError(`WhatsApp abierto, pero no se pudo apuntar como enviado: ${e instanceof Error ? e.message : 'error'}`);
    }
  }

  async function responderPropuesta(u: UnidadPlan, estado: 'ACEPTADO' | 'RECHAZADO' | 'COLOCADO' | 'DESCARTADO' | 'ENVIADO', opcion?: OpcionEnviada) {
    if (!tablaPropuestasLista || props.soloLectura || !datos) return;
    try {
      for (const m of ninosDePropuesta(u)) {
        await props.ejecutarFuncionAuthJson('responder_propuesta_cambio_turno_app', {
          p_sesion_alumno_id: m.sesionAlumnoId,
          p_estado: estado,
          p_opcion: opcion || null,
        });
      }
      if (estado === 'ACEPTADO' && opcion) {
        const o = u.opciones.find((x) => x.sesion.sesionId === opcion.sesionId);
        if (o) setEleccion((x) => ({ ...x, [u.clave]: o.clave }));
      }
      await cargarPropuestas(datos.listados.map((a) => a.sesionAlumnoId));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo apuntar la respuesta.');
    }
  }

  useEffect(() => {
    if (!abierta) return;
    setMensaje('');
    setEleccion({});
    void cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierta, firma]);

  // Las familias contestan desde su enlace: mientras la tabla está abierta se
  // miran sus respuestas cada 30 s (y al volver a la pestaña).
  useEffect(() => {
    if (!abierta || !datos || !tablaPropuestasLista) return;
    const ids = datos.listados.map((a) => a.sesionAlumnoId);
    const refrescar = () => void cargarPropuestas(ids);
    const t = window.setInterval(refrescar, 30000);
    window.addEventListener('focus', refrescar);
    return () => {
      window.clearInterval(t);
      window.removeEventListener('focus', refrescar);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierta, datos, tablaPropuestasLista]);

  useEffect(() => {
    if (!abierta) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') props.onCerrar();
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [abierta]);

  const plan: UnidadPlan[] = useMemo(
    () =>
      datos
        ? planificarSinColocar({
            sesiones: sesionesFuturas,
            grupos: datos.grupos,
            pendientes: datos.pendientes,
            listados: datos.listados,
            colocados: datos.colocados,
            telefonos: datos.telefonos,
          })
        : [],
    [datos, sesionesFuturas]
  );

  function opcionElegida(u: UnidadPlan): OpcionPlan | null {
    const clave = eleccion[u.clave];
    if (!clave) {
      const prop = propuestaDeUnidad(u, propuestas);
      if (prop?.estado === 'ACEPTADO' && prop.opcion_aceptada) {
        const aceptada = u.opciones.find((o) => o.sesion.sesionId === prop.opcion_aceptada!.sesionId);
        if (aceptada) return aceptada;
      }
      return u.propuesta;
    }
    if (clave.startsWith('g:') && datos) {
      const grupoId = clave.slice(2);
      const m = u.miembros[0];
      const x = gruposParaElegir(m, sesionesFuturas, datos.grupos, /BABY/i.test(u.origen.modalidad)).find(
        (o) => o.grupo.grupoId === grupoId
      );
      if (!x) return null;
      const mismoTurno = x.sesion.sesionId === m.sesionId;
      return {
        clave,
        sesion: x.sesion,
        colocaciones: [{ alumno: m, grupo: x.grupo, totalFinal: x.totalFinal, maximo: x.maximo, estado: x.estado, motivo: x.motivo }],
        estado: x.estado,
        score: x.score,
        mismoTurno,
        mismoDia: x.sesion.fecha === u.origen.fecha,
        avisos: mismoTurno ? [] : ['Cambio de turno: solo con el OK de los padres.'],
      };
    }
    return u.opciones.find((o) => o.clave === clave) || u.propuesta;
  }

  async function aplicarOpcion(o: OpcionPlan): Promise<string[]> {
    if (o.familia) {
      // Toda la familia de una vez (saca a los hermanos colocados de su grupo
      // y los pasa a todos al turno elegido). Si falla uno, no se mueve nadie.
      const r = await props.ejecutarFuncionAuthJson('mover_familia_entre_turnos_app', {
        p_movimientos: o.colocaciones.map((c) => ({
          sesion_alumno_id: c.alumno.sesionAlumnoId,
          sesion_destino_id: o.sesion.sesionId,
          grupo_destino_id: c.grupo.grupoId,
        })),
      });
      const notas: string[] = [];
      for (const g of (r?.grupos_origen || []) as Array<{ grupo_id: string; nombre: string; publicado: boolean; quedan: number }>) {
        if (Number(g.quedan) === 0) notas.push(`«${g.nombre}» se ha quedado vacío: bórralo o pásale niños.`);
        else if (Number(g.quedan) === 1) notas.push(`«${g.nombre}» se ha quedado con 1 niño: hazlo particular o muévelo.`);
        if (g.publicado && props.avisarCambioGrupo) await props.avisarCambioGrupo(g.grupo_id);
        else if (g.publicado) notas.push(`«${g.nombre}» estaba publicado: avisa al entrenador desde su sesión.`);
      }
      return notas;
    }
    for (const c of o.colocaciones) {
      const m = c.alumno;
      if (o.sesion.sesionId === m.sesionId) {
        const nivel = parseTechnicalLevel(m.nivel);
        if (nivel.status !== 'VALID') throw new Error(`${m.alumno}: sin nivel válido.`);
        await props.ejecutarFuncionAuthJson('incorporar_alumno_fuera_plazo_grupo_app', {
          p_sesion_id: o.sesion.sesionId,
          p_grupo_id: c.grupo.grupoId,
          p_alumno_id: m.alumnoId,
          p_nombre_completo: m.alumno,
          p_nivel_codigo: nivel.level,
        });
      } else {
        await moveBabyStudentBetweenSessions({
          sourceSessionStudentId: m.sesionAlumnoId,
          targetSessionId: o.sesion.sesionId,
          targetGroupId: c.grupo.grupoId,
        });
      }
    }
    return [];
  }

  function padresAceptan(u: UnidadPlan, o: OpcionPlan) {
    const prop = propuestaDeUnidad(u, propuestas);
    return prop?.estado === 'ACEPTADO' && prop.opcion_aceptada?.sesionId === o.sesion.sesionId;
  }

  function textoConfirmacion(u: UnidadPlan, o: OpcionPlan) {
    const lineas = o.colocaciones.map(
      (c) => `• ${c.alumno.alumno} → ${c.grupo.nombre} (${c.totalFinal}/${c.maximo})`
    );
    if (o.familia) {
      const yaColocados = o.colocaciones.filter((c) => !u.miembros.some((m) => m.sesionAlumnoId === c.alumno.sesionAlumnoId));
      lineas.push(`\nSe saca de su grupo de ${etiquetaTurno(u.origen)} a: ${yaColocados.map((c) => c.alumno.alumno).join(', ')}.`);
    }
    const avisos = [
      ...(o.mismoTurno
        ? []
        : padresAceptan(u, o)
        ? [`CAMBIO DE TURNO: de ${etiquetaTurno(u.origen)} a ${etiquetaTurno(o.sesion)}. ✓ Los padres han dicho que sí.`]
        : [`CAMBIO DE TURNO: de ${etiquetaTurno(u.origen)} a ${etiquetaTurno(o.sesion)}. Hazlo solo si los padres han dicho que sí.`]),
      ...(o.estado !== 'RECOMENDADO' ? [`Este encaje está marcado «${ETIQUETA_ESTADO[o.estado]}».`] : []),
      ...o.avisos.filter((a) => !a.startsWith('Cambio de turno')),
    ];
    return `${etiquetaTurno(o.sesion)}\n${lineas.join('\n')}${avisos.length ? `\n\n${avisos.join('\n')}` : ''}\n\n¿Confirmas?`;
  }

  async function aplicarUna(u: UnidadPlan) {
    const o = opcionElegida(u);
    if (!o || props.soloLectura) return;
    if (!window.confirm(textoConfirmacion(u, o))) return;
    setAplicando(u.clave);
    setError('');
    setMensaje('');
    try {
      const notas = await aplicarOpcion(o);
      const prop = propuestaDeUnidad(u, propuestas);
      if (prop) await responderPropuesta(u, prop.estado === 'ACEPTADO' || !o.mismoTurno ? 'COLOCADO' : 'DESCARTADO');
      const quienes = o.colocaciones.map((c) => c.alumno.alumno);
      setMensaje(
        `✓ ${quienes.join(' y ')} ${quienes.length > 1 ? 'colocados' : 'colocado'} · ${etiquetaTurno(o.sesion)}.${notas.length ? ` ${notas.join(' ')}` : ''}`
      );
      await props.onCambios();
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo colocar.');
    } finally {
      setAplicando('');
    }
  }

  const aplicablesMismoTurno = plan.filter((u) => {
    const o = opcionElegida(u);
    return !u.bloqueo && o && o.mismoTurno && o.estado === 'RECOMENDADO';
  });

  async function aplicarTodasMismoTurno() {
    if (props.soloLectura || !aplicablesMismoTurno.length) return;
    const resumen = aplicablesMismoTurno
      .map((u) => {
        const o = opcionElegida(u)!;
        return `• ${u.miembros.map((m) => m.alumno).join(' + ')} → ${o.colocaciones.map((c) => c.grupo.nombre).join(' / ')} (${etiquetaTurno(o.sesion)})`;
      })
      .join('\n');
    if (!window.confirm(`Colocar en su MISMO turno (sin cambiar de día):\n\n${resumen}\n\n¿Confirmas?`)) return;
    setAplicando('todas');
    setError('');
    setMensaje('');
    let hechos = 0;
    const fallos: string[] = [];
    for (const u of aplicablesMismoTurno) {
      try {
        await aplicarOpcion(opcionElegida(u)!);
        const prop = propuestaDeUnidad(u, propuestas);
        if (prop) await responderPropuesta(u, prop.estado === 'ACEPTADO' ? 'COLOCADO' : 'DESCARTADO');
        hechos += 1;
      } catch (e) {
        fallos.push(`${u.miembros[0].alumno}: ${e instanceof Error ? e.message : 'error'}`);
      }
    }
    setMensaje(`✓ ${hechos} colocado${hechos === 1 ? '' : 's'} en su turno.`);
    if (fallos.length) setError(fallos.join(' · '));
    await props.onCambios();
    await cargar();
    setAplicando('');
  }

  const familiasPorEnviar = datos
    ? plan.filter(
        (u) =>
          necesitaMensaje(u) &&
          telefonoFamilia(u, datos.telefonos) &&
          !propuestaDeUnidad(u, propuestas) &&
          !enviadosLocal.has(u.clave)
      )
    : [];
  const esperandoRespuesta = plan.filter((u) => propuestaDeUnidad(u, propuestas)?.estado === 'ENVIADO').length;
  const aceptadas = plan.filter((u) => propuestaDeUnidad(u, propuestas)?.estado === 'ACEPTADO').length;

  if (!abierta || typeof document === 'undefined') return null;

  function turnosAOfrecerPorDefecto(u: UnidadPlan): OpcionPlan[] {
    const elegida = opcionElegida(u);
    const propuestos = opcionesParaFamilia(u, 3, elegida);
    if (propuestos.length) return propuestos;
    return elegida && !elegida.mismoTurno ? [elegida] : [];
  }

  function turnosAOfrecer(u: UnidadPlan): OpcionPlan[] {
    const marcados = ofrecer[u.clave];
    if (!marcados) return turnosAOfrecerPorDefecto(u);
    const todos = [...turnosAOfrecerPorDefecto(u), ...turnosOfrecibles(u)];
    const vistos = new Set<string>();
    return todos.filter((o) => marcados.includes(o.sesion.sesionId) && !vistos.has(o.sesion.sesionId) && vistos.add(o.sesion.sesionId));
  }

  function alternarTurno(u: UnidadPlan, sesionId: string) {
    const actuales = turnosAOfrecer(u).map((o) => o.sesion.sesionId);
    const nuevos = actuales.includes(sesionId) ? actuales.filter((x) => x !== sesionId) : [...actuales, sesionId];
    setOfrecer((x) => ({ ...x, [u.clave]: nuevos.slice(0, 3) }));
  }

  function renderFamilia(u: UnidadPlan) {
    if (!datos) return null;
    const prop = propuestaDeUnidad(u, propuestas);
    // Sale si no cabe en su turno o si lo elegido ahora es cambiar de turno.
    const elegida = opcionElegida(u);
    const candidatos = (() => {
      const vistos = new Set<string>();
      return [...turnosAOfrecerPorDefecto(u), ...turnosOfrecibles(u)].filter(
        (o) => !vistos.has(o.sesion.sesionId) && vistos.add(o.sesion.sesionId)
      );
    })();
    const cabeEnSuTurno = u.opciones.some((o) => o.mismoTurno && o.estado === 'RECOMENDADO');
    // Sale si hay que escribir, si ya se escribió, o si hay turnos posibles y no
    // cabe en el suyo / has elegido otro turno (aunque separe de un hermano:
    // entonces los turnos salen sin marcar y eliges tú).
    if (!prop && !necesitaMensaje(u) && !(candidatos.length && (!cabeEnSuTurno || (elegida && !elegida.mismoTurno)))) return null;
    const marcados = turnosAOfrecer(u).map((o) => o.sesion.sesionId);
    const tel = telefonoFamilia(u, datos.telefonos);
    const enviadoAqui = enviadosLocal.has(u.clave);
    return (
      <div className={`ag-cf-familia is-${(prop?.estado || (enviadoAqui ? 'enviado' : 'sin')).toLowerCase()}`}>
        <div className="ag-cf-familia-cabecera">
          <strong>
            {prop?.estado === 'ACEPTADO'
              ? `✓ Aceptan: ${prop.opcion_aceptada?.etiqueta || ''}${prop.respondido_familia_at ? ' · lo han elegido ellos' : ''}${prop.movido_at ? ' · ya está en ese día, falta el grupo' : ''}`
              : prop?.estado === 'RECHAZADO'
              ? `✕ No pueden en esos turnos${prop.respondido_familia_at ? ' · lo han dicho ellos' : ''}`
              : prop?.estado === 'ENVIADO' || enviadoAqui
              ? '📤 Propuesta enviada · esperando respuesta'
              : 'Familia: proponer otro turno'}
          </strong>
          <span>{tel ? `📞 ${tel.replace(/(\d{3})(\d{3})(\d{3})/, '$1 $2 $3')}` : 'Sin teléfono en la ficha'}</span>
        </div>
        {!props.soloLectura && !prop?.movido_at && prop?.estado !== 'ACEPTADO' && candidatos.length > 0 && (
          <div className="ag-cf-ofrecer">
            <span>Turnos a ofrecer (máx. 3):</span>
            {candidatos.map((o) => {
              const activo = marcados.includes(o.sesion.sesionId);
              const separa = o.avisos.some((a) => a.startsWith('Separa de su hermano'));
              return (
                <button
                  key={o.sesion.sesionId}
                  type="button"
                  className={`ag-cf-turno${activo ? ' is-activo' : ''}`}
                  onClick={() => alternarTurno(u, o.sesion.sesionId)}
                  aria-pressed={activo}
                  title={o.avisos.join(' ')}
                >
                  {activo ? '✓ ' : ''}
                  {o.familia ? '👨‍👧 ' : ''}
                  {etiquetaTurno(o.sesion)}
                  {o.familia ? ' (todos)' : ''}
                  {separa ? ' ⚠ hermano' : ''}
                </button>
              );
            })}
          </div>
        )}
        {!props.soloLectura && (
          <div className="ag-cf-familia-botones">
            {tel && !prop?.movido_at && marcados.length > 0 && (
              <button type="button" className="ag-boton ag-boton--whatsapp" onClick={() => void enviarPropuesta(u)}>
                {prop || enviadoAqui ? '📲 Reenviar WhatsApp' : '📲 WhatsApp con propuesta'}
              </button>
            )}
            {tablaPropuestasLista &&
              prop &&
              prop.estado !== 'ACEPTADO' &&
              prop.opciones.map((op, i) => (
                <button key={op.sesionId} type="button" className="ag-boton" onClick={() => void responderPropuesta(u, 'ACEPTADO', op)}>
                  ✓ Aceptan {i + 1} · {op.etiqueta}
                </button>
              ))}
            {tablaPropuestasLista && prop && prop.estado === 'ENVIADO' && (
              <button type="button" className="ag-boton" onClick={() => void responderPropuesta(u, 'RECHAZADO')}>
                ✕ No pueden
              </button>
            )}
            {tablaPropuestasLista && prop && prop.estado !== 'ENVIADO' && !prop.movido_at && (
              <button type="button" className="ag-boton" onClick={() => void responderPropuesta(u, 'ENVIADO')}>
                ↺ Deshacer respuesta
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  const totalNinos = plan.reduce((t, u) => t + u.miembros.length, 0);
  const conPropuesta = plan.filter((u) => u.propuesta).length;

  return createPortal(
    <div className="ag-colocar-fondo" onClick={props.onCerrar}>
      <section className="ag-colocar ag-colocar--tabla" role="dialog" aria-label="Niños sin colocar" onClick={(e) => e.stopPropagation()}>
        <header className="ag-colocar-cabecera">
          <div>
            <h3>📌 Niños sin colocar · {totalNinos}</h3>
            <p>
              Propuesta según nivel, plazas, hermanos y fin de semana. Nada se mueve hasta que pulses «Colocar».
            </p>
          </div>
          <button type="button" className="ag-trabajo-volver" onClick={props.onCerrar}>
            ✕ Cerrar
          </button>
        </header>

        <div className="ag-colocar-barra">
          <span>
            <strong>{conPropuesta}</strong> con propuesta · <strong>{plan.length - conPropuesta}</strong> para decidir tú
            {(esperandoRespuesta > 0 || aceptadas > 0) && (
              <>
                {' '}· 📤 <strong>{esperandoRespuesta}</strong> esperando respuesta · ✓ <strong>{aceptadas}</strong> aceptan
              </>
            )}
          </span>
          <button type="button" className="ag-boton" onClick={() => void cargar()} disabled={cargando || Boolean(aplicando)}>
            {cargando ? 'Cargando…' : '⟳ Actualizar'}
          </button>
          {!props.soloLectura && familiasPorEnviar.length > 0 && (
            <button
              type="button"
              className="ag-boton ag-boton--whatsapp"
              onClick={() => void enviarPropuesta(familiasPorEnviar[0])}
              title="Abre el WhatsApp de la siguiente familia con el mensaje escrito; pulsa Enviar y vuelve para la siguiente"
            >
              📲 WhatsApp a la siguiente familia ({familiasPorEnviar.length} por enviar)
            </button>
          )}
          {!props.soloLectura && (
            <button
              type="button"
              className="ag-boton ag-boton--principal"
              disabled={!aplicablesMismoTurno.length || Boolean(aplicando)}
              onClick={() => void aplicarTodasMismoTurno()}
              title="Solo las que encajan en su mismo turno; los cambios de día van uno a uno"
            >
              {aplicando === 'todas' ? 'Colocando…' : `Colocar todas las de su turno (${aplicablesMismoTurno.length})`}
            </button>
          )}
        </div>

        {!tablaPropuestasLista && (
          <div className="ag-colocar-mensaje is-aviso">
            Los WhatsApp a familias funcionan, pero apuntar respuestas (aceptan / no pueden) está pendiente de activar en Supabase.
          </div>
        )}
        {(error || mensaje) && (
          <div className={`ag-colocar-mensaje${error ? ' is-error' : ''}`}>{error || mensaje}</div>
        )}

        <div className="ag-colocar-lista">
          {!cargando && datos && plan.length === 0 && (
            <p className="ag-colocar-vacio">✓ No queda ningún niño sin colocar desde hoy.</p>
          )}
          {plan.map((u) => {
            const o = opcionElegida(u);
            const familia = u.miembros.length > 1;
            const manual =
              !familia && datos
                ? gruposParaElegir(u.miembros[0], sesionesFuturas, datos.grupos, /BABY/i.test(u.origen.modalidad))
                : [];
            return (
              <div key={u.clave} className={`ag-cf${familia ? ' is-familia' : ''}`}>
                <div className="ag-cf-quien">
                  {familia && <span className="ag-cf-etiqueta">👨‍👧 Hermanos · van juntos</span>}
                  {u.miembros.map((m) => (
                    <div key={m.sesionAlumnoId} className="ag-cf-nombre">
                      <strong>{m.alumno}</strong>
                      <span>Nivel {parseTechnicalLevel(m.nivel).status === 'VALID' ? parseTechnicalLevel(m.nivel).level : 'SIN NIVEL'}</span>
                    </div>
                  ))}
                  <span className="ag-cf-origen">
                    Apuntado: {etiquetaTurno(u.origen)} · {u.origen.modalidad}
                  </span>
                  {u.hermanos.map((h) => (
                    <span key={h.alumno} className="ag-cf-hermano">
                      👨‍👧 Hermano/a: {h.alumno}
                      {h.sesion ? ` · ${etiquetaTurno(h.sesion)}` : ''}
                      {h.colocado ? ' · ✓ colocado' : h.sinColocar ? ' · sin colocar' : ''}
                    </span>
                  ))}
                </div>

                <div className="ag-cf-donde">
                  {u.bloqueo ? (
                    <span className="ag-cf-bloqueo">{u.bloqueo}</span>
                  ) : (
                    <>
                      {o ? (
                        <div className={`ag-cf-propuesta is-${o.estado.toLowerCase()}`}>
                          <span className="ag-cf-estado">{ETIQUETA_ESTADO[o.estado]}</span>
                          <strong>
                            {o.mismoTurno ? 'Su turno' : `→ ${etiquetaTurno(o.sesion)}`} ·{' '}
                            {o.familia
                              ? o.colocaciones.map((c) => `${c.alumno.alumno.split(' ')[0]} → ${c.grupo.nombre} (${c.totalFinal}/${c.maximo})`).join(' · ')
                              : o.colocaciones.map((c) => `${c.grupo.nombre} (${c.totalFinal}/${c.maximo})`).join(' / ')}
                          </strong>
                          {o.avisos.map((a) =>
                            a.startsWith('Cambio de turno') && padresAceptan(u, o) ? (
                              <span key={a} className="ag-cf-aviso is-ok">
                                ✓ Cambio de turno aceptado por los padres.
                              </span>
                            ) : (
                              <span key={a} className="ag-cf-aviso">
                                {a}
                              </span>
                            )
                          )}
                          {o.colocaciones.length === 1 && <span className="ag-cf-motivo">{o.colocaciones[0].motivo}</span>}
                        </div>
                      ) : (
                        <span className="ag-cf-bloqueo">Sin hueco que encaje: elige tú abajo o abre la sesión.</span>
                      )}
                      <select
                        className="ag-cf-select"
                        value={eleccion[u.clave] || (u.propuesta?.clave ?? '')}
                        onChange={(e) => setEleccion((x) => ({ ...x, [u.clave]: e.target.value }))}
                        aria-label="Elegir otra opción"
                      >
                        {!u.propuesta && <option value="">— Elegir dónde —</option>}
                        <optgroup label="Opciones propuestas">
                          {u.opciones.slice(0, 8).map((op) => (
                            <option key={op.clave} value={op.clave}>
                              {ETIQUETA_ESTADO[op.estado]} · {op.mismoTurno ? 'Su turno' : etiquetaTurno(op.sesion)} ·{' '}
                              {op.familia ? '👨‍👧 Toda la familia · ' : ''}
                              {op.colocaciones.map((c) => `${op.familia ? `${c.alumno.alumno.split(' ')[0]} ` : ''}${c.grupo.nombre} ${c.totalFinal}/${c.maximo}`).join(' / ')}
                            </option>
                          ))}
                        </optgroup>
                        {manual.length > 0 && (
                          <optgroup label="Cualquier grupo (a mano)">
                            {manual.map((x) => (
                              <option key={x.grupo.grupoId} value={`g:${x.grupo.grupoId}`}>
                                {etiquetaTurno(x.sesion)} · {x.grupo.nombre} · {x.totalFinal}/{x.maximo} · {ETIQUETA_ESTADO[x.estado]}
                              </option>
                            ))}
                          </optgroup>
                        )}
                      </select>
                      {renderFamilia(u)}
                    </>
                  )}
                </div>

                <div className="ag-cf-acciones">
                  {!u.bloqueo && !props.soloLectura && (
                    <button
                      type="button"
                      className="ag-boton ag-boton--principal"
                      disabled={!o || Boolean(aplicando)}
                      onClick={() => void aplicarUna(u)}
                    >
                      {aplicando === u.clave ? 'Colocando…' : o?.familia ? 'Mover a toda la familia' : o && !o.mismoTurno ? 'Cambiar turno y colocar' : 'Colocar'}
                    </button>
                  )}
                  <button
                    type="button"
                    className="ag-boton"
                    onClick={() => props.onAbrirSesion(u.origen.sesionId, u.miembros[0].sesionAlumnoId)}
                  >
                    {u.bloqueo && /Alta/.test(u.bloqueo) ? 'Crear Alta / Test' : 'Abrir sesión'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>,
    document.body
  );
}
