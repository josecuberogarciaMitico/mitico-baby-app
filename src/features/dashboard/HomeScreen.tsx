import React from 'react';
import type { AgendaSesionDirectaApp } from '../agenda/agendaTypes';

type AvisoJose = {
  orden: number;
  bloque: string;
  contador: number;
  descripcion: string;
};

type HomeScreenProps = {
  ctx: Record<string, any>;
};

export function HomeScreen({ ctx }: HomeScreenProps) {
  const {
    FOTO_MITICO_HERO,
    abrirPantallaConScroll,
    actualizarTodo,
    agendaSesionesDirectas,
    avisos,
    capitalizarPrimera,
    cargando,
    cargarDetalleSesionAgenda,
    crearFechaAgenda,
    entrenadores,
    inicioSemanaAgenda,
    normalizarModalidadAgenda,
    pantalla,
    perfilUsuario,
    resumenInicio,
    semanaAgendaActiva,
    setAgendaDiaCompactoActivo,
    setAgendaFormularioAbierto,
    setAgendaSesionActivaId,
    setAnioInicioTemporadaAgenda,
    setBusquedaReportes,
    setError,
    setFiltroReportes,
    setMesAgenda,
    setPantalla,
    setSemanaAgendaInicio,
  } = ctx;

  return (
    <>
      {pantalla === 'inicio' && (() => {
        const sesionesSemanaInicio = agendaSesionesDirectas
          .filter((sesion) => !semanaAgendaActiva || sesion.semana_inicio === semanaAgendaActiva)
          .sort((a, b) => `${a.fecha} ${a.hora_inicio}`.localeCompare(`${b.fecha} ${b.hora_inicio}`));
        const totalAlumnosSemanaInicio = sesionesSemanaInicio.reduce(
          (total, sesion) => total + Number(sesion.total_alumnos || 0),
          0
        );
        const totalGruposSemanaInicio = sesionesSemanaInicio.reduce(
          (total, sesion) => total + Number(sesion.total_grupos || 0),
          0
        );
        const entrenadoresActivosInicio = entrenadores.filter((entrenador) => entrenador.activo).length;
        const incidenciasInicio =
          Number(resumenInicio.reportesPendientes || 0) +
          Number(resumenInicio.asistenciasSinConfirmar || 0) +
          Number(resumenInicio.gruposSinPublicar || 0) +
          Number(resumenInicio.entrenadoresSinConfirmar || 0);
        const proximasSesionesInicio = sesionesSemanaInicio.slice(0, 5);
        const alumnosPorModalidadInicio = ['BABY', 'OCIO', 'INTENSIVOS'].map((modalidad) => ({
          modalidad,
          total: sesionesSemanaInicio
            .filter((sesion) => normalizarModalidadAgenda(sesion.modalidad || sesion.modalidad_codigo) === modalidad)
            .reduce((total, sesion) => total + Number(sesion.total_alumnos || 0), 0),
        }));
        const horaSaludoInicio = new Date().getHours();
        const saludoInicio =
          horaSaludoInicio < 6 || horaSaludoInicio >= 21
            ? 'Buenas noches'
            : horaSaludoInicio < 14
              ? 'Buenos días'
              : 'Buenas tardes';

        async function abrirSesionDesdeInicio(sesion: AgendaSesionDirectaApp) {
          const [anioDia, mesDia] = sesion.fecha.split('-').map(Number);
          const mesObjetivo = `${anioDia}-${String(mesDia).padStart(2, '0')}`;
          const semanaObjetivo = inicioSemanaAgenda(sesion.fecha);

          setAnioInicioTemporadaAgenda(mesDia >= 9 ? anioDia : anioDia - 1);
          setMesAgenda(mesObjetivo);
          setSemanaAgendaInicio(semanaObjetivo);
          setAgendaDiaCompactoActivo(sesion.fecha);
          setAgendaFormularioAbierto(false);
          setAgendaSesionActivaId(sesion.sesion_id);
          setPantalla('agenda');

          try {
            await cargarDetalleSesionAgenda(sesion.sesion_id, { preservarScroll: true });
          } catch (err) {
            setError(
              err instanceof Error
                ? err.message
                : 'No se pudo abrir el turno seleccionado.'
            );
            return;
          }

          window.setTimeout(() => {
            const objetivo =
              document.getElementById('agenda-sesion-trabajo') ||
              document.getElementById('agenda-dia-seleccionado');
            objetivo?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 220);
        }

        function abrirIncidenciasInicio() {
          const categoriasActivas = [
            resumenInicio.reportesPendientes > 0 ? 'reportes' : '',
            resumenInicio.asistenciasSinConfirmar > 0 ? 'asistencia' : '',
            resumenInicio.gruposSinPublicar > 0 ? 'grupos' : '',
            resumenInicio.entrenadoresSinConfirmar > 0 ? 'entrenadores' : '',
          ].filter(Boolean);

          if (categoriasActivas.length === 1) {
            const categoria = categoriasActivas[0];
            if (categoria === 'reportes') {
              setFiltroReportes('faltan_reportes');
              setBusquedaReportes('');
              abrirPantallaConScroll('reportes');
              return;
            }
            if (categoria === 'asistencia') {
              setFiltroReportes('asistencias_sin_confirmar');
              setBusquedaReportes('');
              abrirPantallaConScroll('reportes');
              return;
            }
            if (categoria === 'grupos') {
              abrirPantallaConScroll('agenda');
              return;
            }
            abrirPantallaConScroll('entrenador');
            return;
          }

          document.getElementById('inicio-necesita-atencion')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
        }

        function destinoAvisoInicio(aviso: AvisoJose) {
          const bloque = String(aviso.bloque || '').toLowerCase();
          if (bloque.includes('disponibil')) return () => abrirPantallaConScroll('disponibilidad');
          if (bloque.includes('sin asignar')) return () => abrirPantallaConScroll('disponibilidad');
          if (bloque.includes('sin publicar') || bloque.includes('grupos pendientes')) return () => abrirPantallaConScroll('agenda');
          if (bloque.includes('confirmar') && bloque.includes('entrenador')) return () => abrirPantallaConScroll('entrenador');
          if (bloque.includes('asistencia') || bloque.includes('niños sin confirmar')) {
            return () => {
              setFiltroReportes('asistencias_sin_confirmar');
              setBusquedaReportes('');
              abrirPantallaConScroll('reportes');
            };
          }
          if (bloque.includes('reporte')) {
            return () => {
              setFiltroReportes('faltan_reportes');
              setBusquedaReportes('');
              abrirPantallaConScroll('reportes');
            };
          }
          if (bloque.includes('intensiv') || bloque.includes('diploma')) return () => abrirPantallaConScroll('intensivos');
          if (bloque.includes('cobro')) return () => abrirPantallaConScroll('cobros');
          return () => abrirPantallaConScroll('agenda');
        }

        return (
          <section className="mitico-home-screen">
            <style>{`
              .mitico-home-screen{display:grid;gap:18px;color:#122033;min-width:0}
              .mitico-home-hero{position:relative;display:flex;justify-content:space-between;gap:22px;align-items:flex-end;flex-wrap:wrap;min-height:220px;padding:28px 30px;border-radius:24px;overflow:hidden;background-size:112% auto;background-position:54% 42%;background-repeat:no-repeat;box-shadow:0 18px 42px rgba(15,23,42,.14);isolation:isolate}
              .mitico-home-hero:after{content:"";position:absolute;inset:0;background:linear-gradient(90deg,rgba(4,39,55,.88) 0%,rgba(5,50,65,.76) 44%,rgba(6,68,62,.30) 72%,rgba(6,68,62,.10) 100%);z-index:-1}
              .mitico-home-hero-copy{max-width:650px}
              .mitico-home-hero h2{margin:0;color:#fff;font-size:clamp(28px,3vw,39px);letter-spacing:-.035em;line-height:1.08;text-shadow:0 3px 18px rgba(2,15,23,.30)}
              .mitico-home-hero p{margin:9px 0 0;color:#d8e8ed;font-size:15px;font-weight:700;text-shadow:0 2px 12px rgba(2,15,23,.28)}
              .mitico-home-actions{display:flex;gap:10px;flex-wrap:wrap;position:relative;z-index:1}
              .mitico-home-action{min-height:44px;padding:10px 15px;border-radius:13px;border:1px solid rgba(255,255,255,.35);background:rgba(255,255,255,.92);color:#173247;font-weight:900;box-shadow:0 8px 22px rgba(2,15,23,.16);backdrop-filter:blur(8px)}
              .mitico-home-action.primary{background:#0f9f4d;border-color:#0f9f4d;color:#fff;box-shadow:0 10px 24px rgba(15,159,77,.30)}
              .mitico-home-metrics{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px}
              .mitico-home-metric{min-width:0;padding:16px;border:1px solid #e5eaf1;border-radius:16px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.045)}
              .mitico-home-metric.is-clickable{cursor:pointer;text-align:left;font:inherit;transition:transform .14s ease,box-shadow .14s ease}.mitico-home-metric.is-clickable:hover{transform:translateY(-1px);box-shadow:0 12px 28px rgba(15,23,42,.08)}
              .mitico-home-metric-head{display:flex;align-items:center;gap:9px;color:#667085;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.04em}
              .mitico-home-metric-icon{width:34px;height:34px;border-radius:11px;display:grid;place-items:center;font-size:17px;font-weight:900}
              .mitico-home-metric strong{display:block;margin-top:8px;font-size:29px;letter-spacing:-.04em;color:#172033}
              .mitico-home-metric small{display:block;margin-top:4px;color:#718096;font-size:11px;line-height:1.35}
              .mitico-home-grid{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(300px,.9fr);gap:14px;align-items:start}
              .mitico-home-panel{border:1px solid #e5eaf1;border-radius:18px;background:#fff;box-shadow:0 8px 24px rgba(15,23,42,.04);overflow:hidden;min-width:0}
              .mitico-home-panel-head{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:15px 17px;border-bottom:1px solid #edf1f5}
              .mitico-home-panel-head h3{margin:0;font-size:16px;letter-spacing:-.01em}
              .mitico-home-link{border:0;background:transparent;color:#52657b;font-weight:800;font-size:11px;padding:6px;cursor:pointer}
              .mitico-home-session{display:grid;grid-template-columns:58px minmax(0,1fr) repeat(3,58px) auto;gap:11px;align-items:center;padding:12px 16px;border-bottom:1px solid #eef2f6;min-width:0}
              .mitico-home-session:last-child{border-bottom:0}
              .mitico-home-date{display:grid;place-items:center;border:1px solid #e5eaf1;border-radius:12px;padding:6px;background:#fbfcfe;text-align:center}
              .mitico-home-date strong{font-size:18px;line-height:1}.mitico-home-date small{margin-top:3px;font-size:8px;color:#718096;font-weight:900;text-transform:uppercase}
              .mitico-home-session-main{min-width:0}.mitico-home-session-main strong{display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-size:13px}.mitico-home-session-main small{display:block;margin-top:4px;color:#7a8898;font-size:10px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
              .mitico-home-session-stat{text-align:center}.mitico-home-session-stat strong{display:block;font-size:13px}.mitico-home-session-stat small{font-size:8px;color:#7a8898}
              .mitico-home-status{padding:6px 10px;border-radius:999px;background:#ecfdf3;color:#16854a;font-size:9px;font-weight:900;white-space:nowrap;border:1px solid #d1fadf}
              .mitico-home-stack{display:grid;gap:14px}
              .mitico-home-alerts{padding:11px 14px 14px;display:grid;gap:8px}
              .mitico-home-alert{display:flex;justify-content:space-between;gap:10px;align-items:center;padding:11px 12px;border-radius:12px;border:1px solid #fde8a8;background:#fffaf0;color:#7a5700;font-size:11px;font-weight:800;cursor:pointer;text-align:left}
              .mitico-home-alert.red{border-color:#fecaca;background:#fff5f5;color:#a61b1b}.mitico-home-alert.blue{border-color:#cfe1ff;background:#f4f8ff;color:#2456a6}
              .mitico-home-op-card{appearance:none;width:100%;min-width:0;padding:12px;border:1px solid #edf1f5;border-radius:13px;background:#fbfcfe;color:#172033;text-align:left;font:inherit;cursor:pointer;transition:transform .14s ease,box-shadow .14s ease,border-color .14s ease}.mitico-home-op-card:hover{transform:translateY(-1px);border-color:#d7e1ee;box-shadow:0 9px 20px rgba(15,23,42,.06)}.mitico-home-op-card strong{display:block;font-size:12px}.mitico-home-op-card .mitico-home-op-count{display:block;margin-top:5px;font-size:24px;font-weight:900}.mitico-home-op-card small{display:block;color:#718096;line-height:1.35}.mitico-home-op-open{display:block;margin-top:8px;color:#2563eb;font-size:10px;font-weight:900;text-transform:uppercase;letter-spacing:.04em}
              .mitico-home-modality{padding:14px 16px 16px;display:grid;gap:10px}.mitico-home-modality-row{display:grid;grid-template-columns:82px minmax(0,1fr) 70px;gap:9px;align-items:center;font-size:11px}.mitico-home-bar{height:8px;border-radius:999px;background:#edf1f5;overflow:hidden}.mitico-home-bar span{display:block;height:100%;border-radius:999px;background:#0f9f4d}.mitico-home-modality-row:nth-child(2) .mitico-home-bar span{background:#3b82f6}.mitico-home-modality-row:nth-child(3) .mitico-home-bar span{background:#f59e0b}
              .mitico-home-empty{padding:24px;color:#718096;font-size:13px;text-align:center}
              @media(max-width:1200px){.mitico-home-metrics{grid-template-columns:repeat(3,minmax(0,1fr))}.mitico-home-grid{grid-template-columns:1fr}.mitico-home-session{grid-template-columns:54px minmax(0,1fr) repeat(2,54px) auto}.mitico-home-session-stat:nth-of-type(4){display:none}}
              @media(max-width:720px){.mitico-home-hero{min-height:245px;padding:22px 20px;background-size:auto 112%;background-position:64% center}.mitico-home-hero:after{background:linear-gradient(180deg,rgba(4,39,55,.48) 0%,rgba(4,39,55,.72) 45%,rgba(4,39,55,.94) 100%)}.mitico-home-metrics{grid-template-columns:repeat(2,minmax(0,1fr))}.mitico-home-metric:last-child{grid-column:1/-1}.mitico-home-actions{width:100%}.mitico-home-action{flex:1 1 140px}.mitico-home-session{grid-template-columns:50px minmax(0,1fr) auto}.mitico-home-session-stat{display:none}.mitico-home-status{font-size:8px;padding:5px 8px}}
            `}</style>

            <div
              className="mitico-home-hero"
              style={{
                backgroundImage: `url(${FOTO_MITICO_HERO})`,
              }}
            >
              <div className="mitico-home-hero-copy">
                <h2>{saludoInicio}, {perfilUsuario?.nombre?.split(' ')[0] || 'Jose'} 👋</h2>
                <p>Aquí tienes la visión general de esta semana.</p>
              </div>
              <div className="mitico-home-actions">
                <button type="button" className="mitico-home-action" onClick={() => abrirPantallaConScroll('agenda')}>
                  Ver calendario semanal
                </button>
                <button type="button" className="mitico-home-action primary" onClick={() => abrirPantallaConScroll('agenda')}>
                  + Nueva sesión
                </button>
              </div>
            </div>

            {cargando && <p style={{ margin: 0, color: '#64748b' }}>Actualizando panel...</p>}

            <div className="mitico-home-metrics">
              {[
                ['Sesiones esta semana', sesionesSemanaInicio.length, `${sesionesSemanaInicio.filter((s) => normalizarModalidadAgenda(s.modalidad || s.modalidad_codigo) === 'BABY').length} Baby · ${sesionesSemanaInicio.filter((s) => normalizarModalidadAgenda(s.modalidad || s.modalidad_codigo) === 'OCIO').length} Ocio · ${sesionesSemanaInicio.filter((s) => normalizarModalidadAgenda(s.modalidad || s.modalidad_codigo) === 'INTENSIVOS').length} Intensivos`, '📅', '#ecfdf3', () => abrirPantallaConScroll('agenda')],
                ['Alumnos inscritos', totalAlumnosSemanaInicio, 'Suma prevista en las sesiones de la semana', '👥', '#eff6ff', () => abrirPantallaConScroll('agenda')],
                ['Grupos activos', totalGruposSemanaInicio, `${resumenInicio.gruposSinPublicar} sin publicar`, '◈', '#f5f3ff', () => abrirPantallaConScroll('agenda')],
                ['Entrenadores', entrenadoresActivosInicio, `${resumenInicio.entrenadoresSinConfirmar} pendientes de confirmar`, '♙', '#fff7ed', () => abrirPantallaConScroll('entrenador')],
                ['Incidencias', incidenciasInicio, incidenciasInicio > 0 ? `${resumenInicio.reportesPendientes} reportes · ${resumenInicio.asistenciasSinConfirmar} asistencias · ${resumenInicio.gruposSinPublicar} grupos · ${resumenInicio.entrenadoresSinConfirmar} entrenadores` : 'Todo al día esta semana', '!', '#fff1f2', abrirIncidenciasInicio],
              ].map(([titulo, valor, detalle, icono, fondo, accion]) => (
                <button type="button" className="mitico-home-metric is-clickable" key={String(titulo)} onClick={accion as () => void}>
                  <div className="mitico-home-metric-head">
                    <span className="mitico-home-metric-icon" style={{ background: String(fondo) }}>{icono}</span>
                    <span>{titulo}</span>
                  </div>
                  <strong>{valor}</strong>
                  <small>{detalle}</small>
                </button>
              ))}
            </div>

            <div className="mitico-home-grid">
              <article className="mitico-home-panel">
                <div className="mitico-home-panel-head">
                  <h3>Próximas sesiones</h3>
                  <button type="button" className="mitico-home-link" onClick={() => abrirPantallaConScroll('agenda')}>Ver todas</button>
                </div>
                {proximasSesionesInicio.length === 0 ? (
                  <div className="mitico-home-empty">No hay sesiones cargadas en la semana seleccionada.</div>
                ) : (
                  proximasSesionesInicio.map((sesion) => {
                    const fecha = crearFechaAgenda(sesion.fecha);
                    const modalidad = normalizarModalidadAgenda(sesion.modalidad || sesion.modalidad_codigo);
                    return (
                      <button
                        type="button"
                        key={sesion.sesion_id}
                        onClick={() => void abrirSesionDesdeInicio(sesion)}
                        className="mitico-home-session"
                        style={{ width: '100%', borderTop: 0, borderLeft: 0, borderRight: 0, background: '#fff', textAlign: 'left', cursor: 'pointer' }}
                      >
                        <span className="mitico-home-date">
                          <strong>{String(fecha.getDate()).padStart(2, '0')}</strong>
                          <small>{fecha.toLocaleDateString('es-ES', { weekday: 'short' }).replace('.', '')}</small>
                        </span>
                        <span className="mitico-home-session-main">
                          <strong>{sesion.modalidad || modalidad} · {sesion.hora_inicio?.slice(0, 5)}–{sesion.hora_fin?.slice(0, 5)}</strong>
                          <small>{sesion.lugar || 'Madrid SnowZone'} · {sesion.estado_sesion || 'Preparada'}</small>
                        </span>
                        <span className="mitico-home-session-stat"><strong>{sesion.total_grupos}</strong><small>Grupos</small></span>
                        <span className="mitico-home-session-stat"><strong>{sesion.total_alumnos}</strong><small>Alumnos</small></span>
                        <span className="mitico-home-session-stat"><strong>{sesion.grupos_publicados}</strong><small>Publicados</small></span>
                        <span className="mitico-home-status">{Number(sesion.grupos_publicados || 0) >= Number(sesion.total_grupos || 0) ? '✓ Todo OK' : 'Revisar'}</span>
                      </button>
                    );
                  })
                )}
              </article>

              <div className="mitico-home-stack">
                {incidenciasInicio > 0 && (
                  <article id="inicio-necesita-atencion" className="mitico-home-panel">
                    <div className="mitico-home-panel-head"><h3>Necesita tu atención</h3><span className="mitico-home-status">{incidenciasInicio}</span></div>
                    <div className="mitico-home-alerts">
                      {resumenInicio.reportesPendientes > 0 && (
                        <button type="button" className="mitico-home-alert" onClick={() => { setFiltroReportes('faltan_reportes'); setBusquedaReportes(''); abrirPantallaConScroll('reportes'); }}><span>{resumenInicio.reportesPendientes} reportes pendientes</span><span>›</span></button>
                      )}
                      {resumenInicio.asistenciasSinConfirmar > 0 && (
                        <button type="button" className="mitico-home-alert red" onClick={() => { setFiltroReportes('asistencias_sin_confirmar'); setBusquedaReportes(''); abrirPantallaConScroll('reportes'); }}><span>{resumenInicio.asistenciasSinConfirmar} asistencias sin confirmar</span><span>›</span></button>
                      )}
                      {resumenInicio.gruposSinPublicar > 0 && (
                        <button type="button" className="mitico-home-alert blue" onClick={() => abrirPantallaConScroll('agenda')}><span>{resumenInicio.gruposSinPublicar} grupos sin publicar</span><span>›</span></button>
                      )}
                      {resumenInicio.entrenadoresSinConfirmar > 0 && (
                        <button type="button" className="mitico-home-alert blue" onClick={() => abrirPantallaConScroll('entrenador')}><span>{resumenInicio.entrenadoresSinConfirmar} entrenadores sin confirmar</span><span>›</span></button>
                      )}
                    </div>
                  </article>
                )}

                <article className="mitico-home-panel">
                  <div className="mitico-home-panel-head"><h3>Resumen por modalidad</h3></div>
                  <div className="mitico-home-modality">
                    {alumnosPorModalidadInicio.map((registro) => {
                      const porcentaje = totalAlumnosSemanaInicio > 0 ? Math.round((registro.total / totalAlumnosSemanaInicio) * 100) : 0;
                      return (
                        <div className="mitico-home-modality-row" key={registro.modalidad}>
                          <strong>{registro.modalidad === 'INTENSIVOS' ? 'Intensivos' : capitalizarPrimera(registro.modalidad.toLowerCase())}</strong>
                          <span className="mitico-home-bar"><span style={{ width: `${porcentaje}%` }} /></span>
                          <span>{registro.total} · {porcentaje}%</span>
                        </div>
                      );
                    })}
                  </div>
                </article>
              </div>
            </div>

            {avisos.length > 0 && (
              <article className="mitico-home-panel">
                <div className="mitico-home-panel-head">
                  <h3>Resumen operativo</h3>
                  <button type="button" className="mitico-home-link" onClick={actualizarTodo}>Actualizar</button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 10, padding: 14 }}>
                  {avisos.map((aviso) => (
                    <button
                      type="button"
                      key={aviso.orden}
                      className="mitico-home-op-card"
                      onClick={destinoAvisoInicio(aviso)}
                    >
                      <strong>{aviso.bloque}</strong>
                      <span className="mitico-home-op-count">{aviso.contador}</span>
                      <small>{aviso.descripcion}</small>
                      <span className="mitico-home-op-open">Abrir y revisar →</span>
                    </button>
                  ))}
                </div>
              </article>
            )}
          </section>
        );
      })()}

    </>
  );
}

