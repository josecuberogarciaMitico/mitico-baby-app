-- Verificación post-migración. Solo lectura.

select c.relname as view_name,
       has_table_privilege('anon', c.oid, 'SELECT') as anon_select,
       has_table_privilege('authenticated', c.oid, 'SELECT') as authenticated_select,
       has_table_privilege('authenticated', c.oid, 'INSERT') as authenticated_insert,
       has_table_privilege('authenticated', c.oid, 'UPDATE') as authenticated_update,
       has_table_privilege('authenticated', c.oid, 'DELETE') as authenticated_delete
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in (
'v_ocio_alumnos_v2_app','v_recuperaciones_recomendaciones_intensivo_app','v_reportes_detalle_intensivo_app','v_reportes_detalle_intensivo_recuperaciones_app','v_resumen_alumno_v2','v_resumen_final_intensivo_recuperaciones_app','v_resumen_reportes_intensivo_recuperaciones_app','v_ultima_fase_viraje_alumno_app','v_ultima_progresion_inicial_alumno_app','v_reportes_adaptativo_detalle_intensivo_app')
order by c.relname;

select c.relname as raw_view,
       has_table_privilege('anon', c.oid, 'SELECT') as anon_select,
       has_table_privilege('authenticated', c.oid, 'SELECT') as authenticated_select
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname like '%\_raw\_s1' escape E'\\'
order by c.relname;

select c.relname as table_name,
       c.relrowsecurity as rls_enabled,
       has_table_privilege('anon', c.oid, 'SELECT') as anon_select,
       has_table_privilege('authenticated', c.oid, 'SELECT') as authenticated_select
from pg_class c join pg_namespace n on n.oid=c.relnamespace
where n.nspname='public' and c.relname in ('turnos_base','temporadas','niveles','modalidades')
order by c.relname;

select
  has_function_privilege('anon','public.cambiar_entrenador_grupo_excepcional_app(uuid,uuid)','EXECUTE') as anon_cambiar_entrenador_excepcional,
  has_function_privilege('anon','public.desasignar_entrenador_grupo_app(uuid)','EXECUTE') as anon_desasignar_entrenador,
  has_function_privilege('anon','public.extraer_evaluacion_ocio_app(uuid)','EXECUTE') as anon_extraer_evaluacion_ocio,
  has_function_privilege('anon','public.obtener_evaluacion_anual_ocio_app()','EXECUTE') as anon_evaluacion_anual_ocio,
  has_function_privilege('anon','public.obtener_test_nivel_publico_app(uuid)','EXECUTE') as anon_test_publico_lectura;
