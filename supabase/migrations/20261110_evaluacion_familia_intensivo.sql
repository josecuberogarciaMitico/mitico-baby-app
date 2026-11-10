-- 10/11/2026 · Evaluación del Intensivo para la familia, redactada por IA.
-- 1) Se guarda el texto del informe y el mensaje de WhatsApp de cada niño
--    (los redacta la función mitico-evaluacion-familia y coordinación los
--    puede retocar).
-- 2) Almacén PRIVADO para los PDF: la familia los abre con un enlace firmado
--    que caduca. Sin políticas: solo la función (service_role) sube y firma.

alter table public.intensivo_alumnos
  add column if not exists texto_familia text,
  add column if not exists mensaje_familia text,
  add column if not exists texto_familia_at timestamptz;

create or replace function public.textos_familia_intensivo_app(p_intensivo_id uuid)
returns table (intensivo_alumno_id uuid, texto_familia text, mensaje_familia text, texto_familia_at timestamptz)
language plpgsql
stable
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso.';
  end if;
  return query
  select ia.id, ia.texto_familia, ia.mensaje_familia, ia.texto_familia_at
  from public.intensivo_alumnos ia
  where ia.intensivo_id = p_intensivo_id;
end;
$$;
revoke all on function public.textos_familia_intensivo_app(uuid) from public, anon;
grant execute on function public.textos_familia_intensivo_app(uuid) to authenticated;

create or replace function public.guardar_texto_familia_intensivo_app(
  p_intensivo_alumno_id uuid, p_texto text, p_mensaje text
)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if not public.es_coordinacion_operativa_app() then
    raise exception 'No tienes permiso.';
  end if;
  update public.intensivo_alumnos
     set texto_familia = nullif(trim(coalesce(p_texto, '')), ''),
         mensaje_familia = nullif(trim(coalesce(p_mensaje, '')), ''),
         texto_familia_at = now()
   where id = p_intensivo_alumno_id;
  if not found then raise exception 'No existe ese alumno en el intensivo.'; end if;
end;
$$;
revoke all on function public.guardar_texto_familia_intensivo_app(uuid, text, text) from public, anon;
grant execute on function public.guardar_texto_familia_intensivo_app(uuid, text, text) to authenticated;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('evaluaciones-familia', 'evaluaciones-familia', false, 5242880, array['application/pdf'])
on conflict (id) do nothing;
