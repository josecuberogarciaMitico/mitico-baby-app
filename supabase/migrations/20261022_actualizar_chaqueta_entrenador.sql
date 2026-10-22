-- Botón «Chaqueta: SÍ / NO» del entrenador en Trabajo en pista (22/10/2026).
-- Igual que actualizar_camiseta_alumno_app: solo cambia chaqueta_entregada.
-- (guardar_entrenador_gestion_app exige todos los campos de la ficha.)
create or replace function public.actualizar_chaqueta_entrenador_app(
  p_entrenador_id uuid,
  p_entregada boolean
)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso para actualizar la chaqueta del entrenador.';
  end if;

  if p_entrenador_id is null then
    raise exception 'Falta entrenador.';
  end if;

  update public.entrenadores
  set chaqueta_entregada = coalesce(p_entregada, false)
  where id = p_entrenador_id;

  if not found then
    raise exception 'No existe el entrenador.';
  end if;
end;
$function$;

revoke all on function public.actualizar_chaqueta_entrenador_app(uuid, boolean) from public, anon;
grant execute on function public.actualizar_chaqueta_entrenador_app(uuid, boolean) to authenticated, service_role;
