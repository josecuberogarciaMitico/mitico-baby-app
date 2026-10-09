import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config/supabase';
const MITICO_AUTH_STORAGE_KEY = 'mitico_auth_session_v1';
const PACO_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-api`;
const PACO_SECRETARIA_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-secretaria`;
const PACO_STUDENT_GUARD_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-student-guard`;
const PACO_LIVE_TOKEN_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-live-token`;
const PACO_ALTAS_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-altas`;
const PACO_DISPONIBILIDAD_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-disponibilidad`;
const PACO_PADRES_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-padres`;

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
    }
  // Altas de test: los datos de cada boton los rellena y valida el servidor.
  | {
      kind:
        | 'alta_create_confirm'
        | 'alta_cancel'
        | 'alta_dismiss'
        | 'alta_open'
        | 'alta_pick_level'
        | 'alta_validate_add'
        | 'alta_add'
        | 'alta_whatsapp'
        | 'alta_mark_sent';
      [clave: string]: unknown;
    }
  // Respuestas a familias: el borrador viaja dentro del boton, lo valida el servidor.
  | {
      kind: 'padre_pick' | 'padre_sin_datos' | 'padre_ajustar';
      [clave: string]: unknown;
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
  alta_draft?: unknown;
  alta_changed?: boolean;
  actions?: PacoAccion[];
  silent?: boolean;
  // Respuesta redactada para una familia (texto listo para copiar).
  respuesta_familia?: { texto: string };
  padre_draft?: unknown;
};

// Boton que abre WhatsApp con el mensaje del test ya escrito. Paco NO envia
// nada: el navegador abre WhatsApp y el usuario pulsa Enviar alli.
export type PacoAccion = {
  type: 'whatsapp';
  alta_id: string;
  nombre: string;
  telefono: string;
  token: string;
};

export type PacoAvisoAlta = {
  id: string;
  nombre: string;
  answer: string;
  choices: PacoChoice[];
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

// ---- Altas de test (funcion aislada mitico-paco-altas) ----------------------
// El borrador de un alta a medias (faltan datos) se guarda aqui unos minutos
// para que el usuario pueda ir completandolo en mensajes sucesivos, tambien
// por voz.
const VIGENCIA_BORRADOR_ALTA_MS = 15 * 60 * 1000;
let borradorAlta: { datos: unknown; hasta: number } | null = null;

function borradorAltaVigente() {
  if (borradorAlta && borradorAlta.hasta > Date.now()) return borradorAlta.datos;
  borradorAlta = null;
  return null;
}

function guardarBorradorAlta(respuesta: PacoResponse | null) {
  borradorAlta =
    respuesta?.alta_draft && typeof respuesta.alta_draft === 'object'
      ? {
          datos: respuesta.alta_draft,
          hasta: Date.now() + VIGENCIA_BORRADOR_ALTA_MS,
        }
      : null;
}

function parecePeticionAlta(message: string) {
  const n = message
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
  return /\baltas?\b|\btests?\b|nivel inicial/.test(n);
}

async function llamarAltasPaco(
  payload: Record<string, unknown>
): Promise<PacoResponse | null> {
  try {
    return await llamarEndpointPaco(
      PACO_ALTAS_ENDPOINT,
      payload,
      'No se pudo conectar con las altas de Paco.'
    );
  } catch (error) {
    const status = (error as Error & { status?: number })?.status;
    if (status === 401 || status === 403) throw error;
    console.warn('Paco altas no disponible:', error);
    return null;
  }
}

// Altas respondidas por las familias que esperan decision (para avisar).
// Mismo criterio que normalizeWhatsappPhone de la app: 9 digitos que empiezan
// por 6-9 son moviles de Espana (se antepone 34).
function telefonoWhatsapp(valor: string) {
  const digitos = String(valor || '').replace(/\D/g, '');
  if (digitos.length === 9 && /^[6789]/.test(digitos)) return `34${digitos}`;
  return digitos;
}

// Mismo texto y mismo enlace que el boton "Enviar por WhatsApp" de Altas / Test
// (App.tsx -> enviarAltaNivelWhatsapp). Si cambias alli el texto, cambialo aqui.
export function urlWhatsappTestNivel(accion: PacoAccion) {
  const telefono = telefonoWhatsapp(accion.telefono);
  if (!telefono || typeof window === 'undefined') return '';
  const enlace = `${window.location.origin}${window.location.pathname}?test_nivel=${accion.token}`;
  const nombrePila =
    accion.nombre.trim().split(/\\s+/)[0] || accion.nombre; // igual que App.tsx (usa /\\s+/)
  const texto =
    `Hola familia, para preparar correctamente el grupo de ${nombrePila} necesitamos una pequeña valoración de su experiencia esquiando.\n\n` +
    `No tenéis que conocer su nivel: son 8 preguntas de respuesta cerrada sobre lo que le habéis visto hacer y se tarda aproximadamente 2 minutos.\n\n` +
    `${enlace}\n\nMuchas gracias.`;
  return `https://wa.me/${telefono}?text=${encodeURIComponent(texto)}`;
}

