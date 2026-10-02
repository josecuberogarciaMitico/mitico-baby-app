-- Verificación (solo lectura) tras 20261002_000002_avisos_reportes_coordinacion.sql
select
  (select count(*) from information_schema.columns where table_schema='public' and table_name='reportes'
     and column_name in ('nivel_revision','nivel_revisado_at','incidencia_revisada_at')) as columnas_nuevas,
  (select count(*) from pg_proc where proname in ('obtener_avisos_reportes_app','revisar_aviso_reporte_app')) as funciones,
  (select bool_or(has_function_privilege('anon', oid, 'execute')) from pg_proc where proname in ('obtener_avisos_reportes_app','revisar_aviso_reporte_app')) as anon_puede,
  (select bool_and(has_function_privilege('authenticated', oid, 'execute')) from pg_proc where proname in ('obtener_avisos_reportes_app','revisar_aviso_reporte_app')) as authenticated_puede;
-- Esperado: 3, 2, false, true.
