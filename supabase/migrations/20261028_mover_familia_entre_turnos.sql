-- 20261028 · Mover a una familia entera de turno (Niños sin colocar)
--
-- Cuando un niño sin colocar tiene hermanos YA colocados en su mismo turno y
-- la mejor opción es pasarlos a todos a otro turno, esto lo hace de una vez:
--   1. a los hermanos colocados los saca de su grupo del turno de origen
--      (solo si no tienen asistencia real ni reporte allí);
--   2. pasa a cada niño al turno destino y a su grupo con la función que ya
--      existía (mover_alumno_entre_turnos_operativa_app), con todas sus
--      comprobaciones (misma semana, Baby, ratio, particular, etc.).
-- Todo en una sola transacción: si falla un niño, no se mueve ninguno.
-- Devuelve los grupos de origen que han perdido niños (para avisar a su
-- entrenador si estaban publicados).
--
-- Rollback: supabase/rollback/20261028_mover_familia_entre_turnos_rollback.sql

create or replace function public.mover_familia_entre_turnos_app(p_movimientos jsonb)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_mov jsonb;
  v_sa uuid;
  v_destino uuid;
  v_grupo_destino uuid;
  v_alumno uuid;
  v_nombre text;
  v_origen uuid;
  v_grupo_origen uuid;
  v_ratio jsonb;
  v_origenes jsonb := '[]'::jsonb;
  v_movidos integer := 0;
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'Solo coordinación puede mover alumnos entre turnos.';
  end if;
  if jsonb_typeof(p_movimientos) <> 'array' or jsonb_array_length(p_movimientos) = 0 then
    raise exception 'No hay niños que mover.';
  end if;
  if jsonb_array_length(p_movimientos) > 6 then
    raise exception 'Como mucho 6 niños a la vez.';
  end if;

  for v_mov in select * from jsonb_array_elements(p_movimientos) loop
    v_sa := nullif(v_mov->>'sesion_alumno_id', '')::uuid;
    v_destino := nullif(v_mov->>'sesion_destino_id', '')::uuid;
    v_grupo_destino := nullif(v_mov->>'grupo_destino_id', '')::uuid;
    if v_sa is null or v_destino is null or v_grupo_destino is null then
      raise exception 'Faltan datos para mover a la familia.';
    end if;

    select sao.alumno_id, sao.sesion_id, a.nombre_completo
      into v_alumno, v_origen, v_nombre
    from public.sesion_alumnos_operativa sao
    join public.alumnos a on a.id = sao.alumno_id
    where sao.id = v_sa
    for update of sao;
    if v_alumno is null then
      raise exception 'Un niño ya no está en el listado del turno de origen.';
    end if;

    -- ¿Está colocado en un grupo de su turno? Entonces se le saca primero.
    select ga.grupo_id into v_grupo_origen
    from public.grupo_alumnos ga
    join public.grupos g on g.id = ga.grupo_id
    where g.sesion_id = v_origen and ga.alumno_id = v_alumno and coalesce(g.cancelado, false) = false
    limit 1;

    if v_grupo_origen is not null then
      if exists (select 1 from public.reportes r where r.grupo_id = v_grupo_origen and r.alumno_id = v_alumno) then
        raise exception '% ya tiene reporte en su grupo: no se puede cambiar de turno.', v_nombre;
      end if;
      if exists (
        select 1 from public.asistencias asi
        where asi.grupo_id = v_grupo_origen and asi.alumno_id = v_alumno
          and upper(trim(coalesce(asi.estado, 'SIN_CONFIRMAR'))) <> 'SIN_CONFIRMAR'
      ) or exists (
        select 1 from public.grupo_alumnos ga
        where ga.grupo_id = v_grupo_origen and ga.alumno_id = v_alumno
          and lower(trim(coalesce(ga.estado_asistencia, 'Pendiente'))) in ('presente', 'ausente')
      ) then
        raise exception '% ya tiene asistencia en su grupo: no se puede cambiar de turno.', v_nombre;
      end if;

      delete from public.grupo_alumnos where grupo_id = v_grupo_origen and alumno_id = v_alumno;
      delete from public.asistencias
        where grupo_id = v_grupo_origen and alumno_id = v_alumno
          and upper(trim(coalesce(estado, 'SIN_CONFIRMAR'))) = 'SIN_CONFIRMAR';
      delete from public.grupo_reporte_responsable_app where grupo_id = v_grupo_origen and alumno_id = v_alumno;

      -- Quita su línea de observaciones del grupo de origen.
      update public.grupos g
      set observaciones_importantes = (
        select nullif(string_agg(t.linea, E'\n' order by t.orden), '')
        from regexp_split_to_table(coalesce(g.observaciones_importantes, ''), E'\n') with ordinality as t(linea, orden)
        where upper(trim(split_part(t.linea, ':', 1))) <> upper(trim(v_nombre))
      )
      where g.id = v_grupo_origen;

      v_ratio := public.evaluar_ratio_baby_grupo_operativa_app(v_grupo_origen);
      update public.grupos
      set ratio_ok = coalesce((v_ratio->>'valido')::boolean, true),
          excepcion_ratio = coalesce((v_ratio->>'excepcion')::boolean, false)
      where id = v_grupo_origen;

      v_origenes := v_origenes || jsonb_build_object(
        'grupo_id', v_grupo_origen,
        'alumno', v_nombre
      );
    end if;

    -- Mismo cambio de turno de siempre (con todas sus comprobaciones).
    perform public.mover_alumno_entre_turnos_operativa_app(v_sa, v_destino, v_grupo_destino);
    v_movidos := v_movidos + 1;
  end loop;

  return jsonb_build_object(
    'ok', true,
    'movidos', v_movidos,
    'grupos_origen', (
      select coalesce(jsonb_agg(distinct jsonb_build_object(
        'grupo_id', g.id,
        'nombre', g.nombre_grupo,
        'publicado', coalesce(g.publicado, false),
        'quedan', (select count(*) from public.grupo_alumnos ga where ga.grupo_id = g.id)
      )), '[]'::jsonb)
      from public.grupos g
      where g.id in (select (x->>'grupo_id')::uuid from jsonb_array_elements(v_origenes) x)
    )
  );
