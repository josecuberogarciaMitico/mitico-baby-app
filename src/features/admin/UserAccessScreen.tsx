import React from 'react';

type UserAccessScreenProps = {
  ctx: Record<string, any>;
};

export function UserAccessScreen({ ctx }: UserAccessScreenProps) {
  const {
    agendaBadgeModalidad,
    agendaBloqueBlanco,
    botonMini,
    botonPrincipal,
    botonSecundario,
    cargandoUsuariosOperativos,
    cargarUsuariosOperativos,
    crearUsuarioOperativo,
    error,
    esCoordinadorJefeApp,
    formUsuarioOperativo,
    gestionandoUsuarioOperativoId,
    gestionarUsuarioOperativo,
    gridFormulario,
    inputCampo,
    labelCampo,
    mostrarAltaUsuarioOperativo,
    pantalla,
    renderAyudaRapidaPantallaApp,
    rolUsuarioTextoApp,
    selectCampo,
    setFormUsuarioOperativo,
    setMostrarAltaUsuarioOperativo,
    tarjetaMovilVacia,
    usuariosOperativos,
  } = ctx;

  return (
    <>
        {pantalla === 'usuarios' && esCoordinadorJefeApp && (
          <section>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                gap: 16,
                flexWrap: 'wrap',
                borderRadius: 24,
                padding: 20,
                background:
                  'linear-gradient(135deg, #062d3f 0%, #083b4d 58%, #0b5d4f 100%)',
                border: '1px solid rgba(16,185,129,0.28)',
                boxShadow: '0 18px 44px rgba(15,23,42,0.16)',
                color: '#ffffff',
              }}
            >
              <div style={{ minWidth: 0, flex: '1 1 560px' }}>
                <span
                  style={{
                    color: '#86efac',
                    fontWeight: 950,
                    fontSize: 11,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                  }}
                >
                  DIRECCIÓN · ACCESOS
                </span>
                <h2 style={{ margin: '5px 0 0', color: '#ffffff', fontSize: 30 }}>
                  Accesos equipo
                </h2>
                {renderAyudaRapidaPantallaApp()}
                <p
                  style={{
                    margin: '8px 0 0',
                    color: '#cbd5e1',
                    lineHeight: 1.45,
                    maxWidth: 780,
                  }}
                >
                  Cuentas de coordinación y administración. Los entrenadores se gestionan desde su propia ficha.
                </p>
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <button
                  type="button"
                  onClick={() => setMostrarAltaUsuarioOperativo(true)}
                  style={{
                    ...botonPrincipal,
                    background: '#ffffff',
                    color: '#064e3b',
                    border: '1px solid #ffffff',
                  }}
                >
                  + Crear acceso
                </button>
                <button
                  type="button"
                  onClick={cargarUsuariosOperativos}
                  style={{
                    ...botonSecundario,
                    background: 'rgba(255,255,255,.10)',
                    color: '#ffffff',
                    border: '1px solid rgba(255,255,255,.28)',
                  }}
                >
                  Actualizar
                </button>
              </div>
            </div>
  
            {mostrarAltaUsuarioOperativo && (
              <article
                style={{
                  ...agendaBloqueBlanco,
                  border: '1px solid #fecdd3',
                  background:
                    'linear-gradient(135deg, rgba(255,241,242,0.95), rgba(255,255,255,0.98))',
                }}
              >
                <h3 style={{ marginTop: 0 }}>Nuevo acceso de equipo</h3>
  
                <div style={gridFormulario}>
                  <label style={labelCampo}>
                    Nombre completo
                    <input
                      value={formUsuarioOperativo.nombre}
                      onChange={(e) =>
                        setFormUsuarioOperativo({
                          ...formUsuarioOperativo,
                          nombre: e.target.value,
                        })
                      }
                      placeholder="Nombre y apellidos"
                      style={inputCampo}
                    />
                  </label>
  
                  <label style={labelCampo}>
                    Email
                    <input
                      value={formUsuarioOperativo.email}
                      onChange={(e) =>
                        setFormUsuarioOperativo({
                          ...formUsuarioOperativo,
                          email: e.target.value,
                        })
                      }
                      placeholder="correo@ejemplo.com"
                      style={inputCampo}
                    />
                  </label>
  
                  <label style={labelCampo}>
                    Rol
                    <select
                      value={formUsuarioOperativo.rol}
                      onChange={(e) =>
                        setFormUsuarioOperativo({
                          ...formUsuarioOperativo,
                          rol: e.target.value as
                            | 'sub_coordinador'
                            | 'administracion',
                        })
                      }
                      style={selectCampo}
                    >
                      <option value="sub_coordinador">Sub-coordinador</option>
                      <option value="administracion">Administración</option>
                    </select>
                  </label>
                </div>
  
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
                    disabled={gestionandoUsuarioOperativoId === 'nuevo'}
                    onClick={crearUsuarioOperativo}
                    style={botonPrincipal}
                  >
                    {gestionandoUsuarioOperativoId === 'nuevo'
                      ? 'Enviando invitación…'
                      : 'Crear acceso y enviar invitación'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setMostrarAltaUsuarioOperativo(false)}
                    style={botonSecundario}
                  >
                    Cancelar
                  </button>
                </div>
              </article>
            )}
  
            {cargandoUsuariosOperativos && <p>Cargando accesos…</p>}
  
            {!cargandoUsuariosOperativos &&
              usuariosOperativos.length === 0 &&
              !error && (
                <article style={tarjetaMovilVacia}>
                  <h3 style={{ marginTop: 0 }}>Sin usuarios operativos</h3>
                  <p style={{ marginBottom: 0 }}>
                    Aquí aparecerán los accesos de coordinación y administración.
                  </p>
                </article>
              )}
  
            <div style={{ display: 'grid', gap: 12 }}>
              {usuariosOperativos.map((usuario) => {
                const esJefe = usuario.rol === 'coordinador_jefe';
                const gestionando =
                  gestionandoUsuarioOperativoId === usuario.id;
  
                const textoEstado =
                  usuario.estado_acceso === 'activo'
                    ? 'Acceso activo'
                    : usuario.estado_acceso === 'invitacion_pendiente'
                    ? 'Invitación pendiente'
                    : usuario.estado_acceso === 'desactivado'
                    ? 'Acceso desactivado'
                    : 'Revisar acceso';
  
                const colorEstado =
                  usuario.estado_acceso === 'activo'
                    ? {
                        background: '#ecfdf5',
                        color: '#047857',
                        borderColor: '#a7f3d0',
                      }
                    : usuario.estado_acceso === 'invitacion_pendiente'
                    ? {
                        background: '#fff7ed',
                        color: '#9a3412',
                        borderColor: '#fed7aa',
                      }
                    : usuario.estado_acceso === 'desactivado'
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
                    key={usuario.id}
                    style={{
                      ...agendaBloqueBlanco,
                      border: '1px solid #e2e8f0',
                      marginBottom: 0,
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
                        <h3 style={{ margin: 0 }}>{usuario.nombre}</h3>
                        <p
                          style={{
                            margin: '5px 0 0',
                            color: '#475569',
                            overflowWrap: 'anywhere',
                          }}
                        >
                          {usuario.email}
                        </p>
                      </div>
  
                      <div
                        style={{
                          display: 'flex',
                          gap: 6,
                          flexWrap: 'wrap',
                        }}
                      >
                        <span
                          style={{
                            ...agendaBadgeModalidad,
                            background: esJefe ? '#fff1f2' : '#eff6ff',
                            color: esJefe ? '#be123c' : '#1d4ed8',
                            borderColor: esJefe ? '#fecdd3' : '#bfdbfe',
                          }}
                        >
                          {rolUsuarioTextoApp(usuario.rol)}
                        </span>
                        <span
                          style={{
                            ...agendaBadgeModalidad,
                            ...colorEstado,
                          }}
                        >
                          {textoEstado}
                        </span>
                      </div>
                    </div>
  
                    {esJefe ? (
                      <p
                        style={{
                          marginBottom: 0,
                          color: '#64748b',
                          fontWeight: 700,
                        }}
                      >
                        Cuenta principal protegida. No se puede modificar desde
                        esta pantalla.
                      </p>
                    ) : (
                      <div
                        style={{
                          display: 'grid',
                          gridTemplateColumns:
                            'repeat(auto-fit, minmax(160px, 1fr))',
                          gap: 8,
                          marginTop: 14,
                        }}
                      >
                        {usuario.estado_acceso === 'activo' && (
                          <>
                            <button
                              type="button"
                              disabled={gestionando}
                              onClick={() =>
                                gestionarUsuarioOperativo(
                                  usuario,
                                  'enviar_recuperacion'
                                )
                              }
                              style={{
                                ...botonMini,
                                width: '100%',
                                minHeight: 42,
                                background: '#eff6ff',
                                color: '#1d4ed8',
                                border: '1px solid #bfdbfe',
                                fontWeight: 900,
                              }}
                            >
                              Recuperar contraseña
                            </button>
                            <button
                              type="button"
                              disabled={gestionando}
                              onClick={() =>
                                gestionarUsuarioOperativo(
                                  usuario,
                                  'desactivar'
                                )
                              }
                              style={{
                                ...botonMini,
                                width: '100%',
                                minHeight: 42,
                                background: '#fff1f2',
                                color: '#be123c',
                                border: '1px solid #fecdd3',
                                fontWeight: 900,
                              }}
                            >
                              Desactivar acceso
                            </button>
                          </>
                        )}
  
                        {usuario.estado_acceso === 'invitacion_pendiente' && (
                          <button
                            type="button"
                            disabled={gestionando}
                            onClick={() =>
                              gestionarUsuarioOperativo(
                                usuario,
                                'reenviar_invitacion'
                              )
                            }
                            style={{
                              ...botonMini,
                              width: '100%',
                              minHeight: 42,
                              background: '#fff7ed',
                              color: '#9a3412',
                              border: '1px solid #fed7aa',
                              fontWeight: 900,
                            }}
                          >
                            Reenviar invitación
                          </button>
                        )}
  
                        {usuario.estado_acceso === 'desactivado' && (
                          <button
                            type="button"
                            disabled={gestionando}
                            onClick={() =>
                              gestionarUsuarioOperativo(usuario, 'activar')
                            }
                            style={{
                              ...botonMini,
                              width: '100%',
                              minHeight: 42,
                              background: '#ecfdf5',
                              color: '#047857',
                              border: '1px solid #a7f3d0',
                              fontWeight: 900,
                            }}
                          >
                            Activar acceso
                          </button>
                        )}
                      </div>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        )}
  
      </>
  );
}

