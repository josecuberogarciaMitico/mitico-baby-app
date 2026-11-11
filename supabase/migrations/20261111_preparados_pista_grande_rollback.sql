-- Deshace 20261111_preparados_pista_grande.sql
drop function if exists public.preparados_pista_grande_app();
drop function if exists public.marcar_prueba_pista_grande_app(uuid, uuid, text);
drop table if exists public.prueba_pista_grande_app;
