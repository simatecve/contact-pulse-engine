
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export interface ABTest {
  id: string;
  campaign_id: string;
  name: string;
  status: 'draft' | 'running' | 'completed' | 'paused';
  test_percentage: number;
  winner_variant?: string;
  confidence_level?: number;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

export interface CampaignVariant {
  id: string;
  ab_test_id: string;
  variant_name: string;
  message: string;
  subject_line?: string;
  attachments?: any;
  created_at: string;
}

export interface ABTestFormData {
  campaign_id: string;
  name: string;
  test_percentage: number;
  variant_a: Omit<CampaignVariant, 'id' | 'ab_test_id' | 'created_at'>;
  variant_b: Omit<CampaignVariant, 'id' | 'ab_test_id' | 'created_at'>;
}

export const useABTesting = (campaignId?: string) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch AB tests for campaign
  const { data: abTests = [], isLoading } = useQuery({
    queryKey: ['ab-tests', campaignId, user?.id],
    queryFn: async () => {
      if (!user || !campaignId) return [];
      
      const { data, error } = await supabase
        .from('campaign_ab_tests')
        .select(`
          *,
          campaigns!inner(user_id),
          campaign_variants(*)
        `)
        .eq('campaign_id', campaignId)
        .eq('campaigns.user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as (ABTest & { campaign_variants: CampaignVariant[] })[];
    },
    enabled: !!user && !!campaignId
  });

  // Create AB test
  const createABTest = useMutation({
    mutationFn: async (formData: ABTestFormData) => {
      // Create AB test
      const { data: abTest, error: abTestError } = await supabase
        .from('campaign_ab_tests')
        .insert({
          campaign_id: formData.campaign_id,
          name: formData.name,
          test_percentage: formData.test_percentage
        })
        .select()
        .single();

      if (abTestError) throw abTestError;

      // Create variants
      const variants = [
        { ...formData.variant_a, ab_test_id: abTest.id, variant_name: 'A' },
        { ...formData.variant_b, ab_test_id: abTest.id, variant_name: 'B' }
      ];

      const { error: variantsError } = await supabase
        .from('campaign_variants')
        .insert(variants);

      if (variantsError) throw variantsError;

      return abTest;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      toast({
        title: "Prueba A/B creada",
        description: "La prueba A/B ha sido creada exitosamente.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "No se pudo crear la prueba A/B.",
        variant: "destructive",
      });
    }
  });

  // Start AB test
  const startABTest = useMutation({
    mutationFn: async (abTestId: string) => {
      const { error } = await supabase
        .from('campaign_ab_tests')
        .update({ 
          status: 'running',
          start_date: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', abTestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      toast({
        title: "Prueba A/B iniciada",
        description: "La prueba A/B ha sido iniciada exitosamente.",
      });
    }
  });

  // Pause AB test
  const pauseABTest = useMutation({
    mutationFn: async (abTestId: string) => {
      const { error } = await supabase
        .from('campaign_ab_tests')
        .update({ 
          status: 'paused',
          updated_at: new Date().toISOString()
        })
        .eq('id', abTestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      toast({
        title: "Prueba A/B pausada",
        description: "La prueba A/B ha sido pausada.",
      });
    }
  });

  // Complete AB test
  const completeABTest = useMutation({
    mutationFn: async ({ abTestId, winnerVariant, confidenceLevel }: { 
      abTestId: string; 
      winnerVariant: string; 
      confidenceLevel: number;
    }) => {
      const { error } = await supabase
        .from('campaign_ab_tests')
        .update({ 
          status: 'completed',
          end_date: new Date().toISOString(),
          winner_variant: winnerVariant,
          confidence_level: confidenceLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', abTestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      toast({
        title: "Prueba A/B completada",
        description: "La prueba A/B ha sido completada y se ha determinado el ganador.",
      });
    }
  });

  // Delete AB test
  const deleteABTest = useMutation({
    mutationFn: async (abTestId: string) => {
      const { error } = await supabase
        .from('campaign_ab_tests')
        .delete()
        .eq('id', abTestId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ab-tests'] });
      toast({
        title: "Prueba A/B eliminada",
        description: "La prueba A/B ha sido eliminada.",
      });
    }
  });

  return {
    abTests,
    isLoading,
    createABTest,
    startABTest,
    pauseABTest,
    completeABTest,
    deleteABTest
  };
};
