import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

let registroPwa: ServiceWorkerRegistration | null = null
let recargandoPorCambioControlador = false
let ultimaInteraccionPwa = Date.now()

const TIEMPO_INACTIVIDAD_ACTUALIZACION = 30 * 60 * 1000

function registrarInteraccionPwa() {
  ultimaInteraccionPwa = Date.now()
}

function hayCampoEditableActivo() {
  const activo = document.activeElement as HTMLElement | null
  if (!activo) return false

  return (
    activo.matches('input, textarea, select, [contenteditable="true"]') ||
    Boolean(activo.closest('[contenteditable="true"]'))
  )
}

function hayEdicionVisiblePosiblementePendiente() {
  const controles = Array.from(
    document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(
      'input:not([disabled]):not([readonly]), textarea:not([disabled]):not([readonly]), select:not([disabled])'
    )
  )

  return controles.some((control) => {
    const estilo = window.getComputedStyle(control)
    if (
      estilo.display === 'none' ||
      estilo.visibility === 'hidden' ||
      control.getClientRects().length === 0
    ) {
      return false
    }

    if (control instanceof HTMLInputElement) {
      if (control.type === 'checkbox' || control.type === 'radio') {
        return control.checked !== control.defaultChecked
      }

      if (
        control.type === 'button' ||
        control.type === 'submit' ||
        control.type === 'reset' ||
        control.type === 'hidden'
      ) {
        return false
      }

      return control.value !== control.defaultValue
    }

    if (control instanceof HTMLTextAreaElement) {
      return control.value !== control.defaultValue
    }

    const opcionPorDefecto = Array.from(control.options).find(
      (opcion) => opcion.defaultSelected
    )

    if (!opcionPorDefecto) {
      return control.selectedIndex > 0
    }

    return control.value !== opcionPorDefecto.value
  })
}

function puedeActualizarPorInactividad() {
  if (document.visibilityState !== 'visible') return false
  if (Date.now() - ultimaInteraccionPwa < TIEMPO_INACTIVIDAD_ACTUALIZACION) {
    return false
  }
  if (hayCampoEditableActivo()) return false
  if (hayEdicionVisiblePosiblementePendiente()) return false
  return true
}

function activarVersionEnEspera(
  registro: ServiceWorkerRegistration | null | undefined
) {
  if (!registro?.waiting || !navigator.serviceWorker.controller) return false

  registro.waiting.postMessage({ type: 'SKIP_WAITING' })
  return true
}

async function comprobarActualizacionPwa(
  permitirActivacionInmediata: boolean
) {
  const registro =
    registroPwa || (await navigator.serviceWorker.getRegistration())

  if (!registro) return

  registroPwa = registro

  if (permitirActivacionInmediata && activarVersionEnEspera(registro)) {
    return
  }

  await registro.update().catch(() => undefined)

  if (permitirActivacionInmediata) {
    window.setTimeout(() => {
      activarVersionEnEspera(registro)
    }, 350)
  }
}

function prepararActualizacionPwa() {
  if (!('serviceWorker' in navigator)) return

  ;[
    'pointerdown',
    'keydown',
    'touchstart',
    'input',
    'change',
    'wheel',
  ].forEach((evento) => {
    window.addEventListener(evento, registrarInteraccionPwa, {
      passive: true,
      capture: true,
    })
  })

  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (recargandoPorCambioControlador) return
    recargandoPorCambioControlador = true
    window.location.reload()
  })

  window.addEventListener('load', async () => {
    try {
      const registro = await navigator.serviceWorker.register('/sw.js', {
        updateViaCache: 'none',
      })

      registroPwa = registro

      // Si una versión nueva quedó preparada en una sesión anterior,
      // al abrir la app se activa automáticamente.
      if (activarVersionEnEspera(registro)) return

      registro.addEventListener('updatefound', () => {
        const instalando = registro.installing
        if (!instalando) return

        instalando.addEventListener('statechange', () => {
          if (
            instalando.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            // La actualización queda preparada.
            // No se recarga en mitad del trabajo del usuario.
          }
        })
      })

      // Descarga/prepara la nueva versión si existe.
      await registro.update().catch(() => undefined)
    } catch (error) {
      console.warn('No se pudo registrar la PWA:', error)
    }
  })

  // Si la app estuvo en segundo plano y el usuario vuelve,
  // aplica la versión nueva automáticamente.
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState !== 'visible') return
    registrarInteraccionPwa()
    void comprobarActualizacionPwa(true)
  })

  window.addEventListener('focus', () => {
    registrarInteraccionPwa()
    void comprobarActualizacionPwa(true)
  })

  // Mientras la app permanece abierta, comprueba cada 10 minutos.
  // Si hay una actualización, la prepara en segundo plano.
  // Si además lleva 30 minutos sin uso y no detectamos edición pendiente,
  // la activa automáticamente sin necesidad de cerrar la app.
  window.setInterval(() => {
    const puedeActivar = puedeActualizarPorInactividad()
    void comprobarActualizacionPwa(puedeActivar)
  }, 10 * 60 * 1000)
}

prepararActualizacionPwa()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
