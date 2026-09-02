const CACHE_ACTUAL = 'mitico-baby-shell-v2'
const PREFIJO_CACHES = 'mitico-baby-'
const SHELL_FALLBACK = '/__mitico_shell__'

self.addEventListener('install', () => {
  // No hacemos skipWaiting automático:
  // la versión nueva espera hasta que el usuario pulse “Actualizar”.
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const nombres = await caches.keys()

      await Promise.all(
        nombres
          .filter(
            (nombre) =>
              nombre.startsWith(PREFIJO_CACHES) &&
              nombre !== CACHE_ACTUAL
          )
          .map((nombre) => caches.delete(nombre))
      )

      await self.clients.claim()
    })()
  )
})

self.addEventListener('message', (event) => {
  if (event.data?.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

self.addEventListener('push', (event) => {
  let datos = {}

  try {
    datos = event.data ? event.data.json() : {}
  } catch {
    datos = {
      title: 'Mítico Baby',
      body: event.data ? event.data.text() : 'Tienes una nueva notificación.',
    }
  }

  const titulo = datos.title || 'Mítico Baby'
  const opciones = {
    body: datos.body || 'Tienes una nueva notificación.',
    icon: datos.icon || '/icon-192.png',
    badge: datos.badge || '/favicon-32.png',
    tag: datos.tag || 'mitico-baby',
    renotify: Boolean(datos.renotify),
    data: {
      url: datos?.data?.url || '/?push=entrenador',
      tipo: datos?.data?.tipo || '',
      semana_inicio: datos?.data?.semana_inicio || '',
    },
  }

  event.waitUntil(self.registration.showNotification(titulo, opciones))
})

self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  const destino = event.notification?.data?.url || '/?push=entrenador'

  event.waitUntil(
    (async () => {
      const ventanas = await self.clients.matchAll({
        type: 'window',
        includeUncontrolled: true,
      })

      for (const ventana of ventanas) {
        if (!('focus' in ventana)) continue

        try {
          const actual = new URL(ventana.url)
          const objetivo = new URL(destino, self.location.origin)
          if (actual.origin === objetivo.origin) {
            if ('navigate' in ventana) await ventana.navigate(objetivo.href)
            return ventana.focus()
          }
        } catch {
          return ventana.focus()
        }
      }

      if (self.clients.openWindow) {
        return self.clients.openWindow(destino)
      }
    })()
  )
})

async function redPrimero(request) {
  const cache = await caches.open(CACHE_ACTUAL)

  try {
    const respuesta = await fetch(request, { cache: 'no-store' })

    if (respuesta && respuesta.ok) {
      await cache.put(SHELL_FALLBACK, respuesta.clone())
    }

    return respuesta
  } catch (error) {
    const fallback = await cache.match(SHELL_FALLBACK)
    if (fallback) return fallback
    throw error
  }
}

async function cachePrimero(request) {
  const cache = await caches.open(CACHE_ACTUAL)
  const existente = await cache.match(request)

  if (existente) return existente

  const respuesta = await fetch(request)

  if (respuesta && respuesta.ok) {
    await cache.put(request, respuesta.clone())
  }

  return respuesta
}

self.addEventListener('fetch', (event) => {
  const request = event.request

  if (request.method !== 'GET') return

  const url = new URL(request.url)

  // Nunca interferir con Supabase u otros dominios.
  if (url.origin !== self.location.origin) return

  // HTML / navegación: red primero para no quedarse atrapado en una versión vieja.
  if (
    request.mode === 'navigate' ||
    url.pathname === '/' ||
    url.pathname === '/index.html'
  ) {
    event.respondWith(redPrimero(request))
    return
  }

  // Manifest: también red primero.
  if (url.pathname === '/manifest.webmanifest') {
    event.respondWith(
      fetch(request, { cache: 'no-store' }).catch(() =>
        caches.match(request)
      )
    )
    return
  }

  // Assets con hash de Vite e iconos: cache primero.
  // Al cambiar el hash, se descarga automáticamente el asset nuevo.
  if (
    url.pathname.startsWith('/assets/') ||
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(cachePrimero(request))
  }
})
