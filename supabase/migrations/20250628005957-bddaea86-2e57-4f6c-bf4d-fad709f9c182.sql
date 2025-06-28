
-- Agregar campo para el último mensaje en conversaciones
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS last_message_content TEXT;

-- Agregar campo para el color de la instancia en conversaciones
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS instance_color TEXT DEFAULT '#3B82F6';

-- Actualizar la función del trigger para incluir el último mensaje
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
DECLARE
  existing_conversation_id UUID;
  new_conversation_id UUID;
  fallback_user_id UUID;
BEGIN
  -- Log de entrada
  RAISE NOTICE 'INICIO: Procesando mensaje ID=%, whatsapp_number=%, instancia=%, sender_type=%', 
    NEW.id, NEW.whatsapp_number, NEW.instancia, NEW.sender_type;
  
  -- Solo procesar mensajes de WhatsApp de contactos
  IF NEW.whatsapp_number IS NOT NULL AND NEW.sender_type = 'contact' THEN
    
    -- Obtener el primer usuario disponible
    SELECT id INTO fallback_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    
    -- Si no hay usuarios, usar UUID por defecto
    IF fallback_user_id IS NULL THEN
      fallback_user_id := '00000000-0000-0000-0000-000000000000'::UUID;
      RAISE NOTICE 'Usando usuario por defecto: %', fallback_user_id;
    ELSE
      RAISE NOTICE 'Usuario encontrado: %', fallback_user_id;
    END IF;
    
    -- Buscar conversación existente por whatsapp_number e instancia
    SELECT id INTO existing_conversation_id
    FROM public.conversations 
    WHERE channel = 'whatsapp' 
      AND whatsapp_number = NEW.whatsapp_number
      AND (
        (NEW.instancia IS NOT NULL AND instancia = NEW.instancia)
        OR (NEW.instancia IS NULL AND instancia IS NULL)
        OR (NEW.instancia IS NOT NULL AND instancia IS NULL)
      )
    ORDER BY last_message_at DESC
    LIMIT 1;
    
    RAISE NOTICE 'Conversación existente encontrada: %', existing_conversation_id;
    
    -- Si no existe conversación, crear una nueva
    IF existing_conversation_id IS NULL THEN
      INSERT INTO public.conversations (
        user_id,
        channel,
        contact_phone,
        contact_name,
        whatsapp_number,
        instancia,
        status,
        last_message_at,
        last_message_content,
        instance_color,
        created_at,
        updated_at
      ) VALUES (
        fallback_user_id,
        'whatsapp',
        NEW.whatsapp_number,
        COALESCE(NEW.contact_name, NEW.pushname, 'Usuario WhatsApp'),
        NEW.whatsapp_number,
        NEW.instancia,
        'active',
        COALESCE(NEW.sent_at, now()),
        NEW.content,
        '#3B82F6',
        now(),
        now()
      )
      RETURNING id INTO new_conversation_id;
      
      NEW.conversation_id = new_conversation_id;
      
      RAISE NOTICE 'NUEVA CONVERSACIÓN CREADA: ID=%, user_id=%, whatsapp_number=%, instancia=%', 
        new_conversation_id, fallback_user_id, NEW.whatsapp_number, NEW.instancia;
        
    ELSE
      NEW.conversation_id = existing_conversation_id;
      
      -- Actualizar última actividad y último mensaje
      UPDATE public.conversations 
      SET 
        last_message_at = COALESCE(NEW.sent_at, now()),
        last_message_content = NEW.content,
        contact_name = COALESCE(NEW.contact_name, NEW.pushname, contact_name),
        instancia = COALESCE(NEW.instancia, instancia),
        updated_at = now()
      WHERE id = existing_conversation_id;
      
      RAISE NOTICE 'CONVERSACIÓN EXISTENTE USADA: ID=%, whatsapp_number=%, instancia=%', 
        existing_conversation_id, NEW.whatsapp_number, NEW.instancia;
    END IF;
    
  ELSE
    RAISE NOTICE 'Mensaje NO procesado: whatsapp_number=%, sender_type=%', 
      NEW.whatsapp_number, NEW.sender_type;
  END IF;
  
  RAISE NOTICE 'FIN: Mensaje procesado. conversation_id final=%', NEW.conversation_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Agregar el webhook para enviar mensajes
INSERT INTO public.webhook_endpoints (name, url, description) VALUES
('enviar-mensaje', 'https://repuestosonlinecrm-n8n.knbhoa.easypanel.host/webhook/evniar-mensaje', 'Webhook para enviar mensajes de WhatsApp')
ON CONFLICT (name) DO UPDATE SET
url = EXCLUDED.url,
description = EXCLUDED.description;
