-- Cancelados AimHarder, 2ª parte (05/11/2026)
--
-- 1. Invitados: si un niño cancela su reserva normal pero oficina lo apunta como
--    INVITADO en esa misma clase (recupera un entreno), NO está cancelado.
--    Y al revés: si solo venía como invitado y esa invitación se cancela (y no
--    tiene otra reserva ni invitación activa), SÍ está cancelado.
--    El invitado se reconoce por el nombre (todas las palabras del nombre del
--    invitado están en el nombre de la ficha, mínimo 2), en la misma clase
--    (día, hora y modalidad).
-- 2. repaso_cancelados_aimharder_app: por cada turno, cuántos niños hay y hace
--    cuánto se comprobó el más antiguo (para saber si fiarse).
-- 3. planificar_club: los niños apuntados en la app pasan por delante:
--    hoy y mañana, cada 4 h con prioridad urgente (9); resto de la semana,
--    cada 12 h con prioridad 6 (antes iban a la cola general y algunos
--    llevaban 7 días sin comprobar).
-- Rollback: 20261105_cancelados_invitados_y_repaso_rollback.sql

create or replace function aimharder_sync.invitado_coincide(p_invitado text, p_ficha text)
returns boolean
language sql
immutable
set search_path = public, pg_temp
as $$
  with g as (select array_remove(regexp_split_to_array(public.normalizar_nombre_app(p_invitado), ' '), '') t),
       f as (select array_remove(regexp_split_to_array(public.normalizar_nombre_app(p_ficha), ' '), '') t)
  select coalesce(array_length(g.t, 1), 0) >= 2 and g.t <@ f.t from g, f;
$$;

