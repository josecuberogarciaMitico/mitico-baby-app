import {
  parseTechnicalLevel,
  requireTechnicalLevel,
  TECHNICAL_LEVEL_ORDER,
  TECHNICAL_LEVELS,
  type TechnicalLevel,
} from '../core/levels/levelContract';
import {
  TECHNICAL_REPORT_SCALE,
  type EvaluacionTecnicaReporte,
  type ValorTecnicoReporte,
} from '../core/reports/reportTypes';

export type {
  EvaluacionTecnicaReporte,
  ValorTecnicoReporte,
} from '../core/reports/reportTypes';

export const ESCALA_TECNICA_REPORTE = TECHNICAL_REPORT_SCALE;

/**
 * El render del formulario debe ser tolerante: una etiqueta vacía, desconocida
 * o compuesta de grupo no puede derribar la pantalla del entrenador.
 */
export function reportTechnicalLevelForRender(
  value: unknown
): TechnicalLevel | null {
  const parsed = parseTechnicalLevel(value);
  return parsed.status === 'VALID' ? parsed.level : null;
}

/** El guardado sigue siendo estricto y solo acepta un nivel individual oficial. */
export function requireReportTechnicalLevel(value: unknown): TechnicalLevel {
  return requireTechnicalLevel(value, 'Reporte técnico');
}

export type TrainerReportOpening =
  | {
      status: 'READY';
      activeReport: {
        alumno_id: string;
        grupo_id: string;
        entrenador_id: string;
      };
      level: TechnicalLevel | null;
    }
  | {
      status: 'INVALID_IDENTIFIERS';
      missing: Array<'alumno_id' | 'grupo_id' | 'entrenador_id'>;
    };

/**
 * Prepara el estado visible antes de consultar el nivel de la sesión. El nivel
 * agregado del grupo es solo contexto y nunca sustituye al nivel individual.
 */
export function prepareTrainerReportOpening(input: {
  alumnoId: unknown;
  grupoId: unknown;
  entrenadorId: unknown;
  individualLevel: unknown;
}): TrainerReportOpening {
  const alumnoId = String(input.alumnoId || '').trim();
  const grupoId = String(input.grupoId || '').trim();
  const entrenadorId = String(input.entrenadorId || '').trim();
  const missing: Array<'alumno_id' | 'grupo_id' | 'entrenador_id'> = [];

  if (!alumnoId) missing.push('alumno_id');
  if (!grupoId) missing.push('grupo_id');
  if (!entrenadorId) missing.push('entrenador_id');
  if (missing.length) return { status: 'INVALID_IDENTIFIERS', missing };

  return {
    status: 'READY',
    activeReport: {
      alumno_id: alumnoId,
      grupo_id: grupoId,
      entrenador_id: entrenadorId,
    },
    level: reportTechnicalLevelForRender(input.individualLevel),
  };
}

export type CompetenciaTecnicaReporte = {
  id: string;
  nombre: string;
  ayuda: string;
};

const C = (id: string, nombre: string, ayuda: string): CompetenciaTecnicaReporte => ({ id, nombre, ayuda });

const COMPETENCIAS = {
  confianza: C('confianza_adaptacion', 'Confianza y adaptación', 'Se encuentra cómodo con el material, el entorno y la velocidad.'),
  equilibrio: C('equilibrio_deslizamiento', 'Equilibrio y deslizamiento', 'Mantiene el equilibrio mientras se desplaza con los esquís.'),
  posicionBasica: C('posicion_flexion_basica', 'Posición y flexión básica', 'Mantiene una postura flexible, sin ir rígido ni completamente erguido.'),
  cuna: C('cuna_frenada', 'Cuña y frenada', 'Abre la cuña y consigue frenar con control y seguridad.'),
  direccion: C('direccion_giro', 'Dirección y giro', 'Orienta los esquís y gira hacia ambos lados con intención.'),
  velocidad: C('control_velocidad', 'Control de velocidad', 'Regula la velocidad cerrando los giros, sin bajar recto.'),
  girosCuna: C('giros_cuna_encadenados', 'Giros en cuña encadenados', 'Enlaza giros a ambos lados manteniendo el control.'),
  flexionBasica: C('flexion_extension_basica', 'Flexión-extensión básica', 'Usa las piernas para acompañar el terreno y los giros.'),
  paralelismo: C('paralelismo', 'Paralelismo', 'Mantiene los esquís paralelos durante la parte exigida del giro.'),
  centralidad: C('equilibrio_centralidad', 'Equilibrio / centralidad', 'Va centrado sobre los esquís, sin quedarse atrás ni adelantarse.'),
  exterior: C('apoyo_exterior_presion', 'Apoyo exterior / presión', 'Carga el esquí exterior y se sostiene sobre él durante el giro.'),
  rotacion: C('rotacion_piernas', 'Rotación de piernas', 'Gira desde las piernas manteniendo el tronco estable.'),
  canteo: C('canteo', 'Canteo', 'Usa los cantos para agarrar y dirigir el giro con control.'),
  flexion: C('flexion_extension', 'Flexión-extensión', 'Coordina la flexión y extensión durante el giro y la transición.'),
  presion: C('flexion_extension_presion', 'Flexión-extensión / gestión de presión', 'Regula la presión, absorbe el terreno y enlaza los giros con las piernas.'),
  radio: C('radio_trayectoria', 'Radio / trayectoria', 'Controla el tamaño y la línea de la curva.'),
  transicion: C('transicion', 'Transición', 'Pasa de un giro a otro con fluidez, equilibrio y orden.'),
  ritmo: C('ritmo_coordinacion', 'Ritmo / coordinación', 'Mantiene continuidad y coordina los movimientos durante los giros.'),
  angulacion: C('angulacion_inclinacion', 'Angulación / inclinación', 'Coloca el cuerpo para sujetar el giro sin perder equilibrio.'),
  baston: C('uso_baston', 'Uso de bastón', 'Utiliza el bastón para preparar y coordinar el cambio de giro.'),
  conduccion: C('conduccion_presion', 'Conducción y presión', 'Deja correr el esquí sobre los cantos con apoyo estable y control.'),
  adaptacion: C('adaptacion_terreno_velocidad', 'Adaptación a terreno y velocidad', 'Mantiene la técnica cuando cambian la pendiente, la nieve o la velocidad.'),
} as const;

