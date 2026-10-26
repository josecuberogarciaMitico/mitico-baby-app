-- Rollback de 20261026_aimharder_listados_fiables.sql
-- Deja las funciones exactamente como estaban el 26/10/2026 antes del cambio
-- (copiadas con pg_get_functiondef) y el reloj otra vez cada minuto.
-- Las columnas clases.reservadas / clases.datos se quitan al final.

select cron.alter_job((select jobid from cron.job where jobname = 'aimharder_sync_tick'), schedule := '* * * * *');

CREATE OR REPLACE FUNCTION public.aimharder_asistentes_app(p_fecha date, p_schedule_id bigint)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'aimharder_sync', 'public', 'pg_temp'
AS $function$
declare c record; v_act jsonb; v_canc jsonb; v_sync timestamptz;
begin
  select * into c from aimharder_sync.clases where schedule_id = p_schedule_id and fecha = p_fecha;
  if not found then
    return jsonb_build_object('error', 'CLASS_NOT_FOUND');
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
      'name', a.nombre, 'guest', a.invitado,
      'bookingAt', to_char(a.reservada_at, 'YYYY-MM-DD HH24:MI:SS'),
      'phone', a.telefono, 'birthDate', to_char(a.fecha_nacimiento, 'YYYY-MM-DD'),
      'clientId', a.cid::text) order by a.invitado, a.nombre), '[]'::jsonb)
    into v_act
  from aimharder_sync.asistentes_clase(p_fecha, p_schedule_id) a where a.activo;

  select coalesce(jsonb_agg(a.nombre order by a.nombre), '[]'::jsonb) into v_canc
  from aimharder_sync.asistentes_clase(p_fecha, p_schedule_id) a where not a.activo;

  select min(cl.reservas_sync_at) into v_sync
  from aimharder_sync.asistentes_clase(p_fecha, p_schedule_id) a join aimharder_sync.clientes cl on cl.cid = a.cid;

  insert into aimharder_sync.cola (cid, prioridad, motivo)
  select a.cid, 10, 'app_refrescar_clase'
  from aimharder_sync.asistentes_clase(p_fecha, p_schedule_id) a join aimharder_sync.clientes cl on cl.cid = a.cid
  where coalesce(cl.reservas_sync_at, 'epoch'::timestamptz) < now() - interval '10 minutes'
  on conflict (cid) do update set prioridad = greatest(aimharder_sync.cola.prioridad, 10);
  update aimharder_sync.barrido set estado = 'en_curso', cursor = '', paginas = 0, clientes_leidos = 0, clientes_guardados = 0,
    started_at = now(), finished_at = null,
    id_from = case when tipo = 'invitados' then (select min(guest_booking_id) from aimharder_sync.invitados where dia >= current_date - 1) end,
    updated_at = now()
  where estado in ('completado','error') and coalesce(finished_at, updated_at) < now() - interval '30 minutes';

  return jsonb_build_object(
    'booking', jsonb_build_object(
      'id', c.schedule_id, 'date', to_char(c.fecha, 'YYYY-MM-DD'),
      'time', c.hora || coalesce(' - ' || aimharder_sync.hora_fin(c.hora, c.duracion_min), ''),
      'timeid', c.schedule_id::text, 'className', c.nombre, 'coachName', null,
      'ocupation', jsonb_array_length(v_act), 'limit', coalesce(c.limite, 0), 'waitlist', -1,
      'modalidad', aimharder_sync.modalidad_de(c.nombre), 'cancelled', c.cancelada),
    'attendees', v_act,
    'total', jsonb_array_length(v_act),
    'cancelledNames', v_canc,
    'reservasActualizadasAt', v_sync,
    'clientesRepasadosAt', (select finished_at from aimharder_sync.barrido where tipo = 'clientes')
  );
end $function$
;

