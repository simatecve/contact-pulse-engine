
import React, { useState } from 'react';
import { Plus, Bot, Settings, MoreVertical, Trash2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useAIAgents, AIAgent } from '@/hooks/useAIAgents';
import { AIAgentForm } from '@/components/ai-agents/AIAgentForm';

export const AIAgents: React.FC = () => {
  const { agents, isLoading, createAgent, updateAgent, deleteAgent, toggleAgent } = useAIAgents();
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AIAgent | null>(null);

  const handleCreateAgent = async (data: any) => {
    await createAgent.mutateAsync(data);
    setShowCreateDialog(false);
  };

  const handleUpdateAgent = async (data: any) => {
    if (editingAgent) {
      await updateAgent.mutateAsync({ id: editingAgent.id, ...data });
      setEditingAgent(null);
    }
  };

  const handleDeleteAgent = async (agent: AIAgent) => {
    if (window.confirm(`¿Estás seguro de que quieres eliminar el agente "${agent.name}"?`)) {
      await deleteAgent.mutateAsync(agent.id);
    }
  };

  const handleToggleAgent = async (agent: AIAgent) => {
    await toggleAgent.mutateAsync({ id: agent.id, is_active: !agent.is_active });
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
  };

  const getChannelText = (whatsappConnection: any) => {
    return whatsappConnection ? whatsappConnection.name : 'Sin conexión';
  };

  const activeAgents = agents.filter(agent => agent.is_active).length;
  const totalConversations = agents.reduce((sum, agent) => sum + (Math.floor(Math.random() * 200) + 50), 0);
  const avgSuccessRate = agents.length > 0 ? (agents.reduce((sum, agent) => sum + (Math.random() * 30 + 70), 0) / agents.length).toFixed(1) : '0';

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Cargando agentes...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agentes de IA</h1>
          <p className="text-gray-600 mt-1">Configura y gestiona tus asistentes inteligentes</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Agente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Crear Nuevo Agente</DialogTitle>
            </DialogHeader>
            <AIAgentForm
              onSubmit={handleCreateAgent}
              onCancel={() => setShowCreateDialog(false)}
              isLoading={createAgent.isPending}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Agentes Activos</p>
                <p className="text-2xl font-bold text-gray-900">{activeAgents}</p>
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
                <p className="text-2xl font-bold text-gray-900">{totalConversations}</p>
              </div>
              <div className="h-12 w-12 bg-green-50 rounded-lg flex items-center justify-center">
                <Bot className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Tasa de Éxito</p>
                <p className="text-2xl font-bold text-gray-900">{avgSuccessRate}%</p>
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
                <p className="text-sm font-medium text-gray-600">Total Agentes</p>
                <p className="text-2xl font-bold text-gray-900">{agents.length}</p>
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
        {agents.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Bot className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No hay agentes de IA
              </h3>
              <p className="text-gray-600 mb-4">
                Crea tu primer agente para empezar a automatizar conversaciones
              </p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Crear Primer Agente
              </Button>
            </CardContent>
          </Card>
        ) : (
          agents.map((agent) => (
            <Card key={agent.id}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Bot className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{agent.name}</h3>
                      <p className="text-gray-600">{agent.description || 'Sin descripción'}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <Badge className={getStatusColor(agent.is_active)}>
                          {agent.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Conexión: {getChannelText(agent.whatsapp_connections)}
                        </span>
                        {agent.whatsapp_connections && (
                          <div className="flex items-center space-x-1">
                            <div 
                              className="w-2 h-2 rounded-full" 
                              style={{ backgroundColor: agent.whatsapp_connections.color }}
                            />
                            <span className={`text-xs ${
                              agent.whatsapp_connections.status === 'connected' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {agent.whatsapp_connections.status === 'connected' ? 'Conectado' : 'Desconectado'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-gray-900">{Math.floor(Math.random() * 200) + 50}</p>
                      <p className="text-sm text-gray-600">Conversaciones</p>
                    </div>
                    
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{(Math.random() * 30 + 70).toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Tasa Éxito</p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Switch 
                        checked={agent.is_active} 
                        onCheckedChange={() => handleToggleAgent(agent)}
                        disabled={toggleAgent.isPending}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => setEditingAgent(agent)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteAgent(agent)}
                            className="text-red-600"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingAgent} onOpenChange={() => setEditingAgent(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Agente</DialogTitle>
          </DialogHeader>
          {editingAgent && (
            <AIAgentForm
              agent={editingAgent}
              onSubmit={handleUpdateAgent}
              onCancel={() => setEditingAgent(null)}
              isLoading={updateAgent.isPending}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Quick Setup - mantener el diseño original pero simplificado */}
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
              <Button variant="outline" className="w-full" onClick={() => setShowCreateDialog(true)}>
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
              <Button variant="outline" className="w-full" onClick={() => setShowCreateDialog(true)}>
                Configurar Ahora
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
