-- Vuelta atrás de 20261117_reportes_devolver_y_calidad.sql
-- (las columnas se quitan al final: se pierde qué reportes estaban devueltos).
drop function if exists public.calidad_reportes_equipo_app();
drop function if exists public.completar_reporte_devuelto_app(uuid, jsonb, text);
drop function if exists public.mis_reportes_devueltos_app();
drop function if exists public.reportes_devueltos_app(date);
drop function if exists public.devolver_reporte_app(uuid, text, boolean);
drop function if exists public.nota_suficiente_app(text);
alter table public.reportes
  drop column if exists completado_devolucion_at,
  drop column if exists devuelto_por,
  drop column if exists devuelto_motivo,
  drop column if exists devuelto_at;
