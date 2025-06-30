
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UserPlus, UserMinus, Loader2, AlertCircle } from 'lucide-react';
import { useAgents, Agent } from '@/hooks/useAgents';
import { Conversation } from '@/hooks/useConversations';

interface AgentSelectorProps {
  conversation: Conversation;
  onAssignAgent: (conversationId: string, agentId?: string, notes?: string) => void;
  isLoading?: boolean;
}

export const AgentSelector: React.FC<AgentSelectorProps> = ({
  conversation,
  onAssignAgent,
  isLoading = false
}) => {
  const { agents, isLoading: agentsLoading, error: agentsError, isError } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = React.useState<string>('');
  const [notes, setNotes] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  console.log('AgentSelector: Renderizando con datos:', {
    agentsCount: agents.length,
    agentsLoading,
    agentsError,
    isError,
    conversationId: conversation.id,
    assignedAgentId: conversation.assigned_agent_id
  });

  const handleAssign = () => {
    console.log('AgentSelector: Asignando agente:', selectedAgentId);
    onAssignAgent(conversation.id, selectedAgentId || undefined, notes);
    setNotes('');
    setSelectedAgentId('');
    setIsDialogOpen(false);
  };

  const handleUnassign = () => {
    console.log('AgentSelector: Desasignando agente');
    onAssignAgent(conversation.id, undefined);
  };

  const getAgentName = (agentId: string) => {
    const agent = agents.find(a => a.id === agentId);
    if (!agent) return 'Agente desconocido';
    return `${agent.first_name || ''} ${agent.last_name || ''}`.trim() || agent.email || 'Sin nombre';
  };

  return (
    <div className="flex items-center gap-2">
      {conversation.assigned_agent_id ? (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">
            Asignado a: <strong>{getAgentName(conversation.assigned_agent_id)}</strong>
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleUnassign}
            disabled={isLoading}
          >
            <UserMinus className="w-4 h-4" />
            Desasignar
          </Button>
        </div>
      ) : (
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" disabled={isLoading || agentsLoading}>
              {agentsLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Cargando...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Asignar Agente
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Asignar Agente a Conversación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              {isError && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-700">
                    Error al cargar agentes: {agentsError?.message}
                  </span>
                </div>
              )}
              
              {agentsLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="ml-2">Cargando agentes...</span>
                </div>
              ) : agents.length === 0 ? (
                <div className="text-center p-4 text-gray-500">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                  <p>No hay agentes disponibles</p>
                  <p className="text-xs mt-1">Asegúrate de tener otros usuarios en el sistema</p>
                </div>
              ) : (
                <>
                  <div>
                    <Label htmlFor="agent-select">Seleccionar Agente ({agents.length} disponibles)</Label>
                    <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona un agente..." />
                      </SelectTrigger>
                      <SelectContent>
                        {agents.map((agent) => (
                          <SelectItem key={agent.id} value={agent.id}>
                            {`${agent.first_name || ''} ${agent.last_name || ''}`.trim() || agent.email || 'Sin nombre'}
                            {agent.email && (
                              <span className="text-xs text-gray-500 ml-2">({agent.email})</span>
                            )}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="notes">Notas (opcional)</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Agregar notas sobre la asignación..."
                      rows={3}
                    />
                  </div>
                </>
              )}
              
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={!selectedAgentId || isLoading || agentsLoading || agents.length === 0}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Asignando...
                    </>
                  ) : (
                    'Asignar'
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