const POR_NIVEL: Record<TechnicalLevel, CompetenciaTecnicaReporte[]> = {
  INICIACION: [COMPETENCIAS.confianza, COMPETENCIAS.equilibrio, COMPETENCIAS.posicionBasica, COMPETENCIAS.cuna, COMPETENCIAS.direccion],
  A: [COMPETENCIAS.confianza, COMPETENCIAS.equilibrio, COMPETENCIAS.posicionBasica, COMPETENCIAS.cuna, COMPETENCIAS.direccion, COMPETENCIAS.velocidad],
  'A+': [COMPETENCIAS.equilibrio, COMPETENCIAS.cuna, COMPETENCIAS.girosCuna, COMPETENCIAS.velocidad, COMPETENCIAS.flexionBasica, COMPETENCIAS.direccion],
  B: [COMPETENCIAS.equilibrio, COMPETENCIAS.girosCuna, COMPETENCIAS.velocidad, COMPETENCIAS.exterior, COMPETENCIAS.flexionBasica, COMPETENCIAS.radio],
  'B+': [COMPETENCIAS.paralelismo, COMPETENCIAS.centralidad, COMPETENCIAS.exterior, COMPETENCIAS.flexion, COMPETENCIAS.radio, COMPETENCIAS.transicion, COMPETENCIAS.ritmo],
  C: [COMPETENCIAS.paralelismo, COMPETENCIAS.centralidad, COMPETENCIAS.exterior, COMPETENCIAS.rotacion, COMPETENCIAS.canteo, COMPETENCIAS.flexion, COMPETENCIAS.radio, COMPETENCIAS.transicion, COMPETENCIAS.ritmo],
  'C+': [COMPETENCIAS.paralelismo, COMPETENCIAS.centralidad, COMPETENCIAS.exterior, COMPETENCIAS.rotacion, COMPETENCIAS.canteo, COMPETENCIAS.presion, COMPETENCIAS.angulacion, COMPETENCIAS.radio, COMPETENCIAS.transicion, COMPETENCIAS.ritmo, COMPETENCIAS.baston],
  D: [COMPETENCIAS.paralelismo, COMPETENCIAS.centralidad, COMPETENCIAS.exterior, COMPETENCIAS.rotacion, COMPETENCIAS.canteo, COMPETENCIAS.presion, COMPETENCIAS.angulacion, COMPETENCIAS.radio, COMPETENCIAS.transicion, COMPETENCIAS.ritmo, COMPETENCIAS.baston, COMPETENCIAS.adaptacion],
  'D+': [COMPETENCIAS.conduccion, COMPETENCIAS.centralidad, COMPETENCIAS.exterior, COMPETENCIAS.rotacion, COMPETENCIAS.canteo, COMPETENCIAS.presion, COMPETENCIAS.angulacion, COMPETENCIAS.radio, COMPETENCIAS.transicion, COMPETENCIAS.ritmo, COMPETENCIAS.baston, COMPETENCIAS.adaptacion],
};

export function normalizarNivelReporte(nivel: string) {
  return requireTechnicalLevel(nivel, 'Reporte técnico');
}

export function competenciasReporte(nivel: string) {
  return POR_NIVEL[normalizarNivelReporte(nivel)];
}

export function resumenEvaluacionTecnica(
  evaluacion: EvaluacionTecnicaReporte | null | undefined,
  nivel: string
) {
  const nombres = new Map(
    competenciasReporte(nivel).map((competencia) => [competencia.id, competencia.nombre])
  );
  return Object.entries(evaluacion || {})
    .filter(([, valor]) => valor && valor !== 'No trabajado')
    .map(([id, valor]) => `${nombres.get(id) || id.replaceAll('_', ' ')}: ${valor}`)
    .join(' · ');
}

