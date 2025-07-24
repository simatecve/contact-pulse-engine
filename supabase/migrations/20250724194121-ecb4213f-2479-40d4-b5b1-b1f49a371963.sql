
-- Actualizar las políticas RLS para whatsapp_connections para permitir que los admins vean todas las conexiones

-- Eliminar las políticas existentes restrictivas
DROP POLICY IF EXISTS "Users can view their own connections" ON public.whatsapp_connections;
DROP POLICY IF EXISTS "Users can create their own connections" ON public.whatsapp_connections;
DROP POLICY IF EXISTS "Users can update their own connections" ON public.whatsapp_connections;
DROP POLICY IF EXISTS "Users can delete their own connections" ON public.whatsapp_connections;

-- Crear nuevas políticas que permitan a los admins ver todas las conexiones
CREATE POLICY "Users can view connections with permission" 
ON public.whatsapp_connections 
FOR SELECT 
USING (
  auth.uid() = user_id OR 
  has_permission(auth.uid(), 'whatsapp.view_all') OR 
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can create their own connections" 
ON public.whatsapp_connections 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update connections with permission" 
ON public.whatsapp_connections 
FOR UPDATE 
USING (
  auth.uid() = user_id OR 
  has_permission(auth.uid(), 'whatsapp.manage_all') OR 
  has_role(auth.uid(), 'admin')
);

CREATE POLICY "Users can delete connections with permission" 
ON public.whatsapp_connections 
FOR DELETE 
USING (
  auth.uid() = user_id OR 
  has_permission(auth.uid(), 'whatsapp.manage_all') OR 
  has_role(auth.uid(), 'admin')
);
