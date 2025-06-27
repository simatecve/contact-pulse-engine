
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface ContactList {
  id: string;
  name: string;
  description: string | null;
  color: string;
  created_at: string;
  updated_at: string;
  contact_count?: number;
}

export const useContactLists = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: contactLists = [], isLoading } = useQuery({
    queryKey: ['contact-lists', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('contact_lists')
        .select(`
          *,
          contact_list_members(count)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(list => ({
        ...list,
        contact_count: list.contact_list_members?.[0]?.count || 0
      }));
    },
    enabled: !!user
  });

  const createList = useMutation({
    mutationFn: async (listData: { name: string; description?: string; color?: string }) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      const { data, error } = await supabase
        .from('contact_lists')
        .insert({
          ...listData,
          user_id: user.id,
          color: listData.color || '#3B82F6'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      toast({
        title: "Lista creada",
        description: "La lista de contactos se creó exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la lista.",
        variant: "destructive",
      });
    }
  });

  const updateList = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ContactList> & { id: string }) => {
      const { data, error } = await supabase
        .from('contact_lists')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      toast({
        title: "Lista actualizada",
        description: "Los cambios se guardaron exitosamente.",
      });
    }
  });

  const deleteList = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('contact_lists')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contact-lists'] });
      toast({
        title: "Lista eliminada",
        description: "La lista se eliminó exitosamente.",
      });
    }
  });

  return {
    contactLists,
    isLoading,
    createList,
    updateList,
    deleteList
  };
};
