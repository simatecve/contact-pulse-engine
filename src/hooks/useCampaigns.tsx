
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
    contact_count?: number;
  };
  campaign_messages?: Array<{
    id: string;
    status: string;
    sent_at: string;
    contact_id: string;
  }>;
  campaign_attachments?: Array<{
    id: string;
    file_name: string;
    file_path: string;
  }>;
}

export interface CampaignFormData {
  name: string;
  message: string;
  contact_list_id: string;
  max_delay_seconds: number;
  ai_enabled: boolean;
  attachments?: File[];
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
          contact_lists!inner(name),
          campaign_messages(id, status, sent_at, contact_id),
          campaign_attachments(id, file_name, file_path)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Campaign[];
    },
    enabled: !!user
  });

  const createCampaign = useMutation({
    mutationFn: async (campaignData: CampaignFormData) => {
      if (!user) throw new Error('User not authenticated');
      
      const { attachments, ...campaignInfo } = campaignData;
      
      const { data, error } = await supabase
        .from('campaigns')
        .insert({
          ...campaignInfo,
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
    campaigns: campaigns || [],
    isLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign
  };
};
