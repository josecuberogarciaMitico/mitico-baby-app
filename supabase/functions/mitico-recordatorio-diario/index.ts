import { createClient } from 'npm:@supabase/supabase-js@2.57.4'
// @ts-types="npm:@types/web-push@3.6.4"
import webpush from 'npm:web-push@3.6.7'

// ---------------------------------------------------------------------------
// mitico-recordatorio-diario (17/11/2026, regla de notificaciones de Jose)
//
// UN solo aviso al día por entrenador, a las 10:00 (Madrid), que junta todo lo
// que tiene pendiente:
//   · reportes de ayer y de anteayer (aviso al día siguiente y a las 48 h);
//   · confirmar sus grupos de hoy (que aún no han empezado) y de mañana;
//   · la disponibilidad sin contestar si cierra hoy o mañana (si tiene reportes
//     pendientes, se le dice que primero los termine: la app se lo bloquea).
// Sustituye a los recordatorios sueltos (REPORTES_PENDIENTES automático,
// DISPONIBILIDAD_RECORDATORIO y CONFIRMAR_GRUPO_RECORDATORIO), que la regla
// de la base de datos (push_regla_entrenador_app) ya no deja salir.
// La regla también impide mandarlo fuera de 10:00–21:00 o si ese día ya ha
// recibido otro aviso.
//
// Entradas:
//   · cron (cabecera x-mitico-cron-secret): solo actúa a las 10 h de Madrid.
//   · body.dry_run = true: devuelve lo que mandaría, sin mandar nada.
//   · body.forzar = true: no mira la hora (la regla de la base de datos sigue).
// ---------------------------------------------------------------------------

type Suscripcion = { id: string; endpoint: string; p256dh: string; auth_key: string }
type Item = { tipo: 'reportes' | 'confirmar' | 'disponibilidad'; texto: string }

const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })

