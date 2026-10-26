import 'jsr:@supabase/functions-js/edge-runtime.d.ts';

// mitico-aimharder-baby-read — versión API PÚBLICA de AimHarder.
// ---------------------------------------------------------------------------
// Ya NO entra en AimHarder con usuario/contraseña ni lee pantallas internas.
// Lee la copia de reservas que Supabase mantiene al día con la API pública
// oficial (esquema privado aimharder_sync, funciones aimharder_semana_app y
// aimharder_asistentes_app, ejecutables solo con service_role).
// Mismo nombre, mismas acciones (boxes | week | attendees) y mismo formato de
// respuesta que la versión anterior: la app y el botón "pegar listado" no
// necesitan cambios.
//
// 26/10/2026 (v31): `safety` trae además `repaso` (cuántos niños de ese turno
// faltan por repasar y en cuántos minutos termina) y `reservadasAimHarder`
// (nº de reservas que dice el calendario de AimHarder, si lo trae). Campos
// nuevos y opcionales: una app antigua los ignora.

type Json = Record<string, unknown>;
type ClaseCache = {
  id: number; date: string; time: string; timeid: string; className: string;
  coachName: string | null; ocupation: number; limit: number; waitlist: number;
  modalidad: string | null; fueraPatronSemanal?: boolean; cancelled?: boolean;
};
type Asistente = {
  name: string; guest: boolean; bookingAt: string | null;
  phone: string | null; birthDate: string | null; clientId: string | null;
};

const SU = Deno.env.get('SUPABASE_URL') ?? '';
const AN = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
const SR = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
const BOX = Number(Deno.env.get('AIMHARDER_BOX_ID') ?? '142179') || 142179;
const MODALIDAD = 'BABY';

const N = (v: unknown) => String(v ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/\s+/g, ' ').trim();
const inicio = (t: unknown) => String(t ?? '').replace(/\s/g, '').split('-')[0];
function monday(d: string) { const p = new Date(`${d}T12:00:00Z`); const w = p.getUTCDay() || 7; p.setUTCDate(p.getUTCDate() - (w - 1)); return p.toISOString().slice(0, 10); }
const cors = (r: Request) => ({ 'Access-Control-Allow-Origin': r.headers.get('origin') || '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Access-Control-Allow-Methods': 'POST, OPTIONS', 'Vary': 'Origin' });
const J = (r: Request, b: unknown, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...cors(r), 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });

class AppError extends Error { constructor(public code: string, public status: number, msg: string) { super(msg); } }

async function auth(req: Request) {
  const t = (req.headers.get('authorization') ?? '').match(/^Bearer\s+(.+)$/i)?.[1] ?? '';
  if (!t) throw new AppError('UNAUTHORIZED', 401, 'Sesión de Mítico no válida.');
  const u = await fetch(`${SU}/auth/v1/user`, { headers: { apikey: AN, Authorization: `Bearer ${t}` } });
  if (!u.ok) throw new AppError('UNAUTHORIZED', 401, 'Sesión de Mítico no válida.');
  const id = String((await u.json())?.id ?? '');
  const p = await fetch(`${SU}/rest/v1/usuarios_app?select=rol,activo&auth_user_id=eq.${encodeURIComponent(id)}&limit=1`, { headers: { apikey: SR, Authorization: `Bearer ${SR}` } });
  const q = (await p.json())?.[0];
  if (!q?.activo || !['coordinador_jefe', 'sub_coordinador', 'coordinador'].includes(String(q?.rol ?? ''))) {
    throw new AppError('FORBIDDEN', 403, 'Solo coordinación puede consultar AimHarder.');
  }
}

