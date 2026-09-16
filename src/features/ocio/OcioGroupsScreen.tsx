import React, { useState } from 'react';
import type { OcioAlumnoApp, OcioGrupoApp } from './ocioTypes';
import { OcioRelocationRecommender } from './OcioRelocationRecommender';
import { OcioWeekPreparationPanel } from './OcioWeekPreparationPanel';
import {
  classifyOcioAimHarderStudent,
  ocioLevelRange,
} from './ocioWeekPlanning';

type OcioGroupsScreenProps = {
  ctx: Record<string, any>;
};

export function OcioGroupsScreen({ ctx }: OcioGroupsScreenProps) {
  const [ocioAlumnosTurnoAbierto, setOcioAlumnosTurnoAbierto] = useState(false);
  const [ocioGrupoGestionAbiertoId, setOcioGrupoGestionAbiertoId] = useState('');
  const [ocioBusquedaGestionGrupo, setOcioBusquedaGestionGrupo] = useState('');
  const [ocioPanelOperativo, setOcioPanelOperativo] = useState<
    'ninguno' | 'cambios' | 'semana' | 'nuevo'
  >('ninguno');
  const [ocioPestanaProceso, setOcioPestanaProceso] = useState<
    'colocar' | 'grupos' | 'cambios' | 'semana'
  >('colocar');
  const {
    abrirAltaTestDesdeOcioAimHarder,
    abrirFormularioCambioOcio,
    abrirGrupoOcioEnTrabajoSemanal,
    abrirNuevoGrupoOcio,
    abrirNuevoGrupoOcioParaAlumno,
    abrirNuevoGrupoOcioParaTurno,
    abrirPantallaConScroll,
    actualizarSemanaOcioDesdeAimHarder,
    agendaAlumnoLinea,
    agendaBloqueBlanco,
    agendaCabeceraLinea,
    agendaGrupoLinea,
    agendaGrupoPropuesta,
    agendaGrupoResumen,
    agendaVacio,
    agendaVacioMini,
    alumnoVieneOcioSemana,
    alumnosGrupoOcioEstable,
    alumnosTurnoOcio,
    analizarNuevoAlumnoOcio,
    anioInicioTemporadaAgenda,
    asignarAlumnoGrupoOcio,
    asignarRecomendacionAlumnoSinGrupoOcio,
    avisoCompleto,
    avisoEvolucionAlumnoOcio,
    avisoNeutral,
    avisoPendiente,
    botonAsistenciaAusente,
    botonAsistenciaOff,
    botonAsistenciaOk,
    botonMini,
    botonPeligro,
    botonPeligroMini,
    botonPrincipal,
    botonSecundario,
    buscarFichaNuevoOcio,
    cambiarAsistenciaOcioSemana,
    cambiarPistaPropuestaOcio,
    cambiosOcioSemana,
    capitalizarPrimera,
    cargarAgendaOperativaDirecta,
    cargarDisponibilidad,
    cargarEntrenadores,
    cargarOcioCambios,
    crearGrupoVacioPropuestaOcio,
    crearGruposEstablesDesdePropuestaOcio,
    deshacerPreparacionOcio,
    diaFijoOcioDesdeFecha,
    edadAproximadaOcio,
    edadOcioAlumnoEnFecha,
    editarGrupoOcio,
    eliminarCambioPuntualOcio,
    eliminarGrupoOcio,
    eliminarGrupoVacioPropuestaOcio,
    errorCaja,
    esTurnoOficialOcio,
    esVistaMovilApp,
    estiloGrupoPorPistaApp,
    estiloValidacionPedagogicaApp,
    explicacionCompactaPropuestaOcioApp,
    fechaCambioOcioPorDia,
    fechaGrupoOcioSemana,
    filaAlumnoAsistencia,
    formatearFecha,
    generarPropuestaGruposOcio,
    gridFormulario,
    gridMiniMetricas,
    gruposOcioDiaSemana,
    guardarCambioPuntualOcio,
    guardarGrupoOcio,
    horaCorta,
    horarioTurnoOcio,
    incorporarNuevoAlumnoOcio,
    inputCampo,
    labelCampo,
    limpiarFormularioCambioOcio,
    mesAgendaActivo,
    mesesAgenda,
    miniTarjetaBlanca,
    mostrarFormularioOcioCambio,
    mostrarFormularioOcioGrupo,
    moverAlumnoEntrePropuestasOcio,
    nombreAlumnoOcioTarjetaApp,
    nombreGrupoSemanalOcio,
    nombreMesAgendaDesdeClave,
    normalizarNombreFueraPlazoAgenda,
    ocioAimHarderCargando,
    ocioAimHarderError,
    ocioAimHarderEstadoAlumnos,
    ocioAimHarderMensaje,
    ocioAimHarderSemana,
    ocioAlumnoCambioSeleccionado,
    ocioAlumnoPendienteNuevoGrupoId,
    ocioAlumnos,
    ocioCambioForm,
    ocioGenerandoPropuesta,
    ocioGrupoForm,
    ocioGrupoFormInicial,
    ocioGrupos,
    ocioGuardandoPropuesta,
    ocioNuevoAlumnoId,
    ocioNuevoAnalizando,
    ocioNuevoGuardandoGrupoId,
    ocioNuevoNivel,
    ocioNuevoNombre,
    ocioNuevoRecomendaciones,
    ocioNuevoSugerencias,
    ocioPropuestaGrupos,
    ocioSemanaResultados,
    ocioTurnoVista,
    opcionesNivel,
    opcionesPista,
    opcionesTemporadaAgenda,
    pantalla,
    prepararDiaOcioSemana,
    quitarAlumnoGrupoOcio,
    rangoSemanaAgenda,
    recomendacionesAlumnoSinGrupoOcio,
    renderAyudaRapidaPantallaApp,
    resultadoPerteneceDiaOcio,
    seleccionarFichaNuevoOcio,
    semanaAgendaActiva,
    semanasAgenda,
    setAnioInicioTemporadaAgenda,
    setBusquedaOcio,
    setFiltroDiaFichasOcio,
    setMesAgenda,
    setMostrarFormularioOcioGrupo,
    setOcioAlumnoPendienteNuevoGrupoId,
    setOcioCambioForm,
    setOcioGrupoForm,
    setOcioNuevoAlumnoId,
    setOcioNuevoNivel,
    setOcioNuevoNombre,
    setOcioNuevoRecomendaciones,
    setOcioNuevoSugerencias,
    setOcioPropuestaGrupos,
    setOcioTurnoVista,
    setSemanaAgendaInicio,
    tarjeta,
    tarjetaResaltada,
    textoSinAcentosGrupoApp,
  } = ctx;

  return (
    <>
      {pantalla === 'ocioGrupos' && (() => {
        const configuracionTurnos = {
          Jueves: { hora: '18:00–20:00', etiqueta: 'Jueves' },
          Sábado: { hora: '09:45–11:45', etiqueta: 'Sábado' },
          Domingo: { hora: '12:00–14:00', etiqueta: 'Domingo' },
        } as const;

        const gruposTurno = ocioGrupos.filter(
          (grupo) =>
            textoSinAcentosGrupoApp(grupo.dia_semana || '') ===
            textoSinAcentosGrupoApp(ocioTurnoVista)
        );

        const alumnosDelTurno = alumnosTurnoOcio(ocioTurnoVista);
        const totalAlumnosTurno = alumnosDelTurno.length;
        const alumnosSinGrupoTurno = alumnosDelTurno.filter(
          (alumno) => !alumno.grupo_id
        );

        const tarjetaMetricaOcioTurno = (
          color: string,
          fondo: string
        ): React.CSSProperties => ({
          ...miniTarjetaBlanca,
          border: `1px solid ${color}33`,
          background: fondo,
          minHeight: 82,
          display: 'grid',
          alignContent: 'center',
        });

        const alumnosPorGrupoOcio = new Map<string, OcioAlumnoApp[]>();
        ocioAlumnos.forEach((alumno) => {
          if (!alumno.grupo_id) return;
          const actuales = alumnosPorGrupoOcio.get(alumno.grupo_id) || [];
          actuales.push(alumno);
          alumnosPorGrupoOcio.set(alumno.grupo_id, actuales);
        });

        const coincideTurnoAlumnoOcio = (
          alumno: OcioAlumnoApp,
          grupo: OcioGrupoApp
        ) => {
          const diaAlumno = textoSinAcentosGrupoApp(
            alumno.dia_fijo || alumno.grupo_dia || ''
          );
          const diaGrupo = textoSinAcentosGrupoApp(grupo.dia_semana || '');
          const inicioAlumno = (
            alumno.hora_inicio_fija ||
            alumno.grupo_hora_inicio ||
            ''
          ).slice(0, 5);
          const inicioGrupo = (grupo.hora_inicio || '').slice(0, 5);

          return (
            (!diaAlumno || diaAlumno === diaGrupo) &&
            (!inicioAlumno || inicioAlumno === inicioGrupo)
          );
        };

        const alumnosDisponiblesParaGrupoOcio = (grupo: OcioGrupoApp) => {
          const busqueda = textoSinAcentosGrupoApp(
            ocioBusquedaGestionGrupo.trim()
          );

          return ocioAlumnos
            .filter(
              (alumno) =>
                alumno.grupo_id !== grupo.grupo_id &&
                coincideTurnoAlumnoOcio(alumno, grupo)
            )
            .filter((alumno) => {
              if (!busqueda) return true;
              return textoSinAcentosGrupoApp(alumno.alumno || '').includes(
                busqueda
              );
            })
            .sort((a, b) => (a.alumno || '').localeCompare(b.alumno || ''));
        };

        const avisosEvolucionPorGrupo = new Map<
          string,
          Array<{
            alumno: string;
            nivelActual: string;
            estadoActual: string;
            grupoSugerido: OcioGrupoApp | null;
            motivo: string;
          }>
        >();

        gruposTurno.forEach((grupo) => {
          const avisos = (alumnosPorGrupoOcio.get(grupo.grupo_id) || [])
            .map((alumno) => avisoEvolucionAlumnoOcio(alumno, grupo))
            .filter(Boolean) as Array<{
              alumno: string;
              nivelActual: string;
              estadoActual: string;
              grupoSugerido: OcioGrupoApp | null;
              motivo: string;
            }>;

          if (avisos.length > 0) {
            avisosEvolucionPorGrupo.set(grupo.grupo_id, avisos);
          }
        });

        const estiloTurno = (activo: boolean): React.CSSProperties => ({
          border: activo ? '1px solid #16a34a' : '1px solid #bbf7d0',
          background: activo ? '#16a34a' : '#f0fdf4',
          color: activo ? '#ffffff' : '#166534',
          borderRadius: 16,
          padding: '12px 14px',
          cursor: 'pointer',
          fontWeight: 900,
          textAlign: 'left',
          boxShadow: activo ? '0 8px 22px rgba(22,163,74,0.18)' : 'none',
          transition: 'all 160ms ease',
          minWidth: 0,
        });

        return (
          <section style={{ display: 'grid', gap: 16 }}>
            <article
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
              <div>
                <p
                  style={{
                    margin: 0,
                    color: '#6ee7b7',
                    fontSize: 11,
                    fontWeight: 950,
                    letterSpacing: '.12em',
                    textTransform: 'uppercase',
                  }}
                >
                  OCIO · TEMPORADA
                </p>
                <h2
                  style={{
                    margin: '4px 0 0',
                    fontSize: 28,
                    letterSpacing: '-.025em',
                    color: '#ffffff',
                  }}
                >
                  Grupos estables
                </h2>
              {renderAyudaRapidaPantallaApp()}
                <p
                  style={{
                    margin: '7px 0 0',
                    color: '#cbd5e1',
                    lineHeight: 1.45,
                  }}
                >
                  Selecciona el día de Ocio y trabaja con sus alumnos y grupos estables.
                </p>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 10,
                }}
              >
                {(Object.keys(configuracionTurnos) as Array<
                  keyof typeof configuracionTurnos
                >).map((dia) => {
                  const activo = ocioTurnoVista === dia;
                  return (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => {
                        setOcioTurnoVista(dia);
                        setOcioGrupoGestionAbiertoId('');
                        setOcioBusquedaGestionGrupo('');
                        setOcioPropuestaGrupos([]);
                        window.setTimeout(() => {
                          document
                            .getElementById('ocio-grupos-turno-activo')
                            ?.scrollIntoView({
                              behavior: 'smooth',
                              block: 'start',
                            });
                        }, 60);
                      }}
                      style={{
                        border: activo
                          ? '1px solid rgba(110,231,183,.95)'
                          : '1px solid rgba(255,255,255,.22)',
                        background: activo
                          ? 'rgba(16,185,129,.22)'
                          : 'rgba(255,255,255,.09)',
                        color: '#ffffff',
                        borderRadius: 16,
                        padding: '12px 14px',
                        cursor: 'pointer',
                        fontWeight: 900,
                        textAlign: 'left',
                        boxShadow: activo
                          ? '0 8px 22px rgba(0,0,0,.14)'
                          : 'none',
                        transition: 'all 160ms ease',
                        minWidth: 0,
                      }}
                    >
                      <span style={{ display: 'block', fontSize: 15 }}>
                        {configuracionTurnos[dia].etiqueta}
                      </span>
                      <span
                        style={{
                          display: 'block',
                          marginTop: 3,
                          fontSize: 13,
                          color: activo ? '#d1fae5' : '#cbd5e1',
                        }}
                      >
                        {configuracionTurnos[dia].hora}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setBusquedaOcio('');
                    setFiltroDiaFichasOcio(ocioTurnoVista);
                    abrirPantallaConScroll('ocioAlumnos');
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,.10)',
                    border: '1px solid rgba(255,255,255,.18)',
                    minWidth: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#ffffff',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      color: '#cbd5e1',
                      fontWeight: 800,
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                    }}
                  >
                    ALUMNOS DEL TURNO
                  </span>
                  <strong
                    style={{
                      display: 'block',
                      marginTop: 4,
                      fontSize: 25,
                      lineHeight: 1,
                      fontWeight: 950,
                    }}
                  >
                    {totalAlumnosTurno}
                  </strong>
                  <span
                    style={{
                      display: 'block',
                      marginTop: 5,
                      color: '#d1fae5',
                      fontSize: 12,
                    }}
                  >
                    {ocioTurnoVista} · Abrir fichas
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setOcioPestanaProceso('grupos');
                    setOcioPanelOperativo('ninguno');
                    window.setTimeout(() =>
                      document
                        .getElementById('ocio-grupos-turno-activo')
                        ?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);
                  }}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,.10)',
                    border: '1px solid rgba(255,255,255,.18)',
                    minWidth: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#ffffff',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      color: '#cbd5e1',
                      fontWeight: 800,
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                    }}
                  >
                    GRUPOS ESTABLES
                  </span>
                  <strong
                    style={{
                      display: 'block',
                      marginTop: 4,
                      fontSize: 25,
                      lineHeight: 1,
                      fontWeight: 950,
                    }}
                  >
                    {gruposTurno.length}
                  </strong>
                  <span
                    style={{
                      display: 'block',
                      marginTop: 5,
                      color: '#d1fae5',
                      fontSize: 12,
                    }}
                  >
                    {configuracionTurnos[ocioTurnoVista].hora}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirPantallaConScroll('ocioEvaluaciones')}
                  style={{
                    padding: '12px 14px',
                    borderRadius: 16,
                    background: 'rgba(255,255,255,.10)',
                    border: '1px solid rgba(255,255,255,.18)',
                    minWidth: 0,
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: '#ffffff',
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      color: '#cbd5e1',
                      fontWeight: 800,
                      fontSize: 10,
                      textTransform: 'uppercase',
                      letterSpacing: '.06em',
                    }}
                  >
                    EVALUACIONES
                  </span>
                  <strong
                    style={{
                      display: 'block',
                      marginTop: 4,
                      fontSize: 20,
                      lineHeight: 1.05,
                      fontWeight: 950,
                    }}
                  >
                    Temporada
                  </strong>
                  <span
                    style={{
                      display: 'block',
                      marginTop: 5,
                      color: '#d1fae5',
                      fontSize: 12,
                    }}
                  >
                    Puntual · Navidad · Final
                  </span>
                </button>
              </div>
            </article>

            <article
              style={{
                ...agendaBloqueBlanco,
                padding: 10,
                border: '1px solid #dbeafe',
                background: '#ffffff',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: esVistaMovilApp
                    ? 'repeat(2, minmax(0, 1fr))'
                    : 'repeat(4, minmax(0, 1fr))',
                  gap: 8,
                }}
              >
                {[
                  { clave: 'colocar', numero: '1', titulo: 'Colocar alumnos', subtitulo: `${alumnosSinGrupoTurno.length} sin grupo` },
                  { clave: 'grupos', numero: '2', titulo: 'Grupos estables', subtitulo: `${gruposTurno.length} grupos` },
                  { clave: 'cambios', numero: '3', titulo: 'AimHarder', subtitulo: 'Quién viene esta semana' },
                  { clave: 'semana', numero: '4', titulo: 'Preparar semana', subtitulo: 'Organización temporal' },
                ].map((pestana) => {
                  const activa = ocioPestanaProceso === pestana.clave;
                  return (
                    <button
                      key={`ocio-pestana-${pestana.clave}`}
                      type="button"
                      onClick={() => {
                        const clave = pestana.clave as
                          | 'colocar'
                          | 'grupos'
                          | 'cambios'
                          | 'semana';
                        setOcioPestanaProceso(clave);
                        if (clave === 'colocar') {
                          if (ocioPanelOperativo !== 'nuevo') {
                            setOcioPanelOperativo('ninguno');
                          }
                        } else if (clave === 'grupos') {
                          setOcioPanelOperativo('ninguno');
                        } else if (clave === 'cambios') {
                          setOcioPanelOperativo('cambios');
                          cargarOcioCambios();
                        } else {
                          setOcioPanelOperativo('semana');
                          cargarOcioCambios();
                          cargarAgendaOperativaDirecta();
                        }
                      }}
                      style={{
                        border: activa ? '2px solid #16a34a' : '1px solid #e2e8f0',
                        background: activa ? '#f0fdf4' : '#ffffff',
                        color: activa ? '#166534' : '#334155',
                        borderRadius: 14,
                        padding: '11px 10px',
                        cursor: 'pointer',
                        textAlign: 'left',
                        minWidth: 0,
                      }}
                    >
                      <span style={{ fontSize: 11, fontWeight: 950, color: activa ? '#16a34a' : '#94a3b8' }}>
                        PASO {pestana.numero}
                      </span>
                      <strong style={{ display: 'block', marginTop: 3, fontSize: 14 }}>
                        {pestana.titulo}
                      </strong>
                      <span style={{ display: 'block', marginTop: 3, fontSize: 11, color: '#64748b' }}>
                        {pestana.subtitulo}
                      </span>
                    </button>
                  );
                })}
              </div>
            </article>

            {(ocioPestanaProceso === 'colocar' || ocioPestanaProceso === 'grupos') && mostrarFormularioOcioGrupo && (
              <article
                id="ocio-formulario-grupo-estable"
                style={{ ...tarjetaResaltada, scrollMarginTop: 18 }}
              >
                <div style={agendaCabeceraLinea}>
                  <div>
                    <h3 style={{ margin: 0 }}>
                      {ocioGrupoForm.id
                        ? 'Editar grupo estable'
                        : ocioAlumnoPendienteNuevoGrupoId
                        ? 'Crear grupo estable y asignar alumno'
                        : 'Crear grupo estable'}
                    </h3>
                    <p style={{ margin: '5px 0 0', color: '#64748b' }}>
                      {ocioAlumnoPendienteNuevoGrupoId
                        ? 'Al guardar, el alumno quedará asignado automáticamente a este grupo estable.'
                        : 'La ficha estable será la base de las semanas de Ocio.'}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormularioOcioGrupo(false);
                      setOcioGrupoForm(ocioGrupoFormInicial());
                      setOcioAlumnoPendienteNuevoGrupoId('');
                    }}
                    style={botonSecundario}
                  >
                    Cerrar
                  </button>
                </div>

                <div style={{ ...gridFormulario, marginTop: 14 }}>
                  <label style={labelCampo}>
                    Nombre grupo
                    <input
                      value={ocioGrupoForm.nombre}
                      onChange={(e) =>
                        setOcioGrupoForm({
                          ...ocioGrupoForm,
                          nombre: e.target.value,
                        })
                      }
                      placeholder="Grupo 1"
                    />
                  </label>

                  <label style={labelCampo}>
                    Día
                    <select
                      value={ocioGrupoForm.dia}
                      onChange={(e) =>
                        setOcioGrupoForm({
                          ...ocioGrupoForm,
                          dia: e.target.value,
                        })
                      }
                    >
                      <option>Jueves</option>
                      <option>Sábado</option>
                      <option>Domingo</option>
                    </select>
                  </label>

                  <label style={labelCampo}>
                    Hora inicio
                    <input
                      type="time"
                      value={ocioGrupoForm.horaInicio}
                      onChange={(e) =>
                        setOcioGrupoForm({
                          ...ocioGrupoForm,
                          horaInicio: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label style={labelCampo}>
                    Hora fin
                    <input
                      type="time"
                      value={ocioGrupoForm.horaFin}
                      onChange={(e) =>
                        setOcioGrupoForm({
                          ...ocioGrupoForm,
                          horaFin: e.target.value,
                        })
                      }
                    />
                  </label>

                  <label style={labelCampo}>
                    Nivel grupo
                    <select
                      value={ocioGrupoForm.nivel}
                      onChange={(e) =>
                        setOcioGrupoForm({
                          ...ocioGrupoForm,
                          nivel: e.target.value,
                        })
                      }
                    >
                      {opcionesNivel.map((nivel) => (
                        <option key={nivel} value={nivel}>
                          {nivel}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label style={labelCampo}>
                    Pista
                    <select
                      value={ocioGrupoForm.pista}
                      onChange={(e) =>
                        setOcioGrupoForm({
                          ...ocioGrupoForm,
                          pista: e.target.value,
                        })
                      }
                    >
                      {opcionesPista.map((pista) => (
                        <option key={pista} value={pista}>
                          {pista}
                        </option>
                      ))}
                    </select>
                  </label>

                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <button onClick={guardarGrupoOcio} style={botonPrincipal}>
                    {ocioAlumnoPendienteNuevoGrupoId
                      ? 'Crear grupo y asignar alumno'
                      : 'Guardar grupo'}
                  </button>
                  <button
                    onClick={() => {
                      setMostrarFormularioOcioGrupo(false);
                      setOcioGrupoForm(ocioGrupoFormInicial());
                      setOcioAlumnoPendienteNuevoGrupoId('');
                    }}
                    style={botonSecundario}
                  >
                    Cancelar
                  </button>
                </div>
              </article>
            )}

            {ocioPestanaProceso === 'colocar' && (
              <>
            <article
              id="ocio-alumnos-turno"
              style={{
                ...agendaBloqueBlanco,
                scrollMarginTop: 18,
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
              }}
            >
              <div style={agendaCabeceraLinea}>
                <div style={{ minWidth: 0 }}>
                  <span
                    style={{
                      color: '#16a34a',
                      fontWeight: 900,
                      fontSize: 12,
                      textTransform: 'uppercase',
                    }}
                  >
                    Alumnos del turno
                  </span>
                  <h3 style={{ margin: '3px 0 0' }}>
                    {ocioTurnoVista} · {configuracionTurnos[ocioTurnoVista].hora}
                  </h3>
                  <p style={{ margin: '5px 0 0', color: '#64748b' }}>
                    {totalAlumnosTurno} alumnos · {alumnosSinGrupoTurno.length}{' '}
                    sin grupo estable
                  </p>
                </div>
                <button
                  type="button"
                  onClick={abrirNuevoGrupoOcio}
                  style={botonPrincipal}
                >
                  + Crear grupo estable
                </button>
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    type="button"
                    onClick={() => {
                      setOcioPanelOperativo('nuevo');
                      setOcioNuevoNombre('');
                      setOcioNuevoNivel('');
                      setOcioNuevoAlumnoId('');
                      setOcioNuevoSugerencias([]);
                      setOcioNuevoRecomendaciones([]);
                    }}
                    style={botonSecundario}
                  >
                    + Añadir alumno
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      setOcioAlumnosTurnoAbierto((abierto) => !abierto)
                    }
                    style={botonSecundario}
                  >
                    {ocioAlumnosTurnoAbierto
                      ? 'Ocultar listado rápido'
                      : 'Ver listado rápido'}
                  </button>

                  {gruposTurno.length === 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        setOcioAlumnosTurnoAbierto(true);
                        generarPropuestaGruposOcio();
                      }}
                      disabled={
                        ocioGenerandoPropuesta ||
                        ocioGuardandoPropuesta ||
                        totalAlumnosTurno === 0
                      }
                      style={botonPrincipal}
                    >
                      {ocioGenerandoPropuesta
                        ? 'Calculando...'
                        : 'Recomendar grupos'}
                    </button>
                  )}
                </div>
              </div>

              {ocioAlumnosTurnoAbierto &&
                (alumnosDelTurno.length === 0 ? (
                  <div style={{ ...agendaVacio, marginTop: 12 }}>
                    No hay alumnos cargados para este día de Ocio.
                  </div>
                ) : (
                <div
                  style={{
                    display: 'grid',
                    gap: 7,
                    marginTop: 12,
                    maxHeight: 360,
                    overflowY: 'auto',
                    overflowX: 'hidden',
                    paddingRight: 2,
                  }}
                >
                  {alumnosDelTurno.map((alumno) => {
                    const edad = edadAproximadaOcio(alumno.fecha_nacimiento);
                    const nivel =
                      alumno.nivel_usado || alumno.nivel || 'Sin nivel';
                    const puedeRecomendar =
                      !alumno.grupo_id && gruposTurno.length > 0;
                    const recomendaciones = puedeRecomendar
                      ? recomendacionesAlumnoSinGrupoOcio(
                          alumno,
                          gruposTurno
                        )
                      : [];
                    const recomendacionesCompatibles = recomendaciones.filter(
                      (opcion) => opcion.estado !== 'NO_ENCAJA'
                    );
                    const recomendacionesVisibles =
                      recomendacionesCompatibles.length > 0
                        ? recomendacionesCompatibles
                        : recomendaciones.slice(0, 1);
                    const mejorRecomendacion = recomendacionesCompatibles[0] || null;
                    const sinEncaje =
                      puedeRecomendar && recomendacionesCompatibles.length === 0;

                    return (
                      <article
                        key={`ocio-turno-alumno-${alumno.alumno_id}`}
                        style={{
                          padding: '9px 10px',
                          border: puedeRecomendar
                            ? '1px solid #86efac'
                            : '1px solid #dcfce7',
                          borderRadius: 12,
                          background: alumno.grupo_id
                            ? '#f8fafc'
                            : '#f0fdf4',
                          minWidth: 0,
                        }}
                      >
                        <div
                          style={{
                            display: 'grid',
                            gridTemplateColumns: esVistaMovilApp
                              ? 'minmax(0, 1fr)'
                              : 'minmax(0, 1fr) auto',
                            gap: 8,
                            alignItems: 'center',
                            cursor: 'default',
                          }}
                        >
                          <div style={{ minWidth: 0 }}>
                            <strong
                              style={{
                                display: 'block',
                                overflowWrap: 'anywhere',
                              }}
                            >
                              {alumno.alumno}
                            </strong>
                            <span
                              style={{
                                display: 'block',
                                marginTop: 3,
                                color: '#64748b',
                                fontSize: 13,
                              }}
                            >
                              Nivel {nivel}
                              {alumno.fecha_nacimiento
                                ? ` · ${formatearFecha(
                                    alumno.fecha_nacimiento
                                  )}`
                                : ''}
                              {edad !== null ? ` · ${edad} años` : ''}
                            </span>
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              gap: 7,
                              alignItems: 'center',
                              flexWrap: 'wrap',
                              justifyContent: esVistaMovilApp
                                ? 'flex-start'
                                : 'flex-end',
                            }}
                          >
                            <span
                              style={{
                                borderRadius: 999,
                                padding: '4px 8px',
                                fontSize: 11,
                                fontWeight: 900,
                                background: alumno.grupo_id
                                  ? '#e2e8f0'
                                  : '#dcfce7',
                                color: alumno.grupo_id
                                  ? '#475569'
                                  : '#166534',
                              }}
                            >
                              {alumno.grupo_id
                                ? alumno.grupo_estable || 'Con grupo'
                                : 'Sin grupo'}
                            </span>

                            {puedeRecomendar && (
                              <span
                                style={{
                                  borderRadius: 999,
                                  padding: '4px 8px',
                                  fontSize: 11,
                                  fontWeight: 900,
                                  background: mejorRecomendacion
                                    ? mejorRecomendacion.estado === 'RECOMENDADO'
                                      ? '#dbeafe'
                                      : '#ffedd5'
                                    : '#fee2e2',
                                  color: mejorRecomendacion
                                    ? mejorRecomendacion.estado === 'RECOMENDADO'
                                      ? '#1d4ed8'
                                      : '#9a3412'
                                    : '#b91c1c',
                                }}
                              >
                                {mejorRecomendacion
                                  ? mejorRecomendacion.estado === 'RECOMENDADO'
                                    ? `Recomendado · ${mejorRecomendacion.grupo.nombre_grupo}`
                                    : `Revisar · ${mejorRecomendacion.grupo.nombre_grupo}`
                                  : 'Sin encaje'}
                              </span>
                            )}

                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setFiltroDiaFichasOcio(ocioTurnoVista);
                                setBusquedaOcio(alumno.alumno);
                                abrirPantallaConScroll('ocioAlumnos');
                              }}
                              style={botonMini}
                            >
                              Ficha
                            </button>
                          </div>
                        </div>

                        {puedeRecomendar && (
                          <div
                            style={{
                              display: 'grid',
                              gap: 8,
                              marginTop: 10,
                            }}
                          >
                            {recomendaciones.length === 0 ? (
                              <div style={avisoNeutral}>
                                No hay grupos estables activos en este turno.
                              </div>
                            ) : (
                              recomendacionesVisibles.map((opcion) => (
                                <div
                                  key={`recomendar-${alumno.alumno_id}-${opcion.grupo.grupo_id}`}
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns: esVistaMovilApp
                                      ? 'minmax(0, 1fr)'
                                      : 'minmax(0, 1fr) auto',
                                    gap: 8,
                                    alignItems: 'center',
                                    padding: 10,
                                    borderRadius: 12,
                                    border:
                                      opcion.estado === 'RECOMENDADO'
                                        ? '1px solid #93c5fd'
                                        : opcion.estado === 'REVISAR'
                                        ? '1px solid #fdba74'
                                        : '1px solid #fecaca',
                                    background:
                                      opcion.estado === 'RECOMENDADO'
                                        ? '#eff6ff'
                                        : opcion.estado === 'REVISAR'
                                        ? '#fff7ed'
                                        : '#fff1f2',
                                  }}
                                >
                                  <div style={{ minWidth: 0 }}>
                                    <strong>
                                      {opcion.estado === 'RECOMENDADO'
                                        ? 'Recomendado'
                                        : opcion.estado === 'REVISAR'
                                        ? 'Revisar'
                                        : 'No encaja'}{' '}
                                      · {opcion.grupo.nombre_grupo}
                                    </strong>
                                    <div
                                      style={{
                                        marginTop: 3,
                                        color: '#64748b',
                                        fontSize: 13,
                                      }}
                                    >
                                      Nivel{' '}
                                      {opcion.grupo.nivel_grupo || '-'} ·{' '}
                                      {opcion.grupo.pista || '-'} ·{' '}
                                      {opcion.totalActual} →{' '}
                                      {opcion.totalFinal} niños
                                    </div>
                                    <div
                                      style={{
                                        marginTop: 3,
                                        color: '#64748b',
                                        fontSize: 12,
                                      }}
                                    >
                                      {opcion.motivo}
                                    </div>
                                  </div>

                                  {opcion.estado !== 'NO_ENCAJA' && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        asignarRecomendacionAlumnoSinGrupoOcio(
                                          alumno,
                                          opcion.grupo
                                        )
                                      }
                                      style={
                                        opcion.estado === 'RECOMENDADO'
                                          ? botonPrincipal
                                          : botonSecundario
                                      }
                                    >
                                      Asignar a este grupo
                                    </button>
                                  )}
                                </div>
                              ))
                            )}

                            {sinEncaje && (
                              <div style={avisoPendiente}>
                                <strong>Necesita otro grupo estable.</strong>
                                <div style={{ marginTop: 4 }}>
                                  Ningún grupo actual encaja por nivel/ratio con
                                  el recomendador que ya utilizas.
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirNuevoGrupoOcioParaAlumno(alumno)
                                  }
                                  style={{ ...botonPrincipal, marginTop: 9 }}
                                >
                                  Crear grupo estable para {alumno.alumno}
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              ))}

            </article>

            {ocioPropuestaGrupos.length > 0 && gruposTurno.length === 0 && (
              <article
                id="ocio-propuesta-grupos"
                style={{
                  ...tarjetaResaltada,
                  scrollMarginTop: 18,
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box',
                }}
              >
                <div style={agendaCabeceraLinea}>
                  <div style={{ minWidth: 0 }}>
                    <span
                      style={{
                        color: '#2563eb',
                        fontWeight: 900,
                        fontSize: 12,
                        textTransform: 'uppercase',
                      }}
                    >
                      Propuesta editable
                    </span>
                    <h3 style={{ margin: '3px 0 0' }}>
                      Grupos recomendados · {ocioTurnoVista}
                    </h3>
                    <p style={{ margin: '5px 0 0', color: '#64748b' }}>
                      Nivel primero, edad después. A/A+ juntos en pequeña; B y
                      superiores en grande.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setOcioPropuestaGrupos([])}
                    style={botonSecundario}
                    disabled={ocioGuardandoPropuesta}
                  >
                    Descartar
                  </button>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: esVistaMovilApp
                      ? 'minmax(0, 1fr)'
                      : 'repeat(auto-fit, minmax(min(100%, 390px), 1fr))',
                    gap: 12,
                    width: '100%',
                    minWidth: 0,
                    marginTop: 14,
                  }}
                >
                  {ocioPropuestaGrupos.map((grupo) => {
                    const miembros = grupo.alumnoIds
                      .map((id) =>
                        ocioAlumnos.find((alumno) => alumno.alumno_id === id)
                      )
                      .filter(Boolean) as OcioAlumnoApp[];

                    const maximo = grupo.pista === 'Pequeña' ? 4 : 7;

                    return (
                      <article
                        key={grupo.propuesta_id}
                        style={{
                          ...agendaGrupoPropuesta,
                          ...estiloGrupoPorPistaApp({
                            pista: grupo.pista,
                            nivel_grupo: grupo.nivelObjetivo,
                          }),
                          minWidth: 0,
                          width: '100%',
                          maxWidth: '100%',
                          boxSizing: 'border-box',
                          overflow: 'hidden',
                        }}
                      >
                        <div style={agendaGrupoLinea}>
                          <h3 style={{ margin: 0 }}>{grupo.nombre}</h3>
                          <span>{miembros.length} niños</span>
                        </div>

                        <p>
                          <strong>Nivel:</strong> {grupo.nivelObjetivo} ·{' '}
                          <strong>Pista:</strong> {grupo.pista} ·{' '}
                          <strong>Ratio:</strong> {miembros.length}/{maximo}
                        </p>

                        <div style={{ ...gridFormulario, marginBottom: 10 }}>
                          <label style={labelCampo}>
                            Pista
                            <select
                              value={grupo.pista}
                              onChange={(e) =>
                                cambiarPistaPropuestaOcio(
                                  grupo.propuesta_id,
                                  e.target.value as 'Pequeña' | 'Grande'
                                )
                              }
                            >
                              <option value="Pequeña">Pequeña</option>
                              <option value="Grande">Grande</option>
                            </select>
                          </label>
                        </div>

                        {grupo.alumnoIds.length === 0 && (
                          <button
                            type="button"
                            onClick={() =>
                              eliminarGrupoVacioPropuestaOcio(grupo.propuesta_id)
                            }
                            style={{ ...botonPeligroMini, marginTop: 8 }}
                          >
                            Eliminar grupo vacío
                          </button>
                        )}

                        <div
                          style={{
                            ...estiloValidacionPedagogicaApp(
                              grupo.aviso ? 'REVISAR' : 'OK'
                            ),
                            marginBottom: 10,
                          }}
                        >
                          <strong>
                            {grupo.aviso ? 'REVISIÓN NECESARIA' : 'GRUPO CORRECTO'}
                          </strong>
                          {grupo.aviso && (
                            <p style={{ margin: '6px 0 0' }}>{grupo.aviso}</p>
                          )}
                        </div>

                        <div style={{ display: 'grid', gap: 7, marginTop: 10 }}>
                          {miembros.map((alumno) => {
                            const destinos = ocioPropuestaGrupos.filter(
                              (opcion) =>
                                opcion.propuesta_id !== grupo.propuesta_id &&
                                opcion.pista === grupo.pista
                            );
                            const edad = edadAproximadaOcio(alumno.fecha_nacimiento);

                            return (
                              <div
                                key={`propuesta-${grupo.propuesta_id}-${alumno.alumno_id}`}
                                style={{
                                  ...agendaAlumnoLinea,
                                  display: 'grid',
                                  gridTemplateColumns:
                                    esVistaMovilApp || destinos.length === 0
                                      ? 'minmax(0, 1fr)'
                                      : 'minmax(0, 1fr) minmax(170px, 210px)',
                                  gap: 10,
                                  alignItems: 'center',
                                  width: '100%',
                                  minWidth: 0,
                                  boxSizing: 'border-box',
                                }}
                              >
                                <div
                                  style={{
                                    minWidth: 0,
                                    overflowWrap: 'anywhere',
                                  }}
                                >
                                  <strong>{alumno.alumno}</strong>
                                  <p
                                    style={{
                                      margin: '4px 0 0',
                                      overflowWrap: 'anywhere',
                                    }}
                                  >
                                    {alumno.nivel_usado || alumno.nivel || '-'} · {grupo.pista}
                                    {edad !== null ? ` · ${edad} años` : ''}
                                  </p>
                                  {explicacionCompactaPropuestaOcioApp(
                                    alumno,
                                    grupo,
                                    miembros
                                  ) && (
                                    <p
                                      style={{
                                        margin: '3px 0 0',
                                        fontSize: 11,
                                        lineHeight: 1.25,
                                        color: '#64748b',
                                        fontWeight: 700,
                                        overflowWrap: 'anywhere',
                                      }}
                                    >
                                      {explicacionCompactaPropuestaOcioApp(
                                        alumno,
                                        grupo,
                                        miembros
                                      )}
                                    </p>
                                  )}
                                </div>

                                {destinos.length > 0 && (
                                  <label
                                    style={{
                                      ...labelCampo,
                                      width: '100%',
                                      minWidth: 0,
                                      maxWidth: '100%',
                                    }}
                                  >
                                    Mover a
                                    <select
                                      value=""
                                      style={{
                                        width: '100%',
                                        minWidth: 0,
                                        maxWidth: '100%',
                                        boxSizing: 'border-box',
                                      }}
                                      onChange={(e) => {
                                        moverAlumnoEntrePropuestasOcio(
                                          alumno.alumno_id,
                                          grupo.propuesta_id,
                                          e.target.value
                                        );
                                        e.currentTarget.value = '';
                                      }}
                                    >
                                      <option value="">Mantener aquí</option>
                                      {destinos.map((destino) => (
                                        <option
                                          key={destino.propuesta_id}
                                          value={destino.propuesta_id}
                                        >
                                          {destino.nombre}
                                        </option>
                                      ))}
                                    </select>
                                  </label>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </article>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginTop: 14,
                    justifyContent: 'flex-end',
                  }}
                >
                  <button
                    type="button"
                    onClick={crearGrupoVacioPropuestaOcio}
                    disabled={ocioGuardandoPropuesta}
                    style={botonSecundario}
                  >
                    + Crear grupo vacío
                  </button>
                  <button
                    type="button"
                    onClick={generarPropuestaGruposOcio}
                    disabled={ocioGuardandoPropuesta}
                    style={botonSecundario}
                  >
                    Recalcular propuesta
                  </button>
                  <button
                    type="button"
                    onClick={() => void crearGruposEstablesDesdePropuestaOcio()}
                    disabled={
                      ocioGuardandoPropuesta ||
                      ocioPropuestaGrupos.some((grupo) => Boolean(grupo.aviso))
                    }
                    style={botonPrincipal}
                  >
                    {ocioGuardandoPropuesta
                      ? 'Creando grupos...'
                      : 'Crear grupos estables'}
                  </button>
                </div>
              </article>
            )}

              </>
            )}

            {ocioPestanaProceso === 'grupos' && (
            <article
              id="ocio-grupos-turno-activo"
              style={{ ...agendaBloqueBlanco, scrollMarginTop: 18 }}
            >
              <div style={agendaCabeceraLinea}>
                <div>
                  <span
                    style={{
                      color: '#16a34a',
                      fontWeight: 900,
                      fontSize: 12,
                      textTransform: 'uppercase',
                    }}
                  >
                    {ocioTurnoVista}
                  </span>
                  <h3 style={{ margin: '3px 0 0' }}>
                    {configuracionTurnos[ocioTurnoVista].hora}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={abrirNuevoGrupoOcio}
                  style={botonPrincipal}
                >
                  + Crear grupo estable
                </button>
              </div>

              {gruposTurno.length === 0 ? (
                <div style={{ ...agendaVacio, marginTop: 12 }}>
                  Aún no hay grupos estables. Revisa los alumnos del turno y usa
                  “Recomendar grupos” para crear la estructura inicial.
                </div>
              ) : (
                <details
                  style={{
                    marginTop: 12,
                    border: '1px solid #dcfce7',
                    borderRadius: 14,
                    background: '#f8fffb',
                    overflow: 'hidden',
                  }}
                >
                  <summary
                    style={{
                      cursor: 'pointer',
                      padding: '12px 14px',
                      fontWeight: 900,
                      color: '#166534',
                      userSelect: 'none',
                    }}
                  >
                    Ver grupos estables · {gruposTurno.length}
                  </summary>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns:
                        'repeat(auto-fit, minmax(280px, 1fr))',
                      gap: 12,
                      padding: '0 12px 12px',
                    }}
                  >
                  {gruposTurno.map((grupo) => {
                    const miembrosGrupo =
                      alumnosPorGrupoOcio.get(grupo.grupo_id) || [];
                    const gestionAbierta =
                      ocioGrupoGestionAbiertoId === grupo.grupo_id;
                    const disponibles =
                      alumnosDisponiblesParaGrupoOcio(grupo);
                    const avisosEvolucion =
                      avisosEvolucionPorGrupo.get(grupo.grupo_id) || [];

                    return (
                    <article
                      key={grupo.grupo_id}
                      style={{
                        ...agendaGrupoResumen,
                        border: gestionAbierta
                          ? '2px solid #16a34a'
                          : '1px solid #bbf7d0',
                        background: '#ffffff',
                      }}
                    >
                      <div style={agendaGrupoLinea}>
                        <div>
                          <strong style={{ fontSize: 17 }}>
                            {grupo.nombre_grupo}
                          </strong>
                          <div
                            style={{
                              marginTop: 5,
                              color: '#64748b',
                              fontSize: 14,
                            }}
                          >
                            {ocioLevelRange(miembrosGrupo)} · {grupo.pista || '-'}
                          </div>
                        </div>
                        <strong
                          style={{
                            minWidth: 42,
                            textAlign: 'center',
                            borderRadius: 12,
                            background: '#f0fdf4',
                            color: '#166534',
                            padding: '7px 9px',
                          }}
                        >
                          {miembrosGrupo.length || grupo.total_alumnos}
                        </strong>
                      </div>

                      {miembrosGrupo.length > 0 ? (
                        <ul
                          style={{
                            margin: '12px 0 0 18px',
                            padding: 0,
                            lineHeight: 1.55,
                          }}
                        >
                          {miembrosGrupo.map((alumno) => (
                            <li key={alumno.alumno_id}>
                              {nombreAlumnoOcioTarjetaApp(
                                `${alumno.alumno} · ${
                                  alumno.nivel_usado || alumno.nivel || ''
                                }`
                              )}
                            </li>
                          ))}
                        </ul>
                      ) : grupo.alumnos_lista ? (
                        <ul
                          style={{
                            margin: '12px 0 0 18px',
                            padding: 0,
                            lineHeight: 1.55,
                          }}
                        >
                          {grupo.alumnos_lista
                            .split(' || ')
                            .map((alumno, indice) => (
                              <li key={`${grupo.grupo_id}-${indice}`}>
                                {nombreAlumnoOcioTarjetaApp(alumno)}
                              </li>
                            ))}
                        </ul>
                      ) : (
                        <p style={{ margin: '12px 0 0', color: '#64748b' }}>
                          Sin alumnos asignados.
                        </p>
                      )}

                      {avisosEvolucion.length > 0 && (
                        <details
                          style={{
                            ...avisoNeutral,
                            marginTop: 12,
                            padding: '9px 11px',
                            borderColor: '#fdba74',
                            background: '#fff7ed',
                          }}
                        >
                          <summary
                            style={{
                              cursor: 'pointer',
                              fontWeight: 900,
                              color: '#9a3412',
                            }}
                          >
                            Revisar grupo estable · {avisosEvolucion.length}
                          </summary>

                          <div
                            style={{
                              display: 'grid',
                              gap: 8,
                              marginTop: 9,
                            }}
                          >
                            {avisosEvolucion.map((aviso) => (
                              <div
                                key={`evolucion-${grupo.grupo_id}-${aviso.alumno}`}
                                style={{
                                  paddingTop: 7,
                                  borderTop: '1px solid #fed7aa',
                                }}
                              >
                                <strong>{aviso.alumno}</strong> · Nivel{' '}
                                {aviso.nivelActual}
                                {aviso.grupoSugerido ? (
                                  <div
                                    style={{
                                      marginTop: 4,
                                      color: '#7c2d12',
                                    }}
                                  >
                                    Mejor encaje posible:{' '}
                                    {aviso.grupoSugerido.dia_semana} ·{' '}
                                    {horaCorta(
                                      aviso.grupoSugerido.hora_inicio
                                    )} ·{' '}
                                    {aviso.grupoSugerido.nombre_grupo}
                                  </div>
                                ) : (
                                  <div
                                    style={{
                                      marginTop: 4,
                                      color: '#7c2d12',
                                    }}
                                  >
                                    Revisar manualmente su grupo estable.
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </details>
                      )}

                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          marginTop: 13,
                          flexWrap: 'wrap',
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const nuevoId = gestionAbierta
                              ? ''
                              : grupo.grupo_id;
                            setOcioGrupoGestionAbiertoId(nuevoId);
                            setOcioBusquedaGestionGrupo('');
                            if (nuevoId) {
                              window.setTimeout(() => {
                                document
                                  .getElementById(
                                    `ocio-gestion-grupo-${grupo.grupo_id}`
                                  )
                                  ?.scrollIntoView({
                                    behavior: 'smooth',
                                    block: 'nearest',
                                  });
                              }, 70);
                            }
                          }}
                          style={
                            gestionAbierta ? botonPrincipal : botonSecundario
                          }
                        >
                          {gestionAbierta
                            ? 'Cerrar gestión'
                            : 'Gestionar alumnos'}
                        </button>
                        <button
                          onClick={() => editarGrupoOcio(grupo)}
                          style={botonSecundario}
                        >
                          Editar grupo
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarGrupoOcio(grupo)}
                          style={{
                            ...botonSecundario,
                            color: '#b91c1c',
                            borderColor: '#fecaca',
                          }}
                        >
                          Borrar grupo estable
                        </button>
                      </div>

                      {gestionAbierta && (
                        <div
                          id={`ocio-gestion-grupo-${grupo.grupo_id}`}
                          style={{
                            ...avisoNeutral,
                            marginTop: 12,
                            padding: 12,
                            scrollMarginTop: 18,
                          }}
                        >
                          <strong>Grupo estable · alumnos</strong>

                          <div style={{ display: 'grid', gap: 7, marginTop: 10 }}>
                            {miembrosGrupo.length === 0 ? (
                              <span style={{ color: '#64748b' }}>
                                Todavía no hay alumnos en este grupo.
                              </span>
                            ) : (
                              miembrosGrupo.map((alumno) => (
                                <div
                                  key={`gestion-${grupo.grupo_id}-${alumno.alumno_id}`}
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    gap: 10,
                                    padding: '8px 0',
                                    borderBottom: '1px solid #e2e8f0',
                                  }}
                                >
                                  <div style={{ minWidth: 0 }}>
                                    <strong>{alumno.alumno}</strong>
                                    <div
                                      style={{
                                        color: '#64748b',
                                        fontSize: 13,
                                        marginTop: 2,
                                      }}
                                    >
                                      Nivel {alumno.nivel_usado || alumno.nivel || '-'}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      quitarAlumnoGrupoOcio(
                                        alumno.alumno_id,
                                        grupo.grupo_id
                                      )
                                    }
                                    style={{
                                      ...botonSecundario,
                                      color: '#b91c1c',
                                      borderColor: '#fecaca',
                                    }}
                                  >
                                    Quitar
                                  </button>
                                </div>
                              ))
                            )}
                          </div>

                          <div
                            style={{
                              marginTop: 14,
                              paddingTop: 12,
                              borderTop: '1px solid #e2e8f0',
                            }}
                          >
                            <strong>Añadir alumno al grupo estable</strong>
                            <input
                              value={ocioBusquedaGestionGrupo}
                              onChange={(e) =>
                                setOcioBusquedaGestionGrupo(e.target.value)
                              }
                              placeholder="Buscar alumno del mismo turno..."
                              style={{ ...inputCampo, marginTop: 8 }}
                            />

                            <div
                              style={{
                                display: 'grid',
                                gap: 7,
                                marginTop: 9,
                                maxHeight: 230,
                                overflowY: 'auto',
                              }}
                            >
                              {disponibles.length === 0 ? (
                                <span style={{ color: '#64748b' }}>
                                  No hay alumnos disponibles de este turno.
                                </span>
                              ) : (
                                disponibles.slice(0, 20).map((alumno) => (
                                  <button
                                    type="button"
                                    key={`disponible-${grupo.grupo_id}-${alumno.alumno_id}`}
                                    onClick={() =>
                                      asignarAlumnoGrupoOcio(
                                        alumno.alumno_id,
                                        grupo.grupo_id
                                      )
                                    }
                                    style={{
                                      ...botonSecundario,
                                      textAlign: 'left',
                                      justifyContent: 'space-between',
                                      display: 'flex',
                                      gap: 10,
                                    }}
                                  >
                                    <span>{alumno.alumno}</span>
                                    <span style={{ color: '#64748b' }}>
                                      {alumno.nivel_usado || alumno.nivel || '-'}
                                    </span>
                                  </button>
                                ))
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </article>
                    );
                  })}
                  </div>
                </details>
              )}
            </article>

            )}

            {((ocioPestanaProceso === 'colocar' && ocioPanelOperativo === 'nuevo') ||
              (ocioPestanaProceso === 'cambios' && ocioPanelOperativo === 'cambios') ||
              (ocioPestanaProceso === 'semana' && ocioPanelOperativo === 'semana')) && (
              <section
                id="ocio-panel-operativo"
                style={{
                  display: 'grid',
                  gap: 14,
                  scrollMarginTop: 18,
                }}
              >
                <article style={agendaBloqueBlanco}>
                  <div style={agendaCabeceraLinea}>
                    <div>
                      <span
                        style={{
                          color: '#16a34a',
                          fontWeight: 900,
                          fontSize: 12,
                          textTransform: 'uppercase',
                        }}
                      >
                        Ocio · semana operativa
                      </span>
                      <h3 style={{ margin: '3px 0 0' }}>
                        {ocioPanelOperativo === 'cambios'
                          ? 'Cambios puntuales'
                          : ocioPanelOperativo === 'nuevo'
                          ? 'Nuevo alumno'
                          : 'Preparar semana'}
                      </h3>
                    </div>
                    {ocioPanelOperativo === 'nuevo' && (
                      <button
                        type="button"
                        onClick={() => setOcioPanelOperativo('ninguno')}
                        style={botonSecundario}
                      >
                        Cerrar
                      </button>
                    )}
                  </div>

                  {ocioPanelOperativo !== 'nuevo' && (
                  <div style={{ ...gridFormulario, marginTop: 12 }}>
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
                            {capitalizarPrimera(
                              nombreMesAgendaDesdeClave(mes)
                            )}
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
                  )}
                </article>

                {ocioPanelOperativo === 'nuevo' && (() => {
                  const turno = horarioTurnoOcio(ocioTurnoVista);
                  const turnoActual = ocioNuevoRecomendaciones.filter(
                    (opcion) =>
                      opcion.esTurnoActual &&
                      opcion.estado !== 'NO_ENCAJA'
                  );
                  const recomendadoActual = turnoActual.filter(
                    (opcion) => opcion.estado === 'RECOMENDADO'
                  );
                  const revisarActual = turnoActual.filter(
                    (opcion) => opcion.estado === 'REVISAR'
                  );

                  const alternativas = ocioNuevoRecomendaciones
                    .filter(
                      (opcion) =>
                        !opcion.esTurnoActual &&
                        opcion.estado !== 'NO_ENCAJA' &&
                        esTurnoOficialOcio(opcion.grupo)
                    )
                    .sort((a, b) => {
                      if (a.estado !== b.estado) {
                        return a.estado === 'RECOMENDADO' ? -1 : 1;
                      }
                      return b.score - a.score;
                    })
                    .slice(0, 6);

                  return (
                    <article style={agendaBloqueBlanco}>
                      <div>
                        <span
                          style={{
                            color: '#16a34a',
                            fontWeight: 900,
                            fontSize: 12,
                            textTransform: 'uppercase',
                          }}
                        >
                          Turno solicitado
                        </span>
                        <h3 style={{ margin: '3px 0 0' }}>
                          {ocioTurnoVista} · {turno.inicio}–{turno.fin}
                        </h3>
                      </div>

                      <div
                        style={{
                          ...gridFormulario,
                          marginTop: 14,
                          alignItems: 'end',
                        }}
                      >
                        <label style={{ ...labelCampo, position: 'relative' }}>
                          Nombre y apellidos
                          <input
                            value={ocioNuevoNombre}
                            onChange={(e) =>
                              buscarFichaNuevoOcio(e.target.value)
                            }
                            placeholder="Empieza a escribir el nombre..."
                            autoComplete="off"
                          />

                          {ocioNuevoSugerencias.length > 0 && (
                            <div
                              style={{
                                position: 'absolute',
                                zIndex: 20,
                                left: 0,
                                right: 0,
                                top: '100%',
                                marginTop: 4,
                                background: '#ffffff',
                                border: '1px solid #cbd5e1',
                                borderRadius: 12,
                                boxShadow:
                                  '0 14px 30px rgba(15,23,42,0.14)',
                                overflow: 'hidden',
                              }}
                            >
                              {ocioNuevoSugerencias.map((alumno) => (
                                <button
                                  type="button"
                                  key={`ocio-sugerencia-${alumno.alumno_id}`}
                                  onClick={() =>
                                    seleccionarFichaNuevoOcio(alumno)
                                  }
                                  style={{
                                    width: '100%',
                                    border: 0,
                                    borderBottom: '1px solid #e2e8f0',
                                    background: '#ffffff',
                                    padding: '10px 12px',
                                    textAlign: 'left',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <strong>{alumno.alumno}</strong>
                                  <span
                                    style={{
                                      marginLeft: 8,
                                      color: '#64748b',
                                    }}
                                  >
                                    {alumno.nivel_actual ||
                                      alumno.ultimo_nivel_reportado ||
                                      alumno.nivel_estimado ||
                                      'Sin nivel'}
                                  </span>
                                </button>
                              ))}
                            </div>
                          )}
                        </label>

                        <label style={labelCampo}>
                          Nivel
                          <select
                            value={ocioNuevoNivel}
                            onChange={(e) => {
                              setOcioNuevoNivel(e.target.value);
                              setOcioNuevoRecomendaciones([]);
                            }}
                          >
                            <option value="">
                              Automático / INICIACIÓN si es nuevo
                            </option>
                            {opcionesNivel.map((nivel) => (
                              <option key={`ocio-nuevo-${nivel}`} value={nivel}>
                                {nivel}
                              </option>
                            ))}
                          </select>
                        </label>
                      </div>

                      <button
                        type="button"
                        onClick={analizarNuevoAlumnoOcio}
                        disabled={ocioNuevoAnalizando}
                        style={{ ...botonPrincipal, marginTop: 12 }}
                      >
                        {ocioNuevoAnalizando
                          ? 'Analizando…'
                          : 'Analizar encaje'}
                      </button>

                      {ocioNuevoRecomendaciones.length > 0 && (
                        <div style={{ display: 'grid', gap: 12, marginTop: 14 }}>
                          {recomendadoActual.length > 0 && (
                            <div>
                              <strong
                                style={{
                                  display: 'block',
                                  marginBottom: 8,
                                  color: '#166534',
                                }}
                              >
                                Encaja en el turno solicitado
                              </strong>
                              <div style={{ display: 'grid', gap: 8 }}>
                                {recomendadoActual.map((opcion) => (
                                  <article
                                    key={`ocio-rec-actual-${opcion.grupo.grupo_id}`}
                                    style={{
                                      ...avisoCompleto,
                                      background: '#f0fdf4',
                                      borderColor: '#86efac',
                                    }}
                                  >
                                    <div style={agendaCabeceraLinea}>
                                      <div>
                                        <strong>
                                          {opcion.grupo.nombre_grupo} · Nivel{' '}
                                          {opcion.grupo.nivel_grupo || '-'}
                                        </strong>
                                        <div style={{ marginTop: 4 }}>
                                          {opcion.grupo.pista || '-'} · Punto{' '}
                                          {opcion.grupo.punto_encuentro || '-'} ·{' '}
                                          {opcion.totalActual} →{' '}
                                          {opcion.totalFinal} niños
                                        </div>
                                        <div
                                          style={{
                                            color: '#475569',
                                            marginTop: 4,
                                          }}
                                        >
                                          {opcion.motivo}
                                        </div>
                                      </div>
                                    </div>
                                    <button
                                      type="button"
                                      disabled={
                                        ocioNuevoGuardandoGrupoId ===
                                        opcion.grupo.grupo_id
                                      }
                                      onClick={() =>
                                        incorporarNuevoAlumnoOcio(opcion, () => setOcioPanelOperativo('ninguno'))
                                      }
                                      style={{
                                        ...botonPrincipal,
                                        width: '100%',
                                        marginTop: 9,
                                      }}
                                    >
                                      {ocioNuevoGuardandoGrupoId ===
                                      opcion.grupo.grupo_id
                                        ? 'Añadiendo…'
                                        : 'Añadir al grupo estable'}
                                    </button>
                                  </article>
                                ))}
                              </div>
                            </div>
                          )}

                          {revisarActual.length > 0 && (
                            <div>
                              <strong
                                style={{
                                  display: 'block',
                                  marginBottom: 8,
                                  color: '#9a3412',
                                }}
                              >
                                Este turno requiere revisión
                              </strong>
                              <div style={{ display: 'grid', gap: 8 }}>
                                {revisarActual.map((opcion) => (
                                  <article
                                    key={`ocio-rec-revisar-${opcion.grupo.grupo_id}`}
                                    style={{
                                      ...avisoNeutral,
                                      borderColor: '#fdba74',
                                      background: '#fff7ed',
                                    }}
                                  >
                                    <strong>
                                      {opcion.grupo.nombre_grupo} · Nivel{' '}
                                      {opcion.grupo.nivel_grupo || '-'}
                                    </strong>
                                    <div style={{ marginTop: 4 }}>
                                      {opcion.totalActual} → {opcion.totalFinal}{' '}
                                      niños · {opcion.motivo}
                                    </div>
                                    <button
                                      type="button"
                                      disabled={
                                        ocioNuevoGuardandoGrupoId ===
                                        opcion.grupo.grupo_id
                                      }
                                      onClick={() =>
                                        incorporarNuevoAlumnoOcio(opcion, () => setOcioPanelOperativo('ninguno'))
                                      }
                                      style={{
                                        ...botonSecundario,
                                        width: '100%',
                                        marginTop: 9,
                                        color: '#9a3412',
                                        borderColor: '#fdba74',
                                      }}
                                    >
                                      Añadir con revisión manual
                                    </button>
                                  </article>
                                ))}
                              </div>
                            </div>
                          )}

                          {recomendadoActual.length === 0 &&
                            revisarActual.length === 0 && (
                              <div
                                style={{
                                  ...avisoNeutral,
                                  borderColor: '#fecaca',
                                  background: '#fff7f7',
                                  color: '#991b1b',
                                }}
                              >
                                <strong>Sin grupo compatible en este turno.</strong>
                                <div style={{ marginTop: 4 }}>
                                  Mantengo intacto el recomendador actual. Si
                                  este nivel necesita otro grupo, créalo aquí.
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    abrirNuevoGrupoOcioParaTurno(
                                      ocioNuevoNivel,
                                      ocioNuevoAlumnoId
                                    )
                                  }
                                  style={{ ...botonPrincipal, marginTop: 9 }}
                                >
                                  Crear grupo estable para este turno
                                </button>
                              </div>
                            )}

                          {alternativas.length > 0 && (
                            <div>
                              <strong
                                style={{
                                  display: 'block',
                                  marginBottom: 8,
                                }}
                              >
                                Opciones en otros días de Ocio
                              </strong>
                              <div style={{ display: 'grid', gap: 8 }}>
                                {alternativas.map((opcion) => {
                                  const recomendado =
                                    opcion.estado === 'RECOMENDADO';

                                  return (
                                    <article
                                      key={`ocio-rec-alt-${opcion.grupo.grupo_id}`}
                                      style={{
                                        ...(recomendado
                                          ? avisoCompleto
                                          : avisoNeutral),
                                        background: recomendado
                                          ? '#f0fdf4'
                                          : '#fff7ed',
                                        borderColor: recomendado
                                          ? '#86efac'
                                          : '#fdba74',
                                      }}
                                    >
                                      <div style={agendaCabeceraLinea}>
                                        <div>
                                          <strong>
                                            {opcion.grupo.dia_semana} ·{' '}
                                            {horaCorta(
                                              opcion.grupo.hora_inicio
                                            )}–
                                            {horaCorta(
                                              opcion.grupo.hora_fin
                                            )}
                                          </strong>
                                          <div style={{ marginTop: 4 }}>
                                            {opcion.grupo.nombre_grupo} · Nivel{' '}
                                            {opcion.grupo.nivel_grupo || '-'} ·{' '}
                                            {opcion.totalActual} →{' '}
                                            {opcion.totalFinal} niños
                                          </div>
                                          <div
                                            style={{
                                              color: '#475569',
                                              marginTop: 4,
                                            }}
                                          >
                                            {opcion.motivo}
                                          </div>
                                        </div>

                                        <strong
                                          style={{
                                            color: recomendado
                                              ? '#166534'
                                              : '#9a3412',
                                            fontSize: 12,
                                          }}
                                        >
                                          {recomendado
                                            ? 'RECOMENDADO'
                                            : 'REVISAR'}
                                        </strong>
                                      </div>

                                      <button
                                        type="button"
                                        disabled={
                                          ocioNuevoGuardandoGrupoId ===
                                          opcion.grupo.grupo_id
                                        }
                                        onClick={() =>
                                          incorporarNuevoAlumnoOcio(opcion, () => setOcioPanelOperativo('ninguno'))
                                        }
                                        style={{
                                          ...(recomendado
                                            ? botonPrincipal
                                            : botonSecundario),
                                          width: '100%',
                                          marginTop: 9,
                                        }}
                                      >
                                        {ocioNuevoGuardandoGrupoId ===
                                        opcion.grupo.grupo_id
                                          ? 'Añadiendo…'
                                          : recomendado
                                          ? 'Padres OK · añadir a este turno'
                                          : 'Padres OK · añadir con revisión'}
                                      </button>
                                    </article>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {alternativas.length === 0 &&
                            recomendadoActual.length === 0 &&
                            revisarActual.length === 0 && (
                              <div
                                style={{
                                  ...avisoNeutral,
                                  borderColor: '#fecaca',
                                  background: '#fff7f7',
                                  color: '#991b1b',
                                }}
                              >
                                Tampoco hay un grupo compatible en los otros
                                turnos de Ocio.
                              </div>
                            )}
                        </div>
                      )}
                    </article>
                  );
                })()}

                {ocioPanelOperativo === 'cambios' && (
                  <>
                    <article style={agendaBloqueBlanco}>
                      <div style={agendaCabeceraLinea}>
                        <div>
                          <strong style={{ fontSize: 17 }}>
                            Actualizar AimHarder · quién viene esta semana
                          </strong>
                          <div style={{ marginTop: 4, color: '#64748b' }}>
                            Compara las reservas reales con tus grupos estables. Solo necesitas actuar cuando haya una diferencia.
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={actualizarSemanaOcioDesdeAimHarder}
                          disabled={ocioAimHarderCargando}
                          style={botonPrincipal}
                        >
                          {ocioAimHarderCargando
                            ? 'Consultando AimHarder…'
                            : 'Actualizar AimHarder'}
                        </button>
                      </div>

                      {ocioAimHarderError && (
                        <div style={{ ...errorCaja, marginTop: 12 }}>
                          {ocioAimHarderError}
                        </div>
                      )}

                      {ocioAimHarderMensaje && !ocioAimHarderError && (
                        <div style={{ ...avisoCompleto, marginTop: 12 }}>
                          {ocioAimHarderMensaje}
                        </div>
                      )}

                      {ocioAimHarderSemana && (
                        <div style={{ display: 'grid', gap: 10, marginTop: 12 }}>
                          {ocioAimHarderSemana.turnos
                            .filter(
                              (turno) =>
                                diaFijoOcioDesdeFecha(turno.fecha) ===
                                ocioTurnoVista
                            )
                            .map((turno) => {
                              return (
                                <div
                                  key={`aim-ocio-${turno.fecha}-${turno.horaInicio}-${turno.horaFin}`}
                                  style={miniTarjetaBlanca}
                                >
                                  <div style={agendaCabeceraLinea}>
                                    <div>
                                      <strong>
                                        {formatearFecha(turno.fecha)} ·{' '}
                                        {turno.horaInicio}-{turno.horaFin}
                                      </strong>
                                      <div
                                        style={{
                                          marginTop: 3,
                                          color: '#64748b',
                                        }}
                                      >
                                        {turno.claseNombre || 'Ocio'} ·{' '}
                                        {turno.asistentes.length} reservado(s)
                                      </div>
                                    </div>
                                  </div>

                                  {turno.asistentes.length === 0 ? (
                                    <div
                                      style={{
                                        ...agendaVacioMini,
                                        marginTop: 8,
                                      }}
                                    >
                                      Sin reservas en AimHarder.
                                    </div>
                                  ) : (
                                    <div
                                      style={{
                                        display: 'grid',
                                        gap: 7,
                                        marginTop: 10,
                                      }}
                                    >
                                      {turno.asistentes.map((asistente) => {
                                        const clave =
                                          normalizarNombreFueraPlazoAgenda(
                                            asistente.nombre || ''
                                          );
                                        const estadoDetectado =
                                          ocioAimHarderEstadoAlumnos[clave] || null;
                                        const existe =
                                          estadoDetectado?.resultado === 'EXISTENTE';
                                        const alumnoOcio = ocioAlumnos.find(
                                          (alumno) =>
                                            normalizarNombreFueraPlazoAgenda(
                                              alumno.alumno || ''
                                            ) === clave
                                        );
                                        const estadoAlumno =
                                          classifyOcioAimHarderStudent(
                                            existe,
                                            alumnoOcio
                                          );

                                        return (
                                          <div
                                            key={`aim-ocio-asistente-${turno.claseId}-${clave}`}
                                            style={filaAlumnoAsistencia}
                                          >
                                            <div>
                                              <strong>
                                                {asistente.nombre}
                                              </strong>
                                              <div
                                                style={{
                                                  marginTop: 3,
                                                  color: existe
                                                    ? '#166534'
                                                    : '#b45309',
                                                  fontWeight: 800,
                                                  fontSize: 12,
                                                }}
                                              >
                                                {estadoAlumno === 'PENDING_GROUP'
                                                  ? 'PENDIENTE DE COLOCAR'
                                                  : estadoAlumno === 'STABLE'
                                                  ? 'CONOCIDO · grupo estable conservado'
                                                  : 'NUEVO · pendiente Alta / Test'}
                                              </div>
                                            </div>

                                            {!existe && (
                                              <button
                                                type="button"
                                                onClick={() =>
                                                  abrirAltaTestDesdeOcioAimHarder(
                                                    asistente,
                                                    turno
                                                  )
                                                }
                                                style={botonPrincipal}
                                              >
                                                Crear Alta / Test
                                              </button>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  )}
                                </div>
                              );
                            })}

                          {ocioAimHarderSemana.turnos.filter(
                            (turno) =>
                              diaFijoOcioDesdeFecha(turno.fecha) ===
                              ocioTurnoVista
                          ).length === 0 && (
                            <div style={agendaVacioMini}>
                              AimHarder no ha devuelto ningún turno Ocio para{' '}
                              {ocioTurnoVista}.
                            </div>
                          )}
                        </div>
                      )}
                    </article>


                    <article style={agendaBloqueBlanco}>
                      <div style={agendaCabeceraLinea}>
                        <div>
                          <h3 style={{ margin: 0 }}>Cambios de esta semana</h3>
                          <p style={{ margin: '5px 0 0', color: '#64748b' }}>
                            Cambios puntuales sin modificar el grupo estable.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => abrirFormularioCambioOcio()}
                          style={botonPrincipal}
                        >
                          + Cambio puntual
                        </button>
                      </div>

                      {mostrarFormularioOcioCambio && (
                        <div
                          style={{
                            ...avisoNeutral,
                            marginTop: 12,
                            padding: 12,
                          }}
                        >
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
                                  .sort((a, b) =>
                                    a.alumno.localeCompare(b.alumno)
                                  )
                                  .map((alumno) => (
                                    <option
                                      key={`cambio-int-${alumno.alumno_id}`}
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
                                    <option
                                      key={`cambio-dia-int-${dia}`}
                                      value={dia}
                                    >
                                      {dia} · {horarioTurnoOcio(dia).inicio}-
                                      {horarioTurnoOcio(dia).fin}
                                    </option>
                                  ))}
                              </select>
                            </label>

                            <label style={labelCampo}>
                              Nota interna
                              <textarea
                                value={ocioCambioForm.motivo}
                                onChange={(e) =>
                                  setOcioCambioForm({
                                    ...ocioCambioForm,
                                    motivo: e.target.value,
                                  })
                                }
                                rows={2}
                                placeholder="Ej.: viene sábado en vez de domingo"
                              />
                            </label>
                          </div>

                          <OcioRelocationRecommender ctx={ctx} />

                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              marginTop: 10,
                              flexWrap: 'wrap',
                            }}
                          >
                            <button
                              type="button"
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
                              type="button"
                              onClick={limpiarFormularioCambioOcio}
                              style={botonSecundario}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {cambiosOcioSemana.length === 0 ? (
                        <div style={{ ...agendaVacio, marginTop: 12 }}>
                          No hay cambios puntuales esta semana.
                        </div>
                      ) : (
                        <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                          {cambiosOcioSemana.map((cambio) => {
                            const cambiaGrupo =
                              cambio.grupo_origen_id !== cambio.grupo_destino_id;
                            return (
                            <div
                              key={`cambio-integrado-${cambio.reubicacion_id}`}
                              style={miniTarjetaBlanca}
                            >
                              <div style={agendaCabeceraLinea}>
                                <div>
                                  <strong>{cambio.alumno}</strong>
                                  <div
                                    style={{
                                      marginTop: 4,
                                      color: '#64748b',
                                    }}
                                  >
                                    {cambio.origen_dia_semana || 'Origen'}{' '}
                                    {horaCorta(cambio.origen_hora_inicio)}–
                                    {horaCorta(cambio.origen_hora_fin)} →{' '}
                                    {cambio.destino_dia_semana || formatearFecha(cambio.fecha)}{' '}
                                    {horaCorta(cambio.destino_hora_inicio)}–
                                    {horaCorta(cambio.destino_hora_fin)}
                                    {cambiaGrupo
                                      ? ` · ${cambio.grupo_origen || 'Sin grupo'} → ${cambio.grupo_destino || 'Destino'}`
                                      : ''}
                                  </div>
                                </div>
                                <div
                                  style={{
                                    display: 'flex',
                                    gap: 6,
                                    flexWrap: 'wrap',
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      abrirFormularioCambioOcio(cambio)
                                    }
                                    style={botonSecundario}
                                  >
                                    Modificar
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      eliminarCambioPuntualOcio(cambio)
                                    }
                                    style={botonPeligroMini}
                                  >
                                    Eliminar
                                  </button>
                                </div>
                              </div>
                            </div>
                            );
                          })}
                        </div>
                      )}
                    </article>
                  </>
                )}

                {ocioPanelOperativo === 'semana' && (
                  <>
                    <OcioWeekPreparationPanel ctx={ctx} />
                    {false && (
                    <>
                    <article
                      style={{
                        ...agendaBloqueBlanco,
                        border: '1px solid #bfdbfe',
                        background: '#eff6ff',
                      }}
                    >
                      <strong style={{ fontSize: 16 }}>4 · Preparar semana</strong>
                      <p style={{ margin: '6px 0 0', color: '#475569', lineHeight: 1.45 }}>
                        Aquí conviertes los grupos estables y los cambios semanales en grupos reales.
                        La asignación de entrenador, punto de encuentro y publicación se hace después
                        exactamente igual que Baby desde Entrenamientos → Días de entrenamiento.
                      </p>
                    </article>

                    {(() => {
                      const gruposDiaResumen =
                        gruposOcioDiaSemana(ocioTurnoVista);
                      const alumnosDiaResumen = new Set(
                        gruposDiaResumen.flatMap((grupo) =>
                          alumnosGrupoOcioEstable(grupo.grupo_id).map(
                            (alumno) => alumno.alumno_id
                          )
                        )
                      ).size;
                      const vienenDiaResumen = new Set(
                        gruposDiaResumen.flatMap((grupo) =>
                          alumnosGrupoOcioEstable(grupo.grupo_id)
                            .filter((alumno) =>
                              alumnoVieneOcioSemana(alumno.alumno_id)
                            )
                            .map((alumno) => alumno.alumno_id)
                        )
                      ).size;

                      return (
                        <article style={agendaBloqueBlanco}>
                          <div style={gridMiniMetricas}>
                            <div
                              style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 12,
                                padding: '12px 14px',
                                background: '#f8fafc',
                                display: 'grid',
                                gap: 3,
                              }}
                            >
                              <strong>{gruposDiaResumen.length}</strong>
                              <span>grupos estables</span>
                            </div>
                            <div
                              style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 12,
                                padding: '12px 14px',
                                background: '#f8fafc',
                                display: 'grid',
                                gap: 3,
                              }}
                            >
                              <strong>{alumnosDiaResumen}</strong>
                              <span>alumnos del día</span>
                            </div>
                            <div
                              style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 12,
                                padding: '12px 14px',
                                background: '#f8fafc',
                                display: 'grid',
                                gap: 3,
                              }}
                            >
                              <strong>{vienenDiaResumen}</strong>
                              <span>vienen esta semana</span>
                            </div>
                          </div>
                        </article>
                      );
                    })()}

                    <div style={{ display: 'grid', gap: 12 }}>
                      {gruposOcioDiaSemana(ocioTurnoVista).map((grupo) => {
                        const fecha = fechaGrupoOcioSemana(grupo);
                        const alumnosGrupo =
                          alumnosGrupoOcioEstable(grupo.grupo_id);
                        const presentes = alumnosGrupo.filter((alumno) =>
                          alumnoVieneOcioSemana(alumno.alumno_id)
                        );
                        return (
                          <article
                            key={`ocio-prep-integrado-${grupo.grupo_id}`}
                            style={tarjeta}
                          >
                            <div style={agendaCabeceraLinea}>
                              <div>
                                <strong style={{ fontSize: 17 }}>
                                  {nombreGrupoSemanalOcio(grupo)}
                                </strong>
                                <div
                                  style={{
                                    marginTop: 5,
                                    color: '#64748b',
                                  }}
                                >
                                  {capitalizarPrimera(grupo.dia_semana)} ·{' '}
                                  {formatearFecha(fecha)} ·{' '}
                                  {horaCorta(grupo.hora_inicio)}-
                                  {horaCorta(grupo.hora_fin)}
                                </div>
                                <div
                                  style={{
                                    marginTop: 4,
                                    color: '#64748b',
                                  }}
                                >
                                  {presentes.length}/{alumnosGrupo.length}{' '}
                                  vienen
                                </div>
                              </div>

                            </div>

                            <div
                              style={{
                                display: 'grid',
                                gap: 7,
                                marginTop: 12,
                              }}
                            >
                              {alumnosGrupo.map((alumno) => {
                                const viene = alumnoVieneOcioSemana(
                                  alumno.alumno_id
                                );
                                return (
                                  <div
                                    key={`prep-int-${grupo.grupo_id}-${alumno.alumno_id}`}
                                    style={filaAlumnoAsistencia}
                                  >
                                    <div>
                                      <strong>{alumno.alumno}</strong>
                                      <div
                                        style={{
                                          marginTop: 3,
                                          color: '#64748b',
                                          fontSize: 13,
                                        }}
                                      >
                                        Nivel {alumno.nivel_usado || '-'}
                                        {alumno.fecha_nacimiento
                                          ? ` · ${
                                              edadOcioAlumnoEnFecha(
                                                alumno,
                                                fecha
                                              ) || '-'
                                            } años`
                                          : ''}
                                      </div>
                                    </div>
                                    <div
                                      style={{
                                        display: 'flex',
                                        gap: 6,
                                        flexWrap: 'wrap',
                                      }}
                                    >
                                      <button
                                        type="button"
                                        onClick={() =>
                                          cambiarAsistenciaOcioSemana(
                                            alumno.alumno_id,
                                            true
                                          )
                                        }
                                        style={
                                          viene
                                            ? botonAsistenciaOk
                                            : botonAsistenciaOff
                                        }
                                      >
                                        Viene
                                      </button>
                                      <button
                                        type="button"
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

                    <article
                      style={{
                        ...agendaBloqueBlanco,
                        border: '1px solid #bfdbfe',
                        background: '#f8fbff',
                      }}
                    >
                      <div style={agendaCabeceraLinea}>
                        <div>
                          <strong style={{ fontSize: 17 }}>
                            ¿Todo revisado?
                          </strong>
                          <p
                            style={{
                              margin: '5px 0 0',
                              color: '#64748b',
                            }}
                          >
                            Cuando hayas comprobado la asistencia de todos
                            los grupos de {ocioTurnoVista}, prepara ese día.
                            Si ya estaba preparado, sustituirá la versión
                            anterior de ese mismo día y turno.
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            prepararDiaOcioSemana(ocioTurnoVista)
                          }
                          style={botonPrincipal}
                        >
                          {ocioSemanaResultados.some((resultado) =>
                            resultadoPerteneceDiaOcio(
                              resultado,
                              ocioTurnoVista
                            )
                          )
                            ? `Actualizar ${ocioTurnoVista}`
                            : `Preparar ${ocioTurnoVista}`}
                        </button>
                      </div>
                    </article>

                    {ocioSemanaResultados.some((resultado) =>
                      resultadoPerteneceDiaOcio(
                        resultado,
                        ocioTurnoVista
                      )
                    ) && (
                      <article
                        id="ocio-grupos-preparados-semana"
                        style={{ ...agendaBloqueBlanco, scrollMarginTop: 18 }}
                      >
                        <h3 style={{ marginTop: 0 }}>
                          Grupos preparados · {ocioTurnoVista} ·{' '}
                          {
                            ocioSemanaResultados.filter((resultado) =>
                              resultadoPerteneceDiaOcio(
                                resultado,
                                ocioTurnoVista
                              )
                            ).length
                          }
                        </h3>
                        <div style={{ display: 'grid', gap: 10 }}>
                          {ocioSemanaResultados
                            .filter((resultado) =>
                              resultadoPerteneceDiaOcio(
                                resultado,
                                ocioTurnoVista
                              )
                            )
                            .map((resultado, indice) => {
                            const publicado =
                              resultado.publicado === true ||
                              /publicad/i.test(resultado.estado || '');

                            return (
                              <div
                                key={`${resultado.grupo_estable}-${resultado.fecha}-${indice}`}
                                style={{
                                  ...avisoCompleto,
                                  background: '#ffffff',
                                  borderColor: publicado
                                    ? '#86efac'
                                    : '#cbd5e1',
                                }}
                              >
                                <div style={agendaCabeceraLinea}>
                                  <div>
                                    <strong style={{ fontSize: 16 }}>
                                      {resultado.grupo_estable}
                                    </strong>
                                    <div
                                      style={{
                                        marginTop: 4,
                                        color: '#475569',
                                      }}
                                    >
                                      {formatearFecha(resultado.fecha)} ·{' '}
                                      {horaCorta(resultado.hora_inicio)}–
                                      {horaCorta(resultado.hora_fin)} ·{' '}
                                      {resultado.alumnos} alumnos
                                    </div>
                                    <div
                                      style={{
                                        marginTop: 3,
                                        color: '#64748b',
                                      }}
                                    >
                                      Entrenador:{' '}
                                      {resultado.entrenador ||
                                        'Pendiente de asignar'}
                                    </div>
                                    <div
                                      style={{
                                        marginTop: 3,
                                        fontWeight: 800,
                                        color: publicado
                                          ? '#166534'
                                          : '#475569',
                                      }}
                                    >
                                      {publicado
                                        ? 'Publicado en Vista entrenador'
                                        : 'Preparado · terminar en Días de entrenamiento'}
                                    </div>
                                  </div>

                                  <div
                                    style={{
                                      display: 'flex',
                                      gap: 7,
                                      flexWrap: 'wrap',
                                      justifyContent: 'flex-end',
                                    }}
                                  >
                                    <button
                                      type="button"
                                      onClick={() =>
                                        abrirGrupoOcioEnTrabajoSemanal(
                                          resultado
                                        )
                                      }
                                      style={botonSecundario}
                                    >
                                      Abrir en Días de entrenamiento
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() =>
                                        void deshacerPreparacionOcio(resultado)
                                      }
                                      style={botonPeligro}
                                    >
                                      {publicado
                                        ? 'Rehacer turno'
                                        : 'Deshacer preparación'}
                                    </button>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                      </article>
                    )}
                    </>
                    )}
                  </>
                )}
              </section>
            )}
          </section>
        );
      })()}

    </>
  );
}
