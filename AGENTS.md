# Dizes Community Agent Status

## [2026-05-18] - v1.19.6 (Privacy Policy Compliance Overhaul)
**Agente**: Antigravity
**Cambios Realizados**:
- **Compliance (Privacy Policy)**: Creada una página de política de privacidad nativa, elegante, totalmente autohospedada e interactiva en `/privacy` (`src/app/privacy/page.tsx`). Esto cumple al 100% con los requisitos de Google Play Store al ser pública, no editable, no permitir comentarios y ser bot-friendly.
- **Routing**: Creada una ruta alternativa de compatibilidad en `/privacy-policy` (`src/app/privacy-policy/page.tsx`) que importa el mismo componente para garantizar la redundancia de enlace.
- **UI/UX Integration**: 
  - Añadido un selector interactivo bilingüe (Español/Inglés) con soporte de estados y animaciones.
  - Añadido enlace directo a la política de privacidad en el pie de página de la comunidad web (`src/app/page.tsx`) junto al copyright para un acceso transparente y profesional.

## [2026-05-05] - DX Support & UI Refinement
**Agente**: Antigravity
**Cambios Realizados**:
- **DX Support**: Añadido "DX" a los tipos de dado soportados en `DiceEditModal.tsx` para permitir la edición y correcta clasificación de dados dinámicos.
- **UI Rendering**: Actualizado `page.tsx` y `DiceViewerModal.tsx` para mostrar correctamente la etiqueta "DX" en lugar de "X" en previsualizaciones y detalles.
- **Data Integrity**: Verificado que el backend de Supabase (tabla `dice_packs`) maneja correctamente el string de tipo "DX" y los conteos de caras dinámicos.

## [2026-05-04] - Portal UI & UX Refresh
**Agente**: Antigravity
**Cambios Realizados**:
- **Next.js Migration**: Consolidada la versión 15.1.9 con ESLint FlatConfig para estabilidad en Vercel.
- **Grid Optimization**: Implementado selector de columnas dinámico (1-4 móvil, 4-8 PC) usando estilos inline para máxima fiabilidad.
- **List View Upgrade**: Añadido soporte multi-columna (hasta 4 en PC) para la vista de filas.
- **Session UX**: Eliminado el botón logout de la navbar; integrado en el `ProfileModal` (pestaña Editar Datos).
- **Responsive Layout**: Mejorada la lógica de auto-ajuste de columnas al cambiar el tamaño de ventana o forzar modo móvil.

## 🚀 Deployment Status
*   **Production Domain**: `dizes.zetavirus.com` (Live & Propagated).
*   **Deep Linking**: Configured in Android and Web for one-click import.
*   **Status**: v1.16 Release Candidate Ready.

## 🛠️ Technical Details
1.  **Vercel Project**: `dizes-community`
2.  **Framework**: Next.js 15.1.9 + React 19.
3.  **ESLint**: Migrated to `eslint.config.mjs` (FlatConfig).
4.  **Deep Link Pattern**: `dizes://community?code={SHARE_CODE}`

## 📂 Key Files
*   `src/app/page.tsx`: Dashboard with new Grid/List logic.
*   `src/components/ProfileModal.tsx`: New home for Logout action.
*   `eslint.config.mjs`: Build system stability.
