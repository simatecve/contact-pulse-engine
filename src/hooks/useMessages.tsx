
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';
import { useEffect } from 'react';

export interface Message {
  id: string;
  conversation_id?: string;
  sender_type: string;
  content: string;
  message_type?: string;
  whatsapp_number?: string;
  pushname?: string;
  contact_name?: string;
  attachment_url?: string;
  instancia?: string;
  is_read?: boolean;
  sent_at?: string;
}

export interface MessageFormData {
  conversation_id?: string;
  sender_type: string;
  content: string;
  message_type?: string;
  whatsapp_number?: string;
  pushname?: string;
  contact_name?: string;
  attachment_url?: string;
  instancia?: string;
}

export const useMessages = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Configurar realtime para mensajes
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('messages-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Nuevo mensaje recibido:', payload.new);
          
          // Invalidar las queries de mensajes para refrescar la UI
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          
          // Si es un mensaje de una conversación específica, invalidar esa query también
          if (payload.new.conversation_id) {
            queryClient.invalidateQueries({ 
              queryKey: ['messages', 'conversation', payload.new.conversation_id] 
            });
          }
          
          // También invalidar conversaciones para actualizar el último mensaje
          queryClient.invalidateQueries({ queryKey: ['conversations'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        (payload) => {
          console.log('Mensaje actualizado:', payload.new);
          
          // Invalidar queries para refrescar
          queryClient.invalidateQueries({ queryKey: ['messages'] });
          
          if (payload.new.conversation_id) {
            queryClient.invalidateQueries({ 
              queryKey: ['messages', 'conversation', payload.new.conversation_id] 
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user, queryClient]);

  const fetchMessages = async (conversationId?: string): Promise<Message[]> => {
    if (!user) return [];
    
    let query = supabase
      .from('messages')
      .select('*')
      .order('sent_at', { ascending: true });

    if (conversationId) {
      query = query.eq('conversation_id', conversationId);
    }

    const { data, error } = await query;

    if (error) throw error;
    return data || [];
  };

  const createMessage = async (messageData: MessageFormData): Promise<Message> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...messageData,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateMessage = async ({ id, ...updateData }: Partial<Message> & { id: string }): Promise<Message> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('messages')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteMessage = async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('messages')
      .delete()
      .eq('id', id);

    if (error) throw error;
  };

  const messagesQuery = useQuery({
    queryKey: ['messages', user?.id],
    queryFn: () => fetchMessages(),
    enabled: !!user,
  });

  const getConversationMessages = (conversationId: string) => {
    return useQuery({
      queryKey: ['messages', 'conversation', conversationId],
      queryFn: () => fetchMessages(conversationId),
      enabled: !!user && !!conversationId,
      refetchInterval: false, // Deshabilitar polling ya que usamos realtime
    });
  };

  const createMessageMutation = useMutation({
    mutationFn: createMessage,
    onSuccess: () => {
      // No es necesario invalidar aquí ya que realtime se encarga
      // queryClient.invalidateQueries({ queryKey: ['messages'] });
      // queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al crear mensaje: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: updateMessage,
    onSuccess: () => {
      // Realtime se encarga de las actualizaciones
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar mensaje: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteMessageMutation = useMutation({
    mutationFn: deleteMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar mensaje: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    messages: messagesQuery.data || [],
    isLoading: messagesQuery.isLoading,
    error: messagesQuery.error,
    getConversationMessages,
    createMessage: createMessageMutation,
    updateMessage: updateMessageMutation,
    deleteMessage: deleteMessageMutation,
  };
};
