// Paco con «manos»: ejecuta, con la sesión de Jose, el cambio que el agente
// preparó y Jose confirmó con el botón. Usa las MISMAS funciones de la base de
// datos que la Agenda (que ya comprueban permisos, grupo cancelado, ratio...):
//   - incorporar_alumno_fuera_plazo_grupo_app (alta tardía / niño sin grupo)
//   - mover_alumno_grupo_operativa_app (cambio de grupo en el mismo turno)
// Después vuelve a leer los datos para comprobar que quedó como se dijo.
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../../services/auth/authService';
import { createSupabaseRestClient } from '../../services/supabase/restClient';
import { registrarAccion } from './pacoAccionesService';
import {
  esPropuestaAgente,
  esPropuestaGestion,
  resumenPropuesta,
  type PropuestaAgente,
  type PropuestaGestion,
} from './pacoAgenteAccionesLogic';
import { crearEntradaSecretaria } from '../../lib/secretariaClient';
import { llamarMiticoPush } from '../../lib/pushNotifications';
import { GROUP_OPERATION_RPC } from '../../core/groups/groupOperations';

export {
  esPropuestaAgente,
  esPropuestaGestion,
  type PropuestaAgente,
  type PropuestaGestion,
} from './pacoAgenteAccionesLogic';

const supabase = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

function estadoHttp(error: unknown) {
  return (error as Error & { status?: number })?.status;
}

async function comprobar(alumnoId: string, grupoId: string) {
  const filas = await supabase.query<{ grupo_id: string }>(
    'grupo_alumnos',
    `select=grupo_id&alumno_id=eq.${encodeURIComponent(alumnoId)}&grupo_id=eq.${encodeURIComponent(grupoId)}`
  );
  return filas.length > 0;
}

export async function ejecutarPropuestaAgente(propuesta: unknown): Promise<{ answer: string }> {
  if (!esPropuestaAgente(propuesta)) {
    return { answer: 'Esa confirmación no es válida. No he cambiado nada; pídamelo de nuevo.' };
  }
  const p: PropuestaAgente = propuesta;
  const resumen = resumenPropuesta(p);
  const parametros = {
    tipo: p.tipo,
    alumno_id: p.alumno_id,
    sesion_id: p.sesion_id,
    grupo_id: p.grupo_id,
    grupo_origen_id: p.grupo_origen_id,
    nivel: p.nivel,
  };

  try {
    let alumnoId = p.alumno_id;
    if (p.tipo === 'mover_mismo_turno') {
      const r = await supabase.rpcJson<{ ok?: boolean }>('mover_alumno_grupo_operativa_app', {
        p_alumno_id: p.alumno_id,
        p_grupo_origen_id: p.grupo_origen_id,
        p_grupo_destino_id: p.grupo_id,
      });
      if (!r?.ok) throw new Error('La base de datos no confirmó el cambio de grupo.');
    } else {
      const filas = await supabase.rpcRows<{ alumno_id: string; resultado: string }>(
        'incorporar_alumno_fuera_plazo_grupo_app',
        {
          p_sesion_id: p.sesion_id,
          p_grupo_id: p.grupo_id,
          p_alumno_id: p.alumno_id,
          p_nombre_completo: p.nombre,
          p_nivel_codigo: p.nivel,
        }
      );
      const fila = filas[0];
      if (!fila?.alumno_id) throw new Error('La base de datos no confirmó la incorporación.');
      alumnoId = fila.alumno_id;
    }

    const comprobado = alumnoId ? await comprobar(alumnoId, p.grupo_id).catch(() => false) : false;
    void registrarAccion({
      accion: 'paco_meter_en_grupo',
      estado: 'ok',
      resumen,
      parametros,
      resultado: { alumno_id: alumnoId, comprobado },
    });
    return {
      answer: `Hecho, señor Cubero. ${p.nombre} ya está en «${p.grupo}» (${p.turno}).\n${
        comprobado
          ? 'Lo he comprobado volviendo a leer los datos.'
          : 'Ojo: al volver a leer los datos no lo veo en el grupo. Revíselo en la Agenda.'
      }\nSi la Agenda estaba abierta, actualícela para verlo.`,
    };
  } catch (error) {
    if (estadoHttp(error) === 401) throw error;
    const detalle = error instanceof Error ? error.message : 'Error desconocido.';
    void registrarAccion({ accion: 'paco_meter_en_grupo', estado: 'error', resumen, parametros, error: detalle });
    return { answer: `No lo he podido hacer: ${detalle.slice(0, 220)}\nNo se ha cambiado nada.` };
  }
}

