import { useCallback, useEffect, useRef, useState } from 'react';
import {
  continuarPaco,
  pedirSesionVozPaco,
  preguntarPaco,
  type PacoChoice,
  type PacoContinuation,
} from '../lib/pacoClient';
import './PacoVoz.css';

// ---------------------------------------------------------------------------
// Llamada de voz con Paco (conversacion en tiempo real con Gemini Live).
//
// Como funciona:
//  1. Al pulsar "Empezar", se pide a Supabase (mitico-paco-live-token) una
//     clave TEMPORAL de un solo uso. La clave real de Gemini no sale de Supabase.
//  2. El navegador abre un canal directo con Gemini Live: envia tu voz (PCM 16 kHz)
//     y recibe la voz de Paco (PCM 24 kHz).
//  3. Cuando necesitas datos de Mitico, Gemini llama a la herramienta
//     "consultar_mitico", que reutiliza el Paco de siempre (preguntarPaco).
//     Asi no se duplica logica y las acciones de Secretaria siguen pidiendo
//     confirmacion con botones en pantalla.
//
// Limite de Google: una sesion solo de audio dura 15 minutos como maximo.
// ---------------------------------------------------------------------------

type EstadoVoz =
  | 'inactivo'
  | 'conectando'
  | 'escuchando'
  | 'pensando'
  | 'hablando'
  | 'error';

type Props = {
  onCerrar: () => void;
  onTurno?: (autor: 'usuario' | 'paco', texto: string) => void;
};

const RATE_ENTRADA = 16000;
const RATE_SALIDA = 24000;
const NUM_BARRAS = 48;
const ONDA_A = 'M20 140 q10 -16 20 0' + ' t20 0'.repeat(13);
const ONDA_B = 'M20 140 q10 12 20 0' + ' t20 0'.repeat(13);

const ETIQUETAS: Record<EstadoVoz, string> = {
  inactivo: 'Listo para hablar',
  conectando: 'Conectando con Paco\u2026',
  escuchando: 'Te escucho',
  pensando: 'Revisando M\u00edtico\u2026',
  hablando: 'Paco habla',
  error: 'Algo ha fallado',
};

const CODIGO_WORKLET = `
class PacoCaptura extends AudioWorkletProcessor {
  process(inputs) {
    const canal = inputs[0] && inputs[0][0];
    if (canal && canal.length) this.port.postMessage(canal.slice(0));
    return true;
  }
}
registerProcessor('paco-captura', PacoCaptura);
`;

// ---------------------------------------------------------------------------
// Cliente minimo de Gemini Live por WebSocket (sin dependencias npm).
// ---------------------------------------------------------------------------

type ParteLive = { inlineData?: { data?: string; mimeType?: string } };

type MensajeLive = {
  setupComplete?: unknown;
  toolCall?: {
    functionCalls?: { id?: string; name?: string; args?: Record<string, unknown> }[];
  };
  serverContent?: {
    interrupted?: boolean;
    turnComplete?: boolean;
    modelTurn?: { parts?: ParteLive[] };
    inputTranscription?: { text?: string };
    outputTranscription?: { text?: string };
  };
};

type SesionLive = {
  enviar: (mensaje: Record<string, unknown>) => void;
  cerrar: () => void;
};

type AjustesLive = {
  token: string;
  model: string;
  voice: string;
  systemInstruction: string;
};

const HOST_LIVE = 'wss://generativelanguage.googleapis.com/ws/';
const SERVICIO_LIVE = 'google.ai.generativelanguage';
// La documentacion indica v1beta para claves temporales; v1alpha queda de respaldo.
const VERSIONES_LIVE = ['v1beta', 'v1alpha'];

const HERRAMIENTA_MITICO = {
  functionDeclarations: [
    {
      name: 'consultar_mitico',
      description:
        'Consulta los datos reales de Mitico Baby (grupos, alumnos, asistencia, reportes, entrenadores, disponibilidad semanal, secretaria de tareas y notas) y devuelve la respuesta de Paco. Usala SIEMPRE que haga falta un dato de Mitico o una accion de Secretaria.',
      parameters: {
        type: 'OBJECT',
        properties: {
          pregunta: {
            type: 'STRING',
            description:
              'La peticion del usuario con sus mismas palabras, incluidas fechas relativas como "manana" o "la semana que viene".',
          },
        },
        required: ['pregunta'],
      },
    },
  ],
};

