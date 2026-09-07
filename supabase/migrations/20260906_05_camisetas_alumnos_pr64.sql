-- Mítico Baby App · PR 64
-- Versiona el contrato de camisetas que ya existe en Supabase y que consume
-- el App.tsx definitivo. La vista queda limitada a coordinación.
-- Esta migración se entrega revisable y NO se ha aplicado a producción.

begin;

alter table public.alumnos
  add column if not exists camiseta_entregada boolean not null default false;

alter table public.alumnos
  add column if not exists camiseta_entregada_at timestamp with time zone;

create or replace function public.actualizar_camiseta_alumno_app(
  p_alumno_id uuid,
  p_entregada boolean
)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso para actualizar la camiseta del alumno.';
  end if;

  if p_alumno_id is null then
    raise exception 'Falta alumno.';
  end if;

  update public.alumnos
  set camiseta_entregada = coalesce(p_entregada, false),
      camiseta_entregada_at = case
        when coalesce(p_entregada, false) then now()
        else null
      end
  where id = p_alumno_id;

  if not found then
    raise exception 'No existe el alumno.';
  end if;
end;
$function$;

revoke all on function public.actualizar_camiseta_alumno_app(uuid, boolean)
  from public, anon;
grant execute on function public.actualizar_camiseta_alumno_app(uuid, boolean)
  to authenticated, service_role;

create or replace view public.v_resumen_alumno_v2
with (security_barrier = true)
as
with conteos as (
  select
    r.alumno_id,
    count(*)::integer as total_reportes,
    count(distinct r.fecha)::integer as total_entrenamientos_realizados
  from public.reportes r
  group by r.alumno_id
),
ultimo_reporte as (
  select distinct on (r.alumno_id)
    r.alumno_id,
    r.fecha as ultima_fecha_reporte,
    r.modalidad_id,
    r.nivel_id,
    r.actitud as ultima_actitud,
    r.tecnica as ultima_tecnica,
    r.pista as ultima_pista,
    r.remontes as ultimos_remontes,
    r.autonomia as ultima_autonomia,
    r.incidencia as ultima_incidencia,
    r.recomendacion_proxima_sesion as ultima_recomendacion,
    coalesce(
      r.tecnica_comentario,
      r.actitud_comentario,
      r.recomendacion_comentario,
      '-'
    ) as ultimo_reporte
  from public.reportes r
  order by
    r.alumno_id,
    r.fecha desc,
    r.enviado_at desc nulls last,
    r.created_at desc nulls last
)
select
  al.id as alumno_id,
  al.nombre_completo as alumno,
  na.codigo as nivel_actual,
  ne.codigo as nivel_estimado,
  al.origen_nivel_estimado,
  al.estado_ficha,
  coalesce(c.total_reportes, 0) as total_reportes,
  coalesce(c.total_entrenamientos_realizados, 0) as total_entrenamientos_realizados,
  ur.ultima_fecha_reporte,
  m.nombre as ultima_modalidad,
  nr.codigo as ultimo_nivel_reportado,
  ur.ultima_actitud,
  ur.ultima_tecnica,
  ur.ultima_pista,
  ur.ultimos_remontes,
  ur.ultima_autonomia,
  ur.ultima_incidencia,
  ur.ultima_recomendacion,
  ur.ultimo_reporte,
  al.fecha_nacimiento,
  al.telefono,
  al.camiseta_entregada,
  al.camiseta_entregada_at
from public.alumnos al
left join public.niveles na on na.id = al.nivel_actual_id
left join public.niveles ne on ne.id = al.nivel_estimado_id
left join conteos c on c.alumno_id = al.id
left join ultimo_reporte ur on ur.alumno_id = al.id
left join public.modalidades m on m.id = ur.modalidad_id
left join public.niveles nr on nr.id = ur.nivel_id
where coalesce(al.activo, true) = true
  and public.es_coordinacion_operativa_app();

revoke all privileges on public.v_resumen_alumno_v2 from public, anon;
grant select on public.v_resumen_alumno_v2 to authenticated;

commit;