// ---- Gestiones (29/10): recordatorio con aviso y publicar grupos -----------
// Recordatorio → tarea de Secretaría con «Avisarme el … a las …» (el aviso al
// móvil lo manda mitico-paco-avisos). Publicar → la misma función que el botón
// «Publicar al entrenador» de la Agenda, y después el aviso al entrenador.

async function ejecutarRecordatorio(p: Extract<PropuestaGestion, { tipo: 'recordatorio' }>) {
  const filas = await crearEntradaSecretaria({
    tipo: 'tarea',
    estado: 'pendiente',
    prioridad: 'normal',
    categoria: 'otro',
    titulo: p.titulo,
    detalle: p.detalle,
    fecha_evento: p.recordar_at.slice(0, 10),
    recordar_at: p.recordar_at,
    origen: 'paquito_app',
  });
  const fila = Array.isArray(filas) ? filas[0] : null;
  if (!fila?.id) throw new Error('Secretaría no confirmó la tarea.');
  return `Apuntado en Secretaría, señor Cubero: «${p.titulo}». Le llegará el aviso al móvil el ${p.cuando}.`;
}

async function ejecutarPublicar(p: Extract<PropuestaGestion, { tipo: 'publicar_grupos' }>) {
  const hechos: string[] = [];
  const fallos: string[] = [];
  const accessToken = await obtenerAccessTokenSupabaseApp();
  for (const g of p.grupos) {
    try {
      await supabase.rpcJson(GROUP_OPERATION_RPC.publish, { p_grupo_id: g.grupo_id });
      try {
        await llamarMiticoPush({ supabaseUrl: SUPABASE_URL, anonKey: SUPABASE_ANON_KEY, accessToken }, 'group_published', {
          grupo_id: g.grupo_id,
        });
      } catch (error) {
        console.warn('Grupo publicado, pero no se pudo enviar el aviso push:', error);
      }
      hechos.push(g.grupo_id);
    } catch (error) {
      if (estadoHttp(error) === 401) throw error;
      fallos.push(`${g.nombre} (${g.turno}): ${error instanceof Error ? error.message.slice(0, 140) : 'error'}`);
    }
  }
  // Comprobación: se vuelve a leer si de verdad quedaron publicados.
  const comprobados = hechos.length
    ? await supabase
        .query<{ id: string; publicado: boolean | null }>('grupos', `select=id,publicado&id=in.(${hechos.join(',')})`)
        .catch(() => [])
    : [];
  const ok = p.grupos.filter((g) => comprobados.some((c) => c.id === g.grupo_id && c.publicado));
  const lineas = [
    ok.length
      ? `Publicado${ok.length === 1 ? '' : 's'}: ${ok.map((g) => `«${g.nombre}» (${g.turno}) a ${g.entrenador.split(' ')[0] || 'su entrenador'}`).join('; ')}. Les llega el aviso.`
      : 'No se ha publicado ninguno.',
  ];
  if (fallos.length) lineas.push(`No se pudo: ${fallos.join('; ')}.`);
  if (hechos.length > ok.length) lineas.push('Ojo: alguno no aparece como publicado al volver a leer los datos. Revíselo en Entrenamientos.');
  return { texto: lineas.join('\n'), estado: fallos.length || hechos.length > ok.length ? 'error' : 'ok', ok: ok.length };
}

export async function ejecutarPropuestaGestion(propuesta: unknown): Promise<{ answer: string }> {
  if (!esPropuestaGestion(propuesta)) {
    return { answer: 'Esa confirmación no es válida. No he cambiado nada; pídamelo de nuevo.' };
  }
  const p: PropuestaGestion = propuesta;
  const accion = p.tipo === 'recordatorio' ? 'paco_recordatorio' : 'paco_publicar_grupos';
  try {
    if (p.tipo === 'recordatorio') {
      const answer = await ejecutarRecordatorio(p);
      void registrarAccion({ accion, estado: 'ok', resumen: p.etiqueta, parametros: { recordar_at: p.recordar_at } });
      return { answer };
    }
    const r = await ejecutarPublicar(p);
    void registrarAccion({
      accion,
      estado: r.estado === 'ok' ? 'ok' : 'error',
      resumen: p.etiqueta,
      parametros: { grupos: p.grupos.map((g) => g.grupo_id) },
      resultado: { publicados: r.ok },
    });
    return { answer: `${r.ok ? 'Hecho, señor Cubero. ' : ''}${r.texto}` };
  } catch (error) {
    if (estadoHttp(error) === 401) throw error;
    const detalle = error instanceof Error ? error.message : 'Error desconocido.';
    void registrarAccion({ accion, estado: 'error', resumen: p.etiqueta, parametros: {}, error: detalle });
    return { answer: `No lo he podido hacer: ${detalle.slice(0, 220)}\nNo se ha cambiado nada.` };
  }
}
