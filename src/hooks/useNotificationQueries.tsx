
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Notification, NotificationPreferences, NotificationSound } from '@/types/notifications';

export const useNotificationQueries = () => {
  const { user } = useAuth();

  // Fetch notifications with error handling
  const { data: notifications = [], isLoading, error } = useQuery({
    queryKey: ['notifications', user?.id],
    queryFn: async () => {
      if (!user) return [];
      
      try {
        const { data, error } = await supabase
          .from('notifications')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          return [];
        }
        
        return data as Notification[];
      } catch (err) {
        console.error('Unexpected error fetching notifications:', err);
        return [];
      }
    },
    enabled: !!user,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Fetch notification preferences with error handling
  const { data: preferences } = useQuery({
    queryKey: ['notification-preferences', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      try {
        const { data, error } = await supabase
          .from('notification_preferences')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching preferences:', error);
          return null;
        }
        
        return data as NotificationPreferences;
      } catch (err) {
        console.error('Unexpected error fetching preferences:', err);
        return null;
      }
    },
    enabled: !!user,
    retry: 1,
    refetchOnWindowFocus: false
  });

  // Fetch notification sounds with error handling
  const { data: sounds = [] } = useQuery({
    queryKey: ['notification-sounds'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('notification_sounds')
          .select('*')
          .order('name');

        if (error) {
          console.error('Error fetching sounds:', error);
          return [];
        }
        
        return data as NotificationSound[];
      } catch (err) {
        console.error('Unexpected error fetching sounds:', err);
        return [];
      }
    },
    retry: 1,
    refetchOnWindowFocus: false
  });

  return {
    notifications,
    preferences,
    sounds,
    isLoading,
    error
  };
};
