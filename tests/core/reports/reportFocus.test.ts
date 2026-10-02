import {
  FOCOS_POR_NIVEL,
  PASOS_REPORTE,
  competenciasReporte,
  habilidadesDelNivel,
  habilidadesDelTrabajoDeHoy,
  actitudParaGuardar,
  nivelesVecinos,
  opcionesActitudDestacar,
  opcionesAutonomiaPasos,
  prepararEnvioReporteFocos as prepararSinNotas,
  remontesPorDefecto,
  ritmoDesdeNivel,
} from '../../../src/lib/adaptiveReport';
import { TECHNICAL_LEVELS } from '../../../src/core/levels/levelContract';
import { TECHNICAL_REPORT_SCALE } from '../../../src/core/reports/reportTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

// Las notas por habilidad son obligatorias (02/10): por defecto se rellenan
// para cada habilidad valorada; un test concreto comprueba que faltan.
type FormPrueba = Parameters<typeof prepararSinNotas>[0];
function prepararEnvioReporteFocos(form: FormPrueba, partida: string) {
  const notas = form.notasHabilidades ?? Object.fromEntries(
    Object.keys(form.evaluacionTecnica || {}).map((id) => [id, 'Nota de prueba con detalle'])
  );
  return prepararSinNotas({ ...form, notasHabilidades: notas }, partida);
}

const base = {
  nivel: 'C',
  actitud: 'Muy buena',
  autonomia: 'Autónomo en pista grande',
  incidencia: 'Sin incidencia',
  observaciones: 'Ya no abre las colas.',
  remontes: '',
  cunaFrenada: '',
  giroInicial: '',
  evaluacionTecnica: { paralelismo: 'Consolidado', rotacion_piernas: 'Necesita mejorar' } as const,
};

test('todos los focos aprobados existen en las competencias de su nivel', () => {
  TECHNICAL_LEVELS.forEach((nivel) => {
    const ids = new Set(competenciasReporte(nivel).map((c) => c.id));
    const focos = FOCOS_POR_NIVEL[nivel];
    equal(focos.length >= 3 && focos.length <= 4, true, `nivel ${nivel} tiene 3-4 focos`);
    focos.forEach((f) => equal(ids.has(f.id), true, `${nivel}: ${f.id} pertenece a su nivel`));
  });
});

test('focos aprobados por Jose (01/10)', () => {
  equal(FOCOS_POR_NIVEL.C.map((f) => f.id).join(','), 'paralelismo,apoyo_exterior_presion,rotacion_piernas,flexion_extension', 'C');
  equal(FOCOS_POR_NIVEL['D+'].map((f) => f.id).join(','), 'conduccion_presion,transicion,flexion_extension_presion,radio_trayectoria', 'D+');
  equal(FOCOS_POR_NIVEL.A.map((f) => f.id).join(','), 'cuna_frenada,control_velocidad,direccion_giro', 'A');
});

test('la escala de 3 pasos usa valores que Supabase ya acepta', () => {
  PASOS_REPORTE.forEach((p) => equal((TECHNICAL_REPORT_SCALE as readonly string[]).includes(p.valor), true, p.etiqueta));
});

test('habilidades del nivel: focos primero y no se pierde ninguna competencia', () => {
  const h = habilidadesDelNivel('C');
  equal(h.length, competenciasReporte('C').length, 'mismo número');
  equal(h.slice(0, 4).every((x) => x.foco), true, 'focos primero');
  equal(h.slice(4).every((x) => !x.foco), true, 'base después');
});

test('trabajo de hoy: elige las habilidades del nivel que se han trabajado', () => {
  const trabajo = 'OBJETIVO · Cuña / frenada, paralelismo y apoyo exterior con ritmo';
  equal(habilidadesDelTrabajoDeHoy('C', trabajo).join(','), 'paralelismo,apoyo_exterior_presion,ritmo_coordinacion', 'C');
  equal(habilidadesDelTrabajoDeHoy('C', '').join(','), 'paralelismo,apoyo_exterior_presion,rotacion_piernas,flexion_extension', 'sin trabajo → focos');
});

