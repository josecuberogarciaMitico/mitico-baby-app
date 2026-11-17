-- Vuelta atrás de 20261117_calidad_cuenta_faltas.sql: la función vuelve a la versión
-- de 20261117_reportes_devolver_y_calidad.sql (sin las filas de reportes sin hacer).
drop function if exists public.calidad_reportes_equipo_app();

create function public.calidad_reportes_equipo_app()
returns table (
  es_mio boolean, fecha date, valoradas int, a_mejorar int, letras int,
  poco_detallado boolean, igual_grupo boolean, dias_tarde int
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_ent uuid := public.entrenador_actual_app();
begin
  if v_ent is null and not coalesce(public.es_coordinacion_operativa_app(), false) then
    raise exception 'No tienes permiso.';
  end if;
  return query
  with base as (
    select r.entrenador_id, r.fecha, r.grupo_id, r.evaluacion_tecnica, r.enviado_at,
      (select count(*)::int from jsonb_each_text(case when jsonb_typeof(r.evaluacion_tecnica) = 'object' then r.evaluacion_tecnica else '{}'::jsonb end) v
        where coalesce(v.value, '') not in ('', 'No trabajado')) as nval,
      (select count(*)::int from jsonb_each_text(case when jsonb_typeof(r.evaluacion_tecnica) = 'object' then r.evaluacion_tecnica else '{}'::jsonb end) v
        where coalesce(v.value, '') not in ('', 'No trabajado', 'Consolidado')) as amejorar,
      (select coalesce(bool_or(public.nota_suficiente_app(v.value)), false)
         from jsonb_each_text(case when jsonb_typeof(r.notas_habilidades) = 'object' then r.notas_habilidades else '{}'::jsonb end) v) as nota_ok,
      public.nota_suficiente_app(r.observaciones_generales) as obs_ok,
      ((select coalesce(sum(length(btrim(coalesce(v.value, '')))), 0)
          from jsonb_each_text(case when jsonb_typeof(r.notas_habilidades) = 'object' then r.notas_habilidades else '{}'::jsonb end) v)
        + length(btrim(coalesce(r.observaciones_generales, ''))))::int as letras,
      count(*) over (partition by r.entrenador_id, r.fecha, r.grupo_id) as en_grupo,
      count(*) over (partition by r.entrenador_id, r.fecha, r.grupo_id, r.evaluacion_tecnica::text) as misma
    from public.reportes r
    where r.enviado_at is not null
      and r.fecha between current_date - 27 and current_date
  )
  select b.entrenador_id = v_ent,
         b.fecha,
         b.nval,
         b.amejorar,
         b.letras,
         (b.nval > 0 and b.amejorar = 0 and not b.nota_ok and not b.obs_ok),
         (b.grupo_id is not null and b.en_grupo >= 2 and b.misma = b.en_grupo),
         ((b.enviado_at at time zone 'Europe/Madrid')::date - b.fecha)::int
  from base b;
end;
$$;

revoke all on function public.calidad_reportes_equipo_app() from public, anon;
grant execute on function public.calidad_reportes_equipo_app() to authenticated;

notify pgrst, 'reload schema';
