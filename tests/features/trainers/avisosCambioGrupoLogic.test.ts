import { agruparAvisos, textoAviso, tituloBloque, type AvisoCambioGrupo } from '../../../src/features/trainers/avisosCambioGrupoLogic';

function equal<T>(actual: T, expected: T, label: string) {
  if (actual !== expected) throw new Error(`${label}: esperado ${String(expected)}, recibido ${String(actual)}`);
}
function test(name: string, run: () => void) { run(); console.log(`OK  ${name}`); }

const a = (x: Partial<AvisoCambioGrupo>): AvisoCambioGrupo => ({
  grupo_id: 'g1', grupo_nombre: 'Grupo 2 · Nivel A', sesion_fecha: '2026-11-07', hora_inicio: '09:45', modalidad: 'Baby',
  tipo: 'nino_entra', alumno: 'LUCAS PÉREZ', valor: null, ultimo_at: null, ...x,
});

test('avisos: un bloque por grupo, en orden, con textos claros', () => {
  const b = agruparAvisos([
    a({ grupo_id: 'g2', grupo_nombre: 'Grupo 4', sesion_fecha: '2026-11-08', hora_inicio: '12:00', tipo: 'grupo_asignado', alumno: null }),
    a({ tipo: 'punto', alumno: null, valor: '9' }),
    a({ tipo: 'nino_sale', alumno: 'BOSCO RAMOS' }),
    a({}),
  ]);
  equal(b.length, 2, 'dos grupos');
  equal(b[0].titulo, 'Sáb 07/11 · 09:45 · Baby · Grupo 2 · Nivel A', 'título');
  equal(b[0].lineas.join(' | '), 'Entra LUCAS PÉREZ | Sale BOSCO RAMOS | Punto de encuentro: 9', 'orden de líneas');
  equal(b[1].lineas[0], 'Ahora estás en este grupo: revísalo y confírmalo', 'asignado');
});

test('avisos: textos de cada tipo', () => {
  equal(textoAviso(a({ tipo: 'grupo_retirado' })), 'Ya no estás en este grupo', 'retirado');
  equal(textoAviso(a({ tipo: 'pista', valor: 'Grande' })), 'Pista: Grande', 'pista');
  equal(tituloBloque({ sesion_fecha: '2026-11-08', hora_inicio: null, modalidad: null, grupo_nombre: null }), 'Dom 08/11 · Grupo', 'sin datos');
});
