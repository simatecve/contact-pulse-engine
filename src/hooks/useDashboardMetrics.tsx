
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format } from 'date-fns';

export interface DashboardMetrics {
  totalConversations: number;
  newLeads: number;
  campaignsSent: number;
  conversionRate: number;
  conversationsChange: number;
  leadsChange: number;
  campaignsChange: number;
  conversionChange: number;
}

export interface TimeFilter {
  value: string;
  label: string;
  days: number;
}

export const timeFilters: TimeFilter[] = [
  { value: '1', label: 'Últimas 24 horas', days: 1 },
  { value: '7', label: 'Últimos 7 días', days: 7 },
  { value: '30', label: 'Últimos 30 días', days: 30 },
  { value: '90', label: 'Últimos 3 meses', days: 90 }
];

export const useDashboardMetrics = (timeFilter: string = '30') => {
  const days = timeFilters.find(f => f.value === timeFilter)?.days || 30;
  const currentPeriodStart = subDays(new Date(), days);
  const previousPeriodStart = subDays(new Date(), days * 2);
  const previousPeriodEnd = subDays(new Date(), days);

  return useQuery({
    queryKey: ['dashboard-metrics', timeFilter],
    queryFn: async (): Promise<DashboardMetrics> => {
      // Conversaciones del período actual
      const { data: currentConversations } = await supabase
        .from('conversations')
        .select('id')
        .gte('created_at', currentPeriodStart.toISOString());

      // Conversaciones del período anterior
      const { data: previousConversations } = await supabase
        .from('conversations')
        .select('id')
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', previousPeriodEnd.toISOString());

      // Leads del período actual
      const { data: currentLeads } = await supabase
        .from('leads')
        .select('id')
        .gte('created_at', currentPeriodStart.toISOString());

      // Leads del período anterior
      const { data: previousLeads } = await supabase
        .from('leads')
        .select('id')
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', previousPeriodEnd.toISOString());

      // Campañas enviadas del período actual
      const { data: currentCampaigns } = await supabase
        .from('campaigns')
        .select('id')
        .in('status', ['sent', 'completed'])
        .gte('created_at', currentPeriodStart.toISOString());

      // Campañas enviadas del período anterior
      const { data: previousCampaigns } = await supabase
        .from('campaigns')
        .select('id')
        .in('status', ['sent', 'completed'])
        .gte('created_at', previousPeriodStart.toISOString())
        .lt('created_at', previousPeriodEnd.toISOString());

      // Leads convertidos (asumiendo que los leads con status 'closed' están convertidos)
      const { data: convertedLeads } = await supabase
        .from('leads')
        .select('id')
        .eq('status', 'closed')
        .gte('created_at', currentPeriodStart.toISOString());

      const totalConversations = currentConversations?.length || 0;
      const newLeads = currentLeads?.length || 0;
      const campaignsSent = currentCampaigns?.length || 0;
      const converted = convertedLeads?.length || 0;
      const conversionRate = newLeads > 0 ? (converted / newLeads) * 100 : 0;

      // Cálculos de cambios porcentuales
      const prevConversations = previousConversations?.length || 0;
      const prevLeads = previousLeads?.length || 0;
      const prevCampaigns = previousCampaigns?.length || 0;

      const conversationsChange = prevConversations > 0 
        ? ((totalConversations - prevConversations) / prevConversations) * 100 
        : totalConversations > 0 ? 100 : 0;

      const leadsChange = prevLeads > 0 
        ? ((newLeads - prevLeads) / prevLeads) * 100 
        : newLeads > 0 ? 100 : 0;

      const campaignsChange = prevCampaigns > 0 
        ? ((campaignsSent - prevCampaigns) / prevCampaigns) * 100 
        : campaignsSent > 0 ? 100 : 0;

      const conversionChange = 0; // Para simplificar, lo mantenemos en 0

      return {
        totalConversations,
        newLeads,
        campaignsSent,
        conversionRate: Math.round(conversionRate * 10) / 10,
        conversationsChange: Math.round(conversationsChange),
        leadsChange: Math.round(leadsChange),
        campaignsChange: Math.round(campaignsChange),
        conversionChange
      };
    },
    refetchInterval: 30000, // Actualizar cada 30 segundos
  });
};
