-- 25/11/2026 (Jose): cambiar a mano la pista de un grupo desde «Días de entrenamiento».
-- La pista se recalcula sola por niveles al entrar/salir niños; esto permite
-- corregirla puntualmente. Si el grupo está publicado, el aviso de cambio de pista
-- al entrenador lo registra el trigger existente (trg_aviso_cambio_grupo).
create or replace function public.cambiar_pista_grupo_app(p_grupo_id uuid, p_pista text)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $$
declare v_pista text := nullif(trim(coalesce(p_pista, '')), '');
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso para realizar esta acción operativa.';
  end if;
  if p_grupo_id is null then raise exception 'Falta grupo_id.'; end if;
  if v_pista is null or v_pista not in ('Pequeña', 'Grande', 'Pequeña/Grande') then
    raise exception 'Pista no válida: elige Pequeña, Grande o Pequeña/Grande.';
  end if;
  if not exists (select 1 from public.grupos where id = p_grupo_id and coalesce(cancelado, false) = false) then
    raise exception 'No existe el grupo indicado.';
  end if;
  update public.grupos set pista = v_pista where id = p_grupo_id and pista is distinct from v_pista;
end;
$$;
revoke all on function public.cambiar_pista_grupo_app(uuid, text) from public, anon;
grant execute on function public.cambiar_pista_grupo_app(uuid, text) to authenticated;
