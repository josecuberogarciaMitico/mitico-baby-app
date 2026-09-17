import {
  ESCALA_TECNICA_REPORTE,
  competenciasReporte,
  opcionesActitudAdaptada,
  opcionesIncidenciaAdaptada,
  opcionesMejoras,
  opcionesPrioridades,
  reportTechnicalLevelForRender,
  resumenTrabajoDiario,
  type EvaluacionTecnicaReporte,
  type ValorTecnicoReporte,
} from '../lib/adaptiveReport';

function MultiDesplegable(props: {
  label: string;
  opciones: string[];
  valores: string[];
  onChange: (valores: string[]) => void;
}) {
  const alternar = (opcion: string) => {
    props.onChange(
      props.valores.includes(opcion)
        ? props.valores.filter((valor) => valor !== opcion)
        : [...props.valores, opcion]
    );
  };
  return (
    <div className="adaptive-report-field adaptive-report-field--wide">
      <span className="adaptive-report-label">{props.label}</span>
      <details className="adaptive-report-multiselect">
        <summary>{props.valores.length ? `${props.valores.length} seleccionada${props.valores.length === 1 ? '' : 's'}` : 'Seleccionar'}</summary>
        <div className="adaptive-report-multiselect__list">
          {props.opciones.map((opcion) => (
            <label key={opcion} className="adaptive-report-check">
              <input type="checkbox" checked={props.valores.includes(opcion)} onChange={() => alternar(opcion)} />
              <span>{opcion}</span>
            </label>
          ))}
        </div>
      </details>
      {props.valores.length > 0 && <span className="adaptive-report-selected">{props.valores.join(' · ')}</span>}
    </div>
  );
}

export function AdaptiveReportFields(props: {
  modalidad: string;
  nivel: string;
  trabajoDiario?: string | null;
  actitud: string;
  ritmo: string;
  incidencia: string;
  evaluacion: EvaluacionTecnicaReporte;
  mejoras: string[];
  prioridades: string[];
  onActitud: (valor: string) => void;
  onRitmo: (valor: string) => void;
  onIncidencia: (valor: string) => void;
  onEvaluacion: (valor: EvaluacionTecnicaReporte) => void;
  onMejoras: (valores: string[]) => void;
  onPrioridades: (valores: string[]) => void;
}) {
  const nivel = reportTechnicalLevelForRender(props.nivel);
  const trabajo = resumenTrabajoDiario(props.trabajoDiario);

  if (!nivel) {
    return (
      <section className="adaptive-report" role="status">
        <div className="adaptive-report-work">
          <span>Nivel observado pendiente</span>
          <p>Selecciona un nivel individual válido para mostrar la evaluación técnica.</p>
        </div>
      </section>
    );
  }

  const competencias = competenciasReporte(nivel);
  return (
    <section className="adaptive-report">
      <div className="adaptive-report-work">
        <span>Trabajo de hoy</span>
        {trabajo.length ? <p>{trabajo.join(' · ')}</p> : <p>Sin trabajo diario definido para este grupo.</p>}
      </div>

      <div className="adaptive-report-grid">
        <label className="adaptive-report-field">
          <span className="adaptive-report-label">Actitud</span>
          <select value={props.actitud} onChange={(e) => props.onActitud(e.target.value)}>
            {opcionesActitudAdaptada(props.modalidad).map((opcion) => <option key={opcion}>{opcion}</option>)}
          </select>
        </label>
        <label className="adaptive-report-field">
          <span className="adaptive-report-label">Ritmo respecto al grupo</span>
          <select value={props.ritmo} onChange={(e) => props.onRitmo(e.target.value)}>
            <option value="">Sin seleccionar</option>
            <option>Lento para su nivel</option><option>Adecuado para su nivel</option>
            <option>Rápido para su nivel</option><option>Muy rápido · podría ir con nivel superior</option>
          </select>
        </label>
      </div>

      <div className="adaptive-report-tech">
        <div className="adaptive-report-section-title"><strong>Técnica</strong><span>Opciones adaptadas al nivel</span></div>
        {competencias.map((competencia) => (
          <label key={competencia.id} className="adaptive-report-tech-row">
            <span><strong>{competencia.nombre}</strong><small>{competencia.ayuda}</small></span>
            <select value={props.evaluacion[competencia.id] || 'No trabajado'} onChange={(e) => props.onEvaluacion({ ...props.evaluacion, [competencia.id]: e.target.value as ValorTecnicoReporte })}>
              {ESCALA_TECNICA_REPORTE.map((opcion) => <option key={opcion}>{opcion}</option>)}
            </select>
          </label>
        ))}
      </div>

      <div className="adaptive-report-grid">
        <MultiDesplegable label="Qué ha mejorado hoy" opciones={opcionesMejoras(nivel)} valores={props.mejoras} onChange={props.onMejoras} />
        <MultiDesplegable label="Próximas prioridades / recomendación" opciones={opcionesPrioridades(nivel)} valores={props.prioridades} onChange={props.onPrioridades} />
        <label className="adaptive-report-field adaptive-report-field--wide">
          <span className="adaptive-report-label">Incidencia</span>
          <select value={props.incidencia} onChange={(e) => props.onIncidencia(e.target.value)}>
            {opcionesIncidenciaAdaptada(props.modalidad).map((opcion) => <option key={opcion}>{opcion}</option>)}
          </select>
        </label>
      </div>
    </section>
  );
}
