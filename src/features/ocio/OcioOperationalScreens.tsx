import React from 'react';
import { OcioRelocationRecommender } from './OcioRelocationRecommender';
import { OcioWeekPreparationPanel } from './OcioWeekPreparationPanel';

type OcioOperationalScreenProps = {
  ctx: Record<string, any>;
};

export function OcioReviewScreen({ ctx }: OcioOperationalScreenProps) {
  const {
    abrirEvaluacionOcio,
    agendaCabeceraLinea,
    asignarAlumnoGrupoOcio,
    botonPrincipal,
    botonSecundario,
    busquedaRevisionOcio,
    cabeceraPantallaMovil,
    cargarOcioAlumnos,
    cargarOcioCambios,
    cargarOcioGrupos,
    destinoRevisionOcio,
    etiquetaSuperior,
    filtroRevisionOcio,
    gridFormulario,
    gridResumenInicio,
    horaCorta,
    inputCampo,
    labelCampo,
    miniBadge,
    miniBadgeVerde,
    ocioGrupos,
    ocioRevisionBase,
    ocioRevisionFiltrada,
    pantalla,
    renderAyudaRapidaPantallaApp,
    selectCampo,
    setBusquedaRevisionOcio,
    setDestinoRevisionOcio,
    setFiltroRevisionOcio,
    tarjeta,
    tarjetaEntrenadorMovil,
    tarjetaInicioAlerta,
    tarjetaInicioRojo,
    tarjetaMovilVacia,
  } = ctx;

  return (
    <>
      {pantalla === 'revisionOcio' && (
        <section>
          <div style={cabeceraPantallaMovil}>
            <div>
              <p style={etiquetaSuperior}>OCIO · EVOLUCIÓN</p>
              <h2 style={{ margin: 0 }}>Revisión Ocio</h2>
              {renderAyudaRapidaPantallaApp()}
              <p style={{ margin: '8px 0 0', color: '#555' }}>
                Niños que pueden necesitar cambio de grupo, alumnos sin grupo y
                alumnos sin reportes.
              </p>
            </div>
            <button
              onClick={() => {
                cargarOcioAlumnos();
                cargarOcioGrupos();
                cargarOcioCambios();
              }}
              style={botonSecundario}
            >
              Actualizar revisión
            </button>
          </div>

          <div style={{ ...tarjeta, marginTop: 16 }}>
            <div style={gridFormulario}>
              <label style={labelCampo}>
                Buscar
                <input
                  value={busquedaRevisionOcio}
                  onChange={(e) => setBusquedaRevisionOcio(e.target.value)}
                  style={inputCampo}
                  placeholder="Nombre, nivel o grupo"
                />
              </label>
              <label style={labelCampo}>
                Filtro
                <select
                  value={filtroRevisionOcio}
                  onChange={(e) => setFiltroRevisionOcio(e.target.value as any)}
                  style={selectCampo}
                >
                  <option value="cambios">Solo posibles cambios</option>
                  <option value="sin_grupo">Sin grupo estable</option>
                  <option value="sin_reportes">Sin reportes</option>
                  <option value="todos">Todos</option>
                </select>
              </label>
            </div>
          </div>

          <div style={gridResumenInicio}>
            <div style={tarjetaInicioAlerta}>
              <strong>Posibles cambios</strong>
              <br />
              <span style={{ fontSize: 26, fontWeight: 900 }}>
                {
                  ocioRevisionBase.filter(
                    (alumno) => alumno.necesita_cambio_revision
                  ).length
                }
              </span>
            </div>
            <div style={tarjetaInicioRojo}>
              <strong>Sin grupo</strong>
              <br />
              <span style={{ fontSize: 26, fontWeight: 900 }}>
                {
                  ocioRevisionBase.filter((alumno) => alumno.sin_grupo_revision)
                    .length
                }
              </span>
            </div>
            <div style={tarjetaInicioAlerta}>
              <strong>Sin reportes</strong>
              <br />
              <span style={{ fontSize: 26, fontWeight: 900 }}>
                {
                  ocioRevisionBase.filter(
                    (alumno) => alumno.sin_reportes_revision
                  ).length
                }
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            {ocioRevisionFiltrada.length === 0 ? (
              <article style={tarjetaMovilVacia}>
                No hay alumnos en este filtro.
              </article>
            ) : (
              ocioRevisionFiltrada.map((alumno) => (
                <article key={alumno.alumno_id} style={tarjetaEntrenadorMovil}>
                  <div style={agendaCabeceraLinea}>
                    <div>
                      <h3 style={{ margin: 0 }}>{alumno.alumno}</h3>
                      <p style={{ margin: '6px 0 0', color: '#555' }}>
                        Nivel {alumno.nivel_usado || alumno.nivel || '-'} ·
                        Grupo actual: {alumno.grupo_estable || 'Sin grupo'}
                      </p>
                    </div>
                    <span
                      style={
                        alumno.recomendacion_revision === 'OK'
                          ? miniBadgeVerde
                          : miniBadge
                      }
                    >
                      {alumno.recomendacion_revision}
                    </span>
                  </div>

                  <div style={gridFormulario}>
                    <label style={labelCampo}>
                      Grupo destino sugerido/manual
                      <select
                        value={destinoRevisionOcio[alumno.alumno_id] || ''}
                        onChange={(e) =>
                          setDestinoRevisionOcio({
                            ...destinoRevisionOcio,
                            [alumno.alumno_id]: e.target.value,
                          })
                        }
                        style={selectCampo}
                      >
                        <option value="">Elegir grupo...</option>
                        {ocioGrupos.map((grupo) => (
                          <option key={grupo.grupo_id} value={grupo.grupo_id}>
                            {grupo.nombre_grupo} · {grupo.dia_semana}{' '}
                            {horaCorta(grupo.hora_inicio)} ·{' '}
                            {grupo.total_alumnos} niños
                          </option>
                        ))}
                      </select>
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => abrirEvaluacionOcio(alumno)}
                      style={botonSecundario}
                    >
                      Ver evaluación
                    </button>
                    <button
                      onClick={() =>
                        asignarAlumnoGrupoOcio(
                          alumno.alumno_id,
                          destinoRevisionOcio[alumno.alumno_id]
                        )
                      }
                      disabled={!destinoRevisionOcio[alumno.alumno_id]}
                      style={botonPrincipal}
                    >
                      Aceptar cambio de grupo
                    </button>
                  </div>
                </article>
              ))
            )}
          </div>
        </section>
      )}

    </>
  );
}

