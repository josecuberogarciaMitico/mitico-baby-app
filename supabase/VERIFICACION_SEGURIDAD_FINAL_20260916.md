# Cierre de seguridad V2 · 2026-09-16

Proyecto: `MITICO_OPERATIVA_V2` (`natxwawulodkoauqkwqz`).

## Resultado efectivo comprobado

- Ninguna tabla o vista de `public` conserva SELECT/INSERT/UPDATE/DELETE para `anon`.
- La única superficie RPC anónima restante son los dos endpoints del test público por token: `obtener_test_nivel_publico_app` y `responder_test_nivel_publico_app`.
- Las vistas globales de coordinación devuelven 0 filas a un entrenador.
- Las tres vistas necesarias para `Vista entrenador` están filtradas en backend por `entrenador_id`.
- Prueba con un entrenador real con grupos: 3 grupos, 13 alumnos, 1 reporte pendiente, 0 grupos ajenos y 0 alumnos ajenos.
- Prueba con `coordinador_jefe`: acceso global preservado (agenda, alumnos, entrenadores, Ocio, reportes).
- `service_role` conserva acceso interno.
- 4 catálogos públicos con RLS activa y solo lectura autenticada.
- `search_path` fijado en las funciones señaladas por el linter.
- Funciones trigger y helpers internos retirados de la superficie RPC directa.
- Regresión TEST+ROLLBACK posterior al hardening: creación de sesión/grupo, asistencia, trabajo diario, intensivo, grupo intensivo y asistencia intensivo correctos; restos posteriores = 0.

## Linter Supabase

Persisten avisos estructurales de `SECURITY DEFINER` porque el diseño usa wrappers con comprobaciones explícitas de rol y vistas raw sin ACL de usuario. No se han silenciado cambiándolos a `SECURITY INVOKER`, ya que eso rompería el contrato actual de RLS/ACL. La seguridad efectiva se verificó con identidades reales de entrenador y coordinación.

Los avisos `RLS enabled no policy` corresponden a tablas cerradas por defecto y no equivalen a exposición pública.

La protección de contraseñas filtradas de Supabase Auth requiere activación en la configuración de Auth del proyecto y no puede modificarse desde el conector SQL.

## Dependencias frontend

La rama `v2` fue verificada en GitHub Actions con Node 20.20.2 tras actualizar Vite a `6.4.3` y forzar `nanoid` `3.3.18`:

- `npm ci`: OK
- `npx tsc -p tsconfig.app.json`: OK
- `npm run test:core`: 139/139 OK
- `npm run build`: OK
- Architecture guard: `23774/23774` líneas
- `npm audit --json`: 0 vulnerabilidades (0 low, 0 moderate, 0 high, 0 critical)
