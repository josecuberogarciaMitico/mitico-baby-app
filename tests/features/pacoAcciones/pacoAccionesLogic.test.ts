import {
  alumnosSinColocar,
  buscarAlumnos,
  diaDeSemanaIso,
  etiquetaTurno,
  filtrarTurnos,
  limpiarHora,
  limpiarIntent,
  nombreBonito,
  normalizarNombreAlumno,
  parecePeticionListadoPendientes,
  parecePeticionMover,
  resumirPendientes,
  sugerirGrupoDestino,
  tarjetaMovimiento,
  textoPendientes,
  turnosDeLaSemana,
  type DatosMovimiento,
  type TurnoBaby,
} from '../../../src/features/pacoAcciones/pacoAccionesLogic';
import type {
  AgendaAlumnoSesionApp,
  AgendaGrupoSesionApp,
  AgendaSesionDirectaApp,
} from '../../../src/features/agenda/agendaTypes';

function equal<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: esperado ${e}, recibido ${a}`);
}
function ok(valor: unknown, label: string) {
  if (!valor) throw new Error(`${label}: se esperaba verdadero`);
}
function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

function sesion(id: string, fecha: string, ini: string, fin: string): AgendaSesionDirectaApp {
  return {
    sesion_id: id, fecha, hora_inicio: `${ini}:00`, hora_fin: `${fin}:00`, lugar: 'Madrid SnowZone',
    tipo_sesion: 'BABY', estado_sesion: 'ACTIVA', modalidad_codigo: 'BABY', modalidad: 'Baby',
    semana: '2026-10-12', semana_inicio: '2026-10-12', semana_fin: '2026-10-18', total_alumnos: 0,
    total_nuevos: 0, total_conocidos: 0, total_grupos: 0, grupos_publicados: 0, alumnos_en_grupos: 0,
    alumnos_sin_grupo: 0,
  };
}
function alumno(sesionId: string, alumnoId: string, nombre: string, nivel: string | null, estado = 'CONOCIDO'): AgendaAlumnoSesionApp {
  return {
    sesion_alumno_id: `sa-${sesionId}-${alumnoId}`, sesion_id: sesionId, alumno_id: alumnoId, alumno: nombre,
    orden: 1, estado_en_listado: estado, nivel_usado: nivel, orden_nivel: null, pista_recomendada: null,
    origen_nivel: null, estado_ficha: 'OK', observacion: null,
  };
}
function grupo(sesionId: string, id: string, nombre: string, nivel: string, pista: string, lista: string[], extra: Partial<AgendaGrupoSesionApp> = {}): AgendaGrupoSesionApp {
  return {
    sesion_id: sesionId, grupo_id: id, nombre_grupo: nombre, nivel_grupo: nivel, pista, punto_encuentro: null,
    estado_grupo: 'PREPARADO', publicado: false, trabajo_diario: null, observaciones_importantes: null,
    entrenador_id: 'e1', entrenador: 'Ana', entrenador_apoyo_id: null, entrenador_apoyo: null,
    estado_confirmacion: null, total_alumnos: lista.length, alumnos_lista: lista.join(' || '), ...extra,
  };
}

// Semana del 12 al 18 de octubre de 2026
const sab = sesion('s-sab', '2026-10-17', '12:00', '14:00');
const dom = sesion('s-dom', '2026-10-18', '10:00', '12:00');
const jue = sesion('s-jue', '2026-10-15', '17:00', '19:00');
const jue2 = sesion('s-jue2', '2026-10-15', '19:00', '21:00');
const sigSab = sesion('s-sig', '2026-10-24', '12:00', '14:00');

test('reconoce peticiones de listado sin IA', () => {
  ok(parecePeticionListadoPendientes('Niños sin grupo'), 'sin grupo');
  ok(parecePeticionListadoPendientes('¿quién está sin nivel?'), 'sin nivel');
  ok(parecePeticionListadoPendientes('pendientes de colocar'), 'pendientes de colocar');
  ok(parecePeticionListadoPendientes('faltan por colocar'), 'faltan por colocar');
  ok(!parecePeticionListadoPendientes('responde a este padre que su hijo está sin grupo y quiere cambiar'.repeat(6)), 'mensaje largo de familia');
  ok(!parecePeticionListadoPendientes('qué tal el día'), 'charla');
  ok(!parecePeticionListadoPendientes('quién no ha respondido la disponibilidad'), 'disponibilidad');
});

test('reconoce peticiones de mover y no confunde otras frases', () => {
  ok(parecePeticionMover('pasa a Lucía al jueves a las 17:00'), 'pasa');
  ok(parecePeticionMover('Mueve a Pau García al sábado'), 'mueve');
  ok(parecePeticionMover('cambia a Nuo de turno'), 'cambia turno');
  ok(parecePeticionMover('ponlo el domingo a las 10'), 'ponlo');
  ok(!parecePeticionMover('cambia el tono, más corto'), 'ajuste de redacción');
  ok(!parecePeticionMover('hola, buenos días'), 'saludo');
  ok(!parecePeticionMover('mover '.repeat(80) + 'jueves'), 'texto largo');
});

test('limpiarIntent descarta lo inventado y normaliza días y horas', () => {
  const i = limpiarIntent({ accion: 'mover_alumno', alumno: '  Lucía   García ', dia_destino: 'Jueves', hora_destino: '17h', fecha_destino: '2026-13-45', dia_origen: 'sábado', hora_origen: '25:00' });
  equal(i.accion, 'mover_alumno', 'accion');
  equal(i.alumno, 'Lucía García', 'alumno');
  equal(i.dia_destino, 4, 'dia destino');
  equal(i.hora_destino, '17:00', 'hora destino');
  equal(i.fecha_destino, null, 'fecha imposible');
  equal(i.dia_origen, 6, 'dia origen');
  equal(i.hora_origen, null, 'hora imposible');
  equal(limpiarIntent({ accion: 'borrar_todo' }).accion, 'ninguna', 'accion desconocida');
  equal(limpiarIntent(null).accion, 'ninguna', 'null');
  equal(limpiarHora('9.30'), '09:30', 'hora con punto');
  equal(diaDeSemanaIso('2026-10-18'), 7, 'domingo');
  equal(diaDeSemanaIso('2026-10-12'), 1, 'lunes');
});

test('nombres: quita nivel y pista, y los pasa a mayúscula inicial', () => {
  equal(normalizarNombreAlumno('LUCÍA GARCÍA · B+ · Pequeña'), 'lucia garcia', 'normaliza');
  equal(nombreBonito('LUCÍA GARCÍA · B+ · Pequeña'), 'Lucía García', 'bonito');
  equal(nombreBonito('Nuo Chen'), 'Nuo Chen', 'ya bonito');
});

test('buscarAlumnos: acentos, nombre suelto, repetidos y errata', () => {
  const filas = [
    { alumno_id: 'a1', alumno: 'LUCÍA GARCÍA PÉREZ' },
    { alumno_id: 'a2', alumno: 'Lucía Martín Ruiz' },
    { alumno_id: 'a3', alumno: 'Pau Rovira' },
    { alumno_id: 'a1', alumno: 'LUCÍA GARCÍA PÉREZ' },
  ];
  equal(buscarAlumnos('lucia garcia', filas).map((c) => c.alumno_id), ['a1'], 'nombre y apellido');
  equal(buscarAlumnos('Lucía', filas).map((c) => c.alumno_id).sort(), ['a1', 'a2'], 'nombre repetido -> pregunta');
  equal(buscarAlumnos('pau', filas).map((c) => c.alumno_id), ['a3'], 'prefijo');
  equal(buscarAlumnos('Rovria', filas).map((c) => c.alumno_id), ['a3'], 'errata de una letra');
  equal(buscarAlumnos('Marta', filas).length, 0, 'no existe');
  equal(buscarAlumnos('', filas).length, 0, 'vacío');
  equal(buscarAlumnos('Lucía García Pérez', filas)[0].nombre, 'Lucía García Pérez', 'exacto gana');
});

test('filtrarTurnos: día, fecha, hora y empates', () => {
  const t = [jue, jue2, sab, dom].map((s) => ({ sesion: s }));
  equal(filtrarTurnos(t, { dia: 4, fecha: null, hora: null }).map((x) => x.sesion.sesion_id), ['s-jue', 's-jue2'], 'jueves (2 turnos)');
  equal(filtrarTurnos(t, { dia: 4, fecha: null, hora: '17:00' }).map((x) => x.sesion.sesion_id), ['s-jue'], 'jueves 17:00');
  equal(filtrarTurnos(t, { dia: 4, fecha: null, hora: '19:00' }).map((x) => x.sesion.sesion_id), ['s-jue2'], 'jueves 19:00');
  equal(filtrarTurnos(t, { dia: null, fecha: '2026-10-17', hora: null }).map((x) => x.sesion.sesion_id), ['s-sab'], 'fecha exacta');
  equal(filtrarTurnos(t, { dia: 6, fecha: null, hora: '12:15' }).map((x) => x.sesion.sesion_id), ['s-sab'], 'un solo turno ese día, hora cercana');
  equal(filtrarTurnos(t, { dia: 6, fecha: null, hora: '18:00' }).length, 0, 'un solo turno pero hora lejana');
  equal(filtrarTurnos(t, { dia: 6, fecha: null, hora: '13:00' }).length, 0, 'a más de 45 min del inicio no adivina');
  equal(filtrarTurnos(t, { dia: 7, fecha: null, hora: '10:00' }).map((x) => x.sesion.sesion_id), ['s-dom'], 'domingo 10:00');
  equal(filtrarTurnos([{ sesion: jue }, { sesion: jue2 }], { dia: 4, fecha: null, hora: '17:30' }).length, 1, 'se queda con el más cercano');
  // «a las 5» -> 17:00
  equal(filtrarTurnos([{ sesion: jue }, { sesion: jue2 }], { dia: 4, fecha: null, hora: '05:00' }).map((x) => x.sesion.sesion_id), ['s-jue'], 'a las 5 = 17:00');
});

test('turnosDeLaSemana deja fuera otras semanas', () => {
  const t: TurnoBaby[] = [sab, jue, sigSab].map((s) => ({ sesion: s, roster: [], grupos: [] }));
  equal(turnosDeLaSemana(t, '2026-10-17').map((x) => x.sesion.sesion_id), ['s-sab', 's-jue'], 'misma semana');
});

test('pendientes: sin grupos creados, con grupos y sin nivel', () => {
  const sinGrupos: TurnoBaby = {
    sesion: sab,
    roster: [alumno('s-sab', 'a1', 'LUCÍA GARCÍA', 'B+'), alumno('s-sab', 'a2', 'Pau Rovira', 'A')],
    grupos: [],
  };
  const conGrupos: TurnoBaby = {
    sesion: dom,
    roster: [
      alumno('s-dom', 'a3', 'Nuo Chen', 'B+'),
      alumno('s-dom', 'a4', 'Marta Díaz', null),
      alumno('s-dom', 'a5', 'Leo Gil', 'A', 'PENDIENTE_TEST'),
      alumno('s-dom', 'a6', 'Iván Soto', 'B'),
    ],
    grupos: [grupo('s-dom', 'g1', 'Grupo 1', 'B+', 'Pequeña', ['Nuo Chen · B+ · Pequeña', 'Iván Soto · B · Pequeña'])],
  };
  equal(alumnosSinColocar(sinGrupos).length, 2, 'sin grupos = todos');
  equal(alumnosSinColocar(conGrupos).map((a) => a.alumno_id), ['a4', 'a5'], 'con grupos = quien no sale');
  const r = resumirPendientes([sinGrupos, conGrupos, { sesion: jue, roster: [], grupos: [] }]);
  equal(r.turnosSinGrupos.length, 1, 'un turno sin grupos');
  equal(r.turnosConPendientes.length, 1, 'un turno con pendientes');
  equal(r.sinNivel.map((x) => x.alumno.alumno_id), ['a4', 'a5'], 'sin nivel (nulo y pendiente test)');
  const texto = textoPendientes(r);
  ok(texto.includes('Marta Díaz, Leo Gil'), 'nombres de pendientes');
  ok(texto.includes('dom 18/10 · 10:00–12:00'), 'etiqueta turno');
  ok(texto.includes('sáb 17/10 · 12:00–14:00 · 2 niños'), 'turno sin grupos');
  ok(texto.includes('pendiente de test') && texto.includes('sin nivel en la ficha'), 'motivos de nivel');
  ok(textoPendientes(resumirPendientes([])).startsWith('Todo en orden'), 'todo en orden');
});

test('sugerirGrupoDestino: recomienda grupo que encaja y respeta el aforo', () => {
  const destino: TurnoBaby = {
    sesion: jue,
    roster: [],
    grupos: [
      grupo('s-jue', 'g-a', 'Grupo A', 'A', 'Pequeña', ['x · A', 'y · A']),
      grupo('s-jue', 'g-b', 'Grupo B', 'B+', 'Pequeña', ['p · B+', 'q · B+']),
      grupo('s-jue', 'g-llena', 'Grupo llena', 'B+', 'Pequeña', ['1 · B+', '2 · B+', '3 · B+', '4 · B+']),
      grupo('s-jue', 'g-part', 'PARTICULAR · Leo', 'B+', 'Pequeña', ['Leo · B+']),
    ],
  };
  const s = sugerirGrupoDestino({ alumno_id: 'a1', alumno: 'Lucía', nivel_usado: 'B+' }, '2026-10-17', destino);
  equal(s.mejor?.grupo, 'Grupo B', 'mejor grupo');
  equal(s.mejor?.total_final, 3, 'quedaría con 3');
  equal(s.total, 3, 'la clase particular no cuenta');
  const llena = sugerirGrupoDestino({ alumno_id: 'a1', alumno: 'Lucía', nivel_usado: 'B+' }, '2026-10-17', { ...destino, grupos: [destino.grupos[2]] });
  equal(llena.mejor, null, 'grupo lleno no se ofrece');
  const sinGrupos = sugerirGrupoDestino({ alumno_id: 'a1', alumno: 'Lucía', nivel_usado: 'B+' }, '2026-10-17', { ...destino, grupos: [] });
  equal(sinGrupos.total, 0, 'turno sin grupos');
});

test('tarjeta de confirmación: con grupo, sin grupo y siempre con Cancelar', () => {
  const datos: DatosMovimiento = {
    sesion_alumno_id: 'sa1', alumno_id: 'a1', nombre: 'Lucía García', sesion_destino_id: 's-jue',
    grupo_destino_id: null, grupo_destino: null,
    turno_origen: etiquetaTurno(sab), turno_destino: etiquetaTurno(jue),
  };
  const destino: TurnoBaby = { sesion: jue, roster: [], grupos: [grupo('s-jue', 'g-b', 'Grupo B', 'B+', 'Pequeña', ['p · B+'])] };
  const con = tarjetaMovimiento(datos, 'B+', sugerirGrupoDestino({ alumno_id: 'a1', alumno: 'Lucía García', nivel_usado: 'B+' }, sab.fecha, destino));
  equal(con.choices?.map((c) => c.label), ['Mover y meterlo en «Grupo B»', 'Mover solo al turno (sin grupo)', 'Cancelar'], 'botones con grupo');
  equal(con.choices?.[0].continuation.grupo_destino_id, 'g-b', 'el botón lleva el grupo');
  equal(con.choices?.[1].continuation.grupo_destino_id, null, 'el botón sin grupo no lleva grupo');
  ok(con.answer.includes('De: sáb 17/10 · 12:00–14:00') && con.answer.includes('A: jue 15/10 · 17:00–19:00'), 'texto de origen y destino');
  ok(con.answer.includes('No toco nada hasta que me lo confirme'), 'avisa de que no escribe aún');
  const sin = tarjetaMovimiento(datos, null, sugerirGrupoDestino({ alumno_id: 'a1', alumno: 'Lucía García', nivel_usado: null }, sab.fecha, { ...destino, grupos: [] }));
  equal(sin.choices?.map((c) => c.label), ['Mover al turno (sin grupo)', 'Cancelar'], 'botones sin grupo');
  ok(sin.answer.includes('todavía no hay grupos creados'), 'explica por qué no hay grupo');
});

console.log('pacoAccionesLogic: todas las pruebas OK');
