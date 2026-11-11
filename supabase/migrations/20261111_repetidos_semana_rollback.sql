-- Deshace 20261111_repetidos_semana.sql
drop function if exists public.dejar_repetido_semana_app(uuid, date);
drop function if exists public.repetidos_semana_app(date, date);
drop table if exists public.repetidos_semana_ignorados_app;
