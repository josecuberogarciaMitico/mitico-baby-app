import {
  EJERCICIOS_TECNICOS_MSZ,
  ORDEN_NIVEL_MSZ,
  normalizarNivelMSZ,
  type EjercicioTecnicoMSZ,
  type NivelTecnicoMSZ,
  type ObjetivoTecnicoMSZ,
  type FaseTecnicaMSZ,
} from './technicalLibrary';

export type ProgresionInicialTrabajoDiarioApp = {
  autonomiaCinta?: string;
  cunaFrenada?: string;
  giroInicial?: string;
  dinamicaAutonoma?: string;
  ayudaCunero?: string;
};

export type AlumnoContextoTrabajoDiarioApp = {
  alumnoId: string;
  nombre: string;
  nivel: string;
  tecnica?: string;
  actitud?: string;
  autonomia?: string;
  incidencia?: string;
  recomendacion?: string;
  remontes?: string[];
  ritmo?: string;
  fuerzaNivel?: string;
  demandaAtencion?: string;
  observacionOperativa?: string;
  faseViraje?: string;
  progresionInicial?: ProgresionInicialTrabajoDiarioApp;
};

type InputTrabajoDiario = {
  nombreGrupo: string;
  modalidad: string;
  niveles: string[];
  pista: string;
  observacionesGrupo: string;
  alumnos: AlumnoContextoTrabajoDiarioApp[];
  trabajosRecientes?: string[];
};

