
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface Campaign {
  id: string;
  name: string;
  message: string;
  status: string;
  contact_list_id: string;
  user_id: string;
  ai_enabled: boolean;
  max_delay_seconds: number;
  created_at: string;
  updated_at: string;
  contact_lists?: {
    name: string;
  };
}

export const useCampaigns = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: campaigns, isLoading } = useQuery({
    queryKey: ['campaigns', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          contact_lists!inner(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!user
  });

  const createCampaign = useMutation({
    mutationFn: async (campaignData: Partial<Campaign>) => {
      if (!user) throw new Error('User not authenticated');
      
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          ...campaignData,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: "Campaña creada",
        description: "La campaña ha sido creada exitosamente.",
      });
    }
  });

  const updateCampaign = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Campaign> & { id: string }) => {
      const { data, error } = await supabase
        .from('campaigns')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: "Campaña actualizada",
        description: "La campaña ha sido actualizada exitosamente.",
      });
    }
  });

  const deleteCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', campaignId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: "Campaña eliminada",
        description: "La campaña ha sido eliminada exitosamente.",
      });
    }
  });

  return {
    campaigns,
    isLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign
  };
};
