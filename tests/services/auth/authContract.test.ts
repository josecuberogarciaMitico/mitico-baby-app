import {
  parseAuthSessionFromUrl,
  tipoFlujoPassword,
} from '../../../src/services/auth/authContract';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('detecta recovery en hash o query y mantiene invite por defecto', () => {
  equal(tipoFlujoPassword('#type=recovery', ''), 'recovery', 'hash recovery');
  equal(tipoFlujoPassword('', '?type=RECOVERY'), 'recovery', 'query recovery');
  equal(tipoFlujoPassword('#type=invite', ''), 'invite', 'invite explícito');
  equal(tipoFlujoPassword('', ''), 'invite', 'invite por defecto');
});

test('extrae sesión de hash con expiración absoluta reproducible', () => {
  const session = parseAuthSessionFromUrl(
    '#access_token=access-1&refresh_token=refresh-1&expires_in=3600',
    '',
    2_000
  );
  equal(session?.access_token, 'access-1', 'access token');
  equal(session?.refresh_token, 'refresh-1', 'refresh token');
  equal(session?.expires_at, 5_600, 'expires at');
  equal(session?.user.id, '', 'usuario pendiente de resolver');
});

test('acepta query como compatibilidad y no inventa datos ausentes', () => {
  const session = parseAuthSessionFromUrl('', '?access_token=access-2', 2_000);
  equal(session?.access_token, 'access-2', 'access token query');
  equal(session?.refresh_token, undefined, 'sin refresh');
  equal(session?.expires_at, undefined, 'sin expiración');
});

test('sin access token no existe sesión autenticada', () => {
  equal(parseAuthSessionFromUrl('#refresh_token=refresh-only', '', 2_000), null, 'sesión nula');
});
