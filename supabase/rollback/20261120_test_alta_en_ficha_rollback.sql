-- Deshace 20261120_test_alta_en_ficha.sql (deja las funciones como antes).
-- La columna alumno_id se quita al final; las altas añadidas vuelven a
-- borrarse a los 7 días como antes.
do $$
declare
  v_def text;
  v_nuevo text;
begin
  v_def := pg_get_functiondef('public.anadir_alta_nivel_inicial_a_listados_app(uuid, uuid)'::regprocedure);
  v_nuevo := replace(v_def, E'    alumno_id = v_alumno_id, -- 20/11: el test queda en la ficha\n', '');
  if v_nuevo = v_def then raise exception 'anadir: texto no encontrado'; end if;
  execute v_nuevo;

  v_def := pg_get_functiondef('public.obtener_altas_nivel_inicial_app()'::regprocedure);
  v_nuevo := replace(v_def,
    E'    and a.eliminar_despues_de <= now()\n    and a.alumno_id is null; -- 20/11: con alumno se guarda (test en la ficha)',
    E'    and a.eliminar_despues_de <= now();');
  v_nuevo := replace(v_nuevo,
    E'  where not (a.estado = ''ANADIDO'' and a.eliminar_despues_de is not null and a.eliminar_despues_de <= now())\n', '');
  if v_nuevo = v_def then raise exception 'obtener_altas: texto no encontrado'; end if;
  execute v_nuevo;

  v_def := pg_get_functiondef('public.eliminar_registro_temporal_alta_nivel_app(uuid)'::regprocedure);
  v_nuevo := replace(v_def,
    E'  -- 20/11: con alumno enlazado se oculta (el test sigue en su ficha).\n  update public.altas_nivel_inicial_app\n  set eliminar_despues_de = now()\n  where id = p_id\n    and estado = ''ANADIDO''\n    and alumno_id is not null;\n\n  delete from public.altas_nivel_inicial_app\n  where id = p_id\n    and estado = ''ANADIDO''\n    and alumno_id is null;',
    E'  delete from public.altas_nivel_inicial_app\n  where id = p_id\n    and estado = ''ANADIDO'';');
  if v_nuevo = v_def then raise exception 'eliminar_registro_temporal: texto no encontrado'; end if;
  execute v_nuevo;
end $$;

drop function if exists public.obtener_test_alta_alumno_app(uuid);
drop index if exists public.altas_nivel_inicial_app_alumno_id_idx;
alter table public.altas_nivel_inicial_app drop column if exists alumno_id;