create or replace function public.cancelados_aimharder_app(p_desde date default null, p_hasta date default null)
returns table (
  sesion_id uuid,
  sesion_alumno_id uuid,
  fecha date,
  hora_inicio text,
  modalidad text,
  alumno_id uuid,
  alumno text,
  cancelada_at timestamp,
  visto_at timestamptz,
  grupo_id uuid,
  grupo text,
  grupo_publicado boolean,
  protegido boolean
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
#variable_conflict use_column
begin
  if not (coalesce(auth.role(), '') = 'service_role' or public.es_coordinacion_operativa_app()) then
    raise exception 'No tienes permiso para ver los cancelados de AimHarder.';
  end if;

  return query
  with ses as (
    select s.id, s.fecha, to_char(s.hora_inicio, 'HH24:MI') hora, m.nombre modalidad
    from public.sesiones s
    join public.modalidades m on m.id = s.modalidad_id
    where s.fecha between coalesce(p_desde, current_date) and coalesce(p_hasta, current_date + 13)
  ), apuntados as (
    select x.id sesion_alumno_id, x.sesion_id, x.alumno_id, ses.fecha, ses.hora, ses.modalidad,
           a.nombre_completo, v.cid
    from ses
    join public.sesion_alumnos_operativa x on x.sesion_id = ses.id
    join public.alumnos a on a.id = x.alumno_id
    left join aimharder_sync.alumno_vinculo v on v.alumno_id = x.alumno_id
    where not exists (
      select 1 from public.aimharder_cancelados_ignorados_app i
      where i.sesion_id = x.sesion_id and i.alumno_id = x.alumno_id
    )
  ), activo as (
    -- ¿Tiene algo activo en esa clase? reserva normal o invitación.
    select p.sesion_alumno_id,
      exists (
        select 1 from aimharder_sync.reservas r2
        where r2.cid = p.cid and r2.dia = p.fecha and r2.hora = p.hora and r2.cancelada_at is null
          and aimharder_sync.modalidad_de(r2.clase) = upper(p.modalidad)
      )
      or exists (
        select 1 from aimharder_sync.invitados i
        where i.dia = p.fecha and i.hora = p.hora and i.cancelada_at is null
          and aimharder_sync.modalidad_de(i.actividad) = upper(p.modalidad)
          and aimharder_sync.invitado_coincide(concat_ws(' ', i.nombre, i.apellido1, i.apellido2), p.nombre_completo)
      ) as tiene_activo
    from apuntados p
  ), canc as (
    select p.*, c.cancelada_at, c.visto_at
    from apuntados p
    join activo ac on ac.sesion_alumno_id = p.sesion_alumno_id and not ac.tiene_activo
    cross join lateral (
      select max(x.cancelada_at) cancelada_at, max(x.visto_at) visto_at
      from (
        select r.cancelada_at, r.visto_at
        from aimharder_sync.reservas r
        where r.cid = p.cid and r.dia = p.fecha and r.hora = p.hora and r.cancelada_at is not null
          and aimharder_sync.modalidad_de(r.clase) = upper(p.modalidad)
        union all
        select i.cancelada_at, i.visto_at
        from aimharder_sync.invitados i
        where i.dia = p.fecha and i.hora = p.hora and i.cancelada_at is not null
          and aimharder_sync.modalidad_de(i.actividad) = upper(p.modalidad)
          and aimharder_sync.invitado_coincide(concat_ws(' ', i.nombre, i.apellido1, i.apellido2), p.nombre_completo)
      ) x
    ) c
    where c.cancelada_at is not null
  )
  select c.sesion_id, c.sesion_alumno_id, c.fecha, c.hora, c.modalidad, c.alumno_id,
         coalesce(c.nombre_completo, 'Alumno'), c.cancelada_at, c.visto_at,
         g.id, g.nombre_grupo, coalesce(g.publicado, false),
         exists (select 1 from public.reportes rp join public.grupos gr on gr.id = rp.grupo_id
                 where gr.sesion_id = c.sesion_id and rp.alumno_id = c.alumno_id)
         or exists (select 1 from public.grupo_alumnos ga join public.grupos gr on gr.id = ga.grupo_id
                    where gr.sesion_id = c.sesion_id and ga.alumno_id = c.alumno_id
                      and lower(trim(coalesce(ga.estado_asistencia, 'Pendiente'))) in ('presente', 'ausente'))
  from canc c
  left join lateral (
    select gr.id, gr.nombre_grupo, gr.publicado
    from public.grupo_alumnos ga join public.grupos gr on gr.id = ga.grupo_id
    where gr.sesion_id = c.sesion_id and ga.alumno_id = c.alumno_id and not coalesce(gr.cancelado, false)
    order by gr.created_at
    limit 1
  ) g on true
  order by c.fecha, c.hora, c.modalidad, 7;
end;
$$;

revoke all on function public.cancelados_aimharder_app(date, date) from public, anon;
grant execute on function public.cancelados_aimharder_app(date, date) to authenticated, service_role;

-- ---- 2. Repaso por turno -----------------------------------------------------
create or replace function public.repaso_cancelados_aimharder_app(p_desde date default null, p_hasta date default null)
returns table (
  sesion_id uuid,
  fecha date,
  hora_inicio text,
  modalidad text,
  ninos integer,
  sin_vincular integer,
  repaso_mas_antiguo timestamptz,
  invitados_at timestamptz
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
#variable_conflict use_column
begin
  if not (coalesce(auth.role(), '') = 'service_role' or public.es_coordinacion_operativa_app()) then
    raise exception 'No tienes permiso para ver el repaso de AimHarder.';
  end if;

  return query
  select s.id, s.fecha, to_char(s.hora_inicio, 'HH24:MI'), m.nombre,
         count(x.id)::integer,
         count(x.id) filter (where v.cid is null)::integer,
         min(c.reservas_sync_at),
         (select b.finished_at from aimharder_sync.barrido b where b.tipo = 'invitados')
  from public.sesiones s
  join public.modalidades m on m.id = s.modalidad_id
  join public.sesion_alumnos_operativa x on x.sesion_id = s.id
  left join aimharder_sync.alumno_vinculo v on v.alumno_id = x.alumno_id
  left join aimharder_sync.clientes c on c.cid = v.cid
  where s.fecha between coalesce(p_desde, current_date) and coalesce(p_hasta, current_date + 6)
  group by s.id, s.fecha, s.hora_inicio, m.nombre
  order by s.fecha, s.hora_inicio, m.nombre;
end;
$$;

revoke all on function public.repaso_cancelados_aimharder_app(date, date) from public, anon;
grant execute on function public.repaso_cancelados_aimharder_app(date, date) to authenticated, service_role;

-- ---- 3. Prioridad para los niños apuntados ----------------------------------
create or replace function aimharder_sync.planificar_club()
 returns void
 language plpgsql
 set search_path to 'aimharder_sync', 'pg_temp'
as $function$
declare
  v_local timestamp := now() at time zone 'Europe/Madrid';
  v_hoy date := (now() at time zone 'Europe/Madrid')::date;
  v_dow int := extract(isodow from (now() at time zone 'Europe/Madrid'));
  v_domingo date;
begin
  -- Activo desde el lunes 9:00 hasta el domingo; de noche (0-6 h) no.
  if extract(hour from v_local) < 6 then return; end if;
  if v_dow = 1 and extract(hour from v_local) < 9 then return; end if;
  v_domingo := v_hoy + (7 - v_dow);

  insert into aimharder_sync.cola (cid, prioridad, motivo)
  select x.cid, max(x.prio), case when max(x.prio) >= 6 then 'apuntados_app' else 'semana_club' end
  from (
    select h.cid,
           case when k.fecha <= v_hoy + 1 then 5 else 4 end prio,
           case when k.fecha <= v_hoy + 1 then interval '3 hours' else interval '10 hours' end cada
    from aimharder_sync.clases k
    cross join lateral aimharder_sync.habituales_clase(k.fecha, k.schedule_id) h
    where k.fecha between v_hoy and v_domingo
      and not k.cancelada
      and aimharder_sync.modalidad_de(k.nombre) is not null
    union all
    -- 05/11: niños ya apuntados en la app. Hoy y mañana, urgente cada 4 h;
    -- el resto de la semana, cada 12 h por delante de los habituales.
    select v.cid,
           case when s.fecha <= v_hoy + 1 then 9 else 6 end,
           case when s.fecha <= v_hoy + 1 then interval '4 hours' else interval '12 hours' end
    from public.sesiones s
    join public.sesion_alumnos_operativa sa on sa.sesion_id = s.id
    join aimharder_sync.alumno_vinculo v on v.alumno_id = sa.alumno_id
    where s.fecha between v_hoy and greatest(v_domingo, v_hoy + 1)
  ) x
  join aimharder_sync.clientes c on c.cid = x.cid
  where c.fecha_baja is null
    and coalesce(c.reservas_sync_at, 'epoch'::timestamptz) < now() - x.cada
  group by x.cid
  on conflict (cid) do update set prioridad = greatest(aimharder_sync.cola.prioridad, excluded.prioridad),
    motivo = case when excluded.prioridad > aimharder_sync.cola.prioridad then excluded.motivo else aimharder_sync.cola.motivo end;
end $function$;