export async function comprobarAltasRespondidasPaco(): Promise<PacoAvisoAlta[]> {
  const respuesta = (await llamarEndpointPaco(
    PACO_ALTAS_ENDPOINT,
    { check: 'respondidas' },
    'No se pudo comprobar las altas.'
  )) as unknown as { items?: PacoAvisoAlta[] };
  return Array.isArray(respuesta?.items) ? respuesta.items : [];
}

// ---- Respuestas a familias (funcion aislada mitico-paco-padres) -------------
// Jose pega el mensaje de un padre y Paco deja la respuesta lista para copiar.
// El borrador se recuerda unos minutos para poder decir "mas corta", "dile que...".
const VIGENCIA_BORRADOR_PADRE_MS = 20 * 60 * 1000;
let borradorPadre: { datos: unknown; hasta: number } | null = null;

function borradorPadreVigente() {
  if (borradorPadre && borradorPadre.hasta > Date.now()) return borradorPadre.datos;
  borradorPadre = null;
  return null;
}

function guardarBorradorPadre(respuesta: PacoResponse | null) {
  borradorPadre =
    respuesta?.padre_draft && typeof respuesta.padre_draft === 'object'
      ? { datos: respuesta.padre_draft, hasta: Date.now() + VIGENCIA_BORRADOR_PADRE_MS }
      : null;
}

// Filtro barato para no llamar al servidor con todo: "responde a este padre",
// "Padre: ...", o un mensaje largo con voz de familia ("mi hijo..."). El
// servidor vuelve a comprobarlo y, si no es una familia, deja pasar el mensaje.
function parecePeticionFamilia(message: string) {
  const n = message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  const cabecera = n.slice(0, 160);
  if (/^(padre|madre|papa|mama|familia|tutor)\b\s*[:\n]/.test(n)) return true;
  if (
    /\b(responde|contesta|respondele|contestale|responder|contestar|redacta|escribe|prepara|escribele)\b/.test(cabecera) &&
    /\b(padre|madre|papa|mama|familia|tutor|mensaje|whatsapp|correo|email)\b/.test(cabecera)
  ) {
    return true;
  }
  if (/\b(que le (contesto|respondo|digo)|como (le )?(contesto|respondo))\b/.test(cabecera)) return true;
  if (/\b(mensaje|whatsapp|correo|email) de (un |una |la |el )?(padre|madre|familia|papa|mama)\b/.test(cabecera)) return true;
  return (
    n.length >= 60 &&
    (/\bmi (hijo|hija|nino|nina|peque|pequeno|pequena|crio|cria)\b/.test(n) ||
      /\bnuestr[oa] (hijo|hija|nino|nina)\b/.test(n) ||
      /\bsoy (la |el )?(madre|padre|mama|papa) de\b/.test(n) ||
      /\bmis (hijos|hijas)\b/.test(n))
  );
}

// Ajustes sobre la ultima respuesta redactada ("mas corta", "dile que...").
function pareceAjusteFamilia(message: string) {
  const n = message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  if (n.length > 400) return false;
  return (
    /\b(mas|menos) (corto|corta|largo|larga|calido|calida|cercano|cercana|firme|formal|informal|directo|directa|amable|seco|seca|breve|simple|claro|clara|emojis?)\b/.test(n) ||
    /\b(cambia|anade|quita|elimina|pon|dile|diles|menciona|incluye|sin emojis?|con emojis?|tutea|tratalo de usted|repite|otra version|redactala|reescribe|mejorala|acortala|alargala)\b/.test(n)
  );
}

async function llamarPadresPaco(
  payload: Record<string, unknown>
): Promise<PacoResponse | null> {
  try {
    return await llamarEndpointPaco(
      PACO_PADRES_ENDPOINT,
      payload,
      'No se pudo preparar la respuesta para la familia.'
    );
  } catch (error) {
    const status = (error as Error & { status?: number })?.status;
    if (status === 401 || status === 403) throw error;
    console.warn('Paco padres no disponible:', error);
    return null;
  }
}

