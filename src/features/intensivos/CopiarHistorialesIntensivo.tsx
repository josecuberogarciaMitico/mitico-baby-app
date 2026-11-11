import React from 'react';

// 11/11: copia el historial de todos los niños del intensivo de una vez, para
// pegarlo en la página «Evaluaciones del Intensivo» (claude.ai), que redacta
// los informes para las familias.

export function CopiarHistorialesIntensivo(props: { total: number; texto: () => string; estilo: React.CSSProperties }) {
  const [aviso, setAviso] = React.useState('');
  const [texto, setTexto] = React.useState('');

  async function copiar() {
    const t = props.texto();
    try {
      await navigator.clipboard.writeText(t);
      setTexto('');
      setAviso(`Copiado el historial de ${props.total} niño${props.total === 1 ? '' : 's'}. Pégalo en «Evaluaciones del Intensivo».`);
    } catch {
      // Sin permiso de portapapeles: se muestra para copiarlo a mano.
      setTexto(t);
      setAviso('No he podido copiarlo solo: selecciona el texto de abajo y cópialo.');
    }
    window.setTimeout(() => setAviso(''), 8000);
  }

  return (
    <>
      <button type="button" onClick={() => void copiar()} disabled={!props.total} style={props.estilo}>
        📋 Copiar historial de todos ({props.total})
      </button>
      {aviso && <span style={{ flexBasis: '100%', fontSize: 13, fontWeight: 700, color: '#0f766e' }}>{aviso}</span>}
      {texto && (
        <textarea
          readOnly
          value={texto}
          onFocus={(e) => e.currentTarget.select()}
          style={{ flexBasis: '100%', minHeight: 160, fontSize: 12, padding: 8, borderRadius: 8, border: '1px solid #cbd5e1' }}
        />
      )}
    </>
  );
}
