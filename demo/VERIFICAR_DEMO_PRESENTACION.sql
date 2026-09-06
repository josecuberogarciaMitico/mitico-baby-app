-- MÍTICO BABY APP · VERIFICACIÓN DE DEMO DE PRESENTACIÓN

SELECT 'BABY · semanas' AS bloque, count(distinct w.id)::text AS total
FROM public.semanas w
JOIN public.sesiones s ON s.semana_id=w.id
JOIN public.modalidades m ON m.id=s.modalidad_id
WHERE m.codigo='BABY'
  AND w.id IN (
    'e49c776c-d3f1-3ccd-cecb-fceccff88a61','d6d85d4c-8dfc-0e60-3757-8e76ecde63de',
    '588d4eff-0d13-5299-ff26-019db4ef09c9','71150e37-b685-75df-8bfa-37b8c2bd5aae',
    'd1fbe77a-c148-ae74-3b7a-b2b741130f21','649f9538-88b4-ab46-b537-129d0facd9cb',
    '7121c49b-2be1-324c-78af-a0e9e9054d7c'
  )
UNION ALL
SELECT 'BABY · sesiones',count(*)::text
FROM public.sesiones s
JOIN public.modalidades m ON m.id=s.modalidad_id
WHERE m.codigo='BABY'
  AND s.semana_id IN (
    'e49c776c-d3f1-3ccd-cecb-fceccff88a61','d6d85d4c-8dfc-0e60-3757-8e76ecde63de',
    '588d4eff-0d13-5299-ff26-019db4ef09c9','71150e37-b685-75df-8bfa-37b8c2bd5aae',
    'd1fbe77a-c148-ae74-3b7a-b2b741130f21','649f9538-88b4-ab46-b537-129d0facd9cb',
    '7121c49b-2be1-324c-78af-a0e9e9054d7c'
  )
UNION ALL
SELECT 'BABY · grupos',count(*)::text
FROM public.grupos g
JOIN public.sesiones s ON s.id=g.sesion_id
JOIN public.modalidades m ON m.id=g.modalidad_id
WHERE m.codigo='BABY'
  AND s.semana_id IN (
    'e49c776c-d3f1-3ccd-cecb-fceccff88a61','d6d85d4c-8dfc-0e60-3757-8e76ecde63de',
    '588d4eff-0d13-5299-ff26-019db4ef09c9','71150e37-b685-75df-8bfa-37b8c2bd5aae',
    'd1fbe77a-c148-ae74-3b7a-b2b741130f21','649f9538-88b4-ab46-b537-129d0facd9cb',
    '7121c49b-2be1-324c-78af-a0e9e9054d7c'
  )
UNION ALL
SELECT 'REPORTES',count(*)::text
FROM public.reportes r
JOIN public.alumnos a ON a.id=r.alumno_id
WHERE a.semilla_temporada_origen='DEMO_PRESENTACION_SEPT_2026'
UNION ALL
SELECT 'OCIO · grupos',count(*)::text
FROM public.v_ocio_grupos_estables_app
WHERE grupo_id::text LIKE 'd7000000-0000-4000-8000-%'
UNION ALL
SELECT 'OCIO · alumnos',count(*)::text
FROM public.v_ocio_alumnos_app
WHERE grupo_id::text LIKE 'd7000000-0000-4000-8000-%'
UNION ALL
SELECT 'OCIO · reubicaciones',count(*)::text
FROM public.v_ocio_reubicaciones_app
WHERE reubicacion_id::text LIKE 'd7200000-0000-4000-8000-%'
UNION ALL
SELECT 'INTENSIVOS',count(*)::text
FROM public.v_intensivos_app
WHERE intensivo_id IN (
  '7626b95d-49fa-8bef-2bec-63e49ccd6cc6',
  'c940404d-3ee4-c636-4942-df9379fde678',
  'd8000000-0000-4000-8000-000000000001'
)
UNION ALL
SELECT 'INTENSIVO SEPTIEMBRE · días',count(*)::text
FROM public.v_intensivo_dias_app
WHERE intensivo_id='d8000000-0000-4000-8000-000000000001'
UNION ALL
SELECT 'INTENSIVO SEPTIEMBRE · grupos',count(*)::text
FROM public.v_grupos_intensivo_dia_app
WHERE intensivo_id='d8000000-0000-4000-8000-000000000001'
UNION ALL
SELECT 'INTENSIVOS · recuperaciones',count(*)::text
FROM public.v_intensivo_recuperaciones_app
WHERE recuperacion_id IN (
  '5fa8cd46-198d-94f2-f8c6-a279d18ac0c4',
  'd8400000-0000-4000-8000-000000000001'
)
UNION ALL
SELECT 'ALTAS',count(*)::text
FROM public.altas_nivel_inicial_app
WHERE id::text LIKE 'd9000000-0000-4000-8000-%'
UNION ALL
SELECT 'DISPONIBILIDAD · semanas',count(*)::text
FROM public.disponibilidad_semanas_editor
WHERE id IN (
  '8c6c007e-d34b-47ed-b7d2-2ac75761ceea',
  '601e6023-f2ff-eb42-f37b-94a6cc8db90e',
  'cac33f80-9070-6777-8459-09601cce4c43'
)
UNION ALL
SELECT 'DISPONIBILIDAD · respuestas',count(*)::text
FROM public.disponibilidad_respuestas_editor
WHERE semana_id IN (
  '8c6c007e-d34b-47ed-b7d2-2ac75761ceea',
  '601e6023-f2ff-eb42-f37b-94a6cc8db90e',
  'cac33f80-9070-6777-8459-09601cce4c43'
);

-- Comprobación visual: no deben aparecer etiquetas DEMO/TEST en nombres de módulos.
SELECT 'semanas' AS origen,id::text AS id,nombre AS texto FROM public.semanas WHERE nombre ILIKE '%DEMO%' OR nombre ILIKE '%TEST%'
UNION ALL SELECT 'intensivos',id::text,nombre FROM public.intensivos WHERE nombre ILIKE '%DEMO%' OR nombre ILIKE '%TEST%'
UNION ALL SELECT 'grupos',id::text,nombre_grupo FROM public.grupos WHERE nombre_grupo ILIKE '%DEMO%' OR nombre_grupo ILIKE '%TEST%'
UNION ALL SELECT 'ocio',id::text,nombre_grupo FROM public.ocio_grupos_estables WHERE nombre_grupo ILIKE '%DEMO%' OR nombre_grupo ILIKE '%TEST%'
UNION ALL SELECT 'altas',id::text,nombre_completo FROM public.altas_nivel_inicial_app WHERE nombre_completo ILIKE '%DEMO%' OR nombre_completo ILIKE '%TEST%';
