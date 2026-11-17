-- Vuelta atrás de 20261117_notificaciones_reglas.sql: todo vuelve a como estaba
-- (los tres sistemas mandando por su lado). El tipo RECORDATORIO_DIARIO se deja
-- en la lista permitida para no romper el historial de avisos ya enviados.
select cron.unschedule('mitico_recordatorio_diario')
where exists (select 1 from cron.job where jobname = 'mitico_recordatorio_diario');

select cron.schedule(
  'mitico_report_reminders_hourly',
  '15 * * * *',
  $c$
    select net.http_post(
      url := 'https://natxwawulodkoauqkwqz.supabase.co/functions/v1/mitico-report-reminders',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-mitico-cron-secret', (
          select valor
          from public.push_internal_config_app
          where clave = 'report_reminder_cron_secret'
        )
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 30000
    );
  $c$
);

drop trigger if exists trg_push_regla_entrenador on public.push_notificaciones_log_app;
drop function if exists public.push_regla_entrenador_app();
drop function if exists public.notificaciones_entrenadores_app(int);

notify pgrst, 'reload schema';
