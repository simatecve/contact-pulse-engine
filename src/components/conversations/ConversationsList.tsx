
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Conversation } from '@/hooks/useConversations';

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  isLoading: boolean;
}

export const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="w-1/3 min-w-80 border-r border-gray-200 bg-white flex items-center justify-center">
        <div>Cargando conversaciones...</div>
      </div>
    );
  }

  return (
    <div className="w-1/3 min-w-80 border-r border-gray-200 bg-white flex flex-col">
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Buscar conversaciones..."
            className="pl-10"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            No hay conversaciones disponibles
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation?.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
              }`}
              onClick={() => onSelectConversation(conversation)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div 
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white font-medium flex-shrink-0"
                    style={{ backgroundColor: conversation.instance_color || '#3B82F6' }}
                  >
                    <span className="text-sm">
                      {conversation.contact_name ? 
                        conversation.contact_name.split(' ').map(n => n[0]).join('') :
                        'W'
                      }
                    </span>
                  </div>
                  {conversation.status === 'active' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">
                      {conversation.contact_name || 'Sin nombre'}
                    </h3>
                    <span className="text-xs text-gray-500 flex-shrink-0">
                      {conversation.last_message_at ? 
                        new Date(conversation.last_message_at).toLocaleTimeString('es-ES', { 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 
                        ''
                      }
                    </span>
                  </div>
                  {conversation.last_message_content && (
                    <p className="text-xs text-gray-600 truncate mt-1">
                      {conversation.last_message_content}
                    </p>
                  )}
                  {conversation.whatsapp_number && (
                    <div className="text-xs text-gray-500 truncate">{conversation.whatsapp_number}</div>
                  )}
                  <div className="mt-1 flex items-center space-x-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {conversation.channel === 'whatsapp' ? 'WhatsApp' : conversation.channel}
                    </Badge>
                    {conversation.instancia && (
                      <Badge 
                        variant="secondary" 
                        className="text-xs"
                        style={{ 
                          backgroundColor: `${conversation.instance_color || '#3B82F6'}20`,
                          color: conversation.instance_color || '#3B82F6',
                          borderColor: conversation.instance_color || '#3B82F6'
                        }}
                      >
                        {conversation.instancia}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
