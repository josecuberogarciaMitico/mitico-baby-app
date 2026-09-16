import React from 'react';

type TrainerManagementScreenProps = {
  ctx: Record<string, any>;
};

export function TrainerManagementScreen({ ctx }: TrainerManagementScreenProps) {
  const {
    abrirEditarEntrenador,
    abrirNuevoEntrenador,
    agendaBadgeModalidad,
    agendaBloqueBlanco,
    alternarEspecialidadEntrenador,
    botonMenu,
    botonMini,
    botonPeligro,
    botonPrincipal,
    botonSecundario,
    buscador,
    busquedaEntrenador,
    cabeceraPantalla,
    cargando,
    cargandoEstadosAccesoEntrenadores,
    cargandoEstadosAvisosEntrenadores,
    cargarEntrenadores,
    cargarEstadosAccesoEntrenadores,
    creandoAccesoEntrenadorId,
    crearAccesoAppEntrenador,
    eliminarEntrenadorGestion,
    entrenadoresFiltrados,
    entrenadorFormInicial,
    error,
    esCoordinadorApp,
    estadosAccesoEntrenadores,
    estadosAvisosEntrenadores,
    etiquetaSuperior,
    filtroEntrenadores,
    formEntrenador,
    gestionandoAccesoEntrenadorId,
    gestionarAccesoEntrenador,
    gridFormulario,
    gridMiniMetricas,
    guardarEntrenadorGestion,
    inputCampo,
    labelCampo,
    miniMetrica,
    miniTarjetaBlanca,
    mostrarFormularioEntrenador,
    opcionesDocumentoEntrenador,
    opcionesEspecialidadEntrenador,
    pantalla,
    pedirDatosAltaEntrenadorWhatsapp,
    puedeGestionarAccesosUsuarioApp,
    renderAyudaRapidaPantallaApp,
    selectCampo,
    setBusquedaEntrenador,
    setFiltroEntrenadores,
    setFormEntrenador,
    setMostrarFormularioEntrenador,
    tarjeta,
    tarjetaMovilVacia,
  } = ctx;

  return (
    <>
        {pantalla === 'entrenadores' && (
          <section>
            <div style={cabeceraPantalla}>
              <div>
                <h2>Entrenadores / gestión</h2>
                {renderAyudaRapidaPantallaApp()}
                <p style={{ margin: '6px 0 0', color: '#555' }}>
                  Alta, contacto, especialidades, chaqueta y documentación. Los
                  cobros se gestionan en Cobros.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={abrirNuevoEntrenador}
                  style={botonPrincipal}
                >
                  + Añadir entrenador
                </button>
                <button onClick={cargarEntrenadores} style={botonSecundario}>
                  Refrescar
                </button>
              </div>
            </div>
  
            {mostrarFormularioEntrenador && (
              <article
                id="formulario-gestion-entrenador"
                style={{
                  ...agendaBloqueBlanco,
                  scrollMarginTop: 18,
                  border: '1px solid #bfdbfe',
                  background:
                    'linear-gradient(135deg, rgba(239,246,255,0.96), rgba(255,255,255,0.98))',
                  boxShadow: '0 14px 34px rgba(37,99,235,0.08)',
                }}
              >
                <h3 style={{ marginTop: 0 }}>
                  {formEntrenador.id ? 'Editar entrenador' : 'Alta de entrenador'}
                </h3>
                <p style={{ marginTop: 0, color: '#555' }}>
                  Para que puedan usar la app necesitas al menos nombre. El email
                  es recomendable para acceso/login y el teléfono para WhatsApp.
                </p>
  
                <div style={gridFormulario}>
                  <label style={labelCampo}>
                    Nombre completo
                    <input
                      value={formEntrenador.nombre}
                      onChange={(e) =>
                        setFormEntrenador({
                          ...formEntrenador,
                          nombre: e.target.value,
                        })
                      }
                      placeholder="Nombre y apellidos"
                      style={inputCampo}
                    />
                  </label>
  
                  <label style={labelCampo}>
                    Email acceso app
                    <input
                      value={formEntrenador.email}
                      onChange={(e) =>
                        setFormEntrenador({
                          ...formEntrenador,
                          email: e.target.value,
                        })
                      }
                      placeholder="correo@ejemplo.com"
                      style={inputCampo}
                    />
                  </label>
  
                  <label style={labelCampo}>
                    Teléfono / WhatsApp
                    <input
                      value={formEntrenador.telefono}
                      onChange={(e) =>
                        setFormEntrenador({
                          ...formEntrenador,
                          telefono: e.target.value,
                        })
                      }
                      placeholder="600000000"
                      style={inputCampo}
                    />
                  </label>
  
                  <label style={labelCampo}>
                    Tarifa por turno
                    <input
                      value={formEntrenador.tarifa}
                      onChange={(e) =>
                        setFormEntrenador({
                          ...formEntrenador,
                          tarifa: e.target.value,
                        })
                      }
                      placeholder="0"
                      type="number"
                      style={inputCampo}
                    />
                  </label>
                </div>
  
                <div
                  style={{
                    display: 'flex',
                    gap: 10,
                    flexWrap: 'wrap',
                    marginTop: 12,
                  }}
                >
                  <label style={{ ...miniTarjetaBlanca, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formEntrenador.activo}
                      onChange={(e) =>
                        setFormEntrenador({
                          ...formEntrenador,
                          activo: e.target.checked,
                        })
                      }
                    />{' '}
                    Activo esta temporada
                  </label>
                  <label style={{ ...miniTarjetaBlanca, cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={formEntrenador.chaqueta}
                      onChange={(e) =>
                        setFormEntrenador({
                          ...formEntrenador,
                          chaqueta: e.target.checked,
                        })
                      }
                    />{' '}
                    Chaqueta entregada
                  </label>
                </div>
  
                <h4>Especialidades</h4>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {opcionesEspecialidadEntrenador.map((especialidad) => (
                    <label
                      key={especialidad}
                      style={botonMenu(
                        formEntrenador.especialidades.includes(especialidad)
                      )}
                    >
                      <input
                        type="checkbox"
                        checked={formEntrenador.especialidades.includes(
                          especialidad
                        )}
                        onChange={() =>
                          alternarEspecialidadEntrenador(especialidad)
                        }
                        style={{ display: 'none' }}
                      />
                      {especialidad}
                    </label>
                  ))}
                </div>
  
                <h4>Documentación</h4>
                <div style={gridFormulario}>
                  <label style={labelCampo}>
                    Titulación
                    <select
                      value={formEntrenador.titulacionEstado}
                      onChange={(e) =>
                        setFormEntrenador({
                          ...formEntrenador,
                          titulacionEstado: e.target.value,
                        })
                      }
                      style={selectCampo}
                    >
                      {opcionesDocumentoEntrenador.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={labelCampo}>
                    Enlace titulación
                    <input
                      value={formEntrenador.titulacionUrl}
                      onChange={(e) =>
                        setFormEntrenador({
                          ...formEntrenador,
                          titulacionUrl: e.target.value,
                        })
                      }
                      placeholder="Drive / PDF / enlace interno"
                      style={inputCampo}
                    />
                  </label>
                  <label style={labelCampo}>
                    Antecedentes sexuales
                    <select
                      value={formEntrenador.antecedentesEstado}
                      onChange={(e) =>
                        setFormEntrenador({
                          ...formEntrenador,
                          antecedentesEstado: e.target.value,
                        })
                      }
                      style={selectCampo}
                    >
                      {opcionesDocumentoEntrenador.map((opcion) => (
                        <option key={opcion} value={opcion}>
                          {opcion}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label style={labelCampo}>
                    Enlace antecedentes
                    <input
                      value={formEntrenador.antecedentesUrl}
                      onChange={(e) =>
                        setFormEntrenador({
                          ...formEntrenador,
                          antecedentesUrl: e.target.value,
                        })
                      }
                      placeholder="Drive / PDF / enlace interno"
                      style={inputCampo}
                    />
                  </label>
                </div>
  
                <label style={{ ...labelCampo, marginTop: 12 }}>
                  Observaciones internas
                  <textarea
                    value={formEntrenador.observaciones}
                    onChange={(e) =>
                      setFormEntrenador({
                        ...formEntrenador,
                        observaciones: e.target.value,
                      })
                    }
                    placeholder="Disponibilidad especial, forma de trabajar, restricciones, notas de coordinación..."
                    style={{ ...inputCampo, minHeight: 80 }}
                  />
                </label>
  
                <div
                  style={{
                    display: 'flex',
                    gap: 8,
                    flexWrap: 'wrap',
                    marginTop: 14,
                  }}
                >
                  <button
                    type="button"
                    onClick={guardarEntrenadorGestion}
                    style={botonPrincipal}
                  >
                    Guardar entrenador
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMostrarFormularioEntrenador(false);
                      setFormEntrenador(entrenadorFormInicial());
                    }}
                    style={botonSecundario}
                  >
                    Cancelar
                  </button>
                </div>
              </article>
            )}
  
            <input
              value={busquedaEntrenador}
              onChange={(e) => setBusquedaEntrenador(e.target.value)}
              placeholder="Buscar entrenador, teléfono, email o especialidad..."
              style={buscador}
            />
  
            <nav
              style={{
                display: 'flex',
                gap: 8,
                flexWrap: 'wrap',
                marginBottom: 16,
              }}
            >
              <button
                onClick={() => setFiltroEntrenadores('todos')}
                style={botonMenu(filtroEntrenadores === 'todos')}
              >
                Todos
              </button>
              <button
                onClick={() => setFiltroEntrenadores('activos')}
                style={botonMenu(filtroEntrenadores === 'activos')}
              >
                Activos
              </button>
              <button
                onClick={() => setFiltroEntrenadores('inactivos')}
                style={botonMenu(filtroEntrenadores === 'inactivos')}
              >
                Inactivos
              </button>
              <button
                onClick={() => setFiltroEntrenadores('sin_chaqueta')}
                style={botonMenu(filtroEntrenadores === 'sin_chaqueta')}
              >
                Sin chaqueta
              </button>
              <button
                onClick={() => setFiltroEntrenadores('documentacion_pendiente')}
                style={botonMenu(
                  filtroEntrenadores === 'documentacion_pendiente'
                )}
              >
                Documentación pendiente
              </button>
            </nav>
  
            {cargando && <p>Cargando entrenadores...</p>}
  
            {!cargando && entrenadoresFiltrados.length === 0 && !error && (
              <article style={tarjetaMovilVacia}>
                <h3 style={{ marginTop: 0 }}>Sin entrenadores en este filtro</h3>
                <p style={{ marginBottom: 0 }}>
                  Puedes añadir el primer entrenador con el botón superior.
                </p>
              </article>
            )}
  
            <section style={{ display: 'grid', gap: 12 }}>
              {entrenadoresFiltrados.map((entrenador) => {
                const documentacionOk =
                  (entrenador.titulacion_estado || 'Pendiente') === 'Validado' &&
                  (entrenador.antecedentes_estado || 'Pendiente') === 'Validado';
  
                const acceso =
                  estadosAccesoEntrenadores[entrenador.entrenador_id] || null;
                const gestionandoAcceso =
                  creandoAccesoEntrenadorId === entrenador.entrenador_id ||
                  gestionandoAccesoEntrenadorId === entrenador.entrenador_id;
                const estadoAvisos =
                  estadosAvisosEntrenadores[entrenador.entrenador_id] || null;
  
                const textoEstadoAcceso =
                  acceso?.estado === 'activo'
                    ? 'Acceso activo'
                    : acceso?.estado === 'invitacion_pendiente'
                    ? 'Invitación pendiente'
                    : acceso?.estado === 'desactivado'
                    ? 'Acceso desactivado'
                    : acceso?.estado === 'revisar'
                    ? 'Revisar acceso'
                    : 'Sin acceso';
  
                const estiloEstadoAcceso =
                  acceso?.estado === 'activo'
                    ? {
                        background: '#ecfdf5',
                        color: '#047857',
                        borderColor: '#a7f3d0',
                      }
                    : acceso?.estado === 'invitacion_pendiente'
                    ? {
                        background: '#fff7ed',
                        color: '#9a3412',
                        borderColor: '#fed7aa',
                      }
                    : acceso?.estado === 'desactivado'
                    ? {
                        background: '#fef2f2',
                        color: '#b91c1c',
                        borderColor: '#fecaca',
                      }
                    : {
                        background: '#f8fafc',
                        color: '#64748b',
                        borderColor: '#cbd5e1',
                      };
  
                return (
                  <article
                    id={`entrenador-${entrenador.entrenador_id}`}
                    key={entrenador.entrenador_id}
                    style={{
                      ...tarjeta,
                      border: '1px solid #dbeafe',
                      background:
                        'linear-gradient(135deg, rgba(255,255,255,0.99), rgba(248,250,252,0.98))',
                      boxShadow: '0 10px 28px rgba(15,23,42,0.06)',
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
                      <div>
                        <p style={{ ...etiquetaSuperior, color: '#0f9f4d' }}>ENTRENADOR</p>
                        <h3 style={{ margin: 0 }}>
                          {entrenador.nombre_completo}
                        </h3>
                        <div
                          style={{
                            display: 'flex',
                            gap: 7,
                            flexWrap: 'wrap',
                            marginTop: 8,
                          }}
                        >
                          <span
                            style={{
                              ...agendaBadgeModalidad,
                              background: entrenador.activo
                                ? '#ecfdf5'
                                : '#f8fafc',
                              color: entrenador.activo ? '#047857' : '#64748b',
                              borderColor: entrenador.activo
                                ? '#a7f3d0'
                                : '#cbd5e1',
                            }}
                          >
                            {entrenador.activo ? 'Activo' : 'Inactivo'}
                          </span>
                          <span
                            style={{
                              ...agendaBadgeModalidad,
                              background: entrenador.chaqueta_entregada
                                ? '#eff6ff'
                                : '#fff7ed',
                              color: entrenador.chaqueta_entregada
                                ? '#1d4ed8'
                                : '#9a3412',
                              borderColor: entrenador.chaqueta_entregada
                                ? '#bfdbfe'
                                : '#fed7aa',
                            }}
                          >
                            Chaqueta {entrenador.chaqueta_entregada ? 'OK' : 'pendiente'}
                          </span>
  
                          {puedeGestionarAccesosUsuarioApp && (
                            <span
                              style={{
                                ...agendaBadgeModalidad,
                                ...estiloEstadoAcceso,
                              }}
                            >
                              {cargandoEstadosAccesoEntrenadores && !acceso
                                ? 'Comprobando acceso…'
                                : textoEstadoAcceso}
                            </span>
                          )}
  
                          {esCoordinadorApp && (
                            <span
                              title={
                                estadoAvisos?.ultimo_dispositivo_visto
                                  ? `Último dispositivo visto: ${new Date(
                                      estadoAvisos.ultimo_dispositivo_visto
                                    ).toLocaleString('es-ES')}`
                                  : undefined
                              }
                              style={{
                                ...agendaBadgeModalidad,
                                background: estadoAvisos?.avisos_activos
                                  ? '#ecfdf5'
                                  : '#fff7ed',
                                color: estadoAvisos?.avisos_activos
                                  ? '#047857'
                                  : '#9a3412',
                                borderColor: estadoAvisos?.avisos_activos
                                  ? '#a7f3d0'
                                  : '#fed7aa',
                              }}
                            >
                              {cargandoEstadosAvisosEntrenadores && !estadoAvisos
                                ? 'Comprobando avisos…'
                                : estadoAvisos?.avisos_activos
                                ? 'Avisos OK'
                                : 'Avisos pendientes'}
                            </span>
                          )}
                        </div>
                      </div>
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fit, minmax(150px, 1fr))',
                          gap: 8,
                          width: '100%',
                          minWidth: 0,
                        }}
                      >
                        {puedeGestionarAccesosUsuarioApp &&
                          (cargandoEstadosAccesoEntrenadores && !acceso ? (
                            <button
                              type="button"
                              disabled
                              style={{
                                ...botonMini,
                                width: '100%',
                                minHeight: 42,
                                background: '#f8fafc',
                                color: '#64748b',
                                border: '1px solid #cbd5e1',
                                opacity: 0.7,
                              }}
                            >
                              Comprobando acceso…
                            </button>
                          ) : acceso?.estado === 'activo' ? (
                            <div
                              style={{
                                display: 'grid',
                                gridTemplateColumns:
                                  'repeat(auto-fit, minmax(140px, 1fr))',
                                gap: 8,
                                width: '100%',
                              }}
                            >
                              <button
                                type="button"
                                disabled={gestionandoAcceso}
                                onClick={() =>
                                  gestionarAccesoEntrenador(
                                    entrenador,
                                    'desactivar'
                                  )
                                }
                                style={{
                                  ...botonMini,
                                  width: '100%',
                                  minHeight: 42,
                                  whiteSpace: 'normal',
                                  background: '#fff1f2',
                                  color: '#be123c',
                                  border: '1px solid #fecdd3',
                                  fontWeight: 900,
                                  opacity: gestionandoAcceso ? 0.65 : 1,
                                }}
                              >
                                {gestionandoAcceso
                                  ? 'Gestionando…'
                                  : 'Desactivar acceso'}
                              </button>
  
                              <button
                                type="button"
                                disabled={gestionandoAcceso}
                                onClick={() =>
                                  gestionarAccesoEntrenador(
                                    entrenador,
                                    'enviar_recuperacion'
                                  )
                                }
                                style={{
                                  ...botonMini,
                                  width: '100%',
                                  minHeight: 42,
                                  whiteSpace: 'normal',
                                  background: '#eff6ff',
                                  color: '#1d4ed8',
                                  border: '1px solid #bfdbfe',
                                  fontWeight: 900,
                                  opacity: gestionandoAcceso ? 0.65 : 1,
                                }}
                              >
                                {gestionandoAcceso
                                  ? 'Enviando…'
                                  : 'Recuperar contraseña'}
                              </button>
                            </div>
                          ) : acceso?.estado === 'invitacion_pendiente' ? (
                            <button
                              type="button"
                              disabled={gestionandoAcceso}
                              onClick={() =>
                                gestionarAccesoEntrenador(
                                  entrenador,
                                  'reenviar_invitacion'
                                )
                              }
                              style={{
                                ...botonMini,
                                width: '100%',
                                minHeight: 42,
                                whiteSpace: 'normal',
                                background: '#fff7ed',
                                color: '#9a3412',
                                border: '1px solid #fed7aa',
                                fontWeight: 900,
                                opacity: gestionandoAcceso ? 0.65 : 1,
                              }}
                            >
                              {gestionandoAcceso
                                ? 'Reenviando…'
                                : 'Reenviar invitación'}
                            </button>
                          ) : acceso?.estado === 'desactivado' ? (
                            <button
                              type="button"
                              disabled={gestionandoAcceso}
                              onClick={() =>
                                gestionarAccesoEntrenador(entrenador, 'activar')
                              }
                              style={{
                                ...botonMini,
                                width: '100%',
                                minHeight: 42,
                                whiteSpace: 'normal',
                                background: '#ecfdf5',
                                color: '#047857',
                                border: '1px solid #a7f3d0',
                                fontWeight: 900,
                                opacity: gestionandoAcceso ? 0.65 : 1,
                              }}
                            >
                              {gestionandoAcceso
                                ? 'Activando…'
                                : 'Activar acceso'}
                            </button>
                          ) : acceso?.estado === 'revisar' ? (
                            <button
                              type="button"
                              onClick={() => cargarEstadosAccesoEntrenadores()}
                              style={{
                                ...botonMini,
                                width: '100%',
                                minHeight: 42,
                                background: '#f8fafc',
                                color: '#475569',
                                border: '1px solid #cbd5e1',
                                fontWeight: 900,
                              }}
                            >
                              Revisar acceso
                            </button>
                          ) : (
                            <button
                              type="button"
                              disabled={gestionandoAcceso}
                              onClick={() => crearAccesoAppEntrenador(entrenador)}
                              style={{
                                ...botonMini,
                                width: '100%',
                                minWidth: 0,
                                minHeight: 42,
                                whiteSpace: 'normal',
                                lineHeight: 1.15,
                                overflowWrap: 'break-word',
                                textAlign: 'center',
                                background: '#f5f3ff',
                                color: '#6d28d9',
                                border: '1px solid #ddd6fe',
                                fontWeight: 900,
                                opacity: gestionandoAcceso ? 0.65 : 1,
                              }}
                            >
                              {gestionandoAcceso
                                ? 'Creando acceso…'
                                : 'Crear acceso app'}
                            </button>
                          ))}
                        <button
                          type="button"
                          onClick={() => pedirDatosAltaEntrenadorWhatsapp(entrenador)}
                          style={{
                            ...botonMini,
                            width: '100%',
                            minWidth: 0,
                            minHeight: 42,
                            whiteSpace: 'normal',
                            lineHeight: 1.15,
                            overflowWrap: 'break-word',
                            textAlign: 'center',
                            background: '#ecfdf5',
                            color: '#047857',
                            border: '1px solid #a7f3d0',
                            fontWeight: 900,
                          }}
                        >
                          Pedir datos
                        </button>
                        <button
                          type="button"
                          onClick={() => abrirEditarEntrenador(entrenador)}
                          style={{
                            ...botonMini,
                            width: '100%',
                            minWidth: 0,
                            minHeight: 42,
                            whiteSpace: 'normal',
                            lineHeight: 1.15,
                            overflowWrap: 'break-word',
                            textAlign: 'center',
                            background: '#eff6ff',
                            color: '#1d4ed8',
                            border: '1px solid #bfdbfe',
                            fontWeight: 900,
                          }}
                        >
                          Editar ficha
                        </button>
                        <button
                          type="button"
                          onClick={() => eliminarEntrenadorGestion(entrenador)}
                          style={{
                            ...botonPeligro,
                            width: '100%',
                            minWidth: 0,
                            minHeight: 42,
                            whiteSpace: 'normal',
                            lineHeight: 1.15,
                            overflowWrap: 'break-word',
                            textAlign: 'center',
                            background: '#fff1f2',
                            color: '#be123c',
                            borderColor: '#fecdd3',
                          }}
                        >
                          Eliminar
                        </button>
                      </div>
                    </div>
  
                    <div style={{ ...gridMiniMetricas, marginTop: 14 }}>
                      <div
                        style={{
                          ...miniMetrica,
                          background: '#f8fafc',
                          borderColor: '#e2e8f0',
                        }}
                      >
                        <strong>Contacto</strong>
                        <span>Email: {entrenador.email || '-'}</span>
                        <span>WhatsApp: {entrenador.telefono || '-'}</span>
                      </div>
                      <div
                        style={{
                          ...miniMetrica,
                          background: '#f0fdf4',
                          borderColor: '#bbf7d0',
                        }}
                      >
                        <strong>Especialidades</strong>
                        <span>
                          {(entrenador.especialidades || []).length > 0
                            ? (entrenador.especialidades || []).join(' · ')
                            : 'Sin marcar'}
                        </span>
                      </div>
                      <div
                        style={{
                          ...miniMetrica,
                          background: '#fff7ed',
                          borderColor: '#fed7aa',
                        }}
                      >
                        <strong>Documentación</strong>
                        <span>
                          Titulación:{' '}
                          {entrenador.titulacion_estado || 'Pendiente'}
                        </span>
                        <span>
                          Antecedentes:{' '}
                          {entrenador.antecedentes_estado || 'Pendiente'}
                        </span>
                      </div>
                      <div
                        style={{
                          ...miniMetrica,
                          background: documentacionOk ? '#ecfdf5' : '#fef2f2',
                          borderColor: documentacionOk ? '#a7f3d0' : '#fecaca',
                        }}
                      >
                        <strong>Estado operativo</strong>
                        <span>
                          {documentacionOk
                            ? 'Documentación OK'
                            : 'Revisar documentación'}
                        </span>
                        <span>
                          Tarifa: {entrenador.tarifa_por_turno || 0} € / turno
                        </span>
                      </div>
                    </div>
  
                    {(entrenador.titulacion_url ||
                      entrenador.antecedentes_url ||
                      entrenador.observaciones_internas) && (
                      <details>
                        <summary style={{ cursor: 'pointer', fontWeight: 900 }}>
                          Ver documentos y notas
                        </summary>
                        <div style={{ marginTop: 10, display: 'grid', gap: 6 }}>
                          <p style={{ margin: 0 }}>
                            <strong>Titulación:</strong>{' '}
                            {entrenador.titulacion_url || '-'}{' '}
                            {entrenador.titulacion_observaciones
                              ? `· ${entrenador.titulacion_observaciones}`
                              : ''}
                          </p>
                          <p style={{ margin: 0 }}>
                            <strong>Antecedentes:</strong>{' '}
                            {entrenador.antecedentes_url || '-'}{' '}
                            {entrenador.antecedentes_observaciones
                              ? `· ${entrenador.antecedentes_observaciones}`
                              : ''}
                          </p>
                          <p style={{ margin: 0 }}>
                            <strong>Notas:</strong>{' '}
                            {entrenador.observaciones_internas || '-'}
                          </p>
                        </div>
                      </details>
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

