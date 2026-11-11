-- 11/11/2026 · Niños apuntados en varios turnos la misma semana.
-- Caso típico: oficina apunta a un niño como INVITADO el día al que se cambia
-- y no le quita la reserva del día de siempre → sale en los dos turnos.
-- A veces es real (viene varios días): «Es correcto» deja de avisar de ese
-- niño esa semana. Baby y Ocio; Intensivos y Particulares no cuentan.
-- Rollback: 20261111_repetidos_semana_rollback.sql

create table if not exists public.repetidos_semana_ignorados_app (
  alumno_id uuid not null references public.alumnos(id) on delete cascade,
  semana_inicio date not null,
  created_at timestamptz not null default now(),
  created_by uuid default auth.uid(),
  primary key (alumno_id, semana_inicio)
);
alter table public.repetidos_semana_ignorados_app enable row level security;
revoke all on public.repetidos_semana_ignorados_app from anon, authenticated;

create or replace function public.repetidos_semana_app(p_desde date default null, p_hasta date default null)
returns table (
  semana_inicio date,
  alumno_id uuid,
  alumno text,
  sesion_id uuid,
  sesion_alumno_id uuid,
  fecha date,
  hora_inicio text,
  modalidad text,
  invitado boolean,
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
declare
  v_hoy date := (now() at time zone 'Europe/Madrid')::date;
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso.';
  end if;

  return query
  with t as (
    select date_trunc('week', s.fecha)::date sem, x.alumno_id, a.nombre_completo, s.id sid, x.id said, s.fecha,
           to_char(s.hora_inicio, 'HH24:MI') hora, m.nombre modalidad
    from public.sesion_alumnos_operativa x
    join public.sesiones s on s.id = x.sesion_id
    join public.modalidades m on m.id = s.modalidad_id
    join public.alumnos a on a.id = x.alumno_id
    where s.fecha between date_trunc('week', coalesce(p_desde, v_hoy))::date and coalesce(p_hasta, v_hoy + 13)
      and upper(m.codigo) in ('BABY', 'OCIO')
  ), rep as (
    select t.sem, t.alumno_id
    from t
    group by t.sem, t.alumno_id
    having count(*) > 1 and max(t.fecha) >= v_hoy
  )
  select t.sem, t.alumno_id, t.nombre_completo, t.sid, t.said, t.fecha, t.hora, t.modalidad,
         exists (
           select 1 from aimharder_sync.invitados i
           where i.dia = t.fecha and i.hora = t.hora and i.cancelada_at is null
             and aimharder_sync.modalidad_de(i.actividad) = upper(t.modalidad)
             and aimharder_sync.invitado_coincide(concat_ws(' ', i.nombre, i.apellido1, i.apellido2), t.nombre_completo)
         ),
         g.nombre_grupo, coalesce(g.publicado, false),
         exists (select 1 from public.reportes rp join public.grupos gr on gr.id = rp.grupo_id
                 where gr.sesion_id = t.sid and rp.alumno_id = t.alumno_id)
         or exists (select 1 from public.grupo_alumnos ga join public.grupos gr on gr.id = ga.grupo_id
                    where gr.sesion_id = t.sid and ga.alumno_id = t.alumno_id
                      and lower(trim(coalesce(ga.estado_asistencia, 'Pendiente'))) in ('presente', 'ausente'))
  from t
  join rep on rep.sem = t.sem and rep.alumno_id = t.alumno_id
  left join lateral (
    select gr.nombre_grupo, gr.publicado
    from public.grupo_alumnos ga join public.grupos gr on gr.id = ga.grupo_id
    where gr.sesion_id = t.sid and ga.alumno_id = t.alumno_id and not coalesce(gr.cancelado, false)
    order by gr.created_at
    limit 1
  ) g on true
  where not exists (
    select 1 from public.repetidos_semana_ignorados_app i
    where i.alumno_id = t.alumno_id and i.semana_inicio = t.sem
  )
  order by t.sem, t.nombre_completo, t.fecha, t.hora;
end;
$$;
revoke all on function public.repetidos_semana_app(date, date) from public, anon;
grant execute on function public.repetidos_semana_app(date, date) to authenticated;

create or replace function public.dejar_repetido_semana_app(p_alumno_id uuid, p_semana_inicio date)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso.';
  end if;
  insert into public.repetidos_semana_ignorados_app (alumno_id, semana_inicio)
  values (p_alumno_id, date_trunc('week', p_semana_inicio)::date)
  on conflict do nothing;
end;
$$;
revoke all on function public.dejar_repetido_semana_app(uuid, date) from public, anon;
grant execute on function public.dejar_repetido_semana_app(uuid, date) to authenticated;
