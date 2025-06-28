
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useConversations } from './useConversations';
import { toast } from './use-toast';

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
  const { findOrCreateConversation } = useConversations();
  const queryClient = useQueryClient();

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

    // Si es un mensaje de WhatsApp entrante, crear o encontrar conversación
    let conversationId = messageData.conversation_id;
    
    if (messageData.whatsapp_number && messageData.sender_type === 'contact') {
      try {
        const conversation = await findOrCreateConversation.mutateAsync({
          whatsappNumber: messageData.whatsapp_number,
          contactName: messageData.contact_name || messageData.pushname
        });
        conversationId = conversation.id;
      } catch (error) {
        console.error('Error al crear/encontrar conversación:', error);
      }
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        ...messageData,
        conversation_id: conversationId,
        sent_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const processIncomingWhatsAppMessage = async (
    whatsappNumber: string,
    content: string,
    contactName?: string,
    pushname?: string,
    instancia?: string,
    attachmentUrl?: string
  ): Promise<Message> => {
    const messageData: MessageFormData = {
      sender_type: 'contact',
      content,
      message_type: attachmentUrl ? 'media' : 'text',
      whatsapp_number: whatsappNumber,
      pushname,
      contact_name: contactName,
      attachment_url: attachmentUrl,
      instancia,
    };

    return createMessage(messageData);
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
    });
  };

  const createMessageMutation = useMutation({
    mutationFn: createMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al crear mensaje: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const processIncomingMessageMutation = useMutation({
    mutationFn: ({ whatsappNumber, content, contactName, pushname, instancia, attachmentUrl }: {
      whatsappNumber: string;
      content: string;
      contactName?: string;
      pushname?: string;
      instancia?: string;
      attachmentUrl?: string;
    }) => processIncomingWhatsAppMessage(whatsappNumber, content, contactName, pushname, instancia, attachmentUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      queryClient.invalidateQueries({ queryKey: ['conversations'] });
    },
    onError: (error) => {
      console.error('Error al procesar mensaje entrante:', error);
    },
  });

  const updateMessageMutation = useMutation({
    mutationFn: updateMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
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
    processIncomingMessage: processIncomingMessageMutation,
    updateMessage: updateMessageMutation,
    deleteMessage: deleteMessageMutation,
  };
};
