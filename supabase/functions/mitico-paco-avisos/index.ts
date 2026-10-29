import { createClient } from 'npm:@supabase/supabase-js@2.57.4'
// @ts-types="npm:@types/web-push@3.6.4"
import webpush from 'npm:web-push@3.6.7'

// ---------------------------------------------------------------------------
// mitico-paco-avisos
// Avisos de Paco para Jose (coordinador_jefe): resumen automatico de la
// disponibilidad de los martes a las 13:00 (Madrid) + push a su movil.
//
// - Sistema PROPIO: tablas paco_avisos y paco_dispositivos_push. No toca las
//   suscripciones ni los avisos de los entrenadores (mitico-push).
// - Solo LEE la disponibilidad (nunca escribe en ella ni usa el RPC que
//   rellena respuestas "Pendiente").
// - Dos formas de entrar: (1) cron de Supabase con cabecera secreta,
//   (2) Jose con su sesion (rol coordinador_jefe).
// - Con la cabecera secreta y action 'enviar_avisos_pendientes' manda por push
//   los avisos CAMBIO_TURNO_FAMILIA que la base de datos ha creado (28/10).
// - Con action 'tick' (cron cada 5 min) manda además los recordatorios de
//   Secretaría que ya tocan y, a las 08:30, el parte de la mañana (29/10).
// ---------------------------------------------------------------------------

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-mitico-cron-secret',
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json; charset=utf-8' },
  })
}

// ---------- Fechas (Madrid) -------------------------------------------------

const pad = (n: number) => String(n).padStart(2, '0')
const DIAS = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado']

export function madridParts(d = new Date()) {
  const p = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', hour12: false,
  }).formatToParts(d)
  const g = (t: string) => Number(p.find((x) => x.type === t)?.value || 0)
  const y = g('year'), m = g('month'), dd = g('day')
  return { y, m, d: dd, h: g('hour') % 24, mi: g('minute'), dow: new Date(Date.UTC(y, m - 1, dd)).getUTCDay() }
}

const isoDate = (t: number) => new Date(t).toISOString().slice(0, 10)

function mondayOf(y: number, m: number, d: number) {
  const t = Date.UTC(y, m - 1, d)
  const dow = new Date(t).getUTCDay() || 7
  return t - (dow - 1) * 86400000
}

function fmtDM(iso: string) {
  const [, m, d] = iso.slice(0, 10).split('-')
  return `${d}/${m}`
}

// "2026-10-13T13:00" (hora de Madrid) -> "martes 13/10 a las 13:00 ..."
export function limiteTexto(limite: string | null | undefined, now = madridParts()) {
  const m = String(limite || '').match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)
  if (!m) return ''
  const [y, mo, d, h, mi] = m.slice(1).map(Number)
  const dia = DIAS[new Date(Date.UTC(y, mo - 1, d)).getUTCDay()]
  const base = `${dia} ${pad(d)}/${pad(mo)} a las ${pad(h)}:${pad(mi)}`
  const diff = Math.round((Date.UTC(y, mo - 1, d, h, mi) - Date.UTC(now.y, now.m - 1, now.d, now.h, now.mi)) / 60000)
  if (diff > 0) {
    const horas = Math.floor(diff / 60)
    const mins = diff % 60
    const queda = horas >= 24 ? `${Math.floor(horas / 24)} d ${horas % 24} h` : horas > 0 ? (mins ? `${horas} h ${mins} min` : `${horas} h`) : `${mins} min`
    return `Límite: ${base} (quedan ${queda}).`
  }
  if (diff === 0) return `Límite: ${base} (es ahora).`
  const pasado = -diff
  const hace = pasado >= 1440 ? `${Math.floor(pasado / 1440)} d` : pasado >= 60 ? `${Math.floor(pasado / 60)} h` : `${pasado} min`
  return `Límite: ${base} (ya pasó, hace ${hace}).`
}

// timestamptz -> "YYYY-MM-DDTHH:MM" en hora de Madrid
export function aHoraMadrid(ts: string | null | undefined) {
  if (!ts) return ''
  const t = Date.parse(ts)
  if (!Number.isFinite(t)) return ''
  const p = madridParts(new Date(t))
  return `${p.y}-${pad(p.m)}-${pad(p.d)}T${pad(p.h)}:${pad(p.mi)}`
}

