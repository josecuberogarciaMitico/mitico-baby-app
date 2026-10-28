-- 20261028 · Clase particular de 1 o 2 niños
--
-- Hasta ahora una clase particular solo se podía crear para 1 niño
-- («PARTICULAR · alumno»). Las particulares de 2 (p. ej. dos hermanas) se
-- montaban como grupo normal y entonces la app proponía meter a más niños.
--
-- Esta función convierte un grupo YA creado de 1 o 2 niños en particular
-- (lo renombra a «PARTICULAR · NOMBRE y NOMBRE») o lo devuelve a grupo normal.
-- El resto ya funciona con ese nombre sin cambiar nada:
--   - evaluar_ratio_baby_grupo_operativa_app: 2 niños es válido;
--   - validar_publicacion: particular no necesita punto (CON JOSE);
--   - mover_alumno_entre_turnos: no deja meter a nadie en una PARTICULAR;
--   - la tabla «Niños sin colocar» no propone grupos PARTICULAR.
--
-- Rollback: supabase/rollback/20261028_grupo_particular_de_dos_rollback.sql

create or replace function public.marcar_grupo_particular_app(p_grupo_id uuid, p_particular boolean)
 returns text
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_nombre text;
  v_nivel text;
  v_total integer;
  v_nombres text;
  v_nuevo text;
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso para realizar esta acción operativa.';
  end if;

  select g.nombre_grupo, g.nivel_grupo into v_nombre, v_nivel
  from public.grupos g
  where g.id = p_grupo_id and coalesce(g.cancelado, false) = false
  for update;
  if v_nombre is null then
    raise exception 'No existe el grupo.';
  end if;

  select count(*)::integer, string_agg(trim(a.nombre_completo), ' y ' order by ga.orden, a.nombre_completo)
    into v_total, v_nombres
  from public.grupo_alumnos ga
  join public.alumnos a on a.id = ga.alumno_id
  where ga.grupo_id = p_grupo_id;

  if p_particular then
    if v_total not between 1 and 2 then
      raise exception 'Una clase particular es de 1 o 2 niños (este grupo tiene %).', v_total;
    end if;
    v_nuevo := 'PARTICULAR · ' || v_nombres;
  else
    if upper(trim(coalesce(v_nombre, ''))) not like 'PARTICULAR · %' then
      return v_nombre;
    end if;
    v_nuevo := 'Grupo · Nivel ' || coalesce(nullif(trim(v_nivel), ''), 'Sin nivel');
  end if;

  update public.grupos set nombre_grupo = v_nuevo where id = p_grupo_id;
  return v_nuevo;
end;
$function$;

revoke all on function public.marcar_grupo_particular_app(uuid, boolean) from public, anon;
grant execute on function public.marcar_grupo_particular_app(uuid, boolean) to authenticated;