async function rpc<T>(name: string, args: Json): Promise<T> {
  const r = await fetch(`${SU}/rest/v1/rpc/${name}`, {
    method: 'POST',
    headers: { apikey: SR, Authorization: `Bearer ${SR}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(args),
  });
  const txt = await r.text();
  if (!r.ok) throw new AppError('CACHE_ERROR', 500, `No se pudo leer la copia de AimHarder (${r.status}).`);
  return JSON.parse(txt) as T;
}

async function semana(fecha: string) {
  const ws = monday(fecha);
  const data = await rpc<{ classes: ClaseCache[]; diasPendientes: number; actualizadoAt: string | null }>('aimharder_semana_app', { p_lunes: ws });
  if (Number(data?.diasPendientes) > 0) {
    throw new AppError('AIMHARDER_CALENDAR_LOADING', 409, 'Estoy trayendo de AimHarder el calendario de esa semana. Vuelve a intentarlo en 1–2 minutos. No se ha modificado nada.');
  }
  const classes = (Array.isArray(data?.classes) ? data.classes : []).filter((c) => c.modalidad === MODALIDAD);
  return { ws, classes, actualizadoAt: data?.actualizadoAt ?? null };
}

const entero = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) ? Math.max(0, Math.round(v)) : null);

function repasoDe(v: unknown) {
  if (!v || typeof v !== 'object') return null;
  const r = v as Json;
  const revisar = entero(r.revisar);
  const pendientes = entero(r.pendientes);
  const etaMin = entero(r.etaMin);
  if (revisar === null || pendientes === null || etaMin === null) return null;
  return { revisar, pendientes, etaMin };
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(req) });
  if (req.method !== 'POST') return J(req, { error: 'Método no permitido.' }, 405);
  try {
    await auth(req);
    const body = await req.json().catch(() => ({}));
    const action = String(body?.action ?? 'week');

    if (action === 'boxes') {
      return J(req, { boxes: [{ boid: BOX, gym: 'Mítico Club', role: 'api-publica' }] });
    }
    if (body?.boxId != null && Number(body.boxId) !== BOX) {
      throw new AppError('AIMHARDER_BOX_NOT_ALLOWED', 403, 'Ese centro no pertenece a la cuenta.');
    }

    if (action === 'week') {
      const { ws, classes, actualizadoAt } = await semana(String(body?.weekStart ?? new Date().toISOString().slice(0, 10)).slice(0, 10));
      return J(req, { box: { boid: BOX, gym: 'Mítico Club' }, weekStart: ws, classes, source: 'aimharder-api-publica', calendarioActualizadoAt: actualizadoAt });
    }

    if (action === 'attendees') {
      const date = String(body?.date ?? '').slice(0, 10);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new AppError('AIMHARDER_CLASS_AMBIGUOUS', 409, 'No puedo identificar de forma inequívoca la clase Baby exacta de AimHarder.');
      let id = Number(body?.classId);
      let data = Number.isFinite(id) ? await rpc<Json>('aimharder_asistentes_app', { p_fecha: date, p_schedule_id: id }) : { error: 'CLASS_NOT_FOUND' };
      if (data?.error === 'CLASS_NOT_FOUND') {
        // Respaldo: localizar la clase por fecha + nombre + hora de inicio.
        const expectedName = N(body?.className ?? '');
        const expectedStart = inicio(body?.time ?? '');
        const { classes } = await semana(date);
        const cands = classes.filter((c) => c.date === date && (!expectedName || N(c.className) === expectedName) && (!expectedStart || inicio(c.time) === expectedStart));
        if (cands.length !== 1) throw new AppError('AIMHARDER_CLASS_AMBIGUOUS', 409, 'No puedo identificar de forma inequívoca la clase Baby exacta de AimHarder.');
        id = cands[0].id;
        data = await rpc<Json>('aimharder_asistentes_app', { p_fecha: date, p_schedule_id: id });
        if (data?.error) throw new AppError('AIMHARDER_CLASS_AMBIGUOUS', 409, 'No puedo identificar de forma inequívoca la clase Baby exacta de AimHarder.');
      }
      const booking = data.booking as ClaseCache;
      if (booking?.modalidad !== MODALIDAD) throw new AppError('AIMHARDER_MODALIDAD_MISMATCH', 409, `La clase resuelta es ${booking?.modalidad ?? '?'}, no Baby.`);
      if (booking?.cancelled) throw new AppError('AIMHARDER_CLASS_CANCELLED', 409, 'Esa clase está cancelada en AimHarder. No se ha modificado nada.');
      const attendees = (Array.isArray(data.attendees) ? data.attendees : []) as Asistente[];
      const cancelledNames = (Array.isArray(data.cancelledNames) ? data.cancelledNames : []) as string[];
      return J(req, {
        booking: { ...booking, ocupation: attendees.length },
        attendees,
        total: attendees.length,
        text: attendees.map((x) => x.name).join('\n'),
        safety: {
          sourceKey: 'aimharder-api-publica',
          sourceCount: attendees.length + cancelledNames.length,
          cancelledDetected: cancelledNames.length,
          cancelledNames,
          reportedPublic: attendees.length,
          reportedTarget: attendees.length,
          safeZero: attendees.length === 0 && cancelledNames.length > 0,
          reservasActualizadasAt: data.reservasActualizadasAt ?? null,
          clientesRepasadosAt: data.clientesRepasadosAt ?? null,
          reservadasAimHarder: entero(data.reservadasAimHarder),
          repaso: repasoDe(data.repaso),
        },
      });
    }

    return J(req, { error: 'Acción no reconocida.' }, 400);
  } catch (e) {
    if (e instanceof AppError) return J(req, { error: e.message, code: e.code }, e.status);
    console.error('mitico-aimharder-baby-read', e);
    return J(req, { error: 'No se pudo consultar AimHarder para Baby.', code: 'UNKNOWN' }, 500);
  }
});
