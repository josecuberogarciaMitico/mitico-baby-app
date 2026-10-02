import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { formatoGrabacion, transcribirNotaDeVoz } from '../../services/transcription/transcriptionService';
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
  onstart?: (() => void) | null;
  onaudiostart?: (() => void) | null;
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

// Solo un dictado a la vez: mientras uno escucha, los demás botones «Dictar» se
// desactivan (no se toca la grabación; solo se evita pulsar dos a la vez).
let dictadosEscuchando = 0;
const avisos = new Set<() => void>();
function cambiarDictadosEscuchando(delta: number) {
  dictadosEscuchando = Math.max(0, dictadosEscuchando + delta);
  avisos.forEach((fn) => fn());
}
function useHayOtroDictado(propio: boolean): boolean {
  const total = useSyncExternalStore(
    (fn) => {
      avisos.add(fn);
      return () => avisos.delete(fn);
    },
    () => dictadosEscuchando,
    () => 0
  );
  return total - (propio ? 1 : 0) > 0;
}

/**
 * iPhone/iPad con la app instalada en la pantalla de inicio: Apple no deja que
 * el dictado del navegador use el micrófono (empieza pero nunca escucha). Ahí el
 * botón abre el teclado en el campo para usar su micrófono, que sí funciona.
 */
function esIphoneAppInstalada(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  const esIOS =
    /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/i.test(ua) && (navigator.maxTouchPoints || 0) > 1);
  const instalada =
    (navigator as Navigator & { standalone?: boolean }).standalone === true ||
    (typeof window.matchMedia === 'function' && window.matchMedia('(display-mode: standalone)').matches);
  return esIOS && instalada;
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
  const botonRef = useRef<HTMLButtonElement | null>(null);
  // Vigilancia: si el micrófono no llega a arrancar, o si tras «Parar» el móvil
  // no avisa del final, se libera el botón y se ofrece el micro del teclado.
  const vigilanciaRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pasosRef = useRef<string[]>([]);
  const baseRef = useRef('');
  const onChangeRef = useRef(props.onChange);
  const onListeningRef = useRef(props.onListeningChange);
  onChangeRef.current = props.onChange;
  onListeningRef.current = props.onListeningChange;

  const Recognition = speechRecognitionConstructor();

  useEffect(() => {
    onListeningRef.current?.(listening);
    if (!listening) return;
    cambiarDictadosEscuchando(1);
    return () => cambiarDictadosEscuchando(-1);
  }, [listening]);
  const hayOtroDictado = useHayOtroDictado(listening);

  useEffect(
    () => () => {
      // Si se cierra el reporte mientras se dicta, se corta el micrófono.
      if (vigilanciaRef.current) clearTimeout(vigilanciaRef.current);
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      // Deja el campo editable aunque se cierre en mitad del dictado.
      onListeningRef.current?.(false);
    },
    []
  );

  // iPhone con la app instalada (donde el dictado del navegador no oye) o
  // navegadores sin dictado: se graba la voz y se transcribe en el servidor (Groq).
  if (esIphoneAppInstalada() || !Recognition) {
    return formatoGrabacion() ? <GrabadorNotaVoz {...props} /> : null;
  }

  if (!Recognition) return null;

  function limpiarVigilancia() {
    if (vigilanciaRef.current) clearTimeout(vigilanciaRef.current);
    vigilanciaRef.current = null;
  }

  /** Libera el botón y el campo aunque el navegador no haya avisado. */
  function liberar(recognition: SpeechRecognitionLike, mensaje: string) {
    if (recognitionRef.current !== recognition) return;
    limpiarVigilancia();
    recognition.onresult = null;
    recognition.onerror = null;
    recognition.onend = null;
    try {
      recognition.abort();
    } catch {
      /* ya estaba cerrado */
    }
    recognitionRef.current = null;
    setListening(false);
    setMessage(mensaje);
    console.warn('[Dictado] liberado sin respuesta del navegador. Pasos:', pasosRef.current.join(' > '));
    // Deja el cursor en el campo para poder usar el micrófono del teclado.
    const campo = botonRef.current
      ?.closest('.report-focus-note, label')
      ?.querySelector('textarea') as HTMLTextAreaElement | null;
    campo?.focus();
  }

  function start() {
    if (!Recognition || recognitionRef.current) return;
    setMessage('');
    baseRef.current = props.value;

    const recognition = new Recognition();
    recognition.lang = 'es-ES';
    recognition.continuous = true;
    recognition.interimResults = true;

    pasosRef.current = ['inicio'];
    recognition.onstart = () => pasosRef.current.push('start');
    recognition.onaudiostart = () => {
      pasosRef.current.push('audio');
      limpiarVigilancia();
    };

    recognition.onresult = (event) => {
      limpiarVigilancia();
      if (!pasosRef.current.includes('texto')) pasosRef.current.push('texto');
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
      pasosRef.current.push(`error:${event.error}`);
      const texto = dictationErrorMessage(event.error);
      if (texto) setMessage(`${texto} (${event.error})`);
    };

    recognition.onend = () => {
      limpiarVigilancia();
      recognitionRef.current = null;
      setListening(false);
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setListening(true);
      // Si en 5 s no arranca el micrófono ni llega texto, no se deja colgado.
      vigilanciaRef.current = setTimeout(
        () =>
          liberar(
            recognition,
            'Este móvil no ha empezado a escuchar. Pulsa el micrófono del teclado para dictar.'
          ),
        5000
      );
    } catch {
      recognitionRef.current = null;
      setListening(false);
      setMessage(dictationErrorMessage('start-failed'));
    }
  }

  function stop() {
    const recognition = recognitionRef.current;
    if (!recognition) return;
    limpiarVigilancia();
    try {
      recognition.stop();
    } catch {
      /* se libera abajo */
    }
    // Si el móvil no avisa del final en 1,5 s, se libera igualmente.
    vigilanciaRef.current = setTimeout(() => liberar(recognition, ''), 1500);
  }

  return (
    <div className="trainer-report-dictation">
      <button
        type="button"
        ref={botonRef}
        className={`trainer-report-dictation__button${listening ? ' is-listening' : ''}`}
        onClick={listening ? stop : start}
        disabled={(props.disabled || hayOtroDictado) && !listening}
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
          ? 'Escuchando… Habla y pulsa «Parar dictado» al terminar.'
          : message || 'Habla y se escribe aquí. Puedes corregirlo antes de guardar.'}
      </span>
    </div>
  );
}

