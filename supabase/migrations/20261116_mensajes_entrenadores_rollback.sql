-- Deshace 20261116_mensajes_entrenadores.sql (borra los mensajes enviados).
-- Los repartos de reportes ya hechos se quedan en grupo_reporte_responsable_app.
drop function if exists public.mensajes_enviados_entrenadores_app(int);
drop function if exists public.responder_reparto_reportes_app(uuid, uuid[]);
drop function if exists public.marcar_mensaje_leido_app(uuid);
drop function if exists public.mis_mensajes_entrenador_app();
drop function if exists public.reparto_mensaje_json_app(uuid);
drop function if exists public.enviar_reparto_reportes_app(uuid);
drop function if exists public.enviar_mensaje_entrenadores_app(uuid[], text, text);
drop function if exists public.entrenadores_grupo_mensaje_app(uuid);
drop table if exists public.mensajes_entrenador_destino_app;
drop table if exists public.mensajes_entrenador_app;
