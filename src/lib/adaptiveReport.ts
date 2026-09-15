export const ESCALA_TECNICA_REPORTE = [
  'No trabajado',
  'Necesita mejorar',
  'En desarrollo',
  'Correcto',
  'Consolidado',
] as const;

export type ValorTecnicoReporte = (typeof ESCALA_TECNICA_REPORTE)[number];
export type EvaluacionTecnicaReporte = Record<string, ValorTecnicoReporte>;

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

const POR_NIVEL: Record<string, CompetenciaTecnicaReporte[]> = {
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
  const limpio = String(nivel || '').trim().toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (limpio.includes('INICIACION')) return 'INICIACION';
  if (POR_NIVEL[limpio]) return limpio;

  // Algunas vistas antiguas entregan etiquetas como "Nivel C" o "Grupo D+".
  // Extraemos el código completo para no degradarlas silenciosamente al fallback B.
  const codigoEnEtiqueta = limpio.match(
    /(?:^|[^A-Z+])(D\+|C\+|B\+|A\+|D|C|B|A)(?:$|[^A-Z+])/
  )?.[1];

  return codigoEnEtiqueta && POR_NIVEL[codigoEnEtiqueta]
    ? codigoEnEtiqueta
    : 'B';
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
