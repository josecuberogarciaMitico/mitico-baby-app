import React, { useState } from 'react';
import { FamilyEvaluationDraftPanel } from '../../components/evaluations/FamilyEvaluationDraftPanel';
import { StudentHistoryPanel } from '../../components/students/StudentHistoryPanel';
import { buildMasterStudentProfile } from '../../core/students/masterStudent';
import type { IntensivoAlumnoApp } from '../intensivos/intensiveTypes';

type StudentRecordsScreenProps = {
  ctx: Record<string, any>;
};

export function StudentRecordsScreen({ ctx }: StudentRecordsScreenProps) {
  const [filtroFichasIntensivos, setFiltroFichasIntensivos] = useState<
    'todos' | 'en_curso' | 'recuperar' | 'finalizados'
  >('todos');
  const [busquedaFichasIntensivos, setBusquedaFichasIntensivos] = useState('');
  const {
    abrirEvaluacionAlumno,
    abrirFiltroFichas,
    abrirPanelIntensivo,
    agendaBadgeModalidad,
    agendaBloqueBlanco,
    agendaHero,
    alternarHistorialAlumnoFichaApp,
    alumnoEditCamiseta,
    alumnoEditFechaNacimiento,
    alumnoEditNivel,
    alumnoEditNombre,
    alumnoEditOrigen,
    alumnoEditTelefono,
    alumnoEditandoId,
    alumnos,
    alumnosBabyIntensivos,
    alumnosFiltrados,
    anadiendoFichaAIntensivoId,
    avisoNeutral,
    avisoPendiente,
    añadirFichaExistenteAIntensivo,
    bloqueIdentidadFichaAlumnoApp,
    borrarAlumnoBase,
    botonMenu,
    botonMini,
    botonPeligroMini,
    botonPrincipal,
    botonSecundario,
    buscador,
    busquedaAlumno,
    cargando,
    cargarAlumnos,
    cargarIntensivos,
    cerrarEditorAlumnoBase,
    copiarEvaluacionAlumnoTexto,
    datosBasicosFichaAlumnoApp,
    editarAlumnoBaseRapido,
    esVistaMovilApp,
    evaluacionAlumnoActivaId,
    evaluacionAlumnoTexto,
    filtroAlumnos,
    filtroModalidadHistorialFicha,
    formatearFecha,
    gridFormulario,
    guardarAlumnoBase,
    historialAlumnoAbiertoId,
    historialReportesFichaCargandoId,
    historialReportesFichaPorAlumno,
    inputCampo,
    intensivoAlumnos,
    intensivoAsistencias,
    intensivoDias,
    intensivoFichaSeleccionado,
    intensivoMás,
    intensivos,
    labelCampo,
    miniBadge,
    miniTarjetaBlanca,
    ocioAlumnos,
    opcionesNivel,
    pantalla,
    perfilOperativoAlumnoApp,
    renderAyudaRapidaPantallaApp,
    reportesDetalleIntensivo,
    resumenFinalIntensivo,
    selectCampo,
    selectorIntensivoFichaAbiertoId,
    setAlumnoEditCamiseta,
    setAlumnoEditFechaNacimiento,
    setAlumnoEditNivel,
    setAlumnoEditNombre,
    setAlumnoEditOrigen,
    setAlumnoEditTelefono,
    setBusquedaAlumno,
    setBusquedaOcio,
    setEvaluacionAlumnoActivaId,
    setEvaluacionAlumnoTexto,
    setFiltroAlumnos,
    setFiltroDiaFichasOcio,
    setFiltroModalidadHistorialFicha,
    setIntensivoCursoAbiertoId,
    setIntensivoFichaSeleccionado,
    setPantalla,
    setSelectorIntensivoFichaAbiertoId,
    setVistaFichasAlumnos,
    tarjeta,
    vistaFichasAlumnos,
  } = ctx;

  return (
    <>
      {pantalla === 'alumnos' &&
        (() => {
          const totalFichas = alumnosBabyIntensivos.length;
          const totalSinNivel = alumnosBabyIntensivos.filter(
            (alumno) =>
              !(
                alumno.nivel_actual ||
                alumno.ultimo_nivel_reportado ||
                alumno.nivel_estimado
              )
          ).length;
          const totalSinReportes = alumnosBabyIntensivos.filter(
            (alumno) => Number(alumno.total_reportes || 0) === 0
          ).length;
          const totalRevisarFicha = alumnosBabyIntensivos.filter((alumno) =>
            String(alumno.estado_ficha || '')
              .toLowerCase()
              .includes('revis')
          ).length;

          const inscripcionIntensivoMasRecientePorAlumno = new Map<
            string,
            IntensivoAlumnoApp
          >();

          intensivoAlumnos.forEach((registro) => {
            const anterior =
              inscripcionIntensivoMasRecientePorAlumno.get(registro.alumno_id);

            if (!anterior) {
              inscripcionIntensivoMasRecientePorAlumno.set(
                registro.alumno_id,
                registro
              );
              return;
            }

            const cursoRegistro = intensivos.find(
              (item) => item.intensivo_id === registro.intensivo_id
            );
            const cursoAnterior = intensivos.find(
              (item) => item.intensivo_id === anterior.intensivo_id
            );

            const fechaRegistro =
              cursoRegistro?.fecha_fin ||
              cursoRegistro?.fecha_inicio ||
              registro.created_at ||
              '';
            const fechaAnterior =
              cursoAnterior?.fecha_fin ||
              cursoAnterior?.fecha_inicio ||
              anterior.created_at ||
              '';

            if (fechaRegistro >= fechaAnterior) {
              inscripcionIntensivoMasRecientePorAlumno.set(
                registro.alumno_id,
                registro
              );
            }
          });

          const fichasIntensivosGlobales = Array.from(
            inscripcionIntensivoMasRecientePorAlumno.values()
          )
            .map((registro) => {
              const curso = intensivos.find(
                (item) => item.intensivo_id === registro.intensivo_id
              );
              const resumenFinal = resumenFinalIntensivo.find(
                (item) =>
                  item.intensivo_id === registro.intensivo_id &&
                  item.alumno_id === registro.alumno_id
              );
              const fichaMaestra = alumnos.find(
                (item) => item.alumno_id === registro.alumno_id
              );
              const diasCurso = intensivoDias.filter(
                (item) => item.intensivo_id === registro.intensivo_id
              );
              const recuperacionesActivas = intensivoMás.filter(
                (item) =>
                  item.alumno_id === registro.alumno_id &&
                  item.estado !== 'Resuelta' &&
                  item.estado !== 'Descartada'
              );
              const faltasRealesPendientes = intensivoAsistencias.filter(
                (item) =>
                  item.intensivo_id === registro.intensivo_id &&
                  item.alumno_id === registro.alumno_id &&
                  ['NO_PRESENTADO', 'BAJA_AVISADA'].includes(
                    String(item.estado || '')
                  )
              );

              const totalDias =
                Number(resumenFinal?.total_dias_intensivo || 0) ||
                diasCurso.length ||
                4;
              const diasPresentes = Number(resumenFinal?.dias_presente || 0);
              const diasAusentes = Number(resumenFinal?.dias_ausente || 0);
              const diasPendientes = Number(
                resumenFinal?.dias_pendiente_asistencia || 0
              );
              const totalReportes = Number(resumenFinal?.total_reportes || 0);
              const reportesAlumno = reportesDetalleIntensivo
                .filter(
                  (item) =>
                    item.intensivo_id === registro.intensivo_id &&
                    item.alumno_id === registro.alumno_id
                )
                .sort((a, b) =>
                  `${a.fecha || ''}-${a.numero_dia || 0}`.localeCompare(
                    `${b.fecha || ''}-${b.numero_dia || 0}`
                  )
                );
              const primerReporte = reportesAlumno[0];
              const ultimoReporte =
                reportesAlumno[reportesAlumno.length - 1];

              const nivelEntrada =
                primerReporte?.nivel_reportado ||
                fichaMaestra?.nivel_estimado ||
                fichaMaestra?.nivel_actual ||
                'SIN NIVEL';
              const nivelFinal =
                resumenFinal?.nivel_final_confirmado ||
                resumenFinal?.nivel_final_propuesto ||
                resumenFinal?.nivel_ultimo_reporte ||
                ultimoReporte?.nivel_reportado ||
                fichaMaestra?.nivel_actual ||
                fichaMaestra?.ultimo_nivel_reportado ||
                fichaMaestra?.nivel_estimado ||
                'SIN NIVEL';
              const nivel = nivelFinal;
              const sesionesRegistradas = Math.min(
                totalDias,
                diasPresentes + diasAusentes
              );
              const finalizado = resumenFinal?.estado_diploma === 'Revisado';
              const pendienteRecuperar =
                recuperacionesActivas.length > 0 ||
                faltasRealesPendientes.length > 0;
              return {
                registro,
                curso,
                resumenFinal,
                fichaMaestra,
                recuperacionesActivas,
                faltasRealesPendientes,
                totalDias,
                diasPresentes,
                diasAusentes,
                diasPendientes,
                totalReportes,
                reportesAlumno,
                primerReporte,
                ultimoReporte,
                nivelEntrada,
                nivelFinal,
                nivel,
                sesionesRegistradas,
                finalizado,
                pendienteRecuperar,
              };
            })
            .filter((ficha) => {
              const buscado = busquedaFichasIntensivos.trim().toLowerCase();
              const texto = `${ficha.registro.alumno} ${
                ficha.curso?.intensivo || ''
              } ${ficha.nivel}`.toLowerCase();

              if (buscado && !texto.includes(buscado)) return false;
              if (filtroFichasIntensivos === 'en_curso') {
                return !ficha.finalizado;
              }
              if (filtroFichasIntensivos === 'recuperar') {
                return ficha.pendienteRecuperar;
              }
              if (filtroFichasIntensivos === 'finalizados') {
                return ficha.finalizado;
              }
              return true;
            })
            .sort((a, b) =>
              String(a.registro.alumno || '').localeCompare(
                String(b.registro.alumno || ''),
                'es'
              )
            );

          const totalFichasIntensivos = new Set(
            intensivoAlumnos.map((registro) => registro.alumno_id)
          ).size;

          const alumnosPendientesRecuperarGlobal = new Set<string>();

          intensivoMás
            .filter(
              (registro) =>
                registro.estado !== 'Resuelta' &&
                registro.estado !== 'Descartada'
            )
            .forEach((registro) =>
              alumnosPendientesRecuperarGlobal.add(registro.alumno_id)
            );

          intensivoAsistencias
            .filter((registro) =>
              ['NO_PRESENTADO', 'BAJA_AVISADA'].includes(
                String(registro.estado || '')
              )
            )
            .forEach((registro) =>
              alumnosPendientesRecuperarGlobal.add(registro.alumno_id)
            );

          const totalRecuperacionesFichas =
            alumnosPendientesRecuperarGlobal.size;

          const totalFinalizadosFichas = Array.from(
            inscripcionIntensivoMasRecientePorAlumno.values()
          ).filter((registro) =>
            resumenFinalIntensivo.some(
              (item) =>
                item.intensivo_id === registro.intensivo_id &&
                item.alumno_id === registro.alumno_id &&
                item.estado_diploma === 'Revisado'
            )
          ).length;

          const estiloFichaHero = {
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

          const tarjetaMetricaFicha = (color: string, fondo: string) => ({
            ...miniTarjetaBlanca,
            border: `1px solid ${color}33`,
            background: fondo,
            minHeight: 82,
            display: 'grid',
            alignContent: 'center',
          });

          const badgeNivelFicha = (nivel: string) => {
            const limpio = String(nivel || 'SIN NIVEL').toUpperCase();
            let color = '#64748b';
            let fondo = '#f8fafc';
            if (limpio.includes('INICIACION') || limpio === 'A') {
              color = '#16a34a';
              fondo = '#f0fdf4';
            }
            if (limpio === 'A+' || limpio === 'B') {
              color = '#2563eb';
              fondo = '#eff6ff';
            }
            if (limpio.includes('B+') || limpio === 'C') {
              color = '#f97316';
              fondo = '#fff7ed';
            }
            if (limpio.includes('C+') || limpio.includes('D')) {
              color = '#7c3aed';
              fondo = '#f5f3ff';
            }
            if (limpio.includes('SIN')) {
              color = '#dc2626';
              fondo = '#fef2f2';
            }
            return {
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '7px 12px',
              borderRadius: 999,
              border: `1px solid ${color}40`,
              background: fondo,
              color,
              fontWeight: 900,
              fontSize: 13,
              letterSpacing: 0.2,
            };
          };

          const estiloTarjetaAlumno = (nivel: string) => {
            const limpio = String(nivel || '').toUpperCase();
            let borde = '#dbeafe';
            let fondo = 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)';
            if (limpio.includes('INICIACION') || limpio === 'A') {
              borde = '#bbf7d0';
              fondo = 'linear-gradient(135deg, #ffffff 0%, #f0fdf4 100%)';
            }
            if (limpio === 'A+' || limpio === 'B') {
              borde = '#bfdbfe';
              fondo = 'linear-gradient(135deg, #ffffff 0%, #eff6ff 100%)';
            }
            if (limpio.includes('B+') || limpio === 'C') {
              borde = '#fed7aa';
              fondo = 'linear-gradient(135deg, #ffffff 0%, #fff7ed 100%)';
            }
            if (limpio.includes('C+') || limpio.includes('D')) {
              borde = '#ddd6fe';
              fondo = 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)';
            }
            if (!limpio || limpio.includes('SIN')) {
              borde = '#fecaca';
              fondo = 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)';
            }
            return {
              ...tarjeta,
              border: `1px solid ${borde}`,
              background: fondo,
              boxShadow: '0 14px 30px rgba(15, 23, 42, 0.07)',
              width: '100%',
              maxWidth: '100%',
              minWidth: 0,
              boxSizing: 'border-box' as const,
              overflowWrap: 'anywhere' as const,
            };
          };

          return (
            <section
              style={{
                display: 'grid',
                gap: 16,
                width: '100%',
                maxWidth: '100%',
                minWidth: 0,
                boxSizing: 'border-box',
              }}
            >
              <article
                style={{
                  ...estiloFichaHero,
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
                    {vistaFichasAlumnos === 'intensivos'
                      ? 'Alumnos Intensivos'
                      : 'Alumnos Baby'}
                  </h2>
                  <p
                    style={{
                      margin: 0,
                      color: '#cbd5e1',
                      fontWeight: 650,
                      fontSize: 13,
                      minWidth: 0,
                      maxWidth: 720,
                      whiteSpace: 'normal',
                      overflowWrap: 'anywhere',
                      lineHeight: 1.45,
                    }}
                  >
                    {vistaFichasAlumnos === 'intensivos'
                      ? 'Seguimiento global de los alumnos que están o han estado en Intensivos.'
                      : 'Fichas maestras de alumnos Baby y seguimiento de su nivel real.'}
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
                      label: `Alumnos Baby (${totalFichas})`,
                      active: vistaFichasAlumnos === 'general',
                      onClick: () => setVistaFichasAlumnos('general'),
                    },
                    {
                      key: 'intensivos',
                      label: `Alumnos Intensivos (${totalFichasIntensivos})`,
                      active: vistaFichasAlumnos === 'intensivos',
                      onClick: () => setVistaFichasAlumnos('intensivos'),
                    },
                    {
                      key: 'ocio',
                      label: `Alumnos Ocio (${ocioAlumnos.length})`,
                      active: false,
                      onClick: () => {
                        setFiltroDiaFichasOcio('');
                        setBusquedaOcio('');
                        setPantalla('ocioAlumnos');
                      },
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
                      cargarAlumnos();
                      if (vistaFichasAlumnos === 'intensivos') {
                        cargarIntensivos();
                      }
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

              {vistaFichasAlumnos === 'intensivos' && (
                <>
                  <article
                    style={{
                      ...agendaBloqueBlanco,
                      border: '1px solid #fed7aa',
                      background:
                        'linear-gradient(135deg, #fff7ed 0%, #ffffff 62%)',
                    }}
                  >
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns:
                          'repeat(auto-fit, minmax(150px, 1fr))',
                        gap: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setFiltroFichasIntensivos('todos')}
                        style={{
                          ...tarjetaMetricaFicha('#f97316', '#fff7ed'),
                          cursor: 'pointer',
                          textAlign: 'left',
                          font: 'inherit',
                        }}
                      >
                        <span style={{ color: '#64748b', fontWeight: 800, fontSize: 12 }}>
                          ALUMNOS INTENSIVOS
                        </span>
                        <strong style={{ fontSize: 28 }}>{totalFichasIntensivos}</strong>
                        <span>ver todos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFiltroFichasIntensivos('recuperar')}
                        style={{
                          ...tarjetaMetricaFicha('#f59e0b', '#fffbeb'),
                          cursor: 'pointer',
                          textAlign: 'left',
                          font: 'inherit',
                        }}
                      >
                        <span style={{ color: '#64748b', fontWeight: 800, fontSize: 12 }}>
                          PENDIENTES RECUPERAR
                        </span>
                        <strong style={{ fontSize: 28 }}>{totalRecuperacionesFichas}</strong>
                        <span>ver alumnos</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFiltroFichasIntensivos('finalizados')}
                        style={{
                          ...tarjetaMetricaFicha('#16a34a', '#f0fdf4'),
                          cursor: 'pointer',
                          textAlign: 'left',
                          font: 'inherit',
                        }}
                      >
                        <span style={{ color: '#64748b', fontWeight: 800, fontSize: 12 }}>
                          FINALIZADOS
                        </span>
                        <strong style={{ fontSize: 28 }}>{totalFinalizadosFichas}</strong>
                        <span>ver evaluaciones</span>
                      </button>
                    </div>
                  </article>

                  <article style={agendaBloqueBlanco}>
                    <input
                      value={busquedaFichasIntensivos}
                      onChange={(e) =>
                        setBusquedaFichasIntensivos(e.target.value)
                      }
                      placeholder="Buscar alumno o intensivo..."
                      style={{ ...buscador, margin: 0 }}
                    />

                    <div
                      style={{
                        display: 'flex',
                        gap: 8,
                        flexWrap: 'wrap',
                        marginTop: 10,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => setFiltroFichasIntensivos('todos')}
                        style={botonMenu(filtroFichasIntensivos === 'todos')}
                      >
                        Todos
                      </button>
                      <button
                        type="button"
                        onClick={() => setFiltroFichasIntensivos('en_curso')}
                        style={botonMenu(filtroFichasIntensivos === 'en_curso')}
                      >
                        En curso
                      </button>
                      <button
                        type="button"
                        onClick={() => setFiltroFichasIntensivos('recuperar')}
                        style={botonMenu(filtroFichasIntensivos === 'recuperar')}
                      >
                        Pendientes recuperar
                      </button>
                      <button
                        type="button"
                        onClick={() => setFiltroFichasIntensivos('finalizados')}
                        style={botonMenu(filtroFichasIntensivos === 'finalizados')}
                      >
                        Finalizados
                      </button>
                    </div>
                  </article>

                  {fichasIntensivosGlobales.length === 0 && !cargando && (
                    <article style={agendaBloqueBlanco}>
                      <strong>Sin alumnos para este filtro.</strong>
                    </article>
                  )}

                  <section style={{ display: 'grid', gap: 12 }}>
                    {fichasIntensivosGlobales.map((ficha) => {
                      const {
                        registro,
                        curso,
                        resumenFinal,
                        fichaMaestra,
                        recuperacionesActivas,
                        faltasRealesPendientes,
                        totalDias,
                        diasPresentes,
                        diasAusentes,
                        diasPendientes,
                        totalReportes,
                        primerReporte,
                        ultimoReporte,
                        nivelEntrada,
                        nivelFinal,
                        nivel,
                        sesionesRegistradas,
                        finalizado,
                        pendienteRecuperar,
                      } = ficha;

                      return (
                        <article
                          key={`ficha-intensivo-${registro.alumno_id}`}
                          style={{
                            ...estiloTarjetaAlumno(nivel),
                            border: pendienteRecuperar
                              ? '1px solid #fdba74'
                              : finalizado
                                ? '1px solid #86efac'
                                : undefined,
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              gap: 12,
                              flexWrap: 'wrap',
                              alignItems: 'flex-start',
                            }}
                          >
                            <div style={{ flex: '1 1 280px' }}>
                              <div
                                style={{
                                  display: 'flex',
                                  gap: 8,
                                  flexWrap: 'wrap',
                                  alignItems: 'center',
                                }}
                              >
                                {bloqueIdentidadFichaAlumnoApp(
                                  registro.alumno,
                                  fichaMaestra?.fecha_nacimiento,
                                  fichaMaestra?.telefono
                                )}
                                <span style={badgeNivelFicha(nivelFinal)}>
                                  {resumenFinal?.nivel_final_confirmado
                                    ? `Nivel final ${nivelFinal}`
                                    : `Nivel actual ${nivelFinal}`}
                                </span>

                                {pendienteRecuperar && (
                                  <span
                                    style={{
                                      ...agendaBadgeModalidad,
                                      background: '#fff7ed',
                                      color: '#c2410c',
                                      borderColor: '#fdba74',
                                    }}
                                  >
                                    PENDIENTE RECUPERAR
                                  </span>
                                )}

                                {finalizado && (
                                  <span
                                    style={{
                                      ...agendaBadgeModalidad,
                                      background: '#f0fdf4',
                                      color: '#15803d',
                                      borderColor: '#86efac',
                                    }}
                                  >
                                    FINALIZADO
                                  </span>
                                )}
                              </div>

                              <p style={{ margin: '8px 0 0', color: '#475569', fontWeight: 750 }}>
                                Último intensivo:{' '}
                                <strong>{curso?.intensivo || registro.intensivo}</strong>
                              </p>

                              <p style={{ margin: '5px 0 0', color: '#64748b' }}>
                                {curso?.fecha_inicio ? formatearFecha(curso.fecha_inicio) : '-'}
                                {curso?.fecha_fin ? ` → ${formatearFecha(curso.fecha_fin)}` : ''}
                                {curso?.lugar ? ` · ${curso.lugar}` : ''}
                              </p>


                              <p
                                style={{
                                  margin: '7px 0 0',
                                  color: '#334155',
                                  fontWeight: 800,
                                }}
                              >
                                Nivel de entrada: {nivelEntrada} →{' '}
                                {resumenFinal?.nivel_final_confirmado
                                  ? `Nivel final: ${nivelFinal}`
                                  : `Nivel actual: ${nivelFinal}`}
                              </p>
                            </div>

                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(2, minmax(90px, 1fr))',
                                gap: 8,
                                minWidth: esVistaMovilApp ? '100%' : 230,
                              }}
                            >
                              <div style={miniTarjetaBlanca}>
                                <strong>{sesionesRegistradas}/{totalDias}</strong>
                                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 12 }}>
                                  sesiones registradas
                                </p>
                              </div>

                              <div style={miniTarjetaBlanca}>
                                <strong>{totalReportes}/{totalDias}</strong>
                                <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 12 }}>
                                  reportes
                                </p>
                              </div>
                            </div>
                          </div>

                          <div
                            style={{
                              display: 'grid',
                              gridTemplateColumns:
                                'repeat(auto-fit, minmax(190px, 1fr))',
                              gap: 8,
                              marginTop: 12,
                            }}
                          >
                            <div style={miniTarjetaBlanca}>
                              <strong>Asistencia</strong>
                              <p style={{ margin: '5px 0 0' }}>
                                {diasPresentes} presente · {diasAusentes} ausente
                                {diasPendientes > 0
                                  ? ` · ${diasPendientes} pendiente`
                                  : ''}
                              </p>
                            </div>

                            <div style={miniTarjetaBlanca}>
                              <strong>Nivel de entrada</strong>
                              <p style={{ margin: '5px 0 0', fontWeight: 900 }}>
                                {nivelEntrada}
                              </p>
                              <p
                                style={{
                                  margin: '3px 0 0',
                                  color: '#64748b',
                                  fontSize: 12,
                                }}
                              >
                                {primerReporte
                                  ? `Primer reporte · Día ${primerReporte.numero_dia}`
                                  : 'Nivel base de la ficha'}
                              </p>
                            </div>

                            <div style={miniTarjetaBlanca}>
                              <strong>
                                {resumenFinal?.nivel_final_confirmado
                                  ? 'Nivel final'
                                  : 'Nivel actual'}
                              </strong>
                              <p style={{ margin: '5px 0 0', fontWeight: 900 }}>
                                {nivelFinal}
                              </p>
                              <p
                                style={{
                                  margin: '3px 0 0',
                                  color: '#64748b',
                                  fontSize: 12,
                                }}
                              >
                                {resumenFinal?.nivel_final_confirmado
                                  ? 'Confirmado en evaluación final'
                                  : resumenFinal?.nivel_final_propuesto
                                    ? 'Propuesto · pendiente de confirmar'
                                    : ultimoReporte
                                      ? 'Último nivel reportado'
                                      : 'Nivel de la ficha'}
                              </p>
                            </div>

                            <div style={miniTarjetaBlanca}>
                              <strong>Evaluación / diploma</strong>
                              <p style={{ margin: '5px 0 0' }}>
                                {resumenFinal?.estado_diploma || 'Pendiente'}
                              </p>
                            </div>

                            <div style={miniTarjetaBlanca}>
                              <strong>Destino familia</strong>
                              <p style={{ margin: '5px 0 0', fontWeight: 850 }}>
                                {resumenFinal?.recomendacion_siguiente_paso ||
                                  registro.recomendacion_siguiente_paso ||
                                  'Sin comunicar'}
                              </p>
                            </div>
                          </div>

                          {pendienteRecuperar && (
                            <div style={{ ...avisoPendiente, marginTop: 12 }}>
                              <strong>Recuperación pendiente</strong>

                              {recuperacionesActivas.length > 0 ? (
                                <div
                                  style={{
                                    display: 'grid',
                                    gap: 6,
                                    marginTop: 8,
                                  }}
                                >
                                  {recuperacionesActivas.map((item) => (
                                    <div key={item.recuperacion_id}>
                                      <strong>
                                        {item.estado || 'Pendiente valorar'}
                                      </strong>
                                      <span>
                                        {' · '}
                                        {item.intensivo_destino ||
                                          'Sin intensivo destino'}
                                        {item.grupo_destino
                                          ? ` · ${item.grupo_destino}`
                                          : ''}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p style={{ margin: '6px 0 0' }}>
                                  {faltasRealesPendientes.length} falta(s)
                                  registrada(s) · pendiente de asignar
                                  recuperación.
                                </p>
                              )}
                            </div>
                          )}

                          {(resumenFinal?.tecnica_ultimo_reporte ||
                            resumenFinal?.autonomia_ultimo_reporte ||
                            resumenFinal?.actitud_ultimo_reporte) && (
                            <details style={{ marginTop: 12 }}>
                              <summary style={{ cursor: 'pointer', fontWeight: 900 }}>
                                Ver última evaluación del entrenador
                                {resumenFinal?.ultimo_reporte_fecha
                                  ? ` · ${formatearFecha(
                                      String(
                                        resumenFinal.ultimo_reporte_fecha
                                      ).slice(0, 10)
                                    )}`
                                  : ''}
                              </summary>
                              <div style={{ ...avisoNeutral, marginTop: 8, display: 'grid', gap: 6 }}>
                                <p style={{ margin: 0 }}>
                                  <strong>Técnica:</strong>{' '}
                                  {resumenFinal?.tecnica_ultimo_reporte || '-'}
                                </p>
                                <p style={{ margin: 0 }}>
                                  <strong>Autonomía:</strong>{' '}
                                  {resumenFinal?.autonomia_ultimo_reporte || '-'}
                                </p>
                                <p style={{ margin: 0 }}>
                                  <strong>Actitud:</strong>{' '}
                                  {resumenFinal?.actitud_ultimo_reporte || '-'}
                                </p>
                                <p style={{ margin: 0 }}>
                                  <strong>Recomendación:</strong>{' '}
                                  {resumenFinal?.recomendacion_ultimo_reporte ||
                                    fichaMaestra?.ultima_recomendacion ||
                                    '-'}
                                </p>
                              </div>
                            </details>
                          )}

                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              flexWrap: 'wrap',
                              marginTop: 12,
                            }}
                          >
                            {fichaMaestra && (
                              <button
                                type="button"
                                onClick={() => editarAlumnoBaseRapido(fichaMaestra)}
                                style={botonMini}
                              >
                                Editar ficha
                              </button>
                            )}

                            {curso && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPantalla('intensivos');
                                  setIntensivoCursoAbiertoId(curso.intensivo_id);
                                  window.setTimeout(() => {
                                    abrirPanelIntensivo(
                                      curso,
                                      pendienteRecuperar
                                        ? 'recuperaciones'
                                        : 'alumnos'
                                    );
                                  }, 80);
                                }}
                                style={pendienteRecuperar ? botonPrincipal : botonSecundario}
                              >
                                {pendienteRecuperar
                                  ? 'Gestionar recuperación'
                                  : 'Abrir intensivo'}
                              </button>
                            )}
                          </div>

                          {fichaMaestra &&
                            alumnoEditandoId === fichaMaestra.alumno_id && (
                              <div
                                style={{
                                  ...miniTarjetaBlanca,
                                  marginTop: 12,
                                  border: '1px solid #ddd6fe',
                                }}
                              >
                                <h4 style={{ marginTop: 0 }}>
                                  Editar ficha operativa
                                </h4>
                                <p style={{ marginTop: 0, color: '#475569' }}>
                                  Editas la ficha maestra del alumno. Los cambios
                                  se comparten con Baby, Ocio e Intensivos.
                                </p>

                                <div style={gridFormulario}>
                                  <label style={labelCampo}>
                                    Nombre
                                    <input
                                      value={alumnoEditNombre}
                                      onChange={(e) =>
                                        setAlumnoEditNombre(
                                          e.target.value.toUpperCase()
                                        )
                                      }
                                      style={inputCampo}
                                    />
                                  </label>

                                  <label style={labelCampo}>
                                    Fecha de nacimiento
                                    <input
                                      type="date"
                                      value={alumnoEditFechaNacimiento}
                                      onChange={(e) =>
                                        setAlumnoEditFechaNacimiento(e.target.value)
                                      }
                                      style={inputCampo}
                                    />
                                  </label>

                                  <label style={labelCampo}>
                                    Teléfono familia
                                    <input
                                      inputMode="tel"
                                      value={alumnoEditTelefono}
                                      onChange={(e) =>
                                        setAlumnoEditTelefono(e.target.value)
                                      }
                                      placeholder="612345678"
                                      style={inputCampo}
                                    />
                                  </label>

                                  <label style={labelCampo}>
                                    Nivel real de ficha
                                    <select
                                      value={alumnoEditNivel}
                                      onChange={(e) =>
                                        setAlumnoEditNivel(e.target.value)
                                      }
                                      style={selectCampo}
                                    >
                                      <option value="">Sin nivel / pendiente</option>
                                      {opcionesNivel.map((nivel) => (
                                        <option key={nivel} value={nivel}>
                                          {nivel}
                                        </option>
                                      ))}
                                    </select>
                                  </label>

                                  <label style={labelCampo}>
                                    Origen del nivel
                                    <select
                                      value={alumnoEditOrigen}
                                      onChange={(e) =>
                                        setAlumnoEditOrigen(e.target.value)
                                      }
                                      style={selectCampo}
                                    >
                                      <option value="Jose / Coordinador">
                                        Jose / Coordinador
                                      </option>
                                      <option value="Familia">Familia</option>
                                      <option value="Ventas / compañera">
                                        Ventas / compañera
                                      </option>
                                      <option value="Clase de prueba pendiente">
                                        Clase de prueba pendiente
                                      </option>
                                      <option value="Desconocido">Desconocido</option>
                                    </select>
                                  </label>
                                  <label style={labelCampo}>
                                    Camiseta rosa
                                    <select
                                      value={alumnoEditCamiseta ? 'SI' : 'NO'}
                                      onChange={(e) =>
                                        setAlumnoEditCamiseta(e.target.value === 'SI')
                                      }
                                      style={selectCampo}
                                    >
                                      <option value="SI">Sí · tiene camiseta</option>
                                      <option value="NO">No · necesita camiseta</option>
                                    </select>
                                  </label>

                                </div>

                                <div
                                  style={{
                                    display: 'flex',
                                    gap: 8,
                                    flexWrap: 'wrap',
                                    marginTop: 12,
                                  }}
                                >
                                  <button
                                    type="button"
                                    onClick={() =>
                                      guardarAlumnoBase(fichaMaestra.alumno_id)
                                    }
                                    style={botonPrincipal}
                                  >
                                    Guardar cambios
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cerrarEditorAlumnoBase}
                                    style={botonSecundario}
                                  >
                                    Cancelar
                                  </button>
                                </div>
                              </div>
                            )}
                        </article>
                      );
                    })}
                  </section>
                </>
              )}

              {vistaFichasAlumnos === 'general' && (
                <>

              <details style={{
                              width: '100%',
                              maxWidth: '100%',
                              minWidth: 0,
                              boxSizing: 'border-box', ...agendaBloqueBlanco, padding: 14 }}>
                <summary
                  style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 6,
                                  flexWrap: 'wrap',
                                  width: '100%',
                                  maxWidth: '100%',
                                  minWidth: 0,
                                  whiteSpace: 'normal',
                                  overflowWrap: 'anywhere',
                                  lineHeight: 1.25,
                    cursor: 'pointer',
                    fontWeight: 900,
                    color: '#475569',
                  }}
                >
                  Ayuda rápida de esta pantalla
                </summary>
                <div
                  style={{
                    display: 'grid',
                    gap: 8,
                    marginTop: 10,
                    color: '#475569',
                  }}
                >
                  <p style={{ margin: 0 }}>
                    Usa esta pantalla para revisar nivel real, historial, último
                    reporte y evaluación técnica de alumnos con actividad Baby.
                  </p>
                  <p style={{ margin: 0 }}>
                    Ocio tiene su propia subpestaña porque funciona como escuela
                    anual con grupo estable y día fijo.
                  </p>
                </div>
              </details>

              <section
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
                  gap: 10,
                }}
              >
                <button
                  type="button"
                  onClick={() => abrirFiltroFichas('todos')}
                  style={{
                    ...tarjetaMetricaFicha('#7c3aed', '#f5f3ff'),
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span
                    style={{ color: '#64748b', fontWeight: 800, fontSize: 12 }}
                  >
                    TOTAL BABY
                  </span>
                  <strong style={{ fontSize: 28 }}>{totalFichas}</strong>
                  <span>fichas</span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirFiltroFichas('sin_nivel')}
                  style={{
                    ...tarjetaMetricaFicha('#dc2626', '#fef2f2'),
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span
                    style={{ color: '#64748b', fontWeight: 800, fontSize: 12 }}
                  >
                    SIN NIVEL
                  </span>
                  <strong style={{ fontSize: 28 }}>{totalSinNivel}</strong>
                  <span>ver alumnos</span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirFiltroFichas('sin_reportes')}
                  style={{
                    ...tarjetaMetricaFicha('#f97316', '#fff7ed'),
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span
                    style={{ color: '#64748b', fontWeight: 800, fontSize: 12 }}
                  >
                    SIN REPORTES
                  </span>
                  <strong style={{ fontSize: 28 }}>{totalSinReportes}</strong>
                  <span>ver alumnos</span>
                </button>

                <button
                  type="button"
                  onClick={() => abrirFiltroFichas('revisar_ficha')}
                  style={{
                    ...tarjetaMetricaFicha('#2563eb', '#eff6ff'),
                    cursor: 'pointer',
                    textAlign: 'left',
                    color: 'inherit',
                  }}
                >
                  <span
                    style={{ color: '#64748b', fontWeight: 800, fontSize: 12 }}
                  >
                    REVISAR
                  </span>
                  <strong style={{ fontSize: 28 }}>{totalRevisarFicha}</strong>
                  <span>ver fichas</span>
                </button>
              </section>

              <article
                id="fichas-listado-alumnos"
                style={{
                  ...agendaBloqueBlanco,
                  width: '100%',
                  maxWidth: '100%',
                  minWidth: 0,
                  boxSizing: 'border-box', scrollMarginTop: 18 }}
              >
                <div style={{ display: 'grid', gap: 12 }}>
                  <input
                    value={busquedaAlumno}
                    onChange={(e) => setBusquedaAlumno(e.target.value)}
                    placeholder="Buscar alumno por nombre..."
                    style={{ ...buscador, margin: 0 }}
                  />

                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button
                      onClick={() => setFiltroAlumnos('todos')}
                      style={botonMenu(filtroAlumnos === 'todos')}
                    >
                      Todos
                    </button>
                    <button
                      onClick={() => setFiltroAlumnos('sin_nivel')}
                      style={botonMenu(filtroAlumnos === 'sin_nivel')}
                    >
                      Sin nivel
                    </button>
                    <button
                      onClick={() => setFiltroAlumnos('sin_reportes')}
                      style={botonMenu(filtroAlumnos === 'sin_reportes')}
                    >
                      Sin reportes
                    </button>
                    <button
                      onClick={() => setFiltroAlumnos('revisar_ficha')}
                      style={botonMenu(filtroAlumnos === 'revisar_ficha')}
                    >
                      Revisar
                    </button>
                  </div>
                </div>
              </article>

              {cargando && <p>Cargando alumnos...</p>}

              <section style={{ display: 'grid', gap: 12 }}>
                {alumnosFiltrados.map((alumno) => {
                  const editandoEsteAlumno =
                    alumnoEditandoId === alumno.alumno_id;
                  const fichaMaestra = buildMasterStudentProfile(alumno, {
                    groupPace:
                      perfilOperativoAlumnoApp(alumno.alumno_id)
                        ?.ritmo_tendencia || null,
                  });
                  const nivelPrincipal = fichaMaestra.level.level || 'SIN NIVEL';
                  const sinReportes = Number(alumno.total_reportes || 0) === 0;
                  const nivelUsadoPorApp = fichaMaestra.level.level || '-';
                  const nivelDifiereUltimoReporte =
                    fichaMaestra.level.reviewRequired;
                  const nivelProvisional =
                    fichaMaestra.level.source === 'ESTIMATED_LEVEL';
                  const historialAbierto =
                    historialAlumnoAbiertoId === alumno.alumno_id;
                  const historialReportesTodos =
                    historialReportesFichaPorAlumno[alumno.alumno_id] || [];
                  const historialCargando =
                    historialReportesFichaCargandoId === alumno.alumno_id;

                  return (
                    <article
                      key={alumno.alumno_id}
                      style={estiloTarjetaAlumno(nivelPrincipal)}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 14,
                          alignItems: 'flex-start',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ minWidth: 260, flex: 1 }}>
                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              flexWrap: 'wrap',
                              alignItems: 'center',
                              marginBottom: 8,
                            }}
                          >
                            <span style={badgeNivelFicha(nivelPrincipal)}>
                              Nivel {nivelPrincipal}
                            </span>
                            <span
                              style={{
                                ...agendaBadgeModalidad,
                                background: sinReportes ? '#fff7ed' : '#ecfdf5',
                                color: sinReportes ? '#c2410c' : '#047857',
                                borderColor: sinReportes
                                  ? '#fed7aa'
                                  : '#bbf7d0',
                              }}
                            >
                              {sinReportes
                                ? 'Sin reportes'
                                : `${alumno.total_reportes || 0} reportes`}
                            </span>
                          </div>

                          {bloqueIdentidadFichaAlumnoApp(
                            alumno.alumno,
                            alumno.fecha_nacimiento,
                            alumno.telefono
                          )}
                          {!datosBasicosFichaAlumnoApp(alumno).completa && (
                            <p
                              style={{
                                margin: '6px 0 0',
                                color: '#92400e',
                                fontWeight: 800,
                                lineHeight: 1.4,
                              }}
                            >
                              Faltan datos básicos:{' '}
                              {datosBasicosFichaAlumnoApp(alumno).faltan.join(
                                ', '
                              )}
                            </p>
                          )}
                          <p
                            style={{
                              margin: '6px 0 0',
                              color: '#475569',
                              fontWeight: 700,
                            }}
                          >
                            {sinReportes
                              ? `Sin historial técnico detallado todavía${
                                  nivelPrincipal !== 'SIN NIVEL'
                                    ? ` · Nivel de ficha ${nivelPrincipal}`
                                    : ''
                                }`
                              : `Reportes técnicos: ${
                                  alumno.total_reportes || 0
                                }${
                                  alumno.ultima_fecha_reporte
                                    ? ` · Último ${formatearFecha(
                                        alumno.ultima_fecha_reporte
                                      )}`
                                    : ''
                                }`}
                            {alumno.origen_nivel_estimado
                              ? ` · Origen: ${alumno.origen_nivel_estimado}`
                              : ''}
                          </p>
                          {perfilOperativoAlumnoApp(alumno.alumno_id) && (
                            <div
                              style={{
                                display: 'flex',
                                gap: 6,
                                flexWrap: 'wrap',
                                marginTop: 8,
                              }}
                            >
                              {perfilOperativoAlumnoApp(alumno.alumno_id)
                                ?.autonomia_reciente && (
                                <span style={miniBadge}>
                                  Autonomía:{' '}
                                  {perfilOperativoAlumnoApp(alumno.alumno_id)
                                    ?.autonomia_reciente}
                                </span>
                              )}
                              {(perfilOperativoAlumnoApp(alumno.alumno_id)
                                ?.remontes_recientes || []).length > 0 && (
                                <span style={miniBadge}>
                                  Remontes:{' '}
                                  {(
                                    perfilOperativoAlumnoApp(alumno.alumno_id)
                                      ?.remontes_recientes || []
                                  ).join(', ')}
                                </span>
                              )}
                              {perfilOperativoAlumnoApp(alumno.alumno_id)
                                ?.demanda_atencion &&
                                perfilOperativoAlumnoApp(alumno.alumno_id)
                                  ?.demanda_atencion !== 'NORMAL' && (
                                  <span
                                    style={{
                                      ...miniBadge,
                                      background:
                                        perfilOperativoAlumnoApp(alumno.alumno_id)
                                          ?.demanda_atencion === 'ALTA'
                                          ? '#fff1f2'
                                          : '#fff7ed',
                                      color:
                                        perfilOperativoAlumnoApp(alumno.alumno_id)
                                          ?.demanda_atencion === 'ALTA'
                                          ? '#be123c'
                                          : '#c2410c',
                                    }}
                                  >
                                    {perfilOperativoAlumnoApp(alumno.alumno_id)
                                      ?.demanda_atencion === 'ALTA'
                                      ? 'Atención prioritaria'
                                      : 'Seguimiento puntual'}
                                  </span>
                                )}
                            </div>
                          )}

                          {perfilOperativoAlumnoApp(alumno.alumno_id)
                            ?.aviso_operativo &&
                            perfilOperativoAlumnoApp(alumno.alumno_id)
                              ?.demanda_atencion !== 'NORMAL' && (
                            <p
                              style={{
                                margin: '7px 0 0',
                                color: '#92400e',
                                fontWeight: 750,
                                lineHeight: 1.4,
                              }}
                            >
                              <strong>Motivo del seguimiento:</strong>{' '}
                              {perfilOperativoAlumnoApp(alumno.alumno_id)
                                ?.aviso_operativo}
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
                            type="button"
                            onClick={() => editarAlumnoBaseRapido(alumno)}
                            style={botonMini}
                            title="Editar nombre, nivel real, origen del nivel y estado de ficha."
                          >
                            Editar ficha
                          </button>
                          <button
                            type="button"
                            onClick={() => abrirEvaluacionAlumno(alumno)}
                            style={botonMini}
                            title="Preparar una base breve para el informe de la familia usando el historial técnico del alumno."
                          >
                            Informe familia
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
                            style={botonMini}
                          >
                            Añadir a Intensivo
                          </button>
                          <button
                            type="button"
                            onClick={() => borrarAlumnoBase(alumno)}
                            style={botonPeligroMini}
                            title="Eliminar la ficha completa del alumno y sus datos asociados."
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
                              ...botonMini,
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

                      {editandoEsteAlumno && (
                        <div
                          style={{
                            ...miniTarjetaBlanca,
                            marginTop: 12,
                            border: '1px solid #ddd6fe',
                          }}
                        >
                          <h4 style={{ marginTop: 0 }}>
                            Editar ficha operativa
                          </h4>
                          <p style={{ marginTop: 0, color: '#475569' }}>
                            Este nivel se guarda como nivel real y se usa en
                            recomendador, grupos, listados y vista entrenador.
                          </p>

                          <div style={gridFormulario}>
                            <label style={labelCampo}>
                              Nombre
                              <input
                                value={alumnoEditNombre}
                                onChange={(e) =>
                                  setAlumnoEditNombre(
                                    e.target.value.toUpperCase()
                                  )
                                }
                                style={inputCampo}
                              />
                            </label>

                            <label style={labelCampo}>
                              Fecha de nacimiento
                              <input
                                type="date"
                                value={alumnoEditFechaNacimiento}
                                onChange={(e) =>
                                  setAlumnoEditFechaNacimiento(e.target.value)
                                }
                                style={inputCampo}
                              />
                            </label>

                            <label style={labelCampo}>
                              Teléfono familia
                              <input
                                inputMode="tel"
                                value={alumnoEditTelefono}
                                onChange={(e) =>
                                  setAlumnoEditTelefono(e.target.value)
                                }
                                placeholder="612345678"
                                style={inputCampo}
                              />
                            </label>

                            <label style={labelCampo}>
                              Nivel real de ficha
                              <select
                                value={alumnoEditNivel}
                                onChange={(e) =>
                                  setAlumnoEditNivel(e.target.value)
                                }
                                style={selectCampo}
                              >
                                <option value="">Sin nivel / pendiente</option>
                                {opcionesNivel.map((nivel) => (
                                  <option key={nivel} value={nivel}>
                                    {nivel}
                                  </option>
                                ))}
                              </select>
                            </label>

                            <label style={labelCampo}>
                              Origen del nivel
                              <select
                                value={alumnoEditOrigen}
                                onChange={(e) =>
                                  setAlumnoEditOrigen(e.target.value)
                                }
                                style={selectCampo}
                              >
                                <option value="Jose / Coordinador">
                                  Jose / Coordinador
                                </option>
                                <option value="Familia">Familia</option>
                                <option value="Ventas / compañera">
                                  Ventas / compañera
                                </option>
                                <option value="Clase de prueba pendiente">
                                  Clase de prueba pendiente
                                </option>
                                <option value="Desconocido">Desconocido</option>
                              </select>
                            </label>
                            <label style={labelCampo}>
                              Camiseta rosa
                              <select
                                value={alumnoEditCamiseta ? 'SI' : 'NO'}
                                onChange={(e) =>
                                  setAlumnoEditCamiseta(e.target.value === 'SI')
                                }
                                style={selectCampo}
                              >
                                <option value="SI">Sí · tiene camiseta</option>
                                <option value="NO">No · necesita camiseta</option>
                              </select>
                            </label>

                          </div>

                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              flexWrap: 'wrap',
                              marginTop: 12,
                            }}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                guardarAlumnoBase(alumno.alumno_id)
                              }
                              style={botonPrincipal}
                            >
                              Guardar cambios
                            </button>
                            <button
                              type="button"
                              onClick={cerrarEditorAlumnoBase}
                              style={botonSecundario}
                            >
                              Cancelar
                            </button>
                          </div>
                        </div>
                      )}

                      {evaluacionAlumnoActivaId === alumno.alumno_id && (
                        <FamilyEvaluationDraftPanel
                          title="Resumen para informe de familia"
                          description="Una base corta con evolución, mejoras, trabajo realizado y observaciones útiles. El detalle completo queda en el historial."
                          value={evaluacionAlumnoTexto}
                          onCopy={copiarEvaluacionAlumnoTexto}
                          onClose={() => {
                            setEvaluacionAlumnoActivaId(null);
                            setEvaluacionAlumnoTexto('');
                          }}
                        />
                      )}

                      <div style={{ marginTop: 12 }}>
                        <button
                          type="button"
                          onClick={() => void alternarHistorialAlumnoFichaApp(alumno)}
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
                            {historialAbierto ? '▼' : '▶'} Historial de entrenamientos y reportes
                          </span>
                          <span style={{ fontSize: 13, color: '#64748b' }}>
                            {sinReportes
                              ? 'Sin reportes técnicos'
                              : `${alumno.total_reportes || 0} ${
                                  Number(alumno.total_reportes || 0) === 1
                                    ? 'reporte'
                                    : 'reportes'
                                }${
                                  alumno.ultima_fecha_reporte
                                    ? ` · ${formatearFecha(
                                        alumno.ultima_fecha_reporte
                                      )}`
                                    : ''
                                }`}
                          </span>
                        </button>

                        {historialAbierto && (
                          <StudentHistoryPanel
                            studentId={alumno.alumno_id}
                            reports={historialReportesTodos}
                            filter={filtroModalidadHistorialFicha}
                            onFilterChange={setFiltroModalidadHistorialFicha}
                            loading={historialCargando}
                            currentLevel={nivelUsadoPorApp}
                            formatDate={formatearFecha}
                            totalReports={Number(alumno.total_reportes || 0)}
                            lastReportDate={alumno.ultima_fecha_reporte}
                            levelReviewRequired={nivelDifiereUltimoReporte}
                            provisionalLevel={nivelProvisional}
                          />
                        )}
                      </div>
                    </article>
                  );
                })}
              </section>

                </>
              )}
            </section>
          );
        })()}

    </>
  );
}

