-- Rollback de 20261105_cancelados_invitados_y_repaso.sql:
-- vuelve a la versión del 03/11 de cancelados_aimharder_app y planificar_club
-- (las dos están completas en 20261103_cancelados_aimharder.sql; volver a
-- ejecutar ese archivo restaura ambas) y quita lo nuevo.
drop function if exists public.repaso_cancelados_aimharder_app(date, date);
-- Después de ejecutar 20261103_cancelados_aimharder.sql:
drop function if exists aimharder_sync.invitado_coincide(text, text);
