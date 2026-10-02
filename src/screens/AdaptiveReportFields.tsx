import { useState } from 'react';
import { DictationButton } from '../components/reports/DictationButton';
import {
  ACTITUD_GENERAL,
  NOTA_HABILIDAD_MAX,
  NOTA_HABILIDAD_MIN,
  PASOS_REPORTE,
  habilidadesDelNivel,
  habilidadesDelTrabajoDeHoy,
  nivelesVecinos,
  opcionesActitudDestacar,
  opcionesIncidenciaAdaptada,
  reportTechnicalLevelForRender,
  resumenTrabajoDiario,
  type EvaluacionTecnicaReporte,
  type HabilidadNivel,
  type OpcionReporte,
  type ValorTecnicoReporte,
} from '../lib/adaptiveReport';
import { TECHNICAL_LEVELS } from '../core/levels/levelContract';

/**
 * Reporte por focos (fase 1, 01/10/2026).
 * El entrenador elige el nivel en el que ha visto al alumno, valora con
 * 3 pasos (Todavía no / A veces / Lo consigue) las habilidades de ese nivel
 * y marca actitud e incidencia con botones. Los valores se guardan con la
 * misma escala e ids que ya acepta Supabase.
 */

const comoOpcion = (o: string | OpcionReporte): OpcionReporte =>
  typeof o === 'string' ? { etiqueta: o, valor: o } : o;

