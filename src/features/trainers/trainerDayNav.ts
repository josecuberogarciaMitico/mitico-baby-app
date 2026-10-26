/**
 * Vista entrenador · navegación por días.
 *
 * Sustituye los desplegables anidados semana → día → turno por una fila de
 * botones: un botón por cada día de la semana de trabajo y un botón
 * «Semana anterior» por cada semana pasada que aún tenga grupos visibles
 * (la vista solo trae semanas anteriores cuando quedan tareas sin cerrar).
 */

export type ChipDiaEntrenador<G> = {
  clave: string;
  titulo: string;
  detalle: string;
  grupos: G[];
  pendientes: number;
  esAnterior: boolean;
};

type GrupoConFecha = { fecha: string };

export function claveChipDiaEntrenador(
  semanaInicio: string,
  semanaVigente: string,
  fecha: string
) {
  return semanaInicio === semanaVigente ? `dia:${fecha}` : `semana:${semanaInicio}`;
}

export function tituloDiaCortoEntrenador(fecha: string) {
  const fechaDia = new Date(`${fecha}T00:00:00`);
  const dia = fechaDia
    .toLocaleDateString('es-ES', { weekday: 'short' })
    .replace('.', '');
  return `${dia.charAt(0).toUpperCase()}${dia.slice(1)} ${fechaDia.getDate()}`;
}

function plural(cantidad: number, singular: string, varios: string) {
  return `${cantidad} ${cantidad === 1 ? singular : varios}`;
}

export function chipsDiasEntrenador<G extends GrupoConFecha>(
  semanas: Array<{ inicio: string; grupos: G[] }>,
  semanaVigente: string,
  tienePendientes: (grupo: G) => boolean
): ChipDiaEntrenador<G>[] {
  const anteriores: ChipDiaEntrenador<G>[] = [];
  const actuales: ChipDiaEntrenador<G>[] = [];
  const semanasAnteriores = semanas.filter((semana) => semana.inicio !== semanaVigente);

  semanas.forEach((semana) => {
    if (semana.grupos.length === 0) return;

    if (semana.inicio !== semanaVigente) {
      const pendientes = semana.grupos.filter(tienePendientes).length;
      anteriores.push({
        clave: claveChipDiaEntrenador(semana.inicio, semanaVigente, ''),
        titulo:
          semanasAnteriores.length > 1
            ? `Semana ${semana.inicio.slice(8, 10)}/${semana.inicio.slice(5, 7)}`
            : 'Semana anterior',
        detalle: plural(pendientes, 'pendiente', 'pendientes'),
        grupos: semana.grupos,
        pendientes,
        esAnterior: true,
      });
      return;
    }

    const porDia = new Map<string, G[]>();
    semana.grupos.forEach((grupo) => {
      if (!porDia.has(grupo.fecha)) porDia.set(grupo.fecha, []);
      porDia.get(grupo.fecha)!.push(grupo);
    });

    Array.from(porDia.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([fecha, grupos]) => {
        actuales.push({
          clave: claveChipDiaEntrenador(semana.inicio, semanaVigente, fecha),
          titulo: tituloDiaCortoEntrenador(fecha),
          detalle: plural(grupos.length, 'grupo', 'grupos'),
          grupos,
          pendientes: grupos.filter(tienePendientes).length,
          esAnterior: false,
        });
      });
  });

  anteriores.sort((a, b) => a.clave.localeCompare(b.clave));
  return [...anteriores, ...actuales];
}

/** Hoy → primer día con pendientes → primer día de la semana → lo que haya. */
export function chipPorDefectoEntrenador<G>(
  chips: ChipDiaEntrenador<G>[],
  hoy: string
) {
  const actuales = chips.filter((chip) => !chip.esAnterior);
  return (
    actuales.find((chip) => chip.clave === `dia:${hoy}`)?.clave ||
    actuales.find((chip) => chip.pendientes > 0)?.clave ||
    actuales[0]?.clave ||
    chips[0]?.clave ||
    ''
  );
}

/** Edad del niño para la vista entrenador: «4 años», «1 año» o null si no hay dato válido. */
export function textoEdadNino(edad: number | null | undefined): string | null {
  if (typeof edad !== 'number' || !Number.isFinite(edad) || edad < 0 || edad > 25) return null;
  const anios = Math.floor(edad);
  return `${anios} ${anios === 1 ? 'año' : 'años'}`;
}
