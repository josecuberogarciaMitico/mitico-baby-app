# Verificación (solo lo ejecutado de verdad)

| Comprobación | Resultado |
|---|---|
| Tests (`test:core`) | EJECUTADO · 182/182 OK, con las 16 de reportFocus |
| TypeScript de la app | EJECUTADO con tsc 6 y tipos sustitutos, porque npm está bloqueado. **0 errores nuevos** frente a app 116. |
| Arquitectura | EJECUTADO · OK, App.tsx 23738/23800 |
| `vite build` | **NO ejecutable** (npm 403). Se empaquetó la app completa con esbuild: OK. |
| `git diff --check` | EJECUTADO · OK |
| Formulario en Chromium (390 px y escritorio) | EJECUTADO con un banco de pruebas que monta los componentes reales y el CSS real. Sin errores de consola y sin scroll horizontal. Validaciones correctas. Envío calculado: actitud «Miedo» con detalle [Buena, Cansado, Miedo] y autonomía «Va solo» → «Autónomo en pista grande». Ver `capturas/`. |
| Migración SQL | EJECUTADA en un **PostgreSQL local de usar y tirar**, NO en Supabase. Se creó un esqueleto con la tabla `reportes` (y el mismo CHECK de actitud), roles y funciones auxiliares simuladas, y se comprobó: (1) la función original se crea; (2) la migración se aplica; (3) la llamada antigua, sin el parámetro nuevo, funciona; (4) la llamada nueva por nombre guarda actitud = Miedo y comentario = «Buena · Cansado»; (5) un valor desconocido se rechaza; (6) la verificación da 1 función con 23 argumentos, anon sin permiso y authenticated con permiso; (7) el rollback deja la función idéntica (md5 b2401df6… = producción). |
| Supabase real | Solo lectura (constraints, cuerpo de la función, permisos y funciones que leen actitud y autonomía). **Migración NO aplicada.** |
| App completa con sesión iniciada | **BLOQUEADA POR LIMITACIÓN DEL ENTORNO** |
| Móvil y escritorio reales | No probado. Pendiente en la preview de Jose. |

Nota que ya existía en app 116: en `src/features/agenda/` conviven `AgendaTrainerSummary.tsx` y `agendaTrainerSummary.ts`, que solo se diferencian en la mayúscula. No se ha tocado.
