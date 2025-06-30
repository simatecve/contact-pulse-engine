
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface CampaignSchedule {
  id: string;
  campaign_id: string;
  scheduled_at: string;
  timezone: string;
  status: 'scheduled' | 'sent' | 'cancelled' | 'failed';
  sent_at?: string;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface ScheduleFormData {
  campaign_id: string;
  scheduled_at: string;
  timezone: string;
}

export const useCampaignScheduling = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch scheduled campaigns
  const { data: schedules = [], isLoading } = useQuery({
    queryKey: ['campaign-schedules', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('campaign_schedules')
        .select(`
          *,
          campaigns!inner(
            id,
            name,
            user_id
          )
        `)
        .eq('campaigns.user_id', user.id)
        .order('scheduled_at', { ascending: true });

      if (error) throw error;
      return data as CampaignSchedule[];
    },
    enabled: !!user
  });

  // Schedule campaign
  const scheduleCampaign = useMutation({
    mutationFn: async (scheduleData: ScheduleFormData) => {
      const { data, error } = await supabase
        .from('campaign_schedules')
        .insert(scheduleData)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-schedules'] });
      toast({
        title: "Campaña programada",
        description: "La campaña ha sido programada exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo programar la campaña.",
        variant: "destructive",
      });
    }
  });

  // Cancel scheduled campaign
  const cancelSchedule = useMutation({
    mutationFn: async (scheduleId: string) => {
      const { error } = await supabase
        .from('campaign_schedules')
        .update({ 
          status: 'cancelled',
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-schedules'] });
      toast({
        title: "Programación cancelada",
        description: "La programación de la campaña ha sido cancelada.",
      });
    }
  });

  // Reschedule campaign
  const reschedule = useMutation({
    mutationFn: async ({ scheduleId, newDateTime }: { scheduleId: string; newDateTime: string }) => {
      const { error } = await supabase
        .from('campaign_schedules')
        .update({ 
          scheduled_at: newDateTime,
          status: 'scheduled',
          updated_at: new Date().toISOString()
        })
        .eq('id', scheduleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-schedules'] });
      toast({
        title: "Campaña reprogramada",
        description: "La campaña ha sido reprogramada exitosamente.",
      });
    }
  });

  return {
    schedules,
    isLoading,
    scheduleCampaign,
    cancelSchedule,
    reschedule
  };
};
