import React from 'react';
import { useAvisoPlegado } from './avisoPlegable';

// 11/11: el mensaje de Paco al cargar AimHarder, recogido en una línea:
// título + resumen; el detalle se abre con «Ver detalle» y ✕ lo quita
// (vuelve si llega un mensaje distinto).

function clave(texto: string) {
  let h = 0;
  for (let i = 0; i < texto.length; i += 1) h = (h * 31 + texto.charCodeAt(i)) | 0;
  return `paco:${h}`;
}

function contarNombres(linea: string) {
  const tras = linea.split(':').slice(1).join(':');
  return tras ? tras.split(',').map((x) => x.trim()).filter(Boolean).length : 0;
}

export function PacoAimHarderResumen({ mensaje }: { mensaje: string }) {
  const [abierto, setAbierto] = React.useState(false);
  const [oculto, setOculto] = useAvisoPlegado(clave(mensaje));
  if (!mensaje || oculto) return null;
  const lineas = mensaje.split('\n').map((l) => l.trim()).filter(Boolean);
  const titulo = lineas[0] || 'Paco · AimHarder';
  const nuevos = lineas.filter((l) => /pendientes de colocar/i.test(l)).reduce((n, l) => n + contarNombres(l), 0);
  const revisar = lineas.filter((l) => /no me salen en aimharder|revísalos/i.test(l)).reduce((n, l) => n + contarNombres(l), 0);
  const resumen = [nuevos ? `${nuevos} nuevo${nuevos === 1 ? '' : 's'} por colocar` : '', revisar ? `${revisar} a revisar` : '']
    .filter(Boolean)
    .join(' · ');

  return (
    <div style={{ display: 'grid', gap: 6, padding: '8px 10px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#14532d', fontSize: 13 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ flex: '1 1 220px', minWidth: 0 }}>
          🤖 {titulo}
          {resumen && <span style={{ fontWeight: 700, color: '#166534' }}> · {resumen}</span>}
        </strong>
        {lineas.length > 1 && (
          <button
            type="button"
            onClick={() => setAbierto((x) => !x)}
            style={{ minHeight: 28, padding: '3px 10px', borderRadius: 8, border: '1px solid #86efac', background: '#fff', color: '#166534', fontWeight: 700, fontSize: 12, cursor: 'pointer' }}
          >
            {abierto ? 'Plegar' : 'Ver detalle'}
          </button>
        )}
        <button
          type="button"
          aria-label="Quitar este mensaje"
          title="Quitar este mensaje"
          onClick={() => setOculto(true)}
          style={{ minHeight: 28, minWidth: 28, borderRadius: 8, border: '1px solid #bbf7d0', background: 'transparent', color: '#166534', fontWeight: 800, cursor: 'pointer' }}
        >
          ✕
        </button>
      </div>
      {abierto && <div style={{ whiteSpace: 'pre-line', lineHeight: 1.45, color: '#166534' }}>{lineas.slice(1).join('\n')}</div>}
    </div>
  );
}
