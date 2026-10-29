-- 20261029 · Paco persigue por Jose: dos tipos nuevos de aviso a entrenadores
--
-- mitico-paco-avisos (tick cada 5 min) manda ahora:
--   CONFIRMAR_GRUPO_RECORDATORIO  · grupo publicado sin confirmar a <24 h de empezar
--   DISPONIBILIDAD_RECORDATORIO   · disponibilidad sin contestar a <24 h del límite
-- (el segundo aviso de reportes usa el tipo REPORTES_PENDIENTES, que ya existía).
-- Solo se amplía la lista permitida; no cambia ningún dato.
--
-- Rollback: supabase/rollback/20261029_push_tipos_recordatorios_paco_rollback.sql

alter table public.push_notificaciones_log_app
  drop constraint if exists push_notificaciones_log_app_tipo_check;
alter table public.push_notificaciones_log_app
  add constraint push_notificaciones_log_app_tipo_check check (tipo = any (array[
    'DISPONIBILIDAD_ABIERTA', 'DISPONIBILIDAD_RECIBIDA', 'GRUPOS_DISPONIBLES',
    'ORGANIZACION_SEMANAL_CERRADA_CON_GRUPOS', 'ORGANIZACION_SEMANAL_CERRADA_SIN_GRUPOS',
    'REPORTES_PENDIENTES', 'GRUPO_REASIGNADO_NUEVO', 'GRUPO_REASIGNADO_RETIRADO',
    'GRUPO_CAMBIADO_RECONFIRMAR', 'CONFIRMAR_GRUPO_RECORDATORIO', 'DISPONIBILIDAD_RECORDATORIO'
  ]::text[]));