// ---------- Resumen de disponibilidad (texto) ------------------------------

export type Resumen = {
  semanaInicio: string
  titulo: string
  cuerpoCorto: string
  cuerpoLargo: string
  total: number
  completos: number
  faltan: number
}

type Entrenador = { id: string; nombre: string; pend: number; total: number; sinAviso: boolean }

export function construirResumen(
  semanaInicio: string,
  limite: string,
  entrenadores: Entrenador[],
  now = madridParts(),
): Resumen {
  const fin = isoDate(Date.parse(semanaInicio + 'T00:00:00Z') + 6 * 86400000)
  const cab = `Disponibilidad de la semana ${fmtDM(semanaInicio)} – ${fmtDM(fin)}, señor Cubero. ${limiteTexto(limite, now)}`.trim()
  const total = entrenadores.length
  if (!total) {
    return {
      semanaInicio, titulo: 'Disponibilidad: sin datos',
      cuerpoCorto: `Semana ${fmtDM(semanaInicio)} – ${fmtDM(fin)}. No hay turnos ni entrenadores para revisar.`,
      cuerpoLargo: `${cab}\n\nNo hay turnos ni respuestas registradas para esa semana.`,
      total: 0, completos: 0, faltan: 0,
    }
  }
  const completos = entrenadores.filter((e) => e.pend === 0).length
  const faltan = entrenadores
    .filter((e) => e.pend > 0)
    .sort((a, b) => b.pend - a.pend || a.nombre.localeCompare(b.nombre, 'es'))

  if (!faltan.length) {
    return {
      semanaInicio, titulo: 'Disponibilidad: han respondido todos',
      cuerpoCorto: `Semana ${fmtDM(semanaInicio)} – ${fmtDM(fin)}. Han respondido los ${total} entrenadores.`,
      cuerpoLargo: `${cab}\n\n✅ Han respondido todos: ${completos} de ${total} entrenadores.`,
      total, completos, faltan: 0,
    }
  }

  const lineas = faltan.slice(0, 30).map((e) => {
    const resp = e.total - e.pend
    const estado = resp === 0 ? `no ha respondido nada (0 de ${e.total} turnos)` : `le faltan ${e.pend} de ${e.total} turnos`
    return `• ${e.nombre} — ${estado}${e.sinAviso ? ' · sin avisos activados en el móvil' : ''}`
  })
  const extra = faltan.length > 30 ? `\n… y ${faltan.length - 30} más.` : ''
  const nota = faltan.some((e) => e.sinAviso)
    ? '\n\nLos marcados «sin avisos» no tienen activadas las notificaciones, así que el push no les llega: conviene avisarles por otro lado.'
    : ''
  const cuerpoLargo = `${cab}\n\nHan respondido todo: ${completos} de ${total}. Faltan ${faltan.length}:\n${lineas.join('\n')}${extra}${nota}`

  const nombres = faltan.slice(0, 4).map((e) => e.nombre.split(' ')[0]).join(', ')
  const mas = faltan.length > 4 ? ` y ${faltan.length - 4} más` : ''
  return {
    semanaInicio,
    titulo: `Disponibilidad: faltan ${faltan.length} de ${total}`,
    cuerpoCorto: `Semana ${fmtDM(semanaInicio)} – ${fmtDM(fin)}. Faltan: ${nombres}${mas}. Abre Paco para el detalle.`,
    cuerpoLargo,
    total, completos, faltan: faltan.length,
  }
}

// ---------- Lectura de datos (solo lectura, service_role) -------------------

async function leerTodo(consulta: (desde: number, hasta: number) => PromiseLike<{ data: any[] | null; error: any }>) {
  const salida: any[] = []
  for (let desde = 0; desde < 20000; desde += 1000) {
    const { data, error } = await consulta(desde, desde + 999)
    if (error) throw error
    salida.push(...(data || []))
    if (!data || data.length < 1000) break
  }
  return salida
}

