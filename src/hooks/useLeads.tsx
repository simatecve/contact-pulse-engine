
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export interface Lead {
  id: string;
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  status?: string;
  priority?: string;
  value?: number;
  source?: string;
  notes?: string;
  assigned_to?: string;
  column_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LeadFormData {
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  priority?: string;
  value?: number;
  source?: string;
  notes?: string;
  column_id?: string;
  tagIds?: string[];
}

export const useLeads = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchLeads = async (): Promise<Lead[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const createLead = async (leadData: LeadFormData): Promise<Lead> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('leads')
      .insert({
        ...leadData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;

    // Asignar etiquetas si se proporcionaron
    if (leadData.tagIds && leadData.tagIds.length > 0) {
      const tagAssignments = leadData.tagIds.map(tagId => ({
        lead_id: data.id,
        tag_id: tagId,
      }));

      await supabase
        .from('lead_tag_assignments')
        .insert(tagAssignments);
    }

    return data;
  };

  const updateLead = async ({ id, ...updateData }: Partial<Lead> & { id: string }): Promise<Lead> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('leads')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateLeadColumn = async (leadId: string, columnId: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('leads')
      .update({ column_id: columnId })
      .eq('id', leadId)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const deleteLead = async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const leadsQuery = useQuery({
    queryKey: ['leads', user?.id],
    queryFn: fetchLeads,
    enabled: !!user,
  });

  const createLeadMutation = useMutation({
    mutationFn: createLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead creado",
        description: "El lead se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al crear lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateLeadMutation = useMutation({
    mutationFn: updateLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead actualizado",
        description: "El lead se ha actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateLeadColumnMutation = useMutation({
    mutationFn: ({ leadId, columnId }: { leadId: string; columnId: string }) => 
      updateLeadColumn(leadId, columnId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al mover lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteLeadMutation = useMutation({
    mutationFn: deleteLead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
      toast({
        title: "Lead eliminado",
        description: "El lead se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar lead: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    leads: leadsQuery.data || [],
    isLoading: leadsQuery.isLoading,
    error: leadsQuery.error,
    createLead: createLeadMutation,
    updateLead: updateLeadMutation,
    updateLeadColumn: updateLeadColumnMutation,
    deleteLead: deleteLeadMutation,
  };
};
