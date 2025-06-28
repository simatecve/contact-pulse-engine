
import React from 'react';
import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/hooks/useMessages';

interface MessageBubbleProps {
  message: Message;
  onDownloadAttachment: (url: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message, onDownloadAttachment }) => {
  return (
    <div
      className={`flex ${message.sender_type === 'user' ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
          message.sender_type === 'user'
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 text-gray-900'
        }`}
      >
        {message.sender_type === 'contact' && message.contact_name && (
          <div className="text-xs font-medium mb-1 text-gray-600">
            {message.contact_name}
            {message.pushname && message.pushname !== message.contact_name && (
              <span className="ml-1">(@{message.pushname})</span>
            )}
          </div>
        )}
        
        <p className="text-sm">{message.content}</p>
        
        {message.attachment_url && (
          <div className="mt-2">
            <Button
              onClick={() => onDownloadAttachment(message.attachment_url)}
              variant={message.sender_type === 'user' ? 'secondary' : 'outline'}
              size="sm"
              className="text-xs"
            >
              <Download className="w-3 h-3 mr-1" />
              Descargar adjunto
            </Button>
          </div>
        )}
        
        <div className="flex items-center justify-between mt-1">
          <p className={`text-xs ${
            message.sender_type === 'user' ? 'text-blue-100' : 'text-gray-500'
          }`}>
            {message.sent_at ? 
              new Date(message.sent_at).toLocaleTimeString('es-ES', { 
                hour: '2-digit', 
                minute: '2-digit' 
              }) : 
              ''
            }
          </p>
          {message.sender_type === 'contact' && message.whatsapp_number && (
            <p className="text-xs ml-2 text-gray-500">
              {message.whatsapp_number}
            </p>
          )}
          {message.instancia && (
            <p className="text-xs ml-2 text-gray-400">
              {message.instancia}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
