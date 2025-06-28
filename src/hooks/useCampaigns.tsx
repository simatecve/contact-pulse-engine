import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useWebhooks } from '@/hooks/useWebhooks';
import { toast } from '@/hooks/use-toast';

export interface Campaign {
  id: string;
  name: string;
  message: string;
  contact_list_id: string;
  max_delay_seconds: number | null;
  ai_enabled: boolean | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
  contact_lists?: {
    name: string;
    contact_count?: number;
  };
  campaign_messages?: Array<{
    id: string;
    status: string | null;
  }>;
  campaign_attachments?: Array<{
    id: string;
    file_name: string;
    file_path: string;
    file_size: number | null;
    mime_type: string | null;
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
  const { getWebhookByName } = useWebhooks();

  const { data: campaigns = [], isLoading } = useQuery({
    queryKey: ['campaigns', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          contact_lists!inner(
            name,
            contact_list_members(count)
          ),
          campaign_messages(id, status),
          campaign_attachments(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      return data.map(campaign => ({
        ...campaign,
        contact_lists: {
          ...campaign.contact_lists,
          contact_count: campaign.contact_lists.contact_list_members?.[0]?.count || 0
        }
      }));
    },
    enabled: !!user
  });

  const createCampaign = useMutation({
    mutationFn: async (campaignData: CampaignFormData) => {
      if (!user) throw new Error('Usuario no autenticado');
      
      const { data: campaign, error } = await supabase
        .from('campaigns')
        .insert({
          name: campaignData.name,
          message: campaignData.message,
          contact_list_id: campaignData.contact_list_id,
          max_delay_seconds: campaignData.max_delay_seconds,
          ai_enabled: campaignData.ai_enabled,
          user_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      // Handle file attachments if any
      if (campaignData.attachments && campaignData.attachments.length > 0) {
        for (const file of campaignData.attachments) {
          const fileName = `${Date.now()}-${file.name}`;
          const filePath = `${user.id}/${campaign.id}/${fileName}`;
          
          const { error: uploadError } = await supabase.storage
            .from('campaign-attachments')
            .upload(filePath, file);

          if (uploadError) throw uploadError;

          const { error: attachmentError } = await supabase
            .from('campaign_attachments')
            .insert({
              campaign_id: campaign.id,
              file_name: file.name,
              file_path: filePath,
              file_size: file.size,
              mime_type: file.type
            });

          if (attachmentError) throw attachmentError;
        }
      }

      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: "Campaña creada",
        description: "La campaña se creó exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la campaña.",
        variant: "destructive",
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
        description: "Los cambios se guardaron exitosamente.",
      });
    }
  });

  const deleteCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campaigns')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: "Campaña eliminada",
        description: "La campaña se eliminó exitosamente.",
      });
    }
  });

  const startCampaign = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: "Campaña iniciada",
        description: "La campaña está ahora activa.",
      });
    }
  });

  const sendCampaign = useMutation({
    mutationFn: async (campaignId: string) => {
      // Get campaign data with all related information
      const { data: campaignData, error } = await supabase
        .from('campaigns')
        .select(`
          *,
          contact_lists!inner(
            id,
            name,
            contact_list_members(
              contacts(*)
            )
          ),
          campaign_attachments(*)
        `)
        .eq('id', campaignId)
        .single();

      if (error) throw error;

      // Get the webhook URL
      const webhook = getWebhookByName('enviar-masivo');
      if (!webhook) {
        throw new Error('Webhook no encontrado');
      }

      // Prepare campaign data for webhook
      const webhookData = {
        campaign: {
          id: campaignData.id,
          name: campaignData.name,
          message: campaignData.message,
          max_delay_seconds: campaignData.max_delay_seconds,
          ai_enabled: campaignData.ai_enabled,
          status: campaignData.status,
          created_at: campaignData.created_at,
          updated_at: campaignData.updated_at
        },
        contact_list: {
          id: campaignData.contact_lists.id,
          name: campaignData.contact_lists.name,
          contacts: campaignData.contact_lists.contact_list_members.map((member: any) => member.contacts)
        },
        attachments: campaignData.campaign_attachments || [],
        user_id: user?.id
      };

      // Send to webhook
      const response = await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData),
      });

      if (!response.ok) {
        throw new Error(`Error en webhook: ${response.statusText}`);
      }

      // Update campaign status to active
      const { error: updateError } = await supabase
        .from('campaigns')
        .update({ status: 'active' })
        .eq('id', campaignId);

      if (updateError) throw updateError;

      return campaignData;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      toast({
        title: "Campaña enviada",
        description: "La campaña se está enviando exitosamente.",
      });
    },
    onError: (error) => {
      console.error('Error sending campaign:', error);
      toast({
        title: "Error",
        description: `No se pudo enviar la campaña: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  return {
    campaigns,
    isLoading,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    startCampaign,
    sendCampaign
  };
};
