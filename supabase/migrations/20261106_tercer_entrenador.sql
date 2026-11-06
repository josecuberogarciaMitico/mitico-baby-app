-- Tercer entrenador por grupo (06/11/2026)
--
-- La tabla grupo_entrenadores_extra_app ya admite varios entrenadores extra por
-- grupo (único por grupo+entrenador), y casi todo lo que la usa ya trata a
-- todos los extra por igual: Vista entrenador, confirmaciones, avisos de Paco,
-- cobros (cada extra cobra su turno), ratio Baby, permisos de reporte,
-- «ocupado en otro grupo» y el reparto de reportes por niño.
--
-- Lo que se cambia:
-- 1. El tercero se guarda con rol 'tercero' (el segundo sigue siendo 'apoyo').
-- 2. guardar_apoyo_reportes_grupo_app (el que cambia el SEGUNDO): antes
--    borraba TODOS los extra del grupo; ahora solo el segundo. Si se quita el
--    segundo y hay tercero, el tercero pasa a ser el segundo. El reparto
--    manual acepta también al tercero.
-- 3. guardar_tercer_entrenador_grupo_app (nuevo): pone, cambia o quita el
--    tercero con las mismas comprobaciones que el segundo. Al ponerlo por
--    primera vez reparte los reportes entre los tres (1 de cada 3 niños pasa
--    al tercero); al quitarlo, sus niños vuelven al principal.
-- 4. v_grupos_sesion_operativa_app(_raw_s2): el segundo sale del rol
--    'apoyo' y se añaden al final entrenador_tercero_id / entrenador_tercero.
-- Rollback: 20261106_tercer_entrenador_rollback.sql

-- ---- 4. Vistas --------------------------------------------------------------
create or replace view public.v_grupos_sesion_operativa_app_raw_s2 as
 WITH alumnos_por_grupo AS (
         SELECT ga.grupo_id,
            (count(*))::integer AS total_alumnos,
            string_agg(((((al.nombre_completo || ' · '::text) || COALESCE(na.codigo, ne.codigo, 'SIN NIVEL'::text)) || ' · '::text) || COALESCE(na.pista_recomendada, ne.pista_recomendada, 'SIN PISTA'::text)), ' || '::text ORDER BY ga.orden, al.nombre_completo) AS alumnos_lista
           FROM (((grupo_alumnos ga
             JOIN alumnos al ON ((al.id = ga.alumno_id)))
             LEFT JOIN niveles na ON ((na.id = al.nivel_actual_id)))
             LEFT JOIN niveles ne ON ((ne.id = al.nivel_estimado_id)))
          GROUP BY ga.grupo_id
        ), apoyo AS (
         SELECT DISTINCT ON (ge.grupo_id) ge.grupo_id,
            ge.entrenador_id AS entrenador_apoyo_id,
            e_1.nombre_completo AS entrenador_apoyo
           FROM (grupo_entrenadores_extra_app ge
             JOIN entrenadores e_1 ON ((e_1.id = ge.entrenador_id)))
          WHERE ge.rol IS DISTINCT FROM 'tercero'
          ORDER BY ge.grupo_id, ge.created_at, ge.id
        ), tercero AS (
         SELECT DISTINCT ON (ge.grupo_id) ge.grupo_id,
            ge.entrenador_id AS entrenador_tercero_id,
            e_2.nombre_completo AS entrenador_tercero
           FROM (grupo_entrenadores_extra_app ge
             JOIN entrenadores e_2 ON ((e_2.id = ge.entrenador_id)))
          WHERE ge.rol = 'tercero'
          ORDER BY ge.grupo_id, ge.created_at, ge.id
        )
 SELECT s.id AS sesion_id,
    g.id AS grupo_id,
    g.nombre_grupo,
    g.nivel_grupo,
    g.pista,
    g.punto_encuentro,
    g.estado AS estado_grupo,
    g.publicado,
    g.observaciones_importantes,
    ae.entrenador_id,
    e.nombre_completo AS entrenador,
    ae.estado_confirmacion,
    COALESCE(apg.total_alumnos, 0) AS total_alumnos,
    apg.alumnos_lista,
    NULLIF(TRIM(BOTH FROM tdg.trabajo_diario), ''::text) AS trabajo_diario,
    apoyo.entrenador_apoyo_id,
    apoyo.entrenador_apoyo,
    tercero.entrenador_tercero_id,
    tercero.entrenador_tercero
   FROM (((((((sesiones s
     JOIN grupos g ON ((g.sesion_id = s.id)))
     LEFT JOIN asignaciones_entrenadores ae ON ((ae.grupo_id = g.id)))
     LEFT JOIN entrenadores e ON ((e.id = ae.entrenador_id)))
     LEFT JOIN alumnos_por_grupo apg ON ((apg.grupo_id = g.id)))
     LEFT JOIN trabajo_diario_grupo tdg ON ((tdg.grupo_id = g.id)))
     LEFT JOIN apoyo ON ((apoyo.grupo_id = g.id)))
     LEFT JOIN tercero ON ((tercero.grupo_id = g.id)))
  WHERE (COALESCE(g.cancelado, false) = false);

