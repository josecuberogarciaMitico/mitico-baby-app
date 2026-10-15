import { useRef, useState } from 'react';

/**
 * Botón «Todo en bruto» (15/10/2026): muestra TODO lo registrado de un alumno
 * en un cuadro editable, para retocarlo aquí o copiarlo y pegarlo en ChatGPT.
 * No guarda nada. Se usa en la ficha del alumno y en Ocio → Navidad / final.
 */
export function RawStudentDump(props: { construir: () => Promise<string> | string; titulo?: string }) {
  const [texto, setTexto] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const [aviso, setAviso] = useState('');
  const areaRef = useRef<HTMLTextAreaElement | null>(null);

  async function abrir() {
    setAviso('');
    setCargando(true);
    try {
      setTexto(await props.construir());
    } catch (error) {
      setAviso(error instanceof Error ? error.message : 'No se ha podido cargar el historial.');
    } finally {
      setCargando(false);
    }
  }

  async function copiar() {
    const area = areaRef.current;
    if (texto === null) return;
    try {
      await navigator.clipboard.writeText(texto);
      setAviso('Copiado. Pégalo en ChatGPT o donde quieras.');
    } catch {
      area?.focus();
      area?.select();
      setAviso('No se ha podido copiar solo: el texto ya está seleccionado, cópialo a mano.');
    }
  }

  if (texto === null) {
    return (
      <div className="raw-dump">
        <button type="button" className="ficha-letter__btn" onClick={() => void abrir()} disabled={cargando}>
          {cargando ? 'Cargando…' : '📋 Todo en bruto (para ChatGPT)'}
        </button>
        {aviso && <p className="ficha-warn">{aviso}</p>}
      </div>
    );
  }

  return (
    <section className="raw-dump is-open" aria-label="Todo lo registrado, en bruto">
      <div className="raw-dump__head">
        <strong>{props.titulo || 'Todo lo registrado, en bruto'}</strong>
        <span className="ficha-hint">Sin resumir: incluye incidencias y notas internas. Puedes editarlo antes de copiar.</span>
      </div>
      <textarea
        ref={areaRef}
        className="ficha-letter__text raw-dump__text"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        rows={14}
        aria-label="Texto en bruto"
      />
      <div className="ficha-letter__actions">
        <button type="button" className="ficha-letter__btn is-primary" onClick={() => void copiar()}>
          Copiar
        </button>
        <button type="button" className="ficha-letter__btn" onClick={() => void abrir()}>
          Volver a cargar
        </button>
        <button type="button" className="ficha-letter__btn" onClick={() => { setTexto(null); setAviso(''); }}>
          Cerrar
        </button>
      </div>
      {aviso && <p className="ficha-letter__aviso" role="status">{aviso}</p>}
    </section>
  );
}
