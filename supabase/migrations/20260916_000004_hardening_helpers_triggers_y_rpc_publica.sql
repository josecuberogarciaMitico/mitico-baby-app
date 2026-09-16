-- Aplicada en MITICO_OPERATIVA_V2 el 2026-09-16.
-- Reduce la superficie RPC pública y evita invocación directa de helpers/trigger functions.
begin;

revoke execute on function public.evaluar_test_nivel_inicial_app(text,text,text,text,text,text,text,text) from public, anon;
grant execute on function public.evaluar_test_nivel_inicial_app(text,text,text,text,text,text,text,text) to authenticated, service_role;

revoke execute on function public.asegurar_ratio_publicado_grupo_app(uuid) from public, anon, authenticated;
revoke execute on function public.asegurar_trabajo_publicado_grupo_app(uuid) from public, anon, authenticated;
grant execute on function public.asegurar_ratio_publicado_grupo_app(uuid) to service_role;
grant execute on function public.asegurar_trabajo_publicado_grupo_app(uuid) to service_role;

revoke execute on function public.crear_grupo_intensivo_dia_app(uuid,text,text,text,text,text,uuid,uuid[],boolean) from public, anon, authenticated;
grant execute on function public.crear_grupo_intensivo_dia_app(uuid,text,text,text,text,text,uuid,uuid[],boolean) to service_role;

revoke execute on function public.activar_alumno_temporada_desde_alta_test_app() from public, anon, authenticated;
revoke execute on function public.activar_alumno_temporada_intensivo_app() from public, anon, authenticated;
revoke execute on function public.activar_alumno_temporada_ocio_app() from public, anon, authenticated;
revoke execute on function public.sync_sesion_alumno_intensivo_desde_grupo_app() from public, anon, authenticated;
revoke execute on function public.trg_cerrar_recuperacion_desde_grupo_alumnos_app() from public, anon, authenticated;
revoke execute on function public.trg_cerrar_recuperacion_desde_reporte_app() from public, anon, authenticated;
revoke execute on function public.trg_recalcular_ratio_grupo_operativa_app() from public, anon, authenticated;
revoke execute on function public.trg_validar_ratio_apoyo_publicado_app() from public, anon, authenticated;
revoke execute on function public.trg_validar_trabajo_publicado_app() from public, anon, authenticated;
revoke execute on function public.validar_alumno_unico_por_sesion_app() from public, anon, authenticated;

grant execute on function public.activar_alumno_temporada_desde_alta_test_app() to service_role;
grant execute on function public.activar_alumno_temporada_intensivo_app() to service_role;
grant execute on function public.activar_alumno_temporada_ocio_app() to service_role;
grant execute on function public.sync_sesion_alumno_intensivo_desde_grupo_app() to service_role;
grant execute on function public.trg_cerrar_recuperacion_desde_grupo_alumnos_app() to service_role;
grant execute on function public.trg_cerrar_recuperacion_desde_reporte_app() to service_role;
grant execute on function public.trg_recalcular_ratio_grupo_operativa_app() to service_role;
grant execute on function public.trg_validar_ratio_apoyo_publicado_app() to service_role;
grant execute on function public.trg_validar_trabajo_publicado_app() to service_role;
grant execute on function public.validar_alumno_unico_por_sesion_app() to service_role;

commit;
