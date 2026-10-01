-- Verificación (solo lectura) tras aplicar 20261001_000001_reporte_actitud_detalle.sql
-- 1) Debe existir UNA sola función, con 23 argumentos y el último p_actitud_detalle.
select p.oid::regprocedure as firma, p.pronargs, p.pronargdefaults
from pg_proc p join pg_namespace n on n.oid = p.pronamespace
where n.nspname = 'public' and p.proname = 'crear_reporte_adaptativo_app';
-- Esperado: 1 fila, pronargs = 23, pronargdefaults = 1.

-- 2) Permisos: authenticated y service_role sí; anon no.
select has_function_privilege('anon', p.oid, 'execute') as anon,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated
from pg_proc p where p.proname = 'crear_reporte_adaptativo_app';
-- Esperado: anon = false, authenticated = true.

-- 3) Tras un reporte de prueba con «¿Algo a destacar?»:
-- select actitud, actitud_comentario from public.reportes order by updated_at desc limit 3;
-- Ej.: actitud = 'Miedo', actitud_comentario = 'Buena · Cansado'.
