/**
 * Dictado por voz de la observación del reporte.
 *
 * Lógica pura (sin navegador) para que pueda probarse en los tests de core:
 * une el texto que ya había escrito el entrenador con lo dictado y respeta el
 * límite de caracteres del campo. El reconocimiento de voz vive en
 * `src/components/reports/DictationButton.tsx`.
 */

export type DictationMerge = {
  text: string;
  truncated: boolean;
};

function limpiarEspacios(value: string): string {
  return value.replace(/\s+/g, ' ').trim();
}

function empiezaFrase(base: string): boolean {
  return base === '' || /[.!?¡¿]\s*$/.test(base);
}

/**
 * Devuelve `base` + `dictated` separados por un espacio, sin espacios dobles
 * y cortado a `maxLength`. Si lo dictado empieza una frase, se pone la
 * primera letra en mayúscula.
 */
export function appendDictation(
  base: string,
  dictated: string,
  maxLength: number
): DictationMerge {
  const inicio = String(base || '').replace(/\s+$/, '');
  let dictado = limpiarEspacios(String(dictated || ''));

  if (!dictado) {
    const sinCambios = inicio.slice(0, maxLength);
    return { text: sinCambios, truncated: sinCambios.length < inicio.length };
  }

  if (empiezaFrase(inicio)) {
    dictado = dictado.charAt(0).toLocaleUpperCase('es-ES') + dictado.slice(1);
  }

  const unido = inicio ? `${inicio} ${dictado}` : dictado;
  if (unido.length <= maxLength) return { text: unido, truncated: false };
  return { text: unido.slice(0, maxLength), truncated: true };
}

export type DictationErrorCode =
  | 'not-allowed'
  | 'service-not-allowed'
  | 'no-speech'
  | 'audio-capture'
  | 'network'
  | 'aborted'
  | string;

/** Mensaje claro para el entrenador según el error del reconocimiento. */
export function dictationErrorMessage(code: DictationErrorCode): string {
  if (code === 'not-allowed' || code === 'service-not-allowed') {
    return 'El móvil no ha dado permiso al micrófono. Actívalo en los ajustes del navegador o escribe la observación.';
  }
  if (code === 'no-speech') return 'No se ha oído nada. Vuelve a pulsar «Dictar» y habla cerca del móvil.';
  if (code === 'audio-capture') return 'No se encuentra el micrófono del móvil.';
  if (code === 'network') return 'El dictado necesita conexión a internet. Escribe la observación o prueba de nuevo.';
  if (code === 'aborted') return '';
  return 'No se ha podido dictar. Escribe la observación o prueba de nuevo.';
}
