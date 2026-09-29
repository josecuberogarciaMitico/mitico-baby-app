import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  comprobarAccesoPaco,
  continuarPaco,
  preguntarPaco,
  tokenSesionPacoActual,
  type PacoChoice,
  type PacoContinuation,
} from '../lib/pacoClient';
import './PacoChat.css';

type MensajePaco = {
  id: string;
  autor: 'paco' | 'usuario';
  texto: string;
  choices?: PacoChoice[];
};

const ATAJOS_PACO = [
  'Dame un resumen operativo de hoy',
  '¿Qué reportes están pendientes esta semana?',
  '¿Qué grupos tengo mañana?',
  '¿Hay cambios de nivel que tenga que revisar?',
  '¿Qué tengo pendiente en Secretaría?',
  'Apunta una tarea en Secretaría',
  '¿Es viable la semana que viene?',
];

function crearIdPaco() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// ---------------------------------------------------------------------------
// NOTA DE ESTA REVISIÓN (Claude, 29/09/2026)
// Añadido: voz. Habla con Paco con el micrófono y, si activas el altavoz,
// Paco te contesta hablando. Todo con las funciones de voz que ya trae el
// propio navegador (Web Speech API): no se contrata ningún servicio nuevo,
// así que no añade coste. Si el navegador del usuario no las soporta, los
// botones de voz simplemente no aparecen y todo lo demás sigue igual.
// ---------------------------------------------------------------------------

type SpeechRecognitionLike = {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onresult: ((event: any) => void) | null;
  onerror: ((event: any) => void) | null;
  onend: (() => void) | null;
  start: () => void;
  stop: () => void;
};

function obtenerConstructorReconocimiento(): (new () => SpeechRecognitionLike) | null {
  if (typeof window === 'undefined') return null;
  const w = window as any;
  return w.SpeechRecognition || w.webkitSpeechRecognition || null;
}

