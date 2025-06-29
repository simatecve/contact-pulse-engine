
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subDays, format, eachDayOfInterval } from 'date-fns';

export interface ChartDataPoint {
  date: string;
  conversations: number;
  leads: number;
  campaigns: number;
}

export interface LeadsStatusData {
  status: string;
  count: number;
  fill: string;
}

export const useDashboardCharts = (timeFilter: string = '30') => {
  const days = parseInt(timeFilter);
  const endDate = new Date();
  const startDate = subDays(endDate, days);

  return useQuery({
    queryKey: ['dashboard-charts', timeFilter],
    queryFn: async () => {
      // Generar todos los días del intervalo
      const dateRange = eachDayOfInterval({ start: startDate, end: endDate });
      
      // Obtener conversaciones por día
      const { data: conversations } = await supabase
        .from('conversations')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Obtener leads por día
      const { data: leads } = await supabase
        .from('leads')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Obtener campañas por día
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select('created_at')
        .gte('created_at', startDate.toISOString())
        .lte('created_at', endDate.toISOString());

      // Agrupar datos por fecha
      const chartData: ChartDataPoint[] = dateRange.map(date => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const displayDate = format(date, 'dd/MM');
        
        const dayConversations = conversations?.filter(c => 
          format(new Date(c.created_at), 'yyyy-MM-dd') === dateStr
        ).length || 0;

        const dayLeads = leads?.filter(l => 
          format(new Date(l.created_at), 'yyyy-MM-dd') === dateStr
        ).length || 0;

        const dayCampaigns = campaigns?.filter(c => 
          format(new Date(c.created_at), 'yyyy-MM-dd') === dateStr
        ).length || 0;

        return {
          date: displayDate,
          conversations: dayConversations,
          leads: dayLeads,
          campaigns: dayCampaigns
        };
      });

      // Obtener datos de leads por estado
      const { data: leadsStatus } = await supabase
        .from('leads')
        .select('status')
        .gte('created_at', startDate.toISOString());

      const statusCounts = leadsStatus?.reduce((acc, lead) => {
        acc[lead.status] = (acc[lead.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>) || {};

      const statusColors: Record<string, string> = {
        'new': '#3B82F6',
        'contacted': '#F59E0B',
        'qualified': '#10B981',
        'closed': '#6366F1',
        'lost': '#EF4444'
      };

      const leadsStatusData: LeadsStatusData[] = Object.entries(statusCounts).map(([status, count]) => ({
        status: status.charAt(0).toUpperCase() + status.slice(1),
        count,
        fill: statusColors[status] || '#6B7280'
      }));

      return {
        chartData,
        leadsStatusData
      };
    },
    refetchInterval: 60000, // Actualizar cada minuto
  });
};
