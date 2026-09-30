import { textoAvisoAltasRespondidasApp } from '../../core/enrolment/respondedNotice';
import type { AltasRespondidasAvisoApp } from './useAltasRespondidasAviso';
import './AltasRespondidasAviso.css';

const MODALIDAD_TEXTO: Record<string, string> = {
  BABY: 'Baby',
  OCIO: 'Ocio',
  INTENSIVOS: 'Intensivos',
};

// Aviso flotante: una familia ha respondido el test de nivel.
export function AltasRespondidasAviso(props: {
  aviso: AltasRespondidasAvisoApp;
  onVer: () => void;
}) {
  const { nuevas, marcarVistas } = props.aviso;
  if (nuevas.length === 0) return null;

  const { titulo, detalle } = textoAvisoAltasRespondidasApp(nuevas);
  const modalidad = nuevas.length === 1 ? MODALIDAD_TEXTO[nuevas[0].modalidad] : '';

  return (
    <div className="mitico-aviso-altas" role="status" aria-live="polite">
      <span className="mitico-aviso-altas__icono" aria-hidden="true">✓</span>
      <div className="mitico-aviso-altas__texto">
        <strong>
          {titulo}
          {modalidad && <span className="mitico-aviso-altas__chip">{modalidad}</span>}
        </strong>
        <span>{detalle}</span>
      </div>
      <div className="mitico-aviso-altas__acciones">
        <button
          type="button"
          className="mitico-aviso-altas__ver"
          onClick={() => {
            marcarVistas();
            props.onVer();
          }}
        >
          Ver
        </button>
        <button
          type="button"
          className="mitico-aviso-altas__cerrar"
          aria-label="Cerrar aviso"
          onClick={marcarVistas}
        >
          ×
        </button>
      </div>
    </div>
  );
}

// Número junto a "Altas / Test" en el menú lateral.
export function AltasPendientesBadge(props: { total: number }) {
  if (props.total <= 0) return null;
  return (
    <span className="mitico-nav-badge-altas" aria-label={`${props.total} pendientes de revisar`}>
      {props.total}
    </span>
  );
}
