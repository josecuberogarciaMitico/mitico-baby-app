import {
  lineasFiabilidadPaco,
  mensajePacoRefresco,
  mensajePacoSoloAnadir,
  mensajePacoTraerListado,
  repasoEnCurso,
  tituloTurnoPaco,
} from '../../../src/services/aimharder/pacoListadoMensajes';

function equal<T>(actual: T, expected: T, label: string) {
  const a = JSON.stringify(actual);
  const e = JSON.stringify(expected);
  if (a !== e) throw new Error(`${label}: esperado ${e}, recibido ${a}`);
}
function ok(cond: boolean, label: string) {
  if (!cond) throw new Error(label);
}
function test(name: string, run: () => void) {
  run();
  console.log(`OK  ${name}`);
}

const AHORA = Date.parse('2026-10-26T10:00:00Z');
const base = { sourceKey: 'aimharder-api-publica', reservasActualizadasAt: '2026-10-26T09:57:00Z' };

test('título con día de la semana y horas', () => {
  equal(tituloTurnoPaco('2026-10-31', '09:45', '11:45'), 'Paco · Baby sábado 31/10 · 9:45–11:45', 'título');
});

test('repaso en marcha: dice cuántos quedan, cuánto tarda y que se actualiza solo', () => {
  const safety = { ...base, repaso: { revisar: 30, pendientes: 14, etaMin: 11 } };
  ok(repasoEnCurso(safety), 'en curso');
  const t = mensajePacoTraerListado({ fecha: '2026-10-31', inicio: '09:45', fin: '11:45', activos: 3, safety, ahora: AHORA });
  ok(t.includes('Tengo 3 niños apuntados'), t);
  ok(t.includes('comprobando a 14 niños'), t);
  ok(t.includes('unos 11 min'), t);
  ok(t.includes('lo actualizo solo'), t);
  ok(!t.includes('Pegar listado'), 'no manda a pegar mientras comprueba');
});

test('repaso terminado: lo dice y recuerda Pegar listado para reservas nuevas de hoy', () => {
  const safety = { ...base, repaso: { revisar: 30, pendientes: 0, etaMin: 0 } };
  ok(!repasoEnCurso(safety), 'terminado');
  const l = lineasFiabilidadPaco(safety, 12, AHORA);
  ok(l[0].startsWith('✔ He comprobado a todos los que suelen venir (30)'), l[0]);
  ok(l[0].includes('hace 3 min'), l[0]);
  ok(l.some((x) => x.includes('Pegar listado')), 'pegar');
});

test('si AimHarder trae el nº de reservas, dice cuántos faltan', () => {
  const l = lineasFiabilidadPaco({ ...base, reservadasAimHarder: 12, repaso: { revisar: 20, pendientes: 0, etaMin: 0 } }, 10, AHORA);
  ok(l[0] === 'AimHarder dice 12 reservas y yo tengo 10: me faltan 2 por encontrar.', l[0]);
  const c = lineasFiabilidadPaco({ ...base, reservadasAimHarder: 10 }, 10, AHORA);
  ok(c[0] === 'Cuadra con AimHarder: 10 reservas.', c[0]);
});

test('listado pegado a mano: sin líneas de AimHarder', () => {
  equal(lineasFiabilidadPaco({ sourceKey: 'manual-paste' }, 5, AHORA), [], 'manual');
});

test('refresco con cambios: entran, salen y protegidos en líneas separadas', () => {
  const t = mensajePacoRefresco({
    fecha: '2026-11-01', inicio: '09:45', fin: '11:45', activos: 12, totalFinal: 13,
    anadidos: ['ANA'], retirados: ['LEO'], protegidos: ['EVA'], noEncontrados: ['PEPE X'],
    safety: { ...base, repaso: { revisar: 10, pendientes: 0, etaMin: 0 } }, ahora: AHORA,
  });
  const lineas = t.split('\n');
  equal(lineas[0], 'Paco · Baby domingo 01/11 · 9:45–11:45', 'título');
  equal(lineas[1], '✔ Sesión actualizada: ahora hay 13 niños.', 'resumen');
  ok(lineas.includes('Entran: ANA.'), t);
  ok(lineas.includes('Salen (cancelaron en AimHarder): LEO.'), t);
  ok(t.includes('NO los quito porque ya tienen asistencia o reporte: EVA'), t);
  ok(t.includes('No encuentro en AimHarder a: PEPE X'), t);
});

test('refresco sin cambios', () => {
  const t = mensajePacoRefresco({
    fecha: '2026-11-01', inicio: '12:00', fin: '14:00', activos: 1, totalFinal: 1,
    anadidos: [], retirados: [], protegidos: [], safety: base, ahora: AHORA,
  });
  ok(t.includes('✔ Sin cambios: la sesión ya tenía a los 1 niño de AimHarder.'), t);
});

test('solo añadir: separa con ficha y sin ficha, y avisa de los que se comprueban', () => {
  const t = mensajePacoSoloAnadir({
    fecha: '2026-11-01', inicio: '09:45', fin: '11:45', activos: 8,
    result: {
      anadidos: [
        { nombre: 'MIGUEL', estado: 'CONOCIDO', nivel: 'A' },
        { nombre: 'CANDELA', estado: 'PENDIENTE_TEST', nivel: null },
      ],
      siguenSinSalir: ['JORGE'],
      cancelacionesRetiradas: [],
      protegidos: [],
      noAnadidos: [],
      nivelesRecalculados: [],
    },
    safety: { ...base, repaso: { revisar: 30, pendientes: 5, etaMin: 4 } },
    ahora: AHORA,
  });
  ok(t.includes('Entran en «Pendientes de colocar»: MIGUEL (nivel A).'), t);
  ok(t.includes('Nuevos sin ficha (les falta Alta/Test): CANDELA.'), t);
  ok(t.includes('los estoy comprobando'), t);
  ok(t.includes('JORGE'), t);
});
