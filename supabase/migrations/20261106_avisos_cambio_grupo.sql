-- Avisos de cambios en grupos publicados para el entrenador (06/11/2026)
--
-- Cuando un grupo YA PUBLICADO (de hoy en adelante) cambia, cada entrenador de
-- ese grupo ve al abrir su app qué ha cambiado (sin push):
--   · entra / sale un niño;
--   · le asignan o le quitan el grupo (principal, segundo o tercero);
--   · cambia el punto de encuentro o la pista.
-- Se apunta solo, desde la base de datos (triggers), venga el cambio de donde
-- venga. Al leer se resume: entrar y salir el mismo niño se anula, varios
-- cambios de punto se quedan en el último, etc. «Entendido» los marca vistos.
--
-- Rollback: 20261106_avisos_cambio_grupo_rollback.sql

create table if not exists public.avisos_cambio_grupo_app (
  id uuid primary key default gen_random_uuid(),
  entrenador_id uuid not null references public.entrenadores(id) on delete cascade,
  grupo_id uuid references public.grupos(id) on delete set null,
  grupo_nombre text,
  sesion_fecha date not null,
  hora_inicio text,
  modalidad text,
  tipo text not null check (tipo in ('nino_entra', 'nino_sale', 'grupo_asignado', 'grupo_retirado', 'punto', 'pista')),
  alumno_id uuid,
  valor text,
  created_at timestamptz not null default now(),
  visto_at timestamptz
);
create index if not exists idx_avisos_cambio_grupo_entrenador
  on public.avisos_cambio_grupo_app (entrenador_id, visto_at, sesion_fecha);
alter table public.avisos_cambio_grupo_app enable row level security;
revoke all on public.avisos_cambio_grupo_app from anon, authenticated;

