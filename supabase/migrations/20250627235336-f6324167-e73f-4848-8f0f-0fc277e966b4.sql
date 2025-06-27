
-- Crear tabla para almacenar los webhooks
CREATE TABLE public.webhook_endpoints (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  url TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insertar los webhooks existentes
INSERT INTO public.webhook_endpoints (name, url, description) VALUES
('crear-instancia', 'https://repuestosonlinecrm-n8n.knbhoa.easypanel.host/webhook/crear-instancia', 'Webhook para crear nueva instancia de WhatsApp'),
('qr', 'https://repuestosonlinecrm-n8n.knbhoa.easypanel.host/webhook/qr', 'Webhook para obtener código QR de WhatsApp');

-- Habilitar RLS (solo lectura para todos los usuarios autenticados)
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;

-- Política para que todos los usuarios autenticados puedan leer los webhooks
CREATE POLICY "Authenticated users can view webhooks" 
  ON public.webhook_endpoints 
  FOR SELECT 
  USING (auth.role() = 'authenticated');
