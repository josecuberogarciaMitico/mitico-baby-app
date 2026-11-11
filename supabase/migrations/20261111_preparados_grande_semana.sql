-- 11/11/2026 · A+ preparados para la grande: por semana y para el entrenador.
-- 1) La lógica (sin cambios) pasa a una función interna.
-- 2) preparados_pista_grande_app(p_desde, p_hasta): coordinación. Con fechas,
--    solo los niños apuntados en esa semana, con sus turnos (día, hora,
--    modalidad, grupo). Sin fechas, todos (lo usa el recomendador).
-- 3) preparados_pista_grande_visibles_app(): para la vista del entrenador:
--    el entrenador ve solo a los niños de sus grupos (de ayer en adelante);
--    coordinación, todos.
-- Rollback: 20261111_preparados_grande_semana_rollback.sql

create or replace function public.preparados_pista_grande_base_app()
returns table (alumno_id uuid, alumno text, estado text, motivo text, fecha date, fuente text)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with hoy as (select (now() at time zone 'Europe/Madrid')::date d),
  a as (
    select al.id, al.nombre_completo
    from public.alumnos al join public.niveles n on n.id = al.nivel_actual_id
    where al.activo and n.codigo = 'A+'
  ), ur as (
    select distinct on (r.alumno_id) r.alumno_id, r.fecha, r.autonomia, r.evaluacion_tecnica ev
    from public.reportes r join public.niveles n on n.id = r.nivel_id
    join a on a.id = r.alumno_id
    where n.codigo = 'A+' and r.fecha >= (select d from hoy) - 60
    order by r.alumno_id, r.fecha desc, r.created_at desc
  ), um as (
    select distinct on (p.alumno_id) p.alumno_id, p.fecha, p.valor
    from public.prueba_pista_grande_app p join a on a.id = p.alumno_id
    where p.fecha >= (select d from hoy) - 60
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
  where y.est is not null;
$$;
revoke all on function public.preparados_pista_grande_base_app() from public, anon, authenticated;

drop function if exists public.preparados_pista_grande_app();

create or replace function public.preparados_pista_grande_app(p_desde date default null, p_hasta date default null)
returns table (alumno_id uuid, alumno text, estado text, motivo text, fecha date, fuente text, turnos jsonb)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
#variable_conflict use_column
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso.';
  end if;
  return query
  select b.alumno_id, b.alumno, b.estado, b.motivo, b.fecha, b.fuente, t.turnos
  from public.preparados_pista_grande_base_app() b
  left join lateral (
    select jsonb_agg(jsonb_build_object(
             'fecha', s.fecha, 'hora', to_char(s.hora_inicio, 'HH24:MI'), 'modalidad', m.nombre,
             'grupo', (select gr.nombre_grupo from public.grupo_alumnos ga join public.grupos gr on gr.id = ga.grupo_id
                       where gr.sesion_id = s.id and ga.alumno_id = b.alumno_id and not coalesce(gr.cancelado, false)
                       order by gr.created_at limit 1))
           order by s.fecha, s.hora_inicio) turnos
    from public.sesion_alumnos_operativa x
    join public.sesiones s on s.id = x.sesion_id
    join public.modalidades m on m.id = s.modalidad_id
    where x.alumno_id = b.alumno_id and p_desde is not null
      and s.fecha between p_desde and coalesce(p_hasta, p_desde + 6)
  ) t on true
  where p_desde is null or t.turnos is not null
  order by b.estado desc, b.alumno;
end;
$$;
revoke all on function public.preparados_pista_grande_app(date, date) from public, anon;
grant execute on function public.preparados_pista_grande_app(date, date) to authenticated;

create or replace function public.preparados_pista_grande_visibles_app()
returns table (alumno_id uuid, estado text, motivo text)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
#variable_conflict use_column
declare
  v_entrenador uuid := public.entrenador_actual_app();
  v_hoy date := (now() at time zone 'Europe/Madrid')::date;
begin
  if public.es_coordinacion_operativa_app() then
    return query select b.alumno_id, b.estado, b.motivo from public.preparados_pista_grande_base_app() b;
    return;
  end if;
  if v_entrenador is null then return; end if;
  return query
  select b.alumno_id, b.estado, b.motivo
  from public.preparados_pista_grande_base_app() b
  where exists (
    select 1
    from public.grupo_alumnos ga
    join public.grupos g on g.id = ga.grupo_id
    join public.sesiones s on s.id = g.sesion_id
    where ga.alumno_id = b.alumno_id and s.fecha >= v_hoy - 1
      and (exists (select 1 from public.asignaciones_entrenadores ae where ae.grupo_id = g.id and ae.entrenador_id = v_entrenador)
        or exists (select 1 from public.grupo_entrenadores_extra_app ge where ge.grupo_id = g.id and ge.entrenador_id = v_entrenador))
  );
end;
$$;
revoke all on function public.preparados_pista_grande_visibles_app() from public, anon;
grant execute on function public.preparados_pista_grande_visibles_app() to authenticated;
