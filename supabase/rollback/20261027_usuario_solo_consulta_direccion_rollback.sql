-- Rollback de 20261027_usuario_solo_consulta_direccion.sql
do $$
declare
  f text;
  def text;
  r record;
  solo_jefe text[] := array[
    'obtener_informe_snowzone_app','obtener_listado_alumnos_temporada_app','obtener_resumen_cierre_temporada_app',
    'obtener_cierre_temporada_alumnos_app','obtener_cortes_evaluacion_ocio_app','obtener_evaluacion_anual_ocio_app',
    'obtener_candidatos_equipo_baby_app','obtener_backup_semanal_app'];
  todas text[] := solo_jefe || array['obtener_analisis_admin_app','obtener_analisis_admin_live_app',
    'obtener_coincidencias_alta_nivel_inicial_app','obtener_cierre_temporada_alumnos_v2_app'];
begin
  foreach f in array solo_jefe loop
    for r in select p.oid from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname=f loop
      def := replace(pg_get_functiondef(r.oid),
        '(public.es_coordinador_jefe_app() OR public.es_consulta_lectura_app())', 'public.es_coordinador_jefe_app()');
      def := replace(def,
        '(public.es_coordinador_jefe_app() or public.es_consulta_lectura_app())', 'public.es_coordinador_jefe_app()');
      execute def;
    end loop;
  end loop;
  foreach f in array todas loop
    for r in select p.oid::regprocedure as firma from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname=f loop
      execute format('alter function %s volatile', r.firma);
    end loop;
  end loop;
end $$;
