import React, { useCallback, useEffect, useState } from 'react';
import { MensajesCoordinacion } from './MensajesCoordinacion';
import type { MensajeEnviado } from '../trainers/mensajesEntrenadorLogic';
import { cargarMensajesEnviados } from '../../services/trainers/mensajesEntrenadorService';

// 16/11: panel de mensajes siempre a mano (en cualquier pantalla y semana).
// Una pastilla «✉️ Mensajes · N sin responder» bajo los avisos de reportes;
// al abrirla, escribir un mensaje y ver quién ha leído o dado OK (7 días).

type Props = { entrenadores: { id?: string; entrenador_id?: string; nombre_completo?: string | null; activo?: boolean | null }[] };

export function pendientesDeRespuesta(m: Pick<MensajeEnviado, 'tipo' | 'destinos' | 'cerrado_at'>) {
  if (m.tipo === 'reparto') return m.cerrado_at ? 0 : m.destinos.filter((d) => !d.ok_at).length;
  return m.destinos.filter((d) => !d.leido_at).length;
}

export function PanelMensajes({ entrenadores }: Props) {
  const [abierto, setAbierto] = useState(false);
  const [enviados, setEnviados] = useState<MensajeEnviado[] | null>(null);

  const cargar = useCallback(async () => {
    try {
      setEnviados(await cargarMensajesEnviados(7));
    } catch {
      setEnviados(null);
    }
  }, []);

  useEffect(() => {
    void cargar();
    const t = window.setInterval(() => void cargar(), 60000);
    return () => window.clearInterval(t);
  }, [cargar]);

  if (enviados === null) return null;
  const pendientes = enviados.reduce((n, m) => n + pendientesDeRespuesta(m), 0);

  return (
    <div className="mitico-panel-mensajes">
      <button
        type="button"
        className="mitico-panel-mensajes__pastilla"
        aria-expanded={abierto}
        onClick={() => {
          setAbierto(!abierto);
          void cargar();
        }}
        style={{ background: pendientes ? '#4338ca' : '#475569' }}
      >
        ✉️ Mensajes{pendientes ? ` · ${pendientes} sin responder` : enviados.length ? ' · todo respondido' : ''}
      </button>
      {abierto && (
        <section className="mitico-panel-mensajes__panel" aria-label="Mensajes a los entrenadores">
          <header>
            <strong>Mensajes a los entrenadores</strong>
            <button type="button" className="mitico-avisos-reportes__cerrar" aria-label="Cerrar" onClick={() => setAbierto(false)}>
              ×
            </button>
          </header>
          <MensajesCoordinacion entrenadores={entrenadores} idsDelDia={[]} dias={7} abiertoInicial modoPanel />
        </section>
      )}
    </div>
  );
}
