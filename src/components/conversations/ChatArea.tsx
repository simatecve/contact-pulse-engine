
import React, { useEffect, useRef } from 'react';
import { ConversationHeader } from './ConversationHeader';
import { MessageBubble } from './MessageBubble';
import { MessageInput } from './MessageInput';
import { Conversation } from '@/hooks/useConversations';
import { Message } from '@/hooks/useMessages';

interface ChatAreaProps {
  selectedConversation: Conversation | null;
  messages: Message[];
  messagesLoading: boolean;
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
  onDownloadAttachment: (url: string) => void;
  onAssignAgent?: (conversationId: string, agentId?: string, notes?: string) => void;
  isAssigningAgent?: boolean;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  selectedConversation,
  messages,
  messagesLoading,
  newMessage,
  onMessageChange,
  onSendMessage,
  onDownloadAttachment,
  onAssignAgent,
  isAssigningAgent = false
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll automático cuando llegan nuevos mensajes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Selecciona una conversación para comenzar
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <ConversationHeader 
        conversation={selectedConversation} 
        onAssignAgent={onAssignAgent}
        isAssigningAgent={isAssigningAgent}
      />

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto">
        {messagesLoading ? (
          <div className="flex items-center justify-center h-full">Cargando mensajes...</div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No hay mensajes en esta conversación
          </div>
        ) : (
          <div className="space-y-4">
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onDownloadAttachment={onDownloadAttachment}
              />
            ))}
            {/* Elemento invisible para scroll automático */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="flex-shrink-0">
        <MessageInput
          newMessage={newMessage}
          onMessageChange={onMessageChange}
          onSendMessage={onSendMessage}
        />
      </div>
    </div>
  );
};
