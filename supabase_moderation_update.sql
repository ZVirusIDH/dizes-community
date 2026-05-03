-- 1. Actualizar la tabla de perfiles con campos de moderación y cuotas
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_trusted BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS max_published INTEGER DEFAULT 30;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false;

-- 2. Actualizar la tabla dice_packs con campos de estado
ALTER TABLE public.dice_packs ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT true;
ALTER TABLE public.dice_packs ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'approved';

-- 3. Establecer el valor por defecto para nuevos dados como 'pending'
ALTER TABLE public.dice_packs ALTER COLUMN status SET DEFAULT 'pending';

-- 4. Hacer que el admin actual sea administrador en la base de datos
-- Reemplaza 'TU_USER_ID' con tu ID de Supabase si lo conoces, 
-- o usa el email en el dashboard de Supabase para encontrarlo.
UPDATE public.profiles SET is_admin = true, is_trusted = true WHERE id = 'afd23207-8ae9-4ecc-9d56-57299f6874db'; -- ID de la sesión actual si coincide
