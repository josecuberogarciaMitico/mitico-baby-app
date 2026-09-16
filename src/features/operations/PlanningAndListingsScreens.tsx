import React from 'react';

type PlanningHistoryScreenProps = {
  ctx: Record<string, any>;
};

export function PlanningHistoryScreen({ ctx }: PlanningHistoryScreenProps) {
  const {
    alumnosReporteEntrenador,
    avisoCompleto,
    avisoNeutral,
    avisoPendiente,
    avisoReportePendiente,
    bloqueTexto,
    botonMenu,
    botonPeligro,
    botonPrincipal,
    botonSecundario,
    cabeceraPantalla,
    cargando,
    cargarDetalleGrupo,
    cargarPlanning,
    cierreJoseCaja,
    cierreJoseGrid,
    cierreJoseItem,
    cierreJoseLabel,
    despublicarGrupo,
    detalle,
    esNombreGrupoParticularApp,
    filtroPlanning,
    formatearAlumnosDetalle,
    formatearAlumnosPlanning,
    formatearFecha,
    formatearObservaciones,
    formatearTrabajoDiario,
    gruposEntrenador,
    nombreGrupoVisualApp,
    pantalla,
    planning,
    planningFiltrado,
    publicarGrupo,
    puntoEncuentroVisibleGrupoApp,
    renderAyudaRapidaPantallaApp,
    setDetalle,
    setFiltroPlanning,
    tarjeta,
    totalPlanningCerrados,
    totalPlanningPendientes,
    totalPlanningSinPublicar,
  } = ctx;

  return (
    <>
        {pantalla === 'planning' && (
        <section>
          <div style={cabeceraPantalla}>
            <h2>Histórico técnico de grupos</h2>
              {renderAyudaRapidaPantallaApp()}
            <button onClick={cargarPlanning}>Actualizar histórico</button>
          </div>

          {cargando && <p>Cargando...</p>}

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 16,
            }}
          >
            <button
              onClick={() => setFiltroPlanning('todos')}
              style={botonMenu(filtroPlanning === 'todos')}
            >
              Todos ({planning.length})
            </button>

            <button
              onClick={() => setFiltroPlanning('pendientes')}
              style={botonMenu(filtroPlanning === 'pendientes')}
            >
              Pendientes ({totalPlanningPendientes})
            </button>

            <button
              onClick={() => setFiltroPlanning('cerrados')}
              style={botonMenu(filtroPlanning === 'cerrados')}
            >
              Cerrados ({totalPlanningCerrados})
            </button>

            <button
              onClick={() => setFiltroPlanning('sin_publicar')}
              style={botonMenu(filtroPlanning === 'sin_publicar')}
            >
              Sin publicar ({totalPlanningSinPublicar})
            </button>
          </div>

          {detalle && (
            <article
              style={{ ...tarjeta, border: '2px solid #111', marginBottom: 20 }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div>
                  <h2 style={{ marginTop: 0 }}>
                    {nombreGrupoVisualApp(detalle, 0)}
                  </h2>
                  <p>
                    {formatearFecha(detalle.fecha)} ·{' '}
                    {detalle.hora_inicio.slice(0, 5)}–
                    {detalle.hora_fin.slice(0, 5)} · {detalle.modalidad}
                  </p>
                </div>

                <button
                  onClick={() => setDetalle(null)}
                  style={botonSecundario}
                >
                  Cerrar detalle
                </button>
              </div>

              <p>
                <strong>Entrenadores:</strong>{' '}
                {detalle.entrenadores || 'Sin asignar'}
              </p>

              <p>
                <strong>Nivel:</strong> {detalle.nivel_grupo || '-'} ·{' '}
                <strong>Pista:</strong> {detalle.pista || '-'} ·{' '}
                <strong>Encuentro:</strong>{' '}
                {puntoEncuentroVisibleGrupoApp(
                  detalle.nombre_grupo,
                  detalle.punto_encuentro
                )}{' '}
                ·{' '}
                <strong>Estado:</strong> {detalle.estado_grupo}
              </p>

              <p>
                <strong>Total alumnos:</strong> {detalle.total_alumnos}
              </p>

              <p>
                <strong>Alumnos / asistencia / reportes:</strong>
              </p>
              <div style={bloqueTexto}>
                {formatearAlumnosDetalle(detalle.alumnos_detalle)}
              </div>

              <p>
                <strong>Trabajo diario:</strong>
              </p>
              <div style={bloqueTexto}>
                {formatearTrabajoDiario(detalle.trabajo_diario)}
              </div>

              {detalle.observaciones_importantes && (
                <>
                  <p>
                    <strong>Observaciones:</strong>
                  </p>
                  <div style={bloqueTexto}>
                    {formatearObservaciones(detalle.observaciones_importantes)}
                  </div>
                </>
              )}

              <p>
                <strong>Ratio OK:</strong> {detalle.ratio_ok ? 'Sí' : 'No'} ·{' '}
                <strong>Excepción ratio:</strong>{' '}
                {detalle.excepcion_ratio ? 'Sí' : 'No'}
              </p>
            </article>
          )}

          {!cargando && planningFiltrado.length === 0 && (
            <article style={tarjeta}>
              <h3 style={{ marginTop: 0 }}>Sin grupos en este filtro</h3>
              <p style={{ marginBottom: 0 }}>
                Cambia el filtro para ver otros grupos.
              </p>
            </article>
          )}

          <section style={{ display: 'grid', gap: 16 }}>
            {planningFiltrado.map((grupo, indiceGrupoPlanningHistorico) => {
              const alumnosEstadoGrupo = alumnosReporteEntrenador.filter(
                (alumno) => alumno.grupo_id === grupo.grupo_id
              );

              const confirmacionesGrupo = gruposEntrenador.filter(
                (asignacion) => asignacion.grupo_id === grupo.grupo_id
              );

              const asistentesPendientes = alumnosEstadoGrupo.filter(
                (alumno) => alumno.estado_asistencia === 'Pendiente'
              ).length;

              const reportesPendientesGrupo = alumnosEstadoGrupo.filter(
                (alumno) => alumno.estado_reporte === 'Falta reporte'
              ).length;

              const entrenadoresSinConfirmar = confirmacionesGrupo.filter(
                (asignacion) => asignacion.estado_confirmacion !== 'Confirmado'
              ).length;

              const grupoTieneSeguimiento = alumnosEstadoGrupo.length > 0;

              const estadoPlanning = !grupo.publicado
                ? 'Sin publicar'
                : entrenadoresSinConfirmar > 0
                ? 'Publicado · entrenador sin confirmar'
                : grupoTieneSeguimiento && asistentesPendientes > 0
                ? 'Asistencia pendiente'
                : grupoTieneSeguimiento && reportesPendientesGrupo > 0
                ? 'Reportes pendientes'
                : grupoTieneSeguimiento
                ? 'Grupo cerrado'
                : 'Publicado · pendiente de seguimiento';

              const estiloEstadoPlanning = !grupo.publicado
                ? avisoNeutral
                : entrenadoresSinConfirmar > 0
                ? avisoPendiente
                : grupoTieneSeguimiento && asistentesPendientes > 0
                ? avisoPendiente
                : grupoTieneSeguimiento && reportesPendientesGrupo > 0
                ? avisoReportePendiente
                : grupoTieneSeguimiento
                ? avisoCompleto
                : avisoNeutral;

              const textoConfirmacionGrupo = !grupo.publicado
                ? 'Sin publicar'
                : entrenadoresSinConfirmar > 0
                ? `Pendiente (${entrenadoresSinConfirmar})`
                : 'OK';

              const textoAsistenciaGrupo = !grupo.publicado
                ? 'Sin publicar'
                : !grupoTieneSeguimiento
                ? 'Sin seguimiento'
                : asistentesPendientes > 0
                ? `Pendiente (${asistentesPendientes})`
                : 'Completa';

              const textoReportesGrupo = !grupo.publicado
                ? 'Sin publicar'
                : !grupoTieneSeguimiento
                ? 'Sin seguimiento'
                : reportesPendientesGrupo > 0
                ? `Pendientes (${reportesPendientesGrupo})`
                : 'Completos';

              return (
                <article key={grupo.grupo_id} style={tarjeta}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      gap: 12,
                    }}
                  >
                    <div>
                      <h3 style={{ margin: 0 }}>
                        {nombreGrupoVisualApp(
                          grupo,
                          indiceGrupoPlanningHistorico
                        )}
                      </h3>
                      <p style={{ margin: '6px 0' }}>
                        {formatearFecha(grupo.fecha)} ·{' '}
                        {grupo.hora_inicio.slice(0, 5)}–
                        {grupo.hora_fin.slice(0, 5)} · {grupo.modalidad}
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <strong>{grupo.total_alumnos} niños</strong>
                      <p style={{ margin: '6px 0' }}>
                        {esNombreGrupoParticularApp(grupo.nombre_grupo)
                          ? 'CON JOSE'
                          : `Punto ${grupo.punto_encuentro || '-'}`}
                      </p>
                      <p style={{ margin: '6px 0', fontWeight: 'bold' }}>
                        {grupo.publicado ? 'Publicado' : 'Sin publicar'}
                      </p>
                    </div>
                  </div>

                  <hr />

                  <div style={estiloEstadoPlanning}>{estadoPlanning}</div>

                  {grupo.publicado && (
                    <div style={cierreJoseCaja}>
                      <strong>Cierre del grupo</strong>

                      <div style={cierreJoseGrid}>
                        <div style={cierreJoseItem}>
                          <span style={cierreJoseLabel}>
                            Confirmación entrenador
                          </span>
                          <strong>{textoConfirmacionGrupo}</strong>
                        </div>

                        <div style={cierreJoseItem}>
                          <span style={cierreJoseLabel}>Asistencia</span>
                          <strong>{textoAsistenciaGrupo}</strong>
                        </div>

                        <div style={cierreJoseItem}>
                          <span style={cierreJoseLabel}>Reportes</span>
                          <strong>{textoReportesGrupo}</strong>
                        </div>

                        <div style={cierreJoseItem}>
                          <span style={cierreJoseLabel}>Estado final</span>
                          <strong>{estadoPlanning}</strong>
                        </div>
                      </div>
                    </div>
                  )}

                  <p>
                    <strong>Entrenador:</strong>{' '}
                    {grupo.entrenadores || 'Sin asignar'}
                  </p>

                  <p>
                    <strong>Nivel:</strong> {grupo.nivel_grupo || '-'} ·{' '}
                    <strong>Pista:</strong> {grupo.pista || '-'} ·{' '}
                    <strong>Estado:</strong> {grupo.estado_grupo}
                  </p>

                  <p>
                    <strong>Alumnos:</strong>
                  </p>
                  <div style={bloqueTexto}>
                    {formatearAlumnosPlanning(grupo.alumnos)}
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      marginTop: 12,
                      flexWrap: 'wrap',
                    }}
                  >
                    <button
                      onClick={() =>
                        cargarDetalleGrupo(
                          grupo.nombre_grupo,
                          grupo.fecha,
                          grupo.hora_inicio
                        )
                      }
                      style={botonSecundario}
                    >
                      Ver detalle
                    </button>

                    {!grupo.publicado && (
                      <button
                        onClick={() => publicarGrupo(grupo.grupo_id)}
                        style={botonPrincipal}
                      >
                        Publicar grupo
                      </button>
                    )}

                    {grupo.publicado && (
                      <button
                        onClick={() => despublicarGrupo(grupo.grupo_id)}
                        style={botonPeligro}
                      >
                        Despublicar grupo
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        </section>
      )}

    </>
  );
}

type LoadedListingsScreenProps = {
  ctx: Record<string, any>;
};

export function LoadedListingsScreen({ ctx }: LoadedListingsScreenProps) {
  const {
    botonMenu,
    buscador,
    busquedaListados,
    cabeceraPantalla,
    cargando,
    cargarListados,
    error,
    filtroListados,
    formatearFecha,
    listadosFiltrados,
    pantalla,
    renderAyudaRapidaPantallaApp,
    setBusquedaListados,
    setFiltroListados,
    tarjeta,
  } = ctx;

  return (
    <>
        {pantalla === 'listados' && (
        <section>
          <div style={cabeceraPantalla}>
            <h2>Listados cargados</h2>
              {renderAyudaRapidaPantallaApp()}
            <button onClick={cargarListados}>Actualizar listados</button>
          </div>

          <input
            value={busquedaListados}
            onChange={(e) => setBusquedaListados(e.target.value)}
            placeholder="Buscar semana, modalidad, estado o fecha..."
            style={buscador}
          />

          <div
            style={{
              display: 'flex',
              gap: 8,
              flexWrap: 'wrap',
              marginBottom: 16,
            }}
          >
            <button
              onClick={() => setFiltroListados('todos')}
              style={botonMenu(filtroListados === 'todos')}
            >
              Todos
            </button>
            <button
              onClick={() => setFiltroListados('pendientes')}
              style={botonMenu(filtroListados === 'pendientes')}
            >
              Pendientes revisar
            </button>
            <button
              onClick={() => setFiltroListados('altas')}
              style={botonMenu(filtroListados === 'altas')}
            >
              Altas nuevas
            </button>
            <button
              onClick={() => setFiltroListados('no_encontrados')}
              style={botonMenu(filtroListados === 'no_encontrados')}
            >
              No encontrados
            </button>
            <button
              onClick={() => setFiltroListados('fuera_plazo')}
              style={botonMenu(filtroListados === 'fuera_plazo')}
            >
              Fuera de plazo
            </button>
          </div>

          {cargando && <p>Cargando listados...</p>}

          {!cargando && listadosFiltrados.length === 0 && !error && (
            <article style={tarjeta}>
              <h3 style={{ marginTop: 0 }}>Sin listados</h3>
              <p style={{ marginBottom: 0 }}>
                No hay listados que coincidan con el filtro actual.
              </p>
            </article>
          )}

          <section style={{ display: 'grid', gap: 12 }}>
            {listadosFiltrados.map((listado) => (
              <article key={listado.listado_id} style={tarjeta}>
                <h3 style={{ margin: 0 }}>{listado.semana || 'Sin semana'}</h3>
                <p>
                  {formatearFecha(listado.fecha)} ·{' '}
                  {listado.hora_inicio.slice(0, 5)}–
                  {listado.hora_fin.slice(0, 5)} · {listado.modalidad}
                </p>
                <p>
                  <strong>Estado:</strong> {listado.estado}
                </p>
                <p>
                  <strong>Plazo:</strong>{' '}
                  {listado.fuera_de_plazo ? 'Fuera de plazo' : 'En plazo'}
                </p>
                <hr />
                <p>
                  <strong>Total detectados:</strong>{' '}
                  {listado.total_nombres_detectados || 0}
                </p>
                <p>
                  <strong>Encontrados:</strong> {listado.encontrados || 0} ·{' '}
                  <strong>Altas nuevas:</strong> {listado.altas_nuevas || 0} ·{' '}
                  <strong>Pendientes:</strong> {listado.pendientes_revisar || 0}
                </p>
                <p>
                  <strong>No encontrados:</strong> {listado.no_encontrados || 0}{' '}
                  · <strong>Duplicados:</strong> {listado.duplicados || 0}
                </p>
              </article>
            ))}
          </section>
        </section>
      )}

    </>
  );
}

