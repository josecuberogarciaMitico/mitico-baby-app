import { notasPorHabilidad, seccionNotasEntrenadores } from '../../../src/core/reports/skillNotes';
import { buildIntensiveDiplomaBase } from '../../../src/core/evaluations/intensiveEvaluation';
import type { HistorialReporteAlumnoFichaApp } from '../../../src/core/reports/reportTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function ok(cond: boolean, label: string) {
  if (!cond) throw new Error(label);
}
function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

function reporte(fecha: string, nivel: string, ev: Record<string, string>, notas: Record<string, string>): HistorialReporteAlumnoFichaApp {
  return {
    reporte_id: fecha, fecha, modalidad: 'OCIO', grupo: null, entrenador: 'PEPE', nivel_reportado: nivel,
    actitud: 'Buena', tecnica: null, pista: null, remontes: null, autonomia: null, ritmo_grupo: null, mejora_hoy: null,
    incidencia: 'Caída fuerte', recomendacion: null, observaciones_generales: null, trabajo_diario: null, enviado_at: null,
    evaluacion_tecnica: ev as never, notas_habilidades: notas, reporte_version: 2,
  };
}

const historial = [
  reporte('2026-10-09', 'C', { paralelismo: 'Consolidado' }, { paralelismo: 'Ya junta los esquís en toda la bajada' }),
  reporte('2026-10-02', 'B+', { paralelismo: 'Necesita mejorar', transicion: 'En desarrollo' }, { paralelismo: 'Abre el esquí de dentro al girar', transicion: 'Le cuesta enlazar' }),
  reporte('2026-10-05', 'B+', { paralelismo: 'En desarrollo' }, { paralelismo: '  abre el esquí de dentro al girar ', transicion: '' }),
];
const fmt = (f: string) => f.split('-').reverse().slice(0, 2).join('/');

test('agrupa por habilidad, en orden de fechas, sin repetir ni vacías', () => {
  const g = notasPorHabilidad(historial);
  equal(g.length, 2, 'dos habilidades');
  equal(g[0].nombre, 'Paralelismo', 'primero la que más notas tiene');
  equal(g[0].notas.map((n) => n.fecha).join(','), '2026-10-02,2026-10-09', 'cronológico y sin duplicado');
  equal(g[0].notas[0].paso, 'Todavía no', 'paso del día');
  equal(g[0].notas[1].nivel, 'C', 'nivel del día');
  ok(g[0].ayuda.length > 0, 'explicación de la habilidad');
});

test('sección para ChatGPT: vacía sin notas; con notas lleva nivel, paso y nota', () => {
  equal(seccionNotasEntrenadores([], fmt).length, 0, 'sin notas no hay sección');
  const s = seccionNotasEntrenadores(historial, fmt).join('\n');
  ok(s.includes('LO QUE HAN ESCRITO SUS ENTRENADORES'), 'título');
  ok(s.includes('  • 02/10 (B+ · Todavía no): Abre el esquí de dentro al girar'), 'línea con detalle');
  ok(s.includes('  • 09/10 (C · Lo consigue): Ya junta los esquís en toda la bajada'), 'evolución');
  ok(!/Caída|PEPE/.test(s), 'sin incidencias ni entrenadores');
});

test('el diploma de Intensivos incluye las notas cuando la vista las trae', () => {
  const registro = { intensivo: 'Navidad', alumno: 'LUCAS' } as never;
  const dia = { numero_dia: 1, fecha: '2026-12-27', nombre_grupo: 'G1', entrenador: 'PEPE', nivel_reportado: 'C', evaluacion_tecnica: { paralelismo: 'Consolidado' }, notas_habilidades: { paralelismo: 'Ya va con los esquís juntos' } } as never;
  const deps = { formatDate: fmt, levelCodeById: () => '-', summarizeTechnicalEvaluation: () => '' };
  const t = buildIntensiveDiplomaBase(registro, [dia], deps);
  ok(t.includes('• 27/12 (C · Lo consigue): Ya va con los esquís juntos'), 'nota en el diploma');
  ok(t.indexOf('LO QUE HAN ESCRITO') < t.indexOf('REPORTES DÍA A DÍA'), 'antes del día a día');
  const sinVista = buildIntensiveDiplomaBase(registro, [{ ...(dia as object), notas_habilidades: undefined } as never], deps);
  ok(!sinVista.includes('LO QUE HAN ESCRITO'), 'sin la migración: como antes');
});

import { textoBrutoAlumno } from '../../../src/core/reports/rawStudentExport';

test('todo en bruto: todos los reportes y campos, incidencias y campos desconocidos incluidos', () => {
  const conExtra = historial.map((r, i) => ({
    ...r,
    observaciones_generales: i === 0 ? 'Muy contento hoy' : null,
    trabajo_diario: 'OBJETIVO · Paralelo\nJuego de las ranas',
    campo_nuevo: i === 1 ? 'dato que la app no conoce' : null,
  }));
  const t = textoBrutoAlumno({
    alumno: 'LUCAS',
    edad: 9,
    nivelFicha: 'C',
    reportes: conExtra as never,
    formatDate: fmt,
    extra: { titulo: 'Datos de la temporada de Ocio', datos: { alumno_id: 'x', asistencia_ocio_pct: 85, remontes_finales: ['Telesilla'] } },
  });
  ok(t.startsWith('TODO LO REGISTRADO DE LUCAS'), 'cabecera');
  equal((t.match(/^■ /gm) || []).length, 3, 'los 3 reportes');
  ok(t.indexOf('■ 02/10') < t.indexOf('■ 05/10') && t.indexOf('■ 05/10') < t.indexOf('■ 09/10'), 'cronológico');
  ok(t.includes('Incidencia: Caída fuerte'), 'incidencias incluidas');
  ok(t.includes('Entrenador: PEPE'), 'entrenador incluido');
  ok(t.includes('Observaciones: Muy contento hoy'), 'observaciones');
  ok(t.includes('Campo nuevo: dato que la app no conoce'), 'campos desconocidos');
  ok(t.includes('- Paralelismo: Todavía no — «Abre el esquí de dentro al girar»'), 'habilidad con paso y nota');
  ok(t.includes('Asistencia ocio pct: 85') && t.includes('Remontes finales: Telesilla'), 'datos extra');
  ok(!t.includes('alumno_id') && !t.includes('Reporte id'), 'sin identificadores');
  ok(t.includes('Trabajo del grupo (último guardado): igual que el reporte anterior'), 'trabajo del grupo sin repetir');
  ok(t.includes('LO QUE HAN ESCRITO SUS ENTRENADORES'), 'notas agrupadas al final');
});
