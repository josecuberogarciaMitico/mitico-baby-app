-- Aplicada en MITICO_OPERATIVA_V2 el 2026-09-16.
-- Aísla por rol todas las vistas expuestas a authenticated y limita las vistas de entrenador a su entrenador_id.
begin;

do $existing_wrappers$
declare
  v_name text;
  v_raw text;
  v_names constant text[] := array[
    'v_ocio_alumnos_v2_app','v_recuperaciones_recomendaciones_intensivo_app',
    'v_reportes_detalle_intensivo_app','v_reportes_detalle_intensivo_recuperaciones_app',
    'v_resumen_alumno_v2','v_resumen_final_intensivo_recuperaciones_app',
    'v_resumen_reportes_intensivo_recuperaciones_app','v_ultima_fase_viraje_alumno_app',
    'v_ultima_progresion_inicial_alumno_app','v_reportes_adaptativo_detalle_intensivo_app'
  ];
begin
  foreach v_name in array v_names loop
    v_raw := v_name || '_raw_s1';
    if to_regclass(format('public.%I', v_raw)) is null then
      raise exception 'Falta public.%: se cancela el hardening de vistas.', v_raw;
    end if;
    execute format(
      'create or replace view public.%I with (security_barrier = true) as
       select raw.* from public.%I raw
       where current_user = ''service_role'' or public.es_gestion_altas_app()',
      v_name, v_raw
    );
    execute format('revoke all on table public.%I from public, anon, authenticated', v_name);
    execute format('grant select on table public.%I to authenticated', v_name);
    execute format('grant all on table public.%I to service_role', v_name);
  end loop;
end
$existing_wrappers$;

do $role_boundaries$
declare
  r record;
  v_raw text;
  v_trainer_views constant text[] := array[
    'v_grupos_entrenador_app_dos_entrenadores',
    'v_alumnos_reporte_entrenador_app_dos_entrenadores',
    'v_reportes_pendientes_entrenador_dos_entrenadores'
  ];
  v_existing_s1 constant text[] := array[
    'v_ocio_alumnos_v2_app','v_recuperaciones_recomendaciones_intensivo_app',
    'v_reportes_detalle_intensivo_app','v_reportes_detalle_intensivo_recuperaciones_app',
    'v_resumen_alumno_v2','v_resumen_final_intensivo_recuperaciones_app',
    'v_resumen_reportes_intensivo_recuperaciones_app','v_ultima_fase_viraje_alumno_app',
    'v_ultima_progresion_inicial_alumno_app','v_reportes_adaptativo_detalle_intensivo_app'
  ];
begin
  for r in
    select c.relname
    from pg_class c
    join pg_namespace n on n.oid=c.relnamespace
    where n.nspname='public'
      and c.relkind='v'
      and has_table_privilege('authenticated',c.oid,'SELECT')
      and c.relname not like '%\_raw\_s%' escape E'\\'
      and not (c.relname = any(v_existing_s1))
    order by c.relname
  loop
    v_raw := r.relname || '_raw_s2';
    if to_regclass(format('public.%I', v_raw)) is not null then
      raise exception 'Ya existe public.%: se cancela para evitar sobrescritura.', v_raw;
    end if;
    execute format('alter view public.%I rename to %I', r.relname, v_raw);
    if r.relname = any(v_trainer_views) then
      execute format(
        'create view public.%I with (security_barrier = true) as
         select raw.* from public.%I raw
         where current_user = ''service_role''
            or public.es_gestion_altas_app()
            or raw.entrenador_id = public.entrenador_actual_app()',
        r.relname, v_raw
      );
    else
      execute format(
        'create view public.%I with (security_barrier = true) as
         select raw.* from public.%I raw
         where current_user = ''service_role''
            or public.es_gestion_altas_app()',
        r.relname, v_raw
      );
    end if;
    execute format('revoke all on table public.%I from public, anon, authenticated', v_raw);
    execute format('revoke all on table public.%I from public, anon, authenticated', r.relname);
    execute format('grant select on table public.%I to authenticated', r.relname);
    execute format('grant all on table public.%I to service_role', r.relname);
  end loop;
end
$role_boundaries$;

commit;
