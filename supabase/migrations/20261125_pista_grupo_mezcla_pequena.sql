-- 25/11/2026 (Jose, corrección): si en el grupo hay algún niño de Iniciación o A
-- (y no son mayoría B o más), el grupo va a pista PEQUEÑA: los A+ mezclados con
-- iniciación suelen ser A+ a los que les falta un poco.
--   Mayoría B o más → Grande · algún Ini/A → Pequeña · solo A+ (con algún B) → Pequeña/Grande.
create or replace function public.pista_por_niveles_grupo_app(p_grupo_id uuid)
returns text
language sql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
  with k as (
    select count(*) filter (where n.codigo in ('INICIACION','A')) p,
           count(*) filter (where n.codigo = 'A+') pg,
           count(*) filter (where n.orden >= 3) gr
    from public.grupo_alumnos ga
    join public.alumnos a on a.id = ga.alumno_id
    join public.niveles n on n.id = a.nivel_actual_id
    where ga.grupo_id = p_grupo_id
  )
  select case
    when p + pg + gr = 0 then null
    when gr * 2 > p + pg + gr then 'Grande'
    when p > 0 then 'Pequeña'
    else 'Pequeña/Grande'
  end
  from k;
$$;
revoke all on function public.pista_por_niveles_grupo_app(uuid) from public, anon;
