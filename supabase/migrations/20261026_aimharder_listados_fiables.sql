-- ---------------------------------------------------------------------------
-- 20261026 · Listados de AimHarder fiables (botón «Traer / Refrescar listado»)
--
-- Problema: AimHarder no tiene «quién va a esta clase». Solo deja preguntar,
-- niño a niño, «qué reservas tiene». La copia (esquema aimharder_sync) repasa
-- niños de uno en uno (1 por minuto, tope propio 60/h) y el botón de la app
-- solo pedía repasar a los niños que YA sabía que iban a esa clase: los que
-- reservaban por primera vez esa semana no aparecían y no se avisaba de nada.
--
-- Cambios (todo dentro de aimharder_sync + 1 función public que ya existía):
--   1. Presupuesto en dos niveles: lo que pide Jose con el botón puede llegar
--      a 80/h y 950/24 h; el repaso automático de fondo se queda en 60/h y
--      850/24 h. (Límites de AimHarder: 100/h y 1000/día.)
--   2. El reloj (cron) pasa de cada minuto a cada 30 s, para poder llegar a
--      80/h cuando hay prisa. Cada tick dura ~0,08 s.
--   3. Solo se repasan niños del club (Baby / Ocio / Intensivos o con ficha en
--      la app), no deportistas de competición ni adultos.
--   4. Antes de cada turno se repasa a los «habituales» de ese turno (los que
--      reservaron esa misma clase en las últimas 8 semanas).
--   5. El botón ahora pide repasar también a los habituales del turno (antes
--      solo a los ya conocidos) y devuelve el progreso: cuántos quedan y en
--      cuántos minutos termina, para que la app lo diga claro y se actualice
--      sola al terminar.
--   6. El calendario guarda el dato crudo de cada clase y, si AimHarder trae
--      el número de reservas, lo guarda en clases.reservadas. Con ese número
--      la app puede decir «AimHarder dice 12, yo tengo 10».
--
-- Rollback: supabase/rollback/20261026_aimharder_listados_fiables_rollback.sql
-- ---------------------------------------------------------------------------

-- 6 · columnas nuevas del calendario --------------------------------------
alter table aimharder_sync.clases add column if not exists reservadas int;
alter table aimharder_sync.clases add column if not exists datos jsonb;

-- 1 · presupuesto «urgente» (botón de Jose) ---------------------------------
create or replace function aimharder_sync.presupuesto_urgente_ok()
 returns boolean
 language sql
 stable
 set search_path to 'aimharder_sync', 'pg_temp'
as $function$
  select (select count(*) from aimharder_sync.aimharder_api_requests where requested_at > now() - interval '1 hour') < 80
     and (select count(*) from aimharder_sync.aimharder_api_requests where requested_at > now() - interval '24 hours') < 950;
$function$;

-- El de fondo baja el tope diario de 900 a 850 para dejar sitio al botón.
create or replace function aimharder_sync.presupuesto_ok()
 returns boolean
 language sql
 stable
 set search_path to 'aimharder_sync', 'pg_temp'
as $function$
  select (select count(*) from aimharder_sync.aimharder_api_requests where requested_at > now() - interval '1 hour') < 60
     and (select count(*) from aimharder_sync.aimharder_api_requests where requested_at > now() - interval '24 hours') < 850;
$function$;

revoke all on function aimharder_sync.presupuesto_urgente_ok() from public;
revoke all on function aimharder_sync.presupuesto_ok() from public;

-- 4 · habituales de una clase concreta --------------------------------------
create or replace function aimharder_sync.habituales_clase(p_fecha date, p_schedule_id bigint)
 returns table(cid bigint)
 language sql
 stable
 set search_path to 'aimharder_sync', 'pg_temp'
as $function$
  select distinct r.cid
  from aimharder_sync.clases c
  join aimharder_sync.reservas r
    on r.class_id = c.class_id and r.hora = c.hora
   and r.dia between c.fecha - 56 and c.fecha - 1
   and r.cancelada_at is null
  where c.fecha = p_fecha and c.schedule_id = p_schedule_id;
$function$;
revoke all on function aimharder_sync.habituales_clase(date, bigint) from public;

