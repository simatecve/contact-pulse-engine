
-- Agregar nuevos campos a la tabla messages
ALTER TABLE public.messages 
ADD COLUMN whatsapp_number TEXT,
ADD COLUMN pushname TEXT,
ADD COLUMN contact_name TEXT,
ADD COLUMN attachment_url TEXT;
