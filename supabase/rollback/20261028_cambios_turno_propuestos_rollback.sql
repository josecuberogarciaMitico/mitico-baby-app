-- Rollback de 20261028_cambios_turno_propuestos.sql
-- Borra la tabla de propuestas de cambio de turno (y su historial) y sus funciones.
drop function if exists public.registrar_propuesta_cambio_turno_app(uuid, uuid, uuid, jsonb, text, text);
drop function if exists public.responder_propuesta_cambio_turno_app(uuid, text, jsonb);
drop table if exists public.cambios_turno_propuestos_app;
drop function if exists public.cambios_turno_propuestos_app_touch();
