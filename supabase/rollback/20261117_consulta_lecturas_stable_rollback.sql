-- Vuelta atrás de 20261117_consulta_lecturas_stable.sql
alter function public.obtener_alumnos_baby_fichas_app() volatile;
alter function public.obtener_perfil_operativo_alumnos_app() volatile;
alter function public.obtener_tendencia_ritmo_alumnos_app() volatile;
alter function public.obtener_contexto_tecnico_reportes_app() volatile;
alter function public.obtener_estado_avisos_entrenadores_app() volatile;
alter function public.obtener_historial_reportes_adaptativo_alumno_app(uuid) volatile;
alter function public.comprobar_posibles_alumnos_nueva_alta_app(text, date) volatile;
alter function public.recomendar_grupos_sesion_operativa_app(uuid) volatile;
alter function public.recomendar_grupos_intensivo_dia_app(uuid) volatile;
alter function public.obtener_grupos_intensivo_dia_editables_app(uuid) volatile;
