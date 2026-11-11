-- 11/11/2026 · A+ «preparados para la pista grande».
-- 1) El entrenador, en el reporte de un niño de A+, puede marcar si hoy ha
--    probado la grande: bien / con ayuda / todavía no está listo.
-- 2) preparados_pista_grande_app(): niños con nivel actual A+ que están
--    preparados (o casi), por lo que marcó el entrenador o, si no marcó nada
--    más reciente, por sus habilidades: «Giros en cuña encadenados» y
--    «Control de velocidad» conseguidos en su último reporte de A+ y autónomo.
-- Rollback: 20261111_preparados_pista_grande_rollback.sql

create table if not exists public.prueba_pista_grande_app (
  alumno_id uuid not null references public.alumnos(id) on delete cascade,
  grupo_id uuid not null references public.grupos(id) on delete cascade,
  fecha date not null,
  valor text not null check (valor in ('bien', 'con_ayuda', 'no_listo')),
  entrenador_id uuid,
  created_at timestamptz not null default now(),
  primary key (alumno_id, grupo_id)
);
alter table public.prueba_pista_grande_app enable row level security;
revoke all on public.prueba_pista_grande_app from anon, authenticated;

create or replace function public.marcar_prueba_pista_grande_app(p_grupo_id uuid, p_alumno_id uuid, p_valor text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_fecha date;
begin
  if not public.es_coordinacion_operativa_app() and not public.es_entrenador_asignado_grupo_app(p_grupo_id) then
    raise exception 'No puedes marcar esto en este grupo.';
  end if;
  if not exists (select 1 from public.grupo_alumnos where grupo_id = p_grupo_id and alumno_id = p_alumno_id) then
    raise exception 'El alumno no pertenece a este grupo.';
  end if;
  if nullif(trim(coalesce(p_valor, '')), '') is null then
    delete from public.prueba_pista_grande_app where grupo_id = p_grupo_id and alumno_id = p_alumno_id;
    return;
  end if;
  select s.fecha into v_fecha from public.grupos g join public.sesiones s on s.id = g.sesion_id where g.id = p_grupo_id;
  insert into public.prueba_pista_grande_app (alumno_id, grupo_id, fecha, valor, entrenador_id)
  values (p_alumno_id, p_grupo_id, coalesce(v_fecha, (now() at time zone 'Europe/Madrid')::date), p_valor, public.entrenador_actual_app())
  on conflict (alumno_id, grupo_id) do update
    set valor = excluded.valor, fecha = excluded.fecha, entrenador_id = excluded.entrenador_id, created_at = now();
end;
$$;
revoke all on function public.marcar_prueba_pista_grande_app(uuid, uuid, text) from public, anon;
grant execute on function public.marcar_prueba_pista_grande_app(uuid, uuid, text) to authenticated;

create or replace function public.preparados_pista_grande_app()
returns table (alumno_id uuid, alumno text, estado text, motivo text, fecha date, fuente text)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
#variable_conflict use_column
declare v_hoy date := (now() at time zone 'Europe/Madrid')::date;
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso.';
  end if;
  return query
  with a as (
    select al.id, al.nombre_completo
    from public.alumnos al join public.niveles n on n.id = al.nivel_actual_id
    where al.activo and n.codigo = 'A+'
  ), ur as (
    select distinct on (r.alumno_id) r.alumno_id, r.fecha, r.autonomia, r.evaluacion_tecnica ev
    from public.reportes r join public.niveles n on n.id = r.nivel_id
    join a on a.id = r.alumno_id
    where n.codigo = 'A+' and r.fecha >= v_hoy - 60
    order by r.alumno_id, r.fecha desc, r.created_at desc
  ), um as (
    select distinct on (p.alumno_id) p.alumno_id, p.fecha, p.valor
    from public.prueba_pista_grande_app p join a on a.id = p.alumno_id
    where p.fecha >= v_hoy - 60
    order by p.alumno_id, p.fecha desc, p.created_at desc
  ), x as (
    select a.id, a.nombre_completo, ur.fecha uf, ur.autonomia, ur.ev, um.fecha mf, um.valor,
           (ur.ev ->> 'giros_cuna_encadenados') = 'Consolidado' and (ur.ev ->> 'control_velocidad') = 'Consolidado' focos,
           coalesce(ur.autonomia, '') ilike 'Autónomo%' autonomo
    from a left join ur on ur.alumno_id = a.id left join um on um.alumno_id = a.id
  ), y as (
    select x.*,
      case
        when x.mf is not null and x.mf >= coalesce(x.uf, '1900-01-01'::date) then
          case x.valor when 'bien' then 'listo' when 'con_ayuda' then 'casi' end
        when x.focos and x.autonomo then 'listo'
        when x.focos then 'casi'
      end est,
      x.mf is not null and x.mf >= coalesce(x.uf, '1900-01-01'::date) por_entrenador
    from x
  )
  select y.id, y.nombre_completo, y.est,
    case
      when y.por_entrenador and y.valor = 'bien' then 'El entrenador marcó que probó la pista grande y fue bien'
      when y.por_entrenador then 'El entrenador marcó que probó la pista grande con ayuda'
      when y.autonomo then 'Encadena giros en cuña y controla la velocidad (conseguido) y es autónomo'
      else 'Encadena giros en cuña y controla la velocidad (conseguido), pero aún necesita ayuda'
    end,
    case when y.por_entrenador then y.mf else y.uf end,
    case when y.por_entrenador then 'entrenador' else 'habilidades' end
  from y
  where y.est is not null
  order by y.est desc, y.nombre_completo;
end;
$$;
revoke all on function public.preparados_pista_grande_app() from public, anon;
grant execute on function public.preparados_pista_grande_app() to authenticated;
