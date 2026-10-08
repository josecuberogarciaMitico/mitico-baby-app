import {
  bloquesCartaFamilia,
  limpiarCarta,
  nombreArchivoCarta,
  nombreDePila,
  recorridoNiveles,
  textoParaChatGPT,
  type DatosCartaFamilia,
} from '../../../src/core/reports/familyLetter';
import { progresoHabilidadesNivel } from '../../../src/core/reports/skillProgress';
import { generarPdfSimple } from '../../../src/features/billing/simplePdf';
import type { HistorialReporteAlumnoFichaApp } from '../../../src/core/reports/reportTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) {
    throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
  }
}

function ok(cond: boolean, label: string) {
  if (!cond) throw new Error(label);
}

function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

function reporte(fecha: string, nivel: string, cambios: Partial<HistorialReporteAlumnoFichaApp> = {}): HistorialReporteAlumnoFichaApp {
  return {
    reporte_id: fecha, fecha, modalidad: 'OCIO', grupo: 'G1', entrenador: 'PEPE GARCÍA', nivel_reportado: nivel,
    actitud: 'Muy buena', tecnica: null, pista: null, remontes: ['Telesilla'], autonomia: 'Autónomo en pista grande',
    ritmo_grupo: null, mejora_hoy: null, incidencia: 'Caída fuerte en la pista roja', recomendacion: null,
    observaciones_generales: 'NOTA INTERNA: hablar con la madre', trabajo_diario: null, enviado_at: null,
    evaluacion_tecnica: {}, reporte_version: 2, actitud_comentario: 'Llora', ...cambios,
  };
}

const reportes = [
  reporte('2026-10-01', 'C', {
    evaluacion_tecnica: { paralelismo: 'Consolidado', rotacion_piernas: 'En desarrollo' } as never,
    notas_habilidades: { paralelismo: 'Ya junta los esquís en toda la bajada', rotacion_piernas: 'Gira más con la cadera que con las piernas' },
  }),
  reporte('2026-09-27', 'C', { evaluacion_tecnica: { paralelismo: 'Consolidado' } as never, actitud: 'Miedo' }),
  reporte('2026-09-20', 'B+', { actitud: 'Correcta' }),
];

const datos: DatosCartaFamilia = {
  nombre: 'LUCAS GARCÍA PÉREZ',
  edad: 9,
  nivel: 'C',
  reportes,
  progreso: progresoHabilidadesNivel(reportes, 'C'),
  formatDate: (f) => f.split('-').reverse().join('/'),
};

test('nombre de pila y recorrido de niveles', () => {
  equal(nombreDePila('LUCAS GARCÍA PÉREZ'), 'Lucas', 'pila');
  equal(nombreDePila(''), 'el alumno', 'vacío');
  equal(recorridoNiveles(reportes).join(' → '), 'B+ → C', 'recorrido cronológico');
  equal(nombreArchivoCarta('LUCAS / GARCÍA'), 'Carta familia - LUCAS GARCÍA.pdf', 'archivo');
});

test('el resumen para ChatGPT lleva habilidades y notas, nunca incidencias ni notas internas', () => {
  const t = textoParaChatGPT(datos);
  ok(t.includes('Lucas (9 años)'), 'nombre y edad');
  ok(!t.includes('GARCÍA'), 'sin apellidos');
  ok(!t.includes('PEPE'), 'sin entrenador');
  ok(t.includes('Paralelismo') || t.includes('paralelismo'), 'habilidad');
  ok(t.includes('Conseguido'), 'paralelismo conseguido');
  ok(t.includes('Ya junta los esquís en toda la bajada'), 'nota del entrenador');
  ok(t.includes('B+ → C'), 'recorrido de niveles');
  ok(t.includes('buena o muy buena en 1 de 2 sesiones'), 'actitud solo con valores generales');
  ok(!/caída|NOTA INTERNA|Llora|Miedo/i.test(t), 'sin incidencias, observaciones internas ni «algo a destacar»');
  ok(t.includes('Telesilla'), 'remontes');
});

test('limpiar la carta de ChatGPT (negritas, títulos, emojis)', () => {
  equal(limpiarCarta('## Hola\n\n**Lucas** va genial 🎿⛷️\n\n\n\n- uno'), 'Hola\n\nLucas va genial\n\n• uno', 'limpia');
  equal(limpiarCarta('juntos 🎿. Y sigue ⛷️ igual'), 'juntos. Y sigue igual', 'sin espacio suelto');
});

test('PDF de la carta: párrafos, tabla opcional y PDF válido', () => {
  const carta = 'Hola, familia:\n\nLucas ha avanzado mucho este mes.\nYa baja con los esquís juntos.\n\nUn abrazo,\nEl equipo de Mítico Club';
  const con = bloquesCartaFamilia(datos, carta, { incluirHabilidades: true, fechaHoy: '2 de octubre de 2026' });
  const parrafos = con.filter((b) => b.kind === 'paragraph' && b.size === 11);
  equal(parrafos.length, 5, 'una línea por párrafo (la firma aparte)');
  ok(con.some((b) => b.kind === 'table'), 'con tabla');
  const sin = bloquesCartaFamilia(datos, carta, { incluirHabilidades: false, fechaHoy: 'hoy' });
  ok(!sin.some((b) => b.kind === 'table'), 'sin tabla');
  const pdf = generarPdfSimple(con, { title: 'Carta' });
  equal(String.fromCharCode(...pdf.slice(0, 8)), '%PDF-1.4', 'cabecera PDF');
});
