-- Vuelta atrás de 20261119_grupo_publicado_editable.sql: vuelve a bloquear.
do $mig$
declare
  d text := pg_get_functiondef('public.mover_alumno_grupo_operativa_app(uuid,uuid,uuid)'::regprocedure);
  o1 text := $t$raise exception 'El movimiento dejaría el grupo origen con un ratio Baby no válido (% alumnos).', v_ro->>'total';$t$;
  o2 text := $t$raise exception 'El movimiento dejaría el grupo destino con un ratio Baby no válido (% alumnos).', v_rd->>'total';$t$;
  n1 text := $t$null; -- 19/11: ratio origen fuera de rango en grupo publicado → ya no bloquea (aviso en la app).$t$;
  n2 text := $t$null; -- 19/11: ratio destino fuera de rango en grupo publicado → ya no bloquea (aviso en la app).$t$;
begin
  if position(n1 in d) = 0 or position(n2 in d) = 0 then
    raise exception 'La función no tiene el cambio del 19/11; no se toca.';
  end if;
  execute replace(replace(d, n1, o1), n2, o2);
end
$mig$;
do $mig$
declare
  d text := pg_get_functiondef('public.asegurar_ratio_publicado_grupo_app(uuid)'::regprocedure);
  o text := $t$null; -- 19/11: grupo publicado fuera de ratio → ya no bloquea (aviso en la app).$t$;
  n text := $t$raise exception '%',coalesce(v_ratio->>'motivo','El cambio dejaría el grupo Baby publicado con un ratio no válido.');$t$;
begin
  if position(o in d) = 0 then
    raise exception 'asegurar_ratio_publicado_grupo_app no es la versión esperada; no se cambia nada.';
  end if;
  execute replace(d, o, n);
end
$mig$;

notify pgrst, 'reload schema';
