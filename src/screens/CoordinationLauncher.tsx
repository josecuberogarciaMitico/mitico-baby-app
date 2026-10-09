import { useEffect, useRef, useState, type ReactNode } from 'react';
import './CoordinationLauncher.css';

type ToolAvailability = {
  paco: boolean;
  respuestas: boolean;
  secretaria: boolean;
  pendientes: number;
  panelAbierto: boolean;
};

const ESTADO_INICIAL: ToolAvailability = {
  paco: false,
  respuestas: false,
  secretaria: false,
  pendientes: 0,
  panelAbierto: false,
};

type Herramienta = {
  selector: string;
  titulo: string;
  detalle: string;
  icono: ReactNode;
  insignia?: number;
};

function ocultarBotonOriginal(selector: string) {
  const boton = document.querySelector<HTMLElement>(selector);
  if (!boton) return false;
  boton.dataset.miticoLauncherHidden = 'true';
  boton.style.setProperty('display', 'none', 'important');
  return true;
}

function ocultarBotonesOriginales() {
  return {
    paco: ocultarBotonOriginal('.paco-fab'),
    respuestas: ocultarBotonOriginal('.respuestas-fab'),
    secretaria: ocultarBotonOriginal('.secretaria-fab'),
  };
}

function leerEstadoHerramientas(): ToolAvailability {
  const disponibilidad = ocultarBotonesOriginales();
  const badge = document.querySelector('.secretaria-fab__badge');
  const pendientes = badge ? Number(badge.textContent || 0) || 0 : 0;
  const panelAbierto = Boolean(
    document.querySelector('.paco-panel, .secretaria-panel, .respuestas-panel')
  );
  return {
    paco: disponibilidad.paco,
    respuestas: disponibilidad.respuestas,
    secretaria: disponibilidad.secretaria,
    pendientes,
    panelAbierto,
  };
}

function IconoPaco() {
  return <span className="mitico-tools__miniOrbe" aria-hidden="true" />;
}

function IconoRespuestas() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 4H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1h4l4 4 4-4h4a1 1 0 0 0 1-1V5a1 1 0 0 0-1-1z" />
      <path d="M7.5 9h9M7.5 12.5h5.5" />
    </svg>
  );
}

function IconoSecretaria() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="3.5" width="16" height="17" rx="2.5" />
      <path d="M8 9l1.5 1.5L12 8M8 15l1.5 1.5L12 14M14.5 9.5H17M14.5 15.5H17" />
    </svg>
  );
}

export function CoordinationLauncher() {
  const [abierto, setAbierto] = useState(false);
  const [estado, setEstado] = useState<ToolAvailability>(ESTADO_INICIAL);
  const contenedorRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const actualizar = () => {
      window.cancelAnimationFrame(raf);
      raf = window.requestAnimationFrame(() => setEstado(leerEstadoHerramientas()));
    };
    actualizar();
    const observer = new MutationObserver(actualizar);
    observer.observe(document.body, { childList: true, subtree: true, characterData: true });
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') actualizar();
    };
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    window.addEventListener('focus', actualizar);
    return () => {
      window.cancelAnimationFrame(raf);
      observer.disconnect();
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      window.removeEventListener('focus', actualizar);
    };
  }, []);

  useEffect(() => {
    if (!abierto) return;
    const cerrarFuera = (event: PointerEvent) => {
      const objetivo = event.target as Node | null;
      if (!objetivo || contenedorRef.current?.contains(objetivo)) return;
      setAbierto(false);
    };
    const cerrarConEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setAbierto(false);
    };
    document.addEventListener('pointerdown', cerrarFuera, true);
    document.addEventListener('keydown', cerrarConEscape);
    return () => {
      document.removeEventListener('pointerdown', cerrarFuera, true);
      document.removeEventListener('keydown', cerrarConEscape);
    };
  }, [abierto]);

  useEffect(() => {
    if (estado.panelAbierto) setAbierto(false);
  }, [estado.panelAbierto]);

  if (estado.panelAbierto || (!estado.paco && !estado.respuestas && !estado.secretaria)) return null;

  const abrirHerramienta = (selector: string) => {
    const boton = document.querySelector<HTMLButtonElement>(selector);
    if (!boton) return;
    setAbierto(false);
    boton.click();
  };

  const herramientas: Herramienta[] = [];
  if (estado.paco) {
    herramientas.push({ selector: '.paco-fab', titulo: 'Paco', detalle: 'Asistente de coordinación', icono: <IconoPaco /> });
  }
  if (estado.respuestas) {
    herramientas.push({ selector: '.respuestas-fab', titulo: 'Respuestas', detalle: 'Mensajes a familias y entrenadores', icono: <IconoRespuestas /> });
  }
  if (estado.secretaria) {
    herramientas.push({
      selector: '.secretaria-fab',
      titulo: 'Secretaría',
      detalle: estado.pendientes > 0 ? `${estado.pendientes} pendiente${estado.pendientes === 1 ? '' : 's'}` : 'Tareas y notas',
      icono: <IconoSecretaria />,
      insignia: estado.pendientes,
    });
  }

  return (
    <div className="mitico-tools" ref={contenedorRef}>
      {abierto && (
        <div className="mitico-tools__menu" role="menu" aria-label="Herramientas">
          <span className="mitico-tools__titulo">Herramientas</span>
          {herramientas.map((herramienta, indice) => (
            <button
              key={herramienta.selector}
              type="button"
              role="menuitem"
              className="mitico-tools__option"
              style={{ ['--i' as string]: indice }}
              onClick={() => abrirHerramienta(herramienta.selector)}
            >
              <span className="mitico-tools__optionIcon">{herramienta.icono}</span>
              <span>
                <strong>{herramienta.titulo}</strong>
                <small>{herramienta.detalle}</small>
              </span>
              {herramienta.insignia ? <span className="mitico-tools__badge">{herramienta.insignia}</span> : null}
            </button>
          ))}
        </div>
      )}
      <button
        type="button"
        className="mitico-tools__fab"
        aria-label={abierto ? 'Cerrar herramientas' : 'Abrir herramientas'}
        aria-expanded={abierto}
        onClick={() => setAbierto((valor) => !valor)}
      >
        <span className="mitico-tools__nucleo" aria-hidden="true" />
        <span className="mitico-tools__cruz" aria-hidden="true">×</span>
        {estado.pendientes > 0 && !abierto && <span className="mitico-tools__fabBadge">{estado.pendientes}</span>}
      </button>
    </div>
  );
}
