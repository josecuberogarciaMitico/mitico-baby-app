-- Cancelados en AimHarder que siguen apuntados en la app (03/11/2026)
--
-- Problema: una familia cancela la clase en AimHarder, pero el niño sigue en la
-- sesión y en su grupo de la app, y nadie se entera hasta que se refresca el
-- listado a mano.
--
-- 1. cancelados_aimharder_app(desde, hasta): cruza la sesión de la app con las
--    reservas que ya lee el sincronizador (aimharder_sync.reservas). Devuelve
--    los niños apuntados cuya reserva de ese día, hora y modalidad está
--    cancelada y que no tienen otra reserva activa en esa misma clase.
--    Solo lectura. Coordinación o service_role (Paco).
-- 2. Tabla de «dejar» (aimharder_cancelados_ignorados_app) + RPC
--    dejar_cancelado_aimharder_app: si coordinación decide mantener al niño
--    (p. ej. viene igualmente), deja de salir en la lista.
-- 3. planificar_club: los niños que ya están en las sesiones de la app esta
--    semana se re-leen igual que los habituales de la clase (cada 10 h y cada
--    3 h el día anterior y el mismo día), aunque no sean «habituales».
--
-- Quitar al niño NO es nuevo: la app usa la función que ya existe
-- quitar_alumno_sesion_aimharder_sync_app (no quita si tiene asistencia o
-- reporte). Rollback: 20261103_cancelados_aimharder_rollback.sql

-- ---- 2. «Dejar» -------------------------------------------------------------
create table if not exists public.aimharder_cancelados_ignorados_app (
  sesion_id uuid not null references public.sesiones(id) on delete cascade,
  alumno_id uuid not null references public.alumnos(id) on delete cascade,
  ignorado_por uuid,
  created_at timestamptz not null default now(),
  primary key (sesion_id, alumno_id)
);
alter table public.aimharder_cancelados_ignorados_app enable row level security;
-- Sin políticas: solo se toca desde las funciones de abajo.
revoke all on public.aimharder_cancelados_ignorados_app from anon, authenticated;

-- ---- 1. Lista de cancelados -------------------------------------------------
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
  ), canc as (
    select x.id sesion_alumno_id, x.sesion_id, x.alumno_id, ses.fecha, ses.hora, ses.modalidad,
           max(r.cancelada_at) cancelada_at, max(r.visto_at) visto_at
    from ses
    join public.sesion_alumnos_operativa x on x.sesion_id = ses.id
    join aimharder_sync.alumno_vinculo v on v.alumno_id = x.alumno_id
    join aimharder_sync.reservas r
      on r.cid = v.cid and r.dia = ses.fecha and r.hora = ses.hora and r.cancelada_at is not null
    where aimharder_sync.modalidad_de(r.clase) = upper(ses.modalidad)
      -- Si volvió a reservar esa misma clase, no está cancelado.
      and not exists (
        select 1 from aimharder_sync.reservas r2
        where r2.cid = v.cid and r2.dia = ses.fecha and r2.hora = ses.hora and r2.cancelada_at is null
          and aimharder_sync.modalidad_de(r2.clase) = upper(ses.modalidad)
      )
      and not exists (
        select 1 from public.aimharder_cancelados_ignorados_app i
        where i.sesion_id = x.sesion_id and i.alumno_id = x.alumno_id
      )
    group by x.id, x.sesion_id, x.alumno_id, ses.fecha, ses.hora, ses.modalidad
  )
  select c.sesion_id, c.sesion_alumno_id, c.fecha, c.hora, c.modalidad, c.alumno_id,
         coalesce(a.nombre_completo, 'Alumno'), c.cancelada_at, c.visto_at,
         g.id, g.nombre_grupo, coalesce(g.publicado, false),
         exists (select 1 from public.reportes rp join public.grupos gr on gr.id = rp.grupo_id
                 where gr.sesion_id = c.sesion_id and rp.alumno_id = c.alumno_id)
         or exists (select 1 from public.grupo_alumnos ga join public.grupos gr on gr.id = ga.grupo_id
                    where gr.sesion_id = c.sesion_id and ga.alumno_id = c.alumno_id
                      and lower(trim(coalesce(ga.estado_asistencia, 'Pendiente'))) in ('presente', 'ausente'))
  from canc c
  left join public.alumnos a on a.id = c.alumno_id
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

create or replace function public.dejar_cancelado_aimharder_app(p_sesion_id uuid, p_alumno_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso para realizar esta acción operativa.';
  end if;
  insert into public.aimharder_cancelados_ignorados_app (sesion_id, alumno_id, ignorado_por)
  values (p_sesion_id, p_alumno_id, auth.uid())
  on conflict (sesion_id, alumno_id) do nothing;
end;
$$;

revoke all on function public.dejar_cancelado_aimharder_app(uuid, uuid) from public, anon;
grant execute on function public.dejar_cancelado_aimharder_app(uuid, uuid) to authenticated;

-- ---- 3. Re-leer también a los niños ya apuntados en la app ----------------
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
  select x.cid, max(x.prio), 'semana_club'
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
    -- 03/11: niños ya apuntados en las sesiones de la app (para ver a tiempo si cancelan).
    select v.cid,
           case when s.fecha <= v_hoy + 1 then 5 else 4 end,
           case when s.fecha <= v_hoy + 1 then interval '3 hours' else interval '10 hours' end
    from public.sesiones s
    join public.sesion_alumnos_operativa sa on sa.sesion_id = s.id
    join aimharder_sync.alumno_vinculo v on v.alumno_id = sa.alumno_id
    where s.fecha between v_hoy and v_domingo
  ) x
  join aimharder_sync.clientes c on c.cid = x.cid
  where c.fecha_baja is null
    and coalesce(c.reservas_sync_at, 'epoch'::timestamptz) < now() - x.cada
  group by x.cid
  on conflict (cid) do update set prioridad = greatest(aimharder_sync.cola.prioridad, excluded.prioridad),
    motivo = case when excluded.prioridad > aimharder_sync.cola.prioridad then excluded.motivo else aimharder_sync.cola.motivo end;
end $function$;
