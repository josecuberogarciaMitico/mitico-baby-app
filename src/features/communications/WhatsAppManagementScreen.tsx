import React from 'react';

type WhatsAppManagementScreenProps = {
  ctx: Record<string, any>;
};

export function WhatsAppManagementScreen({ ctx }: WhatsAppManagementScreenProps) {
  const {
    abrirWhatsappAdministracionApp,
    avisoNeutral,
    botonPeligroMini,
    botonPrincipal,
    botonSecundario,
    cargando,
    contextoWhatsappAdministracionApp,
    eliminarWhatsappAdministracionApp,
    enlaceWhatsappPorClaveApp,
    esCoordinadorJefeApp,
    esEnlaceGrupoWhatsappValido,
    formatearFecha,
    guardarWhatsappAdministracionApp,
    inputCampo,
    intensivosAltaNivel,
    labelCampo,
    pantalla,
    renderAyudaRapidaPantallaApp,
    selectCampo,
    setWhatsappAdminEnlace,
    setWhatsappAdminIntensivoId,
    setWhatsappAdminTipo,
    tarjeta,
    whatsappAdminEnlace,
    whatsappAdminIntensivoId,
    whatsappAdminTipo,
  } = ctx;

  return (
    <>
        {pantalla === 'whatsappDireccion' && esCoordinadorJefeApp && (
          <section style={{ display: 'grid', gap: 16, minWidth: 0 }}>
            <article
              style={{
                borderRadius: 24,
                padding: 20,
                background:
                  'linear-gradient(135deg, #062d3f 0%, #083b4d 58%, #0b5d4f 100%)',
                border: '1px solid rgba(16,185,129,0.28)',
                boxShadow: '0 18px 44px rgba(15,23,42,0.12)',
                color: '#fff',
              }}
            >
              <p
                style={{
                  margin: 0,
                  fontSize: 11,
                  fontWeight: 900,
                  letterSpacing: 1.15,
                  color: '#86efac',
                }}
              >
                DIRECCIÓN
              </p>
              <h2 style={{ margin: '4px 0 0', fontSize: 30, color: '#ffffff' }}>
                WhatsApp
              </h2>
              {renderAyudaRapidaPantallaApp()}
              <p style={{ margin: '7px 0 0', color: '#cbd5e1', lineHeight: 1.45, maxWidth: 760 }}>
                Configura aquí los grupos de familias. Las pantallas de Baby, Ocio e Intensivos solo usan estos enlaces; no se modifican desde la operativa diaria.
              </p>
            </article>
  
            <article style={{ ...tarjeta, border: '1px solid #bbf7d0' }}>
              <div style={{ display: 'grid', gap: 14 }}>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {(['BABY', 'OCIO', 'INTENSIVOS'] as const).map((tipo) => (
                    <button
                      key={tipo}
                      type="button"
                      onClick={() => setWhatsappAdminTipo(tipo)}
                      style={whatsappAdminTipo === tipo ? botonPrincipal : botonSecundario}
                    >
                      {tipo === 'BABY' ? 'Baby' : tipo === 'OCIO' ? 'Ocio' : 'Intensivos'}
                    </button>
                  ))}
                </div>
  
                {whatsappAdminTipo === 'BABY' && (
                  <div style={avisoNeutral}>
                    <strong>Un único grupo de familias Baby.</strong>
                    <p style={{ margin: '5px 0 0' }}>
                      Se muestra el enlace que ya tenías guardado y se seguirá usando en Baby.
                    </p>
                  </div>
                )}
  
                {whatsappAdminTipo === 'OCIO' && (
                  <div style={avisoNeutral}>
                    <strong>Un único grupo de familias para todo Ocio.</strong>
                    <p style={{ margin: '5px 0 0' }}>
                      Jueves, sábado y domingo usan exactamente este mismo enlace.
                    </p>
                  </div>
                )}
  
                {whatsappAdminTipo === 'INTENSIVOS' && (
                  <label style={labelCampo}>
                    Intensivo
                    <select
                      value={whatsappAdminIntensivoId}
                      onChange={(e) => setWhatsappAdminIntensivoId(e.target.value)}
                      style={selectCampo}
                    >
                      <option value="">Selecciona intensivo</option>
                      {intensivosAltaNivel.map((intensivo) => (
                        <option key={intensivo.intensivo_id} value={intensivo.intensivo_id}>
                          {intensivo.intensivo}
                          {intensivo.fecha_inicio ? ` · ${formatearFecha(intensivo.fecha_inicio)}` : ''}
                        </option>
                      ))}
                    </select>
                    <small style={{ color: '#64748b' }}>
                      Cada intensivo tiene su propio grupo de familias.
                    </small>
                  </label>
                )}
  
                <label style={labelCampo}>
                  Enlace del grupo de WhatsApp
                  <input
                    type="url"
                    value={whatsappAdminEnlace}
                    onChange={(e) => setWhatsappAdminEnlace(e.target.value)}
                    placeholder="https://chat.whatsapp.com/..."
                    style={inputCampo}
                    disabled={whatsappAdminTipo === 'INTENSIVOS' && !whatsappAdminIntensivoId}
                  />
                </label>
  
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    disabled={cargando || (whatsappAdminTipo === 'INTENSIVOS' && !whatsappAdminIntensivoId)}
                    onClick={() => void guardarWhatsappAdministracionApp()}
                    style={botonPrincipal}
                  >
                    Guardar enlace
                  </button>
                  <button
                    type="button"
                    disabled={!esEnlaceGrupoWhatsappValido(whatsappAdminEnlace)}
                    onClick={abrirWhatsappAdministracionApp}
                    style={botonSecundario}
                  >
                    Abrir grupo
                  </button>
                  {(() => {
                    const contexto = contextoWhatsappAdministracionApp();
                    const existe = contexto
                      ? Boolean(enlaceWhatsappPorClaveApp(contexto.clave))
                      : false;
                    return existe ? (
                      <button
                        type="button"
                        disabled={cargando}
                        onClick={() => void eliminarWhatsappAdministracionApp()}
                        style={botonPeligroMini}
                      >
                        Eliminar enlace
                      </button>
                    ) : null;
                  })()}
                </div>
              </div>
            </article>
          </section>
        )}
  
      </>
  );
}

