
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface WebhookEndpoint {
  id: string;
  name: string;
  url: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export const useWebhookUrls = () => {
  const { data: webhooks = [], isLoading, error } = useQuery({
    queryKey: ['webhook-endpoints'],
    queryFn: async () => {
      console.log('Fetching webhook endpoints from database...');
      
      const { data, error } = await supabase
        .from('webhook_endpoints')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching webhook endpoints:', error);
        throw error;
      }
      
      console.log('Webhook endpoints fetched:', data);
      return data as WebhookEndpoint[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const getWebhookUrl = (endpointName: string): string | null => {
    const webhook = webhooks.find(w => w.name === endpointName);
    if (webhook) {
      console.log(`Found webhook URL for ${endpointName}:`, webhook.url);
      return webhook.url;
    }
    console.warn(`Webhook URL not found for endpoint: ${endpointName}`);
    return null;
  };

  return {
    webhooks,
    isLoading,
    error,
    getWebhookUrl,
  };
};