-- El token también usa el presupuesto urgente: si el de fondo se agota, no
-- puede quedarse la copia sin token (único cambio respecto a la versión actual).
create or replace function aimharder_sync.mantener_token(p_uso boolean default true)
 returns boolean
 language plpgsql
 set search_path to 'aimharder_sync', 'pg_temp'
as $function$
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
    if aimharder_sync.presupuesto_urgente_ok() and t.pending_refresh_id is null then
      update aimharder_sync.aimharder_api_tokens
        set pending_refresh_id = aimharder_sync.lanzar_get('https://api.aimharder.com/auth/tokens/refresh', 'GET /auth/tokens/refresh', t.refresh_token)
      where id = 1;
    end if;
    return t.access_token is not null and t.access_expires_at > now() + interval '5 minutes';
  end if;
  return true;
end $function$;

-- 1 · lanzar: lo urgente (prioridad ≥ 9 o calendario pedido desde la app) usa
-- el presupuesto urgente; el resto, el de fondo.
create or replace function aimharder_sync.lanzar_siguiente()
 returns text
 language plpgsql
 set search_path to 'aimharder_sync', 'pg_temp'
as $function$
declare v_access text; q record; b record; v_fecha date; v_urgente boolean;
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

  v_urgente := exists (select 1 from aimharder_sync.cola where prioridad >= 9)
            or exists (select 1 from aimharder_sync.calendario where urgente and pending_request_id is null);
  if v_urgente then
    if not aimharder_sync.presupuesto_urgente_ok() then return 'presupuesto urgente agotado'; end if;
  elsif not aimharder_sync.presupuesto_ok() then
    return 'presupuesto agotado';
  end if;
  if not aimharder_sync.mantener_token(true) then return 'esperando token'; end if;
  select access_token into v_access from aimharder_sync.aimharder_api_tokens where id = 1;

  -- calendario pedido desde la app (sin él no se sabe ni qué clases hay)
  if v_fecha is not null and exists (select 1 from aimharder_sync.calendario where fecha = v_fecha and urgente) then
    update aimharder_sync.calendario set
      pending_request_id = aimharder_sync.lanzar_get('https://api.aimharder.com/calendar/'||to_char(v_fecha,'YYYY-MM-DD'), 'GET /calendar/{fecha}', v_access),
      lanzado_at = now()
    where fecha = v_fecha;
    return 'lanzado calendario urgente';
  end if;

  select * into q from aimharder_sync.cola where prioridad >= 9 order by prioridad desc, solicitado_at limit 1;
  if found then
    update aimharder_sync.cola set
      pending_request_id = aimharder_sync.lanzar_get(
        'https://api.aimharder.com/clients/'||q.cid||'/booking-history?cursor='||q.cursor||'&id_from='||aimharder_sync.rvid_desde(q.cid),
        'GET /clients/{cid}/booking-history', v_access),
      lanzado_at = now()
    where cid = q.cid;
    return 'lanzado historial urgente';
  end if;

  -- a partir de aquí, solo con presupuesto de fondo
  if not aimharder_sync.presupuesto_ok() then return 'presupuesto agotado'; end if;

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
end $function$;

-- 3 + 4 · planificar: solo niños del club; habituales antes de cada turno ----
create or replace function aimharder_sync.planificar()
 returns void
 language plpgsql
 set search_path to 'aimharder_sync', 'pg_temp'
