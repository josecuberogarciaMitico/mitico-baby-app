import React from 'react';

type DailySummaryScreenProps = {
  ctx: Record<string, any>;
};

export function DailySummaryScreen({ ctx }: DailySummaryScreenProps) {
  const {
    abrirAjustePistaSesion,
    abrirResultadoAlumnoResumenDia,
    actualizarCamisetaAlumnoResumenDia,
    ajustePistaModo,
    ajustePistaSesionId,
    alumnoResumenDiaDestacado,
    alumnos,
    alumnosCamisetaPendienteResumenDia,
    alumnosGrupoResumenDia,
    anadirAlumnoHoyTrabajoPista,
    anadirPistaAlumnoId,
    anadirPistaDestino,
    avisoNeutral,
    avisoPendiente,
    botonPrincipal,
    botonSecundario,
    buildMasterStudentProfile,
    busquedaAlumnoResumenDia,
    busquedaPistaAlumno,
    claveDomAlumnoResumenDia,
    fechaResumenDiaActiva,
    fichaAlumnoResumenDiaDesdeTexto,
    formatearObservaciones,
    grupoResumenDiaDestacado,
    gruposPendientesEntrenadorResumenDia,
    gruposPublicadosSesionResumenDia,
    guardandoAjustePista,
    guardandoCamisetaAlumnoId,
    horaCorta,
    hrefTelefonoAlumnoResumenDia,
    hrefWhatsappAlumnoResumenDia,
    inputCampo,
    labelCampo,
    mensajeAjustePista,
    miniBadge,
    miniTarjetaBlanca,
    moverAlumnoTrabajoPista,
    movimientoPistaAlumno,
    movimientoPistaDestino,
    nombreGrupoVisualApp,
    pantalla,
    renderAyudaRapidaPantallaApp,
    resultadosBusquedaAlumnoResumenDia,
    sesionesResumenDia,
    setAnadirPistaAlumnoId,
    setAnadirPistaDestino,
    setBusquedaAlumnoResumenDia,
    setBusquedaPistaAlumno,
    setFechaResumenDia,
    setMensajeAjustePista,
    setMovimientoPistaAlumno,
    setMovimientoPistaDestino,
    setTurnoResumenDiaAbierto,
    tarjetaEntrenadorMovil,
    tarjetaMovilVacia,
    telefonoAlumnoResumenDia,
    textoBusquedaAlumnoResumenDia,
    textoSinAcentosGrupoApp,
    totalAlumnosResumenDia,
    totalGruposResumenDia,
    totalPublicadosResumenDia,
    turnoResumenDiaAbierto,
  } = ctx;

  return (
    <>
      {pantalla === 'resumenDia' && (
        <section>
          <div
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: 20,
              borderRadius: 24,
              border: '1px solid rgba(15,118,110,.42)',
              background:
                'linear-gradient(135deg, #06283b 0%, #08384b 52%, #0f5c4d 100%)',
              boxShadow: '0 16px 36px rgba(6,40,59,.18)',
              color: '#ffffff',
              display: 'grid',
              gap: 16,
            }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 16,
                alignItems: 'flex-start',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ minWidth: 0, flex: '1 1 420px' }}>
                <p
                  style={{
                    margin: 0,
                    color: '#6ee7b7',
                    fontSize: 11,
                    fontWeight: 950,
                    letterSpacing: '.12em',
                  }}
                >
                  TRABAJO EN PISTA
                </p>
                <h2
                  style={{
                    margin: '4px 0 0',
                    fontSize: 28,
                    letterSpacing: '-.025em',
                    color: '#ffffff',
                  }}
                >
                  Control del día
                </h2>
              {renderAyudaRapidaPantallaApp()}
                <p
                  style={{
                    margin: '7px 0 0',
                    color: '#cbd5e1',
                    lineHeight: 1.45,
                  }}
                >
                  Turnos, grupos, alumnos, entrenadores y puntos de encuentro del día.
                </p>
              </div>

              <label
                style={{
                  display: 'grid',
                  gap: 5,
                  minWidth: 190,
                  color: '#cbd5e1',
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: '.08em',
                }}
              >
                FECHA
                <input
                  type="date"
                  value={fechaResumenDiaActiva}
                  onChange={(e) => setFechaResumenDia(e.target.value)}
                  style={{
                    ...inputCampo,
                    minHeight: 44,
                    borderRadius: 13,
                    border: '1px solid rgba(255,255,255,.24)',
                    background: 'rgba(255,255,255,.96)',
                  }}
                  aria-label="Fecha del resumen operativo"
                />
              </label>
            </div>

            <label style={{ display: 'grid', gap: 7 }}>
              <strong style={{ color: '#e2e8f0', fontSize: 13 }}>
                Buscar alumno en los grupos publicados
              </strong>
              <input
                type="search"
                value={busquedaAlumnoResumenDia}
                onChange={(e) => setBusquedaAlumnoResumenDia(e.target.value)}
                placeholder="Nombre o apellidos del niño…"
                style={{
                  ...inputCampo,
                  width: '100%',
                  minHeight: 48,
                  fontSize: 16,
                  borderRadius: 14,
                  border: '1px solid rgba(255,255,255,.22)',
                  background: 'rgba(255,255,255,.98)',
                }}
              />
            </label>

            {textoBusquedaAlumnoResumenDia && (
              <div style={{ display: 'grid', gap: 8 }}>
                {resultadosBusquedaAlumnoResumenDia.length === 0 ? (
                  <div
                    style={{
                      padding: 12,
                      borderRadius: 14,
                      background: 'rgba(255,247,237,.96)',
                      border: '1px solid rgba(251,146,60,.38)',
                      color: '#9a3412',
                      fontWeight: 800,
                    }}
                  >
                    No aparece ningún alumno con ese nombre en los grupos publicados del día.
                  </div>
                ) : (
                  resultadosBusquedaAlumnoResumenDia.slice(0, 8).map((resultado: any, indice: number) => (
                    <button
                      type="button"
                      key={`${resultado.sesion.id}-${resultado.grupo.grupo_id || resultado.indice}-${resultado.alumno}-${indice}`}
                      onClick={() => abrirResultadoAlumnoResumenDia(resultado)}
                      style={{
                        ...botonSecundario,
                        width: '100%',
                        textAlign: 'left',
                        display: 'grid',
                        gap: 3,
                        padding: '11px 13px',
                      }}
                    >
                      <strong>{resultado.alumno}</strong>
                      <span style={{ color: '#475569', fontSize: 13 }}>
                        {horaCorta(resultado.sesion.hora_inicio)}–{horaCorta(resultado.sesion.hora_fin)} ·{' '}
                        {nombreGrupoVisualApp(resultado.grupo, resultado.indice)} · Punto{' '}
                        {resultado.grupo.punto_encuentro || '-'} ·{' '}
                        {resultado.grupo.entrenador || resultado.grupo.entrenadores || 'Sin entrenador'}
                      </span>
                    </button>
                  ))
                )}
              </div>
            )}

            {(() => {
              const pendientesCamiseta = alumnosCamisetaPendienteResumenDia();

              return (
                <div
                  style={{
                    display: 'grid',
                    gap: 9,
                    padding: '12px 14px',
                    borderRadius: 16,
                    border:
                      pendientesCamiseta.length > 0
                        ? '1px solid rgba(244,114,182,.72)'
                        : '1px solid rgba(110,231,183,.42)',
                    background:
                      pendientesCamiseta.length > 0
                        ? 'linear-gradient(135deg,rgba(131,24,67,.42),rgba(80,7,36,.30))'
                        : 'rgba(6,78,59,.24)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 10,
                      flexWrap: 'wrap',
                    }}
                  >
                    <div>
                      <strong
                        style={{
                          display: 'block',
                          color: pendientesCamiseta.length > 0 ? '#fbcfe8' : '#a7f3d0',
                          fontSize: 13,
                        }}
                      >
                        CAMISETAS ROSAS
                      </strong>
                      <span style={{ color: '#ffffff', fontWeight: 900, fontSize: 16 }}>
                        {pendientesCamiseta.length > 0
                          ? `${pendientesCamiseta.length} pendiente${
                              pendientesCamiseta.length === 1 ? '' : 's'
                            } hoy`
                          : 'Todo preparado para hoy'}
                      </span>
                    </div>
                  </div>

                  {pendientesCamiseta.length > 0 && (
                    <div
                      style={{
                        display: 'flex',
                        gap: 7,
                        flexWrap: 'wrap',
                      }}
                    >
                      {pendientesCamiseta.map((alumno) => (
                        <span
                          key={`camiseta-pendiente-${alumno.alumno_id}`}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '7px 10px',
                            borderRadius: 999,
                            background: '#fdf2f8',
                            color: '#9d174d',
                            border: '1px solid #f9a8d4',
                            fontSize: 12,
                            fontWeight: 900,
                          }}
                        >
                          🎽 {alumno.alumno}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
                gap: 10,
              }}
            >
              {[
                ['Turnos', String(sesionesResumenDia.length), sesionesResumenDia.length > 0],
                ['Alumnos previstos', String(totalAlumnosResumenDia), totalAlumnosResumenDia > 0],
                ['Grupos publicados', `${totalPublicadosResumenDia}/${totalGruposResumenDia}`, totalPublicadosResumenDia === totalGruposResumenDia],
                ['Sin entrenador', String(gruposPendientesEntrenadorResumenDia.length), gruposPendientesEntrenadorResumenDia.length === 0],
              ].map(([etiqueta, valor, ok]) => (
                <div
                  key={String(etiqueta)}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 16,
                    background: ok
                      ? 'rgba(255,255,255,.10)'
                      : 'rgba(255,247,237,.13)',
                    border: ok
                      ? '1px solid rgba(255,255,255,.18)'
                      : '1px solid rgba(251,146,60,.38)',
                    minWidth: 0,
                  }}
                >
                  <strong
                    style={{
                      display: 'block',
                      color: '#cbd5e1',
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                    }}
                  >
                    {etiqueta}
                  </strong>
                  <span
                    style={{
                      display: 'block',
                      marginTop: 4,
                      color: '#ffffff',
                      fontSize: 25,
                      lineHeight: 1,
                      fontWeight: 950,
                    }}
                  >
                    {valor}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {gruposPendientesEntrenadorResumenDia.length > 0 && (
            <div style={avisoPendiente}>
              Hay {gruposPendientesEntrenadorResumenDia.length} grupo(s) sin entrenador asignado para este día.
            </div>
          )}

          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            {sesionesResumenDia.length === 0 ? (
              <article style={tarjetaMovilVacia}>
                No hay sesiones preparadas para este día.
              </article>
            ) : (
              sesionesResumenDia.map((sesion: any) => {
                const turnoAbierto = turnoResumenDiaAbierto === String(sesion.id);
                const gruposPublicados = gruposPublicadosSesionResumenDia(sesion);

                return (
                  <article
                    id={`resumen-turno-${sesion.id}`}
                    key={sesion.id}
                    style={{
                      ...tarjetaEntrenadorMovil,
                      border: turnoAbierto ? '2px solid #0f766e' : '1px solid #cbd5e1',
                      borderRadius: 20,
                      overflow: 'hidden',
                      padding: 0,
                      background: '#ffffff',
                      boxShadow: turnoAbierto
                        ? '0 14px 34px rgba(4,23,36,.14)'
                        : '0 8px 20px rgba(15,23,42,.07)',
                      scrollMarginTop: 18,
                    }}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        setTurnoResumenDiaAbierto((actual) =>
                          actual === String(sesion.id) ? '' : String(sesion.id)
                        )
                      }
                      aria-expanded={turnoAbierto}
                      style={{
                        width: '100%',
                        border: 0,
                        background: turnoAbierto
                          ? 'linear-gradient(110deg,#041724 0%,#06243a 68%,#0b3a43 100%)'
                          : 'linear-gradient(135deg,#f8fafc,#ffffff)',
                        color: turnoAbierto ? '#ffffff' : '#172033',
                        padding: '15px 16px',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        gap: 12,
                        textAlign: 'left',
                      }}
                    >
                      <span style={{ display: 'grid', gap: 4 }}>
                        <span style={{ fontSize: 12, fontWeight: 900, textTransform: 'uppercase', opacity: 0.8 }}>
                          {sesion.modalidad}
                        </span>
                        <strong style={{ fontSize: 17 }}>
                          {horaCorta(sesion.hora_inicio)}–{horaCorta(sesion.hora_fin)} · {sesion.titulo}
                        </strong>
                        <span style={{ fontSize: 13, opacity: 0.82 }}>
                          {gruposPublicados.length} grupos publicados · {sesion.totalAlumnos} niños
                        </span>
                      </span>
                      <span style={{ fontSize: 24, fontWeight: 900 }} aria-hidden="true">
                        {turnoAbierto ? '−' : '+'}
                      </span>
                    </button>

                    {turnoAbierto && (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns: 'repeat(auto-fit,minmax(270px,1fr))',
                          gap: 12,
                          padding: 12,
                        }}
                      >
                        {(() => {
                          const sesionOperativaId = String(
                            sesion.agendaDirecta?.sesion_id ||
                              sesion.dia?.sesion_id ||
                              ''
                          );
                          const panelActivo =
                            Boolean(sesionOperativaId) &&
                            ajustePistaSesionId === sesionOperativaId;
                          const [grupoOrigenSeleccionado] =
                            movimientoPistaAlumno.split('::');
                          const opcionesMovimiento = gruposPublicados.flatMap(
                            (grupo: any, grupoIndice: number) =>
                              alumnosGrupoResumenDia(grupo)
                                .map((alumnoTexto) => {
                                  const ficha =
                                    fichaAlumnoResumenDiaDesdeTexto(alumnoTexto);
                                  if (!ficha?.alumno_id || !grupo.grupo_id) return null;
                                  return {
                                    value: `${grupo.grupo_id}::${ficha.alumno_id}`,
                                    alumno: ficha.alumno,
                                    grupo: nombreGrupoVisualApp(grupo, grupoIndice),
                                  };
                                })
                                .filter(Boolean)
                          ) as Array<{
                            value: string;
                            alumno: string;
                            grupo: string;
                          }>;
                          const textoBusquedaAlta = textoSinAcentosGrupoApp(
                            busquedaPistaAlumno.trim()
                          );
                          const candidatosAlta = textoBusquedaAlta.length >= 2
                            ? alumnos
                                .filter((alumno) =>
                                  textoSinAcentosGrupoApp(alumno.alumno || '').includes(
                                    textoBusquedaAlta
                                  )
                                )
                                .slice(0, 12)
                            : [];
                          const alumnoAltaSeleccionado = alumnos.find(
                            (alumno) => alumno.alumno_id === anadirPistaAlumnoId
                          );
                          const nivelAltaSeleccionado = alumnoAltaSeleccionado
                            ? buildMasterStudentProfile(alumnoAltaSeleccionado)
                                .level.level || 'REVISAR'
                            : '';

                          if (!sesionOperativaId || gruposPublicados.length === 0) {
                            return null;
                          }

                          return (
                            <div
                              style={{
                                gridColumn: '1 / -1',
                                padding: 13,
                                borderRadius: 16,
                                border: '1px solid #bae6d3',
                                background: 'linear-gradient(135deg,#f0fdf4,#f8fafc)',
                                display: 'grid',
                                gap: 10,
                              }}
                            >
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  gap: 10,
                                  flexWrap: 'wrap',
                                  alignItems: 'center',
                                }}
                              >
                                <div>
                                  <strong style={{ color: '#065f46', fontSize: 15 }}>
                                    Ajustes en pista · hoy
                                  </strong>
                                  <p
                                    style={{
                                      margin: '3px 0 0',
                                      color: '#475569',
                                      fontSize: 12,
                                      lineHeight: 1.4,
                                    }}
                                  >
                                    Cambios reales del turno. Se actualizan listado, asistencia, observaciones y responsable del reporte. El trabajo diario no se sobrescribe: el alumno usa el del grupo en el que queda hoy.
                                  </p>
                                </div>
                                <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                                  <button
                                    type="button"
                                    disabled={guardandoAjustePista}
                                    onClick={() =>
                                      abrirAjustePistaSesion(sesionOperativaId, 'mover')
                                    }
                                    style={{
                                      ...botonSecundario,
                                      minHeight: 38,
                                      borderColor:
                                        panelActivo && ajustePistaModo === 'mover'
                                          ? '#0f766e'
                                          : '#cbd5e1',
                                      background:
                                        panelActivo && ajustePistaModo === 'mover'
                                          ? '#ecfdf5'
                                          : '#fff',
                                    }}
                                  >
                                    ⇄ Mover alumno
                                  </button>
                                  <button
                                    type="button"
                                    disabled={guardandoAjustePista}
                                    onClick={() =>
                                      abrirAjustePistaSesion(sesionOperativaId, 'anadir')
                                    }
                                    style={{
                                      ...botonPrincipal,
                                      minHeight: 38,
                                    }}
                                  >
                                    + Añadir alumno hoy
                                  </button>
                                </div>
                              </div>

                              {panelActivo && mensajeAjustePista && (
                                <div
                                  style={{
                                    padding: '9px 11px',
                                    borderRadius: 11,
                                    border: '1px solid #86efac',
                                    background: '#f0fdf4',
                                    color: '#166534',
                                    fontWeight: 850,
                                    fontSize: 12,
                                  }}
                                >
                                  {mensajeAjustePista}
                                </div>
                              )}

                              {panelActivo && ajustePistaModo === 'mover' && (
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                      'repeat(auto-fit,minmax(210px,1fr))',
                                    gap: 9,
                                    alignItems: 'end',
                                  }}
                                >
                                  <label style={labelCampo}>
                                    Alumno que cambia de grupo
                                    <select
                                      value={movimientoPistaAlumno}
                                      onChange={(e) => {
                                        setMovimientoPistaAlumno(e.target.value);
                                        setMovimientoPistaDestino('');
                                        setMensajeAjustePista('');
                                      }}
                                      style={inputCampo}
                                    >
                                      <option value="">Selecciona alumno…</option>
                                      {opcionesMovimiento.map((opcion) => (
                                        <option key={opcion.value} value={opcion.value}>
                                          {opcion.alumno} · {opcion.grupo}
                                        </option>
                                      ))}
                                    </select>
                                  </label>

                                  <label style={labelCampo}>
                                    Nuevo grupo
                                    <select
                                      value={movimientoPistaDestino}
                                      onChange={(e) =>
                                        setMovimientoPistaDestino(e.target.value)
                                      }
                                      style={inputCampo}
                                    >
                                      <option value="">Selecciona destino…</option>
                                      {gruposPublicados
                                        .filter(
                                          (grupo: any) =>
                                            grupo.grupo_id &&
                                            String(grupo.grupo_id) !==
                                              grupoOrigenSeleccionado
                                        )
                                        .map((grupo: any, grupoIndice: number) => (
                                          <option
                                            key={grupo.grupo_id}
                                            value={grupo.grupo_id}
                                          >
                                            {nombreGrupoVisualApp(grupo, grupoIndice)} ·{' '}
                                            {grupo.entrenador ||
                                              grupo.entrenadores ||
                                              'Sin entrenador'}
                                          </option>
                                        ))}
                                    </select>
                                  </label>

                                  <button
                                    type="button"
                                    disabled={
                                      guardandoAjustePista ||
                                      !movimientoPistaAlumno ||
                                      !movimientoPistaDestino
                                    }
                                    onClick={() =>
                                      void moverAlumnoTrabajoPista(
                                        sesionOperativaId,
                                        gruposPublicados
                                      )
                                    }
                                    style={{
                                      ...botonPrincipal,
                                      minHeight: 44,
                                      opacity:
                                        guardandoAjustePista ||
                                        !movimientoPistaAlumno ||
                                        !movimientoPistaDestino
                                          ? 0.55
                                          : 1,
                                    }}
                                  >
                                    {guardandoAjustePista
                                      ? 'Guardando…'
                                      : 'Confirmar cambio'}
                                  </button>
                                </div>
                              )}

                              {panelActivo && ajustePistaModo === 'anadir' && (
                                <div style={{ display: 'grid', gap: 9 }}>
                                  <div
                                    style={{
                                      display: 'grid',
                                      gridTemplateColumns:
                                        'repeat(auto-fit,minmax(210px,1fr))',
                                      gap: 9,
                                      alignItems: 'end',
                                    }}
                                  >
                                    <label style={labelCampo}>
                                      Buscar alumno existente
                                      <input
                                        type="search"
                                        value={busquedaPistaAlumno}
                                        onChange={(e) => {
                                          setBusquedaPistaAlumno(e.target.value);
                                          setAnadirPistaAlumnoId('');
                                          setMensajeAjustePista('');
                                        }}
                                        placeholder="Ej. Laura Seves…"
                                        style={inputCampo}
                                      />
                                    </label>

                                    <label style={labelCampo}>
                                      Alumno
                                      <select
                                        value={anadirPistaAlumnoId}
                                        onChange={(e) =>
                                          setAnadirPistaAlumnoId(e.target.value)
                                        }
                                        style={inputCampo}
                                      >
                                        <option value="">
                                          {textoBusquedaAlta.length < 2
                                            ? 'Escribe al menos 2 letras…'
                                            : candidatosAlta.length === 0
                                            ? 'Sin coincidencias'
                                            : 'Selecciona alumno…'}
                                        </option>
                                        {candidatosAlta.map((alumno) => (
                                          <option
                                            key={alumno.alumno_id}
                                            value={alumno.alumno_id}
                                          >
                                            {alumno.alumno} ·{' '}
                                            {String(
                                              alumno.nivel_actual ||
                                                alumno.ultimo_nivel_reportado ||
                                                alumno.nivel_estimado ||
                                                'SIN NIVEL'
                                            ).toUpperCase()}
                                          </option>
                                        ))}
                                      </select>
                                    </label>

                                    <label style={labelCampo}>
                                      Grupo de hoy
                                      <select
                                        value={anadirPistaDestino}
                                        onChange={(e) =>
                                          setAnadirPistaDestino(e.target.value)
                                        }
                                        style={inputCampo}
                                      >
                                        <option value="">Selecciona grupo…</option>
                                        {gruposPublicados
                                          .filter((grupo: any) => grupo.grupo_id)
                                          .map((grupo: any, grupoIndice: number) => (
                                            <option
                                              key={grupo.grupo_id}
                                              value={grupo.grupo_id}
                                            >
                                              {nombreGrupoVisualApp(grupo, grupoIndice)} ·{' '}
                                              {grupo.entrenador ||
                                                grupo.entrenadores ||
                                                'Sin entrenador'}
                                            </option>
                                          ))}
                                      </select>
                                    </label>

                                    <button
                                      type="button"
                                      disabled={
                                        guardandoAjustePista ||
                                        !anadirPistaAlumnoId ||
                                        !anadirPistaDestino
                                      }
                                      onClick={() =>
                                        void anadirAlumnoHoyTrabajoPista(
                                          sesionOperativaId,
                                          gruposPublicados
                                        )
                                      }
                                      style={{
                                        ...botonPrincipal,
                                        minHeight: 44,
                                        opacity:
                                          guardandoAjustePista ||
                                          !anadirPistaAlumnoId ||
                                          !anadirPistaDestino
                                            ? 0.55
                                            : 1,
                                      }}
                                    >
                                      {guardandoAjustePista
                                        ? 'Añadiendo…'
                                        : 'Añadir a hoy'}
                                    </button>
                                  </div>

                                  {alumnoAltaSeleccionado && (
                                    <div
                                      style={{
                                        padding: '8px 10px',
                                        borderRadius: 10,
                                        background: '#fff',
                                        border: '1px solid #dbeafe',
                                        color: '#334155',
                                        fontSize: 12,
                                      }}
                                    >
                                      <strong>{alumnoAltaSeleccionado.alumno}</strong> · nivel usado{' '}
                                      <strong>{nivelAltaSeleccionado}</strong>. Esta acción lo añade a la sesión de hoy; no cambia automáticamente su grupo estable.
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })()}

                        {gruposPublicados.length === 0 ? (
                          <div style={tarjetaMovilVacia}>
                            No hay grupos publicados en este turno.
                          </div>
                        ) : (
                          gruposPublicados.map((grupo: any, indice: number) => {
                            const alumnosGrupo = alumnosGrupoResumenDia(grupo);
                            return (
                              <div
                                id={`resumen-grupo-${String(
                                  grupo.grupo_id || `${sesion.id}-${indice}`
                                )}`}
                                key={grupo.grupo_id || `${sesion.id}-${indice}`}
                                style={{
                                  ...miniTarjetaBlanca,
                                  border:
                                    grupoResumenDiaDestacado ===
                                    String(grupo.grupo_id || `${sesion.id}-${indice}`)
                                      ? '3px solid #16a34a'
                                      : grupo.entrenador || grupo.entrenadores
                                      ? '1px solid #cbd5e1'
                                      : '2px solid #f59e0b',
                                  borderRadius: 18,
                                  padding: 14,
                                  background: 'linear-gradient(180deg,#ffffff,#fbfdff)',
                                  boxShadow: '0 10px 24px rgba(15,23,42,.06)',
                                  minWidth: 0,
                                }}
                              >
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'minmax(0, 1fr) auto',
                                    alignItems: 'start',
                                    gap: 12,
                                  }}
                                >
                                  <div style={{ minWidth: 0 }}>
                                    <strong style={{ fontSize: 16 }}>{nombreGrupoVisualApp(grupo, indice)}</strong>
                                    <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8 }}>
                                      <span style={{ ...miniBadge, background: '#0f172a', color: '#fff' }}>
                                        PUNTO {grupo.punto_encuentro || '-'}
                                      </span>
                                      <span style={{ ...miniBadge, background: '#dbeafe', color: '#1e3a8a' }}>
                                        {grupo.pista || 'SIN PISTA'}
                                      </span>
                                    </div>
                                  </div>
                                  <div style={{ textAlign: 'right', minWidth: 138, alignSelf: 'start' }}>
                                    <span style={{ display: 'block', fontSize: 11, fontWeight: 900, color: '#64748b', textTransform: 'uppercase' }}>
                                      Entrenador
                                    </span>
                                    <strong style={{ color: grupo.entrenador || grupo.entrenadores ? '#0f172a' : '#b45309' }}>
                                      {grupo.entrenador || grupo.entrenadores || 'SIN ENTRENADOR'}
                                    </strong>
                                    {grupo.entrenador_apoyo && (
                                      <p style={{ margin: '4px 0 0', fontSize: 13 }}>
                                        Apoyo: {grupo.entrenador_apoyo}
                                      </p>
                                    )}
                                  </div>
                                </div>

                                <div style={{ marginTop: 12 }}>
                                  <strong style={{ display: 'block', marginBottom: 6 }}>
                                    Alumnos ({alumnosGrupo.length})
                                  </strong>
                                  {alumnosGrupo.length > 0 ? (
                                    <ul style={{ margin: 0, paddingLeft: 20, display: 'grid', gap: 4 }}>
                                      {alumnosGrupo.map((alumno, alumnoIndice) => (
                                        <li
                                          id={`resumen-alumno-${String(
                                            grupo.grupo_id || `${sesion.id}-${indice}`
                                          )}-${claveDomAlumnoResumenDia(alumno.split('·')[0])}`}
                                          key={`${grupo.grupo_id || indice}-${alumnoIndice}`}
                                          style={
                                            grupoResumenDiaDestacado ===
                                              String(grupo.grupo_id || `${sesion.id}-${indice}`) &&
                                            alumnoResumenDiaDestacado &&
                                            textoSinAcentosGrupoApp(alumno.split('·')[0]) ===
                                              alumnoResumenDiaDestacado
                                              ? {
                                                  background: '#fef3c7',
                                                  border: '2px solid #f59e0b',
                                                  borderRadius: 8,
                                                  padding: '4px 7px',
                                                  fontWeight: 900,
                                                  listStylePosition: 'inside',
                                                }
                                              : undefined
                                          }
                                        >
                                          {(() => {
                                            const ficha = fichaAlumnoResumenDiaDesdeTexto(alumno);
                                            const telefono = telefonoAlumnoResumenDia(alumno);
                                            const whatsapp = hrefWhatsappAlumnoResumenDia(telefono);
                                            const llamada = hrefTelefonoAlumnoResumenDia(telefono);
                                            const camisetaPendiente =
                                              ficha?.camiseta_entregada === false;
                                            const guardandoCamiseta =
                                              ficha?.alumno_id === guardandoCamisetaAlumnoId;

                                            return (
                                              <div
                                                style={{
                                                  display: 'grid',
                                                  gridTemplateColumns: telefono
                                                    ? 'minmax(0, 1fr) auto'
                                                    : 'minmax(0, 1fr)',
                                                  alignItems: 'center',
                                                  gap: 10,
                                                  minWidth: 0,
                                                  width: '100%',
                                                }}
                                              >
                                                <div
                                                  style={{
                                                    minWidth: 0,
                                                    display: 'grid',
                                                    gap: 6,
                                                    justifyItems: 'start',
                                                  }}
                                                >
                                                  <strong style={{ color: '#172033' }}>
                                                    {alumno}
                                                  </strong>

                                                  {ficha && (
                                                    <div
                                                      style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        flexWrap: 'wrap',
                                                      }}
                                                    >
                                                      <button
                                                        type="button"
                                                        disabled={guardandoCamiseta}
                                                        onClick={() =>
                                                          void actualizarCamisetaAlumnoResumenDia(
                                                            ficha,
                                                            camisetaPendiente
                                                          )
                                                        }
                                                        title={
                                                          camisetaPendiente
                                                            ? 'Marcar que ya tiene camiseta'
                                                            : 'Marcar que necesita camiseta para el próximo entrenamiento'
                                                        }
                                                        style={{
                                                          minHeight: 30,
                                                          padding: '5px 9px',
                                                          borderRadius: 9,
                                                          border: camisetaPendiente
                                                            ? '1px solid #f9a8d4'
                                                            : '1px solid #bbf7d0',
                                                          background: camisetaPendiente
                                                            ? '#fdf2f8'
                                                            : '#f0fdf4',
                                                          color: camisetaPendiente
                                                            ? '#be185d'
                                                            : '#15803d',
                                                          fontSize: 11,
                                                          fontWeight: 900,
                                                          cursor: guardandoCamiseta
                                                            ? 'wait'
                                                            : 'pointer',
                                                          whiteSpace: 'nowrap',
                                                          opacity: guardandoCamiseta ? 0.65 : 1,
                                                        }}
                                                      >
                                                        {guardandoCamiseta
                                                          ? 'Guardando…'
                                                          : camisetaPendiente
                                                          ? 'Camiseta: NO'
                                                          : 'Camiseta: SÍ'}
                                                      </button>

                                                      {camisetaPendiente && (
                                                        <span
                                                          style={{
                                                            display: 'inline-flex',
                                                            alignItems: 'center',
                                                            padding: '3px 7px',
                                                            borderRadius: 999,
                                                            background: '#fdf2f8',
                                                            color: '#be185d',
                                                            border: '1px solid #f9a8d4',
                                                            fontSize: 10,
                                                            fontWeight: 950,
                                                            whiteSpace: 'nowrap',
                                                          }}
                                                        >
                                                          🎽 ENTREGAR
                                                        </span>
                                                      )}
                                                    </div>
                                                  )}
                                                </div>

                                                {telefono && (
                                                  <div
                                                    style={{
                                                      display: 'flex',
                                                      gap: 5,
                                                      flexWrap: 'nowrap',
                                                      justifyContent: 'flex-end',
                                                      alignItems: 'center',
                                                    }}
                                                  >
                                                    {whatsapp && (
                                                      <a
                                                        href={whatsapp}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        style={{
                                                          display: 'inline-flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'center',
                                                          minHeight: 32,
                                                          padding: '5px 8px',
                                                          borderRadius: 10,
                                                          border: '1px solid #bbf7d0',
                                                          background: '#f0fdf4',
                                                          color: '#15803d',
                                                          fontSize: 11,
                                                          fontWeight: 900,
                                                          textDecoration: 'none',
                                                          whiteSpace: 'nowrap',
                                                        }}
                                                      >
                                                        WhatsApp
                                                      </a>
                                                    )}
                                                    {llamada && (
                                                      <a
                                                        href={llamada}
                                                        style={{
                                                          display: 'inline-flex',
                                                          alignItems: 'center',
                                                          justifyContent: 'center',
                                                          minHeight: 32,
                                                          padding: '5px 8px',
                                                          borderRadius: 10,
                                                          border: '1px solid #bfdbfe',
                                                          background: '#eff6ff',
                                                          color: '#1d4ed8',
                                                          fontSize: 11,
                                                          fontWeight: 900,
                                                          textDecoration: 'none',
                                                          whiteSpace: 'nowrap',
                                                        }}
                                                      >
                                                        Llamar
                                                      </a>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            );
                                          })()}
                                        </li>
                                      ))}
                                    </ul>
                                  ) : (
                                    <p style={{ margin: 0, color: '#64748b' }}>Sin listado cargado.</p>
                                  )}
                                </div>

                                {grupo.trabajo_diario && (
                                  <details
                                    style={{
                                      ...avisoNeutral,
                                      marginTop: 12,
                                      padding: 0,
                                      overflow: 'hidden',
                                    }}
                                  >
                                    <summary
                                      style={{
                                        cursor: 'pointer',
                                        padding: '11px 12px',
                                        fontWeight: 900,
                                        userSelect: 'none',
                                        listStylePosition: 'inside',
                                      }}
                                    >
                                      Trabajo diario
                                    </summary>
                                    <div
                                      style={{
                                        whiteSpace: 'pre-wrap',
                                        padding: '0 12px 12px',
                                        borderTop: '1px solid #e2e8f0',
                                        paddingTop: 10,
                                      }}
                                    >
                                      {grupo.trabajo_diario}
                                    </div>
                                  </details>
                                )}

                                {grupo.observaciones_importantes && (
                                  <details
                                    style={{
                                      ...avisoNeutral,
                                      marginTop: 8,
                                      padding: 0,
                                      overflow: 'hidden',
                                    }}
                                  >
                                    <summary
                                      style={{
                                        cursor: 'pointer',
                                        padding: '11px 12px',
                                        fontWeight: 900,
                                        userSelect: 'none',
                                        listStylePosition: 'inside',
                                      }}
                                    >
                                      Observaciones
                                    </summary>
                                    <div
                                      style={{
                                        padding: '0 12px 12px',
                                        borderTop: '1px solid #e2e8f0',
                                        paddingTop: 10,
                                      }}
                                    >
                                      {formatearObservaciones(grupo.observaciones_importantes)}
                                    </div>
                                  </details>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </article>
                );
              })
            )}
          </div>
        </section>
      )}

    </>
  );
}

