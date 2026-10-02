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

// Solo puede haber un dictado activo a la vez (el móvil solo tiene un micrófono
// y el navegador no admite dos reconocimientos simultáneos). Si se empieza otro,
// el anterior se corta y se deja limpio.
let dictadoActivo: { dueno: object; cancelar: () => void } | null = null;

function esMovil(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent || '');
}

// Si el navegador no avisa de que ha terminado tras «Parar», se corta igualmente.
const ESPERA_TRAS_PARAR_MS = 1500;
// Nunca más de 2 minutos escuchando sin parar.
const MAXIMO_ESCUCHANDO_MS = 120000;
// Las palabras provisionales se pasan al campo como mucho 4 veces por segundo
// (cada cambio redibuja la pantalla del reporte; en el móvil la bloqueaba).
const INTERVALO_PROVISIONAL_MS = 250;

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
  const pendienteRef = useRef<string | null>(null);
  const temporizadorTextoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const temporizadorPararRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const temporizadorMaximoRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const montadoRef = useRef(true);
  const duenoRef = useRef({});
  const onChangeRef = useRef(props.onChange);
  const onListeningRef = useRef(props.onListeningChange);
  onChangeRef.current = props.onChange;
  onListeningRef.current = props.onListeningChange;

  const Recognition = speechRecognitionConstructor();
  const movil = esMovil();

  useEffect(() => {
    onListeningRef.current?.(listening);
  }, [listening]);

  function volcarTexto() {
    if (temporizadorTextoRef.current) {
      clearTimeout(temporizadorTextoRef.current);
      temporizadorTextoRef.current = null;
    }
    if (pendienteRef.current !== null && montadoRef.current) {
      onChangeRef.current(pendienteRef.current);
    }
    pendienteRef.current = null;
  }

  function limpiarTemporizadores() {
    if (temporizadorPararRef.current) clearTimeout(temporizadorPararRef.current);
    if (temporizadorMaximoRef.current) clearTimeout(temporizadorMaximoRef.current);
    temporizadorPararRef.current = null;
    temporizadorMaximoRef.current = null;
  }

  /** Deja todo como antes de dictar: sin micrófono, campo editable, botón «Dictar». */
  function terminar(recognition: SpeechRecognitionLike | null, cortar: boolean) {
    if (recognition && recognitionRef.current !== recognition) return;
    limpiarTemporizadores();
    volcarTexto();
    if (recognition) {
      recognition.onresult = null;
      recognition.onerror = null;
      recognition.onend = null;
      if (cortar) {
        try {
          recognition.abort();
        } catch {
          /* el navegador ya lo había cerrado */
        }
      }
    }
    recognitionRef.current = null;
    if (dictadoActivo?.dueno === duenoRef.current) dictadoActivo = null;
    if (montadoRef.current) setListening(false);
  }

  function cancelarEste() {
    terminar(recognitionRef.current, true);
  }

  useEffect(
    () => {
      montadoRef.current = true;
      return () => {
        // Si se cierra el reporte mientras se dicta, se corta el micrófono.
        const recognition = recognitionRef.current;
        limpiarTemporizadores();
        if (temporizadorTextoRef.current) clearTimeout(temporizadorTextoRef.current);
        if (recognition) {
          recognition.onresult = null;
          recognition.onerror = null;
          recognition.onend = null;
          try {
            recognition.abort();
          } catch {
            /* ya cerrado */
          }
        }
        recognitionRef.current = null;
        if (dictadoActivo?.dueno === duenoRef.current) dictadoActivo = null;
        montadoRef.current = false;
        // Deja el campo editable aunque se cierre en mitad del dictado.
        onListeningRef.current?.(false);
      };
    },
    []
  );

  if (!Recognition) return null;

  function start() {
    if (!Recognition || recognitionRef.current) return;
    // Si había otro dictado abierto (otra habilidad u observación), se corta.
    if (dictadoActivo && dictadoActivo.dueno !== duenoRef.current) dictadoActivo.cancelar();
    setMessage('');
    baseRef.current = props.value;
    pendienteRef.current = null;

    const recognition = new Recognition();
    recognition.lang = 'es-ES';
    // En el móvil el modo continuo falla (repite texto o no termina nunca):
    // allí se dicta frase a frase y se para solo al dejar de hablar.
    recognition.continuous = !movil;
    recognition.interimResults = true;

    recognition.onresult = (event) => {
      if (recognitionRef.current !== recognition) return;
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
      pendienteRef.current = merged.text;
      if (provisionales.length === 0) {
        volcarTexto();
      } else if (!temporizadorTextoRef.current) {
        temporizadorTextoRef.current = setTimeout(volcarTexto, INTERVALO_PROVISIONAL_MS);
      }
      if (merged.truncated) {
        setMessage(`Se ha llegado al máximo de ${props.maxLength} caracteres.`);
        stop();
      }
    };

    recognition.onerror = (event) => {
      const texto = dictationErrorMessage(event.error);
      if (texto && montadoRef.current) setMessage(texto);
      // Algunos móviles no avisan del final tras un error: se cierra aquí.
      if (event.error && event.error !== 'no-speech') terminar(recognition, true);
    };

    recognition.onend = () => terminar(recognition, false);

    try {
      recognition.start();
      recognitionRef.current = recognition;
      dictadoActivo = { dueno: duenoRef.current, cancelar: cancelarEste };
      setListening(true);
      temporizadorMaximoRef.current = setTimeout(() => stop(), MAXIMO_ESCUCHANDO_MS);
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setMessage(dictationErrorMessage('start-failed'));
    }
  }

  function stop() {
    const recognition = recognitionRef.current;
    if (!recognition) {
      setListening(false);
      return;
    }
    try {
      recognition.stop();
    } catch {
      terminar(recognition, true);
      return;
    }
    // Si el navegador no avisa de que ha terminado (pasa en iPhone), se corta igual.
    if (temporizadorPararRef.current) clearTimeout(temporizadorPararRef.current);
    temporizadorPararRef.current = setTimeout(() => terminar(recognition, true), ESPERA_TRAS_PARAR_MS);
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
        <span className="trainer-report-dictation__icon" aria-hidden="true">
          {listening ? (
            <svg viewBox="0 0 24 24" width="20" height="20"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          )}
        </span>
        {listening ? 'Parar dictado' : 'Dictar'}
      </button>
      <span className="trainer-report-dictation__hint" role="status">
        {listening
          ? movil
            ? 'Escuchando… Habla; se para solo al terminar la frase.'
            : 'Escuchando… Habla y pulsa «Parar dictado» al terminar.'
          : message || 'Habla y se escribe aquí. Puedes corregirlo antes de guardar.'}
      </span>
    </div>
  );
}