CREATE OR REPLACE FUNCTION aimharder_sync.lanzar_siguiente()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'aimharder_sync', 'pg_temp'
AS $function$
declare v_access text; q record; b record; v_fecha date;
begin
  if exists (select 1 from aimharder_sync.barrido where pending_request_id is not null)
     or exists (select 1 from aimharder_sync.cola where pending_request_id is not null)
     or exists (select 1 from aimharder_sync.calendario where pending_request_id is not null) then
    return 'hay una consulta en curso';
  end if;
  v_fecha := aimharder_sync.calendario_pendiente();
  if v_fecha is null and not exists (select 1 from aimharder_sync.cola)
     and not exists (select 1 from aimharder_sync.barrido where estado = 'en_curso') then
    return 'nada que hacer';
  end if;
  if not aimharder_sync.presupuesto_ok() then return 'presupuesto agotado'; end if;
  if not aimharder_sync.mantener_token(true) then return 'esperando token'; end if;
  select access_token into v_access from aimharder_sync.aimharder_api_tokens where id = 1;

  select * into q from aimharder_sync.cola where prioridad >= 10 order by prioridad desc, solicitado_at limit 1;
  if found then
    update aimharder_sync.cola set
      pending_request_id = aimharder_sync.lanzar_get(
        'https://api.aimharder.com/clients/'||q.cid||'/booking-history?cursor='||q.cursor||'&id_from='||aimharder_sync.rvid_desde(q.cid),
        'GET /clients/{cid}/booking-history', v_access),
      lanzado_at = now()
    where cid = q.cid;
    return 'lanzado historial urgente';
  end if;

  if v_fecha is not null then
    update aimharder_sync.calendario set
      pending_request_id = aimharder_sync.lanzar_get('https://api.aimharder.com/calendar/'||to_char(v_fecha,'YYYY-MM-DD'), 'GET /calendar/{fecha}', v_access),
      lanzado_at = now()
    where fecha = v_fecha;
    return 'lanzado calendario';
  end if;

  select * into b from aimharder_sync.barrido where estado = 'en_curso' order by case tipo when 'clientes' then 0 else 1 end limit 1;
  if found then
    update aimharder_sync.barrido set
      pending_request_id = aimharder_sync.lanzar_get(
        case b.tipo when 'clientes' then 'https://api.aimharder.com/clients?cursor='||b.cursor
             else 'https://api.aimharder.com/guests?cursor='||b.cursor||coalesce('&id_from='||b.id_from,'') end,
        case b.tipo when 'clientes' then 'GET /clients' else 'GET /guests' end, v_access),
      started_at = coalesce(started_at, now()), updated_at = now()
    where tipo = b.tipo;
    return 'lanzado barrido '||b.tipo;
  end if;

  select * into q from aimharder_sync.cola order by prioridad desc, solicitado_at limit 1;
  if not found then return 'nada que hacer'; end if;
  update aimharder_sync.cola set
    pending_request_id = aimharder_sync.lanzar_get(
      'https://api.aimharder.com/clients/'||q.cid||'/booking-history?cursor='||q.cursor||'&id_from='||aimharder_sync.rvid_desde(q.cid),
      'GET /clients/{cid}/booking-history', v_access),
    lanzado_at = now()
  where cid = q.cid;
  return 'lanzado historial';
end $function$
;

CREATE OR REPLACE FUNCTION aimharder_sync.mantener_token(p_uso boolean DEFAULT true)
 RETURNS boolean
 LANGUAGE plpgsql
 SET search_path TO 'aimharder_sync', 'pg_temp'
