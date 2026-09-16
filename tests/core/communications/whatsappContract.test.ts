import {
  babyWhatsappContext,
  buildWhatsappPreview,
  cleanTrainerNamesForWhatsapp,
  intensiveWhatsappContext,
  isValidWhatsappGroupLink,
  normalizeWhatsappGroupKey,
  normalizeWhatsappPhone,
  ocioWhatsappContext,
  sessionWhatsappContext,
  whatsappDirectUrl,
  whatsappGroupLinkByKey,
} from '../../../src/core/communications/whatsappContract';

function equal<T>(actual: T, expected: T, label: string) {
  if (!Object.is(actual, expected)) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function rejects(run: () => void, label: string) { try { run(); } catch { return; } throw new Error(`${label}: se esperaba error`); }
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

test('normaliza móvil nacional sin alterar números internacionales', () => {
  equal(normalizeWhatsappPhone('612 345 678'), '34612345678', 'móvil español');
  equal(normalizeWhatsappPhone('+44 7700 900123'), '447700900123', 'internacional');
  equal(normalizeWhatsappPhone(''), '', 'vacío');
});

test('construye enlace directo y codifica el mensaje', () => {
  equal(whatsappDirectUrl('612345678', 'Hola equipo!'), 'https://wa.me/34612345678?text=Hola%20equipo!', 'enlace');
  equal(whatsappDirectUrl(null), '', 'sin destino');
});

test('valida exclusivamente enlaces de grupo WhatsApp HTTPS', () => {
  equal(isValidWhatsappGroupLink('https://chat.whatsapp.com/ABC'), true, 'grupo válido');
  equal(isValidWhatsappGroupLink('http://chat.whatsapp.com/ABC'), false, 'http');
  equal(isValidWhatsappGroupLink('https://wa.me/34612345678'), false, 'chat individual');
});

test('mantiene claves y contextos globales oficiales', () => {
  equal(normalizeWhatsappGroupKey('Intensívos + Baby'), 'INTENSIVOS_+_BABY', 'clave');
  equal(babyWhatsappContext().clave, 'GLOBAL:BABY', 'Baby');
  equal(ocioWhatsappContext().clave, 'GLOBAL:OCIO', 'Ocio');
  equal(intensiveWhatsappContext('i1', 'Navidad').clave, 'INTENSIVO:i1', 'Intensivo');
});

test('resuelve contexto de sesión Intensivos sin crear un grupo paralelo', () => {
  const result = sessionWhatsappContext({
    sessionId: 's1', modality: 'INTENSIVOS',
    intensiveDays: [{ sesion_id: 's1', intensivo_id: 'i1' }],
    intensives: [{ intensivo_id: 'i1', intensivo: 'Navidad' }],
  });
  equal(result.clave, 'INTENSIVO:i1', 'misma identidad');
  equal(sessionWhatsappContext({ sessionId: 's2', modality: 'OCIO', intensiveDays: [], intensives: [] }).clave, 'GLOBAL:OCIO', 'Ocio');
});

test('busca el enlace exacto y prepara preview sin mutar registros', () => {
  const records = [{
    clave_grupo: 'GLOBAL:BABY', modalidad: 'BABY', referencia: 'BABY',
    nombre_grupo: 'Baby', enlace_whatsapp: 'https://chat.whatsapp.com/ABC', actualizado_at: null,
  }];
  equal(whatsappGroupLinkByKey(records, 'GLOBAL:BABY'), 'https://chat.whatsapp.com/ABC', 'enlace');
  equal(whatsappGroupLinkByKey(records, 'GLOBAL:OCIO'), '', 'sin coincidencia');
  const preview = buildWhatsappPreview({
    title: 'Aviso', text: ' Hola ', group: { ...babyWhatsappContext(), enlace: records[0].enlace_whatsapp },
  });
  equal(preview.claveGrupoWhatsapp, 'GLOBAL:BABY', 'clave preview');
  rejects(() => buildWhatsappPreview({ title: 'Vacío', text: '   ' }), 'texto vacío');
});

test('limpia el prefijo de prueba inicial y conserva el formato V1 de la lista', () => {
  equal(cleanTrainerNamesForWhatsapp('[TEST 1] Ana + TEST NUEVO · Luis'), 'Ana + TEST NUEVO · Luis', 'nombres');
});
