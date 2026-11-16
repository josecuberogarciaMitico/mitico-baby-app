-- 17/11/2026 · Calidad de reportes: devolver un reporte al entrenador y que cada
-- entrenador vea la calidad de los suyos (nota 0-10) frente a la del equipo.
--
-- 1) reportes: columnas de devolución (no cambian nada de lo existente).
-- 2) devolver_reporte_app: coordinación devuelve (o anula la devolución).
-- 3) reportes_devueltos_app: coordinación ve el estado de lo devuelto.
-- 4) mis_reportes_devueltos_app / completar_reporte_devuelto_app: el entrenador
--    ve lo que le han devuelto y SOLO completa notas y observación (no cambia
--    valoraciones ni nivel: el disparador de nivel solo salta con nivel_id).
-- 5) calidad_reportes_equipo_app: rasgos de calidad de los reportes de 28 días,
--    sin nombres de nadie, con «es_mio» para el entrenador que pregunta.
--    Mismas reglas que src/features/reports/calidadReportes.ts.

alter table public.reportes
  add column if not exists devuelto_at timestamptz,
  add column if not exists devuelto_motivo text,
  add column if not exists devuelto_por uuid,
  add column if not exists completado_devolucion_at timestamptz;

-- Nota suficiente: al menos 30 letras y 5 palabras de 2+ letras (igual que notaSuficiente en la app).
create or replace function public.nota_suficiente_app(p_texto text)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  select length(btrim(coalesce(p_texto, ''))) >= 30
     and (select count(*) from regexp_split_to_table(btrim(coalesce(p_texto, '')), '\s+') w
          where w ~ '[[:alpha:]].*[[:alpha:]]') >= 5;
$$;

create or replace function public.devolver_reporte_app(p_reporte_id uuid, p_motivo text, p_cancelar boolean default false)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not coalesce(public.es_coordinacion_operativa_app(), false) then
    raise exception 'Solo coordinación puede devolver reportes.';
  end if;
  if coalesce(p_cancelar, false) then
    update public.reportes
       set devuelto_at = null, devuelto_motivo = null, devuelto_por = null, completado_devolucion_at = null
     where id = p_reporte_id;
  else
    update public.reportes
       set devuelto_at = now(),
           devuelto_motivo = nullif(btrim(coalesce(p_motivo, '')), ''),
           devuelto_por = auth.uid(),
           completado_devolucion_at = null
     where id = p_reporte_id and enviado_at is not null;
  end if;
  if not found then
    raise exception 'No se ha encontrado el reporte.';
  end if;
end;
$$;

create or replace function public.reportes_devueltos_app(p_desde date)
returns table (reporte_id uuid, devuelto_at timestamptz, devuelto_motivo text, completado_devolucion_at timestamptz)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not coalesce(public.es_coordinacion_operativa_app(), false) then
    raise exception 'No tienes permiso.';
  end if;
  return query
  select r.id, r.devuelto_at, r.devuelto_motivo, r.completado_devolucion_at
  from public.reportes r
  where r.devuelto_at is not null and r.fecha >= coalesce(p_desde, current_date - 60);
end;
$$;