test('niveles vecinos', () => {
  const v = nivelesVecinos('C');
  equal(`${v.anterior}|${v.actual}|${v.siguiente}`, 'B+|C|C+', 'C');
  equal(nivelesVecinos('INICIACION').anterior, null, 'sin anterior');
  equal(nivelesVecinos('D+').siguiente, null, 'sin siguiente');
  equal(nivelesVecinos('').actual, null, 'sin nivel');
});

test('remontes por defecto según el nivel', () => {
  equal(remontesPorDefecto('A'), 'Cinta', 'A');
  equal(remontesPorDefecto('A+'), 'Cinta', 'A+');
  equal(remontesPorDefecto('B'), 'Percha y silla', 'B');
  equal(remontesPorDefecto('C'), 'Percha y silla', 'C');
});

test('ritmo deducido del nivel elegido frente al de partida', () => {
  equal(ritmoDesdeNivel('C', 'C'), 'Adecuado para su nivel', 'igual');
  equal(ritmoDesdeNivel('C+', 'C'), 'Muy rápido · podría ir con nivel superior', 'por encima');
  equal(ritmoDesdeNivel('B+', 'C'), 'Lento para su nivel', 'por debajo');
  equal(ritmoDesdeNivel('C', ''), 'Adecuado para su nivel', 'sin partida');
});

test('envío válido: calcula mejoras, prioridades, ritmo y remontes', () => {
  const r = prepararEnvioReporteFocos(base, 'C');
  if (!r.ok) throw new Error(r.error);
  equal(r.envio.nivel, 'C', 'nivel');
  equal(r.envio.mejorasHoy.join(','), 'Paralelismo', 'mejoras = lo que consigue');
  equal(r.envio.prioridades.join(','), 'Rotación de piernas', 'prioridades = focos sin conseguir');
  equal(r.envio.ritmoGrupo, 'Adecuado para su nivel', 'ritmo');
  equal(r.envio.remontes, 'Percha y silla', 'remontes por defecto');
});

test('si cambia el nivel, se añade «Revisar nivel»', () => {
  const r = prepararEnvioReporteFocos({ ...base, nivel: 'C+', evaluacionTecnica: { paralelismo: 'En desarrollo' } }, 'C');
  if (!r.ok) throw new Error(r.error);
  equal(r.envio.prioridades.includes('Revisar nivel'), true, 'revisar nivel');
  equal(r.envio.mejorasHoy.join(','), 'Paralelismo', 'a veces cuenta como mejora si no hay nada conseguido');
});

test('validaciones con mensajes claros', () => {
  const casos: Array<[Partial<typeof base>, string]> = [
    [{ nivel: '' }, 'nivel'],
    [{ evaluacionTecnica: {} as never }, 'habilidad'],
    [{ actitud: '' }, 'actitud'],
    [{ autonomia: '' }, 'autonomía'],
    [{ incidencia: '' }, 'ha pasado'],
  ];
  casos.forEach(([cambio, palabra]) => {
    const r = prepararEnvioReporteFocos({ ...base, ...cambio }, 'C');
    equal(r.ok, false, `debe fallar: ${palabra}`);
    if (!r.ok) equal(r.error.toLowerCase().includes(palabra), true, `mensaje menciona ${palabra}`);
  });
});

test('habilidad no valorada de otro nivel no cuenta', () => {
  const r = prepararEnvioReporteFocos({ ...base, evaluacionTecnica: { cuna_frenada: 'Consolidado' } as never }, 'C');
  equal(r.ok, false, 'cuña no es de C');
});

test('niveles iniciales: deriva cuña y giro para el trabajo diario', () => {
  const ini = prepararEnvioReporteFocos({ ...base, nivel: 'INICIACION', evaluacionTecnica: { cuna_frenada: 'Consolidado', direccion_giro: 'En desarrollo' } as never }, 'INICIACION');
  if (!ini.ok) throw new Error(ini.error);
  equal(ini.envio.cunaFrenada, 'Cuña funcional', 'cuña INI');
  equal(ini.envio.giroInicial, 'Gira solo hacia un lado', 'giro INI');
  equal(ini.envio.remontes, 'Cinta', 'remonte INI');
  const aMas = prepararEnvioReporteFocos({ ...base, nivel: 'A+', evaluacionTecnica: { giros_cuna_encadenados: 'Consolidado', cuna_frenada: 'Consolidado' } as never }, 'A+');
  if (!aMas.ok) throw new Error(aMas.error);
  equal(aMas.envio.giroInicial, 'Enlaza giros en cuña', 'giro A+');
  equal(aMas.envio.cunaFrenada, 'Frena a demanda', 'cuña A+');
});

