-- 16/11/2026 · Mensajes de coordinación a los entrenadores.
-- 1) Mensajes libres: coordinación escribe a uno, a varios o a todos; el
--    entrenador lo ve arriba en su vista y pulsa «Leído».
-- 2) Reparto de reportes: SOLO si coordinación lo envía para un grupo con dos
--    (o tres) entrenadores. Cada entrenador marca sus niños y da OK una sola
--    vez. Los niños de quien ya dio OK quedan fijos: el siguiente solo puede
--    repartir los niños libres. Cuando todos han dado OK, el reparto se cierra.
--    Coordinación lo puede seguir cambiando desde Trabajo en pista.
--    (16/11) Nadie espera a nadie: cada uno puede hacer los reportes de sus
--    niños en cualquier momento. Un niño con el reporte ya hecho se queda con
--    quien lo hizo (ni se puede coger ni soltar).
-- Las tablas no tienen políticas: solo se usan a través de estas funciones.
-- Rollback: 20261116_mensajes_entrenadores_rollback.sql

create table if not exists public.mensajes_entrenador_app (
  id uuid primary key default gen_random_uuid(),
  tipo text not null check (tipo in ('texto', 'reparto')),
  titulo text not null,
  cuerpo text,
  grupo_id uuid references public.grupos(id) on delete cascade,
  creado_por uuid,
  created_at timestamptz not null default now(),
  cerrado_at timestamptz
);

create table if not exists public.mensajes_entrenador_destino_app (
  mensaje_id uuid not null references public.mensajes_entrenador_app(id) on delete cascade,
  entrenador_id uuid not null references public.entrenadores(id) on delete cascade,
  leido_at timestamptz,
  ok_at timestamptz,
  primary key (mensaje_id, entrenador_id)
);

create index if not exists mensajes_entrenador_destino_entrenador_idx
  on public.mensajes_entrenador_destino_app (entrenador_id);
create index if not exists mensajes_entrenador_grupo_idx
  on public.mensajes_entrenador_app (grupo_id) where grupo_id is not null;

alter table public.mensajes_entrenador_app enable row level security;
alter table public.mensajes_entrenador_destino_app enable row level security;
revoke all on public.mensajes_entrenador_app from anon, authenticated;
revoke all on public.mensajes_entrenador_destino_app from anon, authenticated;

-- Entrenadores de un grupo: principal + apoyo + tercero.
create or replace function public.entrenadores_grupo_mensaje_app(p_grupo_id uuid)
returns table (entrenador_id uuid, entrenador text, orden int)
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select x.entrenador_id, e.nombre_completo, min(x.orden)::int
  from (
    select ae.entrenador_id, 0 orden from public.asignaciones_entrenadores ae where ae.grupo_id = p_grupo_id
    union all
    select ge.entrenador_id, case when ge.rol = 'tercero' then 2 else 1 end
    from public.grupo_entrenadores_extra_app ge where ge.grupo_id = p_grupo_id
  ) x
  join public.entrenadores e on e.id = x.entrenador_id
  group by x.entrenador_id, e.nombre_completo;
$$;
revoke all on function public.entrenadores_grupo_mensaje_app(uuid) from public, anon, authenticated;

-- Coordinación: mensaje libre.
create or replace function public.enviar_mensaje_entrenadores_app(
  p_entrenador_ids uuid[],
  p_titulo text,
  p_cuerpo text default null
)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'Solo coordinación puede enviar mensajes a los entrenadores.';
  end if;
  if nullif(trim(coalesce(p_titulo, '')), '') is null then
    raise exception 'Escribe el mensaje.';
  end if;
  if coalesce(array_length(p_entrenador_ids, 1), 0) = 0 then
    raise exception 'Elige a quién se lo mandas.';
  end if;

  insert into public.mensajes_entrenador_app (tipo, titulo, cuerpo, creado_por)
  values ('texto', left(trim(p_titulo), 300), nullif(left(trim(coalesce(p_cuerpo, '')), 2000), ''), auth.uid())
  returning id into v_id;

  insert into public.mensajes_entrenador_destino_app (mensaje_id, entrenador_id)
  select v_id, e.id from public.entrenadores e where e.id = any(p_entrenador_ids)
  on conflict do nothing;

  if not exists (select 1 from public.mensajes_entrenador_destino_app where mensaje_id = v_id) then
    raise exception 'Ninguno de esos entrenadores existe.';
  end if;
  return v_id;
end;
$$;

