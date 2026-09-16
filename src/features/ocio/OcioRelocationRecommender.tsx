import React from 'react';

type OcioRelocationRecommenderProps = {
  ctx: Record<string, any>;
};

export function OcioRelocationRecommender({ ctx }: OcioRelocationRecommenderProps) {
  const {
    agendaCabeceraLinea,
    avisoNeutral,
    botonPrincipal,
    botonSecundario,
    esVistaMovilApp,
    fechaCambioOcioPorDia,
    fechaGrupoOcioSemana,
    formatearFecha,
    ocioAlumnoCambioSeleccionado,
    ocioCambioForm,
    recomendacionesCambioPuntualOcio,
    setOcioCambioForm,
  } = ctx;

    if (!ocioCambioForm.alumnoId) return null;

    if (!ocioCambioForm.diaDestino) {
      return (
        <div style={{ ...avisoNeutral, marginTop: 10 }}>
          Selecciona el día solicitado. Después aparecerá el mismo recomendador
          de grupos que usamos para una incorporación nueva.
        </div>
      );
    }

    const recomendaciones = recomendacionesCambioPuntualOcio();
    const fecha = fechaCambioOcioPorDia(ocioCambioForm.diaDestino);

    return (
      <div style={{ display: 'grid', gap: 9, marginTop: 12 }}>
        <div style={avisoNeutral}>
          <strong>{ocioAlumnoCambioSeleccionado?.alumno || 'Alumno'}</strong>
          {' · '}
          cambio puntual a <strong>{ocioCambioForm.diaDestino}</strong>
          {fecha ? ` · ${formatearFecha(fecha)}` : ''}
          <br />
          Grupo habitual:{' '}
          <strong>
            {ocioAlumnoCambioSeleccionado?.grupo_estable || 'Sin grupo estable'}
          </strong>
          {' · '}
          {ocioAlumnoCambioSeleccionado?.grupo_dia ||
            ocioAlumnoCambioSeleccionado?.dia_fijo ||
            '-'}
        </div>

        {recomendaciones.length === 0 ? (
          <div
            style={{
              ...avisoNeutral,
              borderColor: '#fecaca',
              background: '#fff7f7',
              color: '#991b1b',
            }}
          >
            No hay grupos estables activos para {ocioCambioForm.diaDestino}.
          </div>
        ) : (
          recomendaciones.map((opcion) => {
            const seleccionado =
              ocioCambioForm.grupoDestinoId === opcion.grupo.grupo_id;
            const recomendado = opcion.estado === 'RECOMENDADO';
            const revisar = opcion.estado === 'REVISAR';

            return (
              <article
                key={`cambio-recomendacion-${opcion.grupo.grupo_id}`}
                style={{
                  borderRadius: 12,
                  border: seleccionado
                    ? '2px solid #2563eb'
                    : recomendado
                    ? '1px solid #93c5fd'
                    : revisar
                    ? '1px solid #fdba74'
                    : '1px solid #fecaca',
                  padding: 11,
                  background: seleccionado
                    ? '#eff6ff'
                    : recomendado
                    ? '#f8fbff'
                    : revisar
                    ? '#fffaf5'
                    : '#fff7f7',
                }}
              >
                <div style={agendaCabeceraLinea}>
                  <div
              style={{
                minWidth: 0,
                maxWidth: esVistaMovilApp ? '100%' : 760,
                position: 'relative',
                zIndex: 1,
              }}
            >
                    <strong>
                      {recomendado
                        ? 'Recomendado'
                        : revisar
                        ? 'Revisar'
                        : 'No encaja'}
                      {' · '}
                      {opcion.grupo.nombre_grupo}
                    </strong>
                    <div
                      style={{
                        marginTop: 4,
                        color: '#64748b',
                        fontSize: 13,
                      }}
                    >
                      Nivel {opcion.grupo.nivel_grupo || '-'} ·{' '}
                      {opcion.grupo.pista || '-'} · {opcion.totalActual} →{' '}
                      {opcion.totalFinal} niños
                    </div>
                    <div
                      style={{
                        marginTop: 4,
                        color: '#64748b',
                        fontSize: 12,
                      }}
                    >
                      {opcion.motivo}
                    </div>
                  </div>

                  {opcion.estado !== 'NO_ENCAJA' && (
                    <button
                      type="button"
                      onClick={() =>
                        setOcioCambioForm((actual) => ({
                          ...actual,
                          grupoDestinoId: opcion.grupo.grupo_id,
                          fecha:
                            fechaCambioOcioPorDia(actual.diaDestino) ||
                            fechaGrupoOcioSemana(opcion.grupo),
                        }))
                      }
                      style={
                        seleccionado
                          ? botonPrincipal
                          : recomendado
                          ? botonPrincipal
                          : botonSecundario
                      }
                    >
                      {seleccionado ? 'Grupo elegido' : 'Elegir este grupo'}
                    </button>
                  )}
                </div>
              </article>
            );
          })
        )}
      </div>
    );
  
}

