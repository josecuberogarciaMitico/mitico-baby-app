-- Rollback de 20261028_mover_familia_entre_turnos.sql
drop function if exists public.mover_familia_entre_turnos_app(jsonb);
-- responder_propuesta_cambio_turno_publico_app: volver a aplicar su versión de
-- supabase/migrations/20261028_cambios_turno_publico.sql
