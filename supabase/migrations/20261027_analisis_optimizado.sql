-- 20261027 (3) · Análisis: un solo cálculo, comparación justa del mes en curso
--
-- 1) obtener_analisis_admin_app calculaba la temporada activa DOS veces (una
--    para la pantalla y otra para la tabla de temporadas). Ahora reutiliza el
--    primer cálculo.
-- 2) obtener_analisis_admin_live_app:
--    - la «comparativa» interna se calculaba y luego se tiraba (la de verdad la
--      monta obtener_analisis_admin_app) → se deja vacía;
--    - la evolución técnica de cada mes se calculaba 4 veces → una sola;
--    - nuevo «tramo»: mes en curso del 1 a hoy contra los MISMOS días del mes
--      anterior (alumnos, altas, sesiones, asistencia, ocupación, por grupo);
--    - cada mes lleva «en_curso» (true en el mes de hoy).
-- El resto de cifras (resumen, mensual, niveles, progresiones) sale igual.
-- Se hace con cortes sobre la definición actual (sin copiarla a mano), y si
-- algún trozo no está donde se espera, se para y no cambia nada.
-- Rollback: supabase/rollback/20261027_analisis_optimizado_rollback.sql

do $migr$
declare
  def text;
  orig text;
  i int;
  j int;
  marca text;
begin
  -------------------------------------------------------------- live
  select pg_get_functiondef(p.oid) into def
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'obtener_analisis_admin_live_app';
  if def ~ 'evol_alumno_mes' then
    raise notice 'live ya optimizada';
  else
    orig := def;
    -- a) evolución por mes: un solo cálculo
    marca := '  mensual_base as (';
    if position(marca in def) = 0 then raise exception 'falta mensual_base'; end if;
    def := replace(def, marca,
'  evol_alumno_mes as (
    select date_trunc(''month'', rb.fecha)::date mes_inicio, rb.alumno_id,
      (array_agg(rb.orden order by rb.fecha,rb.momento))[1] primero,
      (array_agg(rb.orden order by rb.fecha desc,rb.momento desc))[1] ultimo
    from reportes_base rb
    group by 1, 2
  ),
  evol_mes as (
    select e.mes_inicio, avg(e.ultimo - e.primero) delta,
      count(*) filter (where e.ultimo > e.primero) mejoran,
      count(*) filter (where e.ultimo = e.primero) estables,
      count(*) filter (where e.ultimo < e.primero) bajan
    from evol_alumno_mes e
    group by e.mes_inicio
  ),
' || marca);

    i := position('      (select coalesce(avg(x.ultimo-x.primero),0) from (' in def);
    marca := ') x where x.ultimo<x.primero) bajan';
    j := position(marca in def);
    if i = 0 or j = 0 or j < i then raise exception 'no encuentro el bloque de evolución mensual'; end if;
    j := j + length(marca);
    if substr(def, j, length(E'\n    from meses m')) <> E'\n    from meses m' then
      raise exception 'el bloque de evolución no termina en from meses m';
    end if;
    def := substr(def, 1, i - 1)
      || '      coalesce(em.delta,0) delta, coalesce(em.mejoran,0) mejoran, coalesce(em.estables,0) estables, coalesce(em.bajan,0) bajan'
      || E'\n    from meses m\n    left join evol_mes em on em.mes_inicio = m.mes_inicio'
      || substr(def, j + length(E'\n    from meses m'));

    -- b) mes en curso marcado
    marca := '''mes'',to_char(m.mes_inicio,''YYYY-MM''),';
    if position(marca in def) = 0 then raise exception 'falta mes en mensual_json'; end if;
    def := replace(def, marca, marca || E'\n      ''en_curso'',(m.mes_inicio <= current_date and current_date <= m.mes_fin),');

    -- c) comparativa interna (no se usaba) → vacía; nuevo tramo
    i := position('  temporadas_comparables as (' in def);
    j := position(E'  select jsonb_build_object(\n    ''meta''' in def);
    if i = 0 or j = 0 or j < i then raise exception 'no encuentro la comparativa interna'; end if;
    def := substr(def, 1, i - 1) ||
