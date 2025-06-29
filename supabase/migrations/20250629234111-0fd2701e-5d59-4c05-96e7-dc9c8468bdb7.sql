
-- Crear enum para los roles de usuario
CREATE TYPE public.app_role AS ENUM ('admin', 'manager', 'agent', 'viewer');

-- Crear tabla de roles de usuario
CREATE TABLE public.user_roles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'viewer',
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE(user_id)
);

-- Crear tabla de permisos
CREATE TABLE public.permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  module TEXT NOT NULL, -- dashboard, conversations, contacts, leads, campaigns, etc.
  action TEXT NOT NULL, -- create, read, update, delete, manage
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Crear tabla de permisos por rol
CREATE TABLE public.role_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  role app_role NOT NULL,
  permission_id UUID REFERENCES public.permissions(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(role, permission_id)
);

-- Insertar permisos básicos del sistema
INSERT INTO public.permissions (name, description, module, action) VALUES
-- Dashboard
('dashboard.view', 'Ver dashboard', 'dashboard', 'read'),
('dashboard.manage', 'Gestionar configuración del dashboard', 'dashboard', 'manage'),

-- Conversaciones
('conversations.view', 'Ver conversaciones', 'conversations', 'read'),
('conversations.reply', 'Responder conversaciones', 'conversations', 'update'),
('conversations.manage', 'Gestionar todas las conversaciones', 'conversations', 'manage'),

-- Contactos
('contacts.view', 'Ver contactos', 'contacts', 'read'),
('contacts.create', 'Crear contactos', 'contacts', 'create'),
('contacts.update', 'Editar contactos', 'contacts', 'update'),
('contacts.delete', 'Eliminar contactos', 'contacts', 'delete'),
('contacts.import', 'Importar contactos', 'contacts', 'manage'),

-- Leads
('leads.view', 'Ver leads', 'leads', 'read'),
('leads.create', 'Crear leads', 'leads', 'create'),
('leads.update', 'Editar leads', 'leads', 'update'),
('leads.delete', 'Eliminar leads', 'leads', 'delete'),
('leads.assign', 'Asignar leads', 'leads', 'manage'),

-- Campañas
('campaigns.view', 'Ver campañas', 'campaigns', 'read'),
('campaigns.create', 'Crear campañas', 'campaigns', 'create'),
('campaigns.update', 'Editar campañas', 'campaigns', 'update'),
('campaigns.delete', 'Eliminar campañas', 'campaigns', 'delete'),
('campaigns.send', 'Enviar campañas', 'campaigns', 'manage'),

-- WhatsApp
('whatsapp.view', 'Ver conexiones WhatsApp', 'whatsapp', 'read'),
('whatsapp.manage', 'Gestionar conexiones WhatsApp', 'whatsapp', 'manage'),

-- Reportes
('reports.view', 'Ver reportes', 'reports', 'read'),
('reports.export', 'Exportar reportes', 'reports', 'manage'),

-- IA y Configuración
('ai.manage', 'Gestionar agentes IA', 'ai', 'manage'),
('settings.view', 'Ver configuración', 'settings', 'read'),
('settings.manage', 'Gestionar configuración', 'settings', 'manage'),

-- Usuarios (solo admin)
('users.view', 'Ver usuarios', 'users', 'read'),
('users.create', 'Crear usuarios', 'users', 'create'),  
('users.update', 'Editar usuarios', 'users', 'update'),
('users.delete', 'Eliminar usuarios', 'users', 'delete'),
('users.roles', 'Gestionar roles de usuarios', 'users', 'manage');

-- Asignar permisos por rol
-- ADMIN: Todos los permisos
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'admin', id FROM public.permissions;

-- MANAGER: Todos excepto gestión de usuarios
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'manager', id FROM public.permissions 
WHERE module != 'users' OR (module = 'users' AND action = 'read');

-- AGENT: Permisos operativos básicos
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'agent', id FROM public.permissions 
WHERE name IN (
  'dashboard.view',
  'conversations.view', 'conversations.reply',
  'contacts.view', 'contacts.create', 'contacts.update',
  'leads.view', 'leads.create', 'leads.update',
  'campaigns.view',
  'whatsapp.view',
  'reports.view'
);

-- VIEWER: Solo permisos de lectura
INSERT INTO public.role_permissions (role, permission_id)
SELECT 'viewer', id FROM public.permissions 
WHERE action = 'read';

-- Habilitar RLS en las nuevas tablas
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- Función para verificar si un usuario tiene un rol específico
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
      AND is_active = true
  )
$$;

-- Función para verificar si un usuario tiene un permiso específico
CREATE OR REPLACE FUNCTION public.has_permission(_user_id UUID, _permission_name TEXT)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles ur
    JOIN public.role_permissions rp ON ur.role = rp.role
    JOIN public.permissions p ON rp.permission_id = p.id
    WHERE ur.user_id = _user_id
      AND ur.is_active = true
      AND p.name = _permission_name
  )
$$;

-- Función para obtener el rol de un usuario
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
STABLE
SECURITY DEFINER
AS $$
  SELECT role
  FROM public.user_roles
  WHERE user_id = _user_id
    AND is_active = true
  LIMIT 1
$$;

-- Políticas RLS para user_roles
CREATE POLICY "Users can view their own role"
ON public.user_roles
FOR SELECT
USING (auth.uid() = user_id OR public.has_permission(auth.uid(), 'users.view'));

CREATE POLICY "Admins can manage user roles"
ON public.user_roles
FOR ALL
USING (public.has_permission(auth.uid(), 'users.roles'));

-- Políticas RLS para permissions (solo lectura para usuarios autenticados)
CREATE POLICY "Authenticated users can view permissions"
ON public.permissions
FOR SELECT
USING (auth.role() = 'authenticated');

-- Políticas RLS para role_permissions (solo lectura para usuarios autenticados)
CREATE POLICY "Authenticated users can view role permissions"
ON public.role_permissions
FOR SELECT
USING (auth.role() = 'authenticated');

-- Trigger para asignar rol 'viewer' por defecto a nuevos usuarios
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'viewer');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user_role();

-- Actualizar políticas RLS existentes para incluir verificación de permisos
-- Ejemplo para la tabla conversations
DROP POLICY IF EXISTS "Users can view their own conversations" ON public.conversations;
CREATE POLICY "Users can view conversations with permission"
ON public.conversations
FOR SELECT
USING (
  auth.uid() = user_id OR 
  public.has_permission(auth.uid(), 'conversations.view') OR
  public.has_permission(auth.uid(), 'conversations.manage')
);

-- Ejemplo para la tabla leads  
DROP POLICY IF EXISTS "Users can view their own leads" ON public.leads;
CREATE POLICY "Users can view leads with permission"
ON public.leads
FOR SELECT
USING (
  auth.uid() = user_id OR
  public.has_permission(auth.uid(), 'leads.view') OR
  public.has_permission(auth.uid(), 'leads.assign')
);
