
-- Add webhook URL to webhook_endpoints table
INSERT INTO public.webhook_endpoints (name, url, description)
VALUES (
  'enviar-masivo',
  'https://repuestosonlinecrm-n8n.knbhoa.easypanel.host/webhook/enviar-masivo',
  'Webhook para envío masivo de campañas WhatsApp'
)
ON CONFLICT (name) DO UPDATE SET
  url = EXCLUDED.url,
  description = EXCLUDED.description,
  updated_at = now();
