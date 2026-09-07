-- Mítico Baby App · Commit/PR 63
-- Normaliza la modalidad en el backend antes de validarla y guardarla.
-- No debilita la lista permitida: cualquier valor distinto de Baby/Ocio/Intensivos sigue rechazado.
begin;

CREATE OR REPLACE FUNCTION public.guardar_borrador_disponibilidad_semana_editor_app(p_semana_inicio date, p_fecha_limite timestamp without time zone, p_dias jsonb)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_semana_id uuid;
  v_dia jsonb;
  v_turno jsonb;
  v_fecha date;
  v_hora_inicio time;
  v_hora_fin time;
  v_modalidades text[];
  v_orden integer;
  v_turnos_dia integer;
begin
  if not public.es_coordinador_disponibilidad_editor_app() then
    raise exception 'No tienes permiso para guardar esta disponibilidad.';
  end if;

  if p_semana_inicio is null or extract(isodow from p_semana_inicio)::int <> 1 then
    raise exception 'La semana debe comenzar en lunes.';
  end if;

  if p_fecha_limite is null then
    raise exception 'La fecha límite es obligatoria.';
  end if;

  if jsonb_typeof(coalesce(p_dias, '[]'::jsonb)) <> 'array' then
    raise exception 'La configuración de días no es válida.';
  end if;

  insert into public.disponibilidad_semanas_editor (
    semana_inicio,
    fecha_limite_borrador,
    estado,
    updated_at
  )
  values (
    p_semana_inicio,
    p_fecha_limite at time zone 'Europe/Madrid',
    'borrador',
    now()
  )
  on conflict (semana_inicio) do update
  set fecha_limite_borrador = excluded.fecha_limite_borrador,
      estado = 'borrador',
      updated_at = now()
  returning id into v_semana_id;

  delete from public.disponibilidad_turnos_editor
  where semana_id = v_semana_id
    and version_tipo = 'borrador';

  for v_dia in
    select value
    from jsonb_array_elements(coalesce(p_dias, '[]'::jsonb))
  loop
    if not coalesce((v_dia->>'activo')::boolean, false) then
      continue;
    end if;

    v_fecha := (v_dia->>'fecha')::date;

    if v_fecha < p_semana_inicio + 2 or v_fecha > p_semana_inicio + 6 then
      raise exception 'Solo se permiten días de miércoles a domingo dentro de la semana.';
    end if;

    if extract(isodow from v_fecha)::int not in (3, 4, 5, 6, 7) then
      raise exception 'Lunes y martes no admiten clases.';
    end if;

    if jsonb_typeof(coalesce(v_dia->'turnos', '[]'::jsonb)) <> 'array' then
      raise exception 'Los turnos del día % no son válidos.', v_fecha;
    end if;

    v_turnos_dia := jsonb_array_length(coalesce(v_dia->'turnos', '[]'::jsonb));

    if v_turnos_dia = 0 then
      raise exception 'El día % está activo pero no tiene turnos.', v_fecha;
    end if;

    if extract(isodow from v_fecha)::int in (3, 4, 5) and v_turnos_dia > 1 then
      raise exception 'Miércoles, jueves y viernes solo permiten un turno.';
    end if;

    v_orden := 0;
    for v_turno in
      select value
      from jsonb_array_elements(coalesce(v_dia->'turnos', '[]'::jsonb))
    loop
      v_orden := v_orden + 1;
      v_hora_inicio := (v_turno->>'hora_inicio')::time;
      v_hora_fin := (v_turno->>'hora_fin')::time;

      if v_hora_fin <= v_hora_inicio then
        raise exception 'La hora final debe ser posterior a la inicial en %.', v_fecha;
      end if;

      select coalesce(
        array_agg(
          case upper(btrim(value))
            when 'BABY' then 'Baby'
            when 'OCIO' then 'Ocio'
            when 'INTENSIVOS' then 'Intensivos'
            else null
          end
        ),
        '{}'::text[]
      )
      into v_modalidades
      from jsonb_array_elements_text(
        coalesce(v_turno->'modalidades', '[]'::jsonb)
      )
      where btrim(value) <> '';

      if cardinality(v_modalidades) = 0 then
        raise exception 'Cada turno debe tener al menos una modalidad.';
      end if;

      if exists (
        select 1
        from unnest(v_modalidades) modalidad
        where modalidad is null
           or modalidad not in ('Baby', 'Ocio', 'Intensivos')
      ) then
        raise exception 'Hay una modalidad no permitida.';
      end if;

      insert into public.disponibilidad_turnos_editor (
        semana_id,
        version_tipo,
        turno_clave,
        fecha,
        hora_inicio,
        hora_fin,
        modalidades,
        nota_interna,
        orden,
        updated_at
      )
      values (
        v_semana_id,
        'borrador',
        coalesce(nullif(v_turno->>'id', ''), gen_random_uuid()::text),
        v_fecha,
        v_hora_inicio,
        v_hora_fin,
        v_modalidades,
        nullif(btrim(coalesce(v_turno->>'nota', '')), ''),
        v_orden,
        now()
      );
    end loop;
  end loop;

  if not exists (
    select 1
    from public.disponibilidad_turnos_editor
    where semana_id = v_semana_id
      and version_tipo = 'borrador'
  ) then
    raise exception 'Debes activar al menos un turno antes de guardar.';
  end if;

  return public.json_disponibilidad_semana_editor_app(p_semana_inicio, 'borrador');
end;
$function$


revoke all on function public.guardar_borrador_disponibilidad_semana_editor_app(date, timestamp without time zone, jsonb) from public, anon;
grant execute on function public.guardar_borrador_disponibilidad_semana_editor_app(date, timestamp without time zone, jsonb) to authenticated, service_role;

commit;

