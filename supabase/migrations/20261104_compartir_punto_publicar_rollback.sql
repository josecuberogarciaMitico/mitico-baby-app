-- Rollback de 20261104_compartir_punto_publicar.sql: vuelve a rechazar siempre el punto compartido al publicar.

create or replace function public.validar_publicacion_grupo_operativa_app(p_grupo_id uuid)
 returns jsonb
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_sesion_id uuid;
  v_fecha date;
  v_inicio time;
  v_fin time;
  v_nombre_grupo text;
  v_particular boolean := false;
  v_punto text;
  v_trabajo text;
  v_principal uuid;
  v_principal_excepcional boolean := false;
  v_ratio jsonb;
  v_total integer;
  v_extra record;
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso para validar/publicar grupos.';
  end if;

  select g.sesion_id,s.fecha,s.hora_inicio,s.hora_fin,g.nombre_grupo,
         nullif(trim(coalesce(g.punto_encuentro,'')),''),
         nullif(trim(coalesce(tdg.trabajo_diario,'')),'')
    into v_sesion_id,v_fecha,v_inicio,v_fin,v_nombre_grupo,v_punto,v_trabajo
  from public.grupos g
  join public.sesiones s on s.id=g.sesion_id
  left join public.trabajo_diario_grupo tdg on tdg.grupo_id=g.id
  where g.id=p_grupo_id and coalesce(g.cancelado,false)=false;

  if v_sesion_id is null then raise exception 'No existe el grupo.'; end if;

  v_particular := upper(trim(coalesce(v_nombre_grupo,''))) like 'PARTICULAR · %';

  select count(*)::integer into v_total
  from public.grupo_alumnos
  where grupo_id=p_grupo_id;

  if v_total=0 then raise exception 'No se puede publicar un grupo sin alumnos.'; end if;

  select ae.entrenador_id, coalesce(ae.es_excepcional,false)
  into v_principal, v_principal_excepcional
  from public.asignaciones_entrenadores ae
  join public.entrenadores e on e.id=ae.entrenador_id and coalesce(e.activo,true)=true
  where ae.grupo_id=p_grupo_id
  order by ae.created_at nulls last,ae.id
  limit 1;

  if v_principal is null then raise exception 'Asigna un entrenador antes de publicar.'; end if;
  if not v_principal_excepcional
     and not public.entrenador_disponible_sesion_operativa_app(v_sesion_id,v_principal) then
    raise exception 'El entrenador principal no figura como Disponible para este turno.';
  end if;
  if public.entrenador_ocupado_sesion_operativa_app(v_sesion_id,v_principal,p_grupo_id) then
    raise exception 'El entrenador principal ya está ocupado en otro grupo que se solapa.';
  end if;

  for v_extra in
    select ge.entrenador_id
    from public.grupo_entrenadores_extra_app ge
    join public.entrenadores e on e.id=ge.entrenador_id and coalesce(e.activo,true)=true
    where ge.grupo_id=p_grupo_id
  loop
    if not public.entrenador_disponible_sesion_operativa_app(v_sesion_id,v_extra.entrenador_id) then
      raise exception 'El segundo entrenador no figura como Disponible para este turno.';
    end if;
    if public.entrenador_ocupado_sesion_operativa_app(v_sesion_id,v_extra.entrenador_id,p_grupo_id) then
      raise exception 'El segundo entrenador ya está ocupado en otro grupo que se solapa.';
    end if;
  end loop;

  if not v_particular then
    if v_punto is null then raise exception 'Asigna un punto de encuentro antes de publicar.'; end if;

    if exists(
      select 1
      from public.grupos g2
      join public.sesiones s2 on s2.id=g2.sesion_id
      where g2.id<>p_grupo_id
        and coalesce(g2.cancelado,false)=false
        and s2.fecha=v_fecha
        and s2.hora_inicio<v_fin
        and v_inicio<s2.hora_fin
        and trim(coalesce(g2.punto_encuentro,''))=v_punto
    ) then
      raise exception 'Ese punto de encuentro ya está usado por otro grupo que se solapa.';
    end if;
  end if;

  if v_trabajo is null then raise exception 'Falta Trabajo diario antes de publicar.'; end if;

  if exists(
    select 1
    from public.grupo_alumnos ga
    join public.grupos g2 on g2.id=ga.grupo_id
    where g2.sesion_id=v_sesion_id and coalesce(g2.cancelado,false)=false
    group by ga.alumno_id
    having count(distinct ga.grupo_id)>1
  ) then
    raise exception 'Hay al menos un alumno duplicado en dos grupos de la misma sesión.';
  end if;

  v_ratio:=public.evaluar_ratio_baby_grupo_operativa_app(p_grupo_id);
  if coalesce((v_ratio->>'aplica')::boolean,false) then
    update public.grupos
       set ratio_ok=coalesce((v_ratio->>'valido')::boolean,false),
           excepcion_ratio=coalesce((v_ratio->>'excepcion')::boolean,false)
     where id=p_grupo_id;

    if not coalesce((v_ratio->>'valido')::boolean,false) then
      raise exception '%',coalesce(v_ratio->>'motivo','Ratio Baby no válido.');
    end if;
  end if;

  return jsonb_build_object(
    'ok',true,
    'grupo_id',p_grupo_id,
    'asignacion_excepcional',v_principal_excepcional,
    'ratio',v_ratio
  );
end;
$function$;
