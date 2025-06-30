
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { UserPlus, UserMinus } from 'lucide-react';
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
  const { agents } = useAgents();
  const [selectedAgentId, setSelectedAgentId] = React.useState<string>('');
  const [notes, setNotes] = React.useState('');
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleAssign = () => {
    onAssignAgent(conversation.id, selectedAgentId || undefined, notes);
    setNotes('');
    setSelectedAgentId('');
    setIsDialogOpen(false);
  };

  const handleUnassign = () => {
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
            <Button variant="outline" size="sm" disabled={isLoading}>
              <UserPlus className="w-4 h-4 mr-2" />
              Asignar Agente
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Asignar Agente a Conversación</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="agent-select">Seleccionar Agente</Label>
                <Select value={selectedAgentId} onValueChange={setSelectedAgentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona un agente..." />
                  </SelectTrigger>
                  <SelectContent>
                    {agents.map((agent) => (
                      <SelectItem key={agent.id} value={agent.id}>
                        {`${agent.first_name || ''} ${agent.last_name || ''}`.trim() || agent.email || 'Sin nombre'}
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
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleAssign}
                  disabled={!selectedAgentId || isLoading}
                >
                  Asignar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