export function evaluacionTecnicaInicial(nivel: string, previa: EvaluacionTecnicaReporte = {}) {
  return Object.fromEntries(
    competenciasReporte(nivel).map((competencia) => [competencia.id, previa[competencia.id] || 'No trabajado'])
  ) as EvaluacionTecnicaReporte;
}

function esOcio(modalidad: string) {
  return String(modalidad || '').toUpperCase().includes('OCIO');
}

export function opcionesActitudAdaptada(modalidad: string) {
  return esOcio(modalidad)
    ? ['Muy buena', 'Buena', 'Correcta', 'Disperso', 'Se bloquea', 'Miedo', 'Cansado', 'No sigue consignas']
    : ['Muy buena', 'Buena', 'Correcta', 'Disperso', 'Se bloquea', 'Miedo', 'Cansado', 'No escucha', 'Llora'];
}

export function opcionesIncidenciaAdaptada(modalidad: string) {
  return esOcio(modalidad)
    ? ['Sin incidencia', 'Caída sin importancia', 'Caída con revisión', 'Molestia física', 'Problema de seguridad', 'Problema con material', 'Problema con remonte', 'Conflicto con compañero', 'Abandona la tarea', 'Otro']
    : ['Sin incidencia', 'Llanto', 'Miedo / bloqueo', 'Caída sin importancia', 'Caída con revisión', 'Se separa del grupo', 'No sigue instrucciones', 'Necesita ayuda constante', 'Problema con material', 'Problema con remonte', 'Conflicto con compañero', 'Otro'];
}

export function opcionesMejoras(nivel: string) {
  return [...competenciasReporte(nivel).map((item) => item.nombre), 'Autonomía', 'Remontes', 'Actitud / confianza', 'Ha reforzado lo ya aprendido'];
}

export function opcionesPrioridades(nivel: string) {
  return [...competenciasReporte(nivel).map((item) => item.nombre), 'Autonomía', 'Remontes', 'Control de velocidad', 'Revisar nivel', 'Seguimiento especial'];
}

export function opcionesAutonomiaAdaptada(nivel: string) {
  const n = normalizarNivelReporte(nivel);
  if (n === 'INICIACION' || n === 'A') {
    return ['', 'Necesita ayuda constante', 'Necesita ayuda puntual', 'Autónomo en llano', 'Autónomo en pista pequeña'];
  }
  if (n === 'A+' || n === 'B') {
    return ['', 'Necesita ayuda constante', 'Necesita ayuda puntual', 'Autónomo en pista pequeña', 'Autónomo en pista grande con supervisión', 'Autónomo en pista grande'];
  }
  return ['', 'Necesita supervisión frecuente', 'Necesita supervisión puntual', 'Autónomo en la dinámica del grupo', 'Autónomo en pista y remontes', 'Autonomía completa'];
}

export function ayudaAutonomiaAdaptada(nivel: string) {
  const n = normalizarNivelReporte(nivel);
  if (n === 'INICIACION' || n === 'A') {
    return 'Valora la ayuda con material, desplazamientos, frenada y cinta.';
  }
  if (n === 'A+' || n === 'B') {
    return 'Valora si se mueve y usa los remontes con seguridad y poca ayuda.';
  }
  return 'Valora si sigue la dinámica, los ejercicios y los remontes sin depender del entrenador.';
}

export function autonomiaLegacy(valor: string) {
  if (['Necesita ayuda constante', 'Necesita ayuda puntual', 'Autónomo en llano', 'Autónomo en pista pequeña', 'Autónomo en pista grande', 'Autónomo total'].includes(valor)) {
    return valor;
  }
  if (valor === 'Necesita supervisión frecuente') return 'Necesita ayuda constante';
  if (valor === 'Necesita supervisión puntual') return 'Necesita ayuda puntual';
  if (valor === 'Autónomo en pista grande con supervisión') return 'Autónomo en pista grande';
  if (valor === 'Autónomo en la dinámica del grupo') return 'Autónomo en pista grande';
  if (valor === 'Autónomo en pista y remontes' || valor === 'Autonomía completa') return 'Autónomo total';
  return 'Necesita ayuda puntual';
}

export function tecnicaLegacyPorNivel(nivel: string) {
  const n = normalizarNivelReporte(nivel);
  if (n === 'INICIACION') return 'Primer contacto / familiarización';
  if (n === 'A') return 'Cuña de frenado';
  if (n === 'A+') return 'Giros en cuña encadenados';
  if (n === 'B') return 'Giros en cuña encadenados';
  if (n === 'B+') return 'Fundamental';
  if (n === 'C') return 'Paralelo elemental';
  if (n === 'C+' || n === 'D') return 'Paralelo consolidado';
  return 'Viraje conducido claro y estable';
}

