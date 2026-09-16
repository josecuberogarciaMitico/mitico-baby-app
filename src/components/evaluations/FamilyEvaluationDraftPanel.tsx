import { compactFamilyReportPreview } from '../../core/reports/reportHistory';

export type FamilyEvaluationDraftPanelProps = {
  title: string;
  description: string;
  value: string;
  onCopy: () => void | Promise<void>;
  onClose: () => void;
};

export function FamilyEvaluationDraftPanel({
  title,
  description,
  value,
  onCopy,
  onClose,
}: FamilyEvaluationDraftPanelProps) {
  return (
    <div style={{ marginTop: 12, padding: 14, borderRadius: 16, border: '1px solid #bfdbfe', background: '#fff' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div>
          <h4 style={{ margin: 0 }}>{title}</h4>
          <p style={{ margin: '6px 0 0', color: '#64748b' }}>{description}</p>
        </div>
        <button type="button" onClick={onClose} style={{ minHeight: 38, padding: '8px 12px', borderRadius: 10, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 850, cursor: 'pointer' }}>
          Cerrar
        </button>
      </div>

      <pre style={{ whiteSpace: 'pre-wrap', margin: '12px 0 0', padding: 12, borderRadius: 12, background: '#eff6ff', color: '#1e40af', fontFamily: 'inherit', lineHeight: 1.5 }}>
        {compactFamilyReportPreview(value)}
      </pre>

      <details style={{ marginTop: 12, border: '1px solid #dbeafe', borderRadius: 14, background: '#f8fbff', padding: 12 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 900 }}>Ver base técnica completa</summary>
        <textarea readOnly value={value} style={{ minHeight: 220, width: '100%', boxSizing: 'border-box', marginTop: 12, padding: 10, border: '1px solid #cbd5e1', borderRadius: 10, whiteSpace: 'pre-wrap', font: 'inherit' }} />
      </details>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 12 }}>
        <button type="button" onClick={() => void onCopy()} style={{ minHeight: 40, padding: '9px 14px', borderRadius: 11, border: '1px solid #0f766e', background: '#0f766e', color: '#fff', fontWeight: 900, cursor: 'pointer' }}>
          Copiar base del informe
        </button>
      </div>
    </div>
  );
}
