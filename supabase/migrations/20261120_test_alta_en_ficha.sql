-- 20/11/2026 · El test de alta que contestó la familia se queda guardado con
-- la ficha del alumno y se puede consultar desde la ficha (Fichas).
--
-- Antes: al añadir el alumno, el registro del alta se borraba a los 7 días
-- (y con él las respuestas del test). No quedaba enlazado a ningún alumno.
-- Ahora:
--   1. altas_nivel_inicial_app.alumno_id enlaza el alta con la ficha creada.
--   2. Las altas AÑADIDAS con alumno ya no se borran: a los 7 días solo dejan
--      de salir en «Altas / Test» (como hasta ahora), pero el test sigue en la ficha.
--   3. «Borrar registro temporal» las oculta de Altas en vez de borrarlas.
--   4. Nueva función de solo lectura obtener_test_alta_alumno_app(alumno).
-- Las DESCARTADAS y las altas sin alumno siguen igual.
-- Rollback: supabase/rollback/20261120_test_alta_en_ficha_rollback.sql

alter table public.altas_nivel_inicial_app
  add column if not exists alumno_id uuid references public.alumnos(id) on delete set null;

create index if not exists altas_nivel_inicial_app_alumno_id_idx
  on public.altas_nivel_inicial_app (alumno_id);

-- Altas ya añadidas: se enlazan solo si hay UNA ficha activa con el mismo
-- nombre (normalizado) y la misma fecha de nacimiento.
update public.altas_nivel_inicial_app a
set alumno_id = m.alumno_id
from (
  select a2.id as alta_id, min(al.id::text)::uuid as alumno_id
  from public.altas_nivel_inicial_app a2
  join public.alumnos al
    on public.normalizar_nombre_app(al.nombre_completo) = public.normalizar_nombre_app(a2.nombre_completo)
   and al.fecha_nacimiento = a2.fecha_nacimiento
   and coalesce(al.activo, true) = true
  where a2.estado = 'ANADIDO' and a2.alumno_id is null
  group by a2.id
  having count(*) = 1
) m
where a.id = m.alta_id;

do $$
declare
  v_def text;
  v_nuevo text;
begin
  -- 1) Al añadir el alta a los listados se guarda el alumno.
  v_def := pg_get_functiondef('public.anadir_alta_nivel_inicial_a_listados_app(uuid, uuid)'::regprocedure);
  v_nuevo := replace(v_def,
    E'    estado = ''ANADIDO'',\n    eliminar_despues_de = now() + interval ''7 days''',
    E'    estado = ''ANADIDO'',\n    alumno_id = v_alumno_id, -- 20/11: el test queda en la ficha\n    eliminar_despues_de = now() + interval ''7 days''');
  if v_nuevo = v_def then raise exception 'anadir_alta_nivel_inicial_a_listados_app: texto no encontrado'; end if;
  execute v_nuevo;

  -- 2) La bandeja no borra las añadidas con alumno; solo las oculta pasados 7 días.
  v_def := pg_get_functiondef('public.obtener_altas_nivel_inicial_app()'::regprocedure);
  v_nuevo := replace(v_def,
    E'    and a.eliminar_despues_de <= now();',
    E'    and a.eliminar_despues_de <= now()\n    and a.alumno_id is null; -- 20/11: con alumno se guarda (test en la ficha)');
  if v_nuevo = v_def then raise exception 'obtener_altas_nivel_inicial_app (borrado): texto no encontrado'; end if;
  v_def := v_nuevo;
  v_nuevo := replace(v_def,
    E'  left join public.niveles nv on nv.id = a.nivel_validado_id\n  order by',
    E'  left join public.niveles nv on nv.id = a.nivel_validado_id\n  where not (a.estado = ''ANADIDO'' and a.eliminar_despues_de is not null and a.eliminar_despues_de <= now())\n  order by');
  if v_nuevo = v_def then raise exception 'obtener_altas_nivel_inicial_app (filtro): texto no encontrado'; end if;
  execute v_nuevo;

  -- 3) «Borrar registro temporal»: si tiene alumno, solo se oculta de Altas.
  v_def := pg_get_functiondef('public.eliminar_registro_temporal_alta_nivel_app(uuid)'::regprocedure);
  v_nuevo := replace(v_def,
    E'  delete from public.altas_nivel_inicial_app\n  where id = p_id\n    and estado = ''ANADIDO'';',
    E'  -- 20/11: con alumno enlazado se oculta (el test sigue en su ficha).\n  update public.altas_nivel_inicial_app\n  set eliminar_despues_de = now()\n  where id = p_id\n    and estado = ''ANADIDO''\n    and alumno_id is not null;\n\n  delete from public.altas_nivel_inicial_app\n  where id = p_id\n    and estado = ''ANADIDO''\n    and alumno_id is null;');
  if v_nuevo = v_def then raise exception 'eliminar_registro_temporal_alta_nivel_app: texto no encontrado'; end if;
  execute v_nuevo;
end $$;

-- 4) Test de alta de un alumno (solo lectura; mismos permisos que la bandeja de Altas).
create or replace function public.obtener_test_alta_alumno_app(p_alumno_id uuid)
returns table(
  id uuid,
  modalidad text,
  respuesta_experiencia text,
  respuesta_desplazamiento text,
  respuesta_frenado text,
  respuesta_giros text,
  respuesta_remonte text,
  respuesta_pista text,
  respuesta_control_velocidad text,
  respuesta_tecnica text,
  observaciones_entrenador_familia text[],
  observacion_entrenador_otra text,
  observaciones_familia text,
  nivel_propuesto text,
  nivel_propuesto_motivo text,
  nivel_validado text,
  respondido_at timestamptz,
  validado_at timestamptz
)
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if not public.es_gestion_altas_app() then
    raise exception 'No tienes permiso para consultar el test de alta.';
  end if;

  return query
  select
    a.id,
    a.modalidad,
    a.respuesta_experiencia,
    a.respuesta_desplazamiento,
    a.respuesta_frenado,
    a.respuesta_giros,
    a.respuesta_remonte,
    a.respuesta_pista,
    a.respuesta_control_velocidad,
    a.respuesta_tecnica,
    coalesce(a.observaciones_entrenador_familia, '{}'::text[]),
    a.observacion_entrenador_otra,
    a.observaciones_familia,
    np.codigo,
    a.nivel_propuesto_motivo,
    nv.codigo,
    a.respondido_at,
    a.validado_at
  from public.altas_nivel_inicial_app a
  left join public.niveles np on np.id = a.nivel_propuesto_id
  left join public.niveles nv on nv.id = a.nivel_validado_id
  where a.alumno_id = p_alumno_id
    and a.respondido_at is not null
  order by a.respondido_at desc;
end;
$function$;

revoke all on function public.obtener_test_alta_alumno_app(uuid) from public, anon;
grant execute on function public.obtener_test_alta_alumno_app(uuid) to authenticated;
