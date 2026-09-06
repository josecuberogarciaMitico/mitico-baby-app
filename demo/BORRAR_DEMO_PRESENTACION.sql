BEGIN;

-- MÍTICO BABY APP · BORRADO SEGURO DE LA DEMO DE PRESENTACIÓN
-- Elimina únicamente registros identificados como DEMO_PRESENTACION_SEPT_2026
-- y los IDs internos reservados para esta presentación.

CREATE TEMP TABLE demo_alumnos_ids ON COMMIT DROP AS
SELECT id
FROM public.alumnos
WHERE semilla_temporada_origen = 'DEMO_PRESENTACION_SEPT_2026';

CREATE TEMP TABLE demo_semanas_ids(id uuid primary key) ON COMMIT DROP;
INSERT INTO demo_semanas_ids(id) VALUES
('e49c776c-d3f1-3ccd-cecb-fceccff88a61'),
('d6d85d4c-8dfc-0e60-3757-8e76ecde63de'),
('588d4eff-0d13-5299-ff26-019db4ef09c9'),
('71150e37-b685-75df-8bfa-37b8c2bd5aae'),
('d1fbe77a-c148-ae74-3b7a-b2b741130f21'),
('b3c07951-8720-34bb-591a-c850501a7d52'),
('649f9538-88b4-ab46-b537-129d0facd9cb'),
('7121c49b-2be1-324c-78af-a0e9e9054d7c'),
('d1100000-0000-4000-8000-000000000001');

CREATE TEMP TABLE demo_grupos_ids ON COMMIT DROP AS
SELECT g.id
FROM public.grupos g
JOIN public.sesiones s ON s.id = g.sesion_id
WHERE s.semana_id IN (SELECT id FROM demo_semanas_ids);

-- Altas ficticias
DELETE FROM public.altas_nivel_inicial_app
WHERE id::text LIKE 'd9000000-0000-4000-8000-%';

-- Disponibilidad ficticia: semanas creadas para la presentación
DELETE FROM public.disponibilidad_semanas_editor
WHERE id IN (
  '8c6c007e-d34b-47ed-b7d2-2ac75761ceea',
  '601e6023-f2ff-eb42-f37b-94a6cc8db90e',
  'cac33f80-9070-6777-8459-09601cce4c43'
);

-- Servicios asociados a grupos demo. Se eliminan antes de borrar grupos,
-- porque su FK pone grupo_id a NULL en lugar de borrar el servicio.
DELETE FROM public.servicios_entrenador
WHERE grupo_id IN (SELECT id FROM demo_grupos_ids);

-- Recuperaciones de intensivos relacionadas con alumnos/intensivos/grupos demo
DELETE FROM public.intensivo_recuperaciones
WHERE alumno_id IN (SELECT id FROM demo_alumnos_ids)
   OR intensivo_origen_id IN (
      '7626b95d-49fa-8bef-2bec-63e49ccd6cc6',
      'c940404d-3ee4-c636-4942-df9379fde678',
      'd8000000-0000-4000-8000-000000000001'
   )
   OR intensivo_destino_id IN (
      '7626b95d-49fa-8bef-2bec-63e49ccd6cc6',
      'c940404d-3ee4-c636-4942-df9379fde678',
      'd8000000-0000-4000-8000-000000000001'
   )
   OR grupo_destino_id IN (SELECT id FROM demo_grupos_ids);

-- Intensivos de presentación. Sus días, alumnos y asistencias se borran por CASCADE.
DELETE FROM public.intensivos
WHERE id IN (
  '7626b95d-49fa-8bef-2bec-63e49ccd6cc6',
  'c940404d-3ee4-c636-4942-df9379fde678',
  'd8000000-0000-4000-8000-000000000001'
);

-- Ocio de presentación
DELETE FROM public.ocio_reubicaciones
WHERE alumno_id IN (SELECT id FROM demo_alumnos_ids)
   OR grupo_origen_id::text LIKE 'd7000000-0000-4000-8000-%'
   OR grupo_destino_id::text LIKE 'd7000000-0000-4000-8000-%';

DELETE FROM public.ocio_grupos_estables
WHERE id::text LIKE 'd7000000-0000-4000-8000-%';

-- Relaciones que pueden impedir borrar alumnos por FK RESTRICT
DELETE FROM public.asistencias
WHERE alumno_id IN (SELECT id FROM demo_alumnos_ids);

DELETE FROM public.responsables_reporte
WHERE alumno_id IN (SELECT id FROM demo_alumnos_ids);

DELETE FROM public.reportes
WHERE alumno_id IN (SELECT id FROM demo_alumnos_ids);

DELETE FROM public.grupo_alumnos
WHERE alumno_id IN (SELECT id FROM demo_alumnos_ids);

DELETE FROM public.intensivo_asistencias
WHERE alumno_id IN (SELECT id FROM demo_alumnos_ids);

DELETE FROM public.intensivo_alumnos
WHERE alumno_id IN (SELECT id FROM demo_alumnos_ids);

DELETE FROM public.listado_alumnos
WHERE alumno_id IN (SELECT id FROM demo_alumnos_ids);

-- Semanas de presentación. Sesiones, grupos, asignaciones, listados,
-- reportes y trabajo diario vinculados se eliminan por CASCADE.
DELETE FROM public.semanas
WHERE id IN (SELECT id FROM demo_semanas_ids);

-- Finalmente eliminamos alumnos ficticios. Las relaciones CASCADE restantes
-- (alumno_temporada, sesión_alumnos, ocio, informes, etc.) desaparecen aquí.
DELETE FROM public.alumnos
WHERE id IN (SELECT id FROM demo_alumnos_ids);

COMMIT;

-- Verificación: todos estos valores deben quedar a 0.
SELECT
  (SELECT count(*) FROM public.alumnos WHERE semilla_temporada_origen='DEMO_PRESENTACION_SEPT_2026') AS alumnos_demo,
  (SELECT count(*) FROM public.altas_nivel_inicial_app WHERE id::text LIKE 'd9000000-0000-4000-8000-%') AS altas_demo,
  (SELECT count(*) FROM public.ocio_grupos_estables WHERE id::text LIKE 'd7000000-0000-4000-8000-%') AS ocio_grupos_demo,
  (SELECT count(*) FROM public.intensivos WHERE id IN ('7626b95d-49fa-8bef-2bec-63e49ccd6cc6','c940404d-3ee4-c636-4942-df9379fde678','d8000000-0000-4000-8000-000000000001')) AS intensivos_demo,
  (SELECT count(*) FROM public.semanas WHERE id IN ('e49c776c-d3f1-3ccd-cecb-fceccff88a61','d6d85d4c-8dfc-0e60-3757-8e76ecde63de','588d4eff-0d13-5299-ff26-019db4ef09c9','71150e37-b685-75df-8bfa-37b8c2bd5aae','d1fbe77a-c148-ae74-3b7a-b2b741130f21','b3c07951-8720-34bb-591a-c850501a7d52','649f9538-88b4-ab46-b537-129d0facd9cb','7121c49b-2be1-324c-78af-a0e9e9054d7c','d1100000-0000-4000-8000-000000000001')) AS semanas_demo;
