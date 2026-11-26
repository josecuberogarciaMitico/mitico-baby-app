-- 26/11/2026 (Jose): lunes y martes en la disponibilidad (puentes / intensivos).
-- Antes la base de datos los rechazaba («Lunes y martes no admiten clases»).
-- Ahora se aceptan con un solo turno, igual que miércoles a viernes. En la app
-- salen apagados por defecto, así que las semanas normales no cambian.
-- Se modifica el texto de las funciones existentes (cambio mínimo) y se
-- comprueba que cada sustitución se ha hecho.
do $mig$
declare
  d text;
  n text;
begin
  -- 1) Guardar borrador: aceptar lunes a domingo de la semana.
  d := pg_get_functiondef('public.guardar_borrador_disponibilidad_semana_editor_app'::regproc);
  n := replace(d,
$a$    if v_fecha < p_semana_inicio + 2 or v_fecha > p_semana_inicio + 6 then
      raise exception 'Solo se permiten días de miércoles a domingo dentro de la semana.';
    end if;

    if extract(isodow from v_fecha)::int not in (3, 4, 5, 6, 7) then
      raise exception 'Lunes y martes no admiten clases.';
    end if;$a$,
$b$    if v_fecha < p_semana_inicio or v_fecha > p_semana_inicio + 6 then
      raise exception 'Solo se permiten días de lunes a domingo dentro de la semana.';
    end if;$b$);
  if n = d then raise exception 'No se encontró el bloque de días en guardar_borrador'; end if;
  d := n;
  n := replace(d,
$a$    if extract(isodow from v_fecha)::int in (3, 4, 5) and v_turnos_dia > 1 then
      raise exception 'Miércoles, jueves y viernes solo permiten un turno.';$a$,
$b$    if extract(isodow from v_fecha)::int in (1, 2, 3, 4, 5) and v_turnos_dia > 1 then
      raise exception 'De lunes a viernes solo se permite un turno.';$b$);
  if n = d then raise exception 'No se encontró el bloque de turnos en guardar_borrador'; end if;
  execute n;

  -- 2) Nombres de día en las lecturas (lunes y martes).
  d := pg_get_functiondef('public.json_disponibilidad_semana_editor_app'::regproc);
  n := replace(d, $a$          when 3 then 'miércoles'$a$, $b$          when 1 then 'lunes'
          when 2 then 'martes'
          when 3 then 'miércoles'$b$);
  if n = d then raise exception 'No se encontró el nombre de día en json_disponibilidad'; end if;
  execute n;

  d := pg_get_functiondef('public.obtener_disponibilidad_publicada_semana_editor_app'::regproc);
  n := replace(d, $a$          when 3 then 'miércoles'$a$, $b$          when 1 then 'lunes'
          when 2 then 'martes'
          when 3 then 'miércoles'$b$);
  if n = d then raise exception 'No se encontró el nombre de día en obtener_disponibilidad_publicada'; end if;
  execute n;
end
$mig$;