AS $function$
declare t record; r record; j jsonb;
begin
  select * into t from aimharder_sync.aimharder_api_tokens where id = 1 for update;
  if not found then return false; end if;

  if t.pending_refresh_id is not null then
    select * into r from net._http_response where id = t.pending_refresh_id;
    if not found then return false; end if;
    if r.status_code = 200 then
      j := r.content::jsonb -> 'data';
      if coalesce(j->>'refresh-token','') <> '' and coalesce(j->>'access-token','') <> '' then
        update aimharder_sync.aimharder_api_tokens set
          refresh_token = j->>'refresh-token',
          refresh_expires_at = (j->>'refresh-token-expires-at')::timestamp at time zone 'UTC',
          access_token = j->>'access-token',
          access_expires_at = (j->>'access-token-expires-at')::timestamp at time zone 'UTC',
          pending_refresh_id = null, updated_at = now()
        where id = 1;
      end if;
    else
      update aimharder_sync.aimharder_api_tokens set pending_refresh_id = null where id = 1;
      update aimharder_sync.barrido set ultimo_error = 'refresh HTTP '||coalesce(r.status_code::text,'?')||' '||left(coalesce(r.error_msg, r.content,''),200), updated_at = now();
    end if;
    delete from net._http_response where id = t.pending_refresh_id;
    select * into t from aimharder_sync.aimharder_api_tokens where id = 1;
  end if;

  if (p_uso and (t.access_token is null or t.access_expires_at < now() + interval '3 hours')) or t.updated_at < now() - interval '7 days' then
    if aimharder_sync.presupuesto_ok() and t.pending_refresh_id is null then
      update aimharder_sync.aimharder_api_tokens
        set pending_refresh_id = aimharder_sync.lanzar_get('https://api.aimharder.com/auth/tokens/refresh', 'GET /auth/tokens/refresh', t.refresh_token)
      where id = 1;
    end if;
    return t.access_token is not null and t.access_expires_at > now() + interval '5 minutes';
  end if;
  return true;
end $function$
;

CREATE OR REPLACE FUNCTION aimharder_sync.planificar()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'aimharder_sync', 'pg_temp'
AS $function$
declare v_local timestamp := now() at time zone 'Europe/Madrid'; v_h int := extract(hour from (now() at time zone 'Europe/Madrid'));
begin
  insert into aimharder_sync.alumno_vinculo (alumno_id, cid, metodo)
  select m.id, m.cid, 'auto_nombre_fnac'
  from (
    select a.id, min(c.cid) cid, count(*) k
    from public.alumnos a
    join aimharder_sync.clientes c
      on public.normalizar_nombre_app(replace(c.nombre_norm,'-',' ')) = public.normalizar_nombre_app(replace(a.nombre_normalizado,'-',' '))
     and c.fecha_nacimiento = a.fecha_nacimiento
    where a.activo and not exists (select 1 from aimharder_sync.alumno_vinculo v where v.alumno_id = a.id)
    group by a.id
  ) m
  where m.k = 1 and not exists (select 1 from aimharder_sync.alumno_vinculo v where v.cid = m.cid)
  on conflict do nothing;

  insert into aimharder_sync.calendario (fecha)
  select d::date from generate_series(current_date - 7, current_date + 13, interval '1 day') d
  on conflict (fecha) do nothing;

  if v_h between 0 and 6 then
    insert into aimharder_sync.cola (cid, prioridad, motivo)
    select c.cid, 1, 'noche'
    from aimharder_sync.clientes c
    where c.fecha_baja is null
      and (
        ((exists (select 1 from aimharder_sync.reservas r where r.cid = c.cid and r.dia >= current_date - 45)
          or (c.alta_aimharder >= current_date - 60 and c.fecha_nacimiento > current_date - interval '20 years'))
         and coalesce(c.reservas_sync_at, 'epoch'::timestamptz) < now() - interval '12 hours')
        or ((exists (select 1 from aimharder_sync.alumno_vinculo v where v.cid = c.cid) or aimharder_sync.es_modalidad(c.ultima_clase))
            and c.ultima_reserva >= current_date - 400
            and coalesce(c.reservas_sync_at, 'epoch'::timestamptz) < now() - interval '60 hours'))
    on conflict (cid) do nothing;
  end if;

  if v_h between 8 and 21 then
    insert into aimharder_sync.cola (cid, prioridad, motivo)
    select c.cid, 2, 'dia_activos'
    from aimharder_sync.clientes c
    where c.fecha_baja is null
      and coalesce(c.reservas_sync_at, 'epoch'::timestamptz) < now() - interval '4 hours'
      and (exists (select 1 from aimharder_sync.reservas r
                   where r.cid = c.cid and (r.dia >= current_date - 14 or r.reservada_at >= current_date - 30))
           or (c.alta_aimharder >= current_date - 14 and c.fecha_nacimiento > current_date - interval '20 years'))
    on conflict (cid) do update set prioridad = greatest(aimharder_sync.cola.prioridad, 2);

    update aimharder_sync.barrido set estado = 'en_curso', cursor = '', paginas = 0, clientes_leidos = 0, clientes_guardados = 0,
      started_at = now(), finished_at = null, id_from = null, updated_at = now()
    where tipo = 'clientes' and estado in ('completado','error') and coalesce(finished_at, updated_at) < now() - interval '3 hours';
    update aimharder_sync.barrido set estado = 'en_curso', cursor = '', paginas = 0, clientes_leidos = 0, clientes_guardados = 0,
      started_at = now(), finished_at = null,
      id_from = (select min(guest_booking_id) from aimharder_sync.invitados where dia >= current_date - 1),
      updated_at = now()
    where tipo = 'invitados' and estado in ('completado','error') and coalesce(finished_at, updated_at) < now() - interval '2 hours';
  end if;

  if v_h = 5 and extract(minute from v_local) = 0 then
    delete from aimharder_sync.reservas where dia < current_date - 60;
    delete from aimharder_sync.invitados where dia < current_date - 30;
    delete from aimharder_sync.clases where fecha < current_date - 60;
    delete from aimharder_sync.calendario where fecha < current_date - 8 and pending_request_id is null;
    delete from aimharder_sync.aimharder_api_requests where requested_at < now() - interval '30 days';
    delete from cron.job_run_details where jobid = (select jobid from cron.job where jobname = 'aimharder_sync_tick') and end_time < now() - interval '7 days';
  end if;
