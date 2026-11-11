import React from 'react';

// 11/11: los avisos de Entrenamientos se pueden ocultar y quedan como una
// pastilla pequeña para volver a abrirlos cuando se quiera. Se recuerda en
// este dispositivo. La clave incluye lo que enseña el aviso: si cambia (un
// niño nuevo, otro día...), el aviso vuelve a abrirse solo.

function leer(clave: string): string | null {
  try {
    return window.localStorage.getItem(`mitico_aviso_${clave}`);
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: string) {
  try {
    window.localStorage.setItem(`mitico_aviso_${clave}`, valor);
  } catch {
    /* sin almacenamiento: solo dura mientras la pantalla esté abierta */
  }
}

/** [oculto, cambiar]. Si nunca se ha tocado, manda `ocultoPorDefecto`. */
export function useAvisoPlegado(clave: string, ocultoPorDefecto = false): [boolean, (oculto: boolean) => void] {
  const [, refrescar] = React.useReducer((x: number) => x + 1, 0);
  const guardado = leer(clave);
  const oculto = guardado === null ? ocultoPorDefecto : guardado === 'oculto';
  return [
    oculto,
    (valor: boolean) => {
      escribir(clave, valor ? 'oculto' : 'abierto');
      refrescar();
    },
  ];
}

export const botonOcultarAviso: React.CSSProperties = {
  minHeight: 30,
  padding: '4px 10px',
  borderRadius: 9,
  border: '1px solid #cbd5e1',
  background: 'transparent',
  color: 'inherit',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

/** El aviso plegado: una pastilla que lo vuelve a abrir. */
export function PastillaAviso(props: { texto: string; color: string; fondo: string; onAbrir: () => void }) {
  return (
    <button
      type="button"
      onClick={props.onAbrir}
      title="Volver a abrir este aviso"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        minHeight: 30,
        padding: '4px 12px',
        borderRadius: 999,
        border: `1px solid ${props.color}`,
        background: props.fondo,
        color: props.color,
        fontSize: 12.5,
        fontWeight: 800,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}
    >
      {props.texto} ▸
    </button>
  );
}
