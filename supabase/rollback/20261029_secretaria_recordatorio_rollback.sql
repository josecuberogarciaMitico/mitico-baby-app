-- Rollback de 20261029_secretaria_recordatorio.sql
select cron.unschedule('paco_tick_5min') where exists (select 1 from cron.job where jobname = 'paco_tick_5min');
drop trigger if exists secretaria_recordatorio_reset_trg on public.secretaria_coordinacion;
drop function if exists public.secretaria_recordatorio_reset_app();
drop index if exists public.secretaria_coordinacion_recordar_idx;
alter table public.secretaria_coordinacion
  drop column if exists recordatorio_enviado_at,
  drop column if exists recordar_at;
