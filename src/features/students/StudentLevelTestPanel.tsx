import { useEffect, useRef, useState } from 'react';
import './StudentLevelTestPanel.css';

/**
 * Test de alta en la ficha del alumno (20/11/2026). Lo que contestó la
 * familia en el test de nivel al darle de alta. Solo lectura. Si el alumno no
 * tiene test (o el usuario no puede verlo) no se muestra nada.
 */
export type TestAltaAlumnoApp = {
  id: string;
  modalidad: string | null;
  respuesta_experiencia: string | null;
  respuesta_desplazamiento: string | null;
  respuesta_frenado: string | null;
  respuesta_giros: string | null;
  respuesta_remonte: string | null;
  respuesta_pista: string | null;
  respuesta_control_velocidad: string | null;
  respuesta_tecnica: string | null;
  observaciones_entrenador_familia: string[] | null;
  observacion_entrenador_otra: string | null;
  observaciones_familia: string | null;
  nivel_propuesto: string | null;
  nivel_propuesto_motivo: string | null;
  nivel_validado: string | null;
  respondido_at: string | null;
  validado_at: string | null;
};

type Props = {
  alumnoId: string;
  cargar: (alumnoId: string) => Promise<TestAltaAlumnoApp[]>;
  detallePregunta: (clave: string, respuesta: string | null) => { pregunta: string; respuestaTexto: string };
  formatDate: (fecha: string) => string;
};

const PREGUNTAS: Array<[string, keyof TestAltaAlumnoApp]> = [
  ['Experiencia', 'respuesta_experiencia'],
  ['Desplazamiento', 'respuesta_desplazamiento'],
  ['Frenado', 'respuesta_frenado'],
  ['Giros', 'respuesta_giros'],
  ['Remonte', 'respuesta_remonte'],
  ['Pista', 'respuesta_pista'],
  ['Control', 'respuesta_control_velocidad'],
  ['Técnica', 'respuesta_tecnica'],
];

const nombreNivel = (nivel: string | null) => (nivel === 'INICIACION' ? 'Iniciación' : nivel || '—');

export function StudentLevelTestPanel({ alumnoId, cargar, detallePregunta, formatDate }: Props) {
  const [tests, setTests] = useState<TestAltaAlumnoApp[]>([]);
  const [abierto, setAbierto] = useState(false);
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  useEffect(() => {
    let vigente = true;
    setTests([]);
    setAbierto(false);
    cargarRef
      .current(alumnoId)
      .then((filas) => vigente && setTests(Array.isArray(filas) ? filas : []))
      .catch(() => vigente && setTests([]));
    return () => {
      vigente = false;
    };
  }, [alumnoId]);

  const test = tests[0];
  if (!test) return null;

  const observacionesEntrenador = [
    ...(test.observaciones_entrenador_familia || []),
    ...(test.observacion_entrenador_otra ? [test.observacion_entrenador_otra] : []),
  ];

  return (
    <section className={`ftest${abierto ? ' is-abierto' : ''}`} aria-label="Test de alta">
      <button type="button" className="ftest-cab" onClick={() => setAbierto((v) => !v)} aria-expanded={abierto}>
        <span className="ftest-tit">
          📋 Test de alta
          <small>
            {test.respondido_at ? `Contestado el ${formatDate(test.respondido_at.slice(0, 10))}` : 'Contestado'}
            {test.nivel_validado ? ` · Nivel validado ${nombreNivel(test.nivel_validado)}` : ''}
          </small>
        </span>
        <span className="ftest-flecha" aria-hidden="true">{abierto ? '▲' : '▼'}</span>
      </button>

      {abierto && (
        <div className="ftest-cuerpo">
          <div className="ftest-niveles">
            <span>Propuesto: <b>{nombreNivel(test.nivel_propuesto)}</b></span>
            <span>Validado: <b>{nombreNivel(test.nivel_validado)}</b></span>
          </div>
          {test.nivel_propuesto_motivo && <p className="ftest-motivo">{test.nivel_propuesto_motivo}</p>}

          <ul className="ftest-lista">
            {PREGUNTAS.map(([clave, campo]) => {
              const d = detallePregunta(clave, (test[campo] as string | null) ?? null);
              return (
                <li key={clave}>
                  <small>{d.pregunta}</small>
                  <b>{d.respuestaTexto}</b>
                </li>
              );
            })}
          </ul>

          {observacionesEntrenador.length > 0 && (
            <div className="ftest-nota">
              <small>Para el entrenador</small>
              {observacionesEntrenador.join(' · ')}
            </div>
          )}
          {test.observaciones_familia && (
            <div className="ftest-nota">
              <small>Comentario de la familia</small>
              {test.observaciones_familia}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
