-- 19/11/2026 · Cambiar un grupo publicado sin despublicarlo (Jose: «lo de
-- publicar/despublicar lo veo una traba»).
--
-- mover_alumno_grupo_operativa_app bloqueaba el movimiento si un grupo Baby
-- PUBLICADO quedaba fuera de ratio (p. ej. 5 en pista pequeña con 1 entrenador,
-- o un grupo de 1). Con el grupo sin publicar sí dejaba, y por eso había que
-- despublicar. Ahora deja hacerlo siempre: el ratio se sigue calculando y
-- guardando en grupos.ratio_ok, y la app marca el grupo en rojo hasta que se
-- arregle. Publicar un grupo nuevo sigue exigiendo ratio válido.
--
-- Se cambian solo las líneas «raise exception» de ratio en:
--  · mover_alumno_grupo_operativa_app (mover entre grupos del turno);
--  · asegurar_ratio_publicado_grupo_app (comprobación que salta en cada
--    entrada/salida de niño y al quitar 2.º entrenador de un grupo publicado).
-- El resto de cada función queda exactamente igual. ratio_ok se sigue guardando.
do $mig$
declare
  d text := pg_get_functiondef('public.mover_alumno_grupo_operativa_app(uuid,uuid,uuid)'::regprocedure);
  o1 text := $t$raise exception 'El movimiento dejaría el grupo origen con un ratio Baby no válido (% alumnos).', v_ro->>'total';$t$;
  o2 text := $t$raise exception 'El movimiento dejaría el grupo destino con un ratio Baby no válido (% alumnos).', v_rd->>'total';$t$;
  n1 text := $t$null; -- 19/11: ratio origen fuera de rango en grupo publicado → ya no bloquea (aviso en la app).$t$;
  n2 text := $t$null; -- 19/11: ratio destino fuera de rango en grupo publicado → ya no bloquea (aviso en la app).$t$;
begin
  if position(o1 in d) = 0 or position(o2 in d) = 0 then
    raise exception 'mover_alumno_grupo_operativa_app no es la versión esperada; no se cambia nada.';
  end if;
  execute replace(replace(d, o1, n1), o2, n2);
end
$mig$;

do $mig$
declare
  d text := pg_get_functiondef('public.asegurar_ratio_publicado_grupo_app(uuid)'::regprocedure);
  o text := $t$raise exception '%',coalesce(v_ratio->>'motivo','El cambio dejaría el grupo Baby publicado con un ratio no válido.');$t$;
  n text := $t$null; -- 19/11: grupo publicado fuera de ratio → ya no bloquea (aviso en la app).$t$;
begin
  if position(o in d) = 0 then
    raise exception 'asegurar_ratio_publicado_grupo_app no es la versión esperada; no se cambia nada.';
  end if;
  execute replace(d, o, n);
end
$mig$;

notify pgrst, 'reload schema';
