# Hitos de implementación V2

> Nota de auditoría externa (16/09/2026): la suite final real contiene 139 pruebas. Las menciones a 138 dentro de hitos anteriores se conservan como registro histórico de esos checkpoints.


Registro de trabajo local. No implica despliegue ni cambios en producción.

## Hito 1 · Contrato de niveles y recomendador base

- Archivos: `src/core/levels/levelContract.ts`, `src/core/recommendations/baseRecommendation.ts` y pruebas asociadas.
- Sale de `App.tsx`: parseo y orden de niveles, precedencia de nivel operativo, semántica snapshot/override de sesión, compatibilidad base, bandas, tamaño y validación pedagógica de grupos.
- Consumidores V2: apertura de reporte, reporte adaptativo, biblioteca técnica, ayuda de reportes y recomendadores/grupos de Agenda y Ocio.
- Regla corregida: un valor desconocido o una etiqueta de grupo no se convierte en A+ o B; queda en revisión controlada.
- `App.tsx`: referencia V1 52.737 líneas; tras hito 1, aproximadamente 52.650 líneas.
- Verificación: TypeScript del CORE y pruebas dirigidas, `npm run build`; correctos. TypeScript completo conserva errores baseline V1 pendientes.

## Hito 2 · Ficha maestra, historial, reportes y base de evaluación

- Archivos: `src/core/students/masterStudent.ts`, `src/core/students/studentTypes.ts`, `src/core/reports/reportTypes.ts`, `src/core/reports/reportHistory.ts` y pruebas asociadas.
- Sale de `App.tsx`: tipos maestros, edad, teléfono familiar, completitud de ficha, resolución de situación actual, clasificación/orden/filtro del historial común y generación compacta de la base de informe familiar.
- Consumidores V2: Fichas generales, Ficha Baby, Ocio e Intensivos mediante el historial ya compartido; informe familiar bajo demanda.
- Reglas aplicadas: el último reporte válido gobierna el nivel operativo; discrepancias quedan visibles para revisión; no se inventa edad; el resumen limita mejoras a 8 y Trabajo diario/observaciones/evaluaciones recientes a 5.
- `App.tsx`: 52.388 líneas tras el hito (−349 frente a V1).
- Verificación: 25 pruebas CORE, TypeScript del CORE, build de producción y `git diff --check`; correctos.

## Hito 3 · Sesiones, roster y AimHarder → operativa

- Archivos: `src/core/sessions/rosterSync.ts`, `src/core/sessions/sessionImportPolicy.ts`, `src/services/aimharder/aimHarderContract.ts`, `src/services/supabase/restClient.ts`, `src/config/supabase.ts` y pruebas asociadas.
- Sale de `App.tsx`: normalización de identidad, preflight/postflight de refresco, decisión idempotente de importación de sesión, parseo/deduplicación de clases AimHarder y acceso REST/RPC autenticado común.
- Consumidores V2: refresco Baby desde AimHarder, preparación semanal Ocio, importación genérica de listados y clientes Paco/Secretaría mediante configuración única.
- Regla corregida: una reimportación igual no muta; una distinta no puede borrar el roster cuando existen grupos/asignaciones; las bajas no acreditadas y el cero inseguro quedan bloqueados.
- `App.tsx`: 52.388 líneas antes; 52.177 tras el hito (−211; −560 frente a V1).
- Verificación: 42 pruebas CORE/servicio, TypeScript dirigido, build de producción y `git diff --check`; correctos.

## Hito 4 · Grupos, movimientos y políticas Baby/Ocio/Intensivos

