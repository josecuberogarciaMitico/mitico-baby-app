import React, { useMemo, useState } from 'react';
import { MENSAJES_RAPIDOS, nombreCorto } from '../trainers/mensajesEntrenadorLogic';
import { enviarMensajeEntrenadores } from '../../services/trainers/mensajesEntrenadorService';

// Escribir un mensaje a los entrenadores (16/11). Se usa en Trabajo en pista y
// en «Mensajes internos». Con muchos entrenadores hay buscador.

// La lista de la app (v_panel_entrenadores) trae `entrenador_id`; se acepta también `id`.
export type EntrenadorMensaje = { id?: string; entrenador_id?: string; nombre_completo?: string | null; activo?: boolean | null };

type Props = {
  entrenadores: EntrenadorMensaje[];
  /** Entrenadores con grupo el día que se está viendo (botón «Los de este día»). */
  idsDelDia?: string[];
  onEnviado?: () => void;
};

const chip = (activo: boolean): React.CSSProperties => ({
  minHeight: 36,
  padding: '6px 12px',
  borderRadius: 999,
  border: activo ? '2px solid #4338ca' : '1px solid #c7d2fe',
  background: activo ? '#4338ca' : '#fff',
  color: activo ? '#fff' : '#3730a3',
  fontSize: 13,
  fontWeight: 800,
  cursor: 'pointer',
  touchAction: 'manipulation',
});

export function EscribirMensaje({ entrenadores, idsDelDia = [], onEnviado }: Props) {
  const [texto, setTexto] = useState('');
  const [para, setPara] = useState<string[]>([]);
  const [buscar, setBuscar] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [aviso, setAviso] = useState('');

  const activos = useMemo(
    () =>
      (entrenadores || [])
        .map((e) => ({ id: String(e.id || e.entrenador_id || ''), nombre: String(e.nombre_completo || ''), activo: e.activo }))
        .filter((e) => e.id && e.activo !== false)
        .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    [entrenadores]
  );
  const delDia = useMemo(() => activos.filter((e) => idsDelDia.includes(e.id)).map((e) => e.id), [activos, idsDelDia]);
  const todos = activos.map((e) => e.id);
  const q = buscar.trim().toLowerCase();
  const visibles = q ? activos.filter((e) => e.nombre.toLowerCase().includes(q)) : activos;
  const mismos = (a: string[], b: string[]) => a.length === b.length && a.every((x) => b.includes(x));
  const alternar = (id: string) => setPara((p) => (p.includes(id) ? p.filter((x) => x !== id) : [...p, id]));
  const listo = Boolean(texto.trim()) && para.length > 0 && !ocupado;

  async function enviar() {
    if (!listo) return;
    setOcupado(true);
    setAviso('');
    try {
      await enviarMensajeEntrenadores(para, texto.trim());
      setAviso(`✓ Enviado a ${para.length} entrenador${para.length === 1 ? '' : 'es'}.`);
      setTexto('');
      setPara([]);
      onEnviado?.();
    } catch (e) {
      setAviso(e instanceof Error ? e.message : 'No se pudo enviar.');
    }
    setOcupado(false);
  }

  const paso = (n: number, titulo: string) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 900, color: '#1e1b4b' }}>
      <span style={{ width: 24, height: 24, borderRadius: 999, background: '#4338ca', color: '#fff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 }}>
        {n}
      </span>
      {titulo}
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: 14 }}>
      <div style={{ display: 'grid', gap: 8 }}>
        {paso(1, 'Qué quieres decir')}
        <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 2, WebkitOverflowScrolling: 'touch' }}>
          {MENSAJES_RAPIDOS.map((m) => (
            <button key={m} type="button" style={{ ...chip(texto === m), whiteSpace: 'nowrap', flex: '0 0 auto' }} onClick={() => setTexto(m)}>
              {m}
            </button>
          ))}
        </div>
        <textarea
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          placeholder="Escribe el mensaje…"
          style={{ width: '100%', boxSizing: 'border-box', borderRadius: 14, border: '1px solid #c7d2fe', padding: 12, fontSize: 16, fontFamily: 'inherit' }}
        />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {paso(2, `A quién${para.length ? ` · ${para.length} elegido${para.length === 1 ? '' : 's'}` : ''}`)}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {delDia.length > 0 && (
            <button type="button" style={chip(mismos(para, delDia))} onClick={() => setPara(delDia)}>
              Los de este día ({delDia.length})
            </button>
          )}
          <button type="button" style={chip(mismos(para, todos))} onClick={() => setPara(todos)}>
            Todos ({todos.length})
          </button>
          {para.length > 0 && (
            <button type="button" style={chip(false)} onClick={() => setPara([])}>
              Ninguno
            </button>
          )}
        </div>
        {activos.length > 12 && (
          <input
            value={buscar}
            onChange={(e) => setBuscar(e.target.value)}
            placeholder="Buscar entrenador…"
            style={{ width: '100%', boxSizing: 'border-box', minHeight: 42, borderRadius: 12, border: '1px solid #c7d2fe', padding: '0 12px', fontSize: 16 }}
          />
        )}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', maxHeight: 220, overflowY: 'auto' }}>
          {visibles.map((e) => (
            <button key={e.id} type="button" style={chip(para.includes(e.id))} onClick={() => alternar(e.id)} title={e.nombre}>
              {para.includes(e.id) ? '✓ ' : ''}
              {nombreCorto(e.nombre)}
            </button>
          ))}
          {visibles.length === 0 && <span style={{ fontSize: 13, color: '#64748b' }}>Ningún entrenador con ese nombre.</span>}
        </div>
      </div>

      <button
        type="button"
        disabled={!listo}
        onClick={() => void enviar()}
        style={{
          minHeight: 50,
          borderRadius: 14,
          border: 'none',
          background: '#4338ca',
          color: '#fff',
          fontWeight: 900,
          fontSize: 16,
          cursor: listo ? 'pointer' : 'default',
          opacity: listo ? 1 : 0.5,
        }}
      >
        {ocupado ? 'Enviando…' : para.length ? `Enviar a ${para.length}` : 'Elige a quién se lo mandas'}
      </button>
      {aviso && <p style={{ margin: 0, fontSize: 14, fontWeight: 800, color: '#312e81' }}>{aviso}</p>}
    </div>
  );
}
