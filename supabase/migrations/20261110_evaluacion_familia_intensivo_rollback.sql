-- Deshace 20261110_evaluacion_familia_intensivo.sql
-- (borra los textos guardados y el almacén de PDF con su contenido).
drop function if exists public.guardar_texto_familia_intensivo_app(uuid, text, text);
drop function if exists public.textos_familia_intensivo_app(uuid);
alter table public.intensivo_alumnos
  drop column if exists texto_familia,
  drop column if exists mensaje_familia,
  drop column if exists texto_familia_at;
delete from storage.objects where bucket_id = 'evaluaciones-familia';
delete from storage.buckets where id = 'evaluaciones-familia';
