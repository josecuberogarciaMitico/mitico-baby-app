# REGLA_ARQUITECTURA_APP_TSX.md

## Objetivo
Evitar que `src/App.tsx` vuelva a convertirse en un archivo monolítico.

## Regla obligatoria
- `App.tsx` es shell/orquestador.
- No añadir pantallas completas, lógica de negocio, consultas de una feature, formularios completos ni grandes bloques JSX.
- La lógica nueva debe ir a `src/features`, `src/core`, `src/services` o componentes dedicados.
- Los cambios en `App.tsx` deben limitarse a imports, composición, wiring, navegación y orquestación estrictamente necesaria.
- Si una modificación requiere aumentar el tamaño de `App.tsx`, primero debe extraerse una cantidad igual o superior de lógica existente.

## Control automático
La V2 parte de 23774 líneas en `src/App.tsx`.

Ejecutar:
```bash
npm run check:architecture
```

`npm run build` ejecuta este control automáticamente. Si el archivo supera el límite, el build falla antes de Vite.
