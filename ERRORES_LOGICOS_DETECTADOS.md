# Errores lógicos e integración detectados y tratados

## Riesgos funcionales tratados durante la refactorización

| Riesgo detectado | Tratamiento V2 |
|---|---|
| Nivel ausente/ambiguo convertido implícitamente en `A+` | Trabajo diario se bloquea y solicita revisión |
| Reimportación de roster que podía degradar grupos/asignaciones | Decisión idempotente y bloqueo de reemplazo inseguro |
| Duplicación o identidad ambigua en altas | Normalización y coincidencia 2-de-3; filas ambiguas se rechazan |
| Asignar grupo Ocio modificando el nivel maestro | Grupo y nivel quedan como conceptos independientes |
| Movimientos parciales de Intensivos | Validación completa de todas las fechas futuras antes del primer RPC |
| Fecha local con deriva horaria | Calendario operativo basado en fecha ISO |
| Respuesta AimHarder de otra semana aplicada al estado actual | Se comprueba la semana antes de consumir la respuesta |
| Ocupación Ocio incoherente o centro/turno ambiguos | La operación se bloquea y explica el conflicto |
| Evaluación Intensivos cerrada sin nivel final confirmado | Se exige confirmación antes del cierre |
| Enlace WhatsApp individual tratado como enlace de grupo | Validación diferenciada de ambos tipos |
| Restauración/cierre de temporada sin suficiente confirmación | Guardas, formato V1 y recuentos previos a cualquier acción |

## Defectos descubiertos por la auditoría externa de la entrega V2 original

La primera preview externa sí encontró un fallo de ejecución real: `fechaIsoEditor is not defined`. Después, el TypeScript completo de la entrega original informó 294 diagnósticos. De ellos, 210 eran símbolos/parámetros sin uso y 84 eran errores semánticos o de configuración, varios repetidos por una misma causa raíz.

Esta candidata corrige de forma localizada las causas identificadas: imports y constantes perdidos al extraer pantallas, tipos/contextos no trasladados, estado local de Ocio referenciado desde el shell, setters de Baby no expuestos, nombres de contexto heredados, contratos de vista incompatibles con el esquema real, callbacks React mal tipados y la opción `erasableSyntaxOnly` no soportada por TypeScript 5.7.2.

Las dos incompatibilidades de esquema se contrastaron en modo lectura contra `MITICO_OPERATIVA_V2`: `v_grupos_sesion_operativa_app` no expone `cancelado` y `v_grupos_intensivo_dia_app` no expone `entrenador_apoyo_id`. No se realizó ninguna escritura.

El detalle exacto de correcciones y verificaciones está en `CAMBIOS_REALIZADOS.md` y `VERIFICACION.md`. La navegación autenticada externa sobre esta candidata corregida sigue siendo obligatoria antes de producción.
