import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

type PwaUpdateState = {
  registration: ServiceWorkerRegistration | null
  visible: boolean
}

const pwaUpdateState: PwaUpdateState = {
  registration: null,
  visible: false,
}

function obtenerBuildActual() {
  const scripts = Array.from(
    document.querySelectorAll<HTMLScriptElement>('script[type="module"][src]')
  )

  const principal =
    scripts.find((script) => script.src.includes('/assets/')) || scripts[0]

  if (!principal) return ''
  return new URL(principal.src, window.location.href).pathname
}

async function obtenerBuildPublicado() {
  try {
    const url = `/index.html?pwa-check=${Date.now()}`
    const respuesta = await fetch(url, {
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache',
      },
    })

    if (!respuesta.ok) return ''

    const html = await respuesta.text()
    const documento = new DOMParser().parseFromString(html, 'text/html')
    const scripts = Array.from(
      documento.querySelectorAll<HTMLScriptElement>(
        'script[type="module"][src]'
      )
    )

    const principal =
      scripts.find((script) => script.src.includes('/assets/')) || scripts[0]

    if (!principal) return ''
    return new URL(principal.getAttribute('src') || '', window.location.href)
      .pathname
  } catch {
    return ''
  }
}

function ocultarAvisoActualizacion() {
  document.getElementById('mitico-pwa-update')?.remove()
  pwaUpdateState.visible = false
}

function mostrarAvisoActualizacion() {
  if (pwaUpdateState.visible) return
  pwaUpdateState.visible = true

  const aviso = document.createElement('div')
  aviso.id = 'mitico-pwa-update'
  aviso.setAttribute('role', 'status')
  aviso.style.position = 'fixed'
  aviso.style.left = '12px'
  aviso.style.right = '12px'
  aviso.style.bottom = 'calc(12px + env(safe-area-inset-bottom, 0px))'
  aviso.style.zIndex = '2147483647'
  aviso.style.maxWidth = '560px'
  aviso.style.margin = '0 auto'
  aviso.style.padding = '12px'
  aviso.style.borderRadius = '16px'
  aviso.style.border = '1px solid rgba(15, 23, 42, 0.12)'
  aviso.style.background = '#ffffff'
  aviso.style.boxShadow = '0 16px 50px rgba(15, 23, 42, 0.20)'
  aviso.style.fontFamily =
    "'SF Pro Rounded', 'Aptos', 'Inter', 'Segoe UI', system-ui, sans-serif"

  const fila = document.createElement('div')
  fila.style.display = 'flex'
  fila.style.alignItems = 'center'
  fila.style.justifyContent = 'space-between'
  fila.style.gap = '12px'
  fila.style.flexWrap = 'wrap'

  const texto = document.createElement('div')
  texto.style.flex = '1 1 230px'
  texto.style.minWidth = '0'

  const titulo = document.createElement('div')
  titulo.textContent = 'Nueva versión disponible'
  titulo.style.fontSize = '15px'
  titulo.style.fontWeight = '850'
  titulo.style.color = '#172033'

  const detalle = document.createElement('div')
  detalle.textContent =
    'Actualiza sin borrar la app ni volver a iniciar sesión.'
  detalle.style.marginTop = '3px'
  detalle.style.fontSize = '13px'
  detalle.style.fontWeight = '650'
  detalle.style.lineHeight = '1.35'
  detalle.style.color = '#64748b'

  const boton = document.createElement('button')
  boton.type = 'button'
  boton.textContent = 'Actualizar'
  boton.style.border = '0'
  boton.style.borderRadius = '12px'
  boton.style.padding = '10px 14px'
  boton.style.background = '#6fb52b'
  boton.style.color = '#ffffff'
  boton.style.fontSize = '14px'
  boton.style.fontWeight = '850'
  boton.style.cursor = 'pointer'
  boton.style.whiteSpace = 'nowrap'

  boton.addEventListener('click', async () => {
    boton.disabled = true
    boton.textContent = 'Actualizando…'
    boton.style.opacity = '0.75'

    try {
      const registro =
        pwaUpdateState.registration ||
        (await navigator.serviceWorker?.getRegistration())

      if (registro) {
        await registro.update().catch(() => undefined)

        if (registro.waiting) {
          registro.waiting.postMessage({ type: 'SKIP_WAITING' })
          return
        }
      }

      window.location.reload()
    } catch {
      window.location.reload()
    }
  })

  texto.append(titulo, detalle)
  fila.append(texto, boton)
  aviso.append(fila)
  document.body.append(aviso)
}

async function comprobarVersionPublicada() {
  if (document.visibilityState !== 'visible') return

  const actual = obtenerBuildActual()
  const publicada = await obtenerBuildPublicado()

  if (!actual || !publicada) return

  // En desarrollo ambos suelen ser /src/main.tsx.
  // En producción Vite usa /assets/index-XXXX.js y cambia al publicar.
  if (actual !== publicada) {
    mostrarAvisoActualizacion()
  }
}

function prepararActualizacionPwa() {
  if (!('serviceWorker' in navigator)) return

  let recargandoPorCambioControlador = false

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargandoPorCambioControlador) return
    recargandoPorCambioControlador = true
    ocultarAvisoActualizacion()
    window.location.reload()
  })

  window.addEventListener('load', async () => {
    try {
      const registro = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none',
      })

      pwaUpdateState.registration = registro

      if (registro.waiting && navigator.serviceWorker.controller) {
        mostrarAvisoActualizacion()
      }

      registro.addEventListener('updatefound', () => {
        const instalando = registro.installing
        if (!instalando) return

        instalando.addEventListener('statechange', () => {
          if (
            instalando.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            mostrarAvisoActualizacion()
          }
        })
      })

      // Comprueba el service worker y, además, el build real publicado.
      await registro.update().catch(() => undefined)
      await comprobarVersionPublicada()
    } catch (error) {
      console.warn('No se pudo registrar la PWA:', error)
    }
  })

  // Cuando el entrenador vuelve a abrir la PWA, comprueba si hay versión nueva.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      pwaUpdateState.registration?.update().catch(() => undefined)
      void comprobarVersionPublicada()
    }
  })

  window.addEventListener('focus', () => {
    void comprobarVersionPublicada()
  })

  // Comprobación discreta mientras la app permanece abierta.
  window.setInterval(() => {
    void comprobarVersionPublicada()
  }, 10 * 60 * 1000)
}

prepararActualizacionPwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
