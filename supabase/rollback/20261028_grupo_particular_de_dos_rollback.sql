-- Rollback de 20261028_grupo_particular_de_dos.sql
-- Los grupos ya marcados conservan su nombre «PARTICULAR · …» (no se tocan datos).
drop function if exists public.marcar_grupo_particular_app(uuid, boolean);
