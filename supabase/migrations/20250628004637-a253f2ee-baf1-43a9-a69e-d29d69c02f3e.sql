
-- Primero eliminamos los triggers existentes para recrearlos correctamente
DROP TRIGGER IF EXISTS trigger_handle_new_message ON public.messages;
DROP TRIGGER IF EXISTS trigger_update_conversation_last_message ON public.messages;

-- Recrear la función con lógica mejorada
CREATE OR REPLACE FUNCTION public.handle_new_message()
RETURNS TRIGGER AS $$
DECLARE
  existing_conversation_id UUID;
  new_conversation_id UUID;
  fallback_user_id UUID;
BEGIN
  -- Solo procesar mensajes de WhatsApp que tengan número de teléfono
  IF NEW.whatsapp_number IS NOT NULL AND NEW.sender_type = 'contact' THEN
    
    -- Obtener un usuario por defecto
    SELECT id INTO fallback_user_id FROM auth.users ORDER BY created_at LIMIT 1;
    
    -- Si no hay usuarios, usar un UUID por defecto
    IF fallback_user_id IS NULL THEN
      fallback_user_id := '00000000-0000-0000-0000-000000000000'::UUID;
    END IF;
    
    -- Buscar conversación existente por número de WhatsApp e instancia
    SELECT c.id INTO existing_conversation_id
    FROM public.conversations c
    WHERE c.channel = 'whatsapp' 
      AND c.contact_phone = NEW.whatsapp_number
      AND (
        -- Si el mensaje tiene instancia, buscar conversaciones de la misma instancia
        (NEW.instancia IS NOT NULL AND EXISTS (
          SELECT 1 FROM public.messages m 
          WHERE m.conversation_id = c.id 
            AND m.instancia = NEW.instancia
          LIMIT 1
        ))
        -- Si no tiene instancia, buscar cualquier conversación del mismo número
        OR (NEW.instancia IS NULL)
      )
    ORDER BY c.last_message_at DESC
    LIMIT 1;
    
    -- Si no existe conversación, crear una nueva
    IF existing_conversation_id IS NULL THEN
      INSERT INTO public.conversations (
        user_id,
        channel,
        contact_phone,
        contact_name,
        status,
        last_message_at,
        created_at,
        updated_at
      ) VALUES (
        fallback_user_id,
        'whatsapp',
        NEW.whatsapp_number,
        COALESCE(NEW.contact_name, NEW.pushname, 'Usuario WhatsApp'),
        'active',
        COALESCE(NEW.sent_at, now()),
        now(),
        now()
      )
      RETURNING id INTO new_conversation_id;
      
      -- Asignar el mensaje a la nueva conversación
      NEW.conversation_id = new_conversation_id;
      
      -- Log para debugging
      RAISE NOTICE 'Nueva conversación creada: % para número: % instancia: %', 
        new_conversation_id, NEW.whatsapp_number, NEW.instancia;
        
    ELSE
      -- Asignar el mensaje a la conversación existente
      NEW.conversation_id = existing_conversation_id;
      
      -- Actualizar la última actividad de la conversación
      UPDATE public.conversations 
      SET 
        last_message_at = COALESCE(NEW.sent_at, now()),
        contact_name = COALESCE(NEW.contact_name, NEW.pushname, contact_name),
        updated_at = now()
      WHERE id = existing_conversation_id;
      
      -- Log para debugging
      RAISE NOTICE 'Mensaje asignado a conversación existente: % para número: %', 
        existing_conversation_id, NEW.whatsapp_number;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear el trigger que se ejecute ANTES de insertar un mensaje
CREATE TRIGGER trigger_handle_new_message
  BEFORE INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_message();

-- Función para actualizar última actividad (simplificada)
CREATE OR REPLACE FUNCTION public.update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Solo actualizar si el mensaje ya tiene conversation_id asignado
  IF NEW.conversation_id IS NOT NULL THEN
    UPDATE public.conversations 
    SET 
      last_message_at = COALESCE(NEW.sent_at, now()),
      updated_at = now()
    WHERE id = NEW.conversation_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recrear el trigger DESPUÉS de insertar para actualizar última actividad
CREATE TRIGGER trigger_update_conversation_last_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_conversation_last_message();
