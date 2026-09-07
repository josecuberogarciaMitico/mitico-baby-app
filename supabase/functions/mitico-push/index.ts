import { createClient } from 'npm:@supabase/supabase-js@2.57.4'
// @ts-types="npm:@types/web-push@3.6.4"
import webpush from 'npm:web-push@3.6.7'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

type PerfilApp = {
  auth_user_id: string | null
  entrenador_id: string | null
  rol: string
  activo: boolean
  nombre: string
}

type SuscripcionPush = {
  id: string
  endpoint: string
  p256dh: string
  auth_key: string
}

type ResumenEnvio = {
  sent: number
  skipped: number
  failed: number
  without_subscription: number
  duplicate: number
}

const rolesCoordinacion = new Set([
  'coordinador_jefe',
  'sub_coordinador',
  'coordinador',
])

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

function sumarDias(fecha: string, dias: number) {
  const d = new Date(`${fecha}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + dias)
  return d.toISOString().slice(0, 10)
}

function inicioSemanaLunes(fecha: string) {
  const d = new Date(`${fecha}T12:00:00Z`)
  const dia = d.getUTCDay()
  const retroceso = (dia + 6) % 7
  d.setUTCDate(d.getUTCDate() - retroceso)
  return d.toISOString().slice(0, 10)
}

function formatoCorto(fecha: string) {
  const [anio, mes, dia] = fecha.split('-')
  return `${dia}/${mes}/${anio}`
}

function rangoSemana(fechaInicio: string) {
  const fin = sumarDias(fechaInicio, 6)
  return `${formatoCorto(fechaInicio)} – ${formatoCorto(fin)}`
}

function valoresVapid() {
  const publicKey = Deno.env.get('VAPID_PUBLIC_KEY') || ''
  const privateKey = Deno.env.get('VAPID_PRIVATE_KEY') || ''
  const subject = Deno.env.get('VAPID_SUBJECT') || ''

  if (!publicKey || !privateKey || !subject) {
    throw new Error('Faltan VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY o VAPID_SUBJECT en los secretos de la Edge Function.')
  }

  return { publicKey, privateKey, subject }
}

function datosNotificacion(
  tipo: string,
  semanaInicio: string,
  titulo: string,
  cuerpo: string,
  tag: string,
) {
  return JSON.stringify({
    title: titulo,
    body: cuerpo,
    icon: '/icon-192.png',
    badge: '/favicon-32.png',
    tag,
    renotify: false,
    data: {
      url: '/?push=entrenador',
      tipo,
      semana_inicio: semanaInicio,
    },
  })
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405)

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') || ''
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

    if (!supabaseUrl || !anonKey || !serviceRoleKey) {
      return json({ error: 'La Edge Function no tiene configuradas las variables de Supabase.' }, 500)
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

    const { data: perfilRaw, error: perfilError } = await admin
      .from('usuarios_app')
      .select('auth_user_id,entrenador_id,rol,activo,nombre')
      .eq('auth_user_id', user.id)
      .eq('activo', true)
      .maybeSingle()

    const perfil = perfilRaw as PerfilApp | null

    if (perfilError || !perfil) {
      return json({ error: 'No existe un perfil activo para este usuario.' }, 403)
    }

    const body = await req.json().catch(() => ({}))
    const action = String(body?.action || '')
    const esCoordinacion = rolesCoordinacion.has(perfil.rol)

    const obtenerSuscripcionesEntrenador = async (entrenadorId: string) => {
      const { data, error } = await admin
        .from('push_subscriptions_app')
        .select('id,endpoint,p256dh,auth_key')
        .eq('entrenador_id', entrenadorId)
        .eq('activo', true)
      if (error) throw error
      return (data || []) as SuscripcionPush[]
    }

    const obtenerEntrenadoresActivosConAcceso = async () => {
      const [{ data: panel, error: panelError }, { data: usuarios, error: usuariosError }] =
        await Promise.all([
          admin
            .from('v_panel_entrenadores')
            .select('entrenador_id,activo')
            .eq('activo', true)
            .not('entrenador_id', 'is', null),
          admin
            .from('usuarios_app')
            .select('entrenador_id')
            .eq('activo', true)
            .not('entrenador_id', 'is', null),
        ])

      if (panelError) throw panelError
      if (usuariosError) throw usuariosError

      const conAcceso = new Set(
        (usuarios || [])
          .map((item: any) => String(item.entrenador_id || ''))
          .filter(Boolean),
      )

      return Array.from(
        new Set(
          (panel || [])
            .map((item: any) => String(item.entrenador_id || ''))
            .filter((entrenadorId) => entrenadorId && conAcceso.has(entrenadorId)),
        ),
      )
    }

    const reservarYEnviar = async ({
      tipo,
      semanaInicio,
      entrenadorId,
      dedupeKey,
      titulo,
      cuerpo,
      metadata = {},
    }: {
      tipo: string
      semanaInicio: string
      entrenadorId: string
      dedupeKey: string
      titulo: string
      cuerpo: string
      metadata?: Record<string, unknown>
    }) => {
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
          metadata,
        })
        .select('id')
        .maybeSingle()

      if (reservaError) {
        if (reservaError.code === '23505') {
          return { sent: 0, skipped: 1, failed: 0, without_subscription: 0, duplicate: 1 }
        }
        throw reservaError
      }

      const suscripciones = await obtenerSuscripcionesEntrenador(entrenadorId)
      if (suscripciones.length === 0) {
        await admin
          .from('push_notificaciones_log_app')
          .update({ estado: 'sin_suscripcion', updated_at: new Date().toISOString() })
          .eq('id', reserva.id)
        return { sent: 0, skipped: 0, failed: 0, without_subscription: 1, duplicate: 0 }
      }

      const { publicKey, privateKey, subject } = valoresVapid()
      webpush.setVapidDetails(subject, publicKey, privateKey)
      const payload = datosNotificacion(tipo, semanaInicio, titulo, cuerpo, dedupeKey)

      let enviados = 0
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
          enviados += 1
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

      await admin
        .from('push_notificaciones_log_app')
        .update({
          estado: enviados > 0 ? 'enviada' : 'fallida',
          dispositivos_enviados: enviados,
          error: errores.length ? errores.join(' | ').slice(0, 3000) : null,
          enviado_at: enviados > 0 ? new Date().toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', reserva.id)

      return {
        sent: enviados > 0 ? 1 : 0,
        skipped: 0,
        failed: enviados > 0 ? 0 : 1,
        without_subscription: 0,
        duplicate: 0,
      }
    }

    const acumular = (destino: ResumenEnvio, parcial: Partial<ResumenEnvio>) => {
      destino.sent += Number(parcial.sent || 0)
      destino.skipped += Number(parcial.skipped || 0)
      destino.failed += Number(parcial.failed || 0)
      destino.without_subscription += Number(parcial.without_subscription || 0)
      destino.duplicate += Number(parcial.duplicate || 0)
    }

    if (action === 'config') {
      const publicKey = Deno.env.get('VAPID_PUBLIC_KEY') || ''
      return json({ ok: true, vapid_public_key: publicKey })
    }

    if (action === 'subscribe') {
      if (!perfil.entrenador_id) {
        return json({ error: 'Este usuario no está vinculado a una ficha de entrenador.' }, 400)
      }

      const subscription = body?.subscription || {}
      const endpoint = String(subscription?.endpoint || '')
      const p256dh = String(subscription?.keys?.p256dh || '')
      const authKey = String(subscription?.keys?.auth || '')

      if (!endpoint || !p256dh || !authKey) {
        return json({ error: 'La suscripción push recibida está incompleta.' }, 400)
      }

      const ahora = new Date().toISOString()
      const { error } = await admin.from('push_subscriptions_app').upsert(
        {
          auth_user_id: user.id,
          entrenador_id: perfil.entrenador_id,
          endpoint,
          p256dh,
          auth_key: authKey,
          user_agent: String(body?.user_agent || '').slice(0, 1000) || null,
          activo: true,
          last_seen_at: ahora,
          updated_at: ahora,
        },
        { onConflict: 'endpoint' },
      )

      if (error) throw error
      return json({ ok: true, message: 'Notificaciones activadas.' })
    }

    if (action === 'unsubscribe') {
      const endpoint = String(body?.endpoint || '')
      let consulta = admin
        .from('push_subscriptions_app')
        .update({ activo: false, updated_at: new Date().toISOString() })
        .eq('auth_user_id', user.id)

      if (endpoint) consulta = consulta.eq('endpoint', endpoint)
      const { error } = await consulta
      if (error) throw error
      return json({ ok: true })
    }

    if (action === 'availability_opened') {
      if (!esCoordinacion) return json({ error: 'No tienes permiso para avisar a los entrenadores.' }, 403)

      const semanaInicio = String(body?.semana_inicio || '')
      if (!/^\d{4}-\d{2}-\d{2}$/.test(semanaInicio)) {
        return json({ error: 'semana_inicio no válida.' }, 400)
      }

      const { data: semana, error: semanaError } = await admin
        .from('disponibilidad_semanas_editor')
        .select('id,semana_inicio,estado,version_publicada,publicada_at')
        .eq('semana_inicio', semanaInicio)
        .maybeSingle()

      if (semanaError) throw semanaError
      if (!semana || semana.estado !== 'publicado' || !semana.publicada_at) {
        return json({ error: 'La disponibilidad de esta semana todavía no está publicada.' }, 409)
      }

      const entrenadores = await obtenerEntrenadoresActivosConAcceso()
      const resumen: ResumenEnvio = { sent: 0, skipped: 0, failed: 0, without_subscription: 0, duplicate: 0 }
      const rango = rangoSemana(semanaInicio)

      for (const entrenadorId of entrenadores) {
        const parcial = await reservarYEnviar({
          tipo: 'DISPONIBILIDAD_ABIERTA',
          semanaInicio,
          entrenadorId,
          dedupeKey: `disp-open:${semanaInicio}:v${Number(semana.version_publicada || 0)}:${entrenadorId}`,
          titulo: 'Ya puedes enviar tu disponibilidad',
          cuerpo: `Semana ${rango}. Entra en Mítico Baby y marca cuándo puedes trabajar.`,
          metadata: { version_publicada: Number(semana.version_publicada || 0) },
        })
        acumular(resumen, parcial)
      }

      return json({ ok: true, ...resumen, entrenadores: entrenadores.length })
    }

    if (action === 'availability_response_updated') {
      const respuestaId = String(body?.respuesta_id || '')
      if (!respuestaId) return json({ error: 'Falta respuesta_id.' }, 400)

      const { data: respuesta, error: respuestaError } = await admin
        .from('disponibilidad_respuestas_editor')
        .select('id,semana_id,entrenador_id,respuesta')
        .eq('id', respuestaId)
        .maybeSingle()
      if (respuestaError) throw respuestaError
      if (!respuesta) return json({ error: 'No se encontró la respuesta.' }, 404)

      if (!esCoordinacion && respuesta.entrenador_id !== perfil.entrenador_id) {
        return json({ error: 'No puedes comprobar la disponibilidad de otro entrenador.' }, 403)
      }

      const { data: semana, error: semanaError } = await admin
        .from('disponibilidad_semanas_editor')
        .select('semana_inicio,version_publicada,estado,publicada_at')
        .eq('id', respuesta.semana_id)
        .maybeSingle()
      if (semanaError) throw semanaError
      if (!semana?.semana_inicio) return json({ ok: true, completed: false })

      const { count: pendientes, error: pendientesError } = await admin
        .from('disponibilidad_respuestas_editor')
        .select('id', { count: 'exact', head: true })
        .eq('semana_id', respuesta.semana_id)
        .eq('entrenador_id', respuesta.entrenador_id)
        .eq('respuesta', 'Pendiente')
      if (pendientesError) throw pendientesError

      if (Number(pendientes || 0) > 0) {
        return json({ ok: true, completed: false, pending: Number(pendientes || 0) })
      }

      const semanaInicio = String(semana.semana_inicio)
      const rango = rangoSemana(semanaInicio)
      const parcial = await reservarYEnviar({
        tipo: 'DISPONIBILIDAD_RECIBIDA',
        semanaInicio,
        entrenadorId: respuesta.entrenador_id,
        dedupeKey: `disp-received:${semanaInicio}:v${Number(semana.version_publicada || 0)}:${respuesta.entrenador_id}`,
        titulo: 'Disponibilidad recibida',
        cuerpo: `Semana ${rango}. Ya tenemos todas tus respuestas. Te avisaremos cuando aparezcan tus grupos.`,
        metadata: { version_publicada: Number(semana.version_publicada || 0) },
      })

      return json({ ok: true, completed: true, ...parcial })
    }

    if (action === 'group_published') {
      if (!esCoordinacion) return json({ error: 'No tienes permiso para notificar grupos.' }, 403)

      const grupoId = String(body?.grupo_id || '')
      if (!grupoId) return json({ error: 'Falta grupo_id.' }, 400)

      const { data: filas, error: gruposError } = await admin
        .from('v_grupos_entrenador_app_dos_entrenadores')
        .select('grupo_id,entrenador_id,fecha,publicado')
        .eq('grupo_id', grupoId)
        .eq('publicado', true)
      if (gruposError) throw gruposError

      const validas = (filas || []).filter((fila: any) => fila.entrenador_id && fila.fecha)
      if (validas.length === 0) {
        return json({ ok: true, sent: 0, message: 'El grupo no tiene entrenadores visibles o todavía no está publicado.' })
      }

      const semanaInicio = inicioSemanaLunes(String(validas[0].fecha))
      const rango = rangoSemana(semanaInicio)
      const entrenadores = Array.from(new Set(validas.map((fila: any) => String(fila.entrenador_id))))
      const resumen: ResumenEnvio = { sent: 0, skipped: 0, failed: 0, without_subscription: 0, duplicate: 0 }

      for (const entrenadorId of entrenadores) {
        const parcial = await reservarYEnviar({
          tipo: 'GRUPOS_DISPONIBLES',
          semanaInicio,
          entrenadorId,
          dedupeKey: `groups-available:${semanaInicio}:${entrenadorId}`,
          titulo: 'Hay grupos publicados para ti',
          cuerpo: `Ya tienes asignaciones publicadas para la semana ${rango}. Entra en Mítico Baby para revisarlas.`,
          metadata: { primer_grupo_notificado: grupoId },
        })
        acumular(resumen, parcial)
      }

      return json({ ok: true, ...resumen, entrenadores: entrenadores.length, semana_inicio: semanaInicio })
    }

    if (action === 'week_groups_closed') {
      if (!esCoordinacion) return json({ error: 'No tienes permiso para cerrar la organización semanal.' }, 403)

      const semanaInicio = String(body?.semana_inicio || '')
      if (!/^\d{4}-\d{2}-\d{2}$/.test(semanaInicio)) {
        return json({ error: 'semana_inicio no válida.' }, 400)
      }

      const { data: cierreActual, error: cierreActualError } = await admin
        .from('publicacion_grupos_semana_app')
        .select('semana_inicio,estado,cerrada_at')
        .eq('semana_inicio', semanaInicio)
        .maybeSingle()
      if (cierreActualError) throw cierreActualError

      if (cierreActual?.estado === 'cerrada') {
        return json({ ok: true, already_closed: true, sent: 0, message: 'Esta semana ya estaba cerrada.' })
      }

      const ahora = new Date().toISOString()
      const { error: cierreError } = await admin.from('publicacion_grupos_semana_app').upsert({
        semana_inicio: semanaInicio,
        estado: 'cerrada',
        cerrada_at: ahora,
        cerrada_por: user.id,
        updated_at: ahora,
      })
      if (cierreError) throw cierreError

      const fin = sumarDias(semanaInicio, 6)
      const { data: grupos, error: gruposError } = await admin
        .from('v_grupos_entrenador_app_dos_entrenadores')
        .select('grupo_id,entrenador_id,fecha,publicado')
        .eq('publicado', true)
        .gte('fecha', semanaInicio)
        .lte('fecha', fin)
      if (gruposError) throw gruposError

      const gruposPorEntrenador = new Map<string, Set<string>>()
      for (const grupo of grupos || []) {
        if (!grupo.entrenador_id || !grupo.grupo_id) continue
        const entrenadorId = String(grupo.entrenador_id)
        const conjunto = gruposPorEntrenador.get(entrenadorId) || new Set<string>()
        conjunto.add(String(grupo.grupo_id))
        gruposPorEntrenador.set(entrenadorId, conjunto)
      }

      const entrenadores = await obtenerEntrenadoresActivosConAcceso()
      const resumen: ResumenEnvio = { sent: 0, skipped: 0, failed: 0, without_subscription: 0, duplicate: 0 }
      const rango = rangoSemana(semanaInicio)

      for (const entrenadorId of entrenadores) {
        const totalGrupos = gruposPorEntrenador.get(entrenadorId)?.size || 0
        const tieneGrupos = totalGrupos > 0
        const parcial = await reservarYEnviar({
          tipo: tieneGrupos
            ? 'ORGANIZACION_SEMANAL_CERRADA_CON_GRUPOS'
            : 'ORGANIZACION_SEMANAL_CERRADA_SIN_GRUPOS',
          semanaInicio,
          entrenadorId,
          dedupeKey: `week-closed:${semanaInicio}:${entrenadorId}`,
          titulo: tieneGrupos ? 'Tus grupos de esta semana ya están preparados' : 'Organización semanal terminada',
          cuerpo: tieneGrupos
            ? `Semana ${rango}. Tienes ${totalGrupos} ${totalGrupos === 1 ? 'grupo asignado' : 'grupos asignados'}. Entra para revisarlos y confirmarlos.`
            : `Semana ${rango}. Esta semana no tienes grupos asignados. Gracias por tu disponibilidad; no necesitas estar pendiente.`,
          metadata: { total_grupos: totalGrupos },
        })
        acumular(resumen, parcial)
      }

      return json({ ok: true, ...resumen, entrenadores: entrenadores.length, semana_inicio: semanaInicio })
    }

    if (action === 'trainer_week_status') {
      if (!perfil.entrenador_id) {
        return json({ error: 'Este usuario no está vinculado a una ficha de entrenador.' }, 400)
      }

      const semanaInicio = String(body?.semana_inicio || '')
      if (!/^\d{4}-\d{2}-\d{2}$/.test(semanaInicio)) {
        return json({ error: 'semana_inicio no válida.' }, 400)
      }
      const fin = sumarDias(semanaInicio, 6)

      const [{ data: semana }, { data: cierre }, { data: grupos }, { count: pushDispositivos }] = await Promise.all([
        admin
          .from('disponibilidad_semanas_editor')
          .select('id,estado,publicada_at')
          .eq('semana_inicio', semanaInicio)
          .maybeSingle(),
        admin
          .from('publicacion_grupos_semana_app')
          .select('estado,cerrada_at')
          .eq('semana_inicio', semanaInicio)
          .maybeSingle(),
        admin
          .from('v_grupos_entrenador_app_dos_entrenadores')
          .select('grupo_id,fecha,publicado')
          .eq('entrenador_id', perfil.entrenador_id)
          .eq('publicado', true)
          .gte('fecha', semanaInicio)
          .lte('fecha', fin),
        admin
          .from('push_subscriptions_app')
          .select('id', { count: 'exact', head: true })
          .eq('auth_user_id', user.id)
          .eq('activo', true),
      ])

      const gruposUnicos = new Set((grupos || []).map((item: any) => String(item.grupo_id)))
      let pendientes = 0

      if (semana?.id && semana?.estado === 'publicado' && semana?.publicada_at) {
        const { count } = await admin
          .from('disponibilidad_respuestas_editor')
          .select('id', { count: 'exact', head: true })
          .eq('semana_id', semana.id)
          .eq('entrenador_id', perfil.entrenador_id)
          .eq('respuesta', 'Pendiente')
        pendientes = Number(count || 0)
      }

      return json({
        ok: true,
        semana_inicio: semanaInicio,
        disponibilidad_publicada: Boolean(semana?.estado === 'publicado' && semana?.publicada_at),
        disponibilidad_pendientes: pendientes,
        organizacion_cerrada: Boolean(cierre?.estado === 'cerrada'),
        total_grupos_publicados: gruposUnicos.size,
        push_activo: Number(pushDispositivos || 0) > 0,
        push_dispositivos: Number(pushDispositivos || 0),
      })
    }

    return json({ error: 'Acción push no reconocida.' }, 400)
  } catch (error: any) {
    console.error('mitico-push error', error)
    return json({ error: 'Error interno en notificaciones push.' }, 500)
  }
})
