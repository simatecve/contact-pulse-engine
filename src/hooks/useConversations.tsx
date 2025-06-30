
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import { useEffect } from 'react';

export interface Conversation {
  id: string;
  user_id: string;
  channel: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  whatsapp_number?: string;
  instancia?: string;
  instance_color?: string;
  status?: string;
  last_message_at?: string;
  last_message_content?: string;
  assigned_agent_id?: string;
  assigned_at?: string;
  assigned_by?: string;
  created_at: string;
  updated_at: string;
}

export interface ConversationFormData {
  channel: string;
  contact_name?: string;
  contact_phone?: string;
  contact_email?: string;
  whatsapp_number?: string;
  instancia?: string;
  instance_color?: string;
  status?: string;
}

export const useConversations = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Configurar realtime para conversaciones
  useEffect(() => {
    if (!user) return;

    console.log('Configurando realtime para conversaciones...');

    const channel = supabase
      .channel('conversations-realtime-' + user.id)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Nueva conversación via realtime:', payload.new);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'conversations',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Conversación actualizada via realtime:', payload.new);
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .subscribe((status) => {
        console.log('Estado del canal de conversaciones:', status);
      });

    return () => {
      console.log('Desconectando canal de conversaciones...');
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

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

  const assignAgent = async ({ conversationId, agentId, notes }: { conversationId: string; agentId?: string; notes?: string }): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    // Actualizar la conversación
    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        assigned_agent_id: agentId,
        assigned_at: agentId ? new Date().toISOString() : null,
        assigned_by: agentId ? user.id : null,
      })
      .eq('id', conversationId)
      .eq('user_id', user.id);

    if (updateError) throw updateError;

    // Crear registro en el historial de asignaciones
    if (agentId) {
      const { error: assignmentError } = await supabase
        .from('conversation_assignments')
        .insert({
          conversation_id: conversationId,
          agent_id: agentId,
          assigned_by: user.id,
          notes: notes,
        });

      if (assignmentError) throw assignmentError;
    }
  };

  const conversationsQuery = useQuery({
    queryKey: ['conversations', user?.id],
    queryFn: fetchConversations,
    enabled: !!user,
    staleTime: 0, // Siempre considerar los datos como obsoletos para forzar actualizaciones
    refetchInterval: false,
  });

  const createConversationMutation = useMutation({
    mutationFn: createConversation,
    onSuccess: (data) => {
      console.log('Conversación creada:', data);
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
    onSuccess: (data) => {
      console.log('Conversación actualizada:', data);
      // Forzar invalidación inmediata
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

  const assignAgentMutation = useMutation({
    mutationFn: assignAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
      toast({
        title: "Agente asignado",
        description: "El agente se ha asignado exitosamente a la conversación.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al asignar agente: ${error.message}`,
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
    assignAgent: assignAgentMutation,
  };
};
