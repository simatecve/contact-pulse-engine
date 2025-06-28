
-- Crear función que se ejecutará cuando se inserte un mensaje
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
DECLARE
  existing_conversation_id UUID;
  new_conversation_id UUID;
BEGIN
  -- Solo procesar mensajes de WhatsApp que tengan número de teléfono
  IF NEW.whatsapp_number IS NOT NULL AND NEW.sender_type = 'contact' THEN
    
    -- Buscar conversación existente por instancia y número de WhatsApp
    SELECT id INTO existing_conversation_id
    FROM public.conversations 
    WHERE channel = 'whatsapp' 
      AND contact_phone = NEW.whatsapp_number
      AND (
        -- Si el mensaje tiene instancia, buscar por instancia
        (NEW.instancia IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.messages 
          WHERE conversation_id = conversations.id 
            AND instancia = NEW.instancia
          LIMIT 1
        ))
        -- Si no tiene instancia, buscar conversaciones sin instancia específica
        OR (NEW.instancia IS NULL)
      )
    LIMIT 1;
    
    -- Si no existe conversación, crear una nueva
    IF existing_conversation_id IS NULL THEN
      INSERT INTO public.conversations (
        user_id,
        channel,
        contact_phone,
        contact_name,
        status,
        last_message_at
      ) VALUES (
        -- Usar el primer usuario disponible como fallback
        COALESCE(
          (SELECT id FROM auth.users LIMIT 1),
          '00000000-0000-0000-0000-000000000000'::UUID
        ),
        'whatsapp',
        NEW.whatsapp_number,
        COALESCE(NEW.contact_name, NEW.pushname),
        'active',
        NEW.sent_at
      )
      RETURNING id INTO new_conversation_id;
      
      -- Asignar el mensaje a la nueva conversación
      NEW.conversation_id = new_conversation_id;
    ELSE
      -- Asignar el mensaje a la conversación existente
      NEW.conversation_id = existing_conversation_id;
      
      -- Actualizar la última actividad de la conversación
      UPDATE public.conversations 
      SET 
        last_message_at = NEW.sent_at,
        contact_name = COALESCE(NEW.contact_name, NEW.pushname, contact_name)
      WHERE id = existing_conversation_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger que se ejecute antes de insertar un mensaje
DROP TRIGGER IF EXISTS trigger_handle_new_message ON public.messages;
CREATE TRIGGER trigger_handle_new_message
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message();

-- También crear un trigger para actualizar la última actividad cuando se inserten mensajes
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Actualizar last_message_at si el mensaje tiene conversation_id
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE public.conversations 
    SET last_message_at = NEW.sent_at
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger para actualizar última actividad
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON public.messages;
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();
