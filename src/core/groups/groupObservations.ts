/**
 * Observaciones importantes del grupo · lectura para entrenadores.
 *
 * El texto guardado tiene una línea por niño con datos del último reporte
 * separados por «·», sin etiquetas:
 *   «LOLA VACCHI CEDILLO: Percha y silla · Autónomo en pista grande · Cansado ·
 *    Paralelo elemental · Trabajar paralelo»
 * Aquí se estructura: cada dato con su etiqueta (Remontes, Autonomía, Último
 * día, Técnica, Siguiente paso), lo que comparten todos los niños se saca a
 * «Todo el grupo» y las líneas sin nombre quedan como notas. No cambia lo que
 * se guarda: solo cómo se lee.
 */

export type DatoObservacion = { etiqueta: string; valor: string };
export type AlumnoObservacion = {
  nombre: string;
  datos: DatoObservacion[];
  /** El último reporte no dejó nada que contar («Nada relevante» o sin datos). */
  sinNovedades: boolean;
};
export type ObservacionesGrupo = {
  comunes: DatoObservacion[];
  /** true si lo común lo comparten TODOS los niños (si no, solo los que tienen datos). */
  comunesTodos: boolean;
  alumnos: AlumnoObservacion[];
  notas: string[];
};

const ORDEN_ETIQUETAS = [
  'Aviso',
  'Remontes',
  'Autonomía',
  'Último día',
  'Técnica',
  'Siguiente paso',
  'Nota',
];

const CABECERAS_RUIDO = [
  /OBSERVACIONES\s+AUTOM[ÁA]TICAS\s+PARA\s+(EL\s+)?ENTRENADOR/gi,
  /OBSERVACIONES\s+(DE\s+)?JOS[ÉE]/gi,
];

const RUIDO_DATO =
  /^(alumno nuevo|alumno conocido|ficha pendiente|ok|nivel estimado|nivel real de ficha|pendiente completar|completa|nada relevante)\.?$/i;

function sinAcentos(texto: string) {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** Decide qué es cada trozo por su contenido (el orden no es fiable: faltan datos). */
export function etiquetaDatoObservacion(valor: string): string {
  const t = sinAcentos(valor);
  if (/^(nuevo|nivel .* declarad|validar|sin historial|llanto|caida|golpe|lesion|incidencia|mareo|frio)/.test(t)) return 'Aviso';
  if (/^(trabajar|progresar|consolidar|revisar|mantener|subir|bajar|repetir|seguir|pasar|reforzar|mejorar|afianzar|introducir|empezar|iniciar)\b/.test(t)) {
    return 'Siguiente paso';
  }
  if (/\b(cinta|percha|silla|telesilla|remontes?)\b/.test(t)) return 'Remontes';
  if (/autonom|\bayuda\b|acompanad|\bsolo\b|\bsola\b|necesita|asistid|guiad|de la mano|dependiente/.test(t)) {
    return 'Autonomía';
  }
  if (/cuna|paralel|fundamental|viraje|giro|deslizamiento|equilibrio|frenad|derrape|cuna|tecnic|postura|trazad/.test(t)) {
    return 'Técnica';
  }
  if (/cansad|buena|bueno|correct|regular|mala|malo|motivad|distraid|dispers|no escucha|escucha|content|nervios|miedo|actitud|ganas|animad|apatic|excelente|feliz|triste|lloro|llora|enfadad|tranquil|inquiet/.test(t)) {
    return 'Último día';
  }
  return 'Nota';
}

function limpiarTexto(texto: string) {
  let limpio = String(texto || '');
  CABECERAS_RUIDO.forEach((patron) => {
    limpio = limpio.replace(patron, '');
  });
  return limpio.replace(/[•]/g, '\n');
}

function pareceNombre(parte: string) {
  const nombre = parte.trim();
  if (nombre.length < 3 || nombre.length > 90) return false;
  if (/[·]/.test(nombre)) return false;
  // Nombres de niño: letras, espacios, guiones, apóstrofos y etiquetas tipo [TEST].
  return /^[\p{L}\s'’.\-[\]]+$/u.test(nombre) && /\p{L}{2,}/u.test(nombre);
}

export function estructurarObservacionesGrupo(
  texto: string | null | undefined
): ObservacionesGrupo {
  const alumnos: AlumnoObservacion[] = [];
  const notas: string[] = [];

  limpiarTexto(texto || '')
    .split('\n')
    .map((linea) => linea.replace(/\s+/g, ' ').replace(/^[-–]+\s*/, '').trim())
    .filter(Boolean)
    .forEach((linea) => {
      const separador = linea.indexOf(':');
      const nombre = separador > 0 ? linea.slice(0, separador) : '';
      if (!nombre || !pareceNombre(nombre)) {
        if (!RUIDO_DATO.test(linea) && !notas.includes(linea)) notas.push(linea);
        return;
      }
      const datos = linea
        .slice(separador + 1)
        .split(/\s*·\s*/)
        .map((parte) => parte.replace(/[.;,\s]+$/, '').trim())
        .filter((parte) => parte && !RUIDO_DATO.test(parte))
        .map((valor) => ({ etiqueta: etiquetaDatoObservacion(valor), valor }));
      const nombreLimpio = nombre.replace(/\s+/g, ' ').trim();
      if (alumnos.some((alumno) => alumno.nombre === nombreLimpio)) return;
      alumnos.push({ nombre: nombreLimpio, datos, sinNovedades: datos.length === 0 });
    });

  // Lo que tienen igual todos los niños con datos (2 o más) se dice una sola vez.
  const comunes: DatoObservacion[] = [];
  const conDatos = alumnos.filter((alumno) => !alumno.sinNovedades);
  if (conDatos.length >= 2) {
    const primero = conDatos[0].datos;
    primero.forEach((dato) => {
      const clave = `${dato.etiqueta}|${sinAcentos(dato.valor)}`;
      const todos = conDatos.every((alumno) =>
        alumno.datos.some((otro) => `${otro.etiqueta}|${sinAcentos(otro.valor)}` === clave)
      );
      if (todos && !comunes.some((c) => `${c.etiqueta}|${sinAcentos(c.valor)}` === clave)) {
        comunes.push(dato);
      }
    });
    if (comunes.length > 0) {
      const claves = new Set(comunes.map((c) => `${c.etiqueta}|${sinAcentos(c.valor)}`));
      conDatos.forEach((alumno) => {
        alumno.datos = alumno.datos.filter(
          (dato) => !claves.has(`${dato.etiqueta}|${sinAcentos(dato.valor)}`)
        );
      });
    }
  }

  const ordenar = (lista: DatoObservacion[]) =>
    lista
      .slice()
      .sort(
        (a, b) => ORDEN_ETIQUETAS.indexOf(a.etiqueta) - ORDEN_ETIQUETAS.indexOf(b.etiqueta)
      );

  return {
    comunes: ordenar(comunes),
    comunesTodos: comunes.length > 0 && conDatos.length === alumnos.length,
    alumnos: alumnos.map((alumno) => ({ ...alumno, datos: ordenar(alumno.datos) })),
    notas,
  };
}

/** «Remontes: Percha y silla · Técnica: Paralelo elemental» (las notas sin etiqueta). */
export function textoDatosObservacion(datos: DatoObservacion[]) {
  return datos
    .map((dato) => (dato.etiqueta === 'Nota' ? dato.valor : `${dato.etiqueta}: ${dato.valor}`))
    .join(' · ');
}
