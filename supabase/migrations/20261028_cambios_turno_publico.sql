-- 20261028 · Respuesta de la familia por enlace (propuestas de cambio de turno)
--
-- Cada propuesta lleva un código secreto (token_publico, el mismo para todos
-- los hermanos de la familia). El WhatsApp incluye un enlace por opción:
--   ?confirmar_turno=<token>&o=<n>
-- La familia lo abre, pulsa «Confirmar» y la propuesta pasa a ACEPTADO (o a
-- RECHAZADO con «Ninguno nos viene bien»). Si acepta, el niño se pasa SOLO al
-- turno elegido, sin grupo (mismas comprobaciones que «mover entre turnos»),
-- y Paco avisa a coordinación (aviso en la app + push) de que está listo
-- para colocar. El grupo lo sigue poniendo coordinación.
--
-- Las funciones públicas solo dan/cambian ESA propuesta con ESE código y
-- solo enseñan el nombre de pila del niño y los turnos ofrecidos. Una vez
-- movido, la familia ya no puede cambiarlo desde el enlace.
--
-- Rollback: supabase/rollback/20261028_cambios_turno_publico_rollback.sql

alter table public.cambios_turno_propuestos_app
  add column if not exists token_publico uuid,
  add column if not exists respondido_familia_at timestamptz,
  add column if not exists movido_at timestamptz;

create index if not exists cambios_turno_propuestos_app_token_idx
  on public.cambios_turno_propuestos_app (token_publico);

-- registrar_... ahora acepta el código (lo genera la app para poder poner el
-- enlace en el mensaje antes de guardar). Misma lógica que antes.
drop function if exists public.registrar_propuesta_cambio_turno_app(uuid, uuid, uuid, jsonb, text, text);

create or replace function public.registrar_propuesta_cambio_turno_app(
  p_sesion_alumno_id uuid,
  p_alumno_id uuid,
  p_sesion_origen_id uuid,
  p_opciones jsonb,
  p_telefono text default null,
  p_mensaje text default null,
  p_token uuid default null
)
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_id uuid;
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'Solo coordinación puede registrar propuestas de cambio de turno.';
  end if;
  if p_sesion_alumno_id is null or p_alumno_id is null or p_sesion_origen_id is null then
    raise exception 'Faltan datos de la propuesta.';
  end if;

  select c.id into v_id
  from public.cambios_turno_propuestos_app c
  where c.sesion_alumno_id = p_sesion_alumno_id
    and c.estado in ('ENVIADO', 'ACEPTADO', 'RECHAZADO')
  order by c.created_at desc
  limit 1;

  if v_id is not null then
    update public.cambios_turno_propuestos_app
    set opciones = coalesce(p_opciones, '[]'::jsonb),
        estado = 'ENVIADO',
        opcion_aceptada = null,
        respondido_familia_at = null,
        telefono = p_telefono,
        mensaje = p_mensaje,
        token_publico = coalesce(p_token, gen_random_uuid())
    where id = v_id;
    return v_id;
  end if;

  insert into public.cambios_turno_propuestos_app(
    sesion_alumno_id, alumno_id, sesion_origen_id, opciones, estado, telefono, mensaje, token_publico
  ) values (
    p_sesion_alumno_id, p_alumno_id, p_sesion_origen_id, coalesce(p_opciones, '[]'::jsonb), 'ENVIADO',
    p_telefono, p_mensaje, coalesce(p_token, gen_random_uuid())
  )
  returning id into v_id;
  return v_id;
end;
$function$;

revoke all on function public.registrar_propuesta_cambio_turno_app(uuid, uuid, uuid, jsonb, text, text, uuid) from public, anon;
grant execute on function public.registrar_propuesta_cambio_turno_app(uuid, uuid, uuid, jsonb, text, text, uuid) to authenticated;

-- Lo que ve la familia al abrir el enlace.
create or replace function public.obtener_propuesta_cambio_turno_publico_app(p_token uuid)
 returns jsonb
 language sql
 stable
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
  select case when count(*) = 0 then null else jsonb_build_object(
    'nombres', jsonb_agg(distinct initcap(lower(split_part(trim(a.nombre_completo), ' ', 1)))),
    'origen', (select jsonb_build_object('fecha', s.fecha, 'hora_inicio', s.hora_inicio, 'hora_fin', s.hora_fin)
               from public.sesiones s where s.id = min(c.sesion_origen_id::text)::uuid),
    'opciones', (array_agg(c.opciones order by c.updated_at desc))[1],
    'estado', (array_agg(c.estado order by c.updated_at desc))[1],
    'opcion_aceptada', (array_agg(c.opcion_aceptada order by c.updated_at desc))[1]
  ) end
  from public.cambios_turno_propuestos_app c
  join public.alumnos a on a.id = c.alumno_id
  where p_token is not null
    and c.token_publico = p_token
    and c.estado in ('ENVIADO', 'ACEPTADO', 'RECHAZADO');
