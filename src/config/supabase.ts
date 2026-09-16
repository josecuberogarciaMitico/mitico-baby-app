const PRODUCTION_SUPABASE_URL =
  'https://natxwawulodkoauqkwqz.supabase.co';
const PRODUCTION_SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_xeLKsuImDbVd9tnoBzSxXw_KAqod1bu';

function configuredValue(value: unknown, fallback: string): string {
  const configured = String(value || '').trim();
  return configured || fallback;
}

export const SUPABASE_URL = configuredValue(
  import.meta.env.VITE_SUPABASE_URL,
  PRODUCTION_SUPABASE_URL
);

export const SUPABASE_ANON_KEY = configuredValue(
  import.meta.env.VITE_SUPABASE_ANON_KEY,
  PRODUCTION_SUPABASE_PUBLISHABLE_KEY
);

if (/service[_-]?role/i.test(SUPABASE_ANON_KEY)) {
  throw new Error(
    'Configuración insegura: VITE_SUPABASE_ANON_KEY no puede contener una clave service_role.'
  );
}
