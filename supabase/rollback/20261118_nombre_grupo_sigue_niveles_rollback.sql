-- Vuelta atrás de 20261118_nombre_grupo_sigue_niveles.sql. Los nombres ya
-- actualizados se quedan como están; solo deja de actualizarlos.
drop trigger if exists trg_nombre_nivel_grupo on public.grupo_alumnos;
drop function if exists public.trg_nombre_nivel_grupo_app();
drop function if exists public.actualizar_nombre_nivel_grupo_app(uuid);
drop function if exists public.niveles_actuales_grupo_app(uuid);
notify pgrst, 'reload schema';
