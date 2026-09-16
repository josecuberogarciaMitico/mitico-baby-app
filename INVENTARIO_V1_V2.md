# Inventario V1 → V2

Origen oficial: `main` en `a604a8f9356cf23aa0af8f3d815ddf528e1d48d7` (`app 92`).

Inventario estructural V1 → V2: 33/33 bloques documentados presentes y 24/24 rutas conservadas. La V2 original llegó a completar externamente 139/139 pruebas y un build Vite de 111 módulos, pero la primera preview descubrió un fallo real de runtime y el TypeScript completo expuso dependencias perdidas de la refactorización. Esta candidata contiene correcciones localizadas y **debe repetir la validación exacta externa antes de considerarse aprobada**. Cobros permanece legacy integrado por prioridad expresa.

La columna **Verificación** conserva los hitos/pruebas asociados a cada bloque durante la refactorización y sirve como trazabilidad histórica; no sustituye el estado actual de aceptación de la candidata. El estado vigente y los pasos pendientes están en `VERIFICACION.md`.

| Funcionalidad | Ubicación V1 | Destino V2 | Estado | Verificación | Observaciones |
|---|---|---|---|---|---|
| Autenticación, recuperación e invitación | `src/App.tsx` | `services/auth` + `screens/AuthScreens` | Integrado V2 | 126 pruebas CORE/servicios + build | Servicio y pantallas separados; mismo Auth y usuarios, sin migrar cuentas |
| Roles y permisos | `src/App.tsx` + RPC | `core/permissions` | Integrado V2 | 100 pruebas CORE/servicios + build | Matriz y etiquetas comunes; contratos remotos mandan |
| Inicio y navegación | `src/App.tsx` | `features/dashboard/HomeScreen` + CORE operativo | Slice físico V2 integrado | 139 pruebas CORE/features + build | Inicio consume sesiones agregadas y estado común; navegación preservada |
| Agenda y resumen diario | `src/App.tsx` | `features/agenda` + `features/dashboard/DailySummaryScreen` | Slices físicos V2 integrados | 139 pruebas CORE/features + build | Agenda y resumen diario extraídos; contratos, calendario, turnos, agregación, IO y RPC preservados |
| Baby | `src/App.tsx` | `features/baby` + CORE + Agenda | Slice operativo V2 integrado | 139 pruebas CORE/features + build | Recomendación, ratios y controlador AimHarder completos fuera del shell; UI Baby se consume desde `AgendaScreen` |
| Ocio: alumnos | `src/App.tsx` | ficha maestra + `features/ocio/OcioStudentsScreen` | Slice físico V2 integrado | 139 pruebas CORE/features + build | Pantalla completa extraída; asignar horario/grupo no puede corregir el nivel maestro |
| Ocio: grupos estables | `src/App.tsx` + vistas/RPC | `features/ocio/OcioGroupsScreen` + política Ocio sobre CORE | Slice físico V2 integrado | 139 pruebas CORE/features + build | Pantalla, estado UI, helpers y handlers de interacción extraídos; mutaciones/RPC preservadas |
| Ocio: reubicaciones | `src/App.tsx` + RPC | `features/ocio/OcioOperationalScreens` + `OcioRelocationRecommender` + política Ocio | Slice físico V2 integrado | 139 pruebas CORE/features + build | Revisión, cambios, recomendador y preparación extraídos; grupo estable intacto y RPC preservadas |
| Intensivos | `src/screens/IntensivosScreen.tsx` + `src/App.tsx` | política/contratos Intensivos sobre CORE | Integrado V2 / UI legacy | 88 pruebas CORE/políticas + build | Contratos, calendario, movimientos futuros y cierre de nivel extraídos; pantalla aún grande y `ctx:any` |
| Entrenadores | `src/App.tsx` | `core/trainers` + `features/trainers/TrainerViewScreen.tsx` + `TrainerManagementScreen.tsx` | Slices físicos completos | 139 pruebas CORE/features + TypeScript + build | Vista, gestión, formulario adaptativo y overlay fuera del shell; identidad, reparto, apoyo, asistencia y RPC preservados |
| Disponibilidad | `src/App.tsx` | `features/availability/AvailabilityScreen.tsx` + CORE existente | Slice físico completo | 139 pruebas CORE/features + TypeScript + build | Editor, vista previa, publicación, resumen y respuesta montados desde el shell; RPC preservadas |
| AimHarder Baby/Ocio | `src/App.tsx` + Edge Functions | `services/aimharder` | Integrado V2 / IO legacy | 78 pruebas CORE/servicio + build | Selección, colisiones, ocupación, reservas y refresco comunes; contratos remotos intactos |
| Altas y test inicial | `src/App.tsx` + RPC | `core/enrolment` + `features/admin/AdminEnrolmentScreen` + pantalla/servicio público | Slice físico V2 integrado | 139 pruebas CORE/features + build | Gestión interna, importador y test público separados; coincidencias, enlaces y RPC preservados |
| Altas tardías | `src/App.tsx` + RPC | roster + groups CORE | Integrado V2 | Pruebas CORE + build | Nivel individual obligatorio; sin fallback implícito |
| Ficha maestra | `src/App.tsx` | `core/students` + `features/students/StudentRecordsScreen` | Slice físico V2 integrado | 139 pruebas CORE/features + build | Pantalla general/Intensivos y filtros locales extraídos; Ocio e Intensivos enlazan a la ficha común |
| Nivel actual/estimado/sesión/grupo | varias zonas + vistas/RPC | `core/levels` | Integrado V2 | Pruebas CORE + build | Precedencia única y valores dudosos en revisión |
| Historial común | `src/App.tsx` + RPC | `core/reports` + `components/students` | Integrado V2 | Pruebas CORE + build | Una cronología y una presentación filtrable por modalidad |
| Reportes adaptativos | `src/App.tsx`, `lib/adaptiveReport.ts` + RPC | `core/reports` + `features/reports/ReportsScreen` | Slice físico V2 integrado | 139 pruebas CORE/features + build | Pantalla de pendientes extraída; historial/presentación comunes y RPC preservadas |
| Evaluaciones e informes familiares | `src/App.tsx` | `core/evaluations` + componente común | Integrado V2 | Pruebas CORE + build | Puntual, Navidad/final Ocio e Intensivos comparten contratos y síntesis |
| Recomendador | `src/App.tsx` + varias RPC | motor CORE + políticas | Integrado V2 | Pruebas CORE + build | Base única con afinado por modalidad |
| Sesiones y roster | `src/App.tsx` + tablas/RPC | `core/sessions` | Integrado V2 | Pruebas CORE + build | Importación idempotente y destructividad bloqueada |
| Grupos, edición y colisiones | `src/App.tsx` + RPC | `core/groups` | Integrado V2 | Pruebas CORE + build | Conserva cambios manuales y usa movimiento común |
| Publicación y confirmación | `src/App.tsx` + RPC | CORE operativo + `features/operations/PlanningAndListingsScreens.tsx` | Slice físico V2 integrado | 139 pruebas CORE/features + TypeScript + build | Planning/Listados fuera del shell; Inicio y Vista entrenador comparten estado; publicación, push y RPC conservados |
| Análisis operativo | `src/App.tsx` | `features/analysis/OperationalAnalysisScreen.tsx` | Slice físico V2 integrado | 139 pruebas CORE/features + TypeScript + build | Métricas y comparativas Baby/Ocio/Intensivos montadas desde Dirección; fuentes y exportaciones preservadas |
| Asistencia | `src/App.tsx` + RPC | CORE + efecto Intensivos | Integrado V2 | 67 pruebas CORE + build | Estados y pendientes comunes; ausencia Intensivos conserva recuperación |
| Trabajo diario y observaciones | `src/lib/dailyWorkEngine.ts` + App | `core/daily-work` | Integrado V2 / motor preservado | 73 pruebas CORE/motor + build | Contexto y memoria comunes; nivel ausente/ambiguo bloqueado, sin fallback A+ |
| Notificaciones/push | `src/lib/pushNotifications.ts` + App | `services/notifications` | Ya extraído parcialmente | Build baseline | Mantener comportamiento |
| WhatsApp | `src/App.tsx` | `core/communications` + `features/communications/WhatsAppManagementScreen.tsx` | Slice físico V2 integrado | 139 pruebas CORE/servicios + TypeScript + build | Dirección, teléfonos, enlaces, claves, contextos Baby/Ocio/Intensivos y preview comunes; mensajes/RPC preservados |
| Administración | `src/App.tsx` | `features/admin/AdminEnrolmentScreen.tsx` + `UserAccessScreen.tsx` | Slices físicos V2 integrados | 139 pruebas CORE/features + TypeScript + build | Altas, importación, test y gestión de accesos fuera del shell; Auth/RPC preservados |
| Cobros | `src/App.tsx` | `features/billing` | Stable-preserve encapsulado | 139 pruebas CORE/features + build | Contratos, período, filtros, totales, tarifas y efectivo extraídos; reglas/RPC/UI intactas |
| Temporadas, cierres y backups | `src/App.tsx` + RPC | `features/seasons/SeasonManagementScreen` + operaciones | Slice físico V2 integrado | 139 pruebas CORE/features + build | Pantalla completa extraída; confirmaciones, normalización, RPC y backup V1 intactos; acciones destructivas no ejecutadas |
| Recuperaciones y diplomas | Intensivos + RPC | política Intensivos | Legacy conservado | Código/DB | Nivel final debe consolidar ficha |
| Paco y Secretaría | `src/lib/*Client.ts`, pantallas | `services/` + pantallas | Ya extraído parcialmente | Build baseline | Conservar endpoints |

Estados iniciales: `Build baseline` significa que Vite construye V1; no equivale a prueba funcional. TypeScript parte con errores heredados y no existen tests ni lint ejecutable configurados.
