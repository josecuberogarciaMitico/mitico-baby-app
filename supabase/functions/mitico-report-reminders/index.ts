import { createClient } from 'npm:@supabase/supabase-js@2.57.4'
// @ts-types="npm:@types/web-push@3.6.4"
import webpush from 'npm:web-push@3.6.7'

type SuscripcionPush = {
  id: string
  endpoint: string
  p256dh: string
  auth_key: string
}

type ReportePendiente = {
  entrenador_id: string | null
  entrenador: string | null
  fecha: string | null
  hora_fin: string | null
  grupo_id: string | null
  alumno_id: string | null
  estado_reporte: string | null
  estado_asistencia: string | null
}

type PerfilApp = {
  entrenador_id: string | null
  rol: string
  activo: boolean
}

const rolesCoordinacion = new Set([
  'coordinador_jefe',
  'sub_coordinador',
  'coordinador',
])

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-mitico-cron-secret',
    },
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

function partesMadrid() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date())
}

function valorParte(partes: Intl.DateTimeFormatPart[], tipo: string) {
  return partes.find((parte) => parte.type === tipo)?.value || '00'
}

function fechaHoraMadridComoMs() {
  const partes = partesMadrid()
  const local = `${valorParte(partes, 'year')}-${valorParte(partes, 'month')}-${valorParte(partes, 'day')}T${valorParte(partes, 'hour')}:${valorParte(partes, 'minute')}:${valorParte(partes, 'second')}Z`
  return Date.parse(local)
}

function claveHoraMadrid() {
  const partes = partesMadrid()
  return `${valorParte(partes, 'year')}-${valorParte(partes, 'month')}-${valorParte(partes, 'day')}T${valorParte(partes, 'hour')}`
}

function sesionTerminadaConMargen(fecha: string, horaFin: string, margenHoras = 24) {
  const sesionLocalMs = Date.parse(`${fecha}T${horaFin}Z`)
  if (!Number.isFinite(sesionLocalMs)) return false
  return fechaHoraMadridComoMs() >= sesionLocalMs + margenHoras * 60 * 60 * 1000
}

