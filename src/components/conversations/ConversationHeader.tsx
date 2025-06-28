
import React from 'react';
import { MoreVertical, Phone, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Conversation } from '@/hooks/useConversations';

interface ConversationHeaderProps {
  conversation: Conversation;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({ conversation }) => {
  return (
    <div className="p-4 border-b border-gray-200 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-sm font-medium text-gray-700">
            {conversation.contact_name ? 
              conversation.contact_name.split(' ').map(n => n[0]).join('') :
              'W'
            }
          </span>
        </div>
        <div>
          <h2 className="font-medium text-gray-900">
            {conversation.contact_name || 'Sin nombre'}
          </h2>
          <div className="flex items-center space-x-2 text-sm text-gray-500">
            <span>{conversation.status === 'active' ? 'Activo' : 'Inactivo'}</span>
            {conversation.whatsapp_number && (
              <>
                <span>•</span>
                <span>{conversation.whatsapp_number}</span>
              </>
            )}
            {conversation.instancia && (
              <>
                <span>•</span>
                <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                  {conversation.instancia}
                </span>
              </>
            )}
          </div>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Button variant="ghost" size="sm">
          <Phone className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <Video className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm">
          <MoreVertical className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