end $function$
;

CREATE OR REPLACE FUNCTION aimharder_sync.presupuesto_ok()
 RETURNS boolean
 LANGUAGE sql
 STABLE
 SET search_path TO 'aimharder_sync', 'pg_temp'
AS $function$
  select (select count(*) from aimharder_sync.aimharder_api_requests where requested_at > now() - interval '1 hour') < 60
     and (select count(*) from aimharder_sync.aimharder_api_requests where requested_at > now() - interval '24 hours') < 900;
$function$
;

CREATE OR REPLACE FUNCTION aimharder_sync.procesar_calendario(p_fecha date, p_data jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'aimharder_sync', 'pg_temp'
AS $function$
declare e jsonb; v_ids bigint[] := '{}'; v_dur text;
begin
  for e in select * from jsonb_array_elements(aimharder_sync.como_lista(p_data)) loop
    continue when (e->>'schedule_id') !~ '^\d+$';
    v_dur := coalesce(e->>'duration','');
    insert into aimharder_sync.clases (schedule_id, fecha, class_id, nombre, hora, duracion_min, cancelada, limite, visto_at)
    values ((e->>'schedule_id')::bigint, p_fecha,
      case when (e->>'class_id') ~ '^\d+$' then (e->>'class_id')::bigint end,
      trim(e->>'name'), left(e->>'time',5),
      case when v_dur ~ '^\d+$' then v_dur::int
           when v_dur ~ '^\d{1,2}:\d{2}' then extract(epoch from v_dur::time)::int / 60 end,
      coalesce((e->>'cancelled')::boolean, false),
      case when (e->>'limit') ~ '^\d+$' then (e->>'limit')::int end, now())
    on conflict (schedule_id, fecha) do update set class_id = excluded.class_id, nombre = excluded.nombre,
      hora = excluded.hora, duracion_min = excluded.duracion_min, cancelada = excluded.cancelada, limite = excluded.limite, visto_at = now();
    v_ids := v_ids || (e->>'schedule_id')::bigint;
  end loop;
  delete from aimharder_sync.clases where fecha = p_fecha and not (schedule_id = any(v_ids));
end $function$
;

drop function if exists aimharder_sync.presupuesto_urgente_ok();
drop function if exists aimharder_sync.habituales_clase(date, bigint);
alter table aimharder_sync.clases drop column if exists reservadas;
alter table aimharder_sync.clases drop column if exists datos;
