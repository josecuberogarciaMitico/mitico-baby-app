import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { comprobarAccesoPaco } from '../lib/pacoClient';
import {
  activarRegla,
  borrarEjemplo,
  borrarRegla,
  elegirOpcion,
  guardarEjemploManual,
  guardarReglaManual,
  guardarVersionFinal,
  listarAprendizaje,
  pedirCambio,
  redactarMensaje,
  type RespAprendizaje,
  type RespDestino,
  type RespEjemplo,
  type RespGuardado,
  type RespModo,
  type RespOpcion,
  type RespRedaccion,
  type RespRegla,
} from '../lib/respuestasClient';
import './RespuestasPanel.css';

type Pestana = 'escribir' | 'aprendido';

const TIPO_LABEL: Record<RespEjemplo['tipo'], string> = {
  aprobada: 'Aprobada',
  corregida: 'Corregida por ti',
  manual: 'Aportada por ti',
};

const DESTINO_LABEL: Record<RespDestino, string> = {
  familias: 'Familias',
  entrenadores: 'Entrenadores',
};

function mensajeError(error: unknown, defecto: string) {
  return error instanceof Error && error.message ? error.message : defecto;
}

function fechaCorta(iso: string) {
  const fecha = new Date(iso);
  if (Number.isNaN(fecha.getTime())) return '';
  return fecha.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
}

async function copiarTexto(texto: string) {
  try {
    await navigator.clipboard.writeText(texto);
    return true;
  } catch {
    try {
      const area = document.createElement('textarea');
      area.value = texto;
      area.setAttribute('readonly', '');
      area.style.position = 'fixed';
      area.style.opacity = '0';
      document.body.appendChild(area);
      area.select();
      const copiado = document.execCommand('copy');
      document.body.removeChild(area);
      return copiado;
    } catch {
      return false;
    }
  }
}

