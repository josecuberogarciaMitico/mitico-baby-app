-- 25/11/2026 (Jose): un grupo Baby de 8 o más niños se puede publicar si tiene
-- 2 (o más) entrenadores: entran juntos, se dividen en pista y cada uno hace sus
-- reportes. Máximo 4 niños por entrenador en iniciación / pista pequeña y 7 en
-- el resto. Con 1 entrenador sigue igual (hay que dividir). Resto sin cambios.
CREATE OR REPLACE FUNCTION public.evaluar_ratio_baby_grupo_operativa_app(p_grupo_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public', 'pg_temp'
AS $function$
declare
  v_modalidad text;
  v_nombre_grupo text;
  v_nivel text;
  v_pista text;
  v_total integer;
  v_bajo boolean;
  v_particular boolean := false;
  v_entrenadores integer := 0;
  v_requeridos integer := 1;
  v_valido boolean := false;
  v_excepcion boolean := false;
  v_motivo text := null;
  v_maximo integer;
begin
  select upper(trim(coalesce(m.codigo,m.nombre,''))),
         upper(trim(coalesce(g.nombre_grupo,''))),
         upper(translate(trim(coalesce(g.nivel_grupo,'')),'ÁÉÍÓÚÜÑ','AEIOUUN')),
         upper(translate(trim(coalesce(g.pista,'')),'ÁÉÍÓÚÜÑ','AEIOUUN')),
         count(ga.id)::integer
    into v_modalidad,v_nombre_grupo,v_nivel,v_pista,v_total
  from public.grupos g
  join public.modalidades m on m.id=g.modalidad_id
  left join public.grupo_alumnos ga on ga.grupo_id=g.id
  where g.id=p_grupo_id
  group by m.codigo,m.nombre,g.nombre_grupo,g.nivel_grupo,g.pista;

  if v_modalidad is null then
    raise exception 'No existe el grupo.';
  end if;

  if v_modalidad <> 'BABY' then
    return jsonb_build_object('aplica',false,'valido',true,'total',v_total);
  end if;

  v_particular := v_nombre_grupo like 'PARTICULAR · %';

  select count(distinct entrenador_id)::integer
    into v_entrenadores
  from (
    select ae.entrenador_id
    from public.asignaciones_entrenadores ae
    where ae.grupo_id=p_grupo_id
    union all
    select ge.entrenador_id
    from public.grupo_entrenadores_extra_app ge
    where ge.grupo_id=p_grupo_id
  ) x;

  v_bajo := v_pista='PEQUENA'
    or v_nivel like '%INICIACION%'
    or v_nivel like '%DEBUT%'
    or (v_nivel not like '%B%' and v_nivel not like '%C%' and v_nivel not like '%D%' and v_nivel like '%A%');

  v_maximo := (case when v_bajo then 4 else 7 end) * greatest(v_entrenadores,1);

  if v_total = 1 and v_particular then
    v_valido := true;
    v_excepcion := true;
    v_requeridos := 1;
    v_motivo := 'Clase particular de 1 alumno válida.';

  elsif v_total <= 1 then
    v_valido := false;
    v_excepcion := false;
    v_requeridos := 1;
    v_motivo := format('Grupo Baby de %s alumno(s): no es una composición publicable.',v_total);

  elsif v_total = 2 then
    v_valido := true;
    v_excepcion := true;
    v_requeridos := 1;
    v_motivo := 'Grupo de 2 permitido como excepción de coordinación.';

  elsif v_bajo and v_total between 3 and 4 then
    v_valido := true;
    v_excepcion := false;
    v_requeridos := 1;
    v_motivo := null;

  elsif v_bajo and v_total between 5 and 7 then
    v_requeridos := 2;
    if v_entrenadores >= 2 then
      v_valido := true;
      v_excepcion := false;
      v_motivo := format('Grupo Baby bajo de %s alumnos válido con %s entrenadores.',v_total,v_entrenadores);
    else
      v_valido := false;
      v_excepcion := false;
      v_motivo := format('Grupo Baby bajo de %s alumnos: necesita 2 entrenadores antes de publicar.',v_total);
    end if;

  elsif not v_bajo and v_total between 3 and 7 then
    v_valido := true;
    v_excepcion := false;
    v_requeridos := 1;
    v_motivo := null;

  elsif v_total >= 8 then
    -- 25/11: 8 o más con 2+ entrenadores (se dividen en pista).
    v_requeridos := 2;
    if v_entrenadores >= 2 and v_total <= v_maximo then
      v_valido := true;
      v_excepcion := false;
      v_motivo := format('Grupo Baby de %s alumnos válido con %s entrenadores (se dividen en pista).',v_total,v_entrenadores);
    elsif v_entrenadores >= 2 then
      v_valido := false;
      v_excepcion := false;
      v_motivo := format('Grupo Baby de %s alumnos con %s entrenadores: el máximo es %s.',v_total,v_entrenadores,v_maximo);
    else
      v_valido := false;
      v_excepcion := false;
      v_motivo := format('Grupo Baby de %s alumnos: con 8 o más hace falta 2.º entrenador o crear 2 grupos.',v_total);
    end if;

  else
    v_valido := false;
    v_excepcion := false;
    v_motivo := 'El grupo Baby no tiene una composición publicable.';
  end if;

  return jsonb_build_object(
    'aplica',true,
    'valido',v_valido,
    'excepcion',v_excepcion,
    'total',v_total,
    'min_publicable',case when v_particular then 1 else 2 end,
    'max',case when v_particular then 1 when v_entrenadores >= 2 then greatest(7, v_maximo) else 7 end,
    'max_sin_apoyo',case when v_particular then 1 when v_bajo then 4 else 7 end,
    'tipo',case when v_particular then 'PARTICULAR' when v_bajo then 'INICIACION_A_A_PLUS_PISTA_PEQUENA' else 'PISTA_GRANDE_AUTONOMO' end,
    'entrenadores',v_entrenadores,
    'entrenadores_requeridos',v_requeridos,
    'motivo',v_motivo
  );
end;
$function$;
