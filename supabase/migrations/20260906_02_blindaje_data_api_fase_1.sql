-- Mítico Baby App · Commit/PR 63
-- Fase 1 de blindaje de la Data API.
--
-- Objetivos:
--   1. Activar RLS en las 25 tablas públicas que estaban expuestas sin RLS.
--   2. Retirar acceso anónimo a tablas y vistas.
--   3. Evitar escrituras directas desde el navegador; las mutaciones pasan por RPC.
--   4. Sustituir políticas históricas USING (true) por lectura de coordinación.
--   5. Conservar como públicas únicamente las tres RPC del test por token.
--
-- IMPORTANTE: ejecutar primero en un entorno de pruebas y validar todos los roles.
-- Esta migración se entrega revisable y NO se ha aplicado a producción.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

-- Las tablas de referencia pueden ser consultadas por cualquier usuario autenticado.
alter table public.temporadas enable row level security;
alter table public.modalidades enable row level security;
alter table public.niveles enable row level security;
alter table public.turnos_base enable row level security;
alter table public.semanas enable row level security;

-- El resto de las tablas históricas sin RLS queda limitado a coordinación.
alter table public.entrenadores enable row level security;
alter table public.sesiones enable row level security;
alter table public.listados enable row level security;
alter table public.listado_alumnos enable row level security;
alter table public.grupos enable row level security;
alter table public.grupo_alumnos enable row level security;
alter table public.asignaciones_entrenadores enable row level security;
alter table public.asistencias enable row level security;
alter table public.responsables_reporte enable row level security;
alter table public.reportes enable row level security;
alter table public.cierre_reportes_entrenador enable row level security;
alter table public.intensivos enable row level security;
alter table public.intensivo_dias enable row level security;
alter table public.intensivo_asistencias enable row level security;
alter table public.intensivo_recuperaciones enable row level security;
alter table public.cobros_meses enable row level security;
alter table public.servicios_entrenador enable row level security;
alter table public.informes_resumen enable row level security;
alter table public.alertas enable row level security;
alter table public.mensajes_preparados enable row level security;

-- Retira políticas antiguas de estas 25 tablas antes de crear la matriz explícita.
do $migration$
declare
  v_policy record;
begin
  for v_policy in
    select schemaname, tablename, policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = any (array[
        'temporadas', 'modalidades', 'niveles', 'turnos_base', 'semanas',
        'entrenadores', 'sesiones', 'listados', 'listado_alumnos', 'grupos',
        'grupo_alumnos', 'asignaciones_entrenadores', 'asistencias',
        'responsables_reporte', 'reportes', 'cierre_reportes_entrenador',
        'intensivos', 'intensivo_dias', 'intensivo_asistencias',
        'intensivo_recuperaciones', 'cobros_meses', 'servicios_entrenador',
        'informes_resumen', 'alertas', 'mensajes_preparados'
      ]::text[])
  loop
    execute format(
      'drop policy if exists %I on %I.%I',
      v_policy.policyname,
      v_policy.schemaname,
      v_policy.tablename
    );
  end loop;
end
$migration$;

create policy temporadas_select_authenticated
  on public.temporadas for select to authenticated using (true);
create policy modalidades_select_authenticated
  on public.modalidades for select to authenticated using (true);
create policy niveles_select_authenticated
  on public.niveles for select to authenticated using (true);
create policy turnos_base_select_authenticated
  on public.turnos_base for select to authenticated using (true);
create policy semanas_select_authenticated
  on public.semanas for select to authenticated using (true);

do $migration$
declare
  v_table text;
