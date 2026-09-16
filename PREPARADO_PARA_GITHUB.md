# Preparado para sustituir V1 por V2 en GitHub

Este ZIP es un paquete fuente limpio para GitHub. No contiene `dist/`, `node_modules`, `.git` ni secretos.

## Punto de retorno

V1 actual: `a604a8f9356cf23aa0af8f3d815ddf528e1d48d7` (`app 92`).

## Secuencia de promoción recomendada

1. Conservar ese commit como rollback.
2. Cargar este proyecto completo en una rama V2, sin mezclar archivos manualmente con V1.
3. Ejecutar `npm ci`, TypeScript, 139 tests y build en esa rama.
4. Revisar el diff contra `main`.
5. Solo con autorización expresa, integrar la rama en `main` y desplegar.
6. Validar login y operación real tras despliegue.
7. Si aparece una regresión crítica, volver al commit V1 indicado.

No aplicar en este paso la migración de hardening de Supabase: se gestiona separadamente.
