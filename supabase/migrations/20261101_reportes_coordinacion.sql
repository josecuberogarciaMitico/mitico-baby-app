-- 20261101 · Reportes desde coordinación
--
-- 1. cambiar_responsable_reporte_app: en un grupo con dos entrenadores, elegir
--    desde el Resumen del día qué entrenador hace el reporte de UN niño.
--    Usa la tabla que ya existía (grupo_reporte_responsable_app), la misma que
--    lee la Vista entrenador. A diferencia de guardar_apoyo_reportes_grupo_app,
--    NO toca la asignación del apoyo (no borra su confirmación).
-- 2. obtener_reportes_coordinacion_app: reportes hechos + los que faltan de
--    unas fechas (máx. 31 días), con día, turno, grupo y todo lo rellenado.
-- 3. editar_reporte_coordinacion_app: corregir lo que escribe el entrenador
--    (notas por habilidad, observaciones y comentarios). No cambia nivel,
--    evaluación ni asistencia.
--
-- Solo coordinación (es_coordinacion_operativa_app). Las dos que escriben son
-- VOLATILE: el usuario «Solo consulta» no puede usarlas.
-- Rollback: supabase/rollback/20261101_reportes_coordinacion_rollback.sql

create or replace function public.cambiar_responsable_reporte_app(
  p_grupo_id uuid, p_alumno_id uuid, p_entrenador_id uuid
) returns void
language plpgsql
volatile
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_principal uuid;
begin
  if not coalesce(public.es_coordinacion_operativa_app(), false) then
    raise exception 'Solo coordinación puede cambiar quién hace el reporte.';
  end if;
  if p_grupo_id is null or p_alumno_id is null or p_entrenador_id is null then
    raise exception 'Faltan datos para cambiar el responsable del reporte.';
  end if;
  if not exists (select 1 from public.grupo_alumnos where grupo_id = p_grupo_id and alumno_id = p_alumno_id) then
    raise exception 'Ese niño no está en este grupo.';
  end if;

  select ae.entrenador_id into v_principal
  from public.asignaciones_entrenadores ae
  where ae.grupo_id = p_grupo_id
  order by ae.created_at nulls last, ae.id
  limit 1;

  if p_entrenador_id is distinct from v_principal
     and not exists (select 1 from public.grupo_entrenadores_extra_app ge
                     where ge.grupo_id = p_grupo_id and ge.entrenador_id = p_entrenador_id) then
    raise exception 'Ese entrenador no es ni el principal ni el apoyo de este grupo.';
  end if;

  -- Si el grupo aún no tenía reparto, todos los niños pasan primero al
  -- principal (si no, la Vista entrenador dejaría de enseñar al resto).
  if not exists (select 1 from public.grupo_reporte_responsable_app where grupo_id = p_grupo_id) then
    if v_principal is null then
      raise exception 'El grupo no tiene entrenador principal.';
    end if;
    insert into public.grupo_reporte_responsable_app (grupo_id, alumno_id, entrenador_id)
    select p_grupo_id, ga.alumno_id, v_principal
    from public.grupo_alumnos ga
    where ga.grupo_id = p_grupo_id
    on conflict (grupo_id, alumno_id) do nothing;
  end if;

  insert into public.grupo_reporte_responsable_app (grupo_id, alumno_id, entrenador_id)
  values (p_grupo_id, p_alumno_id, p_entrenador_id)
  on conflict (grupo_id, alumno_id) do update set entrenador_id = excluded.entrenador_id;
end;
$$;