export function mejoraLegacy(selecciones: string[]) {
  const texto = selecciones.join(' ').toLowerCase();
  if (texto.includes('reforzado')) return 'Nada destacable · sesión de consolidación';
  if (texto.includes('cuña') || texto.includes('frenada')) return 'Cuña / frenada';
  if (texto.includes('velocidad')) return 'Control de velocidad';
  if (texto.includes('paralel')) return 'Paralelo';
  if (texto.includes('exterior') || texto.includes('presión')) return 'Apoyo exterior';
  if (texto.includes('canteo') || texto.includes('conducción')) return 'Cantos / conducción';
  if (texto.includes('autonom')) return 'Autonomía';
  if (texto.includes('remonte')) return 'Remontes';
  if (texto.includes('confianza') || texto.includes('actitud')) return 'Actitud / confianza';
  if (texto.includes('ritmo') || texto.includes('coordinación')) return 'Ritmo / fluidez';
  if (texto.includes('equilibrio') || texto.includes('centralidad')) return 'Equilibrio / deslizamiento';
  return 'Giro';
}

export function recomendacionLegacy(selecciones: string[]) {
  const texto = selecciones.join(' ').toLowerCase();
  if (texto.includes('revisar nivel')) return 'Revisar nivel';
  if (texto.includes('autonom')) return 'Trabajar autonomía';
  if (texto.includes('velocidad')) return 'Trabajar control de velocidad';
  if (texto.includes('paralel')) return 'Trabajar paralelo';
  if (texto.includes('exterior') || texto.includes('presión')) return 'Trabajar apoyo exterior';
  if (texto.includes('canteo') || texto.includes('conducción')) return 'Trabajar cantos / conducción';
  if (texto.includes('remonte')) return 'Revisar remontes';
  if (texto.includes('seguimiento')) return 'Seguimiento especial';
  return selecciones.length > 0 ? 'Progresar un paso técnico' : 'Consolidar lo trabajado';
}

export function resumenTrabajoDiario(trabajo: string | null | undefined) {
  if (!trabajo) return [];
  const lineas = trabajo.split('\n').map((linea) => linea.trim()).filter(Boolean);
  const objetivo = lineas.find((linea) => /^OBJETIVO\s*·/i.test(linea));
  const textoObjetivo = objetivo?.replace(/^OBJETIVO\s*·\s*/i, '') || lineas[0] || '';
  const normalizado = textoObjetivo.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const conceptos: Array<{ nombre: string; patron: RegExp }> = [
    { nombre: 'Confianza / adaptación', patron: /confianza|adaptaci/ },
    { nombre: 'Equilibrio / centralidad', patron: /equilibr|central/ },
    { nombre: 'Flexión-extensión', patron: /flexi|extensi|absor/ },
    { nombre: 'Cuña / frenada', patron: /cuna|fren/ },
    { nombre: 'Control de velocidad', patron: /control de velocidad|velocidad/ },
    { nombre: 'Paralelismo', patron: /paralel/ },
    { nombre: 'Apoyo exterior / presión', patron: /apoyo exterior|esqui exterior/ },
    { nombre: 'Rotación de piernas', patron: /rotaci|independencia.*tronco/ },
    { nombre: 'Canteo', patron: /canteo|cantos/ },
    { nombre: 'Gestión de presión', patron: /gestion de presion|presiones/ },
    { nombre: 'Radio / trayectoria', patron: /radio|trayectoria/ },
    { nombre: 'Transición', patron: /transicion|cambio de giro/ },
    { nombre: 'Ritmo / coordinación', patron: /ritmo|coordinaci/ },
    { nombre: 'Uso de bastón', patron: /baston/ },
    { nombre: 'Conducción', patron: /conducci|conducid/ },
    { nombre: 'Adaptación al terreno', patron: /terreno|pendiente|tipo de nieve/ },
    { nombre: 'Autonomía', patron: /autonom/ },
    { nombre: 'Remontes', patron: /remonte|cinta|percha|silla/ },
    { nombre: 'Dirección / forma del giro', patron: /direccion|forma del giro/ },
  ];
  const encontrados = conceptos
    .map((concepto) => ({ ...concepto, posicion: normalizado.search(concepto.patron) }))
    .filter((concepto) => concepto.posicion >= 0)
    .sort((a, b) => a.posicion - b.posicion)
    .map((concepto) => concepto.nombre);
  if (encontrados.length) return Array.from(new Set(encontrados)).slice(0, 4);
  const palabras = textoObjetivo.split(/\s+/).filter(Boolean);
  return palabras.length ? [`${palabras.slice(0, 8).join(' ')}${palabras.length > 8 ? '…' : ''}`] : [];
}

// ---------------------------------------------------------------------------
// Reporte por focos (versión 3). Aprobado por Jose el 01/10/2026.
// Cada nivel tiene 3-4 FOCOS (lo que se exige en ese nivel y cuenta para subir)
// elegidos entre SUS competencias de POR_NIVEL; el resto del nivel es BASE.
// Se guarda con los mismos ids y la misma escala que ya acepta Supabase, así que
// todos los consumidores actuales (historial, trabajo diario, evaluaciones)
// siguen funcionando sin cambios en la base de datos.
// ---------------------------------------------------------------------------

