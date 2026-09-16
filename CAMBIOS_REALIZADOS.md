# Cambios realizados · Mítico Baby App V2

Fecha: 16 de septiembre de 2026.

## V2 funcional

La V2 conserva la arquitectura CORE/features/screens/services y mantiene `App.tsx` como shell/orquestador. Las correcciones aplicadas respecto al primer paquete V2 fueron localizadas y orientadas a restablecer dependencias perdidas durante la extracción de pantallas y features.

Principales correcciones:

- imports de disponibilidad `fechaIsoEditor` y `sumarDiasEditor`;
- constantes y opciones transversales todavía consumidas por el shell;
- propiedad `intensives` conectada al estado real `intensivos`;
- estado/callback del panel de Ocio trasladado al feature propietario;
- setters necesarios de `useBabyAimHarder`;
- tipos de disponibilidad, grupos y reportes en helpers;
- dependencias de `TrainerViewScreen`;
- `FOTO_MITICO_HERO` del test público;
- imports `FormEvent` type-only;
- origen de nivel `ESTIMATED_LEVEL` conforme al contrato CORE;
- tipado de Agenda, análisis, informes, recomendaciones Ocio y WhatsApp;
- forma correcta de `gruposOperativosResumenDia`;
- callback de Cobros envuelto correctamente;
- wrapper RPC compatible con funciones sin argumentos;
- compatibilidad de `nombreGrupoVisualApp` con contextos sin índice;
- retirada de accesos a columnas inexistentes del esquema real: `cancelado` en `v_grupos_sesion_operativa_app` y `entrenador_apoyo_id` en `v_grupos_intensivo_dia_app`;
- `tsconfig.app.json` compatible con TypeScript 5.7.2.

## Preparación desde StackBlitz para GitHub

El ZIP descargado desde **“APP FINAL V2 WORK (duplicated)”** fue comparado por hash de archivo con la candidata corregida. Todos los archivos de código compartidos coincidieron. Las únicas diferencias de contenido eran metadatos generados por StackBlitz:

- `.gitignore` reducido por StackBlitz;
- nombre superior de `package-lock.json` cambiado a `stackblitz-starters-q9n5thdk`.

Además StackBlitz añadió `dist/` e `index.js` de su entorno. Para esta entrega se han retirado esos artefactos y restaurado los metadatos canónicos del proyecto. También se recupera `.env.example` sin secretos.

No se ha modificado `src/App.tsx`, `src/App.css`, `package.json`, `tsconfig.app.json`, lógica funcional ni consultas de la V2 validada.

No se ha realizado commit, push, PR, deploy ni cambio estructural en Supabase.


## Blindaje App.tsx
- Añadido `scripts/check-architecture.mjs`.
- Añadido `npm run check:architecture`.
- `npm run build` ejecuta el control automáticamente.
- Límite inicial: 23774 líneas, igual al tamaño de la V2 validada; no se permite crecimiento neto.
