
import React, { useState } from 'react';
import { Send, Paperclip, Smile } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import EmojiPicker from 'emoji-picker-react';

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
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendMessage();
    }
  };

  const handleEmojiClick = (emojiObject: any) => {
    onMessageChange(newMessage + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  return (
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-end space-x-2">
        <Button variant="ghost" size="sm">
          <Paperclip className="w-4 h-4" />
        </Button>
        <div className="flex-1 relative">
          <Textarea
            placeholder="Escribe un mensaje..."
            value={newMessage}
            onChange={(e) => onMessageChange(e.target.value)}
            className="min-h-[40px] max-h-[120px] resize-none pr-20"
            onKeyPress={handleKeyPress}
            rows={1}
          />
          <div className="absolute right-2 bottom-2 flex space-x-1">
            <div className="relative">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile className="w-4 h-4" />
              </Button>
              {showEmojiPicker && (
                <div className="absolute bottom-full right-0 mb-2 z-50">
                  <EmojiPicker onEmojiClick={handleEmojiClick} />
                </div>
              )}
            </div>
            <Button 
              size="sm" 
              onClick={onSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
