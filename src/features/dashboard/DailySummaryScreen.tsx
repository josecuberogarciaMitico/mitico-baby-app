import React from 'react';
import { groupTrainersJacket, trainersMissingJacket } from '../../core/trainers/trainerOperations';
import { TrackTrainerAdjustPanel } from './TrackTrainerAdjustPanel';
import { ReportSplitPanel } from './ReportSplitPanel';
import { SessionPlanButton } from './SessionPlanTable';
import { SelectorDiaPista } from './SelectorDiaPista';
import { proximaFechaConSesiones } from '../../services/reports/coordinationReportsService';
import { useAsistenciaPista } from './useAsistenciaPista';
import { resumirAsistencia, textoResumenAsistencia, type EstadoAsistencia } from './asistenciaPistaLogic';
import { GruposPistaTurno, nombreCortoPista, type GrupoPista } from './GruposPista';
import './PistaCabecera.css';

// Botón pequeño común de Trabajo en pista (WhatsApp, Llamar, Camiseta, Chaqueta).
const pildoraPista: React.CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: 26,
  padding: '3px 8px',
  borderRadius: 8,
  fontSize: 11,
  fontWeight: 900,
  lineHeight: 1.1,
  whiteSpace: 'nowrap',
};

type DailySummaryScreenProps = {
  ctx: Record<string, any>;
};

// «Ajustes en pista · hoy» (05/11): mismo aspecto para los cuatro botones.
// 20/11: botones tipo pastilla en una barra compacta; el activo, en verde lleno.
export function botonAjustePista(activo: boolean): React.CSSProperties {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    minHeight: 36,
    padding: '7px 14px',
    borderRadius: 999,
    border: `1px solid ${activo ? '#0f766e' : '#e2e8f0'}`,
    background: activo ? '#0f766e' : '#ffffff',
    color: activo ? '#ffffff' : '#0f172a',
    fontWeight: 800,
    fontSize: 13.5,
    lineHeight: 1.2,
    textAlign: 'center',
    whiteSpace: 'nowrap',
    cursor: 'pointer',
    boxShadow: activo ? '0 4px 12px rgba(15, 118, 110, .25)' : '0 1px 2px rgba(15, 23, 42, 0.05)',
  };
}

