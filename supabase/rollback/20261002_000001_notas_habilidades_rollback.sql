-- Rollback de 20261002_000001_notas_habilidades.sql
-- Deja las dos funciones exactamente como estaban (md5 3322bfc8… y 60e6b241…).
-- La columna reportes.notas_habilidades NO se borra aquí para no perder notas;
-- si de verdad se quiere eliminar, ejecutar aparte la última línea comentada.
-- Antes de aplicarlo, volver a la app anterior (la nueva envía p_notas_habilidades).
begin;

drop function if exists public.crear_reporte_adaptativo_app(
  uuid, uuid, uuid, text, text, text, text, text, text, text, text, text, text,
  text, jsonb, text[], text[], text, text, text, text, text, text[], jsonb
);

create function public.crear_reporte_adaptativo_app(
  p_grupo_id uuid, p_alumno_id uuid, p_entrenador_id uuid, p_actitud text,
  p_nivel_reportado text, p_tecnica_legacy text, p_pista text, p_autonomia text,
  p_remontes text, p_incidencia text, p_recomendacion_legacy text, p_mejora_legacy text,
  p_observaciones text, p_ritmo_grupo text, p_evaluacion_tecnica jsonb,
  p_mejoras_hoy text[], p_prioridades text[], p_autonomia_cinta text,
  p_cuna_frenada text, p_giro_inicial text, p_dinamica_autonoma text, p_ayuda_cunero text,
  p_actitud_detalle text[] default null
)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_actitud_legacy text;
  v_autonomia_legacy text;
  v_incidencia_legacy text;
  v_actitud_detalle text;
