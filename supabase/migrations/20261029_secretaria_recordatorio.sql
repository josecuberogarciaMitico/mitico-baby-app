-- 20261029 · Secretaría: «Avisarme el … a las …» (aviso al móvil de Jose)
--
-- 1. secretaria_coordinacion gana dos columnas (no cambia nada de lo que hay):
--    recordar_at             cuándo avisar (null = sin aviso)
--    recordatorio_enviado_at cuándo se mandó (lo pone la Edge Function)
--    Si se cambia la hora del aviso, se vuelve a avisar (trigger).
-- 2. Tarea programada cada 5 minutos que llama a mitico-paco-avisos con
--    action 'tick' (misma cabecera secreta que el resumen del martes).
--    Manda los recordatorios que ya tocan y los avisos pendientes de Paco.
--
-- RLS: la tabla ya es solo de coordinador_jefe; las columnas nuevas heredan
-- sus políticas. No se cambia ninguna función existente.
--
-- Rollback: supabase/rollback/20261029_secretaria_recordatorio_rollback.sql

alter table public.secretaria_coordinacion
  add column if not exists recordar_at timestamptz,
  add column if not exists recordatorio_enviado_at timestamptz;

create index if not exists secretaria_coordinacion_recordar_idx
  on public.secretaria_coordinacion (recordar_at)
  where recordar_at is not null and recordatorio_enviado_at is null;

create or replace function public.secretaria_recordatorio_reset_app()
 returns trigger
 language plpgsql
 set search_path to 'public', 'pg_temp'
as $function$
begin
  if new.recordar_at is distinct from old.recordar_at then
    new.recordatorio_enviado_at := null;
  end if;
  return new;
end;
$function$;

drop trigger if exists secretaria_recordatorio_reset_trg on public.secretaria_coordinacion;
create trigger secretaria_recordatorio_reset_trg
  before update of recordar_at on public.secretaria_coordinacion
  for each row execute function public.secretaria_recordatorio_reset_app();

select cron.unschedule('paco_tick_5min') where exists (select 1 from cron.job where jobname = 'paco_tick_5min');
select cron.schedule(
  'paco_tick_5min',
  '*/5 * * * *',
  $cron$
    select net.http_post(
      url := 'https://natxwawulodkoauqkwqz.supabase.co/functions/v1/mitico-paco-avisos',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-mitico-cron-secret', (select valor from public.push_internal_config_app where clave = 'report_reminder_cron_secret')
      ),
      body := '{"action":"tick"}'::jsonb,
      timeout_milliseconds := 30000
    );
  $cron$
);