export type CriterioFoco = { id: string; aVeces: string; loConsigue: string };

const F = (id: string, aVeces: string, loConsigue: string): CriterioFoco => ({ id, aVeces, loConsigue });

export const FOCOS_POR_NIVEL: Record<TechnicalLevel, CriterioFoco[]> = {
  INICIACION: [
    F('confianza_adaptacion', 'Se queda con el grupo con ayuda', 'Sigue al entrenador con tranquilidad, sin la familia'),
    F('equilibrio_deslizamiento', 'Se desliza recto con ayuda', 'Se desliza recto en la pendiente suave sin caerse'),
    F('cuna_frenada', 'Abre la cuña con ayuda', 'Abre la cuña cuando se le pide'),
    F('direccion_giro', 'Mira hacia donde va', 'Se orienta hacia donde se le indica'),
  ],
  A: [
    F('cuna_frenada', 'Frena con ayuda o solo a veces', 'Frena en cuña a demanda'),
    F('control_velocidad', 'Controla solo en lo más suave', 'Controla la velocidad en cuña en pista pequeña'),
    F('direccion_giro', 'Gira solo hacia un lado', 'Gira a ambos lados'),
  ],
  'A+': [
    F('giros_cuna_encadenados', 'Enlaza 2-3 giros y para', 'Encadena giros en cuña sin pararse'),
    F('control_velocidad', 'A ratos baja recto', 'Controla la velocidad con los giros, sin bajar recto'),
    F('flexion_extension_basica', 'Va rígido en algunos giros', 'Acompaña los giros flexionando las piernas'),
  ],
  B: [
    F('giros_cuna_encadenados', 'Encadena solo en la parte fácil', 'Giros en cuña encadenados en toda la pista grande'),
    F('control_velocidad', 'Se le escapa en lo inclinado', 'Controla la velocidad en pista grande'),
    F('apoyo_exterior_presion', 'Carga solo hacia un lado', 'Empieza a cargar el esquí de fuera en los dos lados'),
    F('radio_trayectoria', 'Hace siempre el mismo giro', 'Hace giros del tamaño que se le pide'),
  ],
  'B+': [
    F('paralelismo', 'Junta al final de algún giro', 'Junta los esquís en diagonales y al final del giro'),
    F('apoyo_exterior_presion', 'La cuña se cierra solo a veces', 'La cuña se cierra al cargar el esquí exterior'),
    F('equilibrio_centralidad', 'Se va atrás en lo inclinado', 'Va centrado, sin echarse atrás'),
    F('transicion', 'Para o abre mucha cuña al cambiar', 'Pasa de un giro a otro sin parar'),
  ],
  C: [
    F('paralelismo', 'Aparece en algún giro suelto', 'El paralelo aparece en parte del giro y se repite con control'),
    F('apoyo_exterior_presion', 'Carga tarde o poco', 'Carga correctamente el esquí exterior'),
    F('rotacion_piernas', 'El tronco acompaña el giro', 'Gira con las piernas y el tronco estable'),
    F('flexion_extension', 'Flexiona solo a veces', 'Flexiona y extiende para cambiar de giro'),
  ],
  'C+': [
    F('paralelismo', 'Vuelve la cuña en lo difícil', 'Paralelo habitual, fluido y estable, sin cuña'),
    F('canteo', 'Agarra en algún giro', 'Usa los cantos: el esquí agarra y dirige'),
    F('radio_trayectoria', 'Le cuesta variar el giro', 'Cambia el tamaño del giro a demanda'),
    F('uso_baston', 'Lo usa solo a veces', 'Usa el bastón para marcar el cambio de giro'),
  ],
  D: [
    F('flexion_extension_presion', 'Absorbe solo en terreno fácil', 'Gestiona la presión y absorbe el terreno'),
    F('angulacion_inclinacion', 'Se inclina con todo el cuerpo', 'Angula para sujetar el giro'),
    F('ritmo_coordinacion', 'Se desordena al cambiar', 'Cambia ritmo y radio sin desordenar postura ni apoyos'),
    F('adaptacion_terreno_velocidad', 'Mantiene solo en terreno conocido', 'Mantiene la técnica con otra nieve, pendiente o velocidad'),
  ],
  'D+': [
    F('conduccion_presion', 'Algún giro conducido aislado', 'Conduce sobre los cantos de forma habitual, sin derrapar'),
    F('transicion', 'Cambio de cantos brusco', 'Cambio de cantos limpio y fluido'),
    F('flexion_extension_presion', 'Presión irregular en el giro', 'Presión regulada durante todo el giro'),
    F('radio_trayectoria', 'Pierde la conducción al variar', 'Cambia radio y trayectoria sin perder la conducción'),
  ],
};

