
-- Actualizar la tabla de conversaciones para incluir instancia y whatsapp_number
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS instancia TEXT,
ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;

-- Crear índices para los nuevos campos
CREATE INDEX IF NOT EXISTS idx_conversations_instancia ON public.conversations(instancia);
CREATE INDEX IF NOT EXISTS idx_conversations_whatsapp_number ON public.conversations(whatsapp_number);

-- Actualizar la función del trigger para usar los nuevos campos
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
        -- Si ambos tienen instancia, deben coincidir
        (NEW.instancia IS NOT NULL AND instancia = NEW.instancia)
        -- Si el mensaje no tiene instancia, buscar conversaciones sin instancia
        OR (NEW.instancia IS NULL AND instancia IS NULL)
        -- Si no hay conversación con instancia específica, usar cualquiera del mismo número
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
        now(),
        now()
      )
      RETURNING id INTO new_conversation_id;
      
      -- Asignar conversación al mensaje
      NEW.conversation_id = new_conversation_id;
      
      RAISE NOTICE 'NUEVA CONVERSACIÓN CREADA: ID=%, user_id=%, whatsapp_number=%, instancia=%', 
        new_conversation_id, fallback_user_id, NEW.whatsapp_number, NEW.instancia;
        
    ELSE
      -- Usar conversación existente
      NEW.conversation_id = existing_conversation_id;
      
      -- Actualizar última actividad y datos de contacto
      UPDATE public.conversations 
      SET 
        last_message_at = COALESCE(NEW.sent_at, now()),
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

-- Insertar mensaje de prueba para verificar el funcionamiento
INSERT INTO public.messages (
  sender_type,
  content,
  whatsapp_number,
  contact_name,
  instancia,
  sent_at
) VALUES (
  'contact',
  'Mensaje de prueba con instancia',
  '+1234567891',
  'Usuario Prueba 2',
  'instancia_test_001',
  now()
);