async function calcularResumen(admin: any, ahora = madridParts()): Promise<Resumen | null> {
  const lun = mondayOf(ahora.y, ahora.m, ahora.d)
  const candidatas = [lun + 7 * 86400000, lun].map(isoDate) // siguiente y actual

  const { data: semanas, error: semErr } = await admin
    .from('disponibilidad_semanas_editor')
    .select('id,semana_inicio,publicada_at,fecha_limite_publicada')
    .in('semana_inicio', candidatas)
    .not('publicada_at', 'is', null)
  if (semErr) throw semErr

  const publicadas = candidatas
    .map((d) => (semanas || []).find((s: any) => String(s.semana_inicio).slice(0, 10) === d))
    .filter(Boolean) as any[]
  if (!publicadas.length) return null

  // Se prefiere la primera semana (siguiente, luego actual) cuyo limite aun no
  // pasó (con 3 h de margen); si ninguna, la primera publicada.
  const ahoraTxt = `${ahora.y}-${pad(ahora.m)}-${pad(ahora.d)}T${pad(ahora.h)}:${pad(ahora.mi)}`
  const vigente = publicadas.find((s) => {
    const lim = aHoraMadrid(s.fecha_limite_publicada)
    if (!lim) return false
    return Date.parse(lim + ':00Z') >= Date.parse(ahoraTxt + ':00Z') - 3 * 3600000
  })
  const sem = vigente || publicadas[0]
  const semanaInicio = String(sem.semana_inicio).slice(0, 10)

  const turnos = await leerTodo((a, b) =>
    admin.from('disponibilidad_turnos_editor').select('turno_clave').eq('semana_id', sem.id).eq('version_tipo', 'publicado').range(a, b))
  const claves = new Set(turnos.map((t: any) => String(t.turno_clave)))

  const { data: panel, error: panelErr } = await admin
    .from('v_panel_entrenadores_raw_s2')
    .select('entrenador_id,nombre_completo,activo')
    .eq('activo', true)
    .not('entrenador_id', 'is', null)
  if (panelErr) throw panelErr

  const respuestas = await leerTodo((a, b) =>
    admin.from('disponibilidad_respuestas_editor').select('entrenador_id,turno_clave,respuesta').eq('semana_id', sem.id).range(a, b))
  const contestadas = new Map<string, Set<string>>()
  for (const r of respuestas) {
    const clave = String(r.turno_clave)
    if (!claves.has(clave)) continue
    const resp = String(r.respuesta || '').trim().toLowerCase()
    if (!resp || resp === 'pendiente') continue
    const id = String(r.entrenador_id)
    const set = contestadas.get(id) || new Set<string>()
    set.add(clave)
    contestadas.set(id, set)
  }

  const { data: subs, error: subsErr } = await admin
    .from('push_subscriptions_app').select('entrenador_id').eq('activo', true)
  if (subsErr) throw subsErr
  const conAviso = new Set((subs || []).map((s: any) => String(s.entrenador_id)))

  const vistos = new Set<string>()
  const entrenadores: Entrenador[] = []
  for (const e of panel || []) {
    const id = String(e.entrenador_id)
    if (vistos.has(id)) continue
    vistos.add(id)
    if (!claves.size) continue
    const resp = contestadas.get(id)?.size || 0
    entrenadores.push({
      id,
      nombre: String(e.nombre_completo || 'Sin nombre'),
      total: claves.size,
      pend: claves.size - resp,
      sinAviso: !conAviso.has(id),
    })
  }

  return construirResumen(semanaInicio, aHoraMadrid(sem.fecha_limite_publicada), entrenadores, ahora)
}

// ---------- Push ------------------------------------------------------------

