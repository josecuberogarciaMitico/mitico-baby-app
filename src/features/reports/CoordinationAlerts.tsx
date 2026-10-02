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
  revisarAvisoReporte,
} from '../../services/reports/coordinationAlertsService';
import { abrirFichaAlumno } from '../students/studentFichaStore';

/**
 * Fase 3 (02/10/2026): avisos flotantes de reportes para coordinación.
 * Un botón pequeño arriba a la derecha («N avisos») que se abre en un panel con:
 *  - cambios de nivel marcados por entrenadores → Confirmar / Deshacer;
 *  - incidencias → Visto;
 *  - candidatos a subir (todos los focos conseguidos) → Visto.
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

export function CoordinationAlerts(props: { onNivelCambiado?: () => void }) {
  const [filas, setFilas] = useState<FilaAvisoReporte[]>([]);
  const [vistos, setVistos] = useState<Set<string>>(() => leerVistos());
  const [abierto, setAbierto] = useState(false);
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [nivelElegido, setNivelElegido] = useState<Record<string, string>>({});
  const ultimaCarga = useRef(0);
  const onNivelRef = useRef(props.onNivelCambiado);
  onNivelRef.current = props.onNivelCambiado;

  const cargar = useCallback(async (forzar = false) => {
    if (!forzar && Date.now() - ultimaCarga.current < 5000) return;
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') return;
    ultimaCarga.current = Date.now();
    try {
      setFilas(await obtenerFilasAvisosReportes());
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

  async function accion(aviso: AvisoCoordinacion, tipo: 'confirmar' | 'deshacer' | 'visto') {
    setError('');
    if (aviso.tipo === 'candidato') {
      const nuevos = new Set(vistos);
      nuevos.add(claveCandidato(aviso.alumnoId, aviso.nivel));
      setVistos(nuevos);
      guardarVistos(nuevos);
      return;
    }
    setOcupado(aviso.id);
    try {
      if (aviso.tipo === 'incidencia') {
        await revisarAvisoReporte(aviso.reporteId, 'incidencia_vista');
      } else if (tipo === 'confirmar') {
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
                    <div className="mitico-avisos-reportes__acciones">
                      <button type="button" className="is-ok" disabled={ocupado === aviso.id} onClick={() => void accion(aviso, 'confirmar')}>
                        Confirmar
                      </button>
                      {aviso.puedeDeshacer ? (
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
                    </div>
                  </>
                )}
                {aviso.tipo === 'incidencia' && (
                  <>
                    <span className="mitico-avisos-reportes__tipo">Ha pasado algo</span>
                    <strong>{aviso.alumno}: {aviso.incidencia}</strong>
                    <span>{aviso.entrenador || 'Entrenador'} · {aviso.modalidad || ''} · {fechaCorta(aviso.fecha)}</span>
                    <div className="mitico-avisos-reportes__acciones">
                      <button type="button" className="is-ok" disabled={ocupado === aviso.id} onClick={() => void accion(aviso, 'visto')}>
                        Visto
                      </button>
                      <button type="button" onClick={() => abrirFichaAlumno(aviso.alumnoId)}>Ficha</button>
                    </div>
                  </>
                )}
                {aviso.tipo === 'candidato' && (
                  <>
                    <span className="mitico-avisos-reportes__tipo">Candidato a subir</span>
                    <strong>{aviso.alumno}: listo para {nombreNivel(aviso.siguiente)}</strong>
                    <span>Tiene los {aviso.focos} focos de {nombreNivel(aviso.nivel)} conseguidos.</span>
                    <div className="mitico-avisos-reportes__acciones">
                      <button type="button" onClick={() => abrirFichaAlumno(aviso.alumnoId)}>Ficha</button>
                      <button type="button" className="is-ok" onClick={() => void accion(aviso, 'visto')}>Visto</button>
                    </div>
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
