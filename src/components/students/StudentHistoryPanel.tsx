import type { CSSProperties } from 'react';
import { resumenEvaluacionTecnica } from '../../lib/adaptiveReport';
import {
  extractDailyWorkObjective,
  filterReportHistory,
  reportHistoryCounts,
  type ReportHistoryFilter,
} from '../../core/reports/reportHistory';
import type { HistorialReporteAlumnoFichaApp } from '../../core/reports/reportTypes';

export type StudentHistoryPanelProps = {
  studentId: string;
  reports: HistorialReporteAlumnoFichaApp[];
  filter: ReportHistoryFilter;
  onFilterChange: (filter: ReportHistoryFilter) => void;
  loading: boolean;
  currentLevel: string;
  formatDate: (date: string) => string;
  totalReports?: number;
  lastReportDate?: string | null;
  levelReviewRequired?: boolean;
  provisionalLevel?: boolean;
};

const panel: CSSProperties = {
  marginTop: 10,
  padding: 14,
  borderRadius: 16,
  display: 'grid',
  gap: 12,
  border: '1px solid #bbf7d0',
  background: '#f8fffb',
};

const badge: CSSProperties = {
  display: 'inline-flex',
  alignItems: 'center',
  minHeight: 28,
  padding: '3px 9px',
  borderRadius: 999,
  background: '#e2e8f0',
  color: '#334155',
  fontSize: 12,
  fontWeight: 850,
};

const notice: CSSProperties = {
  padding: 12,
  borderRadius: 14,
  border: '1px solid #dbeafe',
  background: '#eff6ff',
  color: '#334155',
  lineHeight: 1.5,
};

