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
];

function crearIdPaco() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function PacoChat() {
  const [autorizado, setAutorizado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const [cargando, setCargando] = useState(false);
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

  if (!autorizado) return null;

  const añadirMensaje = (mensaje: MensajePaco) => {
    setMensajes((actuales) => [...actuales, mensaje]);
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

    añadirMensaje({
      id: crearIdPaco(),
      autor: 'paco',
      texto:
        respuesta.answer ||
        respuesta.error ||
        'No he podido preparar una respuesta.',
      choices: respuesta.choices || [],
    });
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
            <button
              type="button"
              className="paco-panel__close"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar"
            >
              ×
            </button>
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
            <textarea
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              placeholder="Escribe a Paco…"
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
