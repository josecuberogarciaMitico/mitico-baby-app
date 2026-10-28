-- 20261028 · Propuestas de cambio de turno a familias (tabla «Niños sin colocar»)
--
-- Cuando un niño no cabe en su turno, coordinación manda a la familia un
-- WhatsApp con 1-3 turnos propuestos. Aquí se guarda qué se le ha propuesto y
-- qué ha contestado, para colocarlo en cuanto confirme:
--   ENVIADO → ACEPTADO (con la opción elegida) / RECHAZADO → COLOCADO
--   DESCARTADO = se anula la propuesta (p. ej. se coloca en su turno).
--
-- No cambia ninguna tabla existente. Solo coordinación (jefe, sub y
-- coordinador) lee y escribe (escritura solo por las 2 funciones); «Solo consulta» puede leer pero no escribir
-- (es_coordinacion_operativa_app ya lo resuelve con la transacción de lectura).
--
-- Rollback: supabase/rollback/20261028_cambios_turno_propuestos_rollback.sql

create table if not exists public.cambios_turno_propuestos_app (
  id uuid primary key default gen_random_uuid(),
  sesion_alumno_id uuid not null,
  alumno_id uuid not null references public.alumnos(id) on delete cascade,
  sesion_origen_id uuid not null references public.sesiones(id) on delete cascade,
  opciones jsonb not null default '[]'::jsonb,
  estado text not null default 'ENVIADO'
    check (estado in ('ENVIADO', 'ACEPTADO', 'RECHAZADO', 'COLOCADO', 'DESCARTADO')),
  opcion_aceptada jsonb,
  telefono text,
  mensaje text,
  creado_por uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cambios_turno_propuestos_app is
  'Propuestas de cambio de turno enviadas por WhatsApp a familias desde «Niños sin colocar» y su respuesta.';

create index if not exists cambios_turno_propuestos_app_origen_idx
  on public.cambios_turno_propuestos_app (sesion_origen_id);
create index if not exists cambios_turno_propuestos_app_sesion_alumno_idx
  on public.cambios_turno_propuestos_app (sesion_alumno_id);

create or replace function public.cambios_turno_propuestos_app_touch()
 returns trigger
 language plpgsql
 set search_path to 'public', 'pg_temp'
as $function$
begin
  new.updated_at := now();
  return new;
end;
$function$;

drop trigger if exists cambios_turno_propuestos_app_touch on public.cambios_turno_propuestos_app;
create trigger cambios_turno_propuestos_app_touch
  before update on public.cambios_turno_propuestos_app
  for each row execute function public.cambios_turno_propuestos_app_touch();

alter table public.cambios_turno_propuestos_app enable row level security;

drop policy if exists cambios_turno_propuestos_app_select on public.cambios_turno_propuestos_app;
create policy cambios_turno_propuestos_app_select on public.cambios_turno_propuestos_app
  for select to authenticated using (public.es_coordinacion_operativa_app());

-- Escrituras solo por las dos funciones de abajo (comprueban coordinación).
grant select on public.cambios_turno_propuestos_app to authenticated;
revoke insert, update, delete, truncate, references, trigger on public.cambios_turno_propuestos_app from authenticated;
revoke all on public.cambios_turno_propuestos_app from anon;

-- Registra (o renueva) la propuesta enviada a la familia de un niño.
create or replace function public.registrar_propuesta_cambio_turno_app(
  p_sesion_alumno_id uuid,
  p_alumno_id uuid,
  p_sesion_origen_id uuid,
  p_opciones jsonb,
  p_telefono text default null,
  p_mensaje text default null
)
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare
  v_id uuid;
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'Solo coordinación puede registrar propuestas de cambio de turno.';
  end if;
  if p_sesion_alumno_id is null or p_alumno_id is null or p_sesion_origen_id is null then
    raise exception 'Faltan datos de la propuesta.';
  end if;

  select c.id into v_id
  from public.cambios_turno_propuestos_app c
  where c.sesion_alumno_id = p_sesion_alumno_id
    and c.estado in ('ENVIADO', 'ACEPTADO', 'RECHAZADO')
  order by c.created_at desc
  limit 1;

  if v_id is not null then
    update public.cambios_turno_propuestos_app
    set opciones = coalesce(p_opciones, '[]'::jsonb),
        estado = 'ENVIADO',
        opcion_aceptada = null,
        telefono = p_telefono,
        mensaje = p_mensaje
    where id = v_id;
    return v_id;
  end if;

  insert into public.cambios_turno_propuestos_app(
    sesion_alumno_id, alumno_id, sesion_origen_id, opciones, estado, telefono, mensaje
  ) values (
    p_sesion_alumno_id, p_alumno_id, p_sesion_origen_id, coalesce(p_opciones, '[]'::jsonb), 'ENVIADO', p_telefono, p_mensaje
  )
  returning id into v_id;
  return v_id;
end;
$function$;

-- Apunta la respuesta de la familia (ACEPTADO con su opción / RECHAZADO) o
-- cierra la propuesta (COLOCADO / DESCARTADO).
create or replace function public.responder_propuesta_cambio_turno_app(
  p_sesion_alumno_id uuid,
  p_estado text,
  p_opcion jsonb default null
)
 returns void
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'Solo coordinación puede responder propuestas de cambio de turno.';
  end if;
  if upper(coalesce(p_estado, '')) not in ('ENVIADO', 'ACEPTADO', 'RECHAZADO', 'COLOCADO', 'DESCARTADO') then
    raise exception 'Estado no válido: %', p_estado;
  end if;

  update public.cambios_turno_propuestos_app c
  set estado = upper(p_estado),
      opcion_aceptada = case when upper(p_estado) = 'ACEPTADO' then p_opcion else c.opcion_aceptada end
  where c.id = (
    select x.id
    from public.cambios_turno_propuestos_app x
    where x.sesion_alumno_id = p_sesion_alumno_id
      and x.estado in ('ENVIADO', 'ACEPTADO', 'RECHAZADO')
    order by x.created_at desc
    limit 1
  );
end;
$function$;

revoke all on function public.registrar_propuesta_cambio_turno_app(uuid, uuid, uuid, jsonb, text, text) from public, anon;
revoke all on function public.responder_propuesta_cambio_turno_app(uuid, text, jsonb) from public, anon;
grant execute on function public.registrar_propuesta_cambio_turno_app(uuid, uuid, uuid, jsonb, text, text) to authenticated;
grant execute on function public.responder_propuesta_cambio_turno_app(uuid, text, jsonb) to authenticated;
