
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export interface Conversation {
  id: string;
  user_id: string;
  channel: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  status?: string;
  last_message_at?: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationFormData {
  channel: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  status?: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchConversations = async (): Promise<Conversation[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .order('last_message_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const createConversation = async (conversationData: ConversationFormData): Promise<Conversation> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('conversations')
      .insert({
        ...conversationData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const findOrCreateConversation = async (whatsappNumber: string, contactName?: string): Promise<Conversation> => {
    if (!user) throw new Error('Usuario no autenticado');

    // Buscar conversación existente por número de WhatsApp
    const { data: existingConversation, error: fetchError } = await supabase
      .from('conversations')
      .select('*')
      .eq('user_id', user.id)
      .eq('channel', 'whatsapp')
      .eq('contact_phone', whatsappNumber)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      throw fetchError;
    }

    if (existingConversation) {
      // Actualizar last_message_at
      const { data: updatedConversation, error: updateError } = await supabase
        .from('conversations')
        .update({ 
          last_message_at: new Date().toISOString(),
          contact_name: contactName || existingConversation.contact_name
        })
        .eq('id', existingConversation.id)
        .select()
        .single();

      if (updateError) throw updateError;
      return updatedConversation;
    }

    // Crear nueva conversación
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        user_id: user.id,
        channel: 'whatsapp',
        contact_phone: whatsappNumber,
        contact_name: contactName,
        status: 'active',
        last_message_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (createError) throw createError;
    return newConversation;
  };

  const updateConversation = async ({ id, ...updateData }: Partial<Conversation> & { id: string }): Promise<Conversation> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('conversations')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteConversation = async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('conversations')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const conversationsQuery = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: fetchConversations,
    enabled: !!user,
  });

  const createConversationMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Conversación creada",
        description: "La conversación se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al crear conversación: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const findOrCreateConversationMutation = useMutation({
    mutationFn: ({ whatsappNumber, contactName }: { whatsappNumber: string; contactName?: string }) => 
      findOrCreateConversation(whatsappNumber, contactName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Error al encontrar/crear conversación:', error);
    },
  });

  const updateConversationMutation = useMutation({
    mutationFn: updateConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar conversación: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteConversationMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Conversación eliminada",
        description: "La conversación se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar conversación: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    conversations: conversationsQuery.data || [],
    isLoading: conversationsQuery.isLoading,
    error: conversationsQuery.error,
    createConversation: createConversationMutation,
    findOrCreateConversation: findOrCreateConversationMutation,
    updateConversation: updateConversationMutation,
    deleteConversation: deleteConversationMutation,
  };
};