export function DailySummaryScreen({ ctx }: DailySummaryScreenProps) {
  // Chaqueta de entrenador: se marca SÍ / NO desde su grupo, igual que la
  // camiseta de los niños. Cambia el dato de su ficha (Entrenadores).
  const [guardandoChaquetaId, setGuardandoChaquetaId] = React.useState('');
  // 19/11 (Jose): vista nueva de los grupos en pista (uno abierto cada vez).
  // «Ver como antes» vuelve a la de siempre; se recuerda en este navegador.
  const [vistaPistaNueva, setVistaPistaNueva] = React.useState<boolean>(() => {
    try { return localStorage.getItem('mitico_pista_vista_v1') !== 'antes'; } catch { return true; }
  });
  const [grupoPistaAbierto, setGrupoPistaAbierto] = React.useState('');
  function cambiarVistaPista(nueva: boolean) {
    setVistaPistaNueva(nueva);
    try { localStorage.setItem('mitico_pista_vista_v1', nueva ? 'nueva' : 'antes'); } catch { /* sin almacenamiento */ }
  }
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
    cambiarEntrenadorGrupoAgenda,
    cambiarSegundoEntrenadorGrupoAgenda,
    claveDomAlumnoResumenDia,
    entrenadores,
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
    refrescarTrabajoPistaSesion,
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

  // 07/11: asistencia real de los grupos publicados del día (la misma que marca
  // el entrenador). Coordinación ve quién falta y puede marcar lo que falte.
  const gruposPublicadosDia: any[] = (sesionesResumenDia || []).flatMap((sesion: any) =>
    gruposPublicadosSesionResumenDia(sesion)
  );
  const asistencia = useAsistenciaPista(
    gruposPublicadosDia.map((grupo) => String(grupo.grupo_id || '')),
    ctx.consultarSupabase,
    ctx.ejecutarFuncion
  );
  function estadosAsistenciaGrupo(grupo: any): EstadoAsistencia[] {
    const grupoId = String(grupo.grupo_id || '');
    if (!grupoId) return [];
    return alumnosGrupoResumenDia(grupo)
      .map((texto: string) => fichaAlumnoResumenDiaDesdeTexto(texto)?.alumno_id)
      .filter(Boolean)
      .map((alumnoId: string) => asistencia.estadoDe(grupoId, alumnoId))
      .filter((estado: EstadoAsistencia | null): estado is EstadoAsistencia => estado !== null);
  }
  const resumenAsistenciaDia = resumirAsistencia(gruposPublicadosDia.flatMap(estadosAsistenciaGrupo));

  // Al buscar un niño, su grupo se abre en la vista nueva para poder verlo.
  React.useEffect(() => {
    if (grupoResumenDiaDestacado) setGrupoPistaAbierto(`resumen-grupo-${grupoResumenDiaDestacado}`);
  }, [grupoResumenDiaDestacado]);

  // Datos de cada grupo para la vista nueva. Las acciones son las de siempre.
  function datosGruposPista(sesion: any, gruposPublicados: any[], sesionOperativaId: string): GrupoPista[] {
    return gruposPublicados.map((grupo: any, indice: number) => {
      const claveGrupo = String(grupo.grupo_id || `${sesion.id}-${indice}`);
      const grupoIdAsistencia = String(grupo.grupo_id || '');
      const visual = String(nombreGrupoVisualApp(grupo, indice));
      const pistaTxt = String(grupo.pista || '').toLowerCase();
      const r = resumirAsistencia(estadosAsistenciaGrupo(grupo));
      const alumnosGrupo: string[] = alumnosGrupoResumenDia(grupo);
      const nombresEnt = [
        grupo.entrenador || grupo.entrenadores,
        grupo.entrenador_apoyo,
        grupo.entrenador_tercero,
      ].filter(Boolean).map((n: string) => nombreCortoPista(n));
      return {
        id: claveGrupo,
        domId: `resumen-grupo-${claveGrupo}`,
        titulo: `Grupo ${indice + 1}`,
        niveles: visual.includes(' · Nivel ') ? visual.split(' · Nivel ').slice(1).join(' · Nivel ') : visual,
        punto: String(grupo.punto_encuentro || '-'),
        pistaTexto: grupo.pista ? `Pista ${grupo.pista}` : 'Sin pista',
        pista: pistaTxt.includes('grande') ? 'grande' : pistaTxt.includes('peque') ? 'pequena' : 'otra',
        textoEntrenadores: nombresEnt.length ? nombresEnt.join(' + ') : 'SIN ENTRENADOR',
        sinEntrenador: !(grupo.entrenador || grupo.entrenadores),
        destacado: grupoResumenDiaDestacado === claveGrupo,
        entrenadores: groupTrainersJacket(grupo, entrenadores || []).map((e) => {
          const norm = (t: string) => textoSinAcentosGrupoApp(String(t || '')).trim();
          const esTercero = grupo.entrenador_tercero && norm(grupo.entrenador_tercero) === norm(e.nombre_completo);
          return {
            id: e.entrenador_id,
            nombre: nombreCortoPista(e.nombre_completo),
            rol: esTercero ? 'Tercero' : e.rol === 'apoyo' ? 'Apoyo' : null,
            chaqueta: e.chaqueta,
            guardando: guardandoChaquetaId === e.entrenador_id,
            ocupado: Boolean(guardandoChaquetaId),
            onChaqueta: () => void cambiarChaquetaEntrenador(e),
          };
        }),
        resumen: { presentes: r.presentes, ausentes: r.ausentes, sinMarcar: r.sinMarcar, total: alumnosGrupo.length },
        ninos: alumnosGrupo.map((alumno: string, alumnoIndice: number) => {
          const ficha = fichaAlumnoResumenDiaDesdeTexto(alumno);
          const telefono = telefonoAlumnoResumenDia(alumno);
          const [nombreAlumno, ...restoAlumno] = alumno.split(' · ');
          const estado =
            ficha?.alumno_id && grupoIdAsistencia ? asistencia.estadoDe(grupoIdAsistencia, ficha.alumno_id) : undefined;
          return {
            clave: `${grupo.grupo_id || indice}-${alumnoIndice}`,
            domId: `resumen-alumno-${claveGrupo}-${claveDomAlumnoResumenDia(alumno.split('·')[0])}`,
            nombre: nombreAlumno,
            detalle: restoAlumno.join(' · ').replace(/\bINICIACION\b/g, 'INICIACIÓN'),
            // Igual que la vista de siempre: sin fila de asistencia (null) no se puede marcar;
            // «Pendiente» es «sin marcar» y sí lleva ✓ / ✕.
            estado: estado === 'Presente' || estado === 'Ausente' ? estado : estado === 'Pendiente' ? null : undefined,
            guardandoAsistencia: Boolean(ficha?.alumno_id) && asistencia.guardando === `${grupoIdAsistencia}::${ficha?.alumno_id}`,
            asistenciaOcupada: Boolean(asistencia.guardando),
            destacado:
              grupoResumenDiaDestacado === claveGrupo &&
              Boolean(alumnoResumenDiaDestacado) &&
              textoSinAcentosGrupoApp(alumno.split('·')[0]) === alumnoResumenDiaDestacado,
            whatsapp: hrefWhatsappAlumnoResumenDia(telefono) || null,
            llamada: hrefTelefonoAlumnoResumenDia(telefono) || null,
            tieneFicha: Boolean(ficha),
            camisetaPendiente: ficha?.camiseta_entregada === false,
            guardandoCamiseta: Boolean(ficha?.alumno_id) && ficha?.alumno_id === guardandoCamisetaAlumnoId,
            onMarcar: (opcion: 'Presente' | 'Ausente') => {
              if (ficha?.alumno_id && grupoIdAsistencia) void asistencia.marcar(grupoIdAsistencia, ficha.alumno_id, opcion);
            },
            onCamiseta: () => {
              if (ficha) void actualizarCamisetaAlumnoResumenDia(ficha, ficha.camiseta_entregada === false);
            },
            onMover:
              sesionOperativaId && ficha?.alumno_id && grupo.grupo_id && gruposPublicados.length > 1
                ? () => {
                    if (!(ajustePistaSesionId === sesionOperativaId && ajustePistaModo === 'mover')) {
                      abrirAjustePistaSesion(sesionOperativaId, 'mover');
                    }
                    setMovimientoPistaAlumno(`${grupo.grupo_id}::${ficha.alumno_id}`);
                    setMovimientoPistaDestino('');
                    window.setTimeout(
                      () => document.getElementById(`ajuste-pista-${sesionOperativaId}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' }),
                      80
                    );
                  }
                : null,
          };
        }),
        // «Quién hace cada reporte» solo existe con dos entrenadores (como en la vista de siempre).
        reportes:
          grupo.grupo_id && grupo.entrenador_id && grupo.entrenador_apoyo_id ? (
            <ReportSplitPanel grupo={grupo} consultarSupabase={ctx.consultarSupabase} ejecutarFuncion={ctx.ejecutarFuncion} />
          ) : null,
        trabajo: grupo.trabajo_diario ? String(grupo.trabajo_diario) : null,
        observaciones: grupo.observaciones_importantes ? formatearObservaciones(grupo.observaciones_importantes) : null,
        hayObservaciones: Boolean(grupo.observaciones_importantes),
      };
    });
  }

  // 05/11: al entrar en Trabajo en pista sale el día que toca: hoy si hay
  // sesiones, y si no, el siguiente día con sesiones (no el último que se miró).
  React.useEffect(() => {
    let vivo = true;
    const hoy = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Europe/Madrid',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date());
    proximaFechaConSesiones(hoy)
      .then((fecha) => {
        if (vivo) setFechaResumenDia(fecha || hoy);
      })
      .catch(() => {
        if (vivo) setFechaResumenDia(hoy);
      });
    return () => {
      vivo = false;
    };
    // Solo al abrir la pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function cambiarChaquetaEntrenador(entrenador: {
    entrenador_id: string;
    nombre_completo: string;
    chaqueta: boolean;
  }) {
    if (guardandoChaquetaId) return;
    const entregada = !entrenador.chaqueta;
    setGuardandoChaquetaId(entrenador.entrenador_id);
    ctx.setError('');
    try {
      await ctx.ejecutarFuncion('actualizar_chaqueta_entrenador_app', {
        p_entrenador_id: entrenador.entrenador_id,
        p_entregada: entregada,
      });
      ctx.setEntrenadores((actuales: Array<{ entrenador_id: string }>) =>
        actuales.map((item) =>
          item.entrenador_id === entrenador.entrenador_id
            ? { ...item, chaqueta_entregada: entregada }
            : item
        )
      );
    } catch (err) {
      ctx.setError(
        err instanceof Error ? err.message : 'No se pudo actualizar la chaqueta.'
      );
    } finally {
      setGuardandoChaquetaId('');
    }
  }

  return (
    <>
      {pantalla === 'resumenDia' && (
        <section>
          <div
            className="pc-cab"
            style={{
              position: 'relative',
              overflow: 'hidden',
              padding: '14px 16px',
              borderRadius: 22,
              border: '1px solid rgba(15,118,110,.42)',
              background:
                'linear-gradient(135deg, #06283b 0%, #08384b 52%, #0f5c4d 100%)',
              boxShadow: '0 16px 36px rgba(6,40,59,.18)',
              color: '#ffffff',
              display: 'grid',
              gap: 12,
            }}
          >
            {/* 20/11: cabecera compacta: sin texto de explicación, cifras pequeñas y buscador en línea. */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                gap: 12,
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
                    margin: '2px 0 6px',
                    fontSize: 22,
                    letterSpacing: '-.01em',
                    color: '#ffffff',
                  }}
                >
                  Control del día
                </h2>
              {renderAyudaRapidaPantallaApp()}
              </div>

              {/* 06/11: semana con flechas y un botón por día (miércoles a domingo). */}
              <div style={{ flex: '1 1 320px', maxWidth: 440, minWidth: 0 }}>
                <SelectorDiaPista
                  fecha={fechaResumenDiaActiva}
                  hoy={new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date())}
                  onCambiar={(f) => setFechaResumenDia(f)}
                />
              </div>
            </div>

            <div className="pc-fila">
              <div className="pc-cifras">
                {(
                  [
                    ['sin marcar', String(resumenAsistenciaDia.sinMarcar), resumenAsistenciaDia.sinMarcar > 0 ? 'mal' : 'bien'],
                    ['publicados', `${totalPublicadosResumenDia}/${totalGruposResumenDia}`, totalPublicadosResumenDia === totalGruposResumenDia ? 'bien' : 'mal'],
                    ['niños', String(totalAlumnosResumenDia), ''],
                    ['sin entrenador', String(gruposPendientesEntrenadorResumenDia.length), gruposPendientesEntrenadorResumenDia.length === 0 ? 'bien' : 'mal'],
                    ['faltan hoy', String(resumenAsistenciaDia.ausentes), resumenAsistenciaDia.ausentes > 0 ? 'mal' : ''],
                  ] as Array<[string, string, string]>
                ).map(([etiqueta, valor, tono]) => (
                  <span key={etiqueta} className={`pc-cifra${tono ? ` is-${tono}` : ''}`}>
                    <b>{valor}</b>
                    {etiqueta}
                  </span>
                ))}
              </div>
              <label className="pc-buscar">
                <span aria-hidden="true">🔎</span>
                <input
                  type="search"
                  value={busquedaAlumnoResumenDia}
                  onChange={(e) => setBusquedaAlumnoResumenDia(e.target.value)}
                  placeholder="Buscar niño en los grupos…"
                  aria-label="Buscar alumno en los grupos publicados"
                />
              </label>
            </div>

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
              // 20/11: solo sale si falta entregar alguna camiseta.
              if (pendientesCamiseta.length === 0) return null;

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

            {/* 16/11: «Mensaje a los entrenadores» se quita de aquí: está en Mensajes internos. */}
            {(() => {
              const sinChaqueta = trainersMissingJacket(
                sesionesResumenDia.flatMap((sesion: any) => gruposPublicadosSesionResumenDia(sesion)),
                entrenadores || []
              );
              if (sinChaqueta.length === 0) return null;

              return (
                <div
                  style={{
                    display: 'grid',
                    gap: 9,
                    padding: '12px 14px',
                    borderRadius: 16,
                    border: '1px solid rgba(244,114,182,.72)',
                    background: 'linear-gradient(135deg,rgba(131,24,67,.42),rgba(80,7,36,.30))',
                  }}
                >
                  <div>
                    <strong style={{ display: 'block', color: '#fbcfe8', fontSize: 13 }}>
                      CHAQUETAS DE ENTRENADOR
                    </strong>
                    <span style={{ color: '#ffffff', fontWeight: 900, fontSize: 16 }}>
                      Lleva {sinChaqueta.length} chaqueta{sinChaqueta.length === 1 ? '' : 's'} hoy
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {sinChaqueta.map((entrenador) => (
                      <span
                        key={`chaqueta-pendiente-${entrenador.entrenador_id}`}
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
                        🧥 {entrenador.nombre_completo}
                      </span>
                    ))}
                  </div>
                  <span style={{ color: '#fce7f3', fontSize: 12 }}>
                    Cuando se la des, pulsa «🧥 Nombre: NO» en su grupo y pasará a SÍ.
                  </span>
                </div>
              );
            })()}

          </div>

          {gruposPendientesEntrenadorResumenDia.length > 0 && (
            <div style={avisoPendiente}>
              Hay {gruposPendientesEntrenadorResumenDia.length} grupo(s) sin entrenador asignado para este día.
            </div>
          )}

          <div style={{ display: 'grid', gap: 12, marginTop: 16 }}>
            {asistencia.error && (
              <div style={{ ...avisoPendiente, marginBottom: 10 }}>
                Asistencia: {asistencia.error}
              </div>
            )}
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
                        {(() => {
                          const texto = textoResumenAsistencia(
                            resumirAsistencia(gruposPublicados.flatMap(estadosAsistenciaGrupo))
                          );
                          return texto ? (
                            <span style={{ fontSize: 13, fontWeight: 800, opacity: 0.92 }}>
                              Asistencia: {texto}
                            </span>
                          ) : null;
                        })()}
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
                              id={`ajuste-pista-${sesionOperativaId}`}
                              style={{
                                gridColumn: '1 / -1',
                                scrollMarginTop: 70,
                                padding: panelActivo ? 12 : '4px 0',
                                borderRadius: 16,
                                border: panelActivo ? '1px solid #bae6d3' : '1px solid transparent',
                                background: panelActivo ? '#f8fafc' : 'transparent',
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
                                {/* 20/11: barra compacta. La explicación larga va en la ayuda (title)
                                    y, resumida, solo cuando hay un ajuste abierto. */}
                                <strong
                                  title="Cambios reales del turno. Se actualizan listado, asistencia, observaciones y responsable del reporte. El trabajo diario no se sobrescribe: el alumno usa el del grupo en el que queda hoy."
                                  style={{ color: '#64748b', fontSize: 11, fontWeight: 900, letterSpacing: '.08em', textTransform: 'uppercase', whiteSpace: 'nowrap' }}
                                >
                                  Ajustes de hoy
                                </strong>
                                <div
                                  style={{
                                    flex: '1 1 300px',
                                    minWidth: 0,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 6,
                                  }}
                                >
                                  <button
                                    type="button"
                                    disabled={guardandoAjustePista}
                                    onClick={() => abrirAjustePistaSesion(sesionOperativaId, 'mover')}
                                    style={botonAjustePista(panelActivo && ajustePistaModo === 'mover')}
                                  >
                                    🔀 Mover alumno
                                  </button>
                                  <button
                                    type="button"
                                    disabled={guardandoAjustePista}
                                    onClick={() => abrirAjustePistaSesion(sesionOperativaId, 'anadir')}
                                    style={botonAjustePista(panelActivo && ajustePistaModo === 'anadir')}
                                  >
                                    ➕ Añadir alumno hoy
                                  </button>
                                  <SessionPlanButton
                                    fecha={String(sesion.fecha || '')}
                                    hora={horaCorta(sesion.hora_inicio)}
                                    style={botonAjustePista(false)}
                                  />
                                  {sesion.origen !== 'intensivo' && (
                                    <button
                                      type="button"
                                      disabled={guardandoAjustePista}
                                      onClick={() => abrirAjustePistaSesion(sesionOperativaId, 'entrenadores')}
                                      style={botonAjustePista(panelActivo && ajustePistaModo === 'entrenadores')}
                                    >
                                      👥 Entrenadores
                                    </button>
                                  )}
                                </div>
                              </div>

                              {panelActivo && (
                                <p style={{ margin: 0, color: '#64748b', fontSize: 12, lineHeight: 1.4 }}>
                                  Solo cambia el turno de hoy (listado, asistencia y quién hace el reporte). El trabajo diario es el del grupo en el que queda.
                                </p>
                              )}

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
                                        gruposPublicados,
                                        String(sesion.modalidad || '')
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

                              {panelActivo && ajustePistaModo === 'entrenadores' && sesion.origen !== 'intensivo' && (
                                <TrackTrainerAdjustPanel
                                  grupos={gruposPublicados}
                                  entrenadores={entrenadores || []}
                                  nombreGrupoVisual={nombreGrupoVisualApp}
                                  onCambiarPrincipal={async (grupo, entrenadorId, excepcional) => {
                                    await cambiarEntrenadorGrupoAgenda(grupo, entrenadorId, excepcional);
                                    await refrescarTrabajoPistaSesion(sesionOperativaId);
                                  }}
                                  onCambiarApoyo={async (grupo, entrenadorId) => {
                                    await cambiarSegundoEntrenadorGrupoAgenda(grupo, entrenadorId);
                                    await refrescarTrabajoPistaSesion(sesionOperativaId);
                                  }}
                                  labelCampo={labelCampo}
                                  inputCampo={inputCampo}
                                />
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
                        ) : vistaPistaNueva ? (
                          <>
                            <div className="gpi-vista" role="group" aria-label="Forma de ver los grupos" style={{ gridColumn: '1 / -1' }}>
                              <button type="button" className="is-activa" onClick={() => cambiarVistaPista(true)}>Vista nueva</button>
                              <button type="button" onClick={() => cambiarVistaPista(false)}>Ver como antes</button>
                            </div>
                            <GruposPistaTurno
                              grupos={datosGruposPista(
                                sesion,
                                gruposPublicados,
                                String(sesion.agendaDirecta?.sesion_id || sesion.dia?.sesion_id || '')
                              )}
                              abierto={
                                grupoPistaAbierto ||
                                (gruposPublicados.length === 1
                                  ? `resumen-grupo-${String(gruposPublicados[0].grupo_id || `${sesion.id}-0`)}`
                                  : '')
                              }
                              onAbrir={(domId) => setGrupoPistaAbierto(domId || ' ')}
                            />
                          </>
                        ) : (
                          <>
                          <div className="gpi-vista" role="group" aria-label="Forma de ver los grupos" style={{ gridColumn: '1 / -1' }}>
                            <button type="button" onClick={() => cambiarVistaPista(true)}>Vista nueva</button>
                            <button type="button" className="is-activa" onClick={() => cambiarVistaPista(false)}>Ver como antes</button>
                          </div>
                          {gruposPublicados.map((grupo: any, indice: number) => {
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
                                {/* Cabecera en filas: así no se aprieta cuando hay 4 grupos por fila. */}
                                <div style={{ display: 'grid', gap: 6, minWidth: 0 }}>
                                  <strong style={{ fontSize: 15, lineHeight: 1.2, overflowWrap: 'anywhere' }}>
                                    {nombreGrupoVisualApp(grupo, indice)}
                                  </strong>
                                  <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                                    <span style={{ ...miniBadge, background: '#0f172a', color: '#fff' }}>
                                      PUNTO {grupo.punto_encuentro || '-'}
                                    </span>
                                    <span style={{ ...miniBadge, background: '#dbeafe', color: '#1e3a8a' }}>
                                      {grupo.pista || 'SIN PISTA'}
                                    </span>
                                  </div>
                                  <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.35, color: '#475569', overflowWrap: 'anywhere' }}>
                                    <strong style={{ color: grupo.entrenador || grupo.entrenadores ? '#0f172a' : '#b45309' }}>
                                      {grupo.entrenador || grupo.entrenadores || 'SIN ENTRENADOR'}
                                    </strong>
                                    {grupo.entrenador_apoyo && <> · Apoyo: {grupo.entrenador_apoyo}</>}
                                    {grupo.entrenador_tercero && <> · Tercero: {grupo.entrenador_tercero}</>}
                                  </p>
                                  {/* Chaqueta de cada entrenador del grupo: pulsar cambia SÍ / NO en su ficha. */}
                                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                                    {groupTrainersJacket(grupo, entrenadores || []).map((entrenadorGrupo) => {
                                      const guardando = guardandoChaquetaId === entrenadorGrupo.entrenador_id;
                                      const nombreCorto =
                                        entrenadorGrupo.nombre_completo.split(/\s+/)[0].charAt(0).toUpperCase() +
                                        entrenadorGrupo.nombre_completo.split(/\s+/)[0].slice(1).toLowerCase();
                                      return (
                                        <button
                                          type="button"
                                          key={`chaqueta-${grupo.grupo_id}-${entrenadorGrupo.entrenador_id}`}
                                          disabled={Boolean(guardandoChaquetaId)}
                                          onClick={() => void cambiarChaquetaEntrenador(entrenadorGrupo)}
                                          title={
                                            entrenadorGrupo.chaqueta
                                              ? `Marcar que ${entrenadorGrupo.nombre_completo} ya NO tiene chaqueta`
                                              : `Marcar que ${entrenadorGrupo.nombre_completo} ya tiene chaqueta`
                                          }
                                          style={{
                                            ...pildoraPista,
                                            border: entrenadorGrupo.chaqueta ? '1px solid #bbf7d0' : '1px solid #f9a8d4',
                                            background: entrenadorGrupo.chaqueta ? '#f0fdf4' : '#fdf2f8',
                                            color: entrenadorGrupo.chaqueta ? '#15803d' : '#be185d',
                                            cursor: guardando ? 'wait' : 'pointer',
                                            opacity: guardandoChaquetaId && !guardando ? 0.65 : 1,
                                          }}
                                        >
                                          {guardando
                                            ? 'Guardando…'
                                            : `🧥 ${nombreCorto}: ${entrenadorGrupo.chaqueta ? 'SÍ' : 'NO'}`}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div style={{ marginTop: 12 }}>
                                  <strong style={{ display: 'block', marginBottom: 6 }}>
                                    Alumnos ({alumnosGrupo.length})
                                    {(() => {
                                      const r = resumirAsistencia(estadosAsistenciaGrupo(grupo));
                                      const texto = textoResumenAsistencia(r);
                                      return texto ? (
                                        <span
                                          style={{
                                            marginLeft: 6,
                                            fontSize: 12,
                                            fontWeight: 900,
                                            color: r.ausentes ? '#b91c1c' : r.sinMarcar ? '#b45309' : '#15803d',
                                          }}
                                        >
                                          · {texto}
                                        </span>
                                      ) : null;
                                    })()}
                                  </strong>
                                  {alumnosGrupo.length > 0 ? (
                                    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
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

                                            const [nombreAlumno, ...restoAlumno] = alumno.split(' · ');
                                            const grupoIdAsistencia = String(grupo.grupo_id || '');
                                            const estadoAsistencia =
                                              ficha?.alumno_id && grupoIdAsistencia
                                                ? asistencia.estadoDe(grupoIdAsistencia, ficha.alumno_id)
                                                : null;
                                            const guardandoAsistencia =
                                              Boolean(ficha?.alumno_id) &&
                                              asistencia.guardando === `${grupoIdAsistencia}::${ficha?.alumno_id}`;

                                            // Dos líneas: nombre a todo lo ancho y debajo todos sus botones pequeños.
                                            return (
                                              <div style={{ display: 'grid', gap: 4, minWidth: 0 }}>
                                                <span style={{ fontSize: 13.5, lineHeight: 1.25, overflowWrap: 'anywhere' }}>
                                                  {estadoAsistencia === 'Ausente' && (
                                                    <span style={{ ...pildoraPista, minHeight: 0, padding: '1px 6px', marginRight: 5, background: '#b91c1c', color: '#fff' }}>
                                                      FALTA
                                                    </span>
                                                  )}
                                                  <strong
                                                    style={{
                                                      color: estadoAsistencia === 'Ausente' ? '#b91c1c' : '#172033',
                                                      textDecoration: estadoAsistencia === 'Ausente' ? 'line-through' : undefined,
                                                    }}
                                                  >
                                                    {estadoAsistencia === 'Presente' ? '✓ ' : ''}
                                                    {nombreAlumno}
                                                  </strong>
                                                  {restoAlumno.length > 0 && (
                                                    <span style={{ color: '#64748b', fontWeight: 700 }}>
                                                      {' · '}
                                                      {restoAlumno.join(' · ')}
                                                    </span>
                                                  )}
                                                </span>

                                                <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', alignItems: 'center' }}>
                                                  {estadoAsistencia !== null && ficha?.alumno_id && (
                                                    <>
                                                      {(['Presente', 'Ausente'] as const).map((opcion) => {
                                                        const activo = estadoAsistencia === opcion;
                                                        const esPresente = opcion === 'Presente';
                                                        return (
                                                          <button
                                                            type="button"
                                                            key={opcion}
                                                            disabled={Boolean(asistencia.guardando)}
                                                            onClick={() =>
                                                              void asistencia.marcar(grupoIdAsistencia, ficha.alumno_id, opcion)
                                                            }
                                                            title={
                                                              activo
                                                                ? 'Pulsa otra vez para dejarlo sin marcar'
                                                                : esPresente
                                                                ? 'Marcar que ha venido'
                                                                : 'Marcar que falta'
                                                            }
                                                            style={{
                                                              ...pildoraPista,
                                                              border: `1px solid ${esPresente ? '#16a34a' : '#dc2626'}`,
                                                              background: activo ? (esPresente ? '#16a34a' : '#dc2626') : '#ffffff',
                                                              color: activo ? '#ffffff' : esPresente ? '#15803d' : '#b91c1c',
                                                              cursor: guardandoAsistencia ? 'wait' : 'pointer',
                                                              opacity: asistencia.guardando && !guardandoAsistencia ? 0.65 : 1,
                                                            }}
                                                          >
                                                            {guardandoAsistencia && activo ? '…' : esPresente ? '✓ Viene' : '✗ Falta'}
                                                          </button>
                                                        );
                                                      })}
                                                    </>
                                                  )}
                                                  {whatsapp && (
                                                    <a
                                                      href={whatsapp}
                                                      target="_blank"
                                                      rel="noreferrer"
                                                      style={{
                                                        ...pildoraPista,
                                                        border: '1px solid #bbf7d0',
                                                        background: '#f0fdf4',
                                                        color: '#15803d',
                                                        textDecoration: 'none',
                                                      }}
                                                    >
                                                      WhatsApp
                                                    </a>
                                                  )}
                                                  {llamada && (
                                                    <a
                                                      href={llamada}
                                                      style={{
                                                        ...pildoraPista,
                                                        border: '1px solid #bfdbfe',
                                                        background: '#eff6ff',
                                                        color: '#1d4ed8',
                                                        textDecoration: 'none',
                                                      }}
                                                    >
                                                      Llamar
                                                    </a>
                                                  )}
                                                  {ficha && (
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
                                                        ...pildoraPista,
                                                        border: camisetaPendiente ? '1px solid #f9a8d4' : '1px solid #bbf7d0',
                                                        background: camisetaPendiente ? '#fdf2f8' : '#f0fdf4',
                                                        color: camisetaPendiente ? '#be185d' : '#15803d',
                                                        cursor: guardandoCamiseta ? 'wait' : 'pointer',
                                                        opacity: guardandoCamiseta ? 0.65 : 1,
                                                      }}
                                                    >
                                                      {guardandoCamiseta
                                                        ? 'Guardando…'
                                                        : camisetaPendiente
                                                        ? '🎽 Camiseta: NO · ENTREGAR'
                                                        : 'Camiseta: SÍ'}
                                                    </button>
                                                  )}
                                                </div>
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

                                {/* Dos entrenadores: quién hace el reporte de cada niño. */}
                                <ReportSplitPanel
                                  grupo={grupo}
                                  consultarSupabase={ctx.consultarSupabase}
                                  ejecutarFuncion={ctx.ejecutarFuncion}
                                />

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
                          })}
                          </>
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

