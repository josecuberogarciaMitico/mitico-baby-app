import { SUPABASE_ANON_KEY, SUPABASE_URL } from '../../config/supabase';
import type { PerfilUsuarioApp, SesionAuthApp } from './authTypes';
import { parseAuthSessionFromUrl, tipoFlujoPassword } from './authContract';

export const MITICO_AUTH_STORAGE_KEY = 'mitico_auth_session_v1';

export function limpiarUrlAuthApp(): void {
  if (typeof window === 'undefined') return;
  const limpia = `${window.location.origin}${window.location.pathname}`;
  window.history.replaceState({}, document.title, limpia);
}

export function leerSesionGuardadaApp(): SesionAuthApp | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(MITICO_AUTH_STORAGE_KEY);
    return raw ? JSON.parse(raw) as SesionAuthApp : null;
  } catch {
    return null;
  }
}

export function guardarSesionAuthApp(sesion: SesionAuthApp): void {
  if (typeof window !== 'undefined') window.localStorage.setItem(MITICO_AUTH_STORAGE_KEY, JSON.stringify(sesion));
}

export function borrarSesionAuthApp(): void {
  if (typeof window !== 'undefined') window.localStorage.removeItem(MITICO_AUTH_STORAGE_KEY);
}

export function tipoFlujoPasswordDesdeUrlApp(): 'invite' | 'recovery' {
  return typeof window === 'undefined' ? 'invite' : tipoFlujoPassword(window.location.hash, window.location.search);
}

export function extraerSesionInvitacionDesdeUrlApp(): SesionAuthApp | null {
  return typeof window === 'undefined'
    ? null
    : parseAuthSessionFromUrl(window.location.hash, window.location.search);
}

async function authRequestApp<T>(ruta: string, opciones: RequestInit = {}): Promise<T> {
  const respuesta = await fetch(`${SUPABASE_URL}/auth/v1/${ruta}`, {
    ...opciones,
    headers: { apikey: SUPABASE_ANON_KEY, 'Content-Type': 'application/json', ...(opciones.headers || {}) },
  });
  const texto = await respuesta.text();
  let datos: unknown = null;
  try { datos = texto ? JSON.parse(texto) : null; } catch { datos = texto; }
  if (!respuesta.ok) {
    const record = datos && typeof datos === 'object' ? datos as Record<string, unknown> : null;
    const mensaje = typeof datos === 'string'
      ? datos
      : String(record?.msg || record?.message || texto || 'Error de autenticación');
    throw new Error(mensaje);
  }
  return datos as T;
}

type AuthResponse = {
  access_token: string;
  refresh_token?: string;
  expires_at?: number;
  user?: { id?: string; email?: string };
};

export async function iniciarSesionEmailPasswordApp(email: string, password: string): Promise<SesionAuthApp> {
  const datos = await authRequestApp<AuthResponse>('token?grant_type=password', {
    method: 'POST', body: JSON.stringify({ email, password }),
  });
  return {
    access_token: datos.access_token, refresh_token: datos.refresh_token, expires_at: datos.expires_at,
    user: { id: datos.user?.id || '', email: datos.user?.email || email },
  };
}

export async function refrescarSesionAuthApp(refreshToken: string): Promise<SesionAuthApp> {
  const datos = await authRequestApp<AuthResponse>('token?grant_type=refresh_token', {
    method: 'POST', body: JSON.stringify({ refresh_token: refreshToken }),
  });
  return {
    access_token: datos.access_token, refresh_token: datos.refresh_token || refreshToken, expires_at: datos.expires_at,
    user: { id: datos.user?.id || '', email: datos.user?.email || '' },
  };
}

let refrescoSesionEnCursoApp: Promise<SesionAuthApp> | null = null;

export async function obtenerSesionSupabaseActivaApp(): Promise<SesionAuthApp> {
  const sesion = leerSesionGuardadaApp();
  if (!sesion?.access_token) throw new Error('La sesión ha caducado. Sal y vuelve a entrar.');
  const vigente = !sesion.expires_at || Number(sesion.expires_at) > Math.floor(Date.now() / 1000) + 60;
  if (vigente) return sesion;
  if (!sesion.refresh_token) {
    borrarSesionAuthApp();
    throw new Error('La sesión ha caducado. Sal y vuelve a entrar.');
  }
  if (!refrescoSesionEnCursoApp) {
    refrescoSesionEnCursoApp = refrescarSesionAuthApp(sesion.refresh_token)
      .then((refrescada) => {
        const completa = { ...refrescada, user: refrescada.user?.id ? refrescada.user : sesion.user };
        guardarSesionAuthApp(completa);
        return completa;
      })
      .finally(() => { refrescoSesionEnCursoApp = null; });
  }
  return refrescoSesionEnCursoApp;
}

export async function obtenerAccessTokenSupabaseApp(): Promise<string> {
  return (await obtenerSesionSupabaseActivaApp()).access_token;
}

export async function obtenerUsuarioAuthApp(accessToken: string): Promise<{ id: string; email?: string }> {
  const datos = await authRequestApp<{ id?: string; email?: string; user?: { id?: string; email?: string } }>('user', {
    method: 'GET', headers: { Authorization: `Bearer ${accessToken}` },
  });
  return { id: datos.id || datos.user?.id || '', email: datos.email || datos.user?.email || '' };
}

export async function solicitarRecuperacionPasswordApp(email: string): Promise<void> {
  const redirectTo = typeof window !== 'undefined' ? `${window.location.origin}${window.location.pathname}` : '';
  await authRequestApp('recover', {
    method: 'POST',
    body: JSON.stringify({ email: email.trim().toLowerCase(), redirect_to: redirectTo || undefined }),
  });
}

export async function actualizarPasswordInvitacionApp(accessToken: string, password: string): Promise<void> {
  await authRequestApp('user', {
    method: 'PUT', headers: { Authorization: `Bearer ${accessToken}` }, body: JSON.stringify({ password }),
  });
}

export async function cargarPerfilUsuarioApp(accessToken: string, userId: string): Promise<PerfilUsuarioApp | null> {
  const respuesta = await fetch(
    `${SUPABASE_URL}/rest/v1/usuarios_app?select=id,auth_user_id,email,nombre,rol,entrenador_id,activo&auth_user_id=eq.${encodeURIComponent(userId)}&activo=eq.true&limit=1`,
    { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${accessToken}` } }
  );
  if (!respuesta.ok) throw new Error((await respuesta.text()) || 'No se pudo cargar el perfil del usuario.');
  const perfiles = await respuesta.json() as PerfilUsuarioApp[];
  return perfiles[0] || null;
}
