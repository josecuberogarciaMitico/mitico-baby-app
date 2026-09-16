# Plan de paso a producción

Este documento es un procedimiento; esta entrega no ejecuta ningún paso remoto.

## 1. Preparación

1. Descomprimir el ZIP en un entorno aislado y ejecutar `npm ci`.
2. Ejecutar `npx tsc -p tsconfig.app.json`, `npm run test:core`, `npm run build` y el smoke del artefacto.
3. Confirmar que solo se usa la URL y clave publicable del proyecto autorizado; nunca `service_role`.
4. Identificar usuarios de prueba por rol y registros con prefijo/etiqueta `TEST`.

## 2. Aceptación autenticada externa

1. Entrar con una sesión válida en un entorno capaz de alcanzar la V2 local/staging y el backend.
2. Recorrer en solo lectura los 33 bloques y las 24 rutas de `INVENTARIO_V1_V2.md`.
3. Verificar cargas, estados vacíos, filtros, navegación cruzada y ausencia de errores de consola.
4. Validar especialmente alumnos/fichas/niveles/historial, reportes, Agenda, Baby/Ocio/Intensivos, entrenadores, disponibilidad, sesiones/listados, análisis y dirección.
5. Solo si es imprescindible, probar escrituras sobre registros TEST con snapshot previo y rollback ensayado. No tocar alumnos reales.

## 3. Promoción controlada

1. Congelar cambios durante la ventana acordada.
2. Guardar el artefacto actualmente desplegado y su configuración pública.
3. Desplegar exactamente el build aprobado, sin migraciones ni cambios de RPC.
4. Ejecutar smoke autenticado por rol y comprobar logs/errores.
5. Mantener vigilancia reforzada durante la ventana y aplicar los umbrales del plan de rollback.

La promoción requiere autorización separada. No forma parte del ZIP ni de esta sesión.