export function BotonesOpcion(props: {
  label: string;
  opciones: Array<string | OpcionReporte>;
  valor: string;
  onChange: (valor: string) => void;
  obligatorio?: boolean;
  ayuda?: string;
}) {
  const opciones = props.opciones.map(comoOpcion).filter((o) => o.valor);
  return (
    <div className="report-focus-block">
      <span className="report-focus-label">
        {props.label}
        {props.obligatorio && <span className="report-focus-req"> *</span>}
      </span>
      {props.ayuda && <span className="report-focus-hint">{props.ayuda}</span>}
      <div className="report-focus-seg" role="group" aria-label={props.label}>
        {opciones.map((opcion) => (
          <button
            key={opcion.valor}
            type="button"
            aria-pressed={props.valor === opcion.valor}
            className={props.valor === opcion.valor ? 'is-on' : undefined}
            onClick={() => props.onChange(opcion.valor)}
          >
            {opcion.etiqueta}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Igual que BotonesOpcion, pero se pueden marcar varias (pulsar otra vez desmarca). */
export function BotonesVarios(props: {
  label: string;
  opciones: OpcionReporte[];
  valores: string[];
  onChange: (valores: string[]) => void;
  ayuda?: string;
}) {
  const alternar = (valor: string) =>
    props.onChange(
      props.valores.includes(valor)
        ? props.valores.filter((v) => v !== valor)
        : [...props.valores, valor]
    );
  return (
    <div className="report-focus-block">
      <span className="report-focus-label">{props.label}</span>
      {props.ayuda && <span className="report-focus-hint">{props.ayuda}</span>}
      <div className="report-focus-seg report-focus-seg--multi" role="group" aria-label={props.label}>
        {props.opciones.map((opcion) => {
          const marcada = props.valores.includes(opcion.valor);
          return (
            <button
              key={opcion.valor}
              type="button"
              aria-pressed={marcada}
              className={marcada ? 'is-on' : undefined}
              onClick={() => alternar(opcion.valor)}
            >
              {marcada ? '✓ ' : ''}
              {opcion.etiqueta}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function FilaHabilidad(props: {
  habilidad: HabilidadNivel;
  nivel: string;
  valor: ValorTecnicoReporte | undefined;
  onChange: (valor: ValorTecnicoReporte | null) => void;
  nota: string;
  onNota: (texto: string) => void;
}) {
  const { habilidad } = props;
  const [dictando, setDictando] = useState(false);
  const notaCorta = props.nota.trim().length < NOTA_HABILIDAD_MIN;
  const indice = PASOS_REPORTE.findIndex((paso) => paso.valor === props.valor);
  return (
    <div className={`report-focus-skill${indice < 0 ? ' is-untouched' : ''}`}>
      <div className="report-focus-skill__head">
        <strong>{habilidad.nombre}</strong>
        <span className={habilidad.foco ? 'report-focus-tag is-foco' : 'report-focus-tag'}>
          {habilidad.foco ? `Foco de ${props.nivel === 'INICIACION' ? 'Iniciación' : props.nivel}` : 'Base'}
        </span>
      </div>
      {habilidad.foco ? (
        <span className="report-focus-hint">
          <b>A veces:</b> {habilidad.aVeces} · <b>Lo consigue:</b> {habilidad.loConsigue}
        </span>
      ) : (
        habilidad.ayuda && <span className="report-focus-hint">{habilidad.ayuda}</span>
      )}
      <div className="report-focus-steps" data-v={indice} role="group" aria-label={habilidad.nombre}>
        {PASOS_REPORTE.map((paso) => (
          <button
            key={paso.valor}
            type="button"
            aria-pressed={props.valor === paso.valor}
            onClick={() => props.onChange(paso.valor)}
          >
            {paso.etiqueta}
          </button>
        ))}
      </div>
      {indice >= 0 && (
        <div className="report-focus-note">
          <label>
            <span>
              ¿Qué has visto en {habilidad.nombre.toLowerCase()}? <span className="report-focus-req">*</span>
            </span>
            <textarea
              value={props.nota}
              maxLength={NOTA_HABILIDAD_MAX}
              readOnly={dictando}
              rows={2}
              placeholder="Con tus palabras: qué hace bien, qué le falta, en qué momento…"
              onChange={(e) => props.onNota(e.target.value)}
            />
          </label>
          <DictationButton value={props.nota} maxLength={NOTA_HABILIDAD_MAX} onListeningChange={setDictando} onChange={props.onNota} />
          <span className={notaCorta ? 'report-focus-hint is-pending' : 'report-focus-hint'}>
            {props.nota.trim().length}/{NOTA_HABILIDAD_MAX}
            {notaCorta ? ` · Obligatoria (mínimo ${NOTA_HABILIDAD_MIN} caracteres)` : ''}
          </span>
        </div>
      )}
      {indice >= 0 && (
        <button type="button" className="report-focus-clear" onClick={() => props.onChange(null)}>
          No lo he visto hoy
        </button>
      )}
    </div>
  );
}

const nombreNivel = (nivel: string) => (nivel === 'INICIACION' ? 'Iniciación' : nivel);

export function AdaptiveReportFields(props: {
  modalidad: string;
  nivel: string;
  nivelPartida: string;
  trabajoDiario?: string | null;
  actitud: string;
  actitudDestacar: string[];
  evaluacion: EvaluacionTecnicaReporte;
  notas: Record<string, string>;
  onNota: (id: string, texto: string) => void;
  referenciaNivel: Array<[string, string]>;
  onNivel: (nivel: string) => void;
  onActitud: (valor: string) => void;
  onActitudDestacar: (valores: string[]) => void;
  onEvaluacion: (valor: EvaluacionTecnicaReporte) => void;
}) {
  const nivel = reportTechnicalLevelForRender(props.nivel);
  const partida = reportTechnicalLevelForRender(props.nivelPartida);
  const vecinos = nivelesVecinos(partida || '');
  const trabajo = resumenTrabajoDiario(props.trabajoDiario);

  const botonesNivel: Array<{ nivel: string; texto: string; tipo: string }> = [];
  if (partida) {
    if (vecinos.anterior) botonesNivel.push({ nivel: vecinos.anterior, texto: `Por debajo de ${nombreNivel(partida)}`, tipo: 'down' });
    botonesNivel.push({ nivel: partida, texto: `Está en ${nombreNivel(partida)}`, tipo: 'ok' });
    if (vecinos.siguiente) botonesNivel.push({ nivel: vecinos.siguiente, texto: `Listo para ${nombreNivel(vecinos.siguiente)}`, tipo: 'up' });
  }
  const nivelEnBotones = botonesNivel.some((b) => b.nivel === nivel);

  const habilidades = nivel ? habilidadesDelNivel(nivel) : [];
  const deHoy = new Set(nivel ? habilidadesDelTrabajoDeHoy(nivel, props.trabajoDiario) : []);
  // Sin botón de «otra habilidad»: siempre salen los focos del nivel y, además,
  // las habilidades base que se han trabajado hoy (o que ya estaban valoradas).
  const visibles = habilidades.filter(
    (h) => h.foco || deHoy.has(h.id) || Boolean(props.evaluacion[h.id])
  );

  const cambiarHabilidad = (id: string, valor: ValorTecnicoReporte | null) => {
    const siguiente: EvaluacionTecnicaReporte = { ...props.evaluacion };
    if (valor) siguiente[id] = valor;
    else delete siguiente[id];
    props.onEvaluacion(siguiente);
  };

  const fila = (h: HabilidadNivel) => (
    <FilaHabilidad
      key={h.id}
      habilidad={h}
      nivel={nivel || ''}
      valor={props.evaluacion[h.id]}
      onChange={(valor) => cambiarHabilidad(h.id, valor)}
      nota={props.notas[h.id] || ''}
      onNota={(texto) => props.onNota(h.id, texto)}
    />
  );

  return (
    <section className="adaptive-report report-focus">
      <div className="report-focus-block">
        <span className="report-focus-label">
          {partida ? `¿Cómo le ves respecto a ${nombreNivel(partida)}?` : '¿En qué nivel le has visto hoy?'}
          <span className="report-focus-req"> *</span>
        </span>
        {botonesNivel.length > 0 && (
          <div className="report-focus-seg report-focus-seg--level" role="group" aria-label="Nivel visto hoy">
            {botonesNivel.map((b) => (
              <button
                key={b.nivel}
                type="button"
                data-tipo={b.tipo}
                aria-pressed={nivel === b.nivel}
                className={nivel === b.nivel ? 'is-on' : undefined}
                onClick={() => props.onNivel(b.nivel)}
              >
                {b.texto}
              </button>
            ))}
          </div>
        )}
        <label className="report-focus-other-level">
          <span>{partida ? 'Otro nivel (solo si es muy distinto)' : 'Nivel'}</span>
          <select
            value={nivel && (!partida || !nivelEnBotones) ? nivel : ''}
            onChange={(e) => e.target.value && props.onNivel(e.target.value)}
          >
            <option value="">{partida ? '—' : 'Selecciona el nivel'}</option>
            {TECHNICAL_LEVELS.map((n) => (
              <option key={n} value={n}>
                {nombreNivel(n)}
              </option>
            ))}
          </select>
        </label>
        {nivel && partida && nivel !== partida && (
          <div className="report-focus-warn" role="status">
            <b>Has marcado {nombreNivel(nivel)}. Compruébalo con su referencia:</b>
            {props.referenciaNivel.map(([titulo, texto]) => (
              <span key={titulo}>
                <b>{titulo}:</b> {texto}
              </span>
            ))}
            <span className="report-focus-hint">
              Al guardar, {nombreNivel(nivel)} queda como nivel del alumno (como hasta ahora) y coordinación lo verá como «Revisar nivel».
            </span>
          </div>
        )}
      </div>

      <div className="report-focus-block">
        <span className="report-focus-label">
          Técnica de hoy<span className="report-focus-req"> *</span>
        </span>
        {!nivel ? (
          <span className="report-focus-hint">Elige primero el nivel para ver sus habilidades.</span>
        ) : (
          <>
            <div className="adaptive-report-work">
              <span>Trabajo de hoy</span>
              {trabajo.length ? <p>{trabajo.join(' · ')}</p> : <p>Sin trabajo diario definido: salen los focos del nivel.</p>}
            </div>
            <span className="report-focus-hint">Salen los focos del nivel y lo trabajado hoy. Valora lo que hayas visto y escribe o dicta una nota en cada una; si no has podido verla, déjala sin tocar.</span>
            <div className="report-focus-skills">{visibles.map(fila)}</div>
          </>
        )}
      </div>

      <BotonesOpcion
        label="Actitud"
        obligatorio
        opciones={ACTITUD_GENERAL}
        valor={props.actitud}
        onChange={props.onActitud}
      />
      <BotonesVarios
        label="¿Algo a destacar? (opcional, puedes marcar varias)"
        opciones={opcionesActitudDestacar(props.modalidad)}
        valores={props.actitudDestacar}
        onChange={props.onActitudDestacar}
      />
    </section>
  );
}

export function IncidenciaReporteFields(props: {
  modalidad: string;
  incidencia: string;
  onIncidencia: (valor: string) => void;
}) {
  const sinIncidencia = props.incidencia === 'Sin incidencia';
  const tipos = opcionesIncidenciaAdaptada(props.modalidad).filter((o) => o !== 'Sin incidencia');
  return (
    <div className="report-focus-block">
      <span className="report-focus-label">¿Ha pasado algo hoy?</span>
      <div className="report-focus-seg" role="group" aria-label="¿Ha pasado algo hoy?">
        <button
          type="button"
          aria-pressed={sinIncidencia}
          className={sinIncidencia ? 'is-on' : undefined}
          onClick={() => props.onIncidencia('Sin incidencia')}
        >
          No
        </button>
        <button
          type="button"
          aria-pressed={!sinIncidencia}
          className={!sinIncidencia ? 'is-on' : undefined}
          onClick={() => {
            if (sinIncidencia) props.onIncidencia('');
          }}
        >
          Sí
        </button>
      </div>
      {!sinIncidencia && (
        <>
          <BotonesOpcion label="¿Qué ha pasado?" obligatorio opciones={tipos} valor={props.incidencia} onChange={props.onIncidencia} />
          <span className="report-focus-hint">Queda registrado para coordinación.</span>
        </>
      )}
    </div>
  );
}