create or replace view public.v_grupos_sesion_operativa_app as
 SELECT sesion_id,
    grupo_id,
    nombre_grupo,
    nivel_grupo,
    pista,
    punto_encuentro,
    estado_grupo,
    publicado,
    observaciones_importantes,
    entrenador_id,
    entrenador,
    estado_confirmacion,
    total_alumnos,
    alumnos_lista,
    trabajo_diario,
    entrenador_apoyo_id,
    entrenador_apoyo,
    entrenador_tercero_id,
    entrenador_tercero
   FROM v_grupos_sesion_operativa_app_raw_s2 raw
  WHERE ((CURRENT_USER = 'service_role'::name) OR es_gestion_altas_app());

-- ---- 2. Cambiar el SEGUNDO sin tocar al tercero -----------------------------
create or replace function public.guardar_apoyo_reportes_grupo_app(p_grupo_id uuid, p_entrenador_apoyo_id uuid, p_responsables jsonb)
 returns void
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_item jsonb; v_alumno_id uuid; v_entrenador_id uuid; v_sesion_id uuid; v_principal uuid;
  v_apoyo_anterior uuid; v_tercero uuid;
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'Solo coordinación puede repartir apoyos y responsables de reportes.';
  end if;
  if p_grupo_id is null then return; end if;

  select g.sesion_id, ae.entrenador_id into v_sesion_id, v_principal
  from public.grupos g left join public.asignaciones_entrenadores ae on ae.grupo_id = g.id
  where g.id = p_grupo_id order by ae.created_at nulls last, ae.id limit 1;
  if v_sesion_id is null then raise exception 'No existe el grupo indicado.'; end if;

  select ge.entrenador_id into v_apoyo_anterior from public.grupo_entrenadores_extra_app ge
  where ge.grupo_id = p_grupo_id and ge.rol is distinct from 'tercero'
  order by ge.created_at nulls last, ge.id limit 1;
  select ge.entrenador_id into v_tercero from public.grupo_entrenadores_extra_app ge
  where ge.grupo_id = p_grupo_id and ge.rol = 'tercero'
  order by ge.created_at nulls last, ge.id limit 1;

  if p_entrenador_apoyo_id is not null then
    if p_entrenador_apoyo_id = v_principal then
      raise exception 'El segundo entrenador no puede ser el mismo que el principal.';
    end if;
    if p_entrenador_apoyo_id = v_tercero then
      raise exception 'Ese entrenador ya es el tercer entrenador de este grupo.';
    end if;
    if not public.entrenador_disponible_sesion_operativa_app(v_sesion_id, p_entrenador_apoyo_id) then
      raise exception 'El segundo entrenador no figura como Disponible para este turno.';
    end if;
    if public.entrenador_ocupado_sesion_operativa_app(v_sesion_id, p_entrenador_apoyo_id, p_grupo_id) then
      raise exception 'Ese entrenador ya está asignado a un grupo que se solapa en ese turno.';
    end if;
  end if;

  -- 06/11: solo se borra el segundo (el tercero se queda).
  delete from public.grupo_entrenadores_extra_app where grupo_id = p_grupo_id and rol is distinct from 'tercero';
  if p_entrenador_apoyo_id is not null then
    insert into public.grupo_entrenadores_extra_app (grupo_id, entrenador_id, rol)
    values (p_grupo_id, p_entrenador_apoyo_id, 'apoyo')
    on conflict (grupo_id, entrenador_id) do update set rol = excluded.rol;
  elsif v_tercero is not null then
    -- Sin segundo pero con tercero: el tercero pasa a ser el segundo.
    update public.grupo_entrenadores_extra_app set rol = 'apoyo' where grupo_id = p_grupo_id and rol = 'tercero';
  end if;

  if p_responsables is null then
    if v_apoyo_anterior is not null then
      update public.grupo_reporte_responsable_app
         set entrenador_id = coalesce(p_entrenador_apoyo_id, v_principal)
       where grupo_id = p_grupo_id and entrenador_id = v_apoyo_anterior;
    elsif p_entrenador_apoyo_id is not null then
      insert into public.grupo_reporte_responsable_app (grupo_id, alumno_id, entrenador_id)
      select p_grupo_id, ga.alumno_id,
             case when (row_number() over (order by ga.alumno_id)) % 5 < 3 then v_principal else p_entrenador_apoyo_id end
      from public.grupo_alumnos ga where ga.grupo_id = p_grupo_id
      on conflict (grupo_id, alumno_id) do update set entrenador_id = excluded.entrenador_id;
    end if;
    return;
  end if;

  delete from public.grupo_reporte_responsable_app where grupo_id = p_grupo_id;
  for v_item in select * from jsonb_array_elements(coalesce(p_responsables, '[]'::jsonb)) loop
    v_alumno_id := nullif(v_item->>'alumno_id', '')::uuid;
    v_entrenador_id := nullif(v_item->>'entrenador_id', '')::uuid;
    if v_alumno_id is not null and v_entrenador_id is not null then
      if not exists (select 1 from public.grupo_alumnos where grupo_id = p_grupo_id and alumno_id = v_alumno_id) then
        raise exception 'El reparto de reportes contiene un alumno que no pertenece al grupo.';
      end if;
      if v_entrenador_id <> v_principal
         and (p_entrenador_apoyo_id is null or v_entrenador_id <> p_entrenador_apoyo_id)
         and not exists (select 1 from public.grupo_entrenadores_extra_app ge
                         where ge.grupo_id = p_grupo_id and ge.entrenador_id = v_entrenador_id) then
        raise exception 'El responsable de reporte no es entrenador del grupo.';
      end if;
      insert into public.grupo_reporte_responsable_app (grupo_id, alumno_id, entrenador_id)
      values (p_grupo_id, v_alumno_id, v_entrenador_id)
      on conflict (grupo_id, alumno_id) do update set entrenador_id = excluded.entrenador_id;
    end if;
  end loop;
  if exists (select 1 from public.grupo_alumnos ga where ga.grupo_id = p_grupo_id
             and not exists (select 1 from public.grupo_reporte_responsable_app rr
                             where rr.grupo_id = p_grupo_id and rr.alumno_id = ga.alumno_id)) then
    raise exception 'El reparto de reportes está incompleto: faltan alumnos por asignar.';
  end if;
