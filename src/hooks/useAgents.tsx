
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
    console.log('useAgents: Iniciando fetch de agentes. Usuario:', user?.id);
    
    if (!user) {
      console.log('useAgents: No hay usuario autenticado');
      return [];
    }
    
    // Obtener usuarios que pueden ser agentes (excluyendo el usuario actual)
    const { data, error } = await supabase
      .from('profiles')
      .select('id, email, first_name, last_name, role')
      .neq('id', user.id)
      .order('first_name', { ascending: true });

    console.log('useAgents: Respuesta de la consulta:', { data, error });

    if (error) {
      console.error('useAgents: Error al obtener agentes:', error);
      throw error;
    }
    
    console.log('useAgents: Agentes obtenidos:', data?.length || 0);
    return data || [];
  };

  const agentsQuery = useQuery({
    queryKey: ['agents', user?.id],
    queryFn: fetchAgents,
    enabled: !!user,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  console.log('useAgents: Estado de la consulta:', {
    isLoading: agentsQuery.isLoading,
    isError: agentsQuery.isError,
    error: agentsQuery.error,
    dataLength: agentsQuery.data?.length || 0
  });

  return {
    agents: agentsQuery.data || [],
    isLoading: agentsQuery.isLoading,
    error: agentsQuery.error,
    isError: agentsQuery.isError,
  };
};
