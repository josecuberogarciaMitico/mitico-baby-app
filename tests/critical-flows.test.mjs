import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), 'utf8');

test('el backup visible usa exclusivamente el contrato V2', async () => {
  const app = await read('src/App.tsx');
  assert.match(app, /obtener_backup_operativa_v2_app/u);
  assert.match(app, /validar_backup_operativa_v2_app/u);
  assert.match(app, /restaurar_backup_operativa_v2_app/u);
  assert.match(app, /RESTAURAR BACKUP V2/u);
  assert.doesNotMatch(app, /['"]obtener_backup_semanal_app['"]/u);
  assert.doesNotMatch(app, /['"]restaurar_backup_semanal_app['"]/u);
});

test('AimHarder identifica la clase completa y conserva ocupación independiente', async () => {
  const app = await read('src/App.tsx');
  const bridge = await read('public/aimharder-integration.js');
  const edge = await read('supabase/functions/mitico-aimharder-read/index.ts');

  for (const source of [app, bridge]) {
    assert.match(source, /action:\s*['"]attendees['"]/u);
    assert.match(source, /className:/u);
    assert.match(source, /timeId:/u);
    assert.match(source, /modalidad:/u);
  }

  assert.match(edge, /reportedOccupation/u);
  assert.match(bridge, /booking\?\.reportedOccupation/u);
  assert.doesNotMatch(edge, /if\s*\(at\.length\)\s*b\.ocupation/u);
  assert.doesNotMatch(edge, /booking:\s*\{\s*\.\.\.b,\s*ocupation:\s*at\.length/u);
});

test('los homónimos no se fusionan ni se adivinan por nombre', async () => {
  const app = await read('src/App.tsx');
  const edge = await read('supabase/functions/mitico-aimharder-read/index.ts');

  assert.match(app, /DatosContactoAimHarderApp\[\]/u);
  assert.match(app, /coincidencias\.length\s*===\s*1\s*\?\s*coincidencias\[0\]/u);
  assert.match(edge, /ids\.size>1/u);
  assert.doesNotMatch(edge, /new Map\(at\.map\(x=>\[N\(x\.name\),x\]\)\)/u);
});

test('Administración no hereda permisos de coordinación', async () => {
  const app = await read('src/App.tsx');
  const edges = await Promise.all([
    read('supabase/functions/mitico-push/index.ts'),
    read('supabase/functions/mitico-group-assignment-push/index.ts'),
    read('supabase/functions/mitico-report-reminders/index.ts'),
  ]);

  const coordinationHelper = app.match(
    /function esRolCoordinacionApp[\s\S]*?\n\}/u
  )?.[0] ?? '';
  assert.ok(coordinationHelper);
  assert.doesNotMatch(coordinationHelper, /administracion/u);

  for (const edge of edges) {
    const roleSet = edge.match(/rolesCoordinacion\s*=\s*new Set\(\[[\s\S]*?\]\)/u)?.[0] ?? '';
    assert.ok(roleSet);
    assert.doesNotMatch(roleSet, /administracion/u);
  }
});

test('las 25 tablas detectadas quedan cubiertas por la migración RLS', async () => {
  const migration = await read(
    'supabase/migrations/20260906_02_blindaje_data_api_fase_1.sql'
  );
  const tables = [
    'temporadas', 'modalidades', 'niveles', 'turnos_base', 'entrenadores',
    'semanas', 'sesiones', 'listados', 'listado_alumnos', 'grupos',
    'grupo_alumnos', 'asignaciones_entrenadores', 'asistencias',
    'responsables_reporte', 'reportes', 'cierre_reportes_entrenador',
    'intensivos', 'intensivo_dias', 'intensivo_asistencias',
    'intensivo_recuperaciones', 'cobros_meses', 'servicios_entrenador',
    'informes_resumen', 'alertas', 'mensajes_preparados',
  ];

  assert.equal(tables.length, 25);
  for (const table of tables) {
    assert.match(
      migration,
      new RegExp(`alter table public\\.${table} enable row level security`, 'u')
    );
  }
  assert.match(migration, /desasignar_entrenador_grupo_app\(uuid\)[\s\S]*from public, anon/u);
});

test('la modalidad se normaliza y continúa limitada a tres valores', async () => {
  const migration = await read(
    'supabase/migrations/20260906_01_normalizar_modalidades_disponibilidad.sql'
  );
  assert.match(migration, /upper\(btrim\(value\)\)/u);
  assert.match(migration, /when 'BABY' then 'Baby'/u);
  assert.match(migration, /when 'OCIO' then 'Ocio'/u);
  assert.match(migration, /when 'INTENSIVOS' then 'Intensivos'/u);
  assert.match(migration, /modalidad not in \('Baby', 'Ocio', 'Intensivos'\)/u);
});

test('el cambio del PR 64 sobre camisetas está versionado y protegido', async () => {
  const app = await read('src/App.tsx');
  const migration = await read(
    'supabase/migrations/20260906_05_camisetas_alumnos_pr64.sql'
  );
  assert.match(app, /camiseta_entregada:\s*boolean/u);
  assert.match(app, /actualizar_camiseta_alumno_app/u);
  assert.match(migration, /camiseta_entregada boolean not null default false/u);
  assert.match(migration, /es_coordinacion_operativa_app\(\)/u);
  assert.match(migration, /from public, anon/u);
});

test('la puerta de Data API diferencia coordinación, administración y entrenador', async () => {
  const migration = await read(
    'supabase/migrations/20260906_06_puerta_data_api_por_rol.sql'
  );
  assert.match(migration, /pgrst\.db_pre_request/u);
  assert.match(migration, /v_app_role = 'coordinador_jefe'/u);
  assert.match(migration, /v_app_role = 'administracion'/u);
  assert.match(migration, /v_app_role = 'entrenador'/u);
  assert.match(migration, /v_grupos_entrenador_app_dos_entrenadores/u);
  assert.match(migration, /Administración solo puede acceder a Altas\/Test/u);
});

test('los recordatorios conservan autenticación propia reforzada', async () => {
  const edge = await read('supabase/functions/mitico-report-reminders/index.ts');
  assert.match(edge, /x-mitico-cron-secret/u);
  assert.match(edge, /secretosIguales/u);
  assert.match(edge, /crypto\.subtle\.digest\('SHA-256'/u);
  assert.doesNotMatch(edge, /secretoRecibido\s*!==\s*secretoEsperado/u);
});

test('el inventario RPC del commit final PR 65 coincide con Supabase', async () => {
  const report = JSON.parse(await read('audit-rpc-contracts-final.json'));
  assert.equal(report.summary.unique_contracts, 110);
  assert.equal(report.summary.missing_functions, 0);
  assert.equal(report.summary.signature_mismatches, 0);
  assert.equal(report.summary.dynamic_bodies, 0);
  assert.equal(report.pr64_addition.name, 'actualizar_camiseta_alumno_app');
  assert.equal(report.pr64_addition.anon_execute, false);
});