end;
$function$;

revoke all on function public.mover_familia_entre_turnos_app(jsonb) from public, anon;
grant execute on function public.mover_familia_entre_turnos_app(jsonb) to authenticated;

-- Si la familia acepta por enlace una opción de familia completa (con
-- hermanos ya colocados), no se mueve a nadie solo.
create or replace function public.responder_propuesta_cambio_turno_publico_app(p_token uuid, p_sesion_id text)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_opciones jsonb;
  v_opcion jsonb;
  v_fila record;
  v_motivo text;
  v_movidos integer := 0;
  v_no_movidos text[] := '{}';
  v_nombres text;
  v_semana date;
  v_titulo text;
  v_cuerpo text;
begin
  if p_token is null then
    raise exception 'Enlace no válido.';
  end if;

  select c.opciones into v_opciones
  from public.cambios_turno_propuestos_app c
  where c.token_publico = p_token
    and c.estado in ('ENVIADO', 'ACEPTADO', 'RECHAZADO')
  order by c.updated_at desc
  limit 1;

  if v_opciones is null then
    raise exception 'Esta propuesta ya no está disponible. Escribid a Mítico por WhatsApp.';
  end if;
  if exists (select 1 from public.cambios_turno_propuestos_app c where c.token_publico = p_token and c.movido_at is not null) then
    raise exception 'Ya os hemos cambiado de turno. Si necesitáis otro cambio, escribidnos por WhatsApp.';
  end if;

  select string_agg(distinct initcap(lower(split_part(trim(a.nombre_completo), ' ', 1))), ' y '), min(s.fecha)
    into v_nombres, v_semana
  from public.cambios_turno_propuestos_app c
  join public.alumnos a on a.id = c.alumno_id
  join public.sesiones s on s.id = c.sesion_origen_id
  where c.token_publico = p_token and c.estado in ('ENVIADO', 'ACEPTADO', 'RECHAZADO');
  v_semana := date_trunc('week', v_semana::timestamp)::date;

  if upper(coalesce(p_sesion_id, '')) = 'NINGUNA' then
    update public.cambios_turno_propuestos_app
    set estado = 'RECHAZADO', opcion_aceptada = null, respondido_familia_at = now()
    where token_publico = p_token and estado in ('ENVIADO', 'ACEPTADO', 'RECHAZADO');
    v_titulo := 'Familia sin turno: ' || coalesce(v_nombres, 'niño');
    v_cuerpo := 'La familia de ' || coalesce(v_nombres, 'un niño') || ' dice que no le viene bien ninguno de los turnos propuestos. Míralo en Entrenamientos → Niños sin colocar.';
  else
    select o into v_opcion from jsonb_array_elements(v_opciones) o where o->>'sesionId' = p_sesion_id limit 1;
    if v_opcion is null then
      raise exception 'Esa opción no está en la propuesta.';
    end if;

    for v_fila in
      select c.id, c.sesion_alumno_id from public.cambios_turno_propuestos_app c
      where c.token_publico = p_token and c.estado in ('ENVIADO', 'ACEPTADO', 'RECHAZADO')
    loop
      -- Opción de familia completa (hermanos ya colocados): no se mueve a nadie
      -- solo, para no separarlos; coordinación usa «Mover a toda la familia».
      if coalesce((v_opcion->>'familia')::boolean, false) then
        v_motivo := 'hay hermanos ya colocados: usa «Mover a toda la familia»';
      else
        v_motivo := public.mover_por_respuesta_familia_app(v_fila.sesion_alumno_id, p_sesion_id::uuid);
      end if;
      update public.cambios_turno_propuestos_app
      set estado = 'ACEPTADO', opcion_aceptada = v_opcion, respondido_familia_at = now(),
          movido_at = case when v_motivo is null then now() else null end
      where id = v_fila.id;
      if v_motivo is null then v_movidos := v_movidos + 1;
      elsif not (v_motivo = any(v_no_movidos)) then v_no_movidos := v_no_movidos || v_motivo; end if;
    end loop;

    v_titulo := 'Listo para colocar: ' || coalesce(v_nombres, 'niño') || ' → ' || coalesce(v_opcion->>'etiqueta', 'turno elegido');
    v_cuerpo := case when cardinality(v_no_movidos) = 0
      then 'La familia de ' || coalesce(v_nombres, 'un niño') || ' ha elegido ' || coalesce(v_opcion->>'etiqueta', 'el turno') || '. Ya está en ese día sin grupo: ponle grupo en Entrenamientos → Niños sin colocar.'
      else 'La familia de ' || coalesce(v_nombres, 'un niño') || ' ha elegido ' || coalesce(v_opcion->>'etiqueta', 'el turno') || ', pero no lo he podido pasar solo (' || array_to_string(v_no_movidos, ', ') || '). Hazlo desde Niños sin colocar.'
    end;
  end if;

  -- Aviso de Paco (en la app).
  insert into public.paco_avisos(tipo, titulo, cuerpo, dedupe_key, semana_inicio)
  values ('CAMBIO_TURNO_FAMILIA', v_titulo, v_cuerpo, 'cambio-turno:' || p_token::text || ':' || coalesce(p_sesion_id, '') || ':' || extract(epoch from now())::bigint, v_semana)
  on conflict (dedupe_key) do nothing;
  -- (El push al móvil queda para cuando se despliegue la acción
  -- 'enviar_avisos_pendientes' de mitico-paco-avisos; de momento el aviso
  -- aparece en Paco dentro de la app.)

  return jsonb_build_object('estado', case when upper(coalesce(p_sesion_id, '')) = 'NINGUNA' then 'RECHAZADO' else 'ACEPTADO' end,
                            'opcion', v_opcion, 'movidos', v_movidos);
end;
$function$;


revoke all on function public.responder_propuesta_cambio_turno_publico_app(uuid, text) from public;
grant execute on function public.responder_propuesta_cambio_turno_publico_app(uuid, text) to anon, authenticated;
