-- 17/11/2026 · Usuario «Solo consulta» (Mónica): ver fichas Baby, perfiles y reportes.
--
-- Causa: el rol consulta solo lee cuando la petición va en modo SOLO LECTURA
-- (es_consulta_lectura_app). PostgREST manda en solo lectura las funciones
-- STABLE, pero estas 8 funciones de LECTURA estaban marcadas VOLATILE (valor
-- por defecto), así que a Mónica le llegaban vacías (fichas Baby 0 en vez de 161).
--
-- Arreglo: marcarlas STABLE. No escriben nada: comprobado ejecutando las 8 como
-- coordinador jefe dentro de una transacción READ ONLY (si escribieran, fallarían).
-- No cambia lo que devuelven ni quién puede usarlas.
alter function public.obtener_alumnos_baby_fichas_app() stable;
alter function public.obtener_perfil_operativo_alumnos_app() stable;
alter function public.obtener_tendencia_ritmo_alumnos_app() stable;
alter function public.obtener_contexto_tecnico_reportes_app() stable;
alter function public.obtener_estado_avisos_entrenadores_app() stable;
alter function public.obtener_historial_reportes_adaptativo_alumno_app(uuid) stable;
alter function public.comprobar_posibles_alumnos_nueva_alta_app(text, date) stable;
alter function public.obtener_grupos_intensivo_dia_editables_app(uuid) stable;
-- Los recomendadores de grupos (recomendar_grupos_sesion_operativa_app y
-- recomendar_grupos_intensivo_dia_app) se dejan VOLATILE a propósito: Jose no
-- quiere que «Solo consulta» vea recomendadores (17/11).
