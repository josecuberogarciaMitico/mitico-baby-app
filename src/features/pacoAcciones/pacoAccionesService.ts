// Paco · acciones (acceso a datos).
//
// Todo va con la sesión de Jose, igual que la Agenda: lectura de las mismas
// vistas y escritura SOLO con mover_alumno_entre_turnos_operativa_app (que ya
// comprueba en la base de datos: misma semana, solo Baby, que el niño no esté
// ya en un grupo, que no tenga reporte ni asistencia, el ratio del grupo...).
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../../services/auth/authService';
import { createSupabaseRestClient } from '../../services/supabase/restClient';
import { moveBabyStudentBetweenSessions } from '../../services/agenda/agendaRelocationService';
import type {
  AgendaAlumnoSesionApp,
  AgendaGrupoSesionApp,
  AgendaSesionDirectaApp,
} from '../agenda/agendaTypes';
import { addIsoDays, isBabyAgendaSession } from '../agenda/agendaRelocation';
import { normalizarNombreAlumno, type TurnoBaby } from './pacoAccionesLogic';

const supabase = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

export function hoyMadrid() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function filtroIn(ids: string[]) {
  return encodeURIComponent(`in.(${ids.join(',')})`);
}

// Turnos Baby desde hoy hasta dentro de `dias` días, con su lista y sus grupos.
export async function cargarTurnosBaby(dias = 21): Promise<TurnoBaby[]> {
  const desde = hoyMadrid();
  const hasta = addIsoDays(desde, dias);
  const sesiones = (
    await supabase.query<AgendaSesionDirectaApp>(
      'v_agenda_sesiones_operativa_app',
      `select=*&fecha=gte.${desde}&fecha=lte.${hasta}&order=fecha.asc,hora_inicio.asc`
    )
  ).filter((sesion) => isBabyAgendaSession(sesion));
  if (!sesiones.length) return [];

  const ids = sesiones.map((sesion) => sesion.sesion_id);
  const [alumnos, grupos] = await Promise.all([
    supabase.query<AgendaAlumnoSesionApp>(
      'v_sesion_alumnos_operativa_app',
      `select=*&sesion_id=${filtroIn(ids)}&order=orden.asc`
    ),
    supabase.query<AgendaGrupoSesionApp>(
      'v_grupos_sesion_operativa_app',
      `select=*&sesion_id=${filtroIn(ids)}&order=nombre_grupo.asc`
    ),
  ]);

  return sesiones.map((sesion) => ({
    sesion,
    roster: alumnos.filter((a) => a.sesion_id === sesion.sesion_id),
    grupos: grupos.filter((g) => g.sesion_id === sesion.sesion_id),
  }));
}

export type ResultadoMovimiento = {
  ok: boolean;
  grupo_destino: string | null;
  incorporado_a_grupo: boolean;
};

export async function moverAlumnoDeTurno(input: {
  sesion_alumno_id: string;
  sesion_destino_id: string;
  grupo_destino_id: string | null;
}): Promise<ResultadoMovimiento> {
  const r = await moveBabyStudentBetweenSessions({
    sourceSessionStudentId: input.sesion_alumno_id,
    targetSessionId: input.sesion_destino_id,
    targetGroupId: input.grupo_destino_id,
  });
  return {
    ok: Boolean(r?.ok),
    grupo_destino: r?.grupo_destino ?? null,
    incorporado_a_grupo: Boolean(r?.incorporado_a_grupo),
  };
}

// Vuelve a leer los datos DESPUÉS de mover y comprueba que quedó como se dijo.
export async function verificarMovimiento(input: {
  sesion_alumno_id: string;
  sesion_destino_id: string;
  grupo_destino_id: string | null;
  nombre: string;
}): Promise<{ ok: boolean; detalle: string }> {
  try {
    const filas = await supabase.query<AgendaAlumnoSesionApp>(
      'v_sesion_alumnos_operativa_app',
      `select=*&sesion_alumno_id=eq.${encodeURIComponent(input.sesion_alumno_id)}`
    );
    const fila = filas[0];
    if (!fila || fila.sesion_id !== input.sesion_destino_id) {
      return { ok: false, detalle: 'No veo al niño en el turno de destino al volver a leer los datos.' };
    }
    if (input.grupo_destino_id) {
      const grupos = await supabase.query<AgendaGrupoSesionApp>(
        'v_grupos_sesion_operativa_app',
        `select=*&grupo_id=eq.${encodeURIComponent(input.grupo_destino_id)}`
      );
      const buscado = normalizarNombreAlumno(input.nombre);
      const dentro = String(grupos[0]?.alumnos_lista || '')
        .split(' || ')
        .some((n) => normalizarNombreAlumno(n) === buscado);
      if (!dentro) {
        return { ok: false, detalle: 'El niño está en el turno, pero no lo veo dentro del grupo al volver a leer.' };
      }
    }
    return { ok: true, detalle: 'Comprobado volviendo a leer los datos.' };
  } catch {
    return { ok: false, detalle: 'No he podido volver a leer los datos para comprobarlo.' };
  }
}

// Registro de lo que Paco hace (tabla paco_acciones). Si la tabla todavía no
// existe o falla, NO afecta a la acción: solo se deja constancia en consola.
export async function registrarAccion(input: {
  accion: string;
  estado: 'ok' | 'error' | 'cancelada';
  resumen: string;
  parametros?: Record<string, unknown>;
  resultado?: Record<string, unknown>;
  error?: string;
}) {
  try {
    const token = await obtenerAccessTokenSupabaseApp();
    const r = await fetch(`${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/paco_acciones`, {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        Prefer: 'return=minimal',
      },
      body: JSON.stringify({
        accion: input.accion,
        estado: input.estado,
        resumen: input.resumen.slice(0, 500),
        parametros: input.parametros ?? null,
        resultado: input.resultado ?? null,
        error: input.error ? input.error.slice(0, 500) : null,
      }),
    });
    if (!r.ok) console.warn('Paco: no se pudo registrar la acción.', r.status);
  } catch (e) {
    console.warn('Paco: no se pudo registrar la acción.', e);
  }
}