function madrid(d = new Date()) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(d)
  const v = (t: string) => p.find((x) => x.type === t)?.value || '00'
  return { fecha: `${v('year')}-${v('month')}-${v('day')}`, hora: `${v('hour')}:${v('minute')}`, h: Number(v('hour')) }
}
const sumarDias = (iso: string, n: number) => {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() + n)
  return d.toISOString().slice(0, 10)
}
const diaCorto = (iso: string) => `${DIAS[new Date(`${iso}T12:00:00Z`).getUTCDay()]} ${iso.slice(8, 10)}/${iso.slice(5, 7)}`
const lunesDe = (iso: string) => {
  const d = new Date(`${iso}T12:00:00Z`)
  d.setUTCDate(d.getUTCDate() - ((d.getUTCDay() + 6) % 7))
  return d.toISOString().slice(0, 10)
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'Método no permitido.' }, 405)
  try {
    const url = Deno.env.get('SUPABASE_URL') || ''
    const serviceRole = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    const admin = createClient(url, serviceRole, { auth: { persistSession: false, autoRefreshToken: false } })

    const secreto = req.headers.get('x-mitico-cron-secret') || ''
    const { data: cfg, error: cfgError } = await admin
      .from('push_internal_config_app').select('valor').eq('clave', 'report_reminder_cron_secret').maybeSingle()
    if (cfgError) throw cfgError
    if (!cfg?.valor || secreto !== String(cfg.valor)) return json({ error: 'No autorizado.' }, 401)

    const body = await req.json().catch(() => ({}))
    const dryRun = Boolean(body?.dry_run)
    const ahora = madrid()
    if (!body?.forzar && !dryRun && ahora.h !== 10) return json({ ok: true, fuera_de_hora: true, hora: ahora.hora })

    const hoy = ahora.fecha
    const ayer = sumarDias(hoy, -1)
    const anteayer = sumarDias(hoy, -2)
    const manana = sumarDias(hoy, 1)
    const items = new Map<string, Item[]>()
    const anadir = (id: string, item: Item) => items.set(id, [...(items.get(id) || []), item])

    // 1 · Reportes de ayer y anteayer (y saber quién tiene algo pendiente de antes de hoy).
    const { data: pend, error: e1 } = await admin
      .from('v_reportes_pendientes_entrenador_dos_entrenadores_raw_s2')
      .select('entrenador_id,fecha,grupo_id,alumno_id,estado_reporte')
      .in('estado_reporte', ['Falta reporte', 'Asistencia sin confirmar'])
      .lt('fecha', hoy)
      .gte('fecha', sumarDias(hoy, -28))
    if (e1) throw e1
    const bloqueados = new Map<string, number>()
    const porDia = new Map<string, Set<string>>()
    for (const f of pend || []) {
      const id = String((f as any).entrenador_id || '')
      if (!id) continue
      bloqueados.set(id, (bloqueados.get(id) || 0) + 1)
      const fecha = String((f as any).fecha).slice(0, 10)
      if (fecha !== ayer && fecha !== anteayer) continue
      const k = `${id}|${fecha}`
      const s = porDia.get(k) || new Set<string>()
      s.add(`${(f as any).grupo_id}:${(f as any).alumno_id}`)
      porDia.set(k, s)
    }
    for (const [k, s] of porDia) {
      const [id, fecha] = k.split('|')
      anadir(id, { tipo: 'reportes', texto: `${s.size} ${s.size === 1 ? 'reporte' : 'reportes'} del ${diaCorto(fecha)}` })
    }

    // 2 · Grupos publicados de hoy (sin empezar) y mañana sin confirmar.
    const { data: sesiones, error: e2 } = await admin.from('sesiones').select('id,fecha,hora_inicio').in('fecha', [hoy, manana])
    if (e2) throw e2
    const ses = new Map((sesiones || []).map((s: any) => [String(s.id), s]))
    if (ses.size) {
      const { data: grupos, error: e3 } = await admin.from('grupos').select('id,sesion_id')
        .in('sesion_id', [...ses.keys()]).eq('publicado', true).eq('cancelado', false)
      if (e3) throw e3
      const gm = new Map((grupos || []).map((g: any) => [String(g.id), g]))
      if (gm.size) {
        const ids = [...gm.keys()]
        const [{ data: a1, error: e4 }, { data: a2, error: e5 }] = await Promise.all([
          admin.from('asignaciones_entrenadores').select('grupo_id,entrenador_id,estado_confirmacion').in('grupo_id', ids),
          admin.from('grupo_entrenadores_extra_app').select('grupo_id,entrenador_id,estado_confirmacion').in('grupo_id', ids),
        ])
        if (e4) throw e4
        if (e5) throw e5
        const cuenta = new Map<string, { hoy: number; manana: number }>()
        for (const a of [...(a1 || []), ...(a2 || [])] as any[]) {
          if (!a.entrenador_id || String(a.estado_confirmacion || '').trim().toLowerCase() === 'confirmado') continue
          const s: any = ses.get(String(gm.get(String(a.grupo_id))?.sesion_id))
          if (!s) continue
          const esHoy = String(s.fecha).slice(0, 10) === hoy
          if (esHoy && String(s.hora_inicio || '23:59').slice(0, 5) <= ahora.hora) continue
          const c = cuenta.get(String(a.entrenador_id)) || { hoy: 0, manana: 0 }
          if (esHoy) c.hoy += 1
          else c.manana += 1
          cuenta.set(String(a.entrenador_id), c)
        }
        for (const [id, c] of cuenta) {
          const n = c.hoy + c.manana
          const cuando = c.hoy && c.manana ? 'de hoy y mañana' : c.hoy ? 'de hoy' : 'de mañana'
          anadir(id, { tipo: 'confirmar', texto: `confirmar ${n === 1 ? 'tu grupo' : `tus ${n} grupos`} ${cuando}` })
        }
      }
    }

    // 3 · Disponibilidad sin contestar que cierra hoy o mañana.
    const { data: semanas, error: e6 } = await admin.from('disponibilidad_semanas_editor')
      .select('id,fecha_limite_publicada').eq('estado', 'publicado').not('publicada_at', 'is', null)
      .gt('fecha_limite_publicada', new Date().toISOString())
    if (e6) throw e6
    for (const sem of semanas || []) {
      const limite = madrid(new Date(String((sem as any).fecha_limite_publicada)))
      if (limite.fecha !== hoy && limite.fecha !== manana) continue
      const { data: resp, error: e7 } = await admin.from('disponibilidad_respuestas_editor')
        .select('entrenador_id').eq('semana_id', (sem as any).id).eq('respuesta', 'Pendiente')
      if (e7) throw e7
      const faltan = new Set((resp || []).map((r: any) => String(r.entrenador_id || '')).filter(Boolean))
      const cierra = `cierra ${limite.fecha === hoy ? 'hoy' : 'mañana'} a las ${limite.hora}`
      for (const id of faltan) {
        const debe = bloqueados.get(id) || 0
        anadir(id, {
          tipo: 'disponibilidad',
          texto: debe
            ? `terminar tus reportes para poder enviar la disponibilidad (${cierra})`
            : `la disponibilidad sin contestar (${cierra})`,
        })
      }
    }

    // Solo entrenadores activos con acceso a la app.
    const { data: usuarios, error: e8 } = await admin.from('usuarios_app').select('entrenador_id')
      .eq('activo', true).not('entrenador_id', 'is', null)
    if (e8) throw e8
    const conAcceso = new Set((usuarios || []).map((u: any) => String(u.entrenador_id)))
    const orden: Record<Item['tipo'], number> = { reportes: 0, confirmar: 1, disponibilidad: 2 }
    const mensajes = [...items.entries()]
      .filter(([id]) => conAcceso.has(id))
      .map(([id, lista]) => {
        const textos = lista.sort((a, b) => orden[a.tipo] - orden[b.tipo]).map((i) => i.texto)
        const cuerpo = `Tienes pendiente: ${textos.join(' · ')}. Entra en Mítico Baby.`
        return { id, cuerpo, items: lista.map((i) => i.tipo) }
      })

    if (dryRun) return json({ ok: true, dry_run: true, hoy, hora: ahora.hora, mensajes })

    webpush.setVapidDetails(Deno.env.get('VAPID_SUBJECT') || '', Deno.env.get('VAPID_PUBLIC_KEY') || '', Deno.env.get('VAPID_PRIVATE_KEY') || '')
    const resumen = { enviados: 0, omitidos_por_regla: 0, sin_suscripcion: 0, fallidos: 0 }
    const titulo = 'Lo que tienes pendiente hoy'
    for (const m of mensajes) {
      const dedupeKey = `recordatorio-diario:${hoy}:${m.id}`
      const { data: reserva, error } = await admin.from('push_notificaciones_log_app').insert({
        tipo: 'RECORDATORIO_DIARIO', semana_inicio: lunesDe(hoy), entrenador_id: m.id, dedupe_key: dedupeKey,
        titulo, cuerpo: m.cuerpo, estado: 'reservada', metadata: { items: m.items, origen: 'recordatorio-diario' },
      }).select('id').maybeSingle()
      if (error) {
        // 23505: ya enviado hoy, o la regla de notificaciones no lo deja salir.
        if (error.code === '23505') { resumen.omitidos_por_regla += 1; continue }
        throw error
      }
      const { data: subs, error: se } = await admin.from('push_subscriptions_app')
        .select('id,endpoint,p256dh,auth_key').eq('entrenador_id', m.id).eq('activo', true)
      if (se) throw se
      const ahoraIso = () => new Date().toISOString()
      if (!subs?.length) {
        await admin.from('push_notificaciones_log_app').update({ estado: 'sin_suscripcion', updated_at: ahoraIso() }).eq('id', reserva.id)
        resumen.sin_suscripcion += 1
        continue
      }
      const payload = JSON.stringify({
        title: titulo, body: m.cuerpo, icon: '/icon-192.png', badge: '/favicon-32.png', tag: dedupeKey, renotify: false,
        data: { url: '/?push=entrenador', tipo: 'RECORDATORIO_DIARIO', semana_inicio: lunesDe(hoy) },
      })
      let ok = 0
      const errores: string[] = []
      for (const s of subs as Suscripcion[]) {
        try {
          await webpush.sendNotification({ endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth_key } }, payload, { TTL: 60 * 60 * 12 })
          ok += 1
        } catch (e: any) {
          errores.push(String(e?.message || e || 'Error Web Push'))
          const code = Number(e?.statusCode || 0)
          if (code === 404 || code === 410) {
            await admin.from('push_subscriptions_app').update({ activo: false, updated_at: ahoraIso() }).eq('id', s.id)
          }
        }
      }
      await admin.from('push_notificaciones_log_app').update({
        estado: ok ? 'enviada' : 'fallida', dispositivos_enviados: ok,
        error: errores.length ? errores.join(' | ').slice(0, 3000) : null,
        enviado_at: ok ? ahoraIso() : null, updated_at: ahoraIso(),
      }).eq('id', reserva.id)
      if (ok) resumen.enviados += 1
      else resumen.fallidos += 1
    }
    return json({ ok: true, hoy, mensajes: mensajes.length, ...resumen })
  } catch (error: any) {
    console.error('mitico-recordatorio-diario', error)
    return json({ error: String(error?.message || error || 'Error interno.') }, 500)
  }
})
