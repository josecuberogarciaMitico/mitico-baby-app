# Mapa de arquitectura V2

## Capas

| Capa | Responsabilidad | Ubicación principal |
|---|---|---|
| Shell/orquestación | Sesión, navegación, estado realmente transversal, coordinación de cargas y mutaciones compartidas | `src/App.tsx` |
| Feature slices | Pantallas, estado visual, efectos y handlers propios de cada dominio | `src/features/*` |
| CORE | Contratos y reglas puras compartidas, sin UI ni acceso remoto | `src/core/*` |
| Servicios | Adaptadores de Auth, AimHarder, altas públicas y REST/RPC | `src/services/*` |
| Componentes comunes | Historial y evaluación reutilizables | `src/components/*` |
| Pantallas preservadas | Intensivos, acceso, test público, Paco y Secretaría | `src/screens/*` |
| Legacy estable | Cobros y coordinación aún transversal que no se extrajo por riesgo/retorno | secciones delimitadas de `src/App.tsx` |

## Dominios principales

- `core/levels`: contrato canónico de niveles y precedencia por contexto.
- `core/students`, `core/reports`, `core/evaluations`: ficha maestra, historial, reportes y evaluaciones.
- `core/sessions`, `core/groups`: roster, importación, estado operativo, grupos y movimientos.
- `core/enrolment`, `core/permissions`, `core/trainers`: altas, acceso y operativa de entrenadores.
- `core/daily-work`, `core/recommendations`: Trabajo diario y recomendadores.
- `features/agenda`, `dashboard`, `students`, `reports`, `trainers`, `availability`: grandes pantallas operativas.
- `features/baby`, `ocio`, `intensivos`: políticas específicas por modalidad.
- `features/admin`, `seasons`, `analysis`, `operations`, `communications`: administración y dirección.

## Flujo de dependencia

Los slices reciben datos y acciones del shell, aplican contratos CORE y delegan IO en servicios o en los adaptadores legacy preservados. El CORE no depende de React, Supabase ni de los slices. Las mutaciones remotas continúan pasando por los mismos contratos/RPC, salvo las dos sustituciones operativas documentadas.
