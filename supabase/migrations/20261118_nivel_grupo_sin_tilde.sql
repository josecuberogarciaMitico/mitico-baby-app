-- 18/11/2026 · Arreglo de 20261118_nombre_grupo_sigue_niveles.sql.
--
-- Fallo: el disparador guardaba nivel_grupo como «INICIACIÓN / A» (con tilde).
-- La app lee nivel_grupo buscando códigos sin tilde (INICIACION, A, C...), así
-- que en «INICIACIÓN» encontraba letras sueltas («C», «A») y creía que el grupo
-- tenía un C: el alta fuera de plazo decía «NO HAY ENCAJE» (Jose, viernes 20/11).
-- Ahora nivel_grupo vuelve a llevar los códigos tal cual (sin tilde), como
-- siempre; solo el NOMBRE visible lleva «INICIACIÓN».

create or replace function public.niveles_codigos_grupo_app(p_grupo_id uuid)
returns text
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select string_agg(x.codigo, ' / ' order by x.orden, x.codigo)
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
  v_visible text;
  v_codigos text;
begin
  if p_grupo_id is null then return; end if;
  v_visible := public.niveles_actuales_grupo_app(p_grupo_id);
  v_codigos := public.niveles_codigos_grupo_app(p_grupo_id);
  if v_visible is null or v_codigos is null then return; end if;
  update public.grupos g
  set nombre_grupo = substring(g.nombre_grupo from '^(Grupo [0-9]+) · Nivel ') || ' · Nivel ' || v_visible,
      nivel_grupo = v_codigos
  where g.id = p_grupo_id
    and coalesce(g.cancelado, false) = false
    and g.nombre_grupo ~ '^Grupo [0-9]+ · Nivel '
    and (g.nombre_grupo is distinct from substring(g.nombre_grupo from '^(Grupo [0-9]+) · Nivel ') || ' · Nivel ' || v_visible
         or g.nivel_grupo is distinct from v_codigos);
end;
$$;

revoke all on function public.niveles_codigos_grupo_app(uuid) from public, anon;
revoke all on function public.actualizar_nombre_nivel_grupo_app(uuid) from public, anon;

-- Corrige los grupos que ya tenían la tilde en nivel_grupo (de hoy en adelante).
select public.actualizar_nombre_nivel_grupo_app(g.id)
from public.grupos g
join public.sesiones s on s.id = g.sesion_id
where s.fecha >= (now() at time zone 'Europe/Madrid')::date
  and coalesce(g.cancelado, false) = false
  and g.nombre_grupo ~ '^Grupo [0-9]+ · Nivel ';

-- Por si alguno quedó con tilde y no sigue el patrón de nombre.
update public.grupos set nivel_grupo = replace(nivel_grupo, 'INICIACIÓN', 'INICIACION')
where nivel_grupo like '%INICIACIÓN%';

notify pgrst, 'reload schema';
