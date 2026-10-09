import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../config/supabase';
import { comprobarAccesoPaco, tokenSesionPacoActual } from './pacoClient';

// Avisos de Paco para Jose (resumen de disponibilidad del martes, etc.).
// Habla solo con la funcion mitico-paco-avisos. Tiene su propio registro de
// moviles: NO usa ni toca las notificaciones de los entrenadores.

const ENDPOINT = `${SUPABASE_URL}/functions/v1/mitico-paco-avisos`;

export type AvisoPaco = {
  id: string;
  tipo: string;
  titulo: string;
  cuerpo: string;
  created_at: string;
  semana_inicio: string | null;
};

export type EstadoAvisosPush =
  | 'activo' // este movil recibira los avisos
  | 'inactivo' // se puede activar
  | 'bloqueado' // el usuario denego el permiso en el navegador
  | 'no_soportado'; // navegador sin push (en iPhone: falta instalar la app)

async function llamar(payload: Record<string, unknown>) {
  await comprobarAccesoPaco();
  const token = tokenSesionPacoActual();
  if (!token) throw new Error('Tu sesión ha caducado. Vuelve a entrar.');

  const respuesta = await fetch(ENDPOINT, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const texto = await respuesta.text();
  let datos: any = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = null;
  }
  if (!respuesta.ok || datos?.ok === false) {
    throw new Error(String(datos?.error || 'Paco no ha podido responder ahora mismo.'));
  }
  return datos;
}

function soportaPush() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

function claveServidor(valor: string) {
  const relleno = '='.repeat((4 - (valor.length % 4)) % 4);
  const base64 = (valor + relleno).replace(/-/g, '+').replace(/_/g, '/');
  const datos = window.atob(base64);
  const salida = new Uint8Array(datos.length);
  for (let i = 0; i < datos.length; i += 1) salida[i] = datos.charCodeAt(i);
  return salida;
}

async function suscripcionLocal() {
  const registro = await navigator.serviceWorker.ready;
  return registro.pushManager.getSubscription();
}

export async function listarAvisosPaco(): Promise<AvisoPaco[]> {
  const datos = await llamar({ action: 'listar' });
  return Array.isArray(datos?.items) ? datos.items : [];
}

export async function marcarAvisosLeidos(ids: string[]) {
  if (ids.length === 0) return;
  await llamar({ action: 'leer', ids });
}

export async function estadoAvisosPush(): Promise<EstadoAvisosPush> {
  if (!soportaPush()) return 'no_soportado';
  if (Notification.permission === 'denied') return 'bloqueado';
  const local = await suscripcionLocal();
  if (!local) return 'inactivo';
  const datos = await llamar({ action: 'estado', endpoint: local.endpoint });
  return datos?.este_movil ? 'activo' : 'inactivo';
}

export async function activarAvisosPush(): Promise<EstadoAvisosPush> {
  if (!soportaPush()) return 'no_soportado';

  const config = await llamar({ action: 'config' });
  const clave = String(config?.vapid_public_key || '');
  if (!clave) throw new Error('Los avisos push no están configurados en el servidor.');

  let permiso = Notification.permission;
  if (permiso === 'default') permiso = await Notification.requestPermission();
  if (permiso !== 'granted') return permiso === 'denied' ? 'bloqueado' : 'inactivo';

  const registro = await navigator.serviceWorker.ready;
  let suscripcion = await registro.pushManager.getSubscription();
  if (!suscripcion) {
    suscripcion = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: claveServidor(clave),
    });
  }
  const json = suscripcion.toJSON();
  if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) {
    throw new Error('El navegador no ha devuelto una suscripción válida.');
  }
  await llamar({ action: 'subscribe', subscription: json, user_agent: navigator.userAgent });
  return 'activo';
}

export async function probarAvisoPush(): Promise<boolean> {
  const datos = await llamar({ action: 'probar' });
  return datos?.ok === true;
}
