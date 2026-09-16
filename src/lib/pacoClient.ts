import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config/supabase';
const MITICO_AUTH_STORAGE_KEY = 'mitico_auth_session_v1';
const PACO_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-api`;
const PACO_SECRETARIA_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-secretaria`;
const PACO_STUDENT_GUARD_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-student-guard`;

type SesionAuthPaco = {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  user?: {
    id?: string;
    email?: string;
  };
};

export type PacoSecretaryDraft = {
  tipo: 'tarea' | 'nota';
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  categoria:
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
  titulo: string;
  detalle: string | null;
  fecha_evento: string | null;
  fecha_limite: string | null;
  alumno_id?: string | null;
};

export type PacoContinuation =
  | {
      kind: 'recommend_group';
      date: string;
      modality: 'BABY' | 'OCIO';
      level: string;
      age: number;
    }
  | {
      kind: 'secretary_create';
      draft: PacoSecretaryDraft;
    }
  | {
      kind: 'secretary_set_status';
      id: string;
      title: string;
      status: 'pendiente' | 'en_curso' | 'resuelto';
    }
  | {
      kind: 'secretary_delete_confirm';
      id: string;
      title: string;
    }
  | {
      kind: 'secretary_cleanup_resolved_confirm';
      count: number;
    };

export type PacoChoice = {
  label: string;
  continuation: PacoContinuation;
};

export type PacoStatus = {
  ok: boolean;
  service?: string;
  access?: string;
  mode?: string;
  profile?: {
    nombre?: string;
    rol?: string;
  };
};

export type PacoResponse = {
  ok: boolean;
  answer?: string;
  error?: string;
  choices?: PacoChoice[];
  mode?: string;
  secretary_changed?: boolean;
  handled?: boolean;
};

let refrescoSesionPacoEnCurso: Promise<SesionAuthPaco> | null = null;

function leerSesionPaco(): SesionAuthPaco | null {
  if (typeof window === 'undefined') return null;

  try {
    const raw = window.localStorage.getItem(MITICO_AUTH_STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SesionAuthPaco;
  } catch {
    return null;
  }
}

function guardarSesionPaco(sesion: SesionAuthPaco) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(MITICO_AUTH_STORAGE_KEY, JSON.stringify(sesion));
}

function crearErrorPaco(mensaje: string, status?: number) {
  const error = new Error(mensaje) as Error & { status?: number };
  error.status = status;
  return error;
}

async function refrescarSesionPaco(
  sesion: SesionAuthPaco
): Promise<SesionAuthPaco> {
  if (!sesion.refresh_token) {
    throw crearErrorPaco('NO_SESSION', 401);
  }

  const respuesta = await fetch(
    `${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`,
    {
      method: 'POST',
      headers: {
        apikey: SUPABASE_ANON_KEY,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: sesion.refresh_token }),
    }
  );

  const texto = await respuesta.text();
  let datos: any = null;

  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = null;
  }

  if (!respuesta.ok || !datos?.access_token) {
    throw crearErrorPaco('NO_SESSION', respuesta.status || 401);
  }

  const expiresAt =
    Number(datos.expires_at) ||
    (Number(datos.expires_in)
      ? Math.floor(Date.now() / 1000) + Number(datos.expires_in)
      : sesion.expires_at);

  const refrescada: SesionAuthPaco = {
    ...sesion,
    access_token: String(datos.access_token),
    refresh_token: String(datos.refresh_token || sesion.refresh_token || ''),
    expires_at: expiresAt,
    user: datos.user
      ? {
          id: String(datos.user?.id || sesion.user?.id || ''),
          email: String(datos.user?.email || sesion.user?.email || ''),
        }
      : sesion.user,
  };

  guardarSesionPaco(refrescada);
  return refrescada;
}

async function obtenerSesionPacoActiva(forzarRefresco = false) {
  const sesion = leerSesionPaco();

  if (!sesion?.access_token) {
    throw crearErrorPaco('NO_SESSION', 401);
  }

  const ahora = Math.floor(Date.now() / 1000);
  const expiraPronto =
    Boolean(sesion.expires_at) && Number(sesion.expires_at) <= ahora + 60;

  if (!forzarRefresco && !expiraPronto) {
    return sesion;
  }

  if (!sesion.refresh_token) {
    if (forzarRefresco || expiraPronto) {
      throw crearErrorPaco('NO_SESSION', 401);
    }
    return sesion;
  }

  if (!refrescoSesionPacoEnCurso) {
    refrescoSesionPacoEnCurso = refrescarSesionPaco(sesion).finally(() => {
      refrescoSesionPacoEnCurso = null;
    });
  }

  return refrescoSesionPacoEnCurso;
}

async function hacerPeticionPaco(
  method: 'GET' | 'POST',
  accessToken: string,
  payload?: Record<string, unknown>,
  endpoint = PACO_ENDPOINT
) {
  const respuesta = await fetch(endpoint, {
    method,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: method === 'POST' ? JSON.stringify(payload || {}) : undefined,
  });

  const texto = await respuesta.text();
  let datos: any = null;

  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = null;
  }

  return { respuesta, datos };
}

async function llamarPaco<T>(
  method: 'GET' | 'POST',
  payload?: Record<string, unknown>
): Promise<T> {
  let sesion = await obtenerSesionPacoActiva(false);
  let resultado = await hacerPeticionPaco(
    method,
    String(sesion.access_token || ''),
    payload
  );

  if (resultado.respuesta.status === 401 && sesion.refresh_token) {
    sesion = await obtenerSesionPacoActiva(true);
    resultado = await hacerPeticionPaco(
      method,
      String(sesion.access_token || ''),
      payload
    );
  }

  if (!resultado.respuesta.ok) {
    const mensaje =
      resultado.datos?.error ||
      resultado.datos?.message ||
      (resultado.respuesta.status === 403
        ? 'FORBIDDEN'
        : 'No se pudo conectar con Paco.');

    throw crearErrorPaco(String(mensaje), resultado.respuesta.status);
  }

  return resultado.datos as T;
}

async function llamarEndpointPaco(
  endpoint: string,
  payload: Record<string, unknown>,
  mensajeError: string
): Promise<PacoResponse> {
  let sesion = await obtenerSesionPacoActiva(false);
  let resultado = await hacerPeticionPaco(
    'POST',
    String(sesion.access_token || ''),
    payload,
    endpoint
  );

  if (resultado.respuesta.status === 401 && sesion.refresh_token) {
    sesion = await obtenerSesionPacoActiva(true);
    resultado = await hacerPeticionPaco(
      'POST',
      String(sesion.access_token || ''),
      payload,
      endpoint
    );
  }

  if (!resultado.respuesta.ok) {
    const mensaje =
      resultado.datos?.error ||
      resultado.datos?.message ||
      mensajeError;
    throw crearErrorPaco(String(mensaje), resultado.respuesta.status);
  }

  return resultado.datos as PacoResponse;
}

async function llamarSecretariaPaco(
  payload: Record<string, unknown>
): Promise<PacoResponse> {
  return llamarEndpointPaco(
    PACO_SECRETARIA_ENDPOINT,
    payload,
    'No se pudo conectar con la Secretaría de Paco.'
  );
}

async function llamarStudentGuardPaco(
  message: string
): Promise<PacoResponse | null> {
  try {
    return await llamarEndpointPaco(
      PACO_STUDENT_GUARD_ENDPOINT,
      { message },
      'No se pudo comprobar el alumno.'
    );
  } catch (error) {
    console.warn('Paco student guard no disponible:', error);
    return null;
  }
}

export function tokenSesionPacoActual() {
  return String(leerSesionPaco()?.access_token || '');
}

export async function comprobarAccesoPaco() {
  return llamarPaco<PacoStatus>('GET');
}

export async function preguntarPaco(message: string) {
  const alumnoExacto = await llamarStudentGuardPaco(message);
  if (alumnoExacto?.handled === true) return alumnoExacto;

  const secretaria = await llamarSecretariaPaco({ message });
  if (secretaria?.handled === true) return secretaria;

  return llamarPaco<PacoResponse>('POST', { message });
}

export async function continuarPaco(continuation: PacoContinuation) {
  if (continuation.kind.startsWith('secretary_')) {
    const secretaria = await llamarSecretariaPaco({ continuation });
    if (secretaria?.handled === true) return secretaria;
  }
  return llamarPaco<PacoResponse>('POST', { continuation });
}
