import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { StudentHistoryPanel } from '../../components/students/StudentHistoryPanel';
import { buildMasterStudentProfile } from '../../core/students/masterStudent';
import { reportTechnicalLevelForRender } from '../../lib/adaptiveReport';
import type { AlumnoResumen } from '../../core/students/studentTypes';
import type { OcioAlumnoApp } from '../ocio/ocioTypes';
import type { HistorialReporteAlumnoFichaApp } from '../../core/reports/reportTypes';
import { reportHistoryCounts, type ReportHistoryFilter } from '../../core/reports/reportHistory';
import {
  ETIQUETA_ESTADO,
  ETIQUETA_PASO,
  progresoHabilidadesNivel,
  resumenProgreso,
} from '../../core/reports/skillProgress';
import { cerrarFichaAlumno, abrirFichaAlumno, useFichaAlumnoAbierta } from './studentFichaStore';
import { FamilyLetterPanel } from './FamilyLetterPanel';

/**
 * Ficha única del alumno (fase 2, 01/10/2026). La misma para Baby, Ocio e
 * Intensivos; se abre como panel encima de la pantalla actual desde cualquier
 * sitio con abrirFichaAlumno(alumnoId). Solo lectura.
 */
type Props = {
  alumnos: AlumnoResumen[];
  ocioAlumnos: OcioAlumnoApp[];
  historialPorAlumno: Record<string, HistorialReporteAlumnoFichaApp[]>;
  cargandoHistorialId: string | null;
  cargarHistorial: (alumnoId: string, forzar?: boolean) => Promise<unknown>;
  formatDate: (fecha: string) => string;
  /** Carga la lista de alumnos si todavía no está (p. ej. al abrir desde la Agenda). */
  cargarAlumnos?: () => Promise<unknown> | void;
};

