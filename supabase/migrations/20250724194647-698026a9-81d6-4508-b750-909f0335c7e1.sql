
-- Insertar la URL del webhook para obtener códigos QR
INSERT INTO public.webhook_endpoints (name, url, description) 
VALUES ('qr', 'https://n8n.repuestosonline.com.ve/webhook/qr', 'Webhook para obtener códigos QR de WhatsApp')
ON CONFLICT (name) DO UPDATE SET 
  url = EXCLUDED.url,
  description = EXCLUDED.description,
  updated_at = now();