export function RespuestasPanel() {
  const [autorizado, setAutorizado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [pestana, setPestana] = useState<Pestana>('escribir');

  // --- Escribir ---
  const [modo, setModo] = useState<RespModo>('respuesta');
  const [destino, setDestino] = useState<RespDestino>('familias');
  const [entrada, setEntrada] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [resultado, setResultado] = useState<RespRedaccion | null>(null);
  const [textoFinal, setTextoFinal] = useState('');
  const [cambio, setCambio] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [guardado, setGuardado] = useState<RespGuardado | null>(null);
  const [copiado, setCopiado] = useState('');

  // --- Lo aprendido ---
  const [aprendizaje, setAprendizaje] = useState<RespAprendizaje | null>(null);
  const [cargandoApr, setCargandoApr] = useState(false);
  const [errorApr, setErrorApr] = useState('');
  const [nuevaRegla, setNuevaRegla] = useState('');
  const [destinoRegla, setDestinoRegla] = useState<'todos' | RespDestino>('todos');
  const [ejAbierto, setEjAbierto] = useState('');
  const [formEjemplo, setFormEjemplo] = useState(false);
  const [ejMensaje, setEjMensaje] = useState('');
  const [ejFinal, setEjFinal] = useState('');
  const [ejModo, setEjModo] = useState<RespModo>('respuesta');
  const [ejDestino, setEjDestino] = useState<RespDestino>('familias');

  const reintentosAcceso = useRef(0);

  const comprobarAcceso = useCallback(async () => {
    try {
      const estado = await comprobarAccesoPaco();
      const valido =
        estado?.ok === true &&
        estado?.access === 'coordinador_jefe' &&
        estado?.profile?.rol === 'coordinador_jefe';
      reintentosAcceso.current = 0;
      setAutorizado(valido);
      if (!valido) setAbierto(false);
    } catch (err) {
      const status = (err as { status?: number } | null)?.status;
      if (status === 401 || status === 403) {
        setAutorizado(false);
        setAbierto(false);
      } else if (reintentosAcceso.current < 3) {
        reintentosAcceso.current += 1;
        window.setTimeout(() => void comprobarAcceso(), 4000);
      }
    }
  }, []);

  useEffect(() => {
    void comprobarAcceso();
    const refrescar = () => {
      if (document.visibilityState === 'visible') void comprobarAcceso();
    };
    window.addEventListener('focus', refrescar);
    document.addEventListener('visibilitychange', refrescar);
    return () => {
      window.removeEventListener('focus', refrescar);
      document.removeEventListener('visibilitychange', refrescar);
    };
  }, [comprobarAcceso]);

  const cargarAprendizaje = useCallback(async () => {
    setCargandoApr(true);
    setErrorApr('');
    try {
      setAprendizaje(await listarAprendizaje());
    } catch (err) {
      setErrorApr(mensajeError(err, 'No se pudo cargar lo que Paco ha aprendido.'));
    } finally {
      setCargandoApr(false);
    }
  }, []);

  useEffect(() => {
    if (abierto && pestana === 'aprendido' && !aprendizaje && !cargandoApr) {
      void cargarAprendizaje();
    }
  }, [abierto, pestana, aprendizaje, cargandoApr, cargarAprendizaje]);

  const partes = useMemo(
    () =>
      textoFinal
        .split(/\n-{3,}[ \t]*\n/)
        .map((parte) => parte.trim())
        .filter(Boolean),
    [textoFinal]
  );

  const editado =
    Boolean(resultado?.texto) && textoFinal.trim() !== String(resultado?.texto || '').trim();

  const aplicar = (r: RespRedaccion) => {
    setResultado(r);
    setTextoFinal(r.texto ?? '');
    setGuardado(null);
    setCambio('');
  };

  const redactar = async () => {
    if (!entrada.trim() || cargando) return;
    setCargando(true);
    setError('');
    try {
      aplicar(await redactarMensaje({ texto: entrada.trim(), modo, destino }));
    } catch (err) {
      setError(mensajeError(err, 'No se pudo redactar el mensaje.'));
    } finally {
      setCargando(false);
    }
  };

  const aplicarCambio = async () => {
    if (!resultado?.borrador || !cambio.trim() || cargando) return;
    setCargando(true);
    setError('');
    try {
      const actual = textoFinal.trim() || resultado.borrador.respuesta;
      aplicar(await pedirCambio({ ...resultado.borrador, respuesta: actual }, cambio.trim()));
    } catch (err) {
      setError(mensajeError(err, 'No se pudo aplicar el cambio.'));
    } finally {
      setCargando(false);
    }
  };

  const pulsarOpcion = async (opcion: RespOpcion) => {
    if (cargando) return;
    setCargando(true);
    setError('');
    try {
      let continuacion: any = opcion.continuation;
      // Si has retocado el texto, los ajustes (más corta, más cálida...) parten de tu versión.
      if (continuacion?.kind === 'padre_ajustar' && continuacion.draft && textoFinal.trim()) {
        continuacion = { ...continuacion, draft: { ...continuacion.draft, respuesta: textoFinal.trim() } };
      }
      aplicar(await elegirOpcion({ ...opcion, continuation: continuacion }));
    } catch (err) {
      setError(mensajeError(err, 'No se pudo preparar la respuesta.'));
    } finally {
      setCargando(false);
    }
  };

  const copiar = async (clave: string, texto: string) => {
    const ok = await copiarTexto(texto);
    setCopiado(ok ? clave : '');
    if (ok) window.setTimeout(() => setCopiado((actual) => (actual === clave ? '' : actual)), 2200);
  };

  const guardar = async () => {
    if (!resultado?.borrador || !resultado.texto || !textoFinal.trim() || guardando) return;
    setGuardando(true);
    setError('');
    try {
      const g = await guardarVersionFinal({
        borrador: { ...resultado.borrador, respuesta: resultado.texto },
        textoFinal: textoFinal.trim(),
      });
      setGuardado(g);
      setAprendizaje(null); // se recarga al abrir "Lo aprendido"
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar.'));
    } finally {
      setGuardando(false);
    }
  };

  const nuevoMensaje = () => {
    setResultado(null);
    setTextoFinal('');
    setEntrada('');
    setGuardado(null);
    setCambio('');
    setError('');
  };

  const accionApr = async (accion: () => Promise<void>, fallo: string) => {
    setErrorApr('');
    try {
      await accion();
      await cargarAprendizaje();
    } catch (err) {
      setErrorApr(mensajeError(err, fallo));
    }
  };

  const anadirRegla = () => {
    const texto = nuevaRegla.trim();
    if (texto.length < 3) return;
    void accionApr(async () => {
      await guardarReglaManual(texto, destinoRegla);
      setNuevaRegla('');
    }, 'No se pudo guardar la regla.');
  };

  const quitarRegla = (regla: RespRegla) => {
    if (!window.confirm(`¿Borrar esta regla?\n\n«${regla.regla}»`)) return;
    void accionApr(() => borrarRegla(regla.id), 'No se pudo borrar la regla.');
  };

  const quitarEjemplo = (ejemplo: RespEjemplo) => {
    if (!window.confirm('¿Borrar este ejemplo? Paco dejará de aprender de él.')) return;
    void accionApr(() => borrarEjemplo(ejemplo.id), 'No se pudo borrar el ejemplo.');
  };

  const anadirEjemplo = () => {
    if (!ejMensaje.trim() || !ejFinal.trim()) return;
    void accionApr(async () => {
      await guardarEjemploManual({ mensaje: ejMensaje.trim(), final: ejFinal.trim(), modo: ejModo, destino: ejDestino });
      setEjMensaje('');
      setEjFinal('');
      setFormEjemplo(false);
    }, 'No se pudo guardar el ejemplo.');
  };

  return (
    <>
      {autorizado && (
        <button type="button" className="respuestas-fab" onClick={() => setAbierto(true)} aria-label="Abrir Respuestas">
          Respuestas
        </button>
      )}

      {abierto && (
        <section className="respuestas-panel" aria-label="Respuestas de Paco">
          <header className="respuestas-header">
            <div className="respuestas-header__titulo">
              <span className="respuestas-orbe" aria-hidden="true" />
              <div>
                <strong>Respuestas</strong>
                <span>Paco escribe, tú decides</span>
              </div>
            </div>
            <button type="button" className="respuestas-cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar Respuestas">
              ×
            </button>
          </header>

          <nav className="respuestas-tabs" aria-label="Secciones">
            <button type="button" className={pestana === 'escribir' ? 'activa' : ''} onClick={() => setPestana('escribir')}>
              Escribir
            </button>
            <button type="button" className={pestana === 'aprendido' ? 'activa' : ''} onClick={() => setPestana('aprendido')}>
              Lo que ha aprendido
              {aprendizaje ? <em>{aprendizaje.ejemplos.length}</em> : null}
            </button>
          </nav>

          {pestana === 'escribir' && (
            <div className="respuestas-cuerpo">
              {!resultado && (
                <>
                  <div className="respuestas-segmento" role="group" aria-label="Qué quieres hacer">
                    <button type="button" className={modo === 'respuesta' ? 'activa' : ''} onClick={() => setModo('respuesta')}>
                      Responder a un mensaje
                    </button>
                    <button type="button" className={modo === 'notas' ? 'activa' : ''} onClick={() => setModo('notas')}>
                      Convertir mis notas
                    </button>
                  </div>

                  {modo === 'notas' && (
                    <div className="respuestas-chips" role="group" aria-label="Para quién es">
                      <span>Para</span>
                      {(['familias', 'entrenadores'] as RespDestino[]).map((d) => (
                        <button key={d} type="button" className={destino === d ? 'activa' : ''} onClick={() => setDestino(d)}>
                          {DESTINO_LABEL[d]}
                        </button>
                      ))}
                    </div>
                  )}

                  <label className="respuestas-campo">
                    <span>{modo === 'respuesta' ? 'Mensaje de la familia' : 'Tus notas'}</span>
                    <textarea
                      value={entrada}
                      maxLength={4000}
                      rows={9}
                      onChange={(e) => setEntrada(e.target.value)}
                      placeholder={
                        modo === 'respuesta'
                          ? 'Pega aquí el mensaje de la familia. Si quieres decirle algo concreto, añádelo debajo, por ejemplo: «dile que sí, que el domingo lo vemos».'
                          : 'Escribe o dicta tus notas tal cual, aunque estén desordenadas. Paco las convierte en un mensaje listo para enviar.'
                      }
                    />
                  </label>

                  <button type="button" className="respuestas-principal" disabled={cargando || !entrada.trim()} onClick={() => void redactar()}>
                    {cargando ? 'Paco está escribiendo…' : 'Redactar'}
                  </button>
                </>
              )}

              {resultado && (
                <div className="respuestas-resultado">
                  {resultado.mensajePaco && <p className="respuestas-paco">{resultado.mensajePaco}</p>}

                  {resultado.texto !== null && (
                    <>
                      <label className="respuestas-campo">
                        <span>
                          {resultado.borrador?.modo === 'notas'
                            ? `Mensaje para ${resultado.borrador.destino === 'entrenadores' ? 'los entrenadores' : 'las familias'}`
                            : 'Respuesta'}
                          {' · puedes retocarla'}
                        </span>
                        <textarea
                          value={textoFinal}
                          maxLength={3000}
                          rows={Math.min(16, Math.max(7, textoFinal.split('\n').length + 2))}
                          onChange={(e) => {
                            setTextoFinal(e.target.value);
                            setGuardado(null);
                          }}
                        />
                      </label>

                      <div className="respuestas-acciones">
                        <button type="button" className="respuestas-principal" onClick={() => void copiar('todo', textoFinal.trim())} disabled={!textoFinal.trim()}>
                          {copiado === 'todo' ? 'Copiado' : partes.length > 1 ? 'Copiar todo' : 'Copiar'}
                        </button>
                        {partes.length > 1 &&
                          partes.map((parte, i) => (
                            <button key={i} type="button" className="respuestas-sec" onClick={() => void copiar(`p${i}`, parte)}>
                              {copiado === `p${i}` ? 'Copiado' : `Copiar mensaje ${i + 1}`}
                            </button>
                          ))}
                      </div>

                      <div className="respuestas-aprende">
                        <button type="button" className="respuestas-sec respuestas-sec--aprende" disabled={guardando || !textoFinal.trim() || guardado !== null} onClick={() => void guardar()}>
                          {guardado
                            ? 'Guardado'
                            : guardando
                              ? 'Guardando…'
                              : editado
                                ? 'Guardar mi versión para que Paco aprenda'
                                : 'Está bien, que aprenda de esta'}
                        </button>
                        {guardado && (
                          <p className="respuestas-ok">
                            {guardado.tipo === 'aprobada'
                              ? 'Anotado: así te gusta que escriba.'
                              : 'Anotado: Paco tendrá en cuenta tu versión.'}
                            {guardado.regla && (
                              <>
                                {' '}
                                Ha sacado esta regla: <strong>«{guardado.regla.regla}»</strong>. La puedes quitar en «Lo que ha aprendido».
                              </>
                            )}
                          </p>
                        )}
                      </div>
                    </>
                  )}

                  {resultado.opciones.length > 0 && (
                    <div className="respuestas-opciones">
                      {resultado.opciones.map((opcion) => (
                        <button key={opcion.label} type="button" disabled={cargando} onClick={() => void pulsarOpcion(opcion)}>
                          {opcion.label}
                        </button>
                      ))}
                    </div>
                  )}

                  {resultado.borrador && resultado.texto !== null && (
                    <div className="respuestas-cambio">
                      <input
                        type="text"
                        value={cambio}
                        maxLength={380}
                        placeholder="Pídele un cambio: «dile que sí», «sin lo del seguro»…"
                        onChange={(e) => setCambio(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') void aplicarCambio();
                        }}
                      />
                      <button type="button" disabled={cargando || !cambio.trim()} onClick={() => void aplicarCambio()}>
                        {cargando ? '…' : 'Cambiar'}
                      </button>
                    </div>
                  )}

                  <button type="button" className="respuestas-enlace" onClick={nuevoMensaje}>
                    Escribir otro mensaje
                  </button>
                </div>
              )}

              {error && <p className="respuestas-error">{error}</p>}
            </div>
          )}

          {pestana === 'aprendido' && (
            <div className="respuestas-cuerpo">
              {cargandoApr && !aprendizaje && <p className="respuestas-vacio">Cargando…</p>}
              {errorApr && <p className="respuestas-error">{errorApr}</p>}

              {aprendizaje && (
                <>
                  <section className="respuestas-bloque">
                    <h3>Reglas de Paco</h3>
                    <p className="respuestas-nota">Las saca de tus correcciones. Apaga o borra las que no te gusten.</p>
                    {aprendizaje.reglas.length === 0 && <p className="respuestas-vacio">Todavía no hay reglas. Aparecerán cuando corrijas respuestas.</p>}
                    <ul className="respuestas-lista">
                      {aprendizaje.reglas.map((regla) => (
                        <li key={regla.id} className={regla.activa ? '' : 'apagada'}>
                          <label className="respuestas-interruptor">
                            <input type="checkbox" checked={regla.activa} onChange={(e) => void accionApr(() => activarRegla(regla.id, e.target.checked), 'No se pudo cambiar la regla.')} />
                            <span className="respuestas-interruptor__pista" aria-hidden="true" />
                            <span className="respuestas-lista__texto">
                              {regla.regla}
                              <small>
                                {regla.origen === 'manual' ? 'Escrita por ti' : 'Detectada por Paco'} ·{' '}
                                {regla.destino === 'todos' ? 'Todos' : DESTINO_LABEL[regla.destino]}
                              </small>
                            </span>
                          </label>
                          <button type="button" className="respuestas-borrar" onClick={() => quitarRegla(regla)} aria-label="Borrar regla">
                            ×
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="respuestas-nueva">
                      <input type="text" value={nuevaRegla} maxLength={300} placeholder="Añade una regla: «Cierra siempre con…»" onChange={(e) => setNuevaRegla(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') anadirRegla(); }} />
                      <select value={destinoRegla} onChange={(e) => setDestinoRegla(e.target.value as 'todos' | RespDestino)} aria-label="A quién se aplica">
                        <option value="todos">Todos</option>
                        <option value="familias">Familias</option>
                        <option value="entrenadores">Entrenadores</option>
                      </select>
                      <button type="button" disabled={nuevaRegla.trim().length < 3} onClick={anadirRegla}>
                        Añadir
                      </button>
                    </div>
                  </section>

                  <section className="respuestas-bloque">
                    <h3>Ejemplos guardados</h3>
                    <p className="respuestas-nota">Paco copia tu forma de escribir de los más parecidos al mensaje que le des.</p>
                    {aprendizaje.ejemplos.length === 0 && <p className="respuestas-vacio">Aún no hay ejemplos.</p>}
                    <ul className="respuestas-lista respuestas-lista--ej">
                      {aprendizaje.ejemplos.map((ejemplo) => (
                        <li key={ejemplo.id}>
                          <button type="button" className="respuestas-ej" onClick={() => setEjAbierto(ejAbierto === ejemplo.id ? '' : ejemplo.id)} aria-expanded={ejAbierto === ejemplo.id}>
                            <span className="respuestas-ej__etiquetas">
                              <b>{TIPO_LABEL[ejemplo.tipo]}</b>
                              <i>{ejemplo.modo === 'notas' ? 'Notas' : 'Respuesta'}</i>
                              <i>{DESTINO_LABEL[ejemplo.destino]}</i>
                              <i>{fechaCorta(ejemplo.created_at)}</i>
                            </span>
                            <span className="respuestas-ej__previo">{ejemplo.respuesta_final.slice(0, 110)}{ejemplo.respuesta_final.length > 110 ? '…' : ''}</span>
                          </button>
                          {ejAbierto === ejemplo.id && (
                            <div className="respuestas-ej__detalle">
                              <h4>{ejemplo.modo === 'notas' ? 'Tus notas' : 'Mensaje de la familia'}</h4>
                              <p>{ejemplo.mensaje_familia}</p>
                              <h4>Versión final</h4>
                              <p>{ejemplo.respuesta_final}</p>
                              <button type="button" className="respuestas-enlace respuestas-enlace--peligro" onClick={() => quitarEjemplo(ejemplo)}>
                                Borrar este ejemplo
                              </button>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>

                    {!formEjemplo && (
                      <button type="button" className="respuestas-sec" onClick={() => setFormEjemplo(true)}>
                        + Añadir un ejemplo mío
                      </button>
                    )}
                    {formEjemplo && (
                      <div className="respuestas-form">
                        <div className="respuestas-segmento" role="group" aria-label="Tipo de ejemplo">
                          <button type="button" className={ejModo === 'respuesta' ? 'activa' : ''} onClick={() => setEjModo('respuesta')}>Respuesta a un mensaje</button>
                          <button type="button" className={ejModo === 'notas' ? 'activa' : ''} onClick={() => setEjModo('notas')}>Desde mis notas</button>
                        </div>
                        <div className="respuestas-chips" role="group" aria-label="Para quién fue">
                          <span>Para</span>
                          {(['familias', 'entrenadores'] as RespDestino[]).map((d) => (
                            <button key={d} type="button" className={ejDestino === d ? 'activa' : ''} onClick={() => setEjDestino(d)}>
                              {DESTINO_LABEL[d]}
                            </button>
                          ))}
                        </div>
                        <label className="respuestas-campo">
                          <span>{ejModo === 'respuesta' ? 'Mensaje que recibiste' : 'Tus notas de entonces'}</span>
                          <textarea value={ejMensaje} rows={4} maxLength={4000} onChange={(e) => setEjMensaje(e.target.value)} />
                        </label>
                        <label className="respuestas-campo">
                          <span>Lo que enviaste finalmente</span>
                          <textarea value={ejFinal} rows={6} maxLength={3000} onChange={(e) => setEjFinal(e.target.value)} />
                        </label>
                        <div className="respuestas-acciones">
                          <button type="button" className="respuestas-sec" onClick={() => setFormEjemplo(false)}>Cancelar</button>
                          <button type="button" className="respuestas-principal" disabled={!ejMensaje.trim() || !ejFinal.trim()} onClick={anadirEjemplo}>
                            Guardar ejemplo
                          </button>
                        </div>
                      </div>
                    )}
                  </section>
                </>
              )}
            </div>
          )}
        </section>
      )}
    </>
  );
}
