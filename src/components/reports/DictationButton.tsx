import { useEffect, useRef, useState } from 'react';
import {
  appendDictation,
  dictationErrorMessage,
} from '../../core/reports/dictation';

/*
 * Botón "Dictar" para la observación del reporte.
 *
 * Usa el reconocimiento de voz del propio navegador (Web Speech API): no hay
 * coste, no se guarda audio y no se toca Supabase. Solo cambia el texto del
 * campo, que el entrenador puede corregir antes de guardar.
 * Si el navegador no lo admite, el botón no se muestra y el campo sigue
 * funcionando igual que antes (teclado y micro del teclado).
 */

type SpeechAlternativeLike = { transcript: string };
type SpeechResultLike = { isFinal: boolean; 0: SpeechAlternativeLike };
type SpeechResultListLike = { length: number; [index: number]: SpeechResultLike };
type SpeechResultEventLike = { results: SpeechResultListLike };
type SpeechErrorEventLike = { error: string };

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: SpeechResultEventLike) => void) | null;
  onerror: ((event: SpeechErrorEventLike) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
};

type SpeechRecognitionConstructor = new () => SpeechRecognitionLike;

function speechRecognitionConstructor(): SpeechRecognitionConstructor | null {
  if (typeof window === 'undefined') return null;
  const w = window as unknown as {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  };
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

export function DictationButton(props: {
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
  onListeningChange?: (listening: boolean) => void;
  disabled?: boolean;
}) {
  const [listening, setListening] = useState(false);
  const [message, setMessage] = useState('');
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const baseRef = useRef('');
  const onChangeRef = useRef(props.onChange);
  const onListeningRef = useRef(props.onListeningChange);
  onChangeRef.current = props.onChange;
  onListeningRef.current = props.onListeningChange;

  const Recognition = speechRecognitionConstructor();

  useEffect(() => {
    onListeningRef.current?.(listening);
  }, [listening]);

  useEffect(
    () => () => {
      // Si se cierra el reporte mientras se dicta, se corta el micrófono.
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      // Deja el campo editable aunque se cierre en mitad del dictado.
      onListeningRef.current?.(false);
    },
    []
  );

  if (!Recognition) return null;

  function start() {
    if (!Recognition || recognitionRef.current) return;
    setMessage('');
    baseRef.current = props.value;

    const recognition = new Recognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      const finales: string[] = [];
      const provisionales: string[] = [];
      for (let i = 0; i < event.results.length; i += 1) {
        const result = event.results[i];
        const texto = result?.[0]?.transcript || '';
        if (result?.isFinal) finales.push(texto);
        else provisionales.push(texto);
      }
      const merged = appendDictation(
        baseRef.current,
        [...finales, ...provisionales].join(' '),
        props.maxLength
      );
      onChangeRef.current(merged.text);
      if (merged.truncated) {
        setMessage(`Se ha llegado al máximo de ${props.maxLength} caracteres.`);
        recognition.stop();
      }
    };

    recognition.onerror = (event) => {
      const texto = dictationErrorMessage(event.error);
      if (texto) setMessage(texto);
    };

    recognition.onend = () => {
      recognitionRef.current = null;
      setListening(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setMessage(dictationErrorMessage('start-failed'));
    }
  }

  function stop() {
    recognitionRef.current?.stop();
  }

  return (
    <div className="trainer-report-dictation">
      <button
        type="button"
        className={`trainer-report-dictation__button${listening ? ' is-listening' : ''}`}
        onClick={listening ? stop : start}
        disabled={props.disabled && !listening}
        aria-pressed={listening}
      >
        <span className="trainer-report-dictation__dot" aria-hidden="true" />
        {listening ? 'Parar dictado' : 'Dictar'}
      </button>
      <span className="trainer-report-dictation__hint" role="status">
        {listening
          ? 'Escuchando… Habla y pulsa «Parar dictado» al terminar.'
          : message || 'Habla y se escribe aquí. Puedes corregirlo antes de guardar.'}
      </span>
    </div>
  );
}
