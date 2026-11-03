-- Rollback de 20261103_cancelados_aimharder.sql
drop function if exists public.dejar_cancelado_aimharder_app(uuid, uuid);
drop function if exists public.cancelados_aimharder_app(date, date);
drop table if exists public.aimharder_cancelados_ignorados_app;

-- planificar_club tal y como estaba antes (solo habituales de cada clase).
create or replace function aimharder_sync.planificar_club()
 returns void
 language plpgsql
 set search_path to 'aimharder_sync', 'pg_temp'
as $function$
declare
  v_local timestamp := now() at time zone 'Europe/Madrid';
  v_hoy date := (now() at time zone 'Europe/Madrid')::date;
  v_dow int := extract(isodow from (now() at time zone 'Europe/Madrid'));
  v_domingo date;
begin
  if extract(hour from v_local) < 6 then return; end if;
  if v_dow = 1 and extract(hour from v_local) < 9 then return; end if;
  v_domingo := v_hoy + (7 - v_dow);

  insert into aimharder_sync.cola (cid, prioridad, motivo)
  select x.cid, max(x.prio), 'semana_club'
  from (
    select h.cid,
           case when k.fecha <= v_hoy + 1 then 5 else 4 end prio,
           case when k.fecha <= v_hoy + 1 then interval '3 hours' else interval '10 hours' end cada
    from aimharder_sync.clases k
    cross join lateral aimharder_sync.habituales_clase(k.fecha, k.schedule_id) h
    where k.fecha between v_hoy and v_domingo
      and not k.cancelada
      and aimharder_sync.modalidad_de(k.nombre) is not null
  ) x
  join aimharder_sync.clientes c on c.cid = x.cid
  where c.fecha_baja is null
    and coalesce(c.reservas_sync_at, 'epoch'::timestamptz) < now() - x.cada
  group by x.cid
  on conflict (cid) do update set prioridad = greatest(aimharder_sync.cola.prioridad, excluded.prioridad),
    motivo = case when excluded.prioridad > aimharder_sync.cola.prioridad then excluded.motivo else aimharder_sync.cola.motivo end;
end $function$;
