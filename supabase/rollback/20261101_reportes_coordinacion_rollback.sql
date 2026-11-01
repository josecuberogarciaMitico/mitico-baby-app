-- Rollback de 20261101_reportes_coordinacion.sql (solo borra las 3 funciones nuevas;
-- los repartos o correcciones ya guardados se quedan como estén).
drop function if exists public.cambiar_responsable_reporte_app(uuid, uuid, uuid);
drop function if exists public.obtener_reportes_coordinacion_app(date, date);
drop function if exists public.editar_reporte_coordinacion_app(uuid, text, text, text, text, jsonb);
