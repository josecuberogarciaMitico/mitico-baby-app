-- Rollback de 20261026_edad_vista_entrenador.sql: la columna `edad` no se
-- puede quitar con CREATE OR REPLACE VIEW. Hay que recrear la vista sin ella
-- conservando los permisos (authenticated: SELECT; service_role: todo).
begin;
drop view public.v_alumnos_reporte_entrenador_app_dos_entrenadores;
create view public.v_alumnos_reporte_entrenador_app_dos_entrenadores
with (security_barrier = true) as
 SELECT entrenador_id, entrenador, grupo_id, nombre_grupo, publicado, fecha, hora_inicio, hora_fin,
    modalidad, alumno_id, alumno, estado_asistencia, reporte_id, enviado_at, estado_reporte,
    nivel_alumno, fuente_nivel, pista_alumno
   FROM v_alumnos_reporte_entrenador_app_dos_entrenadores_raw_s2 raw
  WHERE ((CURRENT_USER = 'service_role'::name) OR es_gestion_altas_app() OR (entrenador_id = entrenador_actual_app()) OR (EXISTS ( SELECT 1
           FROM asignaciones_entrenadores ae
          WHERE ((ae.grupo_id = raw.grupo_id) AND (ae.entrenador_id = entrenador_actual_app())))) OR (EXISTS ( SELECT 1
           FROM grupo_entrenadores_extra_app ge
          WHERE ((ge.grupo_id = raw.grupo_id) AND (ge.entrenador_id = entrenador_actual_app())))));
revoke all on public.v_alumnos_reporte_entrenador_app_dos_entrenadores from public, anon;
grant select on public.v_alumnos_reporte_entrenador_app_dos_entrenadores to authenticated;
grant all on public.v_alumnos_reporte_entrenador_app_dos_entrenadores to service_role;
commit;
