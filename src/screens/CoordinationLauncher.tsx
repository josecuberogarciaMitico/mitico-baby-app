import { useEffect, useRef, useState } from 'react';
import './CoordinationLauncher.css';

type ToolAvailability = {
  paco: boolean;
  secretaria: boolean;
  pendientes: number;
  panelAbierto: boolean;
};

const ESTADO_INICIAL: ToolAvailability = {
  paco: false,
  secretaria: false,
  pendientes: 0,
  panelAbierto: false,
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
    secretaria: ocultarBotonOriginal('.secretaria-fab'),
  };
}

function leerEstadoHerramientas(): ToolAvailability {
  const disponibilidad = ocultarBotonesOriginales();
  const badge = document.querySelector('.secretaria-fab__badge');
  const pendientes = badge ? Number(badge.textContent || 0) || 0 : 0;
  const panelAbierto = Boolean(document.querySelector('.paco-panel, .secretaria-panel'));
  return { paco: disponibilidad.paco, secretaria: disponibilidad.secretaria, pendientes, panelAbierto };
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
    document.addEventListener('pointerdown', cerrarFuera, true);
    return () => document.removeEventListener('pointerdown', cerrarFuera, true);
  }, [abierto]);

  useEffect(() => {
    if (estado.panelAbierto) setAbierto(false);
  }, [estado.panelAbierto]);

  if (estado.panelAbierto || (!estado.paco && !estado.secretaria)) return null;

  const abrirHerramienta = (selector: string) => {
    const boton = document.querySelector<HTMLButtonElement>(selector);
    if (!boton) return;
    setAbierto(false);
    boton.click();
  };

  return (
    <div className="mitico-tools" ref={contenedorRef}>
      {abierto && (
        <div className="mitico-tools__menu" role="menu" aria-label="Herramientas">
          {estado.paco && (
            <button type="button" role="menuitem" className="mitico-tools__option" onClick={() => abrirHerramienta('.paco-fab')}>
              <span className="mitico-tools__optionIcon mitico-tools__optionIcon--paco">P</span>
              <span><strong>Paco</strong><small>Asistente de coordinación</small></span>
            </button>
          )}
          {estado.secretaria && (
            <button type="button" role="menuitem" className="mitico-tools__option" onClick={() => abrirHerramienta('.secretaria-fab')}>
              <span className="mitico-tools__optionIcon">✓</span>
              <span><strong>Secretaría</strong><small>{estado.pendientes > 0 ? `${estado.pendientes} pendiente${estado.pendientes === 1 ? '' : 's'}` : 'Tareas y notas'}</small></span>
              {estado.pendientes > 0 && <span className="mitico-tools__badge">{estado.pendientes}</span>}
            </button>
          )}
        </div>
      )}
      <button type="button" className="mitico-tools__fab" aria-label={abierto ? 'Cerrar herramientas' : 'Abrir herramientas'} aria-expanded={abierto} onClick={() => setAbierto((valor) => !valor)}>
        <span aria-hidden="true">{abierto ? '×' : 'M'}</span>
        {estado.pendientes > 0 && !abierto && <span className="mitico-tools__fabBadge">{estado.pendientes}</span>}
      </button>
    </div>
  );
}
