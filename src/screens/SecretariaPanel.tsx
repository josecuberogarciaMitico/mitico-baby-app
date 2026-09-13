import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import {
  actualizarEntradaSecretaria,
  crearEntradaSecretaria,
  eliminarEntradaSecretaria,
  eliminarResueltasSecretaria,
  listarSecretaria,
  type SecretariaEntradaInput,
  type SecretariaRegistro,
} from '../lib/secretariaClient';
import { comprobarAccesoPaco } from '../lib/pacoClient';
import './SecretariaPanel.css';

type FiltroEstado = 'activas' | 'todas' | 'resueltas' | 'notas';

type FormSecretaria = {
  tipo: 'tarea' | 'nota';
  prioridad: 'baja' | 'normal' | 'alta' | 'urgente';
  categoria: SecretariaEntradaInput['categoria'];
  titulo: string;
  detalle: string;
  fechaEvento: string;
  fechaLimite: string;
};

const FORM_INICIAL: FormSecretaria = {
  tipo: 'tarea',
  prioridad: 'normal',
  categoria: 'otro',
  titulo: '',
  detalle: '',
  fechaEvento: '',
  fechaLimite: '',
};

const CATEGORIAS: Array<{
  value: SecretariaEntradaInput['categoria'];
  label: string;
}> = [
  { value: 'familia', label: 'Familias' },
  { value: 'cambio_turno', label: 'Cambios de turno' },
  { value: 'alumno_tecnica', label: 'Alumno / técnica' },
  { value: 'entrenador', label: 'Entrenadores' },
  { value: 'administracion', label: 'Administración' },
  { value: 'incidencia', label: 'Incidencias' },
  { value: 'disponibilidad', label: 'Disponibilidad' },
  { value: 'grupo', label: 'Grupos' },
  { value: 'cobro', label: 'Cobros' },
  { value: 'otro', label: 'Otros' },
];

const PRIORIDADES = [
  { value: 'baja', label: 'Baja' },
  { value: 'normal', label: 'Normal' },
  { value: 'alta', label: 'Alta' },
  { value: 'urgente', label: 'Urgente' },
] as const;

function categoriaLabel(categoria: string) {
  return CATEGORIAS.find((item) => item.value === categoria)?.label || categoria;
}

function prioridadLabel(prioridad: string) {
  return PRIORIDADES.find((item) => item.value === prioridad)?.label || prioridad;
}

function fechaHoyMadrid() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date());
}

function fechaCorta(fecha?: string | null) {
  if (!fecha) return '';
  const [year, month, day] = fecha.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}

function esActiva(registro: SecretariaRegistro) {
  return registro.tipo === 'tarea' &&
    (registro.estado === 'pendiente' || registro.estado === 'en_curso');
}

