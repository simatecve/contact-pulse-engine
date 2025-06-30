
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Agent {
  id: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  role?: string;
}

export const useAgents = () => {
  const { user } = useAuth();

  const fetchAgents = async (): Promise<Agent[]> => {
    if (!user) return [];
    
    // Obtener usuarios que pueden ser agentes (excluyendo el usuario actual)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role')
      .neq('id', user.id)
      .order('first_name', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const agentsQuery = useQuery({
    queryKey: ['agents', user?.id],
    queryFn: fetchAgents,
    enabled: !!user,
  });

  return {
    agents: agentsQuery.data || [],
    isLoading: agentsQuery.isLoading,
    error: agentsQuery.error,
  };
};
