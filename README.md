# Mítico Baby App · V2

Aplicación operativa de Mítico Baby/Ocio/Intensivos.

## Fuente de verdad

- Código estable/rollback: GitHub `josecuberogarciaMitico/mitico-baby-app`, rama `main`.
- Commit V1 de rollback: `a604a8f9356cf23aa0af8f3d815ddf528e1d48d7` (`app 92`).
- Base de datos: Supabase `MITICO_OPERATIVA_V2`.

La V2 de este paquete es una candidata local corregida tras auditoría externa. No implica commit, push, PR, deploy ni modificación de Supabase.

## Comandos de verificación

```bash
npm ci
npx tsc -p tsconfig.app.json
npm run test:core
npm run build
npm run dev -- --host 0.0.0.0
```

No ejecutar `npm audit fix` ni `npm audit fix --force` durante la validación de esta candidata: cambiaría el árbol de dependencias que se está verificando.

## Arquitectura

`src/App.tsx` actúa como shell/orquestador. Las pantallas y reglas extraídas permanecen en `src/features`, `src/core`, `src/services`, `src/screens` y `src/lib`. No se deben reintroducir pantallas completas dentro de `App.tsx`.

Consulta primero:

- `LEEME_PRIMERO.md`
- `CAMBIOS_REALIZADOS.md`
- `VERIFICACION.md`
- `MAPA_ARQUITECTURA.md`
- `PLAN_PASO_A_PRODUCCION.md`
- `PLAN_ROLLBACK.md`

## Seguridad

La configuración frontend usa una clave publicable de Supabase. No añadir `service_role`, contraseñas ni claves privadas al frontend. Las pruebas contra datos reales deben comenzar en navegación/lectura. Cualquier escritura posterior debe limitarse a registros TEST y rollback.

`auditoria-app/` se conserva únicamente como referencia auxiliar heredada de la entrega de Work; no es una copia completa del V1 y no sustituye al commit oficial de GitHub.


## Blindaje de arquitectura de App.tsx

`src/App.tsx` queda congelado como shell/orquestador. No se deben añadir pantallas completas, reglas de negocio, consultas específicas de una feature, formularios completos ni bloques grandes de JSX. Toda funcionalidad nueva debe vivir en `src/features`, `src/core`, `src/services` o componentes dedicados y conectarse desde `App.tsx` mediante imports, props, hooks o llamadas de orquestación.

`npm run check:architecture` falla si `App.tsx` supera el tamaño de referencia de esta V2 (23774 líneas). `npm run build` ejecuta automáticamente esta comprobación antes de Vite. La dirección esperada es reducir `App.tsx`, no volver a hacerlo crecer.
