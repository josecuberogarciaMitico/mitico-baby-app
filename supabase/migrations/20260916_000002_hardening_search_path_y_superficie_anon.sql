-- Aplicada en MITICO_OPERATIVA_V2 el 2026-09-16.
begin;

alter function public.trabajo_diario_automatico_operativa_app(text,text,text) set search_path = public, pg_temp;
alter function public.actualizar_alumno_intensivo_app(uuid,text,text) set search_path = public, pg_temp;
alter function public.actualizar_nivel_alumno_desde_reporte() set search_path = public, pg_temp;
alter function public.actualizar_nivel_alumno_intensivo_app(uuid,uuid,text,text) set search_path = public, pg_temp;
alter function public.actualizar_nombre_alumno_sesion_operativa_app(uuid,text) set search_path = public, pg_temp;
alter function public.actualizar_nivel_alumno_sesion_operativa_app(uuid,text,text) set search_path = public, pg_temp;
alter function public.crear_alumno_manual_operativa_app(text,text,text,text) set search_path = public, pg_temp;
alter function public."añadir_alumno_intensivo_app"(uuid,uuid) set search_path = public, pg_temp;
alter function public.recomendar_grupos_intensivo_dia_app(uuid) set search_path = public, pg_temp;
alter function public.normalizar_nombre_app(text) set search_path = public, pg_temp;
alter function public.preparar_sesion_intensivo_dia_app(uuid) set search_path = public, pg_temp;
alter function public.recomendar_grupos_sesion_operativa_app(uuid) set search_path = public, pg_temp;

revoke all on table public.alumno_temporada_app from public, anon;
revoke all on table public.reporte_fase_viraje_app from public, anon;
revoke all on table public.reporte_progresion_inicial_app from public, anon;
revoke all on table public.whatsapp_grupos_app from public, anon;

revoke execute on function public.secretaria_coordinacion_timestamps_app() from public, anon, authenticated;
revoke execute on function public.actualizar_nivel_alumno_desde_reporte() from public, anon, authenticated;
grant execute on function public.secretaria_coordinacion_timestamps_app() to service_role;
grant execute on function public.actualizar_nivel_alumno_desde_reporte() to service_role;

commit;