-- Coordinación: pedir a los entrenadores de un grupo que se repartan los reportes.
create or replace function public.enviar_reparto_reportes_app(p_grupo_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_id uuid;
  v_principal uuid;
  v_grupo text;
  v_fecha date;
  v_hora time;
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'Solo coordinación puede enviar el reparto de reportes.';
  end if;

  select g.nombre_grupo, s.fecha, s.hora_inicio into v_grupo, v_fecha, v_hora
  from public.grupos g join public.sesiones s on s.id = g.sesion_id
  where g.id = p_grupo_id;
  if v_grupo is null then
    raise exception 'No existe el grupo.';
  end if;
  if (select count(*) from public.entrenadores_grupo_mensaje_app(p_grupo_id)) < 2 then
    raise exception 'Este grupo tiene un solo entrenador: no hay reportes que repartir.';
  end if;

  -- Un reparto abierto por grupo: si ya había uno, se cierra y empieza otro.
  update public.mensajes_entrenador_app
     set cerrado_at = now()
   where grupo_id = p_grupo_id and tipo = 'reparto' and cerrado_at is null;

  -- Si el grupo aún no tiene reparto, todos empiezan en el principal.
  select entrenador_id into v_principal
  from public.entrenadores_grupo_mensaje_app(p_grupo_id) order by orden limit 1;
  insert into public.grupo_reporte_responsable_app (grupo_id, alumno_id, entrenador_id)
  select p_grupo_id, ga.alumno_id, v_principal
  from public.grupo_alumnos ga
  where ga.grupo_id = p_grupo_id
  on conflict (grupo_id, alumno_id) do nothing;

  insert into public.mensajes_entrenador_app (tipo, titulo, cuerpo, grupo_id, creado_por)
  values ('reparto',
          'Repartid los reportes de ' || v_grupo,
          to_char(v_fecha, 'DD/MM') || ' · ' || to_char(v_hora, 'HH24:MI') ||
          '. Marca los niños que has llevado tú y pulsa OK (solo una vez). Puedes ir haciendo tus reportes sin esperar a tu compañero.',
          p_grupo_id, auth.uid())
  returning id into v_id;

  insert into public.mensajes_entrenador_destino_app (mensaje_id, entrenador_id)
  select v_id, x.entrenador_id from public.entrenadores_grupo_mensaje_app(p_grupo_id) x;

  return v_id;
end;
$$;

-- Reparto de un grupo (niños, quién lo lleva y si está fijo) en JSON.
create or replace function public.reparto_mensaje_json_app(p_mensaje_id uuid)
returns jsonb
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  with m as (select * from public.mensajes_entrenador_app where id = p_mensaje_id),
  ents as (
    select x.entrenador_id, x.entrenador, x.orden, d.ok_at, d.leido_at
    from m
    cross join lateral public.entrenadores_grupo_mensaje_app(m.grupo_id) x
    left join public.mensajes_entrenador_destino_app d on d.mensaje_id = m.id and d.entrenador_id = x.entrenador_id
  )
  select jsonb_build_object(
    'entrenadores', coalesce((select jsonb_agg(jsonb_build_object(
        'entrenador_id', e.entrenador_id, 'entrenador', e.entrenador, 'ok_at', e.ok_at, 'leido_at', e.leido_at)
        order by e.orden, e.entrenador) from ents e), '[]'::jsonb),
    'alumnos', coalesce((select jsonb_agg(jsonb_build_object(
        'alumno_id', a.id, 'alumno', a.nombre_completo, 'entrenador_id', r.entrenador_id,
        'fijo', exists (select 1 from ents e where e.entrenador_id = r.entrenador_id and e.ok_at is not null),
        'reportado_por', (select rp.entrenador_id from public.reportes rp
                          where rp.grupo_id = m.grupo_id and rp.alumno_id = ga.alumno_id
                          order by rp.created_at desc limit 1))
        order by a.nombre_completo)
      from m
      join public.grupo_alumnos ga on ga.grupo_id = m.grupo_id
      join public.alumnos a on a.id = ga.alumno_id
      left join public.grupo_reporte_responsable_app r on r.grupo_id = m.grupo_id and r.alumno_id = ga.alumno_id), '[]'::jsonb)
  );
$$;
revoke all on function public.reparto_mensaje_json_app(uuid) from public, anon, authenticated;

-- Entrenador: sus mensajes pendientes (y los repartos aún abiertos de sus grupos).
create or replace function public.mis_mensajes_entrenador_app()
returns table (
  mensaje_id uuid, tipo text, titulo text, cuerpo text, created_at timestamptz,
  grupo_id uuid, leido_at timestamptz, mi_ok_at timestamptz, cerrado_at timestamptz, reparto jsonb,
  yo uuid
)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
#variable_conflict use_column
declare
  v_ent uuid := public.entrenador_actual_app();
begin
  if v_ent is null then return; end if;
  return query
  select m.id, m.tipo, m.titulo, m.cuerpo, m.created_at, m.grupo_id, d.leido_at, d.ok_at, m.cerrado_at,
         case when m.tipo = 'reparto' then public.reparto_mensaje_json_app(m.id) end,
         v_ent
  from public.mensajes_entrenador_destino_app d
  join public.mensajes_entrenador_app m on m.id = d.mensaje_id
  where d.entrenador_id = v_ent
    and m.created_at > now() - interval '7 days'
    and (
      (m.tipo = 'texto' and d.leido_at is null)
      or (m.tipo = 'reparto' and m.cerrado_at is null)
    )
  order by m.created_at desc;
end;
$$;
revoke all on function public.mis_mensajes_entrenador_app() from public, anon;
grant execute on function public.mis_mensajes_entrenador_app() to authenticated;

create or replace function public.marcar_mensaje_leido_app(p_mensaje_id uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_ent uuid := public.entrenador_actual_app();
begin
  if v_ent is null then raise exception 'Solo los entrenadores marcan mensajes como leídos.'; end if;
  update public.mensajes_entrenador_destino_app
     set leido_at = coalesce(leido_at, now())
   where mensaje_id = p_mensaje_id and entrenador_id = v_ent;
end;
$$;
revoke all on function public.marcar_mensaje_leido_app(uuid) from public, anon;
grant execute on function public.marcar_mensaje_leido_app(uuid) to authenticated;

-- Entrenador: «estos son mis niños» + OK (una sola vez).
create or replace function public.responder_reparto_reportes_app(p_mensaje_id uuid, p_mis_alumnos uuid[])
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_ent uuid := public.entrenador_actual_app();
  v_m public.mensajes_entrenador_app%rowtype;
  v_ok timestamptz;
  v_pendientes uuid[];
  v_resto uuid;
  v_mis uuid[] := coalesce(p_mis_alumnos, '{}');
begin
  if v_ent is null then raise exception 'Solo los entrenadores responden al reparto.'; end if;

  select * into v_m from public.mensajes_entrenador_app where id = p_mensaje_id for update;
  if not found or v_m.tipo <> 'reparto' then raise exception 'No existe ese reparto.'; end if;
  if v_m.cerrado_at is not null then raise exception 'Este reparto ya está cerrado. Si hay que cambiar algo, díselo a coordinación.'; end if;

  select ok_at into v_ok from public.mensajes_entrenador_destino_app
  where mensaje_id = p_mensaje_id and entrenador_id = v_ent;
  if not found then raise exception 'Este reparto no es de tu grupo.'; end if;
  if v_ok is not null then raise exception 'Ya diste el OK a este reparto: solo se puede hacer una vez.'; end if;

  -- Solo niños del grupo.
  if exists (select 1 from unnest(v_mis) x(id)
             where not exists (select 1 from public.grupo_alumnos ga where ga.grupo_id = v_m.grupo_id and ga.alumno_id = x.id)) then
    raise exception 'Hay un niño que no es de este grupo.';
  end if;

  -- No se pueden coger niños de quien ya dio el OK.
  if exists (
    select 1 from unnest(v_mis) x(id)
    join public.grupo_reporte_responsable_app r on r.grupo_id = v_m.grupo_id and r.alumno_id = x.id
    join public.mensajes_entrenador_destino_app d on d.mensaje_id = p_mensaje_id and d.entrenador_id = r.entrenador_id
    where d.ok_at is not null and r.entrenador_id <> v_ent
  ) then
    raise exception 'Alguno de esos niños ya lo ha confirmado tu compañero.';
  end if;

  -- Un niño con el reporte ya hecho se queda con quien lo hizo.
  if exists (
    select 1 from unnest(v_mis) x(id)
    where exists (select 1 from public.reportes rp where rp.grupo_id = v_m.grupo_id and rp.alumno_id = x.id
                  and rp.entrenador_id is distinct from v_ent)
  ) then
    raise exception 'Alguno de esos niños ya tiene el reporte hecho por tu compañero.';
  end if;
  if exists (
    select 1 from public.reportes rp
    where rp.grupo_id = v_m.grupo_id and rp.entrenador_id = v_ent and not (rp.alumno_id = any(v_mis))
  ) then
    raise exception 'Ya has hecho el reporte de algún niño que no has marcado: márcalo.';
  end if;

  -- Los demás entrenadores que aún no han dado OK.
  select array_agg(d.entrenador_id) into v_pendientes
  from public.mensajes_entrenador_destino_app d
  where d.mensaje_id = p_mensaje_id and d.entrenador_id <> v_ent and d.ok_at is null;

  -- Si soy el último, me quedo con todos los niños libres.
  if v_pendientes is null and exists (
    select 1 from public.grupo_alumnos ga
    left join public.grupo_reporte_responsable_app r on r.grupo_id = ga.grupo_id and r.alumno_id = ga.alumno_id
    left join public.mensajes_entrenador_destino_app d on d.mensaje_id = p_mensaje_id and d.entrenador_id = r.entrenador_id
    where ga.grupo_id = v_m.grupo_id
      and coalesce(d.ok_at is null or r.entrenador_id = v_ent, true)
      and not exists (select 1 from public.reportes rp where rp.grupo_id = ga.grupo_id and rp.alumno_id = ga.alumno_id
                      and rp.entrenador_id is distinct from v_ent)
      and not (ga.alumno_id = any(v_mis))
  ) then
    raise exception 'Eres el último en confirmar: los niños que quedan son tuyos.';
  end if;

  -- Mis niños.
  insert into public.grupo_reporte_responsable_app (grupo_id, alumno_id, entrenador_id)
  select v_m.grupo_id, x.id, v_ent from unnest(v_mis) x(id)
  on conflict (grupo_id, alumno_id) do update set entrenador_id = excluded.entrenador_id;

  -- Los que tenía y ya no quiero pasan a un compañero que aún no ha confirmado.
  if v_pendientes is not null then
    select r.entrenador_id into v_resto
    from public.grupo_reporte_responsable_app r
    where r.grupo_id = v_m.grupo_id and r.entrenador_id = any(v_pendientes)
    group by r.entrenador_id order by count(*) limit 1;
    v_resto := coalesce(v_resto, v_pendientes[1]);
    update public.grupo_reporte_responsable_app r
       set entrenador_id = v_resto
     where r.grupo_id = v_m.grupo_id and r.entrenador_id = v_ent and not (r.alumno_id = any(v_mis));
  end if;

  update public.mensajes_entrenador_destino_app
     set ok_at = now(), leido_at = coalesce(leido_at, now())
   where mensaje_id = p_mensaje_id and entrenador_id = v_ent;

  if not exists (select 1 from public.mensajes_entrenador_destino_app where mensaje_id = p_mensaje_id and ok_at is null) then
    update public.mensajes_entrenador_app set cerrado_at = now() where id = p_mensaje_id;
  end if;
end;
$$;
revoke all on function public.responder_reparto_reportes_app(uuid, uuid[]) from public, anon;
grant execute on function public.responder_reparto_reportes_app(uuid, uuid[]) to authenticated;

-- Coordinación: mensajes enviados (últimos días) con quién ha leído / dado OK.
create or replace function public.mensajes_enviados_entrenadores_app(p_dias int default 3)
returns table (
  mensaje_id uuid, tipo text, titulo text, cuerpo text, created_at timestamptz, grupo_id uuid,
  cerrado_at timestamptz, destinos jsonb
)
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
  select m.id, m.tipo, m.titulo, m.cuerpo, m.created_at, m.grupo_id, m.cerrado_at,
         coalesce((select jsonb_agg(jsonb_build_object(
             'entrenador_id', d.entrenador_id, 'entrenador', e.nombre_completo,
             'leido_at', d.leido_at, 'ok_at', d.ok_at) order by e.nombre_completo)
           from public.mensajes_entrenador_destino_app d
           join public.entrenadores e on e.id = d.entrenador_id
           where d.mensaje_id = m.id), '[]'::jsonb)
  from public.mensajes_entrenador_app m
  where m.created_at > now() - make_interval(days => greatest(coalesce(p_dias, 3), 1))
  order by m.created_at desc;
end;
$$;
revoke all on function public.mensajes_enviados_entrenadores_app(int) from public, anon;
grant execute on function public.mensajes_enviados_entrenadores_app(int) to authenticated;

revoke all on function public.enviar_mensaje_entrenadores_app(uuid[], text, text) from public, anon;
grant execute on function public.enviar_mensaje_entrenadores_app(uuid[], text, text) to authenticated;
revoke all on function public.enviar_reparto_reportes_app(uuid) from public, anon;
grant execute on function public.enviar_reparto_reportes_app(uuid) to authenticated;
