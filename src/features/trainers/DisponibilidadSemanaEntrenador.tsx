import React from 'react';

// Disponibilidad del entrenador en el móvil (16/11). Antes: un desplegable por
// día que había que abrir uno a uno. Ahora toda la semana a la vista, con lo
// que falta por contestar arriba y botones grandes. Una respuesta enviada no
// se cambia desde aquí (igual que antes): se habla con coordinación.

export type TurnoDisponibilidad = {
  id: string;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  nombre_turno?: string | null;
  respuesta?: string | null;
};

type Props = {
  rango: string;
  dias: { fecha: string; turnos: TurnoDisponibilidad[] }[];
  hoy: string;
  onResponder: (turno: TurnoDisponibilidad, respuesta: 'Disponible' | 'No puedo') => void;
};

const DIAS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

function botonRespuesta(tipo: 'si' | 'no'): React.CSSProperties {
  return {
    flex: '1 1 0',
    minHeight: 48,
    borderRadius: 14,
    border: `2px solid ${tipo === 'si' ? '#16a34a' : '#ef4444'}`,
    background: '#fff',
    color: tipo === 'si' ? '#15803d' : '#dc2626',
    fontSize: 16,
    fontWeight: 900,
    cursor: 'pointer',
    touchAction: 'manipulation',
  };
}

export function DisponibilidadSemanaEntrenador({ rango, dias, hoy, onResponder }: Props) {
  const turnos = dias.flatMap((d) => d.turnos);
  const pendientes = turnos.filter((t) => (t.respuesta || 'Pendiente') === 'Pendiente').length;
  const hechos = turnos.length - pendientes;
  const pct = turnos.length ? Math.round((hechos / turnos.length) * 100) : 0;

  return (
    <section style={{ display: 'grid', gap: 12, minWidth: 0 }}>
      <div
        style={{
          padding: '14px 16px',
          borderRadius: 18,
          background: pendientes ? '#fff7ed' : '#f0fdf4',
          border: `1px solid ${pendientes ? '#fdba74' : '#86efac'}`,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 17, color: '#0f172a' }}>Semana {rango}</strong>
          <span style={{ fontSize: 13, fontWeight: 800, color: pendientes ? '#9a3412' : '#166534' }}>
            {pendientes ? `Te faltan ${pendientes} de ${turnos.length}` : '✓ Todo contestado'}
          </span>
        </div>
        <div style={{ marginTop: 10, height: 8, borderRadius: 999, background: 'rgba(15,23,42,.08)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: pendientes ? '#f97316' : '#16a34a' }} />
        </div>
      </div>

      {dias.map((dia) => {
        const f = new Date(`${dia.fecha}T12:00:00`);
        const esHoy = dia.fecha === hoy;
        return (
          <div key={dia.fecha} style={{ display: 'grid', gridTemplateColumns: '54px minmax(0, 1fr)', gap: 10, alignItems: 'start' }}>
            <div
              style={{
                textAlign: 'center',
                padding: '8px 0',
                borderRadius: 14,
                background: esHoy ? '#0f172a' : '#e2e8f0',
                color: esHoy ? '#fff' : '#0f172a',
                position: 'sticky',
                top: 8,
              }}
            >
              <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.05em' }}>{DIAS[f.getDay()]}</div>
              <div style={{ fontSize: 22, fontWeight: 900, lineHeight: 1.1 }}>{f.getDate()}</div>
            </div>

            <div style={{ display: 'grid', gap: 8, minWidth: 0 }}>
              {dia.turnos.map((turno) => {
                const respuesta = turno.respuesta || 'Pendiente';
                const pendiente = respuesta === 'Pendiente';
                const si = respuesta === 'Disponible';
                return (
                  <div
                    key={turno.id}
                    style={{
                      padding: 12,
                      borderRadius: 16,
                      background: '#fff',
                      border: `1px solid ${pendiente ? '#fdba74' : si ? '#bbf7d0' : '#fecaca'}`,
                      borderLeft: `5px solid ${pendiente ? '#f97316' : si ? '#16a34a' : '#ef4444'}`,
                      boxShadow: '0 4px 14px rgba(15,23,42,.05)',
                      display: 'grid',
                      gap: 10,
                      minWidth: 0,
                    }}
                  >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: 18, color: '#0f172a' }}>
                        {turno.hora_inicio.slice(0, 5)}–{turno.hora_fin.slice(0, 5)}
                      </strong>
                      {turno.nombre_turno && <span style={{ color: '#64748b', fontWeight: 700 }}>{turno.nombre_turno}</span>}
                      {!pendiente && (
                        <span
                          style={{
                            marginLeft: 'auto',
                            padding: '4px 10px',
                            borderRadius: 999,
                            fontSize: 13,
                            fontWeight: 900,
                            background: si ? '#dcfce7' : '#fee2e2',
                            color: si ? '#166534' : '#991b1b',
                          }}
                        >
                          {si ? '✓ Disponible' : '✗ No disponible'}
                        </span>
                      )}
                    </div>
                    {pendiente ? (
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button type="button" style={botonRespuesta('si')} onClick={() => onResponder(turno, 'Disponible')}>
                          ✓ Puedo
                        </button>
                        <button type="button" style={botonRespuesta('no')} onClick={() => onResponder(turno, 'No puedo')}>
                          ✗ No puedo
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#64748b' }}>Para cambiarlo, habla con coordinación.</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </section>
  );
}
