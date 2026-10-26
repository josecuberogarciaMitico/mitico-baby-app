-- ---------------------------------------------------------------------------
-- 20261026 (2) · AimHarder: que no se escape ningún niño que vuelve tras meses
--
-- Caso real (31/10 y 01/11): Paniagua, Balet Corella, Gonzalo Delicado y
-- Guillén reservaron en AimHarder pero no salían en la app. Su última clase
-- fue en febrero/marzo, así que no eran «habituales» (últimas 8 semanas) y
-- solo se les repasaba de noche cada 2-3 días.
--
-- 1. habituales_clase(): además de los de las últimas 8 semanas, incluye a
--    TODOS los clientes cuya última clase fue en la misma modalidad, día y
--    turno (aunque fuera hace meses, hasta 400 días). ~100 niños en los turnos
--    grandes de fin de semana. Lo usan el botón y el repaso de fondo.
-- 2. planificar_club(): desde el LUNES a las 9:00 (hora de Madrid) hasta el
--    domingo, Paco va repasando sin parar a esos niños para las clases de la
--    semana: primero los de clases de hoy y mañana (cada 3 h), luego el resto
--    (cada 10 h). Solo actualiza la copia de AimHarder; NO toca las sesiones
--    de la app. Lo que Jose ve al pulsar «Refrescar» / «Cargar semana».
-- 3. tick(): llama a planificar_club() (sin más cambios).
--
-- Rollback: supabase/rollback/20261026_aimharder_repaso_semana_club_rollback.sql
-- ---------------------------------------------------------------------------

create or replace function aimharder_sync.franja_de_nombre(p text)
 returns text language sql immutable set search_path to 'aimharder_sync', 'pg_temp'
as $function$
  select case when m is null or d is null then null else m||'|'||d||'|'||t end
  from (select aimharder_sync.modalidad_de(p) m,
    case when u ~ 'SABAD' then 'SAB' when u ~ 'DOMING' then 'DOM' when u ~ 'VIERN' then 'VIE'
         when u ~ 'MIERC' then 'MIE' when u ~ 'JUEV' then 'JUE' when u ~ 'MART' then 'MAR' when u ~ 'LUNES' then 'LUN' end d,
    case when u ~ '(1ER|PRIMER|9[:.]?45|09[:.]?45)' then 'T1' else 'T2' end t
    from (select public.normalizar_nombre_app(coalesce(p,'')) u) a) b;
$function$;

create or replace function aimharder_sync.franja_de_clase(p_nombre text, p_fecha date, p_hora text)
 returns text language sql immutable set search_path to 'aimharder_sync', 'pg_temp'
as $function$
  select case when aimharder_sync.modalidad_de(p_nombre) is null then null else
    aimharder_sync.modalidad_de(p_nombre)||'|'||
    (array['DOM','LUN','MAR','MIE','JUE','VIE','SAB'])[extract(dow from p_fecha)::int + 1]||'|'||
    case when coalesce(p_hora,'') < '11:00' then 'T1' else 'T2' end end;
$function$;

create or replace function aimharder_sync.habituales_clase(p_fecha date, p_schedule_id bigint)
 returns table(cid bigint) language sql stable set search_path to 'aimharder_sync', 'pg_temp'
as $function$
  select distinct r.cid
  from aimharder_sync.clases c
  join aimharder_sync.reservas r
    on r.class_id = c.class_id and r.hora = c.hora
   and r.dia between c.fecha - 56 and c.fecha - 1
   and r.cancelada_at is null
  where c.fecha = p_fecha and c.schedule_id = p_schedule_id
  union
  select cl.cid
  from aimharder_sync.clases c
  join aimharder_sync.clientes cl
    on aimharder_sync.franja_de_nombre(cl.ultima_clase) = aimharder_sync.franja_de_clase(c.nombre, c.fecha, c.hora)
   and cl.fecha_baja is null
   and cl.ultima_reserva >= c.fecha - 400
  where c.fecha = p_fecha and c.schedule_id = p_schedule_id;
$function$;

create or replace function aimharder_sync.planificar_club()
 returns void language plpgsql set search_path to 'aimharder_sync', 'pg_temp'
as $function$
declare
  v_local timestamp := now() at time zone 'Europe/Madrid';
  v_hoy date := (now() at time zone 'Europe/Madrid')::date;
  v_dow int := extract(isodow from (now() at time zone 'Europe/Madrid'));
  v_domingo date;
begin
  -- Activo desde el lunes 9:00 hasta el domingo; de noche (0-6 h) no.
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

create or replace function aimharder_sync.tick()
 returns void
 language plpgsql
 set search_path to 'aimharder_sync', 'pg_temp'
as $function$
begin
  begin perform aimharder_sync.mantener_token(false); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
  begin perform aimharder_sync.recoger_barrido('clientes'); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
  begin perform aimharder_sync.recoger_barrido('invitados'); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
  begin perform aimharder_sync.recoger_cola(); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
  begin perform aimharder_sync.recoger_calendario(); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
  begin perform aimharder_sync.planificar(); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
  begin perform aimharder_sync.planificar_club(); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
  begin perform aimharder_sync.lanzar_siguiente(); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
end $function$;

revoke all on function aimharder_sync.franja_de_nombre(text) from public;
revoke all on function aimharder_sync.franja_de_clase(text, date, text) from public;
revoke all on function aimharder_sync.habituales_clase(date, bigint) from public;
revoke all on function aimharder_sync.planificar_club() from public;

select 'listo' as resultado;