async function enviarPush(admin: any, titulo: string, cuerpo: string, tag: string, tipo: string, semana: string | null) {
  const publicKey = Deno.env.get('VAPID_PUBLIC_KEY') || ''
  const privateKey = Deno.env.get('VAPID_PRIVATE_KEY') || ''
  const subject = Deno.env.get('VAPID_SUBJECT') || ''
  if (!publicKey || !privateKey || !subject) throw new Error('VAPID no está configurado.')

  const { data: disp, error } = await admin
    .from('paco_dispositivos_push').select('id,endpoint,p256dh,auth_key').eq('activo', true)
  if (error) throw error
  const dispositivos = disp || []
  if (!dispositivos.length) return { estado: 'sin_dispositivo', enviados: 0, error: null as string | null }

  webpush.setVapidDetails(subject, publicKey, privateKey)
  const payload = JSON.stringify({
    title: titulo,
    body: cuerpo,
    icon: '/icon-192.png',
    badge: '/favicon-32.png',
    tag,
    renotify: false,
    data: { url: '/', tipo, semana_inicio: semana || '' },
  })

  let enviados = 0
  const errores: string[] = []
  for (const d of dispositivos) {
    try {
      await webpush.sendNotification(
        { endpoint: d.endpoint, keys: { p256dh: d.p256dh, auth: d.auth_key } },
        payload,
        { TTL: 60 * 60 * 24 },
      )
      enviados += 1
    } catch (e: any) {
      const code = Number(e?.statusCode || 0)
      errores.push(String(e?.message || e || 'Error Web Push'))
      if (code === 404 || code === 410) {
        await admin.from('paco_dispositivos_push').update({ activo: false, updated_at: new Date().toISOString() }).eq('id', d.id)
      }
    }
  }
  return {
    estado: enviados > 0 ? 'enviada' : 'fallida',
    enviados,
    error: errores.length ? errores.join(' | ').slice(0, 2000) : null,
  }
}

async function crearAvisoYEnviar(admin: any, resumen: Resumen | null, dedupeKey: string, _ahora = madridParts()) {
  const semana = resumen?.semanaInicio || null
  const titulo = resumen ? resumen.titulo : 'Disponibilidad: no hay semana publicada'
  const cuerpoCorto = resumen
    ? resumen.cuerpoCorto
    : 'Hoy tocaba el resumen del martes, pero no hay ninguna disponibilidad publicada para la próxima semana.'
  const cuerpoLargo = resumen
    ? resumen.cuerpoLargo
    : 'Señor Cubero, hoy tocaba el resumen de disponibilidad, pero no encuentro ninguna semana publicada (ni la próxima ni la actual), así que no hay respuestas que revisar.'

  const { data: aviso, error } = await admin
    .from('paco_avisos')
    .insert({ tipo: 'DISPONIBILIDAD_MARTES', titulo, cuerpo: cuerpoLargo, dedupe_key: dedupeKey, semana_inicio: semana })
    .select('id')
    .maybeSingle()
  if (error) {
    if (error.code === '23505') return { duplicado: true }
    throw error
  }

  const push = await enviarPush(admin, titulo, cuerpoCorto, dedupeKey, 'DISPONIBILIDAD_MARTES', semana)
  await admin
    .from('paco_avisos')
    .update({ push_estado: push.estado, push_dispositivos: push.enviados, error: push.error })
    .eq('id', aviso.id)
  return { duplicado: false, aviso_id: aviso.id, push_estado: push.estado, dispositivos: push.enviados }
}

// Avisos creados desde la base de datos (p. ej. una familia confirma el cambio
// de turno desde su enlace) que aún no se han mandado por push.
async function enviarAvisosPendientes(admin: any) {
  const desde = new Date(Date.now() - 86400000).toISOString()
  const { data: pendientes, error: pe } = await admin
    .from('paco_avisos').select('id,tipo,titulo,cuerpo,dedupe_key,semana_inicio')
    .is('push_estado', null).eq('tipo', 'CAMBIO_TURNO_FAMILIA').gte('created_at', desde)
    .order('created_at', { ascending: true }).limit(20)
  if (pe) throw pe
  const resultados: unknown[] = []
  for (const a of pendientes || []) {
    const push = await enviarPush(admin, a.titulo, a.cuerpo, a.dedupe_key || `aviso:${a.id}`, a.tipo, a.semana_inicio)
    await admin.from('paco_avisos')
      .update({ push_estado: push.estado, push_dispositivos: push.enviados, error: push.error })
      .eq('id', a.id)
    resultados.push({ id: a.id, push_estado: push.estado })
  }
  return resultados
}

