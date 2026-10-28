import { comprobarAccesoPaco, tokenSesionPacoActual } from './pacoClient';
import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config/supabase';

type SecretariaTipo = 'tarea' | 'nota';
type SecretariaEstado = 'pendiente' | 'en_curso' | 'resuelto' | 'referencia';
type SecretariaPrioridad = 'baja' | 'normal' | 'alta' | 'urgente';
type SecretariaCategoria =
  | 'familia'
  | 'cambio_turno'
  | 'alumno_tecnica'
  | 'entrenador'
  | 'administracion'
  | 'incidencia'
  | 'disponibilidad'
  | 'grupo'
  | 'cobro'
  | 'otro';

export type SecretariaRegistro = {
  id: string;
  tipo: SecretariaTipo;
  estado: SecretariaEstado;
  prioridad: SecretariaPrioridad;
  categoria: SecretariaCategoria;
  titulo: string;
  detalle: string | null;
  fecha_evento: string | null;
  hora_evento: string | null;
  fecha_limite: string | null;
  alumno_id: string | null;
  alumno: string | null;
  entrenador_id: string | null;
  entrenador: string | null;
  grupo_id: string | null;
  nombre_grupo: string | null;
  sesion_id: string | null;
  sesion_fecha: string | null;
  sesion_hora_inicio: string | null;
  sesion_hora_fin: string | null;
  modalidad_id: string | null;
  modalidad_codigo: string | null;
  modalidad: string | null;
  creado_por_usuario_id: string | null;
  creado_por: string | null;
  origen: string;
  etiquetas: string[];
  created_at: string;
  updated_at: string;
  resuelto_at: string | null;
  /** Cuándo avisar al móvil (29/10). Llega aparte de la lista. */
  recordar_at?: string | null;
  recordatorio_enviado_at?: string | null;
};

export type SecretariaEntradaInput = {
  tipo: SecretariaTipo;
  estado: SecretariaEstado;
  prioridad: SecretariaPrioridad;
  categoria: SecretariaCategoria;
  titulo: string;
  detalle?: string | null;
  fecha_evento?: string | null;
  hora_evento?: string | null;
  fecha_limite?: string | null;
  /** Aviso al móvil; solo se envía si hay valor o había uno que quitar. */
  recordar_at?: string | null;
  etiquetas?: string[];
  origen?: 'app' | 'telegram' | 'paquito_app' | 'manual';
};

function crearErrorSecretaria(mensaje: string, status?: number) {
  const error = new Error(mensaje) as Error & { status?: number };
  error.status = status;
  return error;
}

async function obtenerTokenSecretaria() {
  await comprobarAccesoPaco();
  const token = tokenSesionPacoActual();
  if (!token) throw crearErrorSecretaria('NO_SESSION', 401);
  return token;
}

async function peticionSecretaria<T>(
  ruta: string,
  init: RequestInit = {}
): Promise<T> {
  const token = await obtenerTokenSecretaria();
  const respuesta = await fetch(`${SUPABASE_URL}${ruta}`, {
    ...init,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...(init.headers || {}),
    },
  });

  const texto = await respuesta.text();
  let datos: any = null;

  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = null;
  }

  if (!respuesta.ok) {
    const mensaje =
      datos?.message ||
      datos?.error ||
      datos?.hint ||
      (respuesta.status === 403
        ? 'Acceso restringido a coordinador jefe.'
        : 'No se pudo completar la operación de Secretaría.');
    throw crearErrorSecretaria(String(mensaje), respuesta.status);
  }

  return datos as T;
}

export async function listarSecretaria() {
  return peticionSecretaria<SecretariaRegistro[]>(
    '/rest/v1/rpc/obtener_secretaria_coordinacion_app',
    {
      method: 'POST',
      body: '{}',
    }
  );
}

/** Avisos programados (id → hora). Si la base de datos aún no tiene las
 * columnas, devuelve [] y la Secretaría sigue funcionando igual. */
export async function listarRecordatoriosSecretaria(): Promise<
  Array<{ id: string; recordar_at: string | null; recordatorio_enviado_at: string | null }>
> {
  try {
    const datos = await peticionSecretaria<
      Array<{ id: string; recordar_at: string | null; recordatorio_enviado_at: string | null }>
    >(
      '/rest/v1/secretaria_coordinacion?select=id,recordar_at,recordatorio_enviado_at&recordar_at=not.is.null',
      { method: 'GET' }
    );
    return Array.isArray(datos) ? datos : [];
  } catch {
    return [];
  }
}

export async function crearEntradaSecretaria(input: SecretariaEntradaInput) {
  return peticionSecretaria<SecretariaRegistro[]>(
    '/rest/v1/secretaria_coordinacion',
    {
      method: 'POST',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify({
        ...input,
        detalle: input.detalle || null,
        fecha_evento: input.fecha_evento || null,
        hora_evento: input.hora_evento || null,
        fecha_limite: input.fecha_limite || null,
        ...(input.recordar_at ? { recordar_at: input.recordar_at } : {}),
        etiquetas: input.etiquetas || [],
        origen: input.origen || 'app',
      }),
    }
  );
}

export async function actualizarEntradaSecretaria(
  id: string,
  cambios: Partial<SecretariaEntradaInput>
) {
  return peticionSecretaria<SecretariaRegistro[]>(
    `/rest/v1/secretaria_coordinacion?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'PATCH',
      headers: { Prefer: 'return=representation' },
      body: JSON.stringify(cambios),
    }
  );
}

export async function eliminarEntradaSecretaria(id: string) {
  await peticionSecretaria<unknown>(
    `/rest/v1/secretaria_coordinacion?id=eq.${encodeURIComponent(id)}`,
    {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    }
  );
}

export async function eliminarResueltasSecretaria() {
  await peticionSecretaria<unknown>(
    '/rest/v1/secretaria_coordinacion?estado=eq.resuelto',
    {
      method: 'DELETE',
      headers: { Prefer: 'return=minimal' },
    }
  );
}
