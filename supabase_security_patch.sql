-- PARCHE DE SEGURIDAD PARA POLÍTICAS DE SUPABASE (MAYO 2026)
-- Este script concede los permisos necesarios a los roles de la API 
-- para evitar errores 42501 tras el cambio de política de Supabase.

-- 1. PERMISOS PARA LA TABLA 'profiles'
-- Permite que los visitantes (anon) vean los perfiles (necesario para ver nombres de autor)
GRANT SELECT ON public.profiles TO anon;
-- Permite que los usuarios registrados gestionen su perfil
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
-- Permite acceso total al rol de servicio (backend/admin)
GRANT ALL ON public.profiles TO service_role;

-- 2. PERMISOS PARA LA TABLA 'dice_packs'
-- Permite que los visitantes vean los dados compartidos
GRANT SELECT ON public.dice_packs TO anon;
-- Permite que los usuarios registrados suban y gestionen sus dados
GRANT SELECT, INSERT, UPDATE, DELETE ON public.dice_packs TO authenticated;
-- Permite acceso total al rol de servicio (moderación automática/admin)
GRANT ALL ON public.dice_packs TO service_role;

-- 3. VERIFICACIÓN DE RLS
-- Nos aseguramos de que Row Level Security siga activo para evitar acceso libre
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dice_packs ENABLE ROW LEVEL SECURITY;

-- NOTA: Este script no cambia tus políticas actuales (SELECT, INSERT, etc.), 
-- solo abre la "puerta" de la API para que las políticas puedan evaluarse.
