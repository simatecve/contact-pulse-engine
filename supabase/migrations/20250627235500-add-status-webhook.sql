
-- Agregar el webhook de verificación de estatus
INSERT INTO public.webhook_endpoints (name, url, description) VALUES
('estatus-instancia', 'https://repuestosonlinecrm-n8n.knbhoa.easypanel.host/webhook/estatus-instancia', 'Webhook para verificar el estatus de la instancia de WhatsApp');
