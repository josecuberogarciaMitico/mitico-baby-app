import React, { useCallback, useEffect, useState } from 'react';
import { vistaReparto, type MensajeEntrenador } from './mensajesEntrenadorLogic';
import { cargarMisMensajes, marcarMensajeLeido, responderReparto } from '../../services/trainers/mensajesEntrenadorService';

// Mensajes de coordinación en la vista del entrenador (16/11).
// - Mensaje: se lee y se pulsa «Leído».
// - Reparto de reportes (solo si coordinación lo envía): el entrenador marca
//   los niños que ha llevado y da OK una sola vez. Los niños que ya confirmó
//   su compañero salen fijos y no se pueden coger.
// Si la función aún no existe en Supabase, no se enseña nada.

const caja: React.CSSProperties = {
  padding: 14,
  borderRadius: 16,
  border: '2px solid #6366f1',
  background: '#eef2ff',
  color: '#1e1b4b',
  display: 'grid',
  gap: 8,
  minWidth: 0,
};
const boton: React.CSSProperties = {
  minHeight: 40,
  padding: '8px 14px',
  borderRadius: 12,
  border: 'none',
  background: '#4338ca',
  color: '#fff',
  fontWeight: 900,
  fontSize: 14,
  cursor: 'pointer',
};

export function MensajesEntrenador({ onRepartoHecho }: { onRepartoHecho?: () => void }) {
  const [mensajes, setMensajes] = useState<MensajeEntrenador[]>([]);
  const [ocupado, setOcupado] = useState('');
  const [error, setError] = useState('');
  const [elegidos, setElegidos] = useState<Record<string, string[]>>({});

  const cargar = useCallback(async () => {
    try {
      const filas = await cargarMisMensajes();
      setMensajes(Array.isArray(filas) ? filas : []);
    } catch {
      setMensajes([]);
    }
  }, []);

  useEffect(() => {
    void cargar();
    const t = window.setInterval(() => void cargar(), 60000);
    const alVolver = () => document.visibilityState === 'visible' && void cargar();
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      window.clearInterval(t);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [cargar]);

  if (!mensajes.length) return null;

  async function leido(m: MensajeEntrenador) {
    setOcupado(m.mensaje_id);
    try {
      await marcarMensajeLeido(m.mensaje_id);
      setMensajes((lista) => lista.filter((x) => x.mensaje_id !== m.mensaje_id));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
    }
    setOcupado('');
  }

  async function confirmar(m: MensajeEntrenador, ids: string[], nombres: string[]) {
    const texto = nombres.length ? nombres.join(', ') : 'ningún niño';
    if (!window.confirm(`¿Confirmas que haces los reportes de: ${texto}?\n\nSolo se puede hacer una vez.`)) return;
    setOcupado(m.mensaje_id);
    setError('');
    try {
      await responderReparto(m.mensaje_id, ids);
      await cargar();
      onRepartoHecho?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
      await cargar();
    }
    setOcupado('');
  }

  return (
    <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
      {error && (
        <p role="alert" style={{ margin: 0, padding: '8px 12px', borderRadius: 10, background: '#fee2e2', color: '#991b1b', fontWeight: 800 }}>
          {error}
        </p>
      )}
      {mensajes.map((m) => {
        if (m.tipo === 'texto') {
          return (
            <article key={m.mensaje_id} role="status" style={caja}>
              <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.05em', color: '#4338ca' }}>✉️ MENSAJE DE COORDINACIÓN</span>
              <strong style={{ fontSize: 16, overflowWrap: 'anywhere' }}>{m.titulo}</strong>
              {m.cuerpo && <p style={{ margin: 0, whiteSpace: 'pre-line', overflowWrap: 'anywhere' }}>{m.cuerpo}</p>}
              <button type="button" style={{ ...boton, justifySelf: 'start' }} disabled={ocupado === m.mensaje_id} onClick={() => void leido(m)}>
                {ocupado === m.mensaje_id ? 'Guardando…' : 'Leído'}
              </button>
            </article>
          );
        }

        if (!m.reparto) return null;
        const v = vistaReparto(m.reparto, m.yo);
        const yaOk = Boolean(m.mi_ok_at);
        const marcados = v.soyUltimo ? v.libres.map((a) => a.alumno_id) : elegidos[m.mensaje_id] ?? v.preseleccion;
        const nombresMarcados = v.libres.filter((a) => marcados.includes(a.alumno_id)).map((a) => a.alumno);
        const alternar = (id: string) =>
          setElegidos((prev) => {
            const actual = prev[m.mensaje_id] ?? v.preseleccion;
            return { ...prev, [m.mensaje_id]: actual.includes(id) ? actual.filter((x) => x !== id) : [...actual, id] };
          });

        return (
          <article key={m.mensaje_id} role="status" style={caja}>
            <span style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.05em', color: '#4338ca' }}>📝 REPARTO DE REPORTES</span>
            <strong style={{ fontSize: 16, overflowWrap: 'anywhere' }}>{m.titulo}</strong>
            {m.cuerpo && <p style={{ margin: 0, fontSize: 13 }}>{m.cuerpo}</p>}

            {v.fijos.length > 0 && (
              <div style={{ fontSize: 13, background: '#fff', borderRadius: 10, padding: '8px 10px' }}>
                <strong>Ya confirmado por tu compañero:</strong>{' '}
                {v.fijos.map((a) => `${a.alumno} (${a.de})`).join(', ')}
              </div>
            )}

            {yaOk ? (
              <p style={{ margin: 0, fontWeight: 800, color: '#166534' }}>
                ✓ Hecho. Esperando a {v.companerosPendientes.join(' y ') || 'tu compañero'}.
              </p>
            ) : (
              <>
                <p style={{ margin: 0, fontSize: 13, fontWeight: 800 }}>
                  {v.soyUltimo
                    ? 'Eres el último en confirmar: estos niños son tuyos.'
                    : 'Marca los niños que has llevado tú (los que dejes sin marcar se los queda tu compañero):'}
                </p>
                <div style={{ display: 'grid', gap: 6 }}>
                  {v.libres.map((a) => {
                    const mio = marcados.includes(a.alumno_id);
                    return (
                      <label
                        key={a.alumno_id}
                        style={{
                          display: 'flex',
                          gap: 10,
                          alignItems: 'center',
                          padding: '9px 10px',
                          borderRadius: 10,
                          background: mio ? '#4338ca' : '#fff',
                          color: mio ? '#fff' : '#1e1b4b',
                          fontWeight: 800,
                          cursor: v.soyUltimo ? 'default' : 'pointer',
                          minHeight: 40,
                          overflowWrap: 'anywhere',
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={mio}
                          disabled={v.soyUltimo || ocupado === m.mensaje_id}
                          onChange={() => alternar(a.alumno_id)}
                          style={{ width: 20, height: 20, flex: '0 0 auto' }}
                        />
                        {a.alumno}
                      </label>
                    );
                  })}
                </div>
                <button
                  type="button"
                  style={{ ...boton, background: '#15803d' }}
                  disabled={ocupado === m.mensaje_id}
                  onClick={() =>
                    void confirmar(
                      m,
                      v.libres.filter((a) => marcados.includes(a.alumno_id)).map((a) => a.alumno_id),
                      nombresMarcados
                    )
                  }
                >
                  {ocupado === m.mensaje_id ? 'Guardando…' : `OK, hago estos ${nombresMarcados.length} reportes`}
                </button>
              </>
            )}
          </article>
        );
      })}
    </div>
  );
}
