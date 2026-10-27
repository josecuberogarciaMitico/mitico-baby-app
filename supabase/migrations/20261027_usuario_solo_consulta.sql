-- 20261027 · Usuario «Solo consulta» (rol = 'consulta')
--
-- Para que alguien (la jefa de Jose) vea la app de coordinación sin poder
-- cambiar nada. El rol 'consulta' pasa los permisos de coordinación SOLO cuando
-- la petición es de lectura: PostgREST abre las lecturas (GET y funciones
-- STABLE) en transacciones READ ONLY, y en esas Postgres no deja escribir.
-- Cualquier función que cambie datos va en transacción de escritura, donde el
-- rol 'consulta' NO pasa el permiso → se rechaza. Doble cerrojo.
--
-- No toca: coordinador jefe (Paco, accesos, WhatsApp dirección, informes,
-- análisis siguen solo para el jefe), ni las funciones que comprueban el rol
-- con su propia lista (disponibilidad, WhatsApp): ahí 'consulta' no entra.
--
-- Rollback: supabase/rollback/20261027_usuario_solo_consulta_rollback.sql

alter table public.usuarios_app drop constraint if exists usuarios_app_rol_check;
alter table public.usuarios_app add constraint usuarios_app_rol_check
  check (rol = any (array['coordinador_jefe','sub_coordinador','administracion','coordinador','entrenador','consulta']));

create or replace function public.es_consulta_lectura_app()
 returns boolean
 language sql
 stable security definer
 set search_path to 'public', 'pg_temp'
as $function$
  select current_setting('transaction_read_only', true) = 'on'
     and exists (
       select 1
       from public.usuarios_app u
       where u.auth_user_id = auth.uid()
         and u.activo = true
         and u.rol = 'consulta'
     );
$function$;

create or replace function public.es_coordinacion_operativa_app()
 returns boolean
 language sql
 stable security definer
 set search_path to 'public', 'pg_temp'
as $function$
  select exists (
    select 1
    from public.usuarios_app u
    where u.auth_user_id = auth.uid()
      and u.activo = true
      and u.rol in ('coordinador_jefe','sub_coordinador','coordinador')
  ) or public.es_consulta_lectura_app();
$function$;

create or replace function public.es_coordinador_disponibilidad_editor_app()
 returns boolean
 language sql
 stable security definer
 set search_path to 'public', 'pg_temp'
as $function$
  select exists (
    select 1
    from public.usuarios_app u
    where u.auth_user_id = auth.uid()
      and u.activo = true
      and u.rol in (
        'coordinador_jefe',
        'sub_coordinador',
        'administracion',
        'coordinador'
      )
  ) or public.es_consulta_lectura_app();
$function$;

create or replace function public.es_gestion_altas_app()
 returns boolean
 language sql
 stable security definer
 set search_path to 'public', 'pg_temp'
as $function$
  select exists (
    select 1
    from public.usuarios_app u
    where u.auth_user_id = auth.uid()
      and u.activo = true
      and u.rol in ('coordinador_jefe','sub_coordinador','administracion','coordinador')
  ) or public.es_consulta_lectura_app();
$function$;

revoke all on function public.es_consulta_lectura_app() from public, anon;
grant execute on function public.es_consulta_lectura_app() to authenticated;
