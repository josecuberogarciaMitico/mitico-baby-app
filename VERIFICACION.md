# Verificación · Mítico Baby App V2 preparada para GitHub

Fecha: 16 de septiembre de 2026.

## Origen

- GitHub `main`: `a604a8f9356cf23aa0af8f3d815ddf528e1d48d7` (`app 92`).
- Supabase: `MITICO_OPERATIVA_V2`.
- Snapshot V2 usado para esta entrega: ZIP descargado por el usuario desde StackBlitz, proyecto **“APP FINAL V2 WORK (duplicated)”**.

## Comparación del ZIP de StackBlitz

Comparado contra `mitico-baby-app-v2-final-corregida-candidata.zip`:

- 173 archivos comunes coincidían exactamente por SHA-256 salvo dos archivos de metadatos.
- `.gitignore`: StackBlitz lo sustituyó por una versión mínima.
- `package-lock.json`: única diferencia funcionalmente neutra, el nombre superior pasó de `mitico-baby-app` a `stackblitz-starters-q9n5thdk`.
- StackBlitz añadió un `dist/` generado y `index.js` de starter.
- StackBlitz no incluyó `.env.example`.
- No había `node_modules`, `.git` ni archivos `.env` privados en el ZIP descargado.

El código de aplicación compartido con la candidata corregida coincide.

## Pruebas externas ejecutadas por el usuario sobre esta V2

| Comprobación | Resultado |
|---|---|
| `npm ci` | OK · 67 paquetes instalados |
| `npx tsc -p tsconfig.app.json` | OK · 0 errores |
| `npm run test:core` | OK · 139/139 |
| `npm run build` | OK · Vite 5.4.19, 111 módulos |
| Preview Vite | OK |
| Login real | OK |
| Navegación general autenticada | Sin error visible comunicado |

No se registra “24/24 manual” porque no se documentó una comprobación individual de cada ruta.

## Pruebas de Supabase TEST + rollback

Con autorización expresa se probaron mediante datos TEST y rollback:

- creación, modificación y borrado de alumno;
- disponibilidad: borrador, publicación, respuesta y retirada;
- creación de sesión y grupos;
- trabajo diario y observaciones;
- publicación de grupo;
- confirmación de entrenador;
- asistencia y reversión;
- movimiento de alumno entre grupos;
- reporte adaptativo V2;
- Intensivos: intensivo, día, alumno, grupo y asistencia;
- permisos de rol: un entrenador fue bloqueado en una acción reservada a coordinación;
- protecciones de negocio: bloqueo de borrado con asistencia real y rechazo de valores de reporte inválidos.

Las comprobaciones posteriores confirmaron 0 restos TEST de alumnos, grupos, sesiones, Intensivos, disponibilidad y reportes.

## Estado GitHub / producción

No se ha realizado commit, push, PR ni despliegue. `main` sigue siendo el V1/rollback indicado arriba.

## Incidencia separada de seguridad Supabase

Durante la auditoría se confirmó que existen vistas sensibles con permiso `SELECT` para `anon`, incluida `v_resumen_alumno_v2`. Es un problema previo de permisos de base de datos y no una diferencia introducida por este ZIP V2. No se ha aplicado ninguna corrección estructural dentro de esta entrega de frontend.

También permanece pendiente revisar las 3 vulnerabilidades reportadas por `npm audit` (1 moderada y 2 altas). No se ejecutó `npm audit fix` ni `npm audit fix --force` para no alterar dependencias sin una revisión controlada.
