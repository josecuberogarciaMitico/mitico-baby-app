-- Rollback de 20261027_analisis_optimizado.sql
-- La migración guardó la definición anterior exacta en el comentario de cada
-- función (prefijo ROLLBACK_20261027:). Esto la vuelve a poner tal cual.
do $$
declare
  f text;
  c text;
begin
  foreach f in array array['public.obtener_analisis_admin_live_app(uuid,text)', 'public.obtener_analisis_admin_app(uuid,text)'] loop
    c := obj_description(f::regprocedure, 'pg_proc');
    if c is null or c not like 'ROLLBACK_20261027:%' then
      raise exception 'No hay copia anterior guardada para %', f;
    end if;
    execute substr(c, length('ROLLBACK_20261027:') + 1);
    execute format('comment on function %s is null', f);
  end loop;
end $$;
