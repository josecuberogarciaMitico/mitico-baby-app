-- Verificación (solo lectura) tras 20261001_000002_historial_actitud_comentario.sql
select p.oid::regprocedure, pg_get_function_result(p.oid) like '%actitud_comentario text%' as devuelve_detalle,
       has_function_privilege('anon', p.oid, 'execute') as anon,
       has_function_privilege('authenticated', p.oid, 'execute') as authenticated
from pg_proc p where p.proname = 'obtener_historial_reportes_adaptativo_alumno_app';
-- Esperado: 1 fila, devuelve_detalle = true, anon = false, authenticated = true.
