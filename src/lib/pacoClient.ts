import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config/supabase';
import {
  continuarAccionPaco,
  intentarAccionPaco,
} from '../features/pacoAcciones/pacoAcciones';
import {
  ejecutarPropuestaAgente,
  ejecutarPropuestaGestion,
  esPropuestaAgente,
  esPropuestaGestion,
  type PropuestaAgente,
  type PropuestaGestion,
} from '../features/pacoAcciones/pacoAgenteAcciones';
import { pareceRecordatorioConHora } from '../features/pacoAcciones/pacoAgenteAccionesLogic';
import { esPropuestaNotaAgente, pareceNotaDeNino, type PropuestaNotaAgente } from '../features/pacoAcciones/pacoNotasLogic';
import { ejecutarPropuestaNota } from '../features/pacoAcciones/pacoNotasService';
const MITICO_AUTH_STORAGE_KEY = 'mitico_auth_session_v1';
const PACO_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-api`;
const PACO_SECRETARIA_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-secretaria`;
const PACO_STUDENT_GUARD_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-student-guard`;
const PACO_LIVE_TOKEN_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-live-token`;
const PACO_ALTAS_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-altas`;
const PACO_DISPONIBILIDAD_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-disponibilidad`;
const PACO_PADRES_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-padres`;
const PACO_ACCIONES_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-acciones`;
const PACO_AGENTE_ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-agente`;

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
        | 'alta_mark_sent'
        | 'alta_recordatorio';
      [clave: string]: unknown;
    }
  // Paco con «ojos»: boton que manda ese texto al agente (p. ej. elegir un niño).
  | {
      kind: 'agente_texto';
      texto: string;
    }
  // Paco con «manos»: cambio preparado por el agente; solo se hace al pulsar.
  | {
      kind: 'agente_accion';
      propuesta: PropuestaAgente;
    }
  // Memoria de Paco: nota preparada por el agente; solo se guarda al pulsar.
  | {
      kind: 'agente_nota';
      propuesta: PropuestaNotaAgente;
    }
  // Más manos (29/10): recordatorio con aviso o publicar grupos; solo al pulsar.
  | {
      kind: 'agente_gestion';
      propuesta: PropuestaGestion;
    }
  // Respuestas a familias: el borrador viaja dentro del boton, lo valida el servidor.
  | {
      kind: 'padre_pick' | 'padre_sin_datos' | 'padre_ajustar';
      [clave: string]: unknown;
    }
  // Acciones sobre la app (mover un niño de turno...): se resuelven en el
  // navegador con la sesion de Jose y siempre piden confirmacion antes de escribir.
  | {
      kind:
        | 'accion_preparar'
        | 'accion_mover_confirm'
        | 'accion_cancelar'
        | 'accion_disp_confirmar'
        | 'accion_disp_cancelar'
        | 'accion_aim_semana'
        | 'accion_aim_confirmar'
        | 'accion_aim_cancelar';
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
  // true: es un recordatorio a una familia que aún no ha respondido el test.
  recordatorio?: boolean;
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
  const texto = accion.recordatorio
    ? `Hola familia, os recordamos la pequeña valoración de ${nombrePila} para prepararle bien su grupo. ` +
      `Son 8 preguntas de respuesta cerrada y se tarda unos 2 minutos.\n\n${enlace}\n\n¡Muchas gracias!`
    : `Hola familia, para preparar correctamente el grupo de ${nombrePila} necesitamos una pequeña valoración de su experiencia esquiando.\n\n` +
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

// ---- Acciones sobre la app (listar pendientes, mover un niño de turno) ------
// La funcion mitico-paco-acciones SOLO interpreta la frase; buscar al niño,
// la tarjeta de confirmacion y la escritura ocurren aqui, con la sesion de Jose.
async function llamarAccionesPaco(message: string): Promise<PacoResponse | null> {
  try {
    const salida = await intentarAccionPaco(message, async (texto, contexto, extra) => {
      const cuerpo: Record<string, unknown> = { message: texto };
      if (contexto) cuerpo.contexto = contexto;
      if (contexto === 'auto' && extra?.propuesta_abierta) cuerpo.propuesta_abierta = extra.propuesta_abierta;
      const r = (await llamarEndpointPaco(
        PACO_ACCIONES_ENDPOINT,
        cuerpo,
        'No se pudo interpretar la petición.'
      )) as PacoResponse & { intent?: unknown; tema?: unknown; ajusta_propuesta?: unknown };
      // Modo «auto»: se devuelve todo (tema, si ajusta la tarjeta abierta e intención). Un servidor
      // antiguo no manda «tema»: se devuelve null y la app usa su respaldo por palabras.
      if (contexto === 'auto') {
        return r?.handled === true && typeof r.tema === 'string'
          ? { tema: r.tema, ajusta_propuesta: r.ajusta_propuesta, intent: r.intent }
          : null;
      }
      return r?.handled === true ? r.intent : null;
    });
    if (!salida) return null;
    return {
      ok: true,
      handled: true,
      answer: salida.answer,
      choices: (salida.choices || []) as PacoChoice[],
    };
  } catch (error) {
    const status = (error as Error & { status?: number })?.status;
    if (status === 401 || status === 403) throw error;
    console.warn('Paco acciones no disponible:', error);
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

// ---- Agente con «ojos» (funcion mitico-paco-agente, SOLO LECTURA) ----------
// Consulta por su cuenta los datos que necesite (niños, grupos, reportes,
// material, turnos...) y contesta. Recuerda los ultimos mensajes de la charla
// para entender «y el domingo?» o «el grupo que me dijiste».
const MAX_HISTORIAL_AGENTE = 8;
const VIGENCIA_HISTORIAL_AGENTE_MS = 30 * 60 * 1000;
let historialAgente: { rol: 'user' | 'assistant'; texto: string }[] = [];
let historialAgenteHasta = 0;
// Ids de lo consultado (niños, grupos recomendados) para «mételo en el que me dijiste».
let memoriaAgente = '';

// Lo que va a Secretaria (apuntar, tareas, notas...) sigue yendo alli.
function pareceOrdenSecretaria(message: string) {
  const n = message
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
  // Las notas sobre un niño o su familia van al agente (memoria de Paco).
  if (pareceNotaDeNino(message)) return false;
  // «Recuérdame/avísame … mañana / el viernes / a las 10» → recordatorio con
  // aviso al móvil, que prepara el agente (29/10).
  if (pareceRecordatorioConHora(message)) return false;
  return /\b(apunta|apuntame|anota|anotame|recuerdame|tarea|tareas|secretaria|notas?|marca como|resuelt[oa]|borra|elimina)\b/.test(n);
}


async function llamarAgentePaco(message: string): Promise<PacoResponse | null> {
  if (historialAgenteHasta < Date.now()) {
    historialAgente = [];
    memoriaAgente = '';
  }
  try {
    const r = await llamarEndpointPaco(
      PACO_AGENTE_ENDPOINT,
      { message, historial: historialAgente, memoria: memoriaAgente },
      'Paco no ha podido consultar los datos.'
    );
    if (r?.handled !== true || !String(r.answer || '').trim()) return null;
    const extra = r as PacoResponse & { memoria?: unknown; acciones?: unknown };
    if (typeof extra.memoria === 'string') memoriaAgente = extra.memoria.slice(0, 2500);
    const acciones = Array.isArray(extra.acciones) ? extra.acciones.filter(esPropuestaAgente) : [];
    const notasExtra = (r as PacoResponse & { notas?: unknown }).notas;
    const notas = Array.isArray(notasExtra) ? notasExtra.filter(esPropuestaNotaAgente) : [];
    const gestionesExtra = (r as PacoResponse & { gestiones?: unknown }).gestiones;
    const gestiones = Array.isArray(gestionesExtra) ? gestionesExtra.filter(esPropuestaGestion) : [];
    if (acciones.length || notas.length || gestiones.length) {
      r.choices = [
        ...acciones.map((propuesta) => ({
          label: `✅ Confirmar: ${propuesta.etiqueta}`,
          continuation: { kind: 'agente_accion' as const, propuesta },
        })),
        ...notas.map((propuesta) => ({
          label: `✅ Confirmar: ${propuesta.etiqueta}`,
          continuation: { kind: 'agente_nota' as const, propuesta },
        })),
        ...gestiones.map((propuesta) => ({
          label: `✅ Confirmar: ${propuesta.etiqueta}`,
          continuation: { kind: 'agente_gestion' as const, propuesta },
        })),
        { label: 'Cancelar', continuation: { kind: 'accion_cancelar' as const } },
      ];
    }
    const opciones = (r as PacoResponse & { opciones?: unknown }).opciones;
    if (Array.isArray(opciones) && opciones.length && !(r.choices && r.choices.length)) {
      r.choices = opciones
        .map((o) => String(o || '').trim())
        .filter(Boolean)
        .slice(0, 6)
        .map((o) => ({ label: o, continuation: { kind: 'agente_texto' as const, texto: o } }));
    }
    historialAgente = [
      ...historialAgente,
      { rol: 'user' as const, texto: message.slice(0, 1500) },
      { rol: 'assistant' as const, texto: String(r.answer).slice(0, 1500) },
    ].slice(-MAX_HISTORIAL_AGENTE);
    historialAgenteHasta = Date.now() + VIGENCIA_HISTORIAL_AGENTE_MS;
    return r;
  } catch (error) {
    const status = (error as Error & { status?: number })?.status;
    if (status === 401) throw error;
    console.warn('Paco agente no disponible:', error);
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

  // Recordatorio con fecha u hora: directo al agente, que lo prepara con aviso.
  if (pareceRecordatorioConHora(message)) {
    const recordatorio = await llamarAgentePaco(message);
    if (recordatorio) return recordatorio;
  }

  // Acciones sobre la app: «niños sin grupo», «pasa a Lucía al jueves»...
  // Siempre con tarjeta de confirmacion antes de escribir nada.
  const accion = await llamarAccionesPaco(message);
  if (accion) return accion;

  // Disponibilidad de entrenadores (solo lectura): quien ha respondido y quien no.
  if (parecePeticionDisponibilidad(message)) {
    const disponibilidad = await llamarDisponibilidadPaco({ message });
    if (disponibilidad?.handled === true) return disponibilidad;
  }

  // Paco con «ojos»: contesta consultando los datos reales. Si no esta
  // disponible (o es una orden para Secretaria), sigue el camino de siempre.
  if (!pareceOrdenSecretaria(message)) {
    const agente = await llamarAgentePaco(message);
    if (agente) return agente;
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
  if (continuation.kind.startsWith('accion_')) {
    try {
      const salida = await continuarAccionPaco(continuation);
      return {
        ok: true,
        handled: true,
        answer: salida.answer,
        choices: (salida.choices || []) as PacoChoice[],
      } as PacoResponse;
    } catch (error) {
      const status = (error as Error & { status?: number })?.status;
      if (status === 401 || status === 403) throw error;
      console.warn('Paco acciones: error al continuar.', error);
      return {
        ok: false,
        error: 'No he podido completar esa acción. No he cambiado nada; inténtelo de nuevo.',
      } as PacoResponse;
    }
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
  if (continuation.kind === 'agente_accion') {
    const propuesta = (continuation as { propuesta?: unknown }).propuesta;
    if (!esPropuestaAgente(propuesta)) {
      return { ok: false, error: 'Esa confirmación no es válida. No he cambiado nada.' } as PacoResponse;
    }
    try {
      const salida = await ejecutarPropuestaAgente(propuesta);
      historialAgente = [
        ...historialAgente,
        { rol: 'assistant' as const, texto: salida.answer.slice(0, 1500) },
      ].slice(-MAX_HISTORIAL_AGENTE);
      return { ok: true, handled: true, answer: salida.answer, choices: [] } as PacoResponse;
    } catch (error) {
      const status = (error as Error & { status?: number })?.status;
      if (status === 401 || status === 403) throw error;
      return {
        ok: false,
        error: 'No he podido hacerlo. No se ha cambiado nada; inténtelo de nuevo.',
      } as PacoResponse;
    }
  }
  if (continuation.kind === 'agente_nota') {
    const propuesta = (continuation as { propuesta?: unknown }).propuesta;
    if (!esPropuestaNotaAgente(propuesta)) {
      return { ok: false, error: 'Esa nota no es válida. No he guardado nada.' } as PacoResponse;
    }
    try {
      const salida = await ejecutarPropuestaNota(propuesta);
      historialAgente = [
        ...historialAgente,
        { rol: 'assistant' as const, texto: salida.answer.slice(0, 1500) },
      ].slice(-MAX_HISTORIAL_AGENTE);
      return { ok: true, handled: true, answer: salida.answer, choices: [] } as PacoResponse;
    } catch (error) {
      const status = (error as Error & { status?: number })?.status;
      if (status === 401 || status === 403) throw error;
      return {
        ok: false,
        error: `No he podido guardarla: ${error instanceof Error ? error.message.slice(0, 160) : 'error'}. No se ha guardado nada.`,
      } as PacoResponse;
    }
  }
  if (continuation.kind === 'agente_gestion') {
    const propuesta = (continuation as { propuesta?: unknown }).propuesta;
    if (!esPropuestaGestion(propuesta)) {
      return { ok: false, error: 'Esa confirmación no es válida. No he cambiado nada.' } as PacoResponse;
    }
    try {
      const salida = await ejecutarPropuestaGestion(propuesta);
      historialAgente = [
        ...historialAgente,
        { rol: 'assistant' as const, texto: salida.answer.slice(0, 1500) },
      ].slice(-MAX_HISTORIAL_AGENTE);
      return { ok: true, handled: true, answer: salida.answer, choices: [] } as PacoResponse;
    } catch (error) {
      const status = (error as Error & { status?: number })?.status;
      if (status === 401 || status === 403) throw error;
      return {
        ok: false,
        error: 'No he podido hacerlo. No se ha cambiado nada; inténtelo de nuevo.',
      } as PacoResponse;
    }
  }
  if (continuation.kind === 'agente_texto') {
    const texto = String((continuation as { texto?: unknown }).texto || '').slice(0, 300);
    const agente = texto ? await llamarAgentePaco(texto) : null;
    return (
      agente ||
      ({ ok: false, error: 'No he podido consultarlo ahora mismo. Inténtelo de nuevo.' } as PacoResponse)
    );
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