create or replace function public.mis_reportes_devueltos_app()
returns table (
  reporte_id uuid, fecha date, alumno text, nombre_grupo text, modalidad text, nivel text,
  motivo text, devuelto_at timestamptz, evaluacion_tecnica jsonb, notas_habilidades jsonb, observaciones text
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
declare
  v_ent uuid := public.entrenador_actual_app();
begin
  if v_ent is null then return; end if;
  return query
  select r.id, r.fecha, a.nombre_completo, g.nombre_grupo, m.nombre, n.codigo,
         r.devuelto_motivo, r.devuelto_at, r.evaluacion_tecnica, r.notas_habilidades, r.observaciones_generales
  from public.reportes r
  left join public.alumnos a on a.id = r.alumno_id
  left join public.grupos g on g.id = r.grupo_id
  left join public.modalidades m on m.id = r.modalidad_id
  left join public.niveles n on n.id = r.nivel_id
  where r.entrenador_id = v_ent
    and r.devuelto_at is not null
    and r.completado_devolucion_at is null
  order by r.devuelto_at;
end;
$$;

create or replace function public.completar_reporte_devuelto_app(p_reporte_id uuid, p_notas jsonb, p_observaciones text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_ent uuid := public.entrenador_actual_app();
  v_rep public.reportes%rowtype;
  v_notas jsonb := '{}'::jsonb;
  v_clave text;
  v_valor text;
  v_todo_consigue boolean := true;
  v_valoradas int := 0;
  v_alguna boolean := false;
  v_obs text := nullif(btrim(coalesce(p_observaciones, '')), '');
begin
  if v_ent is null then raise exception 'Solo el entrenador del reporte puede completarlo.'; end if;
  select * into v_rep from public.reportes where id = p_reporte_id for update;
  if not found or v_rep.entrenador_id is distinct from v_ent then
    raise exception 'No se ha encontrado el reporte.';
  end if;
  if v_rep.devuelto_at is null or v_rep.completado_devolucion_at is not null then
    raise exception 'Este reporte no está pendiente de completar.';
  end if;
  if p_notas is not null and jsonb_typeof(p_notas) <> 'object' then
    raise exception 'Las notas no tienen un formato válido.';
  end if;

  -- Solo se guardan notas de habilidades valoradas en el reporte; se exigen
  -- las mismas reglas que al enviarlo (30 letras y 5 palabras).
  for v_clave, v_valor in
    select key, value from jsonb_each_text(coalesce(v_rep.evaluacion_tecnica, '{}'::jsonb))
  loop
    continue when coalesce(v_valor, '') in ('', 'No trabajado');
    v_valoradas := v_valoradas + 1;
    if v_valor <> 'Consolidado' then v_todo_consigue := false; end if;
    if nullif(btrim(coalesce(p_notas ->> v_clave, '')), '') is not null then
      if length(btrim(p_notas ->> v_clave)) > 300 then
        raise exception 'Una nota es demasiado larga (máximo 300 caracteres).';
      end if;
      v_notas := v_notas || jsonb_build_object(v_clave, btrim(p_notas ->> v_clave));
      if public.nota_suficiente_app(p_notas ->> v_clave) then v_alguna := true; end if;
    end if;
    if v_valor <> 'Consolidado' and not public.nota_suficiente_app(p_notas ->> v_clave) then
      raise exception 'Escribe más en cada habilidad a mejorar (mínimo 5 palabras y 30 letras).';
    end if;
  end loop;
  if v_valoradas > 0 and v_todo_consigue and not v_alguna and not public.nota_suficiente_app(v_obs) then
    raise exception 'Escribe al menos una frase de 5 palabras contando qué has visto.';
  end if;
  if v_obs is not null and length(v_obs) > 500 then
    raise exception 'La observación es demasiado larga (máximo 500 caracteres).';
  end if;

  update public.reportes
     set notas_habilidades = v_notas,
         observaciones_generales = v_obs,
         completado_devolucion_at = now(),
         updated_at = now()
   where id = p_reporte_id;
end;
$$;

create or replace function public.calidad_reportes_equipo_app()
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

revoke all on function public.devolver_reporte_app(uuid, text, boolean) from public, anon;
revoke all on function public.reportes_devueltos_app(date) from public, anon;
revoke all on function public.mis_reportes_devueltos_app() from public, anon;
revoke all on function public.completar_reporte_devuelto_app(uuid, jsonb, text) from public, anon;
revoke all on function public.calidad_reportes_equipo_app() from public, anon;
grant execute on function public.devolver_reporte_app(uuid, text, boolean) to authenticated;
grant execute on function public.reportes_devueltos_app(date) to authenticated;
grant execute on function public.mis_reportes_devueltos_app() to authenticated;
grant execute on function public.completar_reporte_devuelto_app(uuid, jsonb, text) to authenticated;
grant execute on function public.calidad_reportes_equipo_app() to authenticated;
grant execute on function public.nota_suficiente_app(text) to authenticated;
