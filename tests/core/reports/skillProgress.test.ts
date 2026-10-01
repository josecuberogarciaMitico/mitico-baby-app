import {
  estadoHabilidad,
  progresoHabilidadesNivel,
  puntosDeValor,
  resumenProgreso,
  valoracionesPorDia,
  type ValoracionHabilidad,
} from '../../../src/core/reports/skillProgress';
import type { HistorialReporteAlumnoFichaApp } from '../../../src/core/reports/reportTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

const v = (fecha: string, puntos: 0 | 1 | 2): ValoracionHabilidad => ({ fecha, puntos, modalidad: 'Ocio' });

function reporte(fecha: string, nivel: string, evaluacion: Record<string, string>, modalidad = 'Ocio'): HistorialReporteAlumnoFichaApp {
  return {
    reporte_id: `${fecha}-${nivel}`, fecha, modalidad, grupo: null, entrenador: null, nivel_reportado: nivel,
    actitud: null, tecnica: null, pista: null, remontes: null, autonomia: null, ritmo_grupo: null, mejora_hoy: null,
    incidencia: null, recomendacion: null, observaciones_generales: null, trabajo_diario: null, enviado_at: null,
    evaluacion_tecnica: evaluacion as never, reporte_version: 2,
  };
}

test('escala: «Correcto» antiguo cuenta como «A veces» (decisión de Jose)', () => {
  equal(puntosDeValor('Necesita mejorar'), 0, 'todavía no');
  equal(puntosDeValor('En desarrollo'), 1, 'a veces');
  equal(puntosDeValor('Correcto'), 1, 'correcto = a veces');
  equal(puntosDeValor('Consolidado'), 2, 'lo consigue');
  equal(puntosDeValor('No trabajado'), null, 'no visto');
  equal(puntosDeValor(undefined), null, 'vacío');
});

test('conseguido = lo consigue en las 2 últimas, en días distintos', () => {
  equal(estadoHabilidad([]), 'sin_ver', 'sin valoraciones');
  equal(estadoHabilidad([v('2026-10-01', 2)]), 'va_apareciendo', 'una sola vez no basta');
  equal(estadoHabilidad([v('2026-10-01', 2), v('2026-10-01', 2)]), 'va_apareciendo', 'mismo día no cuenta dos veces');
  equal(estadoHabilidad([v('2026-09-27', 2), v('2026-10-01', 2)]), 'conseguido', 'dos días distintos');
  equal(estadoHabilidad([v('2026-10-04', 1), v('2026-10-01', 2), v('2026-09-27', 2)]), 'va_apareciendo', 'si baja deja de estar conseguido');
  equal(estadoHabilidad([v('2026-10-04', 0), v('2026-10-01', 2)]), 'todavia_no', 'último todavía no');
});

test('una valoración por día, la más reciente primero', () => {
  const d = valoracionesPorDia([v('2026-09-20', 0), v('2026-10-01', 2), v('2026-09-20', 1)]);
  equal(d.map((x) => x.fecha).join(','), '2026-10-01,2026-09-20', 'orden y sin repetir');
});

test('solo cuentan los reportes del nivel actual (al subir, empieza de cero)', () => {
  const historial = [
    reporte('2026-10-04', 'C+', { paralelismo: 'En desarrollo' }),
    reporte('2026-10-01', 'C', { paralelismo: 'Consolidado' }),
    reporte('2026-09-27', 'C', { paralelismo: 'Consolidado', canteo: 'Necesita mejorar' }, 'Baby'),
  ];
  const enC = progresoHabilidadesNivel(historial, 'C');
  equal(enC.find((p) => p.habilidad.id === 'paralelismo')?.estado, 'conseguido', 'paralelismo conseguido en C (Ocio + Baby)');
  const enCmas = progresoHabilidadesNivel(historial, 'C+');
  equal(enCmas.find((p) => p.habilidad.id === 'paralelismo')?.estado, 'va_apareciendo', 'en C+ empieza de cero');
  equal(enCmas.find((p) => p.habilidad.id === 'canteo')?.estado, 'sin_ver', 'canteo de C no cuenta en C+');
  equal(enCmas[0].habilidad.foco, true, 'focos primero');
  equal(progresoHabilidadesNivel(historial, '').length, 0, 'sin nivel → vacío');
});

test('resumen de cabecera', () => {
  const r = resumenProgreso(progresoHabilidadesNivel([
    reporte('2026-10-01', 'A', { cuna_frenada: 'Consolidado' }),
    reporte('2026-09-27', 'A', { cuna_frenada: 'Consolidado' }),
  ], 'A'));
  equal(r.focos, 3, 'A tiene 3 focos');
  equal(r.focosConseguidos, 1, 'cuña conseguida');
});
