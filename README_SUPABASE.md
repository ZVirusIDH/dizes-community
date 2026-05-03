# Guía de Configuración de Supabase para Moderación

Para activar el sistema de moderación, cuotas y administración, sigue estos pasos:

### 1. Ejecutar el Script SQL
1. Entra en tu **Supabase Dashboard**.
2. Ve a la sección **SQL Editor** en el menú lateral izquierdo.
3. Haz clic en **"New query"**.
4. Copia y pega el contenido del archivo `supabase_moderation_update.sql` que he creado en la raíz del proyecto.
5. Pulsa el botón **"Run"**.

### 2. ¿Qué hace este script?
*   Añade columnas a la tabla `profiles`:
    *   `is_admin`: Te permite acceder a la pestaña "Pendientes" y borrar cualquier dado.
    *   `is_trusted`: Los usuarios marcados así no necesitan aprobación para sus subidas.
    *   `max_published`: Define cuántos dados puede publicar ese usuario (por defecto 30).
*   Añade columnas a la tabla `dice_packs`:
    *   `status`: Puede ser 'pending', 'approved' o 'rejected'. Por defecto ahora es 'pending' para nuevos usuarios.
    *   `is_published`: Permite al usuario ocultar sus dados sin borrarlos.

### 3. Convertirte en Administrador
El script intenta convertirte en admin automáticamente si detecta tu ID, pero lo más seguro es hacerlo manualmente una vez:
1. Ve a la pestaña **Table Editor**.
2. Selecciona la tabla `profiles`.
3. Busca tu usuario (puedes guiarte por el campo `username` o `avatar_url`).
4. Marca la casilla `is_admin` como `true` y `is_trusted` como `true`.

### 4. Flujo de Moderación
*   Cuando un usuario sube un dado, aparecerá en estado **"pending"**.
*   Tú, como admin, verás una pestaña llamada **"PENDIENTES"** en la web.
*   En cada tarjeta de dado pendiente, tendrás un botón verde **"APROBAR"**.
*   Una vez aprobado, el dado será visible para todo el mundo.

---
**Nota:** He corregido el error de compilación que daba Vercel (faltaban declarar los nuevos modales en el archivo principal). Ya puedes desplegar de nuevo.