end;
$function$;

-- ---- 3. Tercer entrenador -----------------------------------------------------
create or replace function public.guardar_tercer_entrenador_grupo_app(p_grupo_id uuid, p_entrenador_id uuid)
 returns void
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_sesion_id uuid; v_principal uuid; v_apoyo uuid; v_anterior uuid;
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'Solo coordinación puede poner el tercer entrenador.';
  end if;
  if p_grupo_id is null then raise exception 'Falta el grupo.'; end if;

  select g.sesion_id into v_sesion_id from public.grupos g
  where g.id = p_grupo_id and coalesce(g.cancelado, false) = false;
  if v_sesion_id is null then raise exception 'No existe el grupo indicado.'; end if;

  select ae.entrenador_id into v_principal from public.asignaciones_entrenadores ae
  where ae.grupo_id = p_grupo_id order by ae.created_at nulls last, ae.id limit 1;
  select ge.entrenador_id into v_apoyo from public.grupo_entrenadores_extra_app ge
  where ge.grupo_id = p_grupo_id and ge.rol is distinct from 'tercero'
  order by ge.created_at nulls last, ge.id limit 1;
  select ge.entrenador_id into v_anterior from public.grupo_entrenadores_extra_app ge
  where ge.grupo_id = p_grupo_id and ge.rol = 'tercero'
  order by ge.created_at nulls last, ge.id limit 1;

  if p_entrenador_id is not null then
    if v_principal is null or v_apoyo is null then
      raise exception 'Pon primero el entrenador principal y el segundo.';
    end if;
    if p_entrenador_id = v_principal or p_entrenador_id = v_apoyo then
      raise exception 'Ese entrenador ya está en este grupo.';
    end if;
    if not public.entrenador_disponible_sesion_operativa_app(v_sesion_id, p_entrenador_id) then
      raise exception 'El tercer entrenador no figura como Disponible para este turno.';
    end if;
    if public.entrenador_ocupado_sesion_operativa_app(v_sesion_id, p_entrenador_id, p_grupo_id) then
      raise exception 'Ese entrenador ya está asignado a un grupo que se solapa en ese turno.';
    end if;
  end if;

  if p_entrenador_id is not distinct from v_anterior then return; end if;

  delete from public.grupo_entrenadores_extra_app where grupo_id = p_grupo_id and rol = 'tercero';
  if p_entrenador_id is not null then
    insert into public.grupo_entrenadores_extra_app (grupo_id, entrenador_id, rol)
    values (p_grupo_id, p_entrenador_id, 'tercero');
  end if;

  -- Reportes.
  if v_anterior is not null then
    -- Cambio o quitar: sus niños pasan al nuevo tercero o, si se quita, al principal.
    update public.grupo_reporte_responsable_app
       set entrenador_id = coalesce(p_entrenador_id, v_principal)
     where grupo_id = p_grupo_id and entrenador_id = v_anterior;
  elsif p_entrenador_id is not null then
    -- Primera vez: todos los niños con responsable (principal por defecto) y
    -- 1 de cada 3 pasa al tercero. Luego se puede ajustar niño a niño.
    insert into public.grupo_reporte_responsable_app (grupo_id, alumno_id, entrenador_id)
    select p_grupo_id, ga.alumno_id, v_principal
    from public.grupo_alumnos ga where ga.grupo_id = p_grupo_id
    on conflict (grupo_id, alumno_id) do nothing;
    update public.grupo_reporte_responsable_app rr
       set entrenador_id = p_entrenador_id
      from (
        select x.alumno_id, row_number() over (order by a.nombre_completo, x.alumno_id) n
        from public.grupo_reporte_responsable_app x
        join public.alumnos a on a.id = x.alumno_id
        where x.grupo_id = p_grupo_id
      ) o
     where rr.grupo_id = p_grupo_id and rr.alumno_id = o.alumno_id and o.n % 3 = 0;
  end if;
end;
$function$;

revoke all on function public.guardar_tercer_entrenador_grupo_app(uuid, uuid) from public, anon;
grant execute on function public.guardar_tercer_entrenador_grupo_app(uuid, uuid) to authenticated;
