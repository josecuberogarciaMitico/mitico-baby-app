# Mítico Baby App — Demo de presentación

Rama exclusiva para enseñar la operativa de Mítico Baby App sin modificar la rama definitiva de temporada.

## Rama y origen
- Rama: `demo-presentacion-septiembre`
- Origen: `mejoras-septiembre`
- Commit base de código: `69775a88821fdb90447954170dfee4828123037d`

## Escenario cargado
La base de datos contiene un escenario ficticio y reversible con nombres normales, sin etiquetas `DEMO` o `TEST` visibles en semanas, grupos, intensivos, Ocio o altas.

### Baby
- 7 semanas de ejemplo repartidas entre enero, marzo, mayo, septiembre, octubre, noviembre y diciembre.
- 11 sesiones Baby.
- 33 grupos Baby.
- 57 reportes de seguimiento.
- Asistencias, grupos publicados, grupos en preparación, niveles y progresión.

### Ocio
- 3 grupos estables: jueves, sábado y domingo.
- 9 alumnos asignados.
- 2 cambios/reubicaciones puntuales para enseñar el flujo.

### Intensivos
- `Intensivo Semana Santa` cerrado, con diplomas y recomendaciones.
- `Intensivo Septiembre · Progresión` abierto: 4 días, 8 grupos y alumnos preparados.
- `Intensivo Puente de Octubre` abierto.
- Recuperaciones pendientes/aprobadas para enseñar el proceso.

### Altas
6 altas ficticias en distintos estados:
- Pendiente de envío.
- Enviada.
- Respondida con nivel propuesto.
- Respondida que requiere revisión del jefe.
- Validada.
- Añadida.

### Disponibilidad
- 3 semanas cargadas.
- Respuestas de entrenadores disponibles/no disponibles/pendientes.
- Turnos Baby, Ocio e Intensivos.

## Seguridad de la demo
Los entrenadores asignados a los grupos ficticios no tienen usuarios vinculados ni suscripciones push activas. La demo no debería enviar notificaciones reales a entrenadores al trabajar con esos grupos.

## Comprobar la carga
Ejecutar:
`demo/VERIFICAR_DEMO_PRESENTACION.sql`

## Volver a temporada limpia
Ejecutar:
`demo/BORRAR_DEMO_PRESENTACION.sql`

El script de borrado elimina únicamente alumnos y relaciones identificadas como `DEMO_PRESENTACION_SEPT_2026` y los IDs reservados para esta presentación.

> Importante: la rama de GitHub separa el código, pero Supabase es compartido. Antes de empezar a usar la temporada real conviene ejecutar el borrado de demo.
