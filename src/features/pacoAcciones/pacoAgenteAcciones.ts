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
import { esPropuestaAgente, resumenPropuesta, type PropuestaAgente } from './pacoAgenteAccionesLogic';

export { esPropuestaAgente, type PropuestaAgente } from './pacoAgenteAccionesLogic';

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
