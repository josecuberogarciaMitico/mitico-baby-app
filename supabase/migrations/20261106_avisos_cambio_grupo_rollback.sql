-- Rollback de 20261106_avisos_cambio_grupo.sql
drop trigger if exists trg_aviso_cambio_alumnos on public.grupo_alumnos;
drop trigger if exists trg_aviso_cambio_principal on public.asignaciones_entrenadores;
drop trigger if exists trg_aviso_cambio_extra on public.grupo_entrenadores_extra_app;
drop trigger if exists trg_aviso_cambio_grupo on public.grupos;
drop function if exists public.trg_aviso_cambio_alumnos_app();
drop function if exists public.trg_aviso_cambio_entrenador_app();
drop function if exists public.trg_aviso_cambio_grupo_datos_app();
drop function if exists public.avisos_cambio_grupo_pendientes_app();
drop function if exists public.marcar_avisos_cambio_grupo_vistos_app(timestamptz);
drop function if exists public.mis_avisos_cambio_grupo_app();
drop function if exists public.resumen_avisos_cambio_grupo_app(uuid);
drop function if exists public.registrar_aviso_cambio_grupo_app(uuid, text, uuid, text, uuid);
drop table if exists public.avisos_cambio_grupo_app;
