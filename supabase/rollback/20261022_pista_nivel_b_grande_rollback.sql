-- Vuelta atrás de 20261022_pista_nivel_b_grande.sql
-- Nota: los grupos actualizados en el paso 4 no se pueden distinguir después
-- de los creados como 'Grande'; para revertirlos hay que usar los ids
-- registrados al aplicar la migración (ver nota del proyecto de ese día).
begin;
update public.niveles set pista_recomendada = 'Pequeña/Grande' where codigo = 'B';
do $rb$
declare d text; n text;
begin
  d := pg_get_functiondef('public.recomendar_grupos_sesion_operativa_app(uuid)'::regprocedure);
  n := regexp_replace(d, $x$when b\.orden_nivel <= 2 then 'Pequeña'$x$, $x$when b.orden_nivel <= 3 then 'Pequeña/Grande'$x$);
  execute n;
  d := pg_get_functiondef('public.recomendar_grupos_intensivo_dia_app(uuid)'::regprocedure);
  n := regexp_replace(d, $x$when coalesce\(na\.orden, ne\.orden, 0\) = 2(\s+)then 'Pequeña'$x$, $x$when coalesce(na.orden, ne.orden, 0) between 2 and 3\1then 'Pequeña/Grande'$x$);
  execute n;
end
$rb$;
commit;