as $function$
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

  -- Noche: niños con ficha en la app y activos de esta temporada, cada noche;
  -- los de temporadas anteriores (Baby/Ocio/Intensivos), cada 4 días.
  if v_h between 0 and 6 then
    insert into aimharder_sync.cola (cid, prioridad, motivo)
    select c.cid, 1, 'noche'
    from aimharder_sync.clientes c
    where c.fecha_baja is null
      and coalesce(c.reservas_sync_at, 'epoch'::timestamptz) < now() - interval '20 hours'
      and (exists (select 1 from aimharder_sync.alumno_vinculo v where v.cid = c.cid)
           or exists (select 1 from aimharder_sync.reservas r
                      where r.cid = c.cid and r.dia >= current_date - 45 and aimharder_sync.modalidad_de(r.clase) is not null)
           or (aimharder_sync.modalidad_de(c.ultima_clase) is not null and c.ultima_reserva >= current_date - 60)
           or (c.alta_aimharder >= current_date - 60 and c.fecha_nacimiento > current_date - interval '20 years'))
    on conflict (cid) do nothing;

    insert into aimharder_sync.cola (cid, prioridad, motivo)
    select c.cid, 0, 'noche_antiguos'
    from aimharder_sync.clientes c
    where c.fecha_baja is null
      and aimharder_sync.modalidad_de(c.ultima_clase) is not null
      and c.ultima_reserva >= current_date - 400
      and coalesce(c.reservas_sync_at, 'epoch'::timestamptz) < now() - interval '96 hours'
    on conflict (cid) do nothing;
  end if;

  -- Antes de cada turno (hoy y mañana): sus habituales, cada 6 h, desde las 6:00.
  if v_h between 6 and 21 then
    insert into aimharder_sync.cola (cid, prioridad, motivo)
    select distinct h.cid, 3, 'habituales_turno'
    from aimharder_sync.clases k
    cross join lateral aimharder_sync.habituales_clase(k.fecha, k.schedule_id) h
    join aimharder_sync.clientes c on c.cid = h.cid
    where k.fecha between current_date and current_date + 1
      and not k.cancelada
      and aimharder_sync.modalidad_de(k.nombre) is not null
      and c.fecha_baja is null
      and coalesce(c.reservas_sync_at, 'epoch'::timestamptz) < now() - interval '6 hours'
    on conflict (cid) do update set prioridad = greatest(aimharder_sync.cola.prioridad, 3);
  end if;

  if v_h between 8 and 21 then
    -- Día: activos del club (reservas de Baby/Ocio/Intensivos recientes) y altas nuevas, cada 6 h.
    insert into aimharder_sync.cola (cid, prioridad, motivo)
    select c.cid, 2, 'dia_activos'
    from aimharder_sync.clientes c
    where c.fecha_baja is null
      and coalesce(c.reservas_sync_at, 'epoch'::timestamptz) < now() - interval '6 hours'
      and (exists (select 1 from aimharder_sync.reservas r
                   where r.cid = c.cid and (r.dia >= current_date - 14 or r.reservada_at >= current_date - 30)
                     and aimharder_sync.modalidad_de(r.clase) is not null)
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
end $function$;

-- 6 · calendario: guarda el dato crudo y, si viene, el nº de reservas -------
create or replace function aimharder_sync.procesar_calendario(p_fecha date, p_data jsonb)
 returns void
 language plpgsql
 set search_path to 'aimharder_sync', 'pg_temp'
as $function$
declare e jsonb; v_ids bigint[] := '{}'; v_dur text; v_res int;
begin
  for e in select * from jsonb_array_elements(aimharder_sync.como_lista(p_data)) loop
    continue when (e->>'schedule_id') !~ '^\d+$';
    v_dur := coalesce(e->>'duration','');
    select (e->>k)::int into v_res
    from unnest(array['booked','bookings','num_bookings','total_bookings','bookings_count','reservations','occupation','ocupation','occupied','enrolled']) k
    where (e->>k) ~ '^\d{1,4}$'
    limit 1;
    insert into aimharder_sync.clases (schedule_id, fecha, class_id, nombre, hora, duracion_min, cancelada, limite, visto_at, reservadas, datos)
    values ((e->>'schedule_id')::bigint, p_fecha,
      case when (e->>'class_id') ~ '^\d+$' then (e->>'class_id')::bigint end,
      trim(e->>'name'), left(e->>'time',5),
      case when v_dur ~ '^\d+$' then v_dur::int
           when v_dur ~ '^\d{1,2}:\d{2}' then extract(epoch from v_dur::time)::int / 60 end,
      coalesce((e->>'cancelled')::boolean, false),
      case when (e->>'limit') ~ '^\d+$' then (e->>'limit')::int end, now(), v_res, e)
    on conflict (schedule_id, fecha) do update set class_id = excluded.class_id, nombre = excluded.nombre,
      hora = excluded.hora, duracion_min = excluded.duracion_min, cancelada = excluded.cancelada, limite = excluded.limite,
      visto_at = now(), reservadas = excluded.reservadas, datos = excluded.datos;
    v_ids := v_ids || (e->>'schedule_id')::bigint;
  end loop;
  delete from aimharder_sync.clases where fecha = p_fecha and not (schedule_id = any(v_ids));
end $function$;

-- 5 · botón de la app: repasa conocidos + habituales y devuelve el progreso --
create or replace function public.aimharder_asistentes_app(p_fecha date, p_schedule_id bigint)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'aimharder_sync', 'public', 'pg_temp'
as $function$
declare c record; v_act jsonb; v_canc jsonb; v_sync timestamptz;
  v_cands bigint[]; v_pend int; v_pos int; v_hora int; v_espera int; v_eta int;
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

  -- A quién hay que mirar: los que ya sé que van (por si cancelan) y los
  -- habituales de este turno (por si han reservado y aún no lo he visto).
  select coalesce(array_agg(distinct x.cid), '{}') into v_cands
  from (
    select a.cid from aimharder_sync.asistentes_clase(p_fecha, p_schedule_id) a where a.cid is not null
    union
    select h.cid from aimharder_sync.habituales_clase(p_fecha, p_schedule_id) h
  ) x
  join aimharder_sync.clientes cl on cl.cid = x.cid and cl.fecha_baja is null;

  -- Solo clases que aún no han pasado: las pasadas no cambian.
  if p_fecha >= current_date then
    insert into aimharder_sync.cola (cid, prioridad, motivo)
    select cl.cid, 10, 'app_refrescar_clase'
    from aimharder_sync.clientes cl
    where cl.cid = any(v_cands)
      and coalesce(cl.reservas_sync_at, 'epoch'::timestamptz) < now() - interval '10 minutes'
    on conflict (cid) do update set prioridad = greatest(aimharder_sync.cola.prioridad, 10);
  end if;

  update aimharder_sync.barrido set estado = 'en_curso', cursor = '', paginas = 0, clientes_leidos = 0, clientes_guardados = 0,
    started_at = now(), finished_at = null,
    id_from = case when tipo = 'invitados' then (select min(guest_booking_id) from aimharder_sync.invitados where dia >= current_date - 1) end,
    updated_at = now()
  where estado in ('completado','error') and coalesce(finished_at, updated_at) < now() - interval '30 minutes';

  -- Progreso: cuántos de este turno siguen en cola y en qué puesto va el último.
  select count(*), coalesce(max(pos), 0) into v_pend, v_pos
  from (
    select q.cid, row_number() over (order by q.prioridad desc, q.solicitado_at, q.cid) pos
    from aimharder_sync.cola q where q.prioridad >= 9
  ) o
  where o.cid = any(v_cands);

  -- ~80 consultas/h ⇒ ~0,75 min por niño; si la hora ya está gastada, se
  -- espera a que se libere.
  select count(*) into v_hora from aimharder_sync.aimharder_api_requests where requested_at > now() - interval '1 hour';
  v_espera := 0;
  if v_pend > 0 and v_hora >= 80 then
    select greatest(0, ceil(extract(epoch from (max(requested_at) + interval '1 hour' - now())) / 60))::int into v_espera
    from (select requested_at from aimharder_sync.aimharder_api_requests
          where requested_at > now() - interval '1 hour' order by requested_at limit (v_hora - 79)) x;
  end if;
  v_eta := case when v_pend = 0 then 0 else v_espera + ceil(v_pos * 0.75)::int + 1 end;

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
    'clientesRepasadosAt', (select finished_at from aimharder_sync.barrido where tipo = 'clientes'),
    'reservadasAimHarder', c.reservadas,
    'repaso', jsonb_build_object(
      'revisar', coalesce(array_length(v_cands, 1), 0),
      'pendientes', v_pend,
      'etaMin', v_eta)
  );
end $function$;

revoke all on function public.aimharder_asistentes_app(date, bigint) from public, anon, authenticated;
grant execute on function public.aimharder_asistentes_app(date, bigint) to service_role;

-- 2 · reloj cada 30 s ---------------------------------------------------------
select cron.alter_job((select jobid from cron.job where jobname = 'aimharder_sync_tick'), schedule := '30 seconds');
