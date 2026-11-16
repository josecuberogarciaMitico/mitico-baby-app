import React, { useCallback, useEffect, useState } from 'react';
import { nombreCorto, resumenDestinos, type MensajeEnviado } from '../trainers/mensajesEntrenadorLogic';
import { cargarMensajesEnviados } from '../../services/trainers/mensajesEntrenadorService';
import { EscribirMensaje, type EntrenadorMensaje } from './EscribirMensaje';

// Trabajo en pista (16/11): escribir a los entrenadores desde la app y ver
// quién lo ha leído. Les sale arriba en su vista hasta que pulsan «Leído».


type Props = {
  entrenadores: EntrenadorMensaje[];
  /** Entrenadores con grupo el día que se está viendo. */
  idsDelDia: string[];
  /** Días hacia atrás de la lista de enviados (2 por defecto). */
  dias?: number;
  abiertoInicial?: boolean;
};

export function MensajesCoordinacion({ entrenadores, idsDelDia, dias = 2, abiertoInicial = false }: Props) {
  const [abierto, setAbierto] = useState(abiertoInicial);
  const [enviados, setEnviados] = useState<MensajeEnviado[]>([]);
  const [disponible, setDisponible] = useState(true);

  const cargar = useCallback(async () => {
    try {
      setEnviados(await cargarMensajesEnviados(dias));
      setDisponible(true);
    } catch {
      setDisponible(false);
    }
  }, [dias]);

  useEffect(() => {
    void cargar();
    const t = window.setInterval(() => void cargar(), abierto ? 30000 : 60000);
    return () => window.clearInterval(t);
  }, [cargar, abierto]);

  if (!disponible) return null;

  const textos = enviados.filter((m) => m.tipo === 'texto');
  const sinLeer = textos.reduce((n, m) => n + m.destinos.filter((d) => !d.leido_at).length, 0);

  const lista = (
    <>
        {enviados.length > 0 && (
          <div style={{ display: 'grid', gap: 6 }}>
            <strong style={{ fontSize: 13 }}>Enviados (últimos {dias} días)</strong>
            {enviados.map((m) => (
              <details key={m.mensaje_id} style={{ background: '#fff', borderRadius: 10, padding: '7px 10px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 13 }}>
                  <strong>
                    {m.tipo === 'reparto' ? '📝 ' : ''}
                    {m.titulo}
                    {m.tipo === 'reparto' && m.cuerpo ? ` (${m.cuerpo.split('.')[0]})` : ''}
                  </strong>
                  <span style={{ color: '#475569' }}>
                    {' · '}
                    {new Date(m.created_at).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                    {' · '}
                    {resumenDestinos(m)}
                  </span>
                </summary>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
                  {m.destinos.map((d) => {
                    const hecho = m.tipo === 'reparto' ? d.ok_at : d.leido_at;
                    return (
                      <span
                        key={d.entrenador_id}
                        style={{
                          padding: '2px 8px',
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 800,
                          background: hecho ? '#dcfce7' : '#fef3c7',
                          color: hecho ? '#166534' : '#92400e',
                        }}
                      >
                        {nombreCorto(d.entrenador)} {hecho ? '✓' : '…'}
                      </span>
                    );
                  })}
                </div>
              </details>
            ))}
          </div>
        )}
    </>
  );

  return (
    <details
      open={abierto}
      onToggle={(e) => setAbierto((e.target as HTMLDetailsElement).open)}
      style={{ border: '1px solid #c7d2fe', borderRadius: 14, background: '#eef2ff', overflow: 'hidden', minWidth: 0 }}
    >
      <summary style={{ cursor: 'pointer', padding: '11px 14px', fontWeight: 900, color: '#312e81' }}>
        ✉️ Mensaje a los entrenadores
        {textos.length > 0 && (
          <span style={{ fontWeight: 700, color: '#4338ca' }}>
            {' · '}
            {textos.length} enviado{textos.length === 1 ? '' : 's'}
            {sinLeer > 0 ? ` · ${sinLeer} sin leer` : ' · todo leído'}
          </span>
        )}
      </summary>

      <div style={{ padding: '0 14px 14px', display: 'grid', gap: 10 }}>
        <EscribirMensaje entrenadores={entrenadores} idsDelDia={idsDelDia} onEnviado={() => void cargar()} />
        {lista}
      </div>
    </details>
  );
}
