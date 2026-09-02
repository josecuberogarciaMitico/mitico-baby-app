export type MiticoPushContext = {
  supabaseUrl: string;
  anonKey: string;
  accessToken: string;
};

export type MiticoPushActionResult = {
  ok: boolean;
  sent?: number;
  skipped?: number;
  failed?: number;
  without_subscription?: number;
  duplicate?: number;
  already_closed?: boolean;
  message?: string;
  [key: string]: unknown;
};

export type EstadoSemanaEntrenadorPush = {
  ok: boolean;
  semana_inicio: string;
  disponibilidad_publicada: boolean;
  disponibilidad_pendientes: number;
  organizacion_cerrada: boolean;
  total_grupos_publicados: number;
  push_activo: boolean;
  push_dispositivos: number;
};

type PushSubscriptionJsonApp = {
  endpoint?: string;
  expirationTime?: number | null;
  keys?: {
    p256dh?: string;
    auth?: string;
  };
};

function normalizarBase64UrlApp(valor: string) {
  const relleno = '='.repeat((4 - (valor.length % 4)) % 4);
  return (valor + relleno).replace(/-/g, '+').replace(/_/g, '/');
}

function claveServidorPushApp(valor: string) {
  const base64 = normalizarBase64UrlApp(valor);
  const datos = window.atob(base64);
  const salida = new Uint8Array(datos.length);
  for (let i = 0; i < datos.length; i += 1) {
    salida[i] = datos.charCodeAt(i);
  }
  return salida;
}

export function navegadorSoportaPushMitico() {
  return (
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

export function permisoPushMitico(): NotificationPermission | 'unsupported' {
  if (!navegadorSoportaPushMitico()) return 'unsupported';
  return Notification.permission;
}

export async function llamarMiticoPush<T extends MiticoPushActionResult>(
  contexto: MiticoPushContext,
  action: string,
  payload: Record<string, unknown> = {}
): Promise<T> {
  const respuesta = await fetch(
    `${contexto.supabaseUrl}/functions/v1/mitico-push`,
    {
      method: 'POST',
      headers: {
        apikey: contexto.anonKey,
        Authorization: `Bearer ${contexto.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action, ...payload }),
    }
  );

  const texto = await respuesta.text();
  let datos: any = null;
  try {
    datos = texto ? JSON.parse(texto) : null;
  } catch {
    datos = texto;
  }

  if (!respuesta.ok) {
    const mensaje =
      typeof datos === 'string'
        ? datos
        : datos?.error || datos?.message || texto || 'Error en notificaciones push.';
    throw new Error(mensaje);
  }

  return datos as T;
}

export async function obtenerEstadoLocalPushMitico() {
  if (!navegadorSoportaPushMitico()) {
    return { soportado: false, permiso: 'unsupported' as const, suscrito: false };
  }

  const registro = await navigator.serviceWorker.ready;
  const suscripcion = await registro.pushManager.getSubscription();
  return {
    soportado: true,
    permiso: Notification.permission,
    suscrito: Boolean(suscripcion),
  };
}

export async function activarNotificacionesPushMitico(
  contexto: MiticoPushContext
): Promise<MiticoPushActionResult> {
  if (!navegadorSoportaPushMitico()) {
    throw new Error(
      'Este navegador no admite notificaciones push. En iPhone instala Mítico Baby en la pantalla de inicio y ábrela desde el icono.'
    );
  }

  const configuracion = await llamarMiticoPush<
    MiticoPushActionResult & { vapid_public_key?: string }
  >(contexto, 'config');

  const vapidPublicKey = String(configuracion.vapid_public_key || '');
  if (!vapidPublicKey) {
    throw new Error('Las notificaciones push todavía no están configuradas en el servidor.');
  }

  let permiso = Notification.permission;
  if (permiso === 'default') {
    permiso = await Notification.requestPermission();
  }

  if (permiso !== 'granted') {
    throw new Error(
      permiso === 'denied'
        ? 'Las notificaciones están bloqueadas en este dispositivo. Actívalas desde los ajustes del navegador o de la app.'
        : 'No se concedió permiso para las notificaciones.'
    );
  }

  const registro = await navigator.serviceWorker.ready;
  let suscripcion = await registro.pushManager.getSubscription();

  if (!suscripcion) {
    suscripcion = await registro.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: claveServidorPushApp(vapidPublicKey),
    });
  }

  const serializada = suscripcion.toJSON() as PushSubscriptionJsonApp;
  if (!serializada.endpoint || !serializada.keys?.p256dh || !serializada.keys?.auth) {
    throw new Error('El navegador no ha devuelto una suscripción push válida.');
  }

  return llamarMiticoPush(contexto, 'subscribe', {
    subscription: serializada,
    user_agent: navigator.userAgent,
  });
}

export async function desactivarNotificacionesPushMitico(
  contexto: MiticoPushContext
): Promise<MiticoPushActionResult> {
  if (!navegadorSoportaPushMitico()) {
    return { ok: true, message: 'Push no soportado en este navegador.' };
  }

  const registro = await navigator.serviceWorker.ready;
  const suscripcion = await registro.pushManager.getSubscription();

  if (!suscripcion) {
    return llamarMiticoPush(contexto, 'unsubscribe', {});
  }

  const endpoint = suscripcion.endpoint;
  await llamarMiticoPush(contexto, 'unsubscribe', { endpoint });
  await suscripcion.unsubscribe().catch(() => false);
  return { ok: true };
}
