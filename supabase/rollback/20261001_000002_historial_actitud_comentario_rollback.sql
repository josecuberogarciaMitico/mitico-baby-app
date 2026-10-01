-- Rollback de 20261001_000002_historial_actitud_comentario.sql
-- Restaura la función exactamente como estaba (md5 26d05acdcad21acd5859fdd8f7c1383b).
begin;

drop function if exists public.obtener_historial_reportes_adaptativo_alumno_app(uuid);

CREATE FUNCTION public.obtener_historial_reportes_adaptativo_alumno_app(p_alumno_id uuid)
 RETURNS TABLE(reporte_id uuid, fecha date, modalidad text, grupo text, entrenador text, nivel_reportado text, actitud text, tecnica text, pista text, remontes text[], autonomia text, ritmo_grupo text, mejora_hoy text, incidencia text, recomendacion text, observaciones_generales text, trabajo_diario text, enviado_at timestamp with time zone, evaluacion_tecnica jsonb, mejoras_hoy text[], prioridades_proxima_sesion text[], reporte_version smallint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso para consultar el historial del alumno.';
  end if;

  return query
  select r.id, r.fecha, coalesce(m.nombre, m.codigo), g.nombre_grupo,
    e.nombre_completo, n.codigo, r.actitud, r.tecnica, r.pista, r.remontes,
    coalesce(nullif(r.autonomia_comentario, ''), r.autonomia), r.ritmo_grupo,
    r.mejora_hoy, r.incidencia, r.recomendacion_proxima_sesion,
    r.observaciones_generales, td.trabajo_diario, r.enviado_at,
    r.evaluacion_tecnica, r.mejoras_hoy, r.prioridades_proxima_sesion,
    r.reporte_version
  from public.reportes r
  left join public.modalidades m on m.id = r.modalidad_id
  left join public.grupos g on g.id = r.grupo_id
  left join public.entrenadores e on e.id = r.entrenador_id
  left join public.niveles n on n.id = r.nivel_id
  left join lateral (
    select t.trabajo_diario
    from public.trabajo_diario_grupo t
    where t.grupo_id = r.grupo_id
    order by t.updated_at desc nulls last, t.created_at desc nulls last, t.id desc
    limit 1
  ) td on true
  where r.alumno_id = p_alumno_id
  order by r.fecha desc, r.enviado_at desc nulls last, r.created_at desc;
end;
$function$;

revoke execute on function public.obtener_historial_reportes_adaptativo_alumno_app(uuid) from public, anon;
grant execute on function public.obtener_historial_reportes_adaptativo_alumno_app(uuid) to authenticated, service_role;

notify pgrst, 'reload schema';

commit;
