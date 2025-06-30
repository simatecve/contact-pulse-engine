
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export interface CampaignAnalytics {
  id: string;
  campaign_id: string;
  contact_id?: string;
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'converted';
  event_timestamp: string;
  metadata?: any;
  variant_id?: string;
  created_at: string;
}

export interface CampaignMetrics {
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  replied: number;
  converted: number;
  delivery_rate: number;
  open_rate: number;
  click_rate: number;
  reply_rate: number;
  conversion_rate: number;
}

export interface AnalyticsTimeRange {
  start_date: string;
  end_date: string;
}

export const useCampaignAnalytics = (campaignId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch campaign analytics
  const { data: analytics = [], isLoading } = useQuery({
    queryKey: ['campaign-analytics', campaignId, user?.id],
    queryFn: async () => {
      if (!user || !campaignId) return [];
      
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select(`
          *,
          campaigns!inner(user_id)
        `)
        .eq('campaign_id', campaignId)
        .eq('campaigns.user_id', user.id)
        .order('event_timestamp', { ascending: false });

      if (error) throw error;
      return data as CampaignAnalytics[];
    },
    enabled: !!user && !!campaignId
  });

  // Calculate metrics
  const calculateMetrics = (analyticsData: CampaignAnalytics[]): CampaignMetrics => {
    const counts = {
      sent: analyticsData.filter(a => a.event_type === 'sent').length,
      delivered: analyticsData.filter(a => a.event_type === 'delivered').length,
      opened: analyticsData.filter(a => a.event_type === 'opened').length,
      clicked: analyticsData.filter(a => a.event_type === 'clicked').length,
      replied: analyticsData.filter(a => a.event_type === 'replied').length,
      converted: analyticsData.filter(a => a.event_type === 'converted').length,
    };

    return {
      ...counts,
      delivery_rate: counts.sent > 0 ? (counts.delivered / counts.sent) * 100 : 0,
      open_rate: counts.delivered > 0 ? (counts.opened / counts.delivered) * 100 : 0,
      click_rate: counts.opened > 0 ? (counts.clicked / counts.opened) * 100 : 0,
      reply_rate: counts.delivered > 0 ? (counts.replied / counts.delivered) * 100 : 0,
      conversion_rate: counts.delivered > 0 ? (counts.converted / counts.delivered) * 100 : 0,
    };
  };

  // Get metrics for campaign
  const metrics = calculateMetrics(analytics);

  // Track event
  const trackEvent = useMutation({
    mutationFn: async (eventData: Omit<CampaignAnalytics, 'id' | 'created_at'>) => {
      const { error } = await supabase
        .from('campaign_analytics')
        .insert(eventData);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign-analytics'] });
    }
  });

  // Get analytics for date range
  const { data: timeRangeAnalytics } = useQuery({
    queryKey: ['campaign-analytics-range', campaignId, user?.id],
    queryFn: async () => {
      if (!user || !campaignId) return [];
      
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data, error } = await supabase
        .from('campaign_analytics')
        .select(`
          *,
          campaigns!inner(user_id)
        `)
        .eq('campaign_id', campaignId)
        .eq('campaigns.user_id', user.id)
        .gte('event_timestamp', thirtyDaysAgo.toISOString())
        .order('event_timestamp', { ascending: true });

      if (error) throw error;
      return data as CampaignAnalytics[];
    },
    enabled: !!user && !!campaignId
  });

  // Get analytics summary for all campaigns
  const { data: campaignsSummary = [] } = useQuery({
    queryKey: ['campaigns-analytics-summary', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from('campaigns')
        .select(`
          id,
          name,
          created_at,
          campaign_analytics(
            event_type,
            event_timestamp
          )
        `)
        .eq('user_id', user.id);

      if (error) throw error;
      
      return data.map(campaign => ({
        ...campaign,
        metrics: calculateMetrics(campaign.campaign_analytics as CampaignAnalytics[] || [])
      }));
    },
    enabled: !!user
  });

  return {
    analytics,
    metrics,
    timeRangeAnalytics,
    campaignsSummary,
    isLoading,
    trackEvent,
    calculateMetrics
  };
};
