-- Rollback de 20261026_paco_notas.sql (borra también las notas guardadas).
drop function if exists public.notas_paco_sesion_app(uuid);
drop function if exists public.notas_paco_alumnos_app(uuid[]);
drop function if exists public.cerrar_nota_paco_app(uuid);
drop function if exists public.guardar_nota_paco_app(uuid, text, uuid, boolean);
drop table if exists public.paco_notas;
