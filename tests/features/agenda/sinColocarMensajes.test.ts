import { planificarSinColocar, type AlumnoPlan, type GrupoPlan, type SesionPlan } from '../../../src/features/agenda/sinColocarPlanner';
import {
  necesitaMensaje,
  opcionesParaFamilia,
  propuestaDeUnidad,
  telefonoFamilia,
  cortoAUuid,
  enlaceElegirTurno,
  uuidACorto,
  textoPropuestaFamilia,
  urlWhatsappFamilia,
} from '../../../src/features/agenda/sinColocarMensajes';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const S = (id: string, fecha: string, ini: string, fin: string): SesionPlan => ({
  sesionId: id, fecha, hora_inicio: `${ini}:00`, hora_fin: `${fin}:00`, modalidad: 'BABY',
});
const G = (sesionId: string, grupoId: string, total: number): GrupoPlan => ({
  sesionId, grupoId, nombre: `Grupo ${grupoId}`, nivelGrupo: 'B', alumnosLista: '', pista: 'Pequeña', total, entrenadores: 1, publicado: false,
});
const A = (id: string, nombre: string, sesionId: string): AlumnoPlan => ({
  sesionAlumnoId: `sa-${id}`, alumnoId: id, alumno: nombre, sesionId, nivel: 'B', estado: 'CONOCIDO',
});
const sesiones = [
  S('vie', '2026-10-30', '18:00', '20:00'),
  S('sab1', '2026-10-31', '09:45', '11:45'),
  S('sab2', '2026-10-31', '12:00', '14:00'),
  S('dom1', '2026-11-01', '09:45', '11:45'),
];

const plan = planificarSinColocar({
  sesiones,
  grupos: [G('sab2', 'g1', 4), G('sab1', 'g2', 1), G('dom1', 'g3', 2), G('vie', 'g4', 1)],
  pendientes: [A('x', 'ANA LOPEZ GARCIA', 'sab2'), A('y', 'PABLO LOPEZ GARCIA', 'sab2')],
  listados: [A('x', 'ANA LOPEZ GARCIA', 'sab2'), A('y', 'PABLO LOPEZ GARCIA', 'sab2')],
  colocados: new Set(),
  telefonos: { x: '600111222', y: '+34 600 111 222' },
});
const u = plan[0];

test('su turno lleno: hay que escribir a la familia', () => {
  equal(necesitaMensaje(u), true, 'necesita mensaje');
});

test('opciones: otros turnos, primero fin de semana, máximo 3', () => {
  const ops = opcionesParaFamilia(u);
  equal(ops.length, 3, 'tres');
  equal(ops.some((o) => o.sesion.sesionId === 'sab2'), false, 'nunca su turno');
  equal(ops[ops.length - 1].sesion.sesionId, 'vie', 'el viernes, el último');
});

test('texto con los dos hermanos y las opciones numeradas', () => {
  const t = textoPropuestaFamilia(u, opcionesParaFamilia(u));
  equal(t.includes('Ana y Pablo (juntos)'), true, 'nombres');
  equal(t.includes('El Sábado 31/10 · 12:00–14:00 no tenemos hueco'), true, 'turno de origen');
  equal(t.startsWith('Hola familia 👋 Soy Jose de Mítico'), true, 'saludo');
  equal(t.includes('1️⃣ Sábado 31/10 · 09:45–11:45'), true, 'opción 1');
});

test('teléfono de cualquiera de los hermanos y enlace de WhatsApp', () => {
  const tel = telefonoFamilia(u, { x: '', y: '+34 600 111 222' });
  equal(tel, '600111222', 'teléfono');
  equal(urlWhatsappFamilia(tel, 'hola').startsWith('https://wa.me/34600111222?text=hola'), true, 'url');
});

test('propuesta vigente de la familia', () => {
  const p = propuestaDeUnidad(u, [
    { sesion_alumno_id: 'sa-x', estado: 'ENVIADO', opciones: [], opcion_aceptada: null, updated_at: '2026-10-28T10:00:00Z' },
    { sesion_alumno_id: 'sa-y', estado: 'ACEPTADO', opciones: [], opcion_aceptada: { sesionId: 'dom1', etiqueta: 'x' }, updated_at: '2026-10-28T11:00:00Z' },
    { sesion_alumno_id: 'sa-z', estado: 'ACEPTADO', opciones: [], opcion_aceptada: null, updated_at: '2026-10-28T12:00:00Z' },
  ]);
  equal(p!.estado, 'ACEPTADO', 'la más reciente de la familia');
});

test('un solo enlace corto', () => {
  const t = textoPropuestaFamilia(u, opcionesParaFamilia(u), 'https://app.test/?turno=X');
  equal((t.match(/https:/g) || []).length, 1, 'un enlace');
  equal(t.endsWith('(Cualquier cosa que necesitéis me decís 🙂)'), true, 'cierre');
  equal(t.includes('1️⃣ Sábado 31/10 · 09:45–11:45'), true, 'opción 1');
  const uuid = '97550714-9367-4c57-8e3a-b6c77d53376a';
  const corto = uuidACorto(uuid);
  equal(corto.length, 22, '22 letras');
  equal(cortoAUuid(corto), uuid, 'ida y vuelta');
  equal(enlaceElegirTurno('https://x/', uuid), `https://x/?t=${corto}`, 'enlace');
  equal(cortoAUuid('mal'), '', 'código malo');
});

test('la opción elegida por coordinación va la primera en el mensaje', () => {
  const ops = opcionesParaFamilia(u);
  const elegida = ops[2];
  const conElegida = opcionesParaFamilia(u, 3, elegida);
  equal(conElegida[0].sesion.sesionId, elegida.sesion.sesionId, 'primera');
  equal(conElegida.length, 3, 'sin repetir');
});
