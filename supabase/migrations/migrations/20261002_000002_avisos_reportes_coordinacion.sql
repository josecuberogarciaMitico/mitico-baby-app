-- PENDIENTE: la aplica Jose desde el SQL Editor de Supabase (MITICO_OPERATIVA_V2).
-- Fase 3 (02/10/2026): avisos de reportes para coordinación.
--  1) reportes: 3 columnas nuevas para saber qué aviso ya se ha revisado.
--  2) obtener_avisos_reportes_app(): reportes de los últimos 45 días con lo
--     necesario para los avisos (cambio de nivel, candidato a subir, incidencia).
--  3) revisar_aviso_reporte_app(): Confirmar / Deshacer cambio de nivel y
--     marcar incidencia como vista.
-- No cambia nada de lo que ya existe: ni el guardado del reporte ni el trigger
-- que actualiza el nivel del alumno. Solo lectura + 3 marcas de revisión.
begin;

alter table public.reportes
  add column if not exists nivel_revision text,
  add column if not exists nivel_revisado_at timestamptz,
  add column if not exists incidencia_revisada_at timestamptz;

alter table public.reportes drop constraint if exists reportes_nivel_revision_check;
alter table public.reportes
  add constraint reportes_nivel_revision_check
  check (nivel_revision is null or nivel_revision in ('confirmado', 'deshecho'));

-- (2) Lectura para los avisos. Solo coordinación operativa.
create or replace function public.obtener_avisos_reportes_app()
returns table (
  reporte_id uuid,
  alumno_id uuid,
  alumno text,
  fecha date,
  modalidad text,
  grupo text,
  entrenador text,
  nivel_reportado text,
  nivel_anterior text,
  nivel_actual text,
  ritmo_grupo text,
  prioridades text[],
  incidencia text,
  incidencia_comentario text,
  evaluacion_tecnica jsonb,
  nivel_revision text,
  incidencia_revisada_at timestamptz,
  es_ultimo_del_alumno boolean,
  enviado_at timestamptz
)
language plpgsql
stable
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if not coalesce(public.es_coordinacion_operativa_app(), false) then
    raise exception 'No tienes permiso para consultar los avisos de reportes.';
  end if;

  return query
  select
    r.id,
    r.alumno_id,
    a.nombre_completo,
    r.fecha,
    coalesce(m.nombre, m.codigo),
    g.nombre_grupo,
    e.nombre_completo,
    n.codigo,
    prev.codigo,
    na.codigo,
    r.ritmo_grupo,
    r.prioridades_proxima_sesion,
    r.incidencia,
    r.incidencia_comentario,
    r.evaluacion_tecnica,
    r.nivel_revision,
    r.incidencia_revisada_at,
    not exists (
      select 1 from public.reportes r2
      where r2.alumno_id = r.alumno_id
        and (r2.fecha > r.fecha or (r2.fecha = r.fecha and r2.created_at > r.created_at))
    ),
    r.enviado_at
  from public.reportes r
  join public.alumnos a on a.id = r.alumno_id
  left join public.modalidades m on m.id = r.modalidad_id
  left join public.grupos g on g.id = r.grupo_id
  left join public.entrenadores e on e.id = r.entrenador_id
  left join public.niveles n on n.id = r.nivel_id
  left join public.niveles na on na.id = a.nivel_actual_id
  left join lateral (
    select np.codigo
    from public.reportes rp
    join public.niveles np on np.id = rp.nivel_id
    where rp.alumno_id = r.alumno_id
      and (rp.fecha < r.fecha or (rp.fecha = r.fecha and rp.created_at < r.created_at))
    order by rp.fecha desc, rp.created_at desc
    limit 1
  ) prev on true
  where r.fecha >= current_date - 45
  order by r.fecha desc, r.created_at desc;
end;
$function$;

-- (3) Acciones del aviso. Solo coordinación operativa.
create or replace function public.revisar_aviso_reporte_app(
  p_reporte_id uuid,
  p_accion text,
  p_nivel_codigo text default null
)
returns void
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  v_reporte public.reportes%rowtype;
  v_nivel_id uuid;
begin
  if not coalesce(public.es_coordinacion_operativa_app(), false) then
    raise exception 'No tienes permiso para revisar avisos de reportes.';
  end if;

  select * into v_reporte from public.reportes where id = p_reporte_id;
  if not found then
    raise exception 'Reporte no encontrado.';
  end if;

  if p_accion = 'confirmar_nivel' then
    update public.reportes
      set nivel_revision = 'confirmado', nivel_revisado_at = now()
      where id = p_reporte_id;

  elsif p_accion = 'deshacer_nivel' then
    -- Solo el último reporte del alumno: si hay otro posterior, ese manda.
    if exists (
      select 1 from public.reportes r2
      where r2.alumno_id = v_reporte.alumno_id
        and (r2.fecha > v_reporte.fecha or (r2.fecha = v_reporte.fecha and r2.created_at > v_reporte.created_at))
    ) then
      raise exception 'Ya hay un reporte más reciente de este alumno: revisa el nivel desde su ficha.';
    end if;

    select id into v_nivel_id
    from public.niveles
    where upper(codigo) = upper(coalesce(p_nivel_codigo, '')) and activo = true
    limit 1;
    if v_nivel_id is null then
      raise exception 'Elige un nivel válido para deshacer el cambio.';
    end if;

    -- Al cambiar nivel_id, el trigger trg_actualizar_nivel_alumno_reporte
    -- devuelve también el nivel de la ficha del alumno.
    update public.reportes
      set nivel_id = v_nivel_id,
          nivel_revision = 'deshecho',
          nivel_revisado_at = now(),
          updated_at = now()
      where id = p_reporte_id;

  elsif p_accion = 'incidencia_vista' then
    update public.reportes
      set incidencia_revisada_at = now()
      where id = p_reporte_id;

  else
    raise exception 'Acción no válida.';
  end if;
end;
$function$;

revoke execute on function public.obtener_avisos_reportes_app() from public, anon;
grant execute on function public.obtener_avisos_reportes_app() to authenticated, service_role;
revoke execute on function public.revisar_aviso_reporte_app(uuid, text, text) from public, anon;
grant execute on function public.revisar_aviso_reporte_app(uuid, text, text) to authenticated, service_role;

notify pgrst, 'reload schema';

commit;