function textoDeEvento(dato: unknown): Promise<string> {
  if (typeof dato === 'string') return Promise.resolve(dato);
  if (dato instanceof Blob) return dato.text();
  if (dato instanceof ArrayBuffer) return Promise.resolve(new TextDecoder().decode(dato));
  return Promise.resolve('');
}

function abrirLive(
  version: string,
  ajustes: AjustesLive,
  alMensajeLive: (mensaje: MensajeLive) => void,
  alCerrarLive: (detalle: string) => void
): Promise<SesionLive> {
  return new Promise((resolver, rechazar) => {
    const url = `${HOST_LIVE}${SERVICIO_LIVE}.${version}.GenerativeService.BidiGenerateContentConstrained?access_token=${encodeURIComponent(ajustes.token)}`;
    const ws = new WebSocket(url);
    let listo = false;
    let terminado = false;

    const sesion: SesionLive = {
      enviar: (mensaje) => {
        if (ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(mensaje));
      },
      cerrar: () => {
        terminado = true;
        try {
          ws.close();
        } catch {
          // Ya estaba cerrado.
        }
      },
    };

    const plazo = window.setTimeout(() => {
      if (listo) return;
      terminado = true;
      try {
        ws.close();
      } catch {
        // Ignorado.
      }
      rechazar(new Error(`Tiempo agotado conectando con la voz (${version}).`));
    }, 12000);

    ws.onopen = () => {
      const modelo = ajustes.model.startsWith('models/') ? ajustes.model : `models/${ajustes.model}`;
      const setup: Record<string, unknown> = {
        model: modelo,
        generationConfig: {
          responseModalities: ['AUDIO'],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: ajustes.voice || 'Kore' } },
          },
        },
        inputAudioTranscription: {},
        outputAudioTranscription: {},
        tools: [HERRAMIENTA_MITICO],
      };
      if (ajustes.systemInstruction) {
        setup.systemInstruction = { parts: [{ text: ajustes.systemInstruction }] };
      }
      ws.send(JSON.stringify({ setup }));
    };

    ws.onmessage = (evento) => {
      void textoDeEvento(evento.data).then((texto) => {
        if (!texto) return;
        let mensaje: MensajeLive;
        try {
          mensaje = JSON.parse(texto) as MensajeLive;
        } catch {
          return;
        }
        if (!listo) {
          if (mensaje.setupComplete !== undefined) {
            listo = true;
            window.clearTimeout(plazo);
            resolver(sesion);
          }
          return;
        }
        alMensajeLive(mensaje);
      });
    };

    ws.onerror = () => {
      // El detalle llega en onclose.
    };

    ws.onclose = (evento) => {
      window.clearTimeout(plazo);
      const detalle = `${evento.code}${evento.reason ? ` ${evento.reason}` : ''}`.trim();
      if (!listo) {
        rechazar(new Error(`La voz no ha podido conectar (${version}: ${detalle || 'sin detalle'}).`));
        return;
      }
      if (!terminado) alCerrarLive(detalle);
    };
  });
}

async function conectarLive(
  ajustes: AjustesLive,
  alMensajeLive: (mensaje: MensajeLive) => void,
  alCerrarLive: (detalle: string) => void
): Promise<SesionLive> {
  const fallos: string[] = [];
  for (const version of VERSIONES_LIVE) {
    try {
      return await abrirLive(version, ajustes, alMensajeLive, alCerrarLive);
    } catch (error) {
      fallos.push(error instanceof Error ? error.message : String(error));
    }
  }
  throw new Error(fallos.join(' | '));
}

