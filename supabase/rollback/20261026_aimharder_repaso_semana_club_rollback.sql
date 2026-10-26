-- Rollback de 20261026_aimharder_repaso_semana_club.sql
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
  begin perform aimharder_sync.lanzar_siguiente(); exception when others then raise warning 'aimharder_sync.tick: %', sqlerrm; end;
end $function$;

create or replace function aimharder_sync.habituales_clase(p_fecha date, p_schedule_id bigint)
 returns table(cid bigint) language sql stable set search_path to 'aimharder_sync', 'pg_temp'
as $function$
  select distinct r.cid
  from aimharder_sync.clases c
  join aimharder_sync.reservas r
    on r.class_id = c.class_id and r.hora = c.hora
   and r.dia between c.fecha - 56 and c.fecha - 1
   and r.cancelada_at is null
  where c.fecha = p_fecha and c.schedule_id = p_schedule_id;
$function$;

drop function if exists aimharder_sync.planificar_club();
drop function if exists aimharder_sync.franja_de_clase(text, date, text);
drop function if exists aimharder_sync.franja_de_nombre(text);