export function OcioChangesScreen({ ctx }: OcioOperationalScreenProps) {
  const {
    abrirFormularioCambioOcio,
    agendaBloqueBlanco,
    agendaCabeceraLinea,
    agendaHeroOcio,
    agendaVacio,
    anioInicioTemporadaAgenda,
    avisoCompleto,
    avisoNeutral,
    botonPeligroMini,
    botonPrincipal,
    botonSecundario,
    cambiosOcioSemana,
    capitalizarPrimera,
    cargarOcioAlumnos,
    cargarOcioCambios,
    cargarOcioGrupos,
    eliminarCambioPuntualOcio,
    etiquetaSuperior,
    fechaCambioOcioPorDia,
    formatearFecha,
    gridFormulario,
    gridResumenInicio,
    guardarCambioPuntualOcio,
    horaCorta,
    horarioTurnoOcio,
    labelCampo,
    limpiarFormularioCambioOcio,
    mesAgendaActivo,
    mesesAgenda,
    miniTarjetaBlanca,
    mostrarFormularioOcioCambio,
    nombreMesAgendaDesdeClave,
    ocioAlumnoCambioSeleccionado,
    ocioAlumnos,
    ocioCambioForm,
    ocioRevisionBase,
    opcionesTemporadaAgenda,
    panelRevisionIntegradaOcio,
    pantalla,
    rangoSemanaAgenda,
    renderAyudaRapidaPantallaApp,
    selectCampo,
    semanaActualAgenda,
    semanaAgendaActiva,
    semanasAgenda,
    setAnioInicioTemporadaAgenda,
    setMesAgenda,
    setOcioCambioForm,
    setPantalla,
    setSemanaAgendaInicio,
    summaryChuletaApp,
    tarjeta,
    textareaCampo,
    textoSinAcentosGrupoApp,
  } = ctx;

  return (
    <>
      {pantalla === 'ocioCambios' && (
        <section style={{ display: 'grid', gap: 18 }}>
          <article style={agendaHeroOcio}>
            <div>
              <p style={etiquetaSuperior}>OCIO · SEMANA</p>
              <h2 style={{ margin: 0 }}>Cambios puntuales</h2>
              {renderAyudaRapidaPantallaApp()}

            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button
                onClick={() => abrirFormularioCambioOcio()}
                style={botonPrincipal}
              >
                + Cambio puntual
              </button>
              <button
                onClick={() => {
                  cargarOcioAlumnos();
                  cargarOcioGrupos();
                  cargarOcioCambios();
                }}
                style={botonSecundario}
              >
                Actualizar
              </button>
            </div>
          </article>

          <article style={agendaBloqueBlanco}>
            <h3 style={{ marginTop: 0 }}>Semana</h3>
            <div style={gridFormulario}>
              <label style={labelCampo}>
                Temporada
                <select
                  value={anioInicioTemporadaAgenda}
                  onChange={(e) => {
                    setAnioInicioTemporadaAgenda(Number(e.target.value));
                    setSemanaAgendaInicio('');
                  }}
                >
                  {opcionesTemporadaAgenda.map((anio) => (
                    <option key={anio} value={anio}>
                      {anio}/{anio + 1}
                    </option>
                  ))}
                </select>
              </label>
              <label style={labelCampo}>
                Mes
                <select
                  value={mesAgendaActivo}
                  onChange={(e) => {
                    setMesAgenda(e.target.value);
                    setSemanaAgendaInicio('');
                  }}
                >
                  {mesesAgenda.map((mes) => (
                    <option key={mes} value={mes}>
                      {capitalizarPrimera(nombreMesAgendaDesdeClave(mes))}
                    </option>
                  ))}
                </select>
              </label>
              <label style={labelCampo}>
                <span>Semana lunes-domingo</span>
                <select
                  value={semanaAgendaActiva}
                  onChange={(e) => setSemanaAgendaInicio(e.target.value)}
                  style={selectCampo}
                >
                  {semanasAgenda.map((semana) => (
                    <option key={semana} value={semana}>
                      Semana {rangoSemanaAgenda(semana)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>

          {mostrarFormularioOcioCambio && (
            <article style={{ ...tarjeta, border: '2px solid #111' }}>
              <h3 style={{ marginTop: 0 }}>
                {ocioCambioForm.id
                  ? 'Modificar cambio puntual'
                  : 'Nuevo cambio puntual'}
              </h3>
              <div style={gridFormulario}>
                <label style={labelCampo}>
                  Alumno
                  <select
                    value={ocioCambioForm.alumnoId}
                    onChange={(e) =>
                      setOcioCambioForm({
                        ...ocioCambioForm,
                        alumnoId: e.target.value,
                        diaDestino: '',
                        grupoDestinoId: '',
                        fecha: '',
                      })
                    }
                  >
                    <option value="">Seleccionar alumno</option>
                    {ocioAlumnos
                      .slice()
                      .sort((a, b) => a.alumno.localeCompare(b.alumno))
                      .map((alumno) => (
                        <option
                          key={`cambio-alumno-${alumno.alumno_id}`}
                          value={alumno.alumno_id}
                        >
                          {alumno.alumno} ·{' '}
                          {alumno.grupo_estable || 'Sin grupo'}
                        </option>
                      ))}
                  </select>
                </label>

                <label style={labelCampo}>
                  Día solicitado
                  <select
                    value={ocioCambioForm.diaDestino}
                    onChange={(e) => {
                      const diaDestino = e.target.value as
                        | ''
                        | 'Jueves'
                        | 'Sábado'
                        | 'Domingo';

                      setOcioCambioForm({
                        ...ocioCambioForm,
                        diaDestino,
                        grupoDestinoId: '',
                        fecha: fechaCambioOcioPorDia(diaDestino),
                      });
                    }}
                  >
                    <option value="">Seleccionar día</option>
                    {(['Jueves', 'Sábado', 'Domingo'] as const)
                      .filter(
                        (dia) =>
                          textoSinAcentosGrupoApp(dia) !==
                          textoSinAcentosGrupoApp(
                            ocioAlumnoCambioSeleccionado?.grupo_dia ||
                              ocioAlumnoCambioSeleccionado?.dia_fijo ||
                              ''
                          )
                      )
                      .map((dia) => (
                        <option key={`cambio-dia-${dia}`} value={dia}>
                          {dia} · {horarioTurnoOcio(dia).inicio}-
                          {horarioTurnoOcio(dia).fin}
                        </option>
                      ))}
                  </select>
                </label>

                <label style={labelCampo}>
                  Motivo / nota interna
                  <textarea
                    value={ocioCambioForm.motivo}
                    onChange={(e) =>
                      setOcioCambioForm({
                        ...ocioCambioForm,
                        motivo: e.target.value,
                      })
                    }
                    style={textareaCampo}
                    placeholder="Ejemplo: viene sábado en vez de domingo esta semana"
                  />
                </label>
              </div>

              {ocioAlumnoCambioSeleccionado && (
                <div style={{ ...avisoNeutral, marginTop: 10 }}>
                  Grupo habitual:{' '}
                  <strong>
                    {ocioAlumnoCambioSeleccionado.grupo_estable ||
                      'Sin grupo estable'}
                  </strong>{' '}
                  ·{' '}
                  {ocioAlumnoCambioSeleccionado.grupo_dia ||
                    ocioAlumnoCambioSeleccionado.dia_fijo ||
                    '-'}{' '}
                  {horaCorta(
                    ocioAlumnoCambioSeleccionado.grupo_hora_inicio ||
                      ocioAlumnoCambioSeleccionado.hora_inicio_fija
                  )}
                  -
                  {horaCorta(
                    ocioAlumnoCambioSeleccionado.grupo_hora_fin ||
                      ocioAlumnoCambioSeleccionado.hora_fin_fija
                  )}
                </div>
              )}



              <OcioRelocationRecommender ctx={ctx} />

              <div
                style={{
                  display: 'flex',
                  gap: 8,
                  flexWrap: 'wrap',
                  marginTop: 12,
                }}
              >
                <button
                  onClick={guardarCambioPuntualOcio}
                  disabled={
                    !ocioCambioForm.alumnoId ||
                    !ocioCambioForm.diaDestino ||
                    !ocioCambioForm.grupoDestinoId
                  }
                  style={botonPrincipal}
                >
                  Confirmar cambio puntual
                </button>
                <button
                  onClick={limpiarFormularioCambioOcio}
                  style={botonSecundario}
                >
                  Cancelar
                </button>
              </div>
            </article>
          )}

          <article style={agendaBloqueBlanco}>
            <div style={agendaCabeceraLinea}>
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 6 }}>
                  Cambios de la semana{' '}
                  {rangoSemanaAgenda(semanaAgendaActiva || semanaActualAgenda)}
                </h3>
                <p style={{ margin: 0, color: '#555' }}>
                  Al preparar semana, el alumno sale de su grupo habitual y
                  entra en el grupo destino.
                </p>
              </div>
              <button
                onClick={() => setPantalla('ocioSemana')}
                style={botonSecundario}
              >
                Ir a Preparar semana
              </button>
            </div>

            {cambiosOcioSemana.length === 0 ? (
              <div style={agendaVacio}>
                No hay cambios puntuales para esta semana.
              </div>
            ) : (
              <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                {cambiosOcioSemana.map((cambio) => (
                  <div
                    key={`cambio-${cambio.reubicacion_id}`}
                    style={miniTarjetaBlanca}
                  >
                    <div style={agendaCabeceraLinea}>
                      <div>
                        <strong>{cambio.alumno}</strong> · Nivel{' '}
                        {cambio.nivel_usado || '-'}
                        <p style={{ margin: '5px 0 0' }}>
                          {formatearFecha(cambio.fecha)} ·{' '}
                          {cambio.grupo_origen || 'Origen'} →{' '}
                          <strong>{cambio.grupo_destino}</strong>
                        </p>
                        <p style={{ margin: '5px 0 0', color: '#555' }}>
                          Destino: {cambio.destino_dia_semana || '-'}{' '}
                          {horaCorta(cambio.destino_hora_inicio)}-
                          {horaCorta(cambio.destino_hora_fin)} · Punto{' '}
                          {cambio.destino_punto || '-'}
                        </p>
                        {cambio.motivo && (
                          <p style={{ margin: '5px 0 0', color: '#555' }}>
                            {cambio.motivo}
                          </p>
                        )}
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          flexWrap: 'wrap',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <button
                          onClick={() => abrirFormularioCambioOcio(cambio)}
                          style={botonSecundario}
                        >
                          Modificar
                        </button>
                        <button
                          onClick={() => eliminarCambioPuntualOcio(cambio)}
                          style={botonPeligroMini}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          <details style={panelRevisionIntegradaOcio}>
            <summary style={summaryChuletaApp}>
              Revisión de evolución Ocio
            </summary>
            <div style={gridResumenInicio}>
              <div style={miniTarjetaBlanca}>
                <strong>Posibles cambios</strong>
                <br />
                {
                  ocioRevisionBase.filter(
                    (alumno) => alumno.necesita_cambio_revision
                  ).length
                }
              </div>
              <div style={miniTarjetaBlanca}>
                <strong>Sin grupo</strong>
                <br />
                {
                  ocioRevisionBase.filter((alumno) => alumno.sin_grupo_revision)
                    .length
                }
              </div>
              <div style={miniTarjetaBlanca}>
                <strong>Sin reportes</strong>
                <br />
                {
                  ocioRevisionBase.filter(
                    (alumno) => alumno.sin_reportes_revision
                  ).length
                }
              </div>
            </div>
            <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
              {ocioRevisionBase
                .filter(
                  (alumno) =>
                    alumno.necesita_cambio_revision ||
                    alumno.sin_grupo_revision ||
                    alumno.sin_reportes_revision
                )
                .slice(0, 6)
                .map((alumno) => (
                  <div key={`rev-int-${alumno.alumno_id}`} style={avisoNeutral}>
                    <strong>{alumno.alumno}</strong> · Nivel{' '}
                    {alumno.nivel_usado || '-'} ·{' '}
                    {alumno.recomendacion_revision}
                  </div>
                ))}
              {ocioRevisionBase.filter(
                (alumno) =>
                  alumno.necesita_cambio_revision ||
                  alumno.sin_grupo_revision ||
                  alumno.sin_reportes_revision
              ).length === 0 && (
                <div style={avisoCompleto}>
                  Ocio sin avisos importantes ahora mismo.
                </div>
              )}
            </div>
          </details>
        </section>
      )}

    </>
  );
}

export function OcioWeekScreen({ ctx }: OcioOperationalScreenProps) {
  return <OcioWeekPreparationPanel ctx={ctx} />;

  const {
    abrirWhatsappSemanaOcio,
    agendaBloqueBlanco,
    agendaCabeceraLinea,
    agendaHero,
    agendaVacio,
    alumnoVieneOcioSemana,
    alumnosGrupoOcioEstable,
    anioInicioTemporadaAgenda,
    avisoCompleto,
    avisoNeutral,
    avisoPendiente,
    botonAsistenciaAusente,
    botonAsistenciaOff,
    botonAsistenciaOk,
    botonPrincipal,
    botonSecundario,
    cambiarAsistenciaOcioSemana,
    cambioEntradaOcio,
    cambiosOcioSemana,
    capitalizarPrimera,
    categoriaOcioGrupo,
    edadOcioAlumnoEnFecha,
    entrenadorSeleccionadoOcioSemana,
    entrenadoresDisponiblesParaTurno,
    fechaGrupoOcioSemana,
    filaAlumnoAsistencia,
    formatearFecha,
    formatearObservaciones,
    gridFormulario,
    gruposOcioDiaSemana,
    horaCorta,
    labelCampo,
    mesAgendaActivo,
    mesesAgenda,
    nombreGrupoSemanalOcio,
    nombreMesAgendaDesdeClave,
    observacionesAutomaticasGrupoOcio,
    ocioGrupos,
    ocioSemanaResultados,
    ocioTurnoVista,
    opcionesTemporadaAgenda,
    pantalla,
    prepararDiaOcioSemana,
    prepararGrupoOcioSemana,
    rangoSemanaAgenda,
    renderAyudaRapidaPantallaApp,
    semanaAgendaActiva,
    semanasAgenda,
    setAnioInicioTemporadaAgenda,
    setMesAgenda,
    setOcioSemanaEntrenadores,
    setPantalla,
    setSemanaAgendaInicio,
    tarjeta,
    trabajoDiarioOcioSemana,
  } = ctx;

  return (
    <>
      {pantalla === 'ocioSemana' && (
        <section style={{ display: 'grid', gap: 18 }}>
          <article style={agendaHero}>
            <div>
              <h2 style={{ margin: 0 }}>Ocio · Preparar semana</h2>
              {renderAyudaRapidaPantallaApp()}

            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={abrirWhatsappSemanaOcio} style={botonSecundario}>
                Ver WhatsApp semana
              </button>
              <button
                onClick={() => prepararDiaOcioSemana(ocioTurnoVista)}
                style={botonPrincipal}
              >
                Preparar {ocioTurnoVista}
              </button>
            </div>
          </article>

          <article style={agendaBloqueBlanco}>
            <h3 style={{ marginTop: 0 }}>Semana</h3>
            <div style={gridFormulario}>
              <label style={labelCampo}>
                Temporada
                <select
                  value={anioInicioTemporadaAgenda}
                  onChange={(e) => {
                    setAnioInicioTemporadaAgenda(Number(e.target.value));
                    setSemanaAgendaInicio('');
                  }}
                >
                  {opcionesTemporadaAgenda.map((anio) => (
                    <option key={anio} value={anio}>
                      {anio}/{anio + 1}
                    </option>
                  ))}
                </select>
              </label>
              <label style={labelCampo}>
                Mes
                <select
                  value={mesAgendaActivo}
                  onChange={(e) => {
                    setMesAgenda(e.target.value);
                    setSemanaAgendaInicio('');
                  }}
                >
                  {mesesAgenda.map((mes) => (
                    <option key={mes} value={mes}>
                      {capitalizarPrimera(nombreMesAgendaDesdeClave(mes))}
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
            <p style={{ marginBottom: 0, color: '#555' }}>
              Si todavía no pediste disponibilidad de entrenadores, ve a
              Disponibilidad semanal y crea/manda los turnos antes de asignar
              entrenador.
            </p>
          </article>

          <article style={agendaBloqueBlanco}>
            <div style={agendaCabeceraLinea}>
              <div>
                <h3 style={{ marginTop: 0, marginBottom: 6 }}>
                  Cambios puntuales de esta semana
                </h3>
                <p style={{ margin: 0, color: '#555' }}>
                  Estos cambios se aplican al preparar grupos, al WhatsApp
                  semanal y a la vista entrenador.
                </p>
              </div>
              <button
                onClick={() => setPantalla('ocioCambios')}
                style={botonSecundario}
              >
                Gestionar cambios
              </button>
            </div>
            {cambiosOcioSemana.length === 0 ? (
              <p style={{ marginBottom: 0, color: '#555' }}>
                No hay cambios puntuales para la semana seleccionada.
              </p>
            ) : (
              <div style={{ display: 'grid', gap: 8, marginTop: 10 }}>
                {cambiosOcioSemana.map((cambio) => (
                  <div
                    key={`cambio-resumen-${cambio.reubicacion_id}`}
                    style={avisoNeutral}
                  >
                    <strong>{cambio.alumno}</strong> ·{' '}
                    {formatearFecha(cambio.fecha)} ·{' '}
                    {cambio.grupo_origen || 'Origen'} →{' '}
                    {cambio.grupo_destino || 'Destino'}
                    {cambio.motivo ? ` · ${cambio.motivo}` : ''}
                  </div>
                ))}
              </div>
            )}
          </article>

          {ocioGrupos.length === 0 ? (
            <div style={agendaVacio}>
              No hay grupos estables de Ocio. Primero crea grupos en Ocio →
              Grupos estables.
            </div>
          ) : (
            <div style={{ display: 'grid', gap: 12 }}>
              {gruposOcioDiaSemana(ocioTurnoVista).map((grupo) => {
                const fecha = fechaGrupoOcioSemana(grupo);
                const alumnosGrupo = alumnosGrupoOcioEstable(grupo.grupo_id);
                const presentes = alumnosGrupo.filter((alumno) =>
                  alumnoVieneOcioSemana(alumno.alumno_id)
                );
                const observacionesAutoGrupoOcio =
                  observacionesAutomaticasGrupoOcio(presentes);
                const disponibles = entrenadoresDisponiblesParaTurno(
                  fecha,
                  grupo.hora_inicio,
                  grupo.hora_fin
                );
                const entrenadorSeleccionado = entrenadorSeleccionadoOcioSemana(
                  grupo.grupo_id
                );
                const categoria = categoriaOcioGrupo(grupo);

                return (
                  <article
                    key={`ocio-semana-${grupo.grupo_id}`}
                    style={tarjeta}
                  >
                    <div style={agendaCabeceraLinea}>
                      <div>
                        <h3 style={{ margin: 0 }}>
                          {nombreGrupoSemanalOcio(grupo)}
                        </h3>
                        <p style={{ margin: '6px 0 0' }}>
                          {capitalizarPrimera(grupo.dia_semana)}{' '}
                          {formatearFecha(fecha)} ·{' '}
                          {horaCorta(grupo.hora_inicio)}-
                          {horaCorta(grupo.hora_fin)} · {categoria} · Punto{' '}
                          {grupo.punto_encuentro || '-'}
                        </p>
                        <p style={{ margin: '6px 0 0', color: '#555' }}>
                          {presentes.length}/{alumnosGrupo.length} vienen esta
                          semana
                        </p>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          flexWrap: 'wrap',
                          justifyContent: 'flex-end',
                        }}
                      >
                        <button
                          onClick={() => prepararGrupoOcioSemana(grupo)}
                          style={botonPrincipal}
                        >
                          Preparar grupo
                        </button>
                      </div>
                    </div>

                    <div style={gridFormulario}>
                      <label style={labelCampo}>
                        Entrenador de esta semana
                        <select
                          value={entrenadorSeleccionado}
                          onChange={(e) =>
                            setOcioSemanaEntrenadores((anterior) => ({
                              ...anterior,
                              [grupo.grupo_id]: e.target.value,
                            }))
                          }
                        >
                          <option value="">Pendiente de entrenador</option>
                          {disponibles.map((entrenador) => (
                            <option
                              key={entrenador.entrenador_id}
                              value={entrenador.entrenador_id}
                            >
                              {entrenador.nombre_completo}
                            </option>
                          ))}
                        </select>
                      </label>
                      <label style={labelCampo}>
                        Trabajo diario automático
                        <textarea
                          value={trabajoDiarioOcioSemana(grupo)}
                          readOnly
                          rows={3}
                        />
                      </label>
                    </div>

                    {disponibles.length === 0 && (
                      <p style={{ ...avisoPendiente, marginTop: 10 }}>
                        No hay entrenadores marcados como Disponible para este
                        día/turno. Puedes preparar el grupo como pendiente de
                        entrenador.
                      </p>
                    )}

                    {observacionesAutoGrupoOcio && (
                      <div style={{ ...avisoCompleto, marginTop: 10 }}>
                        <strong>Observaciones</strong>
                        <div style={{ marginTop: 6 }}>
                          {formatearObservaciones(observacionesAutoGrupoOcio)}
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                      {alumnosGrupo.length === 0 && (
                        <div style={agendaVacio}>
                          Este grupo estable no tiene alumnos asignados.
                        </div>
                      )}
                      {alumnosGrupo.map((alumno) => {
                        const viene = alumnoVieneOcioSemana(alumno.alumno_id);
                        return (
                          <div
                            key={`ocio-viene-${grupo.grupo_id}-${alumno.alumno_id}`}
                            style={filaAlumnoAsistencia}
                          >
                            <div>
                              <strong>{alumno.alumno}</strong>
                              <p style={{ margin: '4px 0 0', color: '#555' }}>
                                Nivel {alumno.nivel_usado || '-'}
                                {alumno.fecha_nacimiento
                                  ? ` · ${
                                      edadOcioAlumnoEnFecha(alumno, fecha) ||
                                      '-'
                                    } años`
                                  : ''}
                              </p>
                              {cambioEntradaOcio(
                                alumno.alumno_id,
                                grupo.grupo_id
                              ) && (
                                <p
                                  style={{
                                    margin: '4px 0 0',
                                    color: '#0f766e',
                                    fontWeight: 800,
                                  }}
                                >
                                  Cambio puntual desde{' '}
                                  {cambioEntradaOcio(
                                    alumno.alumno_id,
                                    grupo.grupo_id
                                  )?.grupo_origen || 'otro grupo'}
                                </p>
                              )}
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                gap: 6,
                                flexWrap: 'wrap',
                              }}
                            >
                              <button
                                onClick={() =>
                                  cambiarAsistenciaOcioSemana(
                                    alumno.alumno_id,
                                    true
                                  )
                                }
                                style={
                                  viene ? botonAsistenciaOk : botonAsistenciaOff
                                }
                              >
                                Viene
                              </button>
                              <button
                                onClick={() =>
                                  cambiarAsistenciaOcioSemana(
                                    alumno.alumno_id,
                                    false
                                  )
                                }
                                style={
                                  !viene
                                    ? botonAsistenciaAusente
                                    : botonAsistenciaOff
                                }
                              >
                                No viene
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </article>
                );
              })}
            </div>
          )}

          {ocioSemanaResultados.length > 0 && (
            <article style={agendaBloqueBlanco}>
              <h3 style={{ marginTop: 0 }}>Resultado de preparación</h3>
              <div style={{ display: 'grid', gap: 8 }}>
                {ocioSemanaResultados.map((resultado, indice) => (
                  <div
                    key={`${resultado.grupo_estable}-${resultado.fecha}-${indice}`}
                    style={avisoCompleto}
                  >
                    <strong>{resultado.grupo_estable}</strong> ·{' '}
                    {formatearFecha(resultado.fecha)} ·{' '}
                    {resultado.hora_inicio?.slice(0, 5)}-
                    {resultado.hora_fin?.slice(0, 5)} · {resultado.alumnos}{' '}
                    alumnos · {resultado.entrenador || 'Pendiente entrenador'}
                    <br />
                    {resultado.estado}
                  </div>
                ))}
              </div>
            </article>
          )}
        </section>
      )}

    </>
  );
}
