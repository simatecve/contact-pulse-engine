
import React from 'react';
import { Plus, Bot, Settings, Play, Pause, MoreVertical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';

const agents = [
  {
    id: 1,
    name: 'Asistente de Ventas',
    description: 'Responde consultas sobre productos y precios',
    status: 'active',
    conversations: 156,
    successRate: '89%',
    channel: 'whatsapp'
  },
  {
    id: 2,
    name: 'Soporte Técnico',
    description: 'Ayuda con problemas técnicos básicos',
    status: 'active',
    conversations: 89,
    successRate: '76%',
    channel: 'email'
  },
  {
    id: 3,
    name: 'Calificador de Leads',
    description: 'Califica automáticamente nuevos leads',
    status: 'inactive',
    conversations: 234,
    successRate: '92%',
    channel: 'both'
  }
];

const getStatusColor = (status: string) => {
  return status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
};

const getChannelText = (channel: string) => {
  switch (channel) {
    case 'whatsapp': return 'WhatsApp';
    case 'email': return 'Email';
    case 'both': return 'Ambos';
    default: return channel;
  }
};

export const AIAgents: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agentes de IA</h1>
          <p className="text-gray-600 mt-1">Configura y gestiona tus asistentes inteligentes</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Agente
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agentes Activos</p>
                <p className="text-2xl font-bold text-gray-900">3</p>
              </div>
              <div className="h-12 w-12 bg-blue-50 rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Conversaciones IA</p>
                <p className="text-2xl font-bold text-gray-900">479</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Play className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-gray-900">85.3%</p>
              </div>
              <div className="h-12 w-12 bg-purple-50 rounded-lg flex items-center justify-center">
                <Settings className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tiempo Respuesta</p>
                <p className="text-2xl font-bold text-gray-900">1.2s</p>
              </div>
              <div className="h-12 w-12 bg-yellow-50 rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-1 gap-6">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                    <Bot className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                    <p className="text-gray-600">{agent.description}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <Badge className={getStatusColor(agent.status)}>
                        {agent.status === 'active' ? 'Activo' : 'Inactivo'}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        Canal: {getChannelText(agent.channel)}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-gray-900">{agent.conversations}</p>
                    <p className="text-sm text-gray-600">Conversaciones</p>
                  </div>
                  
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">{agent.successRate}</p>
                    <p className="text-sm text-gray-600">Tasa Éxito</p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch checked={agent.status === 'active'} />
                    <Button variant="ghost" size="sm">
                      <Settings className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Configuración Rápida</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                  <Bot className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Asistente de Ventas</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Configura un agente que responda preguntas sobre productos y genere leads automáticamente.
              </p>
              <Button variant="outline" className="w-full">
                Configurar Ahora
              </Button>
            </div>

            <div className="p-6 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
                  <Settings className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Soporte 24/7</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Crea un agente que brinde soporte técnico básico las 24 horas del día.
              </p>
              <Button variant="outline" className="w-full">
                Configurar Ahora
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
