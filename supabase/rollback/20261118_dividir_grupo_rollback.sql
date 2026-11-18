-- Vuelta atrás de 20261118_dividir_grupo.sql (los grupos ya divididos se quedan como están).
drop function if exists public.dividir_grupo_sesion_operativa_app(uuid, uuid[], text, text, text);
notify pgrst, 'reload schema';