/** Escala de 3 pasos que ve el entrenador, guardada con valores que Supabase ya acepta. */
export const PASOS_REPORTE: Array<{ etiqueta: string; valor: ValorTecnicoReporte }> = [
  { etiqueta: 'Todavía no', valor: 'Necesita mejorar' },
  { etiqueta: 'A veces', valor: 'En desarrollo' },
  { etiqueta: 'Lo consigue', valor: 'Consolidado' },
];

export type HabilidadNivel = CompetenciaTecnicaReporte & {
  foco: boolean;
  aVeces?: string;
  loConsigue?: string;
};

/** Competencias del nivel con los focos primero (en su orden) y después la base. */
export function habilidadesDelNivel(nivel: string): HabilidadNivel[] {
  const level = normalizarNivelReporte(nivel);
  const focos = FOCOS_POR_NIVEL[level];
  const todas = POR_NIVEL[level];
  const porId = new Map(todas.map((c) => [c.id, c]));
  const deFoco: HabilidadNivel[] = focos
    .filter((f) => porId.has(f.id))
    .map((f) => ({ ...(porId.get(f.id) as CompetenciaTecnicaReporte), foco: true, aVeces: f.aVeces, loConsigue: f.loConsigue }));
  const ids = new Set(focos.map((f) => f.id));
  const base: HabilidadNivel[] = todas.filter((c) => !ids.has(c.id)).map((c) => ({ ...c, foco: false }));
  return [...deFoco, ...base];
}

// Conceptos que reconoce resumenTrabajoDiario → competencias que los representan.
const CONCEPTO_A_COMPETENCIAS: Record<string, string[]> = {
  'Confianza / adaptación': ['confianza_adaptacion'],
  'Equilibrio / centralidad': ['equilibrio_deslizamiento', 'equilibrio_centralidad'],
  'Flexión-extensión': ['posicion_flexion_basica', 'flexion_extension_basica', 'flexion_extension', 'flexion_extension_presion'],
  'Cuña / frenada': ['cuna_frenada'],
  'Control de velocidad': ['control_velocidad'],
  Paralelismo: ['paralelismo'],
  'Apoyo exterior / presión': ['apoyo_exterior_presion'],
  'Rotación de piernas': ['rotacion_piernas'],
  Canteo: ['canteo'],
  'Gestión de presión': ['flexion_extension_presion', 'conduccion_presion'],
  'Radio / trayectoria': ['radio_trayectoria'],
  Transición: ['transicion'],
  'Ritmo / coordinación': ['ritmo_coordinacion'],
  'Uso de bastón': ['uso_baston'],
  Conducción: ['conduccion_presion'],
  'Adaptación al terreno': ['adaptacion_terreno_velocidad'],
  'Dirección / forma del giro': ['direccion_giro', 'giros_cuna_encadenados'],
};

/**
 * Ids de las habilidades del nivel que corresponden al trabajo de hoy.
 * Si el trabajo diario no permite identificar ninguna, se proponen los focos.
 */
export function habilidadesDelTrabajoDeHoy(nivel: string, trabajoDiario: string | null | undefined): string[] {
  const habilidades = habilidadesDelNivel(nivel);
  const delNivel = new Set(habilidades.map((h) => h.id));
  const ids = new Set<string>();
  resumenTrabajoDiario(trabajoDiario).forEach((concepto) => {
    (CONCEPTO_A_COMPETENCIAS[concepto] || []).forEach((id) => {
      if (delNivel.has(id)) ids.add(id);
    });
  });
  if (ids.size === 0) return habilidades.filter((h) => h.foco).map((h) => h.id);
  return habilidades.filter((h) => ids.has(h.id)).map((h) => h.id);
}

/** Niveles anterior y siguiente para la pregunta «¿En qué nivel le has visto hoy?». */
export function nivelesVecinos(nivel: string): { anterior: TechnicalLevel | null; actual: TechnicalLevel | null; siguiente: TechnicalLevel | null } {
  const actual = reportTechnicalLevelForRender(nivel);
  if (!actual) return { anterior: null, actual: null, siguiente: null };
  const orden = TECHNICAL_LEVELS.indexOf(actual);
  return {
    anterior: orden > 0 ? TECHNICAL_LEVELS[orden - 1] : null,
    actual,
    siguiente: orden < TECHNICAL_LEVELS.length - 1 ? TECHNICAL_LEVELS[orden + 1] : null,
  };
}

/** Remonte propuesto cuando el reporte se abre (el entrenador puede cambiarlo). */
export function remontesPorDefecto(nivel: string | null | undefined): string {
  const level = reportTechnicalLevelForRender(nivel);
  if (!level) return 'Cinta';
  return TECHNICAL_LEVELS.indexOf(level) <= TECHNICAL_LEVELS.indexOf('A+') ? 'Cinta' : 'Percha y silla';
}

const RITMO_POR_COMPARACION = {
  menor: 'Lento para su nivel',
  igual: 'Adecuado para su nivel',
  mayor: 'Muy rápido · podría ir con nivel superior',
} as const;

