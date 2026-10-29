-- Rollback de 20261029_push_tipo_reconfirmar.sql (falla si ya hay filas GRUPO_CAMBIADO_RECONFIRMAR)
alter table public.push_notificaciones_log_app
  drop constraint if exists push_notificaciones_log_app_tipo_check;
alter table public.push_notificaciones_log_app
  add constraint push_notificaciones_log_app_tipo_check check (tipo = any (array[
    'DISPONIBILIDAD_ABIERTA', 'DISPONIBILIDAD_RECIBIDA', 'GRUPOS_DISPONIBLES',
    'ORGANIZACION_SEMANAL_CERRADA_CON_GRUPOS', 'ORGANIZACION_SEMANAL_CERRADA_SIN_GRUPOS',
    'REPORTES_PENDIENTES', 'GRUPO_REASIGNADO_NUEVO', 'GRUPO_REASIGNADO_RETIRADO'
  ]::text[]));
