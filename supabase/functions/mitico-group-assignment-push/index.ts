import { createClient } from 'npm:@supabase/supabase-js@2.57.4'
// @ts-types="npm:@types/web-push@3.6.4"
import webpush from 'npm:web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const rolesCoordinacion = new Set([
  'coordinador_jefe',
  'sub_coordinador',
  'coordinador',
])

type SuscripcionPush = {
  id: string
  endpoint: string
  p256dh: string
  auth_key: string
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function inicioSemanaLunes(fecha: string) {
  const d = new Date(`${fecha}T12:00:00Z`)
  const dia = d.getUTCDay()
  d.setUTCDate(d.getUTCDate() - ((dia + 6) % 7))
  return d.toISOString().slice(0, 10)
}

function formatoCorto(fecha: string) {
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405)

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const publicKey = Deno.env.get('VAPID_PUBLIC_KEY') || ''
    const privateKey = Deno.env.get('VAPID_PRIVATE_KEY') || ''
    const subject = Deno.env.get('VAPID_SUBJECT') || ''

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: 'Variables internas de Supabase no configuradas.' }, 500)
    }
    if (!publicKey || !privateKey || !subject) {
      return json({ error: 'VAPID no está configurado.' }, 500)
    }

    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) {
      return json({ error: 'Debes iniciar sesión.' }, 401)
    }

    const clienteUsuario = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const token = authHeader.slice('Bearer '.length)
    const { data: authData, error: authError } = await clienteUsuario.auth.getUser(token)
    const user = authData.user
    if (authError || !user) return json({ error: 'Sesión no válida.' }, 401)

    const { data: perfil, error: perfilError } = await admin
      .from('usuarios_app')
      .select('rol,activo')
      .eq('auth_user_id', user.id)
      .eq('activo', true)
      .maybeSingle()

    if (perfilError) throw perfilError
    if (!perfil || !rolesCoordinacion.has(String(perfil.rol || ''))) {
      return json({ error: 'No tienes permiso para notificar cambios de entrenador.' }, 403)
    }

    const body = await req.json().catch(() => ({}))
    const grupoId = String(body?.grupo_id || '')
    const entrenadorAnteriorId = String(body?.entrenador_anterior_id || '')
    if (!grupoId) return json({ error: 'Falta grupo_id.' }, 400)

    const { data: grupo, error: grupoError } = await admin
      .from('grupos')
      .select('id,nombre_grupo,publicado,sesion_id')
      .eq('id', grupoId)
      .maybeSingle()
    if (grupoError) throw grupoError
    if (!grupo) return json({ error: 'No existe el grupo.' }, 404)

    if (!grupo.publicado) {
      return json({ ok: true, skipped: true, reason: 'draft' })
    }

    const [{ data: sesion, error: sesionError }, { data: asignacion, error: asignacionError }] =
      await Promise.all([
        admin.from('sesiones').select('fecha').eq('id', grupo.sesion_id).maybeSingle(),
        admin
          .from('asignaciones_entrenadores')
          .select('entrenador_id')
          .eq('grupo_id', grupoId)
          .order('created_at', { ascending: true, nullsFirst: false })
          .limit(1)
          .maybeSingle(),
      ])

    if (sesionError) throw sesionError
    if (asignacionError) throw asignacionError
    const entrenadorNuevoId = String(asignacion?.entrenador_id || '')
    if (!sesion?.fecha || !entrenadorNuevoId) {
      return json({ error: 'El grupo publicado no tiene fecha o entrenador principal actual.' }, 409)
    }

    if (entrenadorAnteriorId && entrenadorAnteriorId === entrenadorNuevoId) {
      return json({ ok: true, skipped: true, reason: 'same_trainer' })
    }

    const semanaInicio = inicioSemanaLunes(String(sesion.fecha))
    const fechaTexto = formatoCorto(String(sesion.fecha))
    const nombreGrupo = String(grupo.nombre_grupo || 'Grupo')
    webpush.setVapidDetails(subject, publicKey, privateKey)

    async function enviar({
      entrenadorId,
      tipo,
      dedupeKey,
      titulo,
      cuerpo,
    }: {
      entrenadorId: string
      tipo: string
      dedupeKey: string
      titulo: string
      cuerpo: string
    }) {
      const { data: reserva, error: reservaError } = await admin
        .from('push_notificaciones_log_app')
        .insert({
          tipo,
          semana_inicio: semanaInicio,
          entrenador_id: entrenadorId,
          dedupe_key: dedupeKey,
          titulo,
          cuerpo,
          estado: 'reservada',
          metadata: { grupo_id: grupoId, fecha: sesion.fecha },
        })
        .select('id')
        .maybeSingle()

      if (reservaError) {
        if (reservaError.code === '23505') {
          return { sent: 0, duplicate: 1, without_subscription: 0, failed: 0 }
        }
        throw reservaError
      }

      const { data: suscripcionesRaw, error: suscripcionesError } = await admin
        .from('push_subscriptions_app')
        .select('id,endpoint,p256dh,auth_key')
        .eq('entrenador_id', entrenadorId)
        .eq('activo', true)
      if (suscripcionesError) throw suscripcionesError

      const suscripciones = (suscripcionesRaw || []) as SuscripcionPush[]
      if (suscripciones.length === 0) {
        await admin
          .from('push_notificaciones_log_app')
          .update({ estado: 'sin_suscripcion', updated_at: new Date().toISOString() })
          .eq('id', reserva.id)
        return { sent: 0, duplicate: 0, without_subscription: 1, failed: 0 }
      }

      const payload = JSON.stringify({
        title: titulo,
        body: cuerpo,
        icon: '/icon-192.png',
        badge: '/favicon-32.png',
        tag: dedupeKey,
        renotify: false,
        data: {
          url: '/?push=entrenador',
          tipo,
          semana_inicio: semanaInicio,
        },
      })

      let dispositivosEnviados = 0
      const errores: string[] = []

      for (const suscripcion of suscripciones) {
        try {
          await webpush.sendNotification(
            {
              endpoint: suscripcion.endpoint,
              keys: { p256dh: suscripcion.p256dh, auth: suscripcion.auth_key },
            },
            payload,
            { TTL: 60 * 60 * 12 },
          )
          dispositivosEnviados += 1
        } catch (error: any) {
          const statusCode = Number(error?.statusCode || 0)
          errores.push(String(error?.message || error || 'Error Web Push'))
          if (statusCode === 404 || statusCode === 410) {
            await admin
              .from('push_subscriptions_app')
              .update({ activo: false, updated_at: new Date().toISOString() })
              .eq('id', suscripcion.id)
          }
        }
      }

      const ok = dispositivosEnviados > 0
      await admin
        .from('push_notificaciones_log_app')
        .update({
          estado: ok ? 'enviada' : 'fallida',
          dispositivos_enviados: dispositivosEnviados,
          error: errores.length ? errores.join(' | ').slice(0, 3000) : null,
          enviado_at: ok ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reserva.id)

      return {
        sent: ok ? 1 : 0,
        duplicate: 0,
        without_subscription: 0,
        failed: ok ? 0 : 1,
      }
    }

    const resultadoNuevo = await enviar({
      entrenadorId: entrenadorNuevoId,
      tipo: 'GRUPO_REASIGNADO_NUEVO',
      dedupeKey: `group-reassigned-new:${grupoId}:${entrenadorAnteriorId || 'none'}:${entrenadorNuevoId}`,
      titulo: 'Tienes un grupo asignado',
      cuerpo: `${nombreGrupo} · ${fechaTexto}. Entra en Mítico Baby para revisar tu nueva asignación.`,
    })

    let resultadoAnterior = { sent: 0, duplicate: 0, without_subscription: 0, failed: 0 }
    if (entrenadorAnteriorId) {
      resultadoAnterior = await enviar({
        entrenadorId: entrenadorAnteriorId,
        tipo: 'GRUPO_REASIGNADO_RETIRADO',
        dedupeKey: `group-reassigned-old:${grupoId}:${entrenadorAnteriorId}:${entrenadorNuevoId}`,
        titulo: 'Tu asignación ha cambiado',
        cuerpo: `${nombreGrupo} · ${fechaTexto} ya no está asignado a ti. Entra en Mítico Baby para revisar tu semana.`,
      })
    }

    return json({
      ok: true,
      grupo_id: grupoId,
      entrenador_nuevo_id: entrenadorNuevoId,
      entrenador_anterior_id: entrenadorAnteriorId || null,
      nuevo: resultadoNuevo,
      anterior: resultadoAnterior,
    })
  } catch (error: any) {
    console.error('mitico-group-assignment-push error', error)
    return json({ error: 'No se pudo notificar el cambio de entrenador.' }, 500)
  }
})
