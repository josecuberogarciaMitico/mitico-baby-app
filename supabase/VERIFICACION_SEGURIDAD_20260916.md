# Verificación de seguridad Supabase · 2026-09-16

Proyecto: `MITICO_OPERATIVA_V2` (`natxwawulodkoauqkwqz`).

Migración aplicada: `hardening_vistas_sensibles_y_acl`.

Resultados comprobados después de aplicar:

- 10/10 vistas contractuales: `anon SELECT = false`.
- 10/10 vistas contractuales: `authenticated SELECT = true`.
- 0/10 vistas contractuales permiten INSERT/UPDATE/DELETE a `authenticated`.
- 10 vistas `*_raw_s1`: sin SELECT para `anon` ni `authenticated`.
- 4/4 catálogos (`turnos_base`, `temporadas`, `niveles`, `modalidades`) con RLS activa.
- 4/4 catálogos: `anon SELECT = false`, `authenticated SELECT = true`, sin escritura autenticada directa.
- RPC internas endurecidas: `anon EXECUTE = false`.
- RPC público de test de nivel conserva `anon EXECUTE = true` de forma intencionada por token.
- Comprobación funcional de rol coordinador: acceso a vistas sensibles conservado (`v_resumen_alumno_v2`: 371 filas; `v_ocio_alumnos_v2_app`: 28 filas en el momento de la prueba).
- Comprobación funcional de rol entrenador: helper de gestión false y 0 filas en las vistas sensibles comprobadas.

No se modificaron datos de alumnos, grupos, sesiones, reportes ni cobros durante esta migración.

Los avisos genéricos del Security Advisor sobre `SECURITY DEFINER` y tablas con RLS sin políticas no equivalen automáticamente a una vulnerabilidad: varias funciones/vistas forman parte del diseño RPC con controles internos y varias tablas con RLS sin políticas están cerradas por defecto. Deben auditarse por contrato antes de cambiarse; no se deben silenciar rompiendo la app.
