import type { SesionAuthApp } from './authTypes';

export function tipoFlujoPassword(
  hashValue: string,
  searchValue: string
): 'invite' | 'recovery' {
  const hash = new URLSearchParams(hashValue.replace(/^#/, ''));
  const search = new URLSearchParams(searchValue.replace(/^\?/, ''));
  const tipo = (hash.get('type') || search.get('type') || '').toLowerCase();
  return tipo === 'recovery' ? 'recovery' : 'invite';
}

export function parseAuthSessionFromUrl(
  hashValue: string,
  searchValue: string,
  nowSeconds = Math.floor(Date.now() / 1000)
): SesionAuthApp | null {
  const hash = new URLSearchParams(hashValue.replace(/^#/, ''));
  const search = new URLSearchParams(searchValue.replace(/^\?/, ''));
  const accessToken = hash.get('access_token') || search.get('access_token');
  if (!accessToken) return null;
  const refreshToken = hash.get('refresh_token') || search.get('refresh_token') || undefined;
  const expiresIn = Number(hash.get('expires_in') || search.get('expires_in') || 0);
  return {
    access_token: accessToken,
    refresh_token: refreshToken,
    expires_at: expiresIn ? nowSeconds + expiresIn : undefined,
    user: { id: '', email: '' },
  };
}
