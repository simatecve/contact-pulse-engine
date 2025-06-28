
import React, { useState, useCallback } from 'react';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { useWebhooks } from '@/hooks/useWebhooks';
import { ConversationsList } from '@/components/conversations/ConversationsList';
import { ChatArea } from '@/components/conversations/ChatArea';
import { toast } from '@/hooks/use-toast';
import type { Conversation } from '@/hooks/useConversations';

export const Conversations: React.FC = () => {
  const { conversations, isLoading: conversationsLoading, updateConversation } = useConversations();
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

  // Actualizar conversación seleccionada cuando se modifica en la lista
  React.useEffect(() => {
    if (selectedConversation) {
      const updatedConversation = conversations.find(c => c.id === selectedConversation.id);
      if (updatedConversation) {
        setSelectedConversation(updatedConversation);
      }
    }
  }, [conversations, selectedConversation]);

  const { data: messages = [], isLoading: messagesLoading } = useMessages().getConversationMessages(
    selectedConversation?.id || ''
  );

  const handleSendMessage = useCallback(async () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageContent = newMessage.trim();
    setNewMessage(''); // Limpiar inmediatamente el input

    try {
      console.log('Enviando mensaje:', {
        conversation_id: selectedConversation.id,
        content: messageContent
      });

      // Primero guardar el mensaje localmente para que aparezca inmediatamente
      const localMessage = await createMessage.mutateAsync({
        conversation_id: selectedConversation.id,
        sender_type: 'user',
        content: messageContent,
        message_type: 'text',
        whatsapp_number: selectedConversation.whatsapp_number,
        instancia: selectedConversation.instancia,
      });

      // Actualizar la conversación inmediatamente
      await updateConversation.mutateAsync({
        id: selectedConversation.id,
        last_message_at: new Date().toISOString(),
        last_message_content: messageContent,
      });

      // Obtener el webhook para enviar mensajes
      const webhook = getWebhookByName('enviar-mensaje');
      
      if (webhook) {
        // Enviar mensaje mediante webhook en segundo plano
        const webhookData = {
          mensaje: messageContent,
          instancia: selectedConversation.instancia,
          numero: selectedConversation.whatsapp_number,
          contact_name: selectedConversation.contact_name,
          conversation_id: selectedConversation.id
        };

        console.log('Enviando webhook:', webhookData);

        fetch(webhook.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(webhookData),
        }).then(response => {
          if (response.ok) {
            console.log('Webhook enviado correctamente');
            toast({
              title: "Mensaje enviado",
              description: "El mensaje se ha enviado correctamente.",
            });
          } else {
            console.error('Error en webhook:', response.statusText);
            toast({
              title: "Advertencia",
              description: "El mensaje se guardó localmente pero hubo un problema al enviarlo.",
              variant: "destructive",
            });
          }
        }).catch(error => {
          console.error('Error sending webhook:', error);
          toast({
            title: "Advertencia",
            description: "El mensaje se guardó localmente pero hubo un problema al enviarlo.",
            variant: "destructive",
          });
        });
      } else {
        toast({
          title: "Mensaje guardado",
          description: "El mensaje se ha guardado localmente.",
        });
      }
      
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: "Error",
        description: "Error al enviar el mensaje. Inténtalo de nuevo.",
        variant: "destructive",
      });
      // Restaurar el mensaje en caso de error
      setNewMessage(messageContent);
    }
  }, [newMessage, selectedConversation, createMessage, updateConversation, getWebhookByName]);

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
