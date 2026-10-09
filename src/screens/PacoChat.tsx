import { useEffect, useRef, useState, type FormEvent } from 'react';
import {
  comprobarAccesoPaco,
  comprobarAltasRespondidasPaco,
  continuarPaco,
  preguntarPaco,
  tokenSesionPacoActual,
  urlWhatsappTestNivel,
  type PacoAccion,
  type PacoAvisoAlta,
  type PacoChoice,
  type PacoContinuation,
} from '../lib/pacoClient';
import {
  activarAvisosPush,
  estadoAvisosPush,
  listarAvisosPaco,
  marcarAvisosLeidos,
  probarAvisoPush,
  type AvisoPaco,
  type EstadoAvisosPush,
} from '../lib/avisosPacoClient';
import { PacoVoz } from './PacoVoz';
import { RespuestasPanel } from './RespuestasPanel';
import './PacoChat.css';

type MensajePaco = {
  id: string;
  autor: 'paco' | 'usuario';
  texto: string;
  choices?: PacoChoice[];
  acciones?: PacoAccion[];
  // Respuesta redactada para una familia (se muestra aparte, con boton Copiar).
  borrador?: string;
  escribir?: boolean;
};

const ETAPAS_PENSANDO = [
  'Analizando la petici\u00f3n',
  'Consultando M\u00edtico',
  'Cruzando datos',
  'Preparando la respuesta',
];

// Efecto de escritura: el texto aparece de golpe en el servidor, pero se
// muestra letra a letra para que se sienta inmediato y m\u00e1s vivo.
function TextoEscrito({
  texto,
  animar,
  alAvanzar,
}: {
  texto: string;
  animar: boolean;
  alAvanzar?: () => void;
}) {
  const [largo, setLargo] = useState(animar ? 0 : texto.length);

  useEffect(() => {
    const reducido =
      typeof window !== 'undefined' &&
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    if (!animar || reducido) {
      setLargo(texto.length);
      return;
    }
    let actual = 0;
    const paso = Math.max(2, Math.ceil(texto.length / 70));
    const id = window.setInterval(() => {
      actual = Math.min(texto.length, actual + paso);
      setLargo(actual);
      alAvanzar?.();
      if (actual >= texto.length) window.clearInterval(id);
    }, 18);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [texto, animar]);

  return <>{texto.slice(0, largo)}</>;
}

const ATAJOS_PACO = [
  'Dame un resumen operativo de hoy',
  '¿Qué reportes están pendientes esta semana?',
  '¿Qué grupos tengo mañana?',
  '¿Hay cambios de nivel que tenga que revisar?',
  '¿Qué tengo pendiente en Secretaría?',
  'Apunta una tarea en Secretaría',
  '¿Es viable la semana que viene?',
];

const CLAVE_ALTAS_AVISADAS = 'mitico_paco_altas_avisadas_v1';

function leerAltasAvisadas(): Set<string> {
  try {
    const raw = window.localStorage.getItem(CLAVE_ALTAS_AVISADAS);
    const lista = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(lista) ? lista.map(String) : []);
  } catch {
    return new Set();
  }
}

