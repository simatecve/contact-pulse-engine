
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export interface AIAgent {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_active: boolean;
  whatsapp_connection_id?: string;
  prompt_template?: string;
  response_settings?: {
    max_tokens?: number;
    temperature?: number;
  };
  created_at: string;
  updated_at: string;
  whatsapp_connections?: {
    id: string;
    name: string;
    color: string;
    status: string;
  };
}

export interface AIAgentFormData {
  name: string;
  description?: string;
  is_active: boolean;
  whatsapp_connection_id?: string;
  prompt_template?: string;
  response_settings?: {
    max_tokens?: number;
    temperature?: number;
  };
}

// Helper function to convert Json to response settings
const convertResponseSettings = (jsonData: any): { max_tokens?: number; temperature?: number; } | undefined => {
  if (!jsonData) return undefined;
  
  // If it's already an object, return it
  if (typeof jsonData === 'object' && jsonData !== null) {
    return {
      max_tokens: jsonData.max_tokens,
      temperature: jsonData.temperature,
    };
  }
  
  // If it's a string, try to parse it
  if (typeof jsonData === 'string') {
    try {
      const parsed = JSON.parse(jsonData);
      return {
        max_tokens: parsed.max_tokens,
        temperature: parsed.temperature,
      };
    } catch {
      return undefined;
    }
  }
  
  return undefined;
};

export const useAIAgents = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchAIAgents = async (): Promise<AIAgent[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('ai_agents')
      .select(`
        *,
        whatsapp_connections (
          id,
          name,
          color,
          status
        )
      `)
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    // Convert the data to match our interface
    return (data || []).map(agent => ({
      ...agent,
      response_settings: convertResponseSettings(agent.response_settings)
    })) as AIAgent[];
  };

  const createAIAgent = async (agentData: AIAgentFormData): Promise<AIAgent> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('ai_agents')
      .insert({
        ...agentData,
        user_id: user.id,
      })
      .select(`
        *,
        whatsapp_connections (
          id,
          name,
          color,
          status
        )
      `)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      response_settings: convertResponseSettings(data.response_settings)
    } as AIAgent;
  };

  const updateAIAgent = async ({ id, ...updateData }: Partial<AIAgent> & { id: string }): Promise<AIAgent> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('ai_agents')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select(`
        *,
        whatsapp_connections (
          id,
          name,
          color,
          status
        )
      `)
      .single();

    if (error) throw error;
    
    return {
      ...data,
      response_settings: convertResponseSettings(data.response_settings)
    } as AIAgent;
  };

  const deleteAIAgent = async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('ai_agents')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const toggleAIAgent = async (id: string, is_active: boolean): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('ai_agents')
      .update({ is_active })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const aiAgentsQuery = useQuery({
    queryKey: ['ai-agents', user?.id],
    queryFn: fetchAIAgents,
    enabled: !!user,
  });

  const createAIAgentMutation = useMutation({
    mutationFn: createAIAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast({
        title: "Agente creado",
        description: "El agente de IA se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al crear agente: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateAIAgentMutation = useMutation({
    mutationFn: updateAIAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast({
        title: "Agente actualizado",
        description: "El agente de IA se ha actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar agente: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteAIAgentMutation = useMutation({
    mutationFn: deleteAIAgent,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
      toast({
        title: "Agente eliminado",
        description: "El agente de IA se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar agente: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const toggleAIAgentMutation = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => 
      toggleAIAgent(id, is_active),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ai-agents'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al cambiar estado del agente: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    agents: aiAgentsQuery.data || [],
    isLoading: aiAgentsQuery.isLoading,
    error: aiAgentsQuery.error,
    createAgent: createAIAgentMutation,
    updateAgent: updateAIAgentMutation,
    deleteAgent: deleteAIAgentMutation,
    toggleAgent: toggleAIAgentMutation,
  };
};
