
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { toast } from './use-toast';

export interface LeadTag {
  id: string;
  user_id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface LeadTagFormData {
  name: string;
  color: string;
}

export const useLeadTags = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const fetchTags = async (): Promise<LeadTag[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('lead_tags')
      .select('*')
      .eq('user_id', user.id)
      .order('name', { ascending: true });

    if (error) throw error;
    return data || [];
  };

  const fetchLeadTags = async (leadId: string): Promise<LeadTag[]> => {
    if (!user) return [];
    
    const { data, error } = await supabase
      .from('lead_tag_assignments')
      .select(`
        lead_tags (
          id,
          name,
          color,
          created_at,
          user_id
        )
      `)
      .eq('lead_id', leadId);

    if (error) throw error;
    return data?.map(item => item.lead_tags).filter(Boolean) || [];
  };

  const createTag = async (tagData: LeadTagFormData): Promise<LeadTag> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('lead_tags')
      .insert({
        ...tagData,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const updateTag = async ({ id, ...updateData }: Partial<LeadTag> & { id: string }): Promise<LeadTag> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { data, error } = await supabase
      .from('lead_tags')
      .update(updateData)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;
    return data;
  };

  const deleteTag = async (id: string): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    const { error } = await supabase
      .from('lead_tags')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
  };

  const assignTagsToLead = async (leadId: string, tagIds: string[]): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    // Primero eliminar todas las asignaciones existentes
    await supabase
      .from('lead_tag_assignments')
      .delete()
      .eq('lead_id', leadId);

    // Luego insertar las nuevas asignaciones
    if (tagIds.length > 0) {
      const assignments = tagIds.map(tagId => ({
        lead_id: leadId,
        tag_id: tagId,
      }));

      const { error } = await supabase
        .from('lead_tag_assignments')
        .insert(assignments);

      if (error) throw error;
    }
  };

  const tagsQuery = useQuery({
    queryKey: ['lead-tags', user?.id],
    queryFn: fetchTags,
    enabled: !!user,
  });

  const createTagMutation = useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tags'] });
      toast({
        title: "Etiqueta creada",
        description: "La etiqueta se ha creado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al crear etiqueta: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateTagMutation = useMutation({
    mutationFn: updateTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tags'] });
      toast({
        title: "Etiqueta actualizada",
        description: "La etiqueta se ha actualizado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al actualizar etiqueta: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const deleteTagMutation = useMutation({
    mutationFn: deleteTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-tags'] });
      toast({
        title: "Etiqueta eliminada",
        description: "La etiqueta se ha eliminado exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al eliminar etiqueta: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const assignTagsMutation = useMutation({
    mutationFn: ({ leadId, tagIds }: { leadId: string; tagIds: string[] }) => 
      assignTagsToLead(leadId, tagIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['leads'] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Error al asignar etiquetas: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  return {
    tags: tagsQuery.data || [],
    isLoading: tagsQuery.isLoading,
    error: tagsQuery.error,
    createTag: createTagMutation,
    updateTag: updateTagMutation,
    deleteTag: deleteTagMutation,
    assignTags: assignTagsMutation,
    fetchLeadTags,
  };
};
