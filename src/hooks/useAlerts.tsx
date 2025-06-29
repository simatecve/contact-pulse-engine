
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { subHours, subDays } from 'date-fns';
import { useToast } from '@/hooks/use-toast';
import { useEffect, useRef } from 'react';

export interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  count?: number;
}

export const useAlerts = () => {
  const { toast } = useToast();
  const previousAlertsRef = useRef<Alert[]>([]);

  const { data: alerts = [], isLoading } = useQuery({
    queryKey: ['dashboard-alerts'],
    queryFn: async (): Promise<Alert[]> => {
      const now = new Date();
      const twoHoursAgo = subHours(now, 2);
      const twoDaysAgo = subDays(now, 2);
      const alerts: Alert[] = [];

      // 1. Conversaciones sin respuesta por más de 2 horas
      const { data: unresponded } = await supabase
        .from('conversations')
        .select('id, last_message_at, contact_name')
        .eq('status', 'active')
        .lt('last_message_at', twoHoursAgo.toISOString());

      if (unresponded && unresponded.length > 0) {
        alerts.push({
          id: 'unresponded-conversations',
          type: 'warning',
          title: 'Conversaciones sin respuesta',
          message: `${unresponded.length} conversaciones llevan más de 2 horas sin respuesta`,
          count: unresponded.length
        });
      }

      // 2. Leads de alto valor sin seguimiento
      const { data: highValueLeads } = await supabase
        .from('leads')
        .select('id, name, value')
        .eq('status', 'new')
        .gte('value', 1000)
        .lt('created_at', twoDaysAgo.toISOString());

      if (highValueLeads && highValueLeads.length > 0) {
        alerts.push({
          id: 'high-value-leads',
          type: 'danger',
          title: 'Leads de alto valor sin seguimiento',
          message: `${highValueLeads.length} leads de alto valor llevan más de 2 días sin contactar`,
          count: highValueLeads.length
        });
      }

      // 3. Campañas con baja tasa de entrega (simulado)
      const { data: campaigns } = await supabase
        .from('campaigns')
        .select(`
          id, name, status,
          campaign_messages(id, status)
        `)
        .eq('status', 'active');

      if (campaigns) {
        const lowDeliveryRateCampaigns = campaigns.filter(campaign => {
          const totalMessages = campaign.campaign_messages?.length || 0;
          const sentMessages = campaign.campaign_messages?.filter(m => m.status === 'sent').length || 0;
          const deliveryRate = totalMessages > 0 ? (sentMessages / totalMessages) * 100 : 100;
          return totalMessages > 10 && deliveryRate < 80;
        });

        if (lowDeliveryRateCampaigns.length > 0) {
          alerts.push({
            id: 'low-delivery-campaigns',
            type: 'warning',
            title: 'Campañas con baja entrega',
            message: `${lowDeliveryRateCampaigns.length} campañas tienen menos del 80% de entrega`,
            count: lowDeliveryRateCampaigns.length
          });
        }
      }

      return alerts;
    },
    refetchInterval: 120000, // Verificar cada 2 minutos
  });

  // Mostrar notificaciones para nuevas alertas
  useEffect(() => {
    if (alerts.length > 0) {
      const newAlerts = alerts.filter(alert => 
        !previousAlertsRef.current.some(prev => prev.id === alert.id)
      );

      newAlerts.forEach(alert => {
        toast({
          title: alert.title,
          description: alert.message,
          variant: alert.type === 'danger' ? 'destructive' : 'default',
        });
      });

      previousAlertsRef.current = alerts;
    }
  }, [alerts, toast]);

  return { alerts, isLoading };
};
