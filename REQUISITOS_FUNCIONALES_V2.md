# Requisitos funcionales V2

## Alcance obligatorio

1. Mantener las 24 rutas y todos los bloques funcionales de V1.
2. Autenticar usuarios existentes y respetar roles/permisos y RLS del backend actual.
3. Presentar ficha maestra, nivel vigente, historial común, reportes y evaluaciones sin duplicar identidades.
4. Operar sesiones, roster, listados, AimHarder, altas y altas tardías de forma idempotente y segura.
5. Mantener grupos, movimientos, publicación, confirmación y asistencia con los RPC existentes.
6. Mantener Trabajo diario y memoria técnica sin inventar niveles ante datos ambiguos.
7. Aplicar políticas propias de Baby, Ocio e Intensivos sobre los contratos CORE compartidos.
8. Conservar Agenda, Inicio/Resumen diario, entrenadores, disponibilidad, análisis, informes, Temporadas, WhatsApp, Administración y Cobros.
9. Mantener Paco, Secretaría, push, test público y recuperación de acceso.
10. No requerir migraciones, cambios de RPC ni alteraciones de datos para adoptar esta entrega.

## Criterios de aceptación

- Suite, TypeScript dirigido, build, smoke y diff-check correctos.
- Paridad de inventario y rutas documentada.
- Navegación autenticada manual en un entorno que pueda alcanzar simultáneamente V2 y el backend autorizado.
- Operaciones de escritura, si se prueban, exclusivamente sobre datos TEST identificados, con rollback confirmado antes de empezar.
- Ningún secreto, `node_modules`, artefacto temporal o configuración privilegiada dentro del ZIP.

La matriz detallada de cada bloque está en `INVENTARIO_V1_V2.md`.
