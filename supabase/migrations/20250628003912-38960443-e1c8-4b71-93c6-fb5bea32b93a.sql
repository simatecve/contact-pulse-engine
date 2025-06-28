
-- Corregir el problema de user_id null en leads y habilitar RLS para conversations y messages
UPDATE public.leads 
SET user_id = (SELECT id FROM auth.users LIMIT 1) 
WHERE user_id IS NULL;

-- Hacer user_id NOT NULL en leads
ALTER TABLE public.leads 
ALTER COLUMN user_id SET NOT NULL;

-- Habilitar RLS para conversations y messages
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Crear policies para conversations
CREATE POLICY "Users can view their own conversations" 
  ON public.conversations 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own conversations" 
  ON public.conversations 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own conversations" 
  ON public.conversations 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own conversations" 
  ON public.conversations 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Crear policies para messages
CREATE POLICY "Users can view messages from their conversations" 
  ON public.messages 
  FOR SELECT 
  USING (
    conversation_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages" 
  ON public.messages 
  FOR INSERT 
  WITH CHECK (
    conversation_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update messages from their conversations" 
  ON public.messages 
  FOR UPDATE 
  USING (
    conversation_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete messages from their conversations" 
  ON public.messages 
  FOR DELETE 
  USING (
    conversation_id IS NULL OR 
    EXISTS (
      SELECT 1 FROM public.conversations 
      WHERE conversations.id = messages.conversation_id 
      AND conversations.user_id = auth.uid()
    )
  );
