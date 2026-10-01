-- PENDIENTE DE AUTORIZACIÓN. NO APLICADA.
-- Reporte por focos (01/10/2026): «¿Algo a destacar?» de la actitud.
--
-- Añade a crear_reporte_adaptativo_app un parámetro OPCIONAL p_actitud_detalle
-- (actitud general + lo marcado: cansado, miedo...). Se guarda en la columna que
-- ya existe reportes.actitud_comentario. No crea tablas ni columnas.
--
-- Compatibilidad: el parámetro nuevo tiene DEFAULT NULL, así que la app actual
-- (que no lo envía) sigue funcionando igual. Se elimina la firma antigua para
-- que no haya dos funciones con el mismo nombre (PostgREST no sabría cuál usar).
-- Orden de despliegue: 1) esta migración, 2) la app nueva.
--
-- El cuerpo es idéntico al de producción (leído el 01/10/2026) salvo:
--   a) validación del nuevo parámetro;
--   b) actitud_comentario = detalle sin repetir el valor guardado en «actitud».
begin;

drop function if exists public.crear_reporte_adaptativo_app(
  uuid, uuid, uuid, text, text, text, text, text, text, text, text, text, text,
  text, jsonb, text[], text[], text, text, text, text, text
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

-- Mismos permisos que la función actual: authenticated y service_role; nunca anon.
revoke execute on function public.crear_reporte_adaptativo_app(
  uuid, uuid, uuid, text, text, text, text, text, text, text, text, text, text,
  text, jsonb, text[], text[], text, text, text, text, text, text[]
) from public, anon;
grant execute on function public.crear_reporte_adaptativo_app(
  uuid, uuid, uuid, text, text, text, text, text, text, text, text, text, text,
  text, jsonb, text[], text[], text, text, text, text, text, text[]
) to authenticated, service_role;

-- Que PostgREST vea la nueva firma sin esperar.
notify pgrst, 'reload schema';

commit;
