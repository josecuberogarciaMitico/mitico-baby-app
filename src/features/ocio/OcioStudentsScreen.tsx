import React from 'react';
import { StudentHistoryPanel } from '../../components/students/StudentHistoryPanel';

type OcioStudentsScreenProps = {
  ctx: Record<string, any>;
};

export function OcioStudentsScreen({ ctx }: OcioStudentsScreenProps) {
  const {
    abrirCentroEvaluacionOcioDesdeFicha,
    agendaBadgeModalidad,
    agendaBloqueBlanco,
    agendaCabeceraLinea,
    agendaHero,
    alternarHistorialAlumnoFichaApp,
    alumnosBabyIntensivos,
    anadiendoFichaAIntensivoId,
    asignarAlumnoGrupoOcio,
    avisoNeutral,
    añadirFichaExistenteAIntensivo,
    bloqueIdentidadFichaAlumnoApp,
    botonPeligro,
    botonPrincipal,
    botonSecundario,
    buscador,
    busquedaOcio,
    cargarAlumnos,
    cargarIntensivos,
    cargarOcioAlumnos,
    cargarOcioGrupos,
    editarAlumnoOcio,
    eliminarAlumnoOcio,
    esVistaMovilApp,
    filtroDiaFichasOcio,
    filtroModalidadHistorialFicha,
    formatearFecha,
    gridFormulario,
    guardarAlumnoOcio,
    historialAlumnoAbiertoId,
    historialReportesFichaCargandoId,
    historialReportesFichaPorAlumno,
    intensivoAlumnos,
    intensivoFichaSeleccionado,
    intensivos,
    labelCampo,
    limpiarFormularioOcioAlumno,
    miniBadge,
    miniTarjetaBlanca,
    mostrarNuevoOcio,
    ocioAlumnoEditandoId,
    ocioAlumnos,
    ocioAlumnosFiltrados,
    ocioDiaFijo,
    ocioFechaNacimiento,
    ocioGrupos,
    ocioHoraFin,
    ocioHoraInicio,
    ocioNivel,
    ocioNombre,
    ocioObservaciones,
    ocioRecomendacionesCambio,
    ocioTelefono,
    opcionesNivel,
    pantalla,
    perfilOperativoAlumnoApp,
    quitarAlumnoGrupoOcio,
    renderAyudaRapidaPantallaApp,
    selectCampo,
    selectorIntensivoFichaAbiertoId,
    setBusquedaOcio,
    setFiltroDiaFichasOcio,
    setFiltroEstadoFichasOcio,
    setFiltroModalidadHistorialFicha,
    setIntensivoFichaSeleccionado,
    setMostrarNuevoOcio,
    setOcioDiaFijo,
    setOcioFechaNacimiento,
    setOcioHoraFin,
    setOcioHoraInicio,
    setOcioNivel,
    setOcioNombre,
    setOcioObservaciones,
    setOcioTelefono,
    setPantalla,
    setSelectorIntensivoFichaAbiertoId,
    setVistaFichasAlumnos,
    tarjeta,
    tarjetaResaltada,
  } = ctx;

  return (
    <>
      {pantalla === 'ocioAlumnos' &&
        (() => {
          const totalOcio = ocioAlumnos.length;
          const ocioSinGrupo = ocioAlumnos.filter(
            (alumno) => !alumno.grupo_id
          ).length;
          const ocioSinNivel = ocioAlumnos.filter(
            (alumno) => !(alumno.nivel_usado || alumno.nivel)
          ).length;
          const ocioRevisarGrupo = ocioAlumnos.filter((alumno) => {
            const recomendacion = ocioRecomendacionesCambio.find(
              (item) => item.alumno_id === alumno.alumno_id
            );
            return Boolean(
              recomendacion && recomendacion.recomendacion !== 'OK'
            );
          }).length;

          const estiloOcioHero = {
            ...agendaHero,
            background:
              'linear-gradient(135deg, #062d3f 0%, #083b4d 58%, #0b5d4f 100%)',
            border: '1px solid rgba(255,255,255,.08)',
            boxShadow: '0 14px 34px rgba(15,23,42,.14)',
            color: '#ffffff',
            width: '100%',
            maxWidth: '100%',
            minWidth: 0,
            boxSizing: 'border-box' as const,
            borderRadius: 22,
            padding: esVistaMovilApp ? 16 : 20,
            ...(esVistaMovilApp
              ? {
                  gridTemplateColumns: 'minmax(0, 1fr)',
                  gap: 14,
                  overflow: 'visible',
                }
              : {}),
          };

          const tarjetaMetricaOcio = (color: string, fondo: string) => ({
            ...miniTarjetaBlanca,
            border: `1px solid ${color}33`,
            background: fondo,
            minHeight: 82,
            display: 'grid',
            alignContent: 'center',
          });

          return (
            <section style={{ display: 'grid', gap: 16 }}>
              <article
                style={{
                  ...estiloOcioHero,
                  display: 'grid',
                  gridTemplateColumns: esVistaMovilApp
                    ? 'minmax(0, 1fr)'
                    : 'minmax(0, 1fr) minmax(320px, 350px)',
                  alignItems: 'start',
                  gap: esVistaMovilApp ? 14 : 22,
                }}
              >
<div>
                  <span
                    style={{
                      ...agendaBadgeModalidad,
                      background: 'rgba(134,239,172,.12)',
                      color: '#86efac',
                      borderColor: 'rgba(134,239,172,.28)',
                    }}
                  >
                    FICHAS
                  </span>
                  <h2
                    style={{
                      margin: '9px 0 4px',
                      color: '#ffffff',
                      fontSize: esVistaMovilApp ? 24 : 30,
                      lineHeight: 1.08,
                    }}
                  >
                    Alumnos Ocio
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      color: '#cbd5e1',
                      fontWeight: 650,
                      fontSize: 13,
                      maxWidth: 720,
                      lineHeight: 1.45,
                    }}
                  >
                    Base anual separada: día fijo, turno fijo, grupo estable,
                    nivel y reportes.
                  </p>
                  {renderAyudaRapidaPantallaApp()}
                </div>
<div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: esVistaMovilApp
                      ? 'minmax(0, 1fr)'
                      : 'repeat(2, minmax(150px, 1fr))',
                    gap: 8,
                    width: '100%',
                    maxWidth: '100%',
                    minWidth: 0,
                    alignSelf: 'stretch',
                  }}
                >
                  {[
                    {
                      key: 'general',
                      label: `Alumnos Baby (${alumnosBabyIntensivos.length})`,
                      active: false,
                      onClick: () => {
                        setVistaFichasAlumnos('general');
                        setPantalla('alumnos');
                      },
                    },
                    {
                      key: 'intensivos',
                      label: `Alumnos Intensivos (${new Set(
                        intensivoAlumnos.map((registro) => registro.alumno_id)
                      ).size})`,
                      active: false,
                      onClick: () => {
                        setVistaFichasAlumnos('intensivos');
                        setPantalla('alumnos');
                      },
                    },
                    {
                      key: 'ocio',
                      label: `Alumnos Ocio (${totalOcio})`,
                      active: true,
                      onClick: () => undefined,
                    },
                  ].map((accion) => (
                    <button
                      key={accion.key}
                      type="button"
                      onClick={accion.onClick}
                      aria-pressed={accion.active}
                      style={{
                        minHeight: 42,
                        padding: '9px 12px',
                        borderRadius: 13,
                        border: accion.active
                          ? '1px solid #c4b5fd'
                          : '1px solid rgba(255,255,255,.22)',
                        background: accion.active
                          ? '#7c3aed'
                          : 'rgba(255,255,255,.10)',
                        color: '#ffffff',
                        fontSize: 12,
                        fontWeight: 900,
                        cursor: 'pointer',
                        boxShadow: accion.active
                          ? '0 7px 18px rgba(124,58,237,.26)'
                          : 'none',
                        transition:
                          'background .15s ease, border-color .15s ease, box-shadow .15s ease',
                      }}
                    >
                      {accion.label}
                    </button>
                  ))}

                  <button
                    type="button"
                    onClick={() => {
                      cargarOcioAlumnos();
                      cargarOcioGrupos();
                      cargarIntensivos();
                      cargarAlumnos();
                    }}
                    style={{
                      minHeight: 42,
                      padding: '9px 12px',
                      borderRadius: 13,
                      border: '1px solid rgba(255,255,255,.22)',
                      background: 'rgba(255,255,255,.10)',
                      color: '#ffffff',
                      fontSize: 12,
                      fontWeight: 900,
                      cursor: 'pointer',
                    }}
                  >
                    Refrescar
                  </button>
                </div>
              </article>

              <section
                style={{
                  display: 'grid',
                  gridTemplateColumns: esVistaMovilApp
                    ? 'repeat(2, minmax(0, 1fr))'
                    : 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 10,
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setFiltroEstadoFichasOcio('todos');
                    setFiltroDiaFichasOcio('');
                    setBusquedaOcio('');
                  }}
                  style={{
                    ...tarjetaMetricaOcio('#16a34a', '#f0fdf4'),
                    cursor: 'pointer',
                    textAlign: 'left',
                    font: 'inherit',
                  }}
                >
                  <span
                    style={{ color: '#64748b', fontWeight: 800, fontSize: 12 }}
                  >
                    TOTAL OCIO
                  </span>
                  <strong style={{ fontSize: 28 }}>{totalOcio}</strong>
                  <span>ver todos</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroEstadoFichasOcio('sin_grupo')}
                  style={{
                    ...tarjetaMetricaOcio('#dc2626', '#fef2f2'),
                    cursor: 'pointer',
                    textAlign: 'left',
                    font: 'inherit',
                  }}
                >
                  <span
                    style={{ color: '#64748b', fontWeight: 800, fontSize: 12 }}
                  >
                    SIN GRUPO
                  </span>
                  <strong style={{ fontSize: 28 }}>{ocioSinGrupo}</strong>
                  <span>ver pendientes</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroEstadoFichasOcio('sin_nivel')}
                  style={{
                    ...tarjetaMetricaOcio('#f97316', '#fff7ed'),
                    cursor: 'pointer',
                    textAlign: 'left',
                    font: 'inherit',
                  }}
                >
                  <span
                    style={{ color: '#64748b', fontWeight: 800, fontSize: 12 }}
                  >
                    SIN NIVEL
                  </span>
                  <strong style={{ fontSize: 28 }}>{ocioSinNivel}</strong>
                  <span>ver fichas</span>
                </button>

                <button
                  type="button"
                  onClick={() => setFiltroEstadoFichasOcio('revisar_grupo')}
                  style={{
                    ...tarjetaMetricaOcio('#2563eb', '#eff6ff'),
                    cursor: 'pointer',
                    textAlign: 'left',
                    font: 'inherit',
                  }}
                >
                  <span
                    style={{ color: '#64748b', fontWeight: 800, fontSize: 12 }}
                  >
                    REVISAR GRUPO
                  </span>
                  <strong style={{ fontSize: 28 }}>{ocioRevisarGrupo}</strong>
                  <span>nivel / encaje</span>
                </button>
              </section>

              {mostrarNuevoOcio && (
                <article
                  style={{
                    ...tarjetaResaltada,
                    borderColor: '#bbf7d0',
                    background: '#f0fdf4',
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>
                    {ocioAlumnoEditandoId
                      ? 'Editar alumno Ocio'
                      : 'Añadir alumno Ocio'}
                  </h3>
                  <div style={gridFormulario}>
                    <label style={labelCampo}>
                      Nombre
                      <input
                        value={ocioNombre}
                        onChange={(e) => setOcioNombre(e.target.value)}
                        placeholder="Nombre completo"
                      />
                    </label>
                    <label style={labelCampo}>
                      Nivel
                      <select
                        value={ocioNivel}
                        onChange={(e) => setOcioNivel(e.target.value)}
                      >
                        <option value="">Pendiente</option>
                        {opcionesNivel.map((nivel) => (
                          <option key={nivel} value={nivel}>
                            {nivel}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label style={labelCampo}>
                      Fecha nacimiento
                      <input
                        type="date"
                        value={ocioFechaNacimiento}
                        onChange={(e) => setOcioFechaNacimiento(e.target.value)}
                      />
                    </label>
                    <label style={labelCampo}>
                      Teléfono familia
                      <input
                        inputMode="tel"
                        value={ocioTelefono}
                        onChange={(e) => setOcioTelefono(e.target.value)}
                        placeholder="612345678"
                      />
                    </label>
                    <label style={labelCampo}>
                      Día fijo
                      <select
                        value={ocioDiaFijo}
                        onChange={(e) => setOcioDiaFijo(e.target.value)}
                      >
                        <option>Jueves</option>
                        <option>Sábado</option>
                        <option>Domingo</option>
                        <option>Miércoles</option>
                        <option>Viernes</option>
                      </select>
                    </label>
                    <label style={labelCampo}>
                      Hora inicio
                      <input
                        type="time"
                        value={ocioHoraInicio}
                        onChange={(e) => setOcioHoraInicio(e.target.value)}
                      />
                    </label>
                    <label style={labelCampo}>
                      Hora fin
                      <input
                        type="time"
                        value={ocioHoraFin}
                        onChange={(e) => setOcioHoraFin(e.target.value)}
                      />
                    </label>
                  </div>
                  <label style={{ ...labelCampo, marginTop: 12 }}>
                    Observaciones
                    <textarea
                      value={ocioObservaciones}
                      onChange={(e) => setOcioObservaciones(e.target.value)}
                      placeholder="Observaciones internas de Ocio"
                      rows={3}
                    />
                  </label>
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      marginTop: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={guardarAlumnoOcio}
                      style={{ ...botonPrincipal, background: '#16a34a' }}
                    >
                      Guardar alumno
                    </button>
                    <button
                      onClick={() => {
                        limpiarFormularioOcioAlumno();
                        setMostrarNuevoOcio(false);
                      }}
                      style={botonSecundario}
                    >
                      Cancelar
                    </button>
                  </div>
                </article>
              )}


              <article style={agendaBloqueBlanco}>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    flexWrap: 'wrap',
                  }}
                >
                  <input
                    value={busquedaOcio}
                    onChange={(e) => setBusquedaOcio(e.target.value)}
                    placeholder="Buscar alumno Ocio..."
                    style={{ ...buscador, margin: 0, flex: '1 1 260px' }}
                  />

                  <div
                    style={{
                      display: 'flex',
                      gap: 6,
                      flexWrap: 'wrap',
                      alignItems: 'center',
                    }}
                    aria-label="Filtrar fichas Ocio por día"
                  >
                    {[
                      { valor: '', etiqueta: 'Todos' },
                      { valor: 'Jueves', etiqueta: 'Jueves' },
                      { valor: 'Sábado', etiqueta: 'Sábado' },
                      { valor: 'Domingo', etiqueta: 'Domingo' },
                    ].map((opcion) => {
                      const activo = filtroDiaFichasOcio === opcion.valor;
                      return (
                        <button
                          key={opcion.etiqueta}
                          type="button"
                          onClick={() =>
                            setFiltroDiaFichasOcio(
                              opcion.valor as
                                | ''
                                | 'Jueves'
                                | 'Sábado'
                                | 'Domingo'
                            )
                          }
                          aria-pressed={activo}
                          style={{
                            ...botonSecundario,
                            minHeight: 38,
                            padding: '8px 12px',
                            borderRadius: 12,
                            background: activo ? '#dcfce7' : '#ffffff',
                            color: activo ? '#166534' : '#475569',
                            borderColor: activo ? '#86efac' : '#dbe3ee',
                            fontWeight: 900,
                          }}
                        >
                          {opcion.etiqueta}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </article>

              <div style={{ display: 'grid', gap: 12 }}>
                {ocioAlumnosFiltrados.map((alumno) => {
                  const sinGrupo = !alumno.grupo_id;
                  const perfilOperativo = perfilOperativoAlumnoApp(
                    alumno.alumno_id
                  );
                  const historialAbierto =
                    historialAlumnoAbiertoId === alumno.alumno_id;
                  return (
                    <article
                      key={alumno.alumno_id}
                      style={{
                        ...tarjeta,
                        border: `1px solid ${sinGrupo ? '#fecaca' : '#bbf7d0'}`,
                        background: sinGrupo
                          ? 'linear-gradient(135deg,#fff 0%,#fef2f2 100%)'
                          : 'linear-gradient(135deg,#fff 0%,#f0fdf4 100%)',
                        boxShadow: '0 14px 30px rgba(15, 23, 42, 0.07)',
                      }}
                    >
                      <div style={agendaCabeceraLinea}>
                        <div>
                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              marginBottom: 8,
                            }}
                          >
                            <span
                              style={{
                                ...agendaBadgeModalidad,
                                background: '#ecfdf5',
                                color: '#047857',
                                borderColor: '#bbf7d0',
                              }}
                            >
                              OCIO
                            </span>
                            <span
                              style={{
                                ...agendaBadgeModalidad,
                                background: sinGrupo ? '#fef2f2' : '#f8fafc',
                                color: sinGrupo ? '#dc2626' : '#475569',
                                borderColor: sinGrupo ? '#fecaca' : '#e2e8f0',
                              }}
                            >
                              {sinGrupo
                                ? 'Sin grupo estable'
                                : alumno.grupo_estable}
                            </span>
                            <span
                              style={{
                                ...agendaBadgeModalidad,
                                background: '#eff6ff',
                                color: '#2563eb',
                                borderColor: '#bfdbfe',
                              }}
                            >
                              Nivel {alumno.nivel_usado || '-'}
                            </span>
                          </div>
                          {bloqueIdentidadFichaAlumnoApp(
                            alumno.alumno,
                            alumno.fecha_nacimiento,
                            alumno.telefono
                          )}
                          <p
                            style={{
                              margin: '8px 0 0',
                              color: '#475569',
                              fontWeight: 700,
                            }}
                          >
                            {alumno.dia_fijo || alumno.grupo_dia || '-'} ·{' '}
                            {(
                              alumno.hora_inicio_fija ||
                              alumno.grupo_hora_inicio ||
                              ''
                            ).slice(0, 5)}
                            -
                            {(
                              alumno.hora_fin_fija ||
                              alumno.grupo_hora_fin ||
                              ''
                            ).slice(0, 5)}{' '}
                            · Reportes: {alumno.total_reportes || 0}
                          </p>
                          {perfilOperativo && (
                            <div
                              style={{
                                display: 'flex',
                                gap: 6,
                                flexWrap: 'wrap',
                                marginTop: 8,
                              }}
                            >
                              {perfilOperativo.autonomia_reciente && (
                                <span style={miniBadge}>
                                  Autonomía: {perfilOperativo.autonomia_reciente}
                                </span>
                              )}
                              {perfilOperativo.ritmo_tendencia && (
                                <span style={miniBadge}>
                                  Ritmo en su grupo: {perfilOperativo.ritmo_tendencia}
                                  {perfilOperativo.confianza_ritmo
                                    ? ` · confianza ${perfilOperativo.confianza_ritmo.toLowerCase()}`
                                    : ''}
                                  {perfilOperativo.reportes_ritmo
                                    ? ` · ${perfilOperativo.reportes_ritmo} reportes`
                                    : ''}
                                </span>
                              )}
                              {perfilOperativo.demanda_atencion &&
                                perfilOperativo.demanda_atencion !== 'NORMAL' && (
                                  <span
                                    style={{
                                      ...miniBadge,
                                      background:
                                        perfilOperativo.demanda_atencion === 'ALTA'
                                          ? '#fff1f2'
                                          : '#fff7ed',
                                      color:
                                        perfilOperativo.demanda_atencion === 'ALTA'
                                          ? '#be123c'
                                          : '#c2410c',
                                    }}
                                  >
                                    {perfilOperativo.demanda_atencion === 'ALTA'
                                      ? 'Atención prioritaria'
                                      : 'Seguimiento puntual'}
                                  </span>
                                )}
                            </div>
                          )}
                          {perfilOperativo?.aviso_operativo &&
                            perfilOperativo.demanda_atencion !== 'NORMAL' && (
                              <p
                                style={{
                                  margin: '7px 0 0',
                                  color: '#92400e',
                                  fontWeight: 750,
                                }}
                              >
                                <strong>Motivo del seguimiento:</strong>{' '}
                                {perfilOperativo.aviso_operativo}
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
                            onClick={() => editarAlumnoOcio(alumno)}
                            style={botonSecundario}
                          >
                            Editar ficha / Ocio
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              abrirCentroEvaluacionOcioDesdeFicha(alumno)
                            }
                            style={botonSecundario}
                          >
                            Evaluación / familia
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              setSelectorIntensivoFichaAbiertoId((actual) =>
                                actual === alumno.alumno_id
                                  ? ''
                                  : alumno.alumno_id
                              )
                            }
                            style={botonSecundario}
                          >
                            Añadir a Intensivo
                          </button>
                          <button
                            onClick={() => eliminarAlumnoOcio(alumno)}
                            style={botonPeligro}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>

                      {selectorIntensivoFichaAbiertoId === alumno.alumno_id && (
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                            alignItems: 'flex-end',
                            marginTop: 10,
                            padding: 10,
                            borderRadius: 12,
                            border: '1px solid #dbeafe',
                            background: '#f8fbff',
                          }}
                        >
                          <label
                            style={{
                              ...labelCampo,
                              flex: '1 1 220px',
                              minWidth: 0,
                            }}
                          >
                            Intensivo de destino
                            <select
                              value={
                                intensivoFichaSeleccionado[alumno.alumno_id] || ''
                              }
                              onChange={(e) =>
                                setIntensivoFichaSeleccionado((actual) => ({
                                  ...actual,
                                  [alumno.alumno_id]: e.target.value,
                                }))
                              }
                              style={{
                                ...selectCampo,
                                width: '100%',
                                minWidth: 0,
                              }}
                            >
                              <option value="">Seleccionar Intensivo abierto</option>
                              {intensivos
                                .filter(
                                  (item) =>
                                    String(item.estado || '').toLowerCase() !==
                                    'cerrado'
                                )
                                .map((intensivo) => (
                                  <option
                                    key={intensivo.intensivo_id}
                                    value={intensivo.intensivo_id}
                                  >
                                    {intensivo.intensivo}
                                    {intensivo.fecha_inicio
                                      ? ` · ${formatearFecha(
                                          intensivo.fecha_inicio
                                        )}`
                                      : ''}
                                    {intensivo.lugar
                                      ? ` · ${intensivo.lugar}`
                                      : ''}
                                  </option>
                                ))}
                            </select>
                          </label>

                          <button
                            type="button"
                            onClick={() =>
                              añadirFichaExistenteAIntensivo(
                                alumno.alumno_id,
                                alumno.alumno
                              )
                            }
                            disabled={
                              !intensivoFichaSeleccionado[alumno.alumno_id] ||
                              anadiendoFichaAIntensivoId === alumno.alumno_id
                            }
                            style={{
                              ...botonSecundario,
                              opacity:
                                !intensivoFichaSeleccionado[alumno.alumno_id] ||
                                anadiendoFichaAIntensivoId === alumno.alumno_id
                                  ? 0.55
                                  : 1,
                            }}
                          >
                            {anadiendoFichaAIntensivoId === alumno.alumno_id
                              ? 'Añadiendo...'
                              : 'Confirmar'}
                          </button>
                        </div>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          flexWrap: 'wrap',
                          marginTop: 12,
                        }}
                      >
                        <label
                          style={{ ...labelCampo, flex: 1, minWidth: 240 }}
                        >
                          Mover a grupo estable
                          <select
                            value={alumno.grupo_id || ''}
                            onChange={(e) =>
                              asignarAlumnoGrupoOcio(
                                alumno.alumno_id,
                                e.target.value
                              )
                            }
                          >
                            <option value="">Sin grupo</option>
                            {ocioGrupos.map((grupo) => (
                              <option
                                key={grupo.grupo_id}
                                value={grupo.grupo_id}
                              >
                                {grupo.nombre_grupo} · {grupo.dia_semana}{' '}
                                {(grupo.hora_inicio || '').slice(0, 5)}
                              </option>
                            ))}
                          </select>
                        </label>
                        {alumno.grupo_id && (
                          <button
                            onClick={() =>
                              quitarAlumnoGrupoOcio(
                                alumno.alumno_id,
                                alumno.grupo_id
                              )
                            }
                            style={botonSecundario}
                          >
                            Quitar del grupo
                          </button>
                        )}
                      </div>

                      {alumno.observaciones && (
                        <p style={{ ...avisoNeutral, marginTop: 10 }}>
                          <strong>Obs:</strong> {alumno.observaciones}
                        </p>
                      )}

                      <div style={{ marginTop: 12 }}>
                        <button
                          type="button"
                          onClick={() =>
                            void alternarHistorialAlumnoFichaApp(alumno)
                          }
                          style={{
                            ...botonSecundario,
                            width: '100%',
                            justifyContent: 'space-between',
                            borderColor: historialAbierto
                              ? '#86efac'
                              : '#e2e8f0',
                            background: historialAbierto
                              ? '#f0fdf4'
                              : '#ffffff',
                            color: '#0f172a',
                            fontWeight: 900,
                          }}
                        >
                          <span>
                            {historialAbierto ? '▼' : '▶'} Ficha maestra e
                            historial
                          </span>
                          <span style={{ fontSize: 13, color: '#64748b' }}>
                            {alumno.total_reportes || 0}{' '}
                            {Number(alumno.total_reportes || 0) === 1
                              ? 'reporte'
                              : 'reportes'}
                          </span>
                        </button>

                        {historialAbierto && (
                          <StudentHistoryPanel
                            studentId={alumno.alumno_id}
                            reports={
                              historialReportesFichaPorAlumno[
                                alumno.alumno_id
                              ] || []
                            }
                            filter={filtroModalidadHistorialFicha}
                            onFilterChange={setFiltroModalidadHistorialFicha}
                            loading={
                              historialReportesFichaCargandoId ===
                              alumno.alumno_id
                            }
                            currentLevel={
                              alumno.nivel_usado || alumno.nivel || 'SIN NIVEL'
                            }
                            formatDate={formatearFecha}
                            totalReports={Number(alumno.total_reportes || 0)}
                            lastReportDate={alumno.ultimo_reporte_fecha}
                          />
                        )}
                      </div>

                    </article>
                  );
                })}
              </div>
            </section>
          );
        })()}

    </>
  );
}

