import React from 'react';
import { DictationButton } from '../../components/reports/DictationButton';
import { nombreHabilidad } from '../../core/reports/skillNotes';
import {
  faltaJustificacionTodoConsigue,
  MENSAJE_JUSTIFICAR_TODO_CONSIGUE,
  NOTA_HABILIDAD_MAX,
  NOTA_HABILIDAD_MIN,
  NOTA_PALABRAS_MIN,
  notaObligatoria,
  notaSuficiente,
  PASOS_REPORTE,
  type ValorTecnicoReporte,
} from '../../lib/adaptiveReport';
import {
  cargarCalidadEquipo,
  cargarMisReportesDevueltos,
  completarReporteDevuelto,
  type FilaCalidadEquipo,
  type ReporteDevuelto,
} from '../../services/reports/calidadReportesService';
import { calidadPropia, MINIMO_REPORTES } from '../reports/calidadReportes';

// Vista del entrenador (17/11/2026):
//  - «Tus reportes»: lo que ya hace bien y su siguiente paso (sin nota ni
//    comparación con el equipo). Arriba si va mal; abajo, discreta, si va bien.
//  - Reportes devueltos por coordinación: solo completa notas y observación.
// Sin la migración en Supabase no se enseña nada.

const hoyMadrid = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Madrid', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date());

// Una sola carga para las dos tarjetas (arriba/abajo).
let cacheCalidad: { cuando: number; promesa: Promise<FilaCalidadEquipo[]> } | null = null;
function filasCalidad(): Promise<FilaCalidadEquipo[]> {
  if (!cacheCalidad || Date.now() - cacheCalidad.cuando > 5 * 60000) {
    cacheCalidad = { cuando: Date.now(), promesa: cargarCalidadEquipo().catch(() => []) };
  }
  return cacheCalidad.promesa;
}

// Tono profesional y en positivo (17/11, Jose): sin nota, sin comparar con el
// equipo y sin rojo. El color solo distingue «va bien» del resto.
const ESTILO_BIEN = { fondo: '#f0fdf4', borde: '#86efac', acento: '#15803d' };
const ESTILO_MEJORA = { fondo: '#f5f8ff', borde: '#c7d2fe', acento: '#3730a3' };

export function CalidadPropiaEntrenador({ posicion }: { posicion: 'arriba' | 'abajo' }) {
  const [filas, setFilas] = React.useState<FilaCalidadEquipo[] | null>(null);
  React.useEffect(() => {
    let vivo = true;
    void filasCalidad().then((f) => vivo && setFilas(Array.isArray(f) ? f : []));
    return () => {
      vivo = false;
    };
  }, []);
  if (!filas || filas.length === 0) return null;

  const datos = calidadPropia(
    filas.map((f) => ({
      esMio: Boolean(f.es_mio),
      esFalta: Boolean(f.es_falta),
      fecha: f.fecha,
      valoradas: Number(f.valoradas) || 0,
      aMejorar: Number(f.a_mejorar) || 0,
      letras: Number(f.letras) || 0,
      pocoDetallado: Boolean(f.poco_detallado),
      igualGrupo: Boolean(f.igual_grupo),
      diasTarde: f.dias_tarde === null || f.dias_tarde === undefined ? null : Number(f.dias_tarde),
    })),
    hoyMadrid()
  );
  if (datos.reciente.reportes + datos.reciente.faltan < MINIMO_REPORTES || datos.reciente.nota === null) return null;
  const vaBien = datos.semaforo === 'verde';
  // Arriba solo si va mal; abajo solo si va bien.
  if ((posicion === 'arriba') === vaBien) return null;
  return <TarjetaCalidadPropia datos={datos} />;
}

export type DatosCalidadPropia = ReturnType<typeof calidadPropia>;