// Recordatorios de Secretaría (29/10): tareas con «Avisarme el … a las …» cuya
// hora ya ha llegado (como mucho 1 día de retraso), no resueltas y sin avisar.
// Cada tarea se «reserva» antes de enviar para no avisar dos veces.
async function enviarRecordatoriosSecretaria(admin: any) {
  const ahora = new Date()
  const desde = new Date(ahora.getTime() - 86400000).toISOString()
  const { data: tareas, error } = await admin
    .from('secretaria_coordinacion').select('id,titulo,detalle,recordar_at')
    .lte('recordar_at', ahora.toISOString()).gte('recordar_at', desde)
    .is('recordatorio_enviado_at', null).neq('estado', 'resuelto')
    .order('recordar_at', { ascending: true }).limit(20)
  if (error) throw error
  const resultados: unknown[] = []
  for (const t of tareas || []) {
    const { data: reservada, error: re } = await admin
      .from('secretaria_coordinacion').update({ recordatorio_enviado_at: ahora.toISOString() })
      .eq('id', t.id).is('recordatorio_enviado_at', null).select('id').maybeSingle()
    if (re) throw re
    if (!reservada) continue
    const titulo = `⏰ ${String(t.titulo || 'Recordatorio').slice(0, 120)}`
    const cuerpo = String(t.detalle || '').trim().slice(0, 400) || 'Recordatorio de Secretaría.'
    const dedupe = `secretaria:${t.id}:${t.recordar_at}`
    const { data: aviso, error: ae } = await admin
      .from('paco_avisos')
      .insert({ tipo: 'RECORDATORIO_SECRETARIA', titulo, cuerpo, dedupe_key: dedupe })
      .select('id').maybeSingle()
    if (ae && ae.code !== '23505') throw ae
    const push = await enviarPush(admin, titulo, cuerpo, dedupe, 'RECORDATORIO_SECRETARIA', null)
    if (aviso?.id) {
      await admin.from('paco_avisos')
        .update({ push_estado: push.estado, push_dispositivos: push.enviados, error: push.error })
        .eq('id', aviso.id)
    }
    resultados.push({ id: t.id, push_estado: push.estado })
  }
  return resultados
}

// Parte de la mañana (29/10): a las 08:30 de Madrid, lo que falta hoy y los
// dos días siguientes (grupos sin publicar, sin entrenador, sin confirmar,
// niños sin colocar), reportes atrasados y tareas de Secretaría que vencen.
// Si no hay nada que contar, no se manda.
export function textoParteManana(input: {
  dias: { etiqueta: string; turnos: number; sinPublicar: number; sinEntrenador: number; sinConfirmar: number; sinColocar: number }[];
  reportes: { total: number; porEntrenador: string[] };
  tareas: string[];
}) {
  const lineas: string[] = [];
  const cortas: string[] = [];
  for (const d of input.dias) {
    if (!d.turnos) continue;
    const faltas: string[] = [];
    if (d.sinColocar) faltas.push(`${d.sinColocar} niño${d.sinColocar === 1 ? '' : 's'} sin colocar`);
    if (d.sinEntrenador) faltas.push(`${d.sinEntrenador} grupo${d.sinEntrenador === 1 ? '' : 's'} sin entrenador`);
    if (d.sinPublicar) faltas.push(`${d.sinPublicar} sin publicar`);
    if (d.sinConfirmar) faltas.push(`${d.sinConfirmar} sin confirmar por el entrenador`);
    lineas.push(`• ${d.etiqueta} (${d.turnos} turno${d.turnos === 1 ? '' : 's'}): ${faltas.length ? faltas.join(', ') : 'todo listo ✅'}`);
    if (faltas.length) cortas.push(`${d.etiqueta.split(' ')[0]}: ${faltas[0]}`);
  }
  if (input.reportes.total) {
    lineas.push(`• Reportes atrasados: ${input.reportes.total} (${input.reportes.porEntrenador.slice(0, 6).join(', ')})`);
    cortas.push(`${input.reportes.total} reportes atrasados`);
  }
  if (input.tareas.length) {
    lineas.push(`• Secretaría para hoy: ${input.tareas.slice(0, 6).join('; ')}`);
    cortas.push(`${input.tareas.length} tarea${input.tareas.length === 1 ? '' : 's'} de Secretaría`);
  }
  const hayAlgo = cortas.length > 0;
  if (!lineas.length) return null;
  return {
    titulo: hayAlgo ? 'Parte de la mañana: hay cosas pendientes' : 'Parte de la mañana: todo listo',
    cuerpoCorto: hayAlgo ? cortas.slice(0, 4).join(' · ') : 'Los próximos días están listos.',
    cuerpoLargo: `Buenos días, señor Cubero. Esto es lo que hay:\n\n${lineas.join('\n')}`,
  };
}

