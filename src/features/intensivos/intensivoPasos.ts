// Intensivos (29/10): estado de cada día y «Siguiente paso», lógica pura.
// La pantalla enseña una franja con los días del intensivo y un único botón
// con lo que toca hacer ahora, para no tener que adivinar en qué pestaña está.

export type DiaIntensivoPaso = {
  intensivo_dia_id: string;
  numero_dia: number;
  fecha: string;
};

export type GrupoDiaPaso = {
  publicado: boolean | null;
};

export type EstadoDiaIntensivo = {
  diaId: string;
  numero: number;
  fecha: string;
  grupos: number;
  publicados: number;
  pasado: boolean;
  estado: 'sin_grupos' | 'borrador' | 'publicado' | 'hecho';
  texto: string;
};

export type SiguientePasoIntensivo =
  | { tipo: 'configurar'; texto: string; boton: string }
  | { tipo: 'alumnos'; texto: string; boton: string }
  | { tipo: 'crear_grupos'; texto: string; boton: string; diaId: string }
  | { tipo: 'abrir_dia'; texto: string; boton: string; diaId: string }
  | { tipo: 'recuperaciones'; texto: string; boton: string }
  | { tipo: 'evaluacion'; texto: string; boton: string }
  | { tipo: 'al_dia'; texto: string; boton: null };

export function hoyMadridIso(ahora = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Madrid',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(ahora);
}

function fechaCorta(fecha: string) {
  const [, m, d] = String(fecha || '').slice(0, 10).split('-');
  return d && m ? `${Number(d)}/${Number(m)}` : fecha;
}

export function estadosDiasIntensivo(
  dias: DiaIntensivoPaso[],
  gruposDelDia: (diaId: string) => GrupoDiaPaso[],
  hoy = hoyMadridIso()
): EstadoDiaIntensivo[] {
  return dias
    .slice()
    .sort((a, b) => a.numero_dia - b.numero_dia || a.fecha.localeCompare(b.fecha))
    .map((dia) => {
      const grupos = gruposDelDia(dia.intensivo_dia_id);
      const publicados = grupos.filter((g) => g.publicado).length;
      const pasado = String(dia.fecha).slice(0, 10) < hoy;
      const estado: EstadoDiaIntensivo['estado'] = pasado
        ? 'hecho'
        : grupos.length === 0
          ? 'sin_grupos'
          : publicados === grupos.length
            ? 'publicado'
            : 'borrador';
      const texto =
        estado === 'hecho'
          ? 'Hecho'
          : estado === 'sin_grupos'
            ? 'Sin grupos'
            : estado === 'publicado'
              ? `${grupos.length} grupos · publicado`
              : `${grupos.length} grupos · sin publicar`;
      return {
        diaId: dia.intensivo_dia_id,
        numero: dia.numero_dia,
        fecha: dia.fecha,
        grupos: grupos.length,
        publicados,
        pasado,
        estado,
        texto,
      };
    });
}

export function siguientePasoIntensivo(input: {
  estados: EstadoDiaIntensivo[];
  alumnos: number;
  recuperacionesPendientes: number;
  evaluacionesPendientes: number;
  hayPropuestaSinConfirmar?: boolean;
}): SiguientePasoIntensivo {
  const { estados, alumnos } = input;
  if (estados.length < 4) {
    return {
      tipo: 'configurar',
      texto: `Faltan fechas: hay ${estados.length} de 4 días creados.`,
      boton: 'Crear las fechas',
    };
  }
  if (alumnos === 0) {
    return { tipo: 'alumnos', texto: 'Todavía no hay niños inscritos.', boton: 'Añadir alumnos' };
  }
  const futuros = estados.filter((e) => !e.pasado);
  if (estados.every((e) => e.grupos === 0)) {
    return {
      tipo: 'crear_grupos',
      texto: input.hayPropuestaSinConfirmar
        ? 'Tienes una propuesta de grupos sin confirmar.'
        : `Hay ${alumnos} niños inscritos y ningún grupo.`,
      boton: input.hayPropuestaSinConfirmar ? 'Revisar y confirmar grupos' : 'Crear grupos de los 4 días',
      diaId: estados[0].diaId,
    };
  }
  if (input.recuperacionesPendientes > 0) {
    const n = input.recuperacionesPendientes;
    return {
      tipo: 'recuperaciones',
      texto: `${n} falta${n === 1 ? '' : 's'} por recuperar antes del siguiente día.`,
      boton: 'Ver faltas y recuperaciones',
    };
  }
  const siguiente = futuros[0];
  if (siguiente && siguiente.estado === 'sin_grupos') {
    return {
      tipo: 'crear_grupos',
      texto: `El día ${siguiente.numero} (${fechaCorta(siguiente.fecha)}) no tiene grupos.`,
      boton: `Crear grupos del día ${siguiente.numero}`,
      diaId: siguiente.diaId,
    };
  }
  if (siguiente && siguiente.estado === 'borrador') {
    return {
      tipo: 'abrir_dia',
      texto: `Día ${siguiente.numero} (${fechaCorta(siguiente.fecha)}): falta entrenador, punto o publicar.`,
      boton: `Terminar el día ${siguiente.numero}`,
      diaId: siguiente.diaId,
    };
  }
  if (!siguiente && input.evaluacionesPendientes > 0) {
    const n = input.evaluacionesPendientes;
    return {
      tipo: 'evaluacion',
      texto: `Intensivo terminado: ${n} evaluación${n === 1 ? '' : 'es'} por revisar.`,
      boton: 'Revisar evaluaciones',
    };
  }
  return {
    tipo: 'al_dia',
    texto: siguiente
      ? `Todo al día. Próximo: día ${siguiente.numero} (${fechaCorta(siguiente.fecha)}), publicado.`
      : 'Intensivo terminado y al día.',
    boton: null,
  };
}
