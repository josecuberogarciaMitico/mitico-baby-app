import { useEffect, useRef, useState } from 'react';
import type React from 'react';
import type { RecomendacionGrupoIntensivoDiaApp } from './intensiveTypes';
import {
  DESTINO_SIN_COLOCAR_INTENSIVO,
  diferenciasPropuestaIntensivo,
  moverAlumnoPropuestaIntensivo,
  pendientesColocarPropuestaIntensivo,
  sincronizarPropuestaIntensivo,
} from './intensiveProposalSync';

type Recomendacion = RecomendacionGrupoIntensivoDiaApp;
type Dia = { intensivo_dia_id: string; intensivo_id: string; numero_dia: number; fecha: string };

/**
 * «Pendientes de colocar» de la propuesta de grupos de un intensivo.
 *
 * - Mantiene la propuesta al día con los inscritos: añade a los nuevos como
 *   pendientes y quita a quien ya no está (automático y sin tocar lo ya colocado).
 * - Lista a los que no están en ningún grupo (nuevos o «Dejar fuera de momento»)
 *   con un selector para colocarlos. En la plantilla de 4 días se coloca en los 4.
 */
export function IntensivePendingPlacementPanel(props: {
  diaVisible: Dia;
  /** Días a los que se aplican los cambios (los 4 en la plantilla, o solo este). */
  diasAplicar: Dia[];
  inscritosIds: string[];
  propuesta: Recomendacion[];
  destinos: Record<string, string>;
  nombresGrupos: string[];
  cargando: boolean;
  setPropuesta: (valor: Recomendacion[]) => void;
  setDestinos: (valor: Record<string, string>) => void;
  cargarFilasRecomendador: (diaId: string) => Promise<Recomendacion[]>;
  setError: (mensaje: string) => void;
  estilos: {
    caja: React.CSSProperties;
    linea: React.CSSProperties;
    label: React.CSSProperties;
    select: React.CSSProperties;
    boton: React.CSSProperties;
  };
}) {
  const {
    diaVisible,
    diasAplicar,
    inscritosIds,
    propuesta,
    destinos,
    nombresGrupos,
    cargando,
  } = props;

  const propuestaDia = propuesta.filter(
    (registro) => registro.intensivo_dia_id === diaVisible.intensivo_dia_id
  );
  const { nuevosIds, sobrantes } = diferenciasPropuestaIntensivo(propuestaDia, inscritosIds);
  const pendientes = pendientesColocarPropuestaIntensivo(propuestaDia, destinos);

  // Si los inscritos aún no han cargado (lista vacía) o desaparecerían todos,
  // no tocamos nada: es más probable un fallo de carga que una baja masiva.
  const datosFiables =
    inscritosIds.length > 0 && sobrantes.length < propuestaDia.length;
  const firma = `${diaVisible.intensivo_dia_id}|${nuevosIds.join(',')}|${sobrantes
    .map((registro) => registro.alumno_id)
    .join(',')}`;
  const hayCambios = nuevosIds.length > 0 || sobrantes.length > 0;

  const [sincronizando, setSincronizando] = useState(false);
  const [aviso, setAviso] = useState('');
  const firmaIntentada = useRef('');

  async function sincronizar() {
    if (!datosFiables || sincronizando) return;
    setSincronizando(true);
    try {
      const filasBase = nuevosIds.length
        ? (await props.cargarFilasRecomendador(diaVisible.intensivo_dia_id)).filter(
            (fila) => nuevosIds.includes(fila.alumno_id)
          )
        : [];
      const resultado = sincronizarPropuestaIntensivo({
        propuesta,
        destinos,
        dias: diasAplicar,
        inscritosIds,
        filasBase,
      });
      props.setPropuesta(resultado.propuesta);
      props.setDestinos(resultado.destinos);
      const partes = [
        resultado.anadidas > 0 ? `${resultado.anadidas} nuevo(s) añadido(s) a pendientes` : '',
        sobrantes.length > 0
          ? `quitado(s) de la propuesta: ${sobrantes.map((registro) => registro.alumno).join(', ')} (ya no está(n) en el intensivo)`
          : '',
      ].filter(Boolean);
      setAviso(partes.length ? `Propuesta actualizada: ${partes.join(' · ')}.` : '');
    } catch (err) {
      props.setError(
        err instanceof Error
          ? `No se pudo actualizar la propuesta con los nuevos inscritos: ${err.message}`
          : 'No se pudo actualizar la propuesta con los nuevos inscritos.'
      );
    } finally {
      setSincronizando(false);
    }
  }

  // Automático una vez por cada cambio detectado (no en bucle si falla).
  useEffect(() => {
    if (!hayCambios || !datosFiables || cargando) return;
    if (firmaIntentada.current === firma) return;
    firmaIntentada.current = firma;
    void sincronizar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firma, hayCambios, datosFiables, cargando]);

  if (!hayCambios && pendientes.length === 0 && !aviso) return null;

  const diasIds = diasAplicar.map((dia) => dia.intensivo_dia_id);

  return (
    <section style={{ ...props.estilos.caja, marginTop: 12 }}>
      <h4 style={{ margin: '0 0 6px' }}>
        Pendientes de colocar · {pendientes.length}
      </h4>
      <p style={{ margin: '0 0 10px', color: '#64748b', fontSize: 13 }}>
        Niños del intensivo que todavía no están en ningún grupo de la propuesta.
        {diasAplicar.length > 1
          ? ' Al colocarlos aquí se colocan igual en los 4 días.'
          : ''}
      </p>

      {aviso && (
        <p style={{ margin: '0 0 10px', fontWeight: 800, color: '#166534' }}>{aviso}</p>
      )}

      {hayCambios && (!datosFiables || firmaIntentada.current === firma) && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontWeight: 800, color: '#92400e' }}>
            La propuesta no coincide con los inscritos
            {nuevosIds.length ? ` · ${nuevosIds.length} sin añadir` : ''}
            {sobrantes.length ? ` · ${sobrantes.length} ya no inscrito(s)` : ''}
          </span>
          <button
            type="button"
            disabled={sincronizando || cargando || !datosFiables}
            onClick={() => void sincronizar()}
            style={{ ...props.estilos.boton, width: 'auto', flex: '0 0 auto' }}
          >
            {sincronizando ? 'Actualizando…' : 'Actualizar propuesta'}
          </button>
        </div>
      )}

      {pendientes.length === 0 && !hayCambios && (
        <p style={{ margin: 0, color: '#166534', fontWeight: 800 }}>
          Todos los niños inscritos están colocados.
        </p>
      )}

      <div style={{ display: 'grid', gap: 8 }}>
        {pendientes.map((alumno) => (
          <div
            key={`pend-${alumno.intensivo_dia_id}-${alumno.alumno_id}`}
            // En pantallas estrechas el nombre y el selector van uno debajo del otro.
            style={{ ...props.estilos.linea, flexWrap: 'wrap', alignItems: 'center', color: '#172033' }}
          >
            <div style={{ minWidth: 0, flex: '1 1 220px' }}>
              <strong style={{ overflowWrap: 'anywhere' }}>{alumno.alumno}</strong>
              <p style={{ margin: '4px 0 0' }}>
                {alumno.nivel_resumen || 'SIN NIVEL'} · {alumno.pista_recomendada || '-'}
                {alumno.edad ? ` · ${alumno.edad} años` : ''}
              </p>
            </div>
            <label style={{ ...props.estilos.label, minWidth: 0, flex: '1 1 260px', maxWidth: '100%' }}>
              Colocar en
              <select
                value=""
                disabled={cargando || nombresGrupos.length === 0}
                onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                  if (!e.target.value) return;
                  props.setDestinos(
                    moverAlumnoPropuestaIntensivo(destinos, diasIds, alumno.alumno_id, e.target.value)
                  );
                }}
                style={{ ...props.estilos.select, width: '100%', minWidth: 0, maxWidth: '100%', boxSizing: 'border-box' }}
              >
                <option value="">Elegir grupo…</option>
                {nombresGrupos
                  .filter((nombre) => nombre !== DESTINO_SIN_COLOCAR_INTENSIVO)
                  .map((nombre) => (
                    <option key={`pend-${alumno.alumno_id}-${nombre}`} value={nombre}>
                      {nombre}
                    </option>
                  ))}
              </select>
            </label>
          </div>
        ))}
      </div>
    </section>
  );
}