-- Apunta un cambio para los entrenadores del grupo (o solo para uno).
create or replace function public.registrar_aviso_cambio_grupo_app(
  p_grupo_id uuid, p_tipo text, p_alumno_id uuid default null, p_valor text default null, p_solo_entrenador uuid default null
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare g record;
begin
  select gr.id, gr.nombre_grupo, gr.publicado, coalesce(gr.cancelado, false) cancelado,
         s.fecha, to_char(s.hora_inicio, 'HH24:MI') hora, m.nombre modalidad
    into g
  from public.grupos gr
  join public.sesiones s on s.id = gr.sesion_id
  left join public.modalidades m on m.id = s.modalidad_id
  where gr.id = p_grupo_id;
  if not found or not g.publicado or g.cancelado then return; end if;
  if g.fecha < (now() at time zone 'Europe/Madrid')::date then return; end if;

  insert into public.avisos_cambio_grupo_app (entrenador_id, grupo_id, grupo_nombre, sesion_fecha, hora_inicio, modalidad, tipo, alumno_id, valor)
  select x.entrenador_id, g.id, g.nombre_grupo, g.fecha, g.hora, g.modalidad, p_tipo, p_alumno_id, p_valor
  from (
    select p_solo_entrenador entrenador_id where p_solo_entrenador is not null
    union
    select ae.entrenador_id from public.asignaciones_entrenadores ae
      where p_solo_entrenador is null and ae.grupo_id = p_grupo_id and ae.entrenador_id is not null
    union
    select ge.entrenador_id from public.grupo_entrenadores_extra_app ge
      where p_solo_entrenador is null and ge.grupo_id = p_grupo_id
  ) x
  where x.entrenador_id is not null;
end;
$$;
revoke all on function public.registrar_aviso_cambio_grupo_app(uuid, text, uuid, text, uuid) from public, anon, authenticated;

-- ---- Triggers -----------------------------------------------------------------
create or replace function public.trg_aviso_cambio_alumnos_app()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if tg_op = 'INSERT' then
    perform public.registrar_aviso_cambio_grupo_app(new.grupo_id, 'nino_entra', new.alumno_id);
  elsif tg_op = 'DELETE' then
    perform public.registrar_aviso_cambio_grupo_app(old.grupo_id, 'nino_sale', old.alumno_id);
  elsif tg_op = 'UPDATE' and new.grupo_id is distinct from old.grupo_id then
    perform public.registrar_aviso_cambio_grupo_app(old.grupo_id, 'nino_sale', old.alumno_id);
    perform public.registrar_aviso_cambio_grupo_app(new.grupo_id, 'nino_entra', new.alumno_id);
  end if;
  return null;
exception when others then
  -- Un aviso nunca debe impedir el cambio real.
  raise warning 'aviso_cambio_alumnos: %', sqlerrm;
  return null;
end; $$;

create or replace function public.trg_aviso_cambio_entrenador_app()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if tg_op = 'INSERT' then
    perform public.registrar_aviso_cambio_grupo_app(new.grupo_id, 'grupo_asignado', null, null, new.entrenador_id);
  elsif tg_op = 'DELETE' then
    perform public.registrar_aviso_cambio_grupo_app(old.grupo_id, 'grupo_retirado', null, null, old.entrenador_id);
  elsif tg_op = 'UPDATE' and new.entrenador_id is distinct from old.entrenador_id then
    perform public.registrar_aviso_cambio_grupo_app(old.grupo_id, 'grupo_retirado', null, null, old.entrenador_id);
    perform public.registrar_aviso_cambio_grupo_app(new.grupo_id, 'grupo_asignado', null, null, new.entrenador_id);
  end if;
  return null;
exception when others then
  raise warning 'aviso_cambio_entrenador: %', sqlerrm;
  return null;
end; $$;

create or replace function public.trg_aviso_cambio_grupo_datos_app()
returns trigger language plpgsql security definer set search_path = public, pg_temp as $$
begin
  if coalesce(old.publicado, false) and coalesce(new.publicado, false) then
    if new.punto_encuentro is distinct from old.punto_encuentro then
      perform public.registrar_aviso_cambio_grupo_app(new.id, 'punto', null, new.punto_encuentro);
    end if;
    if new.pista is distinct from old.pista then
      perform public.registrar_aviso_cambio_grupo_app(new.id, 'pista', null, new.pista);
    end if;
  end if;
  return null;
exception when others then
  raise warning 'aviso_cambio_grupo: %', sqlerrm;
  return null;
end; $$;

drop trigger if exists trg_aviso_cambio_alumnos on public.grupo_alumnos;
create trigger trg_aviso_cambio_alumnos after insert or delete or update of grupo_id on public.grupo_alumnos
  for each row execute function public.trg_aviso_cambio_alumnos_app();

drop trigger if exists trg_aviso_cambio_principal on public.asignaciones_entrenadores;
create trigger trg_aviso_cambio_principal after insert or delete or update of entrenador_id on public.asignaciones_entrenadores
  for each row execute function public.trg_aviso_cambio_entrenador_app();

drop trigger if exists trg_aviso_cambio_extra on public.grupo_entrenadores_extra_app;
create trigger trg_aviso_cambio_extra after insert or delete or update of entrenador_id on public.grupo_entrenadores_extra_app
  for each row execute function public.trg_aviso_cambio_entrenador_app();

drop trigger if exists trg_aviso_cambio_grupo on public.grupos;
create trigger trg_aviso_cambio_grupo after update of punto_encuentro, pista on public.grupos
  for each row execute function public.trg_aviso_cambio_grupo_datos_app();

-- ---- Lectura resumida ---------------------------------------------------------
-- Una fila por cambio real que queda: niños (entra/sale neto), grupo
-- asignado/retirado (neto) y último punto/pista. Si al entrenador le han
-- asignado o quitado el grupo, no se listan además los niños de ese grupo.
create or replace function public.resumen_avisos_cambio_grupo_app(p_entrenador_id uuid)
returns table (
  grupo_id uuid, grupo_nombre text, sesion_fecha date, hora_inicio text, modalidad text,
  tipo text, alumno text, valor text, ultimo_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with base as (
    select a.* from public.avisos_cambio_grupo_app a
    where a.entrenador_id = p_entrenador_id and a.visto_at is null
      and a.sesion_fecha >= (now() at time zone 'Europe/Madrid')::date
  ), asignacion as (
    select b.grupo_id, max(b.grupo_nombre) grupo_nombre, max(b.sesion_fecha) sesion_fecha, max(b.hora_inicio) hora_inicio,
           max(b.modalidad) modalidad,
           sum(case b.tipo when 'grupo_asignado' then 1 else -1 end) neto, max(b.created_at) ultimo_at
    from base b where b.tipo in ('grupo_asignado', 'grupo_retirado')
    group by b.grupo_id
  ), ninos as (
    select b.grupo_id, max(b.grupo_nombre) grupo_nombre, max(b.sesion_fecha) sesion_fecha, max(b.hora_inicio) hora_inicio,
           max(b.modalidad) modalidad, b.alumno_id,
           sum(case b.tipo when 'nino_entra' then 1 else -1 end) neto, max(b.created_at) ultimo_at
    from base b where b.tipo in ('nino_entra', 'nino_sale')
    group by b.grupo_id, b.alumno_id
  ), datos as (
    select distinct on (b.grupo_id, b.tipo) b.grupo_id, b.grupo_nombre, b.sesion_fecha, b.hora_inicio, b.modalidad,
           b.tipo, b.valor, b.created_at ultimo_at
    from base b where b.tipo in ('punto', 'pista')
    order by b.grupo_id, b.tipo, b.created_at desc
  )
  select x.grupo_id, x.grupo_nombre, x.sesion_fecha, x.hora_inicio, x.modalidad,
         case when x.neto > 0 then 'grupo_asignado' else 'grupo_retirado' end, null::text, null::text, x.ultimo_at
  from asignacion x where x.neto <> 0
  union all
  select n.grupo_id, n.grupo_nombre, n.sesion_fecha, n.hora_inicio, n.modalidad,
         case when n.neto > 0 then 'nino_entra' else 'nino_sale' end, al.nombre_completo, null::text, n.ultimo_at
  from ninos n
  left join public.alumnos al on al.id = n.alumno_id
  where n.neto <> 0
    and not exists (select 1 from asignacion x where x.grupo_id is not distinct from n.grupo_id and x.neto <> 0)
  union all
  select d.grupo_id, d.grupo_nombre, d.sesion_fecha, d.hora_inicio, d.modalidad, d.tipo, null::text, d.valor, d.ultimo_at
  from datos d
  where not exists (select 1 from asignacion x where x.grupo_id is not distinct from d.grupo_id and x.neto <> 0)
  order by 3, 4, 2, 6, 7;
$$;
revoke all on function public.resumen_avisos_cambio_grupo_app(uuid) from public, anon, authenticated;

-- El entrenador: sus cambios sin ver.
create or replace function public.mis_avisos_cambio_grupo_app()
returns table (
  grupo_id uuid, grupo_nombre text, sesion_fecha date, hora_inicio text, modalidad text,
  tipo text, alumno text, valor text, ultimo_at timestamptz
)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select * from public.resumen_avisos_cambio_grupo_app(public.entrenador_actual_app())
  where public.entrenador_actual_app() is not null;
$$;
revoke all on function public.mis_avisos_cambio_grupo_app() from public, anon;
grant execute on function public.mis_avisos_cambio_grupo_app() to authenticated;

-- «Entendido»: marca vistos los que había hasta que se cargó la lista.
create or replace function public.marcar_avisos_cambio_grupo_vistos_app(p_hasta timestamptz)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_entrenador uuid := public.entrenador_actual_app();
begin
  if v_entrenador is null then raise exception 'Solo para entrenadores.'; end if;
  update public.avisos_cambio_grupo_app
     set visto_at = now()
   where entrenador_id = v_entrenador and visto_at is null and created_at <= coalesce(p_hasta, now());
end;
$$;
revoke all on function public.marcar_avisos_cambio_grupo_vistos_app(timestamptz) from public, anon;
grant execute on function public.marcar_avisos_cambio_grupo_vistos_app(timestamptz) to authenticated;

-- Coordinación: cuántos cambios sin ver tiene cada entrenador.
create or replace function public.avisos_cambio_grupo_pendientes_app()
returns table (entrenador_id uuid, pendientes integer)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
#variable_conflict use_column
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso.';
  end if;
  return query
  select e.entrenador_id, count(*)::integer
  from (select distinct a.entrenador_id from public.avisos_cambio_grupo_app a
        where a.visto_at is null and a.sesion_fecha >= (now() at time zone 'Europe/Madrid')::date) e
  cross join lateral public.resumen_avisos_cambio_grupo_app(e.entrenador_id) r
  group by e.entrenador_id;
end;
$$;
revoke all on function public.avisos_cambio_grupo_pendientes_app() from public, anon;
grant execute on function public.avisos_cambio_grupo_pendientes_app() to authenticated;
