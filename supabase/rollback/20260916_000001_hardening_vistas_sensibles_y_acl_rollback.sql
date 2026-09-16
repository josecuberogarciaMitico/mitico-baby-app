-- ROLLBACK de 20260916_000001_hardening_vistas_sensibles_y_acl
-- Usar únicamente ante fallo funcional grave y con autorización expresa.
-- Reabre deliberadamente permisos previos, incluida la exposición anónima detectada.

begin;

do $rollback_views$
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
      raise exception 'Falta public.%: no se puede garantizar rollback exacto.', v_raw;
    end if;
    if to_regclass(format('public.%I', v_name)) is not null then
      execute format('drop view public.%I', v_name);
    end if;
    execute format('alter view public.%I rename to %I', v_raw, v_name);
  end loop;
end
$rollback_views$;

do $restore_acl$
declare
  v_name text;
  v_anon_views constant text[] := array[
    'v_ocio_alumnos_v2_app',
    'v_recuperaciones_recomendaciones_intensivo_app',
    'v_reportes_detalle_intensivo_app',
    'v_reportes_detalle_intensivo_recuperaciones_app',
    'v_resumen_alumno_v2',
    'v_resumen_final_intensivo_recuperaciones_app',
    'v_resumen_reportes_intensivo_recuperaciones_app',
    'v_ultima_fase_viraje_alumno_app',
    'v_ultima_progresion_inicial_alumno_app'
  ];
begin
  foreach v_name in array v_anon_views loop
    execute format('grant all on table public.%I to anon, authenticated, service_role', v_name);
  end loop;
end
$restore_acl$;

grant all on table public.v_reportes_adaptativo_detalle_intensivo_app to authenticated, service_role;
revoke all on table public.v_reportes_adaptativo_detalle_intensivo_app from anon;

drop policy if exists turnos_base_select_authenticated_catalogo on public.turnos_base;
drop policy if exists temporadas_select_authenticated_catalogo on public.temporadas;
drop policy if exists niveles_select_authenticated_catalogo on public.niveles;
drop policy if exists modalidades_select_authenticated_catalogo on public.modalidades;
alter table public.turnos_base disable row level security;
alter table public.temporadas disable row level security;
alter table public.niveles disable row level security;
alter table public.modalidades disable row level security;
revoke all on table public.turnos_base, public.temporadas, public.niveles, public.modalidades from public, anon, authenticated;
grant select on table public.turnos_base, public.temporadas, public.niveles, public.modalidades to authenticated;
grant all on table public.turnos_base, public.temporadas, public.niveles, public.modalidades to service_role;

grant execute on function public.cambiar_entrenador_grupo_excepcional_app(uuid,uuid) to public, anon, authenticated, service_role;
grant execute on function public.desasignar_entrenador_grupo_app(uuid) to public, anon, authenticated, service_role;
grant execute on function public.extraer_evaluacion_ocio_app(uuid) to public, anon, authenticated, service_role;
grant execute on function public.obtener_evaluacion_anual_ocio_app() to public, anon, authenticated, service_role;
grant execute on function public.crear_reporte_alumno_app(uuid,uuid,uuid,text,text,text,text,text,text,text,text,text,text) to public, anon, authenticated, service_role;
grant execute on function public.crear_reporte_alumno_app(uuid,uuid,uuid,text,text,text,text,text,text,text,text,text) to public, anon, authenticated, service_role;

commit;
