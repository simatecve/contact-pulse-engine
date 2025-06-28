
import React, { useState, useEffect } from 'react';
import { Search, MoreVertical, Phone, Video, Send, Paperclip, Smile, Download } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useConversations } from '@/hooks/useConversations';
import { useMessages } from '@/hooks/useMessages';

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

  if (conversationsLoading) {
    return <div className="flex items-center justify-center h-64">Cargando conversaciones...</div>;
  }

  console.log('Renderizando conversaciones. Total:', conversations.length);

  return (
    <div className="h-full flex">
      {/* Conversations List */}
      <div className="w-1/3 border-r border-gray-200 bg-white">
        <div className="p-4 border-b border-gray-200">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar conversaciones..."
              className="pl-10"
            />
          </div>
        </div>

        <div className="overflow-y-auto">
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
                onClick={() => {
                  console.log('Seleccionando conversación:', conversation);
                  setSelectedConversation(conversation);
                }}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-gray-700">
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
                      <span className="text-xs text-gray-500">
                        {conversation.last_message_at ? 
                          new Date(conversation.last_message_at).toLocaleTimeString('es-ES', { 
                            hour: '2-digit', 
                            minute: '2-digit' 
                          }) : 
                          ''
                        }
                      </span>
                    </div>
                    {conversation.contact_phone && (
                      <div className="text-xs text-gray-500 truncate">{conversation.contact_phone}</div>
                    )}
                    <div className="mt-1">
                      <Badge variant="outline" className="text-xs">
                        {conversation.channel === 'whatsapp' ? 'WhatsApp' : conversation.channel}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-gray-700">
                    {selectedConversation.contact_name ? 
                      selectedConversation.contact_name.split(' ').map(n => n[0]).join('') :
                      'W'
                    }
                  </span>
                </div>
                <div>
                  <h2 className="font-medium text-gray-900">
                    {selectedConversation.contact_name || 'Sin nombre'}
                  </h2>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{selectedConversation.status === 'active' ? 'Activo' : 'Inactivo'}</span>
                    {selectedConversation.contact_phone && (
                      <>
                        <span>•</span>
                        <span>{selectedConversation.contact_phone}</span>
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

            {/* Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4">
              {messagesLoading ? (
                <div className="flex items-center justify-center">Cargando mensajes...</div>
              ) : conversationMessages.length === 0 ? (
                <div className="flex items-center justify-center text-gray-500">
                  No hay mensajes en esta conversación
                </div>
              ) : (
                conversationMessages.map((message) => (
                  <div
                    key={message.id}
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
                            onClick={() => handleDownloadAttachment(message.attachment_url)}
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
                ))
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200">
              <div className="flex items-center space-x-2">
                <Button variant="ghost" size="sm">
                  <Paperclip className="w-4 h-4" />
                </Button>
                <div className="flex-1 relative">
                  <Input
                    placeholder="Escribe un mensaje..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="pr-20"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Smile className="w-4 h-4" />
                    </Button>
                    <Button size="sm" onClick={handleSendMessage}>
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Selecciona una conversación para comenzar
          </div>
        )}
      </div>
    </div>
  );
};
