
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

export const useWebhooks = () => {
  const fetchWebhooks = async (): Promise<WebhookEndpoint[]> => {
    const { data, error } = await supabase
      .from('webhook_endpoints')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  };

  const webhooksQuery = useQuery({
    queryKey: ['webhooks'],
    queryFn: fetchWebhooks,
  });

  const getWebhookByName = (name: string): WebhookEndpoint | undefined => {
    return webhooksQuery.data?.find(webhook => webhook.name === name);
  };

  return {
    webhooks: webhooksQuery.data || [],
    isLoading: webhooksQuery.isLoading,
    error: webhooksQuery.error,
    getWebhookByName,
  };
};
