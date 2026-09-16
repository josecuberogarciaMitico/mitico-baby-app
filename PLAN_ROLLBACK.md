# Plan de rollback

Punto de retorno GitHub verificado: `a604a8f9356cf23aa0af8f3d815ddf528e1d48d7` (`app 92`).

## Disparadores

- Fallo de autenticación o permisos para un rol previamente válido.
- Pantalla crítica inaccesible, datos reales incompletos o error sistemático de carga.
- Mutación con payload incompatible, duplicación de roster/grupos o pérdida de asignaciones.
- Error de publicación, confirmación, asistencia o Trabajo diario que afecte a la operativa.
- Tasa de errores superior al umbral acordado durante la ventana de vigilancia.

## Procedimiento

1. Detener nuevas operaciones de usuario y registrar hora, ruta, rol y mensaje, sin copiar datos personales innecesarios.
2. Retirar únicamente el artefacto V2 desplegado.
3. Restaurar el artefacto V1 previamente guardado y su configuración pública conocida.
4. Ejecutar smoke de acceso, Agenda, alumnos/ficha, grupos y Vista entrenador.
5. Si se usaron registros TEST, revertirlos con el snapshot preparado; no ejecutar restauraciones globales improvisadas.
6. Confirmar integridad de datos y reabrir la operativa solo tras validación del responsable.

## Garantías

Esta V2 no requiere migraciones, cambios de Supabase ni modificaciones de RPC, por lo que el rollback previsto es de artefacto frontend. Cualquier incidencia de datos debe detener el procedimiento y escalarse; no se debe resolver con borrados o restauraciones masivas sin autorización expresa.
