
-- Corregir la URL del webhook 'estatus-instancia' que está truncada
UPDATE public.webhook_endpoints 
SET url = 'https://repuestosonlinecrm-n8n.knbhoa.easypanel.host/webhook/estatus-instancia'
WHERE name = 'estatus-instancia';

-- Agregar el webhook 'eliminar-instancia' que falta
INSERT INTO public.webhook_endpoints (name, url, description)
VALUES (
  'eliminar-instancia',
  'https://repuestosonlinecrm-n8n.knbhoa.easypanel.host/webhook/eliminar-instancia',
  'Webhook para eliminar instancias de WhatsApp'
)
ON CONFLICT (name) DO UPDATE SET
  url = EXCLUDED.url,
  description = EXCLUDED.description,
  updated_at = now();

-- Verificar que todas las URLs estén correctas
SELECT name, url FROM public.webhook_endpoints ORDER BY name;
