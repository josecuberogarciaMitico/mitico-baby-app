-- Nivel B siempre en pista grande (pedido por coordinación, 22/10/2026).
-- Antes: B (y A+ en los recomendadores SQL) salían como «Pequeña/Grande» y los
-- entrenadores no sabían a qué pista ir.
-- Cambios:
--   1. niveles: B → pista_recomendada 'Grande' (A+ ya era 'Pequeña').
--   2. recomendar_grupos_sesion_operativa_app: orden <= 2 → Pequeña, resto Grande.
--   3. recomendar_grupos_intensivo_dia_app: orden 2 → Pequeña (antes 2-3 Pequeña/Grande).
--   4. Grupos desde hoy guardados con 'Pequeña/Grande' → 'Grande'
--      (todos contienen B o superior; los grupos pasados no se tocan).
-- No cambia el ratio: el máximo Baby depende del nivel, no de la pista.

begin;

update public.niveles
set pista_recomendada = 'Grande'
where codigo = 'B' and pista_recomendada = 'Pequeña/Grande';

do $mig$
declare
  d text;
  n text;
begin
  d := pg_get_functiondef('public.recomendar_grupos_sesion_operativa_app(uuid)'::regprocedure);
  n := regexp_replace(d, $x$when b\.orden_nivel <= 3 then 'Pequeña/Grande'$x$, $x$when b.orden_nivel <= 2 then 'Pequeña'$x$);
  if n = d or position('Pequeña/Grande' in n) > 0 then
    raise exception 'recomendar_grupos_sesion_operativa_app no tiene el texto esperado; no se aplica.';
  end if;
  execute n;

  d := pg_get_functiondef('public.recomendar_grupos_intensivo_dia_app(uuid)'::regprocedure);
  n := regexp_replace(d, $x$when coalesce\(na\.orden, ne\.orden, 0\) between 2 and 3(\s+)then 'Pequeña/Grande'$x$, $x$when coalesce(na.orden, ne.orden, 0) = 2\1then 'Pequeña'$x$);
  if n = d or position('Pequeña/Grande' in n) > 0 then
    raise exception 'recomendar_grupos_intensivo_dia_app no tiene el texto esperado; no se aplica.';
  end if;
  execute n;
end
$mig$;

update public.grupos g
set pista = 'Grande'
from public.sesiones s
where s.id = g.sesion_id
  and g.pista = 'Pequeña/Grande'
  and coalesce(g.cancelado, false) = false
  and s.fecha >= current_date;

commit;
