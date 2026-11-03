-- 20261101 · Buscar reportes por nombre de niño (Revisar reportes)
--
-- buscar_reportes_alumno_coordinacion_app(texto, por_niño): los últimos
-- reportes de los niños cuyo nombre contiene todas las palabras escritas (sin
-- importar tildes ni mayúsculas), de cualquier fecha. Por defecto 1 por niño
-- (el último); hasta 10 si se piden «los anteriores». Máximo 30 niños.
-- Devuelve las mismas columnas que obtener_reportes_coordinacion_app.
-- Solo coordinación. Solo lectura (STABLE).
-- Rollback: supabase/rollback/20261101_buscar_reportes_alumno_rollback.sql

create or replace function public.buscar_reportes_alumno_coordinacion_app(p_texto text, p_por_nino integer default 1)
returns table (
  reporte_id uuid, estado text, fecha date, hora_inicio time, hora_fin time, modalidad text,
  grupo_id uuid, nombre_grupo text, alumno_id uuid, alumno text, entrenador_id uuid, entrenador text,
  nivel_reportado text, actitud text, actitud_comentario text, tecnica text, pista text, remontes text[],
  autonomia text, incidencia text, incidencia_comentario text, recomendacion text, recomendacion_comentario text,
  observaciones text, mejoras_hoy text[], prioridades text[], ritmo_grupo text, notas_habilidades jsonb,
  evaluacion_tecnica jsonb, enviado_at timestamptz, updated_at timestamptz
)
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $$
declare
  v_toks text[];
  v_por integer := least(greatest(coalesce(p_por_nino, 1), 1), 10);
begin
  if not coalesce(public.es_coordinacion_operativa_app(), false) then
    raise exception 'No tienes permiso para consultar los reportes.';
  end if;
  v_toks := array_remove(regexp_split_to_array(
    lower(translate(btrim(coalesce(p_texto, '')), 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunaeiouun')), '\s+'), '');
  if coalesce(array_length(v_toks, 1), 0) = 0 or length(array_to_string(v_toks, '')) < 3 then
    raise exception 'Escribe al menos 3 letras del nombre.';
  end if;

  return query
  with ninos as (
    select a.id, a.nombre_completo
    from public.alumnos a
    where (select bool_and(lower(translate(a.nombre_completo, 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunaeiouun')) like '%' || t || '%')
           from unnest(v_toks) t)
      and exists (select 1 from public.reportes rr where rr.alumno_id = a.id)
    order by a.nombre_completo
    limit 30
  ), ultimos as (
    select r.*, row_number() over (partition by r.alumno_id order by r.fecha desc, r.created_at desc) as orden
    from public.reportes r
    where r.alumno_id in (select id from ninos)
  )
  select
    r.id, 'Hecho'::text, r.fecha, s.hora_inicio, s.hora_fin,
    coalesce(m.nombre, m.codigo)::text, r.grupo_id, g.nombre_grupo::text,
    r.alumno_id, n.nombre_completo::text, r.entrenador_id, e.nombre_completo::text,
    nv.codigo::text,
    r.actitud, r.actitud_comentario, r.tecnica, r.pista, r.remontes, r.autonomia,
    r.incidencia, r.incidencia_comentario, r.recomendacion_proxima_sesion, r.recomendacion_comentario,
    r.observaciones_generales, r.mejoras_hoy, r.prioridades_proxima_sesion, r.ritmo_grupo,
    r.notas_habilidades, r.evaluacion_tecnica, r.enviado_at, r.updated_at
  from ultimos r
  join ninos n on n.id = r.alumno_id
  left join public.grupos g on g.id = r.grupo_id
  left join public.sesiones s on s.id = g.sesion_id
  left join public.modalidades m on m.id = coalesce(r.modalidad_id, s.modalidad_id)
  left join public.entrenadores e on e.id = r.entrenador_id
  left join public.niveles nv on nv.id = r.nivel_id
  where r.orden <= v_por
  order by n.nombre_completo, r.fecha desc;
end;
$$;

revoke all on function public.buscar_reportes_alumno_coordinacion_app(text, integer) from public, anon;
grant execute on function public.buscar_reportes_alumno_coordinacion_app(text, integer) to authenticated;