function floatAPcm16Base64(muestras: Float32Array, rateEntrada: number) {
  const ratio = rateEntrada / RATE_ENTRADA;
  const largo = Math.floor(muestras.length / ratio);
  const pcm = new Int16Array(largo);
  for (let i = 0; i < largo; i++) {
    const ini = Math.floor(i * ratio);
    const fin = Math.min(muestras.length, Math.floor((i + 1) * ratio));
    let suma = 0;
    let n = 0;
    for (let j = ini; j < fin; j++) {
      suma += muestras[j];
      n++;
    }
    const v = Math.max(-1, Math.min(1, n ? suma / n : 0));
    pcm[i] = v < 0 ? v * 0x8000 : v * 0x7fff;
  }
  const bytes = new Uint8Array(pcm.buffer);
  let binario = '';
  for (let i = 0; i < bytes.length; i += 0x8000) {
    binario += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  }
  return btoa(binario);
}

function base64APcm16Float(b64: string) {
  const binario = atob(b64);
  const bytes = new Uint8Array(binario.length);
  for (let i = 0; i < binario.length; i++) bytes[i] = binario.charCodeAt(i);
  const pcm = new Int16Array(bytes.buffer, 0, Math.floor(bytes.length / 2));
  const salida = new Float32Array(pcm.length);
  for (let i = 0; i < pcm.length; i++) salida[i] = pcm[i] / 0x8000;
  return salida;
}

