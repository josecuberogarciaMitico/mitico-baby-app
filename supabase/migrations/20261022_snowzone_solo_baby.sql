-- Informe SnowZone (Pista pequeña / Pista grande): contar SOLO la modalidad Baby.
-- Antes contaba todas las modalidades salvo Intensivos (Baby + Ocio) y además la asistencia de Intensivos.
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
  with usos as (
    select distinct
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
  )
  select
    u.fecha,
    count(*) filter (where u.pista_tipo = 'PEQUENA')::bigint as pista_pequena,
    count(*) filter (where u.pista_tipo = 'GRANDE')::bigint as pista_grande,
    count(*)::bigint as total
  from usos u
  where u.pista_tipo is not null
  group by u.fecha
  order by u.fecha;
end;
$function$;