export function StudentHistoryPanel({
  studentId,
  reports,
  filter,
  onFilterChange,
  loading,
  currentLevel,
  formatDate,
  totalReports,
  lastReportDate,
  levelReviewRequired = false,
  provisionalLevel = false,
}: StudentHistoryPanelProps) {
  const filtered = filterReportHistory(reports, filter);
  const counts = reportHistoryCounts(reports);
  const filters: ReportHistoryFilter[] = ['TODOS', 'BABY', 'OCIO', 'INTENSIVOS'];

  return (
    <div style={panel}>
      <div>
        <strong>Ficha maestra · Historial exacto</strong>
        <p style={{ margin: '4px 0 0', color: '#64748b' }}>
          Una única cronología para Baby, Ocio e Intensivos. El detalle permanece cerrado hasta que lo necesitas.
        </p>
      </div>

      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {filters.map((option) => {
          const active = filter === option;
          return (
            <button
              key={`history-filter-${option}`}
              type="button"
              onClick={() => onFilterChange(option)}
              style={{
                minHeight: 38,
                padding: '7px 11px',
                borderRadius: 10,
                border: `1px solid ${active ? '#0f766e' : '#dbe3ee'}`,
                background: active ? '#0f766e' : '#ffffff',
                color: active ? '#ffffff' : '#475569',
                fontWeight: 850,
                cursor: 'pointer',
              }}
            >
              {option === 'TODOS' ? 'Todos' : option} · {counts[option]}
            </button>
          );
        })}
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={badge}>Nivel actual: {currentLevel || 'SIN NIVEL'}</span>
        {totalReports !== undefined && <span style={badge}>{totalReports} reportes técnicos</span>}
        {lastReportDate && <span style={badge}>Último: {formatDate(lastReportDate)}</span>}
      </div>

      {levelReviewRequired && (
        <div style={{ ...notice, borderColor: '#fed7aa', background: '#fff7ed', color: '#9a3412', fontWeight: 800 }}>
          Revisar nivel: el último reporte válido gobierna la operativa, pero la ficha almacenada todavía no está reconciliada.
        </div>
      )}
      {provisionalLevel && (
        <div style={{ ...notice, borderColor: '#fde68a', background: '#fffbeb', color: '#92400e', fontWeight: 800 }}>
          Nivel provisional: todavía no hay un nivel real confirmado en ficha.
        </div>
      )}

      {loading && <p style={{ margin: 0, color: '#475569', fontWeight: 700 }}>Cargando historial...</p>}
      {!loading && filtered.length === 0 && (
        <div style={notice}>
          {reports.length === 0
            ? 'Todavía no hay reportes técnicos guardados. No se completarán campos ni niveles con datos inventados.'
            : `No hay reportes de ${filter.toLowerCase()}. Selecciona Todos para consultar el resto del historial.`}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <div style={{ display: 'grid', gap: 10 }}>
          {filtered.map((report, index) => {
            const dailyObjective = extractDailyWorkObjective(report.trabajo_diario);
            const lifts = Array.isArray(report.remontes) ? report.remontes.filter(Boolean) : [];
            const improvements = Array.isArray(report.mejoras_hoy) && report.mejoras_hoy.length
              ? report.mejoras_hoy
              : report.mejora_hoy ? [report.mejora_hoy] : [];
            const priorities = Array.isArray(report.prioridades_proxima_sesion) && report.prioridades_proxima_sesion.length
              ? report.prioridades_proxima_sesion
              : report.recomendacion ? [report.recomendacion] : [];
            const skills = resumenEvaluacionTecnica(
              report.evaluacion_tecnica,
              report.nivel_reportado || currentLevel
            );

            return (
              <article
                key={report.reporte_id || `${studentId}-${report.fecha}-${report.modalidad}-${index}`}
                style={{ border: '1px solid #dbeafe', borderRadius: 16, padding: 14, background: '#ffffff' }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, alignItems: 'flex-start', flexWrap: 'wrap' }}>
                  <div>
                    <strong style={{ fontSize: 16 }}>{formatDate(report.fecha)}</strong>
                    <div style={{ marginTop: 3, color: '#64748b', fontWeight: 700 }}>
                      {[report.modalidad, report.grupo].filter(Boolean).join(' · ') || 'Sesión técnica'}
                    </div>
                    {report.entrenador && <div style={{ marginTop: 2, color: '#64748b', fontSize: 13 }}>Entrenador: {report.entrenador}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {report.nivel_reportado && <span style={badge}>Nivel {report.nivel_reportado}</span>}
                    {report.tecnica && <span style={badge}>{report.tecnica}</span>}
                    {Number(report.reporte_version || 1) < 2 && <span style={{ ...badge, background: '#f8fafc' }}>Formato anterior</span>}
                  </div>
                </div>

                <div style={{ display: 'grid', gap: 7, marginTop: 11, lineHeight: 1.45 }}>
                  {dailyObjective && <p style={{ margin: 0 }}><strong>Trabajo:</strong> {dailyObjective}</p>}
                  {skills && <p style={{ margin: 0 }}><strong>Competencias:</strong> {skills}</p>}
                  {improvements.length > 0 && <p style={{ margin: 0 }}><strong>Mejoró:</strong> {improvements.join(' · ')}</p>}
                  {report.observaciones_generales && (
                    <div style={{ ...notice, borderColor: '#bbf7d0', background: '#f0fdf4', color: '#166534', padding: 10 }}>
                      <strong>Observación:</strong> {report.observaciones_generales}
                    </div>
                  )}
                  {priorities.length > 0 && <p style={{ margin: 0 }}><strong>Siguiente paso:</strong> {priorities.join(' · ')}</p>}
                </div>

                <details style={{ marginTop: 10, borderTop: '1px solid #e2e8f0', paddingTop: 9 }}>
                  <summary style={{ cursor: 'pointer', fontWeight: 850, color: '#475569' }}>
                    Ver trabajo del día y datos completos
                  </summary>
                  {report.trabajo_diario && (
                    <div style={{ marginTop: 10, padding: 10, borderRadius: 12, background: '#f8fafc', whiteSpace: 'pre-wrap', color: '#334155' }}>
                      {report.trabajo_diario}
                    </div>
                  )}
                  <p style={{ margin: '10px 0 0', lineHeight: 1.5 }}>
                    Actitud: {report.actitud || '-'} · Técnica: {report.tecnica || '-'} · Autonomía: {report.autonomia || '-'} · Pista: {report.pista || '-'} · Remontes: {lifts.join(', ') || '-'} · Ritmo: {report.ritmo_grupo || '-'} · Incidencia: {report.incidencia || '-'}
                  </p>
                </details>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
