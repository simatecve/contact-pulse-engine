
import React, { useState } from 'react';
import { Search, MoreVertical, Phone, Video, Send, Paperclip, Smile } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

const conversations = [
  {
    id: 1,
    name: 'Juan Pérez',
    lastMessage: 'Hola, me interesa conocer más sobre sus servicios',
    time: '10:30',
    unread: 2,
    channel: 'whatsapp',
    status: 'online'
  },
  {
    id: 2,
    name: 'María González',
    lastMessage: 'Perfecto, espero su propuesta',
    time: '09:45',
    unread: 0,
    channel: 'email',
    status: 'offline'
  },
  {
    id: 3,
    name: 'Carlos Rodriguez',
    lastMessage: '¿Cuándo podemos agendar una reunión?',
    time: 'Ayer',
    unread: 1,
    channel: 'whatsapp',
    status: 'online'
  }
];

const messages = [
  {
    id: 1,
    sender: 'Juan Pérez',
    content: 'Hola, me interesa conocer más sobre sus servicios',
    time: '10:25',
    type: 'received'
  },
  {
    id: 2,
    sender: 'Yo',
    content: '¡Hola Juan! Claro, estaré encantado de ayudarte. ¿Qué tipo de servicio te interesa específicamente?',
    time: '10:26',
    type: 'sent'
  },
  {
    id: 3,
    sender: 'Juan Pérez',
    content: 'Estoy buscando una solución de CRM para mi empresa',
    time: '10:30',
    type: 'received'
  }
];

export const Conversations: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState(conversations[0]);
  const [newMessage, setNewMessage] = useState('');

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
          {conversations.map((conversation) => (
            <div
              key={conversation.id}
              className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                selectedConversation.id === conversation.id ? 'bg-blue-50 border-r-2 border-blue-600' : ''
              }`}
              onClick={() => setSelectedConversation(conversation)}
            >
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-700">
                      {conversation.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  {conversation.status === 'online' && (
                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{conversation.name}</h3>
                    <span className="text-xs text-gray-500">{conversation.time}</span>
                  </div>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-sm text-gray-600 truncate">{conversation.lastMessage}</p>
                    {conversation.unread > 0 && (
                      <Badge className="bg-blue-600 text-white text-xs">{conversation.unread}</Badge>
                    )}
                  </div>
                  <div className="mt-1">
                    <Badge variant="outline" className="text-xs">
                      {conversation.channel === 'whatsapp' ? 'WhatsApp' : 'Email'}
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {/* Chat Header */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-700">
                {selectedConversation.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>
            <div>
              <h2 className="font-medium text-gray-900">{selectedConversation.name}</h2>
              <p className="text-sm text-gray-500">
                {selectedConversation.status === 'online' ? 'En línea' : 'Desconectado'}
              </p>
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
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'sent' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.type === 'sent'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}
              >
                <p className="text-sm">{message.content}</p>
                <p className={`text-xs mt-1 ${
                  message.type === 'sent' ? 'text-blue-100' : 'text-gray-500'
                }`}>
                  {message.time}
                </p>
              </div>
            </div>
          ))}
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
                    setNewMessage('');
                  }
                }}
              />
              <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                <Button variant="ghost" size="sm">
                  <Smile className="w-4 h-4" />
                </Button>
                <Button size="sm">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