export function SecretariaPanel() {
  const [autorizado, setAutorizado] = useState(false);
  const [abierto, setAbierto] = useState(false);
  const [registros, setRegistros] = useState<SecretariaRegistro[]>([]);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('activas');
  const [filtroCategoria, setFiltroCategoria] = useState('todas');
  const [busqueda, setBusqueda] = useState('');
  const [editorAbierto, setEditorAbierto] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [form, setForm] = useState<FormSecretaria>(FORM_INICIAL);
  const [guardando, setGuardando] = useState(false);

  const cargar = useCallback(async (silencioso = false) => {
    if (!silencioso) setCargando(true);
    setError('');

    try {
      const datos = await listarSecretaria();
      setRegistros(Array.isArray(datos) ? datos : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'No se pudo cargar la Secretaría.'
      );
    } finally {
      if (!silencioso) setCargando(false);
    }
  }, []);

  const comprobarAcceso = useCallback(async () => {
    try {
      const estado = await comprobarAccesoPaco();
      const accesoValido =
        estado?.ok === true &&
        estado?.access === 'coordinador_jefe' &&
        estado?.profile?.rol === 'coordinador_jefe';

      setAutorizado(accesoValido);
      if (!accesoValido) {
        setAbierto(false);
        return;
      }

      // La visibilidad depende solo de la comprobación segura de rol.
      // Si después falla la carga de datos, mantenemos el botón visible
      // y mostramos el error dentro del panel para poder diagnosticarlo.
      await cargar(true);
    } catch {
      setAutorizado(false);
      setAbierto(false);
    }
  }, [cargar]);

  useEffect(() => {
    void comprobarAcceso();

    const refrescar = () => {
      if (document.visibilityState === 'visible') void comprobarAcceso();
    };
    const refrescarSecretaria = () => {
      void cargar(true);
    };

    window.addEventListener('focus', refrescar);
    window.addEventListener('mitico:secretaria-updated', refrescarSecretaria);
    document.addEventListener('visibilitychange', refrescar);
    return () => {
      window.removeEventListener('focus', refrescar);
      window.removeEventListener('mitico:secretaria-updated', refrescarSecretaria);
      document.removeEventListener('visibilitychange', refrescar);
    };
  }, [comprobarAcceso, cargar]);

  const resumen = useMemo(() => {
    const hoy = fechaHoyMadrid();
    const activas = registros.filter(esActiva);
    return {
      pendientes: activas.length,
      urgentes: activas.filter((item) => item.prioridad === 'urgente').length,
      hoy: activas.filter((item) => item.fecha_limite === hoy).length,
      resueltas: registros.filter((item) => item.estado === 'resuelto').length,
      notas: registros.filter((item) => item.tipo === 'nota').length,
    };
  }, [registros]);

  const visibles = useMemo(() => {
    const texto = busqueda.trim().toLocaleLowerCase('es');

    return registros.filter((item) => {
      if (filtroEstado === 'activas' && !esActiva(item)) return false;
      if (filtroEstado === 'resueltas' && item.estado !== 'resuelto') return false;
      if (filtroEstado === 'notas' && item.tipo !== 'nota') return false;
      if (filtroCategoria !== 'todas' && item.categoria !== filtroCategoria) {
        return false;
      }

      if (texto) {
        const hay = [
          item.titulo,
          item.detalle,
          item.alumno,
          item.entrenador,
          item.nombre_grupo,
          item.modalidad,
          categoriaLabel(item.categoria),
        ]
          .filter(Boolean)
          .join(' ')
          .toLocaleLowerCase('es');
        if (!hay.includes(texto)) return false;
      }

      return true;
    });
  }, [registros, filtroEstado, filtroCategoria, busqueda]);

  if (!autorizado) return null;

  const abrirNueva = () => {
    setEditandoId(null);
    setForm(FORM_INICIAL);
    setEditorAbierto(true);
  };

  const abrirEditar = (item: SecretariaRegistro) => {
    setEditandoId(item.id);
    setForm({
      tipo: item.tipo,
      prioridad: item.prioridad,
      categoria: item.categoria,
      titulo: item.titulo,
      detalle: item.detalle || '',
      fechaEvento: item.fecha_evento || '',
      fechaLimite: item.fecha_limite || '',
    });
    setEditorAbierto(true);
  };

  const guardar = async (event: FormEvent) => {
    event.preventDefault();
    if (!form.titulo.trim() || guardando) return;

    setGuardando(true);
    setError('');

    const existente = editandoId
      ? registros.find((item) => item.id === editandoId)
      : null;

    const input: SecretariaEntradaInput = {
      tipo: form.tipo,
      estado:
        form.tipo === 'nota'
          ? 'referencia'
          : existente?.tipo === 'tarea' &&
              ['pendiente', 'en_curso', 'resuelto'].includes(existente.estado)
            ? (existente.estado as 'pendiente' | 'en_curso' | 'resuelto')
            : 'pendiente',
      prioridad: form.tipo === 'nota' ? 'normal' : form.prioridad,
      categoria: form.categoria,
      titulo: form.titulo.trim(),
      detalle: form.detalle.trim() || null,
      fecha_evento: form.fechaEvento || null,
      fecha_limite: form.tipo === 'tarea' ? form.fechaLimite || null : null,
      etiquetas: existente?.etiquetas || [],
      origen: 'app',
    };

    try {
      if (editandoId) {
        await actualizarEntradaSecretaria(editandoId, input);
      } else {
        await crearEntradaSecretaria(input);
      }
      setEditorAbierto(false);
      setEditandoId(null);
      setForm(FORM_INICIAL);
      await cargar(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
    } finally {
      setGuardando(false);
    }
  };

  const cambiarEstado = async (
    item: SecretariaRegistro,
    estado: 'pendiente' | 'en_curso' | 'resuelto'
  ) => {
    try {
      await actualizarEntradaSecretaria(item.id, { estado });
      await cargar(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo actualizar.');
    }
  };

  const eliminar = async (item: SecretariaRegistro) => {
    const confirmado = window.confirm(
      `¿Eliminar definitivamente “${item.titulo}”?\n\nEsta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      await eliminarEntradaSecretaria(item.id);
      await cargar(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo eliminar.');
    }
  };

  const eliminarResueltas = async () => {
    if (!resumen.resueltas) return;
    const confirmado = window.confirm(
      `Vas a eliminar definitivamente ${resumen.resueltas} tarea${
        resumen.resueltas === 1 ? '' : 's'
      } resuelta${resumen.resueltas === 1 ? '' : 's'}.\n\n¿Continuar?`
    );
    if (!confirmado) return;

    try {
      await eliminarResueltasSecretaria();
      await cargar(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudieron eliminar.');
    }
  };

  return (
    <>
      <button
        type="button"
        className="secretaria-fab"
        onClick={() => setAbierto(true)}
        aria-label="Abrir Secretaría"
      >
        <span className="secretaria-fab__icon" aria-hidden="true">✓</span>
        <span>Secretaría</span>
        {resumen.pendientes > 0 && (
          <span className="secretaria-fab__badge">{resumen.pendientes}</span>
        )}
      </button>

      {abierto && (
        <section className="secretaria-panel" aria-label="Secretaría de coordinación">
          <header className="secretaria-header">
            <div>
              <span className="secretaria-header__eyebrow">COORDINACIÓN</span>
              <h2>Secretaría</h2>
              <p>Tu buzón operativo de tareas y notas.</p>
            </div>
            <button
              type="button"
              className="secretaria-close"
              onClick={() => setAbierto(false)}
              aria-label="Cerrar Secretaría"
            >
              ×
            </button>
          </header>

          <div className="secretaria-resumen">
            <button type="button" onClick={() => setFiltroEstado('activas')}>
              <strong>{resumen.pendientes}</strong>
              <span>Pendientes</span>
            </button>
            <button type="button" onClick={() => setFiltroEstado('activas')}>
              <strong>{resumen.urgentes}</strong>
              <span>Urgentes</span>
            </button>
            <button type="button" onClick={() => setFiltroEstado('activas')}>
              <strong>{resumen.hoy}</strong>
              <span>Para hoy</span>
            </button>
            <button type="button" onClick={() => setFiltroEstado('notas')}>
              <strong>{resumen.notas}</strong>
              <span>Notas</span>
            </button>
          </div>

          <div className="secretaria-toolbar">
            <button type="button" className="secretaria-new" onClick={abrirNueva}>
              + Nueva
            </button>
            <input
              type="search"
              value={busqueda}
              onChange={(event) => setBusqueda(event.target.value)}
              placeholder="Buscar…"
              aria-label="Buscar en Secretaría"
            />
            <select
              value={filtroEstado}
              onChange={(event) => setFiltroEstado(event.target.value as FiltroEstado)}
              aria-label="Filtrar por estado"
            >
              <option value="activas">Pendientes</option>
              <option value="todas">Todo</option>
              <option value="resueltas">Resueltas</option>
              <option value="notas">Notas</option>
            </select>
            <select
              value={filtroCategoria}
              onChange={(event) => setFiltroCategoria(event.target.value)}
              aria-label="Filtrar por categoría"
            >
              <option value="todas">Todas las categorías</option>
              {CATEGORIAS.map((categoria) => (
                <option key={categoria.value} value={categoria.value}>
                  {categoria.label}
                </option>
              ))}
            </select>
          </div>

          {error && <div className="secretaria-error">{error}</div>}

          <div className="secretaria-lista">
            {cargando ? (
              <div className="secretaria-vacio">Cargando Secretaría…</div>
            ) : visibles.length === 0 ? (
              <div className="secretaria-vacio">
                <strong>No hay nada aquí.</strong>
                <span>Cuando apuntes algo aparecerá organizado en este panel.</span>
              </div>
            ) : (
              visibles.map((item) => (
                <article
                  key={item.id}
                  className={`secretaria-card secretaria-card--${item.prioridad}`}
                >
                  <div className="secretaria-card__top">
                    <div className="secretaria-card__badges">
                      <span>{item.tipo === 'nota' ? 'Nota' : categoriaLabel(item.categoria)}</span>
                      {item.tipo === 'tarea' && item.prioridad !== 'normal' && (
                        <span className={`secretaria-prioridad secretaria-prioridad--${item.prioridad}`}>
                          {prioridadLabel(item.prioridad)}
                        </span>
                      )}
                      {item.estado === 'en_curso' && <span>En curso</span>}
                      {item.estado === 'resuelto' && <span>Resuelto</span>}
                    </div>
                    <button type="button" onClick={() => abrirEditar(item)}>
                      Editar
                    </button>
                  </div>

                  <h3>{item.titulo}</h3>
                  {item.detalle && <p>{item.detalle}</p>}

                  <div className="secretaria-card__meta">
                    {item.fecha_evento && (
                      <span>📅 Asunto: {fechaCorta(item.fecha_evento)}</span>
                    )}
                    {item.fecha_limite && (
                      <span>⏱ Límite: {fechaCorta(item.fecha_limite)}</span>
                    )}
                    {item.alumno && <span>Alumno: {item.alumno}</span>}
                    {item.entrenador && <span>Entrenador: {item.entrenador}</span>}
                    {item.nombre_grupo && <span>Grupo: {item.nombre_grupo}</span>}
                  </div>

                  <div className="secretaria-card__actions">
                    {item.tipo === 'tarea' && item.estado === 'pendiente' && (
                      <button
                        type="button"
                        onClick={() => void cambiarEstado(item, 'en_curso')}
                      >
                        En curso
                      </button>
                    )}
                    {item.tipo === 'tarea' && item.estado !== 'resuelto' && (
                      <button
                        type="button"
                        className="secretaria-resolver"
                        onClick={() => void cambiarEstado(item, 'resuelto')}
                      >
                        Resolver
                      </button>
                    )}
                    {item.tipo === 'tarea' && item.estado === 'resuelto' && (
                      <button
                        type="button"
                        onClick={() => void cambiarEstado(item, 'pendiente')}
                      >
                        Reabrir
                      </button>
                    )}
                    <button
                      type="button"
                      className="secretaria-eliminar"
                      onClick={() => void eliminar(item)}
                    >
                      Eliminar
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>

          <footer className="secretaria-footer">
            <span>{visibles.length} visibles · {registros.length} totales</span>
            {resumen.resueltas > 0 && (
              <button type="button" onClick={() => void eliminarResueltas()}>
                Eliminar resueltas ({resumen.resueltas})
              </button>
            )}
          </footer>

          {editorAbierto && (
            <div className="secretaria-modal" role="dialog" aria-modal="true">
              <form className="secretaria-editor" onSubmit={guardar}>
                <header>
                  <div>
                    <strong>{editandoId ? 'Editar entrada' : 'Nueva entrada'}</strong>
                    <span>Tarea para hacer o nota de referencia.</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditorAbierto(false)}
                    aria-label="Cerrar editor"
                  >
                    ×
                  </button>
                </header>

                <div className="secretaria-editor__grid">
                  <label>
                    Tipo
                    <select
                      value={form.tipo}
                      onChange={(event) =>
                        setForm((actual) => ({
                          ...actual,
                          tipo: event.target.value as 'tarea' | 'nota',
                        }))
                      }
                    >
                      <option value="tarea">Tarea pendiente</option>
                      <option value="nota">Nota de referencia</option>
                    </select>
                  </label>

                  <label>
                    Categoría
                    <select
                      value={form.categoria}
                      onChange={(event) =>
                        setForm((actual) => ({
                          ...actual,
                          categoria: event.target.value as SecretariaEntradaInput['categoria'],
                        }))
                      }
                    >
                      {CATEGORIAS.map((categoria) => (
                        <option key={categoria.value} value={categoria.value}>
                          {categoria.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  {form.tipo === 'tarea' && (
                    <label>
                      Prioridad
                      <select
                        value={form.prioridad}
                        onChange={(event) =>
                          setForm((actual) => ({
                            ...actual,
                            prioridad: event.target.value as FormSecretaria['prioridad'],
                          }))
                        }
                      >
                        {PRIORIDADES.map((prioridad) => (
                          <option key={prioridad.value} value={prioridad.value}>
                            {prioridad.label}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}

                  <label>
                    Fecha del asunto
                    <input
                      type="date"
                      value={form.fechaEvento}
                      onChange={(event) =>
                        setForm((actual) => ({ ...actual, fechaEvento: event.target.value }))
                      }
                    />
                  </label>

                  {form.tipo === 'tarea' && (
                    <label>
                      Fecha límite
                      <input
                        type="date"
                        value={form.fechaLimite}
                        onChange={(event) =>
                          setForm((actual) => ({ ...actual, fechaLimite: event.target.value }))
                        }
                      />
                    </label>
                  )}
                </div>

                <label>
                  Título
                  <input
                    type="text"
                    value={form.titulo}
                    maxLength={180}
                    required
                    placeholder="Ej. Llamar a la familia de…"
                    onChange={(event) =>
                      setForm((actual) => ({ ...actual, titulo: event.target.value }))
                    }
                  />
                </label>

                <label>
                  Detalle
                  <textarea
                    value={form.detalle}
                    maxLength={6000}
                    rows={5}
                    placeholder="Lo que necesites recordar…"
                    onChange={(event) =>
                      setForm((actual) => ({ ...actual, detalle: event.target.value }))
                    }
                  />
                </label>

                <div className="secretaria-editor__actions">
                  <button type="button" onClick={() => setEditorAbierto(false)}>
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="secretaria-editor__save"
                    disabled={guardando || !form.titulo.trim()}
                  >
                    {guardando ? 'Guardando…' : editandoId ? 'Guardar cambios' : 'Añadir'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </section>
      )}
    </>
  );
}