function soportaVozHablada() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function PacoChat() {
  const [autorizado, setAutorizado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(false);
  const [escuchando, setEscuchando] = useState(false);
  const [vozActiva, setVozActiva] = useState(false);
  const [mensajes, setMensajes] = useState<MensajePaco[]>([
    {
      id: 'paco-bienvenida',
      autor: 'paco',
      texto:
        'Soy Paco Mitiquín. Puedo consultar Mítico y también gestionar tu Secretaría: guardar tareas y notas, revisar pendientes, cambiar estados y preparar borrados con confirmación.',
    },
  ]);

  const ultimoTokenComprobado = useRef('');
  const finalMensajesRef = useRef<HTMLDivElement | null>(null);
  const reconocimientoRef = useRef<SpeechRecognitionLike | null>(null);

  const ConstructorReconocimiento = obtenerConstructorReconocimiento();
  const soportaEscucha = !!ConstructorReconocimiento;
  const soportaHabla = soportaVozHablada();

  useEffect(() => {
    let cancelado = false;

    const comprobar = async () => {
      const tokenAntes = tokenSesionPacoActual();

      if (!tokenAntes) {
        ultimoTokenComprobado.current = '';
        if (!cancelado) {
          setAutorizado(false);
          setAbierto(false);
        }
        return;
      }

      if (tokenAntes === ultimoTokenComprobado.current) return;

      try {
        const estado = await comprobarAccesoPaco();
        if (cancelado) return;

        const tokenValidado = tokenSesionPacoActual() || tokenAntes;
        const accesoValido =
          estado?.ok === true &&
          estado?.access === 'coordinador_jefe' &&
          estado?.profile?.rol === 'coordinador_jefe';

        // Importante: el token solo se marca como comprobado DESPUÉS de
        // terminar la petición. En React.StrictMode el efecto inicial se
        // monta/limpia dos veces en desarrollo; marcarlo antes podía dejar
        // la segunda comprobación bloqueada y ocultar Paco tras un refresh.
        ultimoTokenComprobado.current = tokenValidado;
        setAutorizado(accesoValido);
        if (!accesoValido) setAbierto(false);
      } catch (error) {
        if (cancelado) return;

        const status = (error as Error & { status?: number })?.status;

        // Un 403 real se puede recordar para ese token. Un 401 o un fallo
        // temporal NO se cachean: la sesión puede renovarse unos instantes
        // después y Paco debe volver a comprobarla automáticamente.
        if (status === 403) {
          ultimoTokenComprobado.current = tokenSesionPacoActual() || tokenAntes;
        } else {
          ultimoTokenComprobado.current = '';
        }

        setAutorizado(false);
        setAbierto(false);
      }
    };

    void comprobar();

    const intervalo = window.setInterval(() => {
      void comprobar();
    }, 2500);

    const alVolver = () => {
      if (document.visibilityState === 'visible') void comprobar();
    };

    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener('focus', alVolver);

    return () => {
      cancelado = true;
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener('focus', alVolver);
    };
  }, []);

  useEffect(() => {
    finalMensajesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [mensajes, cargando]);

  // Al cerrar el panel o desmontar: para el micrófono y calla a Paco.
  useEffect(() => {
    if (!abierto) {
      reconocimientoRef.current?.stop();
      if (soportaHabla) window.speechSynthesis.cancel();
    }
  }, [abierto, soportaHabla]);

  useEffect(() => {
    return () => {
      reconocimientoRef.current?.stop();
      if (soportaHabla) window.speechSynthesis.cancel();
    };
  }, [soportaHabla]);

  if (!autorizado) return null;

  const añadirMensaje = (mensaje: MensajePaco) => {
    setMensajes((actuales) => [...actuales, mensaje]);
  };

  const hablar = (texto: string) => {
    if (!vozActiva || !soportaHabla || !texto) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(texto);
      utterance.lang = 'es-ES';
      utterance.rate = 1;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Si falla la síntesis de voz, Paco simplemente se queda mudo esta vez;
      // el mensaje de texto ya se ha mostrado igualmente.
    }
  };

  const procesarRespuesta = (respuesta: {
    answer?: string;
    error?: string;
    choices?: PacoChoice[];
    secretary_changed?: boolean;
  }) => {
    if (respuesta.secretary_changed) {
      window.dispatchEvent(new CustomEvent('mitico:secretaria-updated'));
    }

    const textoRespuesta =
      respuesta.answer ||
      respuesta.error ||
      'No he podido preparar una respuesta.';

    añadirMensaje({
      id: crearIdPaco(),
      autor: 'paco',
      texto: textoRespuesta,
      choices: respuesta.choices || [],
    });

    hablar(textoRespuesta);
  };

  const enviarTexto = async (mensajeForzado?: string) => {
    const mensaje = (mensajeForzado ?? texto).trim();
    if (!mensaje || cargando) return;

    setTexto('');
    añadirMensaje({
      id: crearIdPaco(),
      autor: 'usuario',
      texto: mensaje,
    });
    setCargando(true);

    try {
      procesarRespuesta(await preguntarPaco(mensaje));
    } catch (error) {
      const status = (error as Error & { status?: number })?.status;

      if (status === 401 || status === 403) {
        ultimoTokenComprobado.current = '';
        setAutorizado(false);
        setAbierto(false);
        return;
      }

      añadirMensaje({
        id: crearIdPaco(),
        autor: 'paco',
        texto:
          error instanceof Error && error.message !== 'NO_SESSION'
            ? error.message
            : 'No he podido conectar con Paco.',
      });
    } finally {
      setCargando(false);
    }
  };

  const enviarContinuacion = async (choice: PacoChoice) => {
    if (cargando) return;

    añadirMensaje({
      id: crearIdPaco(),
      autor: 'usuario',
      texto: choice.label,
    });
    setCargando(true);

    try {
      procesarRespuesta(
        await continuarPaco(choice.continuation as PacoContinuation)
      );
    } catch (error) {
      const status = (error as Error & { status?: number })?.status;

      if (status === 401 || status === 403) {
        ultimoTokenComprobado.current = '';
        setAutorizado(false);
        setAbierto(false);
        return;
      }

      añadirMensaje({
        id: crearIdPaco(),
        autor: 'paco',
        texto:
          error instanceof Error
            ? error.message
            : 'No he podido continuar la consulta.',
      });
    } finally {
      setCargando(false);
    }
  };

  const alternarEscucha = () => {
    if (!ConstructorReconocimiento) return;

    if (escuchando) {
      reconocimientoRef.current?.stop();
      return;
    }

    if (soportaHabla) window.speechSynthesis.cancel();

    const reconocimiento = new ConstructorReconocimiento();
    reconocimiento.lang = 'es-ES';
    reconocimiento.continuous = false;
    reconocimiento.interimResults = false;

    reconocimiento.onresult = (event: any) => {
      const dicho = String(event?.results?.[0]?.[0]?.transcript || '').trim();
      if (dicho) void enviarTexto(dicho);
    };
    reconocimiento.onerror = () => {
      setEscuchando(false);
    };
    reconocimiento.onend = () => {
      setEscuchando(false);
    };

    reconocimientoRef.current = reconocimiento;
    setEscuchando(true);
    reconocimiento.start();
  };

  const onSubmit = (event: FormEvent) => {
    event.preventDefault();
    void enviarTexto();
  };

  return (
    <>
      <button
        type="button"
        className="paco-fab"
        onClick={() => setAbierto((valor) => !valor)}
        aria-label={abierto ? 'Cerrar Paco Mitiquín' : 'Abrir Paco Mitiquín'}
        aria-expanded={abierto}
      >
        <span className="paco-fab__icon" aria-hidden="true">
          P
        </span>
        <span className="paco-fab__label">Paco</span>
      </button>

      {abierto && (
        <section className="paco-panel" aria-label="Paco Mitiquín">
          <header className="paco-panel__header">
            <div>
              <strong>Paco Mitiquín</strong>
              <span>Asistente del coordinador jefe · lectura + Secretaría</span>
            </div>
            <div className="paco-panel__acciones">
              {soportaHabla && (
                <button
                  type="button"
                  className={`paco-panel__voz${vozActiva ? ' paco-panel__voz--activa' : ''}`}
                  onClick={() => {
                    if (vozActiva) window.speechSynthesis.cancel();
                    setVozActiva((valor) => !valor);
                  }}
                  aria-pressed={vozActiva}
                  aria-label={
                    vozActiva
                      ? 'Desactivar que Paco hable en voz alta'
                      : 'Activar que Paco hable en voz alta'
                  }
                  title={vozActiva ? 'Paco habla: activado' : 'Paco habla: desactivado'}
                >
                  {vozActiva ? '🔊' : '🔇'}
                </button>
              )}
              <button
                type="button"
                className="paco-panel__close"
                onClick={() => setAbierto(false)}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
          </header>

          <div className="paco-atajos" aria-label="Consultas rápidas">
            {ATAJOS_PACO.map((atajo) => (
              <button
                key={atajo}
                type="button"
                disabled={cargando}
                onClick={() => void enviarTexto(atajo)}
              >
                {atajo}
              </button>
            ))}
          </div>

          <div className="paco-mensajes" aria-live="polite">
            {mensajes.map((mensaje) => (
              <article
                key={mensaje.id}
                className={`paco-mensaje paco-mensaje--${mensaje.autor}`}
              >
                <div className="paco-mensaje__burbuja">{mensaje.texto}</div>

                {mensaje.choices && mensaje.choices.length > 0 && (
                  <div className="paco-mensaje__choices">
                    {mensaje.choices.map((choice) => (
                      <button
                        key={`${mensaje.id}-${choice.label}`}
                        type="button"
                        disabled={cargando}
                        onClick={() => void enviarContinuacion(choice)}
                      >
                        {choice.label}
                      </button>
                    ))}
                  </div>
                )}
              </article>
            ))}

            {cargando && (
              <article className="paco-mensaje paco-mensaje--paco">
                <div className="paco-mensaje__burbuja paco-mensaje__pensando">
                  Paco está revisando Mítico…
                </div>
              </article>
            )}

            <div ref={finalMensajesRef} />
          </div>

          <form className="paco-composer" onSubmit={onSubmit}>
            {soportaEscucha && (
              <button
                type="button"
                className={`paco-composer__mic${escuchando ? ' paco-composer__mic--activo' : ''}`}
                onClick={alternarEscucha}
                disabled={cargando}
                aria-pressed={escuchando}
                aria-label={escuchando ? 'Dejar de escuchar' : 'Hablarle a Paco'}
                title={escuchando ? 'Escuchando… toca para parar' : 'Hablarle a Paco'}
              >
                {escuchando ? '⏺️' : '🎤'}
              </button>
            )}
            <textarea
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              placeholder={escuchando ? 'Escuchando…' : 'Escribe a Paco…'}
              rows={2}
              maxLength={3000}
              disabled={cargando}
              onKeyDown={(event) => {
                if (
                  event.key === 'Enter' &&
                  !event.shiftKey &&
                  !event.nativeEvent.isComposing
                ) {
                  event.preventDefault();
                  void enviarTexto();
                }
              }}
            />
            <button
              type="submit"
              disabled={cargando || !texto.trim()}
              aria-label="Enviar a Paco"
            >
              Enviar
            </button>
          </form>
        </section>
      )}
    </>
  );
}
