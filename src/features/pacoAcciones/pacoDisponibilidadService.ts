// Paco · disponibilidad semanal (acceso a datos).
//
// Todo va con la sesión de Jose y con las MISMAS funciones de Supabase que usa
// la pantalla Disponibilidad al guardar y publicar (nada nuevo en la base de
// datos): obtener / guardar_borrador / publicar, y el aviso push a los
// entrenadores igual que al pulsar «Publicar» a mano.
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import { obtenerAccessTokenSupabaseApp } from '../../services/auth/authService';
import { createSupabaseRestClient } from '../../services/supabase/restClient';
import { llamarMiticoPush, type MiticoPushActionResult } from '../../lib/pushNotifications';
import {
  crearBorradorDisponibilidadEditor,
  normalizarBorradorDisponibilidadEditorServidor,
  type BorradorDisponibilidadEditor,
  type DisponibilidadEntrenador,
  type RespuestaDisponibilidadEditorServidor,
} from '../availability/availabilityEditor';

const supabase = createSupabaseRestClient({
  supabaseUrl: SUPABASE_URL,
  publishableKey: SUPABASE_ANON_KEY,
  getAccessToken: obtenerAccessTokenSupabaseApp,
});

export type EstadoSemana = {
  existe: boolean;
  estado: string;
  version_publicada: number;
  actualizado_en: string | null;
  base: 'plantilla' | 'borrador' | 'publicado';
  borrador: BorradorDisponibilidadEditor;
  servidor: RespuestaDisponibilidadEditorServidor;
};

export function ahoraMadridIso() {
  const partes = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date());
  const get = (tipo: string) => partes.find((p) => p.type === tipo)?.value || '00';
  return `${get('year')}-${get('month')}-${get('day')}T${get('hour')}:${get('minute')}`;
}

// Lee el estado de la semana tal cual lo ve la pantalla Disponibilidad:
// borrador guardado, publicada o «sin preparar» (entonces, plantilla habitual).
export async function leerSemana(semanaInicio: string): Promise<EstadoSemana> {
  const servidor = await supabase.rpcJson<RespuestaDisponibilidadEditorServidor>(
    'obtener_disponibilidad_semana_editor_app',
    { p_semana_inicio: semanaInicio }
  );
  if (!servidor || typeof servidor !== 'object') {
    throw new Error('La base de datos no devolvió el estado de la semana.');
  }
  if (!servidor.existe) {
    return {
      existe: false,
      estado: 'sin_preparar',
      version_publicada: 0,
      actualizado_en: null,
      base: 'plantilla',
      borrador: crearBorradorDisponibilidadEditor(semanaInicio),
      servidor,
    };
  }
  return {
    existe: true,
    estado: String(servidor.estado || ''),
    version_publicada: Number(servidor.version_publicada || 0),
    actualizado_en: servidor.actualizado_en ? String(servidor.actualizado_en) : null,
    base: servidor.fuente === 'publicado' ? 'publicado' : 'borrador',
    borrador: normalizarBorradorDisponibilidadEditorServidor(servidor),
    servidor,
  };
}

// Cuántos entrenadores han respondido ya (solo informativo; si falla, se omite).
export async function contarRespuestas(semanaInicio: string): Promise<{ respondieron: number; total: number } | null> {
  try {
    const r = await supabase.rpcJson<{ turnos?: DisponibilidadEntrenador[] }>(
      'obtener_disponibilidad_publicada_entrenadores_editor_app',
      { p_semana_inicio: semanaInicio }
    );
    const turnos = Array.isArray(r?.turnos) ? r.turnos : [];
    const todos = new Set<string>();
    const respondieron = new Set<string>();
    for (const t of turnos) {
      const id = String(t.entrenador_id || '');
      if (!id) continue;
      todos.add(id);
      const resp = String(t.respuesta || '').trim().toLowerCase();
      if (resp && resp !== 'pendiente') respondieron.add(id);
    }
    return todos.size ? { respondieron: respondieron.size, total: todos.size } : null;
  } catch {
    return null;
  }
}

export async function guardarBorrador(borrador: BorradorDisponibilidadEditor) {
  return supabase.rpcJson<RespuestaDisponibilidadEditorServidor>(
    'guardar_borrador_disponibilidad_semana_editor_app',
    {
      p_semana_inicio: borrador.semana_inicio,
      p_fecha_limite: borrador.fecha_limite,
      p_dias: borrador.dias,
    }
  );
}

export async function publicarSemana(semanaInicio: string) {
  return supabase.rpcJson<RespuestaDisponibilidadEditorServidor & { publicada_at?: string | null }>(
    'publicar_disponibilidad_semana_editor_app',
    { p_semana_inicio: semanaInicio }
  );
}

// Aviso push a los entrenadores, igual que al publicar a mano. Si falla, la
// semana ya está publicada: se devuelve null y Paco lo cuenta.
export async function avisarEntrenadores(semanaInicio: string): Promise<MiticoPushActionResult | null> {
  try {
    return await llamarMiticoPush<MiticoPushActionResult>(
      {
        supabaseUrl: SUPABASE_URL,
        anonKey: SUPABASE_ANON_KEY,
        accessToken: await obtenerAccessTokenSupabaseApp(),
      },
      'availability_opened',
      { semana_inicio: semanaInicio }
    );
  } catch (error) {
    console.warn('Paco: la disponibilidad se publicó pero el aviso push falló.', error);
    return null;
  }
}
