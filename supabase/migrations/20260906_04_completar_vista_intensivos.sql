-- Mítico Baby App · Commit/PR 63
-- Alinea v_grupos_intensivo_dia_app con el contrato que consume el frontend:
-- añade trabajo diario y segundo entrenador, oculta grupos cancelados y limita
-- la vista a coordinación.
-- Esta migración se entrega revisable y NO se ha aplicado a producción.

begin;

set local lock_timeout = '5s';
set local statement_timeout = '60s';

create or replace view public.v_grupos_intensivo_dia_app
with (security_barrier = true)
as
with alumnos_grupo as (
  select
    ga.grupo_id,
    count(distinct ga.alumno_id) as total_alumnos,
    string_agg(
      al.nombre_completo
        || ' · Nivel: '
        || coalesce(na.codigo, ne.codigo, 'SIN NIVEL')
        || ' · Pista: '
        || coalesce(na.pista_recomendada, ne.pista_recomendada, 'Pendiente'),
      ' || '
      order by ga.orden, al.nombre_completo
    ) as alumnos_lista
  from public.grupo_alumnos ga
  join public.alumnos al on al.id = ga.alumno_id
  left join public.niveles na on na.id = al.nivel_actual_id
  left join public.niveles ne on ne.id = al.nivel_estimado_id
  group by ga.grupo_id
)
select
  idia.id as intensivo_dia_id,
  idia.intensivo_id,
  i.nombre as intensivo,
  idia.numero_dia,
  idia.fecha,
  idia.hora_inicio,
  idia.hora_fin,
  s.id as sesion_id,
  s.estado as estado_sesion,
  g.id as grupo_id,
  g.nombre_grupo,
  g.nivel_grupo,
  g.pista,
  g.punto_encuentro,
  g.estado as estado_grupo,
  g.publicado,
  g.observaciones_importantes,
  ae.entrenador_id,
  e.nombre_completo as entrenador,
  ae.estado_confirmacion,
  coalesce(ag.total_alumnos, 0::bigint) as total_alumnos,
  ag.alumnos_lista,
  nullif(btrim(tdg.trabajo_diario), '') as trabajo_diario,
  apoyo.entrenador_id as entrenador_apoyo_id,
  apoyo.entrenador as entrenador_apoyo
from public.intensivo_dias idia
join public.intensivos i on i.id = idia.intensivo_id
left join public.sesiones s on s.id = idia.sesion_id
left join public.grupos g on g.sesion_id = s.id
left join public.asignaciones_entrenadores ae on ae.grupo_id = g.id
left join public.entrenadores e on e.id = ae.entrenador_id
left join alumnos_grupo ag on ag.grupo_id = g.id
left join public.trabajo_diario_grupo tdg on tdg.grupo_id = g.id
left join lateral (
  select
    extra.entrenador_id,
    ent.nombre_completo as entrenador
  from public.grupo_entrenadores_extra_app extra
  join public.entrenadores ent on ent.id = extra.entrenador_id
  where extra.grupo_id = g.id
  order by extra.created_at, extra.id
  limit 1
) apoyo on true
where public.es_coordinacion_operativa_app()
  and (g.id is null or coalesce(g.cancelado, false) = false)
order by idia.fecha, idia.hora_inicio, g.nombre_grupo;

revoke all privileges on public.v_grupos_intensivo_dia_app
  from public, anon;
grant select on public.v_grupos_intensivo_dia_app
  to authenticated;

commit;
