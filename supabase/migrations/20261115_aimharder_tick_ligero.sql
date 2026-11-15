-- 15/11/2026 · La app se colgó el domingo 15/11 a las 9:42–9:47 (statement
-- timeout en las vistas del entrenador). Causa principal: aimharder_sync.tick()
-- se lanza cada 30 s y tarda ~6 s cada vez (≈20 % de la base de datos todo el
-- día); con muchos entrenadores abriendo la app a la vez llegó a 30 s y todo
-- empezó a fallar. Casi todo ese tiempo es planificar() y planificar_club(),
-- que calculan los habituales de cada clase (habituales_clase) para decidir a
-- quién sincronizar. Sus plazos son de horas (3 h, 6 h, 12 h), así que basta
-- con planificar cada 10 minutos. El resto del tick (token, recoger respuestas,
-- lanzar la siguiente petición) sigue cada 30 s, igual que antes.
-- Rollback: 20261115_aimharder_tick_ligero_rollback.sql

create or replace function aimharder_sync.tick()
returns void
language plpgsql
set search_path to 'aimharder_sync', 'pg_temp'
as $function$
declare
  -- Una vez cada 10 minutos (el tick de los segundos 0–29 de los minutos 0, 10, 20…).
  v_planificar boolean := extract(minute from now())::int % 10 = 0 and extract(second from now()) < 30;
begin
  begin perform aimharder_sync.mantener_token(false); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
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
