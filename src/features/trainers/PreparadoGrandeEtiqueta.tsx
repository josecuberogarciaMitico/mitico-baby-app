import React from 'react';
import { cargarPreparadosGrandeVisibles } from '../../services/agenda/pistaGrandeService';

// 11/11: en la vista del entrenador, cada niño de A+ preparado para la pista
// grande lleva su etiqueta al abrir el grupo. Si la función no existe aún o
// falla, no se enseña nada.

type Preparado = { estado: 'listo' | 'casi'; motivo: string };

export function usePreparadosGrande() {
  const [mapa, setMapa] = React.useState<Map<string, Preparado>>(new Map());
  React.useEffect(() => {
    let vivo = true;
    cargarPreparadosGrandeVisibles()
      .then((filas) => {
        if (vivo) setMapa(new Map(filas.map((f) => [f.alumno_id, { estado: f.estado, motivo: f.motivo }])));
      })
      .catch(() => undefined);
    return () => {
      vivo = false;
    };
  }, []);
  return mapa;
}

export function PreparadoGrandeEtiqueta({ preparado }: { preparado?: Preparado }) {
  if (!preparado) return null;
  const listo = preparado.estado === 'listo';
  return (
    <span
      title={preparado.motivo}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        marginTop: 4,
        padding: '3px 9px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 800,
        background: listo ? '#dcfce7' : '#fef9c3',
        color: listo ? '#166534' : '#854d0e',
        border: `1px solid ${listo ? '#86efac' : '#fde047'}`,
      }}
    >
      {listo ? '🟢 Puede subir a la pista grande' : '🟡 Casi listo para la pista grande'}
    </span>
  );
}
