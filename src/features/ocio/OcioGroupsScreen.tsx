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

type OcioTab = 'grupos' | 'cambios' | 'semana';

export function OcioGroupsScreen({ ctx }: OcioGroupsScreenProps) {
  const [ocioPestanaProceso, setOcioPestanaProceso] =
    useState<OcioTab>('grupos');

  const {
    abrirAltaTestDesdeOcioAimHarder,
    abrirFormularioCambioOcio,
    abrirNuevoGrupoOcio,
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
    alumnosTurnoOcio,
    asignarAlumnoGrupoOcio,
    avisoCompleto,
    avisoEvolucionAlumnoOcio,
    avisoNeutral,
    avisoPendiente,
    botonPeligroMini,
    botonPrincipal,
    botonSecundario,
    cambiosOcioSemana,
    capitalizarPrimera,
    cargarAgendaOperativaDirecta,
    cargarOcioCambios,
    cambiarPistaPropuestaOcio,
    crearGrupoVacioPropuestaOcio,
    crearGruposEstablesDesdePropuestaOcio,
    diaFijoOcioDesdeFecha,
    edadAproximadaOcio,
    editarGrupoOcio,
    eliminarCambioPuntualOcio,
    eliminarGrupoOcio,
    eliminarGrupoVacioPropuestaOcio,
    errorCaja,
    esVistaMovilApp,
    estiloGrupoPorPistaApp,
    estiloValidacionPedagogicaApp,
    explicacionCompactaPropuestaOcioApp,
    fechaCambioOcioPorDia,
    filaAlumnoAsistencia,
    formatearFecha,
    generarPropuestaGruposOcio,
    gridFormulario,
    guardarCambioPuntualOcio,
    guardarGrupoOcio,
    horaCorta,
    horarioTurnoOcio,
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
    ocioPropuestaGrupos,
    ocioTurnoVista,
    opcionesNivel,
    opcionesPista,
    opcionesTemporadaAgenda,
    pantalla,
    rangoSemanaAgenda,
    renderAyudaRapidaPantallaApp,
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
    setOcioPropuestaGrupos,
    setOcioTurnoVista,
    setSemanaAgendaInicio,
    tarjetaResaltada,
    textoSinAcentosGrupoApp,
    anioInicioTemporadaAgenda,
  } = ctx;

  if (pantalla !== 'ocioGrupos') return null;

  const configuracionTurnos = {
    Jueves: { hora: '18:00–20:00', etiqueta: 'Jueves' },
    Sábado: { hora: '09:45–11:45', etiqueta: 'Sábado' },
    Domingo: { hora: '12:00–14:00', etiqueta: 'Domingo' },
  } as const;

  const gruposActivos = (ocioGrupos as OcioGrupoApp[])
    .filter((grupo) => Boolean(grupo.activo))
    .slice()
    .sort((a, b) => {
      const mismoDiaA =
        textoSinAcentosGrupoApp(a.dia_semana || '') ===
        textoSinAcentosGrupoApp(ocioTurnoVista);
      const mismoDiaB =
        textoSinAcentosGrupoApp(b.dia_semana || '') ===
        textoSinAcentosGrupoApp(ocioTurnoVista);
      if (mismoDiaA !== mismoDiaB) return mismoDiaA ? -1 : 1;
      return String(a.nombre_grupo || '').localeCompare(
        String(b.nombre_grupo || ''),
        'es'
      );
    });

  const gruposTurno = gruposActivos.filter(
    (grupo) =>
      textoSinAcentosGrupoApp(grupo.dia_semana || '') ===
      textoSinAcentosGrupoApp(ocioTurnoVista)
  );

  const alumnosDelTurno = (alumnosTurnoOcio(ocioTurnoVista) as OcioAlumnoApp[])
    .slice()
    .sort((a, b) => (a.alumno || '').localeCompare(b.alumno || '', 'es'));

  const alumnosSinGrupoTurno = alumnosDelTurno.filter(
    (alumno) => !alumno.grupo_id
  );

  const alumnosPorGrupo = new Map<string, OcioAlumnoApp[]>();
  (ocioAlumnos as OcioAlumnoApp[]).forEach((alumno) => {
    if (!alumno.grupo_id) return;
    const actuales = alumnosPorGrupo.get(alumno.grupo_id) || [];
    actuales.push(alumno);
    alumnosPorGrupo.set(alumno.grupo_id, actuales);
  });
  alumnosPorGrupo.forEach((lista) =>
    lista.sort((a, b) => (a.alumno || '').localeCompare(b.alumno || '', 'es'))
  );

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
    const avisos = (alumnosPorGrupo.get(grupo.grupo_id) || [])
      .map((alumno) => avisoEvolucionAlumnoOcio(alumno, grupo))
      .filter(Boolean) as Array<{
      alumno: string;
      nivelActual: string;
      estadoActual: string;
      grupoSugerido: OcioGrupoApp | null;
      motivo: string;
    }>;
    if (avisos.length > 0) avisosEvolucionPorGrupo.set(grupo.grupo_id, avisos);
  });

  const estiloTurno = (activo: boolean): React.CSSProperties => ({
    border: activo
      ? '1px solid rgba(110,231,183,.95)'
      : '1px solid rgba(255,255,255,.22)',
    background: activo ? 'rgba(16,185,129,.22)' : 'rgba(255,255,255,.09)',
    color: '#ffffff',
    borderRadius: 16,
    padding: '12px 14px',
    cursor: 'pointer',
    fontWeight: 900,
    textAlign: 'left',
    boxShadow: activo ? '0 8px 22px rgba(0,0,0,.14)' : 'none',
    transition: 'all 160ms ease',
    minWidth: 0,
  });

  function etiquetaGrupoDestino(grupo: OcioGrupoApp) {
    const miembros = alumnosPorGrupo.get(grupo.grupo_id) || [];
    const rango = ocioLevelRange(miembros);
    return `${grupo.nombre_grupo} · Nivel ${rango}${
      grupo.pista ? ` · ${grupo.pista}` : ''
    }`;
  }

  function moverAlumnoPermanente(
    alumno: OcioAlumnoApp,
    grupoOrigen: OcioGrupoApp,
    grupoDestinoId: string
  ) {
    if (!grupoDestinoId || grupoDestinoId === grupoOrigen.grupo_id) return;
    const destino = gruposTurno.find(
      (grupo) => grupo.grupo_id === grupoDestinoId
    );
    if (!destino) return;

    const confirmar = window.confirm(
      `¿Mover permanentemente a ${alumno.alumno} de ${grupoOrigen.nombre_grupo} a ${destino.nombre_grupo}?\n\nEste cambio modifica su grupo estable y se mantendrá para las próximas semanas.`
    );
    if (!confirmar) return;

    void asignarAlumnoGrupoOcio(alumno.alumno_id, destino.grupo_id);
  }

  function asignarPendiente(
    alumno: OcioAlumnoApp,
    grupoDestinoId: string
  ) {
    if (!grupoDestinoId) return;
    const destino = gruposTurno.find(
      (grupo) => grupo.grupo_id === grupoDestinoId
    );
    if (!destino) return;
    const confirmar = window.confirm(
      `¿Asignar permanentemente a ${alumno.alumno} a ${destino.nombre_grupo}?`
    );
    if (!confirmar) return;
    void asignarAlumnoGrupoOcio(alumno.alumno_id, destino.grupo_id);
  }

  function abrirGrupos() {
    setOcioPestanaProceso('grupos');
    window.setTimeout(() => {
      document
        .getElementById('ocio-grupos-turno-activo')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 40);
  }

  function abrirAimHarder() {
    setOcioPestanaProceso('cambios');
    cargarOcioCambios();
  }

  function abrirPrepararSemana() {
    setOcioPestanaProceso('semana');
    cargarOcioCambios();
    cargarAgendaOperativaDirecta();
  }

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
          <p style={{ margin: '7px 0 0', color: '#cbd5e1', lineHeight: 1.45 }}>
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
                  setOcioPropuestaGrupos([]);
                  window.setTimeout(() => {
                    document
                      .getElementById('ocio-grupos-turno-activo')
                      ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }, 60);
                }}
                style={estiloTurno(activo)}
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
            <span style={{ display: 'block', color: '#cbd5e1', fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              ALUMNOS DEL TURNO
            </span>
            <strong style={{ display: 'block', marginTop: 4, fontSize: 25, lineHeight: 1, fontWeight: 950 }}>
              {alumnosDelTurno.length}
            </strong>
            <span style={{ display: 'block', marginTop: 5, color: '#d1fae5', fontSize: 12 }}>
              {ocioTurnoVista} · Abrir fichas
            </span>
          </button>

          <button
            type="button"
            onClick={abrirGrupos}
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
            <span style={{ display: 'block', color: '#cbd5e1', fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              GRUPOS ESTABLES
            </span>
            <strong style={{ display: 'block', marginTop: 4, fontSize: 25, lineHeight: 1, fontWeight: 950 }}>
              {gruposTurno.length}
            </strong>
            <span style={{ display: 'block', marginTop: 5, color: alumnosSinGrupoTurno.length ? '#fde68a' : '#d1fae5', fontSize: 12 }}>
              {alumnosSinGrupoTurno.length} pendiente(s) de colocar
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
            <span style={{ display: 'block', color: '#cbd5e1', fontWeight: 800, fontSize: 10, textTransform: 'uppercase', letterSpacing: '.06em' }}>
              EVALUACIONES
            </span>
            <strong style={{ display: 'block', marginTop: 4, fontSize: 20, lineHeight: 1.05, fontWeight: 950 }}>
              Temporada
            </strong>
            <span style={{ display: 'block', marginTop: 5, color: '#d1fae5', fontSize: 12 }}>
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
              ? 'minmax(0, 1fr)'
              : 'repeat(3, minmax(0, 1fr))',
            gap: 8,
          }}
        >
          {[
            {
              clave: 'grupos' as const,
              etiqueta: 'ESTRUCTURA',
              titulo: 'Grupos estables',
              subtitulo: `${gruposTurno.length} grupos · ${alumnosSinGrupoTurno.length} pendientes`,
              onClick: abrirGrupos,
            },
            {
              clave: 'cambios' as const,
              etiqueta: 'SEMANA REAL',
              titulo: 'AimHarder',
              subtitulo: 'Quién viene esta semana',
              onClick: abrirAimHarder,
            },
            {
              clave: 'semana' as const,
              etiqueta: 'ORGANIZACIÓN',
              titulo: 'Preparar semana',
              subtitulo: 'Composición temporal',
              onClick: abrirPrepararSemana,
            },
          ].map((pestana) => {
            const activa = ocioPestanaProceso === pestana.clave;
            return (
              <button
                key={pestana.clave}
                type="button"
                onClick={pestana.onClick}
                style={{
                  border: activa
                    ? '2px solid #16a34a'
                    : '1px solid #e2e8f0',
                  background: activa ? '#f0fdf4' : '#ffffff',
                  color: activa ? '#166534' : '#334155',
                  borderRadius: 14,
                  padding: '11px 10px',
                  cursor: 'pointer',
                  textAlign: 'left',
                  minWidth: 0,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    fontWeight: 950,
                    color: activa ? '#16a34a' : '#94a3b8',
                    letterSpacing: '.06em',
                  }}
                >
                  {pestana.etiqueta}
                </span>
                <strong style={{ display: 'block', marginTop: 3, fontSize: 14 }}>
                  {pestana.titulo}
                </strong>
                <span
                  style={{
                    display: 'block',
                    marginTop: 3,
                    fontSize: 11,
                    color: '#64748b',
                  }}
                >
                  {pestana.subtitulo}
                </span>
              </button>
            );
          })}
        </div>
      </article>

      {ocioPestanaProceso === 'grupos' && mostrarFormularioOcioGrupo && (
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
                  : 'Esta estructura es permanente y servirá de base para las semanas de Ocio.'}
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
                  setOcioGrupoForm({ ...ocioGrupoForm, nombre: e.target.value })
                }
                placeholder="Grupo B"
              />
            </label>

            <label style={labelCampo}>
              Día
              <select
                value={ocioGrupoForm.dia}
                onChange={(e) =>
                  setOcioGrupoForm({ ...ocioGrupoForm, dia: e.target.value })
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
                  setOcioGrupoForm({ ...ocioGrupoForm, horaFin: e.target.value })
                }
              />
            </label>

            <label style={labelCampo}>
              Nivel objetivo
              <select
                value={ocioGrupoForm.nivel}
                onChange={(e) =>
                  setOcioGrupoForm({ ...ocioGrupoForm, nivel: e.target.value })
                }
              >
                {opcionesNivel.map((nivel: string) => (
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
                  setOcioGrupoForm({ ...ocioGrupoForm, pista: e.target.value })
                }
              >
                {opcionesPista.map((pista: string) => (
                  <option key={pista} value={pista}>
                    {pista}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
            <button type="button" onClick={guardarGrupoOcio} style={botonPrincipal}>
              {ocioAlumnoPendienteNuevoGrupoId
                ? 'Crear grupo y asignar alumno'
                : 'Guardar grupo'}
            </button>
            <button
              type="button"
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
                ESTRUCTURA PERMANENTE · {ocioTurnoVista}
              </span>
              <h3 style={{ margin: '3px 0 0' }}>
                Grupos estables · {configuracionTurnos[ocioTurnoVista].hora}
              </h3>
              <p style={{ margin: '5px 0 0', color: '#64748b' }}>
                Los movimientos realizados aquí son permanentes.
              </p>
            </div>
            <button
              type="button"
              onClick={abrirNuevoGrupoOcio}
              style={botonPrincipal}
            >
              + Crear grupo estable
            </button>
          </div>

          <details
            style={{
              marginTop: 14,
              border: alumnosSinGrupoTurno.length
                ? '1px solid #fbbf24'
                : '1px solid #dbeafe',
              borderRadius: 14,
              background: alumnosSinGrupoTurno.length ? '#fffbeb' : '#f8fafc',
              overflow: 'hidden',
            }}
          >
            <summary
              style={{
                cursor: 'pointer',
                padding: '12px 14px',
                fontWeight: 900,
                color: alumnosSinGrupoTurno.length ? '#92400e' : '#475569',
              }}
            >
              Pendientes de colocar · {alumnosSinGrupoTurno.length}
            </summary>

            <div style={{ display: 'grid', gap: 8, padding: '0 12px 12px' }}>
              {alumnosSinGrupoTurno.length === 0 ? (
                <div style={agendaVacioMini}>
                  Todos los alumnos de este turno tienen grupo estable.
                </div>
              ) : (
                alumnosSinGrupoTurno.map((alumno) => (
                  <div
                    key={`pendiente-${alumno.alumno_id}`}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: esVistaMovilApp
                        ? 'minmax(0,1fr)'
                        : 'minmax(0,1fr) minmax(230px, 320px)',
                      gap: 10,
                      alignItems: 'center',
                      padding: '10px 0',
                      borderBottom: '1px solid #fde68a',
                    }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <strong>{alumno.alumno}</strong>
                      <div style={{ marginTop: 3, color: '#64748b', fontSize: 13 }}>
                        Nivel {alumno.nivel_usado || alumno.nivel || '-'}
                      </div>
                    </div>
                    {gruposTurno.length > 0 ? (
                      <label style={labelCampo}>
                        Colocar permanentemente en
                        <select
                          value=""
                          aria-label={`Colocar a ${alumno.alumno} en grupo estable`}
                          onChange={(e) => {
                            const valor = e.currentTarget.value;
                            e.currentTarget.value = '';
                            asignarPendiente(alumno, valor);
                          }}
                        >
                          <option value="">Seleccionar grupo…</option>
                          {gruposTurno.map((grupo) => (
                            <option key={grupo.grupo_id} value={grupo.grupo_id}>
                              {etiquetaGrupoDestino(grupo)}
                            </option>
                          ))}
                        </select>
                      </label>
                    ) : (
                      <span style={{ color: '#64748b', fontSize: 13 }}>
                        Crea un grupo estable con el botón superior para poder colocarlo.
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>
          </details>

          {gruposTurno.length === 0 ? (
            <div style={{ display: 'grid', gap: 10, marginTop: 14 }}>
              <div style={agendaVacio}>
                Aún no hay grupos estables para {ocioTurnoVista}.
              </div>
              {alumnosSinGrupoTurno.length > 0 && (
                <details
                  style={{
                    border: '1px solid #dbeafe',
                    borderRadius: 14,
                    background: '#f8fbff',
                    padding: 12,
                  }}
                >
                  <summary style={{ cursor: 'pointer', fontWeight: 900 }}>
                    Crear estructura inicial con recomendador
                  </summary>
                  <p style={{ margin: '8px 0 0', color: '#64748b' }}>
                    Opción inicial. También puedes crear los grupos manualmente con el botón superior.
                  </p>
                  <button
                    type="button"
                    onClick={generarPropuestaGruposOcio}
                    disabled={ocioGenerandoPropuesta || ocioGuardandoPropuesta}
                    style={{ ...botonSecundario, marginTop: 10 }}
                  >
                    {ocioGenerandoPropuesta
                      ? 'Calculando…'
                      : 'Recomendar grupos iniciales'}
                  </button>
                </details>
              )}
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'repeat(auto-fit, minmax(min(100%, 360px), 1fr))',
                gap: 12,
                marginTop: 14,
              }}
            >
              {gruposTurno.map((grupo) => {
                const miembrosGrupo = alumnosPorGrupo.get(grupo.grupo_id) || [];
                const avisosEvolucion =
                  avisosEvolucionPorGrupo.get(grupo.grupo_id) || [];

                return (
                  <article
                    key={grupo.grupo_id}
                    style={{
                      ...agendaGrupoResumen,
                      border: '1px solid #bbf7d0',
                      background: '#ffffff',
                      minWidth: 0,
                    }}
                  >
                    <div style={agendaGrupoLinea}>
                      <div style={{ minWidth: 0 }}>
                        <strong style={{ fontSize: 17 }}>
                          {grupo.nombre_grupo}
                        </strong>
                        <div style={{ marginTop: 5, color: '#64748b', fontSize: 14 }}>
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
                        {miembrosGrupo.length}
                      </strong>
                    </div>

                    <div style={{ display: 'grid', gap: 8, marginTop: 12 }}>
                      {miembrosGrupo.length === 0 ? (
                        <div style={agendaVacioMini}>Sin alumnos asignados.</div>
                      ) : (
                        miembrosGrupo.map((alumno) => (
                          <div
                            key={`${grupo.grupo_id}-${alumno.alumno_id}`}
                            style={{
                              ...agendaAlumnoLinea,
                              display: 'grid',
                              gridTemplateColumns: 'minmax(0,1fr)',
                              gap: 7,
                              alignItems: 'start',
                              width: '100%',
                              boxSizing: 'border-box',
                            }}
                          >
                            <div style={{ minWidth: 0 }}>
                              <strong style={{ overflowWrap: 'anywhere' }}>
                                {alumno.alumno}
                              </strong>
                              <div
                                style={{
                                  marginTop: 3,
                                  color: '#64748b',
                                  fontSize: 13,
                                }}
                              >
                                Nivel {alumno.nivel_usado || alumno.nivel || '-'}
                              </div>
                            </div>

                            <label style={{ ...labelCampo, marginTop: 1 }}>
                              Mover a
                              <select
                                value={grupo.grupo_id}
                                aria-label={`Mover permanentemente a ${alumno.alumno}`}
                                onChange={(e) =>
                                  moverAlumnoPermanente(
                                    alumno,
                                    grupo,
                                    e.currentTarget.value
                                  )
                                }
                              >
                                {gruposTurno.map((destino) => (
                                  <option
                                    key={destino.grupo_id}
                                    value={destino.grupo_id}
                                  >
                                    {etiquetaGrupoDestino(destino)}
                                  </option>
                                ))}
                              </select>
                            </label>
                          </div>
                        ))
                      )}
                    </div>

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
                          style={{ cursor: 'pointer', fontWeight: 900, color: '#9a3412' }}
                        >
                          Revisar grupo estable · {avisosEvolucion.length}
                        </summary>
                        <div style={{ display: 'grid', gap: 8, marginTop: 9 }}>
                          {avisosEvolucion.map((aviso) => (
                            <div
                              key={`${grupo.grupo_id}-${aviso.alumno}`}
                              style={{ paddingTop: 7, borderTop: '1px solid #fed7aa' }}
                            >
                              <strong>{aviso.alumno}</strong> · Nivel {aviso.nivelActual}
                              {aviso.grupoSugerido ? (
                                <div style={{ marginTop: 4, color: '#7c2d12' }}>
                                  Mejor encaje posible: {aviso.grupoSugerido.dia_semana} ·{' '}
                                  {horaCorta(aviso.grupoSugerido.hora_inicio)} ·{' '}
                                  {aviso.grupoSugerido.nombre_grupo}
                                </div>
                              ) : (
                                <div style={{ marginTop: 4, color: '#7c2d12' }}>
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
                  </article>
                );
              })}
            </div>
          )}

          {ocioPropuestaGrupos.length > 0 && gruposTurno.length === 0 && (
            <article
              id="ocio-propuesta-grupos"
              style={{
                ...tarjetaResaltada,
                scrollMarginTop: 18,
                width: '100%',
                boxSizing: 'border-box',
                marginTop: 14,
              }}
            >
              <div style={agendaCabeceraLinea}>
                <div>
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
                  marginTop: 14,
                }}
              >
                {ocioPropuestaGrupos.map((grupo: any) => {
                  const miembros = grupo.alumnoIds
                    .map((id: string) =>
                      (ocioAlumnos as OcioAlumnoApp[]).find(
                        (alumno) => alumno.alumno_id === id
                      )
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
                        boxSizing: 'border-box',
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
                          marginTop: 10,
                          marginBottom: 10,
                        }}
                      >
                        <strong>
                          {grupo.aviso ? 'REVISIÓN NECESARIA' : 'GRUPO CORRECTO'}
                        </strong>
                        {grupo.aviso && <p style={{ margin: '6px 0 0' }}>{grupo.aviso}</p>}
                      </div>

                      <div style={{ display: 'grid', gap: 7 }}>
                        {miembros.map((alumno) => {
                          const destinos = ocioPropuestaGrupos.filter(
                            (opcion: any) =>
                              opcion.propuesta_id !== grupo.propuesta_id &&
                              opcion.pista === grupo.pista
                          );
                          const edad = edadAproximadaOcio(alumno.fecha_nacimiento);
                          return (
                            <div
                              key={`${grupo.propuesta_id}-${alumno.alumno_id}`}
                              style={{
                                ...agendaAlumnoLinea,
                                display: 'grid',
                                gridTemplateColumns: esVistaMovilApp || destinos.length === 0
                                  ? 'minmax(0, 1fr)'
                                  : 'minmax(0, 1fr) minmax(170px, 210px)',
                                gap: 10,
                                alignItems: 'center',
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <strong>{alumno.alumno}</strong>
                                <p style={{ margin: '4px 0 0' }}>
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
                                      color: '#64748b',
                                      fontWeight: 700,
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
                                <label style={labelCampo}>
                                  Mover a
                                  <select
                                    value=""
                                    onChange={(e) => {
                                      moverAlumnoEntrePropuestasOcio(
                                        alumno.alumno_id,
                                        grupo.propuesta_id,
                                        e.currentTarget.value
                                      );
                                      e.currentTarget.value = '';
                                    }}
                                  >
                                    <option value="">Mantener aquí</option>
                                    {destinos.map((destino: any) => (
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
                    ocioPropuestaGrupos.some((grupo: any) => Boolean(grupo.aviso))
                  }
                  style={botonPrincipal}
                >
                  {ocioGuardandoPropuesta
                    ? 'Creando grupos…'
                    : 'Crear grupos estables'}
                </button>
              </div>
            </article>
          )}
        </article>
      )}

      {(ocioPestanaProceso === 'cambios' || ocioPestanaProceso === 'semana') && (
        <section
          id="ocio-panel-operativo"
          style={{ display: 'grid', gap: 14, scrollMarginTop: 18 }}
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
                  {ocioPestanaProceso === 'cambios'
                    ? 'AimHarder y cambios'
                    : 'Preparar semana'}
                </h3>
              </div>
            </div>

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
                  {opcionesTemporadaAgenda.map((anio: number) => (
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
                  {mesesAgenda.map((mes: string) => (
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
                  {semanasAgenda.map((semana: string) => (
                    <option key={semana} value={semana}>
                      Semana {rangoSemanaAgenda(semana)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </article>

          {ocioPestanaProceso === 'cambios' && (
            <>
              <article style={agendaBloqueBlanco}>
                <div style={agendaCabeceraLinea}>
                  <div>
                    <strong style={{ fontSize: 17 }}>
                      Actualizar AimHarder · quién viene esta semana
                    </strong>
                    <div style={{ marginTop: 4, color: '#64748b' }}>
                      Compara las reservas reales con los grupos estables. Solo actúas sobre las diferencias.
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
                        (turno: any) =>
                          diaFijoOcioDesdeFecha(turno.fecha) === ocioTurnoVista
                      )
                      .map((turno: any) => (
                        <div
                          key={`aim-ocio-${turno.fecha}-${turno.horaInicio}-${turno.horaFin}`}
                          style={miniTarjetaBlanca}
                        >
                          <div style={agendaCabeceraLinea}>
                            <div>
                              <strong>
                                {formatearFecha(turno.fecha)} · {turno.horaInicio}–
                                {turno.horaFin}
                              </strong>
                              <div style={{ marginTop: 3, color: '#64748b' }}>
                                {turno.claseNombre || 'Ocio'} · {turno.asistentes.length}{' '}
                                reservado(s)
                              </div>
                            </div>
                          </div>

                          {turno.asistentes.length === 0 ? (
                            <div style={{ ...agendaVacioMini, marginTop: 8 }}>
                              Sin reservas en AimHarder.
                            </div>
                          ) : (
                            <div style={{ display: 'grid', gap: 7, marginTop: 10 }}>
                              {turno.asistentes.map((asistente: any) => {
                                const clave = normalizarNombreFueraPlazoAgenda(
                                  asistente.nombre || ''
                                );
                                const estadoDetectado =
                                  ocioAimHarderEstadoAlumnos[clave] || null;
                                const existe =
                                  estadoDetectado?.resultado === 'EXISTENTE';
                                const alumnoOcio = (ocioAlumnos as OcioAlumnoApp[]).find(
                                  (alumno) =>
                                    normalizarNombreFueraPlazoAgenda(
                                      alumno.alumno || ''
                                    ) === clave
                                );
                                const estadoAlumno = classifyOcioAimHarderStudent(
                                  existe,
                                  alumnoOcio
                                );

                                return (
                                  <div
                                    key={`aim-ocio-asistente-${turno.claseId}-${clave}`}
                                    style={filaAlumnoAsistencia}
                                  >
                                    <div>
                                      <strong>{asistente.nombre}</strong>
                                      <div
                                        style={{
                                          marginTop: 3,
                                          color:
                                            estadoAlumno === 'STABLE'
                                              ? '#166534'
                                              : estadoAlumno === 'OTHER_MODALITY'
                                              ? '#92400e'
                                              : '#b45309',
                                          fontWeight: 800,
                                          fontSize: 12,
                                        }}
                                      >
                                        {estadoAlumno === 'PENDING_GROUP'
                                          ? 'PENDIENTE DE COLOCAR'
                                          : estadoAlumno === 'STABLE'
                                          ? 'CONOCIDO · grupo estable conservado'
                                          : estadoAlumno === 'OTHER_MODALITY'
                                          ? 'EXISTE FUERA DE OCIO · revisar modalidad'
                                          : 'NUEVO · pendiente Alta / Test'}
                                      </div>
                                    </div>

                                    {estadoAlumno === 'NEW' && (
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

                                    {estadoAlumno === 'PENDING_GROUP' && (
                                      <button
                                        type="button"
                                        onClick={abrirGrupos}
                                        style={botonSecundario}
                                      >
                                        Colocar en grupo estable
                                      </button>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      ))}

                    {ocioAimHarderSemana.turnos.filter(
                      (turno: any) =>
                        diaFijoOcioDesdeFecha(turno.fecha) === ocioTurnoVista
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
                    style={{ ...avisoNeutral, marginTop: 12, padding: 12 }}
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
                          {(ocioAlumnos as OcioAlumnoApp[])
                            .slice()
                            .sort((a, b) => a.alumno.localeCompare(b.alumno, 'es'))
                            .map((alumno) => (
                              <option
                                key={`cambio-${alumno.alumno_id}`}
                                value={alumno.alumno_id}
                              >
                                {alumno.alumno} · {alumno.grupo_estable || 'Sin grupo'}
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
                              <option key={dia} value={dia}>
                                {dia} · {horarioTurnoOcio(dia).inicio}–
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
                    {cambiosOcioSemana.map((cambio: any) => {
                      const cambiaGrupo =
                        cambio.grupo_origen_id !== cambio.grupo_destino_id;
                      return (
                        <div
                          key={`cambio-${cambio.reubicacion_id}`}
                          style={miniTarjetaBlanca}
                        >
                          <div style={agendaCabeceraLinea}>
                            <div>
                              <strong>{cambio.alumno}</strong>
                              <div style={{ marginTop: 4, color: '#64748b' }}>
                                {cambio.origen_dia_semana || 'Origen'}{' '}
                                {horaCorta(cambio.origen_hora_inicio)}–
                                {horaCorta(cambio.origen_hora_fin)} →{' '}
                                {cambio.destino_dia_semana ||
                                  formatearFecha(cambio.fecha)}{' '}
                                {horaCorta(cambio.destino_hora_inicio)}–
                                {horaCorta(cambio.destino_hora_fin)}
                                {cambiaGrupo
                                  ? ` · ${cambio.grupo_origen || 'Sin grupo'} → ${
                                      cambio.grupo_destino || 'Destino'
                                    }`
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
                                onClick={() => abrirFormularioCambioOcio(cambio)}
                                style={botonSecundario}
                              >
                                Modificar
                              </button>
                              <button
                                type="button"
                                onClick={() => eliminarCambioPuntualOcio(cambio)}
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

          {ocioPestanaProceso === 'semana' && (
            <OcioWeekPreparationPanel ctx={ctx} />
          )}
        </section>
      )}
    </section>
  );
}
