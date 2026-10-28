-- Rollback de 20261028_cambios_turno_publico.sql
-- Quita las funciones públicas y el código secreto; deja registrar_... como estaba.
drop function if exists public.obtener_propuesta_cambio_turno_publico_app(uuid);
drop function if exists public.responder_propuesta_cambio_turno_publico_app(uuid, text);
drop function if exists public.mover_por_respuesta_familia_app(uuid, uuid);
drop function if exists public.registrar_propuesta_cambio_turno_app(uuid, uuid, uuid, jsonb, text, text, uuid);

create or replace function public.registrar_propuesta_cambio_turno_app(
  p_sesion_alumno_id uuid,
  p_alumno_id uuid,
  p_sesion_origen_id uuid,
  p_opciones jsonb,
  p_telefono text default null,
  p_mensaje text default null
)
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_id uuid;
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'Solo coordinación puede registrar propuestas de cambio de turno.';
  end if;
  if p_sesion_alumno_id is null or p_alumno_id is null or p_sesion_origen_id is null then
    raise exception 'Faltan datos de la propuesta.';
  end if;
  select c.id into v_id
  from public.cambios_turno_propuestos_app c
  where c.sesion_alumno_id = p_sesion_alumno_id
    and c.estado in ('ENVIADO', 'ACEPTADO', 'RECHAZADO')
  order by c.created_at desc
  limit 1;
  if v_id is not null then
    update public.cambios_turno_propuestos_app
    set opciones = coalesce(p_opciones, '[]'::jsonb), estado = 'ENVIADO', opcion_aceptada = null,
        telefono = p_telefono, mensaje = p_mensaje
    where id = v_id;
    return v_id;
  end if;
  insert into public.cambios_turno_propuestos_app(
    sesion_alumno_id, alumno_id, sesion_origen_id, opciones, estado, telefono, mensaje
  ) values (
    p_sesion_alumno_id, p_alumno_id, p_sesion_origen_id, coalesce(p_opciones, '[]'::jsonb), 'ENVIADO', p_telefono, p_mensaje
  )
  returning id into v_id;
  return v_id;
end;
$function$;
revoke all on function public.registrar_propuesta_cambio_turno_app(uuid, uuid, uuid, jsonb, text, text) from public, anon;
grant execute on function public.registrar_propuesta_cambio_turno_app(uuid, uuid, uuid, jsonb, text, text) to authenticated;

alter table public.cambios_turno_propuestos_app
  drop column if exists token_publico,
  drop column if exists respondido_familia_at,
  drop column if exists movido_at;
