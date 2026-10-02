-- Verificación (solo lectura) tras 20261002_000001_notas_habilidades.sql
select (select data_type from information_schema.columns where table_schema='public' and table_name='reportes' and column_name='notas_habilidades') as columna,
       (select count(*) from pg_proc where proname='crear_reporte_adaptativo_app') as funciones_crear,
       (select pronargs from pg_proc where proname='crear_reporte_adaptativo_app' limit 1) as argumentos_crear,
       (select pg_get_function_result(oid) like '%notas_habilidades jsonb%' from pg_proc where proname='obtener_historial_reportes_adaptativo_alumno_app') as historial_devuelve_notas,
       (select bool_or(has_function_privilege('anon', oid, 'execute')) from pg_proc where proname in ('crear_reporte_adaptativo_app','obtener_historial_reportes_adaptativo_alumno_app')) as anon_puede;
-- Esperado: jsonb, 1, 24, true, false.
