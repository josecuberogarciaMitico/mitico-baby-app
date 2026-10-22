import { whatsappDesktopAppUrl } from '../core/communications/whatsappContract';

/**
 * En ordenador, los enlaces de WhatsApp de la app abren directamente
 * WhatsApp de escritorio en vez de la página intermedia de api.whatsapp.com
 * («Abrir aplicación / Continuar en WhatsApp Web»).
 * Cubre los <a href> y los window.open de toda la app desde un único sitio.
 * En móvil no se toca nada: allí wa.me ya abre la aplicación.
 */
function esMovil() {
  const ua = navigator.userAgent || '';
  const ipadModerno = /Macintosh/.test(ua) && navigator.maxTouchPoints > 1;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(ua) || ipadModerno;
}

function abrirEnApp(url: string) {
  // Navegar a un protocolo propio no cambia de página: el sistema abre la app.
  window.location.href = url;
}

export function instalarWhatsappEscritorio() {
  if (typeof window === 'undefined' || esMovil()) return;

  const abrirOriginal = window.open.bind(window);
  window.open = ((url?: string | URL, target?: string, features?: string) => {
    const app = whatsappDesktopAppUrl(url ? String(url) : '');
    if (app) {
      abrirEnApp(app);
      return null;
    }
    return abrirOriginal(url as string, target, features);
  }) as typeof window.open;

  document.addEventListener(
    'click',
    (evento) => {
      if (evento.defaultPrevented || evento.button !== 0) return;
      if (evento.metaKey || evento.ctrlKey || evento.shiftKey || evento.altKey) return;
      const enlace = (evento.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
      if (!enlace) return;
      const app = whatsappDesktopAppUrl(enlace.href);
      if (!app) return;
      evento.preventDefault();
      abrirEnApp(app);
    },
    true
  );
}