/** El ritmo deja de preguntarse: se deduce del nivel elegido frente al nivel de partida. */
export function ritmoDesdeNivel(nivelElegido: string, nivelPartida: string | null | undefined): string {
  const elegido = reportTechnicalLevelForRender(nivelElegido);
  const partida = reportTechnicalLevelForRender(nivelPartida);
  if (!elegido || !partida) return RITMO_POR_COMPARACION.igual;
  const diferencia = TECHNICAL_LEVEL_ORDER[elegido] - TECHNICAL_LEVEL_ORDER[partida];
  if (diferencia < 0) return RITMO_POR_COMPARACION.menor;
  if (diferencia > 0) return RITMO_POR_COMPARACION.mayor;
  return RITMO_POR_COMPARACION.igual;
}

const CUNA_INICIACION: Partial<Record<ValorTecnicoReporte, string>> = {
  'Necesita mejorar': 'No abre cuña',
  'En desarrollo': 'Abre cuña con ayuda',
  Consolidado: 'Cuña funcional',
};
const CUNA_A_EN_ADELANTE: Partial<Record<ValorTecnicoReporte, string>> = {
  'Necesita mejorar': 'Abre cuña con ayuda',
  'En desarrollo': 'Frena con ayuda',
  Consolidado: 'Frena a demanda',
};
const DIRECCION_A_GIRO: Partial<Record<ValorTecnicoReporte, string>> = {
  'Necesita mejorar': 'No gira',
  'En desarrollo': 'Gira solo hacia un lado',
  Consolidado: 'Giros aislados',
};

/** Opción con texto visible y valor guardado (para botones). */
export type OpcionReporte = { etiqueta: string; valor: string };

/**
 * Actitud general (obligatoria, una sola). Se guarda con valores que la base
 * de datos ya acepta: «Regular» se guarda como «Correcta».
 */
export const ACTITUD_GENERAL: OpcionReporte[] = [
  { etiqueta: 'Muy buena', valor: 'Muy buena' },
  { etiqueta: 'Buena', valor: 'Buena' },
  { etiqueta: 'Regular', valor: 'Correcta' },
];

/** «¿Algo a destacar?» (opcional, varias). Mismos valores para Baby y Ocio. */
export function opcionesActitudDestacar(modalidad: string): OpcionReporte[] {
  const ocio = esOcio(modalidad);
  return [
    { etiqueta: 'Cansado', valor: 'Cansado' },
    { etiqueta: 'Disperso', valor: 'Disperso' },
    { etiqueta: 'Miedo', valor: 'Miedo' },
    { etiqueta: 'Se bloquea', valor: 'Se bloquea' },
    { etiqueta: ocio ? 'No sigue consignas' : 'No escucha', valor: 'No escucha' },
    ...(ocio ? [] : [{ etiqueta: 'Llora', valor: 'Llora' }]),
  ];
}

// Si hay algo a destacar, la columna «actitud» (un solo valor) guarda lo más
// importante, para que sigan funcionando los avisos de coordinación que ya la leen.
const PRIORIDAD_ACTITUD_DESTACADA = ['Llora', 'Miedo', 'Se bloquea', 'No escucha', 'Disperso', 'Cansado'];

export function actitudParaGuardar(general: string, destacar: string[] | undefined): string {
  const marcadas = new Set(destacar || []);
  return PRIORIDAD_ACTITUD_DESTACADA.find((valor) => marcadas.has(valor)) || general;
}

/**
 * Autonomía en 3 pasos, igual para todos. «Va solo» se guarda con el valor
 * de autonomía que corresponde al nivel del grupo.
 */
export function opcionesAutonomiaPasos(nivel: string | null | undefined): OpcionReporte[] {
  const level = reportTechnicalLevelForRender(nivel);
  const orden = level ? TECHNICAL_LEVELS.indexOf(level) : -1;
  const vaSolo =
    orden <= 0
      ? 'Autónomo en llano'
      : orden <= TECHNICAL_LEVELS.indexOf('A+')
        ? 'Autónomo en pista pequeña'
        : orden <= TECHNICAL_LEVELS.indexOf('C')
          ? 'Autónomo en pista grande'
          : 'Autónomo total';
  return [
    { etiqueta: 'Necesita ayuda constante', valor: 'Necesita ayuda constante' },
    { etiqueta: 'Necesita ayuda a ratos', valor: 'Necesita ayuda puntual' },
    { etiqueta: 'Va solo', valor: vaSolo },
  ];
}

export type EnvioReporteFocos = {
  nivel: TechnicalLevel;
  /** Valor único para la columna «actitud». */
  actitud: string;
  /** Actitud general + lo marcado en «¿Algo a destacar?» (vacío si no se marcó nada). */
  actitudDetalle: string[];
  ritmoGrupo: string;
  remontes: string;
  mejorasHoy: string[];
  prioridades: string[];
  cunaFrenada: string;
  giroInicial: string;
  /** Solo las habilidades valoradas del nivel elegido. */
  evaluacionTecnica: EvaluacionTecnicaReporte;
  /** Nota del entrenador por cada habilidad valorada {id: texto}. */
  notasHabilidades: Record<string, string>;
};