create or replace function public.obtener_reportes_coordinacion_app(p_desde date, p_hasta date)
returns table (
  reporte_id uuid,
  estado text,
  fecha date,
  hora_inicio time,
  hora_fin time,
  modalidad text,
  grupo_id uuid,
  nombre_grupo text,
  alumno_id uuid,
  alumno text,
  entrenador_id uuid,
  entrenador text,
  nivel_reportado text,
  actitud text,
  actitud_comentario text,
  tecnica text,
  pista text,
  remontes text[],
  autonomia text,
  incidencia text,
  incidencia_comentario text,
  recomendacion text,
  recomendacion_comentario text,
  observaciones text,
  mejoras_hoy text[],
  prioridades text[],
  ritmo_grupo text,
  notas_habilidades jsonb,
  evaluacion_tecnica jsonb,
  enviado_at timestamptz,
  updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  if not coalesce(public.es_coordinacion_operativa_app(), false) then
    raise exception 'No tienes permiso para consultar los reportes.';
  end if;
  if p_desde is null or p_hasta is null or p_hasta < p_desde or p_hasta - p_desde > 31 then
    raise exception 'Rango de fechas no válido (máximo 31 días).';
  end if;

  return query
  select
    r.id, 'Hecho'::text, r.fecha, s.hora_inicio, s.hora_fin,
    coalesce(m.nombre, m.codigo)::text, r.grupo_id, g.nombre_grupo::text,
    r.alumno_id, a.nombre_completo::text, r.entrenador_id, e.nombre_completo::text,
    n.codigo::text,
    r.actitud, r.actitud_comentario, r.tecnica, r.pista, r.remontes, r.autonomia,
    r.incidencia, r.incidencia_comentario, r.recomendacion_proxima_sesion, r.recomendacion_comentario,
    r.observaciones_generales, r.mejoras_hoy, r.prioridades_proxima_sesion, r.ritmo_grupo,
    r.notas_habilidades, r.evaluacion_tecnica, r.enviado_at, r.updated_at
  from public.reportes r
  join public.alumnos a on a.id = r.alumno_id
  left join public.grupos g on g.id = r.grupo_id
  left join public.sesiones s on s.id = g.sesion_id
  left join public.modalidades m on m.id = coalesce(r.modalidad_id, s.modalidad_id)
  left join public.entrenadores e on e.id = r.entrenador_id
  left join public.niveles n on n.id = r.nivel_id
  where r.fecha between p_desde and p_hasta
  union all
  select
    null::uuid, p.estado_reporte::text, p.fecha, p.hora_inicio, p.hora_fin,
    p.modalidad::text, p.grupo_id, p.nombre_grupo::text,
    p.alumno_id, p.alumno::text, p.entrenador_id, p.entrenador::text,
    p.nivel_alumno::text,
    null, null, null, null, null::text[], null, null, null, null, null, null,
    null::text[], null::text[], null, null::jsonb, null::jsonb, null::timestamptz, null::timestamptz
  from public.v_reportes_pendientes_entrenador_dos_entrenadores_raw_s2 p
  where p.fecha between p_desde and p_hasta;
end;
$$;

create or replace function public.editar_reporte_coordinacion_app(
  p_reporte_id uuid,
  p_observaciones text,
  p_incidencia_comentario text,
  p_actitud_comentario text,
  p_recomendacion_comentario text,
  p_notas_habilidades jsonb
) returns void
language plpgsql
volatile
security definer
set search_path to 'public', 'pg_temp'
as $$
begin
  if not coalesce(public.es_coordinacion_operativa_app(), false) then
    raise exception 'Solo coordinación puede corregir reportes.';
  end if;
  if p_notas_habilidades is not null and jsonb_typeof(p_notas_habilidades) <> 'object' then
    raise exception 'Las notas por habilidad no tienen un formato válido.';
  end if;

  update public.reportes set
    observaciones_generales = nullif(btrim(coalesce(p_observaciones, '')), ''),
    incidencia_comentario = nullif(btrim(coalesce(p_incidencia_comentario, '')), ''),
    actitud_comentario = nullif(btrim(coalesce(p_actitud_comentario, '')), ''),
    recomendacion_comentario = nullif(btrim(coalesce(p_recomendacion_comentario, '')), ''),
    notas_habilidades = case
      when p_notas_habilidades is null then notas_habilidades
      else nullif(jsonb_strip_nulls(p_notas_habilidades), '{}'::jsonb)
    end,
    updated_at = now()
  where id = p_reporte_id;

  if not found then
    raise exception 'No existe ese reporte.';
  end if;
end;
$$;

revoke all on function public.cambiar_responsable_reporte_app(uuid, uuid, uuid) from public, anon;
revoke all on function public.obtener_reportes_coordinacion_app(date, date) from public, anon;
revoke all on function public.editar_reporte_coordinacion_app(uuid, text, text, text, text, jsonb) from public, anon;
grant execute on function public.cambiar_responsable_reporte_app(uuid, uuid, uuid) to authenticated;
grant execute on function public.obtener_reportes_coordinacion_app(date, date) to authenticated;
grant execute on function public.editar_reporte_coordinacion_app(uuid, text, text, text, text, jsonb) to authenticated;
