-- Deshace 20261115_aimharder_tick_ligero.sql: vuelve a planificar en cada tick (cada 30 s).
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