test('actitud: general obligatoria y «algo a destacar» con lo más importante en la columna', () => {
  equal(prepararEnvioReporteFocos({ ...base, actitud: 'Disperso' }, 'C').ok, false, 'Disperso no es actitud general');
  const sin = prepararEnvioReporteFocos(base, 'C');
  if (!sin.ok) throw new Error(sin.error);
  equal(sin.envio.actitud, 'Muy buena', 'sin destacar → general');
  equal(sin.envio.actitudDetalle.length, 0, 'sin detalle no se envía nada nuevo');
  const con = prepararEnvioReporteFocos({ ...base, actitud: 'Buena', actitudDestacar: ['Cansado', 'Miedo'] }, 'C');
  if (!con.ok) throw new Error(con.error);
  equal(con.envio.actitud, 'Miedo', 'miedo pesa más que cansado');
  equal(con.envio.actitudDetalle.join(','), 'Buena,Cansado,Miedo', 'detalle completo');
  equal(actitudParaGuardar('Correcta', ['Cansado']), 'Cansado', 'cansado');
});

test('actitud a destacar: valores que acepta la base de datos', () => {
  const permitidos = ['Disperso', 'Se bloquea', 'Miedo', 'Cansado', 'No escucha', 'Llora'];
  ['OCIO', 'BABY'].forEach((m) => opcionesActitudDestacar(m).forEach((o) => equal(permitidos.includes(o.valor), true, `${m} ${o.valor}`)));
  equal(opcionesActitudDestacar('OCIO').some((o) => o.etiqueta === 'No sigue consignas'), true, 'texto de Ocio');
});

test('autonomía en 3 pasos coherentes, «Va solo» según el nivel', () => {
  const permitidos = ['Necesita ayuda constante', 'Necesita ayuda puntual', 'Autónomo en llano', 'Autónomo en pista pequeña', 'Autónomo en pista grande', 'Autónomo total'];
  TECHNICAL_LEVELS.forEach((n) => {
    const o = opcionesAutonomiaPasos(n);
    equal(o.length, 3, `${n} 3 pasos`);
    o.forEach((x) => equal(permitidos.includes(x.valor), true, `${n} ${x.valor}`));
  });
  equal(opcionesAutonomiaPasos('INICIACION')[2].valor, 'Autónomo en llano', 'INI');
  equal(opcionesAutonomiaPasos('A+')[2].valor, 'Autónomo en pista pequeña', 'A+');
  equal(opcionesAutonomiaPasos('B')[2].valor, 'Autónomo en pista grande', 'B');
  equal(opcionesAutonomiaPasos('D')[2].valor, 'Autónomo total', 'D');
});

test('notas por habilidad: obligatorias en cada habilidad valorada; la observación es opcional', () => {
  const sinNota = prepararSinNotas({ ...base, notasHabilidades: { paralelismo: 'Ya junta en la parte fácil' } }, 'C');
  equal(sinNota.ok, false, 'falta la nota de rotación');
  if (!sinNota.ok) equal(sinNota.error.includes('Rotación de piernas'), true, 'dice qué habilidad');
  const corta = prepararSinNotas({ ...base, notasHabilidades: { paralelismo: 'bien', rotacion_piernas: 'El tronco acompaña el giro' } }, 'C');
  equal(corta.ok, false, '«bien» no basta');
  const ok = prepararSinNotas({ ...base, observaciones: '', notasHabilidades: { paralelismo: '  Ya junta en la parte fácil ', rotacion_piernas: 'El tronco acompaña el giro', canteo: 'no es de C' } }, 'C');
  if (!ok.ok) throw new Error(ok.error);
  equal(ok.envio.notasHabilidades.paralelismo, 'Ya junta en la parte fácil', 'se recorta');
  equal('canteo' in ok.envio.notasHabilidades, false, 'solo notas de habilidades valoradas');
  const larga = prepararSinNotas({ ...base, notasHabilidades: { paralelismo: 'x'.repeat(301), rotacion_piernas: 'El tronco acompaña el giro' } }, 'C');
  equal(larga.ok, false, 'máximo 300');
});
