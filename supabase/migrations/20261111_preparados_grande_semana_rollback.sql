-- Deshace 20261111_preparados_grande_semana.sql y deja la versión anterior
-- (preparados_pista_grande_app() sin fechas, de 20261111_preparados_pista_grande.sql).
drop function if exists public.preparados_pista_grande_visibles_app();
drop function if exists public.preparados_pista_grande_app(date, date);
drop function if exists public.preparados_pista_grande_base_app();
-- Volver a aplicar la función preparados_pista_grande_app() de 20261111_preparados_pista_grande.sql.
