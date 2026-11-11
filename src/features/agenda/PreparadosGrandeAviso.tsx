import React, { useCallback, useEffect, useState } from 'react';
import { cargarPreparadosGrande } from '../../services/agenda/pistaGrandeService';
import type { PreparadoGrande } from '../baby/pistaGrandeCache';

// A+ preparados para la pista grande (11/11): aviso en Entrenamientos. Al
// cargar deja la lista lista para el recomendador, que los junta en un grupo
// «A+ · listos para la grande». Si la función no existe aún, no enseña nada.

type Props = { refresco?: number };

const boton: React.CSSProperties = {
  minHeight: 32,
  padding: '6px 10px',
  borderRadius: 9,
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#0f172a',
  fontSize: 12,
  fontWeight: 700,
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};

function fechaCorta(f: string | null) {
  const m = String(f || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m ? `${m[3]}/${m[2]}` : '';
}

export function PreparadosGrandeAviso({ refresco }: Props) {
  const [filas, setFilas] = useState<PreparadoGrande[]>([]);
  const [abierto, setAbierto] = useState(false);

  const cargar = useCallback(async () => {
    try {
      setFilas(await cargarPreparadosGrande());
    } catch {
      setFilas([]);
    }
  }, []);

  useEffect(() => {
    void cargar();
  }, [cargar, refresco]);

  if (!filas.length) return null;
  const listos = filas.filter((f) => f.estado === 'listo');
  const casi = filas.filter((f) => f.estado === 'casi');

  return (
    <div style={{ padding: '10px 12px', borderRadius: 12, background: '#f0fdf4', border: '1px solid #86efac', color: '#14532d', fontSize: 13, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <strong style={{ flex: '1 1 200px', minWidth: 0 }}>
          🟢 {listos.length === 1 ? '1 niño de A+ preparado' : `${listos.length} niños de A+ preparados`} para la pista grande
          {casi.length > 0 && <span style={{ fontWeight: 700 }}> · {casi.length} casi</span>}
        </strong>
        <button type="button" style={boton} onClick={() => setAbierto((x) => !x)}>
          {abierto ? 'Ocultar' : 'Ver'}
        </button>
      </div>
      {abierto && (
        <div style={{ display: 'grid', gap: 4, marginTop: 8 }}>
          {[...listos, ...casi].map((f) => (
            <div key={f.alumno_id} style={{ background: '#fff', borderRadius: 9, padding: '6px 10px', border: '1px solid #dcfce7' }}>
              <div style={{ fontWeight: 800, color: '#0f172a' }}>
                {f.estado === 'listo' ? '🟢' : '🟡'} {f.alumno}
              </div>
              <div style={{ fontSize: 12, color: '#475569' }}>
                {f.motivo}
                {f.fecha ? ` · ${fechaCorta(f.fecha)}` : ''}
              </div>
            </div>
          ))}
          <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>
            Al recomendar grupos, los preparados (si hay 2 o más en el turno) van juntos en «A+ · listos para la grande». Los
            entrenadores pueden marcarlo en el reporte de A+ («¿Ha probado la pista grande?») y eso manda sobre las habilidades.
          </p>
        </div>
      )}
    </div>
  );
}
