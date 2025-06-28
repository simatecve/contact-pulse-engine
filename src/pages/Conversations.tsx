
import React, { useState, useEffect } from 'react';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';
import { ConversationsList } from '@/components/conversations/ConversationsList';
import { ChatArea } from '@/components/conversations/ChatArea';

export const Conversations: React.FC = () => {
  const { conversations, isLoading: conversationsLoading } = useConversations();
  const { createMessage } = useMessages();
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [conversationMessages, setConversationMessages] = useState([]);

  // Log para debugging - ver qué conversaciones tenemos
  useEffect(() => {
    console.log('Conversaciones cargadas:', conversations);
  }, [conversations]);

  // Seleccionar la primera conversación por defecto
  useEffect(() => {
    if (conversations.length > 0 && !selectedConversation) {
      console.log('Seleccionando primera conversación:', conversations[0]);
      setSelectedConversation(conversations[0]);
    }
  }, [conversations, selectedConversation]);

  // Obtener mensajes de la conversación seleccionada
  const { data: messages = [], isLoading: messagesLoading } = useMessages().getConversationMessages(
    selectedConversation?.id || ''
  );

  useEffect(() => {
    console.log('Mensajes cargados para conversación:', selectedConversation?.id, messages);
    setConversationMessages(messages);
  }, [messages, selectedConversation?.id]);

  const handleSendMessage = async () => {
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
  };

  const handleDownloadAttachment = (url: string) => {
    window.open(url, '_blank');
  };

  const handleMessageChange = (message: string) => {
    setNewMessage(message);
  };

  console.log('Renderizando conversaciones. Total:', conversations.length);

  return (
    <div className="h-full flex">
      <ConversationsList
        conversations={conversations}
        selectedConversation={selectedConversation}
        onSelectConversation={setSelectedConversation}
        isLoading={conversationsLoading}
      />
      
      <ChatArea
        selectedConversation={selectedConversation}
        messages={conversationMessages}
        messagesLoading={messagesLoading}
        newMessage={newMessage}
        onMessageChange={handleMessageChange}
        onSendMessage={handleSendMessage}
        onDownloadAttachment={handleDownloadAttachment}
      />
    </div>
  );
};
