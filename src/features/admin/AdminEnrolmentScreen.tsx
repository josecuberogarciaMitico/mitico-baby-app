import React, { useState } from 'react';
import type { DetalleImportacionAltasApp } from '../../core/enrolment/enrolmentTypes';

type AdminEnrolmentScreenProps = {
  ctx: Record<string, any>;
};

export function AdminEnrolmentScreen({ ctx }: AdminEnrolmentScreenProps) {
  const [mostrarImportadorAltas, setMostrarImportadorAltas] = useState(false);
  const {
    abrirAltaTestDesdeImportacionApp,
    altaImportadaActivaClave,
    altaNivelAbiertaId,
    altaNivelInicialFormVacioApp,
    altaVisibleNivelInicialApp,
    altasImportadasGestionadas,
    altasImportadasInvalidas,
    altasImportadasLeidas,
    altasImportadasPendientes,
    altasImportadasSinComprobar,
    altasNivelInicial,
    anadiendoAltaNivelId,
    anadirAltaNivelAListados,
    analizandoImportarAltas,
    analizarListadoAltasPegadoApp,
    avisoCompleto,
    avisoNeutral,
    borrarRegistroTemporalAnadido,
    botonPeligro,
    botonPrincipal,
    botonSecundario,
    cargandoAltasNivel,
    cargarAltasNivelInicial,
    coincidenciasAltaNivel,
    comprobandoCoincidenciasAltaId,
    copiarEnlaceAltaNivel,
    crearAltaNivelInicial,
    descartarAltaNivelInicial,
    detalleImportacionAltasActivo,
    detallePreguntaTestNivelApp,
    detalleRespuestaAlta,
    eliminarAltaNivelInicial,
    enviarAltaNivelWhatsapp,
    esCoordinadorJefeApp,
    filtroAltasNivel,
    filtroModalidadAltasNivel,
    formAltaNivelInicial,
    formatearFecha,
    gridFormulario,
    guardandoAltaNivel,
    inputCampo,
    intensivoAltaSeleccionado,
    intensivosAltaNivel,
    labelCampo,
    limpiarImportadorAltasApp,
    mensajeImportacionAltas,
    miniBadge,
    miniTarjetaBlanca,
    mostrarFormularioAltaNivel,
    nivelesValidacionAlta,
    opcionesNivel,
    pantalla,
    parseTechnicalLevel,
    pegarListadoAltasDesdePortapapelesApp,
    perfilUsuario,
    puedeVerAdministracionAltasApp,
    renderAyudaRapidaPantallaApp,
    resolucionCoincidenciaAlta,
    resumenImportacionAltas,
    selectCampo,
    setAltaImportadaActivaClave,
    setAltaNivelAbiertaId,
    setAltasImportadasGestionadas,
    setAltasImportadasInvalidas,
    setAltasImportadasLeidas,
    setAltasImportadasPendientes,
    setAltasImportadasSinComprobar,
    setDetalleImportacionAltasActivo,
    setDetalleRespuestaAlta,
    setFiltroAltasNivel,
    setFiltroModalidadAltasNivel,
    setFormAltaNivelInicial,
    setIntensivoAltaSeleccionado,
    setMensajeImportacionAltas,
    setMostrarFormularioAltaNivel,
    setNivelesValidacionAlta,
    setResolucionCoincidenciaAlta,
    setResumenImportacionAltas,
    setTextoImportarAltas,
    tarjeta,
    textareaCampo,
    textoImportarAltas,
    totalEstadoAltasNivelApp,
    totalModalidadAltasNivelApp,
    validarAltaNivelInicial,
  } = ctx;

  return (
    <>
      {pantalla === 'administracion' &&
        puedeVerAdministracionAltasApp(perfilUsuario?.rol) && (
          <section style={{ display: 'grid', gap: 16, minWidth: 0 }}>
            <article
              style={{
                borderRadius: 24,
                padding: 20,
                background:
                  'linear-gradient(135deg, #062d3f 0%, #083b4d 58%, #0b5d4f 100%)',
                border: '1px solid rgba(16,185,129,0.28)',
                boxShadow: '0 18px 44px rgba(15,23,42,0.16)',
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
                      fontSize: 11,
                      fontWeight: 900,
                      letterSpacing: 1.15,
                      color: '#86efac',
                    }}
                  >
                    ADMINISTRACIÓN
                  </p>
                  <h2
                    style={{
                      margin: '4px 0 0',
                      fontSize: 30,
                      color: '#ffffff',
                    }}
                  >
                    Altas y test de nivel
                  </h2>
                  {renderAyudaRapidaPantallaApp()}
                  <p
                    style={{
                      margin: '7px 0 0',
                      color: '#cbd5e1',
                      lineHeight: 1.4,
                      maxWidth: 720,
                    }}
                  >
                    Gestiona nuevas altas, envía el test, revisa la propuesta y
                    valida el nivel antes de incorporar al alumno.
                  </p>
                </div>

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <button
                    type="button"
                    onClick={cargarAltasNivelInicial}
                    style={{
                      ...botonSecundario,
                      background: 'rgba(255,255,255,.10)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,.28)',
                    }}
                  >
                    Actualizar
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarImportadorAltas((actual) => !actual);
                      setMensajeImportacionAltas('');
                    }}
                    style={{
                      ...botonSecundario,
                      background: mostrarImportadorAltas
                        ? '#0f766e'
                        : 'rgba(255,255,255,.10)',
                      color: '#ffffff',
                      border: '1px solid rgba(255,255,255,.28)',
                    }}
                  >
                    {mostrarImportadorAltas
                      ? 'Cerrar importador'
                      : 'Pegar altas de ventas'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const abrir = !mostrarFormularioAltaNivel;
                      if (abrir) {
                        setFormAltaNivelInicial(
                          altaNivelInicialFormVacioApp()
                        );
                        setAltaImportadaActivaClave('');
                      }
                      setMostrarFormularioAltaNivel(abrir);
                    }}
                    style={{
                      ...botonPrincipal,
                      background: '#16a34a',
                      borderColor: '#16a34a',
                    }}
                  >
                    {mostrarFormularioAltaNivel ? 'Cerrar alta' : '+ Nueva alta'}
                  </button>
                </div>
              </div>
            </article>

            {mostrarImportadorAltas && (
              <article
                style={{
                  ...tarjeta,
                  border: '1px solid #99f6e4',
                  background:
                    'linear-gradient(135deg, #f0fdfa, #ffffff 58%, #f8fafc)',
                  display: 'grid',
                  gap: 14,
                }}
              >
                <div>
                  <p
                    style={{
                      margin: 0,
                      color: '#0f766e',
                      fontSize: 11,
                      fontWeight: 950,
                      letterSpacing: '.08em',
                      textTransform: 'uppercase',
                    }}
                  >
                    PREPARAR ALTAS ANTES DE AIMHARDER
                  </p>
                  <h3 style={{ margin: '4px 0 0' }}>
                    Pegar listado de ventas
                  </h3>
                  <p
                    style={{
                      margin: '6px 0 0',
                      color: '#475569',
                      lineHeight: 1.45,
                      fontSize: 13,
                    }}
                  >
                    Copia las filas desde Excel y pégalas aquí. La app no crea
                    ni envía nada: primero comprueba quién ya existe y debajo
                    muestra solamente los alumnos que todavía necesitan
                    Alta/Test.
                  </p>
                </div>

                <textarea
                  value={textoImportarAltas}
                  onChange={(e) => {
                    setTextoImportarAltas(e.target.value);
                    setAltasImportadasPendientes([]);
                    setAltasImportadasLeidas([]);
                    setAltasImportadasGestionadas([]);
                    setAltasImportadasSinComprobar([]);
                    setAltasImportadasInvalidas([]);
                    setDetalleImportacionAltasActivo('');
                    setResumenImportacionAltas(null);
                    setMensajeImportacionAltas('');
                  }}
                  rows={7}
                  placeholder={
                    'Pega aquí las filas de Excel. Puedes incluir la cabecera:\\nNOMBRE · 1ER APELLIDO · 2º APELLIDO · FECHA NACI · TEL · ... · MODALIDAD'
                  }
                  style={{
                    ...textareaCampo,
                    minHeight: 150,
                    fontFamily:
                      'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                    fontSize: 13,
                  }}
                />

                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    alignItems: 'center',
                  }}
                >
                  <button
                    type="button"
                    onClick={pegarListadoAltasDesdePortapapelesApp}
                    disabled={analizandoImportarAltas}
                    style={botonSecundario}
                  >
                    Pegar portapapeles
                  </button>
                  <button
                    type="button"
                    onClick={analizarListadoAltasPegadoApp}
                    disabled={
                      analizandoImportarAltas || !textoImportarAltas.trim()
                    }
                    style={{
                      ...botonPrincipal,
                      opacity:
                        analizandoImportarAltas || !textoImportarAltas.trim()
                          ? 0.6
                          : 1,
                    }}
                  >
                    {analizandoImportarAltas
                      ? 'Comprobando...'
                      : 'Comprobar listado'}
                  </button>
                  <button
                    type="button"
                    onClick={limpiarImportadorAltasApp}
                    disabled={analizandoImportarAltas}
                    style={botonSecundario}
                  >
                    Limpiar
                  </button>
                </div>

                {resumenImportacionAltas && (
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      flexWrap: 'wrap',
                    }}
                  >
                    {(
                      [
                        [
                          'LEIDAS',
                          `Leídos: ${resumenImportacionAltas.totalLeidas}`,
                          '#2563eb',
                          '#eff6ff',
                        ],
                        [
                          'NUEVAS',
                          `Nuevos: ${resumenImportacionAltas.pendientes}`,
                          '#047857',
                          '#ecfdf5',
                        ],
                        [
                          'GESTIONADAS',
                          `Ya gestionados: ${resumenImportacionAltas.yaExistian}`,
                          '#475569',
                          '#f8fafc',
                        ],
                        [
                          'INVALIDAS',
                          `Filas incompletas: ${resumenImportacionAltas.invalidas}`,
                          '#c2410c',
                          '#fff7ed',
                        ],
                        ...(resumenImportacionAltas.sinComprobar > 0
                          ? [
                              [
                                'SIN_COMPROBAR',
                                `Sin comprobar: ${resumenImportacionAltas.sinComprobar}`,
                                '#b91c1c',
                                '#fef2f2',
                              ],
                            ]
                          : []),
                      ] as Array<
                        [DetalleImportacionAltasApp, string, string, string]
                      >
                    ).map(([tipo, etiqueta, color, fondo]) => {
                      const activo = detalleImportacionAltasActivo === tipo;

                      return (
                        <button
                          key={tipo}
                          type="button"
                          aria-pressed={activo}
                          onClick={() => {
                            setDetalleImportacionAltasActivo(tipo);
                            window.setTimeout(() => {
                              document
                                .getElementById('resultado-importacion-altas')
                                ?.scrollIntoView({
                                  behavior: 'smooth',
                                  block: 'nearest',
                                });
                            }, 0);
                          }}
                          style={{
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            border: activo
                              ? `2px solid ${color}`
                              : `1px solid ${color}55`,
                            borderRadius: 999,
                            padding: '7px 11px',
                            background: activo ? color : fondo,
                            color: activo ? '#ffffff' : color,
                            fontSize: 12,
                            fontWeight: 900,
                            fontFamily: 'inherit',
                            lineHeight: 1.2,
                            cursor: 'pointer',
                            pointerEvents: 'auto',
                            position: 'relative',
                            zIndex: 2,
                            boxShadow: activo
                              ? `0 6px 16px ${color}30`
                              : 'none',
                          }}
                        >
                          {etiqueta} {activo ? '✓' : '›'}
                        </button>
                      );
                    })}
                  </div>
                )}

                {mensajeImportacionAltas && (
                  <div
                    style={{
                      padding: '10px 12px',
                      borderRadius: 12,
                      background:
                        resumenImportacionAltas?.pendientes === 0 &&
                        resumenImportacionAltas?.sinComprobar === 0
                          ? '#ecfdf5'
                          : '#eff6ff',
                      border:
                        resumenImportacionAltas?.pendientes === 0 &&
                        resumenImportacionAltas?.sinComprobar === 0
                          ? '1px solid #a7f3d0'
                          : '1px solid #bfdbfe',
                      color:
                        resumenImportacionAltas?.pendientes === 0 &&
                        resumenImportacionAltas?.sinComprobar === 0
                          ? '#047857'
                          : '#1e40af',
                      fontWeight: 800,
                      fontSize: 13,
                      lineHeight: 1.4,
                    }}
                  >
                    {mensajeImportacionAltas}
                  </div>
                )}

                {resumenImportacionAltas &&
                  detalleImportacionAltasActivo && (
                    <section
                      id="resultado-importacion-altas"
                      style={{
                        display: 'grid',
                        gap: 9,
                        border: '1px solid #dbeafe',
                        borderRadius: 16,
                        padding: 12,
                        background: '#ffffff',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: 15 }}>
                          {detalleImportacionAltasActivo === 'LEIDAS'
                            ? `Leídos · ${altasImportadasLeidas.length}`
                            : detalleImportacionAltasActivo === 'NUEVAS'
                            ? `Nuevos · ${altasImportadasPendientes.length}`
                            : detalleImportacionAltasActivo === 'GESTIONADAS'
                            ? `Ya gestionados · ${altasImportadasGestionadas.length}`
                            : detalleImportacionAltasActivo === 'INVALIDAS'
                            ? `Filas incompletas · ${altasImportadasInvalidas.length}`
                            : `Sin comprobar · ${altasImportadasSinComprobar.length}`}
                        </strong>
                        <p
                          style={{
                            margin: '3px 0 0',
                            color: '#64748b',
                            fontSize: 12,
                          }}
                        >
                          {detalleImportacionAltasActivo === 'NUEVAS'
                            ? 'Solo estos necesitan preparar un Alta/Test.'
                            : detalleImportacionAltasActivo === 'GESTIONADAS'
                            ? 'Estos ya existen o ya tienen un Alta/Test; no se vuelven a enviar.'
                            : detalleImportacionAltasActivo === 'INVALIDAS'
                            ? 'Estas filas necesitan corregirse antes de poder comprobarlas.'
                            : detalleImportacionAltasActivo === 'SIN_COMPROBAR'
                            ? 'La app no ha podido confirmar estos registros; no se crean por seguridad.'
                            : 'Todas las filas válidas interpretadas del listado.'}
                        </p>
                      </div>

                      {detalleImportacionAltasActivo === 'INVALIDAS' &&
                        altasImportadasInvalidas.map((fila) => (
                          <article
                            key={`invalida-${fila.filaOrigen}-${fila.texto}`}
                            style={{
                              border: '1px solid #fed7aa',
                              borderRadius: 14,
                              padding: 11,
                              background: '#fff7ed',
                            }}
                          >
                            <strong style={{ color: '#c2410c' }}>
                              Fila {fila.filaOrigen}
                            </strong>
                            <div
                              style={{
                                marginTop: 4,
                                color: '#9a3412',
                                fontSize: 12,
                                fontWeight: 800,
                              }}
                            >
                              {fila.motivo}
                            </div>
                            <div
                              style={{
                                marginTop: 4,
                                color: '#64748b',
                                fontSize: 11,
                                overflowWrap: 'anywhere',
                              }}
                            >
                              {fila.texto}
                            </div>
                          </article>
                        ))}

                      {detalleImportacionAltasActivo === 'GESTIONADAS' &&
                        altasImportadasGestionadas.map(({ fila, detalle }) => (
                          <article
                            key={`gestionada-${fila.clave}`}
                            style={{
                              border: '1px solid #e2e8f0',
                              borderRadius: 14,
                              padding: 11,
                              background: '#f8fafc',
                            }}
                          >
                            <strong
                              style={{
                                display: 'block',
                                color: '#0f172a',
                                fontSize: 14,
                              }}
                            >
                              {fila.nombre}
                            </strong>
                            <span
                              style={{
                                display: 'block',
                                marginTop: 3,
                                color: '#64748b',
                                fontSize: 12,
                              }}
                            >
                              {formatearFecha(fila.fechaNacimiento)} ·{' '}
                              {fila.telefono} · {fila.modalidad}
                            </span>
                            <span
                              style={{
                                display: 'block',
                                marginTop: 4,
                                color: '#047857',
                                fontSize: 12,
                                fontWeight: 800,
                              }}
                            >
                              ✓ {detalle}
                            </span>
                          </article>
                        ))}

                      {detalleImportacionAltasActivo === 'SIN_COMPROBAR' &&
                        altasImportadasSinComprobar.map((fila) => (
                          <article
                            key={`sin-comprobar-${fila.clave}`}
                            style={{
                              border: '1px solid #fecaca',
                              borderRadius: 14,
                              padding: 11,
                              background: '#fef2f2',
                            }}
                          >
                            <strong
                              style={{
                                display: 'block',
                                color: '#991b1b',
                                fontSize: 14,
                              }}
                            >
                              {fila.nombre}
                            </strong>
                            <span
                              style={{
                                display: 'block',
                                marginTop: 3,
                                color: '#64748b',
                                fontSize: 12,
                              }}
                            >
                              {formatearFecha(fila.fechaNacimiento)} ·{' '}
                              {fila.telefono} · {fila.modalidad}
                            </span>
                          </article>
                        ))}

                      {detalleImportacionAltasActivo === 'NUEVAS' &&
                        altasImportadasPendientes.map((fila) => (
                          <article
                            key={`nueva-${fila.clave}`}
                            style={{
                              border: '1px solid #dbeafe',
                              borderRadius: 16,
                              padding: 12,
                              background: '#ffffff',
                              display: 'flex',
                              gap: 12,
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              flexWrap: 'wrap',
                            }}
                          >
                            <div style={{ minWidth: 0, flex: '1 1 300px' }}>
                              <strong
                                style={{
                                  display: 'block',
                                  color: '#0f172a',
                                  fontSize: 15,
                                }}
                              >
                                {fila.nombre}
                              </strong>
                              <span
                                style={{
                                  display: 'block',
                                  marginTop: 4,
                                  color: '#64748b',
                                  fontSize: 12,
                                  lineHeight: 1.4,
                                }}
                              >
                                {formatearFecha(fila.fechaNacimiento)} ·{' '}
                                {fila.telefono} · {fila.modalidad}
                                {fila.modalidad === 'OCIO' && fila.ocioDiaFijo
                                  ? ` · ${fila.ocioDiaFijo}`
                                  : ''}
                              </span>
                              {fila.modalidad === 'OCIO' &&
                                !fila.ocioDiaFijo && (
                                  <span
                                    style={{
                                      display: 'block',
                                      marginTop: 4,
                                      color: '#b45309',
                                      fontSize: 12,
                                      fontWeight: 750,
                                    }}
                                  >
                                    Al abrir el formulario tendrás que
                                    seleccionar el día fijo de Ocio.
                                  </span>
                                )}
                            </div>

                            <button
                              type="button"
                              onClick={() =>
                                abrirAltaTestDesdeImportacionApp(fila)
                              }
                              style={{
                                ...botonPrincipal,
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Crear Alta/Test
                            </button>
                          </article>
                        ))}

                      {detalleImportacionAltasActivo === 'LEIDAS' &&
                        altasImportadasLeidas.map((fila) => {
                          const gestionada =
                            altasImportadasGestionadas.find(
                              (item) => item.fila.clave === fila.clave
                            );
                          const esNueva = altasImportadasPendientes.some(
                            (item) => item.clave === fila.clave
                          );
                          const sinComprobar =
                            altasImportadasSinComprobar.some(
                              (item) => item.clave === fila.clave
                            );

                          const estado = gestionada
                            ? 'Ya gestionado'
                            : esNueva
                            ? 'Nuevo'
                            : sinComprobar
                            ? 'Sin comprobar'
                            : 'Leído';

                          return (
                            <article
                              key={`leida-${fila.clave}`}
                              style={{
                                border: '1px solid #e2e8f0',
                                borderRadius: 14,
                                padding: 11,
                                background: '#ffffff',
                                display: 'flex',
                                justifyContent: 'space-between',
                                gap: 10,
                                alignItems: 'flex-start',
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <strong
                                  style={{
                                    display: 'block',
                                    color: '#0f172a',
                                    fontSize: 14,
                                  }}
                                >
                                  {fila.nombre}
                                </strong>
                                <span
                                  style={{
                                    display: 'block',
                                    marginTop: 3,
                                    color: '#64748b',
                                    fontSize: 12,
                                  }}
                                >
                                  {formatearFecha(fila.fechaNacimiento)} ·{' '}
                                  {fila.telefono} · {fila.modalidad}
                                </span>
                                {gestionada && (
                                  <span
                                    style={{
                                      display: 'block',
                                      marginTop: 3,
                                      color: '#047857',
                                      fontSize: 11,
                                      fontWeight: 800,
                                    }}
                                  >
                                    {gestionada.detalle}
                                  </span>
                                )}
                              </div>
                              <span
                                style={{
                                  flex: '0 0 auto',
                                  padding: '5px 8px',
                                  borderRadius: 999,
                                  fontSize: 11,
                                  fontWeight: 900,
                                  background:
                                    estado === 'Nuevo'
                                      ? '#ecfdf5'
                                      : estado === 'Ya gestionado'
                                      ? '#f1f5f9'
                                      : estado === 'Sin comprobar'
                                      ? '#fef2f2'
                                      : '#eff6ff',
                                  color:
                                    estado === 'Nuevo'
                                      ? '#047857'
                                      : estado === 'Ya gestionado'
                                      ? '#475569'
                                      : estado === 'Sin comprobar'
                                      ? '#b91c1c'
                                      : '#1d4ed8',
                                }}
                              >
                                {estado}
                              </span>
                            </article>
                          );
                        })}
                    </section>
                  )}
              </article>
            )}

            {mostrarFormularioAltaNivel && (
              <article
                id="form-alta-nivel-inicial"
                style={{
                  ...tarjeta,
                  border: '1px solid #a5f3fc',
                  background: 'linear-gradient(135deg, #ecfeff, #ffffff 60%)',
                }}
              >
                <h3 style={{ marginTop: 0 }}>Nueva solicitud</h3>
                {altaImportadaActivaClave && (
                  <div
                    style={{
                      margin: '-4px 0 12px',
                      padding: '8px 10px',
                      borderRadius: 10,
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      color: '#047857',
                      fontSize: 12,
                      fontWeight: 800,
                    }}
                  >
                    Datos rellenados desde el listado pegado. Revisa y pulsa
                    “Crear test para familia”.
                  </div>
                )}
                <div style={gridFormulario}>
                  <label style={labelCampo}>
                    Nombre y apellidos
                    <input
                      value={formAltaNivelInicial.nombre}
                      onChange={(e) =>
                        setFormAltaNivelInicial({ ...formAltaNivelInicial, nombre: e.target.value })
                      }
                      placeholder="Lucía García López"
                      style={inputCampo}
                    />
                    <small style={{ color: '#64748b' }}>
                      No hace falta escribirlo en mayúsculas; al guardarlo se normaliza.
                    </small>
                  </label>

                  <label style={labelCampo}>
                    Fecha de nacimiento
                    <input
                      type="date"
                      value={formAltaNivelInicial.fechaNacimiento}
                      onChange={(e) =>
                        setFormAltaNivelInicial({
                          ...formAltaNivelInicial,
                          fechaNacimiento: e.target.value,
                        })
                      }
                      style={inputCampo}
                    />
                  </label>

                  <label style={labelCampo}>
                    Modalidad
                    <select
                      value={formAltaNivelInicial.modalidad}
                      onChange={(e) => {
                        const modalidad = e.target.value as
                          | 'BABY'
                          | 'INTENSIVOS'
                          | 'OCIO';

                        setFormAltaNivelInicial({
                          ...formAltaNivelInicial,
                          modalidad,
                          ocioDiaFijo:
                            modalidad === 'OCIO'
                              ? formAltaNivelInicial.ocioDiaFijo
                              : '',
                        });
                      }}
                      style={selectCampo}
                    >
                      <option value="BABY">Baby</option>
                      <option value="INTENSIVOS">Intensivos</option>
                      <option value="OCIO">Ocio</option>
                    </select>
                  </label>

                  {formAltaNivelInicial.modalidad === 'OCIO' && (
                    <label style={labelCampo}>
                      Día fijo de Ocio
                      <select
                        value={formAltaNivelInicial.ocioDiaFijo}
                        onChange={(e) =>
                          setFormAltaNivelInicial({
                            ...formAltaNivelInicial,
                            ocioDiaFijo: e.target.value as
                              | ''
                              | 'Jueves'
                              | 'Sábado'
                              | 'Domingo',
                          })
                        }
                        style={selectCampo}
                      >
                        <option value="">Selecciona día</option>
                        <option value="Jueves">Jueves</option>
                        <option value="Sábado">Sábado</option>
                        <option value="Domingo">Domingo</option>
                      </select>
                      <small style={{ color: '#64748b' }}>
                        Día habitual de asistencia durante la temporada.
                      </small>
                    </label>
                  )}

                  <label style={labelCampo}>
                    Teléfono familia
                    <input
                      inputMode="tel"
                      value={formAltaNivelInicial.telefono}
                      onChange={(e) =>
                        setFormAltaNivelInicial({ ...formAltaNivelInicial, telefono: e.target.value })
                      }
                      placeholder="612345678"
                      style={inputCampo}
                    />
                  </label>
                </div>

                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
                  <button
                    type="button"
                    disabled={guardandoAltaNivel}
                    onClick={crearAltaNivelInicial}
                    style={botonPrincipal}
                  >
                    {guardandoAltaNivel ? 'Creando...' : 'Crear test para familia'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setFormAltaNivelInicial(altaNivelInicialFormVacioApp());
                      setAltaImportadaActivaClave('');
                      setMostrarFormularioAltaNivel(false);
                    }}
                    style={botonSecundario}
                  >
                    Cancelar
                  </button>
                </div>
              </article>
            )}

            <section
              style={{
                ...tarjeta,
                padding: 14,
                display: 'grid',
                gap: 14,
              }}
            >
              <div>
                <strong style={{ fontSize: 16 }}>Filtrar altas</strong>
                <p style={{ margin: '3px 0 0', color: '#64748b', fontSize: 13 }}>
                  Combina estado y modalidad para ver exactamente lo que necesitas.
                </p>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <small
                  style={{
                    color: '#64748b',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                  }}
                >
                  Estado
                </small>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    ['TODOS', 'Todos', totalEstadoAltasNivelApp('TODOS'), '#4f46e5', '#eef2ff'],
                    ['PENDIENTE_ENVIO', 'Pendiente de enviar', totalEstadoAltasNivelApp('PENDIENTE_ENVIO'), '#64748b', '#f8fafc'],
                    ['ENVIADO', 'Esperando respuesta', totalEstadoAltasNivelApp('ENVIADO'), '#d97706', '#fffbeb'],
                    ['RESPONDIDO', 'Respondido · revisar', totalEstadoAltasNivelApp('RESPONDIDO'), '#2563eb', '#eff6ff'],
                    ['ANADIDO', 'Añadidos', totalEstadoAltasNivelApp('ANADIDO'), '#0f766e', '#f0fdfa'],
                    ['DESCARTADO', 'Descartado', totalEstadoAltasNivelApp('DESCARTADO'), '#dc2626', '#fef2f2'],
                  ].map(([valor, etiqueta, cantidad, color, fondo]) => {
                    const activo = filtroAltasNivel === valor;
                    return (
                      <button
                        key={String(valor)}
                        type="button"
                        onClick={() => {
                          setFiltroAltasNivel(valor as typeof filtroAltasNivel);
                          setAltaNivelAbiertaId('');
                          setDetalleRespuestaAlta('');
                        }}
                        style={{
                          ...botonSecundario,
                          background: activo ? String(color) : String(fondo),
                          color: activo ? '#ffffff' : String(color),
                          borderColor: String(color),
                          fontWeight: 900,
                          boxShadow: activo
                            ? `0 8px 18px ${String(color)}28`
                            : 'none',
                        }}
                      >
                        {String(etiqueta)} ({String(cantidad)})
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ display: 'grid', gap: 8 }}>
                <small
                  style={{
                    color: '#64748b',
                    fontWeight: 900,
                    textTransform: 'uppercase',
                    letterSpacing: '.06em',
                  }}
                >
                  Modalidad
                </small>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {[
                    ['TODAS', 'Todas', totalModalidadAltasNivelApp('TODAS'), '#334155', '#f8fafc'],
                    ['BABY', 'Baby', totalModalidadAltasNivelApp('BABY'), '#2563eb', '#eff6ff'],
                    ['OCIO', 'Ocio', totalModalidadAltasNivelApp('OCIO'), '#7c3aed', '#f5f3ff'],
                    ['INTENSIVOS', 'Intensivos', totalModalidadAltasNivelApp('INTENSIVOS'), '#ea580c', '#fff7ed'],
                  ].map(([valor, etiqueta, cantidad, color, fondo]) => {
                    const activo = filtroModalidadAltasNivel === valor;
                    return (
                      <button
                        key={String(valor)}
                        type="button"
                        onClick={() => {
                          setFiltroModalidadAltasNivel(
                            valor as typeof filtroModalidadAltasNivel
                          );
                          setAltaNivelAbiertaId('');
                          setDetalleRespuestaAlta('');
                        }}
                        style={{
                          ...botonSecundario,
                          background: activo ? String(color) : String(fondo),
                          color: activo ? '#ffffff' : String(color),
                          borderColor: String(color),
                          fontWeight: 900,
                          boxShadow: activo
                            ? `0 8px 18px ${String(color)}28`
                            : 'none',
                        }}
                      >
                        {String(etiqueta)} ({String(cantidad)})
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>

            {cargandoAltasNivel && <article style={tarjeta}>Cargando altas...</article>}

            {!cargandoAltasNivel && altasNivelInicial.length === 0 && (
              <article style={tarjeta}>
                <h3 style={{ marginTop: 0 }}>Sin solicitudes</h3>
                <p style={{ marginBottom: 0, color: '#64748b' }}>
                  Cuando Administración cree un test aparecerá aquí.
                </p>
              </article>
            )}

            {!cargandoAltasNivel &&
              altasNivelInicial.length > 0 &&
              altasNivelInicial.filter(altaVisibleNivelInicialApp).length === 0 && (
                <article style={tarjeta}>
                  <h3 style={{ marginTop: 0 }}>No hay altas con estos filtros</h3>
                  <p style={{ marginBottom: 0, color: '#64748b' }}>
                    Cambia el estado o la modalidad para ver otras solicitudes.
                  </p>
                </article>
              )}

            <section style={{ display: 'grid', gap: 10 }}>
              {altasNivelInicial
                .filter(altaVisibleNivelInicialApp)
                .map((alta) => {
                  const respondido = alta.estado === 'RESPONDIDO';
                  const validado = alta.estado === 'VALIDADO';
                  const anadido = alta.estado === 'ANADIDO';
                  const descartado = alta.estado === 'DESCARTADO';
                  const abierta = altaNivelAbiertaId === alta.id;
                  const colorEstado =
                    respondido ? '#2563eb'
                    : validado ? '#16a34a'
                    : anadido ? '#0f766e'
                    : descartado ? '#dc2626'
                    : alta.estado === 'ENVIADO' ? '#d97706'
                    : '#64748b';

                  const textoEstado =
                    alta.estado === 'PENDIENTE_ENVIO' ? 'PENDIENTE DE ENVIAR'
                    : alta.estado === 'ENVIADO' ? 'ESPERANDO RESPUESTA'
                    : alta.estado === 'RESPONDIDO' ? 'RESPONDIDO · REVISAR'
                    : alta.estado === 'VALIDADO' ? 'REVISADO · LISTO PARA AÑADIR'
                    : alta.estado === 'ANADIDO' ? 'AÑADIDO'
                    : 'DESCARTADO';

                  const puedeEliminarAlta =
                    alta.estado === 'PENDIENTE_ENVIO' ||
                    alta.estado === 'ENVIADO' ||
                    alta.estado === 'RESPONDIDO' ||
                    (esCoordinadorJefeApp &&
                      (alta.estado === 'VALIDADO' ||
                        alta.estado === 'DESCARTADO'));

                  return (
                    <article
                      id={`alta-nivel-${alta.id}`}
                      key={alta.id}
                      style={{
                        ...tarjeta,
                        scrollMarginTop: 18,
                        padding: 0,
                        minWidth: 0,
                        overflow: 'hidden',
                        border: `1px solid ${colorEstado}33`,
                        borderLeft: `5px solid ${colorEstado}`,
                      }}
                    >
                      <button
                        type="button"
                        onClick={() => {
                          const seVaAAbrir = altaNivelAbiertaId !== alta.id;
                          setDetalleRespuestaAlta('');
                          setAltaNivelAbiertaId(seVaAAbrir ? alta.id : '');

                          if (seVaAAbrir) {
                            window.setTimeout(() => {
                              document
                                .getElementById(`alta-nivel-${alta.id}`)
                                ?.scrollIntoView({
                                  behavior: 'smooth',
                                  block: 'start',
                                });
                            }, 80);
                          }
                        }}
                        aria-expanded={abierta}
                        style={{
                          width: '100%',
                          border: 0,
                          background: abierta ? '#f8fafc' : '#ffffff',
                          padding: '14px 16px',
                          display: 'grid',
                          gridTemplateColumns: '1fr auto',
                          gap: 12,
                          alignItems: 'center',
                          textAlign: 'left',
                        }}
                      >
                        <div style={{ minWidth: 0 }}>
                          <div
                            style={{
                              display: 'flex',
                              gap: 8,
                              alignItems: 'center',
                              flexWrap: 'wrap',
                            }}
                          >
                            <strong style={{ fontSize: 17, color: '#172033' }}>
                              {alta.nombre_completo}
                            </strong>
                            <span
                              style={{
                                padding: '4px 7px',
                                borderRadius: 999,
                                background: `${colorEstado}12`,
                                color: colorEstado,
                                border: `1px solid ${colorEstado}33`,
                                fontSize: 10,
                                fontWeight: 950,
                              }}
                            >
                              {textoEstado}
                            </span>
                          </div>

                          <div
                            style={{
                              marginTop: 5,
                              display: 'flex',
                              gap: 8,
                              flexWrap: 'wrap',
                              color: '#64748b',
                              fontSize: 13,
                            }}
                          >
                            <span
                              style={{
                                padding: '3px 7px',
                                borderRadius: 999,
                                fontSize: 11,
                                fontWeight: 950,
                                background:
                                  alta.modalidad === 'BABY'
                                    ? '#eff6ff'
                                    : alta.modalidad === 'OCIO'
                                    ? '#f5f3ff'
                                    : '#fff7ed',
                                color:
                                  alta.modalidad === 'BABY'
                                    ? '#1d4ed8'
                                    : alta.modalidad === 'OCIO'
                                    ? '#6d28d9'
                                    : '#c2410c',
                                border:
                                  alta.modalidad === 'BABY'
                                    ? '1px solid #bfdbfe'
                                    : alta.modalidad === 'OCIO'
                                    ? '1px solid #ddd6fe'
                                    : '1px solid #fed7aa',
                              }}
                            >
                              {alta.modalidad === 'BABY'
                                ? 'BABY'
                                : alta.modalidad === 'OCIO'
                                ? 'OCIO'
                                : 'INTENSIVOS'}
                            </span>
                            <span>·</span>
                            <span>{formatearFecha(alta.fecha_nacimiento)}</span>
                            {alta.nivel_propuesto && (
                              <>
                                <span>·</span>
                                <span>
                                  Nivel propuesto: <strong>{alta.nivel_propuesto}</strong>
                                </span>
                              </>
                            )}
                            {alta.nivel_validado && (
                              <>
                                <span>·</span>
                                <span>
                                  Nivel validado: <strong>{alta.nivel_validado}</strong>
                                </span>
                              </>
                            )}
                          </div>
                        </div>

                        <span
                          aria-hidden="true"
                          style={{
                            fontSize: 22,
                            fontWeight: 950,
                            color: '#64748b',
                            transform: abierta ? 'rotate(90deg)' : 'rotate(0deg)',
                            transition: 'transform .16s ease',
                          }}
                        >
                          ›
                        </span>
                      </button>

                      {abierta && (
                        <div
                          style={{
                            padding: '12px 16px 16px',
                            borderTop: '1px solid #e2e8f0',
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
                            <div style={{ color: '#64748b', fontSize: 13 }}>
                              Teléfono:{' '}
                              <strong style={{ color: '#334155' }}>{alta.telefono}</strong>
                            </div>

                            {!validado && !descartado && (
                              <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                                <button
                                  type="button"
                                  onClick={() => enviarAltaNivelWhatsapp(alta)}
                                  style={botonPrincipal}
                                >
                                  {alta.estado === 'PENDIENTE_ENVIO'
                                    ? 'Enviar test por WhatsApp'
                                    : 'Reenviar WhatsApp'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => copiarEnlaceAltaNivel(alta)}
                                  style={botonSecundario}
                                >
                                  Copiar enlace
                                </button>
                              </div>
                            )}
                          </div>

                          {respondido && (
                            <>
                              <div
                                style={{
                                  display: 'grid',
                                  gridTemplateColumns: 'repeat(auto-fit, minmax(135px, 1fr))',
                                  gap: 8,
                                }}
                              >
                                {[
                                  ['Experiencia', alta.respuesta_experiencia],
                                  ['Desplazamiento', alta.respuesta_desplazamiento],
                                  ['Frenado', alta.respuesta_frenado],
                                  ['Giros', alta.respuesta_giros],
                                  ['Remonte', alta.respuesta_remonte],
                                  ['Pista', alta.respuesta_pista],
                                  ['Control', alta.respuesta_control_velocidad],
                                  ['Técnica', alta.respuesta_tecnica],
                                ].map(([titulo, respuesta]) => {
                                  const claveDetalle = `${alta.id}-${String(titulo)}`;
                                  const detalleAbierto = detalleRespuestaAlta === claveDetalle;
                                  const detalle = detallePreguntaTestNivelApp(
                                    String(titulo),
                                    respuesta
                                  );

                                  return (
                                    <button
                                      key={String(titulo)}
                                      type="button"
                                      onClick={() =>
                                        setDetalleRespuestaAlta((actual) =>
                                          actual === claveDetalle ? '' : claveDetalle
                                        )
                                      }
                                      style={{
                                        ...miniTarjetaBlanca,
                                        padding: 10,
                                        border: detalleAbierto
                                          ? '1px solid #93c5fd'
                                          : '1px solid #e2e8f0',
                                        background: detalleAbierto
                                          ? '#eff6ff'
                                          : '#ffffff',
                                        textAlign: 'left',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <div
                                        style={{
                                          display: 'flex',
                                          gap: 8,
                                          alignItems: 'center',
                                        }}
                                      >
                                        <small
                                          style={{
                                            color: '#64748b',
                                            fontWeight: 800,
                                          }}
                                        >
                                          {String(titulo)}
                                        </small>
                                      </div>

                                      <div
                                        style={{
                                          marginTop: 3,
                                          fontSize: 18,
                                          fontWeight: 950,
                                          color: '#172033',
                                        }}
                                      >
                                        {detalle.respuestaTexto}
                                      </div>

                                      {detalleAbierto && (
                                        <div
                                          style={{
                                            marginTop: 9,
                                            paddingTop: 9,
                                            borderTop: '1px solid #bfdbfe',
                                            display: 'grid',
                                            gap: 5,
                                          }}
                                        >
                                          <div
                                            style={{
                                              fontSize: 13,
                                              fontWeight: 900,
                                              color: '#1e3a8a',
                                              lineHeight: 1.35,
                                            }}
                                          >
                                            {detalle.pregunta}
                                          </div>
                                          <div
                                            style={{
                                              fontSize: 13,
                                              color: '#475569',
                                              lineHeight: 1.4,
                                            }}
                                          >
                                            <strong>Respuesta de la familia:</strong>{' '}
                                            {detalle.respuestaTexto}
                                          </div>
                                        </div>
                                      )}
                                    </button>
                                  );
                                })}
                              </div>

                              {(
                                (alta.observaciones_entrenador_familia || [])
                                  .length > 0 ||
                                alta.observacion_entrenador_otra
                              ) && (
                                <div
                                  style={{
                                    ...avisoNeutral,
                                    borderColor: '#bfdbfe',
                                    background: '#eff6ff',
                                  }}
                                >
                                  <strong>
                                    Información de familia para el profesor:
                                  </strong>
                                  <div
                                    style={{
                                      display: 'flex',
                                      gap: 6,
                                      flexWrap: 'wrap',
                                      marginTop: 8,
                                    }}
                                  >
                                    {(alta.observaciones_entrenador_familia || [])
                                      .filter((codigo) => codigo !== 'NINGUNA')
                                      .map((codigo) => {
                                        const etiquetas: Record<string, string> = {
                                          MIEDO_INSEGURIDAD:
                                            'Miedo o inseguridad',
                                          BLOQUEO_LLANTO:
                                            'Se bloquea o llora',
                                          DIFICULTAD_REMONTES:
                                            'Dificultad con remontes',
                                          AYUDA_MATERIAL:
                                            'Necesita ayuda con material',
                                          SEPARACION_FAMILIA:
                                            'Le cuesta separarse de la familia',
                                          LIMITACION_FISICA:
                                            'Lesión / limitación física',
                                          NECESIDAD_ESPECIAL:
                                            'Necesidad especial comunicada',
                                          OTRA: 'Otra observación',
                                        };
                                        return (
                                          <span
                                            key={codigo}
                                            style={{
                                              ...miniBadge,
                                              whiteSpace: 'normal',
                                            }}
                                          >
                                            {etiquetas[codigo] || codigo}
                                          </span>
                                        );
                                      })}
                                  </div>
                                  {alta.observacion_entrenador_otra && (
                                    <p
                                      style={{
                                        margin: '8px 0 0',
                                        lineHeight: 1.45,
                                      }}
                                    >
                                      <strong>Otra:</strong>{' '}
                                      {alta.observacion_entrenador_otra}
                                    </p>
                                  )}
                                </div>
                              )}

                              {alta.observaciones_familia && (
                                <div
                                  style={{
                                    ...avisoNeutral,
                                    borderColor: '#e2e8f0',
                                    background: '#f8fafc',
                                  }}
                                >
                                  <strong>Comentario para coordinación:</strong>{' '}
                                  {alta.observaciones_familia}
                                  <div
                                    style={{
                                      marginTop: 5,
                                      color: '#64748b',
                                      fontSize: 12,
                                      fontWeight: 700,
                                    }}
                                  >
                                    No se añade automáticamente a la ficha del
                                    alumno ni al profesor.
                                  </div>
                                </div>
                              )}

                              <div
                                style={{
                                  padding: 14,
                                  borderRadius: 16,
                                  border: alta.requiere_revision_jefe
                                    ? '1px solid #fdba74'
                                    : '1px solid #bfdbfe',
                                  background: alta.requiere_revision_jefe
                                    ? '#fff7ed'
                                    : '#eff6ff',
                                }}
                              >
                                <strong style={{ fontSize: 18 }}>
                                  Nivel propuesto: {alta.nivel_propuesto || 'Pendiente'}
                                </strong>
                                <p style={{ margin: '6px 0 0', color: '#475569' }}>
                                  Fiabilidad del nivel propuesto: {alta.nivel_propuesto_confianza || '-'}
                                </p>
                                <p style={{ margin: '6px 0 0', color: '#475569' }}>
                                  {alta.nivel_propuesto_motivo || 'Pendiente de valoración.'}
                                </p>
                              </div>

                              {esCoordinadorJefeApp ? (
                                <div
                                  style={{
                                    display: 'grid',
                                    gridTemplateColumns:
                                      'repeat(auto-fit, minmax(180px, 1fr))',
                                    gap: 8,
                                    alignItems: 'end',
                                  }}
                                >
                                  <label style={labelCampo}>
                                    Nivel que validas
                                    <select
                                      value={
                                        nivelesValidacionAlta[alta.id] ||
                                        (parseTechnicalLevel(alta.nivel_propuesto)
                                          .status === 'VALID'
                                          ? alta.nivel_propuesto || ''
                                          : '')
                                      }
                                      onChange={(e) =>
                                        setNivelesValidacionAlta({
                                          ...nivelesValidacionAlta,
                                          [alta.id]: e.target.value,
                                        })
                                      }
                                      style={selectCampo}
                                    >
                                      <option value="">Selecciona nivel</option>
                                      {opcionesNivel.map((nivel) => (
                                        <option key={nivel} value={nivel}>
                                          {nivel}
                                        </option>
                                      ))}
                                    </select>
                                  </label>

                                  <button
                                    type="button"
                                    onClick={() => validarAltaNivelInicial(alta)}
                                    style={botonPrincipal}
                                  >
                                    Validar nivel
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => descartarAltaNivelInicial(alta)}
                                    style={botonPeligro}
                                  >
                                    Descartar
                                  </button>
                                </div>
                              ) : (
                                <div style={avisoNeutral}>
                                  Test recibido. Pendiente de revisión del Coordinador jefe.
                                </div>
                              )}
                            </>
                          )}

                          {validado && (
                            <div
                              style={{
                                marginTop: 2,
                                padding: 14,
                                borderRadius: 16,
                                border: '1px solid #bbf7d0',
                                background: '#f0fdf4',
                                display: 'grid',
                                gap: 10,
                              }}
                            >
                              <div>
                                <strong style={{ color: '#166534' }}>
                                  Nivel validado: {alta.nivel_validado}
                                </strong>
                                <div
                                  style={{
                                    marginTop: 4,
                                    color: '#475569',
                                    fontSize: 13,
                                  }}
                                >
                                  Revisión completada. Añádelo ahora a {alta.modalidad} desde este mismo bloque.
                                </div>
                              </div>

                              {alta.modalidad === 'INTENSIVOS' && (
                                <label style={labelCampo}>
                                  Intensivo de destino
                                  <select
                                    value={intensivoAltaSeleccionado[alta.id] || ''}
                                    onChange={(e) =>
                                      setIntensivoAltaSeleccionado({
                                        ...intensivoAltaSeleccionado,
                                        [alta.id]: e.target.value,
                                      })
                                    }
                                    style={selectCampo}
                                  >
                                    <option value="">Selecciona Intensivo...</option>
                                    {intensivosAltaNivel.map((intensivo) => (
                                      <option
                                        key={intensivo.intensivo_id}
                                        value={intensivo.intensivo_id}
                                      >
                                        {intensivo.intensivo}
                                        {intensivo.fecha_inicio
                                          ? ` · ${formatearFecha(intensivo.fecha_inicio)}`
                                          : ''}
                                        {intensivo.lugar
                                          ? ` · ${intensivo.lugar}`
                                          : ''}
                                      </option>
                                    ))}
                                  </select>
                                </label>
                              )}

                              {esCoordinadorJefeApp &&
                                (coincidenciasAltaNivel[alta.id] || []).some(
                                  (item) =>
                                    item.tipo_coincidencia === 'MISMA_FECHA'
                                ) &&
                                !(coincidenciasAltaNivel[alta.id] || []).some(
                                  (item) => item.tipo_coincidencia === 'EXACTA'
                                ) && (
                                  <div
                                    style={{
                                      padding: 13,
                                      borderRadius: 15,
                                      border: '1px solid #fdba74',
                                      background: '#fff7ed',
                                      display: 'grid',
                                      gap: 9,
                                    }}
                                  >
                                    <div>
                                      <strong style={{ color: '#9a3412' }}>
                                        Posible alumno ya existente
                                      </strong>
                                      <p
                                        style={{
                                          margin: '4px 0 0',
                                          color: '#7c2d12',
                                          fontSize: 13,
                                          lineHeight: 1.4,
                                        }}
                                      >
                                        Hay una o más fichas que podrían
                                        corresponder al mismo alumno por nombre y
                                        fecha de nacimiento. No se fusionará nada
                                        automáticamente: elige la opción correcta.
                                      </p>
                                    </div>

                                    {(coincidenciasAltaNivel[alta.id] || [])
                                      .filter(
                                        (item) =>
                                          item.tipo_coincidencia ===
                                          'MISMA_FECHA'
                                      )
                                      .map((item) => (
                                        <label
                                          key={item.alumno_id}
                                          style={{
                                            display: 'flex',
                                            gap: 9,
                                            alignItems: 'flex-start',
                                            padding: 10,
                                            borderRadius: 12,
                                            background: '#fff',
                                            border: '1px solid #fed7aa',
                                            cursor: 'pointer',
                                          }}
                                        >
                                          <input
                                            type="radio"
                                            name={`coincidencia-${alta.id}`}
                                            value={item.alumno_id}
                                            checked={
                                              resolucionCoincidenciaAlta[
                                                alta.id
                                              ] === item.alumno_id
                                            }
                                            onChange={() =>
                                              setResolucionCoincidenciaAlta(
                                                (actual) => ({
                                                  ...actual,
                                                  [alta.id]: item.alumno_id,
                                                })
                                              )
                                            }
                                          />
                                          <span>
                                            <strong>{item.alumno}</strong>
                                            <span
                                              style={{
                                                display: 'block',
                                                marginTop: 2,
                                                color: '#64748b',
                                                fontSize: 12,
                                              }}
                                            >
                                              {item.fecha_nacimiento
                                                ? formatearFecha(
                                                    item.fecha_nacimiento
                                                  )
                                                : 'Sin fecha registrada'}
                                              {' · '}
                                              Nivel actual:{' '}
                                              <strong>
                                                {item.nivel_actual || '-'}
                                              </strong>
                                            </span>
                                          </span>
                                        </label>
                                      ))}

                                    <label
                                      style={{
                                        display: 'flex',
                                        gap: 9,
                                        alignItems: 'flex-start',
                                        padding: 10,
                                        borderRadius: 12,
                                        background: '#fff',
                                        border: '1px solid #fed7aa',
                                        cursor: 'pointer',
                                      }}
                                    >
                                      <input
                                        type="radio"
                                        name={`coincidencia-${alta.id}`}
                                        value="__NUEVO__"
                                        checked={
                                          resolucionCoincidenciaAlta[alta.id] ===
                                          '__NUEVO__'
                                        }
                                        onChange={() =>
                                          setResolucionCoincidenciaAlta(
                                            (actual) => ({
                                              ...actual,
                                              [alta.id]: '__NUEVO__',
                                            })
                                          )
                                        }
                                      />
                                      <span>
                                        <strong>
                                          Es otro alumno · crear ficha nueva
                                        </strong>
                                        <span
                                          style={{
                                            display: 'block',
                                            marginTop: 2,
                                            color: '#64748b',
                                            fontSize: 12,
                                          }}
                                        >
                                          Usa esta opción solo si has comprobado
                                          que no corresponde a ninguna ficha
                                          anterior.
                                        </span>
                                      </span>
                                    </label>
                                  </div>
                                )}

                              {esCoordinadorJefeApp && (
                                <button
                                  type="button"
                                  disabled={
                                    anadiendoAltaNivelId === alta.id ||
                                    comprobandoCoincidenciasAltaId === alta.id ||
                                    (alta.modalidad === 'INTENSIVOS' &&
                                      !intensivoAltaSeleccionado[alta.id])
                                  }
                                  onClick={() => anadirAltaNivelAListados(alta)}
                                  style={{
                                    ...botonPrincipal,
                                    opacity:
                                      anadiendoAltaNivelId === alta.id ||
                                      comprobandoCoincidenciasAltaId === alta.id ||
                                      (alta.modalidad === 'INTENSIVOS' &&
                                        !intensivoAltaSeleccionado[alta.id])
                                        ? 0.55
                                        : 1,
                                  }}
                                >
                                  {comprobandoCoincidenciasAltaId === alta.id
                                    ? 'Comprobando ficha...'
                                    : anadiendoAltaNivelId === alta.id
                                    ? 'Añadiendo...'
                                    : coincidenciasAltaNivel[alta.id]
                                    ? `Añadir a ${alta.modalidad}`
                                    : `Comprobar y añadir a ${alta.modalidad}`}
                                </button>
                              )}
                            </div>
                          )}

                          {anadido && (
                            <div
                              style={{
                                ...avisoCompleto,
                                marginTop: 2,
                                background: '#f0fdfa',
                                border: '1px solid #99f6e4',
                                color: '#115e59',
                                display: 'grid',
                                gap: 10,
                                minWidth: 0,
                              }}
                            >
                              <div style={{ minWidth: 0 }}>
                                <strong>
                                  Añadido correctamente a {alta.modalidad}.
                                </strong>
                                <div
                                  style={{
                                    marginTop: 4,
                                    lineHeight: 1.45,
                                    overflowWrap: 'anywhere',
                                  }}
                                >
                                  {alta.eliminar_despues_de
                                    ? `Este registro temporal se limpiará automáticamente el ${formatearFecha(
                                        String(
                                          alta.eliminar_despues_de
                                        ).slice(0, 10)
                                      )}.`
                                    : 'Este registro temporal se limpiará automáticamente cuando corresponda.'}
                                </div>
                              </div>

                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'flex-end',
                                  flexWrap: 'wrap',
                                  gap: 8,
                                }}
                              >
                                <button
                                  type="button"
                                  onClick={() =>
                                    borrarRegistroTemporalAnadido(alta)
                                  }
                                  style={{
                                    ...botonSecundario,
                                    width: 'auto',
                                    maxWidth: '100%',
                                    whiteSpace: 'normal',
                                  }}
                                >
                                  Borrar registro temporal
                                </button>
                              </div>
                            </div>
                          )}

                          {descartado && (
                            <div style={{ ...avisoNeutral, marginTop: 2 }}>
                              Solicitud descartada. La limpieza automática de 7 días se
                              activará cuando cerremos el flujo de incorporación.
                            </div>
                          )}

                          {!respondido && !validado && !anadido && !descartado && (
                            <div style={{ ...avisoNeutral, marginTop: 2 }}>
                              {alta.estado === 'ENVIADO'
                                ? 'Esperando respuesta de la familia.'
                                : 'Test preparado. Falta enviarlo a la familia.'}
                            </div>
                          )}

                          {puedeEliminarAlta && (
                            <div
                              style={{
                                marginTop: 4,
                                paddingTop: 10,
                                borderTop: '1px solid #e2e8f0',
                                display: 'flex',
                                justifyContent: 'flex-end',
                              }}
                            >
                              <button
                                type="button"
                                onClick={() => eliminarAltaNivelInicial(alta)}
                                style={{
                                  ...botonPeligro,
                                  background: '#ffffff',
                                  color: '#b91c1c',
                                  border: '1px solid #fecaca',
                                  boxShadow: 'none',
                                }}
                              >
                                Eliminar alta
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </article>
                  );
                })}
            </section>
          </section>
        )}

    </>
  );
}

