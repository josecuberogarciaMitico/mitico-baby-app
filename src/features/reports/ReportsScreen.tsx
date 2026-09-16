import React from 'react';
import type { ReportePendiente } from '../../core/sessions/operationalTypes';

type ReportsScreenProps = {
  ctx: Record<string, any>;
};

export function ReportsScreen({ ctx }: ReportsScreenProps) {
  const {
    abrirPendienteCierreSemanal,
    anioInicioTemporadaAgenda,
    botonMenu,
    botonPrincipal,
    botonSecundario,
    buscador,
    busquedaReportes,
    cabeceraEntrenadorMovil,
    cargando,
    cargarReportesPendientes,
    copiarWhatsappPendientesEntrenador,
    copiarWhatsappPendientesReportes,
    enviandoRecordatorioReportesPushId,
    enviarRecordatorioReportesPushApp,
    error,
    esVistaMovilApp,
    etiquetaSuperior,
    filtroReportes,
    formatearFecha,
    mesAgendaActivo,
    mesesAgenda,
    miniTarjetaBlanca,
    nombreMesAgendaDesdeClave,
    nombreTemporadaAgenda,
    opcionesTemporadaAgenda,
    pantalla,
    rangoSemanaAgenda,
    renderAyudaRapidaPantallaApp,
    reportesFiltrados,
    reportesPorEntrenador,
    reportesSemanaCierre,
    selectCampoAgenda,
    semanaAgendaActiva,
    semanasAgenda,
    setAnioInicioTemporadaAgenda,
    setBusquedaReportes,
    setFiltroReportes,
    setMesAgenda,
    setSemanaAgendaInicio,
    tarjetaEntrenadorMovil,
    tarjetaMovilVacia,
  } = ctx;

  return (
    <>
      {pantalla === 'reportes' &&
        (() => {
          const totalReportesPendientes = reportesSemanaCierre.filter(
            (reporte) => reporte.estado_reporte === 'Falta reporte'
          ).length;
          const totalAsistenciasPendientes = reportesSemanaCierre.filter(
            (reporte) =>
              reporte.estado_reporte === 'Asistencia sin confirmar' ||
              reporte.estado_asistencia === 'Pendiente'
          ).length;
          const totalAmbosPendientes = reportesSemanaCierre.filter(
            (reporte) =>
              reporte.estado_reporte === 'Falta reporte' &&
              (
                reporte.estado_reporte === 'Asistencia sin confirmar' ||
                reporte.estado_asistencia === 'Pendiente'
              )
          ).length;
          const totalEntrenadoresPendientes = new Set(
            reportesSemanaCierre.map((reporte) => reporte.entrenador_id)
          ).size;

          const chipEstadoReporte = (reporte: ReportePendiente) => {
            const faltaReporte = reporte.estado_reporte === 'Falta reporte';
            const asistenciaPendiente =
              reporte.estado_reporte === 'Asistencia sin confirmar' ||
              reporte.estado_asistencia === 'Pendiente';

            if (faltaReporte && asistenciaPendiente) {
              return {
                texto: 'Reporte + asistencia',
                estilo: {
                  background: '#fee2e2',
                  color: '#991b1b',
                  border: '1px solid #fecaca',
                },
              };
            }

            if (asistenciaPendiente) {
              return {
                texto: 'Asistencia pendiente',
                estilo: {
                  background: '#ffedd5',
                  color: '#9a3412',
                  border: '1px solid #fed7aa',
                },
              };
            }

            return {
              texto: 'Falta reporte',
              estilo: {
                background: '#dbeafe',
                color: '#1d4ed8',
                border: '1px solid #bfdbfe',
              },
            };
          };

          const metricasPendientes = [
            {
              titulo: 'Entrenadores',
              valor: totalEntrenadoresPendientes,
              detalle: 'con tareas',
              filtro: 'todos' as const,
              estilo: {
                background: 'linear-gradient(135deg, #eff6ff, #ffffff)',
                border: '1px solid #bfdbfe',
                color: '#1e3a8a',
              },
            },
            {
              titulo: 'Reportes',
              valor: totalReportesPendientes,
              detalle: 'por rellenar',
              filtro: 'faltan_reportes' as const,
              estilo: {
                background: 'linear-gradient(135deg, #eef2ff, #ffffff)',
                border: '1px solid #c7d2fe',
                color: '#3730a3',
              },
            },
            {
              titulo: 'Asistencia',
              valor: totalAsistenciasPendientes,
              detalle: 'sin cerrar',
              filtro: 'asistencias_sin_confirmar' as const,
              estilo: {
                background: 'linear-gradient(135deg, #fff7ed, #ffffff)',
                border: '1px solid #fed7aa',
                color: '#9a3412',
              },
            },
            {
              titulo: 'Críticos',
              valor: totalAmbosPendientes,
              detalle: 'ambos pendientes',
              filtro: 'criticos' as const,
              estilo: {
                background: 'linear-gradient(135deg, #fef2f2, #ffffff)',
                border: '1px solid #fecaca',
                color: '#991b1b',
              },
            },
          ];

          return (
            <section>
              <div
                style={{
                  borderRadius: 22,
                  padding: esVistaMovilApp ? 16 : 20,
                  marginBottom: 16,
                  background:
                    'linear-gradient(135deg, #062d3f 0%, #083b4d 58%, #0b5d4f 100%)',
                  color: '#ffffff',
                  boxShadow: '0 14px 34px rgba(15,23,42,.14)',
                  border: '1px solid rgba(255,255,255,.08)',
                }}
              >
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: esVistaMovilApp
                      ? 'minmax(0, 1fr)'
                      : 'minmax(0, 1fr) auto',
                    gap: 16,
                    alignItems: 'start',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <p
                      style={{
                        ...etiquetaSuperior,
                        margin: 0,
                        color: '#86efac',
                      }}
                    >
                      CONTROL SEMANAL
                    </p>
                    <h2
                      style={{
                        margin: '5px 0 4px',
                        color: '#ffffff',
                        fontSize: esVistaMovilApp ? 24 : 30,
                        lineHeight: 1.08,
                      }}
                    >
                      Reportes pendientes
                    </h2>
                    <p
                      style={{
                        margin: 0,
                        maxWidth: 720,
                        color: '#cbd5e1',
                        fontSize: 13,
                        lineHeight: 1.45,
                      }}
                    >
                      Revisa asistencia, reportes y tareas pendientes de la semana seleccionada.
                    </p>
                    {renderAyudaRapidaPantallaApp()}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                      justifyContent: esVistaMovilApp ? 'stretch' : 'flex-end',
                    }}
                  >
                    <button
                      onClick={copiarWhatsappPendientesReportes}
                      style={{
                        ...botonPrincipal,
                        width: esVistaMovilApp ? '100%' : 'auto',
                        minHeight: 42,
                        padding: '9px 13px',
                        borderRadius: 13,
                        borderColor: '#16a34a',
                        background: '#16a34a',
                        color: '#ffffff',
                        boxShadow: '0 8px 18px rgba(22,163,74,.20)',
                      }}
                    >
                      Ver WhatsApp general
                    </button>
                    <button
                      onClick={cargarReportesPendientes}
                      style={{
                        ...botonSecundario,
                        width: esVistaMovilApp ? '100%' : 'auto',
                        minHeight: 42,
                        padding: '9px 13px',
                        borderRadius: 13,
                        borderColor: 'rgba(255,255,255,.24)',
                        background: 'rgba(255,255,255,.10)',
                        color: '#ffffff',
                      }}
                    >
                      Actualizar
                    </button>
                  </div>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    paddingTop: 14,
                    borderTop: '1px solid rgba(255,255,255,.12)',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'end',
                      gap: 12,
                      flexWrap: 'wrap',
                      marginBottom: 10,
                    }}
                  >
                    <div>
                      <p
                        style={{
                          ...etiquetaSuperior,
                          margin: 0,
                          color: '#86efac',
                        }}
                      >
                        SEMANA
                      </p>
                      <strong
                        style={{
                          display: 'block',
                          marginTop: 3,
                          color: '#ffffff',
                          fontSize: 17,
                        }}
                      >
                        Semana a revisar
                      </strong>
                      <span
                        style={{
                          display: 'block',
                          marginTop: 3,
                          color: '#cbd5e1',
                          fontSize: 13,
                        }}
                      >
                        {semanaAgendaActiva ? rangoSemanaAgenda(semanaAgendaActiva) : '-'}
                      </span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: esVistaMovilApp
                        ? 'minmax(0, 1fr)'
                        : 'repeat(3, minmax(0, 1fr))',
                      gap: 8,
                    }}
                  >
                    <label style={{ display: 'grid', gap: 5, color: '#ffffff', fontSize: 11, fontWeight: 900 }}>
                      Temporada
                      <select
                      value={anioInicioTemporadaAgenda}
                      style={{ ...selectCampoAgenda, color: '#111827', background: '#ffffff' }}
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
                    <label style={{ display: 'grid', gap: 5, color: '#ffffff', fontSize: 11, fontWeight: 900 }}>
                      Mes
                      <select
                      value={mesAgendaActivo}
                      style={{ ...selectCampoAgenda, color: '#111827', background: '#ffffff' }}
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
                    <label style={{ display: 'grid', gap: 5, color: '#ffffff', fontSize: 11, fontWeight: 900 }}>
                      Semana lunes-domingo
                      <select
                      value={semanaAgendaActiva}
                      style={{ ...selectCampoAgenda, color: '#111827', background: '#ffffff' }}
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
                </div>

                                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: esVistaMovilApp
                      ? 'repeat(2, minmax(0, 1fr))'
                      : 'repeat(4, minmax(0, 1fr))',
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  {metricasPendientes.map((metrica) => {
                    const activa = filtroReportes === metrica.filtro;

                    return (
                      <button
                        key={metrica.titulo}
                        type="button"
                        onClick={() => setFiltroReportes(metrica.filtro)}
                        aria-pressed={activa}
                        title={`Filtrar por ${metrica.titulo.toLowerCase()}`}
                        style={{
                          appearance: 'none',
                          width: '100%',
                          minWidth: 0,
                          minHeight: 62,
                          padding: '10px 11px',
                          borderRadius: 13,
                          border: activa
                            ? '1px solid #86efac'
                            : '1px solid rgba(255,255,255,.14)',
                          background: activa
                            ? 'rgba(22,163,74,.24)'
                            : 'rgba(255,255,255,.08)',
                          color: '#ffffff',
                          textAlign: 'left',
                          cursor: 'pointer',
                          boxShadow: activa
                            ? '0 7px 18px rgba(22,163,74,.18)'
                            : 'none',
                          transition:
                            'background .15s ease, border-color .15s ease, box-shadow .15s ease',
                        }}
                      >
                        <span
                          style={{
                            display: 'block',
                            color: activa ? '#bbf7d0' : '#86efac',
                            fontSize: 10,
                            fontWeight: 950,
                            letterSpacing: '.06em',
                            textTransform: 'uppercase',
                          }}
                        >
                          {metrica.titulo}
                        </span>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: 5,
                            marginTop: 3,
                            minWidth: 0,
                          }}
                        >
                          <strong
                            style={{
                              color: '#ffffff',
                              fontSize: 20,
                              lineHeight: 1,
                            }}
                          >
                            {metrica.valor}
                          </strong>
                          <span
                            style={{
                              color: activa ? '#dcfce7' : '#cbd5e1',
                              fontSize: 11,
                              lineHeight: 1.2,
                            }}
                          >
                            {metrica.detalle}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  <input
                    value={busquedaReportes}
                    onChange={(e) => setBusquedaReportes(e.target.value)}
                    placeholder="Buscar entrenador, alumno, grupo o modalidad..."
                    style={{ color: '#111827', background: '#ffffff', caretColor: '#111827', ...buscador, margin: 0 }}
                  />
                  <div
                    style={{
                      display: 'flex',
                      gap: 7,
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={() => {
                        setFiltroReportes('todos');
                        setBusquedaReportes('');
                      }}
                      style={botonMenu(filtroReportes === 'todos')}
                    >
                      Todos
                    </button>
<button
                      onClick={() => setFiltroReportes('faltan_reportes')}
                      style={botonMenu(filtroReportes === 'faltan_reportes')}
                    >
                      Reportes
                    </button>
<button
                      onClick={() =>
                        setFiltroReportes('asistencias_sin_confirmar')
                      }
                      style={botonMenu(
                        filtroReportes === 'asistencias_sin_confirmar'
                      )}
                    >
                      Asistencia
                    </button>
<button
                        onClick={() => setFiltroReportes('criticos')}
                        style={botonMenu(true)}
                        title="Reporte y asistencia pendientes a la vez"
                      >
                        Críticos
                      </button>
                  </div>
                </div>
              </div>

{cargando && <p>Cargando reportes pendientes...</p>}

              {!cargando && reportesFiltrados.length === 0 && !error && (
                <article
                  style={{
                    ...tarjetaMovilVacia,
                    border: '1px solid #bbf7d0',
                    background: 'linear-gradient(135deg, #f0fdf4, #ffffff)',
                    borderRadius: 24,
                  }}
                >
                  <h3 style={{ marginTop: 0 }}>Todo al día en esta semana</h3>
                  <p style={{ marginBottom: 0 }}>
                    No hay reportes pendientes ni asistencias sin confirmar para
                    la semana seleccionada.
                  </p>
                </article>
              )}

              <section
                id="cierre-semanal-listado-pendientes"
                style={{ display: 'grid', gap: 14, scrollMarginTop: 18 }}
              >
                {reportesPorEntrenador.map((grupo) => {
                  const faltanReportes = grupo.reportes.filter(
                    (reporte) => reporte.estado_reporte === 'Falta reporte'
                  );
                  const entrenadorIdPush =
                    faltanReportes.find((reporte) => Boolean(reporte.entrenador_id))
                      ?.entrenador_id || '';
                  const asistenciasSinConfirmar = grupo.reportes.filter(
                    (reporte) =>
                      reporte.estado_reporte === 'Asistencia sin confirmar' ||
                      reporte.estado_asistencia === 'Pendiente'
                  );
                  const ambosPendientes = grupo.reportes.filter(
                    (reporte) =>
                      reporte.estado_reporte === 'Falta reporte' &&
                      reporte.estado_asistencia === 'Pendiente'
                  );
                  const reportesPorFecha = grupo.reportes.reduce(
                    (acc, reporte) => {
                      const clave = reporte.fecha;
                      if (!acc[clave]) acc[clave] = [];
                      acc[clave].push(reporte);
                      return acc;
                    },
                    {} as Record<string, ReportePendiente[]>
                  );

                  return (
                    <article
                      key={grupo.entrenador}
                      style={{
                        ...tarjetaEntrenadorMovil,
                        borderRadius: 24,
                        border: '1px solid #dbeafe',
                        background: 'linear-gradient(135deg, #ffffff, #f8fbff)',
                        boxShadow: '0 16px 35px rgba(15, 23, 42, 0.07)',
                        overflow: 'hidden',
                      }}
                    >
                      <header
                        style={{
                          ...cabeceraEntrenadorMovil,
                          alignItems: 'center',
                          borderBottom: '1px solid #e2e8f0',
                          paddingBottom: 14,
                        }}
                      >
                        <div>
                          <p
                            style={{
                              ...etiquetaSuperior,
                              marginBottom: 6,
                              color: '#0f9f4d',
                            }}
                          >
                            ENTRENADOR
                          </p>
                          <h3 style={{ margin: 0 }}>{grupo.entrenador}</h3>
                          <p
                            style={{
                              margin: '6px 0 0',
                              color: '#64748b',
                              fontWeight: 700,
                            }}
                          >
                            Semana {rangoSemanaAgenda(semanaAgendaActiva)}
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
                          <span
                            style={{
                              padding: '8px 11px',
                              borderRadius: 999,
                              background: '#eef2ff',
                              color: '#3730a3',
                              border: '1px solid #c7d2fe',
                              fontWeight: 900,
                            }}
                          >
                            {faltanReportes.length} reportes
                          </span>
                          <span
                            style={{
                              padding: '8px 11px',
                              borderRadius: 999,
                              background: '#fff7ed',
                              color: '#9a3412',
                              border: '1px solid #fed7aa',
                              fontWeight: 900,
                            }}
                          >
                            {asistenciasSinConfirmar.length} asistencias
                          </span>
                          {ambosPendientes.length > 0 && (
                            <span
                              style={{
                                padding: '8px 11px',
                                borderRadius: 999,
                                background: '#fef2f2',
                                color: '#991b1b',
                                border: '1px solid #fecaca',
                                fontWeight: 900,
                              }}
                            >
                              {ambosPendientes.length} críticos
                            </span>
                          )}
                        </div>
                      </header>

                      <div
                        style={{
                          display: 'flex',
                          gap: 8,
                          flexWrap: 'wrap',
                          marginTop: 14,
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <div
                          style={{
                            display: 'flex',
                            gap: 8,
                            flexWrap: 'wrap',
                            alignItems: 'center',
                          }}
                        >
                          <button
                            onClick={() =>
                              copiarWhatsappPendientesEntrenador(
                                grupo.entrenador_id,
                                grupo.entrenador,
                                grupo.reportes
                              )
                            }
                            style={botonPrincipal}
                          >
                            WhatsApp entrenador
                          </button>

                          {faltanReportes.length > 0 && (
                            <button
                              type="button"
                              onClick={() =>
                                void enviarRecordatorioReportesPushApp(
                                  entrenadorIdPush,
                                  grupo.entrenador,
                                  semanaAgendaActiva
                                )
                              }
                              disabled={
                                enviandoRecordatorioReportesPushId ===
                                entrenadorIdPush
                              }
                              style={{
                                ...botonPrincipal,
                                background: '#f59e0b',
                                borderColor: '#f59e0b',
                                color: '#172033',
                                fontWeight: 950,
                                opacity:
                                  enviandoRecordatorioReportesPushId ===
                                  entrenadorIdPush
                                    ? 0.65
                                    : 1,
                              }}
                            >
                              {enviandoRecordatorioReportesPushId ===
                              entrenadorIdPush
                                ? 'Enviando Push...'
                                : '🔔 Avisar reportes por Push'}
                            </button>
                          )}
                        </div>
                        <span style={{ color: '#64748b', fontWeight: 800 }}>
                          {grupo.reportes.length} tareas pendientes
                        </span>
                      </div>

                      <details
                        data-cierre-detalle="true"
                        style={{ marginTop: 12 }}
                      >
                        <summary
                          style={{
                            cursor: 'pointer',
                            fontWeight: 900,
                            padding: '12px 14px',
                            borderRadius: 16,
                            background: '#f8fafc',
                            border: '1px solid #e2e8f0',
                            color: '#0f172a',
                          }}
                        >
                          Ver detalle de pendientes
                        </summary>

                        <section
                          style={{ display: 'grid', gap: 12, marginTop: 12 }}
                        >
                          {(Object.entries(reportesPorFecha) as [string, ReportePendiente[]][])
                            .sort(([a], [b]) => a.localeCompare(b))
                            .map(([fecha, reportesFecha]) => (
                              <article
                                key={`${grupo.entrenador}-${fecha}`}
                                style={{
                                  border: '1px solid #e2e8f0',
                                  borderRadius: 18,
                                  background: '#ffffff',
                                  overflow: 'hidden',
                                }}
                              >
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    gap: 10,
                                    flexWrap: 'wrap',
                                    padding: '12px 14px',
                                    background: '#f8fafc',
                                    borderBottom: '1px solid #e2e8f0',
                                  }}
                                >
                                  <strong>{formatearFecha(fecha)}</strong>
                                  <span
                                    style={{
                                      color: '#64748b',
                                      fontWeight: 800,
                                    }}
                                  >
                                    {reportesFecha.length} pendiente(s)
                                  </span>
                                </div>

                                <div
                                  style={{
                                    display: 'grid',
                                    gap: 8,
                                    padding: 12,
                                  }}
                                >
                                  {reportesFecha.map((reporte) => {
                                    const chip = chipEstadoReporte(reporte);
                                    return (
                                      <div
                                        key={`${reporte.grupo_id}-${reporte.alumno_id}-${reporte.estado_reporte}`}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() =>
                                          void abrirPendienteCierreSemanal(reporte)
                                        }
                                        onKeyDown={(evento) => {
                                          if (
                                            evento.key === 'Enter' ||
                                            evento.key === ' '
                                          ) {
                                            evento.preventDefault();
                                            void abrirPendienteCierreSemanal(
                                              reporte
                                            );
                                          }
                                        }}
                                        title="Resolver esta tarea en Vista entrenador"
                                        style={{
                                          ...miniTarjetaBlanca,
                                          border: '1px solid #e2e8f0',
                                          borderRadius: 16,
                                          boxShadow: 'none',
                                          cursor: 'pointer',
                                        }}
                                      >
                                        <div
                                          style={{ display: 'grid', gap: 8 }}
                                        >
                                          <div
                                            style={{
                                              display: 'flex',
                                              justifyContent: 'space-between',
                                              gap: 10,
                                              flexWrap: 'wrap',
                                            }}
                                          >
                                            <strong>{reporte.alumno}</strong>
                                            <span
                                              style={{
                                                ...chip.estilo,
                                                padding: '6px 10px',
                                                borderRadius: 999,
                                                fontWeight: 900,
                                                fontSize: 12,
                                              }}
                                            >
                                              {chip.texto}
                                            </span>
                                          </div>

                                          <div
                                            style={{
                                              display: 'flex',
                                              gap: 8,
                                              flexWrap: 'wrap',
                                              color: '#475569',
                                              fontWeight: 700,
                                            }}
                                          >
                                            <span>
                                              Nivel{' '}
                                              {reporte.nivel_alumno ||
                                                'SIN NIVEL'}
                                            </span>
                                            <span>{reporte.modalidad}</span>
                                            <span>
                                              {reporte.hora_inicio.slice(0, 5)}–
                                              {reporte.hora_fin.slice(0, 5)}
                                            </span>
                                          </div>

                                          <div
                                            style={{
                                              display: 'grid',
                                              gap: 4,
                                              color: '#334155',
                                            }}
                                          >
                                            <p style={{ margin: 0 }}>
                                              <strong>Grupo:</strong>{' '}
                                              {reporte.nombre_grupo}
                                            </p>
                                            <p style={{ margin: 0 }}>
                                              <strong>Asistencia:</strong>{' '}
                                              {reporte.estado_asistencia} ·{' '}
                                              <strong>Reporte:</strong>{' '}
                                              {reporte.estado_reporte}
                                            </p>
                                            <p
                                              style={{
                                                margin: '4px 0 0',
                                                color: '#2563eb',
                                                fontWeight: 900,
                                                fontSize: 12,
                                              }}
                                            >
                                              Resolver en Vista entrenador →
                                            </p>
                                          </div>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </article>
                            ))}
                        </section>
                      </details>
                    </article>
                  );
                })}
              </section>
            </section>
          );
        })()}

    </>
  );
}