const MAXIMO_GRABACION_MS = 90000;

/**
 * Botón Dictar por grabación: pulsas, hablas, pulsas «Parar» y en un par de
 * segundos aparece el texto (Edge Function mitico-transcribir → Groq, gratis).
 */
function GrabadorNotaVoz(props: {
  value: string;
  maxLength: number;
  onChange: (value: string) => void;
  onListeningChange?: (listening: boolean) => void;
  disabled?: boolean;
}) {
  const [estado, setEstado] = useState<'listo' | 'grabando' | 'transcribiendo'>('listo');
  const [message, setMessage] = useState('');
  const grabadorRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const trozosRef = useRef<Blob[]>([]);
  const baseRef = useRef('');
  const limiteRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const montadoRef = useRef(true);
  const onChangeRef = useRef(props.onChange);
  const onListeningRef = useRef(props.onListeningChange);
  onChangeRef.current = props.onChange;
  onListeningRef.current = props.onListeningChange;
  const ocupado = estado !== 'listo';

  useEffect(() => {
    onListeningRef.current?.(ocupado);
    if (!ocupado) return;
    cambiarDictadosEscuchando(1);
    return () => cambiarDictadosEscuchando(-1);
  }, [ocupado]);
  const hayOtroDictado = useHayOtroDictado(ocupado);

  function soltarMicrofono() {
    if (limiteRef.current) clearTimeout(limiteRef.current);
    limiteRef.current = null;
    // Importante en iPhone: cerrar el micrófono del todo para poder volver a grabar.
    streamRef.current?.getTracks().forEach((pista) => pista.stop());
    streamRef.current = null;
  }

  useEffect(() => {
    montadoRef.current = true;
    return () => {
      montadoRef.current = false;
      const grabador = grabadorRef.current;
      if (grabador) {
        grabador.ondataavailable = null;
        grabador.onstop = null;
        if (grabador.state !== 'inactive') {
          try {
            grabador.stop();
          } catch {
            /* ya parado */
          }
        }
      }
      grabadorRef.current = null;
      soltarMicrofono();
      onListeningRef.current?.(false);
    };
  }, []);

  async function empezar() {
    const formato = formatoGrabacion();
    if (!formato || ocupado) return;
    setMessage('');
    baseRef.current = props.value;
    trozosRef.current = [];
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
      });
    } catch (error) {
      const nombre = (error as { name?: string })?.name || '';
      setMessage(
        nombre === 'NotAllowedError'
          ? 'El iPhone no deja usar el micrófono. Ajustes → Mítico/Safari → Micrófono: Permitir. (NotAllowedError)'
          : `No se puede abrir el micrófono. (${nombre || 'error'})`
      );
      return;
    }
    if (!montadoRef.current) {
      stream.getTracks().forEach((pista) => pista.stop());
      return;
    }
    streamRef.current = stream;
    let grabador: MediaRecorder;
    try {
      grabador = new MediaRecorder(stream, { mimeType: formato.mimeType });
    } catch {
      grabador = new MediaRecorder(stream);
    }
    grabadorRef.current = grabador;
    grabador.ondataavailable = (evento) => {
      if (evento.data && evento.data.size > 0) trozosRef.current.push(evento.data);
    };
    grabador.onstop = () => {
      soltarMicrofono();
      grabadorRef.current = null;
      const tipo = grabador.mimeType || formato.mimeType;
      const audio = new Blob(trozosRef.current, { type: tipo });
      trozosRef.current = [];
      void transcribir(audio, tipo.includes('mp4') ? 'm4a' : formato.extension);
    };
    grabador.start();
    setEstado('grabando');
    limiteRef.current = setTimeout(parar, MAXIMO_GRABACION_MS);
  }

  function parar() {
    const grabador = grabadorRef.current;
    if (!grabador || grabador.state === 'inactive') return;
    setEstado('transcribiendo');
    try {
      grabador.stop();
    } catch {
      soltarMicrofono();
      setEstado('listo');
    }
  }

  async function transcribir(audio: Blob, extension: string) {
    if (!montadoRef.current) return;
    if (audio.size < 1500) {
      setEstado('listo');
      setMessage('No se ha oído nada. Pulsa Dictar y habla cerca del móvil.');
      return;
    }
    setEstado('transcribiendo');
    try {
      const texto = await transcribirNotaDeVoz(audio, `nota.${extension}`);
      if (!montadoRef.current) return;
      if (!texto) {
        setMessage('No se ha entendido nada. Prueba otra vez.');
      } else {
        const unido = appendDictation(baseRef.current, texto, props.maxLength);
        onChangeRef.current(unido.text);
        setMessage(unido.truncated ? `Se ha llegado al máximo de ${props.maxLength} caracteres.` : '');
      }
    } catch (error) {
      if (montadoRef.current) setMessage(error instanceof Error ? error.message : 'No se ha podido transcribir.');
    } finally {
      if (montadoRef.current) setEstado('listo');
    }
  }

  const grabando = estado === 'grabando';
  return (
    <div className="trainer-report-dictation">
      <button
        type="button"
        className={`trainer-report-dictation__button${grabando ? ' is-listening' : ''}`}
        onClick={grabando ? parar : () => void empezar()}
        disabled={estado === 'transcribiendo' || ((props.disabled || hayOtroDictado) && !grabando)}
        aria-pressed={grabando}
      >
        <span className="trainer-report-dictation__icon" aria-hidden="true">
          {grabando ? (
            <svg viewBox="0 0 24 24" width="20" height="20"><rect x="6" y="6" width="12" height="12" rx="2" fill="currentColor" /></svg>
          ) : (
            <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="3" width="6" height="11" rx="3" />
              <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
            </svg>
          )}
        </span>
        {grabando ? 'Parar y escribir' : estado === 'transcribiendo' ? 'Escribiendo…' : 'Dictar'}
      </button>
      <span className="trainer-report-dictation__hint" role="status">
        {grabando
          ? 'Grabando… Habla y pulsa «Parar y escribir» al terminar.'
          : estado === 'transcribiendo'
            ? 'Pasando tu voz a texto…'
            : message || 'Habla y se escribe aquí. Puedes corregirlo antes de guardar.'}
      </span>
    </div>
  );
}
