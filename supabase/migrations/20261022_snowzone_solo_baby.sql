-- Informe SnowZone (Pista pequeña / Pista grande): contar SOLO Baby e Intensivos.
-- Ocio (y cualquier otra modalidad) deja de contarse. Antes: todo menos Intensivos
-- (Baby + Ocio + Particular) más la asistencia de Intensivos.
-- Misma firma, mismos permisos (solo coordinador jefe) y mismo formato de salida.
CREATE OR REPLACE FUNCTION public.obtener_informe_snowzone_app(p_desde date, p_hasta date)
 RETURNS TABLE(fecha date, pista_pequena bigint, pista_grande bigint, total bigint)
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
begin
  if not public.es_coordinador_jefe_app() then
    raise exception 'No tienes permiso para consultar este informe.';
  end if;

  if p_desde is null or p_hasta is null or p_hasta < p_desde then
    raise exception 'Periodo SnowZone no válido.';
  end if;

  return query
  with asistencia_normal as (
    select
      s.fecha as fecha,
      g.id as grupo_id,
      ga.alumno_id as alumno_id,
      case
        when lower(coalesce(g.pista, '')) like '%grande%' then 'GRANDE'
        when lower(coalesce(g.pista, '')) like '%peque%' then 'PEQUENA'
        else null
      end as pista_tipo
    from public.grupo_alumnos ga
    join public.grupos g
      on g.id = ga.grupo_id
    join public.sesiones s
      on s.id = g.sesion_id
    join public.modalidades m
      on m.id = g.modalidad_id
    where s.fecha between p_desde and p_hasta
      and lower(trim(coalesce(ga.estado_asistencia, ''))) = 'presente'
      and upper(coalesce(m.codigo, '')) = 'BABY'
  ),

  asistencia_intensivos as (
    select
      idia.fecha as fecha,
      g.id as grupo_id,
      ia.alumno_id as alumno_id,
      case
        when lower(coalesce(g.pista, '')) like '%grande%' then 'GRANDE'
        when lower(coalesce(g.pista, '')) like '%peque%' then 'PEQUENA'
        else null
      end as pista_tipo
    from public.intensivo_asistencias ia
    join public.intensivo_dias idia
      on idia.id = ia.intensivo_dia_id
     and idia.intensivo_id = ia.intensivo_id
    join public.grupos g
      on g.sesion_id = idia.sesion_id
    join public.grupo_alumnos ga
      on ga.grupo_id = g.id
     and ga.alumno_id = ia.alumno_id
    where idia.fecha between p_desde and p_hasta
      and coalesce(ia.estado, 'PRESENTE') not in (
        'NO_PRESENTADO',
        'BAJA_AVISADA'
      )
  ),

  usos as (
    select an.fecha, an.grupo_id, an.alumno_id, an.pista_tipo
    from asistencia_normal an
    where an.pista_tipo is not null
    union
    select ai.fecha, ai.grupo_id, ai.alumno_id, ai.pista_tipo
    from asistencia_intensivos ai
    where ai.pista_tipo is not null
  )

  select
    u.fecha,
    count(*) filter (where u.pista_tipo = 'PEQUENA')::bigint as pista_pequena,
    count(*) filter (where u.pista_tipo = 'GRANDE')::bigint as pista_grande,
    count(*)::bigint as total
  from usos u
  group by u.fecha
  order by u.fecha;
end;
$function$;
