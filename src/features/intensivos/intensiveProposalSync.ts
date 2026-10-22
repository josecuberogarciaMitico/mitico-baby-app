import type { RecomendacionGrupoIntensivoDiaApp } from './intensiveTypes';

/**
 * Propuesta de grupos de Intensivos (Recomendador inicial / edición de día).
 *
 * La propuesta vive solo en pantalla. Si después de generarla se apuntan
 * alumnos nuevos al intensivo, o se borra alguno, la propuesta queda
 * desfasada. Estas funciones puras la ponen al día sin tocar la colocación
 * que ya haya hecho coordinación:
 *  - quitan a quien ya no está inscrito;
 *  - añaden a los nuevos como «pendientes de colocar» (sin grupo).
 *
 * «Pendiente de colocar» reutiliza el destino especial que ya existía para
 * «Dejar fuera de momento», así todo lo que no está en un grupo se ve en el
 * mismo sitio.
 */
export const DESTINO_SIN_COLOCAR_INTENSIVO = '__NO_CREAR__';

type Recomendacion = RecomendacionGrupoIntensivoDiaApp;

export function claveAlumnoPropuestaIntensivo(diaId: string, alumnoId: string) {
  return `${diaId}__alumno__${alumnoId}`;
}

export function destinoAlumnoPropuestaIntensivo(
  destinos: Record<string, string>,
  registro: Recomendacion
) {
  return (
    destinos[claveAlumnoPropuestaIntensivo(registro.intensivo_dia_id, registro.alumno_id)] ||
    registro.grupo_recomendado
  );
}

/** Diferencias entre la propuesta de un día y los alumnos inscritos. */
export function diferenciasPropuestaIntensivo(
  propuestaDia: Recomendacion[],
  inscritosIds: string[]
) {
  const enPropuesta = new Set(propuestaDia.map((registro) => registro.alumno_id));
  const inscritos = new Set(inscritosIds);
  return {
    nuevosIds: inscritosIds.filter((id) => !enPropuesta.has(id)),
    sobrantes: propuestaDia.filter((registro) => !inscritos.has(registro.alumno_id)),
  };
}

/**
 * Pone al día la propuesta de los días indicados.
 * `filasBase` son filas del recomendador (Supabase) para los alumnos nuevos;
 * se copian a cada día con sus datos de fecha.
 */
export function sincronizarPropuestaIntensivo(input: {
  propuesta: Recomendacion[];
  destinos: Record<string, string>;
  dias: Array<{ intensivo_dia_id: string; intensivo_id: string; numero_dia: number; fecha: string }>;
  inscritosIds: string[];
  filasBase: Recomendacion[];
}) {
  const idsDias = new Set(input.dias.map((dia) => dia.intensivo_dia_id));
  const inscritos = new Set(input.inscritosIds);

  const conservadas = input.propuesta.filter(
    (registro) =>
      !idsDias.has(registro.intensivo_dia_id) || inscritos.has(registro.alumno_id)
  );
  const quitadas = input.propuesta.length - conservadas.length;

  const destinos = { ...input.destinos };
  const anadidas: Recomendacion[] = [];

  input.dias.forEach((dia) => {
    const presentes = new Set(
      conservadas
        .filter((registro) => registro.intensivo_dia_id === dia.intensivo_dia_id)
        .map((registro) => registro.alumno_id)
    );

    input.filasBase.forEach((fila) => {
      if (!inscritos.has(fila.alumno_id) || presentes.has(fila.alumno_id)) return;
      presentes.add(fila.alumno_id);
      anadidas.push({
        ...fila,
        // Sin grupo propio: el nombre que traiga el recomendador no existe en
        // esta propuesta y aparecería como opción fantasma en los selectores.
        grupo_recomendado: DESTINO_SIN_COLOCAR_INTENSIVO,
        intensivo_dia_id: dia.intensivo_dia_id,
        intensivo_id: dia.intensivo_id,
        numero_dia: dia.numero_dia,
        fecha: dia.fecha,
      });
      destinos[claveAlumnoPropuestaIntensivo(dia.intensivo_dia_id, fila.alumno_id)] =
        DESTINO_SIN_COLOCAR_INTENSIVO;
    });
  });

  return {
    propuesta: [...conservadas, ...anadidas],
    destinos,
    quitadas,
    anadidas: new Set(anadidas.map((registro) => registro.alumno_id)).size,
  };
}

/** Coloca (o saca) a un alumno en el mismo grupo en todos los días indicados. */
export function moverAlumnoPropuestaIntensivo(
  destinos: Record<string, string>,
  diasIds: string[],
  alumnoId: string,
  destino: string
) {
  const copia = { ...destinos };
  diasIds.forEach((diaId) => {
    copia[claveAlumnoPropuestaIntensivo(diaId, alumnoId)] = destino;
  });
  return copia;
}

/** Alumnos de la propuesta de un día que no están en ningún grupo. */
export function pendientesColocarPropuestaIntensivo(
  propuestaDia: Recomendacion[],
  destinos: Record<string, string>
) {
  return propuestaDia
    .filter(
      (registro) =>
        destinoAlumnoPropuestaIntensivo(destinos, registro) ===
        DESTINO_SIN_COLOCAR_INTENSIVO
    )
    .sort((a, b) => a.alumno.localeCompare(b.alumno, 'es'));
}
