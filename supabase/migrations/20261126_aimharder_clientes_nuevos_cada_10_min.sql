-- 26/11/2026 (Jose): las fichas NUEVAS de AimHarder (altas del día) llegan en
-- minutos. Cada 10 minutos (7:00–22:00) se piden solo los clientes con id mayor
-- que el último conocido (/clients?id_from=…, comprobado: 1 página). Así el
-- teléfono y la fecha de nacimiento de un alta nueva salen en Alta/Test enseguida.
-- La copia completa de clientes (cada 3 h) sigue igual.

insert into aimharder_sync.barrido (tipo, estado) values ('clientes_nuevos', 'completado')
on conflict (tipo) do nothing;

CREATE OR REPLACE FUNCTION aimharder_sync.tick()
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'aimharder_sync', 'pg_temp'
AS $function$
declare
  -- 25/11 (autorizado por Jose): la revisión grande pasa de cada 10 a cada 30 minutos
  -- (minutos 0 y 30, primer tick), para no agotar la CPU del servidor. El resto igual.
  v_planificar boolean := extract(minute from now())::int % 30 = 0 and extract(second from now()) < 30;
  v_local timestamp := now() at time zone 'Europe/Madrid';
begin
  if v_planificar and exists (
    select 1 from public.sesiones s
    where s.fecha = v_local::date
      and v_local between (s.fecha + s.hora_inicio) - interval '20 minutes'
                      and (s.fecha + s.hora_inicio) + interval '15 minutes'
  ) then
    v_planificar := false;
  end if;

  -- 26/11: fichas nuevas cada 10 minutos de 7:00 a 22:00.
  if extract(minute from now())::int % 10 = 0 and extract(second from now()) < 30
     and extract(hour from v_local) between 7 and 21 then
    update aimharder_sync.barrido set estado = 'en_curso', cursor = '', paginas = 0, clientes_leidos = 0, clientes_guardados = 0,
      started_at = now(), finished_at = null, ultimo_error = null,
      id_from = (select max(cid) from aimharder_sync.clientes), updated_at = now()
    where tipo = 'clientes_nuevos' and estado <> 'en_curso' and pending_request_id is null;
  end if;

  begin perform aimharder_sync.mantener_token(false); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
  begin perform aimharder_sync.recoger_barrido('clientes_nuevos'); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
  begin perform aimharder_sync.recoger_barrido('clientes'); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
  begin perform aimharder_sync.recoger_barrido('invitados'); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
  begin perform aimharder_sync.recoger_cola(); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
  begin perform aimharder_sync.recoger_calendario(); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
  if v_planificar then
    begin perform aimharder_sync.planificar(); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
    begin perform aimharder_sync.planificar_club(); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
  end if;
  begin perform aimharder_sync.lanzar_siguiente(); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
end $function$;

CREATE OR REPLACE FUNCTION aimharder_sync.recoger_barrido(p_tipo text)
 RETURNS void
 LANGUAGE plpgsql
 SET search_path TO 'aimharder_sync', 'pg_temp'
AS $function$
declare b record; r record; j jsonb; v_g int := 0; v_more boolean;
begin
  select * into b from aimharder_sync.barrido where tipo = p_tipo for update;
  if not found or b.pending_request_id is null then return; end if;
  select * into r from net._http_response where id = b.pending_request_id;
  if not found then
    if b.updated_at < now() - interval '10 minutes' then
      update aimharder_sync.barrido set pending_request_id = null, ultimo_error = 'sin respuesta tras 10 min, se reintenta', updated_at = now() where tipo = p_tipo;
    end if;
    return;
  end if;
  begin
    if r.status_code = 200 then
      j := r.content::jsonb;
      -- 26/11: 'clientes_nuevos' se procesa igual que 'clientes'.
      v_g := case when p_tipo in ('clientes', 'clientes_nuevos') then aimharder_sync.procesar_pagina_clientes(j->'data')
                  else aimharder_sync.procesar_pagina_invitados(j->'data') end;
      v_more := coalesce((j->'pagination'->>'hasMore')::boolean, false);
      update aimharder_sync.barrido set
        paginas = paginas + 1, clientes_leidos = clientes_leidos + coalesce(jsonb_array_length(j->'data'),0), clientes_guardados = clientes_guardados + v_g,
        cursor = coalesce(j->'pagination'->>'nextCursor', cursor),
        estado = case when v_more then 'en_curso' else 'completado' end,
        finished_at = case when v_more then null else now() end,
        pending_request_id = null, ultimo_error = null, updated_at = now()
      where tipo = p_tipo;
    elsif r.status_code in (401, 410) then
      update aimharder_sync.aimharder_api_tokens set access_expires_at = now() where id = 1;
      update aimharder_sync.barrido set pending_request_id = null, ultimo_error = 'HTTP '||r.status_code||' (token), se reintenta', updated_at = now() where tipo = p_tipo;
    elsif r.status_code is null or r.status_code = 429 or r.status_code >= 500 or r.timed_out then
      update aimharder_sync.barrido set pending_request_id = null, ultimo_error = 'HTTP '||coalesce(r.status_code::text,'sin respuesta')||', se reintenta', updated_at = now() where tipo = p_tipo;
    else
      update aimharder_sync.barrido set pending_request_id = null, estado = 'error', ultimo_error = 'HTTP '||r.status_code||' '||left(coalesce(r.content,''),200), updated_at = now() where tipo = p_tipo;
    end if;
  exception when others then
    update aimharder_sync.barrido set pending_request_id = null, estado = 'error', ultimo_error = 'error procesando: '||left(sqlerrm,200), updated_at = now() where tipo = p_tipo;
  end;
  delete from net._http_response where id = b.pending_request_id;
