-- 20261027 (2) · «Solo consulta» también ve Dirección completa (sin cambiar nada)
--
-- Las pantallas de Dirección (Informes y listados, Temporadas, Análisis,
-- WhatsApp) leen con funciones que eran VOLATILE: PostgREST las ejecuta en
-- transacción de ESCRITURA y ahí el rol 'consulta' no pasa. Estas funciones
-- solo leen (comprobado: sin insert/update/delete y solo llaman a otras de esta
-- lista o a los permisos), así que se marcan STABLE → PostgREST las ejecuta en
-- transacción READ ONLY (para el jefe también; no cambia lo que devuelven).
-- Las que eran solo del jefe aceptan además es_consulta_lectura_app().
--
-- NO se toca es_coordinador_jefe_app(): Secretaría/Paco y todas las acciones
-- de Dirección (tarifas, cierres, temporadas, backups, WhatsApp) siguen solo
-- para el jefe.
-- Rollback: supabase/rollback/20261027_usuario_solo_consulta_direccion_rollback.sql

do $$
declare
  f text;
  def text;
  solo_jefe text[] := array[
    'obtener_informe_snowzone_app',
    'obtener_listado_alumnos_temporada_app',
    'obtener_resumen_cierre_temporada_app',
    'obtener_cierre_temporada_alumnos_app',
    'obtener_cortes_evaluacion_ocio_app',
    'obtener_evaluacion_anual_ocio_app',
    'obtener_candidatos_equipo_baby_app',
    'obtener_backup_semanal_app'
  ];
  todas text[] := solo_jefe || array[
    'obtener_analisis_admin_app',
    'obtener_analisis_admin_live_app',
    'obtener_coincidencias_alta_nivel_inicial_app',
    'obtener_cierre_temporada_alumnos_v2_app'
  ];
  r record;
begin
  foreach f in array solo_jefe loop
    for r in select p.oid from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = f loop
      def := pg_get_functiondef(r.oid);
      if def !~ 'es_consulta_lectura_app' then
        def := replace(def, 'public.es_coordinador_jefe_app()',
                       '(public.es_coordinador_jefe_app() or public.es_consulta_lectura_app())');
        execute def;
      end if;
    end loop;
  end loop;

  foreach f in array todas loop
    for r in select p.oid::regprocedure as firma from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = f loop
      execute format('alter function %s stable', r.firma);
    end loop;
  end loop;
end $$;
