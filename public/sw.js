// Mítico Baby PWA
// Deliberadamente no cachea HTML, JS ni peticiones a Supabase.
// Su función es habilitar el ciclo PWA sin riesgo de servir datos antiguos.

self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})
