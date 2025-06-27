
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export interface LeadColumn {
  id: string;
  user_id: string;
  name: string;
  color: string;
  position: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeadColumnFormData {
  name: string;
  color: string;
  position?: number;
}

export const useLeadColumns = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchColumns = async (): Promise<LeadColumn[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('lead_columns')
      .select('*')
      .eq('user_id', user.id)
      .order('position', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const createDefaultColumn = async (): Promise<void> => {
    if (!user) return;

    // Verificar si ya existe la columna por defecto
    const { data: existing } = await supabase
      .from('lead_columns')
      .select('id')
      .eq('user_id', user.id)
      .eq('is_default', true)
      .single();

    if (!existing) {
      await supabase
        .from('lead_columns')
        .insert({
          user_id: user.id,
          name: 'Nuevos',
          color: '#3B82F6',
          position: 0,
          is_default: true,
        });
    }
  };

  const createColumn = async (columnData: LeadColumnFormData): Promise<LeadColumn> => {
    if (!user) throw new Error('Usuario no autenticado');

    // Obtener la posición más alta
    const { data: maxPosition } = await supabase
      .from('lead_columns')
      .select('position')
      .eq('user_id', user.id)
      .order('position', { ascending: false })
      .limit(1)
      .single();

    const position = columnData.position ?? (maxPosition?.position || 0) + 1;

    const { data, error } = await supabase
      .from('lead_columns')
      .insert({
        ...columnData,
        user_id: user.id,
        position,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateColumn = async ({ id, ...updateData }: Partial<LeadColumn> & { id: string }): Promise<LeadColumn> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('lead_columns')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteColumn = async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    // No permitir eliminar la columna por defecto
    const { data: column } = await supabase
      .from('lead_columns')
      .select('is_default')
      .eq('id', id)
      .single();

    if (column?.is_default) {
      throw new Error('No se puede eliminar la columna por defecto');
    }

    const { error } = await supabase
      .from('lead_columns')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const columnsQuery = useQuery({
    queryKey: ['lead-columns', user?.id],
    queryFn: fetchColumns,
    enabled: !!user,
  });

  const createColumnMutation = useMutation({
    mutationFn: createColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-columns'] });
      toast({
        title: "Columna creada",
        description: "La columna se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al crear columna: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateColumnMutation = useMutation({
    mutationFn: updateColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-columns'] });
      toast({
        title: "Columna actualizada",
        description: "La columna se ha actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar columna: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteColumnMutation = useMutation({
    mutationFn: deleteColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-columns'] });
      toast({
        title: "Columna eliminada",
        description: "La columna se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar columna: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Crear columna por defecto al cargar
  const initializeDefaultColumn = useMutation({
    mutationFn: createDefaultColumn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-columns'] });
    },
  });

  return {
    columns: columnsQuery.data || [],
    isLoading: columnsQuery.isLoading,
    error: columnsQuery.error,
    createColumn: createColumnMutation,
    updateColumn: updateColumnMutation,
    deleteColumn: deleteColumnMutation,
    initializeDefaultColumn,
  };
};
