import React from 'react';
import { createPortal } from 'react-dom';
import type { ModalidadDisponibilidadEditor } from './availabilityEditor';

type AvailabilityScreenProps = {
  ctx: Record<string, any>;
};

export function AvailabilityScreen({ ctx }: AvailabilityScreenProps) {
  const {
    activarDiaDisponibilidadEditor,
    actualizarBorradorDisponibilidadEditor,
    actualizarTurnoDisponibilidadEditor,
    agendaBloqueBlanco,
    alternarModalidadDisponibilidadEditor,
    anioInicioTemporadaAgenda,
    añadirTurnoDisponibilidadEditor,
    borradorDisponibilidadEditor,
    botonAsistenciaAusente,
    botonAsistenciaOff,
    botonAsistenciaOk,
    busquedaDisponibilidad,
    capitalizarPrimera,
    cargando,
    categoriaResumenDisponibilidad,
    diaDisponibilidadEditorAbierto,
    diaPermiteVariosTurnosDisponibilidadEditor,
    diasTrabajoSemanaAgenda,
    disponibilidadPorTurno,
    disponibilidadSemanalEntrenador,
    duplicarTurnoDisponibilidadEditor,
    eliminarTurnoDisponibilidadEditor,
    error,
    estadoServidorDisponibilidadEditor,
    fechaLimiteAutomaticaDisponibilidadEditor,
    filtroDisponibilidad,
    formatearFecha,
    gridFormulario,
    guardandoDisponibilidadEditor,
    guardarBorradorDisponibilidadEditor,
    labelCampo,
    mensajeDisponibilidadEditor,
    mesAgendaActivo,
    mesesAgenda,
    nombreMesAgendaDesdeClave,
    nombreTemporadaAgenda,
    opcionesTemporadaAgenda,
    pantalla,
    publicadaAtDisponibilidadEditor,
    publicandoDisponibilidadEditor,
    publicarDisponibilidadEditor,
    rangoSemanaAgenda,
    responderDisponibilidadRapida,
    restaurarPlantillaDisponibilidadEditor,
    resumenBorradorDisponibilidadEditor,
    retirandoDisponibilidadEditor,
    retirarDisponibilidadEditor,
    selectCampoAgenda,
    semanaAgendaActiva,
    semanasAgenda,
    setAnioInicioTemporadaAgenda,
    setBusquedaDisponibilidad,
    setCategoriaResumenDisponibilidad,
    setDiaDisponibilidadEditorAbierto,
    setFiltroDisponibilidad,
    setMesAgenda,
    setSemanaAgendaInicio,
    setTurnoResumenDisponibilidadAbierto,
    setVistaPreviaDisponibilidadEditor,
    turnoResumenDisponibilidadAbierto,
    vistaPreviaDisponibilidadEditor,
  } = ctx;

  return (
    <>
      {pantalla === 'disponibilidad' && (
        <section style={{ display: 'grid', gap: 16 }}>
          <div className="availability-flow-card">
            <div className="availability-flow-head">
              <div>
                <h2>Disponibilidad semanal</h2>
                <p>
                  Configura solo los días y turnos reales de la semana y publica
                  la versión que verá la Vista entrenador.
                </p>
              </div>

              <div className="availability-editor-hero-status">
                <strong>
                  {estadoServidorDisponibilidadEditor === 'publicado'
                    ? 'Semana publicada'
                    : estadoServidorDisponibilidadEditor === 'borrador'
                    ? 'Borrador'
                    : 'Sin preparar'}
                </strong>
                {estadoServidorDisponibilidadEditor === 'publicado' && (
                  <span className="availability-editor-published-week">
                    {borradorDisponibilidadEditor?.semana_inicio
                      ? rangoSemanaAgenda(borradorDisponibilidadEditor.semana_inicio)
                      : '-'}
                  </span>
                )}
                <span>
                  {resumenBorradorDisponibilidadEditor.dias} días ·{' '}
                  {resumenBorradorDisponibilidadEditor.turnos} turnos
                </span>
              </div>
            </div>

            <details className="availability-flow-details">
              <summary>Ayuda rápida · ver flujo</summary>
              <ol>
                <li>Selecciona la semana que vas a preparar.</li>
                <li>Activa solo los días reales y ajusta sus turnos.</li>
                <li>Guarda borrador mientras estés revisando.</li>
                <li>Publica cuando la semana ya esté correcta.</li>
                <li>
                  Revisa después las respuestas en “Disponibilidad recibida por
                  turno”.
                </li>
                <li>
                  La Vista entrenador usará siempre la última versión publicada.
                </li>
              </ol>
            </details>
          </div>

          <section className="availability-response-summary">
            <header className="availability-response-summary-header">
              <div>
                <h3>Disponibilidad recibida por turno</h3>
              </div>
              <span className="availability-response-total">
                {disponibilidadPorTurno.length}{' '}
                {disponibilidadPorTurno.length === 1 ? 'turno' : 'turnos'}
              </span>
            </header>

            <div className="availability-response-controls">
              <input
                value={busquedaDisponibilidad}
                onChange={(e) => setBusquedaDisponibilidad(e.target.value)}
                placeholder="Buscar entrenador..."
                aria-label="Buscar entrenador en disponibilidad"
              />
              <div className="availability-response-filter-buttons">
                <button
                  type="button"
                  className={filtroDisponibilidad === 'todos' ? 'is-active' : ''}
                  onClick={() => setFiltroDisponibilidad('todos')}
                >
                  Todos
                </button>
                <button
                  type="button"
                  className={
                    filtroDisponibilidad === 'disponibles' ? 'is-active' : ''
                  }
                  onClick={() => setFiltroDisponibilidad('disponibles')}
                >
                  Disponibles
                </button>
                <button
                  type="button"
                  className={
                    filtroDisponibilidad === 'no_puedo' ? 'is-active' : ''
                  }
                  onClick={() => setFiltroDisponibilidad('no_puedo')}
                >
                  No pueden
                </button>
                <button
                  type="button"
                  className={
                    filtroDisponibilidad === 'pendientes' ? 'is-active' : ''
                  }
                  onClick={() => setFiltroDisponibilidad('pendientes')}
                >
                  Pendientes
                </button>
              </div>
            </div>

            {cargando && <p>Cargando disponibilidad...</p>}

            {!cargando &&
              disponibilidadSemanalEntrenador.length === 0 &&
              !error && (
                <article className="availability-response-empty">
                  <strong>Sin disponibilidad creada para esta semana</strong>
                  <span>
                    Selecciona la semana y utiliza el sistema de respaldo hasta
                    conectar la publicación del Sprint 2B.
                  </span>
                </article>
              )}

            <div className="availability-response-turns">
              {disponibilidadPorTurno.map((turno) => {
                const abierto =
                  turnoResumenDisponibilidadAbierto === turno.clave;
                const categoriaActiva =
                  categoriaResumenDisponibilidad[turno.clave] ||
                  'disponibles';
                const personasCategoria =
                  categoriaActiva === 'disponibles'
                    ? turno.disponibles
                    : categoriaActiva === 'no_puedo'
                    ? turno.no_puedo
                    : turno.pendientes;
                const tituloCategoria =
                  categoriaActiva === 'disponibles'
                    ? 'Disponibles para asignar'
                    : categoriaActiva === 'no_puedo'
                    ? 'No pueden asistir'
                    : 'Pendientes de contestar';

                return (
                  <article
                    key={turno.clave}
                    className={`availability-response-turn ${
                      abierto ? 'is-open' : ''
                    }`}
                  >
                    <button
                      type="button"
                      className="availability-response-turn-header"
                      aria-expanded={abierto}
                      onClick={() => {
                        setTurnoResumenDisponibilidadAbierto((actual) =>
                          actual === turno.clave ? null : turno.clave
                        );
                        setCategoriaResumenDisponibilidad((actual) => ({
                          ...actual,
                          [turno.clave]:
                            actual[turno.clave] || 'disponibles',
                        }));
                      }}
                    >
                      <span className="availability-response-turn-date">
                        <strong>
                          {capitalizarPrimera(
                            new Date(
                              `${turno.fecha}T00:00:00`
                            ).toLocaleDateString('es-ES', {
                              weekday: 'long',
                            })
                          )}{' '}
                          {formatearFecha(turno.fecha)}
                        </strong>
                        <small>
                          {turno.hora_inicio.slice(0, 5)}–
                          {turno.hora_fin.slice(0, 5)}
                        </small>
                      </span>
                      <span className="availability-response-counts">
                        <b className="is-success">
                          {turno.disponibles.length} disponibles
                        </b>
                        <b className="is-danger">
                          {turno.no_puedo.length} no pueden
                        </b>
                        <b className="is-warning">
                          {turno.pendientes.length} pendientes
                        </b>
                      </span>
                      <span
                        className="availability-response-chevron"
                        aria-hidden="true"
                      >
                        {abierto ? '⌃' : '⌄'}
                      </span>
                    </button>

                    {abierto && (
                      <div className="availability-response-turn-body">
                        <div className="availability-response-category-buttons">
                          <button
                            type="button"
                            className={`is-success ${
                              categoriaActiva === 'disponibles'
                                ? 'is-selected'
                                : ''
                            }`}
                            onClick={() =>
                              setCategoriaResumenDisponibilidad((actual) => ({
                                ...actual,
                                [turno.clave]: 'disponibles',
                              }))
                            }
                          >
                            Disponibles · {turno.disponibles.length}
                          </button>
                          <button
                            type="button"
                            className={`is-danger ${
                              categoriaActiva === 'no_puedo'
                                ? 'is-selected'
                                : ''
                            }`}
                            onClick={() =>
                              setCategoriaResumenDisponibilidad((actual) => ({
                                ...actual,
                                [turno.clave]: 'no_puedo',
                              }))
                            }
                          >
                            No pueden · {turno.no_puedo.length}
                          </button>
                          <button
                            type="button"
                            className={`is-warning ${
                              categoriaActiva === 'pendientes'
                                ? 'is-selected'
                                : ''
                            }`}
                            onClick={() =>
                              setCategoriaResumenDisponibilidad((actual) => ({
                                ...actual,
                                [turno.clave]: 'pendientes',
                              }))
                            }
                          >
                            Pendientes · {turno.pendientes.length}
                          </button>
                        </div>

                        <section className="availability-response-people">
                          <strong>{tituloCategoria}</strong>
                          {personasCategoria.length > 0 ? (
                            <div>
                              {personasCategoria.map((persona) => (
                                <span key={`${turno.clave}-${persona}`}>
                                  {persona}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p>No hay entrenadores en este estado.</p>
                          )}
                        </section>

                        <button
                          type="button"
                          className="availability-response-ready"
                          onClick={() =>
                            setTurnoResumenDisponibilidadAbierto(null)
                          }
                        >
                          Listo, cerrar turno
                        </button>
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>

          <article style={agendaBloqueBlanco}>
            <h3 style={{ marginTop: 0 }}>Semana que estás pidiendo</h3>
            <div style={gridFormulario}>
              <label style={labelCampo}>
                Temporada
                <select
                  value={anioInicioTemporadaAgenda}
                  style={selectCampoAgenda}
                  onChange={(e) => {
                    const nuevoAnio = Number(e.target.value);
                    setAnioInicioTemporadaAgenda(nuevoAnio);
                    setMesAgenda(`${nuevoAnio}-09`);
                    setSemanaAgendaInicio('');
                  }}
                >
                  {opcionesTemporadaAgenda.map((anio) => (
                    <option key={anio} value={anio}>
                      {nombreTemporadaAgenda(anio)}
                    </option>
                  ))}
                </select>
              </label>

              <label style={labelCampo}>
                Mes
                <select
                  value={mesAgendaActivo}
                  style={selectCampoAgenda}
                  onChange={(e) => {
                    setMesAgenda(e.target.value);
                    setSemanaAgendaInicio('');
                  }}
                >
                  {mesesAgenda.map((clave) => (
                    <option key={clave} value={clave}>
                      {nombreMesAgendaDesdeClave(clave)}
                    </option>
                  ))}
                </select>
              </label>

              <label style={labelCampo}>
                Semana lunes-domingo
                <select
                  value={semanaAgendaActiva}
                  onChange={(e) => setSemanaAgendaInicio(e.target.value)}
                >
                  {semanasAgenda.map((semana) => (
                    <option key={semana} value={semana}>
                      Semana {rangoSemanaAgenda(semana)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p style={{ margin: '10px 0 0', fontWeight: 800 }}>
              Disponibilidad seleccionada: Semana{' '}
              {semanaAgendaActiva ? rangoSemanaAgenda(semanaAgendaActiva) : '-'}
            </p>
          </article>

          {borradorDisponibilidadEditor && (
            <section className="availability-editor-shell">
              <header className="availability-editor-toolbar">
                <div>
                  <div className="availability-editor-title-row">
                    <span className="availability-editor-kicker">EDITOR DE LA SEMANA</span>
                    <span
                      className={`availability-server-status availability-server-status--${estadoServidorDisponibilidadEditor}`}
                    >
                      {estadoServidorDisponibilidadEditor === 'publicado'
                        ? 'Publicado'
                        : estadoServidorDisponibilidadEditor === 'borrador'
                        ? 'Borrador en Supabase'
                        : 'Sin preparar'}
                    </span>
                  </div>
                  <h3>
                    {rangoSemanaAgenda(
                      borradorDisponibilidadEditor.semana_inicio
                    )}
                  </h3>
                  <p>{mensajeDisponibilidadEditor}</p>
                  {publicadaAtDisponibilidadEditor && (
                    <small className="availability-published-at">
                      Última publicación:{' '}
                      {new Date(publicadaAtDisponibilidadEditor).toLocaleString(
                        'es-ES',
                        {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        }
                      )}
                    </small>
                  )}
                </div>
                <div className="availability-editor-actions">
                  <button
                    type="button"
                    className="availability-soft-button"
                    onClick={restaurarPlantillaDisponibilidadEditor}
                  >
                    Restaurar plantilla
                  </button>
                  <button
                    type="button"
                    className="availability-soft-button"
                    onClick={() => setVistaPreviaDisponibilidadEditor(true)}
                  >
                    Vista previa
                  </button>
                  <button
                    type="button"
                    className="availability-primary-button"
                    onClick={() => void guardarBorradorDisponibilidadEditor()}
                    disabled={
                      guardandoDisponibilidadEditor ||
                      publicandoDisponibilidadEditor
                    }
                  >
                    {guardandoDisponibilidadEditor
                      ? 'Guardando...'
                      : 'Guardar borrador'}
                  </button>
                </div>
              </header>

              <div className="availability-deadline-row">
                <div className="availability-deadline-control">
                  <label>
                    Fecha y hora límite para responder
                    <input
                      type="datetime-local"
                      value={borradorDisponibilidadEditor.fecha_limite}
                      onChange={(event) =>
                        actualizarBorradorDisponibilidadEditor((actual) => ({
                          ...actual,
                          fecha_limite: event.target.value,
                          fecha_limite_manual: true,
                        }))
                      }
                    />
                  </label>
                  <div className="availability-deadline-help">
                    <span>
                      {borradorDisponibilidadEditor.fecha_limite_manual
                        ? 'Fecha modificada manualmente.'
                        : 'Automática: martes de esta semana a las 13:00.'}
                    </span>
                    {borradorDisponibilidadEditor.fecha_limite_manual && (
                      <button
                        type="button"
                        onClick={() =>
                          actualizarBorradorDisponibilidadEditor((actual) => ({
                            ...actual,
                            fecha_limite:
                              fechaLimiteAutomaticaDisponibilidadEditor(
                                actual.semana_inicio
                              ),
                            fecha_limite_manual: false,
                          }))
                        }
                      >
                        Usar martes 13:00
                      </button>
                    )}
                  </div>
                </div>
                <div className="availability-editor-summary">
                  <span>
                    <strong>{resumenBorradorDisponibilidadEditor.dias}</strong>
                    días activos
                  </span>
                  <span>
                    <strong>{resumenBorradorDisponibilidadEditor.turnos}</strong>
                    turnos
                  </span>
                </div>
              </div>

              <div className="availability-days-editor">
                {borradorDisponibilidadEditor.dias.map((dia) => {
                  const abierto =
                    diaDisponibilidadEditorAbierto === dia.fecha;
                  const permiteVarios =
                    diaPermiteVariosTurnosDisponibilidadEditor(dia.nombre);
                  const resumenTurnosDia =
                    dia.turnos.length > 0
                      ? dia.turnos
                          .map(
                            (turno) =>
                              `${turno.hora_inicio}–${turno.hora_fin}`
                          )
                          .join(' · ')
                      : 'Sin turno configurado';

                  return (
                    <article
                      key={dia.fecha}
                      className={`availability-day-editor ${
                        dia.activo ? 'is-active' : 'is-inactive'
                      } ${abierto ? 'is-open' : ''}`}
                    >
                      <header className="availability-day-editor-header">
                        <button
                          type="button"
                          className="availability-day-editor-open"
                          disabled={!dia.activo}
                          aria-expanded={abierto}
                          onClick={() =>
                            setDiaDisponibilidadEditorAbierto((actual) =>
                              actual === dia.fecha ? null : dia.fecha
                            )
                          }
                        >
                          <span className="availability-day-editor-name">
                            {capitalizarPrimera(dia.nombre)}
                          </span>
                          <strong>{formatearFecha(dia.fecha)}</strong>
                          <small>
                            {dia.activo
                              ? `${dia.turnos.length} ${
                                  dia.turnos.length === 1 ? 'turno' : 'turnos'
                                } · ${resumenTurnosDia}`
                              : 'No se publicará'}
                          </small>
                          <span
                            className="availability-day-editor-chevron"
                            aria-hidden="true"
                          >
                            {abierto ? '⌃' : '⌄'}
                          </span>
                        </button>

                        <label
                          className="availability-day-toggle"
                          onClick={(event) => event.stopPropagation()}
                        >
                          <input
                            type="checkbox"
                            checked={dia.activo}
                            onChange={(event) =>
                              activarDiaDisponibilidadEditor(
                                dia.fecha,
                                event.target.checked
                              )
                            }
                          />
                          <span>
                            {dia.activo ? 'Se publica' : 'No se publica'}
                          </span>
                        </label>
                      </header>

                      {dia.activo && abierto && (
                        <div className="availability-turns-editor">
                          <div className="availability-day-rule">
                            <strong>
                              {permiteVarios
                                ? 'Puedes añadir varios turnos'
                                : 'Este día tiene un único turno'}
                            </strong>
                            <span>
                              {permiteVarios
                                ? 'Sábado y domingo permiten varios horarios.'
                                : 'Miércoles, jueves y viernes no admiten turnos duplicados.'}
                            </span>
                          </div>

                          {dia.turnos.map((turno, indice) => (
                            <section
                              key={turno.id}
                              className="availability-turn-editor"
                            >
                              <div className="availability-turn-editor-title">
                                <strong>
                                  {permiteVarios
                                    ? `Turno ${indice + 1}`
                                    : 'Turno único'}
                                </strong>
                                {permiteVarios && (
                                  <div>
                                    <button
                                      type="button"
                                      onClick={() =>
                                        duplicarTurnoDisponibilidadEditor(
                                          dia.fecha,
                                          turno.id
                                        )
                                      }
                                    >
                                      Duplicar
                                    </button>
                                    <button
                                      type="button"
                                      className="is-danger"
                                      onClick={() =>
                                        eliminarTurnoDisponibilidadEditor(
                                          dia.fecha,
                                          turno.id
                                        )
                                      }
                                    >
                                      Eliminar
                                    </button>
                                  </div>
                                )}
                              </div>

                              <div className="availability-time-grid">
                                <label>
                                  Inicio
                                  <span className="availability-native-time">
                                    <input
                                      type="time"
                                      value={turno.hora_inicio}
                                      onChange={(event) =>
                                        actualizarTurnoDisponibilidadEditor(
                                          dia.fecha,
                                          turno.id,
                                          { hora_inicio: event.target.value }
                                        )
                                      }
                                    />
                                  </span>
                                </label>
                                <label>
                                  Fin
                                  <span className="availability-native-time">
                                    <input
                                      type="time"
                                      value={turno.hora_fin}
                                      onChange={(event) =>
                                        actualizarTurnoDisponibilidadEditor(
                                          dia.fecha,
                                          turno.id,
                                          { hora_fin: event.target.value }
                                        )
                                      }
                                    />
                                  </span>
                                </label>
                              </div>

                              <fieldset className="availability-modalities">
                                <legend>Modalidades previstas</legend>
                                {(
                                  [
                                    'Baby',
                                    'Ocio',
                                    'Intensivos',
                                  ] as ModalidadDisponibilidadEditor[]
                                ).map((modalidad) => (
                                  <label
                                    key={modalidad}
                                    className={`availability-modality-chip availability-modality-chip--${modalidad.toLowerCase()}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={turno.modalidades.includes(
                                        modalidad
                                      )}
                                      onChange={() =>
                                        alternarModalidadDisponibilidadEditor(
                                          dia.fecha,
                                          turno.id,
                                          modalidad
                                        )
                                      }
                                    />
                                    <span>{modalidad}</span>
                                  </label>
                                ))}
                              </fieldset>

                              <label className="availability-note-field">
                                Nota interna opcional
                                <input
                                  value={turno.nota}
                                  onChange={(event) =>
                                    actualizarTurnoDisponibilidadEditor(
                                      dia.fecha,
                                      turno.id,
                                      { nota: event.target.value }
                                    )
                                  }
                                  placeholder="Ej.: solo si hay alumnos, cambio de instalación..."
                                />
                              </label>
                            </section>
                          ))}

                          {permiteVarios && (
                            <button
                              type="button"
                              className="availability-add-turn"
                              onClick={() =>
                                añadirTurnoDisponibilidadEditor(dia.fecha)
                              }
                            >
                              + Añadir turno
                            </button>
                          )}

                          <button
                            type="button"
                            className="availability-day-ready"
                            onClick={() =>
                              setDiaDisponibilidadEditorAbierto(null)
                            }
                          >
                            Listo, cerrar día
                          </button>
                        </div>
                      )}
                    </article>
                  );
                })}
              </div>

              <footer className="availability-editor-footer">
                <div>
                  <strong>Publicación protegida en Supabase</strong>
                  <span>
                    Guardar conserva el borrador. Publicar crea una copia estable
                    de esta semana. La Vista entrenador seguirá usando el sistema
                    actual hasta conectar Sprint 2C.
                  </span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'flex-end',
                    gap: 8,
                    flexWrap: 'wrap',
                  }}
                >
                  {estadoServidorDisponibilidadEditor === 'publicado' && (
                    <button
                      type="button"
                      onClick={() => void retirarDisponibilidadEditor()}
                      disabled={
                        guardandoDisponibilidadEditor ||
                        publicandoDisponibilidadEditor ||
                        retirandoDisponibilidadEditor
                      }
                      style={{
                        border: '1px solid #fecaca',
                        background: '#fff7f7',
                        color: '#b42318',
                        borderRadius: 12,
                        padding: '10px 12px',
                        fontWeight: 900,
                        cursor: retirandoDisponibilidadEditor
                          ? 'wait'
                          : 'pointer',
                      }}
                    >
                      {retirandoDisponibilidadEditor
                        ? 'Retirando...'
                        : 'Retirar disponibilidad'}
                    </button>
                  )}

                  <button
                    type="button"
                    className="availability-publish-button"
                    onClick={() => void publicarDisponibilidadEditor()}
                    disabled={
                      guardandoDisponibilidadEditor ||
                      publicandoDisponibilidadEditor ||
                      retirandoDisponibilidadEditor ||
                      resumenBorradorDisponibilidadEditor.turnos === 0
                    }
                  >
                    {publicandoDisponibilidadEditor
                      ? 'Publicando...'
                      : estadoServidorDisponibilidadEditor === 'publicado'
                      ? 'Volver a publicar cambios'
                      : 'Publicar disponibilidad'}
                  </button>
                </div>
              </footer>


            </section>
          )}

          <section className="availability-trainer-details">
            <div className="availability-trainer-details-header">
              <div>
                <h3>Detalle por entrenador</h3>
                <p>
                  Consulta cada entrenador por desplegables sin abrir todo el
                  histórico a la vez.
                </p>
              </div>

              <span className="availability-response-total">
                {disponibilidadSemanalEntrenador.length}{' '}
                {disponibilidadSemanalEntrenador.length === 1
                  ? 'entrenador'
                  : 'entrenadores'}
              </span>
            </div>

            <div className="availability-trainer-details-list">
              {disponibilidadSemanalEntrenador.map((grupo) => (
                <details
                  key={grupo.entrenador_id}
                  className="availability-trainer-detail-card"
                >
                  <summary className="availability-trainer-detail-summary">
                    <div className="availability-trainer-detail-name">
                      <span className="availability-editor-kicker">
                        ENTRENADOR
                      </span>
                      <strong>{grupo.entrenador}</strong>
                    </div>

                    <div className="availability-trainer-detail-metrics">
                      <span className="is-success">
                        {grupo.disponibles} disponibles
                      </span>
                      <span className="is-danger">
                        {grupo.no_puedo} no puedo
                      </span>
                      <span className="is-warning">
                        {grupo.pendientes} pendientes
                      </span>
                    </div>
                  </summary>

                  <div className="availability-trainer-detail-body">
                    {grupo.semanas.map((semana) => (
                      <section
                        key={`${grupo.entrenador_id}-${semana.inicio}`}
                        className="availability-trainer-week-card"
                      >
                        <h4>Semana {rangoSemanaAgenda(semana.inicio)}</h4>

                        <div className="availability-trainer-day-list">
                          {diasTrabajoSemanaAgenda(semana.inicio).map((dia) => {
                            const turnosDia = semana.turnos.filter(
                              (turno) => turno.fecha === dia.fecha
                            );

                            return (
                              <details
                                key={`${grupo.entrenador_id}-${dia.fecha}`}
                                className="availability-trainer-day-card"
                              >
                                <summary className="availability-trainer-day-summary">
                                  <div>
                                    <strong>
                                      {capitalizarPrimera(dia.nombre)}
                                    </strong>
                                    <span>{formatearFecha(dia.fecha)}</span>
                                  </div>
                                  <small>
                                    {turnosDia.length}{' '}
                                    {turnosDia.length === 1
                                      ? 'turno'
                                      : 'turnos'}
                                  </small>
                                </summary>

                                <div className="availability-trainer-day-turns">
                                  {turnosDia.length === 0 ? (
                                    <p className="availability-trainer-no-turns">
                                      Sin turnos publicados para este día.
                                    </p>
                                  ) : (
                                    turnosDia.map((turno) => (
                                      <div
                                        key={`${turno.fecha}-${turno.hora_inicio}-${turno.hora_fin}`}
                                        className="availability-trainer-turn-card"
                                      >
                                        <strong>
                                          {turno.hora_inicio.slice(0, 5)}–
                                          {turno.hora_fin.slice(0, 5)}
                                        </strong>

                                        <p>
                                          Respuesta:{' '}
                                          <strong>
                                            {turno.respuesta || 'Pendiente'}
                                          </strong>
                                        </p>

                                        <div className="availability-trainer-turn-actions">
                                          <button
                                            onClick={() =>
                                              responderDisponibilidadRapida(
                                                turno,
                                                'Disponible'
                                              )
                                            }
                                            style={
                                              turno.respuesta === 'Disponible'
                                                ? botonAsistenciaOk
                                                : botonAsistenciaOff
                                            }
                                          >
                                            Disponible
                                          </button>

                                          <button
                                            onClick={() =>
                                              responderDisponibilidadRapida(
                                                turno,
                                                'No puedo'
                                              )
                                            }
                                            style={
                                              turno.respuesta === 'No puedo'
                                                ? botonAsistenciaAusente
                                                : botonAsistenciaOff
                                            }
                                          >
                                            No puedo
                                          </button>
                                        </div>
                                      </div>
                                    ))
                                  )}
                                </div>
                              </details>
                            );
                          })}
                        </div>
                      </section>
                    ))}
                  </div>
                </details>
              ))}
            </div>
          </section>
        </section>
      )}

      {vistaPreviaDisponibilidadEditor &&
        borradorDisponibilidadEditor &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="availability-preview-overlay"
            role="dialog"
            aria-modal="true"
            aria-label="Vista previa de disponibilidad semanal"
          >
            <section className="availability-preview-sheet">
              <header>
                <div>
                  <span className="availability-editor-kicker">VISTA PREVIA</span>
                  <h2>
                    Semana{' '}
                    {rangoSemanaAgenda(
                      borradorDisponibilidadEditor.semana_inicio
                    )}
                  </h2>
                  <p>
                    Límite:{' '}
                    {new Date(
                      borradorDisponibilidadEditor.fecha_limite
                    ).toLocaleString('es-ES', {
                      weekday: 'long',
                      day: '2-digit',
                      month: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setVistaPreviaDisponibilidadEditor(false)}
                >
                  Cerrar
                </button>
              </header>

              <div className="availability-preview-days">
                {borradorDisponibilidadEditor.dias
                  .filter((dia) => dia.activo && dia.turnos.length > 0)
                  .map((dia) => (
                    <article key={dia.fecha}>
                      <div>
                        <strong>{capitalizarPrimera(dia.nombre)}</strong>
                        <span>{formatearFecha(dia.fecha)}</span>
                      </div>
                      <ul>
                        {dia.turnos.map((turno) => (
                          <li key={turno.id}>
                            <strong>
                              {turno.hora_inicio}–{turno.hora_fin}
                            </strong>
                            <span>{turno.modalidades.join(' · ')}</span>
                            {turno.nota && <small>{turno.nota}</small>}
                          </li>
                        ))}
                      </ul>
                    </article>
                  ))}
              </div>

              {resumenBorradorDisponibilidadEditor.turnos === 0 && (
                <p className="availability-preview-empty">
                  No hay ningún turno activo para publicar.
                </p>
              )}

              <footer>
                <button
                  type="button"
                  className="availability-soft-button"
                  onClick={() => setVistaPreviaDisponibilidadEditor(false)}
                >
                  Volver al editor
                </button>
                <button
                  type="button"
                  className="availability-primary-button"
                  disabled={
                    guardandoDisponibilidadEditor ||
                    publicandoDisponibilidadEditor
                  }
                  onClick={async () => {
                    const guardado =
                      await guardarBorradorDisponibilidadEditor();
                    if (guardado) setVistaPreviaDisponibilidadEditor(false);
                  }}
                >
                  {guardandoDisponibilidadEditor
                    ? 'Guardando...'
                    : 'Guardar borrador'}
                </button>
                <button
                  type="button"
                  className="availability-publish-button"
                  disabled={
                    guardandoDisponibilidadEditor ||
                    publicandoDisponibilidadEditor ||
                    resumenBorradorDisponibilidadEditor.turnos === 0
                  }
                  onClick={() => void publicarDisponibilidadEditor()}
                >
                  {publicandoDisponibilidadEditor
                    ? 'Publicando...'
                    : 'Publicar semana'}
                </button>
              </footer>
            </section>
          </div>,
          document.body
        )}

    </>
  );
}
