# LEEME PRIMERO · Mítico Baby App V2 · preparada para GitHub

Fecha: 16 de septiembre de 2026.

Esta entrega se ha preparado a partir del proyecto que el usuario descargó desde StackBlitz como **“APP FINAL V2 WORK (duplicated)”**. El código de aplicación de ese ZIP coincide con la candidata V2 corregida que se validó externamente.

## Fuentes de verdad

- GitHub oficial: `josecuberogarciaMitico/mitico-baby-app`.
- Rama estable actual: `main`.
- Commit V1/rollback comprobado: `a604a8f9356cf23aa0af8f3d815ddf528e1d48d7` (`app 92`).
- Supabase oficial: `MITICO_OPERATIVA_V2`.

No se ha realizado commit, push, pull request ni despliegue. Tampoco se ha aplicado ninguna migración estructural a Supabase para preparar este ZIP.

## Qué contiene

- Código fuente V2 completo.
- `App.tsx` y `App.css` separados.
- Tests CORE/features/servicios.
- Documentación de cambios, verificación y rollback.
- `.env.example` sin secretos.

Se han retirado del ZIP de StackBlitz únicamente artefactos ajenos al repositorio fuente: `dist/` generado por build e `index.js` del starter de StackBlitz. También se ha restaurado el `.gitignore` del proyecto y el nombre canónico `mitico-baby-app` en `package-lock.json`. Ninguno de esos ajustes modifica el comportamiento de la aplicación.

## Verificación ya realizada sobre esta V2

En StackBlitz, con las dependencias reales del proyecto:

```bash
npm ci
npx tsc -p tsconfig.app.json
npm run test:core
npm run build
npm run dev -- --host 0.0.0.0
```

Resultados observados:

- `npm ci`: correcto.
- TypeScript: 0 errores.
- `test:core`: 139/139 OK.
- `npm run build`: correcto con Vite 5.4.19.
- Preview: arranque correcto.
- Login real: correcto.
- Navegación general autenticada: sin fallo visible comunicado.

Además se realizaron pruebas TEST + rollback contra `MITICO_OPERATIVA_V2` para altas/modificación/borrado de alumno, disponibilidad, sesiones, grupos, trabajo diario, publicación, confirmación, asistencia, movimiento de alumnos, reportes, permisos e Intensivos. Los registros TEST quedaron a cero tras rollback.

## Antes de sustituir V1 por V2

La sustitución es de frontend/código GitHub. No hay que copiar ni recrear Supabase. Mantener el commit `a604a8f9356cf23aa0af8f3d815ddf528e1d48d7` como punto de retorno.

Existe una incidencia de seguridad previa en Supabase, documentada durante la auditoría: varias vistas sensibles tienen acceso `anon`. No forma parte del cambio V1→V2 y no se ha modificado en este paquete. Debe tratarse mediante una migración SQL separada y revisada.