async function secretosIguales(a: string, b: string) {
  if (!a || !b) return false
  const encoder = new TextEncoder()
  const [hashA, hashB] = await Promise.all([
    crypto.subtle.digest('SHA-256', encoder.encode(a)),
    crypto.subtle.digest('SHA-256', encoder.encode(b)),
  ])
  const bytesA = new Uint8Array(hashA)
  const bytesB = new Uint8Array(hashB)
  let diferencia = bytesA.length ^ bytesB.length
  for (let indice = 0; indice < Math.max(bytesA.length, bytesB.length); indice += 1) {
    diferencia |= (bytesA[indice] || 0) ^ (bytesB[indice] || 0)
  }
  return diferencia === 0
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return json({ ok: true })
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

    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })

    const body = await req.json().catch(() => ({}))
    const mode = String(body?.mode || 'auto')
    if (mode !== 'auto' && mode !== 'manual') {
      return json({ error: 'Modo de ejecución no válido.' }, 400)
    }
    const authHeader = req.headers.get('Authorization') || ''
    let esCoordinacionManual = false

    if (mode === 'manual') {
      if (!authHeader.startsWith('Bearer ')) return json({ error: 'Debes iniciar sesión.' }, 401)

      const clienteUsuario = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false },
      })
      const token = authHeader.slice('Bearer '.length)
      const { data: authData, error: authError } = await clienteUsuario.auth.getUser(token)
      const user = authData.user
      if (authError || !user) return json({ error: 'Sesión no válida.' }, 401)

      const { data: perfilRaw, error: perfilError } = await admin
        .from('usuarios_app')
        .select('entrenador_id,rol,activo')
        .eq('auth_user_id', user.id)
        .eq('activo', true)
        .maybeSingle()
      if (perfilError) throw perfilError
      const perfil = perfilRaw as PerfilApp | null
      esCoordinacionManual = Boolean(perfil && rolesCoordinacion.has(perfil.rol))
      if (!esCoordinacionManual) return json({ error: 'No tienes permiso para enviar recordatorios.' }, 403)
    } else {
      const secretoRecibido = req.headers.get('x-mitico-cron-secret') || ''
      const { data: config, error: configError } = await admin
        .from('push_internal_config_app')
        .select('valor')
        .eq('clave', 'report_reminder_cron_secret')
        .maybeSingle()
      if (configError) throw configError
      const secretoEsperado = String(config?.valor || '')
      if (!(await secretosIguales(secretoRecibido, secretoEsperado))) {
        return json({ error: 'No autorizado.' }, 401)
      }
    }

    let consulta = admin
      .from('v_reportes_pendientes_entrenador_dos_entrenadores')
      .select('entrenador_id,entrenador,fecha,hora_fin,grupo_id,alumno_id,estado_reporte,estado_asistencia')
      .eq('estado_reporte', 'Falta reporte')
      .eq('estado_asistencia', 'Presente')

    if (mode === 'manual') {
      const entrenadorId = String(body?.entrenador_id || '')
      const semanaInicio = String(body?.semana_inicio || '')
      if (!entrenadorId) return json({ error: 'Falta entrenador_id.' }, 400)
      if (!/^\d{4}-\d{2}-\d{2}$/.test(semanaInicio)) return json({ error: 'semana_inicio no válida.' }, 400)
      consulta = consulta
        .eq('entrenador_id', entrenadorId)
        .gte('fecha', semanaInicio)
        .lte('fecha', sumarDias(semanaInicio, 6))
    }

    const { data: pendientesRaw, error: pendientesError } = await consulta
    if (pendientesError) throw pendientesError

    const pendientes = (pendientesRaw || []) as ReportePendiente[]
    const elegibles = mode === 'manual'
      ? pendientes.filter((item) => Boolean(item.entrenador_id && item.fecha && item.hora_fin))
      : pendientes.filter((item) => Boolean(
          item.entrenador_id &&
          item.fecha &&
          item.hora_fin &&
          sesionTerminadaConMargen(item.fecha, item.hora_fin, 24),
        ))

    const porEntrenador = new Map<string, ReportePendiente[]>()
    for (const item of elegibles) {
      const clave = mode === 'manual'
        ? String(item.entrenador_id)
        : `${item.entrenador_id}:${item.fecha}`
      const lista = porEntrenador.get(clave) || []
      lista.push(item)
      porEntrenador.set(clave, lista)
    }

    webpush.setVapidDetails(subject, publicKey, privateKey)

    let entrenadoresConPendientes = 0
    let enviados = 0
    let duplicados = 0
    let sinSuscripcion = 0
    let fallidos = 0

    for (const items of porEntrenador.values()) {
      const primero = items[0]
      const entrenadorId = String(primero.entrenador_id)
      const fechas = Array.from(new Set(items.map((item) => String(item.fecha || '')).filter(Boolean))).sort()
      const fecha = fechas[0] || ''
      const semanaInicio = mode === 'manual'
        ? String(body?.semana_inicio || inicioSemanaLunes(fecha))
        : inicioSemanaLunes(fecha)
      const grupos = new Set(items.map((item) => String(item.grupo_id || '')).filter(Boolean))
      const clavesReporte = new Set(items.map((item) => `${item.grupo_id || ''}:${item.alumno_id || ''}`))
      const total = clavesReporte.size || items.length
      const dedupeKey = mode === 'manual'
        ? `reports-manual:${semanaInicio}:${entrenadorId}:${claveHoraMadrid()}`
        : `reports-pending:${fecha}:${entrenadorId}`
      const cuerpo = fechas.length === 1
        ? `Te quedan ${total} ${total === 1 ? 'reporte' : 'reportes'} del ${formatoCorto(fechas[0])}. Entra para completarlos.`
        : `Te quedan ${total} reportes pendientes esta semana. Entra para completarlos.`
      entrenadoresConPendientes += 1

      const { data: reserva, error: reservaError } = await admin
        .from('push_notificaciones_log_app')
        .insert({
          tipo: 'REPORTES_PENDIENTES',
          semana_inicio: semanaInicio,
          entrenador_id: entrenadorId,
          dedupe_key: dedupeKey,
          titulo: 'Tienes reportes pendientes',
          cuerpo,
          estado: 'reservada',
          metadata: {
            fechas_entrenamiento: fechas,
            grupos: Array.from(grupos),
            total_reportes: total,
            margen_horas: mode === 'manual' ? 0 : 24,
            envio_manual: mode === 'manual',
          },
        })
        .select('id')
        .maybeSingle()

      if (reservaError) {
        if (reservaError.code === '23505') {
          duplicados += 1
          continue
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
        sinSuscripcion += 1
        await admin
          .from('push_notificaciones_log_app')
          .update({ estado: 'sin_suscripcion', updated_at: new Date().toISOString() })
          .eq('id', reserva.id)
        continue
      }

      const payload = JSON.stringify({
        title: 'Tienes reportes pendientes',
        body: cuerpo,
        icon: '/icon-192.png',
        badge: '/favicon-32.png',
        tag: dedupeKey,
        renotify: false,
        data: {
          url: '/?push=entrenador',
          tipo: 'REPORTES_PENDIENTES',
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
            { TTL: 60 * 60 * 24 },
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
      if (ok) enviados += 1
      else fallidos += 1

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
    }

    if (mode === 'manual' && elegibles.length === 0) {
      return json({ ok: true, sent: 0, no_pending: true, message: 'Este entrenador ya no tiene reportes pendientes en la semana seleccionada.' })
    }

    return json({
      ok: true,
      mode,
      elegibles: elegibles.length,
      entrenadores_con_pendientes: entrenadoresConPendientes,
      enviados,
      duplicados,
      sin_suscripcion: sinSuscripcion,
      fallidos,
      margen_horas: mode === 'manual' ? 0 : 24,
    })
  } catch (error: any) {
    console.error('mitico-report-reminders error', error)
    return json({ error: 'No se pudieron enviar los recordatorios.' }, 500)
  }
})