'  comparativa as (select ''[]''::jsonb datos),
  tramo_rangos as (
    select
      date_trunc(''month'', current_date)::date act_ini,
      current_date act_fin,
      (date_trunc(''month'', current_date) - interval ''1 month'')::date ant_ini,
      least(
        (date_trunc(''month'', current_date) - interval ''1 month'')::date + (extract(day from current_date)::int - 1),
        (date_trunc(''month'', current_date) - interval ''1 day'')::date
      ) ant_fin
  ),
  tramo_calc as (
    select x.periodo, x.ini, x.fin,
      (select count(distinct p.alumno_id) from participantes p where p.fecha between x.ini and x.fin) alumnos,
      (select count(distinct mb.alumno_id) from membresias mb where mb.fecha_alta between x.ini and x.fin) altas,
      (select count(*) from sesiones_realizadas sr where sr.fecha between x.ini and x.fin) sesiones,
      (select count(*) from asistencia_base a where a.fecha between x.ini and x.fin and a.estado=''PRESENTE'') presentes,
      (select count(*) from asistencia_base a where a.fecha between x.ini and x.fin and a.estado=''AUSENTE'') ausentes,
      (select count(*) from (select distinct p.evento_id,p.alumno_id from participantes p where p.fecha between x.ini and x.fin) q) asig_turno,
      (select count(*) from grupo_asignaciones ga where ga.fecha between x.ini and x.fin) asig_grupo,
      (select count(*) from grupo_defs gd where gd.fecha between x.ini and x.fin) grupos,
      (select coalesce(sum(gd.capacidad),0) from grupo_defs gd where gd.fecha between x.ini and x.fin) capacidad
    from tramo_rangos r
    cross join lateral (values (''actual'', r.act_ini, r.act_fin), (''anterior'', r.ant_ini, r.ant_fin)) x(periodo, ini, fin)
  ),
  tramo_obj as (
    select tc.periodo, jsonb_build_object(
      ''desde'', tc.ini, ''hasta'', tc.fin,
      ''alumnos'', tc.alumnos, ''altas'', tc.altas, ''sesiones'', tc.sesiones,
      ''asistencia_real_pct'', case when tc.presentes+tc.ausentes>0 then round(100.0*tc.presentes/(tc.presentes+tc.ausentes),1) end,
      ''ocupacion_pct'', case when tc.capacidad>0 then round(100.0*tc.asig_grupo/tc.capacidad,1) end,
      ''promedio_por_grupo'', case when tc.grupos>0 then round(tc.asig_grupo::numeric/tc.grupos,2) end,
      ''promedio_ninos_turno'', case when tc.sesiones>0 then round(tc.asig_turno::numeric/tc.sesiones,2) end
    ) datos
    from tramo_calc tc
  ),
  tramo_json as (
    select case
      when current_date between (select fecha_inicio from sel) and (select fecha_fin from sel) then
        jsonb_build_object(
          ''dias'', extract(day from current_date)::int,
          ''actual'', (select o.datos from tramo_obj o where o.periodo = ''actual''),
          ''anterior'', case
            when (select ant_ini from tramo_rangos) >= date_trunc(''month'', (select fecha_inicio from sel))::date
            then (select o.datos from tramo_obj o where o.periodo = ''anterior'')
          end
        )
    end datos
  )
' || substr(def, j);

    marca := '''comparativa_temporadas'',cj.datos,';
    if position(marca in def) = 0 then raise exception 'falta comparativa_temporadas en la salida'; end if;
    def := replace(def, marca, marca || E'\n    ''tramo'',tj.datos,');
    marca := 'cross join comparativa cj';
    if position(marca in def) = 0 then raise exception 'falta cross join comparativa'; end if;
    def := replace(def, marca, marca || ' cross join tramo_json tj');

    execute def;
    -- copia exacta de la versión anterior, para el rollback
    execute format('comment on function public.obtener_analisis_admin_live_app(uuid,text) is %L',
                   'ROLLBACK_20261027:' || orig);
  end if;

  -------------------------------------------------------------- envoltorio
  select pg_get_functiondef(p.oid) into def
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.proname = 'obtener_analisis_admin_app';
  marca := 'cross join lateral public.obtener_analisis_admin_live_app(t.id, v_modalidad) live';
  if position('reutiliza el cálculo' in def) > 0 then
    raise notice 'envoltorio ya optimizado';
  elsif position(marca in def) = 0 then
    raise exception 'no encuentro la segunda llamada al cálculo';
  else
    orig := def;
    def := replace(def, marca,
'cross join lateral (
        -- reutiliza el cálculo de arriba si es la misma temporada
        select case
          when t.id = v_target_id and v_target_activa then v_payload
          else (select l.payload from public.obtener_analisis_admin_live_app(t.id, v_modalidad) l limit 1)
        end as payload
      ) live');
    execute def;
    execute format('comment on function public.obtener_analisis_admin_app(uuid,text) is %L',
                   'ROLLBACK_20261027:' || orig);
  end if;
end $migr$;