begin
  if auth.uid() is null then
    raise exception 'Sesión no válida.';
  end if;

  if jsonb_typeof(coalesce(p_evaluacion_tecnica, '{}'::jsonb)) <> 'object' then
    raise exception 'La evaluación técnica debe ser un objeto.';
  end if;

  if exists (
    select 1
    from jsonb_each_text(coalesce(p_evaluacion_tecnica, '{}'::jsonb)) item
    where item.value not in (
      'No trabajado', 'Necesita mejorar', 'En desarrollo', 'Correcto', 'Consolidado'
    )
  ) then
    raise exception 'La evaluación técnica contiene un valor no permitido.';
  end if;

  if (
    select count(*)
    from jsonb_object_keys(coalesce(p_evaluacion_tecnica, '{}'::jsonb))
  ) > 20 then
    raise exception 'La evaluación técnica contiene demasiadas competencias.';
  end if;

  if coalesce(cardinality(p_mejoras_hoy), 0) < 1 then
    raise exception 'Selecciona al menos una mejora o indica que ha reforzado lo aprendido.';
  end if;

  if coalesce(cardinality(p_mejoras_hoy), 0) > 30
     or coalesce(cardinality(p_prioridades), 0) > 30 then
    raise exception 'El reporte contiene demasiadas selecciones.';
  end if;

  -- (a) Nuevo: «¿Algo a destacar?» de la actitud, solo valores conocidos.
  if coalesce(cardinality(p_actitud_detalle), 0) > 8 then
    raise exception 'El detalle de actitud contiene demasiadas selecciones.';
  end if;

  if exists (
    select 1 from unnest(coalesce(p_actitud_detalle, '{}'::text[])) d
    where d not in (
      'Muy buena', 'Buena', 'Correcta', 'Disperso', 'Se bloquea', 'Miedo',
      'Cansado', 'No escucha', 'Llora'
    )
  ) then
    raise exception 'El detalle de actitud contiene un valor no permitido.';
  end if;

  if nullif(trim(coalesce(p_autonomia, '')), '') is null then
    raise exception 'Selecciona la autonomía observada.';
  end if;

  v_actitud_legacy := case
    when p_actitud = 'No sigue consignas' then 'No escucha'
    else p_actitud
  end;

  v_autonomia_legacy := case
    when p_autonomia in (
      'Necesita ayuda constante','Necesita ayuda puntual','Autónomo en llano',
      'Autónomo en pista pequeña','Autónomo en pista grande','Autónomo total'
    ) then p_autonomia
    when p_autonomia = 'Necesita supervisión frecuente' then 'Necesita ayuda constante'
    when p_autonomia = 'Necesita supervisión puntual' then 'Necesita ayuda puntual'
    when p_autonomia in ('Autónomo en pista grande con supervisión','Autónomo en la dinámica del grupo')
      then 'Autónomo en pista grande'
    when p_autonomia in ('Autónomo en pista y remontes','Autonomía completa') then 'Autónomo total'
    else 'Necesita ayuda puntual'
  end;

  v_incidencia_legacy := case
    when p_incidencia in (
      'Sin incidencia','Llanto','Miedo / bloqueo','Caída sin importancia','Caída con revisión',
      'Se separa del grupo','No sigue instrucciones','Problema con material',
      'Problema con remonte','Conflicto con compañero','Otro'
    ) then p_incidencia
    else 'Otro'
  end;

  -- (b) Nuevo: el detalle sin repetir lo que ya va en la columna «actitud».
  v_actitud_detalle := nullif(
    array_to_string(
      array(
        select d from unnest(coalesce(p_actitud_detalle, '{}'::text[])) d
        where d is distinct from v_actitud_legacy
      ),
      ' · '
    ),
    ''
  );

  perform public.crear_reporte_alumno_app(
    p_grupo_id, p_alumno_id, p_entrenador_id, v_actitud_legacy,
    p_nivel_reportado, p_tecnica_legacy, p_pista, v_autonomia_legacy, p_remontes,
    v_incidencia_legacy, p_recomendacion_legacy, p_mejora_legacy, p_observaciones
  );

  update public.reportes
  set evaluacion_tecnica = coalesce(p_evaluacion_tecnica, '{}'::jsonb),
      mejoras_hoy = coalesce(p_mejoras_hoy, '{}'::text[]),
      prioridades_proxima_sesion = coalesce(p_prioridades, '{}'::text[]),
      reporte_version = 2,
      ritmo_grupo = p_ritmo_grupo,
      actitud_comentario = case
        when v_actitud_detalle is not null then v_actitud_detalle
        when v_actitud_legacy <> p_actitud then p_actitud
        else null
      end,
      autonomia_comentario = case when v_autonomia_legacy <> p_autonomia then p_autonomia else null end,
      incidencia_comentario = case when v_incidencia_legacy <> p_incidencia then p_incidencia else null end,
      updated_at = now()
  where grupo_id = p_grupo_id and alumno_id = p_alumno_id;

  perform public.guardar_progresion_inicial_reporte_app(
    p_grupo_id,
    p_alumno_id,
    p_entrenador_id,
    p_nivel_reportado,
    p_autonomia_cinta,
    p_cuna_frenada,
    p_giro_inicial,
    p_dinamica_autonoma,
    coalesce(nullif(trim(p_ayuda_cunero), ''), 'No utilizado')
  );
end;
$function$;

revoke execute on function public.crear_reporte_adaptativo_app(
  uuid, uuid, uuid, text, text, text, text, text, text, text, text, text, text,
  text, jsonb, text[], text[], text, text, text, text, text, text[]
) from public, anon;
grant execute on function public.crear_reporte_adaptativo_app(
  uuid, uuid, uuid, text, text, text, text, text, text, text, text, text, text,
  text, jsonb, text[], text[], text, text, text, text, text, text[]
) to authenticated, service_role;

drop function if exists public.obtener_historial_reportes_adaptativo_alumno_app(uuid);

create function public.obtener_historial_reportes_adaptativo_alumno_app(p_alumno_id uuid)
 RETURNS TABLE(reporte_id uuid, fecha date, modalidad text, grupo text, entrenador text, nivel_reportado text, actitud text, tecnica text, pista text, remontes text[], autonomia text, ritmo_grupo text, mejora_hoy text, incidencia text, recomendacion text, observaciones_generales text, trabajo_diario text, enviado_at timestamp with time zone, evaluacion_tecnica jsonb, mejoras_hoy text[], prioridades_proxima_sesion text[], reporte_version smallint, actitud_comentario text)
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
    r.reporte_version, r.actitud_comentario
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

-- alter table public.reportes drop constraint if exists reportes_notas_habilidades_objeto_check, drop column if exists notas_habilidades;
