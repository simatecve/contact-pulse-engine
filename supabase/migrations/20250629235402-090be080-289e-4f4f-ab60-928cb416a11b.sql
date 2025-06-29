
-- Mejorar la tabla profiles para incluir más campos
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT,
ADD COLUMN IF NOT EXISTS company TEXT;

-- Crear tabla para permisos específicos por usuario
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE NOT NULL,
  granted_by UUID REFERENCES auth.users(id),
  granted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id, permission_id)
);

-- Habilitar RLS en la nueva tabla
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Política para que solo admins puedan gestionar permisos de usuario
CREATE POLICY "Admins can manage user permissions"
ON public.user_permissions
FOR ALL
USING (public.has_permission(auth.uid(), 'users.roles'));

-- Función mejorada para verificar permisos (rol + permisos individuales)
CREATE OR REPLACE FUNCTION public.has_permission_enhanced(_user_id UUID, _permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    -- Verificar permisos por rol
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
      AND ur.is_active = true
      AND p.name = _permission_name
  ) OR EXISTS (
    -- Verificar permisos individuales
    SELECT 1
    FROM public.user_permissions up
    JOIN public.permissions p ON up.permission_id = p.id
    WHERE up.user_id = _user_id
      AND up.is_active = true
      AND p.name = _permission_name
  )
$$;

-- Función para obtener todos los permisos de un usuario (rol + individuales)
CREATE OR REPLACE FUNCTION public.get_user_permissions(_user_id UUID)
RETURNS TABLE(permission_name TEXT, source TEXT)
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  -- Permisos por rol
  SELECT p.name as permission_name, 'role' as source
  FROM public.user_roles ur
  JOIN public.role_permissions rp ON ur.role = rp.role
  JOIN public.permissions p ON rp.permission_id = p.id
  WHERE ur.user_id = _user_id
    AND ur.is_active = true
  
  UNION
  
  -- Permisos individuales
  SELECT p.name as permission_name, 'individual' as source
  FROM public.user_permissions up
  JOIN public.permissions p ON up.permission_id = p.id
  WHERE up.user_id = _user_id
    AND up.is_active = true
$$;
