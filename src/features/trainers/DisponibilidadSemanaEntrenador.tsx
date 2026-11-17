import React from 'react';
import {
  esPendiente,
  estadoEnvio,
  guardarBorrador,
  leerBorrador,
  limpiarBorrador,
  type Borrador,
  type RespuestaDisponibilidad,
} from './disponibilidadEnvio';

// Disponibilidad del entrenador en el móvil (16/11). Toda la semana a la vista,
// con botones grandes.
// 17/11 (Jose): ya no se envía turno a turno. Marca todos los turnos y solo
// entonces puede pulsar «Enviar disponibilidad». Lo marcado se guarda como
// borrador en el móvil por si sale de la app. Una respuesta enviada no se cambia
// desde aquí (igual que antes): se habla con coordinación.

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
  /** Envía todas las respuestas juntas. Devuelve si fue bien. */
  onEnviar: (
    respuestas: Array<{ turno: TurnoDisponibilidad; respuesta: RespuestaDisponibilidad }>
  ) => Promise<{ ok: boolean; error?: string }>;
};

const DIAS = ['DOM', 'LUN', 'MAR', 'MIÉ', 'JUE', 'VIE', 'SÁB'];

function botonRespuesta(tipo: 'si' | 'no', marcado: boolean): React.CSSProperties {
  const color = tipo === 'si' ? '#16a34a' : '#ef4444';
  return {
    flex: '1 1 0',
    minHeight: 48,
    borderRadius: 14,
    border: `2px solid ${color}`,
    background: marcado ? color : '#fff',
    color: marcado ? '#fff' : tipo === 'si' ? '#15803d' : '#dc2626',
    fontSize: 16,
    fontWeight: 900,
    cursor: 'pointer',
    touchAction: 'manipulation',
  };
}

