-- 14/11/2026 · Avisos de reportes: «Candidato a subir» con botón para subirle de nivel.
-- Antes el aviso solo tenía «Visto» y el nivel no cambiaba nunca solo.
-- Cambia solo el nivel de la ficha y el nivel usado en sus turnos de hoy en
-- adelante (los turnos pasados se quedan como estaban). No toca reportes.
-- Rollback: 20261114_subir_nivel_candidato_rollback.sql

create or replace function public.subir_nivel_candidato_app(p_alumno_id uuid, p_nivel_codigo text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_nivel_id uuid;
  v_hoy date := (now() at time zone 'Europe/Madrid')::date;
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso para cambiar el nivel.';
  end if;

  select n.id into v_nivel_id
  from public.niveles n
  where upper(n.codigo) = upper(trim(coalesce(p_nivel_codigo, '')))
    and coalesce(n.activo, true)
  limit 1;
  if v_nivel_id is null then
    raise exception 'Nivel no válido: %', p_nivel_codigo;
  end if;

  update public.alumnos
  set nivel_actual_id = v_nivel_id,
      nivel_estimado_id = null
  where id = p_alumno_id;
  if not found then
    raise exception 'No existe el alumno.';
  end if;

  update public.sesion_alumnos_operativa sao
  set nivel_usado_id = v_nivel_id,
      origen_nivel = 'Nivel real de ficha'
  from public.sesiones s
  where s.id = sao.sesion_id
    and sao.alumno_id = p_alumno_id
    and s.fecha >= v_hoy;
end;
$$;

revoke all on function public.subir_nivel_candidato_app(uuid, text) from public, anon;
grant execute on function public.subir_nivel_candidato_app(uuid, text) to authenticated;
