
-- Agregar campo para asignar agente a conversaciones
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS assigned_agent_id UUID REFERENCES auth.users(id);

-- Agregar índice para mejorar el rendimiento de consultas por agente
CREATE INDEX IF NOT EXISTS idx_conversations_assigned_agent 
ON public.conversations(assigned_agent_id);

-- Agregar campo para fecha de asignación
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMP WITH TIME ZONE;

-- Agregar campo para quien asignó el agente
ALTER TABLE public.conversations 
ADD COLUMN IF NOT EXISTS assigned_by UUID REFERENCES auth.users(id);

-- Crear tabla para historial de asignaciones
CREATE TABLE IF NOT EXISTS public.conversation_assignments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  agent_id UUID REFERENCES auth.users(id),
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  unassigned_at TIMESTAMP WITH TIME ZONE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Agregar RLS para la tabla de asignaciones
ALTER TABLE public.conversation_assignments ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver asignaciones relacionadas con sus conversaciones
CREATE POLICY "Users can view conversation assignments" 
ON public.conversation_assignments 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND user_id = auth.uid()
  )
);

-- Política para que los usuarios puedan crear asignaciones en sus conversaciones
CREATE POLICY "Users can create conversation assignments" 
ON public.conversation_assignments 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.conversations 
    WHERE id = conversation_id 
    AND user_id = auth.uid()
  )
);
