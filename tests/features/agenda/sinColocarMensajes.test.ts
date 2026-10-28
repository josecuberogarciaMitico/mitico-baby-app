import { planificarSinColocar, type AlumnoPlan, type GrupoPlan, type SesionPlan } from '../../../src/features/agenda/sinColocarPlanner';
import {
  necesitaMensaje,
  opcionesParaFamilia,
  propuestaDeUnidad,
  telefonoFamilia,
  enlaceElegirTurno,
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
  equal(t.includes('sábado 31/10 de 12:00 a 14:00'), true, 'turno de origen');
  equal(t.includes('1️⃣ sábado 31/10 de 09:45 a 11:45'), true, 'opción 1');
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

test('con enlaces: uno por opción y otro para «ninguno»', () => {
  const t = textoPropuestaFamilia(u, opcionesParaFamilia(u), { base: 'https://app.test/', token: 'abc' });
  equal(t.includes('👉 Pulsa para elegirlo: https://app.test/?confirmar_turno=abc&o=1'), true, 'opción 1');
  equal(t.includes('https://app.test/?confirmar_turno=abc&o=0'), true, 'ninguna');
  equal(enlaceElegirTurno('https://x/', 'a b', 2), 'https://x/?confirmar_turno=a%20b&o=2', 'codifica');
});