async function parteManana(admin: any, ahora = madridParts()) {
  const hoy = `${ahora.y}-${pad(ahora.m)}-${pad(ahora.d)}`
  const diasIso = [0, 1, 2].map((n) => isoDate(Date.parse(hoy + 'T12:00:00Z') + n * 86400000))
  const [sesiones, tareas] = await Promise.all([
    leerTodo((a, b) => admin.from('v_agenda_sesiones_operativa_app')
      .select('sesion_id,fecha,alumnos_sin_grupo').gte('fecha', diasIso[0]).lte('fecha', diasIso[2]).range(a, b)),
    admin.from('secretaria_coordinacion').select('titulo').eq('tipo', 'tarea').in('estado', ['pendiente', 'en_curso'])
      .lte('fecha_limite', hoy).limit(20),
  ])
  if (tareas.error) throw tareas.error
  const ids = sesiones.map((x: any) => String(x.sesion_id))
  const grupos = ids.length
    ? await leerTodo((a, b) => admin.from('v_grupos_sesion_operativa_app')
        .select('sesion_id,publicado,entrenador_id,estado_confirmacion').in('sesion_id', ids).range(a, b))
    : []
  const rep = await leerTodo((a, b) => admin.from('v_reportes_pendientes_entrenador_dos_entrenadores')
    .select('entrenador').gte('fecha', isoDate(Date.parse(hoy + 'T12:00:00Z') - 3 * 86400000)).lt('fecha', hoy).range(a, b))
  const porEnt = new Map<string, number>()
  for (const r of rep) porEnt.set(String(r.entrenador || '?'), (porEnt.get(String(r.entrenador || '?')) || 0) + 1)
  const etiquetaDia = (iso: string, i: number) => `${i === 0 ? 'Hoy' : i === 1 ? 'Mañana' : DIAS[new Date(iso + 'T12:00:00Z').getUTCDay()].replace(/^./, (c) => c.toUpperCase())} ${fmtDM(iso)}`
  const dias = diasIso.map((iso, i) => {
    const ses = sesiones.filter((x: any) => String(x.fecha).slice(0, 10) === iso)
    const sesSet = new Set(ses.map((x: any) => String(x.sesion_id)))
    const gs = grupos.filter((g: any) => sesSet.has(String(g.sesion_id)))
    return {
      etiqueta: etiquetaDia(iso, i),
      turnos: ses.length,
      sinColocar: ses.reduce((t: number, x: any) => t + Number(x.alumnos_sin_grupo || 0), 0),
      sinEntrenador: gs.filter((g: any) => !g.entrenador_id).length,
      sinPublicar: gs.filter((g: any) => g.entrenador_id && !g.publicado).length,
      sinConfirmar: gs.filter((g: any) => g.publicado && g.entrenador_id && String(g.estado_confirmacion || '') !== 'Confirmado').length,
    }
  })
  return textoParteManana({
    dias,
    reportes: { total: rep.length, porEntrenador: [...porEnt.entries()].sort((a, b) => b[1] - a[1]).map(([n, c]) => `${n.split(' ')[0]} ${c}`) },
    tareas: (tareas.data || []).map((t: any) => String(t.titulo)),
  })
}

