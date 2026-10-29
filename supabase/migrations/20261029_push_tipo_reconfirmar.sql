-- 20261029 · Avisos a entrenadores: admitir el tipo GRUPO_CAMBIADO_RECONFIRMAR
--
-- El botón «Avisar cambios y pedir reconfirmación» manda un push de tipo
-- GRUPO_CAMBIADO_RECONFIRMAR (mitico-push, acción group_changed), pero ese tipo
-- no estaba en la lista permitida de push_notificaciones_log_app: la base de
-- datos lo rechazaba y el aviso nunca salía. Solo se amplía la lista.
--
-- Rollback: supabase/rollback/20261029_push_tipo_reconfirmar_rollback.sql

alter table public.push_notificaciones_log_app
  drop constraint if exists push_notificaciones_log_app_tipo_check;
alter table public.push_notificaciones_log_app
  add constraint push_notificaciones_log_app_tipo_check check (tipo = any (array[
    'DISPONIBILIDAD_ABIERTA', 'DISPONIBILIDAD_RECIBIDA', 'GRUPOS_DISPONIBLES',
    'ORGANIZACION_SEMANAL_CERRADA_CON_GRUPOS', 'ORGANIZACION_SEMANAL_CERRADA_SIN_GRUPOS',
    'REPORTES_PENDIENTES', 'GRUPO_REASIGNADO_NUEVO', 'GRUPO_REASIGNADO_RETIRADO',
    'GRUPO_CAMBIADO_RECONFIRMAR'
  ]::text[]));