export function PacoVoz({ onCerrar, onTurno }: Props) {
  const [estado, setEstado] = useState<EstadoVoz>('inactivo');
  const [errorTexto, setErrorTexto] = useState('');
  const [silenciado, setSilenciado] = useState(false);
  const [subtituloUsuario, setSubtituloUsuario] = useState('');
  const [subtituloPaco, setSubtituloPaco] = useState('');
  const [opciones, setOpciones] = useState<PacoChoice[]>([]);
  const [trabajandoOpcion, setTrabajandoOpcion] = useState(false);

  const sesionRef = useRef<SesionLive | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const ctxCapturaRef = useRef<AudioContext | null>(null);
  const ctxSalidaRef = useRef<AudioContext | null>(null);
  const analizadorRef = useRef<AnalyserNode | null>(null);
  const fuentesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const siguienteInicioRef = useRef(0);
  const rafRef = useRef(0);
  const barrasRef = useRef<SVGLineElement[] | null>(null);
  const nivelesRef = useRef<number[]>(new Array(NUM_BARRAS).fill(0));
  const avatarRef = useRef<HTMLDivElement | null>(null);
  const silenciadoRef = useRef(false);
  const cerradoRef = useRef(false);
  const textoUsuarioRef = useRef('');
  const textoPacoRef = useRef('');
  const pendienteRef = useRef<Float32Array>(new Float32Array(0));

  const detenerReproduccion = useCallback(() => {
    for (const fuente of fuentesRef.current) {
      try {
        fuente.onended = null;
        fuente.stop();
      } catch {
        // Ya estaba parada.
      }
    }
    fuentesRef.current.clear();
    siguienteInicioRef.current = 0;
  }, []);

  const limpiar = useCallback(() => {
    cerradoRef.current = true;
    cancelAnimationFrame(rafRef.current);
    detenerReproduccion();
    try {
      sesionRef.current?.cerrar();
    } catch {
      // Sesion ya cerrada.
    }
    sesionRef.current = null;
    streamRef.current?.getTracks().forEach((pista) => pista.stop());
    streamRef.current = null;
    void ctxCapturaRef.current?.close().catch(() => undefined);
    void ctxSalidaRef.current?.close().catch(() => undefined);
    ctxCapturaRef.current = null;
    ctxSalidaRef.current = null;
    analizadorRef.current = null;
    pendienteRef.current = new Float32Array(0);
    avatarRef.current?.style.setProperty('--boca', '0');
    barrasRef.current?.forEach((barra) => barra.style.setProperty('--v', '0'));
    nivelesRef.current = new Array(NUM_BARRAS).fill(0);
  }, [detenerReproduccion]);

  // Al desmontar (cerrar el panel, etc.) se cuelga la llamada.
  useEffect(() => {
    return () => limpiar();
  }, [limpiar]);

  // Boca del avatar: sigue el volumen real de la voz de Paco.
  const animarBoca = useCallback(() => {
    const analizador = analizadorRef.current;
    const raiz = avatarRef.current;
    if (analizador && raiz) {
      const datos = new Uint8Array(analizador.fftSize);
      analizador.getByteTimeDomainData(datos);
      let suma = 0;
      for (let i = 0; i < datos.length; i++) {
        const v = (datos[i] - 128) / 128;
        suma += v * v;
      }
      const nivel = Math.min(1, Math.sqrt(suma / datos.length) * 4);
      raiz.style.setProperty('--boca', nivel.toFixed(2));

      if (!barrasRef.current) {
        barrasRef.current = Array.from(
          raiz.querySelectorAll<SVGLineElement>('.paco-hud__barra')
        );
      }
      const barras = barrasRef.current;
      if (barras.length) {
        const espectro = new Uint8Array(analizador.frequencyBinCount);
        analizador.getByteFrequencyData(espectro);
        const niveles = nivelesRef.current;
        for (let i = 0; i < barras.length; i++) {
          const k = i < barras.length / 2 ? i : barras.length - 1 - i;
          const valor = Math.pow((espectro[1 + Math.floor(k * 1.4)] || 0) / 255, 1.25);
          niveles[i] = niveles[i] * 0.55 + valor * 0.45;
          barras[i].style.setProperty('--v', niveles[i].toFixed(3));
        }
      }
    }
    rafRef.current = requestAnimationFrame(animarBoca);
  }, []);

  const reproducir = useCallback((b64: string) => {
    const ctx = ctxSalidaRef.current;
    const analizador = analizadorRef.current;
    if (!ctx || !analizador) return;
    const muestras = base64APcm16Float(b64);
    if (!muestras.length) return;

    const buffer = ctx.createBuffer(1, muestras.length, RATE_SALIDA);
    buffer.copyToChannel(muestras, 0);
    const fuente = ctx.createBufferSource();
    fuente.buffer = buffer;
    fuente.connect(analizador);

    const inicio = Math.max(siguienteInicioRef.current, ctx.currentTime + 0.03);
    fuente.start(inicio);
    siguienteInicioRef.current = inicio + buffer.duration;

    fuentesRef.current.add(fuente);
    setEstado('hablando');
    fuente.onended = () => {
      fuentesRef.current.delete(fuente);
      if (fuentesRef.current.size === 0 && !cerradoRef.current) {
        setEstado((actual) => (actual === 'hablando' ? 'escuchando' : actual));
      }
    };
  }, []);

  const volcarTurno = useCallback(() => {
    const usuario = textoUsuarioRef.current.trim();
    const paco = textoPacoRef.current.trim();
    if (usuario) onTurno?.('usuario', usuario);
    if (paco) onTurno?.('paco', paco);
    textoUsuarioRef.current = '';
    textoPacoRef.current = '';
  }, [onTurno]);

  const responderHerramienta = useCallback(
    async (id: string | undefined, nombre: string | undefined, pregunta: string) => {
      setEstado('pensando');
      let respuesta: Record<string, unknown>;
      try {
        const resultado = await preguntarPaco(pregunta);
        if (resultado.secretary_changed) {
          window.dispatchEvent(new CustomEvent('mitico:secretaria-updated'));
        }
        const botones = resultado.choices || [];
        setOpciones(botones);
        respuesta = {
          respuesta:
            resultado.answer || resultado.error || 'No he podido preparar una respuesta.',
          hay_botones_en_pantalla: botones.length > 0,
          opciones: botones.map((b) => b.label),
        };
      } catch (error) {
        respuesta = {
          error:
            error instanceof Error && error.message !== 'NO_SESSION'
              ? error.message
              : 'No he podido consultar M\u00edtico ahora mismo.',
        };
      }
      try {
        sesionRef.current?.enviar({
          toolResponse: { functionResponses: [{ id, name: nombre, response: respuesta }] },
        });
      } catch {
        // La llamada se cerro mientras consultaba.
      }
      if (!cerradoRef.current) setEstado('escuchando');
    },
    []
  );

  const alMensaje = useCallback(
    (mensaje: MensajeLive) => {
      const llamadas = mensaje.toolCall?.functionCalls;
      if (llamadas?.length) {
        for (const llamada of llamadas) {
          if (llamada.name === 'consultar_mitico') {
            const pregunta = String(llamada.args?.pregunta || '').trim();
            void responderHerramienta(llamada.id, llamada.name, pregunta);
          } else {
            try {
              sesionRef.current?.enviar({
                toolResponse: {
                  functionResponses: [
                    {
                      id: llamada.id,
                      name: llamada.name,
                      response: { error: 'Herramienta no disponible.' },
                    },
                  ],
                },
              });
            } catch {
              // Ignorado.
            }
          }
        }
      }

      const contenido = mensaje.serverContent;
      if (!contenido) return;

      if (contenido.interrupted) detenerReproduccion();

      for (const parte of contenido.modelTurn?.parts || []) {
        if (parte.inlineData?.data) reproducir(parte.inlineData.data);
      }

      if (contenido.inputTranscription?.text) {
        textoUsuarioRef.current += contenido.inputTranscription.text;
        setSubtituloUsuario(textoUsuarioRef.current.trim());
      }
      if (contenido.outputTranscription?.text) {
        textoPacoRef.current += contenido.outputTranscription.text;
        setSubtituloPaco(textoPacoRef.current.trim());
      }
      if (contenido.turnComplete) volcarTurno();
    },
    [detenerReproduccion, reproducir, responderHerramienta, volcarTurno]
  );

  const empezar = useCallback(async () => {
    if (estado === 'conectando') return;
    limpiar();
    cerradoRef.current = false;
    setErrorTexto('');
    setOpciones([]);
    setSubtituloUsuario('');
    setSubtituloPaco('');
    textoUsuarioRef.current = '';
    textoPacoRef.current = '';
    setEstado('conectando');

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('Este navegador no permite usar el micr\u00f3fono.');
      }

      const preparacion = await pedirSesionVozPaco();
      if (!preparacion.ok || !preparacion.token || !preparacion.model) {
        throw new Error(preparacion.error || 'No se pudo preparar la voz de Paco.');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          channelCount: 1,
        },
      });
      streamRef.current = stream;

      // Salida (voz de Paco) + analizador para mover la boca.
      const ctxSalida = new AudioContext();
      await ctxSalida.resume();
      const analizador = ctxSalida.createAnalyser();
      analizador.fftSize = 512;
      analizador.connect(ctxSalida.destination);
      ctxSalidaRef.current = ctxSalida;
      analizadorRef.current = analizador;

      // Entrada (tu voz).
      const ctxCaptura = new AudioContext();
      await ctxCaptura.resume();
      ctxCapturaRef.current = ctxCaptura;
      const urlWorklet = URL.createObjectURL(
        new Blob([CODIGO_WORKLET], { type: 'application/javascript' })
      );
      await ctxCaptura.audioWorklet.addModule(urlWorklet);
      URL.revokeObjectURL(urlWorklet);

      const sesion = await conectarLive(
        {
          token: preparacion.token,
          model: preparacion.model,
          voice: preparacion.voice || 'Kore',
          systemInstruction: preparacion.systemInstruction || '',
        },
        alMensaje,
        (detalle) => {
          if (cerradoRef.current) return;
          setErrorTexto(
            `La llamada ha terminado${detalle ? ` (${detalle})` : ''}. Google limita cada llamada de voz a 15 minutos. Pulsa para volver a llamar.`
          );
          setEstado('error');
        }
      );
      sesionRef.current = sesion;

      const fuente = ctxCaptura.createMediaStreamSource(stream);
      const nodo = new AudioWorkletNode(ctxCaptura, 'paco-captura');
      const tamanoLote = Math.ceil(ctxCaptura.sampleRate * 0.04);
      nodo.port.onmessage = (evento: MessageEvent<Float32Array>) => {
        if (silenciadoRef.current || cerradoRef.current) return;
        const nuevo = evento.data;
        const previo = pendienteRef.current;
        const junto = new Float32Array(previo.length + nuevo.length);
        junto.set(previo, 0);
        junto.set(nuevo, previo.length);
        if (junto.length < tamanoLote) {
          pendienteRef.current = junto;
          return;
        }
        pendienteRef.current = new Float32Array(0);
        try {
          sesionRef.current?.enviar({
            realtimeInput: {
              audio: {
                data: floatAPcm16Base64(junto, ctxCaptura.sampleRate),
                mimeType: `audio/pcm;rate=${RATE_ENTRADA}`,
              },
            },
          });
        } catch {
          // La sesion se esta cerrando.
        }
      };
      fuente.connect(nodo);

      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(animarBoca);
      setEstado('escuchando');
    } catch (error) {
      limpiar();
      cerradoRef.current = false;
      const status = (error as Error & { status?: number })?.status;
      setErrorTexto(
        status === 401 || status === 403
          ? 'La sesi\u00f3n ha caducado. Vuelve a entrar en la app.'
          : error instanceof Error
            ? error.message
            : 'No se pudo iniciar la llamada.'
      );
      setEstado('error');
    }
  }, [alMensaje, animarBoca, estado, limpiar]);

  const alternarSilencio = () => {
    const nuevo = !silenciadoRef.current;
    silenciadoRef.current = nuevo;
    setSilenciado(nuevo);
    if (nuevo) {
      try {
        sesionRef.current?.enviar({ realtimeInput: { audioStreamEnd: true } });
      } catch {
        // Ignorado.
      }
    }
  };

  const colgar = () => {
    limpiar();
    onCerrar();
  };

  const pulsarOpcion = async (opcion: PacoChoice) => {
    if (trabajandoOpcion) return;
    setTrabajandoOpcion(true);
    setOpciones([]);
    try {
      const resultado = await continuarPaco(opcion.continuation as PacoContinuation);
      if (resultado.secretary_changed) {
        window.dispatchEvent(new CustomEvent('mitico:secretaria-updated'));
      }
      const texto = resultado.answer || resultado.error || 'Hecho.';
      setSubtituloPaco(texto);
      onTurno?.('usuario', opcion.label);
      onTurno?.('paco', texto);
      try {
        sesionRef.current?.enviar({
          realtimeInput: {
            text: `[Pantalla] El usuario ha pulsado el boton "${opcion.label}". Resultado: ${texto}. Cuentaselo brevemente.`,
          },
        });
      } catch {
        // La llamada no esta activa; el resultado queda en pantalla.
      }
    } catch (error) {
      setSubtituloPaco(
        error instanceof Error ? error.message : 'No he podido completar la acci\u00f3n.'
      );
    } finally {
      setTrabajandoOpcion(false);
    }
  };

  const enLlamada =
    estado === 'escuchando' || estado === 'pensando' || estado === 'hablando';

  return (
    <div className={`paco-voz paco-voz--${estado}`} role="dialog" aria-label="Llamada con Paco">
      <div className="paco-voz__cabecera">
        <strong>Llamada con Paco</strong>
        <span>{ETIQUETAS[estado]}</span>
      </div>

      <div className="paco-voz__avatar" ref={avatarRef} aria-hidden="true">
        <svg viewBox="0 0 280 290" className="paco-avatar">
          <defs>
            <radialGradient id="pv-nucleo" cx="50%" cy="45%" r="55%">
              <stop offset="0" className="paco-hud__stop-luz" />
              <stop offset="0.45" className="paco-hud__stop-color" stopOpacity="0.85" />
              <stop offset="1" className="paco-hud__stop-color" stopOpacity="0.15" />
            </radialGradient>
            <radialGradient id="pv-aura" cx="50%" cy="50%" r="50%">
              <stop offset="0.55" className="paco-hud__stop-color" stopOpacity="0.22" />
              <stop offset="1" className="paco-hud__stop-color" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="pv-haz" x1="0" y1="1" x2="0" y2="0">
              <stop offset="0" className="paco-hud__stop-color" stopOpacity="0.4" />
              <stop offset="1" className="paco-hud__stop-color" stopOpacity="0" />
            </linearGradient>
            <clipPath id="pv-orbe">
              <circle cx="140" cy="140" r="43" />
            </clipPath>
          </defs>

          <path className="paco-hud__haz" d="M92 266 L188 266 L232 150 L48 150 Z" />
          <ellipse className="paco-hud__base" cx="140" cy="268" rx="78" ry="11" />
          <ellipse className="paco-hud__base paco-hud__base--b" cx="140" cy="268" rx="52" ry="7" />

          <circle className="paco-hud__aura" cx="140" cy="140" r="136" />

          <path className="paco-hud__esquina" d="M6 34 V6 H34" />
          <path className="paco-hud__esquina" d="M274 34 V6 H246" />

          <g className="paco-hud__giro paco-hud__giro--lento">
            <circle className="paco-hud__ticks" cx="140" cy="140" r="132" />
          </g>
          <g className="paco-hud__giro paco-hud__giro--inverso">
            <circle className="paco-hud__arcos" cx="140" cy="140" r="120" />
          </g>
          <g className="paco-hud__giro paco-hud__giro--rapido">
            <circle className="paco-hud__arco-fino" cx="140" cy="140" r="108" />
          </g>

          <g className="paco-hud__barras">
            {Array.from({ length: NUM_BARRAS }, (_, i) => (
              <g key={i} transform={`rotate(${(i * 360) / NUM_BARRAS} 140 140)`}>
                <line className="paco-hud__barra" x1="140" y1="40" x2="140" y2="76" />
              </g>
            ))}
          </g>

          <g className="paco-hud__giro paco-hud__giro--inverso">
            <circle className="paco-hud__anillo-int" cx="140" cy="140" r="60" />
          </g>

          <g className="paco-hud__nucleo">
            <circle className="paco-hud__cristal" cx="140" cy="140" r="52" />
            <circle className="paco-hud__orbe" cx="140" cy="140" r="43" />
            <g clipPath="url(#pv-orbe)">
              <g className="paco-hud__onda-caja">
                <path className="paco-hud__onda paco-hud__onda--a" d={ONDA_A} />
                <path className="paco-hud__onda paco-hud__onda--b" d={ONDA_B} />
              </g>
              <path className="paco-hud__scan" d="M90 118 H190 M90 162 H190" />
            </g>
            <path className="paco-hud__reflejo" d="M112 114 Q122 100 138 97" />
            <circle className="paco-hud__centro" cx="140" cy="140" r="4" />
          </g>

          <g className="paco-hud__pensando">
            <circle cx="224" cy="54" r="3" />
            <circle cx="236" cy="44" r="4" />
            <circle cx="250" cy="32" r="5" />
          </g>
        </svg>
      </div>

      <div className="paco-voz__subtitulos" aria-live="polite">
        {errorTexto && <p className="paco-voz__error">{errorTexto}</p>}
        {!errorTexto && subtituloUsuario && (
          <p className="paco-voz__usuario">{subtituloUsuario}</p>
        )}
        {!errorTexto && subtituloPaco && <p className="paco-voz__paco">{subtituloPaco}</p>}
        {!errorTexto && !subtituloUsuario && !subtituloPaco && (
          <p className="paco-voz__ayuda">
            {enLlamada
              ? 'Habla con normalidad. Puedes interrumpirle cuando quieras. Con auriculares se oye mejor.'
              : 'Pulsa el bot\u00f3n verde y habla con Paco como en una llamada.'}
          </p>
        )}
      </div>

      {opciones.length > 0 && (
        <div className="paco-voz__opciones">
          {opciones.map((opcion) => (
            <button
              key={opcion.label}
              type="button"
              disabled={trabajandoOpcion}
              onClick={() => void pulsarOpcion(opcion)}
            >
              {opcion.label}
            </button>
          ))}
        </div>
      )}

      <div className="paco-voz__controles">
        {enLlamada && (
          <button
            type="button"
            className={`paco-voz__btn paco-voz__btn--silencio${silenciado ? ' paco-voz__btn--activo' : ''}`}
            onClick={alternarSilencio}
            aria-pressed={silenciado}
            aria-label={silenciado ? 'Activar micr\u00f3fono' : 'Silenciar micr\u00f3fono'}
          >
            {silenciado ? 'Mic apagado' : 'Silenciar'}
          </button>
        )}

        {!enLlamada && (
          <button
            type="button"
            className="paco-voz__btn paco-voz__btn--empezar"
            onClick={() => void empezar()}
            disabled={estado === 'conectando'}
          >
            {estado === 'error' ? 'Volver a llamar' : 'Empezar a hablar'}
          </button>
        )}

        <button type="button" className="paco-voz__btn paco-voz__btn--colgar" onClick={colgar}>
          {enLlamada ? 'Colgar' : 'Cerrar'}
        </button>
      </div>
    </div>
  );
}