async function enviarParteManana(admin: any, dedupeKey: string) {
  const parte = await parteManana(admin)
  if (!parte) return { enviado: false, motivo: 'nada que contar' }
  const { data: aviso, error } = await admin
    .from('paco_avisos')
    .insert({ tipo: 'PARTE_MANANA', titulo: parte.titulo, cuerpo: parte.cuerpoLargo, dedupe_key: dedupeKey })
    .select('id').maybeSingle()
  if (error) {
    if (error.code === '23505') return { enviado: false, motivo: 'ya enviado hoy' }
    throw error
  }
  const push = await enviarPush(admin, parte.titulo, parte.cuerpoCorto, dedupeKey, 'PARTE_MANANA', null)
  await admin.from('paco_avisos')
    .update({ push_estado: push.estado, push_dispositivos: push.enviados, error: push.error })
    .eq('id', aviso.id)
  return { enviado: true, push_estado: push.estado }
}

// ---------- Handler ---------------------------------------------------------

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS })
  if (req.method !== 'POST') return json({ ok: false, error: 'Método no permitido.' }, 405)

  try {
    const url = Deno.env.get('SUPABASE_URL') || ''
    const anon = Deno.env.get('SUPABASE_ANON_KEY') || ''
    const service = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
    if (!url || !anon || !service) return json({ ok: false, error: 'Servicio no configurado.' }, 503)
    const admin = createClient(url, service, { auth: { persistSession: false, autoRefreshToken: false } })
    const b = await req.json().catch(() => ({}))

    // ---- Entrada 1: cron (cabecera secreta) --------------------------------
    const secretoRecibido = req.headers.get('x-mitico-cron-secret') || ''
    if (secretoRecibido) {
      const { data: cfg, error: cfgErr } = await admin
        .from('push_internal_config_app').select('valor').eq('clave', 'report_reminder_cron_secret').maybeSingle()
      if (cfgErr) throw cfgErr
      const esperado = String(cfg?.valor || '')
      if (!esperado || secretoRecibido !== esperado) return json({ ok: false, error: 'No autorizado.' }, 401)

      // Avisos creados desde la base de datos (p. ej. una familia confirma el
      // cambio de turno desde su enlace): se mandan por push los que aún no
      // se han enviado. No toca el resumen del martes.
      if (b?.action === 'enviar_avisos_pendientes') {
        return json({ ok: true, enviados: await enviarAvisosPendientes(admin) })
      }
      // Cron cada 5 minutos: recordatorios de Secretaría que ya tocan + avisos
      // pendientes creados por la base de datos.
      if (b?.action === 'tick') {
        const recordatorios = await enviarRecordatoriosSecretaria(admin)
        const avisos = await enviarAvisosPendientes(admin)
        // Parte de la mañana: una vez al día, en la vuelta de las 08:30 (Madrid).
        const m = madridParts()
        let parte: unknown = null
        if (m.h === 8 && m.mi >= 30 && m.mi < 40) {
          parte = await enviarParteManana(admin, `parte:${m.y}-${pad(m.m)}-${pad(m.d)}`)
        }
        return json({ ok: true, recordatorios, avisos, parte })
      }
      if (b?.action === 'parte_prueba') {
        return json({ ok: true, parte: await enviarParteManana(admin, `parte-prueba:${Date.now()}`) })
      }

      const ahora = madridParts()
      // El cron se lanza a las 11:00 y a las 12:00 UTC (los martes) para cubrir
      // el cambio de hora: solo actua cuando en Madrid son las 13:xx del martes.
      if (b?.dry_run === true) {
        return json({ ok: true, dry_run: true, resumen: await calcularResumen(admin, ahora) })
      }
      if (ahora.dow !== 2 || ahora.h !== 13) {
        return json({ ok: true, omitido: true, motivo: 'No es martes a las 13:00 en Madrid.', madrid: `${ahora.y}-${pad(ahora.m)}-${pad(ahora.d)} ${pad(ahora.h)}:${pad(ahora.mi)}` })
      }
      const resumen = await calcularResumen(admin, ahora)
      const r = await crearAvisoYEnviar(admin, resumen, `disp-martes:${ahora.y}-${pad(ahora.m)}-${pad(ahora.d)}`, ahora)
      return json({ ok: true, ...r })
    }

    // ---- Entrada 2: Jose con su sesion --------------------------------------
    const authHeader = req.headers.get('Authorization') || ''
    if (!authHeader.startsWith('Bearer ')) return json({ ok: false, error: 'Debes iniciar sesión.' }, 401)
    const cliente = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
      auth: { persistSession: false, autoRefreshToken: false },
    })
    const { data: ud, error: ue } = await cliente.auth.getUser(authHeader.slice(7))
    const user = ud?.user
    if (ue || !user) return json({ ok: false, error: 'Sesión no válida.' }, 401)
    const { data: perfil } = await admin
      .from('usuarios_app').select('rol,activo').eq('auth_user_id', user.id).eq('activo', true).maybeSingle()
    if (perfil?.rol !== 'coordinador_jefe') return json({ ok: false, error: 'Acceso restringido a coordinador_jefe.' }, 403)

    const action = String(b?.action || '')

    if (action === 'config') {
      return json({ ok: true, vapid_public_key: Deno.env.get('VAPID_PUBLIC_KEY') || '' })
    }

    if (action === 'subscribe') {
      const s = b?.subscription || {}
      const endpoint = String(s?.endpoint || '')
      const p256dh = String(s?.keys?.p256dh || '')
      const authKey = String(s?.keys?.auth || '')
      if (!endpoint || !p256dh || !authKey) return json({ ok: false, error: 'La suscripción push está incompleta.' }, 400)
      const ahora = new Date().toISOString()
      const { error } = await admin.from('paco_dispositivos_push').upsert(
        {
          auth_user_id: user.id, endpoint, p256dh, auth_key: authKey,
          user_agent: String(b?.user_agent || '').slice(0, 500) || null,
          activo: true, last_seen_at: ahora, updated_at: ahora,
        },
        { onConflict: 'endpoint' },
      )
      if (error) throw error
      return json({ ok: true })
    }

    if (action === 'unsubscribe') {
      const endpoint = String(b?.endpoint || '')
      let q = admin.from('paco_dispositivos_push').update({ activo: false, updated_at: new Date().toISOString() }).eq('auth_user_id', user.id)
      if (endpoint) q = q.eq('endpoint', endpoint)
      const { error } = await q
      if (error) throw error
      return json({ ok: true })
    }

    if (action === 'estado') {
      const { data, error } = await admin
        .from('paco_dispositivos_push').select('endpoint').eq('auth_user_id', user.id).eq('activo', true)
      if (error) throw error
      const endpoint = String(b?.endpoint || '')
      return json({
        ok: true,
        dispositivos: (data || []).length,
        este_movil: Boolean(endpoint) && (data || []).some((d: any) => d.endpoint === endpoint),
      })
    }

    if (action === 'listar') {
      const desde = new Date(Date.now() - 14 * 86400000).toISOString()
      const { data, error } = await admin
        .from('paco_avisos').select('id,tipo,titulo,cuerpo,created_at,semana_inicio')
        .is('leido_at', null).gte('created_at', desde).order('created_at', { ascending: true }).limit(10)
      if (error) throw error
      return json({ ok: true, items: data || [] })
    }

    if (action === 'leer') {
      const ids = Array.isArray(b?.ids) ? b.ids.map(String).filter((x: string) => /^[0-9a-f-]{36}$/i.test(x)).slice(0, 20) : []
      if (ids.length) {
        const { error } = await admin.from('paco_avisos').update({ leido_at: new Date().toISOString() }).in('id', ids)
        if (error) throw error
      }
      return json({ ok: true })
    }

    if (action === 'probar') {
      const r = await enviarPush(admin, 'Paco Mitiquín', 'Prueba correcta: los avisos de Paco llegan a este móvil.', `paco-prueba:${Date.now()}`, 'PRUEBA', null)
      return json({ ok: r.estado === 'enviada', ...r })
    }

    if (action === 'resumen_ahora') {
      const resumen = await calcularResumen(admin)
      const r = await crearAvisoYEnviar(admin, resumen, `disp-manual:${Date.now()}`)
      return json({ ok: true, ...r })
    }

    return json({ ok: false, error: 'Acción no reconocida.' }, 400)
  } catch (e: any) {
    console.error('mitico-paco-avisos', e)
    return json({ ok: false, error: String(e?.message || e || 'Error interno.').slice(0, 300) }, 500)
  }
})
