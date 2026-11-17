-- 17/11/2026 · Regla de notificaciones a entrenadores (aprobada por Jose).
--
-- Antes había tres sistemas mandando avisos cada uno por su lado (la app con
-- mitico-push, el proceso horario mitico-report-reminders y Paco), con hasta
-- 6 avisos el mismo día a un entrenador. Regla nueva:
--   1. Recordatorios: UNO al día como máximo, a las 10:00, que lo junta todo
--      (mitico-recordatorio-diario). Si ese día ya le ha llegado otro aviso,
--      no se manda.
--   2. Recordatorios solo de 10:00 a 21:00.
--   3. Reportes: aviso al día siguiente y a las 48 h (dentro del recordatorio).
--   4. Disponibilidad: el aviso al publicarla (acción de Jose) y el recordatorio
--      si cierra hoy o mañana, solo a quien le falta.
--   5. «Disponibilidad recibida» ya no se manda.
--   6. Jose puede ver lo que ha recibido cada uno (notificaciones_entrenadores_app).
-- Los avisos que salen de una acción de Jose (publicar disponibilidad, cerrar la
-- semana, grupo nuevo, cambiado o retirado) y los recordatorios que manda él a
-- mano siguen saliendo como siempre.
--
-- Cómo se aplica a todos los sistemas a la vez: un disparador en
-- push_notificaciones_log_app. Todos reservan ahí el aviso antes de mandarlo y,
-- si la reserva falla con el código 23505 («ya existe»), no lo mandan. La regla
-- usa ese mismo código para frenar lo que no debe salir, sin tocar su código.

-- Nuevo tipo de aviso.
alter table public.push_notificaciones_log_app drop constraint if exists push_notificaciones_log_app_tipo_check;
alter table public.push_notificaciones_log_app add constraint push_notificaciones_log_app_tipo_check
  check (tipo = any (array[
    'DISPONIBILIDAD_ABIERTA', 'DISPONIBILIDAD_RECIBIDA', 'GRUPOS_DISPONIBLES',
    'ORGANIZACION_SEMANAL_CERRADA_CON_GRUPOS', 'ORGANIZACION_SEMANAL_CERRADA_SIN_GRUPOS',
    'REPORTES_PENDIENTES', 'GRUPO_REASIGNADO_NUEVO', 'GRUPO_REASIGNADO_RETIRADO',
    'GRUPO_CAMBIADO_RECONFIRMAR', 'CONFIRMAR_GRUPO_RECORDATORIO', 'DISPONIBILIDAD_RECORDATORIO',
    'RECORDATORIO_DIARIO'
  ]::text[]));

create or replace function public.push_regla_entrenador_app()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_ahora timestamp := now() at time zone 'Europe/Madrid';
  v_hora int := extract(hour from v_ahora)::int;
begin
  if new.entrenador_id is null then
    return new;
  end if;

  -- 5 · «Disponibilidad recibida» ya no se manda.
  if new.tipo = 'DISPONIBILIDAD_RECIBIDA' then
    raise exception using errcode = '23505',
      message = 'Regla de notificaciones: «Disponibilidad recibida» ya no se envía.';
  end if;

  -- 1/3/4 · Los recordatorios sueltos automáticos los sustituye el recordatorio
  -- diario. Los que manda coordinación a mano (envio_manual) sí salen.
  if new.tipo in ('REPORTES_PENDIENTES', 'DISPONIBILIDAD_RECORDATORIO', 'CONFIRMAR_GRUPO_RECORDATORIO')
     and coalesce(new.metadata ->> 'envio_manual', 'false') <> 'true' then
    raise exception using errcode = '23505',
      message = 'Regla de notificaciones: sustituido por el recordatorio diario.';
  end if;

  -- 1/2 · El recordatorio diario: de 10:00 a 21:00 y solo si hoy no le ha llegado nada.
  if new.tipo = 'RECORDATORIO_DIARIO' then
    if v_hora < 10 or v_hora >= 21 then
      raise exception using errcode = '23505',
        message = 'Regla de notificaciones: fuera del horario 10:00–21:00.';
    end if;
    if exists (
      select 1 from public.push_notificaciones_log_app l
      where l.entrenador_id = new.entrenador_id
        and l.estado in ('reservada', 'enviada')
        and (l.created_at at time zone 'Europe/Madrid')::date = v_ahora::date
    ) then
      raise exception using errcode = '23505',
        message = 'Regla de notificaciones: hoy ya ha recibido un aviso.';
    end if;
  end if;

  return new;
end;
$$;

drop trigger if exists trg_push_regla_entrenador on public.push_notificaciones_log_app;
create trigger trg_push_regla_entrenador
  before insert on public.push_notificaciones_log_app
  for each row execute function public.push_regla_entrenador_app();

-- 6 · Lo que ha recibido cada entrenador (para coordinación).
create or replace function public.notificaciones_entrenadores_app(p_dias int default 7)
returns table (
  creada timestamptz, entrenador_id uuid, entrenador text, tipo text, titulo text, cuerpo text, estado text
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not coalesce(public.es_coordinacion_operativa_app(), false) then
    raise exception 'No tienes permiso.';
  end if;
  return query
  select l.created_at, l.entrenador_id, e.nombre_completo::text, l.tipo, l.titulo, l.cuerpo, l.estado
  from public.push_notificaciones_log_app l
  left join public.entrenadores e on e.id = l.entrenador_id
  where l.created_at > now() - make_interval(days => least(greatest(coalesce(p_dias, 7), 1), 31))
  order by l.created_at desc;
end;
$$;

revoke all on function public.notificaciones_entrenadores_app(int) from public, anon;
grant execute on function public.notificaciones_entrenadores_app(int) to authenticated;

-- Procesos automáticos: el horario de reportes se apaga (su botón manual sigue
-- funcionando) y entra el recordatorio diario (la función solo actúa a las 10 h).
select cron.unschedule('mitico_report_reminders_hourly')
where exists (select 1 from cron.job where jobname = 'mitico_report_reminders_hourly');

select cron.schedule(
  'mitico_recordatorio_diario',
  '5 * * * *',
  $c$
    select net.http_post(
      url := 'https://natxwawulodkoauqkwqz.supabase.co/functions/v1/mitico-recordatorio-diario',
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'x-mitico-cron-secret', (select valor from public.push_internal_config_app where clave = 'report_reminder_cron_secret')
      ),
      body := '{}'::jsonb,
      timeout_milliseconds := 30000
    );
  $c$
);

notify pgrst, 'reload schema';
