import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { TECHNICAL_LEVELS } from '../../core/levels/levelContract';
import {
  claveCandidato,
  construirAvisos,
  type AvisoCoordinacion,
  type FilaAvisoReporte,
} from '../../core/reports/coordinationAlerts';
import {
  obtenerFilasAvisosReportes,
  obtenerHistorialReportesAlumno,
  revisarAvisoReporte,
  subirNivelCandidato,
} from '../../services/reports/coordinationAlertsService';
import { ReporteHistorialTarjeta } from '../../components/students/StudentHistoryPanel';
import type { HistorialReporteAlumnoFichaApp } from '../../core/reports/reportTypes';
import { abrirFichaAlumno } from '../students/studentFichaStore';
import { cargarReportesCoordinacion } from '../../services/reports/coordinationReportsService';
import { calidadReporte } from './calidadReportes';

/**
 * Fase 3 (02/10/2026): avisos flotantes de reportes para coordinación.
 * Un botón pequeño arriba a la derecha («N avisos») que se abre en un panel con:
 *  - cambios de nivel marcados por entrenadores → Confirmar / Deshacer;
 *  - candidatos a subir (todos los focos conseguidos) → Subir a X / Todavía no
 *    (14/11: antes solo «Visto»; el nivel nunca cambia solo, lo confirma coordinación).
 * Se actualiza cada minuto y al volver a la app. Solo lectura salvo esas marcas.
 */
const INTERVALO_MS = 60000;
const CLAVE_VISTOS = 'mitico_avisos_candidatos_vistos_v1';

const nombreNivel = (n: string | null | undefined) => (n === 'INICIACION' ? 'Iniciación' : n || '—');

function fechaCorta(fecha: string) {
  const [, m, d] = String(fecha || '').split('-');
  return d && m ? `${d}/${m}` : fecha;
}

function leerVistos(): Set<string> {
  try {
    return new Set(JSON.parse(window.localStorage.getItem(CLAVE_VISTOS) || '[]'));
  } catch {
    return new Set();
  }
}

function guardarVistos(vistos: Set<string>) {
  try {
    window.localStorage.setItem(CLAVE_VISTOS, JSON.stringify([...vistos].slice(-300)));
  } catch {
    /* sin almacenamiento: se volverá a mostrar */
  }
}

