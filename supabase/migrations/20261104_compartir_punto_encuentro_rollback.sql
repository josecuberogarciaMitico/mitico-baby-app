-- Rollback de 20261104_compartir_punto_encuentro.sql: vuelve a rechazar siempre un punto ya usado.
create or replace function public.cambiar_punto_encuentro_grupo_app(p_grupo_id uuid, p_punto_encuentro text)
 returns void
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_fecha date;
  v_hora_inicio time without time zone;
  v_hora_fin time without time zone;
  v_punto text;
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso para realizar esta acción operativa.';
  end if;
  if p_grupo_id is null then raise exception 'Falta grupo_id.'; end if;

  v_punto := nullif(trim(coalesce(p_punto_encuentro, '')), '');
  if v_punto is null then raise exception 'Selecciona un punto de encuentro.'; end if;

  select s.fecha, s.hora_inicio, s.hora_fin
  into v_fecha, v_hora_inicio, v_hora_fin
  from public.grupos g
  join public.sesiones s on s.id = g.sesion_id
  where g.id = p_grupo_id and coalesce(g.cancelado, false) = false;

  if v_fecha is null then raise exception 'No existe el grupo indicado.'; end if;

  if exists (
    select 1
    from public.grupos g
    join public.sesiones s on s.id = g.sesion_id
    where s.fecha = v_fecha
      and s.hora_inicio < v_hora_fin
      and v_hora_inicio < s.hora_fin
      and g.id <> p_grupo_id
      and coalesce(g.cancelado, false) = false
      and trim(coalesce(g.punto_encuentro, '')) = v_punto
  ) then
    raise exception 'Ese punto de encuentro ya está usado por un grupo que se solapa en ese turno.';
  end if;

  update public.grupos set punto_encuentro = v_punto where id = p_grupo_id;
end;
$function$;