/** La tarjeta tal cual la ve el entrenador (también la usa coordinación para «Ver como lo ve el entrenador»). */
export function TarjetaCalidadPropia({ datos }: { datos: DatosCalidadPropia }) {
  if (datos.reciente.nota === null) return null;
  const vaBien = datos.semaforo === 'verde';
  const estilo = vaBien ? ESTILO_BIEN : ESTILO_MEJORA;
  const caja: React.CSSProperties = { background: '#fff', borderRadius: 12, padding: '10px 12px', display: 'grid', gap: 4, fontSize: 13.5, lineHeight: 1.4 };
  const titulo: React.CSSProperties = { fontSize: 12, letterSpacing: '.04em', color: estilo.acento };

  return (
    <article
      aria-label="Tus reportes"
      style={{ borderRadius: 18, padding: 14, display: 'grid', gap: 10, background: estilo.fondo, border: `1px solid ${estilo.borde}`, marginBottom: 12 }}
    >
      <div style={{ display: 'grid', gap: 2 }}>
        <strong style={{ fontSize: 16 }}>📋 Tus reportes · últimos 14 días</strong>
        <span style={{ fontSize: 12.5, color: '#475569' }}>
          {datos.reciente.reportes} {datos.reciente.reportes === 1 ? 'reporte hecho' : 'reportes hechos'}
          {datos.reciente.faltan ? ` · ${datos.reciente.faltan} pendiente${datos.reciente.faltan === 1 ? '' : 's'}` : ''}
          {' · '}Con ellos las familias ven cómo avanza su hijo y decidimos cuándo sube de nivel.
        </span>
      </div>
      {datos.fortalezas.length > 0 && (
        <div style={caja}>
          <strong style={titulo}>👍 LO QUE YA HACES BIEN</strong>
          {datos.fortalezas.map((f) => (
            <span key={f}>• {f}</span>
          ))}
        </div>
      )}
      {datos.consejos.length > 0 ? (
        <div style={caja}>
          <strong style={titulo}>🎯 TU SIGUIENTE PASO</strong>
          {datos.consejos.map((c) => (
            <span key={c}>• {c}</span>
          ))}
        </div>
      ) : (
        vaBien && <span style={{ fontSize: 13.5 }}>👏 Tus reportes están muy completos. Gracias por el esfuerzo.</span>
      )}
    </article>
  );
}

const etiquetaValor = (v: string) => PASOS_REPORTE.find((p) => p.valor === v)?.etiqueta || v;

function fechaCorta(f: string) {
  const d = new Date(`${f}T12:00:00`);
  return Number.isNaN(d.getTime())
    ? f
    : d.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'numeric' });
}

