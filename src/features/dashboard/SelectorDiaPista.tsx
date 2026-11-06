import React, { useEffect, useState } from 'react';
import { diaAlCambiarSemana, diasEntrenoSemana, etiquetaSemana, lunesDe, sumarDiasIso } from './selectorDiaPistaLogic';
import { sesionesPorDia } from '../../services/reports/coordinationReportsService';

// Trabajo en pista (06/11): en vez de escribir la fecha, semana con flechas y
// un botón por día de entreno (miércoles a domingo). Los días sin sesiones se
// ven apagados.

type Props = { fecha: string; hoy: string; onCambiar: (fecha: string) => void };

export function SelectorDiaPista({ fecha, hoy, onCambiar }: Props) {
  const lunes = lunesDe(fecha);
  const [cuenta, setCuenta] = useState<Record<string, number>>({});

  useEffect(() => {
    let vivo = true;
    sesionesPorDia(lunes, sumarDiasIso(lunes, 6))
      .then((c) => vivo && setCuenta(c))
      .catch(() => vivo && setCuenta({}));
    return () => {
      vivo = false;
    };
  }, [lunes]);

  async function cambiarSemana(dias: number) {
    const otroLunes = sumarDiasIso(lunes, dias);
    let c: Record<string, number> = {};
    try {
      c = await sesionesPorDia(otroLunes, sumarDiasIso(otroLunes, 6));
    } catch {
      c = {};
    }
    onCambiar(diaAlCambiarSemana(otroLunes, c));
  }

  const flecha: React.CSSProperties = {
    minWidth: 38,
    minHeight: 38,
    borderRadius: 11,
    border: '1px solid rgba(255,255,255,.28)',
    background: 'rgba(255,255,255,.12)',
    color: '#fff',
    fontSize: 18,
    fontWeight: 900,
    cursor: 'pointer',
  };

  return (
    <div style={{ display: 'grid', gap: 6, minWidth: 0 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#cbd5e1', fontSize: 11, fontWeight: 900, letterSpacing: '.08em' }}>
        <button type="button" style={flecha} onClick={() => void cambiarSemana(-7)} aria-label="Semana anterior">
          ‹
        </button>
        <span style={{ flex: 1, textAlign: 'center', whiteSpace: 'nowrap' }}>SEMANA {etiquetaSemana(fecha)}</span>
        <button type="button" style={flecha} onClick={() => void cambiarSemana(7)} aria-label="Semana siguiente">
          ›
        </button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, minmax(0, 1fr))', gap: 6 }}>
        {diasEntrenoSemana(fecha).map((d) => {
          const activo = d.fecha === fecha;
          const hay = (cuenta[d.fecha] || 0) > 0;
          return (
            <button
              key={d.fecha}
              type="button"
              onClick={() => onCambiar(d.fecha)}
              aria-pressed={activo}
              title={hay ? `${cuenta[d.fecha]} ${cuenta[d.fecha] === 1 ? 'sesión' : 'sesiones'}` : 'Sin sesiones'}
              style={{
                minHeight: 48,
                padding: '4px 2px',
                borderRadius: 12,
                border: activo ? '2px solid #22c55e' : '1px solid rgba(255,255,255,.24)',
                background: activo ? '#ffffff' : hay ? 'rgba(255,255,255,.92)' : 'rgba(255,255,255,.14)',
                color: activo ? '#065f46' : hay ? '#0f172a' : '#cbd5e1',
                fontWeight: 900,
                lineHeight: 1.1,
                cursor: 'pointer',
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <span style={{ fontSize: 12 }}>
                {d.nombre}
                {d.fecha === hoy ? ' · hoy' : ''}
              </span>
              <span style={{ fontSize: 17 }}>{d.dia}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
