
import React, { useState, useCallback } from 'react';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { ConversationsList } from '@/components/conversations/ConversationsList';
import { ChatArea } from '@/components/conversations/ChatArea';
import type { Conversation } from '@/hooks/useConversations';

export const Conversations: React.FC = () => {
  const { conversations, isLoading: conversationsLoading } = useConversations();
  const { createMessage } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [newMessage, setNewMessage] = useState('');

  // Memoizar el primer ID de conversación para evitar recálculos
  const firstConversationId = conversations.length > 0 ? conversations[0].id : null;

  // Solo seleccionar la primera conversación si no hay ninguna seleccionada y hay conversaciones disponibles
  React.useEffect(() => {
    if (!selectedConversation && firstConversationId && conversations.length > 0) {
      console.log('Seleccionando primera conversación:', conversations[0]);
      setSelectedConversation(conversations[0]);
    }
  }, [firstConversationId, selectedConversation, conversations]);

  // Obtener mensajes de la conversación seleccionada
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
      
      await createMessage.mutateAsync({
        conversation_id: selectedConversation.id,
        sender_type: 'user',
        content: newMessage,
        message_type: 'text',
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  }, [newMessage, selectedConversation, createMessage]);

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