begin
  foreach v_table in array array[
    'entrenadores', 'sesiones', 'listados', 'listado_alumnos', 'grupos',
    'grupo_alumnos', 'asignaciones_entrenadores', 'asistencias',
    'responsables_reporte', 'reportes', 'cierre_reportes_entrenador',
    'intensivos', 'intensivo_dias', 'intensivo_asistencias',
    'intensivo_recuperaciones', 'cobros_meses', 'servicios_entrenador',
    'informes_resumen', 'alertas', 'mensajes_preparados'
  ]
  loop
    execute format(
      'create policy %I on public.%I for select to authenticated using (public.es_coordinacion_operativa_app())',
      v_table || '_select_coordinacion',
      v_table
    );
  end loop;
end
$migration$;

-- El rol anónimo deja de tener acceso directo a cualquier tabla, vista o secuencia.
revoke all privileges on all tables in schema public from public, anon;
revoke all privileges on all sequences in schema public from public, anon;

-- Ningún usuario del frontend escribe directamente en tablas. Las RPC SECURITY
-- DEFINER aplican la autorización y validación de cada operación. El bucle limita
-- el REVOKE a tablas reales para no pedir privilegios incompatibles a las vistas.
do $migration$
declare
  v_relation record;
begin
  for v_relation in
    select n.nspname as schema_name, c.relname as relation_name
    from pg_class c
    join pg_namespace n on n.oid = c.relnamespace
    where n.nspname = 'public'
      and c.relkind in ('r', 'p')
  loop
    execute format(
      'revoke insert, update, delete, truncate, references, trigger on table %I.%I from authenticated',
      v_relation.schema_name,
      v_relation.relation_name
    );
  end loop;
end
$migration$;

-- Repara tablas que ya tenían RLS, pero políticas históricas abiertas a anon o
-- autenticados con USING (true). La lectura legítima continúa a través de vistas
-- filtradas o RPC, y coordinación conserva lectura directa.
do $migration$
declare
  v_table text;
  v_policy record;
begin
  foreach v_table in array array[
    'alumnos',
    'ocio_grupos_estables',
    'ocio_grupo_alumnos',
    'ocio_reubicaciones',
    'cobros_ajustes_entrenador',
    'cobros_entrenos_manuales',
    'cobros_estado_mensual_entrenador',
    'grupo_entrenadores_extra_app',
    'grupo_reporte_responsable_app',
    'reporte_progresion_inicial_app',
    'reporte_fase_viraje_app',
    'whatsapp_grupos_app'
  ]
  loop
    for v_policy in
      select policyname
      from pg_policies
      where schemaname = 'public' and tablename = v_table
    loop
      execute format(
        'drop policy if exists %I on public.%I',
        v_policy.policyname,
        v_table
      );
    end loop;

    execute format(
      'create policy %I on public.%I for select to authenticated using (public.es_coordinacion_operativa_app())',
      v_table || '_select_coordinacion',
      v_table
    );
  end loop;
end
$migration$;

-- Quita el EXECUTE implícito que PostgreSQL concede a PUBLIC. Los permisos
-- explícitos de authenticated/service_role existentes se conservan.
revoke execute on all functions in schema public from public, anon;

-- Evita que objetos nuevos vuelvan a quedar expuestos por los privilegios por
-- defecto de PostgreSQL. Cada migración futura deberá conceder solo lo necesario.
alter default privileges for role postgres in schema public
  revoke select, insert, update, delete on tables from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke usage, select on sequences from anon, authenticated, service_role;
alter default privileges for role postgres in schema public
  revoke execute on functions from public, anon, authenticated, service_role;

-- Únicas RPC públicas intencionadas: test de nivel mediante token no adivinable.
grant execute on function public.evaluar_test_nivel_inicial_app(
  text, text, text, text, text, text, text, text
) to anon, authenticated;
grant execute on function public.obtener_test_nivel_publico_app(uuid)
  to anon, authenticated;
grant execute on function public.responder_test_nivel_publico_app(
  uuid, text, text, text, text, text, text, text, text, text[], text, text
) to anon, authenticated;

-- Defensa explícita del hallazgo crítico: nunca accesible de forma anónima.
revoke execute on function public.desasignar_entrenador_grupo_app(uuid)
  from public, anon;

commit;
