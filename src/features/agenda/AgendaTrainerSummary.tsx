import React from 'react';
import type { SessionTrainerCoverage, WeeklyTrainerLoad } from './agendaTrainerSummary';

export function SessionTrainerCoverageLine({ coverage }: { coverage: SessionTrainerCoverage }) {
  if (coverage.totalGroups <= 0) return null;
  const complete = coverage.pendingGroups === 0;
  return (
    <div
      style={{
        marginTop: 7,
        padding: '6px 8px',
        borderRadius: 9,
        background: complete ? '#f0fdf4' : '#fff7ed',
        border: `1px solid ${complete ? '#bbf7d0' : '#fed7aa'}`,
        color: complete ? '#166534' : '#9a3412',
        fontSize: 12,
        lineHeight: 1.35,
      }}
    >
      <strong>
        {coverage.assignedGroups}/{coverage.totalGroups} con entrenador
      </strong>
      {coverage.trainerNames.length > 0 && (
        <span> · {coverage.trainerNames.join(' · ')}</span>
      )}
      {coverage.pendingGroups > 0 && (
        <strong> · {coverage.pendingGroups} pendiente{coverage.pendingGroups === 1 ? '' : 's'}</strong>
      )}
    </div>
  );
}

export function WeeklyTrainerSummary({
  loads,
  pendingGroups,
  loading,
}: {
  loads: WeeklyTrainerLoad[];
  pendingGroups: number;
  loading?: boolean;
}) {
  return (
    <article
      style={{
        marginTop: 12,
        padding: '11px 13px',
        borderRadius: 14,
        border: '1px solid #dbeafe',
        background: '#f8fbff',
        display: 'grid',
        gap: 8,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 10,
          flexWrap: 'wrap',
        }}
      >
        <strong style={{ color: '#0f172a' }}>Resumen semanal de entrenadores</strong>
        <span
          style={{
            fontSize: 12,
            fontWeight: 800,
            color: pendingGroups > 0 ? '#9a3412' : '#166534',
          }}
        >
          {loading
            ? 'Actualizando…'
            : pendingGroups > 0
              ? `${pendingGroups} grupo${pendingGroups === 1 ? '' : 's'} sin entrenador`
              : 'Todos los grupos con entrenador'}
        </span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
        {loads.map((load) => (
          <span
            key={load.trainerId}
            style={{
              padding: '6px 9px',
              borderRadius: 999,
              background: load.turns === 0 ? '#f8fafc' : '#ffffff',
              border: `1px solid ${load.turns === 0 ? '#cbd5e1' : '#bfdbfe'}`,
              color: load.turns === 0 ? '#64748b' : '#1e3a8a',
              fontSize: 12,
              fontWeight: 800,
            }}
          >
            {load.trainerName} · {load.turns} turno{load.turns === 1 ? '' : 's'}
            {load.doubles.length > 0 ? ` · ${load.doubles.join(' · ')}` : ''}
          </span>
        ))}
      </div>
    </article>
  );
}
