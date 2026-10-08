import { useEffect, useMemo, useState } from 'react';
import { generarPdfSimple } from '../billing/simplePdf';
import {
  bloquesCartaFamilia,
  limpiarCarta,
  nombreArchivoCarta,
  textoParaChatGPT,
  type DatosCartaFamilia,
} from '../../core/reports/familyLetter';

/**
 * Fase 4 (02/10/2026): carta para la familia, dentro de la ficha del alumno.
 * 1) Copiar el resumen y pegarlo en ChatGPT. 2) Pegar aquí la carta.
 * 3) Descargar el PDF (en el móvil se abre «Compartir»: WhatsApp, correo…).
 * No guarda nada en Supabase; el borrador queda solo en este dispositivo.
 */
const CLAVE_BORRADOR = 'mitico_carta_familia_borrador_v1:';
const MINIMO_CARTA = 40;

function leerBorrador(alumnoId: string) {
  try {
    return window.localStorage.getItem(CLAVE_BORRADOR + alumnoId) || '';
  } catch {
    return '';
  }
}

function guardarBorrador(alumnoId: string, texto: string) {
  try {
    if (texto.trim()) window.localStorage.setItem(CLAVE_BORRADOR + alumnoId, texto);
    else window.localStorage.removeItem(CLAVE_BORRADOR + alumnoId);
  } catch {
    /* sin almacenamiento: el borrador se pierde al cerrar, no pasa nada */
  }
}

function descargarBlob(blob: Blob, nombre: string) {
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement('a');
  enlace.href = url;
  enlace.download = nombre;
  enlace.rel = 'noopener';
  enlace.style.display = 'none';
  document.body.appendChild(enlace);
  enlace.click();
  enlace.remove();
  setTimeout(() => URL.revokeObjectURL(url), 60_000);
}

export function FamilyLetterPanel(props: { alumnoId: string; datos: DatosCartaFamilia; onClose: () => void }) {
  const { alumnoId, datos } = props;
  const [carta, setCarta] = useState(() => leerBorrador(alumnoId));
  const [incluirHabilidades, setIncluirHabilidades] = useState(true);
  const [aviso, setAviso] = useState('');
  const [textoManual, setTextoManual] = useState('');
  const [generando, setGenerando] = useState(false);

  useEffect(() => {
    setCarta(leerBorrador(alumnoId));
    setAviso('');
    setTextoManual('');
  }, [alumnoId]);

  const resumen = useMemo(() => textoParaChatGPT(datos), [datos]);
  const sinHabilidades = datos.progreso.every((p) => p.estado === 'sin_ver');
  const cartaLista = limpiarCarta(carta).length >= MINIMO_CARTA;

  async function copiarResumen() {
    setAviso('');
    try {
      await navigator.clipboard.writeText(resumen);
      setTextoManual('');
      setAviso('Copiado. Pégalo en ChatGPT y luego pega aquí abajo la carta que te escriba.');
    } catch {
      // Sin permiso de portapapeles: se muestra para copiarlo a mano.
      setTextoManual(resumen);
      setAviso('No se ha podido copiar solo. Mantén pulsado el texto de abajo, selecciónalo todo y cópialo.');
    }
  }

  function cambiarCarta(texto: string) {
    setCarta(texto);
    guardarBorrador(alumnoId, texto);
  }

  async function descargarPdf() {
    if (!cartaLista || generando) return;
    setAviso('');
    setGenerando(true);
    try {
      const fechaHoy = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
      const bytes = generarPdfSimple(bloquesCartaFamilia(datos, carta, { incluirHabilidades, fechaHoy }), {
        title: `Carta familia · ${datos.nombre}`,
        footerLeft: 'Mítico Club · Escuela de esquí',
      });
      const nombre = nombreArchivoCarta(datos.nombre);
      const blob = new Blob([bytes as BlobPart], { type: 'application/pdf' });
      const esTactil = typeof window.matchMedia === 'function' && window.matchMedia('(pointer: coarse)').matches;
      if (esTactil && typeof navigator.share === 'function' && typeof File === 'function') {
        const archivo = new File([blob], nombre, { type: 'application/pdf' });
        if (!navigator.canShare || navigator.canShare({ files: [archivo] })) {
          try {
            await navigator.share({ files: [archivo], title: nombre });
            return;
          } catch (errorCompartir) {
            if ((errorCompartir as { name?: string })?.name === 'AbortError') return;
          }
        }
      }
      descargarBlob(blob, nombre);
    } catch (error) {
      console.error('Error generando la carta en PDF', error);
      setAviso('No se ha podido generar el PDF. Vuelve a intentarlo.');
    } finally {
      setGenerando(false);
    }
  }

  return (
    <section className="ficha-letter" aria-label="Carta para la familia">
      <div className="ficha-letter__head">
        <h3>Carta para la familia</h3>
        <button type="button" className="ficha-letter__close" onClick={props.onClose} aria-label="Cerrar carta">
          ×
        </button>
      </div>
      {sinHabilidades && (
        <p className="ficha-warn">Todavía no hay habilidades valoradas en su nivel: la carta saldrá muy pobre.</p>
      )}

      <div className="ficha-letter__step">
        <span className="ficha-letter__num">1</span>
        <div>
          <strong>Copia el resumen y pégalo en ChatGPT</strong>
          <p className="ficha-hint">Lleva sus habilidades y las notas de los entrenadores. Nunca incidencias.</p>
          <div className="ficha-letter__actions">
            <button type="button" className="ficha-letter__btn is-primary" onClick={() => void copiarResumen()}>
              Copiar resumen
            </button>
            <a className="ficha-letter__btn" href="https://chatgpt.com/" target="_blank" rel="noreferrer">
              Abrir ChatGPT
            </a>
          </div>
          {textoManual && (
            <textarea className="ficha-letter__manual" readOnly value={textoManual} rows={6} onFocus={(e) => e.currentTarget.select()} />
          )}
        </div>
      </div>

      <div className="ficha-letter__step">
        <span className="ficha-letter__num">2</span>
        <div>
          <strong>Pega aquí la carta de ChatGPT</strong>
          <p className="ficha-hint">Puedes retocarla. Se guarda en este dispositivo hasta que la borres.</p>
          <textarea
            className="ficha-letter__text"
            value={carta}
            onChange={(e) => cambiarCarta(e.target.value)}
            placeholder="Hola, familia…"
            rows={9}
            aria-label="Texto de la carta"
          />
        </div>
      </div>

      <div className="ficha-letter__step">
        <span className="ficha-letter__num">3</span>
        <div>
          <strong>Descarga el PDF</strong>
          <label className="ficha-letter__check">
            <input type="checkbox" checked={incluirHabilidades} onChange={(e) => setIncluirHabilidades(e.target.checked)} />
            Añadir la tabla de habilidades de su nivel
          </label>
          <div className="ficha-letter__actions">
            <button
              type="button"
              className="ficha-letter__btn is-primary"
              disabled={!cartaLista || generando}
              onClick={() => void descargarPdf()}
            >
              {generando ? 'Preparando…' : 'Descargar PDF'}
            </button>
            {carta && (
              <button type="button" className="ficha-letter__btn" onClick={() => cambiarCarta('')}>
                Borrar carta
              </button>
            )}
          </div>
          {!cartaLista && <p className="ficha-hint">Primero pega la carta (paso 2).</p>}
        </div>
      </div>

      {aviso && <p className="ficha-letter__aviso" role="status">{aviso}</p>}
    </section>
  );
}
