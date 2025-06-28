
import React, { useState, useCallback } from 'react';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { useWebhooks } from '@/hooks/useWebhooks';
import { ConversationsList } from '@/components/conversations/ConversationsList';
import { ChatArea } from '@/components/conversations/ChatArea';
import { toast } from '@/hooks/use-toast';
import type { Conversation } from '@/hooks/useConversations';

export const Conversations: React.FC = () => {
  const { conversations, isLoading: conversationsLoading } = useConversations();
  const { createMessage } = useMessages();
  const { getWebhookByName } = useWebhooks();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');

  const firstConversationId = conversations.length > 0 ? conversations[0].id : null;

  React.useEffect(() => {
    if (!selectedConversation && firstConversationId && conversations.length > 0) {
      console.log('Seleccionando primera conversación:', conversations[0]);
      setSelectedConversation(conversations[0]);
    }
  }, [firstConversationId, selectedConversation, conversations]);

  const { data: messages = [], isLoading: messagesLoading } = useMessages().getConversationMessages(
    selectedConversation?.id || ''
  );

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      console.log('Enviando mensaje:', {
        conversation_id: selectedConversation.id,
        content: newMessage
      });

      // Obtener el webhook para enviar mensajes
      const webhook = getWebhookByName('enviar-mensaje');
      
      if (webhook) {
        // Enviar mensaje mediante webhook
        const webhookData = {
          mensaje: newMessage,
          instancia: selectedConversation.instancia,
          numero: selectedConversation.whatsapp_number,
          contact_name: selectedConversation.contact_name,
          conversation_id: selectedConversation.id
        };

        console.log('Enviando webhook:', webhookData);

        const response = await fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
        });

        if (!response.ok) {
          throw new Error(`Error en webhook: ${response.statusText}`);
        }

        toast({
          title: "Mensaje enviado",
          description: "El mensaje se ha enviado correctamente.",
        });
      } else {
        // Fallback: crear mensaje localmente
        await createMessage.mutateAsync({
          conversation_id: selectedConversation.id,
          sender_type: 'user',
          content: newMessage,
          message_type: 'text',
        });
      }
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Error al enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
    }
  }, [newMessage, selectedConversation, createMessage, getWebhookByName]);

  const handleDownloadAttachment = useCallback((url: string) => {
    window.open(url, '_blank');
  }, []);

  const handleMessageChange = useCallback((message: string) => {
    setNewMessage(message);
  }, []);

  const handleSelectConversation = useCallback((conversation: Conversation) => {
    console.log('Seleccionando conversación:', conversation);
    setSelectedConversation(conversation);
  }, []);

  console.log('Renderizando conversaciones. Total:', conversations.length);

  return (
    <div className="h-full flex">
      <ConversationsList
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={handleSelectConversation}
        isLoading={conversationsLoading}
      />
      
      <ChatArea
        selectedConversation={selectedConversation}
        messages={messages}
        messagesLoading={messagesLoading}
        newMessage={newMessage}
        onMessageChange={handleMessageChange}
        onSendMessage={handleSendMessage}
        onDownloadAttachment={handleDownloadAttachment}
      />
    </div>
  );
};