const normalizar = (texto: string) =>
  String(texto || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const nombreNivel = (nivel: string | null | undefined) => (nivel === 'INICIACION' ? 'Iniciación' : nivel || '');

export function StudentFichaSheet(props: Props) {
  const alumnoId = useFichaAlumnoAbierta();
  const [busqueda, setBusqueda] = useState('');
  const [filtro, setFiltro] = useState<ReportHistoryFilter>('TODOS');
  const [errorCarga, setErrorCarga] = useState('');
  const [cartaAbierta, setCartaAbierta] = useState(false);
  // App crea la función en cada render: se guarda en una ref para cargar
  // solo cuando cambia el alumno abierto.
  const cargarHistorialRef = useRef(props.cargarHistorial);
  cargarHistorialRef.current = props.cargarHistorial;
  const cargarAlumnosRef = useRef(props.cargarAlumnos);
  cargarAlumnosRef.current = props.cargarAlumnos;
  const alumnosPedidosRef = useRef(false);
  const alumnoEnLista = Boolean(alumnoId && props.alumnos.some((a) => a.alumno_id === alumnoId));

  useEffect(() => {
    // Solo una vez por sesión: si la lista no está cargada, se pide.
    if (!alumnoId || alumnoEnLista || alumnosPedidosRef.current) return;
    alumnosPedidosRef.current = true;
    void Promise.resolve(cargarAlumnosRef.current?.()).catch(() => undefined);
  }, [alumnoId, alumnoEnLista]);

  useEffect(() => {
    if (!alumnoId) return;
    setFiltro('TODOS');
    setBusqueda('');
    setErrorCarga('');
    setCartaAbierta(false);
    cargarHistorialRef.current(alumnoId).catch((err) =>
      setErrorCarga(err instanceof Error ? err.message : 'No se pudo cargar el historial.')
    );
  }, [alumnoId]);

  useEffect(() => {
    if (!alumnoId) return;
    const alPulsar = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cerrarFichaAlumno();
    };
    window.addEventListener('keydown', alPulsar);
    return () => window.removeEventListener('keydown', alPulsar);
  }, [alumnoId]);

  const resultados = useMemo(() => {
    const q = normalizar(busqueda);
    if (q.length < 2) return [];
    return props.alumnos.filter((a) => normalizar(a.alumno).includes(q)).slice(0, 8);
  }, [busqueda, props.alumnos]);

  if (!alumnoId || typeof document === 'undefined') return null;

  const alumno = props.alumnos.find((a) => a.alumno_id === alumnoId) || null;
  const ocio = props.ocioAlumnos.find((a) => a.alumno_id === alumnoId) || null;
  const reportes = props.historialPorAlumno[alumnoId] || [];
  const cargando = props.cargandoHistorialId === alumnoId;
  const perfil = alumno ? buildMasterStudentProfile(alumno) : null;
  const nivel = perfil?.level.level || reportTechnicalLevelForRender(reportes[0]?.nivel_reportado) || null;
  const progreso = progresoHabilidadesNivel(reportes, nivel);
  const resumen = resumenProgreso(progreso);
  const cuentas = reportHistoryCounts(reportes);
  const modalidades = (['BABY', 'OCIO', 'INTENSIVOS'] as const).filter(
    (m) => cuentas[m] > 0 || (m === 'OCIO' && ocio)
  );
  const nombre = alumno?.alumno || ocio?.alumno || 'Alumno';

  return createPortal(
    <div className="ficha-overlay" role="presentation" onClick={(e) => e.target === e.currentTarget && cerrarFichaAlumno()}>
      <section className="ficha-sheet" role="dialog" aria-modal="true" aria-label={`Ficha de ${nombre}`}>
        <div className="ficha-top">
          <input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar otro alumno (Baby, Ocio o Intensivos)…"
            aria-label="Buscar alumno"
          />
          <button type="button" className="ficha-close" onClick={cerrarFichaAlumno}>
            Cerrar
          </button>
          {resultados.length > 0 && (
            <ul className="ficha-results">
              {resultados.map((a) => (
                <li key={a.alumno_id}>
                  <button type="button" onClick={() => abrirFichaAlumno(a.alumno_id)}>
                    <strong>{a.alumno}</strong>
                    <span>{nombreNivel(a.nivel_actual || a.ultimo_nivel_reportado) || 'Sin nivel'}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
          {normalizar(busqueda).length >= 2 && resultados.length === 0 && (
            <p className="ficha-hint">No hay ningún alumno con ese nombre.</p>
          )}
        </div>

        <header className="ficha-head">
          <div>
            <span className="ficha-kicker">Ficha del alumno</span>
            <h2>{nombre}</h2>
            <p className="ficha-hint">
              {perfil?.age !== null && perfil?.age !== undefined ? `${perfil.age} años` : 'Edad sin registrar'}
              {ocio?.grupo_estable ? ` · Ocio: ${ocio.grupo_estable}` : ''}
            </p>
          </div>
          <div className="ficha-chips">
            <span className="ficha-chip is-level">{nivel ? `Nivel ${nombreNivel(nivel)}` : 'Sin nivel'}</span>
            {modalidades.map((m) => (
              <span key={m} className="ficha-chip">
                {m === 'BABY' ? 'Baby' : m === 'OCIO' ? 'Ocio' : 'Intensivos'}
              </span>
            ))}
            {perfil?.whatsappUrl && (
              <a className="ficha-chip is-link" href={perfil.whatsappUrl} target="_blank" rel="noreferrer">
                WhatsApp familia
              </a>
            )}
          </div>
          {perfil?.level.reviewRequired && <p className="ficha-warn">Revisar nivel: la ficha y el último reporte no coinciden.</p>}
        </header>

        <div className="ficha-stats">
          <div><b>{reportes.length}</b><span>reportes</span></div>
          <div><b>{reportes[0]?.fecha ? props.formatDate(reportes[0].fecha) : '—'}</b><span>último</span></div>
          <div><b>{nivel ? `${resumen.focosConseguidos}/${resumen.focos}` : '—'}</b><span>focos conseguidos</span></div>
        </div>

        {cartaAbierta ? (
          <FamilyLetterPanel
            alumnoId={alumnoId}
            datos={{ nombre, edad: perfil?.age ?? null, nivel, reportes, progreso, formatDate: props.formatDate }}
            onClose={() => setCartaAbierta(false)}
          />
        ) : (
          <button type="button" className="ficha-letter-open" onClick={() => setCartaAbierta(true)} disabled={reportes.length === 0}>
            ✉️ Carta para la familia
          </button>
        )}

        <section className="ficha-skills" aria-label="Habilidades del nivel">
          <div className="ficha-skills__title">
            <h3>{nivel ? `Habilidades de ${nombreNivel(nivel)}` : 'Habilidades'}</h3>
            <span className="ficha-hint">Conseguido = «Lo consigue» las 2 últimas veces, en días distintos.</span>
          </div>
          {!nivel && <p className="ficha-hint">Sin nivel no se pueden mostrar sus habilidades.</p>}
          {nivel && cargando && reportes.length === 0 && <p className="ficha-hint">Cargando…</p>}
          {progreso.map(({ habilidad, estado, valoraciones }) => (
            <div key={habilidad.id} className={`ficha-skill is-${estado}`}>
              <div className="ficha-skill__name">
                <strong>{habilidad.nombre}</strong>
                <span className={habilidad.foco ? 'report-focus-tag is-foco' : 'report-focus-tag'}>
                  {habilidad.foco ? 'Foco' : 'Base'}
                </span>
              </div>
              <span className="ficha-state">{ETIQUETA_ESTADO[estado]}</span>
              {valoraciones.some((v) => v.nota) && (
                <ul className="ficha-skill__notes">
                  {valoraciones.filter((v) => v.nota).slice(0, 2).map((v) => (
                    <li key={v.fecha}>
                      <b>{props.formatDate(v.fecha)}</b> {v.nota}
                    </li>
                  ))}
                </ul>
              )}
              <span className="ficha-dots" aria-label={valoraciones.map((v) => `${props.formatDate(v.fecha)}: ${ETIQUETA_PASO[v.puntos]}`).join(', ') || 'Sin valorar'}>
                {valoraciones.slice(0, 5).reverse().map((v) => (
                  <i key={v.fecha} className={`p${v.puntos}`} title={`${props.formatDate(v.fecha)} · ${ETIQUETA_PASO[v.puntos]}`} />
                ))}
              </span>
            </div>
          ))}
        </section>

        {errorCarga && <p className="ficha-warn">{errorCarga}</p>}

        <StudentHistoryPanel
          studentId={alumnoId}
          reports={reportes}
          filter={filtro}
          onFilterChange={setFiltro}
          loading={cargando}
          currentLevel={nivel || ''}
          formatDate={props.formatDate}
          totalReports={reportes.length}
          lastReportDate={reportes[0]?.fecha || null}
          levelReviewRequired={false}
          provisionalLevel={perfil?.level.status === 'PROVISIONAL'}
        />
      </section>
    </div>,
    document.body
  );
}
