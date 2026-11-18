-- 18/11/2026 · Dividir un grupo ya creado (petición de Jose).
--
-- Antes no se podía: crear_grupo_sesion_operativa_app rechaza a los niños que
-- ya están en otro grupo de la sesión, así que había que borrar el grupo y
-- rehacerlo. Esta función crea el grupo nuevo (en borrador, sin publicar, sin
-- entrenador) en la MISMA sesión y le pasa los niños elegidos usando la misma
-- función de siempre (mover_alumno_grupo_operativa_app): respeta reportes ya
-- hechos, observaciones, responsables de reporte y ratio del grupo de origen.
-- Si algo falla, no se hace nada (todo en una transacción).

create or replace function public.dividir_grupo_sesion_operativa_app(
  p_grupo_id uuid,
  p_alumnos_ids uuid[],
  p_nombre_grupo text,
  p_nivel_grupo text,
  p_trabajo_diario text
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_sesion uuid;
  v_modalidad uuid;
  v_pista text;
  v_total int;
  v_nuevo uuid;
  v_alumno uuid;
  v_trabajo text := nullif(trim(coalesce(p_trabajo_diario, '')), '');
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso para realizar esta acción operativa.';
  end if;
  if p_alumnos_ids is null or array_length(p_alumnos_ids, 1) is null then
    raise exception 'Elige qué niños pasan al grupo nuevo.';
  end if;
  if cardinality(p_alumnos_ids) <> (select count(distinct x) from unnest(p_alumnos_ids) x) then
    raise exception 'Hay niños repetidos.';
  end if;
  if v_trabajo is null then
    raise exception 'Falta el Trabajo diario del grupo nuevo.';
  end if;

  select g.sesion_id, g.modalidad_id, g.pista into v_sesion, v_modalidad, v_pista
  from public.grupos g
  where g.id = p_grupo_id and coalesce(g.cancelado, false) = false;
  if v_sesion is null then
    raise exception 'No encuentro el grupo que quieres dividir.';
  end if;

  select count(*) into v_total from public.grupo_alumnos where grupo_id = p_grupo_id;
  if exists (
    select 1 from unnest(p_alumnos_ids) x
    where not exists (select 1 from public.grupo_alumnos ga where ga.grupo_id = p_grupo_id and ga.alumno_id = x)
  ) then
    raise exception 'Alguno de los niños elegidos no está en ese grupo.';
  end if;
  if cardinality(p_alumnos_ids) >= v_total then
    raise exception 'Deja al menos un niño en el grupo original.';
  end if;

  insert into public.grupos(sesion_id, modalidad_id, nombre_grupo, nivel_grupo, pista, punto_encuentro, estado,
    ratio_ok, excepcion_ratio, observaciones_importantes, publicado, publicado_at, cancelado, cancelacion_confirmacion_requerida)
  values (v_sesion, v_modalidad, coalesce(nullif(trim(p_nombre_grupo), ''), 'Grupo'),
    nullif(trim(coalesce(p_nivel_grupo, '')), ''), v_pista, null, 'Borrador',
    false, false, null, false, null, false, false)
  returning id into v_nuevo;

  insert into public.trabajo_diario_grupo(grupo_id, trabajo_diario, trabajo_diario_revisado, updated_at)
  values (v_nuevo, v_trabajo, true, now())
  on conflict (grupo_id) do update set trabajo_diario = excluded.trabajo_diario, trabajo_diario_revisado = true, updated_at = now();

  foreach v_alumno in array p_alumnos_ids loop
    perform public.mover_alumno_grupo_operativa_app(v_alumno, p_grupo_id, v_nuevo);
  end loop;

  return v_nuevo;
end;
$$;

revoke all on function public.dividir_grupo_sesion_operativa_app(uuid, uuid[], text, text, text) from public, anon;
grant execute on function public.dividir_grupo_sesion_operativa_app(uuid, uuid[], text, text, text) to authenticated;

notify pgrst, 'reload schema';
