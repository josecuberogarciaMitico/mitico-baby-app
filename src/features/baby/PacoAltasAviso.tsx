import type { AltaPacoItem, AltasPacoAviso } from './useBabyAimHarder';
import type { AgendaAlumnoSesionApp } from '../agenda/agendaTypes';
import './PacoAltasAviso.css';

type Props = {
  aviso: AltasPacoAviso;
  onEnviar: (item: AltaPacoItem) => void;
  onAbrirAlta: (alumno: AgendaAlumnoSesionApp) => void;
  onCerrar: () => void;
};

const ETIQUETA: Record<AltaPacoItem['estado'], string> = {
  crear: 'Preparando…',
  listo: 'WhatsApp listo',
  enviado: 'Ya enviado',
  falta_dato: 'Falta un dato',
  revisar: 'Revisar',
};

// Aviso de Paco tras cargar AimHarder: niños nuevos sin ficha y su Alta/Test.
export function PacoAltasAviso({ aviso, onEnviar, onAbrirAlta, onCerrar }: Props) {
  if (!aviso.items.length) return null;
  return (
    <section className="paco-altas" aria-label="Altas / Test de niños nuevos">
      <header className="paco-altas__cabecera">
        <div>
          <span className="paco-altas__kicker">{aviso.titulo}</span>
          <p className="paco-altas__resumen">{aviso.resumen}</p>
        </div>
        <button type="button" className="paco-altas__cerrar" onClick={onCerrar} aria-label="Cerrar aviso">
          ×
        </button>
      </header>
      <ul className="paco-altas__lista">
        {aviso.items.map((item) => (
          <li key={item.nombre} className={`paco-altas__fila paco-altas__fila--${item.estado}`}>
            <div className="paco-altas__nino">
              <strong>{item.nombre}</strong>
              <span className="paco-altas__estado">
                {ETIQUETA[item.estado]}
                {item.motivo ? ` · ${item.motivo}` : ''}
              </span>
            </div>
            <div className="paco-altas__acciones">
              {item.estado === 'listo' && item.alta && (
                <button type="button" className="paco-altas__wa" onClick={() => onEnviar(item)}>
                  Enviar por WhatsApp
                </button>
              )}
              {item.estado === 'enviado' && item.alta && (
                <button type="button" className="paco-altas__secundario" onClick={() => onEnviar(item)}>
                  Reenviar
                </button>
              )}
              {(item.estado === 'falta_dato' || item.estado === 'revisar') && item.alumnoSesion && (
                <button
                  type="button"
                  className="paco-altas__secundario"
                  onClick={() => item.alumnoSesion && onAbrirAlta(item.alumnoSesion)}
                >
                  Crear Alta / Test a mano
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
