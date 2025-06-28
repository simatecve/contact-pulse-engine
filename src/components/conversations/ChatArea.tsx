
import React from 'react';
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
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  selectedConversation,
  messages,
  messagesLoading,
  newMessage,
  onMessageChange,
  onSendMessage,
  onDownloadAttachment
}) => {
  if (!selectedConversation) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500">
        Selecciona una conversación para comenzar
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-white">
      <ConversationHeader conversation={selectedConversation} />

      {/* Messages */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4">
        {messagesLoading ? (
          <div className="flex items-center justify-center">Cargando mensajes...</div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center text-gray-500">
            No hay mensajes en esta conversación
          </div>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onDownloadAttachment={onDownloadAttachment}
            />
          ))
        )}
      </div>

      <MessageInput
        newMessage={newMessage}
        onMessageChange={onMessageChange}
        onSendMessage={onSendMessage}
      />
    </div>
  );
};