$function$;

-- Pasa al niño al turno elegido sin grupo. Mismas reglas que
-- mover_alumno_entre_turnos_operativa_app; si alguna no se cumple NO mueve
-- (devuelve el motivo) y coordinación lo hace a mano.
create or replace function public.mover_por_respuesta_familia_app(p_sesion_alumno_id uuid, p_sesion_destino_id uuid)
 returns text
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_alumno_id uuid;
  v_estado_listado text;
  v_origen uuid;
  v_fecha_origen date;
  v_fecha_destino date;
  v_mod_origen text;
  v_mod_destino text;
  v_orden integer;
begin
  select sao.alumno_id, sao.estado_en_listado, sao.sesion_id, s.fecha, upper(trim(coalesce(m.codigo, m.nombre, '')))
    into v_alumno_id, v_estado_listado, v_origen, v_fecha_origen, v_mod_origen
  from public.sesion_alumnos_operativa sao
  join public.sesiones s on s.id = sao.sesion_id
  join public.modalidades m on m.id = s.modalidad_id
  where sao.id = p_sesion_alumno_id
  for update of sao;
  if v_alumno_id is null then return 'ya no está en el listado'; end if;
  if v_origen = p_sesion_destino_id then return 'ya estaba en ese turno'; end if;

  select s.fecha, upper(trim(coalesce(m.codigo, m.nombre, '')))
    into v_fecha_destino, v_mod_destino
  from public.sesiones s join public.modalidades m on m.id = s.modalidad_id
  where s.id = p_sesion_destino_id;
  if v_fecha_destino is null then return 'el turno elegido ya no existe'; end if;
  if v_mod_origen <> 'BABY' or v_mod_destino <> 'BABY' then return 'solo se mueve solo en Baby'; end if;
  if date_trunc('week', v_fecha_origen::timestamp) <> date_trunc('week', v_fecha_destino::timestamp) then
    return 'es de otra semana';
  end if;
  if upper(trim(coalesce(v_estado_listado, ''))) = 'PENDIENTE_TEST' then return 'falta su Test/Nivel'; end if;
  if exists (select 1 from public.sesion_alumnos_operativa x where x.sesion_id = p_sesion_destino_id and x.alumno_id = v_alumno_id and x.id <> p_sesion_alumno_id) then
    return 'ya figura en el turno elegido';
  end if;
  if exists (select 1 from public.grupo_alumnos ga join public.grupos g on g.id = ga.grupo_id
             where g.sesion_id = v_origen and ga.alumno_id = v_alumno_id and coalesce(g.cancelado, false) = false) then
    return 'ya tiene grupo en su turno';
  end if;
  if exists (select 1 from public.reportes r join public.grupos g on g.id = r.grupo_id where g.sesion_id = v_origen and r.alumno_id = v_alumno_id) then
    return 'ya tiene reporte en su turno';
  end if;
  if exists (select 1 from public.asistencias a join public.grupos g on g.id = a.grupo_id
             where g.sesion_id = v_origen and a.alumno_id = v_alumno_id and upper(trim(coalesce(a.estado, 'SIN_CONFIRMAR'))) <> 'SIN_CONFIRMAR') then
    return 'ya tiene asistencia en su turno';
  end if;

  select coalesce(max(x.orden), 0) + 1 into v_orden from public.sesion_alumnos_operativa x where x.sesion_id = p_sesion_destino_id;
  update public.sesion_alumnos_operativa set sesion_id = p_sesion_destino_id, orden = v_orden where id = p_sesion_alumno_id;
  return null;
end;
$function$;

revoke all on function public.mover_por_respuesta_familia_app(uuid, uuid) from public, anon, authenticated;

-- La familia elige una opción (p_sesion_id) o 'NINGUNA'.
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
      v_motivo := public.mover_por_respuesta_familia_app(v_fila.sesion_alumno_id, p_sesion_id::uuid);
      update public.cambios_turno_propuestos_app
      set estado = 'ACEPTADO', opcion_aceptada = v_opcion, respondido_familia_at = now(),
          movido_at = case when v_motivo is null then now() else null end
      where id = v_fila.id;
      if v_motivo is null then v_movidos := v_movidos + 1; else v_no_movidos := v_no_movidos || v_motivo; end if;
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

revoke all on function public.obtener_propuesta_cambio_turno_publico_app(uuid) from public;
revoke all on function public.responder_propuesta_cambio_turno_publico_app(uuid, text) from public;
grant execute on function public.obtener_propuesta_cambio_turno_publico_app(uuid) to anon, authenticated;
grant execute on function public.responder_propuesta_cambio_turno_publico_app(uuid, text) to anon, authenticated;