function CompletarDevuelto({ r, onHecho, onCancelar }: { r: ReporteDevuelto; onHecho: () => void; onCancelar: () => void }) {
  const valoradas = Object.entries(r.evaluacion_tecnica || {}).filter(([, v]) => v && v !== 'No trabajado');
  const [notas, setNotas] = React.useState<Record<string, string>>(() => ({ ...(r.notas_habilidades || {}) }));
  const [obs, setObs] = React.useState(r.observaciones || '');
  const [ocupado, setOcupado] = React.useState(false);
  const [error, setError] = React.useState('');

  const pendiente = valoradas.find(([id, v]) => notaObligatoria(v as ValorTecnicoReporte) && !notaSuficiente(notas[id]));
  const faltaFrase = faltaJustificacionTodoConsigue(Object.fromEntries(valoradas), notas, obs);

  async function guardar() {
    if (pendiente) {
      setError(`Escribe más en «${nombreHabilidad(pendiente[0])}» (mínimo ${NOTA_PALABRAS_MIN} palabras y ${NOTA_HABILIDAD_MIN} letras).`);
      return;
    }
    if (faltaFrase) {
      setError(MENSAJE_JUSTIFICAR_TODO_CONSIGUE);
      return;
    }
    setOcupado(true);
    setError('');
    try {
      const limpias = Object.fromEntries(
        valoradas.map(([id]) => [id, String(notas[id] || '').trim()] as [string, string]).filter(([, t]) => t)
      );
      await completarReporteDevuelto(r.reporte_id, limpias, obs.trim());
      onHecho();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar.');
    }
    setOcupado(false);
  }

  const caja: React.CSSProperties = { width: '100%', boxSizing: 'border-box', borderRadius: 12, border: '1px solid #fdba74', padding: 10, fontSize: 16, fontFamily: 'inherit' };
  return (
    <div style={{ display: 'grid', gap: 10, background: '#fff', borderRadius: 12, padding: 12 }}>
      <span style={{ fontSize: 12.5, color: '#64748b' }}>Tus valoraciones y el nivel no cambian: solo completa lo que has visto.</span>
      {valoradas.map(([id, v]) => {
        const obligatoria = notaObligatoria(v as ValorTecnicoReporte);
        const corta = obligatoria && !notaSuficiente(notas[id]);
        return (
          <label key={id} style={{ display: 'grid', gap: 4 }}>
            <span style={{ fontWeight: 800, fontSize: 14 }}>
              {nombreHabilidad(id)} · <span style={{ color: '#64748b' }}>{etiquetaValor(v)}</span>
              {obligatoria ? <span style={{ color: '#dc2626' }}> *</span> : <span style={{ color: '#64748b', fontWeight: 600 }}> (opcional)</span>}
            </span>
            <textarea
              rows={2}
              maxLength={NOTA_HABILIDAD_MAX}
              value={notas[id] || ''}
              onChange={(e) => setNotas({ ...notas, [id]: e.target.value })}
              placeholder={obligatoria ? 'Qué le falta y en qué momento le cuesta' : 'Cuéntalo en una frase: qué has visto'}
              style={caja}
            />
            <DictationButton value={notas[id] || ''} maxLength={NOTA_HABILIDAD_MAX} onChange={(t) => setNotas((n) => ({ ...n, [id]: t }))} />
            {corta && <span style={{ fontSize: 12, color: '#c2410c', fontWeight: 700 }}>Mínimo {NOTA_PALABRAS_MIN} palabras y {NOTA_HABILIDAD_MIN} letras.</span>}
          </label>
        );
      })}
      <label style={{ display: 'grid', gap: 4 }}>
        <span style={{ fontWeight: 800, fontSize: 14 }}>Observación (opcional)</span>
        <textarea rows={2} maxLength={500} value={obs} onChange={(e) => setObs(e.target.value)} style={caja} />
      </label>
      {faltaFrase && <span style={{ fontSize: 12.5, color: '#c2410c', fontWeight: 700 }}>✍️ {MENSAJE_JUSTIFICAR_TODO_CONSIGUE}</span>}
      {error && (
        <span role="alert" style={{ fontSize: 13, color: '#b91c1c', fontWeight: 800 }}>
          {error}
        </span>
      )}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          type="button"
          disabled={ocupado}
          onClick={() => void guardar()}
          style={{ flex: '1 1 160px', minHeight: 46, borderRadius: 12, border: 'none', background: '#ea580c', color: '#fff', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}
        >
          {ocupado ? 'Guardando…' : 'Guardar y devolver a coordinación'}
        </button>
        <button
          type="button"
          disabled={ocupado}
          onClick={onCancelar}
          style={{ minHeight: 46, padding: '0 14px', borderRadius: 12, border: '1px solid #cbd5e1', background: '#fff', fontWeight: 800, cursor: 'pointer' }}
        >
          Ahora no
        </button>
      </div>
    </div>
  );
}

export function ReportesDevueltosEntrenador() {
  const [lista, setLista] = React.useState<ReporteDevuelto[]>([]);
  const [abierto, setAbierto] = React.useState('');
  const [hecho, setHecho] = React.useState('');

  const cargar = React.useCallback(async () => {
    try {
      const filas = await cargarMisReportesDevueltos();
      setLista(Array.isArray(filas) ? filas : []);
    } catch {
      setLista([]);
    }
  }, []);

  React.useEffect(() => {
    void cargar();
    const alVolver = () => document.visibilityState === 'visible' && void cargar();
    document.addEventListener('visibilitychange', alVolver);
    return () => document.removeEventListener('visibilitychange', alVolver);
  }, [cargar]);

  if (!lista.length && !hecho) return null;

  return (
    <div style={{ display: 'grid', gap: 10, marginBottom: 12 }}>
      {hecho && (
        <p role="status" style={{ margin: 0, padding: '8px 12px', borderRadius: 10, background: '#dcfce7', color: '#166534', fontWeight: 800 }}>
          {hecho}
        </p>
      )}
      {lista.length > 0 && (
        <article style={{ border: '2px solid #fb923c', background: '#fff7ed', borderRadius: 16, padding: 12, display: 'grid', gap: 10 }}>
          <strong style={{ color: '#9a3412', fontSize: 16 }}>
            ↩️ Coordinación te ha devuelto {lista.length} reporte{lista.length === 1 ? '' : 's'} para completar
          </strong>
          {lista.map((r) => (
            <div key={r.reporte_id} style={{ display: 'grid', gap: 8, borderTop: '1px solid #fed7aa', paddingTop: 8 }}>
              <span style={{ fontSize: 14, overflowWrap: 'anywhere' }}>
                <b>{r.alumno || 'Alumno'}</b> · {fechaCorta(r.fecha)}
                {r.nombre_grupo ? ` · ${r.nombre_grupo}` : ''}
              </span>
              {r.motivo && <span style={{ fontSize: 13.5, color: '#7c2d12' }}>«{r.motivo}»</span>}
              {abierto === r.reporte_id ? (
                <CompletarDevuelto
                  r={r}
                  onCancelar={() => setAbierto('')}
                  onHecho={() => {
                    setAbierto('');
                    setHecho(`✓ Reporte de ${r.alumno || 'el alumno'} completado. Gracias.`);
                    void cargar();
                  }}
                />
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setHecho('');
                    setAbierto(r.reporte_id);
                  }}
                  style={{ minHeight: 46, borderRadius: 12, border: 'none', background: '#ea580c', color: '#fff', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}
                >
                  Completar ahora
                </button>
              )}
            </div>
          ))}
        </article>
      )}
    </div>
  );
}