function guardarAltasAvisadas(ids: Set<string>) {
  try {
    window.localStorage.setItem(
      CLAVE_ALTAS_AVISADAS,
      JSON.stringify(Array.from(ids).slice(-200))
    );
  } catch {
    // Sin almacenamiento (modo privado): como mucho se repetira el aviso.
  }
}

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
  const [llamadaActiva, setLlamadaActiva] = useState(false);
  const [etapa, setEtapa] = useState(0);
  const [avisosAltas, setAvisosAltas] = useState<PacoAvisoAlta[]>([]);
  const [avisosResumen, setAvisosResumen] = useState<AvisoPaco[]>([]);
  const [pushEstado, setPushEstado] = useState<EstadoAvisosPush | null>(null);
  const [pushOcupado, setPushOcupado] = useState(false);
  const [pushNota, setPushNota] = useState('');
  const [copiadoId, setCopiadoId] = useState<string | null>(null);
  const [mensajes, setMensajes] = useState<MensajePaco[]>([
    {
      id: 'paco-bienvenida',
      autor: 'paco',
      texto:
        'A sus órdenes, señor Cubero. Soy Paco: puedo consultar Mítico, repasarle la semana y llevarle la Secretaría y las altas de test (siempre con confirmación). Usted manda, yo me encargo de que parezca fácil.',
    },
  ]);

  const ultimoTokenComprobado = useRef('');
  const altasAvisadasRef = useRef<Set<string> | null>(null);
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

  // Mientras Paco trabaja, va cambiando el mensaje de estado.
  useEffect(() => {
    if (!cargando) {
      setEtapa(0);
      return;
    }
    const id = window.setInterval(() => {
      setEtapa((actual) => Math.min(actual + 1, ETAPAS_PENSANDO.length - 1));
    }, 1400);
    return () => window.clearInterval(id);
  }, [cargando]);

  // Al cerrar el panel o desmontar: para el micrófono y calla a Paco.
  useEffect(() => {
    if (!abierto) {
      reconocimientoRef.current?.stop();
      if (soportaHabla) window.speechSynthesis.cancel();
      setLlamadaActiva(false);
    }
  }, [abierto, soportaHabla]);

  useEffect(() => {
    return () => {
      reconocimientoRef.current?.stop();
      if (soportaHabla) window.speechSynthesis.cancel();
    };
  }, [soportaHabla]);

  // Avisos de Paco: cuando una familia responde un test de nivel, Paco lo
  // detecta (cada minuto y al volver a la ventana) y propone validar el nivel
  // y añadirla a los listados. Nada se escribe hasta que el usuario confirma.
  useEffect(() => {
    if (!autorizado) return;
    if (!altasAvisadasRef.current) altasAvisadasRef.current = leerAltasAvisadas();
    let cancelado = false;
    let enCurso = false;

    const revisar = async () => {
      if (enCurso || document.visibilityState !== 'visible') return;
      enCurso = true;
      try {
        const items = await comprobarAltasRespondidasPaco();
        if (cancelado) return;
        const vistas = altasAvisadasRef.current ?? new Set<string>();
        const nuevos = items.filter((item) => !vistas.has(item.id));
        if (nuevos.length > 0) {
          setAvisosAltas((actuales) => {
            const ya = new Set(actuales.map((a) => a.id));
            const anadir = nuevos.filter((n) => !ya.has(n.id));
            return anadir.length > 0 ? [...actuales, ...anadir] : actuales;
          });
        }
      } catch {
        // Sin conexion o sin permiso: simplemente no hay aviso esta vez.
      } finally {
        enCurso = false;
      }
    };

    void revisar();
    const intervalo = window.setInterval(() => void revisar(), 60_000);
    const alVolver = () => {
      if (document.visibilityState === 'visible') void revisar();
    };
    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener('focus', alVolver);

    return () => {
      cancelado = true;
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener('focus', alVolver);
    };
  }, [autorizado]);

  // Al abrir el panel, los avisos pendientes pasan a la conversacion.
  useEffect(() => {
    if (!abierto || avisosAltas.length === 0) return;
    const pendientes = avisosAltas;
    setAvisosAltas([]);
    setMensajes((actuales) => [
      ...actuales,
      ...pendientes.map((p) => ({
        id: crearIdPaco(),
        autor: 'paco' as const,
        texto: p.answer,
        choices: p.choices,
        escribir: true,
      })),
    ]);
    const vistas = altasAvisadasRef.current ?? leerAltasAvisadas();
    pendientes.forEach((p) => vistas.add(p.id));
    altasAvisadasRef.current = vistas;
    guardarAltasAvisadas(vistas);
  }, [abierto, avisosAltas]);

  // Avisos de Paco (p.ej. resumen de disponibilidad del martes a las 13:00).
  // El servidor los genera solo; aqui se recogen al abrir la app, al volver a
  // la ventana y cada minuto. Al abrir Paco pasan a la conversacion.
  useEffect(() => {
    if (!autorizado) return;
    let cancelado = false;
    let enCurso = false;

    const revisar = async () => {
      if (enCurso || document.visibilityState !== 'visible') return;
      enCurso = true;
      try {
        const items = await listarAvisosPaco();
        if (cancelado || items.length === 0) return;
        setAvisosResumen((actuales) => {
          const ya = new Set(actuales.map((a) => a.id));
          const nuevos = items.filter((i) => !ya.has(i.id));
          return nuevos.length > 0 ? [...actuales, ...nuevos] : actuales;
        });
      } catch {
        // Sin conexion o sin permiso: no hay aviso esta vez.
      } finally {
        enCurso = false;
      }
    };

    void revisar();
    const intervalo = window.setInterval(() => void revisar(), 60_000);
    const alVolver = () => {
      if (document.visibilityState === 'visible') void revisar();
    };
    document.addEventListener('visibilitychange', alVolver);
    window.addEventListener('focus', alVolver);
    return () => {
      cancelado = true;
      window.clearInterval(intervalo);
      document.removeEventListener('visibilitychange', alVolver);
      window.removeEventListener('focus', alVolver);
    };
  }, [autorizado]);

  useEffect(() => {
    if (!abierto || avisosResumen.length === 0) return;
    const pendientes = avisosResumen;
    setAvisosResumen([]);
    setMensajes((actuales) => [
      ...actuales,
      ...pendientes.map((p) => ({
        id: crearIdPaco(),
        autor: 'paco' as const,
        texto: p.cuerpo,
        escribir: true,
      })),
    ]);
    void marcarAvisosLeidos(pendientes.map((p) => p.id)).catch(() => undefined);
  }, [abierto, avisosResumen]);

  // Estado de los avisos push en ESTE movil (solo al abrir Paco).
  useEffect(() => {
    if (!abierto || !autorizado) return;
    let cancelado = false;
    estadoAvisosPush()
      .then((e) => {
        if (!cancelado) setPushEstado(e);
      })
      .catch(() => {
        if (!cancelado) setPushEstado(null);
      });
    return () => {
      cancelado = true;
    };
  }, [abierto, autorizado]);

  const activarAvisos = async () => {
    setPushOcupado(true);
    setPushNota('');
    try {
      const e = await activarAvisosPush();
      setPushEstado(e);
      setPushNota(
        e === 'activo'
          ? 'Listo: este móvil recibirá los avisos de Paco.'
          : e === 'bloqueado'
            ? 'El móvil tiene bloqueadas las notificaciones para esta app. Actívalas en Ajustes.'
            : 'No se ha podido activar. Inténtalo de nuevo.'
      );
    } catch (err) {
      setPushNota(err instanceof Error ? err.message : 'No se ha podido activar.');
    } finally {
      setPushOcupado(false);
    }
  };

  const probarAvisos = async () => {
    setPushOcupado(true);
    setPushNota('');
    try {
      const ok = await probarAvisoPush();
      setPushNota(ok ? 'Aviso de prueba enviado: debería llegarle en unos segundos.' : 'No se pudo enviar la prueba.');
    } catch (err) {
      setPushNota(err instanceof Error ? err.message : 'No se pudo enviar la prueba.');
    } finally {
      setPushOcupado(false);
    }
  };

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
    alta_changed?: boolean;
    actions?: PacoAccion[];
    silent?: boolean;
    respuesta_familia?: { texto: string };
  }) => {
    if (respuesta.silent) {
      if (respuesta.alta_changed) {
        window.dispatchEvent(new CustomEvent('mitico:altas-updated'));
      }
      return;
    }

    if (respuesta.secretary_changed) {
      window.dispatchEvent(new CustomEvent('mitico:secretaria-updated'));
    }
    if (respuesta.alta_changed) {
      window.dispatchEvent(new CustomEvent('mitico:altas-updated'));
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
      acciones: respuesta.actions || [],
      borrador: respuesta.respuesta_familia?.texto,
      escribir: true,
    });

    hablar(
      respuesta.respuesta_familia
        ? 'Ya tiene la respuesta para la familia en pantalla, señor Cubero.'
        : textoRespuesta
    );
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

  // Al pulsar "Abrir WhatsApp" el navegador abre WhatsApp (el usuario pulsa
  // Enviar alli). Igual que el boton de Altas / Test, el alta se marca como
  // enviada en ese momento.
  const marcarTestEnviado = (accion: PacoAccion) => {
    void continuarPaco({ kind: 'alta_mark_sent', id: accion.alta_id })
      .then((respuesta) => {
        if (respuesta?.answer) procesarRespuesta(respuesta);
        else if (respuesta?.alta_changed) {
          window.dispatchEvent(new CustomEvent('mitico:altas-updated'));
        }
      })
      .catch(() => undefined);
  };

  // Copia la respuesta para pegarla en WhatsApp. Si el navegador no deja usar
  // el portapapeles, se selecciona el texto para copiarlo a mano.
  const copiarBorrador = async (id: string, textoCopia: string) => {
    let copiado = false;
    try {
      await navigator.clipboard.writeText(textoCopia);
      copiado = true;
    } catch {
      try {
        const area = document.createElement('textarea');
        area.value = textoCopia;
        area.setAttribute('readonly', '');
        area.style.position = 'fixed';
        area.style.opacity = '0';
        document.body.appendChild(area);
        area.select();
        copiado = document.execCommand('copy');
        document.body.removeChild(area);
      } catch {
        copiado = false;
      }
    }
    setCopiadoId(copiado ? id : null);
    if (copiado) window.setTimeout(() => setCopiadoId((x) => (x === id ? null : x)), 2500);
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

      {!abierto && avisosAltas.length > 0 && (
        <button
          type="button"
          className="paco-aviso"
          onClick={() => setAbierto(true)}
          aria-label="Abrir Paco para revisar el test respondido"
        >
          <span className="paco-aviso__orbe" aria-hidden="true" />
          <span className="paco-aviso__texto">
            <strong>Paco</strong>
            <span>
              {avisosAltas.length === 1
                ? `${avisosAltas[0].nombre} ha respondido el test`
                : `${avisosAltas.length} tests respondidos`}
            </span>
          </span>
          <span className="paco-aviso__ver">Ver</span>
        </button>
      )}

      {!abierto && avisosAltas.length === 0 && avisosResumen.length > 0 && (
        <button
          type="button"
          className="paco-aviso"
          onClick={() => setAbierto(true)}
          aria-label="Abrir Paco para ver el aviso"
        >
          <span className="paco-aviso__orbe" aria-hidden="true" />
          <span className="paco-aviso__texto">
            <strong>Paco</strong>
            <span>
              {avisosResumen.length === 1 ? avisosResumen[0].titulo : `${avisosResumen.length} avisos nuevos`}
            </span>
          </span>
          <span className="paco-aviso__ver">Ver</span>
        </button>
      )}

      {abierto && (
        <section className="paco-panel" aria-label="Paco Mitiquín">
          <header className="paco-panel__header">
            <div className="paco-panel__titulo">
              <span className="paco-orbe" aria-hidden="true" />
              <div className="paco-panel__textos">
                <strong>Paco Mitiquín</strong>
                <span>Sistema activo</span>
              </div>
            </div>
            <div className="paco-panel__acciones">
              <button
                type="button"
                className="paco-panel__voz paco-panel__llamar"
                onClick={() => {
                  reconocimientoRef.current?.stop();
                  if (soportaHabla) window.speechSynthesis.cancel();
                  setLlamadaActiva(true);
                }}
                aria-label="Llamar a Paco por voz"
                title="Hablar con Paco en tiempo real"
              >
                📞
              </button>
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

          <div className="paco-pushzona">
          {pushEstado && pushEstado !== 'activo' && (
            <div className="paco-push">
              <span>
                {pushEstado === 'no_soportado'
                  ? 'Para recibir avisos de Paco en el móvil, instala Mítico Baby en la pantalla de inicio y ábrela desde su icono.'
                  : pushEstado === 'bloqueado'
                    ? 'Las notificaciones están bloqueadas para esta app. Actívalas en los Ajustes del móvil.'
                    : 'Active los avisos para que Paco le escriba al móvil (p. ej. el resumen de disponibilidad del martes).'}
              </span>
              {pushEstado === 'inactivo' && (
                <button type="button" disabled={pushOcupado} onClick={() => void activarAvisos()}>
                  {pushOcupado ? 'Activando…' : 'Activar avisos en este móvil'}
                </button>
              )}
            </div>
          )}
          {pushEstado === 'activo' && (
            <div className="paco-push paco-push--ok">
              <span>Avisos de Paco activados en este móvil.</span>
              <button type="button" disabled={pushOcupado} onClick={() => void probarAvisos()}>
                {pushOcupado ? 'Enviando…' : 'Enviar prueba'}
              </button>
            </div>
          )}
          {pushNota && <p className="paco-push__nota">{pushNota}</p>}
          </div>

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
                <div className="paco-mensaje__burbuja">
                  <TextoEscrito
                    texto={mensaje.texto}
                    animar={mensaje.escribir === true}
                    alAvanzar={() =>
                      finalMensajesRef.current?.scrollIntoView({ block: 'end' })
                    }
                  />
                </div>

                {mensaje.borrador && (
                  <div className="paco-borrador">
                    <p className="paco-borrador__texto">{mensaje.borrador}</p>
                    <button
                      type="button"
                      className="paco-borrador__copiar"
                      onClick={() => void copiarBorrador(mensaje.id, mensaje.borrador || '')}
                    >
                      {copiadoId === mensaje.id ? 'Copiado' : 'Copiar respuesta'}
                    </button>
                  </div>
                )}

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
                {mensaje.acciones && mensaje.acciones.length > 0 && (
                  <div className="paco-mensaje__choices">
                    {mensaje.acciones.map((accion) => (
                      <a
                        key={`${mensaje.id}-wa-${accion.alta_id}`}
                        className="paco-accion-wa"
                        href={urlWhatsappTestNivel(accion)}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => marcarTestEnviado(accion)}
                      >
                        Abrir WhatsApp · {accion.nombre}
                      </a>
                    ))}
                  </div>
                )}
              </article>
            ))}

            {cargando && (
              <article className="paco-mensaje paco-mensaje--paco">
                <div className="paco-mensaje__burbuja paco-mensaje__pensando">
                  <span className="paco-escaner" aria-hidden="true">
                    <i />
                    <i />
                    <i />
                    <i />
                    <i />
                  </span>
                  <span>{ETAPAS_PENSANDO[etapa]}</span>
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

          {llamadaActiva && (
            <PacoVoz
              onCerrar={() => setLlamadaActiva(false)}
              onTurno={(autor, textoTurno) =>
                añadirMensaje({
                  id: crearIdPaco(),
                  autor,
                  texto: textoTurno,
                })
              }
            />
          )}
        </section>
      )}

      {/* Seccion "Respuestas": mensajes a familias y entrenadores (aprende de Jose). */}
      <RespuestasPanel />
    </>
  );
}