function textoPlano(valor: unknown) {
  return String(valor || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
}

function nivelesGrupo(input: InputTrabajoDiario) {
  const desdeAlumnos = input.alumnos
    .map((alumno) => normalizarNivelMSZ(alumno.nivel))
    .filter(Boolean);
  const desdeNivel = input.niveles.map(normalizarNivelMSZ);
  const todos = desdeAlumnos.length > 0 ? desdeAlumnos : desdeNivel;
  return todos.length > 0 ? todos : (['A+'] as NivelTecnicoMSZ[]);
}

function nivelDominante(input: InputTrabajoDiario) {
  const niveles = nivelesGrupo(input);
  const conteo = new Map<NivelTecnicoMSZ, number>();

  niveles.forEach((nivel) => conteo.set(nivel, (conteo.get(nivel) || 0) + 1));

  return Array.from(conteo.entries())
    .sort(
      (a, b) =>
        b[1] - a[1] ||
        ORDEN_NIVEL_MSZ[b[0]] - ORDEN_NIVEL_MSZ[a[0]]
    )[0][0];
}


function nivelesDistintosGrupo(input: InputTrabajoDiario) {
  return Array.from(new Set(nivelesGrupo(input))).sort(
    (a, b) => ORDEN_NIVEL_MSZ[a] - ORDEN_NIVEL_MSZ[b]
  );
}


type EstadoSesionTecnicaApp = 'CONSOLIDAR' | 'PROGRESAR' | 'RETAR';

function textoGrupoCompleto(input: InputTrabajoDiario) {
  return textoPlano(
    [
      input.observacionesGrupo,
      ...input.alumnos.flatMap((alumno) => [
        alumno.tecnica,
        alumno.actitud,
        alumno.autonomia,
        alumno.incidencia,
        alumno.recomendacion,
        alumno.ritmo,
        alumno.fuerzaNivel,
        alumno.demandaAtencion,
        alumno.observacionOperativa,
        alumno.faseViraje,
      ]),
    ].join(' ')
  );
}

function grupoConAtencionOCansancio(input: InputTrabajoDiario) {
  const texto = textoGrupoCompleto(input);
  return /cansad|fatiga|agotad|atencion baja|atención baja|muy despist|no atiende|demanda alta|necesita mucha atencion|necesita mucha atención/.test(
    texto
  );
}

function grupoConAutonomiaBaja(input: InputTrabajoDiario) {
  return input.alumnos.some((alumno) =>
    tieneRiesgo(alumno, 'autonomia_baja')
  );
}

function estadoSesionTecnica(input: InputTrabajoDiario): EstadoSesionTecnicaApp {
  const hayMiedo = input.alumnos.some((alumno) =>
    tieneRiesgo(alumno, 'miedo')
  );

  if (
    hayMiedo ||
    grupoConRitmoLento(input) ||
    grupoConAtencionOCansancio(input) ||
    grupoConAutonomiaBaja(input)
  ) {
    return 'CONSOLIDAR';
  }

  if (grupoListoParaReto(input)) return 'RETAR';

  return 'PROGRESAR';
}

function cantidadTrabajoPorEstado(
  input: InputTrabajoDiario,
  estado: EstadoSesionTecnicaApp
) {
  if (estado === 'CONSOLIDAR') {
    return 3;
  }

  if (estado === 'RETAR') return 4;

  return 4;
}

function textoEstadoSesion(estado: EstadoSesionTecnicaApp) {
  if (estado === 'CONSOLIDAR')
    return 'CONSOLIDAR · Repetir buenas ejecuciones y no subir dificultad hasta que el grupo funcione estable.';
  if (estado === 'RETAR')
    return 'RETAR · Mantener la base técnica y añadir una exigencia puntual sin convertir toda la sesión en reto.';
  return 'PROGRESAR · Consolidar la base y avanzar un paso técnico solo si aparece con control.';
}

function textoTrabajosRecientes(input: InputTrabajoDiario) {
  return textoPlano((input.trabajosRecientes || []).slice(0, 6).join(' '));
}

function penalizacionRepeticionEjercicio(
  ejercicio: EjercicioTecnicoMSZ,
  input: InputTrabajoDiario
) {
  const reciente = textoTrabajosRecientes(input);
  if (!reciente) return 0;

  const id = textoPlano(ejercicio.id.replace(/-/g, ' '));
  const nombre = textoPlano(ejercicio.nombre);

  if (reciente.includes(nombre)) return -18;
  if (id.length >= 6 && reciente.includes(id)) return -14;

  return 0;
}

function prioridadSecuenciaPedagogica(ejercicio: EjercicioTecnicoMSZ) {
  if (ejercicio.reto || ejercicio.intensidad === 'ALTA') return 40;

  if (
    ejercicio.objetivos.includes('equilibrio') ||
    ejercicio.objetivos.includes('postura') ||
    ejercicio.objetivos.includes('confianza')
  ) {
    return 10;
  }

  if (
    ejercicio.objetivos.includes('giro') ||
    ejercicio.objetivos.includes('frenada') ||
    ejercicio.objetivos.includes('apoyo_exterior')
  ) {
    return 20;
  }

  if (
    ejercicio.objetivos.includes('paralelo') ||
    ejercicio.objetivos.includes('cantos') ||
    ejercicio.objetivos.includes('precision')
  ) {
    return 30;
  }

  return 25;
}

function grupoConRitmoLento(input: InputTrabajoDiario) {
  return input.alumnos.some((alumno) =>
    /lento para su nivel|ritmo lento|lento/.test(textoPlano(alumno.ritmo))
  );
}

function consignaMixtaPorNivel(
  nivel: NivelTecnicoMSZ,
  ejercicio: EjercicioTecnicoMSZ | null
) {
  if (ejercicio?.variantesPorNivel?.[nivel]) {
    return ejercicio.variantesPorNivel[nivel] as string;
  }

  if (nivel === 'B')
    return 'mantener cuña estable, cerrar bien el giro y controlar la velocidad';
  if (nivel === 'B+')
    return 'reducir la cuña y buscar diagonal paralela sin perder control';
  if (nivel === 'C')
    return 'mantener paralelo durante más parte del giro y reforzar apoyo exterior';
  if (nivel === 'C+')
    return 'mantener paralelo fluido y añadir más ritmo, trayectoria y primeras sensaciones de cantos';
  if (nivel === 'D')
    return 'añadir más precisión, ritmo y trabajo de cantos';
  if (nivel === 'D+')
    return 'añadir conducción, presión o cambios de radio sin perder limpieza técnica';

  return 'hacer la misma tarea con la exigencia técnica correspondiente a su nivel';
}

function lineaTrabajoEjercicioMixto(
  ejercicio: EjercicioTecnicoMSZ,
  input: InputTrabajoDiario,
  nivelDominanteGrupo: NivelTecnicoMSZ,
  fase: FaseTecnicaMSZ
) {
  const niveles = nivelesDistintosGrupo(input);

  if (niveles.length <= 1) {
    return lineaTrabajoEjercicio(
      ejercicio,
      nivelDominanteGrupo,
      fase
    );
  }

  const cabecera = `• ${ejercicio.nombre}`;
  const lineasNivel = niveles.map((nivel) => {
    const consigna = consignaMixtaPorNivel(nivel, ejercicio)
      .replace(/\.+$/, '');
    return `  ${nivel} · ${consigna}.`;
  });

  return [cabecera, ...lineasNivel].join('\n');
}

function notaGrupoMixto(input: InputTrabajoDiario) {
  const niveles = nivelesDistintosGrupo(input);
  if (niveles.length <= 1) return '';

  const rango =
    ORDEN_NIVEL_MSZ[niveles[niveles.length - 1]] -
    ORDEN_NIVEL_MSZ[niveles[0]];

  if (rango >= 2) {
    return 'PAUTA DE GRUPO · Misma bajada y mismo ejercicio para todos; cambia solo la consigna técnica de cada nivel. No subir toda la dificultad común por el nivel más alto.';
  }

  return 'PAUTA DE GRUPO · Misma bajada y mismo ejercicio para todos; cambia solo la consigna técnica de cada nivel.';
}


function soloNivelesIniciales(input: InputTrabajoDiario) {
  return nivelesGrupo(input).every(
    (nivel) => ORDEN_NIVEL_MSZ[nivel] <= ORDEN_NIVEL_MSZ['A+']
  );
}

function pistaNormalizada(pista: string) {
  const texto = textoPlano(pista);
  if (texto.includes('peque')) return 'PEQUENA' as const;
  if (texto.includes('grande')) return 'GRANDE' as const;
  return 'AMBAS' as const;
}

function textoAlumno(alumno: AlumnoContextoTrabajoDiarioApp) {
  const p = alumno.progresionInicial;
  return textoPlano(
    [
      alumno.tecnica,
      alumno.actitud,
      alumno.autonomia,
      alumno.incidencia,
      alumno.recomendacion,
      alumno.ritmo,
      alumno.fuerzaNivel,
      alumno.demandaAtencion,
      alumno.observacionOperativa,
      alumno.faseViraje,
      ...(alumno.remontes || []),
      p?.autonomiaCinta,
      p?.cunaFrenada,
      p?.giroInicial,
      p?.dinamicaAutonoma,
      p?.ayudaCunero,
    ].join(' ')
  );
}

function detectarObjetivos(input: InputTrabajoDiario): ObjetivoTecnicoMSZ[] {
  const texto = textoPlano(
    [
      input.observacionesGrupo,
      ...input.alumnos.map(textoAlumno),
    ].join(' ')
  );

  const objetivos: ObjetivoTecnicoMSZ[] = [];

  if (/miedo|llor|bloque|asust|nervi|agobia/.test(texto))
    objetivos.push('confianza');
  if (/cuna|cuña|pizza|no abre/.test(texto)) objetivos.push('cuna');
  if (/fren|velocidad|rapido|rápido/.test(texto)) {
    objetivos.push('frenada');
    objetivos.push('velocidad');
  }
  if (/giro|giros|gira|paralelo/.test(texto)) objetivos.push('giro');
  if (/sentad|postura|rigid|manos|brazos|mirada/.test(texto))
    objetivos.push('postura');
  if (/exterior|interior|apoyo/.test(texto))
    objetivos.push('apoyo_exterior');
  if (/ritmo|lento|fuerte|muy fuerte/.test(texto)) objetivos.push('ritmo');
  if (/fila|espera|adelant|despista|atencion|dinamica/.test(texto))
    objetivos.push('dinamica_grupo');
  if (/cinta|sube solo|entra solo|sale solo/.test(texto))
    objetivos.push('autonomia_cinta');
  if (/equilibr|cae|caida/.test(texto)) objetivos.push('equilibrio');

  if (objetivos.length === 0) {
    objetivos.push('giro', 'equilibrio', 'ritmo');
  }

  return Array.from(new Set(objetivos));
}

function tieneRiesgo(alumno: AlumnoContextoTrabajoDiarioApp, riesgo: string) {
  const texto = textoAlumno(alumno);
  if (riesgo === 'miedo') return /miedo|llor|bloque|asust|nervi|agobia/.test(texto);
  if (riesgo === 'velocidad_sin_control')
    return /sin control|no controla|velocidad exces|se escapa|baja recto/.test(texto);
  if (riesgo === 'autonomia_baja')
    return /necesita ayuda|ayuda completa|acompanad|profesor constante/.test(texto);
  return false;
}

function ejercicioCompatibleConTodoElGrupo(
  ejercicio: EjercicioTecnicoMSZ,
  input: InputTrabajoDiario
) {
  const niveles = nivelesDistintosGrupo(input);
  if (niveles.length <= 1) return true;

  return niveles.every((nivel) => ejercicio.niveles.includes(nivel));
}

function ejercicioCompatible(
  ejercicio: EjercicioTecnicoMSZ,
  input: InputTrabajoDiario,
  nivel: NivelTecnicoMSZ
) {
  const pista = pistaNormalizada(input.pista);

  if (!ejercicio.niveles.includes(nivel)) return false;
  if (!ejercicioCompatibleConTodoElGrupo(ejercicio, input)) return false;
  if (
    ejercicio.pista !== 'AMBAS' &&
    pista !== 'AMBAS' &&
    ejercicio.pista !== pista
  ) {
    return false;
  }

  // Bastones: solo los dejamos como opción desde C; el texto recuerda que
  // únicamente se hace si realmente los llevan.
  if (
    ejercicio.requiereBastones &&
    ORDEN_NIVEL_MSZ[nivel] < ORDEN_NIVEL_MSZ.C
  ) {
    return false;
  }

  if (
    ejercicio.evitarSi?.some((riesgo) =>
      input.alumnos.some((alumno) => tieneRiesgo(alumno, riesgo))
    )
  ) {
    return false;
  }

  const hayMiedoOBloqueo = input.alumnos.some((alumno) =>
    tieneRiesgo(alumno, 'miedo')
  );

  if (hayMiedoOBloqueo && ejercicio.intensidad === 'ALTA') {
    return false;
  }

  return true;
}

function objetivosProgresionPorNivel(
  nivel: NivelTecnicoMSZ
): ObjetivoTecnicoMSZ[] {
  if (nivel === 'B')
    return ['cuna', 'frenada', 'giro', 'equilibrio', 'dinamica_grupo'];
  if (nivel === 'B+')
    return ['cuna', 'paralelo', 'giro', 'equilibrio', 'apoyo_exterior'];
  if (nivel === 'C')
    return ['paralelo', 'apoyo_exterior', 'postura', 'ritmo', 'equilibrio'];
  if (nivel === 'C+')
    return ['paralelo', 'apoyo_exterior', 'ritmo', 'precision', 'cantos'];
  if (nivel === 'D')
    return ['paralelo', 'precision', 'ritmo', 'apoyo_exterior', 'cantos'];
  if (nivel === 'D+')
    return ['cantos', 'precision', 'ritmo', 'apoyo_exterior', 'coordinacion'];
  return ['giro', 'equilibrio'];
}

function puntuarEjercicio(
  ejercicio: EjercicioTecnicoMSZ,
  objetivos: ObjetivoTecnicoMSZ[],
  input: InputTrabajoDiario,
  nivel: NivelTecnicoMSZ
) {
  if (!ejercicioCompatible(ejercicio, input, nivel)) return -999;

  let puntos = 0;
  const progresion = objetivosProgresionPorNivel(nivel);

  ejercicio.objetivos.forEach((objetivo) => {
    if (progresion.includes(objetivo)) puntos += 6;
    if (objetivos.includes(objetivo)) puntos += 2;
  });

  // B todavía consolida cuña. No penalizarla.
  if (nivel === 'B' && ejercicio.objetivos.includes('cuna')) {
    puntos += 5;
  }

  // B+ es el puente hacia paralelo: premiar cuña sólida y primeras tareas de cierre.
  if (
    nivel === 'B+' &&
    (ejercicio.objetivos.includes('cuna') ||
      ejercicio.objetivos.includes('paralelo'))
  ) {
    puntos += 4;
  }

  // Desde C la cuña ya no puede dominar la sesión; solo puede quedar como corrección puntual.
  if (
    ORDEN_NIVEL_MSZ[nivel] >= ORDEN_NIVEL_MSZ.C &&
    ejercicio.objetivos.includes('cuna')
  ) {
    puntos -= 12;
  }

  // C y C+ deben priorizar paralelo, apoyo exterior y trayectoria.
  if (
    (nivel === 'C' || nivel === 'C+') &&
    ejercicio.objetivos.includes('paralelo')
  ) {
    puntos += 6;
  }

  // D y D+ pueden cargar más trabajo de cantos; en D+ es prioridad fuerte.
  if (
    (nivel === 'D' || nivel === 'D+') &&
    ejercicio.objetivos.includes('cantos')
  ) {
    puntos += nivel === 'D+' ? 8 : 4;
  }

  const fase = textoPlano(faseVirajeDominante(input));

  if (
    nivel === 'B+' &&
    /fundamental/.test(fase) &&
    ['dos-manos-rodilla-exterior', 'dos-manos-rodillas-palmada', 'pasos-activos-diagonal', 'seguir-huella'].includes(
      ejercicio.id
    )
  ) {
    puntos += 10;
  }

  if (
    nivel === 'C' &&
    ['paralelo-amplio-fluido', 'dos-manos-rodilla-exterior', 'dos-manos-rodillas-palmada', 'pasos-activos-diagonal'].includes(
      ejercicio.id
    )
  ) {
    puntos += 7;
  }

  if (
    nivel === 'C+' &&
    ['avion-exterior-bota', 'talon-interior-diagonal', 'giro-interior-levantado', 'derrapaje-recto-derrapaje'].includes(
      ejercicio.id
    )
  ) {
    puntos += 7;
  }

  if (
    nivel === 'D' &&
    ['giro-interior-levantado', 'tip-tap-sin-salto', 'cadera-palmada-espalda', 'giro-derrapado-esquis'].includes(
      ejercicio.id
    )
  ) {
    puntos += 7;
  }

  if (
    nivel === 'D+' &&
    ['tip-tap-sin-salto', 'tip-tap-con-salto', 'bastones-bandeja-apoyo', 'cambio-radio-mismo-ritmo'].includes(
      ejercicio.id
    )
  ) {
    puntos += 8;
  }

  const pista = pistaNormalizada(input.pista);
  if (ejercicio.pista === pista) puntos += 2;
  if (ejercicio.pista === 'AMBAS') puntos += 1;

  const nivelesMixtosPuntuacion = nivelesDistintosGrupo(input);
  if (nivelesMixtosPuntuacion.length > 1) {
    const variantesParaTodos = nivelesMixtosPuntuacion.every(
      (nivelMixto) => Boolean(ejercicio.variantesPorNivel?.[nivelMixto])
    );

    if (variantesParaTodos) puntos += 8;

    if (
      ['terminar-giro-cuesta-arriba', 'pasillo-ancho', 'manos-delante'].includes(
        ejercicio.id
      )
    ) {
      puntos += 10;
    }

    if (
      ejercicio.objetivos.includes('giro') ||
      ejercicio.objetivos.includes('frenada') ||
      ejercicio.objetivos.includes('paralelo')
    ) {
      puntos += 4;
    }
  }

  const hayMiedoOBloqueo = input.alumnos.some((alumno) =>
    tieneRiesgo(alumno, 'miedo')
  );

  if (hayMiedoOBloqueo) {
    if (ejercicio.objetivos.includes('confianza')) puntos += 14;
    if (ejercicio.objetivos.includes('equilibrio')) puntos += 6;
    if (ejercicio.objetivos.includes('postura')) puntos += 3;
    if (ejercicio.intensidad === 'BAJA') puntos += 7;
    if (ejercicio.intensidad === 'MEDIA') puntos += 1;

    if (
      ['seguir-huella', 'gigante-pequeno', 'manos-delante', 'volante', 'pasillo-ancho'].includes(
        ejercicio.id
      )
    ) {
      puntos += 12;
    }

    if (
      ['giro-interior-levantado', 'tip-tap-sin-salto', 'derrapaje-recto-derrapaje', 'giro-derrapado-esquis'].includes(
        ejercicio.id
      )
    ) {
      puntos -= 10;
    }
    if (
      ejercicio.objetivos.includes('reto') ||
      ejercicio.objetivos.includes('velocidad') ||
      ejercicio.objetivos.includes('cantos')
    ) {
      puntos -= 10;
    }
  }

  if (ejercicio.juego) puntos += 1;
  if (ejercicio.reto) puntos -= 2;

  return puntos;
}

function familiaEjercicio(ejercicio: EjercicioTecnicoMSZ) {
  const id = ejercicio.id;

  if (['seguir-huella', 'serpiente', 'seguir-lider', 'tren', 'simulacro-fila-a-plus'].includes(id))
    return 'seguimiento_fila';
  if (['giros-amplios-cuna', 'cuna-pista-grande-controlada'].includes(id))
    return 'cuna_giro';
  if (['pasillo-ancho', 'pasillo-estrecho', 'cambio-radio', 'conducido-cambio-radio', 'cambio-radio-mismo-ritmo', 'mismo-radio-cambio-ritmo'].includes(id))
    return 'trayectoria_radio';
  if (['avion', 'avion-exterior-bota', 'palmada-rodilla-exterior', 'dos-manos-rodilla-exterior'].includes(id))
    return 'apoyo_exterior_brazos';
  if (['levantar-interior', 'talon-interior-diagonal', 'giro-interior-levantado'].includes(id))
    return 'interior_exterior';
  if (['tip-tap-sin-salto', 'tip-tap-con-salto', 'pasos-activos-diagonal'].includes(id))
    return 'pies_activos';
  if (['bastones-bandeja', 'bastones-bandeja-apoyo', 'bastones-bandeja-extension', 'bastones-manos'].includes(id))
    return 'bastones';
  if (['derrapaje-lateral', 'derrapaje-recto-derrapaje', 'giro-derrapado-esquis', 'parada-lateral'].includes(id))
    return 'cantos_derrapaje';

  return id;
}

const IDS_NO_TRABAJO_PRINCIPAL = new Set([
  'bajada-libre-observada',
  'carrera-final',
]);

const IDS_RETO_FINAL = new Set([
  'chuss-bolita',
  'chuss-saltos-alternos',
  'velocidad-max-controlada',
  'un-esqui-final',
  'marcha-atras',
  'tip-tap-con-salto',
  'saltitos-pequenos',
]);

const PRIORIDAD_POR_FASE: Record<FaseTecnicaMSZ, string[]> = {
  FAMILIARIZACION: [
    'deslizamiento-profesor',
    'pizza-grande-pequena',
    'semaforo-inicial',
    'gigante-pequeno',
  ],
  DESLIZAMIENTO: [
    'deslizamiento-profesor',
    'pizza-grande-pequena',
    'semaforo-inicial',
    'manos-delante',
  ],
  CUNA: [
    'pizza-grande-pequena',
    'manos-delante',
    'gigante-pequeno',
    'manos-rodillas',
    'giro-aislado',
  ],
  GIROS_CUNA: [
    'giros-amplios-cuna',
    'terminar-giro-cuesta-arriba',
    'dos-manos-rodilla-exterior',
    'dos-manos-rodillas-palmada',
    'palmada-delante-extension',
    'manos-cadera',
    'tocar-muslo-exterior',
    'volante',
    'avion',
    'seguir-huella',
  ],
  FUNDAMENTAL: [
    'diagonal-paralela',
    'reducir-cuna-progresiva',
    'dos-manos-rodillas-palmada',
    'dos-manos-rodilla-exterior',
    'palmada-delante-extension',
    'cadera-palmada-espalda',
    'manos-cadera',
    'talon-interior-diagonal',
    'pasos-activos-diagonal',
    'terminar-giro-cuesta-arriba',
  ],
  INICIO_PARALELO: [
    'diagonal-paralela',
    'paralelo-amplio-fluido',
    'dos-manos-rodilla-exterior',
    'dos-manos-rodillas-palmada',
    'avion',
    'talon-interior-diagonal',
    'pasos-activos-diagonal',
    'cadera-palmada-espalda',
    'volante',
  ],
  PARALELO_ELEMENTAL: [
    'paralelo-amplio-fluido',
    'avion',
    'avion-exterior-bota',
    'talon-interior-diagonal',
    'giro-interior-levantado',
    'pasos-activos-diagonal',
    'cambio-radio',
    'derrapaje-lateral',
  ],
  PARALELO_CONSOLIDADO: [
    'avion-exterior-bota',
    'giro-interior-levantado',
    'tip-tap-sin-salto',
    'derrapaje-recto-derrapaje',
    'parada-lateral',
    'cambio-radio-mismo-ritmo',
    'mismo-radio-cambio-ritmo',
    'bastones-bandeja-extension',
  ],
  CONDUCIDO: [
    'conducido-amplio',
    'conducido-cambio-radio',
    'tip-tap-sin-salto',
    'bastones-bandeja-apoyo',
    'mismo-radio-cambio-ritmo',
    'cambio-radio-mismo-ritmo',
    'giro-derrapado-esquis',
  ],
};

function prioridadFaseEjercicio(
  ejercicio: EjercicioTecnicoMSZ,
  fase: FaseTecnicaMSZ
) {
  const lista = PRIORIDAD_POR_FASE[fase] || [];
  const posicion = lista.indexOf(ejercicio.id);
  return posicion < 0 ? 0 : Math.max(4, 24 - posicion * 2);
}

function esTrabajoPrincipal(ejercicio: EjercicioTecnicoMSZ) {
  return (
    !ejercicio.reto &&
    !IDS_NO_TRABAJO_PRINCIPAL.has(ejercicio.id) &&
    !IDS_RETO_FINAL.has(ejercicio.id)
  );
}


function ordenPedagogicoEjercicio(ejercicio: EjercicioTecnicoMSZ) {
  const id = ejercicio.id;

  if (
    [
      'pizza-grande-pequena',
      'giro-aislado',
      'giros-amplios-cuna',
      'terminar-giro-cuesta-arriba',
      'diagonal-paralela',
      'reducir-cuna-progresiva',
      'paralelo-amplio-fluido',
      'conducido-amplio',
      'conducido-cambio-radio',
    ].includes(id)
  ) {
    return 1;
  }

  if (
    [
      'manos-delante',
      'manos-rodillas',
      'manos-cadera',
      'palmada-delante-extension',
      'dos-manos-rodilla-exterior',
      'dos-manos-rodillas-palmada',
      'cadera-palmada-espalda',
      'tocar-muslo-exterior',
      'avion',
      'avion-exterior-bota',
      'talon-interior-diagonal',
    ].includes(id)
  ) {
    return 2;
  }

  if (
    [
      'pasos-activos-diagonal',
      'giro-interior-levantado',
      'tip-tap-sin-salto',
      'derrapaje-lateral',
      'derrapaje-recto-derrapaje',
      'giro-derrapado-esquis',
      'parada-lateral',
      'bastones-bandeja',
      'bastones-bandeja-apoyo',
      'bastones-bandeja-extension',
    ].includes(id)
  ) {
    return 3;
  }

  if (ejercicio.juego) return 4;
  return 3;
}

function textoCoachingEjercicio(
  ejercicio: EjercicioTecnicoMSZ,
  nivel: NivelTecnicoMSZ,
  fase: FaseTecnicaMSZ
) {
  return (
    ejercicio.variantesPorFase?.[fase] ||
    ejercicio.variantesPorNivel?.[nivel] ||
    ejercicio.explicacionEntrenador ||
    descripcionCortaEjercicio(ejercicio)
  );
}

function elegirEjerciciosTecnicos(
  input: InputTrabajoDiario,
  nivel: NivelTecnicoMSZ,
  cantidad = 4
) {
  const objetivos = detectarObjetivos(input);
  const fase = faseTecnicaDominante(input);

  const ordenados = EJERCICIOS_TECNICOS_MSZ
    .map((ejercicio) => ({
      ejercicio,
      score:
        puntuarEjercicio(ejercicio, objetivos, input, nivel) +
        prioridadFaseEjercicio(ejercicio, fase) +
        (ejercicio.variantesPorFase?.[fase] ? 5 : 0) +
        (ejercicio.variantesPorNivel?.[nivel] ? 3 : 0) +
        penalizacionRepeticionEjercicio(ejercicio, input),
    }))
    .filter(
      ({ score, ejercicio }) =>
        score > -900 && esTrabajoPrincipal(ejercicio)
    )
    .sort((a, b) => b.score - a.score);

  const elegidos: EjercicioTecnicoMSZ[] = [];
  const familias = new Set<string>();

  for (const { ejercicio } of ordenados) {
    const familia = familiaEjercicio(ejercicio);
    if (familias.has(familia)) continue;

    elegidos.push(ejercicio);
    familias.add(familia);
    if (elegidos.length >= cantidad) break;
  }

  return elegidos;
}

function elegirJuego(
  input: InputTrabajoDiario,
  nivel: NivelTecnicoMSZ,
  familiasBloqueadas: Set<string>
) {
  const objetivos = detectarObjetivos(input);
  const fase = faseTecnicaDominante(input);
  const necesitaJuegoGrupo = objetivos.some((objetivo) =>
    ['confianza', 'dinamica_grupo'].includes(objetivo)
  );

  return (
    EJERCICIOS_TECNICOS_MSZ
      .map((ejercicio) => ({
        ejercicio,
        prioridad: prioridadFaseEjercicio(ejercicio, fase),
        score:
          puntuarEjercicio(ejercicio, objetivos, input, nivel) +
          prioridadFaseEjercicio(ejercicio, fase) +
          penalizacionRepeticionEjercicio(ejercicio, input),
      }))
      .filter(
        ({ ejercicio, score, prioridad }) =>
          score > -900 &&
          ejercicio.juego &&
          esTrabajoPrincipal(ejercicio) &&
          !familiasBloqueadas.has(familiaEjercicio(ejercicio)) &&
          (prioridad > 0 || necesitaJuegoGrupo || ORDEN_NIVEL_MSZ[nivel] <= ORDEN_NIVEL_MSZ.C)
      )
      .sort((a, b) => b.score - a.score)[0]?.ejercicio || null
  );
}

function grupoListoParaReto(input: InputTrabajoDiario) {
  const conRiesgo = input.alumnos.some(
    (alumno) =>
      tieneRiesgo(alumno, 'miedo') ||
      tieneRiesgo(alumno, 'velocidad_sin_control') ||
      tieneRiesgo(alumno, 'autonomia_baja')
  );
  if (conRiesgo) return false;

  const texto = textoPlano(
    input.alumnos
      .flatMap((alumno) => [
        alumno.ritmo,
        alumno.fuerzaNivel,
        alumno.recomendacion,
        alumno.observacionOperativa,
      ])
      .join(' ')
  );

  return /rapido para su nivel|rápido para su nivel|fuerte para su nivel|nivel fuerte|subir de nivel|avanzar|reto/.test(
    texto
  );
}

function elegirReto(
  input: InputTrabajoDiario,
  nivel: NivelTecnicoMSZ
) {
  if (!grupoListoParaReto(input)) return null;

  const objetivos = detectarObjetivos(input);
  return (
    EJERCICIOS_TECNICOS_MSZ
      .map((ejercicio) => ({
        ejercicio,
        score: puntuarEjercicio(ejercicio, objetivos, input, nivel),
      }))
      .filter(
        ({ ejercicio, score }) =>
          score > -900 &&
          ejercicio.reto &&
          IDS_RETO_FINAL.has(ejercicio.id) &&
          !IDS_NO_TRABAJO_PRINCIPAL.has(ejercicio.id)
      )
      .sort((a, b) => b.score - a.score)[0]?.ejercicio || null
  );
}

function puntuacionCinta(valor?: string) {
  const t = textoPlano(valor);
  if (/sube solo.*espera.*sale/.test(t)) return 5;
  if (/entra y sale solo/.test(t)) return 4;
  if (/entra solo.*ayuda al salir/.test(t)) return 3;
  if (/sube acompanad/.test(t)) return 2;
  if (/ayuda completa/.test(t)) return 1;
  return 0;
}

function puntuacionFrenada(valor?: string) {
  const t = textoPlano(valor);
  if (/frena a demanda/.test(t)) return 5;
  if (/cuna funcional/.test(t)) return 4;
  if (/frena con ayuda/.test(t)) return 3;
  if (/abre cuna con ayuda/.test(t)) return 2;
  if (/no abre cuna/.test(t)) return 1;
  return 0;
}

function puntuacionGiro(valor?: string) {
  const t = textoPlano(valor);
  if (/enlaza giros/.test(t)) return 5;
  if (/giros aislados/.test(t)) return 4;
  if (/solo hacia un lado/.test(t)) return 2;
  if (/no gira/.test(t)) return 1;
  return 0;
}

function puntuacionDinamica(valor?: string) {
  const t = textoPlano(valor);
  if (/preparado.*pista grande|listo.*pista grande/.test(t)) return 5;
  if (/funciona.*dinamica de grupo|sigue al profesor.*fila/.test(t)) return 4;
  if (/espera arriba solo/.test(t)) return 3;
  if (/espera arriba con ayuda/.test(t)) return 2;
  if (/profesor constante/.test(t)) return 1;
  return 0;
}

function prioridadInicialAlumno(alumno: AlumnoContextoTrabajoDiarioApp) {
  const p = alumno.progresionInicial;
  if (!p) {
    const texto = textoAlumno(alumno);
    if (/cinta|remonte/.test(texto)) return 'validar autonomía real en cinta';
    if (/fren|cuna|cuña/.test(texto)) return 'cuña y frenada';
    if (/giro/.test(texto)) return 'dirección y enlace de giros';
    if (/miedo|llor|bloque/.test(texto)) return 'confianza y adaptación';
    return 'diagnóstico 1vs1: cinta, frenada y giro';
  }

  const cinta = puntuacionCinta(p.autonomiaCinta);
  const freno = puntuacionFrenada(p.cunaFrenada);
  const giro = puntuacionGiro(p.giroInicial);
  const dinamica = puntuacionDinamica(p.dinamicaAutonoma);

  if (cinta > 0 && cinta < 4) return 'autonomía en cinta y espera arriba';
  if (freno > 0 && freno < 4) return 'cuña funcional y frenada';
  if (giro > 0 && giro < 4) return 'dirección: conseguir giros a ambos lados';
  if (giro === 4) return 'enlazar giros en cuña';
  if (dinamica > 0 && dinamica < 4) return 'dinámica autónoma y funcionamiento en grupo';
  if (dinamica >= 4) return 'progresión: preparar salida de pista pequeña';
  return 'diagnóstico 1vs1: detectar el cuello de botella';
}

function aPlusPreparadoPistaGrande(alumno: AlumnoContextoTrabajoDiarioApp) {
  if (normalizarNivelMSZ(alumno.nivel) !== 'A+') return false;

  const p = alumno.progresionInicial;
  if (p) {
    return (
      puntuacionCinta(p.autonomiaCinta) >= 4 &&
      puntuacionFrenada(p.cunaFrenada) >= 4 &&
      puntuacionGiro(p.giroInicial) >= 5 &&
      puntuacionDinamica(p.dinamicaAutonoma) >= 4
    );
  }

  const texto = textoAlumno(alumno);
  return (
    /autonom|solo|sin ayuda/.test(texto) &&
    /frena|control/.test(texto) &&
    /enlaza|giros continu/.test(texto) &&
    !/miedo|bloque|llor/.test(texto)
  );
}

function resumenPreparacionAPlusGrupo(input: InputTrabajoDiario) {
  const alumnosAPlus = input.alumnos.filter(
    (alumno) => normalizarNivelMSZ(alumno.nivel) === 'A+'
  );

  const preparados = alumnosAPlus.filter(aPlusPreparadoPistaGrande).length;
  const total = alumnosAPlus.length;

  return {
    total,
    preparados,
    ninguno: total > 0 && preparados === 0,
    mayoria: total > 0 && preparados >= Math.ceil(total / 2),
    todos: total > 0 && preparados === total,
  };
}

function descripcionCortaEjercicio(ejercicio: EjercicioTecnicoMSZ) {
  const mapa: Record<string, string> = {
    'deslizamiento-profesor':
      'deslizar hasta el profesor y terminar con parada controlada',
    'pizza-grande-pequena':
      'abrir/cerrar cuña para sentir cómo cambia la velocidad',
    'semaforo-inicial':
      'verde desliza, amarillo controla, rojo para',
    'gigante-pequeno':
      'alternar postura alta y compacta sin perder equilibrio',
    'seguir-huella':
      'copiar la trayectoria, radio y velocidad del entrenador',
    serpiente:
      'seguir al entrenador enlazando giros y manteniendo distancia',
    'parar-profesor':
      'acabar el giro y parar detrás del entrenador sin adelantar',
    'giro-aislado':
      'trabajar un giro a cada lado antes de enlazarlos',
    'giros-amplios-cuna':
      'hacer giros redondos en cuña terminando bien cada curva',
    'tocar-botas':
      'tocar brevemente las botas manteniendo mirada al frente',
    'manos-delante':
      'mantener las manos visibles delante durante la bajada',
    avion:
      'brazos abiertos para buscar equilibrio y apoyo exterior',
    'palmada-rodilla-exterior':
      'tocar la rodilla exterior en cada giro',
    'levantar-interior':
      'levantar un instante el esquí interior para cargar el exterior',
    'pasillo-ancho':
      'mantener los giros dentro de un pasillo imaginario ancho',
    'pasillo-estrecho':
      'reducir el ancho de los giros sin perder control',
    'cambio-radio':
      'alternar giros amplios y cortos manteniendo el ritmo',
    'giro-corto-controlado':
      'encadenar giros cortos sin perder postura ni trayectoria',
    'derrapaje-lateral':
      'soltar y recuperar canto con velocidad baja',
    'hoja-muerta':
      'desplazarse lateralmente controlando cantos y equilibrio',
    'un-esqui-final':
      'tramo final con un solo esquí y velocidad controlada',
    'marcha-atras':
      'tramo corto marcha atrás, lento y con espacio',
    'chuss-bolita':
      'posición compacta y estable desde menos de mitad de pista',
    'chuss-saltos-alternos':
      'bolita con pequeños saltos controlados desde menos de mitad',
    'velocidad-max-controlada':
      'velocidad alta solo desde menos de mitad y con frenada clara',
    'carrera-final':
      'salidas escalonadas: prima control y línea, no solo velocidad',
    'bajada-libre-observada':
      'bajada sin consigna para comprobar si aparece lo trabajado',
    'seguir-lider':
      'copiar una consigna sencilla del entrenador cada vez',
    tren:
      'mantener orden, distancia y misma línea sin adelantar',
    'bastones-manos':
      'bastones horizontales delante para estabilizar brazos y tronco',
  };

  return mapa[ejercicio.id] || ejercicio.descripcion;
}

function lineaTrabajoEjercicio(
  ejercicio: EjercicioTecnicoMSZ,
  nivel: NivelTecnicoMSZ,
  fase: FaseTecnicaMSZ
) {
  return `• ${ejercicio.nombre} — ${textoCoachingEjercicio(
    ejercicio,
    nivel,
    fase
  ).replace(/\.+$/, '')}.`;
}

type PerfilGrupoInicialApp =
  | 'INICIACION_PURO'
  | 'INICIACION_A'
  | 'A_PREDOMINANTE'
  | 'A_A_PLUS'
  | 'A_PLUS_PURO'
  | 'A_PLUS_NUMEROSO';

function perfilGrupoInicialApp(input: InputTrabajoDiario): PerfilGrupoInicialApp {
  const niveles = nivelesGrupo(input);
  const total = niveles.length;
  const nIni = niveles.filter((n) => n === 'INICIACION').length;
  const nA = niveles.filter((n) => n === 'A').length;
  const nAPlus = niveles.filter((n) => n === 'A+').length;

  if (nAPlus === total && total >= 4) return 'A_PLUS_NUMEROSO';
  if (nAPlus === total) return 'A_PLUS_PURO';
  if (nIni === total) return 'INICIACION_PURO';
  if (nIni > 0 && nAPlus === 0) return 'INICIACION_A';
  if (nAPlus > 0 && nIni === 0 && nA > 0) return 'A_A_PLUS';
  if (nA >= Math.max(nIni, nAPlus)) return 'A_PREDOMINANTE';
  return 'A_A_PLUS';
}

function formatearTrabajoDiarioApp(bloques: string[]) {
  return bloques
    .map((bloque) => String(bloque || '').trim())
    .filter(Boolean)
    .join('\n\n');
}

function planInicial(input: InputTrabajoDiario) {
  const perfilGrupo = perfilGrupoInicialApp(input);
  const alumnos = input.alumnos;
  const prioridades = alumnos.map((alumno) => ({
    alumno,
    prioridad: prioridadInicialAlumno(alumno),
  }));
  const cuenta = (patron: RegExp) =>
    prioridades.filter((item) => patron.test(textoPlano(item.prioridad))).length;

  const ejercicios: EjercicioTecnicoMSZ[] = [];
  const ids = new Set<string>();
  const agregar = (id: string) => {
    const e = EJERCICIOS_TECNICOS_MSZ.find((item) => item.id === id);
    if (e && !ids.has(id)) {
      ids.add(id);
      ejercicios.push(e);
    }
  };

  let objetivo = '';
  let organizacion = '';
  let progresion = '';
  let final = '';

  if (perfilGrupo === 'INICIACION_PURO') {
    objetivo = 'Confianza, deslizamiento, equilibrio y primeras frenadas en cuña.';
    organizacion =
      'Bajadas 1vs1. Mucha demostración y consignas simples. Trabajar entrada/salida de cinta desde el primer día.';
    agregar('deslizamiento-profesor');
    agregar('pizza-grande-pequena');
    agregar('semaforo-inicial');
    agregar('gigante-pequeno');
    progresion =
      'Cuando se mantenga de pie y frene con ayuda mínima, empezar dirección sencilla y más autonomía en cinta.';
    final =
      'Bajada libre muy corta y observada para comprobar confianza y frenada.';
  } else if (perfilGrupo === 'INICIACION_A') {
    objetivo =
      'Asentar cuña y frenada sin frenar la progresión del A que ya tenga más control.';
    organizacion =
      'Bajadas 1vs1. El Iniciación trabaja base; al A se le añade dirección cuando ya frena. No obligar a los dos a hacer exactamente lo mismo.';
    agregar('pizza-grande-pequena');
    agregar('semaforo-inicial');
    agregar('giro-aislado');
    agregar('seguir-huella');
    progresion =
      'El A progresa a giros enlazados cuando esté preparado; el Iniciación mantiene equilibrio, cuña y cinta.';
    final =
      'Una bajada observada por niño con su objetivo individual, no una tarea común forzada.';
  } else if (perfilGrupo === 'A_PREDOMINANTE') {
    objetivo = 'Frenar a demanda y empezar a girar de forma cada vez más autónoma.';
    organizacion =
      'Bajadas 1vs1. Quien ya domina cinta sube solo y espera arriba; el entrenador concentra tiempo en quien todavía necesita ayuda.';
    agregar('giro-aislado');
    agregar('giros-amplios-cuna');
    agregar('seguir-huella');
    agregar('semaforo-inicial');
    progresion =
      'Pasar de giros aislados a giros enlazados y reducir progresivamente la ayuda del entrenador.';
    final =
      'Bajada libre observada para comprobar frenada, dirección y autonomía.';
  } else if (perfilGrupo === 'A_A_PLUS') {
    const preparacionAPlus = resumenPreparacionAPlusGrupo(input);

    objetivo =
      preparacionAPlus.mayoria
        ? 'Enlazar giros, controlar velocidad y consolidar una dinámica de grupo que prepare a los A+ listos para pista grande.'
        : 'Enlazar giros y ganar autonomía real antes de plantear la transición a pista grande.';

    organizacion =
      preparacionAPlus.mayoria
        ? 'Combinar 1vs1 con secuencias cortas en fila. Los A consolidan giro; los A+ preparados practican salida, distancia, seguimiento y parada conjunta.'
        : 'Priorizar 1vs1 y autonomía en cinta. No convertir todavía la sesión en simulacro de pista grande si los A+ siguen necesitando ayuda para subir, esperar o salir.';

    agregar('giros-amplios-cuna');
    agregar('parar-profesor');
    agregar('seguir-huella');

    if (preparacionAPlus.mayoria) {
      agregar('simulacro-fila-a-plus');
    } else {
      agregar('semaforo-inicial');
    }

    progresion =
      preparacionAPlus.mayoria
        ? 'Los A+ preparados pasan a simulacro de grande; los demás mantienen cinta, frenada y giros hasta funcionar sin ayuda constante.'
        : 'Primero conseguir cinta autónoma, frenada a demanda y giros enlazados; después introducir dinámica de pista grande.';

    final =
      preparacionAPlus.mayoria
        ? 'Última bajada en fila corta para comprobar quién mantiene salida, distancia y parada conjunta.'
        : 'Última bajada individual observada para comprobar autonomía, frenada y giro sin ayuda.';
  } else {
    const numeroso = perfilGrupo === 'A_PLUS_NUMEROSO';
    const preparacionAPlus = resumenPreparacionAPlusGrupo(input);

    if (preparacionAPlus.mayoria) {
      objetivo =
        'Preparar el paso a pista grande: giros enlazados, control de velocidad, autonomía y funcionamiento en fila.';
      organizacion = numeroso
        ? 'Grupo A+ numeroso: tandas ordenadas y simulacro en fila. Los que todavía dependan de ayuda mantienen trabajo individual sin frenar a los preparados.'
        : 'Simular dinámica de pista grande desde pequeña: todos preparados arriba, salida ordenada, distancia, seguimiento y parada conjunta.';
      agregar('simulacro-fila-a-plus');
      agregar('giros-amplios-cuna');
      agregar('tren');
      agregar('parar-profesor');
      progresion =
        preparacionAPlus.todos
          ? 'Si mantienen control y fila sin ayuda, hacer prueba controlada en pista grande.'
          : 'Hacer prueba controlada en grande solo con los preparados; los demás continúan autonomía, frenada y giros en pequeña.';
      final =
        'Bajada completa en fila para comprobar salida, seguimiento, distancia y parada conjunta.';
    } else {
      objetivo =
        'Consolidar autonomía, frenada y giros enlazados antes de preparar el paso a pista grande.';
      organizacion = numeroso
        ? 'Grupo A+ numeroso pero todavía no preparado: tandas cortas, mucha autonomía de cinta y trabajo individual del punto que bloquea a cada niño.'
        : 'Mantener dinámica sencilla: subir solos cuando puedan, esperar correctamente y trabajar giros enlazados sin exigir todavía funcionamiento de pista grande.';
      agregar('giros-amplios-cuna');
      agregar('parar-profesor');
      agregar('seguir-huella');
      agregar('semaforo-inicial');
      progresion =
        'Introducir simulacro de pista grande únicamente cuando al menos la mayoría suba con autonomía, frene a demanda, enlace giros y funcione en fila.';
      final =
        'Bajada individual observada para comprobar autonomía, control y continuidad de giro.';
    }
  }


  const prioritarios: EjercicioTecnicoMSZ[] = [];
  const idsPrioritarios = new Set<string>();
  const priorizar = (id: string) => {
    const ejercicio = EJERCICIOS_TECNICOS_MSZ.find((item) => item.id === id);
    if (ejercicio && !idsPrioritarios.has(id)) {
      idsPrioritarios.add(id);
      prioritarios.push(ejercicio);
    }
  };

  const necesitaCinta = alumnos.some((alumno) => {
    const valor = puntuacionCinta(alumno.progresionInicial?.autonomiaCinta);
    return valor > 0 && valor < 4;
  });
  const necesitaFrenada = alumnos.some((alumno) => {
    const valor = puntuacionFrenada(alumno.progresionInicial?.cunaFrenada);
    return valor > 0 && valor < 4;
  });
  const necesitaGiro = alumnos.some((alumno) => {
    const valor = puntuacionGiro(alumno.progresionInicial?.giroInicial);
    return valor > 0 && valor < 4;
  });
  const necesitaEnlazar = alumnos.some((alumno) => {
    const valor = puntuacionGiro(alumno.progresionInicial?.giroInicial);
    return valor === 4;
  });
  const necesitaDinamica = alumnos.some((alumno) => {
    const valor = puntuacionDinamica(alumno.progresionInicial?.dinamicaAutonoma);
    return valor > 0 && valor < 4;
  });

  if (necesitaCinta) {
    priorizar('deslizamiento-profesor');
    priorizar('semaforo-inicial');
  }
  if (necesitaFrenada) {
    priorizar('pizza-grande-pequena');
    priorizar('semaforo-inicial');
  }
  if (necesitaGiro) {
    priorizar('giro-aislado');
    priorizar('terminar-giro-cuesta-arriba');
  }
  if (necesitaEnlazar) {
    priorizar('giros-amplios-cuna');
    priorizar('seguir-huella');
  }
  if (
    necesitaDinamica &&
    (perfilGrupo === 'A_A_PLUS' ||
      perfilGrupo === 'A_PLUS_PURO' ||
      perfilGrupo === 'A_PLUS_NUMEROSO')
  ) {
    priorizar('simulacro-fila-a-plus');
    priorizar('parar-profesor');
  }

  const ejerciciosSesion: EjercicioTecnicoMSZ[] = [];
  const idsSesion = new Set<string>();
  [...prioritarios, ...ejercicios].forEach((ejercicio) => {
    if (!ejercicio || idsSesion.has(ejercicio.id)) return;
    idsSesion.add(ejercicio.id);
    ejerciciosSesion.push(ejercicio);
  });

  const hayProblemaCuna = alumnos.some((alumno) => {
    const p = alumno.progresionInicial;
    const frenada = puntuacionFrenada(p?.cunaFrenada);
    const texto = textoPlano(
      [alumno.incidencia, alumno.observacionOperativa, input.observacionesGrupo].join(' ')
    );
    return (frenada > 0 && frenada <= 2) || /no abre cuna|no consigue.*cuna/.test(texto);
  });
  const hayCuneroRegistrado = alumnos.some((alumno) => {
    const t = textoPlano(alumno.progresionInicial?.ayudaCunero);
    return t && !/^no$|no utilizado/.test(t);
  });

  const bloques = [
    'CALENTAMIENTO · 3–5 min sin esquís: movilidad, equilibrio y activación sencilla al lado de pista.',
    `OBJETIVO · ${objetivo}`,
    'PRIMERA BAJADA · Libre/observada para comprobar cómo llega cada niño hoy.',
    `ORGANIZACIÓN · ${organizacion}`,
    [
      'TRABAJO',
      ...ejercicios.slice(0, 4).map((ejercicio) =>
        lineaTrabajoEjercicio(
          ejercicio,
          nivelDominante(input),
          faseTecnicaDominante(input)
        )
      ),
    ].join('\n'),
  ];

  if (
    perfilGrupo !== 'A_PLUS_PURO' &&
    perfilGrupo !== 'A_PLUS_NUMEROSO' &&
    (hayProblemaCuna || hayCuneroRegistrado)
  ) {
    bloques.push(
      'RECURSO PUNTUAL · Cuñero solo si el niño no consigue abrir la cuña: 1 bajada, retirar y comprobar transferencia sin ayuda.'
    );
  }

  bloques.push(`PROGRESIÓN · ${progresion}`, `FINAL · ${final}`);

  return formatearTrabajoDiarioApp(bloques);
}

const ORDEN_FASE_TECNICA: Record<FaseTecnicaMSZ, number> = {
  FAMILIARIZACION: 0,
  DESLIZAMIENTO: 1,
  CUNA: 2,
  GIROS_CUNA: 3,
  FUNDAMENTAL: 4,
  INICIO_PARALELO: 5,
  PARALELO_ELEMENTAL: 6,
  PARALELO_CONSOLIDADO: 7,
  CONDUCIDO: 8,
};

function normalizarFaseTecnica(valor: string): FaseTecnicaMSZ | null {
  const t = textoPlano(valor);
  if (!t) return null;
  if (/primer contacto|familiar/.test(t)) return 'FAMILIARIZACION';
  if (/deslizamiento directo/.test(t)) return 'DESLIZAMIENTO';
  if (/control de velocidad en cuna|cuna de frenado/.test(t)) return 'CUNA';
  if (/giros en cuna/.test(t)) return 'GIROS_CUNA';
  if (/fundamental/.test(t)) return 'FUNDAMENTAL';
  if (/inicio de paralelo/.test(t)) return 'INICIO_PARALELO';
  if (/paralelo elemental/.test(t)) return 'PARALELO_ELEMENTAL';
  if (/paralelo consolidado/.test(t)) return 'PARALELO_CONSOLIDADO';
  if (/viraje conducido|conducido|avanzado/.test(t)) return 'CONDUCIDO';
  return null;
}

function fasePorDefectoNivel(nivel: NivelTecnicoMSZ): FaseTecnicaMSZ {
  if (nivel === 'INICIACION') return 'FAMILIARIZACION';
  if (nivel === 'A') return 'CUNA';
  if (nivel === 'A+') return 'GIROS_CUNA';
  if (nivel === 'B') return 'GIROS_CUNA';
  if (nivel === 'B+') return 'FUNDAMENTAL';
  if (nivel === 'C') return 'INICIO_PARALELO';
  if (nivel === 'C+') return 'PARALELO_ELEMENTAL';
  if (nivel === 'D') return 'PARALELO_CONSOLIDADO';
  return 'CONDUCIDO';
}

function rangoFasePorNivel(
  nivel: NivelTecnicoMSZ
): [FaseTecnicaMSZ, FaseTecnicaMSZ] {
  if (nivel === 'INICIACION')
    return ['FAMILIARIZACION', 'CUNA'];
  if (nivel === 'A')
    return ['DESLIZAMIENTO', 'GIROS_CUNA'];
  if (nivel === 'A+')
    return ['CUNA', 'FUNDAMENTAL'];
  if (nivel === 'B')
    return ['GIROS_CUNA', 'FUNDAMENTAL'];
  if (nivel === 'B+')
    return ['GIROS_CUNA', 'INICIO_PARALELO'];
  if (nivel === 'C')
    return ['FUNDAMENTAL', 'PARALELO_ELEMENTAL'];
  if (nivel === 'C+')
    return ['INICIO_PARALELO', 'PARALELO_CONSOLIDADO'];
  if (nivel === 'D')
    return ['PARALELO_ELEMENTAL', 'CONDUCIDO'];
  return ['PARALELO_CONSOLIDADO', 'CONDUCIDO'];
}

function faseTecnicaDominante(input: InputTrabajoDiario) {
  const nivel = nivelDominante(input);
  const fases = input.alumnos
    .map((alumno) => normalizarFaseTecnica(alumno.tecnica || alumno.faseViraje || ''))
    .filter(Boolean) as FaseTecnicaMSZ[];

  if (fases.length === 0) return fasePorDefectoNivel(nivel);

  const conteo = new Map<FaseTecnicaMSZ, number>();
  fases.forEach((fase) => conteo.set(fase, (conteo.get(fase) || 0) + 1));
  const observada = Array.from(conteo.entries()).sort(
    (a, b) => b[1] - a[1]
  )[0][0];

  const [minima, maxima] = rangoFasePorNivel(nivel);
  const valor = ORDEN_FASE_TECNICA[observada];

  // Un reporte viejo o ficticio no debe arrastrar el trabajo diario a una
  // fase incompatible con el nivel observado actual.
  if (
    valor < ORDEN_FASE_TECNICA[minima] ||
    valor > ORDEN_FASE_TECNICA[maxima]
  ) {
    return fasePorDefectoNivel(nivel);
  }

  return observada;
}

function faseVirajeDominante(input: InputTrabajoDiario) {
  const fase = faseTecnicaDominante(input);
  const nombres: Record<FaseTecnicaMSZ, string> = {
    FAMILIARIZACION: 'Primer contacto / familiarización',
    DESLIZAMIENTO: 'Deslizamiento directo',
    CUNA: 'Cuña de frenado',
    GIROS_CUNA: 'Giros en cuña encadenados',
    FUNDAMENTAL: 'Fundamental',
    INICIO_PARALELO: 'Inicio de paralelo',
    PARALELO_ELEMENTAL: 'Paralelo elemental',
    PARALELO_CONSOLIDADO: 'Paralelo consolidado',
    CONDUCIDO: 'Viraje conducido / avanzado',
  };
  return nombres[fase];
}

function objetivoProgresionNivel(
  nivel: NivelTecnicoMSZ,
  faseViraje: string
) {
  const fase = normalizarFaseTecnica(faseViraje) || fasePorDefectoNivel(nivel);

  if (nivel === 'B') {
    if (fase === 'FUNDAMENTAL')
      return 'Mantener control en grande y fijar diagonales paralelas sin perder la calidad del giro';
    return 'Asentar giros en cuña encadenados y controlar velocidad mediante la trayectoria';
  }

  if (nivel === 'B+') {
    if (fase === 'INICIO_PARALELO')
      return 'Hacer aparecer el paralelo cada vez antes y con más continuidad';
    if (fase === 'FUNDAMENTAL')
      return 'Consolidar Fundamental: giro todavía con cuña y diagonal estable con esquís paralelos';
    return 'Reducir progresivamente la cuña y avanzar hacia Fundamental sin perder control';
  }

  if (nivel === 'C') {
    if (fase === 'FUNDAMENTAL')
      return 'Salir del Fundamental y conseguir que el paralelo aparezca durante una parte mayor del giro';
    if (fase === 'PARALELO_ELEMENTAL')
      return 'Consolidar paralelo elemental con apoyo exterior, postura y continuidad';
    return 'Hacer estable el inicio de paralelo y mejorar apoyo exterior';
  }

  if (nivel === 'C+') {
    if (fase === 'PARALELO_CONSOLIDADO')
      return 'Dar más precisión al paralelo consolidado mediante ritmo, trayectoria y cantos';
    return 'Conseguir un paralelo amplio y fluido con apoyo exterior y primeras sensaciones claras de cantos';
  }

  if (nivel === 'D') {
    if (fase === 'CONDUCIDO')
      return 'Aumentar precisión de conducción, presión y cambios de trayectoria';
    return 'Consolidar paralelo técnico con ritmo, apoyo exterior y trabajo serio de cantos';
  }

  if (nivel === 'D+') {
    return 'Refinar viraje conducido, presión, cantos, precisión y cambios de radio';
  }

  return 'Mejorar control, equilibrio y calidad de giro';
}

function objetivosSecundariosReporte(input: InputTrabajoDiario) {
  const texto = textoPlano(
    [
      input.observacionesGrupo,
      ...input.alumnos.flatMap((alumno) => [
        alumno.actitud,
        alumno.autonomia,
        alumno.incidencia,
        alumno.recomendacion,
        alumno.ritmo,
        alumno.fuerzaNivel,
        alumno.demandaAtencion,
        alumno.observacionOperativa,
        ...(alumno.remontes || []),
      ]),
    ].join(' ')
  );

  const objetivos: string[] = [];
  if (/miedo|llor|bloque|asust|nervi|agobia/.test(texto))
    objetivos.push('confianza');
  if (/sentad|postura|rigid|manos atras|brazos|mirada abajo/.test(texto))
    objetivos.push('postura');
  if (/sin control|no controla|se escapa|baja recto|velocidad exces/.test(texto))
    objetivos.push('control de velocidad');
  if (/lento para su nivel|ritmo lento/.test(texto))
    objetivos.push('ritmo');
  if (/muy rapido|muy rápido|fuerte para su nivel/.test(texto))
    objetivos.push('precisión');
  if (/necesita ayuda|ayuda constante|profesor constante/.test(texto))
    objetivos.push('autonomía');
  if (/fila|adelanta|no espera|despista|atencion|atención/.test(texto))
    objetivos.push('dinámica de grupo');
  if (/exterior.*debil|apoyo exterior.*debil|no carga exterior/.test(texto))
    objetivos.push('apoyo exterior');
  if (/cantos.*debil|sin canto|derrapa demasiado/.test(texto))
    objetivos.push('cantos');

  return Array.from(new Set(objetivos)).slice(0, 2);
}

function objetivoCortoPorNivelMixto(nivel: NivelTecnicoMSZ) {
  if (nivel === 'B') return 'B consolida cuña enlazada y control de velocidad';
  if (nivel === 'B+') return 'B+ reduce cuña y consolida Fundamental';
  if (nivel === 'C') return 'C mantiene paralelo y apoyo exterior';
  if (nivel === 'C+') return 'C+ añade fluidez, ritmo, trayectoria y cantos';
  if (nivel === 'D') return 'D trabaja precisión, ritmo y cantos';
  if (nivel === 'D+') return 'D+ aumenta conducción, presión y cambios de radio';
  return `${nivel} mantiene control y autonomía`;
}

function objetivoGrupoMixto(input: InputTrabajoDiario) {
  const niveles = nivelesDistintosGrupo(input);
  if (niveles.length <= 1) return '';

  const partes = niveles.map(objetivoCortoPorNivelMixto);
  const base =
    niveles.some((nivel) => nivel === 'B' || nivel === 'B+')
      ? 'Objetivo común: trabajar la misma línea con una exigencia técnica distinta para cada nivel.'
      : 'Objetivo común: trabajar la misma línea con una exigencia técnica distinta para cada nivel.';

  return `${base} ${partes.join('; ')}.`;
}


function resumenMotivoGrupo(input: InputTrabajoDiario) {
  const mixto = objetivoGrupoMixto(input);
  if (mixto) return mixto;

  const nivel = nivelDominante(input);
  const hayMiedoOBloqueo = input.alumnos.some((alumno) =>
    tieneRiesgo(alumno, 'miedo')
  );

  if (hayMiedoOBloqueo) {
    const baseConfianza = objetivoProgresionNivel(
      nivel,
      faseVirajeDominante(input)
    ).replace(/\.+$/, '');

    return `Recuperar confianza manteniendo una tarea técnica sencilla: ${baseConfianza.toLowerCase()}.`;
  }

  const fase = faseVirajeDominante(input);
  const base = objetivoProgresionNivel(nivel, fase).replace(/\.+$/, '');
  const basePlano = textoPlano(base);

  const secundarios = objetivosSecundariosReporte(input)
    .filter((item) => {
      const t = textoPlano(item);
      if (!t || basePlano.includes(t)) return false;
      if (
        /frenada|velocidad/.test(t) &&
        /fren|velocidad|control/.test(basePlano)
      )
        return false;
      if (/giro/.test(t) && /giro|curva|paralelo|cuna/.test(basePlano))
        return false;
      if (/apoyo exterior/.test(t) && /apoyo exterior/.test(basePlano))
        return false;
      if (/cantos/.test(t) && /canto|conduc/.test(basePlano))
        return false;
      if (/precision/.test(t) && ORDEN_NIVEL_MSZ[nivel] < ORDEN_NIVEL_MSZ['C+'])
        return false;
      return true;
    })
    .slice(0, 1);

  return secundarios.length
    ? `${base}. Atención principal: ${secundarios[0]}.`
    : `${base}.`;
}

function planBEnAdelante(input: InputTrabajoDiario) {
  const nivel = nivelDominante(input);
  const fase = faseTecnicaDominante(input);
  const pista = pistaNormalizada(input.pista);
  const estado = estadoSesionTecnica(input);
  const cantidadObjetivo = cantidadTrabajoPorEstado(input, estado);

  const ejercicios = elegirEjerciciosTecnicos(
    input,
    nivel,
    estado === 'CONSOLIDAR'
      ? Math.max(2, cantidadObjetivo)
      : Math.max(3, cantidadObjetivo)
  );
  const familias = new Set(
    ejercicios.map((ejercicio) => familiaEjercicio(ejercicio))
  );
  const juego = elegirJuego(input, nivel, familias);

  const trabajo: EjercicioTecnicoMSZ[] = [];
  const ids = new Set<string>();
  const agregar = (ejercicio: EjercicioTecnicoMSZ | null) => {
    if (!ejercicio || ids.has(ejercicio.id)) return;
    ids.add(ejercicio.id);
    trabajo.push(ejercicio);
  };

  ejercicios.forEach(agregar);

  if (
    juego &&
    trabajo.length < cantidadObjetivo &&
    (estado !== 'CONSOLIDAR' ||
      detectarObjetivos(input).some((objetivo) =>
        ['confianza', 'dinamica_grupo'].includes(objetivo)
      ))
  ) {
    agregar(juego);
  }

  trabajo.sort(
    (a, b) =>
      prioridadSecuenciaPedagogica(a) - prioridadSecuenciaPedagogica(b) ||
      ordenPedagogicoEjercicio(a) - ordenPedagogicoEjercicio(b)
  );

  const reto =
    estado === 'RETAR' && pista === 'GRANDE'
      ? elegirReto(input, nivel)
      : null;

  const hayMiedoOBloqueo = input.alumnos.some((alumno) =>
    tieneRiesgo(alumno, 'miedo')
  );

  const ritmoLento = grupoConRitmoLento(input);

  let progresion = '';
  if (hayMiedoOBloqueo) {
    progresion =
      'Mantener el mismo terreno y dificultad hasta recuperar confianza; después repetir el ejercicio técnico que mejor haya funcionado.';
  } else if (nivel === 'B') {
    progresion =
      fase === 'FUNDAMENTAL'
        ? 'Si mantiene control, alargar la diagonal paralela sin abrir más cuña al iniciar el siguiente giro.'
        : 'Si enlaza la cuña con control, reducir ligeramente su apertura y cerrar mejor cada giro.';
  } else if (nivel === 'B+') {
    progresion =
      fase === 'INICIO_PARALELO'
        ? 'Si aparece paralelo, mantenerlo durante una parte mayor del giro sin aumentar velocidad.'
        : 'Si el Fundamental es estable, buscar que los esquís se pongan paralelos antes de terminar el giro.';
  } else if (nivel === 'C') {
    progresion =
      'Si mantiene paralelo y apoyo exterior, aumentar continuidad y ritmo sin volver a abrir cuña.';
  } else if (nivel === 'C+') {
    progresion =
      'Si el paralelo es fluido, añadir más precisión de cantos o variar trayectoria manteniendo el mismo control.';
  } else if (nivel === 'D') {
    progresion =
      'Si mantiene precisión, aumentar exigencia de cantos, ritmo o cambio de radio sin perder calidad.';
  } else {
    progresion =
      'Si mantiene conducción y presión, combinar cambios de radio o ritmo sin perder limpieza de trayectoria.';
  }

  const nivelesMixtos = nivelesDistintosGrupo(input);
  if (nivelesMixtos.length > 1 && !hayMiedoOBloqueo) {
    const progresiones = nivelesMixtos.map((nivel) => {
      if (nivel === 'B')
        return 'B progresa solo si mantiene cuña enlazada y control';
      if (nivel === 'B+')
        return 'B+ progresa si reduce cuña y estabiliza Fundamental';
      if (nivel === 'C')
        return 'C progresa si mantiene paralelo y apoyo exterior';
      if (nivel === 'C+')
        return 'C+ progresa si mantiene fluidez, ritmo y trayectoria';
      if (nivel === 'D')
        return 'D progresa si aumenta precisión y cantos sin perder ritmo';
      if (nivel === 'D+')
        return 'D+ progresa si aumenta conducción o cambia radio sin perder limpieza';
      return `${nivel} progresa solo si mantiene control`;
    });

    progresion =
      `No subir todo el grupo al mismo escalón. ${progresiones.join('; ')}.`;
  }

  if (ritmoLento && !hayMiedoOBloqueo) {
    progresion =
      `No aumentar dificultad hasta enlazar varias bajadas con control. ${progresion}`;
  }

  if (estado === 'CONSOLIDAR' && !hayMiedoOBloqueo && !ritmoLento) {
    progresion =
      `Hoy no hace falta subir escalón técnico. Repetir la tarea que mejor funcione hasta verla estable en varias bajadas. ${progresion}`;
  }

  if (reto && !ritmoLento) {
    const textoReto = textoCoachingEjercicio(reto, nivel, fase).replace(/\.+$/, '');
    progresion += ` Como reto puntual: ${reto.nombre} — ${textoReto}.`;
  }

  const final =
    'Bajada libre observada: comprobar si aparece lo trabajado sin recordar la consigna durante la bajada.';

  const bloques = [
    'CALENTAMIENTO · 3–5 min sin esquís: movilidad, equilibrio y activación sencilla al lado de pista.',
    `OBJETIVO · ${resumenMotivoGrupo(input)}`,
    `ESTADO · ${textoEstadoSesion(estado)}`,
    'PRIMERA BAJADA · Libre/observada para confirmar el nivel y el ritmo real del grupo ese día.',
    hayMiedoOBloqueo
      ? 'ORGANIZACIÓN · Mantener terreno conocido, consigna única y tareas fáciles de repetir. Priorizar confianza antes de subir dificultad.'
      : '',
    [
      'TRABAJO',
      ...trabajo.slice(0, cantidadObjetivo).map((ejercicio) =>
        lineaTrabajoEjercicioMixto(ejercicio, input, nivel, fase)
      ),
    ].join('\n'),
    notaGrupoMixto(input),
    `PROGRESIÓN · ${progresion}`,
    `FINAL · ${final}`,
  ];

  return formatearTrabajoDiarioApp(bloques);
}

export function generarTrabajoDiarioInteligenteApp(
  input: InputTrabajoDiario
) {
  // Este motor NO forma grupos y NO cambia alumnos. Recibe un grupo ya
  // decidido por el recomendador existente y únicamente propone trabajo.
  if (soloNivelesIniciales(input)) {
    return planInicial(input);
  }

  return planBEnAdelante(input);
}
