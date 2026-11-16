import React, { useCallback, useEffect, useState } from 'react';
import { EscribirMensaje } from './EscribirMensaje';
import {
  grupoDeReparto,
  nombreCorto,
  pendientesDeMensaje,
  repartosPorSesion,
  sesionDeReparto,
  type MensajeEnviado,
} from '../trainers/mensajesEntrenadorLogic';
import { cargarMensajesEnviados } from '../../services/trainers/mensajesEntrenadorService';

// 16/11: «Mensajes internos», apartado propio en el menú (columna Equipo), con
// el número de respuestas pendientes. Antes era una pastilla flotante y molestaba.

type Entrenador = { id?: string; entrenador_id?: string; nombre_completo?: string | null; activo?: boolean | null };

export const pendientesDeRespuesta = pendientesDeMensaje;

/** Número pequeño junto a «Mensajes internos» en el menú (nada si no hay pendientes). */
export function ContadorMensajes() {
  const [pendientes, setPendientes] = useState(0);
  const cargar = useCallback(async () => {
    try {
      const enviados = await cargarMensajesEnviados(7);
      // Mensajes (no personas) que aún tienen a alguien sin leer o sin dar OK.
      setPendientes(enviados.filter((m) => pendientesDeRespuesta(m) > 0).length);
    } catch {
      setPendientes(0);
    }
  }, []);
  useEffect(() => {
    void cargar();
    const t = window.setInterval(() => void cargar(), 60000);
    return () => window.clearInterval(t);
  }, [cargar]);
  if (!pendientes) return null;
  return (
    <span
      aria-label={`${pendientes} mensaje${pendientes === 1 ? '' : 's'} sin responder del todo`}
      style={{
        marginLeft: 6,
        verticalAlign: 'middle',
        minWidth: 22,
        height: 22,
        padding: '0 7px',
        borderRadius: 999,
        background: '#4338ca',
        color: '#fff',
        fontSize: 12,
        fontWeight: 900,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {pendientes}
    </span>
  );
}

type Pestana = 'pendientes' | 'repartos' | 'mensajes' | 'nuevo';

const horaCorta = (iso: string) =>
  new Date(iso).toLocaleString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

function Chips({ m }: { m: MensajeEnviado }) {
  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
      {m.destinos.map((d) => {
        const hecho = m.tipo === 'reparto' ? d.ok_at : d.leido_at;
        return (
          <span
            key={d.entrenador_id}
            style={{
              padding: '4px 10px',
              borderRadius: 999,
              fontSize: 13,
              fontWeight: 800,
              background: hecho ? '#dcfce7' : '#fff7ed',
              color: hecho ? '#166534' : '#9a3412',
              border: `1px solid ${hecho ? '#86efac' : '#fdba74'}`,
            }}
          >
            {hecho ? '✓ ' : '⏳ '}
            {nombreCorto(d.entrenador)}
            {hecho && m.tipo === 'reparto' ? ' OK' : ''}
          </span>
        );
      })}
    </div>
  );
}

function Tarjeta({ m, conSesion }: { m: MensajeEnviado; conSesion?: boolean; key?: string }) {
  const pend = pendientesDeMensaje(m);
  const total = m.destinos.length;
  const esReparto = m.tipo === 'reparto';
  return (
    <article
      style={{
        padding: 14,
        borderRadius: 16,
        background: '#fff',
        border: `1px solid ${pend ? '#fed7aa' : '#bbf7d0'}`,
        borderLeft: `5px solid ${pend ? '#f97316' : '#16a34a'}`,
        boxShadow: '0 4px 14px rgba(15,23,42,.05)',
        display: 'grid',
        gap: 8,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>{esReparto ? '📝' : '✉️'}</span>
        <div style={{ flex: '1 1 auto', minWidth: 0 }}>
          <strong style={{ display: 'block', fontSize: 15, color: '#0f172a', overflowWrap: 'anywhere' }}>
            {esReparto ? grupoDeReparto(m.titulo) : m.titulo}
          </strong>
          <span style={{ fontSize: 12.5, color: '#64748b' }}>
            {esReparto ? `Reparto de reportes${conSesion && sesionDeReparto(m.cuerpo) ? ` · turno ${sesionDeReparto(m.cuerpo)}` : ''}` : 'Mensaje'} · enviado{' '}
            {horaCorta(m.created_at)}
          </span>
        </div>
        <span
          style={{
            flex: '0 0 auto',
            padding: '3px 9px',
            borderRadius: 999,
            fontSize: 12,
            fontWeight: 900,
            background: pend ? '#ffedd5' : '#dcfce7',
            color: pend ? '#9a3412' : '#166534',
            whiteSpace: 'nowrap',
          }}
        >
          {pend ? `${total - pend}/${total}` : '✓ Hecho'}
        </span>
      </div>
      <Chips m={m} />
    </article>
  );
}

export function PantallaMensajesInternos({ entrenadores, soloLectura = false }: { entrenadores: Entrenador[]; soloLectura?: boolean }) {
  const [enviados, setEnviados] = useState<MensajeEnviado[] | null>(null);
  const [pestana, setPestana] = useState<Pestana | null>(null);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    try {
      setEnviados(await cargarMensajesEnviados(7));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudieron cargar los mensajes.');
      setEnviados((x) => x ?? []);
    }
  }, []);

  useEffect(() => {
    void cargar();
    const t = window.setInterval(() => void cargar(), 30000);
    return () => window.clearInterval(t);
  }, [cargar]);

  const lista = enviados || [];
  const pendientes = lista.filter((m) => pendientesDeMensaje(m) > 0);
  const textos = lista.filter((m) => m.tipo === 'texto');
  const grupos = repartosPorSesion(lista);
  const activa: Pestana = pestana ?? (pendientes.length ? 'pendientes' : soloLectura ? 'repartos' : 'nuevo');

  const pestanas: { id: Pestana; texto: string; n?: number }[] = [
    { id: 'pendientes', texto: 'Sin responder', n: pendientes.length },
    // 16/11: los números solo cuentan lo que sigue pendiente.
    { id: 'repartos', texto: 'Repartos', n: pendientes.filter((m) => m.tipo === 'reparto').length },
    { id: 'mensajes', texto: 'Mensajes', n: pendientes.filter((m) => m.tipo === 'texto').length },
  ];

  const vacio = (t: string) => (
    <p style={{ margin: 0, padding: 18, borderRadius: 16, background: '#f8fafc', color: '#64748b', textAlign: 'center', fontWeight: 700 }}>{t}</p>
  );

  return (
    <section style={{ display: 'grid', gap: 14, minWidth: 0 }}>
      <div
        style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          borderRadius: 20,
          padding: '18px 18px 16px',
          color: '#fff',
          display: 'grid',
          gap: 12,
        }}
      >
        <div>
          <p style={{ margin: 0, color: '#c7d2fe', fontSize: 11, fontWeight: 900, letterSpacing: '.12em' }}>EQUIPO</p>
          <h2 style={{ margin: '4px 0 0', fontSize: 26 }}>Mensajes internos</h2>
          <p style={{ margin: '4px 0 0', color: '#e0e7ff', fontSize: 13.5 }}>
            Últimos 7 días. Los repartos de reportes se piden en Trabajo en pista, en cada grupo.
          </p>
        </div>
        {!soloLectura && (
        <button
          type="button"
          onClick={() => setPestana('nuevo')}
          style={{
            minHeight: 48,
            borderRadius: 14,
            border: 'none',
            background: activa === 'nuevo' ? '#c7d2fe' : '#fff',
            color: '#312e81',
            fontSize: 16,
            fontWeight: 900,
            cursor: 'pointer',
          }}
        >
          ✏️ Escribir un mensaje nuevo
        </button>
        )}
      </div>

      <div
        role="tablist"
        style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 4, padding: 4, borderRadius: 16, background: '#eef2ff' }}
      >
        {pestanas.map((p) => {
          const sel = activa === p.id;
          return (
            <button
              key={p.id}
              role="tab"
              aria-selected={sel}
              type="button"
              onClick={() => setPestana(p.id)}
              style={{
                minWidth: 0,
                minHeight: 44,
                padding: '0 6px',
                borderRadius: 12,
                border: 'none',
                background: sel ? '#fff' : 'transparent',
                color: sel ? '#312e81' : '#4f46e5',
                fontWeight: 900,
                fontSize: 13.5,
                boxShadow: sel ? '0 2px 8px rgba(49,46,129,.15)' : 'none',
                cursor: 'pointer',
                lineHeight: 1.15,
              }}
            >
              {p.texto}
              {p.n ? (
                <span
                  style={{
                    marginLeft: 6,
                    padding: '1px 7px',
                    borderRadius: 999,
                    fontSize: 12,
                    background: p.id === 'pendientes' ? '#f97316' : '#c7d2fe',
                    color: p.id === 'pendientes' ? '#fff' : '#312e81',
                  }}
                >
                  {p.n}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {error && <p style={{ margin: 0, padding: '8px 12px', borderRadius: 12, background: '#fee2e2', color: '#991b1b', fontWeight: 800 }}>{error}</p>}
      {enviados === null && vacio('Cargando…')}

      {enviados !== null && activa === 'pendientes' && (
        <div style={{ display: 'grid', gap: 10 }}>
          {pendientes.length === 0 ? vacio('✓ Todos han respondido.') : pendientes.map((m) => <Tarjeta key={m.mensaje_id} m={m} conSesion />)}
        </div>
      )}

      {enviados !== null && activa === 'repartos' && (
        <div style={{ display: 'grid', gap: 16 }}>
          {grupos.length === 0 && vacio('No has pedido repartos de reportes estos días.')}
          {grupos.map((g) => (
            <div key={g.sesion} style={{ display: 'grid', gap: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <strong style={{ fontSize: 13, letterSpacing: '.04em', color: '#312e81' }}>TURNO {g.sesion}</strong>
                <span style={{ flex: 1, height: 1, background: '#c7d2fe' }} />
                <span style={{ fontSize: 12, fontWeight: 800, color: '#64748b' }}>
                  {g.mensajes.filter((m) => pendientesDeMensaje(m) === 0).length}/{g.mensajes.length} repartidos
                </span>
              </div>
              {g.mensajes.map((m) => (
                <Tarjeta key={m.mensaje_id} m={m} />
              ))}
            </div>
          ))}
        </div>
      )}

      {enviados !== null && activa === 'mensajes' && (
        <div style={{ display: 'grid', gap: 10 }}>
          {textos.length === 0 ? vacio('No has enviado mensajes estos días.') : textos.map((m) => <Tarjeta key={m.mensaje_id} m={m} />)}
        </div>
      )}

      {activa === 'nuevo' && !soloLectura && (
        <div style={{ padding: 16, borderRadius: 18, background: '#fff', border: '1px solid #e2e8f0' }}>
          <EscribirMensaje
            entrenadores={entrenadores}
            onEnviado={() => {
              void cargar();
            }}
          />
        </div>
      )}
    </section>
  );
}
