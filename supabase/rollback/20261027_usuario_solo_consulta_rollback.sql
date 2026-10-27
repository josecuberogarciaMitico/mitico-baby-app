-- Rollback de 20261027_usuario_solo_consulta.sql
-- 1) Desactiva los usuarios 'consulta' (no se pueden quedar con un rol no permitido).
update public.usuarios_app set activo = false, rol = 'administracion' where rol = 'consulta';

-- 2) Permisos como estaban.
create or replace function public.es_coordinacion_operativa_app()
 returns boolean language sql stable security definer set search_path to 'public', 'pg_temp'
as $function$
  select exists (select 1 from public.usuarios_app u where u.auth_user_id = auth.uid() and u.activo = true
    and u.rol in ('coordinador_jefe','sub_coordinador','coordinador'));
$function$;

create or replace function public.es_coordinador_disponibilidad_editor_app()
 returns boolean language sql stable security definer set search_path to 'public', 'pg_temp'
as $function$
  select exists (select 1 from public.usuarios_app u where u.auth_user_id = auth.uid() and u.activo = true
    and u.rol in ('coordinador_jefe','sub_coordinador','administracion','coordinador'));
$function$;

create or replace function public.es_gestion_altas_app()
 returns boolean language sql stable security definer set search_path to 'public', 'pg_temp'
as $function$
  select exists (select 1 from public.usuarios_app u where u.auth_user_id = auth.uid() and u.activo = true
    and u.rol in ('coordinador_jefe','sub_coordinador','administracion','coordinador'));
$function$;

drop function if exists public.es_consulta_lectura_app();

alter table public.usuarios_app drop constraint if exists usuarios_app_rol_check;
alter table public.usuarios_app add constraint usuarios_app_rol_check
  check (rol = any (array['coordinador_jefe','sub_coordinador','administracion','coordinador','entrenador']));