export function DisponibilidadSemanaEntrenador({ rango, dias, hoy, onEnviar }: Props) {
  const turnos = dias.flatMap((d) => d.turnos);
  const [borrador, setBorrador] = React.useState<Borrador>(() => limpiarBorrador(turnos, leerBorrador()));
  const [enviando, setEnviando] = React.useState(false);
  const [error, setError] = React.useState('');

  const claveTurnos = turnos.map((t) => `${t.id}:${t.respuesta || ''}`).join('|');
  React.useEffect(() => {
    // Al recargar (p. ej. tras enviar), se olvida lo que ya no está pendiente.
    setBorrador((b) => limpiarBorrador(turnos, b));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [claveTurnos]);

  // Guarda el borrador de esta semana sin pisar el de otras semanas.
  React.useEffect(() => {
    const mios = new Set(turnos.map((t) => t.id));
    const otros = Object.fromEntries(Object.entries(leerBorrador()).filter(([id]) => !mios.has(id)));
    guardarBorrador({ ...otros, ...borrador });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [borrador]);

  const marcar = (id: string, respuesta: RespuestaDisponibilidad) => {
    setError('');
    setBorrador((b) => {
      // Pulsar otra vez lo mismo lo desmarca.
      const { [id]: actual, ...resto } = b;
      return actual === respuesta ? resto : { ...resto, [id]: respuesta };
    });
  };

  const estado = estadoEnvio(turnos, borrador);
  const enviadas = estado.total - estado.pendientes;
  const pct = estado.total ? Math.round(((enviadas + estado.marcados) / estado.total) * 100) : 0;
  const hayPendientes = estado.pendientes > 0;

  async function enviar() {
    if (!estado.listo || enviando) return;
    const resumen = `Puedo: ${estado.puedo} · No puedo: ${estado.noPuedo}`;
    if (!window.confirm(`¿Enviar tu disponibilidad de la semana ${rango}?\n\n${resumen}\n\nUna vez enviada, para cambiarla tendrás que hablar con coordinación.`)) return;
    setEnviando(true);
    setError('');
    const respuestas = turnos.filter(esPendiente).map((turno) => ({ turno, respuesta: borrador[turno.id] }));
    try {
      const r = await onEnviar(respuestas);
      if (!r.ok) setError(r.error || 'No se pudo enviar todo. Lo que falta sigue marcado: vuelve a pulsar «Enviar».');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo enviar la disponibilidad.');
    }
    setEnviando(false);
  }

  return (
    <section style={{ display: 'grid', gap: 12, minWidth: 0 }}>
      <div
        style={{
          padding: '14px 16px',
          borderRadius: 18,
          background: hayPendientes ? '#fff7ed' : '#f0fdf4',
          border: `1px solid ${hayPendientes ? '#fdba74' : '#86efac'}`,
          display: 'grid',
          gap: 8,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, alignItems: 'baseline', flexWrap: 'wrap' }}>
          <strong style={{ fontSize: 17, color: '#0f172a' }}>Semana {rango}</strong>
          <span style={{ fontSize: 13, fontWeight: 800, color: hayPendientes ? '#9a3412' : '#166534' }}>
            {!hayPendientes
              ? '✓ Disponibilidad enviada'
              : estado.faltan > 0
                ? `Te ${estado.faltan === 1 ? 'falta' : 'faltan'} ${estado.faltan} de ${estado.pendientes} por marcar`
                : '✓ Todo marcado: ya puedes enviarla'}
          </span>
        </div>
        <div style={{ height: 8, borderRadius: 999, background: 'rgba(15,23,42,.08)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 999, background: hayPendientes ? '#f97316' : '#16a34a' }} />
        </div>
        {hayPendientes && (
          <span role="note" style={{ fontSize: 13, color: '#7c2d12', lineHeight: 1.4 }}>
            ⚠️ <b>Tu disponibilidad no se envía hasta que marques todos los turnos.</b> Lo que marques se queda guardado en el
            móvil hasta que pulses «Enviar disponibilidad».
          </span>
        )}
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
                const pendiente = esPendiente(turno);
                const marcado = borrador[turno.id];
                const respuesta = pendiente ? marcado : turno.respuesta;
                const si = respuesta === 'Disponible';
                const no = respuesta === 'No puedo';
                const borde = si ? '#16a34a' : no ? '#ef4444' : '#f97316';
                return (
                  <div
                    key={turno.id}
                    style={{
                      padding: 12,
                      borderRadius: 16,
                      background: '#fff',
                      border: `1px solid ${si ? '#bbf7d0' : no ? '#fecaca' : '#fdba74'}`,
                      borderLeft: `5px solid ${borde}`,
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
                        <button type="button" aria-pressed={si} disabled={enviando} style={botonRespuesta('si', si)} onClick={() => marcar(turno.id, 'Disponible')}>
                          ✓ Puedo
                        </button>
                        <button type="button" aria-pressed={no} disabled={enviando} style={botonRespuesta('no', no)} onClick={() => marcar(turno.id, 'No puedo')}>
                          ✗ No puedo
                        </button>
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: '#64748b' }}>Enviado. Para cambiarlo, habla con coordinación.</span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {hayPendientes && (
        <div
          style={{
            position: 'sticky',
            bottom: 8,
            zIndex: 2,
            display: 'grid',
            gap: 6,
            padding: 10,
            borderRadius: 18,
            background: 'rgba(255,255,255,.96)',
            boxShadow: '0 -6px 24px rgba(15,23,42,.12)',
          }}
        >
          {error && (
            <span role="alert" style={{ fontSize: 13, fontWeight: 800, color: '#b91c1c' }}>
              {error}
            </span>
          )}
          <button
            type="button"
            disabled={!estado.listo || enviando}
            onClick={() => void enviar()}
            style={{
              minHeight: 54,
              borderRadius: 14,
              border: 'none',
              background: estado.listo ? '#16a34a' : '#cbd5e1',
              color: estado.listo ? '#fff' : '#475569',
              fontSize: 16.5,
              fontWeight: 900,
              cursor: estado.listo && !enviando ? 'pointer' : 'not-allowed',
            }}
          >
            {enviando
              ? 'Enviando…'
              : estado.listo
                ? `Enviar disponibilidad (${estado.pendientes} turnos)`
                : `Te ${estado.faltan === 1 ? 'falta' : 'faltan'} ${estado.faltan} turno${estado.faltan === 1 ? '' : 's'} por marcar`}
          </button>
        </div>
      )}
    </section>
  );
}
