-- 20261026 (3) · Los barridos de invitados y clientes nuevos no se quedan parados
-- detrás de la cola urgente del botón. Si llevan más de 3 min sin avanzar, les
-- toca turno (invitados primero). Caso real: Nicolás de Cara Ferrer [Invitado]
-- en Baby domingo 01/11 12:00 no salía porque el barrido de invitados llevaba
-- parado desde las 11:52.
-- Rollback: volver a lanzar_siguiente de 20261026_aimharder_listados_fiables.sql
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

  if v_fecha is not null and exists (select 1 from aimharder_sync.calendario where fecha = v_fecha and urgente) then
    update aimharder_sync.calendario set
      pending_request_id = aimharder_sync.lanzar_get('https://api.aimharder.com/calendar/'||to_char(v_fecha,'YYYY-MM-DD'), 'GET /calendar/{fecha}', v_access),
      lanzado_at = now()
    where fecha = v_fecha;
    return 'lanzado calendario urgente';
  end if;

  -- Barridos con turno reservado: si llevan más de 3 min sin avanzar, van antes
  -- que la cola urgente. Invitados primero (pocas páginas, niños apuntados).
  select * into b from aimharder_sync.barrido
  where estado = 'en_curso' and coalesce(updated_at, started_at, 'epoch'::timestamptz) < now() - interval '3 minutes'
  order by case tipo when 'invitados' then 0 else 1 end limit 1;
  if found then
    update aimharder_sync.barrido set
      pending_request_id = aimharder_sync.lanzar_get(
        case b.tipo when 'clientes' then 'https://api.aimharder.com/clients?cursor='||b.cursor
             else 'https://api.aimharder.com/guests?cursor='||b.cursor||coalesce('&id_from='||b.id_from,'') end,
        case b.tipo when 'clientes' then 'GET /clients' else 'GET /guests' end, v_access),
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

  select * into b from aimharder_sync.barrido where estado = 'en_curso' order by case tipo when 'invitados' then 0 else 1 end limit 1;
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

select 'listo' as resultado;
