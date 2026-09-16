-- MÍTICO BABY APP · HARDENING DE SEGURIDAD · 2026-09-16
-- APLICADA EN PRODUCCIÓN el 2026-09-16 mediante Supabase migration.
-- Objetivo: cerrar acceso anónimo a vistas sensibles, activar RLS en catálogos
-- y retirar EXECUTE anónimo de RPC internas, manteniendo los RPC públicos del test.

begin;

do $guard$
begin
  if to_regprocedure('public.es_gestion_altas_app()') is null then
    raise exception 'Falta public.es_gestion_altas_app(); se cancela la migración.';
  end if;
end
$guard$;

do $secure_views$
declare
  v_name text;
  v_raw text;
  v_names constant text[] := array[
    'v_ocio_alumnos_v2_app',
    'v_recuperaciones_recomendaciones_intensivo_app',
    'v_reportes_detalle_intensivo_app',
    'v_reportes_detalle_intensivo_recuperaciones_app',
    'v_resumen_alumno_v2',
    'v_resumen_final_intensivo_recuperaciones_app',
    'v_resumen_reportes_intensivo_recuperaciones_app',
    'v_ultima_fase_viraje_alumno_app',
    'v_ultima_progresion_inicial_alumno_app',
    'v_reportes_adaptativo_detalle_intensivo_app'
  ];
begin
  foreach v_name in array v_names loop
    v_raw := v_name || '_raw_s1';

    if to_regclass(format('public.%I', v_raw)) is null then
      if to_regclass(format('public.%I', v_name)) is null then
        raise exception 'No existe public.%: se cancela la migración.', v_name;
      end if;
      execute format('alter view public.%I rename to %I', v_name, v_raw);
    end if;

    execute format(
      'create or replace view public.%I with (security_barrier = true) as
       select raw.* from public.%I raw where public.es_gestion_altas_app()',
      v_name, v_raw
    );

    execute format('revoke all on table public.%I from public, anon, authenticated', v_raw);
    execute format('revoke all on table public.%I from public, anon, authenticated', v_name);
    execute format('grant select on table public.%I to authenticated', v_name);
    execute format('grant all on table public.%I to service_role', v_name);
  end loop;
end
$secure_views$;

alter table public.turnos_base enable row level security;
alter table public.temporadas enable row level security;
alter table public.niveles enable row level security;
alter table public.modalidades enable row level security;

drop policy if exists turnos_base_select_authenticated_catalogo on public.turnos_base;
create policy turnos_base_select_authenticated_catalogo on public.turnos_base for select to authenticated using (true);
drop policy if exists temporadas_select_authenticated_catalogo on public.temporadas;
create policy temporadas_select_authenticated_catalogo on public.temporadas for select to authenticated using (true);
drop policy if exists niveles_select_authenticated_catalogo on public.niveles;
create policy niveles_select_authenticated_catalogo on public.niveles for select to authenticated using (true);
drop policy if exists modalidades_select_authenticated_catalogo on public.modalidades;
create policy modalidades_select_authenticated_catalogo on public.modalidades for select to authenticated using (true);

revoke all on table public.turnos_base, public.temporadas, public.niveles, public.modalidades from public, anon, authenticated;
grant select on table public.turnos_base, public.temporadas, public.niveles, public.modalidades to authenticated;
grant all on table public.turnos_base, public.temporadas, public.niveles, public.modalidades to service_role;

revoke execute on function public.cambiar_entrenador_grupo_excepcional_app(uuid,uuid) from public, anon;
grant execute on function public.cambiar_entrenador_grupo_excepcional_app(uuid,uuid) to authenticated, service_role;
revoke execute on function public.desasignar_entrenador_grupo_app(uuid) from public, anon;
grant execute on function public.desasignar_entrenador_grupo_app(uuid) to authenticated, service_role;
revoke execute on function public.extraer_evaluacion_ocio_app(uuid) from public, anon;
grant execute on function public.extraer_evaluacion_ocio_app(uuid) to authenticated, service_role;
revoke execute on function public.obtener_evaluacion_anual_ocio_app() from public, anon;
grant execute on function public.obtener_evaluacion_anual_ocio_app() to authenticated, service_role;
revoke execute on function public.crear_reporte_alumno_app(uuid,uuid,uuid,text,text,text,text,text,text,text,text,text,text) from public, anon;
grant execute on function public.crear_reporte_alumno_app(uuid,uuid,uuid,text,text,text,text,text,text,text,text,text,text) to authenticated, service_role;
revoke execute on function public.crear_reporte_alumno_app(uuid,uuid,uuid,text,text,text,text,text,text,text,text,text) from public, anon;
grant execute on function public.crear_reporte_alumno_app(uuid,uuid,uuid,text,text,text,text,text,text,text,text,text) to authenticated, service_role;

do $post_acl$
declare
  v_name text;
  v_names constant text[] := array[
    'v_ocio_alumnos_v2_app',
    'v_recuperaciones_recomendaciones_intensivo_app',
    'v_reportes_detalle_intensivo_app',
    'v_reportes_detalle_intensivo_recuperaciones_app',
    'v_resumen_alumno_v2',
    'v_resumen_final_intensivo_recuperaciones_app',
    'v_resumen_reportes_intensivo_recuperaciones_app',
    'v_ultima_fase_viraje_alumno_app',
    'v_ultima_progresion_inicial_alumno_app',
    'v_reportes_adaptativo_detalle_intensivo_app'
  ];
begin
  foreach v_name in array v_names loop
    if has_table_privilege('anon', format('public.%I', v_name), 'SELECT') then
      raise exception 'anon conserva SELECT sobre public.%', v_name;
    end if;
    if not has_table_privilege('authenticated', format('public.%I', v_name), 'SELECT') then
      raise exception 'authenticated perdió SELECT sobre public.%', v_name;
    end if;
  end loop;
end
$post_acl$;

commit;
