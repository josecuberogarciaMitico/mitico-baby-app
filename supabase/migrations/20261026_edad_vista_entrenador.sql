-- ---------------------------------------------------------------------------
-- 20261026 · Edad del niño en la vista de entrenador (grupos y reportes)
--
-- Los entrenadores leen sus niños de v_alumnos_reporte_entrenador_app_dos_entrenadores
-- (no pueden leer la tabla alumnos). Se añade AL FINAL una columna `edad`
-- (años cumplidos, número entero). NO se expone la fecha de nacimiento.
-- Mismo filtro de seguridad que antes (cada entrenador solo ve sus grupos).
-- La vista sigue siendo del propietario (sin security_invoker), igual que ahora.
--
-- Rollback: supabase/rollback/20261026_edad_vista_entrenador_rollback.sql
-- ---------------------------------------------------------------------------
create or replace view public.v_alumnos_reporte_entrenador_app_dos_entrenadores
with (security_barrier = true) as
 SELECT entrenador_id,
    entrenador,
    grupo_id,
    nombre_grupo,
    publicado,
    fecha,
    hora_inicio,
    hora_fin,
    modalidad,
    alumno_id,
    alumno,
    estado_asistencia,
    reporte_id,
    enviado_at,
    estado_reporte,
    nivel_alumno,
    fuente_nivel,
    pista_alumno,
    ( SELECT date_part('year', age(raw.fecha, a.fecha_nacimiento))::integer
        FROM alumnos a
       WHERE a.id = raw.alumno_id AND a.fecha_nacimiento IS NOT NULL) AS edad
   FROM v_alumnos_reporte_entrenador_app_dos_entrenadores_raw_s2 raw
  WHERE ((CURRENT_USER = 'service_role'::name) OR es_gestion_altas_app() OR (entrenador_id = entrenador_actual_app()) OR (EXISTS ( SELECT 1
           FROM asignaciones_entrenadores ae
          WHERE ((ae.grupo_id = raw.grupo_id) AND (ae.entrenador_id = entrenador_actual_app())))) OR (EXISTS ( SELECT 1
           FROM grupo_entrenadores_extra_app ge
          WHERE ((ge.grupo_id = raw.grupo_id) AND (ge.entrenador_id = entrenador_actual_app())))));