- Archivos: `src/core/groups/groupOperations.ts`, `src/features/baby/babyPolicy.ts`, `src/features/ocio/ocioPolicy.ts`, `src/features/intensivos/intensivosPolicy.ts` y pruebas asociadas.
- Sale de `App.tsx`: nombres y validaciones de publicación/despublicación/confirmación/asistencia/movimiento/Trabajo diario, protección de refresco de grupo preparado, ratios y apoyo Baby, ritmo/ratio Ocio y contrato de cierre de diploma Intensivos.
- Consumidores V2: Agenda común, Vista entrenador, Trabajo en pista, preparación semanal Ocio, recomendador Ocio, altas tardías y cierre de evaluación Intensivos.
- Reglas corregidas: movimientos de las tres modalidades usan la RPC común; Ocio reutiliza un grupo idéntico y solo reemplaza un borrador generado intacto; asignar un grupo estable no corrige el nivel maestro; una evaluación Intensivos revisada exige nivel final confirmado.
- `App.tsx`: 52.177 líneas antes; aproximadamente 52.270 tras integrar las protecciones (−467 frente a V1). La subida local corresponde a preflight y preservación explícita de estado, no a lógica duplicada de política.
- Verificación: 50 pruebas CORE/políticas/servicio, TypeScript dirigido, build de producción (62 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk principal grande.

## Hito 5 · Presentación única de ficha e historial técnico

- Archivo: `src/components/students/StudentHistoryPanel.tsx`.
- Sale de `App.tsx`: filtros y contadores por modalidad, estados vacío/cargando, tarjetas de reporte adaptativo, competencias, Trabajo diario, observaciones, prioridades y detalle técnico del historial maestro.
- Consumidores V2: Fichas generales y fichas Ocio renderizan el mismo componente; Intensivos conserva el enlace a esa ficha maestra en vez de crear un historial paralelo.
- `App.tsx`: 52.270 líneas antes; 51.727 después (−543 en el hito; −1.010 frente a V1).
- Verificación del hito: 50 pruebas CORE/políticas/servicio, TypeScript dirigido del componente, build de producción y `git diff --check`.

## Hito 6 · Evaluaciones compartidas y síntesis familiar

- Archivos: `src/core/evaluations/evaluationTypes.ts`, `evaluationContract.ts`, `ocioFamilyEvaluation.ts`, `intensiveEvaluation.ts`, `src/components/evaluations/FamilyEvaluationDraftPanel.tsx` y pruebas asociadas.
- Sale de `App.tsx`: tipos de evaluaciones/cortes/diplomas, normalización anual Ocio, comparación de nivel/técnica/autonomía, límites de Trabajo diario/mejoras, HTML familiar seguro, base del diploma Intensivos y panel común de borrador familiar.
- Consumidores V2: Ficha general y evaluación puntual Ocio comparten panel; campañas Navidad/final Ocio consumen el contrato y generador CORE; evaluación final Intensivos consume la base común de diploma.
- Regla consolidada: solo existen cortes `NAVIDAD`/`FINAL`; el informe no inventa nivel, escapa contenido y limita Trabajo diario a 5 objetivos; el cierre Intensivos sigue exigiendo nivel final confirmado.
- `App.tsx`: 51.727 líneas antes; 51.109 después (−618 en el hito; −1.628 frente a V1).
- Verificación: 55 pruebas CORE/políticas/servicio, TypeScript dirigido de ambos componentes, build de producción (67 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 7 · Altas, importación e identidad común

- Archivos: `src/core/enrolment/enrolmentTypes.ts`, `src/core/enrolment/enrolmentImport.ts` y pruebas asociadas.
- Sale de `App.tsx`: contratos de altas/test inicial, estados iniciales, normalización de identidad/teléfono/fecha/modalidad/día Ocio, detección de cabecera, parser tabular, control de filas ambiguas/duplicadas y coincidencia 2-de-3 con altas existentes.
- Consumidores V2: alta manual y test público, importación masiva, resolución de altas ya existentes, clasificación de pendientes/gestionadas/sin comprobar y apertura de altas importadas.
- Reglas consolidadas: `SOCIO` no se interpreta como `OCIO`; una fila con modalidades incompatibles se rechaza; nombre, fecha y teléfono generan una identidad estable; el día fijo solo se conserva para Ocio.
- `App.tsx`: 51.109 líneas antes; 50.580 después (−529 en el hito; −2.157 frente a V1).
- Verificación: 61 pruebas CORE/políticas/servicio, TypeScript del CORE, build de producción (68 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 8 · Estado operativo común de grupos y sesiones

- Archivos: `src/core/sessions/operationalTypes.ts`, `src/core/sessions/operationalStatus.ts` y pruebas asociadas.
- Sale de `App.tsx`: contratos de Planning/Vista entrenador, cómputo semanal de incidencias, precedencia del estado de grupo, selección de históricos con tareas, relación alumno-entrenador-grupo y contadores de confirmación/asistencia/reporte.
- Consumidores V2: Inicio, Planning, filtros de Reportes y Vista entrenador comparten el mismo estado operativo; las mutaciones continúan usando los RPC comunes de grupos.
- Reglas consolidadas: sin publicar precede a confirmación; confirmación precede a seguimiento; los grupos históricos solo siguen visibles si conservan tareas; la relación usa entrenador + grupo para no mezclar asignaciones dobles.
- `App.tsx`: 50.580 líneas antes; 50.402 después (−178 en el hito; −2.335 frente a V1).
- Verificación: 67 pruebas CORE/políticas/servicio, TypeScript del CORE, build de producción (69 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 9 · CORE de Trabajo diario y memoria técnica

- Archivos: `src/core/daily-work/dailyWorkTypes.ts`, `dailyWorkContext.ts`, `dailyWorkLevels.ts`, integración en `src/lib/dailyWorkEngine.ts` y pruebas asociadas.
- Sale de `App.tsx`: contratos de contexto/histórico/progresión inicial, normalización de memoria, selección y deduplicación de trabajos recientes y composición de contexto desde ficha, perfil, ritmo, progresión y evaluación técnica.
- Consumidores V2: Agenda, Ocio, Intensivos y Vista entrenador siguen usando el mismo generador, ahora alimentado por contexto CORE y niveles oficiales.
- Regla corregida: si falta el nivel o llega una etiqueta ambigua, Trabajo diario se bloquea para revisión; ya no inventa `A+`. La memoria excluye el día actual/futuro, prioriza coincidencias de alumnos y limita a seis trabajos únicos.
- `App.tsx`: 50.402 líneas antes; 50.274 después (−128 en el hito; −2.463 frente a V1).
- Verificación: 73 pruebas CORE/políticas/servicio/motor, TypeScript del CORE, build de producción (71 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 10 · AimHarder → operativa Baby/Ocio

- Archivo: `src/services/aimharder/aimHarderOperations.ts`, ampliación de pruebas del contrato AimHarder e integración con `aimHarderContract.ts`.
- Sale de `App.tsx`: selección exacta de clase Baby, planificación semanal por turno sin adivinar colisiones, síntesis de altas/bajas/protegidos, normalización estricta de turnos Ocio y aplicación de reservas a roster estable.
- Consumidores V2: traer turno Baby, cargar semana Baby, refrescar día Baby y preparar semana Ocio usan ya las mismas decisiones puras del servicio; las llamadas Edge/RPC permanecen intactas.
- Reglas consolidadas: centro y turno deben ser inequívocos; una ocupación Ocio incoherente bloquea cambios; una respuesta de otra semana no se aplica; bajas protegidas se deduplican y se explican sin ocultarlas.
- `App.tsx`: 50.274 líneas antes; 50.096 después (−178 en el hito; −2.641 frente a V1).
- Verificación: 78 pruebas CORE/políticas/servicio/motor, TypeScript del CORE/servicio, build de producción (72 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 11 · Reubicaciones puntuales Ocio

- Archivo: `src/features/ocio/ocioRelocation.ts` y ampliación de pruebas de políticas de modalidad.
- Sale de `App.tsx`: contratos/formulario de cambio puntual, filtro semanal activo, detección de entradas/salidas, overlay sobre roster estable, selección de destinos y validación del comando previo al RPC.
- Consumidores V2: preparar semana Ocio, AimHarder Ocio, recomendador de cambio puntual, tarjetas de entrada/salida y alta/eliminación de reubicaciones comparten la política.
- Regla consolidada: el cambio semanal no modifica el grupo estable; excluye cancelados, impide el mismo grupo como destino y solo ofrece grupos activos/oficiales del día solicitado.
- `App.tsx`: 50.096 líneas antes; 50.034 después (−62 en el hito; −2.703 frente a V1).
- Verificación: 83 pruebas CORE/políticas/servicio/motor, TypeScript del CORE/política, build de producción (73 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 12 · Contratos y movimientos futuros Intensivos

- Archivos: `src/features/intensivos/intensiveTypes.ts`, `intensiveOperations.ts`, ampliación de pruebas de modalidad y política existente `intensivosPolicy.ts`.
- Sale de `App.tsx`: veinte contratos de curso/día/asistencia/recuperación/grupo/revisión/formularios, estados iniciales, calendario de cuatro sesiones, clasificación de edad y validación atómica del plan de movimiento futuro.
- Consumidores V2: pantalla Intensivos, creación de curso/días/grupos, plantilla de cuatro sesiones, asistencia/recuperaciones, diplomas y revisión entre jornadas consumen los contratos de feature; los movimientos siguen usando la RPC común.
- Reglas consolidadas: calendarios usan fecha ISO sin deriva horaria; una fecha imposible se bloquea; un cambio desde un día se valida en todas las jornadas futuras antes de ejecutar el primer RPC; falta de grupo/alumno/destino o exceso de ratio bloquea el plan completo.
- `App.tsx`: 50.034 líneas antes; 49.588 después (−446 en el hito; −3.149 frente a V1).
- Verificación: 88 pruebas CORE/políticas/servicio/motor, TypeScript del CORE/feature, build de producción (74 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 13 · Encapsulado stable-preserve de disponibilidad

- Archivo: `src/features/availability/availabilityEditor.ts` y pruebas dirigidas.
- Sale de `App.tsx`: contratos de disponibilidad publicada/borrador/turnos, plantilla semanal, fecha límite automática, normalización local/servidor, reglas de uno/varios turnos, validación y clave de almacenamiento compatible V1.
- Consumidores V2: editor de coordinación, vista previa, guardar/publicar/retirar, recuperación de borrador local y Vista entrenador consumen el módulo; RPC, almacenamiento y presentación permanecen sin cambios.
- Reglas preservadas: lunes de referencia, cierre martes 13:00 salvo override manual, laborables con un turno, sábado/domingo multitrurno, días ausentes del servidor no se inventan como activos y se mantiene la clave `mitico_disponibilidad_editor_v1_*`.
- `App.tsx`: 49.588 líneas antes; 49.294 después (−294 en el hito; −3.443 frente a V1).
- Verificación: 93 pruebas CORE/features/servicios/motor, TypeScript dirigido, build de producción (75 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 14 · Roles, permisos y contrato de autenticación

- Archivos: `src/core/permissions/rolePermissions.ts`, `src/services/auth/authTypes.ts`, `authContract.ts`, `authService.ts` y pruebas dirigidas.
- Sale de `App.tsx`: contratos de rol/perfil/sesión, etiquetas y matriz de permisos, persistencia y refresco de sesión, parseo invite/recovery, login, recuperación/cambio de contraseña, lectura del usuario Auth y carga del perfil operativo.
- Consumidores V2: entrada/login, invitación y recuperación, cliente REST/RPC autenticado, navegación y todos los controles de dirección, accesos y altas administrativas consumen los módulos comunes.
- Reglas preservadas: solo coordinador jefe accede a dirección/gestión de accesos; altas administrativas admiten jefe, subcoordinación y administración; el alias remoto `coordinador` conserva acceso operativo pero no altas; las sesiones URL exigen `access_token` y no inventan refresh ni expiración.
- `App.tsx`: 49.294 líneas antes; 48.993 después (−301 en el hito; −3.744 frente a V1).
- Verificación: 100 pruebas CORE/features/servicios/motor, TypeScript dirigido, build de producción (78 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 15 · Entrenadores, apoyo y reparto de reportes

- Archivos: `src/core/trainers/trainerTypes.ts`, `trainerOperations.ts` y pruebas dirigidas.
- Sale de `App.tsx`: contratos y formulario de entrenador, opciones de especialidad/documentación, reparto automático 3/2 y overrides de reportes, deduplicación de responsables por grupo, distribución de alumnos, validación de apoyo y plan de cambio normal/excepcional.
- Consumidores V2: Agenda, Vista entrenador, altas tardías, recomendadores Baby/Intensivos, gestión de entrenadores, Cobros y publicación/Push consumen el CORE; RPC y UI permanecen intactas.
- Reglas preservadas: principal y apoyo no pueden coincidir; no se retira apoyo a un grupo bajo publicado que lo necesita; el cambio publicado avisa al entrenador anterior; el excepcional mantiene su RPC; los overrides manuales de alumno prevalecen sobre el reparto 3/2.
- `App.tsx`: 48.993 líneas antes; 48.861 después (−132 en el hito; −3.876 frente a V1).
- Verificación: 107 pruebas CORE/features/servicios/motor, TypeScript dirigido, build de producción (79 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 16 · Contrato compartido de WhatsApp

- Archivos: `src/core/communications/whatsappTypes.ts`, `whatsappContract.ts` y pruebas dirigidas.
- Sale de `App.tsx`: contratos de enlace/previsualización, normalización de teléfono y clave, URL individual, validación/búsqueda de grupo, contextos únicos Baby/Ocio/Intensivos/sesión, construcción de preview y limpieza compatible de nombres de entrenadores.
- Consumidores V2: altas y test inicial, familias Baby/Ocio/Intensivos, Agenda, resumen diario, recordatorios de reportes, ficha de entrenador y panel Dirección → WhatsApp consumen el contrato común; mensajes, clipboard, ventanas y RPC se conservan.
- Reglas preservadas: móvil nacional de nueve cifras recibe prefijo 34; no se acepta un enlace individual como grupo; Intensivos reutiliza la identidad del curso; Ocio/Baby usan grupos globales; un preview vacío se bloquea; se conserva el formato legacy de nombres de prueba.
- `App.tsx`: 48.861 líneas antes; 48.753 después (−108 en el hito; −3.984 frente a V1).
- Verificación: 114 pruebas CORE/features/servicios/motor, TypeScript dirigido, build de producción (80 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 17 · Agenda/Inicio: calendario y sesión operativa única

- Archivos: `src/features/agenda/agendaTypes.ts`, `agendaCalendar.ts`, `agendaSessions.ts` y pruebas dirigidas.
- Sale de `App.tsx`: contratos de sesión/alumno/grupo/listado/recomendación, formulario y opciones de Agenda, cálculo local de fechas/semana/temporada/turnos y agregación ordenada de operativa directa, Intensivos, Planning y listados.
- Consumidores V2: Inicio, Agenda, resumen diario, disponibilidad, reportes, Vista entrenador, WhatsApp y altas tardías comparten calendario y sesiones agregadas; consultas, RPC y UI permanecen intactas.
- Reglas preservadas: semana lunes-domingo y trabajo miércoles-domingo; temporada cambia en julio; una sesión directa prevalece sobre su día Intensivos y completa su estado con Planning; Planning/listado solo crean fallback si no existe sesión equivalente; el total directo usa el mayor dato seguro.
- `App.tsx`: 48.753 líneas antes; 48.313 después (−440 en el hito; −4.424 frente a V1).
- Verificación: 121 pruebas CORE/features/servicios/motor, TypeScript dirigido, build de producción (82 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 18 · Recomendación funcional Baby

- Archivo: `src/features/baby/babyRecommendation.ts` y pruebas dirigidas.
- Sale de `App.tsx`: fuerza/demanda operativa, evidencia de remontes, transición A+/B a percha, promoción funcional B+→C, explicación compacta, orden por perfil/edad, ratios conservadores y aplicación del cinturón pedagógico.
- Consumidores V2: recomendador Agenda Baby, análisis de altas tardías, presentación de propuesta y repartidor de Intensivos consumen la base compartida; nivel, banda y tamaños proceden del CORE común.
- Reglas preservadas: B+ solo sube de banda con evidencia fuerte de ritmo, confianza y autonomía/remonte; demanda alta lo bloquea; tres alumnos en transición fuerzan subgrupo de ratio bajo; un grupo unitario queda para revisión y su aviso prevalece.
- `App.tsx`: 48.313 líneas antes; 47.988 después (−325 en el hito; −4.749 frente a V1).
- Verificación: 126 pruebas CORE/features/servicios/motor, TypeScript dirigido, build de producción (83 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 19 · Pantallas de autenticación separadas

- Archivo: `src/screens/AuthScreens.tsx`.
- Sale de `App.tsx`: estilos, estado, validación y JSX completos de login, recuperación, aceptación de invitación, creación/cambio de contraseña y error de configuración.
- Consumidores V2: el shell raíz renderiza las tres pantallas separadas; creación de contraseña consume directamente `services/auth`; perfil/sesión siguen activándose en la entrada común.
- Reglas preservadas: email y contraseña obligatorios; recuperación mantiene mensaje; contraseña nueva mínimo ocho caracteres y confirmación idéntica; invite/recovery conservan encabezados y textos diferenciados; URL Auth se limpia al completar.
- `App.tsx`: 47.988 líneas antes; 47.573 después (−415 en el hito; −5.164 frente a V1).
- Verificación: 126 pruebas CORE/features/servicios/motor, build de producción (84 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 20 · Test público de nivel separado

- Archivos: `src/screens/PublicLevelTestScreen.tsx`, `src/services/enrolment/publicEnrolmentService.ts` y estilos compartidos exportados desde `AuthScreens.tsx`.
- Sale de `App.tsx`: estado, carga, cuestionario, validación, envío y JSX completos del test familiar; llamada RPC pública anónima.
- Consumidores V2: el router raíz por `test_nivel` monta la pantalla independiente, que consume contratos/estado inicial de `core/enrolment` y el servicio público; la gestión interna de altas usa el mismo registro remoto.
- Reglas preservadas: token obligatorio, carga pública sin sesión, todas las respuestas requeridas, observaciones opcionales, mensajes de error/éxito y cabecera visual compartida; la clave anónima solo se usa como autorización pública prevista.
- `App.tsx`: 47.573 líneas antes; 46.828 después (−745 en el hito; −5.909 frente a V1).
- Verificación: 126 pruebas CORE/features/servicios/motor, build de producción (86 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 21 · Encapsulado stable-preserve de temporadas y backups

- Archivos: `src/features/seasons/seasonTypes.ts`, `seasonOperations.ts` y pruebas dirigidas.
- Sale de `App.tsx`: contratos de listados/cierre/copia maestra/backup, normalización de respuestas de cierre, guardas de confirmación destructiva, cabeceras CSV, clave local, fechas/nombre de backup, validación de formato V1 y recuento de filas restaurables.
- Consumidores V2: Temporadas, cierre seguro, copia maestra, listados por temporada, backup semanal y restauración consumen el feature; carga de archivos, descarga, UI y RPC permanecen intactas.
- Reglas preservadas: solo coordinador jefe puede cerrar; exige análisis, backup, revisión y texto `CERRAR temporada`; backup exige formato/versión/semana/datos/alumnos; se mantiene `mitico_backup_json_*`; ninguna acción de cierre/restauración se ejecutó durante el hito.
- `App.tsx`: 46.828 líneas antes; 46.685 después (−143 en el hito; −6.052 frente a V1).
- Verificación: 132 pruebas CORE/features/servicios/motor, TypeScript dirigido, build de producción (87 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 22 · Encapsulado stable-preserve de Cobros

- Archivos: `src/features/billing/billingTypes.ts`, `billingOperations.ts` y pruebas dirigidas.
- Sale de `App.tsx`: contratos de resumen/detalle/formulario/PDF, formulario inicial, período mensual desde semana, índice de tarifas, detalle por entrenador, filtros de estado/incidencia/mes, sumatorios y desglose de efectivo a céntimo.
- Consumidores V2: pantalla Cobros, recarga desde Agenda, gestión de tarifa/ajustes/estado, PDFs individuales/conjunto y preparación de efectivo consumen el feature; consultas, mutaciones y HTML estable permanecen intactos.
- Reglas preservadas: el jueves asigna el mes de semanas limítrofes; estados abiertos/revisar son pendientes y pagado/aprobado cerrados; incidencias proceden de `pendientes_revisar`; importes negativos no generan efectivo; el formulario mantiene la fecha y valores V1.
- `App.tsx`: 46.685 líneas antes; 46.521 después (−164 en el hito; −6.216 frente a V1).
- Verificación: 138 pruebas CORE/features/servicios/motor, TypeScript dirigido, build de producción (88 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 23 · Slice físico Ocio · Grupos estables

- Archivos: `src/features/ocio/OcioGroupsScreen.tsx` y `ocioTypes.ts`.
- Sale de `App.tsx`: pantalla completa de grupos estables, cinco estados locales de navegación/gestión, helpers derivados y handlers de interacción del JSX; las mutaciones/RPC compartidas se inyectan sin cambios.
- Consumidores V2: el shell de `App.tsx` monta el slice; alumnos, grupos, altas Ocio, cambios puntuales, semana operativa, AimHarder y Agenda reutilizan las operaciones existentes desde la pantalla extraída.
- `App.tsx`: 46.521 líneas antes; 43.498 después (−3.023 en el hito; −9.239 frente a V1).
- Verificación: 138 pruebas CORE/features/servicios/motor, build de producción (90 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 24 · Slice físico Agenda

- Archivo: `src/features/agenda/AgendaScreen.tsx`.
- Sale de `App.tsx`: pantalla completa de Agenda, estado local de pestaña de proceso y todos los handlers/renderizado de interacción; calendario, sesión activa, operativa compartida y RPC se reciben sin alterar su comportamiento.
- Consumidores V2: el shell monta el slice; Baby/AimHarder, altas tardías, grupos, publicación, asistencia, Trabajo diario, WhatsApp, Planning e Intensivos siguen consumiendo la misma sesión operativa y los módulos Agenda existentes.
- `App.tsx`: 43.498 líneas antes; 40.701 después (−2.797 en el hito; −12.036 frente a V1).
- Verificación: 138 pruebas CORE/features/servicios/motor, build de producción (91 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 25 · Slices físicos Ficha maestra y Reportes

- Archivos: `src/features/students/StudentRecordsScreen.tsx` y `src/features/reports/ReportsScreen.tsx`.
- Sale de `App.tsx`: pantallas completas de fichas general/Intensivos y pendientes de reportes, dos filtros locales de fichas Intensivos, helpers derivados y handlers de interacción; cargas, mutaciones y RPC compartidas se mantienen intactas como dependencias.
- Consumidores V2: el shell monta ambos slices; Agenda, Ocio e Intensivos continúan abriendo la ficha común, y Inicio/Vista entrenador comparten los mismos estados operativos de reportes.
- `App.tsx`: 40.701 líneas antes; 38.155 después (−2.546 en el hito; −14.582 frente a V1).
- Verificación: 138 pruebas CORE/features/servicios/motor, build de producción (93 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 26 · Slice físico Vista entrenador

- Archivo: `src/features/trainers/TrainerViewScreen.tsx`.
- Sale de `App.tsx`: pantalla operativa completa, dos estados locales de tareas/acordeón, handlers exclusivos de disponibilidad y acordeones, componentes visuales y todo el JSX; semana, overlays, reportes, asistencia y mutaciones compartidas permanecen coordinados desde el shell.
- Consumidores V2: el shell monta el slice; disponibilidad, grupos publicados, confirmación, asistencia, Trabajo diario, observaciones, reportes y Push mantienen los mismos consumidores CORE/RPC.
- `App.tsx`: 38.155 líneas antes; 36.035 después (−2.120 en el hito; −16.702 frente a V1).
- Verificación: 138 pruebas CORE/features/servicios/motor, build de producción (94 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 27 · Slice operativo Baby/AimHarder

- Archivo: `src/features/baby/useBabyAimHarder.ts`.
- Sale de `App.tsx`: cinco estados Baby, listener exclusivo de asistentes, cliente del endpoint Baby, selección de centro/clase, carga semanal, listado individual, refresco seguro, limpieza protegida y verificación final del roster.
- Consumidores V2: `AgendaScreen` consume carga/refresco/mensajes; el volcado general reutiliza el listado Baby del hook; roster CORE y operaciones AimHarder existentes siguen gobernando seguridad e idempotencia.
- `App.tsx`: 36.035 líneas antes; 35.497 después (−538 en el hito; −17.240 frente a V1).
- Verificación: compilación TypeScript estricta dirigida, 138 pruebas CORE/features/servicios/motor, build de producción (95 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 28 · Slice físico Administración/Altas

- Archivo: `src/features/admin/AdminEnrolmentScreen.tsx`.
- Sale de `App.tsx`: pantalla completa de altas/test/importación, estado visual exclusivo del importador, helpers derivados y handlers de interacción; altas abiertas desde Agenda y mutaciones/RPC compartidas permanecen coordinadas por el shell.
- Consumidores V2: el shell monta el slice; Agenda, ficha maestra, Intensivos y WhatsApp siguen consumiendo los mismos estados y operaciones de alta.
- `App.tsx`: 35.497 líneas antes; 33.735 después (−1.762 en el hito; −19.002 frente a V1).
- Verificación: TypeScript dirigido, 138 pruebas CORE/features/servicios/motor, build de producción (96 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 29 · Slice físico Temporadas

- Archivo: `src/features/seasons/SeasonManagementScreen.tsx`.
- Sale de `App.tsx`: pantalla completa de cierre, nueva temporada, copia maestra y backup/restauración, estado visual exclusivo del flujo desplegable y handlers de interacción; confirmaciones, análisis y operaciones protegidas permanecen en el shell.
- Consumidores V2: el shell monta el slice; informes, listados, cierres y backups siguen usando `seasonOperations` y las mismas RPC.
- `App.tsx`: 33.735 líneas antes; 32.206 después (−1.529 en el hito; −20.531 frente a V1).
- Verificación: TypeScript dirigido, 138 pruebas CORE/features/servicios/motor, build de producción (97 módulos) y `git diff --check`; correctos. No se ejecutó ninguna acción destructiva. Aviso no bloqueante de chunk grande.

## Hito 30 · Slice físico Informes de dirección

- Archivo: `src/features/reports/ManagementReportsScreen.tsx`.
- Sale de `App.tsx`: pantalla completa SnowZone, candidatos de equipo y listados por temporada, con todos sus helpers derivados y handlers de interacción; estados de carga/exportación permanecen en el shell porque los actualizan operaciones compartidas.
- Consumidores V2: el shell monta el slice; temporadas, alumnos, Baby/Ocio/Intensivos y exportaciones mantienen las mismas fuentes y operaciones.
- `App.tsx`: 32.206 líneas antes; 31.076 después (−1.130 en el hito; −21.661 frente a V1).
- Verificación: TypeScript dirigido, 138 pruebas CORE/features/servicios/motor, build de producción (98 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 31 · Slices físicos Resumen diario e Inicio

- Archivos: `src/features/dashboard/DailySummaryScreen.tsx` y `HomeScreen.tsx`.
- Sale de `App.tsx`: las dos pantallas completas, métricas/agrupaciones visuales, navegación contextual y handlers JSX; fecha, búsqueda, carga y selección semanal permanecen en el shell por sus efectos/exportaciones y consumidores externos.
- Consumidores V2: el shell monta ambos slices; Agenda, reportes, alumnos, entrenadores, camisetas, publicación y alertas comparten los mismos estados operativos.
- `App.tsx`: 31.076 líneas antes; 29.775 después (−1.301 en el hito; −22.962 frente a V1).
- Verificación: TypeScript dirigido, 138 pruebas CORE/features/servicios/motor, build de producción (100 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 32 · Slice físico Ocio/Alumnos

- Archivo: `src/features/ocio/OcioStudentsScreen.tsx`.
- Sale de `App.tsx`: pantalla completa de fichas Ocio, formularios, historial, evaluación, asignación de grupo e integración con Intensivos; filtros/historial permanecen compartidos por sus consumidores externos.
- Consumidores V2: el shell monta el slice; ficha maestra, historial común, grupos estables, evaluaciones e Intensivos mantienen las mismas operaciones y RPC.
- `App.tsx`: 29.775 líneas antes; 28.981 después (−794 en el hito; −23.756 frente a V1).
- Verificación: TypeScript dirigido, 138 pruebas CORE/features/servicios/motor, build de producción (101 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 33 · Slice físico Ocio/Evaluaciones

- Archivo: `src/features/ocio/OcioEvaluationsScreen.tsx`.
- Sale de `App.tsx`: pantalla completa de evaluación individual/anual, historial, cortes e informe familiar; filtros y estados de generación permanecen compartidos con exportaciones y cargas.
- Consumidores V2: el shell monta el slice; ficha Ocio, historial común, evaluación CORE e informes familiares conservan operaciones y RPC.
- `App.tsx`: 28.981 líneas antes; 28.367 después (−614 en el hito; −24.370 frente a V1).
- Verificación: TypeScript dirigido, 138 pruebas CORE/features/servicios/motor, build de producción (102 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 34 · Slice físico Ocio operativo

- Archivo: `src/features/ocio/OcioOperationalScreens.tsx`.
- Sale de `App.tsx`: pantallas completas de revisión, cambios puntuales y preparación semanal, con sus derivados y handlers JSX; filtros, asistencia, planificación y mutaciones permanecen compartidos por otros consumidores.
- Consumidores V2: el shell monta los tres slices; grupos estables, evaluaciones, Agenda, AimHarder, asistencia y Trabajo diario conservan operaciones y RPC.
- `App.tsx`: 28.367 líneas antes; 27.652 después (−715 en el hito; −25.085 frente a V1).
- Verificación: TypeScript dirigido, 138 pruebas CORE/features/servicios/motor, build de producción (103 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 35 · Slice físico Disponibilidad

- Archivo: `src/features/availability/AvailabilityScreen.tsx`.
- Sale de `App.tsx`: pantalla completa del editor semanal, publicación/retirada, resumen por turnos y todos sus handlers JSX; el estado permanece coordinado por el shell porque también alimenta cargas, reinicios, Agenda y Vista entrenador.
- Consumidores V2: el shell monta el slice; Agenda, Vista entrenador, publicación y respuestas rápidas conservan el mismo CORE y las mismas operaciones.
- `App.tsx`: 27.652 líneas antes; 26.790 después (−862 en el hito; −25.947 frente a V1).
- Verificación: TypeScript dirigido, 138 pruebas CORE/features/servicios/motor, build de producción (104 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 36 · Slice físico Gestión de entrenadores

- Archivo: `src/features/trainers/TrainerManagementScreen.tsx`.
- Sale de `App.tsx`: pantalla completa de alta/edición, filtros, documentación, chaqueta, acceso a la app, avisos y acciones de contacto; cargas, mutaciones y estado compartido permanecen coordinados por el shell.
- Consumidores V2: el shell monta el slice; Disponibilidad, Vista entrenador, Cobros y usuarios conservan las mismas identidades, operaciones y RPC.
- `App.tsx`: 26.790 líneas antes; 26.008 después (−782 en el hito; −26.729 frente a V1).
- Verificación: TypeScript dirigido, 138 pruebas CORE/features/servicios/motor, build de producción (105 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 37 · Slice físico Análisis operativo

- Archivo: `src/features/analysis/OperationalAnalysisScreen.tsx`.
- Sale de `App.tsx`: panel completo de métricas, comparación mensual/temporadas, evolución y exportaciones; carga y fuentes transversales permanecen en el shell.
- Consumidores V2: Dirección monta el slice sobre los mismos datos Baby/Ocio/Intensivos y las mismas operaciones de exportación.
- `App.tsx`: 26.008 líneas antes; 25.491 después (−517 en el hito; −27.246 frente a V1).
- Verificación: TypeScript dirigido, 138 pruebas CORE/features/servicios/motor, build de producción (106 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hito 38 · Slice físico Planning/Listados

- Archivo: `src/features/operations/PlanningAndListingsScreens.tsx`.
- Sale de `App.tsx`: histórico técnico de grupos, cierre operativo, publicación/despublicación y pantalla de listados cargados con filtros y detalle; datos y mutaciones compartidos permanecen en el shell.
- Consumidores V2: navegación monta ambos slices; Agenda, sesiones, roster, publicación, confirmación, asistencia y reportes conservan el mismo estado operativo y las mismas RPC.
- `App.tsx`: 25.491 líneas antes; 25.119 después (−372 en el hito; −27.618 frente a V1).
- Verificación: TypeScript dirigido, 138 pruebas CORE/features/servicios/motor, build de producción (107 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Hitos 39–44 · Cierre de separación física

- Archivos: `src/features/admin/UserAccessScreen.tsx`, `src/features/communications/WhatsAppManagementScreen.tsx`, `src/features/ocio/OcioRelocationRecommender.tsx` y `src/features/shell/QuickHelp.tsx`; se completan además `AvailabilityScreen.tsx` y `TrainerViewScreen.tsx` con sus overlays/formulario adaptativo.
- Sale de `App.tsx`: Usuarios/accesos, WhatsApp Dirección, overlays exclusivos de Disponibilidad y Vista entrenador, formulario adaptativo de reportes, recomendador visual de cambios Ocio y panel transversal de ayuda rápida.
- Consumidores V2: shell/navegación, Grupos y Cambios Ocio, Disponibilidad, Vista entrenador, reportes, administración y todas las pantallas que mantienen la API `renderAyudaRapidaPantallaApp`.
- `App.tsx`: 25.119 líneas antes; 23.694 después (−1.425 en el bloque; −29.043 frente a V1).
- Verificación final del bloque: TypeScript dirigido, 138 pruebas CORE/features/servicios/motor, build de producción (111 módulos) y `git diff --check`; correctos. Aviso no bloqueante de chunk grande.

## Punto exacto de reanudación

- Refactorización estructural cerrada: no quedan slices JSX grandes pendientes salvo Cobros, conservado funcional en legacy por prioridad expresa.
- Regresión final V1 → V2 automatizable cerrada: 33/33 bloques del inventario con implementación/consumidor, 24/24 rutas presentes y 155 destinos remotos trazados (153 con el mismo nombre y dos sustituciones CORE conocidas: `publicar_grupo_operativa_segura_app` y `mover_alumno_grupo_operativa_app`, con payload compatible).
- Verificación final: TypeScript dirigido y 138 pruebas correctas; build de 111 módulos; `git diff --check` limpio; smoke del artefacto servido con HTTP 200, nodo `root` y bundle accesible.
- No se han tocado Supabase, migraciones, funciones remotas, producción ni Git remoto. La validación autenticada contra backend real queda fuera por la restricción expresa de no operar sobre producción.
