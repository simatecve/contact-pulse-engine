
import React from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface MessageInputProps {
  newMessage: string;
  onMessageChange: (message: string) => void;
  onSendMessage: () => void;
}

export const MessageInput: React.FC<MessageInputProps> = ({
  newMessage,
  onMessageChange,
  onSendMessage
}) => {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSendMessage();
    }
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">
          <Paperclip className="w-4 h-4" />
        </Button>
        <div className="flex-1 relative">
          <Input
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            className="pr-20"
            onKeyPress={handleKeyPress}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
            <Button variant="ghost" size="sm">
              <Smile className="w-4 h-4" />
            </Button>
            <Button size="sm" onClick={onSendMessage}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
