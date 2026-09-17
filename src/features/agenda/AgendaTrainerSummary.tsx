import React from 'react';
import type { SessionTrainerCoverage } from './agendaTrainerSummary';

export function SessionTrainerCoverageLine({
  coverage,
  publishedGroups = 0,
}: {
  coverage: SessionTrainerCoverage;
  publishedGroups?: number;
}) {
  if (coverage.totalGroups <= 0) return null;

  const trainersComplete = coverage.pendingGroups === 0;
  const published = Math.max(
    0,
    Math.min(coverage.totalGroups, Number(publishedGroups || 0))
  );
  const publicationComplete = published === coverage.totalGroups;

  return (
    <div
      style={{
        marginTop: 7,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
      }}
    >
      <span
        style={{
          padding: '4px 7px',
          borderRadius: 999,
          background: trainersComplete ? '#f0fdf4' : '#fff7ed',
          border: `1px solid ${trainersComplete ? '#bbf7d0' : '#fed7aa'}`,
          color: trainersComplete ? '#166534' : '#9a3412',
          fontSize: 11,
          fontWeight: 800,
          lineHeight: 1.2,
        }}
      >
        {coverage.assignedGroups}/{coverage.totalGroups} con entrenador
        {coverage.trainerNames.length > 0
          ? ` · ${coverage.trainerNames.join(' · ')}`
          : ''}
        {coverage.pendingGroups > 0
          ? ` · ${coverage.pendingGroups} pendiente${
              coverage.pendingGroups === 1 ? '' : 's'
            }`
          : ''}
      </span>

      <span
        style={{
          padding: '4px 7px',
          borderRadius: 999,
          background: publicationComplete ? '#eff6ff' : '#f8fafc',
          border: `1px solid ${publicationComplete ? '#bfdbfe' : '#cbd5e1'}`,
          color: publicationComplete ? '#1d4ed8' : '#64748b',
          fontSize: 11,
          fontWeight: 800,
          lineHeight: 1.2,
        }}
      >
        {publicationComplete
          ? 'Entrenamiento publicado'
          : `${published}/${coverage.totalGroups} publicado${
              coverage.totalGroups === 1 ? '' : 's'
            }`}
      </span>
    </div>
  );
}
