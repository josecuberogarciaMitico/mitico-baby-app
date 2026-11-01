import React from 'react';
import { nombreHabilidad } from '../../core/reports/skillNotes';
import {
  cargarReportesCoordinacion,
  editarReporteCoordinacion,
  type ReporteCoordinacion,
} from '../../services/reports/coordinationReportsService';
import {
  agruparRevision,
  esHecho,
  etiquetaDia,
  filtrarRevision,
  limpiarNotas,
  lunesDeIso,
  sumarDiasIso,
  tieneTextoEscrito,
  type FiltroRevision,
} from './reportsReviewLogic';

// Revisar reportes (01/11): todos los reportes de una semana por día, turno y
// grupo, con lo que rellenó cada entrenador y los que faltan. Coordinación
// puede corregir lo que escriben ellos (notas por habilidad, observaciones y
// comentarios) con la RPC editar_reporte_coordinacion_app.

const hoyMadrid = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

const chip = (bg: string, fg: string): React.CSSProperties => ({
  display: 'inline-block',
  padding: '2px 8px',
  borderRadius: 999,
  background: bg,
  color: fg,
  fontSize: 11,
  fontWeight: 900,
  whiteSpace: 'nowrap',
});

const boton: React.CSSProperties = {
  minHeight: 38,
  padding: '7px 12px',
  borderRadius: 10,
  border: '1px solid #cbd5e1',
  background: '#ffffff',
  color: '#0f172a',
  fontWeight: 800,
  fontSize: 13,
  cursor: 'pointer',
};

const COLOR_EVAL: Record<string, [string, string]> = {
  Consolidado: ['#dcfce7', '#166534'],
  'En desarrollo': ['#fef9c3', '#854d0e'],
  'Necesita mejorar': ['#fee2e2', '#991b1b'],
};

function nombreCorto(x: string | null) {
  const p = String(x || '').trim().split(/\s+/)[0] || '';
  return p ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : 'Sin entrenador';
}

function Dato({ etiqueta, valor }: { etiqueta: string; valor: React.ReactNode }) {
  if (valor === null || valor === undefined || valor === '') return null;
  return (
    <span style={{ fontSize: 12, color: '#334155' }}>
      <strong style={{ color: '#64748b', fontWeight: 800 }}>{etiqueta}:</strong> {valor}
    </span>
  );
}

function EditorReporte({ fila, alGuardar, alCancelar }: { fila: ReporteCoordinacion; alGuardar: () => void; alCancelar: () => void }) {
  const claves = [...new Set([...Object.keys(fila.evaluacion_tecnica || {}), ...Object.keys(fila.notas_habilidades || {})])];
  const [notas, setNotas] = React.useState<Record<string, string>>(() => ({ ...(fila.notas_habilidades || {}) }));
  const [observaciones, setObservaciones] = React.useState(fila.observaciones || '');
  const [incidencia, setIncidencia] = React.useState(fila.incidencia_comentario || '');
  const [actitud, setActitud] = React.useState(fila.actitud_comentario || '');
  const [recomendacion, setRecomendacion] = React.useState(fila.recomendacion_comentario || '');
  const [guardando, setGuardando] = React.useState(false);
  const [error, setError] = React.useState('');

  const area: React.CSSProperties = {
    width: '100%',
    minHeight: 54,
    boxSizing: 'border-box',
    padding: 8,
    borderRadius: 10,
    border: '1px solid #cbd5e1',
    fontSize: 13,
    fontFamily: 'inherit',
    resize: 'vertical',
  };

  async function guardar() {
    if (!fila.reporte_id || guardando) return;
    if (!window.confirm(`¿Guardar los cambios en el reporte de ${fila.alumno}?`)) return;
    setGuardando(true);
    setError('');
    try {
      await editarReporteCoordinacion({
        reporteId: fila.reporte_id,
        observaciones,
        incidenciaComentario: incidencia,
        actitudComentario: actitud,
        recomendacionComentario: recomendacion,
        notasHabilidades: limpiarNotas(notas),
      });
      alGuardar();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo guardar.');
      setGuardando(false);
    }
  }

  const campo = (titulo: string, valor: string, cambiar: (v: string) => void, clave = titulo) => (
    <label key={clave} style={{ display: 'grid', gap: 3, fontSize: 12, fontWeight: 800, color: '#334155' }}>
      {titulo}
      <textarea value={valor} onChange={(e) => cambiar(e.target.value)} style={area} />
    </label>
  );

  return (
    <div style={{ display: 'grid', gap: 8, marginTop: 8, padding: 10, borderRadius: 12, background: '#fff7ed', border: '1px solid #fed7aa' }}>
      <strong style={{ fontSize: 13, color: '#9a3412' }}>Corregir lo que escribió el entrenador</strong>
      {claves.map((k) =>
        campo(`${nombreHabilidad(k)}${fila.evaluacion_tecnica?.[k] ? ` · ${fila.evaluacion_tecnica[k]}` : ''}`, notas[k] || '', (v) =>
          setNotas((n) => ({ ...n, [k]: v })),
          k
        )
      )}
      {campo('Observaciones', observaciones, setObservaciones)}
      {campo('Comentario de actitud', actitud, setActitud)}
      {campo('Comentario de incidencia', incidencia, setIncidencia)}
      {campo('Comentario de recomendación', recomendacion, setRecomendacion)}
      {error && <p style={{ margin: 0, color: '#b91c1c', fontWeight: 800, fontSize: 12.5 }}>{error}</p>}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button type="button" disabled={guardando} onClick={() => void guardar()} style={{ ...boton, background: '#0f766e', borderColor: '#0f766e', color: '#ffffff' }}>
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
        <button type="button" disabled={guardando} onClick={alCancelar} style={boton}>
          Cancelar
        </button>
      </div>
    </div>
  );
}

