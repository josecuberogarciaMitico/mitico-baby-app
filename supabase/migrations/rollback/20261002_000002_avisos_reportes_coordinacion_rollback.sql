-- Rollback de 20261002_000002_avisos_reportes_coordinacion.sql
-- Quita las dos funciones de avisos. Las 3 columnas de revisión NO se borran
-- (no molestan a nada); si se quieren quitar, ejecutar aparte la línea comentada.
-- Antes, volver a la app anterior (la nueva llama a estas funciones).
begin;
drop function if exists public.obtener_avisos_reportes_app();
drop function if exists public.revisar_aviso_reporte_app(uuid, text, text);
notify pgrst, 'reload schema';
commit;
-- alter table public.reportes drop constraint if exists reportes_nivel_revision_check, drop column if exists nivel_revision, drop column if exists nivel_revisado_at, drop column if exists incidencia_revisada_at;
