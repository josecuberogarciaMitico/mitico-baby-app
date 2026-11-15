import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MENSAJES_RAPIDOS, nombreCorto, resumenDestinos, type MensajeEnviado } from '../trainers/mensajesEntrenadorLogic';
import { cargarMensajesEnviados, enviarMensajeEntrenadores } from '../../services/trainers/mensajesEntrenadorService';

// Trabajo en pista (16/11): escribir a los entrenadores desde la app y ver
// quién lo ha leído. Les sale arriba en su vista hasta que pulsan «Leído».

type Entrenador = { id: string; nombre_completo?: string | null; activo?: boolean | null };

type Props = {
  entrenadores: Entrenador[];
  /** Entrenadores con grupo el día que se está viendo. */
  idsDelDia: string[];
};

const chip = (activo: boolean): React.CSSProperties => ({
  minHeight: 32,
  padding: '5px 10px',
  borderRadius: 999,
  border: activo ? '2px solid #4338ca' : '1px solid #c7d2fe',
  background: activo ? '#4338ca' : '#fff',
  color: activo ? '#fff' : '#3730a3',
  fontSize: 12.5,
  fontWeight: 800,
  cursor: 'pointer',
});

export function MensajesCoordinacion({ entrenadores, idsDelDia }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [texto, setTexto] = useState('');
  const [para, setPara] = useState<string[]>([]);
  const [enviados, setEnviados] = useState<MensajeEnviado[]>([]);
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');
  const [disponible, setDisponible] = useState(true);

  const activos = useMemo(
    () =>
      (entrenadores || [])
        .filter((e) => e.activo !== false)
        .sort((a, b) => String(a.nombre_completo || '').localeCompare(String(b.nombre_completo || ''), 'es')),
    [entrenadores]
  );
  const delDia = useMemo(() => activos.filter((e) => idsDelDia.includes(e.id)).map((e) => e.id), [activos, idsDelDia]);

  const cargar = useCallback(async () => {
    try {
      setEnviados(await cargarMensajesEnviados(2));
      setDisponible(true);
    } catch {
      setDisponible(false);
    }
  }, []);

  useEffect(() => {
    void cargar();
    const t = window.setInterval(() => void cargar(), 60000);
    return () => window.clearInterval(t);
  }, [cargar]);

  if (!disponible) return null;

  const textos = enviados.filter((m) => m.tipo === 'texto');
  const sinLeer = textos.reduce((n, m) => n + m.destinos.filter((d) => !d.leido_at).length, 0);

  async function enviar() {
    const t = texto.trim();
    if (!t || para.length === 0) return;
    setOcupado(true);
    setAviso('');
    try {
      await enviarMensajeEntrenadores(para, t);
      setTexto('');
      setAviso(`Enviado a ${para.length} entrenador${para.length === 1 ? '' : 'es'}.`);
      await cargar();
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'No se pudo enviar.');
    }
    setOcupado(false);
  }

  const alternar = (id: string) => setPara((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const mismos = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));

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
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {MENSAJES_RAPIDOS.map((m) => (
            <button key={m} type="button" style={chip(texto === m)} onClick={() => setTexto(m)}>
              {m}
            </button>
          ))}
        </div>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          placeholder="Escribe el mensaje…"
          style={{ width: '100%', boxSizing: 'border-box', borderRadius: 10, border: '1px solid #c7d2fe', padding: 10, fontSize: 15 }}
        />

        <div style={{ display: 'grid', gap: 6 }}>
          <strong style={{ fontSize: 13 }}>Para:</strong>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {delDia.length > 0 && (
              <button type="button" style={chip(mismos(para, delDia))} onClick={() => setPara(delDia)}>
                Los de este día ({delDia.length})
              </button>
            )}
            <button type="button" style={chip(mismos(para, activos.map((e) => e.id)))} onClick={() => setPara(activos.map((e) => e.id))}>
              Todos ({activos.length})
            </button>
            {para.length > 0 && (
              <button type="button" style={chip(false)} onClick={() => setPara([])}>
                Quitar todos
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {activos.map((e) => (
              <button key={e.id} type="button" style={chip(para.includes(e.id))} onClick={() => alternar(e.id)}>
                {nombreCorto(e.nombre_completo)}
              </button>
            ))}
          </div>
        </div>

        <button
          type="button"
          disabled={ocupado || !texto.trim() || para.length === 0}
          onClick={() => void enviar()}
          style={{
            minHeight: 42,
            borderRadius: 12,
            border: 'none',
            background: '#4338ca',
            color: '#fff',
            fontWeight: 900,
            fontSize: 14,
            cursor: 'pointer',
            opacity: ocupado || !texto.trim() || para.length === 0 ? 0.55 : 1,
          }}
        >
          {ocupado ? 'Enviando…' : `Enviar${para.length ? ` a ${para.length}` : ''}`}
        </button>
        {aviso && <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: '#312e81' }}>{aviso}</p>}

        {enviados.length > 0 && (
          <div style={{ display: 'grid', gap: 6 }}>
            <strong style={{ fontSize: 13 }}>Enviados (últimos 2 días)</strong>
            {enviados.map((m) => (
              <details key={m.mensaje_id} style={{ background: '#fff', borderRadius: 10, padding: '7px 10px' }}>
                <summary style={{ cursor: 'pointer', fontSize: 13 }}>
                  <strong>{m.tipo === 'reparto' ? '📝 ' : ''}{m.titulo}</strong>
                  <span style={{ color: '#475569' }}>
                    {' · '}
                    {new Date(m.created_at).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
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
      </div>
    </details>
  );
}