function TarjetaReporte({ fila, editando, setEditando, recargar }: {
  fila: ReporteCoordinacion;
  editando: boolean;
  setEditando: (v: boolean) => void;
  recargar: () => void;
}) {
  const hecho = esHecho(fila);
  const notas = Object.entries(fila.notas_habilidades || {}).filter(([, v]) => String(v || '').trim());
  const textos = [
    ['Observaciones', fila.observaciones],
    ['Actitud', fila.actitud_comentario],
    ['Incidencia', fila.incidencia_comentario],
    ['Recomendación', fila.recomendacion_comentario],
  ].filter(([, v]) => String(v || '').trim());
  const incidencia = fila.incidencia && fila.incidencia !== 'Sin incidencia' ? fila.incidencia : '';

  return (
    <div
      style={{
        padding: 10,
        borderRadius: 12,
        border: hecho ? '1px solid #e2e8f0' : '1px dashed #f59e0b',
        background: hecho ? '#ffffff' : '#fffbeb',
        display: 'grid',
        gap: 6,
        minWidth: 0,
      }}
    >
      <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
        <strong style={{ fontSize: 13.5, color: '#172033', overflowWrap: 'anywhere' }}>{fila.alumno}</strong>
        {hecho ? <span style={chip('#dcfce7', '#166534')}>✓ Hecho</span> : <span style={chip('#fef3c7', '#92400e')}>{fila.estado}</span>}
        {fila.nivel_reportado && <span style={chip('#e0e7ff', '#3730a3')}>{fila.nivel_reportado}</span>}
        <span style={{ fontSize: 12, color: '#64748b', fontWeight: 700 }}>{nombreCorto(fila.entrenador)}</span>
      </div>

      {hecho && (
        <>
          <div style={{ display: 'flex', gap: '2px 12px', flexWrap: 'wrap' }}>
            <Dato etiqueta="Actitud" valor={fila.actitud} />
            <Dato etiqueta="Pista" valor={fila.pista} />
            <Dato etiqueta="Ritmo" valor={fila.ritmo_grupo} />
            <Dato etiqueta="Autonomía" valor={fila.autonomia} />
            <Dato etiqueta="Remontes" valor={(fila.remontes || []).join(', ')} />
            <Dato etiqueta="Hoy mejoró" valor={(fila.mejoras_hoy || []).join(', ')} />
            <Dato etiqueta="Próxima sesión" valor={(fila.prioridades || []).join(', ') || fila.recomendacion} />
            {incidencia && <Dato etiqueta="Incidencia" valor={<span style={{ color: '#b91c1c', fontWeight: 800 }}>{incidencia}</span>} />}
          </div>

          <div style={{ padding: 8, borderRadius: 10, background: '#f8fafc', border: '1px solid #e2e8f0', display: 'grid', gap: 4 }}>
            <strong style={{ fontSize: 12, color: '#0f766e' }}>✍️ Lo que escribió</strong>
            {notas.length === 0 && textos.length === 0 && (
              <span style={{ fontSize: 12, color: '#94a3b8' }}>No escribió nada a mano.</span>
            )}
            {notas.map(([k, v]) => {
              const ev = fila.evaluacion_tecnica?.[k];
              const [bg, fg] = COLOR_EVAL[ev || ''] || ['#f1f5f9', '#334155'];
              return (
                <div key={k} style={{ fontSize: 12.5, color: '#172033', lineHeight: 1.4, overflowWrap: 'anywhere' }}>
                  <strong>{nombreHabilidad(k)}</strong> {ev && <span style={chip(bg, fg)}>{ev}</span>} — {v}
                </div>
              );
            })}
            {textos.map(([t, v]) => (
              <div key={t} style={{ fontSize: 12.5, color: '#172033', lineHeight: 1.4, overflowWrap: 'anywhere' }}>
                <strong>{t}:</strong> {v}
              </div>
            ))}
          </div>

          {editando ? (
            <EditorReporte
              fila={fila}
              alCancelar={() => setEditando(false)}
              alGuardar={() => {
                setEditando(false);
                recargar();
              }}
            />
          ) : (
            <div>
              <button type="button" onClick={() => setEditando(true)} style={{ ...boton, minHeight: 32, padding: '4px 10px', fontSize: 12 }}>
                ✏️ Corregir
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function ReportsReviewPanel({ esVistaMovilApp }: { esVistaMovilApp?: boolean }) {
  const [lunes, setLunes] = React.useState(() => lunesDeIso(hoyMadrid()));
  const [filas, setFilas] = React.useState<ReporteCoordinacion[] | null>(null);
  const [error, setError] = React.useState('');
  const [filtro, setFiltro] = React.useState<FiltroRevision>('todos');
  const [busqueda, setBusqueda] = React.useState('');
  const [editando, setEditando] = React.useState('');
  const domingo = sumarDiasIso(lunes, 6);

  const cargar = React.useCallback(() => {
    setError('');
    cargarReportesCoordinacion(lunes, domingo)
      .then(setFilas)
      .catch((err) => setError(err instanceof Error ? err.message : 'No se pudieron cargar los reportes.'));
  }, [lunes, domingo]);

  React.useEffect(() => {
    setFilas(null);
    cargar();
  }, [cargar]);

  const visibles: ReporteCoordinacion[] = filas ? filtrarRevision<ReporteCoordinacion>(filas, filtro, busqueda) : [];
  const dias = agruparRevision<ReporteCoordinacion>(visibles);
  const total = filas ? { hechos: filas.filter(esHecho).length, faltan: filas.filter((f) => !esHecho(f)).length, escritos: filas.filter((f) => esHecho(f) && tieneTextoEscrito(f)).length } : null;

  const filtros: [FiltroRevision, string][] = [
    ['todos', `Todos${total ? ` (${total.hechos + total.faltan})` : ''}`],
    ['escritos', `Con texto escrito${total ? ` (${total.escritos})` : ''}`],
    ['faltan', `Faltan${total ? ` (${total.faltan})` : ''}`],
  ];

  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <div style={{ padding: esVistaMovilApp ? 14 : 18, borderRadius: 20, background: 'linear-gradient(135deg,#062d3f,#0b5d4f)', color: '#ffffff', display: 'grid', gap: 10 }}>
        <div>
          <div style={{ fontSize: 11, fontWeight: 900, letterSpacing: '.06em', color: '#86efac' }}>REVISAR REPORTES</div>
          <h2 style={{ margin: '4px 0 2px', fontSize: esVistaMovilApp ? 22 : 26, lineHeight: 1.1 }}>Reportes de la semana</h2>
          <p style={{ margin: 0, fontSize: 13, color: '#cbd5e1' }}>
            Por día, turno y grupo. Puedes corregir lo que escribió el entrenador.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => setLunes(sumarDiasIso(lunes, -7))} style={{ ...boton, minWidth: 44 }} aria-label="Semana anterior">‹</button>
          <strong style={{ fontSize: 14 }}>
            {lunes.slice(8, 10)}/{lunes.slice(5, 7)} – {domingo.slice(8, 10)}/{domingo.slice(5, 7)}
          </strong>
          <button type="button" onClick={() => setLunes(sumarDiasIso(lunes, 7))} style={{ ...boton, minWidth: 44 }} aria-label="Semana siguiente">›</button>
          {total && (
            <span style={{ fontSize: 12.5, color: '#e2e8f0' }}>
              {total.hechos} hecho{total.hechos === 1 ? '' : 's'} · {total.faltan} falta{total.faltan === 1 ? '' : 'n'}
            </span>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {filtros.map(([valor, texto]) => (
          <button
            key={valor}
            type="button"
            onClick={() => setFiltro(valor)}
            style={{
              ...boton,
              borderRadius: 999,
              background: filtro === valor ? '#0f172a' : '#ffffff',
              color: filtro === valor ? '#ffffff' : '#0f172a',
              borderColor: filtro === valor ? '#0f172a' : '#cbd5e1',
            }}
          >
            {texto}
          </button>
        ))}
        <input
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar niño, entrenador o grupo"
          style={{ flex: '1 1 200px', minWidth: 0, minHeight: 38, padding: '7px 10px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 13 }}
        />
      </div>

      {error && <p style={{ margin: 0, color: '#b91c1c', fontWeight: 800 }}>{error}</p>}
      {!error && filas === null && <p style={{ margin: 0, color: '#475569' }}>Cargando reportes…</p>}
      {filas && dias.length === 0 && <p style={{ margin: 0, color: '#475569' }}>No hay reportes con este filtro en esta semana.</p>}

      {dias.map((dia) => (
        <section key={dia.fecha} style={{ display: 'grid', gap: 8 }}>
          <h3 style={{ margin: '6px 0 0', fontSize: 17, color: '#0f172a' }}>
            {etiquetaDia(dia.fecha)}{' '}
            <span style={{ fontSize: 12.5, color: '#64748b', fontWeight: 700 }}>
              · {dia.hechos} hecho{dia.hechos === 1 ? '' : 's'}{dia.faltan ? ` · ${dia.faltan} falta${dia.faltan === 1 ? '' : 'n'}` : ''}
            </span>
          </h3>
          {dia.turnos.map((turno) => (
            <div key={turno.clave} style={{ display: 'grid', gap: 8, padding: 10, borderRadius: 16, background: '#f1f5f9', border: '1px solid #e2e8f0' }}>
              <strong style={{ fontSize: 14, color: '#0f766e' }}>
                {turno.hora} · {turno.modalidad}
                <span style={{ color: '#64748b', fontWeight: 700, fontSize: 12.5 }}>
                  {' '}· {turno.hechos} hecho{turno.hechos === 1 ? '' : 's'}{turno.faltan ? ` · ${turno.faltan} falta${turno.faltan === 1 ? '' : 'n'}` : ''}
                </span>
              </strong>
              {turno.grupos.map((grupo) => (
                <details key={grupo.clave} open={!esVistaMovilApp} style={{ borderRadius: 12, background: '#ffffff', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
                  <summary style={{ cursor: 'pointer', padding: '10px 12px', fontWeight: 900, fontSize: 13.5, color: '#172033' }}>
                    {grupo.nombre}
                    <span style={{ fontWeight: 700, color: '#64748b' }}>
                      {' '}· {grupo.entrenadores.map(nombreCorto).join(' + ') || 'sin entrenador'} · {grupo.hechos} ✓
                      {grupo.faltan ? ` · ${grupo.faltan} falta${grupo.faltan === 1 ? '' : 'n'}` : ''}
                    </span>
                  </summary>
                  <div
                    style={{
                      padding: '0 10px 10px',
                      display: 'grid',
                      gap: 8,
                      alignItems: 'start',
                      gridTemplateColumns: esVistaMovilApp ? 'minmax(0,1fr)' : 'repeat(auto-fill, minmax(320px, 1fr))',
                    }}
                  >
                    {grupo.filas.map((fila) => {
                      const clave = fila.reporte_id || `${fila.grupo_id}-${fila.alumno_id}-${fila.entrenador_id}`;
                      return (
                        <TarjetaReporte
                          key={clave}
                          fila={fila}
                          editando={editando === clave}
                          setEditando={(v) => setEditando(v ? clave : '')}
                          recargar={cargar}
                        />
                      );
                    })}
                  </div>
                </details>
              ))}
            </div>
          ))}
        </section>
      ))}
    </section>
  );
}