// ---- Disponibilidad de entrenadores (funcion aislada, SOLO LECTURA) ---------
// "Quien no ha respondido la disponibilidad": el servidor decide si el mensaje
// va con el, aqui solo se evita llamarle con frases que no tienen nada que ver.
function parecePeticionDisponibilidad(message: string) {
  const n = message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  return (
    /\bdisponibilidad(es)?\b/.test(n) ||
    (/\bentrenador(es)?\b/.test(n) && /respond|contest|falta/.test(n)) ||
    (/\bquien(es)?\b/.test(n) && /respond|contest|falta/.test(n))
  );
}

async function llamarDisponibilidadPaco(
  payload: Record<string, unknown>
): Promise<PacoResponse | null> {
  try {
    return await llamarEndpointPaco(
      PACO_DISPONIBILIDAD_ENDPOINT,
      payload,
      'No se pudo consultar la disponibilidad.'
    );
  } catch (error) {
    const status = (error as Error & { status?: number })?.status;
    if (status === 401 || status === 403) throw error;
    console.warn('Paco disponibilidad no disponible:', error);
    return null;
  }
}

export async function preguntarPaco(message: string) {
  // Respuesta a una familia: o es un mensaje de padre/madre (o "responde a
  // este padre"), o hay un borrador reciente y Jose pide ajustarlo.
  const borradorFamilia = borradorPadreVigente();
  if ((borradorFamilia && pareceAjusteFamilia(message)) || parecePeticionFamilia(message)) {
    const familia = await llamarPadresPaco({ message, padre_draft: borradorFamilia });
    if (familia?.handled === true) {
      guardarBorradorPadre(familia);
      return familia;
    }
  }

  // Altas de test: si el mensaje habla de altas/tests (o hay un alta a medias)
  // se atiende PRIMERO aqui, sola, para que Secretaria no la apunte como tarea.
  const borrador = borradorAltaVigente();
  if (borrador || parecePeticionAlta(message)) {
    const altas = await llamarAltasPaco({ message, alta_draft: borrador });
    if (altas?.handled === true) {
      guardarBorradorAlta(altas);
      return altas;
    }
    borradorAlta = null;
  }

  // Disponibilidad de entrenadores (solo lectura): quien ha respondido y quien no.
  if (parecePeticionDisponibilidad(message)) {
    const disponibilidad = await llamarDisponibilidadPaco({ message });
    if (disponibilidad?.handled === true) return disponibilidad;
  }

  // Las dos comprobaciones rapidas se lanzan a la vez (antes iban una detras
  // de otra). El orden de prioridad es el mismo: primero alumno exacto,
  // luego Secretaria, y si ninguna lo gestiona, el Paco de siempre.
  const [alumnoExacto, secretaria] = await Promise.all([
    llamarStudentGuardPaco(message),
    llamarSecretariaPaco({ message }),
  ]);
  if (alumnoExacto?.handled === true) return alumnoExacto;
  if (secretaria?.handled === true) return secretaria;

  return llamarPaco<PacoResponse>('POST', { message });
}

export async function continuarPaco(continuation: PacoContinuation) {
  if (continuation.kind.startsWith('alta_')) {
    const altas = await llamarAltasPaco({ continuation });
    if (altas?.handled === true) {
      guardarBorradorAlta(altas);
      return altas;
    }
    borradorAlta = null;
    return {
      ok: false,
      error: 'No he podido completar esa acción de altas. Inténtelo de nuevo.',
    } as PacoResponse;
  }
  if (continuation.kind.startsWith('padre_')) {
    const familia = await llamarPadresPaco({ continuation });
    if (familia?.handled === true) {
      guardarBorradorPadre(familia);
      return familia;
    }
    return {
      ok: false,
      error: 'No he podido preparar esa respuesta. Inténtelo de nuevo.',
    } as PacoResponse;
  }
  if (continuation.kind.startsWith('secretary_')) {
    const secretaria = await llamarSecretariaPaco({ continuation });
    if (secretaria?.handled === true) return secretaria;
  }
  return llamarPaco<PacoResponse>('POST', { continuation });
}

export type PacoLiveSetup = {
  ok: boolean;
  token?: string;
  model?: string;
  voice?: string;
  systemInstruction?: string;
  error?: string;
};

// Pide al servidor una clave TEMPORAL de un solo uso para hablar con Gemini
// en directo. La clave real de Gemini nunca sale de Supabase.
export async function pedirSesionVozPaco(): Promise<PacoLiveSetup> {
  const respuesta = await llamarEndpointPaco(
    PACO_LIVE_TOKEN_ENDPOINT,
    {},
    'No se pudo preparar la voz de Paco.'
  );
  return respuesta as unknown as PacoLiveSetup;
}
