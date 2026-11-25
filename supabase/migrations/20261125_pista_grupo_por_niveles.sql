-- 25/11/2026 (Jose): la pista del grupo (y por tanto FF / Corporate en Xanadú y lo
-- que ve el entrenador) sale de los niveles de TODOS sus niños, no del primero.
--   Por niño: INICIACION y A → pequeña · A+ → pequeña/grande · B en adelante → grande.
--   Por grupo, manda la mayoría: >50 % B+ → Grande; >50 % Ini/A → Pequeña;
--   si no (mayoría A+ o mezcla igualada) → Pequeña/Grande.
-- Solo Baby e Intensivos. Se recalcula sola al entrar/salir/moverse un niño.

update public.niveles set pista_recomendada = 'Pequeña/Grande' where codigo = 'A+';

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
    when p * 2 > p + pg + gr then 'Pequeña'
    else 'Pequeña/Grande'
  end
  from k;
$$;

create or replace function public.recalcular_pista_grupo_app(p_grupo_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare v_mod text; v_pista text;
begin
  if p_grupo_id is null then return; end if;
  select upper(trim(coalesce(m.codigo, m.nombre, ''))) into v_mod
  from public.grupos g join public.modalidades m on m.id = g.modalidad_id
  where g.id = p_grupo_id;
  if v_mod is null or not (v_mod = 'BABY' or v_mod like 'INTENSIV%') then return; end if;
  v_pista := public.pista_por_niveles_grupo_app(p_grupo_id);
  if v_pista is null then return; end if;
  update public.grupos set pista = v_pista
  where id = p_grupo_id and pista is distinct from v_pista;
end;
$$;

create or replace function public.trg_pista_grupo_por_niveles_app()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  if tg_op in ('DELETE', 'UPDATE') then
    perform public.recalcular_pista_grupo_app(old.grupo_id);
  end if;
  if tg_op = 'INSERT' or (tg_op = 'UPDATE' and new.grupo_id is distinct from old.grupo_id) then
    perform public.recalcular_pista_grupo_app(new.grupo_id);
  end if;
  return coalesce(new, old);
exception when others then
  raise warning 'pista_grupo_por_niveles: %', sqlerrm;
  return coalesce(new, old);
end;
$$;

drop trigger if exists trg_pista_grupo_por_niveles on public.grupo_alumnos;
create trigger trg_pista_grupo_por_niveles
after insert or delete or update of grupo_id on public.grupo_alumnos
for each row execute function public.trg_pista_grupo_por_niveles_app();

revoke all on function public.pista_por_niveles_grupo_app(uuid) from public, anon;
revoke all on function public.recalcular_pista_grupo_app(uuid) from public, anon;
revoke all on function public.trg_pista_grupo_por_niveles_app() from public, anon;
