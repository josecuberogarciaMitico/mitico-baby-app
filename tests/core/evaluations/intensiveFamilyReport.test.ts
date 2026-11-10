import { construirInformeIntensivo, textoWhatsappInforme, bloquesInformesMaestro, nombreBonito } from '../../../src/core/evaluations/intensiveFamilyReport';
import { generarPdfSimple } from '../../../src/features/billing/simplePdf';
import type { ReporteDetalleIntensivoApp, ResumenFinalIntensivoApp } from '../../../src/core/evaluations/evaluationTypes';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function ok(cond: boolean, label: string) { if (!cond) throw new Error(label); }
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const registro = {
  intensivo: 'INTENSIVO NOV DOMINGOS', alumno: 'OLIVIA VAZQUEZ GARCIA', alumno_id: 'a1', intensivo_id: 'i1',
  total_dias_intensivo: 4, dias_presente: 4, nivel_final_confirmado: 'B', nivel_final_propuesto: 'B', nivel_ultimo_reporte: 'B', estado_diploma: 'Revisado',
} as unknown as ResumenFinalIntensivoApp;
const rep = (dia: number, nivel: string, ev: Record<string, string>, extra: Partial<ReporteDetalleIntensivoApp> = {}) =>
  ({ numero_dia: dia, fecha: `2026-11-0${dia}`, nivel_reportado: nivel, evaluacion_tecnica: ev, actitud: 'Muy buena', autonomia: 'Autónomo en pista grande',
     observaciones_generales: 'es un poquito sabelotodo', prioridades_proxima_sesion: ['Revisar nivel'], ...extra } as unknown as ReporteDetalleIntensivoApp);

test('intensivo: informe para la familia (plantilla fija)', () => {
  const inf = construirInformeIntensivo(registro, [
    rep(2, 'B', { paralelismo: 'Consolidado', apoyo_exterior_presion: 'En desarrollo' }, { prioridades_proxima_sesion: ['Apoyo exterior / presión', 'Revisar nivel'] }),
    rep(1, 'A+', { giros_cuna_encadenados: 'Consolidado', paralelismo: 'En desarrollo' }),
  ], { fechas: '08/11/2026 – 29/11/2026' });
  equal(nombreBonito('OLIVIA VAZQUEZ GARCIA'), 'Olivia Vazquez Garcia', 'nombre');
  equal(inf.nivelInicio, 'A+', 'nivel inicio = primer reporte');
  equal(inf.nivelFinal, 'B', 'nivel final confirmado');
  ok(inf.evolucion.startsWith('¡Ha subido de nivel!'), 'sube de nivel');
  equal(inf.habilidades.find((h) => h.nombre === 'Paralelismo')?.estado, 'Lo consigue', 'última valoración manda');
  equal(inf.objetivos.join('|'), 'Apoyo exterior / presión', 'sin «Revisar nivel» y sin repetir');
  const wa = textoWhatsappInforme(inf);
  ok(wa.includes('Olivia') && wa.includes('4 de 4 días'), 'mensaje whatsapp');
  ok(!wa.includes('sabelotodo'), 'nunca observaciones internas');
  const pdf = generarPdfSimple(bloquesInformesMaestro([inf, { ...inf, nombreCompleto: 'Otro Niño' }], '10 de noviembre de 2026'));
  ok(pdf.length > 1000, 'pdf generado');
  const texto = String.fromCharCode(...pdf.slice(0, 4000));
  ok(!texto.includes('sabelotodo'), 'pdf sin observaciones internas');
});

test('intensivo: sin cambio de nivel y sin reportes', () => {
  const inf = construirInformeIntensivo({ ...registro, nivel_final_confirmado: 'A+', nivel_final_propuesto: null } as ResumenFinalIntensivoApp,
    [rep(1, 'A+', {})], { fechas: '' });
  ok(inf.evolucion.includes('consolidado su nivel A+'), 'consolida');
  const vacio = construirInformeIntensivo({ ...registro, nivel_final_confirmado: null, nivel_final_propuesto: null, nivel_ultimo_reporte: null } as ResumenFinalIntensivoApp, [], { fechas: '' });
  equal(vacio.nivelFinal, '—', 'sin nivel');
  equal(vacio.habilidades.length, 0, 'sin habilidades');
});

import { nombreArchivoInforme } from '../../../src/core/evaluations/intensiveFamilyReport';
test('intensivo: nombre de archivo sin tildes', () => {
  equal(nombreArchivoInforme('Olivia Vázquez García', 'INTENSIVO NOV · DOMINGOS'), 'Evaluacion INTENSIVO NOV DOMINGOS - Olivia Vazquez Garcia.pdf', 'archivo');
});

test('intensivo: breve descripción de la mejora (técnica pero cercana)', () => {
  const inf = construirInformeIntensivo(registro, [
    rep(1, 'A+', { giros_cuna_encadenados: 'En desarrollo', control_velocidad: 'Consolidado', transicion: 'Necesita mejorar' }),
    rep(2, 'B', { giros_cuna_encadenados: 'Consolidado', control_velocidad: 'Consolidado', transicion: 'En desarrollo' }),
  ], { fechas: '' });
  equal(inf.mejora, 'Lo que más ha mejorado: Olivia ya enlaza giros a ambos lados manteniendo el control. Ahora estamos afinando transición, que es lo que le hará dar el siguiente paso.', 'mejora');
  ok(textoWhatsappInforme(inf).includes('📝 Lo que más ha mejorado'), 'en el WhatsApp');
});
