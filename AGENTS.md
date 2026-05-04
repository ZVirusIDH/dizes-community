# Dizes Community Agent Status

## 🚀 Deployment Status
*   **Production Domain**: `dizes.zetavirus.com` (Live & Propagated).
*   **Deep Linking**: Configured in Android and Web for one-click import.
*   **Import 2.0**: Unified, batch support, and 512px WebP optimization.
*   **Status**: v1.15.2 Release Completed.

## 🛠️ Technical Details
1.  **Vercel Project**: `dizes-community`
2.  **Supabase Backend**: Metadata-aware dice ingestion.
3.  **Deep Link Pattern**: `dizes://community?code={SHARE_CODE}`
4.  **Supabase Config**: 
    - Ensure "Site URL" in Auth settings is `https://dizes.zetavirus.com`.

## 📱 Android Build Protocol
1.  **Docker Environment**: All production builds must use the Docker-based environment.
2.  **Versioning**: v1.15.2
3.  **Assets**: `app/build/outputs/apk/release/` and `app/build/outputs/bundle/release/`.

## 📂 Key Files
*   `src/app/community/page.tsx`: Main explorer.
*   `src/components/ShareModal.tsx`: Direct code extraction.
*   `app/src/main/java/com/dizes/MainActivity.kt`: Deep link handler.