function hoyIso() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function CoordinationAlerts(props: { onNivelCambiado?: () => void; soloLectura?: boolean }) {
  const [filas, setFilas] = useState<FilaAvisoReporte[]>([]);
  const [vistos, setVistos] = useState<Set<string>>(() => leerVistos());
  const [abierto, setAbierto] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [nivelElegido, setNivelElegido] = useState<Record<string, string>>({});
  // 16/11: ver el reporte completo del entrenador sin salir del aviso.
  const [reporteAbierto, setReporteAbierto] = useState<Record<string, HistorialReporteAlumnoFichaApp | 'cargando' | 'error'>>({});

  async function alternarReporte(aviso: AvisoCoordinacion) {
    if (reporteAbierto[aviso.id]) {
      const { [aviso.id]: _quitado, ...resto } = reporteAbierto;
      setReporteAbierto(resto);
      return;
    }
    setReporteAbierto((r) => ({ ...r, [aviso.id]: 'cargando' }));
    try {
      const historial = await obtenerHistorialReportesAlumno(aviso.alumnoId);
      const elegido =
        (aviso.tipo === 'nivel' ? historial.find((h) => h.reporte_id === aviso.reporteId) : null) ||
        [...historial].sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))[0];
      setReporteAbierto((r) => ({ ...r, [aviso.id]: elegido || 'error' }));
    } catch {
      setReporteAbierto((r) => ({ ...r, [aviso.id]: 'error' }));
    }
  }

  const fechaLarga = (f: string) => {
    const [y, m, d] = String(f || '').split('-');
    return d && m && y ? `${d}/${m}/${y}` : f;
  };
  const verReporte = (aviso: AvisoCoordinacion) => {
    const r = reporteAbierto[aviso.id];
    if (!r) return null;
    if (r === 'cargando') return <span className="mitico-avisos-reportes__nota">Cargando reporte…</span>;
    if (r === 'error') return <span className="mitico-avisos-reportes__nota">No se pudo cargar el reporte. Ábrelo desde su ficha.</span>;
    return (
      <div style={{ marginTop: 6 }}>
        <ReporteHistorialTarjeta report={r} currentLevel={aviso.tipo === 'nivel' ? aviso.nivelNuevo : aviso.nivel} formatDate={fechaLarga} />
      </div>
    );
  };
  // 17/11: reportes «poco detallados» (todo «Lo consigue» y nada escrito) → ⚠ en el aviso.
  const [pocoDetallados, setPocoDetallados] = useState<Set<string>>(new Set());
  const ultimaCarga = useRef(0);
  const onNivelRef = useRef(props.onNivelCambiado);
  onNivelRef.current = props.onNivelCambiado;

  const cargar = useCallback(async (forzar = false) => {
    if (!forzar && Date.now() - ultimaCarga.current < 5000) return;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    ultimaCarga.current = Date.now();
    try {
      const nuevas = await obtenerFilasAvisosReportes();
      setFilas(nuevas);
      const fechas = nuevas.map((f) => String(f.fecha || '')).filter(Boolean).sort();
      if (fechas.length) {
        // Máximo 31 días por consulta (límite de la función).
        const hace30 = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
        cargarReportesCoordinacion(fechas[0] > hace30 ? fechas[0] : hace30, hoyIso())
          .then((reportes) =>
            setPocoDetallados(
              new Set(reportes.filter((r) => r.reporte_id && calidadReporte(r).pocoDetallado).map((r) => String(r.reporte_id)))
            )
          )
          .catch(() => undefined); // sin marca si no se puede comprobar
      }
    } catch {
      // Sin la migración o sin conexión no se muestra nada (no molesta).
    }
  }, []);

  useEffect(() => {
    void cargar(true);
    const id = window.setInterval(() => void cargar(), INTERVALO_MS);
    const alVolver = () => void cargar();
    window.addEventListener('focus', alVolver);
    document.addEventListener('visibilitychange', alVolver);
    return () => {
      window.clearInterval(id);
      window.removeEventListener('focus', alVolver);
      document.removeEventListener('visibilitychange', alVolver);
    };
  }, [cargar]);

  const avisos = useMemo(() => construirAvisos(filas, hoyIso(), vistos), [filas, vistos]);

  useEffect(() => {
    if (avisos.length === 0) setAbierto(false);
  }, [avisos.length]);

  if (avisos.length === 0) return null;

  /** Reporte en el que se basa el aviso: el que cambió el nivel, o el último del niño. */
  const reporteDelAviso = (aviso: AvisoCoordinacion) =>
    aviso.tipo === 'nivel'
      ? aviso.reporteId
      : [...filas]
          .filter((f) => f.alumno_id === aviso.alumnoId)
          .sort((a, b) => String(b.fecha).localeCompare(String(a.fecha)))[0]?.reporte_id;
  const avisoPocoFiable = (aviso: AvisoCoordinacion) => {
    const id = reporteDelAviso(aviso);
    if (!id || !pocoDetallados.has(id)) return null;
    return (
      <span className="mitico-avisos-reportes__poco-fiable" role="note">
        ⚠ Reporte poco detallado: todo «Lo consigue» y nada escrito. Compruébalo antes de fiarte.
      </span>
    );
  };

  async function accion(aviso: AvisoCoordinacion, tipo: 'confirmar' | 'deshacer' | 'visto' | 'subir') {
    setError('');
    if (aviso.tipo === 'candidato' && tipo === 'subir') {
      if (!window.confirm(`¿Subir a ${aviso.alumno} a ${nombreNivel(aviso.siguiente)}?\n\nSe cambia el nivel de su ficha y el de sus próximos turnos.`)) return;
      setOcupado(aviso.id);
      try {
        await subirNivelCandidato(aviso.alumnoId, aviso.siguiente);
        onNivelRef.current?.();
        await cargar(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : 'No se ha podido cambiar el nivel.');
      } finally {
        setOcupado(null);
      }
      return;
    }
    if (aviso.tipo === 'candidato') {
      const nuevos = new Set(vistos);
      nuevos.add(claveCandidato(aviso.alumnoId, aviso.nivel));
      setVistos(nuevos);
      guardarVistos(nuevos);
      return;
    }
    setOcupado(aviso.id);
    try {
      if (tipo === 'confirmar') {
        await revisarAvisoReporte(aviso.reporteId, 'confirmar_nivel');
      } else {
        const nivel = aviso.nivelAnterior || nivelElegido[aviso.id];
        if (!nivel) {
          setError('Elige a qué nivel vuelve.');
          return;
        }
        await revisarAvisoReporte(aviso.reporteId, 'deshacer_nivel', nivel);
        onNivelRef.current?.();
      }
      await cargar(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se ha podido guardar.');
    } finally {
      setOcupado(null);
    }
  }

  const total = avisos.length;
  return (
    <div className="mitico-avisos-reportes">
      <button
        type="button"
        className="mitico-avisos-reportes__pastilla"
        aria-expanded={abierto}
        onClick={() => setAbierto(!abierto)}
      >
        <span aria-hidden="true">🔔</span> {total} {total === 1 ? 'aviso de reportes' : 'avisos de reportes'}
      </button>

      {abierto && (
        <section className="mitico-avisos-reportes__panel" aria-label="Avisos de reportes">
          <header>
            <strong>Avisos de reportes</strong>
            <button type="button" className="mitico-avisos-reportes__cerrar" onClick={() => setAbierto(false)} aria-label="Cerrar">
              ×
            </button>
          </header>
          {error && <p className="mitico-avisos-reportes__error" role="alert">{error}</p>}
          <ul>
            {avisos.map((aviso) => (
              <li key={aviso.id} className={`is-${aviso.tipo}`}>
                {aviso.tipo === 'nivel' && (
                  <>
                    <span className="mitico-avisos-reportes__tipo">{aviso.sube ? 'Sube de nivel' : 'Baja de nivel'}</span>
                    <strong>
                      {aviso.alumno}: {nombreNivel(aviso.nivelAnterior)} → {nombreNivel(aviso.nivelNuevo)}
                    </strong>
                    <span>
                      {aviso.entrenador || 'Entrenador'} · {aviso.modalidad || ''} · {fechaCorta(aviso.fecha)}. Ya se ha aplicado en su ficha.
                    </span>
                    {avisoPocoFiable(aviso)}
                    <div className="mitico-avisos-reportes__acciones">
                      {!props.soloLectura && (
                      <button type="button" className="is-ok" disabled={ocupado === aviso.id} onClick={() => void accion(aviso, 'confirmar')}>
                        Confirmar
                      </button>
                      )}
                      {props.soloLectura ? null : aviso.puedeDeshacer ? (
                        <>
                          {!aviso.nivelAnterior && (
                            <select
                              aria-label="Nivel al que vuelve"
                              value={nivelElegido[aviso.id] || ''}
                              onChange={(e) => setNivelElegido({ ...nivelElegido, [aviso.id]: e.target.value })}
                            >
                              <option value="">Volver a…</option>
                              {TECHNICAL_LEVELS.filter((n) => n !== aviso.nivelNuevo).map((n) => (
                                <option key={n} value={n}>{nombreNivel(n)}</option>
                              ))}
                            </select>
                          )}
                          <button type="button" disabled={ocupado === aviso.id} onClick={() => void accion(aviso, 'deshacer')}>
                            {aviso.nivelAnterior ? `Deshacer (volver a ${nombreNivel(aviso.nivelAnterior)})` : 'Deshacer'}
                          </button>
                        </>
                      ) : (
                        <span className="mitico-avisos-reportes__nota">Hay un reporte posterior: cámbialo desde su ficha.</span>
                      )}
                      <button type="button" onClick={() => abrirFichaAlumno(aviso.alumnoId)}>Ficha</button>
                      <button type="button" onClick={() => void alternarReporte(aviso)}>
                        {reporteAbierto[aviso.id] ? 'Ocultar reporte' : '📄 Ver reporte'}
                      </button>
                    </div>
                    {verReporte(aviso)}
                  </>
                )}
                {aviso.tipo === 'candidato' && (
                  <>
                    <span className="mitico-avisos-reportes__tipo">Candidato a subir</span>
                    <strong>{aviso.alumno}: listo para {nombreNivel(aviso.siguiente)}</strong>
                    <span>Tiene los {aviso.focos} focos de {nombreNivel(aviso.nivel)} conseguidos.</span>
                    {avisoPocoFiable(aviso)}
                    <div className="mitico-avisos-reportes__acciones">
                      {!props.soloLectura && (
                        <>
                          <button type="button" className="is-ok" disabled={ocupado === aviso.id} onClick={() => void accion(aviso, 'subir')}>
                            {ocupado === aviso.id ? 'Guardando…' : `Subir a ${nombreNivel(aviso.siguiente)}`}
                          </button>
                          <button type="button" disabled={ocupado === aviso.id} title="Deja de avisar hasta que cambie su nivel" onClick={() => void accion(aviso, 'visto')}>
                            Todavía no
                          </button>
                        </>
                      )}
                      <button type="button" onClick={() => abrirFichaAlumno(aviso.alumnoId)}>Ficha</button>
                      <button type="button" onClick={() => void alternarReporte(aviso)}>
                        {reporteAbierto[aviso.id] ? 'Ocultar reporte' : '📄 Último reporte'}
                      </button>
                    </div>
                    {verReporte(aviso)}
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
