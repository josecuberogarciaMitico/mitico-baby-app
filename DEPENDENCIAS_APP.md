# Dependencias de App.tsx

`App.tsx` es el shell de la V2. Sus dependencias se mantienen por consumidores transversales reales, no como nuevas capas de dominio.

| Dependencia | Uso desde el shell |
|---|---|
| React / ReactDOM | Estado, efectos, referencias y portales globales |
| `lib/appHelpers` y `App.css` | Sistema visual legacy compartido por pantallas aún integradas |
| `core/*` | Validación y decisiones comunes de niveles, grupos, sesiones, permisos, reportes y operativa |
| `services/auth` | Sesión, recuperación e invitación |
| `services/aimharder` | Lectura/normalización y coordinación con la operativa |
| `services/supabase/restClient` | Adaptador autenticado REST/RPC común |
| `features/*` | Montaje de slices mediante props de datos y acciones |
| `screens/IntensivosScreen` | Pantalla preservada con políticas CORE y contexto operativo |
| `lib/pushNotifications` | Publicación/confirmación y avisos existentes |

## Estado que permanece en el shell

- Sesión, rol, navegación y permisos.
- Semana/fecha activa y datos compartidos entre Agenda, Inicio, entrenadores y modalidades.
- Cargas, refrescos y mutaciones con más de un consumidor.
- Selecciones que conectan ficha, historial, reportes y operativa.
- Coordinación de publicación, confirmación, asistencia y notificaciones.
- Cobros legacy integrado.

## Límites

Los slices no deben introducir contratos remotos nuevos ni acceder a una clave privilegiada. Las claves de frontend son publicables; una clave `service_role` está explícitamente rechazada por `src/config/supabase.ts`.
