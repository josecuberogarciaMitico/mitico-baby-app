-- Mítico Baby App · Commit/PR 63
-- Evita que un entrenador consulte grupos, alumnos o reportes de otro entrenador
-- llamando directamente a las vistas desde la Data API.
-- Esta migración se entrega revisable y NO se ha aplicado a producción.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

create or replace view public.v_grupos_entrenador_app_dos_entrenadores
with (security_barrier = true)
as
select scoped.*
from (
  select
    base.entrenador_id,
    base.entrenador,
    base.estado_confirmacion,
    base.confirmado_at,
    base.grupo_id,
    base.nombre_grupo,
    base.nivel_grupo,
    base.pista,
    base.punto_encuentro,
    base.estado_grupo,
    base.publicado,
    base.fecha,
    base.hora_inicio,
    base.hora_fin,
    base.modalidad,
    base.tipo_sesion,
    base.lugar,
    base.alumnos,
    base.total_alumnos,
    base.trabajo_diario,
    base.observaciones_importantes
  from public.v_grupos_entrenador_app_v2 base

  union all

  select distinct on (base.grupo_id, extra.entrenador_id)
    extra.entrenador_id,
    ent.nombre_completo as entrenador,
    extra.estado_confirmacion,
    extra.confirmado_at,
    base.grupo_id,
    base.nombre_grupo,
    base.nivel_grupo,
    base.pista,
    base.punto_encuentro,
    base.estado_grupo,
    base.publicado,
    base.fecha,
    base.hora_inicio,
    base.hora_fin,
    base.modalidad,
    base.tipo_sesion,
    base.lugar,
    base.alumnos,
    base.total_alumnos,
    base.trabajo_diario,
    base.observaciones_importantes
  from public.v_grupos_entrenador_app_v2 base
  join public.grupo_entrenadores_extra_app extra
    on extra.grupo_id = base.grupo_id
  join public.entrenadores ent
    on ent.id = extra.entrenador_id
) scoped
where public.es_coordinacion_operativa_app()
   or scoped.entrenador_id = public.entrenador_actual_app();

create or replace view public.v_alumnos_reporte_entrenador_app_dos_entrenadores
with (security_barrier = true)
as
select scoped.*
from (
  select
    base.entrenador_id,
    base.entrenador,
    base.grupo_id,
    base.nombre_grupo,
    base.publicado,
    base.fecha,
    base.hora_inicio,
    base.hora_fin,
    base.modalidad,
    base.alumno_id,
    base.alumno,
    base.estado_asistencia,
    base.reporte_id,
    base.enviado_at,
    base.estado_reporte,
    base.nivel_alumno,
    base.fuente_nivel,
    base.pista_alumno
  from public.v_alumnos_reporte_entrenador_app base
  where not exists (
    select 1
    from public.grupo_reporte_responsable_app resp
    where resp.grupo_id = base.grupo_id
  )

  union all

  select
    resp.entrenador_id,
    ent.nombre_completo as entrenador,
    base.grupo_id,
    base.nombre_grupo,
    base.publicado,
    base.fecha,
    base.hora_inicio,
    base.hora_fin,
    base.modalidad,
    base.alumno_id,
    base.alumno,
    base.estado_asistencia,
    base.reporte_id,
    base.enviado_at,
    base.estado_reporte,
    base.nivel_alumno,
    base.fuente_nivel,
    base.pista_alumno
  from public.v_alumnos_reporte_entrenador_app base
  join public.grupo_reporte_responsable_app resp
    on resp.grupo_id = base.grupo_id
   and resp.alumno_id = base.alumno_id
  join public.entrenadores ent
    on ent.id = resp.entrenador_id
) scoped
where public.es_coordinacion_operativa_app()
   or scoped.entrenador_id = public.entrenador_actual_app();

create or replace view public.v_reportes_pendientes_entrenador_dos_entrenadores
with (security_barrier = true)
as
select scoped.*
from (
  select
    base.entrenador_id,
    base.entrenador,
    base.fecha,
    base.hora_inicio,
    base.hora_fin,
    base.modalidad,
    base.grupo_id,
    base.nombre_grupo,
    base.alumno_id,
    base.alumno,
    base.estado_asistencia,
    base.estado_reporte,
    base.nivel_alumno,
    base.fuente_nivel,
    base.pista_alumno
  from public.v_reportes_pendientes_entrenador base
  where not exists (
    select 1
    from public.grupo_reporte_responsable_app resp
    where resp.grupo_id = base.grupo_id
  )

  union all

  select
    resp.entrenador_id,
    ent.nombre_completo as entrenador,
    base.fecha,
    base.hora_inicio,
    base.hora_fin,
    base.modalidad,
    base.grupo_id,
    base.nombre_grupo,
    base.alumno_id,
    base.alumno,
    base.estado_asistencia,
    base.estado_reporte,
    base.nivel_alumno,
    base.fuente_nivel,
    base.pista_alumno
  from public.v_reportes_pendientes_entrenador base
  join public.grupo_reporte_responsable_app resp
    on resp.grupo_id = base.grupo_id
   and resp.alumno_id = base.alumno_id
  join public.entrenadores ent
    on ent.id = resp.entrenador_id
) scoped
where public.es_coordinacion_operativa_app()
   or scoped.entrenador_id = public.entrenador_actual_app();

revoke all privileges on public.v_grupos_entrenador_app_dos_entrenadores
  from public, anon;
revoke all privileges on public.v_alumnos_reporte_entrenador_app_dos_entrenadores
  from public, anon;
revoke all privileges on public.v_reportes_pendientes_entrenador_dos_entrenadores
  from public, anon;

grant select on public.v_grupos_entrenador_app_dos_entrenadores
  to authenticated;
grant select on public.v_alumnos_reporte_entrenador_app_dos_entrenadores
  to authenticated;
grant select on public.v_reportes_pendientes_entrenador_dos_entrenadores
  to authenticated;

commit;
