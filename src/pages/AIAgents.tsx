
import React, { useState } from 'react';
import { Plus, Bot, Settings, MoreVertical, Trash2, Edit, Sparkles, Zap } from 'lucide-react';
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
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando agentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Section */}
      <div className="relative">
        <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 rounded-2xl p-8 text-white shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold mb-2">Agentes de IA</h1>
                <p className="text-indigo-100 text-lg">Configura y gestiona tus asistentes inteligentes</p>
                <div className="flex items-center mt-2 space-x-4">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
                    <span className="text-sm text-indigo-100">Sistema activo</span>
                  </div>
                  <div className="flex items-center">
                    <Zap className="w-4 h-4 text-yellow-300 mr-1" />
                    <span className="text-sm text-indigo-100">IA avanzada</span>
                  </div>
                </div>
              </div>
            </div>
            <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
              <DialogTrigger asChild>
                <Button className="bg-white text-indigo-600 hover:bg-gray-100 font-semibold px-6">
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
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="card-hover bg-gradient-to-br from-blue-50 to-indigo-50 border-0 shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Agentes Activos</p>
              <p className="text-3xl font-bold text-gray-900">{activeAgents}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-green-50 to-emerald-50 border-0 shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Conversaciones IA</p>
              <p className="text-3xl font-bold text-gray-900">{totalConversations}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-purple-50 to-pink-50 border-0 shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Tasa de Éxito</p>
              <p className="text-3xl font-bold text-gray-900">{avgSuccessRate}%</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
              <Settings className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="card-hover bg-gradient-to-br from-yellow-50 to-orange-50 border-0 shadow-lg rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Total Agentes</p>
              <p className="text-3xl font-bold text-gray-900">{agents.length}</p>
            </div>
            <div className="w-14 h-14 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
              <Bot className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Agents List */}
      <div className="grid grid-cols-1 gap-6">
        {agents.length === 0 ? (
          <div className="card-hover bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl p-12 text-center border-2 border-dashed border-indigo-200">
            <div className="w-20 h-20 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              No hay agentes de IA
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Crea tu primer agente para empezar a automatizar conversaciones
            </p>
            <div className="flex items-center justify-center space-x-2 mb-6">
              <Sparkles className="w-4 h-4 text-indigo-500" />
              <span className="text-sm text-indigo-600 font-medium">Powered by AI</span>
            </div>
            <Button 
              onClick={() => setShowCreateDialog(true)}
              className="bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white font-semibold px-8"
            >
              <Plus className="w-4 h-4 mr-2" />
              Crear Primer Agente
            </Button>
          </div>
        ) : (
          agents.map((agent) => (
            <Card key={agent.id} className="card-hover border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                      <Bot className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{agent.name}</h3>
                      <p className="text-gray-600 mt-1">{agent.description || 'Sin descripción'}</p>
                      <div className="flex items-center space-x-4 mt-3">
                        <Badge className={getStatusColor(agent.is_active)}>
                          {agent.is_active ? 'Activo' : 'Inactivo'}
                        </Badge>
                        <span className="text-sm text-gray-500">
                          Conexión: {getChannelText(agent.whatsapp_connections)}
                        </span>
                        {agent.whatsapp_connections && (
                          <div className="flex items-center space-x-2">
                            <div 
                              className="w-3 h-3 rounded-full shadow-sm" 
                              style={{ backgroundColor: agent.whatsapp_connections.color }}
                            />
                            <span className={`text-xs font-medium ${
                              agent.whatsapp_connections.status === 'connected' ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {agent.whatsapp_connections.status === 'connected' ? 'Conectado' : 'Desconectado'}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-8">
                    <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
                      <p className="text-2xl font-bold text-gray-900">{Math.floor(Math.random() * 200) + 50}</p>
                      <p className="text-sm text-gray-600">Conversaciones</p>
                    </div>
                    
                    <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl">
                      <p className="text-2xl font-bold text-green-600">{(Math.random() * 30 + 70).toFixed(1)}%</p>
                      <p className="text-sm text-gray-600">Tasa Éxito</p>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <Switch 
                        checked={agent.is_active} 
                        onCheckedChange={() => handleToggleAgent(agent)}
                        disabled={toggleAgent.isPending}
                      />
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover:bg-gray-100">
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

      {/* Quick Setup */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-white to-gray-50">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-t-xl">
          <CardTitle className="flex items-center">
            <Settings className="w-5 h-5 mr-2" />
            Configuración Rápida
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="card-hover p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Asistente de Ventas</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Configura un agente que responda preguntas sobre productos y genere leads automáticamente.
              </p>
              <Button 
                variant="outline" 
                className="w-full hover:bg-blue-50 hover:border-blue-200" 
                onClick={() => setShowCreateDialog(true)}
              >
                Configurar Ahora
              </Button>
            </div>

            <div className="card-hover p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-200">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg">
                  <Settings className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-gray-900 text-lg">Soporte 24/7</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Crea un agente que brinde soporte técnico básico las 24 horas del día.
              </p>
              <Button 
                variant="outline" 
                className="w-full hover:bg-green-50 hover:border-green-200" 
                onClick={() => setShowCreateDialog(true)}
              >
                Configurar Ahora
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