end $function$;

CREATE OR REPLACE FUNCTION aimharder_sync.lanzar_siguiente()
 RETURNS text
 LANGUAGE plpgsql
 SET search_path TO 'aimharder_sync', 'pg_temp'
AS $function$
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

  if v_fecha is not null and exists (select 1 from aimharder_sync.calendario where fecha = v_fecha and urgente) then
    update aimharder_sync.calendario set
      pending_request_id = aimharder_sync.lanzar_get('https://api.aimharder.com/calendar/'||to_char(v_fecha,'YYYY-MM-DD'), 'GET /calendar/{fecha}', v_access),
      lanzado_at = now()
    where fecha = v_fecha;
    return 'lanzado calendario urgente';
  end if;

  -- Barridos con turno reservado: si llevan más de 3 min sin avanzar, van antes
  -- que la cola urgente. 26/11: las fichas nuevas (1 página) van primero y sin esperar.
  select * into b from aimharder_sync.barrido
  where estado = 'en_curso'
    and (tipo = 'clientes_nuevos' or coalesce(updated_at, started_at, 'epoch'::timestamptz) < now() - interval '3 minutes')
  order by case tipo when 'clientes_nuevos' then 0 when 'invitados' then 1 else 2 end limit 1;
  if found then
    update aimharder_sync.barrido set
      pending_request_id = aimharder_sync.lanzar_get(
        case when b.tipo in ('clientes', 'clientes_nuevos')
             then 'https://api.aimharder.com/clients?cursor='||b.cursor||
                  case when b.tipo = 'clientes_nuevos'
                       then '&id_from='||coalesce(b.id_from, (select max(cid) from aimharder_sync.clientes), 0) else '' end
             else 'https://api.aimharder.com/guests?cursor='||b.cursor||coalesce('&id_from='||b.id_from,'') end,
        case when b.tipo in ('clientes', 'clientes_nuevos') then 'GET /clients' else 'GET /guests' end, v_access),
      started_at = coalesce(started_at, now()), updated_at = now()
    where tipo = b.tipo;
    return 'lanzado barrido '||b.tipo||' (turno reservado)';
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

  if not aimharder_sync.presupuesto_ok() then return 'presupuesto agotado'; end if;

  if v_fecha is not null then
    update aimharder_sync.calendario set
      pending_request_id = aimharder_sync.lanzar_get('https://api.aimharder.com/calendar/'||to_char(v_fecha,'YYYY-MM-DD'), 'GET /calendar/{fecha}', v_access),
      lanzado_at = now()
    where fecha = v_fecha;
    return 'lanzado calendario';
  end if;

  select * into b from aimharder_sync.barrido where estado = 'en_curso'
  order by case tipo when 'clientes_nuevos' then 0 when 'invitados' then 1 else 2 end limit 1;
  if found then
    update aimharder_sync.barrido set
      pending_request_id = aimharder_sync.lanzar_get(
        case when b.tipo in ('clientes', 'clientes_nuevos')
             then 'https://api.aimharder.com/clients?cursor='||b.cursor||
                  case when b.tipo = 'clientes_nuevos'
                       then '&id_from='||coalesce(b.id_from, (select max(cid) from aimharder_sync.clientes), 0) else '' end
             else 'https://api.aimharder.com/guests?cursor='||b.cursor||coalesce('&id_from='||b.id_from,'') end,
        case when b.tipo in ('clientes', 'clientes_nuevos') then 'GET /clients' else 'GET /guests' end, v_access),
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