/** Nota por habilidad (02/10/2026): obligatoria en cada habilidad valorada. */
export const NOTA_HABILIDAD_MIN = 10;
export const NOTA_HABILIDAD_MAX = 300;

/**
 * Valida el reporte por focos y calcula los campos que Supabase sigue
 * necesitando (ritmo, mejoras, prioridades y progresión inicial), para no
 * cambiar la función de guardado ni romper a quien lee esas columnas.
 */
export function prepararEnvioReporteFocos(
  form: {
    nivel: string;
    actitud: string;
    actitudDestacar?: string[];
    autonomia: string;
    incidencia: string;
    observaciones: string;
    remontes: string;
    cunaFrenada: string;
    giroInicial: string;
    evaluacionTecnica: EvaluacionTecnicaReporte;
    notasHabilidades?: Record<string, string>;
  },
  nivelPartida: string | null | undefined
): { ok: true; envio: EnvioReporteFocos } | { ok: false; error: string } {
  const nivel = reportTechnicalLevelForRender(form.nivel);
  if (!nivel) return { ok: false, error: 'Indica en qué nivel le has visto hoy.' };

  const habilidades = habilidadesDelNivel(nivel);
  const valoradas = habilidades.filter((h) => {
    const valor = form.evaluacionTecnica[h.id];
    return Boolean(valor) && valor !== 'No trabajado';
  });
  if (valoradas.length === 0) return { ok: false, error: 'Valora al menos una habilidad de las que has visto hoy.' };
  if (!ACTITUD_GENERAL.some((o) => o.valor === form.actitud)) return { ok: false, error: 'Selecciona la actitud.' };
  if (!String(form.autonomia || '').trim()) return { ok: false, error: 'Selecciona la autonomía observada.' };
  if (!String(form.incidencia || '').trim()) return { ok: false, error: 'Has marcado que ha pasado algo: elige qué ha pasado.' };
  const notas = form.notasHabilidades || {};
  for (const h of valoradas) {
    const nota = String(notas[h.id] || '').trim();
    if (nota.length < NOTA_HABILIDAD_MIN) {
      return { ok: false, error: `Escribe una nota en «${h.nombre}»: qué has visto hoy, con tus palabras.` };
    }
    if (nota.length > NOTA_HABILIDAD_MAX) {
      return { ok: false, error: `La nota de «${h.nombre}» es demasiado larga (máximo ${NOTA_HABILIDAD_MAX} caracteres).` };
    }
  }

  const valor = (id: string) => form.evaluacionTecnica[id];
  const conValor = (v: ValorTecnicoReporte) => valoradas.filter((h) => valor(h.id) === v).map((h) => h.nombre);
  const consigue = conValor('Consolidado');
  const aVeces = conValor('En desarrollo');
  const mejorasHoy = consigue.length ? consigue : aVeces.length ? aVeces : ['Ha reforzado lo ya aprendido'];

  const prioridades = valoradas
    .filter((h) => h.foco && valor(h.id) !== 'Consolidado')
    .map((h) => h.nombre);
  const partida = reportTechnicalLevelForRender(nivelPartida);
  if (partida && partida !== nivel) prioridades.push('Revisar nivel');

  let cunaFrenada = form.cunaFrenada || '';
  const cuna = valor('cuna_frenada');
  if (cuna && cuna !== 'No trabajado') {
    cunaFrenada = (nivel === 'INICIACION' ? CUNA_INICIACION : CUNA_A_EN_ADELANTE)[cuna] || cunaFrenada;
  }
  let giroInicial = form.giroInicial || '';
  const direccion = valor('direccion_giro');
  if (direccion && direccion !== 'No trabajado') giroInicial = DIRECCION_A_GIRO[direccion] || giroInicial;
  const encadenados = valor('giros_cuna_encadenados');
  if (encadenados === 'Consolidado') giroInicial = 'Enlaza giros en cuña';
  else if (encadenados === 'En desarrollo' || encadenados === 'Necesita mejorar') giroInicial = 'Giros aislados';

  return {
    ok: true,
    envio: {
      nivel,
      actitud: actitudParaGuardar(form.actitud, form.actitudDestacar),
      actitudDetalle: form.actitudDestacar && form.actitudDestacar.length
        ? [form.actitud, ...form.actitudDestacar]
        : [],
      ritmoGrupo: ritmoDesdeNivel(nivel, nivelPartida),
      remontes: form.remontes || remontesPorDefecto(nivel),
      mejorasHoy,
      prioridades,
      cunaFrenada,
      giroInicial,
      evaluacionTecnica: Object.fromEntries(
        valoradas.map((h) => [h.id, form.evaluacionTecnica[h.id]])
      ) as EvaluacionTecnicaReporte,
      notasHabilidades: Object.fromEntries(
        valoradas.map((h) => [h.id, String(notas[h.id] || '').trim()])
      ),
    },
  };
}
