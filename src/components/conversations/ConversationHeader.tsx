
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Conversation } from '@/hooks/useConversations';
import { AgentSelector } from './AgentSelector';

interface ConversationHeaderProps {
  conversation: Conversation;
  onAssignAgent?: (conversationId: string, agentId?: string, notes?: string) => void;
  isAssigningAgent?: boolean;
}

export const ConversationHeader: React.FC<ConversationHeaderProps> = ({
  conversation,
  onAssignAgent,
  isAssigningAgent = false
}) => {
  return (
    <div className="p-4 border-b border-gray-200 bg-white">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
            style={{ backgroundColor: conversation.instance_color || '#3B82F6' }}
          >
            <span className="text-sm">
              {conversation.contact_name ? 
                conversation.contact_name.split(' ').map(n => n[0]).join('') :
                'W'
              }
            </span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {conversation.contact_name || 'Sin nombre'}
            </h3>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              {conversation.whatsapp_number && (
                <span>{conversation.whatsapp_number}</span>
              )}
              <Badge variant="outline">
                {conversation.channel === 'whatsapp' ? 'WhatsApp' : conversation.channel}
              </Badge>
              {conversation.instancia && (
                <Badge 
                  variant="secondary"
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
        
        {onAssignAgent && (
          <AgentSelector
            conversation={conversation}
            onAssignAgent={onAssignAgent}
            isLoading={isAssigningAgent}
          />
        )}
      </div>
    </div>
  );
};
