-- ---------------------------------------------------------------------------
-- 20261026 · Memoria de Paco: notas sobre niños y familias
--
-- Jose le dice a Paco cosas que habla con las familias en pista («mejor el
-- miércoles», «no con Nico», «el próximo día a pista grande») y Paco se las
-- recuerda solo cuando vuelve a aparecer ese niño.
--
-- - Tabla paco_notas: NO accesible directamente desde la app (RLS sin
--   políticas y sin permisos): solo a través de las funciones de abajo, que
--   exigen coordinación (es_gestion_altas_app). Los entrenadores no las ven.
-- - guardar_nota_paco_app: crea una nota (una_vez = solo para la próxima vez).
-- - cerrar_nota_paco_app: la da por hecha / la borra (queda inactiva).
-- - notas_paco_alumnos_app: notas activas de unos niños.
-- - notas_paco_sesion_app: notas activas de los niños de un turno, marcando
--   conflicto si el niño está en un grupo con el entrenador de la nota.
--
-- Rollback: supabase/rollback/20261026_paco_notas_rollback.sql
-- ---------------------------------------------------------------------------

create table if not exists public.paco_notas (
  id uuid primary key default gen_random_uuid(),
  alumno_id uuid not null references public.alumnos(id) on delete cascade,
  entrenador_id uuid references public.entrenadores(id) on delete set null,
  texto text not null check (char_length(btrim(texto)) between 3 and 500),
  una_vez boolean not null default false,
  activa boolean not null default true,
  creada_por uuid default auth.uid(),
  created_at timestamptz not null default now(),
  resuelta_at timestamptz
);
create index if not exists paco_notas_alumno_activa_idx on public.paco_notas (alumno_id) where activa;
alter table public.paco_notas enable row level security;
revoke all on public.paco_notas from public, anon, authenticated;
grant all on public.paco_notas to service_role;

create or replace function public.guardar_nota_paco_app(
  p_alumno_id uuid, p_texto text, p_entrenador_id uuid default null, p_una_vez boolean default false)
 returns uuid
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
declare v_id uuid;
begin
  if not public.es_gestion_altas_app() then
    raise exception 'Solo coordinación puede guardar notas de Paco.';
  end if;
  if not exists (select 1 from public.alumnos where id = p_alumno_id) then
    raise exception 'No encuentro ese niño.';
  end if;
  if p_entrenador_id is not null and not exists (select 1 from public.entrenadores where id = p_entrenador_id) then
    raise exception 'No encuentro ese entrenador.';
  end if;
  insert into public.paco_notas (alumno_id, entrenador_id, texto, una_vez)
  values (p_alumno_id, p_entrenador_id, left(btrim(p_texto), 500), coalesce(p_una_vez, false))
  returning id into v_id;
  return v_id;
end $function$;

create or replace function public.cerrar_nota_paco_app(p_id uuid)
 returns void
 language plpgsql
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
begin
  if not public.es_gestion_altas_app() then
    raise exception 'Solo coordinación puede cerrar notas de Paco.';
  end if;
  update public.paco_notas set activa = false, resuelta_at = now() where id = p_id and activa;
  if not found then
    raise exception 'Esa nota ya no está activa.';
  end if;
end $function$;

create or replace function public.notas_paco_alumnos_app(p_alumno_ids uuid[])
 returns table(id uuid, alumno_id uuid, alumno text, entrenador_id uuid, entrenador text, texto text, una_vez boolean, created_at timestamptz)
 language sql
 stable
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
  select n.id, n.alumno_id, a.nombre_completo, n.entrenador_id, e.nombre_completo, n.texto, n.una_vez, n.created_at
  from public.paco_notas n
  join public.alumnos a on a.id = n.alumno_id
  left join public.entrenadores e on e.id = n.entrenador_id
  where public.es_gestion_altas_app()
    and n.activa
    and n.alumno_id = any(coalesce(p_alumno_ids, '{}'))
  order by a.nombre_completo, n.created_at;
$function$;

create or replace function public.notas_paco_sesion_app(p_sesion_id uuid)
 returns table(id uuid, alumno_id uuid, alumno text, entrenador_id uuid, entrenador text, texto text, una_vez boolean,
               created_at timestamptz, grupo text, conflicto boolean)
 language sql
 stable
 security definer
 set search_path to 'public', 'pg_temp'
as $function$
  with ninos as (
    select distinct sa.alumno_id from public.sesion_alumnos_operativa sa where sa.sesion_id = p_sesion_id
    union
    select distinct ga.alumno_id from public.grupo_alumnos ga join public.grupos g on g.id = ga.grupo_id
    where g.sesion_id = p_sesion_id and not g.cancelado),
  en_grupo as (
    select ga.alumno_id, g.id grupo_id, g.nombre_grupo
    from public.grupo_alumnos ga join public.grupos g on g.id = ga.grupo_id
    where g.sesion_id = p_sesion_id and not g.cancelado),
  entrenadores_grupo as (
    select ae.grupo_id, ae.entrenador_id from public.asignaciones_entrenadores ae
    union
    select ge.grupo_id, ge.entrenador_id from public.grupo_entrenadores_extra_app ge)
  select n.id, n.alumno_id, a.nombre_completo, n.entrenador_id, e.nombre_completo, n.texto, n.una_vez, n.created_at,
         eg.nombre_grupo,
         coalesce(n.entrenador_id is not null and exists (
           select 1 from entrenadores_grupo x where x.grupo_id = eg.grupo_id and x.entrenador_id = n.entrenador_id), false)
  from public.paco_notas n
  join ninos on ninos.alumno_id = n.alumno_id
  join public.alumnos a on a.id = n.alumno_id
  left join public.entrenadores e on e.id = n.entrenador_id
  left join en_grupo eg on eg.alumno_id = n.alumno_id
  where public.es_gestion_altas_app() and n.activa
  order by 10 desc, a.nombre_completo, n.created_at;
$function$;

revoke all on function public.guardar_nota_paco_app(uuid, text, uuid, boolean) from public, anon;
revoke all on function public.cerrar_nota_paco_app(uuid) from public, anon;
revoke all on function public.notas_paco_alumnos_app(uuid[]) from public, anon;
revoke all on function public.notas_paco_sesion_app(uuid) from public, anon;
grant execute on function public.guardar_nota_paco_app(uuid, text, uuid, boolean) to authenticated, service_role;
grant execute on function public.cerrar_nota_paco_app(uuid) to authenticated, service_role;
grant execute on function public.notas_paco_alumnos_app(uuid[]) to authenticated, service_role;
grant execute on function public.notas_paco_sesion_app(uuid) to authenticated, service_role;
