-- 18/11/2026 · El nombre de un grupo sigue a los niños que tiene (Jose: «el
-- nombre se queda con el nivel que se creó al principio y es lioso»).
--
-- Cada vez que un niño entra o sale de un grupo (mover, dividir, alta tardía,
-- quitar...), si el grupo se llama «Grupo N · Nivel ...» se cambia la parte del
-- nivel por los niveles que tiene AHORA («Grupo 2 · Nivel B+», «Grupo 1 · Nivel
-- INICIACIÓN / A») y se actualiza también nivel_grupo. Los grupos con otro
-- nombre (Ocio «OCIO SÁBADO · Grupo 1», particulares, nombres a mano, REVISAR)
-- no se tocan. Si el grupo se queda vacío, tampoco.

create or replace function public.niveles_actuales_grupo_app(p_grupo_id uuid)
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select string_agg(case when upper(x.codigo) = 'INICIACION' then 'INICIACIÓN' else x.codigo end, ' / ' order by x.orden, x.codigo)
  from (
    select distinct coalesce(na.codigo, ne.codigo) as codigo, coalesce(na.orden, ne.orden, 99) as orden
    from public.grupo_alumnos ga
    join public.alumnos al on al.id = ga.alumno_id
    left join public.niveles na on na.id = al.nivel_actual_id
    left join public.niveles ne on ne.id = al.nivel_estimado_id
    where ga.grupo_id = p_grupo_id and coalesce(na.codigo, ne.codigo) is not null
  ) x;
$$;

create or replace function public.actualizar_nombre_nivel_grupo_app(p_grupo_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_niveles text;
begin
  if p_grupo_id is null then return; end if;
  v_niveles := public.niveles_actuales_grupo_app(p_grupo_id);
  if v_niveles is null then return; end if;
  update public.grupos g
  set nombre_grupo = substring(g.nombre_grupo from '^(Grupo [0-9]+) · Nivel ') || ' · Nivel ' || v_niveles,
      nivel_grupo = v_niveles
  where g.id = p_grupo_id
    and coalesce(g.cancelado, false) = false
    and g.nombre_grupo ~ '^Grupo [0-9]+ · Nivel '
    and (g.nombre_grupo is distinct from substring(g.nombre_grupo from '^(Grupo [0-9]+) · Nivel ') || ' · Nivel ' || v_niveles
         or g.nivel_grupo is distinct from v_niveles);
end;
$$;

create or replace function public.trg_nombre_nivel_grupo_app()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if tg_op in ('DELETE', 'UPDATE') then
    perform public.actualizar_nombre_nivel_grupo_app(old.grupo_id);
  end if;
  if tg_op in ('INSERT', 'UPDATE') and (tg_op = 'INSERT' or new.grupo_id is distinct from old.grupo_id) then
    perform public.actualizar_nombre_nivel_grupo_app(new.grupo_id);
  end if;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_nombre_nivel_grupo on public.grupo_alumnos;
create trigger trg_nombre_nivel_grupo
  after insert or delete or update of grupo_id on public.grupo_alumnos
  for each row execute function public.trg_nombre_nivel_grupo_app();

revoke all on function public.niveles_actuales_grupo_app(uuid) from public, anon;
revoke all on function public.actualizar_nombre_nivel_grupo_app(uuid) from public, anon;
revoke all on function public.trg_nombre_nivel_grupo_app() from public, anon;

-- Ponerse al día: los grupos de hoy en adelante.
select public.actualizar_nombre_nivel_grupo_app(g.id)
from public.grupos g
join public.sesiones s on s.id = g.sesion_id
where s.fecha >= (now() at time zone 'Europe/Madrid')::date
  and coalesce(g.cancelado, false) = false
  and g.nombre_grupo ~ '^Grupo [0-9]+ · Nivel ';

notify pgrst, 'reload schema';
