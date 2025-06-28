
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
    updateConversation: updateConversationMutation,
    deleteConversation: deleteConversationMutation,
  };
};
